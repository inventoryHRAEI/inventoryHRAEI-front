<template>
  <ActionPanel>
    <template #title>Hola, {{ user?.nombre }}</template>
    <h5>¿Qué deseas gestionar?</h5>

    <div class="cards-panel">
      <div class="area-grid">
        <div class="area-card compact" v-for="area in areas" :key="area.key" :class="{ disabled: !userHasAccess(area.key) }" role="button" tabindex="0" @click.prevent="onAreaClick(area.key)" @keyup.enter="onAreaClick(area.key)" :aria-label="`Ver ${area.label}`">
          <div class="card-media">
            <img class="card-img" :src="area.img" :alt="area.label" @error="onImgError" />
          </div>
          <div class="card-body">
            <div class="card-title">{{ area.label }}</div>
            <div class="card-desc">{{ area.desc || area.hint }}</div>
            <div v-if="byArea[area.key]" class="pending-line">{{ byArea[area.key] }} solicitud(es) pendiente(s)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal removed; confirmation uses SweetAlert2 inside requestPermission -->

    <section v-if="showRequests" class="glass-panel list-panel">
      <h3>Solicitudes enviadas</h3>
      <ul>
        <li v-for="r in myRequests" :key="r.id">{{ r.area }} — {{ r.status }} ({{ r.created_at }})</li>
      </ul>
    </section>
  </ActionPanel>
  
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import { ref, onMounted } from 'vue'
import pendingStore from '@/stores/pendingRequestsStore'
import notifier from '@/utils/notifier'
import imgDonaciones from '@/images/donaciones.png'
import imgEquipo from '@/images/equipo_medico.png'
import imgComodatos from '@/images/equipos_comodatos.png'
import imgMobiliario from '@/images/mobiliario_clinico.png'
import imgPipetas from '@/images/pipetas.png'
import imgPropiedad from '@/images/propiedad_hospital.png'

import { useRouter } from 'vue-router'
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre'), role: localStorage.getItem('role'), email: localStorage.getItem('email') }
const showRequests = ref(false)
const myRequests = ref([])
// Permisos por área del usuario (desde backend)
const allowedAreas = ref(new Set())

async function fetchPermission(endpoint, options = {}){
  // intenta primero /api/auth, si 404 prueba /api
  const bases = ['/api/auth', '/api']
  let lastRes = null, lastData = null
  for (const base of bases){
    const url = `${base}${endpoint}`
    try {
      const res = await fetch(url, options)
      lastRes = res
      try { lastData = await res.clone().json() } catch { lastData = null }
      if (res.ok) return { res, data: lastData }
      if (res.status === 404) continue
      // Si otro error, devolvemos
      return { res, data: lastData }
    } catch (e) {
      // network error => probar siguiente base
      continue
    }
  }
  return { res: lastRes, data: lastData }
}

import Swal from 'sweetalert2'

const requestPermission = async (area) => {
  try {
    const result = await Swal.fire({
      title: 'Enviar solicitud de permiso',
      text: `No tienes acceso al área “${area}”. ¿Deseas enviar una solicitud al administrador para que te otorgue acceso?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar solicitud',
      cancelButtonText: 'No, cancelar'
    })
    if (!result.isConfirmed) return

    // mostrar loading
    Swal.fire({ title: 'Enviando solicitud...', didOpen: () => Swal.showLoading(), allowOutsideClick: false, showConfirmButton: false })

    const { res, data } = await fetchPermission('/permission-requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, area })
    })
    Swal.close()
    if (!res || !res.ok) throw new Error((data && data.msg) || `Error del servidor (${res ? res.status : 'sin respuesta'})`)
    notifier.success('Solicitud enviada')
    await loadMyRequests()
    showRequests.value = true
  } catch (e) { Swal.close(); notifier.error(e.message || 'No se pudo enviar la solicitud') }
}

const loadMyRequests = async () => {
  try {
    const { res, data } = await fetchPermission('/permission-requests')
    if (!res || !res.ok) { console.warn('Servidor no disponible:', res ? res.status : 'sin respuesta'); myRequests.value = []; return }
    const rows = data || []
    myRequests.value = Array.isArray(rows) ? rows.filter(r => r.email === user.email) : []
  } catch (e) { console.error('Error cargando solicitudes:', e); myRequests.value = [] }
}

async function loadAllowedAreas(){
  try {
    const { res, data } = await fetchPermission(`/user-permissions?email=${encodeURIComponent(user.email)}`)
    if (res && res.ok && Array.isArray(data)) {
      allowedAreas.value = new Set(data)
    } else {
      allowedAreas.value = new Set()
    }
  } catch (e) {
    console.warn('No se pudieron cargar permisos por área:', e)
    allowedAreas.value = new Set()
  }
}

onMounted(async () => {
  await Promise.all([loadMyRequests(), loadAllowedAreas()])
})

// refrescar conteos en background para mostrar badges por área
onMounted(async () => { try { await pendingStore.refresh() } catch {} })

// exponer byArea para plantilla
const { byArea } = pendingStore

function onImgError(e){
  // fallback to a neutral Unsplash image when the image fails to load
  try { e.target.src = 'https://images.unsplash.com/photo-1517511620798-cec17d428bc0?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7' } catch {}
}

// Modal & selection
// modal removed: confirmation handled inline via requestPermission

// Areas configuration: label + key + image + description
const areas = [
  { key: 'EQUIPO MEDICO I.P', label: 'Equipo médico (IP)', img: imgEquipo, icon: '🩺', hint: 'Equipos críticos', desc: 'Instrumental y máquinas médicas de uso hospitalario: monitores, ventiladores, bombas de infusión y similares.' },
  { key: 'EQUIPOS DE ADQUISICIÓN', label: 'Equipos de adquisición', img: imgPropiedad, icon: '🧰', hint: 'Periféricos y accesorios', desc: 'Equipos y accesorios utilizados en adquisición de datos y conexión de dispositivos.' },
  { key: 'COMODATOS', label: 'Comodatos', img: imgComodatos, icon: '🔁', hint: 'Préstamos', desc: 'Listado y condiciones de comodatos y préstamos de equipos entre instituciones.' },
  { key: 'MOBILIARIO CLÍNICO/MÉDICO', label: 'Mobiliario clínico', img: imgMobiliario, icon: '🛏️', hint: 'Mobiliario', desc: 'Camas, mesas, sillas y muebles especializados para uso clínico.' },
  { key: 'DONACIÓN', label: 'Donación', img: imgDonaciones, icon: '🎁', hint: 'Donaciones', desc: 'Gestión y seguimiento de equipos recibidos por donación.' },
  { key: 'MICROPIPETAS Y PIPETAS', label: 'Micropipetas y pipetas', img: imgPipetas, icon: '🔬', hint: 'Consumibles', desc: 'Consumibles de laboratorio como puntas, pipetas y micropipetas.' }
]

function userHasAccess(areaKey){
  if (!user) return false
  const role = (user.role || localStorage.getItem('role') || '').toLowerCase()
  if (role === 'admin') return true // admin ve todo
  // Para usuarios y "privileged", aplicar permisos por área
  try { return allowedAreas.value.has(areaKey) } catch { return false }
}

function areaHasPending(areaKey){
  return myRequests.value.some(r => r.area === areaKey && r.status === 'pending')
}

async function onAreaClick(areaKey){
  if (userHasAccess(areaKey)){
    try { await router.push({ name: 'dashboard', query: { area: areaKey } }) } catch {}
  } else {
    // pedir confirmación y enviar solicitud si confirma
    await requestPermission(areaKey)
  }
}
</script>

<style scoped>
.grid-cards{ display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-top:14px }
.card-button{ padding:16px; border-radius:12px; border:1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.78); cursor:pointer; font-weight:800; box-shadow:0 10px 20px rgba(2,6,23,0.1) }
.card-button:hover{ box-shadow:0 14px 30px rgba(2,6,23,0.12) }
.card-button.muted{ background: rgba(255,255,255,0.72); color:#222 }
.glass-panel{ margin-top:16px; padding:12px; border-radius:12px; background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); backdrop-filter: blur(8px) }
.list-panel h3{ margin:0 0 8px 0 }

@media (max-width: 960px){ .grid-cards{ grid-template-columns: repeat(2,1fr) } }
@media (max-width: 560px){ .grid-cards{ grid-template-columns: 1fr } }

/* New cards style */
.cards-panel{ margin-top:18px }
.area-card{ width:100%; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; background:#fff; border:1px solid rgba(16,24,40,0.06); box-shadow:0 6px 18px rgba(11,37,64,0.04); transition: transform .18s ease, box-shadow .18s ease }
.area-card.compact{ cursor:pointer }
.area-card.compact:focus{ outline:2px solid rgba(0,166,255,0.12); outline-offset:4px }
.area-card.compact:hover{ transform: translateY(-6px); box-shadow:0 22px 44px rgba(11,37,64,0.12) }
.area-card .card-media{ height:120px; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden }
.area-card .card-media img{ width:100%; height:100%; object-fit:cover; display:block }
.area-card .card-media img{ border-top-left-radius:12px; border-top-right-radius:12px }
.area-card.disabled{ opacity:0.7; filter: grayscale(100%); }
.area-card .card-body{ padding:12px 14px; display:flex; flex-direction:column; gap:6px }
.area-card .card-title{ font-weight:800; font-size:15px; color: #0b2540 }
.area-card .card-sub.small{ font-size:13px; color:#52607a }

.pending-badge{ position:absolute; top:10px; right:10px; background:var(--btn-green,#0a8b5b); color:#fff; padding:6px 8px; border-radius:999px; font-weight:700; font-size:12px; box-shadow:0 6px 14px rgba(11,37,64,0.12) }

.area-icon{ width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; background:rgba(255,255,255,0.9); box-shadow:0 6px 12px rgba(11,37,64,0.04); margin-right:8px }
.card-title .label-wrap{ display:flex; align-items:center; gap:10px }

.area-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:22px }
@media (max-width:960px){ .area-grid{ grid-template-columns: repeat(2,1fr) } }
@media (max-width:560px){ .area-grid{ grid-template-columns: 1fr } }

/* Small mobile fixes: avoid top overlap and badges absolute on tiny screens */
@media (max-width:560px){
  .cards-panel{ margin-top:22px }
  .area-card .pending-badge{ position:relative; margin:8px 12px 0 auto }
}

/* Modal / catalog styles */
.modal-backdrop{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.48); z-index:1400; padding:20px }
.modal-card{ width:min(920px,100%); max-width:920px; background:var(--card-bg,#fff); border-radius:12px; overflow:hidden; box-shadow:0 30px 80px rgba(2,6,23,0.48); display:flex; gap:0 }
.modal-media{ flex:1 1 48%; background:#f6f8fa; display:flex; align-items:center; justify-content:center; min-height:260px }
.modal-media img{ width:100%; height:100%; object-fit:cover }
.modal-body{ flex:1 1 52%; padding:20px; display:flex; flex-direction:column; gap:12px }
.modal-body h3{ margin:0; font-size:20px }
.modal-hint{ color:#50718a; font-weight:700 }
.modal-desc{ color:#334155; line-height:1.45 }
.modal-actions{ margin-top:auto; display:flex; gap:12px; justify-content:flex-end }
.card-desc{ margin-top:8px; color:#44566b; font-size:13px }
.pending-line{ margin-top:8px; color:#b08800; font-weight:700; font-size:12px }
.card-actions{ margin-top:12px; display:flex; justify-content:flex-end }
.btn.ghost{ background:transparent; border:1px solid rgba(0,0,0,0.06); color:var(--btn-green,#0a8b5b); padding:8px 12px }
.btn.primary{ background: linear-gradient(90deg,var(--btn-green,#00c6a7),#00a5ff); color:#fff; padding:8px 12px; border-radius:8px; border:none }

@media (max-width:880px){ .modal-card{ flex-direction:column } .modal-media{ min-height:180px } }

</style>