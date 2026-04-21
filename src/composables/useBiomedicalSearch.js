import { ref, computed, nextTick } from 'vue'
import { cacheGet, cacheSet, cacheDel } from '@/utils/persistentCache.js'

// Simple cache para evitar búsquedas repetidas
const searchCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos
const PERSIST_TTL = 24 * 60 * 60 * 1000 // 24 horas (se revalida en background)
const EQUIPMENT_ENDPOINT = '/api/ops/equipos-medicos'

// Timer tracking to avoid console.time collisions
const activeTimers = new Map()
let timerSequence = 0

function startTimer(label) {
  try {
    const token = `${label}#${++timerSequence}`
    console.time(token)
    activeTimers.set(token, true)
    return token
  } catch (e) {
    return null
  }
}

function endTimer(token) {
  try {
    if (token && activeTimers.has(token)) {
      console.timeEnd(token)
      activeTimers.delete(token)
    }
  } catch (e) {}
}

export function useBiomedicalSearch() {
  const allData = ref([])
  const filteredData = ref([])
  const loading = ref(false)
  const metaError = ref('')
  const serverTotal = ref(null)
  const mobileLimitApplied = ref(false)
  // Local, non-reactive storage for remaining items per queryKey
  const localRemaining = new Map()
  const FIRST_BATCH = 12
  const FIRST_PAGE_SIZE = 24
  const SAFE_BATCH_DEFAULT = 500
  const SAFE_BATCH_FALLBACKS = [500, 300, 200, 100]
  const SERVER_SIDE_FORCE_THRESHOLD = 500 // keep in sync with view threshold
  // --- Instrumentation for hypothesis testing ---
  let runSearchCalls = 0
  let fetchCalls = 0
  let lastFetchedItems = null

  // Cancellation / single-flight for progressive background loading
  let activeRunId = 0
  let activeAbortController = null
  // expose a simple test API on window for remote phases
  try {
    if (typeof window !== 'undefined') {
      window.__BIOMED_TEST__ = window.__BIOMED_TEST__ || {}
    }
  } catch (e) {}

  function hasRealValue(v) {
    if (v === null || v === undefined) return false
    const s = String(v).trim().toLowerCase()
    return s && !['n/a', 'sin clave', 'sin datos', 'no disponible', 'na'].includes(s)
  }

  function computeHasRealData(it) {
    const fieldsToCheck = [
      ['EQUIPO MÉDICO', 'EQUIPO MEDICO', 'EQUIPO_MEDICO'],
      ['MARCA'],
      ['MODELO'],
      ['CLAVE CNIS'],
      ['No. DE INVENTARIO', 'No DE INVENTARIO', 'N_DE_INVENTARIO']
    ]
    let realCount = 0
    for (const candidates of fieldsToCheck) {
      if ((candidates || []).some(f => hasRealValue(it && it[f]))) realCount++
    }
    return realCount >= 3
  }

  // Heurística para detectar filas *probablemente* mock o de prueba
  // - Todas las columnas clave vacías o no-reales
  // - O el texto contiene palabras indicadoras como 'mock', 'test', 'maqueta', 'placeholder'
  function isLikelyMock(item) {
    try {
      if (!item || typeof item !== 'object') return true
      const keys = [
        ['EQUIPO MÉDICO', 'EQUIPO MEDICO', 'EQUIPO_MEDICO'],
        ['MARCA'],
        ['MODELO'],
        ['CLAVE CNIS'],
        ['No. DE INVENTARIO', 'No DE INVENTARIO', 'N_DE_INVENTARIO']
      ]
      const allEmpty = keys.every(group => group.every(k => !hasRealValue(item[k])))
      if (allEmpty) return true
      const s = JSON.stringify(item).toLowerCase()
      if (s.includes('mock') || s.includes('test') || s.includes('maqueta') || s.includes('placeholder')) return true
      return false
    } catch (e) { return false }
  }

  function applyMobileLimit(items) {
    try {
        const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4))
        // En escritorio/local no limitar: 2500 filas es manejable y el usuario necesita ver el total real.
        if (!isMobile) {
          mobileLimitApplied.value = false
          return items
        }
        const limit = 300
        if (Array.isArray(items) && items.length > limit) {
          mobileLimitApplied.value = true
          return items.slice(0, limit)
        }
    } catch (e) { }
    mobileLimitApplied.value = false
    return items
  }

  function isMobileOrNetwork() {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : ''
      const isLocal = host === 'localhost' || host === '127.0.0.1' || host === ''
      const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4))
      return isMobile || !isLocal
    } catch (e) {
      return false
    }
  }

  function transformItems(items) {
    if (!Array.isArray(items)) return []
    return items.map(it => {
      try { it.__hasRealData = computeHasRealData(it) } catch (e) {}
      return it
    })
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function applyFilter(items, filterStateCheck) {
    if (filterStateCheck && filterStateCheck()) {
      return items.filter(it => !hasRealValue(it && it['ESTATUS']))
    }
    return items
  }

  async function fetchPage(baseQueryParams, { limit, skip, signal }) {
    const qp = new URLSearchParams(baseQueryParams.toString())
    qp.set('withTotal', '1')
    qp.set('limit', String(limit))
    qp.set('skip', String(skip))
    const url = `${EQUIPMENT_ENDPOINT}${qp.toString() ? '?' + qp.toString() : ''}`

    const response = await fetch(url, { signal })
    if (!response.ok) {
      const json = await response.json().catch(() => ({}))
      const err = new Error(json.msg || json.error || `HTTP ${response.status}`)
      err.status = response.status
      throw err
    }
    const data = await response.json().catch(() => null)

    const itemsRaw = Array.isArray(data) ? data : (Array.isArray(data && data.data) ? data.data : [])
    const total = (data && typeof data === 'object' && typeof data.total === 'number')
      ? data.total
      : (Array.isArray(data) ? data.length : itemsRaw.length)

    const items = transformItems(itemsRaw)
    return { items, total }
  }

  async function loadProgressively({ queryParams, persistKey, filterStateCheck, alreadyDisplayedFromCache }) {
    const myRunId = ++activeRunId
    try {
      if (activeAbortController) {
        try { activeAbortController.abort() } catch (e) {}
      }
      activeAbortController = new AbortController()

      // 1) Paint first page immediately
      const timerToken = startTimer('[FETCH:FIRSTPAGE]')
      let first
      try {
        fetchCalls++
        try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}
        first = await fetchPage(queryParams, { limit: FIRST_PAGE_SIZE, skip: 0, signal: activeAbortController.signal })
      } finally {
        endTimer(timerToken)
      }

      if (myRunId !== activeRunId) return

      serverTotal.value = Number(first.total || 0)
      lastFetchedItems = first.items

      const firstItems = applyMobileLimit(first.items)
      allData.value = [...firstItems]
      filteredData.value = applyFilter(firstItems, filterStateCheck)
      loading.value = false

      // En móvil o en red (no-local), no cargamos 2500 filas en background.
      // En esos casos la vista debe usar paginación serverSide.
      if (isMobileOrNetwork()) {
        return
      }

      const total = Number(first.total || firstItems.length || 0)
      if (!total || total <= firstItems.length) {
        try {
          setCache(queryParams, { allData: allData.value, filteredData: filteredData.value })
          await cacheSet(persistKey, { allData: allData.value, filteredData: filteredData.value, meta: { fullyLoaded: true, total } })
        } catch (e) {}
        return
      }

      // 2) Load remaining in background without blocking UI
      let accumulated = firstItems.length
      let batchSize = SAFE_BATCH_DEFAULT

      while (accumulated < total) {
        if (myRunId !== activeRunId) return

        let page = null
        let succeeded = false

        for (const candidate of SAFE_BATCH_FALLBACKS) {
          if (candidate > batchSize) continue
          try {
            fetchCalls++
            try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}
            page = await fetchPage(queryParams, { limit: candidate, skip: accumulated, signal: activeAbortController.signal })
            batchSize = candidate
            succeeded = true
            break
          } catch (e) {
            const status = Number(e && e.status)
            if (status === 500 || status === 502 || status === 503 || status === 504) continue
            throw e
          }
        }

        if (!succeeded || !page || !Array.isArray(page.items) || page.items.length === 0) break
        if (myRunId !== activeRunId) return

        const nextChunk = Array.isArray(page.items) ? page.items : []
        const nextAll = [...allData.value, ...nextChunk]
        allData.value = nextAll
        filteredData.value = applyFilter(nextAll, filterStateCheck)
        accumulated += nextChunk.length

        await sleep(30)
      }

      try {
        if (myRunId === activeRunId) {
          setCache(queryParams, { allData: allData.value, filteredData: filteredData.value })
          await cacheSet(persistKey, {
            allData: allData.value,
            filteredData: filteredData.value,
            meta: { fullyLoaded: true, total: serverTotal.value || allData.value.length }
          })
        }
      } catch (e) {}
    } catch (e) {
      if (!alreadyDisplayedFromCache) throw e
      console.warn('[progressive-load] background refresh failed:', e && e.message)
    }
  }

  function assignFirstBatch(queryParams, items, filterStateCheck) {
    const key = getCacheKey(queryParams)
    const limited = applyMobileLimit(items)
    localRemaining.set(key, { remaining: limited.slice(FIRST_BATCH), total: limited.length })
    const first = limited.slice(0, FIRST_BATCH)
    allData.value = first
    if (filterStateCheck && filterStateCheck()) {
      filteredData.value = first.filter(it => !hasRealValue(it && it['ESTATUS']))
    } else {
      filteredData.value = first
    }
  }

  function getCacheKey(queryParams) {
    return `${EQUIPMENT_ENDPOINT}::${queryParams.toString()}`
  }

  function getFromCache(queryParams) {
    const key = getCacheKey(queryParams)
    const cached = searchCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
    searchCache.delete(key)
    return null
  }

  function setCache(queryParams, data) {
    const key = getCacheKey(queryParams)
    searchCache.set(key, { data, timestamp: Date.now() })
    // Limitar el tamaño del caché a 10 entradas
    if (searchCache.size > 10) {
      const firstKey = searchCache.keys().next().value
      searchCache.delete(firstKey)
    }
  }

  async function runSearch(buildQueryParams, filterStateCheck, options = {}) {
    // Options:
    //   serverSide, page, pageSize, full, maxFullAssign, forceFull,
    //   limitReactive, bumpCacheOnError, bypassCache
    runSearchCalls++
    try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.runSearchCalls = runSearchCalls } catch (e) {}
    const perfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now.bind(performance) : Date.now
    const _start = perfNow()
    let hasDisplayedCache = false
    let queryParams = null
    let persistKey = ''

    try {
      loading.value = true
      metaError.value = ''
      queryParams = buildQueryParams()
      // persistent cache key (declare early so it's available in all branches)
      persistKey = getCacheKey(queryParams)

      // expose a small test API for manual phases (2/3/4) in browser console
      try {
        if (typeof window !== 'undefined' && window.__BIOMED_TEST__) {
          window.__BIOMED_TEST__.phase2 = () => {
            try { window.__TEST_ITEMS__ = lastFetchedItems || []; return (lastFetchedItems || []).length } catch (e) { return 0 }
          }
          window.__BIOMED_TEST__.phase3 = () => {
            try { allData.value = (lastFetchedItems && lastFetchedItems.length) ? [lastFetchedItems[0]] : []; return allData.value.length } catch (e) { return 0 }
          }
          window.__BIOMED_TEST__.phase4 = () => {
            try {
              const arr = lastFetchedItems || []
              const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
              allData.value = arr
              const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
              return Math.round(t1 - t0)
            } catch (e) { return -1 }
          }
          window.__BIOMED_TEST__.phase5 = async () => {
            try {
              const arr = lastFetchedItems || []
              const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
              allData.value = arr
              try { await nextTick() } catch (e) {}
              await new Promise(requestAnimationFrame)
              await new Promise(requestAnimationFrame)
              const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
              return Math.round(t1 - t0)
            } catch (e) { return -1 }
          }
          window.__BIOMED_TEST__.meta = () => ({ runSearchCalls, fetchCalls, lastLength: (lastFetchedItems && lastFetchedItems.length) || 0 })
        }
      } catch (e) {}

      // Request full payload to ensure all fields are available
      // This is needed for proper equipment detail display after scanning
      // The backend can still optimize by not fetching unnecessary relations
      // try { queryParams.set('lite', '1') } catch (e) {}

      // Verificar caché primero (permitir omitirla con options.bypassCache)
      const bypass = options && options.bypassCache
      const cached = bypass ? null : getFromCache(queryParams)
      // Avoid returning a cached result that contains no items, as it may reflect
      // a stale state (e.g. table was empty or network failure). In such cases
      // we treat it as a cache miss and fetch fresh data.
      if (cached && Array.isArray(cached.allData) && cached.allData.length > 0) {
        try {
          const localItems = Array.isArray(cached.allData) ? cached.allData : []
          if ((options && options.limitReactive) || isMobileOrNetwork()) {
            assignFirstBatch(queryParams, localItems, filterStateCheck)
          } else {
            allData.value = localItems
            filteredData.value = Array.isArray(cached.filteredData) ? cached.filteredData : localItems
          }
        } catch (e) {
          allData.value = cached.allData || []
          filteredData.value = cached.filteredData || []
        }
        console.log('[perf] runSearch: from cache (serving first batch)')
        return
      }
      // if we fell through here because cache existed but was empty, delete it
      if (cached) {
        searchCache.delete(getCacheKey(queryParams))
      }

      // Cache persistente (IndexedDB): pinta inmediato y revalida
      const _cacheStart = perfNow()
      const persisted = await cacheGet(persistKey, { ttlMs: PERSIST_TTL })
      const _cacheDur = Math.round(perfNow() - _cacheStart)
      if (persisted && persisted.allData && persisted.filteredData) {
         const persistedAll = Array.isArray(persisted.allData) ? persisted.allData : []
         const isFullyLoaded = !!(persisted.meta && persisted.meta.fullyLoaded)
         if (!isFullyLoaded) {
           // Si se guardó una cache parcial (por ejemplo 24 items), no la uses.
           try { await cacheDel(persistKey) } catch (e) {}
         } else {
         // FIXED: Comentada sanitización para no perder datos
         // const sanitized = persistedAll.filter(it => !isLikelyMock(it))
         const sanitized = persistedAll

         // Si la cache persistente estaba compuesta exclusivamente por mocks, eliminarla y tratar como MISS
         if (sanitized.length === 0 && persistedAll.length > 0) {
           try { await cacheDel(persistKey); console.warn('[cache] Eliminada caché persistente: contenía solo datos de prueba/no reales', persistKey) } catch (e) {}
           console.log(`[perf] ⚠ Persistent cache contained only mock/test items - cleared (${_cacheDur}ms)`)
         } else {
           // Usar versión saneada si fue necesario
           if ((options && options.limitReactive) || isMobileOrNetwork()) {
             assignFirstBatch(queryParams, sanitized.length ? sanitized : persistedAll, filterStateCheck)
           } else {
             allData.value = sanitized.length ? sanitized : persistedAll
             filteredData.value = sanitized.length ? (persisted.filteredData || []) : persisted.filteredData
           }

           // Si saneamos la cache persistente, actualizarla para evitar re-usos futuros
           if (sanitized.length && sanitized.length !== persistedAll.length) {
             try { await cacheSet(persistKey, { allData: sanitized, filteredData: (persisted.filteredData || []) }) } catch (e) {}
           }

           hasDisplayedCache = true
           loading.value = false
           console.log(`[perf] ✓ Persistent cache hit: ${(sanitized.length ? sanitized.length : persistedAll.length)} items in ${_cacheDur}ms (SWR)`)
         }
         }
      } else {

      }

      // Detect tunnel for optimizations
      const serverSide = Boolean(options.serverSide)
      const isTunnel = typeof window !== 'undefined' && /\.trycloudflare\.com|\.ngrok-free\.dev|\.loca\.lt/.test(window.location.hostname)

      // En túneles/redes lentas, también preferimos carga progresiva para evitar
      // payloads gigantes y cascadas de 500/timeouts.

      // Server-side pagination (useful for mobile devices on network)
      if (serverSide) {
        try {
          // the "lite" flag used to request a small subset of columns.  removed
          // to allow the table to render all available fields regardless of
          // pagination or network conditions.
          // try { queryParams.set('lite', '1') } catch (e) {}

          // Support asking for a FULL server-backed download in batches
          if (options.full) {
            await loadProgressively({
              queryParams,
              persistKey,
              filterStateCheck,
              alreadyDisplayedFromCache: hasDisplayedCache
            })
            return
          }

          // Default: single page server-side fetch
          queryParams.set('withTotal', '1')
          const page = Number(options.page || 1)
          const pageSize = Number(options.pageSize || 24)
          queryParams.set('limit', String(pageSize))
          queryParams.set('skip', String((page - 1) * pageSize))

          const url = `${EQUIPMENT_ENDPOINT}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const controller = new AbortController()
          const timeoutMs = 20000
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
          const timerToken = startTimer('[FETCH:SERVERPAGE]')
          fetchCalls++
          try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}

          let response
          let data
          try {
            response = await fetch(url, { signal: controller.signal })
            console.log('[FETCH] status', response.status, 'url', url)
            if (!response.ok) {
              const json = await response.json().catch(() => ({}))
              throw new Error(json.msg || json.error || `HTTP ${response.status}`)
            }
            data = await response.json().catch(() => null)
          } finally {
            clearTimeout(timeoutId)
            endTimer(timerToken)
          }

          // ⭐ FIX: Procesar response correctamente
          let items = []
          let totalCount = 0
          
          if (Array.isArray(data)) {
            // Backend retorna array simple (sin withTotal)
            items = data
            totalCount = data.length
          } else if (data && typeof data === 'object') {
            // Backend retorna { ok, data, total }
            items = Array.isArray(data.data) ? data.data : []
            totalCount = typeof data.total === 'number' ? data.total : items.length
          }
          
          const enrichedRaw = transformItems(items)
          // FIXED: Comentada la sanitización que eliminaba todos los items
          // const enriched = Array.isArray(enrichedRaw) ? enrichedRaw.filter(it => !isLikelyMock(it)) : []
          const enriched = Array.isArray(enrichedRaw) ? enrichedRaw : []
          try {
            lastFetchedItems = enriched;
            if (typeof window !== 'undefined' && window.__BIOMED_TEST__) {
              window.__BIOMED_TEST__.lastFetchedItems = enriched;
            }
          } catch (e) {}
          console.log('[FETCH] items length', enriched.length, '(sanitized) total:', totalCount)
          allData.value = enriched
          filteredData.value = enriched
          serverTotal.value = totalCount
          // cache page-level data lightly (in-memory)
          setCache(queryParams, { allData: allData.value, filteredData: filteredData.value })
          await cacheSet(getCacheKey(queryParams), { allData: allData.value, filteredData: filteredData.value })
          return
        } catch (err) {
          console.error('[server pagination] error', err)
          // fallthrough to full-load fallback below if needed
        }
      }

      // LOCAL: Load ALL data for pagination
      // No limit - load everything for traditional pagination

      await loadProgressively({
        queryParams,
        persistKey,
        filterStateCheck,
        alreadyDisplayedFromCache: hasDisplayedCache
      })
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Búsqueda cancelada por timeout')
      } else {
        console.error('Error en búsqueda:', error)
      }

      // On failure, clear both persistent and in-memory caches for this query
      try {
        searchCache.delete(getCacheKey(queryParams))
      } catch (e) {
        // ignore
      }

      if (!hasDisplayedCache && (!allData.value || allData.value.length === 0)) {
        metaError.value = 'No fue posible obtener datos del inventario biomédico. Verifica la conexión con el backend.'
      }

      // Si hubo un fallo de red/servidor, eliminar caché persistente para evitar mostrar datos obsoletos o de prueba
      try {
        await cacheDel(persistKey)
        if (!hasDisplayedCache) {
          allData.value = []
          filteredData.value = []
        }
        console.warn('[cache] Se ha eliminado la caché persistente para la queryKey:', persistKey)
      } catch (e) {
        console.warn('[cache] No se pudo eliminar la cache persistente:', e && e.message)
      }
    } finally {
      loading.value = false
      const _dur = Math.round(perfNow() - _start)
      if (_dur > 200) console.warn(`[perf] runSearch: ${_dur}ms (slow)`)
    }
  }

  function clearCache(queryParams) {
    if (queryParams) {
      searchCache.delete(getCacheKey(queryParams))
      cacheDel(getCacheKey(queryParams)).catch(()=>{})
    } else {
      searchCache.clear()
      // clear persistent cache entirely if desired (not usually needed)
      // note: persistent cache is namespaced by query key, so full clear
      // would require iterating stored keys; for simplicity we only clear
      // in-memory here.
    }
  }

  return {
    allData,
    filteredData,
    loading,
    metaError,
    mobileLimitApplied,
    serverTotal,
    hasRealValue,
    computeHasRealData,
    applyMobileLimit,
    runSearch,
    clearCache
  }
}
