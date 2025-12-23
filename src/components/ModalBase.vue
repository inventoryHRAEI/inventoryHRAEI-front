<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="open" class="modal-overlay" @click.self="emit('close')">
        <!-- External close button rendered at viewport level when requested -->
        <div v-if="props.externalClose" class="modal-external-close" :style="externalBtnStyle">
          <button ref="externalBtnRef" :class="['modal-external-btn', { appear: btnVisible }]" type="button" @click="onExternalClick" aria-label="Cerrar edición (cerrar sin guardar)" title="Cerrar edición">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div ref="containerRef" class="modal-container" :style="containerStyle" @click.stop>
          <button v-if="!props.hideInternalClose" class="modal-close" type="button" @click="emit('close')" aria-label="Cerrar">
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
import { computed, ref, reactive, onMounted, watch, onUnmounted, nextTick } from 'vue'

/**
 * ModalBase Component
 * Proporciona un modal base con soporte para cierre externo e interno
 * 
 * Props:
 *   - open: Boolean - controla visibilidad del modal
 *   - width: String|Number - ancho del modal (default: 100%)
 *   - maxWidth: String|Number - ancho máximo del modal (default: 1000px)
 *   - height: String|Number - altura del modal (default: 90vh)
 *   - externalClose: Boolean - habilita botón de cierre externo
 *   - hideInternalClose: Boolean - oculta botón de cierre interno
 * 
 * Emits:
 *   - close: solicitud de cierre del modal
 *   - close-request: solicitud de cierre (para confirmación)
 */

const props = defineProps({
  open: { type: Boolean, default: false },
  width: { type: [String, Number], default: '100%' },
  maxWidth: { type: [String, Number], default: '1000px' },
  height: { type: [String, Number], default: '90vh' },
  externalClose: { type: Boolean, default: false },
  hideInternalClose: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'close-request'])

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const containerRef = ref(null)
const externalBtnRef = ref(null)
const btnVisible = ref(false)
const externalBtnStyle = reactive({ position: 'fixed', top: '18px', right: '18px', zIndex: 1200 })

function onExternalClick() {
  // Emit a request so the parent can show confirmation (avoids duplicate dialogs)
  emit('close-request')
}

function updateExternalBtnPos() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  // place the button just outside the top-right corner of the modal container
  const top = Math.max(8, rect.top - 8)
  const rightOffset = Math.max(8, window.innerWidth - rect.right - 8)
  externalBtnStyle.top = `${top}px`
  externalBtnStyle.right = `${rightOffset}px`
}

let resizeHandler = null
onMounted(() => {
  resizeHandler = () => updateExternalBtnPos()
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('scroll', resizeHandler, true)
  // watch initial mount to start hidden->appear animation when modal opens
  // Use a small delay so the modal container has been laid out
  watch(() => props.open, async (v) => {
    if (v && props.externalClose) {
      await nextTick()
      updateExternalBtnPos()
      // small delay then show button (animation)
      setTimeout(() => {
        btnVisible.value = true
        // focus the button so keyboard users can easily close
        if (externalBtnRef.value) externalBtnRef.value.focus()
      }, 80)
    } else {
      btnVisible.value = false
    }
  })
  // keydown handler for Escape to request close
  const keyHandler = (ev) => {
    if (ev.key === 'Escape' || ev.key === 'Esc') {
      if (props.open && props.externalClose) {
        ev.preventDefault()
        emit('close-request')
      }
    }
  }
  window.addEventListener('keydown', keyHandler)
  // store to remove later
  resizeHandler._keyHandler = keyHandler
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    window.removeEventListener('scroll', resizeHandler, true)
    if (resizeHandler._keyHandler) window.removeEventListener('keydown', resizeHandler._keyHandler)
  }
})

watch(() => props.open, async (val) => {
  if (val) {
    await nextTick()
    updateExternalBtnPos()
  }
})
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
  z-index: 1005; /* keep behind external close */
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

.modal-external-close {
  position: fixed; /* place relative to viewport */
  top: 18px;
  right: 18px;
  z-index: 1100; /* ensure above modal container */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.modal-external-btn {
  background: rgba(148, 163, 184, 0.2);
  color: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.4);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  opacity: 0.9;
  transition: all 0.2s ease;
}
.modal-external-btn svg { stroke: rgba(241, 245, 249, 0.8) }

.modal-external-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.6);
  color: rgba(239, 68, 68, 1);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.22);
  opacity: 1;
}

.modal-external-btn:hover svg {
  stroke: rgba(239, 68, 68, 1);
}

/* gentle appear animation for the external button */
.modal-external-btn.appear {
  animation: modalBtnIn 220ms ease both;
}

@keyframes modalBtnIn {
  0% {
    transform: translateY(-6px) scale(0.92);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.95;
  }
}

.modal-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 18px;
}
</style>
