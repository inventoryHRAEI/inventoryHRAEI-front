<template>
  <div class="biomedical-table-container">
    <!-- Enhanced Toolbar -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input 
            v-model="globalFilter" 
            placeholder="Buscar equipos, marcas, modelos..."
            class="global-search"
            @input="debounceSearch"
          />
          <button v-if="globalFilter" class="search-clear" @click="globalFilter = ''" type="button">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <button 
          @click="refreshData"
          class="toolbar-btn btn-refresh"
          title="Actualizar datos"
        >
          <i class="pi pi-refresh"></i>
        </button>
        <button 
          @click="exportCSV"
          class="toolbar-btn btn-export"
          title="Descargar CSV"
        >
          <i class="pi pi-download"></i>
        </button>
        <button 
          @click="toggleColumnSelector"
          class="toolbar-btn btn-columns"
          title="Mostrar/ocultar columnas"
        >
          <i class="pi pi-sliders-v"></i>
        </button>
        <div class="column-selector-dropdown" v-if="showColumnSelector">
          <div class="selector-header">
            <h4><i class="pi pi-check"></i> Columnas</h4>
            <button @click="toggleColumnSelector" class="close-btn">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="selector-content">
            <label v-for="col of allColumns" :key="col.field" class="checkbox-label">
              <input 
                type="checkbox" 
                :checked="columnVisibility[col.field] !== false"
                @change="(e) => toggleColumn(col.field, e.target.checked)"
              />
              <span class="col-name">{{ col.header }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Wrapper -->
    <div class="table-wrapper">
      <div v-if="loading" class="loading-state">
        <div class="spinner-icon">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando equipos...</p>
      </div>

      <div v-else-if="paginatedData.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h3>Sin equipos</h3>
        <p>{{ globalFilter ? 'Sin resultados' : 'No disponible' }}</p>
      </div>

      <div v-else class="scroll-container">
        <table class="data-table">
          <thead>
            <tr class="header-row">
              <th class="checkbox-col sticky-col-left">
                <input 
                  type="checkbox" 
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
                />
              </th>
              <th 
                v-for="col of visibleColumns"
                :key="col.field"
                class="table-header"
                :class="{ 'sorted': sortField === col.field }"
                @click="toggleSort(col.field)"
              >
                {{ col.header }}
                <i v-if="sortField === col.field" :class="sortOrder === 1 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
              </th>
              <th class="actions-col sticky-col-right">
                <i class="pi pi-sliders-h"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(item, idx) of paginatedData" 
              :key="getItemKey(item)"
              class="data-row"
              :class="{ 
                'selected': selectedRows.includes(startIndex + idx),
                [getStatusClass(item)]: true
              }"
            >
              <td class="checkbox-col sticky-col-left">
                <input 
                  type="checkbox" 
                  :checked="selectedRows.includes(startIndex + idx)"
                  @change="toggleRowSelect(startIndex + idx)"
                  class="checkbox"
                />
              </td>
              <td 
                v-for="col of visibleColumns"
                :key="col.field"
                class="data-cell"
                :class="getCellClass(col.field)"
              >
                <div class="cell-wrapper">
                  <span v-if="col.field === 'ESTATUS'" class="status-badge" :class="getStatusClass(item)">
                    <i :class="getStatusIcon(item)"></i>
                    {{ getStatusLabel(item) }}
                  </span>
                  <span v-else>{{ displayValue(item[col.field]) }}</span>
                </div>
              </td>
              <td class="actions-col sticky-col-right">
                <div class="action-menu" @click.stop>
                  <button class="menu-trigger" @click="toggleMenu(idx)" title="Acciones">
                    <i class="pi pi-ellipsis-v"></i>
                  </button>
                  <div v-if="activeMenu === idx" class="menu-dropdown">
                    <button class="menu-item view" @click="onViewItem(item); activeMenu = null" title="Ver historial">
                      <i class="pi pi-eye"></i> Ver
                    </button>
                    <button class="menu-item edit" @click="onEditItem(item); activeMenu = null" title="Editar">
                      <i class="pi pi-pencil"></i> Editar
                    </button>
                    <button class="menu-item barcode" @click="onShowBarcode(item); activeMenu = null" title="Código">
                      <i class="pi pi-barcode"></i> Código
                    </button>
                    <button class="menu-item maintenance" @click="onRequestMaintenance(item); activeMenu = null" title="Mantenimiento">
                      <i class="pi pi-wrench"></i> Manto.
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div class="pagination-footer">
      <div class="pagination-info">
        <span class="info-badge">
          <i class="pi pi-list"></i> {{ filteredData.length }}
        </span>
        <span v-if="selectedRows.length > 0" class="info-badge selected">
          <i class="pi pi-check-circle"></i> {{ selectedRows.length }}
        </span>
      </div>

      <div class="pagination-controls">
        <select v-model.number="pageSize" class="page-size-select">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>

        <button 
          @click="previousPage"
          :disabled="currentPage === 1"
          class="pag-btn"
        >
          <i class="pi pi-chevron-left"></i>
        </button>
        
        <input 
          v-model.number="currentPage" 
          type="number"
          min="1"
          :max="totalPages"
          class="page-input"
          @change="validatePageInput"
        />
        
        <span class="page-info">/ {{ totalPages }}</span>

        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages || totalPages === 0"
          class="pag-btn"
        >
          <i class="pi pi-chevron-right"></i>
        </button>

        <span class="range-info">{{ startIndex + 1 }}-{{ endIndex }} de {{ filteredData.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pageSize: { type: Number, default: 25 }
})

const emit = defineEmits(['view-item', 'edit-item', 'show-barcode', 'refresh', 'request-maintenance'])

const globalFilter = ref('')
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(props.pageSize)
const sortField = ref('No DE INVENTARIO')
const sortOrder = ref(1)
const showColumnSelector = ref(false)
const activeMenu = ref(null)
const filterTimeout = ref(null)
const columnVisibility = ref({})

const initializeColumnVisibility = () => {
  const visibility = {}
  props.columns.forEach(col => {
    visibility[col.field] = col.visible !== false
  })
  columnVisibility.value = visibility
}

const allColumns = computed(() => props.columns)
const visibleColumns = computed(() => 
  props.columns.filter(col => columnVisibility.value[col.field] !== false)
)

const filteredData = computed(() => {
  if (!globalFilter.value) return props.data
  const query = globalFilter.value.toLowerCase()
  return props.data.filter(item => 
    visibleColumns.value.some(col => {
      const value = item[col.field]
      return value && String(value).toLowerCase().includes(query)
    })
  )
})

const sortedData = computed(() => {
  const sorted = [...filteredData.value]
  if (sortField.value) {
    sorted.sort((a, b) => {
      const aVal = a[sortField.value] ?? ''
      const bVal = b[sortField.value] ?? ''
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder.value === 1 ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortOrder.value === 1 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }
  return sorted
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredData.value.length))
const paginatedData = computed(() => sortedData.value.slice(startIndex.value, endIndex.value))
const allSelected = computed(() => paginatedData.value.length > 0 && selectedRows.value.length === paginatedData.value.length)

const getStatusClass = (item) => {
  const status = (item.ESTATUS || '').toUpperCase()
  if (status.includes('MANTENIMIENTO')) return 'status-maintenance'
  if (status.includes('DISPONIBLE')) return 'status-available'
  if (status.includes('RETIRADO')) return 'status-retired'
  return 'status-unavailable'
}

const getStatusIcon = (item) => {
  const status = getStatusClass(item)
  const icons = {
    'status-available': 'pi pi-check-circle',
    'status-maintenance': 'pi pi-cog',
    'status-unavailable': 'pi pi-exclamation-circle',
    'status-retired': 'pi pi-times-circle'
  }
  return icons[status] || 'pi pi-question-circle'
}

const getStatusLabel = (item) => (item.ESTATUS || 'Sin estado').trim()

const getCellClass = (field) => {
  if (field === 'EQUIPO MEDICO') return 'cell-equipment'
  if (field === 'No DE INVENTARIO') return 'cell-inventory'
  if (field === 'MARCA') return 'cell-brand'
  return ''
}

const debounceSearch = () => {
  clearTimeout(filterTimeout.value)
  filterTimeout.value = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 1 ? -1 : 1
  } else {
    sortField.value = field
    sortOrder.value = 1
  }
}

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedRows.value = paginatedData.value.map((_, i) => startIndex.value + i)
  } else {
    selectedRows.value = []
  }
}

const toggleRowSelect = (idx) => {
  const index = selectedRows.value.indexOf(idx)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(idx)
  }
}

const toggleColumn = (field, visible) => {
  columnVisibility.value[field] = visible
}

const toggleColumnSelector = () => {
  showColumnSelector.value = !showColumnSelector.value
}

const toggleMenu = (idx) => {
  activeMenu.value = activeMenu.value === idx ? null : idx
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const validatePageInput = () => {
  if (currentPage.value < 1) currentPage.value = 1
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
}

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const getItemKey = (item) => item['No DE INVENTARIO'] || JSON.stringify(item)

const refreshData = () => emit('refresh')

const exportCSV = () => {
  const headers = visibleColumns.value.map(col => col.header).join(',')
  const rows = filteredData.value.map(item =>
    visibleColumns.value.map(col => {
      const value = item[col.field] || ''
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `equipos-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const onViewItem = (item) => emit('view-item', item)
const onEditItem = (item) => emit('edit-item', item)
const onShowBarcode = (item) => emit('show-barcode', item)
const onRequestMaintenance = (item) => emit('request-maintenance', item)

watch(() => props.data, () => { currentPage.value = 1; selectedRows.value = [] })
watch(() => props.columns, initializeColumnVisibility, { immediate: true })
</script>

<style scoped>
.biomedical-table-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1a2844 100%);
  border-radius: 12px;
  min-height: 400px;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Toolbar */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 0;
}

.toolbar-left {
  flex: 1;
  min-width: 250px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.7);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-box i {
  padding: 0 10px;
  color: #60a5fa;
  pointer-events: none;
}

.global-search {
  flex: 1;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.95rem;
  outline: none;
}

.global-search::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.search-clear {
  background: none;
  border: none;
  padding: 0 10px;
  color: #f87171;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-clear:hover {
  transform: rotate(90deg);
}

.toolbar-right {
  display: flex;
  gap: 6px;
  position: relative;
}

.toolbar-btn {
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.15);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #bfdbfe;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.btn-refresh:hover { color: #06b6d4; }
.btn-export:hover { color: #fbbf24; }
.btn-columns:hover { color: #a78bfa; }

/* Column Selector */
.column-selector-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  padding: 10px;
  min-width: 260px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  margin-top: 6px;
  backdrop-filter: blur(10px);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.selector-header h4 {
  margin: 0;
  color: #bfdbfe;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.selector-header h4 i {
  color: #3b82f6;
}

.close-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #f87171;
  transform: rotate(90deg);
}

.selector-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #cbd5e1;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.checkbox-label:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #bfdbfe;
}

.checkbox-label input {
  cursor: pointer;
  accent-color: #3b82f6;
  width: 16px;
  height: 16px;
}

.col-name {
  flex: 1;
}

/* Table Wrapper */
.table-wrapper {
  flex: 1;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  overflow: hidden;
  display: flex;
  align-items: stretch;
  min-height: 300px;
  position: relative;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  color: #cbd5e1;
}

.spinner-icon {
  font-size: 2.5rem;
  color: #3b82f6;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #94a3b8;
  gap: 8px;
}

.empty-state i {
  font-size: 2.5rem;
  opacity: 0.3;
}

.empty-state h3 {
  margin: 0;
  color: #cbd5e1;
  font-size: 1.1rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Scroll Container */
.scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
}

.scroll-container::-webkit-scrollbar {
  height: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
}

.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  font-size: 0.9rem;
  white-space: nowrap;
}

.header-row {
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.3) 0%, rgba(30, 41, 59, 0.2) 100%);
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-header {
  padding: 12px 14px;
  text-align: left;
  color: #bfdbfe;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  border-right: 1px solid rgba(59, 130, 246, 0.1);
  min-width: 120px;
}

.table-header:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #fff;
}

.table-header.sorted {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.table-header i {
  margin-left: 6px;
  font-size: 0.75rem;
  color: #fbbf24;
}

.checkbox-col {
  width: 40px;
  min-width: 40px;
  padding: 12px;
  text-align: center;
}

.actions-col {
  width: 50px;
  min-width: 50px;
  padding: 12px;
  text-align: center;
}

.sticky-col-left {
  position: sticky;
  left: 0;
  z-index: 9;
  background: rgba(30, 41, 59, 0.5);
}

.sticky-col-right {
  position: sticky;
  right: 0;
  z-index: 9;
  background: rgba(30, 41, 59, 0.5);
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
  border-radius: 4px;
}

.data-row {
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  transition: all 0.2s ease;
}

.data-row:hover {
  background: rgba(59, 130, 246, 0.08);
}

.data-row.selected {
  background: rgba(59, 130, 246, 0.15);
}

/* Status Row Classes */
.data-row.status-available {
  border-left: 3px solid #22c55e;
}

.data-row.status-available:hover {
  background: rgba(34, 197, 94, 0.06);
}

.data-row.status-maintenance {
  border-left: 3px solid #f97316;
  background: rgba(249, 115, 22, 0.03);
}

.data-row.status-maintenance:hover {
  background: rgba(249, 115, 22, 0.08);
}

.data-row.status-unavailable {
  border-left: 3px solid #ef4444;
}

.data-row.status-unavailable:hover {
  background: rgba(239, 68, 68, 0.06);
}

.data-row.status-retired {
  opacity: 0.7;
  border-left: 3px solid #94a3b8;
}

.data-row.status-retired:hover {
  background: rgba(148, 163, 184, 0.06);
}

.data-cell {
  padding: 12px 14px;
  color: #cbd5e1;
  border-right: 1px solid rgba(59, 130, 246, 0.05);
  max-width: 250px;
}

.cell-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-maintenance {
  background: rgba(249, 115, 22, 0.2);
  color: #fdba74;
  border: 1px solid rgba(249, 115, 22, 0.3);
  animation: pulse-warn 2s ease-in-out infinite;
}

@keyframes pulse-warn {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-retired {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.cell-inventory {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #38bdf8;
  letter-spacing: 1px;
}

.cell-equipment {
  color: #60a5fa;
  font-weight: 500;
}

.cell-brand {
  color: #a78bfa;
  font-weight: 500;
}

/* Actions */
.action-menu {
  position: relative;
}

.menu-trigger {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.menu-trigger:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  padding: 4px;
  min-width: 140px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  text-align: left;
  white-space: nowrap;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.2);
}

.menu-item i {
  width: 16px;
  flex-shrink: 0;
}

.menu-item.view:hover { color: #06b6d4; }
.menu-item.edit:hover { color: #fbbf24; }
.menu-item.barcode:hover { color: #a78bfa; }
.menu-item.maintenance:hover { color: #f97316; }

/* Pagination Footer */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(30, 58, 138, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  gap: 8px;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 600;
}

.info-badge i {
  color: #60a5fa;
}

.info-badge.selected {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.info-badge.selected i {
  color: #22c55e;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.page-size-select {
  padding: 6px 10px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  color: #bfdbfe;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.page-size-select:hover,
.page-size-select:focus {
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 0.8);
  outline: none;
}

.pag-btn {
  padding: 6px 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  color: #bfdbfe;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;
}

.pag-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
  color: #60a5fa;
}

.pag-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-input {
  width: 45px;
  padding: 6px 8px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  color: #bfdbfe;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.page-input:hover,
.page-input:focus {
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 0.8);
  outline: none;
}

.page-info {
  color: #cbd5e1;
  font-size: 0.85rem;
}

.range-info {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .biomedical-table-container {
    padding: 12px;
  }

  .table-toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .toolbar-left {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .pagination-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .data-table {
    font-size: 0.8rem;
  }

  .data-cell,
  .table-header {
    padding: 8px 10px;
  }

  .table-header {
    min-width: 90px;
  }

  .menu-dropdown {
    min-width: 120px;
  }

  .menu-item {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .data-table {
    font-size: 0.75rem;
  }

  .data-cell,
  .table-header {
    padding: 6px 8px;
    min-width: 70px;
  }

  .menu-dropdown {
    min-width: 110px;
  }

  .menu-item {
    padding: 5px 8px;
    font-size: 0.7rem;
  }

  .checkbox-col,
  .actions-col {
    width: 35px;
    min-width: 35px;
  }
}
</style>
