import { ref, computed } from 'vue'

/**
 * useOrderFilters - Composable reutilizable para gestión de filtros de órdenes
 * Centraliza la lógica de filtrados, persistencia y validación
 */
export function useOrderFilters() {
  // Filtros principales
  const filterFolio = ref('')
  const filterSolicitante = ref('')
  const filterDate = ref('')
  const filterDateDisplay = ref('')

  // Filtros secundarios (activables)
  const activeFilters = ref(new Set())
  const filterValues = ref({})

  // Definición de filtros disponibles
  const availableFilters = [
    {
      key: 'service',
      label: 'Servicio',
      type: 'text',
      placeholder: 'Ej. Urgencias...',
      default: ''
    },
    {
      key: 'especialidad',
      label: 'Especialidad',
      type: 'text',
      placeholder: 'Ej. Traumatología...',
      default: ''
    },
    {
      key: 'motivo',
      label: 'Motivo de entrada',
      type: 'select',
      placeholder: '(Seleccionar)',
      options: [],
      default: ''
    },
    {
      key: 'obs',
      label: 'Observaciones',
      type: 'text',
      placeholder: 'Buscar en observaciones',
      default: ''
    },
    {
      key: 'ing',
      label: 'Ingeniero residente',
      type: 'text',
      placeholder: 'Buscar nombre',
      default: ''
    },
    {
      key: 'tipo',
      label: 'Tipo de artículo',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Equipo Médico', value: 'equipo-medico' },
        { label: 'Mobiliario', value: 'mobiliario' },
        { label: 'Accesorio', value: 'accesorio' },
        { label: 'Consumible', value: 'consumible' },
        { label: 'Refacción', value: 'refaccion' }
      ],
      default: ''
    },
    {
      key: 'itemText',
      label: 'Nombre de equipo',
      type: 'text',
      placeholder: 'Nombre, modelo, serie...',
      default: ''
    },
    {
      key: 'accesorio',
      label: 'Accesorios',
      type: 'text',
      placeholder: 'Nombre de accesorio...',
      default: ''
    },
    {
      key: 'hora',
      label: 'Rango de horas',
      type: 'time-range',
      default: { from: '', to: '' }
    },
    {
      key: 'marca',
      label: 'Marca',
      type: 'text',
      placeholder: 'Ej. Philips, GE...',
      default: ''
    },
    {
      key: 'modelo',
      label: 'Modelo',
      type: 'text',
      placeholder: 'Ej. MX40...',
      default: ''
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      type: 'text',
      placeholder: 'Ej. UCIA...',
      default: ''
    },
    {
      key: 'claveHRAEI',
      label: 'Clave HRAEI',
      type: 'text',
      placeholder: 'Ej. COMODATO...',
      default: ''
    },
    {
      key: 'cantidadMin',
      label: 'Cantidad mínima',
      type: 'number',
      placeholder: 'Mínimo...',
      min: 0,
      default: null
    },
    {
      key: 'cantidadMax',
      label: 'Cantidad máxima',
      type: 'number',
      placeholder: 'Máximo...',
      min: 0,
      default: null
    }
  ]

  /**
   * Añade un filtro a la lista activa
   */
  function addFilter(filterKey) {
    if (activeFilters.value.has(filterKey)) return

    const filterDef = availableFilters.find(f => f.key === filterKey)
    if (!filterDef) return

    activeFilters.value.add(filterKey)
    if (!(filterKey in filterValues.value)) {
      filterValues.value[filterKey] = filterDef.default
    }
  }

  /**
   * Remueve un filtro de la lista activa
   */
  function removeFilter(filterKey) {
    activeFilters.value.delete(filterKey)
    delete filterValues.value[filterKey]
  }

  /**
   * Limpia todos los filtros
   */
  function clearAllFilters() {
    filterFolio.value = ''
    filterSolicitante.value = ''
    filterDate.value = ''
    filterDateDisplay.value = ''
    activeFilters.value.clear()
    filterValues.value = {}
  }

  /**
   * Obtiene la lista de filtros activos con su definición completa
   */
  const activeFiltersList = computed(() => {
    return Array.from(activeFilters.value)
      .map(key => {
        const def = availableFilters.find(f => f.key === key)
        return def ? { ...def, value: filterValues.value[key] } : null
      })
      .filter(Boolean)
  })

  /**
   * Calcula si hay filtros activos
   */
  const hasActiveFilters = computed(() => {
    return (
      filterFolio.value ||
      filterSolicitante.value ||
      filterDate.value ||
      activeFilters.value.size > 0
    )
  })

  /**
   * Obtiene la cantidad de filtros activos
   */
  const activeFilterCount = computed(() => activeFilters.value.size)

  /**
   * Persiste filtros en localStorage
   */
  function persistFilters(storageKey = 'order-filters') {
    try {
      const payload = {
        main: {
          folio: filterFolio.value,
          solicitante: filterSolicitante.value,
          date: filterDate.value,
          dateDisplay: filterDateDisplay.value
        },
        active: Array.from(activeFilters.value),
        values: { ...filterValues.value }
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch (e) {
      console.warn('No se pudo persistir filtros:', e)
    }
  }

  /**
   * Restaura filtros desde localStorage
   */
  function restoreFilters(storageKey = 'order-filters') {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return false

      const payload = JSON.parse(raw)
      if (!payload) return false

      // Restaurar filtros principales
      const main = payload.main || {}
      filterFolio.value = main.folio || ''
      filterSolicitante.value = main.solicitante || ''
      filterDate.value = main.date || ''
      filterDateDisplay.value = main.dateDisplay || ''

      // Restaurar filtros activos
      const active = Array.isArray(payload.active) ? payload.active : []
      activeFilters.value = new Set(active.filter(k => availableFilters.some(f => f.key === k)))

      // Restaurar valores
      const values = payload.values || {}
      for (const [key, value] of Object.entries(values)) {
        if (activeFilters.value.has(key)) {
          filterValues.value[key] = value
        }
      }

      return true
    } catch (e) {
      console.warn('No se pudo restaurar filtros:', e)
      return false
    }
  }

  return {
    // Refs principales
    filterFolio,
    filterSolicitante,
    filterDate,
    filterDateDisplay,
    filterValues,
    activeFilters,

    // Computados
    activeFiltersList,
    hasActiveFilters,
    activeFilterCount,
    availableFilters: computed(() => availableFilters),

    // Métodos
    addFilter,
    removeFilter,
    clearAllFilters,
    persistFilters,
    restoreFilters
  }
}
