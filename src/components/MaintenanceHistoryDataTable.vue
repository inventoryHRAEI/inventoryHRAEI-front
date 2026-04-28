<template>
  <div class="maintenance-datatable-container">
    <!-- Encabezado con controles (MEJORADO) -->
    <div class="datatable-header">
      <div class="header-left">
        <h2 class="title">Historial de Mantenimientos</h2>
        <span class="records-count">{{ totalRecords }} registros</span>
        <!-- Indicador de última actualización -->
        <span class="last-sync" v-if="lastSyncTime">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ formatLastSync(lastSyncTime) }}
        </span>
      </div>
      
      <div class="header-right">
        <!-- Botón de Estadísticas Rápidas -->
        <button @click="showQuickStats = !showQuickStats" class="toolbar-btn" :class="{ active: showQuickStats }" title="Ver estadísticas">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Stats
        </button>

        <button 
          @click="toggleView" 
          class="view-toggle-btn"
          :title="`Cambiar a ${viewMode === 'table' ? 'vista de Cards' : 'vista de Tabla'}`"
        >
          <svg v-if="viewMode === 'table'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          {{ viewMode === 'table' ? 'Cards' : 'Tabla' }}
        </button>

        <!-- Menú de Exportación Mejorado -->
        <div class="export-menu-wrapper">
          <button @click="showExportMenu = !showExportMenu" class="toolbar-btn" title="Opciones de exportación">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div v-if="showExportMenu" class="export-dropdown">
            <button @click="exportToCSV(); showExportMenu = false" class="export-option">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Exportar CSV
            </button>
            <button @click="exportToExcel(); showExportMenu = false" class="export-option">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="8" y1="13" x2="16" y2="13"></line>
                <line x1="8" y1="17" x2="16" y2="17"></line>
              </svg>
              Exportar Excel
            </button>
            <button @click="printReport(); showExportMenu = false" class="export-option">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimir Reporte
            </button>
          </div>
        </div>

        <button @click="refreshData" class="toolbar-btn" title="Actualizar datos" :class="{ 'is-loading': props.loading }">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-anim': props.loading }">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Panel de Estadísticas Rápidas (NUEVO) -->
    <transition name="slide-down">
      <div v-if="showQuickStats" class="quick-stats-panel">
        <div class="stats-grid">
          <div class="stat-item stat-total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <span class="stat-value">{{ totalRecords }}</span>
              <span class="stat-label">Total Registros</span>
            </div>
          </div>
          <div class="stat-item stat-operational">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.operational }}</span>
              <span class="stat-label">Operativos</span>
            </div>
          </div>
          <div class="stat-item stat-maintenance">
            <div class="stat-icon">🔧</div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.maintenance }}</span>
              <span class="stat-label">En Mantenimiento</span>
            </div>
          </div>
          <div class="stat-item stat-offline">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.offline }}</span>
              <span class="stat-label">Fuera de Servicio</span>
            </div>
          </div>
        </div>
        <div class="stats-bar">
          <div class="bar-segment operational" :style="{ width: statsData.operationalPct + '%' }" :title="`Operativos: ${statsData.operationalPct}%`"></div>
          <div class="bar-segment maintenance" :style="{ width: statsData.maintenancePct + '%' }" :title="`Mantenimiento: ${statsData.maintenancePct}%`"></div>
          <div class="bar-segment offline" :style="{ width: statsData.offlinePct + '%' }" :title="`Fuera de servicio: ${statsData.offlinePct}%`"></div>
        </div>
      </div>
    </transition>

    <!-- Búsqueda global y filtros -->
    <div class="datatable-controls">
      <div class="search-container">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          v-model="globalFilter"
          type="text"
          placeholder="Buscar en todos los campos..."
          class="search-input"
          @input="handleGlobalSearch"
        />
      </div>

      <div class="filters-container">
        <button @click="showFiltersPanel = !showFiltersPanel" class="filters-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filtros
          <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>

        <button @click="columnVisibilityOpen = !columnVisibilityOpen" class="filters-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Columnas
        </button>

        <button @click="clearAllFilters" v-if="activeFiltersCount > 0" class="filters-btn clear-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Limpiar
        </button>
      </div>
    </div>

    <!-- Panel de filtros avanzados -->
    <div v-if="showFiltersPanel" class="filters-panel">
      <div class="filters-grid">
        <div v-for="column of filterableColumns" :key="column.id" class="filter-item">
          <label class="filter-label">{{ column.header }}</label>
          <input
            v-model="columnFilters[column.id]"
            type="text"
            :placeholder="`Filtrar ${column.header}...`"
            class="filter-input"
            @input="handleColumnFilter"
            list="suggestions"
          />
          <datalist :id="`suggestions-${column.id}`">
            <option v-for="value of getColumnSuggestions(column.id)" :key="value" :value="value" />
          </datalist>
        </div>
      </div>
    </div>

    <!-- Visibilidad de columnas -->
    <div v-if="columnVisibilityOpen" class="column-visibility-panel">
      <div class="visibility-grid">
        <label v-for="column of allColumns" :key="column.id" class="visibility-checkbox">
          <input
            type="checkbox"
            v-model="columnVisibility[column.id]"
            @change="handleColumnVisibility"
          />
          <span>{{ column.header }}</span>
        </label>
      </div>
    </div>

    <!-- VISTA DE TABLA -->
    <div v-if="viewMode === 'table'" class="table-view">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr class="table-header-row">
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  :checked="isAllRowsSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
                />
              </th>
              <th
                v-for="column of visibleColumns"
                :key="column.id"
                class="table-header-cell"
                @click="handleColumnSort(column.id)"
                :class="{ 'sorted': sortingColumn === column.id }"
              >
                <div class="header-content">
                  <span class="header-text">{{ column.header }}</span>
                  <span v-if="sortingColumn === column.id" class="sort-icon">
                    {{ sortingDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </div>
              </th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredAndPaginatedData.length === 0" class="no-data-row">
              <td :colspan="visibleColumns.length + 2" class="no-data-cell">
                <div class="no-data-message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <p>{{ loading ? 'Cargando datos...' : 'No se encontraron registros' }}</p>
                </div>
              </td>
            </tr>
            <tr
              v-for="(row, idx) of filteredAndPaginatedData"
              :key="`${row.id}-${idx}`"
              class="table-data-row"
              :class="{ 'selected': selectedRows.has(row.id), [getRowStateClass(row)]: true }"
            >
              <td class="checkbox-col">
                <input
                  type="checkbox"
                  :checked="selectedRows.has(row.id)"
                  @change="toggleRowSelect(row.id)"
                  class="checkbox"
                />
              </td>
              <td
                v-for="column of visibleColumns"
                :key="column.id"
                class="table-data-cell"
              >
                <span class="cell-content">
                  {{ formatCellValue(row[column.id], column.type) }}
                </span>
              </td>
              <td class="actions-col">
                <div class="action-buttons">
                  <button @click="viewItem(row)" class="action-btn view" title="Ver detalles">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button @click="editItem(row)" class="action-btn edit" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button @click="deleteItem(row)" class="action-btn delete" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VISTA DE CARDS -->
    <div v-else class="cards-view">
      <div class="cards-grid">
        <div
          v-for="(row, idx) of filteredAndPaginatedData"
          :key="`${row.id}-${idx}`"
          class="maintenance-card"
          :class="getRowStateClass(row)"
        >
          <div class="card-header">
            <div class="card-title">
              {{ row['EQUIPO MÉDICO'] || row.equipment || 'Sin nombre' }}
            </div>
            <div class="card-status">
              <span class="status-badge" :class="getStatusClass(row.Estado)">
                {{ row.Estado }}
              </span>
            </div>
          </div>

          <div class="card-content">
            <div v-for="column of visibleColumns" :key="column.id" class="card-field">
              <span class="field-label">{{ column.header }}:</span>
              <span class="field-value">{{ formatCellValue(row[column.id], column.type) }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button @click="viewItem(row)" class="card-action view">Ver</button>
            <button @click="editItem(row)" class="card-action edit">Editar</button>
            <button @click="deleteItem(row)" class="card-action delete">Eliminar</button>
          </div>
        </div>
      </div>

      <div v-if="filteredAndPaginatedData.length === 0" class="no-data-cards">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <p>{{ loading ? 'Cargando datos...' : 'No se encontraron registros' }}</p>
      </div>
    </div>

    <!-- Paginación -->
    <div class="datatable-pagination">
      <div class="pagination-info">
        <span class="info-text">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, totalRecords) }} de {{ totalRecords }} registros
        </span>
        <span v-if="selectedRows.size > 0" class="selected-info">
          | {{ selectedRows.size }} seleccionados
        </span>
      </div>

      <div class="pagination-controls">
        <select v-model.number="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
          <option value="250">250 por página</option>
        </select>

        <div class="pagination-buttons">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Página anterior"
          >
            ← Anterior
          </button>

          <div class="page-indicator">
            <span>Página <strong>{{ currentPage }}</strong> de <strong>{{ totalPages }}</strong></span>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Página siguiente"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MaintenanceStatusBadge from '@/components/MaintenanceStatusBadge.vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['view-item', 'edit-item', 'delete-item', 'refresh'])

// ==================== ESTADO ====================
const viewMode = ref('table') // 'table' | 'cards'
const globalFilter = ref('')
const showFiltersPanel = ref(false)
const columnVisibilityOpen = ref(false)
const currentPage = ref(1)
const pageSize = ref(25)
const sortingColumn = ref(null)
const sortingDirection = ref('asc')
const selectedRows = ref(new Set())

// NUEVAS FEATURES
const showQuickStats = ref(false)
const showExportMenu = ref(false)
const lastSyncTime = ref(null)

// Filtros por columna
const columnFilters = ref({})
const columnVisibility = ref({})

// Definición de columnas
const allColumns = ref([
  { id: 'No DE INVENTARIO', header: 'No. Inventario', type: 'text' },
  { id: 'EQUIPO MÉDICO', header: 'Equipo Médico', type: 'text' },
  { id: 'MARCA', header: 'Marca', type: 'text' },
  { id: 'MODELO', header: 'Modelo', type: 'text' },
  { id: 'SERIE', header: 'Serie', type: 'text' },
  { id: 'UBICACIÓN', header: 'Ubicación', type: 'text' },
  { id: 'FUNCIONANDO', header: 'Funcionando', type: 'text' },
  { id: 'Estado', header: 'Estado', type: 'status' },
  { id: 'TIPO DE MANTENIMIENTO', header: 'Tipo Mantenimiento', type: 'text' },
  { id: 'FECHA MANTENIMIENTO', header: 'Fecha', type: 'date' },
  { id: 'RESPONSABLE', header: 'Responsable', type: 'text' },
  { id: 'OBSERVACIONES', header: 'Observaciones', type: 'text' },
  { id: 'FECHA PREVISTA', header: 'Fecha prevista', type: 'date' },
  { id: 'EMPRESA EXTERNA', header: 'Proveedor', type: 'text' },
  { id: 'ÁREA FINAL', header: 'Área final', type: 'text' }
])

// Inicializar visibilidad de columnas
onMounted(() => {
  allColumns.value.forEach(col => {
    columnVisibility.value[col.id] = true
  })
  columnFilters.value = {}
  lastSyncTime.value = new Date()
})

// ==================== COMPUTED ====================

// Estadísticas calculadas (NUEVO)
const statsData = computed(() => {
  let operational = 0
  let maintenance = 0
  let offline = 0
  
  props.data.forEach(row => {
    const estado = String(row.Estado || '').toLowerCase()
    if (estado.includes('operativo') || estado.includes('funcionando')) operational++
    else if (estado.includes('mantenimiento')) maintenance++
    else if (estado.includes('fuera') || estado.includes('reparación')) offline++
    else operational++ // Default
  })
  
  const total = props.data.length || 1
  return {
    operational,
    maintenance,
    offline,
    operationalPct: Math.round((operational / total) * 100),
    maintenancePct: Math.round((maintenance / total) * 100),
    offlinePct: Math.round((offline / total) * 100)
  }
})

const visibleColumns = computed(() =>
  allColumns.value.filter(col => columnVisibility.value[col.id] !== false)
)

const filterableColumns = computed(() => visibleColumns.value)

const activeFiltersCount = computed(() =>
  Object.values(columnFilters.value).filter(v => v?.trim()).length
)

// Filtrado global y por columnas
const filteredData = computed(() => {
  let result = props.data

  // Aplicar filtro global
  if (globalFilter.value) {
    const query = globalFilter.value.toLowerCase()
    result = result.filter(row =>
      visibleColumns.value.some(col => {
        const value = row[col.id]
        return value && String(value).toLowerCase().includes(query)
      })
    )
  }

  // Aplicar filtros por columna
  Object.entries(columnFilters.value).forEach(([colId, filterValue]) => {
    if (filterValue?.trim()) {
      result = result.filter(row => {
        const value = row[colId]
        return value && String(value).toLowerCase().includes(filterValue.toLowerCase())
      })
    }
  })

  return result
})

// Ordenamiento
const sortedData = computed(() => {
  const data = [...filteredData.value]

  if (sortingColumn.value) {
    data.sort((a, b) => {
      const aVal = a[sortingColumn.value] ?? ''
      const bVal = b[sortingColumn.value] ?? ''

      let comparison = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal), 'es')
      }

      return sortingDirection.value === 'asc' ? comparison : -comparison
    })
  }

  return data
})

// Paginación
const totalRecords = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value) || 1)

const filteredAndPaginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

// Selección de filas
const isAllRowsSelected = computed(() => {
  if (filteredAndPaginatedData.value.length === 0) return false
  return filteredAndPaginatedData.value.every(row => selectedRows.value.has(row.id))
})

// ==================== MÉTODOS ====================

const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'cards' : 'table'
}

const handleGlobalSearch = () => {
  currentPage.value = 1
}

const handleColumnFilter = () => {
  currentPage.value = 1
}

const handleColumnSort = (columnId) => {
  if (sortingColumn.value === columnId) {
    sortingDirection.value = sortingDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortingColumn.value = columnId
    sortingDirection.value = 'asc'
  }
}

const handleColumnVisibility = () => {
  // Trigger reactivity
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const toggleSelectAll = () => {
  if (isAllRowsSelected.value) {
    selectedRows.value.clear()
  } else {
    filteredAndPaginatedData.value.forEach(row => {
      selectedRows.value.add(row.id)
    })
  }
}

const toggleRowSelect = (rowId) => {
  if (selectedRows.value.has(rowId)) {
    selectedRows.value.delete(rowId)
  } else {
    selectedRows.value.add(rowId)
  }
}

const clearAllFilters = () => {
  globalFilter.value = ''
  columnFilters.value = {}
  currentPage.value = 1
}

const exportToCSV = () => {
  const csv = [
    visibleColumns.value.map(col => `"${col.header}"`).join(','),
    ...filteredData.value.map(row =>
      visibleColumns.value.map(col => {
        const value = row[col.id]
        return `"${String(value ?? '').replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `mantenimientos_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const refreshData = () => {
  emit('refresh')
  lastSyncTime.value = new Date()
}

// Formatear tiempo desde última sincronización
const formatLastSync = (date) => {
  if (!date) return ''
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'Hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} min`
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

// Exportar a Excel (NUEVO)
const exportToExcel = () => {
  const headers = visibleColumns.value.map(col => col.header)
  const rows = filteredData.value.map(row =>
    visibleColumns.value.map(col => String(row[col.id] ?? ''))
  )
  
  let content = '\ufeff' // BOM for UTF-8
  content += headers.join('\t') + '\n'
  rows.forEach(row => {
    content += row.join('\t') + '\n'
  })
  
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `mantenimientos_${new Date().toISOString().split('T')[0]}.xls`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Imprimir reporte (NUEVO)
const printReport = () => {
  const headers = visibleColumns.value.map(col => `<th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">${col.header}</th>`).join('')
  const rows = filteredData.value.map(row => {
    const cells = visibleColumns.value.map(col => 
      `<td style="padding: 8px; border: 1px solid #ddd;">${formatCellValue(row[col.id], col.type)}</td>`
    ).join('')
    return `<tr>${cells}</tr>`
  }).join('')
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Historial de Mantenimientos - ${new Date().toLocaleDateString('es-MX')}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; font-size: 18px; }
        .info { color: #666; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        @media print { body { margin: 0; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <h1>Historial de Mantenimientos</h1>
      <div class="info">
        Generado: ${new Date().toLocaleString('es-MX')}<br>
        Total: ${filteredData.value.length} registros
      </div>
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `
  
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

const viewItem = (row) => {
  emit('view-item', row)
}

const editItem = (row) => {
  emit('edit-item', row)
}

const deleteItem = (row) => {
  emit('delete-item', row)
}

const formatCellValue = (value, type) => {
  if (!value) return '-'
  
  if (type === 'date') {
    const date = new Date(value)
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    })
  }
  
  return String(value)
}

const getRowStateClass = (row) => {
  const estado = row.Estado?.toLowerCase() || ''
  if (estado.includes('operativo') || estado.includes('funcionando')) return 'state-operational'
  if (estado.includes('mantenimiento')) return 'state-maintenance'
  if (estado.includes('fuera') || estado.includes('reparación')) return 'state-offline'
  return 'state-unknown'
}

// Función mejorada que usa CSS dinámico basado en el status actual
// Evita hardcodeo mapeando estados a clases CSS
const getStatusClass = (status) => {
  if (!status) return 'status-unknown'
  
  const statusLower = status.toLowerCase().trim()
  
  // Mapeo de palabras clave a clases CSS
  const statusMappings = {
    // Verde - Operativo/Funcionando
    'operativo': 'status-green',
    'funcionando': 'status-green',
    'en servicio': 'status-green',
    'activo': 'status-green',
    
    // Amarillo - Mantenimiento en progreso
    'mantenimiento': 'status-yellow',
    'en progreso': 'status-yellow',
    'en reparación': 'status-yellow',
    'pendiente': 'status-yellow',
    'programado': 'status-yellow',
    
    // Rojo - Fuera de servicio/Crítico
    'fuera de servicio': 'status-red',
    'fuera': 'status-red',
    'reparación': 'status-red',
    'crítico': 'status-red',
    'parado': 'status-red',
    'no funcional': 'status-red',
    
    // Gris - Desconocido/Inactivo
    'inactivo': 'status-gray',
    'desconocido': 'status-gray',
  }
  
  // Buscar coincidencia exacta o parcial
  for (const [key, className] of Object.entries(statusMappings)) {
    if (statusLower.includes(key)) {
      return className
    }
  }
  
  return 'status-gray'
}

const getColumnSuggestions = (columnId) => {
  const values = new Set()
  filteredData.value.forEach(row => {
    const value = row[columnId]
    if (value) values.add(String(value))
  })
  return Array.from(values).sort()
}
</script>

<style scoped>
.maintenance-datatable-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(96, 165, 250, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: #cbd5e1;
}

/* ==================== HEADER ==================== */
.datatable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.5px;
}

.records-count {
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 4px 8px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 6px;
}

.last-sync {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #64748b;
  padding: 4px 8px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 4px;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* Menú de exportación */
.export-menu-wrapper {
  position: relative;
}

.export-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 8px;
  padding: 6px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.export-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: left;
}

.export-option:hover {
  background: rgba(59, 130, 246, 0.12);
  color: #f1f5f9;
}

.export-option svg {
  color: #64748b;
}

.export-option:hover svg {
  color: #60a5fa;
}

/* Animación de carga */
.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.toolbar-btn.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

.toolbar-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

/* Panel de estadísticas rápidas */
.quick-stats-panel {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 8px;
}

.quick-stats-panel .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border-left: 3px solid transparent;
}

.stat-item.stat-total { border-left-color: #60a5fa; }
.stat-item.stat-operational { border-left-color: #22c55e; }
.stat-item.stat-maintenance { border-left-color: #f59e0b; }
.stat-item.stat-offline { border-left-color: #ef4444; }

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.5);
}

.bar-segment {
  height: 100%;
  transition: width 0.5s ease;
}

.bar-segment.operational { background: linear-gradient(90deg, #22c55e, #4ade80); }
.bar-segment.maintenance { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.bar-segment.offline { background: linear-gradient(90deg, #ef4444, #f87171); }

/* Animaciones */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

/* ==================== BOTONES TOOLBAR ==================== */
.view-toggle-btn,
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.view-toggle-btn:hover,
.toolbar-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  color: #bfdbfe;
}

/* ==================== CONTROLES ==================== */
.datatable-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filters-container {
  display: flex;
  gap: 8px;
}

.filters-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.filters-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  font-size: 0.75rem;
  font-weight: 700;
}

.clear-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* ==================== PANEL DE FILTROS ==================== */
.filters-panel {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 8px;
  padding: 12px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #bfdbfe;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: #cbd5e1;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.filter-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(15, 23, 42, 0.8);
}

/* ==================== VISIBILIDAD COLUMNAS ==================== */
.column-visibility-panel {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 8px;
  padding: 12px;
  animation: slideDown 0.2s ease;
}

.visibility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.visibility-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.visibility-checkbox:hover {
  background: rgba(59, 130, 246, 0.1);
}

.visibility-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.visibility-checkbox span {
  font-size: 0.85rem;
  font-weight: 500;
  color: #cbd5e1;
}

/* ==================== VISTA TABLA ==================== */
.table-view {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.1);
}

.table-wrapper {
  display: inline-block;
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(15, 23, 42, 0.3);
}

.table-header-row {
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 2px solid rgba(96, 165, 250, 0.2);
}

.table-header-cell {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #bfdbfe;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-header-cell:hover {
  background: rgba(59, 130, 246, 0.15);
}

.table-header-cell.sorted {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon {
  font-size: 0.7rem;
  opacity: 0.7;
}

.checkbox-col,
.actions-col {
  width: 50px;
  text-align: center;
}

.actions-col {
  width: 120px;
}

.table-data-row {
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
  transition: all 0.2s ease;
}

.table-data-row:hover {
  background: rgba(59, 130, 246, 0.1);
}

.table-data-row.selected {
  background: rgba(59, 130, 246, 0.15);
}

.table-data-row.state-operational {
  border-left: 4px solid rgba(34, 197, 94, 0.4);
}

.table-data-row.state-maintenance {
  border-left: 4px solid rgba(251, 191, 36, 0.4);
}

.table-data-row.state-offline {
  border-left: 4px solid rgba(239, 68, 68, 0.4);
}

.table-data-cell {
  padding: 10px 12px;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.cell-content {
  display: block;
  white-space: normal;
  word-break: break-word;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* Acciones */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(30, 58, 138, 0.6);
  border-color: rgba(59, 130, 246, 0.4);
}

.action-btn.view:hover {
  color: #06b6d4;
}

.action-btn.edit:hover {
  color: #fbbf24;
}

.action-btn.delete:hover {
  color: #ff6b6b;
}

.no-data-row {
  background: transparent !important;
  border-bottom: none !important;
}

.no-data-cell {
  padding: 48px 24px !important;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 12px;
}

.no-data-message svg {
  opacity: 0.5;
}

.no-data-message p {
  margin: 0;
  font-size: 1rem;
}

/* ==================== VISTA CARDS ==================== */
.cards-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.maintenance-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.maintenance-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
}

.maintenance-card.state-operational {
  border-left: 4px solid rgba(34, 197, 94, 0.6);
}

.maintenance-card.state-maintenance {
  border-left: 4px solid rgba(251, 191, 36, 0.6);
}

.maintenance-card.state-offline {
  border-left: 4px solid rgba(239, 68, 68, 0.6);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #bfdbfe;
}

.card-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.status-green {
  background: rgba(46, 125, 50, 0.15);
  color: #4ade80;
  border: 1px solid rgba(46, 125, 50, 0.3);
  box-shadow: 0 0 8px rgba(46, 125, 50, 0.1);
}

.status-green::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #2e7d32;
  border-radius: 0 2px 2px 0;
}

.status-yellow {
  background: rgba(230, 81, 0, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(230, 81, 0, 0.3);
  box-shadow: 0 0 8px rgba(230, 81, 0, 0.1);
  animation: pulse-yellow 2.5s ease-in-out infinite;
}

.status-yellow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #e65100;
  border-radius: 0 2px 2px 0;
  animation: pulse-bar 2.5s ease-in-out infinite;
}

.status-red {
  background: rgba(183, 28, 28, 0.15);
  color: #fc5c65;
  border: 1px solid rgba(183, 28, 28, 0.3);
  box-shadow: 0 0 8px rgba(183, 28, 28, 0.15);
  animation: pulse-red 1.5s ease-in-out infinite;
}

.status-red::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #b71c1c;
  border-radius: 0 2px 2px 0;
  animation: pulse-bar 1.5s ease-in-out infinite;
}

.status-gray {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.status-unknown {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* Animaciones sutiles */
@keyframes pulse-yellow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(230, 81, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 12px rgba(230, 81, 0, 0.2);
  }
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 8px rgba(183, 28, 28, 0.15);
  }
  50% {
    box-shadow: 0 0 14px rgba(183, 28, 28, 0.3);
  }
}

@keyframes pulse-bar {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-field {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.85rem;
}

.field-label {
  font-weight: 600;
  color: #94a3b8;
  flex-shrink: 0;
}

.field-value {
  color: #cbd5e1;
  text-align: right;
  word-break: break-word;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(96, 165, 250, 0.1);
}

.card-action {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-action:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.card-action.view:hover {
  color: #06b6d4;
}

.card-action.edit:hover {
  color: #fbbf24;
}

.card-action.delete:hover {
  color: #ff6b6b;
}

.no-data-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 24px;
  color: #94a3b8;
}

.no-data-cards svg {
  opacity: 0.5;
}

/* ==================== PAGINACIÓN ==================== */
.datatable-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.1);
  border-radius: 8px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-text {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.selected-info {
  font-size: 0.85rem;
  color: #86efac;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-size-select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-size-select:hover,
.page-size-select:focus {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(30, 41, 59, 0.8);
  outline: none;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: #bfdbfe;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.85rem;
  color: #cbd5e1;
  white-space: nowrap;
}

.page-indicator strong {
  color: #bfdbfe;
  font-weight: 700;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1024px) {
  .datatable-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-container {
    min-width: 100%;
  }

  .filters-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .maintenance-datatable-container {
    padding: 12px;
  }

  .datatable-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left,
  .header-right {
    width: 100%;
  }

  .title {
    font-size: 1.1rem;
  }

  .header-right {
    justify-content: space-between;
  }

  .datatable-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    min-width: unset;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 0.8rem;
  }

  .table-header-cell,
  .table-data-cell {
    padding: 8px;
  }

  .datatable-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    width: 100%;
    flex-direction: column;
  }

  .pagination-buttons {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .title {
    font-size: 1rem;
  }

  .view-toggle-btn,
  .toolbar-btn,
  .filters-btn {
    font-size: 0.75rem;
    padding: 6px 10px;
  }

  .data-table {
    font-size: 0.75rem;
  }

  .table-header-cell,
  .table-data-cell {
    padding: 6px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .card-field {
    flex-direction: column;
  }

  .field-label,
  .field-value {
    text-align: left;
  }
}
</style>
