<template>
  <div v-if="visible" class="archived-panel-overlay" @click.self="close">
    <div class="archived-panel">
      <header class="archived-panel-header">
        <h3>Folios archivados</h3>
        <div class="controls">
          <select
            v-model="filterType"
            @change="refresh"
            aria-label="Filtrar por tipo"
            :class="['archived-type-select', filterType ? `archived-type--${filterType}` : 'archived-type--all']"
          >
            <option value="">Todos</option>
            <option value="entrada">Entradas (E)</option>
            <option value="salida">Salidas (S)</option>
            <option value="resguardo">Resguardos (R)</option>
            <option value="servicio">Servicios (O)</option>
          </select>
          <button class="btn small" @click="refresh">Recargar</button>
          <button class="btn ghost small" @click="close">Cerrar</button>
        </div>
      </header>

      <main class="archived-panel-body">
        <div v-if="loading" class="loader">Cargando...</div>
        <div v-else>
          <div v-if="items.length === 0" class="empty">No se encontraron archivos.</div>

          <ul class="archived-list">
            <template v-for="(node, nIdx) in groupedNodes" :key="`node-${nIdx}`">
              <li v-if="node.type === 'divider'" class="reset-separator">
                <div class="sep-line" aria-hidden></div>
                <div class="sep-text">REINICIO RECIENTE EL {{ formatDateShort(node.reset.timestamp) }}</div>
                <div class="sep-line" aria-hidden></div>
              </li>
              <template v-else>
                <li v-for="it in node.items" :key="it.id" class="archived-row">
                  <div class="left">
                    <div class="folio-row">
                      <span class="type-pill" :class="`type-${it.order_type || 'na'}`">{{ shortType(it.order_type) }}</span>
                      <strong class="folio">{{ it.folio || '—' }}</strong>
                      <span v-if="isArchivedCancelled(it)" class="status-pill canceled">Cancelada</span>
                    </div>
                    <span class="meta">{{ labelForType(it.order_type) }} • {{ formatDate(it.archived_at) }}</span>
                    <span v-if="formatArchivedBy(it.archived_by)" class="meta muted">Archivado por {{ formatArchivedBy(it.archived_by) }}</span>
                  </div>
                  <div class="right">
                    <button class="btn tiny" @click="viewItem(it)">Ver</button>
                    <button class="btn tiny ghost" :disabled="isArchivedCancelled(it)" @click="downloadItem(it)">
                      {{ isArchivedCancelled(it) ? 'Cancelada' : 'Descargar PDF' }}
                    </button>
                  </div>
                </li>
              </template>
            </template>
          </ul>
        </div>
      </main>

      <teleport to="body">
        <div v-if="showPayload" class="payload-modal" @click.self="closePayload">
          <div class="payload-card">
          <div class="payload-header">
            <div>
              <h4>Detalle de orden archivada</h4>
              <p class="payload-subtitle">{{ selectedItem?.folio || selectedItem?.id }} • {{ labelForType(selectedItem?.order_type) }}</p>
            </div>
            <button class="btn ghost small" @click="closePayload">Cerrar</button>
          </div>

          <div class="payload-grid">
            <section class="payload-section">
              <div class="section-title">Resumen</div>
              <div class="field-grid">
                <div v-for="row in selectedMeta" :key="row.label" class="field">
                  <span class="field-label">{{ row.label }}</span>
                  <span class="field-value">{{ row.value }}</span>
                </div>
              </div>
            </section>

            <section class="payload-section" v-if="selectedHighlights.length">
              <div class="section-title">Datos principales</div>
              <div class="field-grid">
                <div v-for="row in selectedHighlights" :key="row.label" class="field">
                  <span class="field-label">{{ row.label }}</span>
                  <span class="field-value">{{ row.value }}</span>
                </div>
              </div>
            </section>

            <section class="payload-section">
              <div class="section-title">Detalles</div>
              <div v-if="selectedDetails.length" class="field-grid">
                <div v-for="row in selectedDetails" :key="row.label" class="field">
                  <span class="field-label">{{ row.label }}</span>
                  <span class="field-value">{{ row.value }}</span>
                </div>
              </div>
              <div v-else class="empty">No hay detalles adicionales.</div>
            </section>

            <section class="payload-section">
              <div class="section-title">Bienes registrados</div>
              <div class="items-grid">
                <div v-if="selectedItems.equipos.length" class="items-group">
                  <div class="items-title">Equipos ({{ selectedItems.equipos.length }})</div>
                  <div class="items-list">
                    <div v-for="(it, idx) in selectedItems.equipos" :key="`eq-${idx}`" class="item-row">
                      <div>
                        <div class="item-name">{{ it.descripcion }}</div>
                        <div class="item-meta">Marca: {{ it.marca }} · Modelo: {{ it.modelo }} · Serie: {{ it.serie }}</div>
                        <div class="item-meta">Clave HRAEI: {{ it.claveHRAEI }} · Ubicacion: {{ it.ubicacion }}</div>
                      </div>
                      <div class="item-tags">
                        <span class="item-tag">x{{ it.cantidad }}</span>
                        <span class="item-tag" :class="it.isExternal ? 'tag-external' : 'tag-internal'">
                          {{ it.isExternal ? 'Externo' : 'Institucional' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedItems.accesorios.length" class="items-group">
                  <div class="items-title">Accesorios ({{ selectedItems.accesorios.length }})</div>
                  <div class="items-list">
                    <div v-for="(it, idx) in selectedItems.accesorios" :key="`acc-${idx}`" class="item-row">
                      <div>
                        <div class="item-name">{{ it.descripcion }}</div>
                        <div class="item-meta">Marca: {{ it.marca }} · Modelo: {{ it.modelo }} · Serie: {{ it.serie }}</div>
                        <div class="item-meta">Clave HRAEI: {{ it.claveHRAEI }} · Ubicacion: {{ it.ubicacion }}</div>
                      </div>
                      <div class="item-tags">
                        <span class="item-tag">x{{ it.cantidad }}</span>
                        <span class="item-tag" :class="it.isExternal ? 'tag-external' : 'tag-internal'">
                          {{ it.isExternal ? 'Externo' : 'Institucional' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedItems.consumibles.length" class="items-group">
                  <div class="items-title">Consumibles ({{ selectedItems.consumibles.length }})</div>
                  <div class="items-list">
                    <div v-for="(it, idx) in selectedItems.consumibles" :key="`con-${idx}`" class="item-row">
                      <div>
                        <div class="item-name">{{ it.descripcion }}</div>
                        <div class="item-meta">Marca: {{ it.marca }} · Modelo: {{ it.modelo }} · Lote: {{ it.lote }}</div>
                        <div class="item-meta">Clave HRAEI: {{ it.claveHRAEI }} · Ubicacion: {{ it.ubicacion }}</div>
                      </div>
                      <div class="item-tags">
                        <span class="item-tag">x{{ it.cantidad }}</span>
                        <span class="item-tag" :class="it.isExternal ? 'tag-external' : 'tag-internal'">
                          {{ it.isExternal ? 'Externo' : 'Institucional' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedItems.refacciones.length" class="items-group">
                  <div class="items-title">Refacciones ({{ selectedItems.refacciones.length }})</div>
                  <div class="items-list">
                    <div v-for="(it, idx) in selectedItems.refacciones" :key="`ref-${idx}`" class="item-row">
                      <div>
                        <div class="item-name">{{ it.descripcion }}</div>
                        <div class="item-meta">Marca: {{ it.marca }} · Modelo: {{ it.modelo }} · Referencia: {{ it.referencia }}</div>
                        <div class="item-meta">Clave HRAEI: {{ it.claveHRAEI }} · Ubicacion: {{ it.ubicacion }}</div>
                      </div>
                      <div class="item-tags">
                        <span class="item-tag">x{{ it.cantidad }}</span>
                        <span class="item-tag" :class="it.isExternal ? 'tag-external' : 'tag-internal'">
                          {{ it.isExternal ? 'Externo' : 'Institucional' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!selectedItems.equipos.length && !selectedItems.accesorios.length && !selectedItems.consumibles.length && !selectedItems.refacciones.length" class="empty">
                  No se encontraron bienes en esta orden.
                </div>
              </div>
            </section>
          </div>
          </div>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { authedFetch } from '@/utils/api.js'
import { usePermissions } from '@/composables/usePermissions.js'

const emit = defineEmits(['open', 'close'])
const props = defineProps({
  initialType: { type: String, default: '' }
})
const { isAdmin } = usePermissions()

const visible = ref(false)
const loading = ref(false)
const items = ref([])
const filterType = ref('')

// Historial de reinicios (cintillos)
const resets = ref([])

const showPayload = ref(false)
const selectedItem = ref(null)
const selectedPayload = ref(null)
const selectedHighlights = ref([])
const selectedDetails = ref([])
const selectedMeta = ref([])
const selectedItems = ref({ equipos: [], accesorios: [], consumibles: [], refacciones: [] })

const DISPLAY_LABELS = {
  folio: 'Folio',
  folio_asociado: 'Folio asociado',
  folioAsociado: 'Folio asociado',
  orden_asociada: 'Orden asociada',
  ordenAsociada: 'Orden asociada',
  estado: 'Estado',
  prioridad: 'Prioridad',
  descripcion: 'Descripcion',
  descripcion_reporte: 'Descripcion del reporte',
  descripcionReporte: 'Descripcion del reporte',
  motivoResguardo: 'Motivo de resguardo',
  motivo_resguardo: 'Motivo de resguardo',
  motivoEntrada: 'Motivo de entrada',
  motivoSalida: 'Motivo de salida',
  motivoServicio: 'Motivo de servicio',
  motivo: 'Motivo',
  observaciones: 'Observaciones',
  observacionesEntrada: 'Observaciones',
  observacionesSalida: 'Observaciones',
  nombreIngeniero: 'Ingeniero responsable',
  ingeniero: 'Ingeniero responsable',
  responsable: 'Responsable',
  servicio: 'Servicio',
  especialidad: 'Especialidad',
  fecha: 'Fecha',
  fechaSolicitud: 'Fecha de solicitud',
  fecha_solicitud: 'Fecha de solicitud',
  horaInicio: 'Hora de inicio',
  hora_inicio: 'Hora de inicio',
  horaTermino: 'Hora de termino',
  hora_termino: 'Hora de termino',
  tipo: 'Tipo',
  tipo_equipo: 'Tipo',
  marca: 'Marca',
  modelo: 'Modelo',
  serie: 'Serie',
  claveHRAEI: 'Clave HRAEI',
  noInventario: 'No. inventario',
  ubicacion: 'Ubicacion',
  cantidad: 'Cantidad',
  cantidad_solicitada: 'Cantidad solicitada',
  cantidad_entregada: 'Cantidad entregada',
  unidad: 'Unidad',
  area: 'Area',
  departamento: 'Departamento',
  paciente: 'Paciente',
  cama: 'Cama',
  turno: 'Turno',
  diagnostico: 'Diagnostico',
  created_at: 'Creado',
  updated_at: 'Actualizado',
  createdAt: 'Creado',
  updatedAt: 'Actualizado'
}

const SIGNATURE_LABELS = {
  firma_ingeniero_name: 'Firma del ingeniero',
  firma_subdireccion_name: 'Firma de subdireccion',
  firma_recibe_name: 'Firma de quien recibe',
  firma_entrega_name: 'Firma de quien entrega',
  firma_vigilancia_name: 'Firma de vigilancia',
  firma_admin_name: 'Firma administrativa',
  firma_resguardo_name: 'Firma de resguardo',
  firma_salida_name: 'Firma de salida'
}

const DETAIL_KEY_ORDER = [
  'folio_asociado',
  'folioAsociado',
  'orden_asociada',
  'ordenAsociada',
  'estado',
  'prioridad',
  'motivoResguardo',
  'motivo_resguardo',
  'motivoEntrada',
  'motivoSalida',
  'motivoServicio',
  'motivo',
  'descripcion',
  'descripcion_reporte',
  'descripcionReporte',
  'observaciones',
  'observacionesEntrada',
  'observacionesSalida',
  'nombreIngeniero',
  'ingeniero',
  'responsable',
  'servicio',
  'especialidad',
  'fecha',
  'fechaSolicitud',
  'fecha_solicitud',
  'horaInicio',
  'hora_inicio',
  'horaTermino',
  'hora_termino',
  'tipo',
  'tipo_equipo',
  'marca',
  'modelo',
  'serie',
  'claveHRAEI',
  'noInventario',
  'ubicacion',
  'cantidad',
  'cantidad_solicitada',
  'cantidad_entregada',
  'unidad',
  'area',
  'departamento',
  'paciente',
  'cama',
  'turno',
  'diagnostico',
  'created_at',
  'updated_at',
  'createdAt',
  'updatedAt'
]

const HIDE_KEYS = new Set([
  'extra_fields_json',
  'extraFieldsJson',
  'payload',
  'raw',
  'json',
  'order_type',
  'orderType',
  'archived_at',
  'archived_by',
  'created_by',
  'updated_by',
  'user_id',
  'id'
])

const externalHintKeywords = ['comodato', 'donacion', 'donación', 'externo', 'prestamo', 'préstamo', 'proveedor']

function isArchivedCancelled(item) {
  if (!item) return false
  if (item.is_cancelled === true) return true
  const status = item.status || item.estado || ''
  if (!status) return false
  return String(status).toLowerCase().includes('cancel')
}

function labelForType(t) {
  if (!t) return '—'
  if (t === 'entrada') return 'Entrada (E)'
  if (t === 'salida') return 'Salida (S)'
  if (t === 'resguardo') return 'Resguardo (R)'
  if (t === 'servicio') return 'Servicio (O)'
  return t
}

function formatDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString() } catch { return String(d) }
}

function formatDateShort(d) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('es-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch { return String(d) }
}

function shortType(t) {
  if (!t) return '—'
  if (t === 'entrada') return 'E'
  if (t === 'salida') return 'S'
  if (t === 'resguardo') return 'R'
  if (t === 'servicio') return 'O'
  return String(t).slice(0, 1).toUpperCase()
}

function isDateString(value) {
  if (!value || typeof value !== 'string') return false
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) || /\d{4}-\d{2}-\d{2}/.test(value)
}

function isTimeString(value) {
  if (!value || typeof value !== 'string') return false
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'string') return String(value)
  return value.trim()
}

function formatArchivedBy(value) {
  const name = normalizeText(value)
  if (!name) return ''
  if (name.toLowerCase() === 'dev') return 'Sistema'
  return name
}

function normalizeValue(key, value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '—'
    const upper = trimmed.toUpperCase()
    if (upper === 'PENDING' || upper === 'PENDIENTE') return 'Pendiente'
    if (upper === 'N/A' || upper === 'NA') return 'No aplica'
    if (upper === 'DEV' && key === 'archived_by') return 'Sistema'
    return trimmed
  }
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  return value
}

function normalizeItemValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value).trim() || '—'
}

function isItemExternalHeuristic(item) {
  if (!item) return false
  if (Boolean(item?.isExternal ?? item?.is_external)) return true
  const label = `${item?.descripcion || item?.nombre || item?.claveHRAEI || item?.clave_hraei || item?.label || ''}`.toLowerCase()
  return externalHintKeywords.some(k => label.includes(k))
}

function normalizeItem(item, fallbackType = 'Equipo') {
  const desc = normalizeItemValue(item?.descripcion || item?.nombre || item?.label || item?.descripcion_item)
  const qty = item?.cantidad ?? item?.quantity ?? 1
  const tipo = item?.tipo || fallbackType
  const consumibleEstado = item?.consumibleEstado || item?.consumible_estado || ''
  return {
    descripcion: desc,
    cantidad: qty,
    marca: normalizeItemValue(item?.marca),
    modelo: normalizeItemValue(item?.modelo),
    serie: normalizeItemValue(item?.serie),
    lote: normalizeItemValue(item?.lote),
    referencia: normalizeItemValue(item?.referencia),
    ubicacion: normalizeItemValue(item?.ubicacion),
    claveHRAEI: normalizeItemValue(item?.claveHRAEI || item?.clave_hraei || item?.clave),
    tipo,
    consumibleEstado,
    isExternal: isItemExternalHeuristic(item)
  }
}

function splitItems(payload) {
  const result = { equipos: [], accesorios: [], consumibles: [], refacciones: [] }
  if (!payload || typeof payload !== 'object') return result
  const root = payload.orden || payload.order || payload
  const itemsContainer = Array.isArray(payload.items) ? payload.items : null

  const hasExplicit = ['equipos', 'accesorios', 'consumibles', 'refacciones'].some(
    key => Array.isArray(root[key]) && root[key].length
  )

  if (hasExplicit) {
    result.equipos = (root.equipos || []).map(it => normalizeItem(it, 'Equipo'))
    result.accesorios = (root.accesorios || []).map(it => normalizeItem(it, 'Accesorio'))
    result.consumibles = (root.consumibles || []).map(it => normalizeItem(it, 'Consumible'))
    result.refacciones = (root.refacciones || []).map(it => normalizeItem(it, 'Refaccion'))
    return result
  }

  const base = itemsContainer
    || (Array.isArray(root.equiposEntrada) ? root.equiposEntrada
      : Array.isArray(root.equipos_entrada) ? root.equipos_entrada
        : Array.isArray(root.items) ? root.items
          : [])

  base.forEach(it => {
    const raw = String(it?.tipo || it?.categoria || it?.tipo_articulo || '').toLowerCase()
    if (raw.includes('acces')) result.accesorios.push(normalizeItem(it, 'Accesorio'))
    else if (raw.includes('consum')) result.consumibles.push(normalizeItem(it, 'Consumible'))
    else if (raw.includes('refacc')) result.refacciones.push(normalizeItem(it, 'Refaccion'))
    else result.equipos.push(normalizeItem(it, 'Equipo'))
  })

  return result
}

function formatValue(value, key = '') {
  const normalized = normalizeValue(key, value)
  if (normalized === '—') return '—'
  if (typeof normalized === 'number') return String(normalized)
  if (typeof normalized === 'string') {
    if (isDateString(normalized)) {
      try { return new Date(normalized).toLocaleString('es-MX') } catch { return normalized }
    }
    if (isTimeString(normalized)) {
      return normalized.slice(0, 5)
    }
    return normalized
  }
  if (Array.isArray(normalized)) return `${normalized.length} elementos`
  if (typeof normalized === 'object') {
    const keys = Object.keys(normalized || {})
    return keys.length ? `${keys.length} campos` : 'Objeto'
  }
  return String(normalized)
}

function makeLabel(key) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function getPayloadRoot(payload) {
  if (!payload || typeof payload !== 'object') return {}
  if (payload.orden && typeof payload.orden === 'object') return payload.orden
  if (payload.order && typeof payload.order === 'object') return payload.order
  return payload
}

function addItemsCount(rows, root) {
  if (!root || typeof root !== 'object') return
  const candidates = [
    { key: 'equiposEntrada', label: 'Articulos' },
    { key: 'equiposSalida', label: 'Articulos' },
    { key: 'equipos', label: 'Articulos' },
    { key: 'items', label: 'Articulos' },
    { key: 'articulos', label: 'Articulos' }
  ]
  for (const c of candidates) {
    if (Array.isArray(root[c.key])) {
      rows.push({ label: c.label, value: `${root[c.key].length} elementos` })
      return
    }
  }
}

function pickFirstValue(root, keys) {
  for (const key of keys) {
    if (root && Object.prototype.hasOwnProperty.call(root, key) && root[key] !== undefined) {
      return { key, value: root[key] }
    }
  }
  return null
}

function buildHighlights(root) {
  const highlights = []
  const usedKeys = new Set()
  const pick = (label, keys) => {
    const found = pickFirstValue(root, keys)
    if (found) {
      const value = formatValue(found.value, found.key)
      if (value && value !== '—') {
        highlights.push({ label, value })
        usedKeys.add(found.key)
      }
    }
  }

  pick('Solicitante', ['nombreSolicitante', 'solicitante', 'nombre_solicitante'])
  pick('Servicio', ['servicio', 'nombreServicio', 'servicio_solicitante'])
  pick('Especialidad', ['especialidad', 'especialidad_solicitante'])
  pick('Motivo', ['motivoEntrada', 'motivoSalida', 'motivoResguardo', 'motivoServicio', 'motivo'])
  pick('Descripcion', ['descripcion', 'descripcionServicio', 'descripcion_resguardo', 'descripcion_orden'])
  pick('Observaciones', ['observaciones', 'observacionesEntrada', 'observacionesSalida'])
  pick('Ingeniero', ['nombreIngeniero', 'ingeniero', 'responsable', 'nombre_responsable'])
  pick('Fecha', ['fecha', 'fechaSolicitud', 'fecha_solicitud'])
  pick('Hora inicio', ['horaInicio', 'hora_inicio'])
  pick('Hora termino', ['horaTermino', 'hora_termino'])
  pick('Tipo', ['tipo', 'tipo_equipo'])

  return { highlights, usedKeys }
}

function buildDetails(root, usedKeys) {
  if (!root || typeof root !== 'object') return []
  const rows = []

  for (const key of DETAIL_KEY_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(root, key)) continue
    if (usedKeys && usedKeys.has(key)) continue
    if (HIDE_KEYS.has(key)) continue
    const value = formatValue(root[key], key)
    if (!value || value === '—') continue
    const label = DISPLAY_LABELS[key] || makeLabel(key)
    rows.push({ label, value })
  }

  for (const [key, label] of Object.entries(SIGNATURE_LABELS)) {
    if (!Object.prototype.hasOwnProperty.call(root, key)) continue
    if (usedKeys && usedKeys.has(key)) continue
    const value = formatValue(root[key], key)
    if (!value || value === '—') continue
    rows.push({ label, value })
  }

  addItemsCount(rows, root)

  return rows.slice(0, 28)
}

function buildMeta(item) {
  const archivedByLabel = formatArchivedBy(item?.archived_by)
  const meta = [
    { label: 'Folio', value: item?.folio || item?.id || '—' },
    { label: 'Tipo', value: labelForType(item?.order_type) },
    { label: 'Archivado', value: formatDate(item?.archived_at) }
  ]
  if (archivedByLabel) {
    meta.push({ label: 'Archivado por', value: archivedByLabel })
  }
  return meta
}

async function refresh() {
  if (!isAdmin.value) return
  loading.value = true
  try {
    const q = filterType.value ? `?type=${encodeURIComponent(filterType.value)}&limit=200` : '?limit=200'
    const res = await authedFetch(`/api/ops/archived-folios${q}`)
    const json = await res.json().catch(() => ({}))
    items.value = Array.isArray(json.items)
      ? json.items
      : Array.isArray(json.rows)
        ? json.rows
        : Array.isArray(json.data)
          ? json.data
          : (json.items || [])
  } catch (e) {
    console.warn('Error fetching archived folios', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

async function open(type = '') {
  if (!isAdmin.value) return
  if (type) {
    filterType.value = String(type)
  } else if (!filterType.value && props.initialType) {
    filterType.value = String(props.initialType)
  }
  visible.value = true
  // Limpiar todos los registros anteriores y comenzar desde cero
  try {
    resets.value = []
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('folios_reset_history')
    }
  } catch (e) { console.warn('[ArchivedFoliosPanel] failed to clear reset history', e) }
  await refresh()
  try { emit && emit('open') } catch (e) {}
}

function close() { 
  visible.value = false
  try { emit && emit('close') } catch (e) {}
}

function handleResetEvent(e) {
  try {
    const d = e && e.detail ? e.detail : null
    if (!d) return
    const exists = resets.value.some(r => String(r.timestamp) === String(d.timestamp) && String(r.type) === String(d.type))
    if (exists) return
    const entry = { id: `${d.timestamp}_${Math.random().toString(36).slice(2,8)}`, type: d.type, timestamp: d.timestamp || (new Date()).toISOString(), summary: d.summary }
  resets.value.unshift(entry)
  if (resets.value.length > 10) resets.value.splice(10)
  } catch (err) { console.warn('[ArchivedFoliosPanel] handleResetEvent failed', err) }
}

onMounted(() => {
  if (typeof window !== 'undefined') window.addEventListener('folios:reset', handleResetEvent)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('folios:reset', handleResetEvent)
})

const groupedNodes = computed(() => {
  const nodes = []
  const tsOf = (v) => {
    const t = new Date(v)
    const n = t.getTime()
    return Number.isFinite(n) && !Number.isNaN(n) ? n : 0
  }
  const sortedItems = (items.value || []).slice().sort((a, b) => tsOf(b.archived_at) - tsOf(a.archived_at))
  const resetsSorted = (resets.value || []).slice().sort((a, b) => tsOf(b.timestamp) - tsOf(a.timestamp))
  let remaining = sortedItems
  for (const r of resetsSorted) {
    try {
      const boundary = tsOf(r.timestamp)
      const newer = remaining.filter(it => tsOf(it.archived_at) > boundary)
      if (newer.length) nodes.push({ type: 'items', items: newer })
      nodes.push({ type: 'divider', reset: r })
      remaining = remaining.filter(it => tsOf(it.archived_at) <= boundary)
    } catch (e) {
      // if something goes wrong, skip this reset
      console.warn('[ArchivedFoliosPanel] grouping by reset failed for', r, e)
    }
  }
  if (remaining.length) nodes.push({ type: 'items', items: remaining })
  return nodes
})

async function viewItem(it) {
  if (!it || !it.id) return
  try {
    const res = await authedFetch(`/api/ops/archived-folios/${it.id}`)
    const json = await res.json()
    const payload = json.item && json.item.payload ? json.item.payload : (json.item || {})
    const root = getPayloadRoot(payload)
    const { highlights, usedKeys } = buildHighlights(root)
    selectedItem.value = it
    selectedPayload.value = root
    selectedHighlights.value = highlights
    selectedDetails.value = buildDetails(root, usedKeys)
    selectedMeta.value = buildMeta(it)
    selectedItems.value = splitItems(payload)
    showPayload.value = true
  } catch (e) {
    selectedPayload.value = null
    selectedHighlights.value = []
    selectedDetails.value = [{ label: 'Error', value: String(e && e.message ? e.message : e) }]
    selectedMeta.value = buildMeta(it)
    selectedItems.value = { equipos: [], accesorios: [], consumibles: [], refacciones: [] }
    showPayload.value = true
  }
}

function closePayload() { 
  showPayload.value = false
  selectedItem.value = null
  selectedPayload.value = null
  selectedHighlights.value = []
  selectedDetails.value = []
  selectedMeta.value = []
  selectedItems.value = { equipos: [], accesorios: [], consumibles: [], refacciones: [] }
}

function downloadItem(it) {
  if (!it || !it.id) return
  if (isArchivedCancelled(it)) {
    console.warn('Orden cancelada: descarga no permitida')
    return
  }
  (async () => {
    try {
      const res = await authedFetch(`/api/ops/archived-folios/${it.id}/pdf`)
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        const msg = errJson && (errJson.msg || errJson.error) ? (errJson.msg || errJson.error) : 'No se pudo descargar el PDF'
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${it.order_type || 'orden'}_${(it.folio || it.id)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.warn('Error downloading archived PDF', e)
    }
  })()
}

// Expose methods for parent
defineExpose({ open, close, refresh })
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ARCHIVED FOLIO PANEL - Premium UI/UX with Perfect Spacing & Stacking
   ═══════════════════════════════════════════════════════════════════════════ */

/* Overlay: subtle backdrop with safe z-index to avoid topbar conflict */
.archived-panel-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(5, 8, 15, 0.78); 
  backdrop-filter: blur(4px);
  display: flex; 
  align-items: flex-start; 
  justify-content: center; 
  padding: 0 24px 32px; 
  padding-top: max(calc(var(--topbar-top) + var(--topbar-height) + 28px), 120px); 
  z-index: 11500;
  overflow: auto;
  scroll-behavior: smooth;
}

/* Archived type selector - pill / segmented look */
.archived-panel-header .controls {
  display: flex;
  gap: 8px;
  align-items: center;
}


.archived-panel-header .controls select.archived-type-select {
  -webkit-appearance: none;
  appearance: none;
  border-radius: 20px;
  padding: 8px 16px;
  min-width: 160px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding-right: 40px;
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNikiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=");
}

.archived-panel-header .controls select.archived-type-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.archived-panel-header .controls select.archived-type-select.archived-type--all {
  border-color: rgba(255,255,255,0.06);
}

.archived-panel-header .controls select.archived-type-select.archived-type--entrada {
  border-color: rgba(34,197,94,0.85);
  box-shadow: 0 6px 24px rgba(34,197,94,0.06);
  background: linear-gradient(180deg, rgba(34,197,94,0.03), rgba(255,255,255,0.01));
}

.archived-panel-header .controls select.archived-type-select.archived-type--salida {
  border-color: rgba(59,130,246,0.85);
  box-shadow: 0 6px 24px rgba(59,130,246,0.06);
  background: linear-gradient(180deg, rgba(59,130,246,0.03), rgba(255,255,255,0.01));
}

.archived-panel-header .controls select.archived-type-select.archived-type--resguardo {
  border-color: rgba(250,204,21,0.85);
  box-shadow: 0 6px 24px rgba(250,204,21,0.06);
  background: linear-gradient(180deg, rgba(250,204,21,0.03), rgba(255,255,255,0.01));
}

.archived-panel-header .controls select.archived-type-select.archived-type--servicio {
  border-color: rgba(168,85,247,0.85);
  box-shadow: 0 6px 24px rgba(168,85,247,0.06);
  background: linear-gradient(180deg, rgba(168,85,247,0.03), rgba(255,255,255,0.01));
}

/* Slightly dim the arrow on hover for clarity */
.archived-panel-header .controls select.archived-type-select option {
  background: rgba(10, 16, 28, 0.95);
  color: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  font-weight: 500;
}


/* Main panel: glassmorphism premium design */
.archived-panel { 
  background: linear-gradient(135deg, 
    rgba(14, 23, 38, 0.95) 0%,
    rgba(12, 20, 34, 0.95) 50%,
    rgba(10, 16, 28, 0.95) 100%);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  color: #f1f5f9;
  width: min(1140px, 100% - 48px); 
  max-height: calc(100vh - 180px);
  border-radius: 18px;
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 0 40px rgba(46, 221, 90, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.52);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Panel header: clean and actionable */
.archived-panel-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.archived-panel-header h3 { 
  margin: 0; 
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: 0.02em;
}

.controls { 
  display: flex; 
  gap: 10px; 
  align-items: center;
  flex-wrap: wrap;
}

.controls select { 
  background: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 7px 11px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.controls select:hover { 
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.controls select:focus { 
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.15);
  border-color: rgba(46, 221, 90, 0.5);
}

/* Body: scrollable content area */
.archived-panel-body { 
  padding: 14px 16px;
  overflow: auto;
  flex: 1;
  scroll-behavior: smooth;
}

.archived-panel-body::-webkit-scrollbar {
  width: 8px;
}

.archived-panel-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.archived-panel-body::-webkit-scrollbar-thumb {
  background: rgba(46, 221, 90, 0.3);
  border-radius: 4px;
}

.archived-panel-body::-webkit-scrollbar-thumb:hover {
  background: rgba(46, 221, 90, 0.5);
}

/* List of archived items */
.archived-list { 
  list-style: none; 
  margin: 0; 
  padding: 0;
}

.reset-separator {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(96, 165, 250, 0.24);
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(8, 15, 26, 0.38);
  margin: 18px 0;
}

.reset-separator .sep-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.45), transparent);
}

.reset-separator .sep-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.88);
  border-radius: 999px;
  color: #eef2ff;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.reset-separator .sep-text::before {
  content: '🔄';
  display: inline-flex;
  font-size: 0.95rem;
}

.archived-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  gap: 16px; 
  padding: 14px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
  border-radius: 8px;
}

.archived-row:hover {
  background: rgba(46, 221, 90, 0.05);
  border-color: rgba(46, 221, 90, 0.15);
  padding-left: 14px;
  padding-right: 14px;
}

/* Status badge for canceled orders */
.status-pill { 
  font-size: 0.65rem; 
  padding: 4px 9px; 
  border-radius: 999px; 
  border: 1px solid rgba(255, 255, 255, 0.18); 
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.08);
}

.status-pill.canceled { 
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fecaca;
  font-weight: 600;
}

/* Left section of row */
.archived-row .left { 
  display: flex; 
  flex-direction: column; 
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.folio-row { 
  display: flex; 
  align-items: center; 
  gap: 10px;
}

.archived-row .folio { 
  display: block; 
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  word-break: break-word;
}

.archived-row .meta { 
  display: block; 
  font-size: 0.82rem; 
  color: rgba(255, 255, 255, 0.65);
}

.archived-row .meta.muted { 
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.78rem;
}

/* Type pills with distinct colors */
.type-pill { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  min-width: 28px; 
  height: 24px; 
  border-radius: 6px;
  font-size: 0.65rem; 
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #fff;
  flex-shrink: 0;
}

.type-entrada { 
  background: rgba(34, 197, 94, 0.22);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #d1fae5;
}

.type-salida { 
  background: rgba(59, 130, 246, 0.22);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #dbeafe;
}

.type-resguardo { 
  background: rgba(250, 204, 21, 0.18);
  border: 1px solid rgba(250, 204, 21, 0.35);
  color: #fef08a;
}

.type-servicio { 
  background: rgba(168, 85, 247, 0.22);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #e9d5ff;
}

.type-na { 
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* Right section buttons */
.archived-row .right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAYLOAD MODAL - Detailed View of Archived Item
   ═══════════════════════════════════════════════════════════════════════════ */

.payload-modal { 
  position: fixed; 
  inset: 0; 
  display: flex; 
  align-items: flex-start; 
  justify-content: center; 
  background: rgba(5, 8, 15, 0.82);
  backdrop-filter: blur(6px);
  z-index: 12500;
  padding: max(calc(var(--topbar-top) + var(--topbar-height) + 24px), 120px) 24px 32px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  pointer-events: auto;
}

.payload-card { 
  background: linear-gradient(135deg,
    rgba(15, 24, 40, 0.95) 0%,
    rgba(12, 20, 35, 0.95) 50%,
    rgba(10, 17, 30, 0.95) 100%);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  color: #f1f5f9;
  width: min(1000px, 100%);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 0 40px rgba(46, 221, 90, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.55);
  margin-bottom: 24px;
}

.payload-card::-webkit-scrollbar {
  width: 8px;
}

.payload-card::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
}

.payload-card::-webkit-scrollbar-thumb {
  background: rgba(46, 221, 90, 0.3);
  border-radius: 4px;
}

.payload-card::-webkit-scrollbar-thumb:hover {
  background: rgba(46, 221, 90, 0.5);
}

.payload-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  gap: 16px; 
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.payload-header h4 { 
  margin: 0; 
  font-size: 1.15rem;
  font-weight: 600;
  color: #f8fafc;
}

.payload-subtitle { 
  margin: 6px 0 0 0; 
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
}

/* Grid of sections */
.payload-grid { 
  display: grid; 
  gap: 16px;
}

.payload-section { 
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  transition: all 0.2s ease;
}

.payload-section:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.section-title { 
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 12px;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
  gap: 12px;
}

.field { 
  background: rgba(8, 14, 23, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex; 
  flex-direction: column; 
  gap: 5px;
  transition: all 0.2s ease;
}

.field:hover {
  background: rgba(8, 14, 23, 0.7);
  border-color: rgba(46, 221, 90, 0.2);
}

.field-label { 
  font-size: 0.68rem; 
  letter-spacing: 0.06em; 
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

.field-value { 
  font-size: 0.92rem;
  color: #f1f5f9;
  font-weight: 500;
  word-break: break-word;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON STYLES - Consistent and Clear
   ═══════════════════════════════════════════════════════════════════════════ */

.btn { 
  padding: 7px 12px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(46, 221, 90, 0.85), rgba(34, 197, 94, 0.8));
  color: #fff;
  border: 1px solid rgba(46, 221, 90, 0.3);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(46, 221, 90, 0.95), rgba(34, 197, 94, 0.9));
  border-color: rgba(46, 221, 90, 0.5);
  box-shadow: 0 4px 12px rgba(46, 221, 90, 0.25);
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(46, 221, 90, 0.2);
}

.btn.ghost { 
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.btn.ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.btn:disabled { 
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.small { 
  padding: 6px 9px; 
  font-size: 0.8rem;
}

.btn.tiny { 
  padding: 5px 8px; 
  font-size: 0.75rem;
  border-radius: 7px;
}

/* States and feedback */
.loader { 
  padding: 32px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.empty { 
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.95rem;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ITEMS GRID - Goods/Equipment Display
   ═══════════════════════════════════════════════════════════════════════════ */

.items-grid { 
  display: grid; 
  gap: 14px;
}

.items-group { 
  background: rgba(8, 14, 23, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s ease;
}

.items-group:hover {
  border-color: rgba(46, 221, 90, 0.2);
  background: rgba(8, 14, 23, 0.45);
}

.items-title { 
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.items-list { 
  display: grid; 
  gap: 9px;
}

.item-row { 
  display: flex; 
  align-items: flex-start; 
  justify-content: space-between; 
  gap: 12px; 
  padding: 10px 11px;
  border-radius: 9px;
  background: rgba(15, 25, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.item-row:hover {
  background: rgba(15, 25, 40, 0.85);
  border-color: rgba(46, 221, 90, 0.2);
  box-shadow: 0 2px 8px rgba(46, 221, 90, 0.1);
}

.item-name { 
  font-weight: 600;
  color: #f8fafc;
  font-size: 0.93rem;
}

.item-meta { 
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.65);
  margin-top: 3px;
}

.item-tags { 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
  align-items: flex-end;
  flex-shrink: 0;
}

.item-tag { 
  font-size: 0.7rem;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(248, 250, 252, 0.95);
  background: rgba(255, 255, 255, 0.08);
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tag-external { 
  background: rgba(249, 115, 22, 0.2);
  border-color: rgba(249, 115, 22, 0.45);
  color: #fed7aa;
}

.tag-external:hover {
  background: rgba(249, 115, 22, 0.3);
  border-color: rgba(249, 115, 22, 0.6);
}

.tag-internal { 
  background: rgba(34, 197, 94, 0.18);
  border-color: rgba(34, 197, 94, 0.35);
  color: #dcfce7;
}

.tag-internal:hover {
  background: rgba(34, 197, 94, 0.28);
  border-color: rgba(34, 197, 94, 0.5);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE DESIGN - Mobile & Tablet
   ═══════════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .archived-panel-overlay {
    padding: 0 16px 24px;
    padding-top: max(calc(var(--topbar-top) + var(--topbar-height) + 20px), 100px);
  }

  .archived-panel {
    width: 100%;
    max-height: calc(100vh - 140px);
  }

  .archived-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .archived-row .right {
    width: 100%;
  }

  .archived-row .right .btn {
    flex: 1;
    justify-content: center;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .payload-modal {
    padding: max(calc(var(--topbar-top) + var(--topbar-height) + 20px), 100px) 16px 24px;
  }

  .payload-card {
    width: 100%;
  }

  .payload-header {
    flex-direction: column;
  }

  .payload-header .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .archived-panel-header h3 {
    font-size: 0.95rem;
  }

  .controls {
    width: 100%;
  }

  .controls select {
    flex: 1;
    min-width: 0;
  }

  .folio-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .archived-row .folio {
    font-size: 0.95rem;
  }

  .btn,
  .btn.small,
  .btn.tiny {
    width: 100%;
    justify-content: center;
  }

  .item-row {
    flex-direction: column;
  }

  .item-tags {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>