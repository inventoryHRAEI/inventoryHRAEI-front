<template>
  <div class="modern-select" :class="[sizeClass, { 'is-open': isOpen, 'is-disabled': disabled }]">
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="select-wrapper" ref="wrapperRef">
      <button
        :id="selectId"
        type="button"
        class="select-trigger"
        :disabled="disabled"
        @click="toggle"
        @keydown="onKeydown"
        ref="triggerRef"
      >
        <span v-if="$slots.prefix" class="trigger-prefix">
          <slot name="prefix" />
        </span>

        <span class="trigger-value" :class="{ placeholder: !selectedOption }">
          {{ selectedOption?.label || placeholder }}
        </span>

        <svg 
          class="trigger-chevron" 
          :class="{ rotated: isOpen }"
          width="18" height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="select-dropdown" ref="dropdownRef">
          <!-- Search -->
          <div v-if="searchable" class="dropdown-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref="searchRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Buscar..."
              @input="onSearch"
            />
          </div>

          <!-- Options -->
          <div class="dropdown-options" ref="optionsRef">
            <div v-if="filteredOptions.length === 0" class="dropdown-empty">
              No hay opciones disponibles
            </div>
            
            <button
              v-for="(option, idx) in filteredOptions"
              :key="option.value"
              type="button"
              class="dropdown-option"
              :class="{ 
                'is-selected': isSelected(option),
                'is-highlighted': highlightedIndex === idx
              }"
              @click="select(option)"
              @mouseenter="highlightedIndex = idx"
            >
              <span v-if="option.icon" class="option-icon">
                <component :is="option.icon" />
              </span>
              <span class="option-label">{{ option.label }}</span>
              <svg 
                v-if="isSelected(option)"
                class="option-check"
                width="16" height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="hint && !errorMessage" class="select-hint">{{ hint }}</p>
    <p v-if="errorMessage" class="select-error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: null },
  options: {
    type: Array,
    default: () => []
    // [{ value: 'x', label: 'Label', icon: Component }]
  },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccionar...' },
  hint: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectId = useId()
const wrapperRef = ref(null)
const triggerRef = ref(null)
const dropdownRef = ref(null)
const searchRef = ref(null)
const optionsRef = ref(null)

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(0)

const sizeClass = computed(() => `size-${props.size}`)

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object') return opt
    return { value: opt, label: String(opt) }
  })
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return normalizedOptions.value
  const q = searchQuery.value.toLowerCase()
  return normalizedOptions.value.filter(opt => 
    opt.label.toLowerCase().includes(q)
  )
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => opt.value === props.modelValue)
})

function isSelected(option) {
  return option.value === props.modelValue
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    nextTick(() => {
      if (props.searchable && searchRef.value) {
        searchRef.value.focus()
      }
      // Scroll to selected option
      const selectedIdx = filteredOptions.value.findIndex(o => isSelected(o))
      if (selectedIdx >= 0) {
        highlightedIndex.value = selectedIdx
        scrollToOption(selectedIdx)
      }
    })
  } else {
    searchQuery.value = ''
  }
}

function select(option) {
  emit('update:modelValue', option.value)
  emit('change', option)
  isOpen.value = false
  searchQuery.value = ''
  triggerRef.value?.focus()
}

function onSearch() {
  highlightedIndex.value = 0
}

function onKeydown(e) {
  if (!isOpen.value) {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault()
      toggle()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      scrollToOption(highlightedIndex.value)
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToOption(highlightedIndex.value)
      break
    case 'Enter':
      e.preventDefault()
      if (filteredOptions.value[highlightedIndex.value]) {
        select(filteredOptions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      isOpen.value = false
      triggerRef.value?.focus()
      break
  }
}

function scrollToOption(index) {
  nextTick(() => {
    const optionEl = optionsRef.value?.children[index]
    optionEl?.scrollIntoView({ block: 'nearest' })
  })
}

// Click outside to close
function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

defineExpose({ isOpen, toggle })
</script>

<style scoped>
.modern-select {
  --select-bg: rgba(255, 255, 255, 0.04);
  --select-border: rgba(255, 255, 255, 0.1);
  --select-text: #e2e8f0;
  --select-focus: #3b82f6;
  
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-mark {
  color: #f87171;
}

.select-wrapper {
  position: relative;
}

/* Trigger */
.select-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: var(--select-bg);
  border: 1px solid var(--select-border);
  border-radius: 12px;
  color: var(--select-text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.size-small .select-trigger {
  padding: 8px 12px;
  font-size: 0.85rem;
}

.size-normal .select-trigger {
  padding: 12px 16px;
  font-size: 0.95rem;
}

.size-large .select-trigger {
  padding: 16px 20px;
  font-size: 1rem;
}

.select-trigger:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.select-trigger:focus {
  outline: none;
  border-color: var(--select-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.is-open .select-trigger {
  border-color: var(--select-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.trigger-prefix {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.5);
}

.trigger-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-value.placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.trigger-chevron {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.trigger-chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
}

/* Search */
.dropdown-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.4);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--select-text);
  font-family: inherit;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

/* Options */
.dropdown-options {
  max-height: 260px;
  overflow-y: auto;
  padding: 6px;
}

.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-family: inherit;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.dropdown-option:hover,
.dropdown-option.is-highlighted {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-option.is-selected {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.option-icon {
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.option-label {
  flex: 1;
}

.option-check {
  color: #60a5fa;
}

/* Hints/Errors */
.select-hint {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.select-error {
  margin: 0;
  font-size: 0.8rem;
  color: #f87171;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
