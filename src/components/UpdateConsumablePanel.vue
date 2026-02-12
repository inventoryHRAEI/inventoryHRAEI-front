<template>
  <Teleport to="body">
    <Transition name="cons-update-fade">
      <div v-if="visible" class="cons-update-overlay" @click.self="close">
        <div class="cons-update-panel" role="dialog" aria-modal="true">
          <header class="panel-header">
            <div class="panel-title-wrap">
              <VueIcon name="ic:baseline-inventory-2" size="20" class="panel-icon" />
              <div>
                <h3 class="panel-title">Actualizar Insumo / Refacción</h3>
                <div class="panel-sub">{{ propsTitle }}</div>
              </div>
            </div>
            <div class="header-actions">
              <div v-if="saveSuccess" class="save-indicator">Guardado</div>
              <button class="close-btn" @click="close" aria-label="Cerrar">✕</button>
            </div>
          </header>

          <div class="panel-body">
            <div v-if="error" class="form-error">{{ error }}</div>

            <label class="field">
              <span>Descripción *</span>
              <input v-model="form.descripcion" type="text" />
            </label>

            <div class="row">
              <label class="field">
                <span>Marca</span>
                <input v-model="form.marca" type="text" />
              </label>
              <label class="field">
                <span>Modelo</span>
                <input v-model="form.modelo" type="text" />
              </label>
            </div>

            <div class="row">
              <label class="field">
                <span>Referencia</span>
                <input v-model="form.referencia" type="text" />
              </label>
              <label class="field">
                <span>Unidad</span>
                <input v-model="form.unidadMedida" type="text" />
              </label>
            </div>

            <div class="row">
              <label class="field" tabindex="0">
                <span class="field-label">Existencia SUBCEYE
                  <button type="button" class="hint-btn" aria-haspopup="true" aria-label="Ayuda existencias">?</button>
                </span>
                <div class="hint-popover" role="tooltip">
                  Para modificar las existencias utiliza las funciones específicas: <strong>Mover stock</strong>, <strong>Registrar entrada</strong> o <strong>Dar de baja</strong>. Este panel solo actualiza metadatos.
                </div>
                <input :value="form.subceye" type="number" disabled aria-disabled="true" />
              </label>

              <label class="field" tabindex="0">
                <span class="field-label">Existencia Oficina
                  <button type="button" class="hint-btn" aria-haspopup="true" aria-label="Ayuda existencias">?</button>
                </span>
                <div class="hint-popover" role="tooltip">
                  Para modificar las existencias utiliza las funciones específicas: <strong>Mover stock</strong>, <strong>Registrar entrada</strong> o <strong>Dar de baja</strong>. Este panel solo actualiza metadatos.
                </div>
                <input :value="form.oficina" type="number" disabled aria-disabled="true" />
              </label>
            </div>

            <div class="feedback" v-if="success">Guardado correctamente ✔</div>
          </div>

          <footer class="panel-actions">
            <button class="btn" @click="close">Cancelar</button>
            <button :class="['btn btn-primary action-save', { saved: saveSuccess }]" :disabled="saving || !canSave" @click="save">
              <span v-if="saving">Guardando…</span>
              <span v-else>{{ saveSuccess ? 'Guardado' : 'Guardar' }}</span>
              <VueIcon v-if="saveSuccess" name="ic:baseline-check" size="16" class="check-icon" />
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import { getStoredToken } from '@/utils/auth.js';

const props = defineProps({
  modelValue: Boolean,
  item: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'item-updated']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

const form = ref({
  descripcion: '', marca: '', modelo: '', referencia: '', unidadMedida: '', subceye: 0, oficina: 0
});

const saving = ref(false);
const error = ref('');
const success = ref(false);
const saveSuccess = ref(false);

const propsTitle = computed(() => {
  const clave = props.item?.['Clave  HRAEI'] || ''; return clave ? `${clave}` : '';
});

watch(() => props.item, (it) => {
  error.value = '';
  success.value = false;
  if (it) {
    form.value.descripcion = it['Descripción del bien'] || '';
    form.value.marca = it['MARCA'] || '';
    form.value.modelo = it['MODELO'] || '';
    form.value.referencia = it['REFERENCIA'] || '';
    form.value.unidadMedida = it['Unidad de medida (presentación)'] || '';
    form.value.subceye = parseInt(it['Existencia SUBCEYE IB'] || 0);
    form.value.oficina = parseInt(it[' Almacén IB (OFICINA)'] || 0);
  }
}, { immediate: true });

const canSave = computed(() => form.value.descripcion && form.value.descripcion.trim().length > 0);

function close() {
  visible.value = false;
}

async function save() {
  error.value = '';
  success.value = false;
  if (!canSave.value) { error.value = 'La descripción es obligatoria'; return; }
  if (!props.item) { error.value = 'Item no seleccionado'; return; }

  saving.value = true;
  try {
    const clave = props.item['Clave  HRAEI'];
    // Do NOT send subceye/oficina from this panel; stock changes must be performed
    // via the designated flows (entrada/movimiento/baja).
    const body = {
      description: form.value.descripcion,
      marca: form.value.marca,
      modelo: form.value.modelo,
      referencia: form.value.referencia,
      unidadMedida: form.value.unidadMedida
    };
    const token = getStoredToken();
    const res = await fetch(`/api/ops/inventory/accessory/${encodeURIComponent(clave)}`, {
      method: 'PATCH',
      headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': `Bearer ${token}` } : {}),
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.msg || data.error || 'Error actualizando');
    }
    success.value = true;
    // inline success feedback
    saveSuccess.value = true;
    emit('item-updated', data.data || data);
    // keep success visible then close
    setTimeout(() => { saveSuccess.value = false; visible.value = false; }, 800);
  } catch (e) {
    console.error('Error saving consumable update:', e);
    error.value = e.message || 'Error guardando cambios';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.cons-update-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.cons-update-panel { width: 720px; max-width: 94vw; background: linear-gradient(135deg,#0f172a,#111827); border-radius: 12px; padding: 18px; color: #fff; box-shadow: 0 24px 60px rgba(0,0,0,.6); border: 1px solid rgba(59,130,246,.06); }
.panel-header { display:flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,.03); }
.panel-title-wrap { display:flex; gap:12px; align-items:center; }
.panel-icon { color: #60a5fa }
.panel-title { margin:0; font-size:1.1rem; font-weight:800 }
.panel-sub { font-size:0.85rem; color: rgba(226,232,240,.7) }
.header-actions { display:flex; align-items:center; gap:10px }
.close-btn { background: rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.04); color: #fff; width: 36px; height: 36px; border-radius:8px; cursor:pointer; }
.panel-body { margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
.row { display:flex; gap:12px; }
.field { display:flex; flex-direction: column; gap:6px; flex:1; }
.field input, .field textarea, .field select { padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.04); color: #fff; font-size: 0.95rem }
.field input[disabled] { opacity: .6; cursor: not-allowed; }
.hint-btn { margin-left: 8px; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); color: #fff; width: 28px; height: 28px; border-radius: 8px; font-weight: 800; cursor: pointer; display:inline-flex; align-items:center; justify-content:center; }
.hint-btn:hover, .hint-btn:focus { background: rgba(255,255,255,.05); outline: none; }

/* Popover */
.field { position: relative; }
.hint-popover {
  position: absolute; z-index: 60;
  right: 0; top: -8px;
  width: 320px; max-width: 88vw;
  background: rgba(12,18,35,.98);
  color: #e6eef8;
  border: 1px solid rgba(255,255,255,.06);
  padding: 10px 12px; border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,.5);
  opacity: 0; transform: translateY(-6px); pointer-events: none;
  transition: opacity .12s ease, transform .12s ease;
  font-size: 0.95rem;
}
.field:hover .hint-popover, .field:focus-within .hint-popover, .hint-btn:focus + .hint-popover {
  opacity: 1; transform: translateY(0); pointer-events: auto;
}
.hint-popover::before {
  content: '';
  position: absolute; right: 18px; top: 100%; transform: translateY(-6px);
  border: 7px solid transparent; border-top-color: rgba(12,18,35,.98);
}
.panel-actions { margin-top: 14px; display:flex; gap:10px; justify-content: flex-end; }
.btn { padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,.03); color: #fff; border: 1px solid rgba(255,255,255,.06); cursor: pointer }
.btn-primary { background: linear-gradient(135deg,#2563eb,#60a5fa); color: #fff; border: none; }
.form-error { color: #f87171; font-weight:700 }
.feedback { color: #10b981 }
</style>