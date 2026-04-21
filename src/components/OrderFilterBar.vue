<template>
  <section class="order-filter-bar">
    <header class="order-filter-bar__header">
      <div>
        <h4>{{ title }}</h4>
        <p>{{ subtitle }}</p>
      </div>
      <div class="order-filter-bar__count">
        <span>{{ countLabel }}</span>
      </div>
    </header>

    <div class="order-filter-bar__composer">
      <label class="order-filter-bar__field order-filter-bar__field--select" ref="fieldMenuRoot">
        <span>Campo</span>
        <button type="button" class="order-filter-bar__select-trigger" @click="toggleFieldMenu">
          <span>{{ selectedField.label }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <transition name="suggestions-pop">
          <div
            v-if="showFieldMenu"
            class="order-filter-bar__field-menu"
            :class="{ 'is-open-up': fieldMenuOpenUp }"
          >
            <button
              v-for="field in fieldOptions"
              :key="field.key"
              type="button"
              class="order-filter-bar__field-option"
              :class="{ 'is-selected': field.key === selectedFieldKey }"
              @mousedown.prevent="selectField(field)"
            >
              <span class="order-filter-bar__field-option-label">{{ field.label }}</span>
              <small v-if="field.placeholder" class="order-filter-bar__field-option-placeholder">{{ field.placeholder }}</small>
            </button>
          </div>
        </transition>
      </label>

      <label class="order-filter-bar__field order-filter-bar__field--value" ref="valueMenuRoot">
        <span>Valor</span>
        <input
          v-model="draftValue"
          :type="selectedField.type || 'text'"
          class="order-filter-bar__input"
          :placeholder="selectedField.placeholder"
          @focus="showSuggestions = true"
          @blur="handleValueBlur"
          @input="showSuggestions = true"
          @keyup.enter="addFilter"
        />
        <transition name="suggestions-pop">
          <div
            v-if="showSuggestions && visibleSuggestions.length"
            class="order-filter-bar__suggestions"
            :class="{ 'is-open-up': suggestionsOpenUp }"
          >
            <button
              v-for="item in visibleSuggestions"
              :key="`${item.value}-${item.count}`"
              type="button"
              class="order-filter-bar__suggestion"
              @mousedown.prevent="applySuggestion(item)"
            >
              <span class="order-filter-bar__suggestion-value">{{ item.label || item.value }}</span>
              <span class="order-filter-bar__suggestion-count">{{ item.count }}</span>
            </button>
          </div>
        </transition>
      </label>

      <div class="order-filter-bar__actions">
        <button type="button" class="order-filter-bar__primary" @click="addFilter" :disabled="!canAddFilter">
          + Agregar filtro
        </button>
        <button type="button" class="order-filter-bar__secondary" @click="clearAll" :disabled="!hasActiveFilters">
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="activeFiltersList.length" class="order-filter-bar__tokens">
      <button
        v-for="item in activeFiltersList"
        :key="item.key"
        type="button"
        class="order-filter-bar__token"
        @click="editFilter(item)"
      >
        <span class="order-filter-bar__token-label">{{ item.label }}</span>
        <span class="order-filter-bar__token-value">{{ renderTokenValue(item) }}</span>
        <span class="order-filter-bar__token-remove" @click.stop="removeFilter(item.key)">×</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, unref } from 'vue'

const DEFAULT_FIELDS = [
  { key: 'folio', label: 'Folio de operación', placeholder: 'Ej. 5-011', type: 'text' },
  { key: 'solicitante', label: 'Nombre del solicitante', placeholder: 'Ej. Dr. Juan Pérez', type: 'text' },
  { key: 'fecha', label: 'Fecha', placeholder: 'dd/mm/aaaa', type: 'text' },
  { key: 'service', label: 'Servicio', placeholder: 'Ej. Urgencias', type: 'text', activates: true },
  { key: 'especialidad', label: 'Especialidad', placeholder: 'Ej. Traumatología', type: 'text', activates: true },
  { key: 'motivo', label: 'Motivo', placeholder: 'Escribe un motivo', type: 'text', activates: true },
  { key: 'obs', label: 'Observaciones', placeholder: 'Buscar en observaciones', type: 'text', activates: true },
  { key: 'ing', label: 'Ingeniero residente', placeholder: 'Buscar nombre', type: 'text', activates: true },
  { key: 'itemText', label: 'Nombre de equipo', placeholder: 'Nombre, modelo, serie...', type: 'text', activates: true },
  { key: 'accesorio', label: 'Accesorios', placeholder: 'Nombre de accesorio...', type: 'text', activates: true },
  { key: 'tipo', label: 'Tipo de artículo', placeholder: 'Ej. equipo, accesorio...', type: 'text', activates: true },
  { key: 'marca', label: 'Marca', placeholder: 'Ej. Philips, GE...', type: 'text', activates: true },
  { key: 'modelo', label: 'Modelo', placeholder: 'Ej. MX40...', type: 'text', activates: true },
  { key: 'ubicacion', label: 'Ubicación', placeholder: 'Ej. UCIA...', type: 'text', activates: true },
  { key: 'claveHRAEI', label: 'Clave HRAEI', placeholder: 'Ej. COMODATO...', type: 'text', activates: true },
  { key: 'noInventario', label: 'No. Inventario', placeholder: 'Ej. 12345', type: 'text', activates: true },
  { key: 'cantidadMin', label: 'Cantidad mínima', placeholder: 'Mínimo...', type: 'number', activates: true },
  { key: 'cantidadMax', label: 'Cantidad máxima', placeholder: 'Máximo...', type: 'number', activates: true }
]

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: 'Búsqueda de órdenes'
  },
  subtitle: {
    type: String,
    default: 'Combina campos y valores como en un filtro profesional de órdenes.'
  },
  countLabel: {
    type: String,
    default: ''
  },
  suggestionsByField: {
    type: Object,
    default: () => ({})
  },
  fieldOptions: {
    type: Array,
    default: () => []
  }
})

const fieldOptions = computed(() => {
  return Array.isArray(props.fieldOptions) && props.fieldOptions.length ? props.fieldOptions : DEFAULT_FIELDS
})

const selectedFieldKey = ref(fieldOptions.value[0]?.key || 'folio')
const draftValue = ref('')
const showSuggestions = ref(false)
const showFieldMenu = ref(false)
const fieldMenuRoot = ref(null)
const valueMenuRoot = ref(null)
const fieldMenuOpenUp = ref(false)
const suggestionsOpenUp = ref(false)

const selectedField = computed(() => {
  return fieldOptions.value.find(field => field.key === selectedFieldKey.value) || fieldOptions.value[0] || DEFAULT_FIELDS[0]
})

const activeFiltersList = computed(() => {
  const primary = unref(props.filters.activeFiltersList)
  const chips = unref(props.filters.chipsList)
  const primaryList = Array.isArray(primary) ? primary : []
  const chipsList = Array.isArray(chips) ? chips : []
  const merged = [...primaryList, ...chipsList]
  return merged.filter((item, index, array) => index === array.findIndex(other => String(other?.key) === String(item?.key)))
})

const hasActiveFilters = computed(() => {
  return Boolean(unref(props.filters.hasActiveFilters))
})

const selectedSuggestions = computed(() => {
  const directSuggestions = unref(props.suggestionsByField)
  const nestedSuggestions = props.filters ? unref(props.filters.suggestionsByField) : null
  const suggestionsMap = directSuggestions && typeof directSuggestions === 'object'
    ? directSuggestions
    : nestedSuggestions && typeof nestedSuggestions === 'object'
      ? nestedSuggestions
      : {}
  const source = suggestionsMap[selectedFieldKey.value]
  if (!Array.isArray(source)) return []
  const query = normalizeText(draftValue.value)
  return source
    .map(item => {
      if (typeof item === 'string') {
        return { value: item, label: item, count: 1 }
      }
      return {
        value: String(item?.value ?? ''),
        label: String(item?.label ?? item?.value ?? ''),
        count: Number(item?.count ?? 1) || 1
      }
    })
    .filter(item => item.value)
    .filter(item => {
      if (!query) return true
      return normalizeText(item.value).includes(query) || normalizeText(item.label).includes(query)
    })
    .slice(0, 10)
})

const visibleSuggestions = computed(() => {
  const list = selectedSuggestions.value
  const query = normalizeText(draftValue.value)
  if (!query) return list.slice(0, 8)
  const exact = []
  const starts = []
  const includes = []
  for (const item of list) {
    const value = normalizeText(item.value)
    const label = normalizeText(item.label)
    if (value === query || label === query) exact.push(item)
    else if (value.startsWith(query) || label.startsWith(query)) starts.push(item)
    else includes.push(item)
  }
  return [...exact, ...starts, ...includes].slice(0, 8)
})

watch(
  () => fieldOptions.value,
  (next) => {
    if (!next || !next.length) return
    if (!next.some(field => field.key === selectedFieldKey.value)) {
      selectedFieldKey.value = next[0].key
    }
  },
  { immediate: true }
)

const canAddFilter = computed(() => {
  return String(draftValue.value || '').trim().length > 0
})

function resolveOpenUp(rootElement, panelHeight = 300) {
  if (!rootElement || typeof window === 'undefined') return false
  const rect = rootElement.getBoundingClientRect()
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
  const spaceBelow = Math.max(0, viewportHeight - rect.bottom)
  const spaceAbove = Math.max(0, rect.top)
  const minimumGap = 16
  return spaceBelow < Math.min(panelHeight, 220) + minimumGap && spaceAbove > spaceBelow
}

function refreshDropdownDirections() {
  fieldMenuOpenUp.value = showFieldMenu.value && resolveOpenUp(fieldMenuRoot.value, 320)
  suggestionsOpenUp.value = showSuggestions.value && resolveOpenUp(valueMenuRoot.value, 280)
}

function toggleFieldMenu() {
  showFieldMenu.value = !showFieldMenu.value
  if (showFieldMenu.value) {
    nextTick(() => refreshDropdownDirections())
  }
}

function selectField(field) {
  selectedFieldKey.value = field.key
  draftValue.value = ''
  showFieldMenu.value = false
  showSuggestions.value = false
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getBindingValue(key) {
  const binding = props.filters.fieldBindings && props.filters.fieldBindings[key]
  if (!binding) return ''
  if (typeof binding === 'object' && 'value' in binding) return binding.value
  return binding
}

function unwrapMaybeRef(value) {
  if (value && typeof value === 'object' && 'value' in value) return value.value
  return value
}

function setBindingValue(key, value) {
  const binding = props.filters.fieldBindings && props.filters.fieldBindings[key]
  if (!binding) return
  if (typeof binding === 'object' && 'value' in binding) {
    binding.value = value
  }
}

function normalizeDraftValue(field, value) {
  if (field.type === 'number') {
    if (value === '' || value === null || value === undefined) return null
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }
  return String(value).trim()
}

function normalizeFolioLike(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const match = raw.match(/^([A-Za-z])[-\s_]*0*(\d+)$/)
  if (!match) return raw.toUpperCase()
  return `${match[1].toUpperCase()}-${parseInt(match[2], 10)}`
}

function addFilter() {
  const field = selectedField.value
  const value = field.key === 'folio' ? normalizeFolioLike(draftValue.value) : normalizeDraftValue(field, draftValue.value)
  if (value === '' || value === null) return

  if (typeof props.filters.activateFilter === 'function' && field.activates) {
    props.filters.activateFilter(field.key)
  }
  setBindingValue(field.key, value)
  draftValue.value = ''
  showSuggestions.value = false
}

function editFilter(item) {
  selectedFieldKey.value = item.key
  const currentValue = unwrapMaybeRef(item?.bindings?.modelValue) ?? unwrapMaybeRef(item?.bindings?.value) ?? item?.value ?? getBindingValue(item.key)
  draftValue.value = currentValue === null || currentValue === undefined ? '' : String(currentValue)
  showSuggestions.value = true
}

function applySuggestion(item) {
  draftValue.value = String(item?.value ?? '')
  addFilter()
}

function handleValueBlur() {
  window.setTimeout(() => {
    showSuggestions.value = false
  }, 120)
}

function handleDocumentClick(event) {
  if (!fieldMenuRoot.value) return
  if (!fieldMenuRoot.value.contains(event.target)) {
    showFieldMenu.value = false
  }
}

function handleViewportChange() {
  if (showFieldMenu.value || showSuggestions.value) {
    refreshDropdownDirections()
  }
}

watch(showFieldMenu, (isOpen) => {
  if (isOpen) {
    nextTick(() => refreshDropdownDirections())
  }
})

watch(showSuggestions, (isOpen) => {
  if (isOpen) {
    nextTick(() => refreshDropdownDirections())
  }
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleDocumentClick)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleDocumentClick)
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('scroll', handleViewportChange, true)
  }
})

function renderTokenValue(item) {
  if (item?.type === 'time-range') {
    const from = item?.bindings?.from?.value ?? item?.bindings?.from ?? ''
    const to = item?.bindings?.to?.value ?? item?.bindings?.to ?? ''
    const fromLabel = from || 'Desde'
    const toLabel = to || 'Hasta'
    return `${fromLabel} - ${toLabel}`
  }

  const currentValue = item?.bindings?.modelValue ?? item?.bindings?.value ?? item?.value ?? getBindingValue(item.key)
  const resolvedValue = unwrapMaybeRef(currentValue)
  if (resolvedValue === null || resolvedValue === undefined || resolvedValue === '') return 'Sin valor'
  if (typeof resolvedValue === 'object') {
    return JSON.stringify(resolvedValue)
  }
  return String(resolvedValue)
}

function removeFilter(key) {
  if (typeof props.filters.removeFilter === 'function') {
    props.filters.removeFilter(key)
  }
}

function clearAll() {
  if (typeof props.filters.clearAllFilters === 'function') {
    props.filters.clearAllFilters()
  }
}
</script>

<style scoped>
.order-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(9, 16, 28, 0.94), rgba(7, 12, 22, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.order-filter-bar__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.order-filter-bar__header h4 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.order-filter-bar__header p {
  margin: 4px 0 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.88rem;
}

.order-filter-bar__count {
  padding: 8px 12px;
  border-radius: 999px;
  color: #86efac;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.32);
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.order-filter-bar__composer {
  display: grid;
  grid-template-columns: minmax(180px, 0.9fr) minmax(240px, 1.6fr) auto;
  gap: 12px;
  align-items: end;
}

.order-filter-bar__field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  position: relative;
}

.order-filter-bar__field span {
  color: rgba(226, 232, 240, 0.76);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.order-filter-bar__input {
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: #f8fafc;
  padding: 0 14px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.order-filter-bar__input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
  background: rgba(255, 255, 255, 0.06);
}

.order-filter-bar__select-trigger {
  min-height: 42px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: linear-gradient(180deg, rgba(13, 20, 35, 0.98), rgba(8, 12, 22, 0.98));
  color: #e2e8f0;
  padding: 0 14px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.order-filter-bar__select-trigger:hover {
  border-color: rgba(96, 165, 250, 0.6);
  background: linear-gradient(180deg, rgba(16, 24, 40, 0.98), rgba(8, 12, 22, 0.98));
}

.order-filter-bar__field-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.24);
  background: rgba(8, 13, 24, 0.98);
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.45);
  max-height: 320px;
  overflow: auto;
}

.order-filter-bar__field-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #f8fafc;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.order-filter-bar__field-option:hover,
.order-filter-bar__field-option.is-selected {
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(59, 130, 246, 0.14);
}

.order-filter-bar__field-option-label {
  font-size: 0.92rem;
  font-weight: 800;
}

.order-filter-bar__field-option-placeholder {
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.72rem;
}

.order-filter-bar__input::placeholder {
  color: rgba(148, 163, 184, 0.78);
}

.order-filter-bar__input::placeholder {
  color: rgba(148, 163, 184, 0.78);
}

.order-filter-bar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.order-filter-bar__primary,
.order-filter-bar__secondary {
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.order-filter-bar__primary {
  color: #dbeafe;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.9));
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
}

.order-filter-bar__secondary {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(148, 163, 184, 0.18);
}

.order-filter-bar__primary:hover:not(:disabled),
.order-filter-bar__secondary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.order-filter-bar__primary:disabled,
.order-filter-bar__secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.order-filter-bar__suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.24);
  background: rgba(8, 13, 24, 0.98);
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.4);
  max-height: 260px;
  overflow: auto;
}

.order-filter-bar__suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #f8fafc;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.order-filter-bar__suggestion:hover {
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(59, 130, 246, 0.14);
}

.order-filter-bar__suggestion-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.order-filter-bar__suggestion-count {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  font-size: 0.75rem;
  font-weight: 800;
}

.suggestions-pop-enter-active,
.suggestions-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.suggestions-pop-enter-from,
.suggestions-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.order-filter-bar__suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.24);
  background: rgba(8, 13, 24, 0.98);
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.4);
  max-height: 260px;
  overflow: auto;
}

.order-filter-bar__suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #f8fafc;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.order-filter-bar__suggestion:hover {
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(59, 130, 246, 0.14);
}

.order-filter-bar__suggestion-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.order-filter-bar__suggestion-count {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  font-size: 0.75rem;
  font-weight: 800;
}

.suggestions-pop-enter-active,
.suggestions-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.suggestions-pop-enter-from,
.suggestions-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.order-filter-bar__tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.order-filter-bar__token {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(96, 165, 250, 0.24);
  background: rgba(15, 23, 42, 0.86);
  color: #e2e8f0;
  border-radius: 999px;
  padding: 9px 12px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.order-filter-bar__token:hover {
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.45);
  background: rgba(15, 23, 42, 0.98);
}

.order-filter-bar__token-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: rgba(191, 219, 254, 0.95);
}

.order-filter-bar__token-value {
  font-size: 0.84rem;
  color: rgba(241, 245, 249, 0.9);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-filter-bar__token-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  color: #f8fafc;
  background: rgba(148, 163, 184, 0.16);
  font-size: 1rem;
  line-height: 1;
  flex: 0 0 auto;
}

.order-filter-bar {
  overflow: visible;
}

.order-filter-bar__composer {
  overflow: visible;
}

.order-filter-bar__field-option-label {
  white-space: normal;
  line-height: 1.24;
}

.order-filter-bar__field-menu,
.order-filter-bar__suggestions {
  max-width: min(860px, 92vw);
}

.order-filter-bar__field-menu.is-open-up,
.order-filter-bar__suggestions.is-open-up {
  top: auto;
  bottom: calc(100% + 8px);
}

.order-filter-bar__suggestion {
  align-items: flex-start;
}

.order-filter-bar__suggestion-value {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.28;
  word-break: break-word;
}

@media (max-width: 900px) {
  .order-filter-bar__composer {
    grid-template-columns: 1fr;
  }

  .order-filter-bar__actions {
    width: 100%;
  }

  .order-filter-bar__primary,
  .order-filter-bar__secondary {
    flex: 1 1 160px;
  }
}
</style>
