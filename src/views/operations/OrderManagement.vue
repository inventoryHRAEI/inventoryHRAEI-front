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
                        <div class="dropdown-container" @click.stop
                            style="min-width: fit-content;" ref="filterDropdownRef">
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
                            <div v-if="showMoreFilters" class="filters-dropdown">
                                <div class="dropdown-header">
                                    <span class="dropdown-title">Seleccionar filtros</span>
                                </div>
                                <div class="filters-checkboxes">
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterServiceActive" />
                                        <span>Servicio</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterEspecialidadActive" />
                                        <span>Especialidad</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterMotivoActive" />
                                        <span>Motivo de entrada</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterObservacionesActive" />
                                        <span>Observaciones</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterIngenieroActive" />
                                        <span>Ingeniero residente</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterTipoActive" />
                                        <span>Tipo de artículo</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterItemTextActive" />
                                        <span>Buscar en artículos</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="filterHoraActive" />
                                        <span>Rango de horas</span>
                                    </label>
                                </div>
                                <div class="dropdown-actions">
                                    <button type="button" class="btn-close-dropdown"
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
                                    <CustomSelect v-model="filterMotivo" :options="motivoEntradaOptions" placeholder="(Seleccionar)" class="filter-input" />
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
                                    <CustomSelect v-model="filterTipo" :options="tipoOptions" placeholder="Todos" class="filter-input" />
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
            <div class="table-wrapper">
                <table class="orders-table" v-if="filteredOrders.length > 0">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Solicitante</th>
                            <th>Fecha</th>
                            <th v-if="showColumnService">Servicio</th>
                            <th v-if="showColumnEspecialidad">Especialidad</th>
                            <th v-if="showColumnMotivo">Motivo</th>
                            <th v-if="showColumnDescripcion">Descripción</th>
                            <th v-if="showColumnObservaciones">Observaciones</th>
                            <th v-if="showColumnIngeniero">Ingeniero</th>
                            <th v-if="showColumnHora">Hora Inicio</th>
                            <th v-if="showColumnHora">Hora Término</th>
                            <th v-if="showColumnTipo">Tipo</th>
                            <th v-if="showColumnItems">Items</th>
                            <th v-if="showColumnEstado">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in filteredOrders" :key="order.id" class="order-row">
                            <td class="cell-folio">{{ order.folio }}</td>
                            <td>{{ order.nombreSolicitante }}</td>
                            <td>{{ formatDate(order.fecha) }}</td>
                            <td v-if="showColumnService">{{ order.servicio }}</td>
                            <td v-if="showColumnEspecialidad">{{ order.especialidad || '-' }}</td>
                            <td v-if="showColumnMotivo">{{ order.motivoEntrada || '-' }}</td>
                            <td v-if="showColumnDescripcion">{{ (order.descripcion || '').slice(0, 60) || '-' }}</td>
                            <td v-if="showColumnObservaciones">{{ (order.observaciones || '').slice(0, 60) || '-' }}
                            </td>
                            <td v-if="showColumnIngeniero">{{ order.nombreIngeniero || '-' }}</td>
                            <td v-if="showColumnHora">{{ order.horaInicio || '-' }}</td>
                            <td v-if="showColumnHora">{{ order.horaTermino || '-' }}</td>
                            <td v-if="showColumnTipo">{{ order.tipo || '-' }}</td>
                            <td v-if="showColumnItems">{{ (order.equiposEntrada || []).length || 0 }}</td>
                            <td v-if="showColumnEstado">
                                <span class="badge" :class="`badge-${order.estado || 'pendiente'}`">
                                    {{ order.estado || 'Pendiente' }}
                                </span>
                            </td>
                            <td class="cell-actions">
                                <button class="action-btn btn-edit" @click="openEditModal(order)" title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                    </svg>
                                </button>
                                <button class="action-btn btn-excel" @click="downloadExcel(order)"
                                    title="Descargar Excel">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                </button>
                                <button class="action-btn btn-delete" @click="deleteOrder(order.id)" title="Eliminar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                        </path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else class="empty-state">
                    <div class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    <h3>No hay órdenes</h3>
                    <p>{{ searchTerm || filterDate || filterService ? 'No se encontraron órdenes con los filtros seleccionados.' : 'Comienza creando una nueva orden.' }}</p>
                    <button class="btn-create-empty" @click="goToCreateOrder">Crear primera orden</button>
                </div>
            </div>

            <!-- Información de resultados -->
            <div v-if="filteredOrders.length > 0" class="results-info">
                Mostrando {{ filteredOrders.length }} de {{ allOrders.length }} órdenes
            </div>
        </ActionPanel>

        <!-- Modal de Edición con estructura completa OpEntrada -->
        <transition name="modal-fade">
            <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
                <div class="modal-content-full op-entrada-modal-full" @click.stop>
                    <button class="modal-close" @click="closeEditModal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="modal-header">
                        <h2 class="modal-title">Editar Orden: {{ editingOrder?.folio }}</h2>
                    </div>

                    <form class="op-entrada-form modal-form-full" @submit.prevent="updateAndDownloadExcel">
                        <!-- Datos del Solicitante -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <h4>Datos del Solicitante</h4>
                                <small class="hint">Información de quien solicita la entrada</small>
                            </div>
                            <div class="section-grid combined">
                                <div class="field">
                                    <label>Nombre del Solicitante</label>
                                    <input v-model.trim="editingOrder.nombreSolicitante" class="control"
                                        placeholder="Ej. Dr. Juan Pérez" />
                                </div>
                                <div class="field">
                                    <label>Servicio</label>
                                    <input v-model.trim="editingOrder.servicio" class="control"
                                        placeholder="Ej. Urgencias" />
                                </div>
                                <div class="field">
                                    <label>Especialidad</label>
                                    <input v-model.trim="editingOrder.especialidad" class="control"
                                        placeholder="Ej. Urgencias" />
                                </div>
                                <div class="field">
                                    <label>Folio</label>
                                    <input v-model.trim="editingOrder.folio" class="control" disabled />
                                </div>
                                <div class="field">
                                    <label>Fecha</label>
                                    <input v-model="editingOrder.fecha" type="date" class="control" />
                                </div>
                                <div class="field">
                                    <label>Hora de inicio</label>
                                    <input v-model="editingOrder.horaInicio" type="time" class="control" />
                                </div>
                                <div class="field">
                                    <label>Hora de término</label>
                                    <input v-model="editingOrder.horaTermino" type="time" class="control" />
                                </div>
                            </div>
                        </div>

                        <!-- Motivo y Descripción -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <h4>Motivo y Descripción de Entrada</h4>
                                <small class="hint">Especifica el motivo y una descripción de la entrada</small>
                            </div>
                            <div class="section-grid combined">
                                <div class="field" style="grid-column: span 6;">
                                    <label>Motivo de Entrada</label>
                                    <input v-model.trim="editingOrder.motivoEntrada" class="control"
                                        placeholder="Ej. Compra, Reparación, Donación" />
                                </div>
                                <div class="field" style="grid-column: 1 / -1;">
                                    <label>Descripción de Entrada</label>
                                    <textarea v-model.trim="editingOrder.descripcion" class="control"
                                        placeholder="Describe los detalles de la entrada"
                                        style="resize: vertical; min-height: 180px; padding: 12px 18px;"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Observaciones e Ingeniero -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <h4>Observaciones y Soporte</h4>
                                <small class="hint">Anota observaciones y el nombre del ingeniero residente de
                                    apoyo</small>
                            </div>
                            <div class="section-grid combined">
                                <div class="field" style="grid-column: span 12;">
                                    <label>Observaciones</label>
                                    <textarea v-model.trim="editingOrder.observaciones" class="control"
                                        placeholder="Escribe observaciones aquí" style="min-height: 120px;"></textarea>
                                    <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                                        <label class="btn secondary"
                                            style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px;">
                                            Subir imagen
                                            <input type="file" accept="image/*" @change="onEditObservacionesImgChange"
                                                style="display:none;" />
                                        </label>
                                        <div v-if="editingOrder.observacionesImg" class="observ-img-preview"
                                            style="display:flex; align-items:center; gap:10px;">
                                            <img :src="editingOrder.observacionesImg.dataUrl || editingOrder.observacionesImg"
                                                alt="preview"
                                                style="width:90px; height:56px; object-fit:cover; border-radius:8px; border:1px solid rgba(255,255,255,0.1)" />
                                            <div style="display:flex; flex-direction:column; gap:6px;">
                                                <span style="font-weight:700; color:rgba(255,255,255,0.9)">{{ typeof
                                                    editingOrder.observacionesImg === 'string' ? 'Imagen' :
                                                    editingOrder.observacionesImg.name }}</span>
                                                <button type="button" class="btn secondary"
                                                    @click="removeEditObservacionesImg"
                                                    style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="field ing-res">
                                    <label>Ingeniero residente (apoyo)</label>
                                    <input v-model.trim="editingOrder.nombreIngeniero" class="control"
                                        placeholder="Nombre del ingeniero residente" />
                                </div>
                            </div>
                        </div>

                        <!-- Equipos / Artículos -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <h4>Equipo Médico, Accesorio o Consumible que Entra</h4>
                                <small class="hint">Artículos en esta orden</small>
                            </div>
                            <div v-if="editingOrder.equiposEntrada && editingOrder.equiposEntrada.length > 0"
                                class="items-list-edit">
                                <div v-for="(item, index) in editingOrder.equiposEntrada" :key="index"
                                    class="item-row-edit">
                                    <div class="item-head-edit">
                                        <span class="badge">#{{ index + 1 }}</span>
                                        <span style="font-weight: 700;">{{ item.tipo }}</span>
                                        <span style="margin-left: 10px; color: rgba(255,255,255,0.6);">x{{ item.cantidad
                                            }}</span>
                                    </div>
                                    <div style="display:flex; gap:8px;">
                                        <div
                                            style="flex:1; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                                            <p style="margin:0; font-size:0.85rem; color:rgba(255,255,255,0.7);">{{
                                                item.descripcion || item.nombre || 'Sin descripción' }}</p>
                                        </div>
                                        <div style="display:flex; gap:8px; align-items:center;">
                                            <button class="action-btn" title="Editar item"
                                                @click="toggleEditItem(index)">Editar</button>
                                            <button class="action-btn btn-delete" title="Eliminar item"
                                                @click="removeEditItem(index)">Eliminar</button>
                                        </div>
                                    </div>
                                    <div v-if="editingItemIndex === index"
                                        style="margin-top:8px; display:flex; gap:8px; align-items:center;">
                                        <input class="control" v-model="editingOrder.equiposEntrada[index].descripcion"
                                            placeholder="Descripción" />
                                        <input class="control"
                                            v-model.number="editingOrder.equiposEntrada[index].cantidad" type="number"
                                            min="1" style="width:80px;" />
                                        <input class="control" v-model="editingOrder.equiposEntrada[index].marca"
                                            placeholder="Marca" />
                                        <input class="control" v-model="editingOrder.equiposEntrada[index].modelo"
                                            placeholder="Modelo" />
                                    </div>
                                </div>
                            </div>

                            <p v-else
                                style="color: rgba(255, 255, 255, 0.5); font-style: italic; text-align: center; margin: 20px 0;">
                                No hay artículos agregados en esta orden
                            </p>
                            <div style="display:flex; gap:12px; margin-top:12px; align-items:center;">
                                <div style="width:220px;">
                                    <CustomSelect v-model="newEditItem.tipo" :options="tipoOptions" placeholder="Seleccionar tipo" />
                                </div>
                                <input class="control" v-model="newEditItem.descripcion" placeholder="Descripción" />
                                <input class="control" v-model.number="newEditItem.cantidad" type="number" min="1"
                                    style="width:100px;" />
                                <button type="button" class="btn primary" @click="addEditItem">Agregar Item</button>
                            </div>
                        </div>

                        <!-- Estado -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <h4>Estado de la Orden</h4>
                            </div>
                            <div class="section-grid combined">
                                <div class="field">
                                    <label>Estado</label>
                                    <CustomSelect v-model="editingOrder.estado" :options="estadoOptions" />
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div class="modal-actions-full">
                            <button type="button" class="btn secondary cancel-btn" @click="closeEditModal">
                                Cancelar
                            </button>
                            <button type="submit" class="btn primary save-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Actualizar y Descargar Excel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'
import { useRouter } from 'vue-router'
import ActionPanel from '@/components/ActionPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import DatePicker from '@/components/DatePicker.vue'
import CustomSelect from '@/components/CustomSelect.vue'

const router = useRouter()


const allOrders = ref([])
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
const filterTipoActive = ref(false)
const filterItemTextActive = ref(false)
const filterHoraActive = ref(false)
const filterEstado = ref('')
const filterHoraInicioFrom = ref('')
const filterHoraInicioTo = ref('')
const filterMinItems = ref(null)
const filterMaxItems = ref(null)
const filterTipo = ref('')
const filterItemText = ref('')
const loading = ref(true)
const showEditModal = ref(false)
const editingOrder = ref(null)
const newEditItem = ref({ tipo: '', cantidad: 1, descripcion: '', marca: '', modelo: '', serie: '', lote: '', referencia: '', claveHRAEI: '', unidades: [] })
const editingItemIndex = ref(-1)
const filterDropdownRef = ref(null)

// Keep a normalized ISO-like date in `filterDate` for comparisons (YYYY-MM-DD)
watch(filterDateDisplay, (val) => {
    if (!val) {
        filterDate.value = ''
        return
    }
    // Expecting DatePicker display in dd/mm/yyyy
    const parts = String(val).split('/')
    if (parts.length === 3) {
        const dd = parts[0].padStart(2, '0')
        const mm = parts[1].padStart(2, '0')
        const yyyy = parts[2]
        filterDate.value = `${yyyy}-${mm}-${dd}`
    } else {
        // fallback: try to parse native ISO
        try {
            const d = new Date(val)
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear()
                const mm = String(d.getMonth() + 1).padStart(2, '0')
                const dd = String(d.getDate()).padStart(2, '0')
                filterDate.value = `${yyyy}-${mm}-${dd}`
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
        filterHoraActive.value
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
        filterHoraActive.value
    )
})

const filteredOrders = computed(() => {
    return allOrders.value.filter(order => {
        const matchFolio = !filterFolio.value || order.folio?.toLowerCase().includes(filterFolio.value.toLowerCase())
        const matchSolicitante = !filterSolicitante.value || order.nombreSolicitante?.toLowerCase().includes(filterSolicitante.value.toLowerCase())
        const matchSearch = !searchTerm.value || order.folio?.toLowerCase().includes(searchTerm.value.toLowerCase()) || order.nombreSolicitante?.toLowerCase().includes(searchTerm.value.toLowerCase())

        const matchDate = !filterDate.value || order.fecha === filterDate.value

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
        const itemCount = (order.equiposEntrada || []).length || 0
        const matchMin = filterMinItems.value == null || filterMinItems.value === '' || itemCount >= Number(filterMinItems.value)
        const matchMax = filterMaxItems.value == null || filterMaxItems.value === '' || itemCount <= Number(filterMaxItems.value)
        return matchFolio && matchSolicitante && matchSearch && matchDate && matchService && matchEspecialidad && matchMotivo && matchObservaciones && matchIngeniero && matchTipo && matchItemText && matchEstado && matchHoraFrom && matchHoraTo && matchMin && matchMax
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
}

function closeEditModal() {
    showEditModal.value = false
    editingOrder.value = null
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

function deleteOrder(orderId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) {
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

function removeEditItem(idx) {
    if (!editingOrder.value) return
    if (!confirm('¿Eliminar este artículo de la orden?')) return
    editingOrder.value.equiposEntrada.splice(idx, 1)
}

function toggleEditItem(idx) {
    editingItemIndex.value = editingItemIndex.value === idx ? -1 : idx
}

// Simular carga de órdenes desde API
function loadOrders() {
    loading.value = true
    // Datos por defecto: se intenta obtener desde el backend y localStorage
    const mockOrders = [
        {
            id: 1,
            folio: '5-011',
            nombreSolicitante: 'Dr. Juan Pérez',
            servicio: 'Urgencias',
            especialidad: 'Medicina General',
            fecha: '2024-12-09',
            horaInicio: '08:00',
            horaTermino: '10:00',
            motivoEntrada: 'Compra',
            descripcion: 'Ingreso de equipos médicos nuevos',
            estado: 'completado'
        },
        {
            id: 2,
            folio: '5-012',
            nombreSolicitante: 'Dra. María González',
            servicio: 'Quirófano',
            especialidad: 'Cirugía',
            fecha: '2024-12-08',
            horaInicio: '14:00',
            horaTermino: '16:00',
            motivoEntrada: 'Reparación',
            descripcion: 'Equipo retornado después de mantenimiento',
            estado: 'completado'
        },
        {
            id: 3,
            folio: '5-013',
            nombreSolicitante: 'Dr. Carlos López',
            servicio: 'Urgencias',
            especialidad: 'Traumatología',
            fecha: '2024-12-10',
            horaInicio: '09:30',
            horaTermino: null,
            motivoEntrada: 'Donación',
            descripcion: 'Equipos donados por institución externa',
            estado: 'pendiente'
        }
    ]

    // Try to fetch from backend list endpoint
    setTimeout(async () => {
        try {
            const res = await fetch('/api/ops/entrada/list')
            if (res.ok) {
                const body = await res.json()
                const items = Array.isArray(body.items) ? body.items.map(it => it.payload || it) : []
                allOrders.value = items.map((p, idx) => ({ id: p.id || idx + 1, ...p }))
                // Merge local 'orders_list' as well, avoid duplicates
                try {
                    const rawLocal = localStorage.getItem('orders_list')
                    if (rawLocal) {
                        const localArr = JSON.parse(rawLocal) || []
                        localArr.forEach(localItem => {
                            if (!allOrders.value.some(o => String(o.id) === String(localItem.id))) {
                                allOrders.value.push(localItem)
                            }
                        })
                    }
                } catch (e) { }
            } else {
                // fallback to mock
                allOrders.value = mockOrders
            }
        } catch (err) {
            // If backend not available, try to load localStorage orders
            try {
                const localOrdersRaw = localStorage.getItem('orders_list')
                if (localOrdersRaw) {
                    const arr = JSON.parse(localOrdersRaw)
                    allOrders.value = Array.isArray(arr) ? arr : mockOrders
                } else {
                    allOrders.value = mockOrders
                }
            } catch (e) {
                allOrders.value = mockOrders
            }
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
    height: 22px;
    line-height: 22px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

.filters-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 6px;
    background: rgba(13, 20, 35, 0.98);
    border: 1px solid rgba(46, 221, 90, 0.2);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    z-index: 1000;
    min-width: 240px;
    animation: slideDownDropdown 0.2s ease;
    overflow: visible;
}

@keyframes slideDownDropdown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.dropdown-header {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dropdown-title {
    font-size: 0.80rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.filters-checkboxes {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 220px;
    overflow-y: auto;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.85rem;
}

.checkbox-item:hover {
    background: rgba(46, 221, 90, 0.1);
}

.checkbox-item input[type="checkbox"] {
    cursor: pointer;
    accent-color: #2edd5a;
    width: 16px;
    height: 16px;
}

.checkbox-item span {
    user-select: none;
}

.dropdown-actions {
    padding: 10px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    justify-content: flex-end;
}

.btn-close-dropdown {
    padding: 6px 12px;
    background: rgba(46, 221, 90, 0.15);
    border: 1px solid rgba(46, 221, 90, 0.3);
    color: rgba(46, 221, 90, 0.9);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.80rem;
    font-weight: 600;
    transition: all 0.2s ease;
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
