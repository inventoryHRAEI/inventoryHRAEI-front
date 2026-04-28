import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Composable para manejo optimizado de navegación en SPA
 * Evita problemas de componentes no renderizados al cambiar de ruta
 */
export function useRouteNavigation() {
  const router = useRouter()
  const route = useRoute()
  
  const routeKey = ref(0)
  const isNavigating = ref(false)
  const previousRoute = ref(null)
  
  // Key que cambia con cada navegación para forzar re-render
  const componentKey = computed(() => `${route.fullPath}-${routeKey.value}`)
  
  // Detectar cambios de ruta
  const handleRouteChange = (newRoute, oldRoute) => {
    if (newRoute.name !== oldRoute?.name) {
      // Forzar recreación del componente
      routeKey.value++
      previousRoute.value = oldRoute
      
      // Dispatch events para notificar a la app
      window.dispatchEvent(new CustomEvent('route:changed-navigation', {
        detail: {
          from: oldRoute?.name,
          to: newRoute.name,
          fromPath: oldRoute?.fullPath,
          toPath: newRoute.fullPath
        }
      }))
    }
  }
  
  // Iniciar navegación a una ruta
  const navigateTo = async (routeConfig) => {
    try {
      isNavigating.value = true
      await router.push(routeConfig)
    } finally {
      isNavigating.value = false
    }
  }
  
  // Volver atrás
  const goBack = () => {
    router.back()
  }
  
  // Setup listeners
  onMounted(() => {
    // Escuchar cambios de ruta
    const unwatch = router.afterEach(handleRouteChange)
    
    // Cleanup
    onBeforeUnmount(() => {
      if (typeof unwatch === 'function') unwatch()
    })
  })
  
  return {
    route,
    router,
    routeKey,
    componentKey,
    isNavigating,
    previousRoute,
    navigateTo,
    goBack,
    handleRouteChange
  }
}
