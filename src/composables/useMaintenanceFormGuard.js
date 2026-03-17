/**
 * useMaintenanceFormGuard.js
 * 
 * GUARDIA IMPLACABLE para inicio y fin de mantenimiento
 * - Valida ANTES de permitir operación
 * - Restaura colores en tiempo real
 * - Bloquea operaciones inconsistentes
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useColorValidationDrastica } from './useColorValidationDrastica'
import { useBiomedicalMaintenance } from './useBiomedicalMaintenance'
import { useSemaforizationReactive } from './useSemaforizationReactive'

export function useMaintenanceFormGuard(inventoryNo) {
  // Composables
  const {
    validateColorBeforeOperation,
    validateFinishResult,
    mapConditionToColor,
    readFormState,
    validationErrors,
    isValidating
  } = useColorValidationDrastica()

  const { onStartMaintenance, onFinishMaintenance } = useBiomedicalMaintenance()
  const { updateEquipmentStatusReactive, invalidateCacheForCode } =
    useSemaforizationReactive()

  // State
  const formState = ref({
    return_condition: null,
    estado: null,
    observaciones: '',
    technician: '',
    hours: 0
  })

  const canStartMaintenance = ref(false)
  const canFinishMaintenance = ref(false)
  const nextExpectedColor = ref(null)
  const warnings = ref([])

  // Computed
  const expectedResultColor = computed(() => {
    const condition = formState.value.return_condition || formState.value.estado
    return condition ? mapConditionToColor(condition) : null
  })

  const formValid = computed(() => {
    return (
      formState.value.return_condition ||
      formState.value.estado ||
      formState.value.estatus
    )
  })

  // ========================================================================
  // ANTES DE INICIAR MANTENIMIENTO
  // ========================================================================
  async function guardStartMaintenance(payload = {}) {
    console.log('[useMaintenanceFormGuard] Guardando inicio de mantenimiento...')
    warnings.value = []

    try {
      // 1. Validar que el color actual sea correcto
      const validation = await validateColorBeforeOperation(
        payload.code || inventoryNo,
        'start'
      )

      if (!validation.valid) {
        console.error('[useMaintenanceFormGuard] Validación FALLÓ:', validation)
        warnings.value.push(validation.message)
        return {
          ok: false,
          error: validation.message,
          validation
        }
      }

      console.log(
        '[useMaintenanceFormGuard] Validación OK para iniciar mantenimiento'
      )

      // 2. Ejecutar inicio
      const result = await onStartMaintenance({
        code: payload.code || inventoryNo,
        reason: payload.reason || 'MP',
        provider: payload.provider || 'Biomedica'
      })

      // 3. Actualizar estado reactivo INMEDIATAMENTE
      updateEquipmentStatusReactive(payload.code || inventoryNo, 'EN_MANTENIMIENTO', {
        startedAt: new Date().toISOString(),
        maintenanceType: payload.reason || 'MP'
      })

      // 4. Invalidar caché
      invalidateCacheForCode(payload.code || inventoryNo)

      console.log('[useMaintenanceFormGuard] ✅ Inicio de mantenimiento completado')

      return {
        ok: true,
        result
      }
    } catch (error) {
      console.error('[useMaintenanceFormGuard] Error iniciando mantenimiento:', error)
      warnings.value.push(`Error: ${error.message}`)

      return {
        ok: false,
        error: error.message
      }
    }
  }

  // ========================================================================
  // ANTES DE FINALIZAR MANTENIMIENTO
  // ========================================================================
  async function guardFinishMaintenance(payload = {}) {
    console.log('[useMaintenanceFormGuard] Guardando fin de mantenimiento...')
    warnings.value = []

    try {
      // 1. Leer datos del formulario si no se proporcionan
      let finishData = {
        code: payload.code || inventoryNo,
        return_condition: payload.return_condition || formState.value.return_condition,
        estado: payload.estado || formState.value.estado,
        observaciones: payload.observaciones || formState.value.observaciones,
        technician: payload.technician || formState.value.technician,
        hours: payload.hours || formState.value.hours
      }

      // 2. Si falta condición, LEER FORMULARIO
      if (!finishData.return_condition && !finishData.estado) {
        console.warn(
          '[useMaintenanceFormGuard] Falta return_condition, leyendo formulario...'
        )
        const formData = readFormState()
        finishData.return_condition = formData?.return_condition
        finishData.estado = formData?.estado
      }

      // 3. Validar que tenga condición de resultado
      const condition =
        finishData.return_condition || finishData.estado
      if (!condition) {
        warnings.value.push(
          'Debe especificar la condición del equipo tras mantenimiento'
        )
        console.error('[useMaintenanceFormGuard] Sin condición de resultado')
        return {
          ok: false,
          error: 'Falta condición de resultado'
        }
      }

      // 4. Validar resultado
      const resultValidation = await validateFinishResult(
        finishData.code,
        condition
      )

      if (!resultValidation.valid) {
        warnings.value.push(resultValidation.message)
        console.error('[useMaintenanceFormGuard] Validación de resultado FALLÓ')
        return {
          ok: false,
          error: resultValidation.message
        }
      }

      console.log(
        '[useMaintenanceFormGuard] Resultado esperado:',
        resultValidation.expectedStatus,
        resultValidation.expectedColor
      )

      // 5. Ejecutar fin
      const result = await onFinishMaintenance({
        code: finishData.code,
        return_condition: finishData.return_condition,
        estado: finishData.estado,
        observaciones: finishData.observaciones,
        technician: finishData.technician,
        hours: finishData.hours
      })

      // 6. Actualizar estado reactivo INMEDIATAMENTE con el color esperado
      updateEquipmentStatusReactive(
        finishData.code,
        resultValidation.expectedStatus,
        {
          finishedAt: new Date().toISOString(),
          resultStatus: condition,
          expectedColor: resultValidation.expectedColor
        }
      )

      // 7. Invalidar caché
      invalidateCacheForCode(finishData.code)

      console.log(
        '[useMaintenanceFormGuard] ✅ Fin de mantenimiento completado'
      )
      console.log(
        '[useMaintenanceFormGuard] Color actualizado a:',
        resultValidation.expectedColor.color
      )

      return {
        ok: true,
        result,
        expectedColor: resultValidation.expectedColor
      }
    } catch (error) {
      console.error('[useMaintenanceFormGuard] Error finalizando mantenimiento:', error)
      warnings.value.push(`Error: ${error.message}`)

      // ÚLTIMO RECURSO: intentar leer formulario y continuar
      const formData = readFormState()
      console.warn(
        '[useMaintenanceFormGuard] Intentando recuperación con datos del formulario...'
      )

      try {
        const fallbackResult = await onFinishMaintenance({
          code: inventoryNo,
          return_condition: formData?.return_condition,
          estado: formData?.estado,
          observaciones: formState.value.observaciones
        })

        return {
          ok: true,
          result: fallbackResult,
          fromFormRecovery: true,
          warning: 'Finalizado usando recuperación de formulario'
        }
      } catch (fallbackError) {
        return {
          ok: false,
          error: error.message,
          fallbackError: fallbackError.message
        }
      }
    }
  }

  // ========================================================================
  // ACTUALIZAR ESTADO DEL FORMULARIO
  // ========================================================================
  function updateFormState(updates) {
    formState.value = {
      ...formState.value,
      ...updates
    }
  }

  // ========================================================================
  // WATCHER: actualizar color esperado en tiempo real
  // ========================================================================
  watch(
    () => formState.value.return_condition,
    (newVal) => {
      if (newVal) {
        const color = mapConditionToColor(newVal)
        nextExpectedColor.value = color
        console.log(
          `[useMaintenanceFormGuard] Color esperado en tiempo real: ${newVal} → ${color.label}`
        )
      }
    }
  )

  watch(
    () => formState.value.estado,
    (newVal) => {
      if (newVal) {
        const color = mapConditionToColor(newVal)
        nextExpectedColor.value = color
        console.log(
          `[useMaintenanceFormGuard] Color esperado en tiempo real: ${newVal} → ${color.label}`
        )
      }
    }
  )

  return {
    // State
    formState,
    nextExpectedColor,
    expectedResultColor,
    canStartMaintenance,
    canFinishMaintenance,
    warnings,
    validationErrors,
    isValidating,
    formValid,

    // Methods
    guardStartMaintenance,
    guardFinishMaintenance,
    updateFormState
  }
}
