<template>
  <ActionPanel>
    <template #title>
      <div class="title-section">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        Administración de Usuarios
      </div>
    </template>

    <div class="admin-users-container">
      <!-- Header con acciones -->
      <div class="admin-header">
        <div class="header-info">
          <h2>Gestión de Usuarios y Permisos</h2>
          <p>Total de usuarios: <strong>{{ users.length }}</strong> | Administradores: <strong>{{ adminCount }}</strong></p>
        </div>
        <button class="btn-back" @click="goBack" title="Volver al dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
      </div>

      <!-- Panel de búsqueda y filtros -->
      <div class="search-filters">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por nombre o email..."
            @input="filterUsers"
          />
        </div>
        <div class="filter-chips">
          <button 
            :class="{ active: roleFilter === 'all' }" 
            @click="roleFilter = 'all'; filterUsers()"
          >
            Todos
          </button>
          <button 
            :class="{ active: roleFilter === 'admin' }" 
            @click="roleFilter = 'admin'; filterUsers()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z"/>
            </svg>
            Administradores
          </button>
          <button 
            :class="{ active: roleFilter === 'user' }" 
            @click="roleFilter = 'user'; filterUsers()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Usuarios
          </button>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th style="width: 50px"></th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acceso a Módulos</th>
              <th style="width: 120px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="avatar-cell">
                <div class="avatar-mini">
                  <img v-if="user.foto" :src="user.foto" :alt="user.nombre" />
                  <span v-else>{{ getInitials(user.nombre) }}</span>
                </div>
              </td>
              <td class="name-cell">
                <div class="name-info">
                  <div class="name">{{ user.nombre }}</div>
                </div>
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td class="role-cell">
                <div class="role-badge" :class="user.role">
                  <svg v-if="user.role === 'admin'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z"/>
                  </svg>
                  <span>{{ formatRole(user.role) }}</span>
                </div>
              </td>
              <td class="access-cell">
                <div class="access-modules">
                  <span v-if="user.role === 'admin'" class="module-tag admin-access">Inventario Biomédico</span>
                  <span v-else class="module-tag">Según permisos</span>
                </div>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-icon" 
                    @click="openModifyPermissions(user)"
                    :title="`Editar permisos de ${user.nombre}`"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    class="btn-icon role-toggle"
                    @click="toggleAdminRole(user)"
                    :title="`Cambiar rol de ${user.nombre}`"
                  >
                    <svg v-if="user.role === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <p>No se encontraron usuarios con los criterios de búsqueda.</p>
        </div>
      </div>
    </div>

    <!-- Modal: Modificar permisos -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModifyModal" class="modal-overlay" @click="closeModify">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Permisos de {{ modifyingUser?.nombre }}
              </h3>
              <button class="btn-close" @click="closeModify">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div v-if="modifyingUser?.role === 'admin'" class="admin-notice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <div>
                  <strong>Nota:</strong> Los administradores tienen acceso automático a todos los módulos, incluyendo Inventario Biomédico.
                </div>
              </div>

              <div class="permissions-grid">
                <div class="permission-item" v-for="module in accessibleModules" :key="module.id">
                  <label class="permission-checkbox">
                    <input 
                      type="checkbox" 
                      v-model="modPermissions[module.id]"
                      :disabled="modifyingUser?.role === 'admin'"
                    />
                    <span class="checkbox-custom"></span>
                  </label>
                  <div class="permission-info">
                    <div class="module-icon">
                      <svg v-html="module.icon" width="20" height="20"></svg>
                    </div>
                    <div class="module-details">
                      <div class="module-name">{{ module.name }}</div>
                      <div class="module-desc">{{ module.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModify">Cancelar</button>
              <button 
                class="btn btn-primary" 
                @click="savePermissions"
                :disabled="modifyingUser?.role === 'admin'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal: Confirmación de cambio de rol -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRoleConfirmModal" class="modal-overlay" @click="closeRoleConfirm">
          <div class="modal-content compact" @click.stop>
            <div class="modal-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z"/>
                </svg>
                Cambiar Rol de Usuario
              </h3>
              <button class="btn-close" @click="closeRoleConfirm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="role-change-info">
                <p v-if="roleChangeTarget?.newRole === 'admin'" class="info-text admin-promotion">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z"/>
                  </svg>
                  <span>
                    Se promoverá a <strong>{{ roleChangeTarget?.user?.nombre }}</strong> a <strong>Administrador</strong>. 
                    Tendrá acceso automático a <strong>Inventario Biomédico</strong> y todas las funciones administrativas.
                  </span>
                </p>
                <p v-else class="info-text user-demotion">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
                  </svg>
                  <span>
                    Se degradará a <strong>{{ roleChangeTarget?.user?.nombre }}</strong> a <strong>Usuario Regular</strong>. 
                    Perderá acceso administrativo.
                  </span>
                </p>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeRoleConfirm">Cancelar</button>
              <button 
                class="btn btn-danger" 
                @click="confirmRoleChange"
                :class="{ 'btn-success': roleChangeTarget?.newRole === 'admin' }"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast de notificaciones -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div v-if="showToast" :class="['toast', toastType]">
          <div class="toast-content">
            <svg v-if="toastType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <svg v-else-if="toastType === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{{ toastMessage }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { formatRole } from '@/utils/roles'

const router = useRouter()
const currentUser = JSON.parse(localStorage.getItem('user') || 'null') || {}
const isAdmin = currentUser?.role === 'admin'

// Estado principal
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('all')
const filteredUsers = ref([])

// Modales
const showModifyModal = ref(false)
const showRoleConfirmModal = ref(false)
const modifyingUser = ref(null)
const roleChangeTarget = ref(null)
const modPermissions = ref({})

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Acceso a módulos (órdenes)
const accessibleModules = ref([
  {
    id: 'biomedical',
    name: 'Inventario Biomédico',
    description: 'Acceso al inventario y órdenes de equipos biomédicos',
    icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>'
  },
  {
    id: 'orders-entrada',
    name: 'Órdenes de Entrada',
    description: 'Crear y gestionar órdenes de entrada de equipos',
    icon: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'
  },
  {
    id: 'orders-salida',
    name: 'Órdenes de Salida',
    description: 'Crear y gestionar órdenes de salida de equipos',
    icon: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'
  },
  {
    id: 'orders-resguardo',
    name: 'Órdenes de Resguardo',
    description: 'Gestionar resguardos y custodia de equipos',
    icon: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'
  },
  {
    id: 'orders-servicio',
    name: 'Órdenes de Servicio',
    description: 'Crear y gestionar órdenes de servicio técnico',
    icon: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'
  }
])

// Computadas
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)

// Funciones
function goBack() {
  try {
    navigateAndRefresh(router, { name: 'dashboard' })
  } catch (e) {
    console.error('Error navigating back:', e)
  }
}

function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function filterUsers() {
  let result = users.value

  if (roleFilter.value !== 'all') {
    result = result.filter(u => u.role === roleFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u => 
      (u.nombre && u.nombre.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    )
  }

  filteredUsers.value = result
}

function openModifyPermissions(user) {
  modifyingUser.value = user
  const perms = {}
  accessibleModules.value.forEach(m => {
    perms[m.id] = user.role === 'admin' || (user.permissions && user.permissions.includes(m.id))
  })
  modPermissions.value = perms
  showModifyModal.value = true
}

function closeModify() {
  showModifyModal.value = false
  modifyingUser.value = null
  modPermissions.value = {}
}

async function savePermissions() {
  if (!modifyingUser.value) return

  try {
    const selectedPerms = Object.entries(modPermissions.value)
      .filter(([, checked]) => checked)
      .map(([id]) => id)

    const payload = {
      email: modifyingUser.value.email,
      permissions: selectedPerms
    }

    console.log('🔧 Guardando permisos:', payload)

    const { sanitizeObject } = await import('@/utils/sanitizer.js')
    const res = await fetch('/api/auth/user-permissions', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(sanitizeObject(payload))
    })

    const data = await res.json()
    console.log('✅ Respuesta backend:', data, 'Status:', res.status)

    if (!res.ok) {
      throw new Error(data.msg || `Error: ${res.status} ${res.statusText}`)
    }

    showToastMessage('Permisos actualizados correctamente', 'success')
    await loadUsers()
    closeModify()
  } catch (e) {
    console.error('❌ Error guardando permisos:', e)
    showToastMessage(e.message || 'Error actualizando permisos', 'error')
  }
}

function toggleAdminRole(user) {
  roleChangeTarget.value = {
    user,
    newRole: user.role === 'admin' ? 'user' : 'admin'
  }
  showRoleConfirmModal.value = true
}

function closeRoleConfirm() {
  showRoleConfirmModal.value = false
  roleChangeTarget.value = null
}

async function confirmRoleChange() {
  if (!roleChangeTarget.value) return

  try {
    const { user, newRole } = roleChangeTarget.value
    
    const { sanitizeObject } = await import('@/utils/sanitizer.js')
    const res = await fetch(`/api/auth/users/${user.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizeObject({ role: newRole }))
    })

    if (!res.ok) throw new Error('Error actualizando rol')

    // Si es promoción a admin, asignar automáticamente permisos de inventario biomédico
    if (newRole === 'admin') {
      try {
        await fetch('/api/auth/user-permissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify((await import('@/utils/sanitizer.js')).sanitizeObject({
            email: user.email,
            permissions: ['biomedical', 'orders-entrada', 'orders-salida', 'orders-resguardo', 'orders-servicio']
          }))
        })
      } catch (e) {
        console.warn('No se pudieron asignar permisos de admin:', e)
      }
    }

    const action = newRole === 'admin' ? 'promovido a' : 'degradado a'
    showToastMessage(`${user.nombre} ${action} ${formatRole(newRole).toLowerCase()}`, 'success')
    
    await loadUsers()
    closeRoleConfirm()
  } catch (e) {
    showToastMessage(e.message || 'Error actualizando rol', 'error')
  }
}

function showToastMessage(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3500)
}

async function loadUsers() {
  try {
    const res = await fetch('/api/auth/users')
    if (!res.ok) {
      users.value = []
      return
    }
    users.value = await res.json()
    
    // Cargar permisos por usuario
    try {
      const pres = await fetch('/api/auth/user-permissions/all')
      if (pres.ok) {
        const rows = await pres.json()
        const permMap = {}
        for (const r of rows) {
          if (!permMap[r.email]) permMap[r.email] = []
          permMap[r.email].push(r.permission_id || r.area)
        }
        users.value = users.value.map(u => ({
          ...u,
          permissions: permMap[u.email] || []
        }))
      }
    } catch (e) {
      console.warn('No se pudieron cargar permisos:', e)
    }

    filterUsers()
  } catch (e) {
    console.error('Error cargando usuarios:', e)
    showToastMessage('Error cargando usuarios', 'error')
  }
}

onMounted(async () => {
  if (!isAdmin) {
    try {
      await navigateAndRefresh(router, { name: 'dashboard' })
    } catch (e) {
      console.error('No admin access:', e)
    }
    return
  }
  await loadUsers()
})
</script>

<style scoped>
.admin-users-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header-info h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
}

.header-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Search y Filters */
.search-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.search-box svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.search-box input::placeholder {
  color: #9ca3af;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chips button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #374151;
}

.filter-chips button:hover {
  background: #e5e7eb;
}

.filter-chips button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

/* Tabla de usuarios */
.users-table-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.users-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.3s ease;
}

.users-table tbody tr:hover {
  background: #f9fafb;
}

.avatar-cell {
  padding: 12px 16px;
}

.avatar-mini {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
}

.avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-cell {
  padding: 12px 16px;
  font-weight: 500;
  color: #1f2937;
}

.email-cell {
  padding: 12px 16px;
  font-size: 13px;
  color: #6b7280;
}

.role-cell {
  padding: 12px 16px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background: #dbeafe;
  color: #0c4a6e;
}

.access-cell {
  padding: 12px 16px;
}

.access-modules {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.module-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f0f9ff;
  color: #0369a1;
}

.module-tag.admin-access {
  background: linear-gradient(135deg, #667eea15, #764ba215);
  color: #667eea;
  font-weight: 600;
}

.actions-cell {
  padding: 12px 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #1f2937;
  border-color: #9ca3af;
}

.btn-icon.role-toggle:hover {
  background: #fef3c7;
  color: #92400e;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 16px;
  color: #9ca3af;
}

.empty-state svg {
  opacity: 0.5;
}

/* Modales */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-content.compact {
  max-width: 500px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #1f2937;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.admin-notice {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #92400e;
  font-size: 13px;
}

.admin-notice svg {
  flex-shrink: 0;
}

.permissions-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.permission-item:has(input:checked) {
  background: #f0f9ff;
  border-color: #bfdbfe;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 2px;
}

.permission-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.permission-checkbox input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
}

.permission-checkbox input:disabled + .checkbox-custom {
  opacity: 0.5;
  cursor: not-allowed;
}

.permission-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.module-icon {
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.module-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.module-desc {
  font-size: 12px;
  color: #6b7280;
}

.role-change-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
}

.info-text svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.info-text.admin-promotion {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.info-text.user-demotion {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.btn-secondary:hover {
  background: #e5e7eb;
}

.btn.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.btn.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.btn.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.btn.btn-danger:hover {
  background: #fecaca;
}

.btn.btn-danger.btn-success {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.btn.btn-danger.btn-success:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 2000;
}

.toast.success {
  background: #dcfce7;
  color: #166534;
}

.toast.error {
  background: #fee2e2;
  color: #991b1b;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Animaciones */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .users-table {
    font-size: 13px;
  }

  .users-table th,
  .users-table td {
    padding: 10px 12px;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-back {
    align-self: flex-end;
  }

  .search-filters {
    flex-direction: column;
  }

  .filter-chips {
    justify-content: flex-start;
  }

  .modal-content {
    max-width: 95%;
  }

  .toast {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
}
</style>
