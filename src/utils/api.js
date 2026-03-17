// Utilitario para peticiones autenticadas con cookies httpOnly

export async function authedFetch(url, options = {}) {
  const headers = new Headers(options.headers || {})
  // Añade Content-Type JSON si hay body string u objeto y no está definido
  const hasBody = options.body !== undefined && options.body !== null
  const contentTypeSet = [...headers.keys()].some(k => k.toLowerCase() === 'content-type')
  // NO agregar Content-Type si el body es FormData (el navegador lo hace automáticamente)
  const isFormData = options.body instanceof FormData
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
  let body = options.body
  if (hasBody && !isFormData) {
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

  const init = {
    ...options,
    headers,
    credentials: 'include', // IMPORTANTE: envía cookies en cada request
    body
  }
  console.debug('[authedFetch] ', url, init)
  return fetch(url, init)
}

// Helper opcional: GET JSON con auth
export async function getJson(url) {
  const res = await authedFetch(url)
  const data = await (async () => { try { return await res.json() } catch { return null } })()
  return { res, data }
}
