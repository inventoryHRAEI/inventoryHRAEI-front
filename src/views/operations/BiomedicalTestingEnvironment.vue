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
                            <svg class="icon-search animated-pulse" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
                        <button class="btn-filter-panel" type="button" @click="toggleFilterPanel" :aria-expanded="showFilterPanel">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 6h16M8 12h8M12 18h4" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>Filtros</span>
                            <span v-if="activeAdvancedFiltersCount" class="filter-badge">{{ activeAdvancedFiltersCount }}</span>
                        </button>
                        <div class="search-signal" :class="{ 'is-active': loading }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="8"></circle>
                                <path d="m18.5 18.5-4.5-4.5"></path>
                            </svg>
                            <div class="signal-text">
                                <strong>{{ loading ? 'Sincronizando' : 'Sincronizado' }}</strong>
                                <span>{{ searchStatusMessage }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="filters-callout">
                    <div class="callout-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2 15 8l6 .5-4.5 4 1.5 6L12 16l-6 3 1.5-6-4.5-4L9 8z"></path>
                        </svg>
                        <span class="icon-halo"></span>
                    </div>
                    <div class="callout-content">
                        <p class="callout-title">Búsqueda guiada para equipos biomédicos</p>
                        <p class="callout-subtext">Mantén la vista clara: cada filtro reacciona en tiempo real para darte contexto inmediato.</p>
                    </div>
                    <div class="callout-metric">
                        <span class="metric-label">Filtros avanzados activos</span>
                        <strong class="metric-value">{{ activeAdvancedFiltersCount }}</strong>
                        <span class="metric-time">se aplican al instante</span>
                    </div>
                </div>
                <div class="filters-panel">
                    <div class="filters-grid">
                        <div class="filter-item filter-primary">
                            <label for="filter-no">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                </svg>
                                No. Registro
                            </label>
                            <div class="input-wrapper">
                                <input id="filter-no" v-model="filters.no" type="text" placeholder="Ej. 001234"
                                    @input="applyFilters" />
                                <div class="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M10 2v4m0 0H6m4 0h4"/>
                                        <path d="M2 10h4m0 0V6m0 4v4"/>
                                        <path d="M14 2v4m0 0h4m-4 0h-4"/>
                                        <path d="M22 10h-4m0 0V6m0 4v4"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="filter-item">
                            <label for="filter-equipo">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                                </svg>
                                Equipo Médico
                            </label>
                            <div class="input-wrapper">
                                <input id="filter-equipo" v-model="filters.equipoMedico" type="text"
                                    placeholder="Monitor, Desfibrilador..." @input="applyFilters" />
                                <div class="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="filter-item">
                            <label for="filter-marca">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M6 2 3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                                    <line x1="3" x2="21" y1="6" y2="6"/>
                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                                Marca
                            </label>
                            <div class="input-wrapper">
                                <input id="filter-marca" v-model="filters.marca" type="text"
                                    placeholder="Philips, GE, Siemens..." @input="applyFilters" />
                                <div class="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="20" height="14" x="2" y="3" rx="2"/>
                                        <line x1="8" x2="16" y1="21" y2="21"/>
                                        <line x1="12" x2="12" y1="17" y2="21"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="filter-item">
                            <label for="filter-tipo">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                </svg>
                                Tipo de Mantenimiento
                            </label>
                            <div class="select-wrapper">
                                <select id="filter-tipo" v-model="filters.tipoMantenimiento" @change="applyFilters">
                                    <option value="">Todos</option>
                                    <option value="Preventivo">Preventivo</option>
                                    <option value="Correctivo">Correctivo</option>
                                </select>
                                <div class="select-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="filter-item">
                            <label for="filter-estatus">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4"/>
                                    <path d="M12 8h.01"/>
                                </svg>
                                Estatus
                            </label>
                            <div class="select-wrapper">
                                <select id="filter-estatus" v-model="filters.estatus" @change="applyFilters">
                                    <option value="">Todos</option>
                                    <option value="ACTIVO">Activo</option>
                                    <option value="INACTIVO">Inactivo</option>
                                </select>
                                <div class="select-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="filter-item">
                            <label for="filter-funcional">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                ¿Funcional?
                            </label>
                            <div class="select-wrapper">
                                <select id="filter-funcional" v-model="filters.funcional" @change="applyFilters">
                                    <option value="">Todos</option>
                                    <option value="SI">Sí</option>
                                    <option value="NO">No</option>
                                </select>
                                <div class="select-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="filter-item">
                            <label for="filter-unidad">
                                <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 21h18"/>
                                    <path d="M5 21V7l8-4v18"/>
                                    <path d="M19 21V11l-6-4"/>
                                    <path d="M9 9v.01"/>
                                    <path d="M9 12v.01"/>
                                    <path d="M9 15v.01"/>
                                    <path d="M9 18v.01"/>
                                </svg>
                                Unidad Médica
                            </label>
                            <div class="input-wrapper">
                                <input id="filter-unidad" v-model="filters.unidadMedica" type="text"
                                    placeholder="Sala, Área..." @input="applyFilters" />
                                <div class="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="btn-reset" @click="resetFilters">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                <path d="M8 16H3v5"/>
                            </svg>
                            Limpiar filtros
                        </button>
                        <button class="btn-advanced-toggle" @click="toggleAdvancedFilters">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/>
                            </svg>
                            {{ showAdvancedFilters ? 'Ocultar' : 'Mostrar' }} Avanzados
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filtros Avanzados -->
            <div v-if="showAdvancedFilters" class="advanced-filters-section">
                <div class="advanced-filters-header">
                    <h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/>
                        </svg>
                        Filtros Avanzados
                    </h3>
                    <div class="advanced-filters-stats">
                        <span class="active-filters-count" v-if="activeAdvancedFiltersCount > 0">
                            {{ activeAdvancedFiltersCount }} activo{{ activeAdvancedFiltersCount !== 1 ? 's' : '' }}
                        </span>
                    </div>
                </div>
                <div class="advanced-filters-grid">
                    <div class="filter-item advanced">
                        <label for="filter-no-inventario">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                            </svg>
                            No. de Inventario
                        </label>
                        <div class="input-wrapper advanced">
                            <input id="filter-no-inventario" v-model="advancedFilters.noInventario" type="text"
                                placeholder="Ej: INV-001" @input="applyAdvancedFilters" />
                            <div class="inp ut-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="filter-item advanced">
                        <label for="filter-clave-cnis">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 7h.01M7 7h.01M7 15h.01M15 15h.01M12 12V9"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            Clave CNIS
                        </label>
                        <div class="input-wrapper advanced">
                            <input id="filter-clave-cnis" v-model="advancedFilters.claveCnis" type="text"
                                placeholder="Ej: CNIS-123" @input="applyAdvancedFilters" />
                            <div class="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="filter-item advanced">
                        <label for="filter-modelo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Modelo
                        </label>
                        <div class="input-wrapper advanced">
                            <input id="filter-modelo" v-model="advancedFilters.modelo" type="text"
                                placeholder="Ej: X-Ray 5000" @input="applyAdvancedFilters" />
                            <div class="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="filter-item advanced">
                        <label for="filter-serie">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                <text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor">SN</text>
                            </svg>
                            No. de Serie
                        </label>
                        <div class="input-wrapper advanced">
                            <input id="filter-serie" v-model="advancedFilters.numeroSerie" type="text"
                                placeholder="Ej: SN123456" @input="applyAdvancedFilters" />
                            <div class="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="filter-item advanced">
                        <label for="filter-categoria">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"/>
                            </svg>
                            Categoría
                        </label>
                        <div class="input-wrapper advanced">
                            <input id="filter-categoria" v-model="advancedFilters.categoria" type="text"
                                placeholder="Ej: Radiología" @input="applyAdvancedFilters" />
                            <div class="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="filter-item advanced">
                        <label for="filter-ubicacion">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Ubicación Específica
                        </label>
                        <div class="input-wrapper advanced">
                            <input id="filter-ubicacion" v-model="advancedFilters.ubicacionEspecifica" type="text"
                                placeholder="Ej: Sala de Radiología" @input="applyAdvancedFilters" />
                            <div class="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div clasperos="advanced-filter-actions">
                    <button class="btn-reset-advanced" @click="resetAdvancedFilters">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                            <path d="M8 16H3v5"/>
                        </svg>
                        Limpiar Avanzados
                        </button>
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
                    <span class="cards-count">{{ displayedCards.length }} mostrados</span>
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
                    <div v-for="item in displayedCards" :key="item.No" class="maintenance-card"
                        @click="selectItem(item)" :class="{ active: selectedItem?.No === item.No }">
                        <div class="card-accent" :class="getStatusAccentClass(item)"></div>
                        <div class="card-glow" :class="getStatusGlowClass(item)"></div>
                        <div class="card-header">
                            <div class="card-title-group">
                                <div class="card-no-container">
                                    <span class="card-no">{{ item['No DE INVENTARIO'] || 'N/A' }}</span>
                                    <div class="card-no-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                                        </svg>
                                    </div>
                                </div>
                                <span class="card-equipo">{{ item['EQUIPO MEDICO'] || 'N/A' }}</span>
                            </div>
                            <div class="card-status-container">
                                <span class="card-status" :class="item['ESTATUS']?.toLowerCase()">
                                    <div class="status-dot" :class="item['ESTATUS']?.toLowerCase()"></div>
                                    {{ item['ESTATUS'] || 'Sin estado' }}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="card-info-row">
                                <span class="card-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M6 2 3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                                        <line x1="3" x2="21" y1="6" y2="6"/>
                                        <path d="M16 10a4 4 0 0 1-8 0"/>
                                    </svg>
                                    Marca:
                                </span>
                                <span class="card-value">{{ item['MARCA'] || 'N/A' }}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="card-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    Modelo:
                                </span>
                                <span class="card-value">{{ item['MODELO'] || 'N/A' }}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="card-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 7h.01M7 7h.01M7 15h.01M15 15h.01M12 12V9"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    CNIS:
                                </span>
                                <span class="card-value card-cnis">{{ item['CLAVE CNIS'] || 'N/A' }}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="maintenance-badge" :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()">
                                <div class="badge-icon" :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()"></div>
                                {{ item['TIPO DE MANTENIMIENTO'] || 'N/A' }}
                            </div>
                            <div class="functional-indicator" :class="item['FUNCIONAL SI NO']?.toLowerCase()">
                                <span class="indicator-dot"></span>
                                {{
                                    item['FUNCIONAL SI NO'] === 'SI'
                                        ? 'Funcional'
                                        : item['FUNCIONAL SI NO'] === 'NO'
                                            ? 'No Funcional'
                                            : 'N/A'
                                }}
                            </div>
                        </div>
                        <div class="card-hover-effect"></div>
                    </div>
                </div>
                <div v-if="filteredData.length > pageSize && !loading" class="pagination">
                    <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Anterior
                    </button>
                    <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
                        Siguiente
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Vista de Tabla Detallada (Al seleccionar item) -->
            <div v-if="selectedItem" class="details-section">
                <h3>Detalles del Mantenimiento</h3>
                <div class="details-grid">
                    <!-- Información General -->
                    <div class="detail-group">
                        <h4>Información General</h4>
                        <div class="detail-row">
                            <span class="detail-label">No. Registro:</span>
                            <span class="detail-value">{{ selectedItem.No }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">No. de Inventario:</span>
                            <span class="detail-value">{{ selectedItem['NO DE INVENTARIO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Unidad Médica:</span>
                            <span class="detail-value">{{ selectedItem['UNIDAD MEDICA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Ubicación Específica:</span>
                            <span class="detail-value">{{ selectedItem['UBICACION ESPECIFICA'] }}</span>
                        </div>
                    </div>

                    <!-- Información del Equipo -->
                    <div class="detail-group">
                        <h4>Información del Equipo</h4>
                        <div class="detail-row">
                            <span class="detail-label">Equipo Médico:</span>
                            <span class="detail-value">{{ selectedItem['EQUIPO MEDICO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Marca:</span>
                            <span class="detail-value">{{ selectedItem['MARCA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Modelo:</span>
                            <span class="detail-value">{{ selectedItem['MODELO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">No. de Serie:</span>
                            <span class="detail-value">{{ selectedItem['NUMERO DE SERIE'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Categoría:</span>
                            <span class="detail-value">{{ selectedItem['CATEGORIA'] }}</span>
                        </div>
                    </div>

                    <!-- Estado del Equipo -->
                    <div class="detail-group">
                        <h4>Estado del Equipo</h4>
                        <div class="detail-row">
                            <span class="detail-label">Estatus:</span>
                            <span class="detail-value">{{ selectedItem['ESTATUS'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Condiciones:</span>
                            <span class="detail-value">{{ selectedItem['CONDICIONES DEL EQUIPO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">¿Funcional?:</span>
                            <span class="detail-value">{{ selectedItem['FUNCIONAL SI NO'] }}</span>
                        </div>
                        <div class="detail-row" v-if="selectedItem['CAUSA DE NO FUNCIONAMIENTO']">
                            <span class="detail-label">Causa No Funcionamiento:</span>
                            <span class="detail-value">{{ selectedItem['CAUSA DE NO FUNCIONAMIENTO'] }}</span>
                        </div>
                    </div>

                    <!-- Mantenimiento -->
                    <div class="detail-group">
                        <h4>Información de Mantenimiento</h4>
                        <div class="detail-row">
                            <span class="detail-label">Tipo de Mantenimiento:</span>
                            <span class="detail-value">{{ selectedItem['TIPO DE MANTENIMIENTO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Último MP:</span>
                            <span class="detail-value">{{ selectedItem['ULTIMO MP DD MM AAAA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Cantidad MP al Año:</span>
                            <span class="detail-value">{{ selectedItem['CANTIDAD DE MP AL AÑO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Adquisición:</span>
                            <span class="detail-value">{{ selectedItem['FECHA DE ADQUISICION DD MM AAAA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Instalación:</span>
                            <span class="detail-value">{{ selectedItem['FECHA DE INSTALACIÓN'] }}</span>
                        </div>
                    </div>

                    <!-- Garantía -->
                    <div class="detail-group">
                        <h4>Información de Garantía</h4>
                        <div class="detail-row">
                            <span class="detail-label">¿Con Garantía?:</span>
                            <span class="detail-value">{{ selectedItem['GARANTIA SI NO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fin de Garantía:</span>
                            <span class="detail-value">{{ selectedItem['FIN DE GARANTIA DD MM AAAA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Garantía Cruce:</span>
                            <span class="detail-value">{{ selectedItem['GARANTIA CRUCE'] }}</span>
                        </div>
                    </div>

                    <!-- Refacciones y Consumibles -->
                    <div class="detail-group full-width">
                        <h4>Refacciones, Accesorios y Consumibles</h4>
                        <div class="detail-row">
                            <span class="detail-label">Accesorios:</span>
                            <span class="detail-value">{{ selectedItem['ACCESORIOS'] || 'N/A' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Consumibles:</span>
                            <span class="detail-value">{{ selectedItem['CONSUMIBLES'] || 'N/A' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Refacciones Levantamiento:</span>
                            <span class="detail-value">{{ selectedItem['REFACCIONES\nLEVANTAMIENTO'] || 'N/A' }}</span>
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="detail-group full-width">
                        <h4>Observaciones</h4>
                        <div class="detail-row">
                            <span class="detail-label">Observaciones:</span>
                            <span class="detail-value">{{ selectedItem['OBSERVACIONES'] || 'N/A' }}</span>
                        </div>
                        <div class="detail-row" v-if="selectedItem['OBSERVACIONES\nLEVANTAMIENTO']">
                            <span class="detail-label">Observaciones Levantamiento:</span>
                            <span class="detail-value">{{ selectedItem['OBSERVACIONES\nLEVANTAMIENTO'] }}</span>
                        </div>
                    </div>
                </div>
                <button class="btn-close-details" @click="selectedItem = null">Cerrar detalles</button>
            </div>

            <!-- Mensaje cuando no hay datos -->
            <div v-if="filteredData.length === 0 && !loading && hasFilters" class="no-results">
                <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
            </div>
        </div>
    </ActionPanel>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
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
const pageSize = 6
const showAdvancedFilters = ref(false)

// Filtros iniciales
const initialFilters = {
    no: '',
    equipoMedico: '',
    marca: '',
    tipoMantenimiento: '',
    estatus: '',
    funcional: '',
    unidadMedica: ''
}

const filters = ref({ ...initialFilters })

// Filtros avanzados iniciales
const initialAdvancedFilters = {
    noInventario: '',
    claveCnis: '',
    modelo: '',
    numeroSerie: '',
    categoria: '',
    ubicacionEspecifica: ''
}

const advancedFilters = ref({ ...initialAdvancedFilters })

// Computed
const displayedCards = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize
    return filteredData.value.slice(startIndex, startIndex + pageSize)
})

const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / pageSize)
})

const hasFilters = computed(() => {
    return Object.values(filters.value).some(v => v !== '')
})

const searchStatusMessage = computed(() => {
    return loading.value ? 'Actualizando resultados y sincronizando con inventario...' : 'Listo para explorar con precisión'
})

const activeAdvancedFiltersCount = computed(() => {
    return Object.values(advancedFilters.value).filter(v => v.trim() !== '').length
})

// Métodos
function goToDashboard() {
    navigateAndRefresh(router, { name: 'dashboard' })
}

async function applyFilters() {
    await applyAdvancedFilters()
}

function resetFilters() {
    filters.value = { ...initialFilters }
    applyFilters()
}

function toggleAdvancedFilters() {
    showAdvancedFilters.value = !showAdvancedFilters.value
}

async function applyAdvancedFilters() {
    try {
        loading.value = true
        const queryParams = new URLSearchParams()

        // Filtros básicos
        if (filters.value.no.trim()) queryParams.append('no', filters.value.no.trim())
        if (filters.value.equipoMedico.trim()) queryParams.append('equipoMedico', filters.value.equipoMedico.trim())
        if (filters.value.marca.trim()) queryParams.append('marca', filters.value.marca.trim())
        if (filters.value.tipoMantenimiento) queryParams.append('tipoMantenimiento', filters.value.tipoMantenimiento)
        if (filters.value.estatus) queryParams.append('estatus', filters.value.estatus)
        if (filters.value.funcional) queryParams.append('funcional', filters.value.funcional)
        if (filters.value.unidadMedica.trim()) queryParams.append('unidadMedica', filters.value.unidadMedica.trim())

        // Filtros avanzados
        if (advancedFilters.value.noInventario.trim()) queryParams.append('noInventario', advancedFilters.value.noInventario.trim())
        if (advancedFilters.value.claveCnis.trim()) queryParams.append('claveCnis', advancedFilters.value.claveCnis.trim())
        if (advancedFilters.value.modelo.trim()) queryParams.append('modelo', advancedFilters.value.modelo.trim())
        if (advancedFilters.value.numeroSerie.trim()) queryParams.append('numeroSerie', advancedFilters.value.numeroSerie.trim())
        if (advancedFilters.value.categoria.trim()) queryParams.append('categoria', advancedFilters.value.categoria.trim())
        if (advancedFilters.value.ubicacionEspecifica.trim()) queryParams.append('ubicacionEspecifica', advancedFilters.value.ubicacionEspecifica.trim())

        const url = `/api/ops/historial-mantenimientos${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        const response = await fetch(url)

        if (!response.ok) {
            const json = await response.json().catch(() => ({}))
            throw new Error(json.msg || json.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        const items = Array.isArray(data) ? data : (data.data || [])
        allData.value = items
        filteredData.value = items
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

function resetAdvancedFilters() {
    advancedFilters.value = { ...initialAdvancedFilters }
    applyAdvancedFilters()
}

function getStatusAccentClass(item) {
    const status = item['ESTATUS']?.toLowerCase()
    const funcional = item['FUNCIONAL SI NO']?.toLowerCase()

    if (funcional === 'no') return 'accent-critical'
    if (status === 'inactivo') return 'accent-warning'
    if (status === 'activo' && funcional === 'si') return 'accent-success'
    return 'accent-default'
}

function getStatusGlowClass(item) {
    const status = item['ESTATUS']?.toLowerCase()
    const funcional = item['FUNCIONAL SI NO']?.toLowerCase()

    if (funcional === 'no') return 'glow-critical'
    if (status === 'inactivo') return 'glow-warning'
    if (status === 'activo' && funcional === 'si') return 'glow-success'
    return 'glow-default'
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

// Ciclo de vida
onMounted(async () => {
    await applyFilters()
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
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
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
    border:1px solid rgba(14,165,233,0.4);
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
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
    50% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
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
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
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

.filter-item.advanced input:focus + .input-icon {
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

.cards-section > * {
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
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.maintenance-card {
    background: linear-gradient(135deg, #2d3748 0%, #374151 100%);
    border: 1.5px solid #4b5563;
    border-radius: 12px;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: card-enter 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
    backdrop-filter: blur(12px);
}

.maintenance-card:nth-child(1) { animation-delay: 0.1s; }
.maintenance-card:nth-child(2) { animation-delay: 0.2s; }
.maintenance-card:nth-child(3) { animation-delay: 0.3s; }
.maintenance-card:nth-child(4) { animation-delay: 0.4s; }
.maintenance-card:nth-child(5) { animation-delay: 0.5s; }
.maintenance-card:nth-child(6) { animation-delay: 0.6s; }

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
    border-color: #06b6d4;
    box-shadow: 0 12px 32px rgba(6, 182, 212, 0.25);
    transform: translateY(-6px) scale(1.02);
}

.maintenance-card:hover .card-accent {
    height: 6px;
}

.maintenance-card:hover .card-glow {
    opacity: 1;
}

.maintenance-card.active {
    border-color: #06b6d4;
    background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
    box-shadow: 0 12px 32px rgba(6, 182, 212, 0.3);
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
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 16px 12px;
    gap: 12px;
    position: relative;
    z-index: 2;
}

.card-title-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.card-no-container {
    display: flex;
    align-items: center;
    gap: 6px;
}

.card-no {
    font-size: 0.8rem;
    font-weight: 700;
    color: #06b6d4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(6, 182, 212, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid rgba(6, 182, 212, 0.2);
}

.card-no-icon {
    color: #06b6d4;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
}

.card-equipo {
    font-size: 1rem;
    font-weight: 700;
    color: #f3f4f6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
}

.card-status-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.card-status {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 6px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.status-dot {
    width: 6px;
    height: 6px;
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

.card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    flex: 1;
    position: relative;
    z-index: 2;
}

.card-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
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
    white-space: nowrap;
    flex: 1;
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
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
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
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
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

.btn-close-details {
    padding: 10px 16px;
    background: #4b5563;
    color: #e5e7eb;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-close-details:hover {
    background: #6b7280;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

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
</style>
