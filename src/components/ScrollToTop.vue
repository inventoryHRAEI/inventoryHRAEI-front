<template>
  <teleport to="body">
    <button
      ref="scrollTopBtn"
      @click="handleClick"
      :class="['scroll-to-top', { expanded: isHovered }]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      aria-label="volver al inicio de la pagina"
    >
      <span class="icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6L8 10H11V18H13V10H16L12 6Z" fill="currentColor"/>
        </svg>
      </span>
      <span class="text">volver al inicio de la pagina</span>
    </button>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const scrollTopBtn = ref(null)
const isHovered = ref(false)
const SCROLL_THRESHOLD = 50
let ticking = false

function handleClick() {
  // Animación de feedback al hacer click
  gsap.to(scrollTopBtn.value, {
    scale: 0.9,
    duration: 0.1,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      // Scroll suave después del feedback
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: 0 },
        ease: 'power3.inOut'
      })
    }
  })
}

function showButton() {
  if (scrollTopBtn.value.style.pointerEvents === 'auto') return
  // Resetear estado hover para asegurar que aparezca circular
  isHovered.value = false
  scrollTopBtn.value.style.pointerEvents = 'auto'

  // Matar todas las animaciones existentes
  gsap.killTweensOf(scrollTopBtn.value)

  gsap.to(scrollTopBtn.value, {
    duration: 0.8,
    opacity: 1,
    scale: 1,
    rotation: 0,
    ease: 'elastic.out(1, 0.8)',
    onComplete: () => {
      // Solo iniciar pulso si no está en hover
      if (!isHovered.value) {
        setTimeout(startPulseAnimation, 500)
      }
    }
  })
}

function hideButton() {
  if (scrollTopBtn.value.style.pointerEvents === 'none') return
  // Resetear estado hover al desaparecer
  isHovered.value = false
  scrollTopBtn.value.style.pointerEvents = 'none'
  gsap.killTweensOf(scrollTopBtn.value)
  gsap.killTweensOf(scrollTopBtn.value, 'scale')
  gsap.to(scrollTopBtn.value, {
    duration: 0.5,
    opacity: 0,
    scale: 0,
    rotation: 180,
    ease: 'back.in(1.7)'
  })
}

function startPulseAnimation() {
  // Solo iniciar pulso si el botón no está expandido y está visible
  if (isHovered.value || scrollTopBtn.value.style.pointerEvents === 'none') return

  gsap.to(scrollTopBtn.value, {
    scale: 1.03,
    duration: 2.5,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1,
    delay: 1.5
  })
}

function handleMouseEnter() {
  if (scrollTopBtn.value.style.pointerEvents === 'none') return
  // Pequeño delay para evitar activación inmediata al aparecer
  setTimeout(() => {
    if (scrollTopBtn.value.style.pointerEvents === 'auto') {
      isHovered.value = true
      // Detener animación de pulso inmediatamente
      gsap.killTweensOf(scrollTopBtn.value, 'scale')
    }
  }, 50)
}

function handleMouseLeave() {
  if (scrollTopBtn.value.style.pointerEvents === 'none') return
  // Pequeño delay para evitar flickering
  setTimeout(() => {
    if (scrollTopBtn.value.style.pointerEvents === 'auto') {
      isHovered.value = false
      // Reiniciar animación de pulso después de un breve delay
      setTimeout(() => {
        if (!isHovered.value && scrollTopBtn.value.style.pointerEvents === 'auto') {
          startPulseAnimation()
        }
      }, 100)
    }
  }, 50)
}

function handleScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(() => {
      const scrollY = window.scrollY
      if (scrollY > SCROLL_THRESHOLD) {
        showButton()
      } else {
        hideButton()
      }
      ticking = false
    })
  }
}

onMounted(() => {
  // Asegurar que el botón esté completamente oculto al inicio
  gsap.set(scrollTopBtn.value, {
    opacity: 0,
    scale: 0,
    rotation: 180,
    pointerEvents: 'none'
  })
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  gsap.killTweensOf(scrollTopBtn.value)
  gsap.killTweensOf(scrollTopBtn.value, 'scale')
  gsap.killTweensOf(window)
})
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6363ED, #63B3ED);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  box-shadow: 0 4px 12px rgba(99, 99, 237, 0.3), 0 0 0 rgba(99, 99, 237, 0);
  transform-origin: center;
  /* Quitamos la transición de transform para dejar que GSAP controle las transformaciones
    (eso evita que la transición CSS anule la animación de aparición 'elastic' de GSAP). */
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease, padding 0.25s ease;
  padding: 0;
  overflow: hidden;
}

.scroll-to-top.expanded {
  width: 200px;
  height: 50px;
  border-radius: 25px;
  padding: 0 12px;
  box-shadow: 0 8px 25px rgba(99, 99, 237, 0.4), 0 0 20px rgba(99, 99, 237, 0.2);
  transform: scale(1.05);
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.scroll-to-top:hover {
  box-shadow: 0 8px 20px rgba(99, 99, 237, 0.4), 0 0 15px rgba(99, 99, 237, 0.3);
}

.scroll-to-top:active {
  box-shadow: 0 2px 8px rgba(99, 99, 237, 0.5), 0 0 10px rgba(99, 99, 237, 0.4);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.icon svg {
  width: 100%;
  height: 100%;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-to-top.expanded .icon svg {
  transform: scale(0.9) translateY(-1px);
}

.text {
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  overflow: hidden;
  width: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, transform 0.25s ease;
  white-space: nowrap;
  margin-left: 0;
  margin-top: 0;
  transform: translateX(-10px);
  text-align: left;
  line-height: 1.2;
}

.scroll-to-top.expanded .text {
  width: 140px;
  opacity: 1;
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .scroll-to-top {
    transition: none;
  }
}
</style>
