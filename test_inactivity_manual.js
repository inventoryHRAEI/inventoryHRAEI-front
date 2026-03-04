#!/usr/bin/env node

/**
 * Manual Testing Script for Inactivity Handler
 * 
 * Run in browser console after app loads:
 * - Copy-paste this entire script
 * - Or just run individual test functions
 */

// Test 1: Check if handler is initialized
function testHandlerInitialization() {
  console.group('%c[TEST-1] Handler Initialization', 'color: blue; font-weight: bold')
  
  const info = inactivityHandler.getDebugInfo()
  console.table(info)
  
  if (info.isInitialized) {
    console.log('✅ Handler is initialized')
  } else {
    console.error('❌ Handler is NOT initialized')
  }
  
  if (info.isEnabled) {
    console.log('✅ Handler is enabled')
  } else {
    console.error('❌ Handler is NOT enabled')
  }
  
  console.groupEnd()
}

// Test 2: Check localStorage values
function testLocalStorage() {
  console.group('%c[TEST-2] LocalStorage Configuration', 'color: blue; font-weight: bold')
  
  const config = {
    inactivityEnabled: localStorage.getItem('inactivityEnabled'),
    inactivityTimeout: localStorage.getItem('inactivityTimeout'),
    inactivityWarningSeconds: localStorage.getItem('inactivityWarningSeconds'),
    inactivityThresholdSeconds: localStorage.getItem('inactivityThresholdSeconds'),
  }
  
  console.table(config)
  console.groupEnd()
}

// Test 3: Check window manager
function testWindowManager() {
  console.group('%c[TEST-3] Window Manager Status', 'color: blue; font-weight: bold')
  
  const status = {
    windowId: windowManager.windowId,
    isActive: windowManager.isActive,
    isActiveWindow: windowManager.isActiveWindow(),
  }
  
  console.table(status)
  
  if (windowManager.isActiveWindow()) {
    console.log('✅ This window is ACTIVE (warning modal will show)')
  } else {
    console.error('❌ This window is INACTIVE (warning modal will NOT show)')
    console.log('   Fix: Close other tabs/windows, reload, and try again')
  }
  
  console.groupEnd()
}

// Test 4: Setup event listeners to monitor
function testEventListeners() {
  console.group('%c[TEST-4] Setup Event Monitoring', 'color: blue; font-weight: bold')
  
  window.addEventListener('inactivity:warning', (e) => {
    console.log('%c[EVENT] inactivity:warning', 'color: green; font-weight: bold', e.detail)
  })
  
  window.addEventListener('inactivity:countdown', (e) => {
    console.log('%c[EVENT] inactivity:countdown - remaining:', 'color: orange', e.detail.remaining, 'ms')
  })
  
  window.addEventListener('inactivity:warning-dismissed', (e) => {
    console.log('%c[EVENT] inactivity:warning-dismissed', 'color: red; font-weight: bold')
  })
  
  console.log('✅ Event listeners attached. Leave page idle and monitor console.')
  console.groupEnd()
}

// Test 5: Check component is mounted
function testComponentMounted() {
  console.group('%c[TEST-5] InactivityWarning Component', 'color: blue; font-weight: bold')
  
  const component = document.querySelector('[data-test="inactivity-warning"]') || 
                   document.querySelector('.inactivity-warning') ||
                   'Not found in DOM'
  
  if (component) {
    console.log('✅ Component is mounted in DOM:', component)
  } else {
    console.warn('⚠️  Component not yet rendered (will be created when warning is shown)')
  }
  
  console.groupEnd()
}

// Test 6: Force warning (for immediate testing)
function forceWarningImmediate() {
  console.group('%c[TEST-6] Force Warning (3 second delay)', 'color: blue; font-weight: bold')
  
  console.log('⏳ Warning will be forced in 3 seconds...')
  console.log('   If it appears, the component works!')
  console.log('   If NOT, there may be a component issue')
  
  setTimeout(() => {
    console.log('%c[FORCE] Triggering warning...', 'color: red; font-weight: bold')
    inactivityHandler._showWarningInternal()
    inactivityHandler._startCountdownInternal()
  }, 3000)
  
  console.groupEnd()
}

function forcePreWarningImmediate() {
  console.group('%c[TEST-6b] Force Pre-Warning (immediate)', 'color: blue; font-weight: bold')
  console.log('%c[FORCE] Triggering pre-warning...', 'color: orange; font-weight: bold')
  inactivityHandler._showPreWarningInternal()
  console.groupEnd()
}

// Test 7: Set short timeout for real testing
function setShortTimeout(minutes = 0.1) {
  // 0.1 minutes = 6 seconds, plus 20s threshold = ~26 seconds total wait
  console.group('%c[TEST-7] Set Short Timeout', 'color: blue; font-weight: bold')
  
  console.log(`⏱️  Setting inactivity timeout to ${minutes} minutes...`)
  inactivityHandler.updateDuration(minutes)
  
  const info = inactivityHandler.getDebugInfo()
  console.log('Updated duration:', Math.round(info.inactivityDuration / 1000), 'seconds')
  console.log('⏳ Be completely idle and watch console. Warning should appear in ~' + (minutes * 60 + 20) + ' seconds')
  
  console.groupEnd()
}

// Run all tests at once
function runAllTests() {
  console.clear()
  console.log('%c========== INACTIVITY HANDLER TEST SUITE ==========', 'color: white; background: #333; font-size: 14px; padding: 10px')
  
  testHandlerInitialization()
  testLocalStorage()
  testWindowManager()
  testEventListeners()
  testComponentMounted()
  
  console.log('%c==================== READY FOR TESTING ====================', 'color: white; background: #333; font-size: 14px; padding: 10px')
  console.log('Next steps:')
  console.log('1. Run: testEventListeners()  // To monitor events')
  console.log('2. Run: forcePreWarningImmediate()  // Pre-warning quick test')
  console.log('3. Run: forceWarningImmediate()  // Modal countdown test (3s)')
  console.log('4. Or: setShortTimeout(0.1)  // Real test (~26s wait)')
  console.log('5. Then just be idle and watch the console for events')
}

// Export for use
window.InactivityTests = {
  testHandlerInitialization,
  testLocalStorage,
  testWindowManager,
  testEventListeners,
  testComponentMounted,
  forceWarningImmediate,
  forcePreWarningImmediate,
  setShortTimeout,
  runAllTests,
}

// Auto-run if this is loaded
if (typeof window !== 'undefined') {
  console.log('%c✅ Test utilities loaded. Run: InactivityTests.runAllTests()', 'color: green; font-weight: bold')
}
