/**
 * updateItemService.js
 * 
 * Servicio para obtener y actualizar información completa de equipos.
 * 
 * Requisitos funcionales:
 * ✓ Fetchea TODOS los datos reales del equipo (nunca mock)
 * ✓ Maneja campos estáticos y dinámicos correctamente
 * ✓ Muestra toda la información disponible, incluso la oculta por filtros
 * ✓ Permite editar absolutamente todos los campos
 * ✓ Mantiene consistencia entre datos almacenados y editables
 */

import { getStoredToken } from '@/utils/auth.js'

/**
 * Obtiene los datos completos de un equipo desde el backend
 * @param {string} itemId - Inventario No o Código del equipo
 * @returns {Promise<Object>} Todos los datos del equipo
 * @throws {Error} Si no se puede obtener el equipo
 */
export async function getItemDetails(itemId) {
  if (!itemId) {
    throw new Error('Item ID is required')
  }

  const token = getStoredToken()
  const baseUrl = window.location.origin
  
  try {
    const response = await fetch(`${baseUrl}/api/ops/items/${encodeURIComponent(itemId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.ok) {
      throw new Error(result.msg || 'Unknown error fetching item')
    }

    // El backend retorna { ok: true, data: {...} }
    return result.data || result.item || {}
  } catch (error) {
    console.error('[updateItemService.getItemDetails] Error:', error)
    throw error
  }
}

/**
 * Actualiza la información de un equipo
 * @param {string} itemId - Inventario No o Código del equipo
 * @param {Object} updateData - Datos a actualizar
 * @param {Array<File>} newImages - Nuevas imágenes a subir (opcional)
 * @param {Array<string>} imageCaptions - Pies de imagen para cada imagen (opcional)
 * @returns {Promise<Object>} Respuesta del servidor
 * @throws {Error} Si la actualización falla
 */
export async function updateItem(itemId, updateData, newImages = [], imageCaptions = []) {
  if (!itemId) {
    throw new Error('Item ID is required')
  }

  const token = getStoredToken()
  const baseUrl = window.location.origin
  
  try {
    // Preparar FormData para manejar archivos
    const formData = new FormData()
    
    // Agregar datos de actualización como JSON
    formData.append('data', JSON.stringify(updateData))
    
    // Agregar nuevas imágenes con sus pies de imagen
    if (Array.isArray(newImages) && newImages.length > 0) {
      newImages.forEach((file, index) => {
        formData.append('images_new', file)
        // Agregar caption si existe
        const caption = imageCaptions[index] || ''
        formData.append(`images_caption_${index}`, caption)
      })
      
      // Agregar array de captions como JSON para facilitar procesamiento en backend
      formData.append('images_captions', JSON.stringify(imageCaptions.slice(0, newImages.length)))
    }

    const response = await fetch(`${baseUrl}/api/ops/items/${encodeURIComponent(itemId)}/update`, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // NO establecer Content-Type aquí - dejar que el navegador lo maneje con FormData
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to update item: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.ok) {
      throw new Error(result.msg || 'Unknown error updating item')
    }

    return result
  } catch (error) {
    console.error('[updateItemService.updateItem] Error:', error)
    throw error
  }
}

/**
 * Obtiene el catálogo dinámico de campos disponibles
 * Útil para saber qué campos están disponibles en la base de datos
 * @returns {Promise<Array>} Array de campos disponibles con metadata
 */
export async function getDynamicFieldsCatalog() {
  const token = getStoredToken()
  const baseUrl = window.location.origin
  
  try {
    const response = await fetch(`${baseUrl}/api/ops/meta`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.status}`)
    }

    const result = await response.json()
    return result.fields || result.data || []
  } catch (error) {
    console.error('[updateItemService.getDynamicFieldsCatalog] Error:', error)
    return []
  }
}

/**
 * Valida que los datos del formulario sean válidos antes de guardar
 * @param {Object} formData - Datos a validar
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateFormData(formData) {
  const errors = []

  // Validaciones básicas
  if (formData.NUMERO_DE_SERIE && formData.NUMERO_DE_SERIE.length > 100) {
    errors.push('Serial number too long (max 100 characters)')
  }

  if (formData.EQUIPO_MEDICO && formData.EQUIPO_MEDICO.length > 200) {
    errors.push('Equipment name too long (max 200 characters)')
  }

  if (formData.MODELO && formData.MODELO.length > 100) {
    errors.push('Model too long (max 100 characters)')
  }

  if (formData.MARCA && formData.MARCA.length > 100) {
    errors.push('Brand too long (max 100 characters)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
