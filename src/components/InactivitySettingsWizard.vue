<template>
  <div class="inactivity-settings-container">
    <!-- CLOSED STATE: Mostrar configuración actual -->
    <div v-if="!isWizardOpen" class="config-summary">
      <div class="summary-header">
        <div class="header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3>Configuración de Sesión</h3>
        </div>
        <button class="btn-edit" @click="openWizard" title="Editar configuración">
          ✏️ Editar
        </button>
      </div>

      <div class="current-config">
        <div class="config-item">
          <span class="config-label">Estado:</span>
          <span :class="['config-value', inactivityEnabled ? 'active' : 'inactive']">
            {{ inactivityEnabled ? '✓ Activado' : '✕ Desactivado' }}
          </span>
        </div>

        <div v-if="inactivityEnabled" class="config-item">
          <span class="config-label">Tiempo de inactividad:</span>
          <span class="config-value">{{ inactivityMinutes }} minuto(s)</span>
        </div>

        <div v-if="inactivityEnabled" class="config-item">
          <span class="config-label">Advertencia:</span>
          <span class="config-value">60 segundos antes de cerrar</span>
        </div>
      </div>

      <div v-if="!inactivityEnabled" class="warning-box">
        <strong>⚠️ Aviso:</strong> Tu sesión permanecerá abierta indefinidamente. Esto puede ser un riesgo de seguridad.
      </div>
    </div>

    <!-- OPEN STATE: Mostrar wizard -->
    <div v-else class="wizard-container">
      <!-- Wizard Steps -->
      <div class="wizard-steps">
        <button
          v-for="(step, idx) in steps"
          :key="idx"
          :class="['step-indicator', { active: currentStep === idx, completed: currentStep > idx }]"
          @click="goToStep(idx)"
        >
          <span class="step-number">{{ idx + 1 }}</span>
          <span class="step-name">{{ step.title }}</span>
        </button>
      </div>

      <!-- Step Content -->
      <div class="wizard-content">
      <!-- Step 1: ¿Activar o No? -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="step-header">
          <h2>{{ steps[0].title }}</h2>
          <p class="step-subtitle">Elige si deseas que tu sesión se cierre automáticamente por inactividad</p>
        </div>

        <div class="choice-grid">
          <button
            :class="['choice-card', { selected: inactivityEnabled }]"
            @click="inactivityEnabled = true"
          >
            <div class="choice-icon">✓</div>
            <div class="choice-title">Sí, proteger mi sesión</div>
            <div class="choice-description">La sesión se cerrará automáticamente si no hay actividad</div>
          </button>

          <button
            :class="['choice-card', { selected: !inactivityEnabled }]"
            @click="inactivityEnabled = false"
          >
            <div class="choice-icon">✕</div>
            <div class="choice-title">No, dejar abierta</div>
            <div class="choice-description">Mi sesión permanecerá abierta indefinidamente</div>
          </button>
        </div>
      </div>

      <!-- Step 2: Tiempo de Inactividad (FIJO) -->
      <div v-if="currentStep === 1 && inactivityEnabled" class="step-content">
        <div class="step-header">
          <h2>{{ steps[1].title }}</h2>
          <p class="step-subtitle">El tiempo de inactividad está fijado en 15 minutos por seguridad</p>
        </div>

        <div class="fixed-time-info">
          <div class="fixed-time-card">
            <div class="fixed-time-icon">⏱️</div>
            <div class="fixed-time-value">15 minutos</div>
            <div class="fixed-time-description">Tiempo fijo de inactividad antes del cierre de sesión</div>
          </div>
        </div>

        <div class="info-box">
          <strong>ℹ️ Nota:</strong> Por políticas de seguridad del sistema, el tiempo de inactividad está fijado en 15 minutos y no puede ser modificado.
        </div>
      </div>

      <!-- Step 3: Confirmación -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="step-header">
          <h2>{{ steps[2].title }}</h2>
          <p class="step-subtitle">Revisa tu configuración</p>
        </div>

        <div class="summary-box">
          <div class="summary-item">
            <span class="summary-label">Cierre automático:</span>
            <span :class="['summary-value', inactivityEnabled ? 'enabled' : 'disabled']">
              {{ inactivityEnabled ? 'Activado' : 'Desactivado' }}
            </span>
          </div>

          <div v-if="inactivityEnabled" class="summary-item">
            <span class="summary-label">Tiempo de inactividad:</span>
            <span class="summary-value">15 minutos (fijo)</span>
          </div>

          <div v-if="inactivityEnabled" class="summary-item">
            <span class="summary-label">Advertencia visible:</span>
            <span class="summary-value">60 segundos antes de cerrar</span>
          </div>
        </div>

        <div v-if="inactivityEnabled" class="how-it-works">
          <h4>Cómo funciona:</h4>
          <ul>
            <li>Si no haces clic, tecleas o te desplazas durante 15 minutos...</li>
            <li>Verás una advertencia en la pantalla con un contador de 60 segundos</li>
            <li>Puedes hacer clic en "Continuar sesión" para seguir trabajando</li>
            <li>Si no haces nada, tu sesión se cerrará automáticamente</li>
            <li>Cualquier actividad (clic, teclado) detiene el contador</li>
          </ul>
        </div>

        <div v-else class="how-it-works warning">
          <h4>⚠️ Atención:</h4>
          <p>
            Sin cierre automático, tu sesión podría quedar abierta indefinidamente. Esto puede ser un riesgo de
            seguridad si dejas tu dispositivo desatendido.
          </p>
        </div>
      </div>
    </div>

      <!-- Buttons -->
      <div class="wizard-buttons">
        <button v-if="currentStep > 0" class="btn secondary" @click="previousStep">← Atrás</button>

        <div style="flex: 1"></div>

        <button class="btn secondary" @click="closeWizard">Cancelar</button>

        <div v-if="saveStatus" :class="['save-status', saveStatus.type]">
          {{ saveStatus.message }}
        </div>

        <button v-if="currentStep < steps.length - 1" class="btn primary" @click="nextStep">
          Siguiente →
        </button>

        <button v-if="currentStep === steps.length - 1" class="btn primary success" @click="saveConfiguration">
          ✓ Guardar Configuración
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import inactivityHandler from '@/utils/inactivityHandler'

const isWizardOpen = ref(false)
const currentStep = ref(0)
const inactivityEnabled = ref(true)
const inactivityMinutes = ref(15) // Fijo en 15 minutos
const saveStatus = ref(null)

const steps = [
  { title: '1. ¿Proteger tu sesión?' },
  { title: '2. Tiempo de inactividad' },
  { title: '3. Confirmación' }
]

// Presets eliminados - tiempo fijo de 15 minutos

onMounted(() => {
  // Cargar valores guardados
  const savedEnabled = localStorage.getItem('inactivityEnabled')
  const savedTimeout = localStorage.getItem('inactivityTimeout')

  if (savedEnabled !== null) {
    inactivityEnabled.value = savedEnabled === 'true'
  }

  if (savedTimeout) {
    inactivityMinutes.value = parseInt(savedTimeout)
  }
})

const openWizard = () => {
  isWizardOpen.value = true
  currentStep.value = 0
}

const closeWizard = () => {
  isWizardOpen.value = false
  saveStatus.value = null
}

const goToStep = (idx) => {
  currentStep.value = idx
}

const previousStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const saveConfiguration = async () => {
  try {
    // Validar (tiempo fijo de 15 minutos)
    if (inactivityMinutes.value !== 15) {
      saveStatus.value = {
        type: 'error',
        message: '❌ Tiempo inválido. El tiempo de inactividad está fijado en 15 minutos.'
      }
      return
    }

    // Guardar en localStorage
    localStorage.setItem('inactivityEnabled', inactivityEnabled.value.toString())
    localStorage.setItem('inactivityTimeout', inactivityMinutes.value.toString())

    // Configurar el handler
    if (inactivityEnabled.value) {
      inactivityHandler.init(inactivityMinutes.value, 30) // 30s de advertencia modal por defecto (simple)
      inactivityHandler.setInactivityThreshold(20) // 20s para detectar inactividad (simple)
      inactivityHandler.setSyncAcrossTabs(true) // siempre sincronizar
      inactivityHandler.setKeepAliveRefresh(true) // siempre refresh
    } else {
      inactivityHandler.destroy()
    }

    saveStatus.value = {
      type: 'success',
      message: '✓ Configuración guardada exitosamente'
    }

    // Cerrar el wizard después de 1.5 segundos
    setTimeout(() => {
      closeWizard()
    }, 1500)
  } catch (error) {
    saveStatus.value = {
      type: 'error',
      message: `❌ Error: ${error.message}`
    }
  }
}
</script>

<style scoped>
.inactivity-settings-container {
  width: 100%;
}

/* CLOSED STATE: Mostrar solo configuración */
.config-summary {
  padding: 20px;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(45, 52, 120, 0.3) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  animation: slideIn 0.3s ease;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.header-title svg {
  color: #667eea;
}

.btn-edit {
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 6px;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-edit:hover {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  transform: translateY(-1px);
}

.current-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.config-value {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.config-value.active {
  color: #86efac;
}

.config-value.inactive {
  color: #fca5a5;
}

.warning-box {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* OPEN STATE: Mostrar wizard */
.wizard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(45, 52, 120, 0.3) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
  animation: slideIn 0.3s ease;
}

/* Steps Indicator */
.wizard-steps {
  display: flex;
  gap: 12px;
  padding: 0 0 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-indicator:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.step-indicator.active {
  background: rgba(102, 126, 234, 0.4);
  border-color: #667eea;
  color: #60a5fa;
}

.step-indicator.completed {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.step-indicator.completed .step-number::before {
  content: '✓';
  position: absolute;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
}

.step-indicator.active .step-number {
  background: #667eea;
  color: white;
}

.step-indicator.completed .step-number {
  background: #22c55e;
  color: white;
}

.step-name {
  white-space: nowrap;
}

/* Content */
.wizard-content {
  min-height: 300px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.step-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Choice Grid (Step 1) */
.choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.choice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.choice-card.selected {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  color: #60a5fa;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.choice-icon {
  font-size: 32px;
  font-weight: 700;
}

.choice-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.choice-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

/* Preset Grid (Step 2) */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.preset-card.active {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  color: #60a5fa;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.preset-icon {
  font-size: 24px;
}

.preset-label {
  font-size: 14px;
  font-weight: 600;
}

.preset-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

/* Info Box */
.info-box {
  padding: 16px;
  background: rgba(102, 126, 234, 0.15);
  border-left: 3px solid #667eea;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Summary Box (Step 3) */
.summary-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.summary-value.enabled {
  color: #86efac;
}

.summary-value.disabled {
  color: #fca5a5;
}

/* How it Works */
.how-it-works {
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
}

.how-it-works.warning {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.how-it-works h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: #60a5fa;
}

.how-it-works.warning h4 {
  color: #fca5a5;
}

.how-it-works ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.how-it-works li {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  line-height: 1.5;
}

.how-it-works li:before {
  content: '✓ ';
  color: #60a5fa;
  margin-right: 8px;
  font-weight: bold;
}

.how-it-works.warning p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

/* Buttons */
.wizard-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn.primary.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Save Status */
.save-status {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.save-status.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.save-status.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Responsive */
@media (max-width: 768px) {
  .wizard-container {
    padding: 16px;
    gap: 16px;
  }

  .wizard-steps {
    flex-wrap: wrap;
  }

  .step-header h2 {
    font-size: 20px;
  }

  .choice-grid,
  .preset-grid {
    grid-template-columns: 1fr;
  }

  .wizard-buttons {
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
