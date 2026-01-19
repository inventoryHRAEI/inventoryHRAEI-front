import { ref, computed } from 'vue'

// Simple cache para evitar búsquedas repetidas
const searchCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export function useBiomedicalSearch() {
  const allData = ref([])
  const filteredData = ref([])
  const loading = ref(false)
  const metaError = ref('')
  const mobileLimitApplied = ref(false)

  function hasRealValue(v) {
    if (v === null || v === undefined) return false
    const s = String(v).trim().toLowerCase()
    return s && !['n/a', 'sin clave', 'sin datos', 'no disponible', 'na'].includes(s)
  }

  function computeHasRealData(it) {
    const fieldsToCheck = ['EQUIPO MEDICO', 'MARCA', 'MODELO', 'CLAVE CNIS', 'No DE INVENTARIO']
    let realCount = 0
    for (const f of fieldsToCheck) {
      if (hasRealValue(it?.[f])) realCount++
    }
    return realCount >= 3
  }

  function applyMobileLimit(items) {
    try {
      const isMobile = window.innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4)
      const limit = isMobile ? 300 : 1000
      if (Array.isArray(items) && items.length > limit) {
        mobileLimitApplied.value = true
        return items.slice(0, limit)
      }
    } catch (e) { }
    mobileLimitApplied.value = false
    return items
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

  async function runSearch(buildQueryParams, filterStateCheck) {
    const perfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now.bind(performance) : Date.now
    const _start = perfNow()
    try {
      loading.value = true
      metaError.value = ''
      const queryParams = buildQueryParams()
      
      // Verificar caché primero
      const cached = getFromCache(queryParams)
      if (cached) {
        allData.value = cached.allData
        filteredData.value = cached.filteredData
        console.log('[perf] runSearch: from cache')
        return
      }
      
      // Detect tunnel for optimizations
      const isTunnel = typeof window !== 'undefined' && /\.trycloudflare\.com|\.ngrok-free\.dev|\.loca\.lt/.test(window.location.hostname)
      
      // AGGRESSIVE TUNNEL MODE: Progressive loading
      if (isTunnel) {
        console.log('[perf] TÚNEL: Iniciando carga progresiva...')
        
        // ETAPA 1: Cargar PRIMEROS 50 items RÁPIDO (máximo 5 segundos)
        const queryParams1 = new URLSearchParams(queryParams.toString())
        queryParams1.set('limit', '50')
        queryParams1.set('skip', '0')
        
        const url1 = `/api/ops/historial-mantenimientos?${queryParams1.toString()}`
        const controller1 = new AbortController()
        const timeout1 = setTimeout(() => controller1.abort(), 5000) // 5s max
        
        try {
          const response1 = await fetch(url1, { signal: controller1.signal })
          clearTimeout(timeout1)
          
          if (!response1.ok) {
            throw new Error(`HTTP ${response1.status}`)
          }
          
          const data1 = await response1.json().catch(() => null)
          const items1 = Array.isArray(data1) ? data1 : (Array.isArray(data1?.data) ? data1.data : [])
          const enriched1 = items1.map(it => ({ ...it, __hasRealData: computeHasRealData(it) }))
          
          // MOSTRAR INMEDIATAMENTE
          allData.value = enriched1
          if (filterStateCheck && filterStateCheck()) {
            filteredData.value = enriched1.filter(it => !hasRealValue(it?.['ESTATUS']))
          } else {
            filteredData.value = enriched1
          }
          
          const _dur1 = Math.round(perfNow() - _start)
          console.log(`[perf] ✓ Primeros 50 items en ${_dur1}ms. Cargando resto en background...`)
          loading.value = false  // PERMITIR INTERACCIÓN YA
          
          // ETAPA 2: Cargar RESTO en BACKGROUND (sin bloquear UI)
          // Sin timeout, puede tardar lo que sea
          setTimeout(async () => {
            try {
              const queryParams2 = new URLSearchParams(queryParams.toString())
              queryParams2.set('limit', '450')
              queryParams2.set('skip', '50')
              
              const url2 = `/api/ops/historial-mantenimientos?${queryParams2.toString()}`
              const response2 = await fetch(url2)
              
              if (!response2.ok) throw new Error(`HTTP ${response2.status}`)
              
              const data2 = await response2.json().catch(() => null)
              const items2 = Array.isArray(data2) ? data2 : (Array.isArray(data2?.data) ? data2.data : [])
              const enriched2 = items2.map(it => ({ ...it, __hasRealData: computeHasRealData(it) }))
              
              // MERGE: agregar al final
              allData.value = [...allData.value, ...enriched2]
              if (filterStateCheck && filterStateCheck()) {
                filteredData.value = allData.value.filter(it => !hasRealValue(it?.['ESTATUS']))
              } else {
                filteredData.value = allData.value
              }
              
              const _dur2 = Math.round(perfNow() - _start)
              console.log(`[perf] ✓ ${enriched2.length} items adicionales cargados en background (${_dur2}ms total)`)
            } catch (bgError) {
              console.warn('[perf] Background load error (no crítico):', bgError.message)
            }
          }, 50)  // Empezar background después de 50ms
          
        } catch (error1) {
          clearTimeout(timeout1)
          if (error1.name === 'AbortError') {
            console.error('[perf] Túnel: Load cancelled by timeout')
          }
          throw error1
        }
        return  // IMPORTANTE: No ejecutar código local abajo
      }
      
      // LOCAL: Comportamiento normal (todo de una)
      if (!isTunnel && !queryParams.toString().includes('limit')) {
        queryParams.append('limit', '500')  // Local: full load
      }
      
      const url = `/api/ops/historial-mantenimientos${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const controller = new AbortController()
      const timeoutMs = isTunnel ? 12000 : 8000 // More tolerance in tunnel
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(json.msg || json.error || `HTTP ${response.status}`)
      }
      const data = await response.json().catch(() => null)
      const rawItems = Array.isArray(data) ? data : (Array.isArray(data && data.data) ? data.data : [])
      const items = Array.isArray(rawItems) ? rawItems.map(it => ({ ...it, __hasRealData: computeHasRealData(it) })) : []
      const limited = applyMobileLimit(items)
      allData.value = limited
      if (filterStateCheck && filterStateCheck()) {
        filteredData.value = limited.filter(it => !hasRealValue(it?.['ESTATUS']))
      } else {
        filteredData.value = limited
      }
      
      // Guardar en caché
      setCache(queryParams, { allData: allData.value, filteredData: filteredData.value })
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Búsqueda cancelada por timeout')
      } else {
        console.error('Error en búsqueda:', error)
      }
      allData.value = []
      filteredData.value = []
    } finally {
      loading.value = false
      const _dur = Math.round(perfNow() - _start)
      if (_dur > 200) console.warn(`[perf] runSearch: ${_dur}ms (slow)`)
    }
  }

  return {
    allData,
    filteredData,
    loading,
    metaError,
    mobileLimitApplied,
    hasRealValue,
    computeHasRealData,
    applyMobileLimit,
    runSearch
  }
}
