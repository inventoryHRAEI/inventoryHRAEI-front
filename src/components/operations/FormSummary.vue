<template>
  <div class="form-summary">
    <div class="summary-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
      </svg>
      <h3>Resumen de la Orden</h3>
    </div>

    <div class="summary-items">
      <div v-if="items.length === 0" class="empty-state">
        <p>No hay items agregados aún</p>
      </div>

      <transition-group v-else name="list" class="items-list">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="summary-item"
        >
          <div class="item-main">
            <div class="item-info">
              <p class="item-name">{{ item.nombre || item.name || 'Item sin nombre' }}</p>
              <p class="item-desc">{{ item.descripcion || 'Sin descripción' }}</p>
            </div>
            <div class="item-quantity">
              <span class="qty-badge">{{ item.cantidad || item.quantity || 1 }}</span>
            </div>
          </div>
          <button
            v-if="onRemove"
            type="button"
            class="btn-remove"
            @click="onRemove(index)"
            title="Eliminar item"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </transition-group>
    </div>

    <div v-if="items.length > 0" class="summary-footer">
      <div class="summary-stat">
        <span class="stat-label">Total de Items:</span>
        <span class="stat-value">{{ items.length }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Total Cantidad:</span>
        <span class="stat-value">{{ totalQuantity }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  onRemove: {
    type: Function,
    default: null
  }
})

const totalQuantity = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.cantidad || item.quantity || 1), 0)
})
</script>

<style scoped>
.form-summary {
  background: rgba(46, 221, 90, 0.08);
  border: 1px solid rgba(46, 221, 90, 0.2);
  border-radius: 14px;
  padding: 20px;
  margin: 24px 0;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-header svg {
  width: 24px;
  height: 24px;
  color: #2edd5a;
  flex-shrink: 0;
}

.summary-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.summary-items {
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(46, 221, 90, 0.15);
  border-radius: 10px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.summary-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(46, 221, 90, 0.3);
}

.item-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-quantity {
  display: flex;
  align-items: center;
}

.qty-badge {
  background: rgba(46, 221, 90, 0.2);
  color: #a6ffcb;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
}

.btn-remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 12px;
}

.btn-remove:hover {
  color: #ff6b6b;
}

.btn-remove svg {
  width: 18px;
  height: 18px;
}

.summary-footer {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(46, 221, 90, 0.15);
  flex-wrap: wrap;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #2edd5a;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

@media (max-width: 640px) {
  .form-summary {
    padding: 16px;
  }

  .summary-footer {
    gap: 16px;
  }
}
</style>
