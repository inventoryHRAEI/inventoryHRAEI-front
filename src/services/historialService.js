import { authedFetch } from '../utils/api';

export const getEquipmentHistory = async (inventoryId) => {
  try {
    // Try to fetch from backend
    const response = await authedFetch(`/api/ops/equipment/${inventoryId}/history`);
    
    // Check if response is valid JSON (not HTML error)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Backend returned non-JSON response for ${inventoryId}. Using empty history.`);
      return { history: [] };
    }
    
    const data = await response.json();
    if (data && data.ok) {
      // backend returns { ok:true, history: {...} }
      const hist = data.history;
      if (Array.isArray(hist)) {
        // older versions returned a plain array
        return { history: hist };
      }
      if (hist && Array.isArray(hist.history)) {
        // new structure already contains nested array
        return hist;
      }
      // fallback
      return { history: [] };
    }
    
    if (data && data.data) {
      const d = data.data;
      if (Array.isArray(d)) return { history: d };
      if (d && Array.isArray(d.history)) return d;
      return { history: [] };
    }
    
    throw new Error(data.msg || 'Error fetching history');
  } catch (error) {
    console.warn(`Backend endpoint not available for ${inventoryId}: ${error.message}`);
    console.warn('Returning empty history. The equipment history feature will show no data until backend is implemented.');
    // Return empty history instead of throwing - let the component handle empty state gracefully
    return { history: [] };
  }
};
