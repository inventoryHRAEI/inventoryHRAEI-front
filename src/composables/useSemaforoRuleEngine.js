/**
 * COMPOSABLE: useSemaforoRuleEngine
 * 
 * Consumidor del motor de reglas desde el frontend Vue
 * Encapsula la lógica de obtener y cachear colores de semáforo
 */

import { ref, computed, reactive } from 'vue';
import { authedFetch } from '@/utils/api.js';

function resolveApiBase() {
  const raw = String(import.meta.env.VITE_API_URL || '').trim()
  if (!raw) return '/api'

  const normalized = raw.replace(/\/+$/, '')

  // Compatibilidad con configuraciones antiguas que apuntan al puerto 3000
  if (/^https?:\/\/localhost:3000(\/api)?$/i.test(normalized)) {
    return '/api'
  }

  // Si viene mismo origen, devolver ruta relativa para aprovechar proxy/interceptor
  try {
    if (typeof window !== 'undefined') {
      const parsed = new URL(normalized, window.location.origin)
      if (parsed.origin === window.location.origin) {
        return parsed.pathname.startsWith('/api') ? parsed.pathname : '/api'
      }
    }
  } catch (e) {
    // fallback defensivo
  }

  return normalized
}

export const useSemaforoRuleEngine = () => {
  // Estado
  const semaforoCache = reactive({});
  const batchCache = reactive({});
  const loading = ref(false);
  const error = ref(null);

  const API_BASE = resolveApiBase();

  const iconByBadge = {
    maintenance: 'pi-wrench',
    critical: 'pi-times-circle',
    partial: 'pi-exclamation-triangle',
    warning: 'pi-exclamation-triangle',
    operational: 'pi-check-circle',
    unknown: 'pi-question-circle'
  }

  function mapStatusToBadge(status) {
    const raw = String(status || '').trim().toLowerCase()
    if (!raw) return ''
    if (raw.includes('maintenance')) return 'maintenance'
    if (raw.includes('critical') || raw.includes('non_functional') || raw.includes('attention')) return 'critical'
    if (raw.includes('partial') || raw.includes('regular') || raw.includes('fair')) return 'partial'
    if (raw.includes('operational') || raw.includes('functional')) return 'operational'
    return ''
  }

  function normalizeSemaforoPayload(payload = {}) {
    const rawBadge = String(payload.badge || '').trim().toLowerCase()
    const badge = (!rawBadge || ['unknown', 'loading', 'error'].includes(rawBadge))
      ? (mapStatusToBadge(payload.status) || 'partial')
      : rawBadge
    const iconRaw = String(payload.icon || '').trim()
    const icon = (iconRaw.startsWith('pi-') || iconRaw.startsWith('pi '))
      ? iconRaw.replace(/^pi\s+/, 'pi-')
      : (iconByBadge[badge] || 'pi-exclamation-triangle')

    const rawLabel = String(payload.label || '').trim().toLowerCase()
    const invalidLabel = !rawLabel || rawLabel.includes('sin código') || rawLabel.includes('sin codigo') || rawLabel.includes('desconocido') || rawLabel === 'error' || rawLabel.includes('cargando')
    const fallbackLabel = badge === 'critical'
      ? 'No funcional o requiere atención'
      : badge === 'operational'
        ? 'Funcional'
        : badge === 'maintenance'
          ? 'En mantenimiento'
          : 'Parcialmente funcional / Condiciones regulares'

    return {
      ...payload,
      badge,
      icon,
      color: payload.color || (badge === 'critical' ? '#ff2400' : badge === 'operational' ? '#22c55e' : badge === 'maintenance' ? '#8b5cf6' : '#ec4899'),
      label: invalidLabel ? fallbackLabel : payload.label
    }
  }

  /**
   * Obtiene el color de un equipo desde el backend
   * Utiliza caché para evitar múltiples llamadas
   *
   * @param {string} inventoryNo - Número de inventario
   * @returns {Promise<Object>} {color, badge, label, icon}
   */
  const getEquipmentColor = async (inventoryNo) => {
    if (!inventoryNo) {
      return {
        color: '#ec4899',
        badge: 'partial',
        label: 'Parcialmente funcional / Condiciones regulares',
        icon: 'pi-exclamation-triangle',
        animate: false,
        status: 'PARTIAL',
        priority: 300
      };
    }

    // Verificar caché
    if (semaforoCache[inventoryNo]) {
      return semaforoCache[inventoryNo];
    }

    try {
      loading.value = true;
      error.value = null;

      const response = await authedFetch(
        `${API_BASE}/semaforo/equipo/${encodeURIComponent(inventoryNo)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Guardar en caché
      semaforoCache[inventoryNo] = normalizeSemaforoPayload({
        color: data.color,
        badge: data.badge,
        label: data.label,
        icon: data.icon,
        animate: !!data.animate,
        status: data.status,
        priority: data.priority || 0
      });

      return semaforoCache[inventoryNo];
    } catch (err) {
      console.error(`[useSemaforoRuleEngine] Error fetching color:`, err);
      error.value = err.message;

      return {
        color: '#ec4899',
        badge: 'partial',
        label: 'Parcialmente funcional / Condiciones regulares',
        icon: 'pi-exclamation-triangle',
        animate: false,
        status: 'PARTIAL',
        priority: 300
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene colores para múltiples equipos en una sola llamada
   * Más eficiente que llamadas individuales
   *
   * @param {string[]} equipmentList - Array de números de inventario
   * @returns {Promise<Object>} Mapa {inventoryNo: {color, badge, label, icon}}
   */
  const getEquipmentColors = async (equipmentList) => {
    if (!Array.isArray(equipmentList) || equipmentList.length === 0) {
      return {};
    }

    try {
      loading.value = true;
      error.value = null;

      const response = await authedFetch(`${API_BASE}/semaforo/equipos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipmentList })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const results = data && typeof data === 'object' && data.results && typeof data.results === 'object'
        ? data.results
        : {}
      const normalizedResults = Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, normalizeSemaforoPayload(v || {})])
      )

      Object.assign(batchCache, normalizedResults);

      return normalizedResults;
    } catch (err) {
      console.error(`[useSemaforoRuleEngine] Error fetching batch colors:`, err);
      error.value = err.message;
      return {};
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene el estado del motor de reglas (debugging)
   *
   * @returns {Promise<Object>} {rulesLoaded, rules}
   */
  const getEngineStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/semaforo/status`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[useSemaforoRuleEngine] Error fetching engine status:', err);
      throw err;
    }
  };

  /**
   * Agrega una nueva regla dinámicamente
   *
   * @param {string} ruleName - Identificador de la regla
   * @param {Object} ruleDefinition - {conditions, event}
   * @returns {Promise<Object>}
   */
  const addDynamicRule = async (ruleName, ruleDefinition) => {
    try {
      const response = await fetch(`${API_BASE}/semaforo/rules/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ruleName, ruleDefinition })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Limpiar caché al agregar nuevas reglas
      Object.keys(semaforoCache).forEach((key) => {
        delete semaforoCache[key];
      });

      return await response.json();
    } catch (err) {
      console.error('[useSemaforoRuleEngine] Error adding rule:', err);
      throw err;
    }
  };

  /**
   * Limpia el caché
   */
  const clearCache = () => {
    Object.keys(semaforoCache).forEach((key) => {
      delete semaforoCache[key];
    });
    Object.keys(batchCache).forEach((key) => {
      delete batchCache[key];
    });
  };

  /**
   * Obtiene el color de un equipo desde caché o realiza fetch si no está en caché
   *
   * @param {string} inventoryNo
   * @returns {Object} Color object (síncrono desde caché o pendiente de fetch)
   */
  const getColorSync = (inventoryNo) => {
    return (
      semaforoCache[inventoryNo] ||
      batchCache[inventoryNo] || {
        color: '#ec4899',
        badge: 'partial',
        label: 'Parcialmente funcional / Condiciones regulares',
        icon: 'pi-exclamation-triangle',
        animate: false,
        status: 'PARTIAL',
        priority: 300
      }
    );
  };

  return {
    // Estado
    semaforoCache,
    batchCache,
    loading,
    error,

    // Métodos
    getEquipmentColor,
    getEquipmentColors,
    getEngineStatus,
    addDynamicRule,
    clearCache,
    getColorSync
  };
};
