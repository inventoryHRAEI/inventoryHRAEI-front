<template>
  <div class="field-group" :class="{ 'is-loading': isLoading, 'is-error': error }">
    <div class="form-fields">
      <slot></slot>
    </div>
    
    <transition name="error-fade">
      <div v-if="error" class="field-error-message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ error }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.field-group {
  display: contents;
}

.form-fields {
  display: contents;
}

.field-error-message {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fca5a5;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideInDown 0.3s ease-out;
}

.field-error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
