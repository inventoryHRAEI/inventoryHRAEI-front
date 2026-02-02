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
          class="area-card"
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
import { ref, onMounted, computed } from 'vue'
import pendingStore from '@/stores/pendingRequestsStore'
import notifier from '@/utils/notifier'
import Swal from 'sweetalert2'
import { useRouter, useRoute } from 'vue-router'
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
  try { router.push({ name }) } catch {}
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
  // Optimización de carga: 600ms
  setTimeout(() => {
    loading.value = false
  }, 600)
  
  try { await pendingStore.refresh() } catch {}
  
  try {
    const res = await fetch('/api/auth/users')
    users.value = await res.json()
    showUsers.value = true
    await loadPermissionRequests()
  } catch (e) {
    console.error('No se pudieron obtener usuarios:', e)
  }
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
    const confirm = await Swal.fire({ title: 'Aprobar solicitud', text: '¿Confirmas que deseas aprobar esta solicitud y actualizar el rol del usuario?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, aprobar', cancelButtonText: 'Cancelar' })
    if (!confirm.isConfirmed) return
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), showConfirmButton: false, allowOutsideClick: false })
    const res = await fetch(`/api/auth/permission-requests/${id}/approve`, { method: 'POST' })
    Swal.close()
    if (!res.ok) throw new Error('Error al aprobar')
    notifier.success('Solicitud aprobada')
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
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(46, 221, 90, 0.15);
  border: 1px solid rgba(46, 221, 90, 0.3);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2edd5a;
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.cards-panel {
  margin-top: 20px;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.area-card {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  position: relative;
}

.area-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(46, 221, 90, 0.5);
}

.area-card .card-media {
  height: 140px;
  position: relative;
  overflow: hidden;
}

.area-card .card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9) contrast(1.1);
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.area-card:hover .card-media img {
  transform: scale(1.1);
  filter: brightness(1);
}

.card-icon-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 5;
  transition: all 0.4s ease;
}

.card-icon-badge svg {
  width: 26px;
  height: 26px;
  color: #10b981;
}

.area-card:hover .card-icon-badge {
  transform: scale(1.15) rotate(-8deg);
  background: #10b981;
}

.area-card:hover .card-icon-badge svg {
  color: white;
}

.pending-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #0bb828, #00a86b);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 4px 12px rgba(11, 184, 40, 0.3);
  z-index: 10;
}

.badge-pulse {
  position: relative;
}

.badge-pulse::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: inherit;
  opacity: 0.5;
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0; }
}

.area-card .card-body {
  padding: 20px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.8));
}

.area-card .card-title {
  font-weight: 800;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 4px;
}

.area-card .card-sub.small {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

.card-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn.ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent !important;
  color: #0bb828 !important;
  border: 1px solid rgba(11, 184, 40, 0.3) !important;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.btn.ghost:hover {
  background: rgba(11, 184, 40, 0.1) !important;
  border-color: rgba(11, 184, 40, 0.5) !important;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.area-card.embedded {
  background: rgba(19, 31, 52, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.28);
  backdrop-filter: blur(18px) saturate(160%);
}

.area-card.embedded .card-title,
.area-card.embedded .card-sub {
  color: #e6ebf5;
}

@media (max-width: 960px) {
  .area-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .area-grid {
    grid-template-columns: 1fr;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
