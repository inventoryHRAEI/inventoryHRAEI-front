<template>
  <div class="datepicker-wrapper" ref="wrapper">
    <div class="datepicker-input-container">
      <input
        type="text"
        ref="inputEl"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
        class="datepicker-input"
        @click="togglePicker"
      />
      <span class="datepicker-icon" @click="togglePicker">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </span>
    </div>
    
    <Teleport to="body">
      <div v-if="isOpen" class="datepicker-dropdown" ref="dropdown" :style="dropdownStyle">
      <div class="datepicker-header">
        <div class="nav-section">
          <button type="button" class="nav-btn" @click="prevMonth" title="Mes anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span class="current-label">{{ monthNames[currentMonth] }}</span>
          <button type="button" class="nav-btn" @click="nextMonth" title="Mes siguiente">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <div class="nav-section">
          <button type="button" class="nav-btn" @click="prevYear" title="Año anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
          </button>
          <span class="current-label">{{ currentYear }}</span>
          <button type="button" class="nav-btn" @click="nextYear" title="Año siguiente">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          </button>
        </div>
      </div>
      
      <div class="datepicker-weekdays">
        <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
      </div>
      
      <div class="datepicker-days">
        <button
          v-for="(day, index) in calendarDays"
          :key="index"
          type="button"
          class="day-btn"
          :class="{
            'other-month': !day.currentMonth,
            'today': day.isToday,
            'selected': day.isSelected
          }"
          @click="selectDate(day)"
        >
          {{ day.day }}
        </button>
      </div>
      
      <div class="datepicker-footer">
        <button type="button" class="today-btn" @click="selectToday">Hoy</button>
      </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Date], default: '' },
  placeholder: { type: String, default: 'Seleccionar fecha' },
  format: { type: String, default: 'dd/mm/yyyy' }
})

const emit = defineEmits(['update:modelValue'])

const wrapper = ref(null)
const inputEl = ref(null)
const dropdown = ref(null)
const isOpen = ref(false)
const dropdownPosition = ref({ top: 0, left: 0 })

const currentDate = ref(new Date())
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedDate = ref(null)

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  const d = selectedDate.value
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
})

const dropdownStyle = computed(() => ({
  position: 'fixed',
  top: `${dropdownPosition.value.top}px`,
  left: `${dropdownPosition.value.left}px`
}))

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  let startDay = firstDay.getDay()
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  startDay = startDay === 0 ? 6 : startDay - 1
  
  // Previous month days
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i)
    days.push({
      day: prevMonthLastDay - i,
      date: d,
      currentMonth: false,
      isToday: false,
      isSelected: selectedDate.value && d.getTime() === selectedDate.value.getTime()
    })
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(currentYear.value, currentMonth.value, i)
    d.setHours(0, 0, 0, 0)
    days.push({
      day: i,
      date: d,
      currentMonth: true,
      isToday: d.getTime() === today.getTime(),
      isSelected: selectedDate.value && d.getTime() === selectedDate.value.getTime()
    })
  }
  
  // Next month days
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      day: i,
      date: d,
      currentMonth: false,
      isToday: false,
      isSelected: selectedDate.value && d.getTime() === selectedDate.value.getTime()
    })
  }
  
  return days
})

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

const togglePicker = () => {
  if (!isOpen.value) {
    updateDropdownPosition()
  }
  isOpen.value = !isOpen.value
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const prevYear = () => {
  currentYear.value--
}

const nextYear = () => {
  currentYear.value++
}

const selectDate = (day) => {
  selectedDate.value = new Date(day.date)
  selectedDate.value.setHours(0, 0, 0, 0)
  emit('update:modelValue', displayValue.value)
  isOpen.value = false
}

const selectToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  selectedDate.value = today
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
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
const parseDate = (val) => {
  if (!val) return null
  if (val instanceof Date) return val
  // Try to parse dd/mm/yyyy format
  const parts = val.split('/')
  if (parts.length === 3) {
    const d = new Date(parts[2], parts[1] - 1, parts[0])
    if (!isNaN(d.getTime())) return d
  }
  // Try native parsing
  const d = new Date(val)
  if (!isNaN(d.getTime())) return d
  return null
}

watch(() => props.modelValue, (val) => {
  const parsed = parseDate(val)
  if (parsed) {
    selectedDate.value = parsed
    currentMonth.value = parsed.getMonth()
    currentYear.value = parsed.getFullYear()
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
.datepicker-wrapper {
  position: relative;
  width: 100%;
}

.datepicker-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.datepicker-input {
  width: 100%;
  height: 2.7rem;
  padding: 0.55rem 2.5rem 0.55rem 0.9rem;
  border-radius: 14px;
  font-size: 0.95rem;
  background: rgba(15, 20, 40, 0.65);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.datepicker-input:hover {
  border-color: rgba(0, 255, 106, 0.4);
}

.datepicker-input:focus {
  outline: none;
  border-color: rgba(0, 255, 106, 0.6);
  box-shadow: 0 0 0 3px rgba(0, 255, 106, 0.15);
}

.datepicker-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.datepicker-icon {
  position: absolute;
  right: 12px;
  color: #00ff6a;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.datepicker-icon:hover {
  transform: scale(1.1);
}

/* Dropdown Calendar */
.datepicker-dropdown {
  position: fixed;
  z-index: 99999;
  background: rgba(2, 8, 18, 0.98);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 255, 106, 0.4);
  border-radius: 16px;
  padding: 12px;
  min-width: 280px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  animation: dropdownFadeIn 0.15s ease;
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
.datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 4px;
  margin-bottom: 8px;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 8px;
  border-radius: 8px;
}

.current-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #ffffff;
  min-width: 75px;
  text-align: center;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 255, 106, 0.12);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(0, 255, 106, 0.25);
  color: #00ff6a;
}

/* Weekdays */
.datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 6px;
  padding: 6px 0;
  background: rgba(0, 255, 106, 0.08);
  border-radius: 8px;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(0, 255, 106, 0.8);
  padding: 4px 0;
}

/* Days Grid */
.datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.day-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-btn:hover {
  background: rgba(0, 255, 106, 0.25);
}

.day-btn.other-month {
  color: rgba(255, 255, 255, 0.25);
  background: transparent;
}

.day-btn.today {
  background: rgba(0, 255, 106, 0.2);
  border: 2px solid rgba(0, 255, 106, 0.5);
  color: #00ff6a;
  font-weight: 700;
}

.day-btn.selected {
  background: #00ff6a !important;
  color: #000000 !important;
  font-weight: 700;
}

/* Footer */
.datepicker-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.today-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(0, 255, 106, 0.4);
  border-radius: 10px;
  background: rgba(0, 255, 106, 0.1);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background: rgba(0, 255, 106, 0.2);
  border-color: rgba(0, 255, 106, 0.6);
}

/* Responsive fixes for small mobile devices (405px width) */
@media (max-width: 420px) {
  .datepicker-dropdown {
    min-width: 95vw;
    max-width: 95vw;
    left: 50% !important;
    transform: translateX(-50%);
    padding: 10px;
  }

  .datepicker-header {
    flex-direction: column;
    gap: 6px;
  }

  .nav-section {
    width: 100%;
    justify-content: space-between;
    padding: 6px 10px;
  }

  .current-label {
    font-size: 0.9rem;
    min-width: auto;
    flex: 1;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .day-btn {
    width: 100%;
    height: 38px;
    font-size: 0.9rem;
  }

  .datepicker-days {
    gap: 4px;
  }

  .weekday {
    font-size: 0.8rem;
  }
}
</style>
