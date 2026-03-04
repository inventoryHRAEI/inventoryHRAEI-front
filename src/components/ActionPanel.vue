<template>
  <section :class="panelRootClass">
    <div class="panel-surface">
      <header v-if="title || $slots.title" class="panel-header">
        <h2 class="panel-title"><slot name="title">{{ title }}</slot></h2>
      </header>
      <div class="panel-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({ title: { type: String, default: '' } })

const route = useRoute()
const dashboardRoutes = ['dashboard', 'admin-dashboard', 'user-dashboard', 'admin-users', 'op-entrada','op-salida','op-resguardo','op-servicio','op-inventario-biomedica','op-insumos-consumibles', 'order-management', 'order-management-salida', 'order-management-resguardo', 'order-management-servicio', 'create-order']

const isDashboard = computed(() => {
  try {
    const name = route && route.name ? String(route.name) : ''
    return dashboardRoutes.includes(name)
  } catch (e) {
    return false
  }
})

const panelRootClass = computed(() => ({
  'action-panel': true,
  'action-panel--dashboard': isDashboard.value,
  'action-panel--plain': !isDashboard.value
}))
</script>

<style scoped>

.action-panel {
  position: relative;
  display: block;
  padding: 0;
  border-radius: 14px;
}


.panel-surface {
   position: relative;
   z-index: 1;
   border-radius: inherit;
   padding: clamp(18px, 4vw, 26px);
   background: rgba(13, 20, 35, 0.65);
   border: 1px solid rgba(255, 255, 255, 0.1);
   box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
   backdrop-filter: blur(8px) saturate(120%);
   color: #e6ebf5;
   overflow: visible;
}

.panel-header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.panel-label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
}

.panel-title {
  margin: 0;
  font-size: clamp(1.35rem, 1.8vw, 1.8rem);
  font-family: 'Poppins', 'Source Sans 3', sans-serif;
  color: inherit;
}

.panel-body {
  position: relative;
  z-index: 2;
  width: 100%;
}

.action-panel--plain .panel-surface {
  background: rgba(255, 255, 255, 0.12);
  color: #102140;
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 38px rgba(2, 6, 23, 0.25);
}

.action-panel--plain .panel-title {
  color: inherit;
}

@media (max-width: 640px) {
  .action-panel {
    border-radius: 12px;
  }

  .panel-surface {
    padding: 16px;
    border-radius: inherit;
  }
}
</style>
