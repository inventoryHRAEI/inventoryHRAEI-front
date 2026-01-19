<template>
    <div class="biomedical-card-actions">
        <button 
            class="action-btn action-start-maintenance"
            @click="emitShowBarcode"
            :title="actionTitle"
            aria-label="Mostrar código de barras">
            <VueIcon name="ic:scan-barcode" size="32" color="#fff" class="action-icon icon-vistoso" />
            <span class="action-label">Mostrar código de barras</span>
        </button>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

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

const emit = defineEmits(['show-barcode'])

function emitShowBarcode() {
    emit('show-barcode', props.item)
}
</script>

<style scoped>
.biomedical-card-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #4b5563;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-radius: 0 0 8px 8px;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: 1px solid #1e40af;
    border-radius: 6px;
    cursor: pointer;
    transition: all 200ms cubic-bezier(0.2, 0.85, 0.3, 1);
    white-space: nowrap;
    text-transform: none;
    position: relative;
    overflow: hidden;
}

.action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 400ms ease;
}

.action-btn:hover::before {
    left: 100%;
}

.action-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border-color: #1e3a8a;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.action-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.action-btn:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
}

.action-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: inline-block;
    color: currentColor;
}

.icon-vistoso {
    filter: drop-shadow(0 2px 6px rgba(37,99,235,0.25));
    width: 32px !important;
    height: 32px !important;
    transition: filter 0.2s;
}

.action-label {
    display: inline;
    font-weight: 600;
}

/* Estados deshabilitados */
.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.action-btn:disabled:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: none;
    border-color: #1e40af;
}

.action-btn:disabled::before {
    display: none;
}

/* Responsive */
@media (max-width: 768px) {
    .biomedical-card-actions {
        padding: 10px 12px;
    }

    .action-btn {
        padding: 7px 14px;
        font-size: 0.75rem;
        gap: 6px;
    }

    .action-icon {
        width: 14px;
        height: 14px;
    }
}

@media (max-width: 480px) {
    .action-btn {
        padding: 6px 12px;
        font-size: 0.7rem;
        gap: 4px;
    }

    .action-icon {
        width: 12px;
        height: 12px;
    }

    .action-label {
        display: none;
    }
}
</style>
