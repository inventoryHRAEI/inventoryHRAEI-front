<template>
  <div class="alt-card" @click="toggleExpand">
    <div class="alt-header">
      <div class="left">
        <div class="badge">{{ inventory }}</div>
        <div class="title">{{ equipo }}</div>
        <div class="meta">{{ marcaModel }}</div>
      </div>
      <div class="right">
        <div class="status" :class="statusClass">{{ statusText }}</div>
        <div class="location">{{ unidadMedica }}</div>
      </div>
    </div>
    <div v-if="expanded" class="alt-body">
      <div class="row"><strong>Serie:</strong> {{ serie || '—' }}</div>
      <div class="row"><strong>Año:</strong> {{ ano || '—' }}</div>
      <div class="row small-json">{{ briefJson }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
  onShowBarcode: { type: Function, default: null }
})

const expanded = ref(false)
function toggleExpand() {
  expanded.value = !expanded.value
}

function normalizeMap(obj) {
  const map = {}
  if (!obj || typeof obj !== 'object') return map
  for (const k of Object.keys(obj)) {
    try {
      map[String(k).trim().toLowerCase()] = obj[k]
    } catch (e) {}
  }
  return map
}

const norm = computed(() => normalizeMap(props.item))

const inventory = computed(() => {
  return (norm.value['no de inventario'] || norm.value['no de inventario?'] || norm.value['codigo'] || norm.value['no_de_inventario'] || 'N/A')
})

const equipo = computed(() => {
  return norm.value['equipo medico'] || norm.value['equipo'] || norm.value['equipomedico'] || 'Equipo'
})

const marcaModel = computed(() => {
  const m = norm.value['marca'] || norm.value['brand'] || ''
  const mo = norm.value['modelo'] || norm.value['model'] || ''
  return (m && mo) ? `${m} · ${mo}` : (m || mo || '—')
})

const unidadMedica = computed(() => norm.value['unidad medica'] || norm.value['unidad'] || norm.value['ubicacion'] || '—')
const serie = computed(() => norm.value['serie'] || norm.value['numero de serie'] || norm.value['numero_de_serie'] || '')
const ano = computed(() => norm.value['año'] || norm.value['ano'] || '')
const statusText = computed(() => (norm.value['estatus'] || norm.value['estado'] || '').toString() || 'SIN ESTADO')
const statusClass = computed(() => {
  const s = (statusText.value || '').toLowerCase()
  if (s.includes('activo') || s.includes('operativo') || s.includes('disponible')) return 'ok'
  if (s.includes('mantenimiento') || s.includes('mantto') || s.includes('servicio')) return 'warn'
  if (s.includes('baja') || s.includes('fuera') || s.includes('no')) return 'crit'
  return 'def'
})

const briefJson = computed(() => {
  try {
    const clone = { ...props.item }
    // show only a few keys for quick debug
    const small = Object.keys(clone).slice(0,6).reduce((acc,k)=>{acc[k]=clone[k]; return acc},{})
    return JSON.stringify(small, null, 0)
  } catch (e) { return '' }
})
</script>

<style scoped>
.alt-card{background:linear-gradient(180deg,#0b1220,#071427);border-radius:12px;padding:12px;color:#dbeafe;border:1px solid rgba(255,255,255,0.04);display:flex;flex-direction:column;gap:8px;cursor:pointer}
.alt-header{display:flex;justify-content:space-between;align-items:flex-start}
.alt-header .left{display:flex;flex-direction:column;gap:6px}
.badge{background:rgba(34,211,238,0.08);padding:6px 8px;border-radius:8px;color:#67e8f9;font-weight:700}
.title{font-weight:800;color:#e6f0ff}
.meta{color:#94a3b8;font-size:0.85rem}
.status{padding:6px 10px;border-radius:10px;font-weight:700}
.status.ok{background:rgba(16,185,129,0.08);color:#86efac}
.status.warn{background:rgba(245,158,11,0.08);color:#fbbf24}
.status.crit{background:rgba(239,68,68,0.08);color:#fecaca}
.status.def{background:rgba(148,163,184,0.06);color:#cbd5e1}
.location{font-size:0.85rem;color:#94a3b8;margin-top:6px}
.alt-body{padding-top:6px;border-top:1px dashed rgba(255,255,255,0.03)}
.row{font-size:0.9rem;color:#cbd5e1;margin:6px 0}
.small-json{font-size:0.7rem;color:#94a3b8;opacity:0.9}
</style>
