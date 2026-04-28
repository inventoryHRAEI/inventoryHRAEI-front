import { computed } from 'vue'

/**
 * Composable para validar items en órdenes y generar warnings
 * Verifica:
 * - Equipos en mantenimiento preventivo/correctivo
 * - Equipos con estado no funcional
 * - Insumos/Refacciones caducados o próximos a caducar
 */

export function useOrderItemValidation() {
  /**
   * Obtiene los warnings para un item específico
   * @param {Object} item - Item de la orden (equipo, insumo, refacción)
   * @param {Object} inventoryData - Datos del inventario para validaciones
   * @returns {Array} Array de warnings con estructura {type, message, severity}
   */
  const getItemWarnings = (item, inventoryData = {}) => {
    const warnings = []
    
    if (!item) return warnings

    // Validación según el tipo de item
    switch (item.tipo) {
      case 'equipo-medico':
      case 'mobiliario':
        warnings.push(...validateEquipmentWarnings(item, inventoryData))
        break
      case 'consumible':
        warnings.push(...validateConsumableWarnings(item, inventoryData))
        break
      case 'refaccion':
      case 'accesorio':
        warnings.push(...validateSparePartWarnings(item, inventoryData))
        break
    }

    return warnings
  }

  /**
   * Validaciones para equipos médicos/mobiliario
   */
  const validateEquipmentWarnings = (item, inventoryData) => {
    const warnings = []
    const equipmentId = item.claveHRAEI

    if (!equipmentId) return warnings

    // Buscar el equipo en los datos del inventario
    const equipment = inventoryData[equipmentId]
    if (!equipment) return warnings

    // Validar estado funcional
    if (equipment.funcional === false || equipment.funcional === 0) {
      warnings.push({
        type: 'equipment_not_functional',
        message: `⚠️ Equipo "${item.descripcion}" está en estado NO FUNCIONAL`,
        severity: 'high'
      })
    }

    // Validar mantenimiento preventivo
    if (equipment.mantenimiento === 'preventivo') {
      warnings.push({
        type: 'equipment_preventive_maintenance',
        message: `⚠️ Equipo "${item.descripcion}" está en MANTENIMIENTO PREVENTIVO`,
        severity: 'medium'
      })
    }

    // Validar mantenimiento correctivo
    if (equipment.mantenimiento === 'correctivo') {
      warnings.push({
        type: 'equipment_corrective_maintenance',
        message: `⚠️ Equipo "${item.descripcion}" está en MANTENIMIENTO CORRECTIVO`,
        severity: 'high'
      })
    }

    // Validar próxima fecha de mantenimiento
    if (equipment.proximo_mant) {
      const proximaFecha = new Date(equipment.proximo_mant)
      const hoy = new Date()
      const diasDiferencia = Math.ceil((proximaFecha - hoy) / (1000 * 60 * 60 * 24))

      if (diasDiferencia < 0) {
        warnings.push({
          type: 'maintenance_overdue',
          message: `⚠️ Equipo "${item.descripcion}" tiene mantenimiento VENCIDO (${Math.abs(diasDiferencia)} días)`,
          severity: 'high'
        })
      } else if (diasDiferencia <= 7) {
        warnings.push({
          type: 'maintenance_upcoming',
          message: `⚠️ Equipo "${item.descripcion}" requiere mantenimiento en ${diasDiferencia} días`,
          severity: 'medium'
        })
      }
    }

    return warnings
  }

  /**
   * Validaciones para insumos consumibles
   */
  const validateConsumableWarnings = (item, inventoryData) => {
    const warnings = []

    // Validar lote/fecha de vencimiento
    if (item.lote) {
      const expiryDate = parseExpireDateFromLote(item.lote)
      if (expiryDate) {
        const hoy = new Date()
        const diasFaltantes = Math.ceil((expiryDate - hoy) / (1000 * 60 * 60 * 24))

        if (diasFaltantes < 0) {
          warnings.push({
            type: 'consumable_expired',
            message: `⚠️ Insumo "${item.descripcion}" está CADUCADO desde hace ${Math.abs(diasFaltantes)} días`,
            severity: 'high'
          })
        } else if (diasFaltantes === 0) {
          warnings.push({
            type: 'consumable_expires_today',
            message: `⚠️ Insumo "${item.descripcion}" CADUCA HOY`,
            severity: 'high'
          })
        } else if (diasFaltantes <= 30) {
          warnings.push({
            type: 'consumable_expires_soon',
            message: `⚠️ Insumo "${item.descripcion}" caduca en ${diasFaltantes} días`,
            severity: 'medium'
          })
        }
      }
    }

    // Validar si hay campo de fecha de vencimiento específico
    if (item.fechaVencimiento) {
      validateExpiryDate(item.fechaVencimiento, item.descripcion, 'consumable', warnings)
    }

    return warnings
  }

  /**
   * Validaciones para refacciones y accesorios
   */
  const validateSparePartWarnings = (item, inventoryData) => {
    const warnings = []

    // Validar lote/fecha de vencimiento
    if (item.lote) {
      const expiryDate = parseExpireDateFromLote(item.lote)
      if (expiryDate) {
        const hoy = new Date()
        const diasFaltantes = Math.ceil((expiryDate - hoy) / (1000 * 60 * 60 * 24))

        if (diasFaltantes < 0) {
          warnings.push({
            type: 'spare_part_expired',
            message: `⚠️ Refacción "${item.descripcion}" está CADUCADA desde hace ${Math.abs(diasFaltantes)} días`,
            severity: 'high'
          })
        } else if (diasFaltantes === 0) {
          warnings.push({
            type: 'spare_part_expires_today',
            message: `⚠️ Refacción "${item.descripcion}" CADUCA HOY`,
            severity: 'high'
          })
        } else if (diasFaltantes <= 30) {
          warnings.push({
            type: 'spare_part_expires_soon',
            message: `⚠️ Refacción "${item.descripcion}" caduca en ${diasFaltantes} días`,
            severity: 'medium'
          })
        }
      }
    }

    // Validar si hay campo de fecha de vencimiento específico
    if (item.fechaVencimiento) {
      validateExpiryDate(item.fechaVencimiento, item.descripcion, 'spare_part', warnings)
    }

    return warnings
  }

  /**
   * Valida una fecha de vencimiento y agrega warning si es necesario
   */
  const validateExpiryDate = (dateString, itemName, itemType, warningsArray) => {
    if (!dateString) return

    try {
      const expiryDate = new Date(dateString)
      const hoy = new Date()
      const diasFaltantes = Math.ceil((expiryDate - hoy) / (1000 * 60 * 60 * 24))

      const type = itemType === 'consumable' ? 'consumable' : 'spare_part'
      const typeLabel = itemType === 'consumable' ? 'Insumo' : 'Refacción'

      if (diasFaltantes < 0) {
        warningsArray.push({
          type: `${type}_expired`,
          message: `⚠️ ${typeLabel} "${itemName}" está CADUCADO desde hace ${Math.abs(diasFaltantes)} días`,
          severity: 'high'
        })
      } else if (diasFaltantes === 0) {
        warningsArray.push({
          type: `${type}_expires_today`,
          message: `⚠️ ${typeLabel} "${itemName}" CADUCA HOY`,
          severity: 'high'
        })
      } else if (diasFaltantes <= 30) {
        warningsArray.push({
          type: `${type}_expires_soon`,
          message: `⚠️ ${typeLabel} "${itemName}" caduca en ${diasFaltantes} días`,
          severity: 'medium'
        })
      }
    } catch (e) {
      // Ignorar si la fecha no es válida
    }
  }

  /**
   * Intenta parsear una fecha de vencimiento desde un string de lote
   * Soporta formatos como: "20250315", "2025-03-15", "15/03/2025"
   * @param {string} lote - String que contiene la fecha
   * @returns {Date|null} - Fecha parseada o null
   */
  const parseExpireDateFromLote = (lote) => {
    if (!lote || typeof lote !== 'string') return null

    // Intenta formato YYYYMMDD (20250315)
    const dateMatch = lote.match(/(\d{4})(\d{2})(\d{2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      return new Date(`${year}-${month}-${day}`)
    }

    // Intenta formato DD/MM/YYYY o DD-MM-YYYY
    const dateMatch2 = lote.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
    if (dateMatch2) {
      const [, day, month, year] = dateMatch2
      return new Date(`${year}-${month}-${day}`)
    }

    // Intenta ISO format YYYY-MM-DD
    const dateMatch3 = lote.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch3) {
      return new Date(lote)
    }

    return null
  }

  /**
   * Obtiene todos los warnings para un array de items
   */
  const getAllItemsWarnings = (items, inventoryData = {}) => {
    const allWarnings = []
    const warningsByItem = {}

    items.forEach((item, index) => {
      const itemWarnings = getItemWarnings(item, inventoryData)
      if (itemWarnings.length > 0) {
        warningsByItem[index] = itemWarnings
        allWarnings.push(...itemWarnings)
      }
    })

    return { allWarnings, warningsByItem }
  }

  /**
   * Crea un resumen visual de warnings por severidad
   */
  const getWarningSummary = (warnings) => {
    const summary = {
      total: warnings.length,
      high: warnings.filter(w => w.severity === 'high').length,
      medium: warnings.filter(w => w.severity === 'medium').length,
      low: warnings.filter(w => w.severity === 'low').length
    }
    return summary
  }

  return {
    getItemWarnings,
    getAllItemsWarnings,
    getWarningSummary,
    validateEquipmentWarnings,
    validateConsumableWarnings,
    validateSparePartWarnings,
    parseExpireDateFromLote
  }
}
