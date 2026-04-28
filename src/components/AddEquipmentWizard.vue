<template>
    <Teleport to="body">
        <Transition name="wizard-fade">
            <div v-if="isOpen" class="wizard-overlay" @click.self="closeWizard">
                <div class="wizard-container glass-panel" @click.stop>
                    <!-- Header -->
                    <div class="wizard-header">
                        <div class="header-content">
                            <div class="header-icon" :class="`step-${currentStep}`">
                                <i :class="getStepIcon()"></i>
                            </div>
                            <div class="header-text">
                                <h2 class="wizard-title">{{ getStepTitle() }}</h2>
                                <p class="wizard-subtitle">{{ getStepDescription() }}</p>
                            </div>
                        </div>
                        <button @click="closeWizard" class="wizard-close-btn" title="Cerrar wizard">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>

                    <!-- Progress Indicator -->
                    <div class="wizard-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                        </div>
                        <div class="progress-steps">
                            <div v-for="step in totalSteps" :key="step" class="progress-dot"
                                :class="{ active: step <= currentStep, completed: step < currentStep }">
                                <span v-if="step < currentStep" class="pi pi-check"></span>
                                <span v-else>{{ step }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Content Area -->
                    <div class="wizard-content">
                        <form @submit.prevent="handleSubmit">
                            <!-- Step 1: Información Básica -->
                            <Transition name="step-slide" mode="out-in">
                                <div v-if="currentStep === 1" key="step-1" class="step-content">
                                    <div class="form-grid">
                                        <div class="form-group full-width">
                                            <label class="form-label">
                                                <i class="pi pi-box"></i> Nombre del Equipo
                                                <span class="required">*</span>
                                            </label>
                                            <input v-model="formData.equipoMedico" type="text" class="form-input"
                                                placeholder="ej. Monitor de Signos Vitales" @keyup.enter="nextStep"
                                                required />
                                            <p class="form-hint">Nombre descriptivo del equipo médico</p>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-tag"></i> Marca
                                                <span class="required">*</span>
                                            </label>
                                            <input v-model="formData.marca" type="text" class="form-input"
                                                placeholder="ej. Philips, Dräger, GE" list="brands-list"
                                                @keyup.enter="nextStep" required />
                                            <datalist id="brands-list">
                                                <option v-for="brand in suggestedBrands" :key="brand" :value="brand" />
                                            </datalist>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-box"></i> Modelo
                                                <span class="required">*</span>
                                            </label>
                                            <input v-model="formData.modelo" type="text" class="form-input"
                                                placeholder="ej. VS-800, Infinity Vista" @keyup.enter="nextStep"
                                                required />
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-id-card"></i> Número de Serie
                                                <span class="required">*</span>
                                            </label>
                                            <input v-model="formData.serie" type="text" class="form-input"
                                                placeholder="ej. 6003323078" @keyup.enter="nextStep" required />
                                        </div>

                                        <div class="form-group full-width">
                                            <label class="form-label">
                                                <i class="pi pi-hashtag"></i> Número de Inventario
                                            </label>
                                            <input v-model="formData.nDeInventario" type="text" class="form-input"
                                                placeholder="Se auto-genera si está vacío" />
                                            <p class="form-hint">Dejar vacío para auto-generar</p>
                                        </div>
                                    </div>
                                </div>
                            </Transition>

                            <!-- Step 2: Ubicación y Estado -->
                            <Transition name="step-slide" mode="out-in">
                                <div v-if="currentStep === 2" key="step-2" class="step-content">
                                    <div class="form-grid">
                                        <div class="form-group full-width">
                                            <label class="form-label">
                                                <i class="pi pi-map-marker"></i> Ubicación Específica
                                                <span class="required">*</span>
                                            </label>
                                            <input v-model="formData.ubicacion" type="text" class="form-input"
                                                placeholder="ej. Pabellón A, Sala de Emergencia" list="locations-list"
                                                @keyup.enter="nextStep" required />
                                            <datalist id="locations-list">
                                                <option v-for="loc in suggestedLocations" :key="loc" :value="loc" />
                                            </datalist>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-info-circle"></i> Estado del Equipo
                                                <span class="required">*</span>
                                            </label>
                                            <select v-model="formData.estatus" class="form-input" required>
                                                <option value="">Selecciona un estado</option>
                                                <option value="Disponible">✓ Disponible</option>
                                                <option value="En Mantenimiento">🔧 En Mantenimiento</option>
                                                <option value="Fuera de Servicio">✗ Fuera de Servicio</option>
                                                <option value="En Reparación">🛠️ En Reparación</option>
                                            </select>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-building"></i> Unidad Médica
                                            </label>
                                            <input v-model="formData.unidadMedica" type="text" class="form-input"
                                                placeholder="ej. HRAEI" list="units-list" />
                                            <datalist id="units-list">
                                                <option v-for="unit in suggestedUnits" :key="unit" :value="unit" />
                                            </datalist>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-calendar"></i> Fecha de Ingreso
                                            </label>
                                            <input v-model="formData.fechaIngreso" type="date" class="form-input" />
                                        </div>
                                    </div>
                                </div>
                            </Transition>

                            <!-- Step 3: Información Adicional -->
                            <Transition name="step-slide" mode="out-in">
                                <div v-if="currentStep === 3" key="step-3" class="step-content">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-barcode"></i> Clave CNIS
                                            </label>
                                            <input v-model="formData.claveCNIS" type="text" class="form-input"
                                                placeholder="ej. 123456789" />
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-link"></i> Referencia
                                            </label>
                                            <input v-model="formData.referencia" type="text" class="form-input"
                                                placeholder="Código de referencia" />
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-inbox"></i> Lote
                                            </label>
                                            <input v-model="formData.lote" type="text" class="form-input"
                                                placeholder="Número de lote" />
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">
                                                <i class="pi pi-shopping-bag"></i> Servicio
                                            </label>
                                            <input v-model="formData.servicio" type="text" class="form-input"
                                                placeholder="ej. Cardiología, Urgencias" list="services-list" />
                                            <datalist id="services-list">
                                                <option v-for="svc in suggestedServices" :key="svc" :value="svc" />
                                            </datalist>
                                        </div>

                                        <div class="form-group full-width">
                                            <label class="form-label">
                                                <i class="pi pi-file-edit"></i> Observaciones
                                            </label>
                                            <textarea v-model="formData.observaciones" class="form-input form-textarea"
                                                placeholder="Notas adicionales sobre el equipo..." rows="4"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </Transition>

                            <!-- Step 4: Resumen y Confirmación -->
                            <Transition name="step-slide" mode="out-in">
                                <div v-if="currentStep === 4" key="step-4" class="step-content">
                                    <div class="summary-container">
                                        <div class="summary-section">
                                            <h3 class="summary-title">
                                                <i class="pi pi-check-circle"></i> Información General
                                            </h3>
                                            <div class="summary-grid">
                                                <div class="summary-item">
                                                    <span class="summary-label">Equipo:</span>
                                                    <span class="summary-value">{{ formData.equipoMedico || '—'
                                                        }}</span>
                                                </div>
                                                <div class="summary-item">
                                                    <span class="summary-label">Marca/Modelo:</span>
                                                    <span class="summary-value">{{ formData.marca }} / {{
                                                        formData.modelo }}</span>
                                                </div>
                                                <div class="summary-item">
                                                    <span class="summary-label">Serie:</span>
                                                    <span class="summary-value">{{ formData.serie || '—' }}</span>
                                                </div>
                                                <div class="summary-item">
                                                    <span class="summary-label">Inventario:</span>
                                                    <span class="summary-value">{{ formData.nDeInventario ||
                                                        'Auto-generado' }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="summary-section">
                                            <h3 class="summary-title">
                                                <i class="pi pi-map-marker"></i> Ubicación y Estado
                                            </h3>
                                            <div class="summary-grid">
                                                <div class="summary-item">
                                                    <span class="summary-label">Ubicación:</span>
                                                    <span class="summary-value">{{ formData.ubicacion || '—' }}</span>
                                                </div>
                                                <div class="summary-item">
                                                    <span class="summary-label">Estado:</span>
                                                    <span class="summary-value status-badge"
                                                        :class="`status-${normalizeStatus(formData.estatus)}`">
                                                        {{ formData.estatus || '—' }}
                                                    </span>
                                                </div>
                                                <div class="summary-item">
                                                    <span class="summary-label">Unidad Médica:</span>
                                                    <span class="summary-value">{{ formData.unidadMedica || '—'
                                                        }}</span>
                                                </div>
                                                <div class="summary-item">
                                                    <span class="summary-label">Servicio:</span>
                                                    <span class="summary-value">{{ formData.servicio || '—' }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="formData.observaciones" class="summary-section">
                                            <h3 class="summary-title">
                                                <i class="pi pi-file-edit"></i> Observaciones
                                            </h3>
                                            <p class="summary-observations">{{ formData.observaciones }}</p>
                                        </div>

                                        <div class="summary-actions">
                                            <button type="button" @click="previousStep" class="btn-secondary">
                                                <i class="pi pi-arrow-left"></i> Atrás
                                            </button>
                                            <button type="submit" class="btn-success" :disabled="isSubmitting">
                                                <i v-if="!isSubmitting" class="pi pi-check"></i>
                                                <i v-else class="pi pi-spin pi-spinner"></i>
                                                {{ isSubmitting ? 'Guardando...' : 'Guardar Equipo' }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </form>
                    </div>

                    <!-- Footer con Botones de Navegación -->
                    <div class="wizard-footer">
                        <button v-if="currentStep > 1" type="button" @click="previousStep" class="btn-secondary">
                            <i class="pi pi-arrow-left"></i> Anterior
                        </button>
                        <div class="footer-spacer"></div>
                        <button v-if="currentStep < totalSteps" type="button" @click="nextStep" class="btn-primary">
                            Siguiente <i class="pi pi-arrow-right"></i>
                        </button>
                        <button v-else type="button" @click="submitForm" class="btn-success" :disabled="isSubmitting">
                            <i v-if="!isSubmitting" class="pi pi-check"></i>
                            <i v-else class="pi pi-spin pi-spinner"></i>
                            {{ isSubmitting ? 'Guardando...' : 'Registrar Equipo' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    isOpen: Boolean,
    suggestedData: {
        type: Object,
        default: () => ({
            brands: [],
            locations: [],
            units: [],
            services: []
        })
    }
})

const emit = defineEmits(['close', 'submit'])

const currentStep = ref(1)
const totalSteps = 4
const isSubmitting = ref(false)

const formData = ref({
    equipoMedico: '',
    marca: '',
    modelo: '',
    serie: '',
    nDeInventario: '',
    ubicacion: '',
    estatus: 'Disponible',
    unidadMedica: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    claveCNIS: '',
    referencia: '',
    lote: '',
    servicio: '',
    observaciones: ''
})

const suggestedBrands = computed(() => props.suggestedData.brands || [])
const suggestedLocations = computed(() => props.suggestedData.locations || [])
const suggestedUnits = computed(() => props.suggestedData.units || [])
const suggestedServices = computed(() => props.suggestedData.services || [])

const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100)

function getStepIcon() {
    const icons = [
        'pi pi-box',
        'pi pi-map-marker',
        'pi pi-info-circle',
        'pi pi-check-circle'
    ]
    return icons[currentStep.value - 1]
}

function getStepTitle() {
    const titles = [
        'Información Básica',
        'Ubicación y Estado',
        'Detalles Adicionales',
        'Resumen y Confirmación'
    ]
    return titles[currentStep.value - 1]
}

function getStepDescription() {
    const descriptions = [
        'Ingresa el nombre, marca, modelo y número de serie del equipo',
        'Define dónde se ubicará el equipo y su estado actual',
        'Añade información complementaria como clave CNIS y observaciones',
        'Revisa toda la información antes de guardar'
    ]
    return descriptions[currentStep.value - 1]
}

function normalizeStatus(status) {
    if (!status) return 'unknown'
    const s = String(status).toLowerCase().trim()
    if (s.includes('disponible') || s.includes('activo')) return 'available'
    if (s.includes('manten') || s.includes('reparac')) return 'maintenance'
    if (s.includes('fuera') || s.includes('inactivo')) return 'unavailable'
    return 'available'
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep.value < totalSteps) {
            currentStep.value++
        }
    }
}

function previousStep() {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

function validateCurrentStep() {
    if (currentStep.value === 1) {
        return formData.value.equipoMedico.trim() &&
            formData.value.marca.trim() &&
            formData.value.modelo.trim() &&
            formData.value.serie.trim()
    }
    if (currentStep.value === 2) {
        return formData.value.ubicacion.trim() && formData.value.estatus.trim()
    }
    return true
}

function submitForm() {
    if (validateCurrentStep()) {
        handleSubmit()
    }
}

async function handleSubmit() {
    if (!validateCurrentStep()) {
        alert('Por favor completa los campos requeridos')
        return
    }

    isSubmitting.value = true
    try {
        // Emitir datos para ser procesados en el componente padre
        emit('submit', { ...formData.value })

        // Resetear después de envío exitoso
        resetForm()
        closeWizard(true)
    } catch (error) {
        console.error('Error al guardar equipo:', error)
        alert('Error al guardar el equipo. Por favor intenta de nuevo.')
    } finally {
        isSubmitting.value = false
    }
}

function resetForm() {
    formData.value = {
        equipoMedico: '',
        marca: '',
        modelo: '',
        serie: '',
        nDeInventario: '',
        ubicacion: '',
        estatus: 'Disponible',
        unidadMedica: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        claveCNIS: '',
        referencia: '',
        lote: '',
        servicio: '',
        observaciones: ''
    }
    currentStep.value = 1
}

function closeWizard(force = false) {
    if (force || window.confirm('¿Está seguro de que desea cerrar el wizard? Se perderán los cambios no guardados.')) {
        resetForm()
        emit('close')
    }
}

// Escuchar tecla Escape
onMounted(() => {
    const handleKeydown = (e) => {
        if (e.key === 'Escape' && props.isOpen) {
            closeWizard()
        }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   WIZARD CONTAINER & OVERLAY
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 15, 35, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeInOverlay 0.3s ease;
}

@keyframes fadeInOverlay {
    from {
        background: rgba(0, 15, 35, 0);
    }

    to {
        background: rgba(0, 15, 35, 0.7);
    }
}

.wizard-container {
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(10, 30, 60, 0.9) 0%, rgba(20, 50, 90, 0.85) 100%);
    box-shadow:
        0 20px 60px rgba(0, 100, 255, 0.15),
        0 0 40px rgba(0, 150, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    animation: slideInWizard 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInWizard {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-header {
    padding: 30px;
    border-bottom: 1px solid rgba(100, 200, 255, 0.2);
    background: linear-gradient(180deg, rgba(20, 60, 100, 0.4) 0%, transparent 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
}

.header-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(50, 150, 255, 0.1) 100%);
    border: 2px solid rgba(100, 200, 255, 0.4);
    color: #64c8ff;
    transition: all 0.3s ease;
}

.header-icon.step-2 {
    border-color: rgba(100, 200, 255, 0.6);
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.3) 0%, rgba(50, 150, 255, 0.2) 100%);
}

.header-icon.step-3 {
    border-color: rgba(0, 200, 150, 0.6);
    background: linear-gradient(135deg, rgba(0, 200, 150, 0.3) 0%, rgba(0, 150, 100, 0.2) 100%);
    color: #00c896;
}

.header-icon.step-4 {
    border-color: rgba(0, 255, 150, 0.6);
    background: linear-gradient(135deg, rgba(0, 255, 150, 0.3) 0%, rgba(0, 200, 100, 0.2) 100%);
    color: #00ff96;
}

.header-text {
    flex: 1;
}

.wizard-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
}

.wizard-subtitle {
    margin: 5px 0 0 0;
    font-size: 13px;
    color: rgba(200, 220, 255, 0.7);
    letter-spacing: 0.3px;
}

.wizard-close-btn {
    width: 40px;
    height: 40px;
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 50%;
    background: rgba(100, 150, 200, 0.1);
    color: rgba(200, 220, 255, 0.8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.wizard-close-btn:hover {
    background: rgba(100, 200, 255, 0.2);
    border-color: rgba(100, 200, 255, 0.5);
    color: #64c8ff;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS INDICATOR
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-progress {
    padding: 20px 30px;
    background: rgba(10, 30, 60, 0.5);
    border-bottom: 1px solid rgba(100, 200, 255, 0.1);
}

.progress-bar {
    height: 4px;
    background: rgba(100, 200, 255, 0.15);
    border-radius: 2px;
    margin-bottom: 15px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #64c8ff 0%, #00c896 100%);
    transition: width 0.3s ease;
    box-shadow: 0 0 15px rgba(0, 200, 150, 0.4);
}

.progress-steps {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.progress-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(100, 200, 255, 0.1);
    border: 2px solid rgba(100, 200, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(200, 220, 255, 0.6);
    transition: all 0.3s ease;
}

.progress-dot.active {
    background: rgba(100, 200, 255, 0.3);
    border-color: rgba(100, 200, 255, 0.6);
    color: #64c8ff;
    box-shadow: 0 0 15px rgba(100, 200, 255, 0.2);
}

.progress-dot.completed {
    background: rgba(0, 200, 150, 0.3);
    border-color: rgba(0, 200, 150, 0.6);
    color: #00c896;
    box-shadow: 0 0 15px rgba(0, 200, 150, 0.2);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT AREA
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-content {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
}

.step-content {
    animation: fadeInContent 0.3s ease;
}

@keyframes fadeInContent {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(200, 220, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.required {
    color: #ff6b6b;
}

.form-input,
.form-textarea {
    padding: 11px 14px;
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 8px;
    background: rgba(10, 30, 60, 0.6);
    color: #fff;
    font-size: 13px;
    transition: all 0.2s ease;
    font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
    color: rgba(200, 220, 255, 0.4);
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: rgba(100, 200, 255, 0.6);
    background: rgba(20, 50, 100, 0.8);
    box-shadow: 0 0 12px rgba(100, 200, 255, 0.2), inset 0 0 8px rgba(100, 200, 255, 0.05);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.form-hint {
    margin: 2px 0 0 0;
    font-size: 11px;
    color: rgba(200, 220, 255, 0.5);
    font-style: italic;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUMMARY SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

.summary-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.summary-section {
    padding: 18px;
    border-radius: 12px;
    background: rgba(20, 60, 100, 0.4);
    border: 1px solid rgba(100, 200, 255, 0.2);
    transition: all 0.2s ease;
}

.summary-section:hover {
    background: rgba(30, 70, 120, 0.5);
    border-color: rgba(100, 200, 255, 0.4);
}

.summary-title {
    margin: 0 0 15px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #64c8ff;
    letter-spacing: 0.3px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.summary-label {
    font-size: 11px;
    color: rgba(200, 220, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
}

.summary-value {
    font-size: 13px;
    color: #fff;
    font-weight: 500;
    word-break: break-word;
}

.status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    width: fit-content;
}

.status-badge.status-available {
    background: rgba(0, 200, 150, 0.2);
    color: #00ff96;
    border: 1px solid rgba(0, 200, 150, 0.4);
}

.status-badge.status-maintenance {
    background: rgba(255, 160, 0, 0.2);
    color: #ffa800;
    border: 1px solid rgba(255, 160, 0, 0.4);
}

.status-badge.status-unavailable {
    background: rgba(255, 100, 100, 0.2);
    color: #ff6464;
    border: 1px solid rgba(255, 100, 100, 0.4);
}

.summary-observations {
    margin: 0;
    padding: 12px;
    border-radius: 6px;
    background: rgba(10, 30, 60, 0.5);
    color: rgba(200, 220, 255, 0.85);
    font-size: 13px;
    line-height: 1.5;
    border-left: 3px solid #64c8ff;
}

.summary-actions {
    display: flex;
    gap: 12px;
    margin-top: 10px;
    justify-content: flex-end;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════════════════════════════════════ */

.btn-primary,
.btn-secondary,
.btn-success {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.btn-primary {
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.4) 0%, rgba(50, 150, 255, 0.3) 100%);
    color: #64c8ff;
    border: 1px solid rgba(100, 200, 255, 0.5);
}

.btn-primary:hover {
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.6) 0%, rgba(50, 150, 255, 0.5) 100%);
    border-color: rgba(100, 200, 255, 0.8);
    box-shadow: 0 0 20px rgba(100, 200, 255, 0.3);
}

.btn-secondary {
    background: rgba(100, 150, 200, 0.2);
    color: rgba(200, 220, 255, 0.8);
    border: 1px solid rgba(100, 150, 200, 0.4);
}

.btn-secondary:hover {
    background: rgba(100, 150, 200, 0.3);
    border-color: rgba(100, 150, 200, 0.6);
}

.btn-success {
    background: linear-gradient(135deg, rgba(0, 255, 150, 0.4) 0%, rgba(0, 200, 100, 0.3) 100%);
    color: #00ff96;
    border: 1px solid rgba(0, 255, 150, 0.5);
}

.btn-success:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(0, 255, 150, 0.6) 0%, rgba(0, 200, 100, 0.5) 100%);
    border-color: rgba(0, 255, 150, 0.8);
    box-shadow: 0 0 20px rgba(0, 200, 150, 0.3);
}

.btn-success:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-footer {
    padding: 20px 30px;
    border-top: 1px solid rgba(100, 200, 255, 0.2);
    background: linear-gradient(180deg, transparent 0%, rgba(20, 60, 100, 0.3) 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.footer-spacer {
    flex: 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-fade-enter-active,
.wizard-fade-leave-active {
    transition: opacity 0.2s ease;
}

.wizard-fade-enter-from,
.wizard-fade-leave-to {
    opacity: 0;
}

.step-slide-enter-active,
.step-slide-leave-active {
    transition: opacity 0.2s ease;
}

.step-slide-enter-from,
.step-slide-leave-to {
    opacity: 0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
    .wizard-container {
        width: 95%;
        max-height: 95vh;
    }

    .wizard-header,
    .wizard-content,
    .wizard-footer {
        padding: 20px;
    }

    .header-content {
        gap: 12px;
    }

    .header-icon {
        width: 50px;
        height: 50px;
        font-size: 20px;
    }

    .wizard-title {
        font-size: 18px;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }

    .wizard-footer {
        flex-direction: column-reverse;
    }

    .btn-primary,
    .btn-secondary,
    .btn-success {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .wizard-container {
        border-radius: 12px;
    }

    .wizard-header {
        padding: 15px;
    }

    .progress-steps {
        gap: 8px;
    }

    .progress-dot {
        width: 28px;
        height: 28px;
        font-size: 11px;
    }

    .wizard-title {
        font-size: 16px;
    }

    .wizard-subtitle {
        font-size: 12px;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLLBAR STYLING
   ═══════════════════════════════════════════════════════════════════════════ */

.wizard-container::-webkit-scrollbar {
    width: 6px;
}

.wizard-container::-webkit-scrollbar-track {
    background: rgba(100, 200, 255, 0.1);
}

.wizard-container::-webkit-scrollbar-thumb {
    background: rgba(100, 200, 255, 0.3);
    border-radius: 3px;
}

.wizard-container::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 200, 255, 0.5);
}

.wizard-content::-webkit-scrollbar {
    width: 6px;
}

.wizard-content::-webkit-scrollbar-track {
    background: transparent;
}

.wizard-content::-webkit-scrollbar-thumb {
    background: rgba(100, 200, 255, 0.3);
    border-radius: 3px;
}

.wizard-content::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 200, 255, 0.5);
}
</style>
