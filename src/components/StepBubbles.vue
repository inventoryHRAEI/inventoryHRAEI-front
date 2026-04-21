<template>
  <div class="step-bubbles">
    <div v-for="(bubble, idx) in bubbles" :key="idx" class="bubble-item">
      <div :class="['bubble', { active: idx + 1 === currentStep, completed: idx + 1 < currentStep }]">
        <component v-if="idx + 1 < currentStep" :is="CheckIcon" class="bubble-icon check" />
        <span v-else class="bubble-number">{{ idx + 1 }}</span>
      </div>
      <div class="bubble-label">
        <div class="bubble-title">{{ bubble.title }}</div>
        <div class="bubble-desc">{{ bubble.desc }}</div>
      </div>
      <div v-if="idx < bubbles.length - 1" class="bubble-line" :class="{ filled: idx + 1 < currentStep }"></div>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon } from '@heroicons/vue/24/outline'

defineProps({
  currentStep: {
    type: Number,
    default: 1
  },
  bubbles: {
    type: Array,
    default: () => [
      { title: 'Información', desc: 'Datos básicos' },
      { title: 'Verificación', desc: 'Confirma tu email' },
      { title: 'Perfil', desc: 'Completa tu cuenta' }
    ]
  }
})
</script>

<style scoped>
.step-bubbles {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.bubble-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;
}

.bubble {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.bubble.active {
  background: rgba(45, 221, 90, 0.2);
  border-color: #2ddd5a;
  color: #2ddd5a;
  box-shadow: 0 0 12px rgba(45, 221, 90, 0.3);
  transform: scale(1.1);
}

.bubble.completed {
  background: rgba(45, 221, 90, 0.3);
  border-color: #2ddd5a;
  color: #2ddd5a;
}

.bubble-icon {
  width: 20px;
  height: 20px;
}

.bubble-label {
  flex: 1;
  min-width: 0;
}

.bubble-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

.bubble-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.bubble-line {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
  transition: background 0.3s ease;
  margin: 0 4px;
}

.bubble-line.filled {
  background: #2ddd5a;
}

@media (max-width: 640px) {
  .step-bubbles {
    gap: 4px;
    padding: 12px;
  }

  .bubble {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .bubble-number {
    font-size: 0.75rem;
  }

  .bubble-label {
    display: none;
  }

  .bubble-line {
    display: none;
  }
}
</style>
