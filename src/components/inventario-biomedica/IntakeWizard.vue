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
          <h4>Nuevo Bien</h4>
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

    <!-- Step 1 (new): Formulario completo de nuevo bien -->
    <div v-if="step === 1 && intakeType === 'new'" class="ik-step fade-in">
      <div class="ik-new-layout">
        <aside class="ik-new-side-card">
          <h3 class="ik-side-title">Datos de la Operación</h3>

          <label class="ik-field">
            <span>Responsable *</span>
            <input v-model="meta.responsable" class="ik-input" placeholder="Nombre completo" />
          </label>
          <label class="ik-field">
            <span>Proveedor / Origen *</span>
            <input v-model="meta.proveedor" class="ik-input" placeholder="Empresa, donación o procedencia" />
          </label>
          <label class="ik-field">
            <span>Motivo *</span>
            <input v-model="meta.motivo" class="ik-input" placeholder="Alta inicial, reposición estratégica..." />
          </label>
          <label class="ik-field">
            <span>Notas generales</span>
            <textarea v-model="meta.notas" class="ik-input ik-textarea" rows="4" placeholder="Observaciones del ingreso"></textarea>
          </label>

          <div class="ik-side-stats">
            <div class="ik-side-stat">
              <span>Renglones</span>
              <strong>{{ newItems.length }}</strong>
            </div>
            <div class="ik-side-stat">
              <span>Completos</span>
              <strong>{{ newItemsCompleteCount }}</strong>
            </div>
            <div class="ik-side-stat">
              <span>Unidades</span>
              <strong>{{ newItemsTotal }}</strong>
            </div>
          </div>
        </aside>

        <section class="ik-new-main">
          <div class="ik-new-main-header">
            <div>
              <h3>Ficha completa por bien</h3>
              <p>Captura identificación, trazabilidad y distribución para cada renglón.</p>
            </div>
            <button type="button" class="ik-add-row" @click="addNewItemRow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar renglón
            </button>
          </div>

          <div class="ik-items-grid">
            <article
              class="ik-item-row"
              :class="{ 'ik-item-row--valid': isNewItemValid(item), 'ik-item-row--invalid': !isNewItemValid(item) }"
              v-for="(item, idx) in newItems"
              :key="idx"
            >
              <div class="ik-item-row-header">
                <span class="ik-item-badge">Bien #{{ idx + 1 }}</span>
                <div class="ik-item-row-actions">
                  <span class="ik-item-status" :class="{ ok: isNewItemValid(item) }">
                    {{ isNewItemValid(item) ? 'Completo' : 'Incompleto' }}
                  </span>
                  <button type="button" class="ik-remove-row" @click="removeNewItemRow(idx)" v-if="newItems.length > 1">
                    ✕
                  </button>
                </div>
              </div>

              <div class="ik-item-fields">
                <label class="ik-field ik-field-full">
                  <span>Descripción del bien *</span>
                  <input v-model.trim="item.descripcion" class="ik-input" placeholder="Ej. Jeringa estéril de 5ml" />
                </label>

                <label class="ik-field">
                  <span>Clave HRAEI *</span>
                  <input v-model.trim="item.claveHRAEI" class="ik-input" placeholder="C-XXXXX" />
                </label>
                <label class="ik-field">
                  <span>No. inventario</span>
                  <input v-model.trim="item.noInventario" class="ik-input" placeholder="INV-000123" />
                </label>
                <label class="ik-field">
                  <span>Ubicación *</span>
                  <input v-model.trim="item.ubicacion" class="ik-input" placeholder="Ej. CEYE, Urgencias" />
                </label>

                <label class="ik-field">
                  <span>Marca *</span>
                  <input v-model.trim="item.marca" class="ik-input" placeholder="Ej. BD" />
                </label>
                <label class="ik-field">
                  <span>Modelo *</span>
                  <input v-model.trim="item.modelo" class="ik-input" placeholder="Ej. Luer-Lok" />
                </label>
                <label class="ik-field">
                  <span>Referencia *</span>
                  <input v-model.trim="item.referencia" class="ik-input" placeholder="Código del fabricante" />
                </label>

                <label class="ik-field">
                  <span>Lote *</span>
                  <input v-model.trim="item.lote" class="ik-input" placeholder="Ej. 0936-01" />
                </label>
                <label class="ik-field">
                  <span>Origen del bien *</span>
                  <input v-model.trim="item.origenBien" class="ik-input" placeholder="Compra, donación, comodato..." />
                </label>
                <label class="ik-field">
                  <span>Caducidad</span>
                  <input v-model="item.fechaCaducidad" :disabled="item.sinCaducidad" type="date" class="ik-input" />
                </label>

                <label class="ik-field ik-field-checkbox">
                  <input v-model="item.sinCaducidad" type="checkbox" />
                  <span>Sin caducidad</span>
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
                  <span>Unidad (medida) *</span>
                  <select v-model="item.unidadMedida" class="ik-input" :disabled="!item.unidadTipo">
                    <option value="">Selecciona medida</option>
                    <option v-for="opt in getUnidadOptions(item.unidadTipo)" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </label>

                <label v-if="isUnidadCustom(item.unidadTipo, item.unidadMedida)" class="ik-field">
                  <span>Especificación de unidad *</span>
                  <input v-model.trim="item.unidadMedidaCustom" class="ik-input" placeholder="Ej. 7 cajas" />
                </label>

                <label class="ik-field">
                  <span>Unidades a SUBCEYE *</span>
                  <input v-model.number="item.cantidadSubceye" min="0" type="number" class="ik-input" />
                </label>
                <label class="ik-field">
                  <span>Unidades a OFICINA *</span>
                  <input v-model.number="item.cantidadOficina" min="0" type="number" class="ik-input" />
                </label>
                <div class="ik-field ik-field-total">
                  <span>Total del renglón</span>
                  <div class="ik-total-pill">{{ getNewItemTotal(item) }}</div>
                </div>

                <label class="ik-field ik-field-full">
                  <span>Observaciones del bien</span>
                  <textarea v-model="item.observaciones" class="ik-input ik-textarea" rows="2" placeholder="Datos clínicos, presentación, trazabilidad..." />
                </label>
              </div>
            </article>
          </div>
        </section>
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
                Clave: {{ item.claveHRAEI || '—' }} · Marca/Modelo: {{ item.marca || '—' }} / {{ item.modelo || '—' }}
              </span>
              <span>
                Ref: {{ item.referencia || '—' }} · Lote: {{ item.lote || '—' }} · Ubicación: {{ item.ubicacion || '—' }}
              </span>
              <span>
                SUBCEYE: {{ Number(item.cantidadSubceye) || 0 }} · OFICINA: {{ Number(item.cantidadOficina) || 0 }} · Total: {{ getNewItemTotal(item) }} {{ getUnidadDisplay(item) }}
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
    noInventario: '',
    ubicacion: '',
    marca: '',
    modelo: '',
    referencia: '',
    lote: '',
    origenBien: '',
    fechaCaducidad: '',
    sinCaducidad: false,
    cantidadSubceye: null,
    cantidadOficina: null,
    unidadTipo: '',
    unidadMedida: '',
    unidadMedidaCustom: '',
    observaciones: ''
  };
}

function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

function getNewItemTotal(item) {
  const sub = toPositiveInt(item?.cantidadSubceye);
  const ofi = toPositiveInt(item?.cantidadOficina);
  return sub + ofi;
}

function getUnidadDisplay(item) {
  const unidad = String(item?.unidadMedida || '').trim();
  const custom = String(item?.unidadMedidaCustom || '').trim();
  if (unidad.toLowerCase() === 'otra') return custom || unidad || '—';
  return unidad || custom || '—';
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
  const marca = (item.marca || '').trim();
  const modelo = (item.modelo || '').trim();
  const referencia = (item.referencia || '').trim();
  const lote = (item.lote || '').trim();
  const ubicacion = (item.ubicacion || '').trim();
  const origenBien = (item.origenBien || '').trim();
  const total = getNewItemTotal(item);
  const tipo = item.unidadTipo;
  const medida = item.unidadMedida;
  const fechaCad = (item.fechaCaducidad || '').trim();

  if (!desc || !clave || !marca || !modelo || !referencia || !lote || !ubicacion || !origenBien) return false;
  if (!tipo || !medida || total <= 0) return false;
  if (!item.sinCaducidad && !fechaCad) return false;
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
  if (step.value === 1) return intakeType.value === 'refill' ? 'Resurtir Stock' : 'Nuevo Bien';
  return 'Confirmar Ingreso';
});
const subtitle = computed(() => {
  if (step.value === 0) return '¿Resurtir existentes o crear uno nuevo?';
  if (step.value === 1 && intakeType.value === 'refill') return 'Selecciona artículos y cantidades a ingresar';
  if (step.value === 1) return 'Completa la ficha integral de cada bien para su trazabilidad';
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

const newItemsCompleteCount = computed(() => newItems.value.filter(isNewItemValid).length);
const newItemsTotal = computed(() => newItems.value.reduce((sum, it) => sum + getNewItemTotal(it), 0));

const canNext = computed(() => {
  if (step.value === 0) return !!intakeType.value;
  if (step.value === 1 && intakeType.value === 'refill') return selectedCount.value > 0 && !!meta.value.responsable;
  if (step.value === 1 && intakeType.value === 'new') {
    return areNewItemsValid() && !!meta.value.responsable && !!meta.value.proveedor && !!meta.value.motivo;
  }
  return true;
});

const canFinish = computed(() => {
  if (intakeType.value === 'refill') return selectedCount.value > 0 && !!meta.value.responsable;
  return areNewItemsValid() && !!meta.value.responsable && !!meta.value.proveedor && !!meta.value.motivo;
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
        claveHRAEI: String(item.claveHRAEI || '').trim(),
        descripcion: String(item.descripcion || '').trim(),
        noInventario: String(item.noInventario || '').trim(),
        ubicacion: String(item.ubicacion || '').trim(),
        marca: String(item.marca || '').trim(),
        modelo: String(item.modelo || '').trim(),
        referencia: String(item.referencia || '').trim(),
        lote: String(item.lote || '').trim(),
        origenBien: String(item.origenBien || '').trim(),
        fechaCaducidad: item.sinCaducidad ? null : (item.fechaCaducidad || null),
        sinCaducidad: Boolean(item.sinCaducidad),
        cantidad: getNewItemTotal(item),
        unidadTipo: item.unidadTipo,
        unidadMedida: item.unidadMedida,
        unidadMedidaCustom: item.unidadMedidaCustom,
        observaciones: String(item.observaciones || '').trim(),
        distribucion: {
          subceye: toPositiveInt(item.cantidadSubceye),
          oficina: toPositiveInt(item.cantidadOficina)
        },
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
.fade-in {
  animation: ikFadeIn .4s cubic-bezier(.22,.61,.36,1);
}

@keyframes ikFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(.995); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes ikSoftPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(93,141,255,.22); }
  50% { box-shadow: 0 0 0 7px rgba(93,141,255,0); }
}

.ik-step {
  --ik-font-main: "Sora", "Plus Jakarta Sans", "Avenir Next", "Segoe UI", sans-serif;
  --ik-bg-panel: rgba(17, 31, 50, .82);
  --ik-bg-panel-soft: rgba(21, 38, 61, .68);
  --ik-bg-input: rgba(8, 16, 30, .72);
  --ik-border-soft: rgba(148, 163, 184, .22);
  --ik-border-strong: rgba(148, 163, 184, .35);
  --ik-text-main: #ecf3ff;
  --ik-text-muted: rgba(209, 223, 242, .72);
  --ik-text-dim: rgba(209, 223, 242, .48);
  --ik-blue: #5d8dff;
  --ik-cyan: #2fd5c8;
  --ik-amber: #f7b84b;
  --ik-danger: #fca5a5;
  --ik-success: #86efac;
  font-family: var(--ik-font-main);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
}

.ik-step::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 24px;
  pointer-events: none;
  z-index: -1;
  background:
    radial-gradient(680px 320px at 0% -20%, rgba(47,213,200,.14), transparent 68%),
    radial-gradient(520px 290px at 100% -10%, rgba(93,141,255,.16), transparent 64%);
}

.ik-error-banner {
  margin-bottom: 12px;
  border: 1px solid rgba(248, 113, 113, .45);
  background: linear-gradient(145deg, rgba(127, 29, 29, .44), rgba(69, 10, 10, .35));
  color: #fecaca;
  padding: 11px 13px;
  border-radius: 12px;
  font-size: 13px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

/* --- Step 0 --- */
.ik-hint {
  font-size: 14px;
  color: var(--ik-text-muted);
  margin: 0 0 22px;
  letter-spacing: .2px;
}

.ik-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.ik-type-btn {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 24px;
  background: linear-gradient(160deg, rgba(20, 36, 58, .74), rgba(14, 24, 41, .76));
  border: 1px solid var(--ik-border-soft);
  border-radius: 18px;
  cursor: pointer;
  color: var(--ik-text-main);
  text-align: center;
  font-family: inherit;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.09), 0 14px 24px rgba(2, 8, 23, .24);
  transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease;
}

.ik-type-btn::before {
  content: "";
  position: absolute;
  inset: -40% 10% auto;
  height: 140px;
  background: radial-gradient(closest-side, rgba(255,255,255,.12), transparent 72%);
  transform: rotate(-8deg);
  pointer-events: none;
}

.ik-type-btn:hover {
  transform: translateY(-2px);
  border-color: var(--ik-border-strong);
  background: linear-gradient(160deg, rgba(24, 41, 66, .82), rgba(16, 28, 47, .82));
}

.ik-type-btn.selected {
  border-color: rgba(93, 141, 255, .58);
  background: linear-gradient(160deg, rgba(26, 46, 73, .88), rgba(16, 29, 50, .88));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 18px 28px rgba(5, 15, 32, .28), 0 0 0 1px rgba(93,141,255,.18);
}

.ik-type-icon {
  width: 54px;
  height: 54px;
  border-radius: 15px;
  background: linear-gradient(150deg, rgba(93,141,255,.24), rgba(28,57,108,.35));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(93,141,255,.32);
}

.ik-type-icon svg {
  width: 26px;
  height: 26px;
  color: #9ab7ff;
}

.ik-type-icon-new {
  background: linear-gradient(150deg, rgba(247,184,75,.22), rgba(111,76,20,.35));
  border-color: rgba(247,184,75,.34);
}

.ik-type-icon-new svg {
  color: #ffd089;
}

.ik-type-btn h4 {
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
}

.ik-type-btn span {
  font-size: 12px;
  color: var(--ik-text-dim);
}

/* --- Step 1 (refill) --- */
.ik-cols {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.ik-meta {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: linear-gradient(165deg, var(--ik-bg-panel), var(--ik-bg-panel-soft));
  border: 1px solid var(--ik-border-soft);
  border-radius: 18px;
  padding: 20px;
  overflow-y: auto;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.09), 0 14px 22px rgba(3, 10, 24, .21);
}

.ik-meta-title {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ik-text-muted);
  letter-spacing: .8px;
}

.ik-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ik-field span {
  font-size: 12px;
  font-weight: 600;
  color: var(--ik-text-muted);
  letter-spacing: .25px;
}

.ik-input {
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid var(--ik-border-soft);
  background: linear-gradient(175deg, rgba(12, 22, 38, .84), var(--ik-bg-input));
  color: var(--ik-text-main);
  font-size: 14px;
  font-family: inherit;
  padding: 11px 14px;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s, transform .2s;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}

.ik-input::placeholder {
  color: rgba(209, 223, 242, .4);
}

.ik-input:hover {
  border-color: var(--ik-border-strong);
}

.ik-input:focus {
  border-color: rgba(93,141,255,.72);
  background: linear-gradient(175deg, rgba(16, 30, 50, .9), rgba(12, 24, 41, .88));
  box-shadow: 0 0 0 3px rgba(93,141,255,.18);
}

.ik-input:disabled {
  opacity: .62;
  cursor: not-allowed;
}

select.ik-input {
  appearance: none;
  cursor: pointer;
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(214,226,243,0.62)' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

select.ik-input option {
  background: #0f1b2d;
  color: #eaf1ff;
}

.ik-items {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* --- Step 1 (new) --- */
.ik-new-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.ik-new-side-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: linear-gradient(165deg, var(--ik-bg-panel), var(--ik-bg-panel-soft));
  border: 1px solid var(--ik-border-soft);
  border-radius: 18px;
  padding: 18px;
  overflow-y: auto;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 14px 26px rgba(2, 9, 23, .24);
}

.ik-side-title {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .9px;
  color: var(--ik-text-muted);
}

.ik-side-stats {
  margin-top: 6px;
  display: grid;
  gap: 8px;
}

.ik-side-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 12px;
  border-radius: 11px;
  border: 1px solid var(--ik-border-soft);
  border-left: 3px solid rgba(93,141,255,.62);
  background: rgba(4, 11, 22, .4);
}

.ik-side-stat:nth-child(2) {
  border-left-color: rgba(47,213,200,.68);
}

.ik-side-stat:nth-child(3) {
  border-left-color: rgba(247,184,75,.72);
}

.ik-side-stat span {
  font-size: 11px;
  color: var(--ik-text-dim);
  text-transform: uppercase;
  letter-spacing: .7px;
}

.ik-side-stat strong {
  font-size: 15px;
  color: var(--ik-text-main);
}

.ik-new-main {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 12px;
}

.ik-new-main-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  border: 1px solid var(--ik-border-soft);
  background: linear-gradient(160deg, rgba(21, 37, 59, .78), rgba(13, 24, 41, .76));
  border-radius: 16px;
  padding: 15px 16px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

.ik-new-main-header h3 {
  margin: 0;
  font-size: 17px;
  color: var(--ik-text-main);
}

.ik-new-main-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ik-text-dim);
}

.ik-add-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(93,141,255,.45);
  background: linear-gradient(150deg, rgba(93,141,255,.22), rgba(45,79,145,.25));
  color: #d7e5ff;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .2px;
  transition: transform .2s ease, filter .2s ease, border-color .2s ease;
}

.ik-add-row svg {
  width: 16px;
  height: 16px;
}

.ik-add-row:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
  border-color: rgba(93,141,255,.7);
}

.ik-items-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.ik-item-row {
  border-radius: 16px;
  border: 1px solid var(--ik-border-soft);
  background: linear-gradient(165deg, rgba(20, 35, 57, .76), rgba(12, 23, 40, .72));
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 10px 20px rgba(2, 8, 20, .18);
  transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
}

.ik-item-row:hover {
  transform: translateY(-1px);
  border-color: var(--ik-border-strong);
}

.ik-item-row--valid {
  border-color: rgba(134,239,172,.42);
  box-shadow: inset 0 0 0 1px rgba(134,239,172,.14), 0 10px 20px rgba(3, 20, 10, .2);
}

.ik-item-row--invalid {
  border-color: rgba(248,113,113,.35);
}

.ik-item-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.ik-item-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(93,141,255,.18);
  color: #c9dbff;
  border: 1px solid rgba(93,141,255,.3);
}

.ik-item-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ik-item-status {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  border-radius: 999px;
  border: 1px solid rgba(248,113,113,.35);
  color: var(--ik-danger);
  background: rgba(127,29,29,.25);
  padding: 4px 9px;
}

.ik-item-status.ok {
  border-color: rgba(134,239,172,.42);
  color: var(--ik-success);
  background: rgba(20,83,45,.28);
}

.ik-remove-row {
  min-width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(248,113,113,.36);
  background: rgba(127,29,29,.2);
  color: #fecaca;
  font-size: 16px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter .2s ease;
}

.ik-remove-row:hover {
  filter: brightness(1.12);
}

.ik-new-layout .ik-item-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.ik-new-layout .ik-field-full {
  grid-column: 1 / -1;
}

.ik-field-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  align-self: end;
}

.ik-field-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--ik-blue);
}

.ik-field-checkbox span {
  font-size: 12px;
  color: var(--ik-text-muted);
}

.ik-field-total {
  justify-content: flex-end;
}

.ik-total-pill {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(93,141,255,.46);
  background: linear-gradient(145deg, rgba(93,141,255,.26), rgba(22,49,96,.4));
  color: #d9e7ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  min-width: 84px;
  padding: 0 14px;
  animation: ikSoftPulse 1.9s ease-in-out infinite;
}

.ik-textarea {
  resize: vertical;
  min-height: 84px;
}

/* --- Step 2 --- */
.ik-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  overflow-y: auto;
  flex: 1;
}

.ik-confirm-icon {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  border: 1px solid rgba(93,141,255,.33);
  background: radial-gradient(circle at 30% 30%, rgba(93,141,255,.26), rgba(28,57,108,.35));
  display: flex;
  align-items: center;
  justify-content: center;
}

.ik-shield {
  width: 36px;
  height: 36px;
  color: #b7cbff;
}

.ik-confirm h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--ik-text-main);
}

.ik-confirm-sub {
  margin: 0;
  font-size: 13px;
  color: var(--ik-text-dim);
}

.ik-confirm-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ik-cg-card {
  background: linear-gradient(160deg, rgba(21, 37, 59, .78), rgba(13, 24, 41, .74));
  border: 1px solid var(--ik-border-soft);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

.ik-cg-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--ik-text-dim);
  font-weight: 700;
  letter-spacing: .7px;
}

.ik-cg-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--ik-text-main);
}

.ik-cg-value.accent {
  color: #cde0ff;
}

.ik-confirm-list {
  width: 100%;
  background: rgba(8, 16, 29, .5);
  border: 1px solid var(--ik-border-soft);
  border-radius: 16px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 230px;
  overflow-y: auto;
}

.ik-cl-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.04);
}

.ik-cl-icon {
  width: 20px;
  height: 20px;
  color: #9ebcff;
  flex-shrink: 0;
}

.ik-cl-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ik-cl-info strong {
  font-size: 13px;
  color: var(--ik-text-main);
}

.ik-cl-info span {
  font-size: 11px;
  color: var(--ik-text-dim);
}

.ik-new-side-card,
.ik-items-grid,
.ik-confirm-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(109, 132, 173, .55) rgba(10, 19, 34, .4);
}

.ik-new-side-card::-webkit-scrollbar,
.ik-items-grid::-webkit-scrollbar,
.ik-confirm-list::-webkit-scrollbar {
  width: 10px;
}

.ik-new-side-card::-webkit-scrollbar-thumb,
.ik-items-grid::-webkit-scrollbar-thumb,
.ik-confirm-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(93,141,255,.55), rgba(47,213,200,.48));
  border-radius: 999px;
}

@media (max-width: 1024px) {
  .ik-new-layout,
  .ik-cols {
    grid-template-columns: 1fr;
  }

  .ik-new-layout .ik-item-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ik-confirm-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .ik-type-grid {
    grid-template-columns: 1fr;
  }

  .ik-new-main-header {
    flex-direction: column;
    align-items: stretch;
  }

  .ik-add-row {
    justify-content: center;
  }

  .ik-new-layout .ik-item-fields,
  .ik-confirm-grid {
    grid-template-columns: 1fr;
  }
}
</style>
