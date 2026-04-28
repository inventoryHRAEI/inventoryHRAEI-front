import { authedFetch } from '@/utils/api.js'

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).replace(/\/+$|\s+$/g, '')
  : ''
const DEFAULT_API_FALLBACK_URL = 'http://localhost:3002'

async function fetchWithFallback(url, options = {}) {
  let response = null
  try {
    response = await authedFetch(url, options)
  } catch (e) {
    response = null
  }

  if (response && response.status !== 404) {
    return response
  }

  const fallbackHost = API_BASE_URL || (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname) ? DEFAULT_API_FALLBACK_URL : '')
  if (!fallbackHost || !url.startsWith('/api')) {
    return response
  }

  const fallbackUrl = `${fallbackHost}${url}`
  try {
    return await authedFetch(fallbackUrl, options)
  } catch (e) {
    return response
  }
}

async function parseJson(res) {
  if (!res) return { res: null, data: null }
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { res, data }
}

export async function fetchDrafts(options = {}) {
  const keys = Array.isArray(options.keys) ? options.keys : []
  const includePayload = options.includePayload !== false
  const params = []
  if (keys.length) params.push(`keys=${encodeURIComponent(keys.join(','))}`)
  if (includePayload) params.push('includePayload=1')
  const url = params.length ? `/api/ops/drafts?${params.join('&')}` : '/api/ops/drafts'

  const res = await fetchWithFallback(url, { method: 'GET', skipSanitize: true })
  return parseJson(res)
}

export async function fetchDraft(key) {
  const draftKey = String(key || '').trim()
  if (!draftKey) return { res: null, data: null }
  const res = await fetchWithFallback(`/api/ops/drafts/${encodeURIComponent(draftKey)}`, { method: 'GET', skipSanitize: true })
  return parseJson(res)
}

export async function saveDraftRemote(key, payload, options = {}) {
  const draftKey = String(key || '').trim()
  if (!draftKey || !payload) return { res: null, data: null }
  const body = {
    payload,
    clientUpdatedAt: options.clientUpdatedAt || null,
    version: typeof options.version === 'number' ? options.version : null
  }
  const res = await fetchWithFallback(`/api/ops/drafts/${encodeURIComponent(draftKey)}`, {
    method: 'PUT',
    body,
    skipSanitize: true
  })
  return parseJson(res)
}

export async function deleteDraftRemote(key) {
  const draftKey = String(key || '').trim()
  if (!draftKey) return { res: null, data: null }
  const res = await fetchWithFallback(`/api/ops/drafts/${encodeURIComponent(draftKey)}`, { method: 'DELETE', skipSanitize: true })
  return parseJson(res)
}

export async function clearDraftsRemote() {
  const res = await fetchWithFallback('/api/ops/drafts', { method: 'DELETE', skipSanitize: true })
  return parseJson(res)
}
