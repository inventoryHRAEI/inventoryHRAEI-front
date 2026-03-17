import { ref } from 'vue'
import Swal from 'sweetalert2'
import { darkThemeConfig } from '@/utils/sweetAlertConfig'

/**
 * useCloseConfirmation - Composable para mostrar confirmación antes de cerrar wizards
 * 
 * Uso:
 * const { confirmAndClose } = useCloseConfirmation()
 * @click="confirmAndClose(() => { // tu lógica de cierre })"
 */
export function useCloseConfirmation(options = {}) {
  const {
    title = '¿Cerrar este panel?',
    message = 'Los cambios no guardados se perderán. ¿Realmente deseas cerrar?',
    confirmText = 'Sí, cerrar',
    cancelText = 'Cancelar',
    icon = 'warning',
    isDangerous = true
  } = options

  const isConfirming = ref(false)

  /**
   * Muestra la modal de confirmación y ejecuta el callback si el usuario confirma
   * @param {Function} onConfirm - Callback a ejecutar si confirma
   * @param {Function} onCancel - Callback opcional si cancela
   */
  async function confirmAndClose(onConfirm, onCancel = null) {
    isConfirming.value = true

    try {
      const result = await Swal.fire({
        title,
        text: message,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: isDangerous ? '#ef4444' : '#3b82f6',
        cancelButtonColor: '#6b7280',
        allowOutsideClick: false,
        allowEscapeKey: true,
        focusConfirm: false,
        didOpen: (modal) => {
          // Auto-focus el botón de cancelar primero (más seguro)
          const cancelBtn = modal.querySelector('[data-swal-role="cancel"]')
          if (cancelBtn) cancelBtn.focus()
        },
        ...darkThemeConfig
      })

      if (result.isConfirmed) {
        if (typeof onConfirm === 'function') {
          await onConfirm()
        }
      } else if (result.isDismissed && typeof onCancel === 'function') {
        await onCancel()
      }
    } catch (error) {
      console.error('Error en confirmAndClose:', error)
    } finally {
      isConfirming.value = false
    }
  }

  /**
   * Versión simplificada: solo confirma, sin callback personalizado
   * Retorna true/false
   */
  async function confirm() {
    isConfirming.value = true

    try {
      const result = await Swal.fire({
        title,
        text: message,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: isDangerous ? '#ef4444' : '#3b82f6',
        cancelButtonColor: '#6b7280',
        allowOutsideClick: false,
        allowEscapeKey: true,
        focusConfirm: false,
        ...darkThemeConfig
      })

      return result.isConfirmed
    } catch (error) {
      console.error('Error en confirm:', error)
      return false
    } finally {
      isConfirming.value = false
    }
  }

  return {
    confirmAndClose,
    confirm,
    isConfirming
  }
}

/**
 * Composable alternativo más simple para uso en templates
 * Retorna un objeto con propiedades reactivas
 */
export function useCloseWarning(options = {}) {
  const {
    title = '¿Cerrar sin guardar?',
    message = 'Los cambios no guardados se perderán.',
    type = 'warning'
  } = options

  const isConfirming = ref(false)

  /**
   * Muestra advertencia simple de cierre
   * @returns {Promise<boolean>} true si confirma, false si cancela
   */
  async function warnAndClose() {
    isConfirming.value = true

    try {
      const result = await Swal.fire({
        title,
        text: message,
        icon: type,
        buttons: {
          cancel: 'Cancelar',
          confirm: 'Cerrar de todas formas'
        },
        dangerMode: true,
        allowOutsideClick: false,
        allowEscapeKey: true
      })

      return result.value === true
    } finally {
      isConfirming.value = false
    }
  }

  return {
    warnAndClose,
    isConfirming
  }
}
