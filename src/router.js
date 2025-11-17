import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from '@/utils/auth'

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
const OpInventarioBiomedica = () => import('./views/operations/OpInventarioBiomedica.vue')
const OpInsumosConsumibles = () => import('./views/operations/OpInsumosConsumibles.vue')

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/forgot', name: 'forgot', component: Forgot },
  { path: '/reset', name: 'reset', component: Reset },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAuth: true } },
  { path: '/admin/users/:id', name: 'admin-user-detail', component: AdminUserDetail, meta: { requiresAuth: true } },
  { path: '/add-account', name: 'add-account', component: AddAccount, meta: { addAccount: true } },

  // Rutas de operaciones (accesibles desde los dashboards)
  { path: '/op/entrada', name: 'op-entrada', component: OpEntrada, meta: { requiresAuth: true } },
  { path: '/op/salida', name: 'op-salida', component: OpSalida, meta: { requiresAuth: true } },
  { path: '/op/resguardo', name: 'op-resguardo', component: OpResguardo, meta: { requiresAuth: true } },
  { path: '/op/servicio', name: 'op-servicio', component: OpServicio, meta: { requiresAuth: true } },
  { path: '/op/inventario-biomedica', name: 'op-inventario-biomedica', component: OpInventarioBiomedica, meta: { requiresAuth: true } },
  { path: '/op/insumos-consumibles', name: 'op-insumos-consumibles', component: OpInsumosConsumibles, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global de rutas: requiere token para rutas con meta.requiresAuth
router.beforeEach((to, from, next) => {
  const token = getAuthToken()
  if (to.meta && to.meta.requiresAuth && !token) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // Si ya hay token y va a login/register, mandarlo al dashboard (excepto add-account)
  if ((to.name === 'login' || to.name === 'register') && token) {
    return next({ name: 'dashboard' })
  }
  // Si está logueado y va al home, llevar al dashboard
  if (to.name === 'home' && token) {
    return next({ name: 'dashboard' })
  }
  // Permitir /add-account incluso si está logueado
  if (to.name === 'add-account' && token) return next()
  next()
})

export default router
