<template>
  <FormShell>
    <template #title>Órdenes de Entrada</template>

    <template #body>
  <div class="op-card insumos" ref="rootRef">
        <form @submit.prevent="onSubmit" class="form-grid" id="entrada-form" novalidate>
          <div class="section-card combined-card">
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
                <input
                  class="control"
                  v-model="form.fecha"
                  type="date"
                />
              </div>
              
              <div class="field">
                <label>Hora de inicio</label>
                <input
                  class="control"
                  v-model="form.horaInicio"
                  type="time"
                  placeholder="14:00"
                />
              </div>
              
              <div class="field">
                <label>Hora de terminó</label>
                <input
                  class="control"
                  v-model="form.horaTermino"
                  type="time"
                  placeholder="14:00"
                />
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
                                <span class="detalle-card__value">{{ unidad.cantidad || 1 }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
                
                <div class="item-actions">
                  <TrashButton
                    class="trash-btn-main"
                    :duration="trashAnimationDuration"
                    @done="onTrashDone(item)"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Evidencia Fotográfica -->
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Evidencia Fotográfica</h4>
              <small class="hint">Sube una o más imágenes como evidencia</small>
            </div>
            
            <div class="field" style="width: 100%;">
              <div 
                class="dropzone"
                :class="{ 'dragging': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
                @click="$refs.fileInput.click()"
              >
                <div class="dropzone-content">
                  <PhotoIcon class="dropzone-icon" />
                  <p>Arrastra imágenes aquí o <span>haz clic para buscar</span></p>
                  <small>JPG, PNG, WEBP (Máx. 5MB por imagen)</small>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  multiple
                  accept="image/*"
                  class="hidden-input"
                  @change="onFileChange"
                />
              </div>
              
              <!-- Vista previa de imágenes -->
              <div v-if="previews.length > 0" class="previews-grid">
                <div v-for="(prev, i) in previews" :key="i" class="preview-card">
                  <img :src="prev.url" :alt="prev.name" />
                  <button type="button" class="remove-prev" @click.stop="removeFile(i)" title="Eliminar">
                    <XMarkIcon class="remove-icon" />
                  </button>
                  <div class="preview-info">
                    <span class="preview-name">{{ prev.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Personal Involucrado -->
          <div class="section-card combined-card">
            <div class="section-head">
              <h4>Personal Involucrado</h4>
              <small class="hint">Nombres de quienes validan y entregan</small>
            </div>
            <div class="section-grid combined">
              <div class="field">
                <label>Recibe</label>
                <input
                  class="control"
                  v-model.trim="form.quienRecibe"
                  placeholder="Nombre de quien recibe"
                />
              </div>
              
              <div class="field">
                <label>Entrega</label>
                <input
                  class="control"
                  v-model.trim="form.quienEntrega"
                  placeholder="Nombre de quien entrega"
                />
              </div>
              
              <div class="field" style="grid-column: span 12;">
                <label>Visto Bueno (Responsable Biomédica)</label>
                <input
                  class="control"
                  v-model.trim="form.voboBiomedica"
                  placeholder="Ej. Ing. Carlos Rodríguez"
                />
              </div>
            </div>
          </div>
          
          <!-- Acciones -->
          <div class="form-footer combined-card">
            <div class="form-actions">
              <button
                type="button"
                class="btn secondary cancel-btn"
                @click="onCancel"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn primary save-btn"
                :disabled="isSubmitting || !isFormValid"
              >
                <LoadingSkeleton v-if="isSubmitting" type="text" style="width: 20px; height: 20px; margin-right: 10px;" />
                {{ isSubmitting ? 'Guardando...' : 'Crear Orden de Entrada' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </template>
  </FormShell>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FormShell from '@/components/FormShell.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import TrashButton from '@/components/TrashButton.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import notifier from '@/utils/notifier'
import Swal from 'sweetalert2'
import { 
  PhotoIcon, 
  XMarkIcon,
  IdentificationIcon,
  TagIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon,
  DocumentTextIcon,
  KeyIcon,
  HashtagIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const isSubmitting = ref(false)
const isDragging = ref(false)
const loading = ref(true)
const previews = ref([])
const exitingItems = ref([])
const exitingUnits = ref([])
const trashAnimationDuration = 1200

// Datos del formulario
const form = reactive({
  nombreSolicitante: '',
  servicio: '',
  especialidad: '',
  folio: '',
  fecha: new Date().toISOString().substr(0, 10),
  horaInicio: '',
  horaTermino: '',
  motivoEntrada: '',
  otroMotivo: '',
  descripcion: '',
  equiposEntrada: [],
  evidencia: [],
  quienRecibe: '',
  quienEntrega: '',
  voboBiomedica: ''
})

// Nuevo item temporal
const newItem = reactive({
  tipo: '',
  cantidad: 1,
  unidades: []
})

// Opciones
const motivoEntradaOptions = [
  { value: 'prestamo', label: 'PRÉSTAMO' },
  { value: 'mantenimiento', label: 'MANTENIMIENTO' },
  { value: 'garantia', label: 'GARANTÍA' },
  { value: 'comodato', label: 'COMODATO' },
  { value: 'demostracion', label: 'DEMOSTRACIÓN' },
  { value: 'otro', label: 'OTRO' }
]

const tipoEntradaOptions = [
  { value: 'equipo-medico', label: 'EQUIPO MÉDICO' },
  { value: 'mobiliario', label: 'MOBILIARIO' },
  { value: 'accesorio', label: 'ACCESORIO' },
  { value: 'consumible', label: 'CONSUMIBLE' },
  { value: 'refaccion', label: 'REFACCIÓN' }
]

onMounted(async () => {
  // Optimización de carga: 600ms
  setTimeout(() => {
    loading.value = false
  }, 600)
})

// Helpers de labels
const getTipoLabel = (val) => {
  const op = tipoEntradaOptions.find(o => o.value === val)
  return op ? op.label : val
}

const getNombreLabel = () => {
  if (newItem.tipo === 'mobiliario') return 'Nombre del Mobiliario'
  if (['accesorio','consumible','refaccion'].includes(newItem.tipo)) return 'Descripción del Producto'
  return 'Nombre del Equipo'
}

const getNombrePlaceholder = () => {
  if (newItem.tipo === 'mobiliario') return 'Ej. Silla ejecutiva'
  if (['accesorio','consumible','refaccion'].includes(newItem.tipo)) return 'Ej. Papel térmico'
  return 'Ej. Monitor de Signos Vitales'
}

// Lógica de items
const ajustarUnidadesEquipo = () => {
  const cant = parseInt(newItem.cantidad) || 0
  if (cant < 0) { newItem.cantidad = 0; return }
  
  if (cant > newItem.unidades.length) {
    const diff = cant - newItem.unidades.length
    for (let i = 0; i < diff; i++) {
      newItem.unidades.push({
        nombre: '',
        marca: '',
        modelo: '',
        serie: '',
        ubicacion: '',
        referencia: '',
        claveHRAEI: '',
        cantidad: 1,
        lote: ''
      })
    }
  } else if (cant < newItem.unidades.length) {
    newItem.unidades.splice(cant)
  }
}

const incNew = () => { newItem.cantidad++; ajustarUnidadesEquipo() }
const decNew = () => { if (newItem.cantidad > 0) newItem.cantidad--; ajustarUnidadesEquipo() }
const incNewBy = (n) => { newItem.cantidad += n; ajustarUnidadesEquipo() }
const decNewBy = (n) => { newItem.cantidad = Math.max(0, newItem.cantidad - n); ajustarUnidadesEquipo() }

const canAddItem = computed(() => {
  if (!newItem.tipo) return false
  if (newItem.cantidad <= 0) return false
  return true
})

const agregarItem = () => {
  if (!canAddItem.value) return
  
  const itemToAdd = {
    tipo: newItem.tipo,
    cantidad: newItem.cantidad,
    unidades: JSON.parse(JSON.stringify(newItem.unidades))
  }
  
  form.equiposEntrada.push(itemToAdd)
  
  // Limpiar
  newItem.tipo = ''
  newItem.cantidad = 1
  newItem.unidades = []
  
  notifier.success('Item agregado a la lista')
}

const onTrashDone = (item) => {
  const idx = form.equiposEntrada.indexOf(item)
  if (idx > -1) form.equiposEntrada.splice(idx, 1)
}

const onUnitTrashDone = (item, unidad) => {
  const uIdx = item.unidades.indexOf(unidad)
  if (uIdx > -1) {
    item.unidades.splice(uIdx, 1)
    item.cantidad = item.unidades.length
  }
}

// Lógica de archivos
const onFileChange = (e) => {
  const files = Array.from(e.target.files)
  handleFiles(files)
}

const onDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  handleFiles(files)
}

const handleFiles = (files) => {
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      notifier.error(`La imagen ${file.name} excede los 5MB`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previews.value.push({
        url: e.target.result,
        name: file.name,
        file: file
      })
      form.evidencia.push(file)
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (idx) => {
  previews.value.splice(idx, 1)
  form.evidencia.splice(idx, 1)
}

// Validación
const isFormValid = computed(() => {
  if (!form.nombreSolicitante) return false
  if (!form.servicio) return false
  if (!form.motivoEntrada) return false
  if (form.equiposEntrada.length === 0) return false
  return true
})

// Envío
const onSubmit = async () => {
  if (!isFormValid.value) return
  
  try {
    const result = await Swal.fire({
      title: '¿Confirmas la creación?',
      text: 'Se generará una nueva orden de entrada con los datos ingresados.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear orden',
      cancelButtonText: 'Revisar',
      confirmButtonColor: '#10b981'
    })
    
    if (!result.isConfirmed) return
    
    isSubmitting.value = true
    
    // Simular API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    notifier.success('Orden de entrada creada correctamente')
    router.push({ name: 'admin-dashboard' })
    
  } catch (error) {
    console.error(error)
    notifier.error('Error al crear la orden de entrada')
  } finally {
    isSubmitting.value = false
  }
}

const onCancel = () => {
  router.push({ name: 'admin-dashboard' })
}
</script>

<style scoped>
@import "@/styles/operations-global.css";

/* Overrides específicos para entrada */
.op-card.insumos {
  max-width: 100%;
}

.unidades-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.unidades-grid-row {
  margin-bottom: 24px;
  border-left: 4px solid #10b981;
}

.dropzone {
  border: 2px dashed rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.03);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover, .dropzone.dragging {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.dropzone-icon {
  width: 48px;
  height: 48px;
  color: #10b981;
  margin-bottom: 12px;
}

.previews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.preview-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-prev {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

@media (max-width: 768px) {
  .unidades-grid {
    grid-template-columns: 1fr;
  }
}
</style>
