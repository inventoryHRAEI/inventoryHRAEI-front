<!--
  COMPONENTE LISTO PARA USAR
  MaintenanceFormBrutal.vue
  
  Uso:
  <MaintenanceFormBrutal :inventoryNo="'CODE123'" :equipmentName="'Equipo XYZ'" />
  
  ¡HECHO! No necesita configuración.
-->

<template>
    <div class="brutal-maintenance-form">
        <div class="form-card">
            <!-- HEADER -->
            <div class="form-header">
                <h2>Mantenimiento de Equipo</h2>
                <div class="header-info">
                    <span class="label">Código:</span>
                    <span class="value">{{ inventoryNo }}</span>
                </div>
                <div class="header-info">
                    <span class="label">Equipo:</span>
                    <span class="value">{{ equipmentName }}</span>
                </div>
            </div>

            <!-- SECCIÓN: INICIAR -->
            <div v-if="!isInMaintenance" class="form-section start-section">
                <h3>Iniciar Mantenimiento</h3>

                <div class="form-group">
                    <label>Tipo</label>
                    <select v-model="startData.reason" class="form-control">
                        <option value="">-- Seleccionar --</option>
                        <option value="MP">Preventivo</option>
                        <option value="MC">Correctivo</option>
                        <option value="OTRO">Otro</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Proveedor</label>
                    <input v-model="startData.provider" type="text" placeholder="Biomedica Interna"
                        class="form-control" />
                </div>

                <button @click="handleStartMaintenance" :disabled="!startData.reason" class="btn btn-primary btn-block">
                    ▶ Iniciar Mantenimiento
                </button>
            </div>

            <!-- SECCIÓN: FINALIZAR -->
            <div v-else class="form-section finish-section">
                <h3>Finalizar Mantenimiento</h3>

                <div class="alert alert-info">
                    🔧 En mantenimiento desde {{ startTime }}
                </div>

                <div class="form-group">
                    <label>Condición del Equipo</label>
                    <select v-model="finishData.return_condition" name="return_condition"
                        class="form-control condition-select">
                        <option value="">-- Seleccionar --</option>
                        <option value="funcional">Funcional</option>
                        <option value="parcial">Parcialmente Funcional</option>
                        <option value="condicional">Condicionalmente Funcional</option>
                        <option value="no funcional">No Funcional</option>
                    </select>
                </div>

                <!-- PREVIEW DE COLOR EN TIEMPO REAL -->
                <div v-if="expectedColor" class="color-preview" data-color-preview>
                    <div class="preview-content" :class="{ 'dual-color': expectedColor.isDualColor }">
                        <div v-if="expectedColor.isDualColor" class="color-split">
                            <div class="color-half" :style="{ backgroundColor: expectedColor.color1 }"></div>
                            <div class="color-half" :style="{ backgroundColor: expectedColor.color2 }"></div>
                        </div>
                        <div v-else class="color-solid" :style="{ backgroundColor: expectedColor.color }"></div>
                        <div class="preview-text">{{ expectedColor.label }}</div>
                        <span class="preview-icon">{{ expectedColor.icon }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Observaciones</label>
                    <textarea v-model="finishData.observaciones" placeholder="Describe el resultado..."
                        class="form-control" rows="3"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Técnico</label>
                        <input v-model="finishData.technician" type="text" class="form-control" />
                    </div>
                    <div class="form-group">
                        <label>Horas</label>
                        <input v-model.number="finishData.hours" type="number" min="0" step="0.5"
                            class="form-control" />
                    </div>
                </div>

                <div class="form-actions">
                    <button @click="handleFinishMaintenance" :disabled="!finishData.return_condition"
                        class="btn btn-success btn-block">
                        ✓ Finalizar Mantenimiento
                    </button>
                    <button @click="handleCancel" class="btn btn-secondary btn-block">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSemaforoRuleEngine } from '@/composables/useSemaforoRuleEngine.js'
import { useBiomedicalMaintenance } from '@/composables/useBiomedicalMaintenance'

// Props
const props = defineProps({
    inventoryNo: {
        type: String,
        required: true
    },
    equipmentName: {
        type: String,
        required: true
    }
})

// Composables
const { getEquipmentColor } = useSemaforoRuleEngine()
const { onStartMaintenance, onFinishMaintenance } = useBiomedicalMaintenance()

// State
const isInMaintenance = ref(false)
const startTime = ref(null)

const startData = ref({
    reason: '',
    provider: 'Biomedica'
})

const finishData = ref({
    return_condition: '',
    observaciones: '',
    technician: '',
    hours: 0
})

// Computed
const expectedColor = computed(() => {
    const condition = finishData.value.return_condition
    if (!condition) return null

    const conditionLower = condition.toLowerCase()

    // Check if it's a partial/dual color condition
    if (conditionLower === 'parcial' || conditionLower === 'condicional') {
        return {
            isDualColor: true,
            color1: '#22c55e', // Green
            color2: '#f59e0b', // Orange
            label: 'Parcialmente Funcional',
            icon: '🟡'
        }
    }

    const color = COLOR_MAP[conditionLower]
    if (!color) return null

    return {
        isDualColor: false,
        color,
        label: LABEL_MAP[color],
        icon: {
            '#22c55e': '✅',
            '#f59e0b': '⚠️',
            '#ef4444': '❌',
            '#3b82f6': '🔧',
            '#64748b': '❓'
        }[color]
    }
})

// Handlers
async function handleStartMaintenance() {
    try {
        await onStartMaintenance({
            code: props.inventoryNo,
            reason: startData.value.reason,
            provider: startData.value.provider
        })

        // Marcar en la UI como en mantenimiento mientras se persiste
        if (typeof window !== 'undefined' && window.__ITEMS__) {
            const idx = window.__ITEMS__.findIndex(i => String(i['No DE INVENTARIO']).trim().toUpperCase() === String(props.inventoryNo).trim().toUpperCase())
            if (idx !== -1) {
                window.__ITEMS__[idx] = {
                    ...window.__ITEMS__[idx],
                    semaforizacion: { color: '#3b82f6', badge: 'maintenance', label: 'En mantenimiento', icon: '🔧' }
                }
            }
        }
        isInMaintenance.value = true
        startTime.value = new Date().toLocaleTimeString()

        console.log('✅ Mantenimiento iniciado')
    } catch (e) {
        console.error('❌ Error:', e.message)
        alert('Error: ' + e.message)
    }
}

async function handleFinishMaintenance() {
    try {
        const condition = finishData.value.return_condition

        const result = await onFinishMaintenance({
            code: props.inventoryNo,
            return_condition: condition,
            observaciones: finishData.value.observaciones,
            technician: finishData.value.technician,
            hours: finishData.value.hours
        })

        // Actualizar ESTATUS en la tabla directamente
        const statusMap = {
            'funcional': 'OPERATIVO',
            'parcial': 'CONDICIONAL',
            'condicional': 'CONDICIONAL',
            'no funcional': 'FUERA DE SERVICIO'
        }
        const newStatus = statusMap[condition.toLowerCase()] || 'OPERATIVO'

        console.log(`[MaintenanceFormBrutal] Finalizando mantenimiento para ${props.inventoryNo}`)
        console.log(`[MaintenanceFormBrutal] Condición: ${condition}`)
        console.log(`[MaintenanceFormBrutal] Nuevo ESTATUS: ${newStatus}`)

        // Buscar y actualizar en items.value de OpInventarioBiomedica
        if (typeof window !== 'undefined' && window.__ITEMS__) {
            const idx = window.__ITEMS__.findIndex(
                i => String(i['No DE INVENTARIO']).trim().toUpperCase() === String(props.inventoryNo).trim().toUpperCase()
            )
            if (idx !== -1) {
                // ✅ Actualizar ESTATUS
                window.__ITEMS__[idx]['ESTATUS'] = newStatus
                
                // ✅ GUARDAR METADATOS DE SEMAFORIZACIÓN
                const isDualColor = condition.toLowerCase() === 'parcial' || condition.toLowerCase() === 'condicional'
                window.__ITEMS__[idx]['_dualColor'] = isDualColor
                window.__ITEMS__[idx]['_condition'] = condition
                window.__ITEMS__[idx]['_statusUpdateTime'] = Date.now()
                
                // ✅ Forzar que Vue detecte el cambio profundo
                window.__ITEMS__[idx] = { ...window.__ITEMS__[idx] }
                console.log(`✅ ${props.inventoryNo} actualizado:`)
                console.log(`   - ESTATUS: ${newStatus}`)
                console.log(`   - _dualColor: ${isDualColor}`)
                console.log(`   - _condition: ${condition}`)
            } else {
                console.warn(`⚠️ No se encontró equipo ${props.inventoryNo} en window.__ITEMS__`)
            }
        } else {
            console.warn(`⚠️ window.__ITEMS__ no está disponible`)
        }

        // Reset form
        isInMaintenance.value = false
        finishData.value = {
            return_condition: '',
            observaciones: '',
            technician: '',
            hours: 0
        }
        // Consultar el estado calculado por el backend y asignarlo a la UI
        try {
            const sem = await getEquipmentColor(props.inventoryNo)
            if (typeof window !== 'undefined' && window.__ITEMS__) {
                const idx2 = window.__ITEMS__.findIndex(i => String(i['No DE INVENTARIO']).trim().toUpperCase() === String(props.inventoryNo).trim().toUpperCase())
                if (idx2 !== -1) {
                    window.__ITEMS__[idx2] = { ...window.__ITEMS__[idx2], semaforizacion: sem }
                }
            }
        } catch (e) {
            console.warn('[MaintenanceFormBrutal] No se pudo obtener semaforizacion del backend', e)
        }

        // 🔥 EVENTO 1: Disparar evento para refrescar equipo status en cache
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('equipment:status-updated', {
                detail: { 
                    inventoryNo: props.inventoryNo,
                    newStatus: newStatus,
                    condition: condition
                }
            }))
            console.log('📡 Evento equipment:status-updated disparado')
        }

        // 🔥 EVENTO 2: Disparar evento para refrescar UI de semaforización
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ui:refresh-semaforizacion', {
                detail: { 
                    inventoryNo: props.inventoryNo,
                    refreshNeeded: true
                }
            }))
            console.log('📡 Evento ui:refresh-semaforizacion disparado')
        }

        // 🔥 EVENTO 3: Disparar evento para refrescar la tabla al cerrar el modal (compatibilidad)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('maintenance:panel-closed', {
                detail: { 
                    refreshNeeded: true,
                    inventoryNo: props.inventoryNo
                }
            }))
            console.log('📡 Evento maintenance:panel-closed disparado')
        }
    } catch (e) {
        console.error('❌ Error:', e.message)
        alert('Error: ' + e.message)
    }
}

function handleCancel() {
    if (confirm('¿Cancelar mantenimiento?')) {
        isInMaintenance.value = false
        finishData.value = {
            return_condition: '',
            observaciones: '',
            technician: '',
            hours: 0
        }

        // 🔥 Disparar evento para refrescar la tabla al cerrar el modal
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('maintenance:panel-closed', {
                detail: { refreshNeeded: true }
            }))
            console.log('📡 Evento maintenance:panel-closed disparado (cancelado)')
        }
    }
}
</script>

<style scoped>
.brutal-maintenance-form {
    max-width: 500px;
    margin: 0 auto;
}

.form-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.form-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
}

.form-header h2 {
    margin: 0 0 15px;
    font-size: 18px;
}

.header-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 6px;
}

.header-info .label {
    font-weight: 600;
    opacity: 0.8;
}

.form-section {
    padding: 20px;
}

.start-section {
    background: #f0fdf4;
    border-bottom: 2px solid #86efac;
}

.finish-section {
    background: #fef3c7;
    border-bottom: 2px solid #fcd34d;
}

.form-section h3 {
    margin: 0 0 15px;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.alert {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 13px;
}

.alert-info {
    background: #dbeafe;
    border-left: 4px solid #3b82f6;
    color: #1e40af;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
}

.form-control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.color-preview {
    padding: 0;
    border-radius: 6px;
    margin-bottom: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.preview-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    color: white;
    font-weight: 600;
    min-height: 70px;
}

.color-split {
    display: flex;
    gap: 0;
    width: 100%;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
}

.color-half {
    flex: 1;
    transition: all 0.3s ease;
}

.color-solid {
    width: 100%;
    height: 40px;
    border-radius: 4px;
}

.preview-text {
    font-size: 13px;
}

.preview-icon {
    font-size: 24px;
}

.form-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn {
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-success {
    background: #22c55e;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #16a34a;
    box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);
}

.btn-secondary {
    background: #6b7280;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

.btn-block {
    width: 100%;
}

.condition-select {
    border-color: #fcd34d;
}
</style>
