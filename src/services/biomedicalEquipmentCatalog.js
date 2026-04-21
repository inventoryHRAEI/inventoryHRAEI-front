import { ref } from 'vue'
import { authedFetch } from '@/utils/api.js'
import { cacheGet, cacheSet, cacheDel } from '@/utils/persistentCache.js'

const ENDPOINT = '/api/ops/equipos-medicos'
const CACHE_KEY = 'biomed:equipos-medicos:v2'
const TTL_MS = 5 * 60 * 1000 // 5 minutos

// Estado singleton (compartido por toda la app)
const rows = ref([])
const total = ref(0)
const fullyLoaded = ref(false)
const isLoading = ref(false)
const error = ref(null)

let lastFetchAt = 0
let loadingPromise = null
let firstPagePromise = null
let resolveFirstPage = null
let activeRunId = 0
let activeAbortController = null

function setRows(nextRows) {
  rows.value = Array.isArray(nextRows) ? nextRows : []
}

function isFresh() {
  return lastFetchAt && (Date.now() - lastFetchAt) < TTL_MS
}

async function hydrateFromCache() {
  const cached = await cacheGet(CACHE_KEY, { ttlMs: TTL_MS })
  if (!cached || typeof cached !== 'object') return false

  const cachedRows = Array.isArray(cached.rows) ? cached.rows : []
  if (cachedRows.length) setRows(cachedRows)
  total.value = Number(cached.total || 0)
  fullyLoaded.value = Boolean(cached.meta && cached.meta.fullyLoaded)
  lastFetchAt = Number(cached.meta && cached.meta.lastFetchAt) || Date.now()
  return cachedRows.length > 0
}

async function fetchPage({ limit, skip, signal }) {
  const url = `${ENDPOINT}?withTotal=1&limit=${encodeURIComponent(String(limit))}&skip=${encodeURIComponent(String(skip))}`
  const res = await authedFetch(url, { signal })
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  const data = await res.json().catch(() => null)
  const items = data && data.ok && Array.isArray(data.data) ? data.data : []
  const t = (data && typeof data.total === 'number') ? data.total : items.length
  return { items, total: t }
}

async function loadProgressively({ firstBatch = 500, safeBatch = 500 } = {}) {
  const myRunId = ++activeRunId
  if (activeAbortController) {
    try { activeAbortController.abort() } catch (e) {}
  }
  activeAbortController = new AbortController()

  fullyLoaded.value = false
  error.value = null

  // 1) First batch (fast availability for suggestions)
  const first = await fetchPage({ limit: firstBatch, skip: 0, signal: activeAbortController.signal })
  if (myRunId !== activeRunId) return rows.value

  setRows(first.items)
  total.value = Number(first.total || first.items.length || 0)
  if (typeof resolveFirstPage === 'function') {
    try { resolveFirstPage(rows.value) } catch (e) {}
    resolveFirstPage = null
  }

  // 2) Remaining batches in background
  let accumulated = rows.value.length
  const t = Number(total.value || accumulated)
  const batchSizes = [safeBatch, 300, 200, 100].filter((v, idx, arr) => v && arr.indexOf(v) === idx)

  while (accumulated < t) {
    if (myRunId !== activeRunId) return rows.value

    let page = null
    let succeeded = false
    for (const candidate of batchSizes) {
      try {
        page = await fetchPage({ limit: candidate, skip: accumulated, signal: activeAbortController.signal })
        succeeded = true
        break
      } catch (e) {
        const status = Number(e && e.status)
        if (status === 500 || status === 502 || status === 503 || status === 504) continue
        throw e
      }
    }

    if (!succeeded || !page || !Array.isArray(page.items) || page.items.length === 0) break
    if (myRunId !== activeRunId) return rows.value

    rows.value = rows.value.concat(page.items)
    accumulated = rows.value.length
    // yield
    await new Promise(r => setTimeout(r, 30))
  }

  if (myRunId !== activeRunId) return rows.value
  fullyLoaded.value = true
  lastFetchAt = Date.now()
  await cacheSet(CACHE_KEY, {
    rows: rows.value,
    total: total.value,
    meta: { fullyLoaded: true, lastFetchAt }
  })

  return rows.value
}

export async function ensureBiomedicalEquipmentCatalogLoaded({ force = false, full = false } = {}) {
  // 0) Si está full y fresco, retornar
  if (!force && fullyLoaded.value && rows.value.length && isFresh()) return rows.value

  // 1) Hidratar de cache persistente (si existe)
  try {
    if (!rows.value.length) {
      await hydrateFromCache()
    }
  } catch {
    // ignore
  }

  // 2) Si hay algo en memoria y no se pidió full, retornar inmediato
  if (!force && rows.value.length && !full) return rows.value

  // 3) Single-flight
  if (loadingPromise) {
    if (full) return loadingPromise
    if (firstPagePromise) return firstPagePromise
    return loadingPromise
  }

  isLoading.value = true
  error.value = null

  // Promesa que resuelve cuando el primer batch está listo
  firstPagePromise = new Promise((resolve) => {
    resolveFirstPage = resolve
  })

  loadingPromise = (async () => {
    try {
      return await loadProgressively({ firstBatch: 500, safeBatch: 500 })
    } catch (err) {
      error.value = err?.message || 'Error al cargar catálogo de equipos médicos'
      throw err
    } finally {
      isLoading.value = false
      loadingPromise = null
      firstPagePromise = null
      resolveFirstPage = null
    }
  })()

  return full ? loadingPromise : firstPagePromise
}

export async function refreshBiomedicalEquipmentCatalog() {
  return ensureBiomedicalEquipmentCatalogLoaded({ force: true, full: true })
}

export async function invalidateBiomedicalEquipmentCatalog() {
  setRows([])
  total.value = 0
  fullyLoaded.value = false
  lastFetchAt = 0
  error.value = null
  try {
    await cacheDel(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function getBiomedicalEquipmentCatalogState() {
  return {
    rows,
    total,
    fullyLoaded,
    isLoading,
    error
  }
}

// Arranque en background (no falla duro si el usuario aún no está autenticado)
export function getBiomedicalEquipmentCatalogSnapshot() {
  return {
    rows: Array.isArray(rows.value) ? rows.value : [],
    total: Number(total.value || 0),
    fullyLoaded: Boolean(fullyLoaded.value),
    isLoading: Boolean(isLoading.value),
    lastFetchAt: Number(lastFetchAt || 0),
    isFresh: Boolean(isFresh())
  }
}

export function warmupBiomedicalEquipmentCatalog() {
  // Precarga agresiva: primer batch rápido + resto en background (single-flight)
  ensureBiomedicalEquipmentCatalogLoaded({ full: true }).catch(() => {})
}
