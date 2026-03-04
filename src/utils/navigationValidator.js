/**
 * NAVEGACION VALIDATOR - Monitorea que los componentes SIEMPRE se rendericen
 * Lanza warnings si detecta que un componente NO se renderizó
 */

let navigationInProgress = false
let lastValidatedRoute = null
let componentRenderTimeout = null

export function initNavigationValidator() {
  if (typeof window === 'undefined') return
  
  // Listen for router events
  window.addEventListener('router:navigation-start', (e) => {
    navigationInProgress = true
    const { fromPath, toPath } = e.detail
    
    console.log(`[NavValidator] 🚀 Navigation started: ${fromPath} → ${toPath}`)
    
    // Set timeout to check if component rendered
    clearTimeout(componentRenderTimeout)
    componentRenderTimeout = setTimeout(() => {
      validateComponentRendered(toPath)
    }, 500) // Check after 500ms
  })
  
  // Listen for route changed events
  window.addEventListener('route-changed', (e) => {
    const { toPath, toName } = e.detail
    
    console.log(`[NavValidator] ✅ Navigation complete: ${toPath} (${toName})`)
    
    // Validate component is in DOM
    validateComponentRendered(toPath)
  })
}

export function validateComponentRendered(routePath) {
  const main = document.querySelector('main.container')
  
  if (!main) {
    console.error('[NavValidator] ❌ CRITICAL: main.container NOT FOUND')
    return false
  }
  
  const children = main.children
  
  if (!children || children.length === 0) {
    console.error(`[NavValidator] ❌ CRITICAL: Route ${routePath} has NO rendered children`)
    console.error('[NavValidator] ❌ Component was NOT recreated!')
    console.error('[NavValidator] ❌ Possible causes:')
    console.error('  1. Router key not changing')
    console.error('  2. Component caching issue')
    console.error('  3. Router guard preventing navigation')
    
    // Show visual indicator
    showRenderError(routePath)
    return false
  }
  
  const routeComponent = main.querySelector('.route-component')
  if (!routeComponent) {
    console.warn('[NavValidator] ⚠️ route-component class not found, but children exist')
  }
  
  // Check if component has content
  let hasContent = false
  for (let child of children) {
    if (child.innerHTML && child.innerHTML.length > 10) {
      hasContent = true
      break
    }
  }
  
  if (!hasContent) {
    console.error(`[NavValidator] ❌ Route ${routePath}: Component has NO CONTENT`)
    showRenderError(routePath)
    return false
  }
  
  console.log(`[NavValidator] ✅ Route ${routePath}: Component rendered correctly`)
  lastValidatedRoute = routePath
  navigationInProgress = false
  
  return true
}

export function showRenderError(routePath) {
  // Create visual error indicator
  let errorBox = document.getElementById('nav-render-error')
  if (!errorBox) {
    errorBox = document.createElement('div')
    errorBox.id = 'nav-render-error'
    document.body.appendChild(errorBox)
  }
  
  errorBox.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    max-width: 400px;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `
  
  errorBox.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px;">❌ RENDER ERROR</div>
    <div style="margin-bottom: 10px;">Route: ${routePath}</div>
    <div style="margin-bottom: 10px;">Component failed to render</div>
    <div style="margin-bottom: 10px; font-size: 12px; opacity: 0.8;">
      Check console for details
    </div>
    <button onclick="location.reload()" style="
      background: white;
      color: #ff4444;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Reload Page</button>
  `
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (errorBox && errorBox.parentNode) {
      errorBox.style.opacity = '0'
      errorBox.style.transition = 'opacity 0.3s'
      setTimeout(() => {
        if (errorBox && errorBox.parentNode) {
          errorBox.parentNode.removeChild(errorBox)
        }
      }, 300)
    }
  }, 5000)
}

export function getNavigationStatus() {
  return {
    navigationInProgress,
    lastValidatedRoute,
    canNavigate: !navigationInProgress
  }
}

export function resetNavigationState() {
  navigationInProgress = false
  clearTimeout(componentRenderTimeout)
  console.log('[NavValidator] Navigation state reset')
}
