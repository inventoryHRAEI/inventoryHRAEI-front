<template>
    <Teleport to="body">
        <transition name="scan-fade" mode="out-in">
            <div v-if="visible" class="scan-overlay" @click.self="close">
                <div class="scan-modal">
                <button class="scan-close" @click="close" aria-label="Cerrar">
                    <XMarkIcon class="icon" />
                </button>

                <header class="scan-header">
                    <div class="scan-title">Escanear Equipo Médico</div>
                    <div class="scan-subtitle">Utiliza cámara, sube una imagen o ingresa el código manualmente</div>
                </header>

                <div class="scan-body">
                    <transition name="panel-fade" mode="out-in">
                        <section v-if="!selectedCode" key="scanner" class="scan-panel">
                            <div class="scan-actions">
                                <button class="scan-btn" @click="startScan('select')" :disabled="scanning">
                                    <CameraIcon class="icon" />
                                    Activar Cámara
                                </button>
                                <label class="scan-upload">
                                    <input type="file" accept="image/*" @change="handleUpload" />
                                    <DocumentArrowUpIcon class="icon" />
                                    Subir Imagen
                                </label>
                            </div>

                            <div class="scan-manual">
                                <input v-model="manualCode" placeholder="Escribe No. de inventario o número de serie (o escanéalo)" />
                                <button @click="applyManualCode" :disabled="!manualCode" title="Buscar">
                                    <MagnifyingGlassIcon class="icon" />
                                </button>
                            </div>

                            <div class="scan-preview">
                                <div v-if="scanning" class="scan-skeleton"></div>
                                <video v-show="scannerActive" ref="videoEl" class="scan-video" autoplay muted
                                    playsinline></video>
                                <div v-if="scanError" class="scan-error">
                                    <ExclamationCircleIcon class="icon" />
                                    {{ scanError }}
                                </div>
                                <div v-if="!scannerActive && !scanning" class="scan-hint">
                                    <CameraIcon class="icon-lg" />
                                    <span>Apunta la cámara al código</span>
                                </div>
                            </div>
                        </section>

                        <section v-else key="result" class="scan-panel scan-info">
                            <div class="scan-info-title">Resultado del Escaneo</div>

                            <div v-if="!selectedCode" class="scan-empty">
                                <QrCodeIcon class="icon-lg" />
                                <p>Aún no se ha escaneado ningún código</p>
                            </div>

                            <div v-else>
                                <div :class="['scan-chip', { 'chip-highlight': highlightChip }]">{{ selectedCode }}</div>

                            <div v-if="selectedItem" class="scan-item">
                                <div><strong>Equipo:</strong> <span>{{ selectedItem?.['EQUIPO MEDICO'] || 'N/A'
                                }}</span></div>
                                <div><strong>Marca:</strong> <span>{{ selectedItem?.['MARCA'] || 'N/A' }}</span>
                                </div>
                                <div><strong>Modelo:</strong> <span>{{ selectedItem?.['MODELO'] || 'N/A' }}</span>
                                </div>
                                <div><strong>No. Serie:</strong> <span>{{ selectedItem?.['NUMERO DE SERIE'] || 'N/A'
                                }}</span></div>
                                <div><strong>Estatus:</strong> <span>{{ selectedItem?.['ESTATUS'] || 'N/A' }}</span>
                                </div>
                            </div>
                            <div v-else class="scan-empty">
                                <ExclamationTriangleIcon class="icon-lg" />
                                <p>Equipo no encontrado</p>
                            </div>

                            <div class="scan-maintenance">
                                <transition name="form-fade" mode="out-in">
                                    <div v-if="!isInMaintenance" key="start" class="scan-form">
                                        <h4>Iniciar Mantenimiento</h4>
                                        <input v-model="startForm.responsable" placeholder="Responsable" />
                                        <input v-model="startForm.empresa" placeholder="Empresa de Mantenimiento" />
                                        <input v-model="startForm.tipo" placeholder="Tipo (preventivo/correctivo)" />
                                        <textarea v-model="startForm.observaciones" placeholder="Observaciones"></textarea>
                                        <button class="scan-primary" @click="startMaintenance" :disabled="!canStart">
                                            Iniciar Mantenimiento
                                        </button>
                                    </div>
                                    <div v-else key="finish" class="scan-form">
                                        <h4>Finalizar Mantenimiento</h4>
                                        <div class="scan-verify">
                                            <input v-model="verificationCode" placeholder="Confirma el código" />
                                            <button @click="startScan('verify')" :disabled="scanning" title="Escanear">
                                                <MagnifyingGlassIcon class="icon" />
                                            </button>
                                        </div>

                                        <div class="form-group">
                                          <label>Técnico Responsable</label>
                                          <input v-model="finishForm.technician" type="text" class="form-input" placeholder="Nombre del técnico" />
                                          <p v-if="canFinish===undefined && !finishForm.technician" class="form-error">Obligatorio</p>
                                        </div>

                                        <div class="form-group">
                                          <label>Estado del Equipo al Finalizar</label>
                                          <select v-model="finishForm.estado" class="form-input">
                                            <option v-for="opt in estadosFuncionales" :key="opt.value" :value="opt.value">
                                              {{ opt.label }}
                                            </option>
                                          </select>
                                        </div>

                                        <div v-if="showEstadoDetalle" class="form-group">
                                          <label>Especificar condición:</label>
                                          <textarea v-model="finishForm.estadoDetalle" class="form-input form-textarea" 
                                            placeholder="Describe la condición específica..."></textarea>
                                        </div>

                                        <div class="form-group">
                                          <label>Horas Invertidas</label>
                                          <input v-model.number="finishForm.hours" type="number" step="0.5" min="0" class="form-input" placeholder="0.0" />
                                          <p v-if="canFinish===undefined && (finishForm.hours===null || finishForm.hours==='')" class="form-error">Obligatorio</p>
                                        </div>

                                        <div class="form-group checkbox-group">
                                          <label><input type="checkbox" v-model="finishForm.tests" value="routine" /> Rutina preventivo/correctivo</label>
                                          <label><input type="checkbox" v-model="finishForm.tests" value="simulator" /> Pruebas con simuladores</label>
                                          <label><input type="checkbox" v-model="finishForm.tests" value="analyzer" /> Pruebas con analizador eléctrico</label>
                                        </div>
                                        <p v-if="finishForm.tests.length === 0" class="form-error">Debes seleccionar al menos una prueba realizada</p>
<!-- optional: could add messages for missing hours/folio/tech here if desired -->

                                        <div class="form-group">
                                          <label>Folio de Mantenimiento</label>
                                          <input v-model="finishForm.folioNumber" type="text" class="form-input" placeholder="Ej: MP-2026-001" />
                                          <p v-if="canFinish===undefined && !finishForm.folioNumber" class="form-error">Obligatorio</p>
                                        </div>

                                        <textarea v-model="finishForm.trabajoRealizado"
                                            placeholder="Trabajo realizado"></textarea>
                                        <textarea v-model="finishForm.observaciones" placeholder="Observaciones"></textarea>
                                        <button class="scan-primary" @click="finishMaintenance" :disabled="!canFinish">
                                            Finalizar Mantenimiento
                                        </button>
                                    </div>
                                </transition>
                            </div>
                            <!-- processing spinner overlay -->
                            <div v-if="processing" class="scan-processing-overlay">
                                <div class="scan-spinner"></div>
                            </div>
                        </div>
                    </section>
                </transition>
                </div>
            </div>
        </div>
    </transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import Swal from 'sweetalert2'
import {
    XMarkIcon,
    CameraIcon,
    DocumentArrowUpIcon,
    MagnifyingGlassIcon,
    ExclamationCircleIcon,
    QrCodeIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
    modelValue: Boolean,
    items: { type: Array, default: () => [] },
    maintenanceMap: { type: Object, default: () => ({}) },
    initialCode: { type: String, default: '' }
})

watch(() => props.initialCode, (val) => {
    if (val && typeof val === 'string') {
        selectedCode.value = String(val).trim()
    }
})

const emit = defineEmits(['update:modelValue', 'start-maintenance', 'finish-maintenance', 'scan-result'])

// UI/state helpers for operation progress and feedback
const operationState = ref('idle') // idle | starting | finishing | success | error
const operationMsg = ref('')
const processing = computed(() => operationState.value === 'starting' || operationState.value === 'finishing')

// highlight chip animation when code changes
const highlightChip = ref(false)

const visible = ref(props.modelValue)
const scanning = ref(false)
const scannerActive = ref(false)
const scanError = ref('')
const selectedCode = ref('')
const manualCode = ref('')
const verificationCode = ref('')
const scanTarget = ref('select')
const videoEl = ref(null)

// watch selectedCode after it's declared
watch(selectedCode, (val, old) => {
    if (val && val !== old) {
        highlightChip.value = true
        setTimeout(() => (highlightChip.value = false), 400)
    }
})
let stream = null
let zxingReader = null

const startForm = ref({ responsable: '', tipo: '', empresa: '', observaciones: '' })
const finishForm = ref({
    estado: 'funcional',
    estadoDetalle: '',
    trabajoRealizado: '',
    observaciones: '',
    technician: '',
    hours: null,
    tests: [],
    folioNumber: ''
})

// Opciones de estado funcional
const estadosFuncionales = [
  { value: 'funcional', label: '✅ Funcional', color: '#22c55e' },
  { value: 'parcialmente_funcional', label: '⚠️ Parcialmente funcional', color: '#f59e0b' },
  { value: 'condicional', label: '🔶 Condicionalmente funcional', color: '#f97316' },
  { value: 'fuera_servicio', label: '❌ Fuera de servicio', color: '#ef4444' }
]

const showEstadoDetalle = computed(() => {
  return finishForm.value.estado === 'parcialmente_funcional' || 
         finishForm.value.estado === 'condicional' || 
         finishForm.value.estado === 'fuera_servicio'
})

watch(() => props.modelValue, (val) => {
    visible.value = val
    if (val) resetState()
})

// Control de scroll en el documento
watch(visible, (val) => {
    if (val) {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
    } else {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
    }
})

watch(visible, (val) => emit('update:modelValue', val))

const selectedItem = computed(() => {
    const code = selectedCode.value
    if (!code) return null
    return props.items.find(i => String(i?.['No DE INVENTARIO'] || '').trim() === code) || null
})

const isInMaintenance = computed(() => {
    const code = selectedCode.value
    if (!code) return false
    const normalized = String(code || '').trim().toUpperCase()
    const compact = normalized.replace(/[^A-Z0-9]/g, '')
    const entry = props.maintenanceMap?.[code]
        || props.maintenanceMap?.[normalized]
        || props.maintenanceMap?.[compact]
        || null
    if (!entry) return false
    return entry.status === 'in_progress'
        || entry.status === 'en_mantenimiento'
        || entry.maintenance?.status === 'in_progress'
})

const canStart = computed(() => {
    if (!selectedCode.value) return false
    const reason = startForm.value.tipo || startForm.value.observaciones
    return !!startForm.value.responsable && !!reason
})
const canFinish = computed(() => {
    // verification code must match, but notes are optional now
    const base = !!selectedCode.value && verificationCode.value === selectedCode.value
    const hasTest = Array.isArray(finishForm.value.tests) && finishForm.value.tests.length > 0
    const hasFolio = String(finishForm.value.folioNumber || '').trim().length > 0
    const hasHours = finishForm.value.hours !== null && finishForm.value.hours !== '' && !isNaN(finishForm.value.hours)
    const hasTech = String(finishForm.value.technician || '').trim().length > 0
    // Si el estado requiere detalle, debe ingresarlo
    const needsDetalle = finishForm.value.estado === 'parcialmente_funcional' || 
                         finishForm.value.estado === 'condicional' || 
                         finishForm.value.estado === 'fuera_servicio'
    const hasDetalle = !needsDetalle || String(finishForm.value.estadoDetalle || '').trim().length > 0
    return base && hasTest && hasFolio && hasHours && hasTech && hasDetalle
})

const hasChanges = computed(() => {
    return scanning.value ||
           manualCode.value ||
           selectedCode.value ||
           startForm.value.responsable ||
           startForm.value.tipo ||
           startForm.value.empresa ||
           startForm.value.observaciones ||
           finishForm.value.trabajoRealizado ||
           finishForm.value.observaciones
})

function resetState() {
    scanError.value = ''
    selectedCode.value = ''
    manualCode.value = ''
    verificationCode.value = ''
    startForm.value = { responsable: '', tipo: '', empresa: '', observaciones: '' }
    finishForm.value = {
      estado: 'funcional',
      estadoDetalle: '',
      trabajoRealizado: '',
      observaciones: '',
      technician: '',
      hours: null,
      tests: [],
      folioNumber: ''
    }
    stopScan()
}

async function close() {
    const hasPendingChanges = hasChanges.value
    const result = await Swal.fire({
        title: hasPendingChanges ? '¿Cerrar panel de escaneo?' : '¿Cerrar panel?',
        text: hasPendingChanges
            ? 'Hay un proceso de escaneo activo o datos pendientes. ¿Estás seguro de que quieres cerrar?'
            : '¿Estás seguro de que quieres cerrar este panel?',
        icon: hasPendingChanges ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
        background: 'rgba(13, 20, 35, 0.98)',
        color: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(2, 8, 18, 0.7)',
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: 'rgba(255, 255, 255, 0.08)',
        customClass: {
            container: 'swal-high-z-index'
        }
    })

    if (!result.isConfirmed) {
        return
    }

    visible.value = false
    stopScan()
}

function applyManualCode() {
    if (!manualCode.value) return
    setCode(manualCode.value)
}

async function startScan(target = 'select') {
    scanTarget.value = target
    scanError.value = ''
    if (!navigator?.mediaDevices?.getUserMedia) {
        scanError.value = 'Este navegador no permite acceso a cámara.'
        return
    }
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    if (!window.isSecureContext && !isLocal) {
        scanError.value = 'La cámara requiere HTTPS en móvil. Abre esta app con https.'
        return
    }
    try {
        if (!zxingReader) zxingReader = new BrowserMultiFormatReader()
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } }
        })
        scannerActive.value = true
        scanning.value = true
        if (videoEl.value) {
            videoEl.value.srcObject = stream
            await videoEl.value.play()
            await scanWithZXingFromVideo()
        }
    } catch (err) {
        const name = err?.name || ''
        if (name === 'NotAllowedError') {
            scanError.value = 'Permiso de cámara denegado.'
        } else if (name === 'NotFoundError') {
            scanError.value = 'No se encontró cámara en el dispositivo.'
        } else if (name === 'NotReadableError') {
            scanError.value = 'La cámara está en uso por otra app.'
        } else {
            scanError.value = 'No se pudo acceder a la cámara.'
        }
        scanning.value = false
        scannerActive.value = false
    }
}

async function scanWithZXingFromVideo() {
    if (!videoEl.value) return
    try {
        const result = await zxingReader.decodeOnceFromVideoElement(videoEl.value)
        const value = String(result?.getText?.() || '').trim()
        if (value) {
            setCode(value)
        }
    } catch (err) {
        scanError.value = 'Error al detectar el código.'
    } finally {
        stopScan()
    }
}

async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
        if (!zxingReader) zxingReader = new BrowserMultiFormatReader()
        const result = await zxingReader.decodeFromImageUrl(URL.createObjectURL(file))
        const value = String(result?.getText?.() || '').trim()
        if (value) setCode(value)
        else scanError.value = 'No se detectó ningún código en la imagen.'
    } catch (err) {
        scanError.value = 'No se pudo procesar la imagen.'
    }
}

function setCode(code) {
    if (scanTarget.value === 'verify') {
        verificationCode.value = code
    } else {
        selectedCode.value = code
        // emit result immediately so parent can react (e.g. open history modal)
        const item = props.items.find(i => String(i?.['No DE INVENTARIO'] || '').trim() === String(code).trim()) || null
        emit('scan-result', { code, item })
    }
}

function stopScan() {
    scanning.value = false
    scannerActive.value = false
    if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
    }
    try {
        if (zxingReader && typeof zxingReader.reset === 'function') {
            zxingReader.reset()
        }
    } catch (e) {
        // ignore reset errors to avoid crashing modal
    }
}

// generate a print/PDF view for a maintenance event
function generateMaintenancePdf(type, info) {
    const item = info.item || {}
    const code = info.code || ''
    const now = new Date().toLocaleString('es-ES')
    // build simple HTML
    const lines = []
    lines.push(`<h1>Mantenimiento ${type === 'start' ? 'Iniciado' : 'Finalizado'}</h1>`)
    lines.push(`<p><strong>Equipo:</strong> ${item['EQUIPO MEDICO'] || 'N/A'}</p>`)
    lines.push(`<p><strong>Código:</strong> ${code}</p>`)
    if (type === 'start') {
        lines.push(`<p><strong>Modo:</strong> ${info.mode === 'scheduled' ? 'Programado' : 'Inmediato'}</p>`)
        if (info.planned_date) lines.push(`<p><strong>Fecha prevista:</strong> ${info.planned_date}</p>`)
        if (info.provider_type === 'external') lines.push(`<p><strong>Proveedor:</strong> ${info.provider_name || ''}</p>`)
        lines.push(`<p><strong>Responsable:</strong> ${info.responsable || ''}</p>`)
        lines.push(`<p><strong>Empresa:</strong> ${info.empresa || ''}</p>`)
        lines.push(`<p><strong>Tipo:</strong> ${info.tipo || ''}</p>`)
        lines.push(`<p><strong>Observaciones:</strong> ${info.observaciones || ''}</p>`)
    } else {
        if (info.provider_name) lines.push(`<p><strong>Proveedor:</strong> ${info.provider_name}</p>`)
        if (info.return_location) lines.push(`<p><strong>Ubicación de retorno:</strong> ${info.return_location}</p>`)
        if (info.final_area) lines.push(`<p><strong>Área final:</strong> ${info.final_area}</p>`)
        lines.push(`<p><strong>Trabajo realizado:</strong> ${info.trabajoRealizado || ''}</p>`)
        lines.push(`<p><strong>Observaciones:</strong> ${info.observaciones || ''}</p>`)
    }
    lines.push(`<p><em>Fecha y hora: ${now}</em></p>`)

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Mantenimiento ${code}</title>` +
        `<style>body{font-family:Arial,sans-serif;padding:20px;}h1{font-size:1.5em}</style>` +
        `</head><body>${lines.join('')}</body></html>`
    const w = window.open('', '_blank')
    if (w) {
        w.document.write(html)
        w.document.close()
        w.focus()
        // give some time for rendering before print call
        setTimeout(() => { try { w.print() } catch (_) {} }, 300)
    }
}


async function startMaintenance() {
    operationState.value = 'starting'
    scanError.value = ''
    const reason = startForm.value.tipo || startForm.value.observaciones || startForm.value.responsable || 'Mantenimiento'
    const provider = startForm.value.empresa || startForm.value.responsable || 'Proveedor'
    try {
        await new Promise((resolve, reject) => {
            emit('start-maintenance', {
                code: selectedCode.value,
                item: selectedItem.value,
                data: {
                    ...startForm.value,
                    motivo: reason,
                    reason,
                    provider,
                    empresa: startForm.value.empresa
                },
                done: (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                }
            })
        })
        operationState.value = 'success'
        // generate a simple PDF/print window for the start operation
        generateMaintenancePdf('start', {
            code: selectedCode.value,
            item: selectedItem.value,
            ...startForm.value,
            motivo: reason,
            provider
        })
        Swal.fire({
            icon: 'success',
            title: 'Mantenimiento iniciado',
            showConfirmButton: false,
            timer: 1200
        })
    } catch (err) {
        operationState.value = 'error'
        scanError.value = err?.message || 'Error iniciando mantenimiento'
    } finally {
        setTimeout(() => (operationState.value = 'idle'), 1400)
    }
}

async function finishMaintenance() {
    operationState.value = 'finishing'
    scanError.value = ''
    try {
        await new Promise((resolve, reject) => {
            emit('finish-maintenance', {
                code: selectedCode.value,
                item: selectedItem.value,
                data: { ...finishForm.value },
                done: (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                }
            })
        })
        operationState.value = 'success'
        generateMaintenancePdf('finish', {
            code: selectedCode.value,
            item: selectedItem.value,
            ...finishForm.value
        })
        Swal.fire({
            icon: 'success',
            title: 'Mantenimiento finalizado',
            showConfirmButton: false,
            timer: 1200
        })
    } catch (err) {
        operationState.value = 'error'
        scanError.value = err?.message || 'Error finalizando mantenimiento'
    } finally {
        setTimeout(() => (operationState.value = 'idle'), 1400)
    }
}

onBeforeUnmount(() => {
    stopScan()
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
})
</script>

<style scoped>
/* ==================== OVERLAY BACKDROP ==================== */
.scan-overlay {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(800px 600px at 30% 20%, rgba(30, 58, 138, 0.4), rgba(3, 8, 20, 0.75));
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px) saturate(1.05);
}

/* spinner overlay during network ops */
.scan-processing-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}
.scan-spinner {
    border: 4px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}

/* chip highlight pulse */
.chip-highlight {
    animation: chipPulse 0.4s ease-in-out;
}
@keyframes chipPulse {
    0% { transform: scale(1); background-color: rgba(255,255,255,0.1); }
    50% { transform: scale(1.1); background-color: rgba(255,255,255,0.2); }
    100% { transform: scale(1); background-color: transparent; }
}

/* form fade transition */
.form-fade-enter-active, .form-fade-leave-active {
    transition: opacity 0.3s;
}
.form-fade-enter-from, .form-fade-leave-to {
    opacity: 0;
}

/* overlay fade for modal */
.scan-fade-enter-active, .scan-fade-leave-active {
    transition: opacity 0.3s;
}
.scan-fade-enter-from, .scan-fade-leave-to {
    opacity: 0;
}

/* panel swap fade */
.panel-fade-enter-active, .panel-fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}
.panel-fade-enter-from {
    opacity: 0;
    transform: translateX(20px);
}
.panel-fade-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}
/* ==================== MODAL CONTAINER ==================== */
.scan-modal {
    width: 100%;
    max-width: 1200px;
    max-height: calc(100vh - 40px);
    height: auto;
    background: linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(5, 15, 35, 0.98));
    border: 1px solid rgba(99, 150, 255, 0.5);
    border-radius: 24px;
    padding: 28px;
    position: relative;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(59, 130, 246, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
}

.scan-modal::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 24px;
    background: radial-gradient(800px 400px at 10% -10%, rgba(99, 150, 255, 0.2), transparent),
        radial-gradient(500px 500px at 90% 110%, rgba(59, 130, 246, 0.1), transparent);
    pointer-events: none;
    z-index: -1;
}

/* Modal scrollbar styling */
.scan-modal::-webkit-scrollbar {
    width: 10px;
}

.scan-modal::-webkit-scrollbar-track {
    background: rgba(99, 150, 255, 0.08);
    border-radius: 6px;
}

.scan-modal::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(99, 150, 255, 0.5), rgba(125, 211, 252, 0.4));
    border-radius: 6px;
}

.scan-modal::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(99, 150, 255, 0.7), rgba(125, 211, 252, 0.6));
}

/* ==================== CLOSE BUTTON ==================== */
.scan-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.1);
    color: #ff6b6b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 10;
    padding: 0;
}

.scan-close:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.7);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
}

.scan-close .icon {
    width: 24px;
    height: 24px;
    stroke-width: 2;
}

/* ==================== HEADER ==================== */
.scan-header {
    margin-bottom: 24px;
    padding-top: 8px;
}

.scan-title {
    background: linear-gradient(135deg, #e0f2fe, #bae6fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.3px;
}

.scan-subtitle {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.95rem;
    margin-top: 6px;
    font-weight: 500;
}

/* ==================== BODY LAYOUT ==================== */
.scan-body {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 20px;
    flex: 1;
}

/* ==================== PANELS ==================== */
.scan-panel {
    background: linear-gradient(135deg, rgba(20, 40, 80, 0.5), rgba(15, 30, 60, 0.4));
    border: 1.5px solid rgba(99, 150, 255, 0.35);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.scan-panel.scan-info {
    background: linear-gradient(135deg, rgba(25, 50, 100, 0.5), rgba(15, 35, 70, 0.4));
}

/* ==================== ACTIONS SECTION ==================== */
.scan-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.scan-btn,
.scan-upload {
    flex: 1;
    min-width: 120px;
    padding: 11px 16px;
    border-radius: 11px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.scan-btn {
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    color: white;
    border: 1px solid rgba(6, 182, 212, 0.5);
    box-shadow: 0 8px 16px rgba(6, 182, 212, 0.25);
}

.scan-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #0284c7, #0891b2);
    box-shadow: 0 12px 24px rgba(6, 182, 212, 0.4);
    transform: translateY(-2px);
}

.scan-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.scan-upload {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 150, 255, 0.2));
    color: #7dd3fc;
    border: 2px dashed rgba(125, 211, 252, 0.5);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.scan-upload:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(99, 150, 255, 0.3));
    border-color: rgba(125, 211, 252, 0.8);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.scan-upload input {
    display: none;
}

/* ==================== MANUAL INPUT SECTION ==================== */
.scan-manual {
    display: flex;
    gap: 8px;
}

.scan-manual input {
    flex: 1;
    background: rgba(10, 20, 40, 0.6);
    border: 1.5px solid rgba(125, 211, 252, 0.25);
    border-radius: 10px;
    padding: 11px 14px;
    color: #e0f2fe;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-weight: 500;
}

.scan-manual input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.scan-manual input:focus {
    outline: none;
    border-color: rgba(125, 211, 252, 0.7);
    background: rgba(10, 20, 40, 0.8);
    box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.15);
}

.scan-manual button {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 150, 255, 0.2));
    color: #7dd3fc;
    border: 1.5px solid rgba(125, 211, 252, 0.5);
    border-radius: 10px;
    padding: 11px 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
}

.scan-manual button:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(99, 150, 255, 0.4));
    border-color: rgba(125, 211, 252, 0.8);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

/* ==================== PREVIEW SECTION ==================== */
.scan-preview {
    min-height: 240px;
    background: linear-gradient(135deg, rgba(10, 20, 40, 0.5), rgba(5, 15, 35, 0.4));
    border-radius: 12px;
    border: 1.5px dashed rgba(125, 211, 252, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.6);
}

.scan-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.scan-skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            rgba(125, 211, 252, 0.1),
            rgba(125, 211, 252, 0.2),
            rgba(125, 211, 252, 0.1));
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.scan-error {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fca5a5;
    font-size: 0.9rem;
    padding: 12px;
    text-align: center;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
}

.scan-error .icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.scan-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-size: 0.95rem;
    text-align: center;
}

.scan-hint .icon-lg {
    stroke: rgba(125, 211, 252, 0.6);
}

/* ==================== RESULTS SECTION ==================== */
.scan-info-title {
    font-weight: 700;
    color: #bae6fd;
    margin-bottom: 12px;
    font-size: 1.05rem;
}

.scan-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.95rem;
    padding: 20px 14px;
    text-align: center;
    background: rgba(99, 150, 255, 0.08);
    border-radius: 8px;
}

.scan-empty .icon-lg {
    stroke: rgba(125, 211, 252, 0.5);
    opacity: 0.8;
}

.scan-chip {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 150, 255, 0.2));
    color: #7dd3fc;
    font-weight: 700;
    font-size: 0.9rem;
    border: 1px solid rgba(125, 211, 252, 0.4);
    margin-bottom: 12px;
}

.scan-item {
    background: rgba(20, 40, 80, 0.3);
    color: rgba(255, 255, 255, 0.9);
    display: grid;
    gap: 6px;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(125, 211, 252, 0.2);
    margin-bottom: 14px;
    font-size: 0.9rem;
}

.scan-item div {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.scan-item strong {
    color: #bae6fd;
    font-weight: 600;
    min-width: max-content;
}

.scan-item span {
    text-align: right;
    flex: 1;
}

/* ==================== MAINTENANCE SECTION ==================== */
.scan-maintenance {
    margin-top: 12px;
}

.scan-maintenance h4 {
    color: #bae6fd;
    font-size: 1.05rem;
    margin: 0 0 14px 0;
    font-weight: 700;
}

.scan-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.scan-form input,
.scan-form textarea {
    width: 100%;
    background: rgba(10, 20, 40, 0.6);
    border: 1.5px solid rgba(125, 211, 252, 0.25);
    border-radius: 10px;
    padding: 11px 14px;
    color: #e0f2fe;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-family: inherit;
    font-weight: 500;
}

.scan-form input::placeholder,
.scan-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.scan-form input:focus,
.scan-form textarea:focus {
    outline: none;
    border-color: rgba(125, 211, 252, 0.7);
    background: rgba(10, 20, 40, 0.8);
    box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.15);
}

.scan-form textarea {
    resize: vertical;
    min-height: 80px;
    max-height: 150px;
}

.scan-primary {
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    color: white;
    border: 1px solid rgba(6, 182, 212, 0.5);
    border-radius: 11px;
    padding: 12px 16px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 16px rgba(6, 182, 212, 0.25);
}

.scan-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0284c7, #0891b2);
    box-shadow: 0 12px 24px rgba(6, 182, 212, 0.4);
    transform: translateY(-2px);
}

.scan-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.scan-verify {
    display: flex;
    gap: 8px;
}

.scan-verify input {
    flex: 1;
    background: rgba(10, 20, 40, 0.6);
    border: 1.5px solid rgba(125, 211, 252, 0.25);
    border-radius: 10px;
    padding: 11px 14px;
    color: #e0f2fe;
    font-size: 0.95rem;
    transition: all 0.3s ease;
}

.scan-verify input:focus {
    outline: none;
    border-color: rgba(125, 211, 252, 0.7);
    background: rgba(10, 20, 40, 0.8);
    box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.15);
}

.scan-verify button {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 150, 255, 0.2));
    color: #7dd3fc;
    border: 1.5px solid rgba(125, 211, 252, 0.5);
    border-radius: 10px;
    padding: 11px 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
}

.scan-verify button:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(99, 150, 255, 0.4));
    border-color: rgba(125, 211, 252, 0.8);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

.scan-verify button .icon {
    width: 18px;
    height: 18px;
}

/* ==================== ICON SIZES ==================== */
.icon {
    width: 18px;
    height: 18px;
}

.icon-lg {
    width: 40px;
    height: 40px;
}

/* ==================== ANIMATIONS ==================== */
@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.scan-fade-enter-active,
.scan-fade-leave-active {
    transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.scan-fade-enter-from,
.scan-fade-leave-to {
    opacity: 0;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1400px) {
    .scan-modal {
        max-width: 1000px;
    }
}

@media (max-width: 1024px) {
    .scan-modal {
        padding: 24px;
        max-width: 900px;
    }

    .scan-body {
        grid-template-columns: 1fr;
    }

    .scan-preview {
        min-height: 220px;
    }
}

@media (max-width: 640px) {
    .scan-overlay {
        padding: 12px;
    }

    .scan-modal {
        padding: 18px;
        border-radius: 18px;
        max-height: 90vh;
        max-width: 100%;
    }

    .scan-title {
        font-size: 1.35rem;
    }

    .scan-subtitle {
        font-size: 0.9rem;
    }

    .scan-actions {
        gap: 8px;
    }

    .scan-btn,
    .scan-upload {
        min-width: 100px;
        padding: 10px 12px;
        font-size: 0.9rem;
    }

    .scan-preview {
        min-height: 180px;
    }

    .scan-form input,
    .scan-form textarea {
        padding: 10px 12px;
        font-size: 0.9rem;
    }

    .scan-item {
        font-size: 0.85rem;
    }

    .scan-item div {
        flex-direction: column;
    }

    .scan-item span {
        text-align: left;
    }
}

/* SweetAlert2 high z-index override */
:global(.swal-high-z-index) {
    z-index: 200000 !important;
}
</style>
