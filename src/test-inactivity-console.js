// Script para testing del flujo de inactividad desde la consola del navegador

window.testInactivity = {
  /**
   * Modo RÁPIDO: Timeout de 10 segundos
   * Útil para pruebas rápidas
   */
  fastMode() {
    const handler = window.inactivityHandler
    handler.updateDuration(10 / 60) // 10 segundos
    handler.setInactivityThreshold(2) // 2 segundos para detectar inactivo
    handler.setPreWarningSeconds(5) // 5 segundos de advertencia previa
    console.log('✅ MODO RÁPIDO: Timeout en 10s, pre-warning en 5s')
    console.log('   Espera 2s sin actividad, luego verás pre-warning en 5s')
  },

  /**
   * Modo ULTRA RÁPIDO: Timeout de 3 segundos
   * Para testing instantáneo
   */
  ultraFastMode() {
    const handler = window.inactivityHandler
    handler.updateDuration(3 / 60) // 3 segundos
    handler.setInactivityThreshold(1) // 1 segundo
    handler.setPreWarningSeconds(1) // 1 segundo
    console.log('✅ MODO ULTRA RÁPIDO: Timeout en 3s')
  },

  /**
   * Modo NORMAL: Timeout de 30 minutos
   */
  normalMode() {
    const handler = window.inactivityHandler
    handler.updateDuration(30)
    handler.setInactivityThreshold(20)
    handler.setPreWarningSeconds(60)
    console.log('✅ MODO NORMAL: Timeout en 30 minutos')
  },

  /**
   * Forzar pre-warning inmediatamente
   */
  showPreWarning() {
    const handler = window.inactivityHandler
    handler.forcePreWarning()
    console.log('✅ Pre-warning forzada')
  },

  /**
   * Forzar modal inmediatamente
   */
  showWarning() {
    const handler = window.inactivityHandler
    handler.forceWarning()
    console.log('✅ Modal forzada')
  },

  /**
   * Ver estado actual del handler
   */
  status() {
    const handler = window.inactivityHandler
    const info = handler.getDebugInfo()
    console.log('📊 ESTADO ACTUAL:')
    console.log(`  Enabled: ${info.isEnabled}`)
    console.log(`  Initialized: ${info.isInitialized}`)
    console.log(`  Inactive: ${info.isInactive}`)
    console.log(`  Warning shown: ${info.isWarningShown}`)
    console.log(`  Time since activity: ${(info.timeSinceLastActivity / 1000).toFixed(1)}s`)
    console.log(`  Inactivity duration: ${(info.inactivityDuration / 1000).toFixed(1)}s`)
    console.log(`  Countdown: ${(info.countdownRemaining / 1000).toFixed(1)}s`)
  },

  /**
   * Continuar sesión (simular click en Continuar)
   */
  continueSession() {
    const handler = window.inactivityHandler
    handler.keepAlive()
    console.log('✅ Sesión continuada')
  },

  /**
   * Cerrar sesión forzadamente
   */
  forceLogout() {
    const handler = window.inactivityHandler
    handler.performLogout('manual-test')
    console.log('✅ Logout forzado')
  }
}

console.log('✅ Testing utils cargadas')
console.log('')
console.log('📝 COMANDOS DISPONIBLES:')
console.log('  testInactivity.fastMode()      - Timeout en 10s (para tests rápidos)')
console.log('  testInactivity.ultraFastMode() - Timeout en 3s (para tests instantáneos)')
console.log('  testInactivity.normalMode()    - Timeout en 30 minutos (default)')
console.log('  testInactivity.showPreWarning()- Forzar pre-warning')
console.log('  testInactivity.showWarning()   - Forzar modal')
console.log('  testInactivity.status()        - Ver estado actual')
console.log('  testInactivity.continueSession() - Continuar sesión')
console.log('  testInactivity.forceLogout()   - Logout forzado')
console.log('')
console.log('💡 SUGERENCIA PARA TESTEAR:')
console.log('  1. testInactivity.fastMode()')
console.log('  2. Espera 2 segundos sin tocar el ratón/teclado')
console.log('  3. Deberías ver pre-warning naranja en 5 segundos')
console.log('  4. Continúa esperando para ver modal rojo')
