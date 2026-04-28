<template>
  <div class="info-popover" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <button class="info-btn" :title="tooltipText">?</button>
    <Transition name="tooltip-fade">
      <div v-if="isOpen" class="tooltip" :style="tooltipStyle">
        <slot>{{ tooltipText }}</slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Más información'
  },
  position: {
    type: String,
    enum: ['top', 'bottom', 'left', 'right'],
    default: 'top'
  }
})

const isOpen = ref(false)

const tooltipStyle = {
  position: 'absolute',
  zIndex: 100,
  pointerEvents: 'none',
  ...(props.position === 'top' && {
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px'
  }),
  ...(props.position === 'bottom' && {
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px'
  }),
  ...(props.position === 'left' && {
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: '8px'
  }),
  ...(props.position === 'right' && {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: '8px'
  })
}
</script>

<style scoped>
.info-popover {
  position: relative;
  display: inline-flex;
}

.info-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: help;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.info-btn:hover {
  border-color: rgba(255, 255, 255, 0.6);
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.tooltip {
  background: rgba(0, 0, 0, 0.95);
  color: rgba(255, 255, 255, 0.9);
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 200px;
}

/* Transiciones */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .tooltip {
    white-space: normal;
    max-width: 150px;
  }
}
</style>
