<template>
  <slot v-if="hasAccess" />
  <slot v-else name="fallback">
    <!-- Por defecto no muestra nada si no tiene permisos -->
  </slot>
</template>

<script setup>
import { computed } from 'vue'
import { hasPermission, isAdmin, isPrivileged, hasRole } from '@/composables/usePermissions'

const props = defineProps({
  /**
   * Módulo del permiso (orders, biomedical, consumables, etc.)
   */
  module: {
    type: String,
    required: true
  },
  /**
   * Permiso requerido (create, read, update, delete, download, etc.)
   */
  permission: {
    type: String,
    required: true
  },
  /**
   * Rol específico requerido (admin, privileged, user)
   * Si se proporciona, verifica el rol en lugar del permiso
   */
  role: {
    type: String,
    default: null
  },
  /**
   * Si es true, invierte la lógica (muestra cuando NO tiene el permiso)
   */
  inverted: {
    type: Boolean,
    default: false
  },
  /**
   * Mostrar un mensaje cuando no tiene acceso
   */
  showMessage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['access-denied', 'access-granted'])

const hasAccess = computed(() => {
  let result = false
  
  if (props.role) {
    // Verificar rol específico
    result = hasRole(props.role)
  } else {
    // Verificar permiso del módulo
    result = hasPermission(props.module, props.permission)
  }
  
  // Invertir si es necesario
  if (props.inverted) {
    result = !result
  }
  
  // Emitir eventos
  if (result) {
    emit('access-granted')
  } else {
    emit('access-denied')
  }
  
  return result
})
</script>
