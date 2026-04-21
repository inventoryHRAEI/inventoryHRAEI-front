// Minimal tunnel-scoped listener/cleanup helper
export function createTunnel() {
  const cleanup = []

  function addEvent(target, type, handler, options) {
    if (!target || !type || !handler) return
    target.addEventListener(type, handler, options)
    cleanup.push(() => target.removeEventListener(type, handler, options))
  }

  function addCleanup(fn) {
    if (typeof fn === 'function') cleanup.push(fn)
  }

  function scheduleIdle(fn) {
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(fn)
      cleanup.push(() => cancelIdleCallback(id))
    } else {
      const id = setTimeout(fn, 800)
      cleanup.push(() => clearTimeout(id))
    }
  }

  function destroy() {
    for (const fn of cleanup.splice(0)) {
      try { fn() } catch (e) { /* noop */ }
    }
  }

  return {
    addEvent,
    addCleanup,
    scheduleIdle,
    destroy
  }
}
