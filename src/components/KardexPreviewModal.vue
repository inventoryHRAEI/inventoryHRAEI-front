<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
                <div class="modal-content">
                <!-- Header -->
                <div class="modal-header">
                    <div class="header-left">
                        <div class="header-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <div class="header-text">
                            <h2>{{ title }}</h2>
                            <p class="subtitle" v-if="itemData['Clave  HRAEI']">{{ itemData['Clave HRAEI'] }}</p>
                        </div>
                    </div>
                    <button class="close-btn" @click="closeModal" title="Cerrar modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Generando Vista Previa del Kardex...</p>
                </div>

                <!-- PDF Preview -->
                <div v-else-if="pdfUrl" class="pdf-container">
                    <iframe :src="pdfUrl" class="pdf-iframe" title="Vista Previa del Kardex"></iframe>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-state">
                    <div class="error-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <p class="error-message">{{ error }}</p>
                </div>

                <!-- Footer -->
                <div class="modal-footer">
                    <button v-if="pdfUrl" class="btn btn-download" @click="downloadPdf" title="Descargar PDF">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Descargar PDF</span>
                    </button>
                    <button class="btn btn-close" @click="closeModal">
                        <span>Cerrar</span>
                    </button>
                </div>
            </div>
        </div>
    </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Vista Previa del Kardex'
    },
    itemData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['close'])

const isLoading = ref(false)
const pdfUrl = ref(null)
const error = ref(null)
const pdfBlob = ref(null)

// Watcher para generar PDF cuando se abre el modal
watch(() => props.isOpen, async (newVal) => {
    if (newVal) {
        await generatePdfPreview()
    } else {
        // Limpiar recursos cuando se cierra
        if (pdfUrl.value) {
            window.URL.revokeObjectURL(pdfUrl.value)
        }
        pdfUrl.value = null
        pdfBlob.value = null
        error.value = null
    }
})

const generatePdfPreview = async () => {
    try {
        isLoading.value = true
        error.value = null
        pdfUrl.value = null

        if (!props.itemData || Object.keys(props.itemData).length === 0) {
            error.value = 'No hay datos de item disponibles'
            return
        }

        // Extraer campos para generar clave compuesta única
        const n = String(props.itemData.n || props.itemData.N || props.itemData.numero || props.itemData.numeroSerie || '').trim();
        const clave = String(props.itemData.claveHRAEI || props.itemData['Clave  HRAEI'] || props.itemData.clave || '').trim();
        const lote = String(props.itemData.lote || props.itemData.Lote || props.itemData.LOTE || '').trim();
        const referencia = String(props.itemData.referencia || props.itemData.Referencia || props.itemData.REFERENCIA || '').trim();
        const cucop = String(props.itemData.cucop || props.itemData.cucops || props.itemData.CUCOP || props.itemData.CUCOPS || '').trim();

        // Validar que CLAVE esté presente
        if (!clave) {
            error.value = 'La Clave HRAEI es obligatoria para generar Kardex'
            return
        }
        
                // Generar clave compuesta: N|Clave|Lote|Referencia|CUCOP
        const compositeKey = [
          n || 'null',
          clave || 'null',
          lote || 'null',
                    referencia || 'null',
                    cucop || 'null'
        ].join('|');
         
         const payload = {
             compositeKey,
             n,
             clave,
             claveHRAEI: clave,
             descripcion: String(props.itemData.nombre || props.itemData['Descripción del bien'] || props.itemData.descripcion || '').trim(),
             marca: String(props.itemData.marca || props.itemData.Marca || props.itemData.MARCA || '').trim(),
             modelo: String(props.itemData.modelo || props.itemData.Modelo || props.itemData.MODELO || '').trim(),
             referencia,
             lote,
             cucop
         }
         // Propagar flag strict si fue solicitado por el caller
         if (props.itemData && props.itemData.strict) payload.strict = true
         console.log('[KARDEX_DEBUG] Payload enviado al backend (generatePdfPreview) con compositeKey:', payload)

        const token = localStorage.getItem('auth_token')

        const res = await fetch('/api/ops/inventory/kardex/pdf', {
            method: 'POST',
            headers: Object.assign(
                { 'Content-Type': 'application/json' },
                token ? { 'Authorization': `Bearer ${token}` } : {}
            ),
            body: JSON.stringify({ identifier: payload })
        })

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error((data && data.msg) || 'Error al generar kardex')
        }

        const blob = await res.blob()
        pdfBlob.value = blob
        pdfUrl.value = window.URL.createObjectURL(blob)
    } catch (e) {
        console.error('Error generando PDF preview:', e)
        error.value = e.message || 'Error al generar vista previa del kardex'
    } finally {
        isLoading.value = false
    }
}

const downloadPdf = () => {
    if (!pdfBlob.value) return

    const payload = props.itemData
    let filenameBase = ''
    if (payload.descripcion) filenameBase = payload.descripcion
    if (payload.marca) filenameBase = filenameBase ? `${filenameBase}-${payload.marca}` : payload.marca
    if (!filenameBase) filenameBase = payload['Clave  HRAEI'] || 'kardex'

    const safeName = String(filenameBase).replace(/[^a-z0-9\-_\.]/gi, '_')
    const url = window.URL.createObjectURL(pdfBlob.value)
    const a = document.createElement('a')
    a.href = url
    a.download = `kardex_${safeName}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
}

const closeModal = () => {
    emit('close')
}
</script>

<style scoped>
/* Transiciones */
.modal-fade-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-active .modal-content {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-fade-leave-active .modal-content {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-fade-enter-from {
    opacity: 0;
}

.modal-fade-enter-from .modal-content {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
}

.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-leave-to .modal-content {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

/* Overlay */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    padding: 20px;
}

/* Modal Content */
.modal-content {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 20px;
    border: 2px solid rgba(59, 130, 246, 0.35);
    box-shadow: 
        0 0 40px rgba(59, 130, 246, 0.2),
        0 20px 80px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    max-width: 92vw;
    max-height: 90vh;
    width: 1100px;
    height: 850px;
    overflow: hidden;
    position: relative;
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 28px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.15);
    background: rgba(15, 23, 42, 0.5);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    flex-shrink: 0;
}

.header-text {
    min-width: 0;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #f1f5f9;
    font-weight: 700;
    letter-spacing: -0.5px;
}

.subtitle {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: #94a3b8;
    font-family: 'Courier New', monospace;
    font-weight: 500;
}

.close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
}

.close-btn:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    transform: rotate(90deg);
}

/* PDF Container */
.pdf-container {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: rgba(15, 23, 42, 0.3);
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0;
}

/* Loading & Error States */
.loading-state,
.error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: rgba(15, 23, 42, 0.3);
}

.spinner {
    width: 56px;
    height: 56px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    margin-top: 24px;
    color: #cbd5e1;
    font-size: 1rem;
    font-weight: 500;
}

.error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    margin-bottom: 16px;
}

.error-message {
    color: #fecaca;
    font-size: 1rem;
    text-align: center;
    max-width: 400px;
    line-height: 1.6;
}

/* Footer */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 28px;
    border-top: 1px solid rgba(59, 130, 246, 0.15);
    background: rgba(15, 23, 42, 0.5);
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
}

.btn-download {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-download:hover {
    background: rgba(34, 197, 94, 0.25);
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
    transform: translateY(-1px);
}

.btn-download:active {
    transform: translateY(0);
}

.btn-close {
    background: rgba(59, 130, 246, 0.12);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.btn-close:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
}

.btn-close:active {
    transform: translateY(0);
}

/* Responsive */
@media (max-width: 1200px) {
    .modal-content {
        width: 95vw;
        height: 88vh;
    }
}

@media (max-width: 768px) {
    .modal-content {
        width: 98vw;
        height: 92vh;
        border-radius: 12px;
    }

    .modal-header {
        padding: 16px 20px;
    }

    .modal-header h2 {
        font-size: 1.1rem;
    }

    .header-icon {
        width: 36px;
        height: 36px;
    }

    .header-icon svg {
        width: 18px;
        height: 18px;
    }

    .modal-footer {
        flex-direction: column-reverse;
        gap: 10px;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
