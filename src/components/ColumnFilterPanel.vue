<template>
  <Teleport to="body">
    <Transition name="filter-panel">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="column-filter-dropdown"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        @click.stop
        @keydown.esc.prevent="close"
        tabindex="-1"
      >
        <div class="filter-header">
          <span class="title">{{ title }}</span>
          <button type="button" class="filter-close" @click.stop="close" aria-label="Cerrar">
            <IIcon name="ic:baseline-close" size="18" />
          </button>
        </div>

        <div class="filter-search">
          <IIcon name="ic:baseline-search" size="14" />
          <input
              ref="searchInput"
              v-model="localSearch"
              type="search"
              placeholder="Buscar valores..."
              class="filter-search-input"
              @keydown.stop
            />
        </div>

        <div class="filter-actions">
          <button type="button" class="btn-action btn-all" @click.stop.prevent="selectAll">Todos</button>
          <button type="button" class="btn-action btn-filtered" @click.stop.prevent="selectFilteredResults">Seleccionar resultados</button>
          <button type="button" class="btn-action btn-none" @click.stop.prevent="selectNone">Ninguno</button>
        </div>

        <div ref="listContainer" class="filter-options scrollable" @scroll.passive="onScroll" :style="{ maxHeight: maxHeight + 'px' }">
          <div v-if="filteredTotal === 0" class="empty-state">No hay resultados</div>

          <div class="virtual-spacer" :style="{ height: totalHeight + 'px' }"></div>
          <div class="virtual-viewport" :style="{ transform: 'translateY(' + offset + 'px)' }">
            <label
              v-for="(item, idx) in visibleItems"
              :key="String(item.value)"
              class="filter-option"
              @mousedown.stop
              @click.stop
            >
              <input
                type="checkbox"
                class="checkbox-hidden"
                :checked="localSelectedSet.has(String(item.value))"
                @change.stop="toggleValue(item)"
              />
              <span class="checkbox-visual" :class="{ checked: localSelectedSet.has(String(item.value)) }">
                <span v-if="localSelectedSet.has(String(item.value))" class="check-mark">✓</span>
              </span>
              <span class="filter-value">{{ item.label ?? item.value ?? '(Vacío)' }}</span>
              <span class="filter-count">{{ item.count ?? 0 }}</span>
            </label>
          </div>
        </div>

        <div class="filter-panel-footer">
          <button type="button" class="btn-apply" @click.stop.prevent="apply">Aplicar</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import IIcon from '@/components/IIcon.vue'

const props = defineProps({
  isOpen:   { type: Boolean, default: false },
  title:    { type: String,  default: 'Filtrar' },
  items:    { type: Array,   default: () => [] }, // [{ value,label,count }]
  selected: { type: Array,   default: () => [] },
  anchorEl: { type: [Object, HTMLElement], default: null },
  maxHeight: { type: Number, default: 420 },
  itemHeight: { type: Number, default: 36 }
})

const emit = defineEmits(['update:selected', 'close', 'apply', 'select-filtered-rows'])

const panelRef = ref(null)
const listContainer = ref(null)
const searchInput = ref(null)
const searchText = ref('')
const localSearch = ref('')
let searchDebounceTimer = null
const panelStyle = ref({ top: '0px', left: '0px' })

// Scroll parents to keep the panel attached to the header inside scrollable containers
const scrollParents = ref([])

function isScrollable(el) {
  if (!el || el === document.body || el === document.documentElement) return false
  const style = getComputedStyle(el)
  const overflowY = style.overflowY
  return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay' || el.scrollHeight > el.clientHeight
}

function findScrollParents(el) {
  const parents = []
  let p = el && (el instanceof HTMLElement ? el.parentElement : null)
  while (p) {
    if (isScrollable(p)) parents.push(p)
    p = p.parentElement
  }
  // always include window as a fallback
  parents.push(window)
  return parents
}

function addScrollParentsListenersForAnchor() {
  const anchor = getAnchorEl()
  if (!anchor) return
  // remove previous
  removeScrollParentsListeners()
  const parents = findScrollParents(anchor)
  scrollParents.value = parents
  parents.forEach(parent => {
    try { parent.addEventListener('scroll', schedulePositionUpdate, { passive: true }) } catch (e) { parent.addEventListener('scroll', schedulePositionUpdate) }
  })
}

function removeScrollParentsListeners() {
  if (!scrollParents.value || scrollParents.value.length === 0) return
  scrollParents.value.forEach(parent => {
    try { parent.removeEventListener('scroll', schedulePositionUpdate, { passive: true }) } catch (e) { parent.removeEventListener('scroll', schedulePositionUpdate) }
  })
  scrollParents.value = []
}

// internal selection set for fast membership
const localSelectedSet = ref(new Set((props.selected || []).map(v => String(v))))

// Virtualization state
const itemHeight = props.itemHeight
const maxHeight = props.maxHeight
const BUFFER = 6
const filteredAll = computed(() => {
  const q = String(searchText.value || '').trim().toLowerCase()
  if (!q) return props.items || []
  return (props.items || []).filter(it => String(it.label ?? it.value ?? '').toLowerCase().includes(q))
})
const filteredTotal = computed(() => filteredAll.value.length)
const totalHeight = computed(() => filteredTotal.value * itemHeight)
const visibleCount = computed(() => Math.min(filteredTotal.value, Math.ceil(maxHeight / itemHeight) + BUFFER * 2))
const startIndex = ref(0)
const offset = ref(0)
const visibleItems = computed(() => filteredAll.value.slice(startIndex.value, startIndex.value + visibleCount.value))

let rafId = null
function schedulePositionUpdate() {
  if (rafId) return
  rafId = requestAnimationFrame(() => { try { updatePosition() } finally { rafId = null } })
}

function getAnchorEl() {
  const a = props.anchorEl
  if (!a) return null
  return a?.value ?? a
}

function updatePosition() {
  const anchor = getAnchorEl()
  const panel = panelRef.value
  if (!anchor || !panel) return
  const rect = anchor.getBoundingClientRect()
  const pw = panel.offsetWidth || 260
  let top = rect.bottom + 6
  let left = rect.left
  if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pw - 8)
  if (left < 8) left = 8
  if (top + panel.offsetHeight > window.innerHeight - 8) {
    // try position above anchor
    const alt = rect.top - panel.offsetHeight - 6
    if (alt > 8) top = alt
  }
  panelStyle.value = { top: `${Math.round(top)}px`, left: `${Math.round(left)}px` }
}

function handleDocClick(e) {
  if (!props.isOpen) return
  const panel = panelRef.value
  if (!panel) return
  if (!panel.contains(e.target)) emit('close')
}

function onScroll(e) {
  const sc = e.target
  const st = sc.scrollTop || 0
  const si = Math.floor(st / itemHeight)
  const maxStart = Math.max(0, filteredTotal.value - visibleCount.value)
  startIndex.value = Math.min(maxStart, Math.max(0, si - BUFFER))
  offset.value = startIndex.value * itemHeight
}

function toggleValue(item) {
  const id = String(item.value)
  const s = localSelectedSet.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
  // trigger reactivity
  localSelectedSet.value = new Set([...s])
}

function selectAll() {
  localSelectedSet.value = new Set((props.items || []).map(i => String(i.value)))
}

function selectNone() {
  localSelectedSet.value = new Set()
}

function selectFilteredResults() {
  const vals = filteredAll.value.map(it => String(it.value))
  localSelectedSet.value = new Set(vals)
}

function apply() {
  const arr = Array.from(localSelectedSet.value)
  emit('update:selected', arr)
  emit('apply', arr)
  emit('close')
}

watch(() => props.selected, (n) => {
  localSelectedSet.value = new Set((n || []).map(v => String(v)))
}, { deep: true })

// debounce local search to avoid recomputing filter on every keystroke
watch(localSearch, (val) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => { searchText.value = val }, 150)
})

watch(() => props.isOpen, async (open) => {
  if (open) {
    // sync selection and position
    localSelectedSet.value = new Set((props.selected || []).map(v => String(v)))
    // initialize search
    localSearch.value = searchText.value || ''
    await nextTick()
    // focus search input
    try { searchInput.value?.focus() } catch (e) {}
    addScrollParentsListenersForAnchor()
    schedulePositionUpdate()
  } else {
    // panel closed — remove scroll listeners and clear debounce
    removeScrollParentsListeners()
    if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); searchDebounceTimer = null }
  }
})

onMounted(() => {
  window.addEventListener('resize', schedulePositionUpdate, { passive: true })
  document.addEventListener('click', handleDocClick, true)
  // attach scroll listener to window to reposition on big scroll changes
  try { window.addEventListener('scroll', schedulePositionUpdate, { capture: true, passive: true }) } catch (e) { window.addEventListener('scroll', schedulePositionUpdate, true) }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', schedulePositionUpdate)
  document.removeEventListener('click', handleDocClick, true)
  try { window.removeEventListener('scroll', schedulePositionUpdate, { capture: true, passive: true }) } catch (e) { window.removeEventListener('scroll', schedulePositionUpdate, true) }
  // remove any attached scroll listeners for anchor parents
  removeScrollParentsListeners()
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
})
</script>

<style scoped>
.column-filter-dropdown { position: fixed; z-index: 14000; background: rgba(8,12,20,0.98); border-radius: 10px; border: 1px solid rgba(59,130,246,0.18); box-shadow: 0 10px 40px rgba(0,0,0,0.5); min-width: 240px; max-width: 420px; max-height: 360px; display:flex; flex-direction:column; overflow: hidden; }
.filter-header { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-bottom:1px solid rgba(59,130,246,0.06); color:#93c5fd; font-weight:600; font-size:0.86rem }
.title { font-size:0.82rem; font-weight:700; color:#7ef0c4; text-transform:uppercase }
.filter-close { background:transparent; border:none; color:#cbd5e1; cursor:pointer; padding:4px; border-radius:6px }
.filter-search { display:flex; gap:8px; padding:8px 12px; margin:8px 12px 6px; background:rgba(30,41,59,0.5); border-radius:6px; align-items:center }
.filter-search-input { flex:1; border:none; background:transparent; color:#e6f0ff; outline:none; caret-color:#bfe9ff }
.filter-search-input::placeholder { color: rgba(230,240,255,0.45); opacity:1 }
.filter-search-input:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.08); border-radius:6px }
.filter-actions { display:flex; gap:8px; padding:0 12px 8px }
.btn-action { flex:1; padding:6px 10px; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.12); border-radius:8px; color:#dbeafe; font-weight:700; font-size:0.8rem; cursor:pointer }
.btn-action:hover { background:rgba(59,130,246,0.14); color:#fff }
.filter-options { position:relative; padding:6px 10px; flex: 1 1 auto; min-height: 0; }
.filter-options.scrollable { overflow-y:auto; -webkit-overflow-scrolling: touch }
.empty-state { display:flex; align-items:center; justify-content:center; gap:10px; padding:18px 12px; color:#cfe9ff; background:rgba(255,255,255,0.02); border-radius:8px; font-size:0.95rem; font-weight:600 }
.empty-state svg { width:20px; height:20px; opacity:0.95; fill:none; stroke:currentColor }
.virtual-spacer { width:100% }
.virtual-viewport { position:absolute; top:0; left:0; right:0 }
.filter-option { display:flex; align-items:center; gap:10px; padding:6px 8px; cursor:pointer; user-select:none; color:#dbeafe }
.filter-option:hover { background:rgba(59,130,246,0.06); color:#ffffff }
.checkbox-hidden { position:absolute; opacity:0; width:1px; height:1px }
.checkbox-visual { width:18px; height:18px; min-width:18px; border:2px solid rgba(59,130,246,0.18); border-radius:6px; display:inline-flex; align-items:center; justify-content:center; background:rgba(20,26,34,0.4) }
.checkbox-visual.checked { background:linear-gradient(135deg,#34d399,#10b981); border-color:#10b981 }
.check-mark { color:#ffffff; font-size:12px; font-weight:800 }
.filter-value { flex:1; color:#e6eefc; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.filter-count { color:#9fb6cc; font-size:0.72rem; background:rgba(255,255,255,0.02); border-radius:8px; padding:2px 6px }
.filter-panel-footer { padding:10px 12px; border-top:1px solid rgba(59,130,246,0.04); flex-shrink: 0; background: linear-gradient(180deg, rgba(8,12,20,0.0), rgba(8,12,20,0.6)); }
.btn-apply { width:100%; padding:10px; background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; border-radius:8px; font-weight:800; cursor:pointer }
.filter-panel-enter-active, .filter-panel-leave-active { transition: opacity 0.14s ease, transform 0.12s ease }
.filter-panel-enter-from, .filter-panel-leave-to { opacity:0; transform: translateY(-6px) }
.filter-panel-enter-from .column-filter-dropdown,
.filter-panel-leave-to   .column-filter-dropdown {
  transform: translateY(-6px) scale(0.97);
  transition: transform 0.18s ease;
}

/* Improved responsive handling for small screens */
@media (max-width: 600px) {
  .column-filter-dropdown {
    width: 88vw;
    max-width: 320px;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
}
</style>
