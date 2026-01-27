<template>
    <div class="maintenance-overlay" v-if="isVisible">
        <div class="maintenance-content">
            <!-- Animated Icon -->
            <div class="maintenance-icon-wrapper">
                <div class="maintenance-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M12 2v20M4 8h16M4 16h16M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                    </svg>
                </div>
                <div class="maintenance-pulse"></div>
            </div>

            <!-- Status Text -->
            <div class="maintenance-status">
                <h3>En Mantenimiento</h3>
                <p class="maintenance-company" v-if="companyName">
                    <span class="company-label">Empresa:</span>
                    <span class="company-value">{{ companyName }}</span>
                </p>
                <p class="maintenance-date" v-if="startedAt">
                    <span class="date-label">Inicio:</span>
                    <span class="date-value">{{ formatDate(startedAt) }}</span>
                </p>
                <p class="maintenance-type" v-if="maintenanceType">
                    <span class="type-label">Tipo:</span>
                    <span class="type-value">{{ maintenanceType }}</span>
                </p>
            </div>

            <!-- Loading Animation -->
            <div class="maintenance-loader">
                <div class="loader-bar"></div>
                <div class="loader-bar"></div>
                <div class="loader-bar"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    item: {
        type: Object,
        default: null
    },
    maintenanceData: {
        type: Object,
        default: null
    }
})

const isVisible = computed(() => {
    return !!props.item && !!props.maintenanceData
})

const companyName = computed(() => {
    return props.maintenanceData?.data?.empresa || 'Sin especificar'
})

const startedAt = computed(() => {
    return props.maintenanceData?.startedAt
})

const maintenanceType = computed(() => {
    const tipo = props.maintenanceData?.data?.tipo || ''
    return tipo.charAt(0).toUpperCase() + tipo.slice(1)
})

function formatDate(isoString) {
    if (!isoString) return ''
    try {
        const date = new Date(isoString)
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (e) {
        return isoString
    }
}
</script>

<style scoped>
.maintenance-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    z-index: 10;
    animation: overlay-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.maintenance-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 24px;
    text-align: center;
    background: rgba(20, 40, 80, 0.95);
    border-radius: 14px;
    border: 3px solid #00ffff;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4);
}

/* Icon with pulse animation */
.maintenance-icon-wrapper {
    position: relative;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.maintenance-icon {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(99, 160, 255, 0.7));
    border: 3px solid #7dd3fc;
    border-radius: 16px;
    color: #ffffff;
    animation: icon-float 3s ease-in-out infinite;
    position: relative;
    z-index: 2;
    box-shadow: 0 0 30px rgba(125, 211, 252, 1);
}

.maintenance-icon svg {
    width: 40px;
    height: 40px;
    stroke-width: 1.5;
}

.maintenance-pulse {
    position: absolute;
    inset: 0;
    border: 2px solid #7dd3fc;
    border-radius: 16px;
    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    box-shadow: 0 0 20px rgba(125, 211, 252, 0.8);
}

/* Status information */
.maintenance-status {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.maintenance-status h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.maintenance-company,
.maintenance-date,
.maintenance-type {
    margin: 0;
    font-size: 0.9rem;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
    flex-wrap: wrap;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.company-label,
.date-label,
.type-label {
    font-weight: 700;
    color: #7dd3fc;
    font-size: 0.85rem;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.company-value,
.date-value,
.type-value {
    color: #ffffff;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Loading bars animation */
.maintenance-loader {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 30px;
}

.loader-bar {
    width: 5px;
    background: linear-gradient(180deg, #3b82f6, #7dd3fc);
    border-radius: 3px;
    animation: bar-pulse 1.2s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(125, 211, 252, 0.8);
}

.loader-bar:nth-child(1) {
    height: 12px;
    animation-delay: 0s;
}

.loader-bar:nth-child(2) {
    height: 18px;
    animation-delay: 0.15s;
}

.loader-bar:nth-child(3) {
    height: 12px;
    animation-delay: 0.3s;
}

/* Animations */
@keyframes overlay-fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes icon-float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-8px);
    }
}

@keyframes pulse-ring {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(1.2);
        opacity: 0;
    }
}

@keyframes bar-pulse {

    0%,
    100% {
        opacity: 0.5;
        height: 12px;
    }

    50% {
        opacity: 1;
        height: 20px;
    }
}

/* Responsive */
@media (max-width: 640px) {
    .maintenance-content {
        gap: 16px;
        padding: 16px;
    }

    .maintenance-status h3 {
        font-size: 1.1rem;
    }

    .maintenance-company,
    .maintenance-date,
    .maintenance-type {
        font-size: 0.85rem;
    }

    .maintenance-icon {
        width: 60px;
        height: 60px;
    }

    .maintenance-icon svg {
        width: 32px;
        height: 32px;
    }
}
</style>
