<template>
  <div class="dash-shell">
    <header v-if="!hideHeader" class="dash-header glass">
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
import { defineProps } from 'vue'

defineProps({
  hideHeader: { type: Boolean, default: false }
})
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

/* Media Queries para Responsive Design */

/* Tablets (hasta 768px) */
@media (max-width: 768px) {
  .dash-shell {
    padding: 12px;
  }

  .dash-header {
    padding: 10px 14px;
    flex-wrap: wrap;
  }

  .dash-title {
    font-size: 1.25rem;
  }

  .dash-header-right {
    width: 100%;
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }
}

/* Móviles grandes (hasta 640px) */
@media (max-width: 640px) {
  .dash-shell {
    padding: 10px;
  }

  .dash-header {
    padding: 8px 12px;
    border-radius: 12px;
  }

  .dash-title {
    font-size: 1.15rem;
  }

  .dash-content {
    margin-top: 12px;
  }
}

/* Móviles pequeños (hasta 480px) */
@media (max-width: 480px) {
  .dash-shell {
    padding: 8px;
  }

  .dash-header {
    padding: 8px 10px;
    border-radius: 10px;
    gap: 8px;
  }

  .dash-header-left {
    gap: 8px;
  }

  .dash-title {
    font-size: 1.05rem;
  }

  .dash-content {
    margin-top: 10px;
  }
}

/* Móviles muy pequeños (hasta 375px) */
@media (max-width: 375px) {
  .dash-shell {
    padding: 6px;
  }

  .dash-header {
    padding: 6px 8px;
  }

  .dash-title {
    font-size: 1rem;
  }
}
</style>
