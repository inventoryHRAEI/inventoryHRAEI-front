<template>
    <div 
        class="maintenance-card"
        @click="onToggleSelect(item)"
        :class="{ 
            active: isExpanded(item, index), 
            expanded: isExpanded(item, index), 
            'card-sparse': isSparse(item), 
            'is-maintenance': isInMaintenance(item) 
        }"
        :aria-expanded="isExpanded(item, index)" 
        tabindex="0" 
        @keydown.enter.prevent="onToggleSelect(item)"
        @keydown.space.prevent="onToggleSelect(item)">
        
        <div class="card-accent" :class="getStatusAccentClass(item)"></div>
        <div class="card-glow" :class="getStatusGlowClass(item)"></div>
        
        <!-- Card Header (lazy) -->
        <Suspense>
            <template #default>
                <CardHeader
                    :item="item"
                    :is-expanded="isExpanded(item, index)"
                    :get-status-text-class="getStatusTextClass"
                    :get-status-pill-class="getStatusPillClass"
                    :is-sparse="isSparse"
                    :is-field-visible="isFieldVisible"
                    :display-value="displayValue"
                    :has-real-value="hasRealValue"
                    :on-toggle-select="onToggleSelect"
                />
            </template>
            <template #fallback>
                <div style="height: 80px;"></div>
            </template>
        </Suspense>

        <!-- Card Body (lazy) -->
        <Suspense>
            <template #default>
                <CardBody
                    :item="item"
                    :active-dynamic-filter-ids="activeDynamicFilterIds"
                    :is-dynamic-field-duplicate="isDynamicFieldDuplicate"
                    :get-dynamic-field-label="getDynamicFieldLabel"
                    :get-item-field-value="getItemFieldValue"
                    :display-value="displayValue"
                    :has-real-value="hasRealValue"
                />
            </template>
            <template #fallback>
                <div style="height: 100px;"></div>
            </template>
        </Suspense>

        <!-- Card Footer (lazy) -->
        <Suspense>
            <template #default>
                <CardFooter
                    :item="item"
                    :is-field-visible="isFieldVisible"
                />
            </template>
            <template #fallback>
                <div style="height: 40px;"></div>
            </template>
        </Suspense>

        <!-- Card Actions (lazy) -->
        <Suspense>
            <template #default>
                <CardActions
                    :item="item"
                    @show-barcode="onShowBarcode"
                />
            </template>
        </Suspense>
        
        <div class="card-hover-effect"></div>
    </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const CardHeader = defineAsyncComponent(() => import('./CardHeader.vue'))
const CardBody = defineAsyncComponent(() => import('./CardBody.vue'))
const CardFooter = defineAsyncComponent(() => import('./CardFooter.vue'))
const CardActions = defineAsyncComponent(() => import('./CardActions.vue'))

defineProps({
    item: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    // Handlers
    onToggleSelect: {
        type: Function,
        required: true
    },
    onShowBarcode: {
        type: Function,
        required: true
    },
    // Getters
    getItemKey: {
        type: Function,
        required: true
    },
    isExpanded: {
        type: Function,
        required: true
    },
    isInMaintenance: {
        type: Function,
        required: true
    },
    getStatusAccentClass: {
        type: Function,
        required: true
    },
    getStatusGlowClass: {
        type: Function,
        required: true
    },
    getStatusPillClass: {
        type: Function,
        required: true
    },
    getStatusTextClass: {
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
    isDynamicFieldDuplicate: {
        type: Function,
        required: true
    },
    getDynamicFieldLabel: {
        type: Function,
        required: true
    },
    getItemFieldValue: {
        type: Function,
        required: true
    },
    // UI state
    activeDynamicFilterIds: {
        type: Array,
        default: () => []
    }
})
</script>

<style scoped>
.maintenance-card {
    contain: layout style paint;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
    position: relative;
    display: flex;
    flex-direction: column;
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.88));
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.5),
        0 8px 24px rgba(6, 182, 212, 0.1);
    transition: 
        transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 180ms ease,
        border-color 180ms ease,
        background 180ms ease;
    min-height: 280px;
}

.maintenance-card:hover {
    transform: translateY(-4px) scale(1.005);
    box-shadow:
        0 28px 70px rgba(6, 182, 212, 0.16),
        0 26px 72px rgba(0, 0, 0, 0.56);
    border-color: rgba(6, 182, 212, 0.5);
}

.maintenance-card.active,
.maintenance-card.expanded {
    border-color: rgba(6, 182, 212, 0.6);
    background: linear-gradient(145deg, rgba(30, 58, 100, 0.95), rgba(15, 35, 60, 0.9));
}

.card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
    transition: all 180ms ease;
    z-index: 1;
}

.card-accent.status-success {
    background: linear-gradient(90deg, #22c55e, rgba(34, 197, 94, 0.3));
}

.card-accent.status-warning {
    background: linear-gradient(90deg, #f59e0b, rgba(245, 158, 11, 0.3));
}

.card-accent.status-critical,
.card-accent.status-error {
    background: linear-gradient(90deg, #ef4444, rgba(239, 68, 68, 0.3));
}

.card-accent.status-default {
    background: linear-gradient(90deg, #06b6d4, rgba(6, 182, 212, 0.3));
}

.card-glow {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 16px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 300ms ease;
    z-index: 0;
}

.card-glow.status-success {
    box-shadow: inset 0 0 30px rgba(34, 197, 94, 0.1), 0 0 40px rgba(34, 197, 94, 0.05);
}

.card-glow.status-warning {
    box-shadow: inset 0 0 30px rgba(245, 158, 11, 0.1), 0 0 40px rgba(245, 158, 11, 0.05);
}

.card-glow.status-critical,
.card-glow.status-error {
    box-shadow: inset 0 0 30px rgba(239, 68, 68, 0.1), 0 0 40px rgba(239, 68, 68, 0.05);
}

.card-glow.status-default {
    box-shadow: inset 0 0 30px rgba(6, 182, 212, 0.1), 0 0 40px rgba(6, 182, 212, 0.05);
}

.maintenance-card:hover .card-glow {
    opacity: 1;
}

.card-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.02) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.maintenance-card:hover .card-hover-effect {
    opacity: 1;
}

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

.maintenance-card.expanded .card-header-top {
    padding-right: 48px;
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

.maintenance-card.expanded .card-equipo {
    line-clamp: 10;
    -webkit-line-clamp: 10;
    max-height: none;
}

.maintenance-card.expanded {
    min-height: 480px;
    transform: translateY(-6px) scale(1.012);
    z-index: 60;
    box-shadow:
        0 28px 70px rgba(6, 182, 212, 0.16),
        0 26px 72px rgba(0, 0, 0, 0.56);
}

.maintenance-card.expanded .card-pill-value,
.maintenance-card.expanded .card-record-value {
    line-clamp: unset;
    -webkit-line-clamp: none;
    white-space: normal;
    overflow: visible;
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

@media (prefers-reduced-motion: reduce) {
    .maintenance-card,
    .card-close,
    .card-accent,
    .card-glow,
    .card-hover-effect {
        transition: none !important;
        animation: none !important;
    }

    .maintenance-card:hover {
        transform: none;
    }
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

.maintenance-card:hover .card-status {
    transform: translateY(-1px);
    box-shadow:
        0 14px 28px rgba(0, 0, 0, 0.34),
        0 0 0 5px rgba(6, 182, 212, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.12) 100%);
    border-color: rgba(34, 197, 94, 0.45);
    box-shadow:
        0 14px 34px rgba(34, 197, 94, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(245, 158, 11, 0.12) 100%);
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow:
        0 14px 34px rgba(245, 158, 11, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-critical {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.12) 100%);
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow:
        0 14px 34px rgba(239, 68, 68, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-default {
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.14) 0%, rgba(148, 163, 184, 0.08) 100%);
    border-color: rgba(148, 163, 184, 0.28);
}

.card-status.status-unknown {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.1) 100%);
    border-color: rgba(99, 102, 241, 0.38);
    color: #c7d2fe;
    box-shadow:
        0 14px 34px rgba(99, 102, 241, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
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

.card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    flex: 1;
    position: relative;
    z-index: 2;
}

.card-info-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #3f475a;
    transition: all 0.2s ease;
}

.card-info-row:last-child {
    border-bottom: none;
}

.card-info-row:hover {
    background: rgba(6, 182, 212, 0.05);
    border-radius: 4px;
    padding-left: 8px;
    padding-right: 8px;
    margin: 0 -8px;
}

.card-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;
    flex-wrap: wrap;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
}

.card-label svg {
    color: #06b6d4;
    opacity: 0.8;
    flex-shrink: 0;
}

.card-value {
    font-size: 0.9rem;
    color: #e5e7eb;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 0;
}

.card-value.card-value-wrap {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
    text-align: left;
    white-space: normal;
    word-break: normal;
    overflow-wrap: break-word;
}

.card-value.value-na {
    color: #6b7280;
    font-style: italic;
    font-weight: 500;
    opacity: 0.7;
}

.card-cnis {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
    color: #06b6d4;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    border: 1px solid rgba(6, 182, 212, 0.3);
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}

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
