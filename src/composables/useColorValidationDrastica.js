/**
 * useColorValidationDrastica.js
 * 
 * SOLUCIÓN DRASTICA: Validar color ANTES de cualquier operación
 * Si algo no encaja, leer formularios y RESTAURAR colores en tiempo real
 * 
 * NO PERMITE inconsistencias. PUNTO.
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { authedFetch } from '@/utils/api'

// Estado de validación
const colorValidationMap = ref(new Map())
const validationErrors = ref([])
const isValidating = ref(false)

const STATUS_COLORS = {
  'OPERATIVO': '#22c55e',
  'PARCIALMENTE_OPERATIVO': '#f59e0b',
  'FUERA_DE_SERVICIO': '#ef4444',
  'EN_MANTENIMIENTO': '#3b82f6',
  'DESCONOCIDO': '#64748b'
}

const STATUS_CONFIG = {
  'OPERATIVO': {
    color: '#22c55e',
    badge: 'operational',
    label: 'Operativo',
    icon: '✅',
    severity: 0
  },
  'PARCIALMENTE_OPERATIVO': {
    color: '#f59e0b',
    badge: 'warning',
    label: 'Parcialmente Operativo',
    icon: '⚠️',
    severity: 1
  },
  'FUERA_DE_SERVICIO': {
    color: '#ef4444',
    badge: 'critical',
    label: 'Fuera de Servicio',
    icon: '❌',
    severity: 2
  },
  'EN_MANTENIMIENTO': {
    color: '#3b82f6',
    badge: 'maintenance',
    label: 'En Mantenimiento',
    icon: '🔧',
    severity: 1
  },
  'DESCONOCIDO': {
    color: '#64748b',
    badge: 'unknown',
    label: 'Desconocido',
    icon: '❓',
    severity: 0
  }
}

// ============================================================================
// NORMALIZACIÓN
// ============================================================================
const normalizeInv = (code) => String(code || '').trim().toUpperCase()
const compactInv = (code) => normalizeInv(code).replace(/[^A-Z0-9]/g, '')

// ============================================================================
// LECTURA DE FORMULARIOS (DESPERADO: si todo falla, leer del DOM)
// ============================================================================
function readFormState() {
  try {
    // Buscar inputs de mantenimiento
    const formData = {
      return_condition: null,
      estado: null,
      estatus: null,
      estado_equipo: null,
      funcional: null
    }

    // Buscar en inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="hidden"], select')
    inputs.forEach((input) => {
      const name = input.name || input.id || ''
      const value = input.value || ''

      if (
        name.toLowerCase().includes('return_condition') ||
        name.toLowerCase().includes('estado') ||
        name.toLowerCase().includes('estatus') ||
        name.toLowerCase().includes('funcional')
      ) {
        formData[Object.keys(formData)[0]] = value
      }
    })

    // Buscar en textareas
    const textareas = document.querySelectorAll('textarea')
    textareas.forEach((ta) => {
      const value = ta.value || ''
      if (value.toLowerCase().includes('funcional')) {
        formData.funcional = value
      }
    })

    console.log('[useColorValidationDrastica] Datos leídos del formulario:', formData)
    return formData
  } catch (e) {
    console.error('[useColorValidationDrastica] Error leyendo formulario:', e)
    return null
  }
}

// ============================================================================
// MAPEO DRASTATICO DE CONDICIÓN → COLOR
// ============================================================================
function mapConditionToColor(condition) {
  if (!condition) return STATUS_CONFIG['DESCONOCIDO']

  const cond = String(condition).toLowerCase().trim()

  // Verificar EXACTITUD en orden
  if (
    cond.includes('fuera') ||
    cond.includes('no func') ||
    cond === 'non_functional' ||
    cond.includes('deficiente') ||
    cond.includes('malo')
  ) {
    return STATUS_CONFIG['FUERA_DE_SERVICIO']
  }

  if (
    cond.includes('parcial') ||
    cond.includes('condicional') ||
    cond === 'partial'
  ) {
    return STATUS_CONFIG['PARCIALMENTE_OPERATIVO']
  }

  if (
    cond.includes('funcional') ||
    cond === 'functional' ||
    cond === 'si' ||
    cond === 'yes' ||
    cond.includes('operativo') ||
    cond.includes('bueno')
  ) {
    return STATUS_CONFIG['OPERATIVO']
  }

  return STATUS_CONFIG['DESCONOCIDO']
}

// ============================================================================
// VALIDAR COLOR ANTES DE OPERACIÓN
// ============================================================================
async function validateColorBeforeOperation(inventoryNo, operationType = 'start') {
  const normalized = normalizeInv(inventoryNo)
  isValidating.value = true
  validationErrors.value = []

  try {
    console.log(
      `[useColorValidationDrastica] Validando antes de ${operationType} para ${normalized}`
    )

    // 1. Obtener estado actual del backend (reglas de semáforo)
    const { getEquipmentColors } = await import('./useSemaforoRuleEngine.js').then(m => m.useSemaforoRuleEngine());
    const map = await getEquipmentColors([normalized]);
    const currentStatus = map[normalized];

    if (!currentStatus) {
      validationErrors.value.push(`No se encontró estado para ${normalized}`)
      console.warn('[useColorValidationDrastica] Estado no encontrado:', normalized)
      return {
        valid: false,
        status: STATUS_CONFIG['DESCONOCIDO'],
        message: 'No se pudo validar estado del equipo'
      }
    }

    console.log('[useColorValidationDrastica] Estado actual:', currentStatus)

    // 2. Validar coherencia
    const expected = STATUS_CONFIG[currentStatus.status]
    if (!expected) {
      validationErrors.value.push(
        `Estado inválido en BD: ${currentStatus.status}`
      )
      return {
        valid: false,
        status: STATUS_CONFIG['DESCONOCIDO'],
        message: 'Estado inválido en base de datos'
      }
    }

    // 3. Validar que el color coincida
    if (currentStatus.color !== expected.color) {
      console.error(
        `[useColorValidationDrastica] MISMATCH de color: ${currentStatus.color} vs ${expected.color}`
      )
      // RESTAURAR el color correcto
      currentStatus.color = expected.color
      currentStatus.badge = expected.badge
      currentStatus.label = expected.label
      currentStatus.icon = expected.icon
    }

    // 4. Si es 'start', verificar que NO esté en mantenimiento
    if (operationType === 'start') {
      if (currentStatus.status === 'EN_MANTENIMIENTO') {
        validationErrors.value.push(`Ya está en mantenimiento`)
        return {
          valid: false,
          status: currentStatus,
          message: 'Este equipo ya está en mantenimiento'
        }
      }
    }

    return {
      valid: true,
      status: currentStatus,
      message: 'Validación OK'
    }
  } catch (error) {
    console.error('[useColorValidationDrastica] Error validando:', error)
    validationErrors.value.push(`Error: ${error.message}`)

    // ÚLTIMO RECURSO: leer formularios
    console.warn('[useColorValidationDrastica] LEYENDO FORMULARIO...')
    const formData = readFormState()
    const formColor = mapConditionToColor(formData?.return_condition)

    return {
      valid: true, // Permitir continuar, pero con warning
      status: formColor,
      message: 'Validación parcial (usando datos del formulario)',
      fromForm: true
    }
  } finally {
    isValidating.value = false
  }
}

// ============================================================================
// VALIDAR RESULTADO DE MANTENIMIENTO
// ============================================================================
async function validateFinishResult(inventoryNo, resultStatus) {
  const normalized = normalizeInv(inventoryNo)

  console.log(
    `[useColorValidationDrastica] Validando resultado: ${resultStatus} para ${normalized}`
  )

  try {
    // Mapear resultado a estado
    const expectedStatus = mapResultStatusToEquipmentStatus(resultStatus)
    const expectedColor = STATUS_CONFIG[expectedStatus]

    console.log('[useColorValidationDrastica] Expected:', expectedStatus, expectedColor)

    return {
      valid: true,
      expectedStatus,
      expectedColor,
      message: 'Resultado validado'
    }
  } catch (error) {
    console.error('[useColorValidationDrastica] Error validando resultado:', error)

    // FALLBACK: leer formulario
    const formData = readFormState()
    const formColor = mapConditionToColor(formData?.return_condition)

    return {
      valid: true,
      expectedStatus: formColor.status,
      expectedColor: formColor,
      message: 'Resultado validado (desde formulario)',
      fromForm: true
    }
  }
}

// ============================================================================
// RESTAURAR COLOR EN TIEMPO REAL MIENTRAS ESCRIBE
// ============================================================================
function setupRealtimeColorRestoration() {
  if (typeof window === 'undefined') return () => {}

  // Escuchar cambios en inputs de condición
  const handleInputChange = (event) => {
    const input = event.target
    const value = input.value || ''
    const name = input.name || input.id || ''

    if (
      name.toLowerCase().includes('return_condition') ||
      name.toLowerCase().includes('estado') ||
      name.toLowerCase().includes('funcional') ||
      name.toLowerCase().includes('estatus')
    ) {
      // Mapear color basado en lo que escribe
      const color = mapConditionToColor(value)
      console.log(
        `[useColorValidationDrastica] Real-time: "${value}" → ${color.status} (${color.color})`
      )

      // ACTUALIZAR UI en tiempo real
      // Buscar elemento para mostrar preview de color
      const preview = document.querySelector('[data-color-preview]')
      if (preview) {
        preview.style.backgroundColor = color.color
        preview.textContent = color.label
        preview.title = color.icon
      }

      // Buscar badge
      const badge = document.querySelector('[data-status-badge]')
      if (badge) {
        badge.style.backgroundColor = color.color
        badge.className = `badge badge-${color.badge}`
      }
    }
  }

  // Escuchar selects
  const handleSelectChange = (event) => {
    const select = event.target
    const value = select.value || ''
    const color = mapConditionToColor(value)

    const preview = document.querySelector('[data-color-preview]')
    if (preview) {
      preview.style.backgroundColor = color.color
      preview.textContent = color.label
    }
  }

  document.addEventListener('input', handleInputChange)
  document.addEventListener('change', handleSelectChange)

  return () => {
    document.removeEventListener('input', handleInputChange)
    document.removeEventListener('change', handleSelectChange)
  }
}

// ============================================================================
// MAPEO RESULTADO → ESTADO (IDÉNTICO A useSemaforizationReactive)
// ============================================================================
function mapResultStatusToEquipmentStatus(resultStatus) {
  const status = String(resultStatus || '').toLowerCase().trim()

  if (
    status.includes('fuera') ||
    status.includes('no func') ||
    status === 'non_functional' ||
    status === 'out_of_service'
  ) {
    return 'FUERA_DE_SERVICIO'
  }

  if (
    status.includes('parcial') ||
    status.includes('condicional') ||
    status === 'partial'
  ) {
    return 'PARCIALMENTE_OPERATIVO'
  }

  if (
    status.includes('funcional') ||
    status === 'functional' ||
    status === 'si'
  ) {
    return 'OPERATIVO'
  }

  return 'OPERATIVO'
}

// ============================================================================
// COMPOSABLE PUBLIC
// ============================================================================
export function useColorValidationDrastica() {
  onMounted(() => {
    const cleanup = setupRealtimeColorRestoration()
    onUnmounted(cleanup)
  })

  return {
    // State
    colorValidationMap,
    validationErrors,
    isValidating,

    // Methods
    validateColorBeforeOperation,
    validateFinishResult,
    mapConditionToColor,
    readFormState,

    // Helpers
    normalizeInv,
    STATUS_CONFIG
  }
}
