<template>
  <div class="smart-search-wrapper" ref="wrapperRef">
    <!-- Badge N/A -->
    <div v-if="modelValue === 'N/A'" class="na-badge" title="Campo sin datos en el inventario">N/A</div>

    <div class="smart-search-input-box">
      <div class="input-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <input ref="inputRef"
        class="smart-input" :class="{ 'has-na': modelValue === 'N/A' }"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.down.prevent="moveSelection(1)"
        @keydown.up.prevent="moveSelection(-1)"
        @keydown.enter.prevent="confirmSelection"
        @keydown.escape="closeDropdown"
        @keydown.tab="closeDropdown"
        autocomplete="off"
        spellcheck="false" />

      <button v-if="modelValue && modelValue !== 'N/A'"
        class="clear-btn" @click="clearValue" type="button" title="Borrar">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Dropdown de resultados -->
    <Teleport to="body">
      <transition name="smart-dropdown">
        <div v-if="isOpen && (groupedResults.length > 0 || (query.length > 0 && groupedResults.length === 0))"
          ref="dropdownRef"
          class="smart-dropdown"
          :style="dropdownStyle"
          @mousedown.prevent>
          
          <!-- Barra de estado de búsqueda -->
          <div class="search-status-bar" v-if="query.length > 0">
            <span class="result-count">
              {{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }}
            </span>
            <span class="search-hint" v-if="totalResults > 0">
              ↑↓ navegar · Enter seleccionar · Esc cerrar
            </span>
          </div>

          <!-- Resultados agrupados -->
          <div class="results-scroll" ref="scrollRef">
            <template v-for="(group, gi) in groupedResults" :key="group.key">
              <div class="group-header">
                <span class="group-icon">{{ groupIcon(group.key) }}</span>
                <span class="group-label">{{ group.label }}</span>
                <span class="group-count">{{ group.count }}</span>
              </div>

              <div v-for="(result, ri) in group.items" :key="`${group.key}-${ri}`"
                :ref="el => setItemRef(el, flatIndex(gi, ri))"
                :class="['result-card', { 'is-active': flatIndex(gi, ri) === activeIndex }]"
                @click="selectResult(result)"
                @mouseenter="activeIndex = flatIndex(gi, ri)">
                
                <div class="card-main">
                  <div class="card-name" v-html="highlightField(result, 'nombre')"></div>
                  <div class="card-relevance" :title="`Relevancia: ${result.relevance}%`">
                    <div class="relevance-bar">
                      <div class="relevance-fill" :style="{ width: result.relevance + '%' }"></div>
                    </div>
                  </div>
                </div>

                <div class="card-details">
                  <span v-if="hasVal(result.item.marca)" class="detail-chip chip-marca">
                    <span class="chip-label">Marca</span> <span v-html="highlightField(result, 'marca')"></span>
                  </span>
                  <span v-if="hasVal(result.item.modelo)" class="detail-chip chip-modelo">
                    <span class="chip-label">Modelo</span> <span v-html="highlightField(result, 'modelo')"></span>
                  </span>
                  <span v-if="hasVal(result.item.serie)" class="detail-chip chip-serie">
                    <span class="chip-label">Serie</span> <span v-html="highlightField(result, 'serie')"></span>
                  </span>
                  <span v-if="hasVal(result.item.noInventario)" class="detail-chip chip-inv">
                    <span class="chip-label">Inv</span> <span v-html="highlightField(result, 'noInventario')"></span>
                  </span>
                  <span v-if="hasVal(result.item.referencia)" class="detail-chip chip-ref">
                    <span class="chip-label">Ref</span> <span v-html="highlightField(result, 'referencia')"></span>
                  </span>
                  <span v-if="hasVal(result.item.claveHRAEI)" class="detail-chip chip-clave">
                    <span class="chip-label">HRAEI</span> <span v-html="highlightField(result, 'claveHRAEI')"></span>
                  </span>
                  <span v-if="hasVal(result.item.ubicacion) && result.item.ubicacion !== 'N/A'" class="detail-chip chip-ubi">
                    <span class="chip-label">📍</span> <span v-html="highlightField(result, 'ubicacion')"></span>
                  </span>
                </div>
              </div>
            </template>

            <!-- Sin resultados -->
            <div v-if="query.length > 0 && groupedResults.length === 0" class="no-results">
              <div class="no-results-icon">🔍</div>
              <p>No se encontraron coincidencias para "<strong>{{ query }}</strong>"</p>
              <button type="button" class="add-custom-btn" @click="selectCustom">
                <span class="add-icon">+</span> Agregar "{{ query }}" manualmente
              </button>
            </div>
          </div>

          <!-- Fuente de datos -->
          <div class="dropdown-footer">
            <span class="source-label">
              Búsqueda exacta · Solo coincidencias perfectas
            </span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useFuseSearch } from '@/composables/useFuseSearch'

const props = defineProps({
  modelValue: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Escriba para buscar...' },
  fieldName: { type: String, default: 'nombre' },
  tipo: { type: String, default: '' },
  // Inyección de searchKeys se mantiene para compat, pero Fuse.js tiene sus propias keys
  searchKeys: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'select'])

// Refs DOM
const wrapperRef = ref(null)
const inputRef = ref(null)
const dropdownRef = ref(null)
const scrollRef = ref(null)
const itemRefs = ref({})

// Estado
const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)
const dropdownStyle = ref({})

// --- Fuse.js ---
const suggestionsRef = computed(() => props.suggestions || [])
const { search, searchGrouped, highlightField, isIndexReady } = useFuseSearch(suggestionsRef)

// Resultados agrupados
const groupedResults = computed(() => {
  if (!query.value || query.value.trim().length < 1) return []
  return searchGrouped(query.value)
})

const totalResults = computed(() =>
  groupedResults.value.reduce((sum, g) => sum + g.count, 0)
)

// Flatten index helper para navegación teclado
const flatItems = computed(() => {
  const flat = []
  groupedResults.value.forEach(g => {
    g.items.forEach(item => flat.push(item))
  })
  return flat
})

function flatIndex(groupIdx, itemIdx) {
  let idx = 0
  for (let g = 0; g < groupIdx; g++) {
    idx += groupedResults.value[g].items.length
  }
  return idx + itemIdx
}

function setItemRef(el, idx) {
  if (el) itemRefs.value[idx] = el
}

// ------- Input handlers -------
function handleInput(e) {
  const val = e.target.value
  query.value = val
  emit('update:modelValue', val)
  activeIndex.value = -1
  if (!isOpen.value) isOpen.value = true
  updateDropdownPosition()
}

function onFocus() {
  if (query.value.trim().length > 0 || props.modelValue) {
    query.value = props.modelValue || ''
    isOpen.value = true
    updateDropdownPosition()
  }
}

function onBlur() {
  // Delay para que clicks en el dropdown se registren
  setTimeout(() => { isOpen.value = false }, 180)
}

function closeDropdown() {
  isOpen.value = false
  activeIndex.value = -1
}

// ------- Selection -------
function selectResult(result) {
  const value = result.item[props.fieldName] || result.item.nombre || result.item.label || ''
  query.value = value
  emit('update:modelValue', value)
  emit('select', result.item)
  isOpen.value = false
  activeIndex.value = -1
}

function selectCustom() {
  const customItem = { [props.fieldName]: query.value, label: query.value }
  emit('update:modelValue', query.value)
  emit('select', customItem)
  isOpen.value = false
}

function confirmSelection() {
  if (activeIndex.value >= 0 && flatItems.value[activeIndex.value]) {
    selectResult(flatItems.value[activeIndex.value])
  } else if (query.value) {
    selectCustom()
  }
}

function clearValue() {
  query.value = ''
  emit('update:modelValue', '')
  isOpen.value = false
  activeIndex.value = -1
  nextTick(() => inputRef.value?.focus())
}

// ------- Keyboard navigation -------
function moveSelection(delta) {
  const count = flatItems.value.length
  if (count === 0) return

  if (!isOpen.value) {
    isOpen.value = true
    updateDropdownPosition()
    return
  }

  let next = activeIndex.value + delta
  if (next < 0) next = count - 1
  if (next >= count) next = 0
  activeIndex.value = next

  // Scroll into view
  nextTick(() => {
    const el = itemRefs.value[next]
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

// ------- Dropdown positioning (Teleported to body) -------
function updateDropdownPosition() {
  nextTick(() => {
    if (!wrapperRef.value) return
    const rect = wrapperRef.value.getBoundingClientRect()
    const viewportH = window.innerHeight
    const spaceBelow = viewportH - rect.bottom
    const maxH = Math.min(380, Math.max(spaceBelow - 12, 200))

    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 2}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 420)}px`,
      maxHeight: `${maxH}px`,
      zIndex: 99999,
    }
  })
}

// ------- Sync with v-model -------
watch(() => props.modelValue, (val) => {
  query.value = val || ''
})

// ------- Helpers -------
function hasVal(v) {
  if (!v) return false
  const s = String(v).trim()
  return s !== '' && s.toUpperCase() !== 'N/A' && !/^[-_0]*$/.test(s)
}

function groupIcon(key) {
  const icons = {
    'equipo-medico': '🏥',
    'accesorio': '🔌',
    'consumible': '💊',
    'refaccion': '🔧',
    'otro': '📦',
  }
  return icons[key] || '📦'
}

// Window resize/scroll handler for repositioning dropdown
let rafId = null
function onReposition() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    if (isOpen.value) updateDropdownPosition()
  })
}

onMounted(() => {
  window.addEventListener('scroll', onReposition, true)
  window.addEventListener('resize', onReposition)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onReposition, true)
  window.removeEventListener('resize', onReposition)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* ===== BASE WRAPPER ===== */
.smart-search-wrapper {
  position: relative;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* ===== INPUT BOX ===== */
.smart-search-input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  display: flex;
  z-index: 2;
}

.smart-input {
  width: 100%;
  padding: 8px 36px 8px 32px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.92rem;
  background: #fff;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.smart-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  background: #fafaff;
}

.smart-input.has-na {
  padding-right: 50px;
  color: #dc2626;
  font-weight: 500;
  background: #fef2f2;
  border-color: #fecaca;
}

.smart-input.has-na:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.smart-input::placeholder {
  color: #94a3b8;
  font-style: normal;
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
  z-index: 5;
}

.clear-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* ===== DROPDOWN ===== */
.smart-dropdown {
  background: #0c1322;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(99, 102, 241, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(16px);
  font-family: inherit;
}

/* Barra de estado */
.search-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(99, 102, 241, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.result-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #818cf8;
}

.search-hint {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.3px;
}

/* Scroll container */
.results-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  padding: 6px;
}

.results-scroll::-webkit-scrollbar { width: 5px; }
.results-scroll::-webkit-scrollbar-track { background: transparent; }
.results-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.25);
  border-radius: 10px;
}

/* ===== GROUP HEADER ===== */
.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 4px;
  margin-top: 4px;
}

.group-header:first-child { margin-top: 0; }

.group-icon { font-size: 0.8rem; }

.group-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.35);
}

.group-count {
  font-size: 0.65rem;
  font-weight: 600;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: auto;
}

/* ===== RESULT CARD ===== */
.result-card {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s, transform 0.08s;
  margin-bottom: 2px;
}

.result-card:hover,
.result-card.is-active {
  background: rgba(99, 102, 241, 0.08);
}

.result-card.is-active {
  box-shadow: inset 2px 0 0 #6366f1;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.card-name {
  font-weight: 600;
  font-size: 0.88rem;
  color: #e2e8f0;
  line-height: 1.25;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-name :deep(mark) {
  background: rgba(250, 204, 21, 0.25);
  color: #fde68a;
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 700;
}

/* Barra de relevancia */
.card-relevance {
  flex-shrink: 0;
  width: 40px;
}

.relevance-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.relevance-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #818cf8, #6366f1);
  transition: width 0.3s ease;
}

/* ===== DETAIL CHIPS ===== */
.card-details {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 0.7rem;
  line-height: 1.3;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-chip :deep(mark) {
  background: rgba(250, 204, 21, 0.2);
  color: #fde68a;
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 600;
}

.chip-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

/* Colores específicos por tipo de chip */
.chip-marca  { border-left: 2px solid #818cf8; }
.chip-modelo { border-left: 2px solid #38bdf8; }
.chip-serie  { border-left: 2px solid #34d399; }
.chip-inv    { border-left: 2px solid #f472b6; }
.chip-ref    { border-left: 2px solid #fb923c; }
.chip-clave  { border-left: 2px solid #a78bfa; }
.chip-ubi    { border-left: 2px solid #fbbf24; }

/* ===== NO RESULTS ===== */
.no-results {
  padding: 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

.no-results p {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.88rem;
  margin: 0 0 12px 0;
}

.no-results strong {
  color: rgba(255, 255, 255, 0.7);
}

.add-custom-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.06));
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.add-custom-btn:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1));
  transform: translateY(-1px);
}

.add-icon {
  font-size: 1.1rem;
  font-weight: 700;
}

/* ===== FOOTER ===== */
.dropdown-footer {
  padding: 5px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.source-label {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.18);
  letter-spacing: 0.4px;
}

/* ===== TRANSITIONS ===== */
.smart-dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.smart-dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.smart-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.smart-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
