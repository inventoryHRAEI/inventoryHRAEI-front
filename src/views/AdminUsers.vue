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
                <button class="btn-back" @click="goBack">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
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
                        <button class="action-btn detail-btn" @click="goToDetail(user.id)" title="Ver detalles">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            Detalle
                        </button>
                        <button class="action-btn role-btn" @click="changeRole(user)" title="Cambiar rol">
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
                    </div>
                </div>
            </div>
        </div>

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
const currentUser = JSON.parse(localStorage.getItem('user') || 'null') || {}

// Estado
const users = ref([])
const searchQuery = ref('')
const filteredUsers = ref([])

// Modal
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
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px;
    border-radius: 16px;
    margin-bottom: 24px;
    color: white;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.25);
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
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
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
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
}

/* Stats Section */
.stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.stat-number {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
}

.stat-number.admin {
    color: #667eea;
}

/* Search Bar */
.search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar svg {
    color: #9ca3af;
    flex-shrink: 0;
}

.search-bar input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: #1f2937;
}

.search-bar input::placeholder {
    color: #d1d5db;
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
    color: #9ca3af;
}

.empty-state svg {
    opacity: 0.3;
    margin-bottom: 16px;
}

/* User Card */
.user-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    display: flex;
    flex-direction: column;
}

.user-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
}

.card-header {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f3f4f6;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
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
    font-size: 16px;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.role-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f3f4f6;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
}

.role-badge.admin {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

/* Card Body */
.card-body {
    padding: 16px 20px;
    flex: 1;
}

.modules-section h4 {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #6b7280;
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
    background: #f9fafb;
    border-radius: 6px;
    font-size: 12px;
}

.module-name {
    color: #4b5563;
    font-weight: 500;
}

.module-access {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 11px;
}

.module-access.admin {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.module-access.read {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.module-access.none {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

/* Card Footer */
.card-footer {
    padding: 16px 20px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #f3f4f6;
    background: #fafafa;
}

.action-btn {
    flex: 1;
    padding: 10px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.3s ease;
    color: #6b7280;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.edit-btn {
    border-color: #667eea;
    color: #667eea;
}

.action-btn.edit-btn:hover {
    background: rgba(102, 126, 234, 0.05);
}

.action-btn.detail-btn {
    border-color: #10b981;
    color: #059669;
}

.action-btn.detail-btn:hover {
    background: rgba(16, 185, 129, 0.05);
}

.action-btn.role-btn {
    border-color: #f97316;
    color: #f97316;
}

.action-btn.role-btn:hover {
    background: rgba(249, 115, 22, 0.05);
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid #f3f4f6;
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
    color: #1f2937;
}

.btn-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    transition: all 0.3s ease;
    padding: 4px;
}

.btn-close:hover {
    color: #ef4444;
    transform: rotate(90deg);
}

.modal-body {
    padding: 24px;
}

.admin-notice {
    background: rgba(102, 126, 234, 0.1);
    border: 2px solid #667eea;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.admin-notice svg {
    color: #667eea;
    flex-shrink: 0;
}

.admin-notice p {
    margin: 0;
    color: #667eea;
    font-size: 14px;
}

.permissions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.permission-row {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
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
    color: #1f2937;
}

.module-description {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #9ca3af;
}

.permission-selector {
    display: flex;
    gap: 8px;
}

.level-btn {
    padding: 8px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
}

.level-btn:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
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
    border-top: 1px solid #f3f4f6;
    background: #fafafa;
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
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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
