import { ref } from 'vue'

export function useBiomedicalMeta() {
  const metaFields = ref([])
  const metaLoading = ref(false)

  async function fetchMeta() {
    try {
      metaLoading.value = true
      // Request lightweight meta to avoid heavy DB counts on slow networks/tunnels
      const url = '/api/ops/historial-mantenimientos/meta?lite=1'
      const response = await fetch(url)
      const json = await response.json().catch(() => ({}))
      metaFields.value = Array.isArray(json.fields) ? json.fields : []
    } catch (e) {
      console.error('Error cargando metadatos:', e)
      metaFields.value = []
    } finally {
      metaLoading.value = false
    }
  }

  function getDynamicFieldLabel(id) {
    const field = metaFields.value.find(f => f.id === id)
    return field?.label || id
  }

  function getDynamicFieldKind(id) {
    const field = metaFields.value.find(f => f.id === id)
    return field?.kind || 'text'
  }

  function isDynamicSelectable(id) {
    const field = metaFields.value.find(f => f.id === id)
    return Boolean(field?.selectable)
  }

  function getDynamicSelectOptions(id) {
    const field = metaFields.value.find(f => f.id === id)
    const values = Array.isArray(field?.distinctValues) ? field.distinctValues : []
    return values.slice(0, 10)
  }

  function getDynamicSuggestions(id) {
    const field = metaFields.value.find(f => f.id === id)
    const values = Array.isArray(field?.distinctValues) ? field.distinctValues : []
    return values.slice(0, 50)
  }

  function getDynamicDatalistId(id) {
    return `dyn-${id}-datalist`
  }

  return {
    metaFields,
    metaLoading,
    fetchMeta,
    getDynamicFieldLabel,
    getDynamicFieldKind,
    isDynamicSelectable,
    getDynamicSelectOptions,
    getDynamicSuggestions,
    getDynamicDatalistId
  }
}
