<template>
  <div v-if="hasAccess">
    <component :is="isAdmin ? AdminDashboard : UserDashboard" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { validateSession } from '@/utils/auth'
import AdminDashboard from './AdminDashboard.vue'
import UserDashboard from './UserDashboard.vue'

const router = useRouter()
const hasAccess = ref(false)
const roleRef = ref(localStorage.getItem('role') || 'user')
const isAdmin = computed(() => (roleRef.value || '').toLowerCase() === 'admin')

onMounted(async () => {
  const result = await validateSession()
  if (!result.authenticated) {
    router.replace('/login')
    return
  }
  hasAccess.value = true
  if (result.user && result.user.role) {
    roleRef.value = result.user.role
  }
})

// Escuchar eventos de sesión (logout en otra pestaña)
window.addEventListener('session:updated', () => {
  router.replace('/login')
})

window.addEventListener('storage', (e) => {
  if (e.key === 'role') roleRef.value = e.newValue || 'user'
})
</script>
