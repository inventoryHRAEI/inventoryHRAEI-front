<template>
  <div class="smart-filter-bar">
    <!-- Quick Stats -->
    <div class="filter-stats-compact">
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <span class="stat-text">
          <span class="stat-label">Resultados</span>
          <span class="stat-value">{{ filteredCount }}/{{ totalCount }}</span>
        </span>
      </div>
    </div>

    <!-- Global Search -->
    <div class="search-wrapper">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        v-model="globalSearch"
        type="search"
        placeholder="Buscar equipos por nombre, código o marca..."
        class="search-input"
        @input="handleGlobalSearch"
        aria-label="Búsqueda global de equipos"
      />
    </div>

    <!-- Filter Tabs / Quick Filters -->
    <div class="filter-tabs-container">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        class="filter-tab"
        :class="{ active: activeTab === tab.id }"
        @click="selectTab(tab.id)"
        :title="tab.description"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Active Filters Pills & Advanced Toggle -->
    <div class="filter-actions">
      <div class="active-filters">
        <transition-group name="pill" tag="div" class="filters-pills">
          <div v-for="filter in activeFilters" :key="filter.id" class="filter-pill">
            <span class="pill-label">{{ filter.label }}</span>
            <button
              class="pill-remove"
              @click="removeFilter(filter.id)"
              :aria-label="`Remover ${filter.label}`"
            >
              ✕
            </button>
          </div>
        </transition-group>
      </div>

      <!-- Advanced Filter Toggle -->
      <button
        class="btn-advanced-toggle"
        :class="{ active: showAdvancedFilters }"
        @click="toggleAdvancedFilters"
        title="Filtros avanzados"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16l-6 8v5l-4 3v-8z" />
        </svg>
        {{ showAdvancedFilters ? 'Menos' : 'Más' }}
      </button>
    </div>

    <!-- Advanced Filters Panel (Expandible) -->
    <transition name="expand">
      <div v-if="showAdvancedFilters" class="advanced-filters-panel">
        <div class="advanced-filters-grid">
          <!-- Status Filter -->
          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select
              :value="advancedFilters.estatus"
              @change="updateAdvancedFilter('estatus', $event.target.value)"
              class="filter-select"
            >
              <option value="">Todos</option>
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <!-- Equipment Type Filter -->
          <div class="filter-group">
            <label class="filter-label">Equipo</label>
            <input
              :value="advancedFilters.equipoMedico"
              @input="updateAdvancedFilter('equipoMedico', $event.target.value)"
              type="text"
              placeholder="Ej: Ventilador"
              class="filter-input"
            />
          </div>

          <!-- Brand Filter -->
          <div class="filter-group">
            <label class="filter-label">Marca</label>
            <input
              :value="advancedFilters.marca"
              @input="updateAdvancedFilter('marca', $event.target.value)"
              type="text"
              placeholder="Ej: Philips"
              class="filter-input"
            />
          </div>

          <!-- Functional Filter -->
          <div class="filter-group">
            <label class="filter-label">Funcional</label>
            <select
              :value="advancedFilters.funcional"
              @change="updateAdvancedFilter('funcional', $event.target.value)"
              class="filter-select"
            >
              <option value="">Todos</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <div class="advanced-filters-actions">
          <button class="btn-clear-filters" @click="clearAllFilters">
            Limpiar filtros
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filteredCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  filters: { type: Object, required: true },
  statusOptions: { type: Array, default: () => [] },
  maintenanceCount: { type: Number, default: 0 },
  functionalCount: { type: Number, default: 0 },
  nonFunctionalCount: { type: Number, default: 0 }
})

const emit = defineEmits(['update:filters', 'update:globalSearch'])

const globalSearch = ref('')
const showAdvancedFilters = ref(false)
const activeTab = ref('all')

const advancedFilters = ref({
  estatus: props.filters.estatus || '',
  equipoMedico: props.filters.equipoMedico || '',
  marca: props.filters.marca || '',
  funcional: props.filters.funcional || ''
})

// Filter Tabs Definition
const filterTabs = computed(() => [
  {
    id: 'all',
    label: 'Todos',
    icon: '📋',
    description: 'Mostrar todos los equipos',
    count: props.totalCount
  },
  {
    id: 'maintenance',
    label: 'En Mant.',
    icon: '🔧',
    description: 'Equipos en mantenimiento',
    count: props.maintenanceCount
  },
  {
    id: 'functional',
    label: 'Funcionales',
    icon: '✅',
    description: 'Equipos funcionales',
    count: props.functionalCount
  },
  {
    id: 'broken',
    label: 'No Func.',
    icon: '❌',
    description: 'Equipos no funcionales',
    count: props.nonFunctionalCount
  }
])

// Active Filters Pills
const activeFilters = computed(() => {
  const filters = []
  if (advancedFilters.value.estatus) {
    filters.push({ id: 'estatus', label: `Estado: ${advancedFilters.value.estatus}` })
  }
  if (advancedFilters.value.equipoMedico) {
    filters.push({ id: 'equipoMedico', label: `Equipo: ${advancedFilters.value.equipoMedico}` })
  }
  if (advancedFilters.value.marca) {
    filters.push({ id: 'marca', label: `Marca: ${advancedFilters.value.marca}` })
  }
  if (advancedFilters.value.funcional) {
    filters.push({ id: 'funcional', label: `Funcional: ${advancedFilters.value.funcional}` })
  }
  return filters
})

function selectTab(tabId) {
  activeTab.value = tabId
  // Aquí podrías agregar lógica de filtrado rápido
}

function handleGlobalSearch(event) {
  emit('update:globalSearch', event.target.value)
}

function updateAdvancedFilter(key, value) {
  advancedFilters.value[key] = value
  emit('update:filters', { ...advancedFilters.value })
}

function removeFilter(filterId) {
  advancedFilters.value[filterId] = ''
  emit('update:filters', { ...advancedFilters.value })
}

function clearAllFilters() {
  advancedFilters.value = {
    estatus: '',
    equipoMedico: '',
    marca: '',
    funcional: ''
  }
  emit('update:filters', advancedFilters.value)
  showAdvancedFilters.value = false
}

function toggleAdvancedFilters() {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// Sync external filters
watch(() => props.filters, (newFilters) => {
  advancedFilters.value = { ...newFilters }
}, { deep: true })
</script>

<style scoped>
.smart-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 100%);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  margin-bottom: 24px;
}

/* Quick Stats */
.filter-stats-compact {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #e5f0ff;
}

.stat-icon {
  font-size: 1.1rem;
}

.stat-text {
  display: flex;
  flex-direction: column;
}

.stat-label {
  opacity: 0.7;
  font-size: 0.75rem;
}

.stat-value {
  font-weight: 600;
  font-size: 0.95rem;
  color: #60a5fa;
}

/* Global Search */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgba(148, 163, 184, 0.5);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  color: #e5f0ff;
  font-size: 0.9rem;
  transition: all 200ms ease;
}

.search-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Filter Tabs */
.filter-tabs-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 6px;
  color: rgba(226, 232, 240, 0.8);
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 150ms ease;
}

.filter-tab:hover {
  background: rgba(71, 85, 105, 0.3);
  border-color: rgba(59, 130, 246, 0.3);
}

.filter-tab.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%);
  border-color: rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.tab-icon {
  font-size: 1rem;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  background: rgba(59, 130, 246, 0.4);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #e5f0ff;
}

.filter-tab.active .tab-badge {
  background: rgba(59, 130, 246, 0.6);
}

/* Filter Actions -->
.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.active-filters {
  display: flex;
  flex: 1;
  min-width: 200px;
}

.filters-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.8rem;
  color: #e5f0ff;
  animation: slideInLeft 200ms ease;
}

.pill-label {
  font-weight: 500;
}

.pill-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  color: rgba(248, 113, 113, 0.7);
  cursor: pointer;
  font-size: 0.75rem;
  transition: color 150ms ease;
}

.pill-remove:hover {
  color: rgba(248, 113, 113, 1);
}

.btn-advanced-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: rgba(226, 232, 240, 0.8);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;
}

.btn-advanced-toggle:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
}

.btn-advanced-toggle.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #60a5fa;
}

/* Advanced Filters Panel */
.advanced-filters-panel {
  padding-top: 12px;
  border-top: 1px solid rgba(59, 130, 246, 0.15);
  animation: slideDown 200ms ease;
}

.advanced-filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input,
.filter-select {
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #e5f0ff;
  font-size: 0.85rem;
  transition: all 150ms ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filter-select option {
  background: #1e293b;
  color: #e5f0ff;
}

.advanced-filters-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-clear-filters {
  padding: 6px 12px;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 6px;
  color: rgba(248, 113, 113, 0.9);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-clear-filters:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.5);
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

.pill-enter-active,
.pill-leave-active {
  transition: all 200ms ease;
}

.pill-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.pill-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 200ms ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .smart-filter-bar {
    padding: 12px;
    gap: 10px;
  }

  .advanced-filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs-container {
    overflow-x: auto;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .active-filters {
    min-width: auto;
  }

  .btn-advanced-toggle {
    width: 100%;
    justify-content: center;
  }
}
</style>
