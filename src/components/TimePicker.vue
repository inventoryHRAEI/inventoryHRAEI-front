<template>
  <div class="timepicker-wrapper" ref="wrapper">
    <div class="timepicker-input-container">
      <input
        type="text"
        ref="inputEl"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
        class="timepicker-input"
        @click="openPicker"
        @focus="openPicker"
        @keydown.enter.prevent="openPicker"
      />
      <span class="timepicker-icon" @click="togglePicker">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </span>
    </div>
    
    <Teleport to="body">
      <div v-if="isOpen" class="timepicker-dropdown" ref="dropdown" :style="dropdownStyle">
        <div class="timepicker-header">
          <span class="timepicker-title">Seleccionar hora</span>
        </div>
        
        <div class="timepicker-selectors">
          <!-- Hours -->
          <div class="time-column">
            <button type="button" class="time-nav-btn" @click="incrementHour">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <div class="time-value">{{ String(selectedHour).padStart(2, '0') }}</div>
            <button type="button" class="time-nav-btn" @click="decrementHour">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
          
          <span class="time-separator">:</span>
          
          <!-- Minutes -->
          <div class="time-column">
            <button type="button" class="time-nav-btn" @click="incrementMinute">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <div class="time-value">{{ String(selectedMinute).padStart(2, '0') }}</div>
            <button type="button" class="time-nav-btn" @click="decrementMinute">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        </div>
        
        <div class="quick-times">
          <button type="button" class="quick-time-btn" @click="setQuickTime(8, 0)">08:00</button>
          <button type="button" class="quick-time-btn" @click="setQuickTime(12, 0)">12:00</button>
          <button type="button" class="quick-time-btn" @click="setQuickTime(14, 0)">14:00</button>
          <button type="button" class="quick-time-btn" @click="setQuickTime(18, 0)">18:00</button>
        </div>
        
        <div class="timepicker-footer">
          <button type="button" class="now-btn" @click="selectNow">Ahora</button>
          <button type="button" class="confirm-btn" @click="confirmTime">Aceptar</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccionar hora' }
})

const emit = defineEmits(['update:modelValue'])

const wrapper = ref(null)
const inputEl = ref(null)
const dropdown = ref(null)
const isOpen = ref(false)
const dropdownPosition = ref({ top: 0, left: 0 })

const selectedHour = ref(12)
const selectedMinute = ref(0)

const displayValue = computed(() => {
  if (selectedHour.value === null) return ''
  return `${String(selectedHour.value).padStart(2, '0')}:${String(selectedMinute.value).padStart(2, '0')}`
})

const dropdownStyle = computed(() => ({
  position: 'fixed',
  top: `${dropdownPosition.value.top}px`,
  left: `${dropdownPosition.value.left}px`
}))

const updateDropdownPosition = () => {
  if (!inputEl.value) return
  const rect = inputEl.value.getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom + 6,
    left: rect.left
  }
}

const handleScroll = () => {
  if (isOpen.value) {
    isOpen.value = false
  }
}

const openPicker = () => {
  if (!isOpen.value) {
    updateDropdownPosition()
    isOpen.value = true
    // focus input to keep keyboard accessibility
    if (inputEl.value) inputEl.value.focus()
  }
}

const togglePicker = () => {
  if (!isOpen.value) {
    updateDropdownPosition()
  }
  isOpen.value = !isOpen.value
}

const incrementHour = () => {
  selectedHour.value = (selectedHour.value + 1) % 24
}

const decrementHour = () => {
  selectedHour.value = selectedHour.value === 0 ? 23 : selectedHour.value - 1
}

const incrementMinute = () => {
  selectedMinute.value = (selectedMinute.value + 5) % 60
}

const decrementMinute = () => {
  selectedMinute.value = selectedMinute.value < 5 ? 55 : selectedMinute.value - 5
}

const setQuickTime = (hour, minute) => {
  selectedHour.value = hour
  selectedMinute.value = minute
}

const selectNow = () => {
  const now = new Date()
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
}

const confirmTime = () => {
  emit('update:modelValue', displayValue.value)
  isOpen.value = false
}

const handleClickOutside = (e) => {
  const clickedWrapper = wrapper.value && wrapper.value.contains(e.target)
  const clickedDropdown = dropdown.value && dropdown.value.contains(e.target)
  if (!clickedWrapper && !clickedDropdown) {
    isOpen.value = false
  }
}

// Parse initial value
const parseTime = (val) => {
  if (!val) return null
  const parts = val.split(':')
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
      return { hour: h, minute: m }
    }
  }
  return null
}

watch(() => props.modelValue, (val) => {
  const parsed = parseTime(val)
  if (parsed) {
    selectedHour.value = parsed.hour
    selectedMinute.value = parsed.minute
  }
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>

<style scoped>
.timepicker-wrapper {
  position: relative;
  width: 100%;
}

.timepicker-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.timepicker-input {
  width: 100%;
  height: 2.7rem; /* match .control height in OpEntrada */
  padding: 0.55rem 2.2rem 0.55rem 0.9rem; /* similar to .control */
  border-radius: 25px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(15, 23, 42, 0.92);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
  box-sizing: border-box;
}

.timepicker-input:hover {
  border-color: rgba(0, 255, 106, 0.4);
}

.timepicker-input:focus {
  outline: none;
  border-color: rgba(0, 255, 106, 0.6);
  box-shadow: 0 0 0 3px rgba(0, 255, 106, 0.15);
}

.timepicker-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.timepicker-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(15, 23, 42, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.timepicker-icon:hover {
  transform: scale(1.1);
}

/* Dropdown */
.timepicker-dropdown {
  position: fixed;
  z-index: 99999;
  background: rgba(2, 8, 18, 0.98);
  backdrop-filter: blur(16px);
  border: 2px solid rgba(0, 255, 106, 0.36);
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  animation: dropdownFadeIn 0.12s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.timepicker-header {
  text-align: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.timepicker-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Time Selectors */
.timepicker-selectors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
}

.time-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.time-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 255, 106, 0.10);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.12s ease;
}

.time-nav-btn:hover {
  background: rgba(0, 255, 106, 0.25);
  color: #00ff6a;
}

.time-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  min-width: 44px;
  text-align: center;
  padding: 6px 0;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
}

.time-separator {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(0, 255, 106, 0.8);
  padding-bottom: 2px;
}

/* Quick Times */
.quick-times {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 8px;
}

.quick-time-btn {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.quick-time-btn:hover {
  background: rgba(0, 255, 106, 0.15);
  border-color: rgba(0, 255, 106, 0.4);
  color: #ffffff;
}

/* Footer */
.timepicker-footer {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.now-btn,
.confirm-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
}

.now-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.now-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.confirm-btn {
  background: rgba(0, 255, 106, 0.12);
  border: 1px solid rgba(0, 255, 106, 0.36);
  color: #00ff6a;
}

.confirm-btn:hover {
  background: rgba(0, 255, 106, 0.2);
  border-color: rgba(0, 255, 106, 0.5);
}
</style>
