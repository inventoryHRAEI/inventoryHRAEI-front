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
              <NotificationBell class="notif-bell-action" />

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

    <!-- Notifications -->
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
    
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
import { Notivue, Notification } from 'notivue'
import { useRouter, useRoute } from 'vue-router'
import NotificationBell from '@/components/NotificationBell.vue'
import { logout } from '@/utils/auth'
import logoImg from './images/HRAEI.jpg'

const router = useRouter()
const route = useRoute()

const user = ref(null)
const menuOpen = ref(false)
const componentRenderKey = ref(0)
const lastRenderedRoute = ref(null)
const isTransitioning = ref(false)

const isAuthenticated = computed(() => {
  const token = localStorage.getItem('token')
  return !!token && !!user.value
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
    const raw = localStorage.getItem('user')
    if (!raw) {
      user.value = null
      return
    }
    user.value = JSON.parse(raw)
  } catch {
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
  window.addEventListener('session:updated', syncUserFromStorage)
  window.addEventListener('click', handleBodyClick)
  window.addEventListener('focus', syncUserFromStorage)
  
  // Validate component render after next frame
  requestAnimationFrame(() => {
    setTimeout(() => {
      validateComponentRender()
    }, 100)
  })
})

onBeforeUnmount(() => {
  console.log('[App] Unmounting')
  window.removeEventListener('session:updated', syncUserFromStorage)
  window.removeEventListener('click', handleBodyClick)
  window.removeEventListener('focus', syncUserFromStorage)
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
  }
}, { immediate: false, flush: 'pre' })  // flush: 'pre' ensures watch fires BEFORE render

watch(menuOpen, (isOpen) => {
  document.body.classList.toggle('menu-open', isOpen)
})
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
</style>
