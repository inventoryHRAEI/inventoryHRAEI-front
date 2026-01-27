<template>
    <ActionPanel class="testing-environment-main">
        <template #title>
            <div class="title-row">
                <button class="btn-back-to-dashboard" @click="goToDashboard" title="Volver al dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <span class="testing-environment-title">Inventario Biomédica</span>
                <button class="btn-back-to-dashboard" style="visibility: hidden; pointer-events: none;"></button>
            </div>
        </template>

        <Breadcrumbs />

        <div class="tabs-navigation">
            <button 
                class="tab-link" 
                :class="{ active: activeTab === 'inventory' }" 
                @click="activeTab = 'inventory'"
            >
                <IIcon name="ic:baseline-medical-services" size="18" />
                Inventario de Equipos
            </button>
            <button 
                class="tab-link" 
                :class="{ active: activeTab === 'subdireccion' }" 
                @click="activeTab = 'subdireccion'"
            >
                <IIcon name="ic:baseline-inventory-2" size="18" />
                Insumos y Refacciones
            </button>
        </div>

        <div v-if="activeTab === 'inventory'" class="tab-pane-content">
            <BiomedicalSkeletonLoader v-if="!contentReady" />

            <div v-else class="testing-content" :style="{ animation: 'fadeIn 0.4s ease-in' }">
                <ScanOverlay
                    :open="scanOverlayOpen"
                    :item="scanOverlayItem"
                    :code="scanOverlayCode"
                    @login="goLoginWithRedirect"
                    @close="closeScanOverlay"
                    @logged="onScanOverlayLogged"
                />
                <FiltersSection
                    ref="filtersSectionRef"
                    v-model:filters="filters"
                    v-model:dynamicFilterValues="dynamicFilterValues"
                    v-model:dropdownSearch="dropdownSearch"
                    v-model:drawerSearch="drawerSearch"
                    :filtered-count="filteredData.length"
                    :total-count="serverTotal || allData.length"
                    :mobile-limit-applied="mobileLimitApplied"
                    :active-dynamic-filter-ids="activeDynamicFilterIds"
                    :is-filter-dropdown-open="isFilterDropdownOpen"
                    :meta-loading="metaLoading"
                    :filtered-dropdown-catalog="filteredDropdownCatalog"
                    :toggle-filter-dropdown="toggleFilterDropdown"
                    :open-add-filter-drawer="openAddFilterDrawer"
                    :clear-dynamic-filters="clearDynamicFilters"
                    :handle-filter-checkbox-change="handleFilterCheckboxChange"
                    :get-dynamic-field-label="getDynamicFieldLabel"
                    :remove-dynamic-filter="removeDynamicFilter"
                    :get-dynamic-field-kind="getDynamicFieldKind"
                    :get-dynamic-value="getDynamicValue"
                    :set-dynamic-value="setDynamicValue"
                    :is-dynamic-selectable="isDynamicSelectable"
                    :get-dynamic-select-options="getDynamicSelectOptions"
                    :get-dynamic-datalist-id="getDynamicDatalistId"
                    :get-dynamic-suggestions="getDynamicSuggestions"
                    :sin-estado-value="SIN_ESTADO_VALUE"
                    :estatus-options="estatusOptions"
                    :equipo-medico-datalist-id="equipoMedicoDatalistId"
                    :equipo-medico-suggestions="equipoMedicoSuggestions"
                    :marca-datalist-id="marcaDatalistId"
                    :marca-suggestions="marcaSuggestions"
                    :unidad-medica-datalist-id="unidadMedicaDatalistId"
                    :unidad-medica-suggestions="unidadMedicaSuggestions"
                    :is-add-filter-drawer-open="isAddFilterDrawerOpen"
                    :close-add-filter-drawer="closeAddFilterDrawer"
                    :drawer-animating="drawerAnimating"
                    :filtered-dynamic-catalog="filteredDynamicCatalog"
                    :meta-error="metaError"
                    :dynamic-catalog="dynamicCatalog"
                    :get-field-type-label="getFieldTypeLabel"
                    :fetch-meta="fetchMeta"
                    :add-dynamic-filter="addDynamicFilter"
                    :is-fixed-field="isFixedField"
                />
                <CardsSkeletonLoader v-if="!cardsReady" />
                <div v-if="largeDatasetMode" class="large-dataset-banner">
                    <strong>Dataset grande:</strong> Se han detectado {{ serverTotal || 0 }} registros. Para evitar ralentizaciones, la vista usa paginación por servidor.
                    <button class="btn small" :disabled="showAllLoading" @click.prevent="doStartShowAll">
    <span v-if="!showAllLoading">Mostrar todo (virtualizado)</span>
    <span v-else>Obteniendo datos...</span>
    </button>
                    <span style="margin-left:8px; opacity:0.9">o usa consola: <code>window.__BIOMED_TEST__.fetchAll()</code></span>
                </div>
                <template v-if="showAllVirtual">
                <div class="large-dataset-banner" style="display:flex;align-items:center;gap:12px;">
                    <button class="btn" @click.prevent="closeShowAll">Cerrar vista completa</button>
                    <div style="opacity:0.9">Mostrando {{ allFetchedItems.length }} de {{ serverTotal || '—' }} registros (virtualizado)</div>
                </div>
                <CardsVirtual
                    :items="allFetchedItems"
                    :get-item-key="getItemKey"
                    :is-expanded="isExpanded"
                    :is-sparse="isSparse"
                    :get-status-accent-class="getStatusAccentClass"
                    :get-status-glow-class="getStatusGlowClass"
                    :get-status-text-class="getStatusTextClass"
                    :get-status-pill-class="getStatusPillClass"
                    :is-in-maintenance="isInMaintenanceBase"
                    :get-maintenance-entry="getMaintenanceEntry"
                    :is-field-visible="isFieldVisible"
                    :display-value="displayValue"
                    :has-real-value="hasRealValue"
                    :is-dynamic-field-duplicate="isDynamicFieldDuplicate"
                    :get-dynamic-field-label="getDynamicFieldLabel"
                    :get-item-field-value="getItemFieldValue"
                    :active-dynamic-filter-ids="activeDynamicFilterIds"
                    :toggle-select="toggleSelect"
                    :on-show-barcode="handleShowBarcode"
                    :on-show-update-panel="handleShowUpdatePanel"
                    :on-show-history-panel="handleShowHistoryPanel"
                />
                </template>
                <template v-else>
                <CardsSection
                    :loading="loading"
                    :filtered-count="filteredData.length"
                    :displayed-cards="displayedCards"
                    :visible-count="useServerPagination ? (serverTotal || visibleCount) : visibleCount"
                    :page-size="pageSize"
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    :visible-page-numbers="visiblePageNumbers"
                    :displayed-start="displayedStart"
                    :displayed-end="displayedEnd"
                    :active-dynamic-filter-ids="activeDynamicFilterIds"
                    :on-show-barcode="handleShowBarcode"
                    :on-show-update-panel="handleShowUpdatePanel"
                    :on-show-history-panel="handleShowHistoryPanel"
                    :get-item-key="getItemKey"
                    :toggle-select="toggleSelect"
                    :is-expanded="isExpanded"
                    :is-sparse="isSparse"
                    :get-status-accent-class="getStatusAccentClass"
                    :get-status-glow-class="getStatusGlowClass"
                    :is-field-visible="isFieldVisible"
                    :display-value="displayValue"
                    :has-real-value="hasRealValue"
                    :is-in-maintenance="isInMaintenanceBase"
                    :get-maintenance-entry="getMaintenanceEntry"
                    :get-status-text-class="getStatusTextClass"
                    :get-status-pill-class="getStatusPillClass"
                    :is-dynamic-field-duplicate="isDynamicFieldDuplicate"
                    :get-dynamic-field-label="getDynamicFieldLabel"
                    :get-item-field-value="getItemFieldValue"
                    :first-page="firstPage"
                    :previous-page="previousPage"
                    :next-page="nextPage"
                    :last-page="lastPage"
                    :go-to-page="goToPage"
                    :change-page-size="changePageSize"
                    :open-scan-modal="openScanModal"
                    :rendered-count="renderedCount"
                    @load-more="handleLoadMore"
                />
                </template>
                <div v-if="filteredData.length === 0 && !loading && hasFilters" class="no-results">
                    <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
                </div>
            </div>
        </div>

        <div v-else class="tab-pane-content">
            <InventorySubdireccion />
        </div>
        <BarcodeModal v-model="barcodeModalOpen" :code="barcodeCode" :item="barcodeItem" @request-start-maintenance="onRequestStartMaintenance" />
        <UpdateItemPanel 
          v-model="updateItemModalOpen" 
          :item="updateItemData"
          :dynamic-catalog="dynamicCatalog"
          :get-dynamic-field-label="getDynamicFieldLabel"
          :get-dynamic-field-kind="getDynamicFieldKind"
          @item-updated="onItemUpdated" 
        />
        <MaintenanceScannerModal
            v-model="scanModalOpen"
            :items="allData"
            :maintenance-map="maintenanceMap"
            :initial-code="externalInitialCode"
            @start-maintenance="onStartMaintenance"
            @finish-maintenance="onFinishMaintenance"
        />
        <EquipmentHistoryPanel
          v-model:visible="isHistoryPanelVisible"
          :item="historyItem"
          @close="isHistoryPanelVisible = false"
        />
    </ActionPanel>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, defineAsyncComponent } from 'vue'
import IIcon from '@/components/IIcon.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import BarcodeModal from '@/components/BarcodeModal.vue'
import UpdateItemPanel from '@/components/UpdateItemPanel_v2.vue'
import MaintenanceScannerModal from '@/components/MaintenanceScannerModal.vue'
import EquipmentHistoryPanel from '@/components/EquipmentHistoryPanel.vue'
import ScanOverlay from '@/views/operations/biomedical/ScanOverlay.vue'
import BiomedicalSkeletonLoader from '@/components/BiomedicalSkeletonLoader.vue'
import CardsSkeletonLoader from '@/components/CardsSkeletonLoader.vue'
import InventorySubdireccion from '@/views/operations/biomedical/InventorySubdireccion.vue'
import { getStoredToken, validateSession } from '@/utils/auth.js'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { useBiomedicalFilters } from '@/composables/useBiomedicalFilters.js'
import { useBiomedicalSearch } from '@/composables/useBiomedicalSearch.js'
import { useBiomedicalMaintenance } from '@/composables/useBiomedicalMaintenance.js'
import { useBiomedicalCardRendering } from '@/composables/useBiomedicalCardRendering.js'
import { useBiomedicalMeta } from '@/composables/useBiomedicalMeta.js'
import { createTunnel } from '@/lib/tunnelManager.js'

// Helper to measure async component load times
function measureAsync(importer, name) {
    return defineAsyncComponent(async () => {
        try { console.time(`[ASYNC LOAD] ${name}`) } catch (e) {}
        const mod = await importer()
        try { console.timeEnd(`[ASYNC LOAD] ${name}`) } catch (e) {}
        return mod
    })
}

// Lazy load heavy components (measured)
const FiltersSection = measureAsync(() => import('@/views/operations/biomedical/FiltersSection.vue'), 'FiltersSection')
const CardsSection = measureAsync(() => import('@/views/operations/biomedical/CardsSection.vue'), 'CardsSection')
const CardsVirtual = measureAsync(() => import('@/views/operations/biomedical/CardsVirtual.vue'), 'CardsVirtual')

// Lazy load QRCode only when needed
let QRCode = null
const getQRCode = async () => {
  if (!QRCode) QRCode = (await import('qrcode')).default
  return QRCode
}

const router = useRouter()
const route = useRoute()
const activeTab = ref('inventory') // Pestaña activa: 'inventory' o 'subdireccion'
const showAllVirtual = ref(false)
const allFetchedItems = ref([])
const showAllLoading = ref(false)
const largeDatasetMode = ref(false)

function closeShowAll() {
  showAllVirtual.value = false
  allFetchedItems.value = []
}

function doStartShowAll() {
  return startShowAll(1000)
}

async function startShowAll(pageSize = 1000) {
  try {
    showAllLoading.value = true
    showAllVirtual.value = true
    await runSearchBase(buildQueryParams, () => filters.value.estatus === SIN_ESTADO_VALUE, { serverSide: true, full: true, pageSize })
    // Pull items from global helper set by composable
    try { allFetchedItems.value = (window.__BIOMED_TEST__ && window.__BIOMED_TEST__.lastFetchedItems) ? window.__BIOMED_TEST__.lastFetchedItems : [] } catch (e) { allFetchedItems.value = [] }
  } catch (e) {
    console.error('[startShowAll] error', e)
  } finally {
    showAllLoading.value = false
  }
}

// Initialize composables
const {
    metaFields,
    metaLoading,
    fetchMeta,
    getDynamicFieldLabel: metaGetDynamicFieldLabel,
    getDynamicFieldKind: metaGetDynamicFieldKind,
    isDynamicSelectable: metaIsDynamicSelectable,
    getDynamicSelectOptions: metaGetDynamicSelectOptions,
    getDynamicSuggestions: metaGetDynamicSuggestions,
    getDynamicDatalistId
} = useBiomedicalMeta()
const { allData, filteredData, loading, metaError, mobileLimitApplied, serverTotal, hasRealValue, computeHasRealData, applyMobileLimit, runSearch: runSearchBase } = useBiomedicalSearch()
const { maintenanceMap, isInMaintenance: isInMaintenanceBase, getMaintenanceEntry, onStartMaintenance, onFinishMaintenance, initMaintenanceMap, persistMaintenanceMap, refreshStatusForCodes } = useBiomedicalMaintenance()
const { selectedItem, currentPage, pageSize, getItemKey, isExpanded, toggleSelect, getStatusAccentClass, getStatusGlowClass, getStatusPillClass, getStatusTextClass, isSparse, isFieldVisible: isFieldVisibleBase } = useBiomedicalCardRendering()
const {
    filters,
    activeDynamicFilterIds,
    dynamicFilterValues,
    estatusOptions,
    dynamicCatalog,
    dynamicCatalogByCategory,
    isRestoring: getIsRestoring,
    setRestoring,
    getMetaField,
    getMetaFieldColumn,
    getItemFieldValue,
    isFixedField,
    addDynamicFilter,
    removeDynamicFilter,
    clearDynamicFilters,
    getDynamicFieldOriginalId,
    resolveDynamicFieldLabel,
    buildQueryParams,
    persistFilters,
    restoreFilters,
    SIN_ESTADO_VALUE
} = useBiomedicalFilters(metaFields)

const getDynamicFieldLabel = (id) => {
    const resolved = resolveDynamicFieldLabel(id)
    if (resolved) return resolved
    const originalId = getDynamicFieldOriginalId(id)
    return metaGetDynamicFieldLabel(originalId)
}

const getDynamicFieldKind = (id) => {
    const originalId = getDynamicFieldOriginalId(id)
    return metaGetDynamicFieldKind(originalId)
}

const isDynamicSelectable = (id) => {
    const originalId = getDynamicFieldOriginalId(id)
    return metaIsDynamicSelectable(originalId)
}

const normalizeSuggestionList = (items, limit) => {
    return Array.from(new Set((items || []).map(opt => String(opt ?? '').trim()).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, limit)
}

const getDynamicSelectOptions = (id) => {
    const originalId = getDynamicFieldOriginalId(id)
    return normalizeSuggestionList(metaGetDynamicSelectOptions(originalId), 25)
}

const getDynamicSuggestions = (id) => {
    const originalId = getDynamicFieldOriginalId(id)
    return normalizeSuggestionList(metaGetDynamicSuggestions(originalId), 50)
}


// Local UI state
const barcodeModalOpen = ref(false)
const barcodeCode = ref('')
const barcodeItem = ref(null)
const updateItemModalOpen = ref(false)
const updateItemData = ref(null)
const isHistoryPanelVisible = ref(false)
const historyItem = ref(null)
const scanModalOpen = ref(false)
const scanOverlayOpen = ref(false)
const scanOverlayItem = ref(null)
const scanOverlayCode = ref('')
const externalInitialCode = ref('')

// Dev HTTPS state
const devHosts = ref([])
const devHostsLoading = ref(false)
const httpsUrl = ref('')
const httpsQrData = ref('')
const httpsQrOpen = ref(false)
const cfInfo = ref(null)
const cfUnstable = computed(() => cfInfo.value && (cfInfo.value.hmrDisabled === true))

// Content readiness
const contentReady = ref(false)
const cardsReady = ref(false)

// Progressive rendering state - not needed for traditional pagination
const renderedCount = ref(0) // DISABLED for pagination (CardsSection shows all displayedCards)

// UI state for filters drawer/dropdown
const isAddFilterDrawerOpen = ref(false)
const drawerAnimating = ref(false)
const drawerSearch = ref('')
const isFilterDropdownOpen = ref(false)
const dropdownSearch = ref('')
const filtersSectionRef = ref(null)

// Computed properties for drawer/dropdown filtering
const filteredDynamicCatalog = computed(() => {
    if (!isAddFilterDrawerOpen.value) return []
    const q = String(drawerSearch.value || '').trim().toLowerCase()
    if (!q) return dynamicCatalogByCategory.value
    return dynamicCatalogByCategory.value.map(cat => ({
        category: cat.category,
        fields: (cat.fields || []).filter(f => String(f?.label || f?.id || '').toLowerCase().includes(q))
    })).filter(c => Array.isArray(c.fields) && c.fields.length > 0)
})

const filteredDropdownCatalog = computed(() => {
    if (!isFilterDropdownOpen.value) return []
    const q = String(dropdownSearch.value || '').trim().toLowerCase()
    if (!q) return dynamicCatalogByCategory.value
    return dynamicCatalogByCategory.value.map(cat => ({
        category: cat.category,
        fields: (cat.fields || []).filter(f => String(f?.label || f?.id || '').toLowerCase().includes(q))
    })).filter(c => Array.isArray(c.fields) && c.fields.length > 0)
})

// Helpers
let isRestoring = true
let tunnel = null

// Filter helper: compute if item has real data
function hasRealData(item) {
    if (!item || typeof item !== 'object') return false
    if (Object.prototype.hasOwnProperty.call(item, '__hasRealData')) return Boolean(item.__hasRealData)
    return computeHasRealData(item)
}



function isFieldVisible(item, fieldName) {
    if (!item) return false
    return isFieldVisibleBase(item, fieldName) && hasRealValue(item[fieldName])
}

// Display value helper
function displayValue(v) {
    if (v === null || v === undefined) return 'N/A'
    const s = String(v).trim()
    if (!s) return 'N/A'
    const low = s.toLowerCase()
    if (low === 'n/a' || low === 'na') return 'N/A'
    return v
}

// Pagination and card counting
const visibleItems = computed(() => {
    const perfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now.bind(performance) : Date.now
    const s = perfNow()
    // Mostrar todas las filas reales retornadas por el backend, incluso si están "sparse".
    const res = Array.isArray(filteredData.value) ? filteredData.value : []
    const d = Math.round(perfNow() - s)
    if (typeof window !== 'undefined' && window.console && d > 20) {
        console.warn(`[perf] visibleItems compute: ${d}ms for ${res.length} items`)
    }
    return res
})

function isMobileOrNetworkNow() {
    try {
        const host = typeof window !== 'undefined' ? window.location.hostname : ''
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host === ''
        const isTunnelHost = /\.trycloudflare\.|ngrok|loca/.test(host)
        const isNetworkHost = !isLocal || isTunnelHost
        const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4))
        return isMobile || isNetworkHost
    } catch (e) { return false }
}

const SERVER_SIDE_FORCE_THRESHOLD = 500 // items; if server reports more, prefer server-side pagination

const useServerPagination = computed(() => {
    // ⭐ FORZAR server-side pagination si hay filtros dinámicos activos
    // Esto asegura que cada cambio de página refetcha datos correctos
    if (activeDynamicFilterIds.value && activeDynamicFilterIds.value.length > 0) {
        return true
    }
    // Forzar server-side si sabemos que la tabla es grande
    try {
        if (serverTotal && typeof serverTotal.value === 'number' && serverTotal.value > SERVER_SIDE_FORCE_THRESHOLD) return true
    } catch (e) {}
    return isMobileOrNetworkNow()
})

const displayedCards = computed(() => {
    // Si usamos paginación en servidor, visibleItems ya contiene sólo la página actual
    if (useServerPagination.value) {
        return visibleItems.value
    }
    const startIndex = (currentPage.value - 1) * pageSize.value
    return visibleItems.value.slice(startIndex, startIndex + pageSize.value)
})

const visibleCount = computed(() => {
    return visibleItems.value.length
})

const totalPages = computed(() => {
    const total = useServerPagination.value ? (serverTotal.value || visibleCount.value) : visibleCount.value
    return Math.max(1, Math.ceil(total / pageSize.value))
})

const hasFilters = computed(() => {
    const fixedHas = Object.values(filters.value).some(v => String(v || '').trim() !== '')
    const dynamicHas = activeDynamicFilterIds.value.some(id => String(dynamicFilterValues.value[id] || '').trim() !== '')
    return fixedHas || dynamicHas
})

const displayedStart = computed(() => {
    if (useServerPagination.value) {
        const total = serverTotal.value || 0
        if (!total) return 0
        return (currentPage.value - 1) * pageSize.value + 1
    }
    if (!visibleCount.value) return 0
    return (currentPage.value - 1) * pageSize.value + 1
})

const displayedEnd = computed(() => {
    if (useServerPagination.value) {
        const total = serverTotal.value || 0
        if (!total) return 0
        return Math.min(currentPage.value * pageSize.value, total)
    }
    if (!visibleCount.value) return 0
    return Math.min(currentPage.value * pageSize.value, visibleCount.value)
})

const visiblePageNumbers = computed(() => {
    // HMR touch: no-op comment to trigger recompile and ensure syntax is valid
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const range = []
    range.push(1)
    let start = Math.max(2, cur - 2)
    let end = Math.min(total - 1, cur + 2)
    if (start > 2) range.push('…')
    for (let i = start; i <= end; i++) range.push(i)
    if (end < total - 1) range.push('…')
    range.push(total)
    return range
})

const searchStatusMessage = computed(() => {
    return loading.value ? 'Actualizando resultados y sincronizando con inventario...' : 'Listo para explorar con precisión'
})

const equipoMedicoDatalistId = 'fixed-equipoMedico-datalist'
const marcaDatalistId = 'fixed-marca-datalist'
const unidadMedicaDatalistId = 'fixed-unidadMedica-datalist'

const equipoMedicoSuggestions = computed(() => {
    return getDynamicSelectOptions('equipoMedico')
})

const marcaSuggestions = computed(() => {
    return getDynamicSelectOptions('marca')
})

const unidadMedicaSuggestions = computed(() => {
    return getDynamicSelectOptions('unidadMedica')
})


// ===== ACTION HANDLERS & EVENT FUNCTIONS =====

function goToDashboard() {
    navigateAndRefresh(router, { name: 'dashboard' })
}

function handleShowBarcode(item) {
    try {
        const code = item?.['No DE INVENTARIO'] || ''
        barcodeCode.value = String(code)
        barcodeItem.value = item || null
        // ensure modal opens after DOM updates to avoid interference
        nextTick(() => {
            barcodeModalOpen.value = true
            console.log('[handleShowBarcode] opened modal for', barcodeCode.value)
        })
    } catch (e) {
        console.warn('[handleShowBarcode] Error opening modal', e)
    }
}

function handleShowUpdatePanel(item) {
    try {
        updateItemData.value = item || null
        // ensure modal opens after DOM updates to avoid interference
        nextTick(() => {
            updateItemModalOpen.value = true
            console.log('[handleShowUpdatePanel] opened modal for', item?.['No DE INVENTARIO'] || 'unknown')
        })
    } catch (e) {
        console.warn('[handleShowUpdatePanel] Error opening modal', e)
    }
}

function handleShowHistoryPanel(item) {
  historyItem.value = item
  isHistoryPanelVisible.value = true
}

function onItemUpdated(result) {
    try {
        console.log('[onItemUpdated] Item updated successfully', result)
        // Refrescar datos si es necesario
        // TODO: actualizar el item en allData y mostrar notificación
    } catch (e) {
        console.warn('[onItemUpdated] Error handling update', e)
    }
}

function handleLoadMore() {
    // PAGINATION: Not needed with traditional pagination
    console.log('[pagination] Using traditional page navigation instead')
}

function handleExternalScan(code) {
    if (!code) return
    const found = (allData.value || []).find(i => String(i?.['No DE INVENTARIO'] || '').trim() === String(code).trim()) || null
    if (found) {
        selectedItem.value = found
        nextTick(() => {
            try {
                const el = document.querySelector('.maintenance-card.active')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } catch (e) { }
        })
    } else {
        barcodeCode.value = String(code)
        barcodeItem.value = null
        barcodeModalOpen.value = true
    }

    const token = getStoredToken()
    if (!token) {
        scanOverlayItem.value = found
        scanOverlayCode.value = String(code)
        scanOverlayOpen.value = true
        return
    }

    ;(async () => {
        try {
            const res = await validateSession()
            if (!res || !res.authenticated) {
                scanOverlayItem.value = found
                scanOverlayCode.value = String(code)
                scanOverlayOpen.value = true
            } else {
                scanOverlayOpen.value = false
            }
        } catch (e) {
            scanOverlayItem.value = found
            scanOverlayCode.value = String(code)
            scanOverlayOpen.value = true
        }
    })()
}

// ===== MISSING UI HELPERS (expuestos a los children) =====
function openAddFilterDrawer() {
    if (isAddFilterDrawerOpen.value) return
    isAddFilterDrawerOpen.value = true
    // ensure meta is loaded for dynamic fields
    if (!metaFields.value.length) fetchMeta().catch(() => {})
}

function closeAddFilterDrawer() {
    if (!isAddFilterDrawerOpen.value) return
    drawerSearch.value = ''
    isAddFilterDrawerOpen.value = false
}

function handleFilterCheckboxChange(fieldId, checked) {
    try {
        if (!fieldId) return
        console.log('[handleFilterCheckboxChange]', fieldId, 'checked:', checked, 'isFixed:', isFixedField(fieldId))
        
        // If called with explicit checked boolean, handle dynamic or fixed filters
        if (typeof checked === 'boolean') {
            if (isFixedField(fieldId)) {
                // Fixed field - set value directly
                filters.value[fieldId] = checked ? String(filters.value[fieldId] || '1') : ''
                return
            }
            
            // Dynamic field - add/remove based on checked state
            const isActive = activeDynamicFilterIds.value.includes(fieldId)
            if (checked && !isActive) {
                // Need to add this filter
                console.log('[handleFilterCheckboxChange] ADDING filter:', fieldId)
                addDynamicFilter(fieldId)
            } else if (!checked && isActive) {
                // Need to remove this filter
                console.log('[handleFilterCheckboxChange] REMOVING filter:', fieldId)
                removeDynamicFilter(fieldId)
            }
            return
        }

        // Fallback: toggle dynamic filters (legacy behavior)
        if (!isFixedField(fieldId)) {
            if (activeDynamicFilterIds.value.includes(fieldId)) {
                removeDynamicFilter(fieldId)
            } else {
                addDynamicFilter(fieldId)
            }
            return
        }
    } catch (e) {
        console.error('[handleFilterCheckboxChange] Error:', e)
    }
}

function getDynamicValue(fieldId) {
    return dynamicFilterValues.value ? dynamicFilterValues.value[fieldId] : undefined
}

function setDynamicValue(fieldId, v) {
    if (!dynamicFilterValues.value) return
    dynamicFilterValues.value[fieldId] = v
}

function getFieldTypeLabel(field) {
    // alias to existing helper
    try { return getDynamicFieldLabel(field) } catch (e) { return String(field || '') }
}

function isDynamicFieldDuplicate(fieldId, value) {
    // conservative default: check if the same value exists in other dynamic filters
    try {
        const vals = Object.entries(dynamicFilterValues.value || {})
        return vals.some(([k, v]) => k !== String(fieldId) && String(v || '') === String(value || ''))
    } catch (e) { return false }
}


function onRequestStartMaintenance(payload) {
    const code = String(payload?.code || '')
    if (!code) return
    externalInitialCode.value = code
    scanModalOpen.value = true
}

function openScanModal() {
    scanModalOpen.value = true
}

function closeScanOverlay() {
    scanOverlayOpen.value = false
    const token = getStoredToken()
    if (!token) {
        router.push({ name: 'login', query: { next: router.currentRoute.value.fullPath || '/' } })
    }
}

function onScanOverlayLogged() {
    scanOverlayOpen.value = false
    ;(async () => {
        try {
            const res = await validateSession()
            if (!res || !res.authenticated) {
                router.push({ name: 'login', query: { next: router.currentRoute.value.fullPath || '/' } })
            }
        } catch (e) {
            router.push({ name: 'login', query: { next: router.currentRoute.value.fullPath || '/' } })
        }
    })()
}

function goLoginWithRedirect() {
    const current = router.currentRoute.value
    const redirectTo = current && current.fullPath ? current.fullPath : '/'
    router.push({ name: 'login', query: { next: redirectTo } })
}

// Dev HTTPS helpers
async function loadDevHosts() {
    devHostsLoading.value = true
    try {
        const resp = await fetch('/dev-hosts.json')
        if (resp && resp.ok) {
            const j = await resp.json()
            devHosts.value = j && j.hosts ? j.hosts : []
        }
    } catch (e) {
        // ignore
    }
    devHostsLoading.value = false
}

async function fetchCloudflareUrl() {
    try {
        const resp = await fetch('/cloudflare-url.json')
        if (resp && resp.ok) {
            const j = await resp.json()
            httpsUrl.value = j && j.url ? j.url : ''
            cfInfo.value = j || null
            return
        }
    } catch (e) {
        // ignore
    }
    httpsUrl.value = ''
    cfInfo.value = null
}

async function copyHttpsUrl() {
    let url = httpsUrl.value
    if (!url) {
        if (devHosts.value && devHosts.value.length) {
            url = `https://${devHosts.value[0]}:5173`
        }
    }
    if (!url) return
    try {
        await navigator.clipboard.writeText(url)
        try { window.dispatchEvent(new CustomEvent('app:toast', { detail: { msg: 'URL copiada al portapapeles' } })) } catch {}
    } catch (e) {
        alert('Copia la URL manualmente: ' + url)
    }
}

async function showHttpsQr() {
    // RESET: Clear any previous URL to force fresh generation
    httpsUrl.value = ''
    
    // PRIORITY: Use local network addresses FIRST, Cloudflare as fallback only
    const currentHost = window.location.hostname
    const currentProtocol = window.location.protocol
    const currentPort = window.location.port
    
    console.log('[QR] Current access:', { host: currentHost, protocol: currentProtocol, port: currentPort })
    
    // Try to refresh network addresses from server first
    try {
        const refreshResp = await fetch('/refresh-hosts', { method: 'GET', cache: 'no-store' })
        if (refreshResp && refreshResp.ok) {
            const freshData = await refreshResp.json()
            if (freshData && freshData.hosts) {
                devHosts.value = freshData.hosts
                console.log('[QR] ✅ Refreshed DYNAMIC network addresses:', freshData.hosts)
            }
        }
    } catch (e) {
        // Fallback: try to get existing file with cache busting
        try {
            const freshHostsResp = await fetch('/dev-hosts.json?t=' + Date.now(), { cache: 'no-store' })
            if (freshHostsResp && freshHostsResp.ok) {
                const freshData = await freshHostsResp.json()
                if (freshData && freshData.hosts) {
                    devHosts.value = freshData.hosts
                    console.log('[QR] 📄 Fallback network addresses:', freshData.hosts)
                }
            }
        } catch (e2) {
            console.warn('[QR] Could not refresh network addresses:', e2.message)
        }
    }
    
    // PRIORITY 1: Use local network addresses (ALWAYS preferred)
    if (devHosts.value && devHosts.value.length > 0) {
        let targetHost = currentHost
        
        // If accessing from localhost, prefer CURRENT network address (dynamic)
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
            const networkHosts = devHosts.value.filter(host => 
                host !== 'localhost' && 
                host !== '127.0.0.1' && 
                !host.includes('172.') && // Skip Docker/VM networks
                !host.includes('192.168.56.') && // Skip VirtualBox networks
                !host.includes('10.0.') // Skip some VPN networks
            )
            if (networkHosts.length > 0) {
                // Always use the LAST network address (most likely current WiFi)
                targetHost = networkHosts[networkHosts.length - 1]
                httpsUrl.value = `${currentProtocol}//${targetHost}:${currentPort || '5173'}`
                console.log('[QR] 🏠→📱 From localhost → NETWORK address:', targetHost)
            }
        } else {
            // If already on network, use the same network address (but verify it's still valid)
            const isCurrentHostValid = devHosts.value.includes(currentHost)
            if (isCurrentHostValid) {
                targetHost = currentHost
                httpsUrl.value = `${currentProtocol}//${targetHost}:${currentPort || '5173'}`
                console.log('[QR] 📱→📱 From network → Same network address:', targetHost)
            } else {
                // Current host not in list, fall back to best available network
                const networkHosts = devHosts.value.filter(host => 
                    host !== 'localhost' && 
                    host !== '127.0.0.1' && 
                    !host.includes('172.') &&
                    !host.includes('192.168.56.') &&
                    !host.includes('10.0.')
                )
                if (networkHosts.length > 0) {
                    targetHost = networkHosts[networkHosts.length - 1]
                    httpsUrl.value = `${currentProtocol}//${targetHost}:${currentPort || '5173'}`
                    console.log('[QR] 🔄 Network changed → DYNAMIC address:', targetHost)
                }
            }
        }
    }
    
    // PRIORITY 2: Fallback to Cloudflare only if no local network found
    if (!httpsUrl.value) {
        console.log('[QR] No local network found, trying Cloudflare fallback...')
        await fetchCloudflareUrl()
    }
    
    if (!httpsUrl.value) {
        console.warn('[QR] Could not determine target URL (no network or tunnel)')
        alert('No se pudo generar QR: no hay direcciones de red disponibles')
        return
    }
    
    try {
        const { toDataURL } = await import('qrcode')
        httpsQrData.value = await toDataURL(httpsUrl.value, { width: 512 })
        httpsQrOpen.value = true
        console.log('[QR] 🚀 Generated QR for NETWORK address:', httpsUrl.value)
    } catch (e) {
        console.warn('Could not generate QR', e)
    }
}

// UI Filter Drawer/Dropdown Management
function getDrawerEl() {
    return filtersSectionRef.value?.drawerEl?.value || null
}

function toggleFilterDropdown() {
    if (isFilterDropdownOpen.value) {
        console.log('[toggleFilterDropdown] Cerrando el panel de filtros.');
        closeFilterDropdown();
    } else {
        console.log('[toggleFilterDropdown] Abriendo el panel de filtros.');
        openFilterDropdown();
    }
}

function openFilterDropdown() {
    isFilterDropdownOpen.value = true
    if (!metaFields.value.length) fetchMeta()
}

function closeFilterDropdown() {
    isFilterDropdownOpen.value = false
    dropdownSearch.value = ''
}

function handleGlobalKeydown(e) {
    if (e && e.key === 'Escape') {
        if (isAddFilterDrawerOpen.value) closeAddFilterDrawer()
        if (isFilterDropdownOpen.value) closeFilterDropdown()
    }
}

function positionFilterDropdown() {
    const button = document.querySelector('.btn-filter-primary')
    const menu = document.querySelector('.dropdown-filters-menu')
    const container = document.querySelector('.dropdown-filters-container')

    if (!button || !menu || !container) return

    const btnRect = button.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const padding = 20
    const menuWidth = 380

    const hadTransition = menu.style.transition
    menu.style.transition = 'none'

    const spaceBelow = viewportHeight - btnRect.bottom - padding
    const spaceAbove = btnRect.top - padding
    const minHeight = 300

    if (spaceBelow >= minHeight) {
        menu.style.maxHeight = `${Math.min(70 * viewportHeight / 100, spaceBelow)}px`
        menu.classList.remove('menu-above')
        menu.classList.add('menu-below')
    } else if (spaceAbove >= minHeight) {
        menu.style.maxHeight = `${Math.min(70 * viewportHeight / 100, spaceAbove)}px`
        menu.classList.add('menu-above')
        menu.classList.remove('menu-below')
    } else {
        const availableHeight = Math.max(spaceBelow, spaceAbove)
        menu.style.maxHeight = `${Math.min(70 * viewportHeight / 100, availableHeight)}px`
        menu.classList.remove('menu-above')
        menu.classList.add('menu-below')
    }

    const rightEdge = containerRect.left + menuWidth
    if (rightEdge > viewportWidth - padding) {
        menu.style.left = 'auto'
        menu.style.right = '0'
        menu.classList.add('menu-right-aligned')
    } else {
        menu.style.left = '0'
        menu.style.right = 'auto'
        menu.classList.remove('menu-right-aligned')
    }

    requestAnimationFrame(() => {
        menu.style.transition = hadTransition || ''
    })
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

function previousPage() {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

function firstPage() {
    currentPage.value = 1
}

function lastPage() {
    currentPage.value = totalPages.value
}

function goToPage(n) {
    if (typeof n === 'number' && n >= 1 && n <= totalPages.value) currentPage.value = n
}

function changePageSize(n) {
    pageSize.value = n
    currentPage.value = 1
}

// ===== LIFECYCLE & INITIALIZATION =====

let searchTimer = null
function scheduleSearch() {
    if (isRestoring) return
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        renderedCount.value = 6 // ULTRA FAST: Reset to 6 items only
        runSearchBase(buildQueryParams, () => filters.value.estatus === SIN_ESTADO_VALUE, useServerPagination.value ? { serverSide: true, page: currentPage.value, pageSize: pageSize.value, limitReactive: true } : { limitReactive: isMobileOrNetworkNow() })
        currentPage.value = 1
        selectedItem.value = null
    }, 100) // Faster search scheduling
}

let persistTimer = null
function schedulePersist() {
    if (isRestoring) return
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
        persistFilters()
    }, 150)
}

function handleClickOutside(e) {
    if (isFilterDropdownOpen.value) {
        const container = document.querySelector('.dropdown-filters-container')
        const menu = document.querySelector('.dropdown-filters-menu')
        const btn = document.querySelector('.btn-filter-primary')
        if (container && !container.contains(e.target) && (!menu || !menu.contains(e.target)) && (!btn || !btn.contains(e.target))) {
            closeFilterDropdown()
        }
    }
}

function queueInitialLoad() {
    const run = async () => {
        const perfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now.bind(performance) : Date.now
        const t0 = perfNow()
        let queueInitialLoadTimerStarted = false
        try {
            console.time('[VIEW] queueInitialLoad')
            queueInitialLoadTimerStarted = true
        } catch (e) {
            console.error('[VIEW] queueInitialLoad Timer could not be started:', e)
        }

        try {
            console.time('[VIEW] runSearch');
        } catch (e) {
            console.error('[VIEW] runSearch Timer could not be started:', e);
        }

        let preferServer = useServerPagination.value;
        try {
            const nav = (performance && typeof performance.getEntriesByType === 'function') ? (performance.getEntriesByType('navigation')[0] || {}) : {};
            const isDirectEntry = (typeof document !== 'undefined' && (!document.referrer || document.referrer === '')) && (nav.type === 'navigate' || nav.type === undefined);
            const isMobileNow = (typeof window !== 'undefined') && (window.innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4));
            if (isMobileNow) {
                preferServer = true;
            } else if (isDirectEntry) {
                preferServer = false;
            }
        } catch (e) {
            console.error('Error determining preferServer:', e);
        }

        await runSearchBase(buildQueryParams, () => filters.value.estatus === SIN_ESTADO_VALUE, preferServer ? { serverSide: true, page: currentPage.value, pageSize: pageSize.value, limitReactive: true } : { limitReactive: isMobileOrNetworkNow() });

        try {
            console.timeEnd('[VIEW] runSearch');
        } catch (e) {
            console.error('[VIEW] runSearch Timer could not be ended:', e);
        }

        try { console.timeEnd('[VIEW] queueInitialLoad') } catch (e) {}
        // Use the 'route' variable from the component's setup scope
        try {
            const routeCurrent = route
            const sc = routeCurrent?.query?.scan
            if (sc) {
                handleExternalScan(String(sc))
                try { router.replace({ query: { ...routeCurrent.query, scan: undefined } }) } catch (e) { }
            }
        } catch (e) {
            console.warn('[queueInitialLoad] No se pudo leer la ruta actual:', e && e.message)
        }
    }
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => run(), { timeout: 100 }) // Ultra fast timeout
    } else {
        setTimeout(() => run(), 10) // Almost immediate
    }
}

onMounted(async () => {
    // Eliminar cachés/de candidatas a datos de prueba al montar para garantizar datos reales
    try {
      const { cacheClearAll } = await import('@/utils/persistentCache.js')
      await cacheClearAll()
      try { localStorage.removeItem('biomedical-filters') } catch (e) {}
      console.log('[init] Caché persistente y filtros locales eliminados para forzar uso de datos reales')
    } catch (e) {
      console.warn('[init] No se pudo limpiar la caché persistente:', e && e.message)
    }

    // Scoped tunnel listeners (prevent duplicates across tunnel recreate)
    tunnel = createTunnel()
    tunnel.addEvent(window, 'keydown', handleGlobalKeydown)
    tunnel.addEvent(window, 'resize', () => {
        if (isFilterDropdownOpen.value) positionFilterDropdown()
    })
    tunnel.addEvent(window, 'scroll', () => {
        if (isFilterDropdownOpen.value) positionFilterDropdown()
    }, { passive: true })
    tunnel.addEvent(document, 'click', handleClickOutside)

    // initialize maintenance map
    initMaintenanceMap()
    
    setTimeout(() => {
        contentReady.value = true
        // Default page size for traditional pagination
        try { pageSize.value = Number(pageSize.value) || (useServerPagination.value ? 12 : 24) } catch (e) {} // 12-24 items por página
    }, 0) // Instant rendering
    
    queueInitialLoad()
    
    // Finalize restoration - enable search scheduling
    isRestoring = false

    // Local flag to control showing in-UI virtualized "show all" view
    showAllVirtual.value = false

    // Monitor full-fetch completion to enable virtual view (window helper is set by composable)
    try {
      if (typeof window !== 'undefined') {
        window.__BIOMED_TEST__ = window.__BIOMED_TEST__ || {}
      }
    } catch (e) {}


    // Debug helper: trigger FULL server-side fetch (batches) from console
    try {
      if (typeof window !== 'undefined') {
        window.__BIOMED_TEST__ = window.__BIOMED_TEST__ || {}
        window.__BIOMED_TEST__.fetchAll = async (opts = {}) => {
          try {
            console.log('[__BIOMED_TEST__] Starting full fetch...')
            await runSearchBase(buildQueryParams, () => filters.value.estatus === SIN_ESTADO_VALUE, { serverSide: true, full: true, pageSize: opts.pageSize || 1000 })
            console.log('[__BIOMED_TEST__] Full fetch done. items:', (window.__BIOMED_TEST__.lastFetchedItems || []).length)
            return true
          } catch (e) {
            console.error('[__BIOMED_TEST__] Full fetch failed', e)
            return false
          }
        }

        // Debug helper: open barcode modal directly from console
        window.__BIOMED_TEST__.openBarcode = async (it) => {
          try {
            const item = it || (allData.value && allData.value[0]) || { 'No DE INVENTARIO': 'TEST-000' }
            console.log('[__BIOMED_TEST__] openBarcode helper called for', item && (item['No DE INVENTARIO'] || item['No DE INVENTARIO?']))
            // ensure values set and modal opened after DOM updates
            barcodeCode.value = String((item && (item['No DE INVENTARIO'] || item['No DE INVENTARIO?'])) || '')
            barcodeItem.value = item || null
            await nextTick()
            barcodeModalOpen.value = true
            return true
          } catch (e) {
            console.error('[__BIOMED_TEST__] openBarcode failed', e)
            return false
          }
        }
      }
    } catch (e) { console.warn('[init] Could not attach __BIOMED_TEST__.fetchAll', e && e.message) }

    try { await loadDevHosts() } catch {}
    try { await fetchCloudflareUrl() } catch {}
    })

onBeforeUnmount(() => {
    // cleanup scoped tunnel listeners and timeouts
    try { if (tunnel && typeof tunnel.destroy === 'function') tunnel.destroy() } catch (e) { }
    if (searchTimer) { clearTimeout(searchTimer); searchTimer = null }
    if (persistTimer) { clearTimeout(persistTimer); persistTimer = null }
})
// ===== WATCHERS =====

// Cuando cambia página/tamaño: siempre refetch en server-side para evitar páginas vacías
watch([currentPage, pageSize], ([p, ps], [op, ops]) => {
    // Forzamos server-side pagination para garantizar que cada página consulte al backend
    try {
        runSearchBase(buildQueryParams, () => filters.value.estatus === SIN_ESTADO_VALUE, { serverSide: true, page: p, pageSize: ps })
    } catch (e) {
        console.warn('[pagination watch] Error al forzar refetch:', e && e.message)
    }
})

// Si el servidor reporta un total muy grande, forzar refetch en server-side y volver a la página 1
watch(serverTotal, (nv, ov) => {
    try {
        if (typeof nv === 'number' && nv > SERVER_SIDE_FORCE_THRESHOLD) {
            currentPage.value = 1
            runSearchBase(buildQueryParams, () => filters.value.estatus === SIN_ESTADO_VALUE, { serverSide: true, page: 1, pageSize: pageSize.value })
        }
    } catch (e) {
        console.warn('[watch serverTotal] Error forcing server-side fetch:', e && e.message)
    }
})

watch(filters, () => {
    schedulePersist()
    scheduleSearch()
}, { deep: true })

watch(activeDynamicFilterIds, () => {
    schedulePersist()
    scheduleSearch()
}, { deep: true })

watch(dynamicFilterValues, () => {
    schedulePersist()
    scheduleSearch()
}, { deep: true })

watch(maintenanceMap, (val) => {
    try {
        persistMaintenanceMap()
    } catch (e) {
        // noop
    }
}, { deep: true })

// Sync maintenance status from backend for visible cards (inventory codes)
watch(displayedCards, (cards) => {
    try {
        const codes = (cards || []).map(it => it && (it['No DE INVENTARIO'] || it['No DE INVENTARIO?'])).filter(Boolean)
        if (codes.length) refreshStatusForCodes(codes).catch(err => console.warn('[maintenance] status refresh failed', err && err.message))
    } catch (e) {
        console.warn('[maintenance] could not refresh statuses', e && e.message)
    }
}, { immediate: true })

watch(isFilterDropdownOpen, (newVal) => {
    if (newVal) {
        nextTick(() => {
            positionFilterDropdown()
        })
    }
})

watch(totalPages, (tp) => {
    if (currentPage.value > tp) currentPage.value = tp
})

watch(pageSize, (n) => {
    if (!n || Number(n) <= 0) pageSize.value = 6
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

watch(allData, (data) => {
    if (data && data.length > 0 && !cardsReady.value) {
        setTimeout(() => {
            cardsReady.value = true
        }, 150)
    }
}, { immediate: false })

// Update large dataset UI flag when server reports a large total
watch(serverTotal, (nv) => {
    try {
        largeDatasetMode.value = (typeof nv === 'number' && nv > SERVER_SIDE_FORCE_THRESHOLD)
    } catch (e) {}
})

onMounted(() => {
  console.log('[DEBUG] allData:', allData.value);
  console.log('[DEBUG] filteredData:', filteredData.value);
});

watch(filteredData, (newVal) => {
  console.log('[DEBUG] filteredData updated:', newVal);
});
</script>

<style>

.testing-content {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

/* Tiny viewport support: scale UI to 90% for very small mobile devices */
@media (max-width: 350px) and (max-height: 600px) {
    .testing-content {
        transform: scale(0.9);
        transform-origin: top center;
    }
    .cards-grid {
        gap: 10px;
    }
    .biomedical-card-actions {
        justify-content: center; /* ensure action visible */
    }
    .action-btn {
        padding: 6px 10px;
    }
}

.tunnel-warning {
    margin: 8px 0 14px;
    padding: 10px 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(250,204,21,0.08), rgba(250,204,21,0.04));
    border: 1px solid rgba(250,204,21,0.16);
    color: #b45309;
    font-weight: 600;
}


/* Sección de Filtros */
.filters-section {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(2, 132, 199, 0.25) 100%);
    border: 1px solid rgba(37, 99, 235, 0.4);
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 10px 30px rgba(2, 132, 199, 0.25);
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}

.filters-section::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: linear-gradient(160deg, transparent 40%, rgba(59, 130, 246, 0.15));
    pointer-events: none;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 24px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #374151;
}

.filters-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.filters-global-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 12px;
}

.btn-clear-dynamic,
.btn-open-drawer {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.btn-clear-dynamic {
    color: #0f172a;
    background: rgba(226, 232, 240, 0.95);
    border-color: rgba(148, 163, 184, 0.6);
}

.btn-clear-dynamic:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.btn-clear-dynamic:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.25);
}

.btn-open-drawer {
    color: #ecfeff;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.9), rgba(59, 130, 246, 0.9));
    border-color: rgba(34, 211, 238, 0.35);
    position: relative;
    z-index: 600;
    /* keep button clearly above overlay and drawer */
}

.btn-open-drawer:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(34, 211, 238, 0.25);
}

.search-signal {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 999px;
    border: 1px solid rgba(14, 165, 233, 0.3);
    background: rgba(14, 165, 233, 0.08);
    color: #e0f2fe;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    transition: all 0.3s ease;
}

.search-signal.is-active {
    background: rgba(14, 165, 233, 0.2);
    border-color: rgba(14, 165, 233, 0.5);
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.35);
}

.search-signal svg {
    color: #22d3ee;
    animation: searchPulse 1.6s ease-in-out infinite;
}

.signal-text {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
}

.signal-text strong {
    font-size: 0.9rem;
}

.signal-text span {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.8);
}

@keyframes searchPulse {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(1);
    }
}

.filters-title-wrapper {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: stretch;
    gap: 24px;
}

.filters-title-content {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    min-width: 260px;
}

.filters-title-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.filters-subtitle {
    margin: 0;
    font-size: 0.82rem;
    color: rgba(191, 219, 254, 0.9);
    letter-spacing: 0.15px;
}

.filters-stats-grid {
    flex: 1;
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    align-items: stretch;
}

.stat-card {
    position: relative;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(96, 165, 250, 0.25);
    box-shadow: inset 0 0 0 1px rgba(30, 64, 175, 0.18);
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25);
}

.stat-card.accent {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(59, 130, 246, 0.22));
    border-color: rgba(45, 212, 191, 0.35);
    box-shadow: inset 0 0 0 1px rgba(20, 184, 166, 0.25), 0 12px 28px rgba(20, 184, 166, 0.25);
}

.stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: rgba(191, 219, 254, 0.9);
}

.stat-value {
    font-size: 1.55rem;
    font-weight: 700;
    color: #e0f2fe;
    line-height: 1.1;
}

.stat-foot {
    font-size: 0.75rem;
    color: rgba(148, 163, 184, 0.9);
}

.filters-section h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f3f4f6;
    letter-spacing: -0.5px;
}

.icon-search {
    color: #06b6d4;
    flex-shrink: 0;
}

.filters-callout {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(56, 189, 248, 0.08), rgba(14, 165, 233, 0.12));
    border: 1px solid rgba(14, 165, 233, 0.4);
    margin-bottom: 20px;
    box-shadow: 0 12px 24px rgba(15, 118, 212, 0.25);
    position: relative;
    overflow: hidden;
}

.filters-callout::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.5), transparent 60%);
    opacity: 0.6;
    pointer-events: none;
}

.callout-icon {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(14, 165, 233, 0.8);
    color: #bfdbfe;
    flex-shrink: 0;
}

.callout-icon svg {
    position: relative;
    z-index: 2;
}

/* Layout: ZONA IZQUIERDA (FIJA) + ZONA DERECHA (DINÁMICA) */
.filters-layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

.filters-layout.has-dynamic {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.filters-zone {
    border-radius: 16px;
    padding: 16px;
    backdrop-filter: blur(10px);
}

.filters-zone-fixed {
    border: 1px solid rgba(59, 130, 246, 0.55);
    background: rgba(191, 219, 254, 0.14);
}

.filters-zone-dynamic {
    border: 1px solid rgba(34, 197, 94, 0.55);
    background: rgba(187, 247, 208, 0.12);
}

.zone-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.zone-title {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #f8fafc;
}

.zone-subtitle {
    font-size: 0.85rem;
    color: rgba(226, 232, 240, 0.75);
}

.zone-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.2px;
}

.zone-pill-fixed {
    color: #0b1220;
    background: rgba(147, 197, 253, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.55);
}

.zone-pill-dynamic {
    color: #052e16;
    background: rgba(134, 239, 172, 0.95);
    border: 1px solid rgba(34, 197, 94, 0.55);
}

.filters-grid-fixed,
.filters-grid-dynamic {
    display: grid;
    gap: 12px;
}

/* ESTADO INICIAL: 2x4 en desktop (7 campos llenan 2 filas) */
.filters-grid-fixed.grid-initial {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* Con dinámicos: grids internos más legibles */
.filters-layout.has-dynamic .filters-grid-fixed {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filters-grid-dynamic {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filter-card {
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(15, 23, 42, 0.35);
}

.filter-card-fixed {
    border-color: rgba(59, 130, 246, 0.35);
    background: rgba(30, 58, 138, 0.18);
}

.filter-card-dynamic {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(20, 83, 45, 0.18);
}

.filter-card label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 800;
    color: rgba(226, 232, 240, 0.92);
    margin-bottom: 8px;
}

.field-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 900;
}

.field-badge-fixed {
    color: #0b1220;
    background: rgba(147, 197, 253, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.55);
}

.dynamic-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
}

.btn-remove-filter {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.12);
    color: rgba(220, 252, 231, 0.95);
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
}

.btn-remove-filter:hover {
    transform: translateY(-1px);
    background: rgba(34, 197, 94, 0.18);
}

.tri-toggle {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.tri-option {
    height: 38px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.35);
    color: rgba(226, 232, 240, 0.9);
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.tri-option.active {
    background: rgba(34, 211, 238, 0.16);
    border-color: rgba(34, 211, 238, 0.45);
}

.tri-toggle-dynamic .tri-option.active {
    background: rgba(34, 197, 94, 0.16);
    border-color: rgba(34, 197, 94, 0.45);
}

/* Drawer */
.drawer-overlay {
    position: fixed;
    inset: 0;
    background: transparent;
    /* no dimming effect as requested */
    /* no backdrop blur */
    z-index: 80;
    /* keep low so the opener button can be above */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
}

.drawer {
    width: min(520px, 92vw);
    /* more compact */
    max-height: 78vh;
    /* smaller to avoid covering too much */
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(59, 130, 246, 0.28);
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.48);
    display: flex;
    flex-direction: column;
    position: fixed;
    /* anchor to viewport to allow exact left/top */
    transform-origin: top center;
    z-index: 200;
    /* above overlay but below the opener button */
    overflow: hidden;
}

.drawer-body {
    padding: 10px 12px;
    overflow: auto;
}

.drawer-meta {
    padding: 6px 6px 12px 6px;
}

.drawer-search-wrapper {
    padding: 8px 12px;
}

.drawer-search {
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(10, 14, 22, 0.45);
    color: #e6f8ff;
}

.drawer-list .drawer-item {
    padding: 8px 10px;
    border-radius: 10px;
}

.drawer-item-name {
    font-size: 0.92rem;
}


.drawer.animating {
    pointer-events: none;
}

/* triangle pointer to visually connect drawer to the opener button */
.drawer::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    left: var(--arrow-left, 26px);
    top: -6px;
    background: rgba(15, 23, 42, 0.96);
    transform: rotate(45deg);
    border-left: 1px solid rgba(59, 130, 246, 0.18);
    border-top: 1px solid rgba(59, 130, 246, 0.18);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.28);
    opacity: 0.98;
    transition: opacity 180ms ease, transform 180ms ease;
}

.drawer.drawer-above::after {
    top: auto;
    bottom: -6px;
    transform: rotate(225deg);
}


.drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.drawer-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #f8fafc;
}

.drawer-subtitle {
    margin: 6px 0 0;
    color: rgba(226, 232, 240, 0.72);
    font-size: 0.85rem;
}

.drawer-close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(30, 41, 59, 0.5);
    color: rgba(226, 232, 240, 0.95);
    cursor: pointer;
}

.drawer-body {
    padding: 16px;
    overflow: auto;
}

.drawer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    color: rgba(226, 232, 240, 0.75);
    font-size: 0.85rem;
}

.drawer-empty {
    padding: 14px;
    border-radius: 14px;
    border: 1px dashed rgba(148, 163, 184, 0.25);
    color: rgba(226, 232, 240, 0.75);
}

.drawer-category {
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(2, 6, 23, 0.28);
    margin-bottom: 12px;
    overflow: hidden;
}

.drawer-category-title {
    padding: 12px 14px;
    cursor: pointer;
    color: rgba(226, 232, 240, 0.92);
    font-weight: 900;
}

.drawer-list {
    padding: 10px 12px 12px;
    display: grid;
    gap: 10px;
}

.drawer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(30, 41, 59, 0.3);
}

.drawer-item-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.drawer-item-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.drawer-item-name {
    color: rgba(226, 232, 240, 0.95);
    font-weight: 900;
}


.drawer-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 900;
}

.drawer-badge-fixed {
    color: #0b1220;
    background: rgba(147, 197, 253, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.55);
}

.drawer-badge-added {
    color: #052e16;
    background: rgba(134, 239, 172, 0.95);
    border: 1px solid rgba(34, 197, 94, 0.55);
}

.drawer-add {
    height: 36px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(34, 211, 238, 0.3);
    background: rgba(34, 211, 238, 0.12);
    color: rgba(236, 254, 255, 0.95);
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.drawer-add:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
}

.drawer-add:not(:disabled):hover {
    transform: translateY(-1px);
}

/* Responsive: tablet */
@media (max-width: 1024px) {
    .filters-layout.has-dynamic {
        grid-template-columns: 1fr;
    }

    .filters-grid-fixed.grid-initial {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filters-layout.has-dynamic .filters-grid-fixed,
    .filters-grid-dynamic {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

/* Responsive: móvil */
@media (max-width: 767px) {
    .filters-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
    }

    .filters-header-actions {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    .filters-global-actions {
        width: 100%;
        justify-content: stretch;
        margin-right: 0;
    }

    .btn-clear-dynamic,
    .btn-open-drawer {
        width: 100%;
    }

    .filters-grid-fixed.grid-initial,
    .filters-layout.has-dynamic .filters-grid-fixed,
    .filters-grid-dynamic {
        grid-template-columns: 1fr;
    }
}

.icon-halo {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.6), transparent 55%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: haloPulse 2.5s infinite ease-in-out;
}

.callout-content {
    flex: 1;
    position: relative;
    z-index: 1;
}

.callout-title {
    margin: 0;
    font-weight: 700;
    font-size: 1rem;
    color: #e0f2fe;
}

.callout-subtext {
    margin: 4px 0 0;
    font-size: 0.9rem;
    color: rgba(226, 232, 240, 0.85);
}

.callout-metric {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    position: relative;
    z-index: 1;
}

.metric-label {
    font-size: 0.7rem;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.7);
}

.metric-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #bae6fd;
}

.metric-time {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.85);
}

@keyframes haloPulse {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.7;
    }

    50% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.9;
    }

    100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.7;
    }
}

.result-count-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(6, 182, 212, 0.15);
    color: #06b6d4;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(6, 182, 212, 0.3);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.filters-panel {
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(51, 65, 85, 0.8);
    border-radius: 16px;
    padding: 20px;
    box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.1), 0 10px 30px rgba(15, 118, 212, 0.25);
    backdrop-filter: blur(12px);
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-item label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #d1d5db;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.input-wrapper,
.select-wrapper {
    position: relative;
}

.filter-item input,
.filter-item select {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #2d3748;
    color: #e5e7eb;
    font-family: inherit;
    transition: all 0.2s ease;
}

.filter-item input::placeholder {
    color: #9ca3af;
    font-size: 0.85rem;
}

.filter-item input:focus,
.filter-item select:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
    background: #374151;
}

/* --- FIX: asegurar que los selects dentro de las cards de filtros no se desborden --- */
.filter-card .select-wrapper select,
.filter-card .input-wrapper input {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.filter-card .select-wrapper {
    position: relative;
}

.filter-card .select-wrapper .select-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
}

.filter-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}

.filter-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
}

.filter-actions::before {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(148, 163, 184, 0.25);
    margin-right: 12px;
}

.btn-reset {
    background: rgba(15, 118, 212, 0.2);
    color: #bae6fd;
    border: 1px solid rgba(14, 165, 233, 0.5);
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.12);
    transition: all 0.3s ease;
}

.btn-reset:hover {
    background: rgba(14, 165, 233, 0.3);
    border-color: rgba(14, 165, 233, 0.9);
    color: #f8fafc;
}

.btn-advanced {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb, #38bdf8);
    color: #e0f2fe;
    border: 1px solid transparent;
    font-weight: 600;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-advanced:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(14, 165, 233, 0.35);
}

.btn-reset svg,
.btn-advanced svg {
    flex-shrink: 0;
}

/* Sección de Filtros Avanzados */
.advanced-filters-section {
    background: linear-gradient(135deg, #2d3748 0%, #1f2937 100%);
    border: 1.5px solid #4b5563;
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.advanced-filters-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 50%, #06b6d4 100%);
    animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.advanced-filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #4b5563;
}

.advanced-filters-section h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #06b6d4;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
}

.advanced-filters-stats {
    display: flex;
    align-items: center;
    gap: 12px;
}

.active-filters-count {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0f172a;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid rgba(245, 158, 11, 0.3);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.advanced-filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.filter-item.advanced {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-item.advanced label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #d1d5db;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.input-wrapper.advanced,
.select-wrapper {
    position: relative;
}

.filter-item.advanced input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #374151;
    color: #e5e7eb;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-item.advanced input::placeholder {
    color: #9ca3af;
    font-size: 0.85rem;
}

.filter-item.advanced input:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2), 0 4px 12px rgba(6, 182, 212, 0.1);
    background: #2d3748;
    transform: translateY(-1px);
}

.input-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    transition: color 0.2s ease;
}

.filter-item.advanced input:focus+.input-icon {
    color: #06b6d4;
}

.advanced-filter-actions {
    display: flex;
    justify-content: flex-start;
    padding-top: 16px;
    border-top: 1px solid #4b5563;
}

.btn-reset-advanced {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0f172a;
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.btn-reset-advanced:hover {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    border-color: #f59e0b;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

/* Sección de Cards */
.cards-section {
    position: relative;
    background: linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.9) 70%);
    border-radius: 20px;
    border: 1px solid rgba(14, 165, 233, 0.4);
    padding: 28px;
    box-shadow: 0 20px 45px rgba(15, 118, 212, 0.35);
    margin-bottom: 28px;
    overflow: hidden;
}

.cards-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.25), transparent 45%);
    pointer-events: none;
    opacity: 0.7;
}

.cards-section>* {
    position: relative;
    z-index: 1;
}

.cards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #374151;
}

.cards-section h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f3f4f6;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
}

.cards-section h3 svg {
    color: #06b6d4;
    flex-shrink: 0;
}

.cards-count {
    display: inline-flex;
    align-items: center;
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.loading {
    text-align: center;
    padding: 80px 20px;
    color: #64748b;
    background: linear-gradient(135deg, #2d3748 0%, #374151 100%);
    border-radius: 12px;
    border: 1px solid #4b5563;
    margin: 20px 0;
}

.loader-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 20px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #06b6d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: relative;
}

.loader-spinner::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 4px solid transparent;
    border-top: 4px solid rgba(6, 182, 212, 0.3);
    border-radius: 50%;
    animation: spin 0.8s linear infinite reverse;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: #06b6d4;
    animation: pulse-text 1.5s ease-in-out infinite;
}

@keyframes pulse-text {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 22px;
    margin-bottom: 20px;
}

@media (max-width: 1024px) {
    .cards-grid {
        grid-template-columns: repeat(2, minmax(220px, 1fr));
    }
}

@media (max-width: 767px) {
    .cards-grid {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

.maintenance-card {
    background:
        radial-gradient(900px 320px at 18% -20%, rgba(6, 182, 212, 0.16), transparent 55%),
        radial-gradient(900px 360px at 120% 0%, rgba(168, 85, 247, 0.12), transparent 60%),
        linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(17, 24, 39, 0.92) 100%);
    border: 1.5px solid rgba(75, 85, 99, 0.9);
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    transition:
        transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 240ms ease,
        background 240ms ease;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 340px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
    animation: card-enter 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    will-change: transform;
}

.maintenance-card:nth-child(1) {
    animation-delay: 0.1s;
}

.maintenance-card:nth-child(2) {
    animation-delay: 0.2s;
}

.maintenance-card:nth-child(3) {
    animation-delay: 0.3s;
}

.maintenance-card:nth-child(4) {
    animation-delay: 0.4s;
}

.maintenance-card:nth-child(5) {
    animation-delay: 0.5s;
}

.maintenance-card:nth-child(6) {
    animation-delay: 0.6s;
}

@keyframes card-enter {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    transition: all 0.3s ease;
}

.card-accent.accent-default {
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
}

.card-sparse {
    border-left: 4px solid rgba(249, 115, 22, 0.9);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.06), 0 0 24px rgba(249, 115, 22, 0.04) inset;
}

.sparse-badge {
    display: inline-block;
    margin-left: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    color: #7c2d12;
    background: linear-gradient(180deg, rgba(255, 237, 213, 0.95), rgba(255, 249, 238, 0.9));
    border: 1px solid rgba(249, 115, 22, 0.15);
}

.card-accent.accent-success {
    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.card-accent.accent-warning {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.card-accent.accent-critical {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.card-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.card-glow.glow-success {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.card-glow.glow-warning {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.card-glow.glow-critical {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.maintenance-card:hover {
    border-color: rgba(6, 182, 212, 0.9);
    box-shadow:
        0 18px 44px rgba(6, 182, 212, 0.18),
        0 20px 55px rgba(0, 0, 0, 0.46);
    transform: translateY(-6px) scale(1.018);
}

.maintenance-card:hover .card-accent {
    height: 6px;
}

.maintenance-card:hover .card-glow {
    opacity: 1;
}

.maintenance-card.active {
    border-color: rgba(6, 182, 212, 0.95);
    background:
        radial-gradient(900px 320px at 18% -20%, rgba(6, 182, 212, 0.18), transparent 55%),
        radial-gradient(900px 360px at 120% 0%, rgba(168, 85, 247, 0.14), transparent 60%),
        linear-gradient(135deg, rgba(55, 65, 81, 0.96) 0%, rgba(17, 24, 39, 0.94) 100%);
    box-shadow:
        0 20px 55px rgba(6, 182, 212, 0.2),
        0 22px 64px rgba(0, 0, 0, 0.5);
    transform: translateY(-4px) scale(1.01);
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

.card-record-value {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-record-value {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .card-record {
        max-width: 110px;
    }
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

/* Expanded card: show full equipo text */
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

/* Common multi-word statuses: class tokens come from toLowerCase() split by spaces */
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

/* Category styles (driven by getStatusPillClass) */
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

/* Token-specific styling */
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

/* Texto largo (p.ej. Material necesario…) debe envolver por palabras */
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

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 2px solid #374151;
}

.btn-pagination {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #e5e7eb;
}

.btn-pagination:hover:not(:disabled) {
    background: #06b6d4;
    border-color: #06b6d4;
    color: #0f172a;
}

.btn-pagination:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-pagination svg {
    flex-shrink: 0;
}

.page-info {
    font-size: 0.9rem;
    color: #d1d5db;
    font-weight: 600;
    min-width: 120px;
    text-align: center;
}

.page-numbers {
    display: flex;
    gap: 6px;
    align-items: center;
}

.page-btn {
    padding: 6px 10px;
    background: transparent;
    border: 1px solid transparent;
    color: #cbd5e1;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
}

.page-btn.active {
    background: #06b6d4;
    color: #072027;
    border-color: transparent;
}

.page-btn:disabled {
    opacity: 0.6;
    cursor: default;
}

.page-size-select {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cbd5e1;
}

.page-size-select select {
    background: #263141;
    color: #e5e7eb;
    border: 1px solid #374151;
    padding: 6px 8px;
    border-radius: 6px;
}

/* Media queries para responsive pagination */
@media (max-width: 1200px) {
    .pagination {
        gap: 12px;
        flex-wrap: wrap;
    }

    .btn-pagination {
        padding: 8px 12px;
        font-size: 0.85rem;
    }

    .page-numbers {
        gap: 4px;
    }

    .page-btn {
        padding: 5px 8px;
        font-size: 0.9rem;
    }

    .page-info {
        font-size: 0.85rem;
        min-width: 140px;
    }

    .page-size-select {
        gap: 6px;
        font-size: 0.85rem;
    }

    .page-size-select select {
        padding: 5px 6px;
        font-size: 0.85rem;
    }
}

@media (max-width: 768px) {
    .pagination {
        gap: 8px;
        width: 100%;
        padding: 15px 10px;
    }

    .btn-pagination {
        padding: 7px 10px;
        font-size: 0.8rem;
        flex-shrink: 1;
        white-space: nowrap;
    }

    .page-numbers {
        gap: 3px;
        flex-shrink: 1;
        min-width: 0;
        overflow-x: auto;
    }

    .page-btn {
        padding: 4px 6px;
        font-size: 0.8rem;
        flex-shrink: 0;
    }

    .page-info {
        font-size: 0.75rem;
        min-width: 100px;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .page-size-select {
        gap: 4px;
        font-size: 0.75rem;
        flex-shrink: 0;
        white-space: nowrap;
    }

    .page-size-select select {
        padding: 4px 4px;
        font-size: 0.75rem;
    }
}

@media (max-width: 480px) {
    .pagination {
        gap: 4px;
        padding: 12px 8px;
    }

    .btn-pagination {
        padding: 6px 8px;
        font-size: 0.75rem;
    }

    .page-numbers {
        gap: 2px;
    }

    .page-btn {
        padding: 3px 5px;
        font-size: 0.7rem;
        min-width: 24px;
        text-align: center;
    }

    .page-info {
        font-size: 0.7rem;
        min-width: 90px;
    }

    .page-size-select {
        gap: 3px;
        font-size: 0.7rem;
    }

    .page-size-select select {
        padding: 3px 3px;
        font-size: 0.7rem;
    }
}

/* Sección de Detalles */
.details-section {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 2px solid #06b6d4;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
    margin-top: 28px;
}

.details-section h3 {
    margin: 0 0 24px 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #06b6d4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.detail-group {
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 10px;
    padding: 18px;
    transition: all 0.2s ease;
}

.detail-group:hover {
    border-color: #06b6d4;
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
}

.detail-group.full-width {
    grid-column: 1 / -1;
}

.detail-group h4 {
    margin: 0 0 14px 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #06b6d4;
    border-bottom: 2px solid #06b6d4;
    padding-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #3f475a;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 700;
    color: #9ca3af;
    flex: 0 0 45%;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.3px;
}

.detail-value {
    color: #e5e7eb;
    flex: 1;
    text-align: right;
    word-wrap: break-word;
    padding-left: 12px;
    font-weight: 600;
}

/* Botón de cerrar detalles eliminado (detalles removidos por petición del usuario) */

/* No results */
.no-results {
    background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
    border: 1.5px solid #4b5563;
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    color: #d1d5db;
}

.no-results svg {
    margin: 0 auto 16px;
    color: #6b7280;
}

.no-results p {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
}

/* Dropdown de Filtros */
/* Dropdown de Filtros - Rediseño */
.dropdown-filters-container {
    position: relative;
    display: inline-block;
}

/* Button styling */
.btn-filter-primary {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 16px;
    height: auto;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: 1px solid rgba(34, 211, 238, 0.4);
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.85), rgba(59, 130, 246, 0.85));
    color: #ffffff;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 600;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(34, 211, 238, 0.15);
}

.btn-filter-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(59, 130, 246, 0.95));
    box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);
    transform: translateY(-2px);
}

.btn-filter-primary:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(34, 211, 238, 0.15);
}

.btn-filter-label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-filter-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.btn-filter-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    line-height: 1.2;
}

.btn-filter-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.9;
    font-weight: 700;
}

.btn-filter-count {
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 1;
}

.btn-filter-chevron {
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-filter-chevron.rotate {
    transform: rotate(180deg);
}

/* Dropdown menu */
.dropdown-filters-menu {
    position: absolute;
    top: calc(100% + 8px);
    background: rgba(15, 23, 42, 0.97);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(34, 211, 238, 0.2);
    z-index: 1100;
    width: 380px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(12px);
}

.dropdown-filters-menu::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: rgba(15, 23, 42, 0.97);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-bottom-color: transparent;
    border-right-color: transparent;
    z-index: -1;
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.3);
}

.dropdown-filters-menu.menu-below::before {
    top: -8px;
    left: 16px;
    transform: rotate(45deg);
}

.dropdown-filters-menu.menu-above {
    top: auto;
    bottom: calc(100% + 8px);
}

.dropdown-filters-menu.menu-above::before {
    bottom: -8px;
    left: 16px;
    top: auto;
    transform: rotate(225deg);
}

.dropdown-filters-menu.menu-right-aligned {
    left: auto;
    right: 0;
}

.dropdown-filters-menu.menu-right-aligned.menu-below::before {
    left: auto;
    right: 16px;
}

.dropdown-filters-menu.menu-right-aligned.menu-above::before {
    left: auto;
    right: 16px;
}

/* Dropdown header */
.dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.2);
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.2);
}

.dropdown-title-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e2e8f0;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid rgba(34, 211, 238, 0.4);
    border-radius: 6px;
    color: #22d3ee;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
    background: rgba(34, 211, 238, 0.1);
    border-color: rgba(34, 211, 238, 0.6);
}

.action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.action-btn svg {
    width: 14px;
    height: 14px;
}

/* Search wrapper */
.dropdown-search-wrapper {
    position: relative;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.15);
    flex-shrink: 0;
}

.search-icon {
    position: absolute;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
    flex-shrink: 0;
}

.dropdown-filters-search {
    width: 100%;
    padding: 8px 12px 8px 36px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(34, 211, 238, 0.25);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.dropdown-filters-search:focus {
    background: rgba(15, 23, 42, 0.9);
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
}

.dropdown-filters-search::placeholder {
    color: #64748b;
}

/* Active filters section */
.dropdown-active-section {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.15);
    background: rgba(34, 211, 238, 0.05);
    flex-shrink: 0;
}

.active-section-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
}

.active-filters-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.active-filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(34, 211, 238, 0.15);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 6px;
    color: #22d3ee;
    font-size: 0.8rem;
    font-weight: 500;
}

.chip-label {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chip-remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: none;
    border: none;
    color: #22d3ee;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.chip-remove-btn:hover {
    opacity: 1;
}

.chip-remove-btn svg {
    width: 12px;
    height: 12px;
}

/* State messages */
.dropdown-state-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 24px;
    color: #94a3b8;
    font-size: 0.9rem;
    text-align: center;
    min-height: 120px;
}

.loading-state {
    color: #64748b;
}

.empty-state svg {
    width: 24px;
    height: 24px;
    color: #64748b;
}

/* Filters list */
.dropdown-filters-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.filter-category {
    padding: 4px 0;
}

/* Accordions: compact details/summary styling for dropdown */
.filter-category summary.category-header,
.dropdown-active-accordion > summary.active-section-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px 6px;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: transparent;
    border-top: 1px solid rgba(34, 211, 238, 0.06);
    list-style: none;
    cursor: pointer;
}

.filter-category summary.category-header {
    gap: 8px;
}

.filter-category summary.category-header .category-chevron,
.dropdown-active-accordion summary .summary-chevron {
    width: 14px;
    height: 14px;
    color: #8b98a8;
    flex-shrink: 0;
    transition: transform 0.18s ease;
}

.filter-category[open] summary.category-header .category-chevron,
.dropdown-active-accordion[open] summary .summary-chevron {
    transform: rotate(180deg);
}

.dropdown-active-accordion .active-filters-list {
    padding: 8px 16px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* Remove default marker in WebKit for cleaner look */
.filter-category summary::-webkit-details-marker,
.dropdown-active-accordion summary::-webkit-details-marker {
    display: none;
}

.category-header {
    padding: 10px 16px 6px;
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: transparent;
    border-top: 1px solid rgba(34, 211, 238, 0.15);
    margin-top: 4px;
}

.filter-category:first-child .category-header {
    border-top: none;
    margin-top: 0;
}

.category-filters {
    display: flex;
    flex-direction: column;
    padding: 0;
    gap: 0;
}

/* Filter checkbox item */
.filter-checkbox-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    margin: 2px 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s ease;
    color: #e2e8f0;
    user-select: none;
    position: relative;
}

.filter-checkbox-item:hover:not(.is-disabled) {
    background: rgba(34, 211, 238, 0.1);
}

.filter-checkbox-item.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.filter-checkbox-item input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 1.5px solid rgba(34, 211, 238, 0.4);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: relative;
}

.filter-checkbox-item:hover:not(.is-disabled) input[type="checkbox"] {
    border-color: rgba(34, 211, 238, 0.6);
}

.filter-checkbox-item input[type="checkbox"]:checked {
    background: #22d3ee;
    border-color: #22d3ee;
}

.filter-checkbox-item input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #0f172a;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.filter-checkbox-item input[type="checkbox"]:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    border-color: rgba(34, 211, 238, 0.2);
}

.checkbox-custom {
    display: none;
}

.filter-item-label {
    flex: 1;
    font-size: 0.9rem;
    color: #e2e8f0;
    word-break: break-word;
}

.filter-type-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
}

.filter-type-badge.fixed {
    background: rgba(100, 116, 139, 0.3);
    color: #cbd5e1;
}

.filter-type-badge.active {
    background: rgba(34, 211, 238, 0.25);
    color: #22d3ee;
}

/* Footer */
.dropdown-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(34, 211, 238, 0.15);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.1);
}

.filter-counter {
    color: #94a3b8;
    font-size: 0.8rem;
    font-weight: 600;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
    opacity: 1;
}

/* Scrollbar styling */
.dropdown-filters-list::-webkit-scrollbar {
    width: 6px;
}

.dropdown-filters-list::-webkit-scrollbar-track {
    background: transparent;
}

.dropdown-filters-list::-webkit-scrollbar-thumb {
    background: rgba(34, 211, 238, 0.3);
    border-radius: 3px;
}

.dropdown-filters-list::-webkit-scrollbar-thumb:hover {
    background: rgba(34, 211, 238, 0.5);
}

.loader-spinner-small {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(34, 211, 238, 0.2);
    border-top-color: #22d3ee;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.scan-global-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(59, 130, 246, 0.45);
    background: rgba(37, 99, 235, 0.18);
    color: #e5f0ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.scan-global-btn:hover {
    background: rgba(37, 99, 235, 0.3);
    box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
}

.mobile-limit-note {
    margin-top: 8px;
    font-size: 0.78rem;
    color: rgba(253, 186, 116, 0.9);
    background: rgba(251, 146, 60, 0.12);
    border: 1px solid rgba(251, 146, 60, 0.35);
    padding: 6px 10px;
    border-radius: 8px;
    width: fit-content;
}

.maintenance-card.is-maintenance {
    border-color: rgba(34, 197, 94, 0.55);
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.4), 0 8px 24px rgba(16, 185, 129, 0.25);
    animation: maintenancePulse 1.8s ease-in-out infinite;
}

@keyframes maintenancePulse {
    0% { box-shadow: 0 0 0 1px rgba(34,197,94,0.35), 0 8px 24px rgba(16,185,129,0.15); }
    50% { box-shadow: 0 0 0 2px rgba(34,197,94,0.6), 0 10px 28px rgba(16,185,129,0.35); }
    100% { box-shadow: 0 0 0 1px rgba(34,197,94,0.35), 0 8px 24px rgba(16,185,129,0.15); }
}
.public-scan-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3,8,20,0.6);
  z-index: 6000;
}
.public-scan-card {
  background: linear-gradient(180deg, rgba(13,22,34,0.98), rgba(7,12,18,0.98));
  border-radius: 12px;
  padding: 20px 22px;
  width: min(520px, 94vw);
  color: #f2f7ff;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  text-align: center;
}
.public-scan-card h3 {
  margin: 0 0 8px 0;
}
.public-scan-card .muted { color: rgba(255,255,255,0.78); margin-bottom: 10px }
.public-scan-card .overlay-item-info { margin: 8px 0 12px 0 }
.public-scan-card .overlay-item-name { font-weight: 700; font-size: 1.05rem }
.public-scan-card .overlay-item-meta { font-size: 0.9rem; color: rgba(255,255,255,0.72) }
.public-scan-card .overlay-actions { margin-top: 14px; display:flex; gap:10px; justify-content:center }
.public-scan-card .btn-primary { background:#4f8cff; color:#fff; border-radius:8px; padding:8px 14px; border:0 }
.public-scan-card .btn-secondary { background:transparent; color:#cfe4ff; border-radius:8px; padding:8px 14px; border:1px solid rgba(255,255,255,0.06) }

.title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.btn-back-to-dashboard {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(74, 144, 226, 0.15));
    color: rgba(76, 186, 150, 0.9);
    border: 1px solid rgba(76, 186, 150, 0.4);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.btn-back-to-dashboard:hover {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.25));
    border-color: rgba(76, 186, 150, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 186, 150, 0.2);
}

.btn-back-to-dashboard:active {
    transform: translateY(0);
}

/* Suspense fallback spinner */
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(76, 186, 150, 0.2);
    border-top: 4px solid rgba(76, 186, 150, 0.9);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.suspense-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
}

.testing-environment-title {
    flex: 1;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: #f1f5f9;
}

.testing-environment-main :deep(.panel-surface) {
    /* Exact same visual as .topbar (glass + transparency) */
    background: rgba(19, 31, 52, 0.50) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    backdrop-filter: blur(12px) saturate(150%) !important;
    -webkit-backdrop-filter: blur(12px) saturate(150%) !important;
    box-shadow: 0 16px 48px rgba(2, 6, 23, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    background-clip: padding-box !important;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Ensure the single main panel (the one que contiene el título) appears identical to topbar
   and inner sections look embedded by using transparent backgrounds. This targets only
   the panel surface inside the testing environment — no extra wrapper created. */
.testing-environment-main :deep(.panel-surface) .filters-section,
.testing-environment-main :deep(.panel-surface) .cards-section,
.testing-environment-main :deep(.panel-surface) .drawer,
.testing-environment-main :deep(.panel-surface) .title-row {
    background: transparent !important;
    border-color: rgba(255,255,255,0.06) !important;
}

/* Tabs Navigation Styles */
.tabs-navigation {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    width: fit-content;
}

.tab-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.8rem 1.4rem;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
}

.tab-link.active {
    color: #fff;
    background: var(--primary-color, #06b6d4);
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

.tab-pane-content {
    animation: fadeInTab 0.4s ease-out;
}

@keyframes fadeInTab {
    from { 
        opacity: 0; 
        transform: translateY(10px) scale(0.995);
    }
    to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
    }
}
</style>