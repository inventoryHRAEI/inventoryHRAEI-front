// Utilitario para peticiones autenticadas con cookies httpOnly

export async function authedFetch(url, options = {}) {
  const { skipSanitize, ...rest } = options
  const headers = new Headers(rest.headers || {})
  // Añade Content-Type JSON si hay body string u objeto y no está definido
  const hasBody = rest.body !== undefined && rest.body !== null
  const contentTypeSet = [...headers.keys()].some(k => k.toLowerCase() === 'content-type')
  // NO agregar Content-Type si el body es FormData (el navegador lo hace automáticamente)
  const isFormData = rest.body instanceof FormData
  if (hasBody && !contentTypeSet && !isFormData) headers.set('Content-Type', 'application/json')

  // Añadir Authorization: Bearer <token> automáticamente si existe token en localStorage
  try {
    const token = localStorage.getItem('token')
    if (token && ![...headers.keys()].some(k => k.toLowerCase() === 'authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  } catch (e) {
    // Ignorar si localStorage no está disponible
  }
  
  // sanitize JSON body automatically before sending (but skip FormData)
  let body = rest.body
  if (hasBody && !isFormData && !skipSanitize) {
    try {
      // only try to parse if the payload is not already a string
      if (typeof body !== 'string') {
        const { sanitizeObject } = await import('@/utils/sanitizer.js')
        body = sanitizeObject(body)
      }
    } catch (e) {
      console.warn('[authedFetch] error sanitizing body', e)
    }
    // re-stringify if we sanitized a plain object
    if (typeof body !== 'string') {
      body = JSON.stringify(body)
    }
  }

  // Ensure non-string, non-FormData bodies are stringified even when skipSanitize=true
  if (hasBody && !isFormData && typeof body !== 'string') {
    try {
      body = JSON.stringify(body)
    } catch (e) {
      console.warn('[authedFetch] could not stringify body', e)
    }
  }

  const init = {
    ...rest,
    headers,
    credentials: 'include', // IMPORTANTE: envía cookies en cada request
    body
  }
  console.debug('[authedFetch] ', url, init)

  // Marcar actividad antes de ejecutar la petición para evitar falsos timeouts
  try {
    const inactivity = await import('./inactivityHandler')
    try { inactivity.default.pulse() } catch {}
  } catch (e) {
    // ignore if inactivity handler not available
  }

  // Best-effort token refresh if it is close to expiring
  try {
    const auth = await import('./auth.js')
    if (auth.refreshTokenIfNeeded) {
      await auth.refreshTokenIfNeeded()
    }
  } catch (e) {
    // ignore refresh errors here; request may still succeed
  }

  // Ejecutar la petición y si recibimos 401 intentar refrescar token una vez
  let res = await fetch(url, init)
  try {
    if (res && res.status === 401) {
      // Intentar refrescar token (inactivity handler o auth util)
      try {
        const auth = await import('./auth.js')
        console.warn('[authedFetch] 401 recibido, intentando refreshToken...')
        const refreshed = await auth.refreshToken()
        if (refreshed && refreshed.ok) {
          // Update Authorization header with new token and retry
          const token = auth.getStoredToken()
          if (token) {
            headers.set('Authorization', `Bearer ${token}`)
            const retryInit = { ...init, headers }
            console.debug('[authedFetch] Reintentando petición con token renovado', url)
            res = await fetch(url, retryInit)
            if (res && res.status !== 401) return res
          }
        }

        const unauthorized = refreshed && (refreshed.status === 401 || refreshed.status === 403)
        if (unauthorized) {
          try { await auth.logout() } catch (e) { console.warn('[authedFetch] logout tras 401 falló:', e) }
          return res
        }
      } catch (e) {
        console.warn('[authedFetch] refreshToken falló:', e)
      }
    }
  } catch (e) {
    console.warn('[authedFetch] error handling 401:', e)
  }

  return res
}

// Helper opcional: GET JSON con auth
export async function getJson(url) {
  const res = await authedFetch(url)
  const data = await (async () => { try { return await res.json() } catch { return null } })()
  return { res, data }
}
