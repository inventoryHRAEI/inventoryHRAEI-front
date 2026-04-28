/**
 * Nuevo sistema de detección de inactividad usando @vueuse/core
 * 
 * Características:
 * - Usa useIdle de @vueuse/core para detección precisa de actividad
 * - Timeout fijo de 15 minutos (no configurable por usuario)
 * - Alertas de pre-logout con SweetAlert2
 * - Sincronización entre pestañas con BroadcastChannel
 * - Refresh automático de token durante keepAlive
 */

import { useIdle, useEventListener } from '@vueuse/core'
import { logout, refreshToken, refreshTokenIfNeeded } from './auth'
import { saveSessionState } from './sessionRestore'
import notifier from './notifier'
import Swal from 'sweetalert2'

class InactivityHandlerNew {
  constructor() {
    // Configuración fija
    this.INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutos en ms
    this.WARNING_DURATION = 60 * 1000 // 60 segundos de advertencia
    this.PRE_WARNING_SECONDS = 60 // Pre-warning 60 segundos antes del timeout
    this.ACTIVITY_REFRESH_SKEW_MS = 10 * 60 * 1000 // Refresh si expira en menos de 10 min
    this.ACTIVITY_REFRESH_MIN_INTERVAL_MS = 60 * 1000 // Evitar refresh repetitivo
    
    // Estado
    this.isEnabled = false
    this.isInitialized = false
    this.isWarningShown = false
    this.isCountingDown = false
    this.isInLogoutProcess = false
    this.isPreWarningShown = false
    
    // Timers
    this._warningTimer = null
    this._countdownInterval = null
    this._preWarningTimer = null
    this._lastActivityRefreshCheck = 0
    this._activityListener = null
    
    // Contador
    this.countdownRemaining = this.WARNING_DURATION
    this.warningStartTime = null
    
    // Sincronización entre pestañas
    this.syncAcrossTabs = true
    this._bcName = 'inactivity_channel_v2'
    this._broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(this._bcName) : null
    
    if (this._broadcast) {
      this._broadcast.onmessage = (m) => this._onBroadcastMessage(m.data)
    }
    
    // Fallback para navegadores sin BroadcastChannel
    window.addEventListener('storage', (e) => {
      if (e.key === `${this._bcName}:msg`) {
        try {
          this._onBroadcastMessage(JSON.parse(e.newValue))
        } catch {}
      }
    })
    
    // Referencia al composable useIdle (se inicializa en init())
    this._idle = null
    this._cleanupIdle = null
    
    console.log('[InactivityHandlerNew] ✅ Instancia creada')
  }

  // ===== API PÚBLICA =====

  /**
   * Inicializar el handler de inactividad
   * @param {number} durationMinutes - Ignorado (siempre 15 min)
   * @param {number} warningSeconds - Ignorado (siempre 60s)
   */
  init(durationMinutes = 15, warningSeconds = 60) {
    if (this.isInitialized) {
      console.debug('[InactivityHandlerNew] Ya inicializado')
      return
    }

    // Usar configuración fija (ignorar parámetros)
    const timeout = this.INACTIVITY_TIMEOUT
    const warning = this.WARNING_DURATION

    console.log('[InactivityHandlerNew] 🚀 Inicializando...')
    console.log(`  ⏱️ Timeout: ${timeout / 60000} min (FIJO)`)
    console.log(`  ⚠️ Advertencia: ${warning / 1000}s (FIJO)`)
    console.log(`  📢 Pre-warning: ${this.PRE_WARNING_SECONDS}s antes del timeout`)

    // Inicializar useIdle de @vueuse/core
    // Esto detecta: mousemove, mousedown, keydown, scroll, touchstart, etc.
    this._initIdleDetection()
    this._initActivityKeepAlive()

    this.isEnabled = true
    this.isInitialized = true

    // Iniciar monitoreo
    this._startMonitoring()

    console.log('[InactivityHandlerNew] ✅ Inicializado correctamente')
  }

  /**
   * Destruir el handler
   */
  destroy() {
    console.log('[InactivityHandlerNew] 🗑️ Destruyendo...')
    
    this.isEnabled = false
    this.isInitialized = false
    
    this._clearAllTimers()
    this._cleanupActivityKeepAlive()
    
    // Limpiar useIdle
    if (this._cleanupIdle) {
      this._cleanupIdle()
      this._cleanupIdle = null
    }
    
    // Cerrar broadcast
    if (this._broadcast) {
      try {
        this._broadcast.close()
      } catch {}
      this._broadcast = null
    }
    
    // Resetear estado
    this.isWarningShown = false
    this.isCountingDown = false
    this.isPreWarningShown = false
    this.isInLogoutProcess = false
    
    console.log('[InactivityHandlerNew] ✅ Destruido')
  }

  /**
   * Pausar el handler
   */
  pause() {
    this.isEnabled = false
    this._clearAllTimers()
    this._cleanupActivityKeepAlive()
    console.log('[InactivityHandlerNew] ⏸️ Pausado')
  }

  /**
   * Reanudar el handler
   */
  resume() {
    if (!this.isInitialized) {
      console.warn('[InactivityHandlerNew] No inicializado')
      return
    }
    
    this.isEnabled = true
    this._startMonitoring()
    this._initActivityKeepAlive()
    console.log('[InactivityHandlerNew] ▶️ Reanudado')
  }

  /**
   * Keep alive - extender sesión
   * Llamado cuando el usuario hace clic en "Continuar sesión"
   */
  async keepAlive() {
    console.log('[InactivityHandlerNew] 👤 Usuario continuó sesión')
    
    // Refrescar token
    try {
      await refreshToken()
      console.log('[InactivityHandlerNew] ✅ Token refrescado')
    } catch (e) {
      console.warn('[InactivityHandlerNew] ⚠️ Error refrescando token:', e.message)
    }
    
    // Resetear estado
    this._resetState()
    
    // Cerrar modal de advertencia
    window.dispatchEvent(new Event('inactivity:warning-dismissed'))
    
    // Notificar a otras pestañas
    this._broadcastMessage({ type: 'active', timestamp: Date.now() })
    
    console.log('[InactivityHandlerNew] ✅ Sesión extendida')
  }

  /**
   * pulse() -> Marcar actividad manualmente (útil para llamadas API o acciones que
   * no disparen eventos DOM capturados por useIdle). Esto evita falsos logout.
   */
  pulse() {
    try {
      // Actualizar timestamp de última actividad
      if (this._idle && this._idle.lastActive) {
        try {
          // some implementations store lastActive as a ref/number
          if (typeof this._idle.lastActive === 'object' && 'value' in this._idle.lastActive) {
            this._idle.lastActive.value = Date.now()
          } else {
            this._idle.lastActive = Date.now()
          }
        } catch {}
      }
      // Resetear timers/estado de warning para evitar que se muestre mientras hay actividad
      this._resetState()
      // Notificar a otras pestañas que estamos activos
      this._broadcastMessage({ type: 'active', timestamp: Date.now() })
      console.debug('[InactivityHandlerNew] pulse() -> actividad registrada')
    } catch (e) {
      console.warn('[InactivityHandlerNew] pulse() falló:', e)
    }
  }

  /**
   * Realizar logout
   */
  async performLogout(reason = 'timeout') {
    if (this.isInLogoutProcess) return
    this.isInLogoutProcess = true
    
    console.log(`[InactivityHandlerNew] 🚪 Logout: ${reason}`)
    
    // Pausar inmediatamente
    this.isEnabled = false
    this._clearAllTimers()
    
    // Guardar estado de sesión
    this._saveSessionState(reason)
    
    // Notificar a otras pestañas
    this._broadcastMessage({ type: 'logout', reason, timestamp: Date.now() })
    
    // Realizar logout
    try {
      await logout()
    } catch (e) {
      console.error('[InactivityHandlerNew] Error en logout:', e)
    }
    
    // Redirigir
    console.log('[InactivityHandlerNew] 🔄 Redirigiendo...')
    setTimeout(() => {
      try {
        window.location.href = '/'
      } catch (e) {
        console.error('[InactivityHandlerNew] Error en redirección:', e)
      }
    }, 500)
  }

  /**
   * Actualizar duración (ignorado - siempre 15 min)
   */
  updateDuration(minutes) {
    console.log(`[InactivityHandlerNew] ⚠️ updateDuration(${minutes}) ignorado - duración fija: ${this.INACTIVITY_TIMEOUT / 60000} min`)
  }

  /**
   * Configurar segundos de pre-warning (ignorado - siempre 60s)
   */
  setPreWarningSeconds(seconds) {
    console.log(`[InactivityHandlerNew] ⚠️ setPreWarningSeconds(${seconds}) ignorado - pre-warning fijo: ${this.PRE_WARNING_SECONDS}s`)
  }

  /**
   * Configurar sincronización entre pestañas
   */
  setSyncAcrossTabs(enabled) {
    this.syncAcrossTabs = !!enabled
    localStorage.setItem('inactivitySyncTabs', String(this.syncAcrossTabs))
    console.log(`[InactivityHandlerNew] Sync entre pestañas: ${this.syncAcrossTabs}`)
  }

  /**
   * Configurar refresh de token (siempre activo)
   */
  setKeepAliveRefresh(enabled) {
    console.log('[InactivityHandlerNew] ⚠️ setKeepAliveRefresh() ignorado - refresh siempre activo')
  }

  /**
   * Configurar duración de advertencia (ignorado - siempre 60s)
   */
  setWarningDuration(seconds) {
    console.log(`[InactivityHandlerNew] ⚠️ setWarningDuration(${seconds}) ignorado - advertencia fija: ${this.WARNING_DURATION / 1000}s`)
  }

  /**
   * Configurar umbral de inactividad (ignorado - siempre 15 min)
   */
  setInactivityThreshold(seconds) {
    console.log(`[InactivityHandlerNew] ⚠️ setInactivityThreshold(${seconds}) ignorado - timeout fijo: ${this.INACTIVITY_TIMEOUT / 60000} min`)
  }

  /**
   * Obtener duración en minutos
   */
  getDurationMinutes() {
    return Math.round(this.INACTIVITY_TIMEOUT / 60000)
  }

  /**
   * Obtener info de debug
   */
  getDebugInfo() {
    const timeSinceLastActivity = this._idle ? Date.now() - this._idle.lastActive : 0
    
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      isIdle: this._idle?.isIdle ?? false,
      isWarningShown: this.isWarningShown,
      isCountingDown: this.isCountingDown,
      isPreWarningShown: this.isPreWarningShown,
      timeSinceLastActivity,
      inactivityDuration: this.INACTIVITY_TIMEOUT,
      warningDuration: this.WARNING_DURATION,
      countdownRemaining: this.countdownRemaining,
      lastActive: this._idle?.lastActive ?? Date.now()
    }
  }

  /**
   * Forzar pre-warning (debug)
   */
  forcePreWarning() {
    this.isPreWarningShown = false
    this._showPreWarning()
  }

  /**
   * Forzar warning (debug)
   */
  forceWarning() {
    this.isWarningShown = false
    this._showWarning()
    this._startCountdown()
  }

  /**
   * Forzar logout inmediato (debug)
   */
  async forceLogout() {
    console.log('[InactivityHandlerNew] 🚪 Forzando logout inmediato...')
    await this.performLogout('manual-test')
  }

  // ===== INTERNOS =====

  /**
   * Inicializar detección de inactividad con @vueuse/core
   */
  _initIdleDetection() {
    // useIdle de @vueuse/core escucha eventos en document por defecto
    // Retorna { idle, lastActive } donde:
    // - idle: ref<boolean> true si está inactivo
    // - lastActive: ref<number> timestamp de última actividad
    const { idle, lastActive } = useIdle(this.INACTIVITY_TIMEOUT, {
      events: ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'],
      initialState: false
    })
    
    this._idle = { idle, lastActive }
    
    // Watcher para detectar cambios en idle state
    // Usamos un interval para checkear el estado
    this._idleCheckInterval = setInterval(() => {
      if (!this.isEnabled || !this.isInitialized) return
      
      // Verificar si el usuario está inactivo
      if (this._idle.idle && !this.isWarningShown && !this.isInLogoutProcess) {
        // Usuario se volvió inactivo
        const timeSinceLastActive = Date.now() - this._idle.lastActive
        
        if (timeSinceLastActive >= this.INACTIVITY_TIMEOUT) {
          // Timeout alcanzado
          if (!this.isWarningShown) {
            console.log(`[InactivityHandlerNew] 🔴 TIMEOUT: ${(timeSinceLastActive / 1000).toFixed(1)}s`)
            this._showWarning()
            this._startCountdown()
          }
        } else if (timeSinceLastActive >= (this.INACTIVITY_TIMEOUT - this.PRE_WARNING_SECONDS * 1000)) {
          // Pre-warning
          if (!this.isPreWarningShown && !this.isWarningShown) {
            console.log(`[InactivityHandlerNew] 🟠 PRE-WARNING`)
            this._showPreWarning()
          }
        }
      }
    }, 1000) // Checkear cada segundo
    
    console.log('[InactivityHandlerNew] ✅ Detección de inactividad inicializada')
  }

  /**
   * Mantener la sesión activa en base a actividad del usuario (sin tocar timers de inactividad)
   */
  _initActivityKeepAlive() {
    if (this._activityListener || typeof window === 'undefined') return

    const events = ['mousemove', 'keydown', 'click', 'mousedown', 'touchstart']
    const handler = () => {
      if (!this.isEnabled || !this.isInitialized || this.isInLogoutProcess) return

      const now = Date.now()
      if (now - this._lastActivityRefreshCheck < this.ACTIVITY_REFRESH_MIN_INTERVAL_MS) return
      this._lastActivityRefreshCheck = now

      try {
        const pending = refreshTokenIfNeeded({ skewMs: this.ACTIVITY_REFRESH_SKEW_MS })
        if (pending && typeof pending.then === 'function') {
          pending.catch(() => {})
        }
      } catch {
        // ignore refresh errors on activity
      }
    }

    for (const evt of events) {
      window.addEventListener(evt, handler, { passive: true })
    }

    this._activityListener = { handler, events }
  }

  _cleanupActivityKeepAlive() {
    if (!this._activityListener || typeof window === 'undefined') return

    const { handler, events } = this._activityListener
    for (const evt of events) {
      window.removeEventListener(evt, handler)
    }

    this._activityListener = null
  }

  /**
   * Iniciar monitoreo
   */
  _startMonitoring() {
    // El monitoreo ya está activo via _idleCheckInterval
    console.log('[InactivityHandlerNew] ✅ Monitoreo activo')
  }

  /**
   * Mostrar pre-warning
   */
  _showPreWarning() {
    if (this.isPreWarningShown || !this.isEnabled) return
    
    this.isPreWarningShown = true
    
    console.log('[InactivityHandlerNew] 🟠 PRE-WARNING mostrado')
    
    // Disparar evento
    try {
      window.dispatchEvent(new Event('inactivity:prewarning'))
    } catch {}
    
    // Mostrar notificación
    try {
      notifier.warn(
        `⚠️ Inactividad detectada. Tu sesión vencerá en ${this.PRE_WARNING_SECONDS} segundos.`,
        { duration: 8000 }
      )
    } catch {}
    
    // Notificar a otras pestañas
    this._broadcastMessage({ type: 'prewarning', timestamp: Date.now() })
  }

  /**
   * Mostrar warning con SweetAlert2
   */
  async _showWarning() {
    if (this.isWarningShown || !this.isEnabled) return
    
    this.isWarningShown = true
    this.isPreWarningShown = false
    this.warningStartTime = Date.now()
    this.countdownRemaining = this.WARNING_DURATION
    
    console.log('[InactivityHandlerNew] 🔴 WARNING mostrado')
    
    // Disparar evento
    try {
      window.dispatchEvent(new Event('inactivity:warning'))
    } catch {}
    
    // Mostrar SweetAlert2
    try {
      const result = await Swal.fire({
        title: '⚠️ Sesión por expirar',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 16px; margin-bottom: 16px;">
              Tu sesión expirará en <strong id="swal-countdown">${this.WARNING_DURATION / 1000}</strong> segundos
            </p>
            <p style="font-size: 14px; color: #666;">
              Haz clic en "Continuar sesión" para mantener tu sesión activa
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continuar sesión',
        cancelButtonText: 'Cerrar sesión',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: this.WARNING_DURATION,
        timerProgressBar: true,
        didOpen: () => {
          // Actualizar countdown cada segundo
          const countdownEl = document.getElementById('swal-countdown')
          if (countdownEl) {
            this._swalCountdownInterval = setInterval(() => {
              const remaining = Math.ceil((this.WARNING_DURATION - (Date.now() - this.warningStartTime)) / 1000)
              if (remaining > 0) {
                countdownEl.textContent = remaining
              }
            }, 1000)
          }
        },
        willClose: () => {
          if (this._swalCountdownInterval) {
            clearInterval(this._swalCountdownInterval)
            this._swalCountdownInterval = null
          }
        }
      })
      
      if (result.isConfirmed) {
        // Usuario continuó sesión
        await this.keepAlive()
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Usuario cerró sesión manualmente
        await this.performLogout('user-cancelled')
      } else {
        // Timer expiró
        await this.performLogout('timeout')
      }
    } catch (e) {
      console.error('[InactivityHandlerNew] Error mostrando SweetAlert:', e)
      // Fallback: logout directo
      await this.performLogout('error')
    }
    
    // Notificar a otras pestañas
    this._broadcastMessage({ type: 'warning', timestamp: Date.now() })
  }

  /**
   * Iniciar countdown
   */
  _startCountdown() {
    if (this.isCountingDown) return
    
    this.isCountingDown = true
    const startTime = Date.now()
    
    console.log('[InactivityHandlerNew] ⏰ COUNTDOWN iniciado')
    
    this._countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      this.countdownRemaining = Math.max(0, this.WARNING_DURATION - elapsed)
      
      // Disparar evento para UI
      window.dispatchEvent(new Event('inactivity:countdown'))
      
      // Log cada segundo
      const secondsLeft = Math.ceil(this.countdownRemaining / 1000)
      if (secondsLeft > 0 && secondsLeft % 1 === 0 && elapsed % 1000 < 100) {
        console.debug(`[InactivityHandlerNew] ⏱️ Countdown: ${secondsLeft}s`)
      }
      
      // Countdown terminado
      if (this.countdownRemaining <= 0) {
        clearInterval(this._countdownInterval)
        this._countdownInterval = null
        
        if (!this.isInLogoutProcess) {
          console.log('[InactivityHandlerNew] 🚨 COUNTDOWN terminado - logout')
          this.performLogout('timeout')
        }
      }
    }, 100)
  }

  /**
   * Resetear estado
   */
  _resetState() {
    this.isWarningShown = false
    this.isCountingDown = false
    this.isPreWarningShown = false
    this.countdownRemaining = this.WARNING_DURATION
    this.warningStartTime = null
    
    this._clearAllTimers()
    
    // Nota: useIdle de @vueuse/core se resetea automáticamente
    // cuando detecta nueva actividad, no necesitamos llamar a reset()
  }

  /**
   * Limpiar todos los timers
   */
  _clearAllTimers() {
    if (this._warningTimer) {
      clearTimeout(this._warningTimer)
      this._warningTimer = null
    }
    
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval)
      this._countdownInterval = null
    }
    
    if (this._preWarningTimer) {
      clearTimeout(this._preWarningTimer)
      this._preWarningTimer = null
    }
    
    if (this._swalCountdownInterval) {
      clearInterval(this._swalCountdownInterval)
      this._swalCountdownInterval = null
    }
    
    if (this._idleCheckInterval) {
      clearInterval(this._idleCheckInterval)
      this._idleCheckInterval = null
    }
  }

  /**
   * Guardar estado de sesión
   */
  _saveSessionState(reason = 'unknown') {
    try {
      saveSessionState(reason)
      localStorage.setItem('inactivityRestoreSession', 'true')
    } catch {}
  }

  /**
   * Restaurar estado de sesión
   */
  static restoreSessionState() {
    try {
      const saved = sessionStorage.getItem('sessionStateBeforeLogout')
      if (!saved) return null
      const state = JSON.parse(saved)
      sessionStorage.removeItem('sessionStateBeforeLogout')
      return state
    } catch {
      return null
    }
  }

  /**
   * Enviar mensaje broadcast
   */
  _broadcastMessage(data) {
    if (!this.syncAcrossTabs) return
    
    try {
      if (this._broadcast) {
        this._broadcast.postMessage(data)
      } else {
        // Fallback: usar localStorage
        localStorage.setItem(`${this._bcName}:msg`, JSON.stringify(data))
        localStorage.removeItem(`${this._bcName}:msg`)
      }
    } catch {}
  }

  /**
   * Recibir mensaje broadcast
   */
  _onBroadcastMessage(data) {
    if (!data || !data.type) return
    
    console.log(`[InactivityHandlerNew] 📨 Broadcast: ${data.type}`)
    
    if (data.type === 'active') {
      // Otra pestaña detectó actividad
      this._resetState()
      window.dispatchEvent(new Event('inactivity:warning-dismissed'))
    } else if (data.type === 'logout') {
      // Otra pestaña hizo logout
      if (!this.isInLogoutProcess) {
        this.isInLogoutProcess = true
        this.isEnabled = false
        this._clearAllTimers()
        window.location.href = '/'
      }
    } else if (data.type === 'warning') {
      // Otra pestaña mostró warning
      window.dispatchEvent(new Event('inactivity:warning-passive'))
    } else if (data.type === 'prewarning') {
      // Otra pestaña mostró pre-warning
      window.dispatchEvent(new Event('inactivity:warning-passive'))
    }
  }
}

// Exportar instancia singleton
const inactivityHandler = new InactivityHandlerNew()
export default inactivityHandler
