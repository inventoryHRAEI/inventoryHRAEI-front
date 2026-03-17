import { ref, onMounted, onUnmounted } from 'vue'
import { authedFetch } from '@/utils/api'
import { useSemaforoRuleEngine } from './useSemaforoRuleEngine.js';

const API_BASE = '/api/ops/maintenance'

export function useBiomedicalMaintenance() {
  const maintenanceMap = ref({})

  const normalizeCode = (code) => String(code || '').trim().toUpperCase()
  const compactCode = (code) => normalizeCode(code).replace(/[^A-Z0-9]/g, '')

  function normalizeMaintenanceType(value) {
    const raw = String(value || '').trim().toLowerCase()
    if (!raw) return 'MP'
    if (raw === 'mp' || raw.includes('prevent')) return 'MP'
    if (raw === 'mc' || raw.includes('correct')) return 'MC'
    return 'OTRO'
  }

  function normalizeResultStatus(value) {
    const raw = String(value || '').trim().toLowerCase()
    console.log(`[useBiomedicalMaintenance] normalizeResultStatus: Input="${value}", normalized="${raw}"`)
    
    if (!raw) return 'functional'
    
    // Funcional
    if (raw === 'functional' || raw === 'funcional' || raw === 'si') {
      console.log(`[useBiomedicalMaintenance] normalizeResultStatus: Mapped to 'functional'`)
      return 'functional'
    }
    
    // Parcial / Condicional
    if (
      raw === 'partial' ||
      raw === 'parcial' ||
      raw === 'parcialmente funcional' ||
      raw === 'parcialmente_funcional' ||
      raw === 'condicional' ||
      raw === 'condicionalmente funcional' ||
      raw === 'condicionalmente_funcional'
    ) {
      console.log(`[useBiomedicalMaintenance] normalizeResultStatus: Mapped to 'partial'`)
      return 'partial'
    }
    
    // No Funcional
    if (
      raw === 'non_functional' ||
      raw === 'no funcional' ||
      raw === 'no_funcional' ||
      raw === 'inoperativo' ||
      raw === 'fuera de servicio' ||
      raw === 'dañado' ||
      raw === 'no'
    ) {
      console.log(`[useBiomedicalMaintenance] normalizeResultStatus: Mapped to 'non_functional'`)
      return 'non_functional'
    }
    
    console.warn(`[useBiomedicalMaintenance] normalizeResultStatus: Unknown value "${raw}", defaulting to 'non_functional'`)
    return 'non_functional'
  }

  // Listen for equipment status updates from other components
  function handleStatusUpdate(event) {
    const { inventoryNo } = event.detail || {}
    if (inventoryNo) {
      const code = normalizeCode(inventoryNo)
      // Refresh the specific equipment's status
      refreshStatusForCodes([code])
    }
  }

  onMounted(() => {
    window.addEventListener('equipment:status-updated', handleStatusUpdate)
  })

  onUnmounted(() => {
    window.removeEventListener('equipment:status-updated', handleStatusUpdate)
  })

  async function fetchJson(url, options = {}) {
    const resp = await authedFetch(url, {
      ...options
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      const msg = data && data.msg ? data.msg : 'Error en la petición'
      throw new Error(msg)
    }
    return data
  }

  function setEntry(code, payload) {
    const normalized = normalizeCode(code)
    const compact = compactCode(code)
    maintenanceMap.value = {
      ...maintenanceMap.value,
      [normalized]: payload,
      ...(compact ? { [compact]: payload } : {})
    }
  }
  
  // ⚠️ CRITICAL: Map badge types to visual classes
  // This ensures that "regular" badge gets correct color
  function mapBadgeToVisualStatus(statusData) {
    if (!statusData) return statusData
    
    const badge = statusData.badge || 'unknown'
    
    // Map badge types to appropriate colors/labels
    const badgeMap = {
      'regular': {
        badge: 'regular',
        color: '#fb923c',
        label: 'Regular'
      },
      'operational': {
        badge: 'operational',
        color: '#22c55e',
        label: 'Operativo'
      },
      'maintenance': {
        badge: 'maintenance',
        color: '#3b82f6',
        label: 'En Mantenimiento'
      },
      'preventive': {
        badge: 'preventive',
        color: '#a78bfa',
        label: 'Preventivo'
      },
      'unavailable': {
        badge: 'unavailable',
        color: '#ef4444',
        label: 'No Funcional'
      },
      'unknown': {
        badge: 'unknown',
        color: '#64748b',
        label: 'Desconocido'
      }
    }
    
    return {
      ...statusData,
      ...badgeMap[badge]
    }
  }

  async function refreshStatusForCodes(codes = []) {
    // normalize and unique
    const list = Array.from(new Set((codes || []).map(normalizeCode).filter(Boolean))).slice(0, 50);
    if (!list.length) return;

    try {
      console.log('[useBiomedicalMaintenance] refreshStatusForCodes: querying semaforización rules for codes', list);
      const { getEquipmentColors } = useSemaforoRuleEngine();
      const map = await getEquipmentColors(list);
      console.log('[useBiomedicalMaintenance] refreshStatusForCodes: rule engine returned', map);

      // update maintenanceMap based on returned colors
      Object.entries(map || {}).forEach(([code, statusData]) => {
        const normalizedCode = normalizeCode(code)
        if (!normalizedCode) return
        console.log(`[useBiomedicalMaintenance] refreshStatusForCodes: Updating ${normalizedCode} with badge=${statusData?.badge}, color=${statusData?.color}`);
        setEntry(normalizedCode, {
          ...(statusData || {}),
          status: statusData?.badge === 'maintenance' ? 'en_mantenimiento' : (statusData?.status || 'en_biomedica')
        });
      });
    } catch (error) {
      console.error('[useBiomedicalMaintenance] refreshStatusForCodes: Error:', error.message);
      // fallback: mark codes as normal biomedica
      codes.forEach(code => {
        console.warn(`[useBiomedicalMaintenance] refreshStatusForCodes: Setting ${code} to default (en_biomedica)`);
        setEntry(code, {
          status: 'en_biomedica',
          badge: 'regular',
          color: '#22c55e',
          label: 'En biomedica'
        });
      });
    }
  }

  async function onStartMaintenance(payload) {
    const code = normalizeCode(payload?.code)
    if (!code) throw new Error('Falta código de inventario')
    const body = {
      inventory_no: code,
      maintenance_type: normalizeMaintenanceType(payload?.reason || payload?.motivo || payload?.data?.motivo || payload?.data?.tipo || 'MP'),
      started_by: normalizeCode(payload?.provider || payload?.empresa || payload?.data?.empresa || ''),
      notes: payload?.notes || payload?.observaciones || payload?.data?.observaciones || '',
      expected_return_at: payload?.expected_return_at || null
    }
    const data = await fetchJson(`${API_BASE}/start`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    setEntry(code, {
      status: 'en_mantenimiento',
      maintenance: data?.maintenance || null
    })
    await refreshStatusForCodes([code]).catch(() => {})
    return data
  }

  async function onFinishMaintenance(payload) {
    const code = normalizeCode(payload?.code)
    if (!code) throw new Error('Falta código de inventario')
    
    const resultStatus = normalizeResultStatus(
      payload?.return_condition || 
      payload?.estado || 
      payload?.data?.estado || 
      'functional'
    )
    
    const body = {
      inventory_no: code,
      result_status: resultStatus,
      observaciones: payload?.return_notes || payload?.observaciones || payload?.data?.observaciones || '',
      // Nuevos campos de mantenimiento
      maintenance_hours: payload?.hours ?? payload?.data?.hours ?? 0,
      tests: payload?.tests || payload?.data?.tests || [],
      folio_inicio: payload?.folioNumber || payload?.data?.folioNumber || '',
      technician_name: payload?.technician || payload?.data?.technician || '',
      finished_by: payload?.technician || payload?.data?.technician || ''
    }
    const data = await fetchJson(`${API_BASE}/finish`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    setEntry(code, {
      status: 'en_biomedica',
      maintenance: data?.maintenance || null
    })
    await refreshStatusForCodes([code]).catch(() => {})
    
    return data
  }

  function isInMaintenance(item) {
    const code = normalizeCode(item?.['No DE INVENTARIO'] || item)
    if (!code) return false
    const entry = maintenanceMap.value?.[code] || maintenanceMap.value?.[compactCode(code)]
    return entry?.status === 'en_mantenimiento' || entry?.maintenance?.status === 'in_progress'
  }

  function getMaintenanceEntry(item) {
    const code = normalizeCode(item?.['No DE INVENTARIO'] || item)
    if (!code) return null
    return maintenanceMap.value?.[code] || maintenanceMap.value?.[compactCode(code)] || null
  }

  function initMaintenanceMap() {
    maintenanceMap.value = {}
  }

  function persistMaintenanceMap() {
    // Ya no persistimos en localStorage; estado viene del backend.
  }

  return {
    maintenanceMap,
    isInMaintenance,
    onStartMaintenance,
    onFinishMaintenance,
    initMaintenanceMap,
    persistMaintenanceMap,
    refreshStatusForCodes,
    getMaintenanceEntry,
    setEntry
  }
}
