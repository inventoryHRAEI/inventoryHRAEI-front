<template>
    <div class="orders-table-container">
        <!-- Multi-delete toggle and delete selected button -->
        <div v-if="paginatedOrders.length > 0" class="multi-delete-toolbar">
            <div class="toolbar-left">
                <label class="toggle-switch">
                    <input type="checkbox" v-model="multiDeleteMode" />
                    <span class="slider"></span>
                    <span class="toggle-label">Eliminar varios</span>
                </label>
                <span v-if="multiDeleteMode && selectedForDelete.size > 0" class="selected-count">
                    {{ selectedForDelete.size }} seleccionado{{ selectedForDelete.size !== 1 ? 's' : '' }}
                </span>
            </div>
            <button v-if="multiDeleteMode && selectedForDelete.size > 0" @click="deleteSelected"
                class="btn-delete-selected">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                    </path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Eliminar seleccionadas ({{ selectedForDelete.size }})
            </button>
        </div>

        <!-- Table Wrapper -->
        <div class="table-surface">
            <table v-if="paginatedOrders.length > 0" class="orders-table">
                <thead>
                    <tr>
                        <th v-if="multiDeleteMode" class="checkbox-col">
                            <input type="checkbox" :checked="allSelectedOnPage" @change="toggleSelectAllOnPage"
                                class="header-checkbox" />
                        </th>
                        <th>Folio</th>
                        <th>Solicitante</th>
                        <th>Fecha</th>
                        <th v-if="showColumnService">Servicio</th>
                        <th v-if="showColumnEspecialidad">Especialidad</th>
                        <th v-if="showColumnMotivo">Motivo</th>
                        <th v-if="showColumnDescripcion">Descripción</th>
                        <th v-if="showColumnObservaciones">Observaciones</th>
                        <th v-if="showColumnIngeniero">Ingeniero</th>
                        <th v-if="showColumnHora">Hora Inicio</th>
                        <th v-if="showColumnHora">Hora Término</th>
                        <th v-if="showColumnTipo">Tipo</th>
                        <th v-if="showColumnItems">Items</th>
                        <th v-if="showColumnEstado">Estado</th>
                        <th>Documentos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="order in paginatedOrders" :key="order.id">
                        <!-- Fila principal de la orden con botón de accordion -->
                        <tr class="table-row" :class="{ 'row-selected': selectedForDelete.has(order.id) }">
                            <td v-if="multiDeleteMode" class="checkbox-cell" data-label="Seleccionar">
                                <input type="checkbox" :checked="selectedForDelete.has(order.id)"
                                    @change="toggleOrderSelection(order.id)" class="row-checkbox" />
                            </td>
                            <td class="cell-folio" data-label="Folio">
                                <div class="folio-with-accordion">
                                    <button v-if="(order.equiposEntrada || []).length > 0"
                                        @click="toggleAccordion(order.id)" class="accordion-toggle"
                                        :class="{ 'expanded': expandedAccordions.has(order.id) }" title="Ver artículos">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>
                                    <span>{{ order.folio }}</span>
                                </div>
                            </td>
                            <td data-label="Solicitante">{{ order.nombreSolicitante }}</td>
                            <td data-label="Fecha">{{ formatDate(order.fecha) }}</td>
                            <td v-if="showColumnService" data-label="Servicio">{{ order.servicio }}</td>
                            <td v-if="showColumnEspecialidad" data-label="Especialidad">{{ order.especialidad || '-' }}
                            </td>
                            <td v-if="showColumnMotivo" data-label="Motivo">{{ order.motivoEntrada || '-' }}</td>
                            <td v-if="showColumnDescripcion" class="truncate-cell" data-label="Descripción">
                                {{ (order.descripcion || '').slice(0, 60) || '-' }}
                            </td>
                            <td v-if="showColumnObservaciones" class="truncate-cell" data-label="Observaciones">
                                {{ (order.observaciones || '').slice(0, 60) || '-' }}
                            </td>
                            <td v-if="showColumnIngeniero" data-label="Ingeniero">{{ order.nombreIngeniero || '-' }}
                            </td>
                            <td v-if="showColumnHora" data-label="Hora Inicio">{{ order.horaInicio || '-' }}</td>
                            <td v-if="showColumnHora" data-label="Hora Término">{{ order.horaTermino || '-' }}</td>
                            <td v-if="showColumnTipo" data-label="Tipo">{{ order.tipo || '-' }}</td>
                            <td v-if="showColumnItems" class="items-count" data-label="Items">
                                <span class="count-badge">{{ (order.equiposEntrada || []).length }}</span>
                            </td>
                            <td v-if="showColumnEstado" data-label="Estado">
                                <span class="status-badge"
                                    :class="`status-${(order.estado || 'pendiente').toLowerCase()}`">
                                    {{ order.estado || 'Pendiente' }}
                                </span>
                            </td>
                            <td class="cell-documents" data-label="Documentos">
                                <div class="documents-container">
                                    <button v-if="(order.documentCount || 0) > 0"
                                        @click="$emit('openHistory', JSON.parse(JSON.stringify(order)))"
                                        class="documents-badge clickable"
                                        :title="`Ver ${order.documentCount} documento${order.documentCount !== 1 ? 's' : ''}`">
                                        {{ order.documentCount }} documento{{ order.documentCount !== 1 ? 's' : '' }}
                                    </button>
                                    <button v-else @click="$emit('openHistory', JSON.parse(JSON.stringify(order)))"
                                        class="documents-badge empty clickable" title="Ver documentos">
                                        Sin documentos
                                    </button>
                                </div>
                            </td>
                            <td class="cell-actions" data-label="Acciones">
                                <button @click="$emit('openHistory', JSON.parse(JSON.stringify(order)))"
                                    class="action-btn doc-btn" title="Documentos">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    <span v-if="order.documentCount && order.documentCount > 0" class="action-badge">{{
                                        order.documentCount }}</span>
                                </button>
                                <button @click="$emit('upload', order)" class="action-btn upload-btn"
                                    title="Subir archivos">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </button>
                                <button @click="$emit('edit', order)" class="action-btn edit-btn" title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                    </svg>
                                </button>
                                <!-- Excel button removed (duplicated icon). Use the Document button to open document modal. -->
                                <button @click="$emit('delete', order.id)" class="action-btn delete-btn"
                                    title="Eliminar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                        </path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </td>
                        </tr>

                        <!-- Accordion con items (se despliega debajo de la orden) -->
                        <tr v-if="expandedAccordions.has(order.id) && (order.equiposEntrada || []).length > 0"
                            class="accordion-row">
                            <td :colspan="getColSpan()">
                                <div class="accordion-content">
                                    <div class="items-list">
                                        <div v-for="item in order.equiposEntrada" :key="item.id" class="item-list-row">
                                            <div class="item-type-badge">{{ item.tipo }}</div>
                                            <div class="item-details-col">
                                                <div class="item-main">
                                                    <span class="item-description">{{ item.descripcion || '-' }}</span>
                                                    <span class="item-qty-badge">x{{ item.cantidad }}</span>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

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
        <div v-if="paginatedOrders.length > 0" class="pagination-section">
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
import { computed, ref } from 'vue'

const props = defineProps({
    filteredOrders: {
        type: Array,
        required: true,
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

const emit = defineEmits(['edit', 'excel', 'delete', 'create', 'deleteMultiple', 'openHistory', 'upload'])

const currentPage = ref(1)
const itemsPerPage = 10
const multiDeleteMode = ref(false)
const selectedForDelete = ref(new Set())
const expandedAccordions = ref(new Set())  // Estado para acordeones expandidos

const totalPages = computed(() => Math.ceil(props.filteredOrders.length / itemsPerPage))



const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return props.filteredOrders.slice(start, end)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, props.filteredOrders.length))

const pageNumbers = computed(() => {
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

function getColSpan() {
    let colCount = 5 // Folio, Solicitante, Fecha, Items, Acciones
    if (props.showColumnService) colCount++
    if (props.showColumnEspecialidad) colCount++
    if (props.showColumnMotivo) colCount++
    if (props.showColumnDescripcion) colCount++
    if (props.showColumnObservaciones) colCount++
    if (props.showColumnIngeniero) colCount++
    if (props.showColumnHora) colCount += 2
    if (props.showColumnTipo) colCount++
    if (props.showColumnItems) colCount++
    if (props.showColumnEstado) colCount++
    if (multiDeleteMode.value) colCount++
    return colCount
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
    padding: 10px 16px;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.4);
    color: #ff6b6b;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    flex: 0 1 auto;
}

.btn-delete-selected:hover {
    background: rgba(255, 107, 107, 0.25);
    border-color: rgba(255, 107, 107, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
}

.btn-delete-selected:active {
    transform: translateY(0);
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

/* TABLE SURFACE */
.table-surface {
    background: rgba(13, 20, 35, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    overflow: visible;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px) saturate(120%);
    margin-bottom: 0;
}

/* ORDERS TABLE */
.orders-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.orders-table thead {
    background: linear-gradient(90deg, rgba(46, 221, 90, 0.08), rgba(74, 144, 226, 0.05));
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.orders-table th {
    padding: 16px 14px;
    text-align: left;
    font-weight: 700;
    color: rgba(230, 235, 245, 0.9);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.4px;
    transition: all 0.2s ease;
}



.orders-table tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
    background: transparent;
    overflow: visible;
    display: table-row;
}

.orders-table tbody tr:hover {
    background: rgba(46, 221, 90, 0.08);
}

.orders-table tbody tr:last-child {
    border-bottom: none;
}

.orders-table td {
    padding: 14px;
    color: rgba(230, 235, 245, 0.85);
    vertical-align: middle;
    overflow: visible !important;
}

.cell-folio {
    font-weight: 700;
    color: #2edd5a;
}

.truncate-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

/* CELL ACTIONS */
.cell-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    justify-content: flex-start;
    overflow: visible !important;
    padding: 8px 8px 0 0 !important;
    margin: 0 !important;
}

.action-btn {
    position: relative;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(230, 235, 245, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
    flex-shrink: 0;
    overflow: visible !important;
    /* Margen para reservar espacio al badge (position:absolute) */
    margin: 0 2px 0 0 !important;
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
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
</style>
