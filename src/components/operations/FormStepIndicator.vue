<template>
  <div class="step-indicator">
    <div class="steps-container">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step"
        :class="{ 
          'active': index === currentStep,
          'completed': index < currentStep,
          'pending': index > currentStep
        }"
      >
        <div class="step-marker">
          <svg v-if="index < currentStep" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span v-else class="step-number">{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>

        <svg v-if="index < steps.length - 1" class="step-connector" viewBox="0 0 100 2" fill="none" stroke="currentColor">
          <line x1="0" y1="1" x2="100" y2="1"></line>
        </svg>
      </div>
    </div>

    <div class="step-info">
      <p class="step-description">{{ steps[currentStep]?.description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
    validator: (steps) => steps.every(s => s.id && s.label)
  },
  currentStep: {
    type: Number,
    required: true,
    validator: (val) => val >= 0
  }
})
</script>

<style scoped>
.step-indicator {
  margin-bottom: 32px;
}

.steps-container {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step-marker {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.step.completed .step-marker {
  background: linear-gradient(135deg, #2edd5a, #10b981);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.step.active .step-marker {
  background: linear-gradient(135deg, #2edd5a, #10b981);
  color: #fff;
  box-shadow: 0 0 0 4px rgba(46, 221, 90, 0.2);
  animation: pulse-ring 2s infinite;
}

.step.pending .step-marker {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 4px rgba(46, 221, 90, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(46, 221, 90, 0.1);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(46, 221, 90, 0.2);
  }
}

.check-icon {
  width: 24px;
  height: 24px;
  animation: checkBounce 0.5s ease-out;
}

@keyframes checkBounce {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.step-number {
  display: block;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s ease;
}

.step.active .step-label,
.step.completed .step-label {
  color: #fff;
}

.step-connector {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 100%;
  height: 2px;
  z-index: 1;
  stroke-width: 2;
  stroke: rgba(255, 255, 255, 0.1);
}

.step.completed .step-connector {
  stroke: #2edd5a;
  stroke-width: 2;
}

.step:last-child .step-connector {
  display: none;
}

.step-info {
  text-align: center;
  padding: 12px 16px;
  background: rgba(46, 221, 90, 0.08);
  border: 1px solid rgba(46, 221, 90, 0.2);
  border-radius: 12px;
}

.step-description {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

@media (max-width: 768px) {
  .steps-container {
    gap: 8px;
  }

  .step-marker {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .step-connector {
    top: 22px;
  }
}

@media (max-width: 480px) {
  .step {
    gap: 4px;
  }

  .step-marker {
    width: 40px;
    height: 40px;
  }

  .step-label {
    font-size: 0.7rem;
  }
}
</style>
