<template>
  <div 
    v-if="statusData"
    :class="['maintenance-badge', `badge-${statusData.badge}`]"
    :style="badgeStyle"
    :title="statusData.description"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- Icono del estado -->
    <span class="badge-icon" :class="{ 'badge-icon-animate': statusData.animate }">
      {{ statusData.icon }}
    </span>
    
    <!-- Texto del estado -->
    <span class="badge-text">{{ statusData.label }}</span>

    <!-- Indicador de severidad si es necesario -->
    <span v-if="statusData.severity > 0" class="badge-severity">
      <span class="severity-dot" :class="`severity-${statusData.severity}`"></span>
    </span>

    <!-- Tooltip al pasar el ratón -->
    <div v-if="showTooltip && tooltip" class="maintenance-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-header">
          <span class="tooltip-icon">{{ statusData.icon }}</span>
          <h4 class="tooltip-title">{{ statusData.label }}</h4>
        </div>
        <p v-if="statusData.description" class="tooltip-description">
          {{ statusData.description }}
        </p>
        
        <!-- Detalles adicionales -->
        <div v-if="statusInfo" class="tooltip-details">
          <div v-if="statusInfo.lastMaintenanceDate" class="detail-item">
            <span class="detail-label">Última fecha:</span>
            <span class="detail-value">{{ formatDate(statusInfo.lastMaintenanceDate) }}</span>
          </div>
          <div v-if="statusInfo.lastMaintenanceType" class="detail-item">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">{{ statusInfo.lastMaintenanceType }}</span>
          </div>
          <div v-if="statusInfo.lastObservations" class="detail-item">
            <span class="detail-label">Observaciones:</span>
            <span class="detail-value">{{ statusInfo.lastObservations }}</span>
          </div>
          <div v-if="statusInfo.externalCompany" class="detail-item">
            <span class="detail-label">Empresa:</span>
            <span class="detail-value">{{ statusInfo.externalCompany }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Fallback si no hay estado -->
  <div v-else class="maintenance-badge badge-unknown">
    <span class="badge-icon">?</span>
    <span class="badge-text">Sin estado</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useMaintenanceStatusIndicator } from '@/composables/useMaintenanceStatusIndicator';

const props = defineProps({
  inventoryNo: {
    type: String,
    required: true
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  tooltipPosition: {
    type: String,
    default: 'top', // top, bottom, left, right
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v)
  }
});

const { getEquipmentStatus, formatDate } = useMaintenanceStatusIndicator();
const showTooltip = ref(false);
const statusData = ref(null);
const statusInfo = ref(null);

// Cargar estado al montar el componente
onMounted(async () => {
  if (props.inventoryNo) {
    const status = await getEquipmentStatus(props.inventoryNo);
    if (status) {
      statusData.value = status;
      statusInfo.value = status.info || null;
    }
  }
});

// Escuchar cambios en inventoryNo
watch(() => props.inventoryNo, async (newInvNo) => {
  if (newInvNo) {
    const status = await getEquipmentStatus(newInvNo);
    if (status) {
      statusData.value = status;
      statusInfo.value = status.info || null;
    }
  }
});

// Estilos dinámicos
const badgeStyle = computed(() => {
  const styles = {
    '--badge-color': statusData.value?.color || '#757575',
    '--badge-size': getSizeClass(),
  };
  return styles;
});

function getSizeClass() {
  const sizes = {
    small: '12px',
    medium: '14px',
    large: '16px'
  };
  return sizes[props.size] || sizes.medium;
}

const tooltip = computed(() => {
  return statusData.value?.label || null;
});
</script>

<style scoped>
/* Variables CSS para colores y tamaños */
:root {
  --badge-color: #757575;
  --badge-size: 14px;
}

.maintenance-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: var(--badge-size);
  font-weight: 600;
  background-color: var(--badge-color);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  user-select: none;
}

.maintenance-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Icono del badge */
.badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
}

/* Animación para estados críticos */
.badge-icon-animate {
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Texto del badge */
.badge-text {
  display: inline;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Indicador de severidad */
.badge-severity {
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
}

.severity-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.severity-1 {
  background-color: rgba(255, 255, 255, 0.7);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.severity-2 {
  background-color: rgba(255, 255, 255, 0.9);
  animation: pulse-dot 1s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

/* Estilos específicos por estado - SIMPLE (4 COLORES) */

/* Verde: Operativo */
.badge-operational {
  --badge-color: #22c55e;
}

/* Amarillo: Condición Regular/Mala */
.badge-warning {
  --badge-color: #f59e0b;
}

/* Rojo: No Funcional */
.badge-critical {
  --badge-color: #dc2626;
}

/* Gris: Dado de Baja o Desconocido */
.badge-offline {
  --badge-color: #64748b;
}

.badge-unknown {
  --badge-color: #757575;
}

/* Tooltip */
.maintenance-tooltip {
  position: absolute;
  z-index: 1000;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  animation: tooltip-fade-in 0.2s ease;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  max-width: 300px;
}

.maintenance-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #ffffff;
  border-bottom-width: 0;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.tooltip-content {
  padding: 12px;
  color: #333;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tooltip-icon {
  font-size: 18px;
}

.tooltip-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.tooltip-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.tooltip-details {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  margin-top: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  margin-bottom: 4px;
  line-height: 1.3;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: #999;
  text-align: right;
  flex: 1;
}

/* Responsive */
@media (max-width: 640px) {
  .maintenance-badge {
    padding: 3px 8px;
    gap: 4px;
  }

  .badge-text {
    display: none;
  }

  .maintenance-tooltip {
    min-width: 200px;
    max-width: 250px;
  }
}
</style>
