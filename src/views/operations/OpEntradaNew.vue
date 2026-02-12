<template>
  <div class="op-entrada-new" :class="{ 'is-submitting': loading }">
    <OperationWizard
      type="entrada"
      :title="wizardTitle"
      :folio="form.folio"
      :steps="wizardSteps"
      :can-proceed="canProceedToNext"
      :can-submit="isValid"
      :is-submitting="loading"
      :submit-label="submitLabel"
      :show-sidebar="!isMobileView"
      @back="onBack"
      @submit="onSubmit"
      @step-change="onStepChange"
      ref="wizardRef"
    >
      <!-- ========== STEP 0: Solicitante ========== -->
      <template #step-0>
        <div class="wizard-step">
          <WizardStepCard title="Datos del Solicitante" subtitle="Información básica de quien solicita la entrada" icon-color="#22c55e">
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </template>
            
            <div class="fields-grid">
              <ModernInput
                v-model="form.nombreSolicitante"
                label="Nombre del Solicitante"
                placeholder="Nombre completo de quien solicita"
                required
                :error-message="getFieldError('nombreSolicitante')"
              >
                <template #prefix>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </template>
              </ModernInput>

              <ModernInput
                v-model="form.servicio"
                label="Servicio"
                placeholder="Ej. Cardiología, Urgencias"
              >
                <template #prefix>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1"/>
                    <rect x="4" y="3" width="16" height="18" rx="2"/>
                  </svg>
                </template>
              </ModernInput>

              <ModernInput
                v-model="form.especialidad"
                label="Especialidad"
                placeholder="Ej. Medicina Interna"
              >
                <template #prefix>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </template>
              </ModernInput>
            </div>
          </WizardStepCard>

          <WizardStepCard class="tall" title="Fecha y Horario" subtitle="Cuándo se realiza la entrada" icon-color="#3b82f6">
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </template>

            <div class="fields-grid cols-4">
              <div class="field-wrapper span-1">
                <label class="field-label">Folio</label>
                <FolioInput v-model="form.folio" prefix="E-" />
              </div>

              <div class="field-wrapper span-1">
                <label class="field-label">
                  Fecha
                  <button
                    type="button"
                    class="info-popover-btn"
                    @mouseenter="showDateInfo = true"
                    @mouseleave="showDateInfo = false"
                    aria-haspopup="true"
                    aria-expanded="showDateInfo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </button>
                  <Transition name="popover-fade">
                    <div
                      v-if="showDateInfo"
                      class="info-popover"
                      @mouseenter="showDateInfo = true"
                      @mouseleave="showDateInfo = false"
                    >
                      La fecha se asigna automáticamente al momento de crear la orden.
                    </div>
                  </Transition>
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
                  <button
                    type="button"
                    class="info-popover-btn"
                    @mouseenter="showHoraTerminoInfo = true"
                    @mouseleave="showHoraTerminoInfo = false"
                    aria-haspopup="true"
                    aria-expanded="showHoraTerminoInfo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </button>
                  <Transition name="popover-fade">
                    <div
                      v-if="showHoraTerminoInfo"
                      class="info-popover"
                      @mouseenter="showHoraTerminoInfo = true"
                      @mouseleave="showHoraTerminoInfo = false"
                    >
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
          <WizardStepCard class="tall" title="Motivo de Entrada" subtitle="Razón por la cual ingresa el equipo" icon-color="#f59e0b">
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </template>

            <div class="fields-grid">
              <div class="field-wrapper span-full">
                <label class="field-label">Motivo de Entrada <span class="required">*</span></label>
                
                <!-- Custom searchable select with "assign as other" feature -->
                <div class="motivo-select-wrapper" ref="motivoSelectRef">
                  <button
                    type="button"
                    class="motivo-trigger"
                    :class="{ 'is-open': showMotivoDropdown }"
                    @click="toggleMotivoDropdown"
                  >
                    <span class="trigger-value" :class="{ placeholder: !form.motivoEntrada }">
                      {{ selectedMotivoLabel || 'Selecciona el motivo...' }}
                    </span>
                    <svg 
                      class="trigger-chevron" 
                      :class="{ rotated: showMotivoDropdown }"
                      width="18" height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2"
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  <Transition name="dropdown">
                    <div v-if="showMotivoDropdown" class="motivo-dropdown">
                      <!-- Search input -->
                      <div class="dropdown-search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input
                          ref="motivoSearchRef"
                          v-model="motivoSearchQuery"
                          type="text"
                          class="search-input"
                          placeholder="Buscar motivo..."
                          @click.stop
                        />
                      </div>

                      <!-- Options list -->
                      <div class="dropdown-options">
                        <button
                          v-for="option in filteredMotivoOptions"
                          :key="option.value"
                          type="button"
                          class="dropdown-option"
                          :class="{ 'is-selected': form.motivoEntrada === option.value }"
                          @click="selectMotivo(option)"
                        >
                          <span class="option-label">{{ option.label }}</span>
                          <svg 
                            v-if="form.motivoEntrada === option.value"
                            class="option-check"
                            width="16" height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="2"
                          >
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>

                        <!-- No results + assign as other -->
                        <div v-if="filteredMotivoOptions.length === 0 && motivoSearchQuery.trim()" class="dropdown-no-results">
                          <p class="no-results-text">No se encontró "{{ motivoSearchQuery }}"</p>
                          <button
                            type="button"
                            class="btn-assign-other"
                            @click="assignAsOtherMotivo"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Asignar como otro motivo: "{{ motivoSearchQuery }}"
                          </button>
                        </div>

                        <!-- Show "assign as other" also when there are results but search doesn't match exactly -->
                        <div v-else-if="motivoSearchQuery.trim() && !hasExactMotivoMatch" class="dropdown-assign-other-hint">
                          <button
                            type="button"
                            class="btn-assign-other-small"
                            @click="assignAsOtherMotivo"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            ¿No está en la lista? Asignar como otro: "{{ motivoSearchQuery }}"
                          </button>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <Transition name="slide-fade">
                <ModernInput
                  v-if="form.motivoEntrada === 'otro'"
                  v-model="form.otroMotivo"
                  label="Especifica el motivo"
                  placeholder="Describe el motivo de entrada"
                  class="span-full"
                />
              </Transition>

              <ModernInput
                v-model="form.descripcion"
                label="Descripción General"
                placeholder="Descripción detallada del motivo de entrada..."
                multiline
                :rows="4"
                class="span-full"
              />
            </div>
          </WizardStepCard>
        </div>
      </template>

      <!-- ========== STEP 2: Equipos ========== -->
      <template #step-2>
        <div class="wizard-step">
          <!-- Add Equipment Card -->
          <WizardStepCard 
            title="Agregar Equipo" 
            subtitle="Selecciona el tipo y completa la información"
            icon-color="#8b5cf6"
          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </template>

            <!-- Equipment Type Selector -->
            <div class="equipment-type-grid">
              <button
                v-for="tipo in tipoEntradaOptions"
                :key="tipo.value"
                type="button"
                class="type-card"
                :class="{ 'is-selected': newItem.tipo === tipo.value }"
                @click="selectEquipmentType(tipo.value)"
              >
                <div class="type-icon" :style="{ '--type-color': tipo.color }">
                  <component :is="tipo.icon" />
                </div>
                <span class="type-label">{{ tipo.label }}</span>
              </button>
            </div>

            <!-- Equipment Form (conditionally shown) -->
            <Transition name="slide-up">
              <div v-if="newItem.tipo" class="equipment-form">
                <div class="form-header">
                  <h4>{{ getSelectedTypeLabel() }}</h4>
                  <div class="quantity-control">
                    <button type="button" @click="decNew" :disabled="newItem.cantidad <= 1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    <span class="quantity-value">{{ newItem.cantidad }}</span>
                    <button type="button" @click="incNew">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="newItem.tipo === 'accesorio'" class="accessory-note">
                  <small><strong>Requeridos para accesorios:</strong> Nombre/Descripción, Marca, Modelo, Lote, No. Serie, Referencia, Ubicación, Equipo Asociado, Clave HRAEI.</small>
                </div>

                <!-- Equipment Units Grid -->
                <div class="units-list">
                  <TransitionGroup name="unit-list">
                    <div 
                      v-for="(unidad, idx) in newItem.unidades" 
                      :key="idx"
                      class="unit-card"
                    >
                      <div class="unit-header">
                        <span class="unit-badge">#{{ idx + 1 }}</span>
                        <button 
                          type="button" 
                          class="unit-remove"
                          @click="removeUnit(idx)"
                          v-if="newItem.unidades.length > 1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div class="unit-fields">
                        <div class="searchable-field">
                          <label class="mini-label">Nombre / Descripción</label>
                          <SearchableInput
                            v-model="unidad.nombre"
                            :suggestions="currentSuggestions"
                            field-name="nombre"
                            :placeholder="getNombrePlaceholder()"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'nombre')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">Marca</label>
                          <SearchableInput
                            v-model="unidad.marca"
                            :suggestions="currentSuggestions"
                            field-name="marca"
                            placeholder="Ej. Philips"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'marca')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">Modelo</label>
                          <SearchableInput
                            v-model="unidad.modelo"
                            :suggestions="currentSuggestions"
                            field-name="modelo"
                            placeholder="Ej. MX40"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'modelo')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">Lote</label>
                          <SearchableInput
                            v-model="unidad.lote"
                            :suggestions="currentSuggestions"
                            field-name="lote"
                            placeholder="Ej. LT-2026"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'lote')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">No. Serie</label>
                          <SearchableInput
                            v-model="unidad.serie"
                            :suggestions="currentSuggestions"
                            field-name="serie"
                            placeholder="Ej. SN123456"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'serie')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">Referencia</label>
                          <SearchableInput
                            v-model="unidad.referencia"
                            :suggestions="currentSuggestions"
                            field-name="referencia"
                            placeholder="Ej. REF-001"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'referencia')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">Ubicación</label>
                          <SearchableInput
                            v-model="unidad.ubicacion"
                            :suggestions="currentSuggestions"
                            field-name="ubicacion"
                            placeholder="Ej. UCIA"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'ubicacion')"
                          />
                        </div>

                        <div v-if="newItem.tipo === 'accesorio'" class="searchable-field">
                          <label class="mini-label">Equipo Asociado</label>
                          <SearchableInput
                            v-model="unidad.equipoAsociado"
                            :suggestions="equipoMedicoList"
                            tipo="equipo-medico"
                            field-name="nombre"
                            placeholder="Buscar equipo asociado..."
                            @select="(s) => unidad.equipoAsociado = (s.nombre || s.label || '')"
                          />
                        </div>

                        <div class="searchable-field">
                          <label class="mini-label">Clave HRAEI</label>
                          <SearchableInput
                            v-model="unidad.claveHRAEI"
                            :suggestions="currentSuggestions"
                            field-name="claveHRAEI"
                            placeholder="Ej. COMODATO"
                            @select="(s) => handleSuggestionSelect(s, unidad, 'claveHRAEI')"
                          />
                        </div>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>

                <button 
                  type="button" 
                  class="btn-add-equipment"
                  @click="agregarItem"
                  :disabled="!canAddItem"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Agregar {{ getSelectedTypeLabel() }}
                </button>
              </div>
            </Transition>
          </WizardStepCard>

          <!-- Added Equipment List -->
          <WizardStepCard 
            v-if="form.equiposEntrada.length > 0"
            :title="`Equipos Agregados (${form.equiposEntrada.length})`"
            subtitle="Lista de equipos que entrarán"
            icon-color="#10b981"
            collapsible
          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </template>
            <template #actions>
              <span class="items-count-badge">{{ form.equiposEntrada.length }}</span>
            </template>

            <div class="equipment-list">
              <TransitionGroup name="equipment-item">
                <div 
                  v-for="(item, index) in form.equiposEntrada" 
                  :key="index"
                  class="equipment-item"
                >
                  <div class="item-type-badge" :class="`type-${item.tipo}`">
                    {{ getTipoLabel(item.tipo) }}
                  </div>
                  
                  <div class="item-info">
                    <div class="item-header">
                      <h5 class="item-name">{{ item.descripcion || item.unidades?.[0]?.nombre || 'Sin nombre' }}</h5>
                      <div class="item-quantity-badge">{{ item.unidades?.length || 1 }}</div>
                    </div>
                    <p class="item-quantity-text">{{ item.unidades?.length || 1 }} unidad{{ (item.unidades?.length || 1) !== 1 ? 'es' : '' }} de {{ getTipoLabel(item.tipo).toLowerCase() }}</p>
                    <div class="item-details">
                      <span v-if="item.marca"><strong>Marca:</strong> {{ item.marca }}</span>
                      <span v-if="item.modelo"><strong>Modelo:</strong> {{ item.modelo }}</span>
                      <span v-if="item.lote"><strong>Lote:</strong> {{ item.lote }}</span>
                      <span v-if="item.referencia"><strong>Referencia:</strong> {{ item.referencia }}</span>
                      <span v-if="item.serie"><strong>Serie:</strong> {{ item.serie }}</span>
                      <span v-if="item.ubicacion"><strong>Ubicación:</strong> {{ item.ubicacion }}</span>
                      <span v-if="item.equipoAsociado"><strong>Equipo asociado:</strong> {{ item.equipoAsociado }}</span>
                      <span v-if="item.claveHRAEI"><strong>Clave HRAEI:</strong> {{ item.claveHRAEI }}</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    class="item-remove"
                    @click="eliminarItem(item)"
                    title="Eliminar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </TransitionGroup>
            </div>
          </WizardStepCard>

          <!-- Empty State -->
          <div v-if="form.equiposEntrada.length === 0 && !newItem.tipo" class="empty-equipment">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <h4>No hay equipos agregados</h4>
            <p>Selecciona un tipo de equipo arriba para comenzar</p>
          </div>
        </div>
      </template>

      <!-- ========== STEP 3: Observaciones y Firmas ========== -->
      <template #step-3>
        <div class="wizard-step">
          <WizardStepCard title="Observaciones" subtitle="Notas adicionales sobre la entrada" icon-color="#06b6d4">
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </template>

            <div class="fields-grid">
              <div class="observations-with-image span-full">
                <ModernInput
                  v-model="form.observaciones"
                  label="Observaciones"
                  placeholder="Escribe cualquier observación relevante..."
                  multiline
                  :rows="4"
                  class="span-full"
                />

                <div class="observ-img-actions" style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                  <label class="btn secondary" style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px;">
                    Subir imagen
                    <input type="file" accept="image/*" @change="onObservacionesImgChange" style="display:none;" />
                  </label>

                  <div v-if="form.observacionesImg" class="observ-img-preview" style="display:flex; align-items:center; gap:10px;">
                    <img :src="form.observacionesImg.dataUrl" alt="preview" style="width:90px; height:56px; object-fit:cover; border-radius:8px; border:1px solid rgba(0,0,0,0.06)" />
                    <div style="display:flex; flex-direction:column; gap:6px;">
                      <span style="font-weight:700; color:rgba(255,255,255,0.9);">{{ form.observacionesImg.name }}</span>
                      <button type="button" class="btn secondary" @click="removeObservacionesImg" style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                    </div>
                  </div>
                </div>
              </div>

              <ModernInput
                v-model="form.nombreIngeniero"
                label="Ingeniero Residente (Apoyo)"
                placeholder="Nombre del ingeniero residente de apoyo"
              />
            </div>
          </WizardStepCard>

          <WizardStepCard title="Firmas" subtitle="Personas que firmarán el documento" icon-color="#ec4899">
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
              </svg>
            </template>

            <div class="signatures-grid">
              <div 
                v-for="(sig, idx) in form.signatures" 
                :key="sig.key"
                class="signature-card"
                :class="{ 'is-fixed': sig.fixed, 'has-name': sig.name && sig.name.trim() }"
              >
                <div class="sig-header">
                  <span class="sig-role">{{ sig.role }}</span>
                  <span v-if="sig.fixed" class="sig-badge fixed">FIJADO</span>
                  <span v-else-if="sig.name && sig.name.trim()" class="sig-badge complete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
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
                      <button 
                        type="button"
                        :class="{ active: sig.nameKnown }"
                        @click="sig.nameKnown = true"
                      >Sí</button>
                      <button 
                        type="button"
                        :class="{ active: !sig.nameKnown }"
                        @click="sig.nameKnown = false"
                      >No</button>
                    </div>
                  </div>

                  <Transition name="slide-fade">
                    <ModernInput
                      v-if="sig.nameKnown"
                      v-model="sig.name"
                      placeholder="Nombre completo"
                      size="small"
                      class="sig-name-input"
                    />
                  </Transition>
                </div>
              </div>
            </div>
          </WizardStepCard>
        </div>
      </template>

      <!-- ========== SIDEBAR SUMMARY ========== -->
      <template #summary>
        <LiveSummary 
          :items="summaryItems" 
          :equipment-count="form.equiposEntrada.length"
        >
          <template #actions>
            <button type="button" class="btn-preview" @click="onPreviewPDF" :disabled="loadingPreview">
              <svg v-if="!loadingPreview" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span v-else class="btn-spinner"></span>
              {{ loadingPreview ? 'Generando...' : 'Vista previa PDF' }}
            </button>
          </template>
        </LiveSummary>
      </template>
    </OperationWizard>

    <!-- PDF Preview Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showPdfPreview" class="pdf-preview-overlay" @click.self="closePdfPreview">
          <div class="pdf-preview-modal">
            <div class="pdf-preview-header">
              <h3>Vista Previa del PDF</h3>
              <div class="pdf-preview-actions">
                <a 
                  :href="pdfPreviewUrl" 
                  target="_blank" 
                  class="btn-open-external"
                  title="Abrir en nueva pestaña"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
                <button type="button" class="btn-close-preview" @click="closePdfPreview">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="pdf-preview-body">
              <iframe 
                :src="pdfPreviewUrl" 
                class="pdf-iframe"
                title="Vista previa del documento"
              ></iframe>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
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

// Utils
import notifier from '@/utils/notifier'
import { authedFetch } from '@/utils/api.js'
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'
import notificationStore from '@/stores/notificationStore'

// Composables
import { useInventorySuggestions } from '@/composables/useInventorySuggestions.js'

// Props
const props = defineProps({
  modo: { type: String, default: 'crear' },
  ordenId: { type: [String, Number], default: null }
})

const emit = defineEmits(['close', 'actualizado'])
const router = useRouter()

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
const isMobileView = ref(false)
const errors = ref({})

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
  switch(currentStep.value) {
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
         form.motivoEntrada && 
         form.equiposEntrada.length > 0
})

// Timer computed for displaying live time (HH:MM:SS format)
const displayEndTime = computed(() => {
  return liveTimeDisplay.value || form.horaTermino || '--:--:--'
})

// Suggestions list based on current item type
const currentSuggestions = computed(() => {
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
    value: form.folio ? `E-${form.folio}` : '', 
    step: 3,
    status: form.folio ? 'complete' : 'pending'
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
  return form.nombreSolicitante?.trim()?.length > 0
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
  switch(newItem.tipo) {
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

// Quantity controls
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

// Add equipment
function agregarItem() {
  if (!canAddItem.value) {
    if (newItem.tipo === 'accesorio') {
      notifier.error('Completa los campos requeridos: nombre, marca, modelo, lote, serie, referencia, ubicación y clave HRAEI')
    } else {
      notifier.error('Completa al menos el nombre del equipo')
    }
    return
  }

  const firstUnit = newItem.unidades[0]
  if (firstUnit?.nombre?.trim()) {
    form.equiposEntrada.push({
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
      claveHRAEI: firstUnit.claveHRAEI,
      unidades: newItem.unidades.map(u => ({ ...u, cantidad: u.cantidad || 1 }))
    })
  }

  notifier.success('Equipo(s) agregado(s)')
  resetNewItem()
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
  if (fillUnitFromSuggestion && typeof fillUnitFromSuggestion === 'function') {
    fillUnitFromSuggestion(unidad, suggestion, field)
  } else {
    // Manual fill if composable function not available
    if (suggestion.nombre) unidad.nombre = suggestion.nombre
    if (suggestion.marca) unidad.marca = suggestion.marca
    if (suggestion.modelo) unidad.modelo = suggestion.modelo
    if (suggestion.serie) unidad.serie = suggestion.serie
    if (suggestion.ubicacion) unidad.ubicacion = suggestion.ubicacion
    if (suggestion.claveHRAEI) unidad.claveHRAEI = suggestion.claveHRAEI
  }
}

// Close PDF preview modal
function closePdfPreview() {
  showPdfPreview.value = false
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
  if (!form.nombreSolicitante?.trim()) {
    notifier.error('Completa al menos el nombre del solicitante')
    return
  }
  
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
      equiposEntrada: (form.equiposEntrada || []).map(item => {
        const _serieVal = item.serie || item.N || '';
        const _modeloVal = item.modelo || item.MODELO || '';
        const _marcaVal = item.marca || item.MARCA || '';
        const safeSerie = (_serieVal && String(_serieVal).trim().toUpperCase() === 'N/A') ? '' : _serieVal;
        const safeModelo = (_modeloVal && String(_modeloVal).trim().toUpperCase() === 'N/A') ? '' : _modeloVal;
        const safeMarca = (_marcaVal && String(_marcaVal).trim().toUpperCase() === 'N/A') ? '' : _marcaVal;
        return {
          ...item,
          itemId: `${item.claveHRAEI || 'SIN_CLAVE'}|${safeSerie}|${safeModelo}|${safeMarca}`
        }
      }),
      signatures: form.signatures,
      extraFields: form.extraFields,
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
        const _serieVal = item.serie || item.N || '';
        const _modeloVal = item.modelo || item.MODELO || '';
        const _marcaVal = item.marca || item.MARCA || '';
        const safeSerie = (_serieVal && String(_serieVal).trim().toUpperCase() === 'N/A') ? '' : _serieVal;
        const safeModelo = (_modeloVal && String(_modeloVal).trim().toUpperCase() === 'N/A') ? '' : _modeloVal;
        const safeMarca = (_marcaVal && String(_marcaVal).trim().toUpperCase() === 'N/A') ? '' : _marcaVal;
        return {
          ...item,
          itemId: `${item.claveHRAEI || 'SIN_CLAVE'}|${safeSerie}|${safeModelo}|${safeMarca}`
        }
      }),
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
      
      // Mostrar mensaje provisto por el servidor (incluye tipo y folio cuando aplica)
      notifier.success(responseData.msg || (props.modo === 'editar' ? 'Orden actualizada' : 'Orden guardada'))
      
      // Enviar notificación al sistema
      if (props.modo !== 'editar') {
        notificationStore.notifyOrderCreated('entrada', folioGuardado, form.nombreSolicitante)
      }
      
      emit('actualizado')
      
      // Generar y descargar PDF
      try {
        const pdfRes = await authedFetch(`/api/ops/entrada/${encodeURIComponent(folioGuardado)}/pdfs/generated/download`)
        if (pdfRes.ok) {
          const blob = await pdfRes.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `entrada_${folioGuardado}.pdf`)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
          notifier.success('PDF descargado exitosamente')
        }
      } catch (pdfErr) {
        console.warn('Error descargando PDF:', pdfErr)
      }
      
      // Redirigir al order management
      setTimeout(() => {
        router.push('/op/order-management')
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

// Lifecycle
onMounted(() => {
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
  document.addEventListener('click', handleClickOutsideMotivo)
  
  // Load inventory suggestions for autocomplete
  // Fetch comprehensive lists used by the autocomplete system
  fetchAllInventorySuggestions()
  fetchEquipoMedicoSuggestions()
  fetchInsumosRefaccionesSuggestions()
  
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
    const res = await authedFetch(`/api/ops/entrada/${props.ordenId}`)
    if (res.ok) {
      const data = await res.json()
      Object.assign(form, data)
    }
  } catch (err) {
    console.error('Error loading order:', err)
  }
}
</script>

<style scoped>
.op-entrada-new {
  min-height: 100vh;
  background: #0a0f1a;
}

/* Wizard Step Layouts */
.wizard-step {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 18px 8px;
}

/* Fields Grid */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
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
  0%, 100% { 
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
  z-index: 2000; /* lift above other UI */
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
  z-index: 2000; /* ensure it's above other UI */
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

.searchable-field :deep(.searchable-input:focus) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
  outline: none;
}

.searchable-field :deep(.suggestions-dropdown) {
  max-height: 250px;
  overflow-y: auto;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
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
  z-index: 9999;
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
  to { transform: rotate(360deg); }
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
</style>
