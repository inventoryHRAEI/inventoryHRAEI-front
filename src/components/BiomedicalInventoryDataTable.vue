<template>
  <div class="maintenance-datatable-container" :style="paletteCssVars">
    <div class="datatable-toolbar">
      <div class="toolbar-section left">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input v-model="globalSearch" @input="applyGlobalSearch" type="text" placeholder="Buscar en todos los campos..." class="search-input" />
          <span v-if="globalSearch" class="search-clear" @click="(globalSearch=''), applyGlobalSearch()">✕</span>
        </div>

        <div class="quick-filters">
          <button
            v-for="status in statusOptions"
            :key="status"
            :class="['filter-btn', { active: table && typeof table.getFilters === 'function' && table.getFilters().some(f => f.field === 'ESTADO' && f.value === status) }]"
            @click.prevent="() => { const has = table && typeof table.getFilters === 'function' && table.getFilters().some(f => f.field === 'ESTADO' && f.value === status); if (!table) return; if (has && typeof table.removeFilter === 'function') { table.removeFilter('ESTADO'); } else if (typeof table.addFilter === 'function') { table.addFilter('ESTADO','=',status); } }"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <div class="toolbar-section right">
        <select @change="setPageSize" class="page-size-select" aria-label="Cambiar tamaño de página">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size === 0 ? 'Todo' : size }}</option>
        </select>

        <label class="small-label">Agrupar</label>
        <select @change="setGroupBy" class="group-select" aria-label="Agrupar por">
          <option value="">- Ninguno -</option>
          <option value="ESTADO">Estado</option>
          <option value="UBICACION">Ubicación</option>
          <option value="MARCA">Marca</option>
        </select>

        <details class="columns-menu">
          <summary class="action-btn" aria-haspopup="true" aria-expanded="false">Columnas ▾</summary>
          <div class="columns-list">
            <label style="margin-bottom:8px; display:flex; gap:8px; align-items:center;">
              <input type="checkbox" v-model="showAllColumns" /> <strong>Mostrar todas las columnas</strong>
            </label>
            <label v-for="col in ['No DE INVENTARIO','EQUIPO MEDICO','MARCA','MODELO','SERIE','UBICACION','ESTADO']" :key="col">
              <input type="checkbox" :checked="(table && typeof table.getColumn === 'function' && table.getColumn(col) && table.getColumn(col).isVisible()) ?? true" @change.prevent="() => toggleColumnVisibility(col)" /> {{ col }}
            </label>
          </div>
        </details>

        <details class="palette-menu">
          <summary class="action-btn" aria-haspopup="true" aria-expanded="false">Paleta ▾</summary>
          <div class="palette-list">
            <div class="palette-row" v-for="s in statusOptions" :key="s">
              <label class="palette-label">{{ s }}</label>
              <input type="color" v-model="palette[s].bg" title="Color fondo" />
              <input type="color" v-model="palette[s].fg" title="Color texto" />
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="action-btn" @click.prevent="resetPalette">Restablecer paleta</button>
            </div>
          </div>
        </details>

        <details class="actions-menu">
          <summary class="action-btn" aria-haspopup="true" aria-expanded="false">Acciones ▾</summary>
          <div class="actions-list">
            <button class="action-btn" @click="downloadCSV" title="Descargar CSV">Descargar CSV</button>
            <button class="action-btn" @click="downloadXLSX" title="Descargar XLSX">Descargar XLSX</button>
            <div class="density-toggle">
              <label class="small-label">Densidad</label>
              <button class="action-btn" :class="{ active: density === 'normal' }" @click.prevent="setDensity('normal')">Normal</button>
              <button class="action-btn" :class="{ active: density === 'compact' }" @click.prevent="setDensity('compact')">Compacto</button>
            </div>
          </div>
        </details>

        <button @click="$emit('refresh')" class="action-btn refresh-btn" title="Actualizar datos" aria-label="Actualizar datos">↻</button>
      </div>
    </div>

    <div class="datatable-chips" v-if="globalSearch || groupBy || showPagination || pageSize > 0">
      <div class="chip" v-if="globalSearch">
        🔎 <strong>{{ globalSearch }}</strong>
        <button class="chip-close" @click="clearGlobalSearch" aria-label="Limpiar búsqueda">✕</button>
      </div>
      <div class="chip" v-if="groupBy">
        📂 Agrupar: <strong>{{ groupBy }}</strong>
        <button class="chip-close" @click="clearGroupBy" aria-label="Quitar agrupación">✕</button>
      </div>
      <div class="chip" v-if="showPagination">📄 Paginación</div>
      <div class="chip" v-if="pageSize > 0">✳ Tamaño: <strong>{{ pageSize }}</strong></div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando datos de inventario...</p>
    </div>

    <div v-else :class='["table-wrapper", density]' tabindex="0" aria-label="Tabla de inventario">
      <div ref="tableEl" class="tabulator-container" style="width: 100%; height: 100%;"></div>
    </div>

    <div class="datatable-pagination">
      <div class="pagination-info">Total: <strong>{{ items.length }}</strong> equipos</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, reactive, computed } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['refresh']);

const tableEl = ref(null);
let table = null;

const pageSizeOptions = [25, 50, 100, 250, 0]; // 0 => mostrar todo
const pageSize = ref(0); // por defecto mostrar todo
const showPagination = ref(false);
const globalSearch = ref('');
const statusOptions = ['Operativo', 'Mantenimiento', 'Fuera de Servicio'];
const groupBy = ref('');

// UX flags
const showAllColumns = ref(false)
const density = ref('normal')

// Palette (editable + persisted)
const paletteDefaults = {
  'Operativo': { bg: '#E6FFFA', fg: '#0f766e' },
  'Mantenimiento': { bg: '#FFFBEB', fg: '#92400E' },
  'Fuera de Servicio': { bg: '#FEF2F2', fg: '#7F1D1D' }
}
const palette = reactive(JSON.parse(JSON.stringify(paletteDefaults)))

const paletteCssVars = computed(() => ({
  '--status-operativo-bg': palette['Operativo'].bg,
  '--status-operativo-fg': palette['Operativo'].fg,
  '--status-mantenimiento-bg': palette['Mantenimiento'].bg,
  '--status-mantenimiento-fg': palette['Mantenimiento'].fg,
  '--status-fuera-bg': palette['Fuera de Servicio'].bg,
  '--status-fuera-fg': palette['Fuera de Servicio'].fg
}))

function applyPaletteToRoot() {
  try {
    const root = document.documentElement
    // Spanish keys
    root.style.setProperty('--status-operativo-bg', palette['Operativo'].bg)
    root.style.setProperty('--status-operativo-fg', palette['Operativo'].fg)
    root.style.setProperty('--status-mantenimiento-bg', palette['Mantenimiento'].bg)
    root.style.setProperty('--status-mantenimiento-fg', palette['Mantenimiento'].fg)
    root.style.setProperty('--status-fuera-bg', palette['Fuera de Servicio'].bg)
    root.style.setProperty('--status-fuera-fg', palette['Fuera de Servicio'].fg)
    // English/class mappings for other components
    root.style.setProperty('--status-available-bg', palette['Operativo'].bg)
    root.style.setProperty('--status-available-fg', palette['Operativo'].fg)
    root.style.setProperty('--status-maintenance-bg', palette['Mantenimiento'].bg)
    root.style.setProperty('--status-maintenance-fg', palette['Mantenimiento'].fg)
    root.style.setProperty('--status-unavailable-bg', palette['Fuera de Servicio'].bg)
    root.style.setProperty('--status-unavailable-fg', palette['Fuera de Servicio'].fg)
    // retired default
    root.style.setProperty('--status-retired-bg', '#94a3b8')
    root.style.setProperty('--status-retired-fg', '#cbd5e1')
  } catch (e) {}
}

function loadPaletteFromStorage() {
  try {
    const raw = localStorage.getItem('biomed.palette')
    if (!raw) return
    const stored = JSON.parse(raw)
    Object.keys(paletteDefaults).forEach(k => {
      if (stored[k]) {
        palette[k].bg = stored[k].bg || palette[k].bg
        palette[k].fg = stored[k].fg || palette[k].fg
      }
    })
    applyPaletteToRoot()
  } catch (e) {}
}
function savePaletteToStorage() {
  try { localStorage.setItem('biomed.palette', JSON.stringify(palette)) } catch (e) {}
  applyPaletteToRoot()
}
function resetPalette() { Object.keys(paletteDefaults).forEach(k => { palette[k].bg = paletteDefaults[k].bg; palette[k].fg = paletteDefaults[k].fg }); savePaletteToStorage() }

watch(palette, () => { try { savePaletteToStorage() } catch(e){} }, { deep: true })

function buildColumns(data) {
   const defaultOrder = ['No DE INVENTARIO','EQUIPO MEDICO','MARCA','MODELO','SERIE','UBICACION','ESTADO']

   // show all DB columns when enabled
   if (showAllColumns.value && Array.isArray(data) && data.length > 0) {
     const keys = Array.from(new Set(data.flatMap(r => Object.keys(r || {}))))
     keys.sort((a,b) => {
       const ia = defaultOrder.indexOf(a)
       const ib = defaultOrder.indexOf(b)
       if (ia !== -1 || ib !== -1) return (ia === -1 ? 1 : ia) - (ib === -1 ? 1 : ib)
       return String(a).localeCompare(String(b))
     })

     return keys.map((k) => {
       const col = { 
         title: k, 
         field: k, 
         headerFilter: 'input', 
         headerFilterPlaceholder: 'Filtrar',
         minWidth: 120,
         width: 150
       }
       if (k === 'EQUIPO MEDICO') col.width = 220
       if (k === 'No DE INVENTARIO') col.frozen = true
       if (k === 'ESTADO') {
         col.headerFilter = 'select'
         col.headerFilterParams = { values: ['', ...statusOptions] }
         col.width = 160
         col.formatter = (cell) => { const v = cell.getValue(); const map = { 'Operativo': 'operativo', 'Mantenimiento': 'mantenimiento', 'Fuera de Servicio': 'fuera' }; return `<span class="status-badge ${map[v] || ''}">${v || ''}</span>` }
       }
       return col
     })
   }

   // default column set - SHOW ALL COLUMNS FROM DB
   const allKeys = Array.from(new Set((data || []).flatMap(r => Object.keys(r || {}))))
   const marcas = Array.from(new Set((data || []).map(r => r['MARCA']).filter(Boolean))).slice(0, 100);
   const equipos = Array.from(new Set((data || []).map(r => r['EQUIPO MEDICO']).filter(Boolean))).slice(0, 100);

   // Build all columns with proper widths
   const allColumns = allKeys.map(k => {
     const col = {
       title: k,
       field: k,
       minWidth: 120,
       width: 150,
       headerFilter: 'input',
       headerFilterPlaceholder: 'Filtrar'
     }
     
     if (k === 'No DE INVENTARIO') col.frozen = true
     if (k === 'EQUIPO MEDICO') col.width = 220
     if (k === 'MARCA') col.headerFilterParams = { values: ['', ...marcas] }
     if (k === 'ESTADO') {
       col.headerFilter = 'select'
       col.headerFilterParams = { values: ['', ...statusOptions] }
       col.width = 160
       col.formatter = (cell) => {
         const v = cell.getValue();
         const map = { 'Operativo': 'operativo', 'Mantenimiento': 'mantenimiento', 'Fuera de Servicio': 'fuera' };
         return `<span class="status-badge ${map[v] || ''}">${v || ''}</span>`;
       }
     }
     return col
   })

   return allColumns;
 }

function createTable() {
  if (!tableEl.value) {
    console.warn('[BiomedicalInventoryDataTable] createTable: tableEl not mounted yet')
    return
  }
  if (table) table.destroy();

  try {
     table = new Tabulator(tableEl.value, {
       data: props.items || [],
       layout: 'fitColumns', // cambiado para permitir scroll horizontal
       layoutColumnsOnNewData: false,
       reactiveData: true,
       movableColumns: true,
       resizableRows: false,
       resizableColumns: true,
       columns: buildColumns(props.items),
       pagination: showPagination.value ? 'local' : false,
       paginationSize: pageSize.value || 25,
       paginationSizeSelector: pageSizeOptions.filter(s => s > 0),
       selectable: true,
       tooltips: true,
       virtualDom: true,
       virtualDomBuffer: 30,
       headerFilterPlaceholder: 'Filtrar',
       height: '100%',
       columnHeaderVertAlign: 'middle',
       headerVisible: true,
       textSize: 12
     });
   } catch (err) {
     console.error('[BiomedicalInventoryDataTable] Tabulator creation failed', err)
     table = null
   }
} 

watch(() => props.items, (v) => {
  if (!table) {
    if (tableEl.value) createTable()
    else return
  }

  try {
    if (table && typeof table.replaceData === 'function') {
      table.replaceData(v || [])
    } else if (table && typeof table.setData === 'function') {
      table.setData(v || [])
    } else if (table && typeof table.clearData === 'function' && typeof table.addData === 'function') {
      table.clearData()
      table.addData(v || [])
    }

    // rebuild columns so headerFilter select values update
    if (table && typeof table.setColumns === 'function') table.setColumns(buildColumns(v || []))
  } catch (e) {
    console.error('[BiomedicalInventoryDataTable] error updating table data', e)
    try { table?.destroy(); table = null; createTable(); } catch (e2) { /* swallow */ }
  }
}, { deep: true });

watch([pageSize, showPagination], () => {
  if (!table) return;
  table.setOptions({ pagination: showPagination.value ? 'local' : false, paginationSize: pageSize.value || 25 });
});

onMounted(async () => {
  await nextTick()
  loadPaletteFromStorage()
  applyPaletteToRoot()
  if (tableEl.value) {
    createTable()
  } else {
    const stop = watch(tableEl, (val) => {
      if (val) {
        createTable()
        stop()
      }
    })
  }
})

// rebuild columns when user toggles showAllColumns
watch(showAllColumns, (val) => {
  if (!table) return
  try { table.setColumns(buildColumns(props.items)) } catch (e) { /* ignore */ }
})

// create/destroy table when loading changes
watch(() => props.loading, (val) => {
  if (!val && !table && tableEl.value) {
    nextTick().then(() => { if (tableEl.value) createTable() })
  }
  if (val && table) {
    table?.destroy()
    table = null
  }
})
onBeforeUnmount(() => table?.destroy());

// toolbar actions
function downloadCSV() { table?.download('csv', 'inventario.csv'); }
function downloadXLSX() { table?.download('xlsx', 'inventario.xlsx', { sheetName: 'Inventario' }); }
function togglePagination() { showPagination.value = !showPagination.value; }
function setPageSize(e) { pageSize.value = Number(e.target.value); showPagination.value = pageSize.value > 0; if (table) table.setOptions({ pagination: showPagination.value ? 'local' : false, paginationSize: pageSize.value || 25 }); }
function setGroupBy(e) { const val = e.target.value; groupBy.value = val; table.setGroupBy(val || false); }

function toggleColumnVisibility(field) {
  if (!table || typeof table.getColumn !== 'function') return
  const col = table.getColumn(field)
  if (!col) return
  col.toggle()
} 

let __globalFilterFn = null;
function applyGlobalSearch() {
  const q = (globalSearch.value || '').trim().toLowerCase();
  if (!table) return;
  if (__globalFilterFn && typeof table.removeFilter === 'function') {
    table.removeFilter(__globalFilterFn)
    __globalFilterFn = null
  }
  if (!q) return;
  __globalFilterFn = function(data) {
    return ['No DE INVENTARIO','EQUIPO MEDICO','MARCA','MODELO','SERIE','UBICACION','ESTADO']
      .some((k) => (data[k] || '').toString().toLowerCase().includes(q))
  }
  if (typeof table.addFilter === 'function') table.addFilter(__globalFilterFn)
}

// density & small helpers for toolbar chips
const density = ref('normal')
function setDensity(mode) {
  density.value = mode
  if (table && typeof table.redraw === 'function') table.redraw(true)
}
function clearGlobalSearch() {
  globalSearch.value = ''
  applyGlobalSearch()
}
function clearGroupBy() {
  groupBy.value = ''
  if (table && typeof table.setGroupBy === 'function') table.setGroupBy(false)
}
</script>

<style scoped>
.maintenance-datatable-container{display:flex;flex-direction:column;gap:12px;padding:12px;color:#e2e8f0;background:linear-gradient(135deg,rgba(2,6,23,0.4),rgba(15,23,42,0.3));height:100%;min-height:100vh}
.datatable-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;background:rgba(2,6,23,0.6);border-radius:8px;border:1px solid rgba(34,211,238,0.1)}
.toolbar-section{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.toolbar-section.right{justify-content:flex-end}
.search-wrapper{position:relative;min-width:280px;display:flex}
.search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:rgba(34,211,238,0.5);pointer-events:none}
.search-input{padding:8px 12px 8px 36px;border-radius:6px;border:1px solid rgba(34,211,238,0.2);background:rgba(15,23,42,0.6);color:#e2e8f0;transition:all 0.2s;font-size:0.9rem}
.search-input:focus{outline:none;border-color:rgba(34,211,238,0.5);background:rgba(15,23,42,0.8);box-shadow:0 0 12px rgba(34,211,238,0.1)}
.search-input::placeholder{color:rgba(203,213,225,0.5)}
.search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;color:rgba(34,211,238,0.6);transition:color 0.2s;opacity:0.8}
.search-clear:hover{opacity:1;color:rgba(34,211,238,0.9)}
.quick-filters{display:flex;gap:6px;flex-wrap:wrap}
.filter-btn{padding:6px 12px;border-radius:6px;background:rgba(15,23,42,0.5);border:1px solid rgba(34,211,238,0.2);color:#e2e8f0;cursor:pointer;font-size:0.85rem;transition:all 0.2s}
.filter-btn:hover{background:rgba(34,211,238,0.1);border-color:rgba(34,211,238,0.4)}
.filter-btn.active{background:rgba(34,211,238,0.25);border-color:rgba(34,211,238,0.8);color:#22d3ee}
.table-wrapper{
  flex: 1;
  overflow: hidden;
  background:rgba(2,6,23,0.4);
  border-radius:8px;
  padding:8px;
  position: relative;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 4px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.5);
  border-radius: 4px;
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.8);
}
.simple-table{width:100%;border-collapse:collapse;color:inherit}
.simple-table th{position:sticky;top:0;background:rgba(2,6,23,0.6);padding:10px;text-align:left;cursor:pointer}
.simple-table td{padding:10px;border-top:1px solid rgba(255,255,255,0.04)}
.status-badge{padding:4px 8px;border-radius:6px;font-size:0.85em}
.status-badge.operativo{background:var(--status-operativo-bg);color:var(--status-operativo-fg)}
.status-badge.mantenimiento{background:var(--status-mantenimiento-bg);color:var(--status-mantenimiento-fg)}
.status-badge.fuera{background:var(--status-fuera-bg);color:var(--status-fuera-fg)}

/* Palette editor & menus */
.palette-list{display:flex;flex-direction:column;gap:12px;padding:12px;background:rgba(2,6,23,0.95);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.4)}
.palette-row{display:flex;align-items:center;gap:12px;padding:8px;border-radius:6px;background:rgba(15,23,42,0.5);transition:all 0.2s}
.palette-row:hover{background:rgba(15,23,42,0.8)}
.palette-label{min-width:110px;color:#cbd5e1;font-size:0.9rem;font-weight:500}
.palette-row input[type="color"]{width:40px;height:32px;border-radius:6px;border:2px solid rgba(34,211,238,0.3);padding:0;background:transparent;cursor:pointer;transition:border 0.2s}
.palette-row input[type="color"]:hover{border-color:rgba(34,211,238,0.8)}
.datatable-pagination{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px;background:rgba(2,6,23,0.5);border-radius:8px}
.empty{text-align:center;padding:20px;color:rgba(255,255,255,0.6)}
.action-btn{padding:8px 12px;border-radius:6px;background:rgba(15,23,42,0.6);border:1px solid rgba(34,211,238,0.2);cursor:pointer;color:#e2e8f0;font-size:0.9rem;transition:all 0.2s;font-weight:500}
.action-btn:hover{background:rgba(34,211,238,0.15);border-color:rgba(34,211,238,0.5);box-shadow:0 4px 12px rgba(34,211,238,0.1)}
.sort-ind{font-size:0.8em;margin-left:6px}
.columns-menu{position:relative;display:inline-block}
.columns-menu summary{list-style:none;cursor:pointer;padding:8px 12px;border-radius:6px;background:rgba(15,23,42,0.6);border:1px solid rgba(34,211,238,0.2);color:#e2e8f0;transition:all 0.2s;font-weight:500}
.columns-menu summary:hover{background:rgba(34,211,238,0.15);border-color:rgba(34,211,238,0.5)}
.columns-list{background:rgba(2,6,23,0.95);padding:12px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.5);margin-top:8px;min-width:260px;max-height:400px;overflow-y:auto}
.columns-list label{display:flex;align-items:center;gap:8px;padding:8px;border-radius:4px;font-size:0.9rem;cursor:pointer;transition:background 0.2s;color:#e2e8f0}
.columns-list label:hover{background:rgba(34,211,238,0.08)}
.columns-list input[type="checkbox"]{appearance:none;width:18px;height:18px;border:1.5px solid rgba(34,211,238,0.4);border-radius:4px;background:transparent;cursor:pointer;transition:all 0.2s}
.columns-list input[type="checkbox"]:checked{background:rgba(34,211,238,0.8);border-color:rgba(34,211,238,0.8)}
.small-label{font-size:0.8rem;color:rgba(203,213,225,0.9);margin-right:6px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.group-select{margin-right:8px;padding:8px 12px;border-radius:6px;background:rgba(15,23,42,0.6);border:1px solid rgba(34,211,238,0.2);color:#e2e8f0;cursor:pointer;font-size:0.9rem;transition:all 0.2s}
.group-select:hover{border-color:rgba(34,211,238,0.5);background:rgba(34,211,238,0.08)}

/* Row states, zebra, sticky header, compact density */
.table-wrapper.compact .tabulator-cell { padding: 6px 8px !important; font-size: 0.9rem !important; }
.tabulator-row:hover .tabulator-cell { background: rgba(255,255,255,0.02); }
.tabulator-row.tabulator-selected .tabulator-cell { background: rgba(59,130,246,0.08) !important; border-left: 3px solid rgba(59,130,246,0.4); }
.tabulator-row:nth-child(even) .tabulator-cell { background: rgba(255,255,255,0.01); }
.table-wrapper .tabulator-header { position: sticky; top: 0; z-index: 6; backdrop-filter: blur(4px); background: rgba(2,6,23,0.85); }

/* Filter chips */
.datatable-chips{display:flex;gap:8px;align-items:center;padding:12px 8px;flex-wrap:wrap}
.chip{background:rgba(34,211,238,0.12);padding:8px 12px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-size:0.9rem;color:#22d3ee;border:1px solid rgba(34,211,238,0.3);transition:all 0.2s}
.chip:hover{background:rgba(34,211,238,0.2);border-color:rgba(34,211,238,0.5)}
.chip-close{background:transparent;border:0;color:inherit;cursor:pointer;padding:0;margin-left:4px;opacity:0.8;transition:opacity 0.2s;font-weight:bold}
.chip-close:hover{opacity:1}
.actions-menu{position:relative;display:inline-block}
.actions-menu summary{list-style:none;cursor:pointer;padding:8px 12px;border-radius:6px;background:rgba(15,23,42,0.6);border:1px solid rgba(34,211,238,0.2);color:#e2e8f0;transition:all 0.2s;font-weight:500}
.actions-menu summary:hover{background:rgba(34,211,238,0.15);border-color:rgba(34,211,238,0.5)}
.actions-menu .actions-list{background:rgba(2,6,23,0.95);padding:12px;border-radius:8px;margin-top:8px;box-shadow:0 8px 24px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:8px;min-width:200px}
.actions-menu .action-btn{display:block;width:100%;text-align:left;padding:10px 12px}
.density-toggle{display:flex;gap:6px;align-items:center;padding:8px 0;border-top:1px solid rgba(34,211,238,0.1);margin-top:8px;padding-top:12px}
.density-toggle .action-btn{flex:1;padding:8px 10px;font-size:0.85rem}
.action-btn.active{background:rgba(34,211,238,0.25);border-color:rgba(34,211,238,0.8);color:#22d3ee}

/* Page size select */
.page-size-select{padding:8px 12px;border-radius:6px;background:rgba(15,23,42,0.6);border:1px solid rgba(34,211,238,0.2);color:#e2e8f0;cursor:pointer;font-size:0.9rem;transition:all 0.2s}
.page-size-select:hover{border-color:rgba(34,211,238,0.5);background:rgba(34,211,238,0.08)}
.page-size-select:focus{outline:none;border-color:rgba(34,211,238,0.5)}

/* Palette menu styling */
.palette-menu{position:relative;display:inline-block}
.palette-menu summary{list-style:none;cursor:pointer;padding:8px 12px;border-radius:6px;background:rgba(15,23,42,0.6);border:1px solid rgba(34,211,238,0.2);color:#e2e8f0;transition:all 0.2s;font-weight:500}
.palette-menu summary:hover{background:rgba(34,211,238,0.15);border-color:rgba(34,211,238,0.5)}
.palette-menu .palette-list{position:absolute;top:100%;right:0;z-index:1000}

/* Loading spinner */
.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px}
.spinner{width:40px;height:40px;border:4px solid rgba(34,211,238,0.2);border-top-color:rgba(34,211,238,0.8);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Tabulator overrides para scroll horizontal */
:deep(.tabulator-container) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

:deep(.tabulator) {
  font-family: inherit;
  font-size: 13px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.tabulator .tabulator-header) {
  background: rgba(2,6,23,0.85);
  border-bottom: 1px solid rgba(34,211,238,0.2);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

:deep(.tabulator .tabulator-tableholder) {
  flex: 1;
  overflow: auto;
  position: relative;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

:deep(.tabulator-row) {
  border-bottom: 1px solid rgba(34,211,238,0.1);
}

:deep(.tabulator-row:hover .tabulator-cell) {
  background: rgba(34,211,238,0.05);
}

:deep(.tabulator-cell) {
  padding: 10px 12px;
  color: #cbd5e1;
  white-space: nowrap;
}

:deep(.tabulator-header .tabulator-col) {
  border-right: 1px solid rgba(34,211,238,0.1);
  padding: 10px 12px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  min-width: 120px;
}

:deep(.tabulator-frozen) {
  position: sticky;
  left: 0;
  z-index: 5;
}
 </style>
