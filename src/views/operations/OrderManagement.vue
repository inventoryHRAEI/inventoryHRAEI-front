<template>
    <div class="order-management-container">
        <ActionPanel class="order-management-main">
            <template #title>
                <div class="title-row">
                    <button class="btn-back-to-dashboard" @click="goToDashboard" title="Volver al dashboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <span>Gestión de Órdenes de Entrada</span>
                    <button class="btn-create-order" @click="goToCreateOrder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nueva Orden
                    </button>


                </div>
            </template>

            <Breadcrumbs />

            <!-- Filtros: estructura elegante con 3 columnas -->
            <div class="filters-section">
                <!-- Filtros principales (siempre visibles) -->
                <div class="filter-group filter-group-narrow">
                    <label>Folio de operación:</label>
                    <input v-model="filterFolio" class="control filter-input" placeholder="Ej. 5-011" />
                </div>
                <div class="filter-group filter-group-narrow">
                    <label>Nombre del solicitante:</label>
                    <input v-model="filterSolicitante" class="control filter-input" placeholder="Ej. Dr. Juan Pérez" />
                </div>
                <div class="filter-group filter-group-compact">
                    <label>Filtrar por fecha:</label>
                    <div style="display: flex; gap: 8px; align-items: flex-end;">
                        <DatePicker v-model="filterDateDisplay" placeholder="Seleccionar fecha" />
                        <!-- Botón Añadir filtros aquí -->
                        <div class="dropdown-container" @click.stop style="min-width: fit-content;"
                            ref="filterDropdownRef">
                            <button class="btn-add-filters compact" @click="showMoreFilters = !showMoreFilters"
                                :aria-expanded="showMoreFilters"
                                :class="{ 'has-active-filters': hasActiveAdvancedFilters }">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M22 3H2l8 9v7l4 2v-9l8-9z" fill="currentColor" />
                                </svg>
                                <span v-if="hasActiveAdvancedFilters" class="filter-badge">{{ activeFiltersList.length
                                    }}</span>
                            </button>

                            <!-- Dropdown de filtros disponibles -->
                            <div v-if="showMoreFilters" class="filters-dropdown-new">
                                <div class="dropdown-header-new">
                                    <h4 class="dropdown-title-new">Filtros Disponibles</h4>
                                    <button type="button" class="btn-close-dropdown-new"
                                        @click="showMoreFilters = false" aria-label="Cerrar">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div class="dropdown-content-new">
                                    <div class="filter-group-section">
                                        <div class="section-label">Información de Solicitud</div>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterServiceActive" />
                                            <span>Servicio</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterEspecialidadActive" />
                                            <span>Especialidad</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterIngenieroActive" />
                                            <span>Ingeniero residente</span>
                                        </label>
                                    </div>
                                    <div class="filter-group-section">
                                        <div class="section-label">Detalles de Orden</div>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterMotivoActive" />
                                            <span>Motivo de entrada</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterObservacionesActive" />
                                            <span>Observaciones</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterHoraActive" />
                                            <span>Rango de horas</span>
                                        </label>
                                    </div>
                                    <div class="filter-group-section">
                                        <div class="section-label">Características de Equipos</div>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterTipoActive" />
                                            <span>Tipo de artículo</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterMarcaActive" />
                                            <span>Marca</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterModeloActive" />
                                            <span>Modelo</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterUbicacionActive" />
                                            <span>Ubicación</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterClaveHRAEIActive" />
                                            <span>Clave HRAEI</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterItemTextActive" />
                                            <span>Búsqueda en artículos</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="dropdown-footer-new">
                                    <button type="button" class="btn-listo-new"
                                        @click="showMoreFilters = false">Listo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filtros activos en el mismo grid (respeta las 3 columnas) -->
                <template v-for="(f, idx) in activeFiltersList" :key="f.key">
                    <div class="filter-group active-filter-inline">
                        <label>{{ f.label }}</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <div style="flex: 1;">
                                <template v-if="f.key === 'service'">
                                    <input v-model="filterService" class="control filter-input"
                                        placeholder="Ej. Urgencias..." />
                                </template>
                                <template v-else-if="f.key === 'especialidad'">
                                    <input v-model="filterEspecialidad" class="control filter-input"
                                        placeholder="Ej. Traumatología..." />
                                </template>
                                <template v-else-if="f.key === 'motivo'">
                                    <CustomSelect v-model="filterMotivo" :options="motivoEntradaOptions"
                                        placeholder="(Seleccionar)" class="filter-input" />
                                </template>
                                <template v-else-if="f.key === 'obs'">
                                    <input v-model="filterObservaciones" class="control filter-input"
                                        placeholder="Buscar en observaciones" />
                                </template>
                                <template v-else-if="f.key === 'ing'">
                                    <input v-model="filterIngeniero" class="control filter-input"
                                        placeholder="Buscar nombre" />
                                </template>
                                <template v-else-if="f.key === 'tipo'">
                                    <CustomSelect v-model="filterTipo" :options="tipoOptions" placeholder="Todos"
                                        class="filter-input" />
                                </template>
                                <template v-else-if="f.key === 'itemText'">
                                    <input v-model="filterItemText" class="control filter-input"
                                        placeholder="Nombre, modelo, serie..." />
                                </template>
                                <template v-else-if="f.key === 'hora'">
                                    <div class="hora-range">
                                        <input v-model="filterHoraInicioFrom" type="time"
                                            class="control filter-input" />
                                        <input v-model="filterHoraInicioTo" type="time" class="control filter-input" />
                                    </div>
                                </template>
                                <template v-else-if="f.key === 'marca'">
                                    <input v-model="filterMarca" class="control filter-input"
                                        placeholder="Ej. Philips..." />
                                </template>
                                <template v-else-if="f.key === 'modelo'">
                                    <input v-model="filterModelo" class="control filter-input"
                                        placeholder="Ej. MX40..." />
                                </template>
                                <template v-else-if="f.key === 'ubicacion'">
                                    <input v-model="filterUbicacion" class="control filter-input"
                                        placeholder="Ej. UCIA..." />
                                </template>
                                <template v-else-if="f.key === 'claveHRAEI'">
                                    <input v-model="filterClaveHRAEI" class="control filter-input"
                                        placeholder="Ej. COMODATO..." />
                                </template>
                            </div>
                            <button type="button" class="btn-remove-filter" @click="removeActiveFilter(f.key)"
                                title="Remover filtro">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Botón Limpiar todos (debajo de filtros si hay activos) -->
                <transition name="fade-in">
                    <div v-if="activeFiltersList.length > 0"
                        style="grid-column: 1 / -1; display: flex; justify-content: flex-end;">
                        <button type="button" class="btn-clear-filters" @click="clearAllFilters">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path
                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                </path>
                            </svg>
                            <span>Limpiar</span>
                        </button>
                    </div>
                </transition>
            </div>

            <!-- Datatable -->
            <OrdersTable :filtered-orders="filteredOrders" :show-column-service="showColumnService"
                :show-column-especialidad="showColumnEspecialidad" :show-column-motivo="showColumnMotivo"
                :show-column-descripcion="showColumnDescripcion" :show-column-observaciones="showColumnObservaciones"
                :show-column-ingeniero="showColumnIngeniero" :show-column-hora="showColumnHora"
                :show-column-tipo="showColumnTipo" :show-column-items="showColumnItems"
                :show-column-estado="showColumnEstado"
                :empty-state-message="searchTerm || filterDate || filterService ? 'No se encontraron órdenes con los filtros seleccionados.' : 'Comienza creando una nueva orden.'"
                @edit="openEditModal" @delete="deleteOrder" @deleteMultiple="handleDeleteMultipleWithModal"
                @create="goToCreateOrder" @openHistory="openDocumentModal" />
        </ActionPanel>

        <!-- Modal: edición única (no permite múltiples) + tabs de versiones (ramas) -->
        <ModalBase :open="showEditModal" @close="handleModalClose" @close-request="handleModalClose" :maxWidth="1100"
            :height="'92vh'" :hideInternalClose="true" :externalClose="true" :externalCloseOffsetTop="0"
            :externalCloseOffsetRight="0">
            <div class="om-edit-shell">
                <div class="om-edit-tabs" role="tablist" aria-label="Versiones de la orden">
                    <button v-if="!branchTabs.length" class="om-tab" :class="{ active: activeTab === 'main' }"
                        @click="activeTab = 'main'" role="tab" :aria-selected="activeTab === 'main'">
                        {{ selectedOrderId || '—' }}
                    </button>
                    <button v-for="v in branchTabs" :key="v" class="om-tab"
                        :class="{ active: activeTab === v, newest: v === newestVersion }" @click="activeTab = v"
                        role="tab" :aria-selected="activeTab === v">
                        {{ v === 1 ? selectedOrderId : `${selectedOrderId} v${v}` }}
                    </button>
                    <div style="flex:1"></div>
                    <div class="om-help-wrap" ref="legendWrapRef">
                        <button type="button" class="om-tab-help" @mouseenter="showLegend = true"
                            @mouseleave="showLegend = false" aria-label="Ayuda de colores">?</button>
                        <div v-if="showLegend" class="om-legend-popover" role="tooltip" aria-label="Leyenda de colores">
                            <div class="om-legend-row"><span
                                    class="om-legend-dot is-green"></span><strong>Verde</strong>:
                                agregado o rellenado.</div>
                            <div class="om-legend-row"><span
                                    class="om-legend-dot is-yellow"></span><strong>Amarillo</strong>:
                                editado/modificado.</div>
                            <div class="om-legend-row"><span class="om-legend-dot is-red"></span><strong>Rojo</strong>:
                                eliminado o vaciado (se muestra como N/A).</div>
                        </div>
                    </div>
                </div>

                <div v-if="activeTab !== 'main'" class="om-version-panel" role="tabpanel">
                    <!-- SOLO la versión más reciente (golden/newest) es editable -->
                    <OpEntrada v-if="isActiveTabEditable" :key="`edit-${selectedOrderId}-${activeTab}`" :modo="'editar'"
                        :ordenId="selectedOrderId" :enModal="true" :read-only="false" @actualizado="onOrderUpdated"
                        @close="closeEditModal" />

                    <!-- Versiones anteriores: snapshot + solo lectura + resaltados -->
                    <OpEntrada v-else :key="`snap-${selectedOrderId}-${activeTab}`" :modo="'editar'"
                        :ordenId="selectedOrderId" :enModal="true" :read-only="true"
                        :snapshot="snapshotForActiveVersion" :diffHighlights="highlightsForActiveVersion"
                        @close="closeEditModal" />
                </div>

                <div v-show="activeTab === 'main' && !branchTabs.length" role="tabpanel" class="om-main-panel">
                    <OpEntrada :key="mainEditorKey" ref="opEntradaRef" :ordenId="selectedOrderId" :modo="'editar'"
                        :enModal="true" :read-only="false" @actualizado="onOrderUpdated" @close="closeEditModal" />
                </div>
            </div>
        </ModalBase>

        <!-- Modal: versiones / visor de documento (PDF) -->
        <ModalBase :open="showDocModal" @close="closeDocumentModal" @close-request="closeDocumentModal" :maxWidth="1200"
            :height="'90vh'" :externalClose="true" :externalCloseOffsetTop="0" :externalCloseOffsetRight="0">
            <div class="doc-modal-shell">
                <aside class="doc-sidebar">
                    <div class="doc-header">
                        <div class="doc-title-section">
                            <svg class="doc-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <div>
                                <h3 class="doc-main-title">Documentos</h3>
                                <p class="doc-subtitle">Folio: <strong>{{ docTitle }}</strong></p>
                            </div>
                        </div>
                        <div class="doc-actions-group">
                            <button class="btn-doc-action refresh-btn" :class="{ 'is-loading': isLoadingOrders }"
                                @click="fetchDocVersionsFor(docTitle)" :disabled="isLoadingOrders"
                                title="Recargar versiones">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" :class="{ 'spin': isLoadingOrders }">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="doc-list-section">
                        <div v-if="docLoading" class="skeleton-loading">
                            <div v-for="i in 5" :key="`skeleton-${i}`" class="skeleton-item">
                                <div class="skeleton-icon"></div>
                                <div class="skeleton-content">
                                    <div class="skeleton-title"></div>
                                    <div class="skeleton-meta"></div>
                                </div>
                                <div class="skeleton-button"></div>
                            </div>
                        </div>
                        <div v-else-if="docError" class="error-state">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>{{ docError }}</p>
                        </div>
                        <div v-else-if="docVersions.length === 0" class="empty-versions-state">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <p>Sin versiones</p>
                        </div>
                        <ul v-else class="doc-list">
                            <li v-for="v in docVersions" :key="v.id" class="doc-list-item"
                                :class="{ active: selectedPdfId === v.id }">
                                <button class="doc-item-btn" @click="selectDocVersion(v)">
                                    <div class="doc-item-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="12" y1="13" x2="12" y2="17"></line>
                                            <line x1="9" y1="15" x2="15" y2="15"></line>
                                        </svg>
                                    </div>
                                    <div class="doc-item-content">
                                        <div class="doc-item-name">{{ v.name || ('entrada ' + docTitle + (v.version ? `
                                            v${v.version}` : '') + '.pdf') }}</div>
                                        <div class="doc-item-meta">{{ v.createdBy || '—' }} • {{
                                            formatTimestamp(v.createdAt) }}
                                        </div>
                                    </div>
                                </button>
                                <a :href="v.downloadUrl" target="_blank" class="btn-download-doc" title="Descargar"
                                    @click="playDownloadAnimation(v.id)">
                                    <svg class="download-icon" :class="{ 'show-checkmark': downloadingId === v.id }"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    <svg v-show="downloadingId === v.id" class="checkmark-icon"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>
                </aside>

                <section class="doc-viewer">
                    <div class="viewer-content">
                        <div v-if="currentPreviewUrl" class="pdf-frame">
                            <template v-if="!isMobileView">
                                <iframe :src="currentPreviewUrl" title="Previsualización documento" style="width:100%; height:100%; border:0; min-height:360px;"></iframe>
                            </template>
                            <template v-else>
                                <BlobPdfViewer :src="currentPreviewUrl" />
                            </template>
                        </div>
                        <div v-else class="no-preview">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <p>Selecciona una versión para previsualizar</p>
                        </div>
                    </div>
                </section>
            </div>
        </ModalBase>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue'
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'
import { useRouter, useRoute } from 'vue-router'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import DatePicker from '@/components/DatePicker.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import OrdersTable from '@/components/OrdersTable.vue'
import ModalBase from '@/components/ModalBase.vue'
import PdfViewer from '@/components/PdfViewer.vue'
import BlobPdfViewer from '@/components/BlobPdfViewer.vue'
import { confirmDelete, showSuccess } from '@/utils/sweetAlertConfig'
import Swal from 'sweetalert2'
import { darkThemeConfig } from '@/utils/sweetAlertConfig'
const OpEntrada = defineAsyncComponent(() => import('@/views/operations/OpEntrada.vue'))

// Mock helper para versiones de PDF (se puede reemplazar por API real)
import { mockFetchVersions } from '@/utils/mockPDFData'

const router = useRouter()

// Detect mobile vs desktop view to choose preview renderer
const isMobileView = ref(typeof window !== 'undefined' ? window.innerWidth < 720 : false)
function handleResizeForPreview() {
    isMobileView.value = window.innerWidth < 720
}
onMounted(() => {
    window.addEventListener('resize', handleResizeForPreview)
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResizeForPreview)
})
const route = useRoute()

// Forzar recarga de órdenes cuando se navega a esta ruta con un timestamp `t` (e.g. after creating an order)
watch(() => route.query.t, async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
        try {
            await reloadOrdersFromServer()
        } catch (e) {
            console.warn('[ORDER_MANAGEMENT] reload on route query.t failed', e)
        }
    }
})

const allOrders = ref([])

// Estado y helpers para modal de edición (offsets ajustables desde acciones)
const editExternalOffsetTop = ref(0)
const editExternalOffsetRight = ref(0)

// Estado y helpers para modal de documento (versiones / preview)
const showDocModal = ref(false)
const docVersions = ref([])
const docLoading = ref(false)
const docTitle = ref('')
const currentPreviewUrl = ref('')
const docError = ref('')
const selectedPdfId = ref(null)
const downloadingId = ref(null)
const isLoadingOrders = ref(false)

async function openDocumentModal(order) {
    console.log('[ORDER_MANAGEMENT] openDocumentModal called:', order)
    const docId = order?.folio ?? order?.id ?? null
    if (!docId) {
        console.warn('[ORDER_MANAGEMENT] openDocumentModal: docId inválido')
        return
    }
    docTitle.value = String(docId)
    showDocModal.value = true

    // Auto-reload al abrir la modal
    await fetchDocVersionsFor(docId)
}

async function fetchDocVersionsFor(folio) {
    docLoading.value = true
    isLoadingOrders.value = true
    docError.value = ''
    currentPreviewUrl.value = ''
    docVersions.value = []

    const startTime = Date.now()
    const minDuration = 1200 // Duración mínima para que se vea la animación (1 vuelta completa)

    try {
        const res = await fetch(`/api/ops/entrada/${encodeURIComponent(folio)}/pdfs`)
        if (!res.ok) {
            const payload = await res.json().catch(() => ({}))
            throw new Error(payload && (payload.msg || payload.error) ? (payload.msg || payload.error) : 'Error obteniendo versiones')
        }
        const json = await res.json()
        console.debug('[ORDER_MANAGEMENT] fetched pdfs response (refresh):', json)
        let items = []
        if (Array.isArray(json)) items = json
        else if (json && Array.isArray(json.items)) items = json.items
        else if (json && Array.isArray(json.rows)) items = json.rows
        else if (json && Array.isArray(json.data)) items = json.data

        docVersions.value = (items || []).map((it, idx) => {
            const id = it.id || it.pdfId || it.filename || `tmp-${idx}-${Date.now()}`
            const createdAt = it.createdAt || it.created_at || it.timestamp || null
            const createdBy = it.createdBy || it.created_by || it.uploader || null
            const previewUrl = it.previewUrl || it.preview_url || `/api/ops/entrada/${encodeURIComponent(folio)}/pdfs/${encodeURIComponent(id)}/preview`
            const downloadUrl = it.downloadUrl || it.download_url || `/api/ops/entrada/${encodeURIComponent(folio)}/pdfs/${encodeURIComponent(id)}/download`
            return {
                ...it,
                id,
                createdAt: createdAt ? new Date(createdAt).toISOString() : null,
                createdBy: createdBy || '—',
                previewUrl,
                downloadUrl
            }
        })

        // Also fetch snapshot versions and merge
        try {
            const versRes = await fetch(`/api/ops/entrada/${encodeURIComponent(folio)}/versions?limit=50`)
            if (versRes.ok) {
                const versJson = await versRes.json()
                const rows = (versJson && Array.isArray(versJson.items)) ? versJson.items : []
                const versItems = rows.map(v => {
                    const ver = v.version || v.v || 0
                    const createdAt = v.created_at || v.createdAt || null
                    return {
                        id: `ver-${ver}`,
                        name: `entrada ${folio} v${ver}.pdf`,
                        version: ver,
                        type: 'version',
                        createdAt: createdAt ? new Date(createdAt).toISOString() : null,
                        createdBy: v.created_by || v.createdBy || 'snapshot',
                        previewUrl: `/api/ops/entrada/${encodeURIComponent(folio)}/versions/${encodeURIComponent(ver)}/preview`,
                        downloadUrl: `/api/ops/entrada/${encodeURIComponent(folio)}/versions/${encodeURIComponent(ver)}/download`
                    }
                })
                // prepend versions (most recent first)
                docVersions.value = [...versItems, ...docVersions.value]
            }
        } catch (e) {
            console.warn('No se pudieron cargar versiones snapshots', e)
        }
        if (docVersions.value.length) selectDocVersion(docVersions.value[0])
    } catch (e) {
        docVersions.value = []
        docError.value = String(e && e.message ? e.message : e)
    } finally {
        // Espera el tiempo mínimo para que la animación sea visible
        const elapsed = Date.now() - startTime
        const remaining = minDuration - elapsed
        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining))
        }

        docLoading.value = false
        isLoadingOrders.value = false
    }
}

async function forceGenerate() {
    if (!docTitle.value) return
    docLoading.value = true
    try {
        const res = await fetch(`/api/ops/entrada/${encodeURIComponent(docTitle.value)}/pdfs/generate-force`)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
            const msg = json && (json.msg || json.error) ? (json.msg || json.error) : 'Error generando PDF'
            docError.value = msg
            await Swal.fire({ icon: 'error', title: 'Error', text: msg, ...darkThemeConfig })
            return
        }
        await Swal.fire({ icon: 'success', title: 'Generado', text: 'PDF generado y guardado localmente.', ...darkThemeConfig })
        // refresh list
        await fetchDocVersionsFor(docTitle.value)
    } catch (e) {
        docError.value = String(e && e.message ? e.message : e)
        await Swal.fire({ icon: 'error', title: 'Error', text: docError.value, ...darkThemeConfig })
    } finally {
        docLoading.value = false
    }
}

async function generateAllVersions() {
    if (!docTitle.value) return
    docLoading.value = true
    try {
        const res = await fetch(`/api/ops/entrada/${encodeURIComponent(docTitle.value)}/pdfs/generate-all-versions`)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
            const msg = json && (json.msg || json.error) ? (json.msg || json.error) : 'Error generando versiones'
            docError.value = msg
            await Swal.fire({ icon: 'error', title: 'Error', text: msg, ...darkThemeConfig })
            return
        }
        await Swal.fire({ icon: 'success', title: 'Generadas', text: 'Se generaron/registraron las versiones (revisa resultados en consola).', ...darkThemeConfig })
        console.debug('generateAllVersions result:', json)
        // refresh list
        await fetchDocVersionsFor(docTitle.value)
    } catch (e) {
        docError.value = String(e && e.message ? e.message : e)
        await Swal.fire({ icon: 'error', title: 'Error', text: docError.value, ...darkThemeConfig })
    } finally {
        docLoading.value = false
    }
}

function closeDocumentModal() {
    showDocModal.value = false
    docVersions.value = []
    currentPreviewUrl.value = ''
    docTitle.value = ''
}

function selectDocVersion(v) {
    const folio = docTitle.value || ''
    if (!v || !v.id) {
        currentPreviewUrl.value = ''
        return
    }
    // Prefer item's explicit previewUrl (covers snapshot versions), otherwise use default preview endpoint
    // For mobile viewers, route via backend proxy to avoid CORS/session issues
    if (isMobileView.value) {
        if (v.version) {
            currentPreviewUrl.value = `/api/ops/preview-proxy?folio=${encodeURIComponent(folio)}&version=${encodeURIComponent(v.version)}`
        } else {
            currentPreviewUrl.value = `/api/ops/preview-proxy?folio=${encodeURIComponent(folio)}&id=${encodeURIComponent(v.id)}`
        }
    } else {
        currentPreviewUrl.value = v.previewUrl || `/api/ops/entrada/${encodeURIComponent(folio)}/pdfs/${v.id}/preview`
    }
    selectedPdfId.value = v.id
}

function playDownloadAnimation(id) {
    downloadingId.value = id
    setTimeout(() => {
        downloadingId.value = null
    }, 1500)
}

// Función para normalizar folios para búsqueda flexible
// Convierte "E-000912" -> "E-912" y "E-912" -> "E-912" para comparación
function normalizeFolio(folio) {
    if (!folio || typeof folio !== 'string') return ''

    // Si parece un folio (E- seguido de números)
    const folioMatch = folio.match(/^(E-)?(\d+)$/i)
    if (folioMatch) {
        const prefix = 'E-'
        const number = parseInt(folioMatch[2], 10) // Elimina ceros a la izquierda
        return `${prefix}${number}`
    }

    return folio.toLowerCase()
}

// Función para verificar si una búsqueda coincide con un folio (flexible)
function folioMatches(orderFolio, searchTerm) {
    if (!orderFolio || !searchTerm) return false

    const searchLower = searchTerm.toLowerCase()
    const orderFolioLower = orderFolio.toLowerCase()

    // Búsqueda exacta (case-insensitive)
    if (orderFolioLower.includes(searchLower)) return true

    // Búsqueda normalizada (para casos como E-912 vs E-000912)
    const normalizedSearch = normalizeFolio(searchTerm)
    const normalizedOrder = normalizeFolio(orderFolio)

    return normalizedOrder.includes(normalizedSearch)
}

const filterFolio = ref('')
const filterSolicitante = ref('')
const tipoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Equipo Médico', value: 'equipo-medico' },
    { label: 'Mobiliario', value: 'mobiliario' },
    { label: 'Accesorio', value: 'accesorio' },
    { label: 'Consumible', value: 'consumible' },
    { label: 'Refacción', value: 'refaccion' }
]

const estadoOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Proceso', value: 'en-proceso' },
    { label: 'Completado', value: 'completado' }
]
const searchTerm = ref('') // keep general fallback search
const showMoreFilters = ref(false)
const filterDate = ref('')
const filterDateDisplay = ref('')
const filterService = ref('')
const filterEspecialidad = ref('')
const filterMotivo = ref('')
const filterObservaciones = ref('')
const filterIngeniero = ref('')
const filterServiceActive = ref(false)
const filterEspecialidadActive = ref(false)
const filterMotivoActive = ref(false)
const filterObservacionesActive = ref(false)
const filterIngenieroActive = ref(false)
const filterTipoActive = ref(true)  // Activado por defecto
const filterItemTextActive = ref(false)
const filterHoraActive = ref(false)
const filterMarcaActive = ref(false)
const filterModeloActive = ref(false)
const filterUbicacionActive = ref(false)
const filterClaveHRAEIActive = ref(false)
const filterEstado = ref('')
const filterHoraInicioFrom = ref('')
const filterHoraInicioTo = ref('')
const filterMarca = ref('')
const filterModelo = ref('')
const filterUbicacion = ref('')
const filterClaveHRAEI = ref('')
const filterMinItems = ref(null)
const filterMaxItems = ref(null)
const filterTipo = ref('')
const filterItemText = ref('')
const loading = ref(true)
const showEditModal = ref(false)
const editingOrder = ref(null)
const selectedOrderId = ref(null)
const activeTab = ref('main')
const branchTabs = ref([])
const diffByVersion = ref({})
const snapshotByVersion = ref({})
const mainEditorKey = ref(0)
const showLegend = ref(false)
const legendWrapRef = ref(null)

/**
 * Almacena la versión máxima de forma explícita y sincronizada
 * Esto evita problemas de timing en la evaluación del template
 */
const maxVersionNumber = ref(null)

/**
 * Calcula la versión más reciente (la de mayor número)
 * Retorna null si no hay versiones disponibles
 */
const newestVersion = computed(() => {
    if (!Array.isArray(branchTabs.value) || !branchTabs.value.length) return null
    return Math.max(...branchTabs.value)
})

/**
 * Calcula si el tab actualmente seleccionado es la versión más reciente
 * Solo retorna true si:
 * 1. activeTab no es 'main'
 * 2. Hay versiones disponibles en branchTabs
 * 3. activeTab es igual al máximo de branchTabs
 */
const isNewestVersionTab = computed(() => {
    if (activeTab.value === 'main' || activeTab.value === null) return false
    if (!Array.isArray(branchTabs.value) || !branchTabs.value.length) return false
    const newest = Math.max(...branchTabs.value)
    return activeTab.value === newest
})

// Regla de UX: solo la versión más reciente (vN) es editable.
const isActiveTabEditable = computed(() => {
    if (activeTab.value === 'main' || activeTab.value === null) return false
    if (maxVersionNumber.value == null) return false
    return Number(activeTab.value) === Number(maxVersionNumber.value)
})

/**
 * Obtiene la versión más antigua disponible
 */
const oldestVersion = computed(() => {
    if (!Array.isArray(branchTabs.value) || !branchTabs.value.length) return null
    return Math.min(...branchTabs.value)
})

/**
 * Obtiene el número total de versiones disponibles
 */
const totalVersions = computed(() => {
    return Array.isArray(branchTabs.value) ? branchTabs.value.length : 0
})

/**
 * Obtiene el índice de la versión actual dentro de branchTabs
 * Útil para navegación entre versiones
 */
const currentVersionIndex = computed(() => {
    if (!Array.isArray(branchTabs.value) || activeTab.value === 'main') return -1
    return branchTabs.value.indexOf(activeTab.value)
})

const snapshotForActiveVersion = computed(() => {
    const v = activeTab.value
    if (v === 'main') return null
    const snap = snapshotByVersion.value[String(v)] || null
    if (!snap) return null

    // Para mostrar eliminaciones en la vista, agregamos "ghost" items al final (solo en pestaña de versión)
    const rows = diffByVersion.value[String(v)] || []
    const deleted = []
    for (const r of rows) {
        if (r && r.action === 'delete_item' && r.old_json) {
            try {
                const obj = typeof r.old_json === 'string' ? JSON.parse(r.old_json) : r.old_json
                deleted.push({ ...obj, line: r.line, __diffGhost: true, __diffStatus: 'red' })
            } catch {
                // ignore parse error
            }
        }
    }
    if (!deleted.length) return snap
    return {
        ...snap,
        items: [...(Array.isArray(snap.items) ? snap.items : []), ...deleted]
    }
})

const highlightsForActiveVersion = computed(() => {
    const v = activeTab.value
    if (v === 'main') return null
    const rows = diffByVersion.value[String(v)] || []
    return buildHighlights(rows)
})
const newEditItem = ref({ tipo: '', cantidad: 1, descripcion: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', claveHRAEI: '', unidades: [] })
const editingItemIndex = ref(-1)
const filterDropdownRef = ref(null)
const opEntradaRef = ref(null)

// Keep a normalized date in `filterDate` for comparisons (DD-MM-YYYY format from database)
watch(filterDateDisplay, (val) => {
    console.log('=== WATCH filterDateDisplay ===')
    console.log('Raw value:', val)
    console.log('Type:', typeof val)
    console.log('String representation:', String(val))

    if (!val) {
        filterDate.value = ''
        return
    }

    // Expecting DatePicker display in dd/mm/yyyy
    const parts = String(val).split('/')
    console.log('Split by /:', parts)

    if (parts.length === 3) {
        const dd = parts[0].padStart(2, '0')
        const mm = parts[1].padStart(2, '0')
        const yyyy = parts[2]
        filterDate.value = `${dd}-${mm}-${yyyy}`
        console.log('Result (from /):', filterDate.value)
    } else {
        console.log('No / found, trying Date object...')
        // fallback: try to parse native ISO
        try {
            const d = new Date(val)
            console.log('Date object:', d)
            console.log('Is valid:', !isNaN(d.getTime()))
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear()
                const mm = String(d.getMonth() + 1).padStart(2, '0')
                const dd = String(d.getDate()).padStart(2, '0')
                filterDate.value = `${dd}-${mm}-${yyyy}`
                console.log('Result (from Date):', filterDate.value)
            } else {
                filterDate.value = ''
            }
        } catch {
            filterDate.value = ''
        }
    }
}, { immediate: true })

// Columns visibility computed from active filters
const showColumnService = computed(() => filterServiceActive.value)
const showColumnHora = computed(() => filterHoraActive.value)
const showColumnItems = computed(() => filterTipoActive.value || filterItemTextActive.value || filterMinItems.value != null || filterMaxItems.value != null)
const showColumnEstado = computed(() => !!filterEstado.value)
const showColumnEspecialidad = computed(() => filterEspecialidadActive.value)
const showColumnMotivo = computed(() => filterMotivoActive.value)
const showColumnDescripcion = computed(() => filterMotivoActive.value || filterObservacionesActive.value)
const showColumnObservaciones = computed(() => filterObservacionesActive.value)
const showColumnIngeniero = computed(() => filterIngenieroActive.value)
const showColumnTipo = computed(() => filterTipoActive.value)

// Build a list of active filters to render under the main inputs
const activeFiltersList = computed(() => {
    const list = []
    if (filterServiceActive.value) list.push({ key: 'service', label: 'Servicio', type: 'input', bindings: { modelValue: filterService, 'onUpdate:modelValue': val => filterService.value = val, class: 'control filter-input', placeholder: 'Ej. Urgencias...' } })
    if (filterEspecialidadActive.value) list.push({ key: 'especialidad', label: 'Especialidad', type: 'input', bindings: { modelValue: filterEspecialidad, 'onUpdate:modelValue': val => filterEspecialidad.value = val, class: 'control filter-input', placeholder: 'Ej. Traumatología...' } })
    if (filterMotivoActive.value) list.push({ key: 'motivo', label: 'Motivo de entrada', type: 'select', bindings: { modelValue: filterMotivo, 'onUpdate:modelValue': val => filterMotivo.value = val, class: 'control filter-input' } })
    if (filterObservacionesActive.value) list.push({ key: 'obs', label: 'Observaciones', type: 'input', bindings: { modelValue: filterObservaciones, 'onUpdate:modelValue': val => filterObservaciones.value = val, class: 'control filter-input', placeholder: 'Buscar en observaciones' } })
    if (filterIngenieroActive.value) list.push({ key: 'ing', label: 'Ingeniero residente', type: 'input', bindings: { modelValue: filterIngeniero, 'onUpdate:modelValue': val => filterIngeniero.value = val, class: 'control filter-input', placeholder: 'Buscar nombre' } })
    if (filterTipoActive.value) list.push({ key: 'tipo', label: 'Tipo de artículo', type: 'select', bindings: { modelValue: filterTipo, 'onUpdate:modelValue': val => filterTipo.value = val, class: 'control filter-input' } })
    if (filterItemTextActive.value) list.push({ key: 'itemText', label: 'Buscar en artículos', type: 'input', bindings: { modelValue: filterItemText, 'onUpdate:modelValue': val => filterItemText.value = val, class: 'control filter-input', placeholder: 'Nombre, modelo, serie...' } })
    if (filterHoraActive.value) list.push({ key: 'hora', label: 'Hora inicio (rango)', type: 'hora-range', bindings: {} })
    if (filterMarcaActive.value) list.push({ key: 'marca', label: 'Marca de equipos', type: 'input', bindings: { modelValue: filterMarca, 'onUpdate:modelValue': val => filterMarca.value = val, class: 'control filter-input', placeholder: 'Ej. Philips...' } })
    if (filterModeloActive.value) list.push({ key: 'modelo', label: 'Modelo de equipos', type: 'input', bindings: { modelValue: filterModelo, 'onUpdate:modelValue': val => filterModelo.value = val, class: 'control filter-input', placeholder: 'Ej. MX40...' } })
    if (filterUbicacionActive.value) list.push({ key: 'ubicacion', label: 'Ubicación de equipos', type: 'input', bindings: { modelValue: filterUbicacion, 'onUpdate:modelValue': val => filterUbicacion.value = val, class: 'control filter-input', placeholder: 'Ej. UCIA...' } })
    if (filterClaveHRAEIActive.value) list.push({ key: 'claveHRAEI', label: 'Clave HRAEI', type: 'input', bindings: { modelValue: filterClaveHRAEI, 'onUpdate:modelValue': val => filterClaveHRAEI.value = val, class: 'control filter-input', placeholder: 'Ej. COMODATO...' } })
    return list
})

const hasActiveAdvancedFilters = computed(() => {
    return (
        filterServiceActive.value ||
        filterEspecialidadActive.value ||
        filterMotivoActive.value ||
        filterObservacionesActive.value ||
        filterIngenieroActive.value ||
        filterTipoActive.value ||
        filterItemTextActive.value ||
        filterHoraActive.value ||
        filterMarcaActive.value ||
        filterModeloActive.value ||
        filterUbicacionActive.value ||
        filterClaveHRAEIActive.value
    )
})

const hasActiveFilters = computed(() => {
    return (
        filterFolio.value ||
        filterSolicitante.value ||
        searchTerm.value ||
        filterDate.value ||
        filterTipo.value ||
        filterItemText.value ||
        filterEstado.value ||
        filterHoraInicioFrom.value ||
        filterHoraInicioTo.value ||
        filterServiceActive.value ||
        filterEspecialidadActive.value ||
        filterMotivoActive.value ||
        filterObservacionesActive.value ||
        filterIngenieroActive.value ||
        filterTipoActive.value ||
        filterItemTextActive.value ||
        filterHoraActive.value ||
        filterMarcaActive.value ||
        filterModeloActive.value ||
        filterUbicacionActive.value ||
        filterClaveHRAEIActive.value ||
        filterMarca.value ||
        filterModelo.value ||
        filterUbicacion.value ||
        filterClaveHRAEI.value
    )
})

const filteredOrders = computed(() => {
    return allOrders.value.filter(order => {
        // Filtrado flexible de folio - permite buscar E-912 para encontrar E-000912
        const matchFolio = !filterFolio.value || folioMatches(order.folio, filterFolio.value)

        const matchSolicitante = !filterSolicitante.value || order.nombreSolicitante?.toLowerCase().includes(filterSolicitante.value.toLowerCase())

        // Búsqueda general también con normalización de folios
        const matchSearch = !searchTerm.value || (
            folioMatches(order.folio, searchTerm.value) ||
            order.nombreSolicitante?.toLowerCase().includes(searchTerm.value.toLowerCase())
        )

        const matchDate = !filterDate.value || order.fecha === filterDate.value
        if (filterDate.value && order.folio) {
            console.log(`Comparando fecha para ${order.folio}: BD="${order.fecha}" vs Filtro="${filterDate.value}" => ${matchDate ? 'MATCH' : 'NO MATCH'}`)
        }

        const matchService = !filterServiceActive.value || !filterService.value || order.servicio?.toLowerCase().includes(filterService.value.toLowerCase())
        const matchEspecialidad = !filterEspecialidadActive.value || !filterEspecialidad.value || order.especialidad?.toLowerCase().includes(filterEspecialidad.value.toLowerCase())
        const matchMotivo = !filterMotivoActive.value || !filterMotivo.value || ((order.motivoEntrada || '').toLowerCase() === filterMotivo.value.toLowerCase())
        const matchObservaciones = !filterObservacionesActive.value || !filterObservaciones.value || ((order.observaciones || '').toLowerCase().includes(filterObservaciones.value.toLowerCase()))
        const matchIngeniero = !filterIngenieroActive.value || !filterIngeniero.value || ((order.nombreIngeniero || '').toLowerCase().includes(filterIngeniero.value.toLowerCase()))
        const matchEstado = !filterEstado.value || (order.estado || '').toLowerCase() === filterEstado.value.toLowerCase()
        const matchHoraFrom = !filterHoraActive.value || !filterHoraInicioFrom.value || (order.horaInicio && order.horaInicio >= filterHoraInicioFrom.value)
        const matchHoraTo = !filterHoraActive.value || !filterHoraInicioTo.value || (order.horaInicio && order.horaInicio <= filterHoraInicioTo.value)

        const matchTipo = !filterTipoActive.value || !filterTipo.value || (order.equiposEntrada || []).some(e => e.tipo === filterTipo.value)
        const matchItemText = !filterItemTextActive.value || !filterItemText.value || (order.equiposEntrada || []).some(e => {
            const search = filterItemText.value.toLowerCase()
            return String(e.descripcion || e.nombre || '').toLowerCase().includes(search)
                || String(e.modelo || '').toLowerCase().includes(search)
                || String(e.serie || e.lote || '').toLowerCase().includes(search)
                || String(e.marca || '').toLowerCase().includes(search)
        })
        const matchMarca = !filterMarcaActive.value || !filterMarca.value || (order.equiposEntrada || []).some(e => {
            const search = filterMarca.value.toLowerCase()
            return String(e.marca || '').toLowerCase().includes(search)
        })
        const matchModelo = !filterModeloActive.value || !filterModelo.value || (order.equiposEntrada || []).some(e => {
            const search = filterModelo.value.toLowerCase()
            return String(e.modelo || '').toLowerCase().includes(search)
        })
        const matchUbicacion = !filterUbicacionActive.value || !filterUbicacion.value || (order.equiposEntrada || []).some(e => {
            const search = filterUbicacion.value.toLowerCase()
            return String(e.ubicacion || '').toLowerCase().includes(search)
        })
        const matchClaveHRAEI = !filterClaveHRAEIActive.value || !filterClaveHRAEI.value || (order.equiposEntrada || []).some(e => {
            const search = filterClaveHRAEI.value.toLowerCase()
            return String(e.claveHRAEI || '').toLowerCase().includes(search)
        })
        const itemCount = (order.equiposEntrada || []).length || 0
        const matchMin = filterMinItems.value == null || filterMinItems.value === '' || itemCount >= Number(filterMinItems.value)
        const matchMax = filterMaxItems.value == null || filterMaxItems.value === '' || itemCount <= Number(filterMaxItems.value)
        return matchFolio && matchSolicitante && matchSearch && matchDate && matchService && matchEspecialidad && matchMotivo && matchObservaciones && matchIngeniero && matchTipo && matchItemText && matchEstado && matchHoraFrom && matchHoraTo && matchMin && matchMax && matchMarca && matchModelo && matchUbicacion && matchClaveHRAEI
    })
})

function formatDate(dateStr) {
    if (!dateStr) return '-'
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-MX')
    } catch {
        return dateStr
    }
}

function goToCreateOrder() {
    router.push({ name: 'op-entrada', query: { from: 'order-management' } })
}

function goToDashboard() {
    router.push({ name: 'dashboard' })
}

function closeFiltersDropdown() {
    showMoreFilters.value = false
}

/**
 * Abre el modal de edición para una orden
 * Carga automáticamente el historial de versiones
 * y posiciona en la versión más reciente
 */
async function openEditModal(order) {
    editingOrder.value = JSON.parse(JSON.stringify(order))

    // Ajustar offsets específicos para edición desde la fila de acciones
    // Estos valores separan el botón externo fuera de la modal
    editExternalOffsetTop.value = 80
    editExternalOffsetRight.value = 220

    showEditModal.value = true
    showLegend.value = false

    // Preferir folio como identificador; fallback a id por compatibilidad
    selectedOrderId.value = order?.folio ?? order?.id ?? null

    // Reset de estado para evitar arrastre de tabs anteriores
    activeTab.value = 'main'
    branchTabs.value = []
    diffByVersion.value = {}
    snapshotByVersion.value = {}

    // Cargar historial/versions y posicionar en la versión más reciente
    try {
        await loadOrderHistoryAndVersions(selectedOrderId.value)
        // Posicionar en la versión más reciente si existe
        if (Array.isArray(branchTabs.value) && branchTabs.value.length) {
            const newest = Math.max(...branchTabs.value)
            activeTab.value = Number(newest)
            console.log('[ORDER_MANAGEMENT] activeTab establecido a:', activeTab.value, 'tipo:', typeof activeTab.value)
            console.log('[ORDER_MANAGEMENT] maxVersionNumber es:', maxVersionNumber.value)
        }
    } catch (e) {
        console.error('Error al cargar historial de versiones:', e)
        // si falla, quedarse en main
    }
}

// Nota: se removió el computed invertido (read-only al revés) para evitar confusión.

/**
 * Navega a la versión anterior (número menor)
 */
function goToPreviousVersion() {
    if (currentVersionIndex.value <= 0) return
    const prevVersion = branchTabs.value[currentVersionIndex.value + 1]
    if (prevVersion !== undefined) {
        activeTab.value = prevVersion
    }
}

/**
 * Navega a la versión siguiente (número mayor)
 */
function goToNextVersion() {
    if (currentVersionIndex.value >= branchTabs.value.length - 1) return
    const nextVersion = branchTabs.value[currentVersionIndex.value - 1]
    if (nextVersion !== undefined) {
        activeTab.value = nextVersion
    }
}

/**
 * Navega directamente a la versión más reciente
 */
function goToLatestVersion() {
    if (newestVersion.value !== null) {
        activeTab.value = newestVersion.value
    }
}

/**
 * Navega directamente a la versión más antigua
 */
function goToOldestVersion() {
    if (oldestVersion.value !== null) {
        activeTab.value = oldestVersion.value
    }
}

function closeEditModal() {
    showEditModal.value = false
    editingOrder.value = null
    selectedOrderId.value = null
    activeTab.value = 'main'
    branchTabs.value = []
    diffByVersion.value = {}
    // Reset offsets a valores por defecto
    editExternalOffsetTop.value = 0
    editExternalOffsetRight.value = 0
}

// Maneja el intento de cierre del modal (botón X o overlay)
async function handleModalClose() {
    const result = await Swal.fire({
        title: '¿Cerrar edición?',
        text: '¿Estás seguro de que quieres cerrar la edición sin guardar los cambios?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: 'rgba(255, 255, 255, 0.08)',
        ...darkThemeConfig,
    })

    if (result.isConfirmed) {
        closeEditModal()
    }
}

function onOrderUpdated(updated) {
    // Centralizar persistencia aquí: PUT al backend y luego refrescar desde fuente real.
    if (!updated) {
        closeEditModal()
        return
    }
    persistEditedOrder(updated)
}

function safeShort(v) {
    try {
        const s = typeof v === 'string' ? v : JSON.stringify(v)
        return s.length > 240 ? s.slice(0, 240) + '…' : s
    } catch {
        return String(v)
    }
}

function formatTimestamp(v) {
    if (!v) return ''
    try {
        const d = new Date(v)
        if (isNaN(d.getTime())) return String(v)
        return d.toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    } catch {
        return String(v)
    }
}

function actionLabel(a) {
    const s = String(a || '')
    const map = {
        add_item: 'Item agregado',
        delete_item: 'Item eliminado',
        edit_item: 'Item editado',
        edit_field: 'Campo editado',
        clear_field: 'Campo vaciado',
        fill_field: 'Campo rellenado'
    }
    return map[s] || s || 'Cambio'
}

function fieldLabel(f) {
    const s = String(f || '')
    const map = {
        nombre_solicitante: 'Solicitante',
        servicio: 'Servicio',
        especialidad: 'Especialidad',
        fecha: 'Fecha',
        hora_inicio: 'Hora inicio',
        hora_termino: 'Hora término',
        motivo_entrada: 'Motivo de entrada',
        otro_motivo: 'Otro motivo',
        descripcion: 'Descripción',
        observaciones: 'Observaciones',
        nombre_ingeniero: 'Ingeniero',
        observaciones_img_path: 'Imagen de observaciones'
    }
    return map[s] || s || ''
}

function parseMaybeJson(v) {
    if (v === undefined || v === null) return null
    if (typeof v !== 'string') return v
    const s = v.trim()
    if (!s) return ''
    try {
        return JSON.parse(s)
    } catch {
        return v
    }
}

function itemSummary(obj) {
    if (!obj || typeof obj !== 'object') return ''
    const get = (k) => {
        const raw = obj[k]
        const val = (raw === undefined || raw === null) ? '' : String(raw)
        return val.trim() ? val.trim() : 'N/A'
    }
    const parts = []
    if ('tipo' in obj) parts.push(`tipo: ${get('tipo')}`)
    if ('descripcion' in obj) parts.push(`desc: ${get('descripcion')}`)
    if ('marca' in obj) parts.push(`marca: ${get('marca')}`)
    if ('modelo' in obj) parts.push(`modelo: ${get('modelo')}`)
    if ('serie' in obj) parts.push(`serie: ${get('serie')}`)
    if ('lote' in obj) parts.push(`lote: ${get('lote')}`)
    if ('referencia' in obj) parts.push(`ref: ${get('referencia')}`)
    if ('ubicacion' in obj) parts.push(`ubicación: ${get('ubicacion')}`)
    if ('clave_hraei' in obj || 'claveHRAEI' in obj) parts.push(`clave: ${get('clave_hraei') || get('claveHRAEI')}`)

    // Detectar item vacío (solo N/A)
    const meaningful = parts.some(p => !p.endsWith(': N/A'))
    if (!meaningful) return 'Item vacío (todos los campos N/A)'
    return parts.join(' | ')
}

function formatDiffValue(v, row) {
    const parsed = parseMaybeJson(v)
    if (parsed === null) return ''
    if (typeof parsed === 'string') {
        const s = parsed.trim()
        return s ? s : 'N/A'
    }
    if (typeof parsed === 'object') {
        // Para items, mostrar resumen en vez de JSON
        if (row && (row.action === 'add_item' || row.action === 'edit_item' || row.action === 'delete_item')) {
            return itemSummary(parsed)
        }
        return safeShort(parsed)
    }
    return String(parsed)
}

function diffClass(row) {
    const a = String(row.action || '')
    if (a === 'delete_item' || a === 'clear_field') return 'is-red'
    if (a === 'fill_field' || a === 'add_item') return 'is-green'
    if (a === 'edit_item' || a === 'edit_field') return 'is-yellow'
    return 'is-yellow'
}

async function loadOrderHistoryAndVersions(folio) {
    const f = folio ? String(folio) : ''
    if (!f) return
    try {
        const [histRes, versRes] = await Promise.all([
            fetch(`/api/ops/entrada/${encodeURIComponent(f)}/history`, { cache: 'no-store' }),
            fetch(`/api/ops/entrada/${encodeURIComponent(f)}/versions?limit=6`, { cache: 'no-store' })
        ])

        if (versRes.ok) {
            const vers = await versRes.json()
            const items = Array.isArray(vers.items) ? vers.items : []
            // branches: exclude latest? we show all versions >=2 as tabs.
            const versions = items
                .map(r => Number(r.version))
                .filter(v => !isNaN(v) && v >= 1)
                .sort((a, b) => b - a)
            branchTabs.value = versions

            // Establecer explícitamente la versión máxima
            if (versions.length > 0) {
                maxVersionNumber.value = Math.max(...versions)
                console.log('[ORDER_MANAGEMENT] Versiones cargadas:', versions)
                console.log('[ORDER_MANAGEMENT] Versión máxima:', maxVersionNumber.value)
            } else {
                maxVersionNumber.value = null
            }

            // snapshots por versión (para render tipo OpEntrada)
            const snapMap = {}
            for (const r of items) {
                const v = String(r.version)
                if (!r || r.snapshot_json == null) continue
                try {
                    snapMap[v] = typeof r.snapshot_json === 'string' ? JSON.parse(r.snapshot_json) : r.snapshot_json
                } catch {
                    // ignore parse error
                }
            }
            snapshotByVersion.value = snapMap
        } else {
            branchTabs.value = []
            snapshotByVersion.value = {}
        }

        if (histRes.ok) {
            const hist = await histRes.json()
            const rows = Array.isArray(hist.items) ? hist.items : []
            const map = {}
            for (const r of rows) {
                const v = String(r.version)
                if (!map[v]) map[v] = []
                map[v].push(r)
            }
            diffByVersion.value = map
        } else {
            diffByVersion.value = {}
        }
    } catch (e) {
        console.warn('No se pudo cargar history/versions:', e)
        branchTabs.value = []
        diffByVersion.value = {}
        snapshotByVersion.value = {}
    }
}

function buildHighlights(rows) {
    const out = { fields: {}, items: {} }
    const fieldMap = {
        nombre_solicitante: 'nombreSolicitante',
        servicio: 'servicio',
        especialidad: 'especialidad',
        fecha: 'fecha',
        hora_inicio: 'horaInicio',
        hora_termino: 'horaTermino',
        motivo_entrada: 'motivoEntrada',
        otro_motivo: 'otroMotivo',
        descripcion: 'descripcion',
        observaciones: 'observaciones',
        nombre_ingeniero: 'nombreIngeniero',
        observaciones_img_path: 'observacionesImg'
    }

    const priority = { red: 3, green: 2, yellow: 1 }
    const setField = (k, color) => {
        if (!k) return
        const prev = out.fields[k]
        if (!prev || priority[color] > priority[prev]) out.fields[k] = color
    }
    const setItem = (line, color) => {
        if (line == null) return
        const key = String(line)
        const prev = out.items[key]
        if (!prev || priority[color] > priority[prev]) out.items[key] = color
    }

    for (const r of rows || []) {
        const a = String(r && r.action || '')
        if (a === 'clear_field') setField(fieldMap[String(r.field_name)] || String(r.field_name), 'red')
        else if (a === 'fill_field') setField(fieldMap[String(r.field_name)] || String(r.field_name), 'green')
        else if (a === 'edit_field') setField(fieldMap[String(r.field_name)] || String(r.field_name), 'yellow')
        else if (a === 'add_item') setItem(r.line, 'green')
        else if (a === 'delete_item') setItem(r.line, 'red')
        else if (a === 'edit_item') setItem(r.line, 'yellow')
    }
    return out
}

async function persistEditedOrder(payload) {
    try {
        const folio = payload.folio || payload.id
        if (!folio) {
            throw new Error('Folio inválido')
        }
        // Merge with server-side current order to avoid overwriting unchanged fields with empty values
        let mergedPayload = Object.assign({}, payload)
        try {
            const curRes = await fetch(`/api/ops/entrada/${encodeURIComponent(String(folio))}`, { cache: 'no-store' })
            if (curRes && curRes.ok) {
                const curBody = await curRes.json()
                const serverOrden = curBody.orden || curBody || {}
                // Only fill missing/empty string fields from server copy
                const fillIfEmpty = (keyFront, keyServer) => {
                    const v = mergedPayload[keyFront]
                    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
                        mergedPayload[keyFront] = serverOrden[keyServer] || serverOrden[keyFront] || mergedPayload[keyFront]
                    }
                }
                fillIfEmpty('nombreSolicitante', 'nombre_solicitante')
                fillIfEmpty('servicio', 'servicio')
                fillIfEmpty('especialidad', 'especialidad')
                fillIfEmpty('fecha', 'fecha')
                fillIfEmpty('fechaISO', 'fecha')
                fillIfEmpty('horaInicio', 'hora_inicio')
                fillIfEmpty('horaTermino', 'hora_termino')
                fillIfEmpty('motivoEntrada', 'motivo_entrada')
                fillIfEmpty('otroMotivo', 'otro_motivo')
                fillIfEmpty('descripcion', 'descripcion')
                fillIfEmpty('observaciones', 'observaciones')
                fillIfEmpty('observacionesImg', 'observaciones_img_path')
                fillIfEmpty('nombreIngeniero', 'nombre_ingeniero')
                // Preserve signatures from server if payload didn't include them (avoid accidental erase)
                if (!Array.isArray(mergedPayload.signatures) || !mergedPayload.signatures.length) {
                    mergedPayload.signatures = (serverOrden && serverOrden.signatures) ? serverOrden.signatures : mergedPayload.signatures
                } else if (Array.isArray(serverOrden && serverOrden.signatures)) {
                    // Merge per-key to avoid accidental erasure of names/fixed flags when payload has partial data
                    const serverMap = {}
                        ; (serverOrden.signatures || []).forEach(s => { if (s && s.key) serverMap[s.key] = s })
                    mergedPayload.signatures = mergedPayload.signatures.map(s => {
                        const key = s && (s.key || (s.role || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, ''))
                        const base = (key && serverMap[key]) ? serverMap[key] : (s || {})
                        return Object.assign({}, base, {
                            key: key || (s && s.key) || undefined,
                            role: (s && s.role) || base.role || '',
                            nameKnown: (s && (s.nameKnown === true || s.nameKnown === 'true' || s.nameKnown === '1')) ? true : !!base.nameKnown,
                            name: (s && s.name && String(s.name).trim() !== '') ? String(s.name).trim() : (base && base.name) || '',
                            fixed: (s && typeof s.fixed === 'boolean') ? s.fixed : !!base.fixed
                        })
                    })
                }
                // For equiposEntrada, prefer payload if provided, otherwise reconstruct from server items
                if (!Array.isArray(mergedPayload.equiposEntrada) || !mergedPayload.equiposEntrada.length) {
                    try {
                        const items = Array.isArray(curBody.items) ? curBody.items : []
                        // map DB items to frontend equiposEntrada shape
                        mergedPayload.equiposEntrada = items.map(it => ({
                            line: it.line,
                            tipo: it.tipo,
                            cantidad: it.cantidad || 1,
                            descripcion: it.descripcion || '',
                            marca: it.marca || '',
                            modelo: it.modelo || '',
                            serie: it.serie || '',
                            lote: it.lote || '',
                            referencia: it.referencia || '',
                            ubicacion: it.ubicacion || '',
                            claveHRAEI: it.clave_hraei || it.claveHRAEI || ''
                        }))
                    } catch (e) {
                        // ignore
                    }
                }
            }
        } catch (e) {
            // ignore merge failure and proceed with original payload
            console.warn('persistEditedOrder: no se pudo obtener orden actual para merge', e && e.message)
        }

        const prevBranchTabs = Array.isArray(branchTabs.value) ? [...branchTabs.value] : []
        console.log('[OrderManagement] Sending PUT /entrada payload.signatures =', mergedPayload.signatures)
        const res = await fetch(`/api/ops/entrada/${encodeURIComponent(String(folio))}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedPayload)
        })
        if (!res.ok) {
            const err = await (async () => { try { return await res.json() } catch { return null } })()
            throw new Error(err?.msg || `No se pudo actualizar (${res.status})`)
        }
        // Refrescar lista desde la fuente actual (sin caché)
        await reloadOrdersFromServer()
        // Recargar diffs/versions para que aparezcan inmediatamente las tabs
        await loadOrderHistoryAndVersions(String(folio))

        // Abrir (activar) la pestaña de la versión nueva si existe
        const nextTabs = Array.isArray(branchTabs.value) ? branchTabs.value : []
        const newest = nextTabs.length ? Math.max(...nextTabs) : null // Obtener la versión más alta
        // Forzar que el editor principal recargue (siempre edita la versión más reciente del servidor)
        mainEditorKey.value += 1
        if (newest != null && (!prevBranchTabs.includes(newest) || activeTab.value === 'main')) {
            activeTab.value = newest
        }
        showSuccess('Actualizado', 'La orden se actualizó correctamente.')

        // Intentar regenerar y persistir el PDF con los datos actualizados
        try {
            const genRes = await fetch(`/api/ops/entrada/${encodeURIComponent(folio)}/pdfs/generate-force`)
            if (genRes && genRes.ok) {
                // refrescar lista de documentos si el modal está abierto para esta orden
                if (docTitle.value === String(folio) || showDocModal.value) {
                    await fetchDocVersionsFor(String(folio))
                }
            } else {
                // ignore failure, but log
                const body = await genRes.json().catch(() => ({}))
                console.warn('generate-force returned non-ok', body)
            }
        } catch (e) {
            console.warn('Error calling generate-force after update:', e && e.message)
        }
    } catch (e) {
        console.error('Error guardando orden (centralizado):', e)
        Swal.fire({
            title: 'Error',
            text: e.message || 'No se pudo actualizar la orden',
            icon: 'error',
            ...darkThemeConfig
        })
    }
}

function toggleLegend() {
    showLegend.value = !showLegend.value
}

async function reloadOrdersFromServer() {
    loading.value = true
    try {
        const res = await fetch('/api/ops/entrada/list', { cache: 'no-store' })
        if (!res.ok) {
            allOrders.value = []
            return
        }
        const body = await res.json()
        const items = Array.isArray(body.items) ? body.items : []
        allOrders.value = items.map((wrapper) => {
            const orden = wrapper.orden || {}
            const orderItems = Array.isArray(wrapper.items) ? wrapper.items : []
            const equiposEntrada = orderItems.map(item => ({
                id: `${item.orden_folio}-${item.line}`,
                line: item.line,
                tipo: item.tipo || 'N/A',
                cantidad: item.cantidad || 1,
                descripcion: item.descripcion || 'N/A',
                marca: item.marca || 'N/A',
                modelo: item.modelo || 'N/A',
                serie: item.serie || 'N/A',
                lote: item.lote || 'N/A',
                referencia: item.referencia || 'N/A',
                ubicacion: item.ubicacion || 'N/A',
                claveHRAEI: item.clave_hraei || 'N/A'
            }))
            return {
                id: orden.folio || orden.id,
                folio: orden.folio || 'N/A',
                nombreSolicitante: orden.nombre_solicitante || 'N/A',
                servicio: orden.servicio || 'N/A',
                especialidad: orden.especialidad || 'N/A',
                fecha: orden.fecha || 'N/A',
                horaInicio: orden.hora_inicio || 'N/A',
                horaTermino: orden.hora_termino || 'N/A',
                motivoEntrada: orden.motivo_entrada || 'N/A',
                descripcion: orden.descripcion || 'N/A',
                observaciones: orden.observaciones || 'N/A',
                observacionesImg: orden.observaciones_img_path || null,
                nombreIngeniero: orden.nombre_ingeniero || 'N/A',
                equiposEntrada,
                estado: 'completado'
            }
        })
    } catch (e) {
        console.warn('Error recargando órdenes:', e)
        allOrders.value = []
    } finally {
        loading.value = false
    }
}

function updateAndDownloadExcel() {
    const index = allOrders.value.findIndex(o => o.id === editingOrder.value.id)
    if (index !== -1) {
        allOrders.value[index] = editingOrder.value
        // Generar y descargar el Excel corregido
        downloadExcelWithData(editingOrder.value)
        closeEditModal()
        // Try to persist the updated order back to backend or localStorage
        tryPersistUpdatedOrder(editingOrder.value)
    }
}

function downloadExcel(order) {
    console.log('Descargar Excel:', order.id)
    downloadExcelWithData(order)
}

function downloadExcelWithData(order) {
    console.log('Generando Excel para orden:', order.folio)
    // Aquí va la lógica para generar y descargar el Excel
    // Usar librería como exceljs o xlsxpopulate
    // Por ahora: simulación
    const fileName = `Orden_${order.folio}_${new Date().toISOString().slice(0, 10)}.xlsx`
    console.log('Excel descargado:', fileName)
}

async function deleteOrder(orderId) {
    const result = await confirmDelete('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')

    if (result.isConfirmed) {
        allOrders.value = allOrders.value.filter(o => o.id !== orderId)
        console.log('Orden eliminada:', orderId)
        try {
            const raw = localStorage.getItem('orders_list')
            if (raw) {
                const arr = JSON.parse(raw)
                const updated = arr.filter(o => String(o.id) !== String(orderId))
                localStorage.setItem('orders_list', JSON.stringify(updated))
            }
        } catch (e) { }

        showSuccess('Eliminado', 'La orden ha sido eliminada correctamente.')
    }
}

async function handleDeleteMultipleWithModal(orderIds) {
    const count = orderIds.length
    const msg = `¿Está seguro de que deseas eliminar ${count} orden${count !== 1 ? 'es' : ''}? Esta acción no se puede deshacer.`

    const result = await confirmDelete(msg, count)

    if (result.isConfirmed) {
        await deleteMultipleOrders(orderIds)

        const successMsg = `${count} orden${count !== 1 ? 'es' : ''} ha${count !== 1 ? 'n' : ''} sido eliminada${count !== 1 ? 's' : ''} correctamente.`
        showSuccess('Eliminado', successMsg)
    }
}

function deleteMultipleOrders(orderIds) {
    const count = orderIds.length
    // Eliminar del estado local
    allOrders.value = allOrders.value.filter(o => !orderIds.includes(o.id))
    console.log(`${count} orden${count !== 1 ? 'es' : ''} eliminada${count !== 1 ? 's' : ''}:`, orderIds)

    // Actualizar localStorage
    try {
        const raw = localStorage.getItem('orders_list')
        if (raw) {
            const arr = JSON.parse(raw)
            const updated = arr.filter(o => !orderIds.includes(String(o.id)))
            localStorage.setItem('orders_list', JSON.stringify(updated))
        }
    } catch (e) {
        console.warn('Error updating localStorage after multi-delete:', e)
    }
}

async function tryPersistUpdatedOrder(order) {
    try {
        const res = await fetch('/api/ops/entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        })
        if (res.ok) {
            console.log('Order updated and saved to server')
            return
        }
    } catch (err) {
        // ignore - fallback to local
    }
    // Save to localStorage array
    try {
        const raw = localStorage.getItem('orders_list')
        const arr = raw ? JSON.parse(raw) : []
        // ensure id
        if (!order.id) order.id = Date.now()
        const idx = arr.findIndex(o => o.id === order.id)
        if (idx === -1) arr.push(order)
        else arr[idx] = order
        localStorage.setItem('orders_list', JSON.stringify(arr))
    } catch (e) {
        console.warn('Failed to persist order locally', e)
    }
}

function onEditObservacionesImgChange(event) {
    const file = event.target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            editingOrder.value.observacionesImg = {
                name: file.name,
                dataUrl: e.target?.result
            }
        }
        reader.readAsDataURL(file)
    }
}

function removeEditObservacionesImg() {
    editingOrder.value.observacionesImg = null
}

function clearFilters() {
    // Reset basic filters
    searchTerm.value = ''
    filterDate.value = ''
    filterFolio.value = ''
    filterSolicitante.value = ''
    // Reset more filters
    filterService.value = ''
    filterServiceActive.value = false
    filterEspecialidad.value = ''
    filterEspecialidadActive.value = false
    filterMotivo.value = ''
    filterMotivoActive.value = false
    filterObservaciones.value = ''
    filterObservacionesActive.value = false
    filterIngeniero.value = ''
    filterIngenieroActive.value = false
    filterTipo.value = ''
    filterTipoActive.value = false
    filterItemText.value = ''
    filterItemTextActive.value = false
    filterMinItems.value = null
    filterMaxItems.value = null
    filterEstado.value = ''
    filterHoraInicioFrom.value = ''
    filterHoraInicioTo.value = ''
    filterHoraActive.value = false
    filterMarca.value = ''
    filterMarcaActive.value = false
    filterModelo.value = ''
    filterModeloActive.value = false
    filterUbicacion.value = ''
    filterUbicacionActive.value = false
    filterClaveHRAEI.value = ''
    filterClaveHRAEIActive.value = false
    // do not automatically close the panel when clearing — allow user to adjust further
}

function clearAllFilters() {
    clearFilters()
    showMoreFilters.value = false
}

function removeActiveFilter(key) {
    if (key === 'service') filterServiceActive.value = false
    else if (key === 'especialidad') filterEspecialidadActive.value = false
    else if (key === 'motivo') filterMotivoActive.value = false
    else if (key === 'obs') filterObservacionesActive.value = false
    else if (key === 'ing') filterIngenieroActive.value = false
    else if (key === 'tipo') filterTipoActive.value = false
    else if (key === 'itemText') filterItemTextActive.value = false
    else if (key === 'hora') filterHoraActive.value = false
    else if (key === 'marca') filterMarcaActive.value = false
    else if (key === 'modelo') filterModeloActive.value = false
    else if (key === 'ubicacion') filterUbicacionActive.value = false
    else if (key === 'claveHRAEI') filterClaveHRAEIActive.value = false
}

function applyFilters() {
    // Currently filters are reactive; applying just closes the panel to show results
    showMoreFilters.value = false
}

function addEditItem() {
    if (!editingOrder.value) return
    const copy = JSON.parse(JSON.stringify(newEditItem.value))
    if (!editingOrder.value.equiposEntrada) editingOrder.value.equiposEntrada = []
    editingOrder.value.equiposEntrada.push(copy)
    // reset
    newEditItem.value = { tipo: '', cantidad: 1, descripcion: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', claveHRAEI: '', unidades: [] }
}

async function removeEditItem(idx) {
    if (!editingOrder.value) return
    const result = await confirmDelete('Eliminar artículo', '¿Eliminar este artículo de la orden?')
    if (result.isConfirmed) {
        editingOrder.value.equiposEntrada.splice(idx, 1)
    }
}

function toggleEditItem(idx) {
    editingItemIndex.value = editingItemIndex.value === idx ? -1 : idx
}

// Simular carga de órdenes desde API
function loadOrders() {
    // Wrapper histórico: mantener API actual pero delegar a recarga real (sin caché)
    reloadOrdersFromServer()
}

onMounted(() => {
    loadOrders()

    // Cerrar dropdown cuando se hace click fuera
    function handleDocumentClick(event) {
        if (filterDropdownRef.value && !filterDropdownRef.value.contains(event.target)) {
            showMoreFilters.value = false
        }

        if (legendWrapRef.value && !legendWrapRef.value.contains(event.target)) {
            showLegend.value = false
        }
    }

    document.addEventListener('click', handleDocumentClick)

    // Limpiar listener cuando se desmonta el componente
    return () => {
        document.removeEventListener('click', handleDocumentClick)
    }
})
</script>

<style scoped>
.order-management-container {
    width: 100%;
}

.om-edit-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.om-edit-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(15, 23, 42, 0.28);
}

.om-tab {
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(241, 245, 249, 0.92);
    font-weight: 700;
    cursor: pointer;
}

.om-tab.active {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.35);
}

.om-tab.newest {
    background: rgba(217, 119, 6, 0.22);
    border-color: rgba(217, 119, 6, 0.5);
    color: rgba(252, 211, 77, 0.95);
}

.om-tab.newest.active {
    background: rgba(217, 119, 6, 0.28);
    border-color: rgba(217, 119, 6, 0.6);
    color: rgba(253, 224, 71, 1);
}

.om-tab-help {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(241, 245, 249, 0.95);
    font-weight: 900;
    cursor: pointer;
    transition: all 0.2s ease;
}

.om-tab-help:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
}



.om-help-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.om-legend-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 280px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(15, 23, 42, 0.92);
    color: rgba(241, 245, 249, 0.95);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
    z-index: 20;
}

.om-legend-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    font-size: 0.92rem;
}

.om-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    display: inline-block;
    border: 1px solid rgba(255, 255, 255, 0.22);
}

.om-legend-dot.is-green {
    background: rgba(34, 197, 94, 0.75);
}

.om-legend-dot.is-yellow {
    background: rgba(245, 158, 11, 0.75);
}

.om-legend-dot.is-red {
    background: rgba(239, 68, 68, 0.75);
}

.om-main-panel {
    flex: 1;
    overflow: auto;
}

.om-diff-panel {
    padding: 12px;
    overflow: auto;
    flex: 1;
}

.om-diff-hint {
    font-weight: 700;
    color: rgba(241, 245, 249, 0.88);
    margin-bottom: 10px;
}

.om-diff-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.om-diff-row {
    border-radius: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
}

.om-diff-row.is-yellow {
    border-color: rgba(245, 158, 11, 0.35);
    background: rgba(245, 158, 11, 0.10);
}

.om-diff-row.is-red {
    border-color: rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.10);
}

.om-diff-row.is-green {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.10);
}

.om-diff-title {
    color: rgba(248, 250, 252, 0.95);
    margin-bottom: 4px;
}

.om-diff-meta {
    color: rgba(148, 163, 184, 0.9);
    font-size: 0.85rem;
    margin-bottom: 6px;
}

.om-diff-body {
    color: rgba(241, 245, 249, 0.9);
    font-size: 0.92rem;
    line-height: 1.35;
}

.om-diff-empty {
    color: rgba(148, 163, 184, 0.95);
    padding: 10px;
}

.order-management-main {
    padding: 20px;
}

.title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.btn-create-order {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #2edd5a, #4cdc82);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.btn-create-order:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.3);
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

/* ===== INPUT DE FECHA CON GLASSMORPHISM ===== */
:deep(input[type="date"]) {
    position: relative !important;
    background: rgba(15, 20, 40, 0.65) !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 14px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    color-scheme: dark !important;
    padding: 12px 18px !important;
}

:deep(input[type="date"]:hover) {
    border-color: #06b6d4 !important;
    box-shadow:
        0 6px 8px -1px rgba(6, 182, 212, 0.1),
        0 3px 6px -1px rgba(6, 182, 212, 0.06),
        0 0 0 1px rgba(6, 182, 212, 0.3) !important;
    transform: translateY(-1px) !important;
}

:deep(input[type="date"]:focus) {
    border-color: #22d3ee !important;
    box-shadow:
        0 0 0 4px rgba(34, 211, 238, 0.25),
        0 8px 10px -2px rgba(34, 211, 238, 0.1) !important;
    background: linear-gradient(135deg, #0c1220 0%, #1e293b 100%) !important;
    outline: none !important;
    transform: translateY(-2px) !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2300ff6a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 18px !important;
    cursor: pointer !important;
    opacity: 0.9 !important;
    transition: all 0.3s ease !important;
    filter: drop-shadow(0 2px 4px rgba(0, 255, 106, 0.3)) !important;
    margin-right: 4px !important;
    width: 24px !important;
    height: 24px !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator:hover) {
    opacity: 1 !important;
    transform: scale(1.15) rotate(5deg) !important;
    filter: drop-shadow(0 4px 8px rgba(0, 255, 106, 0.5)) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit) {
    color: #f1f5f9 !important;
    font-weight: 600 !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-fields-wrapper) {
    background: rgba(6, 182, 212, 0.08) !important;
    padding: 4px 8px !important;
    border-radius: 8px !important;
    margin-right: 8px !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-text) {
    color: #64748b !important;
    padding: 0 4px !important;
    font-weight: 500 !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-month-field),
:deep(input[type="date"]::-webkit-datetime-edit-day-field),
:deep(input[type="date"]::-webkit-datetime-edit-year-field) {
    color: #e2e8f0 !important;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%) !important;
    border-radius: 6px !important;
    padding: 3px 6px !important;
    margin: 0 2px !important;
    font-weight: 700 !important;
    transition: all 0.2s ease !important;
    border: 1px solid rgba(6, 182, 212, 0.2) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-month-field:focus),
:deep(input[type="date"]::-webkit-datetime-edit-day-field:focus),
:deep(input[type="date"]::-webkit-datetime-edit-year-field:focus) {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%) !important;
    color: #22d3ee !important;
    border-color: #22d3ee !important;
    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2) !important;
    transform: scale(1.05) !important;
}

/* ===== SELECT Y INPUTS GENERALES ===== */
:deep(input[type="text"]),
:deep(input[type="number"]),
:deep(input[type="time"]),
:deep(textarea),
:deep(select.filter-input) {
    padding: 12px 18px !important;
    background: rgba(15, 20, 40, 0.65) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
}

:deep(input[type="text"]:hover),
:deep(input[type="number"]:hover),
:deep(input[type="time"]:hover),
:deep(textarea:hover),
:deep(select.filter-input:hover) {
    border-color: rgba(6, 182, 212, 0.4) !important;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15) !important;
}

:deep(input[type="text"]:focus),
:deep(input[type="number"]:focus),
:deep(input[type="time"]:focus),
:deep(textarea:focus),
:deep(select.filter-input:focus) {
    border-color: #22d3ee !important;
    box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.25) !important;
    background: linear-gradient(135deg, rgba(12, 18, 32, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%) !important;
    outline: none !important;
}

:deep(input::placeholder),
:deep(textarea::placeholder) {
    color: rgba(255, 255, 255, 0.4) !important;
}

.filters-section {
    display: grid;
    grid-template-columns: 0.75fr 0.75fr 1fr;
    gap: 16px;
    margin: 24px 0;
    padding: 16px;
    background: rgba(10, 15, 25, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
    overflow: visible;
    position: relative;
    z-index: 1;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: fit-content;
}

.filter-group-compact {
    gap: 8px;
    overflow: visible;
    position: relative;
    z-index: 10;
}

.filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    height: auto;
    min-height: 22px;
    line-height: 1.3;
    display: block;
    white-space: normal;
    word-wrap: break-word;
    padding-bottom: 4px;
}

.filter-input {
    height: 46px;
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

/* Only apply background to actual input elements, not CustomSelect */
.filter-group input.filter-input,
.active-filter-inline input.filter-input {
    background: rgba(255, 255, 255, 0.05);
}

/* Removed custom-select-button.filter-input styling to prevent visual bugs */

.filter-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.filter-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
}

/* Grupo de controles de filtros */
.filters-controls-group {
    grid-column: 2 / 4;
    display: flex;
    gap: 12px;
    align-items: flex-end;
}

.filters-controls-group .filter-group {
    flex: 1;
}

.filters-controls-group .dropdown-filter-group {
    position: relative;
}

/* Botón Limpiar filtros */
.btn-clear-filters {
    padding: 10px 16px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: rgba(255, 107, 107, 0.8);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.btn-clear-filters:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.4);
    color: rgba(255, 107, 107, 0.95);
    transform: translateY(-1px);
}

.table-wrapper {
    background: rgba(10, 15, 25, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    margin: 24px 0;
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
}

.orders-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.orders-table thead {
    background: rgba(10, 15, 25, 0.8);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.orders-table th {
    padding: 16px 12px;
    text-align: left;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
}

.orders-table tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
}

.orders-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.04);
}

.orders-table td {
    padding: 14px 12px;
    color: rgba(255, 255, 255, 0.8);
}

.cell-folio {
    font-weight: 600;
    color: #2edd5a;
}

.cell-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    padding: 6px 8px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.btn-edit:hover {
    border-color: #2edd5a;
    color: #2edd5a;
}

.btn-excel:hover {
    border-color: #4a90e2;
    color: #4a90e2;
}

.btn-delete:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
}

.badge-completado {
    background: rgba(46, 221, 90, 0.15);
    color: #2edd5a;
    border: 1px solid rgba(46, 221, 90, 0.4);
}

.badge-pendiente {
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.4);
}

.badge-en-proceso {
    background: rgba(74, 144, 226, 0.15);
    color: #4a90e2;
    border: 1px solid rgba(74, 144, 226, 0.4);
}

.empty-state {
    padding: 60px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    animation: fadeIn 0.3s ease;
}

.empty-icon {
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
}

.empty-state h3 {
    font-size: 1.5rem;
    margin: 16px 0 8px 0;
    color: rgba(255, 255, 255, 0.85);
}

.empty-state p {
    font-size: 0.95rem;
    margin-bottom: 24px;
}

.btn-create-empty {
    padding: 10px 24px;
    background: linear-gradient(135deg, #2edd5a, #4cdc82);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-create-empty:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.3);
}

.results-info {
    text-align: right;
    padding: 16px 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
}

.modal-content-full {
    background: rgba(13, 20, 35, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    max-width: 900px;
    width: 100%;
    margin: 20px auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px) saturate(120%);
    position: relative;
    color: #e6ebf5;
}

.modal-header {
    padding: 32px 32px 0 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-form-full {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.modal-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: white;
    margin: 0;
    padding: 24px 0;
    padding-right: 40px;
}

/* Estilos compatibles con OpEntrada en la modal */
.op-entrada-modal-full .section-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.op-entrada-modal-full .section-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(46, 221, 90, 0.15);
}

.op-entrada-modal-full .section-card.combined-card {
    display: flex;
    flex-direction: column;
}

.op-entrada-modal-full .section-head {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.op-entrada-modal-full .section-head h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
}

.op-entrada-modal-full .section-head .hint {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
}

.op-entrada-modal-full .section-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
}

.op-entrada-modal-full .section-grid.combined {
    grid-template-columns: repeat(6, 1fr);
}

.op-entrada-modal-full .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.op-entrada-modal-full .field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.op-entrada-modal-full .control,
.op-entrada-modal-full input[type="text"],
.op-entrada-modal-full input[type="date"],
.op-entrada-modal-full input[type="time"],
.op-entrada-modal-full textarea,
.op-entrada-modal-full select {
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-family: inherit;
}

.op-entrada-modal-full .control::placeholder,
.op-entrada-modal-full input::placeholder,
.op-entrada-modal-full textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.op-entrada-modal-full .control:focus,
.op-entrada-modal-full input:focus,
.op-entrada-modal-full textarea:focus,
.op-entrada-modal-full select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(46, 221, 90, 0.5);
    box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.op-entrada-modal-full .control:disabled,
.op-entrada-modal-full input:disabled,
.op-entrada-modal-full textarea:disabled,
.op-entrada-modal-full select:disabled {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
}

.op-entrada-modal-full textarea {
    resize: vertical;
}

/* Items list en modal */
.items-list-edit {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.item-row-edit {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 16px;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition: all 0.3s ease;
}

.item-row-edit:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(46, 221, 90, 0.2);
}

.item-head-edit {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
}

.modal-actions-full {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.save-btn {
    background: linear-gradient(135deg, #2edd5a, #4cdc82);
    color: white;
}

.save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.3);
}

/* Transiciones */
.fade-in-enter-active,
.fade-in-leave-active {
    transition: all 0.2s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

/* Transición Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-content {
    animation: slideUp 0.3s ease forwards;
}

.modal-fade-leave-active .modal-content {
    animation: slideDown 0.3s ease forwards;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(0);
        opacity: 1;
    }

    to {
        transform: translateY(20px);
        opacity: 0;
    }
}

@media (max-width: 768px) {
    .filters-section {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .filter-group {
        width: 100%;
    }

    .filter-group-compact {
        width: 100%;
    }

    .filter-group-compact>div {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .filters-controls-group {
        grid-column: 1;
        flex-direction: column;
    }

    .filters-controls-group .filter-group {
        width: 100%;
    }

    .btn-add-filters,
    .btn-clear-filters {
        width: 100%;
        justify-content: center;
    }

    .btn-add-filters.compact {
        width: 100%;
        font-size: 0.85rem;
        padding: 10px 14px;
    }

    .filters-dropdown-new {
        position: fixed;
        left: 20px;
        right: 20px;
        max-width: none;
        min-width: auto;
        width: auto;
    }

    .orders-table {
        font-size: 0.8rem;
    }

    .orders-table th,
    .orders-table td {
        padding: 8px 6px;
    }

    .cell-actions {
        gap: 4px;
    }

    .action-btn {
        padding: 4px 6px;
    }

    .title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .btn-create-order {
        width: 100%;
        justify-content: center;
    }

    .modal-content {
        padding: 24px;
        max-width: 95vw;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .modal-actions {
        flex-direction: column;
    }

    .btn-cancel,
    .btn-save,
    .btn-download-excel {
        width: 100%;
    }

    /* Ensure DatePicker and CustomSelect inputs have full width */
    .filter-input,
    .control.filter-input {
        width: 100% !important;
        min-width: 0 !important;
    }

    .hora-range {
        flex-direction: column;
        gap: 8px;
    }

    .hora-range .filter-input {
        width: 100% !important;
    }
}

/* Dropdown Filter Styles */
.dropdown-filter-group {
    position: relative;
}

.dropdown-container {
    position: relative;
    width: 100%;
    overflow: visible;
    z-index: 100;
    display: flex;
    justify-content: flex-end;
}

.filter-group-compact .dropdown-container {
    min-width: fit-content;
    overflow: visible;
}

.btn-add-filters {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(74, 144, 226, 0.1));
    border: 1px solid rgba(46, 221, 90, 0.3);
    color: rgba(46, 221, 90, 0.9);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-add-filters.compact {
    padding: 8px 10px;
    gap: 6px;
    font-size: 0;
    border-radius: 8px;
    flex-shrink: 0;
}

.btn-add-filters:hover {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46, 221, 90, 0.2);
}

.btn-add-filters[aria-expanded="true"] {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
}

.btn-add-filters.has-active-filters {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
    box-shadow: 0 0 0 2px rgba(46, 221, 90, 0.2);
}

.filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(46, 221, 90, 0.8);
    color: white;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 700;
}

.btn-add-filters .dropdown-icon {
    transition: transform 0.2s ease;
    margin-left: 4px;
}

.btn-add-filters[aria-expanded="true"] .dropdown-icon {
    transform: rotate(180deg);
}

/* ===== NUEVO DISEÑO DEL DROPDOWN DE FILTROS ===== */
.filters-dropdown-new {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 12px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(59, 130, 246, 0.1);
    backdrop-filter: blur(12px);
    z-index: 1000;
    min-width: 360px;
    max-width: calc(100vw - 40px);
    width: auto;
    animation: slideDownDropdownNew 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

@keyframes slideDownDropdownNew {
    from {
        opacity: 0;
        transform: translateY(-12px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.dropdown-header-new {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.15);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(30, 41, 59, 0.5));
}

.dropdown-title-new {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: rgba(226, 232, 240, 0.95);
    letter-spacing: 0.3px;
    text-transform: uppercase;
}

.btn-close-dropdown-new {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.btn-close-dropdown-new:hover {
    background: rgba(255, 107, 107, 0.15);
    border-color: rgba(255, 107, 107, 0.3);
    color: rgba(255, 107, 107, 0.8);
}

.dropdown-content-new {
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 380px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
    flex: 1;
}

.dropdown-content-new::-webkit-scrollbar {
    width: 6px;
}

.dropdown-content-new::-webkit-scrollbar-track {
    background: transparent;
}

.dropdown-content-new::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
}

.dropdown-content-new::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
}

.filter-group-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 6px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
}

.section-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(96, 165, 250, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 8px;
    margin-bottom: 4px;
}

.checkbox-item-new {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: rgba(226, 232, 240, 0.9);
    font-size: 0.85rem;
    font-weight: 500;
    user-select: none;
    position: relative;
    white-space: nowrap;
    flex-wrap: nowrap;
}

.checkbox-item-new:hover {
    background: rgba(59, 130, 246, 0.12);
    color: rgba(226, 232, 240, 1);
}

.checkbox-item-new input[type="checkbox"] {
    cursor: pointer;
    accent-color: #3b82f6;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 18px;
    height: 18px;
    border: 1.5px solid rgba(59, 130, 246, 0.5);
    border-radius: 4px;
    background: transparent;
    transition: all 0.2s ease;
    cursor: pointer;
}

.checkbox-item-new input[type="checkbox"]:hover {
    border-color: rgba(59, 130, 246, 0.8);
    background: rgba(59, 130, 246, 0.1);
}

.checkbox-item-new input[type="checkbox"]:checked {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #1e40af;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.checkbox-item-new input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    color: white;
    font-weight: bold;
    font-size: 12px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.dropdown-footer-new {
    padding: 12px 14px;
    border-top: 1px solid rgba(59, 130, 246, 0.15);
    background: rgba(30, 41, 59, 0.5);
    display: flex;
    justify-content: flex-end;
}

.btn-listo-new {
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: rgba(96, 165, 250, 0.95);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-listo-new:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
    border-color: rgba(59, 130, 246, 0.6);
    color: rgba(226, 232, 240, 1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-listo-new:active {
    transform: scale(0.98);
}

.btn-close-dropdown:hover {
    background: rgba(46, 221, 90, 0.25);
    border-color: rgba(46, 221, 90, 0.5);
}

/* Active Filters Inline */
.active-filter-inline {
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-remove-filter {
    padding: 8px 8px;
    background: transparent;
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: rgba(255, 107, 107, 0.6);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.btn-remove-filter:hover {
    background: rgba(255, 107, 107, 0.15);
    border-color: rgba(255, 107, 107, 0.5);
    color: rgba(255, 107, 107, 0.9);
}

.btn-clear-all-filters {
    width: 100%;
    padding: 10px 16px;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: rgba(255, 107, 107, 0.8);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.btn-clear-all-filters:hover {
    background: rgba(255, 107, 107, 0.25);
    border-color: rgba(255, 107, 107, 0.5);
    color: rgba(255, 107, 107, 0.95);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }

}

/* ===== DOCUMENT MODAL STYLES ===== */
.doc-modal-shell {
    display: flex;
    gap: 24px;
    height: 100%;
    background: linear-gradient(135deg, rgba(13, 20, 35, 0.5), rgba(20, 30, 50, 0.5));
    border-radius: 12px;
    overflow: hidden;
}

.doc-sidebar {
    width: 380px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(20, 30, 50, 0.8));
    border-right: 1px solid rgba(59, 130, 246, 0.2);
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
}

.doc-sidebar::-webkit-scrollbar {
    width: 6px;
}

.doc-sidebar::-webkit-scrollbar-track {
    background: transparent;
}

.doc-sidebar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
}

.doc-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
}

.doc-header {
    padding: 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
}

.doc-title-section {
    display: flex;
    gap: 14px;
    align-items: flex-start;
}

.doc-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    color: rgba(59, 130, 246, 0.9);
    margin-top: 2px;
}

.doc-main-title {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(226, 232, 240, 0.95);
    letter-spacing: 0.3px;
}

.doc-subtitle {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(226, 232, 240, 0.6);
    line-height: 1.3;
}

.doc-subtitle strong {
    color: rgba(59, 130, 246, 0.9);
    font-weight: 600;
}

.doc-actions-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-doc-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: rgba(59, 130, 246, 0.8);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
    flex-shrink: 0;
    overflow: hidden;
}

.btn-doc-action:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.6);
    color: rgba(96, 165, 250, 0.95);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.btn-doc-action.refresh-btn:not(.is-loading):hover {
    transform: translateY(-2px);
}

.btn-doc-action.refresh-btn.is-loading {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    color: rgba(96, 165, 250, 0.95);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
}

.btn-doc-action:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-doc-action svg {
    width: 18px;
    height: 18px;
}

@keyframes spin-cool {
    0% {
        transform: rotate(0deg) scale(1);
    }

    50% {
        transform: rotate(180deg) scale(1.1);
    }

    100% {
        transform: rotate(360deg) scale(1);
    }
}

.btn-doc-action.refresh-btn svg {
    display: block;
    transform-origin: center;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-doc-action.refresh-btn svg.spin {
    animation: spin-cool 1.2s linear infinite;
    will-change: transform;
}

.btn-doc-action.refresh-btn:not(.is-loading):not(:disabled):hover svg {
    transform: rotate(20deg);
}

.doc-list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 12px;
}

.loading-state,
.error-state,
.empty-versions-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    color: rgba(226, 232, 240, 0.6);
    text-align: center;
    flex: 1;
}

.loading-state svg,
.error-state svg,
.empty-versions-state svg {
    width: 40px;
    height: 40px;
    opacity: 0.5;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: rgba(59, 130, 246, 0.8);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.doc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.doc-list-item {
    display: flex;
    gap: 8px;
    align-items: center;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(59, 130, 246, 0.15);
    transition: all 0.2s ease;
    padding: 8px;
}

.doc-list-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(59, 130, 246, 0.3);
}

.doc-list-item.active {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.doc-item-btn {
    flex: 1;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-align: left;
    min-width: 0;
}

.doc-item-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(59, 130, 246, 0.7);
    margin-top: 2px;
}

.doc-item-icon svg {
    width: 20px;
    height: 20px;
}

.doc-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.doc-item-name {
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
    font-size: 0.9rem;
    word-break: break-word;
}

.doc-item-meta {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.5);
}

.btn-download-doc {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(46, 221, 90, 0.1);
    border: 1px solid rgba(46, 221, 90, 0.2);
    color: rgba(46, 221, 90, 0.7);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.btn-download-doc:has(.checkmark-icon) {
    animation: success-pulse 0.6s ease-out 1;
}

.btn-download-doc:hover {
    background: rgba(46, 221, 90, 0.2);
    border-color: rgba(46, 221, 90, 0.5);
    color: rgba(46, 221, 90, 0.9);
    box-shadow: 0 4px 12px rgba(46, 221, 90, 0.12);
    transform: translateY(-2px);
}

.btn-download-doc svg {
    width: 16px;
    height: 16px;
}

.download-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.download-icon.show-checkmark {
    animation: download-exit 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.checkmark-icon {
    position: absolute;
    width: 16px;
    height: 16px;
    color: rgba(46, 221, 90, 0.95);
    animation: checkmark-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes download-exit {
    0% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 0;
        transform: scale(0.3) rotate(-90deg);
    }
}

@keyframes checkmark-enter {
    0% {
        opacity: 0;
        transform: scale(0) rotate(90deg);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }

    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
}

@keyframes success-pulse {

    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(46, 221, 90, 0.4);
    }

    50% {
        box-shadow: 0 0 0 4px rgba(46, 221, 90, 0.1);
    }
}

.doc-viewer {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    overflow: hidden;
    padding: 12px;
}

.viewer-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.pdf-frame {
    width: 100%;
    height: 100%;
    display: flex;
}

.pdf-frame iframe {
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 4px;
}

.no-preview {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: rgba(226, 232, 240, 0.4);
}

.no-preview svg {
    width: 56px;
    height: 56px;
    opacity: 0.6;
}

.no-preview p {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.2px;
}

@media (max-width: 1024px) {
    .doc-modal-shell {
        flex-direction: column;
    }

    .doc-sidebar {
        width: 100%;
        height: auto;
        max-height: 40vh;
        border-right: none;
        border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    }

    .doc-viewer {
        height: 100%;
    }
}

@media (max-width: 768px) {
    .doc-sidebar {
        max-height: 35vh;
    }

    .doc-header {
        padding: 16px;
    }

    .doc-main-title {
        font-size: 1rem;
    }

    .doc-subtitle {
        font-size: 0.75rem;
    }

    .btn-doc-action {
        width: 32px;
        height: 32px;
    }
}

@media (max-width: 640px) {
    .doc-modal-shell {
        flex-direction: column;
        height: 100%;
    }

    .doc-sidebar {
        max-height: 30vh;
        padding: 12px;
    }

    .doc-header {
        padding: 12px;
        gap: 12px;
    }

    .doc-title-section {
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .doc-icon {
        width: 24px;
        height: 24px;
    }

    .doc-main-title {
        font-size: 0.9rem;
    }

    .doc-subtitle {
        font-size: 0.7rem;
    }

    .doc-item-name {
        font-size: 0.85rem;
    }

    .doc-item-meta {
        font-size: 0.7rem;
    }

    .doc-viewer {
        padding: 8px;
    }

    .modal-content {
        padding: 12px;
    }
}

/* ===== SKELETON LOADER ===== */
.skeleton-loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-item {
    display: flex;
    gap: 8px;
    align-items: center;
    border-radius: 8px;
    padding: 10px;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.25);
    animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    background: linear-gradient(90deg,
            rgba(59, 130, 246, 0.6) 0%,
            rgba(59, 130, 246, 0.4) 25%,
            rgba(59, 130, 246, 0.2) 50%,
            rgba(59, 130, 246, 0.4) 75%,
            rgba(59, 130, 246, 0.6) 100%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}

.skeleton-title {
    height: 14px;
    background: linear-gradient(90deg,
            rgba(59, 130, 246, 0.6) 0%,
            rgba(59, 130, 246, 0.4) 25%,
            rgba(59, 130, 246, 0.2) 50%,
            rgba(59, 130, 246, 0.4) 75%,
            rgba(59, 130, 246, 0.6) 100%);
    background-size: 200% 100%;
    border-radius: 4px;
    width: 75%;
    animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-meta {
    height: 11px;
    background: linear-gradient(90deg,
            rgba(59, 130, 246, 0.5) 0%,
            rgba(59, 130, 246, 0.3) 25%,
            rgba(59, 130, 246, 0.1) 50%,
            rgba(59, 130, 246, 0.3) 75%,
            rgba(59, 130, 246, 0.5) 100%);
    background-size: 200% 100%;
    border-radius: 4px;
    width: 55%;
    animation: skeleton-shimmer 2s ease-in-out infinite 0.1s;
}

.skeleton-button {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    background: linear-gradient(90deg,
            rgba(46, 221, 90, 0.5) 0%,
            rgba(46, 221, 90, 0.3) 25%,
            rgba(46, 221, 90, 0.15) 50%,
            rgba(46, 221, 90, 0.3) 75%,
            rgba(46, 221, 90, 0.5) 100%);
    background-size: 200% 100%;
    border-radius: 6px;
    animation: skeleton-shimmer 2s ease-in-out infinite 0.2s;
}

@keyframes skeleton-shimmer {
    0% {
        background-position: 200% 0;
    }

    50% {
        background-position: -200% 0;
    }

    100% {
        background-position: 200% 0;
    }
}

@keyframes skeleton-pulse {

    0%,
    100% {
        opacity: 0.95;
    }

    50% {
        opacity: 0.7;
    }
}

/* ===== RESPONSIVE ZOOM PARA DISPOSITIVOS MÓVILES ===== */
/* Aplicar zoom 80% a TODO el componente en dispositivos de 300px x 600px en adelante */
@media (min-width: 300px) and (max-width: 768px) and (min-height: 600px) {
    .order-management-container {
        box-sizing: border-box;
        transform: scale(0.8);
        -webkit-transform: scale(0.8);
        transform-origin: top center;
        -webkit-transform-origin: top center;
        /* Center the scaled content and avoid shifting to the right */
        max-width: 1200px;
        width: 100%;
        padding: 0 12px;
        margin: 0 auto;
    }
}
</style>
