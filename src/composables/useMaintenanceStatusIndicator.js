/**
 * Composable para gestionar indicadores visuales de estado de mantenimiento
 * 
 * Integra con el backend para obtener estados dinámicos de equipos
 * y proporciona utilidades para renderizado de badges y tooltips
 */

import { ref, computed } from 'vue';

// URL base de la API (se configura según el entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Caché local para reducir llamadas al backend
 */
const statusCache = ref(new Map());
const cacheTimestamp = ref(new Map());
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Configuración de estados disponibles (sincronizado con backend)
 */
const statusConfig = ref(null);

export function useMaintenanceStatusIndicator() {
  /**
   * Obtiene el estado de mantenimiento de un equipo
   * @param {string} inventoryNo - Número de inventario
   * @param {boolean} forceRefresh - Ignorar caché
   * @returns {Promise<Object>} Objeto con estado y configuración visual
   */
  async function getEquipmentStatus(inventoryNo, forceRefresh = false) {
    if (!inventoryNo) return null;

    // Verificar caché
    if (!forceRefresh && statusCache.value.has(inventoryNo)) {
      const cached = statusCache.value.get(inventoryNo);
      const timestamp = cacheTimestamp.value.get(inventoryNo);
      
      if (Date.now() - timestamp < CACHE_DURATION) {
        return cached;
      }
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/ops/equipment/${encodeURIComponent(inventoryNo)}/maintenance-status`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        console.warn(`[useMaintenanceStatusIndicator] Error ${response.status} for ${inventoryNo}`);
        return null;
      }

      const { ok, data } = await response.json();
      if (!ok || !data) return null;

      // Guardar en caché
      statusCache.value.set(inventoryNo, data);
      cacheTimestamp.value.set(inventoryNo, Date.now());

      return data;
    } catch (error) {
      console.error('[useMaintenanceStatusIndicator] Error fetching status:', error);
      return null;
    }
  }

  /**
   * Obtiene estados para múltiples equipos en una sola llamada
   * @param {string[]} inventoryNumbers - Array de números de inventario
   * @returns {Promise<Object>} Mapa de inventoryNo -> estado
   */
  async function getBulkEquipmentStatus(inventoryNumbers) {
    if (!Array.isArray(inventoryNumbers) || !inventoryNumbers.length) {
      return {};
    }

    // Separar números en caché vs. necesarios
    const needsFetch = [];
    const results = {};

    inventoryNumbers.forEach(invNo => {
      if (statusCache.value.has(invNo)) {
        const cached = statusCache.value.get(invNo);
        const timestamp = cacheTimestamp.value.get(invNo);
        
        if (Date.now() - timestamp < CACHE_DURATION) {
          results[invNo] = cached;
          return;
        }
      }
      needsFetch.push(invNo);
    });

    // Si todos están en caché, retornar
    if (needsFetch.length === 0) {
      return results;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/ops/equipment/maintenance-status-bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inventoryNumbers: needsFetch }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        console.warn(`[useMaintenanceStatusIndicator] Bulk error ${response.status}`);
        return results;
      }

      const { ok, data } = await response.json();
      if (!ok || !data) return results;

      // Actualizar caché y resultados
      Object.entries(data).forEach(([invNo, status]) => {
        statusCache.value.set(invNo, status);
        cacheTimestamp.value.set(invNo, Date.now());
        results[invNo] = status;
      });

      return results;
    } catch (error) {
      console.error('[useMaintenanceStatusIndicator] Error fetching bulk status:', error);
      return results;
    }
  }

  /**
   * Obtiene la configuración de estados (una sola vez)
   * @returns {Promise<Array>} Array de configuraciones de estado
   */
  async function getStatusConfig() {
    if (statusConfig.value) {
      return statusConfig.value;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/ops/maintenance/statuses/config`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        console.warn('[useMaintenanceStatusIndicator] Config fetch error');
        return [];
      }

      const { ok, data } = await response.json();
      if (ok && data) {
        statusConfig.value = data;
        return data;
      }
      return [];
    } catch (error) {
      console.error('[useMaintenanceStatusIndicator] Error fetching config:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas agregadas de estados
   * @param {string[]} inventoryNumbers - Array de números de inventario
   * @returns {Promise<Object>} Estadísticas agregadas
   */
  async function getMaintenanceStatistics(inventoryNumbers) {
    if (!Array.isArray(inventoryNumbers) || !inventoryNumbers.length) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/ops/maintenance/statistics`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inventoryNumbers }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        console.warn(`[useMaintenanceStatusIndicator] Stats error ${response.status}`);
        return null;
      }

      const { ok, data } = await response.json();
      return ok ? data : null;
    } catch (error) {
      console.error('[useMaintenanceStatusIndicator] Error fetching statistics:', error);
      return null;
    }
  }

  /**
   * Limpia la caché local
   */
  function clearCache(inventoryNo = null) {
    if (inventoryNo) {
      statusCache.value.delete(inventoryNo);
      cacheTimestamp.value.delete(inventoryNo);
    } else {
      statusCache.value.clear();
      cacheTimestamp.value.clear();
    }
  }

  /**
   * Obtiene clases CSS para un estado
   * @param {string} status - Clave de estado
   * @returns {string} Clases CSS
   */
  function getStatusClasses(status) {
    return `maintenance-status-${status}`;
  }

  /**
   * Obtiene el color hex de un estado
   * @param {Object} statusData - Objeto de estado del backend
   * @returns {string} Color hex o default
   */
  function getStatusColor(statusData) {
    return statusData?.color || '#757575';
  }

  /**
   * Formatea información para tooltip
   * @param {Object} statusData - Objeto de estado del backend
   * @returns {string} HTML para tooltip
   */
  function formatTooltip(statusData) {
    if (!statusData) return '';

    const lines = [
      `<strong>${statusData.label || 'Estado Desconocido'}</strong>`,
    ];

    if (statusData.description) {
      lines.push(`<p>${statusData.description}</p>`);
    }

    const info = statusData.info || {};
    
    if (info.lastMaintenanceDate) {
      lines.push(`<small>Última fecha: ${formatDate(info.lastMaintenanceDate)}</small>`);
    }

    if (info.lastMaintenanceType) {
      lines.push(`<small>Tipo: ${info.lastMaintenanceType}</small>`);
    }

    if (info.lastObservations) {
      lines.push(`<small>Observaciones: ${info.lastObservations}</small>`);
    }

    if (info.externalCompany) {
      lines.push(`<small>Empresa: ${info.externalCompany}</small>`);
    }

    return lines.join('<br>');
  }

  /**
   * Formatea una fecha para mostrar
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX');
  }

  /**
   * Determina si un equipo está en mantenimiento
   * @param {Object} statusData - Objeto de estado
   * @returns {boolean}
   */
  function isInMaintenance(statusData) {
    if (!statusData) return false;
    const status = statusData.status || '';
    return status.includes('in_progress') || 
           status.includes('pending') || 
           status.includes('critical') || 
           status.includes('overdue');
  }

  /**
   * Determina la severidad de un estado
   * @param {Object} statusData - Objeto de estado
   * @returns {number} 0 (bajo), 1 (medio), 2 (alto)
   */
  function getSeverity(statusData) {
    return statusData?.severity ?? 0;
  }

  return {
    // Métodos
    getEquipmentStatus,
    getBulkEquipmentStatus,
    getStatusConfig,
    getMaintenanceStatistics,
    clearCache,
    getStatusClasses,
    getStatusColor,
    formatTooltip,
    formatDate,
    isInMaintenance,
    getSeverity,
    
    // Estado reactivo
    statusConfig: computed(() => statusConfig.value),
    cacheSize: computed(() => statusCache.value.size)
  };
}
