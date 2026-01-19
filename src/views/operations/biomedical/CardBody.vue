<template>
    <div class="card-body">
        <div class="card-info-row">
            <span class="card-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2 3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <line x1="3" x2="21" y1="6" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Marca:
            </span>
            <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MARCA']) }">
                {{ displayValue(item['MARCA']) }}
            </span>
        </div>
        
        <div class="card-info-row">
            <span class="card-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Modelo:
            </span>
            <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MODELO']) }">
                {{ displayValue(item['MODELO']) }}
            </span>
        </div>
        
        <div class="card-info-row">
            <span class="card-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 7h.01M7 7h.01M7 15h.01M15 15h.01M12 12V9" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                CNIS:
            </span>
            <span class="card-value card-cnis"
                :class="{ 'value-na': !hasRealValue(item['CLAVE CNIS']) }">
                {{ displayValue(item['CLAVE CNIS']) }}
            </span>
        </div>

        <template v-for="id in activeDynamicFilterIds" :key="'dyn-' + id">
            <div v-if="!isDynamicFieldDuplicate(id)" class="card-info-row">
                <span class="card-label">{{ getDynamicFieldLabel(id) }}:</span>
                <span v-if="id.includes('refaccion_accesorio_consumible') || id.includes('REFACCION_ACCESORIO_CONSUMIBLE')"
                    class="card-value card-value-wrap"
                    :class="{ 'value-na': !hasRealValue(getItemFieldValue(item, id)) }">
                    {{ displayValue(getItemFieldValue(item, id)) }}
                </span>
                <span v-else class="card-value card-value-wrap"
                    :class="{ 'value-na': !hasRealValue(getItemFieldValue(item, id)) }">
                    {{ displayValue(getItemFieldValue(item, id)) }}
                </span>
            </div>
        </template>
    </div>
</template>

<script setup>
defineProps({
    item: {
        type: Object,
        required: true
    },
    activeDynamicFilterIds: {
        type: Array,
        default: () => []
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
    displayValue: {
        type: Function,
        required: true
    },
    hasRealValue: {
        type: Function,
        required: true
    }
})
</script>

<style scoped>
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
</style>
