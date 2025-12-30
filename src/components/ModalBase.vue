<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="open" class="modal-overlay" @click.self="emit('close')">
        <!-- External close button rendered at viewport level when requested -->
        <div v-if="props.externalClose" class="modal-external-close" :style="externalBtnStyle">
          <button ref="externalBtnRef" :class="['modal-external-btn', { appear: btnVisible }]" type="button" @click="onExternalClick" aria-label="Cerrar edición (cerrar sin guardar)" title="Cerrar edición">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div ref="containerRef" class="modal-container" :style="containerStyle" @click.stop>
          <button v-if="showInternalClose" class="modal-close" type="button" @click="emit('close')" aria-label="Cerrar">
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
  hideInternalClose: { type: Boolean, default: false },
  // Optional offsets (px) to nudge external close button further away from modal
  externalCloseOffsetTop: { type: Number, default: 0 },
  externalCloseOffsetRight: { type: Number, default: 0 }
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
// Use left/top coordinates so the button can be positioned clearly outside the modal container
const externalBtnStyle = reactive({ position: 'fixed', top: '18px', left: '18px', zIndex: 1200 })

function onExternalClick() {
  // Emit a request so the parent can show confirmation (avoids duplicate dialogs)
  emit('close-request')
}

function updateExternalBtnPos() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()

  // Detectar si es móvil
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  let top, left

  if (isSmallMobile) {
    // En móviles muy pequeños, posicionar arriba del modal pero más visible
    top = Math.max(8, rect.top - 40)
    left = Math.max(8, rect.right - 60)
  } else if (isMobile) {
    // En tablets/móviles medianos
    top = Math.max(8, rect.top - 35)
    left = Math.max(8, rect.right - 50)
  } else {
    // En desktop: posición normal
    top = rect.top - 30
    left = rect.right + 8
  }

  // Aplicar offsets opcionales pasados por props
  try {
    top += Number(props.externalCloseOffsetTop || 0)
    left += Number(props.externalCloseOffsetRight || 0)
  } catch (e) {
    // ignore
  }

  // Clamps finales para asegurar que esté visible
  if (top < 8) top = 8
  if (left < 8) left = 8
  if (left > window.innerWidth - 60) left = window.innerWidth - 60

  externalBtnStyle.top = `${top}px`
  externalBtnStyle.left = `${left}px`
  delete externalBtnStyle.right
}

let resizeHandler = null
// Mostrar el close interno solo si no estamos usando externalClose
const showInternalClose = computed(() => !props.hideInternalClose && !props.externalClose)
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

@media (max-width: 768px) {
  .modal-container {
    margin: 16px;
    max-height: calc(100vh - 32px);
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 8px;
    max-height: calc(100vh - 16px);
    border-radius: 8px;
  }
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
  /* right removed to allow left positioning from inline style */
  z-index: 1100; /* ensure above modal container */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  padding: 6px; /* pequeño padding para separar visualmente */
}

.modal-external-btn {
  background: rgba(239, 68, 68, 0.15);
  color: rgba(239, 68, 68, 0.9);
  border: 2px solid rgba(239, 68, 68, 0.5);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  cursor: pointer;
  opacity: 1;
  transition: all 0.2s ease;
}
.modal-external-btn svg { stroke: rgba(239, 68, 68, 0.9) }

.modal-external-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.8);
  color: rgba(239, 68, 68, 1);
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  opacity: 1;
}

.modal-external-btn:hover svg {
  stroke: rgba(239, 68, 68, 1);
}

@media (max-width: 768px) {
  .modal-external-btn {
    width: 48px;
    height: 48px;
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid rgba(239, 68, 68, 0.7);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  }

  .modal-external-btn svg {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 480px) {
  .modal-external-btn {
    width: 52px;
    height: 52px;
    background: rgba(239, 68, 68, 0.25);
    border: 2.5px solid rgba(239, 68, 68, 0.8);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
  }

  .modal-external-btn svg {
    width: 24px;
    height: 24px;
    stroke-width: 2.5;
  }
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
