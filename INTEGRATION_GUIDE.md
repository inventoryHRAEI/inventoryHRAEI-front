# Guía de Integración: Order Item Warnings

## Descripción General

Se ha creado un sistema de validación y visualización de warnings para items en órdenes. Este sistema verifica:

- **Equipos Médicos/Mobiliario:**
  - Estado no funcional
  - En mantenimiento preventivo o correctivo
  - Mantenimiento vencido o próximo a vencer

- **Insumos Consumibles:**
  - Caducados
  - Próximos a caducar (30 días)

- **Refacciones y Accesorios:**
  - Caducadas
  - Próximas a caducar (30 días)

## Archivos Creados

### 1. `src/composables/useOrderItemValidation.js`
Composable que proporciona funciones para validar items y obtener warnings.

**Funciones principales:**
- `getItemWarnings(item, inventoryData)`: Obtiene warnings para un item específico
- `getAllItemsWarnings(items, inventoryData)`: Obtiene warnings para múltiples items
- `getWarningSummary(warnings)`: Crea un resumen de warnings por severidad

### 2. `src/components/OrderItemWarnings.vue`
Componente visual para mostrar los warnings con estilos por severidad.

**Props:**
- `warnings`: Array de warnings a mostrar
- `collapsible`: Si el componente es colapsable (default: true)
- `expanded`: Si inicia expandido (default: true)
- `showType`: Si mostrar el tipo técnico del warning (default: false)

## Cómo Integrar en OpSalidaNew.vue

### Paso 1: Importar el composable
```javascript
import { useOrderItemValidation } from '@/composables/useOrderItemValidation'
import OrderItemWarnings from '@/components/OrderItemWarnings.vue'
```

### Paso 2: En el setup
```javascript
const { getItemWarnings, getAllItemsWarnings } = useOrderItemValidation()

// Importar datos del inventario (según tu lógica actual)
// const inventoryData = { /* datos de equipos */ }

// Computed para obtener warnings de todos los items
const allItemsWarnings = computed(() => {
  if (form.equiposSalida.length === 0) return { allWarnings: [], warningsByItem: {} }
  return getAllItemsWarnings(form.equiposSalida, inventoryData.value || {})
})
```

### Paso 3: En el template
```vue
<!-- Después del WizardStepCard de "Equipos Agregados" -->
<div v-if="allItemsWarnings.allWarnings.length > 0" class="warnings-summary">
  <OrderItemWarnings
    :warnings="allItemsWarnings.allWarnings"
    collapsible
    expanded
  />
</div>

<!-- O para warnings específicos de cada item -->
<div v-for="(item, index) in form.equiposSalida" :key="index" class="equipment-item">
  <!-- Contenido del item -->
  
  <!-- Warnings del item -->
  <OrderItemWarnings
    v-if="allItemsWarnings.warningsByItem[index]"
    :warnings="allItemsWarnings.warningsByItem[index]"
    collapsible
  />
</div>
```

### Paso 4: Registrar el componente
```javascript
components: {
  OrderItemWarnings
}
```

## Integración en Otros Componentes

El sistema debe integrarse en:
- **OpSalida.vue**
- **OpSalidaNew.vue**
- **OpEntrada.vue**
- **OpEntradaNew.vue**
- **OpServicio.vue**
- **OpServicioNew.vue**
- **OpResguardo.vue**
- **OpResguardoNew.vue**

El patrón es el mismo para todos.

## Estructura de Warnings

Cada warning tiene la siguiente estructura:
```javascript
{
  type: 'equipment_not_functional', // Identificador único del tipo
  message: '⚠️ Equipo "..." está en estado NO FUNCIONAL', // Mensaje visible
  severity: 'high' // 'high', 'medium' o 'low'
}
```

## Severidades

- **high** (Rojo): Problemas críticos que pueden afectar la operación
  - Equipos no funcionales
  - Equipos en mantenimiento correctivo
  - Items caducados
  - Mantenimiento vencido

- **medium** (Naranja): Advertencias moderadas
  - Equipos en mantenimiento preventivo
  - Items próximos a caducar (7-30 días)
  - Mantenimiento próximo (7 días)

- **low** (Verde): Informativos
  - Otros casos

## Obtener Datos del Inventario

Necesitas obtener los datos de equipos para validar. Opciones:

### Opción 1: Desde un servicio (Recomendado)
```javascript
import { useQuery } from '@tanstack/vue-query'
import { equipmentService } from '@/services/equipmentService'

const { data: inventoryData } = useQuery({
  queryKey: ['equipment'],
  queryFn: () => equipmentService.getAll()
})

// Luego usarlo en el computed
const allItemsWarnings = computed(() => {
  const data = {}
  inventoryData.value?.forEach(equipo => {
    data[equipo.claveHRAEI] = equipo
  })
  return getAllItemsWarnings(form.equiposSalida, data)
})
```

### Opción 2: Desde el store
```javascript
import { useEquipmentStore } from '@/stores/equipmentStore'

const equipmentStore = useEquipmentStore()

const allItemsWarnings = computed(() => {
  const data = {}
  equipmentStore.equipments?.forEach(equipo => {
    data[equipo.claveHRAEI] = equipo
  })
  return getAllItemsWarnings(form.equiposSalida, data)
})
```

## Validación de Fechas de Vencimiento

El composable intenta parsear fechas desde el campo `lote` en estos formatos:
- YYYYMMDD (20250315)
- DD/MM/YYYY o DD-MM-YYYY (15/03/2025)
- YYYY-MM-DD (2025-03-15)

Si tu sistema usa un campo específico para fechas de vencimiento (ej: `fechaVencimiento`), el composable ya lo valida automáticamente.

## Notas Importantes

1. **Inventario Vacío**: Si no tienes datos de inventario, el composable solo validará fechas en el campo `lote`.

2. **Performance**: Para muchos items, considera usar un Map en lugar de un objeto para `inventoryData`:
```javascript
const inventoryMap = new Map(inventoryData.map(e => [e.claveHRAEI, e]))
```

3. **Actualización**: Los warnings se actualizan reactivamente cuando cambias items.

4. **Traducción**: Todos los mensajes están en español, pero pueden ser modificados en el composable.

## Ejemplo Completo de Integración

```vue
<script setup>
import { useOrderItemValidation } from '@/composables/useOrderItemValidation'
import OrderItemWarnings from '@/components/OrderItemWarnings.vue'
import { computed } from 'vue'

// ... resto del setup ...

const { getAllItemsWarnings } = useOrderItemValidation()

// Obtener datos de inventario (ajusta según tu lógica)
const inventoryData = computed(() => {
  const map = {}
  // Obtener datos desde tu API/store
  return map
})

const allItemsWarnings = computed(() => {
  if (form.equiposSalida.length === 0) {
    return { allWarnings: [], warningsByItem: {} }
  }
  return getAllItemsWarnings(form.equiposSalida, inventoryData.value)
})
</script>

<template>
  <!-- En la sección de equipos agregados -->
  <div v-if="allItemsWarnings.allWarnings.length > 0" class="global-warnings">
    <OrderItemWarnings
      :warnings="allItemsWarnings.allWarnings"
      collapsible
      expanded
    />
  </div>

  <!-- Para cada item -->
  <div v-for="(item, index) in form.equiposSalida" :key="index">
    <OrderItemWarnings
      v-if="allItemsWarnings.warningsByItem[index]"
      :warnings="allItemsWarnings.warningsByItem[index]"
    />
  </div>
</template>
```

## Testing

Para probar el composable:

```javascript
import { useOrderItemValidation } from '@/composables/useOrderItemValidation'

const { getItemWarnings } = useOrderItemValidation()

// Test de equipo no funcional
const equipment = {
  tipo: 'equipo-medico',
  descripcion: 'Monitor Cardíaco',
  claveHRAEI: 'EC001'
}

const inventoryData = {
  'EC001': {
    funcional: false,
    mantenimiento: 'correctivo'
  }
}

const warnings = getItemWarnings(equipment, inventoryData)
// Resultado: 2 warnings (no funcional + en mantenimiento correctivo)
```
