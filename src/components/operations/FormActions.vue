<template>
  <div class="form-actions">
    <button 
      type="button"
      class="btn btn-secondary"
      @click="handleCancel"
      :disabled="isSubmitting"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
      <span>Cancelar</span>
    </button>

    <button 
      type="button"
      class="btn btn-tertiary"
      @click="handleReset"
      :disabled="isSubmitting"
      v-if="showReset"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6"></path>
        <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
      </svg>
      <span>Limpiar</span>
    </button>

    <button 
      type="button"
      class="btn btn-primary"
      @click="handleSubmit"
      :disabled="isSubmitting || !isValid"
    >
      <svg v-if="!isSubmitting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"></path>
      </svg>
      <svg v-else class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      </svg>
      <span>{{ submitLabel }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isValid: {
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
  }
})

const emit = defineEmits(['submit', 'cancel', 'reset'])

const handleSubmit = () => emit('submit')
const handleCancel = () => emit('cancel')
const handleReset = () => emit('reset')
</script>

<style scoped>
.form-actions {
  display: flex;
  gap: 12px;
  padding: 24px 0;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.btn svg {
  width: 20px;
  height: 20px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #2edd5a 0%, #10b981 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-tertiary {
  background: rgba(46, 221, 90, 0.1);
  color: #a6ffcb;
  border: 1px solid rgba(46, 221, 90, 0.3);
}

.btn-tertiary:hover:not(:disabled) {
  background: rgba(46, 221, 90, 0.15);
  border-color: rgba(46, 221, 90, 0.5);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .btn {
    flex: 1;
    justify-content: center;
    padding: 12px 16px;
  }
}
</style>
