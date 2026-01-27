<template>
  <div class="image-upload-manager">
    <div class="upload-section">
      <h4 class="section-title">
        <VueIcon name="ic:baseline-image" size="20" />
        <span>Imágenes del Equipo</span>
        <span class="title-badge" :class="imageBadgeClass">{{ uploadedFiles.length }}/10</span>
      </h4>

      <!-- Área de carga -->
      <div
        class="upload-dropzone"
        :class="{ 'dragging': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="file-input-hidden"
          @change="handleFileSelect"
          :disabled="uploadedFiles.length >= maxImages"
        />

        <div class="dropzone-content">
          <VueIcon name="ic:baseline-cloud-upload" size="48" class="upload-icon" />
          <p class="dropzone-title">Arrastra imágenes aquí o haz clic para seleccionar</p>
          <p class="dropzone-subtitle">
            Máximo {{ maxImages }} imágenes, PNG/JPEG
          </p>
          <button
            type="button"
            class="btn-select-files"
            @click="$refs.fileInput.click()"
            :disabled="uploadedFiles.length >= maxImages"
          >
            <VueIcon name="ic:baseline-add-a-photo" size="18" />
            Seleccionar imágenes
          </button>
        </div>
      </div>

      <!-- Lista de imágenes cargadas -->
      <div v-if="uploadedFiles.length > 0" class="images-grid">
        <div
          v-for="(file, index) in uploadedFiles"
          :key="index"
          class="image-card"
        >
          <!-- Preview -->
          <div class="image-preview">
            <img :src="file.preview" :alt="`Preview ${index + 1}`" />
            <button
              type="button"
              class="btn-remove-image"
              @click="removeImage(index)"
              title="Eliminar imagen"
            >
              <VueIcon name="ic:baseline-close" size="20" />
            </button>
          </div>

          <!-- Información -->
          <div class="image-info">
            <p class="image-name">{{ file.name }}</p>
            <p class="image-size">{{ formatFileSize(file.size) }}</p>

            <!-- Campo pie de imagen -->
            <div class="caption-group">
              <label :for="`caption-${index}`" class="caption-label">
                Pie de imagen (opcional)
              </label>
              <input
                :id="`caption-${index}`"
                v-model="file.caption"
                type="text"
                class="caption-input"
                placeholder="Describe la imagen..."
                maxlength="100"
              />
              <span class="caption-counter">{{ file.caption.length }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <p>No hay imágenes cargadas</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

const props = defineProps({
  maxImages: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:images'])

const fileInput = ref(null)
const isDragging = ref(false)
const uploadedFiles = ref([])

const imageBadgeClass = computed(() => {
  const count = uploadedFiles.value.length
  if (count === 0) return 'badge-slate'
  if (count < 5) return 'badge-blue'
  if (count < 10) return 'badge-amber'
  return 'badge-green'
})

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  addFiles(files)
}

function handleDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

function addFiles(files) {
  const remainingSlots = props.maxImages - uploadedFiles.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach(file => {
    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      return
    }

    // Validar tamaño (máximo 5MB por imagen)
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFiles.value.push({
        file: file,
        name: file.name,
        size: file.size,
        preview: e.target.result,
        caption: ''
      })
      emitUpdate()
    }
    reader.readAsDataURL(file)
  })

  // Resetear input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function removeImage(index) {
  uploadedFiles.value.splice(index, 1)
  emitUpdate()
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function emitUpdate() {
  emit('update:images', {
    files: uploadedFiles.value.map(f => ({
      file: f.file,
      caption: f.caption
    }))
  })
}

function reset() {
  uploadedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({
  reset
})
</script>

<script>
import { computed } from 'vue'
</script>

<style scoped>
.image-upload-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  background: rgba(34, 211, 238, 0.08);
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.title-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  color: #fff;
  margin-left: auto;
}

.badge-slate {
  background: rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
}

.badge-blue {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.badge-amber {
  background: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.badge-green {
  background: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.file-input-hidden {
  display: none;
}

.upload-dropzone {
  position: relative;
  padding: 40px;
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.upload-dropzone:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(30, 41, 59, 0.7);
}

.upload-dropzone.dragging {
  border-color: rgba(59, 130, 246, 0.8);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.upload-dropzone:disabled,
.upload-dropzone[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

.upload-icon {
  color: rgba(59, 130, 246, 0.6);
  transition: color 0.3s ease;
}

.upload-dropzone:hover .upload-icon {
  color: rgba(59, 130, 246, 0.8);
}

.upload-dropzone.dragging .upload-icon {
  color: rgba(59, 130, 246, 1);
}

.dropzone-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.dropzone-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.btn-select-files {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 1px solid rgba(59, 130, 246, 0.6);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
}

.btn-select-files:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.btn-select-files:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.image-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  background: rgba(30, 41, 59, 0.5);
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.image-preview:hover .btn-remove-image {
  opacity: 1;
}

.btn-remove-image:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: rgba(239, 68, 68, 0.6);
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  flex: 1;
}

.image-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.caption-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.caption-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.caption-input {
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 0.825rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.caption-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.caption-counter {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .upload-dropzone {
    padding: 30px 20px;
  }

  .dropzone-title {
    font-size: 0.95rem;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .image-card {
    min-height: 0;
  }
}
</style>
