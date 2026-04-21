<template>
    <div class="orders-table-container">
        <!-- Multi-delete toggle and delete selected button -->
        <div v-if="paginatedOrders.length > 0" class="multi-delete-toolbar">
            <div class="toolbar-left">
                <!-- Toggle de eliminación múltiple - solo visible para usuarios con permisos -->
                <label v-if="canDeleteOrder" class="toggle-switch">
                    <input type="checkbox" v-model="multiDeleteMode" />
                    <span class="slider"></span>
                    <span class="toggle-label">Cancelar varios</span>
                </label>
                <span v-if="multiDeleteMode && selectedForDelete.size > 0" class="selected-count">
                    {{ selectedForDelete.size }} seleccionado{{ selectedForDelete.size !== 1 ? 's' : '' }}
                </span>
            </div>
            <!-- Botón eliminar seleccionadas - solo visible para usuarios con permisos -->
            <button v-if="multiDeleteMode && selectedForDelete.size > 0 && canDeleteOrder" @click="deleteSelected"
                class="btn-delete-selected">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                    </path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Cancelar seleccionadas ({{ selectedForDelete.size }})
            </button>
        </div>

        <!-- Table Wrapper -->
        <div class="table-surface">
            <div v-if="paginatedOrders.length > 0" class="orders-table-scroll">
            <table class="orders-table">
                <thead>
                    <tr>
                        <th v-if="multiDeleteMode && (canDeleteOrder?.value ?? canDeleteOrder)" class="checkbox-col">
                            <input type="checkbox" :checked="allSelectedOnPage" @change="toggleSelectAllOnPage"
                                class="header-checkbox" />
                        </th>
                        <template v-for="col in visibleColumns" :key="col.key">
                            <th :class="col.headerClass || ''">{{ col.label }}</th>
                        </template>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="order in paginatedOrders" :key="order.id">
                        <!-- Fila principal de la orden con botón de accordion (renderizada según visibleColumns para asegurar alineación) -->
                        <tr class="table-row"
                            :class="{
                                'row-selected': selectedForDelete.has(order.id),
                                'row-has-external': hasExternalItems(order),
                                'row-has-history': hasHistoryInOrder(order),
                                'row-cancelled': isOrderCancelled(order)
                            }">
                            <td v-if="multiDeleteMode && (canDeleteOrder?.value ?? canDeleteOrder)" class="checkbox-cell" data-label="Seleccionar">
                                <input type="checkbox" :checked="selectedForDelete.has(order.id)"
                                    @change="toggleOrderSelection(order.id)" class="row-checkbox" />
                            </td>

                            <template v-for="col in visibleColumns" :key="col.key">
                                <td :data-label="col.label" :class="getColClass(col.key)">
                                    <template v-if="col.key === 'folio'">
                                        <div class="folio-with-accordion">
                                            <button v-if="getOrderItems(order).length > 0"
                                                @click="toggleAccordion(order.id)" class="accordion-toggle"
                                                :class="{ 'expanded': expandedAccordions.has(order.id) }" title="Ver artículos">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2">
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </button>
                                            <span class="folio-text">{{ order.folio }}</span>
                                            <div class="order-status-badge-group">
                                                <span v-if="isOrderExternal(order) && !isOrderCancelled(order)" class="order-external-badge" title="Contiene equipos externos">
                                                    Equipo externo ({{ getExternalItemCount(order) }})
                                                </span>
                                                <span v-if="hasHistoryInOrder(order) && !isOrderCancelled(order)" class="order-history-badge" title="Movimientos previos cargados">
                                                    Historial ({{ getHistoryItemCount(order) }})
                                                </span>
                                                <span v-if="!hasExternalItems(order) && !hasHistoryInOrder(order) && !isOrderCancelled(order)" class="order-institutional-badge" title="Orden institucional">
                                                    Institucional
                                                </span>
                                                <span v-if="isOrderCancelled(order)" class="order-cancelled-badge" role="status" aria-live="polite" aria-label="Orden cancelada — no hay acciones ni documentos" tabindex="0" title="Órdenes canceladas no tienen acciones disponibles ni documentos para visualizar">
                                                    <svg class="cancel-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                                                        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.06)"></circle>
                                                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"></line>
                                                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"></line>
                                                    </svg>
                                                    <span class="badge-text">Cancelada</span>
                                                    <span class="cancel-info" aria-hidden="true">
                                                        <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                                            <circle cx="12" cy="16" r="1"></circle>
                                                        </svg>
                                                        <span class="cancel-tooltip" role="tooltip">Órdenes canceladas no tienen acciones ni documentos.</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </template>

                                    <template v-else-if="col.key === 'solicitante'">
                                        {{ getOrderSolicitante(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'fecha'">
                                        {{ formatDate(getOrderFecha(order)) }}
                                    </template>

                                    <template v-else-if="col.key === 'servicio'">
                                        {{ getOrderServicio(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'especialidad'">
                                        {{ getOrderEspecialidad(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'motivo'">
                                        {{ getOrderMotivo(order) || '-' }}
                                    </template>

                                    <template v-else-if="col.key === 'descripcion'">
                                        <div class="truncate-cell">{{ getOrderDescripcion(order) }}</div>
                                    </template>

                                    <template v-else-if="col.key === 'observaciones'">
                                        <div class="truncate-cell">{{ getOrderObservaciones(order) }}</div>
                                    </template>

                                    <template v-else-if="col.key === 'ingeniero'">
                                        {{ getOrderIngeniero(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'hora_inicio'">
                                        {{ getOrderHoraInicio(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'hora_termino'">
                                        {{ getOrderHoraTermino(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'tipo'">
                                        {{ getOrderTipo(order) }}
                                    </template>

                                    <template v-else-if="col.key === 'items'">
                                        <span class="count-badge">{{ getOrderItems(order).length }}</span>
                                    </template>

                                    <template v-else-if="col.key === 'consumible'">
                                        <span v-if="getOrderConsumibleStatus(order)" class="consumible-status-badge" :class="`consumible-${getOrderConsumibleStatus(order).toLowerCase()}`">{{ getOrderConsumibleStatus(order) }}</span>
                                    </template>

                                    <template v-else-if="col.key === 'estado'">
                                        <span class="status-badge" :class="`status-${isOrderCancelled(order) ? 'cancelled' : (order.estado || 'pendiente').toLowerCase()}`">{{ isOrderCancelled(order) ? 'Cancelada' : (order.estado || 'Pendiente') }}</span>
                                    </template>

                                    <template v-else-if="col.key === 'documentos'">
                                        <div class="documents-container">
                                            <template v-if="isOrderActive(order)">
                                                <button v-if="(order.documentCount || 0) > 0" @click="$emit('openHistory', JSON.parse(JSON.stringify(order)))" class="documents-badge clickable" :title="`Ver ${order.documentCount} documento${order.documentCount !== 1 ? 's' : ''}`">{{ order.documentCount }} documento{{ order.documentCount !== 1 ? 's' : '' }}</button>
                                                <button v-else @click="$emit('openHistory', JSON.parse(JSON.stringify(order)))" class="documents-badge empty clickable" title="Ver documentos">Sin documentos</button>
                                            </template>
                                            <template v-else>
                                                <span class="documents-badge cancelled" title="Órdenes canceladas no tienen documentos disponibles">Sin documentos</span>
                                            </template>
                                        </div>
                                    </template>

                                    <template v-else-if="col.key === 'acciones'">
                                        <template v-if="isOrderActive(order)">
                                            <button v-if="isOrderExternal(order)" @click="$emit('generateSalida', order)" class="action-btn salida-btn" title="Generar Baja (Salida) para equipos externos">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                    <polyline points="16 17 21 12 16 7"></polyline>
                                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                                </svg>
                                                <span class="action-label">Baja</span>
                                            </button>
                                            <button v-if="isOrderExternal(order)" @click="$emit('generateEntrada', order)" class="action-btn entrada-btn" title="Generar Entrada para equipos externos">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                                    <polyline points="10 17 15 12 10 7"></polyline>
                                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                                </svg>
                                                <span class="action-label">Entrada</span>
                                            </button>
                                            <button @click="$emit('openHistory', JSON.parse(JSON.stringify(order)))" class="action-btn doc-btn" title="Documentos">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                </svg>
                                                <span v-if="order.documentCount && order.documentCount > 0" class="action-badge">{{ order.documentCount }}</span>
                                            </button>
                                            <button @click="$emit('upload', order)" class="action-btn upload-btn" title="Subir archivos">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                            </button>
                                            <button v-if="canEditOrder" @click="$emit('edit', order)" class="action-btn edit-btn" title="Editar">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                                </svg>
                                            </button>
                                            <button v-if="canDeleteOrder" @click="$emit('delete', order.id)" class="action-btn delete-btn" title="Cancelar orden">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </template>
                                        <template v-else>
                                            <button class="btn disabled-pill" disabled title="Órdenes canceladas no tienen acciones disponibles">Sin acciones</button>
                                        </template>
                                    </template>
                                </td>
                            </template>
                        </tr>

                        <!-- Accordion con items (se despliega debajo de la orden) -->
                        <tr v-if="expandedAccordions.has(order.id) && getOrderItems(order).length > 0"
                            class="accordion-row">
                            <td :colspan="getColSpan()">
                                <div class="accordion-content">
                                    <div class="items-list">
                                        <div v-for="item in getOrderItems(order)" :key="item.id" class="item-list-row">
                                            <div class="item-type-badge">{{ item.tipo }}</div>
                                            <div class="item-details-col">
                                                <div class="item-main">
                                                    <span class="item-description">{{ item.descripcion || '-' }}</span>
                                                    <span v-if="isItemExternal(item)" class="item-external-badge">Equipo externo</span>
                                                    <div class="item-main-badges">
                                                        <span class="item-qty-badge">x{{ item.cantidad }}</span>
                                                        <span v-if="isConsumibleItem(item)" class="item-consumible-estado"
                                                            :class="getConsumibleEstado(item) === 'usado' ? 'is-usado' : 'is-nuevo'">
                                                            {{ getConsumibleEstado(item) === 'usado' ? 'Usado' : 'Nuevo' }}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="item-specs">
                                                    <span v-if="item.marca" class="spec">
                                                        <strong>Marca:</strong> {{ item.marca }}
                                                    </span>
                                                    <span v-if="item.modelo" class="spec">
                                                        <strong>Modelo:</strong> {{ item.modelo }}
                                                    </span>
                                                    <span v-if="item.serie" class="spec">
                                                        <strong>Serie:</strong> {{ item.serie }}
                                                    </span>
                                                    <span v-if="item.lote" class="spec">
                                                        <strong>Lote:</strong> {{ item.lote }}
                                                    </span>
                                                    <span v-if="item.ubicacion" class="spec">
                                                        <strong>Ubicación:</strong> {{ item.ubicacion }}
                                                    </span>
                                                    <span v-if="item.claveHRAEI" class="spec">
                                                        <strong>Clave HRAEI:</strong> {{ item.claveHRAEI }}
                                                    </span>
                                                </div>
                                                <div v-if="isValidSerial(item.serie)" class="item-history-actions">
                                                    <button type="button" class="serial-history-btn"
                                                        @click="toggleSerialHistory(item.serie)">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                            <polyline points="17 8 12 3 7 8"></polyline>
                                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                                        </svg>
                                                        <span>{{ isHistoryOpen(item.serie) ? 'Ocultar historial' : 'Ver historial' }}</span>
                                                    </button>
                                                    <span v-if="hasHistoryEntries(item.serie)" class="history-count-badge">
                                                        {{ getHistoryState(item.serie)?.data.length || 0 }} movimiento{{ (getHistoryState(item.serie)?.data.length || 0) !== 1 ? 's' : '' }}
                                                    </span>
                                                </div>
                                                <div v-if="isHistoryOpen(item.serie)" class="serial-history-panel">
                                                    <div v-if="getHistoryState(item.serie)?.loading" class="history-loading">
                                                        Cargando historial...
                                                    </div>
                                                    <div v-else-if="getHistoryState(item.serie)?.error" class="history-error">
                                                        {{ getHistoryState(item.serie).error }}
                                                    </div>
                                                    <table v-else-if="getHistoryState(item.serie)?.data?.length"
                                                        class="serial-history-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Folio</th>
                                                                <th>Tipo</th>
                                                                <th>Fecha</th>
                                                                <th>Usuario</th>
                                                                <th>Nota</th>
                                                                <th>Movimiento Relacionado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="record in getHistoryState(item.serie).data"
                                                                :key="getHistoryRowKey(record, item.serie)">
                                                                <td>{{ record.folio || record.order_id || '—' }}</td>
                                                                <td>
                                                                    <span class="history-type-tag" :class="getHistoryTypeClass(record)">
                                                                        {{ getHistoryTypeDisplay(record) }}
                                                                    </span>
                                                                </td>
                                                                <td>{{ formatDate(record.date || record.fecha_evento || record.fecha || record.timestamp) }}</td>
                                                                <td>{{ record.user || record.actor || record.usuario || '—' }}</td>
                                                                <td>{{ record.note || record.nota || '-' }}</td>
                                                                <td class="history-related-cell">
                                                                    <div class="history-related-label">Movimiento relacionado</div>
                                                                    <div v-if="record.related_folio" class="history-related-info">
                                                                        <span :class="['history-type-badge', getHistoryTypeClass({ type: record.related_type || '' })]">
                                                                            {{ getHistoryTypeDisplay({ type: record.related_type || record.type }) }}
                                                                        </span>
                                                                        <span class="history-related-folio">{{ record.related_folio }}</span>
                                                                        <span class="history-related-date">{{ formatDate(record.related_fecha_evento) }}</span>
                                                                        <span class="history-related-actor">{{ record.related_actor || '-' }}</span>
                                                                        <button type="button" class="history-open-order-btn" @click="openRelatedOrder({ folio: record.related_folio, type: record.related_type })">
                                                                            Ver orden relacionada
                                                                        </button>
                                                                    </div>
                                                                    <div v-else class="history-related-info history-related-fallback">
                                                                        <span class="history-related-none">{{ record.related_missing_reason || 'Sin movimiento relacionado encontrado' }}</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <p v-else class="history-empty">No se encontraron movimientos previos</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
                <div class="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </div>
                <h3 class="empty-title">No hay órdenes</h3>
                <p class="empty-message">{{ emptyStateMessage }}</p>
                <button class="btn-create-empty" @click="$emit('create')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Crear primera orden
                </button>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="!showAllRows && paginatedOrders.length > 0 && totalPages > 1" class="pagination-section">
            <div class="pagination-info">
                <span class="info-text">
                    Mostrando <span class="info-number">{{ startIndex + 1 }}</span> a
                    <span class="info-number">{{ endIndex }}</span> de
                    <span class="info-number">{{ filteredOrders.length }}</span> órdenes
                </span>
            </div>

            <nav class="pagination-nav">
                <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn prev-btn"
                    title="Página anterior">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <span>Anterior</span>
                </button>

                <div class="page-numbers">
                    <template v-for="page in pageNumbers" :key="page">
                        <button v-if="page !== '...'" @click="goToPage(page)"
                            :class="{ 'active': currentPage === page }" class="page-number">
                            {{ page }}
                        </button>
                        <span v-else class="page-ellipsis">...</span>
                    </template>
                </div>

                <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn next-btn"
                    title="Siguiente página">
                    <span>Siguiente</span>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd"></path>
                    </svg>
                </button>
            </nav>


        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authedFetch } from '@/utils/api.js'
import notifier from '@/utils/notifier'
import { usePermissions } from '@/composables/usePermissions.js'
import { useSerialMovements } from '@/composables/useSerialMovements.js'

// Permisos del usuario
const { canEditOrder, canDeleteOrder } = usePermissions()

const props = defineProps({
    filteredOrders: {
        type: Array,
        required: true,
    },
    showAllColumns: {
        type: Boolean,
        default: true,
    },
    showAllRows: {
        type: Boolean,
        default: true,
    },
    showColumnService: Boolean,
    showColumnEspecialidad: Boolean,
    showColumnMotivo: Boolean,
    showColumnDescripcion: Boolean,
    showColumnObservaciones: Boolean,
    showColumnIngeniero: Boolean,
    showColumnHora: Boolean,
    showColumnTipo: Boolean,
    showColumnItems: Boolean,
    showColumnEstado: Boolean,
    emptyStateMessage: {
        type: String,
        default: 'Comienza creando una nueva orden.',
    },
})

const emit = defineEmits(['edit', 'excel', 'delete', 'create', 'deleteMultiple', 'openHistory', 'upload', 'generateSalida', 'generateEntrada'])

const currentPage = ref(1)
const itemsPerPage = computed(() => {
    if (props.showAllRows) return Math.max(props.filteredOrders.length, 1)
    return 10
})
const multiDeleteMode = ref(false)
const selectedForDelete = ref(new Set())
const expandedAccordions = ref(new Set())  // Estado para acordeones expandidos
const openedSerials = ref([])
const {
    normalizeSerial,
    getHistoryState,
    isValidSerial,
    loadSerialHistory
} = useSerialMovements()

const totalPages = computed(() => Math.max(1, Math.ceil(props.filteredOrders.length / itemsPerPage.value)))

const router = useRouter()

const paginatedOrders = computed(() => {
    if (props.showAllRows) return props.filteredOrders
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return props.filteredOrders.slice(start, end)
})

watch(() => props.filteredOrders.length, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
    }
})

watch(paginatedOrders, (orders) => {
    orders.forEach(order => {
        getOrderItems(order).forEach(item => {
            if (isValidSerial(item.serie)) {
                const clave = item.claveHRAEI || item.clave_hraei || item.clave || ''
                loadSerialHistory(item.serie, clave)
            }
        })
    })
}, { immediate: true, deep: true })

const startIndex = computed(() => props.showAllRows ? 0 : (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => props.showAllRows ? props.filteredOrders.length : Math.min(startIndex.value + itemsPerPage.value, props.filteredOrders.length))

const pageNumbers = computed(() => {
    if (props.showAllRows) return [1]
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    if (endPage < totalPages.value) {
        if (endPage < totalPages.value - 1) pages.push('...')
        pages.push(totalPages.value)
    }

    return pages
})

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

function goToPage(page) {
    currentPage.value = page
}

function formatDate(dateStr) {
    if (!dateStr) return '-'

    const dateStrTrimmed = String(dateStr).trim()

    // Si ya está en formato DD/MM/YYYY, devolver tal cual (usuario puso con '/').
    if (dateStrTrimmed.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateStrTrimmed
    }

    // Si ya está en formato DD-MM-YYYY, convertir a DD/MM/YYYY
    if (dateStrTrimmed.match(/^\d{2}-\d{2}-\d{4}$/)) {
        return dateStrTrimmed.replace(/-/g, '/')
    }

    try {
        // Si viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
        if (dateStrTrimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStrTrimmed.split('-')
            return `${day}/${month}/${year}`
        }

        // Si viene en formato YYYY/MM/DD
        if (dateStrTrimmed.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
            const [year, month, day] = dateStrTrimmed.split('/')
            return `${day}/${month}/${year}`
        }

        // Como fallback, intentar parsear como fecha (solo si no contiene '/'), evita parsing ambiguo cuando hay '/'
        if (dateStrTrimmed.includes('/')) return dateStrTrimmed

        const date = new Date(dateStrTrimmed)
        if (isNaN(date.getTime())) return dateStrTrimmed

        // Formatear como DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    } catch {
        return dateStrTrimmed
    }
}

function isColumnVisible(flag) {
    return props.showAllColumns || Boolean(flag)
}

const EMPTY_LIKE_VALUES = new Set(['', '-', 'n/a', 'na', 'null', 'undefined', 'sin dato'])
const TIME_PATTERN = /^\d{1,2}:\d{2}(:\d{2})?$/

function isEmptyLike(value) {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        return EMPTY_LIKE_VALUES.has(normalized)
    }
    return false
}

function normalizeDisplayValue(value, fallback = '-') {
    if (isEmptyLike(value)) return fallback
    return String(value).trim()
}

function pickOrderValue(order, keys, fallback = '') {
    if (!order || !Array.isArray(keys)) return fallback
    for (const key of keys) {
        const value = order?.[key]
        if (!isEmptyLike(value)) return value
    }
    return fallback
}

function isTimeLike(value) {
    if (isEmptyLike(value)) return false
    return TIME_PATTERN.test(String(value).trim())
}

function timeToSeconds(value) {
    if (!isTimeLike(value)) return Number.POSITIVE_INFINITY
    const chunks = String(value).trim().split(':').map(part => Number(part || 0))
    const [hh, mm, ss] = [chunks[0] || 0, chunks[1] || 0, chunks[2] || 0]
    return (hh * 3600) + (mm * 60) + ss
}

function getOrderSolicitante(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['nombreSolicitante', 'nombre_solicitante', 'solicitante', 'nombreSolicitanteCompleto']))
}

function getOrderFecha(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['fecha', 'fecha_operacion', 'fechaOperacion']))
}

function getOrderServicio(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['servicio', 'service', 'area', 'departamento']))
}

function getOrderEspecialidad(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['especialidad', 'specialty', 'subespecialidad']))
}

function getOrderMotivo(order) {
    return normalizeDisplayValue(
        pickOrderValue(order, [
            'motivoEntrada',
            'motivoSalida',
            'motivoResguardo',
            'motivoServicio',
            'motivo',
            'motivo_entrada',
            'motivo_salida',
            'motivo_resguardo',
            'motivo_servicio',
            'otroMotivo',
            'otro_motivo'
        ]),
        ''
    )
}

function getOrderDescripcion(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['descripcion', 'descripcion_orden', 'detalle', 'detalle_orden', 'otroMotivo', 'otro_motivo']))
}

function getOrderObservaciones(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['observaciones', 'observacion', 'notas', 'nota']))
}

function getOrderIngeniero(order) {
    return normalizeDisplayValue(pickOrderValue(order, ['nombreIngeniero', 'nombre_ingeniero', 'ingeniero', 'ingeniero_residente']))
}

function resolveOrderTimes(order) {
    const startRaw = pickOrderValue(order, ['horaInicio', 'hora_inicio', 'hora_inicial'], '')
    const endRaw = pickOrderValue(order, ['horaTermino', 'hora_termino', 'hora_final', 'hora_fin'], '')
    const strayTime = pickOrderValue(order, ['tipo', 'tipoOperacion', 'tipo_operacion'], '')

    let start = isTimeLike(startRaw) ? String(startRaw).trim() : ''
    let end = isTimeLike(endRaw) ? String(endRaw).trim() : ''

    if (!start && isTimeLike(strayTime) && end) {
        const times = [String(strayTime).trim(), end].sort((a, b) => timeToSeconds(a) - timeToSeconds(b))
        start = times[0]
        end = times[1]
    } else if (!start && isTimeLike(strayTime) && !end) {
        start = String(strayTime).trim()
    }

    return {
        start: start || '-',
        end: end || '-'
    }
}

function getOrderHoraInicio(order) {
    return resolveOrderTimes(order).start
}

function getOrderHoraTermino(order) {
    return resolveOrderTimes(order).end
}

function getOrderTipo(order) {
    const directType = normalizeDisplayValue(
        pickOrderValue(order, ['tipo', 'tipoOperacion', 'tipo_operacion', 'operationType', 'orderType']),
        ''
    )
    if (directType && !isTimeLike(directType)) return directType

    const itemType = getOrderItems(order)
        .map(item => normalizeDisplayValue(item?.tipo, ''))
        .find(value => value && !isTimeLike(value))

    return itemType || '-'
}

function getOrderItems(order) {
    if (!order) return []
    const candidates = [
        order.equiposEntrada,
        order.equiposSalida,
        order.equiposResguardo,
        order.equiposServicio,
        order.items
    ]
    for (const list of candidates) {
        if (Array.isArray(list) && list.length) return list
    }
    return Array.isArray(order.equiposEntrada) ? order.equiposEntrada : []
}

function isHistoryOpen(serial) {
    const key = normalizeSerial(serial)
    return key ? openedSerials.value.includes(key) : false
}

function hasHistoryEntries(serial) {
    const state = getHistoryState(serial)
    return Boolean(state?.data?.length)
}

function toggleSerialHistory(serial) {
    const key = normalizeSerial(serial)
    if (!key) return
    if (openedSerials.value.includes(key)) {
        openedSerials.value = openedSerials.value.filter(s => s !== key)
        return
    }
    openedSerials.value = [...openedSerials.value, key]
    loadSerialHistory(serial)
}

function getHistoryRowKey(record, serial) {
    const key = normalizeSerial(serial)
    const parts = [
        key,
        record.folio,
        record.order_id,
        record.id,
        record.date,
        record.timestamp
    ].filter(Boolean)
    return parts.length ? parts.join('-') : `${key}-${Math.random().toString(36).slice(2, 8)}`
}

function getOrderTypeFromRecord(record) {
    const rawType = String(record.type || record.tipo || '').toLowerCase().trim()
    if (rawType.includes('salida')) return 'salida'
    if (rawType.includes('resguardo')) return 'resguardo'
    if (rawType.includes('servicio')) return 'servicio'
    if (rawType.includes('entrada')) return 'entrada'
    const folio = String(record.folio || record.order_id || '').toUpperCase()
    if (folio.startsWith('E-') || folio.startsWith('E0') || folio.startsWith('E')) return 'entrada'
    if (folio.startsWith('S-') || folio.startsWith('S0') || folio.startsWith('S')) return 'salida'
    if (folio.startsWith('R-') || folio.startsWith('R0') || folio.startsWith('R')) return 'resguardo'
    if (folio.startsWith('O-') || folio.startsWith('O0') || folio.startsWith('O')) return 'servicio'
    return 'entrada'
}

function openRelatedOrder(record) {
    if (!record || !(record.folio || record.order_id)) return

    const folio = record.folio || record.order_id
    const orderType = getOrderTypeFromRecord(record)

    emit('openHistory', {
        folio,
        orderType,
        type: orderType
    })
}

function getHistoryTypeDisplay(record) {
    const type = getOrderTypeFromRecord(record)
    if (type === 'salida') return 'Salida'
    if (type === 'resguardo') return 'Resguardo'
    if (type === 'servicio') return 'Servicio'
    if (type === 'entrada') return 'Entrada'
    if (type === 'movimiento') return 'Movimiento'
    return 'Otro'
}

function getHistoryTypeClass(record) {
    const type = getOrderTypeFromRecord(record)
    return {
        salida: 'history-type-badge-salida',
        resguardo: 'history-type-badge-resguardo',
        servicio: 'history-type-badge-servicio',
        entrada: 'history-type-badge-entrada',
        movimiento: 'history-type-badge-movimiento'
    }[type] || 'history-type-badge-default'
}

function getExternalItemCount(order) {
    const items = getOrderItems(order)
    return items.filter(item => isItemExternalHeuristic(item)).length
}

function getHistoryItemCount(order) {
    const items = getOrderItems(order)
    return items.filter(item => hasHistoryEntries(item.serie)).length
}

function hasExternalItems(order) {
    return getExternalItemCount(order) > 0
}

function hasHistoryInOrder(order) {
    return getHistoryItemCount(order) > 0
}

const externalHintKeywords = ['comodato','donación','donacion','comodatos','donaciones','externo','prestamo','préstamo']

function isItemExternalHeuristic(item) {
    if (!item) return false
    // explicit flag wins
    if (Boolean(item?.isExternal ?? item?.is_external)) return true
    const label = `${item?.descripcion || item?.nombre || item?.claveHRAEI || item?.label || ''}`.toLowerCase()
    return externalHintKeywords.some(k => label.includes(k))
}

function isItemExternal(item) {
    return isItemExternalHeuristic(item)
}

function isOrderExternal(order) {
    if (!order) return false
    // If any item is external, the order is external
    if (hasExternalItems(order)) return true

    const textFields = [
        getOrderMotivo(order),
        getOrderDescripcion(order),
        getOrderObservaciones(order),
        getOrderSolicitante(order),
        getOrderServicio(order)
    ]
    const combined = textFields.filter(Boolean).join(' ').toLowerCase()
    return externalHintKeywords.some(k => combined.includes(k))
}

// Column list computed centrally to ensure header/body alignment
const visibleColumns = computed(() => {
    const cols = [
        { key: 'folio', label: 'Folio', headerClass: '' },
        { key: 'solicitante', label: 'Solicitante' },
        { key: 'fecha', label: 'Fecha' }
    ]

    if (isColumnVisible(props.showColumnService)) cols.push({ key: 'servicio', label: 'Servicio' })
    if (isColumnVisible(props.showColumnEspecialidad)) cols.push({ key: 'especialidad', label: 'Especialidad' })
    if (isColumnVisible(props.showColumnMotivo)) cols.push({ key: 'motivo', label: 'Motivo' })
    if (isColumnVisible(props.showColumnDescripcion)) cols.push({ key: 'descripcion', label: 'Descripción' })
    if (isColumnVisible(props.showColumnObservaciones)) cols.push({ key: 'observaciones', label: 'Observaciones' })
    if (isColumnVisible(props.showColumnIngeniero)) cols.push({ key: 'ingeniero', label: 'Ingeniero' })
    if (isColumnVisible(props.showColumnHora)) {
        cols.push({ key: 'hora_inicio', label: 'Hora Inicio' })
        cols.push({ key: 'hora_termino', label: 'Hora Término' })
    }
    if (isColumnVisible(props.showColumnTipo)) cols.push({ key: 'tipo', label: 'Tipo' })
    if (isColumnVisible(props.showColumnItems)) cols.push({ key: 'items', label: 'Items' })

    cols.push({ key: 'consumible', label: 'Consumible' })
    if (isColumnVisible(props.showColumnEstado)) cols.push({ key: 'estado', label: 'Estado' })
    cols.push({ key: 'documentos', label: 'Documentos' })
    cols.push({ key: 'acciones', label: 'Acciones' })
    return cols
})

function getColClass(key) {
    switch (key) {
        case 'folio': return 'cell-folio'
        case 'descripcion': return 'truncate-cell'
        case 'observaciones': return 'truncate-cell'
        case 'items': return 'items-count'
        case 'consumible': return 'consumible-column'
        case 'documentos': return 'cell-documents'
        case 'acciones': return 'cell-actions'
        default: return ''
    }
}

function getColSpan() {
    const selection = (multiDeleteMode.value && (canDeleteOrder?.value ?? canDeleteOrder)) ? 1 : 0
    return visibleColumns.value.length + selection
}

function toggleAccordion(orderId) {
    if (expandedAccordions.value.has(orderId)) {
        expandedAccordions.value.delete(orderId)
    } else {
        expandedAccordions.value.add(orderId)
    }
}

const allSelectedOnPage = computed({
    get() {
        if (paginatedOrders.value.length === 0) return false
        return paginatedOrders.value.every(order => selectedForDelete.value.has(order.id))
    },
    set(value) {
        if (value) {
            paginatedOrders.value.forEach(order => selectedForDelete.value.add(order.id))
        } else {
            paginatedOrders.value.forEach(order => selectedForDelete.value.delete(order.id))
        }
    }
})

function isConsumibleItem(item) {
    return String(item?.tipo || '').toLowerCase() === 'consumible'
}

function getConsumibleEstado(item) {
    const state = String(item?.consumibleEstado || item?.consumible_estado || '').toLowerCase()
    return state === 'usado' ? 'usado' : 'nuevo'
}

function getOrderConsumibleStatus(order) {
    const items = getOrderItems(order)
    const estados = new Set(
        items
            .filter(i => i && i.tipo)
            .filter(i => ['consumible', 'accesorio', 'refaccion'].includes(String(i.tipo || '').toLowerCase()))
            .map(getConsumibleEstado)
    )

    if (estados.size === 0) return ''
    if (estados.size === 1) return estados.has('usado') ? 'Usado' : 'Nuevo'
    return 'Mixto'
}

function toggleOrderSelection(orderId) {
    if (selectedForDelete.value.has(orderId)) {
        selectedForDelete.value.delete(orderId)
    } else {
        selectedForDelete.value.add(orderId)
    }
}

function toggleSelectAllOnPage(event) {
    const isChecked = event.target.checked
    if (isChecked) {
        paginatedOrders.value.forEach(order => selectedForDelete.value.add(order.id))
    } else {
        paginatedOrders.value.forEach(order => selectedForDelete.value.delete(order.id))
    }
}

function deleteSelected() {
    const orderIdsToDelete = Array.from(selectedForDelete.value)
    if (orderIdsToDelete.length === 0) return

    // Emitir evento al padre (OrderManagement) que mostrará la modal
    emit('deleteMultiple', orderIdsToDelete)
    selectedForDelete.value.clear()
    multiDeleteMode.value = false
}

function getOrderStatus(order) {
    const status = order?.status || order?.orden?.status || 'active'
    return String(status || 'active').toLowerCase().trim()
}

function isOrderCancelled(order) {
    return getOrderStatus(order) === 'cancelled'
}

function isOrderActive(order) {
    return !isOrderCancelled(order)
}
</script>

<style scoped>
.orders-table-container {
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* MULTI-DELETE TOOLBAR */
.multi-delete-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 20px;
    background: rgba(13, 20, 35, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: none;
    border-radius: 14px 14px 0 0;
    backdrop-filter: blur(4px);
    flex-wrap: wrap;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1 1 auto;
}

/* TOGGLE SWITCH STYLES */
.toggle-switch {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
}

.toggle-switch input[type="checkbox"] {
    display: none;
}

.slider {
    position: relative;
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 0 2px;
}

.slider::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgba(230, 235, 245, 0.8);
    border-radius: 10px;
    left: 2px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input[type="checkbox"]:checked+.slider {
    background: rgba(46, 221, 90, 0.3);
    border-color: rgba(46, 221, 90, 0.5);
}

.toggle-switch input[type="checkbox"]:checked+.slider::after {
    left: calc(100% - 22px);
    background: #2edd5a;
    box-shadow: 0 2px 8px rgba(46, 221, 90, 0.4);
}

.toggle-label {
    color: rgba(230, 235, 245, 0.8);
    font-weight: 600;
    font-size: 0.9rem;
}

.selected-count {
    color: #2edd5a;
    font-weight: 700;
    font-size: 0.85rem;
    background: rgba(46, 221, 90, 0.15);
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(46, 221, 90, 0.3);
}

.btn-delete-selected {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: linear-gradient(135deg, rgba(255, 83, 108, 0.2), rgba(255, 121, 97, 0.15));
    border: 1px solid rgba(255, 83, 108, 0.45);
    color: #ff7a95;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
    transition: all 0.28s ease;
    flex: 0 1 auto;
    box-shadow: 0 10px 22px rgba(255, 83, 108, 0.15);
    position: relative;
    overflow: hidden;
}

.btn-delete-selected::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 60%);
    opacity: 0;
    transition: opacity 0.28s ease;
    pointer-events: none;
}

.btn-delete-selected:hover {
    background: linear-gradient(135deg, rgba(255, 83, 108, 0.3), rgba(255, 121, 97, 0.25));
    border-color: rgba(255, 83, 108, 0.6);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 12px 28px rgba(255, 83, 108, 0.25);
}

.btn-delete-selected:hover::after {
    opacity: 1;
}

.btn-delete-selected:active {
    transform: translateY(0) scale(0.99);
}

/* CHECKBOX COLUMN */
.checkbox-col,
.checkbox-cell {
    width: 44px;
    padding: 12px 14px !important;
    text-align: center;
}

.header-checkbox,
.row-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #2edd5a;
}

/* ROW SELECTED STYLE */
.row-selected {
    background: rgba(46, 221, 90, 0.08) !important;
}

.row-selected:hover {
    background: rgba(46, 221, 90, 0.12) !important;
}

.row-has-external {
    border-left: 4px solid #f97316;
    box-shadow: none;
}

.row-has-history {
    border-left: 4px solid #2563eb;
    box-shadow: none;
}

.orders-table tbody tr.row-has-external:hover::before {
    background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.45), transparent 55%);
}

.orders-table tbody tr.row-has-history:hover::before {
    background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.45), transparent 55%);
}

.row-has-external .cell-folio {
    color: #f97316;
}

.row-has-history .cell-folio {
    color: #3b82f6;
}

/* TABLE SURFACE */
.table-surface {
    background: rgba(13, 20, 35, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px) saturate(120%);
    margin-bottom: 0;
}

.orders-table-scroll {
    max-height: clamp(360px, 68vh, 900px);
    overflow: auto;
    border-radius: inherit;
}

.orders-table-scroll::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.orders-table-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
}

/* ORDERS TABLE */
.orders-table {
    width: 100%;
    min-width: 1450px;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.orders-table thead {
    background: linear-gradient(180deg, rgba(15, 35, 62, 0.98), rgba(12, 28, 50, 0.96));
    border-bottom: 1px solid rgba(148, 163, 184, 0.24);
}

.orders-table th {
    padding: 12px 12px;
    text-align: left;
    font-weight: 700;
    color: rgba(226, 232, 240, 0.95);
    text-transform: uppercase;
    font-size: 0.71rem;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
    position: sticky;
    top: 0;
    z-index: 4;
    background: rgba(11, 30, 54, 0.96);
    backdrop-filter: blur(8px);
}



.orders-table tbody tr {
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    transition: background-color 0.2s ease;
    background: rgba(10, 24, 45, 0.88);
    overflow: hidden;
    display: table-row;
    position: relative;
    border-radius: 0;
    box-shadow: none;
    border: none;
}

.orders-table tbody tr::before {
    content: '';
    position: absolute;
    inset: 0;
    background: none;
    opacity: 0;
    transition: opacity 0.35s ease;
    pointer-events: none;
}

.orders-table tbody tr:hover::before {
    opacity: 0;
}

.orders-table tbody tr:hover {
    transform: none;
    box-shadow: none;
    background: rgba(15, 34, 60, 0.92);
}

.orders-table tbody tr.row-has-external:hover::before {
    background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.45), transparent 55%);
}

.row-has-external .cell-folio {
    color: #f59e0b;
}

.orders-table tbody tr:last-child {
    border-bottom: none;
}

.orders-table td {
    padding: 9px 12px;
    color: rgba(230, 235, 245, 0.88);
    vertical-align: top;
    overflow: visible !important;
    position: relative;
    z-index: 1;
    line-height: 1.25;
}

.cell-folio {
    font-weight: 700;
    color: #2edd5a;
}

.truncate-cell {
    max-width: 320px;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.2;
}

/* ITEMS COUNT BADGE */
.items-count {
    text-align: center;
}

.count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(46, 221, 90, 0.15);
    color: #2edd5a;
    border: 1px solid rgba(46, 221, 90, 0.3);
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
}

/* STATUS BADGE */
.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
    border: 1px solid;
}

/* CONSUMIBLE STATUS BADGE (Orders table) */
.consumible-status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
    border: 1px solid;
}

.consumible-nuevo {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    border-color: rgba(34, 197, 94, 0.25);
}

.consumible-usado {
    background: rgba(148, 163, 184, 0.22);
    color: #cbd5e1;
    border-color: rgba(148, 163, 184, 0.4);
}

.consumible-mixto {
    background: rgba(245, 158, 11, 0.18);
    color: #fcd34d;
    border-color: rgba(245, 158, 11, 0.35);
}

.status-pendiente {
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    border-color: rgba(255, 193, 7, 0.3);
}

.status-en-proceso {
    background: rgba(74, 144, 226, 0.15);
    color: #299deb;
    border-color: rgba(74, 144, 226, 0.3);
}

.status-completado {
    background: rgba(46, 221, 90, 0.15);
    color: #2edd5a;
    border-color: rgba(46, 221, 90, 0.3);
}

.order-status-badge-group {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    flex-wrap: wrap;
}

.order-external-badge,
.order-history-badge,
.order-institutional-badge {
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 10px;
    border: 1px solid;
    letter-spacing: 0.25px;
    line-height: 1.2;
}

.order-external-badge {
    color: #f97316;
    background: rgba(249, 115, 22, 0.14);
    border-color: rgba(249, 115, 22, 0.45);
}

.order-history-badge {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.14);
    border-color: rgba(59, 130, 246, 0.45);
}

.order-institutional-badge {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.14);
    border-color: rgba(34, 197, 94, 0.45);
}

.cell-folio .folio-text {
    font-size: 0.98rem;
    font-weight: 800;
    letter-spacing: 0.1px;
}

/* CELL ACTIONS */
.cell-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    align-items: flex-start;
    justify-content: flex-start;
    overflow: visible !important;
    padding: 6px 0 !important;
    margin: 0 !important;
    min-width: 212px;
    white-space: nowrap;
}

.action-btn {
    position: relative;
    padding: 7px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(46, 221, 90, 0.06));
    color: rgba(230, 235, 245, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    min-height: 34px;
    flex-shrink: 0;
    overflow: visible !important;
    margin: 0 !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.26);
}

.action-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    border: 1px solid transparent;
    background: linear-gradient(120deg, rgba(46, 221, 90, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.28s ease;
}

.action-btn svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

/* Small numeric badge for quick visibility on action buttons */
.action-badge {
    position: absolute;
    top: -12px !important;
    right: -12px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 26px !important;
    width: 26px !important;
    height: 26px !important;
    padding: 0 !important;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    line-height: 1 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
    white-space: nowrap !important;
    border: 2px solid rgba(13, 20, 35, 0.95) !important;
    z-index: 9999 !important;
    animation: badge-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
    font-variant-numeric: tabular-nums !important;
    overflow: visible !important;
    clip-path: none !important;
    margin: 0 !important;
}

/* Pulse animation para badge */
@keyframes badge-pulse {

    0%,
    100% {
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        transform: scale(1);
    }

    50% {
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: scale(1.08);
    }
}

/* Badge visible solo cuando hay contenido */
.action-badge:empty {
    display: none;
}

/* Hover: only visual lift + subtle bg; color/border set per-button */
.action-btn:hover {
    transform: translateY(-1px);
    background: linear-gradient(145deg, rgba(46, 221, 90, 0.15), rgba(255, 255, 255, 0.15));
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.3);
}

.action-btn:hover::after {
    opacity: 1;
}

/* Document button: purple on hover */
.action-btn.doc-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-btn.doc-btn:hover {
    color: #a78bfa;
    border-color: #a78bfa;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.1));
    box-shadow: 0 10px 28px rgba(124, 58, 237, 0.25);
}

/* Upload button: orange/amber on hover */
.action-btn.upload-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-btn.upload-btn:hover {
    color: #fb923c;
    border-color: #fb923c;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(245, 158, 11, 0.12));
    box-shadow: 0 10px 28px rgba(249, 115, 22, 0.25);
}

/* Edit / Excel / Delete: colored on hover (keep existing colors) */
.action-btn.edit-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-btn.edit-btn:hover {
    border-color: #60a5fa;
    color: #60a5fa;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1));
    box-shadow: 0 10px 28px rgba(59, 130, 246, 0.25);
}

.action-btn.excel-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-btn.excel-btn:hover {
    border-color: #4ade80;
    color: #4ade80;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(74, 222, 128, 0.1));
    box-shadow: 0 10px 28px rgba(46, 221, 90, 0.25);
}

.action-btn.delete-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-btn.delete-btn:hover {
    border-color: #fca5a5;
    color: #fca5a5;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
    box-shadow: 0 10px 28px rgba(239, 68, 68, 0.25);
}

/* Salida button: red/orange on hover */
.action-btn.salida-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    gap: 4px;
    padding: 6px 8px;
    min-width: auto;
}

.action-btn.salida-btn:hover {
    border-color: #f97316;
    color: #f97316;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.15));
    box-shadow: 0 10px 28px rgba(249, 115, 22, 0.3);
}

/* Entrada button: green on hover */
.action-btn.entrada-btn {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    gap: 4px;
    padding: 6px 8px;
    min-width: auto;
}

.action-btn.entrada-btn:hover {
    border-color: #22c55e;
    color: #22c55e;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(46, 221, 90, 0.15));
    box-shadow: 0 10px 28px rgba(34, 197, 94, 0.3);
}

/* Action label text */
.action-label {
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}



/* EMPTY STATE */
.empty-state {
    padding: 60px 40px;
    text-align: center;
}

.empty-icon {
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.25);
    display: flex;
    justify-content: center;
}

.empty-title {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: rgba(230, 235, 245, 0.9);
}

.empty-message {
    margin: 0 0 24px 0;
    font-size: 0.9rem;
    color: rgba(230, 235, 245, 0.6);
}

.btn-create-empty {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(74, 144, 226, 0.1));
    border: 1px solid rgba(46, 221, 90, 0.3);
    color: #2edd5a;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.btn-create-empty:hover {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.15);
}

/* PAGINATION SECTION */
.pagination-section {
    background: rgba(13, 20, 35, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
    border-radius: 0 0 14px 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    backdrop-filter: blur(4px);
    flex-wrap: wrap;
}

.pagination-info {
    flex: 0 1 auto;
}

.info-text {
    font-size: 0.85rem;
    color: rgba(230, 235, 245, 0.7);
}

.info-number {
    color: rgba(230, 235, 245, 0.9);
    font-weight: 700;
}

/* Responsive: card-like rows on small screens */
@media (max-width: 720px) {
    .orders-table-scroll {
        max-height: none;
        overflow: visible;
    }

    .orders-table {
        min-width: 100%;
    }

    .orders-table thead {
        display: none;
    }

    /* Grid of cards: prefer single-column on small viewports for better readability.
       Force one card per row to avoid cramped/cascading content on narrow screens. */
    .orders-table tbody {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 12px;
    }

    @media (max-width: 420px) {
        .orders-table tbody {
            grid-template-columns: 1fr;
            padding: 8px;
        }
    }

    /* Each row becomes a card (grid item) */
    .orders-table tr {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(18, 24, 38, 0.7), rgba(13, 20, 35, 0.6));
        border: 1px solid rgba(255, 255, 255, 0.04);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        overflow: hidden;
        /* prevent inner content from escaping card */
        box-sizing: border-box;
    }

    .orders-table tr:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
    }

    .orders-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 4px;
        border-bottom: none;
        min-width: 0;
        /* allow flex children to shrink */
        word-break: break-word;
    }

    /* Label on the left, value on the right */
    .orders-table td::before {
        content: attr(data-label);
        color: rgba(230, 235, 245, 0.72);
        font-weight: 700;
        margin-right: 12px;
        flex: 0 0 auto;
        font-size: 0.82rem;
        opacity: 0.95;
    }

    /* Header (folio) stands out */
    .orders-table .cell-folio {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 800;
        color: #2edd5a;
        font-size: 1rem;
        padding-bottom: 6px;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.03);
    }

    /* Truncate description to allow wrapping nicely */
    .orders-table .truncate-cell {
        max-width: 100%;
        white-space: normal;
        overflow: visible;
    }

    /* Ensure inner elements don't force horizontal overflow. Forces children to be shrinkable
       and to use ellipsis where appropriate. This prevents long strings or badges from pushing
       the card wider than its container. */
    .orders-table td>* {
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Allow descriptive fields to wrap instead of forcing the card wider. Titles truncate with ellipsis. */
    .orders-table td .truncate-cell,
    .orders-table td .doc-item-content .doc-item-meta {
        white-space: normal;
        overflow-wrap: anywhere;
    }

    .orders-table td .doc-item-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .orders-table .cell-actions {
        justify-content: flex-end;
        gap: 6px;
    }

    .orders-table .folio-with-accordion {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .table-surface {
        /* Keep table surface as a normal flow container; individual cards will hide overflow. */
        overflow: visible;
    }

    /* Reduce paddings and font sizes on very small screens to avoid overflow */
    @media (max-width: 420px) {
        .orders-table tr {
            padding: 8px;
            gap: 6px;
        }

        .orders-table td::before {
            font-size: 0.75rem;
            margin-right: 8px;
        }

        .orders-table .cell-folio {
            font-size: 0.95rem
        }

        .orders-table td {
            padding: 6px 2px
        }

        .orders-table .cell-actions {
            gap: 4px
        }
    }

    /* Compact badges and action buttons on very small screens to avoid overflow. */
    @media (max-width: 420px) {
        .action-badge {
            width: 22px;
            height: 22px;
            padding: 0;
            font-size: 12px;
            line-height: 1;
            min-width: 0;
        }

        .action-btn {
            padding: 6px;
        }

        .action-btn svg {
            width: 16px;
            height: 16px
        }

        .documents-badge {
            font-size: 12px;
            padding: 6px 8px
        }
    }
}

/* Allow badges to overflow card bounds on very small screens so they
           remain fully visible (not clipped by parent's overflow:hidden). */
@media (max-width: 420px) {
    .orders-table tr {
        overflow: visible;
    }

    /* Ensure container surfaces allow visible overflow so the badge can
               overlap the button without being clipped. */
    .table-surface {
        overflow: visible;
    }

    /* Make the row the positioning context and render the badge above
               the button. We set the button to static so the badge can be placed
               relative to the card (`tr`). This ensures the badge visually
               overlaps the button (badge 'eating' the button) and avoids
               clipping caused by other stacking contexts. */
    .orders-table tr {
        position: relative;
        z-index: 1;
    }

    .action-btn {
        position: static;
        z-index: 2;
        /* keep below the badge */
        overflow: visible;
    }

    .action-badge {
        position: absolute;
        top: 10px;
        right: 18px;
        z-index: 9999;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
        border: 2px solid rgba(0, 0, 0, 0.12);
        width: 26px;
        height: 26px;
        padding: 0;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #ef4444;
        color: #fff;
        line-height: 1;
        border-radius: 999px;
    }
}

/* Zoom por defecto en dispositivos móviles con al menos 350x620 (ajusta a 80%) */
@media (min-width: 350px) and (max-width: 720px) and (min-height: 620px) {
    .orders-table-container {
        /* Avoid scaling via CSS transform on small viewports: scaling leaves the
           original layout box size, which can create a gap/ghost-scroll below the
           visually smaller content. Use responsive spacing instead. */
        transform: none;
        -webkit-transform: none;
        transform-origin: initial;
        -webkit-transform-origin: initial;
    }

    /* Evitar que el contenedor quede recortado al escalar */
    .table-surface {
        overflow: visible;
    }
}

.pagination-nav {
       display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 auto;
    justify-content: center;
}

/* Make pagination safe on small screens: allow nav to wrap and page numbers to scroll
   horizontally inside their container instead of forcing viewport overflow. */
.pagination-nav {
    flex-wrap: wrap;
}

.page-numbers {
    max-width: 60%;
       overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.page-numbers::-webkit-scrollbar {
    height: 6px
}

.page-numbers::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px
}

@media (max-width: 420px) {
    .pagination-section {
        padding: 12px;
        gap: 8px
    }


    /* Mobile-first readability tweaks: force single column at narrow widths,
   stack label above value, allow wrapping and better spacing for 300x630 viewports. */
    @media (max-width: 420px) {
        .orders-table tbody {
            grid-template-columns: 1fr !important;
            padding: 8px;
            gap: 10px;
        }

        .orders-table tr {
            padding: 10px;
            gap: 8px;
            border-radius: 12px;
            overflow: visible;
            /* allow badges to be visible */
            font-size: 0.95rem;
        }

        /* Stack label above value to avoid cascading long lines */
        .orders-table td {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 8px 4px;
            gap: 6px;
        }

        .orders-table td::before {
            content: attr(data-label);
            margin: 0;
            font-size: 0.78rem;
            color: rgba(230, 235, 245, 0.85);
            opacity: 0.95;
            width: 100%;
        }

        /* Allow values to wrap naturally and prevent ellipses */
        .orders-table td>* {
            min-width: 0;
            max-width: 100%;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
            word-break: break-word;
        }

        .orders-table .truncate-cell,
        .orders-table td .doc-item-content .doc-item-meta {
            white-space: normal;
            overflow-wrap: anywhere;
        }

        .orders-table .cell-actions {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 4px;
        }

        .orders-table .cell-folio {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        /* Ensure badges stay visible but don't push layout */
        .action-badge,
        .documents-badge {
            position: relative;
            z-index: 60;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
            margin-left: 6px;
            flex: 0 0 auto;
        }

        /* Slightly larger touch targets for mobile */
        .action-btn {
            padding: 8px 10px;
        }

    }

    .pagination-info {
        order: 2;
        width: 100%;
        text-align: center
    }

    .pagination-nav {
        order: 1;
        width: 100%;
        justify-content: space-between
    }

    .pagination-btn {
        padding: 8px;
        font-size: 0.85rem
    }

    .pagination-btn span {
        display: none
    }

    /* icon-only to avoid width pressure */
    .page-numbers {
        max-width: calc(100% - 120px);
    }

    .page-number {
        width: 28px;
        height: 28px;
        font-size: 0.8rem
    }
}

.pagination-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(46, 221, 90, 0.1);
    border: 1px solid rgba(46, 221, 90, 0.3);
    color: rgba(46, 221, 90, 0.9);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
    background: rgba(46, 221, 90, 0.2);
    border-color: rgba(46, 221, 90, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(46, 221, 90, 0.15);
}

.page-numbers {
    display: flex;
    align-items: center;
    gap: 4px;
}

.page-number {
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(230, 235, 245, 0.7);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.page-number:hover {
    background: rgba(46, 221, 90, 0.15);
    color: #2edd5a;
    border-color: rgba(46, 221, 90, 0.3);
}

.page-number.active {
    background: rgba(46, 221, 90, 0.2);
    color: #2edd5a;
    border-color: rgba(46, 221, 90, 0.5);
    box-shadow: 0 2px 8px rgba(46, 221, 90, 0.15);
}

.page-ellipsis {
    color: rgba(230, 235, 245, 0.5);
    font-weight: 700;
    padding: 0 4px;
}

/* Accordion Styles */
.folio-with-accordion {
    display: flex;
    align-items: center;
    gap: 8px;
}

.accordion-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: rgba(46, 221, 90, 0.1);
    border: 1px solid rgba(46, 221, 90, 0.2);
    border-radius: 4px;
    cursor: pointer;
    color: rgba(46, 221, 90, 0.7);
    transition: all 0.2s ease;
}

.accordion-toggle:hover {
    background: rgba(46, 221, 90, 0.2);
    border-color: rgba(46, 221, 90, 0.4);
}

.accordion-toggle svg {
    transition: transform 0.2s ease;
}

.accordion-toggle.expanded svg {
    transform: rotate(180deg);
}

/* Accordion Row */
.accordion-row {
    background: rgba(46, 221, 90, 0.02);
    border-top: 1px solid rgba(46, 221, 90, 0.08);
    border-bottom: 1px solid rgba(46, 221, 90, 0.08);
}

.accordion-row td {
    padding: 16px 20px;
}

.accordion-content {
    display: flex;
    flex-direction: column;
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.item-list-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(46, 221, 90, 0.12);
    border-radius: 6px;
    transition: all 0.2s ease;
}

.item-list-row:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(46, 221, 90, 0.2);
}

.item-type-badge {
    flex-shrink: 0;
    padding: 4px 10px;
    background: rgba(46, 221, 90, 0.15);
    color: rgba(46, 221, 90, 0.9);
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
}

.item-details-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.item-main {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
}

.item-main-badges {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.item-main-badges {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.item-description {
    color: rgba(230, 235, 245, 0.9);
    font-weight: 500;
    word-break: break-word;
}

.item-qty-badge {
    flex-shrink: 0;
    padding: 2px 8px;
    background: rgba(46, 221, 90, 0.2);
    color: rgba(46, 221, 90, 0.8);
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 600;
}

.item-consumible-estado {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
}

.item-consumible-estado.is-nuevo {
    background: rgba(34, 197, 94, 0.2);
    color: rgba(46, 221, 90, 0.9);
}

.item-consumible-estado.is-usado {
    background: rgba(148, 163, 184, 0.22);
    color: rgba(203, 213, 225, 0.9);
}

.item-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
    padding-top: 6px;
    border-top: 1px solid rgba(46, 221, 90, 0.08);
}

.spec {
    color: rgba(230, 235, 245, 0.7);
    display: flex;
    gap: 4px;
}

.spec strong {
    color: rgba(230, 235, 245, 0.5);
    font-weight: 600;
}

/* Documents Cell Styles */
.cell-documents {
    text-align: center;
}

.documents-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.documents-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    background: rgba(59, 130, 246, 0.18);
    color: #0442a6;
    border: 1px solid rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
    cursor: default;
}

.documents-badge.clickable {
    cursor: pointer;
}

.documents-badge:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
}

.documents-badge.empty {
    background: rgba(148, 163, 184, 0.12);
    color: rgba(148, 163, 184, 0.8);
    border-color: rgba(148, 163, 184, 0.2);
}

.documents-badge.empty:hover {
    background: rgba(148, 163, 184, 0.18);
}

/* Old Styles - Keep for compatibility if needed */
.items-expanded-row {
    background: rgba(46, 221, 90, 0.03);
    border-top: 1px solid rgba(46, 221, 90, 0.1);
}

.items-expanded-row td {
    padding: 20px;
}

.items-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.items-header {
    font-weight: 600;
    color: rgba(230, 235, 245, 0.9);
    font-size: 0.95rem;
    margin-bottom: 8px;
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
}

.item-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(46, 221, 90, 0.15);
    border-radius: 8px;
    padding: 12px;
    transition: all 0.2s ease;
}

.item-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(46, 221, 90, 0.3);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(46, 221, 90, 0.1);
}

.item-tipo {
    font-weight: 600;
    color: rgba(46, 221, 90, 0.9);
    font-size: 0.9rem;
}

.item-qty {
    background: rgba(46, 221, 90, 0.15);
    color: rgba(46, 221, 90, 0.8);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.item-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.85rem;
}

.field-label {
    color: rgba(230, 235, 245, 0.6);
    font-weight: 500;
}

.field-value {
    color: rgba(230, 235, 245, 0.85);
    word-break: break-word;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .orders-table {
        font-size: 0.85rem;
    }

    .orders-table th {
        padding: 12px 10px;
        font-size: 0.7rem;
    }

    .orders-table td {
        padding: 10px;
    }

    .multi-delete-toolbar {
        padding: 12px 16px;
        gap: 12px;
    }

    .toolbar-left {
        gap: 12px;
        flex-wrap: wrap;
    }

    .btn-delete-selected {
        padding: 8px 12px;
        font-size: 0.85rem;
    }

    .pagination-section {
        flex-direction: column;
        gap: 12px;
        padding: 12px 16px;
    }

    .pagination-info {
        width: 100%;
        text-align: center;
    }

    .pagination-nav {
        width: 100%;
    }

    .cell-actions {
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    .action-btn {
        padding: 8px;
        min-width: 40px;
        min-height: 40px;
        flex-basis: calc(50% - 4px);
        /* 2x2 grid layout for tablet */
    }

    .action-btn svg {
        width: 18px;
        height: 18px;
    }

    .truncate-cell {
        max-width: 120px;
    }
}

@media (max-width: 480px) {
    .orders-table {
        font-size: 0.8rem;
    }

    .orders-table th {
        padding: 10px 8px;
        font-size: 0.65rem;
    }

    .orders-table td {
        padding: 8px 6px;
    }

    .header-content {
        gap: 4px;
    }

    .empty-state {
        padding: 40px 20px;
    }

    .cell-actions {
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    .action-btn {
        padding: 10px;
        min-width: 44px;
        min-height: 44px;
        border-radius: 10px;
        flex-basis: calc(33.333% - 4px);
        /* 3 column grid layout for mobile */
    }

    .action-btn svg {
        width: 18px;
        height: 18px;
    }
}

.history-badge {
    display: inline-block;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.14));
    color: #0442a6;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
    font-size: 0.75rem;
    margin-left: 8px;
    border: 1px solid rgba(59, 130, 246, 0.12);
}

.row-has-external {
    border-left: 4px solid rgba(249, 115, 22, 0.9);
    background: rgba(249, 115, 22, 0.08);
}

/* Asegurar que la etiqueta/estado en la fila no aparezca en verde cuando la orden contiene equipos externos */
.row-has-external .status-badge {
    background: linear-gradient(90deg, #f59e0b, #f97316);
    border-color: rgba(244, 114, 23, 0.8);
    color: #1a1206;
}

.row-has-history {
    border-left: 4px solid rgba(59, 130, 246, 0.9);
    background: rgba(59, 130, 246, 0.06);
}

.order-external-badge,
.order-history-badge {
    margin-left: 8px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #fff;
}

.order-external-badge {
    background: rgba(239, 68, 68, 0.8);
}

.order-history-badge {
    background: rgba(37, 99, 235, 0.8);
}

.item-external-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(239, 68, 68, 0.15);
    color: rgba(239, 68, 68, 0.9);
}

.item-history-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
}

.serial-history-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(30, 64, 175, 0.08);
    color: #e2e8f0;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.serial-history-btn:hover {
    border-color: rgba(37, 99, 235, 0.6);
    background: rgba(37, 99, 235, 0.16);
}

.history-count-badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: #a5b4fc;
}

.history-open-order-btn {
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 0.65rem;
    border: 1px solid rgba(96, 165, 250, 0.8);
    background: rgba(37, 99, 235, 0.12);
    color: #3b82f6;
    border-radius: 999px;
    cursor: pointer;
}

.history-open-order-btn:hover {
    background: rgba(37, 99, 235, 0.22);
}

.serial-history-panel {
    margin-top: 8px;
    padding: 12px;
    background: rgba(148, 163, 184, 0.08);
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.4);
}

.serial-history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
}

.serial-history-table th,
.serial-history-table td {
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    padding: 4px 6px;
    text-align: left;
}

.serial-history-table th {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.history-loading,
.history-error,
.history-empty {
    font-size: 0.75rem;
    color: #cbd5f5;
    margin: 0;
}

.history-error {
    color: #f87171;
}

.history-entry-badge {
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    background: rgba(56, 189, 248, 0.2);
    color: #0369a1;
    border: 1px solid rgba(56, 189, 248, 0.4);
}

.history-entry-badge.is-external {
    background: rgba(251, 146, 60, 0.2);
    color: #7c2d12;
    border: 1px solid rgba(251, 146, 60, 0.6);
}

.history-type-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-right: 4px;
    border: 1px solid transparent;
}

.history-type-badge-entrada { background: #047857; color: #d1fae5; border-color: #047857; }
.history-type-badge-salida { background: #991b1b; color: #fecaca; border-color: #991b1b; }
.history-type-badge-resguardo { background: #b45309; color: #fef3c7; border-color: #b45309; }
.history-type-badge-servicio { background: #1d4ed8; color: #dbeafe; border-color: #1d4ed8; }
.history-type-badge-default { background: #334155; color: #cbd5e1; border-color: #334155; }

.history-related-cell {
    min-width: 160px;
}

.history-related-info {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    background: rgba(15, 23, 42, 0.72);
    padding: 6px 8px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.22);
}

.history-related-fallback {
    background: rgba(75, 85, 99, 0.16);
}

.history-related-folio,
.history-related-date,
.history-related-actor {
    font-size: 0.72rem;
    color: #e2e8f0;
    font-weight: 600;
}

.history-related-folio {
    color: #93c5fd;
}

.history-related-date {
    color: #34d399;
}

.history-related-actor {
    color: #fbbf24;
}

.history-related-label {
    display: block;
    font-size: 0.65rem;
    color: #94a3b8;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
}

.history-related-none {
    font-size: 0.74rem;
    font-weight: 700;
    color: #f87171;
    background: rgba(248, 113, 113, 0.14);
    padding: 3px 6px;
    border-radius: 8px;
    border: 1px solid rgba(248, 113, 113, 0.35);
}

.row-has-external {
    border-left: 6px solid #f97316;
    background: linear-gradient(90deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02));
}

.row-has-history {
    border-left: 6px solid #2563eb;
    background: linear-gradient(90deg, rgba(37,99,235,0.06), rgba(37,99,235,0.02));
}

.row-cancelled {
    background: linear-gradient(90deg, rgba(255,95,109,0.06), rgba(255,153,102,0.02));
    color: #7f1d1d;
    border-left: 6px solid #ff5f6d;
    transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
}

.row-cancelled:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.row-cancelled .cell-folio {
    color: #ff6b6b;
    font-weight: 700;
}

.row-cancelled .status-badge {
    background: linear-gradient(90deg,#ff5f6d,#ff9966);
    border-color: rgba(255,95,109,0.4);
    color: #fff;
}

.order-cancelled-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 12px;
    background: linear-gradient(90deg, #ff5f6d 0%, #ff9966 100%);
    color: #fff;
    font-weight: 800;
    font-size: 0.92rem;
    box-shadow: 0 8px 22px rgba(255,95,109,0.14);
    transform-origin: left center;
    animation: slideInFromLeft 420ms cubic-bezier(.2,.9,.2,1) both, pulseGlow 1600ms ease-in-out 600ms infinite;
    position: relative;
    overflow: visible;
}

.order-cancelled-badge .cancel-icon { width: 14px; height:14px; color: rgba(255,255,255,0.95); }
.order-cancelled-badge .badge-text { margin-right: 2px; }

.order-cancelled-badge::before {
    content: '';
    position: absolute;
    left: -6px;
    right: -6px;
    top: -6px;
    bottom: -6px;
    border-radius: 14px;
    background: linear-gradient(90deg, rgba(255,95,109,0.08), rgba(255,153,102,0.06));
    filter: blur(8px);
    opacity: 0.0;
    transition: opacity 240ms ease, transform 240ms ease;
    pointer-events: none;
}

.order-cancelled-badge:hover::before {
    opacity: 1;
    transform: scale(1.02);
}

.order-cancelled-badge:hover {
    transform: translateY(-3px) rotate(-0.6deg) scale(1.02);
    box-shadow: 0 18px 38px rgba(0,0,0,0.12);
}

.order-cancelled-badge .cancel-info {
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    position: relative;
    cursor: help;
}

.order-cancelled-badge .info-icon { color: rgba(255,255,255,0.92); }

.cancel-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(6px) scale(0.98);
    white-space: nowrap;
    background: rgba(20,20,28,0.96);
    color: #fff;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.82rem;
    box-shadow: 0 8px 30px rgba(2,6,23,0.6);
    opacity: 0;
    pointer-events: none;
    transition: opacity 160ms 80ms ease, transform 160ms 80ms ease;
    z-index: 60;
}

.order-cancelled-badge:hover .cancel-tooltip,
.order-cancelled-badge:focus-within .cancel-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
    pointer-events: auto;
}

/* subtle shimmer over folio to make cancelled rows more alive */
.row-cancelled .folio-text { position: relative; overflow: hidden; }
.row-cancelled .folio-text::after {
    content: '';
    position: absolute;
    left: -40%;
    top: 0;
    width: 40%;
    height: 100%;
    transform: skewX(-18deg);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    animation: shimmer 2200ms linear infinite;
    pointer-events: none;
}

@keyframes shimmer {
    0% { left: -40%; }
    100% { left: 140%; }
}

@media (prefers-reduced-motion: reduce) {
    .order-cancelled-badge { animation: none !important; transition: none !important; }
    .row-cancelled .folio-text::after { animation: none !important; }
    .order-cancelled-badge:hover { transform: none !important; box-shadow: none !important; }
}

@keyframes slideInFromLeft {
    0% { opacity: 0; transform: translateX(-10px) scale(0.96); }
    60% { opacity: 1; transform: translateX(6px) scale(1.06); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
}

.btn.disabled-pill {
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.82);
    border: 1px solid rgba(255,255,255,0.04);
    cursor: not-allowed;
    font-weight: 700;
    font-size: 0.88rem;
    box-shadow: none;
}

@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(255,95,109,0.10); }
    50% { box-shadow: 0 0 0 10px rgba(255,153,102,0.03); }
    100% { box-shadow: 0 0 0 0 rgba(255,95,109,0.10); }
}

.documents-badge.cancelled { background: linear-gradient(90deg,#ff5f6d,#ff9966); color:#fff; border: none; }

/* Deshabilitar interacciones en la fila cancelada excepto el indicador 'Sin acciones' */
.row-cancelled .cell-actions > * {
    pointer-events: none;
    opacity: 0.48;
    filter: grayscale(0.08);
}
.row-cancelled .cell-actions .disabled-pill {
    pointer-events: auto;
    opacity: 1;
}
.row-cancelled a, .row-cancelled button:not(.disabled-pill) {
    pointer-events: none;
    opacity: 0.5;
}
</style>
