<template>
  <component :is="isLoggedIn ? ForgotDashboard : ForgotPublic" />
</template>

<script setup>
import ForgotPublic from './ForgotPublic.vue'
import ForgotDashboard from './ForgotDashboard.vue'

const isLoggedIn = !!localStorage.getItem('user')
</script>

<style scoped>
/* wrapper - children define styles */
</style>


