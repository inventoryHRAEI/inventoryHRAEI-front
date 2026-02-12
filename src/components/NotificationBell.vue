<template>
  <div class="notification-bell-wrapper">
    <!-- Bell Icon Button -->
    <button
      class="bell-icon-btn"
      :class="{ 'has-unread': unreadCount > 0, 'is-open': panelOpen }"
      @click="togglePanel"
      :aria-label="`Notificaciones (${unreadCount} nuevas)`"
      :aria-expanded="panelOpen"
    >
      <!-- Bell SVG Icon -->
      <svg
        class="bell-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <!-- Badge with unread count -->
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>

      <!-- Mute indicator -->
      <svg
        v-if="isMuted"
        class="mute-indicator"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="2" />
      </svg>
    </button>

    <!-- Notification Panel -->
    <transition name="panel-slide">
      <div v-if="panelOpen" class="notification-panel">
        <!-- Header -->
        <div class="panel-header">
          <h3>Notificaciones</h3>
          <div class="header-actions">
            <button
              class="icon-btn"
              :class="{ 'is-muted': isMuted }"
              @click="toggleMute"
              :title="isMuted ? 'Desmutear' : 'Mutear'"
              :aria-label="isMuted ? 'Desmutear notificaciones' : 'Mutear notificaciones'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path v-if="!isMuted" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path v-if="!isMuted" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <line v-if="isMuted" x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
            <button
              v-if="notifications.length > 0"
              class="icon-btn"
              @click="clearAll"
              title="Limpiar todo"
              aria-label="Limpiar todas las notificaciones"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            <button class="icon-btn" @click="closePanel" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="panel-content">
          <div v-if="notifications.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>Sin notificaciones</p>
          </div>

          <div v-else class="notifications-list">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              :class="['notification-item', notif.type, { unread: !notif.read }]"
              @click="markAsRead(notif.id)"
            >
              <div class="notif-left">
                <div :class="['notif-icon', notif.type]">
                  <component :is="getIcon(notif.type)" />
                </div>
              </div>

              <div class="notif-content">
                <div class="notif-title">{{ notif.title }}</div>
                <div class="notif-message">{{ notif.message }}</div>
                <div class="notif-time">{{ formatTime(notif.timestamp) }}</div>
              </div>

              <button
                class="notif-close"
                @click.stop="removeNotification(notif.id)"
                :aria-label="`Eliminar: ${notif.title}`"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Click outside to close -->
    <div v-if="panelOpen" class="panel-backdrop" @click="closePanel" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import notificationStore from '@/stores/notificationStore'

const panelOpen = ref(false)

const notifications = computed(() => notificationStore.state.notifications)
const unreadCount = computed(() => notificationStore.unreadCount.value)
const isMuted = computed(() => notificationStore.state.isMuted)

function togglePanel() {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) {
    notificationStore.markAllAsRead()
  }
}

function closePanel() {
  panelOpen.value = false
}

function toggleMute() {
  notificationStore.toggleMute()
}

function clearAll() {
  notificationStore.clearAll()
}

function removeNotification(id) {
  notificationStore.removeNotification(id)
}

function markAsRead(id) {
  notificationStore.markAsRead(id)
}

function formatTime(date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes}m`

  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `Hace ${hours}h`

  const days = Math.floor(diff / 86400000)
  if (days < 7) return `Hace ${days}d`

  return date.toLocaleDateString()
}

function getIcon(type) {
  return {
    success: () =>
      h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, [
        h('polyline', { points: '20 6 9 17 4 12' }),
      ]),
    warning: () =>
      h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, [
        h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z' }),
        h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
        h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
      ]),
    error: () =>
      h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, [
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
        h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' }),
      ]),
    critical: () =>
      h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'currentColor' }, [
        h('circle', { cx: '12', cy: '12', r: '10' }),
      ]),
    info: () =>
      h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, [
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
        h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }),
      ]),
  }[type]
}

import { h } from 'vue'

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (panelOpen.value && !e.target.closest('.notification-bell-wrapper')) {
      closePanel()
    }
  })
})
</script>

<style scoped>
.notification-bell-wrapper {
  position: relative;
}

.bell-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.bell-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.bell-icon-btn.is-open {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.bell-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
}

.mute-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
}

.notification-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 380px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

.panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.icon-btn.is-muted {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.4;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  border-left: 3px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: #f3f4f6;
}

.notification-item.unread {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.notification-item.success {
  border-left-color: #10b981;
}

.notification-item.success.unread {
  background: #ecfdf5;
}

.notification-item.warning {
  border-left-color: #f59e0b;
}

.notification-item.warning.unread {
  background: #fefce8;
}

.notification-item.error {
  border-left-color: #ef4444;
}

.notification-item.error.unread {
  background: #fef2f2;
}

.notification-item.critical {
  border-left-color: #dc2626;
}

.notification-item.critical.unread {
  background: #fef2f2;
}

.notif-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.notif-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
}

.notif-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notif-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notif-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.notif-icon.critical {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.notif-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.notif-message {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  word-break: break-word;
}

.notif-time {
  font-size: 11px;
  color: #9ca3af;
}

.notif-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notif-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.2s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 480px) {
  .notification-panel {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 60vh;
    border-radius: 12px 12px 0 0;
  }
}
</style>
