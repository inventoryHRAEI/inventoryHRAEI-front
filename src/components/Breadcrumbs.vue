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
import { 
  ChevronRightIcon, 
  HomeIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
  LockOpenIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  items: {
    type: Array,
    default: null
  }
})

const route = useRoute()

const breadcrumbsComputed = computed(() => {
  if (props.items) return props.items
  
  const name = route.name ? String(route.name) : ''
  const currentPath = route.path
  
  const routeBreadcrumbs = {
    'home': [
      { label: 'Inicio', to: '/', icon: HomeIcon }
    ],
    'dashboard': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon }
    ],
    'login': [
      { label: 'Inicio', to: '/', icon: HomeIcon },
      { label: 'Iniciar Sesión', to: '/login', icon: LockOpenIcon }
    ],
    'register': [
      { label: 'Inicio', to: '/', icon: HomeIcon },
      { label: 'Registro', to: '/register', icon: UserIcon }
    ],
    'op-entrada': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Gestión de Órdenes de Entrada', to: '/order-management', icon: DocumentCheckIcon },
      { label: 'Creación de Órdenes de Entrada', to: currentPath, icon: PlusIcon }
    ],
    'op-salida': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Órdenes de Salida', to: currentPath, icon: DocumentCheckIcon }
    ],
    'op-resguardo': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Resguardo', to: currentPath, icon: DocumentCheckIcon }
    ],
    'op-servicio': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Servicio', to: currentPath, icon: DocumentCheckIcon }
    ],
    'op-inventario-biomedica': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Inventario Biomédica', to: currentPath, icon: DocumentCheckIcon }
    ],
    'op-insumos-consumibles': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Insumos y Consumibles', to: currentPath, icon: DocumentCheckIcon }
    ],
    'admin-users': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Gestión de Usuarios', to: '/admin-users', icon: UsersIcon }
    ],
    'admin-user-detail': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Gestión de Usuarios', to: '/admin-users', icon: UsersIcon },
      { label: 'Detalle de Usuario', to: currentPath, icon: UserIcon }
    ],
    'forgot': [
      { label: 'Inicio', to: '/', icon: HomeIcon },
      { label: 'Recuperar Contraseña', to: '/forgot', icon: KeyIcon }
    ],
    'reset': [
      { label: 'Inicio', to: '/', icon: HomeIcon },
      { label: 'Restablecer Contraseña', to: '/reset', icon: KeyIcon }
    ],
    'order-management': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Gestión de Órdenes de Entrada', to: '/order-management', icon: DocumentCheckIcon }
    ],
    'create-order': [
      { label: 'Inicio', to: '/dashboard', icon: HomeIcon },
      { label: 'Dashboard', to: '/dashboard', icon: CheckCircleIcon },
      { label: 'Gestión de Órdenes de Entrada', to: '/order-management', icon: DocumentCheckIcon },
      { label: 'Crear Orden de Entrada', to: currentPath, icon: PlusIcon }
    ]
  }
  
  if (routeBreadcrumbs[name]) {
    return routeBreadcrumbs[name]
  }
  
  // Fallback para rutas no definidas
  return [{ label: 'Inicio', to: '/dashboard', icon: HomeIcon }]
})

const items = breadcrumbsComputed
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-item a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 500;
}

.breadcrumb-item a:hover {
  color: var(--accent, #3b82f6);
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.breadcrumb-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.85;
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.25);
  margin: 0 2px;
}

.breadcrumb-separator svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.breadcrumb-current {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.breadcrumb-current .breadcrumb-icon {
  opacity: 1;
}

@media (max-width: 768px) {
  .breadcrumbs {
    font-size: 0.85rem;
    gap: 2px;
  }
  
  .breadcrumb-item a,
  .breadcrumb-current {
    padding: 5px 8px;
  }
  
  .breadcrumb-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 560px) {
  .breadcrumbs {
    font-size: 0.8rem;
    gap: 0px;
  }
  
  .breadcrumb-item a,
  .breadcrumb-current {
    padding: 4px 6px;
  }
  
  .breadcrumb-separator {
    margin: 0 1px;
  }
  
  .breadcrumb-separator svg {
    width: 14px;
    height: 14px;
  }
  
  .breadcrumb-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
