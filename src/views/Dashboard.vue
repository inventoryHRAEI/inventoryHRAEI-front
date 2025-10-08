<template>
  <div>
    <component :is="isAdmin ? AdminDashboard : UserDashboard" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AdminDashboard from './AdminDashboard.vue'
import UserDashboard from './UserDashboard.vue'

const role = localStorage.getItem('role') || 'user'
const isAdmin = computed(() => role === 'admin')
</script>
