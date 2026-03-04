<template>
  <div class="account-validation-page">
    <!-- Breadcrumbs -->
    <Breadcrumbs />

    <!-- Page Container Glass -->
    <div class="page-container">
      <!-- Header Section -->
      <div class="page-header">
        <button class="back-button" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        
        <div class="header-content">
          <div class="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>
          <div class="header-text">
            <h1>Gestión de Cuentas</h1>
            <p class="header-subtitle">Administra las solicitudes de nuevos usuarios</p>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="glass-card">
        <!-- Empty State: Sin cuentas pendientes -->
        <div v-if="!loading && items.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M16 11h6M12 14v4" />
            </svg>
          </div>
          <h3>No hay cuentas pendientes</h3>
          <p>Todos los usuarios han sido procesados.</p>
          <button class="btn-refresh" @click="loadPending">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2-8.94" />
            </svg>
            Refrescar
          </button>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando cuentas pendientes...</p>
        </div>

        <!-- Table with pending accounts -->
        <div v-else class="table-container">
          <!-- Header with controls -->
          <div class="table-header">
            <div class="header-left">
              <h3 class="table-title">
                Cuentas Pendientes
                <span class="count-badge">{{ items.length }}</span>
              </h3>
              <div class="info-popover" @mouseenter="showTooltip = 'accounts'" @mouseleave="showTooltip = null">
                <button class="info-btn">?</button>
                <div v-if="showTooltip === 'accounts'" class="tooltip">
                  <p>Lista de usuarios que se han registrado recientemente en el sistema. Los usuarios pueden acceder una vez que completen el registro.</p>
                </div>
              </div>
            </div>
            <button class="btn-refresh" @click="loadPending">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2-8.94" />
              </svg>
              Refrescar
            </button>
          </div>

          <!-- Table -->
          <div class="table-wrapper">
            <table class="accounts-table">
              <thead>
                <tr>
                  <th>
                    <span class="th-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Nombre
                    </span>
                  </th>
                  <th>
                    <span class="th-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email
                    </span>
                  </th>
                  <th>
                    <span class="th-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Registrado
                    </span>
                  </th>
                  <th class="actions-col">
                    <span class="th-label">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in items" :key="it.notification_id" class="table-row">
                  <td class="name-cell">
                    <div class="user-info-mini">
                      <div class="avatar-mini">
                        {{ getInitials(it.user_name) }}
                      </div>
                      <span class="user-name">{{ it.user_name || '—' }}</span>
                    </div>
                  </td>
                  <td class="email-cell">
                    <a :href="`mailto:${it.user_email}`" class="email-link">{{ it.user_email }}</a>
                  </td>
                  <td class="date-cell">{{ formatDate(it.created_at) }}</td>
                  <td class="actions-cell">
                    <button
                      class="action-btn action-approve"
                      @click="approve(it.notification_id)"
                      title="El usuario podrá acceder al sistema"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Aprobar
                    </button>
                    <button class="action-btn action-delete" @click="deleteAccount(it.notification_id)" title="Eliminar esta solicitud">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast-fade">
      <div v-if="showNotification" class="toast-notification" :class="'toast-' + notificationType">
        <div class="toast-content">
          <svg v-if="notificationType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else-if="notificationType === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span class="toast-message">{{ notificationMessage }}</span>
        </div>
        <button class="toast-close" @click="showNotification = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { authedFetch } from '@/utils/api.js'
import { showAlert } from '@/utils/sweetAlertConfig'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const showTooltip = ref(null)

// Toast notifications
const notificationMessage = ref('')
const showNotification = ref(false)
const notificationType = ref('success')

function showNotificationToast(message, type = 'success') {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 4000)
}

function goBack() {
  router.back()
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase()
}

function formatDate(s) {
  if (!s) return '—'
  try {
    const date = new Date(s)
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return s
  }
}

async function loadPending() {
  loading.value = true
  try {
    const res = await authedFetch('/api/account-validation/pending')
    if (res.status === 401 || res.status === 403) {
      showNotificationToast('Tu sesión expiró o no tienes permisos para ver esta sección.', 'error')
      try { window.location.href = '/login' } catch {}
      return
    }
    if (!res.ok) throw new Error('Error al cargar cuentas')
    items.value = await res.json()
  } catch (e) {
    items.value = []
    showNotificationToast(e.message || 'No se pudo cargar las cuentas pendientes', 'error')
  } finally {
    loading.value = false
  }
}

async function approve(id) {
  try {
    const confirmed = await showAlert({
      icon: 'warning',
      title: 'Aprobar cuenta',
      text: 'El usuario podrá acceder al sistema inmediatamente.',
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar'
    })
    if (!confirmed.isConfirmed) return

    const res = await authedFetch(`/api/account-validation/${id}/approve`, { method: 'POST' })
    if (res.status === 401 || res.status === 403) {
      showNotificationToast('Tu sesión expiró. Por favor inicia sesión nuevamente.', 'error')
      try { window.location.href = '/login' } catch {}
      return
    }
    if (!res.ok) throw new Error('No se pudo aprobar la cuenta')
    showNotificationToast('Cuenta aprobada exitosamente', 'success')
    await loadPending()
  } catch (e) {
    showNotificationToast(e.message || 'No se pudo aprobar la cuenta', 'error')
  }
}

async function deleteAccount(id) {
  try {
    const confirmed = await showAlert({
      icon: 'warning',
      title: 'Eliminar solicitud',
      text: '¿Estás seguro? Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    })
    if (!confirmed.isConfirmed) return

    const res = await authedFetch(`/api/account-validation/${id}`, { method: 'DELETE' })
    if (res.status === 401 || res.status === 403) {
      showNotificationToast('Tu sesión expiró. Por favor inicia sesión nuevamente.', 'error')
      try { window.location.href = '/login' } catch {}
      return
    }
    if (!res.ok) throw new Error('No se pudo eliminar')
    showNotificationToast('Solicitud eliminada', 'success')
    await loadPending()
  } catch (e) {
    showNotificationToast(e.message || 'No se pudo eliminar la solicitud', 'error')
  }
}

onMounted(loadPending)
</script>

<style scoped>
.account-validation-page {
  min-height: 100vh;
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page Container Glass */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(13, 20, 35, 0.7);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 28px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.12));
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #818cf8;
}

.header-text h1 {
  margin: 0 0 4px 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  font-family: 'Poppins', 'Source Sans 3', sans-serif;
}

.header-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Glass Card */
.glass-card {
  padding: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.2);
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.empty-state p {
  margin: 0 0 28px 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.45);
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Table Container */
.table-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.015);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.table-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Poppins', 'Source Sans 3', sans-serif;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15));
  color: #a5b4fc;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

/* Info Popover */
.info-popover {
  position: relative;
  display: inline-flex;
}

.info-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.45);
  cursor: help;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-btn:hover {
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  background: rgba(15, 23, 42, 0.95);
  color: rgba(255, 255, 255, 0.9);
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 13px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.tooltip p {
  margin: 0;
  line-height: 1.5;
}

/* Table Wrapper */
.table-wrapper {
  overflow-x: auto;
}

/* Table Styles */
.accounts-table {
  width: 100%;
  border-collapse: collapse;
}

.accounts-table thead {
  background: rgba(255, 255, 255, 0.02);
}

.accounts-table th {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

.th-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.accounts-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.table-row {
  transition: background 0.2s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* Cell Styles */
.name-cell {
  min-width: 200px;
}

.user-info-mini {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.user-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.email-cell {
  min-width: 220px;
}

.email-link {
  color: #818cf8;
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 500;
}

.email-link:hover {
  color: #a5b4fc;
  text-decoration: underline;
}

.date-cell {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  white-space: nowrap;
}

.actions-col {
  text-align: right;
}

.actions-cell {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.action-approve {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.12));
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.action-approve:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.2));
  border-color: rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.action-delete {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(220, 38, 38, 0.12));
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.action-delete:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.2));
  border-color: rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Toast Notifications */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  animation: toast-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.toast-success {
  border-left: 3px solid #22c55e;
}

.toast-success .toast-content svg {
  color: #22c55e;
}

.toast-error {
  border-left: 3px solid #ef4444;
}

.toast-error .toast-content svg {
  color: #ef4444;
}

.toast-info {
  border-left: 3px solid #3b82f6;
}

.toast-info .toast-content svg {
  color: #3b82f6;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .account-validation-page {
    padding: 12px;
  }

  .page-container {
    border-radius: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .back-button {
    order: -1;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-text h1 {
    font-size: 1.4rem;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }

  .accounts-table {
    font-size: 13px;
  }

  .accounts-table th,
  .accounts-table td {
    padding: 12px 14px;
  }

  .actions-cell {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .tooltip {
    white-space: normal;
    max-width: 220px;
  }

  .user-info-mini {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .avatar-mini {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .toast-notification {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(20px)) {
  .page-container {
    background: rgba(13, 20, 35, 0.92);
  }
}
</style>
