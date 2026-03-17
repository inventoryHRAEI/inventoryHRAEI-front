<template>
    <ActionPanel class="biomedica-management-main">
        <template #title>
            <div class="title-row">
                <button class="btn-back" @click="goToDashboard">← Volver</button>
                <span>Inventario Biomédica</span>
                <div class="title-badges">
                    <span class="badge-total">{{ items.length }} equipos</span>
                    <span class="badge-sync" v-if="lastSync">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
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
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input v-model="searchQuery" type="text" placeholder="Buscar por inventario, equipo, marca..."
                    class="search-input" />
                <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">✕</button>
            </div>

            <div class="view-controls">
                <button @click="viewMode = 'cards'" class="view-btn" :class="{ active: viewMode === 'cards' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </button>
                <button @click="viewMode = 'table'" class="view-btn" :class="{ active: viewMode === 'table' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
                <button @click="refreshData" class="refresh-btn" :class="{ loading: loading }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" :class="{ spin: loading }">
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
            <div v-for="item in paginatedItems" :key="item.id || item['No DE INVENTARIO']" class="card"
                :class="getStatusClass(item)">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Ver
                    </button>
                    <button class="action-btn edit" @click="editItem(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
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
            <!-- Barra de filtro dentro de la tabla -->
            <div class="table-filter-bar">
                <div class="filter-info">
                    <span class="filter-title">🚦 Filtrar por Semaforización:</span>
                    <!-- Botón de ayuda con tooltip -->
                    <div class="legend-help">
                        <button class="help-btn" title="Ver leyenda de colores">?</button>
                        <div class="legend-tooltip">
                            <div class="legend-title">🎨 Leyenda de Semaforización</div>
                            <div class="legend-item"><span class="legend-dot green"></span> <b>Verde</b> - Operativo y
                                funcional
                            </div>
                            <div class="legend-item"><span class="legend-dot orange"></span> <b>Naranja</b> -
                                Condiciones
                                regulares</div>
                            <div class="legend-item"><span class="legend-dot lilac"></span> <b>Lila</b> - Mantenimiento
                                Preventivo</div>
                            <div class="legend-item"><span class="legend-dot purple"></span> <b>Morado</b> -
                                Mantenimiento
                                Correctivo</div>
                            <div class="legend-item"><span class="legend-dot red"></span> <b>Rojo</b> - Crítico / No
                                funcional
                            </div>
                            <div class="legend-item"><span class="legend-dot gray"></span> <b>Gris</b> - Fuera de
                                servicio</div>
                        </div>
                    </div>
                </div>
                <div class="filter-buttons">
                    <button v-for="option in statusOptions" :key="option.value" @click="statusFilter = option.value"
                        class="table-status-btn" :class="{ active: statusFilter === option.value }"
                        :title="option.label">
                        {{ option.emoji }}
                    </button>
                </div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th @click="sortBy('No DE INVENTARIO')" class="sortable">
                            No. Inventario
                            <span v-if="sortField === 'No DE INVENTARIO'" class="sort-icon">{{ sortOrder === 1 ? '▲' :
                                '▼'
                            }}</span>
                        </th>
                        <th @click="sortBy('EQUIPO MEDICO')" class="sortable">
                            Equipo Médico
                            <span v-if="sortField === 'EQUIPO MEDICO'" class="sort-icon">{{ sortOrder === 1 ? '▲' : '▼'
                            }}</span>
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
                    <tr v-for="item in paginatedItems" :key="item.id || item['No DE INVENTARIO']"
                        :class="getRowClass(item)">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p>No hay equipos que coincidan con los filtros</p>
            <button v-if="searchQuery || statusFilter" @click="clearFilters" class="clear-btn">Limpiar filtros</button>
        </div>

        <!-- Paginación -->
        <div v-if="filteredItems.length > 0" class="pagination">
            <div class="pagination-info">
                Mostrando {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredItems.length) }} de {{
                    filteredItems.length }}
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
import { useSemaforoRuleEngine } from '@/composables/useSemaforoRuleEngine.js'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import '@/styles/sticky-filters-fix.css'

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
const statusFilter = ref('') // Filtro de semaforización (color del semáforo)

// Opciones de estado para el filtro de semaforización
const statusOptions = [
    { value: '', emoji: '🚦', label: 'Todos' },
    { value: '🟢', emoji: '🟢', label: 'Operativo' },
    { value: '🟠', emoji: '🟠', label: 'Regular/Mantenimiento' },
    { value: '🔴', emoji: '🔴', label: 'Crítico' }
]

// Leyenda de colores para semaforización
const statusLegend = [
    { emoji: '🟢', label: 'Operativo', desc: 'Equipo funcionando correctamente' },
    { emoji: '🟠', label: 'Condiciones Regulares', desc: 'Equipo funcional con desgaste normal' },
    { emoji: '🟪', label: 'Mantenimiento Preventivo', desc: 'En servicio de mantenimiento programado' },
    { emoji: '🟣', label: 'Mantenimiento Correctivo', desc: 'En reparación o mantenimiento correctivo' },
    { emoji: '🔴', label: 'Crítico', desc: 'Fuera de servicio, no funcional o dado de baja' }
]

// Semaforización (composable)
const { getEquipmentColors, getColorSync, clearCache } = useSemaforoRuleEngine()

async function loadSemaforizacion() {
    try {
        const visible = (paginatedItems.value || []).map(i => i && (i['No DE INVENTARIO'] || i.inventoryNo)).filter(Boolean)
        if (!visible || visible.length === 0) return

        const results = await getEquipmentColors(visible)

        // Asignar resultados a cada item
        items.value = items.value.map(it => {
            const inv = it['No DE INVENTARIO'] || it.inventoryNo
            if (!inv) return it
            const sem = (results && results[inv]) || getColorSync(inv)
            return Object.assign({}, it, { semaforizacion: sem })
        })
    } catch (e) {
        console.warn('[OpInventarioBiomedica] loadSemaforizacion error', e)
    }
}

// Recargar semaforización cuando cambian los items visibles
watch([paginatedItems], () => {
    loadSemaforizacion()
})

// Garantizar que filters-section siempre esté pegado
onMounted(() => {
    const filtersSection = document.querySelector('.filters-section')
    if (filtersSection) {
        // Asegurar que esté al tope
        filtersSection.style.position = 'fixed'
        filtersSection.style.top = '0'
        filtersSection.style.left = '0'
        filtersSection.style.right = '0'
        filtersSection.style.zIndex = '9999'
        filtersSection.style.width = '100%'
        filtersSection.style.boxSizing = 'border-box'
    }
})

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

// Función de carga de datos - SIMPLE
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

        // Cargar semaforización para la página visible (o para todos si pocas filas)
        try {
            loadSemaforizacion()
        } catch (e) {
            console.warn('[OpInventarioBiomedica] Error cargando semaforizacion:', e)
        }
        lastSync.value = new Date()
    } catch (e) {
        console.error('Error:', e)
    } finally {
        loading.value = false
    }
}



onMounted(() => {
    loadData()
    // Exponer items globalmente para que MaintenanceFormBrutal pueda actualizarlos
    window.__ITEMS__ = items.value

    // Escuchar evento cuando se cierre el panel de mantenimiento
    window.addEventListener('maintenance:panel-closed', (event) => {
        console.log('📡 [OpInventarioBiomedica] maintenance:panel-closed recibido')
        console.log('📡 Detail:', event.detail)
        
        try {
            // ✅ PRIMERO: Forzar que Vue detecte cambios en window.__ITEMS__
            if (window.__ITEMS__ && items.value) {
                console.log('✅ [OpInventarioBiomedica] Forzando Vue reactivity...')
                
                // BRUTAL: Múltiples maneras de forzar reactivity
                items.value = JSON.parse(JSON.stringify(window.__ITEMS__))  // Deep clone
                console.log('✅ [OpInventarioBiomedica] items.value = deep clone')
                
                // Esperar un tick
                await new Promise(resolve => setTimeout(resolve, 50))
                
                // Re-asignar para forzar reactividad otra vez
                items.value = [...items.value]
                console.log('✅ [OpInventarioBiomedica] items.value = spread operator')
            }
            
            // ✅ SEGUNDO: Simular click en botón de refresh
            const btn = document.querySelector('.refresh-btn')
            if (btn) {
                console.log('✅ [OpInventarioBiomedica] Clicking refresh button...')
                btn.click()
                return
            }
        } catch (e) {
            console.warn('⚠️ [OpInventarioBiomedica] Error:', e && e.message)
        }

        // Fallback: recarga desde servidor
        console.log('⚠️ [OpInventarioBiomedica] Fallback: loadData()')
        loadData()
    })
})

// Escuchar cambios en items para mantener window.__ITEMS__ sincronizado
watch(items, (newItems) => {
    window.__ITEMS__ = newItems
}, { deep: true })

// Filtrado
const filteredItems = computed(() => {
    let result = items.value

    // Filtro de semaforización por emoji
    if (statusFilter.value) {
        result = result.filter(item => {
            // Busca el emoji en el badge/ESTATUS del item
            const status = item['ESTATUS'] || item.semaforizacion?.badge || ''
            return String(status).includes(statusFilter.value)
        })
    }

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
    statusFilter.value = ''
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
    // ✅ PRIORIDAD 1: Usar semaforizacion si está disponible (datos frescos del API)
    // loadSemaforizacion() ya filtró los datos inválidos ('unknown'), así que si está aquí es válido
    if (item.semaforizacion && item.semaforizacion.badge) {
        const badge = String(item.semaforizacion.badge).toLowerCase()

        if (badge.includes('critical') || badge.includes('red') || badge.includes('fuera')) {
            return 'status-red'
        }
        if (badge.includes('maintenance') || badge.includes('orange') || badge.includes('partial')) {
            return 'status-orange'
        }
        if (badge.includes('warning') || badge.includes('yellow')) {
            return 'status-yellow'
        }
        if (badge.includes('operational') || badge.includes('green')) {
            return 'status-green'
        }
    }

    // ❌ FALLBACK: Si no hay semaforizacion válida, usar ESTATUS como fuente de verdad
    const status = String(item['ESTATUS'] || '').toLowerCase()

    // Crítico / Fuera de servicio
    if (status.includes('fuera') || status.includes('baja') || status.includes('danado') || status.includes('roto')) {
        return 'status-red'
    }
    // Mantenimiento
    if (status.includes('mantenimiento') || status.includes('mantto') || status.includes('servicio')) {
        return 'status-orange'
    }
    // Advertencia - por vencer garantía o requiere revisión
    if (status.includes('advertencia') || status.includes('revisión') || status.includes('revision') || status.includes('vencer')) {
        return 'status-yellow'
    }
    // Operativo / Disponible
    if (status.includes('operativo') || status.includes('disponible') || status.includes('activo')) {
        return 'status-green'
    }
    return 'status-gray'
}

function getRowClass(item) {
    // ✅ PRIORIDAD 1: Usar semaforizacion si está disponible
    if (item.semaforizacion && item.semaforizacion.badge) {
        const badge = String(item.semaforizacion.badge).toLowerCase()

        if (badge.includes('critical') || badge.includes('red') || badge.includes('fuera')) return 'row-offline'
        if (badge.includes('maintenance') || badge.includes('orange') || badge.includes('partial')) return 'row-offline-orange'
        if (badge.includes('warning') || badge.includes('yellow')) return 'row-warning'
        if (badge.includes('operational') || badge.includes('green')) return 'row-available'
    }

    // ❌ FALLBACK: Si no hay semaforizacion, usar ESTATUS
    const status = String(item['ESTATUS'] || '').toLowerCase()
    if (status.includes('fuera') || status.includes('baja') || status.includes('danado') || status.includes('roto')) return 'row-offline'
    if (status.includes('mantenimiento') || status.includes('mantto') || status.includes('servicio')) return 'row-offline-orange'
    if (status.includes('advertencia') || status.includes('revisión') || status.includes('revision') || status.includes('vencer')) return 'row-warning'
    if (status.includes('operativo') || status.includes('disponible') || status.includes('activo')) return 'row-available'
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
    padding-top: 120px;
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

.stat-card.total {
    border-left-color: #3b82f6;
}

.stat-card.available {
    border-left-color: #22c55e;
}

.stat-card.maintenance {
    border-left-color: #f59e0b;
}

.stat-card.offline {
    border-left-color: #ef4444;
}

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

.bar-segment.available {
    background: linear-gradient(90deg, #22c55e, #4ade80);
}

.bar-segment.maintenance {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.bar-segment.offline {
    background: linear-gradient(90deg, #ef4444, #f87171);
}

/* Filtros */
.filters-section {
    display: flex !important;
    gap: 16px !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 9999 !important;
    background: white !important;
    padding: 16px 20px !important;
    margin: 0 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
    border-bottom: 2px solid #e5e7eb !important;
    width: 100% !important;
    box-sizing: border-box !important;
    height: auto !important;
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
    align-items: center;
}

.status-filter-select {
    padding: 8px 12px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
}

.status-filter-select:hover {
    background: #e5e7eb;
}

.status-filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.view-btn,
.refresh-btn {
    padding: 8px 12px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.view-btn:hover,
.refresh-btn:hover {
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
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
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

.card.status-green {
    border-left-color: #eab308;
    /* Amarillo */
}

.card.status-yellow {
    border-left-color: #a855f7;
    /* Morado */
}

.card.status-red {
    border-left-color: #ef4444;
}

.card.status-orange {
    border-left-color: #eab308;
    /* Amarillo */
}

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
    background: #fef9c3;
    /* Amarillo */
    color: #854d0e;
}

.status-badge.status-yellow {
    background: #f3e8ff;
    /* Morado */
    color: #7e22ce;
}

.status-badge.status-red {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.status-orange {
    background: #f3e8ff;
    /* Morado */
    color: #7e22ce;
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
    /* Scrolling horizontal y vertical */
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    overflow-x: auto;
    overflow-y: auto;

    /* Altura controlada */
    max-height: calc(100vh - var(--container-toppad) - 220px);
    min-height: 400px;

    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    margin-bottom: 20px;
    position: relative;

    /* IMPORTANTE: contenedor debe contener toda la tabla sin overflow oculto */
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
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    background: white;
}

/* keep header visible while scrolling vertically inside .table-container */
.data-table thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    background: #f9fafb;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.data-table th {
    padding: 12px 12px !important;
    text-align: left !important;
    background: #f9fafb !important;
    font-weight: 600 !important;
    color: #374151 !important;
    border-bottom: 2px solid #e5e7eb !important;
    white-space: nowrap !important;
    box-sizing: border-box !important;
    vertical-align: middle !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

.data-table td {
    white-space: nowrap !important;
    box-sizing: border-box !important;
    vertical-align: middle !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
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

.data-table tbody td {
    padding: 12px 12px !important;
    border-bottom: 1px solid #f3f4f6 !important;
    color: #4b5563 !important;
}

/* Distribuir columnas equitativamente - 8 columnas */
.data-table th,
.data-table td {
    width: calc(100% / 8);
}

.data-table tbody tr {
    transition: all 0.15s ease;
}

.data-table tbody tr:hover {
    background: #f0fdf4;
    box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.1);
}

.data-table tr.row-available {
    border-left: 3px solid #eab308;
    /* Amarillo */
}

.data-table tr.row-maintenance {
    border-left: 3px solid #f59e0b;
    background: rgba(245, 158, 11, 0.03);
}

.data-table tr.row-offline {
    border-left: 3px solid #ef4444;
    background: rgba(239, 68, 68, 0.03);
}

.data-table tr.row-warning {
    border-left: 3px solid #a855f7;
    /* Morado */
    background: rgba(168, 85, 247, 0.05);
}

.data-table tr.row-offline-orange {
    border-left: 3px solid #a855f7;
    /* Morado */
    background: rgba(168, 85, 247, 0.05);
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

/* Estilos para el filtro de semaforizacion */
.filter-and-controls {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.semaforizacion-filter-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filter-label {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    white-space: nowrap;
}

.status-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.status-btn {
    padding: 8px 12px;
    border: 2px solid transparent;
    background: #f3f4f6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
}

.status-btn:hover {
    background: #e5e7eb;
    transform: scale(1.05);
}

.status-btn.active {
    border-color: #3b82f6;
    background: #dbeafe;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: scale(1.08);
}

/* Estilos para la barra de filtro dentro de la tabla */
.table-filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-bottom: 2px solid #e5e7eb;
    border-radius: 12px 12px 0 0;
}

.filter-info {
    display: flex;
    align-items: center;
}

.filter-title {
    font-weight: 600;
    color: #374151;
    font-size: 13px;
    white-space: nowrap;
}

.filter-buttons {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.table-status-btn {
    padding: 6px 10px;
    border: 2px solid transparent;
    background: white;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.table-status-btn:hover {
    background: #f3f4f6;
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.table-status-btn.active {
    border-color: #3b82f6;
    background: #dbeafe;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    transform: scale(1.08);
}

/* Botón de ayuda y tooltip de semaforización */
.legend-help {
    position: relative;
    display: inline-flex;
    margin-left: 12px;
}

.help-btn {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #9ca3af;
    background: #f3f4f6;
    color: #6b7280;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.help-btn:hover {
    border-color: #3b82f6;
    background: #dbeafe;
    color: #3b82f6;
}

.legend-tooltip {
    display: none;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    padding: 14px 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 12px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    z-index: 1000;
    min-width: 280px;
    font-size: 13px;
    animation: tooltip-appear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes tooltip-appear {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

.legend-help:hover .legend-tooltip {
    display: block;
}

.legend-title {
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
    font-size: 14px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    color: #4b5563;
    transition: all 0.2s ease;
}

.legend-item:hover {
    color: #1f2937;
    transform: translateX(3px);
}

.legend-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.4);
    position: relative;
}

.legend-dot::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
}

/* Colores actualizados para semaforización */
.legend-dot.green {
    background: radial-gradient(circle at 30% 30%, #22c55e, #16a34a);
}

.legend-dot.orange {
    background: radial-gradient(circle at 30% 30%, #fb923c, #f97316);
}

.legend-dot.lilac {
    background: radial-gradient(circle at 30% 30%, #a78bfa, #9333ea);
}

.legend-dot.purple {
    background: radial-gradient(circle at 30% 30%, #8b5cf6, #7c3aed);
}

.legend-dot.red {
    background: radial-gradient(circle at 30% 30%, #ef4444, #dc2626);
}

.legend-dot.gray {
    background: radial-gradient(circle at 30% 30%, #64748b, #475569);
}

.legend-color.orange {
    background: #f97316;
}

.legend-color.red {
    background: #ef4444;
}
</style>