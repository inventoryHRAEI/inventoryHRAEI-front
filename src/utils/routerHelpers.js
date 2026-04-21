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
      // DO NOT clear sessionStorage completely - it contains session restore keys!
      // Only remove specific operational caches
      const keysToPreserve = ['sessionStateBeforeLogout', 'sessionWizardState', 'sessionFloatingPanelState']
      const keysToRemove = []
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && !keysToPreserve.includes(key)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key))
      } catch {}
      console.debug('[routerHelpers] purged local caches (preserving session restore keys)')
    }
  } catch (e) { /* ignore */ }
  // Esperar a que el componente destino emita un 'route:mounted' o hacer fallback (recarga completa)
  try {
    const resolved = router.resolve(target)
    const expectedName = resolved && resolved.name ? String(resolved.name) : ''
    const expectedPath = resolved && resolved.fullPath ? String(resolved.fullPath) : ''
    const norm = (p) => String(p || '').split('?')[0].replace(/\/$/, '')

    // Immediate check: if current route already matches expected, resolve immediately to avoid race
    try {
      const cur = router && router.currentRoute && router.currentRoute.value ? router.currentRoute.value : null
      const curName = cur && cur.name ? String(cur.name) : ''
      const curPath = cur && cur.fullPath ? String(cur.fullPath) : ''
      if ((expectedName && curName && expectedName === curName) || (expectedPath && curPath && (expectedPath === curPath || norm(expectedPath) === norm(curPath)))) {
        console.debug('[routerHelpers] current route matches expected immediately', { curName, curPath, expectedName, expectedPath })
        return
      }
    } catch (err) { /* ignore */ }

    await new Promise((resolve) => {
      let done = false
      const onMountedEvt = (e) => {
        try {
          const detail = e && e.detail ? e.detail : {}
          const name = detail.name ? String(detail.name) : ''
          const path = detail.path ? String(detail.path) : ''
          const norm = (p) => String(p || '').split('?')[0].replace(/\/$/, '')
          console.debug('[routerHelpers] route:mounted received', { name, path, expectedName, expectedPath })
          const nameMatch = expectedName && name && expectedName === name
          const pathMatch = expectedPath && path && (expectedPath === path || norm(expectedPath) === norm(path))
          if (nameMatch || pathMatch) {
            done = true
            cleanup()
            resolve(true)
          } else {
            console.debug('[routerHelpers] route:mounted ignored (no match)', { name, path, expectedName, expectedPath })
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
        let childCount = 0
        try {
          const main = document.querySelector('main.container')
          childCount = main && main.children ? main.children.length : 0
        } catch (e) { /* ignore */ }

        if (childCount === 0) {
          console.warn('[routerHelpers] route:mounted timeout with empty DOM — forcing remount to', expectedPath || target)
          try {
            // Avoid hard reload which causes WS/HMR/tunnel re-negotiation; instead attempt a programmatic replace and emit event
            try { if (expectedPath) { router.replace(expectedPath).catch(()=>{}) } else { router.replace(typeof target === 'string' ? target : router.currentRoute.value.fullPath).catch(()=>{}) } } catch (e) { /* ignore */ }
            try { window.dispatchEvent(new CustomEvent('app:force-recreate')) } catch (e) { /* ignore */ }
          } catch (e) { console.error('[routerHelpers] force remount failed', e) }
        }
        resolve(false)
      }, 1500)
    })
  } catch (e) { /* ignore */ }
}

export default navigateAndRefresh
