<template>
  <ActionPanel class="dashboard-main">
    <template #title>Administrador — Gestión</template>

    <div class="cards-panel">
      <div class="area-grid">
        <div
          class="area-card"
          v-for="op in operations"
          :key="op.name"
          :class="{ embedded: isEmbedded(op.name) }"
          role="button"
          @click.prevent="go(op.name)">
          <div class="card-media">
            <img class="card-img" :src="op.img" :alt="op.label" />
          </div>
          <div class="card-body">
            <div class="card-title">{{ op.label }}</div>
            <div class="card-sub small">{{ op.desc }}</div>
            <div class="card-actions"><button class="btn ghost" @click.stop.prevent="go(op.name)">Ir</button></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para admins (detalle de área) -->
    <!-- Modal eliminado: confirmar solicitudes usa requestPermission o navegar según permisos -->

    <!-- La gestión de usuarios se hace en la página dedicada 'admin-users' -->
  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import { ref, onMounted } from 'vue'
import pendingStore from '@/stores/pendingRequestsStore'
import notifier from '@/utils/notifier'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
// Imágenes para operaciones
import imgEntrada from '@/images/entrada_equips.png'
import imgSalida from '@/images/salida_equipo.png'
import imgResguardo from '@/images/Resguardo_imagen.png'
import imgServicio from '@/images/Servicio_equipo.png'
import imgInventario from '@/images/Inventario.png'
import imgConsumibles from '@/images/Consumibles_bajo_pedido.png'

const router = useRouter()

const operations = [
  { name: 'op-entrada', label: 'Órdenes de Entrada', desc: 'Captura de entradas de equipo/material.', img: imgEntrada },
  { name: 'op-salida', label: 'Órdenes de Salida', desc: 'Registro de salidas y egresos.', img: imgSalida },
  { name: 'op-resguardo', label: 'Resguardo', desc: 'Asignaciones y resguardos.', img: imgResguardo },
  { name: 'op-servicio', label: 'Servicio', desc: 'Órdenes de servicio y mantenimiento.', img: imgServicio },
  { name: 'op-inventario-biomedica', label: 'Inventario Biomédica', desc: 'Inventario y conteos.', img: imgInventario },
  { name: 'op-insumos-consumibles', label: 'Insumos y Consumibles', desc: 'Gestión de insumos.', img: imgConsumibles }
]

function go(name){ try { router.push({ name }) } catch {} }

import { useRoute } from 'vue-router'
const route = useRoute()

function isEmbedded(opName) {
  try {
    const rn = route && route.name ? String(route.name) : ''
    if (rn === opName) return true
    const q = route && route.query ? route.query.area : null
    if (q && String(q) === opName) return true
  } catch (e) {}
  return false
}

onMounted(async () => {
  try { await pendingStore.refresh() } catch {}
})

const { byArea } = pendingStore

function onAreaClick(areaKey){
  // Para admins, navegar a la vista de gestión con query
  try { router.push({ name: 'dashboard', query: { area: areaKey } }) } catch {}
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
  try {
    const res = await fetch('/api/auth/users')
    users.value = await res.json()
    showUsers.value = true
    await loadPermissionRequests()
  } catch (e) {
    console.error('No se pudieron obtener usuarios:', e)
  }
})

async function loadPermissionRequests(){
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

async function openUserRequests(email){
  modalEmail.value = email
  showRequestsModal.value = true
  try {
    const res = await fetch('/api/auth/permission-requests')
    const rows = await res.json()
    modalRequests.value = rows.filter(r => r.email === email)
  } catch (e) { modalRequests.value = []; notifier.error('No se pudieron cargar solicitudes') }
}

function closeModal(){ showRequestsModal.value = false; modalRequests.value = []; modalEmail.value = '' }

async function approveRequest(id){
  try {
    const confirm = await Swal.fire({ title: 'Aprobar solicitud', text: '¿Confirmas que deseas aprobar esta solicitud y actualizar el rol del usuario?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, aprobar', cancelButtonText: 'Cancelar' })
    if (!confirm.isConfirmed) return
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), showConfirmButton: false, allowOutsideClick: false })
    const res = await fetch(`/api/auth/permission-requests/${id}/approve`, { method: 'POST' })
    Swal.close()
    if (!res.ok) throw new Error('Error al aprobar')
    notifier.success('Solicitud aprobada')
    await loadPermissionRequests()
    // refrescar lista de usuarios porque el rol puede haber cambiado
    try { const ures = await fetch('/api/auth/users'); users.value = await ures.json() } catch (e) { console.warn('No se pudo refrescar la lista de usuarios:', e) }
    modalRequests.value = modalRequests.value.map(r => r.id===id ? { ...r, status: 'approved' } : r)
  } catch (e) { notifier.error(e.message || 'No se pudo aprobar') }
}

async function rejectRequest(id){
  try {
    const confirm = await Swal.fire({ title: 'Rechazar solicitud', text: '¿Deseas rechazar esta solicitud?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, rechazar', cancelButtonText: 'Cancelar' })
    if (!confirm.isConfirmed) return
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), showConfirmButton: false, allowOutsideClick: false })
    const res = await fetch(`/api/auth/permission-requests/${id}/reject`, { method: 'POST' })
    Swal.close()
    if (!res.ok) throw new Error('Error al rechazar')
    notifier.success('Solicitud rechazada')
    await loadPermissionRequests()
    modalRequests.value = modalRequests.value.map(r => r.id===id ? { ...r, status: 'rejected' } : r)
  } catch (e) { notifier.error(e.message || 'No se pudo rechazar') }
}
</script>

<style scoped>
.grid-cards{ display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-top:14px }
.card-button{ padding:16px; border-radius:12px; border:1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.86); cursor:pointer; font-weight:800; box-shadow:0 10px 20px rgba(2,6,23,0.1) }
.card-button:hover{ box-shadow:0 14px 30px rgba(2,6,23,0.12) }
.glass-panel{ margin-top:16px; padding:12px; border-radius:12px; background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); backdrop-filter: blur(8px) }
.users-table{ width:100%; border-collapse:collapse; margin-top:12px }
.users-table th,.users-table td{ border:1px solid rgba(0,0,0,0.08); padding:8px; background: rgba(255,255,255,0.8) }

.badge{ display:inline-block; background:var(--btn-green,#28a745); color:#fff; padding:4px 8px; border-radius:12px; font-weight:700; margin-right:8px }
.modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:1200 }
.modal{ background:var(--card-bg, #fff); padding:18px; border-radius:10px; width:min(720px,95%); max-height:80vh; overflow:auto }

@media (max-width: 960px){ .grid-cards{ grid-template-columns: repeat(2,1fr) } }
@media (max-width: 560px){ .grid-cards{ grid-template-columns: 1fr } }
/* Card and modal enhancements */
.cards-panel{ margin-top:20px }
.area-card{ width:100%; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; background:#fff; border:1px solid rgba(16,24,40,0.06); box-shadow:0 6px 18px rgba(11,37,64,0.04); transition: transform .18s ease, box-shadow .18s ease }
.area-card .card-media{ height:120px; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden }
.area-card .card-media img{ width:100%; height:100%; object-fit:cover; display:block }
.area-card .card-media img{ border-top-left-radius:12px; border-top-right-radius:12px }
.pending-badge{ position:absolute; top:10px; right:10px; background:var(--btn-green,#0a8b5b); color:#fff; padding:6px 8px; border-radius:999px; font-weight:700; font-size:12px; box-shadow:0 6px 14px rgba(11,37,64,0.12) }
.area-card .card-body{ padding:12px 14px; display:flex; flex-direction:column; gap:6px }
.area-card .card-title{ font-weight:800; font-size:15px; color:#0b2540 }
.area-card .card-sub.small{ font-size:13px; color:#52607a }
.card-desc{ margin-top:8px; color:#44566b; font-size:13px }
.card-actions{ margin-top:12px; display:flex; justify-content:flex-end }
.area-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:22px }
.modal-backdrop{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.48); z-index:1400; padding:20px }
.modal-card{ width:min(920px,100%); max-width:920px; background:var(--card-bg,#fff); border-radius:12px; overflow:hidden; box-shadow:0 30px 80px rgba(2,6,23,0.48); display:flex; gap:0 }
.modal-media{ flex:1 1 48%; background:#f6f8fa; display:flex; align-items:center; justify-content:center; min-height:260px }
.modal-media img{ width:100%; height:100%; object-fit:cover }
.modal-body{ flex:1 1 52%; padding:20px; display:flex; flex-direction:column; gap:12px }
.modal-body h3{ margin:0; font-size:20px }
.modal-hint{ color:#50718a; font-weight:700 }
.modal-desc{ color:#334155; line-height:1.45 }
.modal-actions{ margin-top:auto; display:flex; gap:12px; justify-content:flex-end }

@media (max-width:880px){ .modal-card{ flex-direction:column } .modal-media{ min-height:180px } }

/* Grid responsive for admin dashboard catalog */
.area-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:18px }
@media (max-width:960px){ .area-grid{ grid-template-columns: repeat(2,1fr) } }
@media (max-width:560px){ .area-grid{ grid-template-columns: 1fr } }

/* Embedded area card: dark glass only for the selected embedded operation */
.area-card.embedded {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.28) !important;
  backdrop-filter: blur(18px) saturate(160%) !important;
  border-radius: 22px !important;
  color: #e6ebf5;
}
.area-card.embedded .card-title, .area-card.embedded .card-sub, .area-card.embedded .card-desc { color: #e6ebf5 !important }
</style>