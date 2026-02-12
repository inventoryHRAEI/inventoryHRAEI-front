<template>
  <div 
    class="wizard-step-card" 
    :class="[sizeClass, { 'is-collapsible': collapsible, 'is-collapsed': isCollapsed }]"
    ref="cardRef"
  >
    <!-- Card Header -->
    <header 
      class="card-header" 
      :class="{ clickable: collapsible }"
      @click="collapsible && toggleCollapse()"
    >
      <div class="header-icon" :style="{ '--icon-color': iconColor }">
        <slot name="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </slot>
      </div>
      
      <div class="header-content">
        <h3 class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>

      <div class="header-actions">
        <slot name="actions" />
        
        <span v-if="badge" class="header-badge" :class="badgeVariant">
          {{ badge }}
        </span>
        
        <button 
          v-if="collapsible" 
          type="button" 
          class="collapse-btn"
          :aria-expanded="!isCollapsed"
        >
          <svg 
            width="20" height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            class="chevron"
            :class="{ rotated: !isCollapsed }"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Card Body with collapse animation -->
    <Transition name="collapse" @enter="onEnter" @leave="onLeave">
      <div v-show="!isCollapsed" class="card-body-wrapper">
        <div class="card-body">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  iconColor: { type: String, default: '#3b82f6' },
  badge: { type: String, default: '' },
  badgeVariant: { type: String, default: 'neutral' }, // neutral, success, warning, error
  size: { type: String, default: 'normal' }, // compact, normal, large
  collapsible: { type: Boolean, default: false },
  defaultCollapsed: { type: Boolean, default: false }
})

const cardRef = ref(null)
const isCollapsed = ref(props.defaultCollapsed)

const sizeClass = computed(() => `size-${props.size}`)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

// GSAP animations for smooth collapse
function onEnter(el, done) {
  gsap.fromTo(el, 
    { height: 0, opacity: 0 },
    { 
      height: 'auto', 
      opacity: 1, 
      duration: 0.35,
      ease: 'power2.out',
      onComplete: done
    }
  )
}

function onLeave(el, done) {
  gsap.to(el, {
    height: 0,
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done
  })
}

// Initial animation on mount
onMounted(() => {
  if (cardRef.value) {
    gsap.from(cardRef.value, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.out'
    })
  }
})

defineExpose({ isCollapsed, toggleCollapse })
</script>

<style scoped>
.wizard-step-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: visible; /* allow popovers/dropdowns to escape card */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tall variation for cards that need more vertical space */
.wizard-step-card.tall .card-body {
  min-height: 260px;
  padding-bottom: 40px;
}

.wizard-step-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

/* Sizes */
.size-compact .card-body {
  padding: 16px 20px;
}

.size-normal .card-body {
  padding: 24px;
}

.size-large .card-body {
  padding: 32px;
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s;
}

.card-header.clickable {
  cursor: pointer;
}

.card-header.clickable:hover {
  background: rgba(255, 255, 255, 0.03);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--icon-color, #3b82f6) 15%, transparent);
  color: var(--icon-color, #3b82f6);
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: -0.01em;
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-badge {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.header-badge.neutral {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.header-badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.header-badge.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.header-badge.error {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.chevron {
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* Body */
.card-body-wrapper {
  overflow: visible;
}

.card-body {
  padding: 24px;
}

/* Collapsed state */
.is-collapsed .card-header {
  border-bottom-color: transparent;
}

/* Focus states */
.wizard-step-card:focus-within {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
