<template>
  <div>
    <LoadingSkeleton v-if="loading || !hasAccess" type="cards" :count="6" />
    <component v-else :is="isAdmin ? AdminDashboard : UserDashboard" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validateSession } from '@/utils/auth'
import { windowManager } from '@/utils/windowManager'
import AdminDashboard from './AdminDashboard.vue'
import UserDashboard from './UserDashboard.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const router = useRouter()
const route = useRoute()

const hasAccess = ref(false)
const roleRef = ref(localStorage.getItem('role') || 'user')
const isAdmin = computed(() => (roleRef.value || '').toLowerCase() === 'admin')
const loading = ref(true)


async function loadDashboard() {
  loading.value = true
  try { windowManager.setAsActive() } catch {}
  const result = await validateSession()
  if (!result.authenticated) {
    router.replace('/login')
    return
  }
  hasAccess.value = true
  if (result.user && result.user.role) {
    roleRef.value = result.user.role
  }
  setTimeout(() => { loading.value = false }, 700)
}

onMounted(loadDashboard)

// Recargar dashboard cuando se regresa a esta ruta desde otra
watch(() => route.name, (newName) => {
  if (newName === 'dashboard') {
    loadDashboard()
  }
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
