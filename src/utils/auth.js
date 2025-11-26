// Utilidades de autenticación: sistema basado en cookies httpOnly

// BroadcastChannel para sincronizar logout entre pestañas
const authChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth_channel') : null

if (authChannel) {
  authChannel.onmessage = (event) => {
    if (event.data === 'logout') {
      // Limpiar datos locales cuando otra pestaña cierre sesión
      clearStoredSessionData()
      try { window.dispatchEvent(new Event('session:updated')) } catch {}
      // Redirigir a home
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
  }
}

// Contador de ventanas/pestañas abiertas
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Incrementar contador al abrir una ventana
  let windowCount = parseInt(localStorage.getItem('windowCount') || '0')
  windowCount++
  localStorage.setItem('windowCount', windowCount.toString())
  
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
    } else {
      localStorage.setItem('windowCount', count.toString())
    }
  })
}

// Validar sesión consultando al backend
export async function validateSession() {
  try {
    const res = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include' // Importante: envía las cookies
    })
    if (!res.ok) {
      return { valid: false, authenticated: false }
    }
    const data = await res.json()
    if (data.authenticated && data.user) {
      // Guardar datos del usuario en localStorage para acceso rápido
      try {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('nombre', data.user.nombre || '')
        localStorage.setItem('role', data.user.role || 'user')
        localStorage.setItem('email', data.user.email || '')
      } catch {}
      return { valid: true, authenticated: true, user: data.user }
    }
    return { valid: false, authenticated: false }
  } catch (error) {
    console.error('Error validando sesión:', error)
    return { valid: false, authenticated: false, error: error.message }
  }
}

// Logout: llama al backend y notifica a otras pestañas
export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Error en logout:', error)
  }
  
  // Notificar a otras pestañas
  if (authChannel) {
    authChannel.postMessage('logout')
  }
  
  // Limpiar datos locales
  clearStoredSessionData()
  try { window.dispatchEvent(new Event('session:updated')) } catch {}
}

export function clearStoredSessionData(){
  // Limpia cualquier dato cacheado del usuario en storage
  try { localStorage.removeItem('user') } catch {}
  try { localStorage.removeItem('nombre') } catch {}
  try { localStorage.removeItem('role') } catch {}
  try { localStorage.removeItem('email') } catch {}
}
