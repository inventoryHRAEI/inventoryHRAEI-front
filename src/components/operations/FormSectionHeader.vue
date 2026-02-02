<template>
  <div class="form-section-header" :class="{ 'is-collapsed': collapsed }">
    <button 
      type="button"
      class="section-toggle"
      @click="toggleCollapse"
      :aria-expanded="!collapsed"
      :aria-label="`${collapsed ? 'Expandir' : 'Contraer'} sección ${title}`"
    >
      <div class="section-header-content">
        <div class="section-icon-wrapper">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <slot name="icon">
              <circle cx="12" cy="12" r="1"></circle>
            </slot>
          </svg>
        </div>
        <div class="section-text">
          <h3 class="section-title">{{ title }}</h3>
          <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div class="section-controls">
        <span v-if="badge" class="section-badge">{{ badge }}</span>
        <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </button>

    <transition name="section-expand">
      <div v-show="!collapsed" class="section-body">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: null
  },
  badge: {
    type: String,
    default: null
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  }
})

const collapsed = ref(false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.form-section-header {
  margin-bottom: 20px;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-toggle {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.section-toggle:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.section-toggle:active {
  transform: scale(0.98);
}

.section-header-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  text-align: left;
}

.section-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(46, 221, 90, 0.2), rgba(16, 185, 129, 0.15));
  border-radius: 12px;
  flex-shrink: 0;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #2edd5a;
  filter: drop-shadow(0 0 4px rgba(46, 221, 90, 0.4));
}

.section-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}

.section-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-badge {
  background: rgba(46, 221, 90, 0.2);
  color: #a6ffcb;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(46, 221, 90, 0.3);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.is-collapsed .toggle-icon {
  transform: rotate(-180deg);
}

.section-body {
  margin-top: 16px;
  padding: 0 4px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-expand-enter-active,
.section-expand-leave-active {
  transition: all 0.3s ease;
}

.section-expand-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.section-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 640px) {
  .section-toggle {
    padding: 12px 16px;
  }

  .section-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .section-title {
    font-size: 1rem;
  }

  .section-subtitle {
    font-size: 0.8rem;
  }
}
</style>
