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
            </div>
            
            <div style="display: grid; grid-template-columns: 285px 1fr; gap: 20px; width: 100%; align-items: start;">
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="field">
                  <label>Motivo de Entrada</label>
                  <CustomSelect 
                    v-model="form.motivoEntrada" 
                    :options="motivoEntradaOptions"
                    placeholder="Seleccionar motivo de entrada"
                  />
                </div>
                
                <div class="field" v-if="form.motivoEntrada === 'otro'">
                  <label>Especificar otro motivo</label>
                  <input
                    class="control"
                    v-model.trim="form.otroMotivo"
                    placeholder="Especifique el motivo de entrada"
                  />
                </div>
              </div>
              
              <div class="field">
                <label>Descripción</label>
                <textarea
                  class="control"
                  v-model.trim="form.descripcion"
                  placeholder="Ej. El equipo cuenta con una fuga en una toma de vacío"
                  style="width: 100%; height: 200px; resize: vertical;"
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
            <div class="add-item-form" style="background: linear-gradient(135deg, rgba(147, 197, 253, 0.15), rgba(167, 243, 208, 0.15)); padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1.5px solid rgba(59, 130, 246, 0.2); overflow: visible;">
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Selector de tipo y cantidad -->
                <div style="display: flex; justify-content: center; align-items: end; gap: 16px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; z-index: 1000;">
                  <div class="field" :style="{ 
                    width: newItem.tipo ? '280px' : '280px',
                    transform: newItem.tipo ? 'translateX(-70px)' : 'translateX(0)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 1001
                  }">
                    <label style="font-weight: 700; color: rgba(15, 23, 42, 0.95); font-size: 0.95rem; text-align: center; display: block;">¿Qué entra?</label>
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
                    <div class="field" v-if="newItem.tipo" style="width: 160px;">
                      <label style="font-weight: 600; font-size: 0.88rem; color: rgba(15, 23, 42, 0.9); text-align: center; display: block;">CANTIDAD</label>
                      <div class="counter" style="justify-content: center;">
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
                        <!-- Fila 1: Nombre (a lo ancho) -->
                        <div class="field field-wide">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">{{ getNombreLabel() }}</label>
                          <input class="control" v-model.trim="unidad.nombre" :placeholder="getNombrePlaceholder()" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <!-- Fila 2: Marca y Ubicación -->
                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Marca</label>
                          <input class="control" v-model.trim="unidad.marca" placeholder="Ej. Philips" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Ubicación</label>
                          <input class="control" v-model.trim="unidad.ubicacion" placeholder="Ej. UCIA" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <!-- Fila 3: Modelo y No. Serie -->
                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Modelo</label>
                          <input class="control" v-model.trim="unidad.modelo" placeholder="ej. MX40" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">No. Serie</label>
                          <input class="control" v-model.trim="unidad.serie" placeholder="ej. 3500" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <!-- Fila 4: Referencia y Clave HRAEI -->
                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Referencia</label>
                          <input class="control" v-model.trim="unidad.referencia" placeholder="ej. 9K9162" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>
                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Clave HRAEI</label>
                          <input class="control" v-model.trim="unidad.claveHRAEI" placeholder="ej. COMODATO" style="font-size: 0.9rem; padding: 10px 14px; width: 100%;" />
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
                        <div class="field field-wide">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">{{ getNombreLabel() }}</label>
                          <input class="control" v-model.trim="unidad.nombre" :placeholder="getNombrePlaceholder()" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Marca</label>
                          <input class="control" v-model.trim="unidad.marca" placeholder="Marca" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-medium">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Modelo</label>
                          <input class="control" v-model.trim="unidad.modelo" placeholder="Modelo" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Lote</label>
                          <input class="control" v-model.trim="unidad.lote" placeholder="Lote" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Referencia</label>
                          <input class="control" v-model.trim="unidad.referencia" placeholder="Referencia" style="font-size: 0.9rem; padding: 10px 14px;" />
                        </div>

                        <div class="field field-compact">
                          <label style="font-size: 0.85rem; font-weight: 600; color: rgba(71, 85, 105, 0.95);">Clave HRAEI</label>
                          <input class="control" v-model.trim="unidad.claveHRAEI" placeholder="Clave HRAEI" style="font-size: 0.9rem; padding: 10px 14px; width: 100%;" />
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
                    <span style="font-size: 1.1rem; margin-right: 6px;">+</span> Agregar Item
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
              
              <div v-for="(item, index) in form.equiposEntrada" :key="index" class="item-row">
                <div class="item-head">
                  <span class="badge">#{{ index + 1 }}</span>
                  <span style="font-weight: 700; color: rgba(15, 23, 42, 0.9);">{{ getTipoLabel(item.tipo) }}</span>
                  <span style="margin-left: 10px; color: rgba(71, 85, 105, 0.8);">x{{ item.cantidad }}</span>
                  <div style="margin-left: auto;">
                    <button
                      type="button"
                      @click="eliminarItem(index)"
                      class="btn secondary"
                      style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem;"
                    >Eliminar</button>
                  </div>
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
                </div>
                
                <!-- Unidades individuales (para equipos médicos/mobiliario) -->
                <div v-if="item.unidades && item.unidades.length > 0" class="section-card items-card">
                  <div class="section-head">
                    <h4>Detalles individuales</h4>
                    <small class="hint">Información completa de cada unidad</small>
                  </div>
                  <div class="section-list">
                    <div v-for="(unidad, uIdx) in item.unidades" :key="uIdx" class="item-unidades-card">
                      <div class="list-group-item" style="background: rgba(255,255,255,0.18); border-radius: 18px; box-shadow: 0 8px 32px rgba(15,23,42,0.12); border: 1px solid rgba(71,85,105,0.10); margin-bottom: 12px; padding: 1.2rem 1.6rem; min-height: 100px; display: flex; align-items: center; gap: 18px; backdrop-filter: blur(16px);">
                        <div style="display: flex; align-items: center; justify-content: center; min-width: 60px;">
                          <span class="badge" style="background: linear-gradient(135deg, #e5e7eb, #cbd5e1); color: #222; font-size: 1rem; padding: 10px 18px; border-radius: 999px; box-shadow: 0 2px 8px rgba(71,85,105,0.10);">#{{ uIdx + 1 }}</span>
                        </div>
                        <div style="flex: 1;">
                          <div class="d-flex w-100 justify-content-between" style="align-items: center; margin-bottom: 6px;">
                            <h5 class="mb-1" style="font-size: 1.08rem; font-weight: 700; color: #222; margin: 0;">{{ getTipoLabel(item.tipo) }}</h5>
                          </div>
                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 18px; font-size: 0.98rem;">
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">Nombre</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.nombre || '-' }}</div>
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">Marca</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.marca || '-' }}</div>
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">Ubicación</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.ubicacion || '-' }}</div>
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">Modelo</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.modelo || '-' }}</div>
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">No. Serie</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.serie || '-' }}</div>
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">Referencia</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.referencia || '-' }}</div>
                            <div style="color: #6b7280; font-weight: 500; text-align: right;">Clave HRAEI</div>
                            <div style="color: #222; font-weight: 600; text-align: left;">{{ unidad.claveHRAEI || '-' }}</div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="form.equiposEntrada.length === 0" style="color: rgba(100, 116, 139, 0.7); font-style: italic; text-align: center; margin: 20px 0;">
              No se han agregado equipos, accesorios, consumibles o refacciones
            </p>
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
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import FormShell from '@/components/FormShell.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import notifier from '@/utils/notifier'
import Swal from 'sweetalert2'

const LOCAL_KEY = 'op-entrada'

// Router para navegación
const router = useRouter()

// Opciones del select de motivo de entrada
const motivoEntradaOptions = [
  { value: '', label: 'Seleccionar' },
  { value: 'mantenimiento-preventivo-externo', label: 'MANTENIMIENTO PREVENTIVO EXTERNO.' },
  { value: 'mantenimiento-correctivo-externo', label: 'MANTENIMIENTO CORRECTIVO EXTERNO.' },
  { value: 'calibracion-externa', label: 'CALIBRACIÓN EXTERNA.' },
  { value: 'diagnostico', label: 'DIAGNOSTICO.' },
  { value: 'inicio-contrato', label: 'INICIO DE CONTRATO.' },
  { value: 'inicio-demostracion', label: 'INICIO DE DEMOSTRACIÓN.' },
  { value: 'reemplazo-equipo', label: 'REEMPLAZO DE EQUIPO.' },
  { value: 'otro', label: 'OTRO; ESPECIFICAR:' }
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
        claveHRAEI: ''
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

const eliminarItem = (index) => {
  form.equiposEntrada.splice(index, 1)
  notifier.info('Item eliminado')
}

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
    // Regresar al inicio (dashboard)
    router.push('/')
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

  loading.value = true

  const payload = {
    descripcion: form.descripcion,
    cantidad: normalizedCount(form.cantidad),
    fechaRecibo: form.fechaRecibo,
    solicitante: form.solicitante,
    unidad: form.unidad,
    turno: form.turno,
    items: form.items.map(item => ({
      descripcion: item.descripcion,
      claveHRAEI: item.claveHRAEI,
      cantidad: item.cantidad
    })),
    createdAt: new Date().toISOString()
  }

  try {
    const res = await fetch('/api/ops/entrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw new Error('No se pudo guardar en el servidor')
    }

    notifier.success('Orden guardada')
    clearForm()
  } catch (err) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
    } catch {
      // ignore storage errors
    }
    notifier.success('Orden guardada como borrador (offline)')
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
        localStorage.setItem(LOCAL_KEY, JSON.stringify(form))
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

onMounted(async () => {
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
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.18), rgba(191, 219, 254, 0.2));
  border-radius: 16px;
  padding: 18px 18px 4px 18px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
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
  min-width: 220px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(15, 23, 42, 0.92);
  font-weight: 600;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  overflow: hidden;
}

.control::placeholder {
  color: #6b7280;
  opacity: 1;
  font-weight: 500;
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

.item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 0.96rem;
  color: rgba(15, 23, 42, 0.9);
}

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
</style>
