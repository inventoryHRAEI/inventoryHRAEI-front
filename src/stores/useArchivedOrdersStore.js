import { reactive, computed } from 'vue'
import { authedFetch } from '../utils/api.js'

const state = reactive({
  archivedByType: {
    entrada: [],
    salida: [],
    resguardo: [],
    servicio: []
  },
  loading: false,
  error: null,
  lastRefresh: {}
})

/**
 * Cargar órdenes archivadas de un tipo específico
 */
async function fetchArchived(orderType) {
  if (!['entrada', 'salida', 'resguardo', 'servicio'].includes(orderType)) return
  
  state.loading = true
  state.error = null
  
  try {
    const res = await authedFetch(`/api/ops/archived-folios?type=${orderType}`)
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    
    const data = await res.json()
    state.archivedByType[orderType] = Array.isArray(data.items) ? data.items : []
    state.lastRefresh[orderType] = Date.now()
  } catch (err) {
    console.error(`[useArchivedOrdersStore] Error fetching ${orderType}:`, err)
    state.error = err.message
    state.archivedByType[orderType] = []
  } finally {
    state.loading = false
  }
}

/**
 * Cargar archivados de todos los tipos
 */
async function fetchAllArchived() {
  const types = ['entrada', 'salida', 'resguardo', 'servicio']
  const promises = types.map(t => fetchArchived(t))
  await Promise.all(promises)
}

/**
 * Limpiar archivados de un tipo (cuando se hace reset)
 */
function clearType(orderType) {
  if (state.archivedByType[orderType]) {
    state.archivedByType[orderType] = []
    state.lastRefresh[orderType] = Date.now()
  }
}

/**
 * Marcar como necesitando refresh (después de un reset)
 */
function invalidateType(orderType) {
  state.lastRefresh[orderType] = 0
}

/**
 * Computed: ¿hay archivados de un tipo?
 */
const hasArchivedByType = computed(() => ({
  entrada: state.archivedByType.entrada.length > 0,
  salida: state.archivedByType.salida.length > 0,
  resguardo: state.archivedByType.resguardo.length > 0,
  servicio: state.archivedByType.servicio.length > 0,
  any: Object.values(state.archivedByType).some(arr => arr.length > 0)
}))

/**
 * Computed: cuentas de archivados por tipo
 */
const archivedCounts = computed(() => ({
  entrada: state.archivedByType.entrada.length,
  salida: state.archivedByType.salida.length,
  resguardo: state.archivedByType.resguardo.length,
  servicio: state.archivedByType.servicio.length,
  total: Object.values(state.archivedByType).reduce((sum, arr) => sum + arr.length, 0)
}))

export function useArchivedOrdersStore() {
  return {
    // State
    state,
    
    // Computed
    hasArchivedByType,
    archivedCounts,
    
    // Methods
    fetchArchived,
    fetchAllArchived,
    clearType,
    invalidateType
  }
}
