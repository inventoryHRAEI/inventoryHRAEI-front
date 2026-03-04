<template>
    <ActionPanel>
        <template #title>
            <div class="title-section">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Gestión de Usuarios
            </div>
        </template>

        <div class="admin-users-container">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-content">
                    <h1 class="hero-title">Administración de Usuarios</h1>
                    <p class="hero-subtitle">Gestiona permisos y roles de acceso al sistema</p>
                </div>
                <div style="display:flex; gap:8px; align-items:center">
                    <button class="btn-back" @click="goBack">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                    <button v-if="currentUser.role === 'admin'" class="btn"
                        @click.prevent="navigateToAccountValidation">Validar
                        Cuentas</button>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="stats-section">
                <div class="stat-card">
                    <span class="stat-label">Total Usuarios</span>
                    <span class="stat-number">{{ users.length }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Administradores</span>
                    <span class="stat-number admin">{{ adminCount }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Usuarios Activos</span>
                    <span class="stat-number">{{ users.length - adminCount }}</span>
                </div>
            </div>

            <!-- Search & Filter -->
            <div class="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o email..."
                    @input="filterUsers" />
            </div>

            <!-- Users Grid -->
            <div class="users-grid">
                <div v-if="filteredUsers.length === 0" class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <h3>No hay usuarios</h3>
                </div>

                <div v-for="user in filteredUsers" :key="user.id" class="user-card">
                    <!-- Card Header -->
                    <div class="card-header">
                        <div class="user-avatar">
                            <img v-if="user.foto" :src="user.foto" :alt="user.nombre" />
                            <div v-else class="avatar-placeholder">
                                {{ getInitials(user.nombre) }}
                            </div>
                        </div>
                        <div class="user-info">
                            <h3 class="user-name">{{ user.nombre }}</h3>
                            <p class="user-email">{{ user.email }}</p>
                        </div>
                        <div class="role-badge" :class="user.role">
                            <svg v-if="user.role === 'admin'" width="16" height="16" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z" />
                            </svg>
                            <span>{{ formatRole(user.role) }}</span>
                        </div>
                    </div>

                    <!-- Card Body - Modules -->
                    <div class="card-body">
                        <div class="modules-section">
                            <h4 class="modules-title">Acceso a Módulos</h4>
                            <div class="modules-grid">
                                <div v-for="mod in modulesList" :key="mod.id" class="module-item">
                                    <span class="module-name">{{ mod.label }}</span>
                                    <span class="module-access" :class="getModuleAccessClass(user, mod.id)">
                                        {{ getModuleAccessLabel(user, mod.id) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card Footer - Actions -->
                    <div class="card-footer">
                        <button class="action-btn edit-btn" @click="openModifyPermissions(user)"
                            title="Editar permisos">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Permisos
                        </button>
                        <button class="action-btn detail-btn" @click="openDetailModal(user)" title="Ver detalles">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            Detalle
                        </button>
                        <button v-if="user.role === 'admin' || adminCount < 3"
                            class="action-btn role-btn"
                            @click="changeRole(user)"
                            :disabled="user.role === 'user' && adminCount >= 3"
                            :title="user.role === 'admin' ? 'Degradar a usuario' : adminCount >= 3 ? 'Límite de 3 administradores alcanzado' : 'Promover a administrador'">
                            <svg v-if="user.role === 'user'" width="18" height="18" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z" />
                            </svg>
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                            </svg>
                            {{ user.role === 'admin' ? 'Degradar' : 'Promover' }}
                        </button>
                        <button class="action-btn revoke-btn" @click="revokeUserAccess(user)" title="Revocar acceso">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            Revocar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Detalles del Usuario -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div v-if="showDetailModal" class="modal-overlay-detail" @click="closeDetailModal">
                    <div class="modal-detail" @click.stop>
                        <div class="detail-header">
                            <div class="header-title">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <h2>Información del Usuario</h2>
                            </div>
                            <button class="close-btn" @click="closeDetailModal">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div class="detail-scroll">
                            <!-- User Header -->
                            <div class="user-header-section">
                                <div class="user-avatar">
                                    <img v-if="selectedUser?.foto" :src="selectedUser.foto"
                                        :alt="selectedUser?.nombre" />
                                    <div v-else class="avatar-placeholder">{{ getInitials(selectedUser?.nombre) }}</div>
                                </div>
                                <div class="user-main-info">
                                    <h3>{{ selectedUser?.nombre }}</h3>
                                    <span class="email-main">{{ selectedUser?.email }}</span>
                                    <span class="role-badge" :class="selectedUser?.role">
                                        <svg v-if="selectedUser?.role === 'admin'" width="14" height="14"
                                            viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M12 2L15.09 8.26H22L17.55 12.19L18.91 18.45L12 14.62L5.09 18.45L6.45 12.19L2 8.26H8.91L12 2Z" />
                                        </svg>
                                        {{ formatRole(selectedUser?.role) }}
                                    </span>
                                </div>
                            </div>

                            <!-- Información Personal -->
                            <div class="info-section">
                                <h4 class="section-title">Información Personal</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>Nombre Completo</label>
                                        <span>{{ selectedUser?.nombre }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Email</label>
                                        <span>{{ selectedUser?.email }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Teléfono</label>
                                        <span>{{ selectedUser?.telefono || 'No registrado' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Departamento</label>
                                        <span>{{ selectedUser?.departamento || 'No asignado' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Información de Cuenta -->
                            <div class="info-section">
                                <h4 class="section-title">Información de Cuenta</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>ID de Usuario</label>
                                        <span class="mono">{{ selectedUser?.id }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Rol</label>
                                        <span>{{ formatRole(selectedUser?.role) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Fecha de Registro</label>
                                        <span>{{ formatDateFull(selectedUser?.fecha_creacion) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Último Acceso</label>
                                        <span>{{ selectedUser?.ultimo_acceso ? formatDateFull(selectedUser.ultimo_acceso) : 'Sin acceso aún' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Acceso a Módulos -->
                            <div class="info-section">
                                <h4 class="section-title">Acceso a Módulos</h4>
                                <div class="modules-list">
                                    <div v-for="mod in modulesList" :key="mod.id" class="module-access-item">
                                        <span class="module-label">{{ mod.label }}</span>
                                        <span class="module-status" :class="getModuleAccessClass(selectedUser, mod.id)">
                                            {{ getModuleAccessLabel(selectedUser, mod.id) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Estados y Actividad -->
                            <div class="info-section">
                                <h4 class="section-title">Estadísticas</h4>
                                <div class="stats-grid">
                                    <div class="stat-box">
                                        <span class="stat-icon">📅</span>
                                        <span class="stat-label">Desde hace</span>
                                        <span class="stat-value">{{ calculateDaysSinceRegistration(selectedUser?.fecha_creacion) }} días</span>
                                    </div>
                                    <div class="stat-box">
                                        <span class="stat-icon">🔐</span>
                                        <span class="stat-label">Nivel</span>
                                        <span class="stat-value">{{ selectedUser?.role === 'admin' ? 'Admin' : 'User' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="detail-footer">
                            <button class="btn-close-modal" @click="closeDetailModal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Modal: Permisos Granulares -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div v-if="showModifyModal" class="modal-overlay" @click="closeModify">
                    <div class="modal-content" @click.stop>
                        <div class="modal-header">
                            <div class="modal-title-section">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                    <circle cx="5" cy="12" r="1" />
                                </svg>
                                <h3>Permisos de {{ modifyingUser?.nombre }}</h3>
                            </div>
                            <button class="btn-close" @click="closeModify">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div class="modal-body">
                            <div v-if="modifyingUser?.role === 'admin'" class="admin-notice">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <p>Este usuario es administrador y tiene acceso completo a todos los módulos.</p>
                            </div>

                            <div v-else class="permissions-list">
                                <div v-for="module in modulesList" :key="module.id" class="permission-row">
                                    <div class="permission-info">
                                        <h4>{{ module.label }}</h4>
                                        <p class="module-description">{{ getModuleDescription(module.id) }}</p>
                                    </div>
                                    <div class="permission-selector">
                                        <button v-for="level in permissionLevels" :key="level.value"
                                            :class="['level-btn', { active: modPermissions[modifyingUser?.email]?.[module.id] === level.value }]"
                                            @click="modPermissions[modifyingUser?.email][module.id] = level.value"
                                            :title="level.label">
                                            <span class="level-icon">{{ level.icon }}</span>
                                            <span class="level-name">{{ level.short }}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="btn btn-secondary" @click="closeModify">Cancelar</button>
                            <button v-if="modifyingUser?.role !== 'admin'" class="btn btn-primary"
                                @click="savePermissions">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Guardar Cambios
                            </button>
                        </div>
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
import { confirmDelete, showSuccess, showError, showLoading, closeModal as closeSwalModal } from '@/utils/sweetAlertConfig'
import notifier from '@/utils/notifier'

const router = useRouter()
const currentUser = (() => { try { return JSON.parse(window?.localStorage?.getItem('user') || 'null') || {} } catch { return {} } })()

// Estado
const users = ref([])
const searchQuery = ref('')
const filteredUsers = ref([])

// Modal Detail
const showDetailModal = ref(false)
const selectedUser = ref(null)

// Modal Modify
const showModifyModal = ref(false)
const modifyingUser = ref(null)
const modPermissions = ref({})

// Módulos y niveles
const modulesList = [
    { id: 'biomedical', label: 'Inventario Biomédica' },
    { id: 'orders_entrada', label: 'Órdenes de Entrada' },
    { id: 'orders_salida', label: 'Órdenes de Salida' },
    { id: 'orders_resguardo', label: 'Órdenes de Resguardo' },
    { id: 'orders_servicio', label: 'Órdenes de Servicio' }
]

const permissionLevels = [
    { value: 'none', label: 'Sin acceso', short: '❌', icon: '❌' },
    { value: 'read', label: 'Solo lectura', short: '👁️', icon: '👁️' },
    { value: 'admin', label: 'Administrador', short: '⚙️', icon: '⚙️' }
]

// Computadas
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)

// Métodos
function goBack() {
    try {
        navigateAndRefresh(router, { name: 'dashboard' })
    } catch (e) {
        console.error('Error navigating:', e)
    }
}

function goToDetail(id) {
    try {
        navigateAndRefresh(router, { name: 'admin-user-detail', params: { id } })
    } catch (e) {
        console.error('Error navigating:', e)
    }
}

function openDetailModal(user) {
    selectedUser.value = user
    showDetailModal.value = true
}

function closeDetailModal() {
    showDetailModal.value = false
    selectedUser.value = null
}

function formatDateShort(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function formatDateFull(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function calculateDaysSinceRegistration(date) {
    if (!date) return '0'
    const now = new Date()
    const registration = new Date(date)
    const diff = now - registration
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days
}

function navigateToAccountValidation() {
    try {
        navigateAndRefresh(router, { name: 'admin-account-validation' })
    } catch (e) {
        console.error('Error navegando a account-validation:', e)
    }
}

function getInitials(name) {
    if (!name) return 'U'
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatRoleLabel(role) {
    return role === 'admin' ? 'Administrador' : 'Usuario'
}

function getModuleDescription(moduleId) {
    const descriptions = {
        'biomedical': 'Gestión completa del inventario biomédico y accesorios',
        'orders_entrada': 'Gestión de ingresos de equipos al inventario',
        'orders_salida': 'Gestión de egresos de equipos del inventario',
        'orders_resguardo': 'Gestión de custodia y préstamo de equipos',
        'orders_servicio': 'Gestión de órdenes de mantenimiento técnico'
    }
    return descriptions[moduleId] || ''
}

function getModuleAccessLabel(user, module) {
    if (user.role === 'admin') return '⚙️ Admin'
    const level = modPermissions.value[user.email]?.[module] || 'none'
    if (level === 'admin') return '⚙️'
    if (level === 'read') return '👁️'
    return '❌'
}

function getModuleAccessClass(user, module) {
    if (user.role === 'admin') return 'admin'
    const level = modPermissions.value[user.email]?.[module] || 'none'
    return level
}

function filterUsers() {
    if (!searchQuery.value.trim()) {
        filteredUsers.value = users.value
        return
    }

    const query = searchQuery.value.toLowerCase()
    filteredUsers.value = users.value.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    )
}

async function openModifyPermissions(user) {
    modifyingUser.value = user

    if (user.role === 'admin') {
        showModifyModal.value = true
        return
    }

    // Cargar permisos granulares desde backend
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/auth/user-permission-levels/${user.email}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })

        if (res.ok) {
            const data = await res.json()
            // Mapear datos del backend a estructura de módulos
            const perms = {}
            modulesList.forEach(mod => {
                perms[mod.id] = data[mod.id] || 'none'
            })
            modPermissions.value = { [user.email]: perms }
        } else if (res.status === 401 || res.status === 403) {
            // No autorizado: pedir re-login o mostrar error
            showError('No autorizado', 'No tienes permiso para ver/editar permisos. Por favor inicia sesión como admin.')
            modPermissions.value = { [user.email]: {} }
            modulesList.forEach(mod => {
                modPermissions.value[user.email][mod.id] = 'none'
            })
        } else {
            modPermissions.value = { [user.email]: {} }
            modulesList.forEach(mod => {
                modPermissions.value[user.email][mod.id] = 'none'
            })
        }
    } catch (e) {
        console.error('Error cargando permisos:', e)
        modPermissions.value = { [user.email]: {} }
        modulesList.forEach(mod => {
            modPermissions.value[user.email][mod.id] = 'none'
        })
    }

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
        const email = modifyingUser.value.email
        const perms = { email }

        // Mapear permisos de módulos a estructura del backend
        modulesList.forEach(mod => {
            perms[mod.id] = modPermissions.value[email]?.[mod.id] || 'none'
        })

        const token = localStorage.getItem('token')
        const res = await fetch('/api/auth/user-permission-levels', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(perms)
        })

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.msg || 'No autorizado. Inicia sesión como admin.')
            }
            const data = await res.json().catch(() => ({}))
            throw new Error(data.msg || 'Error guardando permisos')
        }

        showSuccess('Éxito', 'Permisos actualizados')
        await loadUsers()
        closeModify()
    } catch (e) {
        showError('Error', e.message || 'No se pudieron guardar los permisos')
    }
}

async function changeRole(user) {
    try {
        const newRole = user.role === 'admin' ? 'user' : 'admin'
        const action = newRole === 'admin' ? 'promover' : 'degradar'

        // Validar límite de administradores
        if (newRole === 'admin' && adminCount.value >= 3) {
            showError('Límite alcanzado', 'No se pueden tener más de 3 administradores en el sistema. Revoca acceso a un administrador existente primero.')
            return
        }

        const confirm = await confirmDelete(
            'Cambiar Rol',
            `¿Deseas ${action} a ${user.nombre} a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}?`,
            1,
            'Sí, cambiar',
            'Cancelar'
        )

        if (!confirm.isConfirmed) return

        showLoading()
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/auth/users/${user.id}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        })

        closeSwalModal()

        if (!res.ok) throw new Error('Error actualizando rol')

        showSuccess('Éxito', `Usuario ${action}do a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}`)
        await loadUsers()
    } catch (e) {
        showError('Error', e.message || 'No se pudo actualizar el rol')
    }
}

async function revokeUserAccess(user) {
    try {
        const confirm = await confirmDelete(
            'Revocar Acceso',
            `¿Estás seguro de que deseas revocar el acceso a ${user.nombre}? Esta acción desactivará su cuenta y eliminará todas sus sesiones activas.`,
            2,
            'Sí, revocar acceso',
            'Cancelar'
        )

        if (!confirm.isConfirmed) return

        showLoading()
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/auth/users/${user.id}/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        closeSwalModal()

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.msg || 'Error revocando acceso')
        }

        showSuccess('Éxito', `Acceso revocado para ${user.nombre}`)
        await loadUsers()
    } catch (e) {
        showError('Error', e.message || 'No se pudo revocar el acceso')
    }
}

async function loadUsers() {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })

        if (res.ok) {
            users.value = await res.json()

            // Cargar permisos para cada usuario
            const allPermissions = {}
            for (const user of users.value) {
                try {
                    const permRes = await fetch(`/api/auth/user-permission-levels/${user.email}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    })

                    if (permRes.ok) {
                        const data = await permRes.json()
                        const perms = {}
                        modulesList.forEach(mod => {
                            perms[mod.id] = data[mod.id] || 'none'
                        })
                        allPermissions[user.email] = perms
                    } else {
                        const perms = {}
                        modulesList.forEach(mod => {
                            perms[mod.id] = 'none'
                        })
                        allPermissions[user.email] = perms
                    }
                } catch (e) {
                    const perms = {}
                    modulesList.forEach(mod => {
                        perms[mod.id] = 'none'
                    })
                    allPermissions[user.email] = perms
                }
            }

            modPermissions.value = allPermissions
            filterUsers()
        } else {
            users.value = []
        }
    } catch (e) {
        console.error('Error cargando usuarios:', e)
        users.value = []
    }
}

onMounted(() => {
    loadUsers()
})
</script>

<style scoped>
.admin-users-container {
    padding: 24px;
    background: linear-gradient(135deg, #0f172a 0%, #1a1f35 100%);
    min-height: 100vh;
    border-radius: 16px;
}

.title-section {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #667eea;
}

/* Hero Section */
.hero-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 32px;
    border-radius: 16px;
    margin-bottom: 24px;
    color: white;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.hero-content h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
}

.hero-subtitle {
    margin: 8px 0 0 0;
    font-size: 14px;
    opacity: 0.9;
}

.btn-back {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-weight: 500;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
}

/* Stats Section */
.stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.stat-label {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.stat-number {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #60a5fa;
}

.stat-number.admin {
    color: #fbbf24;
}

/* Search Bar */
.search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.search-bar svg {
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
}

.search-bar input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    background: none;
}

.search-bar input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

/* Users Grid */
.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
}

.empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.5);
}

.empty-state svg {
    opacity: 0.3;
    margin-bottom: 16px;
    stroke: rgba(255, 255, 255, 0.3);
}

/* User Card */
.user-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.user-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.08);
}

.card-header {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 18px;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.role-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
}

.role-badge.admin {
    background: rgba(249, 115, 22, 0.15);
    color: #fbbf24;
    border-color: rgba(249, 115, 22, 0.3);
}

/* Card Body */
.card-body {
    padding: 16px 20px;
    flex: 1;
}

.modules-section h4 {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.modules-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.module-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-size: 12px;
}

.module-name {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.module-access {
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 11px;
}

.module-access.admin {
    background: rgba(102, 126, 234, 0.2);
    color: #60a5fa;
}

.module-access.read {
    background: rgba(34, 197, 94, 0.2);
    color: #86efac;
}

.module-access.none {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
}

/* Card Footer */
.card-footer {
    padding: 16px 20px;
    display: flex;
    gap: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.action-btn {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.7);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.1);
}

.action-btn.edit-btn {
    border-color: rgba(102, 126, 234, 0.5);
    color: #60a5fa;
}

.action-btn.edit-btn:hover {
    background: rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.7);
}

.action-btn.detail-btn {
    border-color: rgba(34, 197, 94, 0.5);
    color: #86efac;
}

.action-btn.detail-btn:hover {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.7);
}

.action-btn.role-btn {
    border-color: rgba(249, 115, 22, 0.5);
    color: #fbbf24;
}

.action-btn.role-btn:hover:not(:disabled) {
    background: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.7);
}

.action-btn.role-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: rgba(249, 115, 22, 0.2);
    color: rgba(251, 191, 36, 0.5);
}

.action-btn.revoke-btn {
    border-color: rgba(239, 68, 68, 0.6);
    color: #fca5a5;
}

.action-btn.revoke-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.9);
    color: #ff6b6b;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
}

.modal-content {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.modal-title-section h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
}

.btn-close {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
    padding: 8px;
    border-radius: 6px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
}

.modal-body {
    padding: 24px;
}

.admin-notice {
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.admin-notice svg {
    color: #60a5fa;
    flex-shrink: 0;
}

.admin-notice p {
    margin: 0;
    color: #60a5fa;
    font-size: 14px;
}

.permissions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.permission-row {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.permission-info h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
}

.module-description {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.permission-selector {
    display: flex;
    gap: 8px;
}

.level-btn {
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.level-btn:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(102, 126, 234, 0.15);
}

.level-btn.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: transparent;
}

.level-icon {
    font-size: 18px;
}

.level-name {
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Modal Detail Styles - Dark Liquid Glass */
.modal-overlay-detail {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
}

.modal-detail {
    background: rgba(17, 24, 39, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    width: 90%;
    max-width: 550px;
    height: 90vh;
    max-height: 800px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    overflow: hidden;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-title svg {
    color: #667eea;
    stroke-width: 2;
}

.detail-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
}

.close-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
    padding: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
}

.close-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
}

.detail-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.detail-scroll::-webkit-scrollbar {
    width: 8px;
}

.detail-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.detail-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

.detail-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

.user-header-section {
    display: flex;
    gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    align-items: flex-start;
}

.user-avatar {
    flex-shrink: 0;
}

.user-avatar img {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid rgba(102, 126, 234, 0.5);
}

.user-avatar .avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    border: 2px solid rgba(102, 126, 234, 0.5);
}

.user-main-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.user-main-info h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
}

.email-main {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
}

.role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    width: fit-content;
}

.role-badge.admin {
    background: rgba(249, 115, 22, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(249, 115, 22, 0.4);
}

.role-badge.user {
    background: rgba(102, 126, 234, 0.2);
    color: #60a5fa;
    border: 1px solid rgba(102, 126, 234, 0.4);
}

.info-section {
    margin-bottom: 24px;
}

.section-title {
    margin: 0 0 12px 0;
    font-size: 13px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 700;
    letter-spacing: 0.5px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.info-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    font-weight: 600;
}

.info-item span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.info-item span.mono {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #60a5fa;
}

.modules-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.module-access-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.module-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.module-status {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
}

.module-status.admin,
.module-status.read {
    background: rgba(102, 126, 234, 0.2);
    color: #60a5fa;
}

.module-status.none {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.stat-box {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
}

.stat-icon {
    font-size: 20px;
}

.stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
}

.stat-value {
    font-size: 14px;
    color: #60a5fa;
    font-weight: 700;
}

.detail-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.btn-close-modal {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-close-modal:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .users-grid {
        grid-template-columns: 1fr;
    }

    .hero-section {
        flex-direction: column;
        text-align: center;
    }

    .modal-content {
        width: 95%;
    }

    .stats-section {
        grid-template-columns: 1fr;
    }

    .permission-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .permission-selector {
        width: 100%;
    }

    .level-btn {
        flex: 1;
    }
}
</style>
