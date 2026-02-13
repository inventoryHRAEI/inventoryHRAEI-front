<template>
  <div class="user-header-premium">
    <!-- Avatar con estado palpitante -->
    <div class="avatar-wrapper" :class="{ 'admin-pulse': isAdmin }">
      <img v-if="user && user.foto" :src="user.foto" class="avatar-img" alt="avatar" />
      <div v-else class="avatar-img placeholder">{{ initials }}</div>
      <div class="status-indicator" :class="{ admin: isAdmin }"></div>
    </div>

    <!-- Info de usuario -->
    <div class="user-info">
      <div class="user-name">{{ user?.nombre || 'Usuario' }}</div>
      <div class="user-role" :class="{ admin: isAdmin }">
        <span class="role-icon">{{ isAdmin ? '👑' : '👤' }}</span>
        {{ isAdmin ? 'Administrador' : 'Usuario' }}
      </div>
    </div>

    <!-- Botón para mostrar datos rápidos (solo dashboard) -->
    <div v-if="isDashboard && isAdmin" class="quick-action">
      <span v-if="pendingForMe > 0" class="pulse-badge">{{ pendingForMe }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
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
.user-header-premium {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(20, 40, 80, 0.3), rgba(30, 50, 100, 0.2));
  border: 1px solid rgba(99, 179, 237, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.user-header-premium:hover {
  border-color: rgba(99, 179, 237, 0.4);
  background: linear-gradient(135deg, rgba(20, 40, 80, 0.5), rgba(30, 50, 100, 0.4));
  box-shadow: 0 8px 24px rgba(99, 179, 237, 0.15);
}

/* Avatar styling */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 179, 237, 0.3);
  transition: all 0.3s ease;
}

.avatar-img.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.user-header-premium:hover .avatar-img {
  border-color: rgba(99, 179, 237, 0.6);
  box-shadow: 0 0 16px rgba(99, 179, 237, 0.3);
}

/* Status indicator */
.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4ade80;
  border: 2px solid white;
  animation: status-pulse 2s infinite;
}

.status-indicator.admin {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  animation: admin-pulse 2s infinite;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
}

/* User info */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 700;
  font-size: 15px;
  color: #f0f9ff;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.user-role {
  font-size: 12px;
  color: rgba(173, 216, 230, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.user-role.admin {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.role-icon {
  font-size: 11px;
  animation: icon-float 2s ease-in-out infinite;
}

/* Quick action badge */
.quick-action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 1.5px solid rgba(239, 68, 68, 0.3);
}

.pulse-badge {
  font-size: 13px;
  font-weight: 700;
  color: #ef4444;
  animation: badge-scale 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

/* Animations */
@keyframes status-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0.1);
  }
}

@keyframes admin-pulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.6), inset 0 0 6px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.8), inset 0 0 8px rgba(245, 158, 11, 0.5);
  }
}

@keyframes admin-pulse-wrapper {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.05);
  }
}

.avatar-wrapper.admin-pulse {
  animation: admin-pulse-wrapper 3s ease-in-out infinite;
  border-radius: 50%;
}

@keyframes icon-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes badge-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .user-header-premium {
    gap: 10px;
    padding: 8px 12px;
  }

  .avatar-img {
    width: 40px;
    height: 40px;
  }

  .user-name {
    font-size: 14px;
  }

  .user-role {
    font-size: 11px;
  }
}
</style>
