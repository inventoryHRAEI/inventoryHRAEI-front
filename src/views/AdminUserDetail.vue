<template>
  <ActionPanel>
    <template #title>
      <div class="title-section">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Detalles del Usuario
      </div>
    </template>

    <div class="user-detail-container">
      <!-- Loading State -->
      <div v-if="loading" class="state-empty">
        <div class="spinner"></div>
        <p>Cargando usuario...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="state-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>Error al cargar usuario</h3>
        <p>{{ loadError }}</p>
        <button class="btn-action" @click="goBack">Volver</button>
      </div>

      <!-- User Not Found -->
      <div v-else-if="!user" class="state-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" />
        </svg>
        <h3>Usuario no encontrado</h3>
        <p>El usuario solicitado no existe</p>
        <button class="btn-action" @click="goBack">Volver</button>
      </div>

      <!-- User Details -->
      <div v-else class="user-details">
        <!-- User Header Card -->
        <div class="header-card">
          <button class="btn-back" @click="goBack" title="Volver">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="header-content">
            <div class="avatar-large">
              <img v-if="user.foto" :src="user.foto" :alt="user.nombre" />
              <div v-else class="avatar-fallback">{{ initials }}</div>
            </div>

            <div class="header-info">
              <h1 class="user-name">{{ user.nombre }}</h1>
              <p class="user-email">{{ user.email }}</p>
              
              <div class="badges-row">
                <span class="badge role-badge" :class="user.role">
                  <span class="badge-icon">👤</span>
                  {{ formatRole(user.role) }}
                </span>
                <span v-if="user.verificado" class="badge verified-badge">
                  <span class="badge-icon">✓</span>
                  Verificado
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Personal Information Section -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
                Información Personal
              </h3>
              <InfoPopover text="Datos básicos de registro del usuario en el sistema" position="top" />
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nombre Completo</span>
                <span class="info-value">{{ user.nombre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Correo Electrónico</span>
                <span class="info-value">
                  <a :href="`mailto:${user.email}`" class="email-link">{{ user.email }}</a>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Rol</span>
                <span class="info-value">{{ formatRole(user.role) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Estado Verificado</span>
                <span class="info-value">
                  <span class="status-badge" :class="{ active: user.verificado }">
                    {{ user.verificado ? 'Sí' : 'No' }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Account Status Section -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Estado de Cuenta
              </h3>
              <InfoPopover text="Estado y fechas importantes de la cuenta del usuario" position="top" />
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Estado de Acceso</span>
                <span class="info-value">
                  <span class="status-badge approved">
                    {{ user.account_status === 'approved' ? 'Aprobado' : 'Pendiente' }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha de Registro</span>
                <span class="info-value">{{ formatFullDate(user.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Última Actividad</span>
                <span class="info-value">{{ formatFullDate(user.updated_at) || 'Sin actividad' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ID de Usuario</span>
                <span class="info-value mono">{{ user.id }}</span>
              </div>
            </div>
          </div>

          <!-- Permissions Section -->
          <div class="info-card full-width">
            <div class="card-header">
              <h3 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Permisos y Acceso
              </h3>
              <InfoPopover text="Controla qué módulos y áreas puede acceder este usuario" position="top" />
            </div>

            <div class="permissions-content">
              <div v-if="user.role === 'admin'" class="admin-notice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p>Este usuario es administrador y tiene acceso total a todos los módulos del sistema.</p>
              </div>

              <div v-else class="modules-list">
                <div v-for="module in modulesList" :key="module.id" class="module-item">
                  <div class="module-info">
                    <h4 class="module-name">{{ module.label }}</h4>
                    <p class="module-desc">{{ module.description }}</p>
                  </div>
                  <div class="module-access">
                    <span class="access-badge" :class="getAccessClass(user, module.id)">
                      {{ getAccessLabel(user, module.id) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="user.role !== 'admin'" class="section-actions">
              <router-link :to="{ name: 'admin-users' }" class="btn-edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar Permisos
              </router-link>
            </div>
          </div>

          <!-- Activity Section -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8 10 1 17" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Sesiones
              </h3>
              <InfoPopover text="Información de acceso y actividad del usuario" position="top" />
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Primer Acceso</span>
                <span class="info-value">{{ formatFullDate(user.first_login) || 'Nunca' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Último Acceso</span>
                <span class="info-value">{{ formatFullDate(user.last_login) || 'Nunca' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total de Accesos</span>
                <span class="info-value">{{ user.login_count || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Estado Actual</span>
                <span class="info-value">
                  <span class="status-badge" :class="isOnline(user.last_login) ? 'active' : 'inactive'">
                    {{ isOnline(user.last_login) ? 'En línea' : 'Offline' }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
                Acciones
              </h3>
            </div>

            <div class="actions-list">
              <button class="action-btn edit-btn" @click="editUser" title="Editar información del usuario">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
              <button class="action-btn role-btn" @click="changeRole" title="Cambiar rol del usuario">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z" />
                </svg>
                {{ user.role === 'admin' ? 'Degradar' : 'Promover' }}
              </button>
              <button class="action-btn reset-btn" @click="resetPassword" title="Enviar enlace para resetear contraseña">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1v6m8-4l-4 4m-16 0l4-4M3 14c0 1.657.895 3.146 2.237 3.942.68.397 1.43.666 2.237.777A7.964 7.964 0 0 0 12 23c4.418 0 8-3.582 8-8" />
                </svg>
                Resetear Contraseña
              </button>
              <button class="action-btn delete-btn" @click="deleteUser" title="Eliminar este usuario del sistema">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ActionPanel>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionPanel from '@/components/ActionPanel.vue'
import InfoPopover from '@/components/InfoPopover.vue'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { formatRole } from '@/utils/roles'
import notifier from '@/utils/notifier'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const user = ref(null)
const loading = ref(false)
const loadError = ref(null)

const modulesList = [
  { id: 'biomedical', label: 'Inventario Biomédica', description: 'Gestión de equipos biomédicos' },
  { id: 'orders_entrada', label: 'Órdenes de Entrada', description: 'Registro de ingresos al inventario' },
  { id: 'orders_salida', label: 'Órdenes de Salida', description: 'Registro de egresos del inventario' },
  { id: 'orders_resguardo', label: 'Órdenes de Resguardo', description: 'Gestión de custodia de equipos' },
  { id: 'orders_servicio', label: 'Órdenes de Servicio', description: 'Gestión de mantenimiento técnico' }
]

const initials = computed(() => {
  if (!user.value?.nombre) return 'U'
  return user.value.nombre
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

function formatFullDate(dateStr) {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

function isOnline(lastLogin) {
  if (!lastLogin) return false
  const date = new Date(lastLogin)
  const now = new Date()
  const diff = now - date
  return diff < 15 * 60 * 1000 // menos de 15 minutos
}

function getAccessClass(user, moduleId) {
  if (user.role === 'admin') return 'full-access'
  return 'no-access'
}

function getAccessLabel(user, moduleId) {
  if (user.role === 'admin') return 'Acceso Total'
  return 'Ver en Edición'
}

async function load() {
  loading.value = true
  loadError.value = null
  try {
    const res = await fetch(`/api/auth/users/${id}`)
    if (res.ok) {
      user.value = await res.json()
    } else {
      const listRes = await fetch('/api/auth/users')
      if (listRes.ok) {
        const list = await listRes.json()
        user.value = Array.isArray(list) ? list.find(x => String(x.id) === String(id)) : null
      }
    }
    if (!user.value) loadError.value = 'Usuario no encontrado'
  } catch (e) {
    loadError.value = e.message || 'Error al cargar usuario'
  } finally {
    loading.value = false
  }
}

function goBack() {
  try {
    navigateAndRefresh(router, { name: 'admin-users' })
  } catch (e) {
    console.error('Error:', e)
  }
}

function editUser() {
  notifier.info('Función en desarrollo')
}

function changeRole() {
  notifier.info('Función en desarrollo')
}

function resetPassword() {
  notifier.info('Función en desarrollo')
}

function deleteUser() {
  notifier.info('Función en desarrollo')
}

onMounted(load)
</script>

<style scoped>
.user-detail-container {
  padding: 24px;
}

/* States */
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Header Card */
.header-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.btn-back {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-back:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-info {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.user-email {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.badges-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.verified-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-icon {
  font-size: 14px;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Info Cards */
.info-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title svg {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.5);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.email-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.email-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.mono {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge.active,
.status-badge.approved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
}

/* Admin Notice */
.admin-notice {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.admin-notice svg {
  color: #667eea;
  flex-shrink: 0;
}

.admin-notice p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* Modules List */
.permissions-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.module-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.module-info {
  flex: 1;
}

.module-name {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.module-desc {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.access-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
}

.access-badge.full-access {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

/* Section Actions */
.section-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-edit {
  flex: 1;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.5);
}

/* Actions List */
.actions-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.edit-btn {
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
}

.role-btn {
  border-color: rgba(249, 115, 22, 0.3);
  color: #f97316;
}

.role-btn:hover {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.5);
}

.reset-btn {
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.reset-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
}

.delete-btn {
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .header-card {
    flex-direction: column;
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .user-detail-container {
    padding: 16px;
  }

  .header-card {
    padding: 16px;
  }

  .avatar-large {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .user-name {
    font-size: 20px;
  }

  .info-card {
    padding: 16px;
  }
}
</style>
