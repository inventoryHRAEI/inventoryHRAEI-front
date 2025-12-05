    <template>
  <div class="custom-date-picker" ref="container">
    <input
      :value="formattedValue"
      @input="handleInput"
      :placeholder="placeholder"
      readonly
      class="date-input"
      ref="input"
    />
    <div class="calendar-icon" @click="toggleCalendar">
      📅
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Spanish } from 'flatpickr/dist/l10n/es.js'

// Optional Flowbite Datepicker constructor (loaded dynamically)
let FlowbiteDatepicker = null

const props = defineProps({
  modelValue: { type: [String, Date], default: '' },
  placeholder: { type: String, default: 'Seleccionar fecha' },
  forceFlowbite: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const container = ref(null)
const input = ref(null)
let fp = null
let reposition = null
const SCROLLBAR_RESERVE = 18
let fbInputHandler = null

const formattedValue = ref(props.modelValue || '')

const handleInput = (e) => {
  const value = e.target.value
  emit('update:modelValue', value)
}

const toggleCalendar = () => {
  if (!fp) return
  try {
    if (typeof fp.open === 'function') fp.open()
    else if (typeof fp.show === 'function') fp.show()
  } catch (e) { /* ignore */ }
}


  // Force skill: reposition calendar when scrolling/resizing to avoid wrong placement
  reposition = () => {
    if (fp) {
      // Prefer the documented method if available, fallback to internal
      try {
        if (typeof fp.positionCalendar === 'function') fp.positionCalendar()
        else if (typeof fp._positionCalendar === 'function') fp._positionCalendar()
      } catch (e) {
        // ignore
      }
      // Also set our manual positioning to ensure alignment to input
      try { setCalendarPosition() } catch (e) { /* ignore */ }
    }
  }
  window.addEventListener('scroll', reposition, true)
  window.addEventListener('resize', reposition)

onMounted(async () => {
  const el = input.value
  if (!el) return
  try {
    if (props.forceFlowbite) {
      // Try to dynamically import the Flowbite Datepicker ESM build
      try {
        // Use the package's exports map to import the Datepicker entrypoint
        // Import via the module's exported path to satisfy Node's package exports
        const mod = await import('flowbite-datepicker/Datepicker')
        // The CSS is now imported globally in main.js via Tailwind (see src/styles/vendor/flowbite-datepicker.css)
        const ctor = mod.Datepicker || mod.default || mod
        FlowbiteDatepicker = ctor
        // Make constructor available globally so locales (legacy UMD files) can attach if needed
        try { globalThis.Datepicker = ctor } catch (e) { /* ignore */ }
        // Attach Spanish locale to the constructor so Flowbite can use it
        try {
          FlowbiteDatepicker.locales = FlowbiteDatepicker.locales || {}
          FlowbiteDatepicker.locales.es = {
            days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
            daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
            months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            today: "Hoy",
            monthsTitle: "Meses",
            clear: "Borrar",
            weekStart: 1,
            format: "dd/mm/yyyy"
          }
        } catch (e) { /* ignore */ }
        // Flowbite Datepicker may attach to the input differently depending on version
          try {
          fp = new ctor(el, { language: 'es', lang: 'es', format: 'dd/mm/yyyy' })
          fbInputHandler = (e) => emit('update:modelValue', e.target.value)
          el.addEventListener('input', fbInputHandler)
          // Set initial display value
          if (props.modelValue) el.value = props.modelValue
          console.debug('[DatePicker] Using Flowbite Datepicker (constructor)')
        } catch (e) {
          // fallback to invocation style Datepicker(el, opts)
          try {
            fp = ctor(el, { language: 'es', lang: 'es', format: 'dd/mm/yyyy' })
            fbInputHandler = (e) => emit('update:modelValue', e.target.value)
            el.addEventListener('input', fbInputHandler)
            if (props.modelValue) el.value = props.modelValue
            console.debug('[DatePicker] Using Flowbite Datepicker (invocation)')
          } catch (ee) {
            // Fall back to flatpickr if Flowbite fails
            fp = flatpickr(el, {
              locale: { ...Spanish, firstDayOfWeek: 1 },
              dateFormat: 'd/m/Y',
              defaultDate: props.modelValue || null,
              appendTo: container.value,
              position: 'below',
              onReady: () => { try { applyGlassmorphismStyles(); setTimeout(setCalendarPosition, 10); ensureTodayButton(document.querySelector('.flatpickr-calendar')) } catch(e){} },
              onOpen: () => { try { setCalendarPosition(); ensureTodayButton(document.querySelector('.flatpickr-calendar')) } catch(e){} },
              onMonthChange: () => { try { setCalendarPosition() } catch(e){} },
              onChange: (selectedDates, dateStr) => emit('update:modelValue', dateStr)
            })
          }
        }
      } catch (e) {
        // If import failed, fallback to flatpickr
        fp = flatpickr(el, {
          locale: { ...Spanish, firstDayOfWeek: 1 },
          dateFormat: 'd/m/Y',
          defaultDate: props.modelValue || null,
          appendTo: container.value,
          position: 'below',
          onReady: () => { try { applyGlassmorphismStyles(); setTimeout(setCalendarPosition, 10); ensureTodayButton(document.querySelector('.flatpickr-calendar')) } catch(e){} },
          onOpen: () => { try { setCalendarPosition(); ensureTodayButton(document.querySelector('.flatpickr-calendar')) } catch(e){} },
          onMonthChange: () => { try { setCalendarPosition() } catch(e){} },
          onChange: (selectedDates, dateStr) => emit('update:modelValue', dateStr)
        })
        if (props.modelValue) el.value = props.modelValue
        console.debug('[DatePicker] Using flatpickr (Flowbite import failed)')
      }
    } else {
      // Default to flatpickr
      fp = flatpickr(el, {
        locale: { ...Spanish, firstDayOfWeek: 1 },
        dateFormat: 'd/m/Y',
        defaultDate: props.modelValue || null,
        appendTo: container.value,
        position: 'below',
        onReady: () => { try { applyGlassmorphismStyles(); setTimeout(setCalendarPosition, 10); ensureTodayButton(document.querySelector('.flatpickr-calendar')) } catch(e){} },
        onOpen: () => { try { setCalendarPosition(); ensureTodayButton(document.querySelector('.flatpickr-calendar')) } catch(e){} },
        onMonthChange: () => { try { setCalendarPosition() } catch(e){} },
        onChange: (selectedDates, dateStr) => emit('update:modelValue', dateStr)
      })
      if (props.modelValue) el.value = props.modelValue
      console.debug('[DatePicker] Using flatpickr (default)')
    }
    // Apply styling and adjust position after creation
    setTimeout(() => {
      try { applyGlassmorphismStyles() } catch (e) { /* ignore */ }
      try { setCalendarPosition() } catch (e) { /* ignore */ }
    }, 8)
  } catch (e) {
    // Should never happen; just print if it does
    console.warn('Datepicker init error', e)
  }
})

onUnmounted(() => {
  try {
    // Destroy datepicker instance (flatpickr or flowbite) if available
    if (fp) {
      try {
        if (typeof fp.destroy === 'function') fp.destroy();
        else if (typeof fp.close === 'function') fp.close();
      } catch (e) { /* ignore cleanup errors */ }
      fp = null
    }
  } catch (e) { /* ignore */ }
  try {
    window.removeEventListener('scroll', reposition, true)
    window.removeEventListener('resize', reposition)
  } catch (e) { /* ignore */ }
  try {
    if (input.value && fbInputHandler) input.value.removeEventListener('input', fbInputHandler)
  } catch (e) { /* ignore */ }
})

// Keep the formattedValue and the picker in sync with incoming modelValue
watch(() => props.modelValue, (val) => {
  formattedValue.value = val || ''
  if (fp) {
    try {
      if (typeof fp.setDate === 'function') fp.setDate(val, true)
      else if (typeof fp._setDate === 'function') fp._setDate(val)
      // flowbite may update input value via native input change events
    } catch (e) { /* ignore */ }
  }
})

const applyGlassmorphismStyles = () => {
  const calendar = document.querySelector('.flatpickr-calendar')
  if (calendar) {
    // Dropdown positioning: fixed to viewport, will be repositioned by setCalendarPosition
    calendar.style.position = 'fixed'
    calendar.style.zIndex = '99999'
    // No modal behavior: auto height, no scrollbars
    calendar.style.visibility = 'hidden'
    calendar.style.maxHeight = 'none'
    calendar.style.height = 'auto'
    calendar.style.overflow = 'hidden'
    calendar.style.overflowY = 'visible'
    // Keep existing aesthetics - no changes to colors, borders, shadows
    calendar.style.background = 'rgba(2, 8, 18, 0.95)'
    calendar.style.backdropFilter = 'blur(40px) saturate(200%)'
    calendar.style.border = '3px solid rgba(0, 255, 106, 0.7)'
    calendar.style.borderRadius = '25px'
    calendar.style.boxShadow = '0 40px 120px rgba(0, 0, 0, 0.9)'
    calendar.style.color = '#ffffff'
    calendar.style.fontFamily = "'Source Sans 3', sans-serif"
  }
  const dayElements = document.querySelectorAll('.flatpickr-day')
  dayElements.forEach(day => {
    day.style.background = 'rgba(255, 255, 255, 0.1)'
    day.style.color = '#ffffff'
    day.style.border = '2px solid rgba(255, 255, 255, 0.2)'
    day.style.borderRadius = '12px'
    day.style.margin = '0'
    day.style.padding = '6px'
    day.style.transition = 'all 0.3s ease'
    day.style.cursor = 'pointer'
  })

  // Día actual
  const today = document.querySelector('.flatpickr-day.today')
  if (today) {
    today.style.background = 'rgba(0, 255, 106, 0.6)'
    today.style.border = '3px solid rgba(0, 255, 106, 0.9)'
    today.style.animation = 'current-day-pulse 3s infinite alternate'
  }

  // Día seleccionado
  const selected = document.querySelector('.flatpickr-day.selected')
  if (selected) {
    selected.style.background = '#00ff6a'
    selected.style.color = '#000000'
    selected.style.border = '3px solid rgba(0, 255, 106, 1)'
    selected.style.transform = 'scale(1.1)'
  }
  // Reveal calendar after styles applied and positioned
  const reveal = () => { try { if (calendar) calendar.style.visibility = 'visible' } catch(e){} }
  setTimeout(reveal, 12)

  // Hover effects done via CSS; avoid duplicating event handlers

  // Encabezado del calendario
  const header = document.querySelector('.flatpickr-months')
  if (header) {
    header.style.background = 'rgba(0, 255, 106, 0.3)'
    header.style.borderRadius = '15px'
    header.style.margin = '0'
    header.style.padding = '8px 12px'
    // Ensure the weekdays row is properly spaced and aligned with grid
    const weekdays = document.querySelector('.flatpickr-weekdays')
      if (weekdays) {
        weekdays.style.display = 'block'
        weekdays.style.padding = '6px 6px'
        weekdays.style.boxSizing = 'border-box'
        const weekdayContainer = weekdays.querySelector('.flatpickr-weekdaycontainer')
        if (weekdayContainer) {
          weekdayContainer.style.display = 'grid'
          weekdayContainer.style.gridTemplateColumns = 'repeat(7, var(--fp-day-size))'
          weekdayContainer.style.gap = 'var(--fp-day-gap)'
          weekdayContainer.style.width = '100%'
          weekdayContainer.style.boxSizing = 'border-box'
        }

        // Rebuild the header cells explicitly according to locale configuration
        try {
          const wk = (fp && fp.config && fp.config.locale && fp.config.locale.weekdays && fp.config.locale.weekdays.shorthand) ?
            fp.config.locale.weekdays.shorthand.slice() : ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
          const firstDay = (fp && fp.config && typeof fp.config.locale.firstDayOfWeek === 'number') ? fp.config.locale.firstDayOfWeek : 0
          const rotated = wk.slice(firstDay).concat(wk.slice(0, firstDay)).map(s => s.toUpperCase())
          // Clear existing header cells and re-create in correct order
          // let flatpickr render the weekday header according to locale.
          // We only adjust spacing and ensure grid aligns with day cells via CSS.
        } catch (e) {
            // ignore - keep header as-is
          }
      }
      // Let flatpickr render correct header; we only align via CSS.
  }

  // Ensure weekdays labels align with day grid start day using Flatpickr locale
  try {
    // Get the weekday labels from locale (in original order Sun..Sat)
    const wk = (fp && fp.config && fp.config.locale && fp.config.locale.weekdays && fp.config.locale.weekdays.shorthand) ?
      fp.config.locale.weekdays.shorthand.slice() : ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    const firstDay = (fp && fp.config && typeof fp.config.locale.firstDayOfWeek === 'number') ? fp.config.locale.firstDayOfWeek : 0
    // Rotate to start at firstDay
    const rotated = wk.slice(firstDay).concat(wk.slice(0, firstDay)).map(s => s.toUpperCase())
    const weekdayEls = calendar.querySelectorAll('.flatpickr-weekday')
    weekdayEls.forEach((el, i) => {
      if (rotated[i]) el.textContent = rotated[i]
    })
  } catch (e) {
    // ignore: fallback keeps labels as-is
  }

  // Botones de navegación
  const navButtons = document.querySelectorAll('.flatpickr-prev-month, .flatpickr-next-month')
  navButtons.forEach(btn => {
    btn.style.background = 'rgba(0, 255, 106, 0.16)'
    btn.style.color = '#ffffff'
    btn.style.border = '1.5px solid rgba(0, 255, 106, 0.65)'
    btn.style.borderRadius = '999px'
    btn.style.width = '30px'
    btn.style.height = '30px'
    btn.style.cursor = 'pointer'
    btn.style.transition = 'all 0.2s ease'
    btn.style.display = 'flex'
    btn.style.alignItems = 'center'
    btn.style.justifyContent = 'center'
    btn.style.position = 'absolute'
    btn.style.top = '50%'
    btn.style.transform = 'translateY(-50%)'
    btn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)'
    if (btn.classList.contains('flatpickr-prev-month')) btn.style.left = '10px'
    if (btn.classList.contains('flatpickr-next-month')) btn.style.right = '10px'
  })
}

// Ensure a 'Hoy' button exists and works for flatpickr calendars
const ensureTodayButton = (calendarInstance) => {
  try {
    const calendar = typeof calendarInstance === 'string' ? document.querySelector(calendarInstance) : calendarInstance
    if (!calendar) return
    if (calendar.querySelector('.fp-today-btn')) return
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'fp-today-btn'
    btn.textContent = 'Hoy'
    // Minimal inline styles so it matches the look without changing palette
    btn.style.cssText = 'position:absolute;right:12px;bottom:8px;padding:6px 10px;border-radius:12px;background:transparent;color:#ffffff;border:1px solid rgba(0,255,106,0.45);cursor:pointer;font-weight:600'
    btn.addEventListener('click', () => {
      try {
        const d = new Date()
        if (fp && typeof fp.setDate === 'function') {
          fp.setDate(d, true)
        } else if (fp && typeof fp._setDate === 'function') {
          fp._setDate(d)
        }
        // Emit current value downstream
        const val = (fp && fp.input && fp.input.value) ? fp.input.value : ''
        emit('update:modelValue', val)
      } catch (e) { /* ignore */ }
    })
    calendar.appendChild(btn)
  } catch (e) { /* ignore */ }
}

const setCalendarPosition = () => {
  const calendar = document.querySelector('.flatpickr-calendar')
  const inputEl = input.value
  if (!calendar || !inputEl) return

  // Use getBoundingClientRect for fixed positioning relative to viewport
  const rect = inputEl.getBoundingClientRect()
  const calRect = calendar.getBoundingClientRect()
  const gap = 8 // gap between input and calendar

  // Preferred: align left of calendar to left of input (as in the earlier screenshot)
  let left = rect.left
  let top = rect.bottom + gap // prefer below the input

  // Compute viewport and limiters
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

  // Clamp horizontally if it overflows
  if (left + calRect.width > viewportWidth - 10) {
    left = Math.max(10, viewportWidth - calRect.width - 10)
  }
  if (left < 10) left = 10

  // If there's not enough space below, prefer placing calendar above the input
  const spaceBelow = viewportHeight - (rect.bottom + gap)
  const spaceAbove = rect.top - gap
  if (calRect.height <= spaceBelow) {
    // there's enough room below -> keep below
    top = rect.bottom + gap
  } else if (calRect.height <= spaceAbove) {
    // enough room above -> place above
    top = rect.top - gap - calRect.height
  } else {
    // neither fits fully; clamp to viewport but prefer below if possible
    const maxTop = viewportHeight - calRect.height - 10
    top = Math.max(10, Math.min(rect.bottom + gap, maxTop))
  }

  const updateVerticalOverflow = () => {
    requestAnimationFrame(() => {
      const needsScroll = calendar.scrollHeight > (calendar.clientHeight + 1)
      calendar.style.setProperty('overflow-y', needsScroll ? 'auto' : 'hidden', 'important')
    })
  }

  // Set computed position (we use fixed to be viewport-aligned)
  calendar.style.position = 'fixed'
  calendar.style.left = `${Math.round(left)}px`
  calendar.style.zIndex = '99999'

  const clampHorizontal = (calWidth) => {
    const currentViewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    let currentLeft = parseFloat(calendar.style.left) || left
    const viewportRightLimit = currentViewportWidth - 10
    const projectedRight = currentLeft + calWidth
    if (projectedRight > viewportRightLimit) {
      currentLeft = Math.max(10, viewportRightLimit - calWidth)
    }
    if (currentLeft < 10) currentLeft = 10
    calendar.style.left = `${Math.round(currentLeft)}px`
    left = currentLeft
  }
  // Ensure calendar has enough width to fit 7 day cells: compute desired width
  try {
    const comp = getComputedStyle(calendar)
    const cellSize = parseInt(comp.getPropertyValue('--fp-day-size')) || 44
    const dayGap = parseInt(comp.getPropertyValue('--fp-day-gap')) || 8
    const paddingLeft = parseFloat(comp.getPropertyValue('padding-left')) || 12
    const rawPaddingRight = parseFloat(comp.getPropertyValue('padding-right')) || 12
    const effectivePaddingRight = rawPaddingRight + SCROLLBAR_RESERVE
    calendar.style.setProperty('padding-right', `${effectivePaddingRight}px`)
    calendar.style.setProperty('--fp-scroll-reserve', `${SCROLLBAR_RESERVE}px`)
    const borderLeft = parseInt(comp.getPropertyValue('border-left-width')) || 0
    const borderRight = parseInt(comp.getPropertyValue('border-right-width')) || 0
    const boxW = (cellSize * 7) + (dayGap * 6) + paddingLeft + effectivePaddingRight
    const desiredMin = Math.max(Math.round(rect.width), Math.round(boxW))
    calendar.style.minWidth = `${desiredMin}px`

    // Compute actual per-day cell size based on the final width of the calendar
    let availableForCells = desiredMin - (paddingLeft + effectivePaddingRight) - (dayGap * 6)
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    // If the desired width would overflow viewport, recompute desired to fit
    if (desiredMin > viewportWidth - 20) {
      const fit = Math.max(320, viewportWidth - 20) // min calendar width 320
      availableForCells = fit - (paddingLeft + paddingRight) - (dayGap * 6)
    }
    const actualCellSize = Math.max(30, Math.floor(availableForCells / 7)) // min 30px per cell for legibility
    calendar.style.setProperty('--fp-day-size', actualCellSize + 'px', 'important')
    // Make sure the CSS gap matches
    calendar.style.setProperty('--fp-day-gap', dayGap + 'px', 'important')
    // Measure an actual day cell post-layout and adjust if needed (more robust)
    requestAnimationFrame(() => {
      const sample = calendar.querySelector('.flatpickr-days .dayContainer .flatpickr-day')
      if (sample) {
        const measured = Math.floor(sample.getBoundingClientRect().width)
        if (measured > 0 && Math.abs(measured - actualCellSize) > 1) {
          calendar.style.setProperty('--fp-day-size', measured + 'px', 'important')
          calendar.style.setProperty('--fp-day-gap', dayGap + 'px', 'important')
          // recompute desired width to exact value
          const totalWidth = (measured * 7) + (dayGap * 6) + paddingLeft + effectivePaddingRight + (borderLeft + borderRight)
          calendar.style.width = `${totalWidth}px`
          calendar.style.minWidth = `${totalWidth}px`
          clampHorizontal(totalWidth)
          updateVerticalOverflow()
          // Set explicit grid template columns for pixel-perfect precision
          const dayGrid = calendar.querySelector('.flatpickr-days .dayContainer')
          const weekdayContainer = calendar.querySelector('.flatpickr-weekdays .flatpickr-weekdaycontainer')
          const weekdays = calendar.querySelector('.flatpickr-weekdays')
          const weekdayTarget = weekdayContainer || weekdays
          if (dayGrid) dayGrid.style.setProperty('grid-template-columns', `repeat(7, ${measured}px)`, 'important')
          if (weekdayTarget) weekdayTarget.style.setProperty('grid-template-columns', `repeat(7, ${measured}px)`, 'important')
        }
      }
    })
    // Also set width and explicit columns according to calculation
    const totalWidth = (actualCellSize * 7) + (dayGap * 6) + paddingLeft + effectivePaddingRight + (borderLeft + borderRight)
    calendar.style.width = `${totalWidth}px`
    calendar.style.minWidth = `${totalWidth}px`
    clampHorizontal(totalWidth)
    updateVerticalOverflow()
    const dayGrid = calendar.querySelector('.flatpickr-days .dayContainer')
    const weekdays = calendar.querySelector('.flatpickr-weekdays')
    const weekdayContainer = calendar.querySelector('.flatpickr-weekdays .flatpickr-weekdaycontainer')
    const weekdayGridTarget = weekdayContainer || weekdays
    if (dayGrid) dayGrid.style.setProperty('grid-template-columns', `repeat(7, ${actualCellSize}px)`, 'important')
    if (weekdayGridTarget) {
      weekdayGridTarget.style.setProperty('grid-template-columns', `repeat(7, ${actualCellSize}px)`, 'important')
      weekdayGridTarget.style.setProperty('gap', `${dayGap}px`, 'important')
    }
    // Ensure header and day grid left alignment: compute container offsets and correct if needed
    try {
      if (dayGrid && weekdayGridTarget) {
        const gridRect = dayGrid.getBoundingClientRect()
        const headerRect = weekdayGridTarget.getBoundingClientRect()
        const calRectRef = calendar.getBoundingClientRect()
        const dLeftRel = gridRect.left - calRectRef.left
        const hLeftRel = headerRect.left - calRectRef.left
        const delta = dLeftRel - hLeftRel
        const deltaRounded = Math.round(delta * 1000) / 1000 // thousandths pixel precision
        if (Math.abs(deltaRounded) > 0.002) {
          weekdayGridTarget.style.setProperty('transform', `translateX(${deltaRounded}px)`, 'important')
        } else {
          weekdayGridTarget.style.removeProperty('transform')
        }
        const preciseTotal = Math.ceil(gridRect.width + paddingLeft + effectivePaddingRight + borderLeft + borderRight)
        clampHorizontal(preciseTotal)
        updateVerticalOverflow()
        if (weekdays) {
          weekdays.style.setProperty('width', `${Math.round(gridRect.width)}px`, 'important')
        }
        if (window && window.__FP_DEBUG_ALIGN) {
          console.log('FP ALIGN DEBUG', {
            mode: 'container-align',
            measured: actualCellSize,
            gridRect,
            headerRect,
            relativeGridLeft: dLeftRel,
            relativeHeaderLeft: hLeftRel,
            delta,
            deltaRounded
          })
        }
      }
    } catch (e) {
      // ignore
    }
  } catch (e) {
    calendar.style.minWidth = `${Math.round(rect.width)}px`
  }
  calendar.style.top = `${Math.round(top)}px`
  calendar.style.right = 'auto'
}

onUnmounted(() => {
  if (fp) {
    try {
      if (typeof fp.destroy === 'function') fp.destroy()
      else if (typeof fp.hide === 'function') fp.hide()
    } catch (e) { /* ignore */ }
  }
  try {
    window.removeEventListener('scroll', reposition, true)
    window.removeEventListener('resize', reposition)
    if (fbInputHandler && input.value) input.value.removeEventListener('input', fbInputHandler)
  } catch (e) {
    // nothing
  }
})
</script>

<style scoped>
.custom-date-picker {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  height: 2.7rem;
  padding: 0.55rem 3rem 0.55rem 0.9rem;
  border-radius: 25px;
  font-size: 0.95rem;
  width: 100%;
  min-width: 180px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(15, 23, 42, 0.92);
  font-weight: 600;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  overflow: hidden;
}

.date-input:focus {
  outline: none;
  border-color: rgba(46, 221, 90, 0.65);
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.15);
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
}

.calendar-icon {
  position: absolute;
  right: 12px;
  color: rgba(15, 23, 42, 0.7);
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.calendar-icon:hover {
  color: #00ff6a;
}

/* Animación para el día actual */
@keyframes current-day-pulse {
  0% {
    box-shadow: 0 0 20px rgba(0, 255, 106, 0.7);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 30px rgba(0, 255, 106, 1);
    transform: scale(1.05);
  }
}
</style>

<style>
/* Estilos globales para Flatpickr */
.flatpickr-calendar {
  background: rgba(2, 8, 18, 0.95) !important;
  backdrop-filter: blur(38px) saturate(185%) !important;
  border: 2.4px solid rgba(0, 255, 106, 0.65) !important;
  border-radius: 24px !important;
  box-shadow: 0 24px 58px rgba(0, 0, 0, 0.6) !important;
  color: #ffffff !important;
  font-family: 'Source Sans 3', sans-serif !important;
  padding: 10px !important;
  position: fixed !important;
  max-height: 80vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-gutter: stable both-edges !important;
  --fp-day-size: 40px !important;
  --fp-day-gap: 6px !important;
  transition: opacity 0.18s ease, transform 0.18s ease !important;
}
.flatpickr-calendar { opacity: 0; transform: translateY(-6px) scale(0.98); }
.flatpickr-calendar.open { opacity: 1; transform: translateY(0) scale(1); }

.flatpickr-days .dayContainer {
  display: grid !important;
  grid-template-columns: repeat(7, var(--fp-day-size)) !important;
  grid-auto-rows: var(--fp-day-size) !important;
  gap: var(--fp-day-gap) !important;
  padding: 5px !important;
  box-sizing: border-box !important;
}

.flatpickr-day {
  width: var(--fp-day-size) !important;
  height: var(--fp-day-size) !important;
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1.4px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 11px !important;
  margin: 0 !important;
  transition: all 0.22s ease !important;
  cursor: pointer !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  line-height: 1 !important;
  padding: 1px 5px !important;
}

.flatpickr-day:hover {
  background: rgba(0, 255, 106, 0.4) !important;
  transform: scale(1.04) !important;
}

.flatpickr-day.today {
  background: rgba(0, 255, 106, 0.6) !important;
  border: 2.4px solid rgba(0, 255, 106, 0.85) !important;
  animation: current-day-pulse 3s infinite alternate !important;
}

.flatpickr-day.selected {
  background: #00ff6a !important;
  color: #000000 !important;
  border: 2.4px solid rgba(0, 255, 106, 1) !important;
  transform: scale(1.08) !important;
}

.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay { opacity: 0.45 !important; }

.flatpickr-day:focus {
  outline: 2px solid rgba(0, 255, 106, 0.55) !important;
  outline-offset: 3px !important;
}

.flatpickr-months {
  background: rgba(0, 255, 106, 0.24) !important;
  border-radius: 18px !important;
  margin: 0 !important;
  padding: 10px 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}

.flatpickr-current-month {
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  text-align: center !important;
}

.flatpickr-prev-month,
.flatpickr-next-month {
  background: rgba(0, 255, 106, 0.16) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(0, 255, 106, 0.65) !important;
  border-radius: 999px !important;
  width: 30px !important;
  height: 30px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
}
.flatpickr-prev-month { left: 10px !important; }
.flatpickr-next-month { right: 10px !important; }

.flatpickr-prev-month:hover,
.flatpickr-next-month:hover {
  background: rgba(0, 255, 106, 0.32) !important;
  transform: translateY(-50%) scale(1.04) !important;
}

.flatpickr-prev-month:focus,
.flatpickr-next-month:focus {
  outline: 2px solid rgba(0, 255, 106, 0.85) !important;
  outline-offset: 2px !important;
}

.flatpickr-weekdays {
  background: rgba(0, 255, 106, 0.2) !important;
  border-radius: 10px !important;
  margin: 6px 0 !important;
  padding: 4px 5px !important;
  display: block !important;
  box-sizing: border-box !important;
}

.flatpickr-weekdays .flatpickr-weekdaycontainer {
  display: grid !important;
  grid-template-columns: repeat(7, var(--fp-day-size)) !important;
  gap: var(--fp-day-gap) !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

.flatpickr-weekday {
  color: rgba(0, 255, 106, 1) !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  font-size: 0.78rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap !important;
  padding: 3px 2px !important;
  width: 100% !important;
}

@keyframes fpMonthFade {
  0% { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
.fp-month-change { animation: fpMonthFade 0.28s ease !important; }

.flatpickr-footer {
  display: flex !important;
  gap: 8px !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 8px 10px !important;
  margin-top: 6px !important;
}

.flatpickr-footer .fp-btn {
  border-radius: 10px !important;
  border: 1.6px solid rgba(0, 255, 106, 0.7) !important;
  background: rgba(0, 255, 106, 0.1) !important;
  color: #ffffff !important;
  padding: 7px 11px !important;
  cursor: pointer !important;
  font-weight: 700 !important;
  transition: all 0.18s ease !important;
}
.flatpickr-footer .fp-btn:hover { transform: translateY(-2px) !important; }
.flatpickr-footer .fp-btn:focus { outline: 2px solid rgba(0,255,106,0.85) !important; outline-offset: 2px !important; }

@media (max-width: 480px) {
  .flatpickr-calendar { --fp-day-size: 38px !important; }
  .flatpickr-footer { flex-direction: column; gap: 8px; padding: 8px !important; }
}

</style>