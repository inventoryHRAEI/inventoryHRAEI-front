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
    mode-class="wz-mode-movement"
    @close="close"
    @back="goBack"
    @next="goNext"
    @submit="submit"
  >
    <div v-if="submitError" class="mv-error-banner">
      {{ submitError }}
    </div>

    <!-- Step 0: Dirección -->
    <div v-if="step === 0" class="mv-step fade-in">
      <p class="mv-hint">¿Hacia dónde se moverá el stock?</p>
      <div class="mv-dir-grid">
        <button
          class="mv-dir-btn"
          :class="{ selected: direction === 'subceye-to-biomedica' }"
          @click="direction = 'subceye-to-biomedica'"
        >
          <span class="mv-wh">SUBCEYE</span>
          <svg class="mv-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <span class="mv-wh">Biomédica</span>
        </button>
        <button
          class="mv-dir-btn"
          :class="{ selected: direction === 'biomedica-to-subceye' }"
          @click="direction = 'biomedica-to-subceye'"
        >
          <span class="mv-wh">Biomédica</span>
          <svg class="mv-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <span class="mv-wh">SUBCEYE</span>
        </button>
      </div>
    </div>

    <!-- Step 1: Artículos + Metadatos -->
    <div v-if="step === 1" class="mv-step fade-in">
      <div class="mv-cols">
        <!-- Metadata -->
        <aside class="mv-meta">
          <h3 class="mv-meta-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="mv-meta-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Datos de Control
          </h3>
          <label class="mv-field">
            <span>Responsable *</span>
            <input v-model="meta.responsable" class="mv-input" placeholder="Nombre completo" />
          </label>
          <label class="mv-field">
            <span>Tipo de movimiento</span>
            <select v-model="meta.tipoMovimiento" class="mv-input">
              <option value="regular">Regular (Stock)</option>
              <option value="urgente">Urgente (Urgencias/CEYE)</option>
            </select>
          </label>
          <label class="mv-field">
            <span>Servicio / Área</span>
            <input v-model="meta.servicio" class="mv-input" placeholder="Ej. Subdirección" />
          </label>
          <label class="mv-field">
            <span>Motivo</span>
            <input v-model="meta.motivo" class="mv-input" placeholder="Reposición de stock" />
          </label>
          <label class="mv-field">
            <span>Notas</span>
            <textarea v-model="meta.notas" class="mv-input mv-textarea" rows="2" placeholder="Opcional…"></textarea>
          </label>
        </aside>

        <!-- Items -->
        <div class="mv-items">
          <OrderFilterBar
            title="Búsqueda de bienes"
            subtitle="Ubica bienes por clave, serie, marca, modelo, referencia o lote. Escribe para ver sugerencias."
            :filters="itemSearchFilters"
            :count-label="`Bienes encontrados: ${filteredItems.length}`"
            :suggestions-by-field="itemSearchFilters.suggestionsByField"
            :field-options="ITEM_FIELD_OPTIONS"
          />

          <ItemListVirtual
            :items="filteredItems"
            :quantities="quantities"
            :loading="loadingItems"
            :max-per-item="Infinity"
            :search-scopes="['all', 'clave', 'descripcion', 'marca', 'modelo', 'referencia', 'lote', 'n']"
            :stock-filters="['all', 'with-stock', 'zero-stock']"
            :showSimpleSearch="false"
            placeholder="Buscar por varios términos: drager 15041 brazalete…"
            @update:quantities="quantities = $event"
          />
        </div>
      </div>
    </div>

    <!-- Step 2: Confirmación -->
    <div v-if="step === 2" class="mv-step fade-in">
      <div class="mv-confirm">
        <div class="mv-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="mv-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2>Confirma la Transferencia</h2>
        <p class="mv-confirm-sub">Verifica que los datos sean correctos antes de procesar</p>

        <div class="mv-confirm-grid">
          <div class="mv-cg-card">
            <span class="mv-cg-label">Dirección</span>
            <span class="mv-cg-value">{{ dirLabel }}</span>
          </div>
          <div class="mv-cg-card">
            <span class="mv-cg-label">Responsable</span>
            <span class="mv-cg-value">{{ meta.responsable || '—' }}</span>
          </div>
          <div class="mv-cg-card">
            <span class="mv-cg-label">Artículos</span>
            <span class="mv-cg-value">{{ selectedCount }}</span>
          </div>
          <div class="mv-cg-card">
            <span class="mv-cg-label">Total Unidades</span>
            <span class="mv-cg-value accent">{{ totalUnits }}</span>
          </div>
        </div>

        <div class="mv-confirm-list" v-if="selectedList.length">
          <div v-for="s in selectedList" :key="s.clave" class="mv-cl-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="mv-cl-icon"><path d="M21 8l-2-2H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="2"/></svg>
            <div class="mv-cl-info">
              <strong>{{ s.nombre }}</strong>
              <span>{{ s.qty }} unidades · {{ s.clave }}</span>
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
import OrderFilterBar from '@/components/OrderFilterBar.vue'

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'success']);

const stepLabels = ['Dirección', 'Artículos', 'Confirmación'];

const step       = ref(0);
const direction  = ref(null);
const items      = ref([]);
const quantities = ref({});
const loadingItems = ref(false);
const submitting = ref(false);
const submitError = ref('');
const meta = ref({
  responsable: '',
  tipoMovimiento: 'regular',
  servicio: '',
  motivo: '',
  notas: '',
});

/* Computed titles */
const title = computed(() => {
  if (step.value === 0) return 'Dirección del Movimiento';
  if (step.value === 1) return 'Selecciona Artículos';
  return 'Confirmar Transferencia';
});
const subtitle = computed(() => {
  if (step.value === 0) return '¿De dónde a dónde se moverá el stock?';
  if (step.value === 1) return 'Indica las cantidades a transferir';
  return 'Revisa y confirma la operación';
});

const dirLabel = computed(() => {
  if (direction.value === 'subceye-to-biomedica') return 'SUBCEYE → Biomédica';
  if (direction.value === 'biomedica-to-subceye') return 'Biomédica → SUBCEYE';
  return '—';
});

const selectedCount = computed(() =>
  Object.values(quantities.value).filter(q => Number(q) > 0).length
);
const totalUnits = computed(() =>
  Object.values(quantities.value).reduce((s, q) => s + (Number(q) || 0), 0)
);

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
const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();
const getItemMarca = (item) => String(pickValue(item, ['MARCA', 'Marca', 'marca'], '') || '').trim();
const getItemModelo = (item) => String(pickValue(item, ['MODELO', 'Modelo', 'modelo'], '') || '').trim();
const getItemReferencia = (item) => String(pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], '') || '').trim();
const getItemLote = (item) => String(pickValue(item, ['LOTE', 'Lote', 'lote'], '') || '').trim();
const getItemSerie = (item) => String(pickValue(item, ['N', 'n', 'Número de serie', 'Numero de serie', 'id'], '') || '').trim();
const getItemNoInventario = (item) => String(pickValue(item, ['No DE INVENTARIO', 'No. Inventario', 'NO INVENTARIO', 'no_inventario', 'numero_inventario'], '') || '').trim();
const getItemUbicacion = (item) => String(pickValue(item, ['UBICACION ESPECIFICA', 'Ubicacion especifica', 'Ubicación específica', 'UBICACION', 'ubicacion'], '') || '').trim();
const getItemOrigen = (item) => String(pickValue(item, ['ORIGEN DEL BIEN', 'Origen del bien', 'origen', 'origen_bien'], '') || '').trim();

const buildItemDescriptor = (item) => {
  const name = getItemName(item)
  const clave = getItemClave(item)
  const marca = getItemMarca(item)
  const modelo = getItemModelo(item)
  const referencia = getItemReferencia(item)
  const lote = getItemLote(item)
  const serie = getItemSerie(item)
  const noInventario = getItemNoInventario(item)
  const ubicacion = getItemUbicacion(item)
  const origen = getItemOrigen(item)
  const parts = [
    name,
    clave ? `Clave: ${clave}` : '',
    noInventario ? `Inventario: ${noInventario}` : '',
    ubicacion ? `Ubicación: ${ubicacion}` : '',
    marca ? `Marca: ${marca}` : '',
    modelo ? `Modelo: ${modelo}` : '',
    referencia ? `Ref: ${referencia}` : '',
    lote ? `Lote: ${lote}` : '',
    serie ? `Serie: ${serie}` : '',
    origen ? `Origen: ${origen}` : ''
  ].filter(Boolean)
  return parts.join(' · ')
}

const buildItemSearchText = (item) => {
  return normalizeText([
    getItemName(item),
    getItemClave(item),
    getItemMarca(item),
    getItemModelo(item),
    getItemReferencia(item),
    getItemLote(item),
    getItemSerie(item),
    getItemNoInventario(item),
    getItemUbicacion(item),
    getItemOrigen(item)
  ].join(' '))
}

const selectedList = computed(() => {
  return Object.entries(quantities.value)
    .filter(([, q]) => Number(q) > 0)
    .map(([itemId, qty]) => {
      const item = items.value.find(i => getItemId(i) === itemId);
      const clave = item ? getItemClave(item) : itemId;
      return { clave, qty: Number(qty), nombre: item ? getItemName(item) : itemId };
    });
});

// --- Item search + filter bindings (OrderFilterBar integration) ---
const filterClave = ref('')
const filterDescripcion = ref('')
const filterMarca = ref('')
const filterModelo = ref('')
const filterReferencia = ref('')
const filterLote = ref('')
const filterN = ref('')
const filterNoInventario = ref('')
const filterUbicacion = ref('')
const filterStockMin = ref(null)
const filterStockMax = ref(null)

const activeFilterKeys = ref(new Set())

const ITEM_FIELD_OPTIONS = [
  { key: 'clave', label: 'Clave HRAEI', placeholder: 'Ej. COMODATO', type: 'text' },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Nombre, modelo, serie...', type: 'text' },
  { key: 'marca', label: 'Marca', placeholder: 'Ej. Philips', type: 'text' },
  { key: 'modelo', label: 'Modelo', placeholder: 'Ej. MX40', type: 'text' },
  { key: 'referencia', label: 'Referencia', placeholder: 'Referencia interna', type: 'text' },
  { key: 'lote', label: 'Lote', placeholder: 'Ej. L123', type: 'text' },
  { key: 'n', label: 'N / Serie', placeholder: 'Número de serie', type: 'text' },
  { key: 'noInventario', label: 'No. inventario', placeholder: 'Ej. 12345', type: 'text' },
  { key: 'ubicacion', label: 'Ubicación', placeholder: 'Ej. UCIA', type: 'text' },
  { key: 'stockMin', label: 'Stock mínimo', placeholder: 'Mínimo', type: 'number' },
  { key: 'stockMax', label: 'Stock máximo', placeholder: 'Máximo', type: 'number' }
]

const activeFiltersList = computed(() => {
  const list = []
  const pushIf = (key, label, binding) => {
    const val = binding && typeof binding === 'object' && 'value' in binding ? binding.value : binding
    if (activeFilterKeys.value.has(key) || (val !== null && val !== undefined && String(val).trim() !== '')) {
      list.push({ key, label, bindings: { modelValue: binding } })
    }
  }
  pushIf('clave', 'Clave HRAEI', filterClave)
  pushIf('descripcion', 'Descripción', filterDescripcion)
  pushIf('marca', 'Marca', filterMarca)
  pushIf('modelo', 'Modelo', filterModelo)
  pushIf('referencia', 'Referencia', filterReferencia)
  pushIf('lote', 'Lote', filterLote)
  pushIf('n', 'N / Serie', filterN)
  pushIf('noInventario', 'No. inventario', filterNoInventario)
  pushIf('ubicacion', 'Ubicación', filterUbicacion)
  pushIf('stockMin', 'Stock mínimo', filterStockMin)
  pushIf('stockMax', 'Stock máximo', filterStockMax)
  return list
})

const chipsList = computed(() => {
  const chips = []
  if (filterClave.value) chips.push({ key: 'clave', label: 'Clave HRAEI', value: filterClave.value, bindings: { modelValue: filterClave } })
  if (filterDescripcion.value) chips.push({ key: 'descripcion', label: 'Descripción', value: filterDescripcion.value, bindings: { modelValue: filterDescripcion } })
  if (filterMarca.value) chips.push({ key: 'marca', label: 'Marca', value: filterMarca.value, bindings: { modelValue: filterMarca } })
  if (filterModelo.value) chips.push({ key: 'modelo', label: 'Modelo', value: filterModelo.value, bindings: { modelValue: filterModelo } })
  if (filterReferencia.value) chips.push({ key: 'referencia', label: 'Referencia', value: filterReferencia.value, bindings: { modelValue: filterReferencia } })
  if (filterLote.value) chips.push({ key: 'lote', label: 'Lote', value: filterLote.value, bindings: { modelValue: filterLote } })
  if (filterN.value) chips.push({ key: 'n', label: 'N / Serie', value: filterN.value, bindings: { modelValue: filterN } })
  if (filterNoInventario.value) chips.push({ key: 'noInventario', label: 'No. inventario', value: filterNoInventario.value, bindings: { modelValue: filterNoInventario } })
  if (filterUbicacion.value) chips.push({ key: 'ubicacion', label: 'Ubicación', value: filterUbicacion.value, bindings: { modelValue: filterUbicacion } })
  if (filterStockMin.value !== null && filterStockMin.value !== undefined) chips.push({ key: 'stockMin', label: 'Stock mínimo', value: filterStockMin.value, bindings: { modelValue: filterStockMin } })
  if (filterStockMax.value !== null && filterStockMax.value !== undefined) chips.push({ key: 'stockMax', label: 'Stock máximo', value: filterStockMax.value, bindings: { modelValue: filterStockMax } })
  return chips
})

const hasActiveFilters = computed(() => activeFiltersList.value.length > 0 || chipsList.value.length > 0)

function activateFilter(key) {
  activeFilterKeys.value.add(key)
}

function removeFilter(key) {
  activeFilterKeys.value.delete(key)
  // clear bound value when removing
  if (key === 'clave') filterClave.value = ''
  else if (key === 'descripcion') filterDescripcion.value = ''
  else if (key === 'marca') filterMarca.value = ''
  else if (key === 'modelo') filterModelo.value = ''
  else if (key === 'referencia') filterReferencia.value = ''
  else if (key === 'lote') filterLote.value = ''
  else if (key === 'n') filterN.value = ''
  else if (key === 'noInventario') filterNoInventario.value = ''
  else if (key === 'ubicacion') filterUbicacion.value = ''
  else if (key === 'stockMin') filterStockMin.value = null
  else if (key === 'stockMax') filterStockMax.value = null
}

function clearAllFilters() {
  activeFilterKeys.value.clear()
  filterClave.value = ''
  filterDescripcion.value = ''
  filterMarca.value = ''
  filterModelo.value = ''
  filterReferencia.value = ''
  filterLote.value = ''
  filterN.value = ''
  filterNoInventario.value = ''
  filterUbicacion.value = ''
  filterStockMin.value = null
  filterStockMax.value = null
}

const suggestionsByField = computed(() => {
  const buckets = {}
  const list = Array.isArray(items.value) ? items.value : []
  const addBucket = (key, values, limit = 5000) => {
    const map = new Map()
    for (const raw of values) {
      const value = String(raw || '').trim()
      if (!value) continue
      const normalized = normalizeText(value)
      if (!normalized) continue
      const existing = map.get(normalized)
      if (existing) existing.count += 1
      else map.set(normalized, { value, label: value, count: 1 })
    }
    buckets[key] = Array.from(map.values()).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)).slice(0, limit)
  }

  addBucket('clave', list.map(i => getItemClave(i)))
  addBucket('descripcion', list.map(i => buildItemDescriptor(i)))
  addBucket('marca', list.map(i => pickValue(i, ['MARCA', 'Marca', 'marca'])))
  addBucket('modelo', list.map(i => pickValue(i, ['MODELO', 'Modelo', 'modelo'])))
  addBucket('referencia', list.map(i => pickValue(i, ['REFERENCIA', 'Referencia', 'referencia'])))
  addBucket('lote', list.map(i => pickValue(i, ['LOTE', 'Lote', 'lote'])))
  addBucket('n', list.map(i => pickValue(i, ['N', 'n'])))
  addBucket('noInventario', list.map(i => getItemNoInventario(i)))
  addBucket('ubicacion', list.map(i => getItemUbicacion(i)))
  addBucket('stock', list.map(i => {
    const s = pickValue(i, ['TOTAL EXISTENCIAS', 'total_existencias', 'Cantidad', 'cantidad'], '')
    return s
  }))
  return buckets
})

const itemSearchFilters = {
  fieldBindings: {
    clave: filterClave,
    descripcion: filterDescripcion,
    marca: filterMarca,
    modelo: filterModelo,
    referencia: filterReferencia,
    lote: filterLote,
    n: filterN,
    noInventario: filterNoInventario,
    ubicacion: filterUbicacion,
    stockMin: filterStockMin,
    stockMax: filterStockMax
  },
  activeFiltersList,
  chipsList,
  hasActiveFilters,
  clearAllFilters,
  removeFilter,
  activateFilter,
  suggestionsByField
}

const filteredItems = computed(() => {
  let r = Array.isArray(items.value) ? items.value.slice() : []
  const q = normalizeText(String(filterDescripcion.value || '').trim())
  if (filterClave.value) {
    const s = String(filterClave.value).toLowerCase()
    r = r.filter(it => String(getItemClave(it) || '').toLowerCase().includes(s))
  }
  if (filterDescripcion.value) {
    const s = q
    r = r.filter(it => {
      const descriptor = normalizeText(buildItemDescriptor(it))
      const searchable = buildItemSearchText(it)
      return descriptor.includes(s) || searchable.includes(s)
    })
  }
  if (filterMarca.value) {
    const s = String(filterMarca.value).toLowerCase()
    r = r.filter(it => String(pickValue(it, ['MARCA', 'Marca', 'marca']) || '').toLowerCase().includes(s))
  }
  if (filterModelo.value) {
    const s = String(filterModelo.value).toLowerCase()
    r = r.filter(it => String(pickValue(it, ['MODELO', 'Modelo', 'modelo']) || '').toLowerCase().includes(s))
  }
  if (filterReferencia.value) {
    const s = String(filterReferencia.value).toLowerCase()
    r = r.filter(it => String(pickValue(it, ['REFERENCIA', 'Referencia', 'referencia']) || '').toLowerCase().includes(s))
  }
  if (filterLote.value) {
    const s = String(filterLote.value).toLowerCase()
    r = r.filter(it => String(pickValue(it, ['LOTE', 'Lote', 'lote']) || '').toLowerCase().includes(s))
  }
  if (filterN.value) {
    const s = String(filterN.value).toLowerCase()
    r = r.filter(it => String(pickValue(it, ['N', 'n', 'Número de serie', 'Numero de serie', 'id']) || '').toLowerCase().includes(s))
  }
  if (filterNoInventario.value) {
    const s = String(filterNoInventario.value).toLowerCase()
    r = r.filter(it => String(getItemNoInventario(it) || '').toLowerCase().includes(s))
  }
  if (filterUbicacion.value) {
    const s = String(filterUbicacion.value).toLowerCase()
    r = r.filter(it => String(getItemUbicacion(it) || '').toLowerCase().includes(s))
  }
  const parseNumber = v => (v === null || v === undefined || v === '') ? null : Number(v)
  const min = parseNumber(filterStockMin.value)
  const max = parseNumber(filterStockMax.value)
  if (min !== null) r = r.filter(it => {
    const s = Number(pickValue(it, ['TOTAL EXISTENCIAS', 'total_existencias', 'Cantidad', 'cantidad'], 0)) || 0
    return s >= min
  })
  if (max !== null) r = r.filter(it => {
    const s = Number(pickValue(it, ['TOTAL EXISTENCIAS', 'total_existencias', 'Cantidad', 'cantidad'], 0)) || 0
    return s <= max
  })
  return r
})

/* Navigation guards */
const canNext = computed(() => {
  if (step.value === 0) return !!direction.value;
  if (step.value === 1) return selectedCount.value > 0 && !!meta.value.responsable;
  return true;
});
const canFinish = computed(() => selectedCount.value > 0 && !!meta.value.responsable);

/* Load items when direction chosen */
const loadItems = async () => {
  loadingItems.value = true;
  try {
    const warehouse = direction.value === 'subceye-to-biomedica' ? 'subceye' : 'biomedica';
    const res = await fetch(`/api/ops/stock-biomedica?bodega=${warehouse}`);
    if (res.ok) {
      const data = await res.json();
      items.value = Array.isArray(data) ? data : (data.data || []);
    } else {
      items.value = [];
    }
  } catch { items.value = []; }
  finally { loadingItems.value = false; }
};

/* Steps */
const goNext = () => {
  if (step.value === 0 && direction.value) {
    loadItems();
    step.value = 1;
  } else if (step.value < 2) {
    step.value++;
  }
};
const goBack = () => {
  if (step.value > 0) step.value--;
};

/* Reset on close/open */
const resetState = () => {
  step.value = 0;
  direction.value = null;
  items.value = [];
  quantities.value = {};
  submitting.value = false;
  submitError.value = '';
  meta.value = { responsable: '', tipoMovimiento: 'regular', servicio: '', motivo: '', notas: '' };
};

const close = () => { emit('close'); resetState(); };

watch(() => props.open, (v) => { if (v) resetState(); });

/* Submit */
const submit = async () => {
  submitError.value = '';
  submitting.value = true;
  try {
    const itemsToMove = Object.entries(quantities.value)
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
          n: item ? String(pickValue(item, ['N', 'n', 'id'], '') || '').trim() : '',
          cantidad: Number(cantidad)
        };
      });
    if (!itemsToMove.length) throw new Error('Selecciona artículos');

    let desde = 'OFICINA', hacia = 'SUBCEYE';
    if (direction.value === 'subceye-to-biomedica') { desde = 'SUBCEYE'; hacia = 'OFICINA'; }
    else { desde = 'OFICINA'; hacia = 'SUBCEYE'; }

    const body = { desde, hacia, items: itemsToMove, metadata: { ...meta.value } };
    const res = await fetch('/api/ops/inventory/warehouse-movement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.msg || data.error || 'La transferencia falló');
    emit('success');
    close();
  } catch (err) {
    const detail = String(err?.message || 'No se pudo completar el movimiento entre bodegas');
    submitError.value = `Movimiento entre bodegas no completado: ${detail}`;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.fade-in { animation: mvFadeIn .3s ease-out; }
@keyframes mvFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.mv-step { flex: 1; min-height: 0; display: flex; flex-direction: column; }

.mv-error-banner {
  margin-bottom: 12px;
  border: 1px solid rgba(248, 113, 113, .35);
  background: rgba(127, 29, 29, .35);
  color: #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}

/* --- Step 0: Direction --- */
.mv-hint { font-size: 14px; color: rgba(255,255,255,.45); margin: 0 0 20px; }

.mv-dir-grid { display: flex; flex-direction: column; gap: 14px; }

.mv-dir-btn {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 22px 28px;
  background: rgba(255,255,255,.03);
  border: 1.5px solid rgba(255,255,255,.08);
  border-radius: 16px;
  cursor: pointer; color: #e0e7ff;
  font-family: inherit; font-size: 15px;
  transition: all .2s ease;
}
.mv-dir-btn:hover { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.15); }
.mv-dir-btn.selected {
  background: rgba(96,165,250,.08);
  border-color: rgba(96,165,250,.4);
  box-shadow: 0 0 20px rgba(96,165,250,.1);
}

.mv-wh { font-weight: 700; font-size: 16px; }
.mv-arrow { width: 22px; height: 22px; color: rgba(255,255,255,.3); flex-shrink: 0; }
.mv-dir-btn.selected .mv-arrow { color: #60a5fa; }

/* --- Step 1: Two-column layout --- */
.mv-cols {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  flex: 1; min-height: 0;
}

.mv-meta {
  display: flex; flex-direction: column; gap: 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 18px;
  padding: 20px;
  overflow-y: auto;
}
.mv-meta-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .5px;
  color: rgba(255,255,255,.5);
  margin: 0 0 4px;
}
.mv-meta-icon { width: 18px; height: 18px; }

.mv-field {
  display: flex; flex-direction: column; gap: 5px;
}
.mv-field span {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .8px;
  color: rgba(255,255,255,.35);
}
.mv-input {
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff; font-size: 14px;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
  outline: none;
  width: 100%;
}
.mv-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96,165,250,.1);
}
.mv-textarea { resize: none; }

select.mv-input {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
select.mv-input option {
  background: #1a1e2e;
  color: #e0e7ff;
}

.mv-items {
  display: flex; flex-direction: column;
  min-height: 0;
  overflow: visible;
}

/* --- Step 2: Confirmation --- */
.mv-confirm {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 8px 0;
  overflow-y: auto; flex: 1; min-height: 0;
}
.mv-confirm-icon {
  width: 72px; height: 72px;
  background: rgba(96,165,250,.08);
  border: 1px solid rgba(96,165,250,.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.mv-shield { width: 36px; height: 36px; color: #60a5fa; }

.mv-confirm h2 { margin: 0; font-size: 22px; font-weight: 800; color: #f0f7ff; }
.mv-confirm-sub { margin: 0; font-size: 13px; color: rgba(255,255,255,.4); }

.mv-confirm-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  width: 100%;
}
.mv-cg-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 14px;
  padding: 14px; display: flex; flex-direction: column; gap: 4px;
}
.mv-cg-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,.35); font-weight: 700; letter-spacing: .5px; }
.mv-cg-value { font-size: 15px; font-weight: 700; color: #fff; }
.mv-cg-value.accent { color: #60a5fa; }

.mv-confirm-list {
  width: 100%;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 16px;
  padding: 8px;
  display: flex; flex-direction: column; gap: 4px;
  max-height: 220px; overflow-y: auto;
}
.mv-cl-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 14px;
  background: rgba(255,255,255,.02);
  border-radius: 10px;
}
.mv-cl-icon { width: 20px; height: 20px; color: #60a5fa; flex-shrink: 0; }
.mv-cl-info { display: flex; flex-direction: column; }
.mv-cl-info strong { font-size: 13px; color: rgba(255,255,255,.85); }
.mv-cl-info span { font-size: 11px; color: rgba(255,255,255,.35); }

@media (max-width: 700px) {
  .mv-cols { grid-template-columns: 1fr; }
  .mv-confirm-grid { grid-template-columns: 1fr 1fr; }
}
</style>
