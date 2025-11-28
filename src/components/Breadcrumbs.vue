<template>
  <nav v-if="items.length > 1" class="breadcrumbs" aria-label="Navegación">
    <template v-for="(item, index) in items" :key="index">
      <div class="breadcrumb-item">
        <router-link v-if="index < items.length - 1" :to="item.to">
          <component v-if="item.icon" :is="item.icon" class="breadcrumb-icon" />
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-current">
          <component v-if="item.icon" :is="item.icon" class="breadcrumb-icon" />
          {{ item.label }}
        </span>
      </div>
      <span v-if="index < items.length - 1" class="breadcrumb-separator">
        <ChevronRightIcon />
      </span>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRightIcon, HomeIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  items: {
    type: Array,
    default: null
  }
})

const route = useRoute()

const routeLabels = {
  'home': 'Inicio',
  'dashboard': 'Dashboard',
  'login': 'Iniciar Sesión',
  'register': 'Registro',
  'op-entrada': 'Órdenes de Entrada',
  'op-salida': 'Órdenes de Salida',
  'op-resguardo': 'Resguardo',
  'op-servicio': 'Servicio',
  'op-inventario-biomedica': 'Inventario Biomédica',
  'op-insumos-consumibles': 'Insumos y Consumibles',
  'admin-users': 'Gestión de Usuarios',
  'admin-user-detail': 'Detalle de Usuario',
  'forgot': 'Recuperar Contraseña',
  'reset': 'Restablecer Contraseña'
}

const breadcrumbsComputed = computed(() => {
  if (props.items) return props.items
  
  const breadcrumbs = []
  const name = route.name ? String(route.name) : ''
  
  if (name === 'home') {
    return [{ label: 'Inicio', to: '/', icon: HomeIcon }]
  }
  
  breadcrumbs.push({ label: 'Inicio', to: '/dashboard', icon: HomeIcon })
  
  if (name.startsWith('op-')) {
    breadcrumbs.push({ label: 'Dashboard', to: '/dashboard' })
  }
  
  if (name.startsWith('admin-')) {
    breadcrumbs.push({ label: 'Dashboard', to: '/dashboard' })
  }
  
  if (routeLabels[name]) {
    breadcrumbs.push({ label: routeLabels[name], to: route.path })
  }
  
  return breadcrumbs
})

const items = breadcrumbsComputed
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.15s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.breadcrumb-item a:hover {
  color: var(--accent);
  background: rgba(255, 255, 255, 0.06);
}

.breadcrumb-icon {
  width: 16px;
  height: 16px;
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.3);
}

.breadcrumb-separator svg {
  width: 14px;
  height: 14px;
}

.breadcrumb-current {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-weight: 600;
  padding: 4px 8px;
}

@media (max-width: 560px) {
  .breadcrumbs {
    font-size: 0.8rem;
  }
  
  .breadcrumb-item a,
  .breadcrumb-current {
    padding: 4px 6px;
  }
}
</style>
