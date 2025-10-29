import { push } from 'notivue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

function isMobile() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

// Toast discreto en móvil usando SweetAlert2 en modo toast
async function mobileSwal(payload, type = 'info') {
  const text = typeof payload === 'string' ? payload : (payload.text || payload.message || '')
  try { Swal.close() } catch(e) { /* ensure previous toast is closed to avoid stacking */ }
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom',
    showConfirmButton: false,
    timer: 1380,
    timerProgressBar: true,
    background: 'rgba(255,255,255,0.95)',
    color: '#0b2540',
    showCloseButton: false,
    showClass: { popup: 'swal2-toast-fade-in' },
    hideClass: { popup: 'swal2-toast-fade-out' },
  })
  try { await Toast.fire({ icon: type, title: text }) } catch (e) { /* ignore */ }
}

// Opciones por defecto para Notivue (web)
const baseWebOpts = {
  duration: 1160
}

export const notifier = {
  success(msg, opts = {}) {
    if (isMobile()) mobileSwal(msg, 'success')
    else push.success(typeof msg === 'string' ? msg : (msg.text || msg.message || ''), { ...baseWebOpts, ...opts })
  },
  error(msg, opts = {}) {
    if (isMobile()) mobileSwal(msg, 'error')
    else push.error(typeof msg === 'string' ? msg : (msg.text || msg.message || ''), { ...baseWebOpts, ...opts })
  },
  info(msg, opts = {}) {
    if (isMobile()) mobileSwal(msg, 'info')
    else push.info(typeof msg === 'string' ? msg : (msg.text || msg.message || ''), { ...baseWebOpts, ...opts })
  }
}

export default notifier
