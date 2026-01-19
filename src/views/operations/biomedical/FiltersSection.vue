<template>
    <div class="filters-section">
        <div class="filters-header">
            <div class="filters-title-wrapper">
                <div class="search-icon-container">
                    <svg class="icon-search animated-pulse" xmlns="http://www.w3.org/2000/svg" width="20"
                        height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>
                <h3>Filtros de búsqueda</h3>
                <div class="filters-stats">
                    <div class="stat-item">
                        <span class="stat-number">{{ filteredCount }}</span>
                        <span class="stat-label">resultados</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ totalCount }}</span>
                        <span class="stat-label">total</span>
                    </div>
                </div>
                <div v-if="mobileLimitApplied" class="mobile-limit-note">
                    Modo ligero: mostrando 300 registros para mejorar rendimiento.
                </div>
            </div>

            <div class="filters-header-actions">
                <div class="filters-global-actions">
                    <div class="dropdown-filters-container" ref="filterDropdownContainer">
                        <button ref="filterDropdownBtn" @click="toggleFilterDropdown" class="btn-filter-primary"
                            :aria-expanded="isFilterDropdownOpen">
                            <span class="btn-filter-label">
                                <span class="btn-filter-icon">
                                    <svg v-if="activeDynamicFilterIds.length === 0"
                                        xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16l-6 8v5l-4 3v-8z" />
                                        <path d="M12 3v8" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16l-6 8v5l-4 3v-8z" />
                                        <path d="M9 9l6 6" />
                                        <path d="M15 9l-6 6" />
                                    </svg>
                                </span>
                                <span class="btn-filter-text">
                                    <span class="btn-filter-title">Filtros</span>
                                    <span class="btn-filter-count"
                                        v-if="activeDynamicFilterIds.length === 0">Añadir</span>
                                    <span class="btn-filter-count" v-else>{{ activeDynamicFilterIds.length }}
                                        activos</span>
                                </span>
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" class="btn-filter-chevron"
                                :class="{ 'rotate': isFilterDropdownOpen }">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        <transition name="dropdown-fade">
                            <div v-show="isFilterDropdownOpen" class="dropdown-filters-menu" @click.stop>
                                <!-- Header with actions -->
                                <div class="dropdown-header">
                                    <button class="action-btn action-clear-all"
                                        :disabled="activeDynamicFilterIds.length === 0"
                                        @click.stop="clearDynamicFilters">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                        Limpiar
                                    </button>
                                    <div class="dropdown-title-text">Filtros disponibles</div>
                                </div>

                                <!-- Search input -->
                                <div class="dropdown-search-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        class="search-icon">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    <input class="dropdown-filters-search" type="search"
                                        v-model="dropdownSearch" placeholder="Buscar filtros..." @click.stop />
                                </div>

                                <!-- Active filters accordion (collapsed by default) -->
                                <details v-if="activeDynamicFilterIds.length > 0" class="dropdown-active-accordion">
                                    <summary class="active-section-summary" role="button" aria-expanded="false">
                                        <span class="active-section-title">Activos ({{ activeDynamicFilterIds.length }}/15)</span>
                                        <span class="summary-count">{{ activeDynamicFilterIds.length }}</span>
                                        <svg class="summary-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </summary>

                                    <div class="active-filters-list">
                                        <div v-for="id in activeDynamicFilterIds" :key="id" class="active-filter-chip">
                                            <span class="chip-label">{{ getDynamicFieldLabel(id) }}</span>
                                            <button class="chip-remove-btn" @click.stop="removeDynamicFilter(id)" title="Eliminar filtro">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </details> 
                                <!-- Loading state -->
                                <div v-if="metaLoading" class="dropdown-state-message loading-state">
                                    <div class="loader-spinner-small"></div>
                                    <span>Cargando catálogo...</span>
                                </div>

                                <!-- Empty state -->
                                <div v-else-if="filteredDropdownCatalog.length === 0"
                                    class="dropdown-state-message empty-state">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <span>No hay filtros disponibles</span>
                                </div>

                                <!-- Filters list -->
                                <div v-else class="dropdown-filters-list">
                                    <details v-for="cat in filteredDropdownCatalog" :key="cat.category" class="filter-category">
                                        <summary class="category-header">{{ cat.category }}
                                            <svg class="category-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </summary>
                                            <div class="category-filters">
                                            <label v-for="field in cat.fields" :key="field.id"
                                                class="filter-checkbox-item"
                                                :class="{ 'is-disabled': isFixedField(field.id) || activeDynamicFilterIds.length >= 15 }">
                                                <input type="checkbox"
                                                    :checked="activeDynamicFilterIds.includes(field.id)"
                                                    :disabled="isFixedField(field.id) || activeDynamicFilterIds.length >= 15"
                                                    @change="handleFilterCheckboxChange(field.id)" />
                                                <span class="checkbox-custom"></span>
                                                <span class="filter-item-label">
                                                    {{ field.label }}
                                                </span>
                                                <span v-if="isFixedField(field.id)"
                                                    class="filter-type-badge fixed">Fijo</span>
                                                <span v-else-if="activeDynamicFilterIds.includes(field.id)"
                                                    class="filter-type-badge active">Activo</span>
                                            </label>
                                        </div>
                                    </details>
                                </div>

                                <!-- Footer -->
                                <div class="dropdown-footer">
                                    <span class="filter-counter">{{ activeDynamicFilterIds.length }} de 15
                                        filtros</span>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </div>

        <div class="filters-callout">
            <div class="callout-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M12 2 15 8l6 .5-4.5 4 1.5 6L12 16l-6 3 1.5-6-4.5-4L9 8z"></path>
                </svg>
                <span class="icon-halo"></span>
            </div>
            <div class="callout-content">
                <p class="callout-title">Búsqueda guiada para equipos biomédicos</p>
                <p class="callout-subtext">Mantén la vista clara: cada filtro reacciona en tiempo real con
                    debounce
                    y persistencia.</p>
            </div>
            <div class="callout-metric">
                <span class="metric-label">Filtros dinámicos activos</span>
                <strong class="metric-value">{{ activeDynamicFilterIds.length }}</strong>
                <span class="metric-time">se aplican al instante</span>
            </div>
        </div>

        <div class="filters-layout" :class="{ 'has-dynamic': activeDynamicFilterIds.length > 0 }">
            <section class="filters-zone filters-zone-fixed" aria-label="Filtros fijos">
                <header class="zone-header">
                    <div class="zone-title">
                        <span class="zone-pill zone-pill-fixed">Fijo</span>
                        <strong>Filtros obligatorios</strong>
                    </div>
                    <span class="zone-subtitle">Siempre visibles • No eliminables</span>
                </header>

                <div class="filters-grid-fixed"
                    :class="{ 'grid-initial': activeDynamicFilterIds.length === 0 }">
                    <div class="filter-card filter-card-fixed">
                        <label for="filter-no">
                            <span class="field-label">No. Inventario</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="input-wrapper">
                            <input id="filter-no" v-model="filters.no" type="text" placeholder="SIB-MSV-..." />
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label for="filter-no-registro">
                            <span class="field-label">No</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="input-wrapper">
                            <input id="filter-no-registro" v-model="filters.noRegistro" type="text"
                                placeholder="1234" />
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label for="filter-estatus">
                            <span class="field-label">Estatus</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="select-wrapper">
                            <select id="filter-estatus" v-model="filters.estatus">
                                <option value="">Todos</option>
                                <option :value="SIN_ESTADO_VALUE">Sin estado</option>
                                <option v-for="opt in estatusOptions" :key="opt" :value="opt">{{ opt }}
                                </option>
                            </select>
                            <div class="select-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label for="filter-equipo">
                            <span class="field-label">Equipo Médico</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="input-wrapper">
                            <input id="filter-equipo" v-model="filters.equipoMedico" type="text"
                                placeholder="Monitor, Desfibrilador..." :list="equipoMedicoDatalistId" />
                            <datalist :id="equipoMedicoDatalistId">
                                <option v-for="v in equipoMedicoSuggestions" :key="v" :value="v">{{ v }}</option>
                            </datalist>
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label>
                            <span class="field-label">¿Funcional?</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="tri-toggle">
                            <button type="button" class="tri-option"
                                :class="{ active: filters.funcional === '' }"
                                @click="filters.funcional = ''">Todos</button>
                            <button type="button" class="tri-option"
                                :class="{ active: filters.funcional === 'SI' }"
                                @click="filters.funcional = 'SI'">Sí</button>
                            <button type="button" class="tri-option"
                                :class="{ active: filters.funcional === 'NO' }"
                                @click="filters.funcional = 'NO'">No</button>
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label for="filter-marca">
                            <span class="field-label">Marca</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="input-wrapper">
                            <input id="filter-marca" v-model="filters.marca" type="text"
                                placeholder="Philips, GE, Siemens..." :list="marcaDatalistId" />
                            <datalist :id="marcaDatalistId">
                                <option v-for="v in marcaSuggestions" :key="v" :value="v">{{ v }}</option>
                            </datalist>
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label for="filter-unidad">
                            <span class="field-label">Unidad Médica</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="input-wrapper">
                            <input id="filter-unidad" v-model="filters.unidadMedica" type="text"
                                placeholder="UCI, Área..." :list="unidadMedicaDatalistId" />
                            <datalist :id="unidadMedicaDatalistId">
                                <option v-for="v in unidadMedicaSuggestions" :key="v" :value="v">{{ v }}</option>
                            </datalist>
                        </div>
                    </div>

                    <div class="filter-card filter-card-fixed">
                        <label for="filter-tipo">
                            <span class="field-label">Tipo de Mantenimiento</span>
                            <span class="field-badge field-badge-fixed">Fijo</span>
                        </label>
                        <div class="select-wrapper">
                            <select id="filter-tipo" v-model="filters.tipoMantenimiento">
                                <option value="">Todos</option>
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                                <option value="Predictivo">Predictivo</option>
                            </select>
                            <div class="select-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="activeDynamicFilterIds.length > 0" class="filters-zone filters-zone-dynamic"
                aria-label="Filtros dinámicos">
                <header class="zone-header">
                    <div class="zone-title">
                        <span class="zone-pill zone-pill-dynamic">Dinámico</span>
                        <strong>Filtros añadidos</strong>
                    </div>
                    <span class="zone-subtitle">Máx. 15 • Eliminables</span>
                </header>

                <div class="filters-grid-dynamic">
                    <div v-for="id in activeDynamicFilterIds" :key="id" class="filter-card filter-card-dynamic">
                        <div class="dynamic-card-header">
                            <label :for="`dyn-${id}`">
                                <span class="field-label">{{ getDynamicFieldLabel(id) }}</span>
                            </label>
                            <button type="button" class="btn-remove-filter" @click="removeDynamicFilter(id)"
                                title="Eliminar filtro">✕</button>
                        </div>

                        <div v-if="getDynamicFieldKind(id) === 'boolean'" class="tri-toggle tri-toggle-dynamic">
                            <button type="button" class="tri-option"
                                :class="{ active: getDynamicValue(id) === '' }"
                                @click="setDynamicValue(id, '')">Todos</button>
                            <button type="button" class="tri-option"
                                :class="{ active: getDynamicValue(id) === 'SI' }"
                                @click="setDynamicValue(id, 'SI')">Sí</button>
                            <button type="button" class="tri-option"
                                :class="{ active: getDynamicValue(id) === 'NO' }"
                                @click="setDynamicValue(id, 'NO')">No</button>
                        </div>

                        <div v-else-if="getDynamicFieldKind(id) === 'date'" class="input-wrapper">
                            <input :id="`dyn-${id}`" v-model="dynamicFilterValues[id]" type="text"
                                placeholder="DD/MM/AAAA" v-flatpickr />
                        </div>

                        <div v-else-if="isDynamicSelectable(id)" class="select-wrapper">
                            <select :id="`dyn-${id}`" v-model="dynamicFilterValues[id]">
                                <option value="">Todos</option>
                                <option v-for="v in getDynamicSelectOptions(id)" :key="v" :value="v">{{ v }}
                                </option>
                            </select>
                            <div class="select-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                        </div>

                        <div v-else class="input-wrapper">
                            <input :id="`dyn-${id}`" v-model="dynamicFilterValues[id]" type="text"
                                placeholder="Escribe para filtrar" :list="getDynamicDatalistId(id)" />
                            <datalist :id="getDynamicDatalistId(id)">
                                <option v-for="v in getDynamicSuggestions(id)" :key="v" :value="v">{{ v }}</option>
                            </datalist>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Drawer lateral: + Añadir filtro -->
        <div v-if="isAddFilterDrawerOpen" class="drawer-overlay" @click.self="closeAddFilterDrawer">
            <aside ref="drawerEl" :class="['drawer', { animating: drawerAnimating }]" role="dialog"
                aria-modal="true" aria-label="Añadir filtro">
                <header class="drawer-header">
                    <div>
                        <h3>Añadir filtro</h3>
                        <p class="drawer-subtitle">Categorías colapsables • Campos reales de BD • Máx. 15
                            dinámicos</p>
                    </div>
                    <button class="drawer-close" type="button" @click="closeAddFilterDrawer">✕</button>
                </header>

                <div class="drawer-body">
                    <div class="drawer-search-wrapper">
                        <input class="drawer-search" type="search" v-model="drawerSearch"
                            placeholder="Buscar filtros..." aria-label="Buscar filtros" />
                    </div>

                    <div class="drawer-meta">
                        <span class="drawer-count">Añadidos: <strong>{{ activeDynamicFilterIds.length
                        }}</strong> /
                            15</span>
                        <span v-if="metaLoading" class="drawer-loading">Cargando catálogo...</span>
                    </div>

                    <div v-if="metaError" class="drawer-empty">
                        <p style="margin: 0 0 10px;">No se pudo cargar el catálogo de filtros.</p>
                        <p style="margin: 0 0 12px; opacity: 0.85;">{{ metaError }}</p>
                        <button type="button" class="drawer-add" @click="fetchMeta">Reintentar</button>
                    </div>

                    <div v-else-if="!dynamicCatalog.length && !metaLoading" class="drawer-empty">
                        No hay campos disponibles (verifica backend/BD).
                        <div style="margin-top: 10px;">
                            <button type="button" class="drawer-add" @click="fetchMeta">Reintentar</button>
                        </div>
                    </div>

                    <details v-for="cat in filteredDynamicCatalog" :key="cat.category" class="drawer-category"
                        open>
                        <summary class="drawer-category-title">{{ cat.category }}</summary>
                        <div class="drawer-list">
                            <div v-for="field in cat.fields" :key="field.id" class="drawer-item">
                                <div class="drawer-item-main">
                                    <div class="drawer-item-title">
                                        <span class="drawer-item-name">{{ field.label }}</span>
                                        <span class="drawer-item-type">{{ getFieldTypeLabel(field) }}</span>
                                    </div>
                                    <div class="drawer-item-badges">
                                        <span v-if="isFixedField(field.id)"
                                            class="drawer-badge drawer-badge-fixed">Fijo</span>
                                        <span v-else-if="activeDynamicFilterIds.includes(field.id)"
                                            class="drawer-badge drawer-badge-added">Añadido</span>
                                    </div>
                                </div>

                                <div style="display:flex; gap:10px; align-items:center;">
                                    <button
                                        v-if="!isFixedField(field.id) && activeDynamicFilterIds.includes(field.id)"
                                        type="button" class="drawer-add"
                                        style="border-color: rgba(248,113,113,0.35); background: rgba(248,113,113,0.12);"
                                        @click="removeDynamicFilter(field.id)">
                                        Quitar
                                    </button>

                                    <button v-else type="button" class="drawer-add"
                                        :disabled="isFixedField(field.id) || activeDynamicFilterIds.includes(field.id) || activeDynamicFilterIds.length >= 15"
                                        @click="addDynamicFilter(field.id)">
                                        Añadir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import flatpickr from 'flatpickr'

const props = defineProps({
    filteredCount: {
        type: Number,
        default: 0
    },
    totalCount: {
        type: Number,
        default: 0
    },
    mobileLimitApplied: Boolean,
    activeDynamicFilterIds: {
        type: Array,
        default: () => []
    },
    isFilterDropdownOpen: Boolean,
    metaLoading: Boolean,
    filteredDropdownCatalog: {
        type: Array,
        default: () => []
    },
    toggleFilterDropdown: {
        type: Function,
        required: true
    },
    clearDynamicFilters: {
        type: Function,
        required: true
    },
    handleFilterCheckboxChange: {
        type: Function,
        required: true
    },
    getDynamicFieldLabel: {
        type: Function,
        required: true
    },
    removeDynamicFilter: {
        type: Function,
        required: true
    },
    getDynamicFieldKind: {
        type: Function,
        required: true
    },
    getDynamicValue: {
        type: Function,
        required: true
    },
    setDynamicValue: {
        type: Function,
        required: true
    },
    isDynamicSelectable: {
        type: Function,
        required: true
    },
    getDynamicSelectOptions: {
        type: Function,
        required: true
    },
    getDynamicDatalistId: {
        type: Function,
        required: true
    },
    getDynamicSuggestions: {
        type: Function,
        required: true
    },
    SIN_ESTADO_VALUE: {
        type: String,
        default: ''
    },
    estatusOptions: {
        type: Array,
        default: () => []
    },
    equipoMedicoDatalistId: {
        type: String,
        default: ''
    },
    equipoMedicoSuggestions: {
        type: Array,
        default: () => []
    },
    marcaDatalistId: {
        type: String,
        default: ''
    },
    marcaSuggestions: {
        type: Array,
        default: () => []
    },
    unidadMedicaDatalistId: {
        type: String,
        default: ''
    },
    unidadMedicaSuggestions: {
        type: Array,
        default: () => []
    },
    isAddFilterDrawerOpen: Boolean,
    closeAddFilterDrawer: {
        type: Function,
        required: true
    },
    drawerAnimating: Boolean,
    filteredDynamicCatalog: {
        type: Array,
        default: () => []
    },
    metaError: {
        type: String,
        default: ''
    },
    dynamicCatalog: {
        type: Array,
        default: () => []
    },
    getFieldTypeLabel: {
        type: Function,
        required: true
    },
    fetchMeta: {
        type: Function,
        required: true
    },
    addDynamicFilter: {
        type: Function,
        required: true
    },
    isFixedField: {
        type: Function,
        required: true
    }
})

const filters = defineModel('filters')
const dynamicFilterValues = defineModel('dynamicFilterValues')
const dropdownSearch = defineModel('dropdownSearch')
const drawerSearch = defineModel('drawerSearch')

const drawerEl = ref(null)

defineExpose({ drawerEl })

const vFlatpickr = {
    mounted(el) {
        flatpickr(el, {
            dateFormat: 'd/m/Y',
            allowInput: true,
            disableMobile: true
        })
    },
    unmounted(el) {
        if (el && el._flatpickr) {
            el._flatpickr.destroy()
        }
    }
}
</script>
