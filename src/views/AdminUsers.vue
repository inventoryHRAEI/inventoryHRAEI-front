<template>
  <ActionPanel>
    <template #title>Administrar Usuarios</template>

    <section class="glass-panel list-panel users-cards">
      <div style="display:flex; justify-content:flex-end; margin-bottom:10px;"><button class="btn" @click.prevent="$router.push({ name: 'dashboard' })">Volver</button></div>
      <h3>Lista de Usuarios disponibles</h3>
      <div class="cards">
        <div class="user-card" v-for="u in users" :key="u.id">
          <div class="card-left">
            <div class="avatar-wrapper">
              <img v-if="u.foto" :src="u.foto" class="avatar" alt="avatar" />
              <div v-else class="avatar placeholder">{{ (u.nombre||'U').split(' ').map(s=>s[0]).slice(0,2).join('') }}</div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-head">
              <div>
                <div class="card-title">{{ u.nombre }}</div>
                <div class="card-sub">{{ u.email }}</div>
              </div>
              <div class="role-pill">{{ formatRole(u.role) }}</div>
            </div>
            <div class="areas">
              <div class="areas-preview">
                <span class="area" v-for="a in areasList.slice(0,3)" :key="a">{{ a }} — <strong>{{ userHasArea(u.email, a) ? 'sí' : 'no' }}</strong></span>
                <span v-if="areasList.length>3" class="more">+{{ areasList.length - 3 }} más</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn small" @click.prevent="$router.push({ name: 'admin-user-detail', params: { id: u.id } })">Detalle</button>
              <button class="btn primary" @click.prevent="changeRole(u, u.role === 'admin' ? 'user' : 'admin')">{{ actionLabelFor(u.role) }}</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal para modificar permisos (edición por usuario) -->
    <div v-if="showModifyModal" class="modal-backdrop">
      <div class="modal">
        <h4>Modificar permisos — {{ modifyingUser?.nombre }}</h4>
        <div class="areas-edit">
          <label v-for="a in areasList" :key="a" class="area-row">
            <input type="checkbox" v-model="modPermissions[a]" /> {{ a }}
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeModify">Cancelar</button>
          <button class="btn primary" @click="savePermissions">Guardar cambios</button>
        </div>
      </div>
    </div>

    <!-- Modal para ver solicitudes de un usuario -->
    <div v-if="showRequestsModal" class="modal-backdrop">
      <div class="modal">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <h4>Solicitudes de {{ modalEmail }}</h4>
          <button class="btn" @click="closeModal">Cerrar</button>
        </div>
        <div style="margin-top:12px">
          <div v-if="!modalRequests || modalRequests.length === 0" class="center">No hay solicitudes para este usuario.</div>
          <div v-else style="display:flex; flex-direction:column; gap:10px">
            <div v-for="r in modalRequests" :key="r.id" class="glass" style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px">
              <div>
                <div style="font-weight:700">{{ r.area }}</div>
                <div style="font-size:13px; color:#666">{{ r.created_at }} — Estado: <strong>{{ r.status }}</strong></div>
              </div>
              <div style="display:flex; gap:8px">
                <button v-if="r.status === 'pending'" class="btn primary" @click.prevent="approveRequest(r.id)">Aprobar</button>
                <button v-if="r.status === 'pending'" class="btn" @click.prevent="rejectRequest(r.id)">Rechazar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import notifier from '@/utils/notifier'
import pendingRequestsStore from '@/stores/pendingRequestsStore'
import { formatRole, actionLabelFor } from '@/utils/roles'

const router = useRouter()
const currentUser = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre'), role: localStorage.getItem('role'), email: localStorage.getItem('email') }
const isAdmin = currentUser && currentUser.role === 'admin'

const pendingCounts = ref({})
const showRequestsModal = ref(false)
const modalRequests = ref([])
const modalEmail = ref('')

const users = ref([])

// Áreas fijas (ordenadas según negocio) — ajusta según necesites
const areasList = ['EQUIPO MEDICO I.P','EQUIPOS DE ADQUISICIÓN','COMODATOS','MOBILIARIO CLÍNICO/MÉDICO','DONACIÓN','MICROPIPETAS Y PIPETAS']

// Modal de modificar permisos
const showModifyModal = ref(false)
const modifyingUser = ref(null)
const modPermissions = ref({})

function userHasArea(email, area){
  const u = users.value.find(x => x.email === email)
  if (!u) return false
  if (u.role === 'admin' || u.role === 'privileged') return true
  return false
}

function openModifyPermissions(user){
  modifyingUser.value = user
  const map = {}
  for (const a of areasList) map[a] = userHasArea(user.email, a)
  modPermissions.value = map
  showModifyModal.value = true
}

function closeModify(){ showModifyModal.value = false; modifyingUser.value = null }

async function savePermissions(){
  notifier.success('Cambios guardados (simulado). Implementar endpoint para persistir permisos si es necesario.')
  closeModify()
}

async function loadUsers(){
  try {
    const res = await fetch('/api/auth/users')
    if (!res.ok) { users.value = []; return }
    users.value = await res.json()
  } catch (e) { console.error('Error cargando usuarios:', e); users.value = [] }
}

async function changeRole(userObj, newRole){
  try {
    const confirm = await Swal.fire({ title: 'Cambiar rol', text: `Cambiar rol de ${userObj.nombre} a ${newRole}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' })
    if (!confirm.isConfirmed) return
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), showConfirmButton: false, allowOutsideClick: false })
    const res = await fetch(`/api/auth/users/${userObj.id}/role`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ role: newRole }) })
    Swal.close()
    if (!res.ok) throw new Error('Error actualizando role')
    notifier.success('Role actualizado')
    await loadUsers()
    await loadPermissionRequests()
  } catch (e) { notifier.error(e.message || 'No se pudo actualizar role') }
}

async function loadPermissionRequests(){
  try {
    await pendingRequestsStore.refresh()
    pendingCounts.value = pendingRequestsStore.byEmail.value || {}
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
    await loadUsers()
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

onMounted(async () => {
  if (!isAdmin) {
    try { await router.push({ name: 'dashboard' }) } catch {}
    return
  }
  await loadUsers()
  await loadPermissionRequests()
})

// Helper para obtener solicitudes pendientes por email
function pendingFor(email){
  try { return pendingRequestsStore.byEmail.value[email] || 0 } catch { return 0 }
}
</script>

<style scoped>
.users-cards h3{ margin:0 0 12px 0 }
.cards{ display:grid; grid-template-columns: repeat(2,1fr); gap:12px }
.user-card{ display:flex; gap:12px; align-items:flex-start; padding:16px; border-radius:10px; background:rgba(255,255,255,0.92); box-shadow:0 6px 16px rgba(0,0,0,0.08) }
.card-left{ width:84px }
.avatar-wrapper{ width:72px; height:72px; display:flex; align-items:center; justify-content:center }
.avatar{ width:72px; height:72px; border-radius:50%; object-fit:cover }
.avatar.placeholder{ width:72px; height:72px; border-radius:50%; background:#e6eefb; display:flex; align-items:center; justify-content:center; font-weight:700 }
.card-body{ flex:1 }
.card-title{ font-size:18px; font-weight:800; margin-bottom:6px }
.card-sub{ color:#666; margin-bottom:8px }
.areas{ font-size:13px; color:#333 }
.split-areas{ display:grid; grid-template-columns: 1fr 1fr; gap:12px }
.manage-section{ background:#f9f9f9; padding:12px; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.1) }
.section-title{ font-weight:700; margin-bottom:8px }
.areas-list{ display:flex; flex-direction:column; gap:4px }
.area{ display:inline-block; margin-right:8px; margin-top:6px; padding:4px 8px; background:#f3f6fb; border-radius:8px }
.admin-section{ display:flex; flex-direction:column; gap:8px; margin-top:12px }
.admin-actions{ display:flex; gap:8px }
.card-actions{ display:flex; align-items:center }
.btn{ padding:8px 12px; border-radius:8px; background:#e9eef7; border:1px solid rgba(0,0,0,0.06); cursor:pointer }
.btn.primary{ background: linear-gradient(90deg, #00c6a7, #00a5ff); color:#fff; border:none }

/* New visual improvements */
.user-card{ display:flex; gap:16px; align-items:flex-start; padding:18px; border-radius:12px; background:linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,249,250,0.95)); box-shadow: 0 12px 30px rgba(2,6,23,0.08); border:1px solid rgba(0,0,0,0.04) }
.card-head{ display:flex; align-items:center; justify-content:space-between; gap:12px }
.role-pill{ background:linear-gradient(90deg,#00c6a7,#00a5ff); color:#fff; padding:6px 10px; border-radius:999px; font-weight:700 }
.areas-preview{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px }
.card-actions{ display:flex; gap:10px; margin-top:12px }
.more{ color:#666; font-size:12px; align-self:center }
.btn.small{ padding:6px 8px; font-size:13px }
.avatar-wrapper{ width:84px; height:84px; display:flex; align-items:center; justify-content:center }
.avatar{ width:72px; height:72px; border-radius:50%; object-fit:cover; box-shadow: 0 6px 18px rgba(0,0,0,0.06) }
.card-sub{ font-size:13px; color:#666 }

.badge{ display:inline-block; background:var(--btn-green,#28a745); color:#fff; padding:4px 8px; border-radius:12px; font-weight:700; margin-right:8px }
.modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:1200 }
.modal{ background:var(--card-bg, #fff); padding:18px; border-radius:10px; width:min(720px,95%); max-height:80vh; overflow:auto }
.areas-edit{ display:flex; flex-direction:column; gap:8px; margin:12px 0 }
.area-row{ display:flex; align-items:center; gap:8px }
.modal-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:12px }

@media (max-width: 960px){ .cards{ grid-template-columns: repeat(1,1fr) } }
</style>
