/**
 * 🧪 TEST TIMING UTILITIES
 * Pruebas para verificar precisión de timers de inactividad
 */

import inactivityHandler from '@/utils/inactivityHandler'

window.testTiming = {
  /**
   * Test 1: Verificar timing exacto del timeout
   * @param {number} seconds - Segundos para esperar (default 60)
   */
  async testExactTimeout(seconds = 60) {
    console.log(`\n🧪 [TEST] Timeout exacto en ${seconds}s`)
    console.log(`⏱️ MARCA DE TIEMPO INICIO: ${new Date().toISOString()}`)
    
    // Inicializar con duración de X segundos
    inactivityHandler.init(seconds / 60, 20)
    inactivityHandler.setPreWarningSeconds(Math.round(seconds * 0.15))
    
    const startTime = Date.now()
    const events = []
    
    // Escuchar eventos
    const onPreWarning = () => {
      const elapsed = Date.now() - startTime
      events.push({ type: 'prewarning', ms: elapsed, s: (elapsed/1000).toFixed(2) })
      console.log(`📢 PRE-WARNING a los ${(elapsed/1000).toFixed(2)}s`)
    }
    
    const onWarning = () => {
      const elapsed = Date.now() - startTime
      events.push({ type: 'warning', ms: elapsed, s: (elapsed/1000).toFixed(2) })
      console.log(`🔴 MODAL a los ${(elapsed/1000).toFixed(2)}s`)
    }
    
    const onCountdown = () => {
      const remaining = inactivityHandler.countdownRemaining / 1000
      const elapsed = Date.now() - startTime
      if (remaining % 5 < 0.1 || remaining < 1) {
        console.log(`⏳ Countdown: ${remaining.toFixed(1)}s (${(elapsed/1000).toFixed(2)}s totales)`)
      }
    }
    
    window.addEventListener('inactivity:prewarning', onPreWarning)
    window.addEventListener('inactivity:warning', onWarning)
    window.addEventListener('inactivity:countdown', onCountdown)
    
    // Esperar a que se complete
    return new Promise((resolve) => {
      setTimeout(() => {
        window.removeEventListener('inactivity:prewarning', onPreWarning)
        window.removeEventListener('inactivity:warning', onWarning)
        window.removeEventListener('inactivity:countdown', onCountdown)
        
        console.log(`\n✅ TEST COMPLETADO`)
        console.log(`⏱️ MARCA DE TIEMPO FIN: ${new Date().toISOString()}`)
        console.log('📊 EVENTOS:')
        console.table(events)
        
        resolve(events)
      }, (seconds + 30) * 1000)
    })
  },

  /**
   * Test 2: Verificar continuidad con keepAlive()
   */
  async testKeepAlive() {
    console.log(`\n🧪 [TEST] Keep alive - extender sesión`)
    
    inactivityHandler.init(1, 20) // 1 minuto
    inactivityHandler.setPreWarningSeconds(30)
    
    console.log(`⏱️ Inicio: ${new Date().toISOString()}`)
    const startTime = Date.now()
    
    let warningCount = 0
    const onWarning = () => {
      warningCount++
      const elapsed = Date.now() - startTime
      console.log(`🔴 MODAL #${warningCount} a los ${(elapsed/1000).toFixed(2)}s`)
      
      if (warningCount === 1) {
        // Después de 5 segundos de la primera modal, llamar keepAlive
        setTimeout(async () => {
          const beforeKeepalive = Date.now() - startTime
          console.log(`👤 Llamando keepAlive() a los ${(beforeKeepalive/1000).toFixed(2)}s`)
          await inactivityHandler.keepAlive()
          console.log(`✅ Timer reseteado`)
        }, 5000)
      }
    }
    
    window.addEventListener('inactivity:warning', onWarning)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        window.removeEventListener('inactivity:warning', onWarning)
        console.log(`\n✅ TEST COMPLETADO - Sesión ${warningCount > 1 ? 'EXTENDIDA' : 'NO extendida'}`)
        resolve({ modalCount: warningCount })
      }, 150 * 1000) // 2.5 minutos
    })
  },

  /**
   * Test 3: Verificar precisión de countdown (20 segundos)
   */
  async testCountdownPrecision() {
    console.log(`\n🧪 [TEST] Precisión de countdown (20s)`)
    
    inactivityHandler.init(0.5, 20) // 30 segundos total
    inactivityHandler.setPreWarningSeconds(5)
    
    const countdownReadings = []
    let lastSecond = 20
    
    const onCountdown = () => {
      const remaining = inactivityHandler.countdownRemaining / 1000
      const second = Math.ceil(remaining)
      
      if (second !== lastSecond) {
        countdownReadings.push({ second, actual: remaining.toFixed(3) })
        console.log(`⏳ Segundo ${second}: ${remaining.toFixed(3)}s`)
        lastSecond = second
      }
    }
    
    const onLogout = () => {
      const elapsed = Date.now() - startTime
      console.log(`🚪 LOGOUT a los ${(elapsed/1000).toFixed(2)}s`)
    }
    
    const startTime = Date.now()
    window.addEventListener('inactivity:countdown', onCountdown)
    window.addEventListener('inactivity:warning', () => {
      console.log(`🔴 MODAL mostrada`)
    })
    
    return new Promise((resolve) => {
      // Esperar fallback logout
      setTimeout(() => {
        window.removeEventListener('inactivity:countdown', onCountdown)
        
        const accuracy = countdownReadings.length > 0
          ? ((countdownReadings.length / 20) * 100).toFixed(1)
          : 0
        
        console.log(`\n✅ TEST COMPLETADO`)
        console.log(`📊 Lecturas: ${countdownReadings.length}/20 segundos`)
        console.log(`📈 Precisión: ${accuracy}%`)
        
        resolve({ readings: countdownReadings, accuracy })
      }, 50000) // Poco después del timeout
    })
  },

  /**
   * Test 4: Verificar sincronización entre pestañas (BroadcastChannel)
   */
  testBroadcastChannel() {
    console.log(`\n🧪 [TEST] BroadcastChannel sync`)
    
    const isSupported = typeof BroadcastChannel !== 'undefined'
    console.log(`📡 BroadcastChannel soportado: ${isSupported}`)
    
    if (isSupported) {
      inactivityHandler.init(2, 20)
      console.log(`✅ Handler inicializado con sync entre pestañas`)
      console.log(`ℹ️ Abre otra pestaña y verifica que reciba eventos de inactividad`)
      return true
    } else {
      console.log(`⚠️ BroadcastChannel NO soportado - se usará localStorage fallback`)
      return false
    }
  },

  /**
   * Test adicional: simular comportamiento cuando la pestaña estuvo oculta
   * - Ajusta lastActivityTime y fuerza un check. Útil para verificar que
   *   la visibilidad no reinicia el timer (se corrigió en handler).
   */
  async testHiddenTabBehavior(secondsIdle = 600) {
    console.log(`\n🧪 [TEST] Simular pestaña oculta -> inactivo ${secondsIdle}s`)
    inactivityHandler.init(1, 20) // 1 minuto para pruebas
    inactivityHandler.setPreWarningSeconds(10)

    // Forzar estado como si hace 'secondsIdle' segundos no hubo actividad
    inactivityHandler.lastActivityTime = Date.now() - (secondsIdle * 1000)

    // Ejecutar comprobación inmediata
    inactivityHandler._checkInactivity()

    const info = inactivityHandler.getDebugInfo()
    console.log('DebugInfo después de _checkInactivity:', info)
    return info
  },

  /**
   * Test 5: Debug info en tiempo real
   */
  liveDebugInfo(intervalMs = 1000) {
    console.log(`\n🧪 [LIVE] Monitoreando handler cada ${intervalMs}ms...`)
    console.log(`Escribe testTiming.stopLiveDebug() para detener\n`)
    
    this._liveDebugInterval = setInterval(() => {
      const info = inactivityHandler.getDebugInfo()
      console.log(`⏱️ [${new Date().toISOString()}]`, {
        isEnabled: info.isEnabled ? '✅' : '❌',
        isWarning: info.isWarningShown ? '🔴' : '⬜',
        secondsSinceActivity: (info.timeSinceLastActivity / 1000).toFixed(1),
        countdownRemaining: (info.countdownRemaining / 1000).toFixed(1),
        inactivityDuration: `${(info.inactivityDuration / 60000).toFixed(1)}min`
      })
    }, intervalMs)
  },

  stopLiveDebug() {
    if (this._liveDebugInterval) {
      clearInterval(this._liveDebugInterval)
      this._liveDebugInterval = null
      console.log(`✅ Debug en vivo detenido`)
    }
  },

  /**
   * Test 6: Forzar diferentes escenarios
   */
  forceScenario(scenario) {
    console.log(`\n🧪 [FORCE] Ejecutando escenario: ${scenario}`)
    
    switch (scenario) {
      case 'prewarning':
        console.log(`📢 Forzando PRE-WARNING...`)
        inactivityHandler.forcePreWarning()
        break
      case 'warning':
        console.log(`🔴 Forzando MODAL...`)
        inactivityHandler.forceWarning()
        break
      case 'keepalive':
        console.log(`👤 Llamando keepAlive()...`)
        inactivityHandler.keepAlive()
        break
      case 'logout':
        console.log(`🚪 Forzando LOGOUT...`)
        inactivityHandler.performLogout('manual-test')
        break
      default:
        console.log(`⚠️ Escenario desconocido: ${scenario}`)
    }
  },

  // Ayuda
  help() {
    const help = `
🧪 TEST TIMING - Funciones disponibles:

▶️ TESTS AUTOMÁTICOS:
  testTiming.testExactTimeout(60)       → Verifica timeout exacto en 60s
  testTiming.testKeepAlive()             → Verifica extensión de sesión
  testTiming.testCountdownPrecision()   → Verifica precisión del countdown 20s
  testTiming.testBroadcastChannel()     → Verifica sync entre pestañas

▶️ MONITOREO EN VIVO:
  testTiming.liveDebugInfo(1000)        → Muestra info cada 1s
  testTiming.stopLiveDebug()            → Detiene monitoreo en vivo

▶️ ESCENARIOS FORZADOS:
  testTiming.forceScenario('prewarning') → Fuerza pre-advertencia
  testTiming.forceScenario('warning')   → Fuerza modal
  testTiming.forceScenario('keepalive') → Extiende sesión
  testTiming.forceScenario('logout')    → Fuerza logout

▶️ INFORMACIÓN:
  testTiming.help()                     → Muestra este mensaje
    `
    console.log(help)
  }
}

console.log('✅ Utilidades de timing cargadas. Escribe testTiming.help() para ver opciones.')
