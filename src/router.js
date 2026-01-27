import { createRouter, createWebHistory } from 'vue-router'
import { validateSession, clearStoredSessionData, isActiveWindow } from './utils/auth.js'

const Home = () => import('./views/Home.vue')
const Login = () => import('./views/Login.vue')
const Register = () => import('./views/Register.vue')
const Forgot = () => import('./views/Forgot.vue')
const Reset = () => import('./views/Reset.vue')
const Dashboard = () => import('./views/Dashboard.vue')
const AdminUsers = () => import('./views/AdminUsers.vue')
const AdminUserDetail = () => import('./views/AdminUserDetail.vue')
const AddAccount = () => import('./views/Login.vue')
// Operaciones
const OpEntrada = () => import('./views/operations/OpEntrada.vue')
const OpSalida = () => import('./views/operations/OpSalida.vue')
const OpResguardo = () => import('./views/operations/OpResguardo.vue')
const OpServicio = () => import('./views/operations/OpServicio.vue')
const OpInventarioBiomedica = () => import('./views/operations/BiomedicalTestingEnvironment.vue')
const OpInsumosConsumibles = () => import('./views/operations/OpInsumosConsumibles.vue')
const OrderManagement = () => import('./views/operations/OrderManagement.vue')

const routes = [
    { path: '/', name: 'home', component: Home },
    // Short scan URL: redirects to the biomedical view with scan param
    { path: '/s/:code', name: 'short-scan', redirect: (to) => ({ path: '/op/inventario-biomedica', query: { scan: String(to.params.code || '') } }) },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/forgot', name: 'forgot', component: Forgot },
    { path: '/reset', name: 'reset', component: Reset },
    { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAuth: true } },
    { path: '/admin/users/:id', name: 'admin-user-detail', component: AdminUserDetail, meta: { requiresAuth: true } },
    { path: '/add-account', name: 'add-account', component: AddAccount, meta: { addAccount: true } },

    // Rutas de operaciones (accesibles desde los dashboards)
    { path: '/op/order-management', name: 'order-management', component: OrderManagement, meta: { requiresAuth: true } },
    { path: '/op/entrada', name: 'op-entrada', component: OpEntrada, meta: { requiresAuth: true } },
    { path: '/op/salida', name: 'op-salida', component: OpSalida, meta: { requiresAuth: true } },
    { path: '/op/resguardo', name: 'op-resguardo', component: OpResguardo, meta: { requiresAuth: true } },
    { path: '/op/servicio', name: 'op-servicio', component: OpServicio, meta: { requiresAuth: true } },
    { path: '/op/inventario-biomedica', name: 'op-inventario-biomedica', component: OpInventarioBiomedica }, // Inventario Biomédica (Acceso Público)
    { path: '/op/insumos-consumibles', name: 'op-insumos-consumibles', component: OpInsumosConsumibles, meta: { requiresAuth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Variable para guardar el estado inicial de sesión (para evitar validaciones repetidas)
let initialSessionValidated = false

// Guard global de rutas: valida sesión con el backend
router.beforeEach(async (to, from, next) => {
    console.debug('[ROUTER] beforeEach', { from: from && from.fullPath, to: to && to.fullPath })
    // Purga agresiva: limpiar caché cuando se sale de ciertas rutas
    const routesToPurge = ['order-management', 'op-entrada', 'op-salida', 'op-resguardo', 'op-servicio']
    if (routesToPurge.includes(from.name) && to.name !== from.name) {
        try {
            localStorage.removeItem('orders_list')
            localStorage.removeItem('op_entrada_form')
            sessionStorage.clear()
            console.debug(`[ROUTER] Purged cache when leaving ${from.name}`)
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
        return next()
    }

    // Permitir acceso a rutas públicas sin redirección
    next()
})

// Variable para rastrear la ruta anterior
let lastRoute = null

// Al montar el router, validar sesión inicial en caso de recarga
router.afterEach((to, from) => {
    console.debug('[ROUTER] afterEach', { from: from && from.fullPath, to: to && to.fullPath })
    // Marcar que hemos validado al menos una vez
    if (!initialSessionValidated) {
        initialSessionValidated = true
    }

    // Guardar la ruta actual para saber dónde venimos
    lastRoute = to.name

    // Si navegamos hacia dashboard u otras rutas de operaciones, forzar recreación y purga de caches
    try {
        const toName = to && to.name ? String(to.name) : ''
        const fromName = from && from.name ? String(from.name) : ''
        const relevant = (toName && (/^op-|^order-management$|^dashboard$/).test(toName)) || (to.path && /\/op\//.test(to.path))
        if (relevant && toName !== fromName) {
            try { localStorage.removeItem('orders_list') } catch { }
            try { localStorage.removeItem('op_entrada_form') } catch { }
            try { sessionStorage.clear() } catch { }

            // Disabled automatic force-recreate scheduling: it produced interleaved remounts
            // that interrupted destination component's mounting. Keep cache purge only and
            // let components decide how to recover if they need to (safer and deterministic).
            console.debug('[ROUTER] afterEach cleaned up for navigation', { from: fromName, to: toName })
        }
    } catch (e) { /* ignore */ }
})

export default router
