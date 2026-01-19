<template>
    <div class="cards-section">
        <div class="cards-header">
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Resumen de Equipos
            </h3>
            <div class="cards-header-right">
                <span class="cards-count">Mostrando {{ displayedCards.length }} de {{ visibleCount }}</span>
                <button v-if="openScanModal" type="button" class="scan-global-btn" @click="openScanModal">
                    <VueIcon name="ic:scan-barcode" size="18" color="#e5f0ff" />
                    <span>Escanear</span>
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading">
            <div class="loader-spinner"></div>
            <p>Cargando datos...</p>
        </div>

        <div v-else-if="filteredCount === 0" class="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <p>No se encontraron equipos con los filtros aplicados</p>
        </div>

        <div v-else class="cards-grid">
            <!-- Render items progressively (batch rendering for tunnel) -->
            <CardItem
                v-for="(item, idx) in displayedCards.slice(0, renderedCount > 0 ? renderedCount : displayedCards.length)"
                :key="getItemKey(item, idx)"
                :item="item"
                :index="idx"
                :on-toggle-select="toggleSelect"
                :on-show-barcode="handleShowBarcode"
                :get-item-key="getItemKey"
                :is-expanded="isExpanded"
                :is-in-maintenance="isInMaintenance"
                :get-status-accent-class="getStatusAccentClass"
                :get-status-glow-class="getStatusGlowClass"
                :get-status-pill-class="getStatusPillClass"
                :get-status-text-class="getStatusTextClass"
                :is-sparse="isSparse"
                :is-field-visible="isFieldVisible"
                :display-value="displayValue"
                :has-real-value="hasRealValue"
                :is-dynamic-field-duplicate="isDynamicFieldDuplicate"
                :get-dynamic-field-label="getDynamicFieldLabel"
                :get-item-field-value="getItemFieldValue"
                :active-dynamic-filter-ids="activeDynamicFilterIds"
            />
        </div>
    </div>
</template>

<script setup>
import CardItem from './CardItem.vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

const props = defineProps({
    loading: Boolean,
    filteredCount: {
        type: Number,
        default: 0
    },
    displayedCards: {
        type: Array,
        default: () => []
    },
    visibleCount: {
        type: Number,
        default: 0
    },
    activeDynamicFilterIds: {
        type: Array,
        default: () => []
    },
    handleShowBarcode: {
        type: Function,
        required: true
    },
    getItemKey: {
        type: Function,
        required: true
    },
    toggleSelect: {
        type: Function,
        required: true
    },
    isExpanded: {
        type: Function,
        required: true
    },
    isSparse: {
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
    getStatusTextClass: {
        type: Function,
        required: true
    },
    getStatusPillClass: {
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
    openScanModal: {
        type: Function,
        default: null
    },
    renderedCount: {
        type: Number,
        default: 0
    }
})
</script>

<style scoped>
.cards-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cards-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.cards-header h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
}

.cards-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.cards-count {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
}

.scan-global-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    background: rgba(37, 99, 235, 0.08);
    color: #e5f0ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
}

.scan-global-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 12px 0;
}

.loading,
.no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
}

.loading p,
.no-results p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    margin-top: 12px;
}

.loader-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #06b6d4;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.no-results svg {
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 12px;
}
</style>
