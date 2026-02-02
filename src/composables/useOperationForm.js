import { ref, computed, reactive, watch } from 'vue'
import { gsap } from 'gsap'

export function useOperationForm(initialData = {}) {
  // Estado del formulario
  const formData = reactive({
    ...initialData
  })

  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errors = reactive({})
  const currentStep = ref(0)
  const showSkeleton = ref(true)

  // Timers
  let skeletonTimer = null

  // Simular carga inicial del formulario
  const initializeForm = async (duration = 800) => {
    showSkeleton.value = true
    return new Promise((resolve) => {
      skeletonTimer = setTimeout(() => {
        showSkeleton.value = false
        resolve()
      }, duration)
    })
  }

  // Validar un campo
  const validateField = (fieldName, value, rules = {}) => {
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[fieldName] = 'Este campo es requerido'
      return false
    }

    if (rules.minLength && value.toString().length < rules.minLength) {
      errors[fieldName] = `Mínimo ${rules.minLength} caracteres`
      return false
    }

    if (rules.maxLength && value.toString().length > rules.maxLength) {
      errors[fieldName] = `Máximo ${rules.maxLength} caracteres`
      return false
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors[fieldName] = rules.patternMessage || 'Formato inválido'
      return false
    }

    delete errors[fieldName]
    return true
  }

  // Validar todo el formulario
  const validateForm = (schema) => {
    let isValid = true
    Object.keys(schema).forEach((fieldName) => {
      if (!validateField(fieldName, formData[fieldName], schema[fieldName])) {
        isValid = false
      }
    })
    return isValid
  }

  // Limpiar errores
  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })
  }

  // Actualizar un campo con validación
  const updateField = (fieldName, value, rules = {}) => {
    formData[fieldName] = value
    validateField(fieldName, value, rules)
  }

  // Animar entrada de elementos
  const animateIn = (selector, delay = 0) => {
    return gsap.from(selector, {
      duration: 0.6,
      opacity: 0,
      y: 20,
      stagger: 0.1,
      ease: 'power3.out',
      delay,
      clearProps: 'all'
    })
  }

  // Limpiar el formulario
  const resetForm = () => {
    Object.keys(formData).forEach((key) => {
      formData[key] = initialData[key] || null
    })
    clearErrors()
  }

  // Calcular progreso del formulario (campos completados)
  const formProgress = computed(() => {
    const totalFields = Object.keys(formData).length
    const completedFields = Object.keys(formData).filter((key) => formData[key]).length
    return Math.round((completedFields / totalFields) * 100)
  })

  // Estado de validez
  const isFormValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  // Cleanup
  const cleanup = () => {
    if (skeletonTimer) clearTimeout(skeletonTimer)
  }

  return {
    // State
    formData,
    isLoading,
    isSubmitting,
    errors,
    currentStep,
    showSkeleton,

    // Methods
    initializeForm,
    validateField,
    validateForm,
    clearErrors,
    updateField,
    animateIn,
    resetForm,
    cleanup,

    // Computed
    formProgress,
    isFormValid
  }
}
