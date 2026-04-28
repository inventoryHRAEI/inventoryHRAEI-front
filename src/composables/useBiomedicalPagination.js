import { ref, computed } from 'vue'

/**
 * Composable para manejar paginación optimizada en servidor
 * Soporta paginación cliente y servidor con virtualización
 */
export function useBiomedicalPagination() {
    // Estado de paginación
    const currentPage = ref(1)
    const pageSize = ref(12)
    const maxVisiblePages = ref(7)

    // Funciones de navegación
    function firstPage() {
        currentPage.value = 1
    }

    function previousPage() {
        if (currentPage.value > 1) currentPage.value--
    }

    function nextPage(totalPages) {
        if (currentPage.value < totalPages) currentPage.value++
    }

    function lastPage(totalPages) {
        currentPage.value = totalPages
    }

    function goToPage(page) {
        if (page > 0) currentPage.value = page
    }

    function changePageSize(newSize) {
        pageSize.value = newSize
        currentPage.value = 1 // Reset to first page
    }

    /**
     * Calcula números de páginas visibles con ellipsis
     */
    function getVisiblePageNumbers(totalPages) {
        const max = maxVisiblePages.value
        const pages = []

        if (totalPages <= max) {
            // Mostrar todas las páginas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Lógica con ellipsis
            const leftSide = 2
            const rightSide = 2
            const middleSize = max - 2 * rightSide - 2

            // Primera página
            pages.push(1)

            // Ellipsis o números izquierda
            if (currentPage.value > leftSide + middleSize / 2) {
                pages.push('…')
            } else {
                for (let i = 2; i <= Math.min(leftSide + 1, totalPages - rightSide - 1); i++) {
                    pages.push(i)
                }
            }

            // Páginas alrededor de current
            const start = Math.max(2, currentPage.value - Math.floor(middleSize / 2))
            const end = Math.min(totalPages - 1, start + middleSize - 1)

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i) && pages[pages.length - 1] !== '…') {
                    pages.push(i)
                }
            }

            // Ellipsis o números derecha
            if (currentPage.value < totalPages - rightSide - middleSize / 2) {
                if (pages[pages.length - 1] !== '…') {
                    pages.push('…')
                }
            }

            // Última página
            if (!pages.includes(totalPages)) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    /**
     * Calcula el índice de inicio y fin para slice
     */
    function getPaginationRange(totalItems) {
        const start = (currentPage.value - 1) * pageSize.value
        const end = Math.min(start + pageSize.value, totalItems)
        return { start, end }
    }

    return {
        currentPage,
        pageSize,
        maxVisiblePages,
        firstPage,
        previousPage,
        nextPage,
        lastPage,
        goToPage,
        changePageSize,
        getVisiblePageNumbers,
        getPaginationRange,
    }
}
