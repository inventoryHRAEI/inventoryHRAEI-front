import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Composable para gestionar permisos granulares de usuarios
 * 
 * Niveles: 'none' (sin acceso), 'read' (lectura), 'admin' (acceso completo)
 */
export function usePermissions() {
  const router = useRouter()
  
  // Intentar cargar permisos del localStorage
  const storedPerms = localStorage.getItem('userPermissions')
  const defaultPerms = {
    biomedical: 'none',
    orders_entrada: 'none',
    orders_salida: 'none',
    orders_resguardo: 'none',
    orders_servicio: 'none'
  }
  
  const permissionLevels = ref(storedPerms ? JSON.parse(storedPerms) : defaultPerms)

  const currentUser = computed(() => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  })

  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  /**
   * Obtener permisos del usuario actual desde el backend
   */
  async function loadUserPermissions() {
    try {
      if (isAdmin.value) {
        // Los admins tienen todos los permisos en nivel 'admin'
        permissionLevels.value = {
          biomedical: 'admin',
          orders_entrada: 'admin',
          orders_salida: 'admin',
          orders_resguardo: 'admin',
          orders_servicio: 'admin'
        }
        return
      }

      const email = currentUser.value?.email
      if (!email) return

      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`/api/auth/user-permission-levels/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (res.ok) {
        const data = await res.json()
        permissionLevels.value = data
        console.log('✅ Permisos cargados:', data)
      } else {
        console.warn('No se pudieron cargar permisos:', res.status)
      }
    } catch (e) {
      console.error('Error cargando permisos:', e)
    }
  }

  /**
   * Verificar si el usuario tiene un nivel específico de acceso en un módulo
   * @param {string} module - ID del módulo ('biomedical', 'orders_entrada', etc)
   * @param {string} requiredLevel - Nivel requerido ('read', 'admin')
   * @returns {boolean}
   */
  function hasPermission(module, requiredLevel = 'read') {
    // Admin tiene todos los permisos
    if (isAdmin.value) return true

    const userLevel = permissionLevels.value[module] || 'none'
    
    if (requiredLevel === 'read') {
      // read: puede acceder si tiene 'read' o 'admin'
      return userLevel === 'read' || userLevel === 'admin'
    }
    
    if (requiredLevel === 'admin') {
      // admin: solo si tiene 'admin'
      return userLevel === 'admin'
    }

    return false
  }

  /**
   * Verificar si puede LEER (solo lectura)
   */
  function canRead(module) {
    return hasPermission(module, 'read')
  }

  /**
   * Verificar si puede EDITAR/ELIMINAR (admin)
   */
  function canEdit(module) {
    return hasPermission(module, 'admin')
  }

  /**
   * Verificar si tiene ACCESO (read o admin)
   */
  function hasAccess(module) {
    return hasPermission(module, 'read')
  }

  /**
   * Verificar si NO tiene acceso (bloqueado)
   */
  function isBlocked(module) {
    return !hasAccess(module)
  }

  /**
   * Obtener el nivel actual de un módulo
   */
  function getLevel(module) {
    if (isAdmin.value) return 'admin'
    return permissionLevels.value[module] || 'none'
  }

  /**
   * Obtener descripción del nivel de acceso
   */
  function getLevelLabel(module) {
    const level = getLevel(module)
    const labels = {
      'none': '❌ Sin acceso',
      'read': '👁️ Lectura y búsqueda',
      'admin': '⚙️ Administrador'
    }
    return labels[level] || level
  }

  return {
    // Estado
    permissionLevels,
    currentUser,
    isAdmin,
    
    // Métodos
    loadUserPermissions,
    hasPermission,
    canRead,
    canEdit,
    hasAccess,
    isBlocked,
    getLevel,
    getLevelLabel
  }
}
