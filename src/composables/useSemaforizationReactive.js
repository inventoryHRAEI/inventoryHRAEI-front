/**
 * useSemaforizationReactive - Semaforización REACTIVA sin refrescos
 * 
 * ARQUITECTURA PURA:
 * - Estado local reactivo que responde a eventos en TIEMPO REAL
 * - Caché invalidación automática cuando cambian estados
 * - WebSocket ready para datos fresh
 * - Sincronización perfecta entre mantenimiento y equipo
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { authedFetch } from '@/utils/api'
import { useSemaforoRuleEngine } from './useSemaforoRuleEngine.js';
// Estado global reactivo
const equipmentStatusMap = ref(new Map())
const maintenanceStateMap = ref(new Map())
const loading = ref(false)
const lastUpdateTime = ref(0)

const CACHE_TTL = 30000 // 30 segundos - tiempo antes de re-consultar
const STATUS_STABILITY_DELAY = 500 // ms - evitar cambios muy rápidos

let updateScheduler = null

// ============================================================================
// NORMALIZACIÓN (mismo patrón en front y back)
// ============================================================================
const normalizeInvCode = (code) => String(code || '').trim().toUpperCase()
const compactInvCode = (code) => normalizeInvCode(code).replace(/[^A-Z0-9]/g, '')

// ============================================================================
// MAPEO DE ESTADOS → COLORES (lógica de negocio CRÍTICA)
// ============================================================================
const STATUS_CONFIG = {
  'OPERATIVO': {
    color: '#22c55e',
    badge: 'operational',
    label: 'Operativo',
    icon: '✅',
    severity: 0
  },
  'PARCIALMENTE_OPERATIVO': {
    color: '#f59e0b',
    badge: 'warning',
    label: 'Parcialmente Operativo',
    icon: '⚠️',
    severity: 1
  },
  'FUERA_DE_SERVICIO': {
    color: '#ef4444',
    badge: 'critical',
    label: 'Fuera de Servicio',
    icon: '❌',
    severity: 2
  },
  'EN_MANTENIMIENTO': {
    color: '#3b82f6',
    badge: 'maintenance',
    label: 'En Mantenimiento',
    icon: '🔧',
    severity: 1
  },
  'DESCONOCIDO': {
    color: '#64748b',
    badge: 'unknown',
    label: 'Desconocido',
    icon: '❓',
    severity: 0
  }
}

// ============================================================================
// MAPEO: result_status (del mantenimiento) → status (del equipo)
// ============================================================================
function mapResultStatusToEquipmentStatus(resultStatus) {
  const status = String(resultStatus || '').toLowerCase().trim()
  
  // Verificar primero los estados específicos ANTES de include genérico
  if (status.includes('fuera') || status.includes('no func') || status === 'out_of_service' || status === 'non_functional') {
    return 'FUERA_DE_SERVICIO'
  }
  if (status.includes('parcial') || status.includes('condicional') || status === 'partial') {
    return 'PARCIALMENTE_OPERATIVO'
  }
  if (status.includes('funcional') || status === 'functional' || status === 'si') {
    return 'OPERATIVO'
  }
  
  // Default: operativo (asumimos que si no se especifica es porque funcionó)
  return 'OPERATIVO'
}

// ============================================================================
// LISTENER GLOBAL: Eventos de cambio de estado
// ============================================================================
function setupEventListeners() {
  if (typeof window === 'undefined') return () => {}

  const handleMaintenanceStart = (event) => {
    const { inventoryNo, maintenanceType } = event.detail || {}
    if (inventoryNo) {
      const code = normalizeInvCode(inventoryNo)
      updateEquipmentStatusReactive(code, 'EN_MANTENIMIENTO', {
        maintenanceType,
        startedAt: new Date().toISOString()
      })
    }
  }

  const handleMaintenanceFinish = async (event) => {
    const { inventoryNo, resultStatus, maintenanceData } = event.detail || {}
    if (inventoryNo) {
      const code = normalizeInvCode(inventoryNo)
      const newStatus = mapResultStatusToEquipmentStatus(resultStatus)
      
      // Actualizar estado reactivo INMEDIATAMENTE
      updateEquipmentStatusReactive(code, newStatus, {
        finishedAt: new Date().toISOString(),
        resultStatus,
        maintenanceData
      })
      
      // Invalidar caché para próxima carga (refrescará desde backend)
      invalidateCacheForCode(code)
    }
  }

  const handleRefreshSemaforization = (event) => {
    const { codes = [] } = event.detail || {}
    if (Array.isArray(codes)) {
      codes.forEach(code => invalidateCacheForCode(normalizeInvCode(code)))
    } else {
      // Refrescar todo
      equipmentStatusMap.value.clear()
      lastUpdateTime.value = 0
    }
  }

  window.addEventListener('maintenance:started', handleMaintenanceStart)
  window.addEventListener('maintenance:finished', handleMaintenanceFinish)
  window.addEventListener('ui:refresh-semaforizacion', handleRefreshSemaforization)

  // Cleanup
  return () => {
    window.removeEventListener('maintenance:started', handleMaintenanceStart)
    window.removeEventListener('maintenance:finished', handleMaintenanceFinish)
    window.removeEventListener('ui:refresh-semaforizacion', handleRefreshSemaforization)
  }
}

// ============================================================================
// ACTUALIZACIÓN REACTIVA (sin fetch)
// ============================================================================
function updateEquipmentStatusReactive(invCode, newStatus, metadata = {}) {
  const normalized = normalizeInvCode(invCode)
  const compact = compactInvCode(invCode)
  
  const statusData = {
    status: newStatus,
    ...STATUS_CONFIG[newStatus] || STATUS_CONFIG['DESCONOCIDO'],
    metadata,
    updatedAt: Date.now()
  }
  
  equipmentStatusMap.value.set(normalized, statusData)
  if (compact) {
    equipmentStatusMap.value.set(compact, statusData)
  }
  
  // Debug
  console.log(`[useSemaforizationReactive] Actualizado ${normalized} → ${newStatus}`, metadata)
}

// ============================================================================
// INVALIDAR CACHÉ
// ============================================================================
function invalidateCacheForCode(invCode) {
  const normalized = normalizeInvCode(invCode)
  const compact = compactInvCode(invCode)
  
  // Marcar como "expirado" para que se recargue desde backend
  const entry = equipmentStatusMap.value.get(normalized)
  if (entry) {
    entry.updatedAt = 0 // Force refresh on next load
  }
  const entry2 = equipmentStatusMap.value.get(compact)
  if (entry2) {
    entry2.updatedAt = 0
  }
  
  console.log(`[useSemaforizationReactive] Cache invalidado para ${normalized}`)
}

// ============================================================================
// CARGAR STATUS DESDE BACKEND (Batch)
// ============================================================================
async function loadStatusesFromBackend(inventoryNumbers) {
  if (!Array.isArray(inventoryNumbers) || !inventoryNumbers.length) return
  
  const normalized = Array.from(new Set(
    inventoryNumbers.map(normalizeInvCode).filter(Boolean)
  ))
  
  // Filtrar solo los que necesitan actualización (caché expirada o no existe)
  const needsFetch = normalized.filter(invNo => {
    const cached = equipmentStatusMap.value.get(invNo)
    if (!cached) return true
    const age = Date.now() - (cached.updatedAt || 0)
    return age > CACHE_TTL
  })
  
  if (!needsFetch.length) {
    console.log('[useSemaforizationReactive] Todos en caché valido')
    return
  }
  
  loading.value = true
  try {
    console.log('[useSemaforizationReactive] Cargando desde backend (rule engine):', needsFetch)
    const { getEquipmentColors } = useSemaforoRuleEngine();
    const data = await getEquipmentColors(needsFetch);
    
    
    // Actualizar caché con datos frescos
    Object.entries(data).forEach(([invNo, statusData]) => {
      const normalized = normalizeInvCode(invNo)
      const compact = compactInvCode(invNo)
      
      // Merge con STATUS_CONFIG para asegurar campos visuales
      const fullStatus = {
        ...STATUS_CONFIG[statusData.status] || STATUS_CONFIG['DESCONOCIDO'],
        ...statusData,
        updatedAt: Date.now()
      }
      
      equipmentStatusMap.value.set(normalized, fullStatus)
      if (compact) {
        equipmentStatusMap.value.set(compact, fullStatus)
      }
    })
    
    lastUpdateTime.value = Date.now()
    console.log('[useSemaforizationReactive] Caché actualizado:', data)
  } catch (error) {
    console.error('[useSemaforizationReactive] Error cargando status:', error.message)
  } finally {
    loading.value = false
  }
}

// ============================================================================
// COMPOSABLE PUBLIC
// ============================================================================
export function useSemaforizationReactive() {
  onMounted(() => {
    const cleanup = setupEventListeners()
    onUnmounted(cleanup)
  })

  /**
   * Obtener status de un equipo (síncrono desde caché)
   */
  function getEquipmentStatus(inventoryNo) {
    const normalized = normalizeInvCode(inventoryNo)
    const compact = compactInvCode(inventoryNo)
    
    return equipmentStatusMap.value.get(normalized) ||
           equipmentStatusMap.value.get(compact) ||
           STATUS_CONFIG['DESCONOCIDO']
  }

  /**
   * Cargar statuses para múltiples equipos (async)
   */
  async function loadEquipmentStatuses(inventoryNumbers) {
    await loadStatusesFromBackend(inventoryNumbers)
  }

  /**
   * Obtener color computed (reactivo)
   */
  function useStatusColor(inventoryNo) {
    return computed(() => {
      const status = getEquipmentStatus(inventoryNo)
      return status?.color || STATUS_CONFIG['DESCONOCIDO'].color
    })
  }

  /**
   * Obtener status completo (reactivo)
   */
  function useEquipmentStatus(inventoryNo) {
    return computed(() => getEquipmentStatus(inventoryNo))
  }

  /**
   * Actualizar manualmente (útil después de finish)
   */
  async function refreshEquipmentStatus(inventoryNo) {
    invalidateCacheForCode(inventoryNo)
    await loadStatusesFromBackend([inventoryNo])
  }

  /**
   * Limpiar caché
   */
  function clearCache() {
    equipmentStatusMap.value.clear()
    maintenanceStateMap.value.clear()
    lastUpdateTime.value = 0
  }

  return {
    // State
    equipmentStatusMap: computed(() => equipmentStatusMap.value),
    loading: computed(() => loading.value),
    
    // Methods
    getEquipmentStatus,
    loadEquipmentStatuses,
    useStatusColor,
    useEquipmentStatus,
    refreshEquipmentStatus,
    clearCache,
    
    // Internals (para testing)
    updateEquipmentStatusReactive,
    invalidateCacheForCode
  }
}
