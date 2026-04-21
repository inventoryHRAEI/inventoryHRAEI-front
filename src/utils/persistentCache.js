import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval'

const PREFIX = 'inv:cache:'

function fullKey(key) {
  return `${PREFIX}${String(key || '')}`
}

export async function cacheGet(key, { ttlMs } = {}) {
  try {
    const entry = await idbGet(fullKey(key))
    if (!entry || typeof entry !== 'object') return null
    const at = Number(entry.at || 0)
    if (ttlMs && at && (Date.now() - at) > ttlMs) {
      try { await idbDel(fullKey(key)) } catch {}
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

export async function cacheSet(key, value) {
  try {
    await idbSet(fullKey(key), { at: Date.now(), value })
  } catch {
    // ignore (private mode / blocked storage)
  }
}

export async function cacheDel(key) {
  try { await idbDel(fullKey(key)) } catch {}
}

// Elimina todas las entradas del cache con el prefijo definido (síncrono desde la API del cliente)
export async function cacheClearAll() {
  try {
    const allKeys = await idbKeys()
    if (!Array.isArray(allKeys)) return
    for (const k of allKeys) {
      try {
        if (typeof k === 'string' && k.startsWith(PREFIX)) {
          await idbDel(k)
        }
      } catch (e) { /* ignore individual key errors */ }
    }
  } catch (e) {
    // ignore global failure
  }
}
