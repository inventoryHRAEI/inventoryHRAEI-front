<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="barcode-overlay" @click.self="close">
        
        <div class="barcode-card" role="dialog" aria-modal="true">
          <div class="barcode-header">
            <div class="header-main">
              <h2 class="title">Ficha Técnica de Identificación</h2>
              <p class="subtitle">Etiqueta equilibrada de alta precisión</p>
            </div>
            <button class="btn-close" @click="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="barcode-body">
            <div class="info-section">
              <div class="info-row">
                <div class="info-item">
                  <label>Equipo Detectado</label>
                  <p class="highlight multiline">{{ eqName }}</p>
                </div>
              </div>
            </div>

            <!-- Previsualización de la Etiqueta Equilibrada -->
            <div class="tag-preview-box">
              <div class="tag-label-white industrial-shadow">
                <canvas ref="barcodeCanvas" class="industrial-barcode-canvas"></canvas>
              </div>
            </div>

            <div class="ux-hint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Lectura optimizada con altura moderada
            </div>
          </div>

          <div class="barcode-footer">
            <button v-if="isAuthed" class="btn btn-success" @click="markFunctional">
              Registrar Operativo
            </button>
            <button class="btn btn-primary" @click="downloadPng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Descargar Etiqueta
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import bwipjs from 'bwip-js';
import Swal from 'sweetalert2';
import { normalizeEquipment } from '@/utils/equipmentNormalizer.js';
import { markStatusManual } from '@/services/equipmentStatusService.js';

const props = defineProps({
  modelValue: Boolean,
  code: { type: String, default: '' },
  item: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);
const barcodeCanvas = ref(null);

const normalized = computed(() => normalizeEquipment(props.item)?._normalized || {});
const eqName = computed(() => (normalized.value.name || 'SIN NOMBRE').toUpperCase());
const eqBrand = computed(() => (normalized.value.brand || 'N/A').toUpperCase());
const eqSerial = computed(() => (normalized.value.serialNo || 'S/N').toUpperCase());

const displayInventory = computed(() => {
  const inv = String(props.code || normalized.value.inventoryNo || '').trim();
  if (inv && inv !== 'undefined' && inv !== 'null') return inv;
  return eqSerial.value !== 'S/N' ? eqSerial.value : 'ID-TEMP';
});

const isAuthed = computed(() => typeof window !== 'undefined' && !!localStorage.getItem('token'));

watch(() => props.modelValue, (val) => { visible.value = val; });
watch(visible, (val) => {
  emit('update:modelValue', val);
  if (val) {
    nextTick(() => nextTick(() => renderBalancedTag()));
  }
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else { line = testLine; }
  }
  lines.push(line);
  for (let k = 0; k < lines.length; k++) {
    ctx.fillText(lines[k], x, y + (k * lineHeight));
  }
  return lines.length;
}

/**
 * Render de Etiqueta Equilibrada: Barras optimizadas y espaciado corregido
 */
function renderBalancedTag() {
  if (!barcodeCanvas.value || !displayInventory.value) return;

  try {
    // 1. Generamos el código con altura moderada (25 es el punto dulce)
    bwipjs.toCanvas(barcodeCanvas.value, {
      bcid: 'code128',
      text: displayInventory.value,
      scale: 4,        
      height: 25,       // MODERADO: Suficientemente alto pero no excesivo
      includetext: true,
      textxalign: 'center',
      textsize: 10,
      textfont: 'Arial',
      backgroundcolor: 'ffffff',
      paddingwidth: 30, 
      paddingheight: 15
    });

    const canvas = barcodeCanvas.value;
    const ctx = canvas.getContext('2d');
    const barcodeData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Altura extra mejor calculada para evitar encimamientos
    const textSectionHeight = 160; 
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = oldWidth;
    tempCanvas.height = oldHeight + textSectionHeight;
    const tCtx = tempCanvas.getContext('2d');
    
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.putImageData(barcodeData, 0, 0);
    
    tCtx.fillStyle = '#000000';
    tCtx.textAlign = 'center';

    // Línea de separación limpia
    tCtx.strokeStyle = '#000000';
    tCtx.lineWidth = 1.5;
    tCtx.beginPath();
    tCtx.moveTo(40, oldHeight + 5); // Un poco de aire después del ID
    tCtx.lineTo(oldWidth - 40, oldHeight + 5);
    tCtx.stroke();

    // Nombre del Equipo (Ajustado)
    tCtx.font = 'bold 22px Arial, sans-serif';
    const lines = wrapText(tCtx, eqName.value, oldWidth / 2, oldHeight + 45, oldWidth - 60, 28);
    
    // Marca y Serie (Damos un buen salto para que no se encime)
    let currentY = oldHeight + 45 + (lines * 28) + 10;
    tCtx.font = 'bold 18px Arial, sans-serif';
    tCtx.fillText(`MARCA: ${eqBrand.value}   |   S/N: ${eqSerial.value}`, oldWidth / 2, currentY);

    // Pie de etiqueta (Al final de todo con margen de seguridad)
    tCtx.font = 'bold 12px Arial, sans-serif';
    tCtx.fillStyle = '#666666';
    tCtx.fillText('PROPIEDAD GUBERNAMENTAL - HRAEI BIOMÉDICA', oldWidth / 2, tempCanvas.height - 25);

    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);

  } catch (err) {
    console.error('[BarcodeModal] Balanced render error:', err);
  }
}

async function downloadPng() {
  const canvas = barcodeCanvas.value;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `etiqueta-hraei-${displayInventory.value}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function markFunctional() {
  const { value: notes } = await Swal.fire({
    title: 'Confirmar Operatividad',
    input: 'textarea',
    inputPlaceholder: 'Notas...',
    background: '#1f2937',
    color: '#fff',
    confirmButtonColor: '#10b981',
    confirmButtonText: 'OK',
    showCancelButton: true
  });
  if (notes) {
    try {
      await markStatusManual(displayInventory.value, { status: 'functional', notes });
      Swal.fire({ icon: 'success', title: 'Completado', background: '#1f2937', color: '#fff' });
      close();
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
  }
}

function close() { visible.value = false; }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.barcode-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
  z-index: 200000; display: flex; align-items: center; justify-content: center; padding: 20px;
}

.barcode-card {
  background: #111827; width: 100%; max-width: 650px;
  border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex; flex-direction: column; overflow: hidden;
}

.barcode-header { padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.title { color: white; font-size: 1.25rem; font-weight: 700; margin: 0; }
.subtitle { color: #9ca3af; font-size: 0.875rem; margin: 4px 0 0; }
.btn-close { background: transparent; border: none; color: #6b7280; cursor: pointer; }

.barcode-body { padding: 32px; overflow-y: auto; flex: 1; max-height: 85vh; }

.info-section { margin-bottom: 24px; }
.info-item label { font-size: 0.7rem; color: #6b7280; font-weight: 700; text-transform: uppercase; display: block; }
.info-item p.highlight { color: white; font-size: 1.1rem; font-weight: 700; line-height: 1.3; }

.tag-preview-box { background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; display: flex; justify-content: center; margin-bottom: 20px; }
.tag-label-white { background: white; border-radius: 4px; overflow: hidden; }
.industrial-shadow { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
.industrial-barcode-canvas { max-width: 100%; height: auto !important; }

.ux-hint { display: flex; align-items: center; justify-content: center; gap: 8px; color: #9ca3af; font-size: 0.8rem; font-weight: 600; }

.barcode-footer { padding: 24px 32px; display: flex; gap: 16px; background: rgba(0, 0, 0, 0.15); border-top: 1px solid rgba(255, 255, 255, 0.05); }
.btn { flex: 1; height: 50px; border: none; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; }
.btn-success { background: #10b981; color: white; }
.btn-primary { background: #3b82f6; color: white; }
</style>
