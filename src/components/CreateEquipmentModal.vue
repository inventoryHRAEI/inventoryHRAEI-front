<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <h2 id="modal-title" class="modal-title">
                <span class="icon">➕</span>
                Nuevo Equipo Médico
              </h2>
              <p class="modal-subtitle">Completa la información básica del equipo</p>
            </div>
            <button
              class="btn-close-modal"
              @click="closeModal"
              aria-label="Cerrar"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Progress indicator -->
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(completionPercent)}%` }"></div>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm" class="modal-form">
            <!-- Número de Inventario (generado) -->
            <div class="form-group required">
              <label for="new-noInventario" class="form-label">
                Número de Inventario
                <span class="required-indicator">*</span>
              </label>
              <input
                id="new-noInventario"
                v-model="formData.noInventario"
                type="text"
                class="form-input"
                readonly
              />
            </div>
            <!-- Equipo Médico - Campo crítico -->
            <div class="form-group required">
              <label for="new-equipo" class="form-label">
                Equipo Médico
                <span class="required-indicator">*</span>
              </label>
              <input
                id="new-equipo"
                v-model="formData.equipoMedico"
                type="text"
                class="form-input"
                placeholder="Ej. Ventilador, Monitor Cardíaco, Desfibrilador..."
                required
                @input="updateProgress"
              />
              <p v-if="!formData.equipoMedico" class="field-hint">Este campo es requerido</p>
            </div>

            <!-- Marca y Modelo -->
            <div class="form-row">
              <div class="form-group">
                <label for="new-marca" class="form-label">
                  Marca
                  <span class="optional-indicator">(opcional)</span>
                </label>
                <input
                  id="new-marca"
                  v-model="formData.marca"
                  type="text"
                  class="form-input"
                  placeholder="Ej. Philips, Siemens, GE"
                  list="marca-suggestions"
                  @input="updateProgress"
                />
                <datalist id="marca-suggestions">
                  <option v-for="m in marcaSuggestions" :key="m" :value="m"></option>
                </datalist>
              </div>

              <div class="form-group">
                <label for="new-modelo" class="form-label">
                  Modelo
                  <span class="optional-indicator">(opcional)</span>
                </label>
                <input
                  id="new-modelo"
                  v-model="formData.modelo"
                  type="text"
                  class="form-input"
                  placeholder="Ej. MX40, IntelliVue"
                  list="modelo-suggestions"
                  @input="updateProgress"
                />
                <datalist id="modelo-suggestions">
                  <option v-for="m in modeloSuggestions" :key="m" :value="m"></option>
                </datalist>
              </div>
            </div>

            <!-- Área - Campo crítico -->
            <div class="form-group required">
              <label for="new-area" class="form-label">
                Área / Unidad Médica
                <span class="required-indicator">*</span>
              </label>
              <input
                id="new-area"
                v-model="formData.area"
                type="text"
                list="area-suggestions"
                class="form-input"
                placeholder="Ej. UCIA, Cardiología, Emergencia, UCI General"
                required
                @input="updateProgress"
              />
              <datalist id="area-suggestions">
                <option v-for="area in ubicacionSuggestions" :key="area" :value="area"></option>
              </datalist>
              <p v-if="!formData.area" class="field-hint">Este campo es requerido</p>
            </div>

            <!-- Número de Serie -->
            <div class="form-group">
              <label for="new-serial" class="form-label">
                Número de Serie
                <span class="optional-indicator">(opcional)</span>
              </label>
              <input
                id="new-serial"
                v-model="formData.serial"
                type="text"
                class="form-input"
                placeholder="Número de serie del fabricante"
                @input="updateProgress"
              />
            </div>

            <!-- Estado Inicial -->
            <div class="form-group">
              <label for="new-estado" class="form-label">
                Estado Inicial
                <span class="optional-indicator">(opcional)</span>
              </label>
              <select
                id="new-estado"
                v-model="formData.estado"
                class="form-input"
                @change="updateProgress"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN MANTENIMIENTO">En Mantenimiento</option>
                <option value="OPERATIVO">Operativo</option>
              </select>
            </div>

            <!-- Info Box -->
            <div class="info-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>Puedes agregar más detalles (marca, modelo, etc.) después de crear el equipo.</p>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting || !formData.equipoMedico || !formData.area"
              >
                <span v-if="isSubmitting" class="spinner"></span>
                {{ isSubmitting ? 'Creando...' : 'Crear Equipo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useInventorySuggestions } from '@/composables/useInventorySuggestions.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  areaSuggestions: {
    type: Array,
    default: () => [
      'UCIA',
      'Cardiología',
      'Emergencia',
      'UCI General',
      'Neumología',
      'Pediatría',
      'Maternidad',
      'Quirófano'
    ]
  }
})

const emit = defineEmits(['update:modelValue', 'equipment-created'])

const isSubmitting = ref(false)
const formData = ref({
  noInventario: '',
  equipoMedico: '',
  marca: '',
  modelo: '',
  area: '',
  serial: '',
  estado: 'DISPONIBLE'
})

// --- inventory-based suggestions ---
const { equipoMedicoList, fetchEquipoMedicoSuggestions, loading: sugLoading } = useInventorySuggestions()

const marcaSuggestions = computed(() => {
    const set = new Set()
    equipoMedicoList.value.forEach(i => { if (i.marca) set.add(i.marca) })
    return Array.from(set).sort()
})
const modeloSuggestions = computed(() => {
    const set = new Set()
    equipoMedicoList.value.forEach(i => { if (i.modelo) set.add(i.modelo) })
    return Array.from(set).sort()
})
const ubicacionSuggestions = computed(() => {
    const set = new Set()
    equipoMedicoList.value.forEach(i => { if (i.ubicacion) set.add(i.ubicacion) })
    return Array.from(set).sort()
})

onMounted(() => {
    // preload suggestions for auto-complete
    fetchEquipoMedicoSuggestions().catch(() => {})
    loadNextInventoryNumber()
})

async function loadNextInventoryNumber() {
    try {
        const resp = await fetch('/api/ops/equipos/next-inventory-number')
        if (resp.ok) {
            const j = await resp.json().catch(() => null)
            if (j && j.ok && j.nextInventoryNumber) {
                formData.value.noInventario = j.nextInventoryNumber
            }
        }
    } catch (e) {
        console.warn('[CreateEquipmentModal] could not fetch next inventory number', e && e.message)
    }
}

const completionPercent = computed(() => {
  let completed = 0
  if (formData.value.equipoMedico) completed++
  if (formData.value.marca) completed++
  if (formData.value.modelo) completed++
  if (formData.value.area) completed++
  if (formData.value.serial) completed++
  return Math.round((completed / 5) * 100)
})

function updateProgress() {
  // La reactividad se actualiza automáticamente
}

async function submitForm() {
  isSubmitting.value = true
  try {
    const payload = {
      'No DE INVENTARIO': formData.value.noInventario,
      'EQUIPO MEDICO': formData.value.equipoMedico,
      'MARCA': formData.value.marca,
      'MODELO': formData.value.modelo,
      'UNIDAD MEDICA': formData.value.area,
      'NUMERO DE SERIE': formData.value.serial,
      'ESTATUS': formData.value.estado
      // additional fields could be added here as needed
    }
    const response = await fetch('/api/ops/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Error al crear el equipo')
    }

    const item = await response.json()
    emit('equipment-created', item)
    closeModal()
  } catch (error) {
    console.error('Error creando equipo:', error)
    // Aquí puedes mostrar un toast o notificación
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  emit('update:modelValue', false)
  // Resetear formulario después de cerrar
  setTimeout(() => {
    formData.value = {
      equipoMedico: '',
      marca: '',
      modelo: '',
      area: '',
      serial: '',
      estado: 'DISPONIBLE'
    }
  }, 300)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  padding: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid rgba(16, 24, 40, 0.08);
  gap: 16px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0b2540;
  margin: 0;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 1.5rem;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #647280;
  margin: 0;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: #647280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-close-modal:hover {
  background: rgba(16, 24, 40, 0.04);
  color: #0b2540;
}

.progress-bar {
  height: 3px;
  background: rgba(16, 24, 40, 0.06);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #2edd5a, #2bc54c);
  transition: width 0.3s ease;
}

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  color: #0b2540;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-indicator {
  color: #ff6b6b;
  font-weight: 700;
}

.optional-indicator {
  color: #999;
  font-size: 0.8rem;
  font-weight: 400;
}

.form-input {
  padding: 11px 13px;
  border: 1.5px solid rgba(16, 24, 40, 0.12);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #2edd5a;
  box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.field-hint {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
}

.info-box {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(46, 221, 90, 0.08);
  border: 1px solid rgba(46, 221, 90, 0.2);
  border-radius: 8px;
  color: #2d5a3d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.info-box svg {
  flex-shrink: 0;
  color: #2edd5a;
}

.info-box p {
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;
}

.btn-primary {
  background: #2edd5a;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2bc54c;
  box-shadow: 0 6px 20px rgba(46, 221, 90, 0.3);
}

.btn-secondary {
  background: rgba(16, 24, 40, 0.04);
  color: #0b2540;
  border: 1.5px solid rgba(16, 24, 40, 0.12);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(16, 24, 40, 0.08);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-card {
    max-width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-form {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    min-width: auto;
    width: 100%;
  }
}
</style>
