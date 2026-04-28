<template>
  <div 
    class="card-shell"
    :class="[
      shellClass,
      { 'card-shell-hover': isHovering }
    ]"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @click.stop="emit('click')"
    role="button"
    tabindex="0"
  >
    <!-- Status accent bar -->
    <div class="shell-accent" :class="`accent-${statusLower}`"></div>

    <!-- Quick info header -->
    <div class="shell-header">
      <div class="shell-number">
        <span class="label">Nº:</span>
        <span class="value">{{ item['No DE INVENTARIO'] || 'N/A' }}</span>
      </div>
      <div class="shell-status" :class="`status-${statusLower}`">
        {{ item.Estatus || 'Desconocido' }}
      </div>
    </div>

    <!-- Main content -->
    <div class="shell-body">
      <h4 class="shell-title">{{ item['EQUIPO MEDICO'] || 'Sin nombre' }}</h4>
      <p class="shell-subtitle">{{ item.Marca || 'Sin marca' }}</p>
    </div>

    <!-- Quick action hint -->
    <div class="shell-footer">
      <span class="hint-text">Click para detalles</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const isHovering = ref(false)

const statusLower = computed(() => {
  const status = String(props.item.Estatus || '').toLowerCase().trim()
  return status.includes('mantenimiento') ? 'maintenance' :
         status.includes('activo') ? 'active' :
         status.includes('inactivo') ? 'inactive' : 'unknown'
})

const shellClass = computed(() => {
  return {
    'is-expanded': props.isExpanded,
    'is-maintenance': statusLower.value === 'maintenance',
    'is-active': statusLower.value === 'active',
    'is-inactive': statusLower.value === 'inactive'
  }
})
</script>

<style scoped>
.card-shell {
  position: relative;
  padding: 14px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f3f4f6 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 110px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  will-change: transform, box-shadow;
  contain: layout style;
}

.card-shell:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-shell:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

.card-shell-hover {
  background: linear-gradient(135deg, #fafbfc 0%, #f5f6f8 100%);
}

/* Status accent bar */
.shell-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 10px 10px 0 0;
  transition: background 0.2s ease;
}

.accent-active {
  background: linear-gradient(90deg, var(--accent-active-start, #22c55e), var(--accent-active-end, #16a34a));
}

.accent-maintenance {
  background: linear-gradient(90deg, var(--accent-maintenance-start, #f59e0b), var(--accent-maintenance-end, #d97706));
}

.accent-inactive {
  background: linear-gradient(90deg, var(--accent-inactive-start, #9ca3af), var(--accent-inactive-end, #6b7280));
}

.accent-unknown {
  background: linear-gradient(90deg, var(--accent-unknown-start, #8b5cf6), var(--accent-unknown-end, #7c3aed));
}

/* Header section */
.shell-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.shell-number {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #06b6d4;
}

.shell-number .label {
  opacity: 0.7;
}

.shell-number .value {
  font-weight: 700;
  color: #0891b2;
}

.shell-status {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-active {
  background: var(--status-available-bg, rgba(34,197,94,0.15));
  color: var(--status-available-fg, #15803d);
  border: 1px solid rgba(0,0,0,0.06);
}

.status-maintenance {
  background: var(--status-maintenance-bg, rgba(245,158,11,0.15));
  color: var(--status-maintenance-fg, #92400e);
  border: 1px solid rgba(0,0,0,0.06);
}

.status-inactive {
  background: var(--status-retired-bg, rgba(107,114,128,0.15));
  color: var(--status-retired-fg, #374151);
  border: 1px solid rgba(0,0,0,0.06);
}

.status-unknown {
  background: var(--status-unknown-bg, rgba(139,92,246,0.15));
  color: var(--status-unknown-fg, #5b21b6);
  border: 1px solid rgba(0,0,0,0.06);
}

/* Body section */
.shell-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.shell-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  word-break: break-word;
}

.shell-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer section */
.shell-footer {
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  text-align: center;
}

.hint-text {
  font-size: 0.65rem;
  color: #9ca3af;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card-shell:hover .hint-text {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .card-shell {
    min-height: 100px;
    padding: 12px 10px;
  }

  .shell-title {
    font-size: 0.85rem;
  }

  .hint-text {
    display: none;
  }
}

/* For expanded state (if parent needs it) */
.is-expanded {
  background: white;
  border-color: rgba(0, 0, 0, 0.1);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .card-shell {
    transition: none;
  }

  .card-shell:hover {
    transform: none;
  }
}
</style>
