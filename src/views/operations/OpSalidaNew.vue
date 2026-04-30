<template>
    <div class="op-salida-new" :class="{ 'is-submitting': loading }">
        <OperationWizard type="salida" :title="wizardTitle" :folio="form.folio" :steps="wizardSteps"
            :can-proceed="canProceedToNext" :can-submit="isValid" :is-submitting="loading" :submit-label="submitLabel"
            :show-sidebar="!isMobileView" @back="onBack" @submit="onSubmit" @step-change="onStepChange" ref="wizardRef">
            <template #header-actions>
                <button v-if="isAdmin" class="admin-settings-btn" @click="openAdminSettings"
                    title="Configuración de administrador">
                    <Settings :size="20" />
                </button>
                <button v-if="isAdmin" class="edit-requests-btn" @click="goToImportCsv" title="Importar CSV">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
            </template>

            <!-- ========== STEP 0: Solicitante ========== -->
            <template #step-0>
                <div class="wizard-step">
                    <WizardStepCard title="Datos del Solicitante"
                        subtitle="Información básica de quien solicita la salida" icon-color="#22c55e">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </template>

                        <div class="fields-grid">
                            <ModernInput v-if="isFieldVisible('nombreSolicitante')" v-model="form.nombreSolicitante"
                                label="Nombre del Solicitante" placeholder="Nombre completo de quien solicita"
                                :error-message="getFieldError('nombreSolicitante')">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </template>
                            </ModernInput>

                            <ModernInput v-if="isFieldVisible('servicio')" v-model="form.servicio" label="Servicio"
                                placeholder="Ej. Cardiología, Urgencias">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1" />
                                        <rect x="4" y="3" width="16" height="18" rx="2" />
                                    </svg>
                                </template>
                            </ModernInput>

                            <ModernInput v-if="isFieldVisible('especialidad')" v-model="form.especialidad"
                                label="Especialidad" placeholder="Ej. Medicina Interna">
                                <template #prefix>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </template>
                            </ModernInput>
                        </div>
                    </WizardStepCard>

                    <WizardStepCard class="tall" title="Fecha y Horario" subtitle="Cuándo se realiza la salida"
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
                            <div class="field-wrapper span-1" v-if="isFieldVisible('folio')">
                                <label class="field-label">Folio</label>
                                <FolioInput v-model="form.folio" prefix="S-" />
                            </div>

                            <div class="field-wrapper span-1" v-if="isFieldVisible('folioAsociado')">
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

                            <div class="field-wrapper span-1" v-if="isFieldVisible('horaInicio')">
                                <label class="field-label">Hora Inicio</label>
                                <TimePicker v-model="form.horaInicio" />
                            </div>

                            <div class="field-wrapper span-1" v-if="isFieldVisible('horaTermino')">
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

                    <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="solicitante"
                        style="margin-top: 16px;" />
                </div>
            </template>

            <!-- ========== STEP 1: Motivo ========== -->
            <template #step-1>
                <div class="wizard-step">
                    <WizardStepCard class="tall" title="Motivo de Salida" subtitle="Razón por la cual sale el equipo"
                        icon-color="#f59e0b">
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </template>

                        <div class="fields-grid">
                            <div class="field-wrapper span-full" v-if="isFieldVisible('motivoSalida')">
                                <label class="field-label">Motivo de Salida <span class="required">*</span></label>

                                <!-- Custom searchable select with "assign as other" feature -->
                                <div class="motivo-select-wrapper" ref="motivoSelectRef">
                                    <button type="button" class="motivo-trigger"
                                        :class="{ 'is-open': showMotivoDropdown }" @click="toggleMotivoDropdown">
                                        <span class="trigger-value" :class="{ placeholder: !form.motivoSalida }">
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
                                                    :class="{ 'is-selected': form.motivoSalida === option.value }"
                                                    @click.stop="selectMotivo(option)">
                                                    <span class="option-label">{{ option.label }}</span>
                                                    <svg v-if="form.motivoSalida === option.value" class="option-check"
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
                                <ModernInput v-if="isFieldVisible('otroMotivo') && form.motivoSalida === 'otro'"
                                    v-model="form.otroMotivo" label="Especifica el motivo"
                                    placeholder="Describe el motivo de salida" class="span-full" />
                            </Transition>

                            <ModernInput v-if="isFieldVisible('descripcion')" v-model="form.descripcion"
                                label="Descripción General" placeholder="Descripción detallada del motivo de salida..."
                                multiline :rows="4" class="span-full" />
                        </div>
                    </WizardStepCard>

                    <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="motivo"
                        style="margin-top: 16px;" />
                </div>
            </template>

            <!-- ========== STEP 2: Equipos ========== -->
            <template #step-2>
                <div class="wizard-step">
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
                                                        <!-- Modal para item en blanco -->

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
                                        <p><strong>Equipo Externo:</strong> Completa los datos requeridos para registrar el bien.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- Equipment Type Selector (aparece solo si ya respondió) -->
                        <div v-if="belongsToHospital !== null" class="equipment-type-grid"
                            style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <button v-for="tipo in tipoSalidaOptions" :key="tipo.value" type="button" class="type-card"
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

                            <!-- Botón especial Acc/Cons/Ref para Equipo Médico -->
                            <button type="button" class="type-card type-card-acr"
                                :class="{ 'is-selected': showAcrModal }"
                                @click="abrirModalAcr">
                                <div class="type-icon" style="--type-color: #06b6d4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </div>
                                <span class="type-label">Acc/Cons/Ref<br><small>para Equipo Médico</small></span>
                            </button>
                        </div>

                        <!-- Modal selector de categoría ACR -->
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

                                                <!-- Refinamiento inteligente reutilizable -->
                                                <InventoryRefinement
                                                    v-if="belongsToHospital === true && newItem.tipo && !isEditingItem && !newItem.isBlank"
                                                    :newItem="newItem"
                                                    :belongsToHospital="belongsToHospital === true"
                                                    :suggestions="suggestions"
                                                    :equipoMedicoList="equipoMedicoList"
                                                    @select-item="(item) => agregarItemALaOrden(item, seccionActual.value)"
                                                    @refresh-inventory="forceRefreshInventory"
                                                />

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
                                            <button v-for="tipo in tipoSalidaOptions" :key="tipo.value" type="button"
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
                        <!-- Equipment Form (External, Blank Item, or Edit) -->
                        <!-- ========== FLUJO 1: EDITAR BIEN INTERNO EXISTENTE ========== -->
                        <Transition name="slide-up">
                            <div v-if="isEditingItem && belongsToHospital === true && !newItem.isBlank && !['mobiliario', 'refaccion'].includes(newItem.tipo)" class="equipment-form internal-edit-form">
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
                                                <span class="edit-text">
                                                    EDITANDO {{ getBannerText(newItem) }}
                                                </span>
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
                                                <div class="info-item">
                                                    <span class="info-label">INV</span>
                                                    <span class="info-value">{{ newItem.unidades[0]?.noInventario || '-' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="internal-edit-grid">
                                        <div class="edit-field-group">
                                            <label class="field-label">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8V21H3V8"/><path d="M1 3H23V8H1V3ZM10 12H14"/></svg>
                                                Cantidad a retirar
                                            </label>
                                            <div class="stepper-control">
                                                <button type="button" @click="newItem.unidades[0].cantidad = Math.max(1, newItem.unidades[0].cantidad - 1)" :disabled="newItem.unidades[0].cantidad <= 1" class="step-btn">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                                </button>
                                                <input type="number" v-model.number="newItem.unidades[0].cantidad" min="1" class="step-input" />
                                                <button type="button" @click="newItem.unidades[0].cantidad++" class="step-btn">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div class="edit-field-group">
                                            <label class="field-label">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                Ubicación actual
                                            </label>
                                            <div class="input-with-icon">
                                                <SearchableInput v-model="newItem.unidades[0].ubicacion"
                                                    :suggestions="currentSuggestions" field-name="ubicacion"
                                                    placeholder="Ubicación donde se encuentra el bien..."
                                                    @select="(s) => handleSuggestionSelect(s, newItem.unidades[0], 'ubicacion')" />
                                            </div>
                                        </div>
                                        
                                        <div v-if="isConsumibleLikeType(newItem.tipo)" class="edit-field-group full-width">
                                            <label class="field-label">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                                                Equipo Médico Vinculado
                                            </label>
                                            <SearchableInput v-model="newItem.unidades[0].equipoAsociado"
                                                :suggestions="suggestions" tipo="equipo-medico"
                                                field-name="nombre" placeholder="Buscar equipo principal..."
                                                @select="(s) => newItem.unidades[0].equipoAsociado = (s.nombre || s.label || '')" />
                                        </div>

                                        <div v-if="isConsumibleLikeType(newItem.tipo)" class="edit-field-group full-width">
                                            <label class="field-label">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
                                                Origen del Bien
                                            </label>
                                            <input v-model.trim="newItem.unidades[0].origenBien" type="text" 
                                                class="form-input" placeholder="Compra, donación, comodato..." />
                                        </div>
                                    </div>

                                    <div class="premium-card-actions">
                                        <button type="button" class="btn-premium-clear" @click="resetNewItem">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                                            Limpiar
                                        </button>
                                        <button type="button" class="btn-premium-add" @click="agregarItem" :disabled="!canAddItem || isVerifyingStatus || cardSuccessState" :class="{ 'is-loading': isVerifyingStatus }">
                                            <span v-if="!isVerifyingStatus">
                                                {{ editingItemIndex !== -1 ? 'Actualizar Cambios' : 'Confirmar Salida' }}
                                            </span>
                                            <span v-else class="loading-spinner-small"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- ========== FLUJO 2: AGREGAR BIEN EN BLANCO O EXTERNO ========== -->
                        <Transition name="slide-up">
                            <div v-if="newItem.tipo && (newItem.isBlank || belongsToHospital === false || newItem.tipo === 'mobiliario' || newItem.tipo === 'refaccion' || (isEditingItem && belongsToHospital === false))" class="equipment-form blank-item-form">
                                <div class="form-header">
                                    <div class="blank-form-banner" :style="getBannerStyle(newItem)">
                                        <div class="banner-icon">
                                            <svg v-if="newItem.isBlank" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                            <svg v-else-if="belongsToHospital === false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L22 22m-3 1l1 1m1-1l-1 1"/></svg>
                                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </div>
                                        <div class="banner-content">
                                            <span class="banner-label">{{ isEditingItem ? 'EDITANDO' : 'NUEVO REGISTRO' }}</span>
                                            <span class="banner-title">{{ getBannerText(newItem) }}{{ belongsToHospital === false ? ' (EXTERNO)' : '' }}</span>
                                        </div>
                                        <div v-if="!isEditingItem" class="banner-requirement">
                                            <span class="req-label">REQUERIDOS:</span>
                                            <span class="req-value">{{ getRequiredFieldsText() }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="units-list">
                                    <TransitionGroup name="unit-list">
                                        <div v-for="(unidad, idx) in newItem.unidades" :key="idx" class="unit-card">
                                            <div class="unit-header">
                                                <span class="unit-badge">#{{ idx + 1 }}</span>
                                                <button type="button" class="unit-remove" @click="removeUnit(idx)" v-if="newItem.unidades.length > 1">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                </button>
                                            </div>

                                            <div class="unit-fields">
                                                <div class="searchable-field">
                                                    <label class="mini-label">Nombre / Descripción</label>
                                                    <input v-model.trim="unidad.nombre" type="text" class="form-input"
                                                        :placeholder="getNombrePlaceholder()" autocomplete="off" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Marca</label>
                                                    <input v-model.trim="unidad.marca" type="text" class="form-input" placeholder="Ej. Philips" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Modelo</label>
                                                    <input v-model.trim="unidad.modelo" type="text" class="form-input" placeholder="Ej. MX40" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">No. Serie</label>
                                                    <input v-model.trim="unidad.serie" type="text" class="form-input" placeholder="Ej. SN123456" />
                                                </div>

                                                <div class="searchable-field">
                                                    <label class="mini-label">Ubicación</label>
                                                    <input v-model.trim="unidad.ubicacion" type="text" class="form-input" placeholder="Ej. UCIA" />
                                                </div>

                                                <div v-if="belongsToHospital === true && !['equipo-medico', 'mobiliario'].includes(newItem.tipo)" class="searchable-field">
                                                    <label class="mini-label">Clave HRAEI</label>
                                                    <input v-model.trim="unidad.claveHRAEI" type="text" class="form-input" placeholder="Ej. 12345" />
                                                </div>

                                                <div v-if="belongsToHospital === true" class="searchable-field">
                                                    <label class="mini-label">No. Inventario</label>
                                                    <input v-model.trim="unidad.noInventario" type="text" class="form-input" placeholder="Ej. SIB-MSV-..." />
                                                </div>

                                                <div class="quantity-field">
                                                    <label class="mini-label">Cantidad</label>
                                                    <div class="quantity-input-wrapper">
                                                        <button type="button" class="qty-btn" @click="unidad.cantidad > 1 ? unidad.cantidad-- : null" :disabled="unidad.cantidad <= 1">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                                        </button>
                                                        <input type="number" v-model.number="unidad.cantidad" min="1" class="qty-input" />
                                                        <button type="button" class="qty-btn" @click="unidad.cantidad++">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TransitionGroup>
                                </div>

                                <div class="form-actions">
                                    <button type="button" class="btn-clear" @click="resetNewItem">
                                        Cancelar
                                    </button>
                                    <button type="button" class="btn-add" @click="agregarItem" :disabled="!canAddItem" :class="{ 'is-loading': isVerifyingStatus }">
                                        <span v-if="!isVerifyingStatus">{{ isEditingItem ? 'Actualizar' : 'Agregar' }}</span>
                                        <span v-else class="loading-spinner"></span>
                                    </button>
                                </div>
                            </div>
                        </Transition>

                    </WizardStepCard>

                    <!-- Added Equipment List -->
                    <WizardStepCard v-if="form.equiposSalida.length > 0"
                        :title="`Equipos Agregados (${form.equiposSalida.length})`"
                        subtitle="Lista de equipos que saldrán" icon-color="#10b981" collapsible>
                        <template #icon>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </template>
                        <template #actions>
                            <span class="items-count-badge">{{ form.equiposSalida.length }}</span>
                        </template>

                        <div class="equipment-list">
                            <TransitionGroup name="equipment-item">
                                <div v-for="(item, index) in form.equiposSalida" :key="index" class="equipment-item">
                                    <div class="item-type-badge" :class="`type-${item.tipo}`">
                                        {{ getTipoLabel(item.tipo) }}
                                    </div>
                                    <div v-if="isConsumibleLikeType(item.tipo)" class="consumible-state-badge"
                                        :class="(item.consumibleEstado || item.consumible_estado) === 'usado' ? 'is-usado' : 'is-nuevo'">
                                        {{ (item.consumibleEstado || item.consumible_estado) === 'usado' ? 'Usado' : 'Nuevo' }}
                                    </div>

                                    <div class="item-info">
                                        <div class="item-header">
                                            <h5 class="item-name">{{ item.descripcion }}</h5>
                                            <div class="item-quantity-badge">{{ getItemQuantity(item) }}</div>
                                        </div>
                                        <p class="item-quantity-text">{{ getItemQuantity(item) }} {{ getItemQuantity(item) !== 1 ?
                                            'artículos' : 'artículo'
                                            }} de {{ getTipoLabel(item.tipo).toLowerCase() }}</p>
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

                                    <button type="button" class="item-remove" @click="eliminarItem(item)"
                                        title="Eliminar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path
                                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                    <button type="button" class="item-edit"
                                        :class="{ 'is-editing': editingItemIndex === index }"
                                        @click="editarItem(index)"
                                        :title="editingItemIndex === index ? 'Cancelar edición' : 'Editar item'">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
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

                    <!-- Global Warnings Summary -->
                    <div v-if="allItemsWarnings.allWarnings.length > 0" class="warnings-section">
                        <OrderItemWarnings
                            :warnings="allItemsWarnings.allWarnings"
                            collapsible
                            expanded
                        />
                    </div>

                    <!-- Empty State -->
                    <div v-if="form.equiposSalida.length === 0 && !newItem.tipo" class="empty-equipment">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <h4>No hay equipos agregados</h4>
                        <p>Selecciona un tipo de equipo arriba para comenzar</p>
                    </div>

                    <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="equipos"
                        style="margin-top: 16px;" />
                </div>
            </template>

            <!-- ========== STEP 3: Observaciones y Firmas ========== -->
            <template #step-3>
                <div class="wizard-step">
                    <WizardStepCard title="Observaciones" subtitle="Notas adicionales sobre la salida"
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
                                <ModernInput v-if="isFieldVisible('observaciones')" v-model="form.observaciones"
                                    label="Observaciones" placeholder="Escribe cualquier observación relevante..."
                                    multiline :rows="4" class="span-full" />

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

                            <ModernInput v-if="isFieldVisible('nombreIngeniero')" v-model="form.nombreIngeniero"
                                label="Ingeniero Residente (Apoyo)"
                                placeholder="Nombre de la cuenta autenticada" :readonly="true" />
                        </div>

                        <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="observaciones"
                            style="margin-top: 16px;" />
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
                            <template v-for="(sig, idx) in form.signatures" :key="sig.key">
                                <div v-if="isFieldVisible(sig.key)" class="signature-card"
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
                            </template>
                        </div>

                        <DynamicFieldsSection :schema="formSchema" :model="form.extraFields" sectionId="firmas"
                            style="margin-top: 16px;" />
                    </WizardStepCard>
                </div>
            </template>

            <!-- ========== SIDEBAR SUMMARY ========== -->
            <template #summary>
                <LiveSummary :items="summaryItems" :equipment-count="form.equiposSalida.length">
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

        <FormSchemaAdminPanel v-if="showSchemaPanel" :visible="showSchemaPanel" :module-key="schemaModuleKey"
            module-label="Salida" :modelValue="formSchema" :sections="schemaSections" :option-sets="schemaOptionSets"
            :system-fields="SALIDA_SYSTEM_FIELDS" @close="showSchemaPanel = false"
            @update:modelValue="handleSaveSchema" />

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

    <!-- Kardex Preview Modal -->
    <KardexPreviewModal :isOpen="kardexModalVisible" :itemData="kardexItem" title="Vista previa del Kardex" @close="kardexModalVisible = false" />
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
import InventoryRefinement from '@/components/operations/InventoryRefinement.vue'
import FormSchemaAdminPanel from '@/components/FormSchemaAdminPanel.vue'
import DynamicFieldsSection from '@/components/DynamicFieldsSection.vue'

// Icons
import { Settings } from 'lucide-vue-next'
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

// Order Item Warnings
import OrderItemWarnings from '@/components/OrderItemWarnings.vue';

// Utils
import notifier from '@/utils/notifier'
import { authedFetch } from '@/utils/api.js'
import motivoSalidaOptions from '@/data/motivoSalidaOptions.js'
import { SALIDA_SYSTEM_FIELDS } from '@/data/systemFields.js'
import { getDefaultSchema } from '@/data/defaultFormSchemas.js'
import { fetchFormSchema, saveFormSchema } from '@/services/formSchemaService.js'
import notificationStore from '@/stores/notificationStore'
import { useWizardStore } from '@/stores/wizardStore.js'

// Composables
import { useInventorySuggestions } from '@/composables/useInventorySuggestions.js'
import { useOrderItemValidation } from '@/composables/useOrderItemValidation.js'
import { getEquipmentStatus } from '@/composables/useEquipmentWarnings.js'
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

function goToImportCsv() {
    try { router.push({ name: 'import' }) } catch (e) { console.warn('goToImportCsv failed', e) }
}

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

// --- Admin & Schema Logic ---
const isAdmin = ref(false)
const schemaModuleKey = 'salida'
const schemaSections = [
    { id: 'solicitante', title: 'Datos del Solicitante' },
    { id: 'motivo', title: 'Motivo y Descripción de Salida' },
    { id: 'equipos', title: 'Equipos que Salen' },
    { id: 'observaciones', title: 'Observaciones' },
    { id: 'firmas', title: 'Firmas' }
]
const schemaOptionSets = [
    { key: 'motivoSalida', label: 'Motivo de Salida' }
]

function isFieldVisible(key) {
    if (!formSchema.value) return true
    return !formSchema.value.hiddenSystemFields?.includes(key)
}

const formSchema = ref(getDefaultSchema(schemaModuleKey))
const showSchemaPanel = ref(false)
const schemaLoading = ref(false)

async function loadFormSchema() {
    schemaLoading.value = true
    try {
        const remote = await fetchFormSchema(schemaModuleKey)
        if (remote) {
            formSchema.value = mergeSchema(getDefaultSchema(schemaModuleKey), remote)
        }
    } catch (e) {
        console.warn('Fallback schema error:', e)
    } finally {
        schemaLoading.value = false
    }
}

function mergeSchema(base, incoming) {
    const merged = { ...base, ...incoming }
    merged.sections = { ...base.sections, ...(incoming.sections || {}) }
    merged.optionSets = { ...base.optionSets, ...(incoming.optionSets || {}) }
    return merged
}

async function handleSaveSchema(nextSchema) {
    const merged = mergeSchema(getDefaultSchema(schemaModuleKey), nextSchema)
    await saveFormSchema(schemaModuleKey, merged)
    formSchema.value = merged
    showSchemaPanel.value = false
}

function openAdminSettings() {
    showSchemaPanel.value = true
    if (!schemaLoading.value) loadFormSchema()
}

onMounted(() => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        isAdmin.value = ['admin', 'sub_admin'].includes(user.role)
    } catch { isAdmin.value = false }
    loadFormSchema()
    fetchUsers() // Pre-fetch users for signatures
})

const motivoSalidaOptionsComputed = computed(() => {
    const override = formSchema.value?.optionSets?.motivoSalida
    return (Array.isArray(override) && override.length) ? override : motivoSalidaOptions
})
// ----------------------------

// Inventory suggestions
const seccionActual = computed(() => {
    if (!newItem.tipo) return null
    if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') return 'equipo'
    if (['accesorio', 'consumible', 'refaccion'].includes(newItem.tipo)) return 'insumo'
    return null
})

function agregarItemALaOrden(item, seccion) {
    if (!item) return
    const mapped = {
        ...item,
        tipo: item.tipo || (seccion === 'equipo' ? 'equipo-medico' : 'accesorio'),
        cantidad: item.cantidad || 1,
        descripcion: item.descripcion || item.nombre || item.label || '',
        isExternal: item.isExternal ?? item.is_external ?? isCurrentItemExternal.value,
        paraEquipoMedico: acrFlowActive.value ? true : (item.paraEquipoMedico || false)
    }
    form.equiposSalida.push(mapped)
    acrFlowActive.value = false
}

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

// Order Item Warnings
const { getAllItemsWarnings } = useOrderItemValidation()
const allItemsWarnings = computed(() => {
    if (form.equiposSalida.length === 0) {
        return { allWarnings: [], warningsByItem: {} }
    }
    // Por ahora sin datos de inventario, solo valida fechas
    return getAllItemsWarnings(form.equiposSalida, {})
})

// Refs
const wizardRef = ref(null)
const currentStep = ref(0)
const loading = ref(false)
const isMobileView = ref(false)
const errors = ref({})
const editingItemIndex = ref(-1)
const isEditingItem = computed(() => editingItemIndex.value > -1)

// Equipment Warnings
const showWarningModal = ref(false)
const pendingEquipment = ref(null)
const equipmentWarnings = ref([])
const belongsToHospital = ref(null) // Para la pregunta: ¿Pertenece al Hospital?
const cardSuccessState = ref(false)
const isCurrentItemExternal = computed(() => belongsToHospital.value === false)
const isVerifyingStatus = ref(false)

// Info popover states
const showDateInfo = ref(false)
const fechaAutomatica = ref(true)
const showHoraTerminoInfo = ref(false)

// Sugerencias específicas para 'Equipo Asociado' (asegurar que use lista de equipos)
const equipoAssociatedSuggestions = computed(() => {
    if (belongsToHospital.value !== true) return []
    // Preferir lista de equipos médicos si ya está cargada
    if (equipoMedicoList.value && equipoMedicoList.value.length) return equipoMedicoList.value
    // Fallback: usar todo el inventario prefetched y filtrar por tipo "equipo"
    if (allInventoryList && allInventoryList.value && allInventoryList.value.length) {
        const fallback = filterSuggestions(allInventoryList.value || [], '')
        return (fallback || []).filter(it => (it.tipo || '').toLowerCase() === 'equipo')
    }
    return []
})

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

// Modal para item en blanco
const showBlankItemModal = ref(false)

// Default signatures
const DEFAULT_SIGNATURES = [
    { key: 'subdireccion', role: 'SUBDIRECCIÓN DE INGENIERÍA BIOMÉDICA', nameKnown: true, name: 'ARQ. KARLA ALEJANDRA TORRES SÁNCHEZ', fixed: true },
    { key: 'ingeniero', role: 'INGENIERO BIOMÉDICO', nameKnown: false, name: '', fixed: false },
    { key: 'recibe', role: 'RECEPTOR', nameKnown: false, name: '', fixed: false },
    { key: 'entrega', role: 'ENTREGA', nameKnown: false, name: '', fixed: false },
    { key: 'vigilancia', role: 'COORDINACIÓN DE VIGILANCIA', nameKnown: false, name: '', fixed: false }
]

// Form state: centralized in store
const wizardStore = useWizardStore()
const form = wizardStore.getForm('salida')

// Initialize with defaults if empty
if (Object.keys(form).length === 0) {
  Object.assign(form, {
    nombreSolicitante: '',
    servicio: '',
    especialidad: '',
    folio: '',
    folioAsociado: '',
    fecha: '',
    fechaISO: '',
    horaInicio: '',
    horaTermino: '',
    motivoSalida: '',
    otroMotivo: '',
    descripcion: '',
    observaciones: '',
    observacionesImg: null,
    nombreIngeniero: '',
    equiposSalida: [],
    agregarAlInventario: false,
    signatures: JSON.parse(JSON.stringify(DEFAULT_SIGNATURES)),
    extraFields: {}
  })
}

// Autosave stop handle
let __opSalida_autosave_stop = null

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
    unidades: [],
    isBlank: false
})

// Flag que indica si aplicamos un draft en esta instancia (accesible para funciones)
let draftLoaded = false

// Draft management
const draftEnabled = computed(() => props.modo !== 'editar' && !props.readOnly)

const applyDraftSalida = () => wizardStore.applyDraft('salida')
const saveDraftSalida = () => wizardStore.saveDraft('salida', form)
const clearDraftSalida = () => wizardStore.clearDraft('salida')

// --- Detectores de reseteo: registrar un watcher profundo para detectar cuándo
// el formulario pasa de tener datos significativos a estar vacío.
function hasMeaningfulValueLocal(value) {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return Number.isFinite(value)
    if (typeof value === 'boolean') return value === true
    if (Array.isArray(value)) return value.some(hasMeaningfulValueLocal)
    if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValueLocal)
    return true
}

function formHasMeaningfulData(obj) {
    try {
        if (!obj || typeof obj !== 'object') return false
        if (String(obj.nombreSolicitante || '').trim()) return true
        if (String(obj.servicio || '').trim()) return true
        if (Array.isArray(obj.equiposSalida) && obj.equiposSalida.length > 0) return true
        return Object.values(obj).some(hasMeaningfulValueLocal)
    } catch (e) {
        return false
    }
}

let _prevFormHadData = formHasMeaningfulData(form)
try {
    watch(() => form, (newVal) => {
        try {
            const nowHas = formHasMeaningfulData(newVal)
            if (_prevFormHadData && !nowHas) {
                console.error('[Wizard] FORM RESET DETECTED', new Error().stack)
            }
            _prevFormHadData = nowHas
        } catch (e) {}
    }, { deep: true })
} catch (e) {}

    // Guardado forzado al hacer logout para no perder el último estado en memoria
    const handleFlushDraft = () => {
        try {
            console.log('[OpSalidaNew] wizard:draft:flush received; attempting save to wizardDraft:salida')
            try {
                // Log current form state before saving
                let snapshot = null
                try { snapshot = JSON.parse(JSON.stringify(form)) } catch (e) { snapshot = form }
                console.log('[OpSalidaNew] Guardando draft con formData:', snapshot)
            } catch (e) { console.warn('[OpSalidaNew] could not stringify form for logging', e) }

            saveDraftSalida()
            try {
                const raw = localStorage.getItem('wizardDraft:salida')
                console.log('[OpSalidaNew] post-saveDraft localStorage presence:', raw ? 'present' : 'null', raw ? `length=${raw.length}` : '')
            } catch (e) {
                console.warn('[OpSalidaNew] checking localStorage failed', e)
            }
        } catch (e) { console.warn('[OpSalidaNew] wizard:draft:flush failed', e) }
    }
    try { window.addEventListener('wizard:draft:flush', handleFlushDraft) } catch {}
    window.__opSalida_flushHandler = handleFlushDraft

    // Handle discard draft
    const handleDiscardDraft = (e) => {
        if (e.detail.key === 'salida') {
            clearDraftSalida()
        }
    }
    try { window.addEventListener('wizard:draft:discard', handleDiscardDraft) } catch {}
    window.__opSalida_discardHandler = handleDiscardDraft

// Equipment types with icons and colors
const tipoSalidaOptions = [
    { value: 'equipo-medico', label: 'Equipo Médico', icon: ComputerDesktopIcon, color: '#22c55e' },
    { value: 'mobiliario', label: 'Mobiliario', icon: DeviceTabletIcon, color: '#3b82f6' },
    { value: 'accesorio', label: 'Accesorios', icon: CpuChipIcon, color: '#8b5cf6' },
    { value: 'consumible', label: 'Consumibles', icon: BeakerIcon, color: '#f59e0b' },
    { value: 'refaccion', label: 'Refacciones', icon: WrenchIcon, color: '#ef4444' }
]

// ===== Modal ACR para Equipo Médico (selector de categoría) =====
const showAcrModal = ref(false)
const acrFlowActive = ref(false)
function abrirModalAcr() { showAcrModal.value = true }
function cerrarModalAcr() { showAcrModal.value = false }
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
    props.modo === 'editar' ? 'Editar Orden de Salida' : 'Nueva Orden de Salida'
)

const submitLabel = computed(() =>
    props.modo === 'editar' ? 'Actualizar Orden' : 'Guardar Orden'
)

const motivoOptions = computed(() => {
    if (!Array.isArray(motivoSalidaOptions)) return []
    return motivoSalidaOptions
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
    if (!form.motivoSalida) return ''
    // Check if it's a standard option
    const opt = motivoOptions.value.find(o => o.value === form.motivoSalida)
    if (opt) return opt.label
    // If "otro" and we have a custom text
    if (form.motivoSalida === 'otro' && form.otroMotivo) {
        return `OTRO: ${form.otroMotivo}`
    }
    return form.motivoSalida
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
    if (isVerifyingStatus.value) return false
    if (!newItem.tipo) return false
    if (!newItem.unidades.length) return false
    return newItem.unidades.some(u => u.nombre?.trim())
})

const isValid = computed(() => {
    return form.motivoSalida &&
        form.equiposSalida.length > 0
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
    return suggestions.value || []
})

const isExternalGoods = computed(() =>
    belongsToHospital.value === false && !isConsumibleLikeType(newItem.tipo)
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
        value: form.folio ? `S-${form.folio}` : '',
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
        value: form.motivoSalida,
        step: 4,
        status: form.motivoSalida ? 'complete' : 'pending'
    },
    {
        key: 'equipos',
        label: 'Equipos',
        value: form.equiposSalida.length ? `${form.equiposSalida.length} equipo(s)` : '',
        step: 5,
        status: form.equiposSalida.length > 0 ? 'complete' : 'pending'
    }
])

// Validation functions
function validateStep0() {
    return true // Solicitante opcional
}

function validateStep1() {
    return form.motivoSalida?.length > 0
}

function validateStep2() {
    return form.equiposSalida.length > 0
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
    newItem.consumibleEstado = isConsumibleLikeType(tipo) ? 'nuevo' : ''
    newItem.isBlank = false
    // Si estamos seleccionando un tipo que aplica a inventario, activarlo por defecto
    if (isConsumibleLikeType(tipo)) {
        form.agregarAlInventario = true
    }
    newItem.unidades = [createEmptyUnit()]
}

function getSelectedTypeLabel() {
    const type = tipoSalidaOptions.find(t => t.value === newItem.tipo)
    return type?.label || ''
}

function getTipoLabel(tipo) {
    const type = tipoSalidaOptions.find(t => t.value === tipo)
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

function isConsumibleLikeType(tipo) {
    return ['consumible', 'accesorio', 'refaccion'].includes(tipo)
}

function setConsumibleEstado(value) {
    if (!isConsumibleLikeType(newItem.tipo)) return
    newItem.consumibleEstado = value
    // Mantener el toggle de inventario sincronizado: nuevo -> registrar, usado -> no registrar
    form.agregarAlInventario = value === 'nuevo'
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
        ubicacion: '',
        equipoAsociado: '',
        serieEquipoAsociado: '',
        origenBien: '',
        claveHRAEI: '',
        cantidad: 1
    }
}

function editarItem(index) {
    if (editingItemIndex.value === index) {
        resetNewItem()
        return
    }

    const item = form.equiposSalida[index]
    if (!item) return

    editingItemIndex.value = index
    belongsToHospital.value = !(item.isExternal ?? item.is_external ?? false)
    selectEquipmentType(item.tipo || 'equipo-medico')
    newItem.consumibleEstado = item.consumibleEstado || item.consumible_estado || (isConsumibleLikeType(item.tipo) ? 'nuevo' : '')
    const quantityTotal = getItemQuantity(item)
    newItem.cantidad = quantityTotal
    newItem.unidades = [{
        nombre: item.descripcion || item.nombre || '',
        marca: item.marca || '',
        modelo: item.modelo || '',
        lote: item.lote || '',
        serie: item.serie || '',
        referencia: item.referencia || '',
        referenciaEquipo: item.referenciaEquipo || '',
        ubicacion: item.ubicacion || '',
        equipoAsociado: item.equipoAsociado || '',
        serieEquipoAsociado: item.serieEquipoAsociado || '',
        origenBien: item.origenBien || item.origen_bien || '',
        claveHRAEI: item.claveHRAEI || '',
        cantidad: quantityTotal
    }]

    currentStep.value = 2
}

// Quantity controls - LÓGICA LIMPIA
function incNew() {
    if (newItem.cantidad < 100) {
        newItem.cantidad++
        // Para equipos internos: agregar unidad vacía para mantener sincronización
        // Para equipos externos: NO agregar unidades (solo se maneja cantidad)
        if (!isCurrentItemExternal.value && newItem.unidades.length < newItem.cantidad) {
            newItem.unidades.push(createEmptyUnit())
        }
    }
}

function decNew() {
    if (newItem.cantidad > 1) {
        newItem.cantidad--
        // Para equipos internos: remover unidades extras
        if (!isCurrentItemExternal.value) {
            while (newItem.unidades.length > newItem.cantidad) {
                newItem.unidades.pop()
            }
        }
    }
}

function removeUnit(idx) {
    if (newItem.unidades.length > 1) {
        newItem.unidades.splice(idx, 1)
        // Actualizar cantidad para que coincida con unidades
        newItem.cantidad = newItem.unidades.length
    }
}

function agregarItemsSinWarning() {
    const generatedItems = []
    // Determine si tratar como externo: preferir selector, pero aceptar patrón común
    const unidadesLooksLikeExpanded = (Array.isArray(newItem.unidades) && newItem.unidades.length === (newItem.cantidad || 0)
        && newItem.unidades.length > 1 && newItem.unidades.every(u => ((u.nombre || '').trim() === '' && (u.cantidad || 1) === 1)))

    const treatAsExternal = isCurrentItemExternal.value || unidadesLooksLikeExpanded

    // Para equipos externos: crear 1 solo item con la cantidad total (no iterar sobre unidades)
    if (treatAsExternal) {
        const descripcionFinal = (newItem.unidades[0]?.nombre || '').trim() || `Bien sin descripción (${getTipoLabel(newItem.tipo)})`
        const cantidadTotal = newItem.cantidad || 1

        generatedItems.push({
            tipo: newItem.tipo,
            consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
            cantidad: cantidadTotal,
            unidades: [{ ...newItem.unidades[0], cantidad: cantidadTotal }],
            isExternal: true,
            descripcion: descripcionFinal,
            marca: newItem.unidades[0]?.marca,
            modelo: newItem.unidades[0]?.modelo,
            lote: newItem.unidades[0]?.lote,
            serie: newItem.unidades[0]?.serie,
            referencia: newItem.unidades[0]?.referencia,
            ubicacion: newItem.unidades[0]?.ubicacion,
            equipoAsociado: newItem.unidades[0]?.equipoAsociado || '',
            serieEquipoAsociado: newItem.unidades[0]?.serieEquipoAsociado || '',
            origenBien: newItem.unidades[0]?.origenBien || '',
            claveHRAEI: newItem.unidades[0]?.claveHRAEI
        })
    } else {
        // Para equipos internos (del hospital): iterar sobre unidades (cada unidad es un item distinto)
        for (const unidad of newItem.unidades) {
            const descripcionFinal = (unidad.nombre || '').trim() || `Bien sin descripción (${getTipoLabel(newItem.tipo)})`
            const cantidadDeEstaUnidad = Math.max(1, unidad.cantidad || 1)

            generatedItems.push({
                tipo: newItem.tipo,
                consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
                cantidad: cantidadDeEstaUnidad,
                isExternal: false,
                descripcion: descripcionFinal,
                marca: unidad.marca,
                modelo: unidad.modelo,
                lote: unidad.lote,
                serie: unidad.serie,
                referencia: unidad.referencia,
                ubicacion: unidad.ubicacion,
                equipoAsociado: unidad.equipoAsociado || '',
                serieEquipoAsociado: unidad.serieEquipoAsociado || '',
                origenBien: unidad.origenBien || '',
                claveHRAEI: unidad.claveHRAEI
            })
        }
    }

    if (generatedItems.length > 0) {
        if (isEditingItem.value) {
            form.equiposSalida.splice(editingItemIndex.value, 1, ...generatedItems)
            notifier.success('Equipo actualizado')
        } else {
            for (const equipmentItem of generatedItems) {
                form.equiposSalida.push(equipmentItem)
            }
            notifier.success(`${generatedItems.length} equipo(s) agregado(s)`)
        }

        // Si es un bien interno, mostramos feedback en la card antes de resetear
        if (belongsToHospital.value === true) {
            cardSuccessState.value = true
            setTimeout(() => {
                cardSuccessState.value = false
                resetNewItem()
            }, 1500)
        } else {
            resetNewItem()
        }
    } else {
        notifier.error('Completa al menos un equipo')
    }
}

// Add equipment - UN ITEM POR CADA UNIDAD CON SU PROPIA CANTIDAD
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
    if (type === 'equipo-medico') return 'EQUIPO MÉDICO';
    if (type === 'mobiliario') return 'MOBILIARIO';
    if (type === 'accesorio') return isLinked ? 'ACCESORIO ASOCIADO' : 'ACCESORIO INDEPENDIENTE';
    if (type === 'consumible') return isLinked ? 'CONSUMIBLE ASOCIADO' : 'CONSUMIBLE INDEPENDIENTE';
    if (type === 'refaccion') return isLinked ? 'REFACCIÓN ASOCIADA' : 'REFACCIÓN INDEPENDIENTE';
    return 'BIEN / ARTÍCULO';
};

function getRequiredFieldsText() {
    if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
        return 'Nombre, Marca, Modelo, Serie'
    }
    return 'Nombre, Marca, Modelo, Cantidad'
}




async function agregarItem() {
    if (!canAddItem.value) {
        notifier.error('Completa al menos el nombre del bien')
        return
    }

    const firstUnitWithKey = newItem.unidades.find(u => {
        const inv = u.claveHRAEI || u.serie
        return inv && inv.toUpperCase() !== 'N/A' && inv.trim() !== ''
    })
    
    const searchTerms = []
    
    if (firstUnitWithKey) {
        if (firstUnitWithKey.serie && firstUnitWithKey.serie.toUpperCase() !== 'N/A' && firstUnitWithKey.serie.trim() !== '') {
            searchTerms.push(firstUnitWithKey.serie.trim())
        }
        if (firstUnitWithKey.claveHRAEI && firstUnitWithKey.claveHRAEI.toUpperCase() !== 'N/A' && firstUnitWithKey.claveHRAEI.trim() !== '') {
            searchTerms.push(firstUnitWithKey.claveHRAEI.trim())
        }
        if (firstUnitWithKey.nombre && firstUnitWithKey.nombre.trim() !== '') {
            searchTerms.push(firstUnitWithKey.nombre.trim())
        }
        if (firstUnitWithKey.marca && firstUnitWithKey.marca.toUpperCase() !== 'N/A' && firstUnitWithKey.marca.trim() !== '') {
            searchTerms.push(firstUnitWithKey.marca.trim())
        }
        if (firstUnitWithKey.modelo && firstUnitWithKey.modelo.toUpperCase() !== 'N/A' && firstUnitWithKey.modelo.trim() !== '') {
            searchTerms.push(firstUnitWithKey.modelo.trim())
        }
    }
    
    const isValidInventory = searchTerms.length > 0
    
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
                            .filter(u => u.nombre?.trim())
                            .slice(0, 1)
                            .map(u => ({
                                tipo: newItem.tipo,
                                consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
                                cantidad: newItem.cantidad || 1,
                                unidades: [{ ...u, cantidad: newItem.cantidad || 1 }],
                                descripcion: u.descripcion || u.nombre || '',
                                nombre: u.nombre || u.descripcion || '',
                                marca: u.marca || '',
                                modelo: u.modelo || '',
                                lote: u.lote,
                                serie: u.serie,
                                referencia: u.referencia,
                                ubicacion: u.ubicacion,
                                equipoAsociado: u.equipoAsociado || '',
                                serieEquipoAsociado: u.serieEquipoAsociado || '',
                                origenBien: u.origenBien || '',
                                claveHRAEI: u.claveHRAEI,
                                isExternal: true
                            }))
                        : newItem.unidades
                            .filter(u => u.nombre?.trim())
                            .map(u => ({
                                tipo: newItem.tipo,
                                consumibleEstado: isConsumibleLikeType(newItem.tipo) ? newItem.consumibleEstado : null,
                                cantidad: Math.max(1, Number(u.cantidad) || 1),
                                unidades: [{ ...u, cantidad: Math.max(1, Number(u.cantidad) || 1) }],
                                descripcion: u.descripcion || u.nombre || '',
                                nombre: u.nombre || u.descripcion || '',
                                marca: u.marca || '',
                                modelo: u.modelo || '',
                                lote: u.lote,
                                serie: u.serie,
                                referencia: u.referencia,
                                ubicacion: u.ubicacion,
                                equipoAsociado: u.equipoAsociado || '',
                                serieEquipoAsociado: u.serieEquipoAsociado || '',
                                origenBien: u.origenBien || '',
                                claveHRAEI: u.claveHRAEI,
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
            console.warn('[OpSalidaNew] Error verificando estado:', err)
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
    if (pendingEquipment.value && pendingEquipment.value.items) {
        if (isEditingItem.value) {
            form.equiposSalida.splice(editingItemIndex.value, 1, ...pendingEquipment.value.items)
            notifier.success('Equipo actualizado pese a las advertencias')
        } else {
            for (const item of pendingEquipment.value.items) {
                form.equiposSalida.push(item)
            }
            notifier.success(`${pendingEquipment.value.items.length} equipo(s) agregado(s) 尽管 las advertencias`)
        }
        pendingEquipment.value = null
        equipmentWarnings.value = []
        resetNewItem()
    }
}

// Composable para confirmación de cierre
const { confirmAndClose } = useCloseConfirmation({
    title: '¿Deseas salir de la creación de orden de salida?',
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
    newItem.unidades = []
    newItem.isBlank = false
    belongsToHospital.value = null
    isVerifyingStatus.value = false
}

function buildBlankItemForType(tipo) {
    const blankUnit = createEmptyUnit()
    return {
        tipo,
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
    const idx = form.equiposSalida.indexOf(item)
    if (idx > -1) {
        form.equiposSalida.splice(idx, 1)
        if (editingItemIndex.value === idx) {
            resetNewItem()
        } else if (editingItemIndex.value > idx) {
            editingItemIndex.value--
        }
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
        if (suggestion.referenciaEquipo) unidad.referenciaEquipo = suggestion.referenciaEquipo
        if (suggestion.noInventario) unidad.noInventario = suggestion.noInventario
        if (suggestion.claveCNIS) unidad.claveCNIS = suggestion.claveCNIS
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
    form.motivoSalida = option.value
    if (option.value !== 'otro') {
        form.otroMotivo = ''
    }
    closeMotivoDropdown()
}

function assignAsOtherMotivo() {
    form.motivoSalida = 'otro'
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
        // Prepare extra fields for print
        const extraFieldsList = schemaSections.map(section => {
            const fields = formSchema.value.sections?.[section.id]?.fields || []
            const values = fields.map(f => {
                const val = form.extraFields[f.key]
                if (val === undefined || val === null || val === '') return null
                return { label: f.label, value: val }
            }).filter(Boolean)

            if (!values.length) return null
            return { sectionTitle: section.title, fields: values }
        }).filter(Boolean)

        const payload = {
            nombreSolicitante: form.nombreSolicitante,
            servicio: form.servicio,
            especialidad: form.especialidad,
            folio: form.folio || 'PREVIEW',
            orderType: 'salida',
            fecha: form.fecha,
            horaInicio: form.horaInicio,
            horaTermino: form.horaTermino,
            motivoSalida: form.motivoSalida,
            otroMotivo: form.otroMotivo,
            descripcion: form.descripcion,
            observaciones: form.observaciones,
            observacionesImg: form.observacionesImg,
            nombreIngeniero: form.nombreIngeniero,
            equiposSalida: form.equiposSalida,
            signatures: form.signatures,
            forceSinglePage: form.forceSinglePage,
            extraFields: form.extraFields,
            // Injected for template
            extraFieldsList,
            customTitle: formSchema.value?.printTitle,
            customSubtitle: formSchema.value?.printSubtitle,
            headerText: formSchema.value?.headerText,
            footerText: formSchema.value?.footerText,
            preview: true
        }

        // ADJUSTED ENDPOINT
        const res = await authedFetch('/api/ops/salida-pdf', {
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
        // Select endpoint:
        // - editing -> PUT /api/ops/salida/:id
        // - creating -> POST /api/ops/salida-with-inventory only when user requested to add to inventory
        //   otherwise POST /api/ops/salida (does not touch inventory)
        let endpoint
        if (props.modo === 'editar') {
            endpoint = `/api/ops/salida/${props.ordenId}`
        } else {
            // Use the unified endpoint which handles inventory conditionally on the server
            endpoint = '/api/ops/salida-with-inventory'
        }
        const method = props.modo === 'editar' ? 'PUT' : 'POST'

        // Transformar payload para backend: convertir equiposSalida a categories
        // Agrupar items por tipo para que se procesen en categorías correctas
        const categoriesMap = {}
        if (form.equiposSalida && form.equiposSalida.length > 0) {
            for (const item of form.equiposSalida) {
                const normalizedItem = buildSubmitItem(item)
                const tipo = (normalizedItem.tipo || 'equipo').toLowerCase()
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

                const _serieVal = normalizedItem.serie || normalizedItem.N || '';
                const _modeloVal = normalizedItem.modelo || normalizedItem.MODELO || '';
                const _marcaVal = normalizedItem.marca || normalizedItem.MARCA || '';
                const safeSerie = (_serieVal && String(_serieVal).trim().toUpperCase() === 'N/A') ? '' : _serieVal;
                const safeModelo = (_modeloVal && String(_modeloVal).trim().toUpperCase() === 'N/A') ? '' : _modeloVal;
                const safeMarca = (_marcaVal && String(_marcaVal).trim().toUpperCase() === 'N/A') ? '' : _marcaVal;
                categoriesMap[categoria].push({
                    claveHRAEI: normalizedItem.claveHRAEI || '',
                    consumibleEstado: normalizedItem.consumibleEstado || normalizedItem.consumible_estado || null,
                    itemId: `${normalizedItem.claveHRAEI || 'SIN_CLAVE'}|${safeSerie}|${safeModelo}|${safeMarca}`,
                    isExternal: normalizedItem.isExternal,
                    cantidad: normalizedItem.cantidad,
                    descripcion: normalizedItem.descripcion || '',
                    nombre: normalizedItem.nombre || normalizedItem.descripcion || '',
                    marca: normalizedItem.marca || '',
                    modelo: normalizedItem.modelo || '',
                    serie: normalizedItem.serie || '',
                    lote: normalizedItem.lote || '',
                    referencia: normalizedItem.referencia || '',
                    ubicacion: normalizedItem.ubicacion || '',
                    tipo: normalizedItem.tipo || 'equipo-medico',
                    equipoAsociado: normalizedItem.equipoAsociado || '',
                    serieEquipoAsociado: normalizedItem.serieEquipoAsociado || '',
                    origenBien: normalizedItem.origenBien || normalizedItem.origen_bien || '',
                    unidades: normalizedItem.unidades
                })
            }
        }

        // Convertir map a array de categorías
        const categories = Object.keys(categoriesMap).map(categoria => ({
            categoria,
            items: categoriesMap[categoria]
        }))

        const motivoSeleccionado = String(form.motivoSalida || '').trim()
        const payload = {
            ...form,
            motivoSalida: motivoSeleccionado,
            motivo_salida: motivoSeleccionado,
            // Compatibilidad con backends que aún leen el campo genérico
            motivoEntrada: motivoSeleccionado,
            motivo_entrada: motivoSeleccionado,
            agregarAlInventario: form.agregarAlInventario,
            categories: categories
        }

        console.debug('[OpSalidaNew] Enviando payload:', payload)
        const res = await authedFetch(endpoint, {
            method,
            body: payload
        })

        if (res && res.ok) {
            const responseData = await res.json()
            const folioGuardado = responseData.folio || form.folio

            // Mostrar mensaje provisto por el servidor (incluye tipo y folio cuando aplica)
            notifier.success(responseData.msg || (props.modo === 'editar' ? 'Orden actualizada' : 'Orden guardada'))

            if (props.modo !== 'editar') {
                clearDraftSalida()
            }

            // Enviar notificación al sistema
            if (props.modo !== 'editar') {
                notificationStore.notifyOrderCreated('salida', folioGuardado, form.nombreSolicitante || form.nombre_solicitante)
            }

            emit('actualizado')

            // Generar y descargar PDF
            try {
                const query = form.forceSinglePage ? '?forceSinglePage=true' : ''
                const pdfRes = await authedFetch(`/api/ops/salida/${encodeURIComponent(folioGuardado)}/pdfs/generated/download${query}`)
                if (!pdfRes.ok) {
                    throw new Error('No se pudo descargar el PDF generado')
                }
                const blob = await pdfRes.blob()
                // Asegurar que el blob tenga el tipo MIME correcto
                const pdfBlob = new Blob([blob], { type: 'application/pdf' })
                const url = window.URL.createObjectURL(pdfBlob)
                
                const link = document.createElement('a')
                link.href = url
                link.download = `salida_${folioGuardado || 'sin_folio'}.pdf`
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

            // Redirigir al order management
            setTimeout(() => {
                // Emitir evento de creación exitosa
                emit('created')
                // Ya no navegamos - el componente padre maneja el cierre del modal
            }, 500)
        } else {
            let errMsg = `HTTP ${res ? res.status : 'unknown'}`
            try {
                const errBody = await (res ? res.json() : Promise.resolve(null))
                if (errBody) errMsg = errBody.msg || errBody.error || errBody.message || JSON.stringify(errBody)
            } catch (e) {}
            notifier.error(`Error al guardar: ${errMsg}`)
            throw new Error(`Error al guardar: ${errMsg}`)
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

function initializeDateAndTime() {
    if (fechaAutomatica.value) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        form.fechaISO = `${year}-${month}-${day}`
        form.fecha = `${day}/${month}/${year}`
    }
}

function onFechaAutoChange() {
    if (fechaAutomatica.value) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        form.fechaISO = `${year}-${month}-${day}`
        form.fecha = `${day}/${month}/${year}`
    }
}

function onFechaManualInput(e) {
    const iso = e.target.value
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
        const res = await authedFetch('/api/ops/generate-folio/salida')
        if (res.ok) {
            const data = await res.json()
            try { console.log('[OpSalidaNew] generateFolioAutomatically setting folio', data && data.folio) } catch (e) {}
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

    // Attempt to restore draft: don't rely solely on sessionState
    // Some drafts may be saved without sessionState (direct saves)
    if (draftEnabled.value) {
        try {
            if (applyDraftSalida()) {
                draftLoaded = true
                console.log('[OpSalidaNew] Draft restored successfully')
                await nextTick()
                try { wizardRef.value?.goToStep(currentStep.value) } catch (e) {}
                // Solo limpiar sessionState después de restauración exitosa
                try { clearSessionState() } catch (e) {}
                console.log('[OpSalidaNew] Skipping ensureAutoFields after applyDraft')
            }
        } catch (e) {
            console.warn('[OpSalidaNew] Error restoring draft:', e)
        }
    }

    if (!draftLoaded) {
        // Pre-llenar formulario si se proporcionan initialItems (para equipos externos)
        if (props.initialItems && Array.isArray(props.initialItems) && props.initialItems.length > 0) {
            console.debug('[OpSalidaNew] Pre-llenando formulario con initialItems:', props.initialItems)
            console.log('[Wizard] FORM RESET DETECTED', new Error().stack)
            form.equiposSalida = props.initialItems.map(item => ({
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
            if (anyExternal) belongsToHospital.value = false
        } catch (e) {
            console.debug('[OpSalidaNew] Error comprobando externalidad en initialItems:', e)
        }
    }

    if (!draftLoaded || !form.nombreIngeniero) {
        forceAuthenticatedEngineerName()
    }
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    document.addEventListener('click', handleClickOutsideMotivo)

    // Load existing order or ensure auto fields only when NO draft was applied
    if (!draftLoaded) {
        if (props.modo === 'editar' && props.ordenId) {
            loadOrden()
        } else {
            ensureAutoFields()
        }
    } else {
        console.log('[OpSalidaNew] Skipping loadOrden/ensureAutoFields because draft was applied')
    }

    // Re-intentar aplicar borrador si se dispara el evento global (por ejemplo, tras navegación/restore)
    const handleRestoreApplyDrafts = async () => {
        if (!draftEnabled.value) return
        try {
            const draft = loadDraft()
            if (draft && draft.form) {
                    if (!draftLoaded) {
                        if (applyDraftSalida()) {
                            draftLoaded = true
                            console.log('[OpSalidaNew] Draft restored via restore:applyDrafts')
                            try { window.dispatchEvent(new CustomEvent('wizard:draft:applied', { detail: { storageKey: 'wizardDraft:salida' } })) } catch (e) {}
                            await nextTick()
                            try { wizardRef.value?.goToStep(currentStep.value) } catch (e) {}
                            try { clearSessionState() } catch (e) {}
                            console.log('[OpSalidaNew] Skipping ensureAutoFields after restore:applyDrafts')
                        }
                    }
            }
        } catch (e) {
            console.warn('[OpSalidaNew] restore:applyDrafts handler failed', e)
        }
    }
    try { window.addEventListener('restore:applyDrafts', handleRestoreApplyDrafts) } catch {}
    window.__opSalida_restoreHandler = handleRestoreApplyDrafts
    try { handleRestoreApplyDrafts() } catch (e) { console.warn('[OpSalidaNew] initial restore attempt failed', e) }

    
})

// Lazy load equipos médicos cuando el usuario selecciona ese tipo
watch(() => newItem.tipo, async (nuevoTipo) => {
    try {
        await ensureInventorySuggestionsForCurrentType(nuevoTipo)
    } catch (err) {
        console.error('[OpSalidaNew] Error loading inventory suggestions:', err)
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
        console.error('[OpSalidaNew] Error loading inventory suggestions after ownership change:', err)
    }
})

watch(() => props.ordenId, (newId) => {
    if (props.modo === 'editar' && newId) {
        if (!draftLoaded) {
            loadOrden()
        } else {
            console.log('[OpSalidaNew] Skipping loadOrden due to draftLoaded on ordenId change')
        }
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
    try {
        if (__opSalida_autosave_stop) {
            try { __opSalida_autosave_stop() } catch (e) {}
            __opSalida_autosave_stop = null
        }
    } catch (e) {}
    try { if (window.__opSalida_restoreHandler) { window.removeEventListener('restore:applyDrafts', window.__opSalida_restoreHandler); delete window.__opSalida_restoreHandler } } catch {}
    try { if (window.__opSalida_flushHandler) { window.removeEventListener('wizard:draft:flush', window.__opSalida_flushHandler); delete window.__opSalida_flushHandler } } catch {}
    try { if (window.__opSalida_discardHandler) { window.removeEventListener('wizard:draft:discard', window.__opSalida_discardHandler); delete window.__opSalida_discardHandler } } catch {}
})

async function loadOrden() {
    if (draftLoaded) {
        console.log('[OpSalidaNew] loadOrden skipped because draftLoaded === true')
        return
    }
    try {
        const res = await authedFetch(`/api/ops/salida/${props.ordenId}`)
        if (res.ok) {
            const data = await res.json()
            if (data && data.orden) {
                // Mapear campos de snake_case a camelCase para compatibilidad con el formulario
                const mappedOrden = mapSnakeToCamel(data.orden)
                console.log('[Wizard] FORM RESET DETECTED', new Error().stack)
                Object.assign(form, mappedOrden)
                form.motivoSalida = resolveMotivoFromSource(data.orden, mappedOrden)

                // Re-poblar firmas desde columnas planas si existen
                const sigs = JSON.parse(JSON.stringify(DEFAULT_SIGNATURES))
                for (const s of sigs) {
                    const colName = `firma_${s.key}_name`
                    const fixedCol = `firma_${s.key}_fixed`
                    const rawName = data.orden[colName]
                    const hasRealName = rawName && rawName !== 'PENDING'

                    // Siempre mostrar el bloque de firma (nameKnown=true),
                    // solo rellenar el nombre si hay uno real (distinto de PENDING).
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
                console.log('[Wizard] FORM RESET DETECTED', new Error().stack)
                // Mapear cada item también de snake_case a camelCase
                form.equiposSalida = data.items.map(item => mapSnakeToCamel(item))
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
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        result[camelKey] = obj[key]
    }
    return result
}

function resolveMotivoFromSource(...sources) {
    const keys = [
        'motivoSalida', 'motivo_salida',
        'motivoEntrada', 'motivo_entrada',
        'motivoResguardo', 'motivo_resguardo',
        'motivoServicio', 'motivo_servicio'
    ]
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue
        for (const key of keys) {
            const value = source[key]
            if (typeof value === 'string' && value.trim()) return value.trim()
        }
    }
    return ''
}
</script>

<style scoped>
.op-salida-new {
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

.fields-grid > * {
    min-width: 0;
    max-width: 100%;
}

.fields-grid.cols-4 {
    /* Auto-adapt para evitar quiebres en anchos intermedios */
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

/* Evitar recorte de inputs en modal + sidebar (anchos intermedios) */
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

/* Motivo Custom Select Support */
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
    transition: all 0.2s ease;
    text-align: left;
}

.motivo-trigger:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(148, 163, 184, 0.4);
}

.motivo-trigger .trigger-value.placeholder {
    color: rgba(148, 163, 184, 0.6);
}

.motivo-trigger .trigger-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 1200px) {
    .fields-grid.cols-4 {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .fields-grid,
    .fields-grid.cols-4 {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}

.trigger-chevron {
    width: 18px;
    height: 18px;
    color: rgba(148, 163, 184, 0.8);
    transition: transform 0.2s ease;
}

.trigger-chevron.rotated {
    transform: rotate(180deg);
}

.motivo-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    background: #1e293b;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4);
    z-index: 50;
    overflow: hidden;
    max-height: 380px;
    display: flex;
    flex-direction: column;
}

.dropdown-search {
    position: sticky;
    top: 0;
    padding: 12px;
    background: #1e293b;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
}

.dropdown-search svg {
    color: rgba(148, 163, 184, 0.6);
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 0.9rem;
    outline: none;
}

.dropdown-options {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
}

.dropdown-option {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: #e2e8f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.15s ease;
}

.dropdown-option:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
}

.dropdown-option.is-selected {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    font-weight: 500;
}

.dropdown-no-results {
    padding: 16px;
    text-align: center;
}

.no-results-text {
    color: rgba(148, 163, 184, 0.8);
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.btn-assign-other,
.btn-assign-other-small {
    width: 100%;
    padding: 10px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px dashed rgba(245, 158, 11, 0.5);
    color: #fbbf24;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.btn-assign-other:hover,
.btn-assign-other-small:hover {
    background: rgba(245, 158, 11, 0.25);
    transform: translateY(-1px);
}

.dropdown-assign-other-hint {
    padding: 8px 12px 12px;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
}

/* Equipment Type Grid */
.equipment-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 10px;
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.type-card:hover {
    background: rgba(30, 41, 59, 0.7);
    transform: translateY(-2px);
    border-color: rgba(148, 163, 184, 0.3);
}

.type-card.is-selected {
    background: rgba(30, 41, 59, 0.9);
    border-color: var(--type-color, #3b82f6);
    box-shadow: 0 0 0 1px var(--type-color, #3b82f6), 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.type-icon {
    width: 48px;
    height: 48px;
    padding: 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--type-color, #94a3b8);
    transition: all 0.2s ease;
}

.type-card.is-selected .type-icon {
    background: var(--type-color, #3b82f6);
    color: #fff;
}

.type-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
}

.type-card.is-selected .type-label {
    color: #fff;
}

/* Equipment Form */
.equipment-form {
    margin-top: 12px;
    background: rgba(30, 41, 59, 0.3);
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.form-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
}

.quantity-control {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 10px;
    padding: 4px;
}

.quantity-control button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.quantity-control button:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.5);
}

.quantity-control button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.quantity-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    min-width: 24px;
    text-align: center;
}

.accessory-note {
    font-size: 0.85rem;
    color: #94a3b8;
    background: rgba(15, 23, 42, 0.3);
    padding: 10px;
    border-radius: 8px;
    border-left: 3px solid #8b5cf6;
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

.unit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.unit-badge {
    font-size: 0.75rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    padding: 2px 8px;
    border-radius: 4px;
}

.unit-remove {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #ef4444;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.unit-remove:hover {
    background: rgba(239, 68, 68, 0.15);
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

.searchable-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mini-label {
    font-size: 0.75rem;
    color: rgba(148, 163, 184, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-add-equipment {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-add-equipment:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.btn-add-equipment:disabled {
    background: #334155;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
}

/* Button Group for Add Equipment */
.btn-add-equipment-group,
.equipment-buttons-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn-add-equipment-group .btn-add-equipment,
.equipment-buttons-group .btn-add-equipment {
    flex: 1;
    min-width: 180px;
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

.btn-add-blank {
    flex: 1;
    min-width: 180px;
    padding: 14px;
    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
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
    background: linear-gradient(135deg, #78716c 0%, #57534e 100%);
}

/* Quantity Field Styles */
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
    appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Quick Add Blank Button */
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
    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
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
    background: linear-gradient(135deg, #78716c 0%, #57534e 100%);
}

.quick-add-hint {
    font-size: 0.8rem;
    color: rgba(148, 163, 184, 0.7);
    text-align: center;
}

/* Type Card Blank */
.type-card-blank {
    border: 2px dashed rgba(100, 116, 139, 0.5) !important;
    background: rgba(100, 116, 139, 0.1) !important;
}

.type-card-blank:hover {
    border-color: rgba(100, 116, 139, 0.8) !important;
    background: rgba(100, 116, 139, 0.2) !important;
}

/* Modal para Item en Blanco */
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
    /* NO usar transform que cree nuevo stacking context */
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

/* Modal transitions */
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
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 6px 10px;
    border-radius: 8px;
    background: #334155;
    color: #cbd5e1;
    white-space: nowrap;
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

.consumible-state-hint {
    font-size: 0.75rem;
    color: rgba(203, 213, 225, 0.8);
    margin-top: 6px;
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

.item-details span strong {
    color: rgba(148, 163, 184, 0.6);
    font-weight: 500;
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

.item-edit {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-edit:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.6);
    color: #bfdbfe;
}

.item-edit.is-editing {
    background: rgba(245, 158, 11, 0.16);
    border-color: rgba(245, 158, 11, 0.5);
    color: #fbbf24;
}

/* Empty State */
.empty-equipment {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: #64748b;
    border: 2px dashed rgba(148, 163, 184, 0.1);
    border-radius: 16px;
}

.empty-equipment svg {
    margin-bottom: 16px;
    color: #334155;
}

.empty-equipment h4 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    color: #94a3b8;
}

.empty-equipment p {
    margin: 0;
    font-size: 0.95rem;
}

/* Field Wrapper auto display */
.field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
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
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.95rem;
}

.auto-field-display.live-time {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.05);
    gap: 10px;
}

.live-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    box-shadow: 0 0 8px #3b82f6;
    animation: pulse 2s infinite;
}

.time-live {
    color: #60a5fa;
    font-weight: 600;
}

/* Popover */
.info-popover-btn {
    background: none;
    border: none;
    padding: 0;
    color: #64748b;
    cursor: help;
    display: inline-flex;
    margin-left: 6px;
    vertical-align: middle;
}

.info-popover-btn:hover {
    color: #3b82f6;
}

.info-popover {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    width: max-content;
    max-width: 200px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.1);
    margin-bottom: 8px;
    z-index: 20;
}

/* Signatures */
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

.signature-card.has-name {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.05);
}

.sig-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.sig-role {
    font-size: 0.85rem;
    font-weight: 600;
    color: #e2e8f0;
    text-transform: uppercase;
    line-height: 1.4;
}

.sig-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
}

.sig-badge.fixed {
    background: rgba(148, 163, 184, 0.2);
    color: #94a3b8;
}

.sig-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
}

.sig-badge.complete {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
}

.sig-name-display {
    font-size: 0.95rem;
    color: #94a3b8;
    font-style: italic;
}

.sig-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 8px;
}

.sig-toggle {
    display: flex;
    background: rgba(15, 23, 42, 0.6);
    padding: 2px;
    border-radius: 6px;
}

.sig-toggle button {
    padding: 2px 8px;
    font-size: 0.75rem;
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

/* PDF Preview Modal */
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
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.1);
}

.pdf-preview-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.pdf-preview-header h3 {
    margin: 0;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
}

.pdf-preview-actions {
    display: flex;
    gap: 12px;
}

.btn-open-external,
.btn-close-preview {
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-open-external:hover,
.btn-close-preview:hover {
    background: rgba(255, 255, 255, 0.2);
}

.pdf-preview-body {
    flex: 1;
    background: #0f172a;
    position: relative;
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
    color: #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    font-weight: 500;
}

.btn-preview:hover:not(:disabled) {
    background: rgba(30, 41, 59, 0.8);
    border-color: #3b82f6;
    color: #3b82f6;
}

.btn-preview:disabled {
    opacity: 0.6;
    cursor: wait;
}

.btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-left-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Animations */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        opacity: 0.5;
    }

    50% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(0.95);
        opacity: 0.5;
    }
}

/* Transitions */
.popover-fade-enter-active,
.popover-fade-leave-active,
.dropdown-enter-active,
.dropdown-leave-active,
.slide-up-enter-active,
.slide-up-leave-active,
.slide-fade-enter-active,
.slide-fade-leave-active,
.unit-list-enter-active,
.unit-list-leave-active,
.equipment-item-enter-active,
.equipment-item-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
    opacity: 0;
    transform: translateY(4px) translateX(-50%);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

.unit-list-enter-from,
.unit-list-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.equipment-item-enter-from,
.equipment-item-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
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

/* ACR Modal */
.type-card-acr { border-color: rgba(6,182,212,0.3) !important; }
.type-card-acr:hover { border-color: rgba(6,182,212,0.6) !important; }
.type-card-acr.is-selected { border-color: rgba(6,182,212,0.8) !important; background: rgba(6,182,212,0.12) !important; }
.acr-modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px; }
.acr-modal { background:linear-gradient(135deg,rgba(20,24,40,0.98),rgba(15,20,35,0.98));border:1px solid rgba(6,182,212,0.25);border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.6); }
.acr-modal-header { display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,0.07); }
.acr-modal-title { display:flex;align-items:center;gap:10px;color:rgba(6,182,212,0.9); }
.acr-modal-title span { font-size:0.95rem;font-weight:600;color:rgba(230,235,245,0.92); }
.acr-modal-close { background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.6);width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s; }
.acr-modal-close:hover { background:rgba(239,68,68,0.2);color:#ef4444; }
.acr-modal-body { padding:20px; }
.acr-hint { font-size:0.79rem;color:rgba(255,255,255,0.4);margin:0 0 14px;text-align:center;line-height:1.5; }
.acr-category-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px; }
.acr-cat-btn { display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:rgba(230,235,245,0.85);font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.2s; }
.acr-cat-btn:hover { background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2);transform:translateY(-2px); }
.acr-cat-icon { width:50px;height:50px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:var(--cat-color);background:color-mix(in srgb, var(--cat-color) 15%, transparent); }

/* NUEVA SECCIÓN DE FECHA PREMIUM - EVITA RECORTE Y MEJORA ESTILO */
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
    min-width: 260px;
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
}

.date-simple-input {
    background: transparent !important;
    border: none !important;
    color: #3b82f6 !important;
    font-size: 0.95rem !important;
    font-weight: 700 !important;
    padding: 0 !important;
    width: 160px !important;
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
</style>
