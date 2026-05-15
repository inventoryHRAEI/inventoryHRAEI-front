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
    mode-class="wz-mode-delete-catalog"
    @close="close"
    @back="goBack"
    @next="goNext"
    @submit="submit"
  >
    <!-- Step 0: Motivo y Responsable -->
    <div v-if="step === 0" class="dc-step dc-step-alt fade-in">
      <div class="dc-danger-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="banner-icon">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span><strong>ATENCIÓN; LEER ANTES DE CONTINUAR:</strong> Esta función eliminará de manera permanentemente el bien del catalogo.</span>
      </div>

      <div class="dc-layout-split">
        <div class="dc-form-visual">
          <div class="dc-form-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="dc-icon-huge">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h3>Autorización Requerida</h3>
          <p>Se requiere justificación administrativa para proceder con la eliminación absoluta.</p>
        </div>

        <div class="dc-form-fields">
          <label class="dc-field">
            <span>Responsable del Movimiento *</span>
            <input v-model="meta.responsable" class="dc-input dc-input-glow" placeholder="Nombre completo..." />
          </label>

          <label class="dc-field">
            <span>Motivo de eliminación absoluta *</span>
            <select v-model="meta.motivo" class="dc-input dc-input-glow">
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
            <span>Especificar detalle *</span>
            <input v-model="meta.motivoOtro" class="dc-input dc-input-glow" placeholder="Explique la razón..." />
          </label>

          <label class="dc-field">
            <span>Observaciones del movimiento</span>
            <textarea v-model="meta.notas" class="dc-input dc-input-glow dc-textarea" rows="3" placeholder="Anotaciones para el historial..."></textarea>
          </label>
        </div>
      </div>
    </div>
    <!-- ========== Step 1: Selección de artículos (checkbox) ========== -->
    <div v-if="step === 1" class="dc-step fade-in">
      <!-- Advanced Search Bar -->
      <div class="dc-search-container">
        <OrderFilterBar
          title="Búsqueda de bienes para baja"
          subtitle="Ubica bienes por clave, serie, marca, modelo, referencia o lote. Selecciona parámetros para filtrar."
          :filters="itemSearchFilters"
          :count-label="`Bienes encontrados: ${filteredItems.length}`"
          :suggestions-by-field="itemSearchFilters.suggestionsByField"
          :field-options="ITEM_FIELD_OPTIONS"
        />
      </div>

      <!-- Stats -->
      <div class="dc-stats">
        <span><strong>{{ filteredItems.length }}</strong> encontrados</span>
        <span class="dc-stats-sep">·</span>
        <span class="dc-stats-accent"><strong>{{ selectedCount }}</strong> marcado para eliminación</span>
      </div>
      <p v-if="selectedCount > 1" style="color: #ef4444; margin-top: 10px; font-size: 14px;">Solo puedes eliminar un artículo a la vez desde este panel.</p>
      <!-- Item List -->
      <ItemListVirtual
        :items="filteredItems"
        :quantities="quantities"
        :loading="loadingItems"
        placeholder="Resultados filtrados..."
        :showSimpleSearch="false"
        :search-scopes="['all', 'clave', 'descripcion', 'marca', 'modelo', 'referencia', 'lote', 'n']"
        :stock-filters="['all', 'with-stock', 'zero-stock']"
        :allow-fast-step="true"
        :fast-amount="5"
        @update:quantities="quantities = $event"
      />
    </div>

    <!-- ========== Step 2: Confirmación + Contraseña ========== -->
    <div v-if="step === 2" class="dc-step fade-in">
      <div class="dc-confirm">
        <div class="dc-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" class="dc-warn-icon">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2>Confirma la Eliminación</h2>
        <p class="dc-confirm-sub">
          Se eliminará el artículo del catálogo de forma <strong>permanente</strong> junto con todo su stock actual.
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
            <span class="dc-cg-label">Artículo seleccionado</span>
            <span class="dc-cg-value">{{ selectedList.length > 0 ? selectedList[0].clave : 'Ninguno' }}</span>
          </div>
          <div class="dc-cg-card">
            <span class="dc-cg-label">Stock que se perderá</span>
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
                Eliminación total del catálogo ({{ s.stock }} uds en stock) · {{ s.clave }}
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
import { ref, computed, watch, nextTick, reactive } from 'vue';
import Swal from 'sweetalert2';
import WizardShell from './WizardShell.vue';
import OrderFilterBar from '@/components/OrderFilterBar.vue';
import ItemListVirtual from './ItemListVirtual.vue';
import { getStoredToken, saveToken, validateSession } from '@/utils/auth.js';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close', 'success']);

const stepLabels = ['Motivo', 'Artículos', 'Autorización'];

const step         = ref(0);
const items        = ref([]);
const quantities   = ref({});   // Replaces bajaQuantities
const loadingItems = ref(false);
const submitting   = ref(false);
const showPassword = ref(false);
const authError    = ref('');
const searchFocused = ref(false);
const visibleCount = ref(40);
const listRef      = ref(null);

// --- Advanced Filter Refs ---
const filterClave = ref('')
const filterDescripcion = ref('')
const filterMarca = ref('')
const filterModelo = ref('')
const filterReferencia = ref('')
const filterLote = ref('')
const filterN = ref('')
const filterNoInventario = ref('')
const filterUbicacion = ref('')
const filterStockMin = ref(null)
const filterStockMax = ref(null)

const activeFilterKeys = ref(new Set())

const ITEM_FIELD_OPTIONS = [
  { key: 'clave', label: 'Clave HRAEI', placeholder: 'Ej. COMODATO', type: 'text' },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Nombre, modelo, serie...', type: 'text' },
  { key: 'marca', label: 'Marca', placeholder: 'Ej. Philips', type: 'text' },
  { key: 'modelo', label: 'Modelo', placeholder: 'Ej. MX40', type: 'text' },
  { key: 'referencia', label: 'Referencia', placeholder: 'Referencia interna', type: 'text' },
  { key: 'lote', label: 'Lote', placeholder: 'Ej. L123', type: 'text' },
  { key: 'n', label: 'N / Serie', placeholder: 'Número de serie', type: 'text' },
  { key: 'noInventario', label: 'No. inventario', placeholder: 'Ej. 12345', type: 'text' },
  { key: 'ubicacion', label: 'Ubicación', placeholder: 'Ej. UCIA', type: 'text' },
  { key: 'stockMin', label: 'Stock mínimo', placeholder: 'Mínimo', type: 'number' },
  { key: 'stockMax', label: 'Stock máximo', placeholder: 'Máximo', type: 'number' }
]

const activeFiltersList = computed(() => {
  const list = []
  const pushIf = (key, label, binding) => {
    const val = binding && typeof binding === 'object' && 'value' in binding ? binding.value : binding
    if (activeFilterKeys.value.has(key) || (val !== null && val !== undefined && String(val).trim() !== '')) {
      list.push({ key, label, bindings: { modelValue: binding } })
    }
  }
  pushIf('clave', 'Clave HRAEI', filterClave)
  pushIf('descripcion', 'Descripción', filterDescripcion)
  pushIf('marca', 'Marca', filterMarca)
  pushIf('modelo', 'Modelo', filterModelo)
  pushIf('referencia', 'Referencia', filterReferencia)
  pushIf('lote', 'Lote', filterLote)
  pushIf('n', 'N / Serie', filterN)
  pushIf('noInventario', 'No. inventario', filterNoInventario)
  pushIf('ubicacion', 'Ubicación', filterUbicacion)
  pushIf('stockMin', 'Stock mínimo', filterStockMin)
  pushIf('stockMax', 'Stock máximo', filterStockMax)
  return list
})

const chipsList = computed(() => {
  const chips = []
  if (filterClave.value) chips.push({ key: 'clave', label: 'Clave HRAEI', value: filterClave.value, bindings: { modelValue: filterClave } })
  if (filterDescripcion.value) chips.push({ key: 'descripcion', label: 'Descripción', value: filterDescripcion.value, bindings: { modelValue: filterDescripcion } })
  if (filterMarca.value) chips.push({ key: 'marca', label: 'Marca', value: filterMarca.value, bindings: { modelValue: filterMarca } })
  if (filterModelo.value) chips.push({ key: 'modelo', label: 'Modelo', value: filterModelo.value, bindings: { modelValue: filterModelo } })
  if (filterReferencia.value) chips.push({ key: 'referencia', label: 'Referencia', value: filterReferencia.value, bindings: { modelValue: filterReferencia } })
  if (filterLote.value) chips.push({ key: 'lote', label: 'Lote', value: filterLote.value, bindings: { modelValue: filterLote } })
  if (filterN.value) chips.push({ key: 'n', label: 'N / Serie', value: filterN.value, bindings: { modelValue: filterN } })
  if (filterNoInventario.value) chips.push({ key: 'noInventario', label: 'No. inventario', value: filterNoInventario.value, bindings: { modelValue: filterNoInventario } })
  if (filterUbicacion.value) chips.push({ key: 'ubicacion', label: 'Ubicación', value: filterUbicacion.value, bindings: { modelValue: filterUbicacion } })
  if (filterStockMin.value !== null && filterStockMin.value !== undefined) chips.push({ key: 'stockMin', label: 'Stock mínimo', value: filterStockMin.value, bindings: { modelValue: filterStockMin } })
  if (filterStockMax.value !== null && filterStockMax.value !== undefined) chips.push({ key: 'stockMax', label: 'Stock máximo', value: filterStockMax.value, bindings: { modelValue: filterStockMax } })
  return chips
})

const hasActiveFilters = computed(() => activeFiltersList.value.length > 0 || chipsList.value.length > 0)

function activateFilter(key) {
  activeFilterKeys.value.add(key)
}

function removeFilter(key) {
  activeFilterKeys.value.delete(key)
  if (key === 'clave') filterClave.value = ''
  else if (key === 'descripcion') filterDescripcion.value = ''
  else if (key === 'marca') filterMarca.value = ''
  else if (key === 'modelo') filterModelo.value = ''
  else if (key === 'referencia') filterReferencia.value = ''
  else if (key === 'lote') filterLote.value = ''
  else if (key === 'n') filterN.value = ''
  else if (key === 'noInventario') filterNoInventario.value = ''
  else if (key === 'ubicacion') filterUbicacion.value = ''
  else if (key === 'stockMin') filterStockMin.value = null
  else if (key === 'stockMax') filterStockMax.value = null
}

function clearAllFilters() {
  activeFilterKeys.value.clear()
  filterClave.value = ''
  filterDescripcion.value = ''
  filterMarca.value = ''
  filterModelo.value = ''
  filterReferencia.value = ''
  filterLote.value = ''
  filterN.value = ''
  filterNoInventario.value = ''
  filterUbicacion.value = ''
  filterStockMin.value = null
  filterStockMax.value = null
}

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const pickValue = (item, aliases = [], fallback = '') => {
  if (!item || typeof item !== 'object') return fallback;
  const normalizeKey = (key) => String(key || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const normalizedLookup = new Map();
  Object.keys(item).forEach((k) => {
    const normalized = normalizeKey(k);
    if (normalized && !normalizedLookup.has(normalized)) normalizedLookup.set(normalized, k);
  });
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(item, alias) && item[alias] !== null && item[alias] !== undefined && item[alias] !== '') return item[alias];
    const found = normalizedLookup.get(normalizeKey(alias));
    if (found && item[found] !== null && item[found] !== undefined && item[found] !== '') return item[found];
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
const getItemMarca = (item) => String(pickValue(item, ['MARCA', 'Marca', 'marca'], '') || '').trim();
const getItemModelo = (item) => String(pickValue(item, ['MODELO', 'Modelo', 'modelo'], '') || '').trim();
const getItemReferencia = (item) => String(pickValue(item, ['REFERENCIA', 'Referencia', 'referencia'], '') || '').trim();
const getItemLote = (item) => String(pickValue(item, ['LOTE', 'Lote', 'lote'], '') || '').trim();
const getItemSerie = (item) => String(pickValue(item, ['N', 'n', 'Número de serie', 'Numero de serie', 'id'], '') || '').trim();
const getItemNoInventario = (item) => String(pickValue(item, ['No DE INVENTARIO', 'No. Inventario', 'NO INVENTARIO', 'no_inventario', 'numero_inventario'], '') || '').trim();
const getItemUbicacion = (item) => String(pickValue(item, ['UBICACION ESPECIFICA', 'Ubicacion especifica', 'Ubicación específica', 'UBICACION', 'ubicacion'], '') || '').trim();
const getItemOrigen = (item) => String(pickValue(item, ['ORIGEN DEL BIEN', 'Origen del bien', 'origen', 'origen_bien'], '') || '').trim();
const getItemStock = (item) => {
  const raw = pickValue(item, ['TOTAL EXISTENCIAS', 'Total Excistencias', 'total_existencias', 'totalExistencias', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0);
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildItemDescriptor = (item) => {
  const parts = [
    getItemName(item),
    getItemClave(item) ? `Clave: ${getItemClave(item)}` : '',
    getItemNoInventario(item) ? `Inventario: ${getItemNoInventario(item)}` : '',
    getItemUbicacion(item) ? `Ubicación: ${getItemUbicacion(item)}` : '',
    getItemMarca(item) ? `Marca: ${getItemMarca(item)}` : '',
    getItemModelo(item) ? `Modelo: ${getItemModelo(item)}` : '',
    getItemReferencia(item) ? `Ref: ${getItemReferencia(item)}` : '',
    getItemLote(item) ? `Lote: ${getItemLote(item)}` : '',
    getItemSerie(item) ? `Serie: ${getItemSerie(item)}` : ''
  ].filter(Boolean)
  return parts.join(' · ')
}

const buildItemSearchText = (item) => {
  return normalizeText([
    getItemName(item),
    getItemClave(item),
    getItemMarca(item),
    getItemModelo(item),
    getItemReferencia(item),
    getItemLote(item),
    getItemSerie(item),
    getItemNoInventario(item),
    getItemUbicacion(item),
    getItemOrigen(item)
  ].join(' '))
}

/* suggestionsByField moved after filteredItems to enable context-aware refinement */

/* itemSearchFilters moved after suggestionsByField */

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

// Debounced search logic removed, now using direct computed filtering from OrderFilterBar
watch([filterClave, filterDescripcion, filterMarca, filterModelo, filterReferencia, filterLote, filterN, filterNoInventario, filterUbicacion, filterStockMin, filterStockMax], () => {
  visibleCount.value = 40;
  nextTick(() => { if (listRef.value) listRef.value.scrollTop = 0; });
});

/* Filtered items */
const filteredItems = computed(() => {
  let r = Array.isArray(items.value) ? items.value.slice() : []
  
  if (filterClave.value) {
    const s = normalizeText(filterClave.value)
    r = r.filter(it => normalizeText(getItemClave(it)).includes(s))
  }
  if (filterDescripcion.value) {
    const s = normalizeText(filterDescripcion.value)
    r = r.filter(it => {
      const descriptor = normalizeText(buildItemDescriptor(it))
      const searchable = buildItemSearchText(it)
      return descriptor.includes(s) || searchable.includes(s)
    })
  }
  if (filterMarca.value) {
    const s = normalizeText(filterMarca.value)
    r = r.filter(it => normalizeText(getItemMarca(it)).includes(s))
  }
  if (filterModelo.value) {
    const s = normalizeText(filterModelo.value)
    r = r.filter(it => normalizeText(getItemModelo(it)).includes(s))
  }
  if (filterReferencia.value) {
    const s = normalizeText(filterReferencia.value)
    r = r.filter(it => normalizeText(getItemReferencia(it)).includes(s))
  }
  if (filterLote.value) {
    const s = normalizeText(filterLote.value)
    r = r.filter(it => normalizeText(getItemLote(it)).includes(s))
  }
  if (filterN.value) {
    const s = normalizeText(filterN.value)
    r = r.filter(it => normalizeText(getItemSerie(it)).includes(s))
  }
  if (filterNoInventario.value) {
    const s = normalizeText(filterNoInventario.value)
    r = r.filter(it => normalizeText(getItemNoInventario(it)).includes(s))
  }
  if (filterUbicacion.value) {
    const s = normalizeText(filterUbicacion.value)
    r = r.filter(it => normalizeText(getItemUbicacion(it)).includes(s))
  }
  
  const parseNumber = v => (v === null || v === undefined || v === '') ? null : Number(v)
  const min = parseNumber(filterStockMin.value)
  const max = parseNumber(filterStockMax.value)
  
  if (min !== null) r = r.filter(it => getItemStock(it) >= min)
  if (max !== null) r = r.filter(it => getItemStock(it) <= max)
  
  return r
});

const suggestionsByField = computed(() => {
  const buckets = {}
  const list = Array.isArray(filteredItems.value) ? filteredItems.value : []
  const addBucket = (key, values, limit = 5000) => {
    const map = new Map()
    for (const raw of values) {
      const value = String(raw || '').trim()
      if (!value) continue
      const normalized = normalizeText(value)
      if (!normalized) continue
      const existing = map.get(normalized)
      if (existing) existing.count += 1
      else map.set(normalized, { value, label: value, count: 1 })
    }
    buckets[key] = Array.from(map.values()).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)).slice(0, limit)
  }

  addBucket('clave', list.map(i => getItemClave(i)))
  addBucket('descripcion', list.map(i => buildItemDescriptor(i)))
  addBucket('marca', list.map(i => getItemMarca(i)))
  addBucket('modelo', list.map(i => getItemModelo(i)))
  addBucket('referencia', list.map(i => getItemReferencia(i)))
  addBucket('lote', list.map(i => getItemLote(i)))
  addBucket('n', list.map(i => getItemSerie(i)))
  addBucket('noInventario', list.map(i => getItemNoInventario(i)))
  addBucket('ubicacion', list.map(i => getItemUbicacion(i)))
  return buckets
});

const itemSearchFilters = reactive({
  fieldBindings: {
    clave: filterClave,
    descripcion: filterDescripcion,
    marca: filterMarca,
    modelo: filterModelo,
    referencia: filterReferencia,
    lote: filterLote,
    n: filterN,
    noInventario: filterNoInventario,
    ubicacion: filterUbicacion,
    stockMin: filterStockMin,
    stockMax: filterStockMax
  },
  activeFiltersList,
  chipsList,
  hasActiveFilters,
  clearAllFilters,
  removeFilter,
  activateFilter,
  suggestionsByField
})

const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value));

/* Selection helpers */
const selectedCount = computed(() =>
  Object.values(quantities.value).filter(q => Number(q) > 0).length
);
const totalUnits = computed(() =>
  Object.values(quantities.value).reduce((s, q) => s + (Number(q) || 0), 0)
);

/* Infinite scroll logic removed, handled by ItemListVirtual */

/* Computed titles */
const title = computed(() => {
  if (step.value === 0) return 'Motivo de Eliminación';
  if (step.value === 1) return 'Selecciona Artículo';
  return 'Autorización';
});
const subtitle = computed(() => {
  if (step.value === 0) return 'Indica la razón y el responsable';
  if (step.value === 1) return 'Selecciona el artículo único a eliminar permanentemente';
  return 'Verifica los datos e ingresa con tu cuenta de administrador';
});

const displayMotivo = computed(() => {
  if (meta.value.motivo === 'Otro') return meta.value.motivoOtro || 'Otro';
  return meta.value.motivo || '—';
});

const totalStockToRemove = computed(() => totalUnits.value);

const selectedList = computed(() => {
  return Object.entries(quantities.value)
    .filter(([, q]) => Number(q) > 0)
    .map(([itemId, qty]) => {
      const item = items.value.find(i => getItemId(i) === itemId);
      const [clave] = itemId.split('|');
      const stock = parseInt(item?.['TOTAL EXISTENCIAS'] || 0);
      return {
        clave: clave || itemId,
        nombre: item ? getItemName(item) : itemId,
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
  if (step.value === 1) return selectedCount.value === 1; // Solo se permite eliminar 1 a la vez
  return true;
});
const canFinish = computed(() =>
  selectedCount.value === 1 && metaValid.value && !!adminSession.value
);

/* Load items */
const loadItems = async () => {
  loadingItems.value = true;
  try {
    const res = await fetch('/api/ops/stock-biomedica');
    if (res.ok) {
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data || []);
      items.value = raw.filter(i => getItemStock(i) > 0);
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
  quantities.value = {};
  submitting.value = false;
  showPassword.value = false;
  authError.value = '';
  searchFocused.value = false;
  visibleCount.value = 40;
  clearAllFilters();
  loginEmail.value = '';
  loginPassword.value = '';
  adminSession.value = null;
  adminToken.value = '';
  meta.value = { responsable: '', motivo: '', motivoOtro: '', notas: '' };
};

const close = () => { emit('close'); resetState(); };
watch(() => props.open, (v) => { if (v) resetState(); });

const darkSwal = { background: '#0f1423', color: '#e0e7ff', confirmButtonColor: '#5d8dff', cancelButtonColor: '#64748b' };

/* Submit */
const submit = async () => {
  authError.value = '';
  submitting.value = true;
  try {
    if (selectedCount.value !== 1) throw new Error('Selecciona exactamente un artículo para eliminar');
    if (!adminSession.value || !adminToken.value) throw new Error('Debes iniciar sesión como administrador');

    const motivo = meta.value.motivo === 'Otro' ? meta.value.motivoOtro : meta.value.motivo;
    const itemKey = Object.keys(quantities.value).find(k => Number(quantities.value[k]) > 0);
    const itemObj = items.value.find(i => getItemId(i) === itemKey);
    const [clave, serie, modelo, marca] = itemKey.split('|');
    const itemN = itemObj ? pickValue(itemObj, ['N', 'n'], '') : serie;

    const body = {
      item: {
        claveHRAEI: clave,
        itemN: itemN || undefined,
        modelo: modelo || undefined,
        marca: marca || undefined
      },
      motivo,
      responsable: meta.value.responsable,
      notas: meta.value.notas,
    };

    const res = await fetch('/api/ops/inventory/accessory', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken.value}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      const msg = data.msg || data.error || 'La eliminación falló';
      if (data.needsLogin) {
        adminSession.value = null;
        adminToken.value = '';
        authError.value = msg;
        return;
      }
      throw new Error(msg);
    }

    const d = data.data || {};
    const adminEmail = adminSession.value?.email || '';
    const successMsg = `El artículo ha sido eliminado permanentemente del catálogo y se ha retirado su stock (${d.stockEliminado || 0} unidades). Autorizado por ${adminEmail}.`;

    await Swal.fire({
      title: 'Eliminación completada',
      text: successMsg,
      icon: 'success',
      ...darkSwal
    });

    emit('success', { message: successMsg, type: 'success', action: 'deleteCatalog' });
    close();
  } catch (err) {
    console.error('[DeleteCatalogWizard] Submit error:', err);
    const raw = String(err?.message || '');
    let userMsg = 'No se pudo completar la eliminación.';
    if (raw.includes('administrador') || raw.includes('sesión')) userMsg = raw;
    else if (raw.includes('Selecciona')) userMsg = 'Debes seleccionar exactamente un artículo.';
    else userMsg = raw;

    Swal.fire({
      title: 'No se pudo eliminar',
      text: userMsg,
      icon: 'error',
      ...darkSwal
    });
    authError.value = userMsg;
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
.dc-search-container {
  margin-bottom: 12px;
  flex-shrink: 0;
}
/* Estilo heredado del componente OrderFilterBar */

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
.dc-cl-icon { width: 20px; height: 20px; color: #fb7185; flex-shrink: 0; }
.dc-cl-info { display: flex; flex-direction: column; }
.dc-cl-info strong { font-size: 13px; color: rgba(255,255,255,.85); }
.dc-cl-info span { font-size: 11px; color: rgba(255,255,255,.35); }

/* --- Auth block --- */
.dc-auth {
  width: 100%;
  background: rgba(225,29,72,.04);
  border: 1px solid rgba(225,29,72,.15);
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
.dc-auth-icon { width: 24px; height: 24px; color: #fb7185; flex-shrink: 0; margin-top: 2px; }
.dc-auth-icon-ok { color: #34d399; }
.dc-auth-header strong { font-size: 14px; color: #fecdd3; display: block; }
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
  border-color: #fb7185;
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
  background: linear-gradient(135deg, #e11d48, #be123c);
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
  font-size: 13px; color: #fb7185; font-weight: 600;
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

/* --- Deletion Variant Styles --- */
.dc-step-alt {
  padding-top: 10px;
}
.dc-danger-banner {
  background: rgba(225, 29, 72, 0.15);
  border: 1px dashed rgba(225, 29, 72, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fb7185;
  font-size: 14px;
  margin-bottom: 24px;
}
.banner-icon { width: 20px; height: 20px; flex-shrink: 0; }

.dc-layout-split {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}
.dc-form-visual {
  flex: 0 0 240px;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.dc-form-icon-circle {
  width: 80px; height: 80px;
  background: rgba(225, 29, 72, 0.1);
  border: 2px solid rgba(225, 29, 72, 0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  color: #fb7185;
}
.dc-icon-huge { width: 40px; height: 40px; }
.dc-form-visual h3 { font-size: 16px; margin: 0 0 8px; color: #fff; }
.dc-form-visual p { font-size: 12px; color: rgba(255, 255, 255, 0.4); margin: 0; line-height: 1.5; }

.dc-form-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dc-input-glow:focus {
  border-color: #fb7185 !important;
  box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.15) !important;
}

@media (max-width: 850px) {
  .dc-layout-split { flex-direction: column; gap: 24px; }
  .dc-form-visual { flex: none; width: 100%; display: flex; align-items: center; text-align: left; gap: 20px; padding: 16px; }
  .dc-form-icon-circle { margin: 0; width: 50px; height: 50px; }
  .dc-icon-huge { width: 24px; height: 24px; }
  .dc-form-visual div { flex: 1; }
}
.wz-danger-shell {
  border: 1px solid rgba(225, 29, 72, 0.3) !important;
  box-shadow: 0 32px 80px rgba(225, 29, 72, 0.15) !important;
}
</style>
