<template>
    <ActionPanel class="biomedica-management-main">
        <template #title>
            <div class="title-row">
                <button class="btn-back-to-dashboard" @click="goToDashboard" title="Volver al dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <span>Inventario Biomédica</span>
                <div class="spacer"></div>
            </div>
        </template>

        <Breadcrumbs />

        <!-- Filtros: estructura elegante con 3 columnas -->
        <div class="filters-section">
            <!-- Filtros principales (siempre visibles) -->
            <div class="filter-group filter-group-narrow">
                <label>No. de inventario:</label>
                <input v-model="filterInventoryNo" class="control filter-input" placeholder="Ej. E-001" />
            </div>
            <div class="filter-group filter-group-narrow">
                <label>Nombre del equipo:</label>
                <input v-model="filterEquipmentName" class="control filter-input" placeholder="Ej. Ventilador..." />
            </div>
            <div class="filter-group filter-group-compact">
                <label>Tipo de artículo:</label>
                <div style="display: flex; gap: 8px; align-items: flex-end;">
                    <CustomSelect v-model="filterTipo" :options="tipoOptions" placeholder="Todos"
                        class="filter-input" />
                    <!-- Botón Añadir filtros -->
                    <div class="dropdown-container" @click.stop style="min-width: fit-content;" ref="filterDropdownRef">
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
                                <button type="button" class="btn-close-dropdown-new" @click="showMoreFilters = false"
                                    aria-label="Cerrar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <div class="dropdown-content-new">
                                <div class="filter-group-section">
                                    <div class="section-label">Información del Equipo</div>
                                    <label class="checkbox-item-new">
                                        <input type="checkbox" v-model="filterBrandActive" />
                                        <span>Marca</span>
                                    </label>
                                    <label class="checkbox-item-new">
                                        <input type="checkbox" v-model="filterModelActive" />
                                        <span>Modelo</span>
                                    </label>
                                    <label class="checkbox-item-new">
                                        <input type="checkbox" v-model="filterAreaActive" />
                                        <span>Área / Ubicación</span>
                                    </label>
                                </div>
                                <div class="filter-group-section">
                                    <div class="section-label">Estado e Historial</div>
                                    <label class="checkbox-item-new">
                                        <input type="checkbox" v-model="filterStatusActive" />
                                        <span>Estado</span>
                                    </label>
                                    <label class="checkbox-item-new">
                                        <input type="checkbox" v-model="filterMaintenanceHistoryActive" />
                                        <span>Historial de mantenimiento</span>
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
                            <template v-if="f.key === 'brand'">
                                <input v-model="filterBrand" class="control filter-input"
                                    placeholder="Ej. Philips..." />
                            </template>
                            <template v-else-if="f.key === 'model'">
                                <input v-model="filterModel" class="control filter-input" placeholder="Ej. MX40..." />
                            </template>
                            <template v-else-if="f.key === 'area'">
                                <input v-model="filterArea" class="control filter-input" placeholder="Ej. UCIA..." />
                            </template>
                            <template v-else-if="f.key === 'status'">
                                <CustomSelect v-model="filterStatus" :options="statusOptions" placeholder="Todos"
                                    class="filter-input" />
                            </template>
                            <template v-else-if="f.key === 'maintenanceHistory'">
                                <input v-model="filterMaintenanceHistory" class="control filter-input"
                                    placeholder="Técnico o notas..." />
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
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                            </path>
                        </svg>
                        <span>Limpiar</span>
                    </button>
                </div>
            </transition>
        </div>

        <!-- Datatable -->
        <BiomedicalInventoryTable :items="filteredItems" @view="openDetail" @start="startMaintenance"
            @finish="finishMaintenance" :empty-state-message="computedEmptyMessage" />

        <!-- Panel con resumen - integrado abajo -->
        <div class="summary-panel">
            <div class="summary-card">
                <h4>📊 Resumen General</h4>
                <div class="summary-grid">
                    <div class="summary-stat-item">
                        <span class="stat-label">Total</span>
                        <span class="stat-value">{{ items.length }}</span>
                    </div>
                    <div class="summary-stat-item">
                        <span class="stat-label">Disponibles</span>
                        <span class="stat-value is-green">{{ counts.DISPONIBLE || 0 }}</span>
                    </div>
                    <div class="summary-stat-item">
                        <span class="stat-label">En Mantenimiento</span>
                        <span class="stat-value is-yellow">{{ counts['EN MANTENIMIENTO'] || 0 }}</span>
                    </div>
                    <div class="summary-stat-item">
                        <span class="stat-label">Operativos</span>
                        <span class="stat-value is-blue">{{ counts.OPERATIVO || 0 }}</span>
                    </div>
                </div>
            </div>

            <div class="summary-card">
                <h4>⚙️ Acciones</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn-export" @click="goToTestingEnvironment">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        entorno aislado
                    </button>
                    <button class="btn-export" @click="simulateExport">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Descargar historial
                    </button>
                </div>
            </div>
        </div>

        <div v-if="selected" class="detail-modal">
            <EquipmentDetail :item="selected" @close="selected = null" @start="startMaintenance"
                @finish="finishMaintenance" />
        </div>

        <StartMaintenanceModal v-if="startModalVisible" :item="startTarget"
            @close="() => (startModalVisible = false, startTarget = null)" @confirm="onConfirmStart" />

        <FinishMaintenanceModal v-if="finishModalVisible" :item="finishTarget"
            @close="() => (finishModalVisible = false, finishTarget = null)" @confirm="onConfirmFinish" />
    </ActionPanel>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import BiomedicalInventoryTable from '@/components/inventory/BiomedicalInventoryTable.vue'
import EquipmentDetail from '@/components/inventory/EquipmentDetail.vue'
import StartMaintenanceModal from '@/components/inventory/StartMaintenanceModal.vue'
import FinishMaintenanceModal from '@/components/inventory/FinishMaintenanceModal.vue'
import { createMockInventory } from '@/data/mockInventory'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'

const router = useRouter()

const items = ref(createMockInventory())
const startModalVisible = ref(false)
const startTarget = ref(null)
const finishModalVisible = ref(false)
const finishTarget = ref(null)
const selected = ref(null)

// Filtros
const filterInventoryNo = ref('')
const filterEquipmentName = ref('')
const filterTipo = ref('')
const filterBrand = ref('')
const filterModel = ref('')
const filterArea = ref('')
const filterStatus = ref('')
const filterMaintenanceHistory = ref('')

// Estados de filtros avanzados
const showMoreFilters = ref(false)
const filterBrandActive = ref(false)
const filterModelActive = ref(false)
const filterAreaActive = ref(false)
const filterStatusActive = ref(false)
const filterMaintenanceHistoryActive = ref(false)

// Opciones
const tipoOptions = [
    { value: '', label: 'Todos' },
    { value: 'equipo', label: 'Equipos' },
    { value: 'accesorio', label: 'Accesorios' },
    { value: 'consumible', label: 'Consumibles' },
    { value: 'refaccion', label: 'Refacciones' }
]

const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'EN MANTENIMIENTO', label: 'En mantenimiento' },
    { value: 'OPERATIVO', label: 'Operativo' }
]

const counts = computed(() => {
    const map = { DISPONIBLE: 0, 'EN MANTENIMIENTO': 0, OPERATIVO: 0 }
    for (const it of items.value) map[it.status] = (map[it.status] || 0) + 1
    return map
})

// Computados para filtros activos
const activeFiltersList = computed(() => {
    const list = []
    if (filterBrandActive.value) list.push({ key: 'brand', label: 'Marca' })
    if (filterModelActive.value) list.push({ key: 'model', label: 'Modelo' })
    if (filterAreaActive.value) list.push({ key: 'area', label: 'Área' })
    if (filterStatusActive.value) list.push({ key: 'status', label: 'Estado' })
    if (filterMaintenanceHistoryActive.value) list.push({ key: 'maintenanceHistory', label: 'Historial' })
    return list
})

const hasActiveAdvancedFilters = computed(() => activeFiltersList.value.length > 0)

// Filtrado
const filteredItems = computed(() => {
    return items.value.filter(it => {
        if (filterInventoryNo.value && !String(it.inventoryNo || '').toLowerCase().includes(filterInventoryNo.value.toLowerCase())) return false
        if (filterEquipmentName.value && !String(it.name || '').toLowerCase().includes(filterEquipmentName.value.toLowerCase())) return false
        if (filterTipo.value && it.type !== filterTipo.value) return false
        if (filterBrandActive.value && filterBrand.value && !String(it.brand || '').toLowerCase().includes(filterBrand.value.toLowerCase())) return false
        if (filterModelActive.value && filterModel.value && !String(it.model || '').toLowerCase().includes(filterModel.value.toLowerCase())) return false
        if (filterAreaActive.value && filterArea.value && !String(it.area || '').toLowerCase().includes(filterArea.value.toLowerCase())) return false
        if (filterStatusActive.value && filterStatus.value && it.status !== filterStatus.value) return false
        if (filterMaintenanceHistoryActive.value && filterMaintenanceHistory.value) {
            const search = filterMaintenanceHistory.value.toLowerCase()
            const hasMatch = (it.history || []).some(h => String(h.technician || '').toLowerCase().includes(search) || String(h.notes || '').toLowerCase().includes(search))
            if (!hasMatch) return false
        }
        return true
    })
})

const computedEmptyMessage = computed(() => {
    if (filterInventoryNo.value || filterEquipmentName.value || filterTipo.value || hasActiveAdvancedFilters.value) {
        return 'No se encontraron equipos con los filtros seleccionados.'
    }
    return 'Sin equipos registrados. Comienza agregando un equipo.'
})

function removeActiveFilter(key) {
    if (key === 'brand') filterBrandActive.value = false
    else if (key === 'model') filterModelActive.value = false
    else if (key === 'area') filterAreaActive.value = false
    else if (key === 'status') filterStatusActive.value = false
    else if (key === 'maintenanceHistory') filterMaintenanceHistoryActive.value = false
}

function clearAllFilters() {
    filterInventoryNo.value = ''
    filterEquipmentName.value = ''
    filterTipo.value = ''
    filterBrand.value = ''
    filterModel.value = ''
    filterArea.value = ''
    filterStatus.value = ''
    filterMaintenanceHistory.value = ''
    filterBrandActive.value = false
    filterModelActive.value = false
    filterAreaActive.value = false
    filterStatusActive.value = false
    filterMaintenanceHistoryActive.value = false
    showMoreFilters.value = false
}

function goToDashboard() {
    try {
        navigateAndRefresh(router, { name: 'dashboard' })
    } catch (e) {
        router.push('/dashboard')
    }
}

function goToTestingEnvironment() {
    try {
        navigateAndRefresh(router, { name: 'testing-biomedical' })
    } catch (e) {
        router.push('/op/testing-biomedical')
    }
}

function openDetail(item) { selected.value = item }

function startMaintenance(item) {
    if (!item) return
    if (item.status === 'EN MANTENIMIENTO') return alert('Ya está en mantenimiento')
    startTarget.value = item
    startModalVisible.value = true
}

function onConfirmStart(data) {
    if (!startTarget.value) return
    const item = startTarget.value
    item.history = item.history || []
    item.history.push({
        id: 'h-' + Date.now(),
        start: data.start,
        end: null,
        reason: data.reason,
        technician: data.technician,
        description: data.description,
        serialNumber: data.serialNumber
    })
    item.status = 'EN MANTENIMIENTO'
    startModalVisible.value = false
    startTarget.value = null
    alert('Mantenimiento iniciado para ' + item.inventoryNo)
}

function finishMaintenance(item) {
    if (!item) return
    if (item.status !== 'EN MANTENIMIENTO') return alert('No está en mantenimiento')
    // abrir modal para completar información antes de finalizar
    finishTarget.value = item
    finishModalVisible.value = true
}

function onConfirmFinish(payload) {
    const item = finishTarget.value
    if (!item) return

    const last = (item.history || []).slice().reverse().find(h => !h.end)
    const end = payload.end || new Date().toISOString()
    if (last) {
        last.end = end
        last.technician = payload.technician
        last.notes = payload.notes
        last.status = payload.status
        last.signature = payload.signature
    } else {
        item.history = item.history || []
        item.history.push({
            id: 'h-' + Date.now(),
            start: null,
            end,
            technician: payload.technician,
            notes: payload.notes,
            status: payload.status,
            signature: payload.signature
        })
    }
    item.status = payload.status
    finishModalVisible.value = false
    finishTarget.value = null

    // generar y abrir PDF mediante ventana de impresión
    downloadMaintenancePdf(item, (last || item.history[item.history.length - 1]))
    alert('Mantenimiento finalizado; se abrirá una ventana para descargar el PDF (usar "Guardar como PDF")')
}

function downloadMaintenancePdf(item, record) {
    try {
        const formatDate = (isoDate) => {
            if (!isoDate) return '—'
            const d = new Date(isoDate)
            return d.toLocaleString('es-ES')
        }

        const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mantenimiento ${item.inventoryNo}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #222;
            background: white;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 30px; }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0066cc;
        }
        .header h1 { 
            font-size: 28px; 
            color: #0066cc;
            margin-bottom: 5px;
        }
        .header p { 
            color: #666;
            font-size: 13px;
        }
        .metadata {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
        }
        .meta-item { 
            display: flex;
            flex-direction: column;
        }
        .meta-label { 
            font-weight: 700;
            color: #333;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .meta-value { 
            font-size: 14px;
            color: #222;
        }
        .section { 
            margin-bottom: 30px;
        }
        .section h2 { 
            font-size: 15px;
            font-weight: 700;
            color: #0066cc;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0066cc;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th {
            background: #0066cc;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
        }
        td {
            padding: 12px;
            border: 1px solid #ddd;
            font-size: 13px;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .content-box {
            background: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 6px;
            font-size: 13px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #999;
        }
        .signature-line {
            margin-top: 30px;
            padding-top: 20px;
        }
        .line { 
            border-top: 1px solid #222;
            width: 200px;
            margin: 40px 0 5px 0;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Reporte de Mantenimiento</h1>
            <p>Equipo Biomédico | Sistema de Inventario</p>
        </div>

        <div class="metadata">
            <div class="meta-item">
                <span class="meta-label">Equipo</span>
                <span class="meta-value">${item.name || '—'}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Inventario</span>
                <span class="meta-value"><strong>${item.inventoryNo || '—'}</strong></span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Marca / Modelo</span>
                <span class="meta-value">${(item.brand || '—')} / ${(item.model || '—')}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Serie</span>
                <span class="meta-value">${record.serialNumber || item.serialNumber || '—'}</span>
            </div>
        </div>

        <div class="section">
            <h2>📅 Detalles del Servicio</h2>
            <table>
                <tr>
                    <th style="width: 40%">Parámetro</th>
                    <th style="width: 60%">Valor</th>
                </tr>
                <tr>
                    <td><strong>Motivo</strong></td>
                    <td>${record.reason || '—'}</td>
                </tr>
                <tr>
                    <td><strong>Técnico</strong></td>
                    <td>${record.technician || '—'}</td>
                </tr>
                <tr>
                    <td><strong>Inicio</strong></td>
                    <td>${formatDate(record.start)}</td>
                </tr>
                <tr>
                    <td><strong>Fin</strong></td>
                    <td>${formatDate(record.end)}</td>
                </tr>
                <tr>
                    <td><strong>Estado Resultante</strong></td>
                    <td><strong>${record.status || '—'}</strong></td>
                </tr>
            </table>
        </div>

        ${record.description ? `<div class="section">
            <h2>🔍 Descripción del Problema</h2>
            <div class="content-box">${(record.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}

        ${record.notes ? `<div class="section">
            <h2>✅ Trabajo Realizado</h2>
            <div class="content-box">${(record.notes || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}

        ${record.signature ? `<div class="section">
            <h2>📝 Observaciones del Técnico</h2>
            <div class="content-box">${(record.signature || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}

        <div class="signature-line">
            <p style="margin-bottom: 20px; font-size: 12px;"><strong>Firma del Técnico:</strong></p>
            <div class="line"></div>
            <p style="margin-top: 5px; font-size: 11px; color: #666;">${record.technician || 'Técnico'}</p>
        </div>

        <div class="footer">
            <p><strong>Generado:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p>Este documento fue generado automáticamente por el Sistema de Inventario Biomédico.</p>
            <p>Guarde este archivo para auditoría y cumplimiento normativo.</p>
        </div>
    </div>
</body>
</html>`

        // Generar PDF descargable
        const element = document.createElement('div')
        element.innerHTML = html
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Mantenimiento_${item.inventoryNo}_${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // Abrir en nueva ventana también
        setTimeout(() => {
            const w = window.open('', '_blank')
            if (w) {
                w.document.write(html)
                w.document.close()
            }
        }, 100)

    } catch (e) {
        console.error('Error generating PDF', e)
        alert('Error al generar el reporte: ' + e.message)
    }
}

function handleScan() {
    const code = String(scanCode.value).trim()
    if (!code) return alert('Ingrese un código de inventario')
    const it = items.value.find(x => x.inventoryNo === code)
    if (!it) return alert('Equipo no encontrado: ' + code)

    if (it.status === 'DISPONIBLE' || it.status === 'OPERATIVO') {
        // iniciar mantenimiento
        startMaintenance(it)
    } else if (it.status === 'EN MANTENIMIENTO') {
        // finalizar
        finishMaintenance(it)
    }

    scanCode.value = ''
}

function simulateExport() {
    console.log('Simulated export of all histories:', JSON.stringify(items.value.map(i => ({ inventoryNo: i.inventoryNo, history: i.history })), null, 2))
    alert('Simulación de descarga: revisar consola (historiales)')
}
</script>

<style scoped>
.biomedica-management-main {
    position: relative;
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
    background: none;
    border: none;
    padding: 0;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 24px;
    height: 24px;
}

.btn-back-to-dashboard:hover {
    color: #333;
    transform: translateX(-2px);
}

.spacer {
    flex: 1;
}

/* Filtros */
.filters-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-input {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 0.875rem;
    background: white;
    transition: all 0.2s ease;
}

.filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-group-narrow {
    grid-column: span 1;
}

.filter-group-compact {
    grid-column: span 1;
}

.active-filter-inline {
    grid-column: span 1;
    border: 1px solid #bfdbfe;
    background: #eff6ff;
    padding: 8px;
    border-radius: 6px;
}

/* Dropdown de filtros */
.dropdown-container {
    position: relative;
}

.btn-add-filters {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    position: relative;
}

.btn-add-filters:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
}

.btn-add-filters.has-active-filters {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1e40af;
}

.filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #ef4444;
    color: white;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
}

.filters-dropdown-new {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    width: 340px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    max-height: 480px;
    overflow-y: auto;
}

.dropdown-header-new {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
}

.dropdown-title-new {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
}

.btn-close-dropdown-new {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close-dropdown-new:hover {
    color: #111827;
}

.dropdown-content-new {
    padding: 12px 0;
    overflow-y: auto;
    flex: 1;
}

.filter-group-section {
    padding: 8px 0;
}

.section-label {
    padding: 8px 16px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.checkbox-item-new {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    user-select: none;
}

.checkbox-item-new:hover {
    background: #f9fafb;
}

.checkbox-item-new input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.checkbox-item-new span {
    font-size: 0.875rem;
    color: #374151;
}

.dropdown-footer-new {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
}

.btn-listo-new {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-listo-new:hover {
    background: #2563eb;
}

.btn-remove-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 4px;
    padding: 4px 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-remove-filter:hover {
    background: #fee2e2;
    color: #dc2626;
}

.btn-clear-filters {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-clear-filters:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
}

/* Summary Panel */
.summary-panel {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    margin-top: 24px;
    padding: 0;
}

.summary-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-card h4 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 16px;
}

.summary-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
}

.summary-stat-item .stat-label {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 600;
    text-align: center;
    margin-bottom: 6px;
}

.summary-stat-item .stat-value {
    font-weight: 700;
    font-size: 1.75rem;
    color: #111827;
}

.summary-stat-item .stat-value.is-green {
    color: #10b981;
}

.summary-stat-item .stat-value.is-yellow {
    color: #f59e0b;
}

.summary-stat-item .stat-value.is-blue {
    color: #3b82f6;
}

.btn-export {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 6px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-export:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Detail Modal */
.detail-modal {
    position: fixed;
    right: 24px;
    top: 80px;
    width: 420px;
    z-index: 40;
}

/* Transiciones */
.fade-in-enter-active,
.fade-in-leave-active {
    transition: all 0.2s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

@media (max-width: 1024px) {
    .summary-panel {
        grid-template-columns: 1fr;
    }

    .summary-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 768px) {
    .filters-section {
        grid-template-columns: 1fr;
    }

    .filter-group-narrow,
    .filter-group-compact,
    .active-filter-inline {
        grid-column: span 1 !important;
    }

    .filters-dropdown-new {
        width: calc(100vw - 32px);
        left: 16px;
        right: auto;
    }

    .summary-panel {
        grid-template-columns: 1fr;
    }

    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .summary-card {
        padding: 16px;
    }

    .summary-card h4 {
        font-size: 0.9rem;
        margin-bottom: 12px;
    }

    .detail-modal {
        position: fixed;
        width: calc(100vw - 32px);
        height: auto;
        max-height: 80vh;
        right: 16px;
        left: 16px;
        top: auto;
        bottom: 16px;
    }
}

/* Control styles */
.control {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 0.875rem;
    background: white;
    transition: all 0.2s ease;
}

.control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
