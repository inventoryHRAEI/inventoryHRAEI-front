import { ref, watch } from 'vue'
import { authedFetch } from '@/utils/api.js'
import * as biomedicalCatalog from '@/services/biomedicalEquipmentCatalog.js'

export function useInventorySuggestions(options = {}) {
  const {
    tipo = null, // 'equipo', 'accesorio', 'consumible', 'refaccion', o null para todos
    onSelect = () => { },
    debounceMs = 300
    ,
    // Si true, solicita al endpoint remoto los datos "full" (sin dedupe) para búsquedas.
    noDedupeOnSearch = true
  } = options

  // Estado reactivo
  const searchTerm = ref('')
  const suggestions = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  let lastFetchId = 0

  const equipoMedicoList = ref([])
  const insumosRefaccionesList = ref([])
  const allInventoryList = ref([])

  let debounceTimer = null

  const { rows: biomedicalEquipmentRows } = biomedicalCatalog.getBiomedicalEquipmentCatalogState()

  const resolveTipo = () => {
    if (tipo && typeof tipo === 'object' && Object.prototype.hasOwnProperty.call(tipo, 'value')) {
      return tipo.value
    }
    return tipo
  }

  // Helpers
  const normalizeString = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
  }

  const isValidFieldValue = (valor) => {
    if (!valor && valor !== 0) return false
    const str = typeof valor === 'string' ? valor : String(valor)
    const cleaned = str.trim()
    if (cleaned === '') return false
    if (cleaned.toUpperCase() === 'N/A') return false
    if (/^[-_0]*$/.test(cleaned)) return false
    return true
  }

  const pickFirstValue = (item, keys = []) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const raw = item[key]
        if (isValidFieldValue(raw)) return normalizeString(raw)
      }
    }
    return ''
  }

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

  const inferItemType = (item, nombre = '') => {
    const haystack = `${getTypeHint(item)} ${normalizeString(nombre)}`.toLowerCase()
    if (!haystack) return 'unknown'
    if (/\b(accesorio|accesorios|consumible|consumibles|refaccion|refacción|refacciones|insumo|insumos)\b/.test(haystack)) return 'insumo'
    if (/\b(equipo|mobiliario|instrumento|dispositivo)\b/.test(haystack)) return 'equipo'
    return 'unknown'
  }

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

    const tipoInferido = inferItemType(item, nombre)
    // Prioridad: tipo explícito > inferido (si no es unknown) > default por contexto
    let resolvedTipo = item.tipo
    if (!resolvedTipo && tipoInferido !== 'unknown') {
      resolvedTipo = tipoInferido
    }
    if (!resolvedTipo) {
      resolvedTipo = (resolveTipo() === 'equipo' || resolveTipo() === 'equipo-medico') ? 'equipo-medico' : 'insumo'
    }

    const lowerHint = `${nombre || ''} ${claveHRAEI || ''} ${marca || ''}`.toLowerCase()
    const isExternal = /comodato|donaci.n|donación|externo|prestamo|préstamo|comodatos|donaciones/.test(lowerHint)

    return {
      nombre,
      marca,
      ubicacion,
      modelo,
      serie,
      lote,
      referencia,
      claveHRAEI,
      tipo: tipoInferido,
      isExternal,
      noInventario: pickFirstValue(item, ['No. Inventario', 'No Inventario', 'NUMERO INVENTARIO', 'NÚMERO INVENTARIO', 'noInventario', 'no_inventario', 'N_DE_INVENTARIO', 'n', 'N']),
      claveCNIS: pickFirstValue(item, ['CLAVE CNIS', 'Clave CNIS', 'claveCNIS', 'CLAVE_CNIS', 'CNIS']),
      label: `${nombre || 'Sin descripción'} - ${marca || 'Sin marca'} (${ubicacion || 'N/A'})`
    }

  }

  // Carga completa desde el API biomedica
  async function fetchAllInventorySuggestions() {
    try {
      isLoading.value = true
      error.value = null
      const stockUrl = '/api/ops/stock-biomedica?noDedupe=1'
      const res = await authedFetch(stockUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.ok && Array.isArray(data.data)) {
        allInventoryList.value = data.data.map(mapInventoryItem)
        syncSuggestionsWithLoadedLists()
      }
    } catch (err) {
      console.error('[fetchAllInventorySuggestions] Error:', err)
      error.value = err.message || 'Error al cargar inventario'
      // No limpiamos allInventoryList para evitar que desaparezcan las sugerencias previas (Regla de "nunca desaparezcan")
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Método de recarga agresiva: intenta refrescar tanto equipos como insumos
   * ignorando cachés y garantizando la repoblación de las listas.
   */
  async function forceRefreshAll() {
    isLoading.value = true
    error.value = null
    try {
      // 1. Refrescar Catálogo de Equipos Médicos (Singleton)
      await biomedicalCatalog.refreshBiomedicalEquipmentCatalog()
      // 2. Refrescar Stock de Insumos/Accesorios
      await fetchAllInventorySuggestions()
      // 3. Forzar sincronización
      await fetchEquipoMedicoSuggestions()
      await fetchInsumosRefaccionesSuggestions()
      syncSuggestionsWithLoadedLists()
      return true
    } catch (err) {
      console.error('[forceRefreshAll] Error crítico:', err)
      error.value = 'No se pudieron sincronizar las sugerencias. Reintentando...'
      // Reintento automático silencioso tras 2 segundos si falló
      setTimeout(() => fetchAllInventorySuggestions(), 2000)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEquipoMedicoSuggestions() {
    try {
      isLoading.value = true
      error.value = null

      // Cargar una sola vez (global) y reusar en toda la app
      await biomedicalCatalog.ensureBiomedicalEquipmentCatalogLoaded()
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
        const noInventario = pickFirstValue(row, ['NO_INVENTARIO', 'No. Inventario', 'No Inventario', 'NUMERO INVENTARIO', 'NÚMERO INVENTARIO', 'noInventario', 'no_inventario', 'N_DE_INVENTARIO', 'n', 'N'])
        const claveCNIS = pickFirstValue(row, ['CLAVE CNIS', 'Clave CNIS', 'CLAVE_CNIS', 'claveCNIS', 'CNIS'])

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
      syncSuggestionsWithLoadedLists()
    } catch (err) {
      console.error('[fetchEquipoMedicoSuggestions] Error:', err)
      error.value = err.message || 'Error al obtener equipos médicos'
      equipoMedicoList.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInsumosRefaccionesSuggestions() {
    if (!allInventoryList.value.length) {
      await fetchAllInventorySuggestions()
    }
    insumosRefaccionesList.value = allInventoryList.value.map(item => ({
      ...item,
      tipo: item.tipo || inferItemType(item, item.nombre)
    }))
    syncSuggestionsWithLoadedLists()
  }

  // Mantener `suggestions` sincronizado con las listas cargadas cuando
  // no hay término de búsqueda activo. Esto asegura que el componente
  // `SearchableInput` reciba una lista inicial para indexar (getInitialItems).
  const syncSuggestionsWithLoadedLists = () => {
    const resolved = resolveTipo()
    const term = searchTerm.value?.trim()
    // Solo sobrescribemos suggestions si NO hay término de búsqueda (estado inicial)
    if (term && term.length >= 2) return

    // Para mobiliario y refacciones, no proporcionar sugerencias, solo llenado manual
    if (resolved === 'mobiliario' || resolved === 'refaccion') {
      suggestions.value = []
      return
    }

    if (resolved === 'equipo' || resolved === 'equipo-medico') {
      // Usar lista de equipos si está cargada
      if (equipoMedicoList.value && equipoMedicoList.value.length) {
        suggestions.value = equipoMedicoList.value
        return
      }
      // si no está, dejar como está (viene vacía o remote)
      suggestions.value = []
      return
    }

    if (resolved === 'insumo' || resolved === 'accesorio' || resolved === 'consumible') {
      if (insumosRefaccionesList.value && insumosRefaccionesList.value.length) {
        suggestions.value = insumosRefaccionesList.value
        return
      }
      // fallback a allInventoryList
      suggestions.value = allInventoryList.value || []
      return
    }

    // Default: si hay allInventoryList, úsalo como fuente inicial
    suggestions.value = allInventoryList.value && allInventoryList.value.length ? allInventoryList.value : []
  }

  // Observadores para mantener sincronía tras cargas o cambios de tipo/termino
  watch([() => resolveTipo(), () => insumosRefaccionesList.value.length, () => equipoMedicoList.value.length, () => allInventoryList.value.length], () => {
    syncSuggestionsWithLoadedLists()
  })

  watch(searchTerm, (val) => {
    if (!val || String(val).trim().length < 2) {
      // restaurar lista inicial cuando el usuario borra el término
      syncSuggestionsWithLoadedLists()
    }
  })

  // Filtrado puro sobre listas cargadas localmente
  const normalizeSearchToken = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
  }

  const filterSuggestions = (list, searchText, fieldName = null) => {
    if (!searchText) return list
    const query = normalizeSearchToken(searchText)
    if (!query) return []

    return list.filter(item => {
      if (fieldName) {
        const fieldVal = normalizeSearchToken(item[fieldName])
        return fieldVal.includes(query)
      }

      return [
        item.nombre,
        item.marca,
        item.ubicacion,
        item.modelo,
        item.serie,
        item.lote,
        item.referencia,
        item.claveHRAEI,
        item.claveCNIS,
        item.noInventario
      ].some(val => normalizeSearchToken(val).includes(query))
    })
  }

  const getFilteredEquipoMedicoSuggestions = (searchText, fieldName = null) => filterSuggestions(equipoMedicoList.value, searchText, fieldName)
  const getFilteredInsumosRefaccionesSuggestions = (searchText, fieldName = null) => filterSuggestions(insumosRefaccionesList.value, searchText, fieldName)

  const getDynamicSuggestions = (tipoSeleccionado, searchText, fieldName = null) => {
    if (!tipoSeleccionado) return []
    if (tipoSeleccionado === 'mobiliario') {
      return []
    }
    if (tipoSeleccionado === 'equipo' || tipoSeleccionado === 'equipo-medico') {
      return getFilteredEquipoMedicoSuggestions(searchText, fieldName)
    }
    if (tipoSeleccionado === 'refaccion') {
      return []
    }
    if (['accesorio', 'consumible', 'insumo'].includes(tipoSeleccionado)) {
      return getFilteredInsumosRefaccionesSuggestions(searchText, fieldName)
    }
    return []
  }

  const fillUnitFromSuggestion = (unidad, suggestion) => {
    if (!suggestion || typeof unidad !== 'object') return unidad
    const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'referenciaEquipo', 'claveHRAEI', 'claveCNIS', 'noInventario']
    campos.forEach(campo => {
      const valor = suggestion[campo]
      if (isValidFieldValue(valor)) {
        unidad[campo] = String(valor).trim()
      } else {
        unidad[campo] = 'N/A'
      }
    })
    return unidad
  }

  const getSuggestionAvailableFields = (suggestion) => {
    if (!suggestion) return {}
    const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'referenciaEquipo', 'claveHRAEI', 'claveCNIS', 'noInventario']
    const disponibles = {}
    campos.forEach(campo => {
      const valor = suggestion[campo]
      disponibles[campo] = valor && String(valor).trim() !== '' && valor !== 'N/A'
    })
    return disponibles
  }

  // Búsqueda remota (debounced)
  async function fetchSuggestions(term = searchTerm.value?.trim()) {
    if (!term || term.length < 2) return

    // MEDIDA DRÁSTICA: Si ya tenemos el catálogo completo cargado (allInventoryList),
    // NO llamamos al servidor. Filtramos localmente para evitar latencia y truncamiento del API.
    if (allInventoryList.value.length > 500) {
      console.log('[fetchSuggestions] Usando búsqueda local en memoria para:', term);
      const filtered = getDynamicSuggestions(resolveTipo(), term);
      suggestions.value = filtered;
      return;
    }

    const currentFetchId = ++lastFetchId
    isLoading.value = true
    error.value = null

    // Si el término cambió significativamente, limpiar sugerencias actuales para evitar "stickiness"
    if (term.length > 2) {
      suggestions.value = []
    }

    try {
      const resolvedTipo = resolveTipo()
      const paramsObj = {
        search: term,
        limit: '5000',
        noDedupe: '1',
        ...(resolvedTipo && resolvedTipo !== 'todos' ? { tipo: resolvedTipo } : {})
      }
      // For mobiliario and refaccion, no suggestions
      if (resolvedTipo === 'mobiliario' || resolvedTipo === 'refaccion') {
        suggestions.value = []
        return
      }
      // If searching for equipos (equipo-medico), use equipos-medicos list
      if (resolvedTipo === 'equipo' || resolvedTipo === 'equipo-medico') {
        // Ensure equipo list is loaded
        if (!equipoMedicoList.value || equipoMedicoList.value.length === 0) {
          await fetchEquipoMedicoSuggestions()
        }
        const normalizedQuery = String(term || '').trim().toLowerCase()
        // Use local filtering on equipoMedicoList to provide fast suggestions
        const local = filterSuggestions(equipoMedicoList.value || [], term)
        const normalizeItem = (v) => String(v || '').trim().toLowerCase()
        suggestions.value = (local || []).map(item => ({
          ...item,
          exactMatch: ['lote', 'referencia', 'claveHRAEI', 'noInventario', 'n'].some(field => normalizeItem(item[field]) === normalizedQuery)
        }))
        return
      }

      // Default: query backend inventory search
      // Si se desea evitar deduplicado en el backend, pedir noDedupe
      if (noDedupeOnSearch) {
        paramsObj.noDedupe = '1'
        // algunas rutas pueden responder mejor con full en caso de filtro local
        paramsObj.full = '1'
      }

      const params = new URLSearchParams(paramsObj).toString()
      const response = await authedFetch(`/api/ops/inventory/search?${params}`)

      if (response.ok) {
        const data = await response.json()
        if (data?.success) {
          const normalizedQuery = String(term || '').trim().toLowerCase()
          const normalizeItem = (v) => String(v || '').trim().toLowerCase()
          const remoteSuggestions = (data.data || []).map(item => ({
            ...item,
            exactMatch: ['lote', 'referencia', 'claveHRAEI', 'noInventario', 'n'].some(field => normalizeItem(item[field]) === normalizedQuery)
          }))
            .sort((a, b) => {
              const aExact = a.exactMatch ? 1 : 0
              const bExact = b.exactMatch ? 1 : 0
              return bExact - aExact
            })

          if (remoteSuggestions.length === 0) {
            // Si la búsqueda remota no devuelve resultados, intentar fallback local usando el inventario prefetched
            const local = filterSuggestions(allInventoryList.value || [], term)
            suggestions.value = local.map(item => ({
              ...item,
              exactMatch: ['lote', 'referencia', 'claveHRAEI', 'noInventario', 'n'].some(field => normalizeItem(item[field]) === normalizedQuery)
            }))
          } else {
            if (currentFetchId !== lastFetchId) return
            suggestions.value = remoteSuggestions
          }
        } else {
          suggestions.value = []
          error.value = data?.message || 'Error al buscar items'
        }
      } else {
        const errorData = await response.json().catch(() => null)
        suggestions.value = []
        error.value = errorData?.message || `HTTP ${response.status}`
      }
    } catch (err) {
      console.error('Error en búsqueda de items:', err)
      error.value = err?.message || 'Error al buscar items'
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }

  const selectItem = (item) => {
    if (!item) return
    const selectedItem = {
      id: item.id,
      _id: item._id || item.id,
      tipo: item.tipo || resolveTipo(),
      nombre: item.nombre || '',
      descripcion: item.descripcion || item.nombre || '',
      modelo: item.modelo || '',
      marca: item.marca || '',
      serie: item.serie || '',
      lote: item.lote || '',
      referencia: item.referencia || '',
      ubicacion: item.ubicacion || '',
      claveHRAEI: item.claveHRAEI || '',
      cantidad: item.cantidad || 1,
      equipoAsociado: item.equipoAsociado || '',
      ...item
    }

    onSelect(selectedItem)
    searchTerm.value = ''
    suggestions.value = []
  }

  const clearSuggestions = () => { suggestions.value = [] }

  const debouncedSearch = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => fetchSuggestions(), debounceMs)
  }

  watch(searchTerm, () => { debouncedSearch() })
  watch(() => resolveTipo(), () => {
    if (searchTerm.value?.trim()?.length >= 2) {
      fetchSuggestions()
    } else {
      syncSuggestionsWithLoadedLists()
    }
  })

  return {
    // Estado
    searchTerm,
    suggestions,
    isLoading,
    error,
    equipoMedicoList,
    insumosRefaccionesList,
    allInventoryList,
    // Métodos
    selectItem,
    clearSuggestions,
    // Búsqueda manual (útil para recargar)
    search: fetchSuggestions,
    forceRefreshAll,
    // Métodos legacy / utilitarios
    fetchAllInventorySuggestions,
    fetchEquipoMedicoSuggestions,
    fetchInsumosRefaccionesSuggestions,
    filterSuggestions,
    getFilteredEquipoMedicoSuggestions,
    getFilteredInsumosRefaccionesSuggestions,
    getDynamicSuggestions,
    fillUnitFromSuggestion,
    getSuggestionAvailableFields,
    // Helpers expuestos
    isValidFieldValue
  }
}
