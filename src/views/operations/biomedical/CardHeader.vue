<template>
    <div class="card-header">
        <div class="card-header-top">
            <div class="card-no-wrapper">
                <div class="card-no">
                    <span class="card-pill-label">Num de Inventario </span>
                    <span class="card-pill-value"
                        :class="{ 'value-na': !hasRealValue(item['No DE INVENTARIO']) }">
                        {{ displayValue(item['No DE INVENTARIO']) }}
                    </span>
                </div>
                <div class="card-no-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                    </svg>
                </div>
            </div>

            <div class="card-record">
                <span class="card-record-label">No</span>
                <span class="card-record-value" :title="String(displayValue(item['No']))"
                    :class="{ 'value-na': !hasRealValue(item['No']) }">
                    {{ displayValue(item['No']) }}
                </span>
            </div>

            <button v-if="isExpanded" class="card-close" @click.stop="onToggleSelect(null)"
                aria-label="Cerrar" title="Cerrar">✕</button>
        </div>

        <div class="card-header-bottom">
            <div class="card-status-container">
                <span class="card-status-label">Estatus</span>
                <span class="card-status"
                    :class="[getStatusTextClass(item), getStatusPillClass(item)]">
                    <span class="status-dot" :class="getStatusTextClass(item)"></span>
                    {{ item['ESTATUS'] || 'Sin estado' }}
                </span>
            </div>

            <div class="card-title-group">
                <span v-if="isFieldVisible(item, 'EQUIPO MEDICO')" class="card-equipo">
                    {{ item['EQUIPO MEDICO'] }}
                </span>
                <span v-if="isSparse(item)" class="sparse-badge">Pocos datos</span>
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
    isExpanded: {
        type: Boolean,
        required: true
    },
    getStatusAccentClass: {
        type: Function,
        required: true
    },
    getStatusTextClass: {
        type: Function,
        required: true
    },
    getStatusPillClass: {
        type: Function,
        required: true
    },
    isSparse: {
        type: Function,
        required: true
    },
    isFieldVisible: {
        type: Function,
        required: true
    },
    displayValue: {
        type: Function,
        required: true
    },
    hasRealValue: {
        type: Function,
        required: true
    },
    onToggleSelect: {
        type: Function,
        required: true
    }
})
</script>

<style scoped>
.card-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 16px;
    position: relative;
    z-index: 2;
}

.card-header-top {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
}

.card-no-wrapper {
    display: flex;
    align-items: stretch;
    gap: 8px;
    flex: 0 1 auto;
}

.card-header-bottom {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
}

.card-title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.card-no {
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: rgba(6, 182, 212, 0.15);
    padding: 8px 12px;
    border-radius: 10px;
    border: 1.5px solid rgba(6, 182, 212, 0.25);
    justify-content: center;
    flex: 0 1 auto;
}

.card-pill-label {
    font-size: 0.75rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.98);
    text-transform: uppercase;
    letter-spacing: 0.9px;
    display: block;
    line-height: 1.2;
    white-space: normal;
    word-break: break-word;
}

.card-pill-value {
    font-size: 0.9rem;
    font-weight: 800;
    color: #e5faff;
    letter-spacing: 0.2px;
    line-height: 1.08;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
    word-break: break-word;
}

.card-pill-value.value-na {
    color: #6b7280;
    font-style: italic;
    font-weight: 500;
    opacity: 0.7;
}

.card-no-icon {
    color: #06b6d4;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    flex: 0 0 auto;
}

.card-record {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex: 0 0 auto;
    max-width: 140px;
    min-width: 80px;
    z-index: 4;
}

.card-record-label {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 700;
}

.card-record-value {
    font-weight: 800;
    font-size: 0.9rem;
    color: #e5faff;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    line-height: 1.2;
}

.card-record-value.value-na {
    color: #6b7280;
    font-style: italic;
    font-weight: 500;
    opacity: 0.7;
}

@media (max-width: 768px) {
    .card-record {
        max-width: 110px;
    }
}

.card-equipo {
    font-size: 0.95rem;
    font-weight: 700;
    color: #f3f4f6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    white-space: normal;
    line-height: 1.12;
    opacity: 0.95;
    word-break: break-word;
    max-height: 3.6em;
    padding-right: 8px;
}

.card-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(15, 23, 42, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(229, 231, 235, 0.98);
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 6;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42);
    transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.card-close:hover {
    background: rgba(6, 182, 212, 0.14);
    border-color: rgba(6, 182, 212, 0.45);
    transform: scale(1.07) rotate(2deg);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.52), 0 0 0 6px rgba(6, 182, 212, 0.08);
}

.card-close:active {
    transform: scale(0.98);
}

.card-close:focus-visible {
    outline: none;
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.52), 0 0 0 2px rgba(17, 24, 39, 0.9), 0 0 0 5px rgba(6, 182, 212, 0.7);
}

.card-status-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    flex: 0 0 auto;
}

.card-status-label {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 700;
    line-height: 1.1;
    opacity: 0.95;
}

.card-status {
    font-size: 0.78rem;
    font-weight: 800;
    padding: 7px 12px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.card-status.activo {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%);
    color: #86efac;
    border-color: rgba(34, 197, 94, 0.3);
}

.card-status.activo .status-dot {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.card-status.inactivo {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.3);
}

.card-status.inactivo .status-dot {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

.card-status.mantenimiento,
.card-status.mantenimientos,
.card-status.mantto {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.1) 100%);
    color: #fde68a;
    border-color: rgba(245, 158, 11, 0.35);
}

.card-status.mantenimiento .status-dot,
.card-status.mantenimientos .status-dot,
.card-status.mantto .status-dot {
    background: #f59e0b;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.65);
}

.card-status.operativo {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.16) 0%, rgba(34, 197, 94, 0.1) 100%);
    color: #bbf7d0;
    border-color: rgba(34, 197, 94, 0.34);
}

.card-status.operativo .status-dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.65);
}

.card-status.no,
.card-status.fuera,
.card-status.baja {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.1) 100%);
    color: #fecaca;
    border-color: rgba(239, 68, 68, 0.35);
}

.card-status.no .status-dot,
.card-status.fuera .status-dot,
.card-status.baja .status-dot {
    background: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.65);
}

.card-status.status-success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.12) 100%);
    border-color: rgba(34, 197, 94, 0.45);
}

.card-status.status-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(245, 158, 11, 0.12) 100%);
    border-color: rgba(245, 158, 11, 0.5);
}

.card-status.status-critical {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.12) 100%);
    border-color: rgba(239, 68, 68, 0.5);
}

.card-status.status-default {
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.14) 0%, rgba(148, 163, 184, 0.08) 100%);
    border-color: rgba(148, 163, 184, 0.28);
}

.card-status.status-unknown {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.1) 100%);
    border-color: rgba(99, 102, 241, 0.38);
    color: #c7d2fe;
}

.card-status.sin-estado {
    border-color: rgba(99, 102, 241, 0.5);
}

.card-status.sin-estado .status-dot {
    background: #818cf8;
    box-shadow: 0 0 10px rgba(129, 140, 248, 0.7);
}

.card-status.propio {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.12) 100%);
    border-color: rgba(34, 197, 94, 0.5);
    color: #bbf7d0;
}

.card-status.propio .status-dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
}

.sparse-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid rgba(245, 158, 11, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.2px;
}
</style>
