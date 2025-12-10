<template>
  <div class="custom-select-wrapper" ref="selectRef">
    <button
      type="button"
      class="custom-select-button"
      :class="{ 'is-open': isOpen }"
      @click.stop="toggleDropdown"
    >
      <span class="select-value">{{ displayValue }}</span>
      <svg class="select-arrow" :class="{ 'is-open': isOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <transition name="dropdown-fade">
      <div v-if="isOpen" class="custom-select-dropdown" @click.stop>
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-option"
          :class="{ 'is-selected': modelValue === option.value }"
          @click.stop="selectOption(option.value)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Seleccionar'
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectRef = ref(null)

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : props.placeholder
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

watch(isOpen, (open) => {
  emit('toggle', open)
})

const selectOption = (value) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
  border-radius: 9999px;
  background: transparent;
}

.custom-select-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(15, 20, 40, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
  font-family: inherit;
}

.custom-select-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.custom-select-button:active,
.custom-select-button.is-open {
  background: rgba(255, 255, 255, 0.08);
}

.select-value {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  margin-left: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.select-arrow.is-open {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgb(17, 24, 39);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  max-height: 200px;
  overflow-y: auto;
  z-index: 9999;
}

.dropdown-option {
  padding: 12px 18px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 0.95rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

.dropdown-option.is-selected {
  background: rgba(46, 221, 90, 0.15);
  color: rgba(46, 221, 90, 0.95);
  font-weight: 600;
}

.dropdown-option.is-selected:hover {
  background: rgba(46, 221, 90, 0.25);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 420px) {
  .custom-select-button {
    font-size: 0.92rem;
    padding: 10px 14px;
  }
}
</style>
