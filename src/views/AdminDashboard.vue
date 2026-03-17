<template>
  <ActionPanel class="dashboard-main">
    <template #title>
      <div class="greeting-bar">
        <div class="greeting-left">
          <div class="avatar-ring admin-avatar">
            <ShieldCheckIcon class="avatar-icon-admin" />
            <span class="avatar-status-dot"></span>
          </div>
          <div class="greeting-text">
            <p class="greeting-label">{{ greeting }}</p>
            <h2 class="greeting-name">Panel Administrativo</h2>
            <p class="greeting-sub">
              <span class="role-badge admin-badge">Administrador</span>
              <span class="separator-dot">·</span>
              Ingeniería Biomédica — HRAEI
            </p>
          </div>
        </div>
        <div class="greeting-right">
          <div class="stat-chip">
            <ChartBarIcon class="chip-icon" />
            <div class="chip-text">
              <span class="chip-value">5</span>
              <span class="chip-label">Módulos</span>
            </div>
          </div>
          <div class="date-chip">
            <CalendarDaysIcon class="chip-icon" />
            <div class="chip-text">
              <span class="chip-value">{{ todayDay }}</span>
              <span class="chip-label">{{ todayMonth }}</span>
            </div>
          </div>
          <div class="time-chip">
            <ClockIcon class="chip-icon" />
            <div class="chip-text">
              <span class="chip-value">{{ currentTime }}</span>
              <span class="chip-label">Hora local</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Breadcrumbs />

    <!-- ═══ SECTION TITLE ═══ -->
    <div class="section-header">
      <div class="section-left">
        <h3 class="section-title">Operaciones administrativas</h3>
        <p class="section-subtitle">Gestión y control completo del sistema</p>
      </div>
      <div class="section-right">
        <div class="online-badge">
          <span class="online-dot"></span>
          <span>Sistema operativo</span>
        </div>
      </div>
    </div>

    <div class="cards-panel">
      <LoadingSkeleton v-if="loading" type="cards" :count="5" />

      <template v-else>
        <!-- ═══ HERO (tarjeta activa, arriba) ═══ -->
        <div class="hero-wrap">
          <Transition name="hero-swap" mode="out-in">
            <div
              :key="activeModule.name"
              class="hero-card"
              :class="activeModule.accent"
              role="button"
              tabindex="0"
              :aria-label="activeModule.label"
              @click="handleCardClick(activeModule.routeName)"
              @keyup.enter="handleCardClick(activeModule.routeName)"
              @mouseenter="pauseCarousel"
              @mouseleave="resumeCarousel"
            >
              <!-- BG image -->
              <div class="hero-bg">
                <img :src="activeModule.img" :alt="activeModule.label" class="hero-bg-img" />
                <div class="hero-overlay" :class="'ho-' + activeModule.accent"></div>
              </div>

              <!-- Top accent stripe -->
              <div class="hero-stripe" :class="activeModule.accent"></div>

              <!-- Content -->
              <div class="hero-content">
                <div class="hero-left">
                  <div class="hero-icon-wrap" :class="'hi-' + activeModule.accent">
                    <component :is="activeModule.icon" class="hero-icon" />
                  </div>
                  <div class="hero-info">
                    <span class="hero-tag" :class="'ht-' + activeModule.accent">
                      <SparklesIcon class="tag-sparkle" />
                      {{ activeModule.tag }}
                    </span>
                    <h3 class="hero-title">{{ activeModule.label }}</h3>
                    <p class="hero-desc">{{ activeModule.desc }}</p>
                  </div>
                </div>
                <div class="hero-right">
                  <div class="hero-arrow" :class="'ha-' + activeModule.accent">
                    <ArrowRightIcon class="arrow-icon" />
                  </div>
                  <span class="hero-goto">Ir al módulo</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="hero-progress-wrap">
                <div class="hero-progress" :key="progressKey" :class="{ paused: carouselPaused }"></div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ═══ QUEUE (4 tarjetas inactivas, abajo) ═══ -->
        <TransitionGroup name="queue-card" tag="div" class="queue-row">
          <div
            v-for="mod in queueModules"
            :key="mod.name"
            class="queue-card"
            :class="mod.accent"
            role="button"
            tabindex="0"
            :aria-label="mod.label"
            @click="handleCardClick(mod.routeName)"
            @keyup.enter="handleCardClick(mod.routeName)"
            @mouseenter="pauseCarousel"
            @mouseleave="resumeCarousel"
          >
            <div class="qc-bg">
              <img :src="mod.img" :alt="mod.label" class="qc-bg-img" />
              <div class="qc-overlay" :class="'ho-' + mod.accent"></div>
            </div>
            <div class="qc-stripe" :class="mod.accent"></div>
            <div class="qc-body">
              <div class="qc-icon" :class="'hi-' + mod.accent">
                <component :is="mod.icon" class="qc-icon-svg" />
              </div>
              <div class="qc-info">
                <span class="qc-label">{{ mod.label }}</span>
                <span class="qc-tag" :class="'ht-' + mod.accent">{{ mod.tag }}</span>
              </div>
              <div class="qc-caret" :class="'ha-' + mod.accent">
                <ArrowRightIcon class="qc-caret-icon" />
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Dot navigation -->
        <div class="carousel-dots">
          <button
            v-for="(m, i) in allModules"
            :key="m.name"
            class="cdot"
            :class="{ active: i === activeIdx }"
            :aria-label="m.label"
            @click="goToSlide(i)"
          ></button>
        </div>
      </template>
    </div>

    <!-- ═══ FOOTER BRANDING ═══ -->
    <div class="dash-footer">
      <span class="footer-line"></span>
      <span class="footer-text">Sistema de gestión · Ingeniería Biomédica · HRAEI {{ new Date().getFullYear() }}</span>
      <span class="footer-line"></span>
    </div>
  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import { ref, computed, onMounted, onBeforeUnmount, nextTick, Transition, TransitionGroup } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { gsap } from 'gsap'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

import imgEntrada from '@/images/entrada_equips.png'
import imgSalida from '@/images/salida_equipo.png'
import imgResguardo from '@/images/Resguardo_imagen.png'
import imgServicio from '@/images/Servicio_equipo.png'
import imgInventario from '@/images/Inventario.png'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
let loadingTimeout = null
let clockInterval = null

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const now = new Date()
const todayDay = now.getDate()
const todayMonth = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(now).replace('.', '')

const currentTime = ref(
  new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
)

const allModules = [
  { name: 'op-inventario-biomedica', routeName: 'op-inventario-biomedica', label: 'Inventario Biomédica',  tag: 'Módulo principal', desc: 'Consulta y gestión completa del inventario de equipos médicos, mantenimientos y control de activos hospitalarios.', img: imgInventario, icon: ClipboardDocumentListIcon, accent: 'accent-indigo'   },
  { name: 'order-management',        routeName: 'order-management',        label: 'Órdenes de Entrada',   tag: 'Operaciones',      desc: 'Registro de nuevos ingresos al almacén y recepción de equipo médico.',                                              img: imgEntrada,    icon: ArrowDownTrayIcon,       accent: 'accent-emerald' },
  { name: 'order-management-salida', routeName: 'order-management-salida', label: 'Órdenes de Salida',    tag: 'Operaciones',      desc: 'Despacho, transferencias y control de salidas del almacén.',                                                          img: imgSalida,     icon: ArrowUpTrayIcon,         accent: 'accent-sky'     },
  { name: 'op-resguardo',            routeName: 'order-management-resguardo', label: 'Resguardo',         tag: 'Operaciones',      desc: 'Asignación, custodia y seguimiento de equipos en resguardo.',                                                         img: imgResguardo,  icon: ShieldCheckIcon,         accent: 'accent-violet'  },
  { name: 'op-servicio',             routeName: 'order-management-servicio',  label: 'Servicio',          tag: 'Operaciones',      desc: 'Órdenes de servicio, mantenimiento preventivo y correctivo.',                                                         img: imgServicio,   icon: WrenchScrewdriverIcon,   accent: 'accent-amber'   }
]

const activeModule = computed(() => allModules[activeIdx.value])
const queueModules = computed(() => allModules.filter((_, i) => i !== activeIdx.value))

// ── Carousel state ──────────────────────────────────────────────
const activeIdx = ref(0)
const progressKey = ref(0)
const carouselPaused = ref(false)
const CAROUSEL_MS = 10000
let carouselTimer = null

function goToSlide(i) {
  activeIdx.value = i
  progressKey.value++
  _resetCarouselTimer()
}

function pauseCarousel()  { carouselPaused.value = true;  clearInterval(carouselTimer) }
function resumeCarousel() { carouselPaused.value = false; _resetCarouselTimer() }
function _nextSlide()     { activeIdx.value = (activeIdx.value + 1) % allModules.length; progressKey.value++ }
function _resetCarouselTimer() {
  clearInterval(carouselTimer)
  if (!carouselPaused.value) carouselTimer = setInterval(_nextSlide, CAROUSEL_MS)
}
// ────────────────────────────────────────────────────────────────

function handleCardClick(routeName) {
  navigateAndRefresh(router, { name: routeName })
}

onMounted(() => {
  // Live clock
  clockInterval = setInterval(() => {
    currentTime.value = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  }, 30000)

  loadingTimeout = setTimeout(async () => {
    loading.value = false
    await nextTick()

    // Fix spawn stacking: set initial state BEFORE first paint, then animate TO final state
    gsap.set('.hero-wrap', { opacity: 0, y: 40 })
    gsap.set('.queue-card', { opacity: 0, y: 22 })
    gsap.set('.section-header', { opacity: 0, y: 12 })
    gsap.set('.dash-footer', { opacity: 0 })
    gsap.set('.stat-chip, .date-chip, .time-chip', { opacity: 0, x: 18 })

    // Now animate to visible
    gsap.to('.section-header', { duration: 0.5, opacity: 1, y: 0, delay: 0.15, ease: 'power3.out' })
    gsap.to('.hero-wrap', { duration: 0.7, opacity: 1, y: 0, delay: 0.2, ease: 'power4.out' })
    gsap.to('.queue-card', {
      duration: 0.55, opacity: 1, y: 0,
      stagger: { each: 0.08, from: 'start' },
      delay: 0.4, ease: 'power3.out', clearProps: 'all'
    })
    gsap.to('.stat-chip, .date-chip, .time-chip', { duration: 0.45, opacity: 1, x: 0, stagger: 0.08, delay: 0.1, ease: 'power2.out' })
    gsap.to('.dash-footer', { duration: 0.5, opacity: 1, delay: 0.9, ease: 'power2.out' })

    // Loops
    gsap.to('.online-dot', { scale: 1.5, opacity: 0.4, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to('.avatar-status-dot', { scale: 1.4, opacity: 0.4, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })

    // Start carousel after entrance anim
    setTimeout(() => _resetCarouselTimer(), 900)
  }, 800)

  try { window.dispatchEvent(new CustomEvent('route:mounted', { detail: { name: route.name, path: route.fullPath } })) } catch {}

  const onRecreate = () => {}
  window.addEventListener('app:force-recreate', onRecreate)
  onBeforeUnmount(() => {
    if (loadingTimeout) clearTimeout(loadingTimeout)
    if (clockInterval)  clearInterval(clockInterval)
    if (carouselTimer)  clearInterval(carouselTimer)
    window.removeEventListener('app:force-recreate', onRecreate)
  })
})
</script>

<style scoped>
/* ─── GREETING BAR ─────────────────────────────────────────── */
.greeting-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 28px; border-radius: 20px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(8px);
  gap: 20px; flex-wrap: wrap;
}
.greeting-left {
  display: flex; align-items: center; gap: 16px;
}
.avatar-ring {
  width: 54px; height: 54px; border-radius: 50%; position: relative;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow:
    0 0 0 3px rgba(99,102,241,.2),
    0 0 0 6px rgba(99,102,241,.08),
    0 8px 24px rgba(99,102,241,.35);
  animation: avatarGlow 4s ease-in-out infinite alternate;
}

/* Admin-specific avatar glow */
.avatar-ring.admin-avatar {
  background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
  box-shadow:
    0 0 0 3px rgba(16,185,129,.25),
    0 0 0 6px rgba(16,185,129,.1),
    0 8px 24px rgba(16,185,129,.4);
}

@keyframes avatarGlow {
  0%   { box-shadow: 0 0 0 3px rgba(99,102,241,.2), 0 0 0 6px rgba(99,102,241,.08), 0 8px 24px rgba(99,102,241,.35); }
  100% { box-shadow: 0 0 0 3px rgba(139,92,246,.3), 0 0 0 6px rgba(139,92,246,.12), 0 8px 30px rgba(139,92,246,.45); }
}
.avatar-ring.admin-avatar {
  animation: avatarGlowAdmin 4s ease-in-out infinite alternate;
}
@keyframes avatarGlowAdmin {
  0%   { box-shadow: 0 0 0 3px rgba(16,185,129,.25), 0 0 0 6px rgba(16,185,129,.1), 0 8px 24px rgba(16,185,129,.4); }
  100% { box-shadow: 0 0 0 3px rgba(52,211,153,.35), 0 0 0 6px rgba(52,211,153,.14), 0 8px 30px rgba(52,211,153,.5); }
}

.avatar-letter {
  color: #fff; font-weight: 800; font-size: 1.3rem; text-transform: uppercase;
  text-shadow: 0 1px 3px rgba(0,0,0,.3);
}
.avatar-icon-admin {
  width: 28px; height: 28px; color: #fff;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,.3));
}
.avatar-status-dot {
  position: absolute; bottom: 2px; right: 2px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #22c55e; border: 2.5px solid rgba(13,20,35,.9);
  box-shadow: 0 0 8px rgba(34,197,94,.6);
}
.greeting-label {
  margin: 0; font-size: .78rem; font-weight: 600;
  color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: 1.2px;
}
.greeting-name {
  margin: 2px 0 0; font-size: 1.5rem; font-weight: 800; color: #fff;
  letter-spacing: -.5px; line-height: 1.15;
}
.greeting-sub {
  margin: 4px 0 0; font-size: .8rem; color: rgba(255,255,255,.45); font-weight: 500;
  display: flex; align-items: center; gap: 6px;
}
.role-badge {
  padding: 2px 8px; border-radius: 5px; font-size: .7rem; font-weight: 700;
  background: rgba(99,102,241,.15); color: #a78bfa;
  border: 1px solid rgba(99,102,241,.25); text-transform: capitalize;
}
.role-badge.admin-badge {
  background: rgba(16,185,129,.15); color: #6ee7b7;
  border: 1px solid rgba(16,185,129,.25);
}
.separator-dot { opacity: .35; }

/* ─── STAT CHIPS (right side) ──────────────────────────────── */
.greeting-right {
  display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap;
}
.stat-chip, .date-chip, .time-chip {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  backdrop-filter: blur(6px);
  transition: background .3s, border-color .3s, transform .3s;
}
.stat-chip:hover, .date-chip:hover, .time-chip:hover {
  background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.12);
  transform: translateY(-2px);
}
.chip-icon { width: 18px; height: 18px; color: rgba(255,255,255,.4); }
.chip-text { display: flex; flex-direction: column; }
.chip-value { font-size: .95rem; font-weight: 800; color: #fff; line-height: 1.1; font-variant-numeric: tabular-nums; }
.chip-label { font-size: .65rem; color: rgba(255,255,255,.4); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.stat-chip .chip-icon { color: #818cf8; }
.date-chip .chip-icon { color: #fb923c; }
.time-chip .chip-icon { color: #38bdf8; }

/* ─── SECTION HEADER ───────────────────────────────────────── */
.section-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-top: 28px; gap: 16px; flex-wrap: wrap;
}
.section-left { display: flex; flex-direction: column; gap: 2px; }
.section-title {
  margin: 0; font-size: 1.2rem; font-weight: 800; color: #fff;
  letter-spacing: -.4px;
}
.section-subtitle {
  margin: 0; font-size: .82rem; color: rgba(255,255,255,.4); font-weight: 500;
}
.section-right { display: flex; align-items: center; }
.online-badge {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.2);
  font-size: .75rem; font-weight: 600; color: #4ade80;
}
.online-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34,197,94,.6);
}

/* ─── 2-TIER CAROUSEL ──────────────────────────────────────── */
.cards-panel { margin-top: 18px; display: flex; flex-direction: column; gap: 14px; }

/* ══ HERO AREA ══════════════════════════════════════════════ */
.hero-wrap { position: relative; }

.hero-card {
  position: relative; border-radius: 24px; overflow: hidden;
  height: 240px; cursor: pointer;
  border: 1px solid rgba(255,255,255,.08);
  transition: border-color .4s cubic-bezier(.4,0,.2,1), box-shadow .4s cubic-bezier(.4,0,.2,1), transform .4s cubic-bezier(.4,0,.2,1);
}
.hero-card:hover { 
  border-color: rgba(255,255,255,.2); 
  transform: translateY(-3px);
}

/* Per-accent border glow on active hero - MEJORADO */
.hero-card.accent-indigo  { box-shadow: 0 0 0 1px rgba(99,102,241,.12),  0 24px 48px rgba(0,0,0,.38); }
.hero-card.accent-emerald { box-shadow: 0 0 0 1px rgba(16,185,129,.1),   0 24px 48px rgba(0,0,0,.38); }
.hero-card.accent-sky     { box-shadow: 0 0 0 1px rgba(56,189,248,.1),   0 24px 48px rgba(0,0,0,.38); }
.hero-card.accent-violet  { box-shadow: 0 0 0 1px rgba(139,92,246,.12),  0 24px 48px rgba(0,0,0,.38); }
.hero-card.accent-amber   { box-shadow: 0 0 0 1px rgba(251,191,36,.1),   0 24px 48px rgba(0,0,0,.38); }

.hero-card.accent-indigo:hover  { box-shadow: 0 0 0 1px rgba(99,102,241,.25),  0 28px 56px rgba(0,0,0,.42), 0 0 40px rgba(99,102,241,.15); }
.hero-card.accent-emerald:hover { box-shadow: 0 0 0 1px rgba(16,185,129,.2),   0 28px 56px rgba(0,0,0,.42), 0 0 40px rgba(16,185,129,.12); }
.hero-card.accent-sky:hover     { box-shadow: 0 0 0 1px rgba(56,189,248,.2),   0 28px 56px rgba(0,0,0,.42), 0 0 40px rgba(56,189,248,.12); }
.hero-card.accent-violet:hover  { box-shadow: 0 0 0 1px rgba(139,92,246,.25),  0 28px 56px rgba(0,0,0,.42), 0 0 40px rgba(139,92,246,.15); }
.hero-card.accent-amber:hover   { box-shadow: 0 0 0 1px rgba(251,191,36,.2),   0 28px 56px rgba(0,0,0,.42), 0 0 40px rgba(251,191,36,.12); }

.hero-bg { position: absolute; inset: 0; }
.hero-bg-img {
  width: 100%; height: 100%; object-fit: cover;
  filter: brightness(.38) saturate(1.15);
  transition: transform .8s cubic-bezier(.25,.46,.45,.94), filter .6s cubic-bezier(.4,0,.2,1);
}
.hero-card:hover .hero-bg-img { transform: scale(1.08); filter: brightness(.48) saturate(1.25); }

.hero-overlay { position: absolute; inset: 0; }

/* Accent stripe on top of hero */
.hero-stripe {
  position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 4;
  transition: height .3s;
}
.hero-card:hover .hero-stripe { height: 4px; }
.hero-stripe.accent-indigo  { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.hero-stripe.accent-emerald { background: linear-gradient(90deg, #10b981, #34d399); }
.hero-stripe.accent-sky     { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
.hero-stripe.accent-violet  { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.hero-stripe.accent-amber   { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

.hero-content {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 32px 44px; height: 100%;
}
.hero-left  { display: flex; align-items: center; gap: 24px; flex: 1; min-width: 0; }
.hero-right { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }

.hero-icon-wrap {
  width: 68px; height: 68px; min-width: 68px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 20px; border: 1px solid;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.1);
  transition: transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .4s cubic-bezier(.4,0,.2,1);
}
.hero-card:hover .hero-icon-wrap { transform: scale(1.12) rotate(-5deg); box-shadow: 0 12px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.15); }
.hero-icon { width: 34px; height: 34px; color: #fff; }

.hero-info { flex: 1; min-width: 0; }
.hero-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 8px; border: 1px solid;
  font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .9px;
  margin-bottom: 10px;
}
.tag-sparkle { width: 12px; height: 12px; }
.hero-title {
  margin: 0; font-size: 1.7rem; font-weight: 800; color: #fff;
  letter-spacing: -.6px; line-height: 1.15;
  text-shadow: 0 2px 12px rgba(0,0,0,.3);
}
.hero-desc {
  margin: 8px 0 0; color: rgba(255,255,255,.6);
  font-size: .88rem; line-height: 1.55; max-width: 520px;
}

.hero-arrow {
  width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  transition: background .35s, transform .35s, box-shadow .35s;
}
.hero-card:hover .hero-arrow  { transform: translateX(5px); }
.arrow-icon { width: 22px; height: 22px; color: #fff; }
.hero-goto {
  font-size: .65rem; color: rgba(255,255,255,.35); font-weight: 600;
  text-transform: uppercase; letter-spacing: .8px; transition: color .3s;
}
.hero-card:hover .hero-goto { color: rgba(255,255,255,.7); }

/* Per-accent arrow hover */
.hero-card.accent-indigo:hover  .hero-arrow { background: rgba(99,102,241,.6);  box-shadow: 0 8px 24px rgba(99,102,241,.35); }
.hero-card.accent-emerald:hover .hero-arrow { background: rgba(16,185,129,.6);  box-shadow: 0 8px 24px rgba(16,185,129,.3);  }
.hero-card.accent-sky:hover     .hero-arrow { background: rgba(56,189,248,.6);  box-shadow: 0 8px 24px rgba(56,189,248,.3);  }
.hero-card.accent-violet:hover  .hero-arrow { background: rgba(139,92,246,.6); box-shadow: 0 8px 24px rgba(139,92,246,.35); }
.hero-card.accent-amber:hover   .hero-arrow { background: rgba(251,191,36,.55); box-shadow: 0 8px 24px rgba(251,191,36,.28); }

/* Hero progress bar */
.hero-progress-wrap {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: rgba(255,255,255,.07); z-index: 5;
}
.hero-progress {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, rgba(255,255,255,.4), rgba(255,255,255,.8));
  animation: hero-fill 10s linear forwards;
}
.hero-progress.paused { animation-play-state: paused; }
@keyframes hero-fill { from { width: 0% } to { width: 100% } }

/* Hero swap transition (out-in) - MEJORADO */
.hero-swap-enter-active {
  transition: opacity .45s cubic-bezier(.4,0,.2,1) .08s, transform .5s cubic-bezier(.34,1.56,.64,1) .05s;
}
.hero-swap-leave-active {
  transition: opacity .32s cubic-bezier(.4,0,1,1), transform .38s cubic-bezier(.4,0,1,1);
}
.hero-swap-enter-from { opacity: 0; transform: translateY(35px) scale(.95); }
.hero-swap-leave-to   { opacity: 0; transform: translateY(-25px) scale(.96); }

/* ══ QUEUE ROW ══════════════════════════════════════════════ */
.queue-row {
  display: flex; gap: 14px;
}

.queue-card {
  flex: 1 1 0; min-width: 0;
  position: relative; border-radius: 18px; overflow: hidden;
  height: 130px; cursor: pointer;
  border: 1px solid rgba(255,255,255,.07);
  transition: border-color .35s cubic-bezier(.4,0,.2,1), box-shadow .35s cubic-bezier(.4,0,.2,1), transform .35s cubic-bezier(.34,1.56,.64,1);
}
.queue-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(255,255,255,.2);
}
.queue-card:hover .qc-bg-img { transform: scale(1.12); filter: brightness(.52) saturate(1.25); }
.queue-card:hover .qc-caret  { transform: translateX(5px) scale(1.1); }

/* Queue card bg */
.qc-bg { position: absolute; inset: 0; }
.qc-bg-img {
  width: 100%; height: 100%; object-fit: cover;
  filter: brightness(.32) saturate(1.05);
  transition: transform .6s cubic-bezier(.25,.46,.45,.94), filter .5s cubic-bezier(.4,0,.2,1);
}
.qc-overlay { position: absolute; inset: 0; opacity: .55; }

/* Top stripe on queue card */
.qc-stripe {
  position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 4;
}
.qc-stripe.accent-indigo  { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.qc-stripe.accent-emerald { background: linear-gradient(90deg, #10b981, #34d399); }
.qc-stripe.accent-sky     { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
.qc-stripe.accent-violet  { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.qc-stripe.accent-amber   { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

/* Queue card body */
.qc-body {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 12px;
  padding: 0 16px; height: 100%;
}
.qc-icon {
  width: 38px; height: 38px; min-width: 38px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px; border: 1px solid;
  transition: transform .4s cubic-bezier(.34,1.56,.64,1);
}
.queue-card:hover .qc-icon { transform: scale(1.15) rotate(8deg); }
.qc-icon-svg { width: 18px; height: 18px; color: #fff; }
.qc-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 3px;
}
.qc-label {
  font-size: .85rem; font-weight: 700; color: rgba(255,255,255,.85);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.qc-tag {
  font-size: .65rem; font-weight: 600; text-transform: uppercase; letter-spacing: .6px;
  padding: 2px 7px; border-radius: 5px; border: 1px solid;
  display: inline-block; width: fit-content;
}
.qc-caret {
  width: 28px; height: 28px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: rgba(255,255,255,.07);
  transition: transform .3s, background .3s;
}
.queue-card:hover .qc-caret { background: rgba(255,255,255,.14); }
.qc-caret-icon { width: 14px; height: 14px; color: rgba(255,255,255,.5); }

/* Per-accent glow on queue hover - MEJORADO */
.queue-card.accent-indigo:hover  { box-shadow: 0 16px 40px rgba(0,0,0,.35), 0 0 0 1px rgba(99,102,241,.3),  0 0 32px rgba(99,102,241,.2); }
.queue-card.accent-emerald:hover { box-shadow: 0 16px 40px rgba(0,0,0,.35), 0 0 0 1px rgba(16,185,129,.25), 0 0 32px rgba(16,185,129,.18); }
.queue-card.accent-sky:hover     { box-shadow: 0 16px 40px rgba(0,0,0,.35), 0 0 0 1px rgba(56,189,248,.25), 0 0 32px rgba(56,189,248,.18); }
.queue-card.accent-violet:hover  { box-shadow: 0 16px 40px rgba(0,0,0,.35), 0 0 0 1px rgba(139,92,246,.3),  0 0 32px rgba(139,92,246,.2); }
.queue-card.accent-amber:hover   { box-shadow: 0 16px 40px rgba(0,0,0,.35), 0 0 0 1px rgba(251,191,36,.22), 0 0 32px rgba(251,191,36,.16); }

/* Queue card TransitionGroup animations - MEJORADO */
.queue-card-move        { transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
.queue-card-enter-active { transition: opacity .45s cubic-bezier(.4,0,.2,1) .08s, transform .5s cubic-bezier(.34,1.56,.64,1) .05s; }
.queue-card-leave-active {
  transition: opacity .35s cubic-bezier(.4,0,1,1), transform .4s cubic-bezier(.4,0,1,1);
  position: absolute;
}
.queue-card-enter-from { opacity: 0; transform: translateY(-28px) scale(.92); }
.queue-card-leave-to   { opacity: 0; transform: translateY(22px) scale(.94); }

/* ══ DOT NAVIGATION ═════════════════════════════════════════ */
.carousel-dots {
  display: flex; justify-content: center; gap: 6px; margin-top: 4px;
}
.cdot {
  width: 8px; height: 8px; border-radius: 9999px;
  border: 1.5px solid rgba(255,255,255,.4);
  background: transparent; cursor: pointer; padding: 0;
  transition: all .35s cubic-bezier(.175,.885,.32,1.275);
}
.cdot.active {
  background: #fff; border-color: #fff; width: 24px;
  box-shadow: 0 0 8px rgba(255,255,255,.4);
}

/* ══ SHARED ACCENT COLORS ═══════════════════════════════════ */
/* Overlay gradients */
.ho-accent-indigo  { background: linear-gradient(135deg, rgba(99,102,241,.62) 0%, rgba(15,23,42,.78) 55%, rgba(15,23,42,.4) 100%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,.2) 0%, transparent 55%); }
.ho-accent-emerald { background: linear-gradient(135deg, rgba(16,185,129,.52) 0%, rgba(15,23,42,.78) 55%, rgba(15,23,42,.4) 100%); }
.ho-accent-sky     { background: linear-gradient(135deg, rgba(56,189,248,.52) 0%, rgba(15,23,42,.78) 55%, rgba(15,23,42,.4) 100%); }
.ho-accent-violet  { background: linear-gradient(135deg, rgba(139,92,246,.55) 0%, rgba(15,23,42,.78) 55%, rgba(15,23,42,.4) 100%); }
.ho-accent-amber   { background: linear-gradient(135deg, rgba(251,191,36,.45) 0%, rgba(15,23,42,.78) 55%, rgba(15,23,42,.4) 100%); }

/* Icon wrap */
.hi-accent-indigo  { background: rgba(99,102,241,.15) !important; border-color: rgba(99,102,241,.25) !important; }
.hi-accent-emerald { background: rgba(16,185,129,.15) !important; border-color: rgba(16,185,129,.25) !important; }
.hi-accent-sky     { background: rgba(56,189,248,.15) !important; border-color: rgba(56,189,248,.25) !important; }
.hi-accent-violet  { background: rgba(139,92,246,.15) !important; border-color: rgba(139,92,246,.25) !important; }
.hi-accent-amber   { background: rgba(251,191,36,.15) !important; border-color: rgba(251,191,36,.25) !important; }

/* Tag */
.ht-accent-indigo  { background: rgba(99,102,241,.25); color: #c4b5fd; border-color: rgba(99,102,241,.2); }
.ht-accent-emerald { background: rgba(16,185,129,.2);  color: #6ee7b7; border-color: rgba(16,185,129,.2); }
.ht-accent-sky     { background: rgba(56,189,248,.2);  color: #7dd3fc; border-color: rgba(56,189,248,.2); }
.ht-accent-violet  { background: rgba(139,92,246,.22); color: #ddd6fe; border-color: rgba(139,92,246,.2); }
.ht-accent-amber   { background: rgba(251,191,36,.18); color: #fde68a; border-color: rgba(251,191,36,.2); }

/* ─── FOOTER BRANDING ──────────────────────────────────────── */
.dash-footer {
  display: flex; align-items: center; gap: 16px;
  margin-top: 36px; padding-top: 20px;
}
.footer-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
}
.footer-text {
  font-size: .7rem; color: rgba(255,255,255,.25); font-weight: 600;
  text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;
}

/* ─── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 1100px) {
  .hero-card { height: 210px; }
  .queue-card { height: 115px; }
  .section-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 780px) {
  .hero-card  { height: 190px; }
  .hero-content { padding: 24px 28px; }
  .hero-title { font-size: 1.35rem; }
  .hero-desc  { display: none; }
  .hero-right { display: none; }
  .queue-row  { gap: 10px; }
  .queue-card { height: 105px; }
  .qc-info    { display: none; }
}
@media (max-width: 640px) {
  .hero-card  { height: 170px; }
  .queue-card { height: 90px; }
  .qc-tag     { display: none; }
  .greeting-bar { flex-direction: column; align-items: flex-start; gap: 16px; }
  .greeting-right { width: 100%; }
  .stat-chip, .date-chip, .time-chip { padding: 8px 12px; }
}
</style>

