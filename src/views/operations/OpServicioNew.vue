<template>
    <div class="op-servicio-new" :class="{ 'is-submitting': loading }">
        <OperationWizard type="servicio" :title="wizardTitle" :folio="form.folio" :steps="wizardSteps"
            :can-proceed="canProceedToNext" :can-submit="isValid" :is-submitting="loading" :submit-label="submitLabel"
            :show-sidebar="!isMobileView" @back="onBack" @submit="onSubmit" @step-change="onStepChange" ref="wizardRef">
            <template #header-actions>
                <button v-if="isAdmin" class="admin-settings-btn" @click="openAdminSettings"
                    title="Configuración de administrador">
                    <component :is="Settings" :size="20" stroke-width="2" />
                </button>
            </template>

            <!-- Added Admin Panel -->
            <FormSchemaAdminPanel v-if="showSchemaPanel" :modelValue="formSchema" module-key="servicio"
                module-label="Servicio" :sections="schemaSections" @update:modelValue="handleSaveSchema"
                @close="showSchemaPanel = false" />

            <!-- ========== STEP 0: Solicitante ========== -->
            <template #step-0>
                <div class="wizard-step">
                    <WizardStepCard title="Datos del Solicitante" subtitle="Información de quien solicita el servicio"
                        icon-color="#22c55e">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </template>

                        <div class="fields-grid">
                            <ModernInput v-model="form.nombreSolicitante" label="Nombre del Solicitante"
                                placeholder="Nombre completo de quien solicita" required
                                :error-message="getFieldError('nombreSolicitante')">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </template>
                            </ModernInput>

                            <ModernInput v-model="form.servicio" label="Servicio" placeholder="Ej. Urgencias, UCI">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1" />
                                        <rect x="4" y="3" width="16" height="18" rx="2" />
                                    </svg>
                                </template>
                            </ModernInput>

                            <ModernInput v-model="form.especialidad" label="Especialidad"
                                placeholder="Ej. Medicina Interna">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </template>
                            </ModernInput>
                        </div>

                        <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="solicitante"
                            style="margin-top: 16px;" />
                    </WizardStepCard>

                    <WizardStepCard class="tall" title="Fecha y Horario" subtitle="Cuándo se realiza el servicio"
                        icon-color="#3b82f6">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </template>

                        <div class="fields-grid cols-4">
                            <div class="field-wrapper span-1">
                                <label class="field-label">Folio</label>
                                <FolioInput v-model="form.folio" prefix="O-" />
                            </div>

                            <ModernInput v-model="form.folioAsociado" label="Folio Asociado"
                                placeholder="Folio de referencia relacionado" class="span-full" />

                            <div class="field-wrapper span-1">
                                <label class="field-label">
                                    Fecha
                                    <span class="info-tooltip" title="La fecha se asigna automáticamente">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4" />
                                            <path d="M12 8h.01" />
                                        </svg>
                                    </span>
                                </label>
                                <div class="auto-field-display">
                                    <span class="auto-value">{{ form.fecha || '--/--/----' }}</span>
                                </div>
                            </div>

                            <div class="field-wrapper span-1">
                                <label class="field-label">Hora Inicio</label>
                                <TimePicker v-model="form.horaInicio" />
                            </div>

                            <div class="field-wrapper span-1">
                                <label class="field-label">
                                    Hora Término
                                    <span class="info-tooltip" title="Se actualiza al guardar">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4" />
                                            <path d="M12 8h.01" />
                                        </svg>
                                    </span>
                                </label>
                                <div class="auto-field-display live-time">
                                    <span class="live-indicator"></span>
                                    <span class="auto-value time-live">{{ displayEndTime }}</span>
                                </div>
                            </div>
                        </div>
                    </WizardStepCard>
                </div>
            </template>

            <!-- ========== STEP 1: Motivo ========== -->
            <template #step-1>
                <div class="wizard-step">
                    <WizardStepCard class="tall" title="Motivo del Servicio" subtitle="Selecciona el motivo principal"
                        icon-color="#f97316">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </template>

                        <div class="motivo-select-wrapper" ref="motivoSelectRef">
                            <button type="button" class="motivo-trigger" @click="toggleMotivoDropdown">
                                <span>{{ selectedMotivoLabel }}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            <Transition name="dropdown">
                                <div v-if="showMotivoDropdown" class="motivo-dropdown">
                                    <div class="dropdown-search">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input ref="motivoSearchRef" v-model="motivoSearchQuery" type="text"
                                            placeholder="Buscar motivo" />
                                    </div>

                                    <div class="dropdown-list">
                                        <button v-for="motivo in filteredMotivoOptions" :key="motivo.value"
                                            type="button" class="dropdown-item" @click="selectMotivo(motivo)">
                                            <strong>{{ motivo.label }}</strong>
                                            <span v-if="motivo.description">{{ motivo.description }}</span>
                                        </button>
                                        <div v-if="!filteredMotivoOptions.length" class="dropdown-empty">
                                            No se encontraron coincidencias
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </div>

                        <Transition name="slide-up">
                            <ModernInput v-if="form.motivoEntrada === 'otro'" v-model="form.otroMotivo"
                                label="Describe el motivo" placeholder="Especifica otro motivo" class="span-full"
                                style="margin-top: 16px" />
                        </Transition>

                        <ModernInput v-model="form.descripcionReporte" label="Descripción del Reporte"
                            placeholder="Describe el reporte recibido" multiline :rows="3" class="span-full" style="margin-top: 16px" />

                        <ModernInput v-model="form.accionesRealizadas"
                            label="Acciones realizadas para atender el reporte"
                            placeholder="Detalla las acciones realizadas" multiline :rows="3" class="span-full" style="margin-top: 16px" />

                        <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="motivo"
                            style="margin-top: 16px;" />
                    </WizardStepCard>
                </div>
            </template>

            <!-- ========== STEP 2: Equipos ========== -->
            <template #step-2>
                <div class="wizard-step">
                    <WizardStepCard title="Agregar Equipo" subtitle="Selecciona el tipo y completa la información"
                        icon-color="#8b5cf6">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        </template>

                        <!-- Hospital Selection (antes de los equipos) -->
                        <div class="hospital-selection">
                            <div class="selection-cards">
                                <button type="button" class="hospital-card"
                                    :class="{ 'is-selected': belongsToHospital === true }"
                                    @click="belongsToHospital = true">
                                    <div class="card-icon sí">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div class="card-content">
                                        <h4>Sí, pertenece al hospital</h4>
                                        <p class="card-subtitle">El equipo es propiedad del HRAEI</p>
                                    </div>
                                </button>

                                <button type="button" class="hospital-card"
                                    :class="{ 'is-selected': belongsToHospital === false }"
                                    @click="belongsToHospital = false">
                                    <div class="card-icon no">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </div>
                                    <div class="card-content">
                                        <h4>No, es externo</h4>
                                        <p class="card-subtitle">Es comodato, donación u otro (especificar en Clave
                                            HRAEI)</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Feedback después de seleccionar -->
                        <Transition name="slide-down">
                            <div v-if="belongsToHospital !== null" class="hospital-feedback">
                                <div v-if="belongsToHospital" class="feedback-box success">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <div class="feedback-text">
                                        <p><strong>Equipo del Hospital:</strong> Se asume propiedad del HRAEI.</p>
                                    </div>
                                </div>
                                <div v-else class="feedback-box info">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                    <div class="feedback-text">
                                        <p><strong>Equipo Externo:</strong> Recuerda indicar el tipo en "Clave HRAEI"
                                            (Comodato, Donación, etc.)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- Equipment Type Selector (aparece solo si ya respondió) -->
                        <div v-if="belongsToHospital !== null" class="equipment-type-grid"
                            style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <button v-for="tipo in tipoEntradaOptions" :key="tipo.value" type="button" class="type-card"
                                :class="{ 'is-selected': newItem.tipo === tipo.value }"
                                @click="selectEquipmentType(tipo.value)">
                                <div class="type-icon" :style="{ '--type-color': tipo.color }">
                                    <component :is="tipo.icon" />
                                </div>
                                <span class="type-label">{{ tipo.label }}</span>
                            </button>

                            <!-- Botón Item en Blanco siempre visible -->
                            <button type="button" class="type-card type-card-blank" @click="showBlankItemModal = true">
                                <div class="type-icon" style="--type-color: #64748b">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="12" y1="8" x2="12" y2="16" />
                                        <line x1="8" y1="12" x2="16" y2="12" />
                                    </svg>
                                </div>
                                <span class="type-label">Item en Blanco</span>
                            </button>
                        </div>

                        <!-- Modal para seleccionar tipo de item en blanco -->
                        <Transition name="modal-fade">
                            <div v-if="showBlankItemModal" class="blank-item-modal-overlay"
                                @click.self="showBlankItemModal = false">
                                <div class="blank-item-modal">
                                    <div class="modal-header">
                                        <h3>Selecciona el tipo de item en blanco</h3>
                                        <button type="button" class="modal-close" @click="showBlankItemModal = false">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="blank-type-grid">
                                            <button v-for="tipo in tipoEntradaOptions" :key="tipo.value" type="button"
                                                class="blank-type-btn" @click="agregarItemBlancoConTipo(tipo.value)">
                                                <div class="blank-type-icon" :style="{ '--type-color': tipo.color }">
                                                    <component :is="tipo.icon" />
                                                </div>
                                                <span>{{ tipo.label }}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- Botón de Item en Blanco - Siempre visible cuando hay tipo seleccionado -->
                        <Transition name="slide-up">
                            <div v-if="newItem.tipo" class="quick-add-blank">
                                <button type="button" class="btn-add-blank-quick" @click="agregarItemBlanco"
                                    title="Agregar item con todos los campos en N/A">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Agregar {{ getSelectedTypeLabel() }} en Blanco (N/A)
                                </button>
                                <span class="quick-add-hint">O completa los campos abajo para agregar con información
                                    específica</span>
                            </div>
                        </Transition>

                        <Transition name="slide-up">
                            <div v-if="newItem.tipo" class="equipment-form">
                                <div class="form-header">
                                    <h4>{{ getSelectedTypeLabel() }}</h4>
                                    <div class="quantity-control">
                                        <button type="button" @click="decNew" :disabled="newItem.cantidad <= 1">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="3">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                        <span class="quantity-value">{{ newItem.cantidad }}</span>
                                        <button type="button" @click="incNew">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="3">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div class="units-list">
                                    <TransitionGroup name="unit-list">
                                        <div v-for="(unidad, idx) in newItem.unidades" :key="idx" class="unit-card">
                                            <div class="unit-header">
                                                <span class="unit-badge">#{{ idx + 1 }}</span>
                                                <button type="button" class="unit-remove" @click="removeUnit(idx)"
                                                    v-if="newItem.unidades.length > 1">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" stroke-width="2">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div class="unit-fields">
                                                <div class="searchable-field">
                                                    <label class="mini-label">Nombre / Descripción</label>
                                                    <SearchableInput v-model="unidad.nombre"
                                                        :suggestions="currentSuggestions" field-name="nombre"
                                                        :placeholder="getNombrePlaceholder()"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'nombre')" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Marca</label>
                                                    <SearchableInput v-model="unidad.marca"
                                                        :suggestions="currentSuggestions" field-name="marca"
                                                        placeholder="Ej. Philips"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'marca')" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Modelo</label>
                                                    <SearchableInput v-model="unidad.modelo"
                                                        :suggestions="currentSuggestions" field-name="modelo"
                                                        placeholder="Ej. MX40"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'modelo')" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Lote</label>
                                                    <SearchableInput v-model="unidad.lote"
                                                        :suggestions="currentSuggestions" field-name="lote"
                                                        placeholder="Ej. LT-2026"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'lote')" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">No. Serie</label>
                                                    <SearchableInput v-model="unidad.serie"
                                                        :suggestions="currentSuggestions" field-name="serie"
                                                        placeholder="Ej. SN123456"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'serie')" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Ubicación</label>
                                                    <SearchableInput v-model="unidad.ubicacion"
                                                        :suggestions="currentSuggestions" field-name="ubicacion"
                                                        placeholder="Ej. UCIA"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'ubicacion')" />
                                                </div>

                                                <!-- Equipos Asociados (Solo para accesorios y refacciones) -->
                                                <div v-if="newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion'"
                                                    class="searchable-field">
                                                    <label class="mini-label">Equipo Asociado</label>
                                                    <SearchableInput v-model="unidad.equipoAsociado"
                                                        :suggestions="equipoMedicoList" tipo="equipo-medico"
                                                        field-name="nombre" placeholder="Buscar equipo asociado..."
                                                        @select="(s) => unidad.equipoAsociado = (s.nombre || s.label || '')" />
                                                </div>

                                                <!-- Número de Serie del Equipo Asociado (Solo si hay equipo asociado) -->
                                                <div v-if="(newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion') && unidad.equipoAsociado"
                                                    class="searchable-field">
                                                    <label class="mini-label">Número de Serie del Equipo
                                                        Asociado</label>
                                                    <input v-model="unidad.serieEquipoAsociado" type="text"
                                                        class="form-input" placeholder="Ej. SN-EQUIPO-001" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Clave HRAEI</label>
                                                    <SearchableInput v-model="unidad.claveHRAEI"
                                                        :suggestions="currentSuggestions" field-name="claveHRAEI"
                                                        placeholder="Ej. COMODATO"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'claveHRAEI')" />
                                                </div>

                                                <div class="quantity-field">
                                                    <label class="mini-label">Cantidad</label>
                                                    <div class="quantity-input-wrapper">
                                                        <button type="button" class="qty-btn"
                                                            @click="unidad.cantidad > 1 ? unidad.cantidad-- : null"
                                                            :disabled="unidad.cantidad <= 1">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                                stroke="currentColor" stroke-width="3">
                                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                            </svg>
                                                        </button>
                                                        <input type="number" v-model.number="unidad.cantidad" min="1"
                                                            class="qty-input" placeholder="1" />
                                                        <button type="button" class="qty-btn"
                                                            @click="unidad.cantidad++">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                                stroke="currentColor" stroke-width="3">
                                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TransitionGroup>
                                </div>

                                <div class="equipment-buttons-group">
                                    <button type="button" class="btn-add-equipment" @click="agregarItem"
                                        :disabled="!canAddItem">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Agregar {{ getSelectedTypeLabel() }}
                                    </button>
                                    <button type="button" class="btn-clear-equipment" @click="resetNewItem"
                                        v-if="newItem.tipo" title="Limpiar formulario y empezar de nuevo">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2.5">
                                            <polyline points="3 6 5 4 21 4 19 6"></polyline>
                                            <line x1="19" y1="6" x2="5" y2="6"></line>
                                            <path d="M6 9l.967 12.158A2 2 0 0 0 9.001 23h6.018a2 2 0 0 0 1.964-1.856L18 9M9 5V3h6v2M9 13v6M15 13v6"></path>
                                        </svg>
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </Transition>

                        <!-- Toggle: Agregar al Inventario -->
                        <div class="inventory-toggle-section" style="margin-top: 24px;">
                            <div class="toggle-row">
                                <div class="toggle-info">
                                    <span class="toggle-label">✓ Registrar en inventario</span>
                                    <span class="toggle-description">
                                        Activa esta opción para registrar los equipos en el sistema de inventario.
                                        Se creará un nuevo registro en el historial de equipos.
                                    </span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="form.agregarAlInventario">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </WizardStepCard>

                    <WizardStepCard v-if="form.equiposEntrada.length > 0"
                        :title="`Items Agregados (${form.equiposEntrada.length})`"
                        subtitle="Lista de equipos en la orden" icon-color="#10b981" collapsible>
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </template>
                        <template #actions>
                            <span class="items-count-badge">{{ form.equiposEntrada.length }}</span>
                        </template>

                        <div class="equipment-list">
                            <TransitionGroup name="equipment-item">
                                <div v-for="(item, index) in form.equiposEntrada" :key="index" class="equipment-item">
                                    <div class="item-type-badge" :class="`type-${item.tipo}`">
                                        {{ getTipoLabel(item.tipo) }}
                                    </div>

                                    <div class="item-info">
                                        <div class="item-header">
                                            <h5 class="item-name">{{ item.descripcion || item.unidades?.[0]?.nombre ||
                                                'Sin nombre' }}</h5>
                                            <div class="item-quantity-badge">{{ item.unidades?.length || 1 }}</div>
                                        </div>
                                        <p class="item-quantity-text">{{ item.unidades?.length || 1 }}
                                            unidad{{
                                                (item.unidades?.length || 1) !== 1 ? 'es' : '' }} de {{
                                                getTipoLabel(item.tipo).toLowerCase() }}</p>
                                        <div class="item-details">
                                            <span v-if="item.marca"><strong>Marca:</strong> {{ item.marca }}</span>
                                            <span v-if="item.modelo"><strong>Modelo:</strong> {{ item.modelo }}</span>
                                            <span v-if="item.serie"><strong>Serie:</strong> {{ item.serie }}</span>
                                            <span v-if="item.ubicacion"><strong>Ubicación:</strong> {{ item.ubicacion
                                            }}</span>
                                        </div>
                                    </div>

                                    <button type="button" class="item-remove" @click="eliminarItem(item)"
                                        title="Eliminar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path
                                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </TransitionGroup>
                        </div>
                    </WizardStepCard>

                    <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="equipos" />
                </div>
            </template>

            <!-- ========== STEP 3: Observaciones y Firmas ========== -->
            <template #step-3>
                <div class="wizard-step">
                    <WizardStepCard title="Observaciones" subtitle="Notas adicionales" icon-color="#06b6d4">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </template>

                        <div class="fields-grid">
                            <div class="observations-with-image span-full">
                                <ModernInput v-model="form.observaciones" label="Observaciones"
                                    placeholder="Escribe cualquier observación relevante..." multiline :rows="4"
                                    class="span-full" />

                                <div class="observ-img-actions"
                                    style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                                    <label class="btn secondary"
                                        style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px;">
                                        Subir imagen
                                        <input type="file" accept="image/*" @change="onObservacionesImgChange"
                                            style="display:none;" />
                                    </label>

                                    <div v-if="form.observacionesImg" class="observ-img-preview"
                                        style="display:flex; align-items:center; gap:10px;">
                                        <img :src="form.observacionesImg.dataUrl" alt="preview"
                                            style="width:90px; height:56px; object-fit:cover; border-radius:8px; border:1px solid rgba(0,0,0,0.06)" />
                                        <button type="button" class="btn secondary" @click="removeObservacionesImg"
                                            style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                                    </div>
                                </div>
                            </div>

                            <ModernInput v-model="form.nombreIngeniero" label="Ingeniero Residente (Apoyo)"
                                placeholder="Nombre del ingeniero residente de apoyo" />
                        </div>

                        <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="observaciones"
                            style="margin-top: 16px;" />
                    </WizardStepCard>

                    <WizardStepCard title="Firmas" subtitle="Personas que firmarán" icon-color="#ec4899">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                <path d="M2 2l7.586 7.586" />
                            </svg>
                        </template>

                        <div class="signatures-grid">
                            <div v-for="(sig, idx) in form.signatures" :key="sig.key" class="signature-card"
                                :class="{ 'is-fixed': sig.fixed, 'has-name': sig.name && sig.name.trim() }">
                                <div class="sig-header">
                                    <span class="sig-role">{{ sig.role }}</span>
                                    <span v-if="sig.fixed" class="sig-badge fixed">FIJADO</span>
                                    <span v-else-if="sig.name && sig.name.trim()" class="sig-badge complete">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                    <span v-else class="sig-badge pending">PENDIENTE</span>
                                </div>

                                <div v-if="sig.fixed" class="sig-body">
                                    <div class="sig-name-display">{{ sig.name }}</div>
                                    <ModernInput v-if="isAdmin" v-model="sig.name" placeholder="Editar nombre fijo"
                                        size="small" class="sig-name-input" />
                                </div>

                                <div v-else class="sig-body">
                                    <div class="sig-question">
                                        <span>¿Conoces el nombre?</span>
                                        <div class="sig-toggle">
                                            <button type="button" :class="{ active: sig.nameKnown }"
                                                @click="sig.nameKnown = true">Sí</button>
                                            <button type="button" :class="{ active: !sig.nameKnown }"
                                                @click="sig.nameKnown = false">No</button>
                                        </div>
                                    </div>

                                    <Transition name="slide-fade">
                                        <div v-if="sig.nameKnown" class="sig-name-input-wrap">
                                            <select v-if="sig.key === 'ingeniero'" v-model="sig.name"
                                                class="engineer-select">
                                                <option value="">Selecciona un ingeniero...</option>
                                                <option v-for="name in ingenieroFirmanteOptions" :key="name"
                                                    :value="name">{{ name }}</option>
                                            </select>
                                            <ModernInput v-else v-model="sig.name" placeholder="Nombre completo"
                                                size="small" class="sig-name-input" />
                                        </div>
                                    </Transition>
                                </div>
                            </div>
                        </div>

                        <div v-if="isAdmin" class="engineer-admin-panel">
                            <h5>Administración rápida de firmantes</h5>
                            <ModernInput v-model="newEngineerName" label="Agregar ingeniero biomédico"
                                placeholder="Nombre completo" />
                            <button type="button" class="btn-add-engineer" @click="addIngenieroFirmante">
                                Agregar a lista
                            </button>
                        </div>

                        <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="firmas"
                            style="margin-top: 16px;" />
                    </WizardStepCard>
                </div>
            </template>

            <!-- ========== SIDEBAR SUMMARY ========== -->
            <template #summary>
                <LiveSummary :items="summaryItems" :equipment-count="form.equiposEntrada.length">
                    <template #actions>
                        <button type="button" class="btn-preview" @click="onPreviewPDF" :disabled="loadingPreview">
                            <svg v-if="!loadingPreview" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span v-else class="btn-spinner"></span>
                            {{ loadingPreview ? 'Generando...' : 'Vista previa PDF' }}
                        </button>
                    </template>
                </LiveSummary>
            </template>
        </OperationWizard>

        <!-- Equipment Warning Modal -->
        <EquipmentWarningModal
            v-model="showWarningModal"
            :warnings="equipmentWarnings"
            title="Advertencia de Equipo"
            subtitle="El equipo que intentas añadir tiene las siguientes alertas:"
            @confirm="confirmAddWithWarnings"
            @cancel="cancelAddWithWarnings"
        />

        <!-- PDF Preview Modal -->
        <Teleport to="html">
            <Transition name="modal-fade">
                <Teleport to="body">
                  <div v-if="showPdfPreview" class="pdf-preview-overlay" @click.self="closePdfPreview">
                    <div class="pdf-preview-modal">
                        <div class="pdf-preview-header">
                            <h3>Vista Previa del PDF</h3>
                            <div class="pdf-preview-actions">
                                <a :href="pdfPreviewUrl" target="_blank" class="btn-open-external"
                                    title="Abrir en nueva pestaña">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                                <button type="button" class="btn-close-preview" @click="closePdfPreview">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="pdf-preview-body">
                            <BlobPdfViewer v-if="pdfPreviewBlob" :blob="pdfPreviewBlob" />
                            <div v-else class="pdf-loading" style="color:rgba(230,235,245,0.9); padding:12px">Generando
                                PDF...
                            </div>
                        </div>
                    </div>
                  </div>
                </Teleport>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Components
import OperationWizard from '@/components/operations/OperationWizard.vue'
import WizardStepCard from '@/components/operations/WizardStepCard.vue'
import ModernInput from '@/components/operations/ModernInput.vue'
import ModernSelect from '@/components/operations/ModernSelect.vue'
import LiveSummary from '@/components/operations/LiveSummary.vue'
import FolioInput from '@/components/FolioInput.vue'
import TimePicker from '@/components/TimePicker.vue'
import SearchableInput from '@/components/SearchableInput.vue'
import FormSchemaAdminPanel from '@/components/FormSchemaAdminPanel.vue'
import DynamicFieldsSection from '@/components/DynamicFieldsSection.vue'
import BlobPdfViewer from '@/components/BlobPdfViewer.vue'
import EquipmentWarningModal from '@/components/EquipmentWarningModal.vue'
import { Settings } from 'lucide-vue-next'
import { fetchFormSchema, saveFormSchema } from '@/services/formSchemaService.js'
import { getDefaultSchema } from '@/data/defaultFormSchemas.js'

// Icons
import {
    ComputerDesktopIcon,
    DeviceTabletIcon,
    CpuChipIcon,
    BeakerIcon,
    WrenchIcon
} from '@heroicons/vue/24/outline'

// Utils
import notifier from '@/utils/notifier'
import { authedFetch } from '@/utils/api.js'
// Usando opciones de Entrada como base para servicio, o deberíamos usar uno específico
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'
import notificationStore from '@/stores/notificationStore'

// Composables
import { useInventorySuggestions } from '@/composables/useInventorySuggestions.js'
import { getEquipmentStatus } from '@/composables/useEquipmentWarnings.js'
import { useCloseConfirmation } from '@/composables/useCloseConfirmation.js'

// Props
const props = defineProps({
    modo: { type: String, default: 'crear' },
    ordenId: { type: [String, Number], default: null },
    enModal: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false }
})

const emit = defineEmits({
    close: () => true,
    actualizado: () => true,
    created: () => true,
    cancel: () => true
})
const router = useRouter()

// --- ADMIN / SCHEMA ---
const isAdmin = ref(false)
const schemaModuleKey = 'servicio'
// Define sections for admin panel reference
const schemaSections = [
    { id: 'solicitante', title: 'Datos del Solicitante' },
    { id: 'motivo', title: 'Motivo y Descripción' },
    { id: 'equipos', title: 'Equipos / Items' },
    { id: 'observaciones', title: 'Observaciones' },
    { id: 'firmas', title: 'Firmas' }
]
const showSchemaPanel = ref(false)
const schemaLoading = ref(false)
const formSchema = ref(getDefaultSchema(schemaModuleKey))

async function loadFormSchema() {
    schemaLoading.value = true
    try {
        const remote = await fetchFormSchema(schemaModuleKey)
        if (remote) {
            const def = getDefaultSchema(schemaModuleKey)
            formSchema.value = { ...def, ...remote, sections: { ...def.sections, ...(remote.sections || {}) } }
        }
    } catch (e) { console.warn(e) }
    finally { schemaLoading.value = false }
}

async function handleSaveSchema(nextSchema) {
    await saveFormSchema(schemaModuleKey, nextSchema)
    formSchema.value = nextSchema
    showSchemaPanel.value = false
    notifier.success('Configuración guardada')
}

function openAdminSettings() {
    showSchemaPanel.value = true
    if (!schemaLoading.value) loadFormSchema()
}
// ----------------------

// Inventory suggestions
const {
    equipoMedicoList,
    insumosRefaccionesList,
    loading: loadingInventory,
    fetchAllInventorySuggestions,
    fetchEquipoMedicoSuggestions,
    fetchInsumosRefaccionesSuggestions,
    fillUnitFromSuggestion
} = useInventorySuggestions()

// Refs
const wizardRef = ref(null)
const currentStep = ref(0)
const loading = ref(false)

// Equipment Warnings
const showWarningModal = ref(false)
const pendingEquipment = ref(null)
const equipmentWarnings = ref([])
const isMobileView = ref(false)
const errors = ref({})
const belongsToHospital = ref(null) // Para la pregunta: ¿Pertenece al Hospital?

// PDF Preview modal
const showPdfPreview = ref(false)
const pdfPreviewUrl = ref('')
const pdfPreviewBlob = ref(null)
const loadingPreview = ref(false)

// Motivo select state
const motivoSelectRef = ref(null)
const motivoSearchRef = ref(null)
const showMotivoDropdown = ref(false)
const motivoSearchQuery = ref('')

// Modal para item en blanco
const showBlankItemModal = ref(false)
const DEFAULT_INGENIEROS_FIRMANTES = [
    'Ing. Ana Karen Soto Avilés',
    'Ing. Nayeth Palma Espinoza',
    'Lic. Carlos Alberto Rosales Millán',
    'Ing. Francisco Javier Cotera Ortega'
]
const newEngineerName = ref('')

const ingenieroFirmanteOptions = computed(() => {
    const configured = formSchema.value?.optionSets?.ingenierosFirmantes
    if (Array.isArray(configured) && configured.length) {
        return configured.map(v => String(v || '').trim()).filter(Boolean)
    }
    return DEFAULT_INGENIEROS_FIRMANTES
})

async function addIngenieroFirmante() {
    const name = String(newEngineerName.value || '').trim()
    if (!name) return
    const current = Array.isArray(formSchema.value?.optionSets?.ingenierosFirmantes)
        ? formSchema.value.optionSets.ingenierosFirmantes.map(v => String(v || '').trim()).filter(Boolean)
        : [...DEFAULT_INGENIEROS_FIRMANTES]
    if (!current.includes(name)) {
        current.push(name)
    }
    const nextSchema = {
        ...formSchema.value,
        optionSets: {
            ...(formSchema.value?.optionSets || {}),
            ingenierosFirmantes: current
        }
    }
    await handleSaveSchema(nextSchema)
    newEngineerName.value = ''
    notifier.success('Ingeniero agregado a la lista')
}

// Default signatures
const DEFAULT_SIGNATURES = [
    { key: 'subdireccion', role: 'SUBDIRECCIÓN DE INGENIERÍA BIOMÉDICA', nameKnown: true, name: 'ARQ. KARLA ALEJANDRA TORRES SÁNCHEZ', fixed: true },
    { key: 'ingeniero', role: 'INGENIERO BIOMÉDICO', nameKnown: false, name: '', fixed: false },
    { key: 'recibe', role: 'QUIEN RECIBE', nameKnown: false, name: '', fixed: false }
]

// Form state
const form = reactive({
    nombreSolicitante: '',
    servicio: '',
    especialidad: '',
    folio: '',
    fecha: '',
    fechaISO: '',
    horaInicio: '',
    horaTermino: '',
    folioAsociado: '',
    motivoEntrada: '', // Backend expects 'motivoEntrada' mostly
    otroMotivo: '',
    descripcion: '',
    descripcionReporte: '',
    accionesRealizadas: '',
    observaciones: '',
    observacionesImg: null,
    nombreIngeniero: '',
    equiposEntrada: [], // Backend expects equiposEntrada
    agregarAlInventario: false,
    signatures: JSON.parse(JSON.stringify(DEFAULT_SIGNATURES)),
    extraFields: {}
})

// New item state
const newItem = reactive({
    tipo: '',
    cantidad: 1,
    unidades: []
})

// Equipment types with icons and colors - Mismos que en Entrada/Salida
const tipoEntradaOptions = [
    { value: 'equipo-medico', label: 'Equipo Médico', icon: ComputerDesktopIcon, color: '#22c55e' },
    { value: 'mobiliario', label: 'Mobiliario', icon: DeviceTabletIcon, color: '#3b82f6' },
    { value: 'accesorio', label: 'Accesorios', icon: CpuChipIcon, color: '#8b5cf6' },
    { value: 'consumible', label: 'Consumibles', icon: BeakerIcon, color: '#f59e0b' },
    { value: 'refaccion', label: 'Refacciones', icon: WrenchIcon, color: '#ef4444' }
]

// Wizard steps configuration
const wizardSteps = [
    { label: 'Solicitante', validate: () => validateStep0() },
    { label: 'Motivo', validate: () => validateStep1() },
    { label: 'Equipos', validate: () => validateStep2() },
    { label: 'Firmas', validate: () => validateStep3() }
]

// Computed
const wizardTitle = computed(() =>
    props.modo === 'editar' ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'
)

const submitLabel = computed(() =>
    props.modo === 'editar' ? 'Actualizar Orden' : 'Guardar Orden'
)

const motivoOptions = computed(() => {
    if (!Array.isArray(motivoEntradaOptions)) return []
    return motivoEntradaOptions
        .filter(m => m.value)
        .map(m => {
            if (typeof m === 'string') return { value: m, label: m }
            if (typeof m === 'object' && m !== null) return { value: m.value || m.label || String(m), label: m.label || m.value || String(m) }
            return { value: String(m), label: String(m) }
        })
})

const filteredMotivoOptions = computed(() => {
    if (!motivoSearchQuery.value.trim()) return motivoOptions.value
    const q = motivoSearchQuery.value.toLowerCase()
    return motivoOptions.value.filter(opt => opt.label.toLowerCase().includes(q))
})

const selectedMotivoLabel = computed(() => {
    if (!form.motivoEntrada) return ''
    const opt = motivoOptions.value.find(o => o.value === form.motivoEntrada)
    if (opt) return opt.label
    if (form.motivoEntrada === 'otro' && form.otroMotivo) return `OTRO: ${form.otroMotivo}`
    return form.motivoEntrada
})

const canProceedToNext = computed(() => {
    switch (currentStep.value) {
        case 0: return validateStep0()
        case 1: return validateStep1()
        case 2: return validateStep2()
        default: return true
    }
})

const canAddItem = computed(() => {
    if (!newItem.tipo) return false
    if (!newItem.unidades.length || !newItem.unidades.some(u => u.nombre?.trim())) return false
    return true
})

const isValid = computed(() => {
    return form.nombreSolicitante.trim() &&
        form.motivoEntrada &&
        form.equiposEntrada.length > 0
})

// Timer / Live time for hourTermino
let timerInterval = null
const liveTimeDisplay = ref('')
const displayEndTime = computed(() => liveTimeDisplay.value || form.horaTermino || '--:--:--')

const currentSuggestions = computed(() => {
    // Si es externo al hospital, no mostrar sugerencias de inventario
    if (belongsToHospital.value === false) {
        return []
    }
    if (!newItem.tipo) return []
    if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
        return equipoMedicoList.value
    }
    return insumosRefaccionesList.value
})

const summaryItems = computed(() => [
    { key: 'solicitante', label: 'Solicitante', value: form.nombreSolicitante, step: 1, status: form.nombreSolicitante?.trim() ? 'complete' : 'pending' },
    { key: 'servicio', label: 'Servicio', value: form.servicio, step: 1, status: form.servicio?.trim() ? 'complete' : 'pending' }, // Same step 1
    { key: 'folio', label: 'Folio', value: form.folio ? `O-${form.folio}` : '', step: 1, status: form.folio ? 'complete' : 'pending' },
    { key: 'motivo', label: 'Motivo', value: form.motivoEntrada, step: 2, status: form.motivoEntrada ? 'complete' : 'pending' },
    { key: 'equipos', label: 'Equipos', value: form.equiposEntrada.length ? `${form.equiposEntrada.length} items` : '', step: 3, status: form.equiposEntrada.length > 0 ? 'complete' : 'pending' }
])

// Validations
function validateStep0() { return form.nombreSolicitante?.trim()?.length > 0 }
function validateStep1() { return form.motivoEntrada?.length > 0 }
function validateStep2() { return form.equiposEntrada.length > 0 }
function validateStep3() { return true }

function getFieldError(field) { return errors.value[field] || '' }

// Equipment
function selectEquipmentType(tipo) {
    newItem.tipo = tipo
    newItem.cantidad = 1
    newItem.unidades = [createEmptyUnit()]
}

function getSelectedTypeLabel() {
    const type = tipoEntradaOptions.find(t => t.value === newItem.tipo)
    return type?.label || ''
}

function getTipoLabel(tipo) {
    const type = tipoEntradaOptions.find(t => t.value === tipo)
    return type?.label || tipo
}

function getNombrePlaceholder() {
    switch (newItem.tipo) {
        case 'equipo-medico': return 'Ej. Monitor de signos vitales'
        case 'mobiliario': return 'Ej. Cama de hospital'
        case 'accesorio': return 'Ej. Cable de ECG'
        case 'consumible': return 'Ej. Electrodos'
        case 'refaccion': return 'Ej. Batería'
        default: return 'Nombre del item'
    }
}

function createEmptyUnit() {
    return {
        nombre: '',
        marca: '',
        modelo: '',
        lote: '',
        serie: '',
        referencia: '',
        ubicacion: '',
        claveHRAEI: '',
        cantidad: 1
    }
}

function incNew() {
    newItem.cantidad++
    newItem.unidades.push(createEmptyUnit())
}

function decNew() {
    if (newItem.cantidad > 1) {
        newItem.cantidad--
        newItem.unidades.pop()
    }
}

function removeUnit(idx) {
    if (newItem.unidades.length > 1) {
        newItem.unidades.splice(idx, 1)
        newItem.cantidad = newItem.unidades.length
    }
}

function agregarItem() {
    if (!canAddItem.value) {
        notifier.error('Completa al menos el nombre del item')
        return
    }

    // Use the first unit as the main description
    const firstUnit = newItem.unidades[0]
    if (firstUnit?.nombre?.trim()) {
        // Preparar el equipo para añadir
        const equipmentToAdd = {
            tipo: newItem.tipo,
            cantidad: newItem.cantidad,
            descripcion: firstUnit.nombre,
            marca: firstUnit.marca,
            modelo: firstUnit.modelo,
            lote: firstUnit.lote,
            serie: firstUnit.serie,
            referencia: firstUnit.referencia,
            ubicacion: firstUnit.ubicacion,
            equipoAsociado: firstUnit.equipoAsociado || '',
            serieEquipoAsociado: firstUnit.serieEquipoAsociado || '',
            claveHRAEI: firstUnit.claveHRAEI,
            unidades: newItem.unidades.map(u => ({ ...u, cantidad: u.cantidad || 1 }))
        }

        // Verificar estado del equipo antes de añadir (solo para equipos médicos con clave HRAEI o serie válida)
        // Construir lista de términos de búsqueda (serie, claveHRAEI, nombre, marca, modelo)
        const searchTerms = []
        
        // 1. Número de serie primero (más específico)
        if (firstUnit.serie && firstUnit.serie.toUpperCase() !== 'N/A' && firstUnit.serie.trim() !== '') {
            searchTerms.push(firstUnit.serie.trim())
        }
        
        // 2. Clave HRAEI
        if (firstUnit.claveHRAEI && firstUnit.claveHRAEI.toUpperCase() !== 'N/A' && firstUnit.claveHRAEI.trim() !== '') {
            searchTerms.push(firstUnit.claveHRAEI.trim())
        }
        
        // 3. Nombre del equipo
        if (firstUnit.nombre && firstUnit.nombre.trim() !== '') {
            searchTerms.push(firstUnit.nombre.trim())
        }
        
        // 4. Marca
        if (firstUnit.marca && firstUnit.marca.toUpperCase() !== 'N/A' && firstUnit.marca.trim() !== '') {
            searchTerms.push(firstUnit.marca.trim())
        }
        
        // 5. Modelo
        if (firstUnit.modelo && firstUnit.modelo.toUpperCase() !== 'N/A' && firstUnit.modelo.trim() !== '') {
            searchTerms.push(firstUnit.modelo.trim())
        }
        
        console.log('[OpServicioNew] Términos de búsqueda:', searchTerms)
        const isValidInventory = searchTerms.length > 0
        
        if (newItem.tipo === 'equipo-medico' && isValidInventory) {
            
            // Enviar todos los términos de búsqueda al backend
            getEquipmentStatus(searchTerms).then(async (statusData) => {
                console.log('[OpServicioNew] Estado recibido:', statusData)
                console.log('[OpServicioNew] SearchTerms:', searchTerms, 'StatusData keys:', Object.keys(statusData))
                
                // Buscar el primer término que tenga un estado válido
                let equipmentStatus = null
                let matchedTerm = null
                
                for (const term of searchTerms) {
                    console.log(`[OpServicioNew] Checking term "${term}":`, statusData[term])
                    if (statusData[term] && statusData[term].status && statusData[term].status !== 'unknown') {
                        equipmentStatus = statusData[term]
                        matchedTerm = term
                        console.log(`[OpServicioNew] Found valid status for term "${term}"`)
                        break
                    }
                }
                
                if (equipmentStatus) {
                    console.log('[OpServicioNew] Equipo encontrado con término:', matchedTerm, 'Estado:', equipmentStatus)
                    const { analyzeEquipmentStatus } = await import('@/composables/useEquipmentWarnings.js')
                    const warnings = analyzeEquipmentStatus(equipmentStatus, matchedTerm)
                    console.log('[OpServicioNew] Warnings generadas:', warnings)
                    const highSeverityWarnings = warnings.filter(w => w.severity === 'high' && w.allowOverride)
                    
                    if (highSeverityWarnings.length > 0) {
                        console.log('[OpServicioNew] Showing warning modal with', highSeverityWarnings.length, 'high-severity warnings')
                        pendingEquipment.value = equipmentToAdd
                        equipmentWarnings.value = warnings
                        showWarningModal.value = true
                        return
                    } else {
                        console.log('[OpServicioNew] No high-severity warnings found, proceeding without modal')
                    }
                } else {
                    console.log('[OpServicioNew] No equipment status found for any search term')
                }
                
                // Si no hay advertencias, añadir normalmente
                form.equiposEntrada.push(equipmentToAdd)
                notifier.success('Item agregado')
                resetNewItem()
            }).catch(err => {
                console.warn('[OpServicioNew] Error verificando estado:', err)
                form.equiposEntrada.push(equipmentToAdd)
                notifier.success('Item agregado')
                resetNewItem()
            })
        } else {
            form.equiposEntrada.push(equipmentToAdd)
            notifier.success('Item agregado')
            resetNewItem()
        }
    }
}

// Confirmar añadir equipo con advertencias
function confirmAddWithWarnings() {
    if (pendingEquipment.value) {
        form.equiposEntrada.push(pendingEquipment.value)
        notifier.success('Item agregado 尽管 las advertencias')
        pendingEquipment.value = null
        equipmentWarnings.value = []
        resetNewItem()
    }
}

// Composable para confirmación de cierre
const { confirmAndClose } = useCloseConfirmation({
    title: '¿Deseas salir de la creación de orden de servicio?',
    message: 'Los cambios que hayas realizado se perderán. ¿Realmente deseas cerrar?',
    confirmText: 'Sí, salir',
    cancelText: 'Cancelar',
    icon: 'warning'
})

// Cancelar añadir equipo con advertencias
function cancelAddWithWarnings() {
    confirmAndClose(() => {
        pendingEquipment.value = null
        equipmentWarnings.value = []
        emit('cancel')
    })
}

function resetNewItem() {
    newItem.tipo = ''
    newItem.cantidad = 1
    newItem.unidades = []
}

// Agregar item en blanco con valores N/A
function agregarItemBlanco() {
    if (!newItem.tipo) {
        notifier.error('Selecciona primero un tipo de item')
        return
    }

    form.equiposEntrada.push({
        tipo: newItem.tipo,
        cantidad: 1,
        descripcion: 'N/A',
        marca: 'N/A',
        modelo: 'N/A',
        lote: 'N/A',
        serie: 'N/A',
        referencia: 'N/A',
        ubicacion: 'N/A',
        equipoAsociado: 'N/A',
        claveHRAEI: 'N/A',
        unidades: [{
            nombre: 'N/A',
            marca: 'N/A',
            modelo: 'N/A',
            lote: 'N/A',
            serie: 'N/A',
            referencia: 'N/A',
            ubicacion: 'N/A',
            claveHRAEI: 'N/A',
            cantidad: 1
        }]
    })

    notifier.success('Item en blanco agregado')
    resetNewItem()
}

// Agregar item en blanco con tipo específico (desde el modal)
function agregarItemBlancoConTipo(tipo) {
    form.equiposEntrada.push({
        tipo: tipo,
        cantidad: 1,
        descripcion: 'N/A',
        marca: 'N/A',
        modelo: 'N/A',
        lote: 'N/A',
        serie: 'N/A',
        referencia: 'N/A',
        ubicacion: 'N/A',
        equipoAsociado: 'N/A',
        claveHRAEI: 'N/A',
        unidades: [{
            nombre: 'N/A',
            marca: 'N/A',
            modelo: 'N/A',
            lote: 'N/A',
            serie: 'N/A',
            referencia: 'N/A',
            ubicacion: 'N/A',
            claveHRAEI: 'N/A',
            cantidad: 1
        }]
    })

    showBlankItemModal.value = false
    notifier.success('Item en blanco agregado')
}

function eliminarItem(item) {
    const idx = form.equiposEntrada.indexOf(item)
    if (idx > -1) form.equiposEntrada.splice(idx, 1)
}

// Images
const onObservacionesImgChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
        const dataUrl = String(reader.result || '')
        const match = dataUrl.match(/^data:image\/(\w+);base64,/) || []
        const ext = match[1] || (file.name.split('.').pop() || 'png')
        form.observacionesImg = { name: file.name, dataUrl, extension: ext }
    }
    reader.readAsDataURL(file)
}
const removeObservacionesImg = () => { form.observacionesImg = null }

// Timer
function startLiveTimer() {
    updateLiveTime()
    timerInterval = setInterval(updateLiveTime, 1000)
}
function updateLiveTime() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    liveTimeDisplay.value = `${hours}:${minutes}:${seconds}`
    form.horaTermino = `${hours}:${minutes}`
}
function stopLiveTimer() {
    if (timerInterval) clearInterval(timerInterval)
    updateLiveTime()
}

// Suggestions
function handleSuggestionSelect(suggestion, unidad, field) {
    // Solo pasar 2 parámetros a fillUnitFromSuggestion
    // La función llenará TODOS los campos del objeto unidad
    if (fillUnitFromSuggestion && typeof fillUnitFromSuggestion === 'function') {
        fillUnitFromSuggestion(unidad, suggestion)
    } else {
        // Fallback manual fill if composable function not available
        if (suggestion.nombre) unidad.nombre = suggestion.nombre
        if (suggestion.marca) unidad.marca = suggestion.marca
        if (suggestion.modelo) unidad.modelo = suggestion.modelo
        if (suggestion.serie) unidad.serie = suggestion.serie
        if (suggestion.ubicacion) unidad.ubicacion = suggestion.ubicacion
        if (suggestion.claveHRAEI) unidad.claveHRAEI = suggestion.claveHRAEI
        if (suggestion.lote) unidad.lote = suggestion.lote
        if (suggestion.referencia) unidad.referencia = suggestion.referencia
        if (suggestion.noInventario) unidad.noInventario = suggestion.noInventario
        if (suggestion.claveCNIS) unidad.claveCNIS = suggestion.claveCNIS
    }
}

// PDF Preview
function closePdfPreview() {
    showPdfPreview.value = false
    document.body.classList.remove('pdf-preview-active')
    if (pdfPreviewUrl.value) {
        try { URL.revokeObjectURL(pdfPreviewUrl.value) } catch (e) { }
        pdfPreviewUrl.value = ''
    }
    pdfPreviewBlob.value = null
}

async function onPreviewPDF() {
    if (!form.nombreSolicitante?.trim()) {
        notifier.error('Falta nombre del solicitante')
        return
    }
    loadingPreview.value = true
    try {
        // Prepare Extra Fields List for PDF
        const extraFieldsList = []

        if (formSchema.value && formSchema.value.sections) {
            // Use helper if available, or just iterate sections manually from schemaSections ref if schema is flat
            // But here formSchema.value is the stored object which has .sections as OBJECT or ARRAY?
            // Our merge logic: merged.sections = { ...base.sections, ...incoming } -> Object
            // But schemaSections (the const) is Array. formSchema.sections from DB is usually Object (key->def).
            // Wait, FormSchemaAdminPanel uses :sections="schemaSections" (Array) to RENDER the editor.
            // DynamicFieldsSection uses :schema="formSchema" (Object) and iterates `schema.sections[sectionId].fields`.

            // So here we need to iterate the defined SECTIONS (Array) and lookup fields in formSchema (Object).

            for (const sectionDef of schemaSections) {
                const sectionConfig = formSchema.value.sections?.[sectionDef.id]
                if (sectionConfig && sectionConfig.fields) {
                    const sectionFields = []
                    for (const field of sectionConfig.fields) {
                        const val = form.extraFields[field.key]
                        if (val && String(val).trim() !== '') {
                            sectionFields.push({ label: field.label, value: val })
                        }
                    }
                    if (sectionFields.length > 0) {
                        extraFieldsList.push({ sectionTitle: sectionDef.title, fields: sectionFields })
                    }
                }
            }
        }

        const payload = {
            ...form,
            preview: true,
            extraFieldsList,
            customTitle: formSchema.value?.settings?.customTitle || 'ORDEN DE SERVICIO',
            footerText: formSchema.value?.settings?.footerText || ''
        }

        // Using servicio-pdf for correct title generation
        const res = await authedFetch('/api/ops/servicio-pdf', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        if (res.ok) {
            const blob = await res.blob()
            if (pdfPreviewUrl.value) try { URL.revokeObjectURL(pdfPreviewUrl.value) } catch (e) { }
            pdfPreviewBlob.value = blob
            pdfPreviewUrl.value = URL.createObjectURL(blob)
            showPdfPreview.value = true
            document.body.classList.add('pdf-preview-active')
            } else {
             throw new Error('Error generando PDF')
            }
            } catch (err) {
            console.error(err)
            notifier.error('Error al generar preview')
    } finally {
        loadingPreview.value = false
    }
}

// Motivo interactions
function toggleMotivoDropdown() {
    showMotivoDropdown.value = !showMotivoDropdown.value
    if (showMotivoDropdown.value) nextTick(() => motivoSearchRef.value?.focus())
}
function selectMotivo(option) {
    form.motivoEntrada = option.value
    if (option.value !== 'otro') form.otroMotivo = ''
    showMotivoDropdown.value = false
    motivoSearchQuery.value = ''
}
function assignAsOtherMotivo() {
    form.motivoEntrada = 'otro'
    form.otroMotivo = motivoSearchQuery.value.trim()
    showMotivoDropdown.value = false
    motivoSearchQuery.value = ''
}
function handleClickOutsideMotivo(event) {
    if (motivoSelectRef.value && !motivoSelectRef.value.contains(event.target)) {
        showMotivoDropdown.value = false
    }
}

// Nav
function onBack() { router.back() }
function onStepChange(step) { currentStep.value = step }

// Submit
async function onSubmit() {
    if (!isValid.value) return notifier.error('Completa los campos requeridos')
    stopLiveTimer()
    loading.value = true
    try {
        const endpoint = props.modo === 'editar'
            ? `/api/ops/servicio/${props.ordenId}`
            : '/api/ops/servicio'
        const method = props.modo === 'editar' ? 'PUT' : 'POST'

        // Transformar payload para backend: convertir equiposEntrada a categories
        // Agrupar items por tipo para que se procesen en categorías correctas
        const categoriesMap = {}
        if (form.equiposEntrada && form.equiposEntrada.length > 0) {
            for (const item of form.equiposEntrada) {
                const tipo = (item.tipo || 'equipo').toLowerCase()
                let categoria = 'equipos' // default

                // Mapear tipo a categoría según inventario
                if (tipo.includes('accesorio') || tipo === 'accesorio') {
                    categoria = 'accesorios'
                } else if (tipo.includes('consumible') || tipo === 'consumible') {
                    categoria = 'consumibles'
                } else if (tipo.includes('refaccion') || tipo === 'refaccion') {
                    categoria = 'refacciones'
                } else if (tipo.includes('equipo-medico') || tipo === 'equipo-medico') {
                    categoria = 'equipos'
                }

                if (!categoriesMap[categoria]) {
                    categoriesMap[categoria] = []
                }

                const _serieVal = item.serie || item.N || '';
                const _modeloVal = item.modelo || item.MODELO || '';
                const _marcaVal = item.marca || item.MARCA || '';
                const safeSerie = (_serieVal && String(_serieVal).trim().toUpperCase() === 'N/A') ? '' : _serieVal;
                const safeModelo = (_modeloVal && String(_modeloVal).trim().toUpperCase() === 'N/A') ? '' : _modeloVal;
                const safeMarca = (_marcaVal && String(_marcaVal).trim().toUpperCase() === 'N/A') ? '' : _marcaVal;

                categoriesMap[categoria].push({
                    claveHRAEI: item.claveHRAEI || '',
                    itemId: `${item.claveHRAEI || 'SIN_CLAVE'}|${safeSerie}|${safeModelo}|${safeMarca}`,
                    cantidad: item.cantidad || 1,
                    descripcion: item.descripcion || '',
                    marca: item.marca || '',
                    modelo: item.modelo || '',
                    serie: item.serie || '',
                    lote: item.lote || '',
                    referencia: item.referencia || '',
                    ubicacion: item.ubicacion || '',
                    tipo: item.tipo || 'equipo',
                    equipoAsociado: item.equipoAsociado || '',
                    serieEquipoAsociado: item.serieEquipoAsociado || ''
                })
            }
        }

        // Convertir map a array de categorías
        const categories = Object.keys(categoriesMap).map(categoria => ({
            categoria,
            items: categoriesMap[categoria]
        }))

        const payload = {
            ...form,
            motivoServicio: form.motivoEntrada || '',  // Mapear a campo correcto
            agregarAlInventario: form.agregarAlInventario,
            categories: categories
        }

        const res = await authedFetch(endpoint, {
            method,
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            const responseData = await res.json()
            const folioGuardado = responseData.folio || form.folio

            notifier.success(responseData.msg || 'Orden de Servicio guardada exitosamente')

            // Enviar notificación al sistema
            if (props.modo !== 'editar') {
                notificationStore.notifyOrderCreated('servicio', folioGuardado, form.nombreSolicitante || form.nombre_solicitante || 'Usuario')
            }

            emit('actualizado')

            // Generar y descargar PDF
            try {
                const pdfRes = await authedFetch(`/api/ops/servicio/${encodeURIComponent(folioGuardado)}/pdfs/generated/download`)
                if (!pdfRes.ok) {
                    throw new Error('No se pudo descargar el PDF generado')
                }
                const blob = await pdfRes.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `servicio_${folioGuardado}.pdf`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                notifier.success('PDF descargado exitosamente')
            } catch (pdfErr) {
                console.warn('Error descargando PDF:', pdfErr)
                notifier.error('La orden se guardó, pero falló la descarga del PDF')
            }

            // Redirigir al order management
            setTimeout(() => {
                // Emitir evento de creación exitosa
                emit('created')
                // Ya no navegamos - el componente padre maneja el cierre del modal
            }, 500)
        } else {
            throw new Error('Error al guardar')
        }
    } catch (err) {
        console.error(err)
        notifier.error('Error al guardar la orden')
    } finally {
        loading.value = false
    }
}

function checkMobileView() { isMobileView.value = window.innerWidth < 1200 }
function initializeDateAndTime() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    form.fechaISO = `${year}-${month}-${day}`
    form.fecha = `${day}/${month}/${year}`
}

// Auto-generate folio for new orders
async function generateFolioAutomatically() {
    try {
        const res = await authedFetch('/api/ops/generate-folio/servicio')
        if (res.ok) {
            const data = await res.json()
            form.folio = data.folio
        } else {
            console.warn('Could not generate folio automatically')
        }
    } catch (err) {
        console.error('Error generating folio:', err)
    }
}

async function loadOrden() {
    try {
        const res = await authedFetch(`/api/ops/servicio/${props.ordenId}`)
        if (res.ok) {
            const data = await res.json()
            if (data && data.orden) {
                // Mapear campos de snake_case a camelCase para compatibilidad con el formulario
                const mappedOrden = mapSnakeToCamel(data.orden)
                Object.assign(form, mappedOrden)
            }
            if (data && Array.isArray(data.items)) {
                // Mapear cada item también de snake_case a camelCase
                form.equiposEntrada = data.items.map(item => mapSnakeToCamel(item))
            }
        }
    } catch (err) { console.error(err) }
}

// Función para mapear campos de snake_case a camelCase
function mapSnakeToCamel(obj) {
    if (!obj || typeof obj !== 'object') return obj
    const result = {}
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        result[camelKey] = obj[key]
    }
    return result
}

onMounted(async () => {
    // Admin Check
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        isAdmin.value = ['admin', 'sub_admin'].includes(user.role)
    } catch { isAdmin.value = false }
    loadFormSchema()

    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    document.addEventListener('click', handleClickOutsideMotivo)
    
    // Load ONLY insumos (accesorios, consumibles, refacciones) immediately
    // Equipos médicos se cargan SOLO cuando el usuario selecciona ese tipo
    try {
        // Cargar stock general que es base para insumos
        await fetchAllInventorySuggestions()
        // Cargar insumos/refacciones DESPUÉS de que allInventoryList esté lleno
        await fetchInsumosRefaccionesSuggestions()
    } catch (err) {
        console.error('[OpServicioNew] Error loading insumos suggestions:', err)
    }

    // if editing, load the order; also watch for changes
    if (props.modo === 'editar' && props.ordenId) {
        loadOrden()
    }
    watch(() => props.ordenId, (newId) => {
        if (props.modo === 'editar' && newId) loadOrden()
    })

    if (props.modo === 'editar' && props.ordenId) {
        loadOrden()
    } else {
        initializeDateAndTime()
        generateFolioAutomatically()
        startLiveTimer()
    }
})

// Lazy load equipos médicos cuando el usuario selecciona ese tipo
watch(() => newItem.tipo, async (nuevoTipo) => {
    if ((nuevoTipo === 'equipo-medico' || nuevoTipo === 'mobiliario') && !equipoMedicoList.value.length) {
        try {
            await fetchEquipoMedicoSuggestions()
        } catch (err) {
            console.error('[OpServicioNew] Error loading equipos médicos:', err)
        }
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobileView)
    document.removeEventListener('click', handleClickOutsideMotivo)
    if (timerInterval) clearInterval(timerInterval)
    if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
})
</script>

<style scoped>
/* Reuse styles from OpEntradaNew/OpSalidaNew essentially */
.op-servicio-new {
    background: #0a0f1a;
}

.wizard-step {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px 0;
}

.fields-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}

.fields-grid.cols-4 {
    grid-template-columns: repeat(4, 1fr);
}

.fields-grid .span-full {
    grid-column: 1 / -1;
}

.fields-grid .span-1 {
    grid-column: span 1;
}

.motivo-select-wrapper {
    position: relative;
    width: 100%;
}

.motivo-trigger {
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    color: #fff;
    font-size: 0.95rem;
    cursor: pointer;
}

.motivo-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    background: #1e293b;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    z-index: 50;
    overflow: hidden;
    max-height: 380px;
    display: flex;
    flex-direction: column;
}

.dropdown-search {
    padding: 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    outline: none;
}

.dropdown-options {
    padding: 6px;
    overflow-y: auto;
}

.dropdown-option {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border-radius: 8px;
    background: transparent;
    border: none;
    color: #e2e8f0;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
}

.dropdown-option:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
}

.dropdown-option.is-selected {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
}

.engineer-select {
    width: 100%;
    min-height: 38px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(15, 23, 42, 0.6);
    color: #e2e8f0;
    padding: 8px 10px;
}

.engineer-admin-panel {
    margin-top: 16px;
    padding: 14px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.4);
}

.engineer-admin-panel h5 {
    margin: 0 0 10px;
    font-size: 0.9rem;
    color: #cbd5e1;
}

.btn-add-engineer {
    margin-top: 10px;
    padding: 8px 12px;
    border: 1px solid rgba(59, 130, 246, 0.45);
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.14);
    color: #bfdbfe;
    cursor: pointer;
}

.equipment-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 10px;
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 16px;
    cursor: pointer;
}

.type-card:hover {
    background: rgba(30, 41, 59, 0.7);
}

.type-card.is-selected {
    background: rgba(30, 41, 59, 0.9);
    border-color: var(--type-color);
    box-shadow: 0 0 0 1px var(--type-color);
}

.type-icon {
    width: 48px;
    height: 48px;
    padding: 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
}

.type-card.is-selected .type-icon {
    background: var(--type-color);
    color: #fff;
}

.equipment-form {
    margin-top: 12px;
    background: rgba(30, 41, 59, 0.3);
    border-radius: 16px;
    padding: 20px;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.quantity-control {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(15, 23, 42, 0.6);
    padding: 4px;
    border-radius: 10px;
}

.quantity-control button {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.units-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.unit-card {
    background: rgba(15, 23, 42, 0.4);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(148, 163, 184, 0.1);
}

.unit-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

@media (max-width: 1024px) {
    .unit-fields {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 500px) {
    .unit-fields {
        grid-template-columns: 1fr;
    }
}

.quantity-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.quantity-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px;
    padding: 6px 10px;
}

.qty-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.4);
    color: #93c5fd;
}

.qty-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.qty-input {
    width: 60px;
    text-align: center;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    outline: none;
    -moz-appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.btn-add-equipment {
    width: 100%;
    padding: 14px;
    margin-top: 16px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.btn-add-equipment-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 16px;
}

.btn-add-equipment-group .btn-add-equipment {
    flex: 1;
    min-width: 180px;
    margin-top: 0;
}

/* Clear Equipment Button */
.btn-clear-equipment {
    padding: 14px 20px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    min-width: 140px;
    white-space: nowrap;
}

.btn-clear-equipment:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}

.equipment-buttons-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 16px;
}

.equipment-buttons-group .btn-add-equipment {
    flex: 1;
    min-width: 180px;
    margin-top: 0;
}

.btn-add-blank {
    flex: 1;
    min-width: 180px;
    padding: 14px;
    background: linear-gradient(135deg, #64748b, #475569);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
}

.btn-add-blank:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(71, 85, 105, 0.4);
    background: linear-gradient(135deg, #78716c, #57534e);
}

.quick-add-blank {
    margin-top: 20px;
    padding: 16px;
    background: rgba(100, 116, 139, 0.1);
    border: 1px dashed rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.btn-add-blank-quick {
    padding: 14px 24px;
    background: linear-gradient(135deg, #64748b, #475569);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
}

.btn-add-blank-quick:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(71, 85, 105, 0.4);
    background: linear-gradient(135deg, #78716c, #57534e);
}

.quick-add-hint {
    font-size: 0.8rem;
    color: rgba(148, 163, 184, 0.7);
    text-align: center;
}

.type-card-blank {
    border: 2px dashed rgba(100, 116, 139, 0.5) !important;
    background: rgba(100, 116, 139, 0.1) !important;
}

.type-card-blank:hover {
    border-color: rgba(100, 116, 139, 0.8) !important;
    background: rgba(100, 116, 139, 0.2) !important;
}

.blank-item-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    padding: 20px;
}

.blank-item-modal {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    max-width: 500px;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
}

.modal-close {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
}

.modal-close:hover {
    background: rgba(148, 163, 184, 0.1);
    color: #fff;
}

.modal-body {
    padding: 24px;
}

.blank-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
}

.blank-type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: #e2e8f0;
    font-size: 0.85rem;
    font-weight: 500;
}

.blank-type-btn:hover {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-2px);
}

.blank-type-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--type-color);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-active .blank-item-modal,
.modal-fade-leave-active .blank-item-modal {
    transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .blank-item-modal,
.modal-fade-leave-to .blank-item-modal {
    transform: scale(0.95);
}

.equipment-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.5) 100%);
    border-radius: 14px;
    border: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
}

.equipment-item:hover {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.item-type-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 6px 10px;
    border-radius: 8px;
    background: #334155;
    color: #cbd5e1;
    min-width: 60px;
    text-align: center;
}

.item-type-badge.type-equipo-medico {
    background: rgba(34, 197, 94, 0.25);
    color: #6ee7b7;
    border: 1px solid rgba(34, 197, 94, 0.4);
}

.item-type-badge.type-mobiliario {
    background: rgba(59, 130, 246, 0.25);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.4);
}

.item-type-badge.type-accesorio {
    background: rgba(139, 92, 246, 0.25);
    color: #d8b4fe;
    border: 1px solid rgba(139, 92, 246, 0.4);
}

.item-type-badge.type-consumible {
    background: rgba(245, 158, 11, 0.25);
    color: #fcd34d;
    border: 1px solid rgba(245, 158, 11, 0.4);
}

.item-type-badge.type-refaccion {
    background: rgba(239, 68, 68, 0.25);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.4);
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.item-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
}

.item-quantity-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.4);
    color: #93c5fd;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.9rem;
    font-weight: 700;
    border: 1px solid rgba(59, 130, 246, 0.5);
}

.item-quantity-text {
    margin: 0;
    font-size: 0.85rem;
    color: #a5f3fc;
    font-weight: 500;
    letter-spacing: 0.2px;
}

.item-details {
    font-size: 0.8rem;
    color: rgba(226, 232, 240, 0.75);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-details span {
    display: flex;
    gap: 6px;
}

.item-remove {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-remove:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fca5a5;
}

.admin-settings-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(30, 41, 59, 0.4);
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.admin-settings-btn:hover {
    background: rgba(30, 41, 59, 0.8);
    color: #e2e8f0;
    border-color: rgba(148, 163, 184, 0.4);
}

.auto-field-display {
    padding: 0 16px;
    height: 56px;
    background: rgba(15, 23, 42, 0.3);
    border: 1px dashed rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    color: #94a3b8;
    font-family: monospace;
}

.auto-field-display.live-time {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.05);
}

.time-live {
    color: #60a5fa;
    font-weight: 600;
}

.live-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    margin-right: 10px;
    animation: pulse 2s infinite;
}

.signatures-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
}

.signature-card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.signature-card.is-fixed {
    background: rgba(15, 23, 42, 0.4);
    border-style: dashed;
}

.sig-header {
    display: flex;
    justify-content: space-between;
}

.sig-role {
    font-size: 0.85rem;
    font-weight: 600;
    color: #e2e8f0;
}

.sig-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
}

.sig-badge.fixed {
    background: rgba(148, 163, 184, 0.2);
    color: #94a3b8;
}

.sig-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
}

.sig-toggle {
    display: flex;
    background: rgba(15, 23, 42, 0.6);
    padding: 2px;
    border-radius: 6px;
}

.sig-toggle button {
    padding: 2px 8px;
    background: transparent;
    border: none;
    color: #64748b;
    border-radius: 4px;
    cursor: pointer;
}

.sig-toggle button.active {
    background: #3b82f6;
    color: #fff;
}

.pdf-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    z-index: 9997;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.pdf-preview-modal {
    width: 100%;
    max-width: 1000px;
    height: 90vh;
    background: #1e293b;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.pdf-preview-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pdf-preview-header h3 {
    margin: 0;
    color: #fff;
}

.btn-close-preview {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    display: flex;
}

.pdf-preview-body {
    flex: 1;
    background: #0f172a;
    min-height: 0;
    overflow: auto;
    padding: 0;
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
}

.btn-preview {
    width: 100%;
    padding: 12px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px;
    color: #e2e8f0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

@keyframes pulse {
    0% {
        opacity: 0.5;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.5;
    }
}

/* Missing transitions from original - simplified for space */
.dropdown-enter-active,
.dropdown-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

/* Form Input */
.form-input {
    padding: 8px 12px;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    transition: all 0.2s;
}

.form-input:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.5);
    outline: none;
}

.form-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

/* Hospital Selection Cards - Same as OpEntradaNew */
.selection-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

@media (max-width: 600px) {
    .selection-cards {
        grid-template-columns: 1fr;
    }
}

.hospital-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
}

.hospital-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.hospital-card.is-selected {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 0 24px rgba(6, 182, 212, 0.2);
}

.hospital-card.is-selected.yes-card {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 24px rgba(34, 197, 94, 0.2);
}

.hospital-card.is-selected.no-card {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 24px rgba(59, 130, 246, 0.2);
}

.card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
}

.card-icon.sí {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
}

.card-icon.no {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
}

.card-content {
    flex: 1;
}

.card-content h4 {
    margin: 0 0 4px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
}

.card-subtitle {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
}

.hospital-feedback {
    margin-top: 12px;
}

.feedback-box {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid;
    font-size: 0.9rem;
}

.feedback-box.success {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    color: #4ade80;
}

.feedback-box.info {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    color: #60a5fa;
}

.feedback-text {
    flex: 1;
}

.feedback-text p {
    margin: 0;
}

/* Inventory Toggle Styles */
.inventory-toggle-section {
    padding: 8px 0;
}

.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
}

.toggle-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.toggle-label {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.toggle-description {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    max-width: 400px;
    line-height: 1.4;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 56px;
    height: 30px;
    flex-shrink: 0;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.15);
    transition: 0.3s;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
    background-color: #22c55e;
    border-color: #22c55e;
}

.toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(26px);
}

.toggle-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 14px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    color: #fbbf24;
    font-size: 0.85rem;
}

.toggle-notice svg {
    flex-shrink: 0;
}
</style>
