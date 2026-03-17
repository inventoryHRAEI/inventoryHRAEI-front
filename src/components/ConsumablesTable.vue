<template>
    <div class="consumables-table-wrapper">

        <!-- Controls Bar -->
        <div class="table-controls">
            <div class="controls-left">
                <!-- Filtro de Caducidad -->
                <div class="expiration-filter" style="display: flex; align-items: center; gap: 8px; margin-right: 16px;">
                    <label style="font-size: 0.85rem; color: #94a3b8; white-space: nowrap;">Caducidad:</label>
                    <select v-model="expirationFilter" class="expiration-select">
                        <option value="all">Todos</option>
                        <option value="expired">
                            Expirados <span v-if="expirationCounts.expired > 0" class="badge badge-expired">({{ expirationCounts.expired }})</span>
                        </option>
                        <option value="critical">
                            &lt; 30 días <span v-if="expirationCounts.critical > 0" class="badge badge-critical">({{ expirationCounts.critical }})</span>
                        </option>
                        <option value="warning">
                            30-90 días <span v-if="expirationCounts.warning > 0" class="badge badge-warning">({{ expirationCounts.warning }})</span>
                        </option>
                        <option value="ok">
                            &gt; 90 días <span v-if="expirationCounts.ok > 0" class="badge badge-ok">({{ expirationCounts.ok }})</span>
                        </option>
                    </select>
                </div>
                <div class="items-per-page-selector">
                    <label for="itemsPerPageSelect">Filas por página:</label>
                    <select id="itemsPerPageSelect" v-model.number="localItemsPerPage" @change="updateItemsPerPage">
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <div class="export-menu-wrapper" style="position: relative; margin-left: 12px;">
                    <button @click="showExportMenu = !showExportMenu" class="export-btn" title="Exportar">
                        <IIcon name="ic:baseline-download" size="18" />
                        <span>Exportar</span>
                        <IIcon name="ic:baseline-arrow-drop-down" size="16" />
                    </button>
                    <Transition name="dropdown-slide">
                        <div v-if="showExportMenu" class="export-dropdown">
                            <!-- Opción de seleccionados -->
                            <div v-if="selectedRows.length > 0" class="export-section">
                                <button @click="exportSelectedToExcel(); showExportMenu = false" class="export-option highlight">
                                    <IIcon name="ic:baseline-check-circle" size="16" />
                                    <span>Excel ({{ selectedRows.length }} seleccionados)</span>
                                </button>
                                <div class="export-divider"></div>
                            </div>
                            <!-- Opciones normales -->
                            <div class="export-section">
                                <label class="export-radio">
                                    <input type="radio" v-model="exportAllData" :value="true" />
                                    <span>Toda la información ({{ props.items.length }})</span>
                                </label>
                                <label class="export-radio">
                                    <input type="radio" v-model="exportAllData" :value="false" />
                                    <span>Cantidad específica</span>
                                </label>
                                <div v-if="!exportAllData" class="export-limit-input">
                                    <input type="number" v-model.number="exportLimit" min="1" :max="props.items.length" class="limit-input" />
                                    <span>artículos</span>
                                </div>
                            </div>
                            <button @click="exportToExcel(); showExportMenu = false" class="export-option">
                                <IIcon name="ic:baseline-table-chart" size="16" />
                                <span>Descargar Excel</span>
                            </button>
                        </div>
                    </Transition>
                </div>
            </div>
            <div class="controls-right">
                <span class="total-info">Total: {{ props.items.length }} artículos</span>
                <span v-if="hasActiveFilters" class="filter-badge">{{ activeFilterCount }} filtros activos</span>
            </div>
        </div>

        <div class="table-scroll-container" ref="tableScrollRef">
            <!-- Context Menu -->
            <Teleport to="body">
                <Transition name="context-menu">
                    <div v-if="contextMenuIdx !== null && contextMenuItem" class="context-menu consumables-context"
                        :style="contextMenuStyle" @click.stop>
                        <div class="context-menu-header">
                            <span class="context-name">{{ contextMenuItem['DESCRIPCIÓN ARTÍCULO'] ||
                                contextMenuItem['NOMBRE'] || 'Insumo' }}</span>
                            <span class="context-clave">{{ contextMenuItem['Clave HRAEI'] }}</span>
                        </div>
                        <div class="context-menu-body">
                            <button v-if="canEditBiomedicalEquipment" @click="handleEditItem(contextMenuItem)" class="context-item edit">
                                <IIcon name="ic:baseline-edit" size="16" color="#60a5fa" />
                                <span>Editar información</span>
                            </button>
                            <button @click="handleViewKardex(contextMenuItem)" class="context-item kardex">
                                <IIcon name="ic:baseline-history" size="16" color="#06b6d4" />
                                <span>Consultar Kardex</span>
                            </button>
                            <div v-if="canManageBiomedical" class="context-divider"></div>
                            <button v-if="canManageBiomedical" @click="handleMoveStock(contextMenuItem)" class="context-item move">
                                <IIcon name="ic:baseline-swap-horiz" size="16" color="#22c55e" />
                                <span>Mover Stock</span>
                            </button>
                            <button v-if="canManageBiomedical" @click="handleAddIntake(contextMenuItem)" class="context-item intake">
                                <IIcon name="ic:baseline-add-circle-outline" size="16" color="#a855f7" />
                                <span>Ingresar Bienes</span>
                            </button>
                            <button v-if="canManageBiomedical" @click="handleDecommission(contextMenuItem)" class="context-item decommission">
                                <IIcon name="ic:baseline-delete-forever" size="16" color="#ef4444" />
                                <span>Dar de Baja</span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <!-- Dropdown de filtro por columna — Teleport para escapar del overflow del scroll container -->
            <Teleport to="body">
                <Transition name="col-filter-drop">
                    <div
                        v-if="activeColumnFilter"
                        class="cfd-panel"
                        :style="dropdownStyle"
                        @click.stop
                    >
                        <div class="cfd-header">
                            <span>{{ activeColumnFilter }}</span>
                            <button @click="activeColumnFilter = null" class="cfd-close">✕</button>
                        </div>
                        <div class="cfd-search">
                            <IIcon name="ic:baseline-search" size="13" />
                            <input
                                v-model="columnFilterSearch[activeColumnFilter]"
                                placeholder="Buscar..."
                                class="cfd-search-input"
                                @keydown.stop
                            />
                        </div>
                        <div class="cfd-actions">
                                    <div v-if="uniqueValuesLoading[activeColumnFilter]" class="cfd-loading">Cargando opciones…</div>
                            <button type="button" @click.stop.prevent="selectAllFilterValues(activeColumnFilter)" class="cfd-action-btn">✓ Todos</button>
                            <button type="button" @click.stop.prevent="clearColumnFilter(activeColumnFilter)" class="cfd-action-btn">✕ Ninguno</button>
                        </div>
                        <div class="cfd-options">
                            <label class="cfd-option cfd-toggle-all" @click.stop @mousedown.stop>
                                <input type="checkbox" :checked="allFilterValuesSelected(activeColumnFilter)" @change.stop="toggleAllFilterValues(activeColumnFilter)" @click.stop />
                                <span class="cfd-check"></span>
                                <span class="cfd-val toggle-label">{{ allFilterValuesSelected(activeColumnFilter) ? 'Vacío' : 'Todos' }}</span>
                            </label>
                            <div class="cfd-divider"></div>

                            <div v-if="filterDropdownTotalCount > MAX_FILTER_RENDER" class="cfd-truncate-info">
                                Mostrando {{ filterDropdownValues.length }} de {{ filterDropdownTotalCount }} opciones. Usa búsqueda para filtrar.
                            </div>

                            <label
                                v-for="val in filterDropdownValues"
                                :key="val"
                                class="cfd-option"
                                :class="{ selected: isFilterValueSelected(activeColumnFilter, val) }"
                            >
                                <input type="checkbox" :checked="isFilterValueSelected(activeColumnFilter, val)" @change.stop="toggleFilterValue(activeColumnFilter, val)" @click.stop />
                                <span class="cfd-check"></span>
                                <span class="cfd-val">{{ val || '(Vacío)' }}</span>
                                <span class="cfd-count-badge">{{ getValueCount(activeColumnFilter, val) }}</span>
                            </label>

                            <div v-if="filterDropdownTotalCount > MAX_FILTER_RENDER" class="cfd-truncate-note">
                                Mostrar sólo los primeros {{ MAX_FILTER_RENDER }} valores. Filtra por texto o usa el filtro completo en la tabla.
                            </div>
                        </div>
                        <div class="cfd-footer">
                            <button @click="applyAndCloseFilter(activeColumnFilter)" class="cfd-apply-btn">
                                <IIcon name="ic:baseline-check" size="14" /> Aplicar
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <!-- Table -->
            <table class="consumables-table">
                <thead>
                    <tr>
                        <th class="col-select">
                            <input 
                                type="checkbox" 
                                :checked="allSelected" 
                                :indeterminate="someSelected"
                                @change="toggleSelectAll"
                                title="Seleccionar todos"
                            />
                        </th>
                        <th v-for="col in tableColumns" :key="col"
                            :data-column="col"
                            :class="['col-' + col.replace(/\s+/g, '-').toLowerCase(), { 'has-active-filter': isColumnFiltered(col) }]">
                            <div class="th-inner">
                                <span class="th-label">{{ col }}</span>
                                <button
                                    class="col-filter-btn"
                                    :class="{ active: activeColumnFilter === col, filtered: isColumnFiltered(col) }"
                                    @click.stop="toggleColumnFilter(col, $event)"
                                    :title="isColumnFiltered(col) ? 'Filtro activo' : 'Filtrar por ' + col"
                                >
                                    <IIcon :name="isColumnFiltered(col) ? 'ic:baseline-filter-alt' : 'ic:baseline-filter-list'" size="14" />
                                    <span v-if="isColumnFiltered(col)" class="filter-dot">{{ getFilterCount(col) }}</span>
                                </button>
                            </div>
                        </th>
                        <th class="col-status">
                            <div class="th-inner"><span class="th-label">Estado</span></div>
                        </th>
                        <th class="col-actions">
                            <div class="th-inner"><span class="th-label">Acciones</span></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, idx) in paginatedItems" :key="getItemKey(item)" :class="getRowClass(item)">
                        <td class="col-select">
                            <input 
                                type="checkbox" 
                                :checked="isRowSelected(idx)"
                                @change="toggleRowSelection(idx)"
                            />
                        </td>
                        <td v-for="col in tableColumns" :key="col"
                            :class="'col-' + col.replace(/\s+/g, '-').toLowerCase()">
                            <span :class="getColumnClass(col, item)">{{ getCellDisplayValue(item, col) }}</span>
                        </td>
                        <td class="col-status">
                            <span :class="getStatusClass(item)" class="status-badge">
                                {{ getStatusLabel(item) }}
                            </span>
                        </td>
                        <td class="col-actions">
                            <button class="btn-action" @click="openContextMenu($event, item, idx)"
                                @contextmenu.prevent="openContextMenu($event, item, idx)"
                                :class="{ 'context-open': contextMenuIdx === idx }" title="Menú de acciones">
                                <IIcon name="ic:baseline-more-vert" size="18" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Paginación Mejorada -->
        <div class="table-pagination" v-if="totalPages > 1">
            <div class="pagination-left">
                <span class="pagination-info">
                    Mostrando {{ ((currentPage - 1) * localItemsPerPage.value) + 1 }} a
                    {{ Math.min(currentPage * localItemsPerPage.value, filteredByExpiration.length) }}
                    de {{ filteredByExpiration.length }} artículos<span v-if="hasActiveFilters || expirationFilter !== 'all'"> ({{ expirationFilter !== 'all' ? filteredByExpiration.length : props.items.length }}
                        {{ expirationFilter !== 'all' ? 'filtrados' : 'totales' }})</span>
                </span>
            </div>

            <div class="pagination-center">
                <button class="btn-nav" :disabled="currentPage === 1" @click="currentPage = 1" title="Primera página">
                    <IIcon name="ic:baseline-skip-previous" size="18" />
                </button>
                <button class="btn-nav" :disabled="currentPage === 1" @click="currentPage--" title="Página anterior">
                    <IIcon name="ic:baseline-chevron-left" size="18" />
                </button>

                <div class="page-numbers">
                    <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{ active: p === currentPage }"
                        @click="currentPage = p" :title="`Ir a página ${p}`">
                        {{ p }}
                    </button>
                </div>

                <button class="btn-nav" :disabled="currentPage === totalPages" @click="currentPage++"
                    title="Siguiente página">
                    <IIcon name="ic:baseline-chevron-right" size="18" />
                </button>
                <button class="btn-nav" :disabled="currentPage === totalPages" @click="currentPage = totalPages"
                    title="Última página">
                    <IIcon name="ic:baseline-skip-next" size="18" />
                </button>
            </div>

            <div class="pagination-right">
                <span class="page-indicator">Página {{ currentPage }} de {{ totalPages }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import IIcon from '@/components/IIcon.vue'
import { usePermissions } from '@/composables/usePermissions.js'

const { canManageBiomedical, canEditBiomedicalEquipment } = usePermissions()

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    },
    itemsPerPage: {
        type: Number,
        default: 15
    }
})

const emit = defineEmits(['edit', 'move-stock', 'add-intake', 'decommission', 'view-kardex'])

// Control de exportación
const showExportMenu = ref(false)
const exportAllData = ref(true)
const exportLimit = ref(100)

// Computed para obtener el límite efectivo de exportación
const effectiveExportLimit = computed(() => {
  if (exportAllData.value) return props.items.length
  const limit = parseInt(exportLimit.value) || 100
  return Math.min(limit, props.items.length)
})

// Funciones de selección
const allSelected = computed(() => {
  if (paginatedItems.value.length === 0) return false
  return paginatedItems.value.every((_, idx) => selectedRows.value.includes(idx))
})

const someSelected = computed(() => {
  return selectedRows.value.length > 0 && !allSelected.value
})

function isRowSelected(idx) {
  return selectedRows.value.includes(idx)
}

function toggleRowSelection(idx) {
  const pos = selectedRows.value.indexOf(idx)
  if (pos >= 0) {
    selectedRows.value.splice(pos, 1)
  } else {
    selectedRows.value.push(idx)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    // Deseleccionar todos en esta página
    paginatedItems.value.forEach((_, idx) => {
      const pos = selectedRows.value.indexOf(idx)
      if (pos >= 0) selectedRows.value.splice(pos, 1)
    })
  } else {
    // Seleccionar todos en esta página
    paginatedItems.value.forEach((_, idx) => {
      if (!selectedRows.value.includes(idx)) {
        selectedRows.value.push(idx)
      }
    })
  }
}

function getDateString() {
  return new Date().toISOString().split('T')[0]
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function exportToExcel() {
  try {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Insumos y Refacciones')

    // Obtener los datos a exportar
    const dataToExport = props.items.slice(0, effectiveExportLimit.value)
    
    // Obtener las columnas del primer item
    const columns = dataToExport.length > 0 ? Object.keys(dataToExport[0]).filter(k => !k.startsWith('_')) : []
    
    // Headers
    const headers = columns.map(k => k)
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    }

    // Data rows
    dataToExport.forEach(item => {
      const values = columns.map(c => item[c] != null ? item[c] : '')
      worksheet.addRow(values)
    })

    // Auto column width
    worksheet.columns.forEach(column => {
      let maxLength = 0
      column.eachCell?.({ includeEmpty: true }, cell => {
        const v = cell.value == null ? '' : String(cell.value)
        maxLength = Math.max(maxLength, v.length)
      })
      column.width = Math.min(maxLength + 2, 50)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `insumos_refacciones_${getDateString()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showExportMenu.value = false
  } catch (error) {
    console.error('Error exporting Excel:', error)
  }
}

async function exportSelectedToExcel() {
  if (selectedRows.value.length === 0) return
  
  try {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Insumos Seleccionados')

    // Obtener los datos seleccionados directamente de los índices
    const selectedData = selectedRows.value.map(idx => props.items[idx]).filter(Boolean)
    
    // Obtener las columnas del primer item
    const columns = selectedData.length > 0 ? Object.keys(selectedData[0]).filter(k => !k.startsWith('_')) : []
    
    // Headers
    const headers = columns.map(k => k)
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    }

    // Data rows
    selectedData.forEach(item => {
      const values = columns.map(c => item[c] != null ? item[c] : '')
      worksheet.addRow(values)
    })

    // Auto column width
    worksheet.columns.forEach(column => {
      let maxLength = 0
      column.eachCell?.({ includeEmpty: true }, cell => {
        const v = cell.value == null ? '' : String(cell.value)
        maxLength = Math.max(maxLength, v.length)
      })
      column.width = Math.min(maxLength + 2, 50)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `insumos_seleccionados_${getDateString()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showExportMenu.value = false
  } catch (error) {
    console.error('Error exporting selected to Excel:', error)
  }
}

const currentPage = ref(1)
const localItemsPerPage = ref(props.itemsPerPage || 15)
const contextMenuIdx = ref(null)
const contextMenuItem = ref(null)
const contextMenuStyle = ref({})
const selectedRows = ref([])

// Inline filter dropdown states
const activeColumnFilter = ref(null)
const columnFilterSearch = ref({})
const activeFilters = ref({}) // { columnName: [selectedValues...] }

// Dropdown position via getBoundingClientRect
const dropdownStyle = ref({})
const tableScrollRef = ref(null)

function calcDropdownStyle(btn) {
    const rect = btn.getBoundingClientRect()
    const panelWidth = 240
    let left = rect.left
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8
    return {
        position: 'fixed',
        top: rect.bottom + 4 + 'px',
        left: left + 'px',
        zIndex: 9999
    }
}

// Abrir / cerrar dropdown inline
function toggleColumnFilter(col, event) {
    if (activeColumnFilter.value === col) {
        activeColumnFilter.value = null
        return
    }
    const btn = event?.currentTarget
    if (btn) {
        dropdownStyle.value = calcDropdownStyle(btn)
    }
    activeColumnFilter.value = col
    if (!columnFilterSearch.value[col]) columnFilterSearch.value[col] = ''
    if (!activeFilters.value[col]) {
        activeFilters.value[col] = getUniqueValuesFor(col)
    }
    // Ensure background computation starts for full unique list
    scheduleComputeUniqueValues(col)
}

function getFilteredUniqueValues(col) {
    const search = (columnFilterSearch.value[col] || '').toLowerCase()
    const vals = getUniqueValuesFor(col)
    if (!search) return vals
    return vals.filter(v => String(v).toLowerCase().includes(search))
}

// Modified to use cache and sample quickly when full cache is not ready
function getUniqueValuesFor(columnName) {
    if (!columnName) return []

    // return cached full list if available
    const cached = uniqueValuesCache.value[columnName]
    if (Array.isArray(cached)) return cached

    // return partial incremental results if available (better than blocking)
    const partial = uniqueValuesPartial.value[columnName]
    if (Array.isArray(partial) && partial.length) return partial

    // schedule background computation of full set
    scheduleComputeUniqueValues(columnName)

    // quick sampled synchronous scan to provide immediate options
    try {
        const sample = new Set()
        const len = props.items.length
        if (len === 0) return []
        // sample only a limited number of items (SAMPLE_SCAN) to keep first render snappy
        const step = Math.max(1, Math.floor(len / Math.min(len, SAMPLE_SCAN)))
        for (let i = 0; i < len; i += step) {
            const v = getCellRawValue(props.items[i], columnName, '')
            if (v !== undefined && v !== null && String(v).trim() !== '') sample.add(String(v).trim())
            if (sample.size >= MAX_DISPLAY_VALUES) break
        }
        const arr = Array.from(sample)
        arr.sort((a, b) => {
            if (!isNaN(a) && !isNaN(b)) return parseFloat(a) - parseFloat(b)
            return a.localeCompare(b, 'es', { numeric: true })
        })
        return arr
    } catch (e) {
        return []
    }
}

function isFilterValueSelected(col, val) {
    const filter = activeFilters.value[col]
    if (!filter) return true
    return filter.includes(String(val))
}

function toggleFilterValue(col, val) {
    const allVals = getUniqueValuesFor(col)
    let current = activeFilters.value[col] ? [...activeFilters.value[col]] : [...allVals]
    const strVal = String(val)
    const idx = current.indexOf(strVal)
    if (idx === -1) current.push(strVal)
    else current.splice(idx, 1)
    activeFilters.value = { ...activeFilters.value, [col]: current }
}

function allFilterValuesSelected(col) {
    const allVals = getUniqueValuesFor(col)
    const current = activeFilters.value[col]
    if (!current) return true
    return current.length >= allVals.length
}

function toggleAllFilterValues(col) {
    if (allFilterValuesSelected(col)) {
        activeFilters.value = { ...activeFilters.value, [col]: [] }
    } else {
        activeFilters.value = { ...activeFilters.value, [col]: getUniqueValuesFor(col) }
    }
}

function selectAllFilterValues(col) {
    activeFilters.value = { ...activeFilters.value, [col]: getUniqueValuesFor(col) }
}

function clearColumnFilter(col) {
    activeFilters.value = { ...activeFilters.value, [col]: [] }
}

// NOTE: getValueCount is implemented below using cached counts to avoid expensive scans.
function getFilterCount(col) {
    const filter = activeFilters.value[col]
    if (!filter) return 0
    const allVals = getUniqueValuesFor(col)
    return allVals.length - filter.length
}

function applyAndCloseFilter(col) {
    const allVals = getUniqueValuesFor(col)
    const current = activeFilters.value[col]
    if (!current || current.length === 0 || current.length >= allVals.length) {
        const updated = { ...activeFilters.value }
        delete updated[col]
        activeFilters.value = updated
    }
    activeColumnFilter.value = null
    currentPage.value = 1
}

function updateItemsPerPage() {
    currentPage.value = 1
}


// Cache and async computation for unique values per column to avoid blocking UI
const uniqueValuesCache = ref({})
const uniqueValuesPartial = ref({}) // incremental partial results while computing
const uniqueValuesCountCache = ref({})
const uniqueValuesCountPartial = ref({})
const uniqueValuesLoading = ref({})

// Smaller synchronous sample for immediate UI and chunked full scan
const SAMPLE_SCAN = 120
const MAX_DISPLAY_VALUES = 500 // limit to keep UI responsive (still searchable)
const MAX_FILTER_RENDER = 220 // max values rendered in dropdown

function scheduleComputeUniqueValues(col) {
    if (!col) return
    if (uniqueValuesCache.value[col] || uniqueValuesLoading.value[col]) return
    uniqueValuesLoading.value = { ...uniqueValuesLoading.value, [col]: true }
    uniqueValuesPartial.value = { ...uniqueValuesPartial.value, [col]: [] }
    uniqueValuesCountPartial.value = { ...uniqueValuesCountPartial.value, [col]: {} }

    const BATCH_SIZE = 500
    const len = props.items.length
    let idx = 0
    const set = new Set()
    const counts = {}

    const sortAndStorePartial = () => {
        const arr = Array.from(set).slice(0, MAX_DISPLAY_VALUES)
        arr.sort((a, b) => {
            if (!isNaN(a) && !isNaN(b)) return parseFloat(a) - parseFloat(b)
            return a.localeCompare(b, 'es', { numeric: true })
        })
        uniqueValuesPartial.value = { ...uniqueValuesPartial.value, [col]: arr }
        uniqueValuesCountPartial.value = { ...uniqueValuesCountPartial.value, [col]: { ...counts } }
    }

    const finalize = () => {
        const finalArr = Array.from(set).slice(0, MAX_DISPLAY_VALUES)
        finalArr.sort((a, b) => {
            if (!isNaN(a) && !isNaN(b)) return parseFloat(a) - parseFloat(b)
            return a.localeCompare(b, 'es', { numeric: true })
        })
        uniqueValuesCache.value = { ...uniqueValuesCache.value, [col]: finalArr }
        uniqueValuesCountCache.value = { ...uniqueValuesCountCache.value, [col]: { ...counts } }
        uniqueValuesLoading.value = { ...uniqueValuesLoading.value, [col]: false }
        uniqueValuesPartial.value = { ...uniqueValuesPartial.value, [col]: undefined }
        uniqueValuesCountPartial.value = { ...uniqueValuesCountPartial.value, [col]: undefined }
    }

    function processChunk(deadline) {
        try {
            const end = Math.min(len, idx + BATCH_SIZE)
            for (; idx < end; idx++) {
                const item = props.items[idx]
                const value = getCellRawValue(item, col, '')
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    const normalized = String(value).trim()
                    set.add(normalized)
                    counts[normalized] = (counts[normalized] || 0) + 1
                }
                if (set.size >= MAX_DISPLAY_VALUES) {
                    idx = len // break outer
                    break
                }
            }
            // update partial results so UI can display progressively
            sortAndStorePartial()

            if (idx < len && set.size < MAX_DISPLAY_VALUES) {
                // schedule next chunk using requestIdleCallback if available
                if (typeof window !== 'undefined' && window.requestIdleCallback) {
                    window.requestIdleCallback(processChunk, { timeout: 200 })
                } else {
                    setTimeout(processChunk, 40)
                }
            } else {
                finalize()
            }
        } catch (e) {
            console.warn('[ConsumablesTable] scheduleComputeUniqueValues chunk error', e)
            uniqueValuesLoading.value = { ...uniqueValuesLoading.value, [col]: false }
        }
    }

    // Kick off
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(processChunk, { timeout: 200 })
    } else {
        setTimeout(processChunk, 20)
    }
}

function getValueCount(col, val) {
    const key = String(val)
    const counts = uniqueValuesCountCache.value[col] || uniqueValuesCountPartial.value[col]
    if (counts && typeof counts[key] === 'number') return counts[key]

    // fallback (rare) — compute on demand
    return props.items.reduce((acc, item) => {
        const itemVal = String(getCellRawValue(item, col, '')).trim()
        return acc + (itemVal === key ? 1 : 0)
    }, 0)
}

// Indica si la columna tiene un filtro activo (subconjunto de valores)
function isColumnFiltered(columnName) {
    const filter = activeFilters.value[columnName]
    if (!filter) return false
    const allVals = getUniqueValuesFor(columnName)
    return filter.length < allVals.length
}

// Valores para el dropdown de filtro (limita el DOM y permite mostrar info de truncado)
const filterDropdownValues = computed(() => {
    const col = activeColumnFilter.value
    if (!col) return []
    const search = (columnFilterSearch.value[col] || '').toLowerCase()
    const all = getUniqueValuesFor(col)
    const filtered = search ? all.filter(v => String(v).toLowerCase().includes(search)) : all

    if (filtered.length > MAX_FILTER_RENDER) {
        return filtered.slice(0, MAX_FILTER_RENDER)
    }
    return filtered
})

const filterDropdownTotalCount = computed(() => {
    const col = activeColumnFilter.value
    if (!col) return 0
    const search = (columnFilterSearch.value[col] || '').toLowerCase()
    const all = getUniqueValuesFor(col)
    return search ? all.filter(v => String(v).toLowerCase().includes(search)).length : all.length
})

// Limpia caches y filtros cuando los ítems cambian para evitar mostrar opciones obsoletas
watch(
    () => props.items,
    () => {
        uniqueValuesCache.value = {}
        uniqueValuesPartial.value = {}
        uniqueValuesCountCache.value = {}
        uniqueValuesCountPartial.value = {}
        uniqueValuesLoading.value = {}
        activeFilters.value = {}
        columnFilterSearch.value = {}
        currentPage.value = 1
    },
    { deep: true }
)

const hasActiveFilters = computed(() => Object.keys(realActiveFilters.value).length > 0)
const activeFilterCount = computed(() => Object.keys(realActiveFilters.value).length)

// Filtros activos reales: solo columnas con subconjunto de valores (no todos)
const realActiveFilters = computed(() => {
    const result = {}
    for (const [col, vals] of Object.entries(activeFilters.value)) {
        if (!vals || vals.length === 0) continue
        const allVals = getUniqueValuesFor(col)
        if (vals.length < allVals.length) {
            result[col] = vals
        }
    }
    return result
})

// Filter items based on active filters (Excel-like: solo se aplica cuando hay subconjunto)
const filteredItems = computed(() => {
    const filters = realActiveFilters.value
    if (Object.keys(filters).length === 0) return props.items

    return props.items.filter(item => {
        for (const [columnName, selectedValues] of Object.entries(filters)) {
            const itemValue = String(getCellRawValue(item, columnName, '')).trim()
            if (!selectedValues.includes(itemValue)) return false
        }
        return true
    })
})

const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * localItemsPerPage.value
    const end = start + localItemsPerPage.value
    return filteredByExpiration.value.slice(start, end)
})

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredByExpiration.value.length / localItemsPerPage.value))
})

function pickValue(item, keys = [], fallback = '') {
    if (!item || typeof item !== 'object') return fallback

    const normalizeKey = (key) => String(key || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()

    const normalizedLookup = new Map()
    Object.keys(item).forEach((itemKey) => {
        const normalized = normalizeKey(itemKey)
        if (normalized && !normalizedLookup.has(normalized)) {
            normalizedLookup.set(normalized, itemKey)
        }
    })

    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(item, key) && item[key] !== null && item[key] !== undefined && item[key] !== '') {
            return item[key]
        }

        const normalizedCandidate = normalizeKey(key)
        const matchedKey = normalizedLookup.get(normalizedCandidate)
        if (matchedKey) {
            const value = item[matchedKey]
            if (value !== null && value !== undefined && value !== '') {
                return value
            }
        }
    }
    return fallback
}

function getNumericValue(item, keys = [], fallback = 0) {
    const raw = pickValue(item, keys, fallback)
    const parsed = parseInt(raw)
    return Number.isFinite(parsed) ? parsed : (Number.isFinite(Number(raw)) ? Number(raw) : fallback)
}

// Columnas dinámicas de la base de datos
const tableColumns = ref([
    'N',
    'Fecha de Ingreso',
    'Clave  HRAEI',
    'Descripción del bien',
    'Unidad de medida (presentación)',
    'CUCOP',
    'MODELO',
    'LOTE',
    'REFERENCIA',
    'MARCA',
    'CADUCIDAD',
    'Existencia SUBCEYE IB',
    ' Almacén IB (OFICINA)',
    'Total Excistencias',
    'OBSERVACIONES'
])

const columnAliasMap = {
    'N': ['N', 'n', 'No', 'NO', 'Número', 'NUMERO', 'Numero'],
    'Fecha de Ingreso': ['Fecha de Ingreso', 'FECHA DE INGRESO', 'fecha_ingreso', 'fechaIngreso', 'FechaIngreso'],
    'Clave  HRAEI': ['Clave  HRAEI', 'Clave HRAEI', 'CLAVE HRAEI', 'clave_hraei', 'Clave_HRAEI'],
    'Descripción del bien': ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN DEL BIEN', 'DESCRIPCION DEL BIEN', 'DESCRIPCIÓN ARTÍCULO', 'DESCRIPCION ARTICULO', 'descripcion'],
    'Unidad de medida (presentación)': ['Unidad de medida (presentación)', 'Unidad de medida (presentacion)', 'Unidad de medida', 'UNIDAD DE MEDIDA', 'Unidad_Medida', 'UNIDAD'],
    'CUCOP': ['CUCOP', 'cucop'],
    'MODELO': ['MODELO', 'Modelo', 'modelo'],
    'LOTE': ['LOTE', 'Lote', 'lote'],
    'REFERENCIA': ['REFERENCIA', 'Referencia', 'referencia'],
    'MARCA': ['MARCA', 'Marca', 'marca'],
    'CADUCIDAD': ['CADUCIDAD', 'Caducidad', 'caducidad'],
    'Existencia SUBCEYE IB': ['Existencia SUBCEYE IB', 'EXISTENCIA SUBCEYE IB', 'existencia_subceye', 'Existencia SUBCEYE'],
    ' Almacén IB (OFICINA)': [' Almacén IB (OFICINA)', 'Almacén IB (OFICINA)', 'ALMACÉN IB (OFICINA)', 'ALMACEN IB (OFICINA)', 'existencia_oficina', 'Almacen IB (OFICINA)'],
    'Total Excistencias': ['Total Excistencias', 'TOTAL EXISTENCIAS', 'totalExistencias', 'total_existencias', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'],
    'OBSERVACIONES': ['OBSERVACIONES', 'Observaciones', 'observaciones']
}

function getCellRawValue(item, columnName, fallback = '') {
    return pickValue(item, columnAliasMap[columnName] || [columnName], fallback)
}

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return pages
})

function getItemKey(item) {
    return getCellRawValue(item, 'Clave  HRAEI', '') || item['clave'] || item['id'] || Math.random().toString()
}

function getCellDisplayValue(item, columnName) {
    if (!item) return '—'
    const value = getCellRawValue(item, columnName, '')
    return value === '' ? '—' : value
}

function getColumnClass(columnName, item) {
    const value = pickValue(item, [
        columnName,
        columnName === 'Total Excistencias' ? 'TOTAL EXISTENCIAS' : '',
        columnName === 'TOTAL EXISTENCIAS' ? 'Total Excistencias' : '',
        columnName === 'Fecha de Ingreso' ? 'FECHA DE INGRESO' : '',
        columnName === 'OBSERVACIONES' ? 'Observaciones' : ''
    ].filter(Boolean))

    // Resaltar números (cantidades/existencias)
    if (['N', 'TOTAL EXISTENCIAS', 'Total Excistencias', 'Existencia SUBCEYE IB', ' Almacén IB (OFICINA)', 'Almacén IB (OFICINA)'].includes(columnName)) {
        if (value && !isNaN(value)) {
            return 'quantity-value'
        }
    }

    // Resaltar claves
    if (columnName === 'Clave  HRAEI') {
        return 'code-badge'
    }

    // Resaltar descripciones
    if (columnName === 'Descripción del bien') {
        return 'name-text'
    }

    // Semaforización de CADUCIDAD
    if (columnName === 'CADUCIDAD' && value) {
        const expStatus = getExpirationStatus(value)
        if (expStatus) {
            return `expiration-cell ${expStatus.class}`
        }
    }

    return ''
}

function getFieldValue(item, fieldType) {
    switch (fieldType) {
        case 'clave':
            return item['Clave  HRAEI'] || item['Clave HRAEI'] || item['clave'] || '—'
        case 'nombre':
            return item['DESCRIPCIÓN ARTÍCULO'] || item['Descripción del bien'] || item['NOMBRE'] || item['Nombre'] || item['nombre'] || '—'
        case 'fabricante':
            return item['MARCA'] || item['FABRICANTE'] || item['Fabricante'] || item['marca'] || item['fabricante'] || '—'
        case 'existencia_subceye':
            const subceye = item['Existencia SUBCEYE IB'] || item['existencia_subceye'] || 0
            return parseInt(subceye) || 0
        case 'existencia_oficina':
            const oficina = item[' Almacén IB (OFICINA)'] || item['Almacén IB (OFICINA)'] || item['existencia_oficina'] || 0
            return parseInt(oficina) || 0
        case 'cantidad':
            // Total de existencias
            return getNumericValue(item, ['Total Excistencias', 'TOTAL EXISTENCIAS', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0)
        case 'unidad':
            return item['Unidad de medida (presentación)'] || item['Unidad_Medida'] || item['UNIDAD'] || item['Unidad'] || item['unidad'] || 'Pza'
        default:
            return '—'
    }
}

function getCategory(item) {
    const explicit = item['CATEGORÍA'] || item['Categoría'] || item['categoria'] || ''
    if (explicit) return explicit

    const desc = (item['DESCRIPCIÓN ARTÍCULO'] || item['DESCRIPCIÓN'] || item['Descripción del bien'] || item['NOMBRE'] || '').toLowerCase()
    if (desc.includes('accesorio')) return 'Accesorio'
    if (desc.includes('refacción') || desc.includes('refaccion') || desc.includes('repuesto')) return 'Refacción'
    if (desc.includes('consumible')) return 'Consumible'
    return 'Otro'
}

function getStatusLabel(item) {
    const cantidad = getNumericValue(item, ['Total Excistencias', 'TOTAL EXISTENCIAS', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0)
    if (cantidad === 0) return 'Sin stock'
    if (cantidad < 5) return 'Bajo stock'
    return 'En stock'
}

function getStatusClass(item) {
    const cantidad = getNumericValue(item, ['Total Excistencias', 'TOTAL EXISTENCIAS', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0)
    if (cantidad === 0) return 'status-danger'
    if (cantidad < 5) return 'status-warning'
    return 'status-success'
}

// Función para obtener el estado de caducidad
function getExpirationStatus(caducidad) {
    if (!caducidad) return null
    
    try {
        // Intentar parsear la fecha de caducidad
        let fechaCaducidad
        
        // Manejar diferentes formatos de fecha
        if (typeof caducidad === 'string') {
            // Intentar diferentes formatos
            fechaCaducidad = new Date(caducidad)
            if (isNaN(fechaCaducidad.getTime())) {
                // Intentar formato DD/MM/YYYY
                const parts = caducidad.split('/')
                if (parts.length === 3) {
                    fechaCaducidad = new Date(parts[2], parts[1] - 1, parts[0])
                }
            }
        } else {
            fechaCaducidad = new Date(caducidad)
        }
        
        if (isNaN(fechaCaducidad.getTime())) return null
        
        const hoy = new Date()
        const diferenciaDias = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24))
        
        if (diferenciaDias < 0) {
            return { status: 'expired', dias: diferenciaDias, label: 'Expirado', class: 'expiration-expired' }
        } else if (diferenciaDias <= 30) {
            return { status: 'critical', dias: diferenciaDias, label: `${diferenciaDias}d`, class: 'expiration-critical' }
        } else if (diferenciaDias <= 90) {
            return { status: 'warning', dias: diferenciaDias, label: `${diferenciaDias}d`, class: 'expiration-warning' }
        } else {
            return { status: 'ok', dias: diferenciaDias, label: `${diferenciaDias}d`, class: 'expiration-ok' }
        }
    } catch (e) {
        console.warn('Error parsing caducidad:', e)
        return null
    }
}

// Filtro de caducidad
const expirationFilter = ref('all') // 'all', 'expired', 'critical', 'warning', 'ok'

const filteredByExpiration = computed(() => {
    if (expirationFilter.value === 'all') return filteredItems.value
    
    return filteredItems.value.filter(item => {
        const caducidad = pickValue(item, ['CADUCIDAD', 'Caducidad'])
        const expStatus = getExpirationStatus(caducidad)
        
        if (!expStatus) return expirationFilter.value === 'all'
        
        switch (expirationFilter.value) {
            case 'expired': return expStatus.status === 'expired'
            case 'critical': return expStatus.status === 'critical'
            case 'warning': return expStatus.status === 'warning'
            case 'ok': return expStatus.status === 'ok'
            default: return true
        }
    })
})

// Contadores para badges
const expirationCounts = computed(() => {
    const counts = { expired: 0, critical: 0, warning: 0, ok: 0 }
    filteredItems.value.forEach(item => {
        const expStatus = getExpirationStatus(pickValue(item, ['CADUCIDAD', 'Caducidad']))
        if (expStatus) {
            counts[expStatus.status]++
        }
    })
    return counts
})

function getRowClass(item) {
    const cantidad = getNumericValue(item, ['Total Excistencias', 'TOTAL EXISTENCIAS', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0)
    const clasesBase = []
    
    // Clase según cantidad
    if (cantidad === 0) clasesBase.push('row-danger')
    else if (cantidad < 5) clasesBase.push('row-warning')
    
    // Semaforización por caducidad - fondo de fila completo
    const caducidad = pickValue(item, ['CADUCIDAD', 'Caducidad'])
    const expStatus = getExpirationStatus(caducidad)
    if (expStatus) {
        if (expStatus.status === 'expired') {
            clasesBase.push('row-expired') // Rojo intenso - expirado
        } else if (expStatus.dias <= 15) {
            clasesBase.push('row-critical') // Rojo - menos de 15 días
        } else if (expStatus.dias <= 30) {
            clasesBase.push('row-warning-expiry') // Naranja/amarillo - 15-30 días
        } else if (expStatus.dias <= 90) {
            clasesBase.push('row-ok-expiry') // Amarillo suave - 30-90 días
        } else {
            clasesBase.push('row-healthy-expiry') // Verde suave - más de 90 días
        }
    }
    
    return clasesBase.join(' ')
}

function openContextMenu(event, item, idx) {
    event.preventDefault()
    event.stopPropagation()

    contextMenuIdx.value = idx
    contextMenuItem.value = item

    const rect = event.currentTarget.getBoundingClientRect()
    contextMenuStyle.value = {
        position: 'fixed',
        top: rect.bottom + 5 + 'px',
        left: Math.min(rect.left, window.innerWidth - 250) + 'px',
        zIndex: 9999
    }
}

function handleEditItem(item) {
    contextMenuIdx.value = null
    emit('edit', item)
}

function handleViewKardex(item) {
    contextMenuIdx.value = null
    emit('view-kardex', item)
}

function handleMoveStock(item) {
    contextMenuIdx.value = null
    emit('move-stock', item)
}

function handleAddIntake(item) {
    contextMenuIdx.value = null
    emit('add-intake', item)
}

function handleDecommission(item) {
    contextMenuIdx.value = null
    emit('decommission', item)
}

// Cerrar menú al hacer click fuera
if (typeof window !== 'undefined') {
    document.addEventListener('click', () => {
        contextMenuIdx.value = null
        // No cerramos el filtro de columna aquí para permitir interacción
    })
}

// El panel se reposiciona para quedarse junto al encabezado cuando se hace scroll
const handleScrollForFilter = () => {
    // Buscar el botón del filtro activo y actualizar posición
    if (!activeColumnFilter.value || !tableScrollRef.value) return
    
    const tableEl = tableScrollRef.value
    const buttons = tableEl.querySelectorAll('.col-filter-btn')
    let targetBtn = null
    for (const btn of buttons) {
        const th = btn.closest('th')
        if (th) {
            const colName = th.getAttribute('data-column')
            if (colName === activeColumnFilter.value) {
                targetBtn = btn
                break
            }
        }
    }
    
    if (targetBtn) {
        dropdownStyle.value = calcDropdownStyle(targetBtn)
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleScrollForFilter, { passive: true })
    window.addEventListener('wheel', handleScrollForFilter, { passive: true })
})
onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScrollForFilter)
    window.removeEventListener('wheel', handleScrollForFilter)
})
</script>

<style scoped>
.consumables-table-wrapper {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.table-scroll-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 560px;
    -webkit-overflow-scrolling: touch;
    scrollbar-color: rgba(59, 130, 246, 0.5) rgba(30, 41, 59, 0.4);
    scrollbar-width: thin;
}

.table-scroll-container::-webkit-scrollbar {
    height: 6px;
}

.table-scroll-container::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.2);
}

.table-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(96, 165, 250, 0.3);
    border-radius: 3px;
}

.table-scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(96, 165, 250, 0.5);
}

.consumables-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(15, 23, 42, 0.4);
    font-size: 0.85rem;
    min-width: 1400px;
}

.consumables-table thead {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%);
    border-bottom: 2px solid rgba(59, 130, 246, 0.4);
}

/* Sticky en cada th individualmente (no en thead) para máxima compatibilidad */
.consumables-table th {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 0;
    text-align: left;
    font-weight: 700;
    color: #60a5fa;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    background: rgba(15, 23, 42, 0.97);
    backdrop-filter: blur(8px);
    border-right: 1px solid rgba(59, 130, 246, 0.15);
    border-bottom: 2px solid rgba(59, 130, 246, 0.4);
    /* Permite que el dropdown salga visualmente fuera del th */
    overflow: visible;
    vertical-align: top;
}

.consumables-table th.has-active-filter {
    background: rgba(245, 158, 11, 0.08);
}

/* Contenedor interno del th: texto + botón filtro */
.th-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 12px 12px;
    white-space: nowrap;
}

.th-label {
    flex: 1;
}

/* Botón de filtro por columna */
.col-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 6px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid transparent;
    border-radius: 4px;
    color: rgba(148, 163, 184, 0.6);
    cursor: pointer;
    font-size: 0.7rem;
    transition: all 0.15s;
    flex-shrink: 0;
}

.col-filter-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.35);
    color: #93c5fd;
}

.col-filter-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.col-filter-btn.filtered {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.4);
    color: #fbbf24;
}

.filter-dot {
    background: rgba(0,0,0,0.3);
    padding: 1px 4px;
    border-radius: 8px;
    font-size: 0.6rem;
    font-weight: 700;
}

/* Panel de filtro por columna - Teleport fixed al body */
.cfd-panel {
    width: 240px;
    max-height: 360px;
    display: flex;
    flex-direction: column;
    background: rgba(15, 23, 42, 0.98);
    border: 1.5px solid rgba(59, 130, 246, 0.35);
    border-radius: 10px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    backdrop-filter: blur(16px);
    overflow: hidden;
}

.cfd-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(59,130,246,0.2);
    color: #93c5fd;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: none;
    letter-spacing: 0;
    background: rgba(59,130,246,0.05);
}

.cfd-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85rem;
    transition: all 0.15s;
}
.cfd-close:hover { color: #f87171; background: rgba(248,113,113,0.1); }

.cfd-search {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 12px;
    margin: 7px 10px;
    background: rgba(30,41,59,0.6);
    border: 1px solid rgba(59,130,246,0.15);
    border-radius: 6px;
}
.cfd-search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-size: 0.82rem;
    outline: none;
}

.cfd-actions {
    display: flex;
    gap: 6px;
    padding: 0 12px 7px;
}
.cfd-action-btn {
    flex: 1;
    padding: 5px 8px;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 5px;
    color: #94a3b8;
    font-size: 0.72rem;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
}
.cfd-action-btn:hover { background: rgba(59,130,246,0.2); color: #93c5fd; }

.cfd-options {
    flex: 1;
    overflow-y: auto;
    padding: 2px 10px;
    max-height: 160px;
}
.cfd-options::-webkit-scrollbar { width: 4px; }
.cfd-options::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }

.cfd-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 5px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 0.8rem;
    user-select: none;
    transition: background 0.12s;
}
.cfd-option:hover { background: rgba(59,130,246,0.1); color: #e2e8f0; }
.cfd-option.selected { background: rgba(34,197,94,0.1); color: #86efac; }

.cfd-option input[type="checkbox"] {
    appearance: none;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(59,130,246,0.4);
    border-radius: 3px;
    background: rgba(30,41,59,0.5);
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    flex-shrink: 0;
}
.cfd-option input[type="checkbox"]:checked {
    background: #22c55e;
    border-color: #22c55e;
}
.cfd-option input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    color: white;
    font-size: 9px;
    font-weight: bold;
}

.cfd-toggle-all {
    background: rgba(59,130,246,0.05);
    border-radius: 4px;
    margin: 2px 0;
}
.cfd-toggle-all .toggle-label { font-weight: 700; color: #93c5fd; }

.cfd-divider {
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 3px 0;
}

.cfd-truncate-info,
.cfd-truncate-note {
    padding: 6px 10px;
    background: rgba(30, 41, 59, 0.45);
    border-radius: 8px;
    font-size: 0.72rem;
    color: #cbd5e1;
    margin: 4px 0;
}
.cfd-truncate-note {
    font-style: italic;
}

.cfd-val { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cfd-count-badge {
    background: rgba(59,130,246,0.15);
    color: #64748b;
    padding: 1px 5px;
    border-radius: 8px;
    font-size: 0.65rem;
    font-weight: 600;
    flex-shrink: 0;
}

.cfd-footer {
    padding: 8px 12px;
    border-top: 1px solid rgba(59,130,246,0.2);
}
.cfd-apply-btn {
    width: 100%;
    padding: 7px 14px;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: all 0.2s;
}
.cfd-loading {
    padding: 10px 12px;
    color: #93c5fd;
    font-size: 0.85rem;
    text-align: center;
}
.cfd-apply-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }

/* Transición dropdown */
.col-filter-drop-enter-active,
.col-filter-drop-leave-active { transition: all 0.15s ease; }
.col-filter-drop-enter-from,
.col-filter-drop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }

.consumables-table td {
    padding: 14px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: #e2e8f0;
}

.consumables-table tbody tr {
    transition: all 0.2s ease;
}

.consumables-table tbody tr:hover {
    background: rgba(59, 130, 246, 0.05);
}

.consumables-table tbody tr.row-warning {
    background: rgba(245, 158, 11, 0.05);
}

.consumables-table tbody tr.row-danger {
    background: rgba(239, 68, 68, 0.05);
}

/* === SEMAFORIZACIÓN POR CADUCIDAD - FONDO DE FILA === */

/* Verde suave - Más de 90 días */
.consumables-table tbody tr.row-healthy-expiry {
    background: linear-gradient(90deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%);
    border-left: 3px solid #22c55e;
}

.consumables-table tbody tr.row-healthy-expiry:hover {
    background: linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%);
}

/* Amarillo suave - 30-90 días */
.consumables-table tbody tr.row-ok-expiry {
    background: linear-gradient(90deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.04) 100%);
    border-left: 3px solid #eab308;
}

.consumables-table tbody tr.row-ok-expiry:hover {
    background: linear-gradient(90deg, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0.1) 100%);
}

/* Naranja/amarillo - 15-30 días */
.consumables-table tbody tr.row-warning-expiry {
    background: linear-gradient(90deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.05) 100%);
    border-left: 3px solid #f97316;
}

.consumables-table tbody tr.row-warning-expiry:hover {
    background: linear-gradient(90deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%);
}

/* Rojo - menos de 15 días */
.consumables-table tbody tr.row-critical {
    background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.06) 100%);
    border-left: 3px solid #ef4444;
    animation: pulse-row-critical 2s ease-in-out infinite;
}

.consumables-table tbody tr.row-critical:hover {
    background: linear-gradient(90deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.12) 100%);
}

@keyframes pulse-row-critical {
    0%, 100% { box-shadow: inset 0 0 0 0 rgba(239, 68, 68, 0); }
    50% { box-shadow: inset 0 0 20px 0 rgba(239, 68, 68, 0.1); }
}

/* Rojo intenso - Expirado */
.consumables-table tbody tr.row-expired {
    background: linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, rgba(220, 38, 38, 0.08) 100%);
    border-left: 3px solid #dc2626;
    animation: pulse-row-expired 1.5s ease-in-out infinite;
}

.consumables-table tbody tr.row-expired:hover {
    background: linear-gradient(90deg, rgba(220, 38, 38, 0.28) 0%, rgba(220, 38, 38, 0.14) 100%);
}

@keyframes pulse-row-expired {
    0%, 100% { 
        box-shadow: inset 0 0 0 0 rgba(220, 38, 38, 0);
    }
    50% { 
        box-shadow: inset 0 0 25px 0 rgba(220, 38, 38, 0.15);
    }
}

/* Column sizing - Dynamic columns */
.col-n {
    width: 40px;
    text-align: center;
    white-space: nowrap;
}

.col-clave--hraei {
    width: 110px;
    white-space: nowrap;
}

.col-descripción-del-bien {
    width: 240px;
}

.col-unidad-de-medida-\(presentación\) {
    width: 90px;
    text-align: center;
    white-space: nowrap;
}

.col-cucop {
    width: 70px;
    text-align: center;
    white-space: nowrap;
}

.col-modelo {
    width: 80px;
    text-align: center;
    white-space: nowrap;
}

.col-lote {
    width: 70px;
    text-align: center;
    white-space: nowrap;
}

.col-referencia {
    width: 90px;
    text-align: center;
    white-space: nowrap;
}

.col-marca {
    width: 80px;
    text-align: center;
    white-space: nowrap;
}

.col-caducidad {
    width: 80px;
    text-align: center;
    white-space: nowrap;
}

.col-existencia-subceye-ib {
    width: 110px;
    text-align: center;
    white-space: nowrap;
}

.col-almacén-ib-\(oficina\) {
    width: 110px;
    text-align: center;
    white-space: nowrap;
}

.col-total-existencias {
    width: 100px;
    text-align: center;
    white-space: nowrap;
}

.col-status {
    width: 110px;
}

.col-actions {
    width: 60px;
    text-align: center;
}

/* Cell styles */
.code-badge {
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    padding: 4px 8px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    font-weight: 600;
}

.name-text {
    font-weight: 600;
    color: #f1f5f9;
    word-break: break-word;
}

.category-badge {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #86efac;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-block;
    width: fit-content;
}

.quantity-value {
    font-weight: 700;
    font-size: 1.05rem;
    color: #60a5fa;
}

.quantity-value.quantity-total {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.status-success {
    background: rgba(34, 197, 94, 0.2);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.4);
}

.status-warning {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.4);
}

.status-danger {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.4);
}

/* Estilos de semaforización de caducidad */
.expiration-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8rem;
}

.expiration-expired {
    background: rgba(239, 68, 68, 0.25);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.5);
}

.expiration-critical {
    background: rgba(249, 115, 22, 0.25);
    color: #fdba74;
    border: 1px solid rgba(249, 115, 22, 0.5);
}

.expiration-warning {
    background: rgba(245, 158, 11, 0.2);
    color: #fcd34d;
    border: 1px solid rgba(245, 158, 11, 0.4);
}

.expiration-ok {
    background: rgba(34, 197, 94, 0.2);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.4);
}

/* Filtro de caducidad */
.expiration-select {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(59, 130, 246, 0.4);
    border-radius: 6px;
    color: #e2e8f0;
    padding: 6px 10px;
    font-size: 0.85rem;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
}

.expiration-select:hover {
    border-color: rgba(59, 130, 246, 0.7);
}

.expiration-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.expiration-select option {
    background: #1e293b;
    color: #e2e8f0;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 700;
    margin-left: 4px;
}

.badge-expired {
    background: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
}

.badge-critical {
    background: rgba(249, 115, 22, 0.3);
    color: #fdba74;
}

.badge-warning {
    background: rgba(245, 158, 11, 0.3);
    color: #fcd34d;
}

.badge-ok {
    background: rgba(34, 197, 94, 0.3);
    color: #86efac;
}

.btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.12);
    border-radius: 8px;
    color: #60a5fa;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 0;
    flex-shrink: 0;
}

.btn-action:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
}

.btn-action.context-open {
    background: rgba(59, 130, 246, 0.35);
    border-color: rgba(59, 130, 246, 0.7);
    box-shadow: 0 0 12px rgba(96, 165, 250, 0.3);
}

.btn-action:active {
    transform: scale(0.95);
}

/* Context Menu */
.context-menu {
    position: fixed;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    z-index: 9999;
    min-width: 220px;
    overflow: hidden;
}

.context-menu-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    background: rgba(59, 130, 246, 0.05);
}

.context-equipment,
.context-name {
    display: block;
    font-weight: 700;
    color: #f1f5f9;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.context-inventory,
.context-clave {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
    font-family: 'Courier New', monospace;
}

.context-menu-body {
    padding: 8px 0;
}

.context-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    text-align: left;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.context-item {
    position: relative;
}

.context-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    padding-left: 20px;
}

.context-item.edit {
    color: #cbd5e1;
}

.context-item.edit:hover {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
}

.context-item.kardex {
    color: #cbd5e1;
}

.context-item.kardex:hover {
    background: rgba(6, 182, 212, 0.15);
    color: #06b6d4;
}

.context-item.move {
    color: #cbd5e1;
}

.context-item.move:hover {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.context-item.intake {
    color: #cbd5e1;
}

.context-item.intake:hover {
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7;
}

.context-item.decommission {
    color: #cbd5e1;
}

.context-item.decommission:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.context-divider {
    height: 1px;
    background: rgba(59, 130, 246, 0.2);
    margin: 4px 0;
}

/* Controls Bar */
.table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(15, 23, 42, 0.6);
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    gap: 20px;
}

.controls-left,
.controls-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.items-per-page-selector {
    display: flex;
    align-items: center;
    gap: 10px;
}

.items-per-page-selector label {
    font-size: 0.85rem;
    color: #cbd5e1;
    font-weight: 600;
}

.items-per-page-selector select {
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.items-per-page-selector select:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
}

.total-info {
    font-size: 0.85rem;
    color: #94a3b8;
    font-weight: 600;
}

/* Paginación */
.table-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(15, 23, 42, 0.5);
    border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.pagination-left,
.pagination-right {
    flex: 1;
    display: flex;
    align-items: center;
}

.pagination-left {
    justify-content: flex-start;
}

.pagination-right {
    justify-content: flex-end;
}

.pagination-center {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    justify-content: center;
}

.btn-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.25);
    color: #60a5fa;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 36px;
    height: 36px;
}

.btn-nav:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.btn-nav:active:not(:disabled) {
    transform: translateY(0);
}

.btn-nav:disabled {
    opacity: 0.25;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    gap: 6px;
}

.page-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.15);
    color: #94a3b8;
    border-radius: 5px;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-btn:hover {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
    color: #60a5fa;
    transform: translateY(-1px);
}

.page-btn.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    font-weight: 800;
}

.pagination-info {
    font-size: 0.8rem;
    color: #cbd5e1;
    font-weight: 600;
}

.page-indicator {
    font-size: 0.8rem;
    color: #94a3b8;
    font-weight: 600;
}

/* Transiciones */
.context-menu-enter-active,
.context-menu-leave-active {
    transition: all 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* Responsive */
@media (max-width: 1024px) {
    .col-name {
        width: 200px;
    }

    .col-fabricante {
        width: 100px;
    }
}

@media (max-width: 768px) {
    .consumables-table-wrapper {
        overflow-x: auto;
    }

    .consumables-table {
        min-width: 900px;
        font-size: 0.75rem;
    }

    .consumables-table th,
    .consumables-table td {
        padding: 10px 6px;
    }
}

/* Filter Badge de filtros activos en controls bar */
.filter-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid rgba(168, 85, 247, 0.3);
}
/* Export menu styles */
.export-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 6px;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.15s ease;
}

.export-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
}

.export-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: #1e293b;
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    padding: 8px;
    min-width: 220px;
    z-index: 1000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.export-section {
    padding: 4px 0;
}

.export-section-title {
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 8px;
    margin-bottom: 4px;
}

.export-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #e2e8f0;
    cursor: pointer;
    font-size: 0.85rem;
    text-align: left;
    transition: background 0.15s ease;
}

.export-option:hover {
    background: rgba(59, 130, 246, 0.15);
}

.export-option.highlight {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
}

.export-option.highlight:hover {
    background: rgba(34, 197, 94, 0.25);
}

.export-divider {
    height: 1px;
    background: rgba(59, 130, 246, 0.15);
    margin: 6px 0;
}

.export-radio {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #e2e8f0;
    border-radius: 4px;
}

.export-radio:hover {
    background: rgba(59, 130, 246, 0.1);
}

.export-radio input[type="radio"] {
    accent-color: #3b82f6;
}

.export-limit-input {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 22px;
    margin-top: 4px;
    margin-bottom: 8px;
}

.limit-input {
    width: 70px;
    padding: 4px 8px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 4px;
    color: #e2e8f0;
    font-size: 0.8rem;
}

.limit-input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
}

.export-limit-input span {
    font-size: 0.8rem;
    color: #94a3b8;
}

.col-select {
    width: 40px;
    text-align: center;
}

.col-select input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #3b82f6;
}

.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
    transition: all 0.2s ease;
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
