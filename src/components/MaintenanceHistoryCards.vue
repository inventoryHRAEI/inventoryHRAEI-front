<template>
  <div class="maintenance-datatable-container">
    <!-- Toolbar con búsqueda y filtros (mismas capacidades básicas que la tabla) -->
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
            placeholder="Buscar en todos los campos..."
            class="search-input"
            @input="debounceSearch"
          />
          <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
        </div>

        <!-- Filtro rápido por estado -->
        <div class="quick-filters">
          <button
            v-for="status in statusOptions"
            :key="status"
            :class="['filter-btn', { active: (activeFilters['ESTADO'] || []).includes(status) }]"
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

        <button @click="refreshData" class="action-btn refresh-btn" title="Actualizar datos">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
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

    <!-- Contenido en tarjetas -->
    <div v-if="!loadingData" class="cards-wrapper">
      <div v-if="records.length === 0" class="empty-state">
        <p>No se encontraron registros para los filtros actuales.</p>
      </div>
      <div v-else class="cards-grid">
        <article
          v-for="item in records"
          :key="item.id || `${item['FOLIO']}-${item['No DE INVENTARIO']}-${item['FECHA DE MANTENIMIENTO']}`"
          class="maintenance-card"
        >
          <header class="card-header">
            <div class="card-title-group">
              <h2 class="card-title">{{ item['EQUIPO MEDICO'] }}</h2>
              <p class="card-subtitle">No. Inv: {{ item['No DE INVENTARIO'] }}</p>
            </div>
            <span :class="['status-badge', statusClass(item['ESTADO'])]">
              {{ item['ESTADO'] || 'Sin estado' }}
            </span>
          </header>

          <section class="card-body">
            <div class="card-row">
              <span class="label">Fecha mantto.</span>
              <span class="value">{{ item['FECHA DE MANTENIMIENTO'] || 'N/D' }}</span>
            </div>
            <div class="card-row">
              <span class="label">Tipo</span>
              <span class="value">{{ item['TIPO DE MANTENIMIENTO'] || 'N/D' }}</span>
            </div>
            <div class="card-row">
              <span class="label">Técnico</span>
              <span class="value">{{ item['TECNICIAN'] || 'N/D' }}</span>
            </div>
            <div class="card-row observations">
              <span class="label">Observaciones</span>
              <p class="value observations-text">
                {{ item['OBSERVACIONES'] || 'Sin observaciones registradas.' }}
              </p>
            </div>
          </section>
        </article>
      </div>
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
import { ref, computed, onMounted } from 'vue';
import { useMaintenanceApi } from '../composables/useMaintenanceApi.js';
import { useMaintenanceFilters } from '../composables/useMaintenanceFilters.js';
import { useMaintenanceSort } from '../composables/useMaintenanceSort.js';
import { useMaintenancePagination } from '../composables/useMaintenancePagination.js';

const apiObj = useMaintenanceApi();
const filterObj = useMaintenanceFilters();
const sortObj = useMaintenanceSort();
const paginationObj = useMaintenancePagination();

const records = ref([]);
const loadingData = ref(false);
const searchQuery = ref('');
const searchTimeout = ref(null);

const statusOptions = ['Operativo', 'Mantenimiento', 'Fuera de Servicio'];

const pageSize = computed({
  get: () => paginationObj.pageSize,
  set: (value) => paginationObj.setPageSize(value)
});

const activeFilters = computed(() => filterObj.activeFilters);

function statusClass(status) {
  if (status === 'Operativo') return 'status-operativo';
  if (status === 'Mantenimiento') return 'status-mantenimiento';
  if (status === 'Fuera de Servicio') return 'status-fuera-servicio';
  return 'status-desconocido';
}

function debounceSearch() {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    loadData();
  }, 500);
}

function clearSearch() {
  searchQuery.value = '';
  loadData();
}

function toggleStatusFilter(status) {
  const current = activeFilters.value['ESTADO'] || [];
  const exists = current.includes(status);
  const next = exists ? current.filter((s) => s !== status) : [...current, status];

  filterObj.setFilter('ESTADO', next);
  loadData();
}

function onPageSizeChange() {
  paginationObj.setPageSize(pageSize.value);
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

    records.value = result.records || [];
    paginationObj.setTotalRecords(result.pagination.totalRecords);
    filterObj.setColumnStats(result.columnStats);
  } catch (error) {
    console.error('[MaintenanceHistoryCards] Error loading data:', error);
  } finally {
    loadingData.value = false;
  }
}

async function refreshData() {
  await loadData();
}

onMounted(async () => {
  await loadData();
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

/* Reuso de estilos base de toolbar / filtros del DataTable */
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
  right: 12px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: #e2e8f0;
}

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

.cards-wrapper {
  flex: 1;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.15);
  background: rgba(15, 23, 42, 0.7);
  padding: 12px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #94a3b8;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.maintenance-card {
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), rgba(15, 23, 42, 0.9));
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(96, 165, 250, 0.25);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.8);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.maintenance-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(14, 165, 233, 0.2), transparent 60%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.maintenance-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
  color: #e5f2ff;
}

.card-subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.status-operativo {
  background: var(--status-operativo-bg, rgba(16,185,129,0.15));
  color: var(--status-operativo-fg, #6ee7b7);
  border: 1px solid rgba(0,0,0,0.06);
}

.status-mantenimiento {
  background: var(--status-mantenimiento-bg, rgba(245,158,11,0.15));
  color: var(--status-mantenimiento-fg, #fed7aa);
  border: 1px solid rgba(0,0,0,0.06);
}

.status-fuera-servicio {
  background: var(--status-fuera-bg, rgba(239,68,68,0.15));
  color: var(--status-fuera-fg, #fecaca);
  border: 1px solid rgba(0,0,0,0.06);
}

.status-desconocido {
  background: var(--status-retired-bg, rgba(148,163,184,0.2));
  color: var(--status-retired-fg, #e5e7eb);
  border: 1px solid rgba(0,0,0,0.06);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.card-row .label {
  color: #9ca3af;
}

.card-row .value {
  color: #e5e7eb;
  font-weight: 500;
}

.card-row.observations {
  flex-direction: column;
  align-items: flex-start;
}

.observations-text {
  margin: 2px 0 0 0;
  max-height: 3.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

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
</style>
