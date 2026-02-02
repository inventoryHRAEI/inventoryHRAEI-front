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
          @click.prevent="handleCardClick(op.name)"
          @keyup.enter="handleCardClick(op.name)"
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { gsap } from 'gsap'
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
let loadingTimeout = null

import imgEntrada from '@/images/entrada_equips.png'
import imgSalida from '@/images/salida_equipo.png'
import imgResguardo from '@/images/Resguardo_imagen.png'
import imgServicio from '@/images/Servicio_equipo.png'
import imgInventario from '@/images/Inventario.png'
import imgConsumibles from '@/images/Consumibles_bajo_pedido.png'

const operations = [
  { name: 'order-management', label: 'Órdenes de Entrada', desc: 'Gestión y administración de órdenes de entrada.', img: imgEntrada, icon: ArrowDownTrayIcon },
  { name: 'order-management-salida', label: 'Órdenes de Salida', desc: 'Gestión y administración de órdenes de salida.', img: imgSalida, icon: ArrowUpTrayIcon },
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

function handleCardClick(name) {
  // For Resguardo, route the main card click to the order-management screen
  if (name === 'op-resguardo') {
    try { navigateAndRefresh(router, { name: 'order-management-resguardo' }) } catch {}
    return
  }
  try { navigateAndRefresh(router, { name }) } catch {}
}

onMounted(() => {
  loadingTimeout = setTimeout(async () => {
    loading.value = false
    
    // Animate cards on enter
    await nextTick()
    gsap.from('.area-card', {
      duration: 0.6,
      opacity: 0,
      y: 50,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'all'
    })

    // Pulsating animation for the "En línea" dot
    gsap.to('.activity-dot', {
      scale: 1.2,
      opacity: 0.6,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

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
    // try { pendingStore.refresh().catch(() => {}) } catch {}
  }
  window.addEventListener('app:force-recreate', onRecreate)
  onBeforeUnmount(() => { 
    if (loadingTimeout) clearTimeout(loadingTimeout)
    window.removeEventListener('app:force-recreate', onRecreate) 
  })
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
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  font-weight: 800;
  margin: 12px 0 24px 0;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #fff, rgba(255,255,255,0.7));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; 
}

.activity-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #a6ffcb;
  font-weight: 700;
  padding: 8px 16px;
  background: rgba(46, 221, 90, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(46, 221, 90, 0.3);
  box-shadow: 0 0 15px rgba(46, 221, 90, 0.15);
}

.activity-dot {
  width: 10px;
  height: 10px;
  background: #2edd5a;
  border-radius: 50%;
  box-shadow: 0 0 10px #2edd5a, 0 0 20px #2edd5a;
}

.cards-panel {
  margin-top: 28px;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
  /* Animación manejada por GSAP */
}

.card-actions {
  margin-top: 12px;
}
.card-actions .btn.small {
  padding: 6px 10px;
  font-size: 0.9rem;
  border-radius: 8px;
}

.area-card {
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03); /* Glass dark style */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.area-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.area-card:hover::before {
  opacity: 1;
}

.area-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.area-card:active {
  transform: translateY(-5px) scale(0.98);
}

.area-card .card-media {
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.area-card .card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(0.9);
}

.area-card:hover .card-media img {
  transform: scale(1.15);
  filter: brightness(1.1);
}

.card-icon-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 5;
  transition: all 0.4s ease;
}

.area-card:hover .card-icon-badge {
  transform: scale(1.1) rotate(5deg);
}

.area-card .card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%);
}

.area-card .card-title {
  font-weight: 800;
  font-size: 1.3rem;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.card-desc {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.6;
}

.badge-modern {
  margin-top: auto;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 800;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

/* Media Queries */
@media (max-width: 960px) {
  .area-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .area-grid {
    grid-template-columns: 1fr;
  }
  .area-card .card-media {
    height: 160px;
  }
}
</style>
