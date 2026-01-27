<template>
    <div class="cards-section">
        <div class="cards-header">
            <h3>
                Resumen de Equipos
            </h3>
            <div class="cards-header-right">
                <span class="cards-count">
                    Mostrando {{ props.displayedStart }}-{{ props.displayedEnd }} de {{ props.visibleCount || 0 }}
                </span>
                <button v-if="props.openScanModal" type="button" class="scan-global-btn" @click="props.openScanModal"
                    title="Escanear equipos con cámara">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>Escanear</span>
                </button>
            </div>
        </div>
        <div v-if="props.loading" class="loading">
            <div class="loader-spinner"></div>
            <p>Cargando datos...</p>
        </div>
        <div v-else-if="!visibleItems || visibleItems.length === 0" class="no-results">
            <p>No se encontraron equipos con los filtros aplicados</p>
        </div>
        <div v-else class="cards-grid">
            <Suspense v-for="(item, index) in visibleItems" :key="props.getItemKey(item, index)">
                <template #default>
                    <CardItem :item="item" :index="index" :get-item-key="props.getItemKey"
                        :is-expanded="props.isExpanded" :is-sparse="props.isSparse"
                        :get-status-accent-class="props.getStatusAccentClass"
                        :get-status-glow-class="props.getStatusGlowClass"
                        :get-status-text-class="props.getStatusTextClass"
                        :get-status-pill-class="props.getStatusPillClass" :is-field-visible="props.isFieldVisible"
                        :is-in-maintenance="props.isInMaintenance"
                        :get-maintenance-entry="props.getMaintenanceEntry"
                        :display-value="props.displayValue" :has-real-value="props.hasRealValue"
                        :is-dynamic-field-duplicate="props.isDynamicFieldDuplicate"
                        :get-dynamic-field-label="props.getDynamicFieldLabel"
                        :get-item-field-value="props.getItemFieldValue"
                        :active-dynamic-filter-ids="props.activeDynamicFilterIds" :on-toggle-select="props.toggleSelect"
                        :on-show-barcode="props.onShowBarcode"
                        :on-show-update-panel="props.onShowUpdatePanel"
                        :on-show-history-panel="props.onShowHistoryPanel" />
                </template>
                <template #fallback>
                    <div
                        style="height: 340px; border-radius: 16px; background: rgba(45, 55, 72, 0.5); animation: pulse 2s infinite;">
                    </div>
                </template>
            </Suspense>
        </div>

        <!-- Pagination -->
        <PaginationBar :visible-count="props.visibleCount" :page-size="props.pageSize" :current-page="props.currentPage"
            :total-pages="props.totalPages" :visible-page-numbers="props.visiblePageNumbers"
            :displayed-start="props.displayedStart" :displayed-end="props.displayedEnd" :loading="props.loading"
            :first-page="props.firstPage" :previous-page="props.previousPage" :next-page="props.nextPage"
            :last-page="props.lastPage" :go-to-page="props.goToPage" :change-page-size="props.changePageSize" />
    </div>
</template>

<script setup>
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import PaginationBar from './PaginationBar.vue';

const CardItem = defineAsyncComponent(() => import('./CardItem.vue'));

const props = defineProps({
    loading: Boolean,
    displayedCards: {
        type: Array,
        default: () => []
    },
    visibleCount: {
        type: Number,
        default: 0
    },
    pageSize: {
        type: Number,
        default: 6
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 1
    },
    visiblePageNumbers: {
        type: Array,
        default: () => []
    },
    displayedStart: {
        type: Number,
        default: 0
    },
    displayedEnd: {
        type: Number,
        default: 0
    },
    getItemKey: {
        type: Function,
        required: true
    },
    // Handler to show barcode (propagated to CardItem -> CardActions)
    onShowBarcode: {
        type: Function,
        required: true
    },
    // Handler to show update panel (propagated to CardItem -> CardActions)
    onShowUpdatePanel: {
        type: Function,
        required: true
    },
    onShowHistoryPanel: {
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
    getStatusAccentClass: {
        type: Function,
        required: true
    },
    getStatusGlowClass: {
        type: Function,
        required: true
    },
    isInMaintenance: {
        type: Function,
        required: true
    },
    getMaintenanceEntry: {
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
    activeDynamicFilterIds: {
        type: Array,
        default: () => []
    },
    openScanModal: {
        type: Function,
        default: null
    },
    firstPage: {
        type: Function,
        required: true
    },
    previousPage: {
        type: Function,
        required: true
    },
    nextPage: {
        type: Function,
        required: true
    },
    lastPage: {
        type: Function,
        required: true
    },
    goToPage: {
        type: Function,
        required: true
    },
    changePageSize: {
        type: Function,
        required: true
    }
});

const isMobile = ref(false);

onMounted(() => {
    isMobile.value = window.innerWidth <= 900;
});

const visibleItems = computed(() => {
    return props.displayedCards || [];
});
</script>

<style scoped>
.cards-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.cards-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.scan-global-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    background: rgba(37, 99, 235, 0.08);
    color: #e5f0ff;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 200ms ease;
    white-space: nowrap;
}

.scan-global-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
    background: rgba(37, 99, 235, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
}

.scan-global-btn svg {
    flex-shrink: 0;
}

.scan-global-btn span {
    display: inline;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
}

.maintenance-card {
    background: #f8f9fa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
}

.maintenance-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.maintenance-card.expanded {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
</style>
