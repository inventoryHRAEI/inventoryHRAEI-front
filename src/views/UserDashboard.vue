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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
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
  { name: 'order-management', label: 'Órdenes de Entrada', desc: 'Gestión y administración de órdenes de entrada.', img: imgEntrada, icon: ArrowDownTrayIcon },
  { name: 'op-salida', label: 'Órdenes de Salida', desc: 'Registro de salidas y egresos.', img: imgSalida, icon: ArrowUpTrayIcon },
  { name: 'op-resguardo', label: 'Resguardo', desc: 'Asignaciones y resguardos.', img: imgResguardo, icon: ShieldCheckIcon },
  { name: 'op-servicio', label: 'Servicio', desc: 'Órdenes de servicio y mantenimiento.', img: imgServicio, icon: WrenchScrewdriverIcon },
  { name: 'op-inventario-biomedica', label: 'Inventario Biomédica', desc: 'Inventario y conteos.', img: imgInventario, icon: ClipboardDocumentListIcon },
  { name: 'op-insumos-consumibles', label: 'Inventario de Subdirección', desc: 'Accesorios y Refacciones.', img: imgConsumibles, icon: CubeIcon }
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
  try { navigateAndRefresh(router, { name }) } catch {}
}

onMounted(() => {
  setTimeout(async () => {
    loading.value = false
    // Diagnostic: check main container children after a frame
    try {
      await new Promise(r => requestAnimationFrame(r))
      const main = document.querySelector('main.container')
      const count = main ? main.children.length : null
      console.debug('[UserDashboard] DIAG main children count', count)
    } catch (e) { console.warn('[UserDashboard] diagnostic check failed', e) }
  }, 1500)

  try { window.dispatchEvent(new CustomEvent('route:mounted', { detail: { name: route.name, path: route.fullPath } })); console.debug('[UserDashboard] dispatched route:mounted', { name: route.name, path: route.fullPath }) } catch (e) {}

  const onRecreate = () => {
    try { pendingStore.refresh().catch(() => {}) } catch {}
  }
  window.addEventListener('app:force-recreate', onRecreate)
  onBeforeUnmount(() => { window.removeEventListener('app:force-recreate', onRecreate) })
})
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.05rem;
  font-weight: 700;
  margin: 12px 0 20px 0;
  letter-spacing: -0.3px;
}

.activity-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 600;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(76, 220, 130, 0.08));
  border-radius: 20px;
  border: 1px solid rgba(46, 221, 90, 0.25);
}

.activity-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #2edd5a, #00d65e);
  border-radius: 50%;
  animation: activity-blink 2s infinite;
  box-shadow: 0 0 10px rgba(46, 221, 90, 0.5);
}

@keyframes activity-blink {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(46, 221, 90, 0.5); }
  50% { opacity: 0.5; box-shadow: 0 0 5px rgba(46, 221, 90, 0.2); }
}

.cards-panel {
  margin-top: 28px;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.area-card {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbfd 100%);
  border: 1px solid rgba(16, 24, 40, 0.08);
  box-shadow: 0 10px 30px rgba(11, 37, 64, 0.08), 0 1px 0 rgba(16, 24, 40, 0.04);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.area-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--card-color, #2edd5a), transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.area-card:hover::before {
  opacity: 1;
}

/* Color específico para cada tarjeta */
.area-card:nth-child(1) { --card-color: #3b82f6; }
.area-card:nth-child(2) { --card-color: #f59e0b; }
.area-card:nth-child(3) { --card-color: #10b981; }
.area-card:nth-child(4) { --card-color: #8b5cf6; }
.area-card:nth-child(5) { --card-color: #ec4899; }
.area-card:nth-child(6) { --card-color: #06b6d4; }

.area-card:focus {
  outline: 2px solid rgba(46, 221, 90, 0.4);
  outline-offset: 4px;
}

.area-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(11, 37, 64, 0.18), 0 0 1px rgba(0, 0, 0, 0.05);
}

.area-card:active {
  transform: translateY(-6px);
}

.area-card .card-media {
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(16, 24, 40, 0.05), rgba(16, 24, 40, 0.02));
}

.area-card .card-media::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 50%);
  pointer-events: none;
}

.area-card .card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: brightness(1) contrast(1.05);
}

.area-card:hover .card-media img {
  transform: scale(1.08);
}

.card-icon-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 253, 0.95));
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 5;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.card-icon-badge svg {
  width: 26px;
  height: 26px;
  transition: all 0.35s ease;
}

.area-card:nth-child(1) .card-icon-badge svg { color: #3b82f6; }
.area-card:nth-child(2) .card-icon-badge svg { color: #f59e0b; }
.area-card:nth-child(3) .card-icon-badge svg { color: #10b981; }
.area-card:nth-child(4) .card-icon-badge svg { color: #8b5cf6; }
.area-card:nth-child(5) .card-icon-badge svg { color: #ec4899; }
.area-card:nth-child(6) .card-icon-badge svg { color: #06b6d4; }

.area-card:hover .card-icon-badge {
  transform: scale(1.15) rotate(-8deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

.area-card .card-body {
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.area-card .card-title {
  font-weight: 800;
  font-size: 1.05rem;
  color: #0b2540;
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.card-desc {
  margin-top: 0;
  color: #647280;
  font-size: 0.85rem;
  line-height: 1.5;
}

.badge-modern {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  width: fit-content;
  margin-top: 10px;
}

.badge-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.08));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.glass-panel {
  margin-top: 28px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px) saturate(140%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.list-panel h3 {
  margin: 0 0 12px 0;
  color: #fff;
}

.area-card.embedded {
  background: linear-gradient(135deg, rgba(19, 31, 52, 0.7), rgba(15, 25, 45, 0.6));
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(160%);
}

.area-card.embedded .card-title,
.area-card.embedded .card-desc {
  color: #e6ebf5;
}

@media (max-width: 960px) {
  .area-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 560px) {
  .area-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .cards-panel {
    margin-top: 24px;
  }
  
  .area-card .card-media {
    height: 120px;
  }

  .area-card {
    border-radius: 14px;
  }

  .card-icon-badge {
    width: 45px;
    height: 45px;
    top: 12px;
    left: 12px;
  }

  .card-icon-badge svg {
    width: 22px;
    height: 22px;
  }
}
</style>
