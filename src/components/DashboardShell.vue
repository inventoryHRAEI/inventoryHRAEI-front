<template>
  <div class="dash-shell">
    <header class="dash-header glass">
      <div class="dash-header-left">
        <slot name="icon"></slot>
        <h2 class="dash-title">
          <slot name="title">Inicio</slot>
        </h2>
      </div>
      <div class="dash-header-right">
        <slot name="actions"></slot>
      </div>
    </header>

    <section class="dash-content">
      <slot />
    </section>
  </div>
</template>

<script setup>
// Componente contenedor para dashboards, sin lógica, solo layout y estilos
</script>

<style scoped>
.dash-shell{ padding:16px; }
.dash-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; border-radius:14px; padding:12px 16px; }
.dash-header-left{ display:flex; align-items:center; gap:10px }
.dash-title{ margin:0; font-size:1.4rem }
.dash-content{ margin-top:16px }

/* Glass panel base */
.glass{
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 12px 30px rgba(2,6,23,.28);
  backdrop-filter: blur(8px) saturate(140%);
}
</style>
