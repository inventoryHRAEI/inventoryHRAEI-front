import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

export function useBiomedicalCardRendering() {
  const selectedItem = ref(null)
  const currentPage = ref(1)
  // Mostrar más items por página por defecto (evita ver solo 6 registros en vistas de lista)
  const pageSize = ref(24)
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

  // Detect if mobile device (width < 480px OR height < 600px)
  const isMobileDevice = computed(() => {
    return windowWidth.value < 480 || windowHeight.value < 600
  })

  // Responsive pageSize: compact on mobile, larger on desktop
  const responsivePageSize = computed(() => {
    return isMobileDevice.value ? 6 : 24
  })

  // Update pageSize when screen size changes
  watch(responsivePageSize, (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1 // Reset to first page
  })

  // Listen for window resize
  const handleResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
      window.addEventListener('resize', handleResize)
      
      // ✅ CRITICAL: Escuchar eventos de actualización de semaforización
      // Cuando cambia el estado, forzar re-render de la UI
      const handleSemaforoUpdate = () => {
        console.log('[useBiomedicalCardRendering] Received semaforization update, forcing UI refresh');
        // Forzar actualización reactiva
        windowWidth.value = window.innerWidth
        renderedCount.value = 0
        resetBatchRender()
      };
      
      window.addEventListener('ui:refresh-semaforizacion', handleSemaforoUpdate);
      window.addEventListener('equipment:status-updated', handleSemaforoUpdate);
      
      // Guardar referencias para limpiar después
      if (!window.__semaforoListeners) window.__semaforoListeners = [];
      window.__semaforoListeners.push({ listener: handleSemaforoUpdate, type: 'useBiomedicalCardRendering' });
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
      
      // ✅ Limpiar listeners de actualización
      if (window.__semaforoListeners) {
        const handleSemaforoUpdate = window.__semaforoListeners.find(l => l.type === 'useBiomedicalCardRendering');
        if (handleSemaforoUpdate) {
          window.removeEventListener('ui:refresh-semaforizacion', handleSemaforoUpdate.listener);
          window.removeEventListener('equipment:status-updated', handleSemaforoUpdate.listener);
          window.__semaforoListeners = window.__semaforoListeners.filter(l => l !== handleSemaforoUpdate);
        }
      }
    }
  })
  
  // Tunnel performance optimizations
  const isTunnel = typeof window !== 'undefined' && /\.trycloudflare\.com|\.ngrok-free\.dev|\.loca\.lt/.test(window.location.hostname)
  const renderedCount = ref(0)
  const batchSize = ref(isTunnel ? 6 : 12) // Smaller batches in tunnel
  const isRendering = ref(false)

  function getItemKey(item, idx) {
    if (!item || typeof item !== 'object') return `idx:${idx}`
    const inv = item['No DE INVENTARIO']
    const no = item['No']
    const id = item._id
    const key = (inv && String(inv).trim()) || (no && String(no).trim()) || (id && String(id).trim())
    return key ? `k:${key}` : `idx:${idx}`
  }

  function isExpanded(item, idx) {
    if (!selectedItem.value) return false
    return getItemKey(selectedItem.value, -1) === getItemKey(item, idx)
  }

  function toggleSelect(item) {
    if (!item) { selectedItem.value = null; return }
    if (selectedItem.value && getItemKey(selectedItem.value, -1) === getItemKey(item, -1)) {
      selectedItem.value = null
    } else {
      selectedItem.value = item
    }
  }

  function getStatusAccentClass(item) {
    if (!item) return 'accent-default'
    
    const statusRaw = item['ESTATUS']
    const status = statusRaw ? String(statusRaw).toLowerCase().trim() : ''
    const funcional = item['FUNCIONAL SI NO'] ? String(item['FUNCIONAL SI NO']).toLowerCase().trim() : ''
    
    // ✅ PRIORIDAD 1: Estados post-mantenimiento (máxima prioridad)
    // Estos vienen de equipment_monthly_status después de finalizar mantenimiento
    if (status === 'fuera de servicio') return 'accent-critical'                   // Rojo exacto
    if (status.includes('fuera') && status.includes('servicio')) return 'accent-critical'  // Variante
    
    if (status === 'parcialmente operativo') return 'accent-partial'               // Naranja
    if (status.includes('parcialmente') && status.includes('operativo')) return 'accent-partial'  // Variante
    
    if (status === 'operativo' && (funcional === 'si' || !funcional)) return 'accent-success'  // Verde exacto
    if (status.includes('operativo') && !status.includes('no') && funcional === 'si') return 'accent-success'  // Verde variante
    
    // ✅ PRIORIDAD 2: Fallback a lógica anterior (para compatibilidad)
    if (funcional === 'no') return 'accent-critical'                              // Rojo
    if (status.includes('mantenimiento')) return 'accent-warning'                // Naranja durante MT
    if (status === 'inactivo' || status.includes('no operativo')) return 'accent-warning'  // Naranja
    if ((status === 'activo' || status.includes('operativo')) && funcional === 'si') return 'accent-success'  // Verde
    
    return 'accent-default'
  }

  function getStatusGlowClass(item) {
    if (!item) return 'glow-default'
    
    const statusRaw = item['ESTATUS']
    const status = statusRaw ? String(statusRaw).toLowerCase().trim() : ''
    const funcional = item['FUNCIONAL SI NO'] ? String(item['FUNCIONAL SI NO']).toLowerCase().trim() : ''
    
    // ✅ PRIORIDAD 1: Estados post-mantenimiento (máxima prioridad)
    if (status === 'fuera de servicio') return 'glow-critical'                    // Rojo exacto
    if (status.includes('fuera') && status.includes('servicio')) return 'glow-critical'  // Variante
    
    if (status === 'parcialmente operativo') return 'glow-partial'                // Naranja
    if (status.includes('parcialmente') && status.includes('operativo')) return 'glow-partial'  // Variante
    
    if (status === 'operativo' && (funcional === 'si' || !funcional)) return 'glow-success'  // Verde exacto
    if (status.includes('operativo') && !status.includes('no') && funcional === 'si') return 'glow-success'  // Verde variante
    
    // ✅ PRIORIDAD 2: Fallback a lógica anterior
    if (funcional === 'no') return 'glow-critical'                               // Rojo
    if (status.includes('mantenimiento')) return 'glow-warning'                  // Naranja
    if (status === 'inactivo' || status.includes('no operativo')) return 'glow-warning'  // Naranja
    if ((status === 'activo' || status.includes('operativo')) && funcional === 'si') return 'glow-success'  // Verde
    return 'glow-default'
  }

  function getStatusPillClass(item) {
    if (!item) return 'status-unknown'
    
    const statusRaw = item?.['ESTATUS']
    const status = statusRaw ? String(statusRaw).toLowerCase().trim() : ''
    const funcional = item['FUNCIONAL SI NO'] ? String(item['FUNCIONAL SI NO']).toLowerCase().trim() : ''
    const hasRealValue = statusRaw && String(statusRaw).trim() && !['n/a', 'sin clave', 'sin datos', 'no disponible', 'na'].includes(String(statusRaw).toLowerCase())
    if (!hasRealValue) return 'status-unknown'
    
    // ✅ PRIORIDAD 1: Estados post-mantenimiento (máxima prioridad)
    if (status === 'fuera de servicio') return 'status-critical'                   // Rojo exacto
    if (status.includes('fuera') && status.includes('servicio')) return 'status-critical'  // Variante
    
    if (status === 'parcialmente operativo') return 'status-partial'               // Naranja
    if (status.includes('parcialmente') && status.includes('operativo')) return 'status-partial'  // Variante
    
    if (status.includes('propio')) return 'status-success'                        // Verde
    if (status === 'operativo' && (funcional === 'si' || !funcional)) return 'status-success'  // Verde exacto
    if (status.includes('operativo') && !status.includes('no') && funcional === 'si') return 'status-success'  // Verde variante
    
    // ✅ PRIORIDAD 2: Fallback a lógica anterior
    if (funcional === 'no') return 'status-critical'                              // Rojo
    if (status.includes('mantenimiento')) return 'status-warning'                // Naranja
    if (status === 'inactivo' || status.includes('no operativo')) return 'status-warning'  // Naranja
    return 'status-default'
  }

  function getStatusTextClass(item) {
    const raw = item?.['ESTATUS']
    const hasRealValue = raw && String(raw).trim() && !['n/a', 'sin clave', 'sin datos', 'no disponible', 'na'].includes(String(raw).toLowerCase())
    if (!hasRealValue) return 'sin-estado'
    return String(raw).toLowerCase()
  }

  function isSparse(item) {
    if (!item || typeof item !== 'object') return false
    return !item.__hasRealData
  }

  function isInMaintenance(item) {
    if (!item) return false
    const inv = item['No DE INVENTARIO']
    return inv ? maintenanceMap?.value?.[String(inv).trim()]?.status === 'in_progress' : false
  }

  function isFieldVisible(item, field) {
    if (!item) return false
    const val = item[field]
    const hasReal = val && String(val).trim() && !['n/a', 'sin clave', 'sin datos', 'no disponible', 'na'].includes(String(val).toLowerCase())
    return !!hasReal
  }

  // Batch rendering for tunnel: Schedule incremental renders
  function scheduleBatchRender(totalCards) {
    if (!isTunnel || isRendering.value) return
    isRendering.value = true
    renderedCount.value = 0
    
    if (typeof window !== 'undefined' && window.console) {
      console.log(`[perf] Batch render starting: ${totalCards} items, batch size: ${batchSize.value}`)
    }

    function renderNextBatch() {
      const prevCount = renderedCount.value
      renderedCount.value = Math.min(renderedCount.value + batchSize.value, totalCards)
      
      if (typeof window !== 'undefined' && window.console && renderedCount.value !== prevCount) {
        console.log(`[perf] Rendered ${renderedCount.value}/${totalCards} items`)
      }
      
      if (renderedCount.value < totalCards) {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => {
            nextTick(() => renderNextBatch())
          }, { timeout: 50 })
        } else {
          // Fallback: use requestAnimationFrame (every ~16ms)
          requestAnimationFrame(() => {
            setTimeout(() => renderNextBatch(), 0)
          })
        }
      } else {
        isRendering.value = false
        if (typeof window !== 'undefined' && window.console) {
          console.log(`[perf] Batch render complete`)
        }
      }
    }

    // Start first batch immediately
    renderNextBatch()
  }

  // Reset rendered count when page or filters change
  function resetBatchRender() {
    renderedCount.value = 0
    isRendering.value = false
  }

  return {
    selectedItem,
    currentPage,
    pageSize,
    renderedCount,
    batchSize,
    isRendering,
    isTunnel,
    getItemKey,
    isExpanded,
    toggleSelect,
    getStatusAccentClass,
    getStatusGlowClass,
    getStatusPillClass,
    getStatusTextClass,
    isSparse,
    isInMaintenance,
    isFieldVisible,
    scheduleBatchRender,
    resetBatchRender
  }
}
