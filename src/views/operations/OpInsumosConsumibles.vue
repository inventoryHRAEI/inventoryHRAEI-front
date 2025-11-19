<template>
  <FormShell>
    <template #title>Insumos y Consumibles</template>

    <template #body>
  <div class="op-card insumos" ref="rootRef">
        <form @submit.prevent="onSubmit" class="form-grid" id="insumos-form" novalidate>
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Datos del artículo</h4>
              <small class="hint">Descripción, cantidad y fecha de recibo</small>
            </div>
            <div class="section-grid main-form">
              <!-- Primera fila: Descripción y Fecha -->
              <div class="field descripcion-field">
                <label>Descripción</label>
                <input
                  class="control"
                  v-model.trim="form.descripcion"
                  placeholder="Ej. Se realiza entrega de consumibles"
                />
              </div>
              <div class="field fecha-field">
                <label>Fecha de recibo en biomédica</label>
                <input class="control" v-model="form.fechaRecibo" type="date" />
              </div>
              
              <!-- Segunda fila: Cantidad centrada -->
              <div class="field quantity-field-centered">
                <label>Cantidad</label>
                <div class="counter">
                  <button class="ctr-btn wide" type="button" @click="decMainBy(5)" aria-label="Disminuir cinco">
                    -5
                  </button>
                  <button class="ctr-btn" type="button" @click="decMain" aria-label="Disminuir uno">
                    -
                  </button>
                  <input
                    class="control ctr-input"
                    v-model.number="form.cantidad"
                    type="number"
                    min="0"
                    step="1"
                    inputmode="numeric"
                  />
                  <button class="ctr-btn" type="button" @click="incMain" aria-label="Aumentar uno">
                    +
                  </button>
                  <button class="ctr-btn wide" type="button" @click="incMainBy(5)" aria-label="Aumentar cinco">
                    +5
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Información del Solicitante</h4>
              <small class="hint">Datos de quien solicita los insumos</small>
            </div>
            <div class="section-grid solicitante-form">
              <div class="field">
                <label>Solicitante</label>
                <input
                  class="control w-32ch"
                  v-model.trim="form.solicitante"
                  placeholder="Ej. Arq. Karla Alejandra Torres Sanchez"
                />
              </div>
              <div class="field">
                <label>Unidad</label>
                <input class="control w-14ch" v-model.trim="form.unidad" placeholder="Ej. Carga" />
              </div>
              <div class="field">
                <label>Turno laboral</label>
                <input class="control w-14ch" v-model.trim="form.turno" placeholder="Ej. Matutino" />
              </div>
            </div>
          </div>

          <div class="section-card items-card">
            <div class="section-head">
              <h4>Consumibles (renglones) - {{ form.items.length }}</h4>
              <small class="hint">Completa descripción y clave por cada renglón</small>
            </div>
            <div class="section-list">
              <p v-if="!form.items.length" class="empty-hint">
                Ajusta la cantidad para generar los renglones necesarios.
              </p>
              <div class="item-row" v-for="(item, idx) in form.items" :key="idx">
                <div class="item-head">
                  <span class="badge">#{{ idx + 1 }}</span>
                  Consumible
                </div>
                <div class="item-grid">
                  <div class="field">
                    <label>Descripción</label>
                    <input
                      class="control w-38ch"
                      v-model.trim="item.descripcion"
                      placeholder="Descripción del consumible"
                    />
                  </div>
                  <div class="field">
                    <label>Clave HRAEI</label>
                    <input
                      class="control w-20ch"
                      v-model.trim="item.claveHRAEI"
                      placeholder="Ej. HRAEI-XXXX"
                    />
                  </div>
                  <div class="field">
                    <label>Cantidad</label>
                    <input
                      class="control w-12ch"
                      v-model.number="item.cantidad"
                      type="number"
                      min="0"
                      step="1"
                      inputmode="numeric"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </form>
        
        <div class="form-actions">
          <button class="btn secondary cancel-btn" type="button" @click="onCancel" :disabled="loading">
            Cancelar
          </button>
          <button class="btn primary save-btn" type="submit" form="insumos-form" :disabled="loading || !isValid">
            {{ loading ? 'Guardando...' : 'Guardar orden' }}
          </button>
        </div>
      </div>
    </template>
  </FormShell>
  
  <!-- Botón Scroll to Top - Fuera de todos los contenedores -->
  <Transition name="scroll-btn">
    <button 
      v-show="showScrollTop" 
      @click="scrollToTop"
      @mouseenter="onHoverStart"
      @mouseleave="onHoverEnd"
      :class="['scroll-to-top-btn', { 
        'animating-out': isAnimatingOut
      }]"
      aria-label="Volver al inicio"
    >
      <span class="scroll-icon">↑</span>
      <span class="scroll-text">Volver al principio</span>
    </button>
  </Transition>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import FormShell from '@/components/FormShell.vue'
import notifier from '@/utils/notifier'
import Swal from 'sweetalert2'

const LOCAL_KEY = 'op-insumos-consumibles'

// Router para navegación
const router = useRouter()

const form = reactive({
  descripcion: '',
  cantidad: 0,
  fechaRecibo: '',
  solicitante: '',
  unidad: '',
  turno: '',
  items: []
})

const loading = ref(false)
const savedAt = ref('')
const hydrated = ref(false)
const showScrollTop = ref(false)
const isAnimatingOut = ref(false)
let hideTimeout = null

const onCancel = async () => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se perderán todos los datos del formulario',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0bb828',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, regresar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  })

  if (result.isConfirmed) {
    // Regresar al inicio (dashboard)
    router.push('/')
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  const shouldShow = window.scrollY > 250
  
  if (shouldShow && !showScrollTop.value) {
    // Aparecer
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
    isAnimatingOut.value = false
    showScrollTop.value = true
  } else if (!shouldShow && showScrollTop.value && !isAnimatingOut.value) {
    // Solo marcar como animando y ocultar para que Vue Transition maneje todo
    isAnimatingOut.value = true
    showScrollTop.value = false
    // Resetear estado después de la animación
    hideTimeout = setTimeout(() => {
      isAnimatingOut.value = false
    }, 400)
  }
}

const onHoverStart = () => {
  // Hover solo funciona si no está animando salida
}

const onHoverEnd = () => {
  // Hover end simple
}

const isValid = computed(() => {
  const descripcion = (form.descripcion || '').trim()
  const solicitante = (form.solicitante || '').trim()
  return descripcion.length > 0 && solicitante.length > 0
})

function normalizedCount(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }
  return Math.max(0, Math.round(numeric))
}

function makeEmptyItem() {
  return {
    descripcion: '',
    claveHRAEI: '',
    cantidad: null
  }
}

function announceChange(verb, count) {
  if (!hydrated.value || count <= 0) {
    return
  }
  const label = count === 1 ? '1 renglón' : `${count} renglones`
  notifier.info(`${verb} ${label} para registrar consumibles`)
}

// Keeps inline detail rows aligned with the main quantity control.
function syncItemsToCantidad() {
  const target = normalizedCount(form.cantidad)
  const current = form.items.length

  if (target === current) {
    return
  }

  if (target > current) {
    const diff = target - current
    for (let i = 0; i < diff; i += 1) {
      form.items.push(makeEmptyItem())
    }
    announceChange('Agregaste', diff)
    return
  }

  const diff = current - target
  form.items.splice(target)
  announceChange('Eliminaste', diff)
}

function adjustMain(delta) {
  const current = Number(form.cantidad || 0)
  form.cantidad = normalizedCount(current + delta)
  syncItemsToCantidad()
}

function incMain() {
  adjustMain(1)
}

function decMain() {
  adjustMain(-1)
}

function incMainBy(amount) {
  adjustMain(amount)
}

function decMainBy(amount) {
  adjustMain(-amount)
}

function clearForm() {
  form.descripcion = ''
  form.cantidad = 0
  form.fechaRecibo = ''
  form.solicitante = ''
  form.unidad = ''
  form.turno = ''
  form.items = []
  syncItemsToCantidad()
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // ignore storage errors
  }
  savedAt.value = ''
}

async function onSubmit() {
  if (!isValid.value) {
    notifier.error('Completa los campos obligatorios')
    return
  }

  loading.value = true

  const payload = {
    descripcion: form.descripcion,
    cantidad: normalizedCount(form.cantidad),
    fechaRecibo: form.fechaRecibo,
    solicitante: form.solicitante,
    unidad: form.unidad,
    turno: form.turno,
    items: form.items.map(item => ({
      descripcion: item.descripcion,
      claveHRAEI: item.claveHRAEI,
      cantidad: item.cantidad
    })),
    createdAt: new Date().toISOString()
  }

  try {
    const res = await fetch('/api/ops/insumos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw new Error('No se pudo guardar en el servidor')
    }

    notifier.success('Orden guardada')
    clearForm()
  } catch (err) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
    } catch {
      // ignore storage errors
    }
    notifier.success('Orden guardada como borrador (offline)')
  } finally {
    loading.value = false
  }
}

let autosaveTimer

watch(
  form,
  () => {
    clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(form))
        savedAt.value = new Date().toLocaleTimeString()
      } catch {
        // ignore storage errors
      }
    }, 500)
  },
  { deep: true }
)

watch(
  () => form.cantidad,
  () => {
    form.cantidad = normalizedCount(form.cantidad)
    syncItemsToCantidad()
  }
)

onMounted(async () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      form.descripcion = data.descripcion || ''
      form.cantidad = normalizedCount(data.cantidad ?? 0)
      form.fechaRecibo = data.fechaRecibo || ''
      form.solicitante = data.solicitante || ''
      form.unidad = data.unidad || ''
      form.turno = data.turno || ''
      const storedItems = Array.isArray(data.items) ? data.items : []
      form.items = []
      syncItemsToCantidad()
      for (let i = 0; i < form.items.length && i < storedItems.length; i += 1) {
        const it = storedItems[i] || {}
        form.items[i].descripcion = it.descripcion || ''
        form.items[i].claveHRAEI = it.claveHRAEI || ''
        form.items[i].cantidad = it.cantidad ?? null
      }
      savedAt.value = new Date().toLocaleTimeString()
    } else {
      form.items = []
      syncItemsToCantidad()
    }
  } catch {
    form.items = []
    syncItemsToCantidad()
  }
  hydrated.value = true
  
  // Configurar scroll listener
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial scroll position
})

onBeforeUnmount(() => {
  clearTimeout(autosaveTimer)
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
:deep(.form-wrap) {
  align-items: flex-start;
  justify-content: center;
  min-height: auto;
}

:deep(.form-col) {
  max-width: 1080px;
  width: 100%;
}

:deep(.auth-card.glass) {
  width: 100%;
  padding: 34px 38px;
  border-radius: 26px;
  background: rgba(19, 31, 52, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(20px) saturate(170%);
  box-shadow: 0 32px 70px rgba(6, 12, 24, 0.45);
}

:deep(.auth-card-header) {
  padding: 0 0 18px 0;
}

:deep(.auth-card-body) {
  padding: 0;
}

.op-card {
  background: transparent;
  padding: 0;
  color: #e6ebf5;
  position: relative;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 26px;
  align-items: start;
}

.combined-card,
.items-card,
.form-footer {
  grid-column: 1 / -1;
}

.section-card,
.form-footer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 26px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.28);
  color: rgba(15, 23, 42, 0.88);
}

.section-card::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 42%, rgba(255, 255, 255, 0) 70%);
  opacity: 0.55;
}

.section-card > *,
.form-footer > * {
  position: relative;
  z-index: 1;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-head h4 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: rgba(15, 23, 42, 0.95);
}

.section-head .hint {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(15, 23, 42, 0.68);
  font-weight: 600;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px 20px;
}

.section-grid.combined {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px 20px;
}

.section-grid.main-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px 20px;
  align-items: start;
}

.descripcion-field {
  grid-column: 1;
  grid-row: 1;
}

.fecha-field {
  grid-column: 2;
  grid-row: 1;
}

.section-grid.solicitante-form {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 18px 20px;
  align-items: start;
}

.quantity-field-centered {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.quantity-field-centered .counter {
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1.3rem;
  padding: 3px;
  gap: 0;
  width: fit-content;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.quantity-field-centered .counter:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.3);
}

.quantity-field-centered .ctr-btn {
  height: 2rem !important;
  padding: 0.3rem 0.5rem !important;
  font-size: 0.85rem !important;
  width: 32px !important;
  min-width: 32px !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  font-weight: 700 !important;
  color: rgba(15, 23, 42, 0.8) !important;
  transition: all 0.15s ease !important;
  cursor: pointer;
}

.quantity-field-centered .ctr-btn.wide {
  width: 32px !important;
  min-width: 32px !important;
  font-size: 0.8rem !important;
}

.quantity-field-centered .ctr-btn:hover {
  background: rgba(255, 255, 255, 0.4) !important;
  color: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: none !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

/* Primer botón (extremo izquierdo) */
.quantity-field-centered .ctr-btn:first-child:hover {
  border-radius: 1rem 0.4rem 0.4rem 1rem !important;
  margin-left: -3px !important;
  padding-left: 6px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

/* Último botón (extremo derecho) */
.quantity-field-centered .ctr-btn:last-child:hover {
  border-radius: 0.4rem 1rem 1rem 0.4rem !important;
  margin-right: -3px !important;
  padding-right: 6px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.quantity-field-centered .ctr-btn:active {
  transform: scale(0.96) !important;
  background: rgba(255, 255, 255, 0.5) !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
}

/* Primer botón (extremo izquierdo) - active */
.quantity-field-centered .ctr-btn:first-child:active {
  border-radius: 1rem 0.2rem 0.2rem 1rem !important;
  margin-left: -6px !important;
  width: 38px !important;
}

/* Último botón (extremo derecho) - active */
.quantity-field-centered .ctr-btn:last-child:active {
  border-radius: 0.2rem 1rem 1rem 0.2rem !important;
  margin-right: -6px !important;
  width: 38px !important;
}

.quantity-field-centered .ctr-btn + .ctr-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.quantity-field-centered .ctr-input + .ctr-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.quantity-field-centered .ctr-input {
  height: 2rem !important;
  padding: 0.3rem 0.4rem !important;
  width: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
  color: rgba(15, 23, 42, 0.9) !important;
  transition: all 0.15s ease !important;
}

.quantity-field-centered .ctr-input:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  color: rgba(15, 23, 42, 1) !important;
  outline: none !important;
  border-radius: 0.2rem !important;
}

.quantity-field-centered .ctr-input:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.section-grid.combined .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  width: 100%;
}

.section-grid.combined .field label {
  width: 100%;
  text-align: left;
}

.section-grid.combined .field .control {
  width: 100% !important;
  max-width: 100%;
}

.section-grid.combined .quantity-field {
  align-items: center;
}

.section-grid.combined .quantity-field label {
  text-align: center;
}

.section-grid.combined .quantity-field .control {
  width: auto !important;
}

.section-grid.combined .quantity-field .counter {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 0;
  padding: 4px;
  border-radius: 1.1rem;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
}



.section-grid.combined .quantity-field .ctr-btn {
  width: 40px;
  height: 2rem;
  border-radius: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  font-weight: 800;
  font-size: 0.92rem;
  color: rgba(15, 23, 42, 0.9);
  transition: background 0.15s ease, color 0.15s ease;
}

.section-grid.combined .quantity-field .counter > * {
  border-radius: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.section-grid.combined .quantity-field .counter > * + * {
  border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.section-grid.combined .quantity-field .ctr-btn.wide {
  width: 45px;
  min-width: 45px;
}

.section-grid.combined .quantity-field .ctr-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.4);
}

.section-grid.combined .quantity-field .ctr-btn:active {
  background: rgba(255, 255, 255, 0.22);
}

.section-grid.combined .quantity-field .ctr-input {
  height: 2.2rem;
  padding: 0.4rem 0.5rem;
  border-radius: 1.1rem;
  font-size: 0.9rem;
  width: 70px !important;
  min-width: 70px;
  max-width: 70px;
  box-sizing: border-box;
  text-align: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  font-weight: 800;
  color: rgba(15, 23, 42, 0.9);
}

/* Ajustar el ctr-input del quantity-field-centered a tamaño normal */
.quantity-field-centered .ctr-input {
  height: 2.2rem !important;
  padding: 0.4rem 0.6rem !important;
  width: 70px !important;
  min-width: 70px !important;
  max-width: 70px !important;
  font-size: 0.9rem !important;
}

.section-grid.combined .quantity-field .ctr-input:focus {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-color: rgba(46, 221, 90, 0.5);
  outline: none;
}

.section-grid.combined .field:nth-child(-n+4) {
  grid-column: span 6;
}

.section-grid.combined .divider {
  grid-column: span 12;
  height: 1px;
  background: rgba(255, 255, 255, 0.22);
  margin: 4px 0 10px 0;
}

.section-grid.combined .field:nth-last-child(-n+3) {
  grid-column: span 4;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.empty-hint {
  margin: 0;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px dashed rgba(46, 221, 90, 0.38);
  background: rgba(255, 255, 255, 0.22);
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.68);
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(15, 23, 42, 0.62);
}

.control {
  height: 2.7rem;
  padding: 0.55rem 0.9rem;
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
  font-size: 0.95rem;
  width: 100%;
  min-width: 220px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(15, 23, 42, 0.92);
  font-weight: 600;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  overflow: hidden;
}

.control::placeholder {
  color: #6b7280;
  opacity: 1;
  font-weight: 500;
}

.control:focus {
  outline: none;
  border-color: rgba(46, 221, 90, 0.65);
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.15);
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
}



/* Asegurar inputs text redondeados */
input[type="text"].control,
input.control,
.control input,
input[type="text"],
.section-card input[type="text"],
.form-grid input[type="text"] {
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
  overflow: hidden !important;
}

.counter {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ctr-btn {
  height: 2.2rem;
  padding: 0.4rem 0.6rem;
  border-radius: 1.1rem;
  font-size: 0.9rem;
  width: 40px;
  min-width: 40px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(15, 23, 42, 0.9);
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.ctr-btn.wide {
  width: 50px;
  min-width: 50px;
}

.ctr-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.4);
}

.ctr-btn:active {
  transform: translateY(1px);
}

.ctr-input {
  height: 2.2rem;
  padding: 0.4rem 0.6rem;
  border-radius: 1.1rem;
  font-size: 0.9rem;
  width: 70px;
  min-width: 70px;
  box-sizing: border-box;
  text-align: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
  transition: border-color 0.16s ease, background 0.16s ease;
}

.ctr-input:focus {
  outline: none;
  border-color: rgba(46, 221, 90, 0.6);
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(12px);
}

.item-row {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 18px 40px rgba(6, 10, 18, 0.22);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 0.96rem;
  color: rgba(15, 23, 42, 0.9);
}

.badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2edd5a, #299deb);
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
}

.item-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px 80px;
  gap: 16px;
  align-items: center;
}

.form-footer {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.footer-meta {
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.86rem;
  font-weight: 600;
}

.draft-hint {
  color: inherit;
  font-size: inherit;
}

.btn.primary {
  border-radius: 50px !important;
  -webkit-border-radius: 50px !important;
  -moz-border-radius: 50px !important;
  padding: 14px 32px;
  background: linear-gradient(145deg, #10d63a, #0bb828, #00701a);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 
    0 8px 16px rgba(11, 184, 40, 0.3),
    0 4px 8px rgba(11, 184, 40, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.16s ease;
  min-height: 48px;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn.primary:hover {
  transform: translateY(-2px);
  background: linear-gradient(145deg, #15e844, #10d63a, #0bb828);
  box-shadow: 
    0 12px 24px rgba(11, 184, 40, 0.4),
    0 6px 12px rgba(11, 184, 40, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.4),
    inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.btn.primary:active {
  transform: translateY(0);
  background: linear-gradient(145deg, #0bb828, #00701a, #004d12);
  box-shadow: 
    0 4px 8px rgba(11, 184, 40, 0.3),
    0 2px 4px rgba(11, 184, 40, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 12px 28px rgba(11, 172, 65, 0.2);
}

.btn.secondary {
  border-radius: 50px !important;
  -webkit-border-radius: 50px !important;
  -moz-border-radius: 50px !important;
  padding: 14px 32px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa, #f1f3f4);
  color: #0bb828;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid #0bb828;
  box-shadow: 
    0 6px 14px rgba(11, 184, 40, 0.2),
    0 3px 7px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.16s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
}

.btn.secondary:hover {
  background: linear-gradient(145deg, #f0fdf4, #e6ffed, #dcfce7);
  transform: translateY(-2px);
  box-shadow: 
    0 10px 20px rgba(11, 184, 40, 0.25),
    0 5px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.9),
    inset 0 -1px 3px rgba(0, 0, 0, 0.05);
  border-color: #0bb828;
  color: #059212;
}

.btn.secondary:active {
  transform: translateY(0);
  background: linear-gradient(145deg, #dcfce7, #bbf7d0, #a7f3d0);
  box-shadow: 
    0 2px 6px rgba(11, 184, 40, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -1px 2px rgba(255, 255, 255, 0.5);
  border-color: #059212;
  color: #047857;
}

.btn.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #f9f9f9;
  color: #9ca3af;
  border-color: #d1d5db;
}



.btn.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #f9f9f9;
  color: #9ca3af;
  border-color: #d1d5db;
}

.form-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  padding: 24px;
  width: 100%;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

/* Scroll to top button - Reescrito simple */
.scroll-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, #0bb828, #00701a);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 
    0 8px 16px rgba(11, 184, 40, 0.3),
    0 4px 8px rgba(11, 184, 40, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 18px;
  transition: all 0.3s ease;
  animation: gentleFloat 3s ease-in-out infinite;
  overflow: hidden;
}

.scroll-to-top-btn:hover {
  width: 180px;
  border-radius: 28px;
  transform: scale(1.05);
  animation-play-state: paused;
}

.scroll-to-top-btn:hover .scroll-text {
  opacity: 1;
  transform: translateX(0);
}

.scroll-to-top-btn.animating-out {
  width: 56px !important;
  border-radius: 50% !important;
  pointer-events: none;
}

.scroll-to-top-btn.animating-out .scroll-text {
  opacity: 0 !important;
}

.scroll-icon {
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scroll-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scroll-to-top-btn:hover {
  width: 180px;
  transform: translateY(-3px) scale(1.05);
  background: linear-gradient(145deg, #0bb828, #00701a);
  box-shadow: 
    0 12px 24px rgba(11, 184, 40, 0.4),
    0 6px 12px rgba(11, 184, 40, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.4);
  animation-play-state: paused;
}

.scroll-to-top-btn:hover .scroll-text {
  opacity: 1;
  max-width: 150px;
}

.scroll-to-top-btn:active {
  transform: translateY(-2px) scale(0.98);
  background: linear-gradient(145deg, #0bb828, #006617);
  box-shadow: 
    0 8px 16px rgba(11, 184, 40, 0.35),
    0 4px 8px rgba(11, 184, 40, 0.25),
    inset 0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
  animation-play-state: paused;
}

/* Transiciones Vue - Solo una animación por vez */
.scroll-btn-enter-active {
  animation: fluidElegantRise 0.4s ease-out;
}

.scroll-btn-leave-active {
  animation: slideDownExit 0.4s ease-out forwards;
  width: 56px !important;
  border-radius: 50% !important;
}

.scroll-btn-leave-active .scroll-text {
  opacity: 0 !important;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
  opacity: 0;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
  opacity: 0;
}



@keyframes fluidElegantRise {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.6);
    border-radius: 60% 40% 55% 45% / 40% 60% 45% 55%;
    filter: blur(4px);
  }
  30% {
    opacity: 0.4;
    transform: translateY(18px) scale(0.8);
    border-radius: 55% 45% 52% 48% / 45% 55% 48% 52%;
    filter: blur(2.5px);
  }
  60% {
    opacity: 0.8;
    transform: translateY(5px) scale(1.02);
    border-radius: 52% 48% 51% 49% / 48% 52% 49% 51%;
    filter: blur(1px);
  }
  80% {
    opacity: 0.95;
    transform: translateY(-2px) scale(0.98);
    border-radius: 51% 49% 50.2% 49.8% / 49% 51% 49.8% 50.2%;
    filter: blur(0.5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    border-radius: 50% 50% 50% 50%;
    filter: blur(0px);
  }
}

@keyframes slideDownExit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  25% {
    opacity: 0.8;
    transform: translateY(10px) scale(0.9);
  }
  50% {
    opacity: 0.6;
    transform: translateY(20px) scale(0.8);
  }
  75% {
    opacity: 0.3;
    transform: translateY(30px) scale(0.7);
  }
  100% {
    opacity: 0;
    transform: translateY(50px) scale(0.5);
  }
}

/* Animación de flotación suave para el botón */
@keyframes gentleFloat {
  0% {
    transform: translateY(0px);
  }
  33% {
    transform: translateY(-4px);
  }
  66% {
    transform: translateY(2px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 1040px) {
  :deep(.auth-card.glass) {
    padding: 30px;
  }
}

@media (max-width: 860px) {
  .form-grid {
    gap: 22px;
  }

  .section-grid.combined .field:nth-child(-n+4) {
    grid-column: span 12;
  }

  .section-grid.combined .field:nth-last-child(-n+3) {
    grid-column: span 12;
  }

  .save-btn {
    justify-content: center;
    width: 100%;
  }
}

/* AJUSTAR TAMAÑOS DE INPUTS DE CANTIDAD */
.control.w-12ch,
input[type="number"].control,
.field:has(label:contains("Cantidad")) .control,
input[v-model*="cantidad"],
input[placeholder="0"] {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  text-align: center;
}

.control.w-20ch {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
}

.fecha-field .control {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
}

/* FORZAR BORDES REDONDEADOS EN TODOS LOS INPUTS TEXT */
.op-card input,
.op-card .control,
.section-card input,
.section-card .control,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
textarea,
select {
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
  -ms-border-radius: 25px !important;
  overflow: hidden !important;
}

/* Específico para este formulario */
.op-insumos-consumibles .control,
.op-insumos-consumibles input[type="text"],
.form-grid .control,
.form-grid input {
  border-radius: 30px !important;
  -webkit-border-radius: 30px !important;
  -moz-border-radius: 30px !important;
}

/* Inputs de cantidad más compactos en renglones */
.item-grid .field:last-child .control,
.item-grid input[type="number"],
.item-row input[type="number"] {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  text-align: center !important;
  padding: 0.55rem 0.5rem !important;
}

/* Media Queries para Responsive Design */

/* Tablets grandes y pantallas medianas (hasta 1024px) */
@media (max-width: 1024px) {
  :deep(.auth-card.glass) {
    padding: 28px 32px;
  }

  .form-grid {
    gap: 22px;
  }

  .section-card {
    padding: 22px;
  }
}

/* Tablets (hasta 768px) */
@media (max-width: 768px) {
  :deep(.auth-card.glass) {
    padding: 24px;
  }

  .form-grid {
    gap: 20px;
  }

  .section-card {
    padding: 20px;
  }

  /* Main form grid responsive */
  .section-grid.main-form {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .descripcion-field,
  .fecha-field {
    grid-column: 1;
  }

  .fecha-field .control {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Solicitante form responsive */
  .section-grid.solicitante-form {
    grid-template-columns: 1fr;
  }

  .section-grid.solicitante-form .field .control {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Item grid responsive */
  .item-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .item-grid .field .control {
    width: 100% !important;
    max-width: 100% !important;
  }

  .item-grid .field:last-child .control {
    text-align: left !important;
  }

  /* Botones de acción */
  .form-actions {
    flex-direction: column;
    padding: 20px;
  }

  .form-actions .btn {
    width: 100%;
  }

  .section-grid.combined .field:nth-child(-n+4) {
    grid-column: span 12;
  }

  .section-grid.combined .field:nth-last-child(-n+3) {
    grid-column: span 12;
  }
}

/* Móviles grandes (hasta 640px) */
@media (max-width: 640px) {
  :deep(.auth-card.glass) {
    padding: 20px;
    border-radius: 20px;
  }

  .form-grid {
    gap: 18px;
  }

  .section-card {
    padding: 18px;
    border-radius: 18px;
  }

  .section-head h4 {
    font-size: 1rem;
  }

  .section-head .hint {
    font-size: 0.78rem;
  }

  .field label {
    font-size: 0.7rem;
  }

  .control {
    height: 2.5rem;
    padding: 0.5rem 0.8rem;
    font-size: 0.9rem;
    min-width: 0;
  }

  /* Contador más compacto */
  .counter {
    gap: 0.3rem;
  }

  .ctr-btn {
    height: 2rem;
    width: 36px;
    min-width: 36px;
    font-size: 0.85rem;
    padding: 0.3rem 0.4rem;
  }

  .ctr-btn.wide {
    width: 42px;
    min-width: 42px;
  }

  .ctr-input {
    height: 2rem;
    width: 60px;
    font-size: 0.85rem;
  }

  /* Ajustar contador centrado */
  .quantity-field-centered .ctr-btn {
    height: 1.9rem !important;
    width: 30px !important;
    min-width: 30px !important;
    font-size: 0.8rem !important;
  }

  .quantity-field-centered .ctr-btn.wide {
    width: 30px !important;
    min-width: 30px !important;
  }

  .quantity-field-centered .ctr-input {
    height: 1.9rem !important;
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;
    font-size: 0.85rem !important;
  }

  .quantity-field-centered .counter {
    padding: 2px;
  }

  /* Scroll to top más pequeño */
  .scroll-to-top-btn {
    width: 48px;
    height: 48px;
    bottom: 1.5rem;
    right: 1.5rem;
  }

  .scroll-to-top-btn:hover {
    width: 160px;
  }

  .scroll-icon {
    font-size: 18px;
  }

  .scroll-text {
    font-size: 13px;
  }
}

@media (max-width: 520px) {
  .section-card,
  .form-footer {
    padding: 20px 16px;
  }

  .section-grid {
    gap: 14px;
  }

  .item-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.auth-card.glass) {
    padding: 18px;
  }

  .btn.primary,
  .btn.secondary {
    padding: 12px 24px;
    font-size: 0.95rem;
    min-height: 44px;
  }

  .form-actions {
    padding: 18px;
    margin-top: 24px;
  }

  /* Item row más compacto */
  .item-row {
    padding: 16px 18px;
  }

  .badge {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }

  .item-head {
    font-size: 0.9rem;
  }
}

/* Móviles pequeños (hasta 400px) */
@media (max-width: 400px) {
  :deep(.auth-card.glass) {
    padding: 16px;
    border-radius: 16px;
  }

  .section-card {
    padding: 16px;
    border-radius: 16px;
  }

  .section-head h4 {
    font-size: 0.95rem;
  }

  .control {
    height: 2.4rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.85rem;
  }

  .btn.primary,
  .btn.secondary {
    padding: 10px 20px;
    font-size: 0.9rem;
    min-height: 42px;
  }

  .scroll-to-top-btn {
    width: 44px;
    height: 44px;
    bottom: 1rem;
    right: 1rem;
  }

  .scroll-to-top-btn:hover {
    width: 140px;
  }

  .quantity-field-centered .ctr-btn {
    height: 1.8rem !important;
    width: 28px !important;
    min-width: 28px !important;
    font-size: 0.75rem !important;
  }

  .quantity-field-centered .ctr-btn.wide {
    width: 28px !important;
    min-width: 28px !important;
  }

  .quantity-field-centered .ctr-input {
    height: 1.8rem !important;
    width: 48px !important;
    min-width: 48px !important;
    max-width: 48px !important;
    font-size: 0.8rem !important;
  }

  .form-actions {
    gap: 12px;
    padding: 16px;
    margin-top: 20px;
  }

  .item-row {
    padding: 14px 16px;
  }
}

@supports not (backdrop-filter: blur(10px)) {
  :deep(.auth-card.glass) {
    backdrop-filter: none;
    background: rgba(15, 23, 42, 0.9);
  }

  .section-card,
  .item-row,
  .form-footer {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn.primary,
  .ctr-btn {
    transition: none;
  }
}
</style>
