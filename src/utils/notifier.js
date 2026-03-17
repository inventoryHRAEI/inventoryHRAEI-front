// Notyf se importa en main.js - acceso via window.__notyf
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

// Detectar si estamos en contexto de wizard para z-index alto
function isInWizardContext() {
  return document.querySelector('.wizard-card, .op-wizard, .operations-wizard')
}

// Obtener instancia de Notyf
function getNotyf() {
  return window.__notyf
}

export const notifier = {
  success(msg, opts = {}) {
    if (isMobile()) {
      mobileSwal(msg, 'success')
    } else {
      const notyf = getNotyf()
      if (notyf) {
        const notification = notyf.success(typeof msg === 'string' ? msg : (msg.text || msg.message || ''))
        
        // Si estamos en wizard, añadir z-index alto
        if (isInWizardContext() && notification) {
          setTimeout(() => {
            const notifEl = document.querySelector('.notyf__toast:last-child')
            if (notifEl) notifEl.style.zIndex = '2147483650'
          }, 10)
        }
      }
    }
  },
  error(msg, opts = {}) {
    if (isMobile()) {
      mobileSwal(msg, 'error')
    } else {
      const notyf = getNotyf()
      if (notyf) {
        const notification = notyf.error(typeof msg === 'string' ? msg : (msg.text || msg.message || ''))
        
        // Si estamos en wizard, añadir z-index alto
        if (isInWizardContext() && notification) {
          setTimeout(() => {
            const notifEl = document.querySelector('.notyf__toast:last-child')
            if (notifEl) notifEl.style.zIndex = '2147483650'
          }, 10)
        }
      }
    }
  },
  info(msg, opts = {}) {
    if (isMobile()) {
      mobileSwal(msg, 'info')
    } else {
      const notyf = getNotyf()
      if (notyf) {
        const notification = notyf.open({
          type: 'info',
          message: typeof msg === 'string' ? msg : (msg.text || msg.message || '')
        })
        
        // Si estamos en wizard, añadir z-index alto
        if (isInWizardContext() && notification) {
          setTimeout(() => {
            const notifEl = document.querySelector('.notyf__toast:last-child')
            if (notifEl) notifEl.style.zIndex = '2147483650'
          }, 10)
        }
      }
    }
  },
  warn(msg, opts = {}) {
    if (isMobile()) {
      mobileSwal(msg, 'warning')
    } else {
      const notyf = getNotyf()
      if (notyf) {
        const notification = notyf.open({
          type: 'warning',
          message: typeof msg === 'string' ? msg : (msg.text || msg.message || '')
        })
        
        // Si estamos en wizard, añadir z-index alto
        if (isInWizardContext() && notification) {
          setTimeout(() => {
            const notifEl = document.querySelector('.notyf__toast:last-child')
            if (notifEl) notifEl.style.zIndex = '2147483650'
          }, 10)
        }
      }
    }
  }
}

export default notifier
