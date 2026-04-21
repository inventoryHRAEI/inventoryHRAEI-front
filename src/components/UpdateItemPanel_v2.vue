<template>
    <Teleport to="body">
        <!-- Panel de actualización -->
        <Transition name="update-panel-fade">
            <div v-if="visible" class="update-panel-overlay" @click.self="close">
                <div class="update-panel" tabindex="0" role="dialog" aria-modal="true">
                    <!-- Encabezado -->
                    <div class="update-panel-header">
                        <div>
                          <div class="update-panel-title">Actualizar Equipo</div>
                          <div class="update-panel-subtitle">{{ itemLabel }}</div>
                        </div>

                        <div class="header-actions">
                          <div v-if="saveSuccess" class="save-indicator">Guardado</div>
                          <button class="update-panel-close-icon" @click="close" aria-label="Cerrar">✕</button>
                        </div>
                    </div>

                    <!-- Contenido con scroll -->
                    <div class="update-panel-content">
                        <!-- Información Básica (siempre expandida) -->
                        <section class="form-section form-section-basic">
                            <h4 class="section-title">
                                <span class="title-text">Información Básica</span>
                                <span class="title-badge badge-blue">Esencial</span>
                            </h4>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="update-equipo" class="form-label">Equipo Médico</label>
                                    <input id="update-equipo" v-model="formData.EQUIPO_MEDICO" type="text"
                                        class="form-input" placeholder="Nombre del equipo" />
                                </div>

                                <div class="form-group">
                                    <label for="update-marca" class="form-label">Marca</label>
                                    <input id="update-marca" v-model="formData.MARCA" type="text" class="form-input"
                                        placeholder="Fabricante" />
                                </div>

                                <div class="form-group">
                                    <label for="update-modelo" class="form-label">Modelo</label>
                                    <input id="update-modelo" v-model="formData.MODELO" type="text" class="form-input"
                                        placeholder="Modelo" />
                                </div>

                                <div class="form-group">
                                    <label for="update-serial" class="form-label">Número de Serie</label>
                                    <input id="update-serial" v-model="formData.NUMERO_DE_SERIE" type="text"
                                        class="form-input" placeholder="Serial" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="update-descripcion" class="form-label">Descripción</label>
                                <textarea id="update-descripcion" v-model="formData.DESCRIPCION" class="form-textarea"
                                    placeholder="Descripción del equipo" rows="2"></textarea>
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
                        </section>

                        <!-- Ubicación -->
                        <section class="form-section form-section-location">
                            <h4 class="section-title">
                                <span class="title-text">Ubicación</span>
                                <span class="title-badge badge-green">{{ locationFieldsCount }}</span>
                            </h4>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="update-ubicacion" class="form-label">Ubicación</label>
                                    <input id="update-ubicacion" v-model="formData.UBICACION" type="text"
                                        class="form-input" placeholder="Ubicación actual" />
                                </div>

                                <div class="form-group">
                                    <label for="update-area" class="form-label">Área</label>
                                    <input id="update-area" v-model="formData.AREA" type="text" class="form-input"
                                        placeholder="Área responsable" />
                                </div>
                            </div>
                        </section>

                        <!-- Campos Dinámicos Categorizados con Acordeones (SIEMPRE VISIBLE) -->
                        <div class="dynamic-categories">
                            <div v-if="groupedDynamicFields && Object.keys(groupedDynamicFields).length > 0">
                                <details v-for="(fieldNames, category) in groupedDynamicFields" :key="category"
                                    class="category-accordion">
                                    <summary class="category-summary">
                                        <span class="category-title-wrapper">
                                            <VueIcon name="ic:baseline-category" size="20" class="category-icon" />
                                            <span class="category-text">{{ category }}</span>
                                        </span>
                                        <span class="category-badge" :class="getCategoryBadgeClass(category)">
                                            {{ fieldNames.length }}
                                        </span>
                                        <VueIcon name="ic:baseline-expand-more" size="18" class="category-chevron" />
                                    </summary>

                                    <div class="category-content">
                                        <div class="form-grid">
                                            <div v-for="fieldId in fieldNames" :key="fieldId" class="form-group">
                                                <label :for="`field-${fieldId}`" class="form-label">
                                                    {{ normalizeFieldLabel(fieldId) }}
                                                </label>

                                                <!-- Input Text -->
                                                <input
                                                    v-if="getFieldKind(fieldId) === 'text' || getFieldKind(fieldId) === 'string'"
                                                    :id="`field-${fieldId}`" v-model="formData[fieldId]" type="text"
                                                    class="form-input"
                                                    :placeholder="`Ingresa ${normalizeFieldLabel(fieldId)}`" />

                                                <!-- Input Number -->
                                                <input v-else-if="getFieldKind(fieldId) === 'number'"
                                                    :id="`field-${fieldId}`" v-model="formData[fieldId]" type="number"
                                                    class="form-input"
                                                    :placeholder="`Ingresa ${normalizeFieldLabel(fieldId)}`" />

                                                <!-- Input Date -->
                                                <input v-else-if="getFieldKind(fieldId) === 'date'"
                                                    :id="`field-${fieldId}`" v-model="formData[fieldId]" type="date"
                                                    class="form-input" />

                                                <!-- Boolean Toggle -->
                                                <div v-else-if="getFieldKind(fieldId) === 'boolean'"
                                                    class="boolean-toggle">
                                                    <button type="button"
                                                        :class="['toggle-btn', { active: formData[fieldId] === 'Si' || formData[fieldId] === true }]"
                                                        @click="formData[fieldId] = formData[fieldId] === 'Si' || formData[fieldId] === true ? 'No' : 'Si'">
                                                        {{ formData[fieldId] === 'Si' || formData[fieldId] === true ?
                                                        'Sí' : 'No' }}
                                                    </button>
                                                </div>

                                                <!-- Select/Dropdown -->
                                                <select v-else-if="getFieldKind(fieldId) === 'select'"
                                                    :id="`field-${fieldId}`" v-model="formData[fieldId]"
                                                    class="form-input">
                                                    <option value="">-- Seleccionar --</option>
                                                    <option v-for="opt in getFieldOptions(fieldId)" :key="opt"
                                                        :value="opt">
                                                        {{ opt }}
                                                    </option>
                                                </select>

                                                <!-- Textarea -->
                                                <textarea v-else :id="`field-${fieldId}`" v-model="formData[fieldId]"
                                                    class="form-textarea"
                                                    :placeholder="`Ingresa ${normalizeFieldLabel(fieldId)}`"
                                                    rows="2"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            </div>
                            <div v-else class="empty-categories-message">
                                No hay campos dinámicos disponibles
                            </div>
                        </div>

                        <!-- Sección de imágenes (SIEMPRE EXPANDIDA) -->
                        <section class="form-section images-section">
                            <h4 class="section-title">
                                <span class="title-text">
                                    <VueIcon name="ic:baseline-image" size="20" class="section-icon" />
                                    Imágenes del Equipo
                                </span>
                                <span class="title-badge badge-cyan">
                                    <span ref="imageBadgeRef">0</span>/10
                                </span>
                            </h4>

                            <ImageUploadManager ref="imageManager" :max-images="10"
                                @update:images="handleImagesUpdate" />
                        </section>

                        <!-- Indicador de cambios -->
                        <div v-if="hasChanges" class="changes-indicator">
                            <VueIcon name="ic:baseline-schedule" size="16" />
                            <span>Hay cambios pendientes de guardar</span>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="update-panel-actions">
                        <button class="action-btn action-clear" @click="resetForm" :disabled="!hasChanges">
                            <VueIcon name="ic:baseline-clear" size="18" />
                            Limpiar
                        </button>
                        <button class="action-btn action-cancel" @click="close">
                            <VueIcon name="ic:baseline-close" size="18" />
                            Cancelar
                        </button>
                        <button :class="['action-btn action-save', { saved: saveSuccess }]" @click="saveChanges" :disabled="!hasChanges || isSaving">
                            <span v-if="isSaving" class="spinner"></span>
                            <VueIcon v-if="!isSaving" name="ic:baseline-save" size="18" />
                            <span>{{ isSaving ? 'Guardando...' : (saveSuccess ? 'Guardado' : 'Guardar Cambios') }}</span>
                            <VueIcon v-if="saveSuccess" name="ic:baseline-check" size="18" class="check-icon" />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'
import ImageUploadManager from './ImageUploadManager.vue'
import { updateItem, getItemDetails } from '../services/updateItemService'
import Swal from 'sweetalert2'
import {
    normalizeFieldLabel,
    categorizeField,
    groupFieldsByCategory,
    getCategoryBadgeClass
} from '../utils/fieldLabelNormalizer'

const props = defineProps({
    modelValue: Boolean,
    item: {
        type: Object,
        required: false,
        default: null,
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
const imageManager = ref(null)
const imageBadgeRef = ref(null)
const pendingImages = ref({ newFiles: [], captions: [] })

// Campos editables
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
        const itemId = props.item['No DE INVENTARIO'] || props.item['CODIGO'] || props.item.id || props.item.ID
        if (!itemId) {
            throw new Error('No se pudo determinar el ID del equipo')
        }

        const completeItemData = await getItemDetails(itemId)

        // FASE 1: Estáticos
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

        // FASE 2: Catálogo dinámico
        if (props.dynamicCatalog && props.dynamicCatalog.length > 0) {
            props.dynamicCatalog.forEach((field) => {
                const fieldId = field.id
                if (fieldId in completeItemData) {
                    formData.value[fieldId] = normalizeFieldValue(completeItemData[fieldId])
                } else {
                    formData.value[fieldId] = ''
                }
            })
        }

        // FASE 3: Todos de BD
        const fieldsToSkip = new Set([
            'images', 'No DE INVENTARIO', 'CODIGO', 'id', 'ID', 'No',
            'password', 'token', 'secret'
        ])

        Object.keys(completeItemData).forEach((key) => {
            if (!(key in formData.value) && !fieldsToSkip.has(key)) {
                formData.value[key] = normalizeFieldValue(completeItemData[key])
            }
        })

        console.log('[UpdateItemPanel] ✓ Datos completamente cargados:', {
            itemId,
            totalFieldsLoaded: Object.keys(formData.value).length,
        })

        originalData.value = JSON.parse(JSON.stringify(formData.value))
        pendingImages.value = { newFiles: [], captions: [] }
        if (imageManager.value) {
            imageManager.value.reset()
        }
    } catch (error) {
        console.error('[UpdateItemPanel] ✗ Error cargando datos:', error)
        showErrorToast(`Error al cargar datos del equipo: ${error.message}`)
    }
}

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

const locationFieldsCount = computed(() => {
    let count = 0
    if (formData.value.UBICACION) count++
    if (formData.value.AREA) count++
    return count > 0 ? count : '?'
})

// Campos dinámicos (NO estáticos)
const dynamicFieldIds = computed(() => {
    const staticFields = new Set([
        'EQUIPO_MEDICO', 'EQUIPO MEDICO', 'MARCA', 'MODELO',
        'NUMERO_DE_SERIE', 'NUMERO DE SERIE', 'DESCRIPCION',
        'ESPECIFICACIONES', 'CONDICION', 'UBICACION', 'AREA',
        'No DE INVENTARIO', 'CODIGO', 'id', 'ID', 'No'
    ])

    return Object.keys(formData.value).filter(key => !staticFields.has(key))
})

// Agrupar campos dinámicos por categoría
const groupedDynamicFields = computed(() => {
    return groupFieldsByCategory(dynamicFieldIds.value)
})

const hasChanges = computed(() => {
    return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

function getFieldKind(fieldId) {
    // Primero consultar el catálogo
    if (props.dynamicCatalog && props.dynamicCatalog.length > 0) {
        const field = props.dynamicCatalog.find(f => f.id === fieldId)
        if (field) {
            return field.kind || 'text'
        }
    }

    // Usar getDynamicFieldKind si existe
    if (typeof props.getDynamicFieldKind === 'function') {
        return props.getDynamicFieldKind(fieldId) || 'text'
    }

    // Detectar por patrón
    if (fieldId.includes('FECHA') || fieldId.includes('DD MM AAAA')) return 'date'
    if (fieldId.includes('NUMERO') || fieldId.includes('CANTIDAD')) return 'number'
    if (fieldId.includes('SI NO') || fieldId.includes('FUNCIONAL')) return 'boolean'

    return 'text'
}

function getFieldOptions(fieldId) {
    if (props.dynamicCatalog && props.dynamicCatalog.length > 0) {
        const field = props.dynamicCatalog.find(f => f.id === fieldId)
        if (field && field.options) {
            return field.options
        }
    }
    return []
}

function resetForm() {
    formData.value = JSON.parse(JSON.stringify(originalData.value))
    pendingImages.value = { newFiles: [], captions: [] }
    if (imageManager.value) {
        imageManager.value.reset()
    }
}

function handleImagesUpdate(imageData) {
    pendingImages.value = {
        newFiles: imageData.files.map(f => f.file),
        captions: imageData.files.map(f => f.caption)
    }
    // Actualizar badge del contador
    if (imageBadgeRef.value) {
        imageBadgeRef.value.textContent = imageData.files.length
    }
}

const saveSuccess = ref(false)

async function saveChanges() {
    if (!hasChanges.value || isSaving.value) return

    isSaving.value = true

    try {
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

        const result = await updateItem(
            itemId,
            updates,
            pendingImages.value.newFiles,
            pendingImages.value.captions
        )

        // Inline success feedback
        saveSuccess.value = true
        showToast('Cambios guardados exitosamente', 'success')
        originalData.value = JSON.parse(JSON.stringify(formData.value))
        pendingImages.value = { newFiles: [], captions: [] }
        if (imageManager.value) {
            imageManager.value.reset()
        }

        emit('item-updated', result)

        // Keep the success visible briefly before closing
        setTimeout(() => {
            saveSuccess.value = false
            visible.value = false
        }, 700)
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
    console.log(`[${type.toUpperCase()}] ${message}`)
}

function showErrorToast(message) {
    showToast(message, 'error')
}
</script>

<style scoped>
.update-panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    backdrop-filter: blur(4px);
}

.update-panel {
    position: relative;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.update-panel-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    background: rgba(15, 23, 42, 0.8);
    flex-shrink: 0;
}

.update-panel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.update-panel-subtitle {
    font-size: 0.875rem;
    color: rgba(226, 232, 240, 0.7);
    margin: 0;
    flex: 1;
}

.update-panel-close-icon {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.2s ease;
}

.update-panel-close-icon:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.update-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Estilos de formulario */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(59, 130, 246, 0.15);
    background: rgba(30, 41, 59, 0.5);
}

.form-section-basic {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.25);
}

.form-section-location {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.25);
}

.images-section {
    background: rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.25);
}

.section-icon {
    flex-shrink: 0;
    color: currentColor;
}

.section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    gap: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.title-badge {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
    color: #fff;
}

.badge-blue {
    background: rgba(59, 130, 246, 0.3);
    color: #60a5fa;
}

.badge-green {
    background: rgba(34, 197, 94, 0.3);
    color: #4ade80;
}

.badge-amber {
    background: rgba(245, 158, 11, 0.3);
    color: #fbbf24;
}

.badge-purple {
    background: rgba(168, 85, 247, 0.3);
    color: #c084fc;
}

.badge-cyan {
    background: rgba(34, 211, 238, 0.3);
    color: #22d3ee;
}

.badge-orange {
    background: rgba(249, 115, 22, 0.3);
    color: #fb923c;
}

.badge-pink {
    background: rgba(236, 72, 153, 0.3);
    color: #f472b6;
}

.badge-slate {
    background: rgba(100, 116, 139, 0.3);
    color: #cbd5e1;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
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

/* Categorías dinámicas */
.dynamic-categories {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.empty-categories-message {
    padding: 20px;
    border-radius: 12px;
    border: 1px dashed rgba(59, 130, 246, 0.2);
    background: rgba(30, 41, 59, 0.3);
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    font-size: 0.9rem;
}

.category-accordion {
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 12px;
    background: rgba(30, 41, 59, 0.3);
    overflow: hidden;
}

.category-accordion>summary {
    list-style: none;
    cursor: pointer;
}

.category-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(30, 41, 59, 0.5);
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    user-select: none;
    transition: background 0.2s ease;
}

.category-summary:hover {
    background: rgba(30, 41, 59, 0.7);
}

.category-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

.category-icon {
    flex-shrink: 0;
    color: currentColor;
}

.category-text {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.category-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    padding: 0 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
}

.category-chevron {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.5);
    transition: transform 0.3s ease;
}

.category-accordion[open] .category-chevron {
    transform: rotate(180deg);
}

.category-content {
    padding: 16px;
    background: rgba(15, 23, 42, 0.3);
}

.images-accordion {
    border-color: rgba(34, 211, 238, 0.25) !important;
    background: rgba(34, 211, 238, 0.08) !important;
}

.images-accordion>.category-summary {
    background: rgba(34, 211, 238, 0.12) !important;
    border-bottom-color: rgba(34, 211, 238, 0.2) !important;
}

.images-accordion>.category-summary:hover {
    background: rgba(34, 211, 238, 0.18) !important;
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

.update-panel-actions {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid rgba(59, 130, 246, 0.12);
    background: linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12));
    justify-content: flex-end;
    flex-wrap: wrap;
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    z-index: 12;
    box-shadow: 0 -8px 24px rgba(2,6,23,0.6);
}

.action-save { position: relative; overflow: hidden; }
.action-save .check-icon {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0; transition: opacity .18s ease, transform .18s ease;
}
.action-save.saved .check-icon { opacity: 1; transform: translateY(-50%) scale(1.05); }
.save-indicator { background: rgba(34,197,94,.12); color: #a7f3d0; padding: 6px 10px; border-radius: 8px; font-weight:700; border:1px solid rgba(34,197,94,.18) }

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
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
    border: 1px solid rgba(59, 130, 246, 0.6);
}

.action-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
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

.update-panel-fade-enter-active,
.update-panel-fade-leave-active {
    transition: opacity 0.25s;
}

.update-panel-fade-enter-from,
.update-panel-fade-leave-to {
    opacity: 0;
}

/* Modal de confirmación */
.confirm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.confirm-box {
    background: #1a1f2e;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 16px;
    padding: 40px 30px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.confirm-icon-box {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    border: 3px solid #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #3b82f6;
    font-weight: 300;
}

.confirm-title {
    margin: 0 0 15px 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
}

.confirm-text {
    margin: 0 0 30px 0;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
}

.confirm-btns {
    display: flex;
    gap: 12px;
}

.btn-confirm-yes,
.btn-confirm-no {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-confirm-yes {
    background: #ff5555;
    color: #fff;
}

.btn-confirm-yes:hover {
    background: #ff3333;
    box-shadow: 0 6px 16px rgba(255, 85, 85, 0.4);
}

.btn-confirm-no {
    background: rgba(100, 116, 139, 0.3);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.4);
}

.btn-confirm-no:hover {
    background: rgba(100, 116, 139, 0.4);
    color: rgba(255, 255, 255, 0.95);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
    transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
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

    .form-grid {
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
