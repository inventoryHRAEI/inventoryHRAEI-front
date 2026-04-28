<template>
  <div class="edit-requests-view">
    <div class="page-container glass liquid-container-outer">
      
      <!-- Top Action Bar with Back Button on Left -->
      <div class="top-header">
        <button class="btn-back glass-btn" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span>Volver al Panel Principal</span>
        </button>
      </div>

      <div class="main-layout">
        <!-- Sidebar Panel -->
        <aside class="sidebar-panel glass liquid-container-inner">
          <div class="sidebar-section">
            <div class="header-icon pulse-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h3>Gestión de Ediciones</h3>
            <p class="intro-text">Aprueba solicitudes para ayudar a pasantes a corregir errores de redacción o identificación de bienes, mejorando la eficiencia en conjunto.</p>
          </div>

          <div class="sidebar-divider"></div>

          <div class="sidebar-section">
            <h4 class="section-title">Propósito del Panel</h4>
            
            <div class="impact-item">
              <div class="impact-indicator high"></div>
              <div class="impact-details">
                <h5>Trabajo en Equipo</h5>
                <p>Este panel permite brindar acceso de edición a pasantes o practicantes en las órdenes bajo la supervisión de un administrador.</p>
              </div>
            </div>
            
            <div class="impact-item">
              <div class="impact-indicator medium"></div>
              <div class="impact-details">
                <h5>Mejora Continua</h5>
                <p>Su objetivo es minimizar fallos comunes de redacción o de identificación de bienes o áreas de servicio, asegurando la calidad.</p>
              </div>
            </div>

            <div class="impact-item">
              <div class="impact-indicator low"></div>
              <div class="impact-details">
                <h5>Mayor Eficiencia</h5>
                <p>Colaborar en las órdenes de entrada, salida, resguardo o servicio nos ayuda a ser más rápidos y eficientes como equipo.</p>
              </div>
            </div>
          </div>
          
          <div class="spacer"></div>

          <!-- Innovative Widget: System Integrity Status -->
          <div class="system-status-widget">
             <div class="status-ring">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <div class="status-text">
                <span class="status-label">Estado del Sistema</span>
                <span class="status-value">Operativo</span>
             </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content-panel glass liquid-container-inner">
          <div class="panel-header">
            <div class="title-area">
              <h2>Solicitudes Pendientes</h2>
              <p>Aprueba o Rechaza una solicitud de edicion de una orden según sea requerido.</p>
            </div>
            
            <div class="filters-container">
              <div class="search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" v-model="searchQuery" placeholder="Buscar usuario o ID..." />
              </div>
              <select v-model="filterType" class="glass-select">
                <option value="">Todas las Operaciones</option>
                <option value="entrada">Entradas</option>
                <option value="salida">Salidas</option>
                <option value="resguardo">Resguardos</option>
                <option value="servicio">Servicios</option>
              </select>
            </div>
          </div>

          <div class="content-wrapper">
            <div v-if="loading" class="state-container loading-state">
              <div class="spinner-ring"></div>
              <p>Cargando solicitudes de edición ...</p>
            </div>
            
            <div v-else-if="filteredRequests.length === 0" class="state-container empty-state">
              <div class="empty-icon-glow">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3>Sistema al Día</h3>
              <p v-if="requests.length === 0">No hay solicitudes de edición en cola.</p>
              <p v-else>Ninguna solicitud coincide con tus filtros de búsqueda.</p>
            </div>

            <div v-else class="table-container">
              <table class="requests-table">
                <thead>
                  <tr>
                    <th>Solicitante</th>
                    <th>Operación</th>
                    <th>Folio</th>
                    <th>Fecha Solicitud</th>
                    <th class="actions-header">Decisión</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="req in filteredRequests" :key="req.id">
                    <td class="user-cell">
                      <div class="user-info">
                        <div class="user-avatar">{{ getInitials(req.user_name || 'U') }}</div>
                        <div class="user-details">
                          <span class="user-name">{{ req.user_name || `Usuario ID: ${req.user_id}` }}</span>
                          <span class="req-id">Req #{{ req.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="'badge-' + (req.operation_type || 'default')">
                        <span class="pulse-dot"></span>
                        {{ formatOperationType(req.operation_type) }}
                      </span>
                    </td>
                    <td class="ref-cell"><span class="font-mono">{{ req.operation_id }}</span></td>
                    <td class="date-cell">{{ formatDate(req.created_at) }}</td>
                    <td class="actions">
                      <button 
                        class="btn-action btn-approve" 
                        @click="updateStatus(req.id, 'approved')" 
                        :disabled="actionLoading === req.id"
                        title="Aprobar Edición"
                      >
                        <svg v-if="actionLoading === req.id" class="btn-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        <span class="btn-text">Autorizar</span>
                      </button>
                      <button 
                        class="btn-action btn-reject" 
                        @click="updateStatus(req.id, 'rejected')" 
                        :disabled="actionLoading === req.id"
                        title="Rechazar Edición"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        <span class="btn-text">Denegar</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authedFetch } from '@/utils/api'
import notifier from '@/utils/notifier'

const router = useRouter()
const requests = ref([])
const loading = ref(true)
const actionLoading = ref(null)

const searchQuery = ref('')
const filterType = ref('')

const filteredRequests = computed(() => {
  let result = requests.value

  // We exclude "mantenimiento" completely from the visible pool
  result = result.filter(r => r.operation_type?.toLowerCase() !== 'mantenimiento')

  if (filterType.value) {
    result = result.filter(r => r.operation_type?.toLowerCase() === filterType.value.toLowerCase())
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      (r.user_name && r.user_name.toLowerCase().includes(q)) || 
      (r.operation_id && r.operation_id.toLowerCase().includes(q)) ||
      r.id.toString().includes(q)
    )
  }

  return result
})

const goBack = () => {
  router.push('/dashboard')
}

const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await authedFetch('/api/edit-requests')
    if (res.ok) {
      requests.value = await res.json()
    } else {
      notifier.error('Error al cargar solicitudes')
    }
  } catch (err) {
    console.error(err)
    notifier.error('Error de red al cargar solicitudes')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  actionLoading.value = id
  try {
    const res = await authedFetch(`/api/edit-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })

    if (res.ok) {
      notifier.success(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`)
      requests.value = requests.value.filter(r => r.id !== id)
    } else {
      notifier.error('Error al procesar la solicitud')
    }
  } catch (err) {
    console.error(err)
    notifier.error('Error de red al procesar la solicitud')
  } finally {
    actionLoading.value = null
  }
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name.substring(0, 2).toUpperCase()
}

const formatOperationType = (type) => {
  if (!type) return 'Desconocido'
  const labels = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'resguardo': 'Resguardo',
    'servicio': 'Servicio',
    'mantenimiento': 'Mantenimiento'
  }
  return labels[type.toLowerCase()] || type
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateStr).toLocaleDateString('es-MX', options)
}

onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
.edit-requests-view {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 80px);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #f3f4f6;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Outer Wrapper (fills screen nicely) */
.page-container {
  width: 100%;
  max-width: 1600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 20px;
  min-height: 85vh;
}

.liquid-container-outer {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.4) 0%, rgba(15, 23, 42, 0.2) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03), 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Top Header */
.top-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.glass-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Dashboard Grid */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  flex: 1; /* stretches to fill remaining height */
}

/* Inner Glass Containers */
.liquid-container-inner {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.liquid-container-inner::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Sidebar */
.sidebar-panel {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 2rem;
  z-index: 1;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
}

.header-icon {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.8rem;
  border-radius: 12px;
  display: inline-flex;
  align-self: flex-start;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.pulse-glow {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  animation: pulse-shadow 2.5s infinite;
}

@keyframes pulse-shadow {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.sidebar-section h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.01em;
}

.intro-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  margin: 0;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  width: 100%;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.impact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.5rem 0;
}

.impact-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 0.4rem;
  flex-shrink: 0;
}

.impact-indicator.high { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6); }
.impact-indicator.medium { background: #fb923c; box-shadow: 0 0 8px rgba(251, 146, 60, 0.6); }
.impact-indicator.low { background: #818cf8; box-shadow: 0 0 8px rgba(129, 140, 248, 0.6); }

.impact-details h5 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
}

.impact-details p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}

.spacer {
  flex: 1;
}

.system-status-widget {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02));
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  z-index: 1;
}

.status-ring {
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgba(16, 185, 129, 0.8);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.status-value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

/* Main Content Panel */
.main-content-panel {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.panel-header {
  padding: 2rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.title-area h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.title-area p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.95rem;
}

/* Filters */
.filters-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.search-box input, .glass-select {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-box input {
  padding-left: 2.4rem;
  width: 240px;
}

.search-box input:focus, .glass-select:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.glass-select {
  cursor: pointer;
  appearance: none;
  padding-right: 2.2rem;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1.1em;
}

.glass-select option {
  background: #1e293b;
  color: white;
}

/* Content Area */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  padding: 0; /* Remove padding to maximize table width */
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
  padding: 2rem;
}

.spinner-ring {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.loading-state p {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 1.1rem;
}

.empty-icon-glow {
  color: #10b981;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%);
  padding: 2rem;
  border-radius: 50%;
  margin-bottom: 1rem;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.empty-state h3 {
  font-size: 1.6rem;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.05rem;
}

.table-container {
  width: 100%;
  overflow: hidden; /* Prevent horizontal scroll, force table to fit */
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Ensures columns respect widths and don't push outside */
}

.requests-table th {
  background: rgba(0, 0, 0, 0.15);
  text-align: left;
  padding: 1.2rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Fixed Widths for Columns to Guarantee Perfect Fit */
.requests-table th:nth-child(1) { width: 30%; } /* Solicitante */
.requests-table th:nth-child(2) { width: 18%; } /* Operación */
.requests-table th:nth-child(3) { width: 15%; } /* Folio */
.requests-table th:nth-child(4) { width: 15%; } /* Fecha */
.requests-table th:nth-child(5) { width: 22%; text-align: right; } /* Decisión */

.requests-table td {
  padding: 1.25rem 1.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  vertical-align: middle;
  word-wrap: break-word; /* Allows long text to break instead of expanding cell */
}

.requests-table tbody tr {
  transition: all 0.2s ease;
}

.requests-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.1));
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent text spilling */
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.req-id {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: inline-block;
}

.date-cell {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0,0,0,0.25);
  border: 1px solid transparent;
  white-space: nowrap;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.badge-neutral { color: #94a3b8; border-color: rgba(148, 163, 184, 0.2); }
.badge-neutral .pulse-dot { background-color: #94a3b8; }

.badge-entrada { color: #60a5fa; border-color: rgba(96, 165, 250, 0.2); background: rgba(59, 130, 246, 0.08); }
.badge-entrada .pulse-dot { background-color: #60a5fa; box-shadow: 0 0 8px rgba(96, 165, 250, 0.6); }

.badge-salida { color: #fb923c; border-color: rgba(251, 146, 60, 0.2); background: rgba(249, 115, 22, 0.08); }
.badge-salida .pulse-dot { background-color: #fb923c; box-shadow: 0 0 8px rgba(251, 146, 60, 0.6); }

.badge-resguardo { color: #f472b6; border-color: rgba(244, 114, 182, 0.2); background: rgba(236, 72, 153, 0.08); }
.badge-resguardo .pulse-dot { background-color: #f472b6; box-shadow: 0 0 8px rgba(244, 114, 182, 0.6); }

.badge-servicio { color: #818cf8; border-color: rgba(129, 140, 248, 0.2); background: rgba(99, 102, 241, 0.08); }
.badge-servicio .pulse-dot { background-color: #818cf8; box-shadow: 0 0 8px rgba(129, 140, 248, 0.6); }

.badge-default { color: #9ca3af; border-color: rgba(156, 163, 175, 0.2); }
.badge-default .pulse-dot { background-color: #9ca3af; }

/* Actions */
.actions-header {
  text-align: right;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap; /* Allows buttons to wrap on tight screens */
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0,0,0,0.25);
}

.btn-approve {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.btn-approve:hover:not(:disabled) { 
  background-color: rgba(16, 185, 129, 0.15); 
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-reject {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-reject:hover:not(:disabled) { 
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar-panel {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .sidebar-section {
    flex: 1;
    min-width: 300px;
  }

  .sidebar-divider {
    display: none;
  }

  .spacer {
    display: none;
  }

  .system-status-widget {
    width: 100%;
  }
}

@media (max-width: 800px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters-container {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box input {
    width: 100%;
  }

  /* Table tweaks for mobile - allow scrolling ONLY on very small devices if absolute necessary, but keep it fixed otherwise */
  .requests-table {
    table-layout: auto;
  }
}
</style>
