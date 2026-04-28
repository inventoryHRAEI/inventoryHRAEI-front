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

    // Desactivado: no verificar ventana activa para evitar recargas y overlays
    // this.startActiveCheck()
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
    // DESACTIVADO: heartbeat causa cambios constantes en localStorage que disparan eventos
    // y pueden causar loops de recargas. La verificación de ventana activa ya no es crítica.
    // this.heartbeatInterval = setInterval(() => {
    //   if (this.isActive) {
    //     localStorage.setItem('activeWindowHeartbeat', Date.now().toString())
    //   }
    // }, 1000)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Desactivado: no verificar si la ventana activa sigue viva
  // startActiveCheck() {}

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
