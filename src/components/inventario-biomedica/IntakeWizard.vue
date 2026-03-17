<template>
  <WizardShell
    :open="open"
    :steps="stepLabels"
    :current="step"
    :title="title"
    :subtitle="subtitle"
    :can-next="canNext"
    :can-finish="canFinish"
    :loading="submitting"
    mode-class="wz-mode-intake"
    @close="close"
    @back="goBack"
    @next="goNext"
    @submit="submit"
  >
    <div v-if="submitError" class="ik-error-banner">
      {{ submitError }}
    </div>

    <!-- Step 0: Tipo de ingreso -->
    <div v-if="step === 0" class="ik-step fade-in">
      <p class="ik-hint">¿Qué tipo de ingreso deseas realizar?</p>
      <div class="ik-type-grid">
        <button
          class="ik-type-btn"
          :class="{ selected: intakeType === 'refill' }"
          @click="intakeType = 'refill'"
        >
          <div class="ik-type-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </div>
          <h4>Resurtir Stock</h4>
          <span>Aumentar existencias de artículos ya registrados</span>
        </button>
        <button
          class="ik-type-btn"
          :class="{ selected: intakeType === 'new' }"
          @click="intakeType = 'new'"
        >
          <div class="ik-type-icon ik-type-icon-new">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h4>Nuevo Consumible</h4>
          <span>Registrar un artículo que no existe en el catálogo</span>
        </button>
      </div>
    </div>

    <!-- Step 1 (refill): Artículos + Metadata -->
    <div v-if="step === 1 && intakeType === 'refill'" class="ik-step fade-in">
      <div class="ik-cols">
        <aside class="ik-meta">
          <h3 class="ik-meta-title">Datos de Entrada</h3>
          <label class="ik-field">
            <span>Responsable *</span>
            <input v-model="meta.responsable" class="ik-input" placeholder="Nombre completo" />
          </label>
          <label class="ik-field">
            <span>Proveedor / Origen</span>
            <input v-model="meta.proveedor" class="ik-input" placeholder="Empresa proveedora" />
          </label>
          <label class="ik-field">
            <span>Motivo</span>
            <input v-model="meta.motivo" class="ik-input" placeholder="Licitación, donación…" />
          </label>
        </aside>
        <div class="ik-items">
          <ItemListVirtual
            :items="items"
            :quantities="quantities"
            :loading="loadingItems"
            placeholder="Buscar por varios términos: referencia marca lote…"
            :search-scopes="['all', 'clave', 'descripcion', 'marca', 'modelo', 'referencia', 'lote', 'n']"
            :stock-filters="['all', 'with-stock', 'zero-stock']"
            :allow-fast-step="true"
            :fast-amount="5"
            @update:quantities="quantities = $event"
          />
        </div>
      </div>
    </div>

    <!-- Step 1 (new): Formulario de nuevo bien -->
    <div v-if="step === 1 && intakeType === 'new'" class="ik-step fade-in">
      <div class="ik-new-layout">
        <aside class="ik-new-side">
          <div class="ik-new-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-new-badge-icon"><path d="M12 3l1.5 4.5H18l-3.6 2.7L15.9 15 12 12.3 8.1 15l1.5-4.8L6 7.5h4.5z"/></svg>
          </div>
          <h3>Nuevo Registro</h3>
          <p>Completa la información esencial del consumible</p>
        </aside>
        <div class="ik-new-form">
          <div class="ik-form-grid">
            <label class="ik-field span-2">
              <span>Nombre / Descripción *</span>
              <input v-model="newItem.descripcion" class="ik-input" placeholder="Ej. Jeringa estéril de 5ml" />
            </label>
            <label class="ik-field">
              <span>Clave HRAEI *</span>
              <input v-model="newItem.claveHRAEI" class="ik-input" placeholder="C-XXXXX" />
            </label>
            <label class="ik-field">
              <span>Unidad de Medida *</span>
              <select v-model="newItem.unidadMedida" class="ik-input">
                <option value="">Selecciona…</option>
                <option value="Pieza">Pieza</option>
                <option value="Caja">Caja</option>
                <option value="Envase">Envase</option>
                <option value="Paquete">Paquete</option>
                <option value="Litro">Litro</option>
              </select>
            </label>
            <label class="ik-field">
              <span>Cantidad Inicial *</span>
              <div class="ik-qty-wrap">
                <button class="ik-qty-btn" @click="newItem.cantidad = Math.max(0, (newItem.cantidad || 0) - 1)">−</button>
                <input v-model.number="newItem.cantidad" type="number" class="ik-qty-val" />
                <button class="ik-qty-btn" @click="newItem.cantidad = (newItem.cantidad || 0) + 1">+</button>
              </div>
            </label>
            <label class="ik-field">
              <span>Responsable *</span>
              <input v-model="meta.responsable" class="ik-input" placeholder="Nombre completo" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Confirmación -->
    <div v-if="step === 2" class="ik-step fade-in">
      <div class="ik-confirm">
        <div class="ik-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2>Confirma el Ingreso</h2>
        <p class="ik-confirm-sub">Esta operación añadirá stock al inventario</p>

        <div class="ik-confirm-grid">
          <div class="ik-cg-card">
            <span class="ik-cg-label">Tipo</span>
            <span class="ik-cg-value">{{ intakeType === 'refill' ? 'RESURTIDO' : 'NUEVO BIEN' }}</span>
          </div>
          <div class="ik-cg-card">
            <span class="ik-cg-label">Responsable</span>
            <span class="ik-cg-value">{{ meta.responsable || '—' }}</span>
          </div>
          <div class="ik-cg-card">
            <span class="ik-cg-label">{{ intakeType === 'refill' ? 'Artículos' : 'Artículo' }}</span>
            <span class="ik-cg-value">{{ intakeType === 'refill' ? selectedCount : newItem.descripcion || '—' }}</span>
          </div>
          <div class="ik-cg-card">
            <span class="ik-cg-label">Unidades</span>
            <span class="ik-cg-value accent">{{ intakeType === 'refill' ? totalUnits : newItem.cantidad || 0 }}</span>
          </div>
        </div>

        <!-- Lista para refill -->
        <div v-if="intakeType === 'refill' && selectedList.length" class="ik-confirm-list">
          <div v-for="s in selectedList" :key="s.clave" class="ik-cl-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-cl-icon"><path d="M21 8l-2-2H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="2"/></svg>
            <div class="ik-cl-info">
              <strong>{{ s.nombre }}</strong>
              <span>+{{ s.qty }} unidades · {{ s.clave }}</span>
            </div>
          </div>
        </div>

        <!-- Detalle para new -->
        <div v-if="intakeType === 'new'" class="ik-confirm-list">
          <div class="ik-cl-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ik-cl-icon"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <div class="ik-cl-info">
              <strong>{{ newItem.descripcion }}</strong>
              <span>Clave: {{ newItem.claveHRAEI }} · {{ newItem.cantidad }} {{ newItem.unidadMedida }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </WizardShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import WizardShell from './WizardShell.vue';
import ItemListVirtual from './ItemListVirtual.vue';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'success']);

const step       = ref(0);
const intakeType = ref(null);
const items      = ref([]);
const quantities = ref({});
const loadingItems = ref(false);
const submitting = ref(false);
const submitError = ref('');

const meta = ref({ responsable: '', proveedor: '', motivo: '', notas: '' });
const newItem = ref({ claveHRAEI: '', descripcion: '', unidadMedida: '', cantidad: null });

const pickValue = (item, aliases = [], fallback = '') => {
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
    const found = normalizedLookup.get(normalizeKey(alias));
    if (found && item[found] !== null && item[found] !== undefined && item[found] !== '') {
      return item[found];
    }
  }

  return fallback;
};

const getItemId = (item) => {
  const clave = pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], 'SIN_CLAVE');
  const serie = pickValue(item, ['N', 'Número de serie', 'Numero de serie', 'id'], '');
  const modelo = pickValue(item, ['MODELO', 'Modelo', 'modelo'], '');
  const marca = pickValue(item, ['MARCA', 'Marca', 'marca'], '');
  return `${clave}|${serie}|${modelo}|${marca}`;
};

const getItemClave = (item) => String(pickValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], '') || '').trim();
const getItemName = (item) => String(pickValue(item, ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN ARTÍCULO', 'descripcion', 'NOMBRE'], '—') || '—');

/* Step names */
const stepLabels = computed(() => {
  if (intakeType.value === 'new') return ['Tipo', 'Nuevo Bien', 'Confirmación'];
  return ['Tipo', 'Resurtido', 'Confirmación'];
});

/* Titles */
const title = computed(() => {
  if (step.value === 0) return 'Tipo de Ingreso';
  if (step.value === 1) return intakeType.value === 'refill' ? 'Resurtir Stock' : 'Nuevo Consumible';
  return 'Confirmar Ingreso';
});
const subtitle = computed(() => {
  if (step.value === 0) return '¿Resurtir existentes o crear uno nuevo?';
  if (step.value === 1 && intakeType.value === 'refill') return 'Selecciona artículos y cantidades a ingresar';
  if (step.value === 1) return 'Completa la información esencial';
  return 'Revisa los datos antes de procesar';
});

/* Selection helpers */
const selectedCount = computed(() =>
  Object.values(quantities.value).filter(q => Number(q) > 0).length
);
const totalUnits = computed(() =>
  Object.values(quantities.value).reduce((s, q) => s + (Number(q) || 0), 0)
);
const selectedList = computed(() => {
  return Object.entries(quantities.value)
    .filter(([, q]) => Number(q) > 0)
    .map(([itemId, qty]) => {
      const item = items.value.find(i => getItemId(i) === itemId);
      const clave = item ? getItemClave(item) : itemId;
      return { clave, qty: Number(qty), nombre: item ? getItemName(item) : itemId };
    });
});

/* Navigation */
const canNext = computed(() => {
  if (step.value === 0) return !!intakeType.value;
  if (step.value === 1 && intakeType.value === 'refill') return selectedCount.value > 0 && !!meta.value.responsable;
  if (step.value === 1 && intakeType.value === 'new') {
    return !!newItem.value.descripcion && !!newItem.value.claveHRAEI
      && !!newItem.value.unidadMedida && (newItem.value.cantidad || 0) > 0
      && !!meta.value.responsable;
  }
  return true;
});
const canFinish = computed(() => {
  if (intakeType.value === 'refill') return selectedCount.value > 0 && !!meta.value.responsable;
  return !!newItem.value.descripcion && !!newItem.value.claveHRAEI
    && !!newItem.value.unidadMedida && (newItem.value.cantidad || 0) > 0
    && !!meta.value.responsable;
});

/* Load items for refill */
const loadItems = async () => {
  loadingItems.value = true;
  try {
    const res = await fetch('/api/ops/stock-biomedica');
    if (res.ok) {
      const data = await res.json();
      items.value = Array.isArray(data) ? data : (data.data || []);
    } else { items.value = []; }
  } catch { items.value = []; }
  finally { loadingItems.value = false; }
};

const goNext = () => {
  if (step.value === 0) {
    if (intakeType.value === 'refill') loadItems();
    step.value = 1;
  } else if (step.value < 2) {
    step.value++;
  }
};
const goBack = () => {
  if (step.value === 1) { intakeType.value = null; }
  if (step.value > 0) step.value--;
};

/* Reset */
const resetState = () => {
  step.value = 0;
  intakeType.value = null;
  items.value = [];
  quantities.value = {};
  submitting.value = false;
  submitError.value = '';
  meta.value = { responsable: '', proveedor: '', motivo: '', notas: '' };
  newItem.value = { claveHRAEI: '', descripcion: '', unidadMedida: '', cantidad: null };
};
const close = (force = false) => {
    if (force || window.confirm('¿Está seguro de que desea cerrar el wizard? Se perderán los cambios no guardados.')) {
        emit('close');
        resetState();
    }
};
watch(() => props.open, (v) => { if (v) resetState(); });

/* Submit */
const submit = async () => {
  submitError.value = '';
  submitting.value = true;
  try {
    if (intakeType.value === 'refill') {
      const itemsToRefill = Object.entries(quantities.value)
        .filter(([, q]) => q > 0)
        .map(([itemId, cantidad]) => {
          const item = items.value.find(i => getItemId(i) === itemId);
          const claveHRAEI = item ? getItemClave(item) : String(itemId || '').trim();
          return {
            claveHRAEI,
            descripcion: item ? getItemName(item) : '',
            marca: item ? String(pickValue(item, ['MARCA', 'Marca', 'marca'], '') || '').trim() : '',
            modelo: item ? String(pickValue(item, ['MODELO', 'Modelo', 'modelo'], '') || '').trim() : '',
            referencia: item ? String(pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], '') || '').trim() : '',
            lote: item ? String(pickValue(item, ['LOTE', 'Lote', 'lote'], '') || '').trim() : '',
            itemN: item ? String(pickValue(item, ['N', 'n', 'id'], '') || '').trim() : '',
            distribucion: { subceye: Number(cantidad), oficina: 0 },
          };
        });
      if (!itemsToRefill.length) throw new Error('Selecciona artículos');

      const payload = { tipoRegistro: 'refill', items: itemsToRefill, metadata: { ...meta.value } };
      const res = await fetch('/api/ops/inventory/consumables-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.msg || data.error || 'El resurtido falló');
    } else {
      const payload = {
        tipoRegistro: 'new',
        items: [{
          claveHRAEI: newItem.value.claveHRAEI,
          descripcion: newItem.value.descripcion,
          unidadMedida: newItem.value.unidadMedida,
          distribucion: { subceye: Number(newItem.value.cantidad || 0), oficina: 0 },
        }],
        metadata: { ...meta.value },
      };
      const res = await fetch('/api/ops/inventory/consumables-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.msg || data.error || 'La creación falló');
    }
     emit('success');
     close(true);
  } catch (err) {
    const detail = String(err?.message || 'No se pudo completar el ingreso de bienes');
    submitError.value = `Ingreso no completado: ${detail}`;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.fade-in { animation: ikFadeIn .3s ease-out; }
@keyframes ikFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.ik-step { flex: 1; min-height: 0; display: flex; flex-direction: column; }

.ik-error-banner {
  margin-bottom: 12px;
  border: 1px solid rgba(248, 113, 113, .35);
  background: rgba(127, 29, 29, .35);
  color: #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}

/* --- Step 0: Type Selection --- */
.ik-hint { font-size: 14px; color: rgba(255,255,255,.45); margin: 0 0 20px; }

.ik-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.ik-type-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 32px 24px;
  background: rgba(255,255,255,.02);
  border: 1.5px solid rgba(255,255,255,.06);
  border-radius: 18px;
  cursor: pointer; color: #e0e7ff;
  font-family: inherit; text-align: center;
  transition: all .25s ease;
}
.ik-type-btn:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); }
.ik-type-btn.selected {
  background: rgba(96,165,250,.06);
  border-color: rgba(96,165,250,.35);
  box-shadow: 0 0 24px rgba(96,165,250,.08);
}

.ik-type-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(96,165,250,.1);
  display: flex; align-items: center; justify-content: center;
}
.ik-type-icon svg { width: 26px; height: 26px; color: #60a5fa; }
.ik-type-icon-new { background: rgba(236,72,153,.1); }
.ik-type-icon-new svg { color: #ec4899; }

.ik-type-btn h4 { margin: 4px 0 0; font-size: 16px; font-weight: 700; }
.ik-type-btn span { font-size: 12px; color: rgba(255,255,255,.4); }

/* --- Step 1 (refill): Two cols --- */
.ik-cols {
  display: grid; grid-template-columns: 280px 1fr;
  gap: 20px; flex: 1; min-height: 0;
}

.ik-meta {
  display: flex; flex-direction: column; gap: 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 18px; padding: 20px;
  overflow-y: auto;
}
.ik-meta-title { margin: 0 0 4px; font-size: 13px; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,.45); letter-spacing: .5px; }

.ik-field { display: flex; flex-direction: column; gap: 5px; }
.ik-field span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: rgba(255,255,255,.35); }

.ik-input {
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 10px 14px;
  color: #fff; font-size: 14px; font-family: inherit;
  transition: border-color .2s, box-shadow .2s; outline: none;
  width: 100%;
}
.ik-input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.1); }
select.ik-input {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
select.ik-input option {
  background: #1a1e2e;
  color: #e0e7ff;
}

.ik-items { display: flex; flex-direction: column; min-height: 0; }

/* --- Step 1 (new): Form --- */
.ik-new-layout {
  display: grid; grid-template-columns: 240px 1fr;
  gap: 20px; flex: 1; min-height: 0;
}

.ik-new-side {
  display: flex; flex-direction: column; align-items: flex-start; gap: 14px;
  background: rgba(0,0,0,.3);
  border-radius: 18px; padding: 32px 24px;
}
.ik-new-badge {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
}
.ik-new-badge-icon { width: 24px; height: 24px; color: #fff; }
.ik-new-side h3 { margin: 0; font-size: 18px; font-weight: 700; color: #f8fafc; }
.ik-new-side p { margin: 0; font-size: 13px; color: rgba(255,255,255,.45); line-height: 1.5; }

.ik-new-form { padding: 8px 0; overflow-y: auto; }

.ik-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.span-2 { grid-column: span 2; }

.ik-qty-wrap {
  display: flex; align-items: center; gap: 0;
  background: rgba(0,0,0,.3);
  border-radius: 12px; padding: 4px;
  border: 1px solid rgba(255,255,255,.06);
  width: fit-content;
}
.ik-qty-btn {
  width: 38px; height: 38px;
  border-radius: 10px; border: none;
  background: rgba(255,255,255,.06);
  color: #fff; font-size: 18px; font-weight: 700;
  cursor: pointer; transition: background .12s;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}
.ik-qty-btn:hover { background: rgba(255,255,255,.12); }
.ik-qty-val {
  width: 70px; background: none; border: none;
  text-align: center; color: #fff;
  font-size: 20px; font-weight: 800;
  -moz-appearance: textfield; appearance: textfield; font-family: inherit;
}
.ik-qty-val::-webkit-inner-spin-button,
.ik-qty-val::-webkit-outer-spin-button { display: none; }

/* --- Step 2: Confirmation --- */
.ik-confirm {
  display: flex; flex-direction: column; align-items: center;
  gap: 18px; padding: 8px 0;
  overflow-y: auto; flex: 1;
}
.ik-confirm-icon {
  width: 72px; height: 72px;
  background: rgba(96,165,250,.08);
  border: 1px solid rgba(96,165,250,.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.ik-shield { width: 36px; height: 36px; color: #60a5fa; }

.ik-confirm h2 { margin: 0; font-size: 22px; font-weight: 800; color: #f0f7ff; }
.ik-confirm-sub { margin: 0; font-size: 13px; color: rgba(255,255,255,.4); }

.ik-confirm-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  width: 100%;
}
.ik-cg-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 14px; padding: 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.ik-cg-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,.35); font-weight: 700; letter-spacing: .5px; }
.ik-cg-value { font-size: 15px; font-weight: 700; color: #fff; }
.ik-cg-value.accent { color: #60a5fa; }

.ik-confirm-list {
  width: 100%;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 16px; padding: 8px;
  display: flex; flex-direction: column; gap: 4px;
  max-height: 220px; overflow-y: auto;
}
.ik-cl-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 14px;
  background: rgba(255,255,255,.02); border-radius: 10px;
}
.ik-cl-icon { width: 20px; height: 20px; color: #60a5fa; flex-shrink: 0; }
.ik-cl-info { display: flex; flex-direction: column; }
.ik-cl-info strong { font-size: 13px; color: rgba(255,255,255,.85); }
.ik-cl-info span { font-size: 11px; color: rgba(255,255,255,.35); }

@media (max-width: 700px) {
  .ik-type-grid { grid-template-columns: 1fr; }
  .ik-cols { grid-template-columns: 1fr; }
  .ik-new-layout { grid-template-columns: 1fr; }
  .ik-new-side { display: none; }
  .ik-confirm-grid { grid-template-columns: 1fr 1fr; }
}
</style>
