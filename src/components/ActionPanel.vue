<template>
  <section class="action-panel glass">
    <header v-if="title || $slots.title" class="panel-header">
      <h2 class="panel-title"><slot name="title">{{ title }}</slot></h2>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({ title: { type: String, default: '' } })
</script>

<style scoped>
.action-panel{ border-radius:16px; padding:16px; }
.panel-header{ margin-bottom:8px }
.panel-title{ margin:0; font-size:1.4rem }
.panel-body{ width:100% }

/* Glass look */
.glass{ background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); box-shadow: 0 12px 30px rgba(2,6,23,.24); backdrop-filter: blur(8px) saturate(140%) }

/* Media Queries para Responsive Design */

/* Tablets (hasta 768px) */
@media (max-width: 768px) {
  .action-panel {
    border-radius: 14px;
    padding: 14px;
  }

  .panel-title {
    font-size: 1.3rem;
  }

  .panel-header {
    margin-bottom: 7px;
  }
}

/* Móviles grandes (hasta 640px) */
@media (max-width: 640px) {
  .action-panel {
    border-radius: 12px;
    padding: 12px;
  }

  .panel-title {
    font-size: 1.2rem;
  }

  .panel-header {
    margin-bottom: 6px;
  }
}

/* Móviles pequeños (hasta 480px) */
@media (max-width: 480px) {
  .action-panel {
    border-radius: 10px;
    padding: 10px;
  }

  .panel-title {
    font-size: 1.1rem;
  }
}

/* Móviles muy pequeños (hasta 375px) */
@media (max-width: 375px) {
  .action-panel {
    border-radius: 8px;
    padding: 8px;
  }

  .panel-title {
    font-size: 1rem;
  }

  .panel-header {
    margin-bottom: 5px;
  }
}
</style>
