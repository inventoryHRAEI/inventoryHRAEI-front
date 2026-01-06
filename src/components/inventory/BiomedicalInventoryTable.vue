<template>
  <div class="biomedical-inventory-table">
    <table>
      <thead>
        <tr>
          <th class="col-inventory">No. Inventario</th>
          <th class="col-equipment">Equipo médico</th>
          <th class="col-brand">Marca</th>
          <th class="col-model">Modelo</th>
          <th class="col-area">Área</th>
          <th class="col-status">Estado</th>
          <th class="col-type">Tipo</th>
          <th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in props.items" :key="item.inventoryNo">
          <td class="col-inventory">
            <span class="code">{{ item.inventoryNo }}</span>
          </td>
          <td class="col-equipment">
            <span class="equipment-name">{{ item.name }}</span>
          </td>
          <td class="col-brand">{{ item.brand || '—' }}</td>
          <td class="col-model">{{ item.model || '—' }}</td>
          <td class="col-area">
            <span class="area-badge">{{ item.area || '—' }}</span>
          </td>
          <td class="col-status">
            <span :class="['status-badge', statusClass(item.status)]">
              {{ item.status }}
            </span>
          </td>
          <td class="col-type">
            <span :class="['type-badge', typeClass(item.type)]">
              {{ typeLabel(item.type) }}
            </span>
          </td>
          <td class="col-actions">
            <div class="action-buttons">
              <button
                v-if="item.status !== 'EN MANTENIMIENTO'"
                class="btn-action start"
                @click.stop="$emit('start', item)"
                title="Iniciar mantenimiento"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <span>Iniciar</span>
              </button>
              <button
                v-else
                class="btn-action finish"
                @click.stop="$emit('finish', item)"
                title="Finalizar mantenimiento"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Finalizar</span>
              </button>
              <button
                class="btn-action view"
                @click.stop="$emit('view', item)"
                title="Ver detalle"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Ver</span>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="props.items.length === 0" class="empty-row">
          <td colspan="8" class="empty-cell">
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
                <line x1="9" y1="7" x2="15" y2="7"></line>
                <line x1="9" y1="11" x2="15" y2="11"></line>
                <line x1="9" y1="15" x2="13" y2="15"></line>
              </svg>
              <p>{{ props.emptyStateMessage }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="table-footer">
      <small>Mostrando {{ props.items.length }} equipos</small>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  emptyStateMessage: { type: String, default: 'Sin equipos registrados.' }
})

defineEmits(['view', 'start', 'finish'])

function statusClass(status) {
  if (!status) return ''
  if (status === 'DISPONIBLE') return 'is-green'
  if (status === 'EN MANTENIMIENTO') return 'is-yellow'
  if (status === 'OPERATIVO') return 'is-blue'
  return ''
}

function typeClass(type) {
  if (!type) return ''
  if (type === 'equipo') return 'is-purple'
  if (type === 'accesorio') return 'is-cyan'
  if (type === 'consumible') return 'is-orange'
  if (type === 'refaccion') return 'is-pink'
  return ''
}

function typeLabel(type) {
  const labels = {
    'equipo': 'Equipo',
    'accesorio': 'Accesorio',
    'consumible': 'Consumible',
    'refaccion': 'Refacción'
  }
  return labels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '—')
}
</script>

<style scoped>
.biomedical-inventory-table {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

thead th {
  padding: 12px;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

tbody td {
  padding: 12px;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

tbody tr:hover {
  background: #f9fafb;
}

tbody tr.empty-row {
  background: white;
}

tbody tr.empty-row:hover {
  background: white;
}

.empty-cell {
  padding: 40px !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
  text-align: center;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: #d1d5db;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.equipment-name {
  font-weight: 500;
  color: #1f2937;
}

.area-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f4f8;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #475569;
}

.status-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.is-green {
  background: #10b981;
}

.status-badge.is-yellow {
  background: #f59e0b;
}

.status-badge.is-blue {
  background: #3b82f6;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.type-badge.is-purple {
  background: #8b5cf6;
}

.type-badge.is-cyan {
  background: #06b6d4;
}

.type-badge.is-orange {
  background: #f97316;
}

.type-badge.is-pink {
  background: #ec4899;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 5px;
  border: none;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
}

.btn-action svg {
  flex-shrink: 0;
}

.btn-action.start {
  background: #10b981;
  color: white;
}

.btn-action.start:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.btn-action.finish {
  background: #f59e0b;
  color: white;
}

.btn-action.finish:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

.btn-action.view {
  background: #3b82f6;
  color: white;
}

.btn-action.view:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.table-footer {
  padding: 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: right;
  color: #6b7280;
}

/* Column widths */
.col-inventory {
  width: 90px;
}

.col-equipment {
  width: auto;
  min-width: 150px;
}

.col-brand {
  width: 90px;
}

.col-model {
  width: 90px;
}

.col-area {
  width: 80px;
}

.col-status {
  width: 120px;
}

.col-type {
  width: 90px;
}

.col-actions {
  width: auto;
  min-width: 240px;
}

/* Responsive */
@media (max-width: 1200px) {
  thead th,
  tbody td {
    padding: 10px;
    font-size: 0.8rem;
  }

  .btn-action span {
    display: none;
  }

  .btn-action {
    gap: 0;
    padding: 6px 8px;
  }
}

@media (max-width: 768px) {
  table {
    font-size: 0.75rem;
  }

  thead th {
    padding: 8px;
    font-size: 0.75rem;
  }

  tbody td {
    padding: 8px;
  }

  .empty-cell {
    padding: 24px !important;
  }

  .empty-state svg {
    width: 36px;
    height: 36px;
  }

  .status-badge,
  .type-badge {
    padding: 4px 6px;
    font-size: 0.75rem;
  }

  .btn-action {
    padding: 4px 6px;
    font-size: 0.7rem;
  }

  .col-equipment {
    min-width: 100px;
  }

  .col-brand,
  .col-model {
    display: none;
  }
}
</style>
