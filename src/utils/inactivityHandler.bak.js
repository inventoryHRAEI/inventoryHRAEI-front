import { logout, refreshToken } from './auth'
import notifier from './notifier'

class InactivityHandler {
  constructor() {
    this._checkInterval = null
    this._countdownInterval = null
    this._fallbackLogoutTimer = null

    this.inactivityDuration = 30 * 60 * 1000
    this.warningDuration = 20 * 1000  // 20 segundos de advertencia
    this.inactivityThreshold = 5 * 1000  // 5 segundos para considerar inactivo
    this.preWarningSeconds = 60

    this.isEnabled = false
    this.isInitialized = false
    this.isInactive = false
    this.isWarningShown = false
    this.isCountingDown = false
    this.isInLogoutProcess = false
    this.isPreWarningShown = false

    this.lastActivityTime = Date.now()
    this.sessionStartTime = Date.now()
    this.countdownRemaining = this.warningDuration
    this.warningStartTime = null

    this.syncAcrossTabs = true
    this.keepAliveRefresh = true

    this._events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove', 'wheel']
    this._boundHandleActivity = this._handleActivity.bind(this)
    this._boundHandleVisibility = this._handleVisibilityChange.bind(this)

    this._bcName = 'inactivity_channel'
    this._broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(this._bcName) : null
    if (this._broadcast) {
      this._broadcast.onmessage = (m) => this._onBroadcastMessage(m.data)
    }

    window.addEventListener('storage', (e) => {
      if (e.key === `${this._bcName}:msg`) {
        try {
          this._onBroadcastMessage(JSON.parse(e.newValue))
        } catch {}
      }
    })

    this._loadSavedSettings()
    console.log('[InactivityHandler] ✅ Instancia creada')
  }

  _loadSavedSettings() {
    try {
      const w = localStorage.getItem('inactivityWarningSeconds')
      if (w) this.warningDuration = Math.max(5, parseInt(w, 10)) * 1000

      // NO cargar preWarningSeconds de localStorage - se establece en init() de App.vue
      // const pre = localStorage.getItem('inactivityPreWarningSeconds')
      // if (pre) this.preWarningSeconds = Math.max(5, parseInt(pre, 10))

      const thr = localStorage.getItem('inactivityThresholdSeconds')
      if (thr) this.inactivityThreshold = Math.max(1, parseInt(thr, 10)) * 1000

      const sync = localStorage.getItem('inactivitySyncTabs')
      if (sync !== null) this.syncAcrossTabs = sync === 'true'

      const ka = localStorage.getItem('inactivityKeepAliveRefresh')
      if (ka !== null) this.keepAliveRefresh = ka === 'true'
    } catch (e) {
      console.warn('[InactivityHandler] Error cargando settings:', e)
    }
  }

  // ===== API PÚBLICA =====

  init(durationMinutes = 30, warningSeconds = 20) {
    if (this.isInitialized) {
      console.debug('[InactivityHandler] Ya inicializado, actualizando duración')
      this.updateDuration(durationMinutes)
      return
    }

    // ⏱️ TIMING EXACTO
    // Configuración: inactivityDuration es el tiempo TOTAL hasta logout
    // warningDuration siempre 20s (no configurable, tiempo para decidir)
    // preWarningSeconds: cuándo mostrar notificación (N segundos ANTES del timeout)
    
    this.inactivityDuration = Math.max(1 * 60 * 1000, durationMinutes * 60 * 1000) // Mínimo 1 minuto
    this.warningDuration = 20 * 1000 // Siempre 20 segundos para el countdown final
    this.inactivityThreshold = 2 * 1000 // Apenas 2s para considerar inactivo (no afecta timing, solo para detectar)

    this.isEnabled = true
    this.isInitialized = true
    this.sessionStartTime = Date.now()
    this.lastActivityTime = Date.now()

    this._events.forEach((ev) => {
      document.addEventListener(ev, this._boundHandleActivity, { passive: true })
    })
    document.addEventListener('visibilitychange', this._boundHandleVisibility)

    this._startActivityMonitoring()

    console.log('[InactivityHandler] ✅ Inicializado')
    console.log(`  ⏱️ Timeout total: ${this.inactivityDuration / 60000}min`)
    console.log(`  📢 Pre-warning: ${this.preWarningSeconds}s antes del timeout`)
    console.log(`  ⏰ Countdown final: ${this.warningDuration / 1000}s`)
    console.log(`  📊 Umbral detección: ${this.inactivityThreshold / 1000}s`)
  }

  destroy() {
    this.isEnabled = false
    this.isInitialized = false
    this._clearAllTimers()

    // Limpiar listeners de eventos
    this._events.forEach((ev) => {
      document.removeEventListener(ev, this._boundHandleActivity)
    })
    document.removeEventListener('visibilitychange', this._boundHandleVisibility)

    // Cerrar broadcast channel
    if (this._broadcast) {
      try {
        this._broadcast.close()
      } catch (e) {}
      this._broadcast = null
    }

    // Resetear todos los estados
    this.isWarningShown = false
    this.isCountingDown = false
    this.isPreWarningShown = false
    this.isInactive = false
    this.isInLogoutProcess = false

    console.log('[InactivityHandler] ✅ Destruido completamente')
  }

  pause() {
    this.isEnabled = false
    this._clearAllTimers()
    console.log('[InactivityHandler] ⏸️ Pausado')
  }

  resume() {
    if (!this.isInitialized) {
      console.warn('[InactivityHandler] No inicializado, no se puede resumir')
      return
    }
    if (this.isEnabled) {
      console.log('[InactivityHandler] Ya está activo')
      return
    }
    this.isEnabled = true
    this.lastActivityTime = Date.now()
    this._startActivityMonitoring()
    console.log('[InactivityHandler] ▶️ Reanudado')
  }

  updateDuration(minutes) {
    this.inactivityDuration = Math.max(1, minutes) * 60 * 1000
    this._resetState()
    console.log('[InactivityHandler] ⏱️ Duración:', `${minutes}min`)
  }

  setPreWarningSeconds(seconds) {
    this.preWarningSeconds = Math.max(5, Number(seconds))
    console.log('[InactivityHandler] Pre-warning:', `${this.preWarningSeconds}s`)
  }

  setInactivityThreshold(seconds) {
    this.inactivityThreshold = Math.max(1, Number(seconds)) * 1000
    try {
      localStorage.setItem('inactivityThresholdSeconds', String(Math.round(this.inactivityThreshold / 1000)))
    } catch {}
  }

  setSyncAcrossTabs(enabled) {
    this.syncAcrossTabs = !!enabled
    try {
      localStorage.setItem('inactivitySyncTabs', String(this.syncAcrossTabs))
    } catch {}
  }

  setKeepAliveRefresh(enabled) {
    this.keepAliveRefresh = !!enabled
    try {
      localStorage.setItem('inactivityKeepAliveRefresh', String(this.keepAliveRefresh))
    } catch {}
  }

  setWarningDuration(seconds) {
    this.warningDuration = Math.max(5, Number(seconds)) * 1000
    this.countdownRemaining = this.warningDuration
    try {
      localStorage.setItem('inactivityWarningSeconds', String(Math.round(this.warningDuration / 1000)))
    } catch {}
  }

  async keepAlive() {
    console.log('[InactivityHandler] 👤 Usuario continuó sesión - reiniciando timer')

    if (this.keepAliveRefresh) {
      try {
        await refreshToken()
        console.log('[InactivityHandler] ✅ Token refrescado')
      } catch (e) {
        console.warn('[InactivityHandler] ⚠️ Refresh falló:', e.message)
      }
    }

    // ⚡ RESETEAR COMPLETAMENTE
    this.lastActivityTime = Date.now()
    this.isInactive = false
    this.isPreWarningShown = false
    this.isWarningShown = false
    this.isCountingDown = false
    
    // Limpiar TODOS los timers
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval)
      this._countdownInterval = null
    }
    if (this._fallbackLogoutTimer) {
      clearTimeout(this._fallbackLogoutTimer)
      this._fallbackLogoutTimer = null
    }
    
    // 🔄 Reiniciar monitoreo desde cero
    if (this._checkInterval) {
      clearInterval(this._checkInterval)
      this._checkInterval = null
    }
    this._startActivityMonitoring()
    
    // 📢 Cerrar modal
    window.dispatchEvent(new Event('inactivity:warning-dismissed'))
    console.debug('[InactivityHandler] ✅ Sesión extendida - timer reiniciado')
  }

  async performLogout(reason = 'timeout') {
    if (this.isInLogoutProcess) return
    this.isInLogoutProcess = true

    console.log(`[InactivityHandler] 🚪 Logout: ${reason}`)

    // Pausar INMEDIATAMENTE el handler para evitar más eventos
    this.isEnabled = false
    this._clearAllTimers()

    this.saveSessionState(reason)

    if (this.syncAcrossTabs) {
      this._broadcastMessage({ type: 'logout', reason, timestamp: Date.now() })
    }

    try {
      await logout()
    } catch (e) {
      console.error('[InactivityHandler] logout error:', e)
    }

    // Redirigir a home después de logout
    console.log('[InactivityHandler] 🔄 Redirigiendo a home...')
    setTimeout(() => {
      try {
        window.location.href = '/'
      } catch (e) {
        console.error('[InactivityHandler] Error en redirección:', e)
      }
    }, 500)
  }

  saveSessionState(reason = 'unknown') {
    try {
      const sessionState = {
        timestamp: Date.now(),
        reason,
        route: window.location.pathname,
        hash: window.location.hash,
        query: window.location.search,
        scrollPosition: { x: window.scrollX, y: window.scrollY }
      }
      sessionStorage.setItem('sessionStateBeforeLogout', JSON.stringify(sessionState))
    } catch (e) {}
  }

  static restoreSessionState() {
    try {
      const saved = sessionStorage.getItem('sessionStateBeforeLogout')
      if (!saved) return null
      const state = JSON.parse(saved)
      sessionStorage.removeItem('sessionStateBeforeLogout')
      return state
    } catch (e) {
      return null
    }
  }

  getDebugInfo() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      isInactive: this.isInactive,
      isWarningShown: this.isWarningShown,
      isCountingDown: this.isCountingDown,
      isPreWarningShown: this.isPreWarningShown,
      timeSinceLastActivity: Date.now() - this.lastActivityTime,
      inactivityDuration: this.inactivityDuration,
      warningDuration: this.warningDuration,
      countdownRemaining: this.countdownRemaining
    }
  }

  getDurationMinutes() {
    return Math.round(this.inactivityDuration / 60000)
  }

  /**
   * Método de debug: forzar mostrar pre-warning inmediatamente
   */
  forcePreWarning() {
    this.isPreWarningShown = false
    this._showPreWarningInternal()
  }

  /**
   * Método de debug: forzar mostrar modal inmediatamente
   */
  forceWarning() {
    this.isWarningShown = false
    this._showWarningInternal()
    this._startCountdownInternal()
  }

  // ===== INTERNALS =====

  _startActivityMonitoring() {
    if (this._checkInterval) {
      console.debug('[InactivityHandler] Monitor ya está corriendo')
      return
    }

    console.log('[InactivityHandler] ▶️ Iniciando monitoreo de inactividad')
    console.log(`   Timeout: ${this.inactivityDuration / 1000}s | Pre-warning: ${this.preWarningSeconds}s | Threshold: ${this.inactivityThreshold / 1000}s`)

    // Ejecutar check inmediatamente
    this._checkInactivity()
    
    // Luego cada 100ms para máxima precisión
    this._checkInterval = setInterval(() => {
      this._checkInactivity()
    }, 100)
  }

  _checkInactivity() {
    if (!this.isEnabled || !this.isInitialized) return

    // Tiempo EXACTO desde la última actividad sin threshold
    const timeSinceLastActivity = Date.now() - this.lastActivityTime
    
    // Debug: log cada 5 segundos
    if (Math.floor(timeSinceLastActivity / 5000) !== Math.floor((timeSinceLastActivity - 500) / 5000)) {
      console.debug(`[InactivityHandler] ⏱️ ${(timeSinceLastActivity / 1000).toFixed(1)}s inactivo (timeout: ${this.inactivityDuration / 1000}s)`)
    }

    // Nota: NO ignorar cuando la pestaña está oculta. Queremos que el timeout ocurra
    // aunque el usuario haya minimizado/ocultado la pestaña (protege la sesión).

    // Paso 1: Verificar si ya pasó el timeout
    if (timeSinceLastActivity >= this.inactivityDuration) {
      // TIMEOUT ALCANZADO - mostrar modal
      if (!this.isWarningShown) {
        console.log(`[InactivityHandler] 🔴 TIMEOUT: ${(timeSinceLastActivity / 1000).toFixed(1)}s >= ${(this.inactivityDuration / 1000).toFixed(1)}s`)
        this._showWarningInternal()
        this._startCountdownInternal()
      }
      return
    }

    // Paso 2: Detectar inactividad general (para logs)
    if (timeSinceLastActivity >= this.inactivityThreshold) {
      if (!this.isInactive) {
        this.isInactive = true
        this._broadcastMessage({ type: 'inactive-detected', timestamp: Date.now() })
        console.debug(`[InactivityHandler] 🟡 Usuario inactivo (${(timeSinceLastActivity / 1000).toFixed(1)}s sin actividad)`)
      }
    } else {
      if (this.isInactive) {
        this.isInactive = false
        console.debug('[InactivityHandler] 👤 Usuario activo nuevamente')
      }
      return
    }

    // Paso 3: Pre-warning (mostrar ANTES del timeout)
    // Se muestra cuando faltan preWarningSeconds
    const timeUntilTimeout = this.inactivityDuration - timeSinceLastActivity
    
    if (
      !this.isPreWarningShown &&
      !this.isWarningShown &&
      timeUntilTimeout <= (this.preWarningSeconds * 1000) &&
      timeUntilTimeout > 0
    ) {
      console.log(`[InactivityHandler] 🟠 PRE-WARNING: Faltan ${(timeUntilTimeout / 1000).toFixed(1)}s`)
      this._showPreWarningInternal()
    }
  }

  _showPreWarningInternal() {
    if (this.isPreWarningShown || !this.isEnabled) return

    this.isPreWarningShown = true

    console.log(`[InactivityHandler] 🟠 PRE-WARNING: Sesión vencerá en ${this.preWarningSeconds}s`)

    try {
      window.dispatchEvent(new Event('inactivity:prewarning'))
    } catch (e) {
      console.warn('[InactivityHandler] Error despachando prewarning:', e)
    }

    try {
      notifier.warn(
        `⚠️ Inactividad detectada. Tu sesión vencerá en ${this.preWarningSeconds} segundos.`,
        { duration: 8000 }
      )
    } catch (e) {
      console.warn('[InactivityHandler] Error mostrando pre-warning notificación:', e)
    }

    this._broadcastMessage({ type: 'prewarning', timestamp: Date.now() })
  }

  _showWarningInternal() {
    if (this.isWarningShown || !this.isEnabled) return

    this.isWarningShown = true
    this.isPreWarningShown = false
    this.warningStartTime = Date.now()
    this.countdownRemaining = this.warningDuration

    console.log('[InactivityHandler] 🔴 MODAL')

    // Disparar evento para mostrar el modal
    try {
      window.dispatchEvent(new Event('inactivity:warning'))
    } catch (e) {
      console.warn('[InactivityHandler] Error despachando evento warning:', e)
    }

    try {
      notifier.info(
        'Tu sesión expirará en 20 segundos. Haz clic para continuar.',
        { duration: 25000 }
      )
    } catch (e) {
      console.warn('[InactivityHandler] Error mostrando notificación:', e)
    }

    this._broadcastMessage({ type: 'warning', timestamp: Date.now() })

    // Fallback: forzar logout si el countdown no termina
    this._fallbackLogoutTimer = setTimeout(() => {
      if (!this.isInLogoutProcess) {
        console.log('[InactivityHandler] 🚨 FALLBACK logout')
        this.performLogout('timeout-fallback')
      }
    }, this.warningDuration + 1000)
  }

  _startCountdownInternal() {
    if (this._countdownInterval) {
      console.debug('[InactivityHandler] Countdown ya está corriendo')
      return
    }

    this.isCountingDown = true
    const startTime = Date.now()
    
    console.log(`[InactivityHandler] ⏰ COUNTDOWN INICIADO: ${this.warningDuration / 1000}s`)

    this._countdownInterval = setInterval(() => {
      // Calcular tiempo exacto desde el inicio del countdown
      const elapsed = Date.now() - startTime
      this.countdownRemaining = Math.max(0, this.warningDuration - elapsed)

      // Enviar evento para actualizar la UI cada 50ms
      window.dispatchEvent(new Event('inactivity:countdown'))

      // Log cada segundo
      const secondsLeft = Math.ceil(this.countdownRemaining / 1000)
      if (secondsLeft > 0 && secondsLeft % 1 === 0 && elapsed % 1000 < 100) {
        console.debug(`[InactivityHandler] ⏱️ Countdown: ${secondsLeft}s`)
      }

      // Cuando se termine el countdown
      if (this.countdownRemaining <= 0) {
        clearInterval(this._countdownInterval)
        this._countdownInterval = null
        this.isCountingDown = false
        this.countdownRemaining = 0

        console.log('[InactivityHandler] ⏱️ Countdown terminado → Forzando logout')
        this.performLogout('timeout').catch(() => {})
      }
    }, 50) // Actualizar cada 50ms para UI fluida
  }

  _clearAllTimers() {
    if (this._checkInterval) {
      clearInterval(this._checkInterval)
      this._checkInterval = null
    }
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval)
      this._countdownInterval = null
    }
    if (this._fallbackLogoutTimer) {
      clearTimeout(this._fallbackLogoutTimer)
      this._fallbackLogoutTimer = null
    }
    this.isCountingDown = false
  }

  _dismissWarningInternal() {
    this._clearAllTimers()
    this.isWarningShown = false
    this.isPreWarningShown = false
    this.isCountingDown = false
    this.countdownRemaining = this.warningDuration
    console.debug('[InactivityHandler] Warnings descartadas')
  }

  _resetState() {
    this.lastActivityTime = Date.now()
    this.isInactive = false
    this.isPreWarningShown = false  // Resetear pre-warning también
    this._dismissWarningInternal()
  }

  _handleActivity(e) {
    if (!this.isEnabled) return

    // Actualizar tiempo de actividad
    this.lastActivityTime = Date.now()
    
    // Debug logs
    if (this.isWarningShown) {
      console.log('[InactivityHandler] 👤 Usuario interactuó mientras modal está visible - esperando decisión explícita')
      // NO cerrar automáticamente el modal - el usuario debe hacer clic en un botón
    } else if (this.isInactive) {
      console.debug('[InactivityHandler] 👤 Usuario activo nuevamente')
    }

    // Limpiar pre-warning si el usuario hace actividad
    if (this.isPreWarningShown) {
      this.isPreWarningShown = false
      console.debug('[InactivityHandler] Pre-warning descartada por actividad')
    }
  }

  _handleVisibilityChange() {
    // No tratamos el cambio de visibilidad como "actividad" —
    // si el usuario vuelve a la pestaña no queremos reiniciar el contador
    // (esto causaba que la sesión nunca expirara si la pestaña se ocultaba).
    // En su lugar, solo emitimos un mensaje para sincronización/diagnóstico.
    try {
      this._broadcastMessage({ type: 'visibility', visible: document.visibilityState === 'visible', timestamp: Date.now() })
      console.debug(`[InactivityHandler] visibilitychange -> ${document.visibilityState}`)
    } catch (e) {
      console.warn('[InactivityHandler] visibility change handler error', e)
    }
  }

  _broadcastMessage(msg) {
    if (!this.syncAcrossTabs) return

    try {
      if (this._broadcast) {
        this._broadcast.postMessage(msg)
      } else {
        localStorage.setItem(`${this._bcName}:msg`, JSON.stringify(msg))
      }
    } catch (e) {}
  }

  _onBroadcastMessage(msg) {
    if (!msg || !msg.type) return

    if (msg.type === 'logout') {
      this._clearAllTimers()
      this.isEnabled = false

    } else if (msg.type === 'warning') {
      // Otra pestaña ha entrado en estado WARNING.
      // Emitir evento pasivo para que las pestañas visibles muestren indicador ligero.
      try {
        window.dispatchEvent(new Event('inactivity:warning-passive'))
      } catch (e) {}
      // Mantener estado interno por compatibilidad (no forzamos modal localmente)
      this.isWarningShown = true

    } else if (msg.type === 'prewarning') {
      // Pre-warning en otra pestaña: notificar en UI (pasivo)
      try {
        window.dispatchEvent(new Event('inactivity:prewarning'))
      } catch (e) {}
      this.isPreWarningShown = true

    } else if (msg.type === 'visibility') {
      // Mensaje de visibilidad (solo para diagnóstico)
      console.debug('[InactivityHandler] Broadcast visibility ->', msg.visible)
    }
  }
}

export default new InactivityHandler()
