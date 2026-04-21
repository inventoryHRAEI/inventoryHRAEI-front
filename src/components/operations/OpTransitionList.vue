<template>
  <TransitionGroup
    :name="transitionName"
    tag="div"
    :class="['op-transition-list', listClass]"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot />
  </TransitionGroup>
</template>

<script setup>
import { computed } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  type: {
    type: String,
    default: 'fade-slide', // fade, fade-slide, scale, flip, stagger
    validator: (v) => ['fade', 'fade-slide', 'scale', 'flip', 'stagger'].includes(v)
  },
  direction: {
    type: String,
    default: 'down', // up, down, left, right
    validator: (v) => ['up', 'down', 'left', 'right'].includes(v)
  },
  duration: {
    type: Number,
    default: 0.35
  },
  staggerDelay: {
    type: Number,
    default: 0.05
  },
  listClass: {
    type: String,
    default: ''
  },
  useGsap: {
    type: Boolean,
    default: true
  }
})

const transitionName = computed(() => {
  if (props.useGsap) return '' // GSAP handles animations
  return `op-list-${props.type}`
})

// GSAP animation handlers
function getInitialPosition() {
  const distance = 20
  switch (props.direction) {
    case 'up': return { y: -distance }
    case 'down': return { y: distance }
    case 'left': return { x: -distance }
    case 'right': return { x: distance }
    default: return { y: distance }
  }
}

function onBeforeEnter(el) {
  if (!props.useGsap) return
  
  const pos = getInitialPosition()
  gsap.set(el, {
    opacity: 0,
    scale: props.type === 'scale' ? 0.9 : 1,
    ...pos
  })
}

function onEnter(el, done) {
  if (!props.useGsap) {
    done()
    return
  }

  const delay = props.type === 'stagger' 
    ? el.dataset.index * props.staggerDelay 
    : 0

  gsap.to(el, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: props.duration,
    delay,
    ease: props.type === 'scale' ? 'back.out(1.7)' : 'power3.out',
    onComplete: done
  })
}

function onLeave(el, done) {
  if (!props.useGsap) {
    done()
    return
  }

  const pos = getInitialPosition()
  
  gsap.to(el, {
    opacity: 0,
    scale: props.type === 'scale' ? 0.9 : 1,
    ...pos,
    duration: props.duration * 0.7,
    ease: 'power2.in',
    onComplete: done
  })
}
</script>

<style scoped>
.op-transition-list {
  position: relative;
}

/* CSS-only fallback animations */

/* Fade */
.op-list-fade-enter-active,
.op-list-fade-leave-active {
  transition: opacity 0.3s ease;
}

.op-list-fade-enter-from,
.op-list-fade-leave-to {
  opacity: 0;
}

/* Fade Slide */
.op-list-fade-slide-enter-active,
.op-list-fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.op-list-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.op-list-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.op-list-fade-slide-leave-active {
  position: absolute;
  width: 100%;
}

/* Scale */
.op-list-scale-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.op-list-scale-leave-active {
  transition: all 0.25s ease;
}

.op-list-scale-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.op-list-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.op-list-scale-leave-active {
  position: absolute;
  width: 100%;
}

/* Move animation for reordering */
.op-list-fade-slide-move,
.op-list-scale-move,
.op-list-fade-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
