/**
 * Tests para useOrderItemValidation
 * 
 * Para ejecutar: npm test -- useOrderItemValidation.test.js
 * O en console del navegador copiar y ejecutar los casos de prueba
 */

import { useOrderItemValidation } from './useOrderItemValidation'

/**
 * Suite de pruebas para validación de equipos
 */
export const testOrderItemValidation = () => {
  const {
    getItemWarnings,
    getAllItemsWarnings,
    getWarningSummary,
    parseExpireDateFromLote
  } = useOrderItemValidation()

  console.group('🧪 ORDER ITEM VALIDATION TESTS')

  // Test 1: Equipo no funcional
  console.group('Test 1: Equipo no funcional')
  {
    const item = {
      tipo: 'equipo-medico',
      descripcion: 'Monitor Cardíaco',
      claveHRAEI: 'EC001'
    }
    const inventory = {
      'EC001': { funcional: false, mantenimiento: 'normal' }
    }
    const warnings = getItemWarnings(item, inventory)
    console.log('Item:', item)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 1, 'Debe haber 1 warning')
    console.assert(warnings[0].severity === 'high', 'Debe ser severidad alta')
    console.assert(warnings[0].type === 'equipment_not_functional', 'Tipo incorrecto')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 2: Equipo en mantenimiento correctivo
  console.group('Test 2: Equipo en mantenimiento correctivo')
  {
    const item = {
      tipo: 'equipo-medico',
      descripcion: 'Ventilador',
      claveHRAEI: 'V001'
    }
    const inventory = {
      'V001': { funcional: true, mantenimiento: 'correctivo' }
    }
    const warnings = getItemWarnings(item, inventory)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 1, 'Debe haber 1 warning')
    console.assert(warnings[0].type === 'equipment_corrective_maintenance', 'Tipo incorrecto')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 3: Equipo en mantenimiento preventivo
  console.group('Test 3: Equipo en mantenimiento preventivo')
  {
    const item = {
      tipo: 'equipo-medico',
      descripcion: 'Ecógrafo',
      claveHRAEI: 'ECO001'
    }
    const inventory = {
      'ECO001': { funcional: true, mantenimiento: 'preventivo' }
    }
    const warnings = getItemWarnings(item, inventory)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 1, 'Debe haber 1 warning')
    console.assert(warnings[0].severity === 'medium', 'Debe ser severidad media')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 4: Equipo con múltiples problemas
  console.group('Test 4: Equipo con múltiples problemas')
  {
    const item = {
      tipo: 'equipo-medico',
      descripcion: 'Monitor',
      claveHRAEI: 'M001'
    }
    const inventory = {
      'M001': {
        funcional: false,
        mantenimiento: 'correctivo',
        proximo_mant: new Date(Date.now() - 86400000).toISOString() // Vencido
      }
    }
    const warnings = getItemWarnings(item, inventory)
    console.log('Warnings:', warnings)
    console.assert(warnings.length >= 2, 'Debe haber al menos 2 warnings')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 5: Consumible caducado
  console.group('Test 5: Consumible caducado')
  {
    const item = {
      tipo: 'consumible',
      descripcion: 'Jeringa 10mL',
      lote: '20230101' // Caducado hace casi 2 años
    }
    const warnings = getItemWarnings(item)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 1, 'Debe haber 1 warning')
    console.assert(warnings[0].type === 'consumable_expired', 'Tipo incorrecto')
    console.assert(warnings[0].severity === 'high', 'Debe ser severidad alta')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 6: Consumible próximo a caducar
  console.group('Test 6: Consumible próximo a caducar (30 días)')
  {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 15) // 15 días
    const lote = `${futureDate.getFullYear()}${String(futureDate.getMonth() + 1).padStart(2, '0')}${String(futureDate.getDate()).padStart(2, '0')}`
    
    const item = {
      tipo: 'consumible',
      descripcion: 'Alcohol 70%',
      lote: lote
    }
    const warnings = getItemWarnings(item)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 1, 'Debe haber 1 warning')
    console.assert(warnings[0].type === 'consumable_expires_soon', 'Tipo incorrecto')
    console.assert(warnings[0].severity === 'medium', 'Debe ser severidad media')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 7: Refacción caducada
  console.group('Test 7: Refacción caducada')
  {
    const item = {
      tipo: 'refaccion',
      descripcion: 'Tubo de Ensayo',
      lote: '20240101'
    }
    const warnings = getItemWarnings(item)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 1, 'Debe haber 1 warning')
    console.assert(warnings[0].type === 'spare_part_expired', 'Tipo incorrecto')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 8: Parseador de fechas YYYYMMDD
  console.group('Test 8: Parse fecha YYYYMMDD')
  {
    const lote = '20250315'
    const date = parseExpireDateFromLote(lote)
    console.log('Lote:', lote, '-> Fecha:', date)
    console.assert(date !== null, 'Debe parsear la fecha')
    console.assert(date.getFullYear() === 2025, 'Año incorrecto')
    console.assert(date.getMonth() === 2, 'Mes incorrecto') // 0-indexed
    console.assert(date.getDate() === 15, 'Día incorrecto')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 9: Parseador de fechas DD/MM/YYYY
  console.group('Test 9: Parse fecha DD/MM/YYYY')
  {
    const lote = 'Lote 15/03/2025'
    const date = parseExpireDateFromLote(lote)
    console.log('Lote:', lote, '-> Fecha:', date)
    console.assert(date !== null, 'Debe parsear la fecha')
    console.assert(date.getFullYear() === 2025, 'Año incorrecto')
    console.assert(date.getMonth() === 2, 'Mes incorrecto')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 10: getAllItemsWarnings
  console.group('Test 10: Múltiples items con warnings')
  {
    const items = [
      {
        tipo: 'equipo-medico',
        descripcion: 'Monitor',
        claveHRAEI: 'M001'
      },
      {
        tipo: 'consumible',
        descripcion: 'Jeringa',
        lote: '20230101'
      },
      {
        tipo: 'equipo-medico',
        descripcion: 'Ventilador',
        claveHRAEI: 'V001'
      }
    ]
    const inventory = {
      'M001': { funcional: false },
      'V001': { mantenimiento: 'preventivo' }
    }
    const result = getAllItemsWarnings(items, inventory)
    console.log('Items:', items.length)
    console.log('Total warnings:', result.allWarnings.length)
    console.log('Warnings by item:', result.warningsByItem)
    console.assert(result.allWarnings.length === 3, 'Debe haber 3 warnings totales')
    console.assert(Object.keys(result.warningsByItem).length === 3, 'Debe haber warnings para 3 items')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 11: getWarningSummary
  console.group('Test 11: Resumen de warnings')
  {
    const warnings = [
      { severity: 'high', type: 'test1', message: 'msg1' },
      { severity: 'high', type: 'test2', message: 'msg2' },
      { severity: 'medium', type: 'test3', message: 'msg3' },
      { severity: 'low', type: 'test4', message: 'msg4' }
    ]
    const summary = getWarningSummary(warnings)
    console.log('Summary:', summary)
    console.assert(summary.total === 4, 'Total incorrecto')
    console.assert(summary.high === 2, 'Count high incorrecto')
    console.assert(summary.medium === 1, 'Count medium incorrecto')
    console.assert(summary.low === 1, 'Count low incorrecto')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  // Test 12: Item sin problemas
  console.group('Test 12: Item sin problemas')
  {
    const item = {
      tipo: 'equipo-medico',
      descripcion: 'ECG',
      claveHRAEI: 'ECG001',
      lote: '20260630'
    }
    const inventory = {
      'ECG001': {
        funcional: true,
        mantenimiento: 'normal',
        proximo_mant: new Date(Date.now() + 86400000 * 30).toISOString()
      }
    }
    const warnings = getItemWarnings(item, inventory)
    console.log('Warnings:', warnings)
    console.assert(warnings.length === 0, 'No debe haber warnings')
    console.log('✅ PASSED')
  }
  console.groupEnd()

  console.groupEnd()
  console.log('🎉 TODOS LOS TESTS PASARON')
}

// Para ejecutar en navegador: testOrderItemValidation()

