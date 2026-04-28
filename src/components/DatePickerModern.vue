<template>
  <div class="date-picker-modern">
    <input
      type="date"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="date-input"
      :class="{
        'error': error,
        'success': success
      }"
    />
  </div>
</template>

<script>
export default {
  name: 'DatePickerModern',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Seleccionar fecha'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    success: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value)
    }
  }
}
</script>

<style scoped>
.date-picker-modern {
  width: 100%;
}

.date-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: var(--input-bg, #ffffff);
  color: var(--text-primary, #333);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-input:disabled {
  background-color: var(--disabled-bg, #f3f4f6);
  color: var(--text-disabled, #6b7280);
  cursor: not-allowed;
}

.date-input.error {
  border-color: var(--error-color, #ef4444);
}

.date-input.success {
  border-color: var(--success-color, #10b981);
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
}
</style>