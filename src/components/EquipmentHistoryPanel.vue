<template>
  <Teleport to="body">
    <Transition name="panel-fade">
      <div v-if="visible" class="equipment-history-overlay" @click.self="closePanel">
        <div class="equipment-history-panel">
          <!-- Header con información de equipo -->
          <header class="panel-header">
            <div class="header-content">
              <h3 class="panel-title">
                <VueIcon name="fa-history" class="title-icon" />
                Historial del Equipo
              </h3>
              <p v-if="item" class="panel-subtitle">{{ item['No DE INVENTARIO'] }} - {{ item['EQUIPO MEDICO'] }}</p>
            </div>
            <button @click="closePanel" class="close-button" aria-label="Cerrar panel">
              <VueIcon name="io-close" />
            </button>
          </header>

          <!-- Tabs de secciones -->
          <div class="panel-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              <VueIcon :name="tab.icon" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Contenido del panel -->
          <div class="panel-body">
            <!-- Tab: Datos Generales -->
            <div v-if="activeTab === 'info'" class="tab-content">
              <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando información...</p>
              </div>
              <div v-else-if="error" class="error-state">
                <VueIcon name="bi-exclamation-triangle-fill" class="error-icon" />
                <h4>Error al Cargar</h4>
                <p>{{ error }}</p>
                <button @click="fetchHistory" class="btn-retry">Reintentar</button>
              </div>
              <div v-else-if="item" class="info-section">
                <div class="info-grid">
                  <div class="info-card">
                    <h4>Información Base</h4>
                    <div class="info-rows">
                      <div class="info-row">
                        <span class="info-label">Equipo:</span>
                        <span class="info-value">{{ item['EQUIPO MEDICO'] || 'N/A' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Inventario:</span>
                        <span class="info-value">{{ item['No DE INVENTARIO'] || 'N/A' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Marca/Modelo:</span>
                        <span class="info-value">{{ item['MARCA'] || 'N/A' }} / {{ item['MODELO'] || 'N/A' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Número Serie:</span>
                        <span class="info-value">{{ item['NUMERO DE SERIE'] || item['SERIE'] || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="info-card">
                    <h4>Ubicación y Estado</h4>
                    <div class="info-rows">
                      <div class="info-row">
                        <span class="info-label">Ubicación:</span>
                        <span class="info-value">{{ item['UBICACION ESPECIFICA'] || 'N/A' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Especialidad:</span>
                        <span class="info-value">{{ item['ESPECIALIDAD AREA DEL HOSPITAL'] || 'N/A' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Estado:</span>
                        <span class="info-value">{{ item['CONDICIONES DEL EQUIPO'] || item['ESTATUS'] || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Información expandida (campos adicionales) -->
                <div v-if="getAdditionalFields().length > 0" class="additional-fields">
                  <h4>Información Adicional</h4>
                  <div class="fields-grid">
                    <div v-for="field in getAdditionalFields()" :key="field.key" class="field-item">
                      <span class="field-label">{{ field.key }}:</span>
                      <span class="field-value">{{ field.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Historial -->
            <div v-else-if="activeTab === 'history'" class="tab-content">
              <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando historial...</p>
              </div>
              <div v-else-if="history && history.length > 0" class="history-timeline">
                <div v-for="(entry, index) in history" :key="index" class="timeline-item">
                  <div class="timeline-connector">
                    <div class="timeline-dot"></div>
                    <div v-if="index < history.length - 1" class="timeline-line"></div>
                  </div>
                  <div class="timeline-content">
                    <div class="content-header">
                      <span class="entry-type">{{ entry['TIPO DE MANTENIMIENTO'] || 'Registro' }}</span>
                      <span class="entry-date">{{ formatDate(entry['ULTIMO MP DD MM AAAA']) }}</span>
                    </div>
                    <div class="content-body">
                      <p v-if="entry['DIAGNOSTICO']" class="entry-field">
                        <strong>Diagnóstico:</strong> {{ entry['DIAGNOSTICO'] }}
                      </p>
                      <p v-if="entry['CAUSA DE NO FUNCIONAMIENTO']" class="entry-field">
                        <strong>Causa:</strong> {{ entry['CAUSA DE NO FUNCIONAMIENTO'] }}
                      </p>
                      <p v-if="entry['OBSERVACIONES'] || entry['OBSERVACIONES_SEPT'] || entry['OBSERVACIONES_OCT']" class="entry-field">
                        <strong>Observaciones:</strong> {{ entry['OBSERVACIONES'] || entry['OBSERVACIONES_SEPT'] || entry['OBSERVACIONES_OCT'] }}
                      </p>
                      <div v-if="getEntryAdditionalFields(entry).length > 0" class="entry-additional">
                        <strong>Detalles:</strong>
                        <ul>
                          <li v-for="field in getEntryAdditionalFields(entry)" :key="field.key">
                            <span class="field-name">{{ field.key }}:</span> {{ field.value }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <VueIcon name="fa-box-open" class="empty-icon" />
                <h4>Sin Registros</h4>
                <p>No se encontró historial de mantenimiento para este equipo.</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="panel-footer">
            <button @click="closePanel" class="btn-footer btn-cancel">
              <VueIcon name="io-close" size="18" />
              Cerrar
            </button>
            <div class="footer-actions">
              <button @click="previewPdf" class="btn-footer btn-preview" :disabled="loading || !item">
                <VueIcon name="ic:baseline-visibility" size="18" />
                Vista Previa
              </button>
              <button @click="downloadPdf" class="btn-footer btn-download" :disabled="loading || !item">
                <VueIcon name="ic:baseline-picture-as-pdf" size="18" />
                Descargar Expediente
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>

    <!-- Modal de Vista Previa PDF -->
    <Teleport to="body">
      <Transition name="pdf-fade">
        <div v-if="pdfPreviewVisible" class="pdf-preview-overlay" @click.self="closePdfPreview">
          <div class="pdf-preview-modal">
            <header class="pdf-header">
              <div class="pdf-header-info">
                <VueIcon name="ic:baseline-picture-as-pdf" size="24" class="pdf-icon" />
                <h3>Vista Previa del Expediente</h3>
              </div>
              <button @click="closePdfPreview" class="pdf-close-btn">
                <VueIcon name="io-close" size="24" />
              </button>
            </header>
            <div class="pdf-viewer">
              <embed v-if="pdfDataUrl" :src="pdfDataUrl" type="application/pdf" />
              <div v-else class="pdf-loading">
                <div class="spinner"></div>
                <p>Generando vista previa profesional...</p>
              </div>
            </div>
            <footer class="pdf-footer">
              <button @click="closePdfPreview" class="btn-footer btn-cancel">Cancelar</button>
              <button @click="downloadPdf" class="btn-footer btn-download">
                <VueIcon name="ic:baseline-file-download" size="20" />
                Guardar PDF
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getEquipmentHistory } from '@/services/historialService.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import membreteUrl from '@/plantillas/MEMBRETADA.jpg';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const loading = ref(false);
const history = ref([]);
const metaFields = ref([]);
const error = ref(null);
const activeTab = ref('info');
const pdfPreviewVisible = ref(false);
const pdfDataUrl = ref(null);

// Campos que se consideran "estáticos" o "base"
const baseFields = [
  'No DE INVENTARIO', 'EQUIPO MEDICO', 'MARCA', 'MODELO', 
  'NUMERO DE SERIE', 'SERIE', 'UBICACION ESPECIFICA', 
  'ESPECIALIDAD AREA DEL HOSPITAL', 'CONDICIONES DEL EQUIPO', 'ESTATUS'
];

const tabs = ref([
  { id: 'info', label: 'Información', icon: 'bi-info-circle' },
  { id: 'history', label: 'Historial', icon: 'fa-history' }
]);

watch(() => props.visible, (newVal) => {
  if (newVal && props.item) {
    activeTab.value = 'info';
    fetchHistory();
  } else {
    // Reset state when panel is closed
    history.value = [];
    metaFields.value = [];
    error.value = null;
  }
});

async function fetchHistory() {
  if (!props.item || !props.item['No DE INVENTARIO']) {
    error.value = 'No se ha proporcionado un equipo válido.';
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const inventoryId = props.item['No DE INVENTARIO'];
    const response = await getEquipmentHistory(inventoryId);
    
    if (response && typeof response === 'object') {
      if (response.history) {
        history.value = response.history;
        metaFields.value = response.meta || [];
      } else {
        history.value = response.maintenance || response;
      }
    } else {
      history.value = [];
    }
  } catch (err) {
    console.error('Error fetching equipment history:', err);
    history.value = [];
  } finally {
    loading.value = false;
  }
}

function closePanel() {
  emit('close');
}

function formatDate(dateString) {
  if (!dateString) return 'Fecha no disponible';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString('es-MX', options);
  } catch (e) {
    return dateString;
  }
}

// Obtener campos adicionales del equipo (no base)
function getAdditionalFields() {
  if (!props.item) return [];
  return Object.keys(props.item)
    .filter(key => !baseFields.includes(key) && key !== 'id' && key !== 'ID' && !key.includes('__'))
    .filter(key => props.item[key] && String(props.item[key]).trim() && props.item[key] !== 'N/A')
    .map(key => ({
      key: key.replace(/_/g, ' '),
      value: String(props.item[key])
    }));
}

// Obtener campos adicionales de una entrada de historial
function getEntryAdditionalFields(entry) {
  const excludeFields = [
    'No', 'No DE INVENTARIO', 'EQUIPO MEDICO', 'MARCA', 'MODELO',
    'NUMERO DE SERIE', 'SERIE', 'ULTIMO MP DD MM AAAA',
    'TIPO DE MANTENIMIENTO', 'DIAGNOSTICO', 'OBSERVACIONES',
    'OBSERVACIONES_SEPT', 'OBSERVACIONES_OCT', 'CAUSA DE NO FUNCIONAMIENTO',
    'UBICACION ESPECIFICA', 'ESPECIALIDAD AREA DEL HOSPITAL', 'CONDICIONES DEL EQUIPO'
  ];

  return Object.keys(entry)
    .filter(key => !excludeFields.includes(key) && key !== 'id' && !key.includes('__'))
    .filter(key => entry[key] && String(entry[key]).trim() && entry[key] !== 'N/A')
    .map(key => ({
      key: key.replace(/_/g, ' '),
      value: String(entry[key])
    }));
}

// Generar PDF (usado para preview y descarga)
async function generatePdf() {
  if (!history.value || history.value.length === 0) return null;

  return new Promise(async (resolve) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    try {
      const response = await fetch(membreteUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
      const base64data = reader.result;
      
      // Función para dibujar el fondo membretado completo (Detrás de todo)
      const drawFullBackground = (targetDoc) => {
        targetDoc.addImage(base64data, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      };

      // INTERCEPTOR de nuevas páginas: 
      // Se ejecuta CUALQUIER vez que se agregue una página (manual o por autoTable).
      // Dibujamos el fondo ANTES de que cualquier tabla empiece a pintar en esa página.
      const originalAddPage = doc.addPage.bind(doc);
      doc.addPage = function() {
        const result = originalAddPage.apply(this, arguments);
        drawFullBackground(this);
        return result;
      };

      // Dibujar fondo en la primera página manualmente (ya que el interceptor solo actúa en addPage)
      drawFullBackground(doc);
      
      let currentY = 45; // Empezar más abajo para no chocar con el encabezado de la imagen
      
      // Título con subrayado decorativo
      doc.setFontSize(18);
      doc.setTextColor(22, 160, 133);
      doc.setFont("helvetica", "bold");
      doc.text("EXPEDIENTE TÉCNICO INTEGRAL", pageWidth / 2, currentY, { align: 'center' });
      
      doc.setDrawColor(22, 160, 133);
      doc.setLineWidth(0.5);
      doc.line(40, currentY + 3, pageWidth - 40, currentY + 3);
      currentY += 12;

      // --- SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL ---
      autoTable(doc, {
        body: [
          [
            { content: 'IDENTIFICACIÓN DEL ACTIVO', colSpan: 4, styles: { halign: 'center', fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 } }
          ],
          [
            { content: 'EQUIPO:', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
            { content: props.item['EQUIPO MEDICO'] || 'N/A', styles: { fillColor: [255, 255, 255] } },
            { content: 'INVENTARIO:', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
            { content: props.item['No DE INVENTARIO'] || 'N/A', styles: { fillColor: [255, 255, 255] } }
          ],
          [
            { content: 'MARCA:', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
            { content: props.item['MARCA'] || 'N/A', styles: { fillColor: [255, 255, 255] } },
            { content: 'MODELO:', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
            { content: props.item['MODELO'] || 'N/A', styles: { fillColor: [255, 255, 255] } }
          ],
          [
            { content: 'SERIE:', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
            { content: props.item['NUMERO DE SERIE'] || props.item['SERIE'] || 'N/A', styles: { fillColor: [255, 255, 255] } },
            { content: 'UBICACIÓN:', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
            { content: props.item['UBICACION ESPECIFICA'] || 'N/A', styles: { fillColor: [255, 255, 255] } }
          ]
        ],
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, fillColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20, top: 45, bottom: 45 }
      });
      
      currentY = (doc).lastAutoTable.finalY + 8;

      // --- SECCIÓN 2: ESPECIFICACIONES TÉCNICAS (DINÁMICO) ---
      const masterRows = [];
      const skipFields = ['EQUIPO MEDICO', 'No DE INVENTARIO', 'MARCA', 'MODELO', 'NUMERO DE SERIE', 'SERIE', 'UBICACION ESPECIFICA', 'id', 'ID'];
      
      Object.keys(props.item).forEach(key => {
        if (key.includes('__') || skipFields.includes(key)) return;
        const val = props.item[key];
        if (val && String(val).trim() && val !== 'N/A' && val !== 'NA') {
          masterRows.push([
            { content: key.replace(/_/g, ' ').toUpperCase(), styles: { fontStyle: 'bold', fillColor: [248, 249, 250], cellWidth: 50 } },
            { content: String(val), styles: { fillColor: [255, 255, 255] } }
          ]);
        }
      });

      if (masterRows.length > 0) {
        autoTable(doc, {
          head: [[{ content: 'DETALLES TÉCNICOS Y ADMINISTRATIVOS ADICIONALES', colSpan: 2, styles: { halign: 'left', fillColor: [44, 62, 80], textColor: [255, 255, 255] } }]],
          body: masterRows,
          startY: currentY,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2.5, fillColor: [255, 255, 255] },
          margin: { left: 20, right: 20, top: 45, bottom: 45 }
        });
        currentY = (doc).lastAutoTable.finalY + 12;
      }

      // --- SECCIÓN 3: BITÁCORA DE MANTENIMIENTOS ---
      if (currentY > pageHeight - 55) {
        doc.addPage();
        currentY = 45;
      }

      const historyRows = [];
      history.value.forEach((entry, idx) => {
        // Fila de encabezado de mantenimiento
        historyRows.push([
          { 
            content: `EVENTO #${idx + 1} - ${formatDate(entry['ULTIMO MP DD MM AAAA'])}`, 
            colSpan: 4, 
            styles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 } 
          }
        ]);

        // Datos clave
        historyRows.push([
          { content: 'TIPO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
          { content: entry['TIPO DE MANTENIMIENTO'] || 'N/A', styles: { fillColor: [255, 255, 255] } },
          { content: 'ESTADO:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
          { content: entry['ESTATUS'] || 'REGISTRADO', styles: { fillColor: [255, 255, 255] } }
        ]);

        // Diagnóstico / Observaciones (Fila ancha)
        historyRows.push([
          { content: 'HALLAZGOS / NOTAS:', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
          { content: entry['DIAGNOSTICO'] || entry['CAUSA DE NO FUNCIONAMIENTO'] || entry['OBSERVACIONES'] || 'SIN OBSERVACIONES REGISTRADAS', colSpan: 3, styles: { fillColor: [255, 255, 255] } }
        ]);

        // Detalles técnicos específicos del ingreso
        const entryDetails = getEntryAdditionalFields(entry);
        if (entryDetails.length > 0) {
          for (let i = 0; i < entryDetails.length; i += 2) {
            const d1 = entryDetails[i];
            const d2 = entryDetails[i + 1];
            historyRows.push([
              { content: d1.key + ':', styles: { fontStyle: 'italic', fontSize: 6.5, textColor: [100, 100, 100], fillColor: [255, 255, 255] } },
              { content: d1.value, styles: { fontSize: 6.5, fillColor: [255, 255, 255] } },
              { content: d2 ? d2.key + ':' : '', styles: { fontStyle: 'italic', fontSize: 6.5, textColor: [100, 100, 100], fillColor: [255, 255, 255] } },
              { content: d2 ? d2.value : '', styles: { fontSize: 6.5, fillColor: [255, 255, 255] } }
            ]);
          }
        }

        // Espaciador estético (Transparente para ver el fondo entre eventos)
        historyRows.push([{ content: '', colSpan: 4, styles: { cellPadding: 1, borderHeight: 0, fillColor: [255, 255, 255, 0] } }]);
      });

      autoTable(doc, {
        head: [[{ content: 'HISTORIAL DE INTERVENCIONES Y SEGUIMIENTO', colSpan: 4, styles: { halign: 'center', fillColor: [22, 160, 133] } }]],
        body: historyRows,
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', fillColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20, top: 45, bottom: 45 },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(`Continuación - Expediente ${props.item['No DE INVENTARIO']}`, 20, 38);
          }
        }
      });
      
      // --- SECCIÓN 4: ETIQUETAS DE IDENTIFICACIÓN (PARA RECORTAR) ---
      doc.addPage();
      
      const invNumber = props.item['No DE INVENTARIO'] || 'S/N';
      const labelLines = buildLabelLines(props.item, 36, 3);
      
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", "bold");
      doc.text("FORMATOS DE ETIQUETADO PARA EQUIPO", pageWidth / 2, 50, { align: 'center' });
      
      // 1. GENERAR RECURSOS (Barcode y QR)
      const qrDataUrl = await QRCode.toDataURL(invNumber, { margin: 1, width: 250 });
      
      const bcCanvas = document.createElement('canvas');
      JsBarcode(bcCanvas, invNumber, { 
        format: "CODE128", 
        displayValue: false, 
        height: 60, 
        width: 3,
        margin: 10
      });
      const barcodeDataUrl = bcCanvas.toDataURL("image/png");

      // --- ETIQUETA 1: BARCODE + TEXTO (ESTILO PANEL) ---
      let currentX = 20;
      currentY = 70;
      const bcLabelW = 90;
      const bcLabelH = 55;

      // Marco de recorte
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect(currentX, currentY, bcLabelW, bcLabelH);
      doc.setLineDashPattern([], 0);

      // Dibujar Barcode (arriba)
      doc.addImage(barcodeDataUrl, 'PNG', currentX + 5, currentY + 5, bcLabelW - 10, 20);

      // Dibujar Líneas de Texto (abajo, centradas como en el panel)
      doc.setTextColor(17, 17, 17);
      doc.setFont("courier", "bold"); // El panel usa monospace
      let textY = currentY + 32;
      labelLines.forEach((line, i) => {
        let fSize = 10;
        if (i === 0) { // El número de inventario suele ser más grande
          fSize = 12;
          doc.setFontSize(fSize);
          doc.text(line, currentX + bcLabelW / 2, textY, { align: 'center' });
          textY += 6;
        } else {
          fSize = 8;
          doc.setFontSize(fSize);
          doc.text(line, currentX + bcLabelW / 2, textY, { align: 'center' });
          textY += 4.5;
        }
      });

      // --- ETIQUETA 2: QR PARA MANTENIMIENTO (ESTILO PANEL) ---
      currentX = 120;
      const qrLabelW = 60;
      const qrLabelH = bcLabelH;

      // Marco de recorte
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect(currentX, currentY, qrLabelW, qrLabelH);
      doc.setLineDashPattern([], 0);

      // Título sugerido
      doc.setFontSize(7);
      doc.setTextColor(100);
      doc.setFont("helvetica", "bold");
      doc.text("SCAN PARA MANTENIMIENTO", currentX + qrLabelW / 2, currentY + 8, { align: 'center' });

      // QR Code (centrado)
      doc.addImage(qrDataUrl, 'PNG', currentX + 10, currentY + 12, 40, 40);

      // Pie de etiqueta QR
      doc.setFontSize(6);
      doc.text(invNumber, currentX + qrLabelW / 2, currentY + qrLabelH - 3, { align: 'center' });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
          `Expediente generado: ${new Date().toLocaleDateString()} - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // Retornar el PDF como Data URL para preview
      const pdfBlob = doc.output('blob');
      const dataUrl = URL.createObjectURL(pdfBlob);
      resolve({ dataUrl, doc, blob: pdfBlob });
    };
  } catch (error) {
    console.error("Error al generar PDF:", error);
    resolve(null);
  }
  });
}

// Vista previa del PDF
async function previewPdf() {
  pdfDataUrl.value = null;
  pdfPreviewVisible.value = true;
  
  const result = await generatePdf();
  if (result) {
    pdfDataUrl.value = result.dataUrl;
  }
}

// Descargar el PDF
async function downloadPdf() {
  const result = await generatePdf();
  if (result && result.doc) {
    result.doc.save(`Expediente_${props.item['No DE INVENTARIO'] || 'equipo'}.pdf`);
  }
}

// Cerrar preview de PDF
function closePdfPreview() {
  pdfPreviewVisible.value = false;
  if (pdfDataUrl.value) {
    URL.revokeObjectURL(pdfDataUrl.value);
    pdfDataUrl.value = null;
  }
}

// Helpers para generación de etiquetas exactas del panel de códigos
function wrapLabelLines(text, maxChars = 34, maxLines = 2) {
    if (!text) return [''];
    const words = String(text).split(/\s+/);
    const lines = [''];
    for (const w of words) {
        const cur = lines[lines.length - 1];
        if ((cur + ' ' + w).trim().length <= maxChars) {
            lines[lines.length - 1] = (cur + ' ' + w).trim();
        } else if (lines.length < maxLines) {
            lines.push(w);
        } else {
            lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
        }
    }
    return lines.map(l => l.trim());
}

function buildLabelLines(item, maxChars = 34, maxLines = 3) {
    const code = item['No DE INVENTARIO'] || '';
    const equipo = item['EQUIPO MEDICO'] || item['EQUIPO'] || '';
    const marca = item['MARCA'] || '';
    
    const lines = [];
    if (code) lines.push(code);
    
    const rest = [equipo, marca].filter(Boolean).join(' ').trim();
    if (rest && lines.length < maxLines) {
        const remain = maxLines - lines.length;
        const restLines = wrapLabelLines(rest, maxChars, remain);
        lines.push(...restLines);
    }
    return lines.filter(Boolean);
}
</script>

<style scoped>
/* Overlay and Panel Transitions */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.3s ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}
.panel-fade-enter-active .equipment-history-panel,
.panel-fade-leave-active .equipment-history-panel {
  transition: transform 0.3s ease;
}
.panel-fade-enter-from .equipment-history-panel,
.panel-fade-leave-to .equipment-history-panel {
  transform: scale(0.95);
}

/* PDF Preview Transitions */
.pdf-fade-enter-active,
.pdf-fade-leave-active {
  transition: opacity 0.3s ease;
}
.pdf-fade-enter-from,
.pdf-fade-leave-to {
  opacity: 0;
}
.pdf-fade-enter-active .pdf-preview-modal,
.pdf-fade-leave-active .pdf-preview-modal {
  transition: transform 0.3s ease;
}
.pdf-fade-enter-from .pdf-preview-modal,
.pdf-fade-leave-to .pdf-preview-modal {
  transform: scale(0.95);
}

.equipment-history-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 20, 40, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.equipment-history-panel {
  width: 90vw;
  max-width: 900px;
  height: 90vh;
  max-height: 850px;
  background: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(30, 41, 59, 0.5);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  flex-shrink: 0;
}
.header-content {
  color: #e2e8f0;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.title-icon {
  color: #3b82f6;
}
.panel-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 4px 0 0;
}
.close-button {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.close-button:hover {
  color: #e2e8f0;
}

/* Tabs Navigation */
.panel-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 24px 0;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  flex-shrink: 0;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  margin-bottom: -12px;
  padding-bottom: 12px;
}

.tab-button:hover {
  color: #cbd5e1;
  background: rgba(59, 130, 246, 0.1);
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

/* Body */
.panel-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0;
  position: relative;
}

.tab-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

/* States: Loading, Error, Empty */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  color: #94a3b8;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}
.error-icon { color: #ef4444; }
.empty-icon { color: #64748b; }

.error-state h4, .empty-state h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 8px;
}
.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.info-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.5));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.1);
}

.info-card h4 {
  color: #3b82f6;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9rem;
  padding: 8px 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #64748b;
  font-weight: 600;
  min-width: 130px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #e2e8f0;
  flex: 1;
  text-align: right;
  word-break: break-word;
  padding-left: 12px;
  font-weight: 500;
}

.additional-fields {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(30, 41, 59, 0.4));
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.additional-fields h4 {
  color: #3b82f6;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  padding: 12px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 6px;
  border-left: 3px solid rgba(59, 130, 246, 0.4);
}

.field-label {
  color: #64748b;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  color: #cbd5e1;
  word-break: break-word;
  font-weight: 500;
}

/* Timeline */
.history-timeline {
  position: relative;
}
.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}
.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.timeline-dot {
  width: 14px;
  height: 14px;
  background-color: #3b82f6;
  border-radius: 50%;
  border: 2px solid #0f172a;
  z-index: 1;
}
.timeline-line {
  width: 2px;
  background-color: rgba(59, 130, 246, 0.3);
  flex-grow: 1;
}
.timeline-content {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(30, 41, 59, 0.4));
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
  flex-grow: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.timeline-content:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.1);
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  padding-bottom: 10px;
}
.entry-type {
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.3));
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.entry-date {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
}
.content-body .entry-field {
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #cbd5e1;
}
.content-body .entry-field strong {
  color: #94a3b8;
}

.entry-additional {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(59, 130, 246, 0.15);
}

.entry-additional strong {
  color: #94a3b8;
  display: block;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.entry-additional ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.entry-additional li {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.field-name {
  color: #94a3b8;
  font-weight: 500;
}

/* Footer & Actions */
.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #0f172a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-footer {
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-color: #047857;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-preview {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-preview:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-cancel {
  background-color: transparent;
  color: #94a3b8;
  border: 1px solid #4b5563;
}

.btn-cancel:hover {
  background-color: #374151;
  color: #f1f5f9;
  border-color: #94a3b8;
}

.btn-footer:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* PDF Preview Modal */
.pdf-preview-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.pdf-preview-modal {
  width: 100%;
  height: 100%;
  max-width: 1100px;
  max-height: 90vh;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-slide-up 0.3s ease-out;
}

@keyframes modal-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.pdf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.pdf-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pdf-icon {
  color: #ef4444;
}

.pdf-header h3 {
  color: #f1f5f9;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.pdf-close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #94a3b8;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pdf-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.pdf-viewer {
  flex-grow: 1;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
}

.pdf-viewer embed {
  width: 100%;
  height: 100%;
}

.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #94a3b8;
}

.pdf-loading .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pdf-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1e293b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Transiciones */
.pdf-fade-enter-active, .pdf-fade-leave-active {
  transition: opacity 0.3s ease;
}
.pdf-fade-enter-from, .pdf-fade-leave-to {
  opacity: 0;
}
</style>
