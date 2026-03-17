<template>
  <Teleport to="body">
    <Transition name="filter-panel">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="filter-panel-container"
        :style="panelStyle"
      >
          <!-- Header -->
          <div class="filter-panel-header">
            <span class="title-text">{{ title }}</span>
            <button type="button" class="btn-close" @mousedown.stop @click.stop="close">
              <IIcon name="ic:baseline-close" size="18" />
            </button>
          </div>

          <!-- Buscador -->
          <div class="filter-search-box">
            <IIcon name="ic:baseline-search" size="15" class="search-icon" />
            <input
              v-model="searchText"
              type="text"
              placeholder="Buscar valores..."
              class="search-input"
              @mousedown.stop
              @click.stop
            />
          </div>

          <!-- Todos / Ninguno -->
          <div class="filter-actions">
            <button
              type="button"
              class="btn-action btn-all"
              @mousedown.stop
              @click.stop.prevent="selectAll"
            >
              <IIcon name="ic:baseline-check-box" size="14" />
              <span>Todos</span>
            </button>
            <button
              type="button"
              class="btn-action btn-none"
              @mousedown.stop
              @click.stop.prevent="selectNone"
            >
              <IIcon name="ic:baseline-check-box-outline-blank" size="14" />
              <span>Ninguno</span>
            </button>
          </div>

          <!-- Lista de items con checkboxes -->
          <div class="filter-items-list" :class="{ scrollable: props.items.length > 8 }">
            <div v-if="filteredItems.length === 0" class="empty-state">
              No hay resultados
            </div>
            <label
              v-for="item in filteredItems"
              :key="String(item.value)"
              class="filter-item"
              @mousedown.stop
              @click.stop
            >
              <input
                v-model="localSelected"
                type="checkbox"
                :value="String(item.value)"
                class="checkbox-hidden"
                @click.stop
                @change.stop
              />
              <span class="checkbox-visual" :class="{ checked: localSelected.includes(String(item.value)) }">
                <span v-if="localSelected.includes(String(item.value))" class="check-mark">✓</span>
              </span>
              <span class="item-label">{{ item.label ?? item.value ?? '(Vacío)' }}</span>
              <span v-if="item.count !== undefined" class="item-count">{{ item.count }}</span>
            </label>
          </div>

          <!-- Botón Aplicar -->
          <div class="filter-panel-footer">
            <button type="button" class="btn-apply" @mousedown.stop @click.stop.prevent="apply">
              <IIcon name="ic:baseline-done" size="16" />
              Aplicar
            </button>
          </div>
        </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import IIcon from '@/components/IIcon.vue'

const props = defineProps({
  isOpen:    { type: Boolean, default: false },
  title:     { type: String,  default: 'Filtrar' },
  items:     { type: Array,   default: () => [] },
  selected:  { type: Array,   default: () => [] },
  anchorEl:  { type: Object,  default: null }
})

const emit = defineEmits(['update:selected', 'close', 'apply'])

const panelRef   = ref(null)
const searchText = ref('')
const panelStyle = ref({ top: '0px', left: '0px' })

// Estado interno de selección (siempre strings para comparación simple)
const localSelected = ref([])

// Items visibles según búsqueda
const filteredItems = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return props.items
  return props.items.filter(item =>
    String(item.label ?? item.value ?? '').toLowerCase().includes(q)
  )
})

// ── Acciones de selección ──────────────────────────────────────
function selectAll () {
  // Marcar TODOS los items (no solo los visibles en búsqueda)
  localSelected.value = props.items.map(item => String(item.value))
}

function selectNone () {
  // Desmarcar todos
  localSelected.value = []
}

// ── Cerrar ────────────────────────────────────────────────────
function close () {
  searchText.value = ''
  emit('close')
}

// ── Aplicar ───────────────────────────────────────────────────
function apply () {
  const values = [...localSelected.value]
  emit('update:selected', values)
  emit('apply', values)
  close()
}

// Click outside detection
function handleDocumentClick (e) {
  if (!props.isOpen || !panelRef.value) return
  const panel = panelRef.value
  // Close if click is outside the panel element
  if (!panel.contains(e.target)) {
    close()
  }
}

// ── Posicionamiento ───────────────────────────────────────────
function updatePosition () {
  if (!props.anchorEl || !panelRef.value) return
  const rect = props.anchorEl.getBoundingClientRect()
  const pw   = panelRef.value.offsetWidth || 300
  let top  = rect.bottom + 4
  let left = rect.left

  if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pw - 8)
  if (left < 8) left = 8

  panelStyle.value = { top: `${top}px`, left: `${left}px` }
}

// El panel se reposiciona para quedarse junto al encabezado cuando se hace scroll
function handleScroll () { 
  if (props.isOpen) {
    updatePosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
  document.addEventListener('click', handleDocumentClick, true)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
  document.removeEventListener('click', handleDocumentClick, true)
})

// ── Reactivo: sincronizar cuando el panel se abre ─────────────
watch(() => props.isOpen, async (open) => {
  if (open) {
    searchText.value    = ''
    localSelected.value = (props.selected || []).map(v => String(v))
    await nextTick()
    updatePosition()
  }
})

// Sincronizar si el padre cambia selected mientras el panel está abierto
watch(() => props.selected, (newVal) => {
  if (props.isOpen) {
    localSelected.value = (newVal || []).map(v => String(v))
  }
}, { deep: true })
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════════════
   PANEL DE FILTRO (flota sobre la página sin cubrirla)
   ════════════════════════════════════════════════════════════════════ */

/* ── Contenedor del panel (flota en su posición, no cubre toda la pantalla) ── */
.filter-panel-container {
  position: fixed;
  background: #0f172a;
  border: 1px solid rgba(34, 197, 94, 0.35);
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
  width: 300px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  z-index: 9001;
  overflow: hidden;
}

/* ── Header ── */
.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(34, 197, 94, 0.06);
  flex-shrink: 0;
}

.title-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #a7f3d0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.btn-close:hover { color: #e2e8f0; background: rgba(255, 255, 255, 0.08); }

/* ── Buscador ── */
.filter-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
.search-icon { color: #64748b; flex-shrink: 0; }
.search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.83rem;
  outline: none;
  padding: 5px 8px;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: rgba(34, 197, 94, 0.5); }
.search-input::placeholder { color: #475569; }

/* ── Todos / Ninguno ── */
.filter-actions {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
.btn-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.btn-action:hover { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; }
.btn-all:hover  { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.4); color: #a7f3d0; }
.btn-none:hover { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; }

/* ── Lista de items ── */
.filter-items-list {
  flex: 1;
  padding: 4px 0;
  overflow: hidden;
}
.filter-items-list.scrollable {
  overflow-y: auto;
  max-height: 250px;
}
.filter-items-list.scrollable::-webkit-scrollbar { width: 4px; }
.filter-items-list.scrollable::-webkit-scrollbar-track { background: transparent; }
.filter-items-list.scrollable::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.3);
  border-radius: 2px;
}

.empty-state {
  padding: 16px 12px;
  text-align: center;
  color: #475569;
  font-size: 0.83rem;
}

/* ── Label / Item ── */
.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}
.filter-item:hover { background: rgba(34, 197, 94, 0.05); }

/* Checkbox real oculto – NO tiene pointer-events:none para que v-model funcione */
.checkbox-hidden {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}

/* Visual del checkbox */
.checkbox-visual {
  width: 17px;
  height: 17px;
  min-width: 17px;
  border: 1.5px solid rgba(100, 116, 139, 0.6);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all 0.15s;
  flex-shrink: 0;
}
.filter-item:hover .checkbox-visual { border-color: rgba(34, 197, 94, 0.5); }
.checkbox-visual.checked {
  background: #22c55e;
  border-color: #22c55e;
}
.check-mark {
  color: #0f172a;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}

.item-label {
  flex: 1;
  color: #cbd5e1;
  font-size: 0.83rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-count {
  color: #475569;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 22px;
  text-align: center;
}

/* ── Footer / Aplicar ── */
.filter-panel-footer {
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(59, 130, 246, 0.05);
  flex-shrink: 0;
}
.btn-apply {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  border-radius: 7px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3);
}
.btn-apply:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(59, 130, 246, 0.45);
}
.btn-apply:active { transform: translateY(0); }

/* ── Animaciones ── */
.filter-panel-enter-active,
.filter-panel-leave-active { transition: opacity 0.18s ease; }
.filter-panel-enter-from,
.filter-panel-leave-to     { opacity: 0; }

.filter-panel-enter-from .filter-panel-container,
.filter-panel-leave-to   .filter-panel-container {
  transform: translateY(-6px) scale(0.97);
  transition: transform 0.18s ease;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .filter-panel-container {
    width: 88vw;
    max-width: 320px;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
}
</style>
