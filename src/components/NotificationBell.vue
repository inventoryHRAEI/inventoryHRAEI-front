<template>
  <div class="notification-bell-wrapper">
    <!-- Bell Icon Button -->
    <button
      class="bell-icon-btn"
      :class="{ 'has-unread': unreadCount > 0, 'is-open': panelOpen, 'is-admin': isAdmin }"
      @click="togglePanel"
      :aria-label="`Notificaciones (${unreadCount} nuevas)`"
    >
      <div class="bell-ring-container">
        <svg class="bell-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </div>
      <div v-if="unreadCount > 0" class="bell-glow"></div>
    </button>

    <!-- Backdrop -->
    <div v-if="panelOpen" class="panel-backdrop" @click="closePanel" />
    
    <!-- Notification Panel -->
    <transition name="panel-zoom">
      <div v-if="panelOpen" class="notification-panel" :class="{ 'admin-panel': isAdmin }" @click.stop>
        <!-- Premium Header -->
        <div class="panel-header">
          <div class="header-main">
            <h3>Centro de Notificaciones</h3>
            <div class="header-badges">
              <span v-if="unreadCount > 0" class="count-pill">{{ unreadCount }} nuevas</span>
              <span class="role-pill">{{ isAdmin ? 'Admin View' : 'User View' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <button v-if="unreadCount > 0" class="icon-action" @click="markAllAsRead" title="Marcar todo como leído">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            </button>
            <button class="icon-action" @click="clearAll" title="Limpiar todas">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <button class="icon-action close" @click="closePanel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Role-based Categories -->
        <div class="panel-tabs">
          <button 
            v-for="tab in availableTabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" width="14" height="14" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Content -->
        <div class="panel-body" ref="scrollContainer">
          <!-- Special Admin Section for Edit Requests -->
          <div v-if="activeTab === 'alerts' && isAdmin && pendingEditRequests > 0" class="admin-alert-section">
            <div class="admin-card rainbow-border" @click="goEditRequests">
              <div class="card-icon">⚡</div>
              <div class="card-info">
                <span class="card-title">Solicitudes de Edición</span>
                <span class="card-desc">Hay {{ pendingEditRequests }} solicitudes pendientes de revisión.</span>
              </div>
              <div class="card-arrow">→</div>
            </div>
          </div>

          <div v-if="displayNotifications.length === 0" class="empty-state">
            <div class="empty-visual">
              <div class="pulse-ring"></div>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h4>Todo en orden</h4>
            <p>No tienes notificaciones en esta categoría.</p>
          </div>

          <div v-else class="notifications-feed">
            <TransitionGroup name="list-stagger">
              <div
                v-for="(notif, idx) in displayNotifications"
                :key="notif.id"
                class="notif-card"
                :class="[notif.type, { unread: !notif.read }]"
                :style="{ '--index': idx }"
                @click="markAsRead(notif.id)"
              >
                <div class="notif-indicator"></div>
                <div class="notif-icon-box">
                  <component :is="getNotifIcon(notif.type)" />
                </div>
                <div class="notif-main">
                  <div class="notif-top">
                    <span class="notif-category">{{ getCategoryLabel(notif) }}</span>
                    <span class="notif-time">{{ formatTime(notif.timestamp) }}</span>
                  </div>
                  <h4 class="notif-title">{{ notif.title }}</h4>
                  <p class="notif-msg">{{ notif.message }}</p>
                  
                  <!-- Metadata items -->
                  <div v-if="notif.metadata?.items" class="notif-metadata">
                    <div v-for="item in notif.metadata.items.slice(0,2)" :key="item.id || item.nombre" class="meta-item">
                      <span class="meta-dot"></span>
                      {{ item.nombre || item.descripcion }}
                    </div>
                  </div>
                </div>
                <button class="notif-close" @click.stop="removeNotification(notif.id)">×</button>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Footer -->
        <div class="panel-footer">
          <button class="history-btn" @click="viewHistory">
            Explorar historial completo
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import notificationStore from '@/stores/notificationStore'
import { authedFetch } from '@/utils/api'

const router = useRouter()
const panelOpen = ref(false)
const activeTab = ref('activity')
const pendingEditRequests = ref(0)
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const isAdmin = computed(() => user.value?.role?.toLowerCase() === 'admin')
const notifications = computed(() => notificationStore.state.notifications)
const unreadCount = computed(() => notificationStore.unreadCount.value)

// Tab definitions
const availableTabs = computed(() => {
  const tabs = [
    { 
      id: 'activity', 
      label: 'Mi Actividad', 
      icon: IconUser,
      count: notifications.value.filter(n => !n.read && n.category === 'activity').length 
    },
    { 
      id: 'alerts', 
      label: 'Alertas', 
      icon: IconAlert,
      count: notifications.value.filter(n => !n.read && n.category === 'alert').length + (isAdmin.value ? pendingEditRequests.value : 0)
    }
  ]
  return tabs
})

const displayNotifications = computed(() => {
  return notifications.value.filter(n => {
    if (activeTab.value === 'activity') return n.category === 'activity'
    if (activeTab.value === 'alerts') return n.category === 'alert' || ['warning', 'error', 'critical'].includes(n.type)
    return true
  })
})

// Icons
const IconUser = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
const IconAlert = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' }

function getNotifIcon(type) {
  if (type === 'success') return { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' }
  if (type === 'warning') return IconAlert
  return { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' }
}

function getCategoryLabel(notif) {
  if (notif.category === 'activity') return 'Actividad'
  if (notif.type === 'critical') return 'Crítico'
  return 'Sistema'
}

async function fetchEditRequests() {
  if (!isAdmin.value) return
  try {
    const res = await authedFetch('/api/edit-requests')
    if (res.ok) {
      const data = await res.json()
      pendingEditRequests.value = data.filter(r => r.status === 'pending').length
    }
  } catch (e) {}
}

function togglePanel() {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) {
    fetchEditRequests()
  }
}

function closePanel() {
  panelOpen.value = false
}

function markAsRead(id) {
  notificationStore.markAsRead(id)
}

function removeNotification(id) {
  notificationStore.removeNotification(id)
}

function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function clearAll() {
  if (confirm('¿Deseas eliminar todas las notificaciones?')) {
    notificationStore.clearAll()
  }
}

function goEditRequests() {
  router.push({ name: 'admin-edit-requests' })
  closePanel()
}

function viewHistory() {
  console.log('History logic here')
  closePanel()
}

function formatTime(date) {
  if (!(date instanceof Date)) date = new Date(date)
  const diff = (new Date() - date) / 1000
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `${Math.floor(diff/60)}m`
  if (diff < 86400) return `${Math.floor(diff/3600)}h`
  return date.toLocaleDateString()
}

// Watch for storage changes to sync user role
onMounted(() => {
  window.addEventListener('storage', () => {
    user.value = JSON.parse(localStorage.getItem('user') || '{}')
  })
  if (isAdmin.value) fetchEditRequests()
})
</script>

<style scoped>
.notification-bell-wrapper {
  position: relative;
  display: inline-flex;
}

/* Bell Button Premium */
.bell-icon-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: visible;
}

.bell-icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  color: #fff;
  border-color: rgba(46, 221, 90, 0.4);
}

.bell-icon-btn.is-open {
  background: rgba(46, 221, 90, 0.15);
  color: #2edd5a;
  border-color: rgba(46, 221, 90, 0.5);
}

.bell-ring-container {
  position: relative;
  z-index: 2;
}

.bell-icon-btn.has-unread .bell-icon {
  animation: bell-swing 2s ease infinite;
}

@keyframes bell-swing {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-12deg); }
  60% { transform: rotate(8deg); }
  80% { transform: rotate(-4deg); }
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4d6d;
  color: white;
  font-size: 10px;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
  box-shadow: 0 4px 10px rgba(255, 77, 109, 0.4);
}

/* Panel Design */
.notification-panel {
  position: absolute;
  top: calc(100% + 15px);
  right: -10px;
  width: 400px;
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  transform-origin: top right;
}

.admin-panel {
  border-color: rgba(100, 200, 255, 0.3);
}

/* Header */
.panel-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-main h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.header-badges {
  display: flex;
  gap: 6px;
}

.count-pill, .role-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.count-pill { background: rgba(255, 77, 109, 0.15); color: #ff4d6d; }
.role-pill { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.6); }

.header-actions { display: flex; gap: 8px; }
.icon-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-action:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.icon-action.close:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }

/* Tabs */
.panel-tabs {
  display: flex;
  padding: 8px;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.tab-count {
  background: #2edd5a;
  color: #0a1f15;
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 4px;
}

/* Body */
.panel-body {
  max-height: 440px;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.panel-body::-webkit-scrollbar { width: 6px; }
.panel-body::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

/* Admin Alert Card */
.admin-alert-section { margin-bottom: 20px; }
.admin-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(155, 89, 182, 0.1) 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(100, 200, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.admin-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  transform: translateX(-100%);
  animation: shine 3s infinite;
}

@keyframes shine { 100% { transform: translateX(100%); } }

.admin-card:hover { transform: translateY(-2px); border-color: rgba(100, 200, 255, 0.4); box-shadow: 0 8px 25px rgba(100, 200, 255, 0.2); }

.card-icon { font-size: 24px; filter: drop-shadow(0 0 8px rgba(100, 200, 255, 0.6)); }
.card-info { flex: 1; }
.card-title { display: block; font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.card-desc { font-size: 11px; color: rgba(255, 255, 255, 0.6); }
.card-arrow { color: rgba(100, 200, 255, 0.6); font-weight: 700; }

/* Notif Cards */
.notifications-feed { display: flex; flex-direction: column; gap: 12px; }
.notif-card {
  position: relative;
  display: flex;
  gap: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.notif-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.notif-card.unread { 
  background: rgba(46, 221, 90, 0.04); 
  border-color: rgba(46, 221, 90, 0.15); 
}

.notif-indicator {
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.unread .notif-indicator { background: #2edd5a; box-shadow: 0 0 12px rgba(46, 221, 90, 0.6); }

.notif-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.success .notif-icon-box { background: rgba(46, 221, 90, 0.1); color: #2edd5a; }
.warning .notif-icon-box { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.critical .notif-icon-box { background: rgba(239, 68, 68, 0.1); color: #ff4d6d; }

.notif-main { flex: 1; min-width: 0; }
.notif-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.notif-category { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255, 255, 255, 0.3); }
.notif-time { font-size: 11px; color: rgba(255, 255, 255, 0.4); }
.notif-title { margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #fff; }
.notif-msg { margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.65); line-height: 1.5; }

.notif-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
}

.meta-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: 0.6; }

.notif-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.2);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.notif-card:hover .notif-close { opacity: 1; }
.notif-close:hover { background: rgba(239, 68, 68, 0.15); color: #ff4d6d; }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-visual {
  position: relative;
  margin-bottom: 24px;
  color: rgba(46, 221, 90, 0.2);
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid rgba(46, 221, 90, 0.1);
  border-radius: 50%;
  animation: pulse-out 2s infinite;
}

@keyframes pulse-out {
  0% { width: 40px; height: 40px; opacity: 1; }
  100% { width: 120px; height: 120px; opacity: 0; }
}

.empty-state h4 { color: #fff; margin: 0 0 8px 0; }
.empty-state p { font-size: 13px; color: rgba(255, 255, 255, 0.4); margin: 0; }

/* Footer */
.panel-footer {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
}

.history-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; border-color: rgba(255, 255, 255, 0.2); }

/* Animations */
.panel-zoom-enter-active, .panel-zoom-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.panel-zoom-enter-from, .panel-zoom-leave-to { opacity: 0; transform: scale(0.9) translateY(-10px); }

.list-stagger-enter-active { transition: all 0.4s ease; transition-delay: calc(0.05s * var(--index)); }
.list-stagger-enter-from { opacity: 0; transform: translateX(20px); }

.panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0,0,0,0.2);
}
</style>
