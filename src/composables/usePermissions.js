// Composables para gestión de permisos y roles de usuario
// Sistema de protección basado en roles: admin, privileged, user
// NO requiere Pinia - funciona con localStorage directamente

import { computed, reactive, watch } from 'vue'

// NO se usa Pinia - funciona directamente con localStorage
// El rol se guarda en localStorage bajo la clave 'role'

// Definición de permisos por rol
// Los usuarios con rol 'user' tienen acceso limitado (solo lectura/catálogo)
// Los usuarios con rol 'privileged' tienen permisos adicionales
// Los usuarios con rol 'admin' tienen acceso completo

const PERMISSIONS = {
  // Permisos de usuario básico (user)
  user: {
    // Órdenes - PUEDE crear y ver, pero NO editar/eliminar/descargar
    orders: {
      create: true,
      read: true,
      update: false,
      delete: false,
      download: false
    },
    // Inventario biomédica - solo catálogo/búsqueda (NO puede modificar equipos ni mantenimiento)
    biomedical: {
      create: false,
      read: true,
      update: false,
      delete: false,
      downloadHistory: false,
      downloadReports: false,
      manage: false
    },
    // Inventario de insumos - PUEDE crear
    consumables: {
      create: true,
      read: true,
      update: false,
      delete: false,
      download: false
    },
    // Resguardos - PUEDE crear
    guards: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Servicios - PUEDE crear
    services: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Entradas - PUEDE crear
    entries: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Salidas - PUEDE crear
    exits: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Usuarios - gestión
    users: {
      read: false,
      create: false,
      update: false,
      delete: false,
      manageRoles: false
    },
    // Dashboard y estadísticas
    dashboard: {
      full: false,
      read: true
    },
    // Configuración del sistema
    settings: {
      read: false,
      write: false
    }
  },
  
  // Permisos de usuario privilegiado (privileged)
  // Por defecto: usuarios nuevos son privileged
  // Puede crear órdenes, pero inventario biomédico es solo lectura (catálogo)
  privileged: {
    // Órdenes - creación
    orders: {
      create: true,
      read: true,
      update: false,  // No puede editar órdenes
      delete: false,
      download: false  // No puede descargar información
    },
    // Inventario biomédica - SOLO CATÁLOGO (readonly)
    biomedical: {
      create: false,  // No puede crear equipos
      read: true,    // Solo lectura - catálogo
      update: false, // No puede actualizar equipos
      delete: false,
      downloadHistory: false,  // No puede descargar historial
      downloadReports: false, // No puede descargar reportes
      manage: false,           // No puede gestionar
      startMaintenance: false, // No puede iniciar mantenimiento
      addEquipment: false     // No puede adicionar bienes
    },
    // Inventario de insumos
    consumables: {
      create: true,
      read: true,
      update: false,
      delete: false,
      download: false
    },
    // Resguardos
    guards: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Servicios
    services: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Entradas
    entries: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Salidas
    exits: {
      create: true,
      read: true,
      update: false,
      delete: false
    },
    // Usuarios - solo lectura
    users: {
      read: true,
      create: false,
      update: false,
      delete: false,
      manageRoles: false
    },
    // Dashboard y estadísticas
    dashboard: {
      full: false,
      read: true
    },
    // Configuración del sistema
    settings: {
      read: true,
      write: false
    }
  },
  
  // Permisos de administrador (admin) - acceso completo
  admin: {
    orders: {
      create: true,
      read: true,
      update: true,
      delete: true,
      download: true
    },
    biomedical: {
      create: true,
      read: true,
      update: true,
      delete: true,
      downloadHistory: true,
      downloadReports: true,
      manage: true
    },
    consumables: {
      create: true,
      read: true,
      update: true,
      delete: true,
      download: true
    },
    guards: {
      create: true,
      read: true,
      update: true,
      delete: true
    },
    services: {
      create: true,
      read: true,
      update: true,
      delete: true
    },
    entries: {
      create: true,
      read: true,
      update: true,
      delete: true
    },
    exits: {
      create: true,
      read: true,
      update: true,
      delete: true
    },
    users: {
      read: true,
      create: true,
      update: true,
      delete: true,
      manageRoles: true
    },
    dashboard: {
      full: true,
      read: true
    },
    settings: {
      read: true,
      write: true
    }
  }
}

/**
 * Obtener el rol del usuario desde localStorage
 * Primero intenta desde window.__USER_ROLE__ (set by login), luego localStorage
 */
export function getUserRole() {
  try {
    // Intentar desde variable global primero (set by login)
    if (typeof window !== 'undefined' && window.__USER_ROLE__) {
      return window.__USER_ROLE__
    }
    
    // Fallback a localStorage - busca 'role' o 'userRole'
    const role = localStorage.getItem('role') || localStorage.getItem('userRole')
    return role || 'user'
  } catch (e) {
    // Si no hay acceso, usar valor por defecto
    return 'user'
  }
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export function hasRole(role) {
  const userRole = getUserRole()
  return userRole === role
}

/**
 * Verificar si el usuario es administrador
 */
export function isAdmin() {
  return hasRole('admin')
}

/**
 * Verificar si el usuario es privilegiado o administrador
 */
export function isPrivileged() {
  const userRole = getUserRole()
  return userRole === 'admin' || userRole === 'privileged'
}

/**
 * Obtener los permisos del usuario actual
 */
export function getUserPermissions() {
  const userRole = getUserRole()
  return PERMISSIONS[userRole] || PERMISSIONS.user
}

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {string} module - Módulo (orders, biomedical, consumables, etc.)
 * @param {string} permission - Permiso (create, read, update, delete, download, etc.)
 */
export function hasPermission(module, permission) {
  const permissions = getUserPermissions()
  const modulePermissions = permissions[module]
  
  if (!modulePermissions) {
    // Si el módulo no existe, denegar por defecto
    console.warn(`[Permissions] Módulo "${module}" no encontrado en permisos`)
    return false
  }
  
  return modulePermissions[permission] === true
}

/**
 * Verificar permiso con callback (para usar en v-if)
 */
export function can(module, permission) {
  return hasPermission(module, permission)
}

/**
 * Composables para usar en componentes Vue
 */
export function usePermissions() {
  const role = computed(() => getUserRole())
  
  const isAdmin = computed(() => hasRole('admin'))
  const isPrivileged = computed(() => isPrivileged())
  const isUser = computed(() => hasRole('user'))
  
  // Métodos para verificar permisos específicos
  const canCreateOrder = computed(() => hasPermission('orders', 'create'))
  const canEditOrder = computed(() => hasPermission('orders', 'update'))
  const canDeleteOrder = computed(() => hasPermission('orders', 'delete'))
  const canDownloadOrderHistory = computed(() => hasPermission('orders', 'download'))
  
  const canCreateBiomedicalEquipment = computed(() => hasPermission('biomedical', 'create'))
  const canEditBiomedicalEquipment = computed(() => hasPermission('biomedical', 'update'))
  const canDeleteBiomedicalEquipment = computed(() => hasPermission('biomedical', 'delete'))
  const canDownloadBiomedicalHistory = computed(() => hasPermission('biomedical', 'downloadHistory'))
  const canDownloadBiomedicalReports = computed(() => hasPermission('biomedical', 'downloadReports'))
  const canManageBiomedical = computed(() => hasPermission('biomedical', 'manage'))
  
  const canCreateConsumable = computed(() => hasPermission('consumables', 'create'))
  const canEditConsumable = computed(() => hasPermission('consumables', 'update'))
  const canDeleteConsumable = computed(() => hasPermission('consumables', 'delete'))
  const canDownloadConsumableReport = computed(() => hasPermission('consumables', 'download'))
  
  const canManageUsers = computed(() => hasPermission('users', 'manageRoles'))
  const canCreateUser = computed(() => hasPermission('users', 'create'))
  const canEditUser = computed(() => hasPermission('users', 'update'))
  const canDeleteUser = computed(() => hasPermission('users', 'delete'))
  
  const canAccessFullDashboard = computed(() => hasPermission('dashboard', 'full'))
  const canAccessSettings = computed(() => hasPermission('settings', 'write'))
  
  /**
   * Verificar permiso dinámicamente (para métodos)
   */
  const checkPermission = (module, permission) => {
    return hasPermission(module, permission)
  }
  
  /**
   * Obtener el nivel de acceso del usuario como texto
   */
  const accessLevel = computed(() => {
    const r = role.value
    if (r === 'admin') return 'Administrador - Acceso completo'
    if (r === 'privileged') return 'Usuario privilegiado - Acceso limitado'
    return 'Usuario - Solo catálogo y búsqueda'
  })
  
  return {
    // Estado
    role,
    isAdmin,
    isPrivileged,
    isUser,
    accessLevel,
    
    // Permisos de órdenes
    canCreateOrder,
    canEditOrder,
    canDeleteOrder,
    canDownloadOrderHistory,
    
    // Permisos de inventario biomédico
    canCreateBiomedicalEquipment,
    canEditBiomedicalEquipment,
    canDeleteBiomedicalEquipment,
    canDownloadBiomedicalHistory,
    canDownloadBiomedicalReports,
    canManageBiomedical,
    
    // Permisos de consumibles
    canCreateConsumable,
    canEditConsumable,
    canDeleteConsumable,
    canDownloadConsumableReport,
    
    // Permisos de usuarios
    canManageUsers,
    canCreateUser,
    canEditUser,
    canDeleteUser,
    
    // Permisos de dashboard y settings
    canAccessFullDashboard,
    canAccessSettings,
    
    // Método genérico
    checkPermission
  }
}

/**
 * Middleware para verificar permisos antes de una acción
 * Retorna true si tiene permiso, false si no
 */
export function requirePermission(module, permission) {
  if (!hasPermission(module, permission)) {
    console.warn(`[Permissions] Acceso denegado. Usuario "${getUserRole()}" no tiene permiso "${permission}" en "${module}"`)
    return false
  }
  return true
}

/**
 * Verificar acceso a ruta - para usar en router
 */
export function canAccessRoute(routeName) {
  // Rutas que requieren admin
  const adminRoutes = [
    'admin-users',
    'admin-user-detail',
    'admin-account-validation'
  ]
  
  // Rutas que requieren privileged o admin
  const privilegedRoutes = [
    'dashboard'
  ]
  
  if (adminRoutes.includes(routeName)) {
    return isAdmin()
  }
  
  if (privilegedRoutes.includes(routeName)) {
    return isPrivileged()
  }
  
  // Para otras rutas, solo necesita estar autenticado
  return true
}

export default {
  getUserRole,
  hasRole,
  isAdmin,
  isPrivileged,
  getUserPermissions,
  hasPermission,
  can,
  usePermissions,
  requirePermission,
  canAccessRoute
}
