<template>
  <div class="inventory-suggestions-autocomplete">
    <!-- Campo de búsqueda/input con sugerencias -->
    <div class="autocomplete-wrapper" ref="wrapperRef">
      <input
        ref="inputRef"
        class="control autocomplete-input"
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

      <!-- Dropdown de sugerencias -->
      <transition name="dropdown-fade">
        <div v-if="showDropdown && filteredSuggestions.length > 0" class="suggestions-dropdown">
          <div
            v-for="(suggestion, index) in filteredSuggestions"
            :key="index"
            :class="['suggestion-item', { active: index === selectedIndex }]"
            @click="selectSuggestion(suggestion)"
            @mouseenter="selectedIndex = index"
          >
            <div class="suggestion-content">
              <div class="suggestion-nombre">{{ suggestion.nombre }}</div>
              <div class="suggestion-details">
                <span v-if="suggestion.marca" class="detail-badge">{{ suggestion.marca }}</span>
                <span v-if="suggestion.ubicacion" class="detail-badge">{{ suggestion.ubicacion }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Mensaje cuando no hay sugerencias -->
      <transition name="dropdown-fade">
        <div v-if="showDropdown && inputValue && filteredSuggestions.length === 0" class="no-suggestions">
          No hay sugerencias disponibles
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Escriba para buscar...'
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref(null)
const wrapperRef = ref(null)
const inputValue = ref(props.modelValue)
const showDropdown = ref(false)
const selectedIndex = ref(-1)

// Filtrar sugerencias basadas en el input
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) return props.suggestions
  
  const query = inputValue.value.toLowerCase()
  return props.suggestions.filter(item =>
    (item.nombre && item.nombre.toLowerCase().includes(query)) ||
    (item.marca && item.marca.toLowerCase().includes(query)) ||
    (item.ubicacion && item.ubicacion.toLowerCase().includes(query)) ||
    (item.label && item.label.toLowerCase().includes(query))
  )
})

// Watch para sincronizar con el prop modelValue
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

const handleInput = (event) => {
  inputValue.value = event.target.value
  emit('update:modelValue', inputValue.value)
  selectedIndex.value = -1
  showDropdown.value = true
}

const selectSuggestion = (suggestion) => {
  inputValue.value = suggestion.nombre
  emit('update:modelValue', suggestion.nombre)
  emit('select', suggestion)
  showDropdown.value = false
  selectedIndex.value = -1
}

const selectCurrentSuggestion = () => {
  if (selectedIndex.value >= 0 && filteredSuggestions.value[selectedIndex.value]) {
    selectSuggestion(filteredSuggestions.value[selectedIndex.value])
  }
}

const selectNextSuggestion = () => {
  if (filteredSuggestions.value.length > 0) {
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredSuggestions.value.length - 1)
  }
}

const selectPrevSuggestion = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const onBlur = () => {
  // Delay para permitir que se registre el click en sugerencia
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Click outside para cerrar el dropdown
function handleClickOutside(event) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.inventory-suggestions-autocomplete {
  position: relative;
  width: 100%;
}

.autocomplete-wrapper {
  position: relative;
  width: 100%;
}

.autocomplete-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  background: #fff;
  color: #1e293b;
  transition: all 0.2s;
}

.autocomplete-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #f8fafc;
}

.autocomplete-input::placeholder {
  color: #94a3b8;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f0f4f8;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-nombre {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.suggestion-details {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.detail-badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.no-suggestions {
  padding: 10px 12px;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  border: 1px solid #cbd5e1;
  border-top: none;
  border-radius: 0 0 6px 6px;
  background: #f8fafc;
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

/* Scroll personalizado para dropdown */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
