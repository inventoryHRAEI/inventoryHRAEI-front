<template>
    <div class="detail-shell">
        <div class="detail-header">
            <div class="header-left">
                <h3>{{ item.name }} <small>({{ item.inventoryNo }})</small></h3>
                <p class="subtitle">Detalles completos del equipo biomédico</p>
            </div>
            <div class="header-actions">
                <button class="btn-pdf-detail" @click="downloadPDF" title="Descargar PDF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="19" x2="12" y2="12"></line>
                        <polyline points="9 16 12 19 15 16"></polyline>
                    </svg>
                </button>
                <button class="btn-close-detail" @click="$emit('close')" aria-label="Cerrar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>

        <div class="detail-content">
            <div class="card info-card-primary">
                <h4>📋 Información General</h4>
                <div class="info-row">
                    <span class="label">Nombre:</span>
                    <span class="value">{{ item.name }}</span>
                </div>
                <div class="info-row">
                    <span class="label">No. Inventario:</span>
                    <span class="code">{{ item.inventoryNo }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Marca:</span>
                    <span class="value">{{ item.brand || '—' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Modelo:</span>
                    <span class="value">{{ item.model || '—' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Número de Serie:</span>
                    <span class="value">{{ item.serialNumber || '—' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Tipo:</span>
                    <span :class="['type-badge-detail', typeClass(item.type)]">{{ typeLabel(item.type) }}</span>
                </div>
            </div>

            <div class="card info-card-secondary">
                <h4>📍 Ubicación y Estado</h4>
                <div class="info-row">
                    <span class="label">Área:</span>
                    <span class="value">{{ item.area || '—' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Estado:</span>
                    <span :class="['status-badge', stateClass(item.status)]">{{ item.status }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Año Fabricación:</span>
                    <span class="value">{{ item.yearManufactured || '—' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Año Adquisición:</span>
                    <span class="value">{{ item.yearAcquisition || '—' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Garantía:</span>
                    <span class="value">
                        <span :class="['status-mini', item.warranty ? 'is-active' : 'is-inactive']">
                            {{ item.warranty ? '✓ Vigente' : '✗ Vencida' }}
                        </span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">Calibración:</span>
                    <span class="value">
                        <span :class="['status-mini', item.calibrationPending ? 'is-pending' : 'is-active']">
                            {{ item.calibrationPending ? '⚠ Pendiente' : '✓ Al día' }}
                        </span>
                    </span>
                </div>
            </div>

            <div class="card history-card-full">
                <MaintenanceHistory :items="item.history" />
            </div>

            <div class="card action-card">
                <h4>⚙️ Acciones</h4>
                <div class="action-buttons">
                    <button v-if="props.item.status !== 'EN MANTENIMIENTO'" class="btn btn-start"
                        @click="$emit('start', props.item)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                        </svg>
                        Iniciar Mantenimiento
                    </button>
                    <button v-else class="btn btn-finish" @click="$emit('finish', props.item)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Finalizar Mantenimiento
                    </button>
                    <button class="btn btn-download" @click="downloadPDF">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2">
                             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                             <polyline points="7 10 12 15 17 10"></polyline>
                             <line x1="12" y1="15" x2="12" y2="3"></line>
                         </svg>
                         Descargar PDF
                     </button>
                    <button class="btn btn-qr" @click="barcodeModalOpen = true">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2">
                             <rect x="3" y="3" width="7" height="7"></rect>
                             <rect x="14" y="3" width="7" height="7"></rect>
                             <rect x="14" y="14" width="7" height="7"></rect>
                             <rect x="3" y="14" width="7" height="7"></rect>
                         </svg>
                         QR/Código
                     </button>
                </div>
            </div>
        </div>
        <BarcodeModal v-model="barcodeModalOpen" :code="props.item.inventoryNo" :item="props.item" />
        </div>
        </template>

<script setup>
import { ref } from 'vue'
import MaintenanceHistory from './MaintenanceHistory.vue'
import BarcodeModal from '@/components/BarcodeModal.vue'
import { generateSimplePDF } from '@/services/pdfService.js'

const props = defineProps({ item: { type: Object, required: true } })
const barcodeModalOpen = ref(false)

function stateClass(s) {
    if (s === 'DISPONIBLE') return 'is-green'
    if (s === 'EN MANTENIMIENTO') return 'is-yellow'
    if (s === 'OPERATIVO') return 'is-blue'
    return ''
}

function typeLabel(type) {
    const labels = {
        'equipo': 'Equipo',
        'accesorio': 'Accesorio',
        'consumible': 'Consumible',
        'refaccion': 'Refacción'
    }
    return labels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '—')
}

function typeClass(type) {
    if (!type) return ''
    if (type === 'equipo') return 'is-purple'
    if (type === 'accesorio') return 'is-cyan'
    if (type === 'consumible') return 'is-orange'
    if (type === 'refaccion') return 'is-pink'
    return ''
}

function downloadPDF() {
    generateSimplePDF(props.item)
}
</script>

<style scoped>
.detail-shell {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    position: relative;
}

.header-left h3 {
    margin: 0 0 8px 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
}

.header-left h3 small {
    display: inline;
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
    margin-left: 8px;
}

.header-left .subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 400;
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.btn-pdf-detail,
.btn-close-detail {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s ease;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.btn-pdf-detail:hover,
.btn-close-detail:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
}

.btn-pdf-detail:active,
.btn-close-detail:active {
    transform: translateY(0);
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.card {
    padding: 20px;
    border-radius: 10px;
    background: white;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
}

.card:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card h4 {
    margin: 0 0 18px 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;
    letter-spacing: -0.3px;
}

.info-card-primary,
.info-card-secondary {
    grid-column: 1;
}

.history-card-full {
    grid-column: 1 / -1;
}

.action-card {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 2px solid #bfdbfe;
}

.action-card h4 {
    color: #1e40af;
    border-bottom-color: #93c5fd;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    font-size: 0.9rem;
    border-bottom: 1px solid #f3f4f6;
}

.info-row:last-of-type {
    border-bottom: none;
}

.info-row .label {
    font-weight: 600;
    color: #374151;
    flex: 0 0 40%;
}

.info-row .value {
    color: #1f2937;
    font-weight: 500;
    text-align: right;
    flex: 1;
}

.info-row .code {
    font-family: 'Courier New', monospace;
    background: #f9fafb;
    padding: 6px 10px;
    border-radius: 6px;
    color: #1f2937;
    font-weight: 700;
    border: 1px solid #e5e7eb;
    text-align: right;
    flex: 1;
}

.type-badge-detail {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.type-badge-detail.is-purple {
    background: #8b5cf6;
}

.type-badge-detail.is-cyan {
    background: #06b6d4;
}

.type-badge-detail.is-orange {
    background: #f97316;
}

.type-badge-detail.is-pink {
    background: #ec4899;
}

.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.status-badge.is-green {
    background: #10b981;
}

.status-badge.is-yellow {
    background: #f59e0b;
}

.status-badge.is-blue {
    background: #3b82f6;
}

.status-mini {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-mini.is-active {
    background: #d1fae5;
    color: #065f46;
}

.status-mini.is-inactive {
    background: #fee2e2;
    color: #7f1d1d;
}

.status-mini.is-pending {
    background: #fef3c7;
    color: #78350f;
}

.action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    flex-wrap: wrap;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    min-width: 140px;
    padding: 11px 16px;
    border-radius: 8px;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-start {
    background: #10b981;
    color: white;
}

.btn-start:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-finish {
    background: #f59e0b;
    color: white;
}

.btn-finish:hover {
    background: #d97706;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-download {
    background: #3b82f6;
    color: white;
    flex-basis: auto;
}

.btn-download:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-qr {
    background: #8b5cf6;
    color: white;
    flex-basis: auto;
}

.btn-qr:hover {
    background: #7c3aed;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

@media (max-width: 1024px) {
    .detail-shell {
        border-radius: 8px;
    }

    .detail-header {
        padding: 20px;
    }

    .header-left h3 {
        font-size: 1.1rem;
    }

    .detail-content {
        padding: 20px;
        gap: 14px;
    }

    .card {
        padding: 16px;
    }

    .card h4 {
        font-size: 0.95rem;
        margin-bottom: 14px;
    }

    .info-row {
        flex-direction: column;
        align-items: flex-start;
        padding: 10px 0;
    }

    .info-row .label,
    .info-row .value,
    .info-row .code {
        text-align: left;
        flex: none;
        width: 100%;
    }

    .info-row .label {
        margin-bottom: 4px;
    }

    .action-buttons {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>