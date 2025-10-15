<template>
  <ActionPanel>
    <template #title>Usuario — {{ user?.nombre || 'Detalle' }}</template>

    <section class="glass-panel list-panel user-detail">
      <div v-if="loading" class="center">Cargando usuario...</div>
      <div v-if="loadError" class="center" style="color:var(--muted); margin-bottom:12px">{{ loadError }} <button class="btn" @click="$router.push({ name: 'admin-users' })">Volver</button></div>
      <div v-if="!user && !loading && !loadError" class="center">Usuario no disponible</div>
      <div class="user-header-row">
        <div class="avatar-wrapper">
          <img v-if="user?.foto" :src="user.foto" class="avatar" />
          <div v-else class="avatar placeholder">{{ initials }}</div>
        </div>
        <div>
          <h3>{{ user?.nombre }}</h3>
          <div>Tipo: <strong>{{ formatRole(user?.role) }}</strong></div>
          <div>Email: <strong>{{ user?.email }}</strong></div>
          <div style="margin-top:8px"><button class="btn" @click.prevent="$router.push({ name: 'dashboard' })">Volver</button></div>
        </div>
      </div>

      <div class="split-areas">
        <div class="manage-section">
          <div class="section-title">Gestionar (asignar áreas)</div>
          <div class="areas-list">
            <label v-for="a in areasList" :key="a" class="area-row">
              <input type="checkbox" v-model="permissions[a]" /> {{ a }}
            </label>
          </div>
          <div style="margin-top:12px"><button class="btn primary" @click="save">Guardar</button></div>
        </div>

        <div class="admin-section">
          <div class="section-title">Solicitudes</div>
          <div v-if="requests.length===0" class="center">No hay solicitudes</div>
          <div v-else style="display:flex; flex-direction:column; gap:8px">
            <div v-for="r in requests" :key="r.id" class="glass" style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px">
              <div>
                <div style="font-weight:700">{{ r.area }}</div>
                <div style="font-size:13px; color:#666">{{ r.created_at }} — Estado: <strong>{{ r.status }}</strong></div>
              </div>
              <div style="display:flex; gap:8px">
                <button v-if="r.status==='pending'" class="btn primary" @click.prevent="approveRequest(r.id)">Aprobar</button>
                <button v-if="r.status==='pending'" class="btn" @click.prevent="rejectRequest(r.id)">Rechazar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import notifier from '@/utils/notifier'
import { formatRole } from '@/utils/roles'
import { authedFetch } from '@/utils/api'
import pendingRequestsStore from '@/stores/pendingRequestsStore'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const user = ref(null)
const requests = ref([])

const areasList = ['EQUIPO MEDICO I.P','EQUIPOS DE ADQUISICIÓN','COMODATOS','MOBILIARIO CLÍNICO/MÉDICO','DONACIÓN','MICROPIPETAS Y PIPETAS']
const permissions = ref({})

const initials = computed(() => {
  if (!user.value || !user.value.nombre) return 'U'
  return user.value.nombre.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
})

const loading = ref(false)
const loadError = ref(null)

async function load(){
  loading.value = true
  loadError.value = null
  try {
    const res = await fetch(`/api/auth/users/${id}`)
    if (res.ok) {
      user.value = await res.json()
    } else {
      // Fallback: obtener lista y buscar por id
      const listRes = await fetch('/api/auth/users')
      if (listRes.ok) {
        const list = await listRes.json()
        user.value = Array.isArray(list) ? list.find(x => String(x.id) === String(id)) : null
      } else {
        user.value = null
      }
    }

    if (!user.value) {
      loadError.value = 'Usuario no encontrado'
      requests.value = []
      return
    }

    // Cargar áreas reales asignadas al usuario por email
    try {
      const email = user.value && user.value.email
      const ares = await authedFetch(`/api/auth/user-permissions?email=${encodeURIComponent(email)}`)
      if (ares.ok) {
        const areas = await ares.json()
        for (const a of areasList) permissions.value[a] = Array.isArray(areas) ? areas.includes(a) : false
      } else {
        for (const a of areasList) permissions.value[a] = false
      }
    } catch (e) {
      for (const a of areasList) permissions.value[a] = false
    }

    try {
      const rres = await authedFetch('/api/auth/permission-requests')
      if (rres.ok) {
        const rows = await rres.json()
        requests.value = rows.filter(r => r.email === (user.value && user.value.email))
      } else {
        requests.value = []
      }
    } catch (e) { requests.value = [] }

  } catch (e) {
    loadError.value = 'Error cargando usuario'
    requests.value = []
  } finally { loading.value = false }
}

async function approveRequest(id){
  try {
  const res = await authedFetch(`/api/auth/permission-requests/${id}/approve`, { method: 'POST' })
    if (!res.ok) throw new Error('Error')
    notifier.success('Aprobada')
  try { await pendingRequestsStore.refresh() } catch {}
  await load()
  } catch (e) { notifier.error('No se pudo aprobar') }
}
async function rejectRequest(id){
  try {
  const res = await authedFetch(`/api/auth/permission-requests/${id}/reject`, { method: 'POST' })
    if (!res.ok) throw new Error('Error')
    notifier.success('Rechazada')
  try { await pendingRequestsStore.refresh() } catch {}
  await load()
  } catch (e) { notifier.error('No se pudo rechazar') }
}

async function save(){
  try {
  const selected = Object.keys(permissions.value).filter(k => permissions.value[k])
  const email = user.value && user.value.email
  const res = await authedFetch(`/api/auth/user-permissions`, { method: 'PUT', body: JSON.stringify({ email, areas: selected }) })
    if (!res.ok) throw new Error('No se pudieron guardar las áreas')
    notifier.success('Áreas guardadas')
    try { await pendingRequestsStore.refresh() } catch {}
    await load()
  } catch (e) {
    notifier.error(e.message || 'Error guardando')
  }
}

onMounted(load)
</script>

<style scoped>
.split-areas{ display:grid; grid-template-columns: 1fr 1fr; gap:12px }
.user-header-row{ display:flex; gap:12px; align-items:center; margin-bottom:12px }
.avatar{ width:72px; height:72px; border-radius:50%; object-fit:cover }
</style>
