<template>
  <Teleport to="body">
    <Transition name="update-panel-fade">
      <div v-if="visible" class="update-panel-overlay" @click.self="close">
        <div class="update-panel" tabindex="0" role="dialog" aria-modal="true">
          <!-- Encabezado -->
          <div class="update-panel-header">
            <div class="update-panel-title">Actualizar Información</div>
            <div class="update-panel-subtitle">{{ itemLabel }}</div>
            <button class="update-panel-close-icon" @click="close" aria-label="Cerrar">✕</button>
          </div>

          <!-- Contenido (con scroll) -->
          <div class="update-panel-content">
            <!-- Sección de campos editables - INFORMACIÓN BÁSICA -->
            <div class="form-section">
              <h4 class="section-title">Información Básica</h4>

              <div class="form-group">
                <label for="update-equipo" class="form-label">Equipo Médico</label>
                <input
                  id="update-equipo"
                  v-model="formData.EQUIPO_MEDICO"
                  type="text"
                  class="form-input"
                  placeholder="Nombre del equipo"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="update-marca" class="form-label">Marca</label>
                  <input
                    id="update-marca"
                    v-model="formData.MARCA"
                    type="text"
                    class="form-input"
                    placeholder="Marca"
                  />
                </div>

                <div class="form-group">
                  <label for="update-modelo" class="form-label">Modelo</label>
                  <input
                    id="update-modelo"
                    v-model="formData.MODELO"
                    type="text"
                    class="form-input"
                    placeholder="Modelo"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="update-serial" class="form-label">Número de Serie</label>
                <input
                  id="update-serial"
                  v-model="formData.NUMERO_DE_SERIE"
                  type="text"
                  class="form-input"
                  placeholder="Serial"
                />
              </div>

              <div class="form-group">
                <label for="update-descripcion" class="form-label">Descripción</label>
                <textarea
                  id="update-descripcion"
                  v-model="formData.DESCRIPCION"
                  class="form-textarea"
                  placeholder="Descripción del equipo"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="update-especificaciones" class="form-label">Especificaciones</label>
                <textarea
                  id="update-especificaciones"
                  v-model="formData.ESPECIFICACIONES"
                  class="form-textarea"
                  placeholder="Especificaciones técnicas"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="update-condicion" class="form-label">Condición</label>
                <select id="update-condicion" v-model="formData.CONDICION" class="form-input">
                  <option value="">-- Seleccionar --</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Buena">Buena</option>
                  <option value="Regular">Regular</option>
                  <option value="Deficiente">Deficiente</option>
                </select>
              </div>
            </div>

            <!-- Sección de ubicación -->
            <div class="form-section">
              <h4 class="section-title">Ubicación</h4>

              <div class="form-group">
                <label for="update-ubicacion" class="form-label">Ubicación</label>
                <input
                  id="update-ubicacion"
                  v-model="formData.UBICACION"
                  type="text"
                  class="form-input"
                  placeholder="Ubicación actual"
                />
              </div>

              <div class="form-group">
                <label for="update-area" class="form-label">Área</label>
                <input
                  id="update-area"
                  v-model="formData.AREA"
                  type="text"
                  class="form-input"
                  placeholder="Área responsable"
                />
              </div>
            </div>

            <!-- Sección de campos dinámicos - TODOS los campos de la BD -->
            <div v-if="allDynamicFields.length > 0" class="form-section">
              <h4 class="section-title">Campos Adicionales (Todos)</h4>

              <div v-for="field in allDynamicFields" :key="field.id" class="form-group">
                <label :for="`all-dynamic-${field.id}`" class="form-label">
                  {{ field.label }}
                  <span v-if="!field.fromCatalog" class="field-source-indicator">(BD)</span>
                </label>

                <!-- Input Text -->
                <input
                  v-if="field.kind === 'text' || field.kind === 'string'"
                  :id="`all-dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  type="text"
                  class="form-input"
                  :placeholder="`Ingresa ${field.label}`"
                />

                <!-- Input Number -->
                <input
                  v-else-if="field.kind === 'number'"
                  :id="`all-dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  type="number"
                  class="form-input"
                  :placeholder="`Ingresa ${field.label}`"
                />

                <!-- Input Date -->
                <input
                  v-else-if="field.kind === 'date'"
                  :id="`all-dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  type="date"
                  class="form-input"
                />

                <!-- Boolean Toggle -->
                <div v-else-if="field.kind === 'boolean'" class="boolean-toggle">
                  <button
                    type="button"
                    :class="['toggle-btn', { active: formData[field.id] === 'Si' || formData[field.id] === true }]"
                    @click="formData[field.id] = formData[field.id] === 'Si' || formData[field.id] === true ? 'No' : 'Si'"
                  >
                    {{ formData[field.id] === 'Si' || formData[field.id] === true ? 'Sí' : 'No' }}
                  </button>
                </div>

                <!-- Select/Dropdown -->
                <select
                  v-else-if="field.kind === 'select' && field.options"
                  :id="`all-dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  class="form-input"
                >
                  <option value="">-- Seleccionar --</option>
                  <option v-for="opt in field.options" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>

                <!-- Textarea para campos largos -->
                <textarea
                  v-else
                  :id="`all-dynamic-${field.id}`"
                  v-model="formData[field.id]"
                  class="form-textarea"
                  :placeholder="`Ingresa ${field.label}`"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <!-- Sección de imágenes (futura implementación) -->
            <!-- Placeholder para ImageGalleryManager -->
            <!-- <div class="form-section">
              <ImageGalleryManager
                ref="galleryManager"
                :max-images="10"
                :initial-images="initialImages"
                @update:images="handleImagesUpdate"
              />
            </div> -->

            <!-- Indicador de cambios -->
            <div v-if="hasChanges" class="changes-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Hay cambios pendientes de guardar</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="update-panel-actions">
            <button class="action-btn action-clear" @click="resetForm" :disabled="!hasChanges">
              Limpiar
            </button>
            <button class="action-btn action-cancel" @click="close"> Cancelar </button>
            <button class="action-btn action-save" @click="saveChanges" :disabled="!hasChanges || isSaving">
              <span v-if="isSaving" class="spinner"></span>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>
              <span>{{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { updateItem, getItemDetails } from '../services/updateItemService'
import Swal from 'sweetalert2'

// ImageGalleryManager será agregado en futura implementación
// const ImageGalleryManager = defineAsyncComponent(() => import('./ImageGalleryManager.vue'))

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    required: true,
  },
  dynamicCatalog: {
    type: Array,
    default: () => [],
  },
  getDynamicFieldLabel: {
    type: Function,
    default: (id) => id,
  },
  getDynamicFieldKind: {
    type: Function,
    default: () => 'text',
  },
})

const emit = defineEmits(['update:modelValue', 'item-updated'])

const visible = ref(props.modelValue)
const isSaving = ref(false)
// const galleryManager = ref(null) // Para ImageGalleryManager futura
const pendingImages = ref({ newFiles: [], removeIndices: [] })

// Campos editables mapeados desde el item
const formData = ref({
  EQUIPO_MEDICO: '',
  MARCA: '',
  MODELO: '',
  NUMERO_DE_SERIE: '',
  DESCRIPCION: '',
  ESPECIFICACIONES: '',
  CONDICION: '',
  UBICACION: '',
  AREA: '',
})

const originalData = ref(JSON.parse(JSON.stringify(formData.value)))
const initialImages = ref([])

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val
    if (val) {
      await loadItemData()
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function loadItemData() {
  if (!props.item) return

  try {
    // Obtener ID del item desde múltiples fuentes posibles
    const itemId = props.item['No DE INVENTARIO'] || props.item['CODIGO'] || props.item.id || props.item.ID
    if (!itemId) {
      throw new Error('No se pudo determinar el ID del equipo')
    }

    // Obtener datos completos del item desde el backend (NUNCA mock)
    const completeItemData = await getItemDetails(itemId)

    // === FASE 1: Cargar datos estáticos (campos fijos de la tabla) ===
    const fieldMapping = {
      'EQUIPO MEDICO': 'EQUIPO_MEDICO',
      'EQUIPO': 'EQUIPO_MEDICO',
      'MARCA': 'MARCA',
      'MODELO': 'MODELO',
      'NUMERO DE SERIE': 'NUMERO_DE_SERIE',
      'NUMERO_DE_SERIE': 'NUMERO_DE_SERIE',
      'DESCRIPCION': 'DESCRIPCION',
      'ESPECIFICACIONES': 'ESPECIFICACIONES',
      'CONDICION': 'CONDICION',
      'UBICACION': 'UBICACION',
      'AREA': 'AREA',
    }

    Object.entries(fieldMapping).forEach(([sourceKey, targetKey]) => {
      if (sourceKey in completeItemData) {
        formData.value[targetKey] = normalizeFieldValue(completeItemData[sourceKey])
      }
    })

    // === FASE 2: Cargar campos dinámicos del catálogo ===
    // Estos son campos que el sistema conoce y puede filtrar
    if (props.dynamicCatalog && props.dynamicCatalog.length > 0) {
      props.dynamicCatalog.forEach((field) => {
        const fieldId = field.id
        if (fieldId in completeItemData) {
          formData.value[fieldId] = normalizeFieldValue(completeItemData[fieldId])
        } else {
          // Si el campo está en el catálogo pero no en los datos, mostrar N/A
          formData.value[fieldId] = ''
        }
      })
    }

    // === FASE 3: Cargar ABSOLUTAMENTE TODOS los campos de la BD ===
    // Esto incluye campos ocultos por filtros y campos que no están en el catálogo
    const fieldsToSkip = new Set([
      'images', 'No DE INVENTARIO', 'CODIGO', 'id', 'ID', 'No',
      'password', 'token', 'secret' // Campos sensibles nunca deben editarse
    ])
    
    Object.keys(completeItemData).forEach((key) => {
      // Si no está ya en formData y no está en la lista de ignorados, agregarlo
      if (!(key in formData.value) && !fieldsToSkip.has(key)) {
        // Convertir null/undefined a string vacío para consistencia
        formData.value[key] = normalizeFieldValue(completeItemData[key])
      }
    })

    console.log('[UpdateItemPanel] ✓ Datos completamente cargados:', {
      itemId,
      totalFieldsLoaded: Object.keys(formData.value).length,
      fieldNames: Object.keys(formData.value).sort(),
      allDataKeys: Object.keys(completeItemData).sort()
    })

    // Guardar copia original para detectar cambios
    originalData.value = JSON.parse(JSON.stringify(formData.value))

    // Cargar imágenes iniciales (si existen)
    initialImages.value = (completeItemData.images && Array.isArray(completeItemData.images)) 
      ? completeItemData.images 
      : []

    pendingImages.value = { newFiles: [], removeIndices: [] }
  } catch (error) {
    console.error('[UpdateItemPanel] ✗ Error cargando datos:', error)
    showErrorToast(`Error al cargar datos del equipo: ${error.message}`)
  }
}

/**
 * Normaliza valores de campos para consistencia en el formulario
 * Convierte null/undefined a string vacío, y otros tipos a string
 */
function normalizeFieldValue(value) {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value).trim()
}

const itemLabel = computed(() => {
  const code = props.item?.['No DE INVENTARIO'] || props.item?.['CODIGO'] || 'Item'
  const equipo = props.item?.['EQUIPO MEDICO'] || props.item?.['EQUIPO'] || ''
  return [code, equipo].filter(Boolean).join(' - ')
})

const dynamicFields = computed(() => {
  return (props.dynamicCatalog || []).map((field) => ({
    ...field,
    label: props.getDynamicFieldLabel(field.id) || field.id,
    kind: props.getDynamicFieldKind(field.id) || field.kind || 'text',
    fromCatalog: true,
  }))
})

// Computed: TODOS los campos dinámicos de la BD (no solo los del catálogo)
const allDynamicFields = computed(() => {
  const staticFieldKeys = [
    'EQUIPO_MEDICO', 'EQUIPO MEDICO', 'EQUIPO',
    'MARCA',
    'MODELO',
    'NUMERO_DE_SERIE', 'NUMERO DE SERIE',
    'DESCRIPCION',
    'ESPECIFICACIONES',
    'CONDICION',
    'UBICACION',
    'AREA',
    'No DE INVENTARIO',
    'CODIGO',
    'images'
  ]

  // Crear un set de IDs de campos del catálogo
  const catalogFieldIds = new Set((props.dynamicCatalog || []).map(f => f.id))

  // Obtener todos los campos de formData que no sean estáticos
  const allFields = Object.keys(formData.value)
    .filter(key => !staticFieldKeys.includes(key))
    .map(fieldId => {
      const catalogField = (props.dynamicCatalog || []).find(f => f.id === fieldId)
      
      if (catalogField) {
        // Campo que está en el catálogo
        return {
          id: fieldId,
          label: props.getDynamicFieldLabel(fieldId) || fieldId,
          kind: props.getDynamicFieldKind(fieldId) || catalogField.kind || 'text',
          options: catalogField.options,
          fromCatalog: true,
        }
      } else {
        // Campo que NO está en el catálogo pero está en la BD
        return {
          id: fieldId,
          label: fieldId,
          kind: 'text', // Default para campos no catalogados
          fromCatalog: false,
        }
      }
    })

  // Ordenar: primero del catálogo, luego los de BD
  return allFields.sort((a, b) => {
    if (a.fromCatalog && !b.fromCatalog) return -1
    if (!a.fromCatalog && b.fromCatalog) return 1
    return a.label.localeCompare(b.label)
  })
})

const hasChanges = computed(() => {
  const fieldsChanged = JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
  const imagesChanged = pendingImages.value.newFiles.length > 0 || pendingImages.value.removeIndices.length > 0
  const result = fieldsChanged || imagesChanged
  console.log('hasChanges computed:', result, 'fieldsChanged:', fieldsChanged, 'imagesChanged:', imagesChanged)
  return result
})

function handleImagesUpdate(imageData) {
  pendingImages.value = imageData
}

function resetForm() {
  formData.value = JSON.parse(JSON.stringify(originalData.value))
  pendingImages.value = { newFiles: [], removeIndices: [] }
  // if (galleryManager.value) {
  //   galleryManager.value.reset()
  // }
}

async function saveChanges() {
  if (!hasChanges.value || isSaving.value) return

  isSaving.value = true

  try {
    // Preparar datos para actualización
    const updates = {}
    Object.entries(formData.value).forEach(([key, value]) => {
      if (value !== originalData.value[key]) {
        updates[key] = value
      }
    })

    const itemId = props.item?.['No DE INVENTARIO'] || props.item?.['CODIGO']

    if (!itemId) {
      throw new Error('No se puede identificar el item')
    }

    // Llamar al servicio de actualización
    const result = await updateItem(
      itemId,
      updates,
      pendingImages.value.newFiles,
      pendingImages.value.removeIndices
    )

    // Éxito
    showToast('Cambios guardados exitosamente', 'success')

    // Actualizar datos originales
    originalData.value = JSON.parse(JSON.stringify(formData.value))
    pendingImages.value = { newFiles: [], removeIndices: [] }

    // Emitir evento de actualización
    emit('item-updated', result)

    // Cerrar modal
    setTimeout(() => {
      visible.value = false
    }, 500)
  } catch (error) {
    console.error('[UpdateItemPanel] Error saving changes:', error)
    showToast(`Error al guardar: ${error.message}`, 'error')
  } finally {
    isSaving.value = false
  }
}

async function close() {
  const hasPendingChanges = hasChanges.value
  const result = await Swal.fire({
    title: hasPendingChanges ? '¿Descartar cambios?' : '¿Cerrar panel? ',
    text: hasPendingChanges
      ? 'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?'
      : '¿Estás seguro de que quieres cerrar este panel?',
    icon: hasPendingChanges ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: hasPendingChanges ? 'Sí, descartar' : 'Sí, cerrar',
    cancelButtonText: 'Cancelar',
    background: 'rgba(13, 20, 35, 0.98)',
    color: 'rgba(255, 255, 255, 0.95)',
    backdrop: 'rgba(2, 8, 18, 0.7)',
    confirmButtonColor: '#ff6b6b',
    cancelButtonColor: 'rgba(255, 255, 255, 0.08)',
    customClass: {
      container: 'swal-high-z-index'
    }
  })

  if (!result.isConfirmed) {
    return
  }

  visible.value = false
}

function showToast(message, type = 'info') {
  // Implementar con sistema de notificaciones de la app
  console.log(`[${type.toUpperCase()}] ${message}`)
  // TODO: Integrar con toast/snackbar del proyecto
}

function showErrorToast(message) {
  showToast(message, 'error')
}
</script>

<style scoped>
.update-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeInOverlay 0.2s ease-out;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.update-panel {
  display: flex;
  flex-direction: column;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
  border: 1px solid rgba(46, 221, 90, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUpPanel 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
  overflow: hidden;
}

@keyframes slideUpPanel {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes modal-pop {
  0% {
    transform: scale(0.85) translateY(40px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.update-panel-header {
  position: relative;
  padding: 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.update-panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.update-panel-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.update-panel-close-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.update-panel-close-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.update-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-source-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(96, 165, 250, 0.7);
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(30, 41, 59, 1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea {
  resize: vertical;
}

.boolean-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
  color: #60a5fa;
}

.changes-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 8px;
  color: #fed7aa;
  font-size: 0.9rem;
  font-weight: 500;
}

.changes-indicator svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.update-panel-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(0, 0, 0, 0.2);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-clear {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-clear:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.action-clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-cancel {
  background: rgba(100, 116, 139, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.action-cancel:hover {
  background: rgba(100, 116, 139, 0.3);
}

.action-save {
  background: linear-gradient(135deg, #2edd5a 0%, #2bc54c 100%);
  color: #fff;
  border: 1px solid rgba(46, 221, 90, 0.6);
}

.action-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(46, 221, 90, 0.4);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.action-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.action-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.update-panel-fade-enter-active,
.update-panel-fade-leave-active {
  transition: opacity 0.25s;
}

.update-panel-fade-enter-from,
.update-panel-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .update-panel-overlay {
    padding: 0;
  }

  .update-panel {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 16px 16px 0 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .update-panel-content {
    padding: 16px;
  }

  .update-panel-actions {
    padding: 12px 16px;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    padding: 10px 12px;
    font-size: 0.85rem;
  }
}

/* SweetAlert2 Custom Styles */
.swal-custom-popup {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid #475569;
  border-radius: 12px;
  color: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.swal-custom-title {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 1.25rem;
}

.swal-custom-confirm {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
  transition: all 0.2s ease !important;
}

.swal-custom-confirm:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
  transform: translateY(-1px) !important;
}

.swal-custom-cancel {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
  transition: all 0.2s ease !important;
}

.swal-custom-cancel:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  transform: translateY(-1px) !important;
}

/* SweetAlert2 high z-index override */
:global(.swal-high-z-index) {
  z-index: 200000 !important;
}
</style>
