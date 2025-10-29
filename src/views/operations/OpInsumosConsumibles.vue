<template>
  <FormShell>
    <template #title>Insumos y Consumibles</template>

    <template #body>
      <div class="op-card insumos">
        <form @submit.prevent="onSubmit" class="form-grid" novalidate>
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Datos del artículo</h4>
              <small class="hint">Clave, descripción, cantidad y fecha de recibo</small>
            </div>
            <div class="section-grid combined">
              <div class="field">
                <label>Clave HRAEI del Artículo</label>
                <input
                  class="control w-20ch"
                  v-model.trim="form.articleClaveHRAEI"
                  placeholder="Ej. HRAEI-MD1700"
                />
              </div>
              <div class="field">
                <label>Descripción</label>
                <input
                  class="control w-38ch"
                  v-model.trim="form.descripcion"
                  placeholder="Ej. Se realiza entrega de consumibles"
                />
              </div>
              <div class="field quantity-field">
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
              <div class="field">
                <label>Fecha de recibo en biomédica</label>
                <input class="control w-18ch" v-model="form.fechaRecibo" type="date" />
              </div>
              <div class="divider"></div>
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

          <div class="form-footer">
            <div class="footer-meta">
              <span v-if="savedAt" class="draft-hint">Borrador guardado a las {{ savedAt }}</span>
              <span v-else class="draft-hint">Los cambios se guardan automáticamente</span>
            </div>
            <button class="btn primary save-btn" type="submit" :disabled="loading || !isValid">
              {{ loading ? 'Guardando...' : 'Guardar orden' }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </FormShell>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import FormShell from '@/components/FormShell.vue'
import notifier from '@/utils/notifier'

const LOCAL_KEY = 'op-insumos-consumibles'

const form = reactive({
  articleClaveHRAEI: '',
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
  form.articleClaveHRAEI = ''
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
    articleClaveHRAEI: form.articleClaveHRAEI,
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

onMounted(() => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      form.articleClaveHRAEI = data.articleClaveHRAEI || ''
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
})

onBeforeUnmount(() => {
  clearTimeout(autosaveTimer)
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
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
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

.section-grid.combined .quantity-field .ctr-btn {
  width: 40px;
  height: 34px;
  font-weight: 800;
  font-size: 0.92rem;
  transition: background 0.15s ease, color 0.15s ease;
}

.section-grid.combined .quantity-field .ctr-btn.wide {
  width: 54px;
}

.section-grid.combined .quantity-field .ctr-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.section-grid.combined .quantity-field .ctr-btn:active {
  background: rgba(255, 255, 255, 0.22);
}

.section-grid.combined .quantity-field .ctr-input {
  width: 66px !important;
  height: 34px;
  padding: 6px 4px;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
}

.section-grid.combined .quantity-field .ctr-input:focus {
  background: #fff;
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
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 11px 16px;
  font-size: 0.96rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.9);
  box-sizing: border-box;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.control::placeholder {
  color: rgba(15, 23, 42, 0.45);
}

.control:focus {
  outline: none;
  border-color: rgba(46, 221, 90, 0.6);
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.2);
  background: rgba(255, 255, 255, 0.98);
}

.control.w-12ch { width: min(100%, 12ch); }
.control.w-14ch { width: min(100%, 14ch); }
.control.w-18ch { width: min(100%, 18ch); }
.control.w-20ch { width: min(100%, 20ch); }
.control.w-28ch { width: min(100%, 28ch); }
.control.w-32ch { width: min(100%, 32ch); }
.control.w-38ch { width: min(100%, 38ch); }

.counter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.ctr-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.76);
  color: rgba(15, 23, 42, 0.9);
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.ctr-btn.wide {
  width: 56px;
}

.ctr-btn:hover {
  background: rgba(255, 255, 255, 0.92);
}

.ctr-btn:active {
  transform: translateY(1px);
}

.ctr-input {
  width: 84px;
  text-align: center;
  padding: 10px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 1rem;
  color: rgba(15, 23, 42, 0.9);
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 200px) minmax(0, 120px);
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
  border-radius: 999px;
  padding: 12px 30px;
  background: linear-gradient(180deg, var(--btn-green, #0bb828), #00701a);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 20px 44px rgba(11, 172, 65, 0.28);
  transition: transform 0.16s ease, box-shadow 0.18s ease;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 52px rgba(11, 172, 65, 0.32);
}

.btn.primary:active {
  transform: translateY(0);
  box-shadow: 0 18px 36px rgba(11, 172, 65, 0.28);
}

.btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 12px 28px rgba(11, 172, 65, 0.2);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.save-btn::before {
  content: '✓';
  font-weight: 800;
  font-size: 1rem;
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
