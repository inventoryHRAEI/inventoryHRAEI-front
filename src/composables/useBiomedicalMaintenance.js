import { ref } from 'vue'

const MAINTENANCE_KEY = 'biomedical-maintenance-map'

export function useBiomedicalMaintenance() {
  const maintenanceMap = ref({})

  function isInMaintenance(item) {
    const code = String(item?.['No DE INVENTARIO'] || '').trim()
    if (!code) return false
    return maintenanceMap.value?.[code]?.status === 'in_progress'
  }

  function onStartMaintenance(payload) {
    const code = String(payload?.code || '').trim()
    if (!code) return
    maintenanceMap.value = {
      ...maintenanceMap.value,
      [code]: {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        data: payload?.data || {},
        item: payload?.item || null
      }
    }
  }

  function onFinishMaintenance(payload) {
    const code = String(payload?.code || '').trim()
    if (!code) return
    maintenanceMap.value = {
      ...maintenanceMap.value,
      [code]: {
        ...(maintenanceMap.value?.[code] || {}),
        status: 'done',
        finishedAt: new Date().toISOString(),
        finishData: payload?.data || {}
      }
    }
  }

  function initMaintenanceMap() {
    try {
      const raw = localStorage.getItem(MAINTENANCE_KEY)
      maintenanceMap.value = raw ? JSON.parse(raw) : {}
    } catch (e) {
      maintenanceMap.value = {}
    }
  }

  function persistMaintenanceMap() {
    try {
      localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(maintenanceMap.value))
    } catch (e) { }
  }

  return {
    maintenanceMap,
    isInMaintenance,
    onStartMaintenance,
    onFinishMaintenance,
    initMaintenanceMap,
    persistMaintenanceMap
  }
}
