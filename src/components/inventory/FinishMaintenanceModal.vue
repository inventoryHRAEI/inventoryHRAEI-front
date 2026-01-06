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

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Finalizar y Descargar PDF</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['close', 'confirm'])

const formData = reactive({
  technician: '',
  status: '',
  notes: '',
  signature: ''
})

function getStatusClass(status) {
  if (status === 'EN MANTENIMIENTO') return 'is-yellow'
  if (status === 'DISPONIBLE') return 'is-green'
  if (status === 'OPERATIVO') return 'is-blue'
  return ''
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
  if (!formData.notes.trim()) {
    alert('Por favor describe el trabajo realizado')
    return
  }

  emit('confirm', {
    technician: formData.technician.trim(),
    status: formData.status,
    notes: formData.notes.trim(),
    signature: formData.signature.trim(),
    end: new Date().toISOString()
  })

  formData.technician = ''
  formData.status = ''
  formData.notes = ''
  formData.signature = ''
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
  background: #10b981;
}

.status-badge.is-yellow {
  background: #f59e0b;
}

.status-badge.is-blue {
  background: #3b82f6;
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
}
</style>
