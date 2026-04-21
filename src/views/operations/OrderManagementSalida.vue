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
                    <span>Gestión de Órdenes de Salida</span>
                    <button v-if="canCreateOrder" class="btn-create-order" @click="goToCreateOrder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nueva Orden

                    </button>

                    <details v-if="isAdmin" ref="archiveMenuRef" class="archive-menu">
                        <summary class="btn-reset-folios archive-summary" :class="{ 'viewing-archived': viewingArchived }" title="Opciones de archivo">
                            <svg v-if="!viewingArchived && !archivedStore.hasArchivedByType.salida" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                                <rect x="1" y="3" width="22" height="5"></rect>
                                <line x1="10" y1="12" x2="14" y2="12"></line>
                            </svg>
                            <svg v-else-if="!viewingArchived && archivedStore.hasArchivedByType.salida" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z"></path>
                                <polyline points="8 9 12 13 16 9"></polyline>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.13a2 2 0 0 1-.59 1.42"></path>
                                <polyline points="16 3 16 7 8 7 8 3"></polyline>
                                <polyline points="16 13 20 9 16 5"></polyline>
                            </svg>
                            <span>{{ archiveButtonLabel }}</span>
                            <svg class="archive-caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </summary>
                        <div class="archive-popover">
                            <button type="button" class="archive-action-item" :disabled="isResetting" @click="handleArchiveAction('salida')">
                                Archivar y reiniciar folios
                            </button>
                            <button type="button" class="archive-action-item secondary" @click="openArchivedPanel('salida')">
                                Ver archivadas ({{ archivedStore.archivedCounts.salida || 0 }})
                            </button>
                        </div>
                    </details>


                </div>
            </template>

            <Breadcrumbs />

            <OrderFilterBar
                :filters="orderSearchFilters"
                :count-label="`Filtradas: ${filteredOrders.length}`"
                :suggestions-by-field="orderSearchFilters.suggestionsByField"
            />

            <!-- Filtros: estructura elegante con 3 columnas -->
            <div v-if="false" class="filters-section">
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
                                            <span>Motivo de salida</span>
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
                                         <div class="section-label">Búsqueda de Equipos</div>
                                         <label class="checkbox-item-new">
                                             <input type="checkbox" v-model="filterItemTextActive" />
                                             <span>Nombre de equipo</span>
                                         </label>
                                         <label class="checkbox-item-new">
                                             <input type="checkbox" v-model="filterAccesorioActive" />
                                             <span>Accesorios</span>
                                         </label>
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
                                             <input type="checkbox" v-model="filterNoInventarioActive" />
                                             <span>No. Inventario</span>
                                         </label>
                                     </div>
                                     <div class="filter-group-section">
                                         <div class="section-label">Cantidad de Artículos</div>
                                         <label class="checkbox-item-new">
                                             <input type="checkbox" v-model="filterCantidadMinActive" />
                                             <span>Cantidad mínima</span>
                                         </label>
                                         <label class="checkbox-item-new">
                                             <input type="checkbox" v-model="filterCantidadMaxActive" />
                                             <span>Cantidad máxima</span>
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
                                    <CustomSelect v-model="filterMotivo" :options="motivoSalidaOptions"
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
                                <template v-else-if="f.key === 'noInventario'">
                                    <input v-model="filterNoInventario" class="control filter-input"
                                        placeholder="Ej. 12345..." />
                                </template>
                                <template v-else-if="f.key === 'cantidadMin'">
                                    <input v-model.number="filterCantidadMin" type="number" class="control filter-input"
                                        placeholder="Mínimo..." min="0" />
                                </template>
                                <template v-else-if="f.key === 'cantidadMax'">
                                    <input v-model.number="filterCantidadMax" type="number" class="control filter-input"
                                        placeholder="Máximo..." min="0" />
                                </template>
                                <template v-else-if="f.key === 'accesorio'">
                                    <input v-model="filterAccesorio" class="control filter-input"
                                        placeholder="Nombre de accesorio..." />
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
                @create="goToCreateOrder" @openHistory="openDocumentModal" @upload="openUploadModal"
                @generateOrder="handleGenerateOrder" />
        </ActionPanel>

        <!-- Modal: Wizard de creación de orden de salida -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div v-if="showWizardModal" class="wizard-modal-overlay" @click.self="requestCloseWizard">
                    <div class="wizard-modal-container">
                        <button class="wizard-modal-close" @click="requestCloseWizard" aria-label="Cerrar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <div class="wizard-modal-content">
                            <OpSalida v-if="showWizardModal && wizardType === 'salida'" :initialItems="wizardInitialItems" @created="onWizardCreated" @cancel="closeWizardImmediately" />
                            <OpEntrada v-else-if="showWizardModal" :initialItems="wizardInitialItems" @created="onWizardCreated" @cancel="closeWizardImmediately" />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

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
                    <OpSalida v-if="isActiveTabEditable" :key="`edit-${selectedOrderId}-${activeTab}`" :modo="'editar'"
                        :ordenId="selectedOrderId" :enModal="true" :read-only="false" @actualizado="onOrderUpdated"
                        @close="closeEditModal" />

                    <!-- Versiones anteriores: snapshot + solo lectura + resaltados -->
                    <OpSalida v-else :key="`snap-${selectedOrderId}-${activeTab}`" :modo="'editar'"
                        :ordenId="selectedOrderId" :enModal="true" :read-only="true"
                        :snapshot="snapshotForActiveVersion" :diffHighlights="highlightsForActiveVersion"
                        @close="closeEditModal" />
                </div>

                <div v-show="activeTab === 'main' && !branchTabs.length" role="tabpanel" class="om-main-panel">
                    <OpSalida :key="mainEditorKey" ref="OpSalidaRef" :ordenId="selectedOrderId" :modo="'editar'"
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

                    <div class="doc-tabs">
                        <button class="doc-tab" :class="{ active: activeDocTab === 'generadas' }"
                            @click="activeDocTab = 'generadas'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Documentos Generados
                        </button>
                        <button class="doc-tab" :class="{ active: activeDocTab === 'firmadas' }"
                            @click="activeDocTab = 'firmadas'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z">
                                </path>
                                <polyline points="7 12 10 15 17 8"></polyline>
                            </svg>
                            Documentos Firmados
                            <span v-if="signedDocuments && signedDocuments.length > 0" class="tab-badge">{{ signedDocuments.length }}</span>
                        </button>
                    </div>

                    <div class="doc-list-section">
                        <!-- Tab: Documentos Generados -->
                        <template v-if="activeDocTab === 'generadas'">
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
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z">
                                                </path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="12" y1="13" x2="12" y2="17"></line>
                                                <line x1="9" y1="15" x2="15" y2="15"></line>
                                            </svg>
                                        </div>
                                        <div class="doc-item-content">
                                            <div class="doc-item-name">{{ v.name || ('salida ' + docTitle + (v.version
                                                ? `
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
                        </template>

                        <!-- Tab: Documentos Firmados -->
                        <template v-if="activeDocTab === 'firmadas'">
                            <div v-if="signedDocuments.length === 0" class="empty-versions-state">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <p>Sin documentos firmados</p>
                            </div>
                            <ul v-else class="doc-list signed-docs-list">
                                <li v-for="d in signedDocuments" :key="d.id" class="doc-list-item signed-doc-item">
                                    <button class="doc-item-btn" @click="selectSignedDocument(d)">
                                        <div class="doc-item-icon signed-doc-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z">
                                                </path>
                                                <polyline points="7 12 10 15 17 8"></polyline>
                                            </svg>
                                        </div>
                                        <div class="doc-item-content">
                                            <div class="doc-item-name">{{ d.name }}</div>
                                            <div class="doc-item-meta">
                                                <span class="uploader-info">
                                                    <img v-if="d.uploaderFoto" :src="d.uploaderFoto" class="uploader-avatar" alt="avatar" />
                                                    <span v-else class="uploader-avatar placeholder">{{ (d.uploader||'U').split(' ').map(s=>s[0]).slice(0,2).join('') }}</span>
                                                    <strong class="uploader-name">{{ d.uploader || 'Usuario' }}</strong>
                                                </span>
                                                • {{ formatTimestamp(d.createdAt) }}
                                            </div>
                                        </div>
                                    </button>
                                    <a :href="d.downloadUrl" :download="d.name" class="btn-download-doc"
                                        title="Descargar" @click="playDownloadAnimation(d.id)" target="_blank"
                                        rel="noopener noreferrer">
                                        <svg class="download-icon" :class="{ 'show-checkmark': downloadingId === d.id }"
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        <svg v-show="downloadingId === d.id" class="checkmark-icon"
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </template>
                    </div>
                </aside>

                <section class="doc-viewer">
                    <div class="viewer-content">
                        <div v-if="currentPreviewUrl" class="pdf-frame">
                            <template v-if="currentPreviewType && currentPreviewType.startsWith('image/')">
                                <div class="image-preview-wrap" style="display:flex;align-items:center;justify-content:center;height:100%;">
                                    <img :src="currentPreviewUrl" alt="Imagen" style="max-width:100%; max-height:80vh; object-fit:contain;" />
                                </div>
                            </template>
                            <template v-else-if="!isMobileView">
                                <iframe :src="currentPreviewUrl" title="Previsualización documento"
                                    style="width:100%; height:100%; border:0; min-height:360px;"></iframe>
                            </template>
                            <template v-else>
                                <BlobPdfViewer :src="currentPreviewUrl" />
                            </template>

                            <div v-if="currentPreviewType && !currentPreviewType.startsWith('image/') && !currentPreviewUrl.toLowerCase().endsWith('.pdf')" class="download-only" style="padding:12px;text-align:center;">
                                <p style="margin:0 0 8px 0;color:var(--muted, rgba(0,0,0,0.6));">Previsualización no disponible para este tipo de archivo.</p>
                                <a :href="currentPreviewUrl" target="_blank" class="btn-download-doc">Descargar</a>
                            </div>
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

        <!-- Modal: upload de archivos -->
        <ModalBase :open="showUploadModal" @close="closeUploadModal" @close-request="closeUploadModal" :maxWidth="1200"
            :height="'85vh'" :hideInternalClose="false" :externalClose="true">
            <div class="upload-modal-shell">

                <div class="upload-header">
                    <h3 class="upload-title">Subir documento firmado</h3>
                    <p class="upload-subtitle">Folio: <strong>{{ uploadOrderFolio }}</strong></p>
                </div>

                <!-- Dropzone o preview dinámico -->
                <div class="upload-dropzone-wrapper">
                    <template v-if="uploadSuccessData">
                        <div class="upload-success-full">
                            <div class="success-card">
                                <div class="success-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <p class="success-title">Archivo subido correctamente</p>
                                <div class="uploaded-file-info">
                                    <p class="uploaded-file-name">{{ uploadSuccessData.name }}</p>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else-if="!uploadFile">
                        <label for="fileInput" class="upload-dropzone-container"
                            @dragenter.prevent="dragOverActive = true" @dragover.prevent="dragOverActive = true"
                            @dragleave.prevent="dragOverActive = false" @drop.prevent="handleFlowbiteDrop"
                            :class="{ 'is-drag-active': dragOverActive }">
                            <div class="dropzone-content">
                                <div class="dropzone-icon-wrapper">
                                    <svg v-if="!dragOverActive" class="dropzone-icon" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <svg v-else class="dropzone-icon icon-bounce" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="M21 9v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"></path>
                                        <polyline points="7 16 12 21 17 16"></polyline>
                                        <line x1="12" y1="21" x2="12" y2="9"></line>
                                    </svg>
                                </div>
                                <div class="dropzone-text">
                                    <h3 class="dropzone-title">
                                        <span v-if="!dragOverActive">Suelta un archivo aquí</span>
                                        <span v-else>Suelta para subir</span>
                                    </h3>
                                    <p class="dropzone-subtitle">
                                        o <span class="dropzone-link">haz clic para seleccionar</span>
                                    </p>
                                    <p class="dropzone-formats">PDF, imágenes, DOCX, ZIP y más</p>
                                </div>
                            </div>
                            <input ref="fileInput" id="fileInput" type="file" @change="handleFileUpload"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.zip" class="hidden" />
                        </label>
                    </template>
                    <template v-else>
                        <div class="selected-file-info">
                            <div class="file-info-card">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <div class="file-details">
                                    <p class="file-name">{{ uploadFile.name }}</p>
                                    <p class="file-size">{{ (uploadFile.size / 1024).toFixed(2) }} KB</p>
                                </div>
                                <button type="button" @click="uploadFile = null" class="btn-remove-file"
                                    title="Remover archivo">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <div class="file-preview-section">
                                <div v-if="isImageFile(uploadFile)" class="preview-container">
                                    <img :src="previewImageUrl" :alt="uploadFile.name" class="preview-image" />
                                </div>
                                <div v-else-if="isPdfFile(uploadFile)" class="preview-container">
                                    <div v-if="pdfPreviewUrl" class="pdf-viewer-container">
                                        <iframe :src="pdfPreviewUrl" class="pdf-iframe"></iframe>
                                    </div>
                                    <div v-else class="file-icon-preview pdf-preview">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        </svg>
                                        <span>PDF</span>
                                    </div>
                                </div>
                                <div v-else-if="isDocFile(uploadFile)" class="preview-container">
                                    <div v-if="docPreviewHtml" class="doc-viewer-container" v-html="docPreviewHtml">
                                    </div>
                                    <div v-else class="file-icon-preview doc-preview">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        </svg>
                                        <span>{{ getFileExtension(uploadFile.name).toUpperCase() }}</span>
                                    </div>
                                </div>
                                <div v-else class="preview-container">
                                    <div class="file-icon-preview generic-preview">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        </svg>
                                        <span>{{ getFileExtension(uploadFile.name).toUpperCase() }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Firmantes pendientes SIEMPRE visibles -->
                <div v-if="uploadMissingSigners.length" class="pending-signers-section upload-modal-section">
                    <h4 class="signers-title">Firmantes pendientes</h4>
                    <p class="signers-subtitle">Completa el/los nombre(s) de los firmantes marcados como
                        <strong>PENDIENTE</strong> antes de subir el documento.
                    </p>
                    <div class="signers-inputs">
                        <div v-for="s in uploadMissingSigners" :key="s.key" class="signer-input-group">
                            <label class="signer-label">{{ s.label }}:</label>
                            <input v-model.trim="uploadSignerNames[s.key]" class="control"
                                placeholder="Nombre completo" />
                        </div>
                    </div>
                </div>

                <!-- Footer de acciones SIEMPRE visible -->
                <div class="upload-footer upload-modal-section">
                    <button type="button" @click="closeUploadModal" class="btn-cancel" :disabled="isUploading">
                        {{ uploadSuccessData ? 'Cerrar' : 'Cancelar' }}
                    </button>
                    <button v-if="!uploadSuccessData" type="button" @click="submitUpload" class="btn-submit"
                        :disabled="!uploadFile || isUploading" :class="{ 'is-loading': isUploading }">
                        <span v-if="!isUploading">Subir archivo</span>
                        <span v-else class="loading-text">Subiendo...</span>
                    </button>

                </div>
            </div> <!-- upload-modal-shell -->
        </ModalBase>
        <ArchivedFoliosPanel ref="archivedPanelRef" @open="handleArchivedPanelOpen" @close="handleArchivedPanelClose" />
    </div> <!-- order-management-container -->
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue'
import motivoSalidaOptions from '@/data/motivoSalidaOptions.js'
import { useRouter, useRoute } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import DatePicker from '@/components/DatePicker.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import OrderFilterBar from '@/components/OrderFilterBar.vue'
import OrdersTable from '@/components/OrdersTable.vue'
import ModalBase from '@/components/ModalBase.vue'
import PdfViewer from '@/components/PdfViewer.vue'
import BlobPdfViewer from '@/components/BlobPdfViewer.vue'
import ArchivedFoliosPanel from '@/components/ArchivedFoliosPanel.vue'
import { confirmDelete, confirmCancel, showSuccess, showError, showAlert } from '@/utils/sweetAlertConfig'
import Swal from 'sweetalert2'
import { useCloseConfirmation } from '@/composables/useCloseConfirmation.js'
import { darkThemeConfig } from '@/utils/sweetAlertConfig'
import { saveWizardState, peekWizardState, clearWizardState, clearWizardDraft, peekSessionState, savePanelState, peekPanelState, clearPanelState } from '@/utils/sessionRestore'
import { deleteDraftRemote } from '@/services/draftService.js'
import { usePermissions } from '@/composables/usePermissions.js'
import { authedFetch } from '@/utils/api.js'
import { confirmAndResetFolios as resetFoliosHelper } from '@/utils/resetFolios.js'
import { useArchivedOrdersStore } from '@/stores/useArchivedOrdersStore.js'
const OpSalida = defineAsyncComponent(() => import('@/views/operations/OpSalidaNew.vue'))
const OpEntrada = defineAsyncComponent(() => import('@/views/operations/OpEntradaNew.vue'))

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
    // Cargar lista al montar para asegurar que cuándo esta vista se muestra siempre
    // hace una recuperación fresca desde el servidor
    try { reloadOrdersFromServer().catch(() => {}) } catch (e) {}
    try { console.debug('[OrderManagement] mounted, dispatching route:mounted', { name: route.name, path: route.fullPath }); window.dispatchEvent(new CustomEvent('route:mounted', { detail: { name: route.name, path: route.fullPath } })) } catch (e) {}
    // Cargar órdenes archivadas para reactividad
    try { archivedStore.fetchArchived('salida').catch(() => {}) } catch (e) {}
    // Restaurar wizard/panel si existe una sesion previa
    try {
        const restoreState = peekSessionState()
        const wizardState = peekWizardState()
        const panelState = peekPanelState()
        const wizardUpdatedAt = Number(wizardState?.updatedAt || 0)
        const panelUpdatedAt = Number(panelState?.updatedAt || 0)
        const canRestoreWizard = restoreState
            && wizardState
            && String(wizardState.routeName || '') === String(route.name || '')
            && (!panelState || wizardUpdatedAt >= panelUpdatedAt)

        // Verificar también si hay drafts guardados directamente en localStorage
        const hasSalidaDraft = !!localStorage.getItem('wizardDraft:salida')
        
        if (canRestoreWizard) {
            wizardType.value = wizardState.type || wizardType.value
            showWizardModal.value = true
            clearWizardState()
        } else if (hasSalidaDraft && restoreState && String(restoreState.route || '').includes('salida')) {
            // Hay draft pero no hay wizardState - abrir directamente el wizard de salida
            wizardType.value = 'salida'
            showWizardModal.value = true
        }
        const canRestorePanel = restoreState
            && panelState
            && String(panelState.routeName || '') === String(route.name || '')
            && (!wizardState || panelUpdatedAt >= wizardUpdatedAt)

        if (canRestorePanel && panelState.panel === 'archived-folios') {
            archivedPanelType.value = String(panelState.orderType || panelState.type || '')
            try { clearPanelState() } catch (e) {}
            openArchivedPanel(archivedPanelType.value)
        }
    } catch (e) {}
    // Reaccionar si se fuerza la recreación global (ej. navigateAndRefresh)
    try {
        const handleForceRecreate = () => { try { console.debug('[OrderManagement] app:force-recreate received, reloading orders'); reloadOrdersFromServer().catch(() => {}) } catch (e) { /* ignore */ } }
        window.addEventListener('app:force-recreate', handleForceRecreate)
        // store reference for cleanup
        window.__orderManagement_forceRecreate = handleForceRecreate
    } catch (e) {}
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResizeForPreview)
    try { if (window.__orderManagement_forceRecreate) { window.removeEventListener('app:force-recreate', window.__orderManagement_forceRecreate); delete window.__orderManagement_forceRecreate; console.debug('[OrderManagement] removed forceRecreate handler') } } catch (e) {}
    // Limpiar estado al abandonar el componente
    showEditModal.value = false
    showDocModal.value = false
    showUploadModal.value = false
    showMoreFilters.value = false
    showLegend.value = false
    allOrders.value = []
    
    // Purga máxima: limpiar localStorage de órdenes para forzar recarga
    try {
        localStorage.removeItem('orders_list')
    } catch (e) {
        console.warn('Could not clear orders_list from localStorage', e)
    }

    // Si venimos de una orden externa (resguardo/servicio), abrir directamente el wizard de salida prellenado
    try {
        const prefill = localStorage.getItem('prefillSalidaFromExternal')
        if (prefill) {
            showWizardModal.value = true
        }
    } catch (e) {
        console.warn('Could not read prefillSalidaFromExternal from localStorage', e)
    }
})
const route = useRoute()

// Estado para el modal del wizard de creación de órdenes
const showWizardModal = ref(false)
// Prefill items y tipo de wizard (salida/entrada) para quick actions
const wizardInitialItems = ref(null)
const wizardType = ref('salida')

watch([showWizardModal, wizardType], ([open, type]) => {
    try {
        if (open) {
            saveWizardState({ routeName: route.name, type: type || 'salida' })
        } else {
            clearWizardState()
        }
    } catch (e) {}
})

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

// Permisos del usuario

function handleGenerateOrder(payload) {
    try {
        wizardType.value = payload?.type || 'salida'
        wizardInitialItems.value = payload?.order?.equiposEntrada ? JSON.parse(JSON.stringify(payload.order.equiposEntrada)) : []
        showWizardModal.value = true
    } catch (e) {
        console.warn('handleGenerateOrder error', e)
        wizardInitialItems.value = []
        showWizardModal.value = true
    }
}

// Permisos del usuario
const { canCreateOrder, canEditOrder, canDeleteOrder, canDownloadOrderHistory, isAdmin } = usePermissions()

// Wrapper to expose to template
const isResetting = ref(false)
async function confirmAndResetFolios(orderType = 'salida') {
    if (isResetting.value) return
    isResetting.value = true
    try {
        const res = await resetFoliosHelper(orderType, { archivedPanelRef })
        try { await reloadOrdersFromServer() } catch (e) { console.warn('[OrderManagementSalida] reload after reset failed', e) }
        return res
    } catch (e) {
        console.warn('[OrderManagementSalida] reset folios failed', e)
    } finally {
        isResetting.value = false
    }
}

// Archived orders reactivity
const archivedStore = useArchivedOrdersStore()
const viewingArchived = ref(false)
const archivedPanelType = ref('')
const archivedPanelRef = ref(null)
const archiveMenuRef = ref(null)

const archiveButtonLabel = computed(() => {
    const count = Number(archivedStore.archivedCounts.salida || 0)
    if (viewingArchived.value) return count ? `Archivadas (${count})` : 'Archivadas'
    if (count > 0) return `Archivadas (${count})`
    return 'Archivar y reiniciar'
})

function closeArchiveMenu() {
    try { if (archiveMenuRef.value) archiveMenuRef.value.open = false } catch (e) {}
}

function openArchivedPanel(orderType = 'salida') {
    closeArchiveMenu()
    archivedPanelType.value = orderType ? String(orderType) : ''
    try { if (archivedPanelRef && archivedPanelRef.value && typeof archivedPanelRef.value.open === 'function') archivedPanelRef.value.open(orderType) } catch (e) {}
}

function handleArchivedPanelOpen() {
    viewingArchived.value = true
    try {
        savePanelState({ routeName: route.name, panel: 'archived-folios', orderType: archivedPanelType.value || '' })
    } catch (e) {}
}

function handleArchivedPanelClose() {
    viewingArchived.value = false
    try { clearPanelState() } catch (e) {}
}

async function handleArchiveAction(orderType = 'salida') {
    closeArchiveMenu()
    await confirmAndResetFolios(orderType)
}

// Estado y helpers para modal de documento (versiones / preview)
const showDocModal = ref(false)
const docVersions = ref([])
const signedDocuments = ref([])
const docLoading = ref(false)
const docTitle = ref('')
const currentPreviewUrl = ref('')
const currentPreviewType = ref('')
const docError = ref('')
const usersCache = ref(null)
const selectedPdfId = ref(null)
const downloadingId = ref(null)
const isLoadingOrders = ref(false)
const activeDocTab = ref('generadas') // 'generadas' o 'firmadas'

// Estado y helpers para modal de upload
const showUploadModal = ref(false)
const uploadOrderId = ref(null)
const uploadOrderFolio = ref('')
const uploadFile = ref(null)
const uploadedFile = ref(null)
const uploadedFilePreviewUrl = ref('')
const uploadMissingSigners = ref([])
const uploadSignerNames = ref({})
const previewImageUrl = ref('')
const pdfPreviewUrl = ref('')
const docPreviewHtml = ref('')
const isUploading = ref(false)
const dragOverActive = ref(false)
const uploadSuccessData = ref(null)

function withAuthQuery(url) {
    try {
        const token = localStorage.getItem('token')
        if (token) {
            const sep = url.includes('?') ? '&' : '?'
            return `${url}${sep}token=${encodeURIComponent(token)}`
        }
    } catch (e) {}
    return url
}

function resetUploadState() {
    uploadFile.value = null
    uploadSuccessData.value = null
    previewImageUrl.value = ''
    pdfPreviewUrl.value = ''
    docPreviewHtml.value = ''
    isUploading.value = false
}


async function openDocumentModal(order) {
    console.log('[ORDER_MANAGEMENT] openDocumentModal called:', order)
    const docId = order?.folio ?? order?.id ?? null
    if (!docId) {
        console.warn('[ORDER_MANAGEMENT] openDocumentModal: docId inválido')
        return
    }

    const type = (order?.orderType || order?.type || order?.tipo || 'salida').toString().toLowerCase()
    const baseType = type.includes('salida') ? 'salida' : type.includes('resguardo') ? 'resguardo' : type.includes('servicio') ? 'servicio' : 'entrada'

    docTitle.value = String(docId)
    showDocModal.value = true
    activeDocTab.value = 'generadas' // Reset to first tab

    // Auto-reload al abrir la modal
    await Promise.all([
        fetchDocVersionsFor(docId, baseType),
        fetchSignedDocuments(docId, baseType)
    ])
}

async function fetchDocVersionsFor(folio, orderType = 'salida') {
    docLoading.value = true
    isLoadingOrders.value = true
    docError.value = ''
    currentPreviewUrl.value = ''
    docVersions.value = []

    const startTime = Date.now()
    const minDuration = 1200 // Duración mínima para que se vea la animación (1 vuelta completa)

    try {
        const endpointPrefix = orderType || 'salida'
        const res = await authedFetch(`/api/ops/${endpointPrefix}/${encodeURIComponent(folio)}/pdfs`)
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

        const token = localStorage.getItem('token') || null
        docVersions.value = (items || []).map((it, idx) => {
            const id = it.id || it.pdfId || it.filename || `tmp-${idx}-${Date.now()}`
            const createdAt = it.createdAt || it.created_at || it.timestamp || null
            const createdBy = it.createdBy || it.created_by || it.uploader || null
            const endpointPrefix = orderType || 'salida'
            let previewUrl = it.previewUrl || it.preview_url || `/api/ops/${endpointPrefix}/${encodeURIComponent(folio)}/pdfs/${encodeURIComponent(id)}/preview`
            let downloadUrl = it.downloadUrl || it.download_url || `/api/ops/${endpointPrefix}/${encodeURIComponent(folio)}/pdfs/${encodeURIComponent(id)}/download`
            if (token) {
                previewUrl = withAuthQuery(previewUrl)
                downloadUrl = withAuthQuery(downloadUrl)
            }
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
            const endpointPrefix = orderType || 'salida'
            const versRes = await authedFetch(`/api/ops/${endpointPrefix}/${encodeURIComponent(folio)}/versions?limit=50`)
            if (versRes.ok) {
                const versJson = await versRes.json()
                const rows = (versJson && Array.isArray(versJson.items)) ? versJson.items : []
                const versItems = rows.map(v => {
                    const ver = v.version || v.v || 0
                    const createdAt = v.created_at || v.createdAt || null
                    return {
                        id: `ver-${ver}`,
                        name: `salida ${folio} v${ver}.pdf`,
                        version: ver,
                        type: 'version',
                        createdAt: createdAt ? new Date(createdAt).toISOString() : null,
                        createdBy: v.created_by || v.createdBy || 'snapshot',
                        previewUrl: `/api/ops/${endpointPrefix}/${encodeURIComponent(folio)}/versions/${encodeURIComponent(ver)}/preview`,
                        downloadUrl: `/api/ops/${endpointPrefix}/${encodeURIComponent(folio)}/versions/${encodeURIComponent(ver)}/download`
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
        const res = await fetch(`/api/ops/salida/${encodeURIComponent(docTitle.value)}/pdfs/generate-force`)
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
        const res = await fetch(`/api/ops/salida/${encodeURIComponent(docTitle.value)}/pdfs/generate-all-versions`)
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

async function fetchSignedDocuments(folio, orderType = 'salida') {
    const endpointPrefix = orderType || 'salida'
    // Try fetching signed documents; if 404, attempt common folio variants
    try {
        const tryFetch = async (f) => {
            const r = await authedFetch(`/api/ops/${endpointPrefix}/${encodeURIComponent(f)}/signed-documents`)
            return r
        }

        let res = await tryFetch(folio)
        // If 404, try simple variants (with/without 'E-' prefix, remove leading zeros)
        if (res.status === 404) {
            const variants = []
            const raw = String(folio || '')
            // If starts with E- try without prefix
            if (raw.toUpperCase().startsWith('E-')) {
                variants.push(raw.replace(/^E-/i, ''))
            } else {
                variants.push('E-' + raw)
            }
            // Try stripping leading zeros from numeric part
            const m = raw.match(/E-?0*(\d+)/i)
            if (m && m[1]) {
                variants.push('E-' + String(Number(m[1])))
                variants.push(String(Number(m[1])))
            }

            // Remove duplicates and try each
            const uniq = [...new Set(variants.filter(Boolean))]
            for (const v of uniq) {
                try {
                    res = await tryFetch(v)
                    if (res.ok) {
                        folio = v
                        break
                    }
                } catch (err) {
                    // continue
                }
            }
        }

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}))
            throw new Error(payload && (payload.msg || payload.error) ? (payload.msg || payload.error) : `Error obteniendo documentos firmados (status ${res.status})`)
        }

        const json = await res.json()
        console.debug('[ORDER_MANAGEMENT] fetched signed-documents response:', json)
        let docs = (json && json.documents && Array.isArray(json.documents)) ? json.documents : []
        // Ensure we have uploader photos by resolving users list once
        try {
            if (!usersCache.value) {
                const ures = await authedFetch('/api/auth/users')
                if (ures.ok) {
                    const ujson = await ures.json()
                    usersCache.value = Array.isArray(ujson) ? ujson : []
                } else {
                    usersCache.value = []
                }
            }
            if (usersCache.value && usersCache.value.length) {
                docs = docs.map(d => {
                    const uploaderName = String(d.uploader || '').trim()
                    const found = usersCache.value.find(u => (u.nombre && String(u.nombre).trim().toLowerCase()) === uploaderName.toLowerCase())
                    if (found) {
                        // Normalize foto binary/data url like backend
                        const foto = found.foto || null
                        return { ...d, uploaderFoto: foto }
                    }
                    return d
                })
            }
        } catch (e) {
            console.debug('Could not resolve uploader photos:', e)
        }

        signedDocuments.value = docs
        // Ensure docTitle tracks the folio used
        docTitle.value = String(folio)
    } catch (e) {
        console.warn('Error fetching signed documents:', e)
        signedDocuments.value = []
    }
}

function closeDocumentModal() {
    showDocModal.value = false
    docVersions.value = []
    signedDocuments.value = []
    currentPreviewUrl.value = ''
    docTitle.value = ''
    activeDocTab.value = 'generadas'
}

function openUploadModal(order) {
    console.log('[ORDER_MANAGEMENT] openUploadModal called:', order)
    uploadOrderId.value = order?.id
    uploadOrderFolio.value = order?.folio ?? String(order?.id ?? '')
    uploadFile.value = null
    // Fetch order details to detect pending signers
    uploadMissingSigners.value = []
    uploadSignerNames.value = {}
        ; (async () => {
            try {
                const fol = encodeURIComponent(uploadOrderFolio.value)
                const res = await fetch(`/api/ops/salida/${fol}`)
                if (res.ok) {
                    const json = await res.json().catch(() => ({}))
                    const orden = json && json.orden ? json.orden : null
                    if (orden) {
                        const signerKeys = [
                            { key: 'firma_subdireccion_name', label: 'Subdirección' },
                            { key: 'firma_ingeniero_name', label: 'Ingeniero biomédico que atiende' },
                            { key: 'firma_recibe_name', label: 'Quien recibe de IMSS Bienestar' },
                            { key: 'firma_entrega_name', label: 'Proveedor que entrega (empresa)' },
                            { key: 'firma_vigilancia_name', label: 'Coordinación de Vigilancia' }
                        ]
                        const missing = []
                        for (const s of signerKeys) {
                            const val = (orden[s.key] || '').toString().trim()
                            if (!val || val.toUpperCase() === 'PENDING') {
                                missing.push({ key: s.key, label: s.label })
                            }
                        }
                        uploadMissingSigners.value = missing
                        // Initialize empty fields for inputs
                        for (const m of missing) uploadSignerNames.value[m.key] = ''
                    }
                }
            } catch (e) {
                console.warn('Could not fetch order details for upload modal', e)
            } finally {
                showUploadModal.value = true
            }
        })()
}

function closeUploadModal() {
    showUploadModal.value = false
    uploadOrderId.value = null
    uploadOrderFolio.value = ''
    resetUploadState() // <-- Use the new reset function
}

function isImageFile(file) {
    if (!file) return false
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']
    const fileName = file.name.toLowerCase()
    return imageExtensions.some(ext => fileName.endsWith(ext))
}

function isPdfFile(file) {
    if (!file) return false
    return file.name.toLowerCase().endsWith('.pdf')
}

function isDocFile(file) {
    if (!file) return false
    const docExtensions = ['.doc', '.docx', '.odt']
    const fileName = file.name.toLowerCase()
    return docExtensions.some(ext => fileName.endsWith(ext))
}

function getFileExtension(fileName) {
    return fileName.split('.').pop()
}

async function handleFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    processFile(file)
}

function handleFlowbiteDrop(e) {
    dragOverActive.value = false
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
}

function processFile(file) {
    uploadFile.value = file
    pdfPreviewUrl.value = ''
    docPreviewHtml.value = ''
    previewImageUrl.value = ''

    // Si es imagen, generar preview
    if (isImageFile(file)) {
        const reader = new FileReader()
        reader.onload = (e) => {
            previewImageUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
    // Si es PDF, renderizar con PDF.js (blob)
    else if (isPdfFile(file)) {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const pdfData = e.target.result
                const blob = new Blob([pdfData], { type: 'application/pdf' })
                const blobUrl = URL.createObjectURL(blob)
                pdfPreviewUrl.value = blobUrl
            } catch (err) {
                console.error('Error procesando PDF:', err)
            }
        }
        reader.readAsArrayBuffer(file)
    }
    // Si es DOCX, renderizar con Mammoth
    else if (isDocFile(file)) {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result
                const result = await window.mammoth.convertToHtml({ arrayBuffer })
                docPreviewHtml.value = result.value
            } catch (err) {
                console.error('Error procesando DOCX:', err)
            }
        }
        reader.readAsArrayBuffer(file)
    }
}

async function submitUpload() {
    if (!uploadFile.value || !uploadOrderFolio.value) {
        await Swal.fire({ icon: 'warning', title: 'Advertencia', text: 'Por favor selecciona un archivo', ...darkThemeConfig })
        return
    }

    // Si hay firmantes pendientes, validar que se hayan completado los nombres
    if (uploadMissingSigners.value && uploadMissingSigners.value.length) {
        const missing = uploadMissingSigners.value.filter(s => !uploadSignerNames.value[s.key] || !String(uploadSignerNames.value[s.key]).trim())
        if (missing.length) {
            await Swal.fire({ icon: 'warning', title: 'Firmantes pendientes', text: 'Debes completar los nombres de todos los firmantes pendientes antes de subir el archivo.', ...darkThemeConfig })
            return
        }
    }

    isUploading.value = true
    try {
        const formData = new FormData()
        formData.append('file', uploadFile.value)
        // Attach signer names if provided
        if (uploadMissingSigners.value && uploadMissingSigners.value.length) {
            try {
                formData.append('signerNames', JSON.stringify(uploadSignerNames.value || {}))
            } catch (e) { }
        }

        // Try to include uploader info from localStorage and token for backend identification
        const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')||'null') } catch { return null } })()
        const uploaderNameHeader = (storedUser && storedUser.nombre) ? String(storedUser.nombre) : (localStorage.getItem('nombre') || '')
        const token = localStorage.getItem('token') || null

        const fetchOptions = {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {}
        }
        if (uploaderNameHeader) fetchOptions.headers['x-uploader-name'] = uploaderNameHeader
        if (token) fetchOptions.headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`/api/ops/salida/${encodeURIComponent(uploadOrderFolio.value)}/pdfs/upload`, fetchOptions)

        const json = await res.json().catch(() => ({}))

        if (!res.ok) {
            const msg = json && (json.msg || json.error) ? (json.msg || json.error) : 'Error al subir archivo'
            throw new Error(msg)
        }

        // --- NEW ---
        // Set success data to show the new success screen
        uploadSuccessData.value = {
            name: uploadFile.value.name,
            uploader: json.uploader,
            uploadedAt: json.uploadedAt
        }
        // --- END NEW ---

        // Mostrar alerta de éxito
        await Swal.fire({
            icon: 'success',
            title: 'Orden Firmada Subida Correctamente',
            html: `<p>Puedes revisar este documento para descargas y demás con la función de documentos en la sección de <strong>DOCUMENTOS FIRMADOS</strong>.</p>`,
            confirmButtonText: 'Cerrar',
            ...darkThemeConfig
        })

        // Cerrar el modal de upload automáticamente
        closeUploadModal()

        // Actualizar el conteo de documentos para la orden en la tabla
        const orderIndex = allOrders.value.findIndex(o => o.folio === uploadOrderFolio.value)
        if (orderIndex !== -1) {
            try {
                const res = await fetch(`/api/ops/salida/${encodeURIComponent(uploadOrderFolio.value)}/signed-documents`)
                if (res.ok) {
                    const json = await res.json()
                    const count = (json && json.documents && Array.isArray(json.documents)) ? json.documents.length : 0
                    allOrders.value[orderIndex].documentCount = count
                }
            } catch (e) {
                console.warn('Error updating document count:', e)
            }
        }

        // Refrescar la lista de documentos firmados y abrir la modal de documentos
        try {
            // Siempre refrescar signed documents para que el badge y la lista estén actualizados
            await fetchSignedDocuments(uploadOrderFolio.value)

            // Abrir modal de documentos y mostrar la pestaña de firmadas
            docTitle.value = String(uploadOrderFolio.value)
            activeDocTab.value = 'firmadas'
            showDocModal.value = true

            // Intentar seleccionar el documento recién subido
            const uploadedId = json && json.uploadId ? json.uploadId : null
            let selected = null
            if (uploadedId) selected = signedDocuments.value.find(d => String(d.id) === String(uploadedId))
            if (!selected && uploadFile.value && uploadFile.value.name) {
                selected = signedDocuments.value.find(d => d.name === uploadFile.value.name)
            }
            if (selected) {
                selectedPdfId.value = selected.id
                currentPreviewUrl.value = selected.previewUrl || selected.downloadUrl || (`/api${selected.filePath}`)
                currentPreviewType.value = selected.contentType || ''
            }
        } catch (e) {
            console.warn('Error refreshing signed documents after upload:', e)
        }
    } catch (e) {
        await Swal.fire({ icon: 'error', title: 'Error', text: String(e && e.message ? e.message : e), ...darkThemeConfig })
    } finally {
        isUploading.value = false
    }
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
            currentPreviewUrl.value = withAuthQuery(`/api/ops/preview-proxy?folio=${encodeURIComponent(folio)}&version=${encodeURIComponent(v.version)}`)
        } else {
            currentPreviewUrl.value = withAuthQuery(`/api/ops/preview-proxy?folio=${encodeURIComponent(folio)}&id=${encodeURIComponent(v.id)}`)
        }
    } else {
        const base = v.previewUrl || `/api/ops/salida/${encodeURIComponent(folio)}/pdfs/${v.id}/preview`
        currentPreviewUrl.value = withAuthQuery(base)
    }
    selectedPdfId.value = v.id
}

function selectSignedDocument(d) {
    if (!d) return
    // Set selected id
    selectedPdfId.value = d.id

    // Use provided content type when available
    currentPreviewType.value = d.contentType || ''

    // Build preview URL (backend already provides absolute/relative previewUrl)
    let url = d.previewUrl || d.downloadUrl || (d.filePath ? `/api${d.filePath}` : null)
    if (!url) {
        currentPreviewUrl.value = ''
        return
    }

    // For mobile, route through proxy only for generated PDFs/versions; uploaded files are served under /api/uploads
    currentPreviewUrl.value = withAuthQuery(url)
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
    const folioMatch = folio.match(/^([A-Za-z])[-\s_]*(\d+)$/i)
    if (folioMatch) {
        const prefix = `${folioMatch[1].toUpperCase()}-`
        const number = parseInt(folioMatch[2], 10) // Elimina ceros a la izquierda
        return `${prefix}${number}`
    }

    return folio.toLowerCase()
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
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
const filterCantidadMinActive = ref(false)
const filterCantidadMaxActive = ref(false)
const filterAccesorioActive = ref(false)
const filterEstado = ref('')
const filterHoraInicioFrom = ref('')
const filterHoraInicioTo = ref('')
const filterMarca = ref('')
const filterModelo = ref('')
const filterUbicacion = ref('')
const filterClaveHRAEI = ref('')
const filterNoInventarioActive = ref(false)
const filterNoInventario = ref('')
const filterCantidadMin = ref(null)
const filterCantidadMax = ref(null)
const filterAccesorio = ref('')
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
const OpSalidaRef = ref(null)

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
    if (filterMotivoActive.value) list.push({ key: 'motivo', label: 'Motivo de salida', type: 'select', bindings: { modelValue: filterMotivo, 'onUpdate:modelValue': val => filterMotivo.value = val, class: 'control filter-input' } })
    if (filterObservacionesActive.value) list.push({ key: 'obs', label: 'Observaciones', type: 'input', bindings: { modelValue: filterObservaciones, 'onUpdate:modelValue': val => filterObservaciones.value = val, class: 'control filter-input', placeholder: 'Buscar en observaciones' } })
    if (filterIngenieroActive.value) list.push({ key: 'ing', label: 'Ingeniero residente', type: 'input', bindings: { modelValue: filterIngeniero, 'onUpdate:modelValue': val => filterIngeniero.value = val, class: 'control filter-input', placeholder: 'Buscar nombre' } })
    if (filterHoraActive.value) list.push({ key: 'hora', label: 'Hora inicio (rango)', type: 'hora-range', bindings: {} })
    if (filterItemTextActive.value) list.push({ key: 'itemText', label: 'Nombre de equipo', type: 'input', bindings: { modelValue: filterItemText, 'onUpdate:modelValue': val => filterItemText.value = val, class: 'control filter-input', placeholder: 'Ej. Monitor, Ventilador...' } })
    if (filterAccesorioActive.value) list.push({ key: 'accesorio', label: 'Accesorios', type: 'input', bindings: { modelValue: filterAccesorio, 'onUpdate:modelValue': val => filterAccesorio.value = val, class: 'control filter-input', placeholder: 'Ej. Cable, Batería...' } })
    if (filterTipoActive.value) list.push({ key: 'tipo', label: 'Tipo de artículo', type: 'select', bindings: { modelValue: filterTipo, 'onUpdate:modelValue': val => filterTipo.value = val, class: 'control filter-input' } })
    if (filterMarcaActive.value) list.push({ key: 'marca', label: 'Marca', type: 'input', bindings: { modelValue: filterMarca, 'onUpdate:modelValue': val => filterMarca.value = val, class: 'control filter-input', placeholder: 'Ej. Philips, GE...' } })
    if (filterModeloActive.value) list.push({ key: 'modelo', label: 'Modelo', type: 'input', bindings: { modelValue: filterModelo, 'onUpdate:modelValue': val => filterModelo.value = val, class: 'control filter-input', placeholder: 'Ej. MX40...' } })
    if (filterUbicacionActive.value) list.push({ key: 'ubicacion', label: 'Ubicación', type: 'input', bindings: { modelValue: filterUbicacion, 'onUpdate:modelValue': val => filterUbicacion.value = val, class: 'control filter-input', placeholder: 'Ej. UCIA...' } })
    if (filterClaveHRAEIActive.value) list.push({ key: 'claveHRAEI', label: 'Clave HRAEI', type: 'input', bindings: { modelValue: filterClaveHRAEI, 'onUpdate:modelValue': val => filterClaveHRAEI.value = val, class: 'control filter-input', placeholder: 'Ej. COMODATO...' } })
    if (filterNoInventarioActive.value) list.push({ key: 'noInventario', label: 'No. Inventario', type: 'input', bindings: { modelValue: filterNoInventario, 'onUpdate:modelValue': val => filterNoInventario.value = val, class: 'control filter-input', placeholder: 'Ej. 12345' } })
    if (filterCantidadMinActive.value) list.push({ key: 'cantidadMin', label: 'Cantidad mínima', type: 'input', bindings: { modelValue: filterCantidadMin, 'onUpdate:modelValue': val => filterCantidadMin.value = val, class: 'control filter-input', placeholder: 'Mínimo...', type: 'number' } })
    if (filterCantidadMaxActive.value) list.push({ key: 'cantidadMax', label: 'Cantidad máxima', type: 'input', bindings: { modelValue: filterCantidadMax, 'onUpdate:modelValue': val => filterCantidadMax.value = val, class: 'control filter-input', placeholder: 'Máximo...', type: 'number' } })
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
        filterAccesorioActive.value ||
        filterHoraActive.value ||
        filterMarcaActive.value ||
        filterModeloActive.value ||
        filterUbicacionActive.value ||
        filterClaveHRAEIActive.value ||
        filterNoInventarioActive.value ||
        filterCantidadMinActive.value ||
        filterCantidadMaxActive.value
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
        filterNoInventarioActive.value ||
        filterMarca.value ||
        filterModelo.value ||
        filterUbicacion.value ||
        filterClaveHRAEI.value ||
        filterNoInventario.value
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
        const matchMotivo = !filterMotivoActive.value || !filterMotivo.value || ((order.motivoSalida || '').toLowerCase() === filterMotivo.value.toLowerCase())
        const matchObservaciones = !filterObservacionesActive.value || !filterObservaciones.value || ((order.observaciones || '').toLowerCase().includes(filterObservaciones.value.toLowerCase()))
        const matchIngeniero = !filterIngenieroActive.value || !filterIngeniero.value || ((order.nombreIngeniero || '').toLowerCase().includes(filterIngeniero.value.toLowerCase()))
        const matchEstado = !filterEstado.value || (order.estado || '').toLowerCase() === filterEstado.value.toLowerCase()
        const matchHoraFrom = !filterHoraActive.value || !filterHoraInicioFrom.value || (order.horaInicio && order.horaInicio >= filterHoraInicioFrom.value)
        const matchHoraTo = !filterHoraActive.value || !filterHoraInicioTo.value || (order.horaInicio && order.horaInicio <= filterHoraInicioTo.value)

        const matchTipo = !filterTipoActive.value || !filterTipo.value || (order.equiposSalida || []).some(e => e.tipo === filterTipo.value)
        const matchItemText = !filterItemTextActive.value || !filterItemText.value || (order.equiposSalida || []).some(e => {
            const search = filterItemText.value.toLowerCase()
            return String(e.descripcion || e.nombre || '').toLowerCase().includes(search)
                || String(e.modelo || '').toLowerCase().includes(search)
                || String(e.serie || e.lote || '').toLowerCase().includes(search)
                || String(e.marca || '').toLowerCase().includes(search)
        })
        const matchMarca = !filterMarcaActive.value || !filterMarca.value || (order.equiposSalida || []).some(e => {
            const search = filterMarca.value.toLowerCase()
            return String(e.marca || '').toLowerCase().includes(search)
        })
        const matchModelo = !filterModeloActive.value || !filterModelo.value || (order.equiposSalida || []).some(e => {
            const search = filterModelo.value.toLowerCase()
            return String(e.modelo || '').toLowerCase().includes(search)
        })
        const matchUbicacion = !filterUbicacionActive.value || !filterUbicacion.value || (order.equiposSalida || []).some(e => {
            const search = filterUbicacion.value.toLowerCase()
            return String(e.ubicacion || '').toLowerCase().includes(search)
        })
        const matchNoInventario = !filterNoInventarioActive.value || !filterNoInventario.value || (order.equiposSalida || []).some(e => {
            const search = filterNoInventario.value.toLowerCase()
            return String(e.noInventario || e.no_inventario || e['No. Inventario'] || e.N_DE_INVENTARIO || '').toLowerCase().includes(search)
        })
        const matchClaveHRAEI = !filterClaveHRAEIActive.value || !filterClaveHRAEI.value || (order.equiposSalida || []).some(e => {
            const search = filterClaveHRAEI.value.toLowerCase()
            return String(e.claveHRAEI || '').toLowerCase().includes(search)
        })
        const matchAccesorio = !filterAccesorioActive.value || !filterAccesorio.value || (order.equiposSalida || []).some(e => {
            const search = filterAccesorio.value.toLowerCase()
            // Busca en descripción del equipo o en accesorios si existen
            const description = String(e.descripcion || e.nombre || '').toLowerCase()
            return description.includes(search)
        })
        const itemCount = (order.equiposSalida || []).length || 0
        const matchMin = filterMinItems.value == null || filterMinItems.value === '' || itemCount >= Number(filterMinItems.value)
        const matchMax = filterMaxItems.value == null || filterMaxItems.value === '' || itemCount <= Number(filterMaxItems.value)
        const matchCantidadMin = !filterCantidadMinActive.value || filterCantidadMin.value == null || itemCount >= Number(filterCantidadMin.value)
        const matchCantidadMax = !filterCantidadMaxActive.value || filterCantidadMax.value == null || itemCount <= Number(filterCantidadMax.value)
        return matchFolio && matchSolicitante && matchSearch && matchDate && matchService && matchEspecialidad && matchMotivo && matchObservaciones && matchIngeniero && matchTipo && matchItemText && matchAccesorio && matchEstado && matchHoraFrom && matchHoraTo && matchMin && matchMax && matchMarca && matchModelo && matchUbicacion && matchNoInventario && matchClaveHRAEI && matchCantidadMin && matchCantidadMax
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
    console.debug('[OrderManagementSalida] opening create order modal')
    showWizardModal.value = true
}

// Manejar cuando se crea una orden exitosamente desde el wizard
async function onWizardCreated() {
    console.debug('[OrderManagementSalida] order created, closing modal and refreshing')
    showWizardModal.value = false
    // Recargar la lista de órdenes
    await reloadOrdersFromServer()
}

const { confirmAndClose } = useCloseConfirmation({
    title: '¿Cerrar este wizard?',
    message: 'Se perderán los cambios no guardados. ¿Deseas cerrar de todas formas?',
    confirmText: 'Sí, cerrar',
    cancelText: 'Seguir editando',
    icon: 'warning'
})

function discardCurrentWizardDraft() {
    if (!wizardType?.value) return
    try { window.dispatchEvent(new CustomEvent('wizard:draft:discard', { detail: { key: wizardType.value } })) } catch (e) {}
    clearWizardDraft(wizardType.value)
    try { deleteDraftRemote(wizardType.value) } catch (e) { console.warn('[OrderManagementSalida] failed to delete remote draft for', wizardType.value, e) }
}

function requestCloseWizard() {
    confirmAndClose(() => {
        discardCurrentWizardDraft()
        showWizardModal.value = false
    })
}

function closeWizardImmediately() {
    discardCurrentWizardDraft()
    showWizardModal.value = false
}

function goToDashboard() {
    console.debug('[OrderManagement] navigating to dashboard')
    navigateAndRefresh(router, { name: 'dashboard' })
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
        motivo_salida: 'Motivo de salida',
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
            fetch(`/api/ops/salida/${encodeURIComponent(f)}/history`, { cache: 'no-store' }),
            fetch(`/api/ops/salida/${encodeURIComponent(f)}/versions?limit=6`, { cache: 'no-store' })
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

            // snapshots por versión (para render tipo OpSalida)
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
        motivo_salida: 'motivoSalida',
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
            const curRes = await fetch(`/api/ops/salida/${encodeURIComponent(String(folio))}`, { cache: 'no-store' })
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
                fillIfEmpty('motivoSalida', 'motivo_salida')
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
                // For equiposSalida, prefer payload if provided, otherwise reconstruct from server items
                if (!Array.isArray(mergedPayload.equiposSalida) || !mergedPayload.equiposSalida.length) {
                    try {
                        const items = Array.isArray(curBody.items) ? curBody.items : []
                        // map DB items to frontend equiposSalida shape
                        mergedPayload.equiposSalida = items.map(it => ({
                            line: it.line,
                            tipo: it.tipo,
                            consumibleEstado: it.consumible_estado || it.consumibleEstado || null,
                            consumible_estado: it.consumible_estado || it.consumibleEstado || null,
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
        console.log('[OrderManagement] Sending PUT /salida payload.signatures =', mergedPayload.signatures)
        const res = await fetch(`/api/ops/salida/${encodeURIComponent(String(folio))}`, {
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
            const genRes = await fetch(`/api/ops/salida/${encodeURIComponent(folio)}/pdfs/generate-force`)
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
        const res = await fetch('/api/ops/salida/list', { cache: 'no-store' })
        if (!res.ok) {
            allOrders.value = []
            return
        }
        const body = await res.json()
        const items = Array.isArray(body.items) ? body.items : []
        allOrders.value = items.map((wrapper) => {
            const orden = wrapper.orden || {}
            const orderItems = Array.isArray(wrapper.items) ? wrapper.items : []
            const equiposSalida = orderItems.map(item => ({
                id: `${item.orden_folio}-${item.line}`,
                line: item.line,
                tipo: item.tipo || 'N/A',
                consumibleEstado: item.consumible_estado || item.consumibleEstado || null,
                consumible_estado: item.consumible_estado || item.consumibleEstado || null,
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
                motivoSalida: orden.motivo_salida || 'N/A',
                motivoEntrada: orden.motivo_salida || orden.motivoSalida || 'N/A',
                descripcion: orden.descripcion || 'N/A',
                observaciones: orden.observaciones || 'N/A',
                observacionesImg: orden.observaciones_img_path || null,
                nombreIngeniero: orden.nombre_ingeniero || 'N/A',
                equiposSalida,
                equiposEntrada: equiposSalida,
                status: orden.status || orden.estado || 'active',
                estado: 'completado',
                documentCount: 0
            }
        })

        // Cargar conteos de documentos para cada orden
        loadDocumentCountsForOrders()
    } catch (e) {
        console.warn('Error recargando órdenes:', e)
        allOrders.value = []
    } finally {
        loading.value = false
    }
}

async function loadDocumentCountsForOrders() {
    // Cargar conteos de documentos para cada orden de forma paralela
    const documentCountPromises = allOrders.value.map(async (order) => {
        try {
            const res = await fetch(`/api/ops/salida/${encodeURIComponent(order.folio)}/signed-documents`)
            if (res.ok) {
                const json = await res.json()
                const count = (json && json.documents && Array.isArray(json.documents)) ? json.documents.length : 0
                order.documentCount = count
            }
        } catch (e) {
            console.warn(`Error loading documents for ${order.folio}:`, e)
            order.documentCount = 0
        }
    })

    // Ejecutar todas las promesas en paralelo
    await Promise.all(documentCountPromises)
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
    const result = await confirmCancel('¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.')

    if (result.isConfirmed) {
        // Buscar la orden en memoria para obtener su folio real
        const order = allOrders.value.find(o => o.id === orderId)
        const folio = (order && (order.folio || (order.orden && order.orden.folio))) ? (order.folio || order.orden.folio) : null

        if (folio) {
            try {
                const token = localStorage.getItem('token')
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
                const delRes = await fetch(`/api/ops/salida/${encodeURIComponent(folio)}`, { method: 'DELETE', headers })
                if (!delRes.ok) {
                    let body = null
                    try { body = await delRes.json() } catch (_) { body = await delRes.text().catch(() => '') }
                    const msgText = (body && (body.msg || body.error)) ? (body.msg || body.error) : ''
                    if (String(msgText).toLowerCase().includes('cancel')) {
                        try { await reloadOrdersFromServer() } catch (e) {
                            const localOrder = allOrders.value.find(o => o.id === orderId)
                            if (localOrder) localOrder.status = 'cancelled'
                            try { const raw = localStorage.getItem('orders_list'); if (raw) { const arr = JSON.parse(raw); const idx = arr.findIndex(o => String(o.id) === String(orderId)); if (idx !== -1) { arr[idx].status = 'cancelled'; localStorage.setItem('orders_list', JSON.stringify(arr)) } } } catch (e) {}
                        }
                        await showAlert({ title: 'Atención', text: 'Orden ya está cancelada', icon: 'info' })
                        return
                    }
                    showError('Error servidor', `No se pudo cancelar la orden en el servidor: ${delRes.status} ${JSON.stringify(body)}`)
                    return
                }
            } catch (e) {
                console.warn('Error contacting server for cancel, marking locally as cancelled:', e)
                await showAlert({ title: 'Atención', text: 'No fue posible contactar al servidor para confirmar la cancelación. La orden se marcará como cancelada localmente.', icon: 'warning' })
                const localOrder = allOrders.value.find(o => o.id === orderId)
                if (localOrder) localOrder.status = 'cancelled'
                try { const raw = localStorage.getItem('orders_list'); if (raw) { const arr = JSON.parse(raw); const idx = arr.findIndex(o => String(o.id) === String(orderId)); if (idx !== -1) { arr[idx].status = 'cancelled'; localStorage.setItem('orders_list', JSON.stringify(arr)) } } } catch (e) {}
            }
        }
        try { await reloadOrdersFromServer(); showSuccess('Cancelada', 'La orden ha sido cancelada correctamente.') } catch (e) { const localOrder = allOrders.value.find(o => o.id === orderId); if (localOrder) localOrder.status = 'cancelled'; try { const raw = localStorage.getItem('orders_list'); if (raw) { const arr = JSON.parse(raw); const idx = arr.findIndex(o => String(o.id) === String(orderId)); if (idx !== -1) { arr[idx].status = 'cancelled'; localStorage.setItem('orders_list', JSON.stringify(arr)) } } } catch (e) {} showSuccess('Cancelada', 'La orden ha sido cancelada (marcada localmente).') }
    }
}

async function handleDeleteMultipleWithModal(orderIds) {
    const count = orderIds.length
    const msg = `¿Está seguro de que deseas cancelar ${count} orden${count !== 1 ? 'es' : ''}? Esta acción no se puede deshacer.`

    const result = await confirmCancel(msg, count)

    if (result.isConfirmed) {
        await deleteMultipleOrders(orderIds)

        const successMsg = `${count} orden${count !== 1 ? 'es' : ''} ha${count !== 1 ? 'n' : ''} sido eliminada${count !== 1 ? 's' : ''} correctamente.`
        showSuccess('Eliminado', successMsg)
    }
}

async function deleteMultipleOrders(orderIds) {
    const count = orderIds.length
    const targets = allOrders.value.filter(o => orderIds.includes(o.id))
    const folioMap = {}
    targets.forEach(t => {
        const folio = t.folio || (t.orden && t.orden.folio)
        if (folio) folioMap[folio] = t.id
    })

    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    const results = await Promise.allSettled(Object.keys(folioMap).map(async (folio) => {
        try {
            const res = await fetch(`/api/ops/salida/${encodeURIComponent(folio)}`, { method: 'DELETE', headers })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return { folio, ok: true }
        } catch (e) {
            return { folio, ok: false, error: String(e) }
        }
    }))

    const succeededFolios = results.filter(r => r.status === 'fulfilled' && r.value && r.value.ok).map(r => r.value.folio)
    const succeededIds = succeededFolios.map(f => folioMap[f]).filter(Boolean)

    try {
        if (succeededIds.length > 0) {
            await reloadOrdersFromServer()
            console.log(`${succeededIds.length} orden(es) cancelada(s):`, succeededIds)
            return
        }
    } catch (e) {
        console.warn('Error reloading after multiple cancels:', e)
    }

    // Fallback: marcar localmente como canceladas
    allOrders.value.forEach(o => { if (succeededIds.includes(o.id)) o.status = 'cancelled' })
    try {
        const raw = localStorage.getItem('orders_list')
        if (raw) {
            const arr = JSON.parse(raw)
            let changed = false
            arr.forEach(a => { if (succeededIds.includes(a.id)) { a.status = 'cancelled'; changed = true } })
            if (changed) localStorage.setItem('orders_list', JSON.stringify(arr))
        }
    } catch (e) {
        console.warn('Error updating localStorage after multi-cancel fallback:', e)
    }

    const failed = results.filter(r => !(r.status === 'fulfilled' && r.value && r.value.ok))
    if (failed.length) {
        await showAlert({ title: 'Atención', text: `${failed.length} cancelación(es) fallaron. Revisa permisos/conectividad.`, icon: 'warning' })
    }
}

async function tryPersistUpdatedOrder(order) {
    try {
        const res = await fetch('/api/ops/salida', {
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
    filterAccesorio.value = ''
    filterAccesorioActive.value = false
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
    filterNoInventario.value = ''
    filterClaveHRAEIActive.value = false
    filterCantidadMin.value = null
    filterCantidadMinActive.value = false
    filterCantidadMax.value = null
    filterCantidadMaxActive.value = false
    // do not automatically close the panel when clearing — allow user to adjust further
}

function clearAllFilters() {
    clearFilters()
    showMoreFilters.value = false
}

function removeActiveFilter(key) {
    if (key === 'folio') filterFolio.value = ''
    else if (key === 'solicitante') filterSolicitante.value = ''
    else if (key === 'fecha') {
        filterDate.value = ''
        filterDateDisplay.value = ''
    }
    if (key === 'service') filterServiceActive.value = false
    else if (key === 'especialidad') filterEspecialidadActive.value = false
    else if (key === 'motivo') filterMotivoActive.value = false
    else if (key === 'obs') filterObservacionesActive.value = false
    else if (key === 'ing') filterIngenieroActive.value = false
    else if (key === 'tipo') filterTipoActive.value = false
    else if (key === 'itemText') filterItemTextActive.value = false
    else if (key === 'accesorio') filterAccesorioActive.value = false
    else if (key === 'hora') filterHoraActive.value = false
    else if (key === 'marca') filterMarcaActive.value = false
    else if (key === 'modelo') filterModeloActive.value = false
    else if (key === 'ubicacion') filterUbicacionActive.value = false
    else if (key === 'claveHRAEI') filterClaveHRAEIActive.value = false
    else if (key === 'noInventario') filterNoInventarioActive.value = false
    else if (key === 'cantidadMin') filterCantidadMinActive.value = false
    else if (key === 'cantidadMax') filterCantidadMaxActive.value = false
}

function activateFilter(key) {
    if (key === 'service') filterServiceActive.value = true
    else if (key === 'especialidad') filterEspecialidadActive.value = true
    else if (key === 'motivo') filterMotivoActive.value = true
    else if (key === 'obs') filterObservacionesActive.value = true
    else if (key === 'ing') filterIngenieroActive.value = true
    else if (key === 'tipo') filterTipoActive.value = true
    else if (key === 'itemText') filterItemTextActive.value = true
    else if (key === 'accesorio') filterAccesorioActive.value = true
    else if (key === 'hora') filterHoraActive.value = true
    else if (key === 'marca') filterMarcaActive.value = true
    else if (key === 'modelo') filterModeloActive.value = true
    else if (key === 'ubicacion') filterUbicacionActive.value = true
    else if (key === 'claveHRAEI') filterClaveHRAEIActive.value = true
    else if (key === 'noInventario') filterNoInventarioActive.value = true
    else if (key === 'cantidadMin') filterCantidadMinActive.value = true
    else if (key === 'cantidadMax') filterCantidadMaxActive.value = true
}

const orderSearchFilters = {
    fieldBindings: {
        folio: filterFolio,
        solicitante: filterSolicitante,
        fecha: filterDateDisplay,
        service: filterService,
        especialidad: filterEspecialidad,
        motivo: filterMotivo,
        obs: filterObservaciones,
        ing: filterIngeniero,
        itemText: filterItemText,
        accesorio: filterAccesorio,
        tipo: filterTipo,
        marca: filterMarca,
        modelo: filterModelo,
        ubicacion: filterUbicacion,
        claveHRAEI: filterClaveHRAEI,
        noInventario: filterNoInventario,
        cantidadMin: filterCantidadMin,
        cantidadMax: filterCantidadMax
    },
    activeFiltersList,
    chipsList: computed(() => {
        const chips = []
        if (filterFolio.value) chips.push({ key: 'folio', label: 'Folio de operación', value: filterFolio.value, bindings: { modelValue: filterFolio } })
        if (filterSolicitante.value) chips.push({ key: 'solicitante', label: 'Nombre del solicitante', value: filterSolicitante.value, bindings: { modelValue: filterSolicitante } })
        if (filterDate.value || filterDateDisplay.value) chips.push({ key: 'fecha', label: 'Fecha', value: filterDateDisplay.value || filterDate.value, bindings: { modelValue: filterDateDisplay } })
        return [...chips, ...activeFiltersList.value]
    }),
    hasActiveFilters,
    clearAllFilters,
    removeFilter: removeActiveFilter,
    activateFilter,
    suggestionsByField: computed(() => {
        const buckets = {}
        const orders = Array.isArray(allOrders.value) ? allOrders.value : []
        const addBucket = (key, values, limit = 5000) => {
            const map = new Map()
            for (const raw of values) {
                const value = String(raw || '').trim()
                if (!value) continue
                const normalized = key === 'folio' ? normalizeFolio(value) : normalizeText(value)
                if (!normalized) continue
                const existing = map.get(normalized)
                if (existing) existing.count += 1
                else map.set(normalized, { value, label: value, count: 1 })
            }
            buckets[key] = Array.from(map.values())
                .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
                .slice(0, limit)
        }
        const getItemValues = (selector) => orders.flatMap(order => selector(order) || [])
        addBucket('folio', orders.map(order => order.folio))
        addBucket('solicitante', orders.map(order => order.nombreSolicitante))
        addBucket('service', orders.map(order => order.servicio))
        addBucket('especialidad', orders.map(order => order.especialidad))
        addBucket('motivo', orders.map(order => order.motivoSalida || order.motivo))
        addBucket('obs', orders.map(order => order.observaciones))
        addBucket('ing', orders.map(order => order.nombreIngeniero))
        addBucket('itemText', getItemValues(order => (order.equiposSalida || []).flatMap(item => [
            item.descripcion || item.nombre || item.label,
            item.modelo,
            item.serie,
            item.lote,
            item.marca,
            item.noInventario || item.no_inventario || item.inventario
        ]).filter(Boolean)))
        addBucket('accesorio', getItemValues(order => (order.equiposSalida || []).filter(item => String(item.tipo || '').toLowerCase().includes('acces')).map(item => item.descripcion || item.nombre || item.label)))
        addBucket('tipo', getItemValues(order => (order.equiposSalida || []).map(item => item.tipo)))
        addBucket('marca', getItemValues(order => (order.equiposSalida || []).map(item => item.marca)))
        addBucket('modelo', getItemValues(order => (order.equiposSalida || []).map(item => item.modelo)))
        addBucket('ubicacion', getItemValues(order => (order.equiposSalida || []).map(item => item.ubicacion)))
        addBucket('claveHRAEI', getItemValues(order => (order.equiposSalida || []).map(item => item.claveHRAEI || item.clave_hraei || item.clave)))
        addBucket('noInventario', getItemValues(order => (order.equiposSalida || []).map(item => item.noInventario || item.no_inventario || item.inventario)))
        return buckets
    })
}

function applyFilters() {
    // Currently filters are reactive; applying just closes the panel to show results
    showMoreFilters.value = false
}

function addEditItem() {
    if (!editingOrder.value) return
    const copy = JSON.parse(JSON.stringify(newEditItem.value))
    if (!editingOrder.value.equiposSalida) editingOrder.value.equiposSalida = []
    editingOrder.value.equiposSalida.push(copy)
    // reset
    newEditItem.value = { tipo: '', cantidad: 1, descripcion: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', claveHRAEI: '', unidades: [] }
}

async function removeEditItem(idx) {
    if (!editingOrder.value) return
    const result = await confirmDelete('Eliminar artículo', '¿Eliminar este artículo de la orden?')
    if (result.isConfirmed) {
        editingOrder.value.equiposSalida.splice(idx, 1)
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

/* Estilos compatibles con OpSalida en la modal */
.op-salida-modal-full .section-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.op-salida-modal-full .section-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(46, 221, 90, 0.15);
}

.op-salida-modal-full .section-card.combined-card {
    display: flex;
    flex-direction: column;
}

.op-salida-modal-full .section-head {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.op-salida-modal-full .section-head h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
}

.op-salida-modal-full .section-head .hint {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
}

.op-salida-modal-full .section-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
}

.op-salida-modal-full .section-grid.combined {
    grid-template-columns: repeat(6, 1fr);
}

.op-salida-modal-full .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.op-salida-modal-full .field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.op-salida-modal-full .control,
.op-salida-modal-full input[type="text"],
.op-salida-modal-full input[type="date"],
.op-salida-modal-full input[type="time"],
.op-salida-modal-full textarea,
.op-salida-modal-full select {
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-family: inherit;
}

.op-salida-modal-full .control::placeholder,
.op-salida-modal-full input::placeholder,
.op-salida-modal-full textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.op-salida-modal-full .control:focus,
.op-salida-modal-full input:focus,
.op-salida-modal-full textarea:focus,
.op-salida-modal-full select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(46, 221, 90, 0.5);
    box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.op-salida-modal-full .control:disabled,
.op-salida-modal-full input:disabled,
.op-salida-modal-full textarea:disabled,
.op-salida-modal-full select:disabled {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
}

.op-salida-modal-full textarea {
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

/* ===== Contención y truncado para previews y firmas (evita overflow en mobile/tablet) =====
   - Establece `min-width: 0` en contenedores flex/grid para permitir que hijos encojan.
   - Prioriza ellipsis en títulos y wrapping para descripciones.
   - Limita imágenes/iframes con `max-width:100%` y `max-height` para que no empujen la card.
*/

/* Signed docs: items grid adaptativo */
.signed-docs-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
}

.signed-docs-list .signed-doc-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0; /* permite que hijos encojan en flex context */
    overflow: hidden; /* contenedor límite real */
}

.signed-docs-list .doc-item-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* títulos: ellipsis prioritario */
}
.signed-docs-list .doc-item-meta {
    white-space: normal; /* metadatos: permiten wrapping */
    overflow-wrap: anywhere;
    font-size: 0.9rem;
}

/* Previews: imágenes y iframes nunca exceden el ancho de la card */
.signed-docs-list .signed-doc-item img,
.signed-docs-list .signed-doc-item iframe,
.pdf-frame,
.preview-image,
.pdf-iframe {
    max-width: 100%;
    height: auto;
    max-height: 46vh; /* limita altura para no empujar el layout */
    object-fit: contain;
    display: block;
}

/* Upload dropzone / preview containment */
.upload-dropzone-wrapper .upload-dropzone-container,
.upload-dropzone-wrapper .upload-preview,
.upload-dropzone-wrapper .selected-file-info {
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden; /* evita que elementos internos salgan de la card */
}

.upload-preview { min-width: 0; }
.file-details, .file-info-card { min-width: 0; }
.file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-size { font-size: 0.85rem; color: rgba(255,255,255,0.6); }

/* Contención de iframe PDF en upload preview */
.pdf-viewer-container .pdf-iframe { width: 100%; height: 40vh; max-height: 50vh; border: 0; }

/* Firmantes: inputs siempre visibles y responsivos */
.signers-inputs, .signer-inputs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.signer-input-group, .signer {
    flex: 1 1 160px; /* encoje si hace falta, no rompe el layout */
    min-width: 0; /* crítico para evitar overflow por inputs largos */
}
.signer-input-group input { width: 100%; box-sizing: border-box; overflow-wrap: anywhere }

/* Botones y badges: compactación en mobile */
.tab-badge, .action-badge, .documents-badge { display: inline-block; white-space: nowrap; }
@media (max-width: 420px) {
    .signed-docs-list { grid-template-columns: 1fr; }
    .upload-actions button span { display: none } /* icon-only on very small widths */
    .tab-badge, .action-badge, .documents-badge { font-size: 12px; padding: 4px 8px }
}

/* Small utility: ensure any flex child can shrink to avoid forcing parent width */
.orders-table td > *,
.orders-table td, .doc-item-content, .file-details { min-width: 0 }

/* ===== End containment styles ===== */

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

.doc-tabs {
    display: flex;
    gap: 0;
    padding: 0 12px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.1);
    margin-bottom: 0;
}

.doc-tab {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: transparent;

.tab-badge {
    display: inline-block;
    background: #ef4444;
    color: #fff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 999px;
    margin-left: 8px;
}
    color: rgba(226, 232, 240, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
    position: relative;
}

.doc-tab:hover {
    color: rgba(226, 232, 240, 0.9);
    background: rgba(59, 130, 246, 0.05);
}

.doc-tab.active {
    color: rgba(59, 130, 246, 1);
    border-bottom-color: rgba(59, 130, 246, 1);
}

.doc-tab svg {
    width: 16px;
    height: 16px;
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

/* Upload modal shell */
.upload-modal-shell {
    position: relative;
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

/* Estilos para documentos firmados */
.signed-docs-list {
    gap: 10px;
}

.signed-doc-item {
    background: rgba(34, 197, 94, 0.08) !important;
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
}

.signed-doc-item:hover {
    background: rgba(34, 197, 94, 0.12) !important;
    border-color: rgba(34, 197, 94, 0.4) !important;
}

.signed-doc-item.active {
    background: rgba(34, 197, 94, 0.2) !important;
    border-color: rgba(34, 197, 94, 0.5) !important;
}

.signed-doc-icon {
    color: rgba(34, 197, 94, 0.8) !important;
}

.uploader-badge {
    display: inline-block;
    padding: 2px 6px;
    background: rgba(34, 197, 94, 0.15);
    border-radius: 4px;
    color: rgba(34, 197, 94, 0.9);
    font-weight: 500;
}

.uploader-info { display:inline-flex; align-items:center; gap:8px }
.uploader-avatar { width:32px; height:32px; border-radius:50%; object-fit:cover }
.uploader-avatar.placeholder { display:inline-flex; align-items:center; justify-content:center; background:#e6eefb; color:#2b6cb0; width:32px; height:32px; border-radius:50%; font-weight:700 }
.uploader-name { margin-left:6px; font-weight:600 }

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
        /* REMOVED transform scale: using transform to scale the whole container
           reserved the original layout box, producing empty visual space below
           the content on some mobile browsers (ghost vertical scroll). Setting
           transform to none ensures the document flow height matches visual
           content. Keep width/padding to control content size instead. */
        transform: none;
        -webkit-transform: none;
        transform-origin: initial;
        -webkit-transform-origin: initial;
        max-width: 1200px;
        width: 100%;
        padding: 0 12px;
        margin: 0 auto;
    }
}

/* ===== UPLOAD MODAL STYLES ===== */
.upload-modal-shell {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
    background: rgba(13, 20, 35, 0.95);
    border-radius: 16px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    position: relative;
    animation: modalFadeIn 0.5s ease-out;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.upload-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.upload-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: rgba(226, 232, 240, 0.95);
    margin: 0;
    letter-spacing: -0.025em;
}

.upload-subtitle {
    font-size: 1rem;
    color: rgba(226, 232, 240, 0.7);
    margin: 0;
    font-weight: 500;
}

.upload-subtitle strong {
    color: rgba(226, 232, 240, 0.9);
    font-weight: 700;
}

.upload-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.upload-content-full {
    display: flex;
    flex-direction: column;
    gap: 16px;
    /* On wide screens keep a tall scrollable area inside the modal; on small screens allow auto height
       to avoid creating ghost vertical scroll in the page (min-height values below can push page height). */
    height: calc(90vh - 160px);
    max-height: 80vh;
    overflow-y: auto;
}

.upload-dropzone-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
}

.upload-dropzone-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.04));
    border: 3px dashed rgba(249, 115, 22, 0.4);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 400px;
    position: relative;
    overflow: hidden;
}

.upload-dropzone-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.02), rgba(249, 115, 22, 0.01));
    opacity: 0;
    transition: opacity 0.4s ease;
}

.upload-dropzone-container:hover {
    border-color: rgba(249, 115, 22, 0.6);
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(249, 115, 22, 0.08));
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(249, 115, 22, 0.15);
}

.upload-dropzone-container:hover::before {
    opacity: 1;
}

.upload-dropzone-container.is-drag-active {
    border-color: rgba(249, 115, 22, 0.8);
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(249, 115, 22, 0.12));
    box-shadow: 0 0 40px rgba(249, 115, 22, 0.3);
    transform: scale(1.02);
}

.upload-dropzone-container.is-drag-active::before {
    opacity: 1;
}

.dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    z-index: 1;
}

.dropzone-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    border: 2px solid rgba(249, 115, 22, 0.3);
    transition: all 0.4s ease;
}

.upload-dropzone-container:hover .dropzone-icon-wrapper {
    background: rgba(249, 115, 22, 0.1);
    border-color: rgba(249, 115, 22, 0.5);
    transform: scale(1.1);
}

.upload-dropzone-container.is-drag-active .dropzone-icon-wrapper {
    background: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.7);
    transform: scale(1.2);
}

.dropzone-icon {
    width: 40px;
    height: 40px;
    color: rgba(249, 115, 22, 0.7);
    transition: all 0.4s ease;
}

.upload-dropzone-container:hover .dropzone-icon {
    color: rgba(249, 115, 22, 0.9);
    transform: translateY(-4px);
}

.upload-dropzone-container.is-drag-active .dropzone-icon {
    color: rgba(249, 115, 22, 1);
    transform: translateY(-8px);
}

.dropzone-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
}

.dropzone-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: rgba(226, 232, 240, 0.95);
    margin: 0;
    letter-spacing: -0.025em;
}

.dropzone-subtitle {
    font-size: 1.1rem;
    color: rgba(226, 232, 240, 0.75);
    margin: 0;
    font-weight: 500;
}

.dropzone-link {
    color: rgba(249, 115, 22, 0.9);
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: rgba(249, 115, 22, 0.5);
    transition: all 0.3s ease;
}

.dropzone-link:hover {
    color: rgba(249, 115, 22, 1);
    text-decoration-color: rgba(249, 115, 22, 0.8);
}

.dropzone-formats {
    font-size: 0.9rem;
    color: rgba(226, 232, 240, 0.5);
    margin: 0;
    font-weight: 400;
}

.selected-file-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    animation: slideInUp 0.4s ease-out;
}

.file-info-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.1), rgba(46, 221, 90, 0.05));
    border: 1px solid rgba(46, 221, 90, 0.25);
    border-radius: 12px;
    color: rgba(226, 232, 240, 0.9);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(46, 221, 90, 0.1);
}

.file-info-card:hover {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(46, 221, 90, 0.08));
    border-color: rgba(46, 221, 90, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(46, 221, 90, 0.15);
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.file-info-card svg {
    flex-shrink: 0;
    color: rgba(46, 221, 90, 0.7);
}

.file-preview-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
}

.preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.04));
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 8px;
    /* Keep previews usable but avoid forcing large min-heights on small viewports */
    min-height: 240px;
    max-height: 60vh;
    overflow: auto;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
    border-radius: 6px;
    object-fit: contain;
}

.file-icon-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.file-icon-preview svg {
    width: 80px;
    height: 80px;
}

.file-icon-preview span {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.pdf-preview svg {
    color: rgba(239, 68, 68, 0.9);
    filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
}

.pdf-preview span {
    color: rgba(239, 68, 68, 0.95);
}

.doc-preview svg {
    color: rgba(59, 130, 246, 0.9);
    filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
}

.doc-preview span {
    color: rgba(59, 130, 246, 0.95);
}

.generic-preview svg {
    color: rgba(148, 163, 184, 0.9);
    filter: drop-shadow(0 4px 12px rgba(148, 163, 184, 0.3));
}

.generic-preview span {
    color: rgba(148, 163, 184, 0.95);
}

.pending-signers-section {
    padding: 24px;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
    border: 1px solid rgba(249, 115, 22, 0.25);
    border-radius: 12px;
    margin-top: 24px;
}

.signers-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(226, 232, 240, 0.95);
    margin: 0 0 8px 0;
}

.signers-subtitle {
    font-size: 0.95rem;
    color: rgba(226, 232, 240, 0.75);
    margin: 0 0 16px 0;
    line-height: 1.5;
}

.signers-inputs {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.signer-input-group {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.signer-input-group:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(249, 115, 22, 0.3);
}

.signer-label {
    min-width: 140px;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.9);
    font-size: 0.95rem;
}

.upload-success-full {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
}

.success-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.08), rgba(46, 221, 90, 0.04));
    border: 2px solid rgba(46, 221, 90, 0.3);
    border-radius: 12px;
    max-width: 600px;
}



.file-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    background: rgba(46, 221, 90, 0.08);
    border: 1px solid rgba(46, 221, 90, 0.2);
    border-radius: 6px;
}

.file-info {
    display: flex;
    gap: 12px;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.file-info svg {
    flex-shrink: 0;
    color: rgba(46, 221, 90, 0.7);
}

.file-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.file-name {
    font-weight: 500;
    color: rgba(226, 232, 240, 0.9);
    margin: 0;
    font-size: 0.9rem;
    word-break: break-word;
}

.file-size {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.6);
    margin: 0;
}

.btn-remove-file {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.2);
    color: rgba(255, 107, 107, 0.7);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-remove-file:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.4);
    color: rgba(255, 107, 107, 0.9);
}

.upload-footer {
    display: flex;
    gap: 16px;
    justify-content: center;
    padding-top: 32px;
    margin-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-submit {
    padding: 14px 28px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 140px;
    position: relative;
    overflow: hidden;
}

.btn-cancel {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(226, 232, 240, 0.8);
}

.btn-cancel:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(226, 232, 240, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1);
}

.btn-submit {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1));
    border-color: rgba(249, 115, 22, 0.4);
    color: rgba(249, 115, 22, 0.9);
}

.btn-submit:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.2));
    border-color: rgba(249, 115, 22, 0.6);
    color: rgba(249, 115, 22, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.2);
}

.btn-cancel:disabled,
.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.loading-text {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.loading-text svg {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}





/* PDF Viewer Container */
.pdf-viewer-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    overflow: hidden;
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 6px;
}

/* DOCX Viewer Container */
.doc-viewer-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(226, 232, 240, 0.9);
}

.doc-viewer-container p {
    margin: 12px 0;
    color: rgba(226, 232, 240, 0.85);
}

.doc-viewer-container h1,
.doc-viewer-container h2,
.doc-viewer-container h3,
.doc-viewer-container h4,
.doc-viewer-container h5,
.doc-viewer-container h6 {
    margin: 16px 0 8px 0;
    color: rgba(226, 232, 240, 0.95);
    font-weight: 600;
}

.doc-viewer-container strong {
    color: rgba(226, 232, 240, 0.95);
}

.doc-viewer-container em {
    color: rgba(226, 232, 240, 0.8);
}

.doc-viewer-container ul,
.doc-viewer-container ol {
    margin: 12px 0 12px 24px;
    color: rgba(226, 232, 240, 0.85);
}





.success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: rgba(46, 221, 90, 0.15);
    border-radius: 50%;
    color: rgba(46, 221, 90, 0.8);
    animation: pulse-success 2s ease-in-out infinite;
}

.success-icon svg {
    width: 32px;
    height: 32px;
}

@keyframes pulse-success {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.success-title {
    font-size: 1rem;
    font-weight: 700;
    color: rgba(46, 221, 90, 0.9);
    margin: 0;
}

.uploaded-image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(46, 221, 90, 0.2);
    border-radius: 6px;
    overflow: hidden;
}

.uploaded-preview-image {
    max-width: 100%;
    max-height: 350px;
    border-radius: 4px;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.uploaded-file-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.file-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
}

.file-type-badge svg {
    width: 18px;
    height: 18px;
}

.pdf-badge {
    background: rgba(239, 68, 68, 0.15);
    color: rgba(239, 68, 68, 0.9);
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.doc-badge {
    background: rgba(59, 130, 246, 0.15);
    color: rgba(59, 130, 246, 0.9);
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.uploaded-file-name {
    font-size: 0.95rem;
    color: rgba(226, 232, 240, 0.85);
    margin: 0;
    word-break: break-word;
    max-width: 100%;
}

/* Upload modal full-overlay for drag-and-drop */
.upload-drop-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(2, 6, 23, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 120;
    border-radius: 16px;
    transition: opacity 0.3s ease;
    pointer-events: auto;
}

.upload-drop-overlay .overlay-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #ffffff;
    font-weight: 800;
    font-size: 1.25rem;
    padding: 24px 32px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    animation: overlay-pulse 2s ease-in-out infinite;
}

@keyframes overlay-pulse {

    0%,
    100% {
        transform: scale(1);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    50% {
        transform: scale(1.02);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }
}

/* ===== FEEDBACK VISUAL ESPECÍFICO PARA SALIDAS ===== */
/* Animación de éxito para operaciones de salida */
@keyframes success-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Highlight para items de salida */
.orders-table tbody tr.salida-row {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.02));
    border-left: 3px solid rgba(239, 68, 68, 0.4);
}

.orders-table tbody tr.salida-row:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
    border-left-color: rgba(239, 68, 68, 0.6);
}

/* Badge especial para salidas */
.badge-salida {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.4);
    animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
}

/* Botón crear orden de salida con estilo distintivo */
.btn-create-order {
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-create-order:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Loading state con feedback visual mejorado */
.loading-overlay-salida {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
}

.loading-spinner-salida {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(239, 68, 68, 0.2);
    border-top-color: #ef4444;
    border-radius: 50%;
    animation: spin-salida 0.8s linear infinite;
}

@keyframes spin-salida {
    to { transform: rotate(360deg); }
}

/* Toast notifications para salidas */
.toast-salida {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.9));
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
    animation: slide-in-toast 0.3s ease-out;
    z-index: 10000;
}

@keyframes slide-in-toast {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Indicador visual de operación de salida activa */
.salida-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
    animation: pulse-indicator 2s ease-in-out infinite;
}

@keyframes pulse-indicator {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

/* Wizard Modal Styles */
.wizard-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 18000;
    padding: 20px;
}

.wizard-modal-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    max-height: 92vh;
    background: #0a0f1a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: wizardModalIn 0.3s ease-out;
}

@keyframes wizardModalIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.wizard-modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.15);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.wizard-modal-close:hover {
    background: rgba(239, 68, 68, 0.3);
}

.wizard-modal-close svg {
    stroke: rgba(239, 68, 68, 0.9);
}

.wizard-modal-content {
    height: 92vh;
    max-height: 92vh;
    overflow-y: auto;
}

.wizard-modal-content::-webkit-scrollbar {
    width: 8px;
}

.wizard-modal-content::-webkit-scrollbar-track {
    background: rgba(59, 130, 246, 0.08);
}

.wizard-modal-content::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 4px;
}

.wizard-modal-content::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
}

/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

@media (max-width: 768px) {
    .wizard-modal-overlay {
        padding: 10px;
    }
    
    .wizard-modal-container {
        max-height: 95vh;
        border-radius: 12px;
    }
    
    .wizard-modal-content {
        max-height: 95vh;
    }
}
</style>

