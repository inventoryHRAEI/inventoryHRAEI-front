<template>
  <div v-if="belongsToHospital === true && newItem?.tipo" class="refinement-container">
    <div class="refinement-header">
      <div class="refinement-title-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="refinement-icon-svg">
          <path d="M6 8l6-6 6 6M6 16l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 8h12l-6 12L6 8z" fill="rgba(59,130,246,0.15)" stroke="currentColor" stroke-width="1"/>
        </svg>
        <div>
          <h4>Búsqueda de bienes</h4>
          <p>Combina campos y valores como en un filtro profesional de inventario.</p>
        </div>
      </div>
      <div class="refinement-status">
        <span class="badge badge-success">Filtrados: {{ refinedInventory.length }}</span>
      </div>
    </div>

    <div class="refinement-row">
      <label v-if="!onlyInventario">
        Campo
        <select v-model="refinementField">
          <option v-for="(label, key) in refinementFields" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label v-else>
        Campo
        <div class="form-input">{{ refinementFields.noInventario }}</div>
      </label>

      <label class="search-box-wrapper">
        Valor
        <input type="text" v-model="refinementValue" :placeholder="`Busca ${refinementFields[refinementField]}...`" @input="onStepValueInput" @keyup.enter="addRefinement" @focus="onRefinementFocus" @blur="onRefinementBlur" autocomplete="off" />
        <ul v-if="refinementDropdownOpen && refinementSuggestions.length > 0" class="live-dropdown">
          <li v-for="item in refinementSuggestions" :key="item.value" @mousedown.prevent="applyRefinementSuggestion(item.value)" tabindex="0">
            <span>{{ item.value }}</span>
            <small>({{ item.count }})</small>
          </li>
        </ul>
      </label>

      <div class="refinement-actions">
        <button type="button" class="btn-primary btn-with-icon" @click="addRefinement" :disabled="!canAddRefinement">
          <span class="btn-icon-left">+</span> Agregar filtro
        </button>
        <button type="button" class="btn-secondary" @click="clearAllRefinementFilters" :disabled="refinements.length === 0 && !refinementValue">Limpiar</button>
      </div>
    </div>

    <div class="token-area" v-if="refinements.length > 0">
      <span v-for="(r, i) in refinements" :key="`${r.key}-${r.value}-${i}`" class="token-chip">
        {{ refinementFields[r.key] }}: {{ r.value }}
        <button type="button" @click="removeRefinement(i)">✕</button>
      </span>
    </div>

    <div class="summary-bar">
      <span>Items filtrados: {{ refinedInventory.length }}</span>
      <span v-if="refinedInventory.length === 1" class="exact-badge">Coincidencia única: {{ refinedInventory[0].nombre }}</span>
    </div>

    <div class="results-list">
      <div class="results-panel">
        <div v-for="item in refinedInventory.slice(0, 50)" :key="item.id || item._id || item.nombre" class="result-item">
          <div class="result-top">
            <strong>{{ item.nombre || item.label || item.descripcion || 'Sin nombre' }}</strong>
            <small>{{ item.lote || '-' }} / {{ item.referencia || '-' }} / {{ item.serie || '-' }}</small>
          </div>
          <div class="result-data">
            <div class="field-row"><span class="field-label">Lote:</span> <span>{{ item.lote || 'N/A' }}</span></div>
            <div class="field-row"><span class="field-label">Serie:</span> <span>{{ item.serie || 'N/A' }}</span></div>
            <div class="field-row"><span class="field-label">Referencia:</span> <span>{{ item.referencia || 'N/A' }}</span></div>
            <div class="field-row"><span class="field-label">Clave:</span> <span>{{ item.claveHRAEI || 'N/A' }}</span></div>
          </div>
          <div class="result-extra-controls">
            <label>
              Cantidad
              <div class="qty-control">
                <button type="button" @click="refinementQuantity = Math.max(1, refinementQuantity - 1)">-</button>
                <span>{{ refinementQuantity }}</span>
                <button type="button" @click="refinementQuantity++">+</button>
              </div>
            </label>
            <label v-if="newItem.tipo === 'consumible' || newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion'">
              Estado
              <select v-model="refinementConsumibleState">
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </label>
            <div class="descuento-info" v-if="(newItem.tipo === 'consumible' || newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion') && refinementConsumibleState === 'nuevo'">Descuento: Sí</div>
            <div class="descuento-info" v-else-if="newItem.tipo === 'consumible' || newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion'">Descuento: No</div>
          </div>
          <button type="button" class="btn-select-item" @click="selectInventoryRefinedItem(item)">Agregar este item</button>
        </div>
      </div>
      <div v-if="!inventoryBase.length && refinements.length === 0" class="no-results">
        <div>🔄 No hay datos de inventario cargados para sugerencias.</div>
        <small>Recarga inventario o selecciona otro tipo.</small>
      </div>
      <div v-else-if="refinedInventory.length === 0" class="no-results">No hay resultados que coincidan</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  newItem: { type: Object, required: true },
  belongsToHospital: { type: Boolean, required: true },
  suggestions: { type: Array, default: () => [] },
  equipoMedicoList: { type: Array, default: () => [] },
  onlyInventario: { type: Boolean, default: false }
})

const emit = defineEmits(['select-item'])

const refinementFields = {
  nombre: 'Nombre / Descripción',
  marca: 'Marca',
  modelo: 'Modelo',
  lote: 'Lote',
  serie: 'Serie',
  referencia: 'Referencia',
  ubicacion: 'Ubicación',
  claveHRAEI: 'Clave HRAEI',
  noInventario: 'No. Inventario'
}

const refinements = ref([])
const refinementField = ref(props.onlyInventario ? 'noInventario' : 'serie')
const refinementValue = ref('')
const refinementDropdownOpen = ref(false)
const refinementQuantity = ref(1)
const refinementConsumibleState = ref('nuevo')

let refinementDebounceTimer = null
let refinementBlurTimer = null

const inventoryBase = computed(() => {
  const suggestionsList = Array.isArray(props.suggestions) ? props.suggestions : []
  const equipoList = Array.isArray(props.equipoMedicoList) ? props.equipoMedicoList : []
  const tipoActual = props.newItem?.tipo
  if (tipoActual === 'equipo-medico' || tipoActual === 'mobiliario') return equipoList.length > 0 ? equipoList : []
  if (['accesorio', 'consumible', 'refaccion'].includes(tipoActual)) return suggestionsList
  if (equipoList.length > 0) {
    const combined = new Map()
    suggestionsList.forEach(item => {
      const key = item.id || item._id || `${item.nombre || ''}-${item.marca || ''}-${item.serie || ''}-${item.lote || ''}-${item.referencia || ''}`
      combined.set(key, item)
    })
    equipoList.forEach(item => {
      const key = item.id || item._id || `${item.nombre || ''}-${item.marca || ''}-${item.serie || ''}-${item.lote || ''}-${item.referencia || ''}`
      if (!combined.has(key)) combined.set(key, item)
    })
    return Array.from(combined.values())
  }
  return suggestionsList
})

function getRefinementFieldValue(item, key) {
  if (!item || !key) return ''
  const fallbacks = {
    nombre: [item.nombre, item.label, item.descripcion],
    marca: [item.marca],
    modelo: [item.modelo],
    lote: [item.lote],
    serie: [item.serie, item.n, item.numeroSerie],
    referencia: [item.referencia],
    ubicacion: [item.ubicacion],
    claveHRAEI: [item.claveHRAEI, item.claveCNIS],
    noInventario: [item.noInventario, item.no_inventario, item['No. Inventario'], item['No Inventario'], item.N_DE_INVENTARIO, item['N_DE_INVENTARIO']]
  }
  const values = fallbacks[key] || [item[key]]
  for (const val of values) {
    if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim().toLowerCase()
  }
  return ''
}

const refinedInventory = computed(() => {
  let list = Array.isArray(inventoryBase.value) ? inventoryBase.value.slice() : []
  refinements.value.forEach(r => {
    const q = String(r.value || '').trim().toLowerCase()
    if (!q) return
    list = list.filter(item => {
      const fieldValue = getRefinementFieldValue(item, r.key)
      return fieldValue.includes(q)
    })
  })
  return list
})

const refinementSuggestions = computed(() => {
  const query = String(refinementValue.value || '').trim().toLowerCase()
  const candidates = {}
  let list = inventoryBase.value
  if (refinements.value.length > 0) list = refinedInventory.value
  const maxItemsToProcess = Math.min(list.length, 500)
  const itemsToProcess = list.slice(0, maxItemsToProcess)
  itemsToProcess.forEach(item => {
    let rawVal = String(item[refinementField.value] || '').trim()
    if ((!rawVal || rawVal === '') && refinementField.value === 'noInventario') {
      rawVal = String(item.noInventario || item.no_inventario || item['No. Inventario'] || item['No Inventario'] || item.N_DE_INVENTARIO || '')
    }
    const value = rawVal.trim()
    if (!value) return
    if (!query || value.toLowerCase().includes(query)) candidates[value] = (candidates[value] || 0) + 1
  })
  const sortedValues = Object.keys(candidates).sort((a,b)=> candidates[b]-candidates[a]).slice(0,10)
  return sortedValues.map(v => ({ value: v, count: candidates[v] }))
})

function dispatchClearSearchableFilters() {
  try {
    window.dispatchEvent(new Event('searchable-input:clear-filters'))
  } catch (e) {
    console.warn('[InventoryRefinement] clear filters failed', e)
  }
}

function clearAllRefinementFilters() {
  refinements.value = []
  refinementValue.value = ''
  refinementDropdownOpen.value = false
  refinementQuantity.value = 1
  refinementConsumibleState.value = 'nuevo'
  dispatchClearSearchableFilters()
}

const canAddRefinement = computed(() => String(refinementValue.value || '').trim().length > 0)

function onStepValueInput() { if (refinementDebounceTimer) clearTimeout(refinementDebounceTimer); refinementDebounceTimer = setTimeout(()=> { refinementDropdownOpen.value = refinementSuggestions.value.length > 0 }, 150) }
function onRefinementFocus() { refinementDropdownOpen.value = refinementSuggestions.value.length > 0 }
function onRefinementBlur() { if (refinementBlurTimer) clearTimeout(refinementBlurTimer); refinementBlurTimer = setTimeout(()=> { refinementDropdownOpen.value = false; refinementBlurTimer = null }, 180) }
function addRefinement() { const value = String(refinementValue.value || '').trim(); if (!value) return; const exists = refinements.value.some(r => r.key === refinementField.value && r.value.toLowerCase() === value.toLowerCase()); if (!exists) refinements.value.push({ key: refinementField.value, value }); refinementValue.value = ''; refinementDropdownOpen.value = false }
function removeRefinement(i) { refinements.value.splice(i,1) }
function applyRefinementSuggestion(suggestion) { refinementValue.value = suggestion; addRefinement(); refinementDropdownOpen.value = false }

function selectInventoryRefinedItem(item) {
  const selectedTipo = props.newItem?.tipo || item.tipo || (props.newItem && (props.newItem.tipo === 'equipo-medico' ? 'equipo-medico' : 'accesorio'))
  const isConsumibleLike = ['consumible','accesorio','refaccion'].includes(selectedTipo)
  const chosenItem = {
    ...item,
    tipo: selectedTipo,
    nombre: item.nombre || item.label || item.descripcion || '',
    descripcion: item.descripcion || item.nombre || item.label || '',
    marca: item.marca || '',
    modelo: item.modelo || '',
    lote: item.lote || '',
    serie: item.serie || '',
    referencia: item.referencia || '',
    ubicacion: item.ubicacion || '',
    claveHRAEI: item.claveHRAEI || '',
    noInventario: item.noInventario || item.no_inventario || '',
    cantidad: Number(refinementQuantity.value) || 1,
    consumibleEstado: isConsumibleLike ? (refinementConsumibleState.value || 'nuevo') : null,
    descuento: isConsumibleLike ? ((refinementConsumibleState.value || 'nuevo') === 'nuevo') : false
  }
  emit('select-item', chosenItem)
}

onBeforeUnmount(()=>{ if (refinementDebounceTimer) clearTimeout(refinementDebounceTimer); if (refinementBlurTimer) clearTimeout(refinementBlurTimer) })
</script>

<style scoped>
/* Estilos refinados del componente para concordar con Entradas */
.refinement-container{
  margin-top:24px;
  padding:18px;
  border:1px solid rgba(59,130,246,0.06);
  border-radius:14px;
  background:linear-gradient(180deg, rgba(15,23,42,0.78), rgba(8,12,20,0.5));
  backdrop-filter:blur(6px);
}
.refinement-header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(148,163,184,0.08);margin-bottom:12px;padding-bottom:12px;gap:10px}
.refinement-title-wrap{display:flex;align-items:center;gap:10px}
.refinement-header h4{margin:0 0 2px;color:#f8fafc;font-size:1rem;font-weight:600}
.refinement-header p{margin:0;color:#94a3b8;font-size:0.78rem}
.refinement-row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-bottom:12px;width:100%}
.refinement-row label{display:flex;flex-direction:column;gap:4px;color:#cbd5e1;font-size:0.8rem;font-weight:600;min-width:160px}
.refinement-row select,.refinement-row input{padding:10px 14px;border-radius:10px;border:1px solid rgba(148,163,184,0.25);background:rgba(15,23,42,0.92);color:#e8efff;min-width:170px;outline:none;box-shadow:inset 0 1px 2px rgba(0,0,0,0.4);}
.refinement-row select:focus,.refinement-row input:focus{border-color:rgba(59,130,246,0.85);box-shadow:0 0 0 3px rgba(59,130,246,0.2)}
.refinement-row .refinement-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.btn-primary.btn-with-icon{background:linear-gradient(135deg,#2563eb,#1d4ed8);border:1px solid rgba(59,130,246,0.4);padding:10px 14px;border-radius:10px;}
.btn-secondary{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#e2e8f0;padding:10px 14px;border-radius:10px;}
.refinement-status .badge-success{background:rgba(34,197,94,0.18);border:1px solid rgba(34,197,94,0.4);color:#22c55e;font-weight:700}
.search-box-wrapper{position:relative;flex:1 1 360px;min-width:180px;max-width:560px}
.search-box-wrapper input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(148,163,184,0.15);background:rgba(10,14,20,0.65);color:#e6eef6}
.live-dropdown{position:absolute;top:calc(100% + 6px);left:0;right:0;max-height:220px;overflow-y:auto;border:1px solid rgba(59,130,246,0.22);border-radius:10px;background:#081020;padding:6px;z-index:9999}
.live-dropdown li{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
  color:#e6eef6;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

/* Force select and options to use dark theme so native dropdowns are readable */
.refinement-container select{
  -webkit-appearance: none;
  appearance: none;
  background: #081020;
  color: #e6eef6;
  border: 1px solid rgba(148,163,184,0.12);
  padding: 8px 10px;
  border-radius: 10px;
}
.refinement-container select option{
  background: #081020;
  color: #e6eef6;
}
.result-item{padding:14px;border:1px solid rgba(59,130,246,0.12);border-radius:12px;background:rgba(8,12,20,0.6);margin-bottom:10px}
.btn-select-item{border:none;background:#10b981;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;cursor:pointer}
.btn-select-item:hover{background:#059669;transform:translateY(-1px)}
.token-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,0.17);border:1px solid rgba(59,130,246,0.3);border-radius:999px;padding:4px 11px;color:#e0f2fe;font-weight:600}

/* Panel interior con scroll (apariencia tipo 'card' dentro del refinamiento) */
.results-list{
  padding: 8px 0 0 0;
}
.results-panel{
  background: rgba(8,12,20,0.72);
  border: 1px solid rgba(37,99,235,0.25);
  border-radius: 14px;
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 9px;
  box-shadow: inset 0 0 0 1px rgba(59,130,246,0.2);
}
.results-panel .result-top strong{color:#f8fafc; font-size:1rem;}
.results-panel .result-top small{color:#94a3b8; font-size:0.73rem;}
.results-panel .result-data{margin-top:6px;}

.results-panel::-webkit-scrollbar{width:8px}
.results-panel::-webkit-scrollbar-track{background:transparent}
.results-panel::-webkit-scrollbar-thumb{background:rgba(148,163,184,0.12);border-radius:6px}

/* Copiado exactamente de OpEntrada para garantizar mismo estilo */
.refinement-container .result-data { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:6px; margin-bottom:10px; font-size:0.83rem; color:#dbeafe; }
.refinement-container .field-row { display:flex; gap:6px; align-items:center; }
.refinement-container .field-label { font-weight:600; color:#dbeafe; }
.refinement-container .result-data span { background:rgba(148,163,184,0.15); border:1px solid rgba(148,163,184,0.35); border-radius:7px; padding:2px 6px; }
.refinement-container .result-extra-controls { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:10px; padding:10px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid rgba(255,255,255,0.05); }
.refinement-container .result-extra-controls label { color:#cbd5e1; font-size:0.8rem; display:flex; flex-direction:column; gap:3px; }
.refinement-container .qty-control { display:inline-flex; align-items:center; border:1px solid rgba(148,163,184,0.25); border-radius:8px; overflow:hidden; background:rgba(15,23,42,0.9); }
.refinement-container .qty-control button { background:transparent; border:none; color:#94a3b8; cursor:pointer; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:700; transition:background 0.15s, color 0.15s; flex-shrink:0; }
.refinement-container .qty-control button:hover { background:rgba(59,130,246,0.2); color:#93c5fd; }
.refinement-container .qty-control span { min-width:28px; text-align:center; color:#e2e8f0; font-size:0.85rem; font-weight:600; padding:0 4px; }
.refinement-container .result-extra-controls select { padding:5px 8px; border-radius:7px; border:1px solid rgba(148,163,184,0.25); background:rgba(15,23,42,0.9); color:#e2e8f0; font-size:0.8rem; cursor:pointer; outline:none; }
.refinement-container .descuento-info { color:#34d399; background:rgba(52,211,153,0.1); border:1px solid rgba(52,211,153,0.3); border-radius:6px; padding:3px 10px; font-size:0.75rem; font-weight:600; }
.refinement-container .no-results { margin:8px 0; padding:10px 14px; background:rgba(148,163,184,0.15); border:1px dashed rgba(148,163,184,0.6); border-radius:9px; color:#e2e8f0; font-size:0.86rem; text-align:center; }
.refinement-container .no-results small { display:block; color:#94a3b8; margin-top:4px; }
.refinement-container .live-dropdown { position:absolute; top:calc(100% + 4px); left:0; right:0; max-height:135px; overflow-y:auto; border:1px solid rgba(148,163,184,0.4); border-radius:10px; background:#0f172a; box-shadow:0 20px 40px rgba(0,0,0,0.35); z-index:9999; }
.refinement-container .live-dropdown li { min-height:30px; padding:6px 10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.refinement-container .live-dropdown li:hover { background:rgba(148,163,184,0.15); }
.refinement-container .form-input { padding:8px 12px; font-size:0.875rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; transition:all 0.2s; }
.refinement-container .form-input:focus { background:rgba(255,255,255,0.08); border-color:rgba(59,130,246,0.5); outline:none; }

/* Ajustes para que los items sean compactos y las etiquetas/chips claras */
.result-item{padding:12px;border-radius:10px;background:rgba(6,10,16,0.6);border:1px solid rgba(148,163,184,0.06)}
.result-data{gap:8px 10px}
.result-data .field-row{gap:8px}
.result-data .field-row span{padding:4px 8px;border-radius:999px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.08);color:#e6eef6}
</style>
