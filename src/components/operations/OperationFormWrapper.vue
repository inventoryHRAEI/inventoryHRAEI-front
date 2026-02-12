<template>
  <div class="operation-form-wrapper" :class="[`type-${type}`, { 'is-loading': loading }]">
    <!-- Loading Overlay -->
    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="loader-content">
          <div class="loader-spinner">
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
            </svg>
          </div>
          <span class="loader-text">{{ loadingText }}</span>
        </div>
      </div>
    </transition>
    
    <!-- Header -->
    <header class="form-header">
      <div class="header-left">
        <button 
          v-if="showBack"
          type="button" 
          class="btn-back"
          @click="$emit('back')"
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        
        <div class="title-group">
          <div class="type-badge" :class="`badge-${type}`">
            <component :is="typeIcon" class="badge-icon" />
            <span>{{ typeLabel }}</span>
          </div>
          <h1 class="form-title">{{ title }}</h1>
          <p v-if="subtitle" class="form-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <slot name="header-actions" />
      </div>
    </header>
    
    <!-- Form Content -->
    <div class="form-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  type: { 
    type: String, 
    default: 'entrada',
    validator: (v) => ['entrada', 'salida', 'resguardo', 'servicio'].includes(v)
  },
  title: { type: String, default: 'Nueva Orden' },
  subtitle: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Cargando...' },
  showBack: { type: Boolean, default: true }
})

defineEmits(['back'])

const typeConfig = {
  entrada: { label: 'Entrada', icon: ArrowDownTrayIcon },
  salida: { label: 'Salida', icon: ArrowUpTrayIcon },
  resguardo: { label: 'Resguardo', icon: ShieldCheckIcon },
  servicio: { label: 'Servicio', icon: WrenchScrewdriverIcon }
}

const typeLabel = computed(() => typeConfig[props.type]?.label || 'Orden')
const typeIcon = computed(() => typeConfig[props.type]?.icon || ArrowDownTrayIcon)
</script>

<style scoped>
.operation-form-wrapper {
  position: relative;
  min-height: 400px;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: inherit;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loader-spinner {
  width: 48px;
  height: 48px;
}

.loader-spinner svg {
  width: 100%;
  height: 100%;
  animation: rotate 1.5s linear infinite;
}

.loader-spinner circle {
  stroke: rgba(59, 130, 246, 0.3);
  stroke-dasharray: 125;
  stroke-dashoffset: 0;
}

.loader-spinner svg::after {
  content: '';
}

.loader-spinner circle:last-child {
  stroke: #3b82f6;
  stroke-dashoffset: 100;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dashoffset: 125; }
  50% { stroke-dashoffset: 30; }
  100% { stroke-dashoffset: 125; }
}

.loader-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
}

/* Header */
.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-back:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.95);
  transform: translateX(-2px);
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.badge-entrada {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-salida {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-resguardo {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-servicio {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.form-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: rgba(255,255,255,0.95);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.form-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.55);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px 0;
  }
  
  .header-left {
    width: 100%;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .form-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .btn-back {
    width: 40px;
    height: 40px;
  }
  
  .form-title {
    font-size: 1.15rem;
  }
}
</style>
