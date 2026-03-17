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
                  <img v-if="user?.foto" :src="user.foto" class="avatar" alt="avatar" />
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
import { logout } from '@/utils/auth'
import logoImg from './images/HRAEI.jpg'

const router = useRouter()
const route = useRoute()

const user = ref(null)
const authCheckTrigger = ref(0) // Para forzar re-renders cuando cambia la autenticación
const menuOpen = ref(false)
const componentRenderKey = ref(0)
const lastRenderedRoute = ref(null)
const isTransitioning = ref(false)

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
       user.value = window.__sessionUser
       // Guardar en localStorage para persistencia
       localStorage.setItem('user', JSON.stringify(window.__sessionUser))
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
     user.value = parsed
     // Forzar re-render de la topbar
     authCheckTrigger.value++
   } catch (e) {
     console.error('[App] Error parsing user:', e)
     user.value = null
   }
 }

function toggleUserMenu() {
  menuOpen.value = !menuOpen.value
}

function closeUserMenu() {
  menuOpen.value = false
}

function handleBodyClick(e) {
  if (!menuOpen.value) return
  closeUserMenu()
}

async function handleLogout() {
  closeUserMenu()
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

function goImport() {
  closeUserMenu()
  router.push({ name: 'import' })
}

// Component mounted lifecycle hook
function onComponentMounted(event) {
  console.log('[App] ✅ Component @vue:mounted - Component ready:', route.fullPath)
  
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

// System initialization
onMounted(() => {
  console.log('[App] 🚀 App mounted - Route:', route.name)

  syncUserFromStorage()
  
  // Listener para cambios de sesión
  const handleSessionUpdate = () => {
    console.log('[App] 🔄 session:updated event fired')
    syncUserFromStorage()
  }
  window.addEventListener('session:updated', handleSessionUpdate)
  window.addEventListener('click', handleBodyClick)
  window.addEventListener('focus', syncUserFromStorage)
  
  // Watch localStorage para cambios inmediatos
  const handleStorageChange = () => {
    console.log('[App] 📦 Storage changed - syncing user')
    syncUserFromStorage()
  }
  window.addEventListener('storage', handleStorageChange)
  
  // Validate component render after next frame
  requestAnimationFrame(() => {
    setTimeout(() => {
      validateComponentRender()
    }, 100)
  })
})

onBeforeUnmount(() => {
  console.log('[App] Unmounting')
  window.removeEventListener('session:updated', handleSessionUpdate)
  window.removeEventListener('click', handleBodyClick)
  window.removeEventListener('focus', syncUserFromStorage)
  window.removeEventListener('storage', handleStorageChange)
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
  }
}, { immediate: false, flush: 'pre' })  // flush: 'pre' ensures watch fires BEFORE render

watch(menuOpen, (isOpen) => {
  document.body.classList.toggle('menu-open', isOpen)
})

// Watch user changes to trigger immediate topbar updates
watch(() => user.value, (newUser) => {
  console.log('[App] 👥 User changed:', newUser?.nombre || 'null')
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
