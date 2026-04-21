import { ref, computed } from 'vue'

export function useMaintenanceSort() {
  const sortField = ref('')
  const sortOrder = ref('asc') // 'asc' or 'desc'

  const sortBy = computed(() => sortField.value)

  const toggleSort = (field) => {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'asc'
    }
  }

  const setSortField = (field) => {
    sortField.value = field
    sortOrder.value = 'asc'
  }

  const setSortOrder = (order) => {
    sortOrder.value = order
  }

  return {
    sortField,
    sortOrder,
    sortBy,
    toggleSort,
    setSortField,
    setSortOrder
  }
}
