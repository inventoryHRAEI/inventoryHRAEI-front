<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="scanner-overlay" @click.self="close">
        
        <!-- Modal: Diseño Limpio y Profesional -->
        <div class="scanner-card" role="dialog" aria-modal="true">
          
          <!-- Header: Simple y Directo -->
          <div class="scanner-header">
            <div class="header-info">
              <h2 class="scanner-title">Escanear Equipo</h2>
              <p class="scanner-subtitle">Identifica el equipo mediante código de barras</p>
            </div>
            <button class="btn-close" @click="close" aria-label="Cerrar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Contenido: Dos pestañas claras -->
          <div class="scanner-tabs">
            <button :class="{ active: captureMode === 'camera' }" @click="captureMode = 'camera'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Usar Cámara
            </button>
            <button :class="{ active: captureMode === 'file' }" @click="captureMode = 'file'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Subir Imagen
            </button>
          </div>

          <div class="scanner-body">
            <!-- Visor de Cámara -->
            <div v-if="captureMode === 'camera'" class="visor-container">
              <div class="visor-frame">
                <div v-show="scannerActive" class="focus-box"></div>
                <video v-show="scannerActive" ref="videoEl" class="video-feed" autoplay muted playsinline></video>
                <div v-if="!scannerActive" class="visor-placeholder">
                  <div class="icon-bg">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path>
                    </svg>
                  </div>
                  <p>La cámara está apagada</p>
                  <button class="btn-primary" @click="startScan">Encender Cámara</button>
                </div>
              </div>
            </div>

            <!-- Zona de Arrastre de Archivos -->
            <div v-else class="upload-container">
              <div class="drop-zone" 
                   @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="handleFileDrop"
                   @click="$refs.fileInput.click()"
                   :class="{ 'drop-active': dragOver }">
                <div class="drop-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <polyline points="9 15 12 12 15 15"></polyline>
                  </svg>
                </div>
                <h3>{{ dragOver ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen' }}</h3>
                <p>Formatos aceptados: PNG, JPG, JPEG</p>
                <input type="file" ref="fileInput" class="hidden-input" @change="handleFileSelect" accept="image/*" />
              </div>
            </div>

            <!-- Feedback de Estado -->
            <div class="status-bar">
              <div v-if="processingFile" class="status-msg info">
                <div class="spinner"></div> Analizando imagen...
              </div>
              <div v-if="detected" class="status-msg success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Equipo identificado correctamente
              </div>
              <div v-if="scanError" class="status-msg error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {{ scanError }}
              </div>
            </div>
          </div>

          <!-- Input Manual (Fallback) -->
          <div class="scanner-footer">
            <div class="manual-input">
              <input v-model="manualCode" placeholder="O ingresa el ID manualmente..." @keyup.enter="applyManualCode" />
              <button @click="applyManualCode" class="btn-search">Buscar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const props = defineProps({
  modelValue: Boolean,
  items: { type: Array, default: () => [] },
  maintenanceMap: { type: Object, default: () => ({}) },
  initialCode: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'scan-result', 'start-maintenance', 'finish-maintenance']);

const visible = ref(props.modelValue);
const captureMode = ref('camera');
const dragOver = ref(false);
const scannerActive = ref(false);
const scanError = ref('');
const manualCode = ref('');
const detected = ref(false);
const processingFile = ref(false);
const videoEl = ref(null);
const fileInput = ref(null);

let stream = null;
let zxingReader = null;

watch(() => props.modelValue, (val) => { 
  visible.value = val; 
  if (val) {
    detected.value = false;
    scanError.value = '';
    
    // Si se proporciona un código inicial, buscarlo automáticamente
    if (props.initialCode) {
      manualCode.value = props.initialCode;
      // Pequeño delay para asegurar que el componente esté listo
      setTimeout(() => {
        applyManualCode();
      }, 100);
    }
    
    if (captureMode.value === 'camera' && !props.initialCode) startScan();
  } else {
    stopScan();
  }
});

watch(visible, (val) => emit('update:modelValue', val));

async function startScan() {
  scanError.value = '';
  try {
    if (!zxingReader) zxingReader = new BrowserMultiFormatReader();
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    scannerActive.value = true;
    await nextTick();
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      const result = await zxingReader.decodeOnceFromVideoElement(videoEl.value);
      handleDetection(result.getText());
    }
  } catch (err) {
    if (err.name !== 'Error' && err.name !== 'NotFoundException') {
      scanError.value = 'No se pudo activar la cámara';
    }
  }
}

function stopScan() {
  scannerActive.value = false;
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}

async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processImageFile(file);
}

async function handleFileDrop(e) {
  dragOver.value = false;
  const file = e.dataTransfer.files[0];
  if (file) processImageFile(file);
}

async function processImageFile(file) {
  scanError.value = '';
  processingFile.value = true;
  try {
    if (!zxingReader) zxingReader = new BrowserMultiFormatReader();
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    const result = await zxingReader.decodeFromImageElement(img);
    handleDetection(result.getText());
    URL.revokeObjectURL(url);
  } catch (err) {
    scanError.value = 'No se encontró un código en la imagen';
  } finally {
    processingFile.value = false;
  }
}

function handleDetection(code) {
  const clean = String(code || '').trim();
  if (!clean) return;
  detected.value = true;
  const foundItem = props.items.find(i => {
    const inv = String(i?.['No DE INVENTARIO'] || i?.['inventoryNo'] || i?.['CODIGO'] || i?.['id_inventario'] || '').trim();
    return inv === clean;
  });
  setTimeout(() => {
    emit('scan-result', { code: clean, item: foundItem });
    detected.value = false;
  }, 500); 
}

function applyManualCode() {
  if (manualCode.value) { handleDetection(manualCode.value); manualCode.value = ''; }
}

function close() { visible.value = false; }
onBeforeUnmount(stopScan);
</script>

<style scoped>
/* Transiciones suaves */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scanner-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);
  z-index: 200000; display: flex; align-items: center; justify-content: center; padding: 20px;
}

.scanner-card {
  background: #111827; /* Dark Gray / Navy */
  width: 100%; max-width: 500px;
  border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex; flex-direction: column; overflow: hidden;
}

.scanner-header {
  padding: 24px 24px 16px; display: flex; justify-content: space-between; align-items: flex-start;
}
.scanner-title { color: white; font-size: 1.25rem; font-weight: 700; margin: 0; }
.scanner-subtitle { color: #9ca3af; font-size: 0.875rem; margin: 4px 0 0; }

.btn-close { background: transparent; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 8px; transition: 0.2s; }
.btn-close:hover { background: rgba(255,255,255,0.05); color: white; }

.scanner-tabs {
  padding: 0 24px; display: flex; gap: 8px; margin-bottom: 24px;
}
.scanner-tabs button {
  flex: 1; padding: 10px; border-radius: 12px; border: 1px solid transparent;
  background: rgba(255,255,255,0.03); color: #9ca3af; font-weight: 600; font-size: 0.875rem;
  display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s;
}
.scanner-tabs button.active { background: #3b82f6; color: white; border-color: #60a5fa; }
.scanner-tabs button:hover:not(.active) { background: rgba(255,255,255,0.08); }

.scanner-body { padding: 0 24px 24px; }

.visor-container, .upload-container {
  aspect-ratio: 4/3; background: #000; border-radius: 16px; overflow: hidden; position: relative;
}

.video-feed { width: 100%; height: 100%; object-fit: cover; }
.focus-box {
  position: absolute; inset: 20%; border: 2px solid #3b82f6; border-radius: 12px;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5); z-index: 10; pointer-events: none;
}

.visor-placeholder {
  height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #6b7280;
}
.icon-bg { background: rgba(255,255,255,0.03); padding: 16px; border-radius: 50%; }

.drop-zone {
  height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 2px dashed #1f2937; cursor: pointer; transition: 0.2s; padding: 20px; text-align: center;
}
.drop-zone:hover, .drop-active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
.drop-icon { color: #3b82f6; margin-bottom: 16px; }
.drop-zone h3 { color: white; font-size: 1rem; margin: 0 0 8px; }
.drop-zone p { color: #6b7280; font-size: 0.875rem; margin: 0; }

.status-bar { height: 40px; margin-top: 16px; display: flex; align-items: center; justify-content: center; }
.status-msg { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.875rem; }
.status-msg.info { color: #3b82f6; }
.status-msg.success { color: #10b981; }
.status-msg.error { color: #ef4444; }

.spinner { width: 16px; height: 16px; border: 2px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.scanner-footer { padding: 16px 24px 24px; background: rgba(0, 0, 0, 0.1); }
.manual-input { display: flex; gap: 8px; }
.manual-input input {
  flex: 1; background: #1f2937; border: 1px solid #374151; border-radius: 10px;
  padding: 10px 14px; color: white; font-size: 0.875rem; outline: none; transition: 0.2s;
}
.manual-input input:focus { border-color: #3b82f6; }
.btn-search { background: #3b82f6; color: white; border: none; padding: 0 16px; border-radius: 10px; font-weight: 600; cursor: pointer; }

.btn-primary {
  background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.btn-primary:hover { background: #2563eb; }

.hidden-input { display: none; }
</style>
