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
    mode-class="wz-mode-decommission"
    @close="close"
    @back="goBack"
    @next="goNext"
    @submit="submit"
  >
    <!-- Step 0: Motivo y Responsable -->
    <div v-if="step === 0" class="dc-step fade-in">
      <p class="dc-hint">Completa la información de la baja antes de seleccionar los artículos</p>

      <div class="dc-form">
        <div class="dc-form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-icon-big">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>

        <label class="dc-field">
          <span>Responsable *</span>
          <input v-model="meta.responsable" class="dc-input" placeholder="Nombre completo del responsable" />
        </label>

        <label class="dc-field">
          <span>Motivo de la baja *</span>
          <select v-model="meta.motivo" class="dc-input">
            <option value="">— Seleccionar motivo —</option>
            <option value="Caducidad / Vencimiento">Caducidad / Vencimiento</option>
            <option value="Daño irreparable">Daño irreparable</option>
            <option value="Obsolescencia">Obsolescencia</option>
            <option value="Contaminación">Contaminación</option>
            <option value="Merma / Pérdida">Merma / Pérdida</option>
            <option value="Retiro del fabricante">Retiro del fabricante</option>
            <option value="Otro">Otro</option>
          </select>
        </label>

        <label v-if="meta.motivo === 'Otro'" class="dc-field">
          <span>Especifica el motivo *</span>
          <input v-model="meta.motivoOtro" class="dc-input" placeholder="Describe el motivo…" />
        </label>

        <label class="dc-field">
          <span>Notas adicionales</span>
          <textarea v-model="meta.notas" class="dc-input dc-textarea" rows="2" placeholder="Observaciones opcionales…"></textarea>
        </label>
      </div>
    </div>
    <!-- ========== Step 1: Selección de artículos (checkbox) ========== -->
    <div v-if="step === 1" class="dc-step fade-in">
      <!-- Search -->
      <div class="dc-search" :class="{ focused: searchFocused }">
        <svg class="dc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar artículo a dar de baja…"
          class="dc-search-input"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <button v-if="searchQuery" class="dc-search-clear" @click="searchQuery = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Stats -->
      <div class="dc-stats">
        <span><strong>{{ filteredItems.length }}</strong> encontrados</span>
        <span class="dc-stats-sep">·</span>
        <span class="dc-stats-accent"><strong>{{ selectedClaves.size }}</strong> marcados para baja</span>
      </div>

      <div v-if="loadingItems" class="dc-loading">
        <div class="dc-shimmer" v-for="i in 5" :key="i"></div>
      </div>

    
      <div
        v-else-if="visibleItems.length > 0"
        ref="listRef"
        class="dc-list"
        @scroll.passive="onScroll"
      >
        <label
           v-for="item in visibleItems"
            :key="getItemId(item)"
            class="dc-item"
            :class="{ selected: selectedClaves.has(getItemId(item)) }"
          >
            <input
              type="checkbox"
              :checked="selectedClaves.has(getItemId(item))"
              @change="toggleItem(item)"
              class="dc-checkbox"
            />
            <div class="dc-item-info">
              <span class="dc-item-name">{{ item['Descripción del bien'] }}</span>
              <div class="dc-item-tags">
                <span class="dc-item-code">{{ item['Clave  HRAEI'] }}</span>
                <span class="dc-item-stock">Stock total: {{ item['TOTAL EXISTENCIAS'] }}</span>
              </div>
            </div>
            <!-- Quantity stepper (visible when checked) -->
            <div v-if="selectedClaves.has(getItemId(item))" class="dc-qty" @click.prevent.stop>
              <button class="dc-qty-btn" @click="stepBajaQty(item, -1)">−</button>
              <input
                type="text"
                inputmode="numeric"
                class="dc-qty-input"
                :value="bajaQuantities[getItemId(item)] ?? ''"
                @input="onBajaInput(item, $event)"
                @blur="clampBajaQty(item)"
                @keydown.enter="$event.target.blur()"
              />
              <button class="dc-qty-btn" @click="stepBajaQty(item, 1)">+</button>
              <span class="dc-qty-max">/ {{ item['TOTAL EXISTENCIAS'] }}</span>
            </div>
          </label>

        <div v-if="visibleCount < filteredItems.length" class="dc-more">
          Mostrando {{ visibleCount }} de {{ filteredItems.length }}…
        </div>
      </div>

      <div v-else class="dc-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="dc-empty-icon">
          <path d="M21 8l-2-2H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="2"/><line x1="12" y1="12" x2="12" y2="16"/>
        </svg>
        <p>{{ items.length > 0 ? 'Sin resultados para tu búsqueda' : 'Sin artículos con stock' }}</p>
      </div>
    </div>

    <!-- ========== Step 2: Confirmación + Contraseña ========== -->
    <div v-if="step === 2" class="dc-step fade-in">
      <div class="dc-confirm">
        <div class="dc-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-warn-icon">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2>Confirma la Baja Total</h2>
        <p class="dc-confirm-sub">
          Se darán de baja las cantidades indicadas por artículo.
          Si la cantidad es igual al total, el artículo se <strong>elimina permanentemente</strong>.
          Esta acción no se puede deshacer.
        </p>

        <div class="dc-confirm-grid">
          <div class="dc-cg-card">
            <span class="dc-cg-label">Motivo</span>
            <span class="dc-cg-value">{{ displayMotivo }}</span>
          </div>
          <div class="dc-cg-card">
            <span class="dc-cg-label">Responsable</span>
            <span class="dc-cg-value">{{ meta.responsable || '—' }}</span>
          </div>
          <div class="dc-cg-card">
            <span class="dc-cg-label">Artículos</span>
            <span class="dc-cg-value">{{ selectedClaves.size }}</span>
          </div>
          <div class="dc-cg-card">
            <span class="dc-cg-label">Stock a eliminar</span>
            <span class="dc-cg-value accent">{{ totalStockToRemove }}</span>
          </div>
        </div>

        <div class="dc-confirm-list" v-if="selectedList.length">
          <div v-for="s in selectedList" :key="s.clave" class="dc-cl-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-cl-icon">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            <div class="dc-cl-info">
              <strong>{{ s.nombre }}</strong>
              <span>
                <template v-if="s.isTotal">Baja total ({{ s.stock }} uds) · {{ s.clave }}</template>
                <template v-else>{{ s.bajaQty }} de {{ s.stock }} uds · {{ s.clave }}</template>
              </span>
            </div>
          </div>
        </div>

        <!-- Verificación de sesión admin -->
        <div class="dc-auth">
          <!-- Ya autenticado como admin -->
          <template v-if="adminSession">
            <div class="dc-auth-header dc-auth-ok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-auth-icon dc-auth-icon-ok">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <strong>Sesión de administrador activa</strong>
                <p>{{ adminSession.email }} — autorizado para dar de baja</p>
              </div>
            </div>
          </template>

          <!-- Necesita login de admin -->
          <template v-else>
            <div class="dc-auth-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-auth-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div>
                <strong>Autorización de administrador requerida</strong>
                <p>Inicia sesión con una cuenta de administrador para ejecutar esta baja</p>
              </div>
            </div>
            <label class="dc-field">
              <span>Email</span>
              <input
                v-model="loginEmail"
                type="email"
                class="dc-input"
                placeholder="admin@hospital.gob.mx"
                autocomplete="email"
              />
            </label>
            <label class="dc-field">
              <span>Contraseña</span>
              <div class="dc-auth-input-wrap">
                <input
                  v-model="loginPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="dc-input dc-auth-input"
                  placeholder="Contraseña del administrador"
                  autocomplete="current-password"
                  @keydown.enter.prevent="tryAdminLogin"
                />
                <button class="dc-auth-toggle" @click="showPassword = !showPassword" type="button">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </label>
            <button class="dc-login-btn" :disabled="!loginEmail || !loginPassword || loggingIn" @click="tryAdminLogin">
              <svg v-if="loggingIn" class="dc-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-dashoffset="10"/></svg>
              <template v-else>Iniciar sesión como admin</template>
            </button>
          </template>

          <p v-if="authError" class="dc-auth-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-auth-error-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ authError }}
          </p>
        </div>
      </div>
    </div>
  </WizardShell>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import WizardShell from './WizardShell.vue';
import { getStoredToken, saveToken, validateSession } from '@/utils/auth.js';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'success']);

const stepLabels = ['Motivo', 'Artículos', 'Autorización'];

const step         = ref(0);
const items        = ref([]);
const selectedClaves = ref(new Set());
const bajaQuantities = ref({});   // { [clave]: cantidadADarDeBaja }
const loadingItems = ref(false);
const submitting   = ref(false);
const showPassword = ref(false);
const authError    = ref('');
const searchQuery  = ref('');
const searchFocused = ref(false);
const visibleCount = ref(40);
const listRef      = ref(null);

/* Admin session state */
const adminSession = ref(null);     // { id, email, role, nombre } or null
const adminToken   = ref('');       // JWT token for the admin
const loginEmail   = ref('');
const loginPassword = ref('');
const loggingIn    = ref(false);

const meta = ref({
  responsable: '',
  motivo: '',
  motivoOtro: '',
  notas: '',
});

/* Check if current session is admin */
const checkExistingSession = async () => {
  try {
    const token = getStoredToken();
    if (!token) { adminSession.value = null; adminToken.value = ''; return; }
    const result = await validateSession();
    if (result.valid && result.user && result.user.role === 'admin') {
      adminSession.value = result.user;
      adminToken.value = token;
      // Auto-fill responsable with admin name
      if (!meta.value.responsable && result.user.nombre) {
        meta.value.responsable = result.user.nombre;
      }
    } else {
      adminSession.value = null;
      adminToken.value = '';
    }
  } catch {
    adminSession.value = null;
    adminToken.value = '';
  }
};

/* Login as admin */
const tryAdminLogin = async () => {
  authError.value = '';
  loggingIn.value = true;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail.value.trim(), password: loginPassword.value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.msg || 'Credenciales inválidas');
    if (data.role !== 'admin') {
      throw new Error('Esta cuenta no tiene permisos de administrador');
    }
    // Save token + session
    saveToken(data.token);
    adminToken.value = data.token;
    adminSession.value = { id: data.id, email: data.email || loginEmail.value, role: data.role, nombre: data.nombre };
    // Persist role/user data so global app state stays in sync
    try {
      localStorage.setItem('role', data.role);
      localStorage.setItem('nombre', data.nombre || '');
      localStorage.setItem('email', data.email || loginEmail.value);
      localStorage.setItem('user', JSON.stringify({ id: data.id, nombre: data.nombre, email: data.email, role: data.role }));
    } catch {}
    // Update responsable if empty
    if (!meta.value.responsable && data.nombre) {
      meta.value.responsable = data.nombre;
    }
    loginPassword.value = '';
  } catch (err) {
    authError.value = err.message;
  } finally {
    loggingIn.value = false;
  }
};

/* Debounced search */
const debouncedQuery = ref('');
let _timer = null;
watch(searchQuery, (v) => {
  clearTimeout(_timer);
  _timer = setTimeout(() => {
    debouncedQuery.value = v.trim().toLowerCase();
    visibleCount.value = 40;
    nextTick(() => { if (listRef.value) listRef.value.scrollTop = 0; });
  }, 180);
});

/* Filtered items */
const filteredItems = computed(() => {
  let r = items.value;
  const q = debouncedQuery.value;
  if (q) {
    r = r.filter(i => {
      const n = (i['Descripción del bien'] || '').toLowerCase();
      const c = (i['Clave  HRAEI'] || '').toLowerCase();
      return n.includes(q) || c.includes(q);
    });
  }
  return r;
});

const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value));

/* Helper to create unique ID for each item (prevents grouping by clave alone) */
const getItemId = (item) => {
  // Create unique ID using clave + serie + modelo + marca
  // This prevents items without a key from grouping incorrectly
  const clave = item['Clave  HRAEI'] || 'SIN_CLAVE';
  const serie = item['N'] || item['Número de serie'] || '';
  const modelo = item['MODELO'] || '';
  const marca = item['MARCA'] || '';
  return `${clave}|${serie}|${modelo}|${marca}`;
};

/* Toggle checkbox */
const toggleItem = (item) => {
  const itemId = getItemId(item);
  const next = new Set(selectedClaves.value);
  if (next.has(itemId)) {
    next.delete(itemId);
    const q = { ...bajaQuantities.value };
    delete q[itemId];
    bajaQuantities.value = q;
  } else {
    next.add(itemId);
    const total = parseInt(item['TOTAL EXISTENCIAS'] || 0);
    bajaQuantities.value = { ...bajaQuantities.value, [itemId]: total };
  }
  selectedClaves.value = next;
};

/* Free-type: accept any digits while typing, only strip non-numeric */
const onBajaInput = (item, e) => {
  const itemId = getItemId(item);
  const raw = e.target.value.replace(/[^0-9]/g, '');
  e.target.value = raw;                        // keep DOM clean
  bajaQuantities.value = { ...bajaQuantities.value, [itemId]: raw === '' ? '' : parseInt(raw) };
};

/* Clamp on blur: ensure 1 ≤ val ≤ max */
const clampBajaQty = (item) => {
  const itemId = getItemId(item);
  const max = parseInt(item['TOTAL EXISTENCIAS'] || 0) || 1;
  const cur = parseInt(bajaQuantities.value[itemId]) || 0;
  const clamped = Math.max(1, Math.min(max, cur));
  bajaQuantities.value = { ...bajaQuantities.value, [itemId]: clamped };
};

/* Step via +/- buttons (always clamped) */
const stepBajaQty = (item, delta) => {
  const itemId = getItemId(item);
  const max = parseInt(item['TOTAL EXISTENCIAS'] || 0) || 1;
  const cur = parseInt(bajaQuantities.value[itemId]) || 0;
  const clamped = Math.max(1, Math.min(max, cur + delta));
  bajaQuantities.value = { ...bajaQuantities.value, [itemId]: clamped };
};

/* Infinite scroll */
const onScroll = (e) => {
  const el = e.target;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    if (visibleCount.value < filteredItems.value.length) {
      visibleCount.value += 40;
    }
  }
};

/* Computed titles */
const title = computed(() => {
  if (step.value === 0) return 'Motivo de la Baja';
  if (step.value === 1) return 'Selecciona Artículos';
  return 'Autorización';
});
const subtitle = computed(() => {
  if (step.value === 0) return 'Indica la razón y el responsable';
  if (step.value === 1) return 'Marca los artículos y ajusta la cantidad a dar de baja';
  return 'Verifica los datos e ingresa con tu cuenta de administrador';
});

const displayMotivo = computed(() => {
  if (meta.value.motivo === 'Otro') return meta.value.motivoOtro || 'Otro';
  return meta.value.motivo || '—';
});

const totalStockToRemove = computed(() => {
  let total = 0;
  for (const clave of selectedClaves.value) {
    total += (bajaQuantities.value[clave] || 0);
  }
  return total;
});

const selectedList = computed(() => {
  return [...selectedClaves.value].map(itemId => {
    // Parse the composite ID to reconstruct search hint
    const [clave] = itemId.split('|');
    // Find the item that matches this ID
    const item = items.value.find(i => getItemId(i) === itemId);
    const stock = parseInt(item?.['TOTAL EXISTENCIAS'] || 0);
    const qty = bajaQuantities.value[itemId] || stock;
    return {
      clave: clave || itemId,
      nombre: item?.['Descripción del bien'] || clave,
      stock,
      bajaQty: qty,
      isTotal: qty >= stock,
    };
  });
});

/* Validación de step 0 */
const metaValid = computed(() => {
  if (!meta.value.responsable.trim()) return false;
  if (!meta.value.motivo) return false;
  if (meta.value.motivo === 'Otro' && !meta.value.motivoOtro.trim()) return false;
  return true;
});

/* Navigation guards */
const canNext = computed(() => {
  if (step.value === 0) return metaValid.value;
  if (step.value === 1) return selectedClaves.value.size > 0;
  return true;
});
const canFinish = computed(() =>
  selectedClaves.value.size > 0 && metaValid.value && !!adminSession.value
);

/* Load items */
const loadItems = async () => {
  loadingItems.value = true;
  try {
    const res = await fetch('/api/ops/stock-biomedica');
    if (res.ok) {
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data || []);
      items.value = raw.filter(i => parseInt(i['TOTAL EXISTENCIAS'] || 0) > 0);
    } else {
      items.value = [];
    }
  } catch { items.value = []; }
  finally { loadingItems.value = false; }
};

/* Steps */
const goNext = () => {
  if (step.value === 0 && metaValid.value) {
    loadItems();
    step.value = 1;
  } else if (step.value < 2) {
    authError.value = '';
    checkExistingSession();
    step.value++;
  }
};
const goBack = () => {
  if (step.value > 0) { authError.value = ''; step.value--; }
};

/* Reset */
const resetState = () => {
  step.value = 0;
  items.value = [];
  selectedClaves.value = new Set();
  bajaQuantities.value = {};
  submitting.value = false;
  showPassword.value = false;
  authError.value = '';
  searchQuery.value = '';
  debouncedQuery.value = '';
  visibleCount.value = 40;
  loginEmail.value = '';
  loginPassword.value = '';
  adminSession.value = null;
  adminToken.value = '';
  meta.value = { responsable: '', motivo: '', motivoOtro: '', notas: '' };
};

const close = () => { emit('close'); resetState(); };
watch(() => props.open, (v) => { if (v) resetState(); });

/* Submit */
const submit = async () => {
  authError.value = '';
  submitting.value = true;
  try {
    if (!selectedClaves.value.size) throw new Error('Selecciona artículos');
    if (!adminSession.value || !adminToken.value) throw new Error('Debes iniciar sesión como administrador');

    const motivo = meta.value.motivo === 'Otro' ? meta.value.motivoOtro : meta.value.motivo;

    // Convert composite IDs back to individual items with their details
    // Format: "clave|serie|modelo|marca"
    const body = {
      items: [...selectedClaves.value].map(itemId => {
        const [clave, serie, modelo, marca] = itemId.split('|');
        // Find the original item to get complete data if needed
        const originalItem = items.value.find(i => getItemId(i) === itemId);
        return {
          claveHRAEI: clave,
          serie: serie || undefined,
          modelo: modelo || undefined,
          marca: marca || undefined,
          cantidad: bajaQuantities.value[itemId] || undefined,
          // Include itemId for potential backend tracking (optional)
          itemId: itemId,
        };
      }),
      motivo,
      responsable: meta.value.responsable,
      notas: meta.value.notas,
    };

    const res = await fetch('/api/ops/inventory/decommission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken.value}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      const msg = data.msg || data.error || 'La baja falló';
      // If the backend says we need to login again
      if (data.needsLogin) {
        adminSession.value = null;
        adminToken.value = '';
        authError.value = msg;
        return;
      }
      throw new Error(msg);
    }

    // Build a summary notification
    const d = data.data || {};
    const countItems = d.totalOperaciones || selectedClaves.value.size;
    const countUnits = d.totalUnidadesBaja || totalStockToRemove.value;
    const adminEmail = adminSession.value?.email || '';
    const successMsg = `Baja completada: ${countItems} artículo(s), ${countUnits} unidad(es) eliminadas. Autorizado por ${adminEmail}`;

    emit('success', { message: successMsg, type: 'success', action: 'decommission' });
    close();
  } catch (err) {
    if (!authError.value) authError.value = err.message;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.fade-in { animation: dcFadeIn .3s ease-out; }
@keyframes dcFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.dc-step { flex: 1; min-height: 0; display: flex; flex-direction: column; }

/* --- Step 0: Form --- */
.dc-hint { font-size: 14px; color: rgba(255,255,255,.45); margin: 0 0 20px; }

.dc-form {
  display: flex; flex-direction: column; gap: 18px;
  max-width: 500px; margin: 0 auto; width: 100%;
  overflow-y: auto; flex: 1; min-height: 0;
}

.dc-form-icon {
  width: 64px; height: 64px; margin: 0 auto 8px;
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.dc-icon-big { width: 32px; height: 32px; color: #f87171; }

.dc-field {
  display: flex; flex-direction: column; gap: 5px;
}
.dc-field span {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .8px;
  color: rgba(255,255,255,.35);
}
.dc-input {
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff; font-size: 14px;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
  outline: none; width: 100%;
}
.dc-input:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(239,68,68,.1);
}
.dc-textarea { resize: none; }
select.dc-input {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
select.dc-input option {
  background: #1a1e2e;
  color: #e0e7ff;
}

/* --- Step 1: Search + Checkbox List --- */
.dc-search {
  display: flex; align-items: center; gap: 10px;
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  padding: 0 14px;
  height: 42px;
  transition: border-color .25s, box-shadow .25s;
  flex-shrink: 0;
}
.dc-search.focused {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(239,68,68,.12);
}
.dc-search-icon { width: 18px; height: 18px; color: rgba(255,255,255,.3); flex-shrink: 0; }
.dc-search.focused .dc-search-icon { color: #f87171; }
.dc-search-input {
  flex: 1; background: none; border: none; outline: none;
  color: #fff; font-size: 14px; font-family: inherit;
}
.dc-search-input::placeholder { color: rgba(255,255,255,.22); }
.dc-search-clear {
  width: 22px; height: 22px; border: none; background: rgba(255,255,255,.08);
  border-radius: 6px; color: rgba(255,255,255,.4); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.dc-search-clear:hover { background: rgba(255,255,255,.15); }
.dc-search-clear svg { width: 14px; height: 14px; }

.dc-stats {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: rgba(255,255,255,.35);
  padding: 8px 2px 0;
  flex-shrink: 0;
}
.dc-stats strong { font-weight: 700; color: rgba(255,255,255,.6); }
.dc-stats-accent strong { color: #f87171; }
.dc-stats-sep { color: rgba(255,255,255,.12); }

.dc-list {
  flex: 1; min-height: 0;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 4px 0 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.06) transparent;
  contain: layout style;
}
.dc-list::-webkit-scrollbar { width: 4px; }
.dc-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 9px; }

.dc-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 14px;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  contain: layout style;
}
.dc-item:hover {
  background: rgba(255,255,255,.05);
  border-color: rgba(255,255,255,.08);
}
.dc-item.selected {
  background: rgba(239,68,68,.06);
  border-color: rgba(239,68,68,.25);
}

.dc-checkbox {
  width: 20px; height: 20px; flex-shrink: 0;
  accent-color: #ef4444;
  cursor: pointer;
}

.dc-item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.dc-item-name {
  font-weight: 600; font-size: 13px; color: rgba(255,255,255,.88);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dc-item-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.dc-item-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px; padding: 1px 7px;
  background: rgba(255,255,255,.04); border-radius: 5px;
  color: rgba(255,255,255,.4);
}
.dc-item-stock { font-size: 11px; color: #f87171; font-weight: 500; }

/* --- Quantity stepper --- */
.dc-qty {
  display: flex; align-items: center;
  background: rgba(0,0,0,.30);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  border: 1px solid rgba(239,68,68,.2);
  flex-shrink: 0;
}
.dc-qty-btn {
  width: 28px; height: 28px;
  border-radius: 7px; border: none;
  background: rgba(255,255,255,.06);
  color: #f87171;
  font-weight: 700; font-size: 15px;
  cursor: pointer; transition: background .12s;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}
.dc-qty-btn:hover { background: rgba(239,68,68,.15); }
.dc-qty-input {
  width: 72px; height: 28px;
  background: none; border: none; outline: none;
  text-align: center; color: #fff;
  font-size: 14px; font-weight: 700;
  font-family: inherit;
  -moz-appearance: textfield;
  appearance: textfield;
}
.dc-qty-input::-webkit-inner-spin-button,
.dc-qty-input::-webkit-outer-spin-button { display: none; }
.dc-qty-max {
  font-size: 11px; color: rgba(255,255,255,.3);
  padding-right: 6px; white-space: nowrap;
}

.dc-more {
  text-align: center; padding: 12px; font-size: 12px;
  color: rgba(255,255,255,.25);
}

.dc-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  color: rgba(255,255,255,.3);
}
.dc-empty-icon { width: 40px; height: 40px; }
.dc-empty p { font-size: 13px; }

.dc-loading {
  flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 12px;
}
.dc-shimmer {
  height: 56px; border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.07) 50%, rgba(255,255,255,.03) 75%);
  background-size: 200% 100%;
  animation: dcShimmer 1.5s ease-in-out infinite;
}
@keyframes dcShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* --- Step 2: Confirmation --- */
.dc-confirm {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 8px 0;
  overflow-y: auto; flex: 1; min-height: 0;
}
.dc-confirm-icon {
  width: 72px; height: 72px;
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.dc-warn-icon { width: 36px; height: 36px; color: #f87171; }

.dc-confirm h2 { margin: 0; font-size: 22px; font-weight: 800; color: #fef2f2; }
.dc-confirm-sub {
  margin: 0; font-size: 13px; color: rgba(255,255,255,.4);
  text-align: center; max-width: 420px; line-height: 1.5;
}
.dc-confirm-sub strong { color: #f87171; }

.dc-confirm-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  width: 100%;
}
.dc-cg-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 14px;
  padding: 14px; display: flex; flex-direction: column; gap: 4px;
}
.dc-cg-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,.35); font-weight: 700; letter-spacing: .5px; }
.dc-cg-value { font-size: 15px; font-weight: 700; color: #fff; }
.dc-cg-value.accent { color: #f87171; }

.dc-confirm-list {
  width: 100%;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 16px;
  padding: 8px;
  display: flex; flex-direction: column; gap: 4px;
  max-height: 180px; overflow-y: auto;
}
.dc-cl-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 14px;
  background: rgba(255,255,255,.02);
  border-radius: 10px;
}
.dc-cl-icon { width: 20px; height: 20px; color: #f87171; flex-shrink: 0; }
.dc-cl-info { display: flex; flex-direction: column; }
.dc-cl-info strong { font-size: 13px; color: rgba(255,255,255,.85); }
.dc-cl-info span { font-size: 11px; color: rgba(255,255,255,.35); }

/* --- Auth block --- */
.dc-auth {
  width: 100%;
  background: rgba(239,68,68,.04);
  border: 1px solid rgba(239,68,68,.15);
  border-radius: 16px;
  padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
}
.dc-auth-header {
  display: flex; align-items: flex-start; gap: 14px;
}
.dc-auth-header.dc-auth-ok {
  background: rgba(52,211,153,.06);
  border-radius: 12px;
  padding: 12px;
}
.dc-auth-icon { width: 24px; height: 24px; color: #f87171; flex-shrink: 0; margin-top: 2px; }
.dc-auth-icon-ok { color: #34d399; }
.dc-auth-header strong { font-size: 14px; color: #fecaca; display: block; }
.dc-auth-ok strong { color: #a7f3d0; }
.dc-auth-header p { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,.35); }

.dc-auth-input-wrap {
  display: flex; align-items: center; gap: 0;
  background: rgba(0,0,0,.3);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.dc-auth-input-wrap:focus-within {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(239,68,68,.1);
}
.dc-auth-input {
  border: none; border-radius: 0; background: none;
  flex: 1;
}
.dc-auth-input:focus { box-shadow: none; }

.dc-auth-toggle {
  width: 40px; height: 40px; flex-shrink: 0;
  background: none; border: none;
  color: rgba(255,255,255,.35); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.dc-auth-toggle:hover { color: rgba(255,255,255,.6); }
.dc-auth-toggle svg { width: 18px; height: 18px; }

.dc-login-btn {
  width: 100%;
  padding: 12px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff; font-weight: 700; font-size: 14px;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity .2s, transform .1s;
}
.dc-login-btn:hover:not(:disabled) { opacity: .9; }
.dc-login-btn:active:not(:disabled) { transform: scale(.98); }
.dc-login-btn:disabled { opacity: .4; cursor: not-allowed; }
.dc-spin { width: 20px; height: 20px; animation: dcSpinAnim .8s linear infinite; }
@keyframes dcSpinAnim { to { transform: rotate(360deg); } }

.dc-auth-error {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #f87171; font-weight: 600;
  margin: 0;
  animation: dcShake .4s ease;
}
.dc-auth-error-icon { width: 16px; height: 16px; flex-shrink: 0; }

@keyframes dcShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@media (max-width: 700px) {
  .dc-confirm-grid { grid-template-columns: 1fr 1fr; }
}
</style>
