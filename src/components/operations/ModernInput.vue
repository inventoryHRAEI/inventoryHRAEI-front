<template>
  <div class="modern-field" :class="[stateClass, sizeClass, { 'is-focused': isFocused, 'has-value': hasValue }]">
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="field-wrapper">
      <!-- Prefix Icon/Slot -->
      <div v-if="$slots.prefix || prefixIcon" class="field-prefix">
        <slot name="prefix">
          <component v-if="prefixIcon" :is="prefixIcon" class="prefix-icon" />
        </slot>
      </div>

      <!-- Input Element -->
      <component
        :is="inputComponent"
        :id="inputId"
        ref="inputRef"
        v-bind="inputAttrs"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        class="field-input"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />

      <!-- Clear Button -->
      <button 
        v-if="clearable && hasValue && !disabled && !readonly"
        type="button"
        class="field-clear"
        @click="onClear"
        tabindex="-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      </button>

      <!-- Suffix Icon/Slot -->
      <div v-if="$slots.suffix || suffixIcon" class="field-suffix">
        <slot name="suffix">
          <component v-if="suffixIcon" :is="suffixIcon" class="suffix-icon" />
        </slot>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="field-loading">
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Help/Error Text -->
    <Transition name="fade-slide">
      <p v-if="errorMessage" class="field-message error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        {{ errorMessage }}
      </p>
      <p v-else-if="hint" class="field-message hint">{{ hint }}</p>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  hint: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // small, normal, large
  state: { type: String, default: 'default' }, // default, success, warning, error
  prefixIcon: { type: [Object, Function], default: null },
  suffixIcon: { type: [Object, Function], default: null },
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: null },
  inputAttrs: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear'])

const inputId = useId()
const inputRef = ref(null)
const isFocused = ref(false)

const inputComponent = computed(() => props.multiline ? 'textarea' : 'input')

const hasValue = computed(() => {
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
})

const stateClass = computed(() => {
  if (props.errorMessage) return 'state-error'
  return `state-${props.state}`
})

const sizeClass = computed(() => `size-${props.size}`)

const inputAttrs = computed(() => ({
  type: props.multiline ? undefined : props.type,
  rows: props.multiline ? props.rows : undefined,
  maxlength: props.maxlength,
  ...props.inputAttrs
}))

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function onFocus(e) {
  isFocused.value = true
  emit('focus', e)
}

function onBlur(e) {
  isFocused.value = false
  emit('blur', e)
}

function onClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

function focus() {
  inputRef.value?.focus()
}

function blur() {
  inputRef.value?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>

<style scoped>
.modern-field {
  --field-bg: rgba(255, 255, 255, 0.04);
  --field-border: rgba(255, 255, 255, 0.1);
  --field-text: #e2e8f0;
  --field-placeholder: rgba(255, 255, 255, 0.35);
  --field-focus: #3b82f6;
  --field-radius: 12px;
  
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Label */
.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-mark {
  color: #f87171;
  font-weight: 600;
}

/* Wrapper */
.field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-field.is-focused .field-wrapper {
  border-color: var(--field-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background: rgba(59, 130, 246, 0.05);
}

.modern-field:hover:not(.is-focused):not([disabled]) .field-wrapper {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

/* States */
.state-success .field-wrapper {
  border-color: rgba(34, 197, 94, 0.5);
}

.state-success.is-focused .field-wrapper {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.state-warning .field-wrapper {
  border-color: rgba(245, 158, 11, 0.5);
}

.state-warning.is-focused .field-wrapper {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.state-error .field-wrapper {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.05);
}

.state-error.is-focused .field-wrapper {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Input */
.field-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--field-text);
  font-family: inherit;
  font-size: 0.95rem;
}

.field-input::placeholder {
  color: var(--field-placeholder);
}

.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Textarea specific */
textarea.field-input {
  resize: vertical;
  min-height: 80px;
}

/* Sizes */
.size-small .field-input {
  padding: 8px 12px;
  font-size: 0.85rem;
}

.size-normal .field-input {
  padding: 12px 16px;
}

.size-large .field-input {
  padding: 16px 20px;
  font-size: 1rem;
}

/* Prefix/Suffix */
.field-prefix,
.field-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.field-prefix {
  padding-left: 14px;
}

.field-suffix {
  padding-right: 14px;
}

.prefix-icon,
.suffix-icon {
  width: 20px;
  height: 20px;
}

/* Clear button */
.field-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.15s;
}

.field-clear:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

/* Loading */
.field-loading {
  padding-right: 14px;
  color: var(--field-focus);
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Messages */
.field-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.8rem;
}

.field-message.hint {
  color: rgba(255, 255, 255, 0.5);
}

.field-message.error {
  color: #f87171;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
