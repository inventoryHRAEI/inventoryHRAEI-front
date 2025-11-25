import { getAuthToken } from './auth'

function parseJwtPayload(token) {
  const parts = token.split('.')
  if (parts.length < 2) throw new Error('Invalid token format')
  const payloadSegment = parts[1]
  const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4)
  if (typeof atob === 'function') {
    return JSON.parse(atob(padded))
  }
  if (typeof Buffer !== 'undefined') {
    const json = Buffer.from(padded, 'base64').toString('utf-8')
    return JSON.parse(json)
  }
  throw new Error('No base64 decoder available')
}

export async function validateSession(options = {}) {
  const token = getAuthToken()
  if (!token) return { valid: false, reason: 'missing-token' }
  try {
    const payload = parseJwtPayload(token)
    let user = null
    try {
      const stored = localStorage.getItem('user')
      if (stored) user = JSON.parse(stored)
    } catch {}
    const expSeconds = typeof payload.exp === 'number' ? payload.exp : null
    if (!expSeconds) return { valid: true, payload, expiresAt: null, user }
    const expiresAt = expSeconds * 1000
    const now = Date.now()
    const skew = options.clockSkewMs && options.clockSkewMs > 0 ? options.clockSkewMs : 0
    if (now >= expiresAt - skew) return { valid: false, reason: 'expired', expiresAt, payload, user }
    return { valid: true, payload, expiresAt, user }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { valid: false, reason: 'malformed-token', error: message }
  }
}
