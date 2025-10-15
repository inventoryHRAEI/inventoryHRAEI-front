// Utilitario para peticiones autenticadas con token almacenado en localStorage

export async function authedFetch(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers || {})
  // Añade Content-Type JSON si hay body string u objeto y no está definido
  const hasBody = options.body !== undefined && options.body !== null
  const contentTypeSet = [...headers.keys()].some(k => k.toLowerCase() === 'content-type')
  if (hasBody && !contentTypeSet) headers.set('Content-Type', 'application/json')
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
  const init = { ...options, headers }
  return fetch(url, init)
}

// Helper opcional: GET JSON con auth
export async function getJson(url) {
  const res = await authedFetch(url)
  const data = await (async () => { try { return await res.json() } catch { return null } })()
  return { res, data }
}
