<template>
  <div class="il-root">
    <!-- Search -->
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
          <span class="il-name">{{ item['Descripción del bien'] }}</span>
          <div class="il-tags">
            <span class="il-tag-code">{{ item['Clave  HRAEI'] }}</span>
            <span class="il-tag-stock">Stock: {{ item['TOTAL EXISTENCIAS'] ?? '—' }}</span>
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
  maxPerItem:    { type: Number,  default: null },       // null = sin límite
  allowFastStep: { type: Boolean, default: false },
  fastAmount:    { type: Number,  default: 5 },
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

/* Debounce búsqueda */
let _timer = null;
watch(localQuery, (v) => {
  clearTimeout(_timer);
  _timer = setTimeout(() => {
    debouncedQ.value = v.trim().toLowerCase();
    visibleCount.value = CHUNK;
    // scroll to top on new search
    nextTick(() => { if (listRef.value) listRef.value.scrollTop = 0; });
  }, DEBOUNCE_MS);
});

/* Filtro + orden */
const filtered = computed(() => {
  let r = props.items;
  const q = debouncedQ.value;
  if (q) {
    r = r.filter(i => {
      const n = (i['Descripción del bien'] || '').toLowerCase();
      const c = (i['Clave  HRAEI'] || '').toLowerCase();
      return n.includes(q) || c.includes(q);
    });
  }
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
  const clave = item['Clave  HRAEI'] || 'SIN_CLAVE';
  const serie = item['N'] || item['Número de serie'] || '';
  const modelo = item['MODELO'] || '';
  const marca = item['MARCA'] || '';
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
    const max = Number(item['TOTAL EXISTENCIAS']) || props.maxPerItem;
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
  const max = Number(item['TOTAL EXISTENCIAS']) || Infinity;
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
  display: flex; justify-content: space-between; align-items: center;
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

.il-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.il-name {
  font-weight: 600; font-size: 13px; color: rgba(255,255,255,.88);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.il-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.il-tag-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px; padding: 1px 7px;
  background: rgba(255,255,255,.04); border-radius: 5px;
  color: rgba(255,255,255,.4);
}
.il-tag-stock { font-size: 11px; color: #60a5fa; font-weight: 500; }

/* --- Quantity stepper --- */
.il-qty {
  display: flex; align-items: center;
  background: rgba(0,0,0,.25);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  border: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
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
