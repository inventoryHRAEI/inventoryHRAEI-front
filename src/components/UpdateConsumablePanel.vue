<template>
  <Teleport to="body">
    <Transition name="cons-update-fade">
      <div v-if="visible" class="cons-update-overlay" @click.self="close">
        <div class="cons-update-panel" role="dialog" aria-modal="true" aria-label="Actualizar insumo o bien">
          <header class="panel-header">
            <div class="panel-title-wrap">
              <div class="panel-icon-wrap">
                <IIcon name="ic:baseline-inventory-2" size="20" class="panel-icon" />
              </div>
              <div>
                <h3 class="panel-title">Actualizar Insumo / Refacción / Bien</h3>
                <div class="panel-sub">{{ propsTitle }}</div>
              </div>
            </div>
            <div class="header-actions">
              <div v-if="saveSuccess" class="save-indicator">Guardado</div>
              <button class="close-btn" @click="close" aria-label="Cerrar">
                <IIcon name="ic:baseline-close" size="18" />
              </button>
            </div>
          </header>

          <div class="panel-kpis">
            <div class="kpi-chip">
              <div class="kpi-head">
                <IIcon name="ic:baseline-vpn-key" size="14" class="kpi-icon" />
                <span>Clave HRAEI</span>
              </div>
              <strong>{{ form.clave || 'S/D' }}</strong>
            </div>
            <div class="kpi-chip">
              <div class="kpi-head">
                <IIcon name="ic:baseline-layers" size="14" class="kpi-icon" />
                <span>Lote</span>
              </div>
              <strong>{{ form.lote || 'S/D' }}</strong>
            </div>
            <div class="kpi-chip">
              <div class="kpi-head">
                <IIcon name="ic:baseline-qr-code-2" size="14" class="kpi-icon" />
                <span>No. inventario</span>
              </div>
              <strong>{{ form.noInventario || form.n || 'S/D' }}</strong>
            </div>
            <div class="kpi-chip highlight">
              <div class="kpi-head">
                <IIcon name="ic:baseline-inventory" size="14" class="kpi-icon" />
                <span>Total existencias</span>
              </div>
              <strong>{{ form.total }}</strong>
            </div>
          </div>

          <div class="panel-body">
            <section class="panel-main">
              <div v-if="error" class="form-error">{{ error }}</div>

              <div class="section-label">
                <IIcon name="ic:baseline-badge" size="15" class="section-label-icon" />
                <span>Datos del bien</span>
              </div>

              <div class="form-grid">
                <label class="field field-full">
                  <span class="field-title"><IIcon name="ic:baseline-description" size="15" />Descripción *</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-description" size="17" /></span>
                    <input v-model.trim="form.descripcion" type="text" placeholder="Describe claramente el insumo o refacción" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-key" size="15" />Clave HRAEI</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-key" size="17" /></span>
                    <input v-model.trim="form.clave" type="text" placeholder="Ej. HRAEI-CE0486" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-confirmation-number" size="15" />No. inventario</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-confirmation-number" size="17" /></span>
                    <input v-model.trim="form.noInventario" type="text" placeholder="Ej. INV-00234" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-local-offer" size="15" />Marca</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-local-offer" size="17" /></span>
                    <input v-model.trim="form.marca" type="text" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-layers" size="15" />Modelo</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-layers" size="17" /></span>
                    <input v-model.trim="form.modelo" type="text" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-fingerprint" size="15" />Referencia</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-fingerprint" size="17" /></span>
                    <input v-model.trim="form.referencia" type="text" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-view-module" size="15" />Lote</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-view-module" size="17" /></span>
                    <input v-model.trim="form.lote" type="text" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-straighten" size="15" />Unidad de medida</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-straighten" size="17" /></span>
                    <input v-model.trim="form.unidadMedida" type="text" placeholder="Pieza, caja, paquete..." />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-pin-drop" size="15" />Ubicación</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-pin-drop" size="17" /></span>
                    <input v-model.trim="form.ubicacion" type="text" placeholder="Ej. CEYE / Anaquel B" />
                  </div>
                </label>

                <label class="field">
                  <span class="field-title"><IIcon name="ic:baseline-alt-route" size="15" />Origen del bien</span>
                  <div class="field-control">
                    <span class="field-leading-icon"><IIcon name="ic:baseline-alt-route" size="17" /></span>
                    <input v-model.trim="form.origen" type="text" placeholder="Compra, donación, comodato..." />
                  </div>
                </label>

                <label class="field field-full caducidad-field">
                  <span class="field-title"><IIcon name="ic:baseline-event" size="15" />Control de caducidad</span>
                  <div class="caducidad-row">
                    <div class="field-control date-control" :class="{ disabled: form.sinCaducidad }">
                      <span class="field-leading-icon"><IIcon name="ic:baseline-event" size="17" /></span>
                      <input v-model="form.caducidad" :disabled="form.sinCaducidad" type="date" class="date-input" />
                    </div>

                    <label class="cad-switch" :class="{ active: form.sinCaducidad }" aria-label="Alternar sin caducidad">
                      <input v-model="form.sinCaducidad" type="checkbox" />
                      <span class="cad-switch-track"><span class="cad-switch-thumb"></span></span>
                      <span class="cad-switch-label">
                        <IIcon :name="form.sinCaducidad ? 'ic:baseline-check-circle' : 'ic:baseline-event'" size="15" />
                        {{ form.sinCaducidad ? 'Sin caducidad' : 'Con caducidad' }}
                      </span>
                    </label>
                  </div>
                </label>

                <label class="field field-full">
                  <span class="field-title"><IIcon name="ic:baseline-sticky-note-2" size="15" />Observaciones</span>
                  <div class="field-control">
                    <span class="field-leading-icon textarea-icon"><IIcon name="ic:baseline-sticky-note-2" size="17" /></span>
                    <textarea v-model.trim="form.observaciones" rows="3" placeholder="Notas de trazabilidad, condición o uso"></textarea>
                  </div>
                </label>

                <div v-if="extraFieldEntries.length" class="extras-block field-full">
                  <div class="section-label extras-label">
                    <IIcon name="ic:baseline-tune" size="15" class="section-label-icon" />
                    <span>Campos adicionales del bien</span>
                  </div>

                  <div class="form-grid extras-grid">
                    <label v-for="entry in extraFieldEntries" :key="entry.key" class="field" :class="{ 'field-full': isExtraLongText(entry.key, entry.value) }">
                      <span class="field-title"><IIcon name="ic:baseline-edit" size="15" />{{ toDisplayLabel(entry.key) }}</span>
                      <div class="field-control">
                        <span class="field-leading-icon" :class="{ 'textarea-icon': isExtraLongText(entry.key, entry.value) }"><IIcon name="ic:baseline-edit" size="17" /></span>
                        <textarea
                          v-if="isExtraLongText(entry.key, entry.value)"
                          v-model.trim="form.extraFields[entry.key]"
                          rows="3"
                          :placeholder="`Editar ${toDisplayLabel(entry.key)}`"
                        ></textarea>
                        <input
                          v-else
                          v-model.trim="form.extraFields[entry.key]"
                          type="text"
                          :placeholder="`Editar ${toDisplayLabel(entry.key)}`"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="feedback" v-if="success">Guardado correctamente</div>
            </section>

            <aside class="panel-side">
              <div class="side-card">
                <h4 class="side-title"><IIcon name="ic:baseline-warehouse" size="16" />Existencias actuales</h4>
                <div class="stock-row">
                  <span class="stock-label"><IIcon name="ic:baseline-local-hospital" size="13" />SUBCEYE</span>
                  <strong>{{ form.subceye }}</strong>
                </div>
                <div class="stock-row">
                  <span class="stock-label"><IIcon name="ic:baseline-apartment" size="13" />OFICINA</span>
                  <strong>{{ form.oficina }}</strong>
                </div>
                <div class="stock-row total">
                  <span class="stock-label"><IIcon name="ic:baseline-summarize" size="13" />TOTAL</span>
                  <strong>{{ form.total }}</strong>
                </div>
              </div>

              <div class="side-card side-hint" role="note">
                <IIcon name="ic:baseline-info" size="18" class="hint-icon" />
                <p>
                  Para modificar existencias usa <strong>Mover stock</strong>, <strong>Ingresar bienes</strong> o <strong>Dar de baja</strong>.
                  Este panel actualiza la ficha informativa del artículo.
                </p>
              </div>
            </aside>
          </div>

          <footer class="panel-actions">
            <button class="btn" @click="close">
              <IIcon name="ic:baseline-close" size="16" class="btn-icon" />
              <span>Cancelar</span>
            </button>
            <button :class="['btn btn-primary action-save', { saved: saveSuccess }]" :disabled="saving || !canSave" @click="save">
              <IIcon v-if="!saving && !saveSuccess" name="ic:baseline-save" size="16" class="btn-icon" />
              <span v-if="saving">Guardando…</span>
              <span v-else>{{ saveSuccess ? 'Guardado' : 'Guardar cambios' }}</span>
              <IIcon v-if="saveSuccess" name="ic:baseline-check" size="16" class="check-icon" />
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import IIcon from '@/components/IIcon.vue';
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
  clave: '',
  n: '',
  descripcion: '',
  noInventario: '',
  marca: '',
  modelo: '',
  referencia: '',
  lote: '',
  unidadMedida: '',
  ubicacion: '',
  origen: '',
  observaciones: '',
  subceye: 0,
  oficina: 0,
  total: 0,
  caducidad: '',
  sinCaducidad: false,
  extraFields: {}
});

const saving = ref(false);
const error = ref('');
const success = ref(false);
const saveSuccess = ref(false);

const STOCK_AND_SYSTEM_KEYS = [
  'existencia_subceye',
  'existenciasubceye',
  'existencia_subceye_ib',
  'almacen_ib_oficina',
  'existencia_oficina',
  'total_existencias',
  'totalexcistencias',
  'total_existencia',
  'clave_hraei',
  'clavehraei',
  'n',
  'id',
  'no',
  'descripciondelbien',
  'descripcionarticulo',
  'descripcion',
  'marca',
  'modelo',
  'referencia',
  'lote',
  'unidaddemedidapresentacion',
  'unidaddemedida',
  'ubicacion',
  'ubicacionactual',
  'origendelbien',
  'origen',
  'observaciones',
  'caducidad',
  'nodeinventario',
  'noinventario',
  'sincaducidad',
  'imagenes',
  'image',
  'foto'
];

const normalizeKey = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]/g, '')
  .toLowerCase();

const STOCK_AND_SYSTEM_KEYS_SET = new Set(STOCK_AND_SYSTEM_KEYS.map(k => normalizeKey(k)));

const pickValue = (item, aliases = [], fallback = '') => {
  if (!item || typeof item !== 'object') return fallback;
  const lookup = new Map();
  Object.keys(item).forEach((k) => {
    const nk = normalizeKey(k);
    if (nk && !lookup.has(nk)) lookup.set(nk, k);
  });

  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(item, alias) && item[alias] !== null && item[alias] !== undefined && item[alias] !== '') {
      return item[alias];
    }
    const resolved = lookup.get(normalizeKey(alias));
    if (resolved && item[resolved] !== null && item[resolved] !== undefined && item[resolved] !== '') {
      return item[resolved];
    }
  }
  return fallback;
};

const toSafeInt = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  if (Number.isFinite(parsed)) return parsed;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeDateInput = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const slash = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;

  const dash = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dash) return `${dash[3]}-${dash[2]}-${dash[1]}`;

  return raw;
};

const getClave = (item) => String(pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], '') || '').trim();

const shouldKeepAsExtraField = (rawKey, rawValue) => {
  const nk = normalizeKey(rawKey);
  if (!nk || STOCK_AND_SYSTEM_KEYS_SET.has(nk)) return false;
  if (nk.startsWith('__')) return false;
  if (rawValue === null || rawValue === undefined) return false;
  if (typeof rawValue === 'object') return false;
  return true;
};

const toDisplayLabel = (rawKey) => String(rawKey || '')
  .replace(/_/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isExtraLongText = (rawKey, rawValue) => {
  const key = normalizeKey(rawKey);
  const value = String(rawValue || '');
  if (value.length > 80) return true;
  return key.includes('observ') || key.includes('nota') || key.includes('detalle') || key.includes('coment');
};

const extraFieldEntries = computed(() => {
  const extras = form.value.extraFields || {};
  return Object.keys(extras)
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    .map((key) => ({ key, value: extras[key] }));
});

const propsTitle = computed(() => {
  const clave = form.value.clave || 'Sin clave';
  const lote = form.value.lote ? ` · Lote ${form.value.lote}` : '';
  return `${clave}${lote}`;
});

watch(() => props.item, (it) => {
  error.value = '';
  success.value = false;
  if (it) {
    const subceye = toSafeInt(pickValue(it, ['Existencia SUBCEYE IB', 'Existencia SUBCEYE', 'existencia_subceye'], 0), 0);
    const oficina = toSafeInt(pickValue(it, [' Almacén IB (OFICINA)', 'Almacén IB (OFICINA)', 'existencia_oficina'], 0), 0);
    const totalRaw = pickValue(it, ['TOTAL EXISTENCIAS', 'Total Excistencias', 'total_existencias', 'totalExistencias'], subceye + oficina);
    const total = toSafeInt(totalRaw, subceye + oficina);

    const cad = normalizeDateInput(pickValue(it, ['CADUCIDAD', 'Caducidad', 'caducidad'], ''));

    form.value.clave = getClave(it);
    form.value.n = String(pickValue(it, ['N', 'n'], '') || '').trim();
    form.value.descripcion = String(pickValue(it, ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN ARTÍCULO', 'descripcion'], '') || '').trim();
    form.value.noInventario = String(pickValue(it, ['No DE INVENTARIO', 'No. DE INVENTARIO', 'No de inventario', 'No Inventario', 'no_inventario'], '') || '').trim();
    form.value.marca = String(pickValue(it, ['MARCA', 'Marca', 'marca'], '') || '').trim();
    form.value.modelo = String(pickValue(it, ['MODELO', 'Modelo', 'modelo'], '') || '').trim();
    form.value.referencia = String(pickValue(it, ['REFERENCIA', 'Referencia', 'referencia'], '') || '').trim();
    form.value.lote = String(pickValue(it, ['LOTE', 'Lote', 'lote'], '') || '').trim();
    form.value.unidadMedida = String(pickValue(it, ['Unidad de medida (presentación)', 'Unidad de medida (presentacion)', 'Unidad de medida', 'unidadMedida'], '') || '').trim();
    form.value.ubicacion = String(pickValue(it, ['UBICACIÓN', 'UBICACION', 'Ubicación', 'Ubicacion', 'UBICACIÓN ACTUAL', 'ubicacion', 'UBICACION ESPECIFICA'], '') || '').trim();
    form.value.origen = String(pickValue(it, ['ORIGEN DEL BIEN', 'ORIGEN', 'Origen', 'origen_bien', 'origen'], '') || '').trim();
    form.value.observaciones = String(pickValue(it, ['OBSERVACIONES', 'Observaciones', 'observaciones'], '') || '').trim();
    form.value.subceye = subceye;
    form.value.oficina = oficina;
    form.value.total = total <= 0 ? (subceye + oficina) : total;
    form.value.caducidad = cad;
    form.value.sinCaducidad = !cad;

    const extras = {};
    Object.entries(it).forEach(([key, value]) => {
      if (!shouldKeepAsExtraField(key, value)) return;
      extras[key] = String(value ?? '').trim();
    });
    form.value.extraFields = extras;
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
    const clave = form.value.clave || getClave(props.item);
    if (!clave) {
      throw new Error('No se encontró la clave HRAEI del artículo');
    }

    // Do NOT send subceye/oficina from this panel; stock changes must be performed
    // via the designated flows (entrada/movimiento/baja).
    const body = {
      clave: String(form.value.clave || '').trim(),
      n: String(form.value.n || '').trim(),
      description: String(form.value.descripcion || '').trim(),
      marca: String(form.value.marca || '').trim(),
      modelo: String(form.value.modelo || '').trim(),
      referencia: String(form.value.referencia || '').trim(),
      unidadMedida: String(form.value.unidadMedida || '').trim(),
      lote: String(form.value.lote || '').trim(),
      noInventario: String(form.value.noInventario || '').trim(),
      ubicacion: String(form.value.ubicacion || '').trim(),
      origen: String(form.value.origen || '').trim(),
      observaciones: String(form.value.observaciones || '').trim(),
      caducidad: form.value.sinCaducidad ? null : (form.value.caducidad || null),
      extraFields: Object.fromEntries(
        Object.entries(form.value.extraFields || {})
          .map(([k, v]) => [k, String(v ?? '').trim()])
      )
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
.cons-update-fade-enter-active,
.cons-update-fade-leave-active {
  transition: opacity .24s ease;
}

.cons-update-fade-enter-from,
.cons-update-fade-leave-to {
  opacity: 0;
}

.cons-update-fade-enter-from .cons-update-panel {
  transform: translateY(14px) scale(.988);
}

.cons-update-fade-enter-to .cons-update-panel,
.cons-update-fade-leave-from .cons-update-panel {
  transform: translateY(0) scale(1);
}

.cons-update-panel {
  transition: transform .26s cubic-bezier(.22, 1, .36, 1), box-shadow .26s ease;
}

.cons-update-overlay {
  --topbar-safe-offset: clamp(86px, 11vh, 126px);
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 23, .62);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1200;
  padding: var(--topbar-safe-offset) 18px 18px;
}

.cons-update-panel {
  --accent-cyan: #22d3ee;
  --accent-blue: #3b82f6;
  --accent-emerald: #34d399;
  --accent-amber: #f59e0b;
  --ink-50: #f7fbff;
  --ink-200: #d8e8ff;
  --ink-300: #b9d4f6;
  position: relative;
  width: 980px;
  max-width: 96vw;
  max-height: calc(100vh - var(--topbar-safe-offset) - 18px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: radial-gradient(900px 460px at -12% -35%, rgba(14, 165, 233, .17), transparent 58%),
              radial-gradient(740px 360px at 112% -16%, rgba(59, 130, 246, .2), transparent 56%),
              linear-gradient(158deg, rgba(8, 19, 37, .98), rgba(6, 14, 27, .98));
  border-radius: 18px;
  padding: 16px;
  color: var(--ink-50);
  border: 1px solid rgba(56, 189, 248, .32);
  box-shadow: 0 28px 70px rgba(0, 0, 0, .62),
              inset 0 1px 0 rgba(255, 255, 255, .07);
  font-family: "Sora", "Plus Jakarta Sans", "Segoe UI", sans-serif;
}

.cons-update-panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue), var(--accent-amber));
  opacity: .95;
  pointer-events: none;
}

.cons-update-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, .025), transparent 35%);
  opacity: .4;
  pointer-events: none;
}

.panel-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(56, 189, 248, .25);
}

.panel-title-wrap {
  display: flex;
  gap: 12px;
  align-items: center;
}

.panel-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 211, 238, .42);
  background: linear-gradient(160deg, rgba(34, 211, 238, .2), rgba(37, 99, 235, .26));
  box-shadow: 0 0 24px rgba(34, 211, 238, .17);
  animation: badgePulse 2.6s ease-in-out infinite;
}

.panel-icon {
  color: #bbf7ff;
}

.panel-title {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: .2px;
  background: linear-gradient(90deg, #f0f9ff, #dbeafe 45%, #bae6fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.panel-sub {
  font-size: .82rem;
  color: rgba(201, 227, 253, .76);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-indicator {
  font-size: .78rem;
  color: #dcfce7;
  font-weight: 700;
  letter-spacing: .3px;
  border: 1px solid rgba(52, 211, 153, .5);
  border-radius: 999px;
  padding: 4px 10px;
  background: linear-gradient(140deg, rgba(5, 150, 105, .3), rgba(15, 118, 110, .2));
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, .35);
  background: linear-gradient(145deg, rgba(19, 43, 73, .8), rgba(11, 31, 58, .7));
  color: #dff4ff;
  cursor: pointer;
  transition: filter .2s ease, transform .2s ease;
}

.close-btn:hover {
  filter: brightness(1.12);
  transform: translateY(-1px);
}

.panel-kpis {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.kpi-chip {
  border: 1px solid rgba(96, 165, 250, .32);
  border-radius: 11px;
  padding: 8px 10px;
  background: linear-gradient(165deg, rgba(11, 27, 49, .9), rgba(8, 20, 39, .86));
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05);
  transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
}

.kpi-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(125, 211, 252, .58);
  box-shadow: 0 10px 22px rgba(15, 23, 42, .35), inset 0 1px 0 rgba(255, 255, 255, .06);
}

.kpi-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.kpi-head span {
  font-size: .67rem;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: rgba(209, 223, 242, .56);
}

.kpi-icon {
  color: #8de3ff;
}

.kpi-chip strong {
  font-size: .88rem;
  color: #f5f9ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-chip:nth-child(1) {
  border-color: rgba(34, 211, 238, .45);
}

.kpi-chip:nth-child(2) {
  border-color: rgba(56, 189, 248, .4);
}

.kpi-chip:nth-child(3) {
  border-color: rgba(96, 165, 250, .38);
}

.kpi-chip.highlight {
  border-color: rgba(245, 158, 11, .44);
  background: linear-gradient(150deg, rgba(245, 158, 11, .22), rgba(13, 25, 44, .76));
}

.panel-body {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.panel-main {
  min-height: 0;
  overflow-y: auto;
  border: 1px solid rgba(96, 165, 250, .24);
  border-radius: 14px;
  padding: 12px;
  background: linear-gradient(165deg, rgba(10, 23, 42, .84), rgba(7, 17, 31, .8));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .045);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: rgba(191, 219, 254, .78);
  font-weight: 700;
  margin-bottom: 10px;
}

.section-label-icon {
  color: #67e8f9;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-control {
  position: relative;
}

.field-leading-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c8f5ff;
  background: linear-gradient(145deg, rgba(13, 53, 84, .9), rgba(10, 36, 60, .84));
  border: 1px solid rgba(56, 189, 248, .42);
  box-shadow: 0 0 16px rgba(34, 211, 238, .18);
  pointer-events: none;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.field-leading-icon.textarea-icon {
  top: 12px;
  transform: none;
}

.field-control:focus-within .field-leading-icon {
  transform: translateY(-50%) scale(1.06);
  border-color: rgba(34, 211, 238, .78);
  box-shadow: 0 0 22px rgba(34, 211, 238, .32);
}

.field-control:focus-within .field-leading-icon.textarea-icon {
  transform: scale(1.06);
}

.field .field-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .76rem;
  color: rgba(218, 237, 255, .9);
  font-weight: 600;
  letter-spacing: .2px;
}

.field .field-title svg {
  color: #7dd3fc;
  opacity: .92;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 10px 12px 10px 44px;
  border-radius: 10px;
  border: 1px solid rgba(125, 211, 252, .25);
  color: var(--ink-50);
  background: linear-gradient(180deg, rgba(12, 26, 47, .9), rgba(8, 19, 36, .88));
  font-size: .9rem;
  outline: none;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease, background-color .18s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04);
}

.field input::placeholder,
.field textarea::placeholder {
  color: rgba(170, 197, 226, .45);
}

.field textarea {
  resize: vertical;
  min-height: 88px;
  padding-top: 12px;
}

.field input:hover,
.field textarea:hover,
.field select:hover {
  border-color: rgba(103, 232, 249, .58);
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: rgba(34, 211, 238, .75);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, .2), 0 10px 24px rgba(2, 132, 199, .18);
  transform: translateY(-1px);
}

.caducidad-field {
  border: 1px solid rgba(56, 189, 248, .2);
  border-radius: 12px;
  padding: 10px;
  background: rgba(8, 22, 40, .48);
}

.caducidad-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.date-control.disabled {
  opacity: .74;
}

.cad-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(125, 211, 252, .3);
  border-radius: 999px;
  padding: 7px 10px 7px 8px;
  background: rgba(9, 28, 49, .7);
  user-select: none;
  cursor: pointer;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.cad-switch:hover {
  border-color: rgba(34, 211, 238, .55);
  transform: translateY(-1px);
}

.cad-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.cad-switch-track {
  width: 36px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, .38);
  background: rgba(15, 23, 42, .7);
  display: inline-flex;
  align-items: center;
  padding: 2px;
  transition: background-color .18s ease, border-color .18s ease;
}

.cad-switch-thumb {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #bae6fd;
  transform: translateX(0);
  transition: transform .18s ease, background-color .18s ease;
}

.cad-switch-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .8rem;
  color: rgba(219, 234, 254, .92);
  font-weight: 600;
}

.cad-switch.active {
  border-color: rgba(52, 211, 153, .52);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, .16);
}

.cad-switch.active .cad-switch-track {
  background: rgba(6, 78, 59, .72);
  border-color: rgba(52, 211, 153, .58);
}

.cad-switch.active .cad-switch-thumb {
  background: #6ee7b7;
  transform: translateX(16px);
}

.field input[disabled] {
  opacity: .8;
  cursor: not-allowed;
}

.field input[disabled] + .field-leading-icon,
.field-control:has(input[disabled]) .field-leading-icon {
  opacity: .78;
}

.field-full {
  grid-column: 1 / -1;
}

.field-checkbox {
  flex-direction: row;
  align-items: center;
  align-self: end;
  gap: 8px;
  border: 1px solid rgba(56, 189, 248, .22);
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(8, 23, 42, .48);
}

.field-checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #3b82f6;
}

.field-checkbox span {
  font-size: .82rem;
  color: rgba(218, 239, 255, .9);
}

.field-checkbox .field-title {
  margin: 0;
}

.panel-side {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-card {
  border: 1px solid rgba(96, 165, 250, .28);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(9, 23, 43, .82), rgba(6, 17, 33, .76));
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04);
}

.side-card h4 {
  margin: 0 0 10px;
  font-size: .88rem;
  color: #dff4ff;
}

.side-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.side-title svg {
  color: #7dd3fc;
}

.stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 10px;
  border: 1px solid rgba(125, 211, 252, .22);
  background: rgba(6, 17, 32, .62);
  border-radius: 10px;
  margin-bottom: 8px;
}

.stock-row:last-child {
  margin-bottom: 0;
}

.stock-row span {
  font-size: .74rem;
  color: rgba(209, 223, 242, .74);
  letter-spacing: .5px;
}

.stock-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.stock-label svg {
  color: #93c5fd;
}

.stock-row strong {
  font-size: .95rem;
  color: #f5f9ff;
}

.stock-row.total {
  border-color: rgba(245, 158, 11, .42);
  background: linear-gradient(140deg, rgba(245, 158, 11, .2), rgba(37, 99, 235, .16));
}

.side-hint {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.hint-icon {
  color: #67e8f9;
  flex-shrink: 0;
  margin-top: 1px;
}

.side-hint p {
  margin: 0;
  font-size: .8rem;
  color: rgba(209, 223, 242, .82);
  line-height: 1.45;
}

.form-error {
  color: #fecaca;
  font-weight: 700;
  font-size: .84rem;
  border: 1px solid rgba(248, 113, 113, .45);
  background: rgba(127, 29, 29, .3);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.feedback {
  margin-top: 10px;
  color: #86efac;
  font-weight: 700;
  font-size: .84rem;
}

.panel-actions {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(56, 189, 248, .22);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(30, 41, 59, .66), rgba(15, 23, 42, .7));
  color: var(--ink-200);
  border: 1px solid rgba(125, 211, 252, .24);
  cursor: pointer;
  font-weight: 600;
  transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;
}

.btn-primary {
  position: relative;
  overflow: hidden;
  background: linear-gradient(140deg, #0891b2, #2563eb 58%, #3b82f6);
  border: 1px solid rgba(125, 211, 252, .34);
  color: #f5fbff;
  box-shadow: 0 6px 18px rgba(3, 105, 161, .28);
}

.btn-primary::after {
  content: "";
  position: absolute;
  top: 0;
  left: -130%;
  width: 110%;
  height: 100%;
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, .26) 48%, transparent 100%);
  transition: left .42s ease;
}

.btn-primary:hover::after {
  left: 130%;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.action-save.saved {
  background: linear-gradient(140deg, #059669, #10b981);
  border-color: rgba(110, 231, 183, .42);
}

@keyframes badgePulse {
  0% {
    box-shadow: 0 0 12px rgba(34, 211, 238, .12);
  }
  50% {
    box-shadow: 0 0 24px rgba(34, 211, 238, .28);
  }
  100% {
    box-shadow: 0 0 12px rgba(34, 211, 238, .12);
  }
}

.btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.btn-icon {
  color: #d6eeff;
}

.check-icon {
  color: #dcfce7;
}

.panel-main,
.panel-side {
  scrollbar-width: thin;
  scrollbar-color: rgba(96, 165, 250, .45) rgba(15, 23, 42, .3);
}

.panel-main::-webkit-scrollbar,
.panel-side::-webkit-scrollbar {
  width: 8px;
}

.panel-main::-webkit-scrollbar-track,
.panel-side::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, .34);
}

.panel-main::-webkit-scrollbar-thumb,
.panel-side::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, .45);
  border-radius: 999px;
}

@media (max-width: 980px) {
  .panel-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-body {
    grid-template-columns: 1fr;
  }

  .panel-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .cons-update-overlay {
    --topbar-safe-offset: 78px;
    padding: var(--topbar-safe-offset) 10px 10px;
  }

  .cons-update-panel {
    width: 100%;
    max-height: calc(100vh - var(--topbar-safe-offset) - 10px);
    padding: 14px;
  }

  .panel-kpis,
  .form-grid,
  .panel-side {
    grid-template-columns: 1fr;
  }

  .caducidad-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .cad-switch {
    justify-content: center;
  }

  .panel-title {
    font-size: 1rem;
  }
}
</style>