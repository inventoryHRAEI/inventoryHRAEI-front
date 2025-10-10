<template>
  <ActionPanel>
    <template #title>Usuario — Accesos</template>

    <div class="grid-cards reactive-panel">
      <button class="card-button muted" @click.prevent="requestPermission('EQUIPO MEDICO I.P')">EQUIPO MEDICO I.P</button>
      <button class="card-button muted" @click.prevent="requestPermission('EQUIPOS DE ADQUISICIÓN')">EQUIPOS DE ADQUISICIÓN</button>
      <button class="card-button muted" @click.prevent="requestPermission('COMODATOS')">COMODATOS</button>
      <button class="card-button muted" @click.prevent="requestPermission('MOBILIARIO CLÍNICO/MÉDICO')">MOBILIARIO CLÍNICO/MÉDICO</button>
      <button class="card-button muted" @click.prevent="requestPermission('DONACIÓN')">DONACIÓN</button>
      <button class="card-button muted" @click.prevent="requestPermission('MICROPIPETAS Y PIPETAS')">MICROPIPETAS Y PIPETAS</button>
    </div>

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
import notifier from '@/utils/notifier'

const user = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre'), role: localStorage.getItem('role'), email: localStorage.getItem('email') }
const showRequests = ref(false)
const myRequests = ref([])

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

const requestPermission = async (area) => {
  try {
    const { res, data } = await fetchPermission('/permission-requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, area })
    })
    if (!res || !res.ok) throw new Error((data && data.msg) || `Error del servidor (${res ? res.status : 'sin respuesta'})`)
  notifier.success('Solicitud enviada')
    await loadMyRequests()
    showRequests.value = true
  } catch (e) { notifier.error(e.message || 'No se pudo enviar la solicitud') }
}

const loadMyRequests = async () => {
  try {
    const { res, data } = await fetchPermission('/permission-requests')
    if (!res || !res.ok) { console.warn('Servidor no disponible:', res ? res.status : 'sin respuesta'); myRequests.value = []; return }
    const rows = data || []
    myRequests.value = Array.isArray(rows) ? rows.filter(r => r.email === user.email) : []
  } catch (e) { console.error('Error cargando solicitudes:', e); myRequests.value = [] }
}

onMounted(loadMyRequests)
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
</style>