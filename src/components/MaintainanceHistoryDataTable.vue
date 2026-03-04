<template>
  <div class="maintenance-datatable-container">
    <!-- Toolbar con búsqueda y controles -->
    <div class="datatable-toolbar">
      <div class="toolbar-section left">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar en todos los campos... (o escanea)"
            class="search-input"
            @input="debounceSearch"
          />
          <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
          <button @click="toggleScanMode" class="scan-btn" :class="{ active: scanModeActive }" title="Modo escaneo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="7" x2="21" y2="7"></line>
              <line x1="3" y1="17" x2="21" y2="17"></line>
              <rect x="1" y="5" width="22" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
        </div>

        <!-- Filtro rápido por estado -->
        <div class="quick-filters">
          <button
            v-for="status in statusOptions"
            :key="status"
            :class="['filter-btn', { active: activeFilters[status] === true }]"
            @click="toggleStatusFilter(status)"
            :title="`Filtrar por estado: ${status}`"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <div class="toolbar-section right">
        <!-- Selector de tamaño de página -->
        <select v-model.number="pageSize" class="page-size-select" @change="onPageSizeChange">
          <option v-for="size of paginationObj.PAGE_SIZE_OPTIONS" :key="size" :value="size">
            {{ size }} registros
          </option>
        </select>

        <!-- Botones de acción -->
        <button @click="refreshData" class="action-btn refresh-btn" title="Actualizar datos">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
          </svg>
        </button>

        <button @click="downloadCSV" class="action-btn export-btn" title="Descargar CSV">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Chips de filtros activos -->
    <div v-if="filterObj.hasActiveFilters" class="active-filters-chips">
      <div
        v-for="filter in filterObj.filterChips"
        :key="filter.id"
        class="filter-chip"
      >
        <span>{{ filter.label }}</span>
        <button @click="() => filterObj.removeFilter(filter.id)" class="chip-close">✕</button>
      </div>
      <button @click="filterObj.clearAllFilters" class="clear-all-btn">Limpiar todo</button>
    </div>

    <!-- DataTable (Tabulator) -->
    <div v-if="!loadingData" class="ag-grid-wrapper">
      <div ref="tableEl" class="tabulator-container" tabindex="0" aria-label="Historial de mantenimientos tabla"></div>
    </div>

    <!-- Loading state -->
    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- Pagination -->
    <div class="datatable-pagination">
      <div class="pagination-info">
        <span class="records-count">
          Total: <strong>{{ paginationObj.totalRecords }}</strong> registros
        </span>
        <span class="records-range">
          Mostrando {{ paginationObj.rangeLabel }}
        </span>
      </div>

      <div class="pagination-controls">
        <button
          @click="previousPage"
          :disabled="!paginationObj.hasPreviousPage"
          class="pagination-btn"
          title="Página anterior"
        >
          ← Anterior
        </button>

        <div class="page-info">
          Página <strong>{{ paginationObj.currentPage }}</strong> de <strong>{{ paginationObj.totalPages }}</strong>
        </div>

        <button
          @click="nextPage"
          :disabled="!paginationObj.hasNextPage"
          class="pagination-btn"
          title="Página siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { useMaintenanceApi } from '../composables/useMaintenanceApi.js';
import { useMaintenanceFilters } from '../composables/useMaintenanceFilters.js';
import { useMaintenanceSort } from '../composables/useMaintenanceSort.js';
import { useMaintenancePagination } from '../composables/useMaintenancePagination.js';
import { useMaintenanceExport } from '../composables/useMaintenanceExport.js';

// Composables
const apiObj = useMaintenanceApi();
const filterObj = useMaintenanceFilters();
const sortObj = useMaintenanceSort();
const paginationObj = useMaintenancePagination();
const exportObj = useMaintenanceExport();

// State
const tableEl = ref(null);
let table = null;
const rowData = ref([]);
const loadingData = ref(false);
const searchQuery = ref('');
const searchTimeout = ref(null);
const scanModeActive = ref(false);
const scanBuffer = ref('');
const scanTimeout = ref(null);

const statusOptions = ['Operativo', 'Mantenimiento', 'Fuera de Servicio'];

// Definición de columnas de AG Grid
const columnDefs = ref([
  {
    field: 'No',
    headerName: '#',
    width: 60,
    sortable: true,
    filter: false,
    pinned: 'left'
  },
  {
    field: 'No DE INVENTARIO',
    headerName: 'No. Inventario',
    width: 140,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    pinned: 'left'
  },
  {
    field: 'EQUIPO MEDICO',
    headerName: 'Equipo Médico',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true
  },
  {
    field: 'ESTADO',
    headerName: 'Estado',
    width: 130,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: getStatusCellStyle
  },
  {
    field: 'FECHA DE MANTENIMIENTO',
    headerName: 'Fecha Mantenimiento',
    width: 160,
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true
  },
  {
    field: 'TIPO DE MANTENIMIENTO',
    headerName: 'Tipo',
    width: 130,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true
  },
  {
    field: 'TECNICIAN',
    headerName: 'Técnico',
    width: 140,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true
  },
  {
    field: 'OBSERVACIONES',
    headerName: 'Observaciones',
    width: 250,
    sortable: false,
    filter: 'agTextColumnFilter',
    resizable: true,
    wrapText: true,
    autoHeight: true
  }
]);

// Configuración por defecto de columnas
const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: false
};

// Opciones de grid
const gridOptions = {
  rowSelection: { mode: 'multiple', enableClickSelection: false },
  pagination: false, // Usamos paginación manual
  virtualizeColumns: false,
  animateRows: true,
  sideBar: 'columns'
};

// Métodos
function toggleScanMode() {
  scanModeActive.value = !scanModeActive.value;
  scanBuffer.value = '';
  if (scanModeActive.value) {
    nextTick(() => {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) searchInput.focus();
    });
  }
}

function handleScanInput(e) {
  if (!scanModeActive.value) return;
  
  const char = e.key;
  
  // ENTER completa el escaneo
  if (char === 'Enter') {
    if (scanBuffer.value.trim()) {
      searchQuery.value = scanBuffer.value.trim();
      debounceSearch();
      scanBuffer.value = '';
      e.preventDefault();
    }
    return;
  }
  
  // ESC cancela escaneo
  if (char === 'Escape') {
    scanModeActive.value = false;
    scanBuffer.value = '';
    return;
  }
  
  // Caracteres imprimibles al buffer
  if (char.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    scanBuffer.value += char;
    clearTimeout(scanTimeout.value);
    scanTimeout.value = setTimeout(() => {
      if (scanBuffer.value.trim()) {
        searchQuery.value = scanBuffer.value.trim();
        debounceSearch();
      }
      scanBuffer.value = '';
    }, 1500); // Timeout si no hay más entrada
  }
}

function onGridReady(event) {
  console.log('[MaintainanceHistoryDataTable] Grid ready');
}

function getStatusCellStyle(params) {
  const status = params.value;
  const statusColors = {
    'Operativo': { backgroundColor: '#D1FAE5', color: '#065F46' },
    'Mantenimiento': { backgroundColor: '#FEF3C7', color: '#92400E' },
    'Fuera de Servicio': { backgroundColor: '#FEE2E2', color: '#7F1D1D' }
  };
  return statusColors[status] || {};
}

function debounceSearch() {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    paginationObj.firstPage();
    loadData();
  }, 500);
}

function clearSearch() {
  searchQuery.value = '';
  paginationObj.firstPage();
  loadData();
}

function toggleStatusFilter(status) {
  const current = activeFilters.value['ESTADO'] || [];
  const exists = current.includes(status);
  const next = exists ? current.filter((s) => s !== status) : [...current, status];

  filterObj.setFilter('ESTADO', next);
  paginationObj.firstPage();
  loadData();
}

function onPageSizeChange() {
  paginationObj.setPageSize(pageSize.value);
  paginationObj.firstPage();
  loadData();
}

function previousPage() {
  paginationObj.previousPage();
  loadData();
}

function nextPage() {
  paginationObj.nextPage();
  loadData();
}

// Tabulator helpers
function buildColumns() {
  return [
    { title: '#', field: 'No', width: 60 },
    { title: 'No. Inventario', field: 'No DE INVENTARIO', headerFilter: 'input', frozen: true },
    { title: 'Equipo Médico', field: 'EQUIPO MEDICO', headerFilter: 'input', widthGrow: 2 },
    { title: 'Estado', field: 'ESTADO', headerFilter: 'select', headerFilterParams: { values: ['', ...statusOptions] }, formatter: (cell) => {
      const v = cell.getValue();
      const map = { 'Operativo': 'operativo', 'Mantenimiento': 'mantenimiento', 'Fuera de Servicio': 'fuera' };
      return `<span class="status-badge ${map[v] || ''}">${v || ''}</span>`;
    }, width: 140 },
    { title: 'Fecha Mantenimiento', field: 'FECHA DE MANTENIMIENTO', headerFilter: 'input' },
    { title: 'Tipo', field: 'TIPO DE MANTENIMIENTO', headerFilter: 'input' },
    { title: 'Técnico', field: 'TECNICIAN', headerFilter: 'input' },
    { title: 'Observaciones', field: 'OBSERVACIONES', headerFilter: 'input', width: 300 }
  ];
}

function createTable() {
  if (!tableEl.value) {
    console.warn('[MaintainanceHistoryDataTable] createTable: tableEl not mounted yet')
    return
  }
  if (table) table.destroy();

  try {
    table = new Tabulator(tableEl.value, {
      data: rowData.value || [],
      layout: 'fitData',
      reactiveData: false,
      height: '520px',
      columns: buildColumns(),
      movableColumns: true,
      virtualDom: true,
      headerFilterLiveFilter: false,
      pagination: false
    });
  } catch (err) {
    console.error('[MaintainanceHistoryDataTable] Tabulator creation failed', err)
    table = null
    return
  }

  // header filter changes -> call server
  table.on('headerFilterChanged', () => {
    if (!table || typeof table.getHeaderFilters !== 'function') return
    const hf = table.getHeaderFilters();
    const filters = {};
    hf.forEach((f) => {
      if (f.value !== '') filters[f.field] = f.value;
    });
    // apply to composable filters and reload
    Object.keys(filters).forEach((k) => filterObj.setFilter(k, filters[k]));
    paginationObj.firstPage();
    loadData();
  });

  // client-side sort UI -> map to server-side
  table.on('sorterChanged', (sorters) => {
    if (!sorters || sorters.length === 0) {
      sortObj.setSortField('');
      sortObj.setSortOrder('asc');
    } else {
      const s = sorters[0];
      sortObj.setSortField(s.field);
      sortObj.setSortOrder(s.dir === 'asc' ? 'asc' : 'desc');
    }
    paginationObj.firstPage();
    loadData();
  });
}

async function loadData() {
  loadingData.value = true;

  try {
    const params = {
      page: paginationObj.currentPage,
      pageSize: paginationObj.pageSize,
      sortBy: sortObj.sortBy,
      sortOrder: sortObj.sortOrder,
      search: searchQuery.value,
      filters: filterObj.activeFilters
    };

    const result = await apiObj.fetchList(params);

    rowData.value = result.records || [];
    paginationObj.setTotalRecords(result.pagination.totalRecords);
    filterObj.setColumnStats(result.columnStats);

    // push data into Tabulator (use safe fallback APIs)
    try {
      if (!table && tableEl.value) createTable()
      if (table && typeof table.replaceData === 'function') table.replaceData(rowData.value || [])
      else if (table && typeof table.setData === 'function') table.setData(rowData.value || [])
      else if (table && typeof table.clearData === 'function' && typeof table.addData === 'function') { table.clearData(); table.addData(rowData.value || []) }
    } catch (e) {
      console.error('[MaintainanceHistoryDataTable] failed to push data into Tabulator', e)
      try { table?.destroy(); table = null; createTable(); if (table && typeof table.setData === 'function') table.setData(rowData.value || []) } catch (e2) { /* swallow */ }
    }

    console.log('[MaintainanceHistoryDataTable] Data loaded:', {
      records: (result.records || []).length,
      total: result.pagination ? result.pagination.totalRecords : undefined
    });
  } catch (error) {
    console.error('[MaintainanceHistoryDataTable] Error loading data:', error);
  } finally {
    loadingData.value = false;
  }
}

async function refreshData() {
  await loadData();
}

async function downloadCSV() {
  try {
    await apiObj.downloadExport('csv', filterObj.activeFilters, false);
  } catch (error) {
    console.error('[MaintainanceHistoryDataTable] Error downloading CSV:', error);
  }
}

// Computed
const pageSize = computed({
  get: () => paginationObj.pageSize,
  set: (value) => paginationObj.setPageSize(value)
});

const activeFilters = computed(() => filterObj.activeFilters);

// Watch
watch(
  () => sortObj.sortBy,
  () => {
    paginationObj.firstPage();
    loadData();
  }
);

// apply palette from localStorage (if present)
function applyStoredPalette() {
  try {
    const raw = localStorage.getItem('biomed.palette')
    if (!raw) return
    const p = JSON.parse(raw)
    const root = document.documentElement
    if (p['Operativo']) { root.style.setProperty('--status-operativo-bg', p['Operativo'].bg); root.style.setProperty('--status-operativo-fg', p['Operativo'].fg); root.style.setProperty('--status-available-bg', p['Operativo'].bg); root.style.setProperty('--status-available-fg', p['Operativo'].fg) }
    if (p['Mantenimiento']) { root.style.setProperty('--status-mantenimiento-bg', p['Mantenimiento'].bg); root.style.setProperty('--status-mantenimiento-fg', p['Mantenimiento'].fg); root.style.setProperty('--status-maintenance-bg', p['Mantenimiento'].bg); root.style.setProperty('--status-maintenance-fg', p['Mantenimiento'].fg) }
    if (p['Fuera de Servicio']) { root.style.setProperty('--status-fuera-bg', p['Fuera de Servicio'].bg); root.style.setProperty('--status-fuera-fg', p['Fuera de Servicio'].fg); root.style.setProperty('--status-unavailable-bg', p['Fuera de Servicio'].bg); root.style.setProperty('--status-unavailable-fg', p['Fuera de Servicio'].fg) }
  } catch (e) { }
}

// Lifecycle
onMounted(async () => {
  applyStoredPalette()
  await nextTick()
  if (tableEl.value) {
    createTable()
  } else {
    const stop = watch(tableEl, (val) => {
      if (val) { createTable(); stop(); }
    })
  }
  await loadData();
  
  // Agregar listener para modo escaneo
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', handleScanInput);
  }
});

onBeforeUnmount(() => {
  table?.destroy();
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.removeEventListener('keydown', handleScanInput);
  }
  clearTimeout(scanTimeout.value);
});
</script>

<style scoped>
.maintenance-datatable-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
}

/* Toolbar */
.datatable-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.15);
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-section.left {
  flex: 1;
  min-width: 300px;
}

.toolbar-section.right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(30, 41, 59, 0.9);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.search-clear {
  position: absolute;
  right: 42px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: #f1f5f9;
}

.scan-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.scan-btn:hover {
  color: #0ea5e9;
  transform: scale(1.1);
}

.scan-btn.active {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 4px;
  padding: 4px;
  animation: pulse-scan 1.5s ease-in-out infinite;
}

@keyframes pulse-scan {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}



/* Quick Filters */
.quick-filters {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 6px 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 4px;
  color: #cbd5e1;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(59, 130, 246, 0.1);
}

.filter-btn.active {
  background: rgba(14, 165, 233, 0.3);
  border-color: rgba(14, 165, 233, 0.6);
  color: #bfdbfe;
}

/* Page Size Select */
.page-size-select {
  padding: 6px 10px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 4px;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.page-size-select:hover,
.page-size-select:focus {
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(30, 41, 59, 0.8);
}

/* Action Buttons */
.action-btn {
  padding: 8px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 4px;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(14, 165, 233, 0.5);
}

.action-btn.refresh-btn:hover {
  color: #06b6d4;
}

.action-btn.export-btn:hover {
  color: #fbbf24;
}

/* Active Filters Chips */
.active-filters-chips {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(14, 165, 233, 0.4);
  border-radius: 4px;
  font-size: 0.85rem;
  color: #bfdbfe;
}

.chip-close {
  background: none;
  border: none;
  color: #bfdbfe;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  transition: color 0.2s ease;
}

.chip-close:hover {
  color: #ef4444;
}

.clear-all-btn {
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* AG Grid Wrapper */
.ag-grid-wrapper {
  flex: 1;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.15);
  background: rgba(30, 41, 59, 0.4);
}

.ag-theme-maintenance {
  --ag-grid-size: 4px;
  --ag-list-item-height: 40px;
  --ag-header-height: 44px;
  --ag-header-foreground-color: #e2e8f0;
  --ag-header-background-color: #1e293b;
  --ag-odd-row-background-color: rgba(30, 41, 59, 0.5);
  --ag-row-hover-color: rgba(59, 130, 246, 0.1);
  --ag-borders-side-color: rgba(96, 165, 250, 0.2);
  --ag-row-border-color: rgba(96, 165, 250, 0.15);
  height: 100%;
  width: 100%;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Pagination */
.datatable-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.15);
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.records-count strong,
.page-info strong {
  color: #bfdbfe;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  padding: 6px 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 4px;
  color: #bfdbfe;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(14, 165, 233, 0.5);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #cbd5e1;
  font-size: 0.9rem;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 1024px) {
  .toolbar-section {
    min-width: auto;
  }

  .search-input {
    width: auto;
    min-width: 200px;
  }

  .quick-filters {
    display: none;
  }
}

@media (max-width: 768px) {
  .maintenance-datatable-container {
    padding: 8px;
    gap: 8px;
  }

  .datatable-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-section {
    width: 100%;
  }

  .toolbar-section.left {
    min-width: unset;
  }

  .toolbar-section.right {
    justify-content: flex-end;
  }

  .search-input {
    width: 100%;
  }

  .datatable-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-info {
    flex-direction: column;
    width: 100%;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-around;
  }
}

/* Tabulator visual improvements */
.ag-grid-wrapper .tabulator-row:hover .tabulator-cell { background: rgba(255,255,255,0.02); }
.ag-grid-wrapper .tabulator-row.tabulator-selected .tabulator-cell { background: rgba(59,130,246,0.08) !important; border-left: 3px solid rgba(59,130,246,0.4); }
.ag-grid-wrapper .tabulator-row:nth-child(even) .tabulator-cell { background: rgba(255,255,255,0.01); }
.ag-grid-wrapper .tabulator-header { position: sticky; top: 0; z-index: 6; backdrop-filter: blur(3px); background: rgba(30,41,59,0.85); }
</style>
