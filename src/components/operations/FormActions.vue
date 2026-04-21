<template>
  <div class="form-actions" :class="{ 'is-sticky': sticky }">
    <div class="actions-inner">
      <div class="actions-left">
        <slot name="left" />
      </div>
      
      <div class="actions-right">
        <button
          v-if="showCancel"
          type="button"
          class="btn-action btn-cancel"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          <svg v-if="cancelIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          {{ cancelText }}
        </button>
        
        <button
          v-if="showSecondary"
          type="button"
          class="btn-action btn-secondary"
          :disabled="loading || secondaryDisabled"
          @click="$emit('secondary')"
        >
          <slot name="secondary-icon" />
          {{ secondaryText }}
        </button>
        
        <button
          type="submit"
          class="btn-action btn-primary"
          :disabled="loading || submitDisabled"
          @click="$emit('submit')"
        >
          <svg v-if="loading" class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <svg v-else-if="submitIcon === 'save'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <svg v-else-if="submitIcon === 'check'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="submitIcon === 'plus'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {{ loading ? loadingText : submitText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: 'Guardar' },
  loadingText: { type: String, default: 'Guardando...' },
  submitIcon: { type: String, default: 'save' },
  submitDisabled: { type: Boolean, default: false },
  showCancel: { type: Boolean, default: true },
  cancelText: { type: String, default: 'Cancelar' },
  cancelIcon: { type: Boolean, default: false },
  showSecondary: { type: Boolean, default: false },
  secondaryText: { type: String, default: 'Acción' },
  secondaryDisabled: { type: Boolean, default: false },
  sticky: { type: Boolean, default: true }
})

defineEmits(['submit', 'cancel', 'secondary'])
</script>

<style scoped>
.form-actions {
  padding: 20px 0 0;
}

.form-actions.is-sticky {
  position: sticky;
  bottom: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.98) 60%, transparent);
  padding: 24px 0 16px;
  margin: 0 -20px -20px;
  padding-left: 20px;
  padding-right: 20px;
  z-index: 10;
}

.actions-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.actions-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.1);
}

.btn-cancel:not(:disabled):hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
}

.btn-secondary {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-secondary:not(:disabled):hover {
  background: rgba(59, 130, 246, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
}

.btn-primary:not(:disabled):active {
  transform: translateY(0);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .form-actions.is-sticky {
    margin: 0 -16px -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .actions-inner {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .actions-left,
  .actions-right {
    width: 100%;
  }
  
  .actions-right {
    flex-direction: column;
  }
  
  .btn-action {
    width: 100%;
    padding: 14px 20px;
  }
}
</style>
