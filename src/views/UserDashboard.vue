<template>
  <ActionPanel class="dashboard-main">
    <template #title>
      <div class="title-row">
        <span>Hola, {{ user?.nombre }}</span>
        <div class="activity-indicator">
          <span class="activity-dot"></span>
          <span>En línea</span>
        </div>
      </div>
    </template>
    
    <Breadcrumbs />
    
    <h5 class="section-subtitle">Selecciona el tipo de operación</h5>

    <div class="cards-panel">
      <LoadingSkeleton v-if="loading" type="cards" :count="6" />
      
      <div v-else class="area-grid">
        <div
          class="area-card compact card-shimmer"
          v-for="op in operations"
          :key="op.name"
          :class="{ embedded: isEmbedded(op.name) }"
          role="button"
          tabindex="0"
          @click.prevent="go(op.name)"
          @keyup.enter="go(op.name)"
          :aria-label="`Ir a ${op.label}`"
        >
          <div class="card-media">
            <img class="card-img" :src="op.img" :alt="op.label" />
            <div class="card-icon-badge">
              <component :is="op.icon" />
            </div>
          </div>
          <div class="card-body">
            <div class="card-title">{{ op.label }}</div>
            <div class="card-desc">{{ op.desc }}</div>
            <div v-if="op.badge" class="badge-modern badge-success badge-pulse">
              {{ op.badge }}
            </div>
          </div>
        </div>
      </div>
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
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CubeIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const user = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre') }
const loading = ref(true)

import imgEntrada from '@/images/entrada_equips.png'
import imgSalida from '@/images/salida_equipo.png'
import imgResguardo from '@/images/Resguardo_imagen.png'
import imgServicio from '@/images/Servicio_equipo.png'
import imgInventario from '@/images/Inventario.png'
import imgConsumibles from '@/images/Consumibles_bajo_pedido.png'

const operations = [
  { name: 'op-entrada', label: 'Órdenes de Entrada', desc: 'Captura de entradas de equipo/material.', img: imgEntrada, icon: ArrowDownTrayIcon },
  { name: 'op-salida', label: 'Órdenes de Salida', desc: 'Registro de salidas y egresos.', img: imgSalida, icon: ArrowUpTrayIcon },
  { name: 'op-resguardo', label: 'Resguardo', desc: 'Asignaciones y resguardos.', img: imgResguardo, icon: ShieldCheckIcon },
  { name: 'op-servicio', label: 'Servicio', desc: 'Órdenes de servicio y mantenimiento.', img: imgServicio, icon: WrenchScrewdriverIcon },
  { name: 'op-inventario-biomedica', label: 'Inventario Biomédica', desc: 'Inventario y conteos.', img: imgInventario, icon: ClipboardDocumentListIcon },
  { name: 'op-insumos-consumibles', label: 'Insumos y Consumibles', desc: 'Gestión de insumos.', img: imgConsumibles, icon: CubeIcon }
]

const showRequests = ref(false)
const myRequests = ref([])

function isEmbedded(opName) {
  try {
    const rn = route && route.name ? String(route.name) : ''
    if (rn === opName) return true
    const q = route && route.query ? route.query.area : null
    if (q && String(q) === opName) return true
  } catch (e) {}
  return false
}

function go(name) {
  router.push({ name }).catch(() => {})
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 600)
})
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.activity-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.activity-dot {
  width: 8px;
  height: 8px;
  background: #2edd5a;
  border-radius: 50%;
  animation: activity-blink 2s infinite;
}

@keyframes activity-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.cards-panel {
  margin-top: 18px;
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

.area-card .card-body {
  padding: 20px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.8));
}

.area-card .card-title {
  font-weight: 800;
  font-size: 1.1rem;
  color: #1e293b;
}

.card-desc {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.badge-modern {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  width: fit-content;
  margin-top: 8px;
}

.badge-success {
  background: rgba(46, 221, 90, 0.15);
  color: #0bb828;
  border: 1px solid rgba(46, 221, 90, 0.3);
}

.glass-panel {
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.list-panel h3 {
  margin: 0 0 12px 0;
  color: #fff;
}

.area-card.embedded {
  background: rgba(19, 31, 52, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.28);
  backdrop-filter: blur(18px) saturate(160%);
}

.area-card.embedded .card-title,
.area-card.embedded .card-desc {
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
  
  .cards-panel {
    margin-top: 16px;
  }
  
  .area-card .card-media {
    height: 120px;
  }
}
</style>
