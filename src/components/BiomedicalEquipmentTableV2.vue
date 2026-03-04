<template>
  <div class="biomedical-table-container" :class="containerThemeClass">
    <!-- Ambient Glow Effect -->
    <div class="ambient-glow"></div>
    
    <!-- ═══════════════════════════════════════════════════════════════
         MODAL DE VISTA RÁPIDA DEL EQUIPO
         ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
          <div class="modal-container glass-panel">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon-wrap" :class="getStatusColorClass(selectedEquipment?.ESTATUS)">
                  <i class="pi pi-box"></i>
                </div>
                <div>
                  <h2 class="modal-title">{{ selectedEquipment?.EQUIPO_MEDICO || 'Equipo Médico' }}</h2>
                  <span class="modal-subtitle">
                    <i class="pi pi-hashtag"></i>
                    {{ selectedEquipment?.N_DE_INVENTARIO || 'Sin inventario' }}
                  </span>
                </div>
              </div>
              <button @click="closeDetailModal" class="modal-close-btn" title="Cerrar (Esc)">
                <i class="pi pi-times"></i>
              </button>
            </div>
            
            <div class="modal-body" v-if="selectedEquipment">
              <!-- Status Banner -->
              <div class="status-banner" :class="getStatusColorClass(selectedEquipment.ESTATUS)">
                <i :class="getStatusIcon(selectedEquipment.ESTATUS)"></i>
                <span>{{ selectedEquipment.ESTATUS || 'Sin estado' }}</span>
              </div>
              
              <!-- Quick Info Cards -->
              <div class="quick-info-grid">
                <div class="info-card">
                  <i class="pi pi-hashtag"></i>
                  <div class="info-content">
                    <span class="info-label">No. Inventario</span>
                    <span class="info-value">{{ selectedEquipment.N_DE_INVENTARIO || '-' }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <i class="pi pi-tag"></i>
                  <div class="info-content">
                    <span class="info-label">Marca</span>
                    <span class="info-value">{{ selectedEquipment.MARCA || '-' }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <i class="pi pi-box"></i>
                  <div class="info-content">
                    <span class="info-label">Modelo</span>
                    <span class="info-value">{{ selectedEquipment.MODELO || '-' }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <i class="pi pi-id-card"></i>
                  <div class="info-content">
                    <span class="info-label">Serie</span>
                    <span class="info-value">{{ selectedEquipment.SERIE || '-' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- All Details Section -->
              <div class="details-section">
                <h3 class="section-title">
                  <i class="pi pi-list"></i> Todos los Campos ({{ Object.keys(selectedEquipment).length }})
                </h3>
                <div class="details-grid">
                  <div 
                    v-for="(value, key) in selectedEquipment" 
                    :key="key"
                    class="detail-item"
                    :class="{ highlighted: isImportantField(key) }"
                  >
                    <span class="detail-label">{{ formatHeader(key) }}</span>
                    <span class="detail-value" :class="{ empty: !value && value !== 0 }">
                      {{ formatCellValue(value, key) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button @click="handleEditItem(selectedEquipment)" class="modal-action-btn edit-btn">
                <i class="pi pi-pencil"></i> Editar
              </button>
              <button @click="handleShowBarcode(selectedEquipment)" class="modal-action-btn barcode-btn">
                <i class="pi pi-qrcode"></i> Código
              </button>
              <button @click="handleRequestMaintenance(selectedEquipment)" class="modal-action-btn maint-btn">
                <i class="pi pi-wrench"></i> Mantenimiento
              </button>
              <button @click="closeDetailModal" class="modal-action-btn close-btn">
                <i class="pi pi-times"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- ═══════════════════════════════════════════════════════════════
         TOOLBAR PRINCIPAL
         ═══════════════════════════════════════════════════════════════ -->
    <div class="table-toolbar glass-panel">
      <div class="toolbar-left">
         <!-- Search Box -->
         <div class="search-box">
           <i class="pi pi-search search-icon"></i>
           <input
             v-model="searchTerm"
             type="text"
             class="global-search"
             placeholder="Buscar equipos, marcas, modelos..."
             @keydown.escape="searchTerm = ''"
             ref="searchInputRef"
           />
           <button
             v-if="searchTerm"
             @click="searchTerm = ''"
             class="search-clear"
             title="Limpiar búsqueda (Esc)"
           >
             <i class="pi pi-times"></i>
           </button>
           <button 
             @click="toggleScanMode" 
             class="scan-btn"
             :class="{ active: scanModeActive }"
             title="Modo escaneo para encontrar equipos"
           >
             <i class="pi pi-barcode"></i>
           </button>
         </div>
        
        <!-- Active Filters Badge -->
        <Transition name="badge-pop">
          <button 
            v-if="activeFiltersCount > 0" 
            class="active-filters-badge"
            @click="clearAllFilters"
            title="Clic para limpiar todos los filtros"
          >
            <i class="pi pi-filter-slash"></i>
            <span>{{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }}</span>
            <i class="pi pi-times-circle"></i>
          </button>
        </Transition>
      </div>
      
      <div class="toolbar-right">
        <button 
          @click="emit('refresh')" 
          class="toolbar-btn btn-refresh" 
          title="Actualizar datos (F5)"
        >
          <i class="pi pi-refresh"></i>
        </button>
        <button 
          @click="exportToCSV" 
          class="toolbar-btn btn-export" 
          title="Exportar a CSV"
        >
          <i class="pi pi-download"></i>
        </button>
        <button 
          @click="showColumnSelector = !showColumnSelector" 
          class="toolbar-btn btn-columns" 
          :class="{ active: showColumnSelector }"
          title="Configurar columnas visibles"
        >
          <i class="pi pi-th-large"></i>
          <span class="btn-badge" v-if="hiddenColumnsCount > 0">{{ hiddenColumnsCount }}</span>
        </button>
        
        <!-- Column Selector Dropdown -->
        <Transition name="dropdown-slide">
          <div v-if="showColumnSelector" class="column-selector-dropdown glass-panel" @click.stop>
            <div class="selector-header">
              <h4><i class="pi pi-eye"></i> Columnas Visibles</h4>
              <button @click="showColumnSelector = false" class="close-btn" title="Cerrar">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="selector-actions">
              <button @click="selectAllColumns" class="selector-action-btn">
                <i class="pi pi-check-square"></i> Todas
              </button>
              <button @click="deselectAllColumns" class="selector-action-btn">
                <i class="pi pi-stop"></i> Ninguna
              </button>
              <button @click="resetToDefaultColumns" class="selector-action-btn">
                <i class="pi pi-replay"></i> Por defecto
              </button>
            </div>
            <div class="selector-search">
              <i class="pi pi-search"></i>
              <input 
                v-model="columnSearchTerm" 
                placeholder="Buscar columna..."
                class="column-search-input"
              />
            </div>
            <div class="selector-content">
              <label
                v-for="col in filteredColumnsForSelector"
                :key="col.field"
                class="checkbox-label"
                :class="{ checked: columnVisibility[col.field] }"
              >
                <input
                  type="checkbox"
                  v-model="columnVisibility[col.field]"
                />
                <span class="checkbox-custom"></span>
                <span class="col-name">{{ col.header }}</span>
                <span v-if="isPriorityColumn(col.field)" class="priority-badge">★</span>
              </label>
            </div>
            <div class="selector-footer">
              <span class="columns-count">
                {{ visibleColumnsCount }}/{{ allColumns.length }} columnas visibles
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════
         TABLA PRINCIPAL
         ═══════════════════════════════════════════════════════════════ -->
    <div class="table-wrapper glass-panel">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando equipos biomédicos...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredData.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h3>Sin resultados</h3>
        <p v-if="searchTerm || activeFiltersCount > 0">
          No se encontraron equipos con los filtros actuales
        </p>
        <p v-else>No hay equipos disponibles</p>
        <button 
          v-if="searchTerm || activeFiltersCount > 0" 
          @click="clearAllFiltersAndSearch" 
          class="clear-filters-btn"
        >
          <i class="pi pi-filter-slash"></i> Limpiar filtros
        </button>
      </div>
      
      <!-- Data Table -->
      <div v-else class="scroll-container">
        <table class="data-table">
          <thead>
            <tr class="header-row">
              <!-- Checkbox Column -->
              <th class="checkbox-col sticky-col-left">
                <input 
                  type="checkbox" 
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
                  title="Seleccionar todo"
                />
              </th>
              
              <!-- Data Columns with Filter -->
              <th 
                v-for="col of visibleColumns"
                :key="col.field"
                class="table-header"
                :class="{ 
                  sorted: sortField === col.field,
                  filtered: hasActiveFilter(col.field)
                }"
              >
                <div class="header-content" @click="toggleSort(col.field)">
                  <span class="header-text">{{ col.header }}</span>
                  <div class="header-icons">
                    <i v-if="sortField === col.field" 
                       :class="sortOrder === 1 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"
                       class="sort-icon"
                    ></i>
                  </div>
                </div>
                
                <!-- Column Filter Button -->
                <button 
                  class="column-filter-btn"
                  :class="{ active: activeColumnFilter === col.field, 'has-filter': hasActiveFilter(col.field) }"
                  @click.stop="toggleColumnFilter(col.field)"
                  :title="hasActiveFilter(col.field) ? 'Filtro activo - clic para editar' : 'Filtrar por ' + col.header"
                >
                  <i class="pi pi-filter"></i>
                  <span v-if="hasActiveFilter(col.field)" class="filter-count">
                    {{ getFilterCount(col.field) }}
                  </span>
                </button>
                
                <!-- Column Filter Dropdown -->
                <Transition name="filter-dropdown">
                  <div 
                    v-if="activeColumnFilter === col.field" 
                    class="column-filter-dropdown"
                    @click.stop
                  >
                    <div class="filter-header">
                      <span>Filtrar: {{ col.header }}</span>
                      <button @click="activeColumnFilter = null" class="filter-close">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    
                    <div class="filter-search">
                      <i class="pi pi-search"></i>
                      <input 
                        v-model="columnFilterSearch[col.field]"
                        placeholder="Buscar valores..."
                        class="filter-search-input"
                        @keydown.stop
                      />
                    </div>
                    
                    <div class="filter-actions">
                      <button @click="selectAllFilterValues(col.field)" class="filter-action-btn">
                        <i class="pi pi-check-square"></i> Todos
                      </button>
                      <button @click="clearColumnFilter(col.field)" class="filter-action-btn">
                        <i class="pi pi-times"></i> Ninguno
                      </button>
                    </div>
                    
                    <div class="filter-options">
                      <label 
                        v-for="value in getFilteredUniqueValues(col.field)"
                        :key="value"
                        class="filter-option"
                        :class="{ selected: isFilterValueSelected(col.field, value) }"
                      >
                        <input 
                          type="checkbox"
                          :checked="isFilterValueSelected(col.field, value)"
                          @change="toggleFilterValue(col.field, value)"
                        />
                        <span class="filter-checkbox"></span>
                        <span class="filter-value">{{ value || '(Vacío)' }}</span>
                        <span class="filter-count-badge">{{ getValueCount(col.field, value) }}</span>
                      </label>
                    </div>
                    
                    <div class="filter-footer">
                      <button @click="applyAndCloseFilter(col.field)" class="apply-filter-btn">
                        <i class="pi pi-check"></i> Aplicar
                      </button>
                    </div>
                  </div>
                </Transition>
              </th>
              
              <!-- Actions Column -->
              <th class="actions-col sticky-col-right">
                <i class="pi pi-cog"></i>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr 
              v-for="(item, idx) of paginatedData" 
              :key="getItemKey(item, idx)"
              class="data-row"
              :class="{ 
                selected: isRowSelected(idx),
                ...getRowStatusClass(item)
              }"
              @click="openDetailModal(item)"
              @dblclick="handleEditItem(item)"
            >
              <!-- Checkbox -->
              <td class="checkbox-col sticky-col-left" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="isRowSelected(idx)"
                  @change="toggleRowSelect(idx)"
                  class="checkbox"
                />
              </td>
              
              <!-- Data Cells -->
              <td 
                v-for="col of visibleColumns"
                :key="col.field"
                class="data-cell"
                :class="getCellClass(col.field, item[col.field])"
                :title="String(item[col.field] || '')"
              >
                <div class="cell-content">
                  <!-- Status Badge -->
                  <template v-if="col.field === 'ESTATUS'">
                    <span class="status-badge" :class="getStatusColorClass(item[col.field])">
                      <i :class="getStatusIcon(item[col.field])"></i>
                      {{ item[col.field] || '-' }}
                    </span>
                  </template>
                  
                  <!-- Regular Cell -->
                  <template v-else>
                    {{ formatCellValue(item[col.field], col.field) }}
                  </template>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="actions-col sticky-col-right" @click.stop>
                <div class="action-buttons">
                  <button 
                    @click="openDetailModal(item)" 
                    class="action-btn view-btn"
                    title="Ver detalles"
                  >
                    <i class="pi pi-eye"></i>
                  </button>
                  <button 
                    @click="handleEditItem(item)" 
                    class="action-btn edit-btn"
                    title="Editar"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <div class="action-menu">
                    <button 
                      @click="toggleActionMenu(idx)"
                      class="action-btn menu-btn"
                      :class="{ active: openMenuIdx === idx }"
                      title="Más acciones"
                    >
                      <i class="pi pi-ellipsis-v"></i>
                    </button>
                    <Transition name="menu-pop">
                      <div v-if="openMenuIdx === idx" class="action-dropdown">
                        <button @click="handleShowBarcode(item)" class="menu-item">
                          <i class="pi pi-qrcode"></i> Código QR
                        </button>
                        <button @click="handleRequestMaintenance(item)" class="menu-item">
                          <i class="pi pi-wrench"></i> Mantenimiento
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════
         FOOTER / PAGINACIÓN
         ═══════════════════════════════════════════════════════════════ -->
    <div class="pagination-footer glass-panel">
      <div class="pagination-info">
        <span class="info-badge">
          <i class="pi pi-database"></i>
          {{ filteredData.length }} equipo{{ filteredData.length !== 1 ? 's' : '' }}
        </span>
        <span v-if="selectedRows.length > 0" class="info-badge selected">
          <i class="pi pi-check-square"></i>
          {{ selectedRows.length }} seleccionado{{ selectedRows.length !== 1 ? 's' : '' }}
        </span>
      </div>
      
      <div class="pagination-controls">
        <select v-model="internalPageSize" class="page-size-select" title="Equipos por página">
          <option :value="10">10 por pág.</option>
          <option :value="25">25 por pág.</option>
          <option :value="50">50 por pág.</option>
          <option :value="100">100 por pág.</option>
        </select>
        
        <div class="page-nav">
          <button 
            @click="goToFirstPage"
            :disabled="currentPage === 1"
            class="nav-btn"
            title="Primera página"
          >
            <i class="pi pi-angle-double-left"></i>
          </button>
          <button 
            @click="goToPrevPage"
            :disabled="currentPage === 1"
            class="nav-btn"
            title="Página anterior"
          >
            <i class="pi pi-angle-left"></i>
          </button>
          
          <div class="page-indicator">
            <input 
              type="number" 
              v-model.number="currentPage"
              :min="1"
              :max="totalPages"
              class="page-input"
              @keydown.enter="validateCurrentPage"
              @blur="validateCurrentPage"
            />
            <span class="page-separator">de</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>
          
          <button 
            @click="goToNextPage"
            :disabled="currentPage >= totalPages"
            class="nav-btn"
            title="Página siguiente"
          >
            <i class="pi pi-angle-right"></i>
          </button>
          <button 
            @click="goToLastPage"
            :disabled="currentPage >= totalPages"
            class="nav-btn"
            title="Última página"
          >
            <i class="pi pi-angle-double-right"></i>
          </button>
        </div>
        
        <span class="range-info">
          {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredData.length) }} de {{ filteredData.length }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ═══════════════════════════════════════════════════════════════
// PROPS Y EMITS
// ═══════════════════════════════════════════════════════════════
const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pageSize: { type: Number, default: 25 },
  showAllColumns: { type: Boolean, default: true }
})

const emit = defineEmits(['view-item', 'edit-item', 'show-barcode', 'refresh', 'request-maintenance'])

// ═══════════════════════════════════════════════════════════════
// COLUMNAS PRIORITARIAS (se muestran por defecto)
// ═══════════════════════════════════════════════════════════════
const priorityColumns = [
  'N_DE_INVENTARIO', 'EQUIPO_MEDICO', 'MARCA', 'MODELO', 
  'SERIE', 'UNIDAD_MEDICA', 'ESTATUS', 'SERVICIO', 'UBICACION'
]

// ═══════════════════════════════════════════════════════════════
// ESTADO REACTIVO
// ═══════════════════════════════════════════════════════════════
const searchTerm = ref('')
const sortField = ref(null)
const sortOrder = ref(1)
const currentPage = ref(1)
const internalPageSize = ref(props.pageSize)
const selectedRows = ref([])
const showColumnSelector = ref(false)
const columnSearchTerm = ref('')
const columnVisibility = ref({})

// Escaneo
const scanModeActive = ref(false)
const scanBuffer = ref('')
const scanTimeout = ref(null)
const searchInputRef = ref(null)

// Modal
const showDetailModal = ref(false)
const selectedEquipment = ref(null)

// Action Menu
const openMenuIdx = ref(null)

// Column Filters
const activeColumnFilter = ref(null)
const columnFilterSearch = ref({})
const columnFilters = ref({})

// ═══════════════════════════════════════════════════════════════
// COLUMNAS COMPUTADAS
// ═══════════════════════════════════════════════════════════════
const allColumns = computed(() => {
  if (props.showAllColumns && props.data.length > 0) {
    const dataKeys = Object.keys(props.data[0])
    return dataKeys.map(key => ({
      field: key,
      header: formatHeader(key)
    }))
  }
  return props.columns.length > 0 
    ? props.columns 
    : [
        { field: 'N_DE_INVENTARIO', header: 'No. Inventario' },
        { field: 'EQUIPO_MEDICO', header: 'Equipo' },
        { field: 'MARCA', header: 'Marca' },
        { field: 'MODELO', header: 'Modelo' },
        { field: 'SERIE', header: 'Serie' },
        { field: 'ESTATUS', header: 'Estado' }
      ]
})

const visibleColumns = computed(() => {
  return allColumns.value.filter(col => columnVisibility.value[col.field] !== false)
})

const visibleColumnsCount = computed(() => visibleColumns.value.length)

const hiddenColumnsCount = computed(() => allColumns.value.length - visibleColumns.value.length)

const filteredColumnsForSelector = computed(() => {
  if (!columnSearchTerm.value) return allColumns.value
  const search = columnSearchTerm.value.toLowerCase()
  return allColumns.value.filter(col => 
    col.header.toLowerCase().includes(search) || 
    col.field.toLowerCase().includes(search)
  )
})

// ═══════════════════════════════════════════════════════════════
// FILTRADO Y ORDENAMIENTO DE DATOS
// ═══════════════════════════════════════════════════════════════
const filteredData = computed(() => {
  let result = [...props.data]
  
  // Aplicar búsqueda global
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase().trim()
    result = result.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(search)
      )
    })
  }
  
  // Aplicar filtros de columna
  Object.keys(columnFilters.value).forEach(field => {
    const filterValues = columnFilters.value[field]
    if (filterValues && filterValues.length > 0) {
      result = result.filter(item => {
        const cellValue = String(item[field] ?? '')
        return filterValues.includes(cellValue)
      })
    }
  })
  
  // Aplicar ordenamiento
  if (sortField.value) {
    result.sort((a, b) => {
      const aVal = a[sortField.value] ?? ''
      const bVal = b[sortField.value] ?? ''
      const comparison = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
      return comparison * sortOrder.value
    })
  }
  
  return result
})

// ═══════════════════════════════════════════════════════════════
// PAGINACIÓN
// ═══════════════════════════════════════════════════════════════
const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / internalPageSize.value)))

const startIndex = computed(() => (currentPage.value - 1) * internalPageSize.value)

const endIndex = computed(() => startIndex.value + internalPageSize.value)

const paginatedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value))

// ═══════════════════════════════════════════════════════════════
// SELECCIÓN
// ═══════════════════════════════════════════════════════════════
const allSelected = computed(() => {
  if (paginatedData.value.length === 0) return false
  return paginatedData.value.every((_, idx) => selectedRows.value.includes(startIndex.value + idx))
})

const someSelected = computed(() => {
  return selectedRows.value.length > 0 && !allSelected.value
})

// ═══════════════════════════════════════════════════════════════
// FILTROS DE COLUMNA
// ═══════════════════════════════════════════════════════════════
const activeFiltersCount = computed(() => {
  return Object.values(columnFilters.value).filter(f => f && f.length > 0).length
})

function getUniqueValues(field) {
  const values = new Set()
  props.data.forEach(item => {
    values.add(String(item[field] ?? ''))
  })
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

function getFilteredUniqueValues(field) {
  const values = getUniqueValues(field)
  const search = (columnFilterSearch.value[field] || '').toLowerCase()
  if (!search) return values
  return values.filter(v => v.toLowerCase().includes(search))
}

function getValueCount(field, value) {
  return props.data.filter(item => String(item[field] ?? '') === value).length
}

function hasActiveFilter(field) {
  const filter = columnFilters.value[field]
  return filter && filter.length > 0 && filter.length < getUniqueValues(field).length
}

function getFilterCount(field) {
  return columnFilters.value[field]?.length || 0
}

function isFilterValueSelected(field, value) {
  const filter = columnFilters.value[field]
  if (!filter || filter.length === 0) return true
  return filter.includes(value)
}

function toggleFilterValue(field, value) {
  if (!columnFilters.value[field]) {
    columnFilters.value[field] = getUniqueValues(field).filter(v => v !== value)
  } else {
    const idx = columnFilters.value[field].indexOf(value)
    if (idx >= 0) {
      columnFilters.value[field].splice(idx, 1)
    } else {
      columnFilters.value[field].push(value)
    }
  }
  currentPage.value = 1
}

function selectAllFilterValues(field) {
  columnFilters.value[field] = [...getUniqueValues(field)]
  currentPage.value = 1
}

function clearColumnFilter(field) {
  columnFilters.value[field] = []
  currentPage.value = 1
}

function toggleColumnFilter(field) {
  if (activeColumnFilter.value === field) {
    activeColumnFilter.value = null
  } else {
    activeColumnFilter.value = field
    if (!columnFilters.value[field]) {
      columnFilters.value[field] = [...getUniqueValues(field)]
    }
  }
}

function applyAndCloseFilter(field) {
  activeColumnFilter.value = null
}

function clearAllFilters() {
  columnFilters.value = {}
  currentPage.value = 1
}

function clearAllFiltersAndSearch() {
  searchTerm.value = ''
  clearAllFilters()
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE ESCANEO
// ═══════════════════════════════════════════════════════════════
function toggleScanMode() {
  scanModeActive.value = !scanModeActive.value
  scanBuffer.value = ''
  if (scanModeActive.value) {
    nextTick(() => {
      if (searchInputRef.value) searchInputRef.value.focus()
    })
  }
}

function handleScanInput(e) {
  if (!scanModeActive.value) return
  
  const char = e.key
  
  // ENTER completa el escaneo
  if (char === 'Enter') {
    if (scanBuffer.value.trim()) {
      searchTerm.value = scanBuffer.value.trim()
      scanBuffer.value = ''
      scanModeActive.value = false
      
      // Esperar un poco para que la búsqueda se procese
      setTimeout(() => {
        // Buscar el equipo en la tabla filtrada
        const foundEquipment = filteredData.value[0]
        if (foundEquipment) {
          selectedEquipment.value = foundEquipment
          showDetailModal.value = true
          emit('view-item', foundEquipment)
        }
      }, 100)
      
      e.preventDefault()
    }
    return
  }
  
  // ESC cancela escaneo
  if (char === 'Escape') {
    scanModeActive.value = false
    scanBuffer.value = ''
    searchTerm.value = ''
    return
  }
  
  // Caracteres imprimibles al buffer
  if (char.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    scanBuffer.value += char
    clearTimeout(scanTimeout.value)
    scanTimeout.value = setTimeout(() => {
      if (scanBuffer.value.trim()) {
        searchTerm.value = scanBuffer.value.trim()
        
        // Buscar automáticamente después de 1.5s
        setTimeout(() => {
          const foundEquipment = filteredData.value[0]
          if (foundEquipment) {
            selectedEquipment.value = foundEquipment
            showDetailModal.value = true
            emit('view-item', foundEquipment)
            scanModeActive.value = false
          }
        }, 100)
      }
      scanBuffer.value = ''
    }, 1500)
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE COLUMNAS
// ═══════════════════════════════════════════════════════════════
function initializeColumnVisibility() {
  const visibility = {}
  allColumns.value.forEach(col => {
    if (props.showAllColumns) {
      visibility[col.field] = priorityColumns.includes(col.field)
    } else {
      visibility[col.field] = true
    }
  })
  columnVisibility.value = visibility
}

function selectAllColumns() {
  allColumns.value.forEach(col => {
    columnVisibility.value[col.field] = true
  })
}

function deselectAllColumns() {
  allColumns.value.forEach(col => {
    columnVisibility.value[col.field] = false
  })
}

function resetToDefaultColumns() {
  initializeColumnVisibility()
}

function isPriorityColumn(field) {
  return priorityColumns.includes(field)
}

// ═══════════════════════════════════════════════════════════════
// FORMATEO
// ═══════════════════════════════════════════════════════════════
function formatHeader(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function formatCellValue(value, field) {
  if (value === null || value === undefined || value === '') return '-'
  
  // Formatear fechas
  if (field?.toLowerCase().includes('fecha') || field?.toLowerCase().includes('date')) {
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch (e) {}
  }
  
  // Truncar valores muy largos
  const str = String(value)
  return str.length > 50 ? str.substring(0, 47) + '...' : str
}

function isImportantField(key) {
  const important = ['N_DE_INVENTARIO', 'EQUIPO_MEDICO', 'MARCA', 'MODELO', 'SERIE', 'ESTATUS', 'SERVICIO']
  return important.includes(key)
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS DINÁMICOS
// ═══════════════════════════════════════════════════════════════
const containerThemeClass = computed(() => {
  if (!props.data || props.data.length === 0) return ''
  
  const statusCounts = {}
  props.data.forEach(item => {
    const status = normalizeStatus(item.ESTATUS)
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  
  const dominant = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  return dominant ? `theme-${dominant}` : 'theme-available'
})

function normalizeStatus(status) {
  if (!status) return 'unknown'
  const s = String(status).toLowerCase().trim()
  if (s.includes('disponible') || s.includes('activo') || s.includes('bueno')) return 'available'
  if (s.includes('manten') || s.includes('reparac')) return 'maintenance'
  if (s.includes('baja') || s.includes('fuera') || s.includes('inactivo')) return 'unavailable'
  if (s.includes('obsoleto') || s.includes('desecho')) return 'retired'
  return 'available'
}

function getStatusColorClass(status) {
  return `status-${normalizeStatus(status)}`
}

function getStatusIcon(status) {
  const normalized = normalizeStatus(status)
  const icons = {
    available: 'pi pi-check-circle',
    maintenance: 'pi pi-wrench',
    unavailable: 'pi pi-times-circle',
    retired: 'pi pi-ban',
    unknown: 'pi pi-question-circle'
  }
  return icons[normalized] || icons.unknown
}

function getRowStatusClass(item) {
  const status = normalizeStatus(item.ESTATUS)
  return { [`row-${status}`]: true }
}

function getCellClass(field, value) {
  const classes = []
  if (field === 'N_DE_INVENTARIO') classes.push('cell-inventory')
  if (field === 'EQUIPO_MEDICO') classes.push('cell-equipment')
  if (field === 'MARCA') classes.push('cell-brand')
  return classes
}

// ═══════════════════════════════════════════════════════════════
// ORDENAMIENTO
// ═══════════════════════════════════════════════════════════════
function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value * -1
  } else {
    sortField.value = field
    sortOrder.value = 1
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGINACIÓN
// ═══════════════════════════════════════════════════════════════
function goToFirstPage() { currentPage.value = 1 }
function goToPrevPage() { if (currentPage.value > 1) currentPage.value-- }
function goToNextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function goToLastPage() { currentPage.value = totalPages.value }
function validateCurrentPage() {
  if (currentPage.value < 1) currentPage.value = 1
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
}

// ═══════════════════════════════════════════════════════════════
// SELECCIÓN
// ═══════════════════════════════════════════════════════════════
function isRowSelected(idx) {
  return selectedRows.value.includes(startIndex.value + idx)
}

function toggleRowSelect(idx) {
  const globalIdx = startIndex.value + idx
  const pos = selectedRows.value.indexOf(globalIdx)
  if (pos >= 0) {
    selectedRows.value.splice(pos, 1)
  } else {
    selectedRows.value.push(globalIdx)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    paginatedData.value.forEach((_, idx) => {
      const globalIdx = startIndex.value + idx
      const pos = selectedRows.value.indexOf(globalIdx)
      if (pos >= 0) selectedRows.value.splice(pos, 1)
    })
  } else {
    paginatedData.value.forEach((_, idx) => {
      const globalIdx = startIndex.value + idx
      if (!selectedRows.value.includes(globalIdx)) {
        selectedRows.value.push(globalIdx)
      }
    })
  }
}

// ═══════════════════════════════════════════════════════════════
// MODAL DE DETALLES
// ═══════════════════════════════════════════════════════════════
function openDetailModal(item) {
  selectedEquipment.value = { ...item }
  showDetailModal.value = true
  closeActionMenu()
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedEquipment.value = null
}

// ═══════════════════════════════════════════════════════════════
// MENÚ DE ACCIONES
// ═══════════════════════════════════════════════════════════════
function toggleActionMenu(idx) {
  openMenuIdx.value = openMenuIdx.value === idx ? null : idx
}

function closeActionMenu() {
  openMenuIdx.value = null
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS DE ACCIONES
// ═══════════════════════════════════════════════════════════════
function handleEditItem(item) {
  emit('edit-item', item)
  closeDetailModal()
  closeActionMenu()
}

function handleShowBarcode(item) {
  emit('show-barcode', item)
  closeDetailModal()
  closeActionMenu()
}

function handleRequestMaintenance(item) {
  emit('request-maintenance', item)
  closeDetailModal()
  closeActionMenu()
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR CSV
// ═══════════════════════════════════════════════════════════════
function exportToCSV() {
  const headers = visibleColumns.value.map(c => c.header)
  const rows = filteredData.value.map(item => 
    visibleColumns.value.map(c => `"${String(item[c.field] || '').replace(/"/g, '""')}"`)
  )
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `equipos_biomedicos_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════
function getItemKey(item, idx) {
  return item.N_DE_INVENTARIO || item.id || item.ID || idx
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (showDetailModal.value) {
      closeDetailModal()
    } else if (activeColumnFilter.value) {
      activeColumnFilter.value = null
    } else if (showColumnSelector.value) {
      showColumnSelector.value = false
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CLICK OUTSIDE HANDLERS
// ═══════════════════════════════════════════════════════════════
function handleClickOutside(e) {
  // Close action menu
  if (openMenuIdx.value !== null) {
    const actionMenu = e.target.closest('.action-menu')
    if (!actionMenu) {
      closeActionMenu()
    }
  }
  
  // Close column filter
  if (activeColumnFilter.value !== null) {
    const filterDropdown = e.target.closest('.column-filter-dropdown')
    const filterBtn = e.target.closest('.column-filter-btn')
    if (!filterDropdown && !filterBtn) {
      activeColumnFilter.value = null
    }
  }
  
  // Close column selector
  if (showColumnSelector.value) {
    const selector = e.target.closest('.column-selector-dropdown')
    const btn = e.target.closest('.btn-columns')
    if (!selector && !btn) {
      showColumnSelector.value = false
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// WATCHERS
// ═══════════════════════════════════════════════════════════════
watch(() => props.data, () => {
  currentPage.value = 1
  selectedRows.value = []
  initializeColumnVisibility()
}, { deep: true })

watch(() => props.columns, initializeColumnVisibility, { immediate: true })

watch(filteredData, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════
onMounted(() => {
  initializeColumnVisibility()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
  
  // Agregar listener para escaneo
  if (searchInputRef.value) {
    searchInputRef.value.addEventListener('keydown', handleScanInput)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
  
  // Remover listener de escaneo
  if (searchInputRef.value) {
    searchInputRef.value.removeEventListener('keydown', handleScanInput)
  }
  clearTimeout(scanTimeout.value)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   CSS VARIABLES - DARK LIQUID GLASS THEME
   ═══════════════════════════════════════════════════════════════ */
:root {
  --glass-bg: rgba(15, 23, 42, 0.85);
  --glass-border: rgba(59, 130, 246, 0.2);
  --glass-glow: rgba(59, 130, 246, 0.15);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --status-available: #22c55e;
  --status-maintenance: #f59e0b;
  --status-unavailable: #ef4444;
  --status-retired: #6b7280;
}

/* ═══════════════════════════════════════════════════════════════
   CONTAINER PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
.biomedical-table-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  border-radius: 16px;
  min-height: 500px;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* Ambient Glow */
.ambient-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, var(--glass-glow) 0%, transparent 50%);
  pointer-events: none;
  opacity: 0.5;
  animation: ambient-pulse 8s ease-in-out infinite;
}

@keyframes ambient-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

/* Theme Variations */
.theme-available .ambient-glow { background: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 50%); }
.theme-maintenance .ambient-glow { background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 50%); }
.theme-unavailable .ambient-glow { background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 50%); }
.theme-retired .ambient-glow { background: radial-gradient(circle, rgba(107, 114, 128, 0.15) 0%, transparent 50%); }

/* Glass Panel Effect */
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* ═══════════════════════════════════════════════════════════════
   TOOLBAR
   ═══════════════════════════════════════════════════════════════ */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  position: relative;
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.25);
  border-radius: 10px;
  padding: 0 12px;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 500px;
}

.search-box:focus-within {
  border-color: var(--accent-blue);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
  background: rgba(30, 41, 59, 0.95);
}

.search-icon {
  color: var(--accent-cyan);
  font-size: 1rem;
}

.global-search {
  flex: 1;
  min-width: 0;
  padding: 12px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.global-search::placeholder {
  color: var(--text-muted);
}

.search-clear {
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.search-clear:hover {
  background: rgba(248, 113, 113, 0.2);
  transform: rotate(90deg);
}

.scan-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.scan-btn:hover {
  color: #0ea5e9;
  transform: scale(1.1);
}

.scan-btn.active {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  animation: pulse-scan 1.5s ease-in-out infinite;
}

@keyframes pulse-scan {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Active Filters Badge */
.active-filters-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2));
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.active-filters-badge:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3));
  transform: scale(1.02);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.toolbar-btn {
  position: relative;
  padding: 10px 14px;
  background: rgba(59, 130, 246, 0.1);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: #93c5fd;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.toolbar-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: var(--accent-blue);
}

.btn-refresh:hover { color: var(--accent-cyan); }
.btn-export:hover { color: #fbbf24; }
.btn-columns:hover { color: #a78bfa; }

.btn-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════
   COLUMN SELECTOR DROPDOWN
   ═══════════════════════════════════════════════════════════════ */
.column-selector-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  padding: 16px;
  min-width: 280px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--glass-border);
}

.selector-header h4 {
  margin: 0;
  color: #93c5fd;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-header h4 i {
  color: var(--accent-blue);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  transform: rotate(90deg);
}

.selector-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.selector-action-btn {
  flex: 1;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.selector-action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.selector-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  margin-bottom: 10px;
}

.selector-search i {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.column-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.selector-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 8px;
}

.selector-content::-webkit-scrollbar {
  width: 4px;
}

.selector-content::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.checkbox-label:hover {
  background: rgba(59, 130, 246, 0.1);
  color: var(--text-primary);
}

.checkbox-label.checked {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.col-name {
  flex: 1;
  font-size: 0.85rem;
}

.priority-badge {
  color: #fbbf24;
  font-size: 0.75rem;
}

.selector-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--glass-border);
}

.columns-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════════════════════════
   TABLE WRAPPER
   ═══════════════════════════════════════════════════════════════ */
.table-wrapper {
  flex: 1;
  min-height: 350px;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner i {
  font-size: 3rem;
  color: var(--accent-blue);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 12px;
  color: var(--text-secondary);
  padding: 40px;
}

.empty-state i {
  font-size: 4rem;
  opacity: 0.3;
  color: var(--accent-blue);
}

.empty-state h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  text-align: center;
}

.clear-filters-btn {
  margin-top: 12px;
  padding: 10px 20px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #93c5fd;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

/* Scroll Container */
.scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 500px;
}

.scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.4);
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.6);
}

/* ═══════════════════════════════════════════════════════════════
   DATA TABLE
   ═══════════════════════════════════════════════════════════════ */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

/* Header Row */
.header-row {
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%);
  position: sticky;
  top: 0;
  z-index: 20;
}

.table-header {
  padding: 14px 16px;
  text-align: left;
  color: #93c5fd;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  border-right: 1px solid rgba(59, 130, 246, 0.1);
  min-width: 130px;
  position: relative;
  white-space: nowrap;
}

.table-header.sorted {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.table-header.filtered {
  background: rgba(245, 158, 11, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  padding-right: 28px;
}

.header-content:hover {
  color: white;
}

.header-text {
  flex: 1;
}

.sort-icon {
  color: #fbbf24;
  font-size: 0.75rem;
}

/* Column Filter Button */
.column-filter-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 6px;
  font-size: 0.75rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.column-filter-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.column-filter-btn.active {
  background: var(--accent-blue);
  color: white;
}

.column-filter-btn.has-filter {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.filter-count {
  background: rgba(0, 0, 0, 0.3);
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
}

/* Column Filter Dropdown */
.column-filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  min-width: 220px;
  max-height: 350px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  margin-top: 4px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  font-weight: 600;
  font-size: 0.85rem;
}

.filter-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.filter-close:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.filter-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 6px;
}

.filter-search i {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.filter-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.filter-actions {
  display: flex;
  gap: 6px;
  padding: 0 12px 8px;
}

.filter-action-btn {
  flex: 1;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 5px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.filter-action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.filter-options {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  max-height: 180px;
}

.filter-options::-webkit-scrollbar {
  width: 4px;
}

.filter-options::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.filter-option:hover {
  background: rgba(59, 130, 246, 0.1);
  color: var(--text-primary);
}

.filter-option.selected {
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
}

.filter-option input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 3px;
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
}

.filter-option input[type="checkbox"]:checked {
  background: var(--status-available);
  border-color: var(--status-available);
}

.filter-option input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.filter-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-count-badge {
  background: rgba(59, 130, 246, 0.2);
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.filter-footer {
  padding: 10px 12px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.apply-filter-btn {
  width: 100%;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Checkbox Column */
.checkbox-col {
  width: 50px;
  min-width: 50px;
  padding: 12px;
  text-align: center;
  background: rgba(30, 41, 59, 0.6);
}

.sticky-col-left {
  position: sticky;
  left: 0;
  z-index: 15;
}

/* Actions Column */
.actions-col {
  width: 120px;
  min-width: 120px;
  padding: 8px 12px;
  text-align: center;
  background: rgba(30, 41, 59, 0.6);
}

.sticky-col-right {
  position: sticky;
  right: 0;
  z-index: 15;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-blue);
}

/* Data Rows */
.data-row {
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
}

.data-row:hover {
  background: rgba(59, 130, 246, 0.08);
}

.data-row.selected {
  background: rgba(59, 130, 246, 0.15);
}

/* Row Status Classes */
.data-row.row-available {
  border-left: 4px solid var(--status-available);
}

.data-row.row-maintenance {
  border-left: 4px solid var(--status-maintenance);
  background: rgba(245, 158, 11, 0.03);
}

.data-row.row-unavailable {
  border-left: 4px solid var(--status-unavailable);
}

.data-row.row-retired {
  border-left: 4px solid var(--status-retired);
  opacity: 0.7;
}

/* Data Cells */
.data-cell {
  padding: 12px 16px;
  color: var(--text-secondary);
  border-right: 1px solid rgba(59, 130, 246, 0.05);
  max-width: 200px;
}

.cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-inventory {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--accent-cyan);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.cell-equipment {
  color: #60a5fa;
  font-weight: 500;
}

.cell-brand {
  color: #a78bfa;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.status-maintenance {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
  animation: pulse-maintenance 2s ease-in-out infinite;
}

@keyframes pulse-maintenance {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-badge.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.status-retired {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  padding: 6px 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  transform: scale(1.1);
}

.action-btn.view-btn:hover { color: var(--accent-cyan); }
.action-btn.edit-btn:hover { color: #fbbf24; }
.action-btn.menu-btn.active { background: var(--accent-blue); color: white; }

.action-menu {
  position: relative;
}

.action-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 6px;
  min-width: 150px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.15);
  color: var(--text-primary);
}

.menu-item i {
  width: 18px;
  color: var(--text-muted);
}

.menu-item:hover i {
  color: var(--accent-blue);
}

/* ═══════════════════════════════════════════════════════════════
   PAGINATION FOOTER
   ═══════════════════════════════════════════════════════════════ */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}

.info-badge i {
  color: var(--accent-blue);
}

.info-badge.selected {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.info-badge.selected i {
  color: var(--status-available);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-size-select {
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.page-size-select:hover,
.page-size-select:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-btn {
  padding: 8px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--accent-blue);
  color: #93c5fd;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.page-input {
  width: 50px;
  padding: 6px 8px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  color: var(--text-primary);
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.page-input:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.page-separator {
  color: var(--text-muted);
}

.total-pages {
  color: var(--text-secondary);
  font-weight: 600;
}

.range-info {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL DE DETALLES DEL EQUIPO
   ═══════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  animation: modal-enter 0.3s ease-out;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon-wrap {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
}

.modal-icon-wrap.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.modal-icon-wrap.status-maintenance {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.modal-icon-wrap.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.modal-icon-wrap.status-retired {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
}

.modal-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-cyan);
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', monospace;
}

.modal-close-btn {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #f87171;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

/* Status Banner in Modal */
.status-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.status-banner.status-available {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-banner.status-maintenance {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-banner.status-unavailable {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-banner.status-retired {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1));
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Quick Info Grid */
.quick-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 10px;
  transition: all 0.2s;
}

.info-card:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(59, 130, 246, 0.3);
}

.info-card i {
  font-size: 1.3rem;
  color: var(--accent-blue);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* Details Section */
.details-section {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  color: #93c5fd;
  font-size: 1rem;
  font-weight: 600;
}

.section-title i {
  color: var(--accent-blue);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  transition: all 0.2s;
}

.detail-item:hover {
  background: rgba(15, 23, 42, 0.8);
}

.detail-item.highlighted {
  border-left: 3px solid var(--accent-blue);
}

.detail-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  word-break: break-word;
}

.detail-value.empty {
  color: var(--text-muted);
  font-style: italic;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  flex-wrap: wrap;
}

.modal-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-action-btn.edit-btn {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.modal-action-btn.edit-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-2px);
}

.modal-action-btn.barcode-btn {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.modal-action-btn.barcode-btn:hover {
  background: rgba(168, 85, 247, 0.25);
  transform: translateY(-2px);
}

.modal-action-btn.maint-btn {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.3);
  color: #fb923c;
}

.modal-action-btn.maint-btn:hover {
  background: rgba(249, 115, 22, 0.25);
  transform: translateY(-2px);
}

.modal-action-btn.close-btn {
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(100, 116, 139, 0.3);
  color: var(--text-secondary);
}

.modal-action-btn.close-btn:hover {
  background: rgba(100, 116, 139, 0.25);
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITIONS & ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
}

/* Dropdown Slide */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.2s ease;
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Filter Dropdown */
.filter-dropdown-enter-active,
.filter-dropdown-leave-active {
  transition: all 0.2s ease;
}

.filter-dropdown-enter-from,
.filter-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Menu Pop */
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: all 0.15s ease;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Badge Pop */
.badge-pop-enter-active,
.badge-pop-leave-active {
  transition: all 0.2s ease;
}

.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE DESIGN
   ═══════════════════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .biomedical-table-container {
    padding: 16px;
    gap: 12px;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .search-box {
    max-width: none;
    width: 100%;
  }

  .toolbar-right {
    justify-content: flex-end;
  }

  .pagination-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    margin: 10px;
  }

  .quick-info-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-action-btn {
    width: 100%;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }

  .action-btn {
    padding: 4px 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .biomedical-table-container {
    padding: 12px;
  }

  .data-table {
    font-size: 0.8rem;
  }

  .table-header,
  .data-cell {
    padding: 10px 12px;
    min-width: 100px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-title {
    font-size: 1.1rem;
  }
}
</style>