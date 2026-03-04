import { authedFetch } from '@/utils/api'

export async function fetchStatusHistory(inventoryNo) {
  if (!inventoryNo) return []
  const res = await authedFetch(`/api/ops/equipment/${encodeURIComponent(inventoryNo)}/status-history`)
  if (!res.ok) throw new Error(`Error fetching status history: ${res.status}`)
  const data = await res.json().catch(() => null)
  return (data && data.ok && Array.isArray(data.data)) ? data.data : []
}

export async function verifyInventory(inventoryNo) {
  if (!inventoryNo) return null
  const res = await authedFetch(`/api/ops/equipment/verify/${encodeURIComponent(inventoryNo)}`)
  if (!res.ok) throw new Error(`Error verifying inventory: ${res.status}`)
  const data = await res.json().catch(() => null)
  return (data && data.ok) ? data.data : null
}

// look up a equipment row by raw code (inventory number or barcode)
export async function lookupEquipmentByCode(code) {
  if (!code) return null
  const res = await authedFetch(`/api/ops/equipment/lookup/${encodeURIComponent(code)}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Error looking up equipment: ${res.status}`)
  }
  const data = await res.json().catch(() => null)
  return (data && data.ok) ? data.data : null
}

export async function markStatusManual(inventoryNo, { status = 'functional', maintenance_type = 'manual', notes = '' } = {}) {
  if (!inventoryNo) throw new Error('inventoryNo is required')
  const now = new Date()
  const payload = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    status,
    maintenance_type,
    notes
  }
  const res = await authedFetch(`/api/ops/equipment/${encodeURIComponent(inventoryNo)}/status`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data || !data.ok) {
    throw new Error((data && data.msg) || `Server returned ${res.status}`)
  }
  return data.result || data
}

// Registrar un mantenimiento completo (wizard)
export async function registerMaintenance(inventoryNo, maintenanceData) {
  if (!inventoryNo) throw new Error('inventoryNo is required')
  const url = `/api/ops/equipment/${encodeURIComponent(inventoryNo)}/maintenance`
  const res = await authedFetch(url, {
    method: 'POST',
    body: JSON.stringify(maintenanceData)
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[equipmentStatusService] registerMaintenance failed', url, maintenanceData, res.status, data)
  }
  if (!res.ok || !data || !data.ok) {
    throw new Error((data && data.msg) || `Server returned ${res.status}`)
  }
  return data.result || data
}

// Obtener todos los mantenimientos de un equipo
export async function getAllMaintenances(inventoryNo) {
  if (!inventoryNo) return []
  const res = await authedFetch(`/api/ops/equipment/${encodeURIComponent(inventoryNo)}/maintenances`)
  if (!res.ok) throw new Error(`Error fetching maintenances: ${res.status}`)
  const data = await res.json().catch(() => null)
  return (data && data.ok && Array.isArray(data.data)) ? data.data : []
}

// === FLUJO DE MANTENIMIENTOS ===

// Iniciar un mantenimiento
export async function startMaintenance(inventoryNo, { maintenance_type = 'MP', notes = '', started_by = '', images = [] } = {}) {
  if (!inventoryNo) throw new Error('inventoryNo requerido')
  const url = `/api/ops/maintenance/start`
  const res = await authedFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      inventory_no: inventoryNo,
      maintenance_type,
      notes,
      started_by,
      images
    })
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[equipmentStatusService] startMaintenance failed', url, inventoryNo, res.status, data && JSON.stringify(data))
  }
  if (!res.ok || !data || !data.ok) {
    const msg = (data && data.msg) || (data && data.error) || `Error iniciando mantenimiento: ${res.status}`
    throw new Error(msg)
  }
  return data
}

// Terminar un mantenimiento
export async function finishMaintenance(inventoryNo, { 
  maintenance_id = null,
  result_status = 'functional', 
  diagnostico = '', 
  causa = '', 
  observaciones = '',
  finished_by = '',
  return_location = '',
  final_area = '',
  images = []
} = {}) {
  if (!inventoryNo) throw new Error('inventoryNo requerido')
  const url = `/api/ops/maintenance/finish`
  const res = await authedFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      inventory_no: inventoryNo,
      maintenance_id,
      result_status,
      diagnostico,
      causa,
      observaciones,
      finished_by,
      return_location,
      final_area,
      images
    })
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[equipmentStatusService] finishMaintenance failed', url, inventoryNo, res.status, data)
  }
  if (!res.ok || !data || !data.ok) {
    throw new Error((data && data.msg) || `Error finalizando mantenimiento: ${res.status}`)
  }
  return data
}

// Obtener estado de mantenimiento de un equipo
export async function getMaintenanceFlowStatus(inventoryNo) {
  if (!inventoryNo) {
    console.warn('[equipmentStatusService] getMaintenanceFlowStatus called with empty inventoryNo');
    return { scheduled: null, in_progress: null, last_completed: null, history: [] }
  }
  const url = `/api/ops/maintenance/status?inventoryNo=${encodeURIComponent(inventoryNo)}`
  console.log('[equipmentStatusService] calling getMaintenanceFlowStatus with:', url)
  const res = await authedFetch(url)
  if (!res.ok) throw new Error(`Error fetching maintenance status: ${res.status}`)
  const data = await res.json().catch(() => null)
  if (!data || !data.ok) return { scheduled: null, in_progress: null, last_completed: null, history: [] }
  return {
    scheduled: data.scheduled || null,
    in_progress: data.in_progress || null,
    last_completed: data.last_completed || null,
    history: data.history || []
  }
}
