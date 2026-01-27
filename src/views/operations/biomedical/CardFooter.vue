<template>
    <div class="card-footer">
        <div class="footer-left">
            <div v-if="isFieldVisible(item, 'TIPO DE MANTENIMIENTO')" class="maintenance-badge"
                :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()">
                <div class="badge-icon" :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()"></div>
                {{ item['TIPO DE MANTENIMIENTO'] }}
            </div>
            <div v-if="isFieldVisible(item, 'FUNCIONAL SI NO')" class="functional-indicator"
                :class="item['FUNCIONAL SI NO']?.toLowerCase()">
                <span class="indicator-dot"></span>
                {{
                    item['FUNCIONAL SI NO'] === 'SI'
                        ? 'Funcional'
                        : item['FUNCIONAL SI NO'] === 'NO'
                            ? 'No Funcional'
                            : item['FUNCIONAL SI NO']
                }}
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    item: {
        type: Object,
        required: true
    },
    isFieldVisible: {
        type: Function,
        required: true
    }
})
</script>

<style scoped>
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #4b5563;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    position: relative;
    z-index: 2;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}


.maintenance-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 8px;
    letter-spacing: 0.3px;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
}

.badge-icon {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
}

.maintenance-badge.preventivo {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.3);
}

.maintenance-badge.preventivo .badge-icon {
    background: #3b82f6;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

.maintenance-badge.correctivo {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.3);
}

.maintenance-badge.correctivo .badge-icon {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.functional-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(71, 85, 105, 0.1);
    border: 1px solid rgba(71, 85, 105, 0.2);
}

.indicator-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
    transition: all 0.2s ease;
}

.functional-indicator.si {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.3);
}

.functional-indicator.si .indicator-dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
    animation: pulse-green 2s infinite;
}

/* Maintenance bar */
.maintenance-bar {
    position: relative;
    width: 180px;
    height: 8px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.06);
}

.maintenance-bar.track-amber {
    background: rgba(245, 158, 11, 0.18);
    border: 1px solid rgba(245, 158, 11, 0.35);
}

.maintenance-bar.track-green {
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(16, 185, 129, 0.35);
}

.bar-fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
}

.fill-loop {
    background: linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.8) 50%, transparent 100%);
    animation: progress-loop 2.4s ease-in-out infinite;
}

.fill-full {
    background: linear-gradient(90deg, #10b981, #34d399);
}

@keyframes progress-loop {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}


@keyframes pulse-green {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

.functional-indicator.no {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
}

.functional-indicator.no .indicator-dot {
    background: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
    animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}
</style>
