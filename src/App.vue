<template>
  <div id="app">
    <!-- Background media (image/video) -->
    <div class="bg-media">
      <img 
        src="./images/fondo2.jpg" 
        alt="Background" 
        class="bg-img"
        loading="eager"
      />
    </div>

    <!-- Global Topbar -->
    <header class="topbar">
      <div class="container">
        <div class="topbar-inner">
          <div class="brand">
             <img class="topbar-logo" :src="logoImg" alt="HRAEI" />
             <div class="brand-text">
               <div class="brand-title">HRAEI</div>
               <div class="brand-sub">Ingenieria Biomedica</div>
             </div>
           </div>

           <div class="site-title">Sistema de Inventarios</div>

           <div class="topbar-actions">
             <div v-if="!isAuthenticated" class="actions">
              <button class="top-action" @click="goLogin">Iniciar sesion</button>
              <button class="top-action" @click="goRegister">Registrarse</button>
            </div>

            <div v-else class="actions">
              <NotificationBell class="notif-bell-integrated" @click.stop />
              <div class="user-menu" @click.stop>
                <button class="user-btn" :class="userBtnClasses" @click="toggleUserMenu">
                  <img v-if="user?.foto" :src="user.foto" class="avatar top-avatar" alt="avatar" />
                  <span v-else class="avatar placeholder">{{ initials }}</span>
                  <span class="welcome-text">Hola, {{ user?.nombre || 'Usuario' }}</span>
                  <span v-if="isAdmin" class="admin-badge">Admin</span>
                  <span class="chev"></span>
                </button>

                <transition name="slide-down">
                  <div v-if="menuOpen" class="dropdown" :class="{ 'dropdown-admin': isAdmin, expanded: isAdmin }">
                    <div class="dropdown-header">
                      <div class="dropdown-user-info">
                        <div class="dropdown-user-role">{{ roleLabel }}</div>
                        <div class="dropdown-user-email">{{ user?.email || '—' }}</div>
                      </div>
                    </div>

                    <button class="dropdown-item" @click="goProfile">Perfil</button>
                    <button class="dropdown-item" @click="goDashboard">Panel principal</button>
                    <button v-if="isAdmin" class="dropdown-item admin-item" @click="goManageUsers">Gestionar usuarios</button>
                    <button
                      v-if="isAdmin"
                      class="dropdown-item admin-item"
                      :class="{ 'edit-requests-alert': hasPendingEditRequests }"
                      @click="goEditRequests"
                      :title="pendingEditRequests > 0 ? `${pendingEditRequestsLabel} solicitudes de edición pendientes` : 'Solicitudes de edición'"
                    >
                      <span>Solicitudes de edición</span>
                      <span v-if="pendingEditRequests > 0" class="edit-requests-badge">{{ pendingEditRequestsLabel }}</span>
                    </button>
                    <button v-if="isAdmin" class="dropdown-item admin-item" @click="goImport">📥 Importar CSV</button>
                    <hr class="dropdown-divider" />
                    <button class="dropdown-item logout-item" @click="handleLogout">Cerrar sesion</button>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <InactivityWarning />

    <!-- Notifications handled globally by Notyf (no Teleport needed) -->
    
    <!-- Main container -->
    <main class="container" :class="containerClasses">
      <RouterView v-slot="{ Component, route }" :key="componentRenderKey">
        <!-- CRITICAL: Key on RouterView ensures full re-creation -->
        <Suspense>
          <template #default>
            <component 
              :is="Component" 
              :key="`${route.fullPath}::${componentRenderKey}`"
              class="route-component"
              @vue:mounted="onComponentMounted"
            />
          </template>
          <template #fallback>
            <div class="loading-container">
              <div class="spinner"></div>
              <p>Cargando...</p>
            </div>
          </template>
        </Suspense>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
// Notivue removed - using Notyf
import { useRouter, useRoute } from 'vue-router'
import NotificationBell from '@/components/NotificationBell.vue'
import InactivityWarning from '@/components/InactivityWarning.vue'
import inactivityHandler from '@/utils/inactivityHandler'
import { authedFetch } from '@/utils/api'
import { logout } from '@/utils/auth'
import { saveSessionState, peekSessionState, peekWizardState, peekPanelState, clearSessionState, backupWizardDrafts } from '@/utils/sessionRestore'
import { warmupBiomedicalEquipmentCatalog } from '@/services/biomedicalEquipmentCatalog.js'
import logoImg from './images/HRAEI.jpg'

const router = useRouter()
const route = useRoute()

const user = ref(null)
const authCheckTrigger = ref(0) // Para forzar re-renders cuando cambia la autenticación
const menuOpen = ref(false)
const componentRenderKey = ref(0)
const lastRenderedRoute = ref(null)
const isTransitioning = ref(false)
let editRequestsRefreshTimer = null
const editRequestsPendingCount = ref(0)
const INACTIVITY_PUBLIC_ROUTE_NAMES = new Set(['home', 'login', 'register', 'forgot', 'reset'])
// Handlers declarados en scope superior para poder removerlos en onBeforeUnmount
let handleSessionUpdate = null
let handleStorageChange = null
let handleWindowFocus = null

const isAuthenticated = computed(() => {
  // Depender del trigger para forzar re-evaluación
  authCheckTrigger.value
  
  // Verificar tanto el token como el usuario
  const token = localStorage.getItem('token')
  const hasUser = !!user.value
  const hasUserInStorage = !!localStorage.getItem('user')
  
  // Si hay token y usuario en storage, considerar autenticado
  return !!token && (hasUser || hasUserInStorage)
})

const isAdmin = computed(() => {
  const role = (user.value?.role || '').toLowerCase()
  return role === 'admin'
})

const roleLabel = computed(() => {
  const role = (user.value?.role || 'user').toString()
  return role === 'admin' ? 'Administrador' : 'Usuario'
})

const initials = computed(() => {
  const name = user.value?.nombre || ''
  if (!name) return 'U'
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
})

const userBtnClasses = computed(() => ({
  'user-btn-admin': isAdmin.value,
  'user-btn-user': !isAdmin.value,
  open: menuOpen.value
}))

const pendingEditRequests = computed(() => Number(editRequestsPendingCount.value || 0))
const hasPendingEditRequests = computed(() => isAdmin.value && pendingEditRequests.value > 0)
const pendingEditRequestsLabel = computed(() => {
  const total = pendingEditRequests.value
  if (total <= 0) return ''
  return total > 100 ? '99+' : String(total)
})

// Normaliza distintos formatos de foto de usuario a un src utilizable
function processPhotoUrl(foto) {
  try {
    if (!foto) return null

    if (typeof foto === 'string') {
      if (foto.startsWith('data:')) return foto
      if (foto.startsWith('http')) return foto
      if (foto.startsWith('/')) return foto
      if (foto.toLowerCase().startsWith('base64,')) return `data:image/jpeg;base64,${foto.slice(7)}`

      return `/api/uploads/${foto}`
    }

    if (typeof foto === 'object' && foto.type === 'Buffer' && Array.isArray(foto.data)) {
      const b64 = btoa(String.fromCharCode(...foto.data))
      return `data:image/jpeg;base64,${b64}`
    }

    return null
  } catch (e) {
    console.error('[App] processPhotoUrl error', e)
    return null
  }
}

// Dynamic container classes based on route
const containerClasses = computed(() => {
  const classes = []
  
  // Add op-embed-active class for operation routes
  if (route.name && route.name.toString().startsWith('op-')) {
    classes.push('op-embed-active')
  }
  
  return classes
})

function syncUserFromStorage() {
   try {

     if (window.__sessionUser) {
       console.log('[App] syncUserFromStorage: usando datos globales')
      // Normalizar foto si existe
      const su = { ...window.__sessionUser }
      if (su.foto) su.foto = processPhotoUrl(su.foto)
      user.value = su
       // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(user.value))
       // También guardar el token si existe
       if (window.__sessionToken) {
         localStorage.setItem('token', window.__sessionToken)
       }
       // Forzar re-render de la topbar
       authCheckTrigger.value++
       // 清除全局变量
       window.__sessionUser = null
       window.__sessionToken = null
       return
     }
     
     const raw = localStorage.getItem('user')
     console.log('[App] syncUserFromStorage called, raw:', raw ? 'present' : 'null')
     if (!raw) {
       user.value = null
       authCheckTrigger.value++
       return
     }
    const parsed = JSON.parse(raw)
    console.log('[App] Parsed user:', parsed?.nombre)
    if (parsed?.foto) parsed.foto = processPhotoUrl(parsed.foto)
    user.value = parsed
     // Forzar re-render de la topbar
     authCheckTrigger.value++
   } catch (e) {
     console.error('[App] Error parsing user:', e)
     user.value = null
   }
 }

async function toggleUserMenu() {
  const willOpen = !menuOpen.value
  if (willOpen) {
    await refreshPendingEditRequests()
  }
  menuOpen.value = willOpen
}

function closeUserMenu() {
  menuOpen.value = false
}

function handleBodyClick(e) {
  if (!menuOpen.value) return
  closeUserMenu()
}

async function refreshPendingEditRequests() {
  try {
    if (!isAuthenticated.value) return
    const res = await authedFetch('/api/edit-requests')
    if (!res || !res.ok) {
      editRequestsPendingCount.value = 0
      return
    }
    const data = await res.json().catch(() => [])
    const rows = Array.isArray(data) ? data : []
    editRequestsPendingCount.value = rows.filter(r => String(r?.status || '').toLowerCase() === 'pending').length
  } catch (e) {
    console.warn('[App] refreshPendingEditRequests failed', e)
    editRequestsPendingCount.value = 0
  }
}

async function handleLogout() {
  closeUserMenu()
  // Pedir a los wizards activos que hagan persistencia inmediata antes de cerrar sesión
  try { window.dispatchEvent(new Event('wizard:draft:flush')) } catch (e) {}
  // Give active wizards a short moment to persist drafts synchronously
  try { await new Promise(resolve => setTimeout(resolve, 80)) } catch (e) {}
  // Force-call any registered draft save handlers (synchronous fallback)
  try {
    const handlers = (window.__wizardDraftSaveHandlers || {})
    Object.keys(handlers).forEach((k) => {
      try { handlers[k]() } catch (err) { console.warn('[App] wizardDraftSaveHandler failed for', k, err) }
    })
  } catch (e) { console.warn('[App] Error invoking global draft handlers', e) }
  // Best-effort remote sync before token is cleared
  try {
    const syncHandlers = (window.__wizardDraftSyncHandlers || {})
    const tasks = Object.keys(syncHandlers).map((k) => {
      try { return Promise.resolve(syncHandlers[k]()) } catch (err) { console.warn('[App] wizardDraftSyncHandler failed for', k, err); return null }
    }).filter(Boolean)
    if (tasks.length) {
      await Promise.race([
        Promise.allSettled(tasks),
        new Promise(resolve => setTimeout(resolve, 800))
      ])
    }
  } catch (e) { console.warn('[App] Error invoking remote draft handlers', e) }
  try { saveSessionState('manual', { routeName: route?.name || null, fullPath: route?.fullPath || '' }) } catch (e) {}
  try { backupWizardDrafts() } catch (e) { console.warn('[App] backupWizardDrafts failed', e) }
  await logout()
  syncUserFromStorage()
  router.replace({ name: 'login' })
}

function goLogin() {
  router.push({ name: 'login' })
}

function goRegister() {
  router.push({ name: 'register' })
}

function goDashboard() {
  closeUserMenu()
  router.push({ name: 'dashboard' })
}

function goProfile() {
  closeUserMenu()
  router.push({ name: 'user-settings' })
}

function goManageUsers() {
  closeUserMenu()
  router.push({ name: 'admin-users' })
}

function goEditRequests() {
  closeUserMenu()
  router.push({ name: 'admin-edit-requests' })
}

function goImport() {
  closeUserMenu()
  router.push({ name: 'import' })
}

// Component mounted lifecycle hook
function onComponentMounted(event) {
  console.log('[App] ✅ Component @vue:mounted - Component ready:', route.fullPath)

  try {
    window.dispatchEvent(new CustomEvent('route:mounted', {
      detail: { name: route.name, path: route.fullPath }
    }))
  } catch (e) {
    // ignore event dispatch failures
  }
  
  // Validate it's in DOM
  const main = document.querySelector('main.container')
  const hasChildren = main && main.children.length > 0
  console.log('[App] DOM Children:', hasChildren ? main.children.length : 0)
}

// Check if component is properly mounted
function validateComponentRender() {
  const main = document.querySelector('main.container')
  if (!main) {
    console.error('[App] ❌ main.container NOT FOUND')
    return false
  }
  
  if (main.children.length === 0) {
    console.error('[App] ❌ main.container has NO children - component not rendered')
    return false
  }
  
  const component = main.children[0]
  const hasContent = component.innerHTML && component.innerHTML.length > 0
  
  if (!hasContent) {
    console.warn('[App] ⚠️ Component exists but is empty:', component.tagName)
    return false
  }
  
  console.log('[App] ✅ Component successfully rendered in DOM')
  return true
}

function handleBeforeUnload() {
  try {
    saveSessionState('beforeunload', { routeName: route?.name || null, fullPath: route?.fullPath || '' })
  } catch (e) {
    console.warn('[App] handleBeforeUnload saveSessionState failed', e)
  }
  try {
    window.dispatchEvent(new Event('wizard:draft:flush'))
  } catch (e) {
    console.warn('[App] handleBeforeUnload wizard draft flush failed', e)
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    handleBeforeUnload()
    return
  }
  if (document.visibilityState === 'visible' && isAuthenticated.value) {
    try { warmupBiomedicalEquipmentCatalog() } catch (e) { /* ignore */ }
  }
}

function syncInactivityHandler() {
  const inactivityEnabled = localStorage.getItem('inactivityEnabled') !== 'false'
  const inactivityMinutes = Math.max(15, parseInt(localStorage.getItem('inactivityTimeout') || '15', 10))
  const warningSeconds = Math.max(10, parseInt(localStorage.getItem('inactivityWarningSeconds') || '60', 10))
  const routeName = String(route?.name || '')
  const shouldRun = inactivityEnabled && isAuthenticated.value && !INACTIVITY_PUBLIC_ROUTE_NAMES.has(routeName)

  try {
    window.inactivityHandler = inactivityHandler
  } catch (e) {
    console.warn('[App] No se pudo exponer inactivityHandler en window', e)
  }

  if (!shouldRun) {
    if (inactivityHandler.isInitialized && inactivityHandler.isEnabled) {
      inactivityHandler.pause()
      console.log('[App] Inactivity handler pausado', { routeName, isAuthenticated: isAuthenticated.value })
    }
    return
  }

  try {
    if (!inactivityHandler.isInitialized) {
      inactivityHandler.init(inactivityMinutes, warningSeconds)
      console.log('[App] Inactivity handler inicializado', { inactivityMinutes, warningSeconds, routeName })
      console.log('[App] Tip: Usa window.inactivityHandler.forceWarning() para testear sin esperar 15 min')
    } else if (!inactivityHandler.isEnabled) {
      inactivityHandler.resume()
      console.log('[App] Inactivity handler reanudado', { routeName })
    }

    inactivityHandler.setSyncAcrossTabs(true)
    inactivityHandler.setKeepAliveRefresh(true)
    inactivityHandler.setPreWarningSeconds(Math.min(60, warningSeconds))
  } catch (e) {
    console.error('[App] No se pudo sincronizar inactivityHandler', e)
  }
}

// System initialization
onMounted(() => {
  console.log('[App] 🚀 App mounted - Route:', route.name)

  syncUserFromStorage()
  refreshPendingEditRequests()
  editRequestsRefreshTimer = window.setInterval(refreshPendingEditRequests, 30000)
  
  // Listener para cambios de sesión: si el evento lleva `detail`, usarlo para actualizar inmediatamente
  handleSessionUpdate = (e) => {
    console.log('[App] 🔄 session:updated event fired', e && e.detail ? 'with detail' : 'without detail')
    try {
      if (e && e.detail) {
        const su = { ...(e.detail || {}) }
        if (su.foto) su.foto = processPhotoUrl(su.foto)
        user.value = su
        // Persistir para consistencia
        localStorage.setItem('user', JSON.stringify(user.value))
        authCheckTrigger.value++
        return
      }
    } catch (err) {
      console.warn('[App] handleSessionUpdate error', err)
    }
    // Fallback: sincronizar desde storage/global
    syncUserFromStorage()
  }
  window.addEventListener('session:updated', handleSessionUpdate)
  window.addEventListener('click', handleBodyClick)
  handleWindowFocus = () => {
    syncUserFromStorage()
    if (isAuthenticated.value) {
      try { warmupBiomedicalEquipmentCatalog() } catch (e) { /* ignore */ }
      refreshPendingEditRequests()
    }
  }
  window.addEventListener('focus', handleWindowFocus)

  // Watch localStorage para cambios inmediatos
  handleStorageChange = () => {
    console.log('[App] 📦 Storage changed - syncing user')
    syncUserFromStorage()
  }
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  syncInactivityHandler()

  // Validate component render after next frame
  requestAnimationFrame(() => {
    setTimeout(() => {
      validateComponentRender()
    }, 100)
  })
})

// Precarga agresiva del catálogo de equipos médicos al autenticar.
watch(isAuthenticated, (val) => {
  if (!val) return
  try { warmupBiomedicalEquipmentCatalog() } catch (e) { /* ignore */ }
}, { immediate: true })

watch(
  [isAuthenticated, () => route.name],
  () => {
    syncInactivityHandler()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  console.log('[App] Unmounting')
  try {
    if (handleSessionUpdate) window.removeEventListener('session:updated', handleSessionUpdate)
    window.removeEventListener('click', handleBodyClick)
    if (handleWindowFocus) window.removeEventListener('focus', handleWindowFocus)
    if (handleStorageChange) window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (editRequestsRefreshTimer) window.clearInterval(editRequestsRefreshTimer)
  } catch (e) {
    console.warn('[App] Error removing event listeners:', e)
  }
})

// Watch route changes - CRITICAL: Force component re-render on EVERY route change
watch(() => route.fullPath, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    console.log('[App] 🔄 ROUTE CHANGED:', oldPath, '→', newPath)
    
    // CRITICAL: Always increment - forces Vue to destroy/recreate component
    componentRenderKey.value++
    lastRenderedRoute.value = newPath
    
    console.log('[App] 🔑 componentRenderKey incremented to:', componentRenderKey.value)
    
    // Clear specific caches for operations routes
    try {
      const routeParts = newPath.split('/')
      if (routeParts.includes('op')) {
        localStorage.removeItem('orders_list')
        localStorage.removeItem('op_entrada_form')
        console.log('[App] 🗑️ Cleared operation caches')
      }
    } catch (e) { /* ignore */ }
    
    closeUserMenu()
    
    // SYNC: Re-sincronizar usuario cuando cambia la ruta
    // Esto asegura que la topbar se actualice al navegar
    syncUserFromStorage()

    // Si llegamos a la ruta restaurada y no hay wizard/panel pendiente, limpiar el estado
    try {
      const restoreState = peekSessionState()
      const wizardState = peekWizardState()
      const panelState = peekPanelState()
      if (restoreState && restoreState.fullPath === newPath) {
        const wizardRoute = wizardState && wizardState.routeName ? String(wizardState.routeName) : ''
        const panelRoute = panelState && panelState.routeName ? String(panelState.routeName) : ''
        const currentRoute = String(route.name || '')
        if ((!wizardRoute || wizardRoute !== currentRoute) && (!panelRoute || panelRoute !== currentRoute)) {
          clearSessionState()
        }
      }
    } catch (e) { /* ignore */ }
  }
}, { immediate: false, flush: 'pre' })  // flush: 'pre' ensures watch fires BEFORE render

watch(menuOpen, (isOpen) => {
  document.body.classList.toggle('menu-open', isOpen)
})

// Watch user changes to trigger immediate topbar updates
watch(() => user.value, (newUser) => {
  console.log('[App] 👥 User changed:', newUser?.nombre || 'null')
  refreshPendingEditRequests()
}, { deep: true })
</script>

<style scoped>
/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 14px;
}

/* Route component styling */
.route-component {
  width: 100%;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

/* When an operation route is active, let the operation component control its own card
   Remove container background/borders so only the inner wizard card appears rounded */
main.container.op-embed-active {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
}

main.container.op-embed-active .route-component {
   background: transparent !important;
   padding: 0 !important;
   border: none !important;
}

.notif-bell-integrated {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
  flex: 0 0 auto !important;
  flex-shrink: 0 !important;
  min-width: auto !important;
  width: auto !important;
  height: auto !important;
  position: relative !important;
  z-index: 200 !important;
  isolation: isolate !important;
}

.notif-bell-integrated .bell-icon-btn {
  transition: all 0.2s ease !important;
  border-radius: 12px !important;
  padding: 8px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  width: 42px !important;
  height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  pointer-events: auto !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.notif-bell-integrated .bell-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(129, 140, 248, 0.4) !important;
  transform: translateY(-2px) !important;
  color: #fff !important;
}

.notif-bell-integrated .notification-panel {
  position: fixed !important;
  top: 80px !important;
  right: 20px !important;
  z-index: 99999 !important;
}

.dropdown-item.admin-item.edit-requests-alert {
  position: relative;
  overflow: hidden;
  color: #fff !important;
  background: linear-gradient(90deg, #ff4d6d, #ffb703, #22c55e, #06b6d4, #8b5cf6, #ff4d6d) !important;
  background-size: 300% 300% !important;
  animation: edit-requests-rainbow 8s linear infinite !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: 0 10px 28px rgba(31, 41, 55, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16) !important;
}

.dropdown-item.admin-item.edit-requests-alert:hover {
  filter: brightness(1.06) saturate(1.08);
  transform: translateX(2px);
}

.dropdown-item.admin-item.edit-requests-alert .edit-requests-badge {
  margin-left: auto;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15);
}

.dropdown-item.admin-item.edit-requests-alert::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 60%);
  transform: translateX(-100%);
  animation: edit-requests-sheen 2.8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes edit-requests-rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes edit-requests-sheen {
  0% { transform: translateX(-100%); }
  45% { transform: translateX(115%); }
  100% { transform: translateX(115%); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .notif-bell-integrated .bell-icon-btn {
    padding: 6px !important;
    width: 38px !important;
    height: 38px !important;
  }
  
  .notif-bell-integrated .notification-panel {
    top: 70px !important;
    right: 10px !important;
    left: 10px !important;
    width: auto !important;
    max-height: calc(100vh - 90px) !important;
  }
}

@media (max-width: 480px) {
  .notif-bell-integrated .bell-icon-btn {
    padding: 6px !important;
    width: 36px !important;
    height: 36px !important;
  }
}
</style>
