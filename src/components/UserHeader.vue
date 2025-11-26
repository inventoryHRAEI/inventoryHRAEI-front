<template>
  <div class="user-header">
    <img v-if="user && user.foto" :src="user.foto" class="avatar" alt="avatar" />
    <div v-else class="avatar placeholder">{{ initials }}</div>
    <div class="info">
      <div class="name">{{ user?.nombre || 'Usuario' }}</div>
      <div class="role">{{ user?.role || 'user' }}</div>
    </div>
    <div class="actions" v-if="isDashboard">
      <button v-if="isAdmin" class="btn small" @click="$emit('manage-users')">
        Gestionar usuarios
        <span v-if="pendingForMe > 0" class="badge">{{ pendingForMe }}</span>
      </button>
      <button v-else class="btn small" @click="$emit('requests')">Solicitar permisos</button>
      <button class="btn small" @click="openInNewWindow">Abrir en nueva ventana</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ user: Object, isDashboard: { type: Boolean, default: true } })
const emit = defineEmits(['manage-users', 'requests'])
import pendingRequestsStore from '@/stores/pendingRequestsStore'
import { windowManager } from '@/utils/windowManager'
const isAdmin = computed(() => (props.user && props.user.role === 'admin'))
const pendingForMe = computed(() => {
  try {
    const email = props.user && props.user.email ? props.user.email : localStorage.getItem('email')
    return pendingRequestsStore.byEmail.value[email] || 0
  } catch { return 0 }
})
const initials = computed(() => {
  if (!props.user || !props.user.nombre) return 'U'
  return props.user.nombre.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
})

function openInNewWindow() {
  try {
    const openerId = windowManager.windowId || ''
    const url = `${window.location.origin}/?scriptOpen=1&openerId=${encodeURIComponent(openerId)}`
    const w = window.open(url, '_blank')
    if (!w) {
      alert('No fue posible abrir la ventana. Habilita ventanas emergentes o prueba manualmente.');
    } else {
      w.focus()
    }
  } catch (e) {
    console.error('openInNewWindow error:', e)
    alert('No fue posible abrir la ventana. Habilita ventanas emergentes o prueba manualmente.');
  }
}
</script>

<style scoped>
.user-header{ display:flex; align-items:center; gap:12px; padding:8px }
.avatar{ width:48px; height:48px; border-radius:50%; object-fit:cover }
.avatar.placeholder{ display:flex; align-items:center; justify-content:center; background:#ddd; color:#333 }
.info .name{ font-weight:700 }
.role{ font-size:12px; color:#666 }
.actions{ margin-left:auto }
.btn.small{ padding:6px 10px; font-size:13px }
</style>
