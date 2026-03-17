import { createRouter, createWebHistory } from 'vue-router'
import { validateSession, clearStoredSessionData, isActiveWindow, getStoredToken } from './utils/auth.js'
import { isAdmin, isPrivileged, getUserRole } from './composables/usePermissions.js'

const Home = () => import('./views/Home.vue')
const Login = () => import('./views/Login.vue')
const Register = () => import('./views/Register.vue')
const Forgot = () => import('./views/Forgot.vue')
const Reset = () => import('./views/Reset.vue')
const Dashboard = () => import('./views/Dashboard.vue')
const AdminUsers = () => import('./views/AdminUsers.vue')
const AdminUserDetail = () => import('./views/AdminUserDetail.vue')
const AccountValidation = () => import('./views/AccountValidation.vue')
const AddAccount = () => import('./views/Login.vue')
// Operaciones
const OpEntrada = () => import('./views/operations/OpEntradaNew.vue')
const OpEntradaNew = () => import('./views/operations/OpEntradaNew.vue')
// const OpEntradaLegacy = () => import('./views/operations/OpEntrada.vue') // Archivo no existe
const OpSalida = () => import('./views/operations/OpSalidaNew.vue')
const OpResguardo = () => import('./views/operations/OpResguardoNew.vue')
const OpServicio = () => import('./views/operations/OpServicioNew.vue')
const OpInventarioBiomedica = () => import('./views/operations/BiomedicalTestingEnvironment.vue')
const OpInsumosConsumibles = () => import('./views/operations/OpInsumosConsumibles.vue')
const ImportExport = () => import('./views/ImportExport.vue')
const OrderManagement = () => import('./views/operations/OrderManagement.vue')
const OrderManagementSalida = () => import('./views/operations/OrderManagementSalida.vue')
const OrderManagementResguardo = () => import('./views/operations/OrderManagementResguardo.vue')
const OrderManagementServicio = () => import('./views/operations/OrderManagementServicio.vue')
const UserSettings = () => import('./views/UserSettings.vue')

// Rutas públicas que pueden accederse sin sesión (pero mostrarán modal si no hay sesión)
const publicRoutesWithoutSession = ['op-inventario-biomedica', 'home']

const routes = [
    { path: '/', name: 'home', component: Home, meta: { requiresSessionModal: true, allowGuest: true } },
    // Short scan URL: redirects to the biomedical view with scan param
    { path: '/s/:code', name: 'short-scan', redirect: (to) => ({ path: '/op/inventario-biomedica', query: { scan: String(to.params.code || '') } }) },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/forgot', name: 'forgot', component: Forgot },
    { path: '/reset', name: 'reset', component: Reset },
    { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    // Rutas de administración - solo admin
    { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAuth: true, requiredRole: 'admin' } },
    { path: '/admin/users/:id', name: 'admin-user-detail', component: AdminUserDetail, meta: { requiresAuth: true, requiredRole: 'admin' } },
    { path: '/admin/account-validation', name: 'admin-account-validation', component: AccountValidation, meta: { requiresAuth: true, requiredRole: 'admin' } },
    { path: '/user-settings', name: 'user-settings', component: UserSettings, meta: { requiresAuth: true } },
    { path: '/add-account', name: 'add-account', component: AddAccount, meta: { addAccount: true } },

    // Rutas de operaciones (accesibles desde los dashboards)
    // Ya no se usan - los wizards se abren como modales desde los componentes OrderManagement
    // { path: '/op/entrada', name: 'op-entrada', component: OpEntrada, meta: { requiresAuth: true } },
    // { path: '/op/entrada-new', name: 'op-entrada-new', component: OpEntradaNew, meta: { requiresAuth: true } },
    // { path: '/op/salida', name: 'op-salida', component: OpSalida, meta: { requiresAuth: true } },
    // { path: '/op/resguardo', name: 'op-resguardo', component: OpResguardo, meta: { requiresAuth: true } },
    // { path: '/op/servicio', name: 'op-servicio', component: OpServicio, meta: { requiresAuth: true } },
    
    { path: '/op/order-management', name: 'order-management', component: OrderManagement, meta: { requiresAuth: true } },
    { path: '/op/order-management-salida', name: 'order-management-salida', component: OrderManagementSalida, meta: { requiresAuth: true } },
    { path: '/op/order-management-resguardo', name: 'order-management-resguardo', component: OrderManagementResguardo, meta: { requiresAuth: true } },
    { path: '/op/order-management-servicio', name: 'order-management-servicio', component: OrderManagementServicio, meta: { requiresAuth: true } },
    // Inventario Biomédica - Ruta PROTEGIDA (requiere sesión obligatoria)
    { path: '/op/inventario-biomedica', name: 'op-inventario-biomedica', component: OpInventarioBiomedica, meta: { requiresAuth: true } },
    { path: '/op/insumos-consumibles', name: 'op-insumos-consumibles', component: OpInsumosConsumibles, meta: { requiresAuth: true } },
    { path: '/import', name: 'import', component: ImportExport, meta: { requiresAuth: true, requiredRole: 'admin' } }
]

// Evento global para mostrar/ocultar el modal de sesión requerida
export const sessionModalEvent = new CustomEvent('session-modal', { detail: { show: false, route: null } })
export const requireSession = (routeName, redirectToHome = false) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('session-modal', { 
      detail: { 
        show: true, 
        route: routeName,
        redirectToHome 
      } 
    }))
  }
}
export const hideSessionModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('session-modal', { 
      detail: { 
        show: false, 
        route: null,
        redirectToHome: false
      } 
    }))
  }
}
export const checkAndShowSessionModal = async (routeName) => {
  const token = getStoredToken()
  if (!token) {
    // No hay sesión, mostrar modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session-modal', { 
        detail: { 
          show: true, 
          route: routeName,
          redirectToHome: false  // Allow user to continue without session
        } 
      }))
    }
    return false
  }
  // Hay token pero validar con el backend
  const result = await validateSession()
  if (!result.authenticated) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session-modal', { 
        detail: { 
          show: true, 
          route: routeName,
          redirectToHome: true  // Redirigir al home si la sesión es inválida
        } 
      }))
    }
    return false
  }
  return true
}

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Variable para guardar el estado inicial de sesión (para evitar validaciones repetidas)
let initialSessionValidated = false

// Guard global de rutas: valida sesión con el backend
router.beforeEach(async (to, from, next) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[ROUTER] 🔵 beforeEach [${timestamp}]`, { 
        from: from?.fullPath || 'INITIAL', 
        to: to?.fullPath 
    })
    
    // Dispatch navigation start event
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('router:navigation-start', {
            detail: { 
                from: from?.name, 
                to: to?.name, 
                toPath: to?.fullPath,
                fromPath: from?.fullPath,
                timestamp
            }
        }))
    }
    
    // Purga selectiva: limpiar caché cuando se sale de ciertas rutas operacionales
    const routesToPurge = ['order-management', 'order-management-salida', 'order-management-resguardo', 'order-management-servicio']
    
    // Solo purgar si la ruta destino es diferente y está en la lista de purga
    if (routesToPurge.includes(from?.name) && to.name !== from?.name) {
        try {
            // Limpiar selectivamente, NO todo el sessionStorage
            localStorage.removeItem('orders_list')
            localStorage.removeItem('op_entrada_form')
            // sessionStorage.clear() // Commented: causaba problema de nav instantánea
            console.debug(`[ROUTER] Selective cache purge when leaving ${from.name}`)
        } catch (e) {
            console.warn('Could not clear storage on navigation', e)
        }
    }

    const needsAuth = to.matched.some(record => record.meta && record.meta.requiresAuth)

    if (needsAuth) {
        // Verificar que la ventana sea la activa (pero no redirigir a /login porque causaría loop)
        // if (!isActiveWindow()) {
        //   return next({ path: '/login', replace: true })
        // }

        // Optimización: si ya validamos la sesión recientemente en esta pestaña, evitar hacer otra llamada
        // al backend para validar (evita redirecciones al login inmediatamente después de crear/guardar una orden).
        try {
            const sessionValidated = localStorage.getItem('sessionValidated')
            if (sessionValidated) {
                const validatedAt = new Date(sessionValidated)
                const ageMs = Date.now() - validatedAt.getTime()
                const allowedAgeMs = 60 * 1000 // 60 segundos
                if (ageMs >= 0 && ageMs < allowedAgeMs) {
                    return next()
                }
            }
        } catch (e) {
            // ignore and fallthrough to full validation
        }

        const result = await validateSession()
        if (!result.authenticated) {
            clearStoredSessionData()
            // Si vinieras de una página protegida en recarga (from.path !== '/'), redirige sin permitir volver atrás
            if (from.name && from.meta?.requiresAuth) {
                return next({ path: '/login', replace: true })
            }
            return next({ path: '/login', replace: true })
        }
        
        // === VERIFICACIÓN DE ROLES ===
        // Verificar si la ruta requiere un rol específico
        const requiredRole = to.matched.find(record => record.meta && record.meta.requiredRole)?.meta.requiredRole
        
        if (requiredRole) {
            const userRole = getUserRole()
            
            // Verificar si el usuario tiene el rol requerido
            let hasAccess = false
            if (requiredRole === 'admin') {
                hasAccess = isAdmin()
            } else if (requiredRole === 'privileged') {
                hasAccess = isPrivileged()
            }
            
            if (!hasAccess) {
                console.warn(`[ROUTER] Acceso denegado. Ruta "${to.name}" requiere rol "${requiredRole}", pero el usuario tiene rol "${userRole}"`)
                // Redirigir al dashboard o home con mensaje de error
                return next({ path: '/', query: { error: 'unauthorized' }, replace: true })
            }
        }
        
        return next()
    }

    // Rutas que muestran modal de sesión si no hay autenticación
    const needsSessionModal = to.matched.some(record => record.meta && record.meta.requiresSessionModal)
    if (needsSessionModal) {
        // Verificar si hay sesión válida
        const token = getStoredToken()
        if (!token) {
            // No hay token, configurar el evento para mostrar modal
            if (typeof window !== 'undefined') {
                // Pequeño delay para asegurar que el componente está montado
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('session-modal', { 
                        detail: { 
                            show: true, 
                            route: to.name,
                            redirectToHome: false,
                            allowContinue: true
                        } 
                    }))
                }, 100)
            }
            return next()
        }
        
        // Hay token, validar con backend
        try {
            const sessionValidated = localStorage.getItem('sessionValidated')
            if (sessionValidated) {
                const validatedAt = new Date(sessionValidated)
                const ageMs = Date.now() - validatedAt.getTime()
                const allowedAgeMs = 60 * 1000
                if (ageMs >= 0 && ageMs < allowedAgeMs) {
                    return next()
                }
            }
        } catch (e) {
            // ignore
        }
        
        const result = await validateSession()
        if (!result.authenticated) {
            // Sesión inválida, mostrar modal pero con opción de ir al home
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('session-modal', { 
                        detail: { 
                            show: true, 
                            route: to.name,
                            redirectToHome: true,
                            allowContinue: false
                        } 
                    }))
                }, 100)
            }
            return next()
        }
        return next()
    }

    // Permitir acceso a rutas públicas sin redirección
    next()
})

// Variable para rastrear la ruta anterior
let lastRoute = null

// Al montar el router, validar sesión inicial en caso de recarga
router.afterEach((to, from) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[ROUTER] 🟢 afterEach [${timestamp}]`, { 
        from: from?.fullPath || 'INITIAL', 
        to: to?.fullPath 
    })
    
    // Marcar que hemos validado al menos una vez
    if (!initialSessionValidated) {
        initialSessionValidated = true
    }

    // Guardar la ruta actual para saber dónde venimos
    lastRoute = to.name

    // Dispatch navigation complete event
    if (typeof window !== 'undefined') {
        // CRITICAL: Dispatch signal that Vue component SHOULD be recreated
        window.dispatchEvent(new CustomEvent('router:navigation-complete', {
            detail: { 
                from: from?.name, 
                fromPath: from?.fullPath,
                to: to?.name, 
                toPath: to?.fullPath,
                timestamp
            }
        }))
        
        // Also dispatch a generic route-changed event for listeners
        window.dispatchEvent(new CustomEvent('route-changed', {
            detail: {
                fromPath: from?.fullPath,
                toPath: to?.fullPath,
                toName: to?.name,
                timestamp
            }
        }))
    }

    // Si navegamos hacia dashboard u otras rutas de operaciones, hacer cleanup selectivo
    try {
        const toName = to && to.name ? String(to.name) : ''
        const fromName = from && from.name ? String(from.name) : ''
        const relevant = (toName && (/^op-|^order-management$|^dashboard$/).test(toName)) || (to.path && /\/op\//.test(to.path))
        
        if (relevant && toName !== fromName) {
            // Cleanup selectivo solamente
            try { localStorage.removeItem('orders_list') } catch { }
            try { localStorage.removeItem('op_entrada_form') } catch { }
            // Don't clear entire sessionStorage - it can break navigation
            
            console.debug('[ROUTER] afterEach selective cleanup for navigation', { from: fromName, to: toName })
        }
    } catch (e) { /* ignore */ }
})

export default router
