/**
 * useEquipmentStatus.js - Composable ULTRALIGERO para semaforización
 * Sin basura. Cache inteligente. Batch automático.
 */

import { ref, computed } from 'vue';

const statusCache = ref(new Map());
const loading = ref(false);
let cacheTime = Date.now();
const CACHE_TTL = 60000; // 1 minuto

/**
 * Hook principal: obtiene status de equipos
 */
export function useEquipmentStatus() {
  /**
   * Carga batch de status para múltiples equipos
   */
  async function loadStatuses(inventoryNumbers) {
    if (!Array.isArray(inventoryNumbers) || !inventoryNumbers.length) return;

    // Filtrar solo los que no están en caché o están expirados
    const now = Date.now();
    const needsFetch = inventoryNumbers.filter(invNo => {
      const cached = statusCache.value.get(invNo);
      return !cached || (now - cacheTime) > CACHE_TTL;
    });

    if (!needsFetch.length) return; // Todo en caché

    loading.value = true;

    try {
      const response = await fetch('/api/equipment-status/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryNumbers: needsFetch })
      });

      if (!response.ok) throw new Error('Error cargando status');

      const { data } = await response.json();

      // Actualizar caché
      Object.entries(data).forEach(([invNo, status]) => {
        statusCache.value.set(invNo, status);
      });

      cacheTime = now;
    } catch (error) {
      console.warn('[useEquipmentStatus] Error:', error?.message);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene status de un equipo (síncrono desde caché)
   */
  function getStatus(inventoryNo) {
    return statusCache.value.get(inventoryNo) || {
      status: 'unknown',
      color: '#64748b',
      badge: 'unknown',
      icon: 'pi-question-circle',
      label: 'Desconocido',
      animate: false,
      priority: 0
    };
  }

  /**
   * Limpia el caché (útil para refrescar)
   */
  function clearCache() {
    statusCache.value.clear();
    cacheTime = 0;
  }

  return {
    loadStatuses,
    getStatus,
    clearCache,
    loading: computed(() => loading.value)
  };
}
