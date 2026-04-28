<template>
  <div class="live-summary">
    <!-- Summary Items -->
    <TransitionGroup name="summary-item" tag="div" class="summary-list">
      <div 
        v-for="item in visibleItems" 
        :key="item.key"
        class="summary-item"
        :class="[`status-${item.status || 'pending'}`]"
      >
        <div class="item-icon">
          <svg v-if="item.status === 'complete'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else-if="item.status === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span v-else class="item-number">{{ item.step || '?' }}</span>
        </div>
        
        <div class="item-content">
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.value" class="item-value">{{ item.value }}</span>
          <span v-else class="item-placeholder">{{ item.placeholder || 'Sin completar' }}</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Progreso</span>
        <span class="progress-percent">{{ progressPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercent}%` }"
          :class="progressClass"
        />
      </div>
    </div>

    <!-- Equipment Count (if applicable) -->
    <div v-if="equipmentCount !== null" class="equipment-count">
      <div class="count-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <div class="count-content">
        <span class="count-number">{{ equipmentCount }}</span>
        <span class="count-label">{{ equipmentCount === 1 ? 'Equipo' : 'Equipos' }} agregados</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="$slots.actions" class="quick-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
    // [{ key: 'x', label: 'Campo', value: 'Valor', step: 1, status: 'complete'|'pending'|'error' }]
  },
  equipmentCount: { type: Number, default: null }
})

const visibleItems = computed(() => props.items.filter(item => item.label))

const completedCount = computed(() => 
  props.items.filter(item => item.status === 'complete').length
)

const progressPercent = computed(() => {
  if (props.items.length === 0) return 0
  return Math.round((completedCount.value / props.items.length) * 100)
})

const progressClass = computed(() => {
  if (progressPercent.value === 100) return 'complete'
  if (progressPercent.value >= 50) return 'half'
  return 'start'
})
</script>

<style scoped>
.live-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Summary Items */
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-left: 3px solid transparent;
  transition: all 0.25s;
}

.summary-item.status-complete {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.summary-item.status-error {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.summary-item.status-pending {
  border-left-color: rgba(255, 255, 255, 0.1);
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-complete .item-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.status-error .item-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.status-pending .item-icon {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.4);
}

.item-number {
  font-size: 0.7rem;
  font-weight: 700;
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.item-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #e2e8f0;
  word-break: break-word;
  white-space: normal;
}

.item-placeholder {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* Progress */
.progress-section {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.progress-percent {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e2e8f0;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.start {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-fill.half {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-fill.complete {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

/* Equipment Count */
.equipment-count {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 14px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.count-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #60a5fa;
}

.count-content {
  display: flex;
  flex-direction: column;
}

.count-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1;
}

.count-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* Animations */
.summary-item-enter-active,
.summary-item-leave-active {
  transition: all 0.3s ease;
}

.summary-item-enter-from,
.summary-item-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.summary-item-move {
  transition: transform 0.3s ease;
}
</style>
