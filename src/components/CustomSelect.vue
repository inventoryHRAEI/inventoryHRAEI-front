<template>
  <div class="custom-select" ref="selectRef">
    <div class="select-trigger" :class="{ 'is-open': isOpen }" @click.stop="toggleDropdown">
      <span class="selected-text">{{ displayValue }}</span>
      <span class="arrow" :class="{ 'is-open': isOpen }">▼</span>
    </div>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-list" @click.stop>
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-item"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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
const isSelecting = ref(false)

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : props.placeholder
})

const toggleDropdown = () => {
  if (isSelecting.value) return
  isOpen.value = !isOpen.value
}

const selectOption = (value) => {
  if (isSelecting.value) return
  
  isSelecting.value = true
  emit('update:modelValue', value)
  isOpen.value = false
  
  setTimeout(() => {
    isSelecting.value = false
  }, 200)
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
.custom-select {
  position: relative;
  width: 100%;
  user-select: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid rgba(148, 163, 184, 0.25);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.85);
}

.select-trigger:hover {
  border-color: rgba(14, 165, 233, 0.4);
  background: rgba(255, 255, 255, 1);
}

.select-trigger.is-open {
  border-color: rgba(14, 165, 233, 0.6);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.selected-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  margin-left: 12px;
  font-size: 0.7rem;
  color: rgba(100, 116, 139, 0.7);
  transition: transform 0.2s ease;
}

.arrow.is-open {
  transform: rotate(180deg);
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgb(30, 41, 59);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.2);
  max-height: 160px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 99999;
  backdrop-filter: blur(10px);
}

.dropdown-item {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.92rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: rgba(6, 182, 212, 0.85);
  color: rgba(255, 255, 255, 1);
}

.dropdown-item.is-selected {
  background: rgba(14, 116, 144, 0.6);
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
}

.dropdown-item.is-selected:hover {
  background: rgba(6, 182, 212, 0.85);
}

/* Scrollbar personalizado - solo aparece al hacer scroll */
.dropdown-list {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
}

.dropdown-list:hover {
  scrollbar-color: rgba(100, 116, 139, 0.5) rgba(15, 23, 42, 0.3);
}

.dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 8px;
}

.dropdown-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.dropdown-list:hover::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}

/* Animación del dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
</style>
