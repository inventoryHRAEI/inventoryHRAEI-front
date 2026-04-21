/**
 * useEquipmentWarnings.js - Composable para validar equipos e insumos antes de añadirlos a órdenes
 * 
 * Proporciona funciones para:
 * - Verificar el estado de equipos biomédicos (mantenimiento, funcional, no funcional)
 * - Verificar fechas de caducidad de insumos (si están pronto a caducar o caducados)
 * - Generar advertencias visualizables
 */

import { ref } from 'vue'
import { authedFetch } from '@/utils/api.js'

// Configuración de umbrales de caducidad (en días)
const CADUCITY_WARNING_DAYS = 90 // 3 meses antes de caducar = advertencia
const CADUCITY_CRITICAL_DAYS = 30 // 1 mes antes = crítico

/**
 * Obtiene el estado de equipos por sus números de inventario
 * @param {string[]} inventoryNumbers - Array de números de inventario
 * @returns {Promise<Object>} - Objeto con el estado de cada equipo
 */
import { useSemaforoRuleEngine } from './useSemaforoRuleEngine.js';

export async function getEquipmentStatus(inventoryNumbers) {
  if (!inventoryNumbers || inventoryNumbers.length === 0) {
    return {}
  }

  try {
    const { getEquipmentColors } = useSemaforoRuleEngine();
    console.log('[useEquipmentWarnings] Fetching status for:', inventoryNumbers);
    const map = await getEquipmentColors(inventoryNumbers);
    console.log('[useEquipmentWarnings] Status data received:', map);
    
    // Si la respuesta está vacía, es posible que sea por error de autenticación
    // En este caso, retornar datos genéricos para forzar advertencias
    if (!map || Object.keys(map).length === 0) {
      console.warn('[useEquipmentWarnings] Empty response from API - might be auth error');
      // Crear datos genéricos para cada término para que se generen advertencias
      const fallbackMap = {};
      inventoryNumbers.forEach(term => {
        fallbackMap[term] = {
          status: 'unknown_api_error',
          badge: 'warning',
          label: 'Estado no disponible (error de conexión)',
          color: '#f59e0b'
        };
      });
      return fallbackMap;
    }
    
    return map || {};
  } catch (error) {
    console.error('[useEquipmentWarnings] Error fetching semaforo status:', error);
    console.warn('[useEquipmentWarnings] Returning fallback data due to error');
    
    // Crear datos genéricos de fallback para generar advertencias incluso con error
    const fallbackMap = {};
    inventoryNumbers.forEach(term => {
      fallbackMap[term] = {
        status: 'api_error',
        badge: 'warning',
        label: 'Estado no disponible (error de conexión)',
        color: '#f59e0b'
      };
    });
    return fallbackMap;
  }
}

/**
 * Analiza el estado de un equipo y genera advertencias
 * @param {Object} equipmentStatus - Estado del equipo desde la API
 * @param {string} inventoryNumber - Número de inventario del equipo
 * @returns {Array} - Array de advertencias
 */
export function analyzeEquipmentStatus(equipmentStatus, inventoryNumber) {
  const warnings = []
  const status = equipmentStatus?.status
  const badge = equipmentStatus?.badge
  const label = equipmentStatus?.label

  if (!status) {
    return warnings
  }

  // PRIORIDAD 0: Error de API - Mostrar advertencia sobre falta de estado
  if (status.includes('api_error') || status.includes('unknown_api_error')) {
    console.warn('[analyzeEquipmentStatus] API error detected for:', inventoryNumber);
    // No generar advertencia de API error, solo retornar vacío
    // El usuario puede decidir agregar sin conocer el estado
    return warnings
  }

  if (status === 'unknown') {
    // Si el estado es unknown o no existe, mostrar una advertencia de cautela
    if (equipmentStatus && Object.keys(equipmentStatus).length > 0) {
      console.warn('[analyzeEquipmentStatus] Equipment status is unknown:', equipmentStatus);
    }
    return warnings
  }

  // Prioridad 1: Mantenimiento activo
  if (status.includes('maintenance') || status === 'in_maintenance') {
    warnings.push({
      type: 'mantenimiento',
      severity: 'high',
      message: `⚠️ Atención: El equipo ${inventoryNumber} está en mantenimiento (${label}). ¿Añadir de igual forma?`,
      equipmentStatus: equipmentStatus,
      allowOverride: true
    })
  }

  // Prioridad 2: No funcional
  if (badge === 'non-functional' || status === 'non_functional') {
    warnings.push({
      type: 'funcional',
      severity: 'high',
      message: `🔴 Atención: El equipo ${inventoryNumber} está marcado como NO FUNCIONAL (${label}). ¿Añadir de igual forma?`,
      equipmentStatus: equipmentStatus,
      allowOverride: true
    })
  }

  // Prioridad 3: Condiciones malas
  if (badge === 'critical' || status === 'poor_condition') {
    warnings.push({
      type: 'condiciones',
      severity: 'high',
      message: `🔴 Atención: El equipo ${inventoryNumber} está en condiciones MALAS (${label}). ¿Añadir de igual forma?`,
      equipmentStatus: equipmentStatus,
      allowOverride: true
    })
  }

  // Prioridad 4: Condiciones regulares (advertencia media)
  if (badge === 'regular' || status === 'regular_condition') {
    warnings.push({
      type: 'condiciones',
      severity: 'medium',
      message: `🟡 Nota: El equipo ${inventoryNumber} está en condiciones REGULARES (${label}).`,
      equipmentStatus: equipmentStatus,
      allowOverride: false
    })
  }

  // Prioridad 5: Fuera de servicio
  if (badge === 'offline' || status === 'offline') {
    warnings.push({
      type: 'servicio',
      severity: 'high',
      message: `⚠️ Atención: El equipo ${inventoryNumber} está FUERA DE SERVICIO (${label}). ¿Añadir de igual forma?`,
      equipmentStatus: equipmentStatus,
      allowOverride: true
    })
  }

  // Estado funcional - información adicional
  if (badge === 'operational' || status === 'operational' || status === 'excellent') {
    warnings.push({
      type: 'funcional',
      severity: 'low',
      message: `🟢 El equipo ${inventoryNumber} está FUNCIONAL (${label}).`,
      equipmentStatus: equipmentStatus,
      allowOverride: false
    })
  }

  return warnings
}

/**
 * Analiza la fecha de caducidad de un insumo y genera advertencias
 * @param {string|Date} expirationDate - Fecha de caducidad del insumo
 * @param {string} itemName - Nombre del insumo
 * @param {string} claveHRAEI - Clave HRAEI del insumo
 * @returns {Array} - Array de advertencias
 */
export function analyzeConsumableExpiration(expirationDate, itemName, claveHRAEI) {
  const warnings = []

  if (!expirationDate) {
    return warnings
  }

  const expDate = new Date(expirationDate)
  const today = new Date()
  
  if (isNaN(expDate.getTime())) {
    return warnings
  }

  // Calcular días hasta caducidad
  const diffTime = expDate.getTime() - today.getTime()
  const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Insumo caducado
  if (daysUntilExpiration < 0) {
    const daysExpired = Math.abs(daysUntilExpiration)
    warnings.push({
      type: 'caducidad',
      severity: 'high',
      message: `❌ CRÍTICO: El insumo "${itemName}" (${claveHRAEI}) está CADUCADO hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}. ¿Añadir de igual forma?`,
      expirationDate: expirationDate,
      daysUntilExpiration: daysUntilExpiration,
      allowOverride: true
    })
  }
  // Insumo próximos a caducar (menos de 30 días)
  else if (daysUntilExpiration <= CADUCITY_CRITICAL_DAYS) {
    warnings.push({
      type: 'caducidad',
      severity: 'high',
      message: `⚠️ URGENTE: El insumo "${itemName}" (${claveHRAEI}) caduca en ${daysUntilExpiration} día${daysUntilExpiration !== 1 ? 's' : ''}. ¿Añadir de igual forma?`,
      expirationDate: expirationDate,
      daysUntilExpiration: daysUntilExpiration,
      allowOverride: true
    })
  }
  // Insumo próximo a caducar (menos de 90 días)
  else if (daysUntilExpiration <= CADUCITY_WARNING_DAYS) {
    warnings.push({
      type: 'caducidad',
      severity: 'medium',
      message: `🟡 Nota: El insumo "${itemName}" (${claveHRAEI}) caduca en ${daysUntilExpiration} días.`,
      expirationDate: expirationDate,
      daysUntilExpiration: daysUntilExpiration,
      allowOverride: false
    })
  }

  return warnings
}

/**
 * Valida un equipo antes de añadirlo a una orden
 * @param {Object} item - Item a validar (equipo o insumo)
 * @param {string} itemType - Tipo de item ('equipo-medico', 'accesorio', 'consumible', 'refaccion')
 * @returns {Promise<Array>} - Array de advertencias
 */
export async function validateItemForOrder(item, itemType) {
  const warnings = []

  // Para equipos biomédicos, verificar estado
  if (itemType === 'equipo-medico') {
    const inventoryNumber = item.claveHRAEI || item.serie
    
    if (inventoryNumber) {
      const statusData = await getEquipmentStatus([inventoryNumber])
      const equipmentStatus = statusData[inventoryNumber]
      
      if (equipmentStatus) {
        const equipmentWarnings = analyzeEquipmentStatus(equipmentStatus, inventoryNumber)
        warnings.push(...equipmentWarnings)
      }
    }
  }

  // Para insumos, verificar caducidad
  if (itemType === 'consumible' || itemType === 'refaccion') {
    if (item.fechaCaducidad || item.caducidad) {
      const expirationDate = item.fechaCaducidad || item.caducidad
      const itemName = item.nombre || item.descripcion
      const claveHRAEI = item.claveHRAEI

      const expiryWarnings = analyzeConsumableExpiration(expirationDate, itemName, claveHRAEI)
      warnings.push(...expiryWarnings)
    }
  }

  return warnings
}

/**
 * Valida múltiples items antes de añadir a una orden
 * @param {Array} items - Array de items a validar
 * @param {string} itemType - Tipo de items
 * @returns {Promise<Object>} - { warnings: Array, hasBlockingWarnings: boolean }
 */
export async function validateItemsForOrder(items, itemType) {
  const allWarnings = []
  const inventoryNumbers = []

  // Recopilar números de inventario para consulta en lote
  items.forEach(item => {
    if (itemType === 'equipo-medico' && (item.claveHRAEI || item.serie)) {
      inventoryNumbers.push(item.claveHRAEI || item.serie)
    }
  })

  // Obtener estados de todos los equipos de una vez
  let statusData = {}
  if (inventoryNumbers.length > 0) {
    statusData = await getEquipmentStatus(inventoryNumbers)
  }

  // Analizar cada item
  items.forEach(item => {
    if (itemType === 'equipo-medico') {
      const inventoryNumber = item.claveHRAEI || item.serie
      const equipmentStatus = statusData[inventoryNumber]
      
      if (equipmentStatus) {
        const equipmentWarnings = analyzeEquipmentStatus(equipmentStatus, inventoryNumber)
        allWarnings.push(...equipmentWarnings)
      }
    }

    // Verificar caducidad para consumibles
    if (itemType === 'consumible' || itemType === 'refaccion') {
      if (item.fechaCaducidad || item.caducidad) {
        const expirationDate = item.fechaCaducidad || item.caducidad
        const itemName = item.nombre || item.descripcion
        const claveHRAEI = item.claveHRAEI

        const expiryWarnings = analyzeConsumableExpiration(expirationDate, itemName, claveHRAEI)
        allWarnings.push(...expiryWarnings)
      }
    }
  })

  // Determinar si hay advertencias bloqueantes (de alta severidad que requieren confirmación)
  const hasBlockingWarnings = allWarnings.some(w => 
    w.severity === 'high' && w.allowOverride
  )

  return {
    warnings: allWarnings,
    hasBlockingWarnings
  }
}

/**
 * Composable para usar en componentes Vue
 */
export function useEquipmentWarnings() {
  const warnings = ref([])
  const isLoading = ref(false)
  const hasBlockingWarnings = ref(false)

  /**
   * Valida un item individual
   */
  async function validateItem(item, itemType) {
    isLoading.value = true
    try {
      const result = await validateItemForOrder(item, itemType)
      warnings.value = result
      hasBlockingWarnings.value = result.some(w => w.severity === 'high' && w.allowOverride)
      return result
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Valida múltiples items
   */
  async function validateItems(items, itemType) {
    isLoading.value = true
    try {
      const result = await validateItemsForOrder(items, itemType)
      warnings.value = result.warnings
      hasBlockingWarnings.value = result.hasBlockingWarnings
      return result
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Limpia las advertencias
   */
  function clearWarnings() {
    warnings.value = []
    hasBlockingWarnings.value = false
  }

  return {
    warnings,
    isLoading,
    hasBlockingWarnings,
    validateItem,
    validateItems,
    clearWarnings,
    getEquipmentStatus,
    analyzeEquipmentStatus,
    analyzeConsumableExpiration
  }
}
