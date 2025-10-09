<template>
  <div class="home-wrap">
    <div class="hero glass">
      <div class="hero-left">
        <h2>Bienvenido al Inventario</h2>
        <p class="small-msg">Gestiona equipos médicos, comodatos, donaciones y más — Subdirección de Ingeniería Biomédica.</p>
        <div class="cta-row">
          <div class="cta-block">
            <div class="q">¿Ya tienes una cuenta?</div>
          <router-link to="/login"><button class="btn secondary">Inicia sesión</button></router-link>
          </div>
          <div class="cta-block">
            <div class="q">¿Para crear cuenta?</div>
          <router-link to="/register"><button class="btn primary" style="margin-left:12px">¡Únete aquí!</button></router-link>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="carousel">
          <div class="slide" v-for="(s, i) in slides" :key="i" :class="{ active: i === idx }">
            <img :src="s.img" :alt="s.title" loading="lazy" />
            <div class="caption">
              <div class="title">{{ s.title }}</div>
              <div class="desc">{{ s.desc }}</div>
              <div class="sub">Puedes gestionar todo desde un solo lugar.</div>
            </div>
          </div>
          <div class="dots">
            <button v-for="(s, i) in slides" :key="i" :class="['dot', i===idx?'on':'']" @click="idx=i" aria-label="Ir a slide"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const slides = ref([
  { img: '/carrusel/inventario_hospitaal.jpg', title: 'Gestión de Equipos', desc: 'Altas, ubicación, historial y trazabilidad.' },
  { img: '/carrusel/reparacion_equipo.jpg', title: 'Reparaciones y Mantenimiento', desc: 'Servicios, órdenes y seguimiento técnico.' },
  { img: '/carrusel/insumos_consumibles.jpg', title: 'Comodatos (Proveedor)', desc: 'Equipos en préstamo/comodato de proveedores.' },
  { img: '/carrusel/donaciones.jpeg', title: 'Donaciones', desc: 'Registro, validación y control de altas.' }
])
const idx = ref(0)
let timer
onMounted(() => { timer = setInterval(() => { idx.value = (idx.value + 1) % slides.value.length }, 4500) })
onBeforeUnmount(() => { try{ clearInterval(timer) }catch{} })
</script>

<style scoped>
.home-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh; padding:20px }
.hero{ display:grid; grid-template-columns: 1.1fr 1fr; gap:18px; width:100%; max-width:1000px; overflow:hidden }
.hero-left{ display:flex; flex-direction:column; justify-content:center }
.small-msg{ color: var(--muted); margin: 6px 0 16px 0 }
.cta-row{ display:flex; gap:12px }
.hero-right{ position:relative }
.carousel{ position:relative; overflow:hidden; border-radius:12px; border:1px solid var(--card-border); background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03)); height:260px; min-height:220px; max-height:320px }
.slide{ position:absolute; inset:0; opacity:0; transition: opacity .7s cubic-bezier(.2,.9,.2,1); display:grid; place-items:center }
.slide.active{ opacity:1 }
.slide img{ width:100%; height:100%; object-fit:cover; filter: saturate(1.05) contrast(1.02) }
.caption{ position:absolute; left:12px; right:12px; bottom:12px; background: rgba(0,0,0,.50); color:#fff; padding:10px 12px; border-radius:10px; font-size:.95rem; backdrop-filter: blur(3px) }
.caption .title{ font-weight:800; margin-bottom:2px }
.caption .sub{ font-size:.86rem; opacity:.9; margin-top:2px }
.dots{ position:absolute; right:8px; bottom:8px; display:flex; gap:6px }
.dot{ width:10px; height:10px; border-radius:50%; border:1px solid rgba(255,255,255,.8); background:transparent; cursor:pointer; transition: transform .28s cubic-bezier(.2,.9,.2,1), background .18s ease }
.dot.on{ background:#fff; transform: scale(1.25) }

@media (max-width: 820px){
  .hero{ grid-template-columns: 1fr }
}

</style>
