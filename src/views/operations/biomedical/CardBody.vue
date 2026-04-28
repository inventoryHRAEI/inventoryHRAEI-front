<template>
    <div class="card-body">
        <div class="card-info-row">
            <span class="card-label">
                <IIcon name="ic:baseline-business" size="14" />
                Marca:
            </span>
            <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MARCA']) }">
                {{ displayValue(item['MARCA']) }}
            </span>
        </div>
        
        <div class="card-info-row">
            <span class="card-label">
                <IIcon name="ic:baseline-architecture" size="14" />
                Modelo:
            </span>
            <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MODELO']) }">
                {{ displayValue(item['MODELO']) }}
            </span>
        </div>

        <div v-if="hasRealValue(item['NUMERO DE SERIE'])" class="card-info-row">
            <span class="card-label">
                <IIcon name="ic:baseline-fingerprint" size="14" />
                S/N:
            </span>
            <span class="card-value" :class="{ 'value-na': !hasRealValue(item['NUMERO DE SERIE']) }">
                {{ displayValue(item['NUMERO DE SERIE']) }}
            </span>
        </div>

        <div v-if="hasRealValue(item['UBICACION ESPECIFICA'])" class="card-info-row">
            <span class="card-label">
                <IIcon name="ic:baseline-location-on" size="14" />
                Ubicación:
            </span>
            <span class="card-value card-value-wrap" :class="{ 'value-na': !hasRealValue(item['UBICACION ESPECIFICA']) }">
                {{ displayValue(item['UBICACION ESPECIFICA']) }}
            </span>
        </div>
        
        <div class="card-info-row">
            <span class="card-label">
                <IIcon name="ic:baseline-qr-code" size="14" />
                CNIS:
            </span>
            <span class="card-value card-cnis"
                :class="{ 'value-na': !hasRealValue(item['CLAVE CNIS']) }">
                {{ displayValue(item['CLAVE CNIS']) }}
            </span>
        </div>

        <template v-for="id in activeDynamicFilterIds" :key="'dyn-' + id">
            <div v-if="!isDynamicFieldDuplicate(id)" class="card-info-row">
                <span class="card-label"><IIcon name="ic:baseline-tune" size="12" /> {{ getDynamicFieldLabel(id) }}:</span>
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
import IIcon from '@/components/IIcon.vue'

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
    gap: 8px;
    padding: 10px 14px;
    flex: 1;
    position: relative;
    z-index: 2;
}

.card-info-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 8px;
    padding: 6px 0;
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

.card-label svg, .card-label .vueicon, .card-label svg[data-vue-icon] {
    color: #06b6d4;
    opacity: 0.95;
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
