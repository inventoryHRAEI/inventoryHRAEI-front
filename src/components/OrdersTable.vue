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
      <button 
        v-if="multiDeleteMode && selectedForDelete.size > 0" 
        @click="deleteSelected"
        class="btn-delete-selected"
      >
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
        Eliminar seleccionadas ({{ selectedForDelete.size }})
      </button>
    </div>

    <!-- Table Wrapper -->
    <div class="table-surface">
      <table v-if="paginatedOrders.length > 0" class="orders-table">
        <thead>
          <tr>
            <th v-if="multiDeleteMode" class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="allSelectedOnPage"
                @change="toggleSelectAllOnPage"
                class="header-checkbox"
              />
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="order in paginatedOrders" :key="order.id">
            <!-- Fila principal de la orden con botón de accordion -->
            <tr class="table-row" :class="{ 'row-selected': selectedForDelete.has(order.id) }">
              <td v-if="multiDeleteMode" class="checkbox-cell">
                <input 
                  type="checkbox" 
                  :checked="selectedForDelete.has(order.id)"
                  @change="toggleOrderSelection(order.id)"
                  class="row-checkbox"
                />
              </td>
              <td class="cell-folio">
                <div class="folio-with-accordion">
                  <button 
                    v-if="(order.equiposEntrada || []).length > 0"
                    @click="toggleAccordion(order.id)"
                    class="accordion-toggle"
                    :class="{ 'expanded': expandedAccordions.has(order.id) }"
                    title="Ver artículos"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <span>{{ order.folio }}</span>
                  <button v-if="order.histCount > 0" class="history-badge" :title="`Versiones: ${order.histCount}`" @click.stop="$emit('openHistory', order)">{{ order.histCount }}</button>
                </div>
              </td>
              <td>{{ order.nombreSolicitante }}</td>
              <td>{{ formatDate(order.fecha) }}</td>
              <td v-if="showColumnService">{{ order.servicio }}</td>
              <td v-if="showColumnEspecialidad">{{ order.especialidad || '-' }}</td>
              <td v-if="showColumnMotivo">{{ order.motivoEntrada || '-' }}</td>
              <td v-if="showColumnDescripcion" class="truncate-cell">
                {{ (order.descripcion || '').slice(0, 60) || '-' }}
              </td>
              <td v-if="showColumnObservaciones" class="truncate-cell">
                {{ (order.observaciones || '').slice(0, 60) || '-' }}
              </td>
              <td v-if="showColumnIngeniero">{{ order.nombreIngeniero || '-' }}</td>
              <td v-if="showColumnHora">{{ order.horaInicio || '-' }}</td>
              <td v-if="showColumnHora">{{ order.horaTermino || '-' }}</td>
              <td v-if="showColumnTipo">{{ order.tipo || '-' }}</td>
              <td v-if="showColumnItems" class="items-count">
                <span class="count-badge">{{ (order.equiposEntrada || []).length }}</span>
              </td>
              <td v-if="showColumnEstado">
                <span class="status-badge" :class="`status-${(order.estado || 'pendiente').toLowerCase()}`">
                  {{ order.estado || 'Pendiente' }}
                </span>
              </td>
              <td class="cell-actions">
                <button
                  @click="$emit('edit', order)"
                  class="action-btn edit-btn"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
                <button
                  @click="$emit('excel', order)"
                  class="action-btn excel-btn"
                  title="Descargar Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </button>
                <button
                  @click="$emit('delete', order.id)"
                  class="action-btn delete-btn"
                  title="Eliminar"
                >
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
            <tr v-if="expandedAccordions.has(order.id) && (order.equiposEntrada || []).length > 0" class="accordion-row">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>
        <h3 class="empty-title">No hay órdenes</h3>
        <p class="empty-message">{{ emptyStateMessage }}</p>
        <button class="btn-create-empty" @click="$emit('create')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
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
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="pagination-btn prev-btn"
          title="Página anterior"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"></path>
          </svg>
          <span>Anterior</span>
        </button>

        <div class="page-numbers">
          <template v-for="page in pageNumbers" :key="page">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              :class="{ 'active': currentPage === page }"
              class="page-number"
            >
              {{ page }}
            </button>
            <span v-else class="page-ellipsis">...</span>
          </template>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-btn next-btn"
          title="Siguiente página"
        >
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

const emit = defineEmits(['edit', 'excel', 'delete', 'create', 'deleteMultiple'])

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

.toggle-switch input[type="checkbox"]:checked + .slider {
  background: rgba(46, 221, 90, 0.3);
  border-color: rgba(46, 221, 90, 0.5);
}

.toggle-switch input[type="checkbox"]:checked + .slider::after {
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
  overflow: hidden;
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
  gap: 8px;
  align-items: center;
  white-space: nowrap;
}

.action-btn {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(230, 235, 245, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.action-btn.edit-btn:hover {
  border-color: #299deb;
  color: #299deb;
  box-shadow: 0 4px 12px rgba(41, 157, 235, 0.2);
}

.action-btn.excel-btn:hover {
  border-color: #2edd5a;
  color: #2edd5a;
  box-shadow: 0 4px 12px rgba(46, 221, 90, 0.2);
}

.action-btn.delete-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
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

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  justify-content: center;
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
    gap: 6px;
  }

  .action-btn {
    padding: 6px;
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
    gap: 4px;
  }

  .action-btn {
    padding: 6px;
  }
}

.history-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.14));
  color: #0442a6;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 0.75rem;
  margin-left: 8px;
  border: 1px solid rgba(59,130,246,0.12);
}
</style>
