import { ref } from 'vue'
import Fuse from 'fuse.js'
import { authedFetch } from '@/utils/api.js'
import { ensureBiomedicalEquipmentCatalogLoaded, getBiomedicalEquipmentCatalogState } from '@/services/biomedicalEquipmentCatalog.js'

/**
 * Composable mejorado para sugerencias de inventario con Fuse.js
 * Proporciona búsqueda fuzzy inteligente y ranking automático por relevancia
 */
export function useInventorySuggestionsAdvanced() {
  const equipoMedicoList = ref([])
  const insumosRefaccionesList = ref([])
  const allInventoryList = ref([])
  const loading = ref(false)
  const error = ref(null)

  // NUEVO: Instancias de Fuse.js para búsqueda fuzzy
  const fuseEquipoMedico = ref(null)
  const fuseInsumos = ref(null)

  // Cache de búsquedas recientes para optimizar rendimiento
  const searchCache = ref(new Map())

  const { rows: biomedicalEquipmentRows } = getBiomedicalEquipmentCatalogState()

  /**
   * Normaliza un string para búsqueda
   */
  const normalizeString = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
  }

  /**
   * Obtiene el primer valor válido de múltiples claves
   */
  const pickFirstValue = (item, keys = []) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const raw = item[key]
        if (isValidFieldValue(raw)) return normalizeString(raw)
      }
    }
    return ''
  }

  /**
   * Obtiene un hint del tipo de item del inventario
   */
  const getTypeHint = (item) => {
    const hintKeys = [
      'TIPO', 'Tipo', 'tipo',
      'CATEGORIA', 'Categoría', 'Categoria', 'categoría', 'categoria',
      'CLASIFICACION', 'Clasificación', 'Clasificacion', 'clasificación', 'clasificacion',
      'RUBRO', 'Rubro', 'rubro',
      'SECCION', 'Sección', 'Seccion', 'sección', 'seccion',
      'FAMILIA', 'Familia', 'familia',
      'SUBCLASE', 'Subclase', 'subclase',
      'TIPO DE BIEN', 'Tipo de bien', 'tipo de bien'
    ]
    const hints = []
    hintKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const raw = item[key]
        if (isValidFieldValue(raw)) hints.push(normalizeString(raw))
      }
    })
    return hints.join(' | ').toLowerCase()
  }

  /**
   * Infiere el tipo de item basado en su contenido
   */
  const inferItemType = (item, nombre = '') => {
    const haystack = `${getTypeHint(item)} ${normalizeString(nombre)}`.toLowerCase()
    if (!haystack) return 'unknown'
    if (/\b(equipo|mobiliario|instrumento|dispositivo)\b/.test(haystack)) return 'equipo'
    if (/\b(accesorio|accesorios|consumible|consumibles|refaccion|refacción|refacciones|insumo|insumos)\b/.test(haystack)) {
      return 'insumo'
    }
    return 'unknown'
  }

  /**
   * Mapea un item del inventario a formato estándar
   */
  const mapInventoryItem = (item) => {
    const nombre = pickFirstValue(item, [
      'Descripción del bien', 'Descripcion del bien', 'DESCRIPCION DEL BIEN', 'DESCRIPCIÓN DEL BIEN',
      'EQUIPO MEDICO', 'EQUIPO MÉDICO', 'Equipo medico', 'Equipo médico'
    ])
    const marca = pickFirstValue(item, ['MARCA', 'Marca', 'FABRICANTE', 'Fabricante'])
    const ubicacion = pickFirstValue(item, [
      'Ubicación', 'UBICACION', 'Ubicacion', 'UBICACIÓN',
      'UBICACION ESPECIFICA', 'Ubicación específica', 'Ubicacion especifica',
      'AREA', 'ÁREA', 'Area', 'Área'
    ]) || 'N/A'
    const modelo = pickFirstValue(item, ['MODELO', 'Modelo', 'MODELO / VERSIÓN', 'Modelo / Versión', 'Modelo / Version'])
    const serie = pickFirstValue(item, ['No. de Serie', 'No de Serie', 'NUMERO DE SERIE', 'NÚMERO DE SERIE', 'SERIE', 'Serie'])
    const lote = pickFirstValue(item, ['Lote', 'LOTE'])
    const referencia = pickFirstValue(item, ['REFERENCIA', 'Referencia', 'Codigo Ref', 'Código Ref', 'CODIGO REF', 'CÓDIGO REF'])
    const claveHRAEI = pickFirstValue(item, ['Clave  HRAEI', 'CLAVE HRAEI', 'Clave HRAEI', 'CLAVE  HRAEI'])
    const tipo = inferItemType(item, nombre)

    return {
      nombre,
      marca,
      ubicacion,
      modelo,
      serie,
      lote,
      referencia,
      claveHRAEI,
      tipo,
      label: `${nombre || 'Sin descripción'} - ${marca || 'Sin marca'} (${ubicacion || 'N/A'})`
    }
  }

  /**
   * VALIDACIÓN CRÍTICA: Detecta si un valor del inventario es válido
   * Retorna TRUE solo si el campo tiene un VERDADERO dato
   */
  function isValidFieldValue(valor) {
    if (!valor) return false
    const strValue = typeof valor === 'string' ? valor : valor.toString()
    const cleaned = strValue.trim()
    if (cleaned === '') return false
    if (cleaned.toUpperCase() === 'N/A') return false
    if (/^[-_0]*$/.test(cleaned)) return false
    return true
  }

  /**
   * Obtiene todas las sugerencias desde el API biomedica
   */
  async function fetchAllInventorySuggestions() {
    try {
      loading.value = true
      error.value = null
      const response = await authedFetch('/api/ops/stock-biomedica')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.ok && Array.isArray(data.data)) {
        allInventoryList.value = data.data.map(mapInventoryItem)
        console.log(`[fetchAllInventorySuggestions] Cargados ${allInventoryList.value.length} registros`)
      }
    } catch (err) {
      console.error('[fetchAllInventorySuggestions] Error:', err)
      error.value = err.message
      allInventoryList.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene sugerencias de equipos médicos desde el historial
   */
  async function fetchEquipoMedicoSuggestions() {
    try {
      loading.value = true
      error.value = null

      await ensureBiomedicalEquipmentCatalogLoaded()
      const srcRows = biomedicalEquipmentRows.value || []

      equipoMedicoList.value = srcRows.map((row) => {
        const nombre = pickFirstValue(row, [
          'EQUIPO MEDICO', 'EQUIPO MÉDICO', 'Equipo medico', 'Equipo médico',
          'DESCRIPCION DEL BIEN', 'DESCRIPCIÓN DEL BIEN', 'Descripción del bien', 'Descripcion del bien'
        ])
        const marca = pickFirstValue(row, ['MARCA', 'Marca', 'FABRICANTE', 'Fabricante'])
        const ubicacion = pickFirstValue(row, [
          'UBICACION', 'UBICACIÓN', 'Ubicación', 'Ubicacion',
          'UBICACION ESPECIFICA', 'Ubicación específica', 'Ubicacion especifica',
          'AREA', 'ÁREA', 'Area', 'Área'
        ]) || 'N/A'
        const modelo = pickFirstValue(row, ['MODELO', 'Modelo', 'MODELO / VERSIÓN', 'Modelo / Versión', 'Modelo / Version'])
        const serie = pickFirstValue(row, ['NO. SERIE', 'No. de Serie', 'No de Serie', 'NUMERO DE SERIE', 'NÚMERO DE SERIE', 'SERIE', 'Serie'])
        const lote = pickFirstValue(row, ['LOTE', 'Lote'])
        const referencia = pickFirstValue(row, ['REFERENCIA', 'Referencia', 'CODIGO REF', 'CÓDIGO REF', 'Codigo Ref', 'Código Ref'])
        const claveHRAEI = pickFirstValue(row, ['CLAVE HRAEI', 'Clave HRAEI', 'Clave  HRAEI', 'CLAVE  HRAEI'])
        const claveCNIS = pickFirstValue(row, ['CLAVE CNIS', 'Clave CNIS', 'CLAVE_CNIS', 'claveCNIS'])
        const noInventario = pickFirstValue(row, ['NO_INVENTARIO', 'No. Inventario', 'No Inventario', 'NUMERO INVENTARIO', 'NÚMERO INVENTARIO', 'noInventario'])

        return {
          nombre,
          marca,
          ubicacion,
          modelo,
          serie,
          lote,
          referencia,
          claveHRAEI,
          claveCNIS,
          noInventario,
          tipo: 'equipo-medico',
          label: `${nombre || 'Sin descripción'} - ${marca || 'Sin marca'} (${ubicacion || 'N/A'})`
        }
      })

      console.log(`[fetchEquipoMedicoSuggestions] Cargados ${equipoMedicoList.value.length} registros`)

      // Re-crear índices de Fuse con los datos nuevos
      initFuseIndices()
    } catch (err) {
      console.error('[fetchEquipoMedicoSuggestions] Error:', err)
      error.value = err.message
      equipoMedicoList.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene sugerencias de insumos, accesorios, consumibles y refacciones
   */
  async function fetchInsumosRefaccionesSuggestions() {
    if (!allInventoryList.value.length) {
      await fetchAllInventorySuggestions()
    }
    // Mapear tipos correctamente
    insumosRefaccionesList.value = allInventoryList.value.map(item => ({
      ...item,
      tipo: inferItemType(item, item.nombre)
    }))
  }

  /**
   * NUEVO: Inicializa los índices de Fuse.js
   * Se llama una sola vez después de cargar los datos
   * Esto permite búsquedas fuzzy ultrarápidas
   */
  const initFuseIndices = () => {
    // Configuración optimizada de Fuse.js para búsqueda inteligente
    const fuseOptions = {
      keys: [
        { name: 'nombre', weight: 0.4 },        // 40% de peso - campo principal
        { name: 'marca', weight: 0.15 },        // 15% - marca es importante
        { name: 'modelo', weight: 0.1 },        // 10% - modelo útil
        { name: 'serie', weight: 0.08 },        // 8% - serie
        { name: 'referencia', weight: 0.08 },   // 8% - referencia
        { name: 'ubicacion', weight: 0.05 },    // 5% - ubicación
        { name: 'lote', weight: 0.05 },         // 5% - lote
        { name: 'claveHRAEI', weight: 0.04 },   // 4% - clave HRAEI
        { name: 'claveCNIS', weight: 0.03 },    // 3% - clave CNIS
        { name: 'noInventario', weight: 0.02 }  // 2% - número de inventario
      ],
      threshold: 0.3,           // Permitir 30% de desviación (fuzzy search)
      minMatchCharLength: 2,    // Mínimo 2 caracteres
      shouldSort: true,         // Ordenar por relevancia
      includeScore: true,       // Incluir score de relevancia
      useExtendedSearch: true   // Operadores avanzados: 'campo:'valor
    }

    try {
      if (equipoMedicoList.value.length > 0) {
        fuseEquipoMedico.value = new Fuse(equipoMedicoList.value, fuseOptions)
        console.log('[initFuseIndices] Índice Fuse para equipos médicos creado')
      }

      if (insumosRefaccionesList.value.length > 0) {
        fuseInsumos.value = new Fuse(insumosRefaccionesList.value, fuseOptions)
        console.log('[initFuseIndices] Índice Fuse para insumos creado')
      }
    } catch (err) {
      console.error('[initFuseIndices] Error creando índices:', err)
    }

    // Limpiar cache
    searchCache.value.clear()
  }

  /**
   * NUEVO: Búsqueda fuzzy con Fuse.js
   * Retorna resultados ordenados por relevancia automáticamente
   */
  function getFuzzySearchResults(list, fuse, searchText, fieldName = null) {
    if (!searchText || !fuse) {
      return list // Sin búsqueda, devolver todos
    }

    // Crear clave de caché
    const cacheKey = `${fieldName || 'all'}:${searchText}`

    // Devolver desde caché si existe
    if (searchCache.value.has(cacheKey)) {
      return searchCache.value.get(cacheKey)
    }

    // Realizar búsqueda fuzzy
    let results = []
    
    if (fieldName) {
      // Búsqueda en campo específico usando sintaxis extendida
      results = fuse.search(`${fieldName}:'${searchText}'`)
    } else {
      // Búsqueda general en todos los campos
      results = fuse.search(searchText)
    }

    // Extraer items del resultado y mapear por score
    const items = results
      .map(result => ({
        item: result.item,
        score: result.score // Score de relevancia (menor es mejor)
      }))
      .sort((a, b) => a.score - b.score) // Ordenar por score
      .slice(0, 100) // Limitar a 100 resultados
      .map(r => r.item)

    // Guardar en caché
    searchCache.value.set(cacheKey, items)

    return items
  }

  /**
   * Filtra sugerencias usando búsqueda simple (fallback)
   * Se usa cuando Fuse no está disponible
   */
  function filterSuggestions(list, searchText, fieldName = null) {
    if (!searchText) return list

    const query = searchText.toLowerCase()
    return list.filter(item => {
      if (fieldName) {
        return item[fieldName] && item[fieldName].toLowerCase().includes(query)
      }
      return (
        (item.nombre && item.nombre.toLowerCase().includes(query)) ||
        (item.marca && item.marca.toLowerCase().includes(query)) ||
        (item.ubicacion && item.ubicacion.toLowerCase().includes(query)) ||
        (item.modelo && item.modelo.toLowerCase().includes(query)) ||
        (item.serie && item.serie.toLowerCase().includes(query)) ||
        (item.lote && item.lote.toLowerCase().includes(query)) ||
        (item.referencia && item.referencia.toLowerCase().includes(query)) ||
        (item.claveHRAEI && item.claveHRAEI.toLowerCase().includes(query)) ||
        (item.claveCNIS && item.claveCNIS.toLowerCase().includes(query)) ||
        (item.noInventario && item.noInventario.toLowerCase().includes(query))
      )
    }).slice(0, 100)
  }

  /**
   * NUEVO: Obtiene sugerencias dinámicamente usando Fuse.js
   * Automáticamente prioriza resultados más relevantes
   */
  function getDynamicSuggestions(tipoSeleccionado, searchText, fieldName = null) {
    if (tipoSeleccionado === 'equipo-medico' || tipoSeleccionado === 'mobiliario') {
      // Usar Fuse si está disponible, sino fallback a filtrado simple
      if (fuseEquipoMedico.value && searchText) {
        return getFuzzySearchResults(equipoMedicoList.value, fuseEquipoMedico.value, searchText, fieldName)
      } else {
        return filterSuggestions(equipoMedicoList.value, searchText, fieldName)
      }
    } else if (['accesorio', 'consumible', 'refaccion'].includes(tipoSeleccionado)) {
      // Usar Fuse si está disponible
      if (fuseInsumos.value && searchText) {
        return getFuzzySearchResults(insumosRefaccionesList.value, fuseInsumos.value, searchText, fieldName)
      } else {
        return filterSuggestions(insumosRefaccionesList.value, searchText, fieldName)
      }
    }
    return []
  }

  /**
   * Rellena un objeto unidad con información de una sugerencia
   */
  function fillUnitFromSuggestion(unidad, suggestion) {
    if (!suggestion || typeof unidad !== 'object') return unidad

    const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']

    campos.forEach(campo => {
      const valor = suggestion[campo]
      if (isValidFieldValue(valor)) {
        const strValue = typeof valor === 'string' ? valor : valor.toString()
        unidad[campo] = strValue.trim()
      } else {
        unidad[campo] = 'N/A'
      }
    })

    return unidad
  }

  /**
   * Obtiene un resumen de campos disponibles
   */
  function getSuggestionAvailableFields(suggestion) {
    if (!suggestion) return {}

    const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']
    const disponibles = {}

    campos.forEach(campo => {
      const valor = suggestion[campo]
      disponibles[campo] = valor && valor.toString().trim() !== '' && valor !== 'N/A'
    })

    return disponibles
  }

  /**
   * NUEVO: Inicializa todo el composable
   * Carga datos y crea índices Fuse
   */
  const initSuggestions = async () => {
    await Promise.all([
      fetchEquipoMedicoSuggestions(),
      fetchInsumosRefaccionesSuggestions()
    ])
    // NUEVO: Inicializar índices Fuse después de cargar datos
    initFuseIndices()
  }

  /**
   * Limpia el caché de búsquedas
   */
  const clearSearchCache = () => {
    searchCache.value.clear()
  }

  return {
    // Estado
    equipoMedicoList,
    insumosRefaccionesList,
    loading,
    error,

    // Métodos de carga
    fetchAllInventorySuggestions,
    fetchEquipoMedicoSuggestions,
    fetchInsumosRefaccionesSuggestions,

    // Métodos de búsqueda
    filterSuggestions,
    getDynamicSuggestions,
    getFuzzySearchResults,

    // Métodos auxiliares
    fillUnitFromSuggestion,
    getSuggestionAvailableFields,
    isValidFieldValue,
    initFuseIndices,
    clearSearchCache,

    // Inicialización
    initSuggestions
  }
}
