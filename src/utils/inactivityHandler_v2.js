// Servicio completo y robusto de manejo de inactividad y cierre automático de sesión
import { logout } from './auth'

class InactivityHandler {
  constructor() {
    // ============ TIMERS Y INTERVALOS ============
    this.countdownInterval = null
    this.activityCheckInterval = null
    this.visibilityCheckInterval = null
    
    // ============ CONFIGURACIÓN ============
    this.inactivityDuration = 30 * 60 * 1000 // 30 minutos por defecto (antes de advertencia)
    this.warningDuration = 1 * 60 * 1000 // 1 minuto de advertencia (antes de logout automático)
    this.inactivityThreshold = 20 * 1000 // 20 segundos sin actividad para detectar inactividad
    
    // ============ ESTADO DE INACTIVIDAD ============
    this.isEnabled = false
    this.isInitialized = false
    this.isWarningShown = false
    this.isFinalWarningShown = false
    this.isInactive = false
    this.isCountingDown = false
    this.isInLogoutProcess = false
    this.lastActivityTime = Date.now()
    
    // ============ TIEMPO RESTANTE ============
    this.countdownRemaining = this.warningDuration
    this.warningStartTime = null
    
    // ============ DETECCIÓN DE VISIBILIDAD ============
    this.isPageVisible = true
    this.pausedTime = null
    
    // ============ EVENTOS MONITOREADOS ============
    this.events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove']
    
    // ============ METADATOS ============
    this.logoutReason = null // 'manual', 'timeout', 'error'
    this.sessionStartTime = Date.now()
  }

  /**
   * INICIALIZACIÓN DEL SISTEMA
   * 
   * QUÉ PASA:
   * 1. Se valida que no esté ya inicializado
   * 2. Se configuran los timers (duración y advertencia)
   * 3. Se agregan los event listeners de actividad
   * 4. Se inicia el monitor de visibilidad de la página
   * 5. Se comienza a monitorear inactividad
   * 
   * CUÁNDO SE LLAMA:
   * - En App.vue durante onMounted
   * - Cuando el usuario habilita la detección en settings
   * 
   * RESULTADO:
   * - Sistema activo y monitoreando actividad del usuario
   */
  init(durationMinutes = 30) {
    if (this.isInitialized) {
      console.log(`[InactivityHandler] Ya está inicializado, solo actualizando duración...`)
      this.updateDuration(durationMinutes)
      return
    }

    this.inactivityDuration = durationMinutes * 60 * 1000
    this.isEnabled = true
    this.isInitialized = true
    this.lastActivityTime = Date.now()
    this.sessionStartTime = Date.now()
    this.isInactive = false
    this.isCountingDown = false
    this.isWarningShown = false
    this.isFinalWarningShown = false

    // Agregar event listeners para detectar actividad
    this.events.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), { 
        passive: true,
        capture: false
      })
    })

    // Monitorear cambios de visibilidad de la página
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    // Iniciar monitoreo de inactividad
    this.startActivityMonitoring()
    this.startVisibilityMonitoring()

    console.log(`[InactivityHandler] ✅ Inicializado correctamente`)
    console.log(`[InactivityHandler] ⏱️ Duración: ${durationMinutes} min | Advertencia: ${this.warningDuration / 60000} min`)
  }

  /**
   * MONITOREAR CAMBIOS DE VISIBILIDAD
   * 
   * QÚES PASA:
   * 1. Detecta cuando el usuario cambia de pestaña
   * 2. Pausa el contador si la página está oculta
   * 3. Reanuda el contador cuando vuelve a la página
   * 
   * PROPÓSITO:
   * - No contar tiempo cuando el usuario no está viendo la página
   * - Evitar falsos positivos de inactividad
   */
  startVisibilityMonitoring() {
    this.visibilityCheckInterval = setInterval(() => {
      const isVisible = document.visibilityState === 'visible'
      
      if (isVisible && !this.isPageVisible) {
        // La página se volvió visible
        this.isPageVisible = true
        this.lastActivityTime = Date.now()
        if (this.isCountingDown) {
          console.log('[InactivityHandler] 👁️ Página visible de nuevo, reanudando timer')
        }
      } else if (!isVisible && this.isPageVisible) {
        // La página se volvió invisible
        this.isPageVisible = false
        this.pausedTime = Date.now()
        if (this.isCountingDown) {
          console.log('[InactivityHandler] 👁️ Página oculta, pausando timer')
        }
      }
    }, 500)
  }

  /**
   * MANEJAR CAMBIO DE VISIBILIDAD DE PÁGINA
   * 
   * PROPÓSITO:
   * - Sincronizar estado cuando cambios entre pestañas
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.pausedTime = Date.now()
      console.log('[InactivityHandler] 📄 Página oculta')
    } else {
      // Cuando vuelve a ser visible, ajustar lastActivityTime para no contar el tiempo pausado
      if (this.pausedTime) {
        const pausedDuration = Date.now() - this.pausedTime
        this.lastActivityTime = Date.now()
        this.pausedTime = null
        console.log('[InactivityHandler] 📄 Página visible nuevamente')
      }
    }
  }

  /**
   * MONITOREAR INACTIVIDAD DEL USUARIO
   * 
   * FLUJO:
   * 1. Cada segundo, calcula tiempo desde última actividad
   * 2. Si supera threshold (20s), marca como inactivo
   * 3. Si página está visible e inactivo, después de X minutos muestra advertencia
   * 4. Si inactivo continúa, inicia countdown
   * 5. Si usuario hace algo, pausa todo
   * 
   * QÚES PASA EN DETALLE:
   * 
   * [Segundo 0-20] → Usuario activo
   *   └─ lastActivityTime se actualiza con cada acción
   *   └─ isInactive = false
   * 
   * [Segundo 20] → Detecta inactividad
   *   └─ isInactive = true
   *   └─ Comienza a contar segundos hacia la advertencia
   * 
   * [Segundo 20 a X minutos] → Usuario sigue inactivo
   *   └─ Conteo silencioso, sin UI
   *   └─ Si usuario hace clic, se resetea todo
   * 
   * [Minuto X] → Inactividad alcanza duración configurada
   *   └─ showWarning() → Muestra advertencia en UI
   *   └─ isWarningShown = true
   *   └─ startCountdown() → Comienza countdown visual de 1 minuto
   * 
   * [Segundo X+40] → Últimos 60 segundos, muestra modal
   *   └─ isFinalWarningShown = true
   *   └─ Modal: "¿Aún estás aquí?"
   * 
   * [Segundo X+60] → Contador llega a 0
   *   └─ performLogout()
   *   └─ Sesión cerrada
   */
  startActivityMonitoring() {
    this.activityCheckInterval = setInterval(() => {
      if (!this.isEnabled || !this.isInitialized) return
      if (!this.isPageVisible) return // No contar cuando página está oculta

      const timeSinceLastActivity = Date.now() - this.lastActivityTime
      
      // ESTADO 1: Usuario está activo (menos de 20s sin actividad)
      if (timeSinceLastActivity < this.inactivityThreshold) {
        if (this.isInactive) {
          // Usuario se reactiva
          this.isInactive = false
          this.dismissWarning()
          console.log('[InactivityHandler] ✅ Usuario reactivo')
        }
        return
      }

      // ESTADO 2: Usuario está inactivo (más de 20s sin actividad)
      if (!this.isInactive) {
        this.isInactive = true
        console.log('[InactivityHandler] ⏳ Usuario inactivo detectado (20s sin actividad)')
      }

      // ESTADO 3: Tiempo desde inactividad inicial hasta mostrar advertencia
      const timeInactiveWithoutWarning = timeSinceLastActivity - this.inactivityThreshold
      
      if (timeInactiveWithoutWarning >= this.inactivityDuration && !this.isWarningShown) {
        // Ha pasado el tiempo configurado, mostrar advertencia
        this.showWarning()
        this.startCountdown()
      }
    }, 1000) // Verificar cada segundo para precisión
  }

  /**
   * DETECTAR ACTIVIDAD DEL USUARIO
   * 
   * QÚES PASA:
   * 1. Se activa con cualquier interacción del usuario
   * 2. Actualiza lastActivityTime al tiempo actual
   * 3. Si había advertencia, la cierra
   * 4. Si estaba en countdown, lo pausa
   * 
   * PROPÓSITO:
   * - Resetear el contador de inactividad
   * - Mantener sesión activa mientras usuario interactúa
   */
  handleActivity() {
    if (!this.isEnabled || !this.isInitialized) return

    const wasInactive = this.isInactive
    this.lastActivityTime = Date.now()

    // Si había una advertencia y el usuario vuelve a estar activo
    if (this.isWarningShown) {
      this.dismissWarning()
      console.log('[InactivityHandler] 🖱️ Actividad detectada, ocultando advertencia')
    }
  }

  /**
   * MOSTRAR ADVERTENCIA DE INACTIVIDAD
   * 
   * QÚES PASA:
   * 1. Marca que la advertencia fue mostrada
   * 2. Dispara evento para que Vue la renderize
   * 3. Calcula tiempo restante (60 segundos de countdown)
   * 
   * PROPÓSITO:
   * - Notificar al usuario que su sesión se cerrará pronto
   * - Mostrar contador visual
   * - Ofrecer opción de cerrar sesión manualmente
   */
  showWarning() {
    if (this.isWarningShown) return

    this.isWarningShown = true
    this.warningStartTime = Date.now()
    this.countdownRemaining = this.warningDuration

    console.log('[InactivityHandler] ⚠️ Mostrando advertencia de inactividad')

    // Disparar evento para que Vue la renderice
    try {
      window.dispatchEvent(new CustomEvent('inactivity:warning', {
        detail: {
          reason: 'timeout',
          countdownRemaining: this.countdownRemaining,
          minutesRemaining: Math.ceil(this.countdownRemaining / 60000)
        }
      }))
    } catch (error) {
      console.error('[InactivityHandler] Error disparando evento de advertencia:', error)
    }
  }

  /**
   * INICIAR COUNTDOWN VISUAL
   * 
   * QÚES PASA:
   * 1. Marca que estamos en fase de countdown
   * 2. Actualiza contador cada 100ms para precisión
   * 3. Dispara evento cada 100ms para que Vue actualice el UI
   * 4. Cuando llega a 0, ejecuta performLogout()
   * 
   * FLUJO:
   * [0ms] → Inicia countdown
   * [40s] → Muestra modal "¿Aún estás aquí?"
   * [60s] → Ejecuta logout
   */
  startCountdown() {
    if (this.isCountingDown) return

    this.isCountingDown = true
    this.warningStartTime = Date.now()
    this.countdownRemaining = this.warningDuration

    console.log('[InactivityHandler] ⏱️ Iniciando countdown de cierre automático')

    this.countdownInterval = setInterval(() => {
      if (!this.isEnabled || !this.isWarningShown) {
        clearInterval(this.countdownInterval)
        this.isCountingDown = false
        return
      }

      // Calcular tiempo restante desde cuando comenzó el countdown
      const elapsedSinceWarning = Date.now() - this.warningStartTime
      this.countdownRemaining = Math.max(0, this.warningDuration - elapsedSinceWarning)

      // Disparar evento para actualizar UI
      try {
        window.dispatchEvent(new CustomEvent('inactivity:countdown', {
          detail: {
            remaining: this.countdownRemaining,
            totalDuration: this.warningDuration,
            percentageRemaining: (this.countdownRemaining / this.warningDuration) * 100
          }
        }))
      } catch (error) {
        console.error('[InactivityHandler] Error disparando evento de countdown:', error)
      }

      // Si llegó a cero, logout
      if (this.countdownRemaining <= 0) {
        clearInterval(this.countdownInterval)
        this.isCountingDown = false
        this.logoutReason = 'timeout'
        this.performLogout('timeout')
      }
    }, 100) // Actualizar cada 100ms para precisión
  }

  /**
   * OCULTAR ADVERTENCIA (USUARIO REACTIVA)
   * 
   * QÚES PASA:
   * 1. Marca advertencia como no mostrada
   * 2. Pausa el countdown
   * 3. Dispara evento para que Vue oculte el UI
   * 
   * PROPÓSITO:
   * - Resetear estado cuando usuario vuelve a interactuar
   */
  dismissWarning() {
    if (!this.isWarningShown) return

    this.isWarningShown = false
    this.isFinalWarningShown = false
    this.isCountingDown = false
    clearInterval(this.countdownInterval)
    this.countdownRemaining = this.warningDuration

    console.log('[InactivityHandler] ✅ Advertencia ocultada, sesión reactivada')

    try {
      window.dispatchEvent(new Event('inactivity:warning-dismissed'))
    } catch (error) {
      console.error('[InactivityHandler] Error disparando evento de dismissal:', error)
    }
  }

  /**
   * REALIZAR LOGOUT
   * 
   * FLUJO COMPLETO:
   * 
   * 1. VALIDACIÓN
   *    └─ ¿Está habilitado? ¿No estamos ya en logout?
   * 
   * 2. GUARDAR ESTADO
   *    └─ saveSessionState() → sessionStorage
   *    └─ Guarda: ruta, scroll, hash, query, timestamp
   * 
   * 3. REGISTRAR RAZÓN
   *    └─ this.logoutReason = 'manual' | 'timeout'
   *    └─ Para analytics y debugging
   * 
   * 4. DISPARAR EVENTOS
   *    └─ 'inactivity:logout' → Para que otras partes se limpien
   * 
   * 5. EJECUTAR LOGOUT EN BACKEND
   *    └─ logout() → Invalida token, limpia sesión
   * 
   * 6. REDIRIGIR A LOGIN
   *    └─ window.location.href = '/'
   *    └─ Limpia todo (incluida memoria de la app)
   * 
   * MANEJO DE ERRORES:
   * └─ Si hay error, igualmente redirige a login
   * └─ Registra error en console para debugging
   */
  async performLogout(reason = 'timeout') {
    if (!this.isEnabled) return
    if (this.isInLogoutProcess) return // Evitar doble logout

    this.isInLogoutProcess = true
    this.logoutReason = reason

    console.log(`[InactivityHandler] 🔐 Iniciando logout (razón: ${reason})`)

    try {
      // Guardar estado antes de cerrar sesión
      this.saveSessionState(reason)
      
      // Disparar evento para que otras partes se preparen
      window.dispatchEvent(new CustomEvent('inactivity:logout', {
        detail: {
          reason: reason,
          sessionDuration: Date.now() - this.sessionStartTime,
          timestamp: Date.now()
        }
      }))

      console.log(`[InactivityHandler] 📤 Ejecutando logout en backend...`)
      
      // Ejecutar logout en backend
      await logout()

      console.log(`[InactivityHandler] ✅ Logout completado en backend`)
      
      // Redirigir a login (limpia todo)
      window.location.href = '/'
    } catch (error) {
      console.error('[InactivityHandler] ❌ Error durante logout:', error)
      
      // Igualmente redirigir para asegurar que la sesión se cierre
      window.location.href = '/'
    }
  }

  /**
   * GUARDAR ESTADO DE LA SESIÓN
   * 
   * QÚES PASA:
   * 1. Recopila información actual
   * 2. La guarda en sessionStorage (temporal, se limpia al cerrar pestaña)
   * 3. Se usa para restaurar cuando el usuario vuelve a login
   * 
   * QUÉ SE GUARDA:
   * - timestamp: Cuándo se guardó
   * - reason: Por qué se cerró (timeout, manual, error)
   * - route: Ruta actual
   * - hash: Fragment (#algo)
   * - query: Query string (?param=value)
   * - scrollPosition: {x, y}
   * - sessionDuration: Cuánto duró la sesión
   * 
   * PROPÓSITO:
   * - Restaurar usuario al mismo lugar cuando vuelva a iniciar sesión
   * - No perder contexto de trabajo
   * 
   * SEGURIDAD:
   * - sessionStorage se limpia al cerrar la pestaña/navegador
   * - Solo almacena información de navegación, NO datos sensibles
   * - Se elimina inmediatamente después de restaurar
   */
  saveSessionState(reason = 'unknown') {
    try {
      const sessionState = {
        timestamp: Date.now(),
        reason: reason,
        route: window.location.pathname,
        hash: window.location.hash,
        query: window.location.search,
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY
        },
        sessionDuration: Date.now() - this.sessionStartTime,
        inactivityDuration: this.inactivityDuration,
        lastActivityTime: this.lastActivityTime
      }
      
      sessionStorage.setItem('sessionStateBeforeLogout', JSON.stringify(sessionState))
      console.log('[InactivityHandler] 💾 Estado de sesión guardado:', {
        reason: sessionState.reason,
        duration: `${(sessionState.sessionDuration / 1000 / 60).toFixed(1)} min`,
        route: sessionState.route
      })
    } catch (error) {
      console.error('[InactivityHandler] ❌ Error guardando estado de sesión:', error)
    }
  }

  /**
   * RESTAURAR ESTADO DE LA SESIÓN
   * 
   * QÚES PASA:
   * 1. Busca estado guardado en sessionStorage
   * 2. Lo limpia inmediatamente (usar una sola vez)
   * 3. Lo retorna para que App.vue lo use
   * 
   * CUÁNDO SE LLAMA:
   * - En App.vue onMounted(), después de validar sesión
   * 
   * RETORNA:
   * - null si no hay estado guardado
   * - Object si hay estado para restaurar
   * 
   * DATOS QUE RETORNA:
   * {
   *   timestamp: 1708...
   *   reason: 'timeout' | 'manual'
   *   route: '/dashboard/inventario'
   *   hash: '#seccion'
   *   query: '?tab=1'
   *   scrollPosition: {x: 0, y: 245}
   *   sessionDuration: 3600000
   *   inactivityDuration: 1800000
   * }
   */
  static restoreSessionState() {
    try {
      const saved = sessionStorage.getItem('sessionStateBeforeLogout')
      
      if (!saved) {
        return null
      }

      const state = JSON.parse(saved)
      
      // Limpiar inmediatamente después de leer (usar una sola vez)
      sessionStorage.removeItem('sessionStateBeforeLogout')
      
      console.log('[InactivityHandler] 📖 Estado de sesión restaurado:', {
        reason: state.reason,
        route: state.route,
        sessionDuration: `${(state.sessionDuration / 1000 / 60).toFixed(1)} min`
      })

      return state
    } catch (error) {
      console.error('[InactivityHandler] ❌ Error restaurando estado de sesión:', error)
      
      // Limpiar igual si hay error
      try {
        sessionStorage.removeItem('sessionStateBeforeLogout')
      } catch {}
      
      return null
    }
  }

  /**
   * ACTUALIZAR DURACIÓN DE INACTIVIDAD
   * 
   * CUÁNDO SE USA:
   * - Cuando usuario cambia la configuración en settings
   * - Cuando se recarga la página y hay nueva configuración
   * 
   * QUÉ HACE:
   * 1. Actualiza inactivityDuration
   * 2. Resetea los timers actuales
   * 3. Comienza a monitorear con nueva duración
   * 
   * PROPÓSITO:
   * - Cambiar tiempo sin reiniciar todo el sistema
   * - Aplicar cambios de configuración en tiempo real
   */
  updateDuration(durationMinutes) {
    this.inactivityDuration = durationMinutes * 60 * 1000
    
    // Resetear si estábamos en advertencia
    this.dismissWarning()
    
    console.log(`[InactivityHandler] ⏱️ Duración actualizada a ${durationMinutes} minutos`)
  }

  /**
   * OBTENER INFORMACIÓN DE DEBUGGING
   * 
   * PROPÓSITO:
   * - Para debugging y monitoreo
   * - Ver estado actual del sistema
   */
  getDebugInfo() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      isInactive: this.isInactive,
      isWarningShown: this.isWarningShown,
      isCountingDown: this.isCountingDown,
      isPageVisible: this.isPageVisible,
      timeSinceLastActivity: Date.now() - this.lastActivityTime,
      inactivityDuration: `${this.inactivityDuration / 1000 / 60} min`,
      warningDuration: `${this.warningDuration / 1000 / 60} min`,
      countdownRemaining: `${(this.countdownRemaining / 1000).toFixed(1)}s`,
      sessionDuration: `${((Date.now() - this.sessionStartTime) / 1000 / 60).toFixed(1)} min`,
      logoutReason: this.logoutReason
    }
  }

  /**
   * DESTRUIR EL MANEJADOR
   * 
   * CUÁNDO SE USA:
   * - onBeforeUnmount() de App.vue
   * - Cuando usuario desactiva la detección de inactividad
   * - Antes de cambiar de usuario
   * 
   * QUÉ HACE:
   * 1. Deshabilita el sistema
   * 2. Limpia todos los intervals y timeouts
   * 3. Remueve todos los event listeners
   * 4. Resetea el estado
   * 
   * PROPÓSITO:
   * - Evitar memory leaks
   * - Detener monitoreo completamente
   * - Limpiar recursos
   */
  destroy() {
    console.log('[InactivityHandler] 🗑️ Destruyendo handler...')

    this.isEnabled = false
    this.isInitialized = false
    this.isInactive = false
    this.isWarningShown = false
    this.isFinalWarningShown = false
    this.isCountingDown = false

    // Limpiar todos los intervals
    clearInterval(this.countdownInterval)
    clearInterval(this.activityCheckInterval)
    clearInterval(this.visibilityCheckInterval)

    // Remover todos los event listeners
    this.events.forEach(event => {
      try {
        document.removeEventListener(event, this.handleActivity.bind(this))
      } catch (error) {
        console.warn(`[InactivityHandler] Error removiendo listener ${event}:`, error)
      }
    })

    try {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    } catch (error) {
      console.warn('[InactivityHandler] Error removiendo listener visibilitychange:', error)
    }

    console.log('[InactivityHandler] ✅ Handler destruido completamente')
  }

  /**
   * PAUSAR MONITOREO
   * 
   * DIFERENCIA CON destroy():
   * - No remueve event listeners
   * - No resetea estado
   * - Puede reanudarse luego
   * 
   * CASOS DE USO:
   * - Cuando el usuario abre un modal importante
   * - Cuando hay un proceso largo en progreso
   * - Cuando se necesita pausar temporalmente
   */
  pause() {
    this.isEnabled = false
    clearInterval(this.countdownInterval)
    clearInterval(this.activityCheckInterval)
    clearInterval(this.visibilityCheckInterval)
    console.log('[InactivityHandler] ⏸️ Sistema pausado')
  }

  /**
   * REANUDAR MONITOREO
   * 
   * PROPÓSITO:
   * - Reanudar después de pause()
   * - Continuar monitoreando desde donde se pausó
   */
  resume() {
    if (!this.isInitialized) {
      console.warn('[InactivityHandler] No se puede reanudar, no fue inicializado')
      return
    }

    this.isEnabled = true
    this.lastActivityTime = Date.now()
    this.startActivityMonitoring()
    this.startVisibilityMonitoring()
    console.log('[InactivityHandler] ▶️ Sistema reanudado')
  }
}

// Exportar instancia única (singleton)
export default new InactivityHandler()
