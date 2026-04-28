<template>
  <div class="propuestas-page">
    <h1>Propuestas de búsqueda de inventario (Wizards)</h1>
    <p>Ruta de prueba: <strong>/op/propuestas</strong></p>

    <div class="tabs">
      <button :class="{active: activeTab===1}" @click="activeTab=1">Propuesta 1: Filtros AND de cada campo</button>
      <button :class="{active: activeTab===2}" @click="activeTab=2">Propuesta 2: Búsqueda libre + tokens</button>
      <button :class="{active: activeTab===3}" @click="activeTab=3">Propuesta 3: Refinamiento incremental</button>
    </div>

    <div v-if="activeTab===1" class="proposal-box">
      <h2>1) Filtro AND por campos (interfaz por formulario de campos)</h2>
      <p>Escribe un valor en uno o más campos; el resultado se reduce automáticamente. Ideal para evitar errores por datos ambiguos.</p>

      <div class="filter-grid">
        <label v-for="(label, key) in visibleFields" :key="key">
          {{ label }}
          <input type="text" v-model="criteria[key]" :placeholder="`Ej. ${fieldPlaceholders[key] || ''}`" />
        </label>
      </div>

      <div class="summary-bar">
        <span>Items totales: {{ inventory.length }}</span>
        <span>Filtrados: {{ filteredSimple.length }}</span>
        <span>Coincidencias exactas (todos los campos con igualdad): {{ exactMatches.length }}</span>
      </div>

      <div class="results-list">
        <div class="result-item" v-for="item in previewItems(filteredSimple)" :key="item.id">
          <div class="result-top">
            <strong>{{ item.nombre }}</strong> ({{ item.tipo }})
            <small>#{{ item.noInventario || 'N/A' }}</small>
          </div>
          <div class="result-data">
            <span><b>Marca:</b> {{ item.marca }}</span>
            <span><b>Modelo:</b> {{ item.modelo }}</span>
            <span><b>Lote:</b> {{ item.lote }}</span>
            <span><b>Serie:</b> {{ item.serie }}</span>
            <span><b>Ref:</b> {{ item.referencia }}</span>
            <span><b>Ubicación:</b> {{ item.ubicacion }}</span>
            <span><b>Clave HRAEI:</b> {{ item.claveHRAEI }}</span>
          </div>
        </div>
        <div v-if="filteredSimple.length === 0" class="no-results">No hay coincidencias</div>
      </div>
    </div>

    <div v-if="activeTab===2" class="proposal-box">
      <h2>2) Búsqueda libre con tokens estructurados (campo:valor)</h2>
      <p>Soporta entradas libres y tokenizadas; sin token se busca en todos los campos. Si hay más de un candidate, se puede añadir otro token para afinar.</p>

      <div class="free-search">
        <input type="text" v-model="globalQuery" placeholder="Buscar (ej: lote:LT-2026 referencia:REF-001)" />
        <button @click="addToken">+ Añadir token</button>
      </div>

      <div class="token-area" v-if="tokenList.length > 0">
        <span v-for="(t, idx) in tokenList" :key="idx" class="token-chip">
          {{ t.key }}: {{ t.value }}
          <button @click="removeToken(idx)">✕</button>
        </span>
        <button class="clear-all" @click="clearTokens">Limpiar tokens</button>
      </div>

      <div class="summary-bar">
        <span>Items totales: {{ inventory.length }}</span>
        <span>Filtrados: {{ filteredToken.length }}</span>
      </div>

      <div class="results-list">
        <div class="result-item" v-for="item in previewItems(filteredToken)" :key="item.id">
          <div class="result-top">
            <strong>{{ item.nombre }}</strong> ({{ item.tipo }})
          </div>
          <div class="result-data">
            <span><b>Lote:</b> {{ item.lote }}</span>
            <span><b>Ref:</b> {{ item.referencia }}</span>
            <span><b>Serie:</b> {{ item.serie }}</span>
            <span><b>Ubicación:</b> {{ item.ubicacion }}</span>
          </div>
        </div>
        <div v-if="filteredToken.length === 0" class="no-results">No hay coincidencias</div>
      </div>
    </div>

    <div v-if="activeTab===3" class="proposal-box">
      <h2>3) Refinamiento inteligente (modo asistente)</h2>
      <p>Escribe poco y recibe sugerencias de valores (por campo) en tiempo real. Agrega criterio por criterio hasta quedar en 1 item.</p>

      <div class="refinement-grid">
        <label>
          Campo a filtrar
          <select v-model="stepField">
            <option v-for="(label, key) in campoBusquedaOptions" :key="key" :value="key">{{ label }}</option>
          </select>
        </label>

        <label class="search-box-wrapper">
          Escribe valor
          <input type="text" v-model="stepValue" :placeholder="`Busca ${campoBusquedaOptions[stepField]}...`" @input="onStepValueInput" @keyup.enter="addRefinement" />

          <ul v-if="suggestedResults.length > 0" class="live-dropdown">
            <li v-for="suggestion in suggestedResults" :key="suggestion.id + suggestion.label" @click="applySuggestion(suggestion.label)">
              <span class="suggestion-label">{{ suggestion.label }}</span>
              <span class="suggestion-info">{{ suggestion.nombre }} · ID {{ suggestion.id }}</span>
            </li>
          </ul>
        </label>

        <div class="refinement-actions">
          <button class="btn-primary" @click="addRefinement" :disabled="!canAddRefinement">Agregar criterio</button>
          <button class="btn-link" @click="clearRefinements">Limpiar todos</button>
        </div>
      </div>

      <div class="token-area" v-if="refinements.length > 0">
        <span v-for="(r, idx) in refinements" :key="idx" class="token-chip">
          {{ campoBusquedaOptions[r.key] }}: {{ r.value }}
          <button @click="removeRefinement(idx)">✕</button>
        </span>
      </div>

      <div class="summary-bar">
        <span>Items dentro del filtro: {{ filteredRefinement.length }}</span>
        <span v-if="filteredRefinement.length === 1" class="exact-badge">Encontrado: {{ filteredRefinement[0].nombre }} (ID {{ filteredRefinement[0].id }})</span>
        <span v-else-if="filteredRefinement.length === 0" class="exact-badge">No hay resultados, prueba otro valor</span>
      </div>

      <div class="results-list">
        <div class="result-item" v-for="item in previewItems(filteredRefinement)" :key="item.id">
          <div class="result-top">
            <strong>{{ item.nombre }}</strong>
            <small>{{ item.lote }} / {{ item.referencia }} / {{ item.serie }}</small>
          </div>
          <div class="result-data">
            <span><b>Marca:</b> {{ item.marca }}</span>
            <span><b>Modelo:</b> {{ item.modelo }}</span>
            <span><b>Ubicación:</b> {{ item.ubicacion }}</span>
          </div>
          <button class="select-btn" @click="selectForWizard(item)">Seleccionar</button>
        </div>
        <div v-if="filteredRefinement.length === 0" class="no-results">No hay coincidencias</div>
      </div>
    </div>

    <div class="selected-item" v-if="selectedItem">
      <h3>Item seleccionado (demo)</h3>
      <pre>{{ selectedItem }}</pre>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const activeTab = ref(1)

const inventory = ref([
  { id: 1, tipo: 'equipo-medico', nombre: 'Monitor de signos vitales', marca: 'Philips', modelo: 'MX40', lote: 'LT-2026', serie: 'SN123456', referencia: 'REF-001', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-001' },
  { id: 2, tipo: 'equipo-medico', nombre: 'Monitor de signos vitales', marca: 'Philips', modelo: 'MX40', lote: 'LT-2026', serie: 'SN123457', referencia: 'REF-001', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-002' },
  { id: 3, tipo: 'equipo-medico', nombre: 'Monitor de signos vitales', marca: 'Philips', modelo: 'MX40', lote: 'LT-2026', serie: 'SN123458', referencia: 'REF-002', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-003' },
  { id: 4, tipo: 'accesorio', nombre: 'Cable de ECG', marca: 'Philips', modelo: 'C100', lote: 'LT-2026', serie: 'SN123459', referencia: 'REF-001', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-004' },
  { id: 5, tipo: 'accesorio', nombre: 'Cable de ECG', marca: 'Philips', modelo: 'C100', lote: 'LT-2027', serie: 'SN123460', referencia: 'REF-001', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-005' },
  { id: 6, tipo: 'refaccion', nombre: 'Batería monitor', marca: 'Philips', modelo: 'B100', lote: 'LT-2026', serie: 'SN123461', referencia: 'REF-005', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-006' },
  { id: 7, tipo: 'equipo-medico', nombre: 'Monitor de signos vitales', marca: 'GE', modelo: 'G200', lote: 'LT-2028', serie: 'SN123470', referencia: 'REF-010', ubicacion: 'UCIA', claveHRAEI: 'COMODATO', noInventario: 'INV-007' }
])

const visibleFields = {
  nombre: 'Nombre / Descripción',
  marca: 'Marca',
  modelo: 'Modelo',
  lote: 'Lote',
  serie: 'No. de Serie',
  referencia: 'Referencia',
  ubicacion: 'Ubicación',
  claveHRAEI: 'Clave HRAEI'
}

const fieldPlaceholders = {
  nombre: 'Cable de ECG',
  marca: 'Philips',
  modelo: 'MX40',
  lote: 'LT-2026',
  serie: 'SN123456',
  referencia: 'REF-001',
  ubicacion: 'UCIA',
  claveHRAEI: 'COMODATO'
}

const criteria = reactive({
  nombre: '',
  marca: '',
  modelo: '',
  lote: '',
  serie: '',
  referencia: '',
  ubicacion: '',
  claveHRAEI: ''
})

const normalizeText = (value) => String(value || '').toLowerCase().trim()

function matchesField(item, key, value) {
  const v = normalizeText(value)
  if (!v) return true
  const t = normalizeText(item[key])
  return t.includes(v)
}

function matchesAllFields(item, opts) {
  return Object.keys(opts).every(key => matchesField(item, key, opts[key]))
}

const filteredSimple = computed(() => {
  return inventory.value.filter(item => matchesAllFields(item, criteria))
})

const exactMatches = computed(() => {
  return inventory.value.filter(item => {
    return Object.keys(criteria).every(key => {
      const queryValue = normalizeText(criteria[key])
      if (!queryValue) return true
      const itemValue = normalizeText(item[key])
      return itemValue === queryValue
    })
  })
})

const globalQuery = ref('')
const tokenList = ref([])

function parseToken(text) {
  const parts = text.split(':')
  if (parts.length < 2) return null
  const key = parts[0].trim().toLowerCase()
  const value = parts.slice(1).join(':').trim()
  if (!value) return null
  const allowed = Object.keys(visibleFields)
  if (!allowed.includes(key)) return null
  return { key, value }
}

function addToken() {
  const parsed = parseToken(globalQuery.value)
  if (parsed) {
    tokenList.value.push(parsed)
    globalQuery.value = ''
  }
}

function removeToken(index) {
  tokenList.value.splice(index, 1)
}

function clearTokens() {
  tokenList.value = []
}

const filteredToken = computed(() => {
  let list = inventory.value
  tokenList.value.forEach(token => {
    const q = normalizeText(token.value)
    if (!q) return
    list = list.filter(item => normalizeText(item[token.key]).includes(q))
  })
  if (!tokenList.value.length && globalQuery.value.trim()) {
    const free = normalizeText(globalQuery.value)
    list = list.filter(item =>
      Object.keys(visibleFields).some(key => normalizeText(item[key]).includes(free))
    )
  }
  return list
})

const refinements = ref([])
const stepField = ref('lote')
const stepValue = ref('')

const campoBusquedaOptions = {
  nombre: 'Nombre',
  marca: 'Marca',
  modelo: 'Modelo',
  lote: 'Lote',
  serie: 'Serie',
  referencia: 'Referencia',
  ubicacion: 'Ubicación',
  claveHRAEI: 'Clave HRAEI'
}

const canAddRefinement = computed(() => stepValue.value.trim().length > 0)

function addRefinement() {
  const val = stepValue.value.trim()
  if (!val) return

  // evitable duplicados exactos de criterio
  const exists = refinements.value.some(r => r.key === stepField.value && normalizeText(r.value) === normalizeText(val))
  if (!exists) {
    refinements.value.push({ key: stepField.value, value: val })
  }
  stepValue.value = ''
}

function removeRefinement(idx) {
  refinements.value.splice(idx, 1)
}

function clearRefinements() {
  refinements.value = []
  stepValue.value = ''
}

const filteredRefinement = computed(() => {
  let list = inventory.value
  refinements.value.forEach(f => {
    const q = normalizeText(f.value)
    list = list.filter(item => normalizeText(item[f.key]).includes(q))
  })
  return list
})

const selectedItem = ref(null)

function selectForWizard(item) {
  selectedItem.value = item
}

const suggestedValues = computed(() => {
  const values = new Map()

  filteredRefinement.value.forEach(item => {
    const raw = item[stepField.value]
    const value = normalizeText(raw) ? String(raw).trim() : ''
    if (!value || value.toUpperCase() === 'N/A') return
    if (!values.has(value)) values.set(value, 0)
    values.set(value, values.get(value) + 1)
  })

  const searchTerm = normalizeText(stepValue.value)
  const array = Array.from(values.keys())
    .sort((a, b) => (values.get(b) - values.get(a)))
    .filter(v => (searchTerm ? v.toLowerCase().includes(searchTerm) : true))

  return array.slice(0, 12)
})

const candidateCounts = computed(() => {
  const counts = {}
  filteredRefinement.value.forEach(item => {
    const raw = item[stepField.value]
    const value = normalizeText(raw) ? String(raw).trim() : ''
    if (!value || value.toUpperCase() === 'N/A') return
    counts[value] = (counts[value] || 0) + 1
  })
  return counts
})

const suggestedResults = computed(() => {
  const query = normalizeText(stepValue.value)
  if (!query) return []
  let source = filteredRefinement.value
  // si no hay refinamientos iniciados, usamos todo el inventario
  if (!refinements.value.length) source = inventory.value

  const matches = []
  const seen = new Set()

  for (const item of source) {
    const raw = item[stepField.value]
    const text = normalizeText(raw)
    if (!text || text === 'n/a') continue
    if (!text.includes(query)) continue

    const key = `${text}||${item.id}`
    if (seen.has(key)) continue
    seen.add(key)

    matches.push({
      id: item.id,
      nombre: item.nombre,
      label: raw,
      item
    })

    if (matches.length >= 8) break
  }

  return matches
})

function applySuggestion(valor) {
  stepValue.value = valor
  addRefinement()
}

function onStepValueInput() {
  // Por ahora no más acciones necesarias; sugerencias se calculan automáticamente
}


function previewItems(list) {
  return list.slice(0, 40)
}
</script>

<style scoped>
.propuestas-page {
  padding: 20px;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.tabs button {
  border: 1px solid #999;
  background: #f3f4f6;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.tabs button.active {
  background: #4f46e5;
  color: white;
  border-color: #4338ca;
}
.proposal-box {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  margin-bottom: 24px;
}
.filter-grid,
.refinement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 12px 0 16px;
}
.filter-grid label,
.refinement-grid label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}
.filter-grid input,
.refinement-grid input,
.refinement-grid select,
.free-search input {
  margin-top: 4px;
  padding: 8px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  font-size: 0.95rem;
}
.free-search {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.free-search button,
.refinement-grid button {
  padding: 8px 11px;
  border: none;
  border-radius: 8px;
  background: #0ea5e9;
  color: white;
  cursor: pointer;
}
.token-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.token-chip {
  background: #e0e7ff;
  border: 1px solid #a5b4fc;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.85rem;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.token-chip button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  color: #374151;
}
.clear-all {
  margin-left: auto;
  background: #f97316;
}
.summary-bar {
  display: flex;
  gap: 14px;
  margin-bottom: 10px;
  font-size: 0.9rem;
}
.results-list {
  border-top: 1px solid #e2e8f0;
  margin-top: 8px;
  padding-top: 12px;
  display: grid;
  row-gap: 10px;
}
.search-box-wrapper {
  position: relative;
}
.live-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 999;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, .16);
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 6px 0;
  list-style: none;
}
.live-dropdown li {
  padding: 8px 12px;
  cursor: pointer;
}
.live-dropdown li:hover {
  background: #e7ebff;
}
.suggestion-label {
  font-weight: 600;
}
.suggestion-info {
  font-size: 0.8rem;
  color: #475569;
  margin-left: 10px;
}
.suggestions-panel {
  margin-bottom: 12px;
  padding: 8px;
  border: 1px dashed #a5b4fc;
  background: #f8faff;
  border-radius: 8px;
}
.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.suggestion-buttons .chip {
  padding: 5px 10px;
  border: 1px solid #6366f1;
  background: #eef2ff;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}
.suggestion-buttons .chip:hover {
  background: #c7d2fe;
}
.suggestion-buttons .count {
  margin-left: 4px;
  font-size: 0.75rem;
  color: #1e40af;
}
.refinement-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn-primary {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.btn-link {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #1d4ed8;
  text-decoration: underline;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.result-item {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px;
  background: #f8fafc;
}
.result-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.result-data {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.85rem;
}
.result-data span {
  display: inline-block;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  padding: 3px 6px;
}
.no-results {
  padding: 14px;
  color: #6b7280;
  text-align: center;
}
.exact-badge {
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #166534;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.82rem;
}
.selected-item {
  margin-top: 18px;
  border: 1px dashed #94a3b8;
  border-radius: 10px;
  padding: 12px;
}
.select-btn {
  margin-top: 8px;
  background: #10b981;
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
