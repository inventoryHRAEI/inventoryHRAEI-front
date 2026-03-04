<template>
  <Teleport to="body">
    <Transition name="wizard-fade">
      <div v-if="visible" class="wizard-overlay" @click.self="closeWizard">
        <div class="wizard-modal">
            <!-- added padding and larger width -->
          <!-- Header -->
          <header class="wizard-header">
            <div class="header-title">
              <VueIcon name="fa-tools" class="header-icon" />
              <div>
                <h3>Registro de Mantenimiento</h3>
                <p class="header-subtitle">{{ inventoryNo }}</p>
              </div>
            </div>
            <button @click="closeWizard" class="close-btn">
              <VueIcon name="io-close" />
            </button>
          </header>

          <!-- Progress Steps / Flow Status -->
          <div class="wizard-steps" v-if="!flowStatus.in_progress && form.mode !== 'completed'">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              :class="['step', { active: currentStep === index, completed: currentStep > index }]"
            >
              <div class="step-number">{{ currentStep > index ? '✓' : index + 1 }}</div>
              <VueIcon :name="getStepIcon(step.id)" class="step-icon" />
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>

          <!-- Banner de Mantenimiento en Progreso -->
          <div v-if="flowStatus.in_progress" class="flow-status-banner in-progress">
            <div class="banner-icon">
              <VueIcon name="fa-spinner" class="spinning" />
            </div>
            <div class="banner-content">
              <h4>🔧 Mantenimiento en Progreso</h4>
              <p>Tipo: <strong>{{ getMaintenanceTypeLabel(flowStatus.in_progress.maintenance_type) }}</strong></p>
              <p>Iniciado por: <strong>{{ flowStatus.in_progress.started_by }}</strong></p>
              <p class="banner-date">{{ formatDate(flowStatus.in_progress.started_at) }}</p>
            </div>
          </div>

          <!-- Step Content -->
          <div class="wizard-body">
            <!-- Vista de Mantenimiento en Progreso: Solo Terminar -->
            <div v-if="flowStatus.in_progress" class="step-content">
              <h4 class="step-title">Terminar Mantenimiento</h4>
              <p class="flow-description">
                Este equipo tiene un mantenimiento en curso. Completa los datos para terminarlo.
              </p>

              <div class="form-group">
                <label>Estado Final del Equipo</label>
                <div class="status-options">
                  <label :class="['status-option', { selected: finishForm.result_status === 'functional' }]">
                    <input type="radio" value="functional" v-model="finishForm.result_status" class="hidden-input" />
                    <VueIcon name="bi-check-circle-fill" class="status-icon functional" />
                    <span>Funcional</span>
                  </label>
                  <label :class="['status-option', { selected: finishForm.result_status === 'non_functional' }]">
                    <input type="radio" value="non_functional" v-model="finishForm.result_status" class="hidden-input" />
                    <VueIcon name="bi-x-circle-fill" class="status-icon non-functional" />
                    <span>No Funcional</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Diagnóstico</label>
                <textarea v-model="finishForm.diagnostico" class="form-textarea" placeholder="Describe el diagnóstico realizado..." rows="3"></textarea>
              </div>

              <div class="form-group">
                <label>Causa de Falla (si aplica)</label>
                <textarea v-model="finishForm.causa" class="form-textarea" placeholder="Describe la causa de la falla..." rows="2"></textarea>
              </div>

              <div class="form-group">
                <label>Observaciones / Trabajo Realizado</label>
                <textarea v-model="finishForm.observaciones" class="form-textarea" placeholder="Describe las observaciones, refacciones usadas, etc." rows="4"></textarea>
              </div>

              <div class="form-group">
                <label>Fecha de inicio real</label>
                <input type="date" v-model="finishForm.started_at" class="form-input" :max="today" />
              </div>
              <div class="form-group">
                <label>Fecha de finalización</label>
                <input type="date" v-model="finishForm.finished_at" class="form-input" :max="today" />
              </div>
              <div class="form-group">
                <label>Terminado por (nombre)</label>
                <input type="text" v-model="finishForm.finished_by" class="form-input" placeholder="Nombre de quien termina el mantenimiento" />
              </div>

              <div class="form-group">
                <label>Ubicación de Retorno</label>
                <input type="text" v-model="finishForm.return_location" class="form-input" placeholder="Ej: Biomedica, Emergencias, etc." />
              </div>
              <div class="form-group">
                <label>Área Final (si difiere)</label>
                <input type="text" v-model="finishForm.final_area" class="form-input" placeholder="Ej: Biomedica sección A" />
              </div>

              <!-- Resumen antes de finalizar -->
              <div class="finish-summary">
                <h5>Resumen de Finalización</h5>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">Duración:</span>
                    <span class="summary-value">{{ getMaintenanceDuration() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Estado:</span>
                    <span :class="['summary-value', finishForm.result_status === 'functional' ? 'functional' : 'non-functional']">
                      {{ finishForm.result_status === 'functional' ? '✅ FUNCIONAL' : '❌ NO FUNCIONAL' }}
                    </span>
                  </div>
                </div>
              </div>
              </div>

            <!-- Step 1: Modo de flujo (programado o inmediato) -->
            <div v-else-if="currentStep === 0" class="step-content">
              <h4 class="step-title">¿Programar o iniciar ahora?</h4>
              <div class="form-group">
                <label class="radio-option">
                  <input type="radio" value="immediate" v-model="form.mode" />
                  Iniciar mantenimiento inmediatamente
                </label>
                <label class="radio-option">
                  <input type="radio" value="scheduled" v-model="form.mode" />
                  Programar mantenimiento (fecha opcional)
                </label>
                <label class="radio-option">
                  <input type="radio" value="completed" v-model="form.mode" />
                  Registrar mantenimiento <strong>ya completado</strong>
                </label>
              </div>
              <div v-if="form.mode === 'scheduled'" class="form-group">
                <label>Fecha prevista</label>
                <input type="date" v-model="form.planned_date" class="form-input" :min="today" />
              </div>
              
              <h4 class="step-title">Selecciona el Tipo de Mantenimiento</h4>
              <div class="maintenance-types">
                <label 
                  v-for="type in maintenanceTypes" 
                  :key="type.value"
                  :class="['type-card', { selected: form.maintenance_type === type.value }]"
                >
                  <input 
                    type="radio" 
                    :value="type.value" 
                    v-model="form.maintenance_type"
                    class="hidden-input"
                  />
                  <VueIcon :name="type.icon" class="type-icon" />
                  <span class="type-label">{{ type.label }}</span>
                  <span class="type-desc">{{ type.description }}</span>
                </label>
              </div>

              <div class="form-group">
                <label>Fecha del Mantenimiento</label>
                <input 
                  type="date" 
                  v-model="form.fecha" 
                  class="form-input"
                  :max="today"
                />
              </div>
            </div>

            <!-- Step 2: Diagnóstico -->
            <div v-if="currentStep === 1" class="step-content">
              <h4 class="step-title">Detalles adicionales</h4>

              <div class="form-group">
                <label>¿Mantenimiento interno o con proveedor externo?</label>
                <select v-model="form.provider_type" class="form-input">
                  <option value="internal">Interno</option>
                  <option value="external">Proveedor externo</option>
                </select>
              </div>
              <div v-if="form.provider_type === 'external'" class="form-group">
                <label>Nombre de la empresa</label>
                <input type="text" v-model="form.provider_name" class="form-input" placeholder="Empresa de mantenimiento" />
              </div>
              <div class="form-group">
                <label>Ubicación de retorno / área destino</label>
                <input type="text" v-model="form.return_location" class="form-input" placeholder="Ej: Biomedica, Emergencias" />
              </div>
            </div>

            <div v-if="currentStep === 2" class="step-content">
              <h4 class="step-title">Diagnóstico y Estado del Equipo</h4>
              
              <div class="form-group">
                <label>Estado Final del Equipo</label>
                <div class="status-options">
                  <label 
                    :class="['status-option', { selected: form.status === 'functional' }]"
                  >
                    <input 
                      type="radio" 
                      value="functional" 
                      v-model="form.status"
                      class="hidden-input"
                    />
                    <VueIcon name="bi-check-circle-fill" class="status-icon functional" />
                    <span>Funcional</span>
                  </label>
                  <label 
                    :class="['status-option', { selected: form.status === 'non_functional' }]"
                  >
                    <input 
                      type="radio" 
                      value="non_functional" 
                      v-model="form.status"
                      class="hidden-input"
                    />
                    <VueIcon name="bi-x-circle-fill" class="status-icon non-functional" />
                    <span>No Funcional</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Diagnóstico</label>
                <textarea 
                  v-model="form.diagnostico" 
                  class="form-textarea"
                  placeholder="Describe el diagnóstico realizado..."
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Causa de Falla (si aplica)</label>
                <textarea 
                  v-model="form.causa" 
                  class="form-textarea"
                  placeholder="Describe la causa de la falla si el equipo no funcionaba..."
                  rows="2"
                ></textarea>
              </div>
            </div>

            <!-- Step 3: Observaciones -->
            <div v-if="currentStep === 3" class="step-content">
              <h4 class="step-title">Observaciones y Trabajo Realizado</h4>
              
              <div class="form-group">
                <label>Observaciones</label>
                <textarea 
                  v-model="form.observaciones" 
                  class="form-textarea"
                  placeholder="Describe las observaciones, trabajos realizados, refacciones usadas, etc."
                  rows="4"
                ></textarea>
              </div>

              <!-- Resumen del mantenimiento -->
              <div class="maintenance-summary">
                <h5>Resumen del Mantenimiento</h5>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">Tipo:</span>
                    <span class="summary-value">{{ getMaintenanceTypeLabel(form.maintenance_type) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Fecha:</span>
                    <span class="summary-value">{{ form.fecha || 'No especificada' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Estado:</span>
                    <span :class="['summary-value', form.status === 'functional' ? 'functional' : 'non-functional']">
                      {{ form.status === 'functional' ? 'Funcional' : 'No Funcional' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="wizard-footer">
            <!-- Si hay mantenimiento en progreso: solo botón Terminar -->
            <template v-if="flowStatus.in_progress">
              <button @click="handleFinishMaintenance" class="btn btn-success" :disabled="saving">
                <span v-if="saving">Guardando...</span>
                <span v-else>
                  <VueIcon name="fa-check-circle" />
                  Terminar Mantenimiento
                </span>
              </button>
            </template>
            
            <!-- Si no hay mantenimiento en progreso: flujo normal -->
            <template v-else>
              <button 
                v-if="currentStep > 0" 
                @click="prevStep" 
                class="btn btn-secondary"
              >
                <VueIcon name="fa-arrow-left" />
                Anterior
              </button>
              <div class="footer-spacer"></div>
              <button @click="closeWizard" class="btn btn-cancel">
                Cancelar
              </button>
              <button 
                v-if="currentStep < steps.length - 1" 
                @click="nextStep" 
                class="btn btn-primary"
                :disabled="!canProceed"
              >
                Siguiente
                <VueIcon name="fa-arrow-right" />
              </button>
              <button 
                v-else 
                @click="submitMaintenance" 
                class="btn btn-success"
                :disabled="saving"
              >
                <span v-if="saving">Guardando...</span>
                <span v-else>
                  <VueIcon name="fa-save" />
                  Registrar Mantenimiento
                </span>
              </button>
            </template>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { registerMaintenance, startMaintenance, finishMaintenance, getMaintenanceFlowStatus } from '@/services/equipmentStatusService.js'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import Swal from 'sweetalert2'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  inventoryNo: {
    type: String,
    default: ''
  },
  equipmentName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'saved'])

// new first step to choose scheduling mode
const steps = [
  { id: 'mode', label: 'Modo' },
  { id: 'type', label: 'Tipo' },
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'observations', label: 'Observaciones' }
]

const maintenanceTypes = [
  { 
    value: 'MP', 
    label: 'Mantenimiento Preventivo', 
    icon: 'fa-shield-alt',
    description: 'Revisión programada sin falla reportada'
  },
  { 
    value: 'MC', 
    label: 'Mantenimiento Correctivo', 
    icon: 'fa-wrench',
    description: 'Reparación por falla reportada'
  },
  { 
    value: 'MC-PENDIENTE', 
    label: 'MC Pendiente', 
    icon: 'fa-clock',
    description: 'Falla que requiere refacciones'
  }
]

const currentStep = ref(0)
const saving = ref(false)
const loadingStatus = ref(false)

// Estado del flujo de mantenimiento
const flowStatus = ref({
  in_progress: null,
  last_completed: null,
  history: []
})

const today = new Date().toISOString().split('T')[0]

const form = ref({
  mode: 'immediate',           // immediate or scheduled
  maintenance_type: 'MP',
  fecha: today,                // planned or actual start
  status: 'functional',
  diagnostico: '',
  causa: '',
  observaciones: '',
  provider_type: 'internal',   // internal or external
  provider_name: '',           // if external
  planned_date: ''             // for scheduling reference
})

// Formulario para iniciar mantenimiento
const startForm = ref({
  maintenance_type: 'MP',
  notes: '',
  started_by: ''
})

// Formulario para terminar mantenimiento
const finishForm = ref({
  result_status: 'functional',
  diagnostico: '',
  causa: '',
  observaciones: '',
  finished_by: '',
  started_at: '',
  finished_at: '',
  return_location: '',
  final_area: ''        // new field for area where equipo queda
})

// Modo del wizard: 'new' | 'start' | 'finish'
const wizardMode = ref('new')

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    // must choose a mode
    if (!form.value.mode) return false
    // if user selects 'completed', we can move straight to finish flow
    return true
  }
  if (currentStep.value === 1) {
    // for normal flows, step1 (provider/area) requires nothing special
    return true
  }
  return true
})

// Cargar estado del flujo cuando se abre el wizard
watch(() => props.visible, async (newVal) => {
  if (newVal && props.inventoryNo) {
    await loadFlowStatus()
  }
})

async function loadFlowStatus() {
  if (!props.inventoryNo) return
  loadingStatus.value = true
  try {
    flowStatus.value = await getMaintenanceFlowStatus(props.inventoryNo)
  } catch (e) {
    console.error('Error loading flow status:', e)
  } finally {
    loadingStatus.value = false
  }
}

function getMaintenanceTypeLabel(type) {
  const found = maintenanceTypes.find(t => t.value === type)
  return found ? found.label : type
}

function formatDate(dateString) {
  if (!dateString) return 'Sin fecha'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch (e) {
    return String(dateString)
  }
}

function getMaintenanceDuration() {
  if (!flowStatus.value?.in_progress?.started_at) return 'N/A'
  try {
    const startTime = new Date(flowStatus.value.in_progress.started_at)
    const now = new Date()
    const diffMs = now - startTime
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  } catch (e) {
    return 'N/A'
  }
}

function setWizardMode(mode) {
  wizardMode.value = mode
}

function getStepIcon(id) {
  switch(id) {
    case 'mode': return 'fa-list-ul'
    case 'type': return 'fa-wrench'
    case 'diagnosis': return 'fa-stethoscope'
    case 'observations': return 'fa-clipboard'
    default: return 'fa-circle'
  }
}

function nextStep() {
  if (!canProceed.value) return
  // if user chose completed at start, jump to finish view
  if (currentStep.value === 0 && form.value.mode === 'completed') {
    // set a flag so finish UI shows instead of steps
    flowStatus.value.in_progress = { dummy: true }
    return
  }
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function closeWizard() {
  currentStep.value = 0
  wizardMode.value = 'new'
  form.value = {
    maintenance_type: 'MP',
    fecha: today,
    status: 'functional',
    diagnostico: '',
    causa: '',
    observaciones: ''
  }
  emit('close')
}

// INICIAR un mantenimiento
async function handleStartMaintenance() {
  if (!props.inventoryNo) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se ha proporcionado el número de inventario' })
    return
  }

  const { value: confirm } = await Swal.fire({
    title: 'Iniciar Mantenimiento',
    html: `
      <div style="text-align: left; margin-bottom: 10px;">
        <p style="color: #94a3b8; margin-bottom: 15px;">¿Estás seguro de que deseas <strong>iniciar</strong> un mantenimiento?</p>
        <div style="background: rgba(59,130,246,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
          <strong style="color: #3b82f6;">Tipo:</strong> ${getMaintenanceTypeLabel(startForm.value.maintenance_type)}<br>
          <strong style="color: #3b82f6;">Iniciado por:</strong> ${startForm.value.started_by || 'No especificado'}
        </div>
        <p style="color: #ef4444; font-size: 0.9rem;">⚠️ El equipo quedará marcado como "en mantenimiento" y no podrá usarse en órdenes hasta que se termine.</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, Iniciar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6'
  })

  if (!confirm) return

  saving.value = true
  try {
    const result = await startMaintenance(props.inventoryNo, {
      maintenance_type: startForm.value.maintenance_type,
      notes: startForm.value.notes,
      started_by: startForm.value.started_by
    })

    await loadFlowStatus()
    
    Swal.fire({
      icon: 'success',
      title: '✅ Mantenimiento Iniciado',
      html: `
        <div style="text-align: left;">
          <p>El mantenimiento ha sido <strong>iniciado</strong> exitosamente.</p>
          <p style="color: #10b981; margin-top: 10px;">🎯 <strong>ID:</strong> #${result.maintenance_id}</p>
          <p style="color: #94a3b8; font-size: 0.9rem;">Puedes terminarlo más tarde cuando completes el trabajo.</p>
        </div>
      `
    })

    emit('saved', result)
    setWizardMode('new')
  } catch (error) {
    console.error('Error starting maintenance:', error)
    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo iniciar el mantenimiento' })
  } finally {
    saving.value = false
  }
}

// TERMINAR un mantenimiento
async function handleFinishMaintenance() {
  if (!props.inventoryNo) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se ha proporcionado el número de inventario' })
    return
  }

  saving.value = true
  try {
    const result = await finishMaintenance(props.inventoryNo, {
      result_status: finishForm.value.result_status,
      diagnostico: finishForm.value.diagnostico,
      causa: finishForm.value.causa,
      observaciones: finishForm.value.observaciones,
      finished_by: finishForm.value.finished_by,
      return_location: finishForm.value.return_location,
      final_area: finishForm.value.final_area
    })

    await loadFlowStatus()
    
    const statusText = finishForm.value.result_status === 'functional' 
      ? '<span style="color: #10b981;">✅ FUNCIONAL</span>' 
      : '<span style="color: #ef4444;">❌ NO FUNCIONAL</span>'

    Swal.fire({
      icon: 'success',
      title: '✅ Mantenimiento Completado',
      html: `
        <div style="text-align: left;">
          <p>El mantenimiento ha sido <strong>finalizado</strong> exitosamente.</p>
          <div style="background: ${finishForm.value.result_status === 'functional' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; padding: 10px; border-radius: 8px; margin: 10px 0;">
            <strong>Resultado:</strong> ${statusText}
          </div>
          <p style="color: #94a3b8; font-size: 0.9rem;">El equipo ahora está disponible para usarse en órdenes.</p>
        </div>
      `
    })

    emit('saved', result)
    setWizardMode('new')
  } catch (error) {
    console.error('Error finishing maintenance:', error)
    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo terminar el mantenimiento' })
  } finally {
    saving.value = false
  }
}

async function submitMaintenance() {
  if (!props.inventoryNo) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se ha proporcionado el número de inventario'
    })
    return
  }

  saving.value = true
  
  try {
    // build payload, adding optional start/finish dates
    const payload = {
      maintenance_type: form.value.maintenance_type,
      fecha: form.value.fecha,
      planned_date: form.value.planned_date || null,
      mode: form.value.mode,
      provider_type: form.value.provider_type,
      provider_name: form.value.provider_name,
      status: form.value.status,
      diagnostico: form.value.diagnostico,
      causa: form.value.causa,
      observaciones: form.value.observaciones,
      return_location: form.value.return_location,
      equipo_medico: props.equipmentName
    }
    if (form.value.mode === 'completed') {
      if (finishForm.value.started_at) payload.started_at = finishForm.value.started_at
      if (finishForm.value.finished_at) payload.finished_at = finishForm.value.finished_at
    }
    const result = await registerMaintenance(props.inventoryNo, payload)

    Swal.fire({
      icon: 'success',
      title: 'Mantenimiento Registrado',
      text: 'El mantenimiento se ha guardado correctamente'
    })

    emit('saved', result)
    // if we just started it immediately, update local state so wizard shows finish UI
    if (form.value.mode === 'immediate') {
      flowStatus.value.in_progress = {
        maintenance_type: form.value.maintenance_type,
        started_at: new Date().toISOString(),
        provider_type: form.value.provider_type,
        provider_name: form.value.provider_name
      }
    }
    // close wizard only if recorded as completed or user chooses
    if (form.value.mode === 'completed') {
      closeWizard()
    }
  } catch (error) {
    console.error('Error registering maintenance:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo registrar el mantenimiento'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.wizard-overlay {
    padding: 40px 20px;
}
.wizard-modal {
    width: 90vw;
    max-width: 1000px;
    max-height: 90vh;
    overflow-y: auto;
}

/* enlarge form groups for comfort */
.form-group {
    margin-bottom: 20px;
}

.wizard-steps .step {
    padding: 12px 16px;
}
.wizard-steps .step-number {
    width: 34px;
    height: 34px;
    line-height: 34px;
    font-size: 1rem;
}
.wizard-steps .step-icon {
    margin-left: 6px;
    font-size: 1.1rem;
    vertical-align: middle;
}
.wizard-steps .step-label {
    font-size: 1rem;
}

/* increase icon sizing within wizard forms */
.status-icon, .type-icon {
    font-size: 22px;
}
.radio-option input {
    margin-right: 8px;
}

/* spacing around finish summary */
.finish-summary {
    margin-top: 24px;
}

</style>
<style scoped>
.wizard-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 20, 40, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.wizard-modal {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.wizard-fade-enter-active,
.wizard-fade-leave-active {
  transition: opacity 0.3s ease;
}

.wizard-fade-enter-from,
.wizard-fade-leave-to {
  opacity: 0;
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(30, 41, 59, 0.5);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  color: #3b82f6;
}

.header-title h3 {
  margin: 0;
  color: #f1f5f9;
  font-size: 1.25rem;
}

.header-subtitle {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.wizard-steps {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px 24px;
  background: rgba(15, 23, 42, 0.8);
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  font-weight: 700;
  font-size: 0.9rem;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

.step.active .step-label {
  color: #3b82f6;
}

.wizard-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
}

.step-content {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-title {
  color: #f1f5f9;
  font-size: 1.1rem;
  margin: 0 0 20px;
}

.maintenance-types {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.type-card:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(30, 41, 59, 0.8);
}

.type-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.type-icon {
  font-size: 28px;
  color: #3b82f6;
}

.type-label {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 1rem;
}

.type-desc {
  color: #94a3b8;
  font-size: 0.85rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.status-options {
  display: flex;
  gap: 12px;
}

.status-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-option:hover {
  border-color: rgba(59, 130, 246, 0.5);
}

.status-option.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.status-icon {
  font-size: 32px;
}

.status-icon.functional {
  color: #10b981;
}

.status-icon.non-functional {
  color: #ef4444;
}

.status-option span {
  color: #f1f5f9;
  font-weight: 500;
}

.maintenance-summary {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.maintenance-summary h5 {
  margin: 0 0 16px;
  color: #f1f5f9;
  font-size: 1rem;
}

.summary-grid {
  display: grid;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.summary-label {
  color: #94a3b8;
}

.summary-value {
  color: #f1f5f9;
  font-weight: 500;
}

.summary-value.functional {
  color: #10b981;
}

.summary-value.non-functional {
  color: #ef4444;
}

.wizard-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: rgba(30, 41, 59, 0.5);
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.footer-spacer {
  flex-grow: 1;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
}

.btn-cancel {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #4b5563;
}

.btn-cancel:hover {
  background: #374151;
  color: #f1f5f9;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Flow Status Banner */
.flow-status-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin: 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.flow-status-banner.in-progress {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-left: 4px solid #8b5cf6;
}

.flow-status-banner.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-left: 4px solid #10b981;
}

.banner-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.2);
}

.banner-icon .spinning {
  animation: spin 1s linear infinite;
  color: #8b5cf6;
  font-size: 24px;
}

.banner-content h4 {
  margin: 0 0 4px;
  color: #f1f5f9;
  font-size: 1rem;
}

.banner-content p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.banner-date {
  color: #8b5cf6 !important;
  font-weight: 500;
  margin-top: 4px !important;
}

.flow-description {
  color: #94a3b8;
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Finish Summary Styles */
.finish-summary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.1);
}

.finish-summary h5 {
  margin: 0 0 16px;
  color: #10b981;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.finish-summary h5::before {
  content: '✓';
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  font-weight: 700;
}

/* Enhanced step-title */
.step-title {
  color: #f1f5f9;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

/* Type Card enhancements */
.type-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(30, 41, 59, 0.3));
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.type-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.type-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.5));
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.type-card:hover::before {
  transform: translateX(100%);
}

.type-card.selected {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1));
  border: 2px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.2), inset 0 0 24px rgba(139, 92, 246, 0.05);
}

.type-icon {
  font-size: 36px;
  color: #3b82f6;
}

.type-label {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 1rem;
}

.type-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
}

/* Enhanced button styles for wizard */
.btn {
  position: relative;
  overflow: hidden;
}

.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.btn:hover::after {
  transform: translateX(100%);
}
</style>
