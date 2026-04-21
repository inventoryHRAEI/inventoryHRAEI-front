import { createRouter, createWebHistory } from 'vue-router'
import { validateSession, clearStoredSessionData, isActiveWindow, getStoredToken } from './utils/auth.js'

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
const OpSalida = () => import('./views/operations/OpSalidaNew.vue')
const OpResguardo = () => import('./views/operations/OpResguardoNew.vue')
const OpServicio = () => import('./views/operations/OpServicioNew.vue')
const OpInventarioBiomedica = () => import('./views/operations/BiomedicalTestingEnvironment.vue')
const OpInsumosConsumibles = () => import('./views/operations/OpInsumosConsumibles.vue')
const OpPropuestasBusqueda = () => import('./views/operations/OpPropuestasBusqueda.vue')
const OrderManagement = () => import('./views/operations/OrderManagement.vue')
const OrderManagementSalida = () => import('./views/operations/OrderManagementSalida.vue')
const OrderManagementResguardo = () => import('./views/operations/OrderManagementResguardo.vue')
const OrderManagementServicio = () => import('./views/operations/OrderManagementServicio.vue')
const UserSettings = () => import('./views/UserSettings.vue')

const routes = [
    // RUTAS PÚBLICAS (sin requerir sesión)
    { path: '/', name: 'home', component: Home, meta: { isPublic: true } },
    { path: '/s/:code', name: 'short-scan', redirect: (to) => ({ path: '/op/inventario-biomedica', query: { scan: String(to.params.code || '') } }) },
    { path: '/login', name: 'login', component: Login, meta: { isPublic: true } },
    { path: '/register', name: 'register', component: Register, meta: { isPublic: true } },
    { path: '/forgot', name: 'forgot', component: Forgot, meta: { isPublic: true } },
    { path: '/reset', name: 'reset', component: Reset, meta: { isPublic: true } },
    { path: '/add-account', name: 'add-account', component: AddAccount, meta: { isPublic: true } },

    // RUTAS PROTEGIDAS (requieren sesión obligatoria)
    { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAuth: true } },
    { path: '/admin/users/:id', name: 'admin-user-detail', component: AdminUserDetail, meta: { requiresAuth: true } },
    { path: '/admin/account-validation', name: 'admin-account-validation', component: AccountValidation, meta: { requiresAuth: true } },
    { path: '/user-settings', name: 'user-settings', component: UserSettings, meta: { requiresAuth: true } },

    // RUTAS DE OPERACIONES (todas protegidas)
    { path: '/op/order-management', name: 'order-management', component: OrderManagement, meta: { requiresAuth: true } },
    { path: '/op/order-management-salida', name: 'order-management-salida', component: OrderManagementSalida, meta: { requiresAuth: true } },
    { path: '/op/order-management-resguardo', name: 'order-management-resguardo', component: OrderManagementResguardo, meta: { requiresAuth: true } },
    { path: '/op/order-management-servicio', name: 'order-management-servicio', component: OrderManagementServicio, meta: { requiresAuth: true } },
    // Rutas de wizards comentadas - ahora se usan como modales
    // { path: '/op/entrada', name: 'op-entrada', component: OpEntrada, meta: { requiresAuth: true } },
    // { path: '/op/entrada-new', name: 'op-entrada-new', component: OpEntradaNew, meta: { requiresAuth: true } },
    // { path: '/op/salida', name: 'op-salida', component: OpSalida, meta: { requiresAuth: true } },
    // { path: '/op/resguardo', name: 'op-resguardo', component: OpResguardo, meta: { requiresAuth: true } },
    // { path: '/op/servicio', name: 'op-servicio', component: OpServicio, meta: { requiresAuth: true } },
    
    // INVENTARIO BIOMÉDICA - AHORA PROTEGIDA (REQUIERE SESIÓN OBLIGATORIA)
    { path: '/op/inventario-biomedica', name: 'op-inventario-biomedica', component: OpInventarioBiomedica, meta: { requiresAuth: true } },
    { path: '/op/propuestas', name: 'op-propuestas', component: OpPropuestasBusqueda, meta: { requiresAuth: true } },
    
    { path: '/op/insumos-consumibles', name: 'op-insumos-consumibles', component: OpInsumosConsumibles, meta: { requiresAuth: true } }
]

// Sistema de eventos para mostrar/ocultar modal de autenticación
export const requireSession = (routeName, redirectToHome = false) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('session-modal', { 
      detail: { 
        show: true, 
        route: routeName,
        redirectToHome,
        message: 'Debes iniciar sesión para acceder a esta sección'
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

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Variable para rastrear si ya validamos sesión
let initialSessionValidated = false

// GUARD GLOBAL: Proteger rutas y mostrar modal de login
router.beforeEach(async (to, from, next) => {
    console.debug('[ROUTER] beforeEach', { from: from && from.fullPath, to: to && to.fullPath })
    
    // Purga agresiva: limpiar caché cuando se sale de ciertas rutas
    const routesToPurge = ['order-management', 'order-management-salida', 'order-management-resguardo', 'order-management-servicio']
    if (routesToPurge.includes(from.name) && to.name !== from.name) {
        try {
            localStorage.removeItem('orders_list')
            localStorage.removeItem('op_entrada_form')
            const preserveKeys = ['sessionStateBeforeLogout', 'sessionWizardState', 'sessionFloatingPanelState']
            const keysToRemove = []
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                if (key && !preserveKeys.includes(key)) keysToRemove.push(key)
            }
            keysToRemove.forEach((key) => sessionStorage.removeItem(key))
            console.debug(`[ROUTER] Purged cache when leaving ${from.name}`)
        } catch (e) {
            console.warn('Could not clear storage on navigation', e)
        }
    }

    // Verificar si la ruta requiere autenticación
    const needsAuth = to.matched.some(record => record.meta && record.meta.requiresAuth)

    if (needsAuth) {
        // La ruta requiere sesión obligatoria
        const token = getStoredToken()
        
        if (!token) {
            // NO HAY TOKEN: Mostrar modal y NO permitir acceso
            console.warn('[ROUTER] No token found for protected route:', to.path)
            
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('session-modal', { 
                        detail: { 
                            show: true, 
                            route: to.name,
                            redirectToHome: true,
                            title: 'Sesión Requerida',
                            message: 'Debes iniciar sesión para acceder a esta sección',
                            forceLogin: true,
                            allowContinue: false
                        } 
                    }))
                }, 100)
            }
            // Bloquear navegación (permanecer donde estábamos o ir a home)
            return next(false)
        }

        // Hay token, validar con backend
        try {
            const sessionValidated = localStorage.getItem('sessionValidated')
            if (sessionValidated) {
                const validatedAt = new Date(sessionValidated)
                const ageMs = Date.now() - validatedAt.getTime()
                const allowedAgeMs = 60 * 1000 // 60 segundos
                if (ageMs >= 0 && ageMs < allowedAgeMs) {
                    // Sesión recientemente validada, permitir acceso
                    return next()
                }
            }
        } catch (e) {
            // ignore
        }

        // Validar sesión con el backend
        const result = await validateSession()
        if (!result.authenticated) {
            // Sesión inválida o expirada
            console.warn('[ROUTER] Session validation failed for protected route:', to.path)
            clearStoredSessionData()
            
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('session-modal', { 
                        detail: { 
                            show: true, 
                            route: to.name,
                            redirectToHome: true,
                            title: 'Sesión Expirada',
                            message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
                            forceLogin: true,
                            allowContinue: false
                        } 
                    }))
                }, 100)
            }
            return next(false)
        }

        // Sesión válida, permitir acceso
        return next()
    }

    // Rutas públicas: permitir acceso sin verificación
    next()
})

router.afterEach((to, from) => {
    console.debug('[ROUTER] afterEach', { from: from && from.fullPath, to: to && to.fullPath })
    
    if (!initialSessionValidated) {
        initialSessionValidated = true
    }

    // Limpieza de caché cuando se cambia de rutas de operación
    try {
        const toName = to && to.name ? String(to.name) : ''
        const fromName = from && from.name ? String(from.name) : ''
        const relevant = (toName && (/^op-|^order-management$|^dashboard$/).test(toName)) || (to.path && /\/op\//.test(to.path))
        if (relevant && toName !== fromName) {
            try { localStorage.removeItem('orders_list') } catch { }
            try { localStorage.removeItem('op_entrada_form') } catch { }
            try {
                const preserveKeys = ['sessionStateBeforeLogout', 'sessionWizardState', 'sessionFloatingPanelState']
                const keysToRemove = []
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i)
                    if (key && !preserveKeys.includes(key)) keysToRemove.push(key)
                }
                keysToRemove.forEach((key) => sessionStorage.removeItem(key))
            } catch { }
            console.debug('[ROUTER] afterEach cleaned up for navigation', { from: fromName, to: toName })
        }
    } catch (e) { /* ignore */ }
})

export default router
