<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Generando Vista Previa del Kardex...</p>
      </div>

      <!-- PDF Preview -->
      <div v-else-if="pdfUrl" class="pdf-container">
        <iframe
          :src="pdfUrl"
          class="pdf-iframe"
          title="Vista Previa del Kardex"
        ></iframe>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button
          v-if="pdfUrl"
          class="download-btn"
          @click="downloadPdf"
          title="Descargar PDF"
        >
          📥 Descargar PDF
        </button>
        <button class="close-modal-btn" @click="closeModal">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Vista Previa del Kardex'
  },
  itemData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const isLoading = ref(false)
const pdfUrl = ref(null)
const error = ref(null)
const pdfBlob = ref(null)

// Watcher para generar PDF cuando se abre el modal
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await generatePdfPreview()
  } else {
    // Limpiar recursos cuando se cierra
    if (pdfUrl.value) {
      window.URL.revokeObjectURL(pdfUrl.value)
    }
    pdfUrl.value = null
    pdfBlob.value = null
    error.value = null
  }
})

const generatePdfPreview = async () => {
  try {
    isLoading.value = true
    error.value = null
    pdfUrl.value = null

    if (!props.itemData || Object.keys(props.itemData).length === 0) {
      error.value = 'No hay datos de item disponibles'
      return
    }

    const payload = {
      clave: String(props.itemData['Clave  HRAEI'] || '').trim(),
      descripcion: String(props.itemData['Descripción del bien'] || props.itemData.descripcion || '').trim(),
      marca: String(props.itemData['MARCA'] || '').trim(),
      modelo: String(props.itemData['MODELO'] || '').trim(),
      referencia: String(props.itemData['REFERENCIA'] || '').trim(),
      lote: String(props.itemData['LOTE'] || '').trim()
    }

    const token = localStorage.getItem('auth_token')

    const res = await fetch('/api/ops/inventory/kardex/pdf', {
      method: 'POST',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        token ? { 'Authorization': `Bearer ${token}` } : {}
      ),
      body: JSON.stringify({ identifier: payload })
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data && data.msg) || 'Error al generar kardex')
    }

    const blob = await res.blob()
    pdfBlob.value = blob
    pdfUrl.value = window.URL.createObjectURL(blob)
  } catch (e) {
    console.error('Error generando PDF preview:', e)
    error.value = e.message || 'Error al generar vista previa del kardex'
  } finally {
    isLoading.value = false
  }
}

const downloadPdf = () => {
  if (!pdfBlob.value) return

  const payload = props.itemData
  let filenameBase = ''
  if (payload.descripcion) filenameBase = payload.descripcion
  if (payload.marca) filenameBase = filenameBase ? `${filenameBase}-${payload.marca}` : payload.marca
  if (!filenameBase) filenameBase = payload['Clave  HRAEI'] || 'kardex'
  
  const safeName = String(filenameBase).replace(/[^a-z0-9\-_\.]/gi, '_')
  const url = window.URL.createObjectURL(pdfBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `kardex_${safeName}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  max-height: 90vh;
  width: 1000px;
  height: 800px;
  animation: slideUp 0.3s ease-out;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.pdf-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin-top: 20px;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  color: #d32f2f;
  font-size: 1.1rem;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
  border-radius: 0 0 12px 12px;
}

.download-btn,
.close-modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.download-btn {
  background: #4CAF50;
  color: white;
}

.download-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.close-modal-btn {
  background: #e0e0e0;
  color: #333;
}

.close-modal-btn:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1024px) {
  .modal-content {
    width: 95vw;
    height: 85vh;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 98vw;
    height: 90vh;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .download-btn,
  .close-modal-btn {
    width: 100%;
  }
}
</style>
