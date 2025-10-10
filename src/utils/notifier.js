import { toast as toastify } from 'vue3-toastify'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

function isMobile() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

async function mobileSwal(payload, type = 'info') {
  const config = {
    title: typeof payload === 'string' ? '' : (payload.title || ''),
    text: typeof payload === 'string' ? payload : (payload.text || payload.message || ''),
    icon: type,
    confirmButtonText: payload && payload.confirmText ? payload.confirmText : 'Aceptar',
    allowOutsideClick: true,
    showCloseButton: true,
    width: '90%'
  }
  try {
    await Swal.fire(config)
  } catch (e) { /* ignore */ }
}

export const notifier = {
  success(msg, opts = {}) {
    if (isMobile()) mobileSwal(msg, 'success')
    else toastify.success(msg, opts)
  },
  error(msg, opts = {}) {
    if (isMobile()) mobileSwal(msg, 'error')
    else toastify.error(msg, opts)
  },
  info(msg, opts = {}) {
    if (isMobile()) mobileSwal(msg, 'info')
    else toastify.info(msg, opts)
  }
}

export default notifier
