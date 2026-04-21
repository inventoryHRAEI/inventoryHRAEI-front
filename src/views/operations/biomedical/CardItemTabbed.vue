<template>
    <div class="card">
        <div class="card__header">
            <div class="card__header-content">
                <span class="card__badge">{{ getCode }}</span>
                <h3 class="card__heading">{{ getName }}</h3>
            </div>
        </div>

        <div class="card__tabs-wrapper">
            <div class="card__tabs">
                <button 
                    v-for="tab in tabsList"
                    :key="tab"
                    class="card__tab"
                    :class="{ 'card__tab--active': currentTab === tab }"
                    @click="currentTab = tab"
                >
                    {{ tab }}
                </button>
            </div>
        </div>

        <div class="card__body">
            <div v-if="currentTab === 'Básica'" class="card__section">
                <div v-for="(value, key) in basicFields" :key="key" class="card__item">
                    <div class="card__item-label">{{ formatLabel(key) }}</div>
                    <div class="card__item-value">{{ formatValue(value) }}</div>
                </div>
            </div>

            <div v-if="currentTab === 'Ubicación'" class="card__section">
                <div v-for="(value, key) in locationFields" :key="key" class="card__item">
                    <div class="card__item-label">{{ formatLabel(key) }}</div>
                    <div class="card__item-value">{{ formatValue(value) }}</div>
                </div>
            </div>

            <div v-if="currentTab === 'Técnica'" class="card__section">
                <div v-for="(value, key) in technicalFields" :key="key" class="card__item">
                    <div class="card__item-label">{{ formatLabel(key) }}</div>
                    <div class="card__item-value">{{ formatValue(value) }}</div>
                </div>
            </div>

            <div v-if="currentTab === 'Otros'" class="card__section">
                <div v-for="(value, key) in otherFields" :key="key" class="card__item">
                    <div class="card__item-label">{{ formatLabel(key) }}</div>
                    <div class="card__item-value">{{ formatValue(value) }}</div>
                </div>
            </div>

            <div v-if="currentTab === 'Todo'" class="card__section">
                <div v-for="(value, key) in props.item" :key="key" class="card__item">
                    <div class="card__item-label">{{ formatLabel(key) }}</div>
                    <div class="card__item-value">{{ formatValue(value) }}</div>
                </div>
            </div>
        </div>

        <div class="card__actions">
            <button class="card__btn card__btn--history" @click="onHistory" title="Ver historial">
                <span class="card__btn-icon">📋</span>
                <span class="card__btn-text">Historial</span>
            </button>
            <button class="card__btn card__btn--edit" @click="onEdit" title="Editar">
                <span class="card__btn-icon">✏️</span>
                <span class="card__btn-text">Editar</span>
            </button>
            <button class="card__btn card__btn--maintenance" @click="onMaintenance" title="Mantenimiento">
                <span class="card__btn-icon">🔧</span>
                <span class="card__btn-text">Mantenimiento</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    index: Number,
    onToggleSelect: Function,
    isExpanded: Function,
    isInMaintenance: Function,
    getMaintenanceEntry: Function,
    getStatusAccentClass: Function,
    getStatusGlowClass: Function,
    getStatusPillClass: Function,
    getStatusTextClass: Function,
    isSparse: Function,
    isFieldVisible: Function,
    displayValue: Function,
    hasRealValue: Function,
    isDynamicFieldDuplicate: Function,
    getDynamicFieldLabel: Function,
    getItemFieldValue: Function,
    activeDynamicFilterIds: Array,
    getItemKey: Function,
    onShowBarcode: Function,
    onShowUpdatePanel: Function,
    onShowHistoryPanel: Function
})

const emit = defineEmits(['request-maintenance'])

const currentTab = ref('Básica')
const tabsList = ['Básica', 'Ubicación', 'Técnica', 'Otros', 'Todo']

const getCode = computed(() => {
    return props.item?.['No DE INVENTARIO'] || props.item?.['CODIGO'] || 'N/A'
})

const getName = computed(() => {
    return props.item?.['EQUIPO MEDICO'] || 'Equipo'
})

const basicFields = computed(() => {
    if (!props.item) return {}
    const basicKeywords = ['EQUIPO', 'INVENTARIO', 'ESTATUS', 'VALOR', 'ADQUISICION', 'DESCRIPCION', 'AÑO', 'ESTADO']
    const result = {}
    
    Object.entries(props.item).forEach(([key, value]) => {
        const upperKey = key.toUpperCase()
        if (basicKeywords.some(keyword => upperKey.includes(keyword))) {
            result[key] = value
        }
    })
    
    return result
})

const locationFields = computed(() => {
    if (!props.item) return {}
    const locationKeywords = ['UNIDAD', 'UBICACION', 'DEPARTAMENTO', 'PISO', 'SALA', 'ZONA', 'LOCALIZACIÓN', 'LUGAR']
    const result = {}
    
    Object.entries(props.item).forEach(([key, value]) => {
        const upperKey = key.toUpperCase()
        if (locationKeywords.some(keyword => upperKey.includes(keyword))) {
            result[key] = value
        }
    })
    
    return result
})

const technicalFields = computed(() => {
    if (!props.item) return {}
    const technicalKeywords = ['MARCA', 'MODELO', 'SERIE', 'ESPECIFICACION', 'VOLTAJE', 'FRECUENCIA', 'POTENCIA', 'ACCESORIOS', 'TECNICO', 'FABRICANTE', 'NUMERO DE SERIE', 'CARACTERÍSTICAS']
    const result = {}
    
    Object.entries(props.item).forEach(([key, value]) => {
        const upperKey = key.toUpperCase()
        if (technicalKeywords.some(keyword => upperKey.includes(keyword))) {
            result[key] = value
        }
    })
    
    return result
})

const otherFields = computed(() => {
    if (!props.item) return {}
    const allKeywords = [
        ...['EQUIPO', 'INVENTARIO', 'ESTATUS', 'VALOR', 'ADQUISICION', 'DESCRIPCION', 'AÑO', 'ESTADO'],
        ...['UNIDAD', 'UBICACION', 'DEPARTAMENTO', 'PISO', 'SALA', 'ZONA', 'LOCALIZACIÓN', 'LUGAR'],
        ...['MARCA', 'MODELO', 'SERIE', 'ESPECIFICACION', 'VOLTAJE', 'FRECUENCIA', 'POTENCIA', 'ACCESORIOS', 'TECNICO', 'FABRICANTE', 'NUMERO DE SERIE', 'CARACTERÍSTICAS']
    ]
    
    const result = {}
    
    Object.entries(props.item).forEach(([key, value]) => {
        const upperKey = key.toUpperCase()
        const matchesAny = allKeywords.some(keyword => upperKey.includes(keyword))
        if (!matchesAny) {
            result[key] = value
        }
    })
    
    return result
})

const formatLabel = (label) => {
    return String(label)
        .toUpperCase()
        .replace(/_/g, ' ')
        .trim()
}

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A'
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
    }
    return String(value)
}

const onHistory = () => {
    if (props.onShowHistoryPanel) {
        props.onShowHistoryPanel(props.item)
    }
}

const onEdit = () => {
    if (props.onShowUpdatePanel) {
        props.onShowUpdatePanel(props.item)
    }
}

const onMaintenance = () => {
    emit('request-maintenance', {
        item: props.item,
        code: props.item?.['No DE INVENTARIO']
    })
}
</script>

<style scoped>
.card {
    background: linear-gradient(135deg, #0f172a 0%, #1a1f35 100%);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card:hover {
    border-color: rgba(6, 182, 212, 0.4);
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.15);
}

/* HEADER */
.card__header {
    padding: 18px 20px;
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.02));
    border-bottom: 2px solid rgba(6, 182, 212, 0.15);
    flex-shrink: 0;
}

.card__header-content {
    display: flex;
    align-items: center;
    gap: 14px;
}

.card__badge {
    display: inline-block;
    background: rgba(6, 182, 212, 0.25);
    color: #22d3ee;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    border: 1px solid rgba(6, 182, 212, 0.3);
    white-space: nowrap;
    flex-shrink: 0;
}

.card__heading {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.3px;
}

/* TABS WRAPPER */
.card__tabs-wrapper {
    flex-shrink: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    overflow-x: auto;
}

.card__tabs {
    display: flex;
    gap: 0;
    padding: 0 20px;
}

.card__tabs::-webkit-scrollbar {
    height: 3px;
}

.card__tabs::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.3);
    border-radius: 2px;
}

.card__tab {
    padding: 14px 16px;
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    white-space: nowrap;
    position: relative;
}

.card__tab:hover {
    color: #cbd5e1;
}

.card__tab--active {
    color: #22d3ee;
    border-bottom-color: #06b6d4;
}

/* BODY CONTENT */
.card__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    min-height: 0;
}

.card__section {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.card__item {
    padding: 14px 16px;
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.08);
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
}

.card__item:last-child {
    margin-bottom: 0;
}

.card__item:hover {
    background: rgba(6, 182, 212, 0.08);
    border-color: rgba(6, 182, 212, 0.2);
}

.card__item-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.card__item-value {
    font-size: 0.9rem;
    color: #e2e8f0;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
}

/* ACTIONS FOOTER */
.card__actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 16px 20px;
    border-top: 2px solid rgba(6, 182, 212, 0.15);
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.02), transparent);
    flex-shrink: 0;
}

.card__btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 8px;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.card__btn:hover {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.4);
    color: #22d3ee;
    transform: translateY(-2px);
}

.card__btn-icon {
    font-size: 1.3rem;
    display: block;
}

.card__btn-text {
    font-weight: 600;
    font-size: 0.7rem;
}

/* SCROLLBAR BODY */
.card__body::-webkit-scrollbar {
    width: 8px;
}

.card__body::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.3);
    border-radius: 4px;
}

.card__body::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.3);
    border-radius: 4px;
    border: 2px solid rgba(30, 41, 59, 0.3);
}

.card__body::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.5);
}
</style>
