<template>
    <div class="order-management-container">
        <ActionPanel class="order-management-main">
            <template #title>
                <div class="title-row">
                    <button class="btn-back-to-dashboard" @click="goToDashboard" title="Volver al dashboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <span>Gestión de Órdenes de Entrada</span>
                    <button class="btn-create-order" @click="goToCreateOrder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nueva Orden
                    </button>
                </div>
            </template>

            <Breadcrumbs />

            <!-- Filtros: estructura elegante con 3 columnas -->
            <div class="filters-section">
                <!-- Filtros principales (siempre visibles) -->
                <div class="filter-group filter-group-narrow">
                    <label>Folio de operación:</label>
                    <input v-model="filterFolio" class="control filter-input" placeholder="Ej. 5-011" />
                </div>
                <div class="filter-group filter-group-narrow">
                    <label>Nombre del solicitante:</label>
                    <input v-model="filterSolicitante" class="control filter-input" placeholder="Ej. Dr. Juan Pérez" />
                </div>
                <div class="filter-group filter-group-compact">
                    <label>Filtrar por fecha:</label>
                    <div style="display: flex; gap: 8px; align-items: flex-end;">
                        <DatePicker v-model="filterDateDisplay" placeholder="Seleccionar fecha" />
                        <!-- Botón Añadir filtros aquí -->
                        <div class="dropdown-container" @click.stop style="min-width: fit-content;"
                            ref="filterDropdownRef">
                            <button class="btn-add-filters compact" @click="showMoreFilters = !showMoreFilters"
                                :aria-expanded="showMoreFilters"
                                :class="{ 'has-active-filters': hasActiveAdvancedFilters }">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M22 3H2l8 9v7l4 2v-9l8-9z" fill="currentColor" />
                                </svg>
                                <span v-if="hasActiveAdvancedFilters" class="filter-badge">{{ activeFiltersList.length
                                }}</span>
                            </button>

                            <!-- Dropdown de filtros disponibles -->
                            <div v-if="showMoreFilters" class="filters-dropdown-new">
                                <div class="dropdown-header-new">
                                    <h4 class="dropdown-title-new">Filtros Disponibles</h4>
                                    <button type="button" class="btn-close-dropdown-new"
                                        @click="showMoreFilters = false" aria-label="Cerrar">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div class="dropdown-content-new">
                                    <div class="filter-group-section">
                                        <div class="section-label">Información de Solicitud</div>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterServiceActive" />
                                            <span>Servicio</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterEspecialidadActive" />
                                            <span>Especialidad</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterIngenieroActive" />
                                            <span>Ingeniero residente</span>
                                        </label>
                                    </div>
                                    <div class="filter-group-section">
                                        <div class="section-label">Detalles de Orden</div>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterMotivoActive" />
                                            <span>Motivo de entrada</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterObservacionesActive" />
                                            <span>Observaciones</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterHoraActive" />
                                            <span>Rango de horas</span>
                                        </label>
                                    </div>
                                    <div class="filter-group-section">
                                        <div class="section-label">Características de Equipos</div>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterTipoActive" />
                                            <span>Tipo de artículo</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterMarcaActive" />
                                            <span>Marca</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterModeloActive" />
                                            <span>Modelo</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterUbicacionActive" />
                                            <span>Ubicación</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterClaveHRAEIActive" />
                                            <span>Clave HRAEI</span>
                                        </label>
                                        <label class="checkbox-item-new">
                                            <input type="checkbox" v-model="filterItemTextActive" />
                                            <span>Búsqueda en artículos</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="dropdown-footer-new">
                                    <button type="button" class="btn-listo-new"
                                        @click="showMoreFilters = false">Listo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filtros activos en el mismo grid (respeta las 3 columnas) -->
                <template v-for="(f, idx) in activeFiltersList" :key="f.key">
                    <div class="filter-group active-filter-inline">
                        <label>{{ f.label }}</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <div style="flex: 1;">
                                <template v-if="f.key === 'service'">
                                    <input v-model="filterService" class="control filter-input"
                                        placeholder="Ej. Urgencias..." />
                                </template>
                                <template v-else-if="f.key === 'especialidad'">
                                    <input v-model="filterEspecialidad" class="control filter-input"
                                        placeholder="Ej. Traumatología..." />
                                </template>
                                <template v-else-if="f.key === 'motivo'">
                                    <CustomSelect v-model="filterMotivo" :options="motivoEntradaOptions"
                                        placeholder="(Seleccionar)" class="filter-input" />
                                </template>
                                <template v-else-if="f.key === 'obs'">
                                    <input v-model="filterObservaciones" class="control filter-input"
                                        placeholder="Buscar en observaciones" />
                                </template>
                                <template v-else-if="f.key === 'ing'">
                                    <input v-model="filterIngeniero" class="control filter-input"
                                        placeholder="Buscar nombre" />
                                </template>
                                <template v-else-if="f.key === 'tipo'">
                                    <CustomSelect v-model="filterTipo" :options="tipoOptions" placeholder="Todos"
                                        class="filter-input" />
                                </template>
                                <template v-else-if="f.key === 'itemText'">
                                    <input v-model="filterItemText" class="control filter-input"
                                        placeholder="Nombre, modelo, serie..." />
                                </template>
                                <template v-else-if="f.key === 'hora'">
                                    <div class="hora-range">
                                        <input v-model="filterHoraInicioFrom" type="time"
                                            class="control filter-input" />
                                        <input v-model="filterHoraInicioTo" type="time" class="control filter-input" />
                                    </div>
                                </template>
                                <template v-else-if="f.key === 'marca'">
                                    <input v-model="filterMarca" class="control filter-input"
                                        placeholder="Ej. Philips..." />
                                </template>
                                <template v-else-if="f.key === 'modelo'">
                                    <input v-model="filterModelo" class="control filter-input"
                                        placeholder="Ej. MX40..." />
                                </template>
                                <template v-else-if="f.key === 'ubicacion'">
                                    <input v-model="filterUbicacion" class="control filter-input"
                                        placeholder="Ej. UCIA..." />
                                </template>
                                <template v-else-if="f.key === 'claveHRAEI'">
                                    <input v-model="filterClaveHRAEI" class="control filter-input"
                                        placeholder="Ej. COMODATO..." />
                                </template>
                            </div>
                            <button type="button" class="btn-remove-filter" @click="removeActiveFilter(f.key)"
                                title="Remover filtro">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Botón Limpiar todos (debajo de filtros si hay activos) -->
                <transition name="fade-in">
                    <div v-if="activeFiltersList.length > 0"
                        style="grid-column: 1 / -1; display: flex; justify-content: flex-end;">
                        <button type="button" class="btn-clear-filters" @click="clearAllFilters">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path
                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                </path>
                            </svg>
                            <span>Limpiar</span>
                        </button>
                    </div>
                </transition>
            </div>

            <!-- Datatable -->
            <OrdersTable :filtered-orders="filteredOrders" :show-column-service="showColumnService"
                :show-column-especialidad="showColumnEspecialidad" :show-column-motivo="showColumnMotivo"
                :show-column-descripcion="showColumnDescripcion" :show-column-observaciones="showColumnObservaciones"
                :show-column-ingeniero="showColumnIngeniero" :show-column-hora="showColumnHora"
                :show-column-tipo="showColumnTipo" :show-column-items="showColumnItems"
                :show-column-estado="showColumnEstado"
                :empty-state-message="searchTerm || filterDate || filterService ? 'No se encontraron órdenes con los filtros seleccionados.' : 'Comienza creando una nueva orden.'"
                @edit="openEditModal" @excel="downloadExcel" @delete="deleteOrder"
                @deleteMultiple="handleDeleteMultipleWithModal" @create="goToCreateOrder" />
        </ActionPanel>

        <!-- Modal embebiendo OpEntrada con todas sus funcionalidades -->
        <ModalBase :open="showEditModal" @close="handleModalClose" :maxWidth="1100" :height="'92vh'">
            <OpEntrada ref="opEntradaRef" :ordenId="selectedOrderId" :modo="'editar'" @actualizado="onOrderUpdated"
                @close="closeEditModal" />
        </ModalBase>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'
import { useRouter } from 'vue-router'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import DatePicker from '@/components/DatePicker.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import OrdersTable from '@/components/OrdersTable.vue'
import ModalBase from '@/components/ModalBase.vue'
import { confirmDelete, showSuccess } from '@/utils/sweetAlertConfig'
const OpEntrada = defineAsyncComponent(() => import('@/views/operations/OpEntrada.vue'))

const router = useRouter()

const allOrders = ref([])

// Función para normalizar folios para búsqueda flexible
// Convierte "E-000912" -> "E-912" y "E-912" -> "E-912" para comparación
function normalizeFolio(folio) {
    if (!folio || typeof folio !== 'string') return ''
    
    // Si parece un folio (E- seguido de números)
    const folioMatch = folio.match(/^(E-)?(\d+)$/i)
    if (folioMatch) {
        const prefix = 'E-'
        const number = parseInt(folioMatch[2], 10) // Elimina ceros a la izquierda
        return `${prefix}${number}`
    }
    
    return folio.toLowerCase()
}

// Función para verificar si una búsqueda coincide con un folio (flexible)
function folioMatches(orderFolio, searchTerm) {
    if (!orderFolio || !searchTerm) return false
    
    const searchLower = searchTerm.toLowerCase()
    const orderFolioLower = orderFolio.toLowerCase()
    
    // Búsqueda exacta (case-insensitive)
    if (orderFolioLower.includes(searchLower)) return true
    
    // Búsqueda normalizada (para casos como E-912 vs E-000912)
    const normalizedSearch = normalizeFolio(searchTerm)
    const normalizedOrder = normalizeFolio(orderFolio)
    
    return normalizedOrder.includes(normalizedSearch)
}

const filterFolio = ref('')
const filterSolicitante = ref('')
const tipoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Equipo Médico', value: 'equipo-medico' },
    { label: 'Mobiliario', value: 'mobiliario' },
    { label: 'Accesorio', value: 'accesorio' },
    { label: 'Consumible', value: 'consumible' },
    { label: 'Refacción', value: 'refaccion' }
]

const estadoOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Proceso', value: 'en-proceso' },
    { label: 'Completado', value: 'completado' }
]
const searchTerm = ref('') // keep general fallback search
const showMoreFilters = ref(false)
const filterDate = ref('')
const filterDateDisplay = ref('')
const filterService = ref('')
const filterEspecialidad = ref('')
const filterMotivo = ref('')
const filterObservaciones = ref('')
const filterIngeniero = ref('')
const filterServiceActive = ref(false)
const filterEspecialidadActive = ref(false)
const filterMotivoActive = ref(false)
const filterObservacionesActive = ref(false)
const filterIngenieroActive = ref(false)
const filterTipoActive = ref(true)  // Activado por defecto
const filterItemTextActive = ref(false)
const filterHoraActive = ref(false)
const filterMarcaActive = ref(false)
const filterModeloActive = ref(false)
const filterUbicacionActive = ref(false)
const filterClaveHRAEIActive = ref(false)
const filterEstado = ref('')
const filterHoraInicioFrom = ref('')
const filterHoraInicioTo = ref('')
const filterMarca = ref('')
const filterModelo = ref('')
const filterUbicacion = ref('')
const filterClaveHRAEI = ref('')
const filterMinItems = ref(null)
const filterMaxItems = ref(null)
const filterTipo = ref('')
const filterItemText = ref('')
const loading = ref(true)
const showEditModal = ref(false)
const editingOrder = ref(null)
const selectedOrderId = ref(null)
const newEditItem = ref({ tipo: '', cantidad: 1, descripcion: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', claveHRAEI: '', unidades: [] })
const editingItemIndex = ref(-1)
const filterDropdownRef = ref(null)
const opEntradaRef = ref(null)

// Keep a normalized date in `filterDate` for comparisons (DD-MM-YYYY format from database)
watch(filterDateDisplay, (val) => {
    console.log('=== WATCH filterDateDisplay ===')
    console.log('Raw value:', val)
    console.log('Type:', typeof val)
    console.log('String representation:', String(val))
    
    if (!val) {
        filterDate.value = ''
        return
    }
    
    // Expecting DatePicker display in dd/mm/yyyy
    const parts = String(val).split('/')
    console.log('Split by /:', parts)
    
    if (parts.length === 3) {
        const dd = parts[0].padStart(2, '0')
        const mm = parts[1].padStart(2, '0')
        const yyyy = parts[2]
        filterDate.value = `${dd}-${mm}-${yyyy}`
        console.log('Result (from /):', filterDate.value)
    } else {
        console.log('No / found, trying Date object...')
        // fallback: try to parse native ISO
        try {
            const d = new Date(val)
            console.log('Date object:', d)
            console.log('Is valid:', !isNaN(d.getTime()))
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear()
                const mm = String(d.getMonth() + 1).padStart(2, '0')
                const dd = String(d.getDate()).padStart(2, '0')
                filterDate.value = `${dd}-${mm}-${yyyy}`
                console.log('Result (from Date):', filterDate.value)
            } else {
                filterDate.value = ''
            }
        } catch {
            filterDate.value = ''
        }
    }
}, { immediate: true })

// Columns visibility computed from active filters
const showColumnService = computed(() => filterServiceActive.value)
const showColumnHora = computed(() => filterHoraActive.value)
const showColumnItems = computed(() => filterTipoActive.value || filterItemTextActive.value || filterMinItems.value != null || filterMaxItems.value != null)
const showColumnEstado = computed(() => !!filterEstado.value)
const showColumnEspecialidad = computed(() => filterEspecialidadActive.value)
const showColumnMotivo = computed(() => filterMotivoActive.value)
const showColumnDescripcion = computed(() => filterMotivoActive.value || filterObservacionesActive.value)
const showColumnObservaciones = computed(() => filterObservacionesActive.value)
const showColumnIngeniero = computed(() => filterIngenieroActive.value)
const showColumnTipo = computed(() => filterTipoActive.value)

// Build a list of active filters to render under the main inputs
const activeFiltersList = computed(() => {
    const list = []
    if (filterServiceActive.value) list.push({ key: 'service', label: 'Servicio', type: 'input', bindings: { modelValue: filterService, 'onUpdate:modelValue': val => filterService.value = val, class: 'control filter-input', placeholder: 'Ej. Urgencias...' } })
    if (filterEspecialidadActive.value) list.push({ key: 'especialidad', label: 'Especialidad', type: 'input', bindings: { modelValue: filterEspecialidad, 'onUpdate:modelValue': val => filterEspecialidad.value = val, class: 'control filter-input', placeholder: 'Ej. Traumatología...' } })
    if (filterMotivoActive.value) list.push({ key: 'motivo', label: 'Motivo de entrada', type: 'select', bindings: { modelValue: filterMotivo, 'onUpdate:modelValue': val => filterMotivo.value = val, class: 'control filter-input' } })
    if (filterObservacionesActive.value) list.push({ key: 'obs', label: 'Observaciones', type: 'input', bindings: { modelValue: filterObservaciones, 'onUpdate:modelValue': val => filterObservaciones.value = val, class: 'control filter-input', placeholder: 'Buscar en observaciones' } })
    if (filterIngenieroActive.value) list.push({ key: 'ing', label: 'Ingeniero residente', type: 'input', bindings: { modelValue: filterIngeniero, 'onUpdate:modelValue': val => filterIngeniero.value = val, class: 'control filter-input', placeholder: 'Buscar nombre' } })
    if (filterTipoActive.value) list.push({ key: 'tipo', label: 'Tipo de artículo', type: 'select', bindings: { modelValue: filterTipo, 'onUpdate:modelValue': val => filterTipo.value = val, class: 'control filter-input' } })
    if (filterItemTextActive.value) list.push({ key: 'itemText', label: 'Buscar en artículos', type: 'input', bindings: { modelValue: filterItemText, 'onUpdate:modelValue': val => filterItemText.value = val, class: 'control filter-input', placeholder: 'Nombre, modelo, serie...' } })
    if (filterHoraActive.value) list.push({ key: 'hora', label: 'Hora inicio (rango)', type: 'hora-range', bindings: {} })
    if (filterMarcaActive.value) list.push({ key: 'marca', label: 'Marca de equipos', type: 'input', bindings: { modelValue: filterMarca, 'onUpdate:modelValue': val => filterMarca.value = val, class: 'control filter-input', placeholder: 'Ej. Philips...' } })
    if (filterModeloActive.value) list.push({ key: 'modelo', label: 'Modelo de equipos', type: 'input', bindings: { modelValue: filterModelo, 'onUpdate:modelValue': val => filterModelo.value = val, class: 'control filter-input', placeholder: 'Ej. MX40...' } })
    if (filterUbicacionActive.value) list.push({ key: 'ubicacion', label: 'Ubicación de equipos', type: 'input', bindings: { modelValue: filterUbicacion, 'onUpdate:modelValue': val => filterUbicacion.value = val, class: 'control filter-input', placeholder: 'Ej. UCIA...' } })
    if (filterClaveHRAEIActive.value) list.push({ key: 'claveHRAEI', label: 'Clave HRAEI', type: 'input', bindings: { modelValue: filterClaveHRAEI, 'onUpdate:modelValue': val => filterClaveHRAEI.value = val, class: 'control filter-input', placeholder: 'Ej. COMODATO...' } })
    return list
})

const hasActiveAdvancedFilters = computed(() => {
    return (
        filterServiceActive.value ||
        filterEspecialidadActive.value ||
        filterMotivoActive.value ||
        filterObservacionesActive.value ||
        filterIngenieroActive.value ||
        filterTipoActive.value ||
        filterItemTextActive.value ||
        filterHoraActive.value ||
        filterMarcaActive.value ||
        filterModeloActive.value ||
        filterUbicacionActive.value ||
        filterClaveHRAEIActive.value
    )
})

const hasActiveFilters = computed(() => {
    return (
        filterFolio.value ||
        filterSolicitante.value ||
        searchTerm.value ||
        filterDate.value ||
        filterTipo.value ||
        filterItemText.value ||
        filterEstado.value ||
        filterHoraInicioFrom.value ||
        filterHoraInicioTo.value ||
        filterServiceActive.value ||
        filterEspecialidadActive.value ||
        filterMotivoActive.value ||
        filterObservacionesActive.value ||
        filterIngenieroActive.value ||
        filterTipoActive.value ||
        filterItemTextActive.value ||
        filterHoraActive.value ||
        filterMarcaActive.value ||
        filterModeloActive.value ||
        filterUbicacionActive.value ||
        filterClaveHRAEIActive.value ||
        filterMarca.value ||
        filterModelo.value ||
        filterUbicacion.value ||
        filterClaveHRAEI.value
    )
})

const filteredOrders = computed(() => {
    return allOrders.value.filter(order => {
        // Filtrado flexible de folio - permite buscar E-912 para encontrar E-000912
        const matchFolio = !filterFolio.value || folioMatches(order.folio, filterFolio.value)
        
        const matchSolicitante = !filterSolicitante.value || order.nombreSolicitante?.toLowerCase().includes(filterSolicitante.value.toLowerCase())
        
        // Búsqueda general también con normalización de folios
        const matchSearch = !searchTerm.value || (
            folioMatches(order.folio, searchTerm.value) || 
            order.nombreSolicitante?.toLowerCase().includes(searchTerm.value.toLowerCase())
        )

        const matchDate = !filterDate.value || order.fecha === filterDate.value
        if (filterDate.value && order.folio) {
            console.log(`Comparando fecha para ${order.folio}: BD="${order.fecha}" vs Filtro="${filterDate.value}" => ${matchDate ? 'MATCH' : 'NO MATCH'}`)
        }

        const matchService = !filterServiceActive.value || !filterService.value || order.servicio?.toLowerCase().includes(filterService.value.toLowerCase())
        const matchEspecialidad = !filterEspecialidadActive.value || !filterEspecialidad.value || order.especialidad?.toLowerCase().includes(filterEspecialidad.value.toLowerCase())
        const matchMotivo = !filterMotivoActive.value || !filterMotivo.value || ((order.motivoEntrada || '').toLowerCase() === filterMotivo.value.toLowerCase())
        const matchObservaciones = !filterObservacionesActive.value || !filterObservaciones.value || ((order.observaciones || '').toLowerCase().includes(filterObservaciones.value.toLowerCase()))
        const matchIngeniero = !filterIngenieroActive.value || !filterIngeniero.value || ((order.nombreIngeniero || '').toLowerCase().includes(filterIngeniero.value.toLowerCase()))
        const matchEstado = !filterEstado.value || (order.estado || '').toLowerCase() === filterEstado.value.toLowerCase()
        const matchHoraFrom = !filterHoraActive.value || !filterHoraInicioFrom.value || (order.horaInicio && order.horaInicio >= filterHoraInicioFrom.value)
        const matchHoraTo = !filterHoraActive.value || !filterHoraInicioTo.value || (order.horaInicio && order.horaInicio <= filterHoraInicioTo.value)

        const matchTipo = !filterTipoActive.value || !filterTipo.value || (order.equiposEntrada || []).some(e => e.tipo === filterTipo.value)
        const matchItemText = !filterItemTextActive.value || !filterItemText.value || (order.equiposEntrada || []).some(e => {
            const search = filterItemText.value.toLowerCase()
            return String(e.descripcion || e.nombre || '').toLowerCase().includes(search)
                || String(e.modelo || '').toLowerCase().includes(search)
                || String(e.serie || e.lote || '').toLowerCase().includes(search)
                || String(e.marca || '').toLowerCase().includes(search)
        })
        const matchMarca = !filterMarcaActive.value || !filterMarca.value || (order.equiposEntrada || []).some(e => {
            const search = filterMarca.value.toLowerCase()
            return String(e.marca || '').toLowerCase().includes(search)
        })
        const matchModelo = !filterModeloActive.value || !filterModelo.value || (order.equiposEntrada || []).some(e => {
            const search = filterModelo.value.toLowerCase()
            return String(e.modelo || '').toLowerCase().includes(search)
        })
        const matchUbicacion = !filterUbicacionActive.value || !filterUbicacion.value || (order.equiposEntrada || []).some(e => {
            const search = filterUbicacion.value.toLowerCase()
            return String(e.ubicacion || '').toLowerCase().includes(search)
        })
        const matchClaveHRAEI = !filterClaveHRAEIActive.value || !filterClaveHRAEI.value || (order.equiposEntrada || []).some(e => {
            const search = filterClaveHRAEI.value.toLowerCase()
            return String(e.claveHRAEI || '').toLowerCase().includes(search)
        })
        const itemCount = (order.equiposEntrada || []).length || 0
        const matchMin = filterMinItems.value == null || filterMinItems.value === '' || itemCount >= Number(filterMinItems.value)
        const matchMax = filterMaxItems.value == null || filterMaxItems.value === '' || itemCount <= Number(filterMaxItems.value)
        return matchFolio && matchSolicitante && matchSearch && matchDate && matchService && matchEspecialidad && matchMotivo && matchObservaciones && matchIngeniero && matchTipo && matchItemText && matchEstado && matchHoraFrom && matchHoraTo && matchMin && matchMax && matchMarca && matchModelo && matchUbicacion && matchClaveHRAEI
    })
})

function formatDate(dateStr) {
    if (!dateStr) return '-'
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-MX')
    } catch {
        return dateStr
    }
}

function goToCreateOrder() {
    router.push({ name: 'op-entrada', query: { from: 'order-management' } })
}

function goToDashboard() {
    router.push({ name: 'dashboard' })
}

function closeFiltersDropdown() {
    showMoreFilters.value = false
}

function openEditModal(order) {
    editingOrder.value = JSON.parse(JSON.stringify(order))
    showEditModal.value = true
    // Preferir folio como identificador; fallback a id por compatibilidad
    selectedOrderId.value = order?.folio ?? order?.id ?? null
}

function closeEditModal() {
    showEditModal.value = false
    editingOrder.value = null
    selectedOrderId.value = null
}

// Maneja el intento de cierre del modal (botón X o overlay)
async function handleModalClose() {
    // Si hay una referencia a OpEntrada, llamar a handleCloseAttempt
    if (opEntradaRef.value && opEntradaRef.value.handleCloseAttempt) {
        await opEntradaRef.value.handleCloseAttempt()
    } else {
        closeEditModal()
    }
}

function onOrderUpdated(updated) {
    // Actualiza la lista y cierra modal
    if (!updated) {
        closeEditModal()
        return
    }
    const index = allOrders.value.findIndex(o => String(o.id) === String(updated.id))
    if (index !== -1) {
        allOrders.value[index] = updated
    } else {
        allOrders.value.unshift(updated)
    }
    // Persistencia ligera
    tryPersistUpdatedOrder(updated)
    closeEditModal()
}

function updateAndDownloadExcel() {
    const index = allOrders.value.findIndex(o => o.id === editingOrder.value.id)
    if (index !== -1) {
        allOrders.value[index] = editingOrder.value
        // Generar y descargar el Excel corregido
        downloadExcelWithData(editingOrder.value)
        closeEditModal()
        // Try to persist the updated order back to backend or localStorage
        tryPersistUpdatedOrder(editingOrder.value)
    }
}

function downloadExcel(order) {
    console.log('Descargar Excel:', order.id)
    downloadExcelWithData(order)
}

function downloadExcelWithData(order) {
    console.log('Generando Excel para orden:', order.folio)
    // Aquí va la lógica para generar y descargar el Excel
    // Usar librería como exceljs o xlsxpopulate
    // Por ahora: simulación
    const fileName = `Orden_${order.folio}_${new Date().toISOString().slice(0, 10)}.xlsx`
    console.log('Excel descargado:', fileName)
}

async function deleteOrder(orderId) {
    const result = await confirmDelete('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')

    if (result.isConfirmed) {
        allOrders.value = allOrders.value.filter(o => o.id !== orderId)
        console.log('Orden eliminada:', orderId)
        try {
            const raw = localStorage.getItem('orders_list')
            if (raw) {
                const arr = JSON.parse(raw)
                const updated = arr.filter(o => String(o.id) !== String(orderId))
                localStorage.setItem('orders_list', JSON.stringify(updated))
            }
        } catch (e) { }

        showSuccess('Eliminado', 'La orden ha sido eliminada correctamente.')
    }
}

async function handleDeleteMultipleWithModal(orderIds) {
    const count = orderIds.length
    const msg = `¿Está seguro de que deseas eliminar ${count} orden${count !== 1 ? 'es' : ''}? Esta acción no se puede deshacer.`

    const result = await confirmDelete(msg, count)

    if (result.isConfirmed) {
        await deleteMultipleOrders(orderIds)

        const successMsg = `${count} orden${count !== 1 ? 'es' : ''} ha${count !== 1 ? 'n' : ''} sido eliminada${count !== 1 ? 's' : ''} correctamente.`
        showSuccess('Eliminado', successMsg)
    }
}

function deleteMultipleOrders(orderIds) {
    const count = orderIds.length
    // Eliminar del estado local
    allOrders.value = allOrders.value.filter(o => !orderIds.includes(o.id))
    console.log(`${count} orden${count !== 1 ? 'es' : ''} eliminada${count !== 1 ? 's' : ''}:`, orderIds)

    // Actualizar localStorage
    try {
        const raw = localStorage.getItem('orders_list')
        if (raw) {
            const arr = JSON.parse(raw)
            const updated = arr.filter(o => !orderIds.includes(String(o.id)))
            localStorage.setItem('orders_list', JSON.stringify(updated))
        }
    } catch (e) {
        console.warn('Error updating localStorage after multi-delete:', e)
    }
}

async function tryPersistUpdatedOrder(order) {
    try {
        const res = await fetch('/api/ops/entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        })
        if (res.ok) {
            console.log('Order updated and saved to server')
            return
        }
    } catch (err) {
        // ignore - fallback to local
    }
    // Save to localStorage array
    try {
        const raw = localStorage.getItem('orders_list')
        const arr = raw ? JSON.parse(raw) : []
        // ensure id
        if (!order.id) order.id = Date.now()
        const idx = arr.findIndex(o => o.id === order.id)
        if (idx === -1) arr.push(order)
        else arr[idx] = order
        localStorage.setItem('orders_list', JSON.stringify(arr))
    } catch (e) {
        console.warn('Failed to persist order locally', e)
    }
}

function onEditObservacionesImgChange(event) {
    const file = event.target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            editingOrder.value.observacionesImg = {
                name: file.name,
                dataUrl: e.target?.result
            }
        }
        reader.readAsDataURL(file)
    }
}

function removeEditObservacionesImg() {
    editingOrder.value.observacionesImg = null
}

function clearFilters() {
    // Reset basic filters
    searchTerm.value = ''
    filterDate.value = ''
    filterFolio.value = ''
    filterSolicitante.value = ''
    // Reset more filters
    filterService.value = ''
    filterServiceActive.value = false
    filterEspecialidad.value = ''
    filterEspecialidadActive.value = false
    filterMotivo.value = ''
    filterMotivoActive.value = false
    filterObservaciones.value = ''
    filterObservacionesActive.value = false
    filterIngeniero.value = ''
    filterIngenieroActive.value = false
    filterTipo.value = ''
    filterTipoActive.value = false
    filterItemText.value = ''
    filterItemTextActive.value = false
    filterMinItems.value = null
    filterMaxItems.value = null
    filterEstado.value = ''
    filterHoraInicioFrom.value = ''
    filterHoraInicioTo.value = ''
    filterHoraActive.value = false
    filterMarca.value = ''
    filterMarcaActive.value = false
    filterModelo.value = ''
    filterModeloActive.value = false
    filterUbicacion.value = ''
    filterUbicacionActive.value = false
    filterClaveHRAEI.value = ''
    filterClaveHRAEIActive.value = false
    // do not automatically close the panel when clearing — allow user to adjust further
}

function clearAllFilters() {
    clearFilters()
    showMoreFilters.value = false
}

function removeActiveFilter(key) {
    if (key === 'service') filterServiceActive.value = false
    else if (key === 'especialidad') filterEspecialidadActive.value = false
    else if (key === 'motivo') filterMotivoActive.value = false
    else if (key === 'obs') filterObservacionesActive.value = false
    else if (key === 'ing') filterIngenieroActive.value = false
    else if (key === 'tipo') filterTipoActive.value = false
    else if (key === 'itemText') filterItemTextActive.value = false
    else if (key === 'hora') filterHoraActive.value = false
    else if (key === 'marca') filterMarcaActive.value = false
    else if (key === 'modelo') filterModeloActive.value = false
    else if (key === 'ubicacion') filterUbicacionActive.value = false
    else if (key === 'claveHRAEI') filterClaveHRAEIActive.value = false
}

function applyFilters() {
    // Currently filters are reactive; applying just closes the panel to show results
    showMoreFilters.value = false
}

function addEditItem() {
    if (!editingOrder.value) return
    const copy = JSON.parse(JSON.stringify(newEditItem.value))
    if (!editingOrder.value.equiposEntrada) editingOrder.value.equiposEntrada = []
    editingOrder.value.equiposEntrada.push(copy)
    // reset
    newEditItem.value = { tipo: '', cantidad: 1, descripcion: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', claveHRAEI: '', unidades: [] }
}

async function removeEditItem(idx) {
    if (!editingOrder.value) return
    const result = await confirmDelete('Eliminar artículo', '¿Eliminar este artículo de la orden?')
    if (result.isConfirmed) {
        editingOrder.value.equiposEntrada.splice(idx, 1)
    }
}

function toggleEditItem(idx) {
    editingItemIndex.value = editingItemIndex.value === idx ? -1 : idx
}

// Simular carga de órdenes desde API
function loadOrders() {
    loading.value = true
    
    // Try to fetch from backend - solo órdenes reales de la BD
    setTimeout(async () => {
        try {
            const res = await fetch('/api/ops/entrada/list')
            if (res.ok) {
                const body = await res.json()
                // body.items es un array de { orden, items: [...] }
                const items = Array.isArray(body.items) ? body.items : []
                // Extraer órdenes reales de la BD CON sus items
                allOrders.value = items.map((wrapper) => {
                    const orden = wrapper.orden || {}
                    const orderItems = Array.isArray(wrapper.items) ? wrapper.items : []
                    
                    // Mapear items a estructura de equiposEntrada
                    const equiposEntrada = orderItems.map(item => ({
                        id: `${item.orden_folio}-${item.line}`, // ID compuesto para compatibilidad
                        tipo: item.tipo || 'N/A',
                        cantidad: item.cantidad || 1,
                        descripcion: item.descripcion || 'N/A',
                        marca: item.marca || 'N/A',
                        modelo: item.modelo || 'N/A',
                        serie: item.serie || 'N/A',
                        lote: item.lote || 'N/A',
                        referencia: item.referencia || 'N/A',
                        ubicacion: item.ubicacion || 'N/A',
                        claveHRAEI: item.clave_hraei || 'N/A'
                    }))
                    
                    console.log(`Orden cargada - folio: ${orden.folio}, fecha raw: "${orden.fecha}"`)
                    
                    return {
                        id: orden.folio || orden.id, // Usar folio como ID primario
                        folio: orden.folio || 'N/A',
                        nombreSolicitante: orden.nombre_solicitante || 'N/A',
                        servicio: orden.servicio || 'N/A',
                        especialidad: orden.especialidad || 'N/A',
                        fecha: orden.fecha || 'N/A',
                        horaInicio: orden.hora_inicio || 'N/A',
                        horaTermino: orden.hora_termino || 'N/A',
                        motivoEntrada: orden.motivo_entrada || 'N/A',
                        descripcion: orden.descripcion || 'N/A',
                        observaciones: orden.observaciones || 'N/A',
                        nombreIngeniero: orden.nombre_ingeniero || 'N/A',
                        equiposEntrada: equiposEntrada,
                        estado: 'completado'
                    }
                })
            } else {
                // Si no hay órdenes en BD, mostrar lista vacía
                allOrders.value = []
            }
        } catch (err) {
            console.warn('Error cargando órdenes:', err)
            // Si hay error en el backend, mostrar lista vacía en lugar de datos mock
            allOrders.value = []
        } finally {
            loading.value = false
        }
    }, 300)
}

onMounted(() => {
    loadOrders()

    // Cerrar dropdown cuando se hace click fuera
    function handleDocumentClick(event) {
        if (filterDropdownRef.value && !filterDropdownRef.value.contains(event.target)) {
            showMoreFilters.value = false
        }
    }

    document.addEventListener('click', handleDocumentClick)

    // Limpiar listener cuando se desmonta el componente
    return () => {
        document.removeEventListener('click', handleDocumentClick)
    }
})
</script>

<style scoped>
.order-management-container {
    width: 100%;
}

.order-management-main {
    padding: 20px;
}

.title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.btn-create-order {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #2edd5a, #4cdc82);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.btn-create-order:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.3);
}

.btn-back-to-dashboard {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(74, 144, 226, 0.15));
    color: rgba(76, 186, 150, 0.9);
    border: 1px solid rgba(76, 186, 150, 0.4);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.btn-back-to-dashboard:hover {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.25));
    border-color: rgba(76, 186, 150, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 186, 150, 0.2);
}

.btn-back-to-dashboard:active {
    transform: translateY(0);
}

/* ===== INPUT DE FECHA CON GLASSMORPHISM ===== */
:deep(input[type="date"]) {
    position: relative !important;
    background: rgba(15, 20, 40, 0.65) !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 14px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    color-scheme: dark !important;
    padding: 12px 18px !important;
}

:deep(input[type="date"]:hover) {
    border-color: #06b6d4 !important;
    box-shadow:
        0 6px 8px -1px rgba(6, 182, 212, 0.1),
        0 3px 6px -1px rgba(6, 182, 212, 0.06),
        0 0 0 1px rgba(6, 182, 212, 0.3) !important;
    transform: translateY(-1px) !important;
}

:deep(input[type="date"]:focus) {
    border-color: #22d3ee !important;
    box-shadow:
        0 0 0 4px rgba(34, 211, 238, 0.25),
        0 8px 10px -2px rgba(34, 211, 238, 0.1) !important;
    background: linear-gradient(135deg, #0c1220 0%, #1e293b 100%) !important;
    outline: none !important;
    transform: translateY(-2px) !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2300ff6a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 18px !important;
    cursor: pointer !important;
    opacity: 0.9 !important;
    transition: all 0.3s ease !important;
    filter: drop-shadow(0 2px 4px rgba(0, 255, 106, 0.3)) !important;
    margin-right: 4px !important;
    width: 24px !important;
    height: 24px !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator:hover) {
    opacity: 1 !important;
    transform: scale(1.15) rotate(5deg) !important;
    filter: drop-shadow(0 4px 8px rgba(0, 255, 106, 0.5)) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit) {
    color: #f1f5f9 !important;
    font-weight: 600 !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-fields-wrapper) {
    background: rgba(6, 182, 212, 0.08) !important;
    padding: 4px 8px !important;
    border-radius: 8px !important;
    margin-right: 8px !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-text) {
    color: #64748b !important;
    padding: 0 4px !important;
    font-weight: 500 !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-month-field),
:deep(input[type="date"]::-webkit-datetime-edit-day-field),
:deep(input[type="date"]::-webkit-datetime-edit-year-field) {
    color: #e2e8f0 !important;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%) !important;
    border-radius: 6px !important;
    padding: 3px 6px !important;
    margin: 0 2px !important;
    font-weight: 700 !important;
    transition: all 0.2s ease !important;
    border: 1px solid rgba(6, 182, 212, 0.2) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

:deep(input[type="date"]::-webkit-datetime-edit-month-field:focus),
:deep(input[type="date"]::-webkit-datetime-edit-day-field:focus),
:deep(input[type="date"]::-webkit-datetime-edit-year-field:focus) {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%) !important;
    color: #22d3ee !important;
    border-color: #22d3ee !important;
    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2) !important;
    transform: scale(1.05) !important;
}

/* ===== SELECT Y INPUTS GENERALES ===== */
:deep(input[type="text"]),
:deep(input[type="number"]),
:deep(input[type="time"]),
:deep(textarea),
:deep(select.filter-input) {
    padding: 12px 18px !important;
    background: rgba(15, 20, 40, 0.65) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
}

:deep(input[type="text"]:hover),
:deep(input[type="number"]:hover),
:deep(input[type="time"]:hover),
:deep(textarea:hover),
:deep(select.filter-input:hover) {
    border-color: rgba(6, 182, 212, 0.4) !important;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15) !important;
}

:deep(input[type="text"]:focus),
:deep(input[type="number"]:focus),
:deep(input[type="time"]:focus),
:deep(textarea:focus),
:deep(select.filter-input:focus) {
    border-color: #22d3ee !important;
    box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.25) !important;
    background: linear-gradient(135deg, rgba(12, 18, 32, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%) !important;
    outline: none !important;
}

:deep(input::placeholder),
:deep(textarea::placeholder) {
    color: rgba(255, 255, 255, 0.4) !important;
}

.filters-section {
    display: grid;
    grid-template-columns: 0.75fr 0.75fr 1fr;
    gap: 16px;
    margin: 24px 0;
    padding: 16px;
    background: rgba(10, 15, 25, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
    overflow: visible;
    position: relative;
    z-index: 1;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: fit-content;
}

.filter-group-compact {
    gap: 8px;
    overflow: visible;
    position: relative;
    z-index: 10;
}

.filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    height: auto;
    min-height: 22px;
    line-height: 1.3;
    display: block;
    white-space: normal;
    word-wrap: break-word;
    padding-bottom: 4px;
}

.filter-input {
    height: 46px;
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

/* Only apply background to actual input elements, not CustomSelect */
.filter-group input.filter-input,
.active-filter-inline input.filter-input {
    background: rgba(255, 255, 255, 0.05);
}

/* Removed custom-select-button.filter-input styling to prevent visual bugs */

.filter-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.filter-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
}

/* Grupo de controles de filtros */
.filters-controls-group {
    grid-column: 2 / 4;
    display: flex;
    gap: 12px;
    align-items: flex-end;
}

.filters-controls-group .filter-group {
    flex: 1;
}

.filters-controls-group .dropdown-filter-group {
    position: relative;
}

/* Botón Limpiar filtros */
.btn-clear-filters {
    padding: 10px 16px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: rgba(255, 107, 107, 0.8);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.btn-clear-filters:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.4);
    color: rgba(255, 107, 107, 0.95);
    transform: translateY(-1px);
}

.table-wrapper {
    background: rgba(10, 15, 25, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    margin: 24px 0;
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
}

.orders-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.orders-table thead {
    background: rgba(10, 15, 25, 0.8);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.orders-table th {
    padding: 16px 12px;
    text-align: left;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
}

.orders-table tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
}

.orders-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.04);
}

.orders-table td {
    padding: 14px 12px;
    color: rgba(255, 255, 255, 0.8);
}

.cell-folio {
    font-weight: 600;
    color: #2edd5a;
}

.cell-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    padding: 6px 8px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.btn-edit:hover {
    border-color: #2edd5a;
    color: #2edd5a;
}

.btn-excel:hover {
    border-color: #4a90e2;
    color: #4a90e2;
}

.btn-delete:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
}

.badge-completado {
    background: rgba(46, 221, 90, 0.15);
    color: #2edd5a;
    border: 1px solid rgba(46, 221, 90, 0.4);
}

.badge-pendiente {
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.4);
}

.badge-en-proceso {
    background: rgba(74, 144, 226, 0.15);
    color: #4a90e2;
    border: 1px solid rgba(74, 144, 226, 0.4);
}

.empty-state {
    padding: 60px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    animation: fadeIn 0.3s ease;
}

.empty-icon {
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
}

.empty-state h3 {
    font-size: 1.5rem;
    margin: 16px 0 8px 0;
    color: rgba(255, 255, 255, 0.85);
}

.empty-state p {
    font-size: 0.95rem;
    margin-bottom: 24px;
}

.btn-create-empty {
    padding: 10px 24px;
    background: linear-gradient(135deg, #2edd5a, #4cdc82);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-create-empty:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.3);
}

.results-info {
    text-align: right;
    padding: 16px 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
}

.modal-content-full {
    background: rgba(13, 20, 35, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    max-width: 900px;
    width: 100%;
    margin: 20px auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px) saturate(120%);
    position: relative;
    color: #e6ebf5;
}

.modal-header {
    padding: 32px 32px 0 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-form-full {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.modal-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: white;
    margin: 0;
    padding: 24px 0;
    padding-right: 40px;
}

/* Estilos compatibles con OpEntrada en la modal */
.op-entrada-modal-full .section-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.op-entrada-modal-full .section-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(46, 221, 90, 0.15);
}

.op-entrada-modal-full .section-card.combined-card {
    display: flex;
    flex-direction: column;
}

.op-entrada-modal-full .section-head {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.op-entrada-modal-full .section-head h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
}

.op-entrada-modal-full .section-head .hint {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
}

.op-entrada-modal-full .section-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
}

.op-entrada-modal-full .section-grid.combined {
    grid-template-columns: repeat(6, 1fr);
}

.op-entrada-modal-full .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.op-entrada-modal-full .field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.op-entrada-modal-full .control,
.op-entrada-modal-full input[type="text"],
.op-entrada-modal-full input[type="date"],
.op-entrada-modal-full input[type="time"],
.op-entrada-modal-full textarea,
.op-entrada-modal-full select {
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-family: inherit;
}

.op-entrada-modal-full .control::placeholder,
.op-entrada-modal-full input::placeholder,
.op-entrada-modal-full textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.op-entrada-modal-full .control:focus,
.op-entrada-modal-full input:focus,
.op-entrada-modal-full textarea:focus,
.op-entrada-modal-full select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(46, 221, 90, 0.5);
    box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.1);
}

.op-entrada-modal-full .control:disabled,
.op-entrada-modal-full input:disabled,
.op-entrada-modal-full textarea:disabled,
.op-entrada-modal-full select:disabled {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
}

.op-entrada-modal-full textarea {
    resize: vertical;
}

/* Items list en modal */
.items-list-edit {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.item-row-edit {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 16px;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition: all 0.3s ease;
}

.item-row-edit:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(46, 221, 90, 0.2);
}

.item-head-edit {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
}

.modal-actions-full {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.save-btn {
    background: linear-gradient(135deg, #2edd5a, #4cdc82);
    color: white;
}

.save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(46, 221, 90, 0.3);
}

/* Transiciones */
.fade-in-enter-active,
.fade-in-leave-active {
    transition: all 0.2s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

/* Transición Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-content {
    animation: slideUp 0.3s ease forwards;
}

.modal-fade-leave-active .modal-content {
    animation: slideDown 0.3s ease forwards;
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

@keyframes slideDown {
    from {
        transform: translateY(0);
        opacity: 1;
    }

    to {
        transform: translateY(20px);
        opacity: 0;
    }
}

@media (max-width: 768px) {
    .filters-section {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .filter-group {
        width: 100%;
    }

    .filter-group-compact {
        width: 100%;
    }

    .filter-group-compact>div {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .filters-controls-group {
        grid-column: 1;
        flex-direction: column;
    }

    .filters-controls-group .filter-group {
        width: 100%;
    }

    .btn-add-filters,
    .btn-clear-filters {
        width: 100%;
        justify-content: center;
    }

    .btn-add-filters.compact {
        width: 100%;
        font-size: 0.85rem;
        padding: 10px 14px;
    }

    .filters-dropdown-new {
        position: fixed;
        left: 20px;
        right: 20px;
        max-width: none;
        min-width: auto;
        width: auto;
    }

    .orders-table {
        font-size: 0.8rem;
    }

    .orders-table th,
    .orders-table td {
        padding: 8px 6px;
    }

    .cell-actions {
        gap: 4px;
    }

    .action-btn {
        padding: 4px 6px;
    }

    .title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .btn-create-order {
        width: 100%;
        justify-content: center;
    }

    .modal-content {
        padding: 24px;
        max-width: 95vw;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .modal-actions {
        flex-direction: column;
    }

    .btn-cancel,
    .btn-save,
    .btn-download-excel {
        width: 100%;
    }

    /* Ensure DatePicker and CustomSelect inputs have full width */
    .filter-input,
    .control.filter-input {
        width: 100% !important;
        min-width: 0 !important;
    }

    .hora-range {
        flex-direction: column;
        gap: 8px;
    }

    .hora-range .filter-input {
        width: 100% !important;
    }
}

/* Dropdown Filter Styles */
.dropdown-filter-group {
    position: relative;
}

.dropdown-container {
    position: relative;
    width: 100%;
    overflow: visible;
    z-index: 100;
    display: flex;
    justify-content: flex-end;
}

.filter-group-compact .dropdown-container {
    min-width: fit-content;
    overflow: visible;
}

.btn-add-filters {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.15), rgba(74, 144, 226, 0.1));
    border: 1px solid rgba(46, 221, 90, 0.3);
    color: rgba(46, 221, 90, 0.9);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-add-filters.compact {
    padding: 8px 10px;
    gap: 6px;
    font-size: 0;
    border-radius: 8px;
    flex-shrink: 0;
}

.btn-add-filters:hover {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46, 221, 90, 0.2);
}

.btn-add-filters[aria-expanded="true"] {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
}

.btn-add-filters.has-active-filters {
    background: linear-gradient(135deg, rgba(46, 221, 90, 0.25), rgba(74, 144, 226, 0.15));
    border-color: rgba(46, 221, 90, 0.5);
    box-shadow: 0 0 0 2px rgba(46, 221, 90, 0.2);
}

.filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(46, 221, 90, 0.8);
    color: white;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 700;
}

.btn-add-filters .dropdown-icon {
    transition: transform 0.2s ease;
    margin-left: 4px;
}

.btn-add-filters[aria-expanded="true"] .dropdown-icon {
    transform: rotate(180deg);
}

/* ===== NUEVO DISEÑO DEL DROPDOWN DE FILTROS ===== */
.filters-dropdown-new {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 12px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(59, 130, 246, 0.1);
    backdrop-filter: blur(12px);
    z-index: 1000;
    min-width: 360px;
    max-width: calc(100vw - 40px);
    width: auto;
    animation: slideDownDropdownNew 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

@keyframes slideDownDropdownNew {
    from {
        opacity: 0;
        transform: translateY(-12px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.dropdown-header-new {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.15);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(30, 41, 59, 0.5));
}

.dropdown-title-new {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: rgba(226, 232, 240, 0.95);
    letter-spacing: 0.3px;
    text-transform: uppercase;
}

.btn-close-dropdown-new {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.btn-close-dropdown-new:hover {
    background: rgba(255, 107, 107, 0.15);
    border-color: rgba(255, 107, 107, 0.3);
    color: rgba(255, 107, 107, 0.8);
}

.dropdown-content-new {
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 380px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
    flex: 1;
}

.dropdown-content-new::-webkit-scrollbar {
    width: 6px;
}

.dropdown-content-new::-webkit-scrollbar-track {
    background: transparent;
}

.dropdown-content-new::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
}

.dropdown-content-new::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
}

.filter-group-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 6px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
}

.section-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(96, 165, 250, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 8px;
    margin-bottom: 4px;
}

.checkbox-item-new {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: rgba(226, 232, 240, 0.9);
    font-size: 0.85rem;
    font-weight: 500;
    user-select: none;
    position: relative;
    white-space: nowrap;
    flex-wrap: nowrap;
}

.checkbox-item-new:hover {
    background: rgba(59, 130, 246, 0.12);
    color: rgba(226, 232, 240, 1);
}

.checkbox-item-new input[type="checkbox"] {
    cursor: pointer;
    accent-color: #3b82f6;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 18px;
    height: 18px;
    border: 1.5px solid rgba(59, 130, 246, 0.5);
    border-radius: 4px;
    background: transparent;
    transition: all 0.2s ease;
    cursor: pointer;
}

.checkbox-item-new input[type="checkbox"]:hover {
    border-color: rgba(59, 130, 246, 0.8);
    background: rgba(59, 130, 246, 0.1);
}

.checkbox-item-new input[type="checkbox"]:checked {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #1e40af;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.checkbox-item-new input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    color: white;
    font-weight: bold;
    font-size: 12px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.dropdown-footer-new {
    padding: 12px 14px;
    border-top: 1px solid rgba(59, 130, 246, 0.15);
    background: rgba(30, 41, 59, 0.5);
    display: flex;
    justify-content: flex-end;
}

.btn-listo-new {
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: rgba(96, 165, 250, 0.95);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-listo-new:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
    border-color: rgba(59, 130, 246, 0.6);
    color: rgba(226, 232, 240, 1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-listo-new:active {
    transform: scale(0.98);
}

.btn-close-dropdown:hover {
    background: rgba(46, 221, 90, 0.25);
    border-color: rgba(46, 221, 90, 0.5);
}

/* Active Filters Inline */
.active-filter-inline {
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-remove-filter {
    padding: 8px 8px;
    background: transparent;
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: rgba(255, 107, 107, 0.6);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.btn-remove-filter:hover {
    background: rgba(255, 107, 107, 0.15);
    border-color: rgba(255, 107, 107, 0.5);
    color: rgba(255, 107, 107, 0.9);
}

.btn-clear-all-filters {
    width: 100%;
    padding: 10px 16px;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: rgba(255, 107, 107, 0.8);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.btn-clear-all-filters:hover {
    background: rgba(255, 107, 107, 0.25);
    border-color: rgba(255, 107, 107, 0.5);
    color: rgba(255, 107, 107, 0.95);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
