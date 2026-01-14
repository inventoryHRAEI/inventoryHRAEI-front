<template>
    <ActionPanel class="testing-environment-main">
        <template #title>
            <div class="title-row">
                <button class="btn-back-to-dashboard" @click="goToDashboard" title="Volver al dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <span>Trabajando - Entorno de Pruebas</span>
                <div class="spacer"></div>
            </div>
        </template>

        <Breadcrumbs />

        <div class="testing-content">
            <!-- Sección de Filtros -->
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
                                <span class="stat-number">{{ filteredData.length }}</span>
                                <span class="stat-label">resultados</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">{{ allData.length }}</span>
                                <span class="stat-label">total</span>
                            </div>
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

                                        <!-- Active filters section -->
                                        <div v-if="activeDynamicFilterIds.length > 0" class="dropdown-active-section">
                                            <div class="active-section-title">Activos ({{ activeDynamicFilterIds.length
                                                }}/15)
                                            </div>
                                            <div class="active-filters-list">
                                                <div v-for="id in activeDynamicFilterIds" :key="id"
                                                    class="active-filter-chip">
                                                    <span class="chip-label">{{ getDynamicFieldLabel(id) }}</span>
                                                    <button class="chip-remove-btn"
                                                        @click.stop="removeDynamicFilter(id)" title="Eliminar filtro">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                            stroke-width="2">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

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
                                            <div v-for="cat in filteredDropdownCatalog" :key="cat.category"
                                                class="filter-category">
                                                <div class="category-header">{{ cat.category }}</div>
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
                                            </div>
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
                                        <option v-for="v in equipoMedicoSuggestions" :key="v" :value="v" />
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
                                        <option v-for="v in marcaSuggestions" :key="v" :value="v" />
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
                                        <option v-for="v in unidadMedicaSuggestions" :key="v" :value="v" />
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
                                        <option v-for="v in getDynamicSuggestions(id)" :key="v" :value="v" />
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

            <!-- Vista de Cards (Resumen) -->
            <div class="cards-section">
                <div class="cards-header">
                    <h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="9"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        Resumen de Equipos
                    </h3>
                    <span class="cards-count">Mostrando {{ displayedCards.length }} de {{ visibleCount }}</span>
                </div>
                <div v-if="loading" class="loading">
                    <div class="loader-spinner"></div>
                    <p>Cargando datos...</p>
                </div>
                <div v-else-if="filteredData.length === 0" class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No se encontraron equipos con los filtros aplicados</p>
                </div>
                <div v-else class="cards-grid">
                    <div v-for="(item, idx) in displayedCards" :key="getItemKey(item, idx)" class="maintenance-card"
                        @click="toggleSelect(item)"
                        :class="{ active: isExpanded(item, idx), expanded: isExpanded(item, idx), 'card-sparse': isSparse(item) }"
                        :aria-expanded="isExpanded(item, idx)" tabindex="0" @keydown.enter.prevent="toggleSelect(item)"
                        @keydown.space.prevent="toggleSelect(item)">
                        <div class="card-accent" :class="getStatusAccentClass(item)"></div>
                        <div class="card-glow" :class="getStatusGlowClass(item)"></div>
                        <div class="card-header">
                            <div class="card-header-top">
                                <!-- Num de Inventario: SIEMPRE visible con label y valor (nunca en blanco) -->
                                <div class="card-no-wrapper">
                                    <div class="card-no">
                                        <span class="card-pill-label">Num de Inventario </span>
                                        <span class="card-pill-value"
                                            :class="{ 'value-na': !hasRealValue(item['No DE INVENTARIO']) }">{{
                                                displayValue(item['No DE INVENTARIO']) }}</span>
                                    </div>
                                    <div class="card-no-icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <!-- Campo No: SIEMPRE visible, nunca en blanco -->
                                <div class="card-record">
                                    <span class="card-record-label">No</span>
                                    <span class="card-record-value" :title="String(displayValue(item['No']))"
                                        :class="{ 'value-na': !hasRealValue(item['No']) }">{{
                                            displayValue(item['No'])
                                        }}</span>
                                </div>

                                <!-- Close button shown only when expanded -->
                                <button v-if="isExpanded(item, idx)" class="card-close" @click.stop="toggleSelect(null)"
                                    aria-label="Cerrar" title="Cerrar">✕</button>
                            </div>

                            <div class="card-header-bottom">
                                <div class="card-status-container">
                                    <span class="card-status-label">Estatus</span>
                                    <span class="card-status"
                                        :class="[getStatusTextClass(item), getStatusPillClass(item)]">
                                        <span class="status-dot" :class="getStatusTextClass(item)"></span>
                                        {{ item['ESTATUS'] || 'Sin estado' }}
                                    </span>
                                </div>

                                <div class="card-title-group">
                                    <span v-if="isFieldVisible(item, 'EQUIPO MEDICO')" class="card-equipo">
                                        {{ item['EQUIPO MEDICO'] }}
                                    </span>
                                    <span v-if="isSparse(item)" class="sparse-badge">Pocos datos</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="card-info-row">
                                <span class="card-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M6 2 3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                        <line x1="3" x2="21" y1="6" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                    Marca:
                                </span>
                                <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MARCA']) }">{{
                                    displayValue(item['MARCA']) }}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="card-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    Modelo:
                                </span>
                                <span class="card-value" :class="{ 'value-na': !hasRealValue(item['MODELO']) }">{{
                                    displayValue(item['MODELO']) }}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="card-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 7h.01M7 7h.01M7 15h.01M15 15h.01M12 12V9" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    CNIS:
                                </span>
                                <span class="card-value card-cnis"
                                    :class="{ 'value-na': !hasRealValue(item['CLAVE CNIS']) }">{{
                                        displayValue(item['CLAVE CNIS']) }}</span>
                            </div>
                            <!-- Campos dinámicos activos: siempre se muestran si están añadidos (N/A si vacío) -->
                            <template v-for="id in activeDynamicFilterIds" :key="'dyn-' + id">
                                <div v-if="!isDynamicFieldDuplicate(id)" class="card-info-row">
                                    <span class="card-label">{{ getDynamicFieldLabel(id) }}:</span>
                                    <span class="card-value"
                                        :class="{ 'value-na': !hasRealValue(getItemFieldValue(item, id)) }">{{
                                            displayValue(getItemFieldValue(item, id)) }}</span>
                                </div>
                            </template>
                        </div>
                        <div class="card-footer">
                            <div v-if="isFieldVisible(item, 'TIPO DE MANTENIMIENTO')" class="maintenance-badge"
                                :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()">
                                <div class="badge-icon" :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()"></div>
                                {{ item['TIPO DE MANTENIMIENTO'] }}
                            </div>
                            <div v-if="isFieldVisible(item, 'FUNCIONAL SI NO')" class="functional-indicator"
                                :class="item['FUNCIONAL SI NO']?.toLowerCase()">
                                <span class="indicator-dot"></span>
                                {{
                                    item['FUNCIONAL SI NO'] === 'SI'
                                        ? 'Funcional'
                                        : item['FUNCIONAL SI NO'] === 'NO'
                                            ? 'No Funcional'
                                            : item['FUNCIONAL SI NO']
                                }}
                            </div>
                        </div>
                        <div class="card-hover-effect"></div>
                    </div>
                </div>
                <div v-if="visibleCount > pageSize && !loading" class="pagination">
                    <button @click="firstPage" :disabled="currentPage === 1" class="btn-pagination"
                        aria-label="Primera página">«</button>
                    <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination"
                        aria-label="Página anterior">Anterior</button>

                    <div class="page-numbers">
                        <button v-for="p in visiblePageNumbers" :key="`pg-${p}`" class="page-btn"
                            :class="{ active: p === currentPage }" :disabled="p === '…'"
                            @click="p !== '…' && goToPage(p)">{{ p
                            }}</button>
                    </div>

                    <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination"
                        aria-label="Página siguiente">Siguiente</button>
                    <button @click="lastPage" :disabled="currentPage === totalPages" class="btn-pagination"
                        aria-label="Última página">»</button>

                    <div class="page-info">Mostrando {{ displayedStart }}-{{ displayedEnd }} de {{ visibleCount }}
                    </div>

                    <div class="page-size-select">
                        <label for="psize">Por página</label>
                        <select id="psize" v-model="pageSize" @change="changePageSize(Number(pageSize))">
                            <option :value="6">6</option>
                            <option :value="12">12</option>
                            <option :value="24">24</option>
                            <option :value="48">48</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Detalles del mantenimiento eliminado por petición del usuario -->

            <!-- Mensaje cuando no hay datos -->
            <div v-if="filteredData.length === 0 && !loading && hasFilters" class="no-results">
                <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
            </div>
        </div>
    </ActionPanel>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import flatpickr from 'flatpickr'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'

const router = useRouter()

// Estado de datos
const allData = ref([])
const filteredData = ref([])
const selectedItem = ref(null)
const currentPage = ref(1)
const loading = ref(false)
const pageSize = ref(6)

// Persistencia
const STORAGE_KEY = 'op.testing-biomedical.filters.v1'

// Drawer (Añadir filtro)
const isAddFilterDrawerOpen = ref(false)
const drawerEl = ref(null)
const drawerAnimating = ref(false)
const drawerSearch = ref('')
const filteredDynamicCatalog = computed(() => {
    const q = String(drawerSearch.value || '').trim().toLowerCase()
    if (!q) return dynamicCatalogByCategory.value
    return dynamicCatalogByCategory.value.map(cat => ({
        category: cat.category,
        fields: (cat.fields || []).filter(f => String(f?.label || f?.id || '').toLowerCase().includes(q))
    })).filter(c => Array.isArray(c.fields) && c.fields.length > 0)
})

// Dropdown de Filtros (nueva interfaz)
const isFilterDropdownOpen = ref(false)
const filterDropdownBtn = ref(null)
const dropdownSearch = ref('')

const filteredDropdownCatalog = computed(() => {
    const q = String(dropdownSearch.value || '').trim().toLowerCase()
    if (!q) return dynamicCatalogByCategory.value
    return dynamicCatalogByCategory.value.map(cat => ({
        category: cat.category,
        fields: (cat.fields || []).filter(f => String(f?.label || f?.id || '').toLowerCase().includes(q))
    })).filter(c => Array.isArray(c.fields) && c.fields.length > 0)
})

// Catálogo DB-driven
const metaLoading = ref(false)
const metaError = ref('')
const metaFields = ref([])

// Filtros dinámicos activos (por id)
const activeDynamicFilterIds = ref([])
const dynamicFilterValues = ref({})

// Control de restauración
let isRestoring = true

// Filtros iniciales
const initialFilters = {
    no: '',
    noRegistro: '',
    equipoMedico: '',
    marca: '',
    tipoMantenimiento: '',
    estatus: '',
    funcional: '',
    unidadMedica: ''
}

const filters = ref({ ...initialFilters })

const FIXED_FIELD_IDS = new Set(['estatus', 'equipoMedico', 'funcional', 'marca', 'unidadMedica', 'tipoMantenimiento'])

// Mapear ids de meta a las claves exactas usadas en los objetos de item (caso DB/labels)
const FIXED_COLUMN_MAP = {
    // Backend uses 'no' for inventory folio; 'no_registro' maps to column 'No' (label shown as 'No')
    no: 'No DE INVENTARIO',
    no_registro: 'No',
    'no_de_inventario': 'No DE INVENTARIO',
    equipoMedico: 'EQUIPO MEDICO',
    marca: 'MARCA',
    modelo: 'MODELO',
    claveCnis: 'CLAVE CNIS',
    clave_cnis: 'CLAVE CNIS',
    numeroSerie: 'NUMERO DE SERIE',
    numero_de_serie: 'NUMERO DE SERIE',
    tipoMantenimiento: 'TIPO DE MANTENIMIENTO',
    funcional: 'FUNCIONAL SI NO',
    unidadMedica: 'UNIDAD MEDICA',
    estatus: 'ESTATUS'
}

// Computed
// Helper: decide si una fila tiene al menos un campo con información real
function hasRealData(item) {
    if (!item || typeof item !== 'object') return false
    const checkFields = [
        'No DE INVENTARIO', 'EQUIPO MEDICO', 'MARCA', 'MODELO', 'CLAVE CNIS',
        'NUMERO DE SERIE', 'TIPO DE MANTENIMIENTO', 'FUNCIONAL SI NO', 'UNIDAD MEDICA'
    ]
    // Check default fields first
    for (const f of checkFields) {
        const v = item[f]
        if (v === null || v === undefined) continue
        const s = String(v).trim()
        if (!s) continue
        const low = s.toLowerCase()
        if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') continue
        return true
    }
    // If no default fields, check any active dynamic filter fields for data
    for (const id of activeDynamicFilterIds.value) {
        const col = getMetaFieldColumn(id)
        if (!col) continue
        const v = item[col]
        if (v === null || v === undefined) continue
        const s = String(v).trim()
        if (!s) continue
        const low = s.toLowerCase()
        if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') continue
        return true
    }
    return false
}

function isFieldVisible(item, fieldName) {
    if (!item) return false
    const v = item[fieldName]
    if (v === null || v === undefined) return false
    const s = String(v).trim()
    if (!s) return false
    const low = s.toLowerCase()
    if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') return false
    return true
}

// Determina si un valor tiene datos reales (no vacío, no N/A)
function hasRealValue(v) {
    if (v === null || v === undefined) return false
    const s = String(v).trim()
    if (!s) return false
    const low = s.toLowerCase()
    if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') return false
    return true
}

// Muestra el valor o 'N/A' si está vacío
function displayValue(v) {
    if (v === null || v === undefined) return 'N/A'
    const s = String(v).trim()
    if (!s) return 'N/A'
    const low = s.toLowerCase()
    if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') return 'N/A'
    return v
}

// Indica si el item tiene muchos campos vacíos (sparse)
function isSparse(item) {
    if (!item || typeof item !== 'object') return false
    const checkFields = [
        'No DE INVENTARIO', 'EQUIPO MEDICO', 'MARCA', 'MODELO', 'CLAVE CNIS',
        'NUMERO DE SERIE', 'TIPO DE MANTENIMIENTO', 'FUNCIONAL SI NO', 'UNIDAD MEDICA'
    ]
    let total = 0
    let filled = 0
    for (const f of checkFields) {
        total++
        const v = item[f]
        if (v === null || v === undefined) continue
        const s = String(v).trim()
        if (!s) continue
        const low = s.toLowerCase()
        if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') continue
        filled++
    }
    if (total === 0) return false
    const filledRatio = filled / total
    // Si hay menos o igual al 40% de campos con datos reales, consideramos "pocos datos"
    return filledRatio <= 0.4
}

const displayedCards = computed(() => {
    const visible = Array.isArray(filteredData.value) ? filteredData.value.filter(hasRealData) : []
    const startIndex = (currentPage.value - 1) * pageSize.value
    return visible.slice(startIndex, startIndex + pageSize.value)
})

const visibleCount = computed(() => {
    return Array.isArray(filteredData.value) ? filteredData.value.filter(hasRealData).length : 0
})

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(visibleCount.value / pageSize.value))
})

const hasFilters = computed(() => {
    const fixedHas = Object.values(filters.value).some(v => String(v || '').trim() !== '')
    const dynamicHas = activeDynamicFilterIds.value.some(id => String(dynamicFilterValues.value[id] || '').trim() !== '')
    return fixedHas || dynamicHas
})

const displayedStart = computed(() => {
    if (!visibleCount.value) return 0
    return (currentPage.value - 1) * pageSize.value + 1
})

const displayedEnd = computed(() => {
    if (!visibleCount.value) return 0
    return Math.min(currentPage.value * pageSize.value, visibleCount.value)
})

const visiblePageNumbers = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const range = []
    range.push(1)
    let start = Math.max(2, cur - 2)
    let end = Math.min(total - 1, cur + 2)
    if (start > 2) range.push('…')
    for (let i = start; i <= end; i++) range.push(i)
    if (end < total - 1) range.push('…')
    range.push(total)
    return range
})

const searchStatusMessage = computed(() => {
    return loading.value ? 'Actualizando resultados y sincronizando con inventario...' : 'Listo para explorar con precisión'
})

const equipoMedicoDatalistId = 'fixed-equipoMedico-datalist'
const marcaDatalistId = 'fixed-marca-datalist'
const unidadMedicaDatalistId = 'fixed-unidadMedica-datalist'

const equipoMedicoSuggestions = computed(() => {
    return getMetaFieldSuggestions('equipoMedico')
})

const marcaSuggestions = computed(() => {
    return getMetaFieldSuggestions('marca')
})

const unidadMedicaSuggestions = computed(() => {
    return getMetaFieldSuggestions('unidadMedica')
})

const estatusOptions = computed(() => {
    const items = Array.isArray(allData.value) ? allData.value : []

    const normalize = (v) => String(v ?? '').trim().replace(/\s+/g, ' ')

    // Prefer meta distinct values (these should match DB exactly)
    const direct = getMetaField('estatus')
    const byColumn = (metaFields.value || []).find(f => {
        const col = getMetaFieldColumn(f?.id)
        return String(col || '').toUpperCase() === 'ESTATUS'
    })
    const byLabel = (metaFields.value || []).find(f => String(f?.label || '').toLowerCase().includes('estatus'))

    const field = direct || byColumn || byLabel
    const metaValues = Array.isArray(field?.distinctValues) ? field.distinctValues : []

    const set = new Map()
    for (const v of metaValues) {
        const n = normalize(v)
        if (!n) continue
        if (!set.has(n.toLowerCase())) set.set(n.toLowerCase(), n)
    }

    // Fallback: derive from loaded data (useful if meta doesn't include estatus)
    if (set.size === 0) {
        for (const it of items) {
            const raw = it?.['ESTATUS']
            const n = normalize(raw)
            if (!n) continue
            if (!set.has(n.toLowerCase())) set.set(n.toLowerCase(), n)
        }
    }

    // Keep current selection visible even if not in meta list (but skip internal sentinel value)
    if (filters.value.estatus && filters.value.estatus !== SIN_ESTADO_VALUE) {
        const n = normalize(filters.value.estatus)
        if (n && !set.has(n.toLowerCase())) set.set(n.toLowerCase(), n)
    }

    return Array.from(set.values()).sort((a, b) => String(a).localeCompare(String(b)))
})

const dynamicCatalog = computed(() => {
    const all = Array.isArray(metaFields.value) ? metaFields.value : []
    // No mostrar en el modal los aliases de filtros fijos (solo sirven para sugerencias)
    return all.filter(f => !f?.fixed)
})

const dynamicCatalogByCategory = computed(() => {
    const groups = new Map()
    for (const field of dynamicCatalog.value) {
        const category = field.category || 'Otros'
        if (!groups.has(category)) groups.set(category, [])
        groups.get(category).push(field)
    }
    return Array.from(groups.entries()).map(([category, fields]) => ({
        category,
        fields: fields.slice().sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')))
    }))
})

const vFlatpickr = {
    mounted(el) {
        // Only attach to date inputs (we only use this directive there)
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

// Métodos
function goToDashboard() {
    navigateAndRefresh(router, { name: 'dashboard' })
}

function openAddFilterDrawer() {
    // Trigger animated open from button position and position the drawer under the button
    isAddFilterDrawerOpen.value = true
    drawerAnimating.value = true
    if (!metaFields.value.length) fetchMeta()

    nextTick(() => {
        try {
            const btn = document.querySelector('.btn-open-drawer')
            const drawer = drawerEl.value
            if (!drawer || !btn) { drawerAnimating.value = false; return }

            const b = btn.getBoundingClientRect()
            const d = drawer.getBoundingClientRect()

            // Compute final left so the drawer is centered horizontally on the button
            let left = Math.round(b.left + b.width / 2 - d.width / 2)
            const margin = 12
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
            left = Math.max(margin, Math.min(left, vw - d.width - margin))

            // Try to place below button; if not enough space, place above
            const spaceBelow = window.innerHeight - b.bottom
            let top
            if (spaceBelow >= d.height + 20) {
                top = Math.round(b.bottom + 10)
            } else {
                top = Math.round(Math.max(margin, b.top - d.height - 10))
            }

            // Final positioning
            drawer.style.position = 'fixed'
            drawer.style.left = `${left}px`
            drawer.style.top = `${top}px`
            drawer.style.transformOrigin = 'top center'

            // Start small at the top origin so it looks like it unfolds from the button
            const startScale = Math.max(0.12, Math.min(0.28, Math.min(b.width / d.width, b.height / d.height)))
            drawer.style.transform = `translateY(-6px) scale(${startScale})`
            drawer.style.opacity = '0'
            // Force style flush
            void drawer.offsetWidth

            requestAnimationFrame(() => {
                drawer.style.transition = 'transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease'
                drawer.style.transform = ''
                drawer.style.opacity = '1'
            })

            const onEnd = (e) => {
                if (e && e.target !== drawer) return
                drawer.removeEventListener('transitionend', onEnd)
                drawer.style.transition = ''
                drawerAnimating.value = false
                const focusable = drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                if (focusable) focusable.focus()
                // Reposition after content settles (meta might fill the drawer)
                positionDrawerUnderButton()
            }
            drawer.addEventListener('transitionend', onEnd)
        } catch (err) {
            drawerAnimating.value = false
        }
    })
}

function closeAddFilterDrawer() {
    const drawer = drawerEl.value
    const btn = document.querySelector('.btn-open-drawer')
    if (drawer && btn) {
        drawerAnimating.value = true
        const b = btn.getBoundingClientRect()
        const d = drawer.getBoundingClientRect()
        // compute translate dx/dy from drawer final position to button center
        const centerDrawerX = d.left + d.width / 2
        const centerDrawerY = d.top + d.height / 2
        const centerBtnX = b.left + b.width / 2
        const centerBtnY = b.top + b.height / 2
        const dx = Math.round(centerBtnX - centerDrawerX)
        const dy = Math.round(centerBtnY - centerDrawerY)
        // scale towards button size
        const scale = Math.max(0.12, Math.min(0.28, Math.min(b.width / d.width, b.height / d.height)))

        drawer.style.transition = 'transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 180ms ease'
        drawer.style.transformOrigin = 'top center'
        drawer.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
        drawer.style.opacity = '0'

        const onEnd = () => {
            drawer.removeEventListener('transitionend', onEnd)
            drawer.style.transition = ''
            drawer.style.transform = ''
            drawer.style.opacity = ''
            drawer.style.left = ''
            drawer.style.top = ''
            drawer.style.position = ''
            drawerAnimating.value = false
            isAddFilterDrawerOpen.value = false
        }
        drawer.addEventListener('transitionend', onEnd)
    } else {
        isAddFilterDrawerOpen.value = false
    }
}

// Métodos para dropdown de filtros
function toggleFilterDropdown() {
    if (isFilterDropdownOpen.value) {
        closeFilterDropdown()
    } else {
        openFilterDropdown()
    }
}

function openFilterDropdown() {
    isFilterDropdownOpen.value = true
    if (!metaFields.value.length) fetchMeta()
}

function closeFilterDropdown() {
    isFilterDropdownOpen.value = false
    dropdownSearch.value = ''
}

function positionFilterDropdown() {
    const button = document.querySelector('.btn-filter-primary')
    const menu = document.querySelector('.dropdown-filters-menu')
    const container = document.querySelector('.dropdown-filters-container')

    if (!button || !menu || !container) return

    const btnRect = button.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const padding = 20
    const menuWidth = 380

    // Desactivar transiciones temporalmente para la posición inicial
    const hadTransition = menu.style.transition
    menu.style.transition = 'none'

    // ===== POSICIÓN VERTICAL =====
    const spaceBelow = viewportHeight - btnRect.bottom - padding
    const spaceAbove = btnRect.top - padding
    const minHeight = 300

    if (spaceBelow >= minHeight) {
        menu.style.maxHeight = `${Math.min(70 * viewportHeight / 100, spaceBelow)}px`
        menu.classList.remove('menu-above')
        menu.classList.add('menu-below')
    } else if (spaceAbove >= minHeight) {
        menu.style.maxHeight = `${Math.min(70 * viewportHeight / 100, spaceAbove)}px`
        menu.classList.add('menu-above')
        menu.classList.remove('menu-below')
    } else {
        const availableHeight = Math.max(spaceBelow, spaceAbove)
        menu.style.maxHeight = `${Math.min(70 * viewportHeight / 100, availableHeight)}px`
        menu.classList.remove('menu-above')
        menu.classList.add('menu-below')
    }

    // ===== POSICIÓN HORIZONTAL =====
    // Calcular si el dropdown cabe a la derecha del contenedor
    const rightEdge = containerRect.left + menuWidth

    if (rightEdge > viewportWidth - padding) {
        // No cabe a la derecha, alinear desde la derecha del contenedor
        menu.style.left = 'auto'
        menu.style.right = '0'
        menu.classList.add('menu-right-aligned')
    } else {
        // Cabe a la derecha, alinear normal
        menu.style.left = '0'
        menu.style.right = 'auto'
        menu.classList.remove('menu-right-aligned')
    }

    // Restaurar transiciones después de la siguiente frame
    requestAnimationFrame(() => {
        menu.style.transition = hadTransition || ''
    })
}

function handleFilterCheckboxChange(fieldId) {
    if (activeDynamicFilterIds.value.includes(fieldId)) {
        removeDynamicFilter(fieldId)
    } else {
        addDynamicFilter(fieldId)
    }
}

function handleGlobalKeydown(e) {
    if (e && e.key === 'Escape') {
        if (isAddFilterDrawerOpen.value) closeAddFilterDrawer()
        if (isFilterDropdownOpen.value) closeFilterDropdown()
    }
}

function positionDrawerUnderButton() {
    const drawer = drawerEl.value
    const btn = document.querySelector('.btn-open-drawer')
    if (!drawer || !btn) return
    // ensure drawer has fixed positioning
    drawer.style.position = 'fixed'
    const b = btn.getBoundingClientRect()
    const d = drawer.getBoundingClientRect()

    const margin = 12
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

    // Compute horizontal position: center on the button but keep within viewport
    let left = Math.round(b.left + b.width / 2 - d.width / 2)
    left = Math.max(margin, Math.min(left, vw - d.width - margin))

    // Compute vertical position ensuring the drawer does NOT overlap the button
    const arrowHeight = 12
    const gap = Math.max(8, Math.ceil(arrowHeight / 2)) // minimal gap between button and drawer
    const spaceBelow = window.innerHeight - b.bottom
    const spaceAbove = b.top

    let top
    let placeBelow = false

    if (spaceBelow >= d.height + gap) {
        // enough room below
        top = Math.round(b.bottom + gap)
        placeBelow = true
    } else if (spaceAbove >= d.height + gap) {
        // enough room above
        top = Math.round(b.top - d.height - gap)
        placeBelow = false
    } else {
        // not enough room either side; fit as best as possible below with caps
        top = Math.round(Math.max(margin, Math.min(b.bottom + gap, window.innerHeight - d.height - margin)))
        placeBelow = top >= b.bottom
        // if still overlaps, nudge the top to be just below button
        if (top < b.bottom && spaceBelow > 0) {
            top = Math.min(Math.round(b.bottom + gap), window.innerHeight - d.height - margin)
            placeBelow = top >= b.bottom
        }
    }

    drawer.style.left = `${left}px`
    drawer.style.top = `${top}px`

    // Arrow: compute where to place an arrow so the drawer looks attached to the button
    const arrowWidth = 12
    let arrowLeft = Math.round((b.left + b.width / 2) - left - (arrowWidth / 2))
    // Clamp arrow left so it never goes outside the drawer bounds
    arrowLeft = Math.max(8, Math.min(arrowLeft, Math.round(d.width - arrowWidth - 8)))
    drawer.style.setProperty('--arrow-left', `${arrowLeft}px`)

    if (placeBelow) {
        drawer.classList.add('drawer-below')
        drawer.classList.remove('drawer-above')
    } else {
        drawer.classList.add('drawer-above')
        drawer.classList.remove('drawer-below')
    }
}

function handleResize() {
    if (isAddFilterDrawerOpen.value) positionDrawerUnderButton()
    if (isFilterDropdownOpen.value) positionFilterDropdown()
}

function handleScroll() {
    if (isAddFilterDrawerOpen.value) positionDrawerUnderButton()
    if (isFilterDropdownOpen.value) positionFilterDropdown()
}


function isFixedField(id) {
    return FIXED_FIELD_IDS.has(id)
}

function addDynamicFilter(id) {
    if (!id) return
    if (isFixedField(id)) return
    if (activeDynamicFilterIds.value.includes(id)) return
    if (activeDynamicFilterIds.value.length >= 15) return
    activeDynamicFilterIds.value = [...activeDynamicFilterIds.value, id]
    if (!(id in dynamicFilterValues.value)) {
        dynamicFilterValues.value = { ...dynamicFilterValues.value, [id]: '' }
    }
    closeAddFilterDrawer()
}

function removeDynamicFilter(id) {
    activeDynamicFilterIds.value = activeDynamicFilterIds.value.filter(x => x !== id)
    const next = { ...dynamicFilterValues.value }
    delete next[id]
    dynamicFilterValues.value = next
}

function clearDynamicFilters() {
    activeDynamicFilterIds.value = []
    dynamicFilterValues.value = {}
}

function getMetaField(id) {
    return (metaFields.value || []).find(f => f.id === id)
}

function getMetaFieldSuggestions(id) {
    const field = getMetaField(id)
    const values = Array.isArray(field?.distinctValues) ? field.distinctValues : []
    return values.slice(0, 50)
}

function getDynamicFieldLabel(id) {
    return getMetaField(id)?.label || id
}

function getDynamicFieldKind(id) {
    return getMetaField(id)?.kind || 'text'
}

function isDynamicSelectable(id) {
    return Boolean(getMetaField(id)?.selectable)
}

function getDynamicSelectOptions(id) {
    const field = getMetaField(id)
    const values = Array.isArray(field?.distinctValues) ? field.distinctValues : []
    return values.slice(0, 10)
}

function getDynamicSuggestions(id) {
    return getMetaFieldSuggestions(id)
}

function getDynamicDatalistId(id) {
    return `dyn-${id}-datalist`
}

function getDynamicValue(id) {
    return String(dynamicFilterValues.value[id] ?? '')
}

function setDynamicValue(id, value) {
    dynamicFilterValues.value = { ...dynamicFilterValues.value, [id]: value }
}

function getFieldTypeLabel(field) {
    if (!field) return 'Texto'
    if (field.kind === 'boolean') return 'Sí/No'
    if (field.kind === 'date') return 'Fecha'
    if (field.selectable) return 'Select'
    return 'Texto'
}

function getMetaFieldColumn(id) {
    const field = getMetaField(id)
    if (!field) return null
    // Prefer explicit fixed mapping first
    if (field && field.id && FIXED_COLUMN_MAP[field.id]) return FIXED_COLUMN_MAP[field.id]
    // Backend-provided column hints
    if (field.column) return field.column
    if (field.columnName) return field.columnName
    if (field.dbColumn) return field.dbColumn
    if (field.property) return field.property
    if (field.key) return field.key
    if (field.id) return field.id
    return null
}

function getItemFieldValue(item, id) {
    const col = getMetaFieldColumn(id)
    if (!item) return null
    const candidates = []
    if (col) candidates.push(col)
    // common alternates
    try {
        if (typeof col === 'string') {
            candidates.push(col.toUpperCase())
            candidates.push(col.replace(/_/g, ' ').toUpperCase())
            candidates.push(col.replace(/\s+/g, '_').toLowerCase())
            candidates.push(col.toLowerCase())
        }
    } catch (e) { }
    const field = getMetaField(id)
    if (field && field.label) {
        candidates.push(field.label)
        candidates.push(String(field.label).toUpperCase())
        candidates.push(String(field.label).replace(/\s+/g, '_').toLowerCase())
    }
    // Always try raw id as last resort
    if (id) candidates.push(id)

    for (const c of candidates) {
        if (!c) continue
        if (Object.prototype.hasOwnProperty.call(item, c)) {
            return item[c]
        }
    }
    return null
}

function isDynamicFieldVisibleInItem(item, id) {
    if (!item) return false
    const v = getItemFieldValue(item, id)
    if (v === null || v === undefined) return false
    const s = String(v).trim()
    if (!s) return false
    const low = s.toLowerCase()
    if (low === 'n/a' || low === 'sin clave' || low === 'sin datos' || low === 'no disponible') return false
    return true
}

function isColumnInDefaults(col) {
    if (!col) return false
    const defaults = [
        'No DE INVENTARIO', 'EQUIPO MEDICO', 'ESTATUS', 'MARCA', 'MODELO', 'CLAVE CNIS',
        'TIPO DE MANTENIMIENTO', 'FUNCIONAL SI NO', 'UNIDAD MEDICA'
    ]
    return defaults.includes(col)
}

function isDynamicFieldDuplicate(id) {
    const col = getMetaFieldColumn(id)
    return isColumnInDefaults(col)
}

async function fetchMeta() {
    try {
        metaLoading.value = true
        const response = await fetch('/api/ops/historial-mantenimientos/meta')
        const json = await response.json().catch(() => ({}))
        metaFields.value = Array.isArray(json.fields) ? json.fields : []
        // If drawer is open, reposition under button after data loads
        if (isAddFilterDrawerOpen.value) {
            nextTick(() => positionDrawerUnderButton())
        }
    } catch (e) {
        console.error('Error cargando metadatos de filtros:', e)
        metaFields.value = []
    } finally {
        metaLoading.value = false
    }
}

let searchTimer = null
function scheduleSearch() {
    if (isRestoring) return
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        runSearch()
    }, 300)
}

let persistTimer = null
function schedulePersist() {
    if (isRestoring) return
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
        persistFilters()
    }, 150)
}

function persistFilters() {
    try {
        const payload = {
            fixed: { ...filters.value },
            dynamicIds: [...activeDynamicFilterIds.value],
            dynamicValues: { ...dynamicFilterValues.value }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
        console.warn('No se pudo persistir filtros en localStorage:', e)
    }
}

function restoreFilters() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)

        const fixed = parsed && typeof parsed.fixed === 'object' ? parsed.fixed : {}
        filters.value = { ...initialFilters, ...fixed }

        const ids = Array.isArray(parsed?.dynamicIds) ? parsed.dynamicIds : []
        const unique = []
        for (const id of ids) {
            if (!id || typeof id !== 'string') continue
            if (isFixedField(id)) continue
            if (unique.includes(id)) continue
            if (unique.length >= 15) break
            unique.push(id)
        }
        activeDynamicFilterIds.value = unique

        const values = parsed && typeof parsed.dynamicValues === 'object' ? parsed.dynamicValues : {}
        const nextValues = {}
        for (const id of unique) {
            nextValues[id] = String(values[id] ?? '')
        }
        dynamicFilterValues.value = nextValues
    } catch (e) {
        console.warn('No se pudo restaurar filtros desde localStorage:', e)
    }
}

function buildQueryParams() {
    const queryParams = new URLSearchParams()

    if (filters.value.no.trim()) queryParams.append('no', filters.value.no.trim())
    if ((filters.value.noRegistro || '').trim()) queryParams.append('no_registro', (filters.value.noRegistro || '').trim())
    if (filters.value.equipoMedico.trim()) queryParams.append('equipoMedico', filters.value.equipoMedico.trim())
    if (filters.value.marca.trim()) queryParams.append('marca', filters.value.marca.trim())
    if (filters.value.tipoMantenimiento) queryParams.append('tipoMantenimiento', filters.value.tipoMantenimiento)
    if (filters.value.estatus && filters.value.estatus !== SIN_ESTADO_VALUE) queryParams.append('estatus', filters.value.estatus)
    if (filters.value.funcional) queryParams.append('funcional', filters.value.funcional)
    if (filters.value.unidadMedica.trim()) queryParams.append('unidadMedica', filters.value.unidadMedica.trim())

    for (const id of activeDynamicFilterIds.value) {
        const value = String(dynamicFilterValues.value[id] || '').trim()
        if (!value) continue
        queryParams.append(`dyn_${id}`, value)
    }

    return queryParams
}

const SIN_ESTADO_VALUE = '__SIN_ESTADO__'

async function runSearch() {
    try {
        loading.value = true
        metaError.value = ''
        const queryParams = buildQueryParams()
        const url = `/api/ops/historial-mantenimientos${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        const response = await fetch(url)

        if (!response.ok) {
            const json = await response.json().catch(() => ({}))
            throw new Error(json.msg || json.error || `HTTP ${response.status}`)
        }

        const data = await response.json().catch(() => null)
        const items = Array.isArray(data)
            ? data
            : (Array.isArray(data && data.data) ? data.data : [])
        allData.value = items
        if (filters.value.estatus === SIN_ESTADO_VALUE) {
            filteredData.value = items.filter(it => !hasRealValue(it?.['ESTATUS']))
        } else {
            filteredData.value = items
        }
    } catch (error) {
        console.error('Error aplicando filtros avanzados:', error)
        allData.value = []
        filteredData.value = []
    } finally {
        loading.value = false
    }
    currentPage.value = 1
    selectedItem.value = null
}

function getStatusAccentClass(item) {
    const status = item['ESTATUS']?.toLowerCase()
    const funcional = item['FUNCIONAL SI NO']?.toLowerCase()

    if (funcional === 'no') return 'accent-critical'
    if (status?.includes('mantenimiento')) return 'accent-warning'
    if (status === 'inactivo' || status?.includes('no operativo')) return 'accent-warning'
    if ((status === 'activo' || status?.includes('operativo')) && funcional === 'si') return 'accent-success'
    return 'accent-default'
}

function getStatusGlowClass(item) {
    const status = item['ESTATUS']?.toLowerCase()
    const funcional = item['FUNCIONAL SI NO']?.toLowerCase()

    if (funcional === 'no') return 'glow-critical'
    if (status?.includes('mantenimiento')) return 'glow-warning'
    if (status === 'inactivo' || status?.includes('no operativo')) return 'glow-warning'
    if ((status === 'activo' || status?.includes('operativo')) && funcional === 'si') return 'glow-success'
    return 'glow-default'
}

function getStatusPillClass(item) {
    const statusRaw = item?.['ESTATUS']
    const status = statusRaw ? String(statusRaw).toLowerCase() : ''
    const funcional = item['FUNCIONAL SI NO']?.toLowerCase()

    if (!hasRealValue(statusRaw)) return 'status-unknown'
    if (status.includes('propio')) return 'status-success'

    if (funcional === 'no') return 'status-critical'
    if (status?.includes('mantenimiento')) return 'status-warning'
    if (status === 'inactivo' || status?.includes('no operativo')) return 'status-warning'
    if ((status === 'activo' || status?.includes('operativo')) && funcional === 'si') return 'status-success'
    return 'status-default'
}

function getStatusTextClass(item) {
    const raw = item?.['ESTATUS']
    if (!hasRealValue(raw)) return 'sin-estado'
    return String(raw).toLowerCase()
}

function selectItem(item) {
    // Legacy single-select setter
    selectedItem.value = item
}

function getItemKey(item, idx) {
    if (!item || typeof item !== 'object') return `idx:${idx}`
    const inv = item['No DE INVENTARIO']
    const no = item['No']
    const id = item._id
    const key = (inv && String(inv).trim()) || (no && String(no).trim()) || (id && String(id).trim())
    return key ? `k:${key}` : `idx:${idx}`
}

function isExpanded(item, idx) {
    if (!selectedItem.value) return false
    return getItemKey(selectedItem.value, -1) === getItemKey(item, idx)
}

function toggleSelect(item) {
    if (!item) { selectedItem.value = null; return }
    // Toggle: if the same item is selected, collapse; otherwise expand
    if (selectedItem.value && getItemKey(selectedItem.value, -1) === getItemKey(item, -1)) {
        selectedItem.value = null
    } else {
        selectedItem.value = item
        // Smooth scroll the expanded card into center view
        nextTick(() => {
            try {
                const el = document.querySelector('.maintenance-card.active')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } catch (e) { }
        })
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

function previousPage() {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

function firstPage() {
    currentPage.value = 1
}

function lastPage() {
    currentPage.value = totalPages.value
}

function goToPage(n) {
    if (typeof n === 'number' && n >= 1 && n <= totalPages.value) currentPage.value = n
}

function changePageSize(n) {
    pageSize.value = n
    currentPage.value = 1
}

// Ciclo de vida
function handleClickOutside(e) {
    if (isFilterDropdownOpen.value) {
        const container = document.querySelector('.dropdown-filters-container')
        const menu = document.querySelector('.dropdown-filters-menu')
        const btn = filterDropdownBtn.value
        // click outside both the container/menu/button closes the dropdown
        if (container && !container.contains(e.target) && (!menu || !menu.contains(e.target)) && (!btn || !btn.contains(e.target))) {
            closeFilterDropdown()
        }
    }
}

onMounted(async () => {
    window.addEventListener('keydown', handleGlobalKeydown)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleClickOutside)
    restoreFilters()
    await fetchMeta()
    isRestoring = false
    await runSearch()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('keydown', handleGlobalKeydown)
    document.removeEventListener('click', handleClickOutside)
})

watch(filters, () => {
    schedulePersist()
    scheduleSearch()
}, { deep: true })

watch(activeDynamicFilterIds, () => {
    schedulePersist()
    scheduleSearch()
}, { deep: true })

watch(dynamicFilterValues, () => {
    schedulePersist()
    scheduleSearch()
}, { deep: true })

watch([dropdownSearch, filteredDropdownCatalog], () => {
    // No need to reposition with the new absolute positioning system
})

watch(isFilterDropdownOpen, (newVal) => {
    if (newVal) {
        // Cuando se abre, posicionar inmediatamente
        nextTick(() => {
            positionFilterDropdown()
        })
    }
})

// Asegura que la página actual siempre esté dentro del rango válido
watch(totalPages, (tp) => {
    if (currentPage.value > tp) currentPage.value = tp
})

watch(pageSize, (n) => {
    if (!n || Number(n) <= 0) pageSize.value = 6
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})
</script>

<style scoped>
.testing-environment-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.btn-back-to-dashboard {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-back-to-dashboard:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #1f2937;
}

.spacer {
    flex: 1;
}

.testing-content {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

/* Sección de Filtros */
.filters-section {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(2, 132, 199, 0.25) 100%);
    border: 1px solid rgba(37, 99, 235, 0.4);
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 10px 30px rgba(2, 132, 199, 0.25);
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}

.filters-section::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: linear-gradient(160deg, transparent 40%, rgba(59, 130, 246, 0.15));
    pointer-events: none;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #374151;
}

.filters-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.filters-global-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 12px;
}

.btn-clear-dynamic,
.btn-open-drawer {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.btn-clear-dynamic {
    color: #0f172a;
    background: rgba(226, 232, 240, 0.95);
    border-color: rgba(148, 163, 184, 0.6);
}

.btn-clear-dynamic:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.btn-clear-dynamic:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.25);
}

.btn-open-drawer {
    color: #ecfeff;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.9), rgba(59, 130, 246, 0.9));
    border-color: rgba(34, 211, 238, 0.35);
    position: relative;
    z-index: 600;
    /* keep button clearly above overlay and drawer */
}

.btn-open-drawer:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(34, 211, 238, 0.25);
}

.search-signal {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 999px;
    border: 1px solid rgba(14, 165, 233, 0.3);
    background: rgba(14, 165, 233, 0.08);
    color: #e0f2fe;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    transition: all 0.3s ease;
}

.search-signal.is-active {
    background: rgba(14, 165, 233, 0.2);
    border-color: rgba(14, 165, 233, 0.5);
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.35);
}

.search-signal svg {
    color: #22d3ee;
    animation: searchPulse 1.6s ease-in-out infinite;
}

.signal-text {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
}

.signal-text strong {
    font-size: 0.9rem;
}

.signal-text span {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.8);
}

@keyframes searchPulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.15);
    }

    100% {
        transform: scale(1);
    }
}

.filters-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filters-section h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f3f4f6;
    letter-spacing: -0.5px;
}

.icon-search {
    color: #06b6d4;
    flex-shrink: 0;
}

.filters-callout {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(56, 189, 248, 0.08), rgba(14, 165, 233, 0.12));
    border: 1px solid rgba(14, 165, 233, 0.4);
    margin-bottom: 20px;
    box-shadow: 0 12px 24px rgba(15, 118, 212, 0.25);
    position: relative;
    overflow: hidden;
}

.filters-callout::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.5), transparent 60%);
    opacity: 0.6;
    pointer-events: none;
}

.callout-icon {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(14, 165, 233, 0.8);
    color: #bfdbfe;
    flex-shrink: 0;
}

.callout-icon svg {
    position: relative;
    z-index: 2;
}

/* Layout: ZONA IZQUIERDA (FIJA) + ZONA DERECHA (DINÁMICA) */
.filters-layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

.filters-layout.has-dynamic {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.filters-zone {
    border-radius: 16px;
    padding: 16px;
    backdrop-filter: blur(10px);
}

.filters-zone-fixed {
    border: 1px solid rgba(59, 130, 246, 0.55);
    background: rgba(191, 219, 254, 0.14);
}

.filters-zone-dynamic {
    border: 1px solid rgba(34, 197, 94, 0.55);
    background: rgba(187, 247, 208, 0.12);
}

.zone-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.zone-title {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #f8fafc;
}

.zone-subtitle {
    font-size: 0.85rem;
    color: rgba(226, 232, 240, 0.75);
}

.zone-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.2px;
}

.zone-pill-fixed {
    color: #0b1220;
    background: rgba(147, 197, 253, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.55);
}

.zone-pill-dynamic {
    color: #052e16;
    background: rgba(134, 239, 172, 0.95);
    border: 1px solid rgba(34, 197, 94, 0.55);
}

.filters-grid-fixed,
.filters-grid-dynamic {
    display: grid;
    gap: 12px;
}

/* ESTADO INICIAL: 2x4 en desktop (7 campos llenan 2 filas) */
.filters-grid-fixed.grid-initial {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* Con dinámicos: grids internos más legibles */
.filters-layout.has-dynamic .filters-grid-fixed {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filters-grid-dynamic {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filter-card {
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(15, 23, 42, 0.35);
}

.filter-card-fixed {
    border-color: rgba(59, 130, 246, 0.35);
    background: rgba(30, 58, 138, 0.18);
}

.filter-card-dynamic {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(20, 83, 45, 0.18);
}

.filter-card label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 800;
    color: rgba(226, 232, 240, 0.92);
    margin-bottom: 8px;
}

.field-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 900;
}

.field-badge-fixed {
    color: #0b1220;
    background: rgba(147, 197, 253, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.55);
}

.dynamic-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
}

.btn-remove-filter {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.12);
    color: rgba(220, 252, 231, 0.95);
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
}

.btn-remove-filter:hover {
    transform: translateY(-1px);
    background: rgba(34, 197, 94, 0.18);
}

.tri-toggle {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.tri-option {
    height: 38px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.35);
    color: rgba(226, 232, 240, 0.9);
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.tri-option.active {
    background: rgba(34, 211, 238, 0.16);
    border-color: rgba(34, 211, 238, 0.45);
}

.tri-toggle-dynamic .tri-option.active {
    background: rgba(34, 197, 94, 0.16);
    border-color: rgba(34, 197, 94, 0.45);
}

/* Drawer */
.drawer-overlay {
    position: fixed;
    inset: 0;
    background: transparent;
    /* no dimming effect as requested */
    /* no backdrop blur */
    z-index: 80;
    /* keep low so the opener button can be above */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
}

.drawer {
    width: min(520px, 92vw);
    /* more compact */
    max-height: 78vh;
    /* smaller to avoid covering too much */
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(59, 130, 246, 0.28);
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.48);
    display: flex;
    flex-direction: column;
    position: fixed;
    /* anchor to viewport to allow exact left/top */
    transform-origin: top center;
    z-index: 200;
    /* above overlay but below the opener button */
    overflow: hidden;
}

.drawer-body {
    padding: 10px 12px;
    overflow: auto;
}

.drawer-meta {
    padding: 6px 6px 12px 6px;
}

.drawer-search-wrapper {
    padding: 8px 12px;
}

.drawer-search {
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(10, 14, 22, 0.45);
    color: #e6f8ff;
}

.drawer-list .drawer-item {
    padding: 8px 10px;
    border-radius: 10px;
}

.drawer-item-name {
    font-size: 0.92rem;
}


.drawer.animating {
    pointer-events: none;
}

/* triangle pointer to visually connect drawer to the opener button */
.drawer::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    left: var(--arrow-left, 26px);
    top: -6px;
    background: rgba(15, 23, 42, 0.96);
    transform: rotate(45deg);
    border-left: 1px solid rgba(59, 130, 246, 0.18);
    border-top: 1px solid rgba(59, 130, 246, 0.18);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.28);
    opacity: 0.98;
    transition: opacity 180ms ease, transform 180ms ease;
}

.drawer.drawer-above::after {
    top: auto;
    bottom: -6px;
    transform: rotate(225deg);
}


.drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.drawer-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #f8fafc;
}

.drawer-subtitle {
    margin: 6px 0 0;
    color: rgba(226, 232, 240, 0.72);
    font-size: 0.85rem;
}

.drawer-close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(30, 41, 59, 0.5);
    color: rgba(226, 232, 240, 0.95);
    cursor: pointer;
}

.drawer-body {
    padding: 16px;
    overflow: auto;
}

.drawer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    color: rgba(226, 232, 240, 0.75);
    font-size: 0.85rem;
}

.drawer-empty {
    padding: 14px;
    border-radius: 14px;
    border: 1px dashed rgba(148, 163, 184, 0.25);
    color: rgba(226, 232, 240, 0.75);
}

.drawer-category {
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(2, 6, 23, 0.28);
    margin-bottom: 12px;
    overflow: hidden;
}

.drawer-category-title {
    padding: 12px 14px;
    cursor: pointer;
    color: rgba(226, 232, 240, 0.92);
    font-weight: 900;
}

.drawer-list {
    padding: 10px 12px 12px;
    display: grid;
    gap: 10px;
}

.drawer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(30, 41, 59, 0.3);
}

.drawer-item-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.drawer-item-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.drawer-item-name {
    color: rgba(226, 232, 240, 0.95);
    font-weight: 900;
}

.drawer-item-type {
    font-size: 0.8rem;
    color: rgba(148, 163, 184, 0.9);
}

.drawer-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 900;
}

.drawer-badge-fixed {
    color: #0b1220;
    background: rgba(147, 197, 253, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.55);
}

.drawer-badge-added {
    color: #052e16;
    background: rgba(134, 239, 172, 0.95);
    border: 1px solid rgba(34, 197, 94, 0.55);
}

.drawer-add {
    height: 36px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(34, 211, 238, 0.3);
    background: rgba(34, 211, 238, 0.12);
    color: rgba(236, 254, 255, 0.95);
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.drawer-add:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
}

.drawer-add:not(:disabled):hover {
    transform: translateY(-1px);
}

/* Responsive: tablet */
@media (max-width: 1024px) {
    .filters-layout.has-dynamic {
        grid-template-columns: 1fr;
    }

    .filters-grid-fixed.grid-initial {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filters-layout.has-dynamic .filters-grid-fixed,
    .filters-grid-dynamic {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

/* Responsive: móvil */
@media (max-width: 767px) {
    .filters-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
    }

    .filters-header-actions {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    .filters-global-actions {
        width: 100%;
        justify-content: stretch;
        margin-right: 0;
    }

    .btn-clear-dynamic,
    .btn-open-drawer {
        width: 100%;
    }

    .filters-grid-fixed.grid-initial,
    .filters-layout.has-dynamic .filters-grid-fixed,
    .filters-grid-dynamic {
        grid-template-columns: 1fr;
    }
}

.icon-halo {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.6), transparent 55%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: haloPulse 2.5s infinite ease-in-out;
}

.callout-content {
    flex: 1;
    position: relative;
    z-index: 1;
}

.callout-title {
    margin: 0;
    font-weight: 700;
    font-size: 1rem;
    color: #e0f2fe;
}

.callout-subtext {
    margin: 4px 0 0;
    font-size: 0.9rem;
    color: rgba(226, 232, 240, 0.85);
}

.callout-metric {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    position: relative;
    z-index: 1;
}

.metric-label {
    font-size: 0.7rem;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.7);
}

.metric-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #bae6fd;
}

.metric-time {
    font-size: 0.75rem;
    color: rgba(226, 232, 240, 0.85);
}

@keyframes haloPulse {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.7;
    }

    50% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.9;
    }

    100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.7;
    }
}

.result-count-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(6, 182, 212, 0.15);
    color: #06b6d4;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(6, 182, 212, 0.3);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.filters-panel {
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(51, 65, 85, 0.8);
    border-radius: 16px;
    padding: 20px;
    box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.1), 0 10px 30px rgba(15, 118, 212, 0.25);
    backdrop-filter: blur(12px);
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-item label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #d1d5db;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.input-wrapper,
.select-wrapper {
    position: relative;
}

.filter-item input,
.filter-item select {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #2d3748;
    color: #e5e7eb;
    font-family: inherit;
    transition: all 0.2s ease;
}

.filter-item input::placeholder {
    color: #9ca3af;
    font-size: 0.85rem;
}

.filter-item input:focus,
.filter-item select:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
    background: #374151;
}

.filter-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
}

.filter-actions::before {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(148, 163, 184, 0.25);
    margin-right: 12px;
}

.btn-reset {
    background: rgba(15, 118, 212, 0.2);
    color: #bae6fd;
    border: 1px solid rgba(14, 165, 233, 0.5);
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.12);
    transition: all 0.3s ease;
}

.btn-reset:hover {
    background: rgba(14, 165, 233, 0.3);
    border-color: rgba(14, 165, 233, 0.9);
    color: #f8fafc;
}

.btn-advanced {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb, #38bdf8);
    color: #e0f2fe;
    border: 1px solid transparent;
    font-weight: 600;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-advanced:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(14, 165, 233, 0.35);
}

.btn-reset svg,
.btn-advanced svg {
    flex-shrink: 0;
}

/* Sección de Filtros Avanzados */
.advanced-filters-section {
    background: linear-gradient(135deg, #2d3748 0%, #1f2937 100%);
    border: 1.5px solid #4b5563;
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.advanced-filters-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 50%, #06b6d4 100%);
    animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.advanced-filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #4b5563;
}

.advanced-filters-section h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #06b6d4;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
}

.advanced-filters-stats {
    display: flex;
    align-items: center;
    gap: 12px;
}

.active-filters-count {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0f172a;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid rgba(245, 158, 11, 0.3);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.advanced-filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.filter-item.advanced {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-item.advanced label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #d1d5db;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.input-wrapper.advanced,
.select-wrapper {
    position: relative;
}

.filter-item.advanced input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #374151;
    color: #e5e7eb;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-item.advanced input::placeholder {
    color: #9ca3af;
    font-size: 0.85rem;
}

.filter-item.advanced input:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2), 0 4px 12px rgba(6, 182, 212, 0.1);
    background: #2d3748;
    transform: translateY(-1px);
}

.input-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    transition: color 0.2s ease;
}

.filter-item.advanced input:focus+.input-icon {
    color: #06b6d4;
}

.advanced-filter-actions {
    display: flex;
    justify-content: flex-start;
    padding-top: 16px;
    border-top: 1px solid #4b5563;
}

.btn-reset-advanced {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0f172a;
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.btn-reset-advanced:hover {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    border-color: #f59e0b;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

/* Sección de Cards */
.cards-section {
    position: relative;
    background: linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.9) 70%);
    border-radius: 20px;
    border: 1px solid rgba(14, 165, 233, 0.4);
    padding: 28px;
    box-shadow: 0 20px 45px rgba(15, 118, 212, 0.35);
    margin-bottom: 28px;
    overflow: hidden;
}

.cards-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.25), transparent 45%);
    pointer-events: none;
    opacity: 0.7;
}

.cards-section>* {
    position: relative;
    z-index: 1;
}

.cards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #374151;
}

.cards-section h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f3f4f6;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
}

.cards-section h3 svg {
    color: #06b6d4;
    flex-shrink: 0;
}

.cards-count {
    display: inline-flex;
    align-items: center;
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.loading {
    text-align: center;
    padding: 80px 20px;
    color: #64748b;
    background: linear-gradient(135deg, #2d3748 0%, #374151 100%);
    border-radius: 12px;
    border: 1px solid #4b5563;
    margin: 20px 0;
}

.loader-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 20px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #06b6d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: relative;
}

.loader-spinner::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 4px solid transparent;
    border-top: 4px solid rgba(6, 182, 212, 0.3);
    border-radius: 50%;
    animation: spin 0.8s linear infinite reverse;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: #06b6d4;
    animation: pulse-text 1.5s ease-in-out infinite;
}

@keyframes pulse-text {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 22px;
    margin-bottom: 20px;
}

@media (max-width: 1024px) {
    .cards-grid {
        grid-template-columns: repeat(2, minmax(220px, 1fr));
    }
}

@media (max-width: 767px) {
    .cards-grid {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

.maintenance-card {
    background:
        radial-gradient(900px 320px at 18% -20%, rgba(6, 182, 212, 0.16), transparent 55%),
        radial-gradient(900px 360px at 120% 0%, rgba(168, 85, 247, 0.12), transparent 60%),
        linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(17, 24, 39, 0.92) 100%);
    border: 1.5px solid rgba(75, 85, 99, 0.9);
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    transition:
        transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 240ms ease,
        background 240ms ease;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 340px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
    animation: card-enter 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    will-change: transform;
}

.maintenance-card:nth-child(1) {
    animation-delay: 0.1s;
}

.maintenance-card:nth-child(2) {
    animation-delay: 0.2s;
}

.maintenance-card:nth-child(3) {
    animation-delay: 0.3s;
}

.maintenance-card:nth-child(4) {
    animation-delay: 0.4s;
}

.maintenance-card:nth-child(5) {
    animation-delay: 0.5s;
}

.maintenance-card:nth-child(6) {
    animation-delay: 0.6s;
}

@keyframes card-enter {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    transition: all 0.3s ease;
}

.card-accent.accent-default {
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
}

.card-sparse {
    border-left: 4px solid rgba(249, 115, 22, 0.9);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.06), 0 0 24px rgba(249, 115, 22, 0.04) inset;
}

.sparse-badge {
    display: inline-block;
    margin-left: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    color: #7c2d12;
    background: linear-gradient(180deg, rgba(255, 237, 213, 0.95), rgba(255, 249, 238, 0.9));
    border: 1px solid rgba(249, 115, 22, 0.15);
}

.card-accent.accent-success {
    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.card-accent.accent-warning {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.card-accent.accent-critical {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.card-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.card-glow.glow-success {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.card-glow.glow-warning {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.card-glow.glow-critical {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.maintenance-card:hover {
    border-color: rgba(6, 182, 212, 0.9);
    box-shadow:
        0 18px 44px rgba(6, 182, 212, 0.18),
        0 20px 55px rgba(0, 0, 0, 0.46);
    transform: translateY(-6px) scale(1.018);
}

.maintenance-card:hover .card-accent {
    height: 6px;
}

.maintenance-card:hover .card-glow {
    opacity: 1;
}

.maintenance-card.active {
    border-color: rgba(6, 182, 212, 0.95);
    background:
        radial-gradient(900px 320px at 18% -20%, rgba(6, 182, 212, 0.18), transparent 55%),
        radial-gradient(900px 360px at 120% 0%, rgba(168, 85, 247, 0.14), transparent 60%),
        linear-gradient(135deg, rgba(55, 65, 81, 0.96) 0%, rgba(17, 24, 39, 0.94) 100%);
    box-shadow:
        0 20px 55px rgba(6, 182, 212, 0.2),
        0 22px 64px rgba(0, 0, 0, 0.5);
    transform: translateY(-4px) scale(1.01);
}

.card-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.02) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.maintenance-card:hover .card-hover-effect {
    opacity: 1;
}

.card-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 16px;
    position: relative;
    z-index: 2;
}

.card-header-top {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
}

.maintenance-card.expanded .card-header-top {
    padding-right: 48px;
}

.card-no-wrapper {
    display: flex;
    align-items: stretch;
    gap: 8px;
    flex: 0 1 auto;
}

.card-header-bottom {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
}

.card-title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.card-no {
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: rgba(6, 182, 212, 0.15);
    padding: 8px 12px;
    border-radius: 10px;
    border: 1.5px solid rgba(6, 182, 212, 0.25);
    justify-content: center;
    flex: 0 1 auto;
}

.card-pill-label {
    font-size: 0.75rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.98);
    text-transform: uppercase;
    letter-spacing: 0.9px;
    display: block;
    line-height: 1.2;
    white-space: normal;
    word-break: break-word;
}

.card-pill-value {
    font-size: 0.9rem;
    font-weight: 800;
    color: #e5faff;
    letter-spacing: 0.2px;
    line-height: 1.08;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
    word-break: break-word;
}

.card-no-icon {
    color: #06b6d4;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    flex: 0 0 auto;
}

.card-record {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex: 0 0 auto;
    max-width: 140px;
    min-width: 80px;
    z-index: 4;
}

.card-record-value {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-record-value {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .card-record {
        max-width: 110px;
    }
}

.card-record-label {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 700;
}

.card-record-value {
    font-weight: 800;
    font-size: 0.9rem;
    color: #e5faff;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    line-height: 1.2;
}

.card-record-value.value-na {
    color: #6b7280;
    font-style: italic;
    font-weight: 500;
    opacity: 0.7;
}

.card-equipo {
    font-size: 0.95rem;
    font-weight: 700;
    color: #f3f4f6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    white-space: normal;
    line-height: 1.12;
    opacity: 0.95;
    word-break: break-word;
    max-height: 3.6em;
    padding-right: 8px;
}

/* Expanded card: show full equipo text */
.maintenance-card.expanded .card-equipo {
    line-clamp: 10;
    -webkit-line-clamp: 10;
    max-height: none;
}

.maintenance-card.expanded {
    min-height: 480px;
    transform: translateY(-6px) scale(1.012);
    z-index: 60;
    box-shadow:
        0 28px 70px rgba(6, 182, 212, 0.16),
        0 26px 72px rgba(0, 0, 0, 0.56);
}

.maintenance-card.expanded .card-pill-value,
.maintenance-card.expanded .card-record-value {
    line-clamp: unset;
    -webkit-line-clamp: none;
    white-space: normal;
    overflow: visible;
}

.card-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(15, 23, 42, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(229, 231, 235, 0.98);
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 6;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42);
    transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.card-close:hover {
    background: rgba(6, 182, 212, 0.14);
    border-color: rgba(6, 182, 212, 0.45);
    transform: scale(1.07) rotate(2deg);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.52), 0 0 0 6px rgba(6, 182, 212, 0.08);
}

.card-close:active {
    transform: scale(0.98);
}

.card-close:focus-visible {
    outline: none;
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.52), 0 0 0 2px rgba(17, 24, 39, 0.9), 0 0 0 5px rgba(6, 182, 212, 0.7);
}

@media (prefers-reduced-motion: reduce) {

    .maintenance-card,
    .card-close,
    .card-accent,
    .card-glow,
    .card-hover-effect {
        transition: none !important;
        animation: none !important;
    }

    .maintenance-card:hover {
        transform: none;
    }
}

.card-status-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    flex: 0 0 auto;
}

.card-status-label {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 700;
    line-height: 1.1;
    opacity: 0.95;
}

.card-status {
    font-size: 0.78rem;
    font-weight: 800;
    padding: 7px 12px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.card-status.activo {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%);
    color: #86efac;
    border-color: rgba(34, 197, 94, 0.3);
}

.card-status.activo .status-dot {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.card-status.inactivo {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.3);
}

.card-status.inactivo .status-dot {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

/* Common multi-word statuses: class tokens come from toLowerCase() split by spaces */
.card-status.mantenimiento,
.card-status.mantenimientos,
.card-status.mantto {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.1) 100%);
    color: #fde68a;
    border-color: rgba(245, 158, 11, 0.35);
}

.card-status.mantenimiento .status-dot,
.card-status.mantenimientos .status-dot,
.card-status.mantto .status-dot {
    background: #f59e0b;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.65);
}

.card-status.operativo {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.16) 0%, rgba(34, 197, 94, 0.1) 100%);
    color: #bbf7d0;
    border-color: rgba(34, 197, 94, 0.34);
}

.card-status.operativo .status-dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.65);
}

.card-status.no,
.card-status.fuera,
.card-status.baja {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.1) 100%);
    color: #fecaca;
    border-color: rgba(239, 68, 68, 0.35);
}

.card-status.no .status-dot,
.card-status.fuera .status-dot,
.card-status.baja .status-dot {
    background: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.65);
}

.maintenance-card:hover .card-status {
    transform: translateY(-1px);
    box-shadow:
        0 14px 28px rgba(0, 0, 0, 0.34),
        0 0 0 5px rgba(6, 182, 212, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Category styles (driven by getStatusPillClass) */
.card-status.status-success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.12) 100%);
    border-color: rgba(34, 197, 94, 0.45);
    box-shadow:
        0 14px 34px rgba(34, 197, 94, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(245, 158, 11, 0.12) 100%);
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow:
        0 14px 34px rgba(245, 158, 11, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-critical {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.12) 100%);
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow:
        0 14px 34px rgba(239, 68, 68, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-status.status-default {
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.14) 0%, rgba(148, 163, 184, 0.08) 100%);
    border-color: rgba(148, 163, 184, 0.28);
}

.card-status.status-unknown {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.1) 100%);
    border-color: rgba(99, 102, 241, 0.38);
    color: #c7d2fe;
    box-shadow:
        0 14px 34px rgba(99, 102, 241, 0.12),
        0 10px 22px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Token-specific styling */
.card-status.sin-estado {
    border-color: rgba(99, 102, 241, 0.5);
}

.card-status.sin-estado .status-dot {
    background: #818cf8;
    box-shadow: 0 0 10px rgba(129, 140, 248, 0.7);
}

.card-status.propio {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.12) 100%);
    border-color: rgba(34, 197, 94, 0.5);
    color: #bbf7d0;
}

.card-status.propio .status-dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    flex: 1;
    position: relative;
    z-index: 2;
}

.card-info-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #3f475a;
    transition: all 0.2s ease;
}

.card-info-row:last-child {
    border-bottom: none;
}

.card-info-row:hover {
    background: rgba(6, 182, 212, 0.05);
    border-radius: 4px;
    padding-left: 8px;
    padding-right: 8px;
    margin: 0 -8px;
}

.card-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.card-label svg {
    color: #06b6d4;
    opacity: 0.8;
    flex-shrink: 0;
}

.card-value {
    font-size: 0.9rem;
    color: #e5e7eb;
    font-weight: 600;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.25;
}

.card-value.value-na {
    color: #6b7280;
    font-style: italic;
    font-weight: 500;
    opacity: 0.7;
}

.card-cnis {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
    color: #06b6d4;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    border: 1px solid rgba(6, 182, 212, 0.3);
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #4b5563;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    position: relative;
    z-index: 2;
}

.maintenance-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 8px;
    letter-spacing: 0.3px;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
}

.badge-icon {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
}

.maintenance-badge.preventivo {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.3);
}

.maintenance-badge.preventivo .badge-icon {
    background: #3b82f6;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

.maintenance-badge.correctivo {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.3);
}

.maintenance-badge.correctivo .badge-icon {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.functional-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(71, 85, 105, 0.1);
    border: 1px solid rgba(71, 85, 105, 0.2);
}

.indicator-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
    transition: all 0.2s ease;
}

.functional-indicator.si {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.3);
}

.functional-indicator.si .indicator-dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
    animation: pulse-green 2s infinite;
}

@keyframes pulse-green {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

.functional-indicator.no {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
}

.functional-indicator.no .indicator-dot {
    background: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
    animation: pulse-red 2s infinite;
}

@keyframes pulse-red {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 2px solid #374151;
}

.btn-pagination {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #e5e7eb;
}

.btn-pagination:hover:not(:disabled) {
    background: #06b6d4;
    border-color: #06b6d4;
    color: #0f172a;
}

.btn-pagination:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-pagination svg {
    flex-shrink: 0;
}

.page-info {
    font-size: 0.9rem;
    color: #d1d5db;
    font-weight: 600;
    min-width: 120px;
    text-align: center;
}

.page-numbers {
    display: flex;
    gap: 6px;
    align-items: center;
}

.page-btn {
    padding: 6px 10px;
    background: transparent;
    border: 1px solid transparent;
    color: #cbd5e1;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
}

.page-btn.active {
    background: #06b6d4;
    color: #072027;
    border-color: transparent;
}

.page-btn:disabled {
    opacity: 0.6;
    cursor: default;
}

.page-size-select {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cbd5e1;
}

.page-size-select select {
    background: #263141;
    color: #e5e7eb;
    border: 1px solid #374151;
    padding: 6px 8px;
    border-radius: 6px;
}

/* Sección de Detalles */
.details-section {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 2px solid #06b6d4;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
    margin-top: 28px;
}

.details-section h3 {
    margin: 0 0 24px 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #06b6d4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.detail-group {
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 10px;
    padding: 18px;
    transition: all 0.2s ease;
}

.detail-group:hover {
    border-color: #06b6d4;
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
}

.detail-group.full-width {
    grid-column: 1 / -1;
}

.detail-group h4 {
    margin: 0 0 14px 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #06b6d4;
    border-bottom: 2px solid #06b6d4;
    padding-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #3f475a;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 700;
    color: #9ca3af;
    flex: 0 0 45%;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.3px;
}

.detail-value {
    color: #e5e7eb;
    flex: 1;
    text-align: right;
    word-wrap: break-word;
    padding-left: 12px;
    font-weight: 600;
}

/* Botón de cerrar detalles eliminado (detalles removidos por petición del usuario) */

/* No results */
.no-results {
    background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
    border: 1.5px solid #4b5563;
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    color: #d1d5db;
}

.no-results svg {
    margin: 0 auto 16px;
    color: #6b7280;
}

.no-results p {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
}

/* Dropdown de Filtros */
/* Dropdown de Filtros - Rediseño */
.dropdown-filters-container {
    position: relative;
    display: inline-block;
}

/* Button styling */
.btn-filter-primary {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 16px;
    height: auto;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: 1px solid rgba(34, 211, 238, 0.4);
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.85), rgba(59, 130, 246, 0.85));
    color: #ffffff;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 600;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(34, 211, 238, 0.15);
}

.btn-filter-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(59, 130, 246, 0.95));
    box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);
    transform: translateY(-2px);
}

.btn-filter-primary:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(34, 211, 238, 0.15);
}

.btn-filter-label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-filter-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.btn-filter-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    line-height: 1.2;
}

.btn-filter-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.9;
    font-weight: 700;
}

.btn-filter-count {
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 1;
}

.btn-filter-chevron {
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-filter-chevron.rotate {
    transform: rotate(180deg);
}

/* Dropdown menu */
.dropdown-filters-menu {
    position: absolute;
    top: calc(100% + 8px);
    background: rgba(15, 23, 42, 0.97);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(34, 211, 238, 0.2);
    z-index: 1100;
    width: 380px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(12px);
}

.dropdown-filters-menu::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: rgba(15, 23, 42, 0.97);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-bottom-color: transparent;
    border-right-color: transparent;
    z-index: -1;
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.3);
}

.dropdown-filters-menu.menu-below::before {
    top: -8px;
    left: 16px;
    transform: rotate(45deg);
}

.dropdown-filters-menu.menu-above {
    top: auto;
    bottom: calc(100% + 8px);
}

.dropdown-filters-menu.menu-above::before {
    bottom: -8px;
    left: 16px;
    top: auto;
    transform: rotate(225deg);
}

.dropdown-filters-menu.menu-right-aligned {
    left: auto;
    right: 0;
}

.dropdown-filters-menu.menu-right-aligned.menu-below::before {
    left: auto;
    right: 16px;
}

.dropdown-filters-menu.menu-right-aligned.menu-above::before {
    left: auto;
    right: 16px;
}

/* Dropdown header */
.dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.2);
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.2);
}

.dropdown-title-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e2e8f0;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid rgba(34, 211, 238, 0.4);
    border-radius: 6px;
    color: #22d3ee;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
    background: rgba(34, 211, 238, 0.1);
    border-color: rgba(34, 211, 238, 0.6);
}

.action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.action-btn svg {
    width: 14px;
    height: 14px;
}

/* Search wrapper */
.dropdown-search-wrapper {
    position: relative;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.15);
    flex-shrink: 0;
}

.search-icon {
    position: absolute;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
    flex-shrink: 0;
}

.dropdown-filters-search {
    width: 100%;
    padding: 8px 12px 8px 36px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(34, 211, 238, 0.25);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.dropdown-filters-search:focus {
    background: rgba(15, 23, 42, 0.9);
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
}

.dropdown-filters-search::placeholder {
    color: #64748b;
}

/* Active filters section */
.dropdown-active-section {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.15);
    background: rgba(34, 211, 238, 0.05);
    flex-shrink: 0;
}

.active-section-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
}

.active-filters-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.active-filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(34, 211, 238, 0.15);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 6px;
    color: #22d3ee;
    font-size: 0.8rem;
    font-weight: 500;
}

.chip-label {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chip-remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: none;
    border: none;
    color: #22d3ee;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.chip-remove-btn:hover {
    opacity: 1;
}

.chip-remove-btn svg {
    width: 12px;
    height: 12px;
}

/* State messages */
.dropdown-state-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 24px;
    color: #94a3b8;
    font-size: 0.9rem;
    text-align: center;
    min-height: 120px;
}

.loading-state {
    color: #64748b;
}

.empty-state svg {
    width: 24px;
    height: 24px;
    color: #64748b;
}

/* Filters list */
.dropdown-filters-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.filter-category {
    padding: 4px 0;
}

.category-header {
    padding: 10px 16px 6px;
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: transparent;
    border-top: 1px solid rgba(34, 211, 238, 0.15);
    margin-top: 4px;
}

.filter-category:first-child .category-header {
    border-top: none;
    margin-top: 0;
}

.category-filters {
    display: flex;
    flex-direction: column;
    padding: 0;
    gap: 0;
}

/* Filter checkbox item */
.filter-checkbox-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    margin: 2px 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s ease;
    color: #e2e8f0;
    user-select: none;
    position: relative;
}

.filter-checkbox-item:hover:not(.is-disabled) {
    background: rgba(34, 211, 238, 0.1);
}

.filter-checkbox-item.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.filter-checkbox-item input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 1.5px solid rgba(34, 211, 238, 0.4);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: relative;
}

.filter-checkbox-item:hover:not(.is-disabled) input[type="checkbox"] {
    border-color: rgba(34, 211, 238, 0.6);
}

.filter-checkbox-item input[type="checkbox"]:checked {
    background: #22d3ee;
    border-color: #22d3ee;
}

.filter-checkbox-item input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #0f172a;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.filter-checkbox-item input[type="checkbox"]:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    border-color: rgba(34, 211, 238, 0.2);
}

.checkbox-custom {
    display: none;
}

.filter-item-label {
    flex: 1;
    font-size: 0.9rem;
    color: #e2e8f0;
    word-break: break-word;
}

.filter-type-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
}

.filter-type-badge.fixed {
    background: rgba(100, 116, 139, 0.3);
    color: #cbd5e1;
}

.filter-type-badge.active {
    background: rgba(34, 211, 238, 0.25);
    color: #22d3ee;
}

/* Footer */
.dropdown-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(34, 211, 238, 0.15);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.1);
}

.filter-counter {
    color: #94a3b8;
    font-size: 0.8rem;
    font-weight: 600;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
    opacity: 1;
}

/* Scrollbar styling */
.dropdown-filters-list::-webkit-scrollbar {
    width: 6px;
}

.dropdown-filters-list::-webkit-scrollbar-track {
    background: transparent;
}

.dropdown-filters-list::-webkit-scrollbar-thumb {
    background: rgba(34, 211, 238, 0.3);
    border-radius: 3px;
}

.dropdown-filters-list::-webkit-scrollbar-thumb:hover {
    background: rgba(34, 211, 238, 0.5);
}

.loader-spinner-small {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(34, 211, 238, 0.2);
    border-top-color: #22d3ee;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>