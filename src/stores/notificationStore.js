import { reactive, computed } from 'vue'

const state = reactive({
  notifications: [],
  isMuted: localStorage.getItem('notifications_muted') === 'true',
  lastCriticalStockCheck: 0,
  criticalStockCheckInterval: 5 * 60 * 1000, // 5 minutos
  notificationPermission: 'default',
})

// Solicitar permisos de notificaciones del sistema
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      state.notificationPermission = permission
      localStorage.setItem('notification_permission', permission)
    })
  } else if ('Notification' in window) {
    state.notificationPermission = Notification.permission
  }
}

// Enviar notificación del sistema
function sendSystemNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('[NotificationStore] Notification API not available')
    return
  }

  if (state.notificationPermission !== 'granted') {
    return
  }

  try {
    const notification = new Notification(title, {
      icon: '/src/images/logo_sinfondo.png',
      badge: '/src/images/logo_sinfondo.png',
      tag: options.tag || 'app-notification',
      requireInteraction: false,
      ...options,
    })

    // Cerrar notificación después de 8 segundos
    setTimeout(() => notification.close(), 8000)

    // Click en la notificación
    if (options.onClick) {
      notification.onclick = options.onClick
    }
  } catch (e) {
    console.warn('[NotificationStore] Error sending system notification:', e)
  }
}

export default {
  state,

  get notifications() {
    return computed(() => state.notifications)
  },

  get isMuted() {
    return computed(() => state.isMuted)
  },

  get unreadCount() {
    return computed(() => state.notifications.filter(n => !n.read).length)
  },

  // Inicializar permisos
  init() {
    const savedPermission = localStorage.getItem('notification_permission')
    if (savedPermission) {
      state.notificationPermission = savedPermission
    } else {
      requestNotificationPermission()
    }
  },

  // Solicitar permisos
  requestPermission() {
    requestNotificationPermission()
  },

  addNotification(title, message, type = 'info', metadata = {}) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      title,
      message,
      type, // 'info', 'success', 'warning', 'error', 'critical'
      timestamp: new Date(),
      read: false,
      metadata,
    }

    state.notifications.unshift(notification)

    // Mantener máximo 50 notificaciones
    if (state.notifications.length > 50) {
      state.notifications.pop()
    }

    return notification
  },

  markAsRead(id) {
    const notif = state.notifications.find(n => n.id === id)
    if (notif) notif.read = true
  },

  markAllAsRead() {
    state.notifications.forEach(n => (n.read = false))
  },

  removeNotification(id) {
    const idx = state.notifications.findIndex(n => n.id === id)
    if (idx > -1) state.notifications.splice(idx, 1)
  },

  clearAll() {
    state.notifications = []
  },

  toggleMute() {
    state.isMuted = !state.isMuted
    localStorage.setItem('notifications_muted', state.isMuted ? 'true' : 'false')
  },

  setMuted(value) {
    state.isMuted = value
    localStorage.setItem('notifications_muted', value ? 'true' : 'false')
  },

  // Notificación de orden creada
  notifyOrderCreated(type, folio, nombreSolicitante) {
    const title = `Orden ${type.toUpperCase()} creada`
    const message = `${type} #${folio} de ${nombreSolicitante}`
    
    // Añadir al historial del sistema
    const notif = this.addNotification(title, message, 'success', {
      orderType: type,
      folio,
      nombreSolicitante,
    })

    // Enviar notificación del SO
    sendSystemNotification(title, {
      body: message,
      tag: `order-${folio}`,
      onClick: () => {
        window.focus()
      },
    })

    return notif
  },

  // Notificación de stock crítico
  notifyCriticalStock(items) {
    if (!Array.isArray(items) || items.length === 0) return null

    const itemsText = items.slice(0, 3).map(i => i.nombre || i.descripcion).join(', ')
    const moreText = items.length > 3 ? ` +${items.length - 3} más` : ''

    const title = 'Stock Crítico'
    const message = `Stock bajo: ${itemsText}${moreText}`

    // Añadir al historial del sistema
    const notif = this.addNotification(title, message, 'warning', { criticalItems: items })

    // Enviar notificación del SO
    sendSystemNotification(title, {
      body: message,
      tag: 'critical-stock',
      onClick: () => {
        window.focus()
      },
    })

    return notif
  },

  // Notificación de error
  notifyError(title, message) {
    return this.addNotification(title, message, 'error')
  },
}
