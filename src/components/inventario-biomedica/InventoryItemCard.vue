<template>
  <div class="inventory-item-card" :class="statusClass">
    <div class="card-glow"></div>
    
    <div class="card-top">
      <div class="meta-stack">
        <div class="id-tags">
          <div class="id-tag">
            <VueIcon name="ic:baseline-tag" size="14" />
            {{ displayValue(item['Clave  HRAEI']) }}
          </div>
          <div class="id-tag">
            <VueIcon name="ic:baseline-numbers" size="14" />
            N: {{ displayValue(item['N']) }}
          </div>
        </div>

        <h3 class="title" :title="displayValue(item['Descripción del bien'])">
          <VueIcon name="ic:baseline-medical-services" size="18" class="title-icon" />
          <span class="title-text">{{ displayValue(item['Descripción del bien']) }}</span>
        </h3>
      </div>

      <div class="availability-badge" :class="stockStatusClass">
        <VueIcon :name="stockIcon" size="16" />
        <span class="count">{{ displayValue(item['TOTAL EXISTENCIAS']) }}</span>
        <span class="unit"><VueIcon name="ic:baseline-scale" size="10" class="unit-icon" />{{ displayValue(item['Unidad de medida (presentación)']) }}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="details-grid">
        <div class="detail">
          <label>
            <VueIcon name="ic:baseline-business" size="14" /> Fabricante
          </label>
          <p>{{ displayValue(item['MARCA']) }}</p>
        </div>
        <div class="detail">
          <label>
            <VueIcon name="ic:baseline-architecture" size="14" /> Modelo / Versión
          </label>
          <p>{{ displayValue(item['MODELO']) }}</p>
        </div>
        <div class="detail">
          <label>
            <VueIcon name="ic:baseline-qr-code" size="14" /> Código Ref.
          </label>
          <p>{{ displayValue(item['REFERENCIA']) }}</p>
        </div>
        <div class="detail">
          <label>
            <VueIcon name="ic:baseline-event-calendar-hot" size="14" /> Vigencia
          </label>
          <p :class="{ 'warning-text': isExpiringSoon }">
            {{ displayValue(item['CADUCIDAD']) }}
          </p>
        </div>
      </div>

      <div v-if="extraFields.length" class="details-grid extra-grid">
        <div class="detail" v-for="field in extraFields" :key="field.key">
          <label>
            <VueIcon name="ic:baseline-info" size="14" /> {{ field.label }}
          </label>
          <p>{{ displayValue(field.value) }}</p>
        </div>
      </div>
    </div>

    <div class="card-locations">
      <div class="location">
        <span class="loc-label"><VueIcon name="ic:baseline-storefront" size="14" class="loc-icon" /> Central de Equipos</span>
        <span class="loc-val"><VueIcon name="ic:baseline-layers" size="12" class="loc-val-icon" /> {{ displayValue(item['Existencia SUBCEYE IB']) }}</span>
      </div>
      <div class="location-divider"></div>
      <div class="location">
        <span class="loc-label"><VueIcon name="ic:baseline-inventory" size="14" class="loc-icon" /> Almacén de Oficina</span>
        <span class="loc-val"><VueIcon name="ic:baseline-box" size="12" class="loc-val-icon" /> {{ displayValue(item[' Almacén IB (OFICINA)']) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const totalCount = computed(() => {
  return parseInt(props.item['TOTAL EXISTENCIAS']) || 0;
});

const knownKeys = [
  'N',
  'Clave  HRAEI',
  'TOTAL EXISTENCIAS',
  'Unidad de medida (presentación)',
  'Descripción del bien',
  'MARCA',
  'MODELO',
  'REFERENCIA',
  'CADUCIDAD',
  'Existencia SUBCEYE IB',
  ' Almacén IB (OFICINA)'
];

const hasRealValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase() === 'null') return false;
  }
  return true;
};

const displayValue = (value) => {
  return hasRealValue(value) ? value : 'N/A';
};

const extraFields = computed(() => {
  const item = props.item || {};
  return Object.keys(item)
    .filter((key) => !knownKeys.includes(key))
    .map((key) => ({ key, label: key, value: item[key] }));
});

const statusClass = computed(() => {
  if (totalCount.value === 0) return 'status-out';
  if (totalCount.value <= 5) return 'status-low';
  return 'status-ok';
});

const stockStatusClass = computed(() => {
  if (totalCount.value === 0) return 'bg-critical';
  if (totalCount.value <= 5) return 'bg-warning';
  return 'bg-success';
});

const stockIcon = computed(() => {
  if (totalCount.value === 0) return 'ic:baseline-error';
  if (totalCount.value <= 5) return 'ic:baseline-warning';
  return 'ic:baseline-check-circle';
});

const isExpiringSoon = computed(() => {
  return hasRealValue(props.item['CADUCIDAD']);
});
</script>

<style scoped>
.inventory-item-card {
  position: relative;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 34px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  box-shadow: 
    0 10px 40px -15px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.03);
  min-height: 330px;
}

.inventory-item-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.inventory-item-card:hover::after {
  opacity: 1;
}

.inventory-item-card:hover {
  transform: translateY(-12px) scale(1.02);
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.7),
    0 0 25px rgba(59, 130, 246, 0.2),
    inset 0 0 30px rgba(59, 130, 246, 0.05);
  background: rgba(30, 41, 59, 0.65);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  filter: blur(1.5px);
  opacity: 0.9;
}

.status-ok .card-glow { 
  background: linear-gradient(90deg, #10b981, #34d399, #10b981); 
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.6);
}
.status-low .card-glow { 
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.6);
}
.status-out .card-glow { 
  background: linear-gradient(90deg, #ef4444, #f87171, #ef4444);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.6);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.meta-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.id-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.id-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 12px;
  border-radius: 14px;
  letter-spacing: 0.8px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.availability-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 16px;
  font-weight: 800;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  white-space: nowrap;
}

.inventory-item-card:hover .availability-badge {
  transform: scale(1.05);
}

.availability-badge .count { font-size: 1.3rem; line-height: 1; }
.availability-badge .unit { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; margin-top: 2px; }

.bg-success { 
  background: rgba(16, 185, 129, 0.25); 
  color: #a7f3d0; 
  border: 1px solid rgba(16, 185, 129, 0.5); 
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}
.bg-warning { 
  background: rgba(245, 158, 11, 0.45); 
  color: #ffffff; 
  border: 1px solid rgba(245, 158, 11, 0.7); 
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  font-weight: 900;
}
.bg-critical { 
  background: rgba(239, 68, 68, 0.4); 
  color: #ffffff; 
  border: 1px solid rgba(239, 68, 68, 0.6); 
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  font-weight: 900;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  height: 2.7em;
  letter-spacing: -0.01em;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.extra-grid {
  padding-top: 6px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.detail label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 6px;
}

.detail p {
  font-size: 0.85rem;
  color: #f1f5f9;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
}

.card-locations {
  margin-top: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  display: flex;
  justify-content: space-around;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.location {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loc-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 0.8px;
}

.loc-val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #f8fafc;
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.title-icon { color: #bde0ff; margin-right: 10px; vertical-align: middle; }
.title-text { vertical-align: middle; display: inline-block; }

.loc-icon { color: #94a3b8; margin-right: 8px; vertical-align: middle; }
.loc-val-icon { color: #cbd5e1; opacity: 0.9; margin-right: 4px; }

.unit-icon { color: rgba(255,255,255,0.85); margin-right: 6px; vertical-align: middle; }

.location-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

.warning-text { color: #f87171; font-weight: 900; text-shadow: 0 0 10px rgba(248, 113, 113, 0.3); }
</style>