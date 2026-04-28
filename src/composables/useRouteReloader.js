import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * CRITICAL COMPOSABLE: Asegura que CUALQUIER componente se recree
 * en CUALQUIER cambio de ruta sin excepciones.
 * 
 * Uso: const { componentKey } = useRouteReloader()
 *      <div :key="componentKey">Component content</div>
 */
export function useRouteReloader() {
  const router = useRouter()
  const route = useRoute()
  
  const componentKey = ref(0)
  const renderCount = ref(0)
  
  // CRITICAL: Watch fullPath to detect ANY route change
  const unwatch = watch(
    () => route.fullPath,
    (newPath, oldPath) => {
      if (newPath !== oldPath) {
        componentKey.value++
        renderCount.value++
        
        console.log(`[useRouteReloader] 🔄 Route changed: ${oldPath} → ${newPath}`)
        console.log(`[useRouteReloader] 🔑 Key incremented to: ${componentKey.value}`)
        console.log(`[useRouteReloader] 📊 Render count: ${renderCount.value}`)
        
        // Dispatch event so other components know route changed
        window.dispatchEvent(new CustomEvent('route-reloader:changed', {
          detail: {
            from: oldPath,
            to: newPath,
            componentKey: componentKey.value,
            renderCount: renderCount.value
          }
        }))
      }
    },
    { 
      immediate: false, 
      flush: 'pre'  // CRITICAL: Run before component render
    }
  )
  
  // Verify component is in DOM
  const verifyRender = () => {
    requestAnimationFrame(() => {
      const container = document.querySelector('[data-route-component]')
      if (container && container.innerHTML.length > 0) {
        console.log('[useRouteReloader] ✅ Component verified in DOM')
      } else {
        console.error('[useRouteReloader] ❌ Component NOT in DOM - possible render issue')
      }
    })
  }
  
  // Manual refetch (if needed)
  const forceRerender = () => {
    componentKey.value++
    renderCount.value++
    console.log('[useRouteReloader] 🔨 Force rerender - Key:', componentKey.value)
  }
  
  onMounted(() => {
    verifyRender()
  })
  
  return {
    componentKey,
    renderCount,
    forceRerender,
    verifyRender,
    unwatch
  }
}
