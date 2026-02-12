<template>
    <div v-if="visible" class="schema-overlay" role="dialog" aria-modal="true">
        <div class="schema-container">
            <!-- ========== SIDEBAR: SECCIONES ========== -->
            <aside class="schema-sidebar">
                <div class="sidebar-header">
                   <div class="sidebar-icon">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <path d="M12 20h9"/>
                           <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                       </svg>
                   </div>
                   <h3 class="sidebar-title">Editor de Formato</h3>
                   <span class="sidebar-subtitle">{{ moduleLabel || moduleKey }}</span>
                </div>

                <nav class="sidebar-nav">
                    <!-- Configuración General -->
                    <button 
                         type="button" 
                         class="nav-item" 
                         :class="{ 'is-active': currentTab === 'general' }"
                         @click="currentTab = 'general'"
                    >
                        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <circle cx="12" cy="12" r="3"></circle>
                             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Globales (PDF)
                    </button>

                    <div class="nav-divider"></div>
                    <span class="nav-label">Pasos del Formulario</span>

                    <!-- Secciones Dinámicas -->
                    <button 
                        v-for="section in sections" 
                        :key="section.id" 
                        type="button" 
                        class="nav-item step-item" 
                        :class="{ 'is-active': currentTab === section.id }"
                        @click="currentTab = section.id"
                    >
                        <div class="step-indicator"></div>
                        {{ section.title }}
                    </button>
                    
                    <div v-if="optionSets.length" class="nav-divider"></div>
                    <span v-if="optionSets.length" class="nav-label">Listas y Opciones</span>
                    <button
                        v-for="opt in optionSets"
                        :key="opt.key"
                        type="button"
                        class="nav-item"
                        :class="{ 'is-active': currentTab === `opt_${opt.key}` }"
                        @click="currentTab = `opt_${opt.key}`"
                    >
                        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <line x1="8" y1="6" x2="21" y2="6"></line>
                           <line x1="8" y1="12" x2="21" y2="12"></line>
                           <line x1="8" y1="18" x2="21" y2="18"></line>
                           <line x1="3" y1="6" x2="3.01" y2="6"></line>
                           <line x1="3" y1="12" x2="3.01" y2="12"></line>
                           <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        {{ opt.label }}
                    </button>
                </nav>

                <div class="sidebar-footer">
                    <button class="btn-cancel" type="button" @click="emit('close')">Cancelar</button>
                    <button class="btn-save" type="button" @click="onSave">Guardar Cambios</button>
                </div>
            </aside>

            <!-- ========== MAIN CONTENT: EDITOR + PREVIEW ========== -->
            <main class="schema-content">
                <div class="content-grid">
                    <div class="editor-column">
                        <!-- VIEW: General Settings -->
                        <div v-if="currentTab === 'general'" class="editor-view">
                            <header class="view-header">
                                <h2>Configuración Global</h2>
                                <p>Ajustes generales del documento PDF</p>
                            </header>

                            <div class="settings-grid">
                                <div class="input-group">
                                   <label>Título del Documento PDF</label>
                                   <input 
                                       v-model="localSchema.settings.customTitle" 
                                       class="modern-input" 
                                       placeholder="Ej. PASE DE SALIDA DE ACTIVOS" 
                                   />
                                   <small>Este título aparecerá centrado en la cabecera del PDF.</small>
                                </div>

                                 <div class="input-group">
                                   <label>Texto al Pie de Página</label>
                                   <textarea 
                                       v-model="localSchema.settings.footerText" 
                                       class="modern-input" 
                                       rows="3"
                                       placeholder="Texto legal o informativo al final de la página..." 
                                   ></textarea>
                                </div>
                            </div>

                            <section class="branding-section">
                                <header class="branding-header">
                                    <div>
                                        <h3>Identidad gráfica</h3>
                                        <p>Controla las imágenes que se incrustan en el PDF generado.</p>
                                    </div>
                                    <div class="branding-mode-toggle" role="radiogroup" aria-label="Modo de membrete">
                                        <button
                                            type="button"
                                            :class="['mode-chip', { active: brandingMode === 'split' }]"
                                            @click="brandingMode = 'split'"
                                        >
                                            Encabezado + Pie
                                        </button>
                                        <button
                                            type="button"
                                            :class="['mode-chip', { active: brandingMode === 'single' }]"
                                            @click="brandingMode = 'single'"
                                        >
                                            Membrete único
                                        </button>
                                    </div>
                                </header>

                                <p class="branding-hint" v-if="brandingMode === 'split'">
                                    Selecciona imágenes independientes para los extremos del encabezado y el pie. Ideal cuando manejas logotipos separados.
                                </p>
                                <p class="branding-hint" v-else>
                                    Usa una sola imagen con todo el membrete (encabezado y pie) cuando el PDF debe lucir como un formato pre-impreso.
                                </p>

                                <div class="branding-grid">
                                    <div
                                        v-for="slot in activeBrandingSlots"
                                        :key="slot.id"
                                        class="branding-card"
                                        :class="{ 'has-asset': !!brandingAssets[slot.id] }"
                                    >
                                        <div class="branding-card-header">
                                            <div>
                                                <h4>{{ slot.label }}</h4>
                                                <p>{{ slot.hint }}</p>
                                            </div>
                                            <button
                                                v-if="brandingAssets[slot.id]"
                                                type="button"
                                                class="link-btn"
                                                @click="clearBrandingSlot(slot.id)"
                                            >
                                                Quitar imagen
                                            </button>
                                        </div>

                                        <div v-if="brandingAssets[slot.id]?.dataUrl" class="branding-preview">
                                            <img :src="brandingAssets[slot.id].dataUrl" :alt="slot.label" loading="lazy" />
                                        </div>

                                        <dl v-if="brandingAssets[slot.id]" class="branding-meta">
                                            <div>
                                                <dt>Archivo</dt>
                                                <dd>{{ brandingAssets[slot.id].name || 'Sin nombre' }}</dd>
                                            </div>
                                            <div v-if="brandingAssets[slot.id]?.size">
                                                <dt>Peso</dt>
                                                <dd>{{ formatFileSize(brandingAssets[slot.id].size) }}</dd>
                                            </div>
                                        </dl>

                                        <div class="branding-actions">
                                            <label class="upload-btn">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    @change="onBrandingFileChange(slot.id, $event)"
                                                />
                                                <span>{{ brandingAssets[slot.id] ? 'Reemplazar imagen' : 'Subir imagen' }}</span>
                                            </label>
                                            <small>Formatos sugeridos: PNG transparente o JPG. Máximo recomendado 1&nbsp;MB.</small>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <!-- VIEW: Sections -->
                        <template v-for="section in sections" :key="section.id">
                            <div v-if="currentTab === section.id" class="editor-view">
                                <header class="view-header">
                                    <h2>{{ section.title }}</h2>
                                    <button class="btn-primary-sm" @click="addField(section.id)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        Agregar Campo
                                    </button>
                                </header>

                                <div class="fields-list">
                                     <!-- SYSTEM FIELDS HEADER -->
                                     <div v-if="getSystemFields(section.id).length > 0" class="system-fields-section">
                                         <h4 class="subsection-title">Campos del Sistema</h4>
                                         <div v-for="sysField in getSystemFields(section.id)" :key="sysField.key" class="system-field-row" :class="{ 'is-hidden': isSystemFieldHidden(sysField.key) }">
                                             <div class="system-info">
                                                 <span class="system-label">{{ sysField.label }}</span>
                                                 <span class="system-key">({{ sysField.key }})</span>
                                             </div>
                                             <div class="system-actions">
                                                 <button 
                                                    type="button" 
                                                    class="toggle-visibility-btn" 
                                                    @click="toggleSystemField(sysField.key)"
                                                    :title="isSystemFieldHidden(sysField.key) ? 'Mostrar' : 'Ocultar'"
                                                >
                                                     <svg v-if="!isSystemFieldHidden(sysField.key)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                         <circle cx="12" cy="12" r="3"></circle>
                                                     </svg>
                                                     <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                         <line x1="1" y1="1" x2="23" y2="23"></line>
                                                     </svg>
                                                 </button>
                                             </div>
                                         </div>
                                     </div>

                                     <div v-if="getFields(section.id).length === 0" class="empty-state">
                                         <div class="empty-icon">
                                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                 <line x1="9" y1="3" x2="9" y2="21"></line>
                                             </svg>
                                         </div>
                                         <p>No hay campos personalizados en esta sección.</p>
                                         <button class="btn-link" @click="addField(section.id)">Crear el primero</button>
                                     </div>

                                     <div v-for="(field, idx) in getFields(section.id)" :key="field.id" class="field-card">
                                         <div class="field-card-header">
                                             <div class="field-type-badge">{{ getFullTypeLabel(field.type) }}</div>
                                             <div class="field-actions">
                                                 <!-- Toggle Required -->
                                                 <label class="required-toggle" title="Es obligatorio?">
                                                     <input type="checkbox" v-model="field.required">
                                                     <span>Req</span>
                                                 </label>
                                                 <button class="action-btn delete" @click="removeField(section.id, field.id)" title="Eliminar">
                                                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                         <polyline points="3 6 5 6 21 6"></polyline>
                                                         <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                     </svg>
                                                 </button>
                                             </div>
                                         </div>
                                         
                                         <div class="field-card-body">
                                             <div class="input-row">
                                                 <input v-model="field.label" class="ghost-input title" placeholder="Nombre del Campo" />
                                             </div>
                                             <div class="input-row">
                                                 <input v-model="field.placeholder" class="ghost-input" placeholder="Placeholder / Texto de ayuda" />
                                             </div>

                                             <div class="input-row type-select">
                                                 <select v-model="field.type" class="modern-select">
                                                     <option value="text">Texto Corto</option>
                                                     <option value="textarea">Texto Largo (Multilinea)</option>
                                                     <option value="number">Número</option>
                                                     <option value="date">Fecha</option>
                                                     <option value="select">Lista de Opciones</option>
                                                     <option value="checkbox">Casilla (Sí/No)</option>
                                                 </select>
                                             </div>

                                             <!-- Options Editor for Select -->
                                             <div v-if="field.type === 'select'" class="options-editor">
                                                 <label>Opciones (una por línea):</label>
                                                 <textarea v-model="field._optionsText" rows="3" placeholder="Opción A&#10;Opción B"></textarea>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </template>

                         <!-- VIEW: Option Sets -->
                         <template v-for="opt in optionSets" :key="opt.key">
                            <div v-if="currentTab === `opt_${opt.key}`" class="editor-view">
                                 <header class="view-header">
                                    <h2>Lista: {{ opt.label }}</h2>
                                    <button class="btn-primary-sm" @click="addGlobalOption(opt.key)">
                                        + Agregar Opción
                                    </button>
                                </header>
                                 <div class="global-options-list">
                                     <div v-for="(entry, idx) in getOptionList(opt.key)" :key="idx" class="global-option-row">
                                         <input v-model="entry.label" class="modern-input" placeholder="Etiqueta visible" />
                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                                             <line x1="5" y1="12" x2="19" y2="12"></line>
                                             <polyline points="12 5 19 12 12 19"></polyline>
                                         </svg>
                                         <input v-model="entry.value" class="modern-input" placeholder="Valor interno" />
                                         <button class="action-btn delete" @click="removeGlobalOption(opt.key, idx)">
                                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                 <line x1="18" y1="6" x2="6" y2="18"></line>
                                                 <line x1="6" y1="6" x2="18" y2="18"></line>
                                             </svg>
                                         </button>
                                     </div>
                                 </div>
                            </div>
                        </template>
                    </div>

                    <aside class="preview-panel">
                        <div class="preview-header">
                            <h3>Previsualización</h3>
                            <p>Actualiza en tiempo real con los ajustes del formulario.</p>
                            <div style="margin-left:auto; display:flex; gap:8px; align-items:center">
                                <button class="btn-small" @click="togglePreviewPdf" :disabled="previewPdfLoading">
                                    <svg v-if="!previewPdfLoading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7 10 12 15 17 10"/>
                                    </svg>
                                    <span v-if="!previewPdfMode">Mostrar como PDF</span>
                                    <span v-else>Mostrar como HTML</span>
                                </button>
                                <button v-if="previewPdfMode" class="btn-small" @click="fetchPdfPreviewFromServer" :disabled="previewPdfLoading" title="Regenerar PDF">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px">
                                        <polyline points="23 4 23 10 17 10" />
                                        <polyline points="1 20 1 14 7 14" />
                                        <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                                        <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
                                    </svg>
                                    Regenerar
                                </button>
                                <button v-if="previewPdfMode && previewPdfUrl" class="btn-small" @click="openPreviewInNewTab" title="Abrir en nueva pestaña">
                                    Abrir en nueva pestaña
                                </button>
                                <span v-if="previewPdfError" style="color:#fca5a5; font-size:12px">{{ previewPdfError }}</span>
                            </div>
                        </div>
                        <div class="preview-frame">
                            <template v-if="previewPdfMode">
                                <div style="width:100%; height:100%;">
                                    <div v-if="previewPdfLoading" style="padding:12px; color:#cbd5e1">Generando PDF...</div>
                                    <div v-else-if="previewPdfError" style="padding:12px; color:#fca5a5">{{ previewPdfError }}</div>
                                    <iframe v-else-if="previewPdfUrl" :src="previewPdfUrl" title="PDF preview" style="width:100%; height:100%; border:0;" />
                                    <div v-else style="padding:12px; color:#cbd5e1">Sin vista previa. Haz click en "Mostrar como PDF" para generar.</div>
                                </div>
                            </template>
                            <iframe v-else
                                title="Vista previa del formato"
                                sandbox="allow-same-origin"
                                :srcdoc="previewSrcdoc"
                            ></iframe>
                        </div>
                        <div class="preview-meta">
                            <div>
                                <span class="meta-label">Modo</span>
                                <span class="meta-value">{{ brandingMode === 'single' ? 'Membrete único' : 'Encabezado + Pie' }}</span>
                            </div>
                            <div>
                                <span class="meta-label">Título</span>
                                <span class="meta-value">{{ localSchema.settings.customTitle || 'Sin título personalizado' }}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue' 
import BlobPdfViewer from '@/components/BlobPdfViewer.vue'
import PdfViewer from '@/components/PdfViewer.vue' 
import { authedFetch } from '@/utils/api.js'

const BRANDING_SPLIT_SLOTS = [
    {
        id: 'header.left',
        label: 'Encabezado (lado izquierdo)',
        hint: 'Se mostrará en la esquina superior izquierda del PDF y del Excel.'
    },
    {
        id: 'header.right',
        label: 'Encabezado (lado derecho)',
        hint: 'Se mostrará en la esquina superior derecha del documento.'
    },
    {
        id: 'footer',
        label: 'Pie de página',
        hint: 'Reemplaza la imagen del pie que se incrusta automáticamente en el PDF.'
    }
]

const BRANDING_SINGLE_SLOTS = [
    {
        id: 'single',
        label: 'Membrete general (imagen única)',
        hint: 'Imagen completa con encabezado y pie. Se aplica como fondo en todo el documento.'
    }
]

const defaultBranding = () => ({
    mode: 'split',
    header: { left: null, right: null },
    footer: null,
    single: null
})

function normalizeBrandingAsset(asset) {
    if (!asset) return null
    if (typeof asset === 'string') {
        return { name: '', dataUrl: asset }
    }
    if (typeof asset === 'object') {
        const dataUrl = asset.dataUrl || asset.url || asset.src || null
        const name = asset.name || asset.fileName || asset.filename || ''
        return dataUrl ? { ...asset, name, dataUrl } : null
    }
    return null
}

const props = defineProps({
    modelValue: { type: Object, default: null }, // Used to be 'schema', now v-model compatible
    visible: { type: Boolean, default: true },
    moduleKey: { type: String, default: '' },
    moduleLabel: { type: String, default: 'Configuración' },
    // If sections passed as prop, use them. Else expect them in schema.
    sections: { type: Array, default: () => [] },
    optionSets: { type: Array, default: () => [] },
    systemFields: { type: Object, default: () => ({}) } // { sectionId: [ { key, label, type } ] }
})

// PDF preview mode for admin preview (HTML vs PDF)
const previewPdfMode = ref(false)
const previewPdfBlob = ref(null)
const previewPdfUrl = ref(null)
const previewPdfLoading = ref(false)
const previewPdfError = ref('')
let pdfPreviewTimer = null

// Create/revoke object URL when blob changes
watch(() => previewPdfBlob.value, (nv, ov) => {
    try {
        if (previewPdfUrl.value) {
            try { URL.revokeObjectURL(previewPdfUrl.value) } catch(e){}
            previewPdfUrl.value = null
        }
        if (nv) {
            previewPdfUrl.value = URL.createObjectURL(nv)
        }
    } catch (e) {
        console.warn('Error creating blob URL for preview:', e && e.message ? e.message : e)
    }
})

onBeforeUnmount(() => {
    try { if (previewPdfUrl.value) URL.revokeObjectURL(previewPdfUrl.value) } catch(e){}
})

const emit = defineEmits(['close', 'update:modelValue'])

function togglePreviewPdf() {
    previewPdfMode.value = !previewPdfMode.value
    previewPdfError.value = ''
}

function openPreviewInNewTab() {
    try {
        if (previewPdfUrl.value) window.open(previewPdfUrl.value, '_blank')
    } catch (e) {
        console.error('Error opening preview in new tab', e)
        alert('No se pudo abrir la vista previa en nueva pestaña')
    }
}

const localSchema = ref({
    settings: { customTitle: '', footerText: '', branding: defaultBranding() },
    sections: {},
    optionSets: {},
    hiddenSystemFields: [] // keys of system fields to hide
})
const currentTab = ref('general')
const brandingSplitSlots = BRANDING_SPLIT_SLOTS
const brandingSingleSlots = BRANDING_SINGLE_SLOTS

let lastModelSnapshot = ''

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj || {}))
}

function normalizeLocalSchema(schema) {
    if (!schema.sections) schema.sections = {}
    if (!schema.optionSets) schema.optionSets = {}
    if (!schema.settings) {
        schema.settings = { customTitle: '', footerText: '', branding: defaultBranding() }
    }
    if (!schema.settings.branding) {
        schema.settings.branding = defaultBranding()
    }
    
    // Setup branding structure without mutation issues
    const branding = schema.settings.branding
    if (!branding.mode) branding.mode = 'split'
    if (!branding.header) branding.header = { left: null, right: null }
    if (!branding.footer) branding.footer = null
    if (!branding.single) branding.single = null

    // Legacy schema support: migrate root-level print/footers
    if (schema.printTitle && !schema.settings.customTitle) {
        schema.settings.customTitle = schema.printTitle
    }
    if (schema.footerText && !schema.settings.footerText) {
        schema.settings.footerText = schema.footerText
    }

    if (!schema.hiddenSystemFields) schema.hiddenSystemFields = []

    // Ensure all sections exist in local schema
    for (const section of props.sections) {
        if (!schema.sections[section.id]) {
            schema.sections[section.id] = { title: section.title, fields: [] }
        }
        // Normalize fields
        const fields = schema.sections[section.id].fields || []
        fields.forEach(f => {
             f._optionsText = Array.isArray(f.options) ? f.options.map(toLine).join('\n') : ''
        })
    }
}

watch(
    () => props.modelValue,
    (next) => {
        const snapshot = JSON.stringify(next || {})
        if (snapshot === lastModelSnapshot) return
        lastModelSnapshot = snapshot
        localSchema.value = deepClone(next || {})
        normalizeLocalSchema(localSchema.value)
    },
    { immediate: true, deep: true }
)

function schedulePdfPreview() {
    if (!previewPdfMode.value) return
    if (previewPdfLoading.value) return
    if (pdfPreviewTimer) clearTimeout(pdfPreviewTimer)
    pdfPreviewTimer = setTimeout(() => {
        fetchPdfPreviewFromServer()
    }, 650)
}

watch(
    () => previewPdfMode.value,
    (enabled) => {
        if (!enabled) return
        schedulePdfPreview()
    }
)

watch(
    () => localSchema.value,
    () => {
        schedulePdfPreview()
    },
    { deep: true }
)

const brandingMode = computed({
    get() {
        return localSchema.value?.settings?.branding?.mode || 'split'
    },
    set(value) {
        if (localSchema.value?.settings?.branding) {
            localSchema.value.settings.branding.mode = value === 'single' ? 'single' : 'split'
        }
    }
})

const activeBrandingSlots = computed(() => {
    return brandingMode.value === 'single' ? brandingSingleSlots : brandingSplitSlots
})

const brandingAssets = computed(() => {
    const assets = {}
    const slots = [...brandingSplitSlots, ...brandingSingleSlots]
    slots.forEach(slot => {
        assets[slot.id] = getBrandingAsset(slot.id)
    })
    return assets
})

// Simplified branding structure - assumes schema is already initialized
function ensureBasicBrandingStructure() {
    if (!localSchema.value?.settings?.branding) return
    const branding = localSchema.value.settings.branding
    
    // Ensure basic structure exists
    if (!branding.header) branding.header = { left: null, right: null }
    if (!branding.mode) branding.mode = 'split'
    if (!branding.footer) branding.footer = null
    if (!branding.single) branding.single = null
}

const previewSrcdoc = computed(() => {
    try {
        return buildPreviewHtml()
    } catch (error) {
        console.error('Error building schema preview:', error)
        return '<!doctype html><html lang="es"><body style="font-family:Arial, sans-serif;background:#fef2f2;color:#991b1b;padding:16px;">No se pudo generar la vista previa.</body></html>'
    }
})

function resolveBrandingPath(path, createMissing = false) {
    const parts = String(path || '').split('.').filter(Boolean)
    let cursor = localSchema.value?.settings?.branding
    
    if (!cursor) {
        return { parent: null, key: '' }
    }
    
    for (let i = 0; i < parts.length - 1; i += 1) {
        const key = parts[i]
        if (!cursor[key] || typeof cursor[key] !== 'object') {
            if (!createMissing) {
                return { parent: null, key: '' }
            }
            cursor[key] = {}
        }
        cursor = cursor[key]
    }
    return { parent: cursor, key: parts[parts.length - 1] }
}

function getBrandingAsset(path) {
    const { parent, key } = resolveBrandingPath(path, false)
    if (!parent || key === undefined) return null
    return parent[key] || null
}

function setBrandingAsset(path, asset) {
    const { parent, key } = resolveBrandingPath(path, true)
    parent[key] = normalizeBrandingAsset(asset)
}

function clearBrandingSlot(path) {
    const { parent, key } = resolveBrandingPath(path, false)
    if (parent && key !== undefined) {
        parent[key] = null
    }
}

function onBrandingFileChange(path, event) {
    const file = event?.target?.files?.[0]
    if (!file) {
        return
    }
    const reader = new FileReader()
    reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : ''
        setBrandingAsset(path, {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
            updatedAt: new Date().toISOString()
        })
    }
    reader.readAsDataURL(file)
    if (event?.target) {
        event.target.value = ''
    }
}

function formatFileSize(bytes) {
    if (!bytes || Number.isNaN(bytes)) return ''
    const kb = 1024
    const mb = kb * 1024
    if (bytes < kb) return `${bytes} B`
    if (bytes < mb) return `${(bytes / kb).toFixed(1)} KB`
    return `${(bytes / mb).toFixed(1)} MB`
}

async function fetchPdfPreviewFromServer() {
    // Build a neutral preview payload (empty content) using current schema settings
    previewPdfLoading.value = true
    previewPdfError.value = ''
    previewPdfBlob.value = null
    try {
        const settings = localSchema.value?.settings || {}
        const moduleName = (props.moduleLabel || props.moduleKey || 'Formato').trim()
        const defaultTitle = `FORMATO ${moduleName.toUpperCase()}`
        const defaultFooter = 'Texto de pie de página de ejemplo. Personaliza este espacio desde la configuración global.'
        const previewMetadata = { title: defaultTitle, footerText: defaultFooter }
        
        // Build extraFieldsList from schema so the generated PDF has the same sections/labels as orders
        const extraFieldsList = []
        const sectionsArr = Array.isArray(props.sections) && props.sections.length ? props.sections : []
        for (const sectionDef of sectionsArr) {
            const sectionConfig = localSchema.value.sections?.[sectionDef.id]
            const sectionFields = (sectionConfig && Array.isArray(sectionConfig.fields) ? sectionConfig.fields : (sectionDef.fields || []))
            const fields = sectionFields.map(f => ({ label: f.label || f.key || '', value: '' }))
            if (fields.length) extraFieldsList.push({ sectionTitle: sectionDef.title, fields })
        }

        const blankRow = { nombre: '', cantidad: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', ubicacion: '', claveHRAEI: '' }

        const payload = {
            preview: true,
            folio: `PREVIEW-${props.moduleKey || 'FORM'}`,
            customTitle: settings.customTitle || previewMetadata.title,
            footerText: settings.footerText || previewMetadata.footerText,
            // structural placeholders used by generators — include at least one blank row for each category
            equiposEntrada: [blankRow],
            equiposServicio: [blankRow],
            items: [blankRow],
            observaciones: '',
            // include the schema-derived fields so PDF renderer prints section titles and field rows
            extraFieldsList
        }

        // Choose endpoint based on moduleKey
        const key = (props.moduleKey || '').toLowerCase()
        let endpoint = null
        if (key === 'servicio' || key === 'service') endpoint = '/api/ops/servicio-pdf'
        else if (key === 'entrada') endpoint = '/api/ops/entrada-pdf'
        else if (key === 'salida') endpoint = '/api/ops/salida-pdf'
        else if (key === 'resguardo') endpoint = '/api/ops/resguardo-pdf'
        else {
            // fallback: use preview-proxy with a fake folio param — server may still return a placeholder
            endpoint = `/api/ops/preview-proxy?folio=${encodeURIComponent(payload.folio)}`
        }

        const opts = endpoint.includes('preview-proxy')
            ? { method: 'GET' }
            : { method: 'POST', body: JSON.stringify(payload) }

        // Include branding images from current localSchema (so preview reflects unsaved changes)
        try {
            const branding = localSchema.value?.settings?.branding || {}
            const headerLeft = branding.header?.left?.dataUrl || null
            const headerRight = branding.header?.right?.dataUrl || null
            const single = branding.single?.dataUrl || null
            const footer = branding.footer?.dataUrl || null
            // prefer single letterhead for left slot if present
            if (single && !headerLeft) payload.logoLeft = single
            if (headerLeft) payload.logoLeft = headerLeft
            if (headerRight) payload.logoRight = headerRight
            if (footer) payload.footerImage = footer
        } catch (e) {
            console.warn('Error extracting branding for preview payload', e && e.message ? e.message : e)
        }

        const res = await authedFetch(endpoint, opts)
        if (!res.ok) {
            const txt = await (res.clone().text().catch(() => ''))
            throw new Error(`HTTP ${res.status} ${txt ? '- ' + txt.slice(0, 200) : ''}`)
        }
        const blob = await res.blob()
        previewPdfBlob.value = blob
    } catch (e) {
        console.error('Error generating PDF preview:', e)
        previewPdfError.value = String(e && e.message ? e.message : e) || 'Error generando PDF'
    } finally {
        previewPdfLoading.value = false
    }
}

function buildPreviewHtml() {
    // Read safely without mutating - this is called from a computed property
    const schema = localSchema.value || {}
    const settings = schema.settings || {}
    const branding = settings.branding || defaultBranding()
    const mode = (branding && branding.mode) ? branding.mode : 'split'

    const headerLeft = branding?.header?.left?.dataUrl || ''
    const headerRight = branding?.header?.right?.dataUrl || ''
    const singleLetterhead = branding?.single?.dataUrl || ''
    const footerImage = branding?.footer?.dataUrl || ''

    const moduleName = (props.moduleLabel || props.moduleKey || 'Formato').trim()
    const titleText = settings.customTitle && settings.customTitle.trim()
        ? escapeHtml(settings.customTitle.trim())
        : `FORMATO ${escapeHtml(moduleName.toUpperCase())}`
    const footerText = settings.footerText && settings.footerText.trim()
        ? escapeHtml(settings.footerText.trim())
        : 'Texto de pie de página de ejemplo. Personaliza este espacio desde la configuración global.'

    // Expose some handy values to the PDF preview generator
    const previewMetadata = { title: titleText, footerText }

    const now = new Date()
    const sampleDate = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    const sampleTime = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    const sampleFolio = 'PREVIEW-001'

    const ctx = { sampleDate, sampleTime }
    const sectionsMarkup = buildSectionsMarkup(ctx)

    // buildPreviewHtml stays synchronous and returns HTML for the HTML preview mode

    const letterheadLayer = mode === 'single' && singleLetterhead
        ? `<div class="single-letterhead"><img src="${singleLetterhead}" alt="Membrete" /></div>`
        : ''

    const headerHtml = mode === 'single'
        ? `
            <header class="header-single">
                <div class="title-stack">
                    <span class="subtitle">${escapeHtml(moduleName)}</span>
                    <h1>${titleText}</h1>
                    <span class="meta">Folio ${sampleFolio} · ${sampleDate}</span>
                </div>
            </header>
        `
        : `
            <header class="header-split">
                <div class="slot left">
                    ${headerLeft ? `<img src="${headerLeft}" alt="Logo izquierdo" />` : '<div class="logo-placeholder">Logo izquierdo</div>'}
                </div>
                <div class="center">
                    <span class="subtitle">${escapeHtml(moduleName)}</span>
                    <h1>${titleText}</h1>
                    <span class="meta">Folio ${sampleFolio} · ${sampleDate}</span>
                </div>
                <div class="slot right">
                    ${headerRight ? `<img src="${headerRight}" alt="Logo derecho" />` : '<div class="logo-placeholder muted">Logo derecho</div>'}
                </div>
            </header>
        `

    const footerHtml = `
        <footer class="preview-footer">
            ${mode === 'split' && footerImage ? `<img src="${footerImage}" alt="Pie de página" />` : ''}
            <p>${footerText}</p>
            <div class="preview-signoff">Hora estimada de firma ${sampleTime}</div>
        </footer>
    `

    return `<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vista previa</title>
    <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; }
        body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #e2e8f0; color: #0f172a; }
        body.mode-single .page { background: d(15, 23, 42, 0.92); }
        .page {
            position: relative;
            width: 100%;
            min-height: 100%;
            padding: 24px;
            display: flex;
            align-items: flex-start;
            justify-content: center;
        }
        .sheet {
            position: relative;
            width: min(820px, 100%);
            max-width: 100%;
            min-height: 550px;
            max-height: calc(100vh - 48px);
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid d(15, 23, 42, 0.08);
            box-shadow: 0 18px 45px d(15, 23, 42, 0.18);
            overflow: auto;
            padding: 36px 36px 48px;
        }
        .single-letterhead {
            position: absolute;
            inset: 18px;
            opacity: 0.35;
            pointer-events: none;
            z-index: 0;
        }
        .single-letterhead img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 16px;
        }
        .content {
            position: relative;
            z-index: 1;
        }
        header { margin-bottom: 28px; }
        .header-split {
            display: grid;
            grid-template-columns: 160px 1fr 160px;
            align-items: center;
            gap: 18px;
        }
        .header-split .slot {
            height: 86px;
            border: 1px dashed d(15, 23, 42, 0.25);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: d(148, 163, 184, 0.1);
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .header-split .slot img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .header-split .slot.muted { opacity: 0.6; }
        .header-split .center { text-align: center; }
        .header-split .subtitle { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; color: #1e293b; text-transform: uppercase; }
        .header-split h1 { margin: 8px 0 6px; font-size: 20px; letter-spacing: 0.04em; text-transform: uppercase; color: #0f172a; }
        .header-split .meta { font-size: 12px; color: #475569; }

        .header-single { text-align: center; padding: 32px 24px 20px; }
        .header-single .title-stack { display: inline-flex; flex-direction: column; gap: 6px; background: d(15, 23, 42, 0.72); padding: 18px 36px; border-radius: 16px; color: #f8fafc; box-shadow: 0 18px 45px d(15, 23, 42, 0.35); }
        .header-single .subtitle { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.8; }
        .header-single h1 { margin: 0; font-size: 22px; letter-spacing: 0.08em; text-transform: uppercase; }
        .header-single .meta { font-size: 12px; opacity: 0.85; }

        .form-section { margin-top: 20px; border: 1px solid d(15, 23, 42, 0.08); border-radius: 16px; background: d(15, 23, 42, 0.02); padding: 18px; }
        .form-section h2 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #1e3a8a; }
        .field-grid { display: grid; gap: 10px; }
        .field-line { display: flex; justify-content: space-between; gap: 14px; padding: 10px 12px; border-radius: 10px; background: #ffffff; border: 1px solid d(148, 163, 184, 0.35); font-size: 12px; }
        .field-line.system { border-style: dashed; }
        .field-line .field-label { font-weight: 600; color: #0f172a; }
        .field-line .field-value { flex: 1; text-align: right; color: #334155; }
        .form-section.empty { background: d(248, 250, 252, 0.6); border-style: dashed; }
        .form-section.empty .empty-note { font-size: 12px; color: #64748b; }

        .preview-footer { margin-top: 36px; padding-top: 18px; border-top: 1px solid d(148, 163, 184, 0.35); text-align: center; font-size: 11px; color: #475569; }
        .preview-footer img { max-width: 100%; max-height: 90px; object-fit: contain; display: block; margin: 0 auto 10px; }
        .preview-footer p { margin: 0; }
        .preview-signoff { margin-top: 8px; color: #64748b; }

        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; }
        }
    </style>
</head>
<body class="mode-${mode}">
    <div class="page">
        <div class="sheet">
            ${letterheadLayer}
            <div class="content">
                ${headerHtml}
                ${sectionsMarkup}
                ${footerHtml}
            </div>
        </div>
    </div>
</body>
</html>`
}

function buildSectionsMarkup(ctx) {
    if (!Array.isArray(props.sections) || !props.sections.length) {
        return '<section class="form-section empty"><h2>Sin secciones configuradas</h2><div class="empty-note">Agrega campos para visualizar el diseño de salida.</div></section>'
    }

    return props.sections.map(section => {
        const sectionId = section.id
        const sectionConfig = localSchema.value.sections?.[sectionId]
        const title = sectionConfig?.title || section.title || sectionId
        const fields = collectPreviewFields(sectionId, ctx)

        if (!fields.length) {
            return `<section class="form-section empty"><h2>${escapeHtml(title)}</h2><div class="empty-note">No hay campos visibles en esta sección.</div></section>`
        }

        const fieldLines = fields.map(field => {
            return `<div class="field-line ${field.origin}"><span class="field-label">${escapeHtml(field.label)}</span><span class="field-value">${escapeHtml(field.sample)}</span></div>`
        }).join('')

        return `<section class="form-section"><h2>${escapeHtml(title)}</h2><div class="field-grid">${fieldLines}</div></section>`
    }).join('')
}

function collectPreviewFields(sectionId, ctx) {
    const hidden = new Set(localSchema.value.hiddenSystemFields || [])
    const fields = []

    const systemList = props.systemFields?.[sectionId] || []
    systemList.forEach(sys => {
        if (!hidden.has(sys.key)) {
            fields.push({
                label: sys.label || sys.key,
                type: sys.type || 'text',
                origin: 'system'
            })
        }
    })

    const customList = localSchema.value.sections?.[sectionId]?.fields || []
    customList.forEach(custom => {
        fields.push({
            label: custom.label || 'Campo sin nombre',
            type: custom.type || 'text',
            origin: 'custom',
            placeholder: custom.placeholder || '',
            options: Array.isArray(custom.options) ? custom.options : []
        })
    })

    return fields.map(field => ({
        label: field.label,
        origin: field.origin,
        sample: getSampleValue(field, ctx)
    }))
}

function getSampleValue(field, ctx) {
    const placeholder = typeof field.placeholder === 'string' ? field.placeholder.trim() : ''
    const options = Array.isArray(field.options) ? field.options : []

    switch ((field.type || '').toLowerCase()) {
        case 'date':
            return ctx.sampleDate || '12 feb 2026'
        case 'time':
            return ctx.sampleTime || '12:00'
        case 'number':
            return '123.45'
        case 'select':
            return getFirstOptionValue(options) || 'Opcion seleccionada'
        case 'checkbox':
            return '[x] Seleccionado'
        case 'textarea':
            return placeholder || 'Texto descriptivo de ejemplo que ocupa varias lineas.'
        case 'table':
            return 'Tabla de datos (vista previa)'
        default:
            return placeholder || 'Dato de ejemplo'
    }
}

function getFirstOptionValue(options) {
    if (!Array.isArray(options) || !options.length) return ''
    const first = options[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
        return first.label || first.value || ''
    }
    return ''
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function toLine(opt) {
    if (typeof opt === 'string') return opt
    if (!opt) return ''
    return opt.label || opt.value || ''
}

function getFields(sectionId) {
    return localSchema.value.sections?.[sectionId]?.fields || []
}
function getOptionList(key) {
    return localSchema.value.optionSets?.[key] || []
}

function getSystemFields(sectionId) {
    return props.systemFields[sectionId] || []
}

function isSystemFieldHidden(key) {
    return localSchema.value.hiddenSystemFields.includes(key)
}

function toggleSystemField(key) {
    const idx = localSchema.value.hiddenSystemFields.indexOf(key)
    if (idx > -1) {
        localSchema.value.hiddenSystemFields.splice(idx, 1)
    } else {
        localSchema.value.hiddenSystemFields.push(key)
    }
}

function addField(sectionId) {
    const field = {
        id: `f_${Date.now()}`,
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        options: [],
        _optionsText: ''
    }
    if(!localSchema.value.sections[sectionId].fields) localSchema.value.sections[sectionId].fields = []
    localSchema.value.sections[sectionId].fields.push(field)
}

function removeField(sectionId, fieldId) {
    const arr = localSchema.value.sections[sectionId].fields
    localSchema.value.sections[sectionId].fields = arr.filter(f => f.id !== fieldId)
}

function addGlobalOption(key) {
    if (!localSchema.value.optionSets[key]) localSchema.value.optionSets[key] = []
    localSchema.value.optionSets[key].push({ label: '', value: '' })
}

function removeGlobalOption(key, idx) {
    localSchema.value.optionSets[key].splice(idx, 1)
}

function getFullTypeLabel(type) {
    const map = {
        text: 'Texto', textarea: 'Area', number: 'Num', date: 'Fecha', select: 'Lista', checkbox: 'Check'
    }
    return map[type] || type
}

function onSave() {
    // Process options text
    for (const sectionKey in localSchema.value.sections) {
        const section = localSchema.value.sections[sectionKey]
        if (section.fields) {
            section.fields.forEach(field => {
                if (field.type === 'select') {
                    field.options = String(field._optionsText || '')
                        .split('\n')
                        .map(l => l.trim())
                        .filter(Boolean)
                }
                delete field._optionsText
            })
        }
    }
    
    emit('update:modelValue', deepClone(localSchema.value))
}
</script>

<style scoped>
/* Animations */
@keyframes slideIn {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.schema-overlay {
    position: fixed;
    inset: 0;
    background: d(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.schema-container {
    width: 90vw;
    max-width: 1200px;
    height: 85vh;
    background: #0f172a; /* Slate 900 */
    border: 1px solid d(148, 163, 184, 0.1);
    border-radius: 24px;
    display: flex;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px d(0, 0, 0, 0.5);
    animation: fadeIn 0.3s ease-out;
}

/* SIDEBAR */
.schema-sidebar {
    width: 280px;
    background: #1e293b; /* Slate 800 */
    border-right: 1px solid d(148, 163, 184, 0.1);
    display: flex;
    flex-direction: column;
    padding: 24px 0;
}

.sidebar-header {
    padding: 0 24px 24px;
    border-bottom: 1px solid d(148, 163, 184, 0.1);
}
.sidebar-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; margin-bottom: 12px;
}
.sidebar-title { font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin: 0; }
.sidebar-subtitle { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

.sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 24px 16px;
    display: flex; flex-direction: column; gap: 4px;
}

.nav-label {
    font-size: 0.7rem; font-weight: 700; color: #64748b; 
    text-transform: uppercase; padding: 12px 12px 6px;
}
.nav-divider { height: 1px; background: d(148, 163, 184, 0.1); margin: 8px 0; }

.nav-item {
    width: 100%;
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px;
    background: transparent; border: none;
    color: #cbd5e1;
    border-radius: 8px;
    cursor: pointer; text-align: left;
    transition: all 0.2s;
    font-size: 0.9rem;
}
.nav-item:hover { background: d(255,255,255,0.05); color: #fff; }
.nav-item.is-active { background: d(59, 130, 246, 0.15); color: #60a5fa; font-weight: 600; }
.step-indicator { 
    width: 8px; height: 8px; border-radius: 50%; 
    background: #475569; transition: all 0.2s; 
}
.nav-item.is-active .step-indicator { background: #60a5fa; box-shadow: 0 0 8px d(96, 165, 250, 0.5); }

.sidebar-footer {
    padding: 16px 24px;
    border-top: 1px solid d(148, 163, 184, 0.1);
    display: grid; gap: 12px;
}

/* CONTENT */
.schema-content {
    flex: 1;
    overflow-y: auto;
    background: #0f172a;
    padding: 40px;
    position: relative;
}

.content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 28px;
    align-items: flex-start;
}

.editor-column {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.preview-panel {
    position: sticky;
    top: 32px;
    background: d(15, 23, 42, 0.55);
    border: 1px solid d(148, 163, 184, 0.18);
    border-radius: 20px;
    padding: 20px 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    /* allow flex children to shrink properly inside sticky container */
    min-height: 0;
    max-height: calc(100vh - 120px);
    backdrop-filter: blur(12px);
}

.preview-header h3 {
    margin: 0;
    color: #f8fafc;
    font-size: 1.1rem;
}

.preview-header p {
    margin: 6px 0 0;
    color: #a5b4fc;
    font-size: 0.8rem;
}

.preview-frame {
    flex: 1;
    min-height: 420px;
    background: d(15, 23, 42, 0.8);
    border-radius: 16px;
    border: 1px solid d(59, 130, 246, 0.18);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px d(15, 23, 42, 0.25);
    /* ensure children can use full height */
    display: flex;
    align-items: stretch;
}

.preview-frame iframe {
    width: 100%;
    height: 100% !important;
    min-height: 420px;
    border: 0;
    background: #0f172a;
    display: block;
}

.preview-meta {
    display: grid;
    gap: 10px;
    font-size: 0.82rem;
    color: #cbd5f5;
}

.preview-meta .meta-label {
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.65rem;
    color: #94a3b8;
}

.preview-meta .meta-value {
    font-weight: 600;
    color: #e2e8f0;
}

.editor-view {
    max-width: 800px;
    margin: 0 auto;
    animation: slideIn 0.3s ease-out;
}

.view-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 32px;
    padding-bottom: 16px; border-bottom: 1px solid d(148, 163, 184, 0.1);
}
.view-header h2 { font-size: 1.5rem; color: #fff; margin: 0; }
.view-header p { color: #94a3b8; margin: 4px 0 0; }

/* Fields Grid / Cards */
.fields-list { display: grid; gap: 16px; }
.field-card {
    background: #1e293b;
    border: 1px solid d(148, 163, 184, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s;
}
.field-card:focus-within { border-color: #3b82f6; }

.field-card-header {
    background: d(15, 23, 42, 0.3);
    padding: 12px 16px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid d(148, 163, 184, 0.1);
}

.field-type-badge {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    background: #334155; color: #94a3b8;
    padding: 2px 8px; border-radius: 4px;
}

.field-card-body { padding: 16px; display: grid; grid-template-columns: 2fr 2fr 1.5fr; gap: 12px; }

/* Inputs */
.ghost-input {
    background: transparent; border: none;
    color: #e2e8f0; width: 100%;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
    font-size: 0.9rem;
}
.ghost-input:focus { outline: none; border-bottom-color: #3b82f6; }
.ghost-input.title { font-weight: 600; font-size: 1rem; color: #fff; }
.ghost-input::placeholder { color: #64748b; }

.modern-select {
    width: 100%;
    background: #0f172a;
    border: 1px solid d(148, 163, 184, 0.2);
    color: #cbd5e1;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
}

.options-editor {
    grid-column: 1 / -1;
    margin-top: 8px;
    background: #0f172a; padding: 12px; border-radius: 8px;
}
.options-editor textarea {
    width: 100%; background: transparent; border: none; color: #94a3b8;
    font-size: 0.85rem; font-family: monospace; resize: vertical;
}

.field-actions { display: flex; align-items: center; gap: 12px; }
.required-toggle {
    display: flex; align-items: center; gap: 6px;
    color: #94a3b8; font-size: 0.8rem; cursor: pointer; user-select: none;
}
.required-toggle input { accent-color: #3b82f6; }

.action-btn.delete {
    background: transparent; border: none;
    color: #64748b; cursor: pointer; padding: 6px;
    border-radius: 6px; transition: all 0.2s;
}
.action-btn.delete:hover { background: d(239, 68, 68, 0.1); color: #ef4444; }

/* Buttons */
.btn-save {
    width: 100%; padding: 12px;
    background: #3b82f6; color: white; border: none;
    border-radius: 12px; font-weight: 600; cursor: pointer;
}
.btn-save:hover { background: #2563eb; }

.btn-cancel {
    width: 100%; padding: 12px;
    background: transparent; color: #94a3b8; border: 1px solid d(148, 163, 184, 0.2);
    border-radius: 12px; font-weight: 500; cursor: pointer;
}
.btn-cancel:hover { background: d(255,255,255,0.05); color: #fff; }

.btn-primary-sm {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: d(59, 130, 246, 0.1);
    color: #60a5fa; border: 1px solid d(59, 130, 246, 0.2);
    border-radius: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 600;
}
.btn-primary-sm:hover { background: d(59, 130, 246, 0.2); }

.empty-state {
    display: flex; flex-direction: column; align-items: center;
    padding: 40px; background: d(30, 41, 59, 0.4);
    border-radius: 16px; border: 2px dashed d(148, 163, 184, 0.1);
}
.empty-icon { color: #475569; margin-bottom: 16px; }
.btn-link { background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer; }

/* Global Options */
.global-options-list { display: flex; flex-direction: column; gap: 8px; }
.global-option-row { display: grid; grid-template-columns: 1fr 24px 1fr 32px; align-items: center; gap: 12px; }
.modern-input { width: 100%; padding: 10px; background: #1e293b; border: 1px solid d(148, 163, 184, 0.2); border-radius: 8px; color: #fff; }

/* Branding */
.branding-section {
    margin-top: 40px;
    background: rgba(30, 41, 59, 0.45);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 16px;
    padding: 24px;
    display: grid;
    gap: 20px;
}

.branding-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.branding-header h3 {
    margin: 0 0 4px;
    color: #f8fafc;
    font-size: 1.1rem;
}

.branding-header p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.9rem;
}

.branding-mode-toggle {
    display: inline-flex;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(96, 165, 250, 0.25);
    border-radius: 999px;
    padding: 4px;
    gap: 4px;
}

.mode-chip {
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s;
}

.mode-chip.active {
    background: #2563eb;
    color: #fff;
    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35);
}

.branding-hint {
    margin: 0;
    color: #64748b;
    font-size: 0.85rem;
}

.branding-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.branding-card {
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 14px;
    padding: 20px;
    display: grid;
    gap: 14px;
    transition: border-color 0.2s;
}

.branding-card.has-asset {
    border-color: rgba(96, 165, 250, 0.35);
}

.branding-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.branding-card-header h4 {
    margin: 0;
    color: #e2e8f0;
    font-size: 1rem;
}

.branding-card-header p {
    margin: 4px 0 0;
    color: #94a3b8;
    font-size: 0.8rem;
}

.link-btn {
    background: none;
    border: none;
    color: #f87171;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: underline;
}

.branding-preview {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.08);
    border-radius: 10px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 140px;
    overflow: hidden;
}

.branding-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.branding-meta {
    display: grid;
    gap: 6px;
    font-size: 0.85rem;
    color: #e2e8f0;
}

.branding-meta div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.branding-meta dt {
    font-weight: 600;
    color: #94a3b8;
}

.branding-meta dd {
    margin: 0;
}

.branding-actions {
    display: grid;
    gap: 10px;
}

.upload-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(37, 99, 235, 0.35);
    color: #60a5fa;
    padding: 10px 16px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.upload-btn:hover {
    background: rgba(37, 99, 235, 0.25);
}

.upload-btn input {
    display: none;
}

.branding-actions small {
    color: #64748b;
    font-size: 0.75rem;
}

@media (max-width: 1200px) {
    .content-grid { grid-template-columns: 1fr; }
    .preview-panel { position: static; max-height: none; }
}

@media (max-width: 768px) {
    .schema-container { flex-direction: column; height: 95vh; }
    .schema-sidebar { width: 100%; height: auto; flex-direction: row; align-items: center; padding: 16px; overflow-x: auto; }
    .sidebar-header { border-bottom: none; padding: 0; display: flex; align-items: center; gap: 12px; }
    .sidebar-icon { margin: 0; width: 32px; height: 32px; }
    .sidebar-nav { display: none; } /* Hide complicated nav on mobile for now, or make hamburger */
    .schema-content { padding: 20px; }
    .preview-panel { order: -1; }
    .preview-frame { min-height: 320px; }
    .field-card-body { grid-template-columns: 1fr; }
}

/* System Fields */
.subsection-title {
    font-size: 0.75rem; 
    text-transform: uppercase; 
    color: #64748b; 
    font-weight: 700; 
    margin: 0 0 8px 4px;
}
.system-fields-section {
    margin-bottom: 24px;
    background: rgba(30, 41, 59, 0.4);
    border: 1px dashed rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    padding: 12px;
}
.system-field-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 12px;
    background: #1e293b;
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid d(148, 163, 184, 0.1);
}
.system-field-row.is-hidden {
    opacity: 0.5;
    background: d(30, 41, 59, 0.5);
    border: 1px dashed d(148, 163, 184, 0.2);
}
.system-info { display: flex; flex-direction: column; }
.system-label { color: #e2e8f0; font-size: 0.9rem; font-weight: 500; }
.system-key { color: #64748b; font-size: 0.75rem; font-family: monospace; }
.toggle-visibility-btn {
    background: transparent; border: none; color: #94a3b8;
    cursor: pointer; padding: 4px; border-radius: 4px;
}
.toggle-visibility-btn:hover { color: #fff; background: d(255,255,255,0.1); }

</style>
