<template>
  <div class="form-summary" :class="{ 'is-expanded': isExpanded }">
    <button type="button" class="summary-toggle" @click="isExpanded = !isExpanded">
      <div class="toggle-content">
        <div class="summary-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-label">Items agregados</span>
          <span class="summary-count">{{ items.length }}</span>
        </div>
      </div>
      <svg 
        class="chevron-icon" 
        :class="{ rotated: isExpanded }"
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <transition name="expand">
      <div v-if="isExpanded" class="summary-content">
        <div v-if="items.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{{ emptyText }}</p>
        </div>
        
        <div v-else class="items-list">
          <div 
            v-for="(item, index) in items" 
            :key="index" 
            class="summary-item"
          >
            <div class="item-badge">{{ index + 1 }}</div>
            <div class="item-details">
              <span class="item-type">{{ item.tipo || item.type || 'Item' }}</span>
              <span class="item-name">{{ item.nombre || item.descripcion || item.name || '-' }}</span>
              <span v-if="item.cantidad" class="item-qty">x{{ item.cantidad }}</span>
            </div>
            <button 
              v-if="!readonly"
              type="button" 
              class="item-remove" 
              @click="$emit('remove', index)"
              aria-label="Eliminar item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'No hay items agregados' },
  readonly: { type: Boolean, default: false }
})

defineEmits(['remove'])

const isExpanded = ref(false)
</script>

<style scoped>
.form-summary {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-summary.is-expanded {
  background: rgba(255,255,255,0.05);
}

.summary-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.summary-toggle:hover {
  background: rgba(255,255,255,0.03);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
  color: #60a5fa;
}

.summary-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.summary-label {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.55);
  font-weight: 500;
}

.summary-count {
  font-size: 1.25rem;
  font-weight: 800;
  color: rgba(255,255,255,0.95);
}

.chevron-icon {
  color: rgba(255,255,255,0.4);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.summary-content {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: rgba(255,255,255,0.4);
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
}

.item-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.item-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.06);
  padding: 3px 8px;
  border-radius: 4px;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-qty {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4ade80;
}

.item-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.item-remove:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}

/* Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 400px;
}
</style>
