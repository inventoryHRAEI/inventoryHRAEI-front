<template>
  <ActionPanel>
    <template #title>Hola, {{ user?.nombre }}</template>
    <h5>Selecciona el tipo de operación</h5>

    <div class="cards-panel">
      <div class="area-grid">
        <div class="area-card compact" v-for="op in operations" :key="op.name" role="button" tabindex="0" @click.prevent="go(op.name)" @keyup.enter="go(op.name)" :aria-label="`Ir a ${op.label}`">
          <div class="card-media">
            <img class="card-img" :src="op.img" :alt="op.label" />
          </div>
          <div class="card-body">
            <div class="card-title">{{ op.label }}</div>
            <div class="card-desc">{{ op.desc }}</div>
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
import { useRouter } from 'vue-router'
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre') }

// Imágenes para operaciones (proporcionadas en src/images)
import imgEntrada from '@/images/entrada_equips.png'
import imgSalida from '@/images/salida_equipo.png'
import imgResguardo from '@/images/Resguardo_imagen.png'
import imgServicio from '@/images/Servicio_equipo.png'
import imgInventario from '@/images/Inventario.png'
import imgConsumibles from '@/images/Consumibles_bajo_pedido.png'

const operations = [
  { name: 'op-entrada', label: 'Órdenes de Entrada', desc: 'Captura de entradas de equipo/material.', img: imgEntrada },
  { name: 'op-salida', label: 'Órdenes de Salida', desc: 'Registro de salidas y egresos.', img: imgSalida },
  { name: 'op-resguardo', label: 'Resguardo', desc: 'Asignaciones y resguardos.', img: imgResguardo },
  { name: 'op-servicio', label: 'Servicio', desc: 'Órdenes de servicio y mantenimiento.', img: imgServicio },
  { name: 'op-inventario-biomedica', label: 'Inventario Biomédica', desc: 'Inventario y conteos.', img: imgInventario },
  { name: 'op-insumos-consumibles', label: 'Insumos y Consumibles', desc: 'Gestión de insumos.', img: imgConsumibles }
]

function go(name){ router.push({ name }).catch(()=>{}) }
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