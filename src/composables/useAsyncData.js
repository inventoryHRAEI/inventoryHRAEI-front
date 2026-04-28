import { ref, computed, watch } from 'vue'
import { useGlobalComponentCache } from './useComponentCache'

/**
 * Composable para cargar datos asíncronos con caché inteligente
 * Muestra skeleton loaders mientras carga
 */
export function useAsyncData(asyncFunction, dependencies = [], options = {}) {
  const {
    cacheKey = null,
    cacheDuration = 5 * 60 * 1000, // 5 minutos
    showSkeleton = true,
    onSuccess = null,
    onError = null,
    immediate = true,
    retries = 1
  } = options
  
  const cache = useGlobalComponentCache()
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const retryCount = ref(0)
  
  const isLoading = computed(() => loading.value && showSkeleton)
  const hasError = computed(() => !!error.value)
  const isEmpty = computed(() => !data.value || (Array.isArray(data.value) && data.value.length === 0))
  
  const loadData = async (forceRefresh = false) => {
    try {
      // Verificar cache si existe
      if (cacheKey && !forceRefresh) {
        const cached = cache.getCached(cacheKey)
        if (cached) {
          data.value = cached
          loading.value = false
          error.value = null
          return cached
        }
      }
      
      loading.value = true
      error.value = null
      retryCount.value = 0
      
      const result = await asyncFunction()
      
      // Guardar en cache
      if (cacheKey) {
        cache.setCached(cacheKey, result, cacheDuration)
      }
      
      data.value = result
      error.value = null
      loading.value = false
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      error.value = err
      
      // Reintentar si es necesario
      if (retryCount.value < retries) {
        retryCount.value++
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.value))
        return loadData(forceRefresh)
      }
      
      loading.value = false
      
      if (onError) {
        onError(err)
      }
      
      console.error('[useAsyncData] Error loading data:', err)
    }
  }
  
  const refetch = () => loadData(true)
  
  const invalidateCache = () => {
    if (cacheKey) {
      cache.invalidateCache(cacheKey)
    }
    data.value = null
  }
  
  // Cargar datos si immediate es true
  if (immediate) {
    loadData()
  }
  
  // Recargar cuando dependencies cambien
  if (dependencies && dependencies.length > 0) {
    watch(dependencies, () => {
      loadData(true) // Forzar refetch cuando dependencias cambian
    }, { deep: true })
  }
  
  return {
    data,
    loading,
    error,
    isLoading,
    hasError,
    isEmpty,
    loadData,
    refetch,
    invalidateCache,
    retryCount
  }
}
