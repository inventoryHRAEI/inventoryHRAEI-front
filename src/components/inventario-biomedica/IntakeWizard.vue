<template>
  <WizardShell
    :open="open"
    :steps="stepLabels"
    :current="step"
    :title="title"
    :subtitle="subtitle"
    :can-next="canNext"
    :can-finish="canFinish"
    :loading="submitting"
    mode-class="wz-mode-intake"
    @close="close"
    @back="goBack"
    @next="goNext"
    @submit="submit"
  >
    <div v-if="submitError" class="ik-error-banner">
      {{ submitError }}
    </div>

    <!-- Step 0: Tipo de ingreso -->
    <div v-if="step === 0" class="ik-step fade-in">
      <p class="ik-hint">¿Qué tipo de ingreso deseas realizar?</p>
      <div class="ik-type-grid">
        <button
          class="ik-type-btn"
          :class="{ selected: intakeType === 'refill' }"
          @click="intakeType = 'refill'"
        >
          <div class="ik-type-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </div>
          <h4>Resurtir Stock</h4>
          <span>Aumentar existencias de artículos ya registrados</span>
        </button>
        <button
          class="ik-type-btn"
          :class="{ selected: intakeType === 'new' }"
          @click="intakeType = 'new'"
        >
          <div class="ik-type-icon ik-type-icon-new">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h4>Nuevo Consumible</h4>
          <span>Registrar un artículo que no existe en el catálogo</span>
        </button>
      </div>
    </div>

    <!-- Step 1 (refill): Artículos + Metadata -->
    <div v-if="step === 1 && intakeType === 'refill'" class="ik-step fade-in">
      <div class="ik-cols">
        <aside class="ik-meta">
          <h3 class="ik-meta-title">Datos de Entrada</h3>
          <label class="ik-field">
            <span>Responsable *</span>
            <input v-model="meta.responsable" class="ik-input" placeholder="Nombre completo" />
          </label>
          <label class="ik-field">
            <span>Proveedor / Origen</span>
            <input v-model="meta.proveedor" class="ik-input" placeholder="Empresa proveedora" />
          </label>
          <label class="ik-field">
            <span>Motivo</span>
            <input v-model="meta.motivo" class="ik-input" placeholder="Licitación, donación…" />
          </label>
        </aside>
        <div class="ik-items">
          <ItemListVirtual
            :items="items"
            :quantities="quantities"
            :loading="loadingItems"
            placeholder="Buscar por varios términos: referencia marca lote…"
            :search-scopes="['all', 'clave', 'descripcion', 'marca', 'modelo', 'referencia', 'lote', 'n']"
            :stock-filters="['all', 'with-stock', 'zero-stock']"
            :allow-fast-step="true"
            :fast-amount="5"
            @update:quantities="quantities = $event"
          />
        </div>
      </div>
    </div>

    <!-- Step 1 (new): Formulario de nuevo bien -->
    <div v-if="step === 1 && intakeType === 'new'" class="ik-step fade-in">
      <div class="ik-new-form">
        <!-- Header del formulario -->
        <div class="ik-new-header">
          <div class="ik-header-content">
            <div class="ik-header-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3l1.5 4.5H18l-3.6 2.7L15.9 15 12 12.3 8.1 15l1.5-4.8L6 7.5h4.5z"/></svg>
            </div>
            <div class="ik-header-text">
              <h3>Nuevo Registro</h3>
              <p>Completa la información esencial de cada consumible</p>
            </div>
          </div>
        </div>

        <!-- Resumen de estadísticas -->
        <div class="ik-new-summary">
          <div class="ik-sum-card">
            <span>Renglones</span>
            <strong>{{ newItems.length }}</strong>
          </div>
          <div class="ik-sum-card">
            <span>Unidades totales</span>
            <strong>{{ newItemsTotal }}</strong>
          </div>
          <div class="ik-sum-card">
            <span>Validos</span>
            <strong>{{ areNewItemsValid() ? 'Sí' : 'No' }}</strong>
          </div>
        </div>

        <!-- Formulario principal -->
        <div class="ik-form-grid">
          <div class="ik-new-items-header">
            <h4>Renglones a registrar</h4>
            <button type="button" class="ik-add-row" @click="addNewItemRow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar renglón
            </button>
          </div>

          <div class="ik-items-grid">
              <div class="ik-item-row" v-for="(item, idx) in newItems" :key="idx">
                <div class="ik-item-row-header">
                  <span class="ik-item-badge">#{{ idx + 1 }}</span>
                  <button type="button" class="ik-remove-row" @click="removeNewItemRow(idx)" v-if="newItems.length > 1">
                    ✕
                  </button>
                </div>

                <div class="ik-item-fields">
                  <label class="ik-field ik-field-full">
                    <span>Descripción *</span>
                    <input v-model="item.descripcion" class="ik-input" placeholder="Ej. Jeringa estéril de 5ml" />
                  </label>
                  <label class="ik-field ik-field-full">
                    <span>Clave HRAEI *</span>
                    <input v-model="item.claveHRAEI" class="ik-input" placeholder="C-XXXXX" />
                  </label>
                  <label class="ik-field">
                    <span>Unidad (tipo) *</span>
                    <select v-model="item.unidadTipo" class="ik-input">
                      <option value="">Selecciona tipo</option>
                      <option v-for="opt in UNIT_TYPES" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>
                  <label class="ik-field">
                    <span>Medida *</span>
                    <select v-model="item.unidadMedida" class="ik-input" :disabled="!item.unidadTipo">
                      <option value="">Selecciona medida</option>
                      <option v-for="opt in getUnidadOptions(item.unidadTipo)" :key="opt" :value="opt">
                        {{ opt }}
                      </option>
                    </select>
                  </label>
                  <label v-if="isUnidadCustom(item.unidadTipo, item.unidadMedida)" class="ik-field ik-field-full">
                    <span>Especifica la cantidad *</span>
                    <input v-model.trim="item.unidadMedidaCustom" class="ik-input" placeholder="Ej. 7 cajas" />
                  </label>
                  <label class="ik-field">
                    <span>Cantidad *</span>
                    <div class="ik-qty-wrap">
                      <button class="ik-qty-btn" @click="item.cantidad = Math.max(0, (item.cantidad || 0) - 1)">−</button>
                      <input v-model.number="item.cantidad" type="number" class="ik-qty-val" />
                      <button class="ik-qty-btn" @click="item.cantidad = (item.cantidad || 0) + 1">+</button>
                    </div>
                  </label>
                  <label class="ik-field">
                    <span>Lote</span>
                    <input v-model="item.lote" class="ik-input" placeholder="Ej. 0936-01" />
                  </label>
                  <label class="ik-field">
                    <span>Fecha caducidad</span>
                    <input v-model="item.fechaCaducidad" type="date" class="ik-input" />
                  </label>
                </div>
              </div>
            </div>

            <label class="ik-field ik-field-full">
              <span>Responsable *</span>
              <input v-model="meta.responsable" class="ik-input" placeholder="Nombre completo" />
            </label>
        </div>
      </div>
    </div>

    <!-- Step 2: Confirmación -->
    <div v-if="step === 2" class="ik-step fade-in">
      <div class="ik-confirm">
        <div class="ik-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2>Confirma el Ingreso</h2>
        <p class="ik-confirm-sub">Esta operación añadirá stock al inventario</p>

        <div class="ik-confirm-grid">
          <div class="ik-cg-card">
            <span class="ik-cg-label">Tipo</span>
            <span class="ik-cg-value">{{ intakeType === 'refill' ? 'RESURTIDO' : 'NUEVO BIEN' }}</span>
          </div>
          <div class="ik-cg-card">
            <span class="ik-cg-label">Responsable</span>
            <span class="ik-cg-value">{{ meta.responsable || '—' }}</span>
          </div>
          <div class="ik-cg-card">
            <span class="ik-cg-label">{{ intakeType === 'refill' ? 'Artículos' : 'Artículos' }}</span>
            <span class="ik-cg-value">{{ intakeType === 'refill' ? selectedCount : newItems.length }}</span>
          </div>
          <div class="ik-cg-card">
            <span class="ik-cg-label">Unidades</span>
            <span class="ik-cg-value accent">{{ intakeType === 'refill' ? totalUnits : newItemsTotal }}</span>
          </div>
        </div>

        <!-- Lista para refill -->
        <div v-if="intakeType === 'refill' && selectedList.length" class="ik-confirm-list">
          <div v-for="s in selectedList" :key="s.clave" class="ik-cl-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-cl-icon"><path d="M21 8l-2-2H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="2"/></svg>
            <div class="ik-cl-info">
              <strong>{{ s.nombre }}</strong>
              <span>+{{ s.qty }} unidades · {{ s.clave }}</span>
            </div>
          </div>
        </div>

        <!-- Detalle para new -->
        <div v-if="intakeType === 'new'" class="ik-confirm-list">
          <div v-for="(item, idx) in newItems" :key="idx" class="ik-cl-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-cl-icon"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <div class="ik-cl-info">
              <strong>{{ item.descripcion || '—' }}</strong>
              <span>
                Clave: {{ item.claveHRAEI || '—' }} ·
                {{ item.cantidad || 0 }}
                {{ item.unidadMedida || '—' }}
                <span v-if="isUnidadCustom(item.unidadTipo, item.unidadMedida)">({{ item.unidadMedidaCustom || '...' }})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </WizardShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import WizardShell from './WizardShell.vue';
import ItemListVirtual from './ItemListVirtual.vue';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'success']);

const step       = ref(0);
const intakeType = ref(null);
const items      = ref([]);
const quantities = ref({});
const loadingItems = ref(false);
const submitting = ref(false);
const submitError = ref('');

const meta = ref({ responsable: '', proveedor: '', motivo: '', notas: '' });

const UNIT_TYPES = [
  { value: 'caja', label: 'Caja', options: ['10', '20', '50', '100', '250', 'Otro'] },
  { value: 'envase', label: 'Envase', options: ['1lt', '4lts', '5lts', '10lts', 'Otro'] },
  { value: 'paquete', label: 'Paquete', options: ['2pz', '5pz', '10pz', '20pz', 'Otro'] },
  { value: 'pieza', label: 'Pieza', options: ['Especificar'] }
];

const newItems = ref([makeNewItem()]);

function makeNewItem() {
  return {
    descripcion: '',
    claveHRAEI: '',
    lote: '',
    fechaCaducidad: '',
    cantidad: null,
    unidadTipo: '',
    unidadMedida: '',
    unidadMedidaCustom: ''
  };
}

function getUnidadOptions(tipo) {
  const found = UNIT_TYPES.find(t => t.value === tipo);
  return found ? found.options : [];
}

function isUnidadCustom(tipo, medida) {
  if (!tipo) return false;
  if (tipo === 'pieza') return true;
  return medida === 'Otro' || medida === 'Especificar';
}

function addNewItemRow() {
  newItems.value.push(makeNewItem());
}

function removeNewItemRow(index) {
  if (newItems.value.length <= 1) return;
  newItems.value.splice(index, 1);
}

function isNewItemValid(item) {
  if (!item) return false;
  const desc = (item.descripcion || '').trim();
  const clave = (item.claveHRAEI || '').trim();
  const cantidad = Number(item.cantidad);
  const tipo = item.unidadTipo;
  const medida = item.unidadMedida;

  if (!desc || !clave || !tipo || !medida || cantidad <= 0) return false;
  if (isUnidadCustom(tipo, medida)) {
    const custom = (item.unidadMedidaCustom || '').trim();
    if (!custom) return false;
  }
  return true;
}

function areNewItemsValid() {
  return newItems.value.length > 0 && newItems.value.every(isNewItemValid);
}

const pickValue = (item, aliases = [], fallback = '') => {
  if (!item || typeof item !== 'object') return fallback;

  const normalizeKey = (key) => String(key || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  const normalizedLookup = new Map();
  Object.keys(item).forEach((k) => {
    const normalized = normalizeKey(k);
    if (normalized && !normalizedLookup.has(normalized)) normalizedLookup.set(normalized, k);
  });

  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(item, alias) && item[alias] !== null && item[alias] !== undefined && item[alias] !== '') {
      return item[alias];
    }
    const found = normalizedLookup.get(normalizeKey(alias));
    if (found && item[found] !== null && item[found] !== undefined && item[found] !== '') {
      return item[found];
    }
  }

  return fallback;
};

const getItemId = (item) => {
  const clave = pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], 'SIN_CLAVE');
  const serie = pickValue(item, ['N', 'Número de serie', 'Numero de serie', 'id'], '');
  const modelo = pickValue(item, ['MODELO', 'Modelo', 'modelo'], '');
  const marca = pickValue(item, ['MARCA', 'Marca', 'marca'], '');
  return `${clave}|${serie}|${modelo}|${marca}`;
};

const getItemClave = (item) => String(pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], '') || '').trim();
const getItemName = (item) => String(pickValue(item, ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN ARTÍCULO', 'descripcion', 'NOMBRE'], '—') || '—');

/* Step names */
const stepLabels = computed(() => {
  if (intakeType.value === 'new') return ['Tipo', 'Nuevo Bien', 'Confirmación'];
  return ['Tipo', 'Resurtido', 'Confirmación'];
});

/* Titles */
const title = computed(() => {
  if (step.value === 0) return 'Tipo de Ingreso';
  if (step.value === 1) return intakeType.value === 'refill' ? 'Resurtir Stock' : 'Nuevo Consumible';
  return 'Confirmar Ingreso';
});
const subtitle = computed(() => {
  if (step.value === 0) return '¿Resurtir existentes o crear uno nuevo?';
  if (step.value === 1 && intakeType.value === 'refill') return 'Selecciona artículos y cantidades a ingresar';
  if (step.value === 1) return 'Completa la información esencial';
  return 'Revisa los datos antes de procesar';
});

/* Selection helpers */
const selectedCount = computed(() =>
  Object.values(quantities.value).filter(q => Number(q) > 0).length
);
const totalUnits = computed(() =>
  Object.values(quantities.value).reduce((s, q) => s + (Number(q) || 0), 0)
);
const selectedList = computed(() => {
  return Object.entries(quantities.value)
    .filter(([, q]) => Number(q) > 0)
    .map(([itemId, qty]) => {
      const item = items.value.find(i => getItemId(i) === itemId);
      const clave = item ? getItemClave(item) : itemId;
      return { clave, qty: Number(qty), nombre: item ? getItemName(item) : itemId };
    });
});

const newItemsTotal = computed(() => newItems.value.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0));

const canNext = computed(() => {
  if (step.value === 0) return !!intakeType.value;
  if (step.value === 1 && intakeType.value === 'refill') return selectedCount.value > 0 && !!meta.value.responsable;
  if (step.value === 1 && intakeType.value === 'new') return areNewItemsValid() && !!meta.value.responsable;
  return true;
});

const canFinish = computed(() => {
  if (intakeType.value === 'refill') return selectedCount.value > 0 && !!meta.value.responsable;
  return areNewItemsValid() && !!meta.value.responsable;
});

/* Load items for refill */
const loadItems = async () => {
  loadingItems.value = true;
  try {
    const res = await fetch('/api/ops/stock-biomedica');
    if (res.ok) {
      const data = await res.json();
      items.value = Array.isArray(data) ? data : (data.data || []);
    } else { items.value = []; }
  } catch { items.value = []; }
  finally { loadingItems.value = false; }
};

const goNext = () => {
  if (step.value === 0) {
    if (intakeType.value === 'refill') loadItems();
    step.value = 1;
  } else if (step.value < 2) {
    step.value++;
  }
};
const goBack = () => {
  if (step.value === 1) { intakeType.value = null; }
  if (step.value > 0) step.value--;
};

/* Reset */
const resetState = () => {
  step.value = 0;
  intakeType.value = null;
  items.value = [];
  quantities.value = {};
  submitting.value = false;
  submitError.value = '';
  meta.value = { responsable: '', proveedor: '', motivo: '', notas: '' };
  newItems.value = [makeNewItem()]
};
const close = (force = false) => {
    if (force || window.confirm('¿Está seguro de que desea cerrar el wizard? Se perderán los cambios no guardados.')) {
        emit('close');
        resetState();
    }
};
watch(() => props.open, (v) => { if (v) resetState(); });

/* Submit */
const submit = async () => {
  submitError.value = '';
  submitting.value = true;
  try {
    if (intakeType.value === 'refill') {
      const itemsToRefill = Object.entries(quantities.value)
        .filter(([, q]) => q > 0)
        .map(([itemId, cantidad]) => {
          const item = items.value.find(i => getItemId(i) === itemId);
          const claveHRAEI = item ? getItemClave(item) : String(itemId || '').trim();
          return {
            claveHRAEI,
            descripcion: item ? getItemName(item) : '',
            marca: item ? String(pickValue(item, ['MARCA', 'Marca', 'marca'], '') || '').trim() : '',
            modelo: item ? String(pickValue(item, ['MODELO', 'Modelo', 'modelo'], '') || '').trim() : '',
            referencia: item ? String(pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], '') || '').trim() : '',
            lote: item ? String(pickValue(item, ['LOTE', 'Lote', 'lote'], '') || '').trim() : '',
            itemN: item ? String(pickValue(item, ['N', 'n', 'id'], '') || '').trim() : '',
            distribucion: { subceye: Number(cantidad), oficina: 0 },
          };
        });
      if (!itemsToRefill.length) throw new Error('Selecciona artículos');

      const payload = { tipoRegistro: 'refill', items: itemsToRefill, metadata: { ...meta.value } };
      const res = await fetch('/api/ops/inventory/consumables-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.msg || data.error || 'El resurtido falló');
    } else {
      const itemsPayload = newItems.value.map(item => ({
        claveHRAEI: item.claveHRAEI,
        descripcion: item.descripcion,
        lote: item.lote,
        fechaCaducidad: item.fechaCaducidad,
        cantidad: Number(item.cantidad || 0),
        unidadTipo: item.unidadTipo,
        unidadMedida: item.unidadMedida,
        unidadMedidaCustom: item.unidadMedidaCustom,
        distribucion: { subceye: Number(item.cantidad || 0), oficina: 0 },
      }));

      const payload = {
        tipoRegistro: 'new',
        items: itemsPayload,
        metadata: { ...meta.value },
      };
      const res = await fetch('/api/ops/inventory/consumables-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.msg || data.error || 'La creación falló');
    }
     emit('success');
     close(true);
  } catch (err) {
    const detail = String(err?.message || 'No se pudo completar el ingreso de bienes');
    submitError.value = `Ingreso no completado: ${detail}`;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.fade-in { animation: ikFadeIn .3s ease-out; }
@keyframes ikFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.ik-step { flex: 1; min-height: 0; display: flex; flex-direction: column; }

.ik-error-banner {
  margin-bottom: 12px;
  border: 1px solid rgba(248, 113, 113, .35);
  background: rgba(127, 29, 29, .35);
  color: #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}

/* --- Step 0: Type Selection --- */
.ik-hint { font-size: 14px; color: rgba(255,255,255,.45); margin: 0 0 20px; }

.ik-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.ik-type-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 32px 24px;
  background: rgba(255,255,255,.02);
  border: 1.5px solid rgba(255,255,255,.06);
  border-radius: 18px;
  cursor: pointer; color: #e0e7ff;
  font-family: inherit; text-align: center;
  transition: all .25s ease;
}
.ik-type-btn:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); }
.ik-type-btn.selected {
  background: rgba(96,165,250,.06);
  border-color: rgba(96,165,250,.35);
  box-shadow: 0 0 24px rgba(96,165,250,.08);
}

.ik-type-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(96,165,250,.1);
  display: flex; align-items: center; justify-content: center;
}
.ik-type-icon svg { width: 26px; height: 26px; color: #60a5fa; }
.ik-type-icon-new { background: rgba(236,72,153,.1); }
.ik-type-icon-new svg { color: #ec4899; }

.ik-type-btn h4 { margin: 4px 0 0; font-size: 16px; font-weight: 700; }
.ik-type-btn span { font-size: 12px; color: rgba(255,255,255,.4); }

/* --- Step 1 (refill): Two cols --- */
.ik-cols {
  display: grid; grid-template-columns: 280px 1fr;
  gap: 20px; flex: 1; min-height: 0;
}

.ik-meta {
  display: flex; flex-direction: column; gap: 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 18px; padding: 20px;
  overflow-y: auto;
}
.ik-meta-title { margin: 0 0 4px; font-size: 13px; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,.45); letter-spacing: .5px; }

.ik-field { display: flex; flex-direction: column; gap: 8px; }
.ik-field span { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: rgba(255,255,255,.5); }

.ik-input {
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px; 
  padding: 11px 14px;
  color: #fff; 
  font-size: 14px; 
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s, background .2s; 
  outline: none;
  width: 100%;
  min-height: 40px;
}
.ik-input:hover {
  background: rgba(0,0,0,.35);
  border-color: rgba(255,255,255,.12);
}
.ik-input:focus { 
  background: rgba(0,0,0,.4);
  border-color: #60a5fa; 
  box-shadow: 0 0 0 3px rgba(96,165,250,.1); 
}
select.ik-input {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
select.ik-input option {
  background: #1a1e2e;
  color: #e0e7ff;
}

.ik-items { display: flex; flex-direction: column; min-height: 0; }

/* --- Step 1 (new): Form --- */
.ik-new-form {
  padding: 0;
  overflow: visible !important;
  min-height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  height: auto !important;
  background: transparent;
  border: none;
  border-radius: 0;
  gap: 28px;
}

.ik-new-header {
  padding: 28px 32px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 18px !important;
  backdrop-filter: blur(10px) !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.ik-header-content {
  display: flex;
  align-items: center;
  gap: 18px;
  max-width: 1200px;
  margin: 0 auto;
}

.ik-header-badge {
  width: 52px !important;
  height: 52px !important;
  min-width: 52px !important;
  min-height: 52px !important;
  border-radius: 16px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0;
  overflow: hidden !important;
}

.ik-header-badge svg {
  width: 28px !important;
  height: 28px !important;
  color: #fff !important;
  stroke-width: 2 !important;
}

.ik-header-text h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
}

.ik-header-text p {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgba(255,255,255,.55);
  line-height: 1.5;
}

.ik-new-summary {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
  gap: 16px !important;
  padding: 20px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 14px !important;
  max-width: 1200px !important;
  margin: 0 auto !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.ik-sum-card {
  flex: 1;
  min-width: 140px;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ik-sum-card span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 500;
}

.ik-sum-card strong {
  font-size: 20px;
  color: #fff;
  line-height: 1.2;
  font-weight: 700;
}

.ik-new-items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.ik-add-row {
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.35);
  color: #60a5fa;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
  font-size: 13px;
  font-weight: 600;
}

.ik-add-row:hover {
  background: rgba(96, 165, 250, 0.22);
  border-color: rgba(96, 165, 250, 0.45);
  transform: translateY(-1px);
}

.ik-items-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  overflow-y: visible !important;
}

.ik-item-row {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ik-item-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.ik-item-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(96, 165, 250, 0.18);
  color: #60a5fa;
}

.ik-remove-row {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #fecaca;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  font-size: 16px;
  font-weight: 600;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ik-remove-row:hover {
  background: rgba(248, 113, 113, 0.18);
  border-color: rgba(248, 113, 113, 0.4);
}

.ik-item-fields {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 18px !important;
}

.ik-item-fields .ik-field {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ik-item-fields .ik-field span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.ik-item-fields .ik-field input,
.ik-item-fields .ik-field select {
  width: 100%;
  padding: 10px 12px !important;
  font-size: 14px !important;
  min-height: 40px !important;
}

.ik-item-fields .ik-field-full {
  grid-column: 1 / -1;
}

.ik-item-fields .ik-field:nth-child(n) {
  grid-column: span 1;
}

.ik-form-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: 26px !important;
  padding: 0 20px !important;
  max-width: 1200px !important;
  margin: 0 auto !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
.span-2 { grid-column: span 2; }

.ik-form-grid .ik-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ik-form-grid .ik-field span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.ik-form-grid .ik-field input,
.ik-form-grid .ik-field select {
  padding: 11px 14px !important;
  font-size: 14px !important;
  min-height: 42px !important;
}

.ik-qty-wrap {
  display: flex; 
  align-items: center; 
  gap: 6px;
  background: rgba(0,0,0,.25);
  border-radius: 14px; 
  padding: 6px 8px;
  border: 1px solid rgba(255,255,255,.12);
  width: fit-content;
  transition: border-color 0.2s, background 0.2s;
}

.ik-qty-wrap:focus-within {
  background: rgba(0,0,0,.35);
  border-color: rgba(96,165,250,.3);
}

.ik-qty-btn {
  width: 40px; 
  height: 40px;
  border-radius: 10px; 
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.08);
  color: #fff; 
  font-size: 18px; 
  font-weight: 700;
  cursor: pointer; 
  transition: background .15s, border-color .15s;
  display: flex; 
  align-items: center; 
  justify-content: center;
  font-family: inherit;
}

.ik-qty-btn:hover { 
  background: rgba(255,255,255,.14);
  border-color: rgba(255,255,255,.15);
}

.ik-qty-val {
  width: 80px; 
  background: none; 
  border: none;
  text-align: center; 
  color: #fff;
  font-size: 21px; 
  font-weight: 800;
  -moz-appearance: textfield; 
  appearance: textfield; 
  font-family: inherit;
  padding: 0 4px;
}

.ik-qty-val::-webkit-inner-spin-button,
.ik-qty-val::-webkit-outer-spin-button { 
  display: none; 
}

/* --- Step 2: Confirmation --- */
.ik-confirm {
  display: flex; flex-direction: column; align-items: center;
  gap: 18px; padding: 8px 0;
  overflow-y: auto; flex: 1;
}
.ik-confirm-icon {
  width: 72px; height: 72px;
  background: rgba(96,165,250,.08);
  border: 1px solid rgba(96,165,250,.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.ik-shield { width: 36px; height: 36px; color: #60a5fa; }

.ik-confirm h2 { margin: 0; font-size: 22px; font-weight: 800; color: #f0f7ff; }
.ik-confirm-sub { margin: 0; font-size: 13px; color: rgba(255,255,255,.4); }

.ik-confirm-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  width: 100%;
}
.ik-cg-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 14px; padding: 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.ik-cg-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,.35); font-weight: 700; letter-spacing: .5px; }
.ik-cg-value { font-size: 15px; font-weight: 700; color: #fff; }
.ik-cg-value.accent { color: #60a5fa; }

.ik-confirm-list {
  width: 100%;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 16px; padding: 8px;
  display: flex; flex-direction: column; gap: 4px;
  max-height: 220px; overflow-y: auto;
}
.ik-cl-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 14px;
  background: rgba(255,255,255,.02); border-radius: 10px;
}
.ik-cl-icon { width: 20px; height: 20px; color: #60a5fa; flex-shrink: 0; }
.ik-cl-info { display: flex; flex-direction: column; }
.ik-cl-info strong { font-size: 13px; color: rgba(255,255,255,.85); }
.ik-cl-info span { font-size: 11px; color: rgba(255,255,255,.35); }

@media (max-width: 1024px) {
  .ik-item-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ik-new-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .ik-type-grid { 
    grid-template-columns: 1fr; 
  }
  
  .ik-cols { 
    grid-template-columns: 1fr; 
  }
  
  .ik-new-form {
    gap: 20px;
  }
  
  .ik-new-header {
    padding: 20px;
  }
  
  .ik-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    text-align: left;
  }
  
  .ik-new-summary {
    grid-template-columns: 1fr;
  }
  
  .ik-form-grid {
    padding: 0 16px;
    gap: 20px;
  }
  
  .ik-item-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .ik-confirm-grid { 
    grid-template-columns: 1fr 1fr; 
  }
}
</style>
