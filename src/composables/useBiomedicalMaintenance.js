import { ref } from 'vue'

const API_BASE = '/api/ops/maintenance'

export function useBiomedicalMaintenance() {
  const maintenanceMap = ref({})

  const normalizeCode = (code) => String(code || '').trim()

  async function fetchJson(url, options = {}) {
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
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
    maintenanceMap.value = {
      ...maintenanceMap.value,
      [code]: payload
    }
  }

  async function refreshStatusForCodes(codes = []) {
    const list = Array.from(new Set((codes || []).map(normalizeCode).filter(Boolean))).slice(0, 50)
    if (!list.length) return
    const qs = encodeURIComponent(list.join(','))
    try {
      // Usar el nuevo endpoint bulk que retorna un objeto map con estado para cada código
      const data = await fetchJson(`${API_BASE}/status-bulk?codes=${qs}`, { method: 'GET' })
      if (data && data.map) {
        for (const [code, val] of Object.entries(data.map)) {
          setEntry(code, {
            status: val?.status === 'en_mantenimiento' || val?.maintenance?.status === 'in_progress' ? 'en_mantenimiento' : 'en_biomedica',
            maintenance: val?.maintenance || null
          })
        }
      }
    } catch (error) {
      console.warn('[useBiomedicalMaintenance] Error fetching maintenance status:', error.message)
      // Si falla, usar valores por defecto (no en mantenimiento)
      for (const code of list) {
        setEntry(code, {
          status: 'en_biomedica',
          maintenance: null
        })
      }
    }
  }

  async function onStartMaintenance(payload) {
    const code = normalizeCode(payload?.code)
    if (!code) throw new Error('Falta código de inventario')
    const body = {
      inventory_code: code,
      reason: normalizeCode(payload?.reason || payload?.motivo || payload?.data?.motivo || ''),
      provider: normalizeCode(payload?.provider || payload?.empresa || payload?.data?.empresa || ''),
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
    return data
  }

  async function onFinishMaintenance(payload) {
    const code = normalizeCode(payload?.code)
    if (!code) throw new Error('Falta código de inventario')
    const body = {
      inventory_code: code,
      return_condition: normalizeCode(payload?.return_condition || payload?.estado || payload?.data?.estado || ''),
      return_notes: payload?.return_notes || payload?.observaciones || payload?.data?.observaciones || ''
    }
    const data = await fetchJson(`${API_BASE}/finish`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    setEntry(code, {
      status: 'en_biomedica',
      maintenance: data?.maintenance || null
    })
    return data
  }

  function isInMaintenance(item) {
    const code = normalizeCode(item?.['No DE INVENTARIO'] || item)
    if (!code) return false
    const entry = maintenanceMap.value?.[code]
    return entry?.status === 'en_mantenimiento' || entry?.maintenance?.status === 'in_progress'
  }

  function getMaintenanceEntry(item) {
    const code = normalizeCode(item?.['No DE INVENTARIO'] || item)
    if (!code) return null
    return maintenanceMap.value?.[code] || null
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
    getMaintenanceEntry
  }
}
