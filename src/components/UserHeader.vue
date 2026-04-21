<template>
  <div class="user-header">
    <div class="user-info-wrapper">
      <div class="avatar-container">
        <img v-if="user && user.foto" :src="user.foto" class="avatar" alt="avatar" />
        <div v-else class="avatar placeholder">{{ initials }}</div>
        <div v-if="isAdmin" class="role-badge admin">Admin</div>
      </div>
      <div class="info">
        <div class="name">{{ truncateName(user?.nombre) || 'Usuario' }}</div>
        <div class="role">{{ user?.email || user?.role || 'user' }}</div>
      </div>
    </div>
    
    <div class="actions" v-if="isDashboard">
      <button v-if="isAdmin" class="action-btn manage-btn" @click="$emit('manage-users')" :title="pendingForMe > 0 ? `${pendingForMe} solicitudes pendientes` : 'Gestionar usuarios'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span v-if="pendingForMe > 0" class="action-badge">{{ pendingForMe }}</span>
      </button>
      <button v-else class="action-btn request-btn" @click="$emit('requests')" title="Solicitar permisos">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button class="action-btn window-btn" @click="openInNewWindow" title="Abrir en nueva ventana">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>
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

function truncateName(name) {
  if (!name) return ''
  return name.length > 20 ? name.substring(0, 17) + '...' : name
}

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
.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.user-header:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(46, 221, 90, 0.3), rgba(76, 220, 130, 0.2));
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-size: 14px;
  border: 2px solid rgba(46, 221, 90, 0.3);
}

.role-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: linear-gradient(135deg, #2edd5a 0%, #46d96f 100%);
  color: #0b2540;
  box-shadow: 0 2px 8px rgba(46, 221, 90, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info .name {
  font-weight: 700;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0;
  padding: 0;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn.manage-btn:hover {
  background: rgba(46, 221, 90, 0.15);
  border-color: rgba(46, 221, 90, 0.4);
  color: #2edd5a;
}

.action-btn.request-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  color: #3b82f6;
}

.action-btn.window-btn:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.4);
  color: #a855f7;
}

.action-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid rgba(0, 0, 0, 0.2);
  padding: 0 4px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@media (max-width: 768px) {
  .user-header {
    padding: 10px 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .info .name {
    font-size: 13px;
  }

  .role {
    font-size: 11px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
