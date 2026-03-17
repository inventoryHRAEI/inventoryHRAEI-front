<template>
  <div class="modal-overlay" v-if="item">
    <div class="modal-container">
      <div class="modal-header">
        <div>
          <h2>Iniciar Mantenimiento</h2>
          <p class="subtitle">Registra los detalles del mantenimiento</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="equipment-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Equipo:</span>
            <span class="info-value">{{ item.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Inventario:</span>
            <span class="info-value code">{{ item.inventoryNo }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Número de Serie:</span>
            <span class="info-value">{{ item.serialNumber || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="form-container">
        <div class="form-group">
          <label for="reason" class="form-label">Motivo del Mantenimiento <span class="required">*</span></label>
          <select v-model="formData.reason" id="reason" class="form-control" required>
            <option value="">Selecciona un motivo...</option>
            <option value="preventivo">Mantenimiento Preventivo</option>
            <option value="correctivo">Mantenimiento Correctivo</option>
            <option value="calibracion">Calibración</option>
            <option value="reparacion">Reparación</option>
            <option value="actualizacion">Actualización/Firmware</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div class="form-group">
          <label for="technician" class="form-label">Técnico Responsable <span class="required">*</span></label>
          <input
            v-model="formData.technician"
            id="technician"
            type="text"
            class="form-control"
            placeholder="Nombre completo del técnico"
            required
          />
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Descripción del Problema o Trabajo</label>
          <textarea
            v-model="formData.description"
            id="description"
            class="form-control"
            placeholder="Describe el problema detectado o qué trabajo se va a realizar..."
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="serial" class="form-label">Número de Serie Verificado</label>
          <input
            v-model="formData.serialNumber"
            id="serial"
            type="text"
            class="form-control"
            placeholder="Confirma el número de serie del equipo"
          />
        </div>

        <div class="form-group">
          <label for="images" class="form-label">Imágenes Iniciales (Opcional)</label>
          <div class="image-upload-area">
            <input
              ref="imageInput"
              id="images"
              type="file"
              multiple
              accept="image/*"
              @change="handleImageSelect"
              style="display: none"
            />
            <button
              type="button"
              class="upload-btn"
              @click="$refs.imageInput.click()"
            >
              📷 Seleccionar Imágenes
            </button>
            <p class="upload-hint">Selecciona una o varias imágenes (JPG, PNG, GIF, WebP)</p>
          </div>

          <div v-if="formData.images.length > 0" class="images-preview">
            <p class="preview-title">Imágenes seleccionadas ({{ formData.images.length }})</p>
            <div class="image-grid">
              <div v-for="(img, idx) in formData.images" :key="idx" class="image-item">
                <img :src="img.preview" :alt="img.name" />
                <button
                  type="button"
                  class="remove-btn"
                  @click="removeImage(idx)"
                  title="Eliminar"
                >
                  ✕
                </button>
                <p class="image-name">{{ img.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Iniciar Mantenimiento</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['close', 'confirm'])

const imageInput = ref(null)

const formData = reactive({
  reason: '',
  technician: '',
  description: '',
  serialNumber: '',
  images: []
})

function handleImageSelect(event) {
  const files = Array.from(event.target.files || [])
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        formData.images.push({
          file,
          preview: e.target.result,
          name: file.name
        })
      }
      reader.readAsDataURL(file)
    }
  })
  event.target.value = ''
}

function removeImage(idx) {
  formData.images.splice(idx, 1)
}

function submitForm() {
  if (!formData.reason) {
    alert('Por favor selecciona el motivo del mantenimiento')
    return
  }
  if (!formData.technician.trim()) {
    alert('Por favor ingresa el nombre del técnico')
    return
  }

  emit('confirm', {
    reason: formData.reason,
    technician: formData.technician.trim(),
    description: formData.description.trim(),
    serialNumber: formData.serialNumber.trim(),
    images: formData.images.map(img => img.file),
    start: new Date().toISOString()
  })

  formData.reason = ''
  formData.technician = ''
  formData.description = ''
  formData.serialNumber = ''
  formData.images = []
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
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
  align-items: flex-start;
  padding: 28px;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
}

.modal-header h2 {
  margin: 0 0 6px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.close-btn:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.equipment-info {
  background: #f9fafb;
  padding: 24px 28px;
  border-bottom: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.info-value.code {
  font-family: 'Courier New', monospace;
  background: white;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-weight: 700;
}

.form-container {
  padding: 28px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  background: white;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  background: #f0fdf4;
}

.form-control[type='select'],
select.form-control {
  cursor: pointer;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border-radius: 8px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1.5px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #1f2937;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.image-upload-area {
  padding: 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  text-align: center;
  transition: all 0.2s ease;
}

.image-upload-area:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.upload-btn {
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.upload-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.upload-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.images-preview {
  margin-top: 20px;
}

.preview-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.image-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  padding: 0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgb(220, 38, 38);
  transform: scale(1.1);
}

.image-name {
  padding: 6px 4px;
  font-size: 0.7rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

@media (max-width: 640px) {
  .modal-container {
    max-width: 95vw;
  }

  .modal-header {
    padding: 20px;
  }

  .equipment-info {
    padding: 16px 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-container {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>
