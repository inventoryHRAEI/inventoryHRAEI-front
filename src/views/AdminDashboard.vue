<template>
  <ActionPanel class="dashboard-main">
    <template #title>
      <div class="title-row">
        <span>Administrador — Gestión</span>
        <div class="admin-badge">
          <ShieldCheckIcon class="badge-icon" />
          <span>Admin</span>
        </div>
      </div>
    </template>
    
    <Breadcrumbs />

    <div class="cards-panel">
      <LoadingSkeleton v-if="loading" type="cards" :count="6" />
      
      <div v-else class="area-grid">
        <div
          class="area-card card-shimmer"
          v-for="op in operations"
          :key="op.name"
          :class="{ embedded: isEmbedded(op.name) }"
          role="button"
          @click.prevent="go(op.name)"
        >
          <div class="card-media">
            <img class="card-img" :src="op.img" :alt="op.label" />
            <div class="card-icon-badge">
              <component :is="op.icon" />
            </div>
            <div v-if="pendingByOperation[op.name]" class="pending-badge badge-pulse">
              {{ pendingByOperation[op.name] }} pendientes
            </div>
          </div>
          <div class="card-body">
            <div class="card-title">{{ op.label }}</div>
            <div class="card-sub small">{{ op.desc }}</div>
            <div class="card-actions">
              <button class="btn ghost btn-ripple" @click.stop.prevent="go(op.name)">
                <ArrowRightIcon class="btn-icon" />
                Ir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import pendingStore from '@/stores/pendingRequestsStore'
import notifier from '@/utils/notifier'
import { confirmDelete, showSuccess, showError, showLoading, closeModal as closeSwalModal } from '@/utils/sweetAlertConfig'
import { useRouter, useRoute } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

import imgEntrada from '@/images/entrada_equips.png'
import imgSalida from '@/images/salida_equipo.png'
import imgResguardo from '@/images/Resguardo_imagen.png'
import imgServicio from '@/images/Servicio_equipo.png'
import imgInventario from '@/images/Inventario.png'
import imgConsumibles from '@/images/Consumibles_bajo_pedido.png'

const router = useRouter()
const route = useRoute()
const loading = ref(true)

const operations = [
  { name: 'op-entrada', label: 'Órdenes de Entrada', desc: 'Captura de entradas de equipo/material.', img: imgEntrada, icon: ArrowDownTrayIcon },
  { name: 'op-salida', label: 'Órdenes de Salida', desc: 'Registro de salidas y egresos.', img: imgSalida, icon: ArrowUpTrayIcon },
  { name: 'op-resguardo', label: 'Resguardo', desc: 'Asignaciones y resguardos.', img: imgResguardo, icon: ShieldCheckIcon },
  { name: 'op-servicio', label: 'Servicio', desc: 'Órdenes de servicio y mantenimiento.', img: imgServicio, icon: WrenchScrewdriverIcon },
  { name: 'op-inventario-biomedica', label: 'Inventario Biomédica', desc: 'Inventario y conteos.', img: imgInventario, icon: ClipboardDocumentListIcon },
  { name: 'op-insumos-consumibles', label: 'Insumos y Consumibles', desc: 'Gestión de insumos.', img: imgConsumibles, icon: CubeIcon }
]

const pendingByOperation = ref({})

function go(name) {
  try { navigateAndRefresh(router, { name }) } catch {}
}

function isEmbedded(opName) {
  try {
    const rn = route && route.name ? String(route.name) : ''
    if (rn === opName) return true
    const q = route && route.query ? route.query.area : null
    if (q && String(q) === opName) return true
  } catch (e) {}
  return false
}

const currentUser = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre'), role: localStorage.getItem('role'), email: localStorage.getItem('email') }
const isAdmin = currentUser && currentUser.role === 'admin'

const pendingCounts = ref({})
const showRequestsModal = ref(false)
const modalRequests = ref([])
const modalEmail = ref('')
const showUsers = ref(false)
const users = ref([])

onMounted(async () => {
  setTimeout(() => {
    loading.value = false
  }, 1500)
  
  try { await pendingStore.refresh() } catch {}
  
  try {
    const res = await fetch('/api/auth/users')
    users.value = await res.json()
    showUsers.value = true
    await loadPermissionRequests()
  } catch (e) {
    console.error('No se pudieron obtener usuarios:', e)
  }

  try { window.dispatchEvent(new CustomEvent('route:mounted', { detail: { name: route.name, path: route.fullPath } })); console.debug('[AdminDashboard] dispatched route:mounted', { name: route.name, path: route.fullPath }) } catch (e) {}

  // Refresh permission requests when global recreate event triggers
  const onRecreate = () => { try { loadPermissionRequests().catch(() => {}) } catch {} }
  window.addEventListener('app:force-recreate', onRecreate)
  onBeforeUnmount(() => { window.removeEventListener('app:force-recreate', onRecreate) })
})

async function loadPermissionRequests() {
  try {
    const res = await fetch('/api/auth/permission-requests')
    if (!res.ok) { console.warn('No se pudieron cargar solicitudes'); pendingCounts.value = {}; return }
    const rows = await res.json()
    const map = {}
    for (const r of rows) {
      if (r.status === 'pending') map[r.email] = (map[r.email] || 0) + 1
    }
    pendingCounts.value = map
  } catch (e) { console.error('Error cargando permission requests:', e); pendingCounts.value = {} }
}

async function openUserRequests(email) {
  modalEmail.value = email
  showRequestsModal.value = true
  try {
    const res = await fetch('/api/auth/permission-requests')
    const rows = await res.json()
    modalRequests.value = rows.filter(r => r.email === email)
  } catch (e) { modalRequests.value = []; notifier.error('No se pudieron cargar solicitudes') }
}

function closeModal() { showRequestsModal.value = false; modalRequests.value = []; modalEmail.value = '' }

async function approveRequest(id) {
  try {
    const confirm = await confirmDelete('Aprobar solicitud', '¿Confirmas que deseas aprobar esta solicitud y actualizar el rol del usuario?', 1, 'Sí, aprobar', 'Cancelar')
    if (!confirm.isConfirmed) return
    showLoading()
    const res = await fetch(`/api/auth/permission-requests/${id}/approve`, { method: 'POST' })
    closeSwalModal()
    if (!res.ok) throw new Error('Error al aprobar')
    showSuccess('Éxito', 'Solicitud aprobada')
    await loadPermissionRequests()
    try { const ures = await fetch('/api/auth/users'); users.value = await ures.json() } catch (e) { console.warn('No se pudo refrescar la lista de usuarios:', e) }
    modalRequests.value = modalRequests.value.map(r => r.id === id ? { ...r, status: 'approved' } : r)
  } catch (e) { notifier.error(e.message || 'No se pudo aprobar') }
}

async function rejectRequest(id) {
  try {
    const confirm = await Swal.fire({ title: 'Rechazar solicitud', text: '¿Deseas rechazar esta solicitud?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, rechazar', cancelButtonText: 'Cancelar' })
    if (!confirm.isConfirmed) return
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), showConfirmButton: false, allowOutsideClick: false })
    const res = await fetch(`/api/auth/permission-requests/${id}/reject`, { method: 'POST' })
    Swal.close()
    if (!res.ok) throw new Error('Error al rechazar')
    notifier.success('Solicitud rechazada')
    await loadPermissionRequests()
    modalRequests.value = modalRequests.value.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
  } catch (e) { notifier.error(e.message || 'No se pudo rechazar') }
}
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(46, 221, 90, 0.2), rgba(76, 220, 130, 0.1));
  border: 1.5px solid rgba(46, 221, 90, 0.4);
  border-radius: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2edd5a;
  box-shadow: 0 4px 16px rgba(46, 221, 90, 0.15);
  backdrop-filter: blur(8px);
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.cards-panel {
  margin-top: 28px;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.area-card {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbfd 100%);
  border: 1px solid rgba(16, 24, 40, 0.08);
  box-shadow: 0 10px 30px rgba(11, 37, 64, 0.08), 0 1px 0 rgba(16, 24, 40, 0.04);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.area-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--card-color, #2edd5a), transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.area-card:hover::before {
  opacity: 1;
}

/* Color específico para cada tarjeta */
.area-card:nth-child(1) { --card-color: #3b82f6; }
.area-card:nth-child(2) { --card-color: #f59e0b; }
.area-card:nth-child(3) { --card-color: #10b981; }
.area-card:nth-child(4) { --card-color: #8b5cf6; }
.area-card:nth-child(5) { --card-color: #ec4899; }
.area-card:nth-child(6) { --card-color: #06b6d4; }

.area-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(11, 37, 64, 0.18), 0 0 1px rgba(0, 0, 0, 0.05);
}

.area-card .card-media {
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(16, 24, 40, 0.05), rgba(16, 24, 40, 0.02));
}

.area-card .card-media::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 50%);
  pointer-events: none;
}

.area-card .card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: brightness(1) contrast(1.05);
}

.area-card:hover .card-media img {
  transform: scale(1.08);
}

.card-icon-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 253, 0.95));
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 5;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.card-icon-badge svg {
  width: 26px;
  height: 26px;
  transition: all 0.35s ease;
}

.area-card:nth-child(1) .card-icon-badge svg { color: #3b82f6; }
.area-card:nth-child(2) .card-icon-badge svg { color: #f59e0b; }
.area-card:nth-child(3) .card-icon-badge svg { color: #10b981; }
.area-card:nth-child(4) .card-icon-badge svg { color: #8b5cf6; }
.area-card:nth-child(5) .card-icon-badge svg { color: #ec4899; }
.area-card:nth-child(6) .card-icon-badge svg { color: #06b6d4; }

.area-card:hover .card-icon-badge {
  transform: scale(1.15) rotate(-8deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

.pending-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: #fff;
  padding: 7px 14px;
  border-radius: 22px;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
}

.badge-pulse {
  position: relative;
}

.badge-pulse::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  opacity: 0;
  animation: badge-pulse 2.5s infinite;
  z-index: -1;
}

@keyframes badge-pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0;
  }
  50% { 
    transform: scale(1.15); 
    opacity: 0.4;
  }
}

.area-card .card-body {
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.area-card .card-title {
  font-weight: 800;
  font-size: 1.05rem;
  color: #0b2540;
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.area-card .card-sub.small {
  font-size: 0.85rem;
  color: #647280;
  line-height: 1.5;
  margin-bottom: 4px;
}

.card-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn.ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(16, 24, 40, 0.04), rgba(16, 24, 40, 0.02)) !important;
  color: #0b2540 !important;
  border: 1.5px solid rgba(16, 24, 40, 0.12) !important;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.btn.ghost::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--card-color, #2edd5a), transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: -1;
}

.btn.ghost:hover {
  background: linear-gradient(135deg, var(--card-color, #2edd5a), rgba(46, 221, 90, 0.5)) !important;
  border-color: var(--card-color, #2edd5a) !important;
  color: #fff !important;
  box-shadow: 0 6px 16px rgba(46, 221, 90, 0.3);
  transform: translateX(2px);
}

.btn-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.25s ease;
}

.btn.ghost:hover .btn-icon {
  transform: translateX(3px);
}

.area-card.embedded {
  background: linear-gradient(135deg, rgba(19, 31, 52, 0.7), rgba(15, 25, 45, 0.6));
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(160%);
}

.area-card.embedded .card-title,
.area-card.embedded .card-sub,
.area-card.embedded .card-desc {
  color: #e6ebf5;
}

@media (max-width: 960px) {
  .area-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 560px) {
  .area-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .area-card .card-media {
    height: 120px;
  }

  .area-card {
    border-radius: 14px;
  }

  .card-icon-badge {
    width: 45px;
    height: 45px;
    top: 12px;
    left: 12px;
  }

  .card-icon-badge svg {
    width: 22px;
    height: 22px;
  }
}
</style>
