<template>
    <div class="biomedical-card-actions">
        <!-- Botón Actualizar Información -->
        <button
            type="button"
            class="action-btn action-edit-info"
            @click.stop.prevent="emitShowUpdatePanel"
            title="Actualizar información completa del equipo"
            aria-label="Actualizar información">
            <VueIcon name="ic:baseline-edit" size="18" class="action-icon" />
            <span class="action-label">Actualizar</span>
        </button>

        <!-- Botón Ver Historial -->
        <button
            type="button"
            class="action-btn action-view-history"
            @click.stop.prevent="emitShowHistoryPanel"
            title="Ver historial del equipo"
            aria-label="Ver historial del equipo">
            <VueIcon name="ic:baseline-history" size="18" class="action-icon" />
            <span class="action-label">Historial</span>
        </button>

        <!-- Botón Código de Barras / Etiqueta -->
        <button
            type="button"
            class="action-btn action-barcode"
            @click.stop.prevent="emitShowBarcode"
            :title="actionTitle"
            aria-label="Mostrar código de barras">
            <VueIcon name="ic:baseline-qr-code-2" size="18" class="action-icon" />
            <span class="action-label">Etiqueta</span>
        </button>

        <!-- Botón Solicitar Mantenimiento -->
        <button
            type="button"
            class="action-btn action-maintenance"
            @click.stop.prevent="emitRequestMaintenance"
            title="Solicitar mantenimiento para este equipo"
            aria-label="Solicitar mantenimiento">
            <VueIcon name="ic:baseline-build" size="18" class="action-icon" />
            <span class="action-label">Mantto.</span>
        </button>
    </div>
</template>

<script setup>
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { usePermissions } from '@/composables/usePermissions.js'

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    actionTitle: {
        type: String,
        default: 'Muestra el código de barras para este equipo'
    }
})

const emit = defineEmits(['show-barcode', 'show-update-panel', 'show-history-panel', 'request-maintenance'])
let lastEmitAt = 0

function emitShowBarcode() {
    const now = Date.now()
    if (now - lastEmitAt < 350) return
    lastEmitAt = now
    emit('show-barcode', props.item)
}

function emitShowUpdatePanel() {
    const now = Date.now()
    if (now - lastEmitAt < 350) return
    lastEmitAt = now
    const { canEditBiomedicalEquipment } = usePermissions()
    if (!canEditBiomedicalEquipment.value) {
        console.warn('[BiomedicCardActions] update-panel blocked: insufficient permissions')
        return
    }
    emit('show-update-panel', props.item)
}

function emitShowHistoryPanel() {
    const now = Date.now()
    if (now - lastEmitAt < 350) return
    lastEmitAt = now
    emit('show-history-panel', props.item)
}

function emitRequestMaintenance() {
    const now = Date.now()
    if (now - lastEmitAt < 350) return
    lastEmitAt = now
    const { canManageBiomedical } = usePermissions()
    if (!canManageBiomedical.value) {
        console.warn('[BiomedicCardActions] request-maintenance blocked: insufficient permissions')
        return
    }
    const code = props.item?.['No DE INVENTARIO'] || props.item?.['No DE INVENTARIO?'] || ''
    emit('request-maintenance', { item: props.item, code })
}
</script>

<style scoped>
.biomedical-card-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #111827;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0 0 12px 12px;
    flex-wrap: wrap; /* Evita que se corten en pantallas pequeñas */
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
    background: #374151;
    border: 1px solid #4b5563;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    flex: 1 1 0px;
    min-width: 110px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
}

.action-btn:active {
    transform: translateY(0);
}

/* Colores y Sombras */
.action-edit-info {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-color: #c2410c;
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
}

.action-view-history {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.action-barcode {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-color: #047857;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.action-maintenance {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: #b45309;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.action-maintenance:hover {
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
}

.action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
}

.action-label {
    text-transform: none;
    letter-spacing: 0.01em;
    font-size: 0.85rem;
}

/* Media Queries para ajuste fino */
@media (max-width: 640px) {
    .biomedical-card-actions {
        padding: 8px;
        gap: 6px;
    }
    
    .action-btn {
        padding: 6px 10px;
        font-size: 0.75rem;
        min-width: 80px;
    }
}

@media (max-width: 400px) {
    .action-btn {
        flex: 1 1 100%; /* Un botón por fila en pantallas muy pequeñas */
        max-width: none;
    }
}
</style>
