<template>
    <Teleport to="body">
        <Transition name="panel-fade">
            <div v-if="visible" class="equipment-overlay" @click.self="closePanel">
                <div class="equipment-panel">
                    <!-- HEADER -->
                    <div class="panel-header-simple">
                        <div class="header-info">
                            <h1>Historial del Equipo</h1>
                            <p v-if="item">{{ item['No DE INVENTARIO'] }}</p>
                            <p v-if="item">{{ item['EQUIPO MEDICO'] }}</p>
                        </div>
                        <button @click="closePanel" class="btn-close-simple">✕</button>
                    </div>

                    <!-- MAINTENANCE BANNER -->
                    <div v-if="maintenanceFlow.in_progress || maintenanceFlow.last_completed" :class="['maintenance-banner', maintenanceFlow.in_progress ? 'in-progress' : 'completed']">
                        <template v-if="maintenanceFlow.in_progress">
                            <div class="banner-wrapper">
                                <div class="banner-left">
                                    <div class="status-indicator">
                                         <div class="pulse-dot"></div>
                                         <WrenchIcon class="status-icon" />
                                     </div>
                                </div>
                                
                                <div class="banner-main">
                                    <div class="banner-header">
                                        <h3 class="banner-title">Equipo en Mantenimiento</h3>
                                        <span class="badge" :class="maintenanceFlow.in_progress.maintenance_type === 'MP' ? 'preventive' : 'corrective'">
                                            <template v-if="maintenanceFlow.in_progress.maintenance_type === 'MP'"><CheckIcon class="badge-icon" /></template><template v-else><WrenchIcon class="badge-icon" /></template>
                                             {{ maintenanceFlow.in_progress.maintenance_type === 'MP' ? 'Preventivo' : 'Correctivo' }}
                                         </span>
                                    </div>
                                    
                                    <div class="banner-meta">
                                        <div class="meta-item">
                                             <BuildingLibraryIcon class="meta-icon" />
                                             <span class="meta-label">Empresa:</span>
                                             <span class="meta-value">{{ maintenanceFlow.in_progress.started_by || 'Interno' }}</span>
                                         </div>
                                         <div class="meta-item">
                                             <CalendarIcon class="meta-icon" />
                                             <span class="meta-label">Desde:</span>
                                             <span class="meta-value">{{ formatDateTime(maintenanceFlow.in_progress.started_at) }}</span>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="banner-wrapper">
                                <div class="banner-left">
                                     <div class="status-indicator completed">
                                         <CheckIcon class="status-icon" />
                                     </div>
                                 </div>
                                
                                <div class="banner-main">
                                    <div class="banner-header">
                                        <h3 class="banner-title">Mantenimiento Completado</h3>
                                    </div>
                                    
                                    <div class="banner-meta">
                                        <div class="meta-item">
                                             <CheckIcon class="meta-icon" />
                                             <span class="meta-label">Tipo:</span>
                                             <span class="meta-value">{{ maintenanceFlow.last_completed.maintenance_type === 'MP' ? 'Preventivo' : 'Correctivo' }}</span>
                                         </div>
                                         <div class="meta-item">
                                             <ClockIcon class="meta-icon" />
                                             <span class="meta-label">Finalizado:</span>
                                             <span class="meta-value">{{ formatDateTime(maintenanceFlow.last_completed.finished_at) }}</span>
                                         </div>
                                         <div class="meta-item">
                                             <UserCircleIcon class="meta-icon" />
                                             <span class="meta-label">Por:</span>
                                             <span class="meta-value">{{ maintenanceFlow.last_completed.finished_by || 'N/A' }}</span>
                                         </div>
                                         <div v-if="maintenanceFlow.last_completed.return_location" class="meta-item">
                                             <MapPinIcon class="meta-icon" />
                                             <span class="meta-label">Retornado a:</span>
                                             <span class="meta-value">{{ maintenanceFlow.last_completed.return_location }}</span>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- TABS -->
                    <div class="tabs-bar">
                        <button @click="activeTab = 'info'" :class="{ active: activeTab === 'info' }">
                            <InformationCircleIcon class="tab-icon" />
                            INFORMACIÓN
                        </button>
                        <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">
                            <ClockIcon class="tab-icon" />
                            HISTORIAL
                        </button>
                        <button @click="activeTab = 'maintenance'" :class="{ active: activeTab === 'maintenance' }">
                            <WrenchIcon class="tab-icon" />
                            MANTENIMIENTOS
                        </button>
                        <button @click="activeTab = 'states'" :class="{ active: activeTab === 'states' }">
                            <ListBulletIcon class="tab-icon" />
                            ESTADOS
                        </button>
                    </div>

                    <!-- CONTENT -->
                    <div class="panel-content">
                        <!-- Info Tab -->
                        <div v-show="activeTab === 'info'" class="tab-content">
                            <div v-if="item" class="info-grid">
                                <div class="info-item">
                                    <label>Inventario:</label>
                                    <span>{{ item['No DE INVENTARIO'] }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Equipo:</label>
                                    <span>{{ item['EQUIPO MEDICO'] }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Marca:</label>
                                    <span>{{ item['MARCA'] || '—' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Modelo:</label>
                                    <span>{{ item['MODELO'] || '—' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Serie:</label>
                                    <span>{{ item['NUMERO DE SERIE'] || item['SERIE'] || 'N/A' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Ubicación:</label>
                                    <span>{{ item['UBICACION ESPECIFICA'] || 'N/A' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Especialidad:</label>
                                    <span>{{ item['ESPECIALIDAD AREA DEL HOSPITAL'] || 'N/A' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Condición:</label>
                                    <span>{{ item['CONDICIONES DEL EQUIPO'] || item['ESTATUS'] || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- History Tab -->
                        <div v-show="activeTab === 'history'" class="tab-content">
                            <div v-if="loading" class="loading">Cargando historial...</div>
                            <div v-else-if="history && history.length > 0" class="history-list">
                                <div v-for="(entry, idx) in history" :key="idx" class="history-item">
                                    <div class="history-date">{{ formatDate(entry['ULTIMO MP DD MM AAAA']) }}</div>
                                    <div class="history-type">
                                        <template v-if="entry['TIPO DE MANTENIMIENTO']"><ClockIcon class="history-icon" /></template><template v-else><DocumentIcon class="history-icon" /></template>
                                         {{ entry['TIPO DE MANTENIMIENTO'] || 'Registro' }}
                                     </div>
                                    <div v-if="entry['OBSERVACIONES']" class="history-note">{{ entry['OBSERVACIONES'] }}</div>
                                    <div v-if="entry.images && entry.images.length" class="history-images">
                                        <img v-for="(img, idx2) in entry.images" :key="idx+'-img-'+idx2" :src="img" class="history-image" />
                                    </div>

                                    <!-- dynamic fields rendered as grouped card rows with collapsible categories -->
                                    <div class="history-fields">
                                        <template v-for="(group, category) in getGroupedFields(entry)" :key="category">
                                            <div class="field-category">
                                                <div class="category-header" @click="toggleCategory(category)" :style="{ borderLeftColor: categoryColor(category) }">
                                                    <span class="category-title">{{ category }}</span>
                                                    <span class="category-toggle">
                                                        <svg v-if="openCategories.has(category)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                          <path fill-rule="evenodd" d="M1.646 9.646a.5.5 0 0 1 .708 0L8 15.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                                        </svg>
                                                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                          <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708-.708L8 11.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6z"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div v-show="openCategories.has(category)" class="category-rows">
                                                    <div v-for="field in group" :key="field.column" class="field-row">
                                                        <span class="field-label">{{ field.label }}</span>
                                                        <span class="field-value">{{ field.value }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="empty">No hay historial</div>
                        </div>

                        <!-- States Tab -->
                        <div v-show="activeTab === 'states'" class="tab-content">
                            <div v-if="statusesLoading" class="loading">Cargando estados...</div>
                            <div v-else-if="statuses && statuses.length > 0" class="states-grid">
                                <div v-for="(status, idx) in statuses.slice(0, 20)" :key="idx" class="state-item">
                                    <span class="state-date">{{ formatDate(status['FECHA'] || status['ULTIMO MP DD MM AAAA']) }}</span>
                                    <span class="state-type">{{ status['TIPO DE MANTENIMIENTO'] || 'Estado' }}</span>
                                </div>
                            </div>
                            <div v-else class="empty">No hay estados</div>
                        </div>

                        <!-- Maintenance Tab -->
                        <div v-show="activeTab === 'maintenance'" class="tab-content">
                            <div v-if="maintenanceFlow.last_completed || maintenanceFlow.in_progress" class="maintenance-details">
                                <!-- Último Mantenimiento Completado -->
                                <template v-if="maintenanceFlow.last_completed">
                                    <div class="maintenance-section completed">
                                        <div class="section-header">
                                            <h3>Último Mantenimiento Completado</h3>
                                            <span class="completion-indicator">
                                                <CheckIcon class="completion-icon" />
                                                COMPLETADO
                                            </span>
                                        </div>
                                        <div class="maintenance-grid">
                                            <div class="maint-card">
                                                <div class="maint-label">Tipo de Mantenimiento</div>
                                                <div class="maint-value">
                                                    <span class="badge" :class="maintenanceFlow.last_completed.maintenance_type === 'MP' ? 'preventive' : 'corrective'">
                                                        <template v-if="maintenanceFlow.last_completed.maintenance_type === 'MP'"><CheckIcon class="badge-icon" /></template>
                                                        <template v-else><WrenchIcon class="badge-icon" /></template>
                                                        {{ maintenanceFlow.last_completed.maintenance_type === 'MP' ? 'Preventivo' : 'Correctivo' }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="maint-card">
                                                <div class="maint-label">Estado Final</div>
                                                <div class="maint-value">
                                                    <span class="badge" :class="maintenanceFlow.last_completed.result_status === 'functional' ? 'functional' : 'non-functional'">
                                                        <template v-if="maintenanceFlow.last_completed.result_status === 'functional'"><CheckCircleIcon class="badge-icon" /></template>
                                                        <template v-else><ExclamationCircleIcon class="badge-icon" /></template>
                                                        {{ maintenanceFlow.last_completed.result_status === 'functional' ? 'Funcional' : 'No Funcional' }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="maint-card">
                                                <div class="maint-label">Realizado Por</div>
                                                <div class="maint-value">{{ maintenanceFlow.last_completed.finished_by || 'Sistema' }}</div>
                                            </div>
                                            <div class="maint-card">
                                                <div class="maint-label">Fecha Inicio</div>
                                                <div class="maint-value">{{ formatDateTime(maintenanceFlow.last_completed.started_at) }}</div>
                                            </div>
                                            <div class="maint-card">
                                                <div class="maint-label">Fecha Finalización</div>
                                                <div class="maint-value">{{ formatDateTime(maintenanceFlow.last_completed.finished_at) }}</div>
                                            </div>
                                            <div class="maint-card" v-if="calculateDuration(maintenanceFlow.last_completed)">
                                                <div class="maint-label">Duración</div>
                                                <div class="maint-value">{{ calculateDuration(maintenanceFlow.last_completed) }}</div>
                                            </div>
                                            <div class="maint-card" v-if="maintenanceFlow.last_completed.return_location">
                                                <div class="maint-label">Retornado a</div>
                                                <div class="maint-value">{{ maintenanceFlow.last_completed.return_location }}</div>
                                            </div>
                                            <div class="maint-card" v-if="maintenanceFlow.last_completed.provider_name">
                                                <div class="maint-label">Proveedor</div>
                                                <div class="maint-value">{{ maintenanceFlow.last_completed.provider_name }}</div>
                                            </div>
                                        </div>
                                        <div v-if="maintenanceFlow.last_completed.observaciones" class="maint-observations">
                                            <div class="obs-label">Observaciones</div>
                                            <div class="obs-value">{{ maintenanceFlow.last_completed.observaciones }}</div>
                                        </div>
                                    </div>
                                </template>

                                <!-- Mantenimiento en Progreso -->
                                <template v-if="maintenanceFlow.in_progress">
                                    <div class="maintenance-section in-progress">
                                        <div class="section-header">
                                            <h3>Mantenimiento en Progreso</h3>
                                            <span class="progress-indicator">
                                                <div class="pulse-dot"></div>
                                                EN PROGRESO
                                            </span>
                                        </div>
                                        <div class="maintenance-grid">
                                            <div class="maint-card">
                                                <div class="maint-label">Tipo de Mantenimiento</div>
                                                <div class="maint-value">
                                                    <span class="badge" :class="maintenanceFlow.in_progress.maintenance_type === 'MP' ? 'preventive' : 'corrective'">
                                                        <template v-if="maintenanceFlow.in_progress.maintenance_type === 'MP'"><CheckIcon class="badge-icon" /></template>
                                                        <template v-else><WrenchIcon class="badge-icon" /></template>
                                                        {{ maintenanceFlow.in_progress.maintenance_type === 'MP' ? 'Preventivo' : 'Correctivo' }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="maint-card">
                                                <div class="maint-label">Iniciado Por</div>
                                                <div class="maint-value">{{ maintenanceFlow.in_progress.started_by || 'Sistema' }}</div>
                                            </div>
                                            <div class="maint-card">
                                                <div class="maint-label">Fecha Inicio</div>
                                                <div class="maint-value">{{ formatDateTime(maintenanceFlow.in_progress.started_at) }}</div>
                                            </div>
                                            <div class="maint-card" v-if="calculateElapsedTime(maintenanceFlow.in_progress)">
                                                <div class="maint-label">Tiempo Transcurrido</div>
                                                <div class="maint-value">{{ calculateElapsedTime(maintenanceFlow.in_progress) }}</div>
                                            </div>
                                        </div>
                                        <div v-if="maintenanceFlow.in_progress.start_notes" class="maint-observations">
                                            <div class="obs-label">Notas Iniciales</div>
                                            <div class="obs-value">{{ maintenanceFlow.in_progress.start_notes }}</div>
                                        </div>
                                    </div>
                                </template>

                                <!-- Historial de Mantenimientos -->
                                <div v-if="maintenanceFlow.history && maintenanceFlow.history.length > 0" class="maintenance-section history">
                                    <div class="section-header">
                                        <h3>Historial de Mantenimientos ({{ maintenanceFlow.history.length }})</h3>
                                    </div>
                                    <div class="maintenance-list">
                                        <div v-for="(maint, idx) in maintenanceFlow.history" :key="idx" class="maintenance-item">
                                            <div class="item-header">
                                                <span class="item-date">{{ formatDate(maint.started_at) }}</span>
                                                <span class="badge" :class="maint.maintenance_type === 'MP' ? 'preventive' : 'corrective'">
                                                    {{ maint.maintenance_type === 'MP' ? 'Preventivo' : 'Correctivo' }}
                                                </span>
                                                <span v-if="maint.status === 'completed'" class="badge functional">Completado</span>
                                                <span v-else class="badge warning">En Progreso</span>
                                            </div>
                                            <div class="item-details">
                                                <div class="detail-row">
                                                    <span class="detail-label">Técnico:</span>
                                                    <span class="detail-value">{{ maint.finished_by || maint.started_by || 'N/A' }}</span>
                                                </div>
                                                <div v-if="maint.finished_at" class="detail-row">
                                                    <span class="detail-label">Finalizado:</span>
                                                    <span class="detail-value">{{ formatDateTime(maint.finished_at) }}</span>
                                                </div>
                                                <div v-if="maint.result_status" class="detail-row">
                                                    <span class="detail-label">Resultado:</span>
                                                    <span class="detail-value">{{ maint.result_status === 'functional' ? 'Funcional' : 'No Funcional' }}</span>
                                                </div>
                                                <div v-if="maint.observaciones" class="detail-row">
                                                    <span class="detail-label">Notas:</span>
                                                    <span class="detail-value">{{ maint.observaciones }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="empty">No hay registros de mantenimiento para este equipo</div>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="panel-footer-simple">
                        <button @click="openMaintenanceWizard" class="btn-simple maintenance">
                            <WrenchIcon class="footer-icon" />
                            Mantenimiento
                        </button>
                        <button @click="previewPdf" class="btn-simple">
                            <EyeIcon class="footer-icon" />
                            Vista Previa
                        </button>
                        <button @click="downloadPdf" class="btn-simple">
                            <ArrowDownTrayIcon class="footer-icon" />
                            Descargar
                        </button>
                        <button @click="closePanel" class="btn-simple close">
                            <XMarkIcon class="footer-icon" />
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- PDF Preview Modal -->
        <Transition name="panel-fade">
            <div v-if="pdfPreviewVisible" class="pdf-modal-overlay" @click.self="closePdfPreview">
                <div class="pdf-modal-container">
                    <div class="pdf-modal-header">
                        <h3>Vista Previa del Expediente</h3>
                        <button @click="closePdfPreview" class="btn-close">✕</button>
                    </div>
                    <div class="pdf-modal-content">
                        <BlobPdfViewer v-if="pdfDataUrl" :src="pdfDataUrl" />
                        <div v-else class="pdf-loading">Generando PDF...</div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Maintenance Wizard -->
        <MaintenanceWizardV2 v-model:visible="wizardVisible" :inventoryNo="item ? item['No DE INVENTARIO'] : ''"
            :equipmentName="item ? item['EQUIPO MEDICO'] : ''"
            :currentStatus="maintenanceFlow.in_progress ? { ...maintenanceFlow.in_progress, state: 'in_progress' } : null"
            @close="wizardVisible = false" @saved="onMaintenanceSaved" />

        <!-- PDF Preview Modal -->
        <div v-if="pdfPreviewVisible" class="pdf-preview-overlay" @click.self="closePdfPreview">
            <div class="pdf-preview-content">
                <div class="pdf-header">
                    <h3>Vista Previa del Expediente</h3>
                    <button class="close-btn" @click="closePdfPreview">✕</button>
                </div>
                <BlobPdfViewer v-if="pdfDataUrl" :src="pdfDataUrl" />
                <div v-else class="pdf-loading">Generando PDF...</div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
// Icons from Heroicons
import { WrenchIcon, CheckIcon, ClockIcon, BuildingLibraryIcon, CalendarIcon, MapPinIcon, UserCircleIcon, InformationCircleIcon, ListBulletIcon, EyeIcon, ArrowDownTrayIcon, XMarkIcon, DocumentIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { getEquipmentHistory } from '@/services/historialService.js';
import { generateEquipmentPDF } from '@/services/pdfService.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DOMPurify from 'dompurify';
import JsBarcode from 'jsbarcode';
import { fetchStatusHistory, getMaintenanceFlowStatus } from '@/services/equipmentStatusService.js';
import MaintenanceWizardV2 from './MaintenanceWizardV2.vue';
import BlobPdfViewer from './BlobPdfViewer.vue';
// Icon component for small SVGs
// import encabezado image directly
import encabezadoImg from '@/images/encabezado.jpeg?inline';

const props = defineProps({
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
});

const emit = defineEmits(['close', 'edit-item']);

// State
const activeTab = ref('info');
const loading = ref(false);
const history = ref([]);
const historyMeta = ref([]);       // meta.fields from backend
const historyMovimientos = ref([]); // ENTRADA/SALIDA/RESGUARDO/SERVICIO entries
const openCategories = ref(new Set());

function toggleCategory(cat) {
    if (openCategories.value.has(cat)) {
        openCategories.value.delete(cat);
    } else {
        openCategories.value.add(cat);
    }
}

// simple color palette for categories
const categoryColors = {
    'Fijos': '#8b5cf6',
    'Mantenimiento': '#34d399',
    'Ubicación / Institucional': '#3b82f6',
    'Datos del Equipo': '#fbbf24',
    'Estado y Condición': '#f87171',
    'Otros': '#9ca3af'
};

function categoryColor(cat) {
    return categoryColors[cat] || categoryColors['Otros'];
}
const pdfPreviewVisible = ref(false);   // controls preview modal
const pdfDataUrl = ref(null);
const statuses = ref([]);
const statusesLoading = ref(false);
const wizardVisible = ref(false);

const maintenanceFlow = ref({
    in_progress: null,
    last_completed: null,
    history: []
});

// Functions
function closePanel() {
    document.body.style.overflow = 'auto';
    emit('close');
}

function openMaintenanceWizard() {
    wizardVisible.value = true;
}

async function loadHeaderImage() {
    // attempt to load a header graphic; return base64 or null
    try {
        const resp = await fetch('/images/membrete.png');
        if (!resp.ok) return null;
        const blob = await resp.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (_) {
        return null;
    }
}

// build html representing the history entries with categories
async function generateBarcodeDataUrl(code) {
    if (!code) return '';
    // create off-screen canvas
    const canvas = document.createElement('canvas');
    try {
        JsBarcode(canvas, code, {
            format: 'CODE128',
            lineColor: '#000',
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            textMargin: 4,
            margin: 0
        });
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.warn('[generateBarcodeDataUrl] failed', e);
        return '';
    }
}

async function buildPdfHtml() {
    // Generate barcode
    const barcodeUrl = await generateBarcodeDataUrl(props.item?.['No DE INVENTARIO'] || 'N/A');
    
    // global styles ensure clean breaks and corporate look
    const globalStyles = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body { font-family: 'Roboto', sans-serif; font-size: 10px; color: #222; }
            table { page-break-inside: auto; width: 90%; border-collapse: collapse; margin: 0 auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            td, th { word-break: break-word; white-space: normal; padding: 8px 10px; }
            h1,h2,h3,p,div { page-break-inside: avoid; }
        </style>
    `;
    
    // Equipment info table grouped by category with visible borders and corporate palette
    // Excludes MP monthly fields and "levantamiento" fields (they go to maintenance section)
    const buildEquipmentInfo = () => {
        if (!props.item) return '<p>No hay información del equipo</p>';

        // Fields to exclude from equipment info (they belong to maintenance/levantamiento sections)
        const excludePatterns = [
            /^MP\s/i,                    // MP fields (maintenance)
            /^MP\b/i,                    // MP prefix
            /OBSERVACIONES_/i,           // Monthly observations
            /^ESTATUS_/i,                // Monthly status
            /LEVANTAMIENTO/i,             // Levantamiento fields
            /ETIQUETA/i                  // Label fields
        ];

        const getCategory = key => {
            const f = key.toUpperCase();
            if (/INVENTARIO|SERIE|MODELO|EQUIPO/.test(f)) return 'Identificación';
            if (/MARCA|FABRICANTE|TECNOLOGIA|VOLTAJE|POTENCIA/.test(f)) return 'Especificaciones';
            if (/UBICACION|SERVICIO|AREA|DEPARTAMENTO/.test(f)) return 'Ubicación';
            if (/COSTO|PRECIO|VALOR|PROVEEDOR/.test(f)) return 'Financiera';
            if (/FECHA|GARANTIA|ADQUISICION/.test(f)) return 'Fechas';
            if (/ESTADO|STATUS|CONDICION/.test(f)) return 'Estado';
            return 'Otros';
        };

        const groups = {};
        Object.entries(props.item).forEach(([k, v]) => {
            // Skip fields that belong to maintenance or levantamento sections
            const shouldExclude = excludePatterns.some(pattern => pattern.test(k));
            if (shouldExclude) return;
            
            const cat = getCategory(k);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ label: k, value: v });
        });

        const headerColors = {
            'Identificación': '#1f3a93',        // navy
            'Especificaciones': '#0d47a1',      // dark blue
            'Ubicación': '#00695c',             // teal
            'Financiera': '#bf360c',            // dark red
            'Fechas': '#ff6f00',                // amber
            'Estado': '#374151',                // slate
            'Otros': '#455a64'                  // greyish
        };

        let html = '<table style="width:100%; border-collapse:collapse; margin:10px 0; page-break-inside:avoid; border:1px solid #333;">';
        Object.entries(groups).forEach(([cat, items]) => {
            const catColor = headerColors[cat] || '#374151';
            html += `<tr><td colspan=2 style="background:${catColor};color:white;padding:4px;font-size:9px;border-left:6px solid ${catColor};">${cat}</td></tr>`;
            items.forEach((it,idx) => {
                const bg = idx%2===0?'#f7f7f7':'#ffffff';
                html += `<tr style="page-break-inside:avoid;"><td style="border:1px solid #444;padding:4px;background:${bg};font-weight:600; font-size:8px;width:35%;">${it.label}</td><td style="border:1px solid #444;padding:4px;background:${bg};font-size:8px;">${it.value||'N/A'}</td></tr>`;
            });
        });
        html += '</table>';
        return html;
    };
    
    // Simple maintenance table (returns html + counts)
    // Only shows maintenance from August onwards (MP AGOSTO, MP SEPTIEMBRE, MP OCTUBRE, MP NOVIEMBRE)
    // Filters out rows where ALL fields are N/A
    // Excludes "levantamiento" fields from maintenance section
    const buildMaintenanceTable = () => {
        const headers = ['Fecha', 'Tipo', 'Estado', 'Ubicación Final', 'Observaciones'];
        // Use columns that match the backend history response
        const cols = ['ULTIMO MP DD MM AAAA', 'TIPO DE MANTENIMIENTO', 'ESTATUS', 'UBICACION ESPECIFICA', 'OBSERVACIONES'];

        // Month mapping for MP fields in the database
        const monthFields = {
            'MP AGOSTO': { short: 'AGOS', obsKey: 'OBSERVACIONES_AGOS', statusKey: 'ESTATUS_AGOS' },
            'MP SEPTIEMBRE': { short: 'SEPT', obsKey: 'OBSERVACIONES_SEPT', statusKey: 'ESTATUS_SEP' },
            'MP OCTUBRE': { short: 'OCT', obsKey: 'OBSERVACIONES_OCT', statusKey: 'ESTATUS_OCT' },
            'MP NOVIEMBRE': { short: 'NOV', obsKey: 'OBSERVACIONES_NOV', statusKey: 'ESTATUS_NOV' }
        };

        const rows = [];
        const addedTypes = new Set();
        
        // First, add synthetic rows from monthly MP fields (only from August onwards)
        if (props.item) {
            Object.entries(props.item).forEach(([k, v]) => {
                const upperKey = k.toUpperCase().trim();
                const monthInfo = monthFields[upperKey];
                
                if (monthInfo) {
                    const obs = props.item[monthInfo.obsKey] || '';
                    const status = props.item[monthInfo.statusKey] || '';
                    
                    // Only add if at least one field has real data (not N/A or empty)
                    const hasDate = v && v.toString().toUpperCase() !== 'N/A' && v.toString().trim() !== '';
                    const hasObs = obs && obs.toString().toUpperCase() !== 'N/A' && obs.toString().trim() !== '';
                    const hasStatus = status && status.toString().toUpperCase() !== 'N/A' && status.toString().trim() !== '';
                    
                    if (hasDate || hasObs || hasStatus) {
                        const tipoMantenimiento = 'MP ' + upperKey.replace('MP ', '').toUpperCase();
                        // Add synthetic row and mark as added
                        const synthetic = {};
                        synthetic['ULTIMO MP DD MM AAAA'] = hasDate ? v : '';
                        synthetic['TIPO DE MANTENIMIENTO'] = tipoMantenimiento;
                        synthetic['ESTATUS'] = hasStatus ? status : '';
                        synthetic['UBICACION ESPECIFICA'] = props.item['UBICACION ESPECIFICA'] || '';
                        synthetic['OBSERVACIONES'] = hasObs ? obs : '';
                        rows.push(synthetic);
                        addedTypes.add(tipoMantenimiento);
                    }
                }
            });
        }
        
        // Then, add history entries ONLY if their type wasn't already added as synthetic
        // Skip ENTRADA/SALIDA/RESGUARDO/SERVICIO — they are movimientos, not mantenimientos
        const SKIP_TYPES_MANT = new Set(['ENTRADA', 'SALIDA', 'RESGUARDO', 'SERVICIO']);
        if (history.value && history.value.length) {
            history.value.forEach(entry => {
                if (SKIP_TYPES_MANT.has(entry.tipoMantenimiento)) return;
                const tipo = entry['TIPO DE MANTENIMIENTO'];
                const tipoUpper = tipo ? tipo.toString().toUpperCase() : '';
                
                // Only add if this type wasn't already added from synthetic
                if (!addedTypes.has(tipoUpper)) {
                    rows.push(entry);
                    if (tipoUpper) addedTypes.add(tipoUpper);
                }
            });
        }

        if (rows.length === 0) {
            return { html: '<p style="text-align:center; padding:20px; color:#666;">No hay registros de mantenimiento</p>', counts: {} };
        }

        const headerRow = headers.map(h => `<th style="border:1px solid #333; padding:6px; background:#8b5cf6; color:white;">${h}</th>`).join('');
        const bodyRows = rows.map((entry, i) => {
            const bg = i % 2 === 0 ? '#e0e7ff' : '#ffffff';
            const cells = cols.map(col => `<td style="border:1px solid #444; padding:4px; background:${bg}; font-size:7px;">${entry[col] || ''}</td>`).join('');
            return `<tr style="page-break-inside:avoid;">${cells}</tr>`;
        }).join('');

        const counts = {};
        rows.forEach(e => {
            const t = e['TIPO DE MANTENIMIENTO'] || 'Sin tipo';
            counts[t] = (counts[t] || 0) + 1;
        });

        const html = `
            <table style="width:100%; border-collapse:collapse; margin:15px 0; page-break-inside:avoid; border:1px solid #333;">
                <thead><tr>${headerRow}</tr></thead>
                <tbody>${bodyRows}</tbody>
            </table>
        `;
        return { html, counts };
    };
    
    const timestamp = new Date().toLocaleString('es-ES');
    const inventoryNumber = props.item?.['No DE INVENTARIO'] || 'N/A';
    const equipmentName = props.item?.['EQUIPO MEDICO'] || '';

    // prepare maintenance table HTML
    const maintenanceResult = buildMaintenanceTable();
    const maintenanceHtml = maintenanceResult.html || '';

    return `${globalStyles}
        <div style="text-align:center; padding:10px 0; background:#f0f4f8;">
            <div style="width:520px; margin:0 auto; padding:0; box-sizing:border-box; border:1px solid #ccc; border-left:8px solid #1f3a93; border-radius:4px; background:white;">
            <!-- colored stripe -->
            <div style="height:6px; background:#1f3a93;"></div>
            <!-- header with optional logo -->
            <div style="text-align:center; background:#1f3a93; color:white; padding:12px 5px 8px; page-break-inside:avoid;">
                <div style="font-size:11px; font-weight:700; letter-spacing:0.5px;">HOSPITAL REGIONAL DE ALTA ESPECIALIDAD IXTAPALUCA</div>
                <h1 style="margin:4px 0 0 0; font-size:15px; font-weight:700; letter-spacing:1px;">REPORTE DE EQUIPO MÉDICO</h1>
            </div>
            
            <div style="margin-bottom:20px; page-break-inside:avoid;">
                <h2 style="background:#00695c; color:white; padding:8px; margin:0 0 10px 0; font-size:14px; border-radius:2px;">Información del Equipo</h2>
                <p style="font-weight:700; color:#1f3a93;margin:0 0 4px 0;">${equipmentName}</p>
                <p style="margin:0 0 4px 0;color:#333;">Inventario: ${inventoryNumber}</p>
                ${maintenanceFlow.value.in_progress ?
                    `<p style="color:#d97706; font-size:10px;">En mantenimiento (${maintenanceFlow.value.in_progress.maintenance_type}) con ${maintenanceFlow.value.in_progress.started_by || 'N/A'} desde ${formatDateTime(maintenanceFlow.value.in_progress.started_at)}</p>` : ''}
                ${maintenanceFlow.value.last_completed ?
                    `<p style="color:#10b981; font-size:10px;">Último mantenimiento ${maintenanceFlow.value.last_completed.maintenance_type} finalizado el ${formatDateTime(maintenanceFlow.value.last_completed.finished_at)}${maintenanceFlow.value.last_completed.return_location ? ' - Retornado a ' + maintenanceFlow.value.last_completed.return_location : ''}</p>` : ''}
                ${buildEquipmentInfo()}
            </div>

            
            ${barcodeUrl ? `
                <div style="text-align:center; margin:20px 0; padding:15px; border:2px solid #374151; background:#f9f9f9;">
                    <h3 style="margin:0 0 10px 0; color:#374151;">Código de Barras</h3>
                    <img src="${barcodeUrl}" style="max-width:250px; height:auto;" />
                    <p style="margin:8px 0 0 0; font-weight:bold;">${inventoryNumber}</p>
                </div>
            ` : ''}
            
            <div style="page-break-before:always;
                    margin-bottom:20px; page-break-inside:avoid;">
                <h2 style="background:#8b5cf6; color:white; padding:8px; margin:0 0 10px 0; font-size:14px; border-radius:2px;">Historial de Mantenimientos</h2>
                ${maintenanceHtml}
            </div>
            <div style="text-align:center; margin-top:30px; padding:10px; background:#f5f5f5; border-top:2px solid #ccc; font-size:10px; color:#666;">
                <p>Generado: ${timestamp}</p>
                <p>Sistema de Inventario HRAEI</p>
            </div>
        </div>
    `;
}

// build PDF using jsPDF and autoTable for cleaner appearance
async function generateDoc() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    // header image imported at build time
    let headerImg = encabezadoImg || null;
    const headerHeight = headerImg ? 60 : 0; // vertical reservation for header image
    // watermark diagonal
    doc.setFontSize(60);
    doc.setTextColor(200);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text('CONFIDENCIAL', pageWidth/2, pageHeight/2, { align:'center', angle:45 });
    doc.setGState(new doc.GState({ opacity: 1 }));

    // header stripe
    doc.setFillColor('#1f3a93');
    doc.rect(0, 0, pageWidth, 6, 'F');

    // decorative line beneath header
    doc.setDrawColor('#ffffff');
    doc.setLineWidth(0.5);
    doc.line(margin, 46, pageWidth - margin, 46);

    // header text centered
    doc.setFontSize(16).setTextColor('#fff');
    doc.text('REPORTE DE EQUIPO MÉDICO', pageWidth/2, 24, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Hospital Regional de Alta Especialidad Ixtapaluca', pageWidth/2, 38, { align: 'center' });

    // compute some quick-access values
    const inventoryNumber = props.item?.['No DE INVENTARIO'] || '';
    const equipmentName = props.item?.['EQUIPO MEDICO'] || '---';
    const timestamp = new Date().toLocaleString('es-ES');

    // starting vertical position just below header area
    let y = margin + headerHeight + 20;

    // table margin used by multiple autoTable calls
    const tableMargin = { left: margin, right: margin, top: margin + headerHeight + 10 };

    // function that draws header image on current page
    const paintHeaderOnPage = (pageNum) => {
        if (!headerImg) return;
        doc.setPage(pageNum);
        const imgW = pageWidth - 2*margin;
        const imgH = headerHeight; // use measured height
        const imgY = margin + 10; // a little below the stripe/text area
        doc.addImage(headerImg, 'JPEG', margin, imgY, imgW, imgH);
    };

    // after header text we leave a little space and print the equipment ID/name
    doc.setFontSize(14).setTextColor('#1f3a93');
    doc.text(equipmentName, margin, y);    y += 18;
    doc.setFontSize(10).setTextColor('#333');
    doc.text(`Inventario: ${inventoryNumber}`, margin, y);
    y += 20;

    // helper to paint a bold section header
    function sectionHeader(text, color = '#374151') {
        doc.setFillColor(color);
        doc.rect(margin, y, pageWidth - 2*margin, 18, 'F');
        doc.setTextColor('#fff').setFontSize(12).setFont(undefined,'bold');
        doc.text(text, margin+6, y+13);
        y += 24;
    }

    // we'll compute summary again later after assembling full history rows

    // Fields to exclude from equipment info (they belong to maintenance/levantamiento sections)
    const excludePatterns = [
        /^MP\s/i,                    // MP fields (maintenance)
        /^MP\b/i,                    // MP prefix
        /OBSERVACIONES_/i,           // Monthly observations
        /^ESTATUS_/i,                // Monthly status
        /LEVANTAMIENTO/i,             // Levantamiento fields
        /ETIQUETA/i                  // Label fields
    ];

    // categories grouping function (same as buildEquipmentInfo)
    const getCategory = key => {
        const f = key.toUpperCase();
        if (/INVENTARIO|SERIE|MODELO|EQUIPO/.test(f)) return 'Identificación';
        if (/MARCA|FABRICANTE|TECNOLOGIA|VOLTAJE|POTENCIA/.test(f)) return 'Especificaciones';
        if (/UBICACION|SERVICIO|AREA|DEPARTAMENTO/.test(f)) return 'Ubicación';
        if (/COSTO|PRECIO|VALOR|PROVEEDOR/.test(f)) return 'Financiera';
        if (/FECHA|GARANTIA|ADQUISICION/.test(f)) return 'Fechas';
        if (/ESTADO|STATUS|CONDICION/.test(f)) return 'Estado';
        return 'Otros';
    };

    const groups = {};
    if (props.item) {
        Object.entries(props.item).forEach(([k, v]) => {
            // Skip fields that belong to maintenance or levantamento sections
            const shouldExclude = excludePatterns.some(pattern => pattern.test(k));
            if (shouldExclude) return;
            
            const cat = getCategory(k);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ label: k, value: v || 'N/A' });
        });
    }

    const headerColors = {
        'Identificación': '#1f3a93',
        'Especificaciones': '#0d47a1',
        'Ubicación': '#00695c',
        'Financiera': '#bf360c',
        'Fechas': '#ff6f00',
        'Estado': '#374151',
        'Otros': '#455a64'
    };

    // separator before equipment info
    doc.setDrawColor('#ccc');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    sectionHeader('Información del Equipo', '#00695c');

    // establish top margin so tables never flow above header (already computed above)
    for (const [cat, items] of Object.entries(groups)) {
        // category title banner
        doc.setFillColor(headerColors[cat] || '#374151');
        doc.rect(margin, y, pageWidth - 2*margin, 18, 'F');
        doc.setTextColor('#fff').setFontSize(10).setFont(undefined, 'bold');
        doc.text(cat, margin+6, y+13);
        y += 24;

        // build rows
        const rows = items.map(it => [it.label, it.value]);
        autoTable(doc, {
            startY: y,
            head: [['Campo','Valor']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: 220, textColor: 50, fontSize:8 },
            styles: { fontSize:7, cellPadding:4, halign: 'left' },
            columnStyles: { 0: {cellWidth: (pageWidth - margin*2)*0.3, fontStyle:'bold'}, 1: {cellWidth: (pageWidth - margin*2)*0.6} },
            margin: tableMargin,
            didDrawPage: (data) => {
                // paint header on each page and adjust y for new pages
                const curr = doc.getCurrentPageInfo().pageNumber;
                paintHeaderOnPage(curr);
            }
        });
        y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 12;
    }

    // Maintenance history section - starts on new page
    doc.addPage();
    paintHeaderOnPage(doc.getNumberOfPages());
    y = margin + headerHeight + 20;
    sectionHeader('Historial de Mantenimientos', '#8b5cf6');

    const headers = historyMeta.value && historyMeta.value.length
        ? historyMeta.value.map(f => f.label)
        : ['Fecha','Tipo','Estado','Ubicación Final','Observaciones'];
    const cols = historyMeta.value && historyMeta.value.length
        ? historyMeta.value.map(f => f.column)
        : ['ULTIMO MP DD MM AAAA','TIPO DE MANTENIMIENTO','ESTATUS','UBICACION ESPECIFICA','OBSERVACIONES'];

    // synthesize MP/OBS fields from item if they contain data
    // Only from August onwards (MP AGOSTO, MP SEPTIEMBRE, MP OCTUBRE, MP NOVIEMBRE)
    // Filters out rows where ALL fields are N/A
    const monthFields = {
        'MP AGOSTO': { short: 'AGOS', obsKey: 'OBSERVACIONES_AGOS', statusKey: 'ESTATUS_AGOS' },
        'MP SEPTIEMBRE': { short: 'SEPT', obsKey: 'OBSERVACIONES_SEPT', statusKey: 'ESTATUS_SEP' },
        'MP OCTUBRE': { short: 'OCT', obsKey: 'OBSERVACIONES_OCT', statusKey: 'ESTATUS_OCT' },
        'MP NOVIEMBRE': { short: 'NOV', obsKey: 'OBSERVACIONES_NOV', statusKey: 'ESTATUS_NOV' }
    };
    
    const addedTypes = new Set();
    const allRows = [];
    
    // First, add synthetic rows from monthly MP fields (only from August onwards)
    if (props.item) {
        Object.entries(props.item).forEach(([k, v]) => {
            const upperKey = k.toUpperCase().trim();
            const monthInfo = monthFields[upperKey];
            
            if (monthInfo) {
                const obs = props.item[monthInfo.obsKey] || '';
                const status = props.item[monthInfo.statusKey] || '';
                
                // Only add if at least one field has real data (not N/A or empty)
                const hasDate = v && v.toString().toUpperCase() !== 'N/A' && v.toString().trim() !== '';
                const hasObs = obs && obs.toString().toUpperCase() !== 'N/A' && obs.toString().trim() !== '';
                const hasStatus = status && status.toString().toUpperCase() !== 'N/A' && status.toString().trim() !== '';
                
                if (hasDate || hasObs || hasStatus) {
                    const tipoMantenimiento = 'MP ' + upperKey.replace('MP ', '').toUpperCase();
                    const row = cols.map(c => {
                        if (c === 'ULTIMO MP DD MM AAAA') return hasDate ? v : '';
                        if (c === 'TIPO DE MANTENIMIENTO') return tipoMantenimiento;
                        if (c === 'ESTATUS') return hasStatus ? status : '';
                        if (c === 'UBICACION ESPECIFICA') return props.item['UBICACION ESPECIFICA'] || '';
                        if (c === 'OBSERVACIONES') return hasObs ? obs : '';
                        return '';
                    });
                    allRows.push(row);
                    addedTypes.add(tipoMantenimiento);
                }
            }
        });
    }
    
    // Then, add history entries ONLY if their type wasn't already added as synthetic
    // Skip ENTRADA/SALIDA/RESGUARDO/SERVICIO — they go in the movimientos section below
    const SKIP_MOV_TYPES = new Set(['ENTRADA', 'SALIDA', 'RESGUARDO', 'SERVICIO']);
    if (history.value && history.value.length) {
        history.value.forEach(entry => {
            if (SKIP_MOV_TYPES.has(entry.tipoMantenimiento)) return;
            const tipo = entry['TIPO DE MANTENIMIENTO'];
            const tipoUpper = tipo ? tipo.toString().toUpperCase() : '';
            
            // Only add if this type wasn't already added from synthetic
            if (!addedTypes.has(tipoUpper)) {
                const row = cols.map(c => {
                    let val = entry[c] || 'N/A';
                    if (/\d{2}\/\d{2}\/\d{4}/.test(val) || /\d{4}-\d{2}-\d{2}/.test(val)) {
                        val = formatDate(val);
                    }
                    return val;
                });
                allRows.push(row);
                if (tipoUpper) addedTypes.add(tipoUpper);
            }
        });
    }
    
    // Renderizar TODOS como tarjetas (datos históricos + mantenimientos)
    if (maintenanceFlow.value && maintenanceFlow.value.history && maintenanceFlow.value.history.length) {
        const completedMaintenances = maintenanceFlow.value.history.filter(m => m.finished_at);
        const historyRows = allRows;
        
        // Renderizar datos históricos como tarjetas si existen
        if (historyRows.length > 0) {
            y += 12;
            
            historyRows.forEach((row, rowIdx) => {
                const boxWidth = pageWidth - 2 * margin;
                const cardPadding = 5;
                
                // Verificar espacio
                if (y + 95 > pageHeight - margin) {
                    doc.addPage();
                    paintHeaderOnPage(doc.getNumberOfPages());
                    y = margin + headerHeight + 20;
                }
                
                // Tarjeta con color neutro
                const cardBgColor = [245, 245, 248];
                const cardBorderColor = [150, 150, 180];
                
                doc.setFillColor(...cardBgColor);
                doc.setDrawColor(...cardBorderColor);
                doc.setLineWidth(0.6);
                
                let cardHeightEstimate = 70;
                const obsVal = row[4] || '';
                const obsLines = doc.splitTextToSize(obsVal, boxWidth - 2 * cardPadding - 8);
                const obsHeight = Math.max(16, obsLines.length * 3.3 + 8);
                cardHeightEstimate += obsHeight + 6;
                
                doc.rect(margin, y, boxWidth, cardHeightEstimate, 'FD');
                
                let cardY = y;
                
                // Encabezado
                doc.setFontSize(8).setTextColor(...cardBorderColor).setFont(undefined, 'bold');
                doc.text(`Registro #${rowIdx + 1}`, margin + cardPadding, cardY + 7);
                
                doc.setFontSize(7).setTextColor(100, 100, 100).setFont(undefined, 'normal');
                const histDate = row[0] || 'N/A';
                doc.text(histDate, pageWidth - margin - cardPadding - 30, cardY + 7, { align: 'right' });
                
                cardY += 14;
                
                // Información en 4 campos con más espacio
                const fieldWidth = (boxWidth - 2 * cardPadding) / 4;
                const histFields = [
                    { label: 'TIPO', value: row[1] || 'N/A' },
                    { label: 'ESTADO', value: row[2] || 'N/A' },
                    { label: 'UBICACIÓN', value: (row[3] || 'N/A').substring(0, 18) },
                    { label: 'RESPONSABLE', value: (row[5] || 'N/A').substring(0, 15) }
                ];
                
                histFields.forEach((field, fIdx) => {
                    const fX = margin + cardPadding + fIdx * fieldWidth;
                    
                    if (fIdx > 0) {
                        doc.setDrawColor(180, 170, 200);
                        doc.setLineWidth(0.2);
                        doc.line(fX, cardY, fX, cardY + 18);
                    }
                    
                    doc.setFontSize(5.5).setTextColor(120, 100, 150).setFont(undefined, 'bold');
                    doc.text(field.label, fX + 3, cardY + 3);
                    
                    doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                    const valLines = doc.splitTextToSize(field.value, fieldWidth - 6);
                    doc.text(valLines, fX + 3, cardY + 10);
                });
                
                cardY += 20;
                
                // Observaciones con más espacio
                doc.setFontSize(6).setTextColor(80, 80, 120).setFont(undefined, 'bold');
                doc.text('OBSERVACIONES:', margin + cardPadding, cardY + 4);
                
                doc.setFontSize(6.5).setTextColor(60, 60, 90).setFont(undefined, 'normal');
                doc.text(obsLines, margin + cardPadding, cardY + 10);
                
                cardY += obsHeight + 6;
                
                // Área de fotos
                const imgBoxHeight = 28;
                const imgXStart = margin + cardPadding;
                const imgBoxWidth = boxWidth - 2 * cardPadding;
                
                doc.setFillColor(242, 242, 250);
                doc.setDrawColor(190, 180, 215);
                doc.setLineWidth(0.4);
                doc.rect(imgXStart, cardY, imgBoxWidth, imgBoxHeight, 'FD');
                
                doc.setFontSize(6).setTextColor(110, 100, 150).setFont(undefined, 'bold');
                doc.text('FOTOS:', imgXStart + 3, cardY + 5);
                
                doc.setFontSize(6).setTextColor(160, 150, 185).setFont(undefined, 'italic');
                doc.text('—', imgXStart + 27, cardY + 12);
                
                y += cardHeightEstimate + 12;
            });
        }
        
        y += 4;
        
        // Renderizar cada mantenimiento como una tarjeta ordenada
        completedMaintenances.forEach((maint, idx) => {
            const boxWidth = pageWidth - 2 * margin;
            const cardPadding = 5;
            
            // Verificar espacio disponible
            if (y + 110 > pageHeight - margin) {
                doc.addPage();
                paintHeaderOnPage(doc.getNumberOfPages());
                y = margin + headerHeight + 20;
            }
            
            // ========== TARJETA CONTENEDOR ==========
            const cardBgColor = maint.maintenance_type === 'MP' ? [230, 245, 230] : [255, 235, 238];
            const cardBorderColor = maint.maintenance_type === 'MP' ? [76, 175, 80] : [244, 67, 54];
            
            // Fondo de la tarjeta
            doc.setFillColor(...cardBgColor);
            doc.setDrawColor(...cardBorderColor);
            doc.setLineWidth(0.6);
            
            // Altura estimada de la tarjeta (DINÁMICA)
            const obsText = maint.observaciones || 'Sin observaciones';
            const obsLines = doc.splitTextToSize(obsText, boxWidth - 2 * cardPadding - 8);
            const obsHeight = Math.max(16, obsLines.length * 3.3 + 8);
            
            // Calcular altura de campos dinámicamente
            const fieldsHeight = 4 * 11;  // 4 filas de 11px cada una
            
            let cardHeightEstimate = 20 + fieldsHeight + 4 + obsHeight + 6; // header + campos + obs
            if (Array.isArray(maint.images) && maint.images.length) {
                cardHeightEstimate += 28;
            } else {
                cardHeightEstimate += 28;
            }
            
            doc.rect(margin, y, boxWidth, cardHeightEstimate, 'FD');
            
            let cardY = y;
            
            // ========== ENCABEZADO CON NÚMERO ==========
            doc.setFontSize(8).setTextColor(...cardBorderColor).setFont(undefined, 'bold');
            doc.text(`Mantenimiento #${idx + 1}`, margin + cardPadding, cardY + 7);
            
            doc.setFontSize(7).setTextColor(100, 100, 100).setFont(undefined, 'normal');
            doc.text(formatDate(maint.finished_at), pageWidth - margin - cardPadding - 30, cardY + 7, { align: 'right' });
            
            cardY += 13;
            
            // ========== INFORMACIÓN EN 2 COLUMNAS ==========
            const colWidth = (boxWidth - 2 * cardPadding) / 2;
            const infoFields = [
                { label: 'TIPO:', value: maint.maintenance_type === 'MP' ? 'Preventivo' : 'Correctivo' },
                { label: 'ESTADO:', value: maint.result_status === 'functional' ? 'Funcional' : 'No Funcional' },
                { label: 'RESPONSABLE:', value: maint.finished_by || 'N/A' },
                { label: 'UBICACIÓN:', value: maint.return_location || 'N/A' }
            ];
            
            for (let i = 0; i < infoFields.length; i += 2) {
                // Columna izquierda
                const leftX = margin + cardPadding;
                doc.setFontSize(5.5).setTextColor(100, 80, 130).setFont(undefined, 'bold');
                doc.text(infoFields[i].label, leftX, cardY + 3);
                
                doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                const leftVal = doc.splitTextToSize(infoFields[i].value, colWidth - 8);
                doc.text(leftVal, leftX, cardY + 8);
                
                // Columna derecha (si existe)
                if (i + 1 < infoFields.length) {
                    const rightX = margin + cardPadding + colWidth;
                    doc.setFontSize(5.5).setTextColor(100, 80, 130).setFont(undefined, 'bold');
                    doc.text(infoFields[i + 1].label, rightX, cardY + 3);
                    
                    doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                    const rightVal = doc.splitTextToSize(infoFields[i + 1].value, colWidth - 8);
                    doc.text(rightVal, rightX, cardY + 8);
                }
                
                cardY += 11;
            }
            
            cardY += 2;
            
            // ========== OBSERVACIONES ==========
            doc.setFontSize(6).setTextColor(80, 80, 120).setFont(undefined, 'bold');
            doc.text('OBSERVACIONES:', margin + cardPadding, cardY + 4);
            
            doc.setFontSize(6.5).setTextColor(60, 60, 90).setFont(undefined, 'normal');
            doc.text(obsLines, margin + cardPadding, cardY + 10);
            
            cardY += obsHeight + 6;
            
            // ========== IMÁGENES SIEMPRE PRESENTES (ALTURA CONSISTENTE) ==========
            const imgBoxHeight = 28;
            const imgXStart = margin + cardPadding;
            const imgBoxWidth = boxWidth - 2 * cardPadding;
            
            // Fondo del área de imágenes (SIEMPRE IGUAL)
            doc.setFillColor(242, 242, 250);
            doc.setDrawColor(190, 180, 215);
            doc.setLineWidth(0.4);
            doc.rect(imgXStart, cardY, imgBoxWidth, imgBoxHeight, 'FD');
            
            // Label FOTOS (SIEMPRE VISIBLE)
            doc.setFontSize(6).setTextColor(110, 100, 150).setFont(undefined, 'bold');
            doc.text('FOTOS:', imgXStart + 3, cardY + 5);
            
            if (Array.isArray(maint.images) && maint.images.length) {
                // RENDERIZAR IMÁGENES
                const images = maint.images.slice(0, 5);
                const imgW = 18;
                const imgH = 18;
                const imgGap = 3;
                let imgX = imgXStart + 27;
                const imgY = cardY + 3;
                
                images.forEach((img, imgIdx) => {
                    try {
                        const fmt = img.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                        doc.addImage(img, fmt, imgX, imgY, imgW, imgH);
                        imgX += imgW + imgGap;
                    } catch (e) {
                        console.warn('Error imagen:', e);
                    }
                });
                
                // Contador
                doc.setFontSize(5).setTextColor(130, 120, 160).setFont(undefined, 'normal');
                doc.text(`(${images.length})`, imgXStart + 27, cardY + 23);
            } else {
                // SIN IMÁGENES - Mismo estilo, texto en lugar de fotos
                doc.setFontSize(6).setTextColor(160, 150, 185).setFont(undefined, 'italic');
                doc.text('—', imgXStart + 27, cardY + 12);
            }
            
            y += cardHeightEstimate + 12;
            });
            } else {
            // Si no hay mantenimientos completados, mostrar como tarjetas
            const histRows = allRows;
            if (histRows.length > 0) {
            y += 12;
            
            histRows.forEach((row, rowIdx) => {
                const boxWidth = pageWidth - 2 * margin;
                const cardPadding = 5;
                
                // Verificar espacio
                if (y + 95 > pageHeight - margin) {
                    doc.addPage();
                    paintHeaderOnPage(doc.getNumberOfPages());
                    y = margin + headerHeight + 20;
                }
                
                // Tarjeta con color neutro
                const cardBgColor = [245, 245, 248];
                const cardBorderColor = [150, 150, 180];
                
                doc.setFillColor(...cardBgColor);
                doc.setDrawColor(...cardBorderColor);
                doc.setLineWidth(0.6);
                
                const obsVal = row[4] || '';
                const obsLines = doc.splitTextToSize(obsVal, boxWidth - 2 * cardPadding - 8);
                const obsHeight = Math.max(16, obsLines.length * 3.3 + 8);
                
                const fieldsHeight = 4 * 11;
                let cardHeightEstimate = 20 + fieldsHeight + 4 + obsHeight + 6;
                
                doc.rect(margin, y, boxWidth, cardHeightEstimate, 'FD');
                
                let cardY = y;
                
                // Encabezado
                doc.setFontSize(8).setTextColor(...cardBorderColor).setFont(undefined, 'bold');
                doc.text(`Registro #${rowIdx + 1}`, margin + cardPadding, cardY + 7);
                
                doc.setFontSize(7).setTextColor(100, 100, 100).setFont(undefined, 'normal');
                const histDate = row[0] || 'N/A';
                doc.text(histDate, pageWidth - margin - cardPadding - 30, cardY + 7, { align: 'right' });
                
                cardY += 13;
                
                // Información en 2 columnas
                const fieldWidth = (boxWidth - 2 * cardPadding) / 2;
                const histFields = [
                    { label: 'TIPO:', value: row[1] || 'N/A' },
                    { label: 'ESTADO:', value: row[2] || 'N/A' },
                    { label: 'UBICACIÓN:', value: row[3] || 'N/A' },
                    { label: 'RESPONSABLE:', value: row[5] || 'N/A' }
                ];
                
                for (let h = 0; h < histFields.length; h += 2) {
                    // Columna izquierda
                    const leftX = margin + cardPadding;
                    doc.setFontSize(5.5).setTextColor(100, 80, 130).setFont(undefined, 'bold');
                    doc.text(histFields[h].label, leftX, cardY + 3);
                    
                    doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                    const leftVal = doc.splitTextToSize(histFields[h].value, fieldWidth - 8);
                    doc.text(leftVal, leftX, cardY + 8);
                    
                    // Columna derecha (si existe)
                    if (h + 1 < histFields.length) {
                        const rightX = margin + cardPadding + fieldWidth;
                        doc.setFontSize(5.5).setTextColor(100, 80, 130).setFont(undefined, 'bold');
                        doc.text(histFields[h + 1].label, rightX, cardY + 3);
                        
                        doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                        const rightVal = doc.splitTextToSize(histFields[h + 1].value, fieldWidth - 8);
                        doc.text(rightVal, rightX, cardY + 8);
                    }
                    
                    cardY += 11;
                }
                
                cardY += 2;
                
                // Observaciones
                doc.setFontSize(6).setTextColor(80, 80, 120).setFont(undefined, 'bold');
                doc.text('OBSERVACIONES:', margin + cardPadding, cardY + 4);
                
                doc.setFontSize(6.5).setTextColor(60, 60, 90).setFont(undefined, 'normal');
                doc.text(obsLines, margin + cardPadding, cardY + 10);
                
                cardY += obsHeight + 6;
                
                // Área de fotos
                const imgBoxHeight = 28;
                const imgXStart = margin + cardPadding;
                const imgBoxWidth = boxWidth - 2 * cardPadding;
                
                doc.setFillColor(242, 242, 250);
                doc.setDrawColor(190, 180, 215);
                doc.setLineWidth(0.4);
                doc.rect(imgXStart, cardY, imgBoxWidth, imgBoxHeight, 'FD');
                
                doc.setFontSize(6).setTextColor(110, 100, 150).setFont(undefined, 'bold');
                doc.text('FOTOS:', imgXStart + 3, cardY + 5);
                
                doc.setFontSize(6).setTextColor(160, 150, 185).setFont(undefined, 'italic');
                doc.text('—', imgXStart + 27, cardY + 12);
                
                y += cardHeightEstimate + 12;
            });
            }
            }
    

    // ============================================================
    // SECCIÓN: MOVIMIENTOS DE ÓRDENES (ENTRADA/SALIDA/RESGUARDO/SERVICIO)
    // ============================================================
    const movsList = historyMovimientos.value;
    if (movsList && movsList.length > 0) {
        doc.addPage();
        paintHeaderOnPage(doc.getNumberOfPages());
        y = margin + headerHeight + 20;
        sectionHeader('Movimientos de Órdenes', '#1565c0');

        const movColors = {
            'ENTRADA':   { bg: [232, 245, 233], border: [56, 142, 60]  },  // verde
            'SALIDA':    { bg: [255, 235, 238], border: [211, 47, 47]  },  // rojo
            'RESGUARDO': { bg: [255, 243, 224], border: [230, 119, 0]  },  // naranja
            'SERVICIO':  { bg: [227, 242, 253], border: [21, 101, 192] }   // azul
        };

        movsList.forEach((mov, idx) => {
            const tipo = (mov.tipoMantenimiento || 'ENTRADA').toUpperCase();
            const colors = movColors[tipo] || movColors['ENTRADA'];
            const boxWidth = pageWidth - 2 * margin;
            const cardPadding = 6;

            // texto largo → calcular alturas
            const descText = String(mov.descripcion || '—');
            const descLines = doc.splitTextToSize(descText, boxWidth - 2 * cardPadding - 8);
            const descHeight = Math.max(10, descLines.length * 3.3 + 6);

            const obsText = String(mov.observaciones || '—');
            const obsLines = doc.splitTextToSize(obsText, boxWidth - 2 * cardPadding - 8);
            const obsHeight = Math.max(10, obsLines.length * 3.3 + 6);

            // header (13) + row1..4 (4×11=44) + label DESCRIPCIÓN (8) + descHeight + label OBS (8) + obsHeight + padding (6)
            const cardH = 13 + 44 + 8 + descHeight + 8 + obsHeight + 6;

            if (y + cardH > pageHeight - margin) {
                doc.addPage();
                paintHeaderOnPage(doc.getNumberOfPages());
                y = margin + headerHeight + 20;
            }

            // Fondo y borde
            doc.setFillColor(...colors.bg);
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(0.7);
            doc.rect(margin, y, boxWidth, cardH, 'FD');

            // Barra lateral de color (tipo)
            doc.setFillColor(...colors.border);
            doc.rect(margin, y, 5, cardH, 'F');

            let cy = y;

            // Encabezado: tipo + número
            doc.setFontSize(8).setTextColor(...colors.border).setFont(undefined, 'bold');
            doc.text(`${tipo}  #${idx + 1}`, margin + cardPadding + 4, cy + 9);

            // Fecha al lado derecho
            const fechaStr = mov.ultimoMP ? formatDate(mov.ultimoMP) : 'N/A';
            doc.setFontSize(7).setTextColor(90, 90, 90).setFont(undefined, 'normal');
            doc.text(fechaStr, pageWidth - margin - cardPadding, cy + 9, { align: 'right' });

            cy += 14;

            // 4 campos en 2 columnas: FOLIO / MOTIVO  |  RESPONSABLE / SOLICITANTE
            const halfW = (boxWidth - 2 * cardPadding - 4) / 2;
            const col1X = margin + cardPadding + 6;
            const col2X = col1X + halfW + 4;

            const field2col = [
                [{ label: 'FOLIO:',       value: mov.folio       || 'N/A' },
                 { label: 'RESPONSABLE:', value: mov.responsable || 'N/A' }],
                [{ label: 'MOTIVO:',      value: mov.motivo      || 'N/A' },
                 { label: 'SOLICITANTE:', value: mov.solicitante || 'N/A' }]
            ];

            field2col.forEach(pair => {
                // Columna izquierda
                doc.setFontSize(5.5).setTextColor(...colors.border).setFont(undefined, 'bold');
                doc.text(pair[0].label, col1X, cy + 3);
                doc.setFontSize(6.5).setTextColor(40, 40, 70).setFont(undefined, 'normal');
                const v1 = doc.splitTextToSize(String(pair[0].value), halfW - 4);
                doc.text(v1, col1X, cy + 9);

                // Columna derecha
                doc.setFontSize(5.5).setTextColor(...colors.border).setFont(undefined, 'bold');
                doc.text(pair[1].label, col2X, cy + 3);
                doc.setFontSize(6.5).setTextColor(40, 40, 70).setFont(undefined, 'normal');
                const v2 = doc.splitTextToSize(String(pair[1].value), halfW - 4);
                doc.text(v2, col2X, cy + 9);

                cy += 11;
            });

            // DESCRIPCIÓN
            doc.setFontSize(6).setTextColor(...colors.border).setFont(undefined, 'bold');
            doc.text('DESCRIPCIÓN:', col1X, cy + 4);
            cy += 8;
            doc.setFontSize(6.5).setTextColor(40, 40, 70).setFont(undefined, 'normal');
            doc.text(descLines, col1X, cy);
            cy += descHeight;

            // OBSERVACIONES
            doc.setFontSize(6).setTextColor(...colors.border).setFont(undefined, 'bold');
            doc.text('OBSERVACIONES:', col1X, cy + 4);
            cy += 8;
            doc.setFontSize(6.5).setTextColor(40, 40, 70).setFont(undefined, 'normal');
            doc.text(obsLines, col1X, cy);

            y += cardH + 10;
        });
    }

    // ADD BARCODE AS LAST PAGE (RECORTABLE)
    doc.addPage();
    paintHeaderOnPage(doc.getNumberOfPages());
    y = margin + headerHeight + 30;
    
    // Recortable barcode section - only element on this page
    const barcodeUrl = await generateBarcodeDataUrl(inventoryNumber);
    if (barcodeUrl) {
        // Draw cut lines (dashed border for cutting)
        doc.setLineWidth(0.5);
        doc.setDrawColor(100);
        doc.setLineDash([5, 3], 0);
        const cutBoxW = 350;
        const cutBoxH = 140;
        const cutBoxX = (pageWidth - cutBoxW) / 2;
        doc.rect(cutBoxX, y, cutBoxW, cutBoxH);
        doc.setLineDash();
        
        // "Cut here" indicator
        doc.setFontSize(8).setTextColor(150);
        doc.text('⟵ RECORTAR ⟶', pageWidth/2, y - 5, { align: 'center' });
        
        // Place barcode centered in cut area
        const barcodeW = 280;
        const barcodeH = 70;
        const barcodeX = (pageWidth - barcodeW) / 2;
        doc.addImage(barcodeUrl, 'PNG', barcodeX, y + 15, barcodeW, barcodeH);
        
        // Inventory number below barcode
        y += cutBoxH - 20;
        doc.setFontSize(14).setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text(inventoryNumber, pageWidth/2, y, { align: 'center' });
        
        // Small label
        doc.setFontSize(8).setTextColor(100);
        doc.setFont(undefined, 'normal');
        doc.text('Código de Inventario', pageWidth/2, y + 10, { align: 'center' });
    }

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        paintHeaderOnPage(i);
        doc.setPage(i);
        // Footer separator line
        const footerY = pageHeight - 24;
        doc.setDrawColor('#ccc');
        doc.setLineWidth(0.5);
        doc.line(margin, footerY, pageWidth - margin, footerY);
        // Timestamp left and page number right
        doc.setFontSize(8).setTextColor(100);
        doc.text(`Generado: ${timestamp}`, margin, footerY + 12);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerY + 12, { align: 'right' });
    }

    return doc;
}

function closePdfPreview() {
    pdfPreviewVisible.value = false;
    pdfDataUrl.value = null;
}

async function previewPdf() {
    pdfPreviewVisible.value = true;
    pdfDataUrl.value = null;
    try {
        // Usar el endpoint del backend para generar el PDF
        const inventoryNo = props.item?.['No DE INVENTARIO'];
        if (!inventoryNo) {
            throw new Error('No hay número de inventario');
        }
        const result = await generateEquipmentPDF(inventoryNo);
        if (result && result.pdfUrl) {
            pdfDataUrl.value = result.pdfUrl;
        } else {
            throw new Error('No se recibió URL del PDF');
        }
    } catch (e) {
        console.error('[EquipmentHistoryPanel] error generating PDF preview', e);
        pdfPreviewVisible.value = false;
        alert('No se pudo generar la vista previa del PDF. Error: ' + e.message);
    }
}

async function downloadPdf() {
    try {
        // Usar el endpoint del backend para generar y descargar el PDF
        const inventoryNo = props.item?.['No DE INVENTARIO'];
        if (!inventoryNo) {
            throw new Error('No hay número de inventario');
        }
        const result = await generateEquipmentPDF(inventoryNo);
        if (result && result.pdfUrl) {
            // Descargar el PDF desde la URL
            const link = document.createElement('a');
            link.href = result.pdfUrl;
            link.download = `expediente-${inventoryNo}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            throw new Error('No se recibió URL del PDF');
        }
    } catch (e) {
        console.error('[EquipmentHistoryPanel] error downloading PDF', e);
        alert('No se pudo descargar el PDF. Error: ' + e.message);
    }
}

function onMaintenanceSaved() {
    wizardVisible.value = false;
    fetchHistory();
    loadMaintenanceFlow();
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { year:'numeric', month:'2-digit', day:'2-digit' });
    } catch {
        return dateStr;
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('es-ES', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    } catch {
        return dateStr;
    }
}

function calculateDuration(maintenance) {
    if (!maintenance || !maintenance.started_at || !maintenance.finished_at) return '';
    try {
        const start = new Date(maintenance.started_at);
        const finish = new Date(maintenance.finished_at);
        const ms = finish - start;
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes} minutos`;
        } else {
            return `${totalSeconds} segundos`;
        }
    } catch {
        return '';
    }
}

function calculateElapsedTime(maintenance) {
    if (!maintenance || !maintenance.started_at) return '';
    try {
        const start = new Date(maintenance.started_at);
        const now = new Date();
        const ms = now - start;
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes} minutos`;
        } else {
            return `${totalSeconds} segundos`;
        }
    } catch {
        return '';
    }
}

function getEntryFields(entry) {
    const core = ['ULTIMO MP DD MM AAAA', 'TIPO DE MANTENIMIENTO', 'OBSERVACIONES'];
    if (historyMeta.value && historyMeta.value.length) {
        return historyMeta.value
            .filter(f => !core.includes(f.column))
            .map(f => ({ column: f.column, label: f.label, value: entry[f.column] || '—', category: f.category || 'Otros' }));
    }
    // fallback: use all keys except core fields and helper columns
    return Object.keys(entry)
        .filter(k => !core.includes(k) && k !== 'source_table' && k !== 'id')
        .map(k => ({ column: k, label: k, value: entry[k], category: 'Otros' }));
}

function getGroupedFields(entry) {
    const fields = getEntryFields(entry);
    const groups = {};
    fields.forEach(f => {
        const cat = f.category || 'Otros';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(f);
    });
    return groups; // object with category arrays
}

async function fetchHistory() {
    if (!props.item || !props.item['No DE INVENTARIO']) return;
    loading.value = true;
    try {
        const response = await getEquipmentHistory(props.item['No DE INVENTARIO']);
        if (response && typeof response === 'object') {
            // the backend may return an object with a nested `history` array
            // or it may already be an array depending on version; handle both.
            let arr = [];
            if (Array.isArray(response.history)) {
                arr = response.history;
            } else if (response.history && Array.isArray(response.history.history)) {
                // nested one more level
                arr = response.history.history;
            } else if (Array.isArray(response)) {
                arr = response;
            }

            history.value = arr;
            // movimientos separados (ENTRADA/SALIDA/RESGUARDO/SERVICIO)
            historyMovimientos.value = Array.isArray(response.movimientos) ? response.movimientos : [];
            // capture metadata if provided
            historyMeta.value = response.meta && Array.isArray(response.meta.fields)
                ? response.meta.fields
                : [];

            // debug dump so developer can see the complete payload
            console.debug('[EquipmentHistoryPanel] raw history response', response);
            console.debug('[EquipmentHistoryPanel] got history', arr.length,
                         response.futureCount, response.historicalCount,
                         'meta fields', historyMeta.value.length);
        } else {
            history.value = [];
            historyMeta.value = [];
        }
    } catch (err) {
        console.error('Error fetching history:', err);
        history.value = [];
        historyMeta.value = [];
    } finally {
        loading.value = false;
    }
}

async function loadMaintenanceFlow() {
    if (!props.item) {
        console.log('[EquipmentHistoryPanel] loadMaintenanceFlow: no item');
        return;
    }
    try {
        console.log('[EquipmentHistoryPanel] loadMaintenanceFlow: fetching for', props.item['No DE INVENTARIO']);
        const result = await getMaintenanceFlowStatus(props.item['No DE INVENTARIO']);
        console.log('[EquipmentHistoryPanel] loadMaintenanceFlow result:', result);
        maintenanceFlow.value = result || { in_progress: null, last_completed: null, history: [] };
    } catch (error) {
        console.error('Error loading maintenance flow:', error);
    }
}

async function fetchStatuses() {
    if (!props.item) return;
    try {
        statusesLoading.value = true;
        const result = await fetchStatusHistory(props.item['No DE INVENTARIO']);
        statuses.value = result || [];
    } catch (error) {
        console.error('Error fetching statuses:', error);
        statuses.value = [];
    } finally {
        statusesLoading.value = false;
    }
}

// Watchers
watch(() => props.visible, async (newVal) => {
    if (newVal && props.item) {
        document.body.style.overflow = 'hidden';
        activeTab.value = 'info';
        await fetchHistory();
        await loadMaintenanceFlow();
        await fetchStatuses();
    } else {
        document.body.style.overflow = 'auto';
        // make sure PDF modal is closed when panel hides
        pdfPreviewVisible.value = false;
        pdfDataUrl.value = null;
    }
});
</script>

<style scoped>
.equipment-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.equipment-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    height: 85vh;
    background: #0f1419;
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.panel-header-simple {
    padding: 16px 24px;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.02));
}

.header-info h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
}

.header-info p {
    margin: 2px 0 0 0;
    font-size: 12px;
    color: #a0aec0;
}

.btn-close-simple {
    background: none;
    border: none;
    font-size: 28px;
    color: #cbd5e1;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close-simple:hover {
    color: #fff;
}

.tabs-bar {
    display: flex;
    gap: 0;
    padding: 0;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
}

.tabs-bar button {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    color: #cbd5e1;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    font-size: 12px;
}

.tabs-bar button:hover {
    background: rgba(139, 92, 246, 0.05);
    color: #e2e8f0;
}
.tab-icon {
    vertical-align: middle;
    margin-right: 6px;
    width: 20px;
    height: 20px;
}
.footer-icon {
    vertical-align: middle;
    margin-right: 4px;
    width: 16px;
    height: 16px;
}

.tabs-bar button.active {
    color: #8b5cf6;
    border-bottom-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
}

.panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
}

.tab-content {
    animation: fadeIn 0.3s ease-out;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 6px;
}

.info-item label {
    font-size: 10px;
    font-weight: 700;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item span {
    font-size: 12px;
    color: #e2e8f0;
    font-weight: 500;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    padding: 16px;
    background: rgba(139, 92, 246, 0.08);
    border-left: 3px solid #8b5cf6;
    border-radius: 4px;
}

.history-date {
    font-size: 12px;
    color: #a0aec0;
    font-weight: 600;
}

.history-type {
    font-size: 14px;
    color: #e2e8f0;
    font-weight: 600;
    margin-top: 4px;
}
.history-icon {
    vertical-align: middle;
    margin-right: 4px;
    width: 16px;
    height: 16px;
}
.banner-icon {
    vertical-align: middle;
    margin-right: 6px;
    width: 20px;
    height: 20px;
}

.history-note {
    font-size: 13px;
    color: #cbd5e1;
    margin-top: 8px;
    line-height: 1.5;
}

.history-images {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.history-image {
    max-width: 100px;
    max-height: 80px;
    border: 1px solid #444;
    border-radius: 4px;
}


/* field rows container */
.history-fields {
    margin-top: 8px;
}
.field-category {
    margin-bottom: 12px;
    border-left: 4px solid #8b5cf6;
    padding-left: 8px;
}
.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 4px 0;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
}
.category-toggle svg {
    vertical-align: middle;
}
.category-rows {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 6px 12px;
    margin-top: 4px;
}
.field-row {
    display: flex;
    flex-direction: column;
    background: rgba(59, 130, 246, 0.1);
    padding: 6px 8px;
    border-radius: 4px;
}
.field-label {
    font-size: 11px;
    color: #a0aec0;
    font-weight: 600;
    margin-bottom: 2px;
}
.field-value {
    font-size: 13px;
    color: #e2e8f0;
}

.states-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
}

.state-item {
    padding: 12px;
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 6px;
    text-align: center;
}

.state-date {
    display: block;
    font-size: 11px;
    color: #a0aec0;
    font-weight: 600;
}

.state-type {
    display: block;
    font-size: 12px;
    color: #e2e8f0;
    margin-top: 4px;
}

.empty {
    text-align: center;
    padding: 40px 20px;
    color: #a0aec0;
    font-size: 14px;
}

.maintenance-banner {
    margin: 0 32px 16px 32px;
    border-radius: 10px;
    overflow: hidden;
    border-left: 4px solid;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.95) 100%);
    backdrop-filter: blur(10px);
}

.maintenance-banner.in-progress {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(30, 58, 138, 0.02) 100%);
}

.maintenance-banner.completed {
    border-left-color: #10b981;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(5, 150, 105, 0.02) 100%);
}

.banner-wrapper {
    display: flex;
    gap: 16px;
    padding: 16px 20px;
    align-items: flex-start;
}

.banner-left {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.status-indicator {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 58, 138, 0.1));
    border: 2px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 16px rgba(59, 130, 246, 0.15);
}

.status-indicator.completed {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.15);
}

.status-icon {
    width: 28px;
    height: 28px;
    color: #3b82f6;
    animation: subtle-float 3s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.status-indicator.completed .status-icon {
    color: #10b981;
    animation: scale-pulse 2s ease-in-out infinite;
}

.pulse-dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 8px #ef4444;
    animation: pulse-ring 2s ease-in-out infinite, dot-glow 2s ease-in-out infinite;
    top: -8px;
    right: -8px;
}

.banner-main {
    flex: 1;
    min-width: 0;
}

.banner-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.banner-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    letter-spacing: 0.2px;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.2);
    transition: all 0.3s ease;
}

.badge.preventive {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
    border-color: rgba(34, 197, 94, 0.2);
}

.badge.corrective {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border-color: rgba(239, 68, 68, 0.2);
}

.badge:hover {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
}

.badge svg {
    width: 14px;
    height: 14px;
}

.banner-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #475569;
    white-space: nowrap;
}

.meta-icon {
    width: 16px;
    height: 16px;
    color: #64748b;
    flex-shrink: 0;
}

.meta-label {
    font-weight: 600;
    color: #64748b;
}

.meta-value {
    color: #334155;
    font-weight: 500;
}

/* ============ ANIMATIONS ============ */

@keyframes subtle-float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-4px);
    }
}

@keyframes scale-pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.08);
    }
}

@keyframes pulse-ring {
    0% {
        width: 14px;
        height: 14px;
        opacity: 1;
    }
    100% {
        width: 32px;
        height: 32px;
        opacity: 0;
    }
}

@keyframes dot-glow {
    0%, 100% {
        box-shadow: 0 0 8px #ef4444;
    }
    50% {
        box-shadow: 0 0 16px #ef4444, 0 0 24px rgba(239, 68, 68, 0.5);
    }
}

@media (max-width: 768px) {
    .banner-content {
        gap: 12px;
        padding: 12px 16px;
    }
    
    .banner-icon {
        width: 40px;
        height: 40px;
        font-size: 24px;
    }
    
    .banner-title {
        font-size: 14px;
    }
    
    .banner-details {
        font-size: 12px;
    }
    
    .timeline-dots {
        display: none;
    }
}

.loading {
    text-align: center;
    padding: 40px 20px;
    color: #cbd5e1;
}

.panel-footer-simple {
    padding: 20px 32px;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    flex-wrap: wrap;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.2);
}

.btn-simple {
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 8px;
    color: #e2e8f0;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-simple:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2));
    border-color: rgba(139, 92, 246, 0.6);
    color: #fff;
}

.btn-simple.maintenance {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border-color: #8b5cf6;
}

.btn-simple.close {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
}

.btn-simple.close:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2));
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
}

/* PDF preview modal styles */
.pdf-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;
    padding: 20px;
}

.pdf-preview-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-width: 1200px;
    background: #1a1f2e;
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
}

.pdf-header {
    padding: 16px 24px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.pdf-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #a0aec0;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    color: #e2e8f0;
}

.pdf-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0aec0;
    font-size: 14px;
}

:deep(.pdf-preview-content .blob-pdf-shell) {
    flex: 1;
    overflow: hidden;
}

/* Scroll styling */
.panel-content::-webkit-scrollbar {
    width: 8px;
}

.panel-content::-webkit-scrollbar-track {
    background: rgba(139, 92, 246, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
}

/* Maintenance Tab Styles */
.maintenance-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.maintenance-section {
    padding: 16px;
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 8px;
    border-left: 4px solid #8b5cf6;
}

.maintenance-section.completed {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
    border-color: rgba(16, 185, 129, 0.2);
}

.maintenance-section.in-progress {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
    border-color: rgba(59, 130, 246, 0.2);
}

.maintenance-section.history {
    border-left-color: #f59e0b;
    background: rgba(245, 158, 11, 0.05);
    border-color: rgba(245, 158, 11, 0.2);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.section-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #e2e8f0;
}

.completion-indicator,
.progress-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.completion-indicator {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.progress-indicator {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    position: relative;
}

.completion-icon,
.progress-indicator svg {
    width: 12px;
    height: 12px;
}

.progress-indicator .pulse-dot {
    position: relative;
    width: 6px;
    height: 6px;
    background: #3b82f6;
    border-radius: 50%;
    animation: dot-glow 1.5s ease-in-out infinite;
}

.maintenance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
}

.maint-card {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.1);
    border-radius: 6px;
}

.maint-label {
    font-size: 10px;
    font-weight: 700;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.maint-value {
    font-size: 12px;
    color: #e2e8f0;
    font-weight: 500;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.badge-icon {
    width: 12px;
    height: 12px;
}

.badge.preventive {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge.corrective {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge.functional {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge.non-functional {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge.warning {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.maint-observations {
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-left: 3px solid #8b5cf6;
    border-radius: 4px;
}

.obs-label {
    font-size: 10px;
    font-weight: 700;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.obs-value {
    font-size: 12px;
    color: #cbd5e1;
    line-height: 1.5;
}

.maintenance-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.maintenance-item {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.1);
    border-radius: 6px;
}

.item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.item-date {
    font-size: 11px;
    color: #a0aec0;
    font-weight: 600;
}

.item-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
}

.detail-row {
    display: flex;
    flex-direction: column;
    font-size: 12px;
}

.detail-label {
    color: #a0aec0;
    font-weight: 600;
    margin-bottom: 2px;
    font-size: 10px;
}

.detail-value {
    color: #cbd5e1;
}
</style>
