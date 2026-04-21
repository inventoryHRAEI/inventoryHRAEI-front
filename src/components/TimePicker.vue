<template>
  <div class="time-picker-modern" @click="openPicker" role="group">
    <input
      ref="inputEl"
      type="time"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="time-input"
      :class="{
        'error': error,
        'success': success
      }"
    />

    <button
      type="button"
      class="time-icon"
      @click.stop="openPicker"
      :aria-label="ariaLabel"
      :disabled="disabled"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 7V12L15 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'TimePickerModern',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Seleccionar hora'
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
    ,
    ariaLabel: {
      type: String,
      default: 'Abrir selector de hora'
    }
  },
  emits: ['update:modelValue'],
  data() { return {} },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        const el = this.$refs.inputEl
        const next = newValue || ''
        if (el && el.value !== next) {
          el.value = next
        }
      }
    }
  },
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value)
    }
    ,
    openPicker() {
      if (this.disabled) return
      const el = this.$refs.inputEl
      if (!el) return
      // Prefer showPicker() when available (Chromium)
      try {
        if (typeof el.showPicker === 'function') {
          el.showPicker()
          return
        }
      } catch (e) {
        // ignore and fallback
      }
      // Fallback: focus + click to hint the browser to open the native UI
      try { el.focus(); el.click(); } catch (e) { el.focus() }
    }
  }
}
</script>

<style scoped>
.time-picker-modern {
  width: 100%;
  min-width: 0;
}

.time-input {
  width: 100%;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: var(--input-bg, #ffffff);
  color: var(--text-primary, #333);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.time-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.time-input:disabled {
  background-color: var(--disabled-bg, #f3f4f6);
  color: var(--text-disabled, #6b7280);
  cursor: not-allowed;
}

.time-input.error {
  border-color: var(--error-color, #ef4444);
}

.time-input.success {
  border-color: var(--success-color, #10b981);
}

.time-input::-webkit-calendar-picker-indicator {
  /* hide tiny native indicator so our visible button is used */
  opacity: 0;
  width: 0;
  height: 0;
}

.time-input::-webkit-calendar-picker-indicator:hover {
  background-color: transparent;
}

.time-picker-modern {
  position: relative;
  display: block;
}

.time-icon {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  min-width: 36px;
  padding: 6px;
  border: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-cyan, #06b6d4);
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.time-icon:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.time-input {
  padding-right: 50px; /* space for icon */
}
</style>