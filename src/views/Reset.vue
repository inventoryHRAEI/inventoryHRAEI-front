<template>
  <component :is="isLoggedIn ? ResetDashboard : ResetPublic" />
</template>

<script setup>
import ResetPublic from './ResetPublic.vue'
import ResetDashboard from './ResetDashboard.vue'

const isLoggedIn = !!localStorage.getItem('user')
</script>

<style scoped>
/* wrapper: children provide styles */
</style>
