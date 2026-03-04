import { ref, computed } from 'vue'

/**
 * Composable para gestionar caché de datos de componentes
 * Evita recargas innecesarias y optimiza rendimiento
 */
export function useComponentCache(componentId = 'default') {
  const cache = ref(new Map())
  const cacheTimestamps = ref(new Map())
  const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutos por defecto
  
  // Verificar si cache es válido
  const isCacheValid = (key) => {
    if (!cache.value.has(key)) return false
    
    const timestamp = cacheTimestamps.value.get(key)
    if (!timestamp) return false
    
    const age = Date.now() - timestamp
    return age < CACHE_DURATION_MS
  }
  
  // Obtener valor del cache
  const getCached = (key) => {
    if (isCacheValid(key)) {
      return cache.value.get(key)
    }
    return null
  }
  
  // Guardar en cache
  const setCached = (key, value, ttl = CACHE_DURATION_MS) => {
    cache.value.set(key, value)
    cacheTimestamps.value.set(key, Date.now())
    
    // Limpiar cache expirado después de TTL
    if (ttl > 0) {
      setTimeout(() => {
        invalidateCache(key)
      }, ttl)
    }
  }
  
  // Invalidar cache específico
  const invalidateCache = (key) => {
    cache.value.delete(key)
    cacheTimestamps.value.delete(key)
  }
  
  // Limpiar todo el cache
  const clearAllCache = () => {
    cache.value.clear()
    cacheTimestamps.value.clear()
  }
  
  // Estado del cache
  const cacheSize = computed(() => cache.value.size)
  
  return {
    getCached,
    setCached,
    invalidateCache,
    clearAllCache,
    isCacheValid,
    cacheSize,
    CACHE_DURATION_MS
  }
}

// Cache global compartido entre componentes
const globalCache = new Map()
const globalCacheTimestamps = new Map()

export function useGlobalComponentCache() {
  const CACHE_DURATION_MS = 5 * 60 * 1000
  
  const isCacheValid = (key) => {
    if (!globalCache.has(key)) return false
    const timestamp = globalCacheTimestamps.get(key)
    if (!timestamp) return false
    const age = Date.now() - timestamp
    return age < CACHE_DURATION_MS
  }
  
  const getCached = (key) => {
    if (isCacheValid(key)) {
      return globalCache.get(key)
    }
    return null
  }
  
  const setCached = (key, value, ttl = CACHE_DURATION_MS) => {
    globalCache.set(key, value)
    globalCacheTimestamps.set(key, Date.now())
    
    if (ttl > 0) {
      setTimeout(() => {
        invalidateCache(key)
      }, ttl)
    }
  }
  
  const invalidateCache = (key) => {
    globalCache.delete(key)
    globalCacheTimestamps.delete(key)
  }
  
  const invalidateByPattern = (pattern) => {
    const regex = new RegExp(pattern)
    for (const key of globalCache.keys()) {
      if (regex.test(key)) {
        globalCache.delete(key)
        globalCacheTimestamps.delete(key)
      }
    }
  }
  
  const clearAllCache = () => {
    globalCache.clear()
    globalCacheTimestamps.clear()
  }
  
  const cacheSize = computed(() => globalCache.size)
  
  return {
    getCached,
    setCached,
    invalidateCache,
    invalidateByPattern,
    clearAllCache,
    isCacheValid,
    cacheSize,
    CACHE_DURATION_MS
  }
}
