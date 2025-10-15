<template>
  <div>
    <component :is="isAdmin ? AdminDashboard : UserDashboard" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AdminDashboard from './AdminDashboard.vue'
import UserDashboard from './UserDashboard.vue'

const roleRef = ref(localStorage.getItem('role') || 'user')
const isAdmin = computed(() => (roleRef.value || '').toLowerCase() === 'admin')
window.addEventListener('storage', (e) => { if (e.key === 'role') roleRef.value = e.newValue || 'user' })
</script>
