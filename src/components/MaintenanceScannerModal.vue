<template>
    <transition name="scan-fade">
        <div v-if="visible" class="scan-overlay" @click.self="close">
            <div class="scan-modal">
                <button class="scan-close" @click="close" aria-label="Cerrar">✕</button>

                <header class="scan-header">
                    <div class="scan-title">Escanear equipo</div>
                    <div class="scan-subtitle">Usa cámara o sube una imagen del código de barras</div>
                </header>

                <div class="scan-body">
                    <section class="scan-panel">
                        <div class="scan-actions">
                            <button class="scan-btn" @click="startScan('select')" :disabled="scanning">
                                Activar cámara
                            </button>
                            <label class="scan-upload">
                                <input type="file" accept="image/*" @change="handleUpload" />
                                Subir imagen
                            </label>
                        </div>
                        <div class="scan-manual">
                            <input v-model="manualCode" placeholder="Escribe el No. de Inventario" />
                            <button @click="applyManualCode">Buscar</button>
                        </div>

                        <div class="scan-preview">
                            <div v-if="scanning" class="scan-skeleton"></div>
                            <video v-show="scannerActive" ref="videoEl" class="scan-video" autoplay muted playsinline></video>
                            <div v-if="scanError" class="scan-error">{{ scanError }}</div>
                            <div v-if="!scannerActive && !scanning" class="scan-hint">Apunta la cámara al código</div>
                        </div>
                    </section>

                    <section class="scan-panel scan-info">
                        <div class="scan-info-title">Resultado</div>
                        <div v-if="!selectedCode" class="scan-empty">Aún no se ha detectado ningún código.</div>

                        <div v-else class="scan-result">
                            <div class="scan-chip">{{ selectedCode }}</div>
                            <div v-if="selectedItem" class="scan-item">
                                <div><strong>Equipo:</strong> {{ selectedItem?.['EQUIPO MEDICO'] || 'N/A' }}</div>
                                <div><strong>Marca:</strong> {{ selectedItem?.['MARCA'] || 'N/A' }}</div>
                                <div><strong>Modelo:</strong> {{ selectedItem?.['MODELO'] || 'N/A' }}</div>
                                <div><strong>No. Serie:</strong> {{ selectedItem?.['NUMERO DE SERIE'] || 'N/A' }}</div>
                                <div><strong>Estatus:</strong> {{ selectedItem?.['ESTATUS'] || 'N/A' }}</div>
                            </div>
                            <div v-else class="scan-empty">No se encontró el equipo en la base de datos.</div>

                            <div class="scan-maintenance">
                                <div v-if="!isInMaintenance" class="scan-form">
                                    <h4>Iniciar mantenimiento</h4>
                                    <input v-model="startForm.responsable" placeholder="Responsable" />
                                    <input v-model="startForm.tipo" placeholder="Tipo (preventivo/correctivo)" />
                                    <textarea v-model="startForm.observaciones" placeholder="Observaciones"></textarea>
                                    <button class="scan-primary" @click="startMaintenance" :disabled="!canStart">Iniciar mantenimiento</button>
                                </div>

                                <div v-else class="scan-form">
                                    <h4>Finalizar mantenimiento</h4>
                                    <div class="scan-verify">
                                        <input v-model="verificationCode" placeholder="Escanea o escribe nuevamente el código" />
                                        <button @click="startScan('verify')" :disabled="scanning">Escanear</button>
                                    </div>
                                    <textarea v-model="finishForm.trabajoRealizado" placeholder="Trabajo realizado"></textarea>
                                    <textarea v-model="finishForm.observaciones" placeholder="Observaciones"></textarea>
                                    <button class="scan-primary" @click="finishMaintenance" :disabled="!canFinish">Finalizar mantenimiento</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'

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

const emit = defineEmits(['update:modelValue', 'start-maintenance', 'finish-maintenance'])

const visible = ref(props.modelValue)
const scanning = ref(false)
const scannerActive = ref(false)
const scanError = ref('')
const selectedCode = ref('')
const manualCode = ref('')
const verificationCode = ref('')
const scanTarget = ref('select')
const videoEl = ref(null)
let stream = null
let zxingReader = null

const startForm = ref({ responsable: '', tipo: '', observaciones: '' })
const finishForm = ref({ trabajoRealizado: '', observaciones: '' })

watch(() => props.modelValue, (val) => {
    visible.value = val
    if (val) resetState()
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
    return props.maintenanceMap?.[code]?.status === 'in_progress'
})

const canStart = computed(() => !!selectedCode.value && !!startForm.value.responsable)
const canFinish = computed(() => {
    return !!selectedCode.value
        && verificationCode.value === selectedCode.value
        && !!finishForm.value.trabajoRealizado
})

function resetState() {
    scanError.value = ''
    selectedCode.value = ''
    manualCode.value = ''
    verificationCode.value = ''
    startForm.value = { responsable: '', tipo: '', observaciones: '' }
    finishForm.value = { trabajoRealizado: '', observaciones: '' }
    stopScan()
}

function close() {
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
    }
}

function stopScan() {
    scanning.value = false
    scannerActive.value = false
    if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
    }
    if (zxingReader) {
        zxingReader.reset()
    }
}

function startMaintenance() {
    emit('start-maintenance', {
        code: selectedCode.value,
        item: selectedItem.value,
        data: { ...startForm.value }
    })
}

function finishMaintenance() {
    emit('finish-maintenance', {
        code: selectedCode.value,
        item: selectedItem.value,
        data: { ...finishForm.value }
    })
}

onBeforeUnmount(() => stopScan())
</script>

<style scoped>
.scan-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3, 8, 20, 0.68);
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.scan-modal {
    width: min(1100px, 94vw);
    background: linear-gradient(180deg, rgba(9, 20, 40, 0.98), rgba(5, 12, 24, 0.98));
    border: 1px solid rgba(79, 140, 255, 0.35);
    border-radius: 18px;
    padding: 26px 26px 22px;
    position: relative;
    box-shadow: 0 16px 50px rgba(0,0,0,0.45);
}

.scan-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(239,68,68,0.4);
    background: rgba(239,68,68,0.12);
    color: #f87171;
    cursor: pointer;
}

.scan-header {
    text-align: left;
    margin-bottom: 18px;
}

.scan-title {
    color: #e5f0ff;
    font-size: 1.35rem;
    font-weight: 700;
}

.scan-subtitle {
    color: rgba(255,255,255,0.7);
    font-size: 0.95rem;
    margin-top: 4px;
}

.scan-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
}

.scan-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(125,211,252,0.2);
    border-radius: 14px;
    padding: 16px;
}

.scan-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
}

.scan-btn {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    font-weight: 600;
    cursor: pointer;
}

.scan-upload {
    border: 1px dashed rgba(125,211,252,0.5);
    color: #7dd3fc;
    border-radius: 10px;
    padding: 8px 14px;
    cursor: pointer;
}

.scan-upload input {
    display: none;
}

.scan-manual {
    display: flex;
    gap: 8px;
}

.scan-manual input {
    flex: 1;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(125,211,252,0.3);
    border-radius: 8px;
    padding: 8px 10px;
    color: #e2e8f0;
}

.scan-manual button {
    background: rgba(34,197,94,0.12);
    color: #22c55e;
    border: 1px solid rgba(34,197,94,0.5);
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 600;
}

.scan-preview {
    margin-top: 12px;
    min-height: 210px;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    border: 1px dashed rgba(125,211,252,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.scan-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.scan-skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.12), rgba(255,255,255,0.04));
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
}

.scan-error {
    color: #fda4af;
    font-size: 0.9rem;
    padding: 8px;
}

.scan-hint {
    color: rgba(255,255,255,0.6);
}

.scan-info-title {
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 8px;
}

.scan-empty {
    color: rgba(255,255,255,0.6);
}

.scan-chip {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(125,211,252,0.12);
    color: #7dd3fc;
    font-weight: 700;
    margin-bottom: 10px;
}

.scan-item {
    color: rgba(255,255,255,0.85);
    display: grid;
    gap: 4px;
    margin-bottom: 14px;
}

.scan-maintenance h4 {
    color: #e2e8f0;
    margin: 6px 0 10px;
}

.scan-form input,
.scan-form textarea {
    width: 100%;
    margin-bottom: 8px;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(125,211,252,0.3);
    border-radius: 8px;
    padding: 8px 10px;
    color: #e2e8f0;
    resize: vertical;
}

.scan-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 8px 14px;
    font-weight: 700;
    cursor: pointer;
}

.scan-verify {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.scan-verify button {
    background: rgba(34,197,94,0.12);
    color: #22c55e;
    border: 1px solid rgba(34,197,94,0.5);
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 600;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.scan-fade-enter-active,
.scan-fade-leave-active { transition: opacity 0.2s ease; }
.scan-fade-enter-from,
.scan-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
    .scan-body { grid-template-columns: 1fr; }
}
</style>
