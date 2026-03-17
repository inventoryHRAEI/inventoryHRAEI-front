import { ref, computed, watch, shallowRef } from 'vue'
import Fuse from 'fuse.js'

/**
 * Composable que encapsula Fuse.js para búsqueda inteligente de inventario.
 * Se inicializa UNA sola vez con la lista completa y ejecuta búsquedas fuzzy
 * sobre el índice existente, garantizando O(1) en inicialización y búsquedas rápidas.
 *
 * @param {import('vue').Ref<Array>} items - Lista reactiva de items del inventario
 * @param {Object} options - Opciones de configuración
 */
export function useFuseSearch(items, options = {}) {
  const {
    // Campos a indexar con sus pesos (mayor peso = más relevancia)
    keys = [
      { name: 'nombre',      weight: 0.25 },
      { name: 'marca',       weight: 0.15 },
      { name: 'modelo',      weight: 0.15 },
      { name: 'serie',       weight: 0.12 },
      { name: 'noInventario', weight: 0.10 },
      { name: 'referencia',  weight: 0.08 },
      { name: 'claveHRAEI',  weight: 0.05 },
      { name: 'claveCNIS',   weight: 0.04 },
      { name: 'lote',        weight: 0.03 },
      { name: 'ubicacion',   weight: 0.03 },
    ],
    // Fuse.js config
    threshold = 0.35,        // 0 = coincidencia perfecta, 1 = cualquier cosa
    distance = 200,          // distancia de la posición esperada
    minMatchCharLength = 2,  // mínimo 2 chars para hacer match
    maxResults = 50,
    // Campo para inferir tipo de agrupación
    typeField = 'tipo',
  } = options

  // Instancia Fuse (shallowRef para evitar reactividad profunda innecesaria)
  const fuseInstance = shallowRef(null)
  const isIndexReady = ref(false)
  const lastQuery = ref('')
  const results = ref([])

  // Opciones de Fuse.js
  const fuseOptions = {
    keys,
    threshold,
    distance,
    minMatchCharLength,
    includeScore: true,
    includeMatches: true,
    shouldSort: true,        // Ordenar por relevancia automáticamente
    findAllMatches: false,
    ignoreLocation: false,
    useExtendedSearch: false,
    fieldNormWeight: 1.5,    // Dar más peso a campos cortos (claves, series)
  }

  /**
   * Inicializa o re-construye el índice de Fuse.
   * Se ejecuta automáticamente cuando cambia la lista de items.
   */
  function buildIndex(data) {
    if (!data || data.length === 0) {
      fuseInstance.value = null
      isIndexReady.value = false
      return
    }

    // Crear índice optimizado (se construye 1 vez)
    const index = Fuse.createIndex(keys, data)
    fuseInstance.value = new Fuse(data, fuseOptions, index)
    isIndexReady.value = true
  }

  // Re-indexar cuando cambian los items
  watch(items, (newItems) => {
    buildIndex(newItems || [])
  }, { immediate: true })

  /**
   * Ejecuta una búsqueda fuzzy sobre el índice.
   * @param {string} query - Texto a buscar
   * @returns {Array} Resultados ordenados por relevancia con metadata
   */
  function search(query) {
    lastQuery.value = query

    if (!query || query.trim().length < 1) {
      results.value = []
      return []
    }

    if (!fuseInstance.value) {
      results.value = []
      return []
    }

    const trimmed = query.trim()

    const rawResults = fuseInstance.value.search(trimmed, { limit: maxResults })

    // Mapear resultados con score normalizado y matches
    const mapped = rawResults.map((r) => ({
      item: r.item,
      score: r.score,           // 0 = perfecto, 1 = peor
      relevance: Math.round((1 - r.score) * 100), // 0-100 donde 100 es perfecto
      matches: r.matches || [],
    }))

    results.value = mapped
    return mapped
  }

  /**
   * Busca y agrupa los resultados por tipo de item.
   * Retorna un objeto con las categorías como keys.
   */
  function searchGrouped(query) {
    const flat = search(query)
    return groupResults(flat)
  }

  /**
   * Infiere el grupo/tipo del item para agrupación visual.
   */
  function inferGroupType(item) {
    if (!item) return 'otro'

    // Si el item ya tiene un campo tipo explícito
    const tipo = item[typeField]
    if (tipo) {
      const t = tipo.toLowerCase()
      if (t === 'equipo' || t === 'equipo-medico' || t === 'mobiliario') return 'equipo-medico'
      if (t === 'accesorio' || t === 'accesorios') return 'accesorio'
      if (t === 'consumible' || t === 'consumibles') return 'consumible'
      if (t === 'insumo' || t === 'insumos') return 'accesorio'
      if (t === 'refaccion' || t === 'refacción' || t === 'refacciones') return 'refaccion'
    }

    // Inferencia básica por nombre si no hay tipo explícito
    const haystack = `${item.nombre || ''} ${item.label || ''}`.toLowerCase()
    if (/\b(monitor|ventilador|desfibrilador|bomba|cama|mesa|lámpara|lampara|equipo|dispositivo)\b/.test(haystack)) return 'equipo-medico'
    if (/\b(cable|sensor|manguera|accesorio|adaptador|conector)\b/.test(haystack)) return 'accesorio'
    if (/\b(consumible|gel|papel|electrodo|filtro|desechable)\b/.test(haystack)) return 'consumible'
    if (/\b(refaccion|refacción|tarjeta|repuesto|pieza)\b/.test(haystack)) return 'refaccion'

    return 'otro'
  }

  /**
   * Extrae las partes de texto que dieron match para resaltado.
   * @param {Object} result - Resultado individual de Fuse
   * @param {string} fieldName - Campo específico a extraer
   * @returns {{ indices: Array, value: string } | null}
   */
  function getMatchInfo(result, fieldName) {
    if (!result || !result.matches) return null
    const match = result.matches.find(m => m.key === fieldName)
    if (!match) return null
    return {
      value: match.value,
      indices: match.indices,
    }
  }

  /**
   * Genera HTML con <mark> en las partes que coinciden.
   * @param {string} text - Texto original
   * @param {Array} indices - Pares [start, end] de Fuse
   * @returns {string} HTML con highlights
   */
  function highlightText(text, indices) {
    if (!text) return ''
    if (!indices || indices.length === 0) return escapeHtml(text)

    // Merge overlapping indices
    const merged = mergeIndices(indices)
    let result = ''
    let lastIdx = 0

    merged.forEach(([start, end]) => {
      // Texto antes del match
      result += escapeHtml(text.substring(lastIdx, start))
      // Texto del match (highlighted)
      result += `<mark>${escapeHtml(text.substring(start, end + 1))}</mark>`
      lastIdx = end + 1
    })

    // Texto restante
    result += escapeHtml(text.substring(lastIdx))
    return result
  }

  /**
   * Genera HTML con highlights para un campo específico de un resultado.
   */
  function highlightField(result, fieldName) {
    const matchInfo = getMatchInfo(result, fieldName)
    const text = result.item[fieldName] || ''
    if (!matchInfo) return escapeHtml(text)
    return highlightText(text, matchInfo.indices)
  }

  // Helpers internos
  function mergeIndices(indices) {
    if (!indices || indices.length === 0) return []
    const sorted = [...indices].sort((a, b) => a[0] - b[0])
    const merged = [sorted[0]]
    for (let i = 1; i < sorted.length; i++) {
      const prev = merged[merged.length - 1]
      if (sorted[i][0] <= prev[1] + 1) {
        prev[1] = Math.max(prev[1], sorted[i][1])
      } else {
        merged.push(sorted[i])
      }
    }
    return merged
  }

  function escapeHtml(str) {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /**
   * Devuelve los primeros N items de la lista original (sin búsqueda),
   * agrupados por tipo para mostrar al hacer focus sin texto.
   * Aplica filtros activos si se proporcionan.
   */
  function getInitialItems(limit = 30, activeFilters = null) {
    const data = items.value || []
    if (data.length === 0) return []

    // Aplicar filtros si existen
    let filtered = data
    if (activeFilters) {
      filtered = applyFilters(filtered, activeFilters)
    }

    const sample = filtered.slice(0, limit)

    const groups = {
      'equipo-medico': [],
      'accesorio': [],
      'consumible': [],
      'refaccion': [],
      'otro': [],
    }

    const groupLabels = {
      'equipo-medico': 'Equipos Médicos',
      'accesorio': 'Accesorios',
      'consumible': 'Consumibles',
      'refaccion': 'Refacciones',
      'otro': 'Otros',
    }

    sample.forEach((item) => {
      const tipo = inferGroupType(item)
      const wrapped = { item, score: 0, relevance: 100, matches: [] }
      if (groups[tipo]) {
        groups[tipo].push(wrapped)
      } else {
        groups['otro'].push(wrapped)
      }
    })

    const nonEmpty = []
    for (const [key, items] of Object.entries(groups)) {
      if (items.length > 0) {
        nonEmpty.push({ key, label: groupLabels[key] || key, items, count: items.length })
      }
    }
    return nonEmpty
  }

  /**
   * Aplica filtros activos a una lista de items crudos.
   * @param {Array} data - Lista de items sin envolver
   * @param {Object} filters - { tipo: Set, marca: Set, ubicacion: Set }
   */
  function applyFilters(data, filters) {
    return data.filter(item => {
      // Filtro por tipo
      if (filters.tipo && filters.tipo.size > 0) {
        const itemTipo = inferGroupType(item)
        if (!filters.tipo.has(itemTipo)) return false
      }
      // Filtro por marca
      if (filters.marca && filters.marca.size > 0) {
        const itemMarca = normalizeFiltro(item.marca)
        if (!itemMarca || !filters.marca.has(itemMarca)) return false
      }
      // Filtro por ubicación
      if (filters.ubicacion && filters.ubicacion.size > 0) {
        const itemUbi = normalizeFiltro(item.ubicacion)
        if (!itemUbi || !filters.ubicacion.has(itemUbi)) return false
      }
      return true
    })
  }

  /**
   * Aplica filtros a resultados ya envueltos (con score/relevance).
   * @param {Array} wrappedResults - [{ item, score, relevance, matches }]
   * @param {Object} filters - { tipo: Set, marca: Set, ubicacion: Set }
   */
  function applyFiltersToResults(wrappedResults, filters) {
    return wrappedResults.filter(r => {
      const item = r.item
      if (filters.tipo && filters.tipo.size > 0) {
        if (!filters.tipo.has(inferGroupType(item))) return false
      }
      if (filters.marca && filters.marca.size > 0) {
        const m = normalizeFiltro(item.marca)
        if (!m || !filters.marca.has(m)) return false
      }
      if (filters.ubicacion && filters.ubicacion.size > 0) {
        const u = normalizeFiltro(item.ubicacion)
        if (!u || !filters.ubicacion.has(u)) return false
      }
      return true
    })
  }

  /**
   * Busca y agrupa con filtros aplicados.
   */
  function searchGroupedFiltered(query, activeFilters = null) {
    const flat = search(query)
    const filtered = activeFilters ? applyFiltersToResults(flat, activeFilters) : flat
    return groupResults(filtered)
  }

  /**
   * Agrupa resultados en categorías.
   */
  function groupResults(flat) {
    const groups = {
      'equipo-medico': [],
      'accesorio': [],
      'consumible': [],
      'refaccion': [],
      'otro': [],
    }

    const groupLabels = {
      'equipo-medico': 'Equipos Médicos',
      'accesorio': 'Accesorios',
      'consumible': 'Consumibles',
      'refaccion': 'Refacciones',
      'otro': 'Otros',
    }

    flat.forEach((r) => {
      const tipo = inferGroupType(r.item)
      if (groups[tipo]) {
        groups[tipo].push(r)
      } else {
        groups['otro'].push(r)
      }
    })

    const nonEmpty = []
    for (const [key, items] of Object.entries(groups)) {
      if (items.length > 0) {
        nonEmpty.push({ key, label: groupLabels[key] || key, items, count: items.length })
      }
    }
    return nonEmpty
  }

  /**
   * Extrae las opciones únicas disponibles para filtros.
   * Retorna { tipos, marcas, ubicaciones } con conteos.
   */
  function getFilterOptions() {
    const data = items.value || []
    if (data.length === 0) return { tipos: [], marcas: [], ubicaciones: [] }

    const tipoMap = {}
    const marcaMap = {}
    const ubiMap = {}

    data.forEach(item => {
      // Tipo
      const tipo = inferGroupType(item)
      tipoMap[tipo] = (tipoMap[tipo] || 0) + 1

      // Marca
      const marca = normalizeFiltro(item.marca)
      if (marca) {
        marcaMap[marca] = (marcaMap[marca] || 0) + 1
      }

      // Ubicación
      const ubi = normalizeFiltro(item.ubicacion)
      if (ubi) {
        ubiMap[ubi] = (ubiMap[ubi] || 0) + 1
      }
    })

    const tipoLabels = {
      'equipo-medico': '🏥 Equipos Médicos',
      'accesorio': '🔌 Accesorios',
      'consumible': '💊 Consumibles',
      'refaccion': '🔧 Refacciones',
      'otro': '📦 Otros',
    }

    const tipos = Object.entries(tipoMap)
      .map(([key, count]) => ({ key, label: tipoLabels[key] || key, count }))
      .sort((a, b) => b.count - a.count)

    const marcas = Object.entries(marcaMap)
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30) // Top 30 marcas

    const ubicaciones = Object.entries(ubiMap)
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25) // Top 25 ubicaciones

    return { tipos, marcas, ubicaciones }
  }

  /**
   * Normaliza un valor para usar como clave de filtro.
   */
  function normalizeFiltro(val) {
    if (!val) return null
    const s = String(val).trim()
    if (s === '' || s.toUpperCase() === 'N/A' || /^[-_0]*$/.test(s)) return null
    return s
  }

  return {
    // Estado
    isIndexReady,
    results,
    lastQuery,
    // Métodos
    search,
    searchGrouped,
    searchGroupedFiltered,
    highlightField,
    highlightText,
    getMatchInfo,
    buildIndex,
    inferGroupType,
    getInitialItems,
    getFilterOptions,
    applyFiltersToResults,
  }
}
