// Sistema de gestión de ventana única activa por navegador

class WindowManager {
  constructor() {
    this.windowId = null
    this.isActive = false
    this.checkInterval = null
  }

  // Genera un ID único para esta ventana
  generateWindowId() {
    return `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Inicializa la ventana
  init() {
    // Generar ID único para esta ventana en sessionStorage
    this.windowId = sessionStorage.getItem('windowId')
    if (!this.windowId) {
      this.windowId = this.generateWindowId()
      sessionStorage.setItem('windowId', this.windowId)
    }

    // Verificar si hay una ventana activa
    const activeWindowId = localStorage.getItem('activeWindowId')
    
    if (!activeWindowId) {
      // No hay ventana activa, esta se convierte en la activa
      this.setAsActive()
    } else if (activeWindowId === this.windowId) {
      // Esta ventana ya es la activa (recarga)
      this.isActive = true
      this.startHeartbeat()
    } else {
      // Ya existe otra ventana activa
      this.isActive = false
      this.handleInactiveWindow()
    }

    // Escuchar cambios en localStorage (otras ventanas)
    window.addEventListener('storage', (e) => {
      if (e.key === 'activeWindowId') {
        if (e.newValue === this.windowId) {
          // Esta ventana se convirtió en activa
          this.isActive = true
          this.startHeartbeat()
          window.dispatchEvent(new Event('window:activated'))
        } else if (e.newValue !== this.windowId && this.isActive) {
          // Otra ventana se convirtió en activa (esta era la activa antes)
          // Forzar cierre en esta ventana: mostrar overlay que obliga a cerrarla
          this.isActive = false
          this.stopHeartbeat()
          // Emitir evento para que la app muestre el overlay de "force close"
          window.dispatchEvent(new CustomEvent('window:force-close'))
        }
      }

      // Escuchar eventos de logout
      if (e.key === 'lastLogout') {
        window.dispatchEvent(new Event('window:logout'))
      }
    })

    // Al cerrar la ventana
    window.addEventListener('beforeunload', () => {
      if (this.isActive) {
        this.releaseActive()
      }
    })

    // Verificar periódicamente si la ventana activa sigue viva
    this.startActiveCheck()
  }

  // Establecer esta ventana como activa
  setAsActive() {
    this.isActive = true
    localStorage.setItem('activeWindowId', this.windowId)
    localStorage.setItem('activeWindowHeartbeat', Date.now().toString())
    this.startHeartbeat()
    console.log('windowManager: setAsActive ->', this.windowId)
    window.dispatchEvent(new Event('window:activated'))
  }

  // Liberar el estado de ventana activa
  releaseActive() {
    if (this.isActive) {
      localStorage.removeItem('activeWindowId')
      localStorage.removeItem('activeWindowHeartbeat')
      this.stopHeartbeat()
      this.isActive = false
    }
  }

  // Heartbeat para indicar que la ventana activa sigue viva
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.isActive) {
        localStorage.setItem('activeWindowHeartbeat', Date.now().toString())
      }
    }, 1000) // Actualizar cada segundo
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Verificar si la ventana activa sigue viva (para ventanas inactivas)
  startActiveCheck() {
    this.checkInterval = setInterval(() => {
      if (!this.isActive) {
        const activeWindowId = localStorage.getItem('activeWindowId')
        const lastHeartbeat = parseInt(localStorage.getItem('activeWindowHeartbeat') || '0')
        const now = Date.now()

        // Si la ventana activa no ha dado señales de vida en 3 segundos
        if (activeWindowId && now - lastHeartbeat > 3000) {
          // La ventana activa probablemente se cerró, intentar tomar su lugar
          this.setAsActive()
        }
      }
    }, 1000)
  }

  // Manejar cuando esta ventana no es la activa
  handleInactiveWindow() {
    // Emitir evento para que la app maneje la situación
    window.dispatchEvent(new Event('window:inactive'))
  }

  // Notificar logout a todas las ventanas
  notifyLogout() {
    localStorage.setItem('lastLogout', Date.now().toString())
    this.releaseActive()
  }

  // Notificar que una ventana secundaria cerró sesión en backend
  notifySecondaryLogout() {
    localStorage.setItem('secondaryLogout', Date.now().toString())
  }

  // Verificar si esta ventana es la activa
  isActiveWindow() {
    return this.isActive
  }

  // Limpiar al destruir
  cleanup() {
    this.stopHeartbeat()
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    if (this.isActive) {
      this.releaseActive()
    }
  }
}

// Instancia única
export const windowManager = new WindowManager()

// Auto-inicializar cuando se importe
if (typeof window !== 'undefined') {
  windowManager.init()
}
