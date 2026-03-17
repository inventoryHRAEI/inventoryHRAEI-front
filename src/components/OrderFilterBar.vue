<template>
  <div class="order-filter-bar">
    <!-- Filtros principales -->
    <div class="filter-main-row">
      <div class="filter-group">
        <label>Folio de operación:</label>
        <input
          v-model="filters.filterFolio"
          class="control filter-input"
          placeholder="Ej. 5-011"
        />
      </div>

      <div class="filter-group">
        <label>Nombre del solicitante:</label>
        <input
          v-model="filters.filterSolicitante"
          class="control filter-input"
          placeholder="Ej. Dr. Juan Pérez"
        />
      </div>

      <div class="filter-group">
        <label>Filtrar por fecha:</label>
        <div style="display: flex; gap: 8px; align-items: flex-end;">
          <input
            v-model="filters.filterDateDisplay"
            type="date"
            class="control filter-input"
          />
          <button
            class="btn-add-filters compact"
            @click="showAdvanced = !showAdvanced"
            :class="{ 'has-active-filters': filters.activeFilterCount > 0 }"
            :title="`${showAdvanced ? 'Ocultar' : 'Mostrar'} filtros avanzados`"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M22 3H2l8 9v7l4 2v-9l8-9z" fill="currentColor" />
            </svg>
            <span v-if="filters.activeFilterCount > 0" class="filter-badge">
              {{ filters.activeFilterCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Panel de filtros avanzados -->
    <Transition name="filter-panel">
      <div v-if="showAdvanced" class="filter-advanced-panel">
        <div class="filter-advanced-header">
          <h4>Filtros Disponibles</h4>
          <button type="button" class="btn-close" @click="showAdvanced = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="filter-advanced-grid">
          <div v-for="filter in unavailableFilters" :key="filter.key" class="filter-checkbox">
            <label>
              <input
                type="checkbox"
                :checked="filters.activeFilters.has(filter.key)"
                @change="toggleFilter(filter.key)"
              />
              <span>{{ filter.label }}</span>
            </label>
          </div>
        </div>

        <div class="filter-advanced-footer">
          <button type="button" class="btn-done" @click="showAdvanced = false">
            Listo
          </button>
        </div>
      </div>
    </Transition>

    <!-- Filtros activos inline -->
    <TransitionGroup name="filter-active" class="filter-active-row" tag="div">
      <div
        v-for="filter in filters.activeFiltersList"
        :key="filter.key"
        class="filter-group active-filter"
      >
        <label>{{ filter.label }}</label>
        <div class="filter-input-wrapper">
          <!-- Select -->
          <template v-if="filter.type === 'select'">
            <select
              :value="filter.value"
              @change="(e) => filters.filterValues[filter.key] = e.target.value"
              class="control filter-input"
              :placeholder="filter.placeholder"
            >
              <option value="">{{ filter.placeholder }}</option>
              <option v-for="opt in filter.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </template>

          <!-- Number -->
          <template v-else-if="filter.type === 'number'">
            <input
              v-model.number="filters.filterValues[filter.key]"
              type="number"
              class="control filter-input"
              :placeholder="filter.placeholder"
              :min="filter.min"
            />
          </template>

          <!-- Time range -->
          <template v-else-if="filter.type === 'time-range'">
            <div class="time-range-inputs">
              <input
                v-model="filters.filterValues[filter.key].from"
                type="time"
                class="control filter-input"
                placeholder="Desde"
              />
              <input
                v-model="filters.filterValues[filter.key].to"
                type="time"
                class="control filter-input"
                placeholder="Hasta"
              />
            </div>
          </template>

          <!-- Text (default) -->
          <template v-else>
            <input
              v-model="filters.filterValues[filter.key]"
              type="text"
              class="control filter-input"
              :placeholder="filter.placeholder"
            />
          </template>

          <button
            type="button"
            class="btn-remove-filter"
            @click="filters.removeFilter(filter.key)"
            :title="`Remover ${filter.label}`"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- Botón limpiar todos -->
    <Transition name="fade">
      <div v-if="filters.hasActiveFilters" class="filter-clear-row">
        <button type="button" class="btn-clear-filters" @click="filters.clearAllFilters">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Limpiar todos</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const showAdvanced = ref(false)

const unavailableFilters = computed(() => {
  return props.filters.availableFilters.filter(
    f => !props.filters.activeFilters.has(f.key)
  )
})

function toggleFilter(filterKey) {
  if (props.filters.activeFilters.has(filterKey)) {
    props.filters.removeFilter(filterKey)
  } else {
    props.filters.addFilter(filterKey)
  }
}
</script>

<style scoped>
.order-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 8px;
  border: 1px solid var(--border-color, #ddd);
}

.filter-main-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  font-size: 14px;
  background: white;
  color: #333;
}

.filter-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.btn-add-filters {
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ddd);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-add-filters:hover {
  background: var(--bg-hover, #f0f0f0);
  border-color: #0066cc;
}

.btn-add-filters.has-active-filters {
  background: #0066cc;
  color: white;
  border-color: #0066cc;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #ff6b6b;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  color: white;
}

.filter-advanced-panel {
  padding: 16px;
  background: white;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
}

.filter-advanced-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.filter-advanced-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #000;
}

.filter-advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
}

.filter-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: normal;
  color: #333;
  text-transform: none;
  letter-spacing: normal;
  cursor: pointer;
  margin: 0;
}

.filter-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.filter-advanced-footer {
  text-align: right;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #ddd);
}

.btn-done {
  padding: 8px 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-done:hover {
  background: #0052a3;
}

.filter-active-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.filter-active-row.filter-active-move {
  transition: all 0.3s ease;
}

.active-filter {
  grid-column: span 1;
}

.filter-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-input-wrapper > input,
.filter-input-wrapper > select {
  flex: 1;
}

.time-range-inputs {
  display: flex;
  gap: 8px;
  flex: 1;
}

.time-range-inputs > input {
  flex: 1;
  min-width: 80px;
}

.btn-remove-filter {
  padding: 6px 8px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-remove-filter:hover {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

.filter-clear-row {
  display: flex;
  justify-content: flex-end;
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-filters:hover {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

/* Transiciones */
.filter-panel-enter-active,
.filter-panel-leave-active {
  transition: all 0.3s ease;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.filter-active-enter-active,
.filter-active-leave-active {
  transition: all 0.3s ease;
}

.filter-active-enter-from,
.filter-active-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-main-row {
    grid-template-columns: 1fr;
  }

  .filter-active-row {
    grid-template-columns: 1fr;
  }

  .filter-advanced-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
