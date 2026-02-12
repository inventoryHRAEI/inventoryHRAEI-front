<template>
  <div class="form-field-group" :class="{ 'has-error': hasError, 'is-focused': isFocused }">
    <label v-if="label" :for="fieldId" class="field-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="field-wrapper" @focusin="isFocused = true" @focusout="isFocused = false">
      <slot />
    </div>
    
    <transition name="error-slide">
      <span v-if="error" class="field-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ error }}
      </span>
    </transition>
    
    <span v-if="hint && !error" class="field-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  fieldId: { type: String, default: '' }
})

const isFocused = ref(false)
const hasError = computed(() => !!props.error)
</script>

<style scoped>
.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.01em;
}

.required-mark {
  color: #f87171;
  margin-left: 2px;
}

.field-wrapper {
  position: relative;
}

.field-wrapper :deep(input),
.field-wrapper :deep(select),
.field-wrapper :deep(textarea) {
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.95);
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
  outline: none;
}

.field-wrapper :deep(input)::placeholder,
.field-wrapper :deep(textarea)::placeholder {
  color: rgba(255,255,255,0.35);
}

.field-wrapper :deep(input):focus,
.field-wrapper :deep(select):focus,
.field-wrapper :deep(textarea):focus {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background: rgba(0,0,0,0.35);
}

.has-error .field-wrapper :deep(input),
.has-error .field-wrapper :deep(select),
.has-error .field-wrapper :deep(textarea) {
  border-color: rgba(239, 68, 68, 0.6);
}

.has-error .field-wrapper :deep(input):focus,
.has-error .field-wrapper :deep(select):focus,
.has-error .field-wrapper :deep(textarea):focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.is-focused .field-label {
  color: #60a5fa;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #f87171;
  font-weight: 500;
}

.field-hint {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.45);
}

/* Animation */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.25s ease;
}

.error-slide-enter-from,
.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
