// Utilidades de autenticación: token en sessionStorage (por pestaña) o localStorage (persistente)

export function setAuthToken(token, options = {}){
  const remember = !!(options && options.remember)
  // Limpieza previa para evitar estados mezclados
  try { localStorage.removeItem('token') } catch {}
  try { sessionStorage.removeItem('token') } catch {}
  if (!token) {
    // Notificar cambio de sesión aunque sea logout
    try { window.dispatchEvent(new Event('session:updated')) } catch {}
    return
  }
  if (remember) {
    // Persistir si el usuario marcó "Recordarme"
    localStorage.setItem('token', token)
  } else {
    // Guardar por sesión de pestaña: sobrevive recargas/HMR pero se limpia al cerrar la pestaña
    sessionStorage.setItem('token', token)
  }
  // Notificar al resto de la app que la sesión cambió
  try { window.dispatchEvent(new Event('session:updated')) } catch {}
}

export function getAuthToken(){
  // Prioriza sessionStorage (token de esta pestaña); si no hay, usa el persistente (localStorage)
  try {
    const s = sessionStorage.getItem('token')
    if (s) return s
  } catch {}
  try { return localStorage.getItem('token') } catch { return null }
}

export function clearAuthToken(){
  try { localStorage.removeItem('token') } catch {}
  try { sessionStorage.removeItem('token') } catch {}
  try { window.dispatchEvent(new Event('session:updated')) } catch {}
}

export function clearStoredSessionData(){
  // Limpia tokens y cualquier dato cacheado del usuario en storage
  clearAuthToken()
  try { localStorage.removeItem('user') } catch {}
  try { localStorage.removeItem('nombre') } catch {}
  try { localStorage.removeItem('role') } catch {}
  try { localStorage.removeItem('email') } catch {}
}
