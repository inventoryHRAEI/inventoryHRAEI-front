import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('./views/Home.vue')
const Login = () => import('./views/Login.vue')
const Register = () => import('./views/Register.vue')
const Forgot = () => import('./views/Forgot.vue')
const Reset = () => import('./views/Reset.vue')
const Dashboard = () => import('./views/Dashboard.vue')
const AddAccount = () => import('./views/Login.vue')

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/forgot', name: 'forgot', component: Forgot },
  { path: '/reset', name: 'reset', component: Reset },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/add-account', name: 'add-account', component: AddAccount, meta: { addAccount: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global de rutas: requiere token para rutas con meta.requiresAuth
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
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
