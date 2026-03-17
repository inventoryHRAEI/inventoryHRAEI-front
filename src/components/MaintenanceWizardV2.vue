<template>
    <Teleport to="body">
        <Transition name="wizard-fade">
            <div v-if="visible" class="wizard-overlay" @click.self="closeWizard">
                <div class="wizard-modal">
                    <!-- Header -->
                    <header class="wizard-header">
                        <div class="header-title">
                            <VueIcon name="fa-tools" class="header-icon" />
                            <div>
                                <h3>Gestión de Mantenimiento</h3>
                                <p class="header-subtitle">{{ inventoryNo }} - {{ equipmentName }}</p>
                            </div>
                        </div>
                        <button @click="closeWizard" class="close-btn">
                            <VueIcon name="io-close" />
                        </button>
                    </header>

                    <!-- Estado actual del equipo -->
                    <div v-if="currentMaintenanceStatus" class="status-banner"
                        :class="`status-${currentMaintenanceStatus.state}`">
                        <div class="status-icon-large">
                            <VueIcon :name="getStatusIcon(currentMaintenanceStatus.state)"
                                :class="{ 'spinning': currentMaintenanceStatus.state === 'in_progress' }" />
                        </div>
                        <div class="status-info">
                            <h4>
                                <VueIcon :name="getStatusIcon(currentMaintenanceStatus.state)"
                                    class="status-title-icon" />
                                {{ getStatusTitle(currentMaintenanceStatus.state) }}
                            </h4>
                            <div class="status-details">
                                <p v-if="currentMaintenanceStatus.started_at">
                                    <VueIcon name="fa-calendar" class="detail-icon" />
                                    <strong>Iniciado:</strong> {{ formatDate(currentMaintenanceStatus.started_at) }}
                                </p>
                                <p v-if="currentMaintenanceStatus.started_by">
                                    <VueIcon name="fa-building" class="detail-icon" />
                                    <strong>Empresa:</strong> {{ currentMaintenanceStatus.started_by }}
                                </p>
                                <p v-if="currentMaintenanceStatus.maintenance_type">
                                    <VueIcon name="fa-tools" class="detail-icon" />
                                    <strong>Tipo:</strong> {{
                                        getMaintenanceTypeLabel(currentMaintenanceStatus.maintenance_type) }}
                                </p>
                                <!-- new start info fields -->
                                <p v-if="currentMaintenanceStatus.routine_preventive">
                                    <VueIcon name="fa-list" class="detail-icon" />
                                    Rutina de mantenimiento preventivo: Sí
                                </p>
                                <p v-if="currentMaintenanceStatus.simulator_tests">
                                    <VueIcon name="fa-laptop" class="detail-icon" />
                                    Pruebas con simuladores: Sí
                                </p>
                                <p v-if="currentMaintenanceStatus.analyzer_tests">
                                    <VueIcon name="fa-vials" class="detail-icon" />
                                    Pruebas con analizador de seguridad: Sí
                                </p>
                                <p v-if="currentMaintenanceStatus.folio_inicio">
                                    <VueIcon name="fa-file-alt" class="detail-icon" />
                                    <strong>Folio:</strong> {{ currentMaintenanceStatus.folio_inicio }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Contenido del wizard -->
                    <div class="wizard-body">
                        <!-- Si hay mantenimiento en progreso: Opción para terminar -->
                        <div v-if="currentMaintenanceStatus && currentMaintenanceStatus.state === 'in_progress'"
                            class="wizard-step">
                            <h4 class="step-title">
                                <VueIcon name="fa-check-circle" class="step-icon" />
                                Finalizar Mantenimiento
                            </h4>
                            <p class="step-description">Completa los datos para finalizar este mantenimiento</p>

                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-clipboard-check" class="label-icon" />
                                    Estado Final del Equipo
                                </label>
                                <div class="status-selector">
                                    <label
                                        :class="['status-card', { selected: finishForm.result_status === 'functional' }]">
                                        <input type="radio" value="functional" v-model="finishForm.result_status" />
                                        <VueIcon name="bi-check-circle-fill" class="card-icon functional" />
                                        <span>Funcional</span>
                                    </label>
                                    <label
                                        :class="['status-card', { selected: finishForm.result_status === 'partial' }]">
                                        <input type="radio" value="partial" v-model="finishForm.result_status" />
                                        <VueIcon name="bi-exclamation-circle-fill" class="card-icon warning" />
                                        <span>Parcialmente Funcional</span>
                                    </label>
                                    <label
                                        :class="['status-card', { selected: finishForm.result_status === 'non_functional' }]">
                                        <input type="radio" value="non_functional" v-model="finishForm.result_status" />
                                        <VueIcon name="bi-x-circle-fill" class="card-icon non-functional" />
                                        <span>No Funcional</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-user" class="label-icon" />
                                    Responsable (Ingeniero)
                                </label>
                                <input v-model="finishForm.finished_by" type="text" class="form-input"
                                    placeholder="Nombre del ingeniero responsable" />
                            </div>

                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-comment-dots" class="label-icon" />
                                    Observaciones / Trabajo Realizado
                                </label>
                                <textarea v-model="finishForm.observaciones" class="form-textarea"
                                    placeholder="Describe el trabajo realizado, refacciones, etc..."
                                    rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-image" class="label-icon" />
                                    Imágenes (opcional)
                                </label>
                                <input type="file" class="form-input" multiple
                                    @change="handleImageUpload($event, 'finish')" />
                            </div>

                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-map-marker-alt" class="label-icon" />
                                    Ubicación de Retorno
                                </label>
                                <input v-model="finishForm.return_location" type="text" class="form-input"
                                    placeholder="Ej: Biomedica, Emergencias, Cardiología" />
                            </div>

                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-calendar-check" class="label-icon" />
                                    Fecha de Finalización
                                </label>
                                <input v-model="finishForm.finished_at" type="date" class="form-input" :max="today" />
                            </div>
                            <div class="form-group">
                                <label>
                                    <VueIcon name="fa-clock" class="label-icon" />
                                    Horas Invertidas
                                </label>
                                <input v-model.number="finishForm.hours" type="number" step="0.5" min="0" class="form-input" placeholder="0.0" />
                                <p v-if="!finishForm.hours" class="form-error">Obligatorio</p>
                            </div>

                            <!-- Moved additional questionnaire to finish step -->
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(59, 130, 246, 0.2);">
                                <h4 class="step-title">Información Adicional</h4>
                                <div class="form-group checkbox-group">
                                    <label><input type="checkbox" v-model="finishForm.routine_preventive" /> Rutina de mantenimiento preventivo</label>
                                    <label><input type="checkbox" v-model="finishForm.simulator_tests" /> Pruebas con simuladores</label>
                                    <label><input type="checkbox" v-model="finishForm.analyzer_tests" /> Pruebas con analizador de seguridad</label>
                                </div>
                                <p v-if="!finishForm.routine_preventive && !finishForm.simulator_tests && !finishForm.analyzer_tests" class="form-error">Debes seleccionar al menos una prueba realizada</p>
                                <!-- other validations (hours/folio/tech) are required via canFinish but not shown here -->
                                <div class="form-group" v-if="['preventive','corrective','MP','MC'].includes(currentMaintenanceStatus?.maintenance_type) || ['preventive','corrective'].includes(startForm.maintenance_type)">
                                    <label>
                                        <VueIcon name="fa-file-alt" class="label-icon" />
                                        Folio de mantenimiento
                                    </label>
                                    <input v-model="finishForm.folio_inicio" type="text" class="form-input"
                                        placeholder="Ingrese el folio correspondiente" />
                                    <p v-if="!finishForm.folio_inicio" class="form-error">Obligatorio</p>
                                </div>
                            </div>
                        </div>

                        <!-- Si NO hay mantenimiento: Opción para iniciar -->
                        <div v-else class="wizard-step">
                            <h4 class="step-title">Iniciar Nuevo Mantenimiento</h4>
                            <p class="step-description">Selecciona el tipo y datos del mantenimiento</p>

                            <div class="form-group">
                                <label>Tipo de Mantenimiento</label>
                                <div class="maintenance-types-grid">
                                    <label v-for="type in maintenanceTypes" :key="type.value"
                                        :class="['type-card', { selected: startForm.maintenance_type === type.value }]">
                                        <input type="radio" :value="type.value" v-model="startForm.maintenance_type" />
                                        <VueIcon :name="type.icon" class="type-icon" />
                                        <span class="type-label">{{ type.label }}</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>¿Interno o con Proveedor?</label>
                                <select v-model="startForm.provider_type" class="form-input">
                                    <option value="internal">Interno</option>
                                    <option value="external">Proveedor externo</option>
                                </select>
                            </div>

                            <div v-if="startForm.provider_type === 'external'" class="form-group">
                                <label>Nombre de la Empresa</label>
                                <input v-model="startForm.started_by" type="text" class="form-input"
                                    placeholder="Empresa responsable del mantenimiento" />
                            </div>

                            <div class="form-group">
                                <label>Fecha del Mantenimiento</label>
                                <input v-model="startForm.started_at" type="date" class="form-input" :max="today" />
                            </div>

                            <div class="form-group">
                                <label>Observaciones Iniciales</label>
                                <textarea v-model="startForm.observaciones" class="form-textarea"
                                    placeholder="Describe el estado inicial del equipo, síntomas, etc..."
                                    rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Imágenes (opcional)</label>
                                <input type="file" class="form-input" multiple
                                    @change="handleImageUpload($event, 'start')" />
                            </div>

                            <!-- Nueva sección: Información de Garantía y Contrato -->
                            <div
                                style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(59, 130, 246, 0.2);">
                                <h4 class="step-title">Información de Garantía y Contrato</h4>

                                <div class="form-group">
                                    <label>
                                        <VueIcon name="fa-shield-alt" class="label-icon" />
                                        ¿El equipo cuenta con garantía?
                                    </label>
                                    <div class="warranty-options">
                                        <label
                                            :class="['warranty-card', { selected: startForm.has_warranty === true }]">
                                            <input type="radio" :value="true" v-model.lazy="startForm.has_warranty" />
                                            <VueIcon name="bi-check-circle-fill" class="warranty-icon yes" />
                                            <span>Sí</span>
                                        </label>
                                        <label
                                            :class="['warranty-card', { selected: startForm.has_warranty === false }]">
                                            <input type="radio" :value="false" v-model.lazy="startForm.has_warranty" />
                                            <VueIcon name="bi-x-circle-fill" class="warranty-icon no" />
                                            <span>No</span>
                                        </label>
                                    </div>
                                </div>

                                <div v-if="startForm.has_warranty === true" class="form-group">
                                    <label>
                                        <VueIcon name="fa-calendar" class="label-icon" />
                                        Fecha de fin de garantía
                                    </label>
                                    <input v-model="startForm.warranty_end_date" type="date" class="form-input" />
                                    <span
                                        v-if="startForm.warranty_end_date && new Date(startForm.warranty_end_date) < new Date()"
                                        class="warranty-warning">
                                        ⚠️ La garantía ya ha vencido
                                    </span>
                                </div>

                                <div class="form-group">
                                    <label>
                                        <VueIcon name="fa-file-contract" class="label-icon" />
                                        ¿Contrato de mantenimiento?
                                    </label>
                                    <div class="contract-options">
                                        <label
                                            :class="['contract-card', { selected: startForm.maintenance_contract === true }]">
                                            <input type="radio" :value="true"
                                                v-model.lazy="startForm.maintenance_contract" />
                                            <VueIcon name="fa-shield-alt" class="contract-icon preventive" />
                                            <span class="contract-label">Preventivo</span>
                                            <span class="contract-desc">Revisiones periódicas</span>
                                        </label>
                                        <label
                                            :class="['contract-card', { selected: startForm.maintenance_contract === false }]">
                                            <input type="radio" :value="false"
                                                v-model.lazy="startForm.maintenance_contract" />
                                            <VueIcon name="fa-wrench" class="contract-icon corrective" />
                                            <span class="contract-label">Correctivo</span>
                                            <span class="contract-desc">Solo reparaciones</span>
                                        </label>
                                        <label
                                            :class="['contract-card', { selected: startForm.maintenance_contract === null }]">
                                            <input type="radio" :value="null"
                                                v-model.lazy="startForm.maintenance_contract" />
                                            <VueIcon name="bi-dash-circle-fill" class="contract-icon none" />
                                            <span class="contract-label">Ninguno</span>
                                            <span class="contract-desc">Sin contrato</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <footer class="wizard-footer">
                        <button @click="closeWizard" class="btn btn-secondary">
                            Cancelar
                        </button>
                        <button v-if="currentMaintenanceStatus && currentMaintenanceStatus.state === 'in_progress'"
                            @click="handleFinishMaintenance" class="btn btn-success" :disabled="!canFinish || saving">
                            <span v-if="saving">
                                <VueIcon name="fa-spinner" class="spinning" />
                                Guardando...
                            </span>
                            <span v-else>
                                <VueIcon name="fa-check-circle" />
                                Finalizar Mantenimiento
                            </span>
                        </button>
                        <button v-else @click="handleStartMaintenance" class="btn btn-primary"
                            :disabled="!canStart || saving">
                            <span v-if="saving">
                                <VueIcon name="fa-spinner" class="spinning" />
                                Guardando...
                            </span>
                            <span v-else>
                                <VueIcon name="fa-play-circle" />
                                Iniciar Mantenimiento
                            </span>
                        </button>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import Swal from 'sweetalert2'
import { startMaintenance, finishMaintenance, getMaintenanceFlowStatus } from '@/services/equipmentStatusService.js'

const props = defineProps({
    visible: { type: Boolean, default: false },
    inventoryNo: { type: String, default: '' },
    equipmentName: { type: String, default: '' },
    currentStatus: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'close', 'saved', 'maintenance-started', 'maintenance-finished'])

const visible = ref(props.visible)
const saving = ref(false)
const today = new Date().toISOString().split('T')[0]

const maintenanceTypes = [
    { value: 'preventive', label: 'Preventivo (MP)', icon: 'fa-shield-alt' },
    { value: 'corrective', label: 'Correctivo (MC)', icon: 'fa-wrench' }
]

// Estado actual del mantenimiento
const currentMaintenanceStatus = ref(props.currentStatus)

// Formulario para iniciar
const startForm = ref({
    maintenance_type: 'preventive',
    provider_type: 'internal',
    started_by: '',
    started_at: today,
    observaciones: '',
    images: [],
    // existing warranty/contract fields
    has_warranty: null,
    warranty_end_date: '',
    maintenance_contract: null
})

// Formulario para terminar
const finishForm = ref({
    result_status: 'functional',
    observaciones: '',
    return_location: '',
    finished_at: today,
    finished_by: '',
    images: [],
    hours: null,
    routine_preventive: false,
    simulator_tests: false,
    analyzer_tests: false,
    tests: [],
    folio_inicio: ''
})

watch(() => props.visible, async (val) => {
    visible.value = val
    if (val && props.inventoryNo) {
        // Recargar el estado actual desde el servidor para asegurar que la info es correcta
        try {
            console.log('[MaintenanceWizardV2] Loading fresh maintenance status for', props.inventoryNo);
            const freshStatus = await getMaintenanceFlowStatus(props.inventoryNo);
            // Validar que si hay "in_progress", REALMENTE tiene started_at
            if (freshStatus?.in_progress && freshStatus.in_progress.started_at) {
                currentMaintenanceStatus.value = {
                    state: 'in_progress',
                    ...freshStatus.in_progress
                };
                console.log('[MaintenanceWizardV2] In-progress maintenance found, showing finish form');
            } else {
                // No hay mantenimiento válido en progreso
                currentMaintenanceStatus.value = {
                    state: 'idle'
                };
                console.log('[MaintenanceWizardV2] No valid in-progress maintenance, showing start form');
            }
        } catch (e) {
            console.error('[MaintenanceWizardV2] Error loading maintenance status:', e);
            currentMaintenanceStatus.value = {
                state: 'idle'
            };
        }
    }
})

watch(visible, (val) => emit('update:visible', val))

const canStart = computed(() => {
    return startForm.value.maintenance_type &&
        startForm.value.started_at &&
        (startForm.value.provider_type === 'internal' || startForm.value.started_by);
})

const getStatusLabel = (status) => {
    const labels = {
        'functional': '✅ FUNCIONAL',
        'partial': '⚠️ PARCIALMENTE FUNCIONAL',
        'non_functional': '❌ NO FUNCIONAL'
    };
    return labels[status] || status;
};

const canFinish = computed(() => {
    const base = finishForm.value.result_status &&
        finishForm.value.finished_at &&
        finishForm.value.hours !== null && finishForm.value.hours !== '';
    if (!base) return false;
    const hasTest = finishForm.value.routine_preventive || finishForm.value.simulator_tests || finishForm.value.analyzer_tests;
    if (!hasTest) return false;
    
    // Check type of maintenance - either from currentStatus (if finishing) or startForm
    const mType = currentMaintenanceStatus.value?.maintenance_type || startForm.value.maintenance_type;
    const isSpecialType = ['preventive', 'corrective', 'MP', 'MC'].includes(mType);
    
    if (isSpecialType) {
      return !!String(finishForm.value.folio_inicio || '').trim();
    }
    return true;
})

function handleImageUpload(evt, formType) {
    const files = evt.target.files;
    if (!files || !files.length) return;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const data = e.target.result;
            if (formType === 'start') {
                startForm.value.images.push(data);
            } else {
                finishForm.value.images.push(data);
            }
        };
        reader.readAsDataURL(file);
    });
}

function closeWizard(force = false) {
    if (force || window.confirm('¿Está seguro de que desea cerrar el wizard? Se perderán los cambios no guardados.')) {
        visible.value = false
        emit('close')
    }
}

function getStatusIcon(state) {
    if (state === 'in_progress') return 'fa-spinner'
    if (state === 'completed') return 'fa-check-circle'
    return 'fa-tools'
}

function getStatusTitle(state) {
    if (state === 'in_progress') return '🔧 Mantenimiento en Progreso'
    if (state === 'completed') return '✅ Mantenimiento Completado'
    return 'Sin Mantenimiento Activo'
}

function getMaintenanceTypeLabel(type) {
    const t = maintenanceTypes.find(m => m.value === type)
    return t ? t.label : type
}

function formatDate(dateStr) {
    if (!dateStr) return '--'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

async function handleStartMaintenance() {
    if (!canStart.value) return

    saving.value = true
    try {
        const maintenanceType = startForm.value.maintenance_type === 'preventive' ? 'MP' : 'MC'
        const startedBy = startForm.value.provider_type === 'external' ? startForm.value.started_by : 'Internal'

        // capture response so we can read the maintenance_id later
        const data = await startMaintenance(props.inventoryNo, {
            maintenance_type: maintenanceType,
            started_by: startedBy,
            notes: startForm.value.observaciones,
            images: startForm.value.images || [],
            routine_preventive: startForm.value.routine_preventive,
            simulator_tests: startForm.value.simulator_tests,
            analyzer_tests: startForm.value.analyzer_tests,
            folio_inicio: startForm.value.folio_inicio,
            has_warranty: startForm.value.has_warranty,
            warranty_end_date: startForm.value.warranty_end_date || null,
            maintenance_contract: startForm.value.maintenance_contract
        })

        // 1️⃣ Disparar evento global para actualizar banner en el panel
        try {
            window.dispatchEvent(new CustomEvent('equipment:status-updated', {
                detail: { inventoryNo: props.inventoryNo }
            }))
        } catch (e) { }

        // 2️⃣ Recargar el estado del mantenimiento para mostrar el formulario de "Finalizar"
        await new Promise(r => setTimeout(r, 300)); // Pequeño delay para que el servidor procese
        try {
            console.log('[MaintenanceWizardV2] Reloading maintenance status after start');
            const freshStatus = await getMaintenanceFlowStatus(props.inventoryNo);
            if (freshStatus?.in_progress && freshStatus.in_progress.started_at) {
                currentMaintenanceStatus.value = {
                    state: 'in_progress',
                    ...freshStatus.in_progress
                };
                console.log('[MaintenanceWizardV2] Maintenance started, now showing finish form');
            }
        } catch (e) {
            console.error('[MaintenanceWizardV2] Error reloading status:', e);
        }

        saving.value = false

        // 3️⃣ Emitir eventos para actualizar la UI del padre
        emit('maintenance-started', {
            inventoryNo: props.inventoryNo,
            maintenanceId: data?.maintenance_id,
            type: maintenanceType
        })
        // Also emit 'saved' so the parent panel reloads maintenance flow immediately
        emit('saved')

        // 4️⃣ Mostrar confirmación
        await Swal.fire({
            title: '✅ Mantenimiento Iniciado',
            text: `El mantenimiento ${maintenanceType === 'MP' ? 'preventivo' : 'correctivo'} ha sido iniciado correctamente.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            background: 'rgba(13, 20, 35, 0.98)',
            color: 'rgba(255, 255, 255, 0.95)',
            timer: 2000,
            timerProgressBar: true
        })
    } catch (error) {
        console.error('Error:', error)
        saving.value = false
        await Swal.fire({
            title: '❌ Error',
            text: error?.message || 'Error al iniciar el mantenimiento',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            background: 'rgba(13, 20, 35, 0.98)',
            color: 'rgba(255, 255, 255, 0.95)'
        })
    }
}

async function handleFinishMaintenance() {
    if (!canFinish.value) return

    saving.value = true
    try {
        await finishMaintenance(props.inventoryNo, {
            result_status: finishForm.value.result_status,
            observaciones: finishForm.value.observaciones,
            return_location: finishForm.value.return_location,
            finished_by: finishForm.value.finished_by,
            images: finishForm.value.images || [],
            routine_preventive: finishForm.value.routine_preventive,
            simulator_tests: finishForm.value.simulator_tests,
            analyzer_tests: finishForm.value.analyzer_tests,
            folio_inicio: finishForm.value.folio_inicio,
            maintenance_hours: finishForm.value.hours,
            technician_name: finishForm.value.finished_by || '',
            tests: finishForm.value.tests || []
        })

        // 1️⃣ Cerrar modal INMEDIATAMENTE (sin await)
        emit('saved')
        emit('maintenance-finished', {
            inventoryNo: props.inventoryNo,
            result: finishForm.value.result_status
        })
        closeWizard()
        saving.value = false

        // 2️⃣ Disparar evento global para actualizar banner en el panel
        try {
            window.dispatchEvent(new CustomEvent('equipment:status-updated', {
                detail: { inventoryNo: props.inventoryNo }
            }))
        } catch (e) { }

        // 3️⃣ Mostrar confirmación DESPUÉS de que el modal se cerró
        await Swal.fire({
            title: '✅ Mantenimiento Finalizado',
            text: `Estado final: ${getStatusLabel(finishForm.value.result_status)}`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            background: 'rgba(13, 20, 35, 0.98)',
            color: 'rgba(255, 255, 255, 0.95)',
            didOpen: () => {
                // El banner ya se está actualizando en el panel mientras se muestra el alert
            }
        })
    } catch (error) {
        console.error('Error:', error)
        saving.value = false
        await Swal.fire({
            title: '❌ Error',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            background: 'rgba(13, 20, 35, 0.98)',
            color: 'rgba(255, 255, 255, 0.95)'
        })
    }
}
</script>

<style scoped>
.wizard-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    /* must sit above equipment panel overlay (z-index 99999) */
    z-index: 100001;
}

.wizard-modal {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 20px;
    width: 98%;
    max-width: 750px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    animation: wizardSlideUp 0.3s ease;
}

@keyframes wizardSlideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.wizard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-icon {
    font-size: 24px;
    color: #3b82f6;
}

.header-title h3 {
    margin: 0 0 4px 0;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
}

.header-subtitle {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
}

.close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 24px;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #fff;
}

.status-banner {
    display: flex;
    gap: 20px;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.status-banner.status-in_progress {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
    border-left: 5px solid #8b5cf6;
}

.status-banner.status-completed {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%);
    border-left: 5px solid #10b981;
}

.status-icon-large {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%);
    flex-shrink: 0;
    font-size: 28px;
    color: #8b5cf6;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.status-banner.status-completed .status-icon-large {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%);
    color: #10b981;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.status-icon-large .spinning {
    animation: spin 1s linear infinite;
}

.status-info {
    flex: 1;
}

.status-info h4 {
    margin: 0 0 12px 0;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-title-icon {
    font-size: 18px;
    color: #8b5cf6;
}

.status-banner.status-completed .status-title-icon {
    color: #10b981;
}

.status-details {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.status-info p {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 12px;
    border-radius: 6px;
}

.detail-icon {
    font-size: 14px;
    color: #64748b;
}

.wizard-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.wizard-step {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.step-title {
    margin: 0 0 8px 0;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.step-icon {
    font-size: 18px;
    color: #8b5cf6;
}

.step-description {
    margin: 0 0 16px 0;
    color: #94a3b8;
    font-size: 13px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.label-icon {
    font-size: 14px;
    color: #8b5cf6;
}

.form-input,
.form-textarea {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    font-family: inherit;
    transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.5);
}

.status-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.status-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.status-card:hover {
    background: rgba(255, 255, 255, 0.08);
}

.status-card input {
    display: none;
}

.status-card.selected {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.15);
}

.card-icon {
    font-size: 24px;
}

.card-icon.functional {
    color: #10b981;
}

.card-icon.warning {
    color: #f59e0b;
}

.card-icon.non-functional {
    color: #ef4444;
}

.status-card span {
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 600;
}

.maintenance-types-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.type-card:hover {
    background: rgba(255, 255, 255, 0.08);
}

.type-card input {
    display: none;
}

.type-card.selected {
    border-color: rgba(59, 130, 246, 0.6);
    background: rgba(59, 130, 246, 0.15);
}

.type-icon {
    font-size: 24px;
    color: #3b82f6;
}

.type-label {
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.wizard-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid rgba(59, 130, 246, 0.2);
    background: rgba(15, 23, 42, 0.5);
}

.btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.btn-success:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.spinning {
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes wizard-fade {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.wizard-fade-enter-active,
.wizard-fade-leave-active {
    transition: opacity 0.3s ease;
}

.wizard-fade-enter-from,
.wizard-fade-leave-to {
    opacity: 0;
}

/* Warranty Options Styles */
.warranty-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
    margin-top: 12px;
}

.warranty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.warranty-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.4);
}

.warranty-card input {
    display: none;
}

.warranty-card.selected {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.15);
}

.warranty-icon {
    font-size: 20px;
}

.warranty-icon.yes {
    color: #10b981;
}

.warranty-icon.no {
    color: #ef4444;
}

.warranty-card span {
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 600;
}

.warranty-warning {
    display: block;
    margin-top: 8px;
    color: #f59e0b;
    font-size: 12px;
    font-weight: 500;
}

/* Contract Options Styles */
.contract-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 12px;
    margin-top: 12px;
}

.contract-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.contract-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.4);
}

.contract-card input {
    display: none;
}

.contract-card.selected {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.15);
}

.contract-icon {
    font-size: 18px;
}

.contract-icon.preventive {
    color: #3b82f6;
}

.contract-icon.corrective {
    color: #f59e0b;
}

.contract-icon.none {
    color: #6b7280;
}

.contract-label {
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.contract-desc {
    color: #64748b;
    font-size: 10px;
    text-align: center;
}
</style>
