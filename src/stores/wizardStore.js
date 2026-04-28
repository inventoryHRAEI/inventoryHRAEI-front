import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

// Helper para generar key
const getDraftKey = (type) => `wizardDraft:${type}`

export const useWizardStore = defineStore('wizard', () => {
  // Estado: map de forms reactivos por tipo
  const forms = reactive({})

  // Estado de restauración
  const isRestoring = ref(false)
  const suppressSave = ref(false)
  const lastAppliedAt = ref(null)

  // Timeout para suprimir saves
  let suppressTimeout = null

  // Acción para aplicar draft
  const applyDraft = (type) => {
    const key = getDraftKey(type)
    const stored = localStorage.getItem(key) || sessionStorage.getItem(key)
    if (!stored) return false

    try {
      const draft = JSON.parse(stored)
      if (!draft.formData || Object.keys(draft.formData).length === 0) return false

      // Set restoring flag
      isRestoring.value = true
      suppressSave.value = true
      lastAppliedAt.value = Date.now()

      // Apply to form
      forms[type] = { ...draft.formData }

      // Clear suppression after timeout
      if (suppressTimeout) clearTimeout(suppressTimeout)
      suppressTimeout = setTimeout(() => {
        isRestoring.value = false
        suppressSave.value = false
        lastAppliedAt.value = null
      }, 1000)

      console.log(`[WizardStore] Draft applied for ${type}`)
      return true
    } catch (e) {
      console.error(`[WizardStore] Failed to apply draft for ${type}:`, e)
      return false
    }
  }

  // Acción para guardar draft
  const saveDraft = (type, formData) => {
    if (suppressSave.value) {
      console.log(`[WizardStore] Skipping save (restoring) for ${type}`)
      return
    }

    if (!formData || Object.keys(formData).length === 0) {
      console.log(`[WizardStore] Skipping save: empty form for ${type}`)
      return
    }

    const key = getDraftKey(type)
    const draft = {
      formData,
      timestamp: Date.now(),
      type
    }

    try {
      localStorage.setItem(key, JSON.stringify(draft))
      console.log(`[WizardStore] Draft saved for ${type}`)
    } catch (e) {
      console.error(`[WizardStore] Failed to save draft for ${type}:`, e)
    }
  }

  // Acción para limpiar draft
  const clearDraft = (type) => {
    const key = getDraftKey(type)
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
    if (forms[type]) delete forms[type]
    console.log(`[WizardStore] Draft cleared for ${type}`)
  }

  // Get form for type (reactive)
  const getForm = (type) => {
    if (!forms[type]) forms[type] = reactive({})
    return forms[type]
  }

  // Set form for type
  const setForm = (type, newForm) => {
    forms[type] = reactive({ ...newForm })
  }

  // Update form field
  const updateFormField = (type, field, value) => {
    if (!forms[type]) forms[type] = reactive({})
    forms[type][field] = value
  }

  return {
    isRestoring: computed(() => isRestoring.value),
    applyDraft,
    saveDraft,
    clearDraft,
    getForm,
    setForm,
    updateFormField
  }
})