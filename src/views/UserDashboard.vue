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
  }, 1500)
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
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid rgba(16, 24, 40, 0.06);
  box-shadow: 0 6px 18px rgba(11, 37, 64, 0.04);
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.28s ease,
              border-color 0.28s ease;
  cursor: pointer;
}

.area-card:focus {
  outline: 2px solid rgba(46, 221, 90, 0.4);
  outline-offset: 4px;
}

.area-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 28px 56px rgba(11, 37, 64, 0.15),
              0 0 0 1px rgba(46, 221, 90, 0.15);
}

.area-card:active {
  transform: translateY(-4px) scale(1.01);
}

.area-card .card-media {
  height: 130px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.area-card .card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  transition: transform 0.3s ease;
}

.area-card:hover .card-media img {
  transform: scale(1.05);
}

.card-icon-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 5;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-icon-badge svg {
  width: 24px;
  height: 24px;
  color: #0bb828;
}

.area-card:hover .card-icon-badge {
  transform: scale(1.1) rotate(-5deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.area-card .card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.area-card .card-title {
  font-weight: 800;
  font-size: 1rem;
  color: #0b2540;
}

.card-desc {
  margin-top: 4px;
  color: #52607a;
  font-size: 0.85rem;
  line-height: 1.4;
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
