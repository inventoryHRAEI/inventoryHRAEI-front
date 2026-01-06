// Helper para navegar y forzar recreación del componente raíz si es necesario
export async function navigateAndRefresh(router, target) {
  try {
    console.debug('[routerHelpers] navigateAndRefresh -> pushing to', target)
    // Esperar la navegación y atrapar rechazos para evitar errores no manejados
    await router.push(target)
  } catch (e) {
    // Ignorar errores de navegación (p. ej. navegaciones a la misma ruta)
    console.debug('[routerHelpers] navigateAndRefresh push error (ignored):', e && e.message ? e.message : e)
  }

  // Purga selectiva de caches relevantes para operaciones/dashboard
  try {
    const name = (typeof target === 'object' && target && target.name) ? String(target.name || '') : (typeof target === 'string' ? target : '')
    const path = (typeof target === 'object' && target && target.path) ? String(target.path || '') : (typeof target === 'string' ? target : '')
    if (/op-|order-management|dashboard/.test(name) || /\/op\//.test(path) || path.includes('order-management')) {
      try { localStorage.removeItem('orders_list') } catch {}
      try { localStorage.removeItem('op_entrada_form') } catch {}
      try { sessionStorage.clear() } catch {}
      console.debug('[routerHelpers] purged local caches for op/dashboard navigation')
    }
  } catch (e) { /* ignore */ }

  // Pequeño retardo para dejar que el router complete transiciones
  setTimeout(() => {
    try {
      // Emitir evento global que `App.vue` escucha para forzar recreación del componente
      console.debug('[routerHelpers] dispatching app:force-recreate')
      window.dispatchEvent(new CustomEvent('app:force-recreate'))
    } catch (e) { /* ignore */ }
  }, 40)

  // Esperar a que el componente destino emita un 'route:mounted' o hacer fallback (recarga completa)
  try {
    const resolved = router.resolve(target)
    const expectedName = resolved && resolved.name ? String(resolved.name) : ''
    const expectedPath = resolved && resolved.fullPath ? String(resolved.fullPath) : ''

    await new Promise((resolve) => {
      let done = false
      const onMountedEvt = (e) => {
        try {
          const detail = e && e.detail ? e.detail : {}
          const name = detail.name ? String(detail.name) : ''
          const path = detail.path ? String(detail.path) : ''
          console.debug('[routerHelpers] route:mounted received', { name, path, expectedName, expectedPath })
          if ((expectedName && name && expectedName === name) || (expectedPath && path && expectedPath === path)) {
            done = true
            cleanup()
            resolve(true)
          }
        } catch (err) { /* ignore */ }
      }

      const cleanup = () => {
        try { window.removeEventListener('route:mounted', onMountedEvt) } catch {}
        try { clearTimeout(timer) } catch {}
      }

      window.addEventListener('route:mounted', onMountedEvt)

      const timer = setTimeout(() => {
        if (done) return
        cleanup()
        console.warn('[routerHelpers] route:mounted not received within timeout — performing hard reload to', expectedPath || target)
        try {
          // Construct absolute URL for fallback
          const dest = (expectedPath) ? (window.location.origin.replace(/\/$/, '') + expectedPath) : (typeof target === 'string' ? target : window.location.href)
          window.location.href = dest
        } catch (e) { console.error('[routerHelpers] hard reload failed', e) }
        resolve(false)
      }, 800)
    })
  } catch (e) { /* ignore */ }
}

export default navigateAndRefresh
