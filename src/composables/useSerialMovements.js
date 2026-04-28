import { reactive } from 'vue'
import { authedFetch } from '@/utils/api.js'
import notifier from '@/utils/notifier'

const serialHistoryStore = reactive({})

const normalizeSerial = (serial) => {
  const raw = String(serial || '').trim()
  if (!raw) return ''
  if (raw.toUpperCase() === 'N/A') return ''
  return raw
}

const hasSalidaRecord = (record) => {
  if (!record || typeof record !== 'object') return false
  const text = `${record.type || record.tipo || record.action || record.accion || ''}`.toLowerCase()
  if (text.includes('salida') || text.includes('exit')) return true
  const note = `${record.note || record.nota || ''}`.toLowerCase()
  if (note.includes('salida')) return true
  return false
}

export async function loadSerialHistory(serial, clave = '') {
  const key = normalizeSerial(serial)
  if (!key) return
  const existing = serialHistoryStore[key]
  if (existing?.loading) return
  if (existing?.loaded) return

  serialHistoryStore[key] = { loading: true, data: [], error: null, loaded: false, hasSalida: false }
  try {
    const query = new URLSearchParams()
    if (clave && String(clave || '').trim()) {
      query.set('clave', String(clave || '').trim())
    }
    const url = `/api/devices/${encodeURIComponent(key)}/movements${query.toString() ? `?${query.toString()}` : ''}`
    const res = await authedFetch(url)
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const message = (body && (body.msg || body.error)) || `HTTP ${res.status}`
      throw new Error(message)
    }

    const rows = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
        ? body.items
        : Array.isArray(body?.data)
          ? body.data
          : []
    const hasSalida = rows.some(hasSalidaRecord)
    serialHistoryStore[key] = {
      loading: false,
      data: rows,
      error: null,
      loaded: true,
      hasSalida
    }
  } catch (err) {
    serialHistoryStore[key] = {
      loading: false,
      data: [],
      error: err?.message || 'No fue posible cargar el historial',
      loaded: true,
      hasSalida: false
    }
    notifier.error(err?.message || 'No fue posible cargar el historial del serial')
  }
}

export function getHistoryState(serial) {
  const key = normalizeSerial(serial)
  if (!key) return null
  return serialHistoryStore[key] || null
}

export function isValidSerial(serial) {
  return Boolean(normalizeSerial(serial))
}

export function hasSerialSalida(serial) {
  const state = getHistoryState(serial)
  return Boolean(state?.hasSalida)
}

export function useSerialMovements() {
  return {
    normalizeSerial,
    getHistoryState,
    hasSerialSalida,
    isValidSerial,
    loadSerialHistory
  }
}
