<template>
  <div class="searchable-input-wrapper">
    <!-- Badge N/A opcional -->
    <div v-if="modelValue === 'N/A'" class="na-badge" title="Campo sin datos en el inventario">
      N/A
    </div>

    <!-- Input Container -->
    <div class="searchable-input-container">
      <input
        ref="inputRef"
        class="control searchable-input"
        :class="{ 'has-na': modelValue === 'N/A' }"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="showDropdown = true"
        @blur="onBlur"
        @keydown.down="selectNextSuggestion"
        @keydown.up="selectPrevSuggestion"
        @keydown.enter="selectCurrentSuggestion"
        @keydown.escape="showDropdown = false"
        autocomplete="off"
      />

      <!-- Clear Button -->
      <button
        v-if="modelValue && modelValue !== 'N/A'"
        class="clear-suggestion-btn"
        @click="clearSuggestion"
        type="button"
        title="Borrar sugerencia"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Dropdown con Grupos de Resultados -->
    <transition name="dropdown-fade">
      <div v-if="showDropdown && hasResults" class="suggestions-dropdown">
        <!-- Cada grupo de tipo -->
        <div v-for="group in groupedSuggestions" :key="group.type" class="suggestion-group">
          <!-- Encabezado del grupo -->
          <div class="group-header">
            <span class="group-icon">{{ getGroupIcon(group.type) }}</span>
            <span class="group-title">{{ getGroupLabel(group.type) }}</span>
            <span class="group-count">{{ group.items.length }}</span>
          </div>

          <!-- Items del grupo -->
          <div class="group-items">
            <div
              v-for="(suggestion, idx) in group.items"
              :key="`${group.type}-${idx}`"
              :class="['suggestion-item', { active: isItemActive(group.type, idx) }]"
              @click="selectSuggestion(suggestion)"
              @mouseenter="setActiveItem(group.type, idx)"
            >
              <div class="item-content">
                <div class="item-name" v-html="highlightMatch(suggestion[fieldName], inputValue)"></div>
                <div class="item-specs">
                  <span
                    v-if="hasValidValue(suggestion.marca)"
                    class="spec"
                    :title="`Marca: ${suggestion.marca}`"
                  >
                    {{ suggestion.marca }}
                  </span>
                  <span
                    v-if="hasValidValue(suggestion.modelo)"
                    class="spec"
                    :title="`Modelo: ${suggestion.modelo}`"
                  >
                    {{ suggestion.modelo }}
                  </span>
                  <span
                    v-if="hasValidValue(suggestion.serie)"
                    class="spec"
                    :title="`Serie: ${suggestion.serie}`"
                  >
                    {{ suggestion.serie }}
                  </span>
                  <span v-if="hasValidValue(suggestion.noInventario)" class="spec inv">
                    Inv: {{ suggestion.noInventario }}
                  </span>
                  <span
                    v-if="hasValidValue(suggestion.referencia)"
                    class="spec"
                    :title="`Referencia: ${suggestion.referencia}`"
                  >
                    Ref: {{ suggestion.referencia }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Opción para agregar personalizado -->
        <div
          v-if="inputValue && !exactMatch"
          class="suggestion-item-custom"
          @click="selectCustomValue"
        >
          <span class="custom-icon">+</span>
          <span>Agregar "{{ inputValue }}" como personalizado</span>
        </div>
      </div>
    </transition>

    <!-- Sin resultados -->
    <transition name="dropdown-fade">
      <div v-if="showDropdown && !hasResults && inputValue" class="no-suggestions">
        <p>No se encontraron coincidencias para "{{ inputValue }}"</p>
        <button type="button" class="btn-add-custom" @click="selectCustomValue">
          <span class="custom-icon">+</span>
          Agregar como personalizado
        </button>
      </div>
    </transition>

    <!-- Hint: cantidad de resultados -->
    <div v-if="showDropdown && (hasResults || inputValue)" class="suggestions-hint">
      <small v-if="hasResults">{{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }} encontrado{{ totalResults !== 1 ? 's' : '' }}</small>
      <small v-else-if="inputValue" class="text-muted">Sin coincidencias</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  suggestions: {
    type: [Array, Function],
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Escriba para buscar...'
  },
  fieldName: {
    type: String,
    default: 'nombre'
  },
  searchKeys: {
    type: Array,
    default: () => ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario', 'label']
  },
  tipo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref(null)
const inputValue = ref(props.modelValue)
const showDropdown = ref(false)
const activeGroupType = ref(null)
const activeItemIndex = ref(-1)

// Obtener todas las sugerencias
const allSuggestions = computed(() => {
  let list = []
  if (typeof props.suggestions === 'function') {
    list = props.suggestions(props.tipo, inputValue.value, props.fieldName)
  } else {
    list = props.suggestions || []
  }
  // Limitar a 200 para rendimiento pero más que antes
  return list.slice(0, 200)
})

// Agrupar sugerencias por tipo
const groupedSuggestions = computed(() => {
  const groups = {
    'equipo-medico': { type: 'equipo-medico', items: [] },
    'mobiliario': { type: 'mobiliario', items: [] },
    'accesorio': { type: 'accesorio', items: [] },
    'consumible': { type: 'consumible', items: [] },
    'refaccion': { type: 'refaccion', items: [] }
  }

  allSuggestions.value.forEach(suggestion => {
    const itemType = suggestion.tipo || 'unknown'
    if (groups[itemType]) {
      groups[itemType].items.push(suggestion)
    }
  })

  // Devolver solo grupos con items
  return Object.values(groups).filter(g => g.items.length > 0)
})

const hasResults = computed(() => groupedSuggestions.value.some(g => g.items.length > 0))

const totalResults = computed(() => {
  return groupedSuggestions.value.reduce((sum, g) => sum + g.items.length, 0)
})

const exactMatch = computed(() => {
  return allSuggestions.value.some(
    s => s[props.fieldName]?.toLowerCase() === inputValue.value.toLowerCase()
  )
})

// Validar si un valor es válido (no N/A, no vacío)
const hasValidValue = (valor) => {
  if (!valor) return false
  const strValue = typeof valor === 'string' ? valor : valor.toString()
  const cleaned = strValue.trim()
  if (cleaned === '') return false
  if (cleaned.toUpperCase() === 'N/A') return false
  if (/^[-_0]*$/.test(cleaned)) return false
  return true
}

// Resaltar coincidencias
const highlightMatch = (text, query) => {
  if (!query || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Iconos para cada tipo
const getGroupIcon = (type) => {
  const icons = {
    'equipo-medico': '⚕️',
    'mobiliario': '🪑',
    'accesorio': '📦',
    'consumible': '💊',
    'refaccion': '🔧'
  }
  return icons[type] || '📋'
}

// Labels para cada tipo
const getGroupLabel = (type) => {
  const labels = {
    'equipo-medico': 'Equipos Médicos',
    'mobiliario': 'Mobiliario Médico',
    'accesorio': 'Accesorios',
    'consumible': 'Consumibles',
    'refaccion': 'Refacciones'
  }
  return labels[type] || type
}

// Verificar si un item está activo
const isItemActive = (groupType, itemIndex) => {
  return activeGroupType.value === groupType && activeItemIndex.value === itemIndex
}

// Establecer item activo (por hover)
const setActiveItem = (groupType, itemIndex) => {
  activeGroupType.value = groupType
  activeItemIndex.value = itemIndex
}

// Handlers
const handleInput = (event) => {
  inputValue.value = event.target.value
  emit('update:modelValue', inputValue.value)
  activeGroupType.value = null
  activeItemIndex.value = -1
  showDropdown.value = true
}

const selectSuggestion = (suggestion) => {
  const fieldValue = suggestion[props.fieldName] || suggestion.label || ''
  inputValue.value = fieldValue
  emit('update:modelValue', fieldValue)
  emit('select', suggestion)
  showDropdown.value = false
  activeGroupType.value = null
  activeItemIndex.value = -1
}

const selectCustomValue = () => {
  const customSuggestion = {
    [props.fieldName]: inputValue.value,
    label: inputValue.value
  }
  selectSuggestion(customSuggestion)
}

const selectNextSuggestion = () => {
  if (!hasResults.value) return

  if (activeGroupType.value === null) {
    // Primer item del primer grupo
    const firstGroup = groupedSuggestions.value[0]
    if (firstGroup) {
      activeGroupType.value = firstGroup.type
      activeItemIndex.value = 0
    }
  } else {
    // Siguiente item
    const currentGroup = groupedSuggestions.value.find(g => g.type === activeGroupType.value)
    if (!currentGroup) return

    if (activeItemIndex.value < currentGroup.items.length - 1) {
      activeItemIndex.value++
    } else {
      // Siguiente grupo
      const currentGroupIdx = groupedSuggestions.value.findIndex(g => g.type === activeGroupType.value)
      if (currentGroupIdx < groupedSuggestions.value.length - 1) {
        activeGroupType.value = groupedSuggestions.value[currentGroupIdx + 1].type
        activeItemIndex.value = 0
      }
    }
  }
}

const selectPrevSuggestion = () => {
  if (!hasResults.value) return

  if (activeGroupType.value === null) {
    // Último item del último grupo
    const lastGroup = groupedSuggestions.value[groupedSuggestions.value.length - 1]
    if (lastGroup) {
      activeGroupType.value = lastGroup.type
      activeItemIndex.value = lastGroup.items.length - 1
    }
  } else {
    // Item anterior
    if (activeItemIndex.value > 0) {
      activeItemIndex.value--
    } else {
      // Grupo anterior
      const currentGroupIdx = groupedSuggestions.value.findIndex(g => g.type === activeGroupType.value)
      if (currentGroupIdx > 0) {
        const prevGroup = groupedSuggestions.value[currentGroupIdx - 1]
        activeGroupType.value = prevGroup.type
        activeItemIndex.value = prevGroup.items.length - 1
      }
    }
  }
}

const selectCurrentSuggestion = () => {
  if (activeGroupType.value !== null && activeItemIndex.value >= 0) {
    const group = groupedSuggestions.value.find(g => g.type === activeGroupType.value)
    if (group && group.items[activeItemIndex.value]) {
      selectSuggestion(group.items[activeItemIndex.value])
    }
  } else if (inputValue.value && !exactMatch.value) {
    selectCustomValue()
  }
}

const onBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const clearSuggestion = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  showDropdown.value = false
  activeGroupType.value = null
  activeItemIndex.value = -1
  nextTick(() => {
    inputRef.value?.focus()
  })
}

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})
</script>

<style scoped>
.searchable-input-wrapper {
  position: relative;
  width: 100%;
}

.searchable-input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.na-badge {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  background: #fecaca;
  color: #991b1b;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.searchable-input {
  width: 100%;
  padding: 10px 40px 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  color: #1e293b;
  transition: all 0.2s;
  font-family: inherit;
}

.searchable-input.has-na {
  padding-right: 50px;
  color: #dc2626;
  font-weight: 500;
  background: #fef2f2;
  border-color: #fecaca;
}

.searchable-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #f8fafc;
}

.searchable-input.has-na:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.searchable-input::placeholder {
  color: #94a3b8;
}

.clear-suggestion-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 5;
}

.clear-suggestion-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.clear-suggestion-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 480px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.suggestion-group {
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-group:last-of-type {
  border-bottom: none;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #e2e8f0;
}

.group-icon {
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
}

.group-title {
  flex: 1;
}

.group-count {
  background: #e0f2fe;
  color: #0369a1;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
}

.group-items {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.suggestion-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.12s;
  border-left: 3px solid transparent;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f0f4f8;
  border-left-color: #3b82f6;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.3;
}

.item-name :deep(mark) {
  background: #fef08a;
  color: #1e293b;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 700;
}

.item-specs {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
}

.spec {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: #dbeafe;
  color: #075985;
  padding: 3px 7px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spec.inv {
  background: #dcfce7;
  color: #166534;
}

.suggestion-item-custom {
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.12s;
  border-top: 1px solid #f1f5f9;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  font-weight: 600;
  font-size: 0.9rem;
}

.suggestion-item-custom:hover {
  background: #dcfce7;
}

.custom-icon {
  font-weight: bold;
  font-size: 1.1rem;
  display: inline-flex;
}

.no-suggestions {
  padding: 20px 14px;
  text-align: center;
}

.no-suggestions p {
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 0.95rem;
}

.btn-add-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-custom:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-add-custom:active {
  transform: translateY(0);
}

.suggestions-hint {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  padding: 0 4px;
}

.suggestions-hint small {
  display: block;
}

.suggestions-hint .text-muted {
  color: #cbd5e1;
  font-style: italic;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Scroll personalizado */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.6);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .searchable-input {
    background: #1e293b;
    border-color: #334155;
    color: #e2e8f0;
  }

  .searchable-input:focus {
    border-color: #0ea5e9;
    background: #0f172a;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  .suggestions-dropdown {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }

  .group-header {
    background: #0f172a;
    border-bottom-color: #334155;
    color: #cbd5e1;
  }

  .group-count {
    background: rgba(30, 144, 255, 0.1);
    color: #60a5fa;
  }

  .suggestion-item:hover,
  .suggestion-item.active {
    background: #334155;
    border-left-color: #0ea5e9;
  }

  .item-name {
    color: #e2e8f0;
  }

  .item-name :deep(mark) {
    background: rgba(250, 204, 21, 0.2);
    color: #fcd34d;
  }

  .item-specs {
    gap: 4px;
  }

  .spec {
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
  }

  .spec.inv {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
  }

  .suggestion-item-custom {
    background: rgba(34, 197, 94, 0.1);
    border-top-color: #334155;
    color: #86efac;
  }

  .suggestion-item-custom:hover {
    background: rgba(34, 197, 94, 0.15);
  }

  .no-suggestions {
    color: #cbd5e1;
  }

  .no-suggestions p {
    color: #94a3b8;
  }
}
</style>
