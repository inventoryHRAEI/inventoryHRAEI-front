<template>
  <div class="topbar-container">
    <!-- Animated particle background -->
    <div class="particles-wrapper">
      <div 
        v-for="(particle, index) in particles" 
        :key="index"
        class="particle"
        :style="{
          '--particle-x': particle.x + '%',
          '--particle-y': particle.y + '%',
          '--particle-size': particle.size + 'px',
          '--particle-duration': particle.duration + 's',
          '--particle-delay': particle.delay + 's',
          '--particle-opacity': particle.opacity,
        }"
      ></div>
    </div>

    <!-- Topbar content -->
    <header class="topbar glass">
      <div class="topbar-left">
        <slot name="icon"></slot>
        <h2 class="topbar-title">
          <slot name="title">Dashboard</slot>
        </h2>
      </div>
      <div class="topbar-right">
        <slot name="actions"></slot>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const particles = ref([])

onMounted(() => {
  // Generar partículas aleatorias
  const particleCount = 15
  
  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.1,
    })
  }
})
</script>

<style scoped>
.topbar-container {
  position: relative;
  width: 100%;
}

/* Particles background */
.particles-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 16px;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(
    circle,
    rgba(99, 179, 237, var(--particle-opacity)),
    rgba(125, 211, 252, calc(var(--particle-opacity) * 0.5))
  );
  width: var(--particle-size);
  height: var(--particle-size);
  border-radius: 50%;
  left: var(--particle-x);
  top: var(--particle-y);
  animation: particle-float var(--particle-duration) ease-in-out var(--particle-delay) infinite;
  filter: blur(0.5px);
  box-shadow: 0 0 var(--particle-size) rgba(99, 179, 237, calc(var(--particle-opacity) * 0.8));
}

/* Topbar styling */
.topbar-container {
  padding: 16px;
  margin-bottom: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  padding: 16px 24px;
  position: relative;
  z-index: 1;
  background: linear-gradient(
    135deg,
    rgba(15, 25, 45, 0.7),
    rgba(25, 40, 70, 0.7)
  );
  border: 1.5px solid rgba(99, 179, 237, 0.2);
  backdrop-filter: blur(15px) saturate(140%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.topbar:hover {
  border-color: rgba(99, 179, 237, 0.4);
  box-shadow: 0 12px 40px rgba(99, 179, 237, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.topbar-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a8d5ff, #7dd3fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.topbar:hover .topbar-title {
  font-size: 1.55rem;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Glass effect */
.glass {
  background: linear-gradient(135deg, rgba(15, 25, 45, 0.8), rgba(25, 40, 70, 0.8));
  border: 1.5px solid rgba(99, 179, 237, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px) saturate(140%);
}

/* Particle animation */
@keyframes particle-float {
  0% {
    transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity);
  }
  50% {
    transform: translateY(-40px) translateX(20px) scale(1.2) rotate(180deg);
    opacity: var(--particle-opacity);
  }
  90% {
    opacity: var(--particle-opacity);
  }
  100% {
    transform: translateY(-80px) translateX(-20px) scale(0.8) rotate(360deg);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .topbar {
    padding: 12px 16px;
  }

  .topbar-title {
    font-size: 1.2rem;
  }

  .topbar-left {
    gap: 8px;
  }

  .topbar-right {
    gap: 8px;
  }
}

/* High contrast mode */
@media (prefers-contrast: more) {
  .topbar {
    border: 2px solid rgba(99, 179, 237, 0.4);
  }

  .particle {
    filter: blur(1px);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    opacity: calc(var(--particle-opacity) * 0.3);
  }
}
</style>
