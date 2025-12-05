<template>
  <div>
    <FormShell>
      <template #title>Órdenes de Entrada</template>

      <template #body>
  <div class="op-card insumos op-entrada-form" ref="rootRef">
        <form @submit.prevent="onSubmit" class="form-grid" id="entrada-form" novalidate>
          <div class="section-card combined-card observaciones-support">
            <div class="section-head">
              <h4>Datos del Solicitante</h4>
              <small class="hint">Información de quien solicita la entrada</small>
            </div>
            <div class="section-grid combined">
              <!-- Primera fila -->
              <div class="field">
                <label>Nombre del Solicitante</label>
                <input
                  class="control"
                  v-model.trim="form.nombreSolicitante"
                  placeholder="Ej. Dr. Juan Pérez"
                />
              </div>
              
              <div class="field">
                <label>Servicio</label>
                <input
                  class="control"
                  v-model.trim="form.servicio"
                  placeholder="Ej. Urgencias"
                />
              </div>
              
              <div class="field">
                <label>Especialidad</label>
                <input
                  class="control"
                  v-model.trim="form.especialidad"
                  placeholder="Ej. Urgencias"
                />
              </div>
              
              <div class="field">
                <label>Folio</label>
                <input
                  class="control"
                  v-model.trim="form.folio"
                  placeholder="Ej. 5-011"
                />
              </div>
              
              <!-- Segunda fila -->
              <div class="field">
                <label>Fecha</label>
                <DatePicker 
                  v-model="form.fecha"
                  :forceFlowbite="true"
                  placeholder="Seleccionar fecha"
                />
              </div>
              
              <div class="field">
                <label>Hora de inicio</label>
                <TimePicker v-model="form.horaInicio" placeholder="14:00" />
              </div>
              
              <div class="field">
                <label>Hora de término</label>
                <div class="term-input-row">
                  <input
                    class="control term-input"
                    type="text"
                    :value="displayEndTime"
                    readonly
                    tabindex="-1"
                    aria-disabled="true"
                    @mousedown.prevent
                    @click.prevent
                    @focus.prevent
                    @keydown.prevent
                  />
                  <span
                    class="term-help"
                    role="button"
                    tabindex="0"
                    aria-label="La hora de término se establece al pulsar Guardar orden. No editable."
                    ref="termHelpRef"
                    @mouseenter="showTermTooltip"
                    @mouseleave="hideTermTooltip"
                    @focus="showTermTooltip"
                    @blur="hideTermTooltip"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12" y2="17"></line></svg>
                  </span>
                  <Teleport to="body">
                    <div v-if="tooltipVisible" :style="tooltipStyle" class="term-tooltip-portal" role="tooltip">La hora de término se establece al pulsar <strong>Guardar orden</strong>. No editable.</div>
                  </Teleport>
                </div>
                
              </div>
            </div>
          </div>
          
          <!-- Motivo y Descripción de Entrada -->
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Motivo y Descripción de Entrada</h4>
              <small class="hint">Especifica el motivo y una descripción de la entrada</small>
            </div>
            <div class="section-grid combined">
              <div class="field" style="grid-column: span 6;">
                <label>Motivo de Entrada</label>
                <CustomSelect 
                  v-model="form.motivoEntrada" 
                  :options="motivoEntradaOptions"
                  placeholder="Seleccionar motivo"
                />
              </div>
              
              <div v-if="form.motivoEntrada === 'otro'" class="field" style="grid-column: span 6;">
                <label>Especifique Motivo de Entrada</label>
                <input
                  class="control"
                  v-model.trim="form.otroMotivo"
                  placeholder="Especifique el motivo"
                />
              </div>
              
              <div class="field" style="grid-column: 1 / -1;">
                <label>Descripción de Entrada</label>
                <textarea
                  class="control"
                  v-model.trim="form.descripcion"
                  placeholder="Describe los detalles de la entrada"
                  style="resize: vertical; min-height: 180px; padding: 12px 18px;"
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Equipo Médico, Accesorio o Consumible que Entra -->
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Equipo Médico, Accesorio o Consumible que Entra</h4>
              <small class="hint">Agrega uno o más elementos que ingresan</small>
            </div>
            
            <!-- Formulario para agregar nuevo item -->
            <div class="add-item-form">
              <div class="add-item-form__inner">
                <!-- Selector de tipo y cantidad -->
                <div class="add-item-controls">
                  <div class="field field--tipo" :class="{ 'is-shifted': newItem.tipo }" :style="{ position: 'relative', zIndex: 1001 }">
                    <label class="form-label form-label--center">¿Qué entra?</label>
                    <CustomSelect 
                      v-model="newItem.tipo" 
                      :options="tipoEntradaOptions"
                      placeholder="Seleccionar tipo"
                    />
                  </div>
                  <transition
                    name="slide-cantidad"
                    @enter="onEnterCantidad"
                    @leave="onLeaveCantidad"
                  >
                    <div class="field field--cantidad" v-if="newItem.tipo">
                      <label class="form-label form-label--small form-label--center">CANTIDAD</label>
                      <div class="counter">
                        <button class="ctr-btn wide" type="button" @click="decNewBy(5)" aria-label="Disminuir cinco">-5</button>
                        <button class="ctr-btn" type="button" @click="decNew" aria-label="Disminuir uno">-</button>
                            <input
                              class="control ctr-input"
                              v-model.number="newItem.cantidad"
                              type="number"
                              min="0"
                              step="1"
                              inputmode="numeric"
                              @input="ajustarUnidadesEquipo"
                            />
                        <button class="ctr-btn" type="button" @click="incNew" aria-label="Aumentar uno">+</button>
                        <button class="ctr-btn wide" type="button" @click="incNewBy(5)" aria-label="Aumentar cinco">+5</button>
                      </div>
                    </div>
                  </transition>
                </div>
                
                <!-- Campos para Equipo Médico o Mobiliario -->
                <div v-if="newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario'" class="section-card items-card">
                  <div class="section-head">
                    <h4>{{ getTipoLabel(newItem.tipo) }} (unidades) - {{ newItem.unidades.length }}</h4>
                    <small class="hint">Completa la información individual de cada unidad</small>
                  </div>
                  <div class="section-list">
                    <p v-if="!newItem.unidades.length" class="empty-hint">
                      Ajusta la cantidad para generar las unidades necesarias.
                    </p>
                    <div 
                      v-for="(unidad, idx) in newItem.unidades" 
                      :key="idx"
                      class="item-row unidades-grid-row"
                    >
                      <div class="item-head">
                        <span class="badge">#{{ idx + 1 }}</span>
                        {{ getTipoLabel(newItem.tipo) }}
                      </div>
                      <div class="item-grid unidades-grid">
                        <!-- Fila 1: Nombre y Cantidad (dos columnas) -->
                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">{{ getNombreLabel() }}</label>
                          <input class="control" v-model.trim="unidad.nombre" :placeholder="getNombrePlaceholder()" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <!-- colocar cantidad a la derecha del nombre -->
                        <div class="field field-medium unit-qty-field">
                          <label class="form-label form-label--small">Cantidad</label>
                          <input class="control unit-qty-input" v-model.number="unidad.cantidad" type="number" min="1" step="1" />
                        </div>
                        <!-- Fila 2: Marca y Ubicación -->
                        <div class="field field-medium">
                          <label class="form-label form-label--small">Marca</label>
                          <input class="control" v-model.trim="unidad.marca" placeholder="Ej. Philips" />
                        </div>
                        <div class="field field-medium">
                          <label class="form-label form-label--small">Ubicación</label>
                          <input class="control" v-model.trim="unidad.ubicacion" placeholder="Ej. UCIA" />
                        </div>
                        <!-- Fila 3: Modelo y No. Serie -->
                        <div class="field field-compact">
                          <label class="form-label form-label--small">Modelo</label>
                          <input class="control" v-model.trim="unidad.modelo" placeholder="ej. MX40" />
                        </div>
                        <div class="field field-compact">
                          <label class="form-label form-label--small">No. Serie</label>
                          <input class="control" v-model.trim="unidad.serie" placeholder="ej. 3500" />
                        </div>
                        <!-- Fila 4: Referencia y Clave HRAEI -->
                        <div class="field field-medium">
                          <label class="form-label form-label--small">Referencia</label>
                          <input class="control" v-model.trim="unidad.referencia" placeholder="ej. 9K9162" />
                        </div>
                        <div class="field field-medium">
                          <label class="form-label form-label--small">Clave HRAEI</label>
                          <input class="control" v-model.trim="unidad.claveHRAEI" placeholder="ej. COMODATO" />
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Campos para Accesorio / Consumible / Refacción: usar estilo tipo 'Equipo Médico' -->
                <div v-if="['accesorio','consumible','refaccion'].includes(newItem.tipo)" class="section-card items-card">
                  <div class="section-head">
                    <h4>{{ getTipoLabel(newItem.tipo) }} - {{ newItem.cantidad }}</h4>
                    <small class="hint">Completa la información individual de cada unidad</small>
                  </div>
                  <div class="section-list">
                    <p v-if="!newItem.unidades.length" class="empty-hint">Ajusta la cantidad para generar las unidades necesarias.</p>
                    <div v-for="(unidad, idx) in newItem.unidades" :key="idx" class="item-row unidades-grid-row">
                      <div class="item-head">
                        <span class="badge">#{{ idx + 1 }}</span>
                        {{ getTipoLabel(newItem.tipo) }}
                      </div>

                      <div class="item-grid unidades-grid">
                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">{{ getNombreLabel() }}</label>
                          <input class="control" v-model.trim="unidad.nombre" :placeholder="getNombrePlaceholder()" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <!-- cantidad al lado del nombre para mantener layout de 2 columnas -->
                        <div class="field field-medium unit-qty-field">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Cantidad</label>
                          <input class="control unit-qty-input" v-model.number="unidad.cantidad" type="number" min="1" step="1" />
                        </div>

                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Marca</label>
                          <input class="control" v-model.trim="unidad.marca" placeholder="Marca" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Modelo</label>
                          <input class="control" v-model.trim="unidad.modelo" placeholder="Modelo" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Lote</label>
                          <input class="control" v-model.trim="unidad.lote" placeholder="Lote" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Referencia</label>
                          <input class="control" v-model.trim="unidad.referencia" placeholder="Referencia" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-wide">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Clave HRAEI</label>
                          <input class="control" v-model.trim="unidad.claveHRAEI" placeholder="Clave HRAEI" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Botón agregar -->
                <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                  <button
                    type="button"
                    class="btn primary"
                    @click="agregarItem"
                    :disabled="!canAddItem"
                  >
                    <span class="btn-icon-plus">+</span> Agregar Item
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Lista de items agregados -->
            <div v-if="form.equiposEntrada.length > 0" class="items-list" style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="flex: 1; height: 2px; background: linear-gradient(to right, rgb(59, 130, 246), transparent);"></div>
                <h5 style="margin: 0; font-size: 1.05rem; color: rgba(15, 23, 42, 0.95); font-weight: 700;">
                  Items Agregados
                  <span style="display: inline-block; background: rgb(59, 130, 246); color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; margin-left: 8px;">{{ form.equiposEntrada.length }}</span>
                </h5>
                <div style="flex: 1; height: 2px; background: linear-gradient(to left, rgb(59, 130, 246), transparent);"></div>
              </div>
              
              <div v-for="(item, index) in form.equiposEntrada" :key="index" :class="['item-row', { 'item-row-exit': exitingItems.includes(item) }]">
                <div class="item-head">
                  <span class="badge">#{{ index + 1 }}</span>
                  <span style="font-weight: 700; color: rgba(15, 23, 42, 0.9);">{{ getTipoLabel(item.tipo) }}</span>
                  <span style="margin-left: 10px; color: rgba(71, 85, 105, 0.8);">x{{ item.cantidad }}</span>
                </div>

                <div class="item-grid">
                  <div class="field" v-if="item.descripcion">
                    <label>Descripción</label>
                    <div>{{ item.descripcion }}</div>
                  </div>
                  <div class="field" v-if="item.marca">
                    <label>Marca</label>
                    <div>{{ item.marca }}</div>
                  </div>
                  <div class="field" v-if="item.modelo && !item.unidades">
                    <label>Modelo</label>
                    <div>{{ item.modelo }}</div>
                  </div>
                  <div class="field" v-if="item.ubicacion">
                    <label>Ubicación</label>
                    <div>{{ item.ubicacion }}</div>
                  </div>
                  <div class="field" v-if="item.claveHRAEI && !item.unidades">
                    <label>Clave HRAEI</label>
                    <div>{{ item.claveHRAEI }}</div>
                  </div>
                  <div class="field" v-if="item.cantidad != null">
                    <label>Cantidad</label>
                    <div>{{ item.cantidad }}</div>
                  </div>
                  <div class="field" v-if="item.unidades && item.unidades.length">
                    <label>Desglose por unidad</label>
                    <div>
                      <ul style="margin:0; padding-left: 18px; font-weight:600; color: rgba(15,23,42,0.78);">
                        <li v-for="(u, ui) in item.unidades" :key="ui">{{ (u.nombre || 'Unidad ' + (ui+1)) }} — x{{ u.cantidad || 1 }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <!-- Unidades individuales (para equipos médicos/mobiliario) -->
                <div v-if="item.unidades && item.unidades.length > 0" class="section-card items-card">
                  <div class="section-head">
                    <h4>Detalles individuales</h4>
                    <small class="hint">Información completa de cada unidad</small>
                  </div>
                  <div class="section-list">
                    <div v-for="(unidad, uIdx) in item.unidades" :key="uIdx" :class="['item-unidades-card', { 'unit-exit': exitingUnits.includes(unidad) }]">
                      <article class="detalle-card detalle-card--compact">
                        <div class="detalle-card__glow"></div>
                        <div class="detalle-card__inner">
                          <header class="detalle-card__header">
                            <span class="detalle-card__badge">#{{ uIdx + 1 }}</span>
                            <div>
                              <p class="detalle-card__title">{{ getTipoLabel(item.tipo) }}</p>
                              <small class="detalle-card__subtitle">Detalle rápido</small>
                            </div>
                            <span class="detalle-card__icon" aria-hidden="true">🧾</span>
                            <TrashButton
                              class="detalle-card__trash"
                              :duration="trashAnimationDuration"
                              @done="onUnitTrashDone(item, unidad)"
                            />
                          </header>
                          <div class="detalle-card__grid">
                            <div class="detalle-card__pair" style="--pair-hue: 210">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <IdentificationIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Nombre</span>
                                <span class="detalle-card__value">{{ unidad.nombre || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair" style="--pair-hue: 150">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <TagIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Marca</span>
                                <span class="detalle-card__value">{{ unidad.marca || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair" style="--pair-hue: 75">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <MapPinIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Ubicación</span>
                                <span class="detalle-card__value">{{ unidad.ubicacion || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair" style="--pair-hue: 340">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <DevicePhoneMobileIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Modelo</span>
                                <span class="detalle-card__value">{{ unidad.modelo || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair" style="--pair-hue: 20">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <FingerPrintIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">No. Serie</span>
                                <span class="detalle-card__value">{{ unidad.serie || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair" style="--pair-hue: 280">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <DocumentTextIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Referencia</span>
                                <span class="detalle-card__value">{{ unidad.referencia || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair" style="--pair-hue: 110">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <KeyIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Clave HRAEI</span>
                                <span class="detalle-card__value">{{ unidad.claveHRAEI || '-' }}</span>
                              </div>
                            </div>
                            <div class="detalle-card__pair detalle-card__pair--qty" style="--pair-hue: 200">
                              <span class="detalle-card__chip" aria-hidden="true">
                                <HashtagIcon class="detalle-card__chip-icon" />
                              </span>
                              <div class="detalle-card__pair-body">
                                <span class="detalle-card__label">Cantidad</span>
                                <input class="detalle-card__value detalle-card__qty-input" type="number" min="1" v-model.number="unidad.cantidad" disabled aria-disabled="true" style="width:72px; padding:6px 8px; border-radius:8px; border:1px solid rgba(15,23,42,0.08); background: transparent; color: rgba(15,23,42,0.85);" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="form.equiposEntrada.length === 0" style="color: rgba(100, 116, 139, 0.7); font-style: italic; text-align: center; margin: 20px 0;">
              No se han agregado equipos, accesorios, consumibles o refacciones
            </p>
          </div>

          <!-- Observaciones e Ingeniero Residente (Apoyo) -->
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Observaciones y Soporte</h4>
              <small class="hint">Anota observaciones y el nombre del ingeniero residente de apoyo</small>
            </div>
            <div class="section-grid combined">
              <div class="field" style="grid-column: span 12;">
                <label>Observaciones</label>
                <textarea class="control" v-model.trim="form.observaciones" placeholder="Escribe observaciones aquí" style="min-height: 120px;"></textarea>
                <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                  <label class="btn secondary" style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px;">
                    Subir imagen
                    <input type="file" accept="image/*" @change="onObservacionesImgChange" style="display:none;" />
                  </label>
                  <div v-if="form.observacionesImg" class="observ-img-preview" style="display:flex; align-items:center; gap:10px;">
                    <img :src="form.observacionesImg.dataUrl" alt="preview" style="width:90px; height:56px; object-fit:cover; border-radius:8px; border:1px solid rgba(0,0,0,0.06)" />
                    <div style="display:flex; flex-direction:column; gap:6px;">
                      <span style="font-weight:700; color:rgba(15,23,42,0.9)">{{ form.observacionesImg.name }}</span>
                      <button type="button" class="btn secondary" @click="removeObservacionesImg" style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field ing-res">
                <label>Ingeniero residente (apoyo)</label>
                <input class="control" v-model.trim="form.nombreIngeniero" placeholder="Nombre del ingeniero residente" />
              </div>
            </div>
          </div>

        </form>
        
        <div class="form-actions">
          <button class="btn secondary cancel-btn" type="button" @click="onCancel" :disabled="loading">
            Cancelar
          </button>
          <button class="btn primary save-btn" type="submit" form="entrada-form" :disabled="loading || !isValid">
            {{ loading ? 'Guardando...' : 'Guardar orden' }}
          </button>
        </div>
      </div>
    </template>
  </FormShell>
  
  <!-- Botón Scroll to Top - Fuera de todos los contenedores -->
  <Transition name="scroll-btn">
    <button 
      v-show="showScrollTop" 
      @click="scrollToTop"
      @mouseenter="onHoverStart"
      @mouseleave="onHoverEnd"
      :class="['scroll-to-top-btn', { 
        'animating-out': isAnimatingOut
      }]"
      aria-label="Volver al inicio"
    >
      <span class="scroll-icon">↑</span>
      <span class="scroll-text">Volver al principio</span>
    </button>
  </Transition>
  </div>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import FormShell from '@/components/FormShell.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import DatePicker from '@/components/DatePicker.vue'
import TimePicker from '@/components/TimePicker.vue'
import notifier from '@/utils/notifier'
import Swal from 'sweetalert2'
import {
  IdentificationIcon,
  TagIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon,
  DocumentTextIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'
import { HashtagIcon } from '@heroicons/vue/24/outline'
import TrashButton from '@/components/TrashButton.vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const LOCAL_KEY = 'op-entrada'

// Router para navegación
const router = useRouter()

// Opciones del select de motivo de entrada
const motivoEntradaOptions = [
  { value: '', label: 'Seleccionar motivo' },
  { value: 'mantenimiento-preventivo-externo', label: 'MANTENIMIENTO PREVENTIVO EXTERNO' },
  { value: 'mantenimiento-correctivo-externo', label: 'MANTENIMIENTO CORRECTIVO EXTERNO' },
  { value: 'calibracion-externa', label: 'CALIBRACIÓN EXTERNA' },
  { value: 'diagnostico', label: 'DIAGNOSTICO' },
  { value: 'inicio-contrato', label: 'INICIO DE CONTRATO' },
  { value: 'inicio-demostracion', label: 'INICIO DE DEMOSTRACIÓN' },
  { value: 'reemplazo-equipo', label: 'REEMPLAZO DE EQUIPO' },
  { value: 'otro', label: 'OTRO; ESPECIFICAR' }
]

// Opciones del select de tipo de entrada
const tipoEntradaOptions = [
  { value: '', label: 'Seleccionar tipo' },
  { value: 'equipo-medico', label: 'Equipo Médico' },
  { value: 'mobiliario', label: 'Mobiliario Médico' },
  { value: 'accesorio', label: 'Accesorios de Equipos Médicos' },
  { value: 'consumible', label: 'Consumibles de Equipos Médicos' },
  { value: 'refaccion', label: 'Refacciones para el Equipo' }
]

const form = reactive({
  // Datos del solicitante
  nombreSolicitante: '',
  servicio: '',
  especialidad: '',
  folio: '',
  fecha: '',
  horaInicio: '',
  horaTermino: '',
  motivoEntrada: '',
  otroMotivo: '',
  
  // Descripción
  descripcion: '',
  observaciones: '',
  nombreIngeniero: '',
  observacionesImg: null, // { name, dataUrl, extension }
  
  // Equipos que entran
  equiposEntrada: [],
  
  // Otros campos heredados
  cantidad: 0,
  solicitante: '',
  unidad: '',
  turno: '',
  items: []
})

// Estado para nuevo item
const newItem = reactive({
  tipo: '',
  cantidad: 0,
  descripcion: '',
  marca: '',
  modelo: '',
  serie: '',
  lote: '',
  referencia: '',
  ubicacion: '',
  claveHRAEI: '',
  unidades: [] // Para equipos médicos/mobiliario con info individual
})

const resetNewItem = () => {
  newItem.tipo = ''
  newItem.cantidad = 0
  newItem.descripcion = ''
  newItem.marca = ''
  newItem.modelo = ''
  newItem.serie = ''
  newItem.lote = ''
  newItem.referencia = ''
  newItem.ubicacion = ''
  newItem.claveHRAEI = ''
  newItem.unidades = []
}

// Observaciones image helper
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

// Ajustar array de unidades cuando cambia la cantidad (para equipos médicos)
const ajustarUnidadesEquipo = () => {
  const cantidad = normalizedCount(newItem.cantidad)
  const currentLength = newItem.unidades.length

  if (cantidad > currentLength) {
    // Agregar más unidades
    for (let i = currentLength; i < cantidad; i++) {
      newItem.unidades.push({
        nombre: '',
        marca: '',
        ubicacion: '',
        modelo: '',
        serie: '',
        referencia: '',
        claveHRAEI: '',
        cantidad: 1 // cantidad por unidad (desglose)
      })
    }
  } else if (cantidad < currentLength) {
    // Reducir unidades
    newItem.unidades.splice(cantidad)
  }
}

// Helpers para el contador de newItem.cantidad (copiado del patrón de insumos)
function adjustNew(delta) {
  const current = Number(newItem.cantidad || 0)
  // permitir que newItem.cantidad sea 0
  newItem.cantidad = Math.max(0, normalizedCount(current + delta))
  ajustarUnidadesEquipo()
}

function incNew() {
  adjustNew(1)
}

function decNew() {
  adjustNew(-1)
}

function incNewBy(amount) {
  adjustNew(amount)
}

function decNewBy(amount) {
  adjustNew(-amount)
}

// Validación para habilitar el botón de agregar según tipo
const canAddItem = computed(() => {
  if (!newItem.tipo) return false

  // Para estos tipos requerimos que exista al menos una unidad (permitir editar cada unidad)
  if (['equipo-medico','mobiliario','accesorio','consumible','refaccion'].includes(newItem.tipo)) {
    return Array.isArray(newItem.unidades) && newItem.unidades.length > 0
  }

  // Fallback: descripción obligatoria
  return (newItem.descripcion || '').trim().length > 0
})

const agregarItem = () => {
  if (!canAddItem.value) {
    notifier.error('Completa la información requerida antes de agregar el item')
    return
  }

  const itemData = {
    tipo: newItem.tipo,
    cantidad: newItem.cantidad || 1,
    descripcion: newItem.descripcion || '',
    marca: newItem.marca,
    ubicacion: newItem.ubicacion
  }

  // Para equipos médicos/mobiliario, guardar las unidades individuales
  if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
    itemData.unidades = [...newItem.unidades]
    if (!itemData.descripcion && itemData.unidades.length && itemData.unidades[0].nombre) {
      itemData.descripcion = itemData.unidades[0].nombre
    }
    form.equiposEntrada.push(itemData)
  } else {
    // Para accesorios/consumibles/refacciones: guardar como un solo item con array de unidades
    itemData.modelo = newItem.modelo
    itemData.serie = newItem.serie
    itemData.lote = newItem.lote
    itemData.referencia = newItem.referencia
    itemData.claveHRAEI = newItem.claveHRAEI

    // Mantener las unidades generadas en el formulario para editar cada una
    itemData.unidades = Array.isArray(newItem.unidades) ? [...newItem.unidades] : []
    itemData.cantidad = Number(newItem.cantidad) || (itemData.unidades.length || 1)
    form.equiposEntrada.push(itemData)
  }

  notifier.success('Item agregado correctamente')
  resetNewItem()
}

const eliminarItem = (targetItem) => {
  const targetIndex = form.equiposEntrada.findIndex((entry) => entry === targetItem)
  if (targetIndex === -1) {
    return
  }
  form.equiposEntrada.splice(targetIndex, 1)
  notifier.info('Item eliminado')
}

// animation duration (ms) - slightly longer so the can tilt + lid open look smooth
// animation duration (ms) - match the paper animation length
// animation duration (ms) used by TrashButton for can/lid/paper animation
const trashAnimationDuration = 1000

// Track units currently running exit animation (store object references)
const exitingUnits = ref([])
// Track item-rows (parent items) running exit animation
const exitingItems = ref([])

/**
 * Called when a TrashButton finishes its animation for a unit (unidad)
 * We add the unidad to exitingUnits (so template applies exit CSS) and
 * remove it from the form after the small exit animation.
 */
const onUnitTrashDone = (itemObj, unidadObj) => {
  try {
    // Avoid double-removal
    if (exitingUnits.value.includes(unidadObj)) return

    // Mark for exit animation
    exitingUnits.value.push(unidadObj)

    // short exit animation after button animation completes
    const exitMs = 320
    setTimeout(() => {
      // Find current item and the index of this unit by identity
      const parentIndex = form.equiposEntrada.findIndex(e => e === itemObj)
      if (parentIndex === -1) {
        exitingUnits.value = exitingUnits.value.filter(u => u !== unidadObj)
        return
      }
      const unitIndex = form.equiposEntrada[parentIndex].unidades.findIndex(u => u === unidadObj)
      if (unitIndex === -1) {
        exitingUnits.value = exitingUnits.value.filter(u => u !== unidadObj)
        return
      }

      // perform removal
      form.equiposEntrada[parentIndex].unidades.splice(unitIndex, 1)
      notifier.info('Unidad eliminada')

      // If after removing the unit the parent item has no unidades left, animate & remove the parent item too
      if (!form.equiposEntrada[parentIndex].unidades || form.equiposEntrada[parentIndex].unidades.length === 0) {
        // avoid duplicate entry
        if (!exitingItems.value.includes(itemObj)) {
          exitingItems.value.push(itemObj)
          // small delay so parent exit animation is visible
          const parentExitMs = 380
          setTimeout(() => {
            const idx = form.equiposEntrada.findIndex(e => e === itemObj)
            if (idx !== -1) {
              form.equiposEntrada.splice(idx, 1)
              notifier.info('Item eliminado (sin unidades)')
            }
            exitingItems.value = exitingItems.value.filter(it => it !== itemObj)
          }, parentExitMs)
        }
      }
      // cleanup
      exitingUnits.value = exitingUnits.value.filter(u => u !== unidadObj)
    }, exitMs)
  } catch (err) {
    // swallow errors to avoid app failure
    console.warn('onUnitTrashDone error', err)
  }
}
// item-level trash buttons removed — deletions will be handled per-unidad via TrashButton component

const getTipoLabel = (tipo) => {
  const option = tipoEntradaOptions.find(opt => opt.value === tipo)
  return option ? option.label : tipo
}

const getNombreLabel = () => {
  switch (newItem.tipo) {
    case 'equipo-medico': return 'NOMBRE EQUIPO MÉDICO';
    case 'mobiliario': return 'NOMBRE MOBILIARIO MÉDICO';
    case 'accesorio': return 'NOMBRE DE ACCESORIO';
    case 'consumible': return 'NOMBRE DE CONSUMIBLE';
    case 'refaccion': return 'NOMBRE DE REFACCIÓN';
    default: return 'NOMBRE';
  }
}

const getNombrePlaceholder = () => {
  switch (newItem.tipo) {
    case 'equipo-medico': return 'Nombre del equipo médico';
    case 'mobiliario': return 'Nombre del mobiliario médico';
    case 'accesorio': return 'Nombre del accesorio';
    case 'consumible': return 'Nombre del consumible';
    case 'refaccion': return 'Nombre de la refacción';
    default: return 'Nombre';
  }
}

const loading = ref(false)
const savedAt = ref('')
const hydrated = ref(false)
const showScrollTop = ref(false)
const isAnimatingOut = ref(false)
let hideTimeout = null
// Root reference for focus/click detection to start the timer
const rootRef = ref(null)

// Timer for capturing hora de término
const timerStartedAt = ref(null) // timestamp ms
const elapsedSeconds = ref(0)
let timerInterval = null

// formattedElapsed removed; duration not shown visually (tooltip only)

const displayEndTime = computed(() => {
  // Depend on elapsedSeconds so this recomputes every second while timer running
  const _tick = elapsedSeconds.value
  if (form.horaTermino) {
    return form.horaTermino
  }
  if (timerStartedAt.value) {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return ''
})

const startTimer = () => {
  if (timerStartedAt.value) return
  timerStartedAt.value = Date.now()
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - timerStartedAt.value) / 1000)
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const onCancel = async () => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se perderán todos los datos del formulario',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0bb828',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, regresar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  })

  if (result.isConfirmed) {
    // Limpiar localStorage antes de regresar
    try { localStorage.removeItem(LOCAL_KEY) } catch {}
    // Regresar al dashboard con refresco forzado
    try { 
      await router.push({ name: 'dashboard' })
    } catch { 
      try { await router.push('/') } catch {}
    }
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  const shouldShow = window.scrollY > 250
  
  if (shouldShow && !showScrollTop.value) {
    // Aparecer
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
    isAnimatingOut.value = false
    showScrollTop.value = true
  } else if (!shouldShow && showScrollTop.value && !isAnimatingOut.value) {
    // Solo marcar como animando y ocultar para que Vue Transition maneje todo
    isAnimatingOut.value = true
    showScrollTop.value = false
    // Resetear estado después de la animación
    hideTimeout = setTimeout(() => {
      isAnimatingOut.value = false
    }, 400)
  }
}

const onHoverStart = () => {
  // Hover solo funciona si no está animando salida
}

const onHoverEnd = () => {
  // Hover end simple
}

// Animaciones para el campo de cantidad
const onEnterCantidad = (el, done) => {
  el.style.opacity = '0'
  el.style.transform = 'translateX(20px)'
  setTimeout(() => {
    el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
    setTimeout(done, 400)
  }, 10)
}

const onLeaveCantidad = (el, done) => {
  el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  el.style.opacity = '0'
  el.style.transform = 'translateX(20px)'
  setTimeout(done, 300)
}

const isValid = computed(() => {
  const nombreSolicitante = (form.nombreSolicitante || '').trim()
  const descripcion = (form.descripcion || '').trim()
  return nombreSolicitante.length > 0 && descripcion.length > 0
})

async function generarExcelEntrada() {
  try {
    // Usar ruta relativa a la carpeta `src/plantillas` (Vite no resuelve `@` dentro de new URL)
    const plantillaUrl = new URL('../../plantillas/entrada_plantilla.xlsx', import.meta.url).href
    const response = await fetch(plantillaUrl)
    if (!response.ok) throw new Error(`Error al obtener plantilla (${response.status} ${response.statusText})`)
    const arrayBuffer = await response.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    const worksheet = workbook.getWorksheet('ENTRADA')
    
    const setCellValuePreserveStyle = (ws, addr, val) => {
      const c = ws.getCell(addr)
      const originalStyle = JSON.parse(JSON.stringify(c.style || {}))
      c.value = val
      try { c.style = originalStyle } catch (e) { /* ignore style reapply errors */ }
    }

    setCellValuePreserveStyle(worksheet, 'C1', form.nombreSolicitante || '')
    setCellValuePreserveStyle(worksheet, 'C2', form.servicio || '')
    setCellValuePreserveStyle(worksheet, 'C3', form.especialidad || '')
    setCellValuePreserveStyle(worksheet, 'I1', form.folio || '')
    setCellValuePreserveStyle(worksheet, 'I2', form.fecha || '')
    setCellValuePreserveStyle(worksheet, 'I3', form.horaInicio || '')
    setCellValuePreserveStyle(worksheet, 'I4', form.horaTermino || '')

    // Helper para duplicar una fila con estilos
    const duplicateRowWithStyle = (ws, sourceRowNum, targetRowNum) => {
      // Insertar fila vacía en targetRowNum
      ws.spliceRows(targetRowNum, 0, [])
      const source = ws.getRow(sourceRowNum)
      const target = ws.getRow(targetRowNum)
      target.height = source.height
      source.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = target.getCell(colNumber)
        try {
          // Copiar estilo si existe
          if (cell && cell.style) newCell.style = JSON.parse(JSON.stringify(cell.style || {}))
        } catch (e) {
          // ignore style copy error
        }
      })
      // Copiar merges que estén contenidos en source row (simple case)
      const merges = Array.from(ws._merges || [])
      merges.forEach(([mergeRange]) => {
        try {
          // mergeRange is object; for compatibility use string keys
        } catch (e) {}
      })
    }

    
    
    const motivosMap = {
      'mantenimiento-preventivo-externo': 0,
      'mantenimiento-correctivo-externo': 1,
      'calibracion-externa': 2,
      'diagnostico': 3,
      'inicio-contrato': 4,
      'inicio-demostracion': 5,
      'reemplazo-equipo': 6,
      'otro': 7
    }
    
    const celdaMotivos = ['A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14']
    const indiceMotivo = motivosMap[form.motivoEntrada]
    celdaMotivos.forEach((celda, idx) => {
      setCellValuePreserveStyle(worksheet, celda, idx === indiceMotivo ? 'X' : '')
    })
    
    // Si el motivo es "otro", escribir la especificación en B14
    if (form.motivoEntrada === 'otro' && form.otroMotivo) {
      // Actualizar el texto de B14 para incluir el motivo especificado
      const celdaOtroMotivo = worksheet.getCell('B14')
      celdaOtroMotivo.value = `OTRO; ESPECIFICAR (${form.otroMotivo})`
    }
    
    setCellValuePreserveStyle(worksheet, 'D7', form.descripcion || '')
    // Observaciones y nombre de ingeniero (mapeo)
    // Observaciones y nombre de ingeniero se establecerán después de ajustar filas
    
    const equiposData = form.equiposEntrada.filter(item => item.tipo === 'equipo-medico' || item.tipo === 'mobiliario')
    let todasLasUnidadesEquipos = []
    equiposData.forEach(item => {
      if (item.unidades && item.unidades.length > 0) {
        todasLasUnidadesEquipos.push(...item.unidades)
      }
    })
    
    // Recopilar todas las unidades de accesorios, consumibles y refacciones
    
    
    
    
    

    

    // Inserciones dinámicas por lotes (se calcularán ahora y usaremos 'sections' para todas las escrituras)
    const accesoriosData = form.equiposEntrada.filter(item => item.tipo === 'accesorio')
    let todasLasUnidadesAccesorios = []
    accesoriosData.forEach(item => {
      if (item.unidades && item.unidades.length > 0) {
        todasLasUnidadesAccesorios.push(...item.unidades)
      }
    })
    
    if (todasLasUnidadesAccesorios.length > 0) {
      // La escritura de filas para accesorios se hace después del cálculo de secciones y offsets
    } else {
      // hide logic deferred until after `sections` has been calculated
    }
    
    const consumiblesData = form.equiposEntrada.filter(item => item.tipo === 'consumible')
    let todasLasUnidadesConsumibles = []
    consumiblesData.forEach(item => {
      if (item.unidades && item.unidades.length > 0) {
        todasLasUnidadesConsumibles.push(...item.unidades)
      }
    })
    
    if (todasLasUnidadesConsumibles.length > 0) {
      // La escritura de filas para consumibles se hace después del cálculo de secciones y offsets
    } else {
      // hide deferred
    }
    
    const refaccionesData = form.equiposEntrada.filter(item => item.tipo === 'refaccion')
    let todasLasUnidadesRefacciones = []
    refaccionesData.forEach(item => {
      if (item.unidades && item.unidades.length > 0) {
        todasLasUnidadesRefacciones.push(...item.unidades)
      }
    })

    // Configuración de secciones con estructura COMPLETA
    // Cada sección: título azul + encabezado columnas + filas de datos (algunas son reserva)
    const sections = [
      { 
        key: 'equipos', 
        headerTitleRow: 16, 
        headerColRow: 17, 
        dataRows: [18, 19, 20], // 3 filas base - soporta expansión ilimitada
        capacity: 999, // Sin límite - expansión automática
        units: todasLasUnidadesEquipos 
      },
      { 
        key: 'accesorios', 
        headerTitleRow: 21, 
        headerColRow: 22, 
        dataRows: [23, 24, 25], // 3 filas base - soporta expansión ilimitada  
        capacity: 999, // Sin límite - expansión automática
        units: todasLasUnidadesAccesorios 
      },
      { 
        key: 'consumibles', 
        headerTitleRow: 26, 
        headerColRow: 27, 
        dataRows: [28, 29, 30], // 3 filas base - soporta expansión ilimitada
        capacity: 999, // Sin límite - expansión automática
        units: todasLasUnidadesConsumibles 
      },
      { 
        key: 'refacciones', 
        headerTitleRow: 31, 
        headerColRow: 32, 
        dataRows: [33, 34], // 2 filas base - soporta expansión ilimitada
        capacity: 999, // Sin límite - expansión automática (observaciones en 35+)
        units: todasLasUnidadesRefacciones 
      }
    ]
    
    // ═══════════════════════════════════════════════════════════════
    // FASE 1: SNAPSHOT DE ESTRUCTURA CRÍTICA (ANTES DE CUALQUIER CAMBIO)
    // ═══════════════════════════════════════════════════════════════
    console.log('[PROTECCIÓN] Creando snapshot de filas críticas...')
    
    const CRITICAL_ROWS = [16, 17, 21, 22, 26, 27, 31, 32, 35, 36, 37, 38, 39, 40] // Todos los encabezados + observaciones + firmas
    const rowSnapshots = {}
    
    CRITICAL_ROWS.forEach(rowNum => {
      const row = worksheet.getRow(rowNum)
      const snapshot = {
        height: row.height,
        hidden: row.hidden,
        cells: {}
      }
      
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        snapshot.cells[colNum] = {
          value: cell.value,
          style: cell.style ? JSON.parse(JSON.stringify(cell.style)) : null,
          merge: cell.isMerged
        }
      })
      
      rowSnapshots[rowNum] = snapshot
      console.log(`[SNAPSHOT] Fila ${rowNum} respaldada (${Object.keys(snapshot.cells).length} celdas)`)
    })
    
    // ═══════════════════════════════════════════════════════════════
    // FASE 2: ASIGNAR FILAS PARA DATOS (SIN MODIFICAR TEMPLATE)
    // ═══════════════════════════════════════════════════════════════
    console.log('[ASIGNACIÓN] Calculando filas para datos...')
    
    // ZONA MEGA-PROTEGIDA: Todos los encabezados dobles + observaciones + firmas
    const PROTECTED_ROWS = new Set([
      // EQUIPOS: Encabezados primario y secundario
      16, 17,
      // ACCESORIOS: Encabezados primario y secundario  
      21, 22,
      // CONSUMIBLES: Encabezados primario y secundario
      26, 27,
      // REFACCIONES: Encabezados primario y secundario
      31, 32,
      // OBSERVACIONES Y FIRMAS: Sección crítica del final
      35, 36, 37, 38, 39, 40
    ])
    
    console.log('[PROTECCIÓN] 🛡️ Filas mega-protegidas:', Array.from(PROTECTED_ROWS).sort((a,b) => a-b))
    
    // ═══════════════════════════════════════════════════════════════
    // PASO 1: ASIGNAR FILAS NORMALES PRIMERO (DISTRIBUCIÓN SECUENCIAL)
    // ═══════════════════════════════════════════════════════════════
    console.log('[ASIGNACIÓN] 🎯 PASO 1: Llenando filas normales secuencialmente...')
    
    // Primero, asignar filas normales a cada sección
    for (const sec of sections) {
      const unitsCount = (sec.units || []).length
      sec.actualDataRows = []
      sec.normalRowsUsed = 0
      sec.extraRowsNeeded = 0
      
      if (unitsCount === 0) {
        // En lugar de ocultar, mostrar UNA fila con N/A
        sec.shouldShowNA = true
        sec.actualDataRows = [sec.dataRows[0]] // Solo usar la primera fila de datos
        sec.normalRowsUsed = 1
        sec.extraRowsNeeded = 0
        continue
      }
      
      // USAR SOLO FILAS DISPONIBLES (NO protegidas)
      console.log(`[${sec.key}] Procesando ${unitsCount} unidades`)
      
      // Paso 1: Usar filas normales disponibles
      for (let i = 0; i < Math.min(unitsCount, sec.dataRows.length); i++) {
        const rowNum = sec.dataRows[i]
        if (!PROTECTED_ROWS.has(rowNum)) {
          sec.actualDataRows.push(rowNum)
          sec.normalRowsUsed++
        }
      }
      
      // Calcular cuántas filas extras necesita
      sec.extraRowsNeeded = unitsCount - sec.normalRowsUsed
      console.log(`[${sec.key}] Filas normales: ${sec.normalRowsUsed}/${unitsCount}, Extras necesarias: ${sec.extraRowsNeeded}`)
    }
    
    // ═══════════════════════════════════════════════════════════════
    // PASO 2: INSERTAR FILAS EXTRAS JUSTO DESPUÉS DE CADA SECCIÓN
    // ═══════════════════════════════════════════════════════════════
    console.log('[ASIGNACIÓN] 🎯 PASO 2: Insertando filas extras inmediatamente después de cada sección...')
    
    // PROCESAR DE ABAJO HACIA ARRIBA para evitar desplazamiento de referencias
    const sectionsReversed = [...sections].reverse()
    
    for (const sec of sectionsReversed) {
      if (sec.extraRowsNeeded > 0) {
        // Posición exacta donde insertar: después de la última fila de datos
        const lastDataRow = sec.dataRows[sec.dataRows.length - 1]
        const insertPosition = lastDataRow + 1
        
        console.log(`[${sec.key}] Insertando ${sec.extraRowsNeeded} filas después de fila ${lastDataRow} → posición ${insertPosition}`)
        
        // INSERTAR filas vacías
        worksheet.spliceRows(insertPosition, 0, ...Array(sec.extraRowsNeeded).fill([]))
        
        // APLICAR formato inmediatamente a cada fila insertada
        for (let i = 0; i < sec.extraRowsNeeded; i++) {
          const newRowNum = insertPosition + i
          const newRow = worksheet.getRow(newRowNum)
          
          // Formato básico de fila
          newRow.height = 15
          
          // Formato de celdas (A-I)
          for (let col = 1; col <= 9; col++) {
            const cell = newRow.getCell(col)
            
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            }
            cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
          }
          
          // Agregar a las filas asignadas de esta sección
          sec.actualDataRows.push(newRowNum)
        }
        
        console.log(`[${sec.key}] ✓ ${sec.extraRowsNeeded} filas insertadas en posiciones [${insertPosition}-${insertPosition + sec.extraRowsNeeded - 1}]`)
        
        // ═══════════════════════════════════════════════════════════════
        // MOVER ENCABEZADOS Y SECCIONES COMO BLOQUES PROTEGIDOS
        // ═══════════════════════════════════════════════════════════════
        console.log(`[MOVIMIENTO-PROTEGIDO] Moviendo encabezados y secciones posteriores +${sec.extraRowsNeeded} filas`)
        
        // PASO 1: SIMPLIFICAR - Solo mover lo esencial usando spliceRows
        console.log(`[MOVIMIENTO-SIMPLIFICADO] Usando spliceRows para desplazar automáticamente`)
        
        // El spliceRows ya movió todo automáticamente, solo necesitamos actualizar referencias
        console.log(`[MOVIMIENTO-SIMPLIFICADO] spliceRows ya desplazó todas las filas posteriores a ${insertPosition}`)
        
        // PASO 2: ACTUALIZAR REFERENCIAS (spliceRows ya movió las filas automáticamente)
        sections.forEach(otherSec => {
          if (otherSec.dataRows[0] > lastDataRow) {
            console.log(`[ACTUALIZACIÓN] Actualizando referencias de sección ${otherSec.key}`)
            
            // Actualizar encabezados
            otherSec.headerTitleRow += sec.extraRowsNeeded
            otherSec.headerColRow += sec.extraRowsNeeded
            
            // Actualizar filas de datos
            otherSec.dataRows = otherSec.dataRows.map(r => r + sec.extraRowsNeeded)
            otherSec.actualDataRows = otherSec.actualDataRows.map(r => r + sec.extraRowsNeeded)
          }
        })
        
        // ACTUALIZAR FILAS PROTEGIDAS (spliceRows las movió automáticamente)
        const newProtectedRows = new Set()
        const newCriticalRows = []
        
        PROTECTED_ROWS.forEach(row => {
          newProtectedRows.add(row > lastDataRow ? row + sec.extraRowsNeeded : row)
        })
        
        CRITICAL_ROWS.forEach(row => {
          newCriticalRows.push(row > lastDataRow ? row + sec.extraRowsNeeded : row)
        })
        
        // Reemplazar estructuras globales
        PROTECTED_ROWS.clear()
        newProtectedRows.forEach(row => PROTECTED_ROWS.add(row))
        
        CRITICAL_ROWS.length = 0
        CRITICAL_ROWS.push(...newCriticalRows)
        
        console.log(`[MOVIMIENTO-SIMPLIFICADO] ✅ Referencias actualizadas correctamente`)
        
        // ═══════════════════════════════════════════════════════════════
        // 🔵 RESTAURAR FORMATO AZUL Y COMBINAR CELDAS DE ENCABEZADOS 
        // ═══════════════════════════════════════════════════════════════
        console.log(`[FORMATO-AZUL] 🔵 Restaurando encabezados azules y celdas combinadas...`)
        
        sections.forEach(section => {
          // ENCABEZADO PRIMARIO (azul combinado)
          const titleRow = section.headerTitleRow
          const titleCell = worksheet.getCell(`A${titleRow}`)
          
          console.log(`[FORMATO-AZUL] Restaurando encabezado primario fila ${titleRow} para ${section.key}`)
          
          // Combinar celdas A-I para el título (solo si no están ya combinadas)
          try {
            worksheet.mergeCells(`A${titleRow}:I${titleRow}`)
            console.log(`[FORMATO-AZUL] ✓ Celdas combinadas A${titleRow}:I${titleRow} para ${section.key}`)
          } catch (error) {
            console.log(`[FORMATO-AZUL] ⚠️ Celdas A${titleRow}:I${titleRow} para ${section.key} ya estaban combinadas`)
          }
          
          // REFUERZO ESPECIAL para ACCESORIOS - Asegurar que SIEMPRE quede combinado
          if (section.key === 'accesorios') {
            console.log(`[ACCESORIOS-FIX] 🔧 REFUERZO ESPECIAL para encabezado de accesorios en fila ${titleRow}`)
            
            try {
              worksheet.unMergeCells(titleRow, 1, titleRow, 9)
            } catch(e) {}
            
            for (let col = 1; col <= 9; col++) {
              const celda = worksheet.getCell(titleRow, col)
              celda.value = null
              celda.fill = null
              celda.font = null
              celda.border = null
              celda.alignment = null
            }
            
            worksheet.mergeCells(titleRow, 1, titleRow, 9)
            console.log(`[ACCESORIOS-FIX] ✅ Accesorios FORZADAMENTE combinado en fila ${titleRow}`)
          }
          
          // REFUERZO ESPECIAL para CONSUMIBLES - Asegurar que SIEMPRE quede combinado
          if (section.key === 'consumibles') {
            console.log(`[CONSUMIBLES-FIX] 🔧 REFUERZO ESPECIAL para encabezado de consumibles en fila ${titleRow}`)
            
            try {
              // Descombinar primero
              worksheet.unMergeCells(titleRow, 1, titleRow, 9)
            } catch(e) {}
            
            // Limpiar todas las celdas
            for (let col = 1; col <= 9; col++) {
              const celda = worksheet.getCell(titleRow, col)
              celda.value = null
              celda.fill = null
              celda.font = null
              celda.border = null
              celda.alignment = null
            }
            
            // Combinar de nuevo limpiamente
            worksheet.mergeCells(titleRow, 1, titleRow, 9)
            console.log(`[CONSUMIBLES-FIX] ✅ Consumibles FORZADAMENTE combinado en fila ${titleRow}`)
          }
          
          // REFUERZO ESPECIAL para REFACCIONES - Asegurar que SIEMPRE quede combinado
          if (section.key === 'refacciones') {
            console.log(`[REFACCIONES-FIX] 🔧 REFUERZO ESPECIAL para encabezado de refacciones en fila ${titleRow}`)
            
            // Forzar combinación y formato azul para refacciones
            try {
              // Primero deshacer cualquier combinación existente en esa fila
              for (let col = 1; col <= 9; col++) {
                const cell = worksheet.getCell(titleRow, col)
                if (cell.master && cell.master !== cell) {
                  // Esta celda está combinada, deshacerla
                  worksheet.unMergeCells(cell.master.address, cell.address)
                }
              }
              
              // Ahora combinar de nuevo limpiamente
              worksheet.mergeCells(`A${titleRow}:I${titleRow}`)
              console.log(`[REFACCIONES-FIX] ✅ Refacciones FORZADAMENTE combinado en fila ${titleRow}`)
              
            } catch (error) {
              console.log(`[REFACCIONES-FIX] ⚠️ Error al forzar combinación de refacciones:`, error.message)
            }
          }
          
          // Aplicar formato azul al encabezado primario
          titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
          }
          titleCell.font = {
            name: 'Calibri',
            size: 11,
            bold: true,
            color: { argb: 'FFFFFFFF' }
          }
          titleCell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          }
          titleCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          }
          
          // Restaurar texto del encabezado según la sección
          const titleTexts = {
            'equipos': 'DESCRIPCIÓN DEL EQUIPO MÉDICO Y/O MOBILIARIO MÉDICO.',
            'accesorios': 'DESCRIPCIÓN DE ACCESORIOS QUE SE INGRESA CON EL EQUIPO MÉDICO.',
            'consumibles': 'DESCRIPCIÓN DE CONSUMIBLES QUE SE INGRESA CON EL EQUIPO MÉDICO.',
            'refacciones': 'DESCRIPCIÓN DE REFACCIONES QUE SE INGRESA CON EL EQUIPO MÉDICO.'
          }
          titleCell.value = titleTexts[section.key] || `DESCRIPCIÓN DE ${section.key.toUpperCase()}`
          
          // ENCABEZADO SECUNDARIO (columnas)
          const colRow = section.headerColRow
          console.log(`[FORMATO-AZUL] Restaurando encabezado secundario fila ${colRow} para ${section.key}`)
          
          // LIMPIEZA ESPECIAL para REFACCIONES - Evitar duplicados
          if (section.key === 'refacciones') {
            console.log(`[REFACCIONES-FIX] 🧹 Limpiando posibles duplicados de encabezado secundario...`)
            
            // Limpiar un rango amplio alrededor de la fila esperada para eliminar duplicados
            for (let checkRow = colRow - 2; checkRow <= colRow + 2; checkRow++) {
              const checkCell = worksheet.getCell(`A${checkRow}`)
              if (checkCell.value === 'N°' && checkRow !== colRow) {
                console.log(`[REFACCIONES-FIX] 🗑️ Eliminando encabezado duplicado en fila ${checkRow}`)
                // Limpiar toda la fila duplicada
                for (let col = 1; col <= 9; col++) {
                  const cellToClean = worksheet.getCell(checkRow, col)
                  cellToClean.value = null
                  cellToClean.fill = null
                  cellToClean.font = null
                  cellToClean.border = null
                }
              }
            }
          }
          
          const columnHeaders = ['N°', 'CANTIDAD', 'DESCRIPCIÓN', 'MARCA', 'MODELO', 'SERIE', 'REFERENCIA', 'UBICACIÓN', 'CLAVE HRAEI']
          columnHeaders.forEach((header, idx) => {
            const cell = worksheet.getCell(`${String.fromCharCode(65 + idx)}${colRow}`)
            
            cell.value = header
            cell.fill = {
              type: 'pattern',
              pattern: 'solid', 
              fgColor: { argb: 'FF4472C4' }
            }
            cell.font = {
              name: 'Calibri',
              size: 11,
              bold: true,
              color: { argb: 'FFFFFFFF' }
            }
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle'
            }
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            }
          })
          
          console.log(`[FORMATO-AZUL] ✅ Encabezados de ${section.key} restaurados con formato azul`)
        })
        
        console.log(`[FORMATO-AZUL] ✅ Todas las celdas combinadas y formatos azules restaurados`)
      }
    }
    
    // ██████████████████████████████████████████████████████████████████████████
    // 🔒🔒🔒 SECCIÓN OBSERVACIONES - CREACIÓN ULTRA DEFINITIVA Y BLINDADA 🔒🔒🔒
    // ██████████████████████████████████████████████████████████████████████████
    
    // Calcular posición EXACTA después de refacciones
    const refSeccionFinal = sections.find(s => s.key === 'refacciones')
    const ultimaFilaRefacciones = Math.max(...refSeccionFinal.actualDataRows)
    
    // DOS FILAS EN BLANCO DESPUÉS DE REFACCIONES (para evitar colisión con muchos items)
    const FILA_ESPACIO_BLANCO_1 = ultimaFilaRefacciones + 1
    const FILA_ESPACIO_BLANCO_2 = ultimaFilaRefacciones + 2
    
    // Limpiar filas de espacio
    for (let filaEspacio of [FILA_ESPACIO_BLANCO_1, FILA_ESPACIO_BLANCO_2]) {
      worksheet.getRow(filaEspacio).height = 5  // Fila muy pequeña
      for (let col = 1; col <= 9; col++) {
        const celda = worksheet.getCell(filaEspacio, col)
        celda.value = null
        celda.fill = null
        celda.border = null
      }
    }
    
    // POSICIONES ABSOLUTAS (después del espacio en blanco doble)
    const FILA_ENCABEZADO_OBS = FILA_ESPACIO_BLANCO_2 + 1
    const FILA_CONTENIDO_OBS = FILA_ENCABEZADO_OBS + 1
    const FILA_INGENIERO = FILA_CONTENIDO_OBS + 1
    
    console.log(`[🔒 OBSERVACIONES BLINDADAS] Posiciones calculadas:`)
    console.log(`[🔒] Última refacción: Fila ${ultimaFilaRefacciones}`)
    console.log(`[🔒] Espacios en blanco: Filas ${FILA_ESPACIO_BLANCO_1} y ${FILA_ESPACIO_BLANCO_2}`)
    console.log(`[🔒] Encabezado azul: Fila ${FILA_ENCABEZADO_OBS}`)
    console.log(`[🔒] Contenido texto+imagen: Fila ${FILA_CONTENIDO_OBS}`)
    console.log(`[🔒] Ingeniero: Fila ${FILA_INGENIERO}`)
    
    // ══════════════════════════════════════════════════════════════════════════
    // FILA 1: ENCABEZADO AZUL "OBSERVACIONES" - A:I COMBINADO
    // ══════════════════════════════════════════════════════════════════════════
    
    // PASO 1: DESCOMBINAR TODO EN ESA FILA PRIMERO
    try { worksheet.unMergeCells(FILA_ENCABEZADO_OBS, 1, FILA_ENCABEZADO_OBS, 9) } catch(e) {}
    
    // PASO 2: LIMPIAR TODAS LAS CELDAS DE ESA FILA
    for (let col = 1; col <= 9; col++) {
      const celda = worksheet.getCell(FILA_ENCABEZADO_OBS, col)
      celda.value = null
      celda.fill = null
      celda.font = null
      celda.border = null
      celda.alignment = null
    }
    
    // PASO 3: COMBINAR A:I
    worksheet.mergeCells(FILA_ENCABEZADO_OBS, 1, FILA_ENCABEZADO_OBS, 9)
    
    // PASO 4: APLICAR FORMATO Y VALOR
    const celdaEncabezadoObs = worksheet.getCell(FILA_ENCABEZADO_OBS, 1)
    celdaEncabezadoObs.value = 'OBSERVACIONES'
    celdaEncabezadoObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    celdaEncabezadoObs.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    celdaEncabezadoObs.alignment = { horizontal: 'center', vertical: 'middle' }
    celdaEncabezadoObs.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    worksheet.getRow(FILA_ENCABEZADO_OBS).height = 25
    
    console.log(`[🔒] ✅ ENCABEZADO "OBSERVACIONES" CREADO EN FILA ${FILA_ENCABEZADO_OBS}`)
    
    // ══════════════════════════════════════════════════════════════════════════
    // FILA 2: CONTENIDO - TEXTO (A:F) + IMAGEN (G:I)
    // ══════════════════════════════════════════════════════════════════════════
    
    // LIMPIAR FILA PRIMERO
    try { worksheet.unMergeCells(FILA_CONTENIDO_OBS, 1, FILA_CONTENIDO_OBS, 9) } catch(e) {}
    for (let col = 1; col <= 9; col++) {
      const celda = worksheet.getCell(FILA_CONTENIDO_OBS, col)
      celda.value = null
      celda.fill = null
      celda.font = null
      celda.border = null
      celda.alignment = null
    }
    
    // Área de texto observaciones (A:F)
    worksheet.mergeCells(FILA_CONTENIDO_OBS, 1, FILA_CONTENIDO_OBS, 6)
    const celdaTextoObs = worksheet.getCell(FILA_CONTENIDO_OBS, 1)
    celdaTextoObs.value = form.observaciones || ''  // DATO AQUÍ
    celdaTextoObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }  // FONDO BLANCO
    celdaTextoObs.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }  // TEXTO NEGRO
    celdaTextoObs.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    celdaTextoObs.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    
    // Área de imagen (G:I)
    worksheet.mergeCells(FILA_CONTENIDO_OBS, 7, FILA_CONTENIDO_OBS, 9)
    const celdaImagenObs = worksheet.getCell(FILA_CONTENIDO_OBS, 7)
    celdaImagenObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }  // FONDO BLANCO
    celdaImagenObs.alignment = { horizontal: 'center', vertical: 'middle' }
    celdaImagenObs.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    worksheet.getRow(FILA_CONTENIDO_OBS).height = 100
    
    // Insertar imagen si existe - AJUSTADA AL ÁREA G:I
    if (form.observacionesImg && form.observacionesImg.dataUrl) {
      try {
        const base64Img = String(form.observacionesImg.dataUrl).replace(/^data:image\/\w+;base64,/, '')
        const extImg = (form.observacionesImg.extension || 'png').replace('jpeg', 'jpg')
        const idImagen = workbook.addImage({ base64: base64Img, extension: extImg })
        
        // Usar tl (top-left) y br (bottom-right) para que la imagen se ajuste al área G:I
        worksheet.addImage(idImagen, {
          tl: { col: 6, row: FILA_CONTENIDO_OBS - 1 },      // G (columna 6) - inicio de fila
          br: { col: 9, row: FILA_CONTENIDO_OBS },          // I (columna 9) - fin de fila
          editAs: 'oneCell'  // La imagen se ajusta a las celdas
        })
        
        console.log(`[🖼️] Imagen insertada y ajustada al área G${FILA_CONTENIDO_OBS}:I${FILA_CONTENIDO_OBS}`)
      } catch (errImg) {
        console.warn('[🔒] Error imagen:', errImg)
      }
    }
    
    // ══════════════════════════════════════════════════════════════════════════
    // FILA 3: INGENIERO - ETIQUETA (A:C) + NOMBRE (D:I)
    // ══════════════════════════════════════════════════════════════════════════
    
    // LIMPIAR FILA PRIMERO
    try { worksheet.unMergeCells(FILA_INGENIERO, 1, FILA_INGENIERO, 9) } catch(e) {}
    for (let col = 1; col <= 9; col++) {
      const celda = worksheet.getCell(FILA_INGENIERO, col)
      celda.value = null
      celda.fill = null
      celda.font = null
      celda.border = null
      celda.alignment = null
    }
    
    // Etiqueta (A:C)
    worksheet.mergeCells(FILA_INGENIERO, 1, FILA_INGENIERO, 3)
    const celdaEtiquetaIng = worksheet.getCell(FILA_INGENIERO, 1)
    celdaEtiquetaIng.value = 'NOMBRE DE INGENIERO RESIDENTE DE APOYO'
    celdaEtiquetaIng.font = { name: 'Calibri', size: 10, bold: true }
    celdaEtiquetaIng.alignment = { horizontal: 'left', vertical: 'middle' }
    celdaEtiquetaIng.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    
    // Campo nombre (D:I)
    worksheet.mergeCells(FILA_INGENIERO, 4, FILA_INGENIERO, 9)
    const celdaNombreIng = worksheet.getCell(FILA_INGENIERO, 4)
    celdaNombreIng.value = form.nombreIngeniero || ''  // DATO AQUÍ
    celdaNombreIng.alignment = { horizontal: 'center', vertical: 'middle' }
    celdaNombreIng.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    worksheet.getRow(FILA_INGENIERO).height = 25
    
    // 🔒 BLINDAJE FINAL: Re-forzar encabezado azul una última vez
    celdaEncabezadoObs.value = 'OBSERVACIONES'
    celdaEncabezadoObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    celdaEncabezadoObs.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    
    console.log(`[🔒 OBSERVACIONES BLINDADAS] ✅ COMPLETADO PERFECTAMENTE`)
    
    // Procesar secciones en orden normal para mostrar resumen
    sections.forEach(sec => {
      console.log(`[${sec.key}] ✓ Asignación final: [${sec.actualDataRows.join(', ')}]`)
    })
    
    // ═══════════════════════════════════════════════════════════════
    // PASO 3: ESCRIBIR DATOS EN CADA SECCIÓN Y OCULTAR SECCIONES VACÍAS
    // ═══════════════════════════════════════════════════════════════
    console.log('[ESCRITURA] Escribiendo datos con protección de filas críticas...')
    
    for (const sec of sections) {
      if (sec.shouldShowNA) {
        // Mostrar sección con UNA fila de N/A
        console.log(`[${sec.key}] Mostrando sección vacía con fila N/A`)
        
        // Los encabezados quedan visibles (ya tienen formato azul)
        // USAR LA FILA CORRECTA: actualDataRows[0] o headerColRow + 1 como fallback
        const naRow = sec.actualDataRows[0] || (sec.headerColRow + 1)
        
        console.log(`[${sec.key}] Escribiendo fila N/A en fila ${naRow} (actualDataRows: ${JSON.stringify(sec.actualDataRows)}, dataRows: ${JSON.stringify(sec.dataRows)})`)
        
        // FORZAR que la fila NO esté oculta
        worksheet.getRow(naRow).hidden = false
        
        setCellValuePreserveStyle(worksheet, `A${naRow}`, 1)
        setCellValuePreserveStyle(worksheet, `B${naRow}`, 1)
        setCellValuePreserveStyle(worksheet, `C${naRow}`, 'N/A')
        setCellValuePreserveStyle(worksheet, `D${naRow}`, 'N/A') 
        setCellValuePreserveStyle(worksheet, `E${naRow}`, 'N/A')
        setCellValuePreserveStyle(worksheet, `F${naRow}`, 'N/A')
        setCellValuePreserveStyle(worksheet, `G${naRow}`, 'N/A')
        setCellValuePreserveStyle(worksheet, `H${naRow}`, 'N/A')
        setCellValuePreserveStyle(worksheet, `I${naRow}`, 'N/A')
        
        // APLICAR FORMATO EXPLÍCITO a la fila N/A (para que se vea correctamente)
        for (let col = 1; col <= 9; col++) {
          const cell = worksheet.getRow(naRow).getCell(col)
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          }
          cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
        }
        
        console.log(`[${sec.key}] ✅ Fila N/A escrita y formateada en fila ${naRow}`)
        
        // Ocultar las filas restantes de esta sección (usando dataRows actualizado)
        sec.dataRows.slice(1).forEach(rowNum => {
          if (!PROTECTED_ROWS.has(rowNum) && rowNum !== naRow) {
            worksheet.getRow(rowNum).hidden = true
          }
        })
        
      } else {
        // Escribir datos en las filas calculadas
        console.log(`[${sec.key}] Escribiendo ${sec.units.length} items`)
        sec.units.forEach((unidad, idx) => {
          const row = sec.actualDataRows[idx]
          
          // PROTECCIÓN: Verificar que no escribimos en filas críticas
          if (PROTECTED_ROWS.has(row)) {
            console.error(`[PROTECCIÓN] ⛔ Fila ${row} está protegida - saltando`)
            return
          }
          
          console.log(`[${sec.key}] Escribiendo item ${idx + 1} en fila ${row}`)
          
          // Si es fila extra (>=50), FORZAR formato antes de escribir
          if (row >= 50) {
            console.log(`[FORMATO] Aplicando formato forzado a fila ${row}`)
            for (let col = 1; col <= 9; col++) {
              const cell = worksheet.getRow(row).getCell(col)
              
              cell.alignment = { horizontal: 'center', vertical: 'middle' }
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              }
              cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
            }
          }
          
          // AUTOCOMPLETADO CON "N/A" - Si un campo está vacío o en blanco, usar "N/A"
          const autoNA = (value) => {
            if (!value || value.toString().trim() === '') {
              return 'N/A'
            }
            return value
          }
          
          console.log(`[${sec.key}] Autocompletando campos vacíos con N/A para item ${idx + 1}`)
          
          setCellValuePreserveStyle(worksheet, `A${row}`, idx + 1)
          setCellValuePreserveStyle(worksheet, `B${row}`, unidad.cantidad || 1)
          setCellValuePreserveStyle(worksheet, `C${row}`, autoNA(unidad.nombre))
          setCellValuePreserveStyle(worksheet, `D${row}`, autoNA(unidad.marca))
          setCellValuePreserveStyle(worksheet, `E${row}`, autoNA(unidad.modelo))
          setCellValuePreserveStyle(worksheet, `F${row}`, autoNA(unidad.serie || unidad.lote))
          setCellValuePreserveStyle(worksheet, `G${row}`, autoNA(unidad.referencia))
          setCellValuePreserveStyle(worksheet, `H${row}`, autoNA(unidad.ubicacion))
          setCellValuePreserveStyle(worksheet, `I${row}`, autoNA(unidad.claveHRAEI))
        })
        
        // Ocultar filas no usadas dentro de la capacidad
        const unusedRows = sec.dataRows.filter(r => !sec.actualDataRows.includes(r) && !PROTECTED_ROWS.has(r))
        unusedRows.forEach(rowNum => {
          console.log(`[${sec.key}] Ocultando fila no usada: ${rowNum}`)
          worksheet.getRow(rowNum).hidden = true
        })
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // FASE 3: AUTO-REPARACIÓN - VALIDAR Y RESTAURAR FILAS CRÍTICAS
    // ═══════════════════════════════════════════════════════════════
    console.log('[AUTO-REPARACIÓN] Validando integridad de filas críticas...')
    
    let repairsNeeded = 0
    CRITICAL_ROWS.forEach(rowNum => {
      const currentRow = worksheet.getRow(rowNum)
      const snapshot = rowSnapshots[rowNum]
      
      // VALIDACIÓN: Verificar que existe el snapshot
      if (!snapshot) {
        console.warn(`[REPARACIÓN] No hay snapshot para fila ${rowNum} - saltando validación`)
        return
      }
      
      // Verificar si la fila está corrupta (vacía o sin estilo)
      let isCorrupted = true
      currentRow.eachCell({ includeEmpty: false }, (cell) => {
        if (cell.value || cell.style) isCorrupted = false
      })
      
      if (isCorrupted || !currentRow.height) {
        console.warn(`[REPARACIÓN] Fila ${rowNum} corrupta - restaurando desde snapshot`)
        repairsNeeded++
        
        // Restaurar altura (con validación)
        currentRow.height = snapshot.height || 15
        currentRow.hidden = snapshot.hidden || false
        
        // Restaurar cada celda (con validación)
        if (snapshot.cells) {
          Object.keys(snapshot.cells).forEach(colNum => {
            const cellData = snapshot.cells[colNum]
            if (cellData) {
              const cell = currentRow.getCell(Number(colNum))
              
              cell.value = cellData.value
              if (cellData.style) {
                cell.style = JSON.parse(JSON.stringify(cellData.style))
              }
            }
          })
        }
        
        console.log(`[REPARACIÓN] ✓ Fila ${rowNum} restaurada`)
      } else {
        console.log(`[VALIDACIÓN] ✓ Fila ${rowNum} intacta`)
      }
    })
    
    if (repairsNeeded > 0) {
      console.warn(`[AUTO-REPARACIÓN] ${repairsNeeded} filas fueron reparadas`)
    } else {
      console.log('[AUTO-REPARACIÓN] ✓ Todas las filas críticas están intactas')
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 💥 ARTILLERÍA MÁXIMA - FORMATO AGRESIVO A TODAS LAS FILAS DE DATOS 💥
    // ═══════════════════════════════════════════════════════════════
    console.log('[FORMATO-MÁXIMO] 💥 ARTILLERÍA MÁXIMA - Aplicando formato a TODAS las filas de datos...')
    
    let formatRepairs = 0
    const standardBorder = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    
    const standardAlignment = { horizontal: 'center', vertical: 'middle' }
    const standardFont = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
    
    // APLICAR A TODAS LAS FILAS DE DATOS SIN EXCEPCIÓN
    sections.forEach(sec => {
      sec.actualDataRows.forEach(row => {
        console.log(`[FORMATO-MÁXIMO] 💥 FORZANDO formato fila ${row}`)
        formatRepairs++
        
        // BORRAR TODO EL FORMATO EXISTENTE Y APLICAR NUEVO
        const excelRow = worksheet.getRow(row)
        
        // Forzar altura
        excelRow.height = 15
        
        // APLICAR A TODAS LAS COLUMNAS A-I (1-9) SIN PIEDAD
        for (let col = 1; col <= 9; col++) {
          const cell = excelRow.getCell(col)
          
          // APLICAR formato de manera brutal (sin limpiar style ya que puede causar problemas)
          cell.alignment = standardAlignment
          cell.border = standardBorder  
          cell.font = standardFont
          
          // Forzar aplicación inmediata estableciendo propiedades individuales
          Object.assign(cell, {
            alignment: standardAlignment,
            border: standardBorder,
            font: standardFont
          })
        }
      })
    })
    
    // SEGUNDA PASADA - VERIFICACIÓN Y REAPLICACIÓN
    console.log('[FORMATO-MÁXIMO] 💥 SEGUNDA PASADA - Verificando formato aplicado...')
    sections.forEach(sec => {
      sec.actualDataRows.forEach(row => {
        const excelRow = worksheet.getRow(row)
        for (let col = 1; col <= 9; col++) {
          const cell = excelRow.getCell(col)
          
          // Reaplicar formato sin condiciones (más agresivo)
          console.log(`[FORMATO-MÁXIMO] 🔧 Reaplicando formato a celda ${row}:${col}`)
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          }
          cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
        }
      })
    })
    
    console.log(`[FORMATO-MÁXIMO] ✅ ${formatRepairs} filas procesadas con ARTILLERÍA MÁXIMA`)
    
    // ═══════════════════════════════════════════════════════════════
    // 🧹 LIMPIEZA FILAS MOTIVOS (7-14) - NO DEBEN TENER FONDO AZUL
    // ═══════════════════════════════════════════════════════════════
    console.log('[LIMPIEZA-MOTIVOS] 🧹 Limpiando fondo de filas de motivos (7-14)...')
    
    // Las filas 7-14 contienen los motivos de entrada y NO deben tener fondo azul
    for (let filaMotivo = 7; filaMotivo <= 14; filaMotivo++) {
      const fila = worksheet.getRow(filaMotivo)
      
      // Limpiar fondo de TODAS las columnas de esta fila (A-I)
      for (let col = 1; col <= 9; col++) {
        const celda = fila.getCell(col)
        
        // Quitar cualquier fondo (fill) que pueda tener
        celda.fill = null
        
        // Asegurar que el texto sea negro (no blanco)
        if (celda.font) {
          celda.font = {
            ...celda.font,
            color: { argb: 'FF000000' }  // Negro
          }
        }
      }
      
      console.log(`[LIMPIEZA-MOTIVOS] ✓ Fila ${filaMotivo} limpiada (sin fondo azul)`)
    }
    
    console.log('[LIMPIEZA-MOTIVOS] ✅ Filas de motivos (7-14) limpias')

    
    // ═══════════════════════════════════════════════════════════════
    // FASE 4: GENERAR Y DESCARGAR ARCHIVO
    // ═══════════════════════════════════════════════════════════════
    console.log('[GENERACIÓN] Creando archivo final...')
    const buffer = await workbook.xlsx.writeBuffer()
    // MIME corregido: spreadsheetml (antes había un typo)
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `entrada_${form.folio || 'sin-folio'}_${Date.now()}.xlsx`)
    
    notifier.success('Excel generado correctamente')
  } catch (error) {
    console.error('Error al generar Excel:', error)
    notifier.error('Error al generar el archivo Excel')
  }
}

function normalizedCount(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }
  return Math.max(0, Math.round(numeric))
}

function makeEmptyItem() {
  return {
    descripcion: '',
    claveHRAEI: '',
    cantidad: null
  }
}

function announceChange(verb, count) {
  if (!hydrated.value || count <= 0) {
    return
  }
  const label = count === 1 ? '1 renglón' : `${count} renglones`
  notifier.info(`${verb} ${label} para registrar equipos`)
}

// Keeps inline detail rows aligned with the main quantity control.
function syncItemsToCantidad() {
  const target = normalizedCount(form.cantidad)
  const current = form.items.length

  if (target === current) {
    return
  }

  if (target > current) {
    const diff = target - current
    for (let i = 0; i < diff; i += 1) {
      form.items.push(makeEmptyItem())
    }
    announceChange('Agregaste', diff)
    return
  }

  const diff = current - target
  form.items.splice(target)
  announceChange('Eliminaste', diff)
}

function adjustMain(delta) {
  const current = Number(form.cantidad || 0)
  form.cantidad = normalizedCount(current + delta)
  syncItemsToCantidad()
}

function incMain() {
  adjustMain(1)
}

function decMain() {
  adjustMain(-1)
}

function incMainBy(amount) {
  adjustMain(amount)
}

function decMainBy(amount) {
  adjustMain(-amount)
}

function clearForm() {
  form.descripcion = ''
  form.observaciones = ''
  form.nombreIngeniero = ''
  form.observacionesImg = null
  form.cantidad = 0
  form.fechaRecibo = ''
  form.solicitante = ''
  form.unidad = ''
  form.turno = ''
  form.items = []
  syncItemsToCantidad()
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // ignore storage errors
  }
  savedAt.value = ''
}



async function onSubmit() {
  if (!isValid.value) {
    notifier.error('Completa los campos obligatorios')
    return
  }

  // Capturar hora de término (con segundos) en el momento en que el usuario pulsa "Guardar orden"
  // (esto fija la hora final incluso antes de la confirmación del modal)
  const nowStart = new Date()
  const hhStart = String(nowStart.getHours()).padStart(2, '0')
  const mmStart = String(nowStart.getMinutes()).padStart(2, '0')
  const ssStart = String(nowStart.getSeconds()).padStart(2, '0')
  form.horaTermino = `${hhStart}:${mmStart}:${ssStart}`
  stopTimer()

  // Construir resumen para modal de confirmación
  const escapeHtml = (s) => {
    if (!s) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  const makeListHtml = (title, units) => {
    if (!units || units.length === 0) return ''
    const rows = units.map((u, i) => {
      const name = escapeHtml(u.nombre || u.descripcion || '-')
      const qty = u.cantidad || 1
      const modelo = escapeHtml(u.modelo || '')
      const serie = escapeHtml(u.serie || u.lote || '')
      return `<li><strong>${i + 1}.</strong> ${name} — x${qty} ${modelo ? `— ${modelo}` : ''} ${serie ? `— ${serie}` : ''}</li>`
    }).join('')
    return `<p style="margin:10px 0 4px"><strong>${escapeHtml(title)} (${units.length}):</strong></p><ul style="margin:4px 0 8px 18px;">${rows}</ul>`
  }

  const equipos = form.equiposEntrada.filter(i => i.tipo === 'equipo-medico' || i.tipo === 'mobiliario')
  const accesorios = form.equiposEntrada.filter(i => i.tipo === 'accesorio')
  const consumibles = form.equiposEntrada.filter(i => i.tipo === 'consumible')
  const refacciones = form.equiposEntrada.filter(i => i.tipo === 'refaccion')

  // Generar listas por tipo (unidades)
  const unidadesEquipos = equipos.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '' , cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.serie || it.unidades?.[0]?.serie || '' }])
  const unidadesAccesorios = accesorios.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.lote || it.unidades?.[0]?.lote || '' }])
  const unidadesConsumibles = consumibles.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.lote || it.unidades?.[0]?.lote || '' }])
  const unidadesRefacciones = refacciones.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.lote || it.unidades?.[0]?.lote || '' }])

  const motivoLabel = (() => {
    if (form.motivoEntrada === 'otro') return `OTRO: ${escapeHtml(form.otroMotivo || '')}`
    const opt = motivoEntradaOptions.find(o => o.value === form.motivoEntrada)
    return opt ? escapeHtml(opt.label) : ''
  })()

  const html = `
    <div style="text-align:left; max-height: 480px; overflow:auto; font-size: 14px;">
      <p><strong>Solicitante:</strong> ${escapeHtml(form.nombreSolicitante)}</p>
      <p><strong>Servicio:</strong> ${escapeHtml(form.servicio)}</p>
      <p><strong>Especialidad:</strong> ${escapeHtml(form.especialidad)}</p>
      <p><strong>Folio:</strong> ${escapeHtml(form.folio)}</p>
      <p><strong>Fecha:</strong> ${escapeHtml(form.fecha)}</p>
      <p><strong>Hora inicio:</strong> ${escapeHtml(form.horaInicio)} — <strong>Hora término:</strong> ${escapeHtml(form.horaTermino)}</p>
      <p><strong>Motivo:</strong> ${motivoLabel}</p>
      <p><strong>Descripción:</strong> ${escapeHtml(form.descripcion).slice(0, 100)}${(form.descripcion && form.descripcion.length > 100) ? '...' : ''}</p>
      <p><strong>Observaciones:</strong> ${escapeHtml(form.observaciones || '').slice(0, 150)}${(form.observaciones && form.observaciones.length > 150) ? '...' : ''}</p>
      <p><strong>Ingeniero Residente:</strong> ${escapeHtml(form.nombreIngeniero || '')}</p>
      ${makeListHtml('Equipos', unidadesEquipos)}
      ${makeListHtml('Accesorios', unidadesAccesorios)}
      ${makeListHtml('Consumibles', unidadesConsumibles)}
      ${makeListHtml('Refacciones', unidadesRefacciones)}
      ${form.observacionesImg ? `<p style="margin:6px 0 4px"><strong>Imagen adjunta:</strong></p><img src="${form.observacionesImg.dataUrl}" style="max-width:200px; max-height:160px; border-radius:8px; display:block; margin-top:6px;" />` : ''}
    </div>
  `

  const result = await Swal.fire({
    title: 'Confirma y genera Excel',
    html,
    showCancelButton: true,
    confirmButtonText: 'Generar y Guardar',
    cancelButtonText: 'Cancelar',
    width: '800px'
  })

  if (!result.isConfirmed) return

  loading.value = true

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
    nombreIngeniero: form.nombreIngeniero,
    equiposEntrada: form.equiposEntrada,
    observacionesImg: form.observacionesImg ? form.observacionesImg.dataUrl : null,
    createdAt: new Date().toISOString()
  }

  try {
    const res = await fetch('/api/ops/entrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      if (res.status === 404) {
        // Endpoint no disponible: guardar local y generar Excel igualmente
        notifier.info('API de guardado no disponible (404), se guardará como borrador localmente')
      } else {
        throw new Error('No se pudo guardar en el servidor')
      }
    } else {
      notifier.success('Orden guardada en el servidor')
      // clearForm se realiza tras generar el Excel para que la descarga se pueda llevar a cabo
      // (no queremos limpiar antes de la generación)
      await generarExcelEntrada()
      clearForm()
      loading.value = false
      return
    }
  } catch (err) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
    } catch {
      // ignore storage errors
    }
    notifier.success('Orden guardada como borrador (offline)')
    // Intentar generar Excel igualmente
    try {
      await generarExcelEntrada()
    } catch (e) {
      console.error('Error generando Excel tras fallback:', e)
      notifier.error('No se pudo generar el Excel')
    }
  } finally {
    loading.value = false
  }
}

let autosaveTimer

watch(
  form,
  () => {
    if (!hydrated.value) return
    clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      try {
        // Avoid storing base64 image in localStorage to prevent large entries
        const safeCopy = { ...form }
        if (safeCopy.observacionesImg) delete safeCopy.observacionesImg
        localStorage.setItem(LOCAL_KEY, JSON.stringify(safeCopy))
        savedAt.value = new Date().toLocaleTimeString()
      } catch {
        // ignore storage errors
      }
    }, 800)
  },
  { deep: true, flush: 'post' }
)

watch(
  () => form.cantidad,
  () => {
    form.cantidad = normalizedCount(form.cantidad)
    syncItemsToCantidad()
  }
)

// Iniciar el temporizador automáticamente cuando el usuario seleccione la hora de inicio
watch(() => form.horaInicio, (val) => {
  if (val && !timerStartedAt.value) {
    startTimer()
  }
})

onMounted(async () => {
  // Cargar datos guardados localmente
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      form.descripcion = data.descripcion || ''
      form.cantidad = normalizedCount(data.cantidad ?? 0)
      form.fechaRecibo = data.fechaRecibo || ''
      form.solicitante = data.solicitante || ''
      form.unidad = data.unidad || ''
      form.turno = data.turno || ''
      form.observaciones = data.observaciones || ''
      form.nombreIngeniero = data.nombreIngeniero || ''
      const storedItems = Array.isArray(data.items) ? data.items : []
      form.items = []
      syncItemsToCantidad()
      for (let i = 0; i < form.items.length && i < storedItems.length; i += 1) {
        const it = storedItems[i] || {}
        form.items[i].descripcion = it.descripcion || ''
        form.items[i].claveHRAEI = it.claveHRAEI || ''
        form.items[i].cantidad = it.cantidad ?? null
      }
      savedAt.value = new Date().toLocaleTimeString()
    } else {
      form.items = []
      syncItemsToCantidad()
    }
  } catch {
    form.items = []
    syncItemsToCantidad()
  }
  hydrated.value = true
  
  // Configurar scroll listener
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial scroll position

  // Start timer if user focuses inside the form (first interaction)
  if (rootRef.value) {
    rootRef.value.addEventListener('focusin', startTimer)
    rootRef.value.addEventListener('click', startTimer)
  }

  // Iniciar el temporizador automáticamente al montar el componente
  startTimer()
})

// Tooltip portal for Hora de término (avoid layout shifts)
const tooltipVisible = ref(false)
const tooltipStyle = ref({})
const termHelpRef = ref(null)

const showTermTooltip = () => {
  const el = termHelpRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  // position below the icon, centered
  tooltipStyle.value = {
    position: 'fixed',
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.bottom + 10}px`,
    transform: 'translateX(-50%)',
    zIndex: 2147483647
  }
  tooltipVisible.value = true
}

const hideTermTooltip = () => {
  tooltipVisible.value = false
}

// reposition on scroll/resize when visible
const onWindowChange = () => {
  if (tooltipVisible.value) showTermTooltip()
}
window.addEventListener('scroll', onWindowChange, true)
window.addEventListener('resize', onWindowChange)

onBeforeUnmount(() => {
  stopTimer()
  try {
    if (rootRef.value) {
      rootRef.value.removeEventListener('focusin', startTimer)
      rootRef.value.removeEventListener('click', startTimer)
    }
  } catch (e) {}
  try {
    window.removeEventListener('scroll', onWindowChange, true)
    window.removeEventListener('resize', onWindowChange)
  } catch (e) {}
})

onBeforeUnmount(() => {
  clearTimeout(autosaveTimer)
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.item-unidades-card {
  background: transparent;
  padding: 0;
  border: none;
}

/* Unit exit animation for fade + slide when deleted */
.item-unidades-card.unit-exit {
  transition: transform 0.32s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.32s ease;
  opacity: 0;
  transform: translateX(18px) rotate(-2deg) scale(0.995);
  pointer-events: none;
}

.item-unidades-card.unit-exit::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(circle at 50% 30%, rgba(59,130,246,0.14), transparent 40%);
  z-index: 6;
  pointer-events: none;
  animation: rippleOut 0.44s cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes rippleOut {
  from { opacity: 0.8; transform: scale(0.6); }
  to { opacity: 0; transform: scale(1.6); }
}

.item-unidades-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.item-unidades-head .badge {
  align-self: flex-start;
  background: linear-gradient(135deg, #0ea5e9, #22c55e);
  color: #0f172a;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.item-unidades-head .hint {
  font-size: 0.82rem;
  color: rgba(15, 23, 42, 0.85);
}

.item-unidad-row {
  background: rgba(15, 23, 42, 0.78);
  border-radius: 14px;
  padding: 14px 16px 16px 16px;
  margin-bottom: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.item-unidad-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.item-unidad-head .badge {
  background: #22c55e;
  color: #022c22;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.item-unidad-head .tipo-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.98);
}

.item-unidad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px 14px;
}

.item-unidad-grid .field label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.95);
}

.item-unidad-grid .control {
  background: rgba(15, 23, 42, 0.95);
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  color: #e5e7eb;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.item-unidad-grid .control::placeholder {
  color: rgba(148, 163, 184, 0.9);
}

.item-unidad-grid .control:focus {
  border-color: rgba(56, 189, 248, 0.9);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.7), 0 0 0 6px rgba(56, 189, 248, 0.15);
}

.detalle-card {
  position: relative;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  overflow: hidden;
  box-shadow: 0 25px 45px rgba(16, 24, 40, 0.18);
}

.detalle-card__glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(125deg, rgba(14, 165, 233, 0.12), rgba(255, 255, 255, 0.4));
  filter: blur(28px);
  opacity: 0.95;
  pointer-events: none;
}

.detalle-card__inner {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(16px) saturate(140%);
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.9);
  padding: 9px 12px;
}

.detalle-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.detalle-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.15);
  color: rgba(15, 23, 42, 0.9);
  font-weight: 700;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.detalle-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #0f172a;
}

.detalle-card__subtitle {
  margin: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: rgba(15, 23, 42, 0.5);
}

.detalle-card__icon {
  margin-left: auto;
  font-size: 1.1rem;
}

/* small positioning for TrashButton inside each detalle header */
.detalle-card__trash {
  margin-left: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.detalle-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;
}

.detalle-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15, 23, 42, 0.65); /* slightly darker for better visibility */
  font-weight: 700; /* increase boldness slightly */
}

.detalle-card__value {
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.82);
  font-weight: 600;
}

.detalle-card__pair {
  display: flex;
  justify-content: space-between;
        gap: 12px;
        padding: 3px 0;
        border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        position: relative;
        padding-left: 38px;
        --pair-hue: 210;
}

.detalle-card__pair:last-child {
  border-bottom: none;
}

.detalle-card__chip {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, hsl(var(--pair-hue), 78%, 82%), hsl(var(--pair-hue), 72%, 55%));
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.22);
  color: #0f172a;
}

.detalle-card__chip-icon {
  width: 18px;
  height: 18px;
  stroke: rgba(15, 23, 42, 0.85);
}

.detalle-card__pair-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.detalle-card__pair::before {
  content: attr(data-icon);
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, hsl(var(--pair-hue), 80%, 75%), hsl(var(--pair-hue), 70%, 55%));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.detalle-card__pair::before {
  content: attr(data-icon);
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
}

.detalle-card--compact {
  max-width: 520px;
  margin: 0 auto;
  padding-top: 4px;
}

:deep(.form-wrap) {
  align-items: flex-start;
  justify-content: center;
  min-height: auto;
}

:deep(.form-col) {
  max-width: 1080px;
  width: 100%;
}

:deep(.auth-card.glass) {
  width: 100%;
  padding: 34px 38px;
  border-radius: 26px;
  background: rgba(19, 31, 52, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(20px) saturate(170%);
  box-shadow: 0 32px 70px rgba(6, 12, 24, 0.45);
}

:deep(.auth-card-header) {
  padding: 0 0 18px 0;
}

:deep(.auth-card-body) {
  padding: 0;
}

.op-card {
  background: transparent;
  padding: 0;
  color: #e6ebf5;
  position: relative;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 26px;
  align-items: start;
}

.combined-card,
.items-card,
.form-footer {
  grid-column: 1 / -1;
}

.section-card,
.form-footer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 26px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 24px 52px rgba(5, 10, 18, 0.28);
  color: rgba(15, 23, 42, 0.88);
}

.section-card::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 42%, rgba(255, 255, 255, 0) 70%);
  opacity: 0.55;
}

.section-card > *,
.form-footer > * {
  position: relative;
  z-index: 1;
}

/* Fix for nested cards accumulating opacity/whiteness */
.section-card .section-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  backdrop-filter: none !important;
  padding: 0 !important;
  margin-top: 16px !important;
}

.section-card .section-card::after {
  display: none !important;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-head h4 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: rgba(15, 23, 42, 0.95);
}

.section-head .hint {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(15, 23, 42, 0.68);
  font-weight: 600;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px 20px;
}

.section-grid.combined {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px 20px;
}

.section-grid.main-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px 20px;
  align-items: start;
}

.descripcion-field {
  grid-column: 1;
  grid-row: 1;
}

.fecha-field {
  grid-column: 2;
  grid-row: 1;
}

.section-grid.solicitante-form {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 18px 20px;
  align-items: start;
}

.quantity-field-centered {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.quantity-field-centered .counter {
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1.3rem;
  padding: 3px;
  gap: 0;
  width: fit-content;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.quantity-field-centered .counter:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.3);
}

.quantity-field-centered .ctr-btn {
  height: 2rem !important;
  padding: 0.3rem 0.5rem !important;
  font-size: 0.85rem !important;
  width: 32px !important;
  min-width: 32px !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  font-weight: 700 !important;
  color: rgba(15, 23, 42, 0.8) !important;
  transition: all 0.15s ease !important;
  cursor: pointer;
}

.quantity-field-centered .ctr-btn.wide {
  width: 32px !important;
  min-width: 32px !important;
  font-size: 0.8rem !important;
}

.quantity-field-centered .ctr-btn:hover {
  background: rgba(255, 255, 255, 0.4) !important;
  color: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: none !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

/* Primer botón (extremo izquierdo) */
.quantity-field-centered .ctr-btn:first-child:hover {
  border-radius: 1rem 0.4rem 0.4rem 1rem !important;
  margin-left: -3px !important;
  padding-left: 6px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

/* Último botón (extremo derecho) */
.quantity-field-centered .ctr-btn:last-child:hover {
  border-radius: 0.4rem 1rem 1rem 0.4rem !important;
  margin-right: -3px !important;
  padding-right: 6px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.quantity-field-centered .ctr-btn:active {
  transform: scale(0.96) !important;
  background: rgba(255, 255, 255, 0.5) !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
}

/* Primer botón (extremo izquierdo) - active */
.quantity-field-centered .ctr-btn:first-child:active {
  border-radius: 1rem 0.2rem 0.2rem 1rem !important;
  margin-left: -6px !important;
  width: 38px !important;
}

/* Último botón (extremo derecho) - active */
.quantity-field-centered .ctr-btn:last-child:active {
  border-radius: 0.2rem 1rem 1rem 0.2rem !important;
  margin-right: -6px !important;
  width: 38px !important;
}

.quantity-field-centered .ctr-btn + .ctr-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.quantity-field-centered .ctr-input + .ctr-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.quantity-field-centered .ctr-input {
  height: 2rem !important;
  padding: 0.3rem 0.4rem !important;
  width: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
  color: rgba(15, 23, 42, 0.9) !important;
  transition: all 0.15s ease !important;
}

.quantity-field-centered .ctr-input:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  color: rgba(15, 23, 42, 1) !important;
  outline: none !important;
  border-radius: 0.2rem !important;
}

.quantity-field-centered .ctr-input:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.section-grid.combined .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  width: 100%;
}

.section-grid.combined .field label {
  width: 100%;
  text-align: left;
}

.section-grid.combined .field .control {
  width: 100% !important;
  max-width: 100%;
}

.section-grid.combined .quantity-field {
  align-items: center;
}

.section-grid.combined .quantity-field label {
  text-align: center;
}

.section-grid.combined .quantity-field .control {
  width: auto !important;
}

.section-grid.combined .quantity-field .counter {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 0;
  padding: 4px;
  border-radius: 1.1rem;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
}



.section-grid.combined .quantity-field .ctr-btn {
  width: 40px;
  height: 2rem;
  border-radius: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  font-weight: 800;
  font-size: 0.92rem;
  color: rgba(15, 23, 42, 0.9);
  transition: background 0.15s ease, color 0.15s ease;
}

.section-grid.combined .quantity-field .counter > * {
  border-radius: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.section-grid.combined .quantity-field .counter > * + * {
  border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.section-grid.combined .quantity-field .ctr-btn.wide {
  width: 45px;
  min-width: 45px;
}

.section-grid.combined .quantity-field .ctr-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.4);
}

.section-grid.combined .quantity-field .ctr-btn:active {
  background: rgba(255, 255, 255, 0.22);
}

.section-grid.combined .quantity-field .ctr-input {
  height: 2.2rem;
  padding: 0.4rem 0.5rem;
  border-radius: 1.1rem;
  font-size: 0.9rem;
  width: 70px !important;
  min-width: 70px;
  max-width: 70px;
  box-sizing: border-box;
  text-align: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  font-weight: 800;
  color: rgba(15, 23, 42, 0.9);
}

/* Ajustar el ctr-input del quantity-field-centered a tamaño normal */
.quantity-field-centered .ctr-input {
  height: 2.2rem !important;
  padding: 0.4rem 0.6rem !important;
  width: 70px !important;
  min-width: 70px !important;
  max-width: 70px !important;
  font-size: 0.9rem !important;
}

.section-grid.combined .quantity-field .ctr-input:focus {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-color: rgba(46, 221, 90, 0.5);
  outline: none;
}

.section-grid.combined .field:nth-child(-n+4) {
  grid-column: span 6;
}

.section-grid.combined .divider {
  grid-column: span 12;
  height: 1px;
  background: rgba(255, 255, 255, 0.22);
  margin: 4px 0 10px 0;
}

.section-grid.combined .field:nth-last-child(-n+3) {
  grid-column: span 4;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.empty-hint {
  margin: 0;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px dashed rgba(46, 221, 90, 0.38);
  background: rgba(255, 255, 255, 0.22);
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.68);
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(15, 23, 42, 0.62);
}

.control {
  height: 2.7rem;
  padding: 0.55rem 0.9rem;
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
  font-size: 0.95rem;
  width: 100%;
  min-width: 220px; /* desktop default; overridden on small screens */
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(15, 23, 42, 0.92);
  font-weight: 600;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  overflow: hidden;
}

@media (max-width: 900px) {
  .control { min-width: 0 !important; }
  .control.w-38ch, .control.w-20ch, .control.w-12ch { width: 100% !important; min-width: 0 !important; }
}

/* Very small screens (<= 420px) - ensure inputs and counters are readable and don't collapse */
@media (max-width: 420px) {
  .control { min-width: 0 !important; width: 100% !important; font-size: 0.95rem !important; height: 44px !important; padding: 8px 12px !important; }
  .item-grid { grid-template-columns: 1fr !important; }
  .unidades-grid { grid-template-columns: 1fr !important; }
  .quantity-field-centered .ctr-input, .section-grid.combined .quantity-field .ctr-input { width: 56px !important; min-width: 48px !important; }
  .quantity-field-centered .ctr-btn, .ctr-btn { flex-shrink: 0 !important; min-width: 36px !important; width: 36px !important; height: 36px !important; }
  /* Mantener contador como cápsula sin flex-wrap */
  .counter { display: flex !important; gap: 0 !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: center !important; border-radius: 1.3rem !important; padding: 3px !important; background: rgba(255, 255, 255, 0.25) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(255,255,255,0.3) !important; width: fit-content !important; margin: 0 auto !important; box-sizing: border-box !important; overflow: hidden !important; }
  .section-grid.combined .field { width: 100% !important; }
  /* reduce heavy paddings on cards to fit small screens */
  .section-card, .items-card { padding: 14px !important; }
  .detalle-card--compact { max-width: 100% !important; padding-top: 0 !important; }
  /* override inline width set on add-item-form field to prevent overflow */
  .add-item-form .field { width: 100% !important; transform: none !important; }
  .detalle-card__qty-input { width: 56px !important; min-width: 48px !important; }
}

@media (max-width: 1040px) {
  .item-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
  /* En tablets, los campos pueden apilarse si no caben */
  .add-item-controls { justify-content: center; }
  .field.field--tipo { flex: 0 1 280px; }
  .field.field--cantidad { flex: 0 1 160px; }
}

@media (max-width: 900px) {
  /* Si no caben lado a lado, se apilan en columna */
  .add-item-controls {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    justify-content: center;
  }
  .add-item-controls .field { width: 100%; text-align: center; }
  .field.field--tipo { width: 100%; max-width: 320px; flex-basis: auto; z-index: 1005; margin: 0 auto; text-align: center; transform: none !important; }
  .field.field--tipo label { text-align: center; width: 100%; }
  .field.field--cantidad { width: 100%; max-width: 220px; flex-basis: auto; margin: 0 auto; text-align: center; }
  .field.field--cantidad label { text-align: center; width: 100%; }
}

.control::placeholder {
  color: #6b7280;
  opacity: 1;
  font-weight: 500;
}

/* Tooltip helper for Hora de término */
.term-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
/* make the readonly end-time input visually non-interactive */
.term-input {
  cursor: not-allowed;
  opacity: 0.98;
}
.term-help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.06));
  border: 1px solid rgba(6,182,212,0.18);
  color: rgba(6,182,212,0.95);
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(6,182,212,0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.term-help svg { display: block; stroke: rgba(6,182,212,0.95); }
.term-help:hover, .term-help:focus {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 30px rgba(6,182,212,0.12);
}
.term-help:focus { outline: none; box-shadow: 0 12px 30px rgba(6,182,212,0.18); }

/* Portal tooltip (rendered in body) */
.term-tooltip-portal {
  position: fixed;
  background: rgba(2,8,18,0.98);
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  white-space: nowrap;
  box-shadow: 0 18px 40px rgba(2,8,18,0.6);
  border: 1px solid rgba(6,182,212,0.08);
  transform: translateY(0);
  transition: opacity 0.12s ease, transform 0.12s ease;
  opacity: 1;
  z-index: 2147483647;
}
.term-tooltip-portal::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: inherit;
}

.control:focus {
  outline: none;
  border-color: rgba(46, 221, 90, 0.65);
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.15);
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
}



/* Asegurar inputs text redondeados */
input[type="text"].control,
input.control,
.control input,
input[type="text"],
.section-card input[type="text"],
.form-grid input[type="text"] {
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
  overflow: hidden !important;
}

.counter {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ctr-btn {
  height: 2.2rem;
  padding: 0.4rem 0.6rem;
  border-radius: 1.1rem;
  font-size: 0.9rem;
  width: 40px;
  min-width: 40px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(15, 23, 42, 0.9);
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.ctr-btn.wide {
  width: 50px;
  min-width: 50px;
}

.ctr-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.4);
}

.ctr-btn:active {
  transform: translateY(1px);
}

.ctr-input {
  height: 2.2rem;
  padding: 0.4rem 0.6rem;
  border-radius: 1.1rem;
  font-size: 0.9rem;
  width: 70px;
  min-width: 70px;
  box-sizing: border-box;
  text-align: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
  transition: border-color 0.16s ease, background 0.16s ease;
}

.ctr-input:focus {
  outline: none;
  border-color: rgba(46, 221, 90, 0.6);
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(12px);
}

.item-row {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 18px 40px rgba(6, 10, 18, 0.22);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* item-row exit animation (fade + slide + subtle shrink) */
.item-row-exit {
  transition: transform 0.36s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.36s ease, height 0.36s ease, margin 0.36s ease;
  opacity: 0;
  transform: translateX(26px) translateY(6px) rotate(-1.2deg) scale(0.996);
  margin: 6px 0;
  pointer-events: none;
  height: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  overflow: hidden;
}

.item-row-exit::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: radial-gradient(circle at 50% 30%, rgba(59,130,246,0.09), transparent 45%);
  z-index: 4;
  animation: rippleOut 0.44s ease-out;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 0.96rem;
  color: rgba(15, 23, 42, 0.9);
}

.item-actions {
  margin-left: auto;
}

/* TrashButton CSS moved into reusable component */

.badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2edd5a, #299deb);
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
}

.item-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px 80px;
  gap: 16px;
  align-items: center;
}

/* Grid específico para unidades de equipo médico/mobiliario */
.unidades-grid {
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  column-gap: 18px;
  row-gap: 12px;
}

.unidades-grid .field-wide {
  grid-column: 1 / -1;
}

.unidades-grid .field-medium {
  min-width: 0;
}

.unidades-grid .field-compact .control {
  max-width: 100%;
}

/* Asegurar que campos compactos dentro de unidades ocupen toda la columna
   para que 'Clave HRAEI' tenga el mismo largo visual que el resto */
.unidades-grid .field-compact .control,
.unidades-grid .field-medium .control,
.unidades-grid .field .control {
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  display: block !important;
}

/* Centered quantity input for unidad forms */
.unit-qty-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.unit-qty-field label {
  width: 100%;
  text-align: center;
}

.unit-qty-input {
  width: 82px !important;
  min-width: 82px !important;
  max-width: 100px !important;
  text-align: center !important;
  padding: 8px 10px !important;
}

/* Ensure unit qty input is centered inside fields (overrides .control width rules) */
.unit-qty-field .control,
.unit-qty-field .unit-qty-input {
  width: 82px !important;
  margin: 6px auto 0 auto !important;
  display: inline-block !important;
}

/* Center quantity inside detalle-card pair for better visual alignment */
.detalle-card__pair--qty .detalle-card__pair-body {
  align-items: center;
  justify-content: center;
}

.detalle-card__qty-input {
  width: 84px !important;
  text-align: center !important;
  padding: 6px 8px !important;
}

/* Read-only appearance for disabled qty inputs inside saved items */
.detalle-card__qty-input[disabled] {
  opacity: 1 !important;
  color: rgba(15,23,42,0.8) !important;
  background: transparent !important;
  border-color: rgba(15,23,42,0.05) !important;
  box-shadow: none !important;
}

/* Also center the cantidad input in the detalle cards explicitly */
.detalle-card__pair--qty .detalle-card__qty-input {
  margin: 6px auto 0 auto !important;
  display: inline-block !important;
}

/* Add item form style moved from inline to CSS */
.add-item-form {
  background: linear-gradient(135deg, rgba(147, 197, 253, 0.15), rgba(167, 243, 208, 0.15));
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1.5px solid rgba(59, 130, 246, 0.2);
  overflow: visible;
}
.add-item-form__inner { display:flex; flex-direction:column; gap:20px }
.add-item-controls { display:flex; justify-content:center; align-items:center; gap:16px; flex-wrap: wrap; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); position: relative; z-index: 1000; width: 100%; box-sizing: border-box; }
.add-item-controls .field { position: relative; z-index: 1001; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.field.field--tipo { width: 280px; flex-basis: 280px; margin: 0 auto; }
.field.field--cantidad { width: 160px; flex-basis: 160px; margin: 0 auto; }
.field.field--tipo.is-shifted { transform: none !important; }
.form-label { font-weight: 600; color: rgba(15, 23, 42, 0.9); display:block; text-align: center; width: 100%; }
.form-label--center { text-align:center; width: 100%; }
.form-label--small { font-size: 0.88rem; font-weight: 600 }

/* Estilos para CustomSelect dropdown - asegurar que aparezca por encima SIN TRANSPARENCIA */
.field.field--tipo :deep(.custom-select),
.field.field--tipo :deep(.select-dropdown) {
  z-index: 9999 !important;
  position: relative;
}

.field.field--tipo :deep(.select-menu),
.field.field--tipo :deep(.dropdown),
.field.field--tipo :deep([role="listbox"]),
.field.field--tipo :deep(.vs__dropdown-menu) {
  z-index: 9999 !important;
  position: absolute;
  background: rgba(255, 255, 255, 1) !important;
  background-color: rgba(255, 255, 255, 1) !important;
  backdrop-filter: none !important;
  opacity: 1 !important;
}

/* Bajar z-index del contador cuando el dropdown está visible */
.field.field--cantidad {
  z-index: 1 !important;
}

/* Forzar el tamaño del ctr-input dentro del add-item-form (evitar regla global input[v-model*="cantidad"]) */
.add-item-form .counter .ctr-input {
  width: 70px !important;
  min-width: 70px !important;
  max-width: 70px !important;
}

/* Copiar apariencia y animación del contador del componente de insumos */
/* Copiado desde .quantity-field-centered para que el contador y botones sean idénticos */
.add-item-form .counter {
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1.3rem;
  padding: 3px;
  gap: 0;
  width: fit-content;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.add-item-form .counter:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.3);
}

.add-item-form .ctr-btn {
  height: 2rem !important;
  padding: 0.3rem 0.5rem !important;
  font-size: 0.85rem !important;
  width: 32px !important;
  min-width: 32px !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  font-weight: 700 !important;
  color: rgba(15, 23, 42, 0.8) !important;
  transition: all 0.15s ease !important;
  cursor: pointer;
}

.add-item-form .ctr-btn.wide {
  width: 32px !important;
  min-width: 32px !important;
  font-size: 0.8rem !important;
}

.add-item-form .ctr-btn:hover {
  background: rgba(255, 255, 255, 0.4) !important;
  color: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: none !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.add-item-form .ctr-btn:first-child:hover {
  border-radius: 1rem 0.4rem 0.4rem 1rem !important;
  margin-left: -3px !important;
  padding-left: 6px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.add-item-form .ctr-btn:last-child:hover {
  border-radius: 0.4rem 1rem 1rem 0.4rem !important;
  margin-right: -3px !important;
  padding-right: 6px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.add-item-form .ctr-btn:active {
  transform: scale(0.96) !important;
  background: rgba(255, 255, 255, 0.5) !important;
  border-radius: 0.4rem !important;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
}

.add-item-form .ctr-btn:first-child:active {
  border-radius: 1rem 0.2rem 0.2rem 1rem !important;
  margin-left: -6px !important;
  width: 38px !important;
}

.add-item-form .ctr-btn:last-child:active {
  border-radius: 0.2rem 1rem 1rem 0.2rem !important;
  margin-right: -6px !important;
  width: 38px !important;
}

.add-item-form .ctr-btn + .ctr-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.add-item-form .ctr-input + .ctr-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.add-item-form .ctr-input {
  height: 2rem !important;
  padding: 0.3rem 0.4rem !important;
  width: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
  color: rgba(15, 23, 42, 0.9) !important;
  transition: all 0.15s ease !important;
}

@media (max-width: 860px) {
  .unidades-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .unidades-grid .field-wide {
    grid-column: 1 / -1;
  }

  .unidades-grid .field-compact .control {
    max-width: 100%;
  }
}

/* Responsive fixes: ensure inputs and card grids don't overflow in small devices */
@media (max-width: 860px) {
  .item-grid { grid-template-columns: 1fr 120px 80px; gap: 10px; }
  .section-card { padding: 20px; }
}
@media (max-width: 720px) {
  .section-card { padding: 16px }
  .item-grid { grid-template-columns: 1fr; gap: 12px }
  .item-grid .field { width: 100% !important }
  .item-grid .field .control { width: 100% !important; min-width: 0 !important }
  /* Prevent overflow, allow wrap for counters and keep inputs flexible */
  .op-card, .section-card, .item-row { overflow-x: hidden; box-sizing: border-box }
  .item-grid .field { min-width: 0 }
  .field { min-width: 0 }
  .field .control { flex: 1 1 auto; min-width: 0; width: 100% !important }
  /* Mantener contador en forma de cápsula sin quebrar */
  .counter { display: flex; gap: 0; flex-wrap: nowrap; align-items: center; justify-content: center; border-radius: 1.3rem !important; padding: 3px; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); width: fit-content; margin: 0 auto; box-sizing: border-box; overflow: hidden; }
  .counter > * { flex-shrink: 0 !important; border-radius: 0 !important; }
  .ctr-btn { width: 28px !important; height: 28px !important; padding: 0 !important; font-size: 0.75rem !important; min-width: 28px !important; }
  .ctr-btn.wide { width: 28px !important; min-width: 28px !important; }
  .ctr-input { width: 50px !important; min-width: 50px !important; height: 28px !important; padding: 0.2rem 0.3rem !important; font-size: 0.8rem !important; }
  .control.w-38ch, .control.w-20ch, .control.w-12ch { width: 100% !important; min-width: 0 !important; }
  .form-actions { flex-direction: column; gap: 12px }
  /* Campos apilados verticalmente en pantallas pequeñas - CENTRADOS */
  .add-item-controls { flex-direction: column; align-items: center; gap: 12px; padding: 0 16px; justify-content: center; }
  .add-item-controls .field { width: 100%; text-align: center; }
  .field.field--tipo { width: 100%; max-width: 300px; flex-basis: auto; z-index: 1005; margin: 0 auto; text-align: center; transform: none !important; }
  .field.field--tipo label { text-align: center; width: 100%; }
  .field.field--cantidad { width: 100%; max-width: 200px; flex-basis: auto; margin: 0 auto; text-align: center; }
  .field.field--cantidad label { text-align: center; width: 100%; }
}
@media (max-width: 520px) {
  .section-card { padding: 14px }
  .item-row { padding: 12px }
  .btn.primary, .btn.secondary { width: 100% }
}

.op-card, .section-card, .item-row { box-sizing: border-box; max-width: 100%; overflow-x: hidden }
.control { overflow-wrap: anywhere; word-break: break-word }

.form-footer {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.footer-meta {
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.86rem;
  font-weight: 600;
}

.draft-hint {
  color: inherit;
  font-size: inherit;
}

.btn.primary {
  border-radius: 50px !important;
  -webkit-border-radius: 50px !important;
  -moz-border-radius: 50px !important;
  padding: 14px 32px;
  background: linear-gradient(145deg, #10d63a, #0bb828, #00701a);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 
    0 8px 16px rgba(11, 184, 40, 0.3),
    0 4px 8px rgba(11, 184, 40, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.16s ease;
  min-height: 48px;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn.primary:hover {
  transform: translateY(-2px);
  background: linear-gradient(145deg, #15e844, #10d63a, #0bb828);
  box-shadow: 
    0 12px 24px rgba(11, 184, 40, 0.4),
    0 6px 12px rgba(11, 184, 40, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.4),
    inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.btn.primary:active {
  transform: translateY(0);
  background: linear-gradient(145deg, #0bb828, #00701a, #004d12);
  box-shadow: 
    0 4px 8px rgba(11, 184, 40, 0.3),
    0 2px 4px rgba(11, 184, 40, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 12px 28px rgba(11, 172, 65, 0.2);
}

.btn.secondary {
  border-radius: 50px !important;
  -webkit-border-radius: 50px !important;
  -moz-border-radius: 50px !important;
  padding: 14px 32px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa, #f1f3f4);
  color: #0bb828;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid #0bb828;
  box-shadow: 
    0 6px 14px rgba(11, 184, 40, 0.2),
    0 3px 7px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.16s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
}

.btn.secondary:hover {
  background: linear-gradient(145deg, #f0fdf4, #e6ffed, #dcfce7);
  transform: translateY(-2px);
  box-shadow: 
    0 10px 20px rgba(11, 184, 40, 0.25),
    0 5px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.9),
    inset 0 -1px 3px rgba(0, 0, 0, 0.05);
  border-color: #0bb828;
  color: #059212;
}

.btn.secondary:active {
  transform: translateY(0);
  background: linear-gradient(145deg, #dcfce7, #bbf7d0, #a7f3d0);
  box-shadow: 
    0 2px 6px rgba(11, 184, 40, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -1px 2px rgba(255, 255, 255, 0.5);
  border-color: #059212;
  color: #047857;
}

.btn.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #f9f9f9;
  color: #9ca3af;
  border-color: #d1d5db;
}



.btn.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #f9f9f9;
  color: #9ca3af;
  border-color: #d1d5db;
}

.form-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  padding: 24px;
  width: 100%;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.btn-icon-plus{ font-size: 1.1rem; margin-right: 6px; display:inline-block }

/* Scroll to top button - Reescrito simple */
.scroll-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, #0bb828, #00701a);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 
    0 8px 16px rgba(11, 184, 40, 0.3),
    0 4px 8px rgba(11, 184, 40, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 18px;
  transition: all 0.3s ease;
  animation: gentleFloat 3s ease-in-out infinite;
  overflow: hidden;
}

.scroll-to-top-btn:hover {
  width: 180px;
  border-radius: 28px;
  transform: scale(1.05);
  animation-play-state: paused;
}

.scroll-to-top-btn:hover .scroll-text {
  opacity: 1;
  transform: translateX(0);
}

.scroll-to-top-btn.animating-out {
  width: 56px !important;
  border-radius: 50% !important;
  pointer-events: none;
}

.scroll-to-top-btn.animating-out .scroll-text {
  opacity: 0 !important;
}

.scroll-icon {
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scroll-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scroll-to-top-btn:hover {
  width: 180px;
  transform: translateY(-3px) scale(1.05);
  background: linear-gradient(145deg, #0bb828, #00701a);
  box-shadow: 
    0 12px 24px rgba(11, 184, 40, 0.4),
    0 6px 12px rgba(11, 184, 40, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.4);
  animation-play-state: paused;
}

.scroll-to-top-btn:hover .scroll-text {
  opacity: 1;
  max-width: 150px;
}

.scroll-to-top-btn:active {
  transform: translateY(-2px) scale(0.98);
  background: linear-gradient(145deg, #0bb828, #006617);
  box-shadow: 
    0 8px 16px rgba(11, 184, 40, 0.35),
    0 4px 8px rgba(11, 184, 40, 0.25),
    inset 0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
  animation-play-state: paused;
}

/* Observaciones & Ingeniero - estilos centrados y simétricos */
.observaciones-support .section-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.observaciones-support .section-head h4 {
  margin-bottom: 0;
}
.observaciones-support .section-head .hint {
  text-align: center;
}
.observaciones-support .section-grid.combined {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px 20px;
  align-items: center;
}
.observaciones-support .field.ing-res {
  grid-column: 4 / 10; /* centered 6 cols on 12col grid */
  justify-self: center;
  width: 100%;
  max-width: 640px;
}
.observaciones-support .field textarea.control {
  min-height: 140px !important;
  padding: 14px 18px !important;
  border-radius: 28px !important;
}
.observaciones-support .field label {
  letter-spacing: 0.06em;
  font-weight: 700;
  color: rgba(15,23,42,0.68);
}
@media (max-width: 900px) {
  .observaciones-support .field.ing-res { grid-column: 1 / -1; justify-self: stretch; max-width: none; }
  .observaciones-support .field { grid-column: 1 / -1; }
}

/* Transiciones Vue - Solo una animación por vez */
.scroll-btn-enter-active {
  animation: fluidElegantRise 0.4s ease-out;
}

.scroll-btn-leave-active {
  animation: slideDownExit 0.4s ease-out forwards;
  width: 56px !important;
  border-radius: 50% !important;
}

.scroll-btn-leave-active .scroll-text {
  opacity: 0 !important;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
  opacity: 0;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
  opacity: 0;
}



@keyframes fluidElegantRise {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.6);
    border-radius: 60% 40% 55% 45% / 40% 60% 45% 55%;
    filter: blur(4px);
  }
  30% {
    opacity: 0.4;
    transform: translateY(18px) scale(0.8);
    border-radius: 55% 45% 52% 48% / 45% 55% 48% 52%;
    filter: blur(2.5px);
  }
  60% {
    opacity: 0.8;
    transform: translateY(5px) scale(1.02);
    border-radius: 52% 48% 51% 49% / 48% 52% 49% 51%;
    filter: blur(1px);
  }
  80% {
    opacity: 0.95;
    transform: translateY(-2px) scale(0.98);
    border-radius: 51% 49% 50.2% 49.8% / 49% 51% 49.8% 50.2%;
    filter: blur(0.5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    border-radius: 50% 50% 50% 50%;
    filter: blur(0px);
  }
}

@keyframes slideDownExit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  25% {
    opacity: 0.8;
    transform: translateY(10px) scale(0.9);
  }
  50% {
    opacity: 0.6;
    transform: translateY(20px) scale(0.8);
  }
  75% {
    opacity: 0.3;
    transform: translateY(30px) scale(0.7);
  }
  100% {
    opacity: 0;
    transform: translateY(50px) scale(0.5);
  }
}

/* Animación de flotación suave para el botón */
@keyframes gentleFloat {
  0% {
    transform: translateY(0px);
  }
  33% {
    transform: translateY(-4px);
  }
  66% {
    transform: translateY(2px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 1040px) {
  :deep(.auth-card.glass) {
    padding: 30px;
  }
}

@media (max-width: 860px) {
  .form-grid {
    gap: 22px;
  }

  .section-grid.combined .field:nth-child(-n+4) {
    grid-column: span 12;
  }

  .section-grid.combined .field:nth-last-child(-n+3) {
    grid-column: span 12;
  }

  .save-btn {
    justify-content: center;
    width: 100%;
  }
}

/* AJUSTAR TAMAÑOS DE INPUTS DE CANTIDAD */
.control.w-12ch,
input[type="number"].control,
.field:has(label:contains("Cantidad")) .control,
input[v-model*="cantidad"],
input[placeholder="0"] {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  text-align: center;
}

.control.w-20ch {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
}

.fecha-field .control {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
}

/* FORZAR BORDES REDONDEADOS EN TODOS LOS INPUTS TEXT */
.op-card input,
.op-card .control,
.section-card input,
.section-card .control,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
textarea,
select {
  border-radius: 25px !important;
  -webkit-border-radius: 25px !important;
  -moz-border-radius: 25px !important;
  -ms-border-radius: 25px !important;
  overflow: hidden !important;
}

/* Más padding para los inputs y textareas */
:deep(.control),
:deep(input[type="text"]),
:deep(input[type="date"]),
:deep(input[type="time"]),
:deep(input[type="number"]),
:deep(textarea),
:deep(select) {
  padding: 12px 18px !important;
}

/* Placeholders más visibles */
:deep(.control::placeholder),
:deep(input::placeholder),
:deep(textarea::placeholder) {
  color: rgba(71, 85, 105, 0.9) !important;
  opacity: 1 !important;
}

:deep(.control::-webkit-input-placeholder),
:deep(input::-webkit-input-placeholder),
:deep(textarea::-webkit-input-placeholder) {
  color: rgba(71, 85, 105, 0.9) !important;
  opacity: 1 !important;
}

:deep(.control::-moz-placeholder),
:deep(input::-moz-placeholder),
:deep(textarea::-moz-placeholder) {
  color: rgba(71, 85, 105, 0.9) !important;
  opacity: 1 !important;
}

:deep(.control:-ms-input-placeholder),
:deep(input:-ms-input-placeholder),
:deep(textarea:-ms-input-placeholder) {
  color: rgba(71, 85, 105, 0.9) !important;
  opacity: 1 !important;
}

/* Específico para este formulario */
.op-insumos-consumibles .control,
.op-insumos-consumibles input[type="text"],
.form-grid .control,
.form-grid input {
  border-radius: 30px !important;
  -webkit-border-radius: 30px !important;
  -moz-border-radius: 30px !important;
}

/* Inputs de cantidad más compactos en renglones */
.item-row:not(.unidades-grid-row) .item-grid .field:last-child .control,
.item-row:not(.unidades-grid-row) .item-grid input[type="number"],
.item-row:not(.unidades-grid-row) input[type="number"] {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  text-align: center !important;
  padding: 0.55rem 0.5rem !important;
}

@media (max-width: 520px) {
  .section-card,
  .form-footer {
    padding: 20px 16px;
  }

  .section-grid {
    gap: 14px;
  }

  .item-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@supports not (backdrop-filter: blur(10px)) {
  :deep(.auth-card.glass) {
    backdrop-filter: none;
    background: rgba(15, 23, 42, 0.9);
  }

  .section-card,
  .item-row,
  .form-footer {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn.primary,
  .ctr-btn {
    transition: none;
  }
}

/* Input de fecha con glassmorphism - Base */
:deep(input[type="date"]) {
  position: relative !important;
  background: rgba(15, 20, 40, 0.65) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 14px !important;
  color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  color-scheme: dark !important;
  /* Forzar el calendario nativo oscuro */
  filter: invert(0) !important;
}

:deep(input[type="date"]:hover) {
  border-color: #06b6d4 !important;
  box-shadow: 
    0 6px 8px -1px rgba(6, 182, 212, 0.1),
    0 3px 6px -1px rgba(6, 182, 212, 0.06),
    0 0 0 1px rgba(6, 182, 212, 0.3) !important;
  transform: translateY(-1px) !important;
}

:deep(input[type="date"]:focus) {
  border-color: #22d3ee !important;
  box-shadow: 
    0 0 0 4px rgba(34, 211, 238, 0.25),
    0 8px 10px -2px rgba(34, 211, 238, 0.1) !important;
  background: linear-gradient(135deg, #0c1220 0%, #1e293b 100%) !important;
  outline: none !important;
  transform: translateY(-2px) !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2306b6d4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='3' ry='3'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: 20px !important;
  cursor: pointer !important;
  opacity: 0.85 !important;
  transition: all 0.3s ease !important;
  filter: drop-shadow(0 2px 4px rgba(6, 182, 212, 0.3)) !important;
  margin-right: 4px !important;
  width: 24px !important;
  height: 24px !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator:hover) {
  opacity: 1 !important;
  transform: scale(1.15) rotate(5deg) !important;
  filter: drop-shadow(0 4px 8px rgba(6, 182, 212, 0.5)) !important;
}

/* Texto del date picker con efectos mejorados */
:deep(input[type="date"]::-webkit-datetime-edit) {
  color: #f1f5f9 !important;
  font-weight: 600 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-fields-wrapper) {
  background: rgba(6, 182, 212, 0.08) !important;
  padding: 4px 8px !important;
  border-radius: 8px !important;
  margin-right: 8px !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-text) {
  color: #64748b !important;
  padding: 0 4px !important;
  font-weight: 500 !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-month-field),
:deep(input[type="date"]::-webkit-datetime-edit-day-field),
:deep(input[type="date"]::-webkit-datetime-edit-year-field) {
  color: #e2e8f0 !important;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%) !important;
  border-radius: 6px !important;
  padding: 3px 6px !important;
  margin: 0 2px !important;
  font-weight: 700 !important;
  transition: all 0.2s ease !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-month-field:focus),
:deep(input[type="date"]::-webkit-datetime-edit-day-field:focus),
:deep(input[type="date"]::-webkit-datetime-edit-year-field:focus) {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%) !important;
  color: #22d3ee !important;
  border-color: #22d3ee !important;
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2) !important;
  transform: scale(1.05) !important;
}

/* Color scheme oscuro para el calendario nativo */
:deep(input[type="date"]) {
  color-scheme: dark !important;
}

/* ===== CALENDARIO GLASSMORPHISM - CONFIGURACIÓN PRINCIPAL ===== */

/* Forzar color-scheme oscuro de manera global en este componente */
.op-entrada-form * {
  color-scheme: dark !important;
}

/* Configuración principal del input date */
:deep(input[type="date"]),
.control[type="date"] {
  color-scheme: dark !important;
  background: rgba(15, 20, 40, 0.65) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 14px !important;
  color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

/* Icono del calendario con color verde neón */
:deep(input[type="date"]::-webkit-calendar-picker-indicator),
.control[type="date"]::-webkit-calendar-picker-indicator {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2300ff6a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
  background-size: 18px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  opacity: 0.9 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator:hover) {
  opacity: 1 !important;
  transform: scale(1.1) !important;
}

/* Cabecera del calendario - Mes, año y navegación */
:deep(input[type="date"]::-webkit-calendar-picker-header) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 0 !important;
  padding: 12px 0 !important;
  margin-bottom: 18px !important;
  font-weight: 600 !important;
  font-size: 19px !important;
  text-align: center !important;
  border: none !important;
  box-shadow: none !important;
  letter-spacing: 0.3px !important;
}

/* Botones de navegación (< >) - Rectangulares con bordes redondeados */
:deep(input[type="date"]::-webkit-calendar-picker-navigation-button) {
  background: rgba(0, 0, 0, 0.35) !important;
  color: rgba(255, 255, 255, 0.85) !important;
  border: none !important;
  border-radius: 8px !important;
  width: 36px !important;
  height: 32px !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-navigation-button:hover) {
  background: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Grilla de días del mes - Botones redondeados */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85) !important;
  border-radius: 50% !important;
  border: none !important;
  margin: 2px !important;
  padding: 8px !important;
  font-weight: 400 !important;
  transition: all 0.2s ease !important;
  min-width: 38px !important;
  min-height: 38px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 14px !important;
}

/* Día actual - Verde tenue con soft-glow */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:current-day) {
  background: rgba(0, 255, 106, 0.25) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 255, 106, 0.4) !important;
  font-weight: 500 !important;
  box-shadow: 0 0 12px rgba(0, 255, 106, 0.3) !important;
}

/* Día seleccionado - Verde fosforescente intenso (círculo) */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:selected) {
  background: #00ff6a !important;
  color: #000000 !important;
  border: none !important;
  font-weight: 600 !important;
  transform: none !important;
  box-shadow: 0 0 15px rgba(0, 255, 106, 0.5) !important;
  border-radius: 50% !important;
}

/* Hover en días normales - Iluminación tenue */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Días inactivos (fuera del mes) - Gris con baja opacidad */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:inactive) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.3) !important;
  border: none !important;
  opacity: 1 !important;
}

/* Barra de días de la semana (L M X J V S D) */
:deep(input[type="date"]::-webkit-calendar-picker-week-header) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.65) !important;
  font-weight: 400 !important;
  text-align: center !important;
  padding: 8px 4px !important;
  border-radius: 0 !important;
  margin-bottom: 12px !important;
  font-size: 12px !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  border: none !important;
}

/* Panel de la tabla del calendario - Fondo transparente */
:deep(input[type="date"]::-webkit-calendar-picker-table) {
  background: transparent !important;
  border-radius: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

/* Ocultar elementos no deseados */
:deep(input[type="date"]::-webkit-inner-spin-button),
:deep(input[type="date"]::-webkit-clear-button) {
  display: none !important;
}

/* CSS adicional para forzar el tema oscuro en el calendario */
:deep(input[type="date"]) {
  /* Configuración del esquema de color oscuro */
  color-scheme: dark !important;
}

/* Configuración global para el calendario en este componente */
.op-card input[type="date"] {
  color-scheme: dark !important;
}

/* Estilos específicos para WebKit */
@supports (-webkit-appearance: none) {
  :deep(input[type="date"]) {
    -webkit-appearance: none !important;
    appearance: none !important;
  }
}

/* Estilos directos para el calendario nativo - Enfoque alternativo */
:deep(.control[type="date"]) {
  color-scheme: dark !important;
  background: rgba(15, 20, 40, 0.65) !important;
  backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 14px !important;
  color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
}

/* Aplicar directamente al control específico */
.control[type="date"] {
  color-scheme: dark !important;
}

/* Estilos CSS nativos para el calendario del navegador */
html {
  color-scheme: light dark;
}

/* Configuración específica para este componente */
.op-entrada-form {
  color-scheme: dark;
}

.op-entrada-form input[type="date"] {
  color-scheme: dark !important;
}

/* CSS específico y directo para el calendario */
.op-entrada-form input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) !important;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2300ff6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
  background-size: 18px !important;
  opacity: 0.8 !important;
}

/* Forzar el tema oscuro usando el atributo data-theme */
.op-entrada-form {
  --date-picker-bg: rgba(15, 20, 40, 0.9);
  --date-picker-text: rgba(255, 255, 255, 0.95);
  --date-picker-border: rgba(255, 255, 255, 0.15);
  --date-picker-accent: #00ff6a;
}

/* Configuración meta para el color-scheme */
@supports (color-scheme: dark) {
  .op-entrada-form input[type="date"] {
    color-scheme: dark;
  }
}

/* Usar :where() para mayor especificidad */
:where(.op-entrada-form) input[type="date"] {
  color-scheme: dark;
}

/* ===== CALENDARIO GLASSMORPHISM - CONTROLADO POR SASS ===== */
/* Los estilos principales están en src/styles/calendar-glassmorphism.scss */
/* Este componente solo aplicará configuraciones específicas */

.op-entrada-form {
  position: relative;
}

.op-entrada-form input[type="date"] {
  /* Los estilos base son aplicados por el archivo SCSS global */
  /* Solo configuraciones específicas del componente aquí */
  position: relative;
  z-index: 1;
}
</style>
