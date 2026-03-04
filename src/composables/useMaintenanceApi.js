import { ref } from 'vue'
import axios from 'axios'

// Punto base de la API de historial de mantenimientos.
// Se deja explícito el puerto backend porque así está montado el resto del sistema.
const API_BASE = 'http://localhost:3002/api/maintenance'

export function useMaintenanceApi() {
  const loading = ref(false)
  const error = ref(null)

  // API de bajo nivel usada también por otras vistas (si las hubiera)
  const getMaintenanceList = async (page = 1, pageSize = 25, search = '', filters = {}, sortBy = '', sortOrder = 'asc') => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_BASE}/list`, {
        params: {
          page,
          pageSize,
          search,
          filters: JSON.stringify(filters || {}),
          sortBy,
          sortOrder
        }
      })
      return response.data
    } catch (err) {
      error.value = err?.message || 'Error al obtener historial de mantenimientos'
      console.error('Error fetching maintenance list:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCount = async (search = '', filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/count`, {
        params: {
          search,
          filters: JSON.stringify(filters || {})
        }
      })
      return response.data.count
    } catch (err) {
      console.error('Error fetching count:', err)
      throw err
    }
  }

  const getFilterSuggestions = async (columnName, search = '') => {
    try {
      const response = await axios.get(`${API_BASE}/filters/${encodeURIComponent(columnName)}`, {
        params: { search }
      })
      return response.data.suggestions || []
    } catch (err) {
      console.error('Error fetching filter suggestions:', err)
      return []
    }
  }

  const getStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/statistics`)
      return response.data.statistics
    } catch (err) {
      console.error('Error fetching statistics:', err)
      throw err
    }
  }

  const exportData = async (search = '', filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/export`, {
        params: {
          search,
          filters: JSON.stringify(filters || {})
        },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'historial_mantenimientos.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting data:', err)
      throw err
    }
  }

  // API de alto nivel esperada por MaintainanceHistoryDataTable
  // Mapea la respuesta del backend al shape { records, pagination, columnStats }
  const fetchList = async ({ page, pageSize, search, filters, sortBy, sortOrder }) => {
    const raw = await getMaintenanceList(page, pageSize, search, filters, sortBy, sortOrder)
    const data = raw?.data || []
    const pagination = raw?.pagination || {}
    const total = pagination.total ?? 0

    return {
      records: data,
      pagination: {
        ...pagination,
        totalRecords: total
      },
      // En esta versión inicial no devolvemos estadísticas por columna;
      // se podrían poblar con /statistics si se necesita.
      columnStats: null
    }
  }

  const downloadExport = async (format = 'csv', filters = {}, _includeAllColumns = true) => {
    // Por ahora solo se soporta CSV; se ignora "format" si no es csv.
    await exportData('', filters)
  }

  return {
    loading,
    error,
    getMaintenanceList,
    getCount,
    getFilterSuggestions,
    getStatistics,
    exportData,
    // API usada por el DataTable avanzado
    fetchList,
    downloadExport
  }
}
