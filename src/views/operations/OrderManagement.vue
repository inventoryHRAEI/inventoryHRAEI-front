<template>
  <div class="order-management-container">
    <ActionPanel class="order-management-main">
      <template #title>
        <div class="title-row">
          <span>Gestión de Órdenes de Entrada</span>
          <button class="btn-create-order" @click="goToCreateOrder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Orden
          </button>
        </div>
      </template>

      <Breadcrumbs />

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Buscar por folio o solicitante:</label>
          <input
            v-model="searchTerm"
            type="text"
            class="control filter-input"
            placeholder="Ingresa folio o nombre..."
          />
        </div>
        <div class="filter-group">
          <label>Filtrar por fecha:</label>
          <input
            v-model="filterDate"
            type="date"
            class="control filter-input"
          />
        </div>
        <div class="filter-group">
          <label>Filtrar por servicio:</label>
          <input
            v-model="filterService"
            type="text"
            class="control filter-input"
            placeholder="Ej. Urgencias..."
          />
        </div>
        <button class="btn-clear-filters" @click="clearFilters" v-if="hasActiveFilters">
          Limpiar filtros
        </button>
      </div>

      <!-- Datatable -->
      <div class="table-wrapper">
        <table class="orders-table" v-if="filteredOrders.length > 0">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Solicitante</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" class="order-row">
              <td class="cell-folio">{{ order.folio }}</td>
              <td>{{ order.nombreSolicitante }}</td>
              <td>{{ order.servicio }}</td>
              <td>{{ formatDate(order.fecha) }}</td>
              <td>{{ order.horaInicio }}</td>
              <td>
                <span class="badge" :class="`badge-${order.estado || 'pendiente'}`">
                  {{ order.estado || 'Pendiente' }}
                </span>
              </td>
              <td class="cell-actions">
                <button class="action-btn btn-edit" @click="openEditModal(order)" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
                <button class="action-btn btn-excel" @click="downloadExcel(order)" title="Descargar Excel">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </button>
                <button class="action-btn btn-delete" @click="deleteOrder(order.id)" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h3>No hay órdenes</h3>
          <p>{{ searchTerm || filterDate || filterService ? 'No se encontraron órdenes con los filtros seleccionados.' : 'Comienza creando una nueva orden.' }}</p>
          <button class="btn-create-empty" @click="goToCreateOrder">Crear primera orden</button>
        </div>
      </div>

      <!-- Información de resultados -->
      <div v-if="filteredOrders.length > 0" class="results-info">
        Mostrando {{ filteredOrders.length }} de {{ allOrders.length }} órdenes
      </div>
    </ActionPanel>

    <!-- Modal de Edición con estructura completa OpEntrada -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content-full op-entrada-modal-full" @click.stop>
          <button class="modal-close" @click="closeEditModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="modal-header">
            <h2 class="modal-title">Editar Orden: {{ editingOrder?.folio }}</h2>
          </div>

          <form class="op-entrada-form modal-form-full" @submit.prevent="updateAndDownloadExcel">
            <!-- Datos del Solicitante -->
            <div class="section-card combined-card">
              <div class="section-head">
                <h4>Datos del Solicitante</h4>
                <small class="hint">Información de quien solicita la entrada</small>
              </div>
              <div class="section-grid combined">
                <div class="field">
                  <label>Nombre del Solicitante</label>
                  <input v-model.trim="editingOrder.nombreSolicitante" class="control" placeholder="Ej. Dr. Juan Pérez" />
                </div>
                <div class="field">
                  <label>Servicio</label>
                  <input v-model.trim="editingOrder.servicio" class="control" placeholder="Ej. Urgencias" />
                </div>
                <div class="field">
                  <label>Especialidad</label>
                  <input v-model.trim="editingOrder.especialidad" class="control" placeholder="Ej. Urgencias" />
                </div>
                <div class="field">
                  <label>Folio</label>
                  <input v-model.trim="editingOrder.folio" class="control" disabled />
                </div>
                <div class="field">
                  <label>Fecha</label>
                  <input v-model="editingOrder.fecha" type="date" class="control" />
                </div>
                <div class="field">
                  <label>Hora de inicio</label>
                  <input v-model="editingOrder.horaInicio" type="time" class="control" />
                </div>
                <div class="field">
                  <label>Hora de término</label>
                  <input v-model="editingOrder.horaTermino" type="time" class="control" />
                </div>
              </div>
            </div>

            <!-- Motivo y Descripción -->
            <div class="section-card combined-card">
              <div class="section-head">
                <h4>Motivo y Descripción de Entrada</h4>
                <small class="hint">Especifica el motivo y una descripción de la entrada</small>
              </div>
              <div class="section-grid combined">
                <div class="field" style="grid-column: span 6;">
                  <label>Motivo de Entrada</label>
                  <input v-model.trim="editingOrder.motivoEntrada" class="control" placeholder="Ej. Compra, Reparación, Donación" />
                </div>
                <div class="field" style="grid-column: 1 / -1;">
                  <label>Descripción de Entrada</label>
                  <textarea v-model.trim="editingOrder.descripcion" class="control" placeholder="Describe los detalles de la entrada" style="resize: vertical; min-height: 180px; padding: 12px 18px;"></textarea>
                </div>
              </div>
            </div>

            <!-- Observaciones e Ingeniero -->
            <div class="section-card combined-card">
              <div class="section-head">
                <h4>Observaciones y Soporte</h4>
                <small class="hint">Anota observaciones y el nombre del ingeniero residente de apoyo</small>
              </div>
              <div class="section-grid combined">
                <div class="field" style="grid-column: span 12;">
                  <label>Observaciones</label>
                  <textarea v-model.trim="editingOrder.observaciones" class="control" placeholder="Escribe observaciones aquí" style="min-height: 120px;"></textarea>
                  <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                    <label class="btn secondary" style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px;">
                      Subir imagen
                      <input type="file" accept="image/*" @change="onEditObservacionesImgChange" style="display:none;" />
                    </label>
                    <div v-if="editingOrder.observacionesImg" class="observ-img-preview" style="display:flex; align-items:center; gap:10px;">
                      <img :src="editingOrder.observacionesImg.dataUrl || editingOrder.observacionesImg" alt="preview" style="width:90px; height:56px; object-fit:cover; border-radius:8px; border:1px solid rgba(255,255,255,0.1)" />
                      <div style="display:flex; flex-direction:column; gap:6px;">
                        <span style="font-weight:700; color:rgba(255,255,255,0.9)">{{ typeof editingOrder.observacionesImg === 'string' ? 'Imagen' : editingOrder.observacionesImg.name }}</span>
                        <button type="button" class="btn secondary" @click="removeEditObservacionesImg" style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="field ing-res">
                  <label>Ingeniero residente (apoyo)</label>
                  <input v-model.trim="editingOrder.nombreIngeniero" class="control" placeholder="Nombre del ingeniero residente" />
                </div>
              </div>
            </div>

            <!-- Equipos / Artículos -->
            <div class="section-card combined-card">
              <div class="section-head">
                <h4>Equipo Médico, Accesorio o Consumible que Entra</h4>
                <small class="hint">Artículos en esta orden</small>
              </div>
              <div v-if="editingOrder.equiposEntrada && editingOrder.equiposEntrada.length > 0" class="items-list-edit">
                <div v-for="(item, index) in editingOrder.equiposEntrada" :key="index" class="item-row-edit">
                  <div class="item-head-edit">
                    <span class="badge">#{{ index + 1 }}</span>
                    <span style="font-weight: 700;">{{ item.tipo }}</span>
                    <span style="margin-left: 10px; color: rgba(255,255,255,0.6);">x{{ item.cantidad }}</span>
                  </div>
                  <div style="display:flex; gap:8px;">
                    <div style="flex:1; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                      <p style="margin:0; font-size:0.85rem; color:rgba(255,255,255,0.7);">{{ item.descripcion || item.nombre || 'Sin descripción' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else style="color: rgba(255, 255, 255, 0.5); font-style: italic; text-align: center; margin: 20px 0;">
                No hay artículos agregados en esta orden
              </p>
            </div>

            <!-- Estado -->
            <div class="section-card combined-card">
              <div class="section-head">
                <h4>Estado de la Orden</h4>
              </div>
              <div class="section-grid combined">
                <div class="field">
                  <label>Estado</label>
                  <select v-model="editingOrder.estado" class="control">
                    <option value="pendiente">Pendiente</option>
                    <option value="en-proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="modal-actions-full">
              <button type="button" class="btn secondary cancel-btn" @click="closeEditModal">
                Cancelar
              </button>
              <button type="submit" class="btn primary save-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Actualizar y Descargar Excel
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const router = useRouter()

const allOrders = ref([])
const searchTerm = ref('')
const filterDate = ref('')
const filterService = ref('')
const loading = ref(true)
const showEditModal = ref(false)
const editingOrder = ref(null)

const hasActiveFilters = computed(() => {
  return searchTerm.value || filterDate.value || filterService.value
})

const filteredOrders = computed(() => {
  return allOrders.value.filter(order => {
    const matchSearch = 
      !searchTerm.value || 
      order.folio?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      order.nombreSolicitante?.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchDate = !filterDate.value || order.fecha === filterDate.value
    
    const matchService = 
      !filterService.value || 
      order.servicio?.toLowerCase().includes(filterService.value.toLowerCase())
    
    return matchSearch && matchDate && matchService
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

function openEditModal(order) {
  editingOrder.value = JSON.parse(JSON.stringify(order))
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingOrder.value = null
}

function updateAndDownloadExcel() {
  const index = allOrders.value.findIndex(o => o.id === editingOrder.value.id)
  if (index !== -1) {
    allOrders.value[index] = editingOrder.value
    // Generar y descargar el Excel corregido
    downloadExcelWithData(editingOrder.value)
    closeEditModal()
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

function deleteOrder(orderId) {
  if (confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) {
    allOrders.value = allOrders.value.filter(o => o.id !== orderId)
    console.log('Orden eliminada:', orderId)
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
  searchTerm.value = ''
  filterDate.value = ''
  filterService.value = ''
}

// Simular carga de órdenes desde API
function loadOrders() {
  loading.value = true
  
  // Datos de ejemplo - reemplazar con llamada a API
  const mockOrders = [
    {
      id: 1,
      folio: '5-011',
      nombreSolicitante: 'Dr. Juan Pérez',
      servicio: 'Urgencias',
      especialidad: 'Medicina General',
      fecha: '2024-12-09',
      horaInicio: '08:00',
      horaTermino: '10:00',
      motivoEntrada: 'Compra',
      descripcion: 'Ingreso de equipos médicos nuevos',
      estado: 'completado'
    },
    {
      id: 2,
      folio: '5-012',
      nombreSolicitante: 'Dra. María González',
      servicio: 'Quirófano',
      especialidad: 'Cirugía',
      fecha: '2024-12-08',
      horaInicio: '14:00',
      horaTermino: '16:00',
      motivoEntrada: 'Reparación',
      descripcion: 'Equipo retornado después de mantenimiento',
      estado: 'completado'
    },
    {
      id: 3,
      folio: '5-013',
      nombreSolicitante: 'Dr. Carlos López',
      servicio: 'Urgencias',
      especialidad: 'Traumatología',
      fecha: '2024-12-10',
      horaInicio: '09:30',
      horaTermino: null,
      motivoEntrada: 'Donación',
      descripcion: 'Equipos donados por institución externa',
      estado: 'pendiente'
    }
  ]
  
  setTimeout(() => {
    allOrders.value = mockOrders
    loading.value = false
  }, 800)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-management-container {
  width: 100%;
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

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
  padding: 16px;
  background: rgba(10, 15, 25, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.filter-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(46, 221, 90, 0.5);
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.btn-clear-filters {
  padding: 10px 16px;
  background: rgba(255, 71, 71, 0.15);
  border: 1px solid rgba(255, 71, 71, 0.4);
  color: #ff6b6b;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  align-self: flex-end;
}

.btn-clear-filters:hover {
  background: rgba(255, 71, 71, 0.25);
}

.table-wrapper {
  background: rgba(10, 15, 25, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
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
}
</style>
