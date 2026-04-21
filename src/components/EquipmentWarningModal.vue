<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="warning-modal-overlay" @click.self="handleCancel">
        <div class="warning-modal" :class="modalClass">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-icon" :class="iconClass">
              <svg v-if="hasBlockingWarnings" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div class="header-content">
              <h3 class="modal-title">{{ title }}</h3>
              <p class="modal-subtitle">{{ subtitle }}</p>
            </div>
            <button class="close-btn" @click="handleCancel" aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Warnings List -->
          <div class="warnings-container">
            <TransitionGroup name="warning-list" tag="div" class="warnings-list">
              <div
                v-for="(warning, index) in filteredWarnings"
                :key="index"
                class="warning-item"
                :class="`severity-${warning.severity}`"
              >
                <div class="warning-icon">
                  <svg v-if="warning.severity === 'high'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <svg v-else-if="warning.severity === 'medium'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div class="warning-content">
                  <span class="warning-message">{{ warning.message }}</span>
                  <span v-if="warning.type" class="warning-type">{{ getTypeLabel(warning.type) }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- Info Message -->
          <div v-if="showInfoMessage" class="info-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>Los equipos funcionales no bloquean la operación.</span>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <button 
              v-if="hasBlockingWarnings" 
              class="btn btn-cancel" 
              @click="handleCancel"
            >
              Cancelar
            </button>
            <button 
              class="btn" 
              :class="hasBlockingWarnings ? 'btn-confirm' : 'btn-ok'"
              @click="handleConfirm"
            >
              {{ hasBlockingWarnings ? 'Añadir de todos modos' : 'Entendido' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  warnings: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Advertencias'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Filtrar solo las advertencias relevantes
const filteredWarnings = computed(() => {
  return props.warnings.filter(w => w.severity === 'high' || w.severity === 'medium')
})

// Determinar si hay advertencias bloqueantes
const hasBlockingWarnings = computed(() => {
  return props.warnings.some(w => w.severity === 'high' && w.allowOverride)
})

// Determinar la clase del modal según el tipo de advertencia
const modalClass = computed(() => {
  if (hasBlockingWarnings.value) return 'modal-critical'
  if (props.warnings.some(w => w.severity === 'medium')) return 'modal-warning'
  return 'modal-info'
})

// Determinar la clase del icono
const iconClass = computed(() => {
  if (hasBlockingWarnings.value) return 'icon-critical'
  if (props.warnings.some(w => w.severity === 'medium')) return 'icon-warning'
  return 'icon-info'
})

// Mostrar mensaje de información
const showInfoMessage = computed(() => {
  return !hasBlockingWarnings.value && filteredWarnings.value.length > 0
})

// Obtener etiqueta del tipo de advertencia
function getTypeLabel(type) {
  const labels = {
    'mantenimiento': 'Mantenimiento',
    'funcional': 'Estado Funcional',
    'condiciones': 'Condiciones del Equipo',
    'servicio': 'Estado de Servicio',
    'caducidad': 'Caducidad'
  }
  return labels[type] || type
}

// Manejar confirmación
function handleConfirm() {
  emit('update:modelValue', false)
  emit('confirm')
}

// Manejar cancelación
function handleCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped>
.warning-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.warning-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-critical {
  border-top: 4px solid #dc2626;
}

.modal-warning {
  border-top: 4px solid #f59e0b;
}

.modal-info {
  border-top: 4px solid #3b82f6;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-critical {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.warnings-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #f9fafb;
}

.warning-item.severity-high {
  background: rgba(220, 38, 38, 0.05);
  border-left: 3px solid #dc2626;
}

.warning-item.severity-medium {
  background: rgba(245, 158, 11, 0.05);
  border-left: 3px solid #f59e0b;
}

.warning-item.severity-low {
  background: rgba(34, 197, 94, 0.05);
  border-left: 3px solid #22c55e;
}

.warning-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.severity-high .warning-icon {
  color: #dc2626;
}

.severity-medium .warning-icon {
  color: #f59e0b;
}

.severity-low .warning-icon {
  color: #22c55e;
}

.warning-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-message {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.warning-type {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #f9fafb;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-confirm {
  background: #dc2626;
  color: white;
}

.btn-confirm:hover {
  background: #b91c1c;
}

.btn-ok {
  background: #3b82f6;
  color: white;
}

.btn-ok:hover {
  background: #2563eb;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .warning-modal,
.modal-leave-to .warning-modal {
  transform: scale(0.95) translateY(20px);
}

.warning-list-enter-active,
.warning-list-leave-active {
  transition: all 0.3s ease;
}

.warning-list-enter-from,
.warning-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.warning-list-move {
  transition: transform 0.3s ease;
}
</style>
