<template>
    <div class="op-entrada-new" :class="{ 'is-submitting': loading }">
        <OperationWizard type="entrada" :title="wizardTitle" :folio="form.folio" :steps="wizardSteps"
            :can-proceed="canProceedToNext" :can-submit="isValid" :is-submitting="loading" :submit-label="submitLabel"
            :show-sidebar="!isMobileView" @back="onBack" @submit="onSubmit" @step-change="onStepChange" ref="wizardRef">
            <!-- ========== STEP 0: Solicitante ========== -->
            <template #step-0>
                <div class="wizard-step">
                    <WizardStepCard title="Datos del Solicitante"
                        subtitle="Información básica de quien solicita la entrada" icon-color="#22c55e">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </template>

                        <div class="fields-grid">
                            <ModernInput v-model="form.nombreSolicitante" label="Nombre del Solicitante"
                                placeholder="Nombre completo de quien solicita"
                                :error-message="getFieldError('nombreSolicitante')">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </template>
                            </ModernInput>

                            <ModernInput v-model="form.servicio" label="Servicio"
                                placeholder="Ej. Cardiología, Urgencias">
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
                    </WizardStepCard>

                    <WizardStepCard class="tall" title="Fecha y Horario" subtitle="Cuándo se realiza la entrada"
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
                                <FolioInput v-model="form.folio" prefix="E-" />
                            </div>

                            <div class="field-wrapper span-1">
                                <label class="field-label">Folio Asociado</label>
                                <ModernInput v-model="form.folioAsociado" placeholder="Folio relacionado (opcional)" />
                            </div>

                            <div class="field-wrapper" style="grid-column: span 2 !important; display: flex; flex-direction: column; gap: 8px;">
                                <label class="field-label" style="color: #94a3b8; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Fecha de Operación</label>
                                <div class="premium-date-container" :class="fechaAutomatica ? 'mode-auto' : 'mode-manual'">
                                    <!-- Sección de Control -->
                                    <div class="control-section">
                                        <span class="pill-label">AUTO</span>
                                        <label class="simple-switch" @click.stop>
                                            <input type="checkbox" v-model="fechaAutomatica" @change="onFechaAutoChange" />
                                            <span class="simple-slider"></span>
                                        </label>
                                    </div>

                                    <!-- Sección de Valor -->
                                    <div class="value-section" @click="!fechaAutomatica && $refs.dateInputRef.showPicker()">
                                        <div class="pill-content">
                                            <div class="pill-icon">
                                                <svg v-if="fechaAutomatica" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                </svg>
                                                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                                </svg>
                                            </div>
                                            <div class="pill-text">
                                                <span class="date-text">{{ fechaAutomatica ? (form.fecha || '--/--/----') : formatDisplayDate(form.fechaISO) }}</span>
                                            </div>
                                        </div>



                                        <input 
                                            v-if="!fechaAutomatica"
                                            ref="dateInputRef"
                                            type="date" 
                                            class="hidden-picker"
                                            :value="form.fechaISO"
                                            @input="onFechaManualInput"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="field-wrapper span-1">
                                <label class="field-label">Hora Inicio</label>
                                <TimePicker v-model="form.horaInicio" />
                            </div>

                            <div class="field-wrapper span-1">
                                <label class="field-label">
                                    Hora Término
                                    <button type="button" class="info-popover-btn"
                                        @mouseenter="showHoraTerminoInfo = true"
                                        @mouseleave="showHoraTerminoInfo = false" aria-haspopup="true"
                                        aria-expanded="showHoraTerminoInfo">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                    </button>
                                    <Transition name="popover-fade">
                                        <div v-if="showHoraTerminoInfo" class="info-popover"
                                            @mouseenter="showHoraTerminoInfo = true"
                                            @mouseleave="showHoraTerminoInfo = false">
                                            Se actualiza en tiempo real hasta que se guarde la orden.
                                        </div>
                                    </Transition>
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
                    <WizardStepCard class="tall" title="Motivo de Entrada"
                        subtitle="Razón por la cual ingresa el equipo" icon-color="#f59e0b">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </template>

                        <div class="fields-grid">
                            <div class="field-wrapper span-full">
                                <label class="field-label">Motivo de Entrada <span class="required">*</span></label>

                                <!-- Custom searchable select with "assign as other" feature -->
                                <div class="motivo-select-wrapper" ref="motivoSelectRef">
                                    <button type="button" class="motivo-trigger"
                                        :class="{ 'is-open': showMotivoDropdown }" @click="toggleMotivoDropdown">
                                        <span class="trigger-value" :class="{ placeholder: !form.motivoEntrada }">
                                            {{ selectedMotivoLabel || 'Selecciona el motivo...' }}
                                        </span>
                                        <svg class="trigger-chevron" :class="{ rotated: showMotivoDropdown }" width="18"
                                            height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>

                                    <Transition name="dropdown">
                                        <div v-if="showMotivoDropdown" class="motivo-dropdown">
                                            <!-- Search input -->
                                            <div class="dropdown-search">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="M21 21l-4.35-4.35" />
                                                </svg>
                                                <input ref="motivoSearchRef" v-model="motivoSearchQuery" type="text"
                                                    class="search-input" placeholder="Buscar motivo..." @click.stop />
                                            </div>

                                            <!-- Options list -->
                                            <div class="dropdown-options">
                                                <button v-for="option in filteredMotivoOptions" :key="option.value"
                                                    type="button" class="dropdown-option"
                                                    :class="{ 'is-selected': form.motivoEntrada === option.value }"
                                                    @click.stop="selectMotivo(option)">
                                                    <span class="option-label">{{ option.label }}</span>
                                                    <svg v-if="form.motivoEntrada === option.value" class="option-check"
                                                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" stroke-width="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </button>

                                                <!-- No results + assign as other -->
                                                <div v-if="filteredMotivoOptions.length === 0 && motivoSearchQuery.trim()"
                                                    class="dropdown-no-results">
                                                    <p class="no-results-text">No se encontró "{{ motivoSearchQuery }}"
                                                    </p>
                                                    <button type="button" class="btn-assign-other"
                                                        @click.stop="assignAsOtherMotivo">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" stroke-width="2">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                        Asignar como otro motivo: "{{ motivoSearchQuery }}"
                                                    </button>
                                                </div>

                                                <!-- Show "assign as other" also when there are results but search doesn't match exactly -->
                                                <div v-else-if="motivoSearchQuery.trim() && !hasExactMotivoMatch"
                                                    class="dropdown-assign-other-hint">
                                                    <button type="button" class="btn-assign-other-small"
                                                        @click.stop="assignAsOtherMotivo">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" stroke-width="2">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                        ¿No está en la lista? Asignar como otro: "{{ motivoSearchQuery
                                                        }}"
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Transition>
                                </div>
                            </div>

                            <Transition name="slide-fade">
                                <ModernInput v-if="form.motivoEntrada === 'otro'" v-model="form.otroMotivo"
                                    label="Especifica el motivo" placeholder="Describe el motivo de entrada"
                                    class="span-full" />
                            </Transition>

                            <ModernInput v-model="form.descripcion" label="Descripción General"
                                placeholder="Descripción detallada del motivo de entrada..." multiline :rows="4"
                                class="span-full" />
                        </div>
                    </WizardStepCard>
                </div>
            </template>

            <!-- ========== STEP 2: Equipos ========== -->
            <template #step-2>
                <div class="wizard-step">
                    <!-- Hospital Selection moved here so it's always above refinements -->
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
                                    <p><strong>Equipo Externo:</strong> Recuerda indicar procedencia/tipo en Referencia u Observaciones
                                        (Comodato, Donación, etc.)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Transition>

                    <!-- Add Equipment Card -->
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

                            <!-- Item en blanco solo para bienes internos -->
                            <button v-if="belongsToHospital === true" type="button" class="type-card type-card-blank" @click="showBlankItemModal = true">
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

                            <!-- Botón especial para Acc/Cons/Ref para Equipo Médico -->
                            <button type="button" class="type-card type-card-acr"
                                :class="{ 'is-selected': showAcrModal }"
                                @click="abrirModalAcr">
                                <div class="type-icon" style="--type-color: #06b6d4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                                    </svg>
                                </div>
                                <span class="type-label">Acc/Cons/Ref<br><small>para Equipo Médico</small></span>
                            </button>
                        </div>

                        <!-- Modal selector de categoría para Acc/Cons/Ref -->
                        <Transition name="modal-fade">
                            <div v-if="showAcrModal" class="acr-modal-overlay" @click.self="cerrarModalAcr">
                                <div class="acr-modal acr-modal-compact">
                                    <div class="acr-modal-header">
                                        <div class="acr-modal-title">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            <span>¿Qué vas a agregar al equipo médico?</span>
                                        </div>
                                        <button type="button" class="acr-modal-close" @click="cerrarModalAcr">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        </button>
                                    </div>
                                    <div class="acr-modal-body">
                                        <p class="acr-hint">Selecciona la categoría. Luego podrás buscar el bien en el inventario o ingresarlo manualmente.</p>
                                        <div class="acr-category-grid">
                                            <button type="button" class="acr-cat-btn" @click="seleccionarCategoriaAcr('accesorio')">
                                                <div class="acr-cat-icon" style="--cat-color:#8b5cf6">
                                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                                                </div>
                                                <span>Accesorio</span>
                                            </button>
                                            <button type="button" class="acr-cat-btn" @click="seleccionarCategoriaAcr('consumible')">
                                                <div class="acr-cat-icon" style="--cat-color:#f59e0b">
                                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3l1 9h4l1-9"/><path d="M6 21h12l-2-9H8z"/></svg>
                                                </div>
                                                <span>Consumible</span>
                                            </button>
                                            <button type="button" class="acr-cat-btn" @click="seleccionarCategoriaAcr('refaccion')">
                                                <div class="acr-cat-icon" style="--cat-color:#ef4444">
                                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                                                </div>
                                                <span>Refacción</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>



                         <!-- Refinamiento inteligente de inventario -->
                         <!-- Only show when item DOES belong to hospital (belongsToHospital === true) -->
                         <div v-if="belongsToHospital === true && newItem.tipo && !isEditingItem && !newItem.isBlank && newItem.tipo !== 'mobiliario' && newItem.tipo !== 'refaccion'" class="refinement-container">
                            <div class="refinement-header">
                                <div class="refinement-title-wrap">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="refine    ment-icon-svg">
                                        <path d="M6 8l6-6 6 6M6 16l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M6 8h12l-6 12L6 8z" fill="rgba(59,130,246,0.2)" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    <div>
                                        <h4>Busqueda de bienes</h4>
                                        <p>Combina campos y valores como en un filtro profesional de inventario.</p>
                                    </div>
                                </div>
                                <div class="refinement-status">
                                    <span class="badge badge-success">Filtrados: {{ refinedInventory.length }}</span>
                                </div>
                            </div>

                            <div class="refinement-row">
                                <label>
                                    Campo
                                    <select v-model="refinementField">
                                        <option v-for="(label, key) in refinementFields" :key="key" :value="key">{{ label }}</option>
                                    </select>
                                </label>
                                <label class="search-box-wrapper">
                                    Valor
                                    <input type="text" v-model="refinementValue" :placeholder="`Busca ${refinementFields[refinementField]}...`" @input="onStepValueInput" @keyup.enter="addRefinement" @focus="onRefinementFocus" @blur="onRefinementBlur" autocomplete="off" />
                                    <ul v-if="refinementDropdownOpen && refinementSuggestions.length > 0" class="live-dropdown">
                                        <li v-for="item in refinementSuggestions" :key="item.value" @mousedown.prevent="applyRefinementSuggestion(item.value)" tabindex="0">
                                            <span>{{ item.value }}</span>
                                            <small>({{ item.count }})</small>
                                        </li>
                                    </ul>
                                </label>
                                <div class="refinement-actions">
                                    <button type="button" class="btn-primary btn-with-icon" @click="addRefinement"
                                        :disabled="!canAddRefinement">
                                        <span class="btn-icon-left">+</span> Agregar filtro
                                    </button>
                                    <button type="button" class="btn-clear-all-searchable-filters"
                                        @click="clearRefinements"
                                        :disabled="refinements.length === 0 && !refinementValue"
                                        title="Limpiar todos los filtros">
                                        Limpiar
                                    </button>
                                    <button type="button" class="btn-clear-all-searchable-filters btn-with-icon" 
                                        @click="forceRefreshInventory" title="Forzar recarga de sugerencias de inventario">
                                        <span class="btn-icon-left">🔄</span> Refrescar
                                    </button>
                                </div>
                            </div>

                            <div class="token-area" v-if="refinements.length > 0">
                                <span v-for="(r, i) in refinements" :key="`${r.key}-${r.value}-${i}`" class="token-chip">
                                    {{ refinementFields[r.key] }}: {{ r.value }}
                                    <button type="button" @click="removeRefinement(i)">✕</button>
                                </span>
                            </div>

                            <div class="summary-bar">
                                <span>Items filtrados: {{ refinedInventory.length }}</span>
                                <span v-if="refinedInventory.length === 1" class="exact-badge">Coincidencia única: {{ refinedInventory[0].nombre }}</span>
                            </div>

                            <div class="results-list">
                                <div v-for="item in refinedInventory.slice(0, 10)" :key="item.id" class="result-item">
                                    <div class="result-top">
                                        <strong>{{ item.nombre || item.label || 'Sin nombre' }}</strong>
                                        <small>{{ item.lote || '-' }} / {{ item.referencia || '-' }} / {{ item.serie || '-' }}</small>
                                    </div>
                                    <div class="result-data">
                                        <div class="field-row"><span class="field-label">Marca:</span> <span>{{ item.marca || 'N/A' }}</span></div>
                                        <div class="field-row"><span class="field-label">Modelo:</span> <span>{{ item.modelo || 'N/A' }}</span></div>
                                        <div class="field-row"><span class="field-label">Lote:</span> <span>{{ item.lote || 'N/A' }}</span></div>
                                        <div class="field-row"><span class="field-label">Serie:</span> <span>{{ item.serie || 'N/A' }}</span></div>
                                        <div class="field-row"><span class="field-label">No. de Inventario:</span> <span>{{ item.noInventario || item.no_inventario || item['No. Inventario'] || item['No Inventario'] || item.N_DE_INVENTARIO || item['N_DE_INVENTARIO'] || 'N/A' }}</span></div>
                                        <div class="field-row"><span class="field-label">Referencia:</span> <span>{{ item.referencia || 'N/A' }}</span></div>
                                        <div v-if="newItem.tipo !== 'equipo-medico'" class="field-row"><span class="field-label">Clave:</span> <span>{{ item.claveHRAEI || 'N/A' }}</span></div>
                                        <div v-if="['accesorio', 'consumible', 'refaccion'].includes(newItem.tipo)" class="field-row"><span class="field-label">Origen:</span> <span>{{ item.origenBien || 'N/A' }}</span></div>
                                    </div>
                                    <div class="result-extra-controls">
                                        <label>
                                            Cantidad
                                            <div class="qty-control">
                                                <button type="button" @click="localItemState[item._itemKey].cantidad = Math.max(1, localItemState[item._itemKey].cantidad - 1)">-</button>
                                                <span>{{ localItemState[item._itemKey]?.cantidad || 1 }}</span>
                                                <button type="button" @click="localItemState[item._itemKey].cantidad++">+</button>
                                            </div>
                                        </label>
                                        <label v-if="newItem.tipo === 'consumible' || newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion'">
                                            Estado
                                            <select v-model="localItemState[item._itemKey].estado">
                                                <option value="nuevo">Nuevo</option>
                                                <option value="usado">Usado</option>
                                            </select>
                                        </label>
                                        <label>
                                            Ubicación
                                            <input type="text" v-model="localItemState[item._itemKey].ubicacion" class="form-input" style="padding: 4px 8px; font-size: 0.8rem; min-width: 120px;" placeholder="Ej. UCIA" />
                                        </label>
                                        <label v-if="newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion' || newItem.tipo === 'consumible'">
                                            Equipo Asociado
                                            <input type="text" list="datalist-equipos-entrada" v-model="localItemState[item._itemKey].equipoAsociado" class="form-input" style="padding: 4px 8px; font-size: 0.8rem; min-width: 140px;" placeholder="Ej. Monitor SN123" />
                                        </label>
                                        <label v-if="newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion' || newItem.tipo === 'consumible'">
                                            Origen del Bien
                                            <input type="text" v-model="localItemState[item._itemKey].origenBien" class="form-input" style="padding: 4px 8px; font-size: 0.8rem; min-width: 140px;" placeholder="Compra, donación..." />
                                        </label>
                                        <div class="descuento-info" v-if="(newItem.tipo === 'consumible' || newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion') && localItemState[item._itemKey]?.estado === 'nuevo'">
                                            Descuento: Sí
                                        </div>
                                        <div class="descuento-info" v-else-if="newItem.tipo === 'consumible' || newItem.tipo === 'accesorio' || newItem.tipo === 'refaccion'">
                                            Descuento: No
                                        </div>
                                    </div>
                                    <button type="button" class="btn-select-item" @click="selectInventoryRefinedItem(item)">Agregar este item</button>
                                </div>
                                <div v-if="!inventoryBase.length && refinements.length === 0" class="no-results">
                                    <div>🔄 No hay datos de inventario cargados para sugerencias.</div>
                                    <small>Ve al paso anterior o refresca la página para recargar inventario.</small>
                                </div>
                                <div v-else-if="refinedInventory.length === 0" class="no-results">No hay resultados que coincidan</div>
                            </div>
                            
                            <!-- Datalist para equipos asociados (Autocompletado nativo y ligero) -->
                            <datalist id="datalist-equipos-entrada">
                                <option v-for="eq in equipoMedicoList" :key="eq.id || eq.serie" :value="eq.nombre || eq.label">
                                    {{ eq.serie ? `Serie: ${eq.serie}` : (eq.noInventario ? `Inv: ${eq.noInventario}` : '') }}
                                </option>
                            </datalist>
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



                        <!-- ========== FLUJO 1: EDITAR BIEN INTERNO EXISTENTE ========== -->
                        <Transition name="slide-up">
                            <div v-if="isEditingItem && belongsToHospital === true && !newItem.isBlank && !['mobiliario', 'refaccion'].includes(newItem.tipo)" class="equipment-form internal-edit-form">
                                <div class="form-header">
                                    <div class="internal-edit-card premium-card" :class="{ 'is-success': cardSuccessState }">
                                        <div class="card-glow"></div>
                                        
                                        <Transition name="fade">
                                            <div v-if="cardSuccessState" class="success-overlay">
                                                <div class="success-content">
                                                    <div class="success-icon-wrap">
                                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    </div>
                                                    <span>{{ editingItemIndex !== -1 ? '¡Actualizado!' : '¡Agregado!' }}</span>
                                                </div>
                                            </div>
                                        </Transition>

                                        <div class="internal-card-header">
                                            <div class="header-main">
                                                <div class="edit-context-banner" :style="getBannerStyle(newItem)">
                                                    <div class="edit-icon-box" :style="{ background: getBannerStyle(newItem).color }">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </div>
                                                    <span class="edit-text">EDITANDO {{ getBannerText(newItem) }}</span>
                                                    <button type="button" @click="openChangeCategoryModal" style="margin-left: auto; padding: 2px 6px; font-size: 0.65rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; background: rgba(0,0,0,0.2); color: white; cursor: pointer; display:flex; align-items:center; gap:4px;">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                                                        CAMBIAR
                                                    </button>
                                                </div>
                                                <h3 class="asset-name">{{ newItem.unidades[0]?.nombre || 'Sin nombre' }}</h3>
                                                <div class="technical-info-grid">
                                                    <div class="info-item">
                                                        <span class="info-label">MARCA</span>
                                                        <span class="info-value">{{ newItem.unidades[0]?.marca || '-' }}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="info-label">MODELO</span>
                                                        <span class="info-value">{{ newItem.unidades[0]?.modelo || '-' }}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="info-label">SERIE</span>
                                                        <span class="info-value">{{ newItem.unidades[0]?.serie || '-' }}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="info-label">CLAVE</span>
                                                        <span class="info-value">{{ newItem.unidades[0]?.claveHRAEI || '-' }}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="info-label">LOTE</span>
                                                        <span class="info-value">{{ newItem.unidades[0]?.lote || '-' }}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="info-label">REF</span>
                                                        <span class="info-value">{{ newItem.unidades[0]?.referencia || '-' }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="internal-edit-grid">
                                            <div class="edit-field-group">
                                                <label class="field-label">Cantidad a ingresar</label>
                                                <div class="stepper-control">
                                                    <button type="button" @click="newItem.unidades[0].cantidad = Math.max(1, newItem.unidades[0].cantidad - 1)" :disabled="newItem.unidades[0].cantidad <= 1" class="step-btn">−</button>
                                                    <input type="number" v-model.number="newItem.unidades[0].cantidad" min="1" class="step-input" />
                                                    <button type="button" @click="newItem.unidades[0].cantidad++" class="step-btn">+</button>
                                                </div>
                                            </div>
                                            <div class="edit-field-group">
                                                <label class="field-label">Ubicación específica</label>
                                                <SearchableInput v-model="newItem.unidades[0].ubicacion" :suggestions="currentSuggestions" field-name="ubicacion" placeholder="Donde se almacenará..." @select="(s) => handleSuggestionSelect(s, newItem.unidades[0], 'ubicacion')" />
                                            </div>

                                            <div v-if="isConsumibleLikeType(newItem.tipo)" class="edit-field-group full-width">
                                                <label class="field-label">Equipo Médico Vinculado</label>
                                                <SearchableInput v-model="newItem.unidades[0].equipoAsociado"
                                                    :suggestions="suggestions" tipo="equipo-medico"
                                                    field-name="nombre" placeholder="Buscar equipo principal..."
                                                    @select="(s) => newItem.unidades[0].equipoAsociado = (s.nombre || s.label || '')" />
                                            </div>

                                            <div v-if="isConsumibleLikeType(newItem.tipo)" class="edit-field-group full-width">
                                                <label class="field-label">Origen del Bien</label>
                                                <input v-model.trim="newItem.unidades[0].origenBien" type="text" 
                                                    class="form-input" placeholder="Compra, donación, comodato..." />
                                            </div>
                                        </div>

                                        <div class="premium-card-actions">
                                            <button type="button" class="btn-premium-clear" @click="resetNewItem">Limpiar</button>
                                            <button type="button" class="btn-premium-add" @click="agregarItem" :disabled="!canAddItem || isVerifyingStatus || cardSuccessState" :class="{ 'is-loading': isVerifyingStatus }">
                                                {{ editingItemIndex !== -1 ? 'Actualizar' : 'Confirmar' }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- ========== FLUJO 2: AGREGAR BIEN EN BLANCO INTERNO ========== -->
                        <Transition name="slide-up">
                            <div v-if="newItem.tipo && (newItem.isBlank || belongsToHospital === false || newItem.tipo === 'mobiliario' || newItem.tipo === 'refaccion')" class="equipment-form blank-item-form">
                                <div class="blank-form-header">
                                    <div class="blank-form-banner">
                                        <div class="blank-form-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="12" y1="8" x2="12" y2="16" />
                                                <line x1="8" y1="12" x2="16" y2="12" />
                                            </svg>
                                        </div>
                                         <div class="blank-form-title">
                                             <h3>Capturar Información del Bien</h3>
                                             <p>El bien será registrado como comprobante. Solo administradores pueden agregarlo al inventario.</p>
                                             <div class="required-fields-note">
                                                 <small><strong>Campos requeridos:</strong> {{ getRequiredFieldsText() }}</small>
                                             </div>
                                         </div>
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
                                                <button type="button" class="unit-kardex" @click="openKardex(unidad)"
                                                    v-if="unidad.claveHRAEI" title="Ver kardex">
                                                    <VueIcon name="ic:baseline-description" size="16" />
                                                </button>
                                            </div>

                                            <div class="unit-fields">
                                                <template v-if="belongsToHospital === true && (newItem.tipo === 'accesorio' || newItem.tipo === 'consumible' || newItem.tipo === 'refaccion')">
                                                    <div class="searchable-field">
                                                        <label class="mini-label">Nombre / Descripción</label>
                                                        <input v-model.trim="unidad.nombre" type="text" class="form-input"
                                                            :placeholder="getNombrePlaceholder()" autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Marca</label>
                                                        <input v-model.trim="unidad.marca" type="text" class="form-input"
                                                            placeholder="Ej. Philips" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Modelo</label>
                                                        <input v-model.trim="unidad.modelo" type="text" class="form-input"
                                                            placeholder="Ej. MX40" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Lote</label>
                                                        <input v-model.trim="unidad.lote" type="text" class="form-input"
                                                            placeholder="Ej. LT-2026" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">No. Serie (opcional)</label>
                                                        <input v-model.trim="unidad.serie" type="text" class="form-input"
                                                            placeholder="Ej. SN123456" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Referencia del Accesorio / Consumible / Refacción</label>
                                                        <input v-model.trim="unidad.referencia" type="text" class="form-input"
                                                            placeholder="Ej. REF-001" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Ubicación</label>
                                                        <input v-model.trim="unidad.ubicacion" type="text" class="form-input"
                                                            placeholder="Ej. UCIA" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Equipo Asociado</label>
                                                        <input v-model.trim="unidad.equipoAsociado" type="text" class="form-input"
                                                            placeholder="Equipo al que pertenece..." autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Clave HRAEI</label>
                                                        <input v-model.trim="unidad.claveHRAEI" type="text" class="form-input"
                                                            placeholder="Ej. HRAEI-12345" autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Origen del Bien</label>
                                                        <input v-model.trim="unidad.origenBien" type="text" class="form-input"
                                                            placeholder="Compra, donación, comodato..." autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="quantity-field">
                                                        <label class="mini-label">Cantidad de esta unidad</label>
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
                                                </template>
                                                <template v-else-if="belongsToHospital === true && newItem.tipo === 'equipo-medico'">
                                                     <!-- Internal Equipo-Medico -->
                                                     <div class="searchable-field">
                                                         <label class="mini-label">Nombre / Descripción</label>
                                                         <input v-model.trim="unidad.nombre" type="text" class="form-input"
                                                             :placeholder="getNombrePlaceholder()" autocomplete="off"
                                                             autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Marca</label>
                                                         <input v-model.trim="unidad.marca" type="text" class="form-input"
                                                             placeholder="Ej. Philips" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Modelo</label>
                                                         <input v-model.trim="unidad.modelo" type="text" class="form-input"
                                                             placeholder="Ej. MX40" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Lote</label>
                                                         <input v-model.trim="unidad.lote" type="text" class="form-input"
                                                             placeholder="Ej. LT-2026" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">No. Serie (opcional)</label>
                                                         <input v-model.trim="unidad.serie" type="text" class="form-input"
                                                             placeholder="Ej. SN123456" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Ubicación</label>
                                                         <input v-model.trim="unidad.ubicacion" type="text" class="form-input"
                                                             placeholder="Ej. UCIA" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Referencia de Equipo</label>
                                                         <input v-model.trim="unidad.referencia" type="text" class="form-input"
                                                             placeholder="Ej. REF-EQ-001" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="quantity-field">
                                                         <label class="mini-label">Cantidad de esta unidad</label>
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
                                                </template>
                                                <template v-else-if="belongsToHospital === true && newItem.tipo === 'mobiliario'">
                                                     <!-- Internal Mobiliario -->
                                                     <div class="searchable-field">
                                                         <label class="mini-label">Nombre / Descripción</label>
                                                         <input v-model.trim="unidad.nombre" type="text" class="form-input"
                                                             :placeholder="getNombrePlaceholder()" autocomplete="off"
                                                             autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Marca</label>
                                                         <input v-model.trim="unidad.marca" type="text" class="form-input"
                                                             placeholder="Ej. Philips" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Modelo</label>
                                                         <input v-model.trim="unidad.modelo" type="text" class="form-input"
                                                             placeholder="Ej. MX40" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Lote</label>
                                                         <input v-model.trim="unidad.lote" type="text" class="form-input"
                                                             placeholder="Ej. LT-2026" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">No. Serie (opcional)</label>
                                                         <input v-model.trim="unidad.serie" type="text" class="form-input"
                                                             placeholder="Ej. SN123456" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Ubicación</label>
                                                         <input v-model.trim="unidad.ubicacion" type="text" class="form-input"
                                                             placeholder="Ej. UCIA" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>

                                                     <div class="searchable-field">
                                                         <label class="mini-label">Referencia del Mobiliario</label>
                                                         <input v-model.trim="unidad.referencia" type="text" class="form-input"
                                                             placeholder="Ej. REF-MOB-001" autocomplete="off" autocorrect="off"
                                                             autocapitalize="off" spellcheck="false" />
                                                     </div>



                                                    <div class="quantity-field">
                                                        <label class="mini-label">Cantidad de esta unidad</label>
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
                                                </template>
                                                <template v-else-if="isExternalGoods">
                                                    <div class="searchable-field">
                                                        <label class="mini-label">Nombre / Descripción</label>
                                                        <input v-model.trim="unidad.nombre" type="text" class="form-input"
                                                            :placeholder="getNombrePlaceholder()" autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Marca</label>
                                                        <input v-model.trim="unidad.marca" type="text" class="form-input"
                                                            placeholder="Ej. Philips" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Modelo</label>
                                                        <input v-model.trim="unidad.modelo" type="text" class="form-input"
                                                            placeholder="Ej. MX40" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Lote</label>
                                                        <input v-model.trim="unidad.lote" type="text" class="form-input"
                                                            placeholder="Ej. LT-2026" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">No. Serie (opcional)</label>
                                                        <input v-model.trim="unidad.serie" type="text" class="form-input"
                                                            placeholder="Ej. SN123456" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Referencia del {{ newItem.tipo === 'equipo-medico' ? 'Equipo' : 'Bien' }}</label>
                                                        <input v-model.trim="unidad.referencia" type="text" class="form-input"
                                                            placeholder="Ej. REF-001" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Ubicación</label>
                                                        <input v-model.trim="unidad.ubicacion" type="text" class="form-input"
                                                            placeholder="Ej. UCIA" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div v-if="newItem.tipo !== 'mobiliario' && newItem.tipo !== 'equipo-medico'" class="searchable-field">
                                                        <label class="mini-label">Equipo Asociado</label>
                                                        <input v-model.trim="unidad.equipoAsociado" type="text" class="form-input"
                                                            placeholder="Equipo al que pertenece..." autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div v-if="newItem.tipo !== 'mobiliario' && newItem.tipo !== 'equipo-medico'" class="searchable-field">
                                                        <label class="mini-label">Origen del Bien</label>
                                                        <input v-model.trim="unidad.origenBien" type="text" class="form-input"
                                                            placeholder="Compra, donación, comodato..." autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                            <div class="quantity-field">
                                                <label class="mini-label">Cantidad de esta unidad</label>
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
                                                </template>
                                                <template v-else>
                                                    <div class="searchable-field">
                                                        <label class="mini-label">Nombre / Descripción</label>
                                                        <input v-model.trim="unidad.nombre" type="text" class="form-input"
                                                            :placeholder="getNombrePlaceholder()" autocomplete="off"
                                                            autocorrect="off" autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Marca</label>
                                                        <input v-model.trim="unidad.marca" type="text" class="form-input"
                                                            placeholder="Ej. Philips" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Modelo</label>
                                                        <input v-model.trim="unidad.modelo" type="text" class="form-input"
                                                            placeholder="Ej. MX40" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">No. Serie</label>
                                                        <input v-model.trim="unidad.serie" type="text" class="form-input"
                                                            placeholder="Ej. SN123456" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Referencia del Equipo</label>
                                                        <input v-model.trim="unidad.referencia" type="text" class="form-input"
                                                            placeholder="Ej. REF-001" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="searchable-field">
                                                        <label class="mini-label">Ubicación</label>
                                                        <input v-model.trim="unidad.ubicacion" type="text" class="form-input"
                                                            placeholder="Ej. UCIA" autocomplete="off" autocorrect="off"
                                                            autocapitalize="off" spellcheck="false" />
                                                    </div>

                                                    <div class="quantity-field">
                                                        <label class="mini-label">Cantidad de esta unidad</label>
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
                                                </template>
                                            </div>
                                        </div>
                                    </TransitionGroup>
                                </div>

                                <div class="form-actions">
                                    <button type="button" class="btn-clear" @click="resetNewItem">
                                        Cancelar
                                    </button>
                                    <button type="button" class="btn-add" @click="agregarItem" :disabled="!canAddItem || isVerifyingStatus" :class="{ 'is-loading': isVerifyingStatus }">
                                        <span v-if="!isVerifyingStatus">Registrar como Comprobante</span>
                                        <span v-else class="loading-spinner"></span>
                                    </button>
                                </div>
                            </div>
                        </Transition>


                    </WizardStepCard>

                    <!-- Added Equipment List -->
                    <WizardStepCard v-if="form.equiposEntrada.length > 0"
                        :title="`Equipos Agregados (${form.equiposEntrada.length})`"
                        subtitle="Lista de equipos que entrarán" icon-color="#10b981" collapsible>
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
                                    <div v-if="item.tipo === 'consumible' || item.tipo === 'accesorio' || item.tipo === 'refaccion'" class="consumible-state-badge"
                                        :class="(item.consumibleEstado || item.consumible_estado) === 'usado' ? 'is-usado' : 'is-nuevo'">
                                        {{ (item.consumibleEstado || item.consumible_estado) === 'usado' ? 'Usado' : 'Nuevo' }}
                                    </div>

                                    <div class="item-info">
                                            <div class="item-header">
                                            <h5 class="item-name">{{ item.descripcion || item.unidades?.[0]?.nombre ||
                                                'Sin nombre' }}</h5>
                                            <div class="item-quantity-badge">{{ getItemQuantity(item) }}</div>
                                        </div>
                                        <p class="item-quantity-text">{{ getItemQuantity(item) }} unidad{{
                                            (getItemQuantity(item)) !== 1 ? 'es' : '' }} de {{ getTipoLabel(item.tipo).toLowerCase() }}</p>
                                        <div class="item-details">
                                            <span v-if="item.marca"><strong>Marca:</strong> {{ item.marca }}</span>
                                            <span v-if="item.modelo"><strong>Modelo:</strong> {{ item.modelo }}</span>
                                            <span v-if="item.lote"><strong>Lote:</strong> {{ item.lote }}</span>
                                            <span v-if="item.referencia"><strong>Referencia:</strong> {{ item.referencia
                                            }}</span>
                                            <span v-if="item.serie"><strong>Serie:</strong> {{ item.serie }}</span>
                                            <span v-if="item.ubicacion"><strong>Ubicación:</strong> {{ item.ubicacion
                                            }}</span>
                                            <span v-if="item.equipoAsociado"><strong>Equipo asociado:</strong> {{
                                                item.equipoAsociado
                                            }}</span>
                                            <span v-if="item.claveHRAEI"><strong>Clave HRAEI:</strong> {{
                                                item.claveHRAEI }}</span>
                                        </div>
                                    </div>

                                    <button type="button" class="item-edit"
                                        :class="{ 'is-editing': editingItemIndex === index }"
                                        @click="editarItem(index)"
                                        :title="editingItemIndex === index ? 'Cancelar edición' : 'Editar item'">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                        </svg>
                                    </button>
                                    <button type="button" class="item-remove" @click="eliminarItem(item)"
                                        title="Eliminar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path
                                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                    <button type="button" class="item-kardex" @click="openKardex(item)"
                                        v-if="item.claveHRAEI" title="Ver kardex">
                                        <VueIcon name="ic:baseline-description" size="18" />
                                    </button>
                                </div>
                            </TransitionGroup>
                        </div>
                    </WizardStepCard>

                    <!-- Empty State -->
                    <div v-if="form.equiposEntrada.length === 0 && !newItem.tipo" class="empty-equipment">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <h4>No hay equipos agregados</h4>
                        <p>Selecciona un tipo de equipo arriba para comenzar</p>
                    </div>
                </div>
            </template>

            <!-- ========== STEP 3: Observaciones y Firmas ========== -->
            <template #step-3>
                <div class="wizard-step">
                    <WizardStepCard title="Observaciones" subtitle="Notas adicionales sobre la entrada"
                        icon-color="#06b6d4">
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
                                        <div style="display:flex; flex-direction:column; gap:6px;">
                                            <span style="font-weight:700; color:rgba(255,255,255,0.9);">{{
                                                form.observacionesImg.name }}</span>
                                            <button type="button" class="btn secondary" @click="removeObservacionesImg"
                                                style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ModernInput v-model="form.nombreIngeniero" label="Ingeniero Residente (Apoyo)"
                                placeholder="Nombre de la cuenta autenticada" :readonly="true" />
                        </div>
                    </WizardStepCard>

                    <WizardStepCard title="Firmas" subtitle="Personas que firmarán el documento" icon-color="#ec4899">
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
                                        <div v-if="sig.nameKnown" class="sig-name-input-wrapper">
                                            <select v-if="sig.key === 'ingeniero'"
                                                v-model="sig.name"
                                                class="engineer-select"
                                                :disabled="isReadOnly"
                                            >
                                                <option value="" disabled>Selecciona un ingeniero...</option>
                                                <option v-for="u in engineerSuggestions" :key="u.id" :value="u.nombre">
                                                    {{ u.nombre }}
                                                </option>
                                            </select>
                                            <ModernInput v-else v-model="sig.name"
                                                placeholder="Nombre completo" size="small" class="sig-name-input" />
                                        </div>
                                    </Transition>
                                </div>
                            </div>
                        </div>
                    </WizardStepCard>
                </div>
            </template>

            <!-- ========== SIDEBAR SUMMARY ========== -->
            <template #summary>
                <LiveSummary :items="summaryItems" :equipment-count="form.equiposEntrada.length">
                    <template #actions>
                        <div class="pdf-actions-container">
                            <label class="premium-toggle">
                                <div class="toggle-info">
                                    <span class="toggle-title">Forzar 1 Hoja</span>
                                    <span class="toggle-desc">Ajusta el contenido a una página</span>
                                </div>
                                <div class="switch-wrapper">
                                    <input type="checkbox" v-model="form.forceSinglePage" class="switch-input" />
                                    <div class="switch-track">
                                        <div class="switch-thumb"></div>
                                    </div>
                                </div>
                            </label>
                            <button type="button" class="btn-preview-alt" @click="onPreviewPDF" :disabled="loadingPreview">
                                <svg v-if="!loadingPreview" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span v-else class="btn-spinner"></span>
                                {{ loadingPreview ? 'Generando...' : 'Vista Previa' }}
                            </button>
                        </div>
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
                            <iframe :src="pdfPreviewUrl" class="pdf-iframe" title="Vista previa del documento"></iframe>
                        </div>
                    </div>
                  </div>
                </Teleport>
            </Transition>
        </Teleport>
    </div>

    <!-- Kardex Preview Modal (accessible from unit cards) -->
    <KardexPreviewModal :isOpen="kardexModalVisible" :itemData="kardexItem" title="Vista previa del Kardex" @close="kardexModalVisible = false" />

    <!-- Change Category Modal -->
    <Transition name="modal-fade">
        <div v-if="showChangeCategoryModal" class="acr-modal-overlay" @click.self="closeChangeCategoryModal" style="z-index: 9999;">
            <div class="acr-modal acr-modal-compact">
                <div class="acr-modal-header">
                    <div class="acr-modal-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                        <span>Cambiar Categoría del Bien</span>
                    </div>
                    <button type="button" class="acr-modal-close" @click="closeChangeCategoryModal">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="acr-modal-body">
                    <p class="acr-hint">Selecciona la nueva categoría para este bien.</p>
                    <div class="acr-category-grid" :style="{ gridTemplateColumns: validCategoryChanges.length > 3 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)' }">
                        <button v-for="cat in validCategoryChanges" :key="cat.value + '-' + cat.isAcr" type="button" class="acr-cat-btn" @click="applyCategoryChange(cat.value, cat.isAcr)" :class="{ 'is-selected': newItem.tipo === cat.value && acrFlowActive === cat.isAcr }">
                            <div class="acr-cat-icon" :style="{ '--cat-color': cat.color }">
                                <component :is="cat.icon" style="width:26px; height:26px;" />
                            </div>
                            <span>{{ cat.label }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

// Components
import OperationWizard from '@/components/operations/OperationWizard.vue'
import WizardStepCard from '@/components/operations/WizardStepCard.vue'
import ModernInput from '@/components/operations/ModernInput.vue'
import ModernSelect from '@/components/operations/ModernSelect.vue'
import LiveSummary from '@/components/operations/LiveSummary.vue'
import FolioInput from '@/components/FolioInput.vue'
import TimePicker from '@/components/TimePicker.vue'
import SearchableInput from '@/components/SearchableInput.vue'

// Icons
import {
    ComputerDesktopIcon,
    DeviceTabletIcon,
    CpuChipIcon,
    BeakerIcon,
    WrenchIcon
} from '@heroicons/vue/24/outline'
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

// PDF and Kardex modals
import KardexPreviewModal from '@/components/KardexPreviewModal.vue';
import EquipmentWarningModal from '@/components/EquipmentWarningModal.vue';

// Utils
import notifier from '@/utils/notifier'
import { authedFetch } from '@/utils/api.js'
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'
import notificationStore from '@/stores/notificationStore'

// Composables
import { useInventorySuggestions } from '@/composables/useInventorySuggestions.js'
import { useEquipmentWarnings, getEquipmentStatus, validateItemForOrder } from '@/composables/useEquipmentWarnings.js'
import { useCloseConfirmation } from '@/composables/useCloseConfirmation.js'
import { useWizardDraft } from '@/composables/useWizardDraft.js'
import { peekSessionState, clearSessionState } from '@/utils/sessionRestore'
import { useUserSuggestions } from '@/composables/useUserSuggestions.js'
import { refreshBiomedicalEquipmentCatalog } from '@/services/biomedicalEquipmentCatalog.js'

// Props
const props = defineProps({
    modo: { type: String, default: 'crear' },
    ordenId: { type: [String, Number], default: null },
    enModal: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    initialItems: { type: Array, default: null }
})

const emit = defineEmits({
    close: () => true,
    actualizado: () => true,
    created: () => true,
    cancel: () => true
})
const router = useRouter()

function getAuthenticatedUserName() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const candidate = user.fullName || user.nombreCompleto || user.nombre || user.name || user.username || ''
        return String(candidate || '').trim()
    } catch {
        return ''
    }
}

function forceAuthenticatedEngineerName() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const role = String(user?.role || '').trim().toLowerCase()
        if (role === 'admin' || role === 'sub_admin') {
            form.nombreIngeniero = 'N/A'
            return
        }

        const authName = getAuthenticatedUserName()
        if (authName) {
            form.nombreIngeniero = authName
        }
    } catch {
        const authName = getAuthenticatedUserName()
        if (authName) {
            form.nombreIngeniero = authName
        }
    }
}

// Inventory suggestions
const seccionActual = computed(() => {
    if (!newItem.tipo) return null
    if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') return 'equipo'
    if (['accesorio', 'consumible', 'refaccion'].includes(newItem.tipo)) return 'insumo'
    return null
})

const {
    suggestions,
    searchTerm,
    selectItem,
    clearSuggestions,
    isLoading: loadingInventory,
    fetchAllInventorySuggestions,
    fetchEquipoMedicoSuggestions,
    fetchInsumosRefaccionesSuggestions,
    fillUnitFromSuggestion,
    equipoMedicoList,
    allInventoryList,
    filterSuggestions
} = useInventorySuggestions({
    tipo: seccionActual,
    onSelect: (item) => agregarItemALaOrden(item, seccionActual.value),
    noDedupeOnSearch: true
})

// User suggestions for signers
const DEFAULT_INGENIEROS_FIRMANTES = [
    'Ing. Ana Karen Soto Avilés',
    'Ing. Nayeth Palma Espinosa',
    'Lic. Carlos Alberto Rosales Millán',
]
const EXCLUDED_ENGINEERS = ['administrador', 'luis eduardo corona martinez']
const { fetchUsers, getSuggestionsForRole } = useUserSuggestions()
const engineerSuggestions = computed(() => {
    const fromDB = getSuggestionsForRole('privileged')
        .map(u => u.nombre)
        .filter(name => !EXCLUDED_ENGINEERS.includes(String(name || '').toLowerCase().trim()))
    const combined = [...new Set([...DEFAULT_INGENIEROS_FIRMANTES, ...fromDB])]
    return combined.sort().map(name => ({ id: name, nombre: name }))
})

// Refinamiento incremental para selección de items inventario
const refinements = ref([])
const refinementField = ref('serie')
const refinementValue = ref('')
const refinementDropdownOpen = ref(false)

const refinementFields = {
    nombre: 'Nombre / Descripción',
    marca: 'Marca',
    modelo: 'Modelo',
    lote: 'Lote',
    serie: 'Serie',
    referencia: 'Referencia',
    ubicacion: 'Ubicación',
    claveHRAEI: 'Clave HRAEI',
    noInventario: 'No. Inventario'
}

const inventoryBase = computed(() => {
    const suggestionsList = Array.isArray(suggestions.value) ? suggestions.value : []
    const equipoList = Array.isArray(equipoMedicoList.value) ? equipoMedicoList.value : []
    const allList = Array.isArray(allInventoryList.value) ? allInventoryList.value : []
    const tipoActual = newItem.tipo
    
    // Intentar determinar la mejor base según el tipo, pero permitir combinación si hay pocos resultados
    let base = []
    if (tipoActual === 'equipo-medico' || tipoActual === 'mobiliario') {
        base = equipoList
    } else if (['accesorio', 'consumible', 'refaccion'].includes(tipoActual)) {
        base = suggestionsList
    } else {
        base = allList.length > 0 ? allList : [...equipoList, ...suggestionsList]
    }

    // "Sugerencias para todo" (Request 8): 
    // Siempre combinar ambas listas si estamos buscando por un término que parece un ID
    const combinedSet = new Set(base.map(i => i.id || i._id || i.noInventario || i.no_inventario || i.serie))
    const backupList = allList.length > 0 ? allList : [...equipoList, ...suggestionsList]
    
    backupList.forEach(item => {
        const key = item.id || item._id || item.noInventario || item.no_inventario || item.serie
        if (key && !combinedSet.has(key)) {
            base.push(item)
            combinedSet.add(key)
        }
    })
    
    return base
})

function getRefinementFieldValue(item, key) {
    if (!item || !key) return ''
    const fallbacks = {
        nombre: [item.nombre, item.label, item.descripcion, item.descripcionDelBien, item.DescripcionDelBien],
        marca: [item.marca],
        modelo: [item.modelo],
        lote: [item.lote],
        serie: [item.serie, item.n, item.numeroSerie, item.numeroDeSerie],
        referencia: [item.referencia, item.Referencia],
        ubicacion: [item.ubicacion, item.Ubicacion],
        claveHRAEI: [item.claveHRAEI, item.claveCNIS],
        noInventario: [item.noInventario, item.no_inventario, item['No. Inventario'], item['No Inventario'], item.N_DE_INVENTARIO, item['N_DE_INVENTARIO']]
    }

    const values = fallbacks[key] || [item[key]]
    for (const val of values) {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim().toLowerCase()
        }
    }
    return ''
}

const refinedInventory = computed(() => {
    const list = Array.isArray(inventoryBase.value) ? inventoryBase.value.slice() : []
    const filtered = []

    list.forEach(item => {
        let match = true
        for (const r of refinements.value) {
            const q = String(r.value || '').trim().toLowerCase()
            if (!q) continue
            const fieldValue = getRefinementFieldValue(item, r.key)
            if (!fieldValue.includes(q)) {
                match = false
                break
            }
        }
        if (match) {
            filtered.push(item)
        }
    })

    // Initialize local item state for the filtered items
    filtered.forEach(item => {
        const key = item.id || item._id || item.serie || item.noInventario || item.nombre || Math.random().toString()
        item._itemKey = key
        if (!localItemState.value[key]) {
            localItemState.value[key] = {
                cantidad: 1,
                estado: 'nuevo',
                ubicacion: item.ubicacion || '',
                equipoAsociado: item.equipoAsociado || '',
                origenBien: item.origenBien || ''
            }
        }
    })

    return filtered
})

const refinementSuggestions = computed(() => {
    const query = String(refinementValue.value || '').trim().toLowerCase()
    const candidates = {}
    let list = inventoryBase.value
    if (refinements.value.length > 0) {
        list = refinedInventory.value
    }

    // Limitar procesamiento para evitar bloqueo de UI con listas grandes
    const maxItemsToProcess = Math.min(list.length, 500)
    const itemsToProcess = list.slice(0, maxItemsToProcess)

    itemsToProcess.forEach(item => {
        let rawVal = String(item[refinementField.value] || '').trim()
        if ((!rawVal || rawVal === '') && refinementField.value === 'noInventario') {
            rawVal = String(item.noInventario || item.no_inventario || item['No. Inventario'] || item['No Inventario'] || item.N_DE_INVENTARIO || '')
        }
        const value = rawVal.trim()
        if (!value) return
        if (!query || value.toLowerCase().includes(query)) {
            candidates[value] = (candidates[value] || 0) + 1
        }
    })

    const sortedValues = Object.keys(candidates)
        .sort((a, b) => candidates[b] - candidates[a])
        .slice(0, 10)

    return sortedValues.map(v => ({ value: v, count: candidates[v] }))
})

function dispatchClearSearchableFilters() {
    try {
        window.dispatchEvent(new Event('searchable-input:clear-filters'))
    } catch (e) {
        console.warn('[OpEntradaNew] Error dispatching clear filters event:', e.message)
    }
}

const localItemState = ref({})

const refinementBlurTimer = ref(null)

const canAddRefinement = computed(() => String(refinementValue.value || '').trim().length > 0)

let refinementDebounceTimer = null

function onStepValueInput() {
    // Debounce para evitar re-renderizados masivos
    if (refinementDebounceTimer) clearTimeout(refinementDebounceTimer)
    refinementDebounceTimer = setTimeout(() => {
        refinementDropdownOpen.value = refinementSuggestions.value.length > 0
    }, 150)
}

function onRefinementFocus() {
    refinementDropdownOpen.value = refinementSuggestions.value.length > 0
}

function onRefinementBlur() {
    if (refinementBlurTimer.value) clearTimeout(refinementBlurTimer.value)
    refinementBlurTimer.value = setTimeout(() => {
        refinementDropdownOpen.value = false
        refinementBlurTimer.value = null
    }, 180)
}

function addRefinement() {
    const value = String(refinementValue.value || '').trim()
    if (!value) return

    const exists = refinements.value.some(r => r.key === refinementField.value && r.value.toLowerCase() === value.toLowerCase())
    if (!exists) {
        refinements.value.push({ key: refinementField.value, value })
    }
    refinementValue.value = ''
    refinementDropdownOpen.value = false
}

function removeRefinement(index) {
    refinements.value.splice(index, 1)
}

function clearRefinements() {
    refinements.value = []
    refinementValue.value = ''
    refinementDropdownOpen.value = false
    dispatchClearSearchableFilters()
}

function applyRefinementSuggestion(suggestion) {
    refinementValue.value = suggestion
    addRefinement()
    refinementDropdownOpen.value = false
}

function selectInventoryRefinedItem(item) {
    const selectedTipo = newItem.tipo || item.tipo || (seccionActual.value === 'equipo' ? 'equipo-medico' : 'accesorio')
    const isConsumibleLike = selectedTipo === 'consumible' || selectedTipo === 'accesorio' || selectedTipo === 'refaccion'
    const state = localItemState.value[item._itemKey] || {}

    const chosenItem = {
        ...item,
        tipo: selectedTipo,
        nombre: item.nombre || item.label || item.descripcion || item.descripcionDelBien || item.DescripcionDelBien || item['EQUIPO MEDICO'] || item['EQUIPO MÉDICO'] || '',
        marca: item.marca || item.MARCA || item.FABRICANTE || item.fabricante || '',
        modelo: item.modelo || item.MODELO || '',
        lote: item.lote || item.LOTE || '',
        serie: item.serie || item['No. de Serie'] || item['No de Serie'] || item['NUMERO DE SERIE'] || item['NÚMERO DE SERIE'] || '',
        referencia: item.referencia || item.REFERENCIA || item['Codigo Ref'] || item['Código Ref'] || '',
        ubicacion: state.ubicacion?.trim() || item.ubicacion || item.UBICACION || item['UBICACION ESPECIFICA'] || item['Ubicación específica'] || item.AREA || item.ÁREA || '',
        equipoAsociado: state.equipoAsociado?.trim() || item.equipoAsociado || '',
        claveHRAEI: item.claveHRAEI || item['Clave  HRAEI'] || item['CLAVE HRAEI'] || item.claveCNIS || '',
        noInventario: item.noInventario || item.no_inventario || item['No. Inventario'] || item['No Inventario'] || item['NUMERO INVENTARIO'] || '',
        cantidad: Number(state.cantidad) || 1,
        consumibleEstado: isConsumibleLike ? (state.estado || 'nuevo') : null,
        descuento: isConsumibleLike ? ((state.estado || 'nuevo') === 'nuevo') : false
    }

    if (!newItem.tipo && selectedTipo) {
        newItem.tipo = selectedTipo
    }

    agregarItemALaOrden(chosenItem, seccionActual.value)
}

const getBannerStyle = (item) => {
    const isLinked = !!item.unidades[0]?.equipoAsociado;
    const type = item.tipo;
    
    const themes = {
        'equipo': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
        'mobiliario': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
        'accesorio': isLinked ? { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' } : { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.2)' },
        'consumible': isLinked ? { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.2)' } : { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
        'refaccion': isLinked ? { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' } : { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)' }
    };
    
    const theme = themes[type] || { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.2)' };
    return {
        color: theme.color,
        background: `linear-gradient(90deg, ${theme.bg} 0%, rgba(15, 23, 42, 0) 100%)`,
        borderColor: `${theme.color}66`
    };
};

const getBannerText = (item) => {
    const isLinked = !!item.unidades[0]?.equipoAsociado;
    const type = item.tipo;
    
    if (type === 'equipo') return 'EQUIPO MÉDICO';
    if (type === 'mobiliario') return 'MOBILIARIO';
    
    let base = '';
    if (type === 'accesorio') base = 'ACCESORIO';
    else if (type === 'consumible') base = 'CONSUMIBLE';
    else if (type === 'refaccion') base = 'REFACCIÓN';
    else base = (type || 'ACTIVO').toUpperCase();
    
    return isLinked ? `${base} PARA EQUIPO MÉDICO` : base;
};

function agregarItemALaOrden(item, seccion) {
    if (!item) return
    const nombreValue = item.nombre || item.label || item.descripcion || item.descripcionDelBien || item.DescripcionDelBien || item['EQUIPO MEDICO'] || item['EQUIPO MÉDICO'] || ''
    const selectedTipo = item.tipo || newItem.tipo || (seccion === 'equipo' ? 'equipo-medico' : 'accesorio')
    const isConsumibleLike = selectedTipo === 'consumible' || selectedTipo === 'accesorio' || selectedTipo === 'refaccion'
    const mapped = {
        ...item,
        tipo: selectedTipo,
        cantidad: Number(item.cantidad) || 1,
        isExternal: item.isExternal ?? item.is_external ?? isCurrentItemExternal.value,
        consumibleEstado: isConsumibleLike ? (item.consumibleEstado || 'nuevo') : null,
        descuento: isConsumibleLike ? ((item.consumibleEstado || 'nuevo') === 'nuevo') : false,
        nombre: nombreValue,
        descripcion: nombreValue,
        marca: item.marca || item.MARCA || item.FABRICANTE || item.fabricante || '',
        modelo: item.modelo || item.MODELO || '',
        lote: item.lote || item.LOTE || '',
        serie: item.serie || item['No. de Serie'] || item['No de Serie'] || item['NUMERO DE SERIE'] || item['NÚMERO DE SERIE'] || '',
        referencia: item.referencia || item.REFERENCIA || item['Codigo Ref'] || item['Código Ref'] || '',
        ubicacion: item.ubicacion || item.UBICACION || item['UBICACION ESPECIFICA'] || item['Ubicación específica'] || item.AREA || item.ÁREA || '',
        claveHRAEI: item.claveHRAEI || item['Clave  HRAEI'] || item['CLAVE HRAEI'] || item.claveCNIS || '',
        noInventario: item.noInventario || item.no_inventario || item['No. Inventario'] || item['No Inventario'] || item['NUMERO INVENTARIO'] || '',
        // Si el flujo ACR está activo, marcar el item como "para equipo médico"
        paraEquipoMedico: acrFlowActive.value ? true : (item.paraEquipoMedico || false)
    }
    form.equiposEntrada.push(mapped)
    // Resetear flag ACR después de agregar
    acrFlowActive.value = false
}

// Refs
const wizardRef = ref(null)
const currentStep = ref(0)
const loading = ref(false)
const isMobileView = ref(false)
const errors = ref({})
const isVerifyingStatus = ref(false)

// Equipment Warnings
const showWarningModal = ref(false)
const pendingEquipment = ref(null)
const equipmentWarnings = ref([])
const belongsToHospital = ref(null)
const cardSuccessState = ref(false)
const isCurrentItemExternal = computed(() => belongsToHospital.value === false)
// Info popover states
const showDateInfo = ref(false)
const showHoraTerminoInfo = ref(false)
const fechaAutomatica = ref(true) // true = fecha se auto-asigna, false = editable manualmente

// Timer state - automatic, updates every second
let timerInterval = null
let folioRequested = false
const liveTimeDisplay = ref('')

// PDF Preview modal
const showPdfPreview = ref(false)
const pdfPreviewUrl = ref('')
const loadingPreview = ref(false)

// Kardex modal state
const kardexModalVisible = ref(false)
const kardexItem = ref({})

// Change category modal state
const showChangeCategoryModal = ref(false)

const validCategoryChanges = computed(() => {
    if (!newItem.tipo) return []
    const type = newItem.tipo
    
    if (type === 'equipo-medico' || type === 'mobiliario') {
        return [
            { value: 'equipo-medico', isAcr: false, label: 'Equipo Médico', icon: ComputerDesktopIcon, color: '#22c55e' },
            { value: 'mobiliario', isAcr: false, label: 'Mobiliario', icon: DeviceTabletIcon, color: '#3b82f6' }
        ]
    }
    
    if (type === 'accesorio' || type === 'consumible' || type === 'refaccion') {
        return [
            { value: 'accesorio', isAcr: false, label: 'Accesorio (Normal)', icon: CpuChipIcon, color: '#6366f1' },
            { value: 'accesorio', isAcr: true, label: 'Accesorio para Equipo Médico', icon: CpuChipIcon, color: '#8b5cf6' },
            { value: 'consumible', isAcr: false, label: 'Consumible (Normal)', icon: BeakerIcon, color: '#f59e0b' },
            { value: 'consumible', isAcr: true, label: 'Consumible para Equipo Médico', icon: BeakerIcon, color: '#fb923c' },
            { value: 'refaccion', isAcr: false, label: 'Refacción (Normal)', icon: WrenchIcon, color: '#f43f5e' },
            { value: 'refaccion', isAcr: true, label: 'Refacción para Equipo Médico', icon: WrenchIcon, color: '#ef4444' }
        ]
    }
    
    return []
})

function openChangeCategoryModal() {
    showChangeCategoryModal.value = true
}

function closeChangeCategoryModal() {
    showChangeCategoryModal.value = false
}

function applyCategoryChange(newType, isAcr) {
    if (newItem.tipo === newType && acrFlowActive.value === isAcr) {
        closeChangeCategoryModal()
        return
    }
    newItem.tipo = newType
    acrFlowActive.value = isAcr
    
    if (newType === 'consumible') {
        newItem.consumibleEstado = newItem.consumibleEstado || 'nuevo'
    }
    
    closeChangeCategoryModal()
}

// Edit item state
const editingItemIndex = ref(-1)
const isEditingItem = computed(() => editingItemIndex.value !== -1)

function openKardex(item) {
    const it = item || {}
    const payload = {
        n: String(it.n || it.N || it['N'] || it.numero || it.numeroSerie || '').trim(),
        clave: String(it.claveHRAEI || it['Clave  HRAEI'] || it.clave || '').trim(),
        lote: String(it.lote || it.Lote || it.LOTE || '').trim(),
        referencia: String(it.referencia || it.Referencia || it.REFERENCIA || '').trim(),
        cucop: String(it.cucop || it.cucops || it.CUCOP || it.CUCOPS || '').trim(),
        descripcion: it.descripcion || it.nombre || it.descripcion || '',
        marca: it.marca || it.MARCA || '',
        modelo: it.modelo || it.MODELO || '',
        strict: true
    }
    console.log('[KARDEX_DEBUG] Enviando tupla:', payload)
    kardexItem.value = payload
    kardexModalVisible.value = true
}

// Motivo select state
const motivoSelectRef = ref(null)
const motivoSearchRef = ref(null)
const showMotivoDropdown = ref(false)
const motivoSearchQuery = ref('')

// Default signatures
const DEFAULT_SIGNATURES = [
    { key: 'subdireccion', role: 'SUBDIRECCIÓN DE INGENIERÍA BIOMÉDICA', nameKnown: true, name: 'ARQ. KARLA ALEJANDRA TORRES SÁNCHEZ', fixed: true },
    { key: 'ingeniero', role: 'INGENIERO BIOMÉDICO', nameKnown: false, name: '', fixed: false },
    { key: 'recibe', role: 'IMSS BIENESTAR', nameKnown: false, name: '', fixed: false },
    { key: 'entrega', role: 'PROVEEDOR', nameKnown: false, name: '', fixed: false },
    { key: 'vigilancia', role: 'COORDINACIÓN DE VIGILANCIA', nameKnown: false, name: '', fixed: false }
]

// Form state
const form = reactive({
    nombreSolicitante: '',
    servicio: '',
    especialidad: '',
    folio: '',
    folioAsociado: '',
    fecha: '',
    fechaISO: '',
    horaInicio: '',
    horaTermino: '',
    motivoEntrada: '',
    otroMotivo: '',
    descripcion: '',
    observaciones: '',
    observacionesImg: null,
    nombreIngeniero: '',
    equiposEntrada: [],
    // By default, entradas should impact inventory unless the user explicitly disables it.
    agregarAlInventario: true,
    signatures: JSON.parse(JSON.stringify(DEFAULT_SIGNATURES)),
    extraFields: {},
    forceSinglePage: false
})

// New item state
const newItem = reactive({
    tipo: '',
    cantidad: 1,
    consumibleEstado: 'nuevo',
    descripcion: '',
    marca: '',
    modelo: '',
    serie: '',
    ubicacion: '',
    claveHRAEI: '',
    noInventario: '',
    unidades: [],
    isBlank: false
})

const draftEnabled = computed(() => props.modo !== 'editar' && !props.readOnly)
const { loadDraft, applyDraft, clearDraft, saveDraft } = useWizardDraft({
    key: 'entrada',
    form,
    stepRef: currentStep,
    enabled: () => draftEnabled.value,
    extra: () => ({ newItem: newItem, belongsToHospital: belongsToHospital.value }),
    applyExtra: (extra) => {
        if (extra && extra.newItem) Object.assign(newItem, extra.newItem)
        if (extra && Object.prototype.hasOwnProperty.call(extra, 'belongsToHospital')) {
            belongsToHospital.value = extra.belongsToHospital
        }
    },
    extraSources: [newItem, belongsToHospital]
})

// Guardado forzado al hacer logout para no perder el último estado en memoria
const handleFlushDraft = () => {
    try { saveDraft() } catch (e) { console.warn('[OpEntradaNew] wizard:draft:flush failed', e) }
}
try { window.addEventListener('wizard:draft:flush', handleFlushDraft) } catch {}
window.__opEntrada_flushHandler = handleFlushDraft

// Equipment types with icons and colors
const tipoEntradaOptions = [
    { value: 'equipo-medico', label: 'Equipo Médico', icon: ComputerDesktopIcon, color: '#22c55e' },
    { value: 'mobiliario', label: 'Mobiliario', icon: DeviceTabletIcon, color: '#3b82f6' },
    { value: 'accesorio', label: 'Accesorios', icon: CpuChipIcon, color: '#8b5cf6' },
    { value: 'consumible', label: 'Consumibles', icon: BeakerIcon, color: '#f59e0b' },
    { value: 'refaccion', label: 'Refacciones', icon: WrenchIcon, color: '#ef4444' }
]

// ===== Modal Acc/Cons/Ref para Equipo Médico (selector de categoría) =====
const showAcrModal = ref(false)
/** Cuando está en true, el próximo item agregado se marca con paraEquipoMedico:true */
const acrFlowActive = ref(false)
const showBlankItemModal = ref(false)

function abrirModalAcr() {
    showAcrModal.value = true
}

function cerrarModalAcr() {
    showAcrModal.value = false
}

/** Selecciona la categoría, activa el flag y delega al InventoryRefinement existente */
function seleccionarCategoriaAcr(categoria) {
    cerrarModalAcr()
    acrFlowActive.value = true
    selectEquipmentType(categoria)
}

// Wizard steps configuration
const wizardSteps = [
    { label: 'Solicitante', validate: () => validateStep0() },
    { label: 'Motivo', validate: () => validateStep1() },
    { label: 'Equipos', validate: () => validateStep2() },
    { label: 'Firmas', validate: () => validateStep3() }
]

// Computed
const wizardTitle = computed(() =>
    props.modo === 'editar' ? 'Editar Orden de Entrada' : 'Nueva Orden de Entrada'
)

const submitLabel = computed(() =>
    props.modo === 'editar' ? 'Actualizar Orden' : 'Guardar Orden'
)

const motivoOptions = computed(() => {
    if (!Array.isArray(motivoEntradaOptions)) return []
    return motivoEntradaOptions
        .filter(m => m.value) // Filter out empty value options
        .map(m => {
            // Handle both string and object formats
            if (typeof m === 'string') {
                return { value: m, label: m }
            }
            if (typeof m === 'object' && m !== null) {
                return { value: m.value || m.label || String(m), label: m.label || m.value || String(m) }
            }
            return { value: String(m), label: String(m) }
        })
})

// Filtered motivo options based on search
const filteredMotivoOptions = computed(() => {
    if (!motivoSearchQuery.value.trim()) return motivoOptions.value
    const q = motivoSearchQuery.value.toLowerCase()
    return motivoOptions.value.filter(opt =>
        opt.label.toLowerCase().includes(q)
    )
})

// Check if search query matches exactly any option
const hasExactMotivoMatch = computed(() => {
    if (!motivoSearchQuery.value.trim()) return true
    const q = motivoSearchQuery.value.toLowerCase()
    return motivoOptions.value.some(opt =>
        opt.label.toLowerCase() === q || opt.value.toLowerCase() === q
    )
})

// Selected motivo label for display
const selectedMotivoLabel = computed(() => {
    if (!form.motivoEntrada) return ''
    // Check if it's a standard option
    const opt = motivoOptions.value.find(o => o.value === form.motivoEntrada)
    if (opt) return opt.label
    // If "otro" and we have a custom text
    if (form.motivoEntrada === 'otro' && form.otroMotivo) {
        return `OTRO: ${form.otroMotivo}`
    }
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

function hasText(value) {
    return String(value || '').trim().length > 0
}

function isInternalAcrType(tipo) {
    return belongsToHospital.value === true && ['accesorio', 'consumible', 'refaccion'].includes(tipo)
}

function isInternalMedicalEquipmentType(tipo) {
    return belongsToHospital.value === true && (tipo === 'equipo-medico' || tipo === 'mobiliario')
}

function isUnitValidForCurrentContext(unit = {}) {
    if (newItem.isBlank) {
        return hasText(unit.nombre) || hasText(unit.descripcion)
    }

    if (!hasText(unit.nombre)) return false

    if (isCurrentItemExternal) {
        if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
            return hasText(unit.marca) &&
                hasText(unit.modelo) &&
                hasText(unit.ubicacion) &&
                hasText(unit.referencia)
        }
        // External refaccion, accesorio, consumible
        return hasText(unit.marca) &&
            hasText(unit.modelo) &&
            hasText(unit.lote) &&
            hasText(unit.serie) &&
            hasText(unit.ubicacion) &&
            hasText(unit.equipoAsociado) &&
            hasText(unit.referencia)
    }

    if (isInternalAcrType(newItem.tipo)) {
        return hasText(unit.marca) &&
            hasText(unit.modelo) &&
            hasText(unit.lote) &&
            hasText(unit.serie) &&
            hasText(unit.referencia) &&
            hasText(unit.ubicacion) &&
            hasText(unit.equipoAsociado) &&
            hasText(unit.claveHRAEI) &&
            hasText(unit.origenBien)
    }

    if (isInternalMedicalEquipmentType(newItem.tipo)) {
        return hasText(unit.marca) &&
            hasText(unit.modelo) &&
            hasText(unit.lote) &&
            hasText(unit.ubicacion) &&
            hasText(unit.referencia)
    }

    return true
}

const canAddItem = computed(() => {
    if (isVerifyingStatus.value) return false
    if (!newItem.tipo) return false
    if (!newItem.unidades.length) return false
    return newItem.unidades.every((u) => isUnitValidForCurrentContext(u))
})

const isValid = computed(() => {
    // Solicitante is now optional for preview too
    return form.motivoEntrada &&
        form.equiposEntrada.length > 0
})

// Timer computed for displaying live time (HH:MM:SS format)
const displayEndTime = computed(() => {
    return liveTimeDisplay.value || form.horaTermino || '--:--:--'
})

// Suggestions list based on current item type (modern composable)
const currentSuggestions = computed(() => {
    // Para bienes externos NO se usa ningún tipo de sugerencia de inventario
    if (belongsToHospital.value === false) return []
    if (!newItem.tipo) return []
    if (newItem.isBlank) return []
    if (newItem.tipo === 'mobiliario' || newItem.tipo === 'refaccion') return []
    // Retornamos suggestions.value que ya viene filtrado/sincronizado por el composable useInventorySuggestions
    return suggestions.value || []
})

const isExternalGoods = computed(() =>
    belongsToHospital.value === false
)

const summaryItems = computed(() => [
    {
        key: 'solicitante',
        label: 'Solicitante',
        value: form.nombreSolicitante,
        step: 1,
        status: form.nombreSolicitante?.trim() ? 'complete' : 'pending'
    },
    {
        key: 'servicio',
        label: 'Servicio',
        value: form.servicio,
        step: 2,
        status: form.servicio?.trim() ? 'complete' : 'pending'
    },
    {
        key: 'folio',
        label: 'Folio',
        value: form.folio ? `E-${form.folio}` : '',
        step: 3,
        status: form.folio ? 'complete' : 'pending'
    },
    {
        key: 'folioAsociado',
        label: 'Folio Asociado',
        value: form.folioAsociado,
        step: 3,
        status: 'complete',
        hidden: !form.folioAsociado
    },
    {
        key: 'motivo',
        label: 'Motivo',
        value: form.motivoEntrada,
        step: 4,
        status: form.motivoEntrada ? 'complete' : 'pending'
    },
    {
        key: 'equipos',
        label: 'Equipos',
        value: form.equiposEntrada.length ? `${form.equiposEntrada.length} equipo(s)` : '',
        step: 5,
        status: form.equiposEntrada.length > 0 ? 'complete' : 'pending'
    }
])

// Validation functions
function validateStep0() {
    return true // Solicitante is optional - no longer blocks step navigation
}

function validateStep1() {
    return form.motivoEntrada?.length > 0
}

function validateStep2() {
    return form.equiposEntrada.length > 0
}

function validateStep3() {
    return true // Signatures are optional
}

function getFieldError(field) {
    return errors.value[field] || ''
}

// Equipment type helpers
function selectEquipmentType(tipo) {
    newItem.tipo = tipo
    newItem.cantidad = 1
    newItem.consumibleEstado = tipo === 'consumible' ? 'nuevo' : ''
    newItem.unidades = [createEmptyUnit()]
    newItem.isBlank = false
}

function getSelectedTypeLabel() {
    const type = tipoEntradaOptions.find(t => t.value === newItem.tipo)
    return type?.label || ''
}

function getTipoLabel(tipo) {
    const type = tipoEntradaOptions.find(t => t.value === tipo)
    return type?.label || tipo
}

function getItemQuantity(item) {
    if (!item) return 1
    const q = Number(item.cantidad)
    if (q && q > 0) return q
    if (Array.isArray(item.unidades)) return item.unidades.reduce((s, u) => s + (Number(u && u.cantidad) || 1), 0)
    return 1
}

function normalizeUnitForSubmit(unit, fallbackQuantity = 1) {
    return {
        ...unit,
        cantidad: Math.max(1, Number(unit?.cantidad) || Number(fallbackQuantity) || 1)
    }
}

function buildSubmitItem(item) {
    const quantityTotal = getItemQuantity(item)
    const isExternal = item?.isExternal ?? item?.is_external ?? false
    const rawUnits = Array.isArray(item?.unidades) && item.unidades.length
        ? item.unidades
        : [{
            nombre: item?.nombre || item?.descripcion || '',
            descripcion: item?.descripcion || item?.nombre || '',
            marca: item?.marca || '',
            modelo: item?.modelo || '',
            lote: item?.lote || '',
            serie: item?.serie || '',
            referencia: item?.referencia || '',
            referenciaEquipo: item?.referenciaEquipo || '',
            ubicacion: item?.ubicacion || '',
            equipoAsociado: item?.equipoAsociado || '',
            serieEquipoAsociado: item?.serieEquipoAsociado || '',
            origenBien: item?.origenBien || item?.origen_bien || '',
            claveHRAEI: item?.claveHRAEI || '',
            cantidad: quantityTotal
        }]
    const normalizedUnits = isExternal
        ? [normalizeUnitForSubmit(rawUnits[0], quantityTotal)]
        : rawUnits.map(unit => normalizeUnitForSubmit(unit, unit?.cantidad || 1))
    const firstUnit = normalizedUnits[0] || {}

    return {
        ...item,
        isExternal,
        cantidad: quantityTotal,
        descripcion: item?.descripcion || firstUnit.descripcion || firstUnit.nombre || '',
        nombre: item?.nombre || firstUnit.nombre || item?.descripcion || '',
        unidades: normalizedUnits
    }
}

function getRequiredFieldsText() {
    if (!newItem.tipo) return 'Selecciona un tipo de bien primero.'
    if (newItem.isBlank) {
        return 'Para item en blanco: captura al menos Nombre/Descripción. El resto de campos es opcional.'
    }
    if (belongsToHospital.value === false) {
        if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
            return 'Nombre, Marca, Modelo, Ubicación, Referencia del mobiliario.'
        } else {
            return 'Nombre, Marca, Modelo, Lote, Serie, Ubicación, Equipo asociado, Referencia.'
        }
    } else {
        if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
            return 'Nombre, Marca, Modelo, Lote, Ubicación, Referencia del mobiliario.'
        }
    }
    return 'Nombre, Marca, Modelo, Ubicación.'
}

function getNombrePlaceholder() {
    switch (newItem.tipo) {
        case 'equipo-medico': return 'Ej. Monitor de signos vitales'
        case 'mobiliario': return 'Ej. Cama de hospital'
        case 'accesorio': return 'Ej. Cable de ECG'
        case 'consumible': return 'Ej. Electrodos'
        case 'refaccion': return 'Ej. Batería'
        default: return 'Nombre del equipo'
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
        referenciaEquipo: '',
        noInventario: '',
        ubicacion: '',
        equipoAsociado: '',
        serieEquipoAsociado: '',
        origenBien: '',
        claveHRAEI: '',
        cantidad: 1
    }
}

// Quantity controls
function incNew() {
    // Para equipos internos: agregar unidad vacía para mantener sincronización
    // Para equipos externos: NO agregar unidades (solo se maneja cantidad)
    if (!isCurrentItemExternal.value) {
        newItem.cantidad++
        newItem.unidades.push(createEmptyUnit())
    } else {
        newItem.cantidad++
    }
}

function decNew() {
    if (newItem.cantidad > 1) {
        newItem.cantidad--
        // Para equipos internos: remover unidades extras
        if (!isCurrentItemExternal.value) {
            newItem.unidades.pop()
        }
    }
}

function removeUnit(idx) {
    if (newItem.unidades.length > 1) {
        newItem.unidades.splice(idx, 1)
        newItem.cantidad = newItem.unidades.length
    }
}

// Edit item
function editarItem(index) {
    if (editingItemIndex.value === index) {
        resetNewItem()
        return
    }
    const item = form.equiposEntrada[index]
    editingItemIndex.value = index
    newItem.tipo = item.tipo
    newItem.consumibleEstado = item.consumibleEstado || 'nuevo'
    newItem.cantidad = getItemQuantity(item)
    newItem.unidades = JSON.parse(JSON.stringify(item.unidades || [item]))
    belongsToHospital.value = !item.isExternal
    acrFlowActive.value = !!item.paraEquipoMedico
}

// Add equipment
function isConsumibleLikeType(type) {
    return ['consumible', 'accesorio', 'refaccion'].includes(type)
}

function agregarItemsSinWarning() {
    const firstUnit = (newItem.unidades && newItem.unidades[0]) || {}

    const unidadesLooksLikeExpanded = (Array.isArray(newItem.unidades) && newItem.unidades.length === (newItem.cantidad || 0)
        && newItem.unidades.length > 1 && newItem.unidades.every(u => ((u.nombre || '').trim() === '' && (u.cantidad || 1) === 1)))

    const treatAsExternal = isCurrentItemExternal.value || unidadesLooksLikeExpanded

    const equipmentToAdd = {
        tipo: newItem.tipo,
        consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
        cantidad: treatAsExternal ? (newItem.cantidad || 1) : (newItem.unidades || []).reduce((s, u) => s + (Number(u && u.cantidad) || 1), 0),
        isExternal: treatAsExternal,
        unidades: treatAsExternal ? [ { ...firstUnit, cantidad: newItem.cantidad || 1 } ] : newItem.unidades.map(u => ({ ...u, cantidad: u.cantidad || 1 })),
        paraEquipoMedico: acrFlowActive.value,
        descripcion: firstUnit.descripcion || firstUnit.nombre || '',
        marca: firstUnit.marca || '',
        modelo: firstUnit.modelo || '',
        serie: firstUnit.serie || '',
        lote: firstUnit.lote || '',
        referencia: firstUnit.referencia || '',
        referenciaEquipo: firstUnit.referenciaEquipo || '',
        ubicacion: firstUnit.ubicacion || '',
        origenBien: firstUnit.origenBien || '',
        claveHRAEI: firstUnit.claveHRAEI || firstUnit.claveHraei || '',
        noInventario: firstUnit.noInventario || ''
    }

    if (isEditingItem.value) {
        form.equiposEntrada[editingItemIndex.value] = equipmentToAdd
        notifier.success('Equipo actualizado')
    } else {
        form.equiposEntrada.push(equipmentToAdd)
        notifier.success('Equipo(s) agregado(s)')
    }
    
    // Si es un bien interno, mostramos feedback en la card antes de resetear
    if (belongsToHospital.value === true) {
        cardSuccessState.value = true
        setTimeout(() => {
            cardSuccessState.value = false
            acrFlowActive.value = false
            resetNewItem()
        }, 1500)
    } else {
        acrFlowActive.value = false
        resetNewItem()
    }
}

async function agregarItem() {
    if (!canAddItem.value) {
        notifier.error('Completa los campos obligatorios')
        return
    }

    const firstUnitWithKey = newItem.unidades.find(u => u.serie?.trim() || u.claveHRAEI?.trim() || u.claveHraei?.trim())
    const isValidInventory = (newItem.tipo === 'equipo-medico' || isConsumibleLikeType(newItem.tipo)) && belongsToHospital.value === true
    const searchTerms = newItem.unidades.reduce((acc, u) => {
        if (u.serie?.trim()) acc.push(u.serie.trim())
        const c = u.claveHRAEI || u.claveHraei
        if (c?.trim()) acc.push(c.trim())
        return acc
    }, [])

    if (firstUnitWithKey && newItem.tipo === 'equipo-medico' && isValidInventory) {
        isVerifyingStatus.value = true
        getEquipmentStatus(searchTerms).then(async (statusData) => {
            let equipmentStatus = null
            let matchedTerm = null
            
            for (const term of searchTerms) {
                if (statusData[term] && statusData[term].status && statusData[term].status !== 'unknown') {
                    equipmentStatus = statusData[term]
                    matchedTerm = term
                    break
                }
            }
            
            if (equipmentStatus) {
                const { analyzeEquipmentStatus } = await import('@/composables/useEquipmentWarnings.js')
                const warnings = analyzeEquipmentStatus(equipmentStatus, matchedTerm)
                const highSeverityWarnings = warnings.filter(w => w.severity === 'high' && w.allowOverride)
                
                if (highSeverityWarnings.length > 0) {
                    const itemsToAdd = isCurrentItemExternal.value
                        ? newItem.unidades
                            .filter(u => (u.nombre || u.descripcion)?.trim())
                            .slice(0, 1)
                            .map(u => ({
                                tipo: newItem.tipo,
                                consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
                                cantidad: newItem.cantidad || 1,
                                unidades: [{ ...u, cantidad: newItem.cantidad || 1 }],
                                nombre: u.nombre || u.descripcion || '',
                                descripcion: u.descripcion || u.nombre || '',
                                marca: u.marca || '',
                                modelo: u.modelo || '',
                                lote: u.lote,
                                serie: u.serie,
                                referencia: u.referencia,
                                referenciaEquipo: u.referenciaEquipo || '',
                                ubicacion: u.ubicacion,
                                equipoAsociado: u.equipoAsociado || '',
                                serieEquipoAsociado: u.serieEquipoAsociado || '',
                                origenBien: u.origenBien || '',
                                claveHRAEI: u.claveHRAEI || u.claveHraei || '',
                                noInventario: u.noInventario || '',
                                isExternal: true
                            }))
                        : newItem.unidades
                            .filter(u => (u.nombre || u.descripcion)?.trim())
                            .map(u => ({
                                tipo: newItem.tipo,
                                consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
                                cantidad: Math.max(1, Number(u.cantidad) || 1),
                                unidades: [{ ...u, cantidad: Math.max(1, Number(u.cantidad) || 1) }],
                                nombre: u.nombre || u.descripcion || '',
                                descripcion: u.descripcion || u.nombre || '',
                                marca: u.marca || '',
                                modelo: u.modelo || '',
                                lote: u.lote,
                                serie: u.serie,
                                referencia: u.referencia,
                                referenciaEquipo: u.referenciaEquipo || '',
                                ubicacion: u.ubicacion,
                                equipoAsociado: u.equipoAsociado || '',
                                serieEquipoAsociado: u.serieEquipoAsociado || '',
                                origenBien: u.origenBien || '',
                                claveHRAEI: u.claveHRAEI || u.claveHraei || '',
                                noInventario: u.noInventario || '',
                                isExternal: false
                            }))
                    
                    pendingEquipment.value = { items: itemsToAdd, isMultiple: true }
                    equipmentWarnings.value = warnings
                    showWarningModal.value = true
                    return
                }
            }
            
            agregarItemsSinWarning()
        }).catch(err => {
            console.warn('[OpEntradaNew] Error verificando estado:', err)
            agregarItemsSinWarning()
        }).finally(() => {
            isVerifyingStatus.value = false
        })
    } else {
        agregarItemsSinWarning()
    }
}

// Confirmar añadir equipo con advertencias
function confirmAddWithWarnings() {
    if (pendingEquipment.value) {
        if (isEditingItem.value) {
            form.equiposEntrada[editingItemIndex.value] = pendingEquipment.value
        } else {
            form.equiposEntrada.push(pendingEquipment.value)
        }
        acrFlowActive.value = false
        notifier.success('Equipo(s) agregado(s) pese a las advertencias')
        pendingEquipment.value = null
        resetNewItem()
    }
    showWarningModal.value = false
}

// Composable para confirmación de cierre
const { confirmAndClose } = useCloseConfirmation({
    title: '¿Deseas salir de la creación de orden de entrada?',
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
    editingItemIndex.value = -1
    newItem.tipo = ''
    newItem.cantidad = 1
    newItem.consumibleEstado = 'nuevo'
    newItem.descripcion = ''
    newItem.marca = ''
    newItem.modelo = ''
    newItem.serie = ''
    newItem.ubicacion = ''
    newItem.claveHRAEI = ''
    newItem.noInventario = ''
    newItem.unidades = []
    newItem.isBlank = false
    belongsToHospital.value = null
    isVerifyingStatus.value = false
}

function buildBlankItemForType(tipo) {
    const blankUnit = createEmptyUnit()
    return {
        tipo,
        isBlank: true,
        consumibleEstado: isConsumibleLikeType(tipo) ? 'nuevo' : null,
        cantidad: 1,
        isExternal: isCurrentItemExternal.value,
        descripcion: '',
        marca: '',
        modelo: '',
        lote: '',
        serie: '',
        referencia: '',
        referenciaEquipo: '',
        noInventario: '',
        ubicacion: '',
        equipoAsociado: '',
        serieEquipoAsociado: '',
        origenBien: '',
        claveHRAEI: '',
        unidades: [blankUnit]
    }
}

// Agregar item en blanco editable
function agregarItemBlanco() {
    if (!newItem.tipo) {
        notifier.error('Selecciona primero un tipo de item')
        return
    }

    newItem.unidades = [createEmptyUnit()]
    newItem.cantidad = 1
    newItem.consumibleEstado = isConsumibleLikeType(newItem.tipo) ? 'nuevo' : ''
    newItem.isBlank = true
    editingItemIndex.value = -1
    notifier.info('Formulario listo para llenar item en blanco')
}

// Agregar item en blanco con tipo específico (desde el modal)
function agregarItemBlancoConTipo(tipo) {
    newItem.tipo = tipo
    newItem.unidades = [createEmptyUnit()]
    newItem.cantidad = 1
    newItem.consumibleEstado = isConsumibleLikeType(tipo) ? 'nuevo' : ''
    newItem.isBlank = true
    editingItemIndex.value = -1
    showBlankItemModal.value = false
    notifier.info('Formulario listo para llenar item en blanco')
}

// Observaciones image helper (copied from other operation views)
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

const removeObservacionesImg = () => {
    form.observacionesImg = null
}

function eliminarItem(item) {
    const idx = form.equiposEntrada.indexOf(item)
    if (idx > -1) {
        form.equiposEntrada.splice(idx, 1)
        notifier.info('Equipo eliminado')
    }
}

// Timer functions - automatic, no manual control
function startLiveTimer() {
    // Update immediately
    updateLiveTime()

    // Then update every second
    timerInterval = setInterval(() => {
        updateLiveTime()
    }, 1000)
}

function updateLiveTime() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    liveTimeDisplay.value = `${hours}:${minutes}:${seconds}`
    // Also update horaTermino for form submission (without seconds)
    form.horaTermino = `${hours}:${minutes}`
}

function stopLiveTimer() {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
    // Set final end time
    updateLiveTime()
}

// Handle suggestion selection for equipment
function handleSuggestionSelect(suggestion, unidad, field) {
    console.log('[handleSuggestionSelect] Called with:', { suggestion, field, unidad })
    
    // Solo pasar 2 parámetros a fillUnitFromSuggestion
    // La función llenará TODOS los campos del objeto unidad
    if (fillUnitFromSuggestion && typeof fillUnitFromSuggestion === 'function') {
        fillUnitFromSuggestion(unidad, suggestion)
        console.log('[handleSuggestionSelect] After fillUnitFromSuggestion:', unidad)
    } else {
        // Fallback manual fill if composable function not available
        console.warn('[handleSuggestionSelect] fillUnitFromSuggestion not available, using fallback')
        if (suggestion.nombre) unidad.nombre = suggestion.nombre
        if (suggestion.marca) unidad.marca = suggestion.marca
        if (suggestion.modelo) unidad.modelo = suggestion.modelo
        if (suggestion.serie) unidad.serie = suggestion.serie
        if (suggestion.ubicacion) unidad.ubicacion = suggestion.ubicacion
        if (suggestion.claveHRAEI) unidad.claveHRAEI = suggestion.claveHRAEI
        if (suggestion.lote) unidad.lote = suggestion.lote
        if (suggestion.referencia) unidad.referencia = suggestion.referencia
        if (suggestion.referenciaEquipo) unidad.referenciaEquipo = suggestion.referenciaEquipo
        if (suggestion.noInventario) unidad.noInventario = suggestion.noInventario
        if (suggestion.claveCNIS) unidad.claveCNIS = suggestion.claveCNIS
        console.log('[handleSuggestionSelect] After fallback:', unidad)
    }
}

// Close PDF preview modal
function closePdfPreview() {
    showPdfPreview.value = false
    document.body.classList.remove('pdf-preview-active')
    if (pdfPreviewUrl.value) {
        URL.revokeObjectURL(pdfPreviewUrl.value)
        pdfPreviewUrl.value = ''
    }
}

// Motivo select functions
function toggleMotivoDropdown() {
    showMotivoDropdown.value = !showMotivoDropdown.value
    if (showMotivoDropdown.value) {
        nextTick(() => {
            motivoSearchRef.value?.focus()
        })
    }
}

function closeMotivoDropdown() {
    showMotivoDropdown.value = false
    motivoSearchQuery.value = ''
}

function selectMotivo(option) {
    form.motivoEntrada = option.value
    if (option.value !== 'otro') {
        form.otroMotivo = ''
    }
    closeMotivoDropdown()
}

function assignAsOtherMotivo() {
    form.motivoEntrada = 'otro'
    form.otroMotivo = motivoSearchQuery.value.trim()
    closeMotivoDropdown()
    notifier.success(`Motivo asignado: "${form.otroMotivo}"`)
}

// Click outside handler for motivo dropdown
function handleClickOutsideMotivo(event) {
    if (motivoSelectRef.value && !motivoSelectRef.value.contains(event.target)) {
        closeMotivoDropdown()
    }
}

// Navigation
function onBack() {
    router.back()
}

function onStepChange(step) {
    currentStep.value = step
}

// Preview PDF - Opens in modal with iframe
async function onPreviewPDF() {

    loadingPreview.value = true

    try {
        const payload = {
            nombreSolicitante: form.nombreSolicitante,
            servicio: form.servicio,
            especialidad: form.especialidad,
            folio: form.folio || 'PREVIEW',
            fecha: form.fecha,
            horaInicio: form.horaInicio,
            horaTermino: form.horaTermino,
            motivoEntrada: form.motivoEntrada,
            otroMotivo: form.otroMotivo,
            descripcion: form.descripcion,
            observaciones: form.observaciones,
            observacionesImg: form.observacionesImg,
            nombreIngeniero: form.nombreIngeniero,
            folioAsociado: form.folioAsociado,
            equiposEntrada: (form.equiposEntrada || []).map(item => {
                const _serieVal = item.serie || item.N || '';
                const _modeloVal = item.modelo || item.MODELO || '';
                const _marcaVal = item.marca || item.MARCA || '';
                const safeSerie = (_serieVal && String(_serieVal).trim().toUpperCase() === 'N/A') ? '' : _serieVal;
                const safeModelo = (_modeloVal && String(_modeloVal).trim().toUpperCase() === 'N/A') ? '' : _modeloVal;
                const safeMarca = (_marcaVal && String(_marcaVal).trim().toUpperCase() === 'N/A') ? '' : _marcaVal;
                return {
                    ...item,
                    itemId: `${item.claveHRAEI || 'SIN_CLAVE'}|${safeSerie}|${safeModelo}|${safeMarca}`,
                    isExternal: item.isExternal ?? item.is_external ?? false
                }
            }),
            signatures: form.signatures,
            extraFields: form.extraFields,
            forceSinglePage: form.forceSinglePage,
            preview: true
        }

        const res = await authedFetch('/api/ops/entrada-pdf', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            const blob = await res.blob()
            // Revoke previous URL if exists
            if (pdfPreviewUrl.value) {
                URL.revokeObjectURL(pdfPreviewUrl.value)
            }
            pdfPreviewUrl.value = URL.createObjectURL(blob)
            showPdfPreview.value = true
            document.body.classList.add('pdf-preview-active')
            notifier.success('Vista previa generada')
            } else {
             throw new Error('Error al generar PDF')
            }
            } catch (err) {
            console.error('Error preview:', err)
            notifier.error('No se pudo generar la vista previa')
            } finally {
            loadingPreview.value = false
    }
}

// Submit
async function onSubmit() {
    if (!isValid.value) {
        notifier.error('Por favor completa todos los campos requeridos')
        return
    }

    // Stop live timer and set final time
    stopLiveTimer()

    loading.value = true

    try {
        const payload = {
            nombreSolicitante: form.nombreSolicitante,
            servicio: form.servicio,
            especialidad: form.especialidad,
            folio: form.folio,
                folioAsociado: form.folioAsociado,
            fecha: form.fecha,
            horaInicio: form.horaInicio,
            horaTermino: form.horaTermino,
            motivoEntrada: form.motivoEntrada,
            otroMotivo: form.otroMotivo,
            descripcion: form.descripcion,
            observaciones: form.observaciones,
            observacionesImg: form.observacionesImg,
            nombreIngeniero: form.nombreIngeniero,
            equiposEntrada: (form.equiposEntrada || []).map(item => {
                const normalizedItem = buildSubmitItem(item)
                const _serieVal = normalizedItem.serie || normalizedItem.N || '';
                const _modeloVal = normalizedItem.modelo || normalizedItem.MODELO || '';
                const _marcaVal = normalizedItem.marca || normalizedItem.MARCA || '';
                const safeSerie = (_serieVal && String(_serieVal).trim().toUpperCase() === 'N/A') ? '' : _serieVal;
                const safeModelo = (_modeloVal && String(_modeloVal).trim().toUpperCase() === 'N/A') ? '' : _modeloVal;
                const safeMarca = (_marcaVal && String(_marcaVal).trim().toUpperCase() === 'N/A') ? '' : _marcaVal;
                return {
                    ...normalizedItem,
                    itemId: `${normalizedItem.claveHRAEI || 'SIN_CLAVE'}|${safeSerie}|${safeModelo}|${safeMarca}`
                }
            }),
            agregarAlInventario: form.agregarAlInventario,
            signatures: form.signatures,
            extraFields: form.extraFields
        }

        const endpoint = props.modo === 'editar'
            ? `/api/ops/entrada/${props.ordenId}`
            : '/api/ops/entrada'

        const method = props.modo === 'editar' ? 'PUT' : 'POST'

        const res = await authedFetch(endpoint, {
            method,
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            const responseData = await res.json()
            const folioGuardado = responseData.folio || form.folio
            console.log('[OpEntradaNew] Save response', {
                folio: folioGuardado,
                inventoryUpdatesCount: Array.isArray(responseData.inventoryUpdates) ? responseData.inventoryUpdates.length : 0,
                serverMessage: responseData.msg
            })

            // Mostrar mensaje provisto por el servidor (incluye tipo y folio cuando aplica)
            notifier.success(responseData.msg || (props.modo === 'editar' ? 'Orden actualizada' : 'Orden guardada'))

            if (props.modo !== 'editar') {
                clearDraft()
            }

            // Enviar notificación al sistema
            if (props.modo !== 'editar') {
                notificationStore.notifyOrderCreated('entrada', folioGuardado, form.nombreSolicitante)
            }

            emit('actualizado')

            // Generar y descargar PDF
            try {
                const query = form.forceSinglePage ? '?forceSinglePage=true' : ''
                const pdfRes = await authedFetch(`/api/ops/entrada/${encodeURIComponent(folioGuardado)}/pdfs/generated/download${query}`)
                if (!pdfRes.ok) {
                    throw new Error('No se pudo descargar el PDF generado')
                }
                const blob = await pdfRes.blob()
                // Asegurar que el blob tenga el tipo MIME correcto
                const pdfBlob = new Blob([blob], { type: 'application/pdf' })
                const url = window.URL.createObjectURL(pdfBlob)
                
                const link = document.createElement('a')
                link.href = url
                link.download = `entrada_${folioGuardado || 'sin_folio'}.pdf`
                link.style.display = 'none'
                
                document.body.appendChild(link)
                link.click()
                
                // Pequeño retraso antes de limpiar para asegurar que el navegador inicie la descarga
                setTimeout(() => {
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                }, 500)
                
                notifier.success('PDF descargado exitosamente')
            } catch (pdfErr) {
                console.warn('Error descargando PDF:', pdfErr)
                notifier.error('La orden se guardó, pero falló la descarga del PDF')
            }

            // Redirigir al order management o cerrar modal
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

// Responsive check
function checkMobileView() {
    isMobileView.value = window.innerWidth < 1200
}

// Auto-assign date only (hora inicio is manual, hora termino is live timer)
function initializeDateAndTime() {
    if (fechaAutomatica.value) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        form.fechaISO = `${year}-${month}-${day}`
        form.fecha = `${day}/${month}/${year}`
    }

    // horaInicio is NOT auto-assigned - user must enter it
    // horaTermino will be set by the live timer
}

function onFechaAutoChange() {
    if (fechaAutomatica.value) {
        // Switched back to automatic: restore today's date
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        form.fechaISO = `${year}-${month}-${day}`
        form.fecha = `${day}/${month}/${year}`
    }
}

function onFechaManualInput(e) {
    const iso = e.target.value // YYYY-MM-DD
    if (!iso) return
    form.fechaISO = iso
    const [y, m, d] = iso.split('-')
    form.fecha = `${d}/${m}/${y}`
}

function formatDisplayDate(iso) {
    if (!iso) return '--/--/----'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

// Auto-generate folio for new orders
async function generateFolioAutomatically() {
    try {
        const res = await authedFetch('/api/ops/generate-folio/entrada')
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

function ensureAutoFields() {
    if (props.modo === 'editar' && props.ordenId) return
    if (!form.fecha || !form.fechaISO) initializeDateAndTime()
    if (!form.folio && !folioRequested) {
        folioRequested = true
        generateFolioAutomatically()
    }
    if (!timerInterval) startLiveTimer()
}

async function ensureInventorySuggestionsForCurrentType(tipo) {
    if (belongsToHospital.value !== true) return
    if (!tipo) return

    if (tipo === 'equipo-medico' || tipo === 'mobiliario') {
        await fetchEquipoMedicoSuggestions()
        return
    }

    await fetchAllInventorySuggestions()
    await fetchInsumosRefaccionesSuggestions()
}

const forceRefreshInventory = async () => {
    try {
        if (loadingInventory.value) return
        notifier.info('Sincronizando inventario...')
        
        if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
            await refreshBiomedicalEquipmentCatalog()
            await fetchEquipoMedicoSuggestions()
        } else {
            await fetchAllInventorySuggestions()
            await fetchInsumosRefaccionesSuggestions()
        }
        
        notifier.success('Inventario actualizado correctamente')
    } catch (err) {
        notifier.error('Error al sincronizar inventario')
        console.error(err)
    }
}

// Lifecycle
onMounted(async () => {
    fetchUsers() // Pre-fetch users for suggestions
    let draftLoaded = false

    // Attempt to restore draft: don't rely solely on sessionState
    // Some drafts may be saved without sessionState (direct saves)
    if (draftEnabled.value) {
        try {
            const draft = loadDraft()
            if (draft && draft.form) {
                // Aplicar draft solo si tiene datos válidos en el formulario
                if (applyDraft(draft)) {
                    draftLoaded = true
                    console.log('[OpEntradaNew] Draft restored successfully')
                    await nextTick()
                    try { wizardRef.value?.goToStep(currentStep.value) } catch (e) {}
                    // Solo limpiar sessionState después de restauración exitosa
                    try { clearSessionState() } catch (e) {}
                    ensureAutoFields()
                }
            }
        } catch (e) {
            console.warn('[OpEntradaNew] Error restoring draft:', e)
            // No fallar si hay error - continuar con el formulario vacío
        }
    }

    if (!draftLoaded || !form.nombreIngeniero) {
        forceAuthenticatedEngineerName()
    }
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    document.addEventListener('click', handleClickOutsideMotivo)

    // Pre-llenar formulario si se proporcionan initialItems (para equipos externos)
    if (!draftLoaded && props.initialItems && Array.isArray(props.initialItems) && props.initialItems.length > 0) {
        console.debug('[OpEntradaNew] Pre-llenando formulario con initialItems:', props.initialItems)
        form.equiposEntrada = props.initialItems.map(item => ({
            tipo: item.tipo || 'equipo-medico',
            cantidad: item.cantidad || 1,
            descripcion: item.descripcion || item.nombre || '',
            marca: item.marca || '',
            modelo: item.modelo || '',
            serie: item.serie || '',
            lote: item.lote || '',
            referencia: item.referencia || '',
            ubicacion: item.ubicacion || '',
            claveHRAEI: item.claveHRAEI || '',
            isExternal: item.isExternal ?? item.is_external ?? true,
            sourceOrder: item.sourceOrder || null
        }))
    }
    // Si los items iniciales contienen flags externos, colocar el selector en "No, es externo"
    try {
        const anyExternal = Array.isArray(props.initialItems) && props.initialItems.some(it => Boolean(it?.isExternal ?? it?.is_external ?? false))
        if (!draftLoaded && anyExternal) belongsToHospital.value = false
    } catch (e) {
        console.debug('[OpEntradaNew] Error comprobando externalidad en initialItems:', e)
    }

    // Auto-assign date & folio for new orders, load order for editing
    if (props.modo === 'editar' && props.ordenId) {
        // Cargar la orden existente cuando se monta en modo edición
        loadOrden()
    } else {
        ensureAutoFields()
    }

    // Re-intentar aplicar borrador si se dispara el evento global (por ejemplo, tras navegación/restore)
    const handleRestoreApplyDrafts = async () => {
        if (!draftEnabled.value) return
        try {
            const draft = loadDraft()
            if (draft && draft.form) {
                if (!draftLoaded) {
                    if (applyDraft(draft)) {
                        draftLoaded = true
                        console.log('[OpEntradaNew] Draft restored via restore:applyDrafts')
                        try { window.dispatchEvent(new CustomEvent('wizard:draft:applied', { detail: { storageKey } })) } catch (e) {}
                        await nextTick()
                        try { wizardRef.value?.goToStep(currentStep.value) } catch (e) {}
                        try { clearSessionState() } catch (e) {}
                        ensureAutoFields()
                    }
                }
            }
        } catch (e) {
            console.warn('[OpEntradaNew] restore:applyDrafts handler failed', e)
        }
    }
    try { window.addEventListener('restore:applyDrafts', handleRestoreApplyDrafts) } catch {}
    window.__opEntrada_restoreHandler = handleRestoreApplyDrafts
    try { handleRestoreApplyDrafts() } catch (e) { console.warn('[OpEntradaNew] initial restore attempt failed', e) }
})

// Lazy load equipos médicos cuando el usuario selecciona ese tipo
watch(() => newItem.tipo, async (nuevoTipo) => {
    try {
        await ensureInventorySuggestionsForCurrentType(nuevoTipo)
    } catch (err) {
        console.error('[OpEntradaNew] Error loading inventory suggestions:', err)
    }
})

watch(() => belongsToHospital.value, async (isHospitalItem) => {
    if (isHospitalItem !== true) {
        clearSuggestions()
        return
    }
    try {
        await ensureInventorySuggestionsForCurrentType(newItem.tipo)
        // Forzar sincronización de sugerencias ahora que el limitante "externo" se ha removido
    } catch (err) {
        console.error('[OpEntradaNew] Error loading inventory suggestions after ownership change:', err)
    }
})

// reload whenever the passed ID changes (modal re‑opens or user selects another order)
watch(() => props.ordenId, (newId) => {
    if (props.modo === 'editar' && newId) {
        loadOrden()
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobileView)
    document.removeEventListener('click', handleClickOutsideMotivo)
    // Cleanup timer
    if (timerInterval) {
        clearInterval(timerInterval)
    }
    // Cleanup PDF preview URL
    if (pdfPreviewUrl.value) {
        URL.revokeObjectURL(pdfPreviewUrl.value)
    }
    try { if (window.__opEntrada_restoreHandler) { window.removeEventListener('restore:applyDrafts', window.__opEntrada_restoreHandler); delete window.__opEntrada_restoreHandler } } catch {}
    try { if (window.__opEntrada_flushHandler) { window.removeEventListener('wizard:draft:flush', window.__opEntrada_flushHandler); delete window.__opEntrada_flushHandler } } catch {}
})

async function loadOrden() {
    try {
        const res = await authedFetch(`/api/ops/entrada/${props.ordenId}`)
        if (res.ok) {
            const data = await res.json()
            // backend returns { ok:true, orden: {...}, items: [...] }
            if (data && data.orden) {
                // Mapear campos de snake_case a camelCase para compatibilidad con el formulario
                const mappedOrden = mapSnakeToCamel(data.orden)
                Object.assign(form, mappedOrden)

                // Re-poblar firmas desde columnas planas si existen
                const sigs = JSON.parse(JSON.stringify(DEFAULT_SIGNATURES))
                for (const s of sigs) {
                    const colName = `firma_${s.key}_name`
                    const fixedCol = `firma_${s.key}_fixed`
                    const rawName = data.orden[colName]
                    const hasRealName = rawName && rawName !== 'PENDING'

                    // Siempre mostrar el bloque de firma (nameKnown=true),
                    // solo rellenar el nombre si hay uno real (distinto de PENDING).
                    // Esto asegura que el espacio en blanco para firmar a mano
                    // siempre aparezca en el PDF.
                    s.nameKnown = true
                    s.name = hasRealName ? rawName : ''

                    // En modo edición, permitimos reasignar firmantes (fixed = false)
                    if (props.modo === 'editar') {
                        s.fixed = false
                    } else if (data.orden[fixedCol] !== undefined) {
                        s.fixed = !!data.orden[fixedCol]
                    }
                }
                form.signatures = sigs
            }
            if (data && Array.isArray(data.items)) {
                // Mapear cada item también de snake_case a camelCase
                form.equiposEntrada = data.items.map(item => mapSnakeToCamel(item))
            }
            forceAuthenticatedEngineerName()
        }
    } catch (err) {
        console.error('Error loading order:', err)
    }
}

// Función para mapear campos de snake_case a camelCase
function mapSnakeToCamel(obj) {
    if (!obj || typeof obj !== 'object') return obj
    const result = {}
    for (const key in obj) {
        let camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        // Special case for HRAEI
        if (camelKey === 'claveHraei') camelKey = 'claveHRAEI'
        result[camelKey] = obj[key]
    }
    return result
}
</script>

<style scoped>
.op-entrada-new {
    background: #0a0f1a;
}

/* Wizard Step Layouts */
.wizard-step {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px 0;
}

/* Fields Grid */
.fields-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    grid-auto-rows: minmax(64px, auto);
    width: 100%;
    max-width: 100%;
}

.fields-grid.cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.fields-grid > * {
    min-width: 0;
    max-width: 100%;
}

/* Evitar corte de inputs en modal + sidebar durante edición */
@media (max-width: 1600px) {
    .fields-grid.cols-4 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 1360px) {
    .fields-grid.cols-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.fields-grid .span-full {
    grid-column: 1 / -1;
}

.fields-grid .span-1 {
    grid-column: span 1;
}

.fields-grid .span-2 {
    grid-column: span 2;
}

@media (max-width: 768px) {

    .fields-grid,
    .fields-grid.cols-4 {
        grid-template-columns: 1fr;
    }
}

/* Field Wrapper (for native components) */
.field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 68px;
    min-width: 0;
}

.field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
}

.field-label .required {
    color: #f87171;
}

/* Equipment Type Grid */
.equipment-type-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 24px;
}

@media (max-width: 900px) {
    .equipment-type-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 500px) {
    .equipment-type-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.25s;
}

.units-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
}
.btn-clear-all-searchable-filters {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e2e8f0;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
.btn-clear-all-searchable-filters:hover {
    background: rgba(248,113,113,0.12);
    color: #fff;
}

.type-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.type-card.is-selected {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
}

.type-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--type-color, #3b82f6) 15%, transparent);
    color: var(--type-color, #3b82f6);
}

.type-icon svg {
    width: 24px;
    height: 24px;
}

.type-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
}

/* Hospital Selection */
.hospital-selection {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: sticky;
    top: 12px;
    z-index: 8;
    background: transparent;
}

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

.feedback-box svg {
    flex-shrink: 0;
    margin-top: 2px;
}

.feedback-text p {
    margin: 0;
    line-height: 1.4;
}

/* Equipment Form */
.equipment-form {
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.form-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #e2e8f0;
}

.accessory-note {
    margin: 12px 0 8px 0;
    padding: 10px 12px;
    background: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    border-radius: 8px;
    font-size: 0.85rem;
}

.quantity-control {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 4px;
}

.quantity-control button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.15s;
}

.quantity-control button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: white;
}

.quantity-control button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.quantity-value {
    min-width: 48px;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 700;
    color: #e2e8f0;
}

/* Units List */
.units-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.unit-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
}

.unit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.unit-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
}

.unit-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    cursor: pointer;
    transition: all 0.15s;
}

.unit-remove:hover {
    background: rgba(239, 68, 68, 0.2);
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

@media (max-width: 768px) {
    .unit-fields {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 500px) {
    .unit-fields {
        grid-template-columns: 1fr;
    }
}

/* Per-unit quantity styling (match OpSalida/OpResguardo) */
.quantity-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.quantity-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 12px;
    padding: 8px;
    width: fit-content;
}

.qty-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255,255,255,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.qty-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.12);
}

.qty-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.qty-input {
    width: 96px;
    min-width: 64px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.04);
    background: transparent;
    color: #e2e8f0;
    text-align: center;
    font-weight: 700;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}


/* Add Equipment Button */
.btn-add-equipment {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-add-equipment:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
}

.btn-add-equipment:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Equipment Buttons Group */
.equipment-buttons-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.equipment-buttons-group .btn-add-equipment {
    flex: 1;
    min-width: 180px;
}

/* Clear Equipment Button */
.btn-clear-equipment {
    padding: 16px 20px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    border-radius: 14px;
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
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
}

/* Items Count Badge */
.items-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
}

/* Equipment List */
.equipment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
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
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    flex-shrink: 0;
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

.consumible-state-selector {
    margin: 10px 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.consumible-state-label {
    font-size: 0.85rem;
    color: #cbd5e1;
    font-weight: 600;
}

.consumible-state-options {
    display: inline-flex;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 10px;
    overflow: hidden;
}

.consumible-state-option {
    border: none;
    background: transparent;
    color: #cbd5e1;
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
}

.consumible-state-option.active {
    background: rgba(59, 130, 246, 0.22);
    color: #bfdbfe;
}

.consumible-state-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 6px 10px;
    border-radius: 8px;
    min-width: 60px;
    text-align: center;
}

.consumible-state-badge.is-nuevo {
    background: rgba(34, 197, 94, 0.25);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #86efac;
}

.consumible-state-badge.is-usado {
    background: rgba(148, 163, 184, 0.22);
    border: 1px solid rgba(148, 163, 184, 0.4);
    color: #cbd5e1;
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
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.8rem;
    color: rgba(226, 232, 240, 0.75);
}

.item-details span {
    display: flex;
    gap: 6px;
}

.item-details strong {
    color: rgba(148, 163, 184, 0.6);
    font-weight: 500;
}

.item-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    cursor: pointer;
    transition: all 0.15s;
}

.item-remove:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(1.05);
}

/* Empty Equipment State */
.empty-equipment {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
}

.empty-equipment svg {
    margin-bottom: 20px;
    opacity: 0.3;
}

.empty-equipment h4 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
}

.empty-equipment p {
    margin: 0;
    font-size: 0.9rem;
}

/* Signatures Grid */
.signatures-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

@media (max-width: 900px) {
    .signatures-grid {
        grid-template-columns: 1fr;
    }
}

.signature-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px;
    transition: all 0.2s;
}

.signature-card.is-fixed {
    background: rgba(14, 165, 233, 0.05);
    border-color: rgba(14, 165, 233, 0.2);
}

.signature-card.has-name {
    border-color: rgba(34, 197, 94, 0.3);
}

.sig-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.sig-role {
    flex: 1;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.sig-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
}

.sig-badge.fixed {
    background: rgba(14, 165, 233, 0.2);
    color: #38bdf8;
}

.sig-badge.complete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
}

.sig-badge.pending {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
}

.sig-body {
    min-height: 60px;
}

.sig-name-display {
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
}

.sig-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.sig-question span {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
}

.sig-toggle {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 10px;
}

.sig-toggle button {
    padding: 6px 16px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.sig-toggle button.active {
    background: #3b82f6;
    color: white;
}

.sig-name-input {
    margin-top: 8px;
}

/* Preview Button */
.btn-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-preview:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
}

/* Transitions */
.slide-fade-enter-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-active {
    transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.slide-up-enter-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
    transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

/* Unit List Transitions */
.unit-list-enter-active,
.unit-list-leave-active {
    transition: all 0.3s ease;
}

.unit-list-enter-from,
.unit-list-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.unit-list-move {
    transition: transform 0.3s ease;
}

/* Equipment Item Transitions */
.equipment-item-enter-active,
.equipment-item-leave-active {
    transition: all 0.3s ease;
}

.equipment-item-enter-from,
.equipment-item-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.equipment-item-move {
    transition: transform 0.3s ease;
}

/* Auto-assigned field styles */
.auto-field-display {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    min-height: 48px;
}

.auto-field-display.live-time {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.2);
}

.auto-value {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    letter-spacing: 0.5px;
}

.auto-value.time-live {
    color: #22c55e;
    font-weight: 600;
    font-size: 1.1rem;
}

.live-indicator {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse-live 1.5s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

@keyframes pulse-live {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(0.85);
    }
}

/* Info popover styles */
.info-popover-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    margin-left: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s;
    vertical-align: middle;
}

.info-popover-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
}

.info-popover {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 2000;
    /* lift above other UI */
    max-width: 340px;
    padding: 12px 16px;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
}

.field-label {
    position: relative;
}

/* Popover transition */
.popover-fade-enter-active {
    transition: all 0.2s ease;
}

.popover-fade-leave-active {
    transition: all 0.15s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Motivo Select Custom Styles */
.motivo-select-wrapper {
    position: relative;
}

.motivo-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #fff;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
}

.motivo-trigger:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
}

.motivo-trigger.is-open {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.5);
}

.motivo-trigger .trigger-value {
    flex: 1;
    text-align: left;
}

.motivo-trigger .trigger-value.placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.motivo-trigger .trigger-chevron {
    color: rgba(255, 255, 255, 0.5);
    transition: transform 0.2s;
}

.motivo-trigger .trigger-chevron.rotated {
    transform: rotate(180deg);
}

.motivo-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 2000;
    /* ensure it's above other UI */
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.motivo-dropdown .dropdown-search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.motivo-dropdown .dropdown-search svg {
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
}

.motivo-dropdown .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 0.9rem;
    outline: none;
}

.motivo-dropdown .search-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
}

.motivo-dropdown .dropdown-options {
    max-height: 280px;
    overflow-y: auto;
    padding: 8px;
}

.motivo-dropdown .dropdown-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 14px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
}

.motivo-dropdown .dropdown-option:hover {
    background: rgba(255, 255, 255, 0.08);
}

.motivo-dropdown .dropdown-option.is-selected {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
}

.motivo-dropdown .option-check {
    color: #3b82f6;
}

/* No results and assign as other */
.dropdown-no-results {
    padding: 20px 16px;
    text-align: center;
}

.dropdown-no-results .no-results-text {
    margin: 0 0 16px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
}

.btn-assign-other {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 20px;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    color: #f59e0b;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-assign-other:hover {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.2));
    border-color: rgba(245, 158, 11, 0.5);
    transform: translateY(-1px);
}

.btn-assign-other svg {
    flex-shrink: 0;
}

/* Small assign other hint at bottom of list */
.dropdown-assign-other-hint {
    padding: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 8px;
}

.btn-assign-other-small {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px dashed rgba(245, 158, 11, 0.3);
    border-radius: 10px;
    color: #f59e0b;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-assign-other-small:hover {
    background: rgba(245, 158, 11, 0.2);
    border-style: solid;
}

/* Dropdown transition */
.dropdown-enter-active {
    transition: all 0.2s ease;
}

.dropdown-leave-active {
    transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* Slide down transition */
.slide-down-enter-active {
    transition: all 0.3s ease;
}

.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
}

.slide-down-leave-to {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
}

/* SearchableInput field styles */
.searchable-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.searchable-field .mini-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2px;
}

.searchable-field :deep(.searchable-input-wrapper) {
    width: 100%;
}

.searchable-field :deep(.searchable-input) {
    width: 100%;
    padding: 8px 12px;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    transition: all 0.2s;
}

.searchable-field :deep(.searchable-input:focus),
.searchable-field :deep(.smart-input:focus) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.5);
    outline: none;
}

.searchable-field :deep(.suggestions-dropdown),
.searchable-field :deep(.smart-dropdown) {
    max-height: 250px;
    overflow-y: auto;
    background: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.4);
    border-radius: 10px;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
    z-index: 9999;
}

.searchable-field :deep(.smart-dropdown .result-card),
.searchable-field :deep(.suggestions-dropdown .result-card) {
    border-color: rgba(148, 163, 184, 0.35);
    border-radius: 8px;
    margin-bottom: 4px;
}

.searchable-field :deep(.smart-dropdown .result-card .card-details),
.searchable-field :deep(.suggestions-dropdown .result-card .card-details) {
    font-size: 0.78rem;
    white-space: normal;
    word-wrap: break-word;
}


/* ===== REFINAMIENTO AVANZADO — FIXED ===== */
.refinement-container {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(8px);
}

.refinement-header {
    position: relative; /* evitar solapamientos por posicionado absoluto externo */
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    margin-bottom: 14px;
    padding-bottom: 14px;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
}

.refinement-status {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 0;
    justify-content: flex-end;
    width: auto;
}

.refinement-status .badge {
    white-space: nowrap;
}

.quick-add-blank {
    margin: 16px 0 12px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-add-blank-quick {
    background: rgba(100, 116, 139, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #e2e8f0;
    padding: 10px 14px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-add-blank-quick:hover {
    background: rgba(100, 116, 139, 0.25);
    border-color: rgba(148, 163, 184, 0.5);
    transform: translateY(-1px);
}

.quick-add-hint {
    color: rgba(226, 232, 240, 0.7);
    font-size: 0.85rem;
}

.type-card-blank {
    background: rgba(100, 116, 139, 0.1);
    border: 1px dashed rgba(148, 163, 184, 0.4);
}

.type-card-blank:hover {
    background: rgba(100, 116, 139, 0.2);
    border-color: rgba(148, 163, 184, 0.7);
}

.blank-item-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.blank-item-modal {
    background: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 16px;
    width: min(520px, 92vw);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.blank-item-modal .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.blank-item-modal .modal-header h3 {
    font-size: 1rem;
    color: #e2e8f0;
}

.blank-item-modal .modal-close {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
}

.blank-item-modal .modal-body {
    padding: 16px 18px 20px;
}

.blank-type-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.blank-type-btn {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.blank-type-btn:hover {
    border-color: rgba(148, 163, 184, 0.5);
    background: rgba(30, 41, 59, 0.8);
}

.blank-type-icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--type-color) 20%, transparent);
    color: var(--type-color);
}

.modal-fade-enter-active .blank-item-modal,
.modal-fade-leave-active .blank-item-modal {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from .blank-item-modal,
.modal-fade-leave-to .blank-item-modal {
    transform: translateY(10px) scale(0.98);
    opacity: 0;
}
.refinement-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
}

.refinement-icon-svg {
    min-width: 28px;
    min-height: 28px;
    color: #38bdf8;
    flex-shrink: 0;
}

.refinement-header h4 {
    margin: 0 0 2px;
    color: #f8fafc;
    font-size: 0.95rem;
    font-weight: 600;
}

.refinement-header p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.78rem;
}

.refinement-status {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;
    margin-top: 10px;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    padding-top: 10px;
    position: relative;
    z-index: 1;
}

/* ===== REFINEMENT ROW — FIXED LAYOUT ===== */
.refinement-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
    margin-bottom: 12px;
    width: 100%;
}

@media (max-width: 900px) {
    .refinement-row {
        flex-direction: column;
        align-items: stretch;
    }
    .refinement-row label,
    .refinement-row .refinement-actions {
        width: 100%;
    }
    .refinement-actions {
        justify-content: flex-start;
    }
}

.refinement-row label {
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 500;
}

.refinement-row select,
.refinement-row input {
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.9);
    color: #e2e8f0;
    font-size: 0.85rem;
    min-width: 160px;
    cursor: pointer;
    outline: none;
}

.refinement-row select:focus,
.refinement-row input:focus {
    border-color: rgba(59, 130, 246, 0.5);
}

/* ===== SEARCH BOX — FIXED POSITION FOR DROPDOWN ===== */
.search-box-wrapper {
    position: relative;
    flex: 1;
    min-width: 160px;
    max-width: 520px;
}

.search-box-wrapper input {
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.9);
    color: #e2e8f0;
    font-size: 0.85rem;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.search-box-wrapper input:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(15, 23, 42, 1);
}

.search-box-wrapper input::placeholder {
    color: rgba(148, 163, 184, 0.5);
}

/* ===== LIVE DROPDOWN — FIXED ===== */
.live-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    background: #0d1525;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1);
    z-index: 9999;
    padding: 4px;
    list-style: none;
    margin: 0;
}

.live-dropdown li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: #e2e8f0;
    font-size: 0.85rem;
    transition: background 0.15s;
}

.live-dropdown li:hover {
    background: rgba(59, 130, 246, 0.15);
/* Preferir que el dropdown nativo de select use tema oscuro */
.refinement-row select option {
    background: #0f172a;
    color: #e2e8f0;
}
    color: #93c5fd;
}

.live-dropdown li small {
    color: #64748b;
    font-size: 0.75rem;
    flex-shrink: 0;
}

/* ===== REFINEMENT ACTIONS ===== */
.refinement-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    margin-right: 10px; /* espacio extra para evitar solapamiento al final */
}

.btn-secondary:hover {
    background: rgba(148, 163, 184, 0.18);
    color: #cbd5e1;
}

.btn-with-icon .btn-icon-left {
    font-size: 1rem;
    line-height: 1;
}

.btn-icon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
}

/* ===== TOKEN CHIPS ===== */
.token-area {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 10px 0;
    min-height: 0;
}

.token-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.35);
    border-radius: 999px;
    padding: 4px 10px 4px 12px;
    font-size: 0.78rem;
    color: #93c5fd;
    font-weight: 500;
}

.token-chip button {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    transition: color 0.15s;
}

.token-chip button:hover {
    color: #f87171;
}

/* ===== SUMMARY BAR ===== */
.summary-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.82rem;
    color: #94a3b8;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.exact-badge {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.35);
    color: #4ade80;
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 0.75rem;
    font-weight: 600;
}

/* ===== RESULTS LIST — FIXED ===== */
.results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 2px;
}

.results-list::-webkit-scrollbar {
    width: 4px;
}

.results-list::-webkit-scrollbar-track {
    background: transparent;
}

.results-list::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 4px;
}

.result-item {
    padding: 14px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.8);
    transition: border-color 0.2s, transform 0.15s;
}

.result-item:hover {
    border-color: rgba(59, 130, 246, 0.45);
    transform: translateY(-1px);
}

.result-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
}

.result-top strong {
    color: #f1f5f9;
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.3;
}

.result-top small {
    color: #64748b;
    font-size: 0.72rem;
    flex-shrink: 0;
    text-align: right;
}

/* ===== RESULT DATA — FIXED GRID ===== */
.result-data {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px 10px;
    margin-bottom: 10px;
    font-size: 0.83rem;
    color: #dbeafe;
}

.field-row {
    display: flex;
    align-items: center;
    gap: 5px;
}

.field-label {
    font-weight: 600;
    color: #dbeafe;
}

.result-data span {
    background: rgba(148, 163, 184, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 7px;
    padding: 2px 6px;
}

/* ===== RESULT EXTRA CONTROLS — FIXED ===== */
.result-extra-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.result-extra-controls label {
    color: #cbd5e1;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.qty-control {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.9);
}

.qty-control button {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
}

.qty-control button:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
}

.qty-control span {
    min-width: 28px;
    text-align: center;
    color: #e2e8f0;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0 4px;
}

.result-extra-controls select {
    padding: 5px 8px;
    border-radius: 7px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.9);
    color: #e2e8f0;
    font-size: 0.8rem;
    cursor: pointer;
    outline: none;
}

.descuento-info {
    color: #34d399;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.3);
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 0.75rem;
    font-weight: 600;
}

/* ... (rest remains as already present) */
.refinement-container .result-data {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 10px;
    font-size: 0.83rem;
    color: #dbeafe;
}
.refinement-container .field-row {
    display: flex;
    gap: 6px;
    align-items: center;
}
.refinement-container .field-label {
    font-weight: 600;
    color: #dbeafe;
}
.refinement-container .result-data span {
    background: rgba(148, 163, 184, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 7px;
    padding: 2px 6px;
}
.refinement-container .result-extra-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
}
.refinement-container .result-extra-controls label {
    color: #cbd5e1;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.refinement-container .qty-control {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 6px;
    padding: 0 6px;
    background: rgba(15, 23, 42, 0.75);
}
.refinement-container .qty-control button {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
}
.refinement-container .qty-control span {
    min-width: 20px;
    text-align: center;
    color: #fff;
}
.refinement-container .result-extra-controls select {
    border-radius: 6px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(15, 23, 42, 0.9);
    color: #fff;
    padding: 5px 8px;
}
.refinement-container .descuento-info {
    color: #34d399;
    background: rgba(52, 211, 153, 0.14);
    border: 1px solid rgba(52, 211, 153, 0.4);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 0.78rem;
}
.refinement-container .btn-select-item {
    border: none;
    background: #10b981;
    color: #fff;
    border-radius: 8px;
    padding: 7px 10px;
    cursor: pointer;
}
.refinement-container .btn-select-item:hover {
    background: #059669;
}

.refinement-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    margin-bottom: 12px;
    padding-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;
}

.refinement-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 auto;
    min-width: 0;
}

.refinement-title-wrap > div {
    min-width: 0;
}

.refinement-icon {
    display: grid;
    place-items: center;
    min-width: 35px;
    min-height: 35px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.2);
    color: #22d3ee;
    font-size: 1.1rem;
}

.refinement-status {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    justify-content: flex-end;
    min-width: 220px;
    z-index: 1;
    margin-top: 6px;
    padding-left: 10px;
}

.btn-secondary {
    margin-right: 20px;
    padding: 12px 22px;
    border-radius: 14px;
    font-size: 0.9rem;
}

.btn-primary.btn-with-icon {
    padding: 11px 18px;
    border-radius: 12px;
    font-size: 0.88rem;
}

.refinement-header h4 {
    margin: 0;
    color: #f8fafc;
    font-size: 1.05rem;
}

.refinement-header p {
    margin: 2px 0 0;
    color: #cbd5e1;
    font-size: 0.83rem;
    letter-spacing: 0.2px;
}

.refinement-status {
    display: flex;
    gap: 8px;
    align-items: center;
}

.badge {
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
}

.badge-info {
    color: #0ea5e9;
    background: rgba(14, 165, 233, 0.15);
    border: 1px solid rgba(14, 165, 233, 0.35);
}

.badge-success {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.13);
    border: 1px solid rgba(34, 197, 94, 0.35);
}

.refinement-container .no-results {
    margin: 8px 0;
    padding: 10px 14px;
    background: rgba(148, 163, 184, 0.15);
    border: 1px dashed rgba(148, 163, 184, 0.6);
    border-radius: 9px;
    color: #e2e8f0;
    font-size: 0.86rem;
    text-align: center;
}
.refinement-container .no-results small {
    display: block;
    color: #94a3b8;
    margin-top: 4px;
}
.refinement-container .live-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    max-width: 520px;
    max-height: 135px;
    overflow-y: auto;
    border: 1px solid rgba(148, 163, 184, 0.4);
    border-radius: 10px;
    background: #0f172a;
    box-shadow: 0 20px 40px rgba(0,0,0,0.35);
    z-index: 9999;
}
.refinement-container .live-dropdown li {
    min-height: 30px;
    padding: 6px 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #e2e8f0;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
}
.refinement-container .live-dropdown li:hover {
    background: rgba(148, 163, 184, 0.15);
}
.refinement-container .live-dropdown li:hover {
    background: rgba(148, 163, 184, 0.15);
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

.engineer-select {
    width: 100%;
    padding: 10px 14px;
    font-size: 0.9rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #e2e8f0;
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    background-size: 18px;
}

.engineer-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.engineer-select option {
    background: #1e293b;
    color: #fff;
    padding: 10px;
}

/* PDF Preview Modal */
.pdf-preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9997;
    padding: 24px;
}

.pdf-preview-modal {
    width: 100%;
    max-width: 1000px;
    height: 90vh;
    background: #1a1f2e;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.pdf-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.pdf-preview-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #fff;
}

.pdf-preview-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-open-external {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    transition: all 0.2s;
    text-decoration: none;
}

.btn-open-external:hover {
    background: rgba(59, 130, 246, 0.25);
}

.btn-close-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-close-preview:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.pdf-preview-body {
    flex: 1;
    padding: 16px;
    min-height: 0;
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
    background: #fff;
}

/* Modal Transitions */
.modal-fade-enter-active {
    transition: all 0.3s ease;
}

.modal-fade-leave-active {
    transition: all 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0; 
}

.modal-fade-enter-from .pdf-preview-modal,
.modal-fade-leave-to .pdf-preview-modal {
    transform: scale(0.95) translateY(20px);
}

/* Button spinner */
.btn-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive adjustments for PDF modal */
@media (max-width: 768px) {
    .pdf-preview-overlay {
        padding: 12px;
    }

    .pdf-preview-modal {
        height: 85vh;
        border-radius: 16px;
    }

    .pdf-preview-header {
        padding: 12px 16px;
    }

    .pdf-preview-body {
        padding: 12px;
    }
}

/* ===== Modal ACR (Accesorio/Consumible/Refacción para Equipo Médico) ===== */
.acr-modal-compact { max-width: 420px; }

.acr-modal-title span {
    font-size: 0.98rem;
    font-weight: 600;
    color: rgba(230,235,245,0.92);
}

.acr-hint {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.45);
    margin: 0 0 14px;
    text-align: center;
    line-height: 1.5;
}

.type-card-acr { border-color: rgba(6, 182, 212, 0.3) !important; }
.type-card-acr:hover { border-color: rgba(6, 182, 212, 0.6) !important; }
.type-card-acr.is-selected { border-color: rgba(6, 182, 212, 0.8) !important; background: rgba(6, 182, 212, 0.12) !important; }

.acr-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.acr-modal {
    background: linear-gradient(135deg, rgba(20, 24, 40, 0.98) 0%, rgba(15, 20, 35, 0.98) 100%);
    border: 1px solid rgba(6, 182, 212, 0.25);
    border-radius: 20px;
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.04);
}

.acr-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
}

.acr-modal-title {
    display: flex;
    align-items: center;
    gap: 14px;
    color: rgba(6, 182, 212, 0.9);
}

.acr-modal-title h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(230, 235, 245, 0.95);
}

.acr-modal-title p {
    margin: 2px 0 0;
    font-size: 0.8rem;
    color: rgba(6, 182, 212, 0.8);
}

.acr-modal-close {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.6);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}
.acr-modal-close:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

.acr-modal-body { padding: 24px; }

/* Step 1: category picker */
.acr-step-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(230,235,245,0.9);
    margin: 0 0 16px;
    text-align: center;
}

.acr-category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.acr-cat-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    color: rgba(230,235,245,0.85);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.acr-cat-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.22);
    transform: translateY(-2px);
}

.acr-cat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(var(--cat-color-rgb, 139, 92, 246), 0.12);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cat-color);
}

/* Step 2 */
.acr-breadcrumb {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.acr-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.65);
    padding: 6px 12px;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s;
}
.acr-back-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }

.acr-cat-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
.acr-cat-accesorio { background: rgba(139,92,246,0.2); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
.acr-cat-consumible { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.acr-cat-refaccion  { background: rgba(239,68,68,0.2);  color: #f87171; border: 1px solid rgba(239,68,68,0.3);  }

.acr-section {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 14px;
}

.acr-equipo-section { border-color: rgba(6,182,212,0.15); background: rgba(6,182,212,0.04); }

.acr-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(230,235,245,0.85);
}

.acr-fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.acr-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.acr-field label {
    font-size: 0.78rem;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
}

.acr-field small { opacity: 0.7; font-size: 0.73rem; }

.acr-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: rgba(230,235,245,0.9);
    padding: 8px 12px;
    font-size: 0.85rem;
    width: 100%;
    transition: border-color 0.2s;
    box-sizing: border-box;
}
.acr-input:focus { outline: none; border-color: rgba(6,182,212,0.5); background: rgba(255,255,255,0.08); }
.acr-input::placeholder { color: rgba(255,255,255,0.3); }

/* Toggle */
.acr-toggle-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.acr-toggle-label { font-size: 0.83rem; color: rgba(255,255,255,0.65); }

.acr-toggle {
    position: relative;
    width: 42px;
    height: 24px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s;
}
.acr-toggle.active { background: rgba(6,182,212,0.5); border-color: rgba(6,182,212,0.7); }
.acr-toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background: rgba(255,255,255,0.9);
    border-radius: 50%;
    transition: transform 0.25s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.acr-toggle.active .acr-toggle-knob { transform: translateX(18px); }

/* Inventory search */
.acr-inv-search { display: flex; flex-direction: column; gap: 10px; }
.acr-inv-search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 0 12px;
    color: rgba(255,255,255,0.4);
}
.acr-inv-search-bar .acr-input { border: none; background: transparent; padding-left: 4px; }
.acr-inv-search-bar .acr-input:focus { border: none; background: transparent; }

.acr-inv-results { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }

.acr-inv-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
}
.acr-inv-item:hover { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.3); }
.acr-inv-item.is-selected { background: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.5); }

.acr-inv-nombre { font-size: 0.85rem; font-weight: 600; color: rgba(230,235,245,0.9); }
.acr-inv-serie { font-size: 0.75rem; color: rgba(255,255,255,0.45); }
.acr-inv-empty { font-size: 0.82rem; color: rgba(255,255,255,0.35); text-align: center; padding: 12px; }

.acr-selected-equipo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(6,182,212,0.1);
    border: 1px solid rgba(6,182,212,0.3);
    border-radius: 10px;
    color: rgba(6,182,212,0.9);
}
.acr-selected-equipo div { flex: 1; font-size: 0.85rem; color: rgba(230,235,245,0.9); }
.acr-selected-equipo span { color: rgba(255,255,255,0.5); font-size: 0.78rem; }
.acr-clear-equipo {
    background: none; border: none;
    color: rgba(255,255,255,0.45);
    cursor: pointer; padding: 4px;
    display: flex; align-items: center;
    border-radius: 6px; transition: all 0.15s;
}
.acr-clear-equipo:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

/* Footer */
.acr-footer {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 6px;
    flex-wrap: wrap;
}

.acr-btn-add {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(6,182,212,0.15) 100%);
    border: 1px solid rgba(6,182,212,0.4);
    border-radius: 10px;
    color: rgba(6,182,212,0.95);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.acr-btn-add:hover {
    background: linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0.25) 100%);
    border-color: rgba(6,182,212,0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(6,182,212,0.2);
}

.acr-footer-hint { font-size: 0.75rem; color: rgba(255,255,255,0.35); }

@media (max-width: 560px) {
    .acr-category-grid { grid-template-columns: 1fr 1fr; }
    .acr-fields-grid { grid-template-columns: 1fr; }
}


/* Estilos para el switch de fecha y campo editable */
/* SECCIÓN DE FECHA COMPACTA - SOLUCIÓN FINAL A RECORTES */
.date-compact-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(15, 23, 42, 0.4);
    padding: 6px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    height: 42px;
    width: fit-content;
    min-width: 260px; /* Espacio garantizado para Auto + Fecha Completa */
    overflow: visible !important;
}

.date-toggle-group {
    display: flex;
    align-items: center;
    gap: 8px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding-right: 10px;
}

.date-toggle-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.date-value-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 4px;
    overflow: visible !important;
}

.date-simple-text {
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 0.02em;
}

.date-simple-input {
    background: transparent !important;
    border: none !important;
    color: #3b82f6 !important;
    font-size: 0.95rem !important;
    font-weight: 700 !important;
    padding: 0 !important;
    width: 160px !important; /* Ancho suficiente para evitar recorte */
    outline: none !important;
    cursor: pointer;
}

/* Switch Simple y Elegante */
.simple-switch {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 18px;
}

.simple-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.simple-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #334155;
    transition: .3s;
    border-radius: 18px;
}

.simple-slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
}

input:checked + .simple-slider {
    background-color: #3b82f6;
}

input:checked + .simple-slider:before {
    transform: translateX(14px);
}
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.btn-add {
    position: relative;
    padding: 12px 28px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    min-width: 140px;
}

.btn-add:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.btn-add:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #475569;
    box-shadow: none;
}

.btn-clear {
    padding: 12px 24px;
    background: rgba(148, 163, 184, 0.1);
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-clear:hover {
    background: rgba(148, 163, 184, 0.2);
    color: #fff;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.btn-add.is-loading {
    color: transparent;
}

.btn-add .loading-spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -10px;
    margin-top: -10px;
}

/* Premium Internal Edit Card */
.internal-edit-card.premium-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    margin-top: 16px;
    padding: 32px;
    background: linear-gradient(165deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    overflow: hidden;
    animation: premiumFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes premiumFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.card-glow {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    pointer-events: none;
}

.internal-card-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.edit-context-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    padding: 6px 16px;
    border-radius: 12px;
    border: 1px solid transparent;
    margin-bottom: 12px;
    transition: all 0.3s ease;
}

.edit-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #000;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.edit-text {
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
}

.asset-name {
    font-size: 1.5rem;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.2;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.technical-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
    margin-top: 16px;
    padding: 16px;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
}

.info-label {
    font-size: 0.65rem;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.info-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.asset-name {
    font-size: 1.4rem;
    font-weight: 800;
    color: #fff;
    margin: 12px 0 0 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
    word-break: break-word;
}

.internal-edit-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.edit-field-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.edit-field-group.full-width {
    grid-column: span 2;
}

.field-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #60a5fa;
}

.stepper-control {
    display: flex;
    align-items: center;
    background: rgba(15, 23, 42, 0.5);
    border: 2px solid rgba(59, 130, 246, 0.2);
    border-radius: 16px;
    padding: 8px;
    width: fit-content;
    transition: all 0.3s ease;
}

.stepper-control:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.step-btn {
    width: 42px;
    height: 42px;
    background: rgba(59, 130, 246, 0.1);
    border: none;
    border-radius: 12px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.step-btn:hover:not(:disabled) {
    background: #3b82f6;
    color: #fff;
    transform: scale(1.05);
}

.step-btn:active:not(:disabled) {
    transform: scale(0.95);
}

.step-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
}

.step-input {
    width: 60px;
    background: transparent;
    border: none;
    color: #fff;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 800;
    outline: none;
}

/* Chrome, Safari, Edge, Opera */
.step-input::-webkit-outer-spin-button,
.step-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-with-icon {
    position: relative;
    width: 100%;
}

/* Success Overlay & Premium Card Actions */
.success-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 24px;
}

.success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #10b981;
    font-weight: 800;
    font-size: 1.25rem;
    animation: successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes successPop {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.success-icon-wrap {
    width: 80px;
    height: 80px;
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.premium-card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 8px;
}

.btn-premium-clear {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(148, 163, 184, 0.1);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 14px;
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-premium-clear:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
}

.btn-premium-add {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 180px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 14px;
    color: #fff;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-premium-add:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.4);
}

.btn-premium-add:active:not(:disabled) {
    transform: translateY(0);
}

.btn-premium-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #475569;
}

.loading-spinner-small {
    width: 18px;
    height: 18px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.qty-control {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 10px;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.6);
    height: 42px;
}

.qty-control button {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    width: 36px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s;
}

.qty-control button:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #fff;
}

.qty-control span {
    min-width: 40px;
    text-align: center;
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
}

.premium-date-container {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    width: 100%;
}

/* ==========================================================================
   PREMIUM UNIFIED DATE SELECTOR (MONOLITHIC CAPSULE)
   ========================================================================== */
.premium-date-container {
    display: flex;
    align-items: center;
    background: rgba(15, 23, 42, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    height: 48px;
    width: 100%;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

/* Estado Activo Global */
.premium-date-container.mode-auto {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.05);
    background: rgba(30, 41, 59, 0.5);
}

.premium-date-container.mode-manual {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(30, 41, 59, 0.6);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Sección de Control (Izquierda) */
.control-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    height: 100%;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    flex-shrink: 0;
    min-width: 140px;
    background: rgba(255, 255, 255, 0.02);
}

.mode-auto .control-section {
    background: rgba(59, 130, 246, 0.05);
}

.pill-label {
    font-size: 0.75rem;
    font-weight: 900;
    color: #475569;
    letter-spacing: 0.12em;
    transition: all 0.3s ease;
}

.mode-auto .pill-label {
    color: #3b82f6;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

/* Sección de Valor (Derecha) */
.value-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 100%;
    position: relative;
    cursor: not-allowed;
    transition: all 0.3s ease;
}

.mode-manual .value-section {
    cursor: pointer;
}

.mode-manual .value-section:hover {
    background: rgba(255, 255, 255, 0.03);
}

.pill-content {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 100%;
}

.pill-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: #475569;
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.3s ease;
}

.mode-auto .pill-icon,
.mode-manual .pill-icon {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
}

.pill-text {
    display: flex;
    align-items: center;
    height: 100%;
}

.date-text {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 48px;
    color: #64748b;
    margin: 0;
    letter-spacing: 0.02em;
    transition: all 0.3s ease;
}

.mode-manual .date-text {
    color: #fff;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}



/* Date Picker Invisible */
.hidden-picker {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0 !important;
    cursor: pointer;
    z-index: 10;
}

/* Switch Estilizado */
.simple-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
}

.simple-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.simple-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: rgba(71, 85, 105, 0.4);
    transition: .4s;
    border-radius: 34px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.simple-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 4px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .simple-slider {
    background-color: #3b82f6;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

input:checked + .simple-slider:before {
    transform: translateX(18px);
}

/* ========== BLANK ITEM FORM - Agregación de Bien en Blanco ========== */
.blank-item-form {
    padding: 24px;
    background: linear-gradient(165deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 2px dashed rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(8px);
}

.blank-form-header {
    margin-bottom: 28px;
}

.blank-form-banner {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 16px;
    border-left: 4px solid #8b5cf6;
}

.blank-form-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(139, 92, 246, 0.15);
    border-radius: 12px;
    color: #a78bfa;
    flex-shrink: 0;
}

.blank-form-title {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.blank-form-title h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #e0e7ff;
    letter-spacing: -0.01em;
}

.blank-form-title p {
    margin: 0;
    font-size: 0.85rem;
    color: #a78bfa;
    line-height: 1.4;
}

/* ========== INTERNAL EDIT FORM - Edición de Bien Existente ========== */
.internal-edit-form {
    padding: 0;
}

/* ========== EXTERNAL ITEM FORM - Agregación de Bien Externo ========== */
.external-item-form {
    padding: 24px;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
}

/* Transiciones mejoradas entre formularios */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
