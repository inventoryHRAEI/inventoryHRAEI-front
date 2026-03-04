import { ref, computed } from 'vue'

export function useMaintenanceFilters() {
  const activeFilters = ref({})
  const globalSearch = ref('')
  const columnStats = ref(null)

  const hasActiveFilters = computed(() => {
    return Object.keys(activeFilters.value).some(key => 
      activeFilters.value[key] && activeFilters.value[key].length > 0
    ) || globalSearch.value.trim() !== ''
  })

  const filterChips = computed(() => {
    const chips = []
    
    if (globalSearch.value.trim()) {
      chips.push({
        id: 'search',
        label: `Búsqueda: "${globalSearch.value}"`,
        removable: true
      })
    }

    Object.entries(activeFilters.value).forEach(([column, values]) => {
      if (values && values.length > 0) {
        values.forEach(value => {
          chips.push({
            id: `${column}:${value}`,
            label: `${column}: ${value}`,
            removable: true,
            column,
            value
          })
        })
      }
    })

    return chips
  })

  const setFilter = (column, values) => {
    if (!values || values.length === 0) {
      delete activeFilters.value[column]
    } else {
      activeFilters.value[column] = values
    }
  }

  const removeFilter = (chipId) => {
    if (chipId === 'search') {
      globalSearch.value = ''
    } else {
      const [column, value] = chipId.split(':')
      if (activeFilters.value[column]) {
        activeFilters.value[column] = activeFilters.value[column].filter(v => v !== value)
        if (activeFilters.value[column].length === 0) {
          delete activeFilters.value[column]
        }
      }
    }
  }

  const clearAllFilters = () => {
    activeFilters.value = {}
    globalSearch.value = ''
  }

  const setColumnStats = (stats) => {
    columnStats.value = stats || null
  }

  return {
    activeFilters,
    globalSearch,
    hasActiveFilters,
    filterChips,
    setFilter,
    removeFilter,
    clearAllFilters,
    columnStats,
    setColumnStats
  }
}
