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
                                label="Nombre del Solicitante" placeholder="Nombre completo de quien solicita" required
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

                            <div class="field-wrapper span-1" v-if="isFieldVisible('fecha')">
                                <label class="field-label">
                                    Fecha
                                    <button type="button" class="info-popover-btn" @mouseenter="showDateInfo = true"
                                        @mouseleave="showDateInfo = false" aria-haspopup="true"
                                        aria-expanded="showDateInfo">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                    </button>
                                    <Transition name="popover-fade">
                                        <div v-if="showDateInfo" class="info-popover" @mouseenter="showDateInfo = true"
                                            @mouseleave="showDateInfo = false">
                                            La fecha se asigna automáticamente al momento de crear la orden.
                                        </div>
                                    </Transition>
                                </label>
                                <div class="auto-field-display">
                                    <span class="auto-value">{{ form.fecha || '--/--/----' }}</span>
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
                                                    @click="selectMotivo(option)">
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
                                                        @click="assignAsOtherMotivo">
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
                                                        @click="assignAsOtherMotivo">
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

                        <!-- Equipment Form (conditionally shown) -->
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

                                <div v-if="newItem.tipo === 'accesorio'" class="accessory-note">
                                    <small><strong>Requeridos para accesorios:</strong> Nombre/Descripción, Marca,
                                        Modelo, Lote, No. Serie,
                                        Referencia, Ubicación, Equipo Asociado, Clave HRAEI.</small>
                                </div>

                                <!-- Equipment Units Grid -->
                                <div class="units-list">
                                    <TransitionGroup name="unit-list">
                                        <div v-for="(unidad, idx) in newItem.unidades" :key="idx" class="unit-card">
                                            <div class="unit-header">
                                                <span class="unit-badge">#{{ idx + 1 }}</span>
                                                <button type="button" class="unit-remove" @click="removeUnit(idx)"
                                                    v-if="newItem.unidades.length > 1">
                                                </button>
                                                <button type="button" class="unit-kardex" @click="openKardex(unidad)"
                                                    v-if="unidad.claveHRAEI" title="Ver kardex">
                                                    <VueIcon name="ic:baseline-description" size="16" />
                                                </button>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
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
                                                    <label class="mini-label">Referencia</label>
                                                    <SearchableInput v-model="unidad.referencia"
                                                        :suggestions="currentSuggestions" field-name="referencia"
                                                        placeholder="Ej. REF-001"
                                                        @select="(s) => handleSuggestionSelect(s, unidad, 'referencia')" />
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
                                    <span class="toggle-label">✓ Descontar del inventario</span>
                                    <span class="toggle-description">
                                        Activa esta opción para descontar los equipos del sistema de inventario.
                                        <strong>Entrada:</strong> Aumenta el stock. <strong>Salida:</strong> Disminuye el stock.
                                    </span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="form.agregarAlInventario">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
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

                                    <div class="item-info">
                                        <div class="item-header">
                                            <h5 class="item-name">{{ item.descripcion }}</h5>
                                            <div class="item-quantity-badge">{{ item.cantidad }}</div>
                                        </div>
                                        <p class="item-quantity-text">{{ item.cantidad }} {{ item.cantidad !== 1 ?
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
                                            <ModernInput v-if="sig.nameKnown" v-model="sig.name"
                                                placeholder="Nombre completo" size="small" class="sig-name-input" />
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

// Composables
import { useInventorySuggestions } from '@/composables/useInventorySuggestions.js'
import { useOrderItemValidation } from '@/composables/useOrderItemValidation.js'
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
    const authName = getAuthenticatedUserName()
    if (authName) {
        form.nombreIngeniero = authName
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
})

const motivoSalidaOptionsComputed = computed(() => {
    const override = formSchema.value?.optionSets?.motivoSalida
    return (Array.isArray(override) && override.length) ? override : motivoSalidaOptions
})
// ----------------------------

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

// Equipment Warnings
const showWarningModal = ref(false)
const pendingEquipment = ref(null)
const equipmentWarnings = ref([])
const belongsToHospital = ref(null) // Para la pregunta: ¿Pertenece al Hospital?

// Info popover states
const showDateInfo = ref(false)
const showHoraTerminoInfo = ref(false)

// Timer state - automatic, updates every second
let timerInterval = null
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

// New item state
const newItem = reactive({
    tipo: '',
    cantidad: 1,
    descripcion: '',
    marca: '',
    modelo: '',
    serie: '',
    ubicacion: '',
    claveHRAEI: '',
    unidades: []
})

// Equipment types with icons and colors
const tipoSalidaOptions = [
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
    if (!newItem.tipo) return false
    // Basic: must have at least one unidad with a name
    if (!newItem.unidades.length || !newItem.unidades.some(u => u.nombre?.trim())) return false

    // If accessory, require more fields to ensure data completeness
    if (newItem.tipo === 'accesorio') {
        return newItem.unidades.some(u => (
            u.nombre?.trim() && u.marca?.trim() && u.modelo?.trim() && u.lote?.trim() && u.serie?.trim() && u.referencia?.trim() && u.ubicacion?.trim() && u.claveHRAEI?.trim()
        ))
    }

    return true
})

const isValid = computed(() => {
    return form.nombreSolicitante.trim() &&
        form.motivoSalida &&
        form.equiposSalida.length > 0
})

// Timer computed for displaying live time (HH:MM:SS format)
const displayEndTime = computed(() => {
    return liveTimeDisplay.value || form.horaTermino || '--:--:--'
})

// Suggestions list based on current item type
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
    return form.nombreSolicitante?.trim()?.length > 0
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
        ubicacion: '',
        equipoAsociado: '',
        claveHRAEI: '',
        cantidad: 1
    }
}

// Quantity controls - LÓGICA LIMPIA
function incNew() {
    if (newItem.cantidad < 100) {
        newItem.cantidad++
        // Agregar unidad vacía para mantener sincronización
        if (newItem.unidades.length < newItem.cantidad) {
            newItem.unidades.push(createEmptyUnit())
        }
    }
}

function decNew() {
    if (newItem.cantidad > 1) {
        newItem.cantidad--
        // Remover unidades extras
        while (newItem.unidades.length > newItem.cantidad) {
            newItem.unidades.pop()
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

// Add equipment - UN ITEM POR CADA UNIDAD CON SU PROPIA CANTIDAD
async function agregarItem() {
    if (!canAddItem.value) {
        if (newItem.tipo === 'accesorio') {
            notifier.error('Completa los campos requeridos: nombre, marca, modelo, lote, serie, referencia, ubicación y clave HRAEI')
        } else {
            notifier.error('Completa al menos el nombre del equipo')
        }
        return
    }

    // CRUCIAL: Por cada unidad, crear un item INDEPENDIENTE con SU PROPIA CANTIDAD
    let itemsAgregados = 0

    // Verificar estado del primer equipo con clave HRAEI o serie válida
    const firstUnitWithKey = newItem.unidades.find(u => {
        const inv = u.claveHRAEI || u.serie
        return inv && inv.toUpperCase() !== 'N/A' && inv.trim() !== ''
    })
    
    // Construir lista de términos de búsqueda (serie, claveHRAEI, nombre, marca, modelo)
    const searchTerms = []
    
    if (firstUnitWithKey) {
        // 1. Número de serie primero (más específico)
        if (firstUnitWithKey.serie && firstUnitWithKey.serie.toUpperCase() !== 'N/A' && firstUnitWithKey.serie.trim() !== '') {
            searchTerms.push(firstUnitWithKey.serie.trim())
        }
        
        // 2. Clave HRAEI
        if (firstUnitWithKey.claveHRAEI && firstUnitWithKey.claveHRAEI.toUpperCase() !== 'N/A' && firstUnitWithKey.claveHRAEI.trim() !== '') {
            searchTerms.push(firstUnitWithKey.claveHRAEI.trim())
        }
        
        // 3. Nombre del equipo
        if (firstUnitWithKey.nombre && firstUnitWithKey.nombre.trim() !== '') {
            searchTerms.push(firstUnitWithKey.nombre.trim())
        }
        
        // 4. Marca
        if (firstUnitWithKey.marca && firstUnitWithKey.marca.toUpperCase() !== 'N/A' && firstUnitWithKey.marca.trim() !== '') {
            searchTerms.push(firstUnitWithKey.marca.trim())
        }
        
        // 5. Modelo
        if (firstUnitWithKey.modelo && firstUnitWithKey.modelo.toUpperCase() !== 'N/A' && firstUnitWithKey.modelo.trim() !== '') {
            searchTerms.push(firstUnitWithKey.modelo.trim())
        }
    }
    
    console.log('[OpSalidaNew] Términos de búsqueda:', searchTerms)
    
    const isValidInventory = searchTerms.length > 0
    
    if (firstUnitWithKey && newItem.tipo === 'equipo-medico' && isValidInventory) {
        try {
            // Enviar todos los términos de búsqueda al backend
            const statusData = await getEquipmentStatus(searchTerms)
            console.log('[OpSalidaNew] Estado recibido:', statusData)
            console.log('[OpSalidaNew] SearchTerms:', searchTerms, 'StatusData keys:', Object.keys(statusData))
            
            // Buscar el primer término que tenga un estado válido
            let equipmentStatus = null
            let matchedTerm = null
            
            for (const term of searchTerms) {
                console.log(`[OpSalidaNew] Checking term "${term}":`, statusData[term])
                if (statusData[term] && statusData[term].status && statusData[term].status !== 'unknown') {
                    equipmentStatus = statusData[term]
                    matchedTerm = term
                    console.log(`[OpSalidaNew] Found valid status for term "${term}"`)
                    break
                }
            }
            
            if (equipmentStatus) {
                console.log('[OpSalidaNew] Equipo encontrado con término:', matchedTerm, 'Estado:', equipmentStatus)
                const { analyzeEquipmentStatus } = await import('@/composables/useEquipmentWarnings.js')
                const warnings = analyzeEquipmentStatus(equipmentStatus, matchedTerm)
                console.log('[OpSalidaNew] Warnings generadas:', warnings)
                const highSeverityWarnings = warnings.filter(w => w.severity === 'high' && w.allowOverride)
                
                if (highSeverityWarnings.length > 0) {
                    console.log('[OpSalidaNew] Showing warning modal with', highSeverityWarnings.length, 'high-severity warnings')
                    // Preparar los items para añadir después de confirmación
                    const itemsToAdd = newItem.unidades
                        .filter(u => u.nombre?.trim())
                        .map(u => ({
                            tipo: newItem.tipo,
                            cantidad: Math.max(1, u.cantidad || 1),
                            descripcion: u.nombre,
                            marca: u.marca,
                            modelo: u.modelo,
                            lote: u.lote,
                            serie: u.serie,
                            referencia: u.referencia,
                            ubicacion: u.ubicacion,
                            equipoAsociado: u.equipoAsociado || '',
                            serieEquipoAsociado: u.serieEquipoAsociado || '',
                            claveHRAEI: u.claveHRAEI
                        }))
                    
                    pendingEquipment.value = { items: itemsToAdd, isMultiple: true }
                    equipmentWarnings.value = warnings
                    showWarningModal.value = true
                    return
                } else {
                    console.log('[OpSalidaNew] No high-severity warnings found, proceeding without modal')
                }
            } else {
                console.log('[OpSalidaNew] No equipment status found for any search term')
            }
        } catch (error) {
            console.warn('[OpSalidaNew] Error verificando estado del equipo:', error)
        }
    }

    for (const unidad of newItem.unidades) {
        if (!unidad.nombre?.trim()) continue

        const cantidadDeEstaUnidad = Math.max(1, unidad.cantidad || 1)

        form.equiposSalida.push({
            tipo: newItem.tipo,
            cantidad: cantidadDeEstaUnidad,  // LA CANTIDAD QUE EL USUARIO PUSO EN ESTA UNIDAD
            descripcion: unidad.nombre,
            marca: unidad.marca,
            modelo: unidad.modelo,
            lote: unidad.lote,
            serie: unidad.serie,
            referencia: unidad.referencia,
            ubicacion: unidad.ubicacion,
            equipoAsociado: unidad.equipoAsociado || '',
            serieEquipoAsociado: unidad.serieEquipoAsociado || '',
            claveHRAEI: unidad.claveHRAEI
        })

        console.log('✓ Item guardado:', {
            tipo: newItem.tipo,
            cantidad: cantidadDeEstaUnidad,
            descripcion: unidad.nombre
        })

        itemsAgregados++
    }

    if (itemsAgregados > 0) {
        notifier.success(`${itemsAgregados} equipo(s) agregado(s)`)
        resetNewItem()
    } else {
        notifier.error('Completa al menos un equipo')
    }
}

// Confirmar añadir equipo con advertencias
function confirmAddWithWarnings() {
    if (pendingEquipment.value && pendingEquipment.value.items) {
        for (const item of pendingEquipment.value.items) {
            form.equiposSalida.push(item)
        }
        notifier.success(`${pendingEquipment.value.items.length} equipo(s) agregado(s) 尽管 las advertencias`)
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
    newItem.tipo = ''
    newItem.cantidad = 1
    newItem.descripcion = ''
    newItem.marca = ''
    newItem.modelo = ''
    newItem.serie = ''
    newItem.ubicacion = ''
    newItem.claveHRAEI = ''
    newItem.unidades = []
}

// Agregar item en blanco con valores N/A
function agregarItemBlanco() {
    if (!newItem.tipo) {
        notifier.error('Selecciona primero un tipo de item')
        return
    }

    form.equiposSalida.push({
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
            equipoAsociado: 'N/A',
            claveHRAEI: 'N/A',
            cantidad: 1
        }]
    })

    notifier.success('Item en blanco agregado')
    resetNewItem()
}

// Agregar item en blanco con tipo específico (desde el modal)
function agregarItemBlancoConTipo(tipo) {
    form.equiposSalida.push({
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
            equipoAsociado: 'N/A',
            claveHRAEI: 'N/A',
            cantidad: 1
        }]
    })

    showBlankItemModal.value = false
    notifier.success('Item en blanco agregado')
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
    if (!form.nombreSolicitante?.trim()) {
        notifier.error('Completa al menos el nombre del solicitante')
        return
    }

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
        const endpoint = props.modo === 'editar'
            ? `/api/ops/salida/${props.ordenId}`
            : '/api/ops/salida-with-inventory'
        const method = props.modo === 'editar' ? 'PUT' : 'POST'

        // Transformar payload para backend: convertir equiposSalida a categories
        // Agrupar items por tipo para que se procesen en categorías correctas
        const categoriesMap = {}
        if (form.equiposSalida && form.equiposSalida.length > 0) {
            for (const item of form.equiposSalida) {
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
                    cantidad: Math.max(1, item.cantidad),  // BRUTAL: siempre usa item.cantidad
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
            motivoSalida: form.motivoEntrada || form.motivoSalida || '',  // Mapear a campo correcto
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

            // Mostrar mensaje provisto por el servidor (incluye tipo y folio cuando aplica)
            notifier.success(responseData.msg || (props.modo === 'editar' ? 'Orden actualizada' : 'Orden guardada'))

            // Enviar notificación al sistema
            if (props.modo !== 'editar') {
                notificationStore.notifyOrderCreated('salida', folioGuardado, form.nombreSolicitante || form.nombre_solicitante)
            }

            emit('actualizado')

            // Generar y descargar PDF
            try {
                const pdfRes = await authedFetch(`/api/ops/salida/${encodeURIComponent(folioGuardado)}/pdfs/generated/download`)
                if (!pdfRes.ok) {
                    throw new Error('No se pudo descargar el PDF generado')
                }
                const blob = await pdfRes.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `salida_${folioGuardado}.pdf`)
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

// Responsive check
function checkMobileView() {
    isMobileView.value = window.innerWidth < 1200
}

// Auto-assign date only (hora inicio is manual, hora termino is live timer)
function initializeDateAndTime() {
    const now = new Date()

    // Set current date in both formats
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    form.fechaISO = `${year}-${month}-${day}`
    form.fecha = `${day}/${month}/${year}`

    // horaInicio is NOT auto-assigned - user must enter it
    // horaTermino will be set by the live timer
}

// Auto-generate folio for new orders
async function generateFolioAutomatically() {
    try {
        const res = await authedFetch('/api/ops/generate-folio/salida')
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

// Lifecycle
onMounted(async () => {
    forceAuthenticatedEngineerName()
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
        console.error('[OpSalidaNew] Error loading insumos suggestions:', err)
    }

    // Load existing order if editing
    if (props.modo === 'editar' && props.ordenId) {
        loadOrden()
    } else {
        // Auto-assign date for new orders
        initializeDateAndTime()
        // Auto-generate folio for new orders
        generateFolioAutomatically()
        // Start live timer for new orders (automatic, no controls)
        startLiveTimer()
    }
})

// Lazy load equipos médicos cuando el usuario selecciona ese tipo
watch(() => newItem.tipo, async (nuevoTipo) => {
    if ((nuevoTipo === 'equipo-medico' || nuevoTipo === 'mobiliario') && !equipoMedicoList.value.length) {
        try {
            await fetchEquipoMedicoSuggestions()
        } catch (err) {
            console.error('[OpSalidaNew] Error loading equipos médicos:', err)
        }
    }
})

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
})

async function loadOrden() {
    try {
        const res = await authedFetch(`/api/ops/salida/${props.ordenId}`)
        if (res.ok) {
            const data = await res.json()
            if (data && data.orden) {
                // Mapear campos de snake_case a camelCase para compatibilidad con el formulario
                const mappedOrden = mapSnakeToCamel(data.orden)
                Object.assign(form, mappedOrden)
            }
            if (data && Array.isArray(data.items)) {
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
    transform: translateY(20px);
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