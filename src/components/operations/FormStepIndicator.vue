<template>
  <div class="form-step-indicator">
    <div 
      v-for="(step, index) in steps" 
      :key="index"
      class="step-item"
      :class="{ 
        'is-active': currentStep === index,
        'is-completed': currentStep > index,
        'is-clickable': allowNavigation && index <= maxReachedStep
      }"
      @click="handleStepClick(index)"
    >
      <div class="step-connector" v-if="index > 0">
        <div class="connector-line" :class="{ filled: currentStep >= index }"></div>
      </div>
      
      <div class="step-bubble">
        <transition name="check-pop" mode="out-in">
          <svg 
            v-if="currentStep > index" 
            key="check"
            class="check-icon"
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="3" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span v-else key="number" class="step-number">{{ index + 1 }}</span>
        </transition>
      </div>
      
      <span class="step-label">{{ step.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    validator: (val) => val.every(s => s.label)
  },
  currentStep: { type: Number, default: 0 },
  allowNavigation: { type: Boolean, default: false }
})

const emit = defineEmits(['step-click'])

const maxReachedStep = ref(props.currentStep)

// Track max reached step
if (props.currentStep > maxReachedStep.value) {
  maxReachedStep.value = props.currentStep
}

function handleStepClick(index) {
  if (props.allowNavigation && index <= maxReachedStep.value) {
    emit('step-click', index)
  }
}
</script>

<style scoped>
.form-step-indicator {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  flex: 1;
  max-width: 140px;
}

.step-item.is-clickable {
  cursor: pointer;
}

.step-item.is-clickable:hover .step-bubble {
  transform: scale(1.1);
}

.step-connector {
  position: absolute;
  top: 18px;
  right: calc(50% + 22px);
  width: calc(100% - 44px);
  height: 2px;
}

.connector-line {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.1);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

.connector-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.connector-line.filled::after {
  width: 100%;
}

.step-bubble {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 2px solid rgba(255,255,255,0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.step-item.is-active .step-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: transparent;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.step-item.is-completed .step-bubble {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-color: transparent;
}

.step-number {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}

.step-item.is-active .step-number {
  color: white;
}

.check-icon {
  color: white;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.45);
  text-align: center;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.step-item.is-active .step-label,
.step-item.is-completed .step-label {
  color: rgba(255,255,255,0.85);
}

/* Animation */
.check-pop-enter-active {
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.check-pop-leave-active {
  animation: popOut 0.2s ease;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes popOut {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

@media (max-width: 640px) {
  .form-step-indicator {
    padding: 16px 8px;
    gap: 4px;
  }
  
  .step-item {
    max-width: 80px;
  }
  
  .step-bubble {
    width: 32px;
    height: 32px;
  }
  
  .step-connector {
    top: 15px;
    right: calc(50% + 18px);
    width: calc(100% - 36px);
  }
  
  .step-label {
    font-size: 0.68rem;
  }
}
</style>
