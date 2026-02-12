/**
 * Composable for shared operation form logic
 * Provides common functionality for OpEntrada, OpSalida, OpResguardo, OpServicio
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

export function useOperationForm(options = {}) {
  const {
    type = 'entrada',
    localStorageKey = '',
    initialForm = {},
    validationRules = {}
  } = options

  const router = useRouter()
  
  // State
  const loading = ref(true)
  const submitting = ref(false)
  const errors = reactive({})
  const currentStep = ref(0)
  const formMounted = ref(false)
  
  // Form data with defaults
  const form = reactive({
    nombreSolicitante: '',
    servicio: '',
    especialidad: '',
    folio: '',
    fecha: '',
    fechaISO: '',
    horaInicio: '',
    horaTermino: '',
    descripcion: '',
    items: [],
    ...initialForm
  })

  // Computed
  const isValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  const itemCount = computed(() => form.items?.length || 0)

  const hasUnsavedChanges = computed(() => {
    // Check if form has any data
    return form.nombreSolicitante || 
           form.servicio || 
           form.descripcion || 
           form.items?.length > 0
  })

  // Methods
  function validateField(fieldName, value) {
    const rules = validationRules[fieldName]
    if (!rules) return true

    for (const rule of rules) {
      if (rule.required && !value) {
        errors[fieldName] = rule.message || 'Este campo es requerido'
        return false
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[fieldName] = rule.message || 'Formato inválido'
        return false
      }
      if (rule.minLength && value.length < rule.minLength) {
        errors[fieldName] = rule.message || `Mínimo ${rule.minLength} caracteres`
        return false
      }
    }

    delete errors[fieldName]
    return true
  }

  function validateForm() {
    let isValid = true
    Object.keys(validationRules).forEach(fieldName => {
      if (!validateField(fieldName, form[fieldName])) {
        isValid = false
      }
    })
    return isValid
  }

  function clearErrors() {
    Object.keys(errors).forEach(key => delete errors[key])
  }

  function resetForm() {
    Object.keys(form).forEach(key => {
      if (Array.isArray(initialForm[key])) {
        form[key] = []
      } else {
        form[key] = initialForm[key] || ''
      }
    })
    clearErrors()
    currentStep.value = 0
  }

  // Animation helpers
  function animateSectionsIn() {
    if (!formMounted.value) return
    
    gsap.from('.form-section', {
      duration: 0.6,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'all'
    })
  }

  function animateItemAdded(element) {
    gsap.from(element, {
      duration: 0.4,
      scale: 0.9,
      opacity: 0,
      ease: 'back.out(1.7)'
    })
  }

  function animateItemRemoved(element) {
    return new Promise(resolve => {
      gsap.to(element, {
        duration: 0.3,
        scale: 0.9,
        opacity: 0,
        x: -20,
        ease: 'power2.in',
        onComplete: resolve
      })
    })
  }

  // Local storage
  function saveToLocalStorage() {
    if (!localStorageKey) return
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(form))
    } catch (e) {
      console.warn('Could not save to localStorage:', e)
    }
  }

  function loadFromLocalStorage() {
    if (!localStorageKey) return false
    try {
      const saved = localStorage.getItem(localStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.assign(form, parsed)
        return true
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e)
    }
    return false
  }

  function clearLocalStorage() {
    if (!localStorageKey) return
    try {
      localStorage.removeItem(localStorageKey)
    } catch (e) {
      console.warn('Could not clear localStorage:', e)
    }
  }

  // Navigation
  function goBack() {
    const routeMap = {
      entrada: 'order-management',
      salida: 'order-management-salida',
      resguardo: 'order-management-resguardo',
      servicio: 'order-management-servicio'
    }
    router.push({ name: routeMap[type] || 'dashboard' })
  }

  // Lifecycle
  onMounted(async () => {
    formMounted.value = true
    
    // Simulate loading
    await new Promise(r => setTimeout(r, 300))
    loading.value = false
    
    // Try to restore from localStorage
    loadFromLocalStorage()
    
    // Animate sections
    requestAnimationFrame(() => {
      animateSectionsIn()
    })
  })

  // Auto-save on changes
  watch(form, () => {
    if (formMounted.value) {
      saveToLocalStorage()
    }
  }, { deep: true })

  return {
    // State
    form,
    loading,
    submitting,
    errors,
    currentStep,
    
    // Computed
    isValid,
    itemCount,
    hasUnsavedChanges,
    
    // Methods
    validateField,
    validateForm,
    clearErrors,
    resetForm,
    goBack,
    
    // Animation
    animateSectionsIn,
    animateItemAdded,
    animateItemRemoved,
    
    // Storage
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  }
}
