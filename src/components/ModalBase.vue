<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="open" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-container" :style="containerStyle" @click.stop>
          <button class="modal-close" type="button" @click="emit('close')" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div class="modal-content">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  width: { type: [String, Number], default: '100%' },
  maxWidth: { type: [String, Number], default: '1000px' },
  height: { type: [String, Number], default: '90vh' }
})

const emit = defineEmits(['close'])

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 18, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  background: rgba(13, 20, 35, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  overflow: hidden;
}

.modal-close {
  position: absolute;
  right: 12px;
  top: 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.9);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 18px;
}

/* Animaciones */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
