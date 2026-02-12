<template>
  <div class="folio-input-container">
    <div class="folio-input-display">
      <div class="folio-badge" :class="{ 'loading': isLoading }">
        <span v-if="displayFull !== '--'" class="folio-complete">{{ displayFull }}</span>
        <span v-else class="folio-loading">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
      </div>
      <button
        type="button"
        class="info-folio-btn"
        @mouseenter="showFolioInfo = true"
        @mouseleave="showFolioInfo = false"
        aria-haspopup="true"
        :aria-expanded="showFolioInfo"
        title="Los folios se asignan automáticamente"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>
      <Transition name="popover-fade">
        <div
          v-if="showFolioInfo"
          class="folio-info-popover"
          @mouseenter="showFolioInfo = true"
          @mouseleave="showFolioInfo = false"
        >
          Tu folio de esta operación se asigna automáticamente.
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ 
  modelValue: { type: String, default: '' }, 
  digits: { type: Number, default: 6 }, 
  prefix: { type: String, default: 'E-' }, 
  isAutomatic: { type: Boolean, default: true } 
})
const emit = defineEmits(['update:modelValue'])
const showFolioInfo = ref(false)
const isLoading = ref(false)

// Display the complete folio as assigned (e.g., "E-000001")
const displayFull = computed(() => {
  return props.modelValue && String(props.modelValue).trim() ? props.modelValue : '--'
})

// Watch for value changes to update loading state
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== '--') {
    isLoading.value = false
  }
})
</script>

<style scoped>
.folio-input-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.folio-input-display {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  flex: 1;
}

.folio-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 40px;
  padding: 8px 14px;
  background: rgba(74, 222, 128, 0.08);
  border: 2px solid rgba(74, 222, 128, 0.3);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.folio-badge.loading {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.08);
}

.folio-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #4ade80;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 2px;
  cursor: not-allowed;
  user-select: text;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.folio-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 20px;
}

.folio-loading .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #60a5fa;
  animation: pulse 1.4s infinite;
}

.folio-loading .dot:nth-child(1) {
  animation-delay: 0s;
}

.folio-loading .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.folio-loading .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.info-folio-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.info-folio-btn:hover {
  background: rgba(74, 222, 128, 0.2);
  transform: scale(1.1);
}

.folio-info-popover {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 10px;
  padding: 10px 14px;
  background: #1e1e2e;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.2s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
}
</style>