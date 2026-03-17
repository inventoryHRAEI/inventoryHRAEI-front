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
        width="22"
        height="22"
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
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="3" />
      </svg>
    </button>

    <!-- Click outside to close backdrop -->
    <div v-if="panelOpen" class="panel-backdrop" @click="closePanel" />
    
    <!-- Notification Panel - Premium Glassmorphism Design -->
    <transition name="panel-slide">
      <div v-if="panelOpen" class="notification-panel" @click.stop>
        <!-- Glassmorphism Header -->
        <div class="panel-header">
          <div class="header-content">
            <div class="header-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Notificaciones</span>
            </div>
            <span v-if="unreadCount > 0" class="unread-count-badge">{{ unreadCount }}</span>
          </div>
          
          <div class="header-actions">
            <button
              class="action-btn"
              :class="{ 'is-muted': isMuted }"
              @click="toggleMute"
              :title="isMuted ? 'Activar sonido' : 'Silenciar'"
            >
              <svg v-if="!isMuted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </button>
            
            <button
              v-if="notifications.length > 0"
              class="action-btn"
              @click="clearAll"
              title="Limpiar todo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            
            <button class="action-btn close-btn" @click="closePanel" title="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div v-if="notifications.length > 0" class="panel-filters">
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'all' }"
            @click="activeFilter = 'all'"
          >
            Todas
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'unread' }"
            @click="activeFilter = 'unread'"
          >
            Nuevas
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'warning' }"
            @click="activeFilter = 'warning'"
          >
            ⚠️ Alerts
          </button>
        </div>

        <!-- Notifications List -->
        <div class="panel-content">
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p class="empty-title">Sin notificaciones</p>
            <span class="empty-subtitle">¡Estás al día! 🎉</span>
          </div>

          <div v-else class="notifications-list">
            <TransitionGroup name="notif-list">
              <div
                v-for="notif in filteredNotifications"
                :key="notif.id"
                :class="['notification-item', notif.type, { unread: !notif.read }]"
                @click="markAsRead(notif.id)"
              >
                <div class="notif-icon-wrapper">
                  <div :class="['notif-icon', notif.type]">
                    <!-- Success Icon -->
                    <svg v-if="notif.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <!-- Warning Icon -->
                    <svg v-else-if="notif.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <!-- Error/Critical Icon -->
                    <svg v-else-if="notif.type === 'error' || notif.type === 'critical'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <!-- Info Icon -->
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                </div>

                <div class="notif-content">
                  <div class="notif-header">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-time">{{ formatTime(notif.timestamp) }}</span>
                  </div>
                  <p class="notif-message">{{ notif.message }}</p>
                  
                  <!-- Metadata details if available -->
                  <div v-if="notif.metadata?.items?.length" class="notif-details">
                    <div v-for="(item, idx) in notif.metadata.items.slice(0, 3)" :key="idx" class="notif-detail-item">
                      <span class="detail-name">{{ item.name || item.descripcion }}</span>
                      <span v-if="item.caducidad" class="detail-extra">
                        Cad: {{ item.caducidad }}
                        <span v-if="item.diasRestantes !== undefined" 
                              :class="['detail-dias', item.diasRestantes < 0 ? 'text-expired' : item.diasRestantes <= 15 ? 'text-critical' : item.diasRestantes <= 30 ? 'text-warning' : '']">
                          ({{ item.diasRestantes > 0 ? item.diasRestantes + 'd' : Math.abs(item.diasRestantes) + 'd atrás' }})
                        </span>
                      </span>
                      <span v-if="item.stock !== undefined" class="detail-extra stock">Stock: {{ item.stock }}</span>
                    </div>
                    <span v-if="notif.metadata.items.length > 3" class="notif-more">+{{ notif.metadata.items.length - 3 }} más...</span>
                  </div>
                </div>

                <div class="notif-actions">
                  <button
                    class="notif-action-btn mute-btn"
                    @click.stop="toggleMuteNotification(notif.id)"
                    :title="isNotificationMuted(notif.id) ? 'Activar notificaciones de este tipo' : 'Silenciar este tipo'"
                  >
                    <svg v-if="isNotificationMuted(notif.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>
                  <button
                    class="notif-action-btn close-btn"
                    @click.stop="removeNotification(notif.id)"
                    title="Eliminar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                
                <!-- Unread indicator dot -->
                <div v-if="!notif.read" class="unread-dot"></div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="panel-footer">
          <button class="footer-btn" @click="viewAllNotifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Ver historial completo
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import notificationStore from '@/stores/notificationStore'

const panelOpen = ref(false)
const activeFilter = ref('all')
// Track individually muted notifications
const mutedNotifications = ref(new Set(JSON.parse(localStorage.getItem('muted_notifications') || '[]')))

const notifications = computed(() => notificationStore.state.notifications)
const unreadCount = computed(() => notificationStore.unreadCount.value)
const isMuted = computed(() => notificationStore.state.isMuted)

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  if (activeFilter.value === 'unread') return notifications.value.filter(n => !n.read)
  if (activeFilter.value === 'warning') return notifications.value.filter(n => ['warning', 'error', 'critical'].includes(n.type))
  return notifications.value
})

function isNotificationMuted(id) {
  return mutedNotifications.value.has(id)
}

function toggleMuteNotification(id) {
  if (mutedNotifications.value.has(id)) {
    mutedNotifications.value.delete(id)
  } else {
    mutedNotifications.value.add(id)
  }
  // Save to localStorage
  localStorage.setItem('muted_notifications', JSON.stringify([...mutedNotifications.value]))
}

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

function viewAllNotifications() {
  // TODO: Navigate to notifications history page
  console.log('View all notifications')
  closePanel()
}

function formatTime(date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

// Close on escape key
function handleKeydown(e) {
  if (e.key === 'Escape' && panelOpen.value) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* === DARK LIQUID GLASS DESIGN === */

/* Wrapper */
.notification-bell-wrapper {
  position: relative;
  display: inline-flex;
}

/* Bell Button */
.bell-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.bell-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(46, 221, 90, 0.4);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 221, 90, 0.2);
}

.bell-icon-btn.has-unread {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  animation: bell-shake 2s ease infinite;
}

@keyframes bell-shake {
  0%, 90%, 100% { transform: rotate(0deg); }
  92%, 96% { transform: rotate(10deg); }
  94%, 98% { transform: rotate(-10deg); }
}

.bell-icon-btn.is-open {
  background: rgba(46, 221, 90, 0.2);
  border-color: rgba(46, 221, 90, 0.4);
  color: #2edd5a;
  box-shadow: 0 0 20px rgba(46, 221, 90, 0.3);
}

.bell-icon {
  transition: transform 0.3s ease;
}

.bell-icon-btn:hover .bell-icon {
  transform: rotate(10deg);
}

/* Unread Badge */
.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Mute Indicator */
.mute-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  color: #f87171;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 50%;
  padding: 2px;
}

/* Panel - Premium Glassmorphism con mejor opacidad */
.notification-panel {
  position: fixed;
  top: 90px;
  right: 16px;
  width: 420px;
  max-height: 680px;
  background: linear-gradient(145deg, 
    rgba(15, 23, 42, 0.98) 0%, 
    rgba(20, 30, 50, 0.97) 50%,
    rgba(15, 25, 45, 0.98) 100%);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 2px solid rgba(46, 221, 90, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.85),
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(46, 221, 90, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 250;
  overflow: hidden;
  animation: panel-appear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes panel-appear {
  from {
    opacity: 0;
    transform: translateY(-15px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Glass Header con mejor contraste */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(180deg, 
    rgba(30, 41, 59, 0.9) 0%, 
    rgba(20, 30, 48, 0.8) 100%);
  border-bottom: 2px solid rgba(46, 221, 90, 0.25);
  position: relative;
  flex-shrink: 0;
}

.panel-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(46, 221, 90, 0.6) 50%, 
    transparent 100%);
  filter: blur(1px);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-title svg {
  color: #2edd5a;
  filter: drop-shadow(0 0 10px rgba(46, 221, 90, 0.6));
  flex-shrink: 0;
}

.unread-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 
    0 4px 12px rgba(239, 68, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: count-pulse 2s ease infinite;
}

@keyframes count-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  transform: scale(1.05);
}

.action-btn.is-muted {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.action-btn.close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Filter Tabs con mejor espaciado */
.panel-filters {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.filter-tab {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.filter-tab:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.filter-tab.active {
  background: linear-gradient(135deg, #2edd5a 0%, #22c55e 100%);
  color: #0a1f15;
  font-weight: 700;
  box-shadow: 
    0 4px 12px rgba(46, 221, 90, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Panel Content con scroll mejorado */
.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 20px;
  background: rgba(10, 15, 25, 0.4);
  min-height: 200px;
  max-height: 440px;
  
  /* Scroll visible y estilizado */
  scrollbar-width: auto;
  scrollbar-color: rgba(46, 221, 90, 0.4) rgba(255, 255, 255, 0.05);
}

.panel-content::-webkit-scrollbar {
  width: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 16px 0;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin: 8px 0;
}

.panel-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(46, 221, 90, 0.5) 0%, 
    rgba(34, 197, 94, 0.5) 100%);
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(46, 221, 90, 0.7) 0%, 
    rgba(34, 197, 94, 0.7) 100%);
  box-shadow: 0 0 10px rgba(46, 221, 90, 0.4);
}

/* Empty State mejorado */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, 
    rgba(46, 221, 90, 0.1) 0%, 
    rgba(34, 197, 94, 0.05) 100%);
  border: 2px solid rgba(46, 221, 90, 0.2);
  color: rgba(46, 221, 90, 0.5);
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(46, 221, 90, 0.1);
}

.empty-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  line-height: 1.5;
}

/* Notifications List con mejor espaciado */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Notification Item con menos amontonamiento */
.notification-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.notification-item:hover {
  background: rgba(40, 51, 69, 0.7);
  border-color: rgba(46, 221, 90, 0.3);
  transform: translateX(4px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    -4px 0 0 rgba(46, 221, 90, 0.4);
}

.notification-item.unread {
  background: linear-gradient(135deg, 
    rgba(46, 221, 90, 0.12) 0%, 
    rgba(34, 197, 94, 0.08) 100%);
  border-color: rgba(46, 221, 90, 0.35);
  box-shadow: 
    0 2px 8px rgba(46, 221, 90, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Notification Icon con mejor tamaño */
.notif-icon-wrapper {
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.notif-icon.success {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.2) 0%, 
    rgba(5, 150, 105, 0.15) 100%);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.notif-icon.warning {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.2) 0%, 
    rgba(217, 119, 6, 0.15) 100%);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.notif-icon.error, .notif-icon.critical {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.2) 0%, 
    rgba(220, 38, 38, 0.15) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.notif-icon.info {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.2) 0%, 
    rgba(37, 99, 235, 0.15) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

/* Notification Content con mejor legibilidad */
.notif-content {
  flex: 1;
  min-width: 0;
  padding-right: 24px;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.notif-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.notif-time {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 500;
}

.notif-message {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}

/* Notif Details - Información adicional de items */
.notif-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.notif-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  font-size: 12px;
}

.detail-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.detail-extra {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-dias {
  font-weight: 600;
}

.detail-dias.text-expired {
  color: #fca5a5;
}

.detail-dias.text-critical {
  color: #fca5a5;
}

.detail-dias.text-warning {
  color: #fcd34d;
}

.detail-extra.stock {
  color: #7dd3fc;
}

.notif-more {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

/* Notif Actions - Mute and Close buttons */
.notif-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notif-actions {
  opacity: 1;
}

.notif-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.notif-action-btn:hover {
  transform: scale(1.1);
}

.mute-btn:hover {
  background: rgba(251, 191, 36, 0.3);
  border-color: rgba(251, 191, 36, 0.5);
  color: #fcd34d;
}

.mute-btn.is-muted {
  color: #fcd34d;
  background: rgba(251, 191, 36, 0.15);
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

/* Unread Dot */
.unread-dot {
  position: absolute;
  top: 16px;
  left: 6px;
  width: 8px;
  height: 8px;
  background: #2edd5a;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(46, 221, 90, 0.8);
  animation: dot-glow 2s ease infinite;
}

@keyframes dot-glow {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(0.85);
  }
}

/* Footer con mejor contraste */
.panel-footer {
  padding: 16px 24px;
  background: linear-gradient(180deg, 
    rgba(20, 30, 48, 0.8) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border-top: 2px solid rgba(46, 221, 90, 0.2);
  flex-shrink: 0;
}

.footer-btn {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, 
    rgba(46, 221, 90, 0.15) 0%, 
    rgba(34, 197, 94, 0.15) 100%);
  color: #2edd5a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(46, 221, 90, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-btn svg {
  transition: transform 0.2s ease;
}

.footer-btn:hover {
  background: linear-gradient(135deg, 
    rgba(46, 221, 90, 0.25) 0%, 
    rgba(34, 197, 94, 0.25) 100%);
  border-color: rgba(46, 221, 90, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 221, 90, 0.3);
}

.footer-btn:hover svg {
  transform: translateX(3px);
}

/* Panel Backdrop con mejor blur */
.panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 249;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  animation: backdrop-fade-in 0.2s ease;
}

@keyframes backdrop-fade-in {
  from { 
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

/* Transitions */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.notif-list-enter-active,
.notif-list-leave-active {
  transition: all 0.3s ease;
}

.notif-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.notif-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .notification-panel {
    width: 380px;
  }
}

@media (max-width: 480px) {
  .notification-panel {
    top: 70px;
    right: 8px;
    left: 8px;
    width: auto;
    max-height: calc(100vh - 80px);
  }
  
  .panel-header {
    padding: 14px 16px;
  }
  
  .header-title {
    font-size: 14px;
  }
  
  .action-btn {
    width: 30px;
    height: 30px;
  }
}
</style>
