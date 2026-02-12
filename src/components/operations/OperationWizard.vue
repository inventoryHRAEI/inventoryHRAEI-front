<template>
  <div class="op-wizard" :class="[`op-wizard--${type}`, { 'is-submitting': isSubmitting }]">
    <!-- Progress Header -->
    <header class="wizard-header">
      <button class="btn-back" @click="$emit('back')" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div class="wizard-meta">
        <div class="wizard-type-badge" :class="`type-${type}`">
          <component :is="typeIcon" class="badge-icon" />
          <span>{{ typeLabel }}</span>
        </div>
        <h1 class="wizard-title">{{ title }}</h1>
        <p class="wizard-subtitle" v-if="folio">Folio: <strong>{{ folio }}</strong></p>
      </div>

      <!-- Header Actions Slot -->
      <div class="header-actions" v-if="$slots['header-actions']">
        <slot name="header-actions" />
      </div>

      <!-- Step Indicator -->
      <nav class="step-nav">
        <button 
          v-for="(step, idx) in steps" 
          :key="idx"
          type="button"
          class="step-item"
          :class="{ 
            'is-active': currentStep === idx,
            'is-completed': currentStep > idx,
            'is-clickable': idx <= maxReachedStep
          }"
          @click="idx <= maxReachedStep && goToStep(idx)"
          :disabled="idx > maxReachedStep"
        >
          <div class="step-circle">
            <svg v-if="currentStep > idx" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </button>
      </nav>
    </header>

    <!-- Main Content Area -->
    <main class="wizard-body">
      <div class="wizard-content">
        <TransitionGroup name="step-slide" tag="div" class="step-container">
          <slot :name="`step-${currentStep}`" :key="currentStep" />
        </TransitionGroup>
      </div>

      <!-- Sidebar Summary (visible on larger screens) -->
      <aside class="wizard-sidebar" v-if="showSidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            Resumen
          </h3>
          <slot name="summary" />
        </div>
      </aside>
    </main>

    <!-- Footer Actions -->
    <footer class="wizard-footer">
      <div class="footer-left">
        <button 
          v-if="currentStep > 0" 
          type="button" 
          class="btn btn-secondary"
          @click="prevStep"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Anterior
        </button>
      </div>
      
      <div class="footer-center">
        <div class="step-dots">
          <span 
            v-for="(_, idx) in steps" 
            :key="idx" 
            class="dot"
            :class="{ active: currentStep === idx, completed: currentStep > idx }"
          />
        </div>
      </div>

      <div class="footer-right">
        <button 
          v-if="currentStep < steps.length - 1"
          type="button"
          class="btn btn-primary"
          @click="nextStep"
          :disabled="!canProceed"
        >
          Siguiente
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button 
          v-else
          type="button"
          class="btn btn-success"
          @click="$emit('submit')"
          :disabled="!canSubmit || isSubmitting"
        >
          <svg v-if="isSubmitting" class="spinner" width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg>
          <template v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            {{ submitLabel }}
          </template>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
    validator: v => ['entrada', 'salida', 'resguardo', 'servicio'].includes(v)
  },
  title: { type: String, default: 'Nueva Orden' },
  folio: { type: String, default: '' },
  steps: {
    type: Array,
    required: true
    // [{ label: 'Datos', validate: () => true }]
  },
  initialStep: { type: Number, default: 0 },
  canProceed: { type: Boolean, default: true },
  canSubmit: { type: Boolean, default: true },
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar Orden' },
  showSidebar: { type: Boolean, default: true }
})

const emit = defineEmits(['back', 'submit', 'step-change'])

const currentStep = ref(props.initialStep)
const maxReachedStep = ref(props.initialStep)

const typeConfig = {
  entrada: { label: 'Entrada', icon: ArrowDownTrayIcon, color: '#22c55e' },
  salida: { label: 'Salida', icon: ArrowUpTrayIcon, color: '#f59e0b' },
  resguardo: { label: 'Resguardo', icon: ShieldCheckIcon, color: '#a855f7' },
  servicio: { label: 'Servicio', icon: WrenchScrewdriverIcon, color: '#3b82f6' }
}

const typeLabel = computed(() => typeConfig[props.type].label)
const typeIcon = computed(() => typeConfig[props.type].icon)

function goToStep(idx) {
  if (idx >= 0 && idx < props.steps.length && idx <= maxReachedStep.value) {
    currentStep.value = idx
    emit('step-change', idx)
  }
}

function nextStep() {
  if (currentStep.value < props.steps.length - 1 && props.canProceed) {
    currentStep.value++
    if (currentStep.value > maxReachedStep.value) {
      maxReachedStep.value = currentStep.value
    }
    emit('step-change', currentStep.value)
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    emit('step-change', currentStep.value)
  }
}

watch(() => props.initialStep, (val) => {
  currentStep.value = val
  maxReachedStep.value = Math.max(maxReachedStep.value, val)
})

defineExpose({ currentStep, goToStep, nextStep, prevStep })
</script>

<style scoped>
.op-wizard {
  --wizard-primary: #3b82f6;
  --wizard-success: #22c55e;
  --wizard-bg: #0a0f1a;
  --wizard-surface: rgba(255, 255, 255, 0.03);
  --wizard-border: rgba(255, 255, 255, 0.08);
  --wizard-text: #e2e8f0;
  --wizard-text-muted: rgba(255, 255, 255, 0.5);
  
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--wizard-bg);
  color: var(--wizard-text);
}

/* Type-specific colors */
.op-wizard--entrada { --wizard-accent: #22c55e; }
.op-wizard--salida { --wizard-accent: #f59e0b; }
.op-wizard--resguardo { --wizard-accent: #a855f7; }
.op-wizard--servicio { --wizard-accent: #3b82f6; }

/* ===== HEADER ===== */
.wizard-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 32px;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
  border-bottom: 1px solid var(--wizard-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--wizard-border);
  border-radius: 12px;
  background: var(--wizard-surface);
  color: var(--wizard-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255,255,255,0.08);
  color: var(--wizard-text);
  transform: translateX(-2px);
}

.wizard-meta {
  flex: 1;
  min-width: 0;
}

.wizard-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.wizard-type-badge.type-entrada {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.wizard-type-badge.type-salida {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.wizard-type-badge.type-resguardo {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

.wizard-type-badge.type-servicio {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.wizard-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.wizard-subtitle {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: var(--wizard-text-muted);
}

/* Step Navigation */
.step-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--wizard-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: default;
  transition: all 0.25s;
  white-space: nowrap;
}

.step-item.is-clickable {
  cursor: pointer;
}

.step-item.is-clickable:hover {
  background: var(--wizard-surface);
}

.step-item.is-active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--wizard-text);
}

.step-item.is-completed {
  color: var(--wizard-accent);
}

.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--wizard-surface);
  border: 2px solid var(--wizard-border);
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.25s;
}

.step-item.is-active .step-circle {
  background: var(--wizard-accent);
  border-color: var(--wizard-accent);
  color: white;
  box-shadow: 0 0 20px rgba(var(--wizard-accent), 0.4);
}

.step-item.is-completed .step-circle {
  background: var(--wizard-accent);
  border-color: var(--wizard-accent);
  color: white;
}

.step-label {
  display: none;
}

@media (min-width: 1024px) {
  .step-label {
    display: block;
  }
}

/* ===== BODY ===== */
.wizard-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 1200px) {
  .wizard-body {
    grid-template-columns: 1fr 340px;
  }
}

.wizard-content {
  min-width: 0;
}

.step-container {
  position: relative;
}

/* Step Transitions */
.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
  position: absolute;
  width: 100%;
}

/* ===== SIDEBAR ===== */
.wizard-sidebar {
  display: none;
}

@media (min-width: 1200px) {
  .wizard-sidebar {
    display: block;
  }
}

.sidebar-card {
  position: sticky;
  top: 120px;
  background: var(--wizard-surface);
  border: 1px solid var(--wizard-border);
  border-radius: 20px;
  padding: 24px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--wizard-text);
}

.sidebar-title svg {
  color: var(--wizard-accent);
}

/* ===== FOOTER ===== */
.wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%);
  border-top: 1px solid var(--wizard-border);
  position: sticky;
  bottom: 0;
  backdrop-filter: blur(20px);
}

.footer-left,
.footer-right {
  flex: 1;
}

.footer-right {
  display: flex;
  justify-content: flex-end;
}

.footer-center {
  display: flex;
  justify-content: center;
}

.step-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--wizard-border);
  transition: all 0.25s;
}

.dot.active {
  background: var(--wizard-accent);
  transform: scale(1.25);
}

.dot.completed {
  background: var(--wizard-accent);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--wizard-surface);
  border: 1px solid var(--wizard-border);
  color: var(--wizard-text);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.btn-primary {
  background: var(--wizard-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(var(--wizard-accent), 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.btn-success:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
}

/* Spinner */
.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .step-label {
    display: none;
  }
  
  .step-nav {
    gap: 4px;
  }
  
  .step-item {
    padding: 8px 12px;
  }
}

@media (max-width: 768px) {
  .wizard-header {
    flex-wrap: wrap;
    padding: 16px 20px;
    gap: 12px;
  }
  
  .btn-back {
    width: 40px;
    height: 40px;
  }
  
  .wizard-meta {
    flex: 1;
    min-width: 0;
  }
  
  .wizard-title {
    font-size: 1.2rem;
  }
  
  .wizard-type-badge {
    font-size: 0.7rem;
    padding: 3px 10px;
  }
  
  .step-nav {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 15, 26, 0.95);
    padding: 8px 12px;
    border-radius: 20px;
    border: 1px solid var(--wizard-border);
    z-index: 99;
    gap: 4px;
  }
  
  .step-item {
    padding: 6px 10px;
  }
  
  .step-circle {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
  
  .wizard-body {
    padding: 20px;
    padding-bottom: 100px;
  }
  
  .wizard-footer {
    padding: 16px 20px;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
  
  .footer-center {
    display: none;
  }
}

@media (max-width: 480px) {
  .wizard-header {
    padding: 12px 16px;
  }
  
  .wizard-body {
    padding: 16px;
  }
  
  .wizard-footer {
    padding: 12px 16px;
  }
  
  .btn {
    padding: 10px 14px;
    font-size: 0.8rem;
    gap: 6px;
  }
  
  .btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
