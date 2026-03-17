<template>
  <div class="history">
    <h4>Historial de Mantenimiento</h4>
    <div v-if="items.length === 0" class="empty-message">No hay registros de mantenimiento</div>
    <div v-else class="records-container">
      <div v-for="(h, idx) in items" :key="h.id || idx" class="maintenance-record">
        <div class="record-header">
          <span class="record-number">#{{ idx + 1 }}</span>
          <span class="record-dates">
            {{ format(h.start) }}
            <span v-if="h.end"> → {{ format(h.end) }}</span>
            <span v-else class="in-progress"> (En curso)</span>
          </span>
        </div>
        
        <div class="record-details">
          <div class="detail-row">
            <span class="label">Técnico:</span>
            <span class="value">{{ h.technician || h.technician_name || '-' }}</span>
          </div>
          
          <div v-if="h.maintenance_hours" class="detail-row">
            <span class="label">Horas Invertidas:</span>
            <span class="value">{{ h.maintenance_hours }} hrs</span>
          </div>
          
          <div v-if="h.folio_inicio" class="detail-row">
            <span class="label">Folio:</span>
            <span class="value">{{ h.folio_inicio }}</span>
          </div>
          
          <div v-if="hasPruebas(h)" class="detail-row">
            <span class="label">Pruebas Realizadas:</span>
            <div class="tests-list">
              <span v-if="h.routine_preventive" class="test-badge routine">
                ✓ Rutina Preventivo/Correctivo
              </span>
              <span v-if="h.simulator_tests" class="test-badge simulator">
                ✓ Pruebas con Simuladores
              </span>
              <span v-if="h.analyzer_tests" class="test-badge analyzer">
                ✓ Pruebas Analizador Eléctrico
              </span>
            </div>
          </div>
          
          <div class="detail-row">
            <span class="label">Trabajo Realizado:</span>
            <p class="value-text">{{ h.notes || h.observaciones || h.finish_notes || '-' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ items: { type: Array, default: () => [] } })

function format(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString() } catch { return s }
}

function hasPruebas(h) {
  return h.routine_preventive || h.simulator_tests || h.analyzer_tests
}
</script>

<style scoped>
.history {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.history h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.empty-message {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
  font-size: 0.95rem;
}

.records-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.maintenance-record {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.maintenance-record:hover {
  background: #f3f4f6;
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.record-number {
  font-weight: 700;
  color: #f59e0b;
  font-size: 0.9rem;
}

.record-dates {
  font-size: 0.85rem;
  color: #6b7280;
  font-family: monospace;
}

.in-progress {
  color: #f59e0b;
  font-weight: 600;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.label {
  font-weight: 600;
  color: #374151;
  min-width: 140px;
  font-size: 0.9rem;
}

.value {
  color: #1f2937;
  font-size: 0.9rem;
  flex: 1;
}

.value-text {
  color: #1f2937;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.tests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.test-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.test-badge.routine {
  background: #dcfce7;
  color: #166534;
}

.test-badge.simulator {
  background: #dbeafe;
  color: #1e40af;
}

.test-badge.analyzer {
  background: #fce7f3;
  color: #9f1239;
}

@media (max-width: 640px) {
  .history {
    padding: 12px;
  }

  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-row {
    flex-direction: column;
    gap: 4px;
  }

  .label {
    min-width: auto;
  }

  .tests-list {
    flex-direction: column;
  }
}
</style>