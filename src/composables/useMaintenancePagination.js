import { ref, computed } from 'vue'

// Opciones de tamaño de página estándar para el DataTable de historial
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250]

export function useMaintenancePagination(initialPageSize = 25) {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const totalRecords = ref(0)

  const totalPages = computed(() => {
    return totalRecords.value === 0
      ? 1
      : Math.max(1, Math.ceil(totalRecords.value / pageSize.value))
  })

  const pageRange = computed(() => {
    if (totalRecords.value === 0) {
      return { start: 0, end: 0, total: 0 }
    }
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, totalRecords.value)
    return { start, end, total: totalRecords.value }
  })

  const rangeLabel = computed(() => {
    const { start, end, total } = pageRange.value
    return `${start} - ${end} de ${total}`
  })

  const hasPreviousPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages.value))
    currentPage.value = p
  }

  const setPageSize = (size) => {
    pageSize.value = size
    currentPage.value = 1 // Reset a primera página
  }

  const setTotalRecords = (total) => {
    totalRecords.value = Number.isFinite(total) ? total : 0
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }

  const firstPage = () => {
    currentPage.value = 1
  }

  const reset = () => {
    currentPage.value = 1
    totalRecords.value = 0
  }

  return {
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    pageRange,
    rangeLabel,
    hasPreviousPage,
    hasNextPage,
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    setTotalRecords,
    firstPage,
    reset,
    PAGE_SIZE_OPTIONS
  }
}
