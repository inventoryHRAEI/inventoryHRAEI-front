<template>
  <div class="inventory-item-card" :class="[statusClass, { 'is-new': isNew, external: isExternal }]">
    <div class="card-glow"></div>
    <!-- Floating update button (only for admin) -->
    <button v-if="canEditBiomedicalEquipment" class="btn-update floating" @click.prevent.stop="$emit('edit', item)" aria-label="Actualizar información del equipo">
      <VueIcon name="ic:baseline-edit" size="16" />
      <span class="btn-label">Actualizar</span>
    </button>
    <button class="btn-kardex floating" @click.prevent.stop="downloadKardex" title="Ver kardex (historial)">
      <VueIcon name="ic:baseline-description" size="16" />
      <span class="btn-label">Ver kardex</span>
    </button>
    <div v-if="isNew" class="new-beacon"></div>
    <div v-if="isNew" class="new-ribbon">
      <span>Ingreso reciente</span>
    </div>
    
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

      <div class="badge-row">
        <div class="availability-badge" :class="stockStatusClass">
          <VueIcon :name="stockIcon" size="16" />
          <span class="count">{{ displayValue(getFieldValue(item, ['TOTAL EXISTENCIAS', 'Total Excistencias', 'total_existencias', 'totalExistencias', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'])) }}</span>
          <span class="unit"><VueIcon name="ic:baseline-scale" size="10" class="unit-icon" />{{ displayValue(getFieldValue(item, ['Unidad de medida (presentación)', 'Unidad de medida (presentacion)', 'Unidad de medida', 'UNIDAD'])) }}</span>
        </div>
        <div v-if="isNew" class="new-badge">
          <VueIcon name="ic:baseline-star" size="16" />
          <span>ITEM NUEVO</span>
        </div>
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
        <span class="loc-val"><VueIcon name="ic:baseline-layers" size="12" class="loc-val-icon" /> {{ displayValue(getFieldValue(item, ['Existencia SUBCEYE IB', 'Existencia SUBCEYE', 'existencia_subceye'])) }}</span>
      </div>
      <div class="location-divider"></div>
      <div class="location">
        <span class="loc-label"><VueIcon name="ic:baseline-inventory" size="14" class="loc-icon" /> Almacén de Oficina</span>
        <span class="loc-val"><VueIcon name="ic:baseline-box" size="12" class="loc-val-icon" /> {{ displayValue(getFieldValue(item, [' Almacén IB (OFICINA)', 'Almacén IB (OFICINA)', 'existencia_oficina'])) }}</span>
      </div>
    </div>

    <!-- Modal de preview del kardex -->
    <KardexPreviewModal
      :isOpen="showKardexModal"
      :itemData="item"
      title="Vista Previa del Kardex"
      @close="showKardexModal = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import KardexPreviewModal from '@/components/KardexPreviewModal.vue';
import { getStoredToken } from '@/utils/auth.js';
import { usePermissions } from '@/composables/usePermissions.js'

const { canEditBiomedicalEquipment } = usePermissions()

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit']);

// Estado para modal de kardex
const showKardexModal = ref(false);

const getFieldValue = (item, aliases = [], fallback = '') => {
  if (!item || typeof item !== 'object') return fallback;

  const normalizeKey = (key) => String(key || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  const normalizedLookup = new Map();
  Object.keys(item).forEach((k) => {
    const normalized = normalizeKey(k);
    if (normalized && !normalizedLookup.has(normalized)) normalizedLookup.set(normalized, k);
  });

  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(item, alias) && item[alias] !== null && item[alias] !== undefined && item[alias] !== '') {
      return item[alias];
    }
    const foundKey = normalizedLookup.get(normalizeKey(alias));
    if (foundKey && item[foundKey] !== null && item[foundKey] !== undefined && item[foundKey] !== '') {
      return item[foundKey];
    }
  }

  return fallback;
};

const totalCount = computed(() => {
  const raw = getFieldValue(props.item, ['TOTAL EXISTENCIAS', 'Total Excistencias', 'total_existencias', 'totalExistencias', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0);
  const parsed = parseInt(raw, 10);
  if (Number.isFinite(parsed)) return parsed;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
});

const knownKeys = [
  'N',
  'Clave  HRAEI',
  'TOTAL EXISTENCIAS',
  'Total Excistencias',
  'Unidad de medida (presentación)',
  'Unidad de medida (presentacion)',
  'Descripción del bien',
  'Descripcion del bien',
  'MARCA',
  'MODELO',
  'REFERENCIA',
  'CADUCIDAD',
  'Existencia SUBCEYE IB',
  ' Almacén IB (OFICINA)',
  'Almacén IB (OFICINA)'
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

const isExternal = computed(() => {
  const item = props.item || {}
  const flag = item.isExternal || item.is_external || item.externo || item.ES_EXTERNO
  if (flag) return true
  const clave = String(getFieldValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'] ) || '').toLowerCase()
  return /comodato|donaci.n|externo|prestamo|préstamo|comodatos|donaciones/.test(clave)
})

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

const downloadKardex = () => {
  // Abrir modal con vista previa del kardex
  showKardexModal.value = true
}
</script>

<style scoped>
.inventory-item-card {
  position: relative;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  box-shadow: 
    0 10px 40px -15px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.03);
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

/* Resaltar artículos externos (comodato / donación / préstamo) */
.inventory-item-card.external {
  border-color: rgba(249, 115, 22, 0.9);
  box-shadow: 0 20px 40px -12px rgba(249, 115, 22, 0.18), inset 0 0 30px rgba(249, 115, 22, 0.04);
  background: linear-gradient(180deg, rgba(255,246,230,0.03), rgba(255,244,236,0.02));
}
.inventory-item-card.external .card-glow {
  background: linear-gradient(90deg, #f97316 0%, #fb923c 60%);
  box-shadow: 0 6px 22px rgba(249, 115, 22, 0.2);
}

.inventory-item-card .external-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(249,115,22,0.12);
  color: rgba(249,115,22,0.98);
  font-weight: 700;
  font-size: 0.78rem;
}
.status-out .card-glow { 
  background: linear-gradient(90deg, #ef4444, #f87171, #ef4444);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.6);
}

.card-top {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
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
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  word-break: break-word;
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

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

/* Update button */
.btn-update {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.06);
  color: #cbd5e1;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.btn-update:hover { background: rgba(255,255,255,.06); color: #fff; }

.btn-update.floating{
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 22;
  background: linear-gradient(135deg,#2563eb,#60a5fa);
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(37,99,235,0.28), 0 2px 6px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
  display: inline-flex; align-items: center; gap: 8px;
  font-weight: 800;
}
.btn-update.floating .btn-label { font-size: 12px; }
.btn-update.floating:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(37,99,235,0.36); }

.btn-kardex {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.06);
  color: #cbd5e1;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.btn-kardex.floating{
  position: absolute;
  top: 56px;
  right: 14px;
  z-index: 22;
  background: linear-gradient(135deg,#059669,#34d399);
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(5,150,105,0.26);
  border: 1px solid rgba(255,255,255,0.06);
  display: inline-flex; align-items: center; gap: 8px;
  font-weight: 800;
}
.btn-kardex.floating:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(5,150,105,0.34); }

.new-badge {
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(16, 185, 129, 0.3) 100%);
  border: 2px solid rgba(34, 197, 94, 0.8);
  color: #d1fae5;
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  box-shadow: 
    0 0 32px rgba(34, 197, 94, 0.5),
    inset 0 0 16px rgba(255, 255, 255, 0.1);
  animation: pulse-new 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite, 
             badge-float 3s ease-in-out infinite;
}

.new-beacon {
  position: absolute;
  inset: -30px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.15), transparent 65%);
  pointer-events: none;
  z-index: 0;
  animation: beacon-pulse 2.6s ease-in-out infinite;
}

.new-ribbon {
  position: absolute;
  top: 18px;
  left: -48px;
  background: linear-gradient(135deg, #22c55e, #4ade80, #86efac);
  color: #052e16;
  text-transform: uppercase;
  font-weight: 900;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  padding: 6px 60px;
  transform: rotate(-45deg);
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.35);
  border: 1px solid rgba(5, 46, 22, 0.2);
  animation: ribbon-pop 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.new-ribbon span {
  display: inline-block;
}

@keyframes pulse-new {
  0% {
    opacity: 1;
    box-shadow: 
      0 0 32px rgba(34, 197, 94, 0.5),
      inset 0 0 16px rgba(255, 255, 255, 0.1);
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    box-shadow: 
      0 0 64px rgba(34, 197, 94, 0.8),
      inset 0 0 20px rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    box-shadow: 
      0 0 32px rgba(34, 197, 94, 0.5),
      inset 0 0 16px rgba(255, 255, 255, 0.1);
    transform: scale(1);
  }
}

@keyframes badge-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes ribbon-pop {
  0% {
    opacity: 0;
    transform: rotate(-45deg) scale(0.6);
  }
  60% {
    opacity: 1;
    transform: rotate(-45deg) scale(1.08);
  }
  100% {
    transform: rotate(-45deg) scale(1);
    opacity: 1;
  }
}

@keyframes beacon-pulse {
  0%, 100% {
    opacity: 0.35;
    transform: scale(1);
  }
  50% {
    opacity: 0.65;
    transform: scale(1.1);
  }
}

.inventory-item-card.is-new {
  animation: slide-in-top 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards, 
             highlight-pulse 6s cubic-bezier(0.4, 0, 0.6, 1) 0.8s infinite;
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 
    0 10px 40px -15px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(34, 197, 94, 0.4),
    inset 0 0 30px rgba(34, 197, 94, 0.1);
}

.inventory-item-card.is-new .card-glow {
  background: linear-gradient(90deg, #22c55e, #34d399, #22c55e) !important;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.6) !important;
  animation: glow-pulse-intense 1.5s ease-in-out infinite;
  opacity: 1 !important;
}

@keyframes glow-pulse-intense {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes highlight-pulse {
  0%, 100% {
    border-color: rgba(34, 197, 94, 0.8);
    box-shadow: 
      0 10px 40px -15px rgba(0, 0, 0, 0.6),
      0 0 80px rgba(34, 197, 94, 0.5),
      inset 0 0 30px rgba(34, 197, 94, 0.15);
    background: rgba(30, 41, 59, 0.6);
  }
  50% {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 
      0 10px 40px -15px rgba(0, 0, 0, 0.6),
      0 0 40px rgba(34, 197, 94, 0.25),
      inset 0 0 20px rgba(34, 197, 94, 0.05);
    background: rgba(30, 41, 59, 0.5);
  }
}

@keyframes slide-in-top {
  from {
    opacity: 0;
    transform: translateY(-60px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>