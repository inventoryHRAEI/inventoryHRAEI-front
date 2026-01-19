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
            <div v-for="(item, idx) in displayedCards.slice(0, renderedCount > 0 ? renderedCount : displayedCards.length)" :key="getItemKey(item, idx)" class="maintenance-card"
                @click="toggleSelect(item)"
                :class="{ active: isExpanded(item, idx), expanded: isExpanded(item, idx), 'card-sparse': isSparse(item), 'is-maintenance': isInMaintenance(item) }"
                :aria-expanded="isExpanded(item, idx)" tabindex="0" @keydown.enter.prevent="toggleSelect(item)"
                @keydown.space.prevent="toggleSelect(item)">
                <div class="card-accent" :class="getStatusAccentClass(item)"></div>
                <div class="card-glow" :class="getStatusGlowClass(item)"></div>
                <div class="card-header">
                    <div class="card-header-top">
                        <!-- Num de Inventario: SIEMPRE visible con label y valor (nunca en blanco) -->
                        <div class="card-no-wrapper">
                            <div class="card-no">
                                <span class="card-pill-label">Num de Inventario </span>
                                <span class="card-pill-value"
                                    :class="{ 'value-na': !hasRealValue(item['No DE INVENTARIO']) }">{{
                                        displayValue(item['No DE INVENTARIO']) }}</span>
                            </div>
                            <div class="card-no-icon" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                                </svg>
                            </div>
                        </div>

                        <!-- Campo No: SIEMPRE visible, nunca en blanco -->
                        <div class="card-record">
                            <span class="card-record-label">No</span>
                            <span class="card-record-value" :title="String(displayValue(item['No']))"
                                :class="{ 'value-na': !hasRealValue(item['No']) }">{{
                                    displayValue(item['No'])
                                }}</span>
                        </div>

                        <!-- Close button shown only when expanded -->
                        <button v-if="isExpanded(item, idx)" class="card-close" @click.stop="toggleSelect(null)"
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
                        <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MARCA']) }">{{
                            displayValue(item['MARCA']) }}</span>
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
                        <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MODELO']) }">{{
                            displayValue(item['MODELO']) }}</span>
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
                            :class="{ 'value-na': !hasRealValue(item['CLAVE CNIS']) }">{{
                                displayValue(item['CLAVE CNIS']) }}</span>
                    </div>
                    <!-- Campos dinámicos activos: siempre se muestran si están añadidos (N/A si vacío) -->
                    <template v-for="id in activeDynamicFilterIds" :key="'dyn-' + id">
                        <div v-if="!isDynamicFieldDuplicate(id)" class="card-info-row">
                            <span class="card-label">{{ getDynamicFieldLabel(id) }}:</span>
                            <!-- Material Necesario para Funcionamiento: SIN accordion, solo texto con wrap -->
                            <span v-if="id.includes('refaccion_accesorio_consumible') || id.includes('REFACCION_ACCESORIO_CONSUMIBLE')"
                                class="card-value card-value-wrap"
                                :class="{ 'value-na': !hasRealValue(getItemFieldValue(item, id)) }">{{
                                    displayValue(getItemFieldValue(item, id)) }}</span>

                            <!-- Otros campos: sin expandir -->
                            <span v-else class="card-value card-value-wrap"
                                :class="{ 'value-na': !hasRealValue(getItemFieldValue(item, id)) }">{{
                                    displayValue(getItemFieldValue(item, id)) }}</span>
                        </div>
                    </template>
                </div>
                <div class="card-footer">
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
                <BiomedicCardActions
                    :item="item"
                    @show-barcode="handleShowBarcode" />
                <div class="card-hover-effect"></div>
            </div>
        </div>
        <div v-if="visibleCount > pageSize && !loading" class="pagination">
            <button @click="firstPage" :disabled="currentPage === 1" class="btn-pagination"
                aria-label="Primera página">«</button>
            <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination"
                aria-label="Página anterior">Anterior</button>

            <div class="page-numbers">
                <button v-for="p in visiblePageNumbers" :key="`pg-${p}`" class="page-btn"
                    :class="{ active: p === currentPage }" :disabled="p === '…'"
                    @click="p !== '…' && goToPage(p)">{{ p
                    }}</button>
            </div>

            <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination"
                aria-label="Página siguiente">Siguiente</button>
            <button @click="lastPage" :disabled="currentPage === totalPages" class="btn-pagination"
                aria-label="Última página">»</button>

            <div class="page-info">Mostrando {{ displayedStart }}-{{ displayedEnd }} de {{ visibleCount }}
            </div>

            <div class="page-size-select">
                <label for="psize">Por página</label>
                <select id="psize" :value="pageSize" @change="changePageSize(Number($event.target.value))">
                    <option :value="6">6</option>
                    <option :value="12">12</option>
                    <option :value="24">24</option>
                    <option :value="48">48</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import BiomedicCardActions from '@/components/BiomedicCardActions.vue'
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
.cards-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
}
.cards-header-right {
    display:flex;
    align-items:center;
    gap:10px;
}
.scan-global-btn {
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:6px 10px;
    border-radius:10px;
    border:1px solid rgba(59,130,246,0.2);
    background: rgba(37,99,235,0.08);
    color:#e5f0ff;
    font-weight:600;
}
.scan-global-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 18px rgba(37,99,235,0.12); }

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 12px 0;
}

.maintenance-card {
    contain: layout style paint;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
}
</style>
