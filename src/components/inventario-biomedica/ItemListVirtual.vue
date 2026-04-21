<template>
  <div class="il-root">
    <!-- Search -->
    <template v-if="showSimpleSearch">
      <div class="il-search" :class="{ focused: searchFocused }">
      <svg class="il-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        ref="inputRef"
        v-model="localQuery"
        type="text"
        :placeholder="placeholder"
        class="il-search-input"
        @focus="searchFocused = true"
        @blur="searchFocused = false"
      />
      <button v-if="localQuery" class="il-search-clear" @click="localQuery = ''">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="il-filters">
      <label class="il-scope-wrap">
        <span class="il-scope-label">Buscar en</span>
        <select v-model="searchScope" class="il-scope-select">
          <option v-for="option in scopeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <div class="il-stock-filters" v-if="stockFilterOptions.length">
        <button
          v-for="option in stockFilterOptions"
          :key="option.value"
          class="il-chip"
          :class="{ active: stockFilter === option.value }"
          @click="stockFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="il-table-filter-wrap">
        <button class="il-table-filter-btn" :class="{ active: showTableFilter || appliedColumnFilters.size > 0 }" @click="toggleTableFilter">
          Filtrar
          <span v-if="appliedColumnFilters.size > 0" class="il-table-filter-badge">{{ appliedColumnFilters.size }}</span>
        </button>

        <div v-if="showTableFilter" class="il-table-filter-panel">
          <div class="il-table-filter-head">
            <strong>Filtrar: {{ (tableFilterFieldOptions.find(o => o.value === tableFilterField)?.label || 'Columna') }}</strong>
            <button class="il-table-filter-close" @click="showTableFilter = false">✕</button>
          </div>

          <div class="il-table-filter-row">
            <label class="il-table-filter-label">Columna</label>
            <select v-model="tableFilterField" class="il-scope-select">
              <option v-for="option in tableFilterFieldOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="il-table-filter-row">
            <label class="il-table-filter-label">Buscar valor</label>
            <input
              v-model="tableFilterValueSearch"
              type="text"
              class="il-table-filter-input"
              placeholder="Buscar valores..."
            />
          </div>

          <div class="il-table-filter-actions">
            <button class="il-table-filter-mini" @click="selectAllDraftValues">Todos</button>
            <button class="il-table-filter-mini" @click="clearDraftValues">Ninguno</button>
          </div>

          <div class="il-table-filter-values">
            <label v-for="entry in filteredValueEntries" :key="entry.valueKey" class="il-table-filter-check">
              <input
                type="checkbox"
                :checked="draftValueFilters.includes(entry.valueKey)"
                @change="toggleDraftValue(entry.valueKey, $event.target.checked)"
              />
              <span class="il-table-filter-value">{{ entry.valueLabel }}</span>
              <span class="il-table-filter-count">{{ entry.count }}</span>
            </label>
          </div>

          <div class="il-table-filter-footer">
            <button class="il-table-filter-clear" @click="clearAppliedValueFilters">Limpiar este filtro</button>
            <button v-if="appliedColumnFilters.size > 0" class="il-table-filter-clear-all" @click="clearAllFilters">Limpiar todos</button>
            <button class="il-table-filter-apply" @click="applyValueFilters">Aplicar</button>
          </div>
        </div>
      </div>
    </div>

    <p class="il-query-hint">
      Usa términos combinados para filtrar: <strong>marca modelo lote</strong> (ej. <strong>drager 15041</strong>)
    </p>
  </template>

    <!-- Stats bar -->
    <div class="il-stats">
      <span class="il-stat">
        <span class="il-stat-num">{{ filtered.length }}</span> encontrados
      </span>
      <span class="il-stat-sep">·</span>
      <span class="il-stat il-stat-accent">
        <span class="il-stat-num">{{ selectedCount }}</span> seleccionados
      </span>
      <span class="il-stat-sep">·</span>
      <span class="il-stat il-stat-accent">
        <span class="il-stat-num">{{ totalUnits }}</span> unidades
      </span>
    </div>

    <!-- List -->
    <div v-if="loading" class="il-loading">
      <div class="il-shimmer" v-for="i in 5" :key="i"></div>
    </div>

    <div
      v-else-if="visible.length > 0"
      ref="listRef"
      class="il-list"
      @scroll.passive="onScroll"
    >
      <div
        v-for="item in visible"
        :key="getItemId(item)"
        class="il-row"
        :class="{ active: getQty(item) > 0 }"
      >
        <div class="il-info">
          <span class="il-name">{{ getItemName(item) }}</span>
          <div class="il-tags">
            <span class="il-tag-code">Clave: {{ getItemClave(item) }}</span>
            <span class="il-tag-stock">Total: {{ getItemStock(item) }}</span>
            <span v-if="getItemStockSubceye(item) !== null" class="il-tag-warehouse">SUBCEYE: {{ getItemStockSubceye(item) }}</span>
            <span v-if="getItemStockOficina(item) !== null" class="il-tag-warehouse">OFICINA: {{ getItemStockOficina(item) }}</span>
          </div>
          <div class="il-details">
            <span
              v-for="detail in getItemMetaParts(item)"
              :key="`${getItemId(item)}-${detail.key}`"
              class="il-detail-pill"
            >
              <strong>{{ detail.label }}:</strong> {{ detail.value }}
            </span>
          </div>
        </div>
        <div class="il-qty">
          <button
            v-if="allowFastStep"
            class="il-btn il-btn-fast"
            @click="step(item, -fastAmount)"
          >{{ fastLabel('-') }}</button>
          <button class="il-btn" @click="step(item, -1)">−</button>
          <input
            class="il-qty-input"
            type="text"
            inputmode="numeric"
            :value="getQty(item)"
            @input="onInput(item, $event)"
            @blur="onBlur(item, $event)"
            @keydown.enter="$event.target.blur()"
          />
          <button class="il-btn" @click="step(item, 1)">+</button>
          <button
            v-if="allowFastStep"
            class="il-btn il-btn-fast"
            @click="step(item, fastAmount)"
          >{{ fastLabel('+') }}</button>
        </div>
      </div>

      <!-- Sentinel for infinite scroll -->
      <div v-if="visible.length < filtered.length" class="il-more">
        Mostrando {{ visible.length }} de {{ filtered.length }}…
      </div>
    </div>

    <div v-else class="il-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="il-empty-icon">
        <path d="M21 8l-2-2H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="2"/><line x1="12" y1="12" x2="12" y2="16"/>
      </svg>
      <p>{{ items.length > 0 ? 'Sin resultados para tu búsqueda' : 'Sin artículos disponibles' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  items:         { type: Array,   default: () => [] },
  quantities:    { type: Object,  default: () => ({}) },
  loading:       { type: Boolean, default: false },
  placeholder:   { type: String,  default: 'Buscar por nombre o clave…' },
  showSimpleSearch: { type: Boolean, default: true },
  maxPerItem:    { type: Number,  default: null },       // null = sin límite
  allowFastStep: { type: Boolean, default: false },
  fastAmount:    { type: Number,  default: 5 },
  searchScopes:  { type: Array,   default: () => ['all', 'clave', 'descripcion', 'marca', 'modelo', 'referencia', 'lote', 'n', 'caducidad', 'unidad'] },
  stockFilters:  { type: Array,   default: () => ['all', 'with-stock', 'zero-stock'] },
});

const emit = defineEmits(['update:quantities']);

const CHUNK = 40;
const DEBOUNCE_MS = 180;

const localQuery   = ref('');
const debouncedQ   = ref('');
const visibleCount = ref(CHUNK);
const searchFocused = ref(false);
const listRef      = ref(null);
const inputRef     = ref(null);
const searchScope  = ref('all');
const stockFilter  = ref('all');
const showTableFilter = ref(false);
const tableFilterField = ref('clave');
const tableFilterValueSearch = ref('');
const draftValueFilters = ref([]);
// Cambio: ahora es un Map de field -> valores para soportar múltiples filtros simultáneamente
const appliedColumnFilters = ref(new Map());

const scopeLabelMap = {
  all: 'Todo',
  clave: 'Clave',
  descripcion: 'Descripción',
  marca: 'Marca',
  modelo: 'Modelo',
  referencia: 'Referencia',
  lote: 'Lote',
  n: 'N',
  caducidad: 'Caducidad',
  unidad: 'Unidad'
};

const stockLabelMap = {
  all: 'Todos',
  'with-stock': 'Con stock',
  'zero-stock': 'Sin stock'
};

const scopeOptions = computed(() => {
  const values = Array.isArray(props.searchScopes) && props.searchScopes.length ? props.searchScopes : ['all'];
  return values.map(v => ({ value: v, label: scopeLabelMap[v] || String(v) }));
});

const tableFilterFieldOptions = computed(() => {
  return scopeOptions.value.filter(option => option.value !== 'all');
});

const stockFilterOptions = computed(() => {
  const values = Array.isArray(props.stockFilters) && props.stockFilters.length ? props.stockFilters : ['all'];
  return values.map(v => ({ value: v, label: stockLabelMap[v] || String(v) }));
});

watch(scopeOptions, (options) => {
  const allowed = new Set(options.map(o => o.value));
  if (!allowed.has(searchScope.value)) {
    searchScope.value = options[0]?.value || 'all';
  }
}, { immediate: true });

watch(stockFilterOptions, (options) => {
  const allowed = new Set(options.map(o => o.value));
  if (!allowed.has(stockFilter.value)) {
    stockFilter.value = options[0]?.value || 'all';
  }
}, { immediate: true });

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

const getItemName = (item) => pickValue(item, ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN ARTÍCULO', 'descripcion', 'NOMBRE'], '—');
const getItemClave = (item) => pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], '—');
const cleanDisplayValue = (value) => {
  const text = String(value ?? '').trim();
  if (!text || text === '—' || text === '-' || text === '(VACÍO)') return '';
  return text;
};
const getItemSerie = (item) => cleanDisplayValue(pickValue(item, ['N', 'n', 'Número de serie', 'Numero de serie', 'id'], ''));
const getItemMarca = (item) => cleanDisplayValue(pickValue(item, ['MARCA', 'Marca', 'marca'], ''));
const getItemModelo = (item) => cleanDisplayValue(pickValue(item, ['MODELO', 'Modelo', 'modelo'], ''));
const getItemReferencia = (item) => cleanDisplayValue(pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], ''));
const getItemLote = (item) => cleanDisplayValue(pickValue(item, ['LOTE', 'Lote', 'lote'], ''));
const getItemCaducidad = (item) => cleanDisplayValue(pickValue(item, ['CADUCIDAD', 'Caducidad', 'caducidad'], ''));
const getItemUnidad = (item) => cleanDisplayValue(pickValue(item, ['Unidad de medida (presentación)', 'Unidad de medida (presentacion)', 'Unidad', 'unidad'], ''));
const getItemNoInventario = (item) => cleanDisplayValue(pickValue(item, ['No DE INVENTARIO', 'No. Inventario', 'NO INVENTARIO', 'no_inventario', 'numero_inventario'], ''));
const getItemUbicacion = (item) => cleanDisplayValue(pickValue(item, ['UBICACION ESPECIFICA', 'Ubicacion especifica', 'Ubicación específica', 'UBICACION', 'ubicacion'], ''));
const getItemOrigen = (item) => cleanDisplayValue(pickValue(item, ['ORIGEN DEL BIEN', 'Origen del bien', 'origen', 'origen_bien'], ''));

const getItemStockByAliases = (item, aliases = []) => {
  const raw = pickValue(item, aliases, '');
  if (raw === '' || raw === null || raw === undefined) return null;
  const parsed = parseInt(raw, 10);
  if (Number.isFinite(parsed)) return parsed;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

const getItemStockSubceye = (item) => getItemStockByAliases(item, ['Existencia SUBCEYE IB', 'Existencia SUBCEYE', 'existencia_subceye']);
const getItemStockOficina = (item) => getItemStockByAliases(item, [' Almacén IB (OFICINA)', 'Almacén IB (OFICINA)', 'existencia_oficina']);

const getItemMetaParts = (item) => {
  return [
    { key: 'serie', label: 'Serie', value: getItemSerie(item) },
    { key: 'inventario', label: 'Inventario', value: getItemNoInventario(item) },
    { key: 'ubicacion', label: 'Ubicación', value: getItemUbicacion(item) },
    { key: 'marca', label: 'Marca', value: getItemMarca(item) },
    { key: 'modelo', label: 'Modelo', value: getItemModelo(item) },
    { key: 'referencia', label: 'Ref', value: getItemReferencia(item) },
    { key: 'lote', label: 'Lote', value: getItemLote(item) },
    { key: 'origen', label: 'Origen', value: getItemOrigen(item) },
    { key: 'caducidad', label: 'Cad', value: getItemCaducidad(item) },
    { key: 'unidad', label: 'Unidad', value: getItemUnidad(item) }
  ].filter(part => part.value);
};
const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const fieldAliasMap = {
  clave: 'clave',
  code: 'clave',
  codigo: 'clave',
  descripcion: 'descripcion',
  desc: 'descripcion',
  nombre: 'descripcion',
  marca: 'marca',
  modelo: 'modelo',
  referencia: 'referencia',
  ref: 'referencia',
  lote: 'lote',
  n: 'n',
  serie: 'n',
  stock: 'stock',
  existencia: 'stock',
  caducidad: 'caducidad',
  cad: 'caducidad',
  unidad: 'unidad',
};

const tokenizeQuery = (query = '') => {
  const matches = String(query || '').match(/"[^"]+"|\S+/g) || [];
  return matches.map((token) => token.replace(/^"|"$/g, '').trim()).filter(Boolean);
};

const getFieldValue = (item, field) => {
  const fields = {
    clave: getItemClave(item),
    descripcion: getItemName(item),
    marca: pickValue(item, ['MARCA', 'Marca', 'marca'], ''),
    modelo: pickValue(item, ['MODELO', 'Modelo', 'modelo'], ''),
    referencia: pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], ''),
    lote: pickValue(item, ['LOTE', 'Lote', 'lote'], ''),
    n: pickValue(item, ['N', 'n', 'Número de serie', 'Numero de serie', 'id'], ''),
    caducidad: pickValue(item, ['CADUCIDAD', 'Caducidad', 'caducidad'], ''),
    unidad: pickValue(item, ['Unidad de medida (presentación)', 'Unidad de medida (presentacion)', 'Unidad', 'unidad'], ''),
  };
  return normalizeText(fields[field] || '');
};

const getFieldDisplayValue = (item, field) => {
  const values = {
    clave: getItemClave(item),
    descripcion: getItemName(item),
    marca: pickValue(item, ['MARCA', 'Marca', 'marca'], ''),
    modelo: pickValue(item, ['MODELO', 'Modelo', 'modelo'], ''),
    referencia: pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], ''),
    lote: pickValue(item, ['LOTE', 'Lote', 'lote'], ''),
    n: pickValue(item, ['N', 'n', 'Número de serie', 'Numero de serie', 'id'], ''),
    caducidad: pickValue(item, ['CADUCIDAD', 'Caducidad', 'caducidad'], ''),
    unidad: pickValue(item, ['Unidad de medida (presentación)', 'Unidad de medida (presentacion)', 'Unidad', 'unidad'], ''),
  };
  const raw = String(values[field] || '').trim();
  return raw || '(VACÍO)';
};

// Base filtered dataset: búsqueda + stock filter (SIN los filtros de columna aplicados aún)
const baseFiltered = computed(() => {
  let r = props.items;
  const q = debouncedQ.value;
  if (q) {
    const { globalTerms, fieldTerms } = parseAdvancedQuery(q);
    r = r.filter(i => {
      if (fieldTerms.length && !fieldTerms.every(term => matchesFieldTerm(i, term))) {
        return false;
      }
      if (!globalTerms.length) return true;
      const haystack = getSearchValueByScope(i, searchScope.value);
      return globalTerms.every(term => haystack.includes(term));
    });
  }

  if (stockFilter.value === 'with-stock') {
    r = r.filter(i => getItemStock(i) > 0);
  } else if (stockFilter.value === 'zero-stock') {
    r = r.filter(i => getItemStock(i) === 0);
  }

  return r;
});

// Intermediate: apply current column filters to base, to get options for OTHER filters
// (allows chaining: filter by marca, THEN filter by modelo on the remaining results)
const baseWithAppliedFilters = computed(() => {
  let r = baseFiltered.value;

  // Apply ALL active column filters (not just the current one being edited)
  // This enables filtering by marca AND modelo AND lote simultaneously
  for (const [fieldName, valueKeys] of appliedColumnFilters.value.entries()) {
    if (!Array.isArray(valueKeys) || valueKeys.length === 0) continue;
    const selected = new Set(valueKeys);
    r = r.filter(item => {
      const valueKey = normalizeText(getFieldDisplayValue(item, fieldName));
      return selected.has(valueKey);
    });
  }

  return r;
});

// Derive distinct values for the current column selector, respecting already-applied filters
const valueEntries = computed(() => {
  const counts = new Map();
  // Use baseWithAppliedFilters so that if user already filtered by "marca",
  // the options shown for "modelo" are only from items matching that marca.
  // This creates the chaining/stacking behavior the user requested.
  for (const item of baseWithAppliedFilters.value) {
    const valueLabel = getFieldDisplayValue(item, tableFilterField.value);
    const valueKey = normalizeText(valueLabel);
    const current = counts.get(valueKey) || { valueKey, valueLabel, count: 0 };
    current.count += 1;
    counts.set(valueKey, current);
  }

  return [...counts.values()].sort((a, b) => {
    if (a.valueLabel === '(VACÍO)') return -1;
    if (b.valueLabel === '(VACÍO)') return 1;
    return a.valueLabel.localeCompare(b.valueLabel);
  });
});

// Search/filter the displayed value options by user's search term in the panel
const filteredValueEntries = computed(() => {
  const term = normalizeText(tableFilterValueSearch.value);
  if (!term) return valueEntries.value;
  return valueEntries.value.filter(entry => normalizeText(entry.valueLabel).includes(term));
});

watch(tableFilterField, (field) => {
  tableFilterValueSearch.value = '';
  // Cargar el draft con los valores ya aplicados para este campo (si existen)
  const existing = appliedColumnFilters.value.get(field);
  draftValueFilters.value = existing ? [...existing] : [];
}, { immediate: true });

const toggleTableFilter = () => {
  showTableFilter.value = !showTableFilter.value;
  if (showTableFilter.value) {
    const existing = appliedColumnFilters.value.get(tableFilterField.value);
    draftValueFilters.value = existing ? [...existing] : [];
  }
};

const toggleDraftValue = (valueKey, checked) => {
  const current = new Set(draftValueFilters.value);
  if (checked) current.add(valueKey);
  else current.delete(valueKey);
  draftValueFilters.value = [...current];
};

const selectAllDraftValues = () => {
  draftValueFilters.value = filteredValueEntries.value.map(entry => entry.valueKey);
};

const clearDraftValues = () => {
  draftValueFilters.value = [];
};

const applyValueFilters = () => {
  // Guardar el filtro actual en el mapa de filtros aplicados
  if (draftValueFilters.value.length > 0) {
    appliedColumnFilters.value.set(tableFilterField.value, [...draftValueFilters.value]);
  } else {
    // Si no hay valores seleccionados, remover el filtro para ese campo
    appliedColumnFilters.value.delete(tableFilterField.value);
  }
  showTableFilter.value = false;
  visibleCount.value = CHUNK;
};

const clearAppliedValueFilters = () => {
  // Limpiar SOLO el filtro del campo actual
  appliedColumnFilters.value.delete(tableFilterField.value);
  draftValueFilters.value = [];
  visibleCount.value = CHUNK;
};

const clearAllFilters = () => {
  // Limpiar TODOS los filtros aplicados
  appliedColumnFilters.value.clear();
  draftValueFilters.value = [];
  visibleCount.value = CHUNK;
};

const getSearchValueByScope = (item, scope = 'all') => {
  if (scope !== 'all') {
    if (scope === 'stock') return String(getItemStock(item));
    return getFieldValue(item, scope);
  }

  return [
    getFieldValue(item, 'clave'),
    getFieldValue(item, 'descripcion'),
    getFieldValue(item, 'marca'),
    getFieldValue(item, 'modelo'),
    getFieldValue(item, 'referencia'),
    getFieldValue(item, 'lote'),
    getFieldValue(item, 'n'),
    getFieldValue(item, 'caducidad'),
    getFieldValue(item, 'unidad')
  ].join(' ');
};

const parseAdvancedQuery = (query = '') => {
  const tokens = tokenizeQuery(query);
  const globalTerms = [];
  const fieldTerms = [];

  for (const token of tokens) {
    const separator = token.indexOf(':');
    if (separator > 0) {
      const rawField = normalizeText(token.slice(0, separator));
      const normalizedField = fieldAliasMap[rawField];
      const rawValue = token.slice(separator + 1).trim();
      if (normalizedField && rawValue) {
        fieldTerms.push({ field: normalizedField, value: normalizeText(rawValue) });
        continue;
      }
    }
    globalTerms.push(normalizeText(token));
  }

  return { globalTerms, fieldTerms };
};

const matchesStockExpression = (stock, expression) => {
  const exp = normalizeText(expression).replace(/\s+/g, '');
  if (!exp) return true;
  if (exp === 'con' || exp === 'with') return stock > 0;
  if (exp === 'sin' || exp === 'zero' || exp === 'agotado') return stock === 0;

  const operatorMatch = exp.match(/^(>=|<=|!=|=|>|<)(-?\d+)$/);
  if (operatorMatch) {
    const [, operator, amountRaw] = operatorMatch;
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount)) return false;
    if (operator === '>') return stock > amount;
    if (operator === '<') return stock < amount;
    if (operator === '>=') return stock >= amount;
    if (operator === '<=') return stock <= amount;
    if (operator === '!=') return stock !== amount;
    return stock === amount;
  }

  const directNumber = Number(exp);
  if (Number.isFinite(directNumber)) return stock === directNumber;
  return false;
};

const matchesFieldTerm = (item, term) => {
  if (!term || !term.field) return true;
  if (term.field === 'stock') {
    return matchesStockExpression(getItemStock(item), term.value);
  }

  const haystack = getFieldValue(item, term.field);
  if (!term.value.includes(',')) {
    return haystack.includes(term.value);
  }

  const options = term.value.split(',').map(v => normalizeText(v)).filter(Boolean);
  return options.some(v => haystack.includes(v));
};
const getItemStock = (item) => {
  const raw = pickValue(item, ['TOTAL EXISTENCIAS', 'Total Excistencias', 'total_existencias', 'totalExistencias', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0);
  const parsed = parseInt(raw, 10);
  if (Number.isFinite(parsed)) return parsed;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

/* Debounce búsqueda */
let _timer = null;
watch(localQuery, (v) => {
  clearTimeout(_timer);
  _timer = setTimeout(() => {
    debouncedQ.value = v.trim();
    visibleCount.value = CHUNK;
    // scroll to top on new search
    nextTick(() => { if (listRef.value) listRef.value.scrollTop = 0; });
  }, DEBOUNCE_MS);
});

/* Filtro + orden */
const filtered = computed(() => {
  // Partimos del dataset ya filtrado por búsqueda, stock y TODOS los filtros de columna aplicados
  let r = baseWithAppliedFilters.value;

  // newest first
  return [...r].sort((a, b) => (b.id || b.N || 0) - (a.id || a.N || 0));
});

const visible = computed(() => filtered.value.slice(0, visibleCount.value));

/* Stats */
const selectedCount = computed(() =>
  Object.values(props.quantities).filter(q => Number(q) > 0).length
);
const totalUnits = computed(() =>
  Object.values(props.quantities).reduce((s, q) => s + (Number(q) || 0), 0)
);

/* Helpers */
const getItemId = (item) => {
  // Crear ID único usando clave + serie + modelo + marca
  // Esto previene que items sin clave se agrupen incorrectamente
  const clave = pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], 'SIN_CLAVE');
  const serie = pickValue(item, ['N', 'Número de serie', 'Numero de serie', 'id'], '');
  const modelo = pickValue(item, ['MODELO', 'Modelo', 'modelo'], '');
  const marca = pickValue(item, ['MARCA', 'Marca', 'marca'], '');
  return `${clave}|${serie}|${modelo}|${marca}`;
};

const getQty = (item) => {
  const itemId = getItemId(item);
  return Number(props.quantities[itemId] || 0);
};

const emitQty = (itemId, val) => {
  emit('update:quantities', { ...props.quantities, [itemId]: val });
};

const step = (item, delta) => {
  const key = getItemId(item);
  let next = getQty(item) + delta;
  if (next < 0) next = 0;
  if (props.maxPerItem != null && next > props.maxPerItem) {
    const max = Number(getItemStock(item)) || props.maxPerItem;
    if (next > max) next = max;
  }
  emitQty(key, next);
};

const onInput = (item, e) => {
  // Allow free typing: strip non-numeric, update raw value
  const raw = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = raw;
  const val = raw === '' ? 0 : parseInt(raw);
  emitQty(getItemId(item), val);
};

const onBlur = (item, e) => {
  // Clamp on blur: 0 ≤ val ≤ max
  const key = getItemId(item);
  let val = parseInt(e.target.value) || 0;
  if (val < 0) val = 0;
  const max = Number(getItemStock(item)) || Infinity;
  if (props.maxPerItem != null) {
    const limit = Math.min(max, Number(props.maxPerItem) || Infinity);
    if (val > limit) val = limit;
  } else if (val > max) {
    val = max;
  }
  emitQty(key, val);
  e.target.value = val;  // sync DOM
};

const fastLabel = (prefix) => `${prefix}${props.fastAmount}`;

/* Infinite scroll */
const onScroll = (e) => {
  const el = e.target;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    if (visibleCount.value < filtered.value.length) {
      visibleCount.value += CHUNK;
    }
  }
};

/* Focus search con Ctrl+F dentro del wizard */
const focusSearch = () => inputRef.value?.focus();
defineExpose({ focusSearch });
</script>

<style scoped>
.il-root {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
  gap: 12px;
}

/* --- Search --- */
.il-search {
  display: flex; align-items: center; gap: 10px;
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  padding: 0 14px;
  height: 42px;
  transition: border-color .25s, box-shadow .25s;
}
.il-search.focused {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96,165,250,.12);
}
.il-search-icon { width: 18px; height: 18px; color: rgba(255,255,255,.3); flex-shrink: 0; transition: color .25s; }
.il-search.focused .il-search-icon { color: #60a5fa; }

.il-search-input {
  flex: 1; background: none; border: none; outline: none;
  color: #fff; font-size: 14px; font-family: inherit;
}
.il-search-input::placeholder { color: rgba(255,255,255,.22); }

.il-search-clear {
  width: 22px; height: 22px; border: none; background: rgba(255,255,255,.08);
  border-radius: 6px; color: rgba(255,255,255,.4); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.il-search-clear:hover { background: rgba(255,255,255,.15); }
.il-search-clear svg { width: 14px; height: 14px; }

.il-filters {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  flex-wrap: wrap;
}

.il-query-hint {
  margin: -4px 2px 2px;
  font-size: 11px;
  color: rgba(255,255,255,.38);
}

.il-query-hint strong {
  color: rgba(255,255,255,.72);
  font-weight: 600;
}

.il-scope-wrap {
  display: flex; align-items: center; gap: 8px;
}

.il-scope-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: rgba(255,255,255,.35);
}

.il-scope-select {
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(0,0,0,.28);
  color: rgba(255,255,255,.88);
  padding: 0 10px;
  font-size: 12px;
  outline: none;
}

.il-stock-filters {
  display: flex; align-items: center; gap: 8px;
}

.il-chip {
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.03);
  color: rgba(255,255,255,.65);
  font-size: 12px;
  padding: 0 12px;
  cursor: pointer;
}

.il-chip.active {
  border-color: rgba(96,165,250,.55);
  color: #93c5fd;
  background: rgba(96,165,250,.12);
}

.il-table-filter-wrap {
  margin-left: auto;
  position: relative;
}

.il-table-filter-btn {
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.03);
  color: rgba(255,255,255,.72);
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.il-table-filter-btn.active {
  border-color: rgba(96,165,250,.55);
  color: #93c5fd;
  background: rgba(96,165,250,.12);
}

.il-table-filter-badge {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(96,165,250,.25);
  color: #bfdbfe;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.il-table-filter-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  width: min(420px, 78vw);
  border: 1px solid rgba(96,165,250,.25);
  border-radius: 12px;
  background: rgba(4,18,39,.97);
  box-shadow: 0 14px 40px rgba(0, 0, 0, .45);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.il-table-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #bbf7d0; /* verde claro para buen contraste en fondo oscuro */
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.il-table-filter-close {
  border: none;
  background: transparent;
  color: rgba(255,255,255,.55);
  cursor: pointer;
}

.il-table-filter-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.il-table-filter-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: rgba(255,255,255,.45);
}

.il-table-filter-input {
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.03);
  color: rgba(255,255,255,.9);
  padding: 0 10px;
  outline: none;
}

.il-table-filter-actions {
  display: flex;
  gap: 8px;
}

.il-table-filter-mini {
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.03);
  color: rgba(255,255,255,.72);
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
}

.il-table-filter-values {
  max-height: 190px;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.il-table-filter-check {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 5px 6px;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 12px;
}

.il-table-filter-check:hover {
  background: rgba(255,255,255,.05);
}

.il-table-filter-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.il-table-filter-count {
  color: rgba(191,219,254,.8);
  font-size: 11px;
}

.il-table-filter-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
}

.il-table-filter-clear,
.il-table-filter-clear-all,
.il-table-filter-apply {
  height: 34px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  padding: 0 14px;
  cursor: pointer;
}

.il-table-filter-clear {
  background: rgba(127,29,29,.35);
  color: #fecaca;
}

.il-table-filter-clear-all {
  background: rgba(127,29,29,.5);
  color: #fca5a5;
  flex: 1;
}

.il-table-filter-apply {
  background: #0ea5e9;
  color: #fff;
  flex: 1;
}

/* --- Stats --- */
.il-stats {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: rgba(255,255,255,.35);
  padding: 0 2px;
}
.il-stat-num  { font-weight: 700; color: rgba(255,255,255,.6); }
.il-stat-accent .il-stat-num { color: #60a5fa; }
.il-stat-sep  { color: rgba(255,255,255,.12); }

/* --- List --- */
.il-list {
  flex: 1; min-height: 0;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.06) transparent;
  /* GPU acceleration for scroll */
  will-change: scroll-position;
  contain: layout style;
}
.il-list::-webkit-scrollbar { width: 4px; }
.il-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 9px; }

/* --- Row --- */
.il-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 10px 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 14px;
  transition: background .15s, border-color .15s;
  contain: layout style;
}
.il-row:hover {
  background: rgba(255,255,255,.05);
  border-color: rgba(255,255,255,.08);
}
.il-row.active {
  background: rgba(96,165,250,.06);
  border-color: rgba(96,165,250,.2);
}

.il-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.il-name {
  font-weight: 600; font-size: 13px; color: rgba(255,255,255,.88);
  white-space: normal;
  line-height: 1.32;
  overflow: visible;
}
.il-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.il-tag-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px; padding: 1px 7px;
  background: rgba(255,255,255,.04); border-radius: 5px;
  color: rgba(255,255,255,.4);
  white-space: normal;
  word-break: break-word;
}
.il-tag-stock { font-size: 11px; color: #60a5fa; font-weight: 500; }
.il-tag-warehouse {
  font-size: 10px;
  color: rgba(191, 219, 254, .82);
  background: rgba(96, 165, 250, .12);
  border: 1px solid rgba(96, 165, 250, .18);
  border-radius: 999px;
  padding: 1px 7px;
}

.il-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.il-detail-pill {
  display: inline-flex;
  align-items: flex-start;
  gap: 4px;
  max-width: 100%;
  font-size: 10px;
  color: rgba(226, 232, 240, .78);
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 999px;
  padding: 2px 8px;
  white-space: normal;
  word-break: break-word;
  line-height: 1.25;
}

.il-detail-pill strong {
  color: rgba(248, 250, 252, .9);
  font-weight: 700;
}

/* --- Quantity stepper --- */
.il-qty {
  display: flex; align-items: center;
  background: rgba(0,0,0,.25);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  border: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
  margin-top: 2px;
}
.il-btn {
  width: 30px; height: 30px;
  border-radius: 8px; border: none;
  background: rgba(255,255,255,.05);
  color: rgba(255,255,255,.7);
  font-weight: 700; font-size: 15px;
  cursor: pointer; transition: background .12s;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}
.il-btn:hover { background: rgba(255,255,255,.12); }
.il-btn-fast { font-size: 11px; color: #60a5fa; width: 34px; }

.il-qty-input {
  width: 72px; height: 30px;
  background: none; border: none; outline: none;
  text-align: center; color: #fff;
  font-size: 14px; font-weight: 700;
  font-family: inherit;
  -moz-appearance: textfield;
  appearance: textfield;
}
.il-qty-input::-webkit-inner-spin-button,
.il-qty-input::-webkit-outer-spin-button { display: none; }

/* --- More sentinel --- */
.il-more {
  text-align: center; padding: 12px;
  font-size: 12px; color: rgba(255,255,255,.25);
}

/* --- Loading --- */
.il-loading { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.il-shimmer {
  height: 52px;
  background: linear-gradient(90deg, rgba(255,255,255,.02) 25%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.02) 75%);
  background-size: 200% 100%;
  animation: il-shimmer 1.4s ease infinite;
  border-radius: 12px;
}
@keyframes il-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* --- Empty --- */
.il-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; gap: 12px;
  color: rgba(255,255,255,.3);
}
.il-empty-icon { width: 48px; height: 48px; opacity: .4; }
.il-empty p { font-size: 13px; text-align: center; }
</style>
