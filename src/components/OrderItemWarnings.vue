<template>
  <div v-if="warnings.length > 0" class="item-warnings">
    <!-- Warning header with count -->
    <div class="warnings-header" :class="summaryClass">
      <div class="header-left">
        <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span class="header-text">
          {{ warnings.length }} advertencia{{ warnings.length !== 1 ? 's' : '' }}
        </span>
      </div>
      <button
        v-if="collapsible"
        class="toggle-btn"
        @click="isExpanded = !isExpanded"
        :aria-expanded="isExpanded"
      >
        <svg :style="{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>

    <!-- Warnings list -->
    <transition-group v-if="isExpanded" name="warning-list" tag="div" class="warnings-list">
      <div
        v-for="(warning, index) in warnings"
        :key="index"
        class="warning-item"
        :class="`severity-${warning.severity}`"
      >
        <div class="warning-content">
          <span class="warning-message">{{ warning.message }}</span>
          <span v-if="showType" class="warning-type">{{ warning.type }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  warnings: {
    type: Array,
    default: () => [],
    validator: (value) => Array.isArray(value)
  },
  collapsible: {
    type: Boolean,
    default: true
  },
  expanded: {
    type: Boolean,
    default: true
  },
  showType: {
    type: Boolean,
    default: false
  }
})

const isExpanded = ref(props.expanded)

const summaryClass = computed(() => {
  const highCount = props.warnings.filter(w => w.severity === 'high').length
  if (highCount > 0) return 'severity-high'

  const mediumCount = props.warnings.filter(w => w.severity === 'medium').length
  if (mediumCount > 0) return 'severity-medium'

  return 'severity-low'
})
</script>

<style scoped>
.item-warnings {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border-left: 4px solid #dc2626;
}

.warnings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fef2f2;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #fee2e2;
  }

  &.severity-high {
    background: #fef2f2;
    border-color: #dc2626;

    .header-text {
      color: #7f1d1d;
    }
  }

  &.severity-medium {
    background: #fffbeb;
    border-color: #f59e0b;

    .header-text {
      color: #78350f;
    }
  }

  &.severity-low {
    background: #f0fdf4;
    border-color: #22c55e;

    .header-text {
      color: #166534;
    }
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.header-text {
  font-weight: 600;
  font-size: 14px;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  &:hover {
    opacity: 0.7;
  }
}

.warnings-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px 0;
}

.warning-item {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 10px;

  &:last-child {
    border-bottom: none;
  }

  &.severity-high {
    background: rgba(220, 38, 38, 0.02);
    border-left: 3px solid #dc2626;
    margin-left: 1px;
  }

  &.severity-medium {
    background: rgba(245, 158, 11, 0.02);
    border-left: 3px solid #f59e0b;
    margin-left: 1px;
  }

  &.severity-low {
    background: rgba(34, 197, 94, 0.02);
    border-left: 3px solid #22c55e;
    margin-left: 1px;
  }
}

.warning-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.warning-message {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.4;
}

.warning-type {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

/* Animations */
.warning-list-enter-active,
.warning-list-leave-active {
  transition: all 0.3s ease;
}

.warning-list-enter-from,
.warning-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.warning-list-move {
  transition: transform 0.3s ease;
}
</style>
