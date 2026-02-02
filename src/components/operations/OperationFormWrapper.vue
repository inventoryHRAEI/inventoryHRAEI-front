<template>
  <div class="operation-form-wrapper">
    <!-- Loader/Skeleton -->
    <div v-if="showSkeleton" class="skeleton-loader">
      <SkeletonFormSection v-for="i in 3" :key="i" />
    </div>

    <!-- Contenido principal -->
    <template v-else>
      <!-- Step Indicator -->
      <FormStepIndicator 
        v-if="showSteps"
        :steps="steps"
        :current-step="currentStep"
      />

      <!-- Slot del contenido del formulario -->
      <slot></slot>

      <!-- Summary -->
      <FormSummary 
        v-if="items.length > 0"
        :items="items"
        :on-remove="onRemoveItem"
      />

      <!-- Form Actions -->
      <FormActions
        :is-submitting="isSubmitting"
        :is-valid="isFormValid"
        :show-reset="showReset"
        :submit-label="submitLabel"
        @submit="$emit('submit')"
        @cancel="$emit('cancel')"
        @reset="$emit('reset')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import FormStepIndicator from './FormStepIndicator.vue'
import FormSummary from './FormSummary.vue'
import FormActions from './FormActions.vue'
import SkeletonFormSection from './SkeletonFormSection.vue'
import { gsap } from 'gsap'

const props = defineProps({
  showSkeleton: {
    type: Boolean,
    default: true
  },
  showSteps: {
    type: Boolean,
    default: true
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isFormValid: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: true
  },
  submitLabel: {
    type: String,
    default: 'Guardar'
  },
  steps: {
    type: Array,
    default: () => [
      { id: '1', label: 'Solicitante', description: 'Información de quien solicita' },
      { id: '2', label: 'Detalles', description: 'Detalles de la orden' },
      { id: '3', label: 'Items', description: 'Items y observaciones' },
      { id: '4', label: 'Confirmación', description: 'Revisión y guardado' }
    ]
  },
  currentStep: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel', 'reset', 'remove-item'])

const onRemoveItem = (index) => {
  emit('remove-item', index)
}

onMounted(async () => {
  await nextTick()
  // Animación de entrada
  gsap.from('.operation-form-wrapper', {
    duration: 0.6,
    opacity: 0,
    ease: 'power3.out'
  })
})
</script>

<style scoped>
.operation-form-wrapper {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
