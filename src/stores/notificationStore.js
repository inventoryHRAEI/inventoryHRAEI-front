import { reactive, computed } from 'vue'

const state = reactive({
  notifications: [],
  isMuted: localStorage.getItem('notifications_muted') === 'true',
  lastCriticalStockCheck: 0,
  criticalStockCheckInterval: 5 * 60 * 1000, // 5 minutos
  notificationPermission: 'default',
  soundEnabled: localStorage.getItem('notification_sound') !== 'false',
})

// Sonidos de notificación (usando Web Audio API)
let audioContext = null

function playNotificationSound(type = 'success') {
  if (state.isMuted || !state.soundEnabled) return
  
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different tones for different notification types
    switch(type) {
      case 'success':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        break
      case 'warning':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.15)
        break
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2)
        break
      case 'critical':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2)
        break
      default: // info
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    console.warn('[NotificationStore] Error playing sound:', e)
  }
}

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

  get soundEnabled() {
    return computed(() => state.soundEnabled)
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

    // Reproducir sonido
    playNotificationSound(type)

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
    state.notifications.forEach(n => (n.read = true))
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

  toggleSound() {
    state.soundEnabled = !state.soundEnabled
    localStorage.setItem('notification_sound', state.soundEnabled ? 'true' : 'false')
    // Play test sound when enabling
    if (state.soundEnabled) {
      playNotificationSound('info')
    }
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

  // Notificación de mantenimiento
  notifyMaintenance(equipo, tipo, mensaje) {
    const title = `Mantenimiento: ${equipo}`
    const message = mensaje || `Se ha programado ${tipo} para el equipo`
    const notif = this.addNotification(title, message, 'info', { 
      eventType: 'maintenance', 
      equipo, 
      tipo 
    })
    sendSystemNotification(title, { body: message, tag: `maintenance-${equipo}` })
    return notif
  },

  // Notificación de orden actualizada
  notifyOrderUpdated(type, folio, usuario) {
    const title = `Orden ${type.toUpperCase()} actualizada`
    const message = `Orden #${folio} fue actualizada por ${usuario}`
    const notif = this.addNotification(title, message, 'info', { 
      eventType: 'order_updated', 
      orderType: type, 
      folio,
      usuario
    })
    sendSystemNotification(title, { body: message, tag: `order-updated-${folio}` })
    return notif
  },

  // Notificación de inventario bajo
  notifyLowInventory(item, cantidad) {
    const title = 'Inventario Bajo'
    const message = `${item}: solo quedan ${cantidad} unidades`
    const notif = this.addNotification(title, message, 'warning', { 
      eventType: 'low_inventory', 
      item, 
      cantidad 
    })
    sendSystemNotification(title, { body: message, tag: `low-inventory-${item}` })
    return notif
  },

  // Notificación de items próximos a caducar (para administradores)
  notifyExpirationWarning(expiredCount, criticalCount, warningCount, items = []) {
    if (state.isMuted) return null
    
    const title = 'Alerta de Caducidad'
    let message = ''
    
    if (expiredCount > 0) {
      message = `${expiredCount} artículo(s) ya expiraron`
    } else if (criticalCount > 0) {
      message = `${criticalCount} artículo(s) caducan en menos de 30 días`
    } else if (warningCount > 0) {
      message = `${warningCount} artículo(s) caducan en 30-90 días`
    }
    
    if (!message) return null
    
    // Añadir al historial del sistema
    const notif = this.addNotification(title, message, expiredCount > 0 ? 'error' : 'warning', {
      eventType: 'expiration_warning',
      expiredCount,
      criticalCount,
      warningCount,
      items
    })

    // Enviar notificación del SO
    sendSystemNotification(title, {
      body: message,
      tag: 'expiration-warning',
      requireInteraction: expiredCount > 0,
      onClick: () => {
        window.focus()
      },
    })

    return notif
  },

  // Polling para notificaciones en tiempo real
  startPolling(intervalMs = 30000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
    
    this.pollingInterval = setInterval(async () => {
      try {
        // Aquí puedes agregar llamadas a APIs para verificar nuevos eventos
        // Por ejemplo: verificar órdenes nuevas, stock crítico, etc.
        console.log('[NotificationStore] Polling for new notifications...')
        
        // Ejemplo de verificación de stock crítico
        // const response = await fetch('/api/inventory/critical')
        // if (response.ok) {
        //   const data = await response.json()
        //   if (data.items?.length > 0) {
        //     this.notifyCriticalStock(data.items)
        //   }
        // }
      } catch (e) {
        console.warn('[NotificationStore] Polling error:', e)
      }
    }, intervalMs)
    
    console.log('[NotificationStore] Polling started')
  },

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      console.log('[NotificationStore] Polling stopped')
    }
  },

  pollingInterval: null,
}
