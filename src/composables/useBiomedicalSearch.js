import { ref, computed } from 'vue'
import { cacheGet, cacheSet, cacheDel } from '@/utils/persistentCache.js'

// Simple cache para evitar búsquedas repetidas
const searchCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos
const PERSIST_TTL = 24 * 60 * 60 * 1000 // 24 horas (se revalida en background)

// Timer tracking to avoid console.time collisions
const activeTimers = new Set()

function startTimer(label) {
  try {
    if (activeTimers.has(label)) {
      console.timeEnd(label)
      activeTimers.delete(label)
    }
    console.time(label)
    activeTimers.add(label)
  } catch (e) {}
}

function endTimer(label) {
  try {
    if (activeTimers.has(label)) {
      console.timeEnd(label)
      activeTimers.delete(label)
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
  const SERVER_SIDE_FORCE_THRESHOLD = 500 // keep in sync with view threshold
  // --- Instrumentation for hypothesis testing ---
  let runSearchCalls = 0
  let fetchCalls = 0
  let lastFetchedItems = null
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
    const fieldsToCheck = ['EQUIPO MEDICO', 'MARCA', 'MODELO', 'CLAVE CNIS', 'No DE INVENTARIO']
    let realCount = 0
    for (const f of fieldsToCheck) {
      if (hasRealValue(it && it[f])) realCount++
    }
    return realCount >= 3
  }

  // Heurística para detectar filas *probablemente* mock o de prueba
  // - Todas las columnas clave vacías o no-reales
  // - O el texto contiene palabras indicadoras como 'mock', 'test', 'maqueta', 'placeholder'
  function isLikelyMock(item) {
    try {
      if (!item || typeof item !== 'object') return true
      const keys = ['EQUIPO MEDICO', 'MARCA', 'MODELO', 'CLAVE CNIS', 'No DE INVENTARIO']
      const allEmpty = keys.every(k => !hasRealValue(item[k]))
      if (allEmpty) return true
      const s = JSON.stringify(item).toLowerCase()
      if (s.includes('mock') || s.includes('test') || s.includes('maqueta') || s.includes('placeholder')) return true
      return false
    } catch (e) { return false }
  }

  function applyMobileLimit(items) {
    try {
      const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4))
      const limit = isMobile ? 300 : 1000
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
    return queryParams.toString()
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

    try {
      loading.value = true
      metaError.value = ''
      const queryParams = buildQueryParams()
      // persistent cache key (declare early so it's available in all branches)
      const persistKey = getCacheKey(queryParams)

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
      } else {

      }

      // Detect tunnel for optimizations
      const serverSide = Boolean(options.serverSide)
      const isTunnel = typeof window !== 'undefined' && /\.trycloudflare\.com|\.ngrok-free\.dev|\.loca\.lt/.test(window.location.hostname)

      // PAGINATION MODE: Load ALL data at once for traditional pagination (tunnel)
      if (isTunnel && !serverSide) {
        console.log('[pagination] TÚNEL: Cargando TODOS los datos...')

        // Single request for ALL data
        const url = `/api/ops/historial-mantenimientos?${queryParams.toString()}`
        console.log(`[pagination] 🚀 Loading ALL items: ${url}`)
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000) // 3s for complete load

          try {
          fetchCalls++
          try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}
          console.time('[FETCH_START:TUNNEL]')
          const response = await fetch(url, { signal: controller.signal })
          clearTimeout(timeout)

          console.log('[FETCH] status', response.status, 'url', url)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json().catch(() => null)
          console.timeEnd('[FETCH_START:TUNNEL]')
          console.time('[FETCH_END:TUNNEL]')
          const items = Array.isArray(data) ? data : (Array.isArray(data && data.data) ? data.data : [])
          const enrichedRaw = transformItems(items)
          // FIXED: Comentada la sanitización que eliminaba todos los items
          // const enriched = (Array.isArray(enrichedRaw) ? enrichedRaw.filter(it => !isLikelyMock(it)) : [])
          const enriched = (Array.isArray(enrichedRaw) ? enrichedRaw : [])
          try { lastFetchedItems = enriched; if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.lastFetchedItems = enriched } catch (e) {}
          console.log('[FETCH] items length', enriched.length, '(sanitized from', (enrichedRaw && enrichedRaw.length) || 0, ')')
          console.timeEnd('[FETCH_END:TUNNEL]')
          console.log(`[pagination] ✓ Loaded ${enriched.length} total items (sanitized)`)

          assignFirstBatch(queryParams, enriched, filterStateCheck)

          // Cache the full results for SWR; but we don't assign full array to reactive state
          setCache(queryParams, { allData: limited, filteredData: limited })
          await cacheSet(persistKey, { allData: limited, filteredData: limited })

          const _dur = Math.round(perfNow() - _start)
          console.log(`[pagination] ✓ Complete load (first-batch served): ${_dur}ms totalItems=${limited.length}`)

        } catch (error) {
          clearTimeout(timeout)
          if (error.name === 'AbortError') {
            console.error('[pagination] Load cancelled by timeout')
          }
          throw error
        }
        return  // IMPORTANTE: No ejecutar código local abajo
      }

      // Server-side pagination (useful for mobile devices on network)
      if (serverSide) {
        try {
          // the "lite" flag used to request a small subset of columns.  removed
          // to allow the table to render all available fields regardless of
          // pagination or network conditions.
          // try { queryParams.set('lite', '1') } catch (e) {}

          // Support asking for a FULL server-backed download in batches
          if (options.full) {
            queryParams.set('withTotal', '1')
            const pageSize = Math.max(1000, Number(options.pageSize || 1000))
            let page = Number(options.page || 1)
            let totalCount = Infinity
            const allItems = []
            const startFull = perfNow()

            // allow caller to override threshold when they explicitly request a full fetch
            const callerThreshold = (options && Number(options.maxFullAssign)) || SERVER_SIDE_FORCE_THRESHOLD
            const forceFull = Boolean(options && options.forceFull)

            while (allItems.length < totalCount) {
              queryParams.set('limit', String(pageSize))
              queryParams.set('skip', String((page - 1) * pageSize))
              const url = `/api/ops/historial-mantenimientos?${queryParams.toString()}`
              const controller = new AbortController()
              const timeoutMs = 30000 // increased timeout for full fetch pages
              const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

              try {
                fetchCalls++
                try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}
                console.log('[full-fetch] requesting page', page, 'size', pageSize)

                const response = await fetch(url, { signal: controller.signal })
                clearTimeout(timeoutId)
                if (!response.ok) {
                  const json = await response.json().catch(() => ({}))
                  throw new Error(json.msg || json.error || `HTTP ${response.status}`)
                }
                const data = await response.json().catch(() => null)

                let items = []
                if (Array.isArray(data)) {
                  items = data
                  // if we get a raw array, we assume it's the full set for that request
                  totalCount = items.length
                } else if (data && typeof data === 'object') {
                  items = Array.isArray(data.data) ? data.data : []
                  totalCount = typeof data.total === 'number' ? data.total : totalCount
                }

                const enrichedPage = transformItems(items)
                // FIXED: Comentada la sanitización que eliminaba todos los items
                // const sanitizedPage = Array.isArray(enrichedPage) ? enrichedPage.filter(it => !isLikelyMock(it)) : []
                const sanitizedPage = Array.isArray(enrichedPage) ? enrichedPage : []
                allItems.push(...sanitizedPage)

                console.log('[full-fetch] got', items.length, 'items; accumulated', allItems.length, 'of', totalCount, '(sanitized page size', sanitizedPage.length, ')')

                // Safety: if server returns fewer than pageSize and totalCount not provided, break to avoid infinite loop
                if ((!Array.isArray(data) && (!data || !('total' in data))) && items.length < pageSize) {
                  break
                }

                page++

                // small delay to avoid hammering the DB if it's huge; can be tuned or disabled
                await new Promise(r => setTimeout(r, 50))
              } catch (errPage) {
                clearTimeout(timeoutId)
                console.error('[full-fetch] page fetch error', errPage)
                // stop full fetching on error and fallthrough to partial results if any
                break
              }
            }

            const enriched = allItems
            lastFetchedItems = enriched

            // If dataset is large, avoid assigning the whole array to reactive state to prevent UI slowdown
            if (!forceFull && typeof totalCount === 'number' && totalCount > callerThreshold) {
              // Keep full results in lastFetchedItems, expose summary, and set reactive state to first page only
              serverTotal.value = totalCount
              const samplePageSize = Number(options.pageSize || 24)
              allData.value = enriched.slice(0, samplePageSize)
              filteredData.value = enriched.slice(0, samplePageSize)
              console.warn('[full-fetch] Large dataset detected - buffered results without rendering all items. Use pagination or fetchAll with caution.')

              // Persist the buffered first page and metadata only
              try { setCache(queryParams, { allData: allData.value, filteredData: filteredData.value }) } catch (e) {}
              try { await cacheSet(getCacheKey(queryParams), { allData: allData.value, filteredData: filteredData.value, meta: { total: totalCount } }) } catch (e) {}

              const durFull = Math.round(perfNow() - startFull)
              console.log(`[full-fetch] Buffered: ${allData.value.length}/${serverTotal.value} in ${durFull}ms`)
              return
            }

            // Small datasets or forced full: safe to assign fully
            lastFetchedItems = enriched
            allData.value = enriched
            filteredData.value = enriched
            serverTotal.value = (typeof totalCount === 'number' && isFinite(totalCount)) ? totalCount : enriched.length

            // Persist/cache the full set lightly (may be large)
            try { setCache(queryParams, { allData: allData.value, filteredData: filteredData.value }) } catch (e) {}
            try { await cacheSet(getCacheKey(queryParams), { allData: allData.value, filteredData: filteredData.value }) } catch (e) {}

            const durFull = Math.round(perfNow() - startFull)
            console.log(`[full-fetch] Completed: ${allData.value.length}/${serverTotal.value} in ${durFull}ms`)
            return
          }

          // Default: single page server-side fetch
          queryParams.set('withTotal', '1')
          const page = Number(options.page || 1)
          const pageSize = Number(options.pageSize || 24)
          queryParams.set('limit', String(pageSize))
          queryParams.set('skip', String((page - 1) * pageSize))

          const url = `/api/ops/historial-mantenimientos?${queryParams.toString()}`
          const controller = new AbortController()
          const timeoutMs = 20000
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
          fetchCalls++
          try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}
          startTimer('[FETCH:SERVERPAGE]');

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          console.log('[FETCH] status', response.status, 'url', url);
          if (!response.ok) {
            const json = await response.json().catch(() => ({}));
            throw new Error(json.msg || json.error || `HTTP ${response.status}`);
          }
          const data = await response.json().catch(() => null);
          endTimer('[FETCH:SERVERPAGE]');

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

      const url = `/api/ops/historial-mantenimientos${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const controller = new AbortController()
      const timeoutMs = isTunnel ? 30000 : 20000 // generous timeouts for large local fetches
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      fetchCalls++
      try { if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.fetchCalls = fetchCalls } catch (e) {}
      startTimer('[FETCH:LOCAL]')
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      console.log('[FETCH] status', response.status, 'url', url)
      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(json.msg || json.error || `HTTP ${response.status}`)
      }
      const data = await response.json().catch(() => null)
      endTimer('[FETCH:LOCAL]')
      const rawItems = Array.isArray(data) ? data : (Array.isArray(data && data.data) ? data.data : [])
      const itemsRaw = transformItems(Array.isArray(rawItems) ? rawItems : [])
      // FIXED: Comentada sanitización para no perder datos
      // const items = Array.isArray(itemsRaw) ? itemsRaw.filter(it => !isLikelyMock(it)) : []
      const items = Array.isArray(itemsRaw) ? itemsRaw : []
      try { lastFetchedItems = items; if (typeof window !== 'undefined' && window.__BIOMED_TEST__) window.__BIOMED_TEST__.lastFetchedItems = items } catch (e) {}
      console.log('[FETCH] items length', items.length, '(sanitized)')
      const shouldLimitReactive = (options && options.limitReactive) || isMobileOrNetwork()
      if (shouldLimitReactive) {
        assignFirstBatch(queryParams, items, filterStateCheck)
      } else {
        const limited = applyMobileLimit(items)
        allData.value = limited
        if (filterStateCheck && filterStateCheck()) {
          filteredData.value = limited.filter(it => !hasRealValue(it && it['ESTATUS']))
        } else {
          filteredData.value = limited
        }
      }

      // Guardar en caché
      setCache(queryParams, { allData: shouldLimitReactive ? applyMobileLimit(items) : allData.value, filteredData: shouldLimitReactive ? applyMobileLimit(items) : filteredData.value })
      await cacheSet(persistKey, { allData: applyMobileLimit(items), filteredData: applyMobileLimit(items) })
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
        metaError.value = 'No fue posible obtener datos del historial. Verifica la conexión con el backend.'
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
