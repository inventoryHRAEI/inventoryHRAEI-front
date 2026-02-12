import { onMounted, onBeforeUnmount } from 'vue'
import notificationStore from '@/stores/notificationStore'
import { authedFetch } from '@/utils/api'

const CRITICAL_THRESHOLD = 5 // Items con stock menor a 5
const CHECK_INTERVAL = 5 * 60 * 1000 // Cada 5 minutos
const MIN_DAYS_BETWEEN_ALERTS = 1 // Máximo 1 alerta por día del mismo item

let monitorInterval = null
let lastAlertedItems = new Map() // { itemId: lastAlertTimestamp }

async function checkCriticalStock() {
  try {
    // Obtener inventario actual
    const response = await authedFetch('/api/ops/stock-biomedica')
    if (!response.ok) {
      console.warn('[CriticalStockMonitor] Could not fetch inventory')
      return
    }

    const data = await response.json()
    const items = Array.isArray(data) ? data : (data.data || data.items || [])
    if (!items.length) {
      console.warn('[CriticalStockMonitor] Invalid inventory response')
      return
    }

    // Filtrar items con stock crítico
    const criticalItems = items.filter((item) => {
      const stock = parseInt(item['TOTAL EXISTENCIAS'] || 0)
      return stock > 0 && stock < CRITICAL_THRESHOLD
    })

    if (criticalItems.length === 0) {
      return
    }

    // Verificar si ya alertamos hace poco sobre estos items
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000

    const itemsToAlert = criticalItems.filter((item) => {
      const itemId = item['Clave  HRAEI'] || item.id || item.clave_hraei
      const lastAlert = lastAlertedItems.get(itemId) || 0
      const timeSinceLastAlert = now - lastAlert

      // Solo alertar si han pasado al menos MIN_DAYS_BETWEEN_ALERTS días
      if (timeSinceLastAlert < MIN_DAYS_BETWEEN_ALERTS * dayInMs) {
        return false
      }

      // Actualizar timestamp
      lastAlertedItems.set(itemId, now)
      return true
    })

    if (itemsToAlert.length > 0) {
      notificationStore.notifyCriticalStock(itemsToAlert)
    }
  } catch (e) {
    console.warn('[CriticalStockMonitor] Error checking stock:', e)
  }
}

export function useCriticalStockMonitor() {
  onMounted(() => {
    // Hacer chequeo inicial después de 10 segundos
    setTimeout(() => {
      checkCriticalStock()
    }, 10000)

    // Configurar intervalo periódico
    monitorInterval = setInterval(() => {
      // Solo chequear si las notificaciones no están muteadas
      if (!notificationStore.state.isMuted) {
        checkCriticalStock()
      }
    }, CHECK_INTERVAL)
  })

  onBeforeUnmount(() => {
    if (monitorInterval) {
      clearInterval(monitorInterval)
      monitorInterval = null
    }
  })

  return {
    checkCriticalStock,
  }
}
