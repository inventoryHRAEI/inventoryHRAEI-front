// Utilidades de autenticación: sistema basado en cookies httpOnly
import { windowManager } from './windowManager'

const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000
const TOKEN_REFRESH_MIN_INTERVAL_MS = 60 * 1000
let refreshInFlight = null

function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.')
    if (parts.length < 2) return null
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = payload.length % 4
    if (pad) payload += '='.repeat(4 - pad)
    const json = atob(payload)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getTokenExpMs(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload && payload.exp ? Number(payload.exp) : null
  if (!exp || !Number.isFinite(exp)) return null
  return exp * 1000
}

function getCachedUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

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
      if (res.status === 401 || res.status === 403) {
        clearStoredSessionData()
        return { valid: false, authenticated: false, status: res.status, reason: 'unauthorized' }
      }

      const cachedUser = getCachedUser()
      const expMs = getTokenExpMs(token)
      const notExpired = expMs && expMs > Date.now()
      if (cachedUser && notExpired) {
        return { valid: true, authenticated: true, user: cachedUser, status: res.status, reason: 'transient', stale: true }
      }
      return { valid: false, authenticated: false, status: res.status, reason: 'transient' }
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
    return { valid: false, authenticated: false, reason: 'invalid-response' }
  } catch (error) {
    console.error('[validateSession] ❌ Error validando sesión:', error)
    const token = getStoredToken()
    const cachedUser = getCachedUser()
    const expMs = token ? getTokenExpMs(token) : null
    const notExpired = expMs && expMs > Date.now()
    if (cachedUser && notExpired) {
      return { valid: true, authenticated: true, user: cachedUser, reason: 'network', stale: true, error: error.message }
    }
    return { valid: false, authenticated: false, reason: 'network', error: error.message }
  }
}

export async function refreshTokenIfNeeded(options = {}) {
  const token = getStoredToken()
  if (!token) return { ok: false, skipped: true, reason: 'no-token' }

  const expMs = getTokenExpMs(token)
  if (!expMs) return { ok: false, skipped: true, reason: 'no-exp' }

  const now = Date.now()
  if (expMs <= now) return { ok: false, skipped: true, reason: 'expired' }

  const skewMs = typeof options.skewMs === 'number' ? options.skewMs : TOKEN_REFRESH_SKEW_MS
  const minIntervalMs = typeof options.minIntervalMs === 'number' ? options.minIntervalMs : TOKEN_REFRESH_MIN_INTERVAL_MS
  if (expMs - now > skewMs) return { ok: true, skipped: true, reason: 'not-needed' }

  let last = 0
  try { last = parseInt(localStorage.getItem('tokenLastRefreshAt') || '0', 10) } catch {}
  if (last && now - last < minIntervalMs) {
    return { ok: true, skipped: true, reason: 'throttled' }
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const result = await refreshToken()
      if (result && result.ok) {
        try { localStorage.setItem('tokenLastRefreshAt', String(Date.now())) } catch {}
      }
      return result
    })().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
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
    if (!res.ok) {
      // Log detallado para diagnosticar por qué el refresh falla (401/500 etc.)
      let text = null
      try { text = await res.text() } catch (e) { text = String(e) }
      console.warn('[refreshToken] Refresh failed. status=%d, body=%s', res.status, text)
      return { ok: false, status: res.status, body: text }
    }
    const data = await res.json()
    if (data.token) {
      saveToken(data.token)
      try { localStorage.setItem('tokenLastRefreshAt', String(Date.now())) } catch {}
    }
    return { ok: true, token: data.token }
  } catch (e) {
    console.error('[refreshToken] Error refreshing token:', e)
    return { ok: false, error: e.message }
  }
}

// Logout: llama al backend y notifica a otras pestañas
export async function logout() {
  try {
    if (typeof window !== 'undefined') {
      try { window.dispatchEvent(new Event('wizard:draft:flush')) } catch {}
      try {
        const handlers = (window.__wizardDraftSaveHandlers || {})
        Object.keys(handlers).forEach((k) => {
          try { handlers[k]() } catch (e) { console.warn('[auth] wizardDraftSaveHandler failed for', k, e) }
        })
      } catch (e) { console.warn('[auth] Error invoking draft save handlers', e) }

      try {
        const syncHandlers = (window.__wizardDraftSyncHandlers || {})
        const tasks = Object.keys(syncHandlers).map((k) => {
          try { return Promise.resolve(syncHandlers[k]()) } catch (e) { console.warn('[auth] wizardDraftSyncHandler failed for', k, e); return null }
        }).filter(Boolean)
        if (tasks.length) {
          await Promise.race([
            Promise.allSettled(tasks),
            new Promise(resolve => setTimeout(resolve, 800))
          ])
        }
      } catch (e) { console.warn('[auth] Error invoking remote draft handlers', e) }
    }
  } catch (e) {
    console.warn('[auth] draft flush before logout failed', e)
  }
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
  try { localStorage.removeItem('tokenLastRefreshAt') } catch {}
  try { localStorage.removeItem('tokenExpMs') } catch {}
}
