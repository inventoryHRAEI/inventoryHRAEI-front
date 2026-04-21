<template>
  <div class="home-wrap animate-in">
    <Breadcrumbs :items="breadcrumbItems" />
    <LoadingSkeleton v-if="pageLoading" type="hero" />
    
    <div v-else class="hero glass">
      <div class="hero-left">
        <h2 class="heading-xl text-gradient">Bienvenido al sistema de Gestión de inventarios de Ingeniería Biomédica HRAEI</h2>
        <p class="small-msg">Puedes gestionar: Todos los equipos médicos, equipos a comodatos, donaciones hechas al hospital, mobiliario clínico/médico de la subdirección de Ingeniería Biomédica.</p>
        
        <div class="stats-grid animate-in animate-in-delay-1">
          <div class="stat-card">
            <PackageIcon class="stat-icon" />
            <div class="stat-number">
              <span ref="stat1">0</span>+
            </div>
            <div class="stat-label">Equipos Gestionados</div>
          </div>
          <div class="stat-card">
            <ClipboardDocumentListIcon class="stat-icon" />
            <div class="stat-number">
              <span ref="stat2">0</span>+
            </div>
            <div class="stat-label">Operaciones Mensuales</div>
          </div>
          <div class="stat-card">
            <BuildingOffice2Icon class="stat-icon" />
            <div class="stat-number">
              <span ref="stat3">0</span>+
            </div>
            <div class="stat-label">Áreas Cubiertas</div>
          </div>
        </div>
      </div>
      
      <div class="hero-right animate-in animate-in-delay-1">
        <div class="carousel carousel-enhanced" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
          <div class="slide" v-for="(s, i) in slides" :key="i" :class="{ active: i === idx }">
            <img :src="s.img" :alt="s.title" loading="lazy" />
            <div class="caption">
              <div class="title">{{ s.title }}</div>
              <div class="desc">{{ s.desc }}</div>
              <div class="sub">Puedes gestionar todo desde un solo lugar.</div>
            </div>
          </div>
          
          <button class="carousel-arrow prev" @click="prevSlide" aria-label="Anterior">
            <ChevronLeftIcon />
          </button>
          <button class="carousel-arrow next" @click="nextSlide" aria-label="Siguiente">
            <ChevronRightIcon />
          </button>
          
          <div class="dots-enhanced">
            <button 
              v-for="(s, i) in slides" 
              :key="i" 
              :class="['dot-enhanced', i === idx ? 'active' : '']" 
              @click="goToSlide(i)" 
              :aria-label="`Ir a slide ${i + 1}`"
            ></button>
          </div>
        </div>

        <div class="cta-row animate-in animate-in-delay-2">
          <div class="cta-block">
            <div class="q">¿Ya tienes una cuenta creada?</div>
            <router-link to="/login"><button class="btn secondary btn-ripple">Inicia sesión</button></router-link>
          </div>
          <div class="cta-block">
            <div class="q">¿Deseas crear una cuenta?</div>
            <router-link to="/register"><button class="btn primary btn-ripple" style="margin-left:12px">Registrarse</button></router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div class="features-section animate-in animate-in-delay-3">
      <div class="features-grid">
        <div class="feature-card glass-modern">
          <ShieldCheckIcon class="feature-icon" />
          <h4>Seguro y Confiable</h4>
          <p>Sistema con autenticación robusta y control de acceso por roles.</p>
        </div>
        <div class="feature-card glass-modern">
          <ChartBarIcon class="feature-icon" />
          <h4>Trazabilidad Completa</h4>
          <p>Historial detallado de todos los movimientos de equipos.</p>
        </div>
        <div class="feature-card glass-modern">
          <DevicePhoneMobileIcon class="feature-icon" />
          <h4>Acceso Móvil</h4>
          <p>Interfaz adaptable para consultar desde cualquier dispositivo.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon
} from '@heroicons/vue/24/outline'
import { PackageIcon } from 'lucide-vue-next'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const breadcrumbItems = [
  { label: 'Inicio', to: '/' }
]

const pageLoading = ref(true)
const slides = ref([
  { img: '/carrusel/inventario_hospitaal.jpg', title: 'Gestión de Equipos', desc: 'Altas, ubicación, historial y trazabilidad.' },
  { img: '/carrusel/reparacion_equipo.jpg', title: 'Reparaciones y Mantenimiento', desc: 'Servicios, órdenes y seguimiento técnico.' },
  { img: '/carrusel/insumos_consumibles.jpg', title: 'Comodatos (Proveedor)', desc: 'Equipos en préstamo/comodato de proveedores.' },
  { img: '/carrusel/donaciones.jpeg', title: 'Donaciones', desc: 'Registro, validación y control de altas.' }
])

const idx = ref(0)
let timer = null
let isPaused = false

const stat1 = ref(null)
const stat2 = ref(null)
const stat3 = ref(null)

function animateNumber(element, target, duration = 2000) {
  if (!element) return
  const start = 0
  const startTime = performance.now()
  
  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(start + (target - start) * easeOut)
    element.textContent = current.toLocaleString()
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

function startCarousel() {
  timer = setInterval(() => {
    if (!isPaused) {
      idx.value = (idx.value + 1) % slides.value.length
    }
  }, 4500)
}

function pauseCarousel() {
  isPaused = true
}

function resumeCarousel() {
  isPaused = false
}

function nextSlide() {
  idx.value = (idx.value + 1) % slides.value.length
}

function prevSlide() {
  idx.value = (idx.value - 1 + slides.value.length) % slides.value.length
}

function goToSlide(i) {
  idx.value = i
}

onMounted(() => {
  setTimeout(() => {
    pageLoading.value = false
    startCarousel()
    
    setTimeout(() => {
      animateNumber(stat1.value, 500, 2000)
      animateNumber(stat2.value, 150, 2200)
      animateNumber(stat3.value, 25, 1800)
    }, 400)
  }, 1200)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.home-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
  gap: 40px;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
  width: 100%;
  max-width: 1300px;
  overflow: hidden;
}

.hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.heading-xl {
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 8px;
}

.small-msg {
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 8px 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px 12px;
  text-align: center;
  backdrop-filter: blur(8px);
  transition: transform 0.2s ease, background 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 28px;
  height: 28px;
  margin: 0 auto 8px;
  color: var(--accent);
  opacity: 0.9;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent);
  font-family: 'Poppins', sans-serif;
  line-height: 1.1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 4px;
  font-weight: 500;
}

.cta-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.cta-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cta-block .q {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.hero-right {
  position: relative;
}

.carousel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  height: 320px;
  min-height: 280px;
  max-height: 380px;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.7s cubic-bezier(.2,.9,.2,1), transform 0.7s cubic-bezier(.2,.9,.2,1);
  display: grid;
  place-items: center;
  transform: scale(1.02);
}

.slide.active {
  opacity: 1;
  transform: scale(1);
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.05) contrast(1.02);
}

.caption {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 60px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 0.95rem;
  backdrop-filter: blur(6px);
}

.caption .title {
  font-weight: 800;
  margin-bottom: 4px;
  font-size: 1.05rem;
}

.caption .desc {
  font-size: 0.9rem;
  opacity: 0.9;
}

.caption .sub {
  font-size: 0.82rem;
  opacity: 0.75;
  margin-top: 4px;
}

.features-section {
  width: 100%;
  max-width: 1300px;
  margin-top: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.feature-card {
  padding: 32px 28px;
  text-align: center;
  border-radius: 16px;
  background: rgba(19, 31, 52, 0.50);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px) saturate(150%);
  box-shadow: 0 16px 48px rgba(2, 6, 23, 0.32),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  transition: left 0.6s ease;
  pointer-events: none;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-12px) scale(1.02);
  background: rgba(19, 31, 52, 0.60);
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 24px 64px rgba(2, 6, 23, 0.48),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.feature-icon {
  width: 56px;
  height: 56px;
  color: var(--accent);
  margin: 0 auto 20px;
  padding: 12px;
  background: rgba(45, 221, 90, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(45, 221, 90, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.feature-card:hover .feature-icon {
  transform: scale(1.15) rotate(-5deg);
  background: rgba(45, 221, 90, 0.25);
  border-color: rgba(45, 221, 90, 0.5);
  box-shadow: 0 8px 24px rgba(45, 221, 90, 0.2);
}

.feature-card h4 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #fff;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
}

.feature-card p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .carousel {
    height: 260px;
    min-height: 220px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    padding: 12px 16px;
  }
  
  .stat-icon {
    margin: 0;
    width: 24px;
    height: 24px;
  }
  
  .stat-number {
    font-size: 1.3rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .cta-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .cta-block {
    width: 100%;
  }
  
  .cta-block .btn {
    width: 100%;
    margin-left: 0 !important;
  }
  
  .caption {
    bottom: 50px;
    left: 12px;
    right: 12px;
    padding: 12px;
  }
}
</style>
