<template>
  <div class="modal-overlay" v-if="item">
    <div class="modal-container">
      <div class="modal-header">
        <div>
          <h2>Finalizar Mantenimiento</h2>
          <p class="subtitle">Completa la información del trabajo realizado</p>
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
            <span class="info-label">Estado Actual:</span>
            <span :class="['status-badge', getStatusClass(item.status)]">{{ item.status }}</span>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="form-container">
        <div class="form-group">
          <label for="technician" class="form-label">Técnico Responsable <span class="required">*</span></label>
          <input
            v-model="formData.technician"
            id="technician"
            type="text"
            class="form-control"
            placeholder="Nombre del técnico que realizó el trabajo"
            required
          />
        </div>

        <div class="form-group">
          <label for="status" class="form-label">Estado Resultante <span class="required">*</span></label>
          <select v-model="formData.status" id="status" class="form-control" required>
            <option value="">Selecciona el estado...</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="OPERATIVO">Operativo</option>
            <option value="EN MANTENIMIENTO">En Mantenimiento (continúa)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="hours" class="form-label">Horas Invertidas <span class="required">*</span></label>
          <input
            v-model.number="formData.hours"
            id="hours"
            type="number"
            step="0.5"
            min="0"
            class="form-control"
            placeholder="Número de horas (ej: 2.5)"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Pruebas Realizadas <span class="required">*</span></label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input
                v-model="formData.tests"
                id="routine"
                type="checkbox"
                value="routine"
              />
              <label for="routine">Rutina de Mantenimiento Preventivo/Correctivo</label>
            </div>
            <div class="checkbox-item">
              <input
                v-model="formData.tests"
                id="simulator"
                type="checkbox"
                value="simulator"
              />
              <label for="simulator">Pruebas con Simuladores</label>
            </div>
            <div class="checkbox-item">
              <input
                v-model="formData.tests"
                id="analyzer"
                type="checkbox"
                value="analyzer"
              />
              <label for="analyzer">Pruebas con Analizador de Seguridad Eléctrica</label>
            </div>
          </div>
          <p v-if="formData.tests.length === 0" class="form-error">
            Debes seleccionar al menos una prueba realizada
          </p>
        </div>

        <div class="form-group">
          <label for="folioNumber" class="form-label">Folio de Mantenimiento Preventivo/Correctivo <span class="required">*</span></label>
          <input
            v-model="formData.folioNumber"
            id="folioNumber"
            type="text"
            class="form-control"
            placeholder="Número de folio (ej: MP-2026-001)"
            required
          />
        </div>

        <div class="form-group">
          <label for="notes" class="form-label">Trabajo Realizado <span class="required">*</span></label>
          <textarea
            v-model="formData.notes"
            id="notes"
            class="form-control"
            placeholder="Describe en detalle: partes reemplazadas, calibraciones, pruebas realizadas, etc..."
            rows="5"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="signature" class="form-label">Observaciones Técnicas</label>
          <textarea
            v-model="formData.signature"
            id="signature"
            class="form-control"
            placeholder="Notas adicionales, recomendaciones para mantenimiento futuro, etc (opcional)"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="images" class="form-label">Imágenes del Mantenimiento</label>
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
          <button type="submit" class="btn btn-primary">Finalizar y Descargar PDF</button>
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
  technician: '',
  status: '',
  hours: null,
  tests: [],
  folioNumber: '',
  notes: '',
  signature: '',
  images: []
})

function getStatusClass(status) {
  if (status === 'EN MANTENIMIENTO') return 'is-yellow'
  if (status === 'DISPONIBLE') return 'is-green'
  if (status === 'OPERATIVO') return 'is-blue'
  return ''
}

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
  if (!formData.technician.trim()) {
    alert('Por favor ingresa el nombre del técnico')
    return
  }
  if (!formData.status) {
    alert('Por favor selecciona el estado resultante')
    return
  }
  if (formData.hours === null || formData.hours === '') {
    alert('Por favor ingresa el número de horas invertidas')
    return
  }
  if (formData.tests.length === 0) {
    alert('Por favor selecciona al menos una prueba realizada')
    return
  }
  if (!formData.folioNumber.trim()) {
    alert('Por favor ingresa el folio de mantenimiento')
    return
  }
  if (!formData.notes.trim()) {
    alert('Por favor describe el trabajo realizado')
    return
  }

  emit('confirm', {
    technician: formData.technician.trim(),
    status: formData.status,
    hours: formData.hours,
    tests: formData.tests,
    folioNumber: formData.folioNumber.trim(),
    notes: formData.notes.trim(),
    signature: formData.signature.trim(),
    images: formData.images.map(img => img.file),
    end: new Date().toISOString()
  })

  formData.technician = ''
  formData.status = ''
  formData.hours = null
  formData.tests = []
  formData.folioNumber = ''
  formData.notes = ''
  formData.signature = ''
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

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.is-green {
  background: var(--status-available-bg, #10b981);
  color: var(--status-available-fg, #065f46);
}

.status-badge.is-yellow {
  background: var(--status-maintenance-bg, #f59e0b);
  color: var(--status-maintenance-fg, #92400e);
}

.status-badge.is-blue {
  background: var(--status-unknown-bg, #3b82f6);
  color: var(--status-unknown-fg, #1e3a8a);
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f59e0b;
}

.checkbox-item label {
  cursor: pointer;
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.form-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin: 8px 0 0 0;
  font-weight: 500;
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
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
  background: #fffbf0;
}

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
  background: #f59e0b;
  color: white;
}

.btn-primary:hover {
  background: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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
  border-color: #f59e0b;
  background: #fffbf0;
}

.upload-btn {
  padding: 12px 24px;
  background: #f59e0b;
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
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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
