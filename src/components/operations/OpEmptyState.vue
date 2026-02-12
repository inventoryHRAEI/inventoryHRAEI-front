<template>
  <div class="op-empty-state" :class="[variant, { 'is-compact': compact }]">
    <div class="empty-icon-wrapper">
      <OpIcon 
        :name="icon" 
        :size="compact ? 'xl' : '2xl'" 
        :color="iconColor"
        class="empty-icon"
      />
      <div v-if="showPulse" class="icon-pulse"></div>
    </div>
    
    <div class="empty-content">
      <h4 class="empty-title">{{ title }}</h4>
      <p v-if="description" class="empty-description">{{ description }}</p>
      
      <div v-if="$slots.default" class="empty-slot">
        <slot />
      </div>
    </div>
    
    <div v-if="actionText" class="empty-action">
      <button 
        class="btn-action"
        :class="actionVariant"
        @click="$emit('action')"
      >
        <OpIcon v-if="actionIcon" :name="actionIcon" size="sm" />
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import OpIcon from './OpIcon.vue'

defineProps({
  icon: {
    type: String,
    default: 'inbox'
  },
  iconColor: {
    type: String,
    default: 'muted'
  },
  title: {
    type: String,
    default: 'No hay elementos'
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: 'plus'
  },
  actionVariant: {
    type: String,
    default: 'primary' // primary, secondary, ghost
  },
  variant: {
    type: String,
    default: 'default' // default, card, inline
  },
  compact: {
    type: Boolean,
    default: false
  },
  showPulse: {
    type: Boolean,
    default: false
  }
})

defineEmits(['action'])
</script>

<style scoped>
.op-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  gap: 16px;
}

.op-empty-state.is-compact {
  padding: 32px 20px;
  gap: 12px;
}

/* Card variant */
.op-empty-state.card {
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.06) 0%, 
    rgba(255, 255, 255, 0.02) 100%
  );
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}

/* Inline variant */
.op-empty-state.inline {
  flex-direction: row;
  padding: 20px;
  gap: 16px;
  text-align: left;
}

.op-empty-state.inline .empty-content {
  flex: 1;
}

/* Icon wrapper */
.empty-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.is-compact .empty-icon-wrapper {
  width: 56px;
  height: 56px;
}

.inline .empty-icon-wrapper {
  width: 48px;
  height: 48px;
}

.empty-icon {
  opacity: 0.4;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.op-empty-state:hover .empty-icon {
  opacity: 0.6;
  transform: scale(1.05);
}

/* Pulse effect */
.icon-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.2;
  animation: empty-pulse 2s ease-in-out infinite;
}

@keyframes empty-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0;
  }
}

/* Content */
.empty-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.is-compact .empty-title {
  font-size: 0.95rem;
}

.empty-description {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 320px;
  line-height: 1.5;
}

.is-compact .empty-description {
  font-size: 0.82rem;
}

.empty-slot {
  margin-top: 8px;
}

/* Action button */
.empty-action {
  margin-top: 8px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-action.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-action.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.btn-action.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-action.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-action.ghost {
  background: transparent;
  color: #3b82f6;
}

.btn-action.ghost:hover {
  background: rgba(59, 130, 246, 0.1);
}

/* Responsive */
@media (max-width: 480px) {
  .op-empty-state {
    padding: 32px 16px;
  }
  
  .op-empty-state.inline {
    flex-direction: column;
    text-align: center;
  }
  
  .empty-icon-wrapper {
    width: 64px;
    height: 64px;
  }
}
</style>
