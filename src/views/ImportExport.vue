<template>
  <div class="import-view">
    <div class="header">
      <h1>📥 Importar Equipos</h1>
      <p class="subtitle">Importa tu archivo CSV y el sistema normalizará las columnas automáticamente</p>
    </div>

    <div class="content">
      <!-- Panel de Importación -->
      <div class="card">
        <div class="card-header">
          <h2>📁 Subir Archivo CSV</h2>
        </div>
        
        <div class="upload-area" 
             @dragover.prevent="dragOver"
             @dragleave.prevent="dragLeave"
             @drop.prevent="handleDrop"
             :class="{ 'drag-over': isDragging }">
          
          <input type="file" 
                 ref="fileInput"
                 accept=".csv" 
                 @change="handleFileSelect" 
                 style="display: none">
          
          <div v-if="!selectedFile" class="upload-prompt">
            <div class="upload-icon">📂</div>
            <p class="upload-text">Arrastra tu archivo CSV aquí</p>
            <p class="or">o</p>
            <button class="btn-select" @click="$refs.fileInput.click()">
              Seleccionar archivo
            </button>
            <p class="upload-hint">Solo archivos .csv</p>
          </div>
          
          <div v-else class="file-selected">
            <div class="file-icon-large">📄</div>
            <div class="file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <button class="btn-remove" @click="clearFile">✕</button>
          </div>
        </div>

        <div v-if="selectedFile" class="actions-row">
          <button class="btn-preview" @click="previewFile" :disabled="loading">
            👁️ Previsualizar
          </button>
          <button class="btn-import" @click="importFile" :disabled="loading">
            {{ loading ? '⏳ Importando...' : '📥 Importar Equipos' }}
          </button>
        </div>

        <!-- Resultados -->
        <div v-if="result" class="result-box" :class="result.ok ? 'success' : 'error'">
          <div v-if="result.ok" class="result-success">
            <h3>✅ Importación completada</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-num">{{ result.resultado?.total || 0 }}</span>
                <span class="stat-lbl">Total</span>
              </div>
              <div class="stat-item green">
                <span class="stat-num">{{ result.resultado?.insertados || 0 }}</span>
                <span class="stat-lbl">Insertados</span>
              </div>
              <div class="stat-item yellow">
                <span class="stat-num">{{ result.resultado?.actualizados || 0 }}</span>
                <span class="stat-lbl">Actualizados</span>
              </div>
              <div class="stat-item red">
                <span class="stat-num">{{ result.resultado?.errores || 0 }}</span>
                <span class="stat-lbl">Errores</span>
              </div>
            </div>
            <div v-if="result.resultado?.columnasDesconocidas?.length" class="new-columns">
              <p>📋 Columnas nuevas detectadas:</p>
              <div class="tags-row">
                <span v-for="col in result.resultado.columnasDesconocidas" :key="col" class="tag-new">
                  {{ col }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="result-error">
            <h3>❌ Error</h3>
            <p>{{ result.msg }}</p>
          </div>
        </div>
      </div>

      <!-- Panel de Previsualización -->
      <div v-if="preview" class="card">
        <h2>👁️ Previsualización</h2>
        
        <div class="mapping-section">
          <h4>Mapeo de columnas:</h4>
          <div class="mapping-list">
            <div v-for="(target, source) in preview.mapeo" :key="source" class="mapping-row">
              <span class="map-source">{{ source }}</span>
              <span class="map-arrow">→</span>
              <span class="map-target">{{ target }}</span>
            </div>
          </div>
        </div>

        <div class="preview-table-wrap">
          <h4>Primeras 5 filas:</h4>
          <div class="table-scroll">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>inventory_no</th>
                  <th>nombre</th>
                  <th>marca</th>
                  <th>modelo</th>
                  <th>serie</th>
                  <th>extras</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in preview.primerasFilas" :key="idx">
                  <td>{{ row.inventory_no || '-' }}</td>
                  <td>{{ row.nombre || '-' }}</td>
                  <td>{{ row.marca || '-' }}</td>
                  <td>{{ row.modelo || '-' }}</td>
                  <td>{{ row.serie || '-' }}</td>
                  <td class="extras-cell">{{ row._extra_keys?.join(', ') || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Panel de Equipos Importados -->
      <div class="card">
        <div class="card-header">
          <h2>📋 Equipos en Sistema</h2>
          <button class="btn-delete-all" @click="deleteAll" :disabled="loading">
            🗑️ Eliminar todos
          </button>
        </div>
        
        <div v-if="equipos?.length" class="equipos-section">
          <p class="equipos-count">Total: {{ equipos.length }} equipos</p>
          <div class="table-scroll">
            <table class="equipos-table">
              <thead>
                <tr>
                  <th>inventory_no</th>
                  <th>nombre</th>
                  <th>marca</th>
                  <th>modelo</th>
                  <th>estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eq in equipos.slice(0, 20)" :key="eq.id">
                  <td class="mono">{{ eq.inventory_no }}</td>
                  <td>{{ eq.nombre }}</td>
                  <td>{{ eq.marca }}</td>
                  <td>{{ eq.modelo }}</td>
                  <td><span class="estado-badge">{{ eq.estado || 'N/A' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="equipos.length > 20" class="more-info">
            ...y {{ equipos.length - 20 }} equipos más
          </p>
        </div>
        <div v-else class="empty-state">
          <span class="empty-icon">📦</span>
          <p>No hay equipos importados aún</p>
        </div>
      </div>

      <!-- Diccionario -->
      <div class="card">
        <h2>📖 Diccionario de Normalización</h2>
        <p class="info-text">El sistema reconoce automáticamente estas variaciones de nombres:</p>
        
        <div v-if="dictionary" class="dictionary-grid">
          <div v-for="item in dictionary" :key="item.campo" class="dictionary-card">
            <span class="campo-name">{{ item.campo }}</span>
            <span class="sinonimos-text">{{ item.sinonimos.slice(0, 4).join(', ') }}{{ item.sinonimos.length > 4 ? '...' : '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const selectedFile = ref(null)
const loading = ref(false)
const isDragging = ref(false)
const result = ref(null)
const preview = ref(null)
const equipos = ref([])
const dictionary = ref([])

onMounted(async () => {
  await loadEquipos()
  await loadDictionary()
})

async function loadEquipos() {
  try {
    const res = await fetch(`${API_URL}/api/import/equipos`)
    const data = await res.json()
    if (data.ok) {
      equipos.value = data.equipos || []
    }
  } catch (e) {
    console.error('Error cargando equipos:', e)
  }
}

async function loadDictionary() {
  try {
    const res = await fetch(`${API_URL}/api/import/dictionary`)
    const data = await res.json()
    if (data.ok) {
      dictionary.value = data.diccionario || []
    }
  } catch (e) {
    console.error('Error cargando diccionario:', e)
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    result.value = null
    preview.value = null
  }
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.name.endsWith('.csv')) {
    selectedFile.value = file
    result.value = null
    preview.value = null
  }
}

function dragOver() {
  isDragging.value = true
}

function dragLeave() {
  isDragging.value = false
}

function clearFile() {
  selectedFile.value = null
  result.value = null
  preview.value = null
}

async function previewFile() {
  if (!selectedFile.value) return
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const res = await fetch(`${API_URL}/api/import/preview`, {
      method: 'POST',
      body: formData
    })
    
    const data = await res.json()
    if (data.ok) {
      preview.value = data.preview
    } else {
      alert('Error: ' + data.msg)
    }
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function importFile() {
  if (!selectedFile.value) return
  
  if (!confirm('¿Estás seguro de importar este archivo? Se insertarán/actualizarán los equipos.')) {
    return
  }
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const res = await fetch(`${API_URL}/api/import/csv`, {
      method: 'POST',
      body: formData
    })
    
    const data = await res.json()
    result.value = data
    
    if (data.ok) {
      await loadEquipos()
    }
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function deleteAll() {
  if (!confirm('¿Estás seguro de eliminar TODOS los equipos importados? Esta acción no se puede deshacer.')) {
    return
  }
  
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/api/import/equipos`, {
      method: 'DELETE'
    })
    
    const data = await res.json()
    alert(data.msg)
    await loadEquipos()
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    loading.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.import-view {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 1.75rem;
  margin-bottom: 8px;
  color: #e2e8f0;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card h2 {
  font-size: 1.1rem;
  color: #e2e8f0;
  margin: 0;
}

.card h4 {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 12px 0 8px;
}

/* Upload Area */
.upload-area {
  border: 2px dashed rgba(100, 116, 139, 0.4);
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  transition: all 0.2s ease;
  background: rgba(15, 23, 42, 0.4);
}

.upload-area.drag-over {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.08);
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.upload-text {
  color: #e2e8f0;
  font-size: 1rem;
  margin: 0 0 8px;
}

.or {
  color: #64748b;
  margin: 4px 0;
}

.upload-hint {
  color: #64748b;
  font-size: 0.8rem;
  margin-top: 8px;
}

.btn-select {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-select:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* File Selected */
.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
}

.file-icon-large {
  font-size: 32px;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  display: block;
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.file-size {
  font-size: 0.8rem;
  color: #64748b;
}

.btn-remove {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Actions */
.actions-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-preview {
  flex: 1;
  background: rgba(100, 116, 139, 0.3);
  color: #e2e8f0;
  border: 1px solid rgba(100, 116, 139, 0.4);
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-preview:hover:not(:disabled) {
  background: rgba(100, 116, 139, 0.4);
}

.btn-import {
  flex: 2;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-import:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.btn-preview:disabled, .btn-import:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Result Box */
.result-box {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
}

.result-box.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.result-box.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.result-success h3, .result-error h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  color: #e2e8f0;
}

.stats-grid {
  display: flex;
  gap: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
}

.stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
}

.stat-item.green .stat-num { color: #22c55e; }
.stat-item.yellow .stat-num { color: #f59e0b; }
.stat-item.red .stat-num { color: #ef4444; }

.stat-lbl {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
}

.new-columns {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.new-columns p {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 8px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-new {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* Mapping Section */
.mapping-section {
  margin-bottom: 16px;
}

.mapping-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mapping-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
  font-size: 0.8rem;
}

.map-source {
  color: #f59e0b;
}

.map-arrow {
  color: #64748b;
}

.map-target {
  color: #22c55e;
  font-weight: 500;
}

/* Table Styles */
.table-scroll {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.preview-table, .equipos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.preview-table th, .equipos-table th {
  background: rgba(15, 23, 42, 0.8);
  color: #94a3b8;
  font-weight: 500;
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.4);
  white-space: nowrap;
}

.preview-table td, .equipos-table td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  color: #e2e8f0;
}

.preview-table tr:hover, .equipos-table tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.extras-cell {
  color: #64748b;
  font-size: 0.7rem;
}

.mono {
  font-family: monospace;
  color: #22d3ee;
}

.estado-badge {
  background: rgba(100, 116, 139, 0.3);
  color: #e2e8f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
}

/* Equipos Section */
.equipos-section {
  margin-top: 12px;
}

.equipos-count {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 12px;
}

.more-info {
  text-align: center;
  color: #64748b;
  font-size: 0.8rem;
  margin-top: 12px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 32px;
  color: #64748b;
}

.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.5;
}

/* Delete All Button */
.btn-delete-all {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-delete-all:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.btn-delete-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dictionary */
.info-text {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 16px;
}

.dictionary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.dictionary-card {
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 8px;
}

.campo-name {
  display: block;
  font-weight: 600;
  color: #22d3ee;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.sinonimos-text {
  font-size: 0.7rem;
  color: #64748b;
}
</style>
