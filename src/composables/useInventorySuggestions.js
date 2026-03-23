import { ref, watch } from 'vue'
import { authedFetch } from '@/utils/api.js'

export function useInventorySuggestions(options = {}) {
  const {
    tipo = null, // 'equipo', 'accesorio', 'consumible', 'refaccion', o null para todos
    onSelect = () => {},
    debounceMs = 300
  } = options

  // Estado reactivo
  const searchTerm = ref('')
  const suggestions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const equipoMedicoList = ref([])
  const insumosRefaccionesList = ref([])
  const allInventoryList = ref([])

  let debounceTimer = null

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
    if (/\b(equipo|mobiliario|instrumento|dispositivo)\b/.test(haystack)) return 'equipo'
    if (/\b(accesorio|accesorios|consumible|consumibles|refaccion|refacción|refacciones|insumo|insumos)\b/.test(haystack)) return 'insumo'
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
      noInventario: pickFirstValue(item, ['No. Inventario', 'No Inventario', 'NUMERO INVENTARIO', 'NÚMERO INVENTARIO', 'noInventario']),
      claveCNIS: pickFirstValue(item, ['CLAVE CNIS', 'Clave CNIS', 'claveCNIS']),
      label: `${nombre || 'Sin descripción'} - ${marca || 'Sin marca'} (${ubicacion || 'N/A'})`
    }
  }

  // Carga completa desde el API biomedica
  async function fetchAllInventorySuggestions() {
    try {
      isLoading.value = true
      error.value = null
      const res = await authedFetch('/api/ops/stock-biomedica')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.ok && Array.isArray(data.data)) {
        allInventoryList.value = data.data.map(mapInventoryItem)
      } else {
        allInventoryList.value = []
      }
    } catch (err) {
      console.error('[fetchAllInventorySuggestions] Error:', err)
      error.value = err.message || 'Error al cargar inventario'
      allInventoryList.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEquipoMedicoSuggestions() {
    try {
      isLoading.value = true
      error.value = null
      const res = await authedFetch('/api/ops/equipos-medicos')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.ok && Array.isArray(data.data)) {
        equipoMedicoList.value = data.data.map(item => ({
          nombre: (item.nombre || '').trim(),
          marca: (item.marca || '').trim(),
          ubicacion: (item.ubicacion || '').trim() || 'N/A',
          modelo: (item.modelo || '').trim(),
          serie: (item.serie || '').trim(),
          lote: (item.lote || '').trim(),
          referencia: (item.referencia || '').trim(),
          claveHRAEI: (item.claveHRAEI || '').trim(),
          claveCNIS: (item.claveCNIS || '').trim(),
          noInventario: (item.noInventario || '').trim(),
          label: `${(item.nombre || 'Sin descripción').trim()} - ${(item.marca || 'Sin marca').trim()} (${(item.ubicacion || 'N/A').trim()})`
        }))
      } else {
        equipoMedicoList.value = []
      }
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
  }

  // Mantener `suggestions` sincronizado con las listas cargadas cuando
  // no hay término de búsqueda activo. Esto asegura que el componente
  // `SearchableInput` reciba una lista inicial para indexar (getInitialItems).
  const syncSuggestionsWithLoadedLists = () => {
    const resolved = resolveTipo()
    const term = searchTerm.value?.trim()
    // Solo sobrescribimos suggestions si NO hay término de búsqueda (estado inicial)
    if (term && term.length >= 2) return

    if (resolved === 'equipo' || resolved === 'equipo-medico' || resolved === 'mobiliario') {
      // Usar lista de equipos si está cargada
      if (equipoMedicoList.value && equipoMedicoList.value.length) {
        suggestions.value = equipoMedicoList.value
        return
      }
      // si no está, dejar como está (viene vacía o remote)
      suggestions.value = []
      return
    }

    if (resolved === 'insumo' || resolved === 'accesorio' || resolved === 'consumible' || resolved === 'refaccion') {
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
  const filterSuggestions = (list, searchText, fieldName = null) => {
    if (!searchText) return list
    const query = searchText.toLowerCase()
    return list.filter(item => {
      if (fieldName) {
        return item[fieldName] && String(item[fieldName]).toLowerCase().includes(query)
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
      ].some(val => String(val || '').toLowerCase().includes(query))
    })
  }

  const getFilteredEquipoMedicoSuggestions = (searchText, fieldName = null) => filterSuggestions(equipoMedicoList.value, searchText, fieldName)
  const getFilteredInsumosRefaccionesSuggestions = (searchText, fieldName = null) => filterSuggestions(insumosRefaccionesList.value, searchText, fieldName)

  const getDynamicSuggestions = (tipoSeleccionado, searchText, fieldName = null) => {
    if (!tipoSeleccionado) return []
    if (tipoSeleccionado === 'equipo' || tipoSeleccionado === 'equipo-medico' || tipoSeleccionado === 'mobiliario') {
      return getFilteredEquipoMedicoSuggestions(searchText, fieldName)
    }
    if (['accesorio', 'consumible', 'refaccion', 'insumo'].includes(tipoSeleccionado)) {
      return getFilteredInsumosRefaccionesSuggestions(searchText, fieldName)
    }
    return []
  }

  const fillUnitFromSuggestion = (unidad, suggestion) => {
    if (!suggestion || typeof unidad !== 'object') return unidad
    const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']
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
    const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']
    const disponibles = {}
    campos.forEach(campo => {
      const valor = suggestion[campo]
      disponibles[campo] = valor && String(valor).trim() !== '' && valor !== 'N/A'
    })
    return disponibles
  }

  // Búsqueda remota (debounced)
  const fetchSuggestions = async () => {
    const term = searchTerm.value?.trim()
    if (!term || term.length < 2) {
      suggestions.value = []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const resolvedTipo = resolveTipo()
      const params = new URLSearchParams({
        search: term,
        limit: '10',
        ...(resolvedTipo && resolvedTipo !== 'todos' ? { tipo: resolvedTipo } : {})
      }).toString()

      const response = await authedFetch(`/api/ops/inventory/search?${params}`)

      if (response.ok) {
        const data = await response.json()
        if (data?.success) {
          const normalizedQuery = String(term || '').trim().toLowerCase()
          const normalizeItem = (v) => String(v || '').trim().toLowerCase()
          suggestions.value = (data.data || []).map(item => ({
            ...item,
            exactMatch: ['lote', 'referencia', 'claveHRAEI', 'noInventario', 'n'].some(field => normalizeItem(item[field]) === normalizedQuery)
          })).sort((a, b) => {
            const aExact = a.exactMatch ? 1 : 0
            const bExact = b.exactMatch ? 1 : 0
            return bExact - aExact
          })
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
    if (searchTerm.value?.trim()?.length >= 2) fetchSuggestions()
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
