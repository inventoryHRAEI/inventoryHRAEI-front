<template>
  <div class="maintenance-history-view">
    <!-- Header -->
    <div class="view-header">
      <div class="title-block">
        <h1>📋 Historial de Mantenimientos</h1>
        <p class="subtitle">Vista profesional con DataTable y tarjetas</p>
      </div>

      <div class="view-toggle">
        <button
          type="button"
          :class="['toggle-btn', { active: viewMode === 'table' }]"
          @click="viewMode = 'table'"
        >
          Tabla
        </button>
        <button
          type="button"
          :class="['toggle-btn', { active: viewMode === 'cards' }]"
          @click="viewMode = 'cards'"
        >
          Cards
        </button>
      </div>
    </div>

    <!-- Contenido principal: tabla vs tarjetas -->
    <div class="view-content">
      <MaintainanceHistoryDataTable v-if="viewMode === 'table'" />
      <MaintenanceHistoryCards v-else />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MaintainanceHistoryDataTable from '@/components/MaintainanceHistoryDataTable.vue';
import MaintenanceHistoryCards from '@/components/MaintenanceHistoryCards.vue';

const viewMode = ref('table');
</script>

<style scoped>
.maintenance-history-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
}

.view-header {
  flex-shrink: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  border-left: 4px solid #0ea5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.view-header h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #f1f5f9;
}

.subtitle {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.view-toggle {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.4);
  gap: 4px;
}

.toggle-btn {
  border: none;
  background: transparent;
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #0f172a;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.8);
}

.toggle-btn:not(.active):hover {
  background: rgba(30, 64, 175, 0.4);
}

.view-content {
  flex: 1;
  min-height: 0;
  display: flex;
}

/* Flex container para que el DataTable ocupe todo el espacio restante */
:deep(.maintenance-datatable-container) {
  flex: 1;
  min-height: 0; /* Importante para que funcione flex overflow */
}

@media (max-width: 768px) {
  .maintenance-history-view {
    padding: 12px;
    gap: 12px;
  }

  .view-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }
}
</style>
