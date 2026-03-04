// Utilitario para peticiones autenticadas con cookies httpOnly

export async function authedFetch(url, options = {}) {
  const headers = new Headers(options.headers || {})
  // Añade Content-Type JSON si hay body string u objeto y no está definido
  const hasBody = options.body !== undefined && options.body !== null
  const contentTypeSet = [...headers.keys()].some(k => k.toLowerCase() === 'content-type')
  if (hasBody && !contentTypeSet) headers.set('Content-Type', 'application/json')

  // Añadir Authorization: Bearer <token> automáticamente si existe token en localStorage
  try {
    const token = localStorage.getItem('token')
    if (token && ![...headers.keys()].some(k => k.toLowerCase() === 'authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  } catch (e) {
    // Ignorar si localStorage no está disponible
  }
  
  const init = {
    ...options,
    headers,
    credentials: 'include' // IMPORTANTE: envía cookies en cada request
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
