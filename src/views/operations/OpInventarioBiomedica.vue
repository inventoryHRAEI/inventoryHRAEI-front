<template>
    <ActionPanel class="biomedica-management-main">
        <template #title>
            <div class="title-row">
                <button class="btn-back" @click="goToDashboard">← Volver</button>
                <span>Inventario Biomédica</span>
                <div class="title-badges">
                    <span class="badge-total">{{ items.length }} equipos</span>
                    <span class="badge-sync" v-if="lastSync">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {{ formatTimeAgo(lastSync) }}
                    </span>
                </div>
            </div>
        </template>

        <Breadcrumbs />

        <!-- Filtros Mejorados -->
        <div class="filters-section">
            <div class="search-wrapper">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Buscar por inventario, equipo, marca..."
                    class="search-input"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">✕</button>
            </div>
            
            <div class="view-controls">
                <button @click="viewMode = 'cards'" class="view-btn" :class="{ active: viewMode === 'cards' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </button>
                <button @click="viewMode = 'table'" class="view-btn" :class="{ active: viewMode === 'table' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
                <button @click="refreshData" class="refresh-btn" :class="{ loading: loading }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spin: loading }">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Vista de Carga -->
        <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Cargando inventario...</p>
        </div>
        
        <!-- Vista de Cards -->
        <div v-else-if="viewMode === 'cards' && filteredItems.length > 0" class="cards-grid">
            <div v-for="item in paginatedItems" :key="item.id || item['No DE INVENTARIO']" class="card" :class="getStatusClass(item)">
                <div class="card-header">
                    <h3>{{ item['EQUIPO MEDICO'] || item.name || '—' }}</h3>
                    <span class="status-badge" :class="getStatusClass(item)">
                        {{ item['ESTATUS'] || '—' }}
                    </span>
                </div>
                <div class="card-body">
                    <div class="field">
                        <span class="label">📋 Inventario:</span>
                        <span class="value mono">{{ item['No DE INVENTARIO'] || '—' }}</span>
                    </div>
                    <div class="field">
                        <span class="label">🏷️ Marca:</span>
                        <span class="value">{{ item['MARCA'] || '—' }}</span>
                    </div>
                    <div class="field">
                        <span class="label">📦 Modelo:</span>
                        <span class="value">{{ item['MODELO'] || '—' }}</span>
                    </div>
                    <div class="field">
                        <span class="label">#️⃣ Serie:</span>
                        <span class="value mono">{{ item['NUMERO DE SERIE'] || '—' }}</span>
                    </div>
                    <div class="field">
                        <span class="label">🏥 Unidad:</span>
                        <span class="value">{{ item['UNIDAD MEDICA'] || '—' }}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn view" @click="viewDetail(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Ver
                    </button>
                    <button class="action-btn edit" @click="editItem(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                    </button>
                </div>
            </div>
        </div>

        <!-- Vista de Tabla -->
        <div v-else-if="viewMode === 'table' && filteredItems.length > 0" class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th @click="sortBy('No DE INVENTARIO')" class="sortable">
                            No. Inventario
                            <span v-if="sortField === 'No DE INVENTARIO'" class="sort-icon">{{ sortOrder === 1 ? '▲' : '▼' }}</span>
                        </th>
                        <th @click="sortBy('EQUIPO MEDICO')" class="sortable">
                            Equipo Médico
                            <span v-if="sortField === 'EQUIPO MEDICO'" class="sort-icon">{{ sortOrder === 1 ? '▲' : '▼' }}</span>
                        </th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Serie</th>
                        <th>Unidad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in paginatedItems" :key="item.id || item['No DE INVENTARIO']" :class="getRowClass(item)">
                        <td class="mono">{{ item['No DE INVENTARIO'] || '—' }}</td>
                        <td class="equipment-name">{{ item['EQUIPO MEDICO'] || '—' }}</td>
                        <td>{{ item['MARCA'] || '—' }}</td>
                        <td>{{ item['MODELO'] || '—' }}</td>
                        <td class="mono">{{ item['NUMERO DE SERIE'] || '—' }}</td>
                        <td>{{ item['UNIDAD MEDICA'] || '—' }}</td>
                        <td>
                            <span class="status-badge" :class="getStatusClass(item)">
                                {{ item['ESTATUS'] || '—' }}
                            </span>
                        </td>
                        <td class="actions-cell">
                            <button class="table-action view" @click="viewDetail(item)" title="Ver detalle">👁️</button>
                            <button class="table-action edit" @click="editItem(item)" title="Editar">✏️</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p>No hay equipos que coincidan con los filtros</p>
            <button v-if="searchQuery" @click="clearFilters" class="clear-btn">Limpiar filtros</button>
        </div>

        <!-- Paginación -->
        <div v-if="filteredItems.length > 0" class="pagination">
            <div class="pagination-info">
                Mostrando {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredItems.length) }} de {{ filteredItems.length }}
            </div>
            <div class="pagination-controls">
                <select v-model="pageSize" class="page-size-select">
                    <option :value="10">10 por página</option>
                    <option :value="25">25 por página</option>
                    <option :value="50">50 por página</option>
                    <option :value="100">100 por página</option>
                </select>
                <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">← Anterior</button>
                <span class="page-indicator">Página {{ currentPage }} de {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-btn">Siguiente →</button>
            </div>
        </div>
    </ActionPanel>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('cards')
const lastSync = ref(null)
const currentPage = ref(1)
const pageSize = ref(25)
const sortField = ref(null)
const sortOrder = ref(1)

// filtros dinámicos eliminados — usar buscador general y búsqueda por encabezado

// Estadísticas calculadas
const statusStats = computed(() => {
    let operativo = 0
    let mantenimiento = 0
    let fuera = 0
    
    items.value.forEach(item => {
        const status = String(item['ESTATUS'] || '').toLowerCase()
        if (status.includes('operativo') || status.includes('disponible')) operativo++
        else if (status.includes('mantenimiento')) mantenimiento++
        else if (status.includes('fuera')) fuera++
        else operativo++ // Default
    })
    
    const total = items.value.length || 1
    return {
        operativo,
        mantenimiento,
        fuera,
        operativoPct: Math.round((operativo / total) * 100),
        mantenimientoPct: Math.round((mantenimiento / total) * 100),
        fueraPct: Math.round((fuera / total) * 100)
    }
})

// Función de carga de datos
async function loadData() {
    loading.value = true
    try {
        const response = await fetch('/api/ops/historial-mantenimientos?limit=999999')
        if (!response.ok) throw new Error('API Error')
        
        const json = await response.json()
        const data = Array.isArray(json) ? json : json.data || []
        
        items.value = data.map(item => ({
            id: item.id || item['No DE INVENTARIO'] || Math.random(),
            'No DE INVENTARIO': item['No DE INVENTARIO'] || item.inventoryNo || '',
            'EQUIPO MEDICO': item['EQUIPO MEDICO'] || item.name || '',
            'MARCA': item['MARCA'] || item.brand || '',
            'MODELO': item['MODELO'] || item.model || '',
            'NUMERO DE SERIE': item['NUMERO DE SERIE'] || item.serie || '',
            'UNIDAD MEDICA': item['UNIDAD MEDICA'] || item.medicalUnit || '',
            'ESTATUS': item['ESTATUS'] || item.status || '',
            'FECHA INGRESO': item['FECHA INGRESO'] || item.intakeDate || '',
            ...item
        }))
        lastSync.value = new Date()
    } catch (e) {
        console.error('Error:', e)
    } finally {
        loading.value = false
    }
}

onMounted(loadData)

// Filtrado
const filteredItems = computed(() => {
    let result = items.value
    
    // Búsqueda
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(item => {
            const inv = String(item['No DE INVENTARIO'] || '').toLowerCase()
            const eq = String(item['EQUIPO MEDICO'] || '').toLowerCase()
            const br = String(item['MARCA'] || '').toLowerCase()
            const mod = String(item['MODELO'] || '').toLowerCase()
            return inv.includes(q) || eq.includes(q) || br.includes(q) || mod.includes(q)
        })
    }
    

    
    // Ordenamiento
    if (sortField.value) {
        result = [...result].sort((a, b) => {
            const aVal = String(a[sortField.value] || '').toLowerCase()
            const bVal = String(b[sortField.value] || '').toLowerCase()
            return aVal.localeCompare(bVal, 'es') * sortOrder.value
        })
    }
    
    return result
})

// Paginación
const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => startIndex.value + pageSize.value)
const paginatedItems = computed(() => filteredItems.value.slice(startIndex.value, endIndex.value))

// Funciones


function sortBy(field) {
    if (sortField.value === field) {
        sortOrder.value *= -1
    } else {
        sortField.value = field
        sortOrder.value = 1
    }
}

function clearFilters() {
    searchQuery.value = ''
    currentPage.value = 1
}

function prevPage() {
    if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++
}

function refreshData() {
    loadData()
}

function getStatusClass(item) {
    const status = String(item['ESTATUS'] || '').toLowerCase()
    if (status.includes('operativo') || status.includes('disponible')) return 'status-green'
    if (status.includes('mantenimiento')) return 'status-yellow'
    if (status.includes('fuera')) return 'status-red'
    return 'status-gray'
}

function getRowClass(item) {
    const status = String(item['ESTATUS'] || '').toLowerCase()
    if (status.includes('operativo') || status.includes('disponible')) return 'row-available'
    if (status.includes('mantenimiento')) return 'row-maintenance'
    if (status.includes('fuera')) return 'row-offline'
    return ''
}

function formatTimeAgo(date) {
    if (!date) return ''
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) return 'Hace un momento'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Hace ${minutes} min`
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function viewDetail(item) {
    // Emit o navegar a detalle
    console.log('Ver detalle:', item)
}

function editItem(item) {
    // Emit o navegar a edición
    console.log('Editar:', item)
}

function goToDashboard() {
    try {
        navigateAndRefresh(router, { name: 'dashboard' })
    } catch {
        router.push('/dashboard')
    }
}

// Reset página al cambiar filtros
watch([searchQuery, pageSize], () => {
    currentPage.value = 1
})
</script>

<style scoped>
.biomedica-management-main {
    padding: 20px;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.btn-back {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
}

.btn-back:hover {
    color: #2563eb;
}

.title-badges {
    display: flex;
    gap: 8px;
    margin-left: auto;
}

.badge-total {
    padding: 4px 10px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 20px;
    font-size: 12px;
    color: #3b82f6;
    font-weight: 600;
}

.badge-sync {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(100, 116, 139, 0.1);
    border-radius: 20px;
    font-size: 11px;
    color: #64748b;
}

/* Dashboard de estadísticas */
.stats-dashboard {
    margin: 20px 0;
    padding: 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(59, 130, 246, 0.1);
    border-radius: 12px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: white;
    border-radius: 10px;
    border-left: 4px solid transparent;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.total { border-left-color: #3b82f6; }
.stat-card.available { border-left-color: #22c55e; }
.stat-card.maintenance { border-left-color: #f59e0b; }
.stat-card.offline { border-left-color: #ef4444; }

.stat-icon {
    font-size: 24px;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
}

.stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

.stat-percentage {
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #9ca3af;
}

.stats-bar {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: #e5e7eb;
}

.bar-segment {
    height: 100%;
    transition: width 0.5s ease;
}

.bar-segment.available { background: linear-gradient(90deg, #22c55e, #4ade80); }
.bar-segment.maintenance { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.bar-segment.offline { background: linear-gradient(90deg, #ef4444, #f87171); }

/* Filtros */
.filters-section {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
}

.search-wrapper {
    position: relative;
    flex: 1;
    min-width: 250px;
    max-width: 500px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 36px 10px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 14px;
}

.view-controls {
    display: flex;
    gap: 6px;
    margin-left: auto;
}

.view-btn, .refresh-btn {
    padding: 8px 12px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.view-btn:hover, .refresh-btn:hover {
    background: #e5e7eb;
}

.view-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.refresh-btn.loading {
    opacity: 0.7;
    pointer-events: none;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Loading */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: #6b7280;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

/* Cards */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
    border-left: 4px solid transparent;
}

.card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.card.status-green { border-left-color: #22c55e; }
.card.status-yellow { border-left-color: #f59e0b; }
.card.status-red { border-left-color: #ef4444; }

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    gap: 12px;
}

.card-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
    line-height: 1.4;
}

.status-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}

.status-badge.status-green {
    background: #dcfce7;
    color: #166534;
}

.status-badge.status-yellow {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.status-red {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.status-gray {
    background: #f3f4f6;
    color: #4b5563;
}

.card-body {
    padding: 16px;
}

.field {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 13px;
}

.field .label {
    color: #6b7280;
}

.field .value {
    color: #1f2937;
    text-align: right;
    max-width: 60%;
    font-weight: 500;
}

.field .value.mono {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    color: #3b82f6;
}

.card-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.action-btn.view {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.2);
}

.action-btn.view:hover {
    background: rgba(59, 130, 246, 0.2);
}

.action-btn.edit {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
    border-color: rgba(245, 158, 11, 0.2);
}

.action-btn.edit:hover {
    background: rgba(245, 158, 11, 0.2);
}

/* Table */
.table-container {
    /* enable both horizontal and vertical scrolling inside the card */
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;

    /* keep the table visible while leaving room for stats / pagination */
    max-height: calc(100vh - var(--container-toppad) - 220px);
    min-height: 400px;

    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    margin-bottom: 20px;
    position: relative;
}

/* Scrollbar styling for table container */
.table-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.table-container::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
} 

.data-table {
    width: auto;               /* allow intrinsic width so min-width can force overflow */
    border-collapse: collapse;
    font-size: 13px;
    background: white;

    /* make table wider than the container by default so horizontal scroll appears on small viewports */
    min-width: 1100px;
    table-layout: auto;
}

/* keep header visible while scrolling vertically inside .table-container */
.data-table thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    background: #f9fafb;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.data-table th {
    padding: 14px 16px;
    text-align: left;
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
}

.data-table td {
    white-space: nowrap; /* prevent cell wrap so horizontal overflow is triggered */
}

.data-table th.sortable {
    cursor: pointer;
    user-select: none;
}

.data-table th.sortable:hover {
    background: #f3f4f6;
}

.sort-icon {
    margin-left: 6px;
    color: #3b82f6;
}

.data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    color: #4b5563;
}

.data-table tbody tr {
    transition: all 0.15s ease;
}

.data-table tbody tr:hover {
    background: #f0fdf4;
    box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.1);
}

.data-table tr.row-available {
    border-left: 3px solid #22c55e;
}

.data-table tr.row-maintenance {
    border-left: 3px solid #f59e0b;
    background: rgba(245, 158, 11, 0.03);
}

.data-table tr.row-offline {
    border-left: 3px solid #ef4444;
    background: rgba(239, 68, 68, 0.03);
}

.mono {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    color: #3b82f6;
}

.equipment-name {
    font-weight: 500;
    color: #1f2937;
}

.actions-cell {
    display: flex;
    gap: 8px;
    min-width: 80px;
}

.table-action {
    padding: 8px 12px;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.table-action:hover {
    background: linear-gradient(135deg, #e5e7eb, #d1d5db);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.table-action:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Empty state */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px;
    color: #9ca3af;
}

.empty-state svg {
    margin-bottom: 16px;
    opacity: 0.5;
}

.clear-btn {
    margin-top: 16px;
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
}

.clear-btn:hover {
    background: #2563eb;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    flex-wrap: wrap;
    gap: 16px;
}

.pagination-info {
    color: #6b7280;
    font-size: 13px;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.page-size-select {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
}

.page-btn {
    padding: 8px 16px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #e5e7eb;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-indicator {
    color: #6b7280;
    font-size: 13px;
}
</style>
