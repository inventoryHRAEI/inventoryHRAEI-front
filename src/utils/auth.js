// Utilidades de autenticación: sistema basado en cookies httpOnly
import { windowManager } from './windowManager'

// BroadcastChannel para sincronizar logout entre pestañas
const authChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth_channel') : null

if (authChannel) {
  authChannel.onmessage = (event) => {
    if (event.data === 'logout') {
      // Limpiar datos locales cuando otra pestaña cierre sesión
      clearStoredSessionData()
      try { window.dispatchEvent(new Event('session:updated')) } catch {}
      // DESACTIVADO: window.location.href causa recargas infinitas
      // if (window.location.pathname !== '/') {
      //   window.location.href = '/'
      // }
    }
  }
}

// Escuchar eventos de logout desde ventana secundaria
// Desactivado: no recargar ni borrar sesión automáticamente por actividad duplicada
// if (typeof window !== 'undefined') {
//   window.addEventListener('storage', (e) => {
//     if (e.key === 'secondaryLogout' && windowManager.isActiveWindow()) {
//       clearStoredSessionData()
//       alert('Tu sesión fue cerrada porque se detectó actividad duplicada. Por favor, inicia sesión nuevamente.')
//       window.location.reload()
//     }
//   })
// }

// Contador de ventanas/pestañas abiertas
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Incrementar contador al abrir una ventana
  let windowCount = parseInt(localStorage.getItem('windowCount') || '0')
  windowCount++
  localStorage.setItem('windowCount', windowCount.toString())
  
  /*
  // Al cerrar la ventana, decrementar y si es la última, cerrar sesión
  window.addEventListener('beforeunload', async () => {
    let count = parseInt(localStorage.getItem('windowCount') || '1')
    count--
    
    if (count <= 0) {
      // Esta es la última ventana, cerrar sesión
      localStorage.removeItem('windowCount')
      try {
        // Hacer logout en el backend
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          keepalive: true // Importante para que funcione en beforeunload
        })
      } catch {}
      clearStoredSessionData()
      windowManager.cleanup()
    } else {
      localStorage.setItem('windowCount', count.toString())
    }
  })
  */
}

// Verificar si esta ventana es la activa
export function isActiveWindow() {
  return windowManager.isActiveWindow()
}

// Obtener token guardado en localStorage (sin logs para no saturar console)
export function getStoredToken() {
  try {
    const token = localStorage.getItem('token')
    return token || null
  } catch {
    return null
  }
}

// Guardar token en localStorage
export function saveToken(token) {
  try {
    if (!token) {
      console.warn('[auth] saveToken llamado con token vacío')
      return
    }
    console.log('[auth] Guardando token... (primeros 30 chars):', token.substring(0, 30))
    localStorage.setItem('token', token)
    console.log('[auth] ✓ Token guardado en localStorage')
    // Verificar que se guardó
    const verificar = localStorage.getItem('token')
    if (verificar) {
      console.log('[auth] ✓ Token verificado en localStorage')
    } else {
      console.error('[auth] ❌ Token NO se guardó en localStorage')
    }
  } catch (e) {
    console.error('[auth] ❌ No se pudo guardar token en localStorage:', e.message)
  }
}

// Validar sesión consultando al backend
export async function validateSession() {
  try {
    const token = getStoredToken()
    
    // Si no hay token guardado, la sesión no es válida
    if (!token) {
      console.log('[validateSession] ❌ No hay token guardado en localStorage')
      return { valid: false, authenticated: false }
    }
    
    console.log('[validateSession] ✓ Token encontrado. Enviando a backend... (primeros 30 chars):', token.substring(0, 30))
    
    const res = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include', // Envía cookies si existen
      headers: {
        'Authorization': `Bearer ${token}`, // IMPORTANTE: enviar token en header
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    console.log('[validateSession] Response status:', res.status)
    
    // Si el servidor no responde OK, la sesión no es válida
    if (!res.ok) {
      console.log('[validateSession] ❌ Validación falló con status:', res.status)
      clearStoredSessionData() // Limpiar si el token es inválido
      return { valid: false, authenticated: false }
    }
    
    const data = await res.json()
    console.log('[validateSession] Response data:', data)
    
    // Validar que la respuesta tenga estructura correcta
    if (data.authenticated && data.user) {
      // Guardar datos del usuario en localStorage para acceso rápido
      try {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('nombre', data.user.nombre || '')
        localStorage.setItem('role', data.user.role || 'user')
        localStorage.setItem('email', data.user.email || '')
        localStorage.setItem('sessionValidated', new Date().toISOString())
      } catch {}
      console.log('[validateSession] ✓ Sesión válida para:', data.user.email)
      return { valid: true, authenticated: true, user: data.user }
    }
    
    console.log('[validateSession] ❌ Respuesta sin authenticated=true:', data)
    clearStoredSessionData()
    return { valid: false, authenticated: false }
  } catch (error) {
    console.error('[validateSession] ❌ Error validando sesión:', error)
    return { valid: false, authenticated: false, error: error.message }
  }
}

// Refresh de token (used by inactivity keep-alive)
export async function refreshToken() {
  try {
    const token = getStoredToken()
    if (!token) return { ok: false }
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return { ok: false }
    const data = await res.json()
    if (data.token) saveToken(data.token)
    return { ok: true, token: data.token }
  } catch (e) {
    console.error('[refreshToken] Error refreshing token:', e)
    return { ok: false, error: e.message }
  }
}

// Logout: llama al backend y notifica a otras pestañas
export async function logout() {
  try {
    const token = getStoredToken()
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
  } catch (error) {
    console.error('Error en logout:', error)
  }
  
  // Destruir el manejador de inactividad al cerrar sesión
  try {
    const { default: inactivityHandler } = await import('./inactivityHandler')
    // Desactivar y limpiar INMEDIATAMENTE
    inactivityHandler.isEnabled = false
    inactivityHandler._clearAllTimers()
    inactivityHandler.destroy()
    console.log('[auth] ✅ Inactivity handler destruido')
  } catch (e) {
    console.warn('[auth] Error destruyendo inactivityHandler:', e)
  }
  
  // Notificar a otras pestañas
  if (authChannel) {
    authChannel.postMessage('logout')
  }
  
  // Notificar mediante windowManager
  windowManager.notifyLogout()
  
  // Limpiar datos locales
  clearStoredSessionData()
  try { window.dispatchEvent(new Event('session:updated')) } catch {}
}

export function clearStoredSessionData(){
  // Limpia cualquier dato cacheado del usuario en storage
  try { localStorage.removeItem('token') } catch {} // Limpiar token
  try { localStorage.removeItem('user') } catch {}
  try { localStorage.removeItem('nombre') } catch {}
  try { localStorage.removeItem('role') } catch {}
  try { localStorage.removeItem('email') } catch {}
  try { localStorage.removeItem('sessionValidated') } catch {}
}
