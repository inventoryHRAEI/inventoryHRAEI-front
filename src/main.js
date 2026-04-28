import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// PrimeVue - UI components library
import PrimeVue from 'primevue/config'
// PrimeIcons from CDN
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://unpkg.com/primeicons/primeicons.css'
document.head.appendChild(link)

// Tailwind base + Flowbite processed CSS
import './styles/tailwind.css'
// Legacy global styles
import './styles.css'
import './animations.css'
import './styles/operations-global.css'
import './styles/operations.css'

// ---------------------------------------------------------
// VM Fix: relocate notification/toast containers to body
// to prevent them being clipped by stacking contexts (e.g.
// the wizard creates a new context with z-index:5000).
// This runs once on app start and watches for future additions.
// ---------------------------------------------------------
const RELOCATED_FLAG = 'data-relocated-to-body'

function moveElementToBody(selector) {
  const el = document.querySelector(selector)
  if (el && el.parentElement !== document.body && !el.hasAttribute(RELOCATED_FLAG)) {
    try {
      document.body.appendChild(el)
      el.setAttribute(RELOCATED_FLAG, '1')
    } catch (e) {
      // defensivo: evadir errores por nodos ya removidos
    }
  }
}

function observeAndRelocate() {
  // Be conservative: observe document.body (not documentElement), batch moves,
  // mark relocated nodes to avoid reprocessing, and limit work per frame.
  const MAX_PER_BATCH = 20
  const selectors = '.notivue, .notivue-container, .Notivue__notification-list, .Toastify__toast-container, .vue-toastification, .toast-notification, [class*="notification"], [class*="toast"]'

  let pending = new Set()

  function processPending() {
    if (!pending.size) return
    const items = Array.from(pending).slice(0, MAX_PER_BATCH)
    pending = new Set(Array.from(pending).slice(MAX_PER_BATCH))
    window.requestAnimationFrame(() => {
      for (const el of items) {
        try {
          if (!(el instanceof HTMLElement)) continue
          if (el.parentElement === document.body) continue
          if (el.hasAttribute && el.hasAttribute(RELOCATED_FLAG)) continue
          document.body.appendChild(el)
          el.setAttribute(RELOCATED_FLAG, '1')
        } catch (e) {
          // ignore transient errors
        }
      }
      // if still pending, schedule next frame
      if (pending.size) setTimeout(processPending, 16)
    })
  }

  const observer = new MutationObserver((mutations) => {
    try {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue

          // skip if already in body or already flagged
          if (node.parentElement === document.body) continue
          if (node.hasAttribute && node.hasAttribute(RELOCATED_FLAG)) continue

          // direct match
          if (node.matches && node.matches(selectors)) {
            pending.add(node)
            continue
          }

          // class name heuristics
          if (node.className && (/toast/i.test(node.className) || /notification/i.test(node.className))) {
            pending.add(node)
            continue
          }

          // search limited descendants (try/catch in case node is detached)
          if (node.querySelector) {
            const inside = node.querySelector(selectors)
            if (inside && !inside.hasAttribute(RELOCATED_FLAG)) pending.add(inside)
          }
        }
      }
      if (pending.size) processPending()
    } catch (e) {
      // Avoid letting observer exceptions crash the page
      console.warn('[relocate] observer callback error', e)
    }
  })

  try {
    observer.observe(document.body, { childList: true, subtree: true })
  } catch (e) {
    // fallback to documentElement if body is not ready
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }
}

// delay until DOM ready
window.addEventListener('DOMContentLoaded', () => {
  // Notyf handles positioning automatically - no manual relocation needed
  // moveElementToBody removed
  // observeAndRelocate() // disabled for Notyf
})
import './styles/enhancements.css'
import './styles/forms.css'
import './styles/datetime-inputs.css'
// Tunnel performance optimizations (CSS for disabling animations over slow networks)
import './styles/tunnel-performance.css'
// Disabled vendor flowbite-datepicker.css import: causes PostCSS / @layer parsing errors if Tailwind is not configured
// If you want the full Flowbite datepicker styling, follow the Tailwind integration steps (recommended) below and re-enable this import.
// Import a minimal standalone CSS for datepickers (safe without Tailwind)
// The flowbite-datepicker CSS is included via Tailwind's pipeline: styles/tailwind.css. Avoid importing vendor files directly.
// import '@/assets/vendor/flowbite-datepicker-standalone.css'
// 🚀 SASS Simple para calendario
import './styles/calendar-simple.scss'
// Inicializar windowManager antes de crear la app
import './utils/windowManager'
// ─── Global fetch interceptor: inject JWT Authorization header ────────────
// Every fetch() to /api/* will automatically include the stored token.
// This avoids touching dozens of individual fetch() calls across views.
if (typeof window !== 'undefined') {
  const _originalFetch = window.fetch
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input))
    // Only inject on own API calls (relative or same-origin)
    if (url.startsWith('/api/')) {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          init = init || {}
          // Preserve existing headers while adding Authorization
          const existing = init.headers instanceof Headers
            ? Object.fromEntries(init.headers.entries())
            : (init.headers || {})
          if (!existing['Authorization'] && !existing['authorization']) {
            init.headers = { ...existing, 'Authorization': `Bearer ${token}` }
          }
        }
      } catch (_) { /* localStorage may throw in certain contexts */ }
    }
    return _originalFetch.call(this, input, init)
  }
  console.log('[main] Global fetch interceptor installed – API calls will include JWT automatically')
}

// Detect if running through tunnel and apply performance optimizations
if (typeof window !== 'undefined') {
  const isTunnel = /\.trycloudflare\.com|\.ngrok-free\.dev|\.loca\.lt/.test(window.location.hostname)
  if (isTunnel) {
    document.documentElement.classList.add('tunnel-mode')
    console.log('[perf] Tunnel detected - applying performance optimizations')
  }
}
// Si este window fue abierto por script (query param scriptOpen=1), marcarlo en sessionStorage
if (typeof window !== 'undefined') {
        try {
                const url = new URL(window.location.href)
                const isScriptOpen = url.searchParams.get('scriptOpen')
                if (isScriptOpen === '1') {
                        sessionStorage.setItem('openedByScript', '1')
                        const openerId = url.searchParams.get('openerId')
                        if (openerId) sessionStorage.setItem('openerId', openerId)
                }
        } catch (e) {
                // no crítico
        }
}
// Notyf (toasts premium)
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

// AG Grid — register community modules globally to ensure filters/modules are available
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

// 🧪 Test utilities para timing (solo en desarrollo)
if (import.meta.env.DEV) {
  import('@/scripts/test-timing.js').catch(e => console.warn('[test-timing] Could not load:', e))
}const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Configuración de Notyf: posición bottom-left, duración larga, estilos premium
const notyf = new Notyf({
  duration: 4200,
  position: {
    x: 'left',
    y: 'bottom'
  },
  types: [
    {
      type: 'success',
      background: 'linear-gradient(135deg, #4ade80, #22c55e)',
      icon: {
        className: 'notyf__icon--success',
        tagName: 'i'
      }
    },
    {
      type: 'error', 
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: {
        className: 'notyf__icon--error',
        tagName: 'i'
      }
    },
    {
      type: 'info',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      icon: {
        className: 'notyf__icon--info',
        tagName: 'i'
      }
    },
    {
      type: 'warning',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
      icon: {
        className: 'notyf__icon--warning',
        tagName: 'i'
      }
    }
  ],
  dismissible: true,
  ripple: true
})

// Hacer Notyf globalmente accesible para el notifier
window.__notyf = notyf

app.use(router)
// notivue removed - using Notyf instead
app.use(PrimeVue)

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { vPermission } from './utils/permissionDirective.js'
import vSanitize from './directives/sanitize.js'

const queryClient = new QueryClient();

app.use(VueQueryPlugin, { queryClient });

// Registrar directiva de permisos
app.directive('permission', vPermission);
app.directive('sanitize', vSanitize);

// Ajuste dinámico de variables CSS relacionadas con la topbar.
function updateTopbarCSSVars(){
        try{
                const topbar = document.querySelector('.topbar')
                const root = document.documentElement
                if (!topbar || !root) return
                const rect = topbar.getBoundingClientRect()
                // topbar puede ser fixed y presentar altura variable en móviles
                root.style.setProperty('--topbar-top', Math.max(8, Math.round(rect.top)) + 'px')
                root.style.setProperty('--topbar-height', Math.max(44, Math.round(rect.height)) + 'px')
                // recompute container padding to avoid overlap
                const newPad = `calc(var(--topbar-top) + var(--topbar-height) + 12px)`
                root.style.setProperty('--container-toppad', newPad)
        }catch(e){ /* no crítico */ }
}

function initTopbarObservers(){
        if (typeof window === 'undefined') return
        window.requestAnimationFrame(updateTopbarCSSVars)
        window.addEventListener('resize', () => { window.requestAnimationFrame(updateTopbarCSSVars) })
        window.addEventListener('orientationchange', () => { window.requestAnimationFrame(updateTopbarCSSVars) })
        // también recalcula cuando el DOM cambie levemente (ej: menús abren/cierran)
        const obs = new MutationObserver(() => { window.requestAnimationFrame(updateTopbarCSSVars) })
        obs.observe(document.body, { attributes: true, childList: true, subtree: true })
}

// Initialize navigation validator BEFORE mounting app
import { initNavigationValidator } from './utils/navigationValidator'

router.isReady().then(() => {
	app.mount('#app')
	initTopbarObservers()
	
	// Initialize navigation validator to detect render issues
	initNavigationValidator()
	console.log('[Main] ✅ App mounted and navigation validator initialized')
})
