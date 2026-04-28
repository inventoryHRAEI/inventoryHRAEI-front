import { ref } from 'vue'

// Store mínimo para llevar el conteo de solicitudes pendientes de permiso
const totalPending = ref(0)
const byEmail = ref({})
const byArea = ref({})

async function refresh() {
  try {
    const res = await fetch('/api/auth/permission-requests')
    if (!res || !res.ok) { totalPending.value = 0; byEmail.value = {}; return }
    const rows = await res.json()
    const map = {}
    const areaMap = {}
    let total = 0
    for (const r of rows) {
      if (r.status === 'pending') {
        map[r.email] = (map[r.email] || 0) + 1
        areaMap[r.area] = (areaMap[r.area] || 0) + 1
        total++
      }
    }
    byEmail.value = map
    byArea.value = areaMap
    totalPending.value = total
  } catch (e) {
    console.error('Error cargando permission-requests:', e)
    totalPending.value = 0
    byEmail.value = {}
    byArea.value = {}
  }
}

// NO inicializar automáticamente - se ejecutará desde App.vue solo en rutas protegidas

export default { totalPending, byEmail, byArea, refresh }
