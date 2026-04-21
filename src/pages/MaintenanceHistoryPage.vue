<template>
  <div class="maintenance-history-page">
    <!-- Encabezado -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Historial de Mantenimientos</h1>
        <p class="page-subtitle">Gestión completa del historial de mantenimientos preventivos y correctivos</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="page-content">
      <!-- DataTable Profesional -->
      <MaintenanceHistoryDataTable 
        :data="maintenanceData"
        :loading="isLoading"
        @view-item="handleViewItem"
        @edit-item="handleEditItem"
        @delete-item="handleDeleteItem"
        @refresh="loadData"
      />
    </div>

    <!-- Modal de Detalles (Ejemplo) -->
    <Transition name="modal">
      <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Detalles del Mantenimiento</h2>
            <button @click="closeDetailModal" class="close-btn">✕</button>
          </div>
          <div v-if="selectedItem" class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">No. Inventario</span>
                <span class="value">{{ selectedItem['No DE INVENTARIO'] }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Equipo Médico</span>
                <span class="value">{{ selectedItem['EQUIPO MÉDICO'] }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Marca</span>
                <span class="value">{{ selectedItem.MARCA }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Modelo</span>
                <span class="value">{{ selectedItem.MODELO }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Serie</span>
                <span class="value">{{ selectedItem.SERIE }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Ubicación</span>
                <span class="value">{{ selectedItem.UBICACIÓN }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Estado</span>
                <span class="value" :class="`status-${getStatusClass(selectedItem.Estado)}`">
                  {{ selectedItem.Estado }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Tipo de Mantenimiento</span>
                <span class="value">{{ selectedItem['TIPO DE MANTENIMIENTO'] }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Fecha</span>
                <span class="value">{{ formatDate(selectedItem['FECHA MANTENIMIENTO']) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Responsable</span>
                <span class="value">{{ selectedItem.RESPONSABLE }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="label">Observaciones</span>
                <span class="value">{{ selectedItem.OBSERVACIONES || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDetailModal" class="btn-secondary">Cerrar</button>
            <button @click="openEditModal" class="btn-primary">Editar</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notificaciones -->
    <Transition name="notification">
      <div v-if="notification.show" class="notification" :class=`notification-${notification.type}`>
        <div class="notification-content">
          <span class="notification-icon">
            {{ notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ' }}
          </span>
          <span class="notification-text">{{ notification.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MaintenanceHistoryDataTable from '@/components/MaintenanceHistoryDataTable.vue'
import maintenanceService from '@/services/maintenanceTableService'

// ==================== ESTADO ====================
const maintenanceData = ref([])
const isLoading = ref(false)
const selectedItem = ref(null)
const showDetailModal = ref(false)
const notification = ref({
  show: false,
  type: 'info',
  message: ''
})

// ==================== CICLO DE VIDA ====================
onMounted(() => {
  loadData()
})

// ==================== MÉTODOS ====================

async function loadData() {
  isLoading.value = true
  try {
    const response = await maintenanceService.getHistory({
      page: 1,
      limit: 25
    })
    maintenanceData.value = response.data
    showNotification('success', 'Datos cargados correctamente')
  } catch (error) {
    console.error('Error loading data:', error)
    showNotification('error', 'Error al cargar los datos')
  } finally {
    isLoading.value = false
  }
}

function handleViewItem(item) {
  selectedItem.value = item
  showDetailModal.value = true
}

function handleEditItem(item) {
  selectedItem.value = item
  showNotification('info', `Editar modo para: ${item['EQUIPO MÉDICO']}`)
  // Aquí abrir modal de edición
}

function handleDeleteItem(item) {
  showNotification('info', `Eliminar: ${item['EQUIPO MÉDICO']}`)
  // Aquí pedir confirmación y eliminar
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedItem.value = null
}

function openEditModal() {
  closeDetailModal()
  console.log('Abrir modal de edición')
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  })
}

function getStatusClass(status) {
  if (!status) return 'gray'
  const s = status.toLowerCase()
  if (s.includes('operativo') || s.includes('funcionando')) return 'green'
  if (s.includes('mantenimiento')) return 'yellow'
  if (s.includes('fuera') || s.includes('reparación')) return 'red'
  return 'gray'
}

function showNotification(type, message) {
  notification.value = { show: true, type, message }
  setTimeout(() => {
    notification.value.show = false
  }, 4000)
}
</script>

<style scoped>
.maintenance-history-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%);
  min-height: 100vh;
}

/* ==================== ENCABEZADO ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #94a3b8;
}

/* ==================== CONTENIDO ==================== */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================== MODAL ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

.close-btn {
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #bfdbfe;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item .value {
  font-size: 0.95rem;
  color: #cbd5e1;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.1);
}

.status-green {
  color: #86efac;
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: rgba(34, 197, 94, 0.3) !important;
}

.status-yellow {
  color: #fde047;
  background: rgba(251, 191, 36, 0.1) !important;
  border-color: rgba(251, 191, 36, 0.3) !important;
}

.status-red {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.status-gray {
  color: #cbd5e1;
  background: rgba(100, 116, 139, 0.1) !important;
  border-color: rgba(100, 116, 139, 0.3) !important;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(96, 165, 250, 0.1);
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  border-color: rgba(96, 165, 250, 0.2);
}

.btn-secondary:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(96, 165, 250, 0.4);
}

/* ==================== NOTIFICACIONES ==================== */
.notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  max-width: 400px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.notification-success {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.notification-error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.notification-info {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #bfdbfe;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-icon {
  font-weight: bold;
  flex-shrink: 0;
}

.notification-text {
  font-size: 0.9rem;
}

/* ==================== TRANSICIONES ==================== */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(400px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 768px) {
  .maintenance-history-page {
    padding: 12px;
    gap: 16px;
  }

  .page-header {
    flex-direction: column;
    padding: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .modal-content {
    max-width: 90vw;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .notification {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>
