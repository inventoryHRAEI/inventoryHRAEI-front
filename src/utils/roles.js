// Utilidades para gestión de roles de usuario
// Definición de roles y funciones de ayuda

/**
 * Definición de roles disponibles en el sistema
 */
export const ROLES = {
  admin: {
    id: 'admin',
    label: 'Administrador',
    description: 'Acceso completo a todas las funciones del sistema incluyendo gestión de usuarios',
    color: '#f59e0b',
    textColor: '#fbbf24',
    icon: '👑',
    level: 3
  },
  privileged: {
    id: 'privileged',
    label: 'Usuario con acceso',
    description: 'Cuenta validada por un administrador con acceso a la aplicación.',
    color: '#8b5cf6',
    textColor: '#a78bfa',
    icon: '⭐',
    level: 2
  },
  user: {
    id: 'user',
    label: 'Usuario con acceso',
    description: 'Cuenta con acceso operativo a la aplicación.',
    color: '#3b82f6',
    textColor: '#60a5fa',
    icon: '👤',
    level: 1
  }
}

/**
 * Lista de roles disponibles para iteración
 */
export const ROLE_LIST = [
  ROLES.admin,
  ROLES.privileged,
  ROLES.user
]

/**
 * Formatear el nombre del rol para mostrar
 * @param {string} role - Rol del usuario
 * @returns {string} Nombre formateado del rol
 */
export function formatRole(role) {
  if (!role) return 'Usuario'
  
  const roleInfo = ROLES[role]
  if (roleInfo) {
    return roleInfo.label
  }
  
  // Manejar roles legacy o desconocidos
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/**
 * Obtener la descripción del rol
 * @param {string} role - Rol del usuario
 * @returns {string} Descripción del rol
 */
export function getRoleDescription(role) {
  const roleInfo = ROLES[role]
  return roleInfo ? roleInfo.description : ''
}

/**
 * Obtener el nivel de acceso del rol
 * @param {string} role - Rol del usuario
 * @returns {number} Nivel de acceso (1-3)
 */
export function getRoleLevel(role) {
  const roleInfo = ROLES[role]
  return roleInfo ? roleInfo.level : 1
}

/**
 * Verificar si un rol tiene acceso mayor o igual al nivel especificado
 * @param {string} role - Rol del usuario
 * @param {number} requiredLevel - Nivel requerido
 * @returns {boolean} true si tiene acceso
 */
export function hasRoleLevel(role, requiredLevel) {
  return getRoleLevel(role) >= requiredLevel
}

/**
 * Verificar si el usuario es administrador
 * @param {string} role - Rol del usuario
 * @returns {boolean} true si es administrador
 */
export function isAdminRole(role) {
  return role === 'admin'
}

/**
 * Verificar si el usuario es privilegiado o admin
 * @param {string} role - Rol del usuario
 * @returns {boolean} true si es privilegiado o admin
 */
export function isPrivilegedRole(role) {
  return role === 'admin' || role === 'privileged'
}

/**
 * Obtener el color del rol
 * @param {string} role - Rol del usuario
 * @returns {string} Color en formato hex
 */
export function getRoleColor(role) {
  const roleInfo = ROLES[role]
  return roleInfo ? roleInfo.color : '#6b7280'
}

/**
 * Obtener el icono del rol
 * @param {string} role - Rol del usuario
 * @returns {string} Emoji del icono
 */
export function getRoleIcon(role) {
  const roleInfo = ROLES[role]
  return roleInfo ? roleInfo.icon : '👤'
}

/**
 * Obtener todas las opciones de roles para un select dropdown
 * @returns {Array} Array de opciones para select
 */
export function getRoleOptions() {
  return ROLE_LIST.map(r => ({
    value: r.id,
    label: r.label,
    description: r.description
  }))
}

/**
 * Ciclo de roles para navegación: user -> privileged -> admin -> user
 * @param {string} currentRole - Rol actual
 * @returns {string} Siguiente rol en el ciclo
 */
export function getNextRole(currentRole) {
  const levels = ['user', 'privileged', 'admin']
  const currentIndex = levels.indexOf(currentRole)
  
  if (currentIndex === -1) return 'user'
  
  const nextIndex = (currentIndex + 1) % levels.length
  return levels[nextIndex]
}

export default {
  ROLES,
  ROLE_LIST,
  formatRole,
  getRoleDescription,
  getRoleLevel,
  hasRoleLevel,
  isAdminRole,
  isPrivilegedRole,
  getRoleColor,
  getRoleIcon,
  getRoleOptions,
  getNextRole
}
