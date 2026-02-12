<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="open" class="wizard-backdrop" @click.self="closeWizard">
                <div class="wizard-container" :class="themeClass">
                    <!-- Animated background elements -->
                    <div class="glow-orb orb-1"></div>
                    <div class="glow-orb orb-2"></div>
                    <div class="glow-orb orb-3"></div>

                    <!-- Timeline Steps as connected nodes -->
                    <div class="timeline-container">
                        <div
                            v-for="(stepName, index) in stepNames"
                            :key="index"
                            class="timeline-node-wrapper"
                        >
                            <div
                                class="timeline-step"
                                :class="{ active: index === step, completed: index < step }"
                            >
                                <div class="timeline-dot" :style="{ '--delay': `${index * 0.1}s` }">
                                    <component
                                        :is="getStepIcon(index)"
                                        class="step-icon"
                                        v-if="index < step"
                                    />
                                    <span v-else>{{ index + 1 }}</span>
                                </div>
                                <div class="timeline-label">{{ stepName }}</div>
                            </div>

                            <!-- Connector between nodes -->
                            <div v-if="index < stepNames.length - 1" class="timeline-connector">
                                <div class="connector-track">
                                    <div
                                        class="connector-progress"
                                        :class="{
                                            'connector-filled': index < step,
                                            'connector-active': index === step - 1
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Header -->
                    <div class="wizard-header">
                        <div class="header-content">
                            <h1 class="header-title">{{ getStepTitle }}</h1>
                            <p v-if="step === 0" class="header-desc">Elige qué operación deseas realizar hoy</p>
                            <p v-else-if="step === 1 && operation === 'movement'" class="header-desc">Define la
                                dirección de tu transferencia</p>
                            <p v-else-if="step === 1 && operation === 'intake'" class="header-desc">Selecciona el tipo
                                de ingreso</p>
                            <p v-else class="header-desc">Completa los detalles para continuar</p>
                        </div>
                        <button class="close-btn" @click="closeWizard">
                            <XIcon size="24" />
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="wizard-body">
                        <!-- Step 0: Operation Selection -->
                        <div v-if="step === 0" class="step-content fade-in">
                            <div class="options-grid">
                                <button class="option-card movement-card" @click="selectOperation('movement')">
                                    <div class="card-glow"></div>
                                    <div class="card-shine"></div>
                                    <div class="icon-container">
                                        <div class="icon-wrapper">
                                            <ArrowRightLeftIcon class="option-icon" />
                                            <div class="icon-orbit"></div>
                                        </div>
                                        <div class="icon-pulse"></div>
                                    </div>
                                    <div class="card-content">
                                        <h3>Mover Stock</h3>
                                        <p>Transferir entre bodegas con control</p>
                                        <div class="card-badges">
                                            <span class="badge">Rápido</span>
                                            <span class="badge">Seguro</span>
                                        </div>
                                    </div>
                                </button>

                                <button class="option-card intake-card" @click="selectOperation('intake')">
                                    <div class="card-glow"></div>
                                    <div class="card-shine"></div>
                                    <div class="icon-container">
                                        <div class="icon-wrapper">
                                            <PlusCircleIcon class="option-icon" />
                                            <div class="icon-orbit"></div>
                                        </div>
                                        <div class="icon-pulse"></div>
                                    </div>
                                    <div class="card-content">
                                        <h3>Ingresar Bienes</h3>
                                        <p>Resurtir o crear nuevos artículos</p>
                                        <div class="card-badges">
                                            <span class="badge">Flexible</span>
                                            <span class="badge">Completo</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Step 1: Movement Direction -->
                        <div v-if="step === 1 && operation === 'movement'" class="step-content fade-in">
                            <div class="direction-group">
                                <button class="direction-btn forward" @click="selectDirection('subceye-to-biomedica')">
                                    <ArrowRightIcon class="direction-icon" />
                                    <div class="direction-text">
                                        <span class="warehouse">SUBCEYE</span>
                                        <span class="arrow">→</span>
                                        <span class="warehouse">Biomédica</span>
                                    </div>
                                </button>
                                <button class="direction-btn backward" @click="selectDirection('biomedica-to-subceye')">
                                    <ArrowLeftIcon class="direction-icon" />
                                    <div class="direction-text">
                                        <span class="warehouse">Biomédica</span>
                                        <span class="arrow">→</span>
                                        <span class="warehouse">SUBCEYE</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Step 1: Intake Type -->
                        <div v-if="step === 1 && operation === 'intake'" class="step-content fade-in">
                            <div class="options-grid">
                                <button class="option-card refill-card" @click="selectIntakeType('refill')">
                                    <div class="card-glow"></div>
                                    <div class="icon-container">
                                        <RotateCwIcon class="option-icon" />
                                        <div class="icon-pulse"></div>
                                    </div>
                                    <h3>Resurtir</h3>
                                    <p>Aumentar stock de items existentes</p>
                                </button>

                                <button class="option-card new-card" @click="selectIntakeType('new')">
                                    <div class="card-glow"></div>
                                    <div class="icon-container">
                                        <SquarePlusIcon class="option-icon" />
                                        <div class="icon-pulse"></div>
                                    </div>
                                    <h3>Nuevo Item</h3>
                                    <p>Crear nuevo consumible en el sistema</p>
                                </button>
                            </div>
                        </div>

                        <!-- Step 2: Movement details + items -->
                        <div v-if="step === 2 && operation === 'movement'" class="step-content fade-in">
                            <div class="two-column-layout">
                                <!-- Columna izquierda: metadatos de la operación -->
                                <div class="meta-panel h-full">
                                    <div class="panel-section-header">
                                        <div class="icon-orb-mini">
                                            <SparklesIcon size="14" />
                                        </div>
                                        <h2>Datos de Control</h2>
                                    </div>

                                    <div class="grid-form">
                                        <div class="form-field compact">
                                            <label>Responsable</label>
                                            <input
                                                v-model="operationMeta.responsable"
                                                type="text"
                                                class="form-input"
                                                placeholder="Nombre del responsable"
                                            />
                                        </div>
                                        
                                        <div class="form-field compact">
                                            <label>Tipo de movimiento</label>
                                            <div class="select-wrapper">
                                                <select v-model="operationMeta.tipoMovimiento" class="form-input select-input">
                                                    <option value="regular">Regular (Stock)</option>
                                                    <option value="urgente">Urgente (Urgencias/CEYE)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="form-field compact">
                                            <label>Servicio / Área</label>
                                            <input
                                                v-model="operationMeta.servicio"
                                                type="text"
                                                class="form-input"
                                                placeholder="Ej. Subdirección Biomédica"
                                            />
                                        </div>

                                        <div class="form-field compact">
                                            <label>Motivo</label>
                                            <input
                                                v-model="operationMeta.motivo"
                                                type="text"
                                                class="form-input"
                                                placeholder="Ej. Reposición de stock"
                                            />
                                        </div>
                                    </div>

                                    <div class="form-field compact mt-4">
                                        <label>Notas de operación</label>
                                        <textarea
                                            v-model="operationMeta.notas"
                                            rows="2"
                                            class="form-textarea"
                                            placeholder="Detalles adicionales..."
                                        ></textarea>
                                    </div>
                                </div>

                                <!-- Columna derecha: listado de artículos -->
                                <div class="items-panel h-full">
                                    <div class="panel-header-row bordered">
                                        <div class="header-main">
                                            <h2>Artículos</h2>
                                            <div class="search-bar-modern">
                                                <SearchIcon size="16" class="search-icon" />
                                                <input 
                                                    v-model="searchQuery" 
                                                    type="text" 
                                                    placeholder="Buscar por nombre o clave..." 
                                                    class="search-input-field"
                                                />
                                            </div>
                                        </div>
                                        <div class="summary-badges-modern">
                                            <div class="summary-item">
                                                <span class="label">Items</span>
                                                <span class="value">{{ selectedItemCount }}</span>
                                            </div>
                                            <div class="summary-divider"></div>
                                            <div class="summary-item active">
                                                <span class="label">Total</span>
                                                <span class="value">{{ totalSelectedUnits }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="loading" class="loading-placeholder">
                                        <div class="shimmer-pulse"></div>
                                        <p>Conectando con bodega...</p>
                                    </div>
                                    <div v-else-if="filteredItems.length > 0" class="items-list-custom" @scroll.passive="onItemsScroll">
                                        <div
                                            v-for="item in visibleItems"
                                            :key="item['Clave  HRAEI']"
                                            class="item-row-glass"
                                            :class="{ 'has-qty': quantities[item['Clave  HRAEI']] > 0 }"
                                        >
                                            <div class="item-main-info">
                                                <span class="item-name">{{ item['Descripción del bien'] }}</span>
                                                <div class="item-meta-tags">
                                                    <span class="tag-clave"># {{ item['Clave  HRAEI'] }}</span>
                                                    <span class="tag-stock">Existencia: {{ item['TOTAL EXISTENCIAS'] }}</span>
                                                </div>
                                            </div>
                                            
                                            <div class="qty-stepper">
                                                <button @click="stepQuantity(getItemId(item), -1, item['TOTAL EXISTENCIAS'])" class="step-btn">-</button>
                                                <input 
                                                    type="number" 
                                                    :value="quantities[getItemId(item)] || 0"
                                                    @input="updateQuantity(getItemId(item), $event)"
                                                    class="qty-val"
                                                >
                                                <button @click="stepQuantity(getItemId(item), 1, item['TOTAL EXISTENCIAS'])" class="step-btn">+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="empty-state-simple">
                                        <BoxIcon class="icon" />
                                        <p>{{ items.length > 0 ? 'No hay resultados para tu búsqueda' : 'Bodega vacía o sin stock disponible' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Select Items (Refill) -->
                        <div v-if="step === 2 && operation === 'intake' && intakeType === 'refill'"
                            class="step-content fade-in">
                            <div class="two-column-layout">
                                <div class="meta-panel h-full">
                                    <div class="panel-section-header">
                                        <div class="icon-orb-mini">
                                            <RotateCwIcon size="14" />
                                        </div>
                                        <h2>Datos de Entrada</h2>
                                    </div>

                                    <div class="grid-form">
                                        <div class="form-field compact">
                                            <label>Responsable</label>
                                            <input v-model="operationMeta.responsable" type="text" class="form-input" />
                                        </div>
                                        <div class="form-field compact">
                                            <label>Proveedor / Origen</label>
                                            <input v-model="operationMeta.proveedor" type="text" class="form-input" placeholder="Nombre de la empresa" />
                                        </div>
                                        <div class="form-field compact">
                                            <label>Motivo de resurtido</label>
                                            <input v-model="operationMeta.motivo" type="text" class="form-input" placeholder="Ej. Licitación 2024" />
                                        </div>
                                    </div>
                                </div>

                                <div class="items-panel h-full">
                                    <div class="panel-header-row bordered">
                                         <div class="header-main">
                                            <h2>Resurtido</h2>
                                            <div class="search-bar-modern">
                                                <SearchIcon size="16" class="search-icon" />
                                                <input 
                                                    v-model="searchQuery" 
                                                    type="text" 
                                                    placeholder="Filtrar catálogo..." 
                                                    class="search-input-field"
                                                />
                                            </div>
                                        </div>
                                        <div class="summary-badges-modern">
                                            <div class="summary-item active">
                                                <span class="label">Ingreso</span>
                                                <span class="value">{{ totalSelectedUnits }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="loading" class="loading-placeholder">
                                        <div class="shimmer-pulse"></div>
                                    </div>
                                    <div v-else class="items-list-custom" @scroll.passive="onItemsScroll">
                                        <div v-for="item in visibleItems" :key="getItemId(item)" class="item-row-glass" :class="{ 'has-qty': quantities[getItemId(item)] > 0 }">
                                            <div class="item-main-info">
                                                <span class="item-name">{{ item['Descripción del bien'] }}</span>
                                                <span class="tag-clave">{{ item['Clave  HRAEI'] }}</span>
                                            </div>
                                            <div class="qty-stepper">
                                                <button @click="stepQuantity(getItemId(item), -5)" class="step-btn fast">--</button>
                                                <button @click="stepQuantity(getItemId(item), -1)" class="step-btn">-</button>
                                                <input type="number" :value="quantities[getItemId(item)] || 0" @input="updateQuantity(getItemId(item), $event)" class="qty-val">
                                                <button @click="stepQuantity(getItemId(item), 1)" class="step-btn">+</button>
                                                <button @click="stepQuantity(getItemId(item), 5)" class="step-btn fast">++</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: New Item Flow -->
                        <div v-if="step === 2 && operation === 'intake' && intakeType === 'new'" class="step-content fade-in">
                            <div class="new-item-wizard">
                                <div class="wizard-side-nav">
                                    <div class="nav-info">
                                        <div class="icon-bg pink-glow"><SparklesIcon size="24"/></div>
                                        <h3>Nuevo Registro</h3>
                                        <p>Completa la información esencial para el catálogo</p>
                                    </div>
                                    <div class="nav-minimal-info">
                                        <div class="info-tag"><HashIcon size="12"/> Requerido</div>
                                    </div>
                                </div>

                                <div class="wizard-main-form">
                                    <div class="form-grid-modern">
                                        <div class="form-group span-2">
                                            <label>Nombre / Descripción Técnica</label>
                                            <input v-model="newItem.descripcion" type="text" class="modern-input" placeholder="Ej. Jeringa estéril de 5ml">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Clave HRAEI</label>
                                            <input v-model="newItem.claveHRAEI" type="text" class="modern-input" placeholder="C-XXXXX">
                                        </div>

                                        <div class="form-group">
                                            <label>Unidad de Medida</label>
                                            <select v-model="newItem.unidadMedida" class="modern-input">
                                                <option value="">Selecciona...</option>
                                                <option value="Pieza">Pieza</option>
                                                <option value="Caja">Caja</option>
                                                <option value="Envase">Envase</option>
                                            </select>
                                        </div>

                                        <div class="form-group">
                                            <label>Cantidad Inicial</label>
                                            <div class="premium-qty-input">
                                                <button @click="newItem.cantidad > 0 ? newItem.cantidad-- : null" class="qty-ctrl">-</button>
                                                <input v-model.number="newItem.cantidad" type="number" class="qty-input-main">
                                                <button @click="newItem.cantidad++" class="qty-ctrl">+</button>
                                            </div>
                                        </div>

                                        <div class="form-group">
                                            <label>Responsable de solicitud</label>
                                            <input v-model="operationMeta.responsable" type="text" class="modern-input" placeholder="Nombre completo">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Confirmation Flow (Universal) -->
                        <div v-if="step === 3"
                            class="step-content fade-in">
                            <div class="confirmation-panel-premium">
                                <div class="conf-header">
                                    <div class="conf-icon">
                                        <ShieldCheckIcon size="48" style="color: #60a5fa" />
                                    </div>
                                    <h2>Verifica la Operación</h2>
                                    <p>Estás a punto de registrar un cambio irreversible en el inventario</p>
                                </div>

                                <div class="conf-details-grid">
                                    <div class="conf-card">
                                        <span class="label">Operación</span>
                                        <span class="value" style="color: #60a5fa">{{ operation === 'movement' ? 'TRANSFERENCIA' : 'INGRESO' }}</span>
                                    </div>
                                    <div class="conf-card">
                                        <span class="label">Responsable</span>
                                        <span class="value">{{ operationMeta.responsable || 'No indicado' }}</span>
                                    </div>
                                    <div class="conf-card" v-if="operation === 'movement'">
                                        <span class="label">Destino</span>
                                        <span class="value">{{ operationMeta.servicio || 'Subdirección' }}</span>
                                    </div>
                                    <div class="conf-card" v-if="operation === 'intake' && intakeType === 'new'">
                                        <span class="label">Unidades a Crear</span>
                                        <span class="value">{{ newItem.cantidad }}</span>
                                    </div>
                                    <div class="conf-card" v-else>
                                        <span class="label">Total Unidades</span>
                                        <span class="value">{{ totalSelectedUnits }}</span>
                                    </div>
                                </div>

                                <div class="conf-summary-list">
                                    <div v-if="operation === 'intake' && intakeType === 'new'" class="summary-item-premium">
                                        <PackageIcon size="20" />
                                        <div class="txt">
                                            <strong>{{ newItem.descripcion }}</strong>
                                            <span>Clave: {{ newItem.claveHRAEI }} | Cantidad: {{ newItem.cantidad }} {{ newItem.unidadMedida }}</span>
                                        </div>
                                    </div>
                                    <div v-else v-for="item in selectedItems" :key="item['Clave  HRAEI']" class="summary-item-premium">
                                        <PackageIcon size="20" />
                                        <div class="txt">
                                            <strong>{{ item['Descripción del bien'] }}</strong>
                                            <span>{{ quantities[getItemId(item)] }} unidades extraídas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="wizard-footer">
                        <button v-if="step > 0" class="btn btn-secondary" @click="goBack">
                            <ChevronLeftIcon size="18" />
                            Atrás
                        </button>
                        <div class="flex-spacer"></div>
                        <button v-if="step < maxStep" class="btn btn-primary" @click="nextStep" :disabled="!canNext">
                            Siguiente
                            <ChevronRightIcon size="18" />
                        </button>
                        <button v-else class="btn btn-success" @click="submit" :disabled="!canFinish || submitting">
                            <CheckCircleIcon v-if="!submitting" size="18" />
                            <Loader2Icon v-else size="18" class="spin" />
                            {{ submitting ? 'Procesando...' : 'Finalizar' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {
    XIcon,
    ArrowRightLeftIcon,
    PlusCircleIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    RotateCwIcon,
    SquarePlusIcon,
    PackageIcon,
    BoxIcon,
    SparklesIcon,
    HashIcon,
    TagIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    Loader2Icon,
    CheckIcon,
    Clock3Icon,
    Zap,
    ShieldCheckIcon,
    SearchIcon
} from 'lucide-vue-next';

const props = defineProps({
    open: Boolean,
});

const emit = defineEmits(['close', 'success']);

// State
const step = ref(0);
const operation = ref(null);
const direction = ref(null);
const intakeType = ref(null);
const items = ref([]);
const quantities = ref({});
// Metadatos generales de la operación (más "reales")
const operationMeta = ref({
    responsable: '',
    servicio: '',
    folio: '',
    motivo: '',
    notas: '',
    // Campos específicos según operación
    tipoMovimiento: '', // regular | urgente
    referenciaOrden: '',
    proveedor: '',
    documentoProveedor: '', // factura / remisión
});
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const searchQueryDebounced = ref('');
const visibleCount = ref(40); // número inicial de items renderizados
const VISIBLE_STEP = 40;
const newItem = ref({
    claveHRAEI: '',
    descripcion: '',
    unidadMedida: '',
    cantidad: null,
    marca: '',
    modelo: '',
    lote: '',
    referencia: '',
});

// Helper para crear ID único por item (incluye N para items sin clave)
const getItemId = (item) => {
    const clave = item['Clave  HRAEI'] || 'SIN_CLAVE';
    const serie = item['N'] || item['Número de serie'] || '';
    const modelo = item['MODELO'] || '';
    const marca = item['MARCA'] || '';
    return `${clave}|${serie}|${modelo}|${marca}`;
};

// Icons + Meta summary logic
const selectedItems = computed(() => {
    return items.value.filter(item => (quantities.value[getItemId(item)] || 0) > 0);
});

const filteredItems = computed(() => {
    let result = [...items.value];
    
    // Búsqueda (usamos el debounce para evitar recalculos constantes)
    const query = searchQueryDebounced.value || '';
    if (query) {
        result = result.filter(item => {
            const name = (item['Descripción del bien'] || '').toString().toLowerCase();
            const clave = (item['Clave  HRAEI'] || '').toString().toLowerCase();
            const exist = (item['TOTAL EXISTENCIAS'] || '').toString().toLowerCase();
            return name.includes(query) || clave.includes(query) || exist.includes(query);
        });
    }

    // Ordenar por "más nuevo"
    return result.sort((a, b) => {
        const idA = a.id || a.N || 0;
        const idB = b.id || b.N || 0;
        return idB - idA;
    });
});

// Items visibles para evitar render de listas largas (virtualización simple)
const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value));

// Debounce manual para searchQuery -> searchQueryDebounced
let _debounceTimer = null;
watch(searchQuery, (val) => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
        searchQueryDebounced.value = (val || '').toString().trim().toLowerCase();
        visibleCount.value = VISIBLE_STEP; // resetear ventana al cambiar búsqueda
    }, 220);
});

const stepNames = computed(() => {
    if (operation.value === 'intake' && intakeType.value === 'new') {
        return ['Operación', 'Tipo', 'Nuevo Bien', 'Confirmación'];
    }
    return ['Operación', 'Configuración', 'Artículos', 'Confirmación'];
});

const maxStep = computed(() => {
    return 3;
});

const progressPercent = computed(() => {
    return (step.value / maxStep.value) * 100;
});

const themeClass = computed(() => {
    if (operation.value === 'movement') return 'mode-movement';
    if (operation.value === 'intake' && intakeType.value === 'refill') return 'mode-refill';
    if (operation.value === 'intake' && intakeType.value === 'new') return 'mode-new';
    return 'mode-neutral';
});

const selectedItemCount = computed(() => {
    return Object.values(quantities.value).filter((q) => Number(q) > 0).length;
});

const totalSelectedUnits = computed(() => {
    return Object.values(quantities.value).reduce((sum, q) => sum + (Number(q) || 0), 0);
});

const getStepTitle = computed(() => {
    if (step.value === 0) return 'Selecciona una Operación';
    if (step.value === 1) {
        if (operation.value === 'movement') return 'Define la Dirección';
        if (operation.value === 'intake') return 'Tipo de Ingreso';
    }
    if (step.value === 2) {
        if (operation.value === 'movement') return 'Selecciona Artículos';
        if (operation.value === 'intake' && intakeType.value === 'refill') return 'Resurtir Stock';
        if (operation.value === 'intake' && intakeType.value === 'new') return 'Identificación del Bien';
    }
    if (step.value === 3) {
        if (operation.value === 'intake' && intakeType.value === 'new') return 'Especificaciones Técnicas';
        return 'Verifica la Operación';
    }
    return 'Confirmación Final';
});

const getStepIcon = (index) => {
    if (index === 0) return CheckIcon;
    if (index === 1) return Zap;
    return Clock3Icon;
};

const canNext = computed(() => {
    if (step.value === 0) return !!operation.value;
    if (step.value === 1 && operation.value === 'movement') return !!direction.value;
    if (step.value === 1 && operation.value === 'intake') return !!intakeType.value;
    return true;
});

const canFinish = computed(() => {
    const hasBasicMeta = operationMeta.value.responsable;

    if (operation.value === 'movement') {
        return hasBasicMeta && Object.values(quantities.value).some(q => q > 0);
    }
    if (intakeType.value === 'refill') {
        return hasBasicMeta && Object.values(quantities.value).some(q => q > 0);
    }
    if (intakeType.value === 'new') {
        return (
            hasBasicMeta &&
            newItem.value.claveHRAEI &&
            newItem.value.descripcion &&
            newItem.value.cantidad > 0 &&
            newItem.value.unidadMedida
        );
    }
    return false;
});

const closeWizard = () => {
    emit('close');
    step.value = 0;
    operation.value = null;
    direction.value = null;
    intakeType.value = null;
    quantities.value = {};
    newItem.value = {
        claveHRAEI: '',
        descripcion: '',
        unidadMedida: '',
        cantidad: null,
        marca: '',
        modelo: '',
        lote: '',
        referencia: '',
    };
    operationMeta.value = {
        responsable: '',
        servicio: '',
        folio: '',
        motivo: '',
        notas: '',
        tipoMovimiento: '',
        referenciaOrden: '',
        proveedor: '',
        documentoProveedor: '',
    };
};

const selectOperation = (op) => {
    operation.value = op;
    step.value = 1;
};

const selectDirection = (dir) => {
    direction.value = dir;
    step.value = 2;
    loadItems();
};

const selectIntakeType = (type) => {
    intakeType.value = type;
    step.value = 2;
    if (type === 'refill') {
        loadItems();
    }
};

const loadItems = async () => {
    loading.value = true;
    try {
        let warehouse = 'biomedica';
        if (direction.value === 'subceye-to-biomedica') warehouse = 'subceye';
        else if (direction.value === 'biomedica-to-subceye') warehouse = 'biomedica';

        const response = await fetch(`/api/ops/stock-biomedica?bodega=${warehouse}`);
        if (response.ok) {
            const data = await response.json();
            items.value = Array.isArray(data) ? data : (data.data || []);
            quantities.value = {};
        } else {
            console.error('Error loading items:', response.status);
            items.value = [];
        }
    } catch (error) {
        console.error('Error loading items:', error);
        items.value = [];
    } finally {
        loading.value = false;
    }
};

const updateQuantity = (itemId, event) => {
    const value = parseInt(event.target.value) || 0;
    quantities.value[itemId] = value > 0 ? value : 0;
};

const stepQuantity = (itemId, delta, max = null) => {
    const current = Number(quantities.value[itemId] || 0);
    let next = current + delta;
    if (next < 0) next = 0;
    if (max != null && next > max) next = max;
    quantities.value[itemId] = next;
};

const goBack = () => {
    if (step.value === 0) return;
    
    // Al regresar del paso 2 (Selección de artículos), limpiamos búsqueda
    if (step.value === 2) {
        searchQuery.value = '';
    }

    // Al regresar del paso 1 al 0, reiniciamos la operación para permitir cambio de flujo
    if (step.value === 1) {
        operation.value = null;
        direction.value = null;
        intakeType.value = null;
    }

    step.value--;
};

const nextStep = () => {
    if (step.value < maxStep.value) {
        // Reset search when moving away from selection step
        if (step.value === 2) searchQuery.value = '';
        step.value++;
    }
};

const submit = async () => {
    submitting.value = true;
    try {
        if (operation.value === 'movement') {
            await submitMovement();
        } else if (operation.value === 'intake') {
            await submitIntake();
        }
        emit('success');
        closeWizard();
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        submitting.value = false;
    }
};

const submitMovement = async () => {
    // Construir lista de items a mover, recuperando la información completa desde el array original
    const itemsToMove = [];
    for (const item of items.value) {
        const itemId = getItemId(item);
        const qty = quantities.value[itemId];
        if (qty && qty > 0) {
            itemsToMove.push({
                claveHRAEI: itemId, // Usar ID compuesta (incluye N para items sin clave)
                cantidad: Number(qty)
            });
        }
    }

    if (!itemsToMove.length) throw new Error('Selecciona artículos para mover');

    let desde = 'OFICINA';
    let hacia = 'SUBCEYE';
    if (direction.value === 'subceye-to-biomedica') {
        desde = 'SUBCEYE';
        hacia = 'OFICINA';
    } else if (direction.value === 'biomedica-to-subceye') {
        desde = 'OFICINA';
        hacia = 'SUBCEYE';
    }

    const body = {
        desde,
        hacia,
        items: itemsToMove,
        metadata: { ...operationMeta.value },
    };

    const response = await fetch('/api/ops/inventory/warehouse-movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
        throw new Error(data.msg || data.error || 'La transferencia falló');
    }
};

const submitIntake = async () => {
    if (intakeType.value === 'refill') {
        const itemsToRefill = [];
        for (const item of items.value) {
            const itemId = getItemId(item);
            const qty = quantities.value[itemId];
            if (qty && qty > 0) {
                itemsToRefill.push({
                    claveHRAEI: itemId, // Usar ID compuesta (incluye N para items sin clave)
                    distribucion: {
                        subceye: Number(qty),
                        oficina: 0,
                    },
                });
            }
        }

        if (!itemsToRefill.length) throw new Error('Selecciona artículos para resurtir');

        const payload = {
            tipoRegistro: 'refill',
            items: itemsToRefill,
            metadata: { ...operationMeta.value },
        };

        const response = await fetch('/api/ops/inventory/consumables-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
            throw new Error(data.msg || data.error || 'El resurtido falló');
        }
    } else if (intakeType.value === 'new') {
        const dist = {
            subceye: Number(newItem.value.cantidad || 0),
            oficina: 0,
        };

        const payload = {
            tipoRegistro: 'new',
            items: [
                {
                    claveHRAEI: newItem.value.claveHRAEI,
                    descripcion: newItem.value.descripcion,
                    unidadMedida: newItem.value.unidadMedida,
                    marca: newItem.value.marca,
                    modelo: newItem.value.modelo,
                    lote: newItem.value.lote,
                    referencia: newItem.value.referencia,
                    distribucion: dist,
                },
            ],
            metadata: { ...operationMeta.value },
        };

        const response = await fetch('/api/ops/inventory/consumables-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
            throw new Error(data.msg || data.error || 'La creación falló');
        }
    }
};

// Manejo de scroll para carga incremental (virtualización simple)
const onItemsScroll = (e) => {
    try {
        const el = e.target;
        if (!el) return;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
        if (nearBottom && visibleCount.value < filteredItems.value.length) {
            visibleCount.value = Math.min(filteredItems.value.length, visibleCount.value + VISIBLE_STEP);
        }
    } catch (err) {
        // silencioso
    }
};

// Atajos de teclado y limpieza
const _onKeyDown = (ev) => {
    // evitar interferir cuando el usuario está escribiendo
    const active = document.activeElement;
    const editing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (ev.key === 'Escape') {
        ev.preventDefault();
        if (step.value > 0) goBack(); else closeWizard();
    }
    if (ev.key === 'Enter' && !editing) {
        ev.preventDefault();
        if (canNext.value) nextStep();
        else if (step.value === maxStep.value && canFinish.value) submit();
    }
};

onMounted(() => {
    window.addEventListener('keydown', _onKeyDown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', _onKeyDown);
    clearTimeout(_debounceTimer);
});
</script>

<style scoped>
/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-10px) rotate(5deg);
    }
}

@keyframes glow {

    0%,
    100% {
        box-shadow: 0 0 20px rgba(99, 179, 237, 0.4);
    }

    50% {
        box-shadow: 0 0 40px rgba(99, 179, 237, 0.8);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes float-hover {

    0%,
    100% {
        transform: translateY(-5px) rotate(0deg);
    }

    50% {
        transform: translateY(-15px) rotate(-5deg);
    }
}

@keyframes orbit {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes shine {
    from {
        left: -100%;
    }

    to {
        left: 100%;
    }
}

@keyframes shine-slow {
    0% {
        left: -100%;
    }

    100% {
        left: 100%;
    }
}

@keyframes glow-pulse {

    0%,
    100% {
        opacity: 0.5;
    }

    50% {
        opacity: 1;
    }
}

@keyframes fade-bounce {

    0%,
    100% {
        opacity: 0.7;
        transform: translateY(0px);
    }

    50% {
        opacity: 1;
        transform: translateY(-2px);
    }
}

@keyframes success-glow {

    0%,
    100% {
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.1);
    }

    50% {
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.25);
    }
}

.spin {
    animation: spin 1s linear infinite;
}

.fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* Backdrop */
.wizard-backdrop {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(20, 30, 50, 0.7));
    backdrop-filter: blur(12px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 80px;
    padding-bottom: 32px;
    z-index: 50;
}

/* Container */
/* --- Estructura Global y Contenedor Principal --- */
.wizard-container {
    width: 95vw;
    max-width: 1100px;
    height: 85vh;
    max-height: 800px;
    background: rgba(15, 20, 35, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 100;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
    animation: wizardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Reducción de lag: Optimizaciones de renderizado */
.wizard-container * {
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
}

@keyframes wizardEntrance {
    0% { opacity: 0; transform: scale(0.9) translateY(30px); filter: blur(10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
}

.wizard-container::after {
    content: '';
    position: absolute;
    inset: 0;
    background: 
        radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 40%);
    pointer-events: none;
    z-index: -1;
}

/* Layout columns - Mejorado para evitar scroll innecesario */
.two-column-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 24px;
    height: 100%;
    padding: 8px;
    overflow: hidden;
}

.meta-panel {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 24px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
}

.panel-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.panel-section-header h2 {
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.icon-orb-mini {
    width: 28px;
    height: 28px;
    background: var(--accent-gradient, linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.items-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.panel-header-row.bordered {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-main h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
}

.panel-subtitle {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.5);
    margin: 4px 0 0 0;
}

.search-bar-modern {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 8px 16px;
    margin-top: 12px;
    width: 100%;
    max-width: 450px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-bar-modern:focus-within {
    border-color: #60a5fa;
    background: rgba(0,0,0,0.6);
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    transform: translateY(-2px);
}

.search-icon {
    color: rgba(255, 255, 255, 0.4);
}

.search-bar-modern:focus-within .search-icon {
    color: #60a5fa;
    animation: bounce-horizontal 2s infinite;
}

.search-input-field {
    background: transparent;
    border: none;
    color: white;
    font-size: 0.9rem;
    width: 100%;
    outline: none;
}

@keyframes bounce-horizontal {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(3px); }
}

.search-input-field::placeholder {
    color: rgba(255, 255, 255, 0.2);
}

/* Modern Badges */
.summary-badges-modern {
    display: flex;
    background: rgba(0,0,0,0.2);
    border-radius: 14px;
    padding: 6px 16px;
    border: 1px solid rgba(255,255,255,0.05);
    align-items: center;
    gap: 12px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.summary-item .label {
    font-size: 10px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
}

.summary-item .value {
    font-size: 14px;
    font-weight: 700;
}

.summary-item.active .value {
    color: #60a5fa;
}

.summary-divider {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.1);
}

/* Listado de items mejorado */
.items-list-custom {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.items-list-custom::-webkit-scrollbar { width: 4px; }
.items-list-custom::-webkit-scrollbar-track { background: transparent; }
.items-list-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

.item-row-glass {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 18px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.item-row-glass:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
}

.item-row-glass.has-qty {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.3);
}

.item-main-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.9);
}

.item-meta-tags {
    display: flex;
    gap: 8px;
}

.tag-clave {
    font-family: monospace;
    font-size: 0.75rem;
    background: rgba(255,255,255,0.05);
    padding: 2px 8px;
    border-radius: 6px;
    color: rgba(255,255,255,0.5);
}

.tag-stock {
    font-size: 0.75rem;
    color: #60a5fa;
    font-weight: 500;
}

/* Stepper Moderno */
.qty-stepper {
    display: flex;
    align-items: center;
    background: rgba(0,0,0,0.3);
    border-radius: 12px;
    padding: 4px;
    border: 1px solid rgba(255,255,255,0.08);
}

.qty-val {
    width: 60px;
    background: transparent;
    border: none;
    text-align: center;
    font-weight: 700;
    color: white;
    font-size: 1rem;
}

.qty-val::-webkit-inner-spin-button { display: none; }

.step-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: rgba(255,255,255,0.05);
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.step-btn:hover { background: rgba(255,255,255,0.15); }
.step-btn.fast { color: #60a5fa; }

/* --- NEW ITEM WIZARD --- */
.new-item-wizard {
    display: grid;
    grid-template-columns: 280px 1fr;
    height: 100%;
    min-height: 450px;
    background: rgba(255,255,255,0.01);
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.05);
    overflow: hidden;
}

.wizard-side-nav {
    background: rgba(0,0,0,0.4);
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    min-width: 260px;
}

.nav-minimal-info {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #f9a8d4;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: rgba(236, 72, 153, 0.1);
    padding: 6px 12px;
    border-radius: 99px;
    width: fit-content;
}

.nav-info .icon-bg {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
}

.nav-info h3 { font-size: 1.25rem; margin-bottom: 8px; font-weight: 700; }
.nav-info p { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.5; }

.nav-steps { display: flex; flex-direction: column; gap: 20px; }

.nav-step-item {
    display: flex;
    align-items: center;
    gap: 16px;
    opacity: 0.4;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pink-glow {
    background: linear-gradient(135deg, #f472b6, #db2777) !important;
    box-shadow: 0 0 20px rgba(244, 114, 182, 0.3) !important;
}

.nav-step-item.active { opacity: 1; transform: translateX(8px); }

.nav-step-item .num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
}

.nav-step-item.active .num { border-color: #f9a8d4; color: #f9a8d4; }
.nav-step-item .txt { font-weight: 600; font-size: 0.95rem; }

.wizard-main-form {
    padding: 40px;
    overflow-y: auto;
    background: radial-gradient(circle at top right, rgba(236, 72, 153, 0.05), transparent 400px);
}

.form-grid-modern {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px 24px;
}

.span-2 { grid-column: span 2; }

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-group label {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1.2px;
}

.modern-input {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 14px 18px;
    border-radius: 14px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-input:focus {
    background: rgba(255,255,255,0.06);
    border-color: #ec4899;
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
    outline: none;
    transform: translateY(-2px);
}

.premium-qty-input {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0,0,0,0.4);
    padding: 6px;
    border-radius: 16px;
    width: fit-content;
    border: 1px solid rgba(255,255,255,0.05);
}

.qty-ctrl {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: none;
    background: rgba(255,255,255,0.07);
    color: white;
    cursor: pointer;
    font-size: 1.4rem;
    transition: all 0.2s;
}

.qty-ctrl:hover { background: rgba(255,255,255,0.15); transform: scale(1.05); }

.qty-input-main {
    width: 90px;
    background: transparent;
    border: none;
    text-align: center;
    color: white;
    font-size: 1.6rem;
    font-weight: 800;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* --- FOOTER / NAV --- */
.wizard-footer {
    position: relative;
    z-index: 10;
    padding: 24px 40px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    background: rgba(0,0,0,0.3);
    border-top: 1px solid rgba(255,255,255,0.08);
}

/* --- CONFIRMATION PANEL PREMIUM --- */
.confirmation-panel-premium {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    height: 100%;
    overflow-y: auto;
}

.conf-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.conf-icon {
    width: 80px;
    height: 80px;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    border: 1px solid rgba(96, 165, 250, 0.2);
}

.conf-header h2 { font-size: 1.8rem; font-weight: 800; margin: 0; }
.conf-header p { color: rgba(255,255,255,0.5); font-size: 0.95rem; }

.conf-details-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.conf-card {
    background: rgba(255,255,255,0.03);
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.conf-card .label { font-size: 0.65rem; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 700; letter-spacing: 0.5px; }
.conf-card .value { font-size: 1rem; font-weight: 700; color: white; }
.conf-card .value.text-accent { color: #60a5fa; }

.conf-summary-list {
    background: rgba(0,0,0,0.2);
    border-radius: 20px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid rgba(255,255,255,0.05);
}

.summary-item-premium {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.02);
    border-radius: 12px;
}

.summary-item-premium .txt { display: flex; flex-direction: column; }
.summary-item-premium strong { font-size: 0.9rem; color: rgba(255,255,255,0.9); }
.summary-item-premium span { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

.btn-success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
    transition: all 0.3s;
}

.btn-success:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}

.btn-success:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.flex-spacer { flex: 1; }

.modern-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.modern-input-wrapper .prefix {
    position: absolute;
    left: 14px;
    color: rgba(255,255,255,0.4);
    font-weight: 700;
}

.modern-input-wrapper .w-full { width: 100%; padding-left: 30px; }

/* Scrollbar styling for panels */
.meta-panel::-webkit-scrollbar,
.conf-summary-list::-webkit-scrollbar {
    width: 4px;
}

.meta-panel::-webkit-scrollbar-thumb,
.conf-summary-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
}

.grid-form {
    display: grid;
    gap: 16px;
}

.form-field.compact label {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 4px;
    display: block;
}

.form-input {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 10px 14px;
    border-radius: 10px;
    color: white;
    width: 100%;
}

.form-textarea {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 10px 14px;
    border-radius: 10px;
    color: white;
    width: 100%;
    resize: none;
}

.select-wrapper { position: relative; }
.select-input { appearance: none; cursor: pointer; }

@media (max-width: 900px) {
    .two-column-layout, .new-item-wizard {
        grid-template-columns: 1fr !important;
    }
    .wizard-side-nav { display: none; }
    .conf-details-grid { grid-template-columns: 1fr 1fr; }
}

/* Orbs */
.glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.25;
    pointer-events: none;
    animation: float 8s ease-in-out infinite;
}

.orb-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 179, 237, 0.6), transparent);
    top: -150px;
    right: -100px;
}

.orb-2 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent);
    bottom: -100px;
    left: -50px;
    animation-delay: 2s;
}

.orb-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent);
    top: 50%;
    left: -100px;
    animation-delay: 4s;
}

/* Timeline */
.timeline-container {
    position: relative;
    padding: 20px 24px;
    background: rgba(20, 40, 70, 0.5);
    border-bottom: 1px solid rgba(99, 179, 237, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
}
.timeline-node-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
}

.timeline-step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.timeline-dot {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid rgba(99, 179, 237, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 40, 70, 0.8);
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    color: #a8d5ff;
    font-weight: 600;
    animation: slideInDown 0.4s ease-out backwards;
    animation-delay: var(--delay);
}

.timeline-connector {
    flex: 1;
    padding: 0 4px;
}

.connector-track {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: rgba(30, 64, 175, 0.6);
    overflow: hidden;
}

.connector-progress {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--accent-soft), var(--accent-strong));
    transform-origin: left;
    transform: scaleX(0);
    opacity: 0.3;
    transition: transform 0.35s ease, opacity 0.35s ease;
}

.connector-filled {
    transform: scaleX(1);
    opacity: 0.9;
}

.connector-active {
    transform: scaleX(1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.7);
}

.timeline-step.active .timeline-dot {
    border-color: var(--accent-soft);
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7));
    box-shadow: 0 0 20px var(--accent-soft);
    animation: glow 2s ease-in-out infinite;
}

.timeline-step.completed .timeline-dot {
    border-color: var(--accent-soft);
    background: rgba(15, 23, 42, 0.85);
    animation: none;
}

.step-icon {
    color: var(--accent-strong);
}

.timeline-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-align: center;
    max-width: 80px;
    transition: color 0.3s;
}

.timeline-step.active .timeline-label,
.timeline-step.completed .timeline-label {
    color: #a8d5ff;
}

/* Header */
.wizard-header {
    padding: 28px 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    border-bottom: 1px solid rgba(99, 179, 237, 0.1);
    z-index: 10;
}

.header-content h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #a8d5ff, #7dd3fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-desc {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

.close-btn {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #a8d5ff;
    flex-shrink: 0;
}

.close-btn:hover {
    background: rgba(99, 179, 237, 0.15);
    border-color: rgba(99, 179, 237, 0.4);
}

/* Body */
.wizard-body {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    color: #e0e7ff;
    min-height: 520px;
    max-height: 650px;
    display: flex;
    flex-direction: column;
}

.step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.wizard-body h2 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #f0f7ff;
}

.two-column-layout {
    display: grid;
    grid-template-columns: 310px 1fr;
    gap: 24px;
    flex: 1;
    min-height: 0;
}

.meta-panel,
.items-panel {
    position: relative;
    padding: 18px 18px 20px;
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4));
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.meta-panel h2,
.items-panel h2 {
    margin: 0 0 14px 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #9ca3af;
}

.form-field.compact {
    margin-bottom: 10px;
}

.form-field.two-cols,
.form-field.compact.two-cols {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 14px;
}

.form-textarea {
    min-height: 80px;
    resize: vertical;
    padding: 10px 12px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(15, 23, 42, 0.35));
    border: 1.5px solid rgba(99, 179, 237, 0.15);
    border-radius: 12px;
    color: #e0e7ff;
    font-family: inherit;
    font-size: 13px;
}

.form-textarea:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.7);
    box-shadow: 0 0 18px rgba(96, 165, 250, 0.35);
}

.item-meta-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
}

.mini-pill {
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.5);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #c4d4f7;
}

.item-input.advanced {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mini-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
}

/* Options Grid */
.options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
}

.option-card {
    position: relative;
    padding: 32px 24px;
    background: linear-gradient(135deg, rgba(10, 25, 50, 0.8), rgba(20, 35, 70, 0.8));
    border: 1.5px solid rgba(99, 179, 237, 0.15);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
    color: #e0e7ff;
    font-family: inherit;
    overflow: hidden;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 300px;
    justify-content: center;
}

/* Variantes de color para cada opción principal */
.movement-card {
    background: radial-gradient(circle at 0 0, rgba(59, 130, 246, 0.35), transparent),
        linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7));
    border-color: rgba(59, 130, 246, 0.4);
}

.movement-card .badge {
    background: rgba(59, 130, 246, 0.22);
    border-color: rgba(59, 130, 246, 0.45);
    color: #bfdbfe;
}

.movement-card .option-icon {
    color: #60a5fa;
}

.intake-card {
    background: radial-gradient(circle at 100% 0, rgba(236, 72, 153, 0.3), transparent),
        linear-gradient(145deg, rgba(24, 24, 37, 0.96), rgba(24, 24, 37, 0.7));
    border-color: rgba(236, 72, 153, 0.45);
}

.intake-card .badge {
    background: rgba(236, 72, 153, 0.25);
    border-color: rgba(236, 72, 153, 0.55);
    color: #f9a8d4;
}

.intake-card .option-icon {
    color: #fb7185;
}

.refill-card {
    background: radial-gradient(circle at 0 0, rgba(34, 197, 94, 0.35), transparent),
        linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.7));
    border-color: rgba(34, 197, 94, 0.4);
}

.refill-card .option-icon {
    color: #4ade80;
}

.new-card {
    background: radial-gradient(circle at 100% 0, rgba(129, 140, 248, 0.35), transparent),
        linear-gradient(145deg, rgba(17, 24, 39, 0.96), rgba(17, 24, 39, 0.7));
    border-color: rgba(129, 140, 248, 0.45);
}

.new-card .option-icon {
    color: #a5b4fc;
}

.option-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(99, 179, 237, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 20px;
}

.option-card:hover {
    background: linear-gradient(135deg, rgba(20, 40, 80, 0.95), rgba(30, 55, 100, 0.95));
    border-color: rgba(99, 179, 237, 0.5);
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(99, 179, 237, 0.25);
}

.option-card:hover::before {
    opacity: 1;
}

.option-card:active {
    transform: translateY(-5px) scale(1.01);
}

.card-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: radial-gradient(circle at 30% 30%, rgba(99, 179, 237, 0.15), transparent);
    transition: opacity 0.3s;
    border-radius: 20px;
    pointer-events: none;
}

.option-card:hover .card-glow {
    opacity: 1;
    animation: glow-pulse 2s ease-in-out infinite;
}

.card-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    animation: shine-slow 3s infinite;
    border-radius: 20px;
    pointer-events: none;
}

.option-card:hover .card-shine {
    animation: shine 0.8s ease-in-out;
}

.icon-container {
    position: relative;
    margin-bottom: 16px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.icon-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.option-icon {
    width: 56px;
    height: 56px;
    color: #63b3ed;
    animation: float 3s ease-in-out infinite;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 8px rgba(99, 179, 237, 0.3));
    z-index: 2;
    position: relative;
}

.option-card:hover .option-icon {
    width: 64px;
    height: 64px;
    color: #a8d5ff;
    filter: drop-shadow(0 0 16px rgba(99, 179, 237, 0.6));
    animation: float-hover 1.5s ease-in-out infinite;
}

.icon-orbit {
    position: absolute;
    width: 90px;
    height: 90px;
    border: 2px solid rgba(99, 179, 237, 0.1);
    border-radius: 50%;
    animation: orbit 4s linear infinite;
}

.option-card:hover .icon-orbit {
    border-color: rgba(99, 179, 237, 0.4);
    animation: orbit 2s linear infinite;
}

.icon-pulse {
    position: absolute;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(99, 179, 237, 0.15);
    animation: pulse 2s ease-in-out infinite;
}

.card-content {
    position: relative;
    z-index: 2;
}

.option-card h3 {
    margin: 12px 0 8px 0;
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #a8d5ff, #7dd3fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.3s ease;
}

.option-card:hover h3 {
    font-size: 22px;
    text-shadow: 0 0 20px rgba(99, 179, 237, 0.3);
}

.option-card p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #94a3b8;
    transition: color 0.3s ease;
}

.option-card:hover p {
    color: #cbd5e1;
}

.card-badges {
    display: flex;
    gap: 6px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 8px;
}

.badge {
    font-size: 10px;
    padding: 4px 10px;
    background: rgba(99, 179, 237, 0.2);
    color: #7dd3fc;
    border-radius: 12px;
    font-weight: 600;
    border: 0.5px solid rgba(99, 179, 237, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    animation: fade-bounce 2s ease-in-out infinite;
}

.badge:nth-child(2) {
    animation-delay: 0.2s;
}

/* Direction Buttons */
.direction-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.direction-btn {
    padding: 24px 28px;
    background: linear-gradient(135deg, rgba(10, 25, 50, 0.8), rgba(20, 35, 70, 0.8));
    border: 1.5px solid rgba(99, 179, 237, 0.15);
    border-radius: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 20px;
    color: #e0e7ff;
    font-family: inherit;
    font-size: 15px;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.direction-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(99, 179, 237, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
}

.direction-btn:hover {
    background: linear-gradient(135deg, rgba(20, 40, 80, 0.95), rgba(30, 55, 100, 0.95));
    border-color: rgba(99, 179, 237, 0.5);
    transform: translateX(10px);
    box-shadow: 0 16px 48px rgba(99, 179, 237, 0.15);
}

.direction-btn:hover::before {
    opacity: 1;
}

.direction-btn:active {
    transform: translateX(6px);
}

.direction-icon {
    color: #63b3ed;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    animation: float 3s ease-in-out infinite;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 8px rgba(99, 179, 237, 0.3));
}

.direction-btn:hover .direction-icon {
    color: #a8d5ff;
    width: 36px;
    height: 36px;
    filter: drop-shadow(0 0 12px rgba(99, 179, 237, 0.6));
    animation: float-hover 1.5s ease-in-out infinite;
}

.direction-text {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.warehouse {
    font-weight: 600;
    color: #a8d5ff;
}

.arrow {
    color: rgba(99, 179, 237, 0.6);
    font-weight: 600;
}

/* Items List */
.items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 8px;
}

.item-card {
    padding: 16px;
    background: linear-gradient(135deg, rgba(10, 25, 50, 0.6), rgba(20, 35, 70, 0.5));
    border: 1px solid rgba(99, 179, 237, 0.15);
    border-radius: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-card:hover {
    background: linear-gradient(135deg, rgba(20, 40, 80, 0.8), rgba(30, 50, 90, 0.7));
    border-color: rgba(99, 179, 237, 0.4);
    transform: translateX(4px);
    box-shadow: 0 8px 20px rgba(99, 179, 237, 0.1);
}

.item-left {
    display: flex;
    gap: 12px;
    flex: 1;
    align-items: center;
}

.item-icon {
    color: #63b3ed;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

.item-info {
    flex: 1;
}

.item-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 500;
    color: #f0f7ff;
}

.stock-badge {
    font-size: 11px;
    padding: 3px 8px;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid var(--accent-soft);
    border-radius: 6px;
    color: var(--accent-strong);
    display: inline-block;
}

.item-input {
    width: 120px;
}

.item-input input {
    width: 64px;
    padding: 8px 10px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(10, 20, 40, 0.2));
    border: 1.5px solid rgba(99, 179, 237, 0.15);
    border-radius: 10px;
    color: #e0e7ff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-input input:focus {
    outline: none;
    border-color: rgba(99, 179, 237, 0.6);
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(10, 25, 50, 0.3));
    box-shadow: 0 0 16px rgba(99, 179, 237, 0.25), inset 0 0 8px rgba(99, 179, 237, 0.05);
    transform: scale(1.05);
    color: #a8d5ff;
}

.quantity-control {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    justify-content: flex-end;
}

.qty-btn {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: radial-gradient(circle at 50% 0, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7));
    color: #e5e7eb;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.qty-btn:hover {
    border-color: rgba(96, 165, 250, 0.9);
    box-shadow: 0 0 12px rgba(96, 165, 250, 0.5);
    transform: translateY(-1px);
}

.qty-btn:active {
    transform: translateY(0);
    box-shadow: none;
}

.panel-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
}

.summary-badges {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.summary-pill {
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #cbd5f5;
    background: radial-gradient(circle at 0 0, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6));
}

.summary-pill.strong {
    border-color: rgba(96, 165, 250, 0.9);
    color: #bfdbfe;
}

/* Form */
.form-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-field label {
    font-size: 12px;
    font-weight: 600;
    color: #a8d5ff;
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-input {
    padding: 13px 16px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(10, 20, 40, 0.3));
    border: 1.5px solid rgba(99, 179, 237, 0.15);
    border-radius: 12px;
    color: #e0e7ff;
    font-family: inherit;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.select-input {
    appearance: none;
    padding-right: 32px;
    background-image: linear-gradient(45deg, transparent 50%, rgba(148, 163, 184, 0.9) 50%),
        linear-gradient(135deg, rgba(148, 163, 184, 0.9) 50%, transparent 50%);
    background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%;
    background-size: 6px 6px, 6px 6px;
    background-repeat: no-repeat;
}

.form-input:focus {
    outline: none;
    border-color: rgba(99, 179, 237, 0.6);
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(10, 25, 50, 0.4));
    box-shadow: 0 0 20px rgba(99, 179, 237, 0.3), inset 0 0 10px rgba(99, 179, 237, 0.05);
    transform: scale(1.01);
}

/* Loading & Empty */
.loading-state {
    padding: 48px 24px;
    text-align: center;
}

.spinner {
    width: 44px;
    height: 44px;
    border: 3px solid rgba(99, 179, 237, 0.2);
    border-top-color: rgba(99, 179, 237, 0.8);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
}

.empty-state {
    padding: 40px 24px;
    text-align: center;
    color: #94a3b8;
}

.empty-icon {
    width: 56px;
    height: 56px;
    color: #64748b;
    margin: 0 auto 12px;
    opacity: 0.5;
}

/* Footer */
.wizard-footer {
    padding: 24px 32px;
    border-top: 1px solid rgba(99, 179, 237, 0.1);
    display: flex;
    gap: 12px;
    align-items: center;
    z-index: 10;
    background: linear-gradient(180deg, rgba(15, 30, 60, 0.5), rgba(10, 20, 45, 0.8));
}

.flex-spacer {
    flex: 1;
}

.btn {
    padding: 12px 24px;
    border: 1.5px solid rgba(99, 179, 237, 0.2);
    border-radius: 12px;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
}

.btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.btn:hover::before {
    transform: translateX(100%);
}

.btn-primary {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7));
    color: var(--accent-strong);
    border-color: var(--accent-soft);
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.7);
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
    border-color: var(--accent-strong);
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.9);
}

.btn-primary:active:not(:disabled) {
    transform: translateX(2px);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateX(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-secondary:active {
    transform: translateX(-2px);
}

.btn-success {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7));
    color: var(--accent-strong);
    border-color: var(--accent-soft);
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.7);
    animation: success-glow 2s ease-in-out infinite;
}

.btn-success:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
    border-color: var(--accent-strong);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.9);
    animation: success-glow 1s ease-in-out infinite;
}

.btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
}

/* Scrollbar */
.items-list::-webkit-scrollbar {
    width: 6px;
}

.items-list::-webkit-scrollbar-track {
    background: transparent;
}

.items-list::-webkit-scrollbar-thumb {
    background: rgba(99, 179, 237, 0.2);
    border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 179, 237, 0.4);
}
</style>
