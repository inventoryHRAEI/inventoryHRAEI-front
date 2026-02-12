<template>
  <Teleport to="body">
    <Transition name="panel-fade">
      <div v-if="modelValue" class="update-panel-overlay" @click.self="closePanel">
        <div class="update-panel-modern" role="dialog" aria-modal="true" aria-labelledby="panel-title">
          <!-- Header Mejorado -->
          <div class="panel-header-modern">
            <div class="header-left">
              <h2 id="panel-title" class="panel-title">Actualizar Equipo</h2>
              <p class="panel-subtitle">{{ itemLabel }}</p>
            </div>
            <button 
              class="btn-close-modern" 
              @click="closePanel" 
              aria-label="Cerrar panel"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Tabs Navigation -->
          <div class="panel-tabs" role="tablist">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :id="`tab-${tab.id}`"
              class="tab-button"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`panel-${tab.id}`"
              type="button"
            >
              <span class="tab-icon" aria-hidden="true">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <!-- Contenido con scroll -->
          <div class="panel-content-modern">
            <!-- TAB: Información Básica -->
            <div 
              v-if="activeTab === 'basico'" 
              id="panel-basico"
              role="tabpanel"
              class="form-section"
            >
              <h3 class="section-title">Información Básica del Equipo</h3>

              <div class="form-group">
                <label for="update-equipo" class="form-label">
                  Equipo Médico
                  <span class="required-mark">*</span>
                </label>
                <input
                  id="update-equipo"
                  v-model="formData.equipoMedico"
                  type="text"
                  class="form-input"
                  placeholder="Ej. Ventilador, Monitor Cardíaco"
                  required
                />
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label for="update-marca" class="form-label">Marca</label>
                  <input
                    id="update-marca"
                    v-model="formData.marca"
                    type="text"
                    class="form-input"
                    placeholder="Ej. Philips"
                  />
                </div>

                <div class="form-group">
                  <label for="update-modelo" class="form-label">Modelo</label>
                  <input
                    id="update-modelo"
                    v-model="formData.modelo"
                    type="text"
                    class="form-input"
                    placeholder="Ej. MX40"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="update-serial" class="form-label">Número de Serie</label>
                <input
                  id="update-serial"
                  v-model="formData.serial"
                  type="text"
                  class="form-input"
                  placeholder="Número de serie del equipo"
                />
              </div>

              <div class="form-group">
                <label for="update-condicion" class="form-label">Condición</label>
                <select id="update-condicion" v-model="formData.condicion" class="form-input">
                  <option value="">-- Seleccionar --</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Buena">Buena</option>
                  <option value="Regular">Regular</option>
                  <option value="Deficiente">Deficiente</option>
                </select>
              </div>

              <div class="form-group">
                <label for="update-descripcion" class="form-label">Descripción</label>
                <textarea
                  id="update-descripcion"
                  v-model="formData.descripcion"
                  class="form-textarea"
                  placeholder="Descripción del equipo"
                  rows="3"
                  maxlength="500"
                ></textarea>
                <span class="char-count">{{ formData.descripcion?.length || 0 }}/500</span>
              </div>
            </div>

            <!-- TAB: Ubicación -->
            <div 
              v-if="activeTab === 'ubicacion'" 
              id="panel-ubicacion"
              role="tabpanel"
              class="form-section"
            >
              <h3 class="section-title">Ubicación y Responsabilidad</h3>

              <div class="form-group">
                <label for="update-area" class="form-label">
                  Área / Unidad Médica
                  <span class="required-mark">*</span>
                </label>
                <input
                  id="update-area"
                  v-model="formData.area"
                  type="text"
                  class="form-input"
                  placeholder="Ej. UCIA, Cardiología, Emergencia"
                  required
                />
              </div>

              <div class="form-group">
                <label for="update-ubicacion" class="form-label">Ubicación Específica</label>
                <input
                  id="update-ubicacion"
                  v-model="formData.ubicacion"
                  type="text"
                  class="form-input"
                  placeholder="Ej. Pasillo A, Cuarto 12"
                />
              </div>

              <div class="form-group">
                <label for="update-responsable" class="form-label">Responsable</label>
                <input
                  id="update-responsable"
                  v-model="formData.responsable"
                  type="text"
                  class="form-input"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div class="form-group">
                <label for="update-estatus" class="form-label">Estado Actual</label>
                <select id="update-estatus" v-model="formData.estatus" class="form-input">
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="EN MANTENIMIENTO">En Mantenimiento</option>
                  <option value="OPERATIVO">Operativo</option>
                  <option value="NO DISPONIBLE">No Disponible</option>
                </select>
              </div>
            </div>

            <!-- TAB: Especificaciones -->
            <div 
              v-if="activeTab === 'tecnico'" 
              id="panel-tecnico"
              role="tabpanel"
              class="form-section"
            >
              <h3 class="section-title">Especificaciones Técnicas</h3>

              <div class="form-group">
                <label for="update-especificaciones" class="form-label">Especificaciones</label>
                <textarea
                  id="update-especificaciones"
                  v-model="formData.especificaciones"
                  class="form-textarea"
                  placeholder="Características técnicas del equipo"
                  rows="4"
                  maxlength="1000"
                ></textarea>
                <span class="char-count">{{ formData.especificaciones?.length || 0 }}/1000</span>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label for="update-voltaje" class="form-label">Voltaje</label>
                  <input
                    id="update-voltaje"
                    v-model="formData.voltaje"
                    type="text"
                    class="form-input"
                    placeholder="Ej. 110V/220V"
                  />
                </div>

                <div class="form-group">
                  <label for="update-capacidad" class="form-label">Capacidad</label>
                  <input
                    id="update-capacidad"
                    v-model="formData.capacidad"
                    type="text"
                    class="form-input"
                    placeholder="Capacidad del equipo"
                  />
                </div>
              </div>
            </div>

            <!-- TAB: Mantenimiento -->
            <div 
              v-if="activeTab === 'mantenimiento'" 
              id="panel-mantenimiento"
              role="tabpanel"
              class="form-section"
            >
              <h3 class="section-title">Información de Mantenimiento</h3>

              <div class="form-group">
                <label for="update-ultimo-mantenimiento" class="form-label">Último Mantenimiento</label>
                <input
                  id="update-ultimo-mantenimiento"
                  v-model="formData.ultimoMantenimiento"
                  type="date"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="update-proximo-mantenimiento" class="form-label">Próximo Mantenimiento</label>
                <input
                  id="update-proximo-mantenimiento"
                  v-model="formData.proximoMantenimiento"
                  type="date"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="update-tecnico" class="form-label">Técnico Responsable</label>
                <input
                  id="update-tecnico"
                  v-model="formData.tecnicoResponsable"
                  type="text"
                  class="form-input"
                  placeholder="Nombre del técnico"
                />
              </div>

              <div class="form-group">
                <label for="update-notas-mantenimiento" class="form-label">Notas de Mantenimiento</label>
                <textarea
                  id="update-notas-mantenimiento"
                  v-model="formData.notasMantenimiento"
                  class="form-textarea"
                  placeholder="Notas sobre mantenimientos previos"
                  rows="3"
                  maxlength="500"
                ></textarea>
                <span class="char-count">{{ formData.notasMantenimiento?.length || 0 }}/500</span>
              </div>
            </div>

            <!-- TAB: Campos Adicionales -->
            <div 
              v-if="activeTab === 'adicionales'" 
              id="panel-adicionales"
              role="tabpanel"
              class="form-section"
            >
              <h3 class="section-title">Campos Adicionales</h3>

              <div v-if="allDynamicFields.length === 0" class="empty-state">
                <p>No hay campos adicionales disponibles.</p>
              </div>

              <div v-for="field in allDynamicFields" :key="field.id" class="form-group">
                <label :for="`dynamic-${field.id}`" class="form-label">
                  {{ field.label }}
                </label>

                <!-- Input Text -->
                <input
                  v-if="field.kind === 'text' || field.kind === 'string'"
                  :id="`dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  type="text"
                  class="form-input"
                  :placeholder="`Ingresa ${field.label}`"
                />

                <!-- Input Number -->
                <input
                  v-else-if="field.kind === 'number'"
                  :id="`dynamic-${field.id}`"
                  v-model.number="formData[field.id]"
                  type="number"
                  class="form-input"
                />

                <!-- Select -->
                <select
                  v-else-if="field.kind === 'select'"
                  :id="`dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  class="form-input"
                >
                  <option value="">-- Seleccionar --</option>
                  <option
                    v-for="opt in field.options"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>

                <!-- Textarea -->
                <textarea
                  v-else-if="field.kind === 'textarea'"
                  :id="`dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  class="form-textarea"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <!-- Footer con acciones (sticky) -->
          <div class="panel-footer-modern">
            <button 
              type="button"
              class="btn btn-ghost" 
              @click="closePanel"
              :disabled="isSaving"
            >
              Cancelar
            </button>
            <button 
              type="button"
              class="btn btn-primary" 
              @click="saveChanges"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="spinner"></span>
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  dynamicCatalog: {
    type: Array,
    default: () => []
  },
  getDynamicFieldLabel: {
    type: Function,
    default: (fieldId) => fieldId
  },
  getDynamicFieldKind: {
    type: Function,
    default: (fieldId) => 'text'
  }
})

const emit = defineEmits(['update:modelValue', 'item-updated'])

const activeTab = ref('basico')
const isSaving = ref(false)
const formData = ref({})

const tabs = [
  { id: 'basico', label: 'Información Básica', icon: '📋' },
  { id: 'ubicacion', label: 'Ubicación', icon: '📍' },
  { id: 'tecnico', label: 'Especificaciones', icon: '⚙️' },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
  { id: 'adicionales', label: 'Campos Adicionales', icon: '➕' }
]

const itemLabel = computed(() => {
  return props.item?.equipoMedico || props.item?.name || 'Sin nombre'
})

const allDynamicFields = computed(() => {
  return props.dynamicCatalog || []
})

// Sincronizar datos del item al abrir el modal
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.item) {
      formData.value = { ...props.item }
    }
  },
  { immediate: true }
)

function closePanel() {
  emit('update:modelValue', false)
}

async function saveChanges() {
  isSaving.value = true
  try {
    // Aquí iría la lógica de guardar
    // const response = await fetch(`/api/ops/equipos/${props.item.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData.value)
    // })

    console.log('Datos a guardar:', formData.value)
    
    emit('item-updated', formData.value)
    closePanel()
  } catch (error) {
    console.error('Error guardando cambios:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.update-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.update-panel-modern {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 90%;
  max-width: 650px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.panel-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid rgba(16, 24, 40, 0.08);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0b2540;
  margin: 0;
  letter-spacing: -0.3px;
}

.panel-subtitle {
  font-size: 0.9rem;
  color: #647280;
  margin: 0;
}

.btn-close-modern {
  background: transparent;
  border: none;
  color: #647280;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-close-modern:hover {
  background: rgba(16, 24, 40, 0.04);
  color: #0b2540;
}

.panel-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(16, 24, 40, 0.08);
  padding: 0 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-button {
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #647280;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 0.95rem;
}

.tab-button:hover {
  color: #0b2540;
  background: rgba(16, 24, 40, 0.02);
}

.tab-button.active {
  color: #0b2540;
  border-bottom-color: #2edd5a;
}

.tab-icon {
  font-size: 1rem;
}

.panel-content-modern {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0b2540;
  margin: 0 0 8px 0;
  letter-spacing: -0.2px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-weight: 600;
  color: #0b2540;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-mark {
  color: #ff6b6b;
  font-weight: 700;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  border: 1.5px solid rgba(16, 24, 40, 0.12);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2edd5a;
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  font-size: 0.8rem;
  color: #647280;
  text-align: right;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #647280;
  border: 2px dashed rgba(16, 24, 40, 0.1);
  border-radius: 8px;
}

.panel-footer-modern {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(16, 24, 40, 0.08);
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  position: sticky;
  bottom: 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-ghost {
  background: rgba(16, 24, 40, 0.04);
  color: #0b2540;
  border: 1.5px solid rgba(16, 24, 40, 0.12);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(16, 24, 40, 0.08);
}

.btn-primary {
  background: #2edd5a;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2bc54c;
  box-shadow: 0 6px 20px rgba(46, 221, 90, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.2s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .update-panel-modern {
    width: 95%;
    max-width: 100%;
    max-height: 95vh;
  }

  .panel-header-modern {
    padding: 16px;
  }

  .form-row-2 {
    grid-template-columns: 1fr;
  }

  .panel-tabs {
    padding: 0 16px;
  }

  .panel-content-modern {
    padding: 16px;
  }

  .panel-footer-modern {
    padding: 12px 16px;
  }

  .tab-button {
    min-width: 100px;
    padding: 10px 12px;
    font-size: 0.85rem;
  }
}
</style>
