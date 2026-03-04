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
  no: 'No DE INVENTARIO',
  noRegistro: 'No'
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

  const dynamicCatalog = ref([])

  function findDynamicCatalogEntry(id) {
    if (!id) return null
    const current = dynamicCatalog.value || []
    return current.find(f => f.id === id)
      || current.find(f => f.originalId === id)
      || null
  }

  function normalizeCandidate(value) {
    if (!value) return ''
    return String(value).trim()
  }

  function formatLabelCandidate(value) {
    if (value === null || value === undefined) return ''
    const raw = String(value).replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
    if (!raw) return ''
    const isAllUpper = /^[A-Z0-9\s-]+$/.test(raw) && raw === raw.toUpperCase()
    if (isAllUpper) return raw
    return raw
      .split(' ')
      .map(part => {
        if (!part) return part
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      })
      .join(' ')
  }

  function deriveFieldLabel(field, fallbackId) {
    const direct = typeof field?.label === 'string' ? field.label.trim() : ''
    if (direct) return direct
    const candidates = [
      field?.displayName,
      field?.name,
      field?.columnLabel,
      field?.columnName,
      field?.column,
      field?.dbColumn,
      field?.property,
      field?.key
    ]
    for (const candidate of candidates) {
      const formatted = formatLabelCandidate(candidate)
      if (formatted) return formatted
    }
    return formatLabelCandidate(fallbackId)
  }

  function buildSlug(field, fallbackIndex) {
    const base = normalizeCandidate(
      field.id ||
      field.column ||
      field.columnName ||
      field.dbColumn ||
      field.property ||
      field.key ||
      field.label ||
      `field_${fallbackIndex}`
    )
    return base.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || `field_${fallbackIndex}`
  }

  watch(metaFields, (newMeta) => {
    if (!Array.isArray(newMeta) || newMeta.length === 0) {
      dynamicCatalog.value = []
      return
    }

    const candidates = newMeta.filter(f => !f?.fixed)
    const seen = new Set()
    const slugCounts = new Map()

    const catalog = candidates.map((field, index) => {
      const originalId = typeof field?.id === 'string' ? field.id : null
      let candidateId = normalizeCandidate(field.id)
      if (candidateId && !seen.has(candidateId)) {
        seen.add(candidateId)
        const label = deriveFieldLabel(field, candidateId)
        return { ...field, id: candidateId, originalId: originalId || candidateId, label }
      }

      const baseSlug = buildSlug(field, index)
      const currentCount = slugCounts.get(baseSlug) || 0
      let nextCount = currentCount + 1
      let uniqueId = `${baseSlug}_${nextCount}`
      while (seen.has(uniqueId)) {
        nextCount += 1
        uniqueId = `${baseSlug}_${nextCount}`
      }
      slugCounts.set(baseSlug, nextCount)
      seen.add(uniqueId)
      const label = deriveFieldLabel(field, uniqueId)
      return { ...field, id: uniqueId, originalId: originalId || uniqueId, label }
    })

    dynamicCatalog.value = catalog

    const availableIds = new Set(catalog.map(f => f.id))
    activeDynamicFilterIds.value = activeDynamicFilterIds.value.filter(id => availableIds.has(id))
  }, { immediate: true, deep: true })

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
    if (!id) return null
    const catalogEntry = findDynamicCatalogEntry(id)
    if (catalogEntry) return catalogEntry
    const metaEntry = (metaFields.value || []).find(f => f.id === id)
    if (metaEntry) return metaEntry
    if (catalogEntry && catalogEntry.originalId && catalogEntry.originalId !== id) {
      const original = (metaFields.value || []).find(f => f.id === catalogEntry.originalId)
      if (original) return original
    }
    return null
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
    // ⭐ ARREGLO: id es el nombre exacto de la columna (post-backend-fix)
    if (!item || !id) return null
    
    // Búsqueda directa primero
    if (Object.prototype.hasOwnProperty.call(item, id)) {
      const value = item[id]
      if (typeof window !== 'undefined' && window.__FIELD_VALUE_DEBUG__?.logOnce) {
        console.log(`[getItemFieldValue] id=${id}, DIRECT match, value=`, value)
      }
      return value
    }
    
    // Fallback: algunos drivers o browsers pueden tener variaciones case/encoding
    const lower = String(id).toLowerCase()
    const upper = String(id).toUpperCase()
    
    for (const key of Object.keys(item)) {
      if (key === id) {
        const value = item[key]
        if (typeof window !== 'undefined' && window.__FIELD_VALUE_DEBUG__?.logOnce) {
          console.log(`[getItemFieldValue] id=${id}, found via exact match, value=`, value)
        }
        return value
      }
      if (key.toLowerCase() === lower || key.toUpperCase() === upper) {
        const value = item[key]
        if (typeof window !== 'undefined' && window.__FIELD_VALUE_DEBUG__?.logOnce) {
          console.log(`[getItemFieldValue] id=${id}, found via case-insensitive (key=${key}), value=`, value)
        }
        return value
      }
    }
    
    // Log si no está
    if (typeof window !== 'undefined' && window.__FIELD_VALUE_DEBUG__?.logNotFound) {
      console.warn(`[getItemFieldValue] id=${id} NOT FOUND in item. Item keys (first 10):`, Object.keys(item).slice(0, 10))
    }
    return null
  }

  function isFixedField(id) {
    return FIXED_FIELD_IDS.has(id)
  }

  function addDynamicFilter(id) {
    if (!id || isFixedField(id) || activeDynamicFilterIds.value.includes(id) || activeDynamicFilterIds.value.length >= 15) {
      console.warn(`[addDynamicFilter] No se pudo añadir el filtro con ID: ${id}`);
      return;
    }
    console.log(`[addDynamicFilter] Añadiendo filtro con ID: ${id}`);
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

  function getDynamicFieldOriginalId(id) {
    const entry = findDynamicCatalogEntry(id)
    if (entry && entry.originalId) return entry.originalId
    return id
  }

  function resolveDynamicFieldLabel(id) {
    if (!id) return ''
    try {
      const entry = findDynamicCatalogEntry(id)
      if (entry && typeof entry.label === 'string' && entry.label.trim()) {
        return entry.label.trim()
      }
      const originalId = entry && entry.originalId ? entry.originalId : id
      const metaField = (metaFields.value || []).find(f => f.id === originalId)
      if (metaField && typeof metaField.label === 'string' && metaField.label.trim()) {
        return metaField.label.trim()
      }
      const fallbackCandidate = entry && entry.column ? entry.column : originalId
      return formatLabelCandidate(fallbackCandidate) || String(originalId)
    } catch (e) {
      return formatLabelCandidate(id) || String(id)
    }
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
    // ⭐ ARREGLO: IDs dinámicos YA SON nombres exactos de columna
    const includeColumns = new Set()

    for (const id of activeDynamicFilterIds.value) {
      // id es el nombre exacto de la columna (ej: 'OBSERVACIONES', 'ACCESORIOS')
      // Lo usamos directamente como columna en SELECT
      if (id) {
        includeColumns.add(String(id))
      }

      const rawValue = dynamicFilterValues.value[id]
      const value = String(rawValue ?? '').trim()
      if (!value) continue
      // Para filtros dinámicos, usar el nombre de columna exacto
      queryParams.append(`dyn_${id}`, value)
    }

    try {
      if (includeColumns.size > 0) {
        // Codificar espacios para URL-safe (AREA EN LA QUE SE ENTREGO → AREA%20EN%20LA%20QUE%20SE%20ENTREGO)
        const encoded = Array.from(includeColumns)
          .map(col => encodeURIComponent(String(col)))
          .join(',')
        queryParams.append('include', encoded)
        // Debug log
        if (typeof window !== 'undefined' && window.__FIELD_VALUE_DEBUG__?.logInclude) {
          console.log(`[buildQueryParams] include param built: "${encoded}" (${includeColumns.size} columns)`)
          console.log(`  activeDynamicFilterIds: `, Array.from(activeDynamicFilterIds.value || []))
          console.log(`  columns: `, Array.from(includeColumns))
        }
      }
    } catch (e) {
      console.error('[buildQueryParams] Error building include:', e)
    }

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
    getDynamicFieldOriginalId,
    resolveDynamicFieldLabel,
    buildQueryParams,
    persistFilters,
    restoreFilters,
    SIN_ESTADO_VALUE
  }
}
