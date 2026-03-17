import Swal from 'sweetalert2'

// Configuración de tema dark para SweetAlert2
export const darkThemeConfig = {
  background: 'rgba(13, 20, 35, 0.98)',
  color: 'rgba(255, 255, 255, 0.95)',
  backdrop: 'rgba(2, 8, 18, 0.7)',
  zIndex: 210000
}

// Confirmación de eliminación
export async function confirmDelete(title = 'Confirmar eliminación', message, itemCount = 1, confirmText = 'Eliminar', cancelText = 'Cancelar') {
  const isPlural = itemCount !== 1
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#ff6b6b',
    cancelButtonColor: 'rgba(255, 255, 255, 0.08)',
    ...darkThemeConfig,
  })
}

// Success message
export async function showSuccess(title = 'Éxito', message = '', autoClose = 2000) {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#4ade80',
    timer: autoClose,
    didOpen: (modal) => {
      // Auto-close message
    },
    ...darkThemeConfig,
  })
}

// Error message
export async function showError(title = 'Error', message = '') {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#ff6b6b',
    ...darkThemeConfig,
  })
}

// Loading modal
export async function showLoading(title = 'Procesando...') {
  return Swal.fire({
    title,
    didOpen: () => Swal.showLoading(),
    showConfirmButton: false,
    allowOutsideClick: false,
    ...darkThemeConfig,
  })
}

// Close modal
export function closeModal() {
  Swal.close()
}

// Generic alert
export async function showAlert(options = {}) {
  return Swal.fire({
    ...darkThemeConfig,
    ...options,
  })
}

export { Swal as default }
