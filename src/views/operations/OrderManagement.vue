<template>
  <div>
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
                <button class="action-btn btn-edit" @click="editOrder(order)" title="Editar">
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

function editOrder(order) {
  router.push({ 
    name: 'op-entrada', 
    query: { 
      orderId: order.id, 
      from: 'order-management' 
    } 
  })
}

function downloadExcel(order) {
  console.log('Descargar Excel:', order.id)
  // Implementar descarga de Excel
}

function deleteOrder(orderId) {
  if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
    allOrders.value = allOrders.value.filter(o => o.id !== orderId)
    console.log('Orden eliminada:', orderId)
  }
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.filter-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(46, 221, 90, 0.5);
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.btn-clear-filters {
  padding: 10px 16px;
  background: rgba(255, 71, 71, 0.2);
  border: 1px solid rgba(255, 71, 71, 0.5);
  color: #ff4747;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  align-self: flex-end;
}

.btn-clear-filters:hover {
  background: rgba(255, 71, 71, 0.3);
}

.table-wrapper {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
}

.orders-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.orders-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
}

.orders-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.08);
}

.orders-table td {
  padding: 14px 12px;
  color: rgba(255, 255, 255, 0.85);
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
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
  border-color: #ff4747;
  color: #ff4747;
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
  background: rgba(46, 221, 90, 0.2);
  color: #2edd5a;
  border: 1px solid rgba(46, 221, 90, 0.5);
}

.badge-pendiente {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.5);
}

.badge-en-proceso {
  background: rgba(74, 144, 226, 0.2);
  color: #4a90e2;
  border: 1px solid rgba(74, 144, 226, 0.5);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 16px 0 8px 0;
  color: rgba(255, 255, 255, 0.9);
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
  color: rgba(255, 255, 255, 0.6);
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
}
</style>
