import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'biomedical-filters'
const SIN_ESTADO_VALUE = '__SIN_ESTADO__'
const FIXED_FIELD_IDS = new Set(['equipoMedico', 'marca', 'unidadMedica', 'tipoMantenimiento', 'estatus', 'funcional', 'no', 'noRegistro'])
const FIXED_COLUMN_MAP = {
  equipoMedico: 'EQUIPO MEDICO',
  marca: 'MARCA',
  unidadMedica: 'UNIDAD MEDICA',
  tipoMantenimiento: 'TIPO DE MANTENIMIENTO',
  estatus: 'ESTATUS',
  funcional: 'FUNCIONAL SI NO',
  no: 'No',
  noRegistro: 'No DE INVENTARIO'
}

const initialFilters = {
  no: '',
  noRegistro: '',
  equipoMedico: '',
  marca: '',
  tipoMantenimiento: '',
  estatus: '',
  funcional: '',
  unidadMedica: ''
}

export function useBiomedicalFilters(metaFields) {
  const filters = ref({ ...initialFilters })
  const activeDynamicFilterIds = ref([])
  const dynamicFilterValues = ref({})
  let isRestoring = true

  const estatusOptions = computed(() => {
    const normalize = (v) => String(v ?? '').trim().replace(/\s+/g, ' ')
    const direct = getMetaField('estatus')
    const byColumn = (metaFields.value || []).find(f => {
      const col = getMetaFieldColumn(f?.id)
      return String(col || '').toUpperCase() === 'ESTATUS'
    })
    const byLabel = (metaFields.value || []).find(f => String(f?.label || '').toLowerCase().includes('estatus'))
    const field = direct || byColumn || byLabel
    const metaValues = Array.isArray(field?.distinctValues) ? field.distinctValues : []
    const set = new Map()
    for (const v of metaValues) {
      const n = normalize(v)
      if (!n) continue
      if (!set.has(n.toLowerCase())) set.set(n.toLowerCase(), n)
    }
    if (set.size === 0) {
      // fallback
    }
    if (filters.value.estatus && filters.value.estatus !== SIN_ESTADO_VALUE) {
      const n = normalize(filters.value.estatus)
      if (n && !set.has(n.toLowerCase())) set.set(n.toLowerCase(), n)
    }
    return Array.from(set.values()).sort((a, b) => String(a).localeCompare(String(b)))
  })

  const dynamicCatalog = computed(() => {
    const all = Array.isArray(metaFields.value) ? metaFields.value : []
    return all.filter(f => !f?.fixed)
  })

  const dynamicCatalogByCategory = computed(() => {
    const groups = new Map()
    for (const field of dynamicCatalog.value) {
      const category = field.category || 'Otros'
      if (!groups.has(category)) groups.set(category, [])
      groups.get(category).push(field)
    }
    return Array.from(groups.entries()).map(([category, fields]) => ({
      category,
      fields: fields.slice().sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')))
    }))
  })

  function getMetaField(id) {
    return (metaFields.value || []).find(f => f.id === id)
  }

  function getMetaFieldColumn(id) {
    const field = getMetaField(id)
    if (!field) return null
    if (field && field.id && FIXED_COLUMN_MAP[field.id]) return FIXED_COLUMN_MAP[field.id]
    if (field.column) return field.column
    if (field.columnName) return field.columnName
    if (field.dbColumn) return field.dbColumn
    if (field.property) return field.property
    if (field.key) return field.key
    if (field.id) return field.id
    return null
  }

  function getItemFieldValue(item, id) {
    const col = getMetaFieldColumn(id)
    if (!item) return null
    const candidates = []
    if (col) candidates.push(col)
    try {
      if (typeof col === 'string') {
        candidates.push(col.toUpperCase())
        candidates.push(col.replace(/_/g, ' ').toUpperCase())
        candidates.push(col.replace(/\s+/g, '_').toLowerCase())
        candidates.push(col.toLowerCase())
      }
    } catch (e) { }
    const field = getMetaField(id)
    if (field && field.label) {
      candidates.push(field.label)
      candidates.push(String(field.label).toUpperCase())
      candidates.push(String(field.label).replace(/\s+/g, '_').toLowerCase())
    }
    if (id) candidates.push(id)
    for (const c of candidates) {
      if (!c) continue
      if (Object.prototype.hasOwnProperty.call(item, c)) {
        return item[c]
      }
    }
    return null
  }

  function isFixedField(id) {
    return FIXED_FIELD_IDS.has(id)
  }

  function addDynamicFilter(id) {
    if (!id || isFixedField(id) || activeDynamicFilterIds.value.includes(id) || activeDynamicFilterIds.value.length >= 15) return
    activeDynamicFilterIds.value = [...activeDynamicFilterIds.value, id]
    if (!(id in dynamicFilterValues.value)) {
      dynamicFilterValues.value = { ...dynamicFilterValues.value, [id]: '' }
    }
  }

  function removeDynamicFilter(id) {
    activeDynamicFilterIds.value = activeDynamicFilterIds.value.filter(x => x !== id)
    const next = { ...dynamicFilterValues.value }
    delete next[id]
    dynamicFilterValues.value = next
  }

  function clearDynamicFilters() {
    activeDynamicFilterIds.value = []
    dynamicFilterValues.value = {}
  }

  function buildQueryParams() {
    const queryParams = new URLSearchParams()
    if (filters.value.no.trim()) queryParams.append('no', filters.value.no.trim())
    if ((filters.value.noRegistro || '').trim()) queryParams.append('no_registro', (filters.value.noRegistro || '').trim())
    if (filters.value.equipoMedico.trim()) queryParams.append('equipoMedico', filters.value.equipoMedico.trim())
    if (filters.value.marca.trim()) queryParams.append('marca', filters.value.marca.trim())
    if (filters.value.tipoMantenimiento) queryParams.append('tipoMantenimiento', filters.value.tipoMantenimiento)
    if (filters.value.estatus && filters.value.estatus !== SIN_ESTADO_VALUE) queryParams.append('estatus', filters.value.estatus)
    if (filters.value.funcional) queryParams.append('funcional', filters.value.funcional)
    if (filters.value.unidadMedica.trim()) queryParams.append('unidadMedica', filters.value.unidadMedica.trim())
    for (const id of activeDynamicFilterIds.value) {
      const value = String(dynamicFilterValues.value[id] || '').trim()
      if (!value) continue
      queryParams.append(`dyn_${id}`, value)
    }
    // Limitar resultados para optimizar transferencia en tunnel
    queryParams.append('limit', '1500')
    return queryParams
  }

  function persistFilters() {
    try {
      const payload = {
        fixed: { ...filters.value },
        dynamicIds: [...activeDynamicFilterIds.value],
        dynamicValues: { ...dynamicFilterValues.value }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('No se pudo persistir filtros:', e)
    }
  }

  function restoreFilters() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      const fixed = parsed && typeof parsed.fixed === 'object' ? parsed.fixed : {}
      filters.value = { ...initialFilters, ...fixed }
      const ids = Array.isArray(parsed?.dynamicIds) ? parsed.dynamicIds : []
      const unique = []
      for (const id of ids) {
        if (!id || typeof id !== 'string' || isFixedField(id) || unique.includes(id) || unique.length >= 15) continue
        unique.push(id)
      }
      activeDynamicFilterIds.value = unique
      const values = parsed && typeof parsed.dynamicValues === 'object' ? parsed.dynamicValues : {}
      const nextValues = {}
      for (const id of unique) {
        nextValues[id] = String(values[id] ?? '')
      }
      dynamicFilterValues.value = nextValues
    } catch (e) {
      console.warn('No se pudo restaurar filtros:', e)
    }
  }

  return {
    filters,
    activeDynamicFilterIds,
    dynamicFilterValues,
    estatusOptions,
    dynamicCatalog,
    dynamicCatalogByCategory,
    isRestoring: () => isRestoring,
    setRestoring: (v) => { isRestoring = v },
    getMetaField,
    getMetaFieldColumn,
    getItemFieldValue,
    isFixedField,
    addDynamicFilter,
    removeDynamicFilter,
    clearDynamicFilters,
    buildQueryParams,
    persistFilters,
    restoreFilters,
    SIN_ESTADO_VALUE
  }
}
