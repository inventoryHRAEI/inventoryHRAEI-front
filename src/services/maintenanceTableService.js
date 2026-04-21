/**
 * Servicio para consumir API de historial de mantenimientos
 * Maneja todas las llamadas al backend
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_ENDPOINT = '/api/v1/maintenance-history'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token si existe
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

/**
 * Obtiene historial de mantenimientos con paginación y filtros
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function fetchMaintenanceHistory(options = {}) {
  const {
    page = 1,
    limit = 25,
    search = '',
    sortBy = '',
    sortOrder = 'DESC',
    filters = {}
  } = options

  try {
    const response = await axiosInstance.get(API_ENDPOINT, {
      params: {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        filters: JSON.stringify(filters)
      }
    })

    return response.data
  } catch (error) {
    console.error('Error fetching maintenance history:', error)
    throw error
  }
}

/**
 * Realiza búsqueda avanzada
 * @param {Object} searchData
 * @returns {Promise<Object>}
 */
export async function advancedSearchMaintenance(searchData) {
  try {
    const response = await axiosInstance.post(
      `${API_ENDPOINT}/advanced-search`,
      searchData
    )
    return response.data
  } catch (error) {
    console.error('Error in advanced search:', error)
    throw error
  }
}

/**
 * Obtiene valores únicos de una columna para autocompletado
 * @param {string} column
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export async function fetchColumnSuggestions(column, limit = 50) {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINT}/column-values/${column}`,
      {
        params: { limit }
      }
    )
    return response.data.values || []
  } catch (error) {
    console.error(`Error fetching suggestions for column ${column}:`, error)
    return []
  }
}

/**
 * Exporta datos a CSV
 * @param {Object} filterOptions
 * @returns {Promise<Blob>}
 */
export async function exportMaintenanceCSV(filterOptions = {}) {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}/export`, {
      params: {
        search: filterOptions.search || '',
        filters: JSON.stringify(filterOptions.filters || {})
      },
      responseType: 'blob'
    })

    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `mantenimientos_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return blob
  } catch (error) {
    console.error('Error exporting CSV:', error)
    throw error
  }
}

/**
 * Exporta datos a Excel usando exceljs
 * @param {Object} data - Datos para exportar
 * @param {Array} columns - Configuración de columnas
 * @returns {Promise<void>}
 */
export async function exportMaintenanceExcel(data, columns) {
  try {
    const { Workbook } = await import('exceljs')
    
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Mantenimientos')

    // Agregar encabezados
    const headerRow = worksheet.addRow(columns.map(col => col.header))
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Blue-900
    }

    // Agregar datos
    data.forEach(row => {
      const values = columns.map(col => row[col.id] || '-')
      worksheet.addRow(values)
    })

    // Auto ajustar ancho de columnas
    worksheet.columns.forEach(column => {
      let maxLength = 0
      column.eachCell?.({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, String(cell.value || '').length)
      })
      column.width = Math.min(maxLength + 2, 50)
    })

    // Descargar
    await workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `mantenimientos_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  } catch (error) {
    console.error('Error exporting Excel:', error)
    throw error
  }
}

/**
 * Obtiene resumen/estadísticas
 * @returns {Promise<Object>}
 */
export async function fetchMaintenanceSummary() {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}/summary`)
    return response.data.summary
  } catch (error) {
    console.error('Error fetching maintenance summary:', error)
    throw error
  }
}

/**
 * Crea instancia de axios personalizada para llamadas específicas
 */
export function createMaintenanceAPI() {
  return {
    getHistory: fetchMaintenanceHistory,
    search: advancedSearchMaintenance,
    getColumnSuggestions: fetchColumnSuggestions,
    exportCSV: exportMaintenanceCSV,
    exportExcel: exportMaintenanceExcel,
    getSummary: fetchMaintenanceSummary,

    /**
     * Utilidad para construir params de query
     */
    buildQueryParams(options) {
      return {
        page: options.page || 1,
        limit: options.limit || 25,
        search: options.search || '',
        sortBy: options.sortBy || '',
        sortOrder: options.sortOrder || 'DESC',
        filters: options.filters || {}
      }
    },

    /**
     * Crea un objeto de cancelación para requests en progreso
     */
    createCancelToken() {
      return axios.CancelToken.source()
    }
  }
}

export default createMaintenanceAPI()
