<template>
  <div>
    <LoadingSkeleton v-if="loading || !hasAccess" type="cards" :count="6" />
    <component v-else :is="isAdmin ? AdminDashboard : UserDashboard" :key="`dashboard-${dashboardKey}`" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validateSession } from '@/utils/auth'
import { windowManager } from '@/utils/windowManager'
import { getUserRole } from '@/composables/usePermissions.js'
import AdminDashboard from './AdminDashboard.vue'
import UserDashboard from './UserDashboard.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const router = useRouter()
const route = useRoute()

const normalizeRole = (value) => String(value || 'user').toLowerCase().trim()
const roleRef = ref(normalizeRole(getUserRole()))
const isAdmin = computed(() => ['admin', 'sub_admin'].includes(normalizeRole(roleRef.value)))
const isPrivileged = computed(() => ['admin', 'privileged', 'sub_admin'].includes(normalizeRole(roleRef.value)))
const hasAccess = ref(false)
const loading = ref(true)
const dashboardKey = ref(0)


async function loadDashboard() {
  console.debug('[Dashboard] loadDashboard start')
  loading.value = true
  try { windowManager.setAsActive() } catch {}
  try {
    const result = await validateSession()
    console.debug('[Dashboard] validateSession result', result && result.authenticated)
    if (!result || !result.authenticated) {
      console.warn('[Dashboard] not authenticated, redirecting to login')
      router.replace('/login')
      return
    }
    hasAccess.value = true
    if (result.user && result.user.role) {
      const normalizedRole = normalizeRole(result.user.role)
      roleRef.value = normalizedRole
      localStorage.setItem('role', normalizedRole)
      if (typeof window !== 'undefined') window.__USER_ROLE__ = normalizedRole
    } else {
      roleRef.value = normalizeRole(getUserRole())
    }
    dashboardKey.value++ // Forzar recreación de sub-componentes
  } catch (err) {
    console.error('[Dashboard] loadDashboard error', err)
  } finally {
    // Ensure we always remove loading state so view can show fallback UI
    setTimeout(async () => {
      loading.value = false
      console.debug('[Dashboard] loadDashboard end')
      // Diagnostic: check main container children after a frame
      try {
        await new Promise(r => requestAnimationFrame(r))
        const main = document.querySelector('main.container')
        const count = main ? main.children.length : null
        const len = main ? main.innerHTML.length : null
        console.debug('[Dashboard] DIAG main children count', count, 'innerHTML len', len)
        if (count === 0 || len === 0) {
          // create a visible overlay so user immediately sees diagnostic on screen
          let dbg = document.getElementById('debug-dashboard-empty')
          if (!dbg) {
            dbg = document.createElement('div')
            dbg.id = 'debug-dashboard-empty'
            dbg.style.position = 'fixed'
            dbg.style.top = '80px'
            dbg.style.right = '20px'
            dbg.style.zIndex = '99999'
            dbg.style.background = 'rgba(255,0,0,0.85)'
            dbg.style.padding = '8px 12px'
            dbg.style.color = '#fff'
            dbg.style.borderRadius = '6px'
            dbg.style.fontFamily = 'sans-serif'
            dbg.style.fontSize = '13px'
            dbg.textContent = 'DEBUG: Dashboard content empty — check console logs'
            document.body.appendChild(dbg)
          }
        } else {
          const dbg = document.getElementById('debug-dashboard-empty')
          if (dbg) dbg.remove()
        }
      } catch (e) { console.warn('[Dashboard] diagnostic check failed', e) }
    }, 200)
  }
}

onMounted(() => {
  console.debug('[Dashboard] mounted')
  // Emit route:mounted early so routerHelpers knows the route is active even if data loading is slow
  try { window.dispatchEvent(new CustomEvent('route:mounted', { detail: { name: route.name, path: route.fullPath } })); console.debug('[Dashboard] dispatched route:mounted', { name: route.name, path: route.fullPath }) } catch (e) { console.warn('[Dashboard] failed to dispatch route:mounted', e) }
  loadDashboard()
  try {
    const handleForceRecreate = () => { console.debug('[Dashboard] app:force-recreate received'); dashboardKey.value++; loadDashboard() }
    window.addEventListener('app:force-recreate', handleForceRecreate)
    window.__dashboard_forceRecreate = handleForceRecreate
  } catch (e) { /* ignore */ }
})

// Recargar dashboard cuando se regresa a esta ruta desde otra
watch(() => route.name, (newName) => {
  if (newName === 'dashboard') {
    loadDashboard()
  }
})

onBeforeUnmount(() => {
  console.debug('[Dashboard] beforeUnmount')
  try { if (window.__dashboard_forceRecreate) { window.removeEventListener('app:force-recreate', window.__dashboard_forceRecreate); delete window.__dashboard_forceRecreate } } catch (e) {}
})

// Escuchar eventos de sesión pero solo si la sesión se perdió realmente
const handleSessionUpdate = () => {
  const role = localStorage.getItem('role')
  if (!role) {
    // Solo redirigir si no hay rol en localStorage (sesión cerrada)
    router.replace('/login')
  }
}

const handleStorageChange = (e) => {
  if (e.key === 'role') roleRef.value = e.newValue || 'user'
}

onMounted(() => {
  window.addEventListener('session:updated', handleSessionUpdate)
  window.addEventListener('storage', handleStorageChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('session:updated', handleSessionUpdate)
  window.removeEventListener('storage', handleStorageChange)
})
</script>
