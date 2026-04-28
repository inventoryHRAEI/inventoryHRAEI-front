<template>
  <div class="premium-topbar-wrapper">
    <!-- Animated background grid -->
    <div v-if="showGridBg" class="grid-background"></div>

    <!-- Floating particles -->
    <div class="particles-container">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="floating-particle"
        :style="getParticleStyle(particle)"
      ></div>
    </div>

    <!-- Glow orbs (background effect) -->
    <div v-if="showGlowOrbs" class="glow-orb orb-1"></div>
    <div v-if="showGlowOrbs" class="glow-orb orb-2"></div>

    <!-- Topbar itself -->
    <header class="premium-topbar">
      <!-- Left section -->
      <div class="topbar-left">
        <div v-if="$slots.icon" class="topbar-icon">
          <slot name="icon"></slot>
        </div>
        <div class="topbar-title-wrapper">
          <h1 class="topbar-title">
            <slot name="title">Dashboard</slot>
          </h1>
          <p v-if="$slots.subtitle" class="topbar-subtitle">
            <slot name="subtitle"></slot>
          </p>
        </div>
      </div>

      <!-- Center section (searchbar or info) -->
      <div v-if="$slots.center" class="topbar-center">
        <slot name="center"></slot>
      </div>

      <!-- Right section (actions) -->
      <div class="topbar-right">
        <slot name="actions"></slot>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  particleCount: { type: Number, default: 20 },
  particleColor: { type: String, default: '#63b3ed' },
  showGridBg: { type: Boolean, default: false },
  showGlowOrbs: { type: Boolean, default: true },
  animationIntensity: { type: String, default: 'medium' }, // light, medium, intense
  variant: { type: String, default: 'default' }, // default, minimal, glass
})

const particles = ref([])

const getParticleStyle = (particle) => ({
  '--px': particle.x + '%',
  '--py': particle.y + '%',
  '--psize': particle.size + 'px',
  '--pduration': particle.duration + 's',
  '--pdelay': particle.delay + 's',
  '--popacity': particle.opacity,
  '--pcolor': particle.color,
})

const intensitySettings = computed(() => ({
  light: { duration: [2, 4], delay: [0, 1], count: 8 },
  medium: { duration: [4, 12], delay: [0, 2], count: 20 },
  intense: { duration: [6, 15], delay: [0, 3], count: 30 },
}[props.animationIntensity]))

onMounted(() => {
  const colorVariations = [
    props.particleColor,
    adjustColor(props.particleColor, 20),
    adjustColor(props.particleColor, -20),
  ]

  for (let i = 0; i < props.particleCount; i++) {
    const [minDur, maxDur] = intensitySettings.value.duration
    const [minDelay, maxDelay] = intensitySettings.value.delay

    particles.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 1,
      duration: Math.random() * (maxDur - minDur) + minDur,
      delay: Math.random() * (maxDelay - minDelay) + minDelay,
      opacity: Math.random() * 0.6 + 0.1,
      color: colorVariations[Math.floor(Math.random() * colorVariations.length)],
    })
  }
})

const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const r = Math.max(0, Math.min(255, (num >> 16) + amt))
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1)
}
</script>

<style scoped>
.premium-topbar-wrapper {
  position: relative;
  width: 100%;
  padding: 20px;
  margin-bottom: 20px;
}

/* Grid background */
.grid-background {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(99, 179, 237, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 179, 237, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

/* Particles container */
.particles-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 20px;
  pointer-events: none;
  z-index: 1;
}

.floating-particle {
  position: absolute;
  left: var(--px);
  top: var(--py);
  width: var(--psize);
  height: var(--psize);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    var(--pcolor),
    rgba(99, 179, 237, calc(var(--popacity) * 0.3))
  );
  box-shadow: 0 0 calc(var(--psize) * 2) var(--pcolor);
  opacity: var(--popacity);
  animation: particle-move var(--pduration) ease-in-out var(--pdelay) infinite;
  filter: blur(0.5px);
}

/* Glow orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 1;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 179, 237, 0.6), transparent);
  top: -50px;
  right: -100px;
  animation: float 12s ease-in-out infinite;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent);
  bottom: -50px;
  left: -50px;
  animation: float 15s ease-in-out infinite;
  animation-delay: 3s;
}

/* Topbar */
.premium-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 28px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    rgba(15, 25, 45, 0.85),
    rgba(25, 40, 70, 0.85)
  );
  border: 1.5px solid rgba(99, 179, 237, 0.25);
  backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
              inset 0 1px 2px rgba(255, 255, 255, 0.15);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.premium-topbar:hover {
  border-color: rgba(99, 179, 237, 0.5);
  box-shadow: 0 16px 50px rgba(99, 179, 237, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

/* Left section */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.topbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 8px;
  background: linear-gradient(135deg, rgba(99, 179, 237, 0.2), rgba(99, 179, 237, 0.1));
  border: 1px solid rgba(99, 179, 237, 0.3);
  border-radius: 14px;
  color: #a8d5ff;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.premium-topbar:hover .topbar-icon {
  background: linear-gradient(135deg, rgba(99, 179, 237, 0.3), rgba(99, 179, 237, 0.15));
  border-color: rgba(99, 179, 237, 0.6);
  box-shadow: 0 0 20px rgba(99, 179, 237, 0.2);
}

.topbar-title-wrapper {
  flex: 1;
  min-width: 0;
}

.topbar-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a8d5ff, #7dd3fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
  letter-spacing: -0.5px;
}

.premium-topbar:hover .topbar-title {
  font-size: 1.65rem;
  text-shadow: 0 0 30px rgba(99, 179, 237, 0.2);
}

.topbar-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 400;
  transition: color 0.3s ease;
}

.premium-topbar:hover .topbar-subtitle {
  color: #cbd5e1;
}

/* Center section */
.topbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 400px;
}

/* Right section */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Animations */
@keyframes particle-move {
  0% {
    transform: translateY(0) translateX(0) scale(1) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: var(--popacity);
  }
  50% {
    transform: translateY(-50px) translateX(30px) scale(1.3) rotate(180deg);
    opacity: var(--popacity);
  }
  90% {
    opacity: var(--popacity);
  }
  100% {
    transform: translateY(-100px) translateX(-30px) scale(0.5) rotate(360deg);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-20px) translateX(10px);
  }
  66% {
    transform: translateY(20px) translateX(-10px);
  }
}

/* Variants */
.premium-topbar.minimal {
  background: rgba(15, 25, 45, 0.5);
  border-color: rgba(99, 179, 237, 0.1);
  backdrop-filter: blur(10px);
}

.premium-topbar.glass {
  background: linear-gradient(135deg, rgba(10, 20, 40, 0.9), rgba(20, 30, 60, 0.9));
  border-color: rgba(99, 179, 237, 0.3);
  backdrop-filter: blur(25px) saturate(150%);
}

/* Responsive */
@media (max-width: 1024px) {
  .premium-topbar {
    gap: 12px;
    padding: 16px 20px;
  }

  .topbar-center {
    display: none;
  }

  .topbar-left {
    gap: 12px;
  }

  .topbar-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 768px) {
  .premium-topbar-wrapper {
    padding: 12px;
    margin-bottom: 12px;
  }

  .premium-topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
    gap: 12px;
  }

  .topbar-left {
    width: 100%;
  }

  .topbar-icon {
    width: 40px;
    height: 40px;
  }

  .topbar-title {
    font-size: 1.2rem;
  }

  .topbar-right {
    width: 100%;
    justify-content: flex-end;
  }

  .particles-container {
    display: none;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .floating-particle,
  .orb-1,
  .orb-2 {
    animation: none;
  }

  .premium-topbar {
    transition: none;
  }

  .topbar-icon,
  .topbar-title {
    transition: none;
  }
}

@media (prefers-contrast: more) {
  .premium-topbar {
    border: 2px solid rgba(99, 179, 237, 0.5);
  }

  .floating-particle {
    box-shadow: 0 0 calc(var(--psize) * 3) var(--pcolor);
  }
}

/* Color scheme */
@media (prefers-color-scheme: light) {
  .premium-topbar {
    background: linear-gradient(135deg, rgba(240, 247, 255, 0.9), rgba(225, 240, 255, 0.9));
    border-color: rgba(99, 179, 237, 0.3);
  }

  .topbar-title {
    background: linear-gradient(135deg, #3b82f6, #0284c7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .topbar-subtitle {
    color: #64748b;
  }
}
</style>
