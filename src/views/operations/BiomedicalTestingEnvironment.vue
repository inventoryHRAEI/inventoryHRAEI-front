<template>
    <ActionPanel class="testing-environment-main">
        <template #title>
            <div class="title-row">
                <button class="btn-back-to-dashboard" @click="goToDashboard" title="Volver al dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <span>Trabajando - Entorno de Pruebas</span>
                <div class="spacer"></div>
            </div>
        </template>

        <Breadcrumbs />

        <div class="testing-content">
            <!-- Sección de Filtros -->
            <div class="filters-section">
                <div class="filters-header">
                    <div class="filters-title-wrapper">
                        <svg class="icon-search" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <h3>Filtros de búsqueda</h3>
                    </div>
                    <span class="result-count-badge">{{ filteredData.length }} resultados</span>
                </div>
                <div class="filters-grid">
                    <div class="filter-item">
                        <label for="filter-no">No. Registro</label>
                        <div class="input-wrapper">
                            <input id="filter-no" v-model="filters.no" type="text" placeholder="Ej. 001234"
                                @input="applyFilters" />
                        </div>
                    </div>
                    <div class="filter-item">
                        <label for="filter-equipo">Equipo Médico</label>
                        <div class="input-wrapper">
                            <input id="filter-equipo" v-model="filters.equipoMedico" type="text"
                                placeholder="Monitor, Desfibrilador..." @input="applyFilters" />
                        </div>
                    </div>
                    <div class="filter-item">
                        <label for="filter-marca">Marca</label>
                        <div class="input-wrapper">
                            <input id="filter-marca" v-model="filters.marca" type="text"
                                placeholder="Philips, GE, Siemens..." @input="applyFilters" />
                        </div>
                    </div>
                    <div class="filter-item">
                        <label for="filter-tipo">Tipo de Mantenimiento</label>
                        <div class="select-wrapper">
                            <select id="filter-tipo" v-model="filters.tipoMantenimiento" @change="applyFilters">
                                <option value="">Todos</option>
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-item">
                        <label for="filter-estatus">Estatus</label>
                        <div class="select-wrapper">
                            <select id="filter-estatus" v-model="filters.estatus" @change="applyFilters">
                                <option value="">Todos</option>
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-item">
                        <label for="filter-funcional">¿Funcional?</label>
                        <div class="select-wrapper">
                            <select id="filter-funcional" v-model="filters.funcional" @change="applyFilters">
                                <option value="">Todos</option>
                                <option value="SI">Sí</option>
                                <option value="NO">No</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-item">
                        <label for="filter-unidad">Unidad Médica</label>
                        <div class="input-wrapper">
                            <input id="filter-unidad" v-model="filters.unidadMedica" type="text"
                                placeholder="Sala, Área..." @input="applyFilters" />
                        </div>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="btn-reset" @click="resetFilters">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <path d="M5.64 5.64a9 9 0 0 1 12.72 0"></path>
                            <path d="M18.36 18.36a9 9 0 0 1-12.72 0"></path>
                        </svg>
                        Limpiar
                    </button>
                    <button class="btn-advanced" @click="toggleAdvancedFilters">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="6" x2="20" y2="6"></line>
                            <line x1="4" y1="12" x2="20" y2="12"></line>
                            <line x1="4" y1="18" x2="20" y2="18"></line>
                        </svg>
                        {{ showAdvancedFilters ? 'Ocultar' : 'Mostrar' }} Avanzados
                    </button>
                </div>
            </div>

            <!-- Filtros Avanzados -->
            <div v-if="showAdvancedFilters" class="advanced-filters-section">
                <h3>Filtros Avanzados</h3>
                <div class="advanced-filters-grid">
                    <div class="filter-item">
                        <label for="filter-no-inventario">No. de Inventario:</label>
                        <input id="filter-no-inventario" v-model="advancedFilters.noInventario" type="text"
                            placeholder="Buscar por No. de Inventario exacto" @input="applyAdvancedFilters" />
                    </div>
                    <div class="filter-item">
                        <label for="filter-clave-cnis">Clave CNIS:</label>
                        <input id="filter-clave-cnis" v-model="advancedFilters.claveCnis" type="text"
                            placeholder="Buscar por Clave CNIS" @input="applyAdvancedFilters" />
                    </div>
                    <div class="filter-item">
                        <label for="filter-modelo">Modelo:</label>
                        <input id="filter-modelo" v-model="advancedFilters.modelo" type="text"
                            placeholder="Buscar por modelo" @input="applyAdvancedFilters" />
                    </div>
                    <div class="filter-item">
                        <label for="filter-serie">No. de Serie:</label>
                        <input id="filter-serie" v-model="advancedFilters.numeroSerie" type="text"
                            placeholder="Buscar por número de serie" @input="applyAdvancedFilters" />
                    </div>
                    <div class="filter-item">
                        <label for="filter-categoria">Categoría:</label>
                        <input id="filter-categoria" v-model="advancedFilters.categoria" type="text"
                            placeholder="Buscar por categoría" @input="applyAdvancedFilters" />
                    </div>
                    <div class="filter-item">
                        <label for="filter-ubicacion">Ubicación Específica:</label>
                        <input id="filter-ubicacion" v-model="advancedFilters.ubicacionEspecifica" type="text"
                            placeholder="Buscar por ubicación" @input="applyAdvancedFilters" />
                    </div>
                </div>
                <div class="advanced-filter-actions">
                    <button class="btn-reset-advanced" @click="resetAdvancedFilters">Limpiar Avanzados</button>
                </div>
            </div>

            <!-- Vista de Cards (Resumen) -->
            <div class="cards-section">
                <div class="cards-header">
                    <h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="9"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        Resumen de Equipos
                    </h3>
                    <span class="cards-count">{{ displayedCards.length }} mostrados</span>
                </div>
                <div v-if="loading" class="loading">
                    <div class="loader-spinner"></div>
                    <p>Cargando datos...</p>
                </div>
                <div v-else-if="filteredData.length === 0" class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No se encontraron equipos con los filtros aplicados</p>
                </div>
                <div v-else class="cards-grid">
                    <div v-for="item in displayedCards" :key="item.No" class="maintenance-card"
                        @click="selectItem(item)" :class="{ active: selectedItem?.No === item.No }">
                        <div class="card-accent"></div>
                        <div class="card-header">
                            <div class="card-title-group">
                                <span class="card-no">{{ item['No DE INVENTARIO'] || 'N/A' }}</span>
                                <span class="card-equipo">{{ item['EQUIPO MEDICO'] || 'N/A' }}</span>
                            </div>
                            <span class="card-status" :class="item['ESTATUS']?.toLowerCase()">
                                {{ item['ESTATUS'] || 'Sin estado' }}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="card-info-row">
                                <span class="card-label">Marca:</span>
                                <span class="card-value">{{ item['MARCA'] || 'N/A' }}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="card-label">Modelo:</span>
                                <span class="card-value">{{ item['MODELO'] || 'N/A' }}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="card-label">CNIS:</span>
                                <span class="card-value card-cnis">{{ item['CLAVE CNIS'] || 'N/A' }}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="maintenance-badge" :class="item['TIPO DE MANTENIMIENTO']?.toLowerCase()">
                                {{ item['TIPO DE MANTENIMIENTO'] || 'N/A' }}
                            </div>
                            <div class="functional-indicator" :class="item['FUNCIONAL SI NO']?.toLowerCase()">
                                <span class="indicator-dot"></span>
                                {{
                                    item['FUNCIONAL SI NO'] === 'SI'
                                        ? 'Funcional'
                                        : item['FUNCIONAL SI NO'] === 'NO'
                                            ? 'No Funcional'
                                            : 'N/A'
                                }}
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="filteredData.length > pageSize && !loading" class="pagination">
                    <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Anterior
                    </button>
                    <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
                        Siguiente
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Vista de Tabla Detallada (Al seleccionar item) -->
            <div v-if="selectedItem" class="details-section">
                <h3>Detalles del Mantenimiento</h3>
                <div class="details-grid">
                    <!-- Información General -->
                    <div class="detail-group">
                        <h4>Información General</h4>
                        <div class="detail-row">
                            <span class="detail-label">No. Registro:</span>
                            <span class="detail-value">{{ selectedItem.No }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">No. de Inventario:</span>
                            <span class="detail-value">{{ selectedItem['NO DE INVENTARIO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Unidad Médica:</span>
                            <span class="detail-value">{{ selectedItem['UNIDAD MEDICA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Ubicación Específica:</span>
                            <span class="detail-value">{{ selectedItem['UBICACION ESPECIFICA'] }}</span>
                        </div>
                    </div>

                    <!-- Información del Equipo -->
                    <div class="detail-group">
                        <h4>Información del Equipo</h4>
                        <div class="detail-row">
                            <span class="detail-label">Equipo Médico:</span>
                            <span class="detail-value">{{ selectedItem['EQUIPO MEDICO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Marca:</span>
                            <span class="detail-value">{{ selectedItem['MARCA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Modelo:</span>
                            <span class="detail-value">{{ selectedItem['MODELO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">No. de Serie:</span>
                            <span class="detail-value">{{ selectedItem['NUMERO DE SERIE'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Categoría:</span>
                            <span class="detail-value">{{ selectedItem['CATEGORIA'] }}</span>
                        </div>
                    </div>

                    <!-- Estado del Equipo -->
                    <div class="detail-group">
                        <h4>Estado del Equipo</h4>
                        <div class="detail-row">
                            <span class="detail-label">Estatus:</span>
                            <span class="detail-value">{{ selectedItem['ESTATUS'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Condiciones:</span>
                            <span class="detail-value">{{ selectedItem['CONDICIONES DEL EQUIPO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">¿Funcional?:</span>
                            <span class="detail-value">{{ selectedItem['FUNCIONAL SI NO'] }}</span>
                        </div>
                        <div class="detail-row" v-if="selectedItem['CAUSA DE NO FUNCIONAMIENTO']">
                            <span class="detail-label">Causa No Funcionamiento:</span>
                            <span class="detail-value">{{ selectedItem['CAUSA DE NO FUNCIONAMIENTO'] }}</span>
                        </div>
                    </div>

                    <!-- Mantenimiento -->
                    <div class="detail-group">
                        <h4>Información de Mantenimiento</h4>
                        <div class="detail-row">
                            <span class="detail-label">Tipo de Mantenimiento:</span>
                            <span class="detail-value">{{ selectedItem['TIPO DE MANTENIMIENTO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Último MP:</span>
                            <span class="detail-value">{{ selectedItem['ULTIMO MP DD MM AAAA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Cantidad MP al Año:</span>
                            <span class="detail-value">{{ selectedItem['CANTIDAD DE MP AL AÑO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Adquisición:</span>
                            <span class="detail-value">{{ selectedItem['FECHA DE ADQUISICION DD MM AAAA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Instalación:</span>
                            <span class="detail-value">{{ selectedItem['FECHA DE INSTALACIÓN'] }}</span>
                        </div>
                    </div>

                    <!-- Garantía -->
                    <div class="detail-group">
                        <h4>Información de Garantía</h4>
                        <div class="detail-row">
                            <span class="detail-label">¿Con Garantía?:</span>
                            <span class="detail-value">{{ selectedItem['GARANTIA SI NO'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fin de Garantía:</span>
                            <span class="detail-value">{{ selectedItem['FIN DE GARANTIA DD MM AAAA'] }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Garantía Cruce:</span>
                            <span class="detail-value">{{ selectedItem['GARANTIA CRUCE'] }}</span>
                        </div>
                    </div>

                    <!-- Refacciones y Consumibles -->
                    <div class="detail-group full-width">
                        <h4>Refacciones, Accesorios y Consumibles</h4>
                        <div class="detail-row">
                            <span class="detail-label">Accesorios:</span>
                            <span class="detail-value">{{ selectedItem['ACCESORIOS'] || 'N/A' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Consumibles:</span>
                            <span class="detail-value">{{ selectedItem['CONSUMIBLES'] || 'N/A' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Refacciones Levantamiento:</span>
                            <span class="detail-value">{{ selectedItem['REFACCIONES\nLEVANTAMIENTO'] || 'N/A' }}</span>
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="detail-group full-width">
                        <h4>Observaciones</h4>
                        <div class="detail-row">
                            <span class="detail-label">Observaciones:</span>
                            <span class="detail-value">{{ selectedItem['OBSERVACIONES'] || 'N/A' }}</span>
                        </div>
                        <div class="detail-row" v-if="selectedItem['OBSERVACIONES\nLEVANTAMIENTO']">
                            <span class="detail-label">Observaciones Levantamiento:</span>
                            <span class="detail-value">{{ selectedItem['OBSERVACIONES\nLEVANTAMIENTO'] }}</span>
                        </div>
                    </div>
                </div>
                <button class="btn-close-details" @click="selectedItem = null">Cerrar detalles</button>
            </div>

            <!-- Mensaje cuando no hay datos -->
            <div v-if="filteredData.length === 0 && !loading && hasFilters" class="no-results">
                <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
            </div>
        </div>
    </ActionPanel>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'

const router = useRouter()

// Estado de datos
const allData = ref([])
const filteredData = ref([])
const selectedItem = ref(null)
const currentPage = ref(1)
const loading = ref(false)
const pageSize = 6
const showAdvancedFilters = ref(false)

// Filtros iniciales
const initialFilters = {
    no: '',
    equipoMedico: '',
    marca: '',
    tipoMantenimiento: '',
    estatus: '',
    funcional: '',
    unidadMedica: ''
}

const filters = ref({ ...initialFilters })

// Filtros avanzados iniciales
const initialAdvancedFilters = {
    noInventario: '',
    claveCnis: '',
    modelo: '',
    numeroSerie: '',
    categoria: '',
    ubicacionEspecifica: ''
}

const advancedFilters = ref({ ...initialAdvancedFilters })

// Computed
const displayedCards = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize
    return filteredData.value.slice(startIndex, startIndex + pageSize)
})

const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / pageSize)
})

const hasFilters = computed(() => {
    return Object.values(filters.value).some(v => v !== '')
})

// Métodos
function goToDashboard() {
    navigateAndRefresh(router, { name: 'dashboard' })
}

async function applyFilters() {
    await applyAdvancedFilters()
}

function resetFilters() {
    filters.value = { ...initialFilters }
    applyFilters()
}

function toggleAdvancedFilters() {
    showAdvancedFilters.value = !showAdvancedFilters.value
}

async function applyAdvancedFilters() {
    try {
        loading.value = true
        const queryParams = new URLSearchParams()

        // Filtros básicos
        if (filters.value.no.trim()) queryParams.append('no', filters.value.no.trim())
        if (filters.value.equipoMedico.trim()) queryParams.append('equipoMedico', filters.value.equipoMedico.trim())
        if (filters.value.marca.trim()) queryParams.append('marca', filters.value.marca.trim())
        if (filters.value.tipoMantenimiento) queryParams.append('tipoMantenimiento', filters.value.tipoMantenimiento)
        if (filters.value.estatus) queryParams.append('estatus', filters.value.estatus)
        if (filters.value.funcional) queryParams.append('funcional', filters.value.funcional)
        if (filters.value.unidadMedica.trim()) queryParams.append('unidadMedica', filters.value.unidadMedica.trim())

        // Filtros avanzados
        if (advancedFilters.value.noInventario.trim()) queryParams.append('noInventario', advancedFilters.value.noInventario.trim())
        if (advancedFilters.value.claveCnis.trim()) queryParams.append('claveCnis', advancedFilters.value.claveCnis.trim())
        if (advancedFilters.value.modelo.trim()) queryParams.append('modelo', advancedFilters.value.modelo.trim())
        if (advancedFilters.value.numeroSerie.trim()) queryParams.append('numeroSerie', advancedFilters.value.numeroSerie.trim())
        if (advancedFilters.value.categoria.trim()) queryParams.append('categoria', advancedFilters.value.categoria.trim())
        if (advancedFilters.value.ubicacionEspecifica.trim()) queryParams.append('ubicacionEspecifica', advancedFilters.value.ubicacionEspecifica.trim())

        const url = `/api/ops/historial-mantenimientos${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        const response = await fetch(url)

        if (!response.ok) {
            const json = await response.json().catch(() => ({}))
            throw new Error(json.msg || json.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        const items = Array.isArray(data) ? data : (data.data || [])
        allData.value = items
        filteredData.value = items
    } catch (error) {
        console.error('Error aplicando filtros avanzados:', error)
        allData.value = []
        filteredData.value = []
    } finally {
        loading.value = false
    }
    currentPage.value = 1
    selectedItem.value = null
}

function resetAdvancedFilters() {
    advancedFilters.value = { ...initialAdvancedFilters }
    applyAdvancedFilters()
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

function previousPage() {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

// Ciclo de vida
onMounted(async () => {
    await applyFilters()
})
</script>

<style scoped>
.testing-environment-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.btn-back-to-dashboard {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-back-to-dashboard:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #1f2937;
}

.spacer {
    flex: 1;
}

.testing-content {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

/* Sección de Filtros */
.filters-section {
    background: linear-gradient(135deg, #1a202c 0%, #1f2937 100%);
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
    margin-bottom: 28px;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #374151;
}

.filters-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filters-section h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f3f4f6;
    letter-spacing: -0.5px;
}

.icon-search {
    color: #06b6d4;
    flex-shrink: 0;
}

.result-count-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(6, 182, 212, 0.15);
    color: #06b6d4;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(6, 182, 212, 0.3);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-item label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #d1d5db;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.input-wrapper,
.select-wrapper {
    position: relative;
}

.filter-item input,
.filter-item select {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #2d3748;
    color: #e5e7eb;
    font-family: inherit;
    transition: all 0.2s ease;
}

.filter-item input::placeholder {
    color: #9ca3af;
    font-size: 0.85rem;
}

.filter-item input:focus,
.filter-item select:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
    background: #374151;
}

.filter-actions {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
}

.btn-reset,
.btn-advanced {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #2d3748;
    color: #e5e7eb;
}

.btn-reset:hover {
    background: #3f4a5c;
    border-color: #6b7280;
    color: #f3f4f6;
}

.btn-advanced:hover {
    background: #06b6d4;
    color: #0f172a;
    border-color: #06b6d4;
}

.btn-reset svg,
.btn-advanced svg {
    flex-shrink: 0;
}

/* Sección de Filtros Avanzados */
.advanced-filters-section {
    background: #2d3748;
    border: 1px solid #4b5563;
    border-radius: 10px;
    padding: 20px;
    margin-top: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.advanced-filters-section h3 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #06b6d4;
}

.advanced-filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.advanced-filter-actions {
    display: flex;
    justify-content: flex-start;
    padding-top: 12px;
    border-top: 1px solid #4b5563;
}

.btn-reset-advanced {
    padding: 8px 16px;
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-reset-advanced:hover {
    background: rgba(245, 158, 11, 0.25);
    border-color: #f59e0b;
}

/* Sección de Cards */
.cards-section {
    background: linear-gradient(135deg, #1a202c 0%, #1f2937 100%);
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
    margin-bottom: 28px;
}

.cards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #374151;
}

.cards-section h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f3f4f6;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
}

.cards-section h3 svg {
    color: #06b6d4;
    flex-shrink: 0;
}

.cards-count {
    display: inline-flex;
    align-items: center;
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.loading {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
}

.loader-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 16px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #0f766e;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading p {
    margin: 0;
    font-size: 0.95rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 18px;
    margin-bottom: 20px;
}

.maintenance-card {
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 10px;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: flex;
    flex-direction: column;
}

.card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
    transition: height 0.3s ease;
}

.maintenance-card:hover {
    border-color: #06b6d4;
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.2);
    transform: translateY(-4px);
}

.maintenance-card:hover .card-accent {
    height: 4px;
}

.maintenance-card.active {
    border-color: #06b6d4;
    background: #374151;
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.25);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 16px 12px;
    gap: 12px;
}

.card-title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
}

.card-no {
    font-size: 0.8rem;
    font-weight: 700;
    color: #06b6d4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.card-equipo {
    font-size: 0.95rem;
    font-weight: 700;
    color: #f3f4f6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-status {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 6px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.card-status.activo {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
}

.card-status.inactivo {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px;
    flex: 1;
}

.card-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.card-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.card-value {
    font-size: 0.9rem;
    color: #e5e7eb;
    font-weight: 600;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-cnis {
    background: rgba(6, 182, 212, 0.15);
    color: #06b6d4;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    border: 1px solid rgba(6, 182, 212, 0.3);
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #4b5563;
    background: #1f2937;
}

.maintenance-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.3px;
}

.maintenance-badge.preventivo {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.maintenance-badge.correctivo {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.functional-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
}

.indicator-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
}

.functional-indicator.si .indicator-dot {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.functional-indicator.no .indicator-dot {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 2px solid #374151;
}

.btn-pagination {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #e5e7eb;
}

.btn-pagination:hover:not(:disabled) {
    background: #06b6d4;
    border-color: #06b6d4;
    color: #0f172a;
}

.btn-pagination:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-pagination svg {
    flex-shrink: 0;
}

.page-info {
    font-size: 0.9rem;
    color: #d1d5db;
    font-weight: 600;
    min-width: 120px;
    text-align: center;
}

/* Sección de Detalles */
.details-section {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 2px solid #06b6d4;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
    margin-top: 28px;
}

.details-section h3 {
    margin: 0 0 24px 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #06b6d4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.detail-group {
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 10px;
    padding: 18px;
    transition: all 0.2s ease;
}

.detail-group:hover {
    border-color: #06b6d4;
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
}

.detail-group.full-width {
    grid-column: 1 / -1;
}

.detail-group h4 {
    margin: 0 0 14px 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #06b6d4;
    border-bottom: 2px solid #06b6d4;
    padding-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #3f475a;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 700;
    color: #9ca3af;
    flex: 0 0 45%;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.3px;
}

.detail-value {
    color: #e5e7eb;
    flex: 1;
    text-align: right;
    word-wrap: break-word;
    padding-left: 12px;
    font-weight: 600;
}

.btn-close-details {
    padding: 10px 16px;
    background: #4b5563;
    color: #e5e7eb;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-close-details:hover {
    background: #6b7280;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* No results */
.no-results {
    background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
    border: 1.5px solid #4b5563;
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    color: #d1d5db;
}

.no-results svg {
    margin: 0 auto 16px;
    color: #6b7280;
}

.no-results p {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
}
</style>
