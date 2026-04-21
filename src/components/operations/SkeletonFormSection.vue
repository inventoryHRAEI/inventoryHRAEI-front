<template>
  <div class="skeleton-form-section" :class="[variant, { 'is-loading': loading }]">
    <!-- Header skeleton -->
    <div class="skeleton-header">
      <div class="skeleton-icon-wrapper">
        <div class="skeleton-icon pulse"></div>
      </div>
      <div class="skeleton-title-group">
        <div class="skeleton-title pulse"></div>
        <div class="skeleton-subtitle pulse"></div>
      </div>
      <div v-if="showAction" class="skeleton-action pulse"></div>
    </div>
    
    <!-- Fields skeleton -->
    <div class="skeleton-body" :class="{ collapsed: !showFields }">
      <div class="skeleton-fields" :class="`cols-${columns}`">
        <div 
          v-for="field in computedFields" 
          :key="field.id" 
          class="skeleton-field"
          :class="{ 'full-width': field.fullWidth }"
        >
          <div class="skeleton-label pulse"></div>
          <div 
            class="skeleton-input pulse" 
            :class="{ 
              'is-textarea': field.type === 'textarea',
              'is-select': field.type === 'select'
            }"
          ></div>
          <div v-if="field.hint" class="skeleton-hint pulse"></div>
        </div>
      </div>
      
      <!-- Optional items section -->
      <div v-if="showItems" class="skeleton-items">
        <div class="skeleton-items-header">
          <div class="skeleton-badge pulse"></div>
          <div class="skeleton-items-title pulse"></div>
        </div>
        <div class="skeleton-item-cards">
          <div v-for="n in itemCount" :key="n" class="skeleton-item-card">
            <div class="skeleton-item-header">
              <div class="skeleton-item-badge pulse"></div>
              <div class="skeleton-item-type pulse"></div>
            </div>
            <div class="skeleton-item-content">
              <div class="skeleton-item-line pulse"></div>
              <div class="skeleton-item-line short pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: true },
  fieldCount: { type: Number, default: 4 },
  columns: { type: Number, default: 2 },
  variant: { type: String, default: 'default' }, // default, compact, expanded
  showFields: { type: Boolean, default: true },
  showAction: { type: Boolean, default: false },
  showItems: { type: Boolean, default: false },
  itemCount: { type: Number, default: 2 },
  fields: { type: Array, default: null } // Custom fields config
})

const computedFields = computed(() => {
  if (props.fields) return props.fields
  
  // Generate default fields based on count
  return Array.from({ length: props.fieldCount }, (_, i) => ({
    id: i + 1,
    type: i === props.fieldCount - 1 && props.fieldCount > 3 ? 'textarea' : 'input',
    fullWidth: i === props.fieldCount - 1 && props.fieldCount > 3,
    hint: i === 0
  }))
})
</script>

<style scoped>
.skeleton-form-section {
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.03) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.skeleton-form-section.compact {
  border-radius: 14px;
}

.skeleton-form-section.expanded {
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.05) 100%
  );
}

/* Header */
.skeleton-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-icon-wrapper {
  flex-shrink: 0;
}

.skeleton-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
}

.skeleton-title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.skeleton-title {
  height: 18px;
  width: 50%;
  max-width: 200px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
}

.skeleton-subtitle {
  height: 14px;
  width: 70%;
  max-width: 280px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}

.skeleton-action {
  width: 80px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
}

/* Body */
.skeleton-body {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.skeleton-body.collapsed {
  max-height: 0;
  opacity: 0;
}

/* Fields */
.skeleton-fields {
  display: grid;
  gap: 20px;
  padding: 24px;
}

.skeleton-fields.cols-1 {
  grid-template-columns: 1fr;
}

.skeleton-fields.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.skeleton-fields.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.skeleton-fields.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.skeleton-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-field.full-width {
  grid-column: 1 / -1;
}

.skeleton-label {
  height: 14px;
  width: 40%;
  min-width: 70px;
  max-width: 120px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.skeleton-input {
  height: 50px;
  width: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.skeleton-input.is-textarea {
  height: 140px;
}

.skeleton-input.is-select {
  position: relative;
}

.skeleton-input.is-select::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.skeleton-hint {
  height: 12px;
  width: 60%;
  max-width: 200px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
}

/* Items section */
.skeleton-items {
  padding: 0 24px 24px;
}

.skeleton-items-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
}

.skeleton-items-title {
  height: 16px;
  width: 140px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-item-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item-card {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 16px;
}

.skeleton-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-item-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%);
}

.skeleton-item-type {
  height: 24px;
  width: 100px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
}

.skeleton-item-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-item-line {
  height: 14px;
  width: 100%;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}

.skeleton-item-line.short {
  width: 60%;
}

/* Pulse animation - enhanced */
.pulse {
  position: relative;
  overflow: hidden;
}

.pulse::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.12) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-fields.cols-2,
  .skeleton-fields.cols-3,
  .skeleton-fields.cols-4 {
    grid-template-columns: 1fr;
  }
  
  .skeleton-header {
    padding: 16px 20px;
  }
  
  .skeleton-fields {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .skeleton-icon {
    width: 38px;
    height: 38px;
  }
  
  .skeleton-title {
    height: 16px;
  }
}
</style>
