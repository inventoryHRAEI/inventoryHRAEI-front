import { usePermissions } from '@/composables/usePermissions.js'

/**
 * Directiva v-permission para mostrar/ocultar elementos basado en permisos
 * 
 * Uso:
 * v-permission="'biomedical'" - Muestra si tiene acceso de lectura o admin
 * v-permission="'biomedical:admin'" - Muestra solo si es admin
 * v-permission="'biomedical:read'" - Muestra si tiene lectura o admin
 */
export const vPermission = {
  mounted(el, binding) {
    const { hasPermission, canEdit, canRead, currentUser } = usePermissions()
    
    const permission = binding.value
    if (!permission) {
      console.warn('v-permission: no se especificó permiso')
      el.style.display = 'none'
      return
    }

    const [module, level = 'read'] = permission.split(':')
    let hasAccess = false

    if (level === 'admin') {
      hasAccess = canEdit(module)
    } else {
      hasAccess = canRead(module)
    }

    if (!hasAccess) {
      el.style.display = 'none'
    }
  },

  updated(el, binding) {
    const { hasPermission, canEdit, canRead } = usePermissions()
    
    const permission = binding.value
    if (!permission) {
      el.style.display = 'none'
      return
    }

    const [module, level = 'read'] = permission.split(':')
    let hasAccess = false

    if (level === 'admin') {
      hasAccess = canEdit(module)
    } else {
      hasAccess = canRead(module)
    }

    el.style.display = hasAccess ? '' : 'none'
  }
}

export default vPermission
