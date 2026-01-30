<template>
    <div :class="{ 'opservicio-readonly': isReadOnly }" :aria-readonly="isReadOnly ? 'true' : 'false'"
        @beforeinput.capture="onReadOnlyBeforeInput" @input.capture="onReadOnlyInput" @change.capture="onReadOnlyChange"
        @paste.capture="onReadOnlyPaste" @keydown.capture="onReadOnlyKeydown" @focusin.capture="onReadOnlyFocusIn"
        @mousedown.capture="onReadOnlyMouseDown">
        <FormShell>
            <template #title v-if="props.modo !== 'editar'">
                <div class="servicio-title-row">
                    <button class="btn-back-to-orders" @click="goToOrderManagement" title="Volver a gestión de órdenes">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <span>Órdenes de Servicio</span>
                </div>
            </template>

            <template #title v-else>
                <div class="edit-title-header">
                    <div class="edit-title-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Editando</span>
                    </div>
                    <h2 class="edit-title">Editando orden de servicio</h2>
                    <p class="edit-subtitle" v-if="ordenInfo.folio">Folio: <strong>{{ ordenInfo.folio }}</strong></p>
                </div>
            </template>

            <template #body>
                <Breadcrumbs v-if="props.modo !== 'editar'" />
                <div class="op-card insumos op-servicio-form" ref="rootRef">
                    <form @submit.prevent="onSubmit" class="form-grid" id="servicio-form" novalidate>
                        <div class="section-card combined-card observaciones-support">
                            <div class="section-head">
                                <div class="section-title-with-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <h4>Datos del Solicitante</h4>
                                </div>
                                <small class="hint">Información de quien solicita el servicio</small>
                            </div>
                            <div class="section-grid combined">
                                <!-- Primera fila -->
                                <div :class="['field', diffFieldClass('nombreSolicitante')]">
                                    <label>Nombre del Solicitante</label>
                                    <input class="control" v-model.trim="form.nombreSolicitante"
                                        placeholder="Ej. Dr. Juan Pérez" />
                                </div>

                                <div :class="['field', diffFieldClass('servicio')]">
                                    <label>Servicio</label>
                                    <input class="control" v-model.trim="form.servicio" placeholder="Ej. Urgencias" />
                                </div>

                                <div :class="['field', diffFieldClass('especialidad')]">
                                    <label>Especialidad</label>
                                    <input class="control" v-model.trim="form.especialidad"
                                        placeholder="Ej. Urgencias" />
                                </div>

                                <div :class="['field', diffFieldClass('folio')]">
                                    <label>Folio</label>
                                    <div style="display:flex; flex-direction:column; gap:6px">
                                        <FolioInput v-model="form.folio" prefix="O-" />
                                        <small class="hint">Formato requerido: <code>O-001</code></small>
                                    </div>
                                </div>

                                <!-- Segunda fila -->
                                <div :class="['field', diffFieldClass('fecha')]">
                                    <label>Fecha</label>
                                    <div style="display:flex; flex-direction:column; gap:6px">
                                        <DatePicker v-model="form.fechaISO" :forceFlowbite="true"
                                            placeholder="Seleccionar fecha" />
                                        <small class="hint" style="font-size:0.9rem">Seleccionado: <strong>{{
                                            formatDate(form.fecha) }}</strong></small>
                                    </div>
                                </div>

                                <div :class="['field', diffFieldClass('horaInicio')]">
                                    <label>Hora de inicio</label>
                                    <TimePicker v-model="form.horaInicio" placeholder="14:00" />
                                </div>

                                <div :class="['field', diffFieldClass('horaTermino')]">
                                    <label>Hora de término</label>
                                    <div class="term-input-row">
                                        <input ref="endTimeInputRef" class="control term-input" type="text"
                                            :value="displayEndTime" readonly tabindex="-1" aria-disabled="true"
                                            placeholder="Se calcula automáticamente" />
                                        <button ref="helpIconRef" type="button" class="help-icon-btn"
                                            aria-label="La hora de término se establece al pulsar Guardar orden. No editable."
                                            @mouseenter="showTermTooltip" @mouseleave="hideTermTooltip"
                                            @focus="showTermTooltip" @blur="hideTermTooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"></path>
                                                <line x1="12" y1="17" x2="12" y2="17"></line>
                                            </svg>
                                        </button>
                                        <Teleport to="body">
                                            <div v-if="tooltipVisible" :style="tooltipStyle" class="term-tooltip-portal"
                                                role="tooltip">La hora de término se establece al pulsar <strong>Guardar
                                                    orden</strong>. No editable.</div>
                                        </Teleport>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Motivo y Descripción de Entrada -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <div class="section-title-with-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    <h4>Motivo y Descripción de Servicio</h4>
                                </div>
                                <small class="hint">Especifica el motivo y una descripción del servicio</small>
                            </div>
                            <div class="section-grid combined">
                                <div :class="['field', diffFieldClass('motivoEntrada')]" style="grid-column: span 6;">
                                    <label>Motivo de Servicio</label>
                                    <CustomSelect v-model="form.motivoEntrada" :options="motivoEntradaOptions"
                                        placeholder="Seleccionar motivo" />
                                </div>

                                <div v-if="form.motivoEntrada === 'otro'"
                                    :class="['field', diffFieldClass('otroMotivo')]" style="grid-column: span 6;">
                                    <label>Especifique Motivo de Servicio</label>
                                    <input class="control" v-model.trim="form.otroMotivo"
                                        placeholder="Especifique el motivo" />
                                </div>

                                <div :class="['field', diffFieldClass('descripcion')]" style="grid-column: 1 / -1;">
                                    <label>Descripción del Servicio</label>
                                    <textarea class="control" v-model.trim="form.descripcion"
                                        placeholder="Describe los detalles del servicio"
                                        style="resize: vertical; min-height: 180px; padding: 12px 18px;"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Equipo Médico, Accesorio o Consumible que Entra -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <div class="section-title-with-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="12" y1="8" x2="12" y2="16"></line>
                                        <line x1="8" y1="12" x2="16" y2="12"></line>
                                    </svg>
                                    <h4>Equipo Médico, Accesorio o Consumible para Servicio</h4>
                                </div>
                                <small class="hint">Agrega uno o más elementos para el servicio</small>
                            </div>

                            <!-- Formulario para agregar nuevo item -->
                            <div v-if="!isReadOnly" class="add-item-form">
                                <div class="add-item-form__inner">
                                    <!-- Selector de tipo y cantidad -->
                                    <div class="add-item-controls">
                                        <div class="field field--tipo" :class="{ 'is-shifted': newItem.tipo }"
                                            :style="{ position: 'relative', zIndex: 1001 }">
                                            <label class="form-label form-label--center">¿Qué se atiende?</label>
                                            <CustomSelect v-model="newItem.tipo" :options="tipoEntradaOptions"
                                                placeholder="Seleccionar tipo" @toggle="tipoDropdownOpen = $event" />
                                        </div>
                                        <transition name="slide-cantidad" @enter="onEnterCantidad"
                                            @leave="onLeaveCantidad">
                                            <div class="field field--cantidad" v-if="newItem.tipo">
                                                <label
                                                    class="form-label form-label--small form-label--center">CANTIDAD</label>
                                                <div class="counter">
                                                    <button class="ctr-btn wide" type="button" @click="decNewBy(5)"
                                                        aria-label="Disminuir cinco">-5</button>
                                                    <button class="ctr-btn" type="button" @click="decNew"
                                                        aria-label="Disminuir uno">-</button>
                                                    <input class="control ctr-input" v-model.number="newItem.cantidad"
                                                        type="number" min="0" step="1" inputmode="numeric"
                                                        @input="ajustarUnidadesEquipo" />
                                                    <button class="ctr-btn" type="button" @click="incNew"
                                                        aria-label="Aumentar uno">+</button>
                                                    <button class="ctr-btn wide" type="button" @click="incNewBy(5)"
                                                        aria-label="Aumentar cinco">+5</button>
                                                </div>
                                            </div>
                                        </transition>
                                    </div>

                                    <!-- Campos para Equipo Médico o Mobiliario -->
                                    <div v-if="newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario'"
                                        class="section-card items-card">
                                        <div class="section-head">
                                            <h4>{{ getTipoLabel(newItem.tipo) }} (unidades) - {{ newItem.unidades.length
                                                }}</h4>
                                            <small class="hint">Completa la información individual de cada
                                                unidad</small>
                                        </div>
                                        <div class="section-list">
                                            <p v-if="!newItem.unidades.length" class="empty-hint">
                                                Ajusta la cantidad para generar las unidades necesarias.
                                            </p>
                                            <div v-for="(unidad, idx) in newItem.unidades" :key="idx"
                                                class="item-row unidades-grid-row">
                                                <div class="item-head">
                                                    <span class="badge">#{{ idx + 1 }}</span>
                                                    {{ getTipoLabel(newItem.tipo) }}
                                                </div>
                                                <div class="item-grid unidades-grid">
                                                    <!-- Fila 1: Nombre y Cantidad (dos columnas) -->
                                                    <div class="field field-compact">
                                                        <label class="field-label">{{
                                                            getNombreLabel() }}</label>
                                                        <input class="control" v-model.trim="unidad.nombre"
                                                            :placeholder="getNombrePlaceholder()" />
                                                    </div>
                                                    <!-- colocar cantidad a la derecha del nombre -->
                                                    <div class="field field-medium unit-qty-field">
                                                        <label class="field-label">Cantidad</label>
                                                        <input class="control unit-qty-input"
                                                            v-model.number="unidad.cantidad" type="number" min="1"
                                                            step="1" />
                                                    </div>
                                                    <!-- Fila 2: Marca y Ubicación -->
                                                    <div class="field field-medium">
                                                        <label class="field-label">Marca</label>
                                                        <input class="control" v-model.trim="unidad.marca"
                                                            placeholder="Ej. Philips" />
                                                    </div>
                                                    <div class="field field-medium">
                                                        <label class="field-label">Ubicación</label>
                                                        <input class="control" v-model.trim="unidad.ubicacion"
                                                            placeholder="Ej. UCIA" />
                                                    </div>
                                                    <!-- Fila 3: Modelo y No. Serie -->
                                                    <div class="field field-compact">
                                                        <label class="field-label">Modelo</label>
                                                        <input class="control" v-model.trim="unidad.modelo"
                                                            placeholder="Ej. MX40" />
                                                    </div>
                                                    <div class="field field-compact">
                                                        <label class="field-label">No. Serie</label>
                                                        <input class="control" v-model.trim="unidad.serie"
                                                            placeholder="Ej. 3500" />
                                                    </div>
                                                    <!-- Fila 4: Referencia y Clave HRAEI -->
                                                    <div class="field field-medium">
                                                        <label class="field-label">Referencia</label>
                                                        <input class="control" v-model.trim="unidad.referencia"
                                                            placeholder="Ej. 9K9162" />
                                                    </div>
                                                    <div class="field field-medium">
                                                        <label class="field-label">Clave HRAEI</label>
                                                        <input class="control" v-model.trim="unidad.claveHRAEI"
                                                            placeholder="Ej. COMODATO" />
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Campos para Accesorio / Consumible / Refacción: usar estilo tipo 'Equipo Médico' -->
                                    <div v-if="['accesorio', 'consumible', 'refaccion'].includes(newItem.tipo)"
                                        class="section-card items-card">
                                        <div class="section-head">
                                            <h4>{{ getTipoLabel(newItem.tipo) }} - {{ newItem.cantidad }}</h4>
                                            <small class="hint">Completa la información individual de cada
                                                unidad</small>
                                        </div>
                                        <div class="section-list">
                                            <p v-if="!newItem.unidades.length" class="empty-hint">Ajusta la cantidad
                                                para generar las unidades necesarias.</p>
                                            <div v-for="(unidad, idx) in newItem.unidades" :key="idx"
                                                class="item-row unidades-grid-row">
                                                <div class="item-head">
                                                    <span class="badge">#{{ idx + 1 }}</span>
                                                    {{ getTipoLabel(newItem.tipo) }}
                                                </div>

                                                <div class="item-grid unidades-grid">
                                                    <div class="field field-medium">
                                                        <label class="field-label">{{
                                                            getNombreLabel() }}</label>
                                                        <input class="control" v-model.trim="unidad.nombre"
                                                            :placeholder="getNombrePlaceholder()" />
                                                    </div>
                                                    <!-- cantidad al lado del nombre para mantener layout de 2 columnas -->
                                                    <div class="field field-medium unit-qty-field">
                                                        <label class="field-label">Cantidad</label>
                                                        <input class="control unit-qty-input"
                                                            v-model.number="unidad.cantidad" type="number" min="1"
                                                            step="1" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Marca</label>
                                                        <input class="control" v-model.trim="unidad.marca"
                                                            placeholder="Ej. Philips" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Modelo</label>
                                                        <input class="control" v-model.trim="unidad.modelo"
                                                            placeholder="Ej. MX40" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Ubicación</label>
                                                        <input class="control" v-model.trim="unidad.ubicacion"
                                                            placeholder="Ej. Sala de equipos" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">No. Serie</label>
                                                        <input class="control" v-model.trim="unidad.serie"
                                                            placeholder="Ej. SN123456" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Lote</label>
                                                        <input class="control" v-model.trim="unidad.lote"
                                                            placeholder="Ej. L2024001" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Referencia</label>
                                                        <input class="control" v-model.trim="unidad.referencia"
                                                            placeholder="Ej. 9K9162" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Equipo asociado</label>
                                                        <input class="control" v-model.trim="unidad.equipoAsociado"
                                                            placeholder="Ej. Monitor (si aplica)" />
                                                    </div>

                                                    <div class="field field-medium">
                                                        <label class="field-label">Clave HRAEI</label>
                                                        <input class="control" v-model.trim="unidad.claveHRAEI"
                                                            placeholder="Ej. COMODATO" />
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Botón agregar -->
                                    <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                                        <button type="button" class="btn primary btn-add-item" @click="agregarItem"
                                            :disabled="!canAddItem">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                                stroke-linecap="round" stroke-linejoin="round"
                                                style="margin-right: 8px;">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                            Agregar Item
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Lista de items agregados -->
                            <div v-if="form.equiposEntrada.length > 0" class="items-list"
                                style="display: flex; flex-direction: column; gap: 16px;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <div
                                        style="flex: 1; height: 2px; background: linear-gradient(to right, rgb(59, 130, 246), transparent);">
                                    </div>
                                    <h5
                                        style="margin: 0; font-size: 1.05rem; color: rgba(15, 23, 42, 0.95); font-weight: 700;">
                                        Items Agregados
                                        <span
                                            style="display: inline-block; background: rgb(59, 130, 246); color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; margin-left: 8px;">{{
                                                form.equiposEntrada.length }}</span>
                                    </h5>
                                    <div
                                        style="flex: 1; height: 2px; background: linear-gradient(to left, rgb(59, 130, 246), transparent);">
                                    </div>
                                </div>

                                <div v-for="(item, index) in form.equiposEntrada" :key="index"
                                    :class="['item-row', diffItemClass(item), { 'item-row-exit': exitingItems.includes(item), 'item-row-readonly': !isItemEditable(index) && props.modo === 'editar' }]">
                                    <div class="item-head">
                                        <span class="badge">#{{ index + 1 }}</span>
                                        <span style="font-weight: 700; color: rgba(15, 23, 42, 0.9);">{{
                                            getTipoLabel(item.tipo) }}</span>
                                        <span style="margin-left: 10px; color: rgba(71, 85, 105, 0.8);">x{{
                                            item.cantidad }}</span>
                                    </div>

                                    <div class="item-grid">
                                        <div class="field" v-if="item.descripcion">
                                            <label>Descripción</label>
                                            <div>{{ item.descripcion }}</div>
                                        </div>
                                        <div class="field" v-if="item.marca">
                                            <label>Marca</label>
                                            <div>{{ item.marca }}</div>
                                        </div>
                                        <div class="field" v-if="item.modelo && !item.unidades">
                                            <label>Modelo</label>
                                            <div>{{ item.modelo }}</div>
                                        </div>
                                        <div class="field" v-if="item.ubicacion">
                                            <label>Ubicación</label>
                                            <div>{{ item.ubicacion }}</div>
                                        </div>
                                        <div class="field" v-if="item.claveHRAEI && !item.unidades">
                                            <label>Clave HRAEI</label>
                                            <div>{{ item.claveHRAEI }}</div>
                                        </div>
                                        <div class="field" v-if="item.cantidad != null">
                                            <label>Cantidad</label>
                                            <div>{{ item.cantidad }}</div>
                                        </div>
                                        <div class="field" v-if="item.unidades && item.unidades.length">
                                            <label>Desglose por unidad</label>
                                            <div>
                                                <ul
                                                    style="margin:0; padding-left: 18px; font-weight:600; color: rgba(15,23,42,0.78);">
                                                    <li v-for="(u, ui) in item.unidades" :key="ui">{{ (u.nombre ||
                                                        'Unidad ' + (ui + 1)) }} — x{{ u.cantidad || 1 }}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Unidades individuales (para equipos médicos/mobiliario) -->
                                    <div v-if="item.unidades && item.unidades.length > 0"
                                        class="section-card items-card">
                                        <div class="section-head">
                                            <h4>Detalles individuales</h4>
                                            <small class="hint">Información completa de cada unidad</small>
                                        </div>
                                        <div class="section-list">
                                            <div v-for="(unidad, uIdx) in item.unidades" :key="uIdx"
                                                :class="['item-unidades-card', { 'unit-exit': exitingUnits.includes(unidad) }]">
                                                <article class="detalle-card detalle-card--compact"
                                                    :class="diffItemClass(item)">
                                                    <div class="detalle-card__glow"></div>
                                                    <div class="detalle-card__inner" :class="diffItemClass(item)">
                                                        <header class="detalle-card__header">
                                                            <span class="detalle-card__badge">#{{ uIdx + 1 }}</span>
                                                            <div>
                                                                <p class="detalle-card__title">{{
                                                                    getTipoLabel(item.tipo) }}</p>
                                                                <small class="detalle-card__subtitle">Detalle
                                                                    rápido</small>
                                                            </div>
                                                            <span class="detalle-card__icon"
                                                                aria-hidden="true">🧾</span>
                                                            <button class="detalle-card__edit" type="button"
                                                                :disabled="!isItemEditable(index)"
                                                                :aria-disabled="(!isItemEditable(index)).toString()"
                                                                title="Editar item" aria-label="Editar item"
                                                                @click="editUnit(item, unidad, uIdx)">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18"
                                                                    height="18" viewBox="0 0 24 24" fill="none"
                                                                    stroke="currentColor" stroke-width="2"
                                                                    stroke-linecap="round" stroke-linejoin="round">
                                                                    <path
                                                                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">
                                                                    </path>
                                                                    <path
                                                                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
                                                                    </path>
                                                                </svg>
                                                            </button>
                                                            <TrashButton class="detalle-card__trash"
                                                                :disabled="!isItemEditable(index)"
                                                                :duration="trashAnimationDuration"
                                                                @done="onUnitTrashDone(item, unidad)" />
                                                        </header>
                                                        <div class="detalle-card__grid">
                                                            <div class="detalle-card__pair" style="--pair-hue: 210">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <IdentificationIcon
                                                                        class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Nombre</span>
                                                                    <span class="detalle-card__value">{{ unidad.nombre
                                                                        || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 150">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <TagIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Marca</span>
                                                                    <span class="detalle-card__value">{{ unidad.marca ||
                                                                        '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 75">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <MapPinIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Ubicación</span>
                                                                    <span class="detalle-card__value">{{
                                                                        unidad.ubicacion || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 340">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <DevicePhoneMobileIcon
                                                                        class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Modelo</span>
                                                                    <span class="detalle-card__value">{{ unidad.modelo
                                                                        || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 20">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <FingerPrintIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">No. Serie</span>
                                                                    <span class="detalle-card__value">{{ unidad.serie ||
                                                                        '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 280">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <DocumentTextIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Referencia</span>
                                                                    <span class="detalle-card__value">{{
                                                                        unidad.referencia || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 65">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <ClipboardDocumentListIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Lote</span>
                                                                    <span class="detalle-card__value">{{ unidad.lote || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 10">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <DocumentTextIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Equipo asociado</span>
                                                                    <span class="detalle-card__value">{{ unidad.equipoAsociado || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair" style="--pair-hue: 110">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <KeyIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Clave HRAEI</span>
                                                                    <span class="detalle-card__value">{{
                                                                        unidad.claveHRAEI || '-' }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="detalle-card__pair detalle-card__pair--qty"
                                                                style="--pair-hue: 200">
                                                                <span class="detalle-card__chip" aria-hidden="true">
                                                                    <HashtagIcon class="detalle-card__chip-icon" />
                                                                </span>
                                                                <div class="detalle-card__pair-body">
                                                                    <span class="detalle-card__label">Cantidad</span>
                                                                    <input
                                                                        class="detalle-card__value detalle-card__qty-input"
                                                                        type="number" min="1"
                                                                        v-model.number="unidad.cantidad" disabled
                                                                        aria-disabled="true"
                                                                        style="width:72px; padding:6px 8px; border-radius:8px; border:1px solid rgba(15,23,42,0.08); background: transparent; color: rgba(15,23,42,0.85);" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p v-if="form.equiposEntrada.length === 0" class="section-empty-hint"
                                :class="{ 'is-covered': tipoDropdownOpen }">
                                No se han agregado equipos para servicio
                            </p>
                        </div>

                        <!-- Observaciones e Ingeniero Residente (Apoyo) -->
                        <div class="section-card combined-card">
                            <div class="section-head">
                                <div class="section-title-with-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="10" cy="7" r="4"></circle>
                                        <path d="M22 11h-6"></path>
                                    </svg>
                                    <h4>Observaciones y Soporte</h4>
                                </div>
                                <small class="hint">Anota observaciones y el nombre del ingeniero residente de
                                    apoyo</small>
                            </div>
                            <div class="section-grid combined">
                                <div :class="['field', diffFieldClass('observaciones')]" style="grid-column: span 12;">
                                    <label>Observaciones</label>
                                    <textarea class="control" v-model.trim="form.observaciones"
                                        placeholder="Escribe observaciones aquí" style="min-height: 120px;"></textarea>
                                    <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                                        <label v-if="!isReadOnly" class="btn secondary"
                                            style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px;">
                                            Subir imagen
                                            <input type="file" accept="image/*" @change="onObservacionesImgChange"
                                                style="display:none;" />
                                        </label>
                                        <div v-if="form.observacionesImg" class="observ-img-preview"
                                            style="display:flex; align-items:center; gap:10px;">
                                            <img :src="form.observacionesImg.dataUrl" alt="preview"
                                                style="width:90px; height:56px; object-fit:cover; border-radius:8px; border:1px solid rgba(0,0,0,0.06)" />
                                            <div style="display:flex; flex-direction:column; gap:6px;">
                                                <span style="font-weight:700; color:rgba(15,23,42,0.9)">{{
                                                    form.observacionesImg.name }}</span>
                                                <button v-if="!isReadOnly" type="button" class="btn secondary"
                                                    @click="removeObservacionesImg"
                                                    style="padding:6px 10px; font-size:0.85rem;">Quitar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div :class="['field', 'ing-res', diffFieldClass('nombreIngeniero')]">
                                    <label>Ingeniero residente (apoyo)</label>
                                    <input class="control" v-model.trim="form.nombreIngeniero"
                                        placeholder="Nombre del ingeniero residente" />
                                </div>
                            </div>
                        </div>

                    </form>

                        <!-- Firmas (siempre presentes) -->
                        <div class="section-card">
                        <div class="section-head">
                         <div class="section-title-with-icon">
                           <h4>Firmas</h4>
                         </div>
                         <small class="hint">Marca "Sí" si conoces el nombre de la persona; los nombres se mostrarán en el PDF en el orden especificado</small>
                        </div>
                        <div class="section-list" style="padding:12px; display:grid; gap:16px;">
                                                 <div v-for="(s, idx) in form.signatures" :key="s.key" style="display:flex; align-items:stretch; gap:12px; background:rgba(59,130,246,0.05); padding:12px; border-radius:8px; border:1px solid rgba(59,130,246,0.1);">
                                                         <div style="flex:1;">
                                                                                                                         <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px">
                                                                                                                                 <div style="font-weight:700; font-size:0.95rem">{{ s.role }}</div>
                                                                                                                                 <transition name="check">
                                                                                                                                     <!-- Show PENDIENTE badge when name unknown -->
                                                                                                                                     <div v-if="!s.fixed && (!s.name || !String(s.name).trim() || !s.nameKnown)" style="margin-left:6px; background:#fef3c7; color:#92400e; padding:4px 8px; border-radius:999px; font-size:0.75rem; font-weight:600">PENDIENTE</div>
                                                                                                                                     <!-- Show check in same place when name present -->
                                                                                                                                     <div v-else-if="!s.fixed && (s.name && String(s.name).trim().length)" style="margin-left:6px; display:inline-flex; align-items:center; justify-content:center; width:38px; height:22px; background:#ecfdf5; border-radius:999px;">
                                                                                                                                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                                                                                                             <path d="M7.5 12.5l2.2 2.2 6.3-6.3" stroke="#047857" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                                         </svg>
                                                                                                                                     </div>
                                                                                                                                     <!-- Fixed badge -->
                                                                                                                                     <div v-else-if="s.fixed" style="margin-left:6px; background:#ecfeff; color:#065f46; padding:4px 8px; border-radius:999px; font-size:0.75rem; font-weight:600">FIJADO</div>
                                                                                                                                 </transition>
                                                                                                                         </div>
                               
                               <!-- Fixed signature (always visible) -->
                               <div v-if="s.fixed">
                                 <div style="font-size:0.85rem; color:rgba(0,0,0,0.6); margin-bottom:4px">Nombre asignado:</div>
                                 <input class="control" :value="s.name" disabled style="opacity:1; background:rgba(200,200,200,0.1)" />
                               </div>
                               
                               <!-- Non-fixed signature (radio yes/no) -->
                               <div v-else>
                                 <div style="font-size:0.85rem; color:rgba(0,0,0,0.6); margin-bottom:6px">¿Conoces el nombre?</div>
                                 <div style="display:flex; gap:16px; margin-bottom:8px;">
                                   <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
                                     <input type="radio" :value="true" v-model="s.nameKnown" :disabled="isReadOnly" :name="`nameKnown_${idx}`" />
                                     <span style="font-weight:500">Sí</span>
                                   </label>
                                   <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
                                     <input type="radio" :value="false" v-model="s.nameKnown" :disabled="isReadOnly" :name="`nameKnown_${idx}`" />
                                     <span style="font-weight:500">No</span>
                                   </label>
                                 </div>
                                                                 <transition name="fade-in">
                                                                     <div v-if="s.nameKnown" style="margin-top:8px; position:relative;">
                                                                         <div style="font-size:0.85rem; color:rgba(0,0,0,0.6); margin-bottom:4px">Nombre completo:</div>
                                                                         <input class="control" v-model.trim="s.name" :disabled="isReadOnly" placeholder="Nombre completo de la persona" />
                                                                     </div>
                                                                 </transition>
                               </div>
                             </div>
                         </div>
                        </div>
                        </div>

                    <div v-if="!isReadOnly" class="form-actions">
                        <button v-if="!(props.modo === 'editar' && props.enModal)" class="btn secondary cancel-btn"
                            type="button" @click="onCancel" :disabled="loading">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" style="margin-right:8px">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancelar
                        </button>
                        <button class="btn primary save-btn" type="submit" form="servicio-form"
                            :disabled="loading || !isValid">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" style="margin-right:8px">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                            {{ loading ? (props.modo === 'editar' ? 'Actualizando...' : 'Guardando...') : (props.modo
                                === 'editar' ? 'Actualizar orden' : 'Guardar orden') }}
                        </button>
                    </div>
                </div>
            </template>
        </FormShell>

        <!-- Edit Unit Modal -->
        <Teleport v-if="!isReadOnly" to="body">
            <Transition name="modal-fade">
                <div v-if="showEditModal" class="edit-modal-overlay" @click="closeEditModal">
                    <div class="edit-modal" @click.stop>
                        <div class="edit-modal__header">
                            <h3>Editar Unidad</h3>
                            <button type="button" class="edit-modal__close" @click="closeEditModal" aria-label="Cerrar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="edit-modal__body" v-if="editingUnit">
                            <div class="edit-form-grid">
                                <div class="field">
                                    <label>Nombre</label>
                                    <input class="control" v-model.trim="editingUnit.nombre"
                                        placeholder="Nombre de la unidad" />
                                </div>
                                <div class="field">
                                    <label>Marca</label>
                                    <input class="control" v-model.trim="editingUnit.marca" placeholder="Marca" />
                                </div>
                                <div class="field">
                                    <label>Modelo</label>
                                    <input class="control" v-model.trim="editingUnit.modelo" placeholder="Modelo" />
                                </div>
                                <div class="field">
                                    <label>Ubicación</label>
                                    <input class="control" v-model.trim="editingUnit.ubicacion"
                                        placeholder="Ubicación" />
                                </div>
                                <div class="field">
                                    <label>No. Serie</label>
                                    <input class="control" v-model.trim="editingUnit.serie" placeholder="No. Serie" />
                                </div>
                                <div class="field">
                                    <label>Referencia</label>
                                    <input class="control" v-model.trim="editingUnit.referencia"
                                        placeholder="Referencia" />
                                </div>
                                <div class="field">
                                    <label>Lote</label>
                                    <input class="control" v-model.trim="editingUnit.lote" placeholder="Lote" />
                                </div>
                                <div class="field">
                                    <label>Cantidad</label>
                                    <input class="control" v-model.number="editingUnit.cantidad" type="number" min="1"
                                        placeholder="Cantidad" />
                                </div>
                                <div class="field">
                                    <label>Equipo asociado</label>
                                    <input class="control" v-model.trim="editingUnit.equipoAsociado"
                                        placeholder="Ej. Monitor (si aplica)" />
                                </div>
                                <div class="field" style="grid-column: 1 / -1;">
                                    <label>Clave HRAEI</label>
                                    <input class="control" v-model.trim="editingUnit.claveHRAEI"
                                        placeholder="Clave HRAEI" />
                                </div>
                            </div>
                        </div>
                        <div class="edit-modal__footer">
                            <button type="button" class="btn secondary" @click="closeEditModal">Cancelar</button>
                            <button type="button" class="btn primary" @click="saveEditedUnit">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Botón Scroll to Top - Fuera de todos los contenedores - Solo si NO está en modal -->
        <Transition name="scroll-btn">
            <button v-show="showScrollTop && !props.enModal" @click="scrollToTop" @mouseenter="onHoverStart"
                @mouseleave="onHoverEnd" :class="['scroll-to-top-btn', {
                    'animating-out': isAnimatingOut
                }]" aria-label="Volver al inicio">
                <span class="scroll-icon">↑</span>
                <span class="scroll-text">Volver al principio</span>
            </button>
        </Transition>
    </div>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import FormShell from '@/components/FormShell.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import DatePicker from '@/components/DatePicker.vue'
import TimePicker from '@/components/TimePicker.vue'
import notifier from '@/utils/notifier'
import { confirmDelete, showSuccess, showError, showLoading, closeModal, darkThemeConfig, showAlert } from '@/utils/sweetAlertConfig'
import Swal from 'sweetalert2'
import {
    IdentificationIcon,
    TagIcon,
    MapPinIcon,
    DevicePhoneMobileIcon,
    FingerPrintIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    KeyIcon
} from '@heroicons/vue/24/outline'
import { HashtagIcon } from '@heroicons/vue/24/outline'
import TrashButton from '@/components/TrashButton.vue'
import FolioInput from '@/components/FolioInput.vue'
// Nota: cargamos ExcelJS dinámicamente dentro de generarExcelEntrada para evitar
// que la librería (que tiene partes orientadas a node) sea importada al cargar
// el componente; esto previene fallos en el dev server y reduce el bundle inicial.
import { saveAs } from 'file-saver'
import { authedFetch } from '@/utils/api.js'
import motivoEntradaOptions from '@/data/motivoEntradaOptions.js'

const LOCAL_KEY = 'op-servicio'
const ORDERS_LIST_KEY = 'orders_list'

// Router para navegación
const router = useRouter()

// Props para el componente
const props = defineProps({
    modo: { type: String, default: 'crear', validator: v => ['crear', 'editar'].includes(v) },
    ordenId: { type: [String, Number], default: null },
    enModal: { type: Boolean, default: false },
    // Para vista de versiones/diff: cargar desde snapshot (sin fetch) y bloquear edición
    snapshot: { type: Object, default: null },
    readOnly: { type: Boolean, default: false },
    // Alias defensivo: algunos templates pueden bajar el nombre a "readonly".
    readonly: { type: Boolean, default: false },
    // { fields: { nombreSolicitante: 'yellow'|'green'|'red' }, items: { '12': 'yellow'|'green'|'red' } }
    diffHighlights: { type: Object, default: null }
})

// Emit para comunicación con el padre (order-management)
const emit = defineEmits(['close', 'actualizado'])

// Track which is the most recent item (editable) - in edit mode
const mostRecentItemIndex = ref(null)

// Regla fuerte: si hay snapshot (vista de versiones), debe ser solo lectura SIEMPRE.
// En modo editar, solo el item más reciente es editable
const isReadOnly = computed(() => !!(props.readOnly || props.readonly || props.snapshot))

const _lockState = new WeakMap()

function applyDomReadOnlyLock() {
    if (!isReadOnly.value) return
    const container = rootRef.value
    if (!container) return

    // Bloquear controles nativos y elementos interactivos comunes (roles/combobox).
    const nodes = container.querySelectorAll(
        'input, textarea, select, button, [contenteditable=""], [contenteditable="true"], [role="button"], [role="combobox"], [role="textbox"]'
    )

    nodes.forEach((el) => {
        if (!_lockState.has(el)) {
            _lockState.set(el, {
                disabled: el.disabled,
                readOnly: el.readOnly,
                tabindex: el.getAttribute('tabindex'),
                contenteditable: el.getAttribute('contenteditable'),
                ariaDisabled: el.getAttribute('aria-disabled')
            })
        }

        // contenteditable
        if (el.getAttribute && el.getAttribute('contenteditable') != null) {
            el.setAttribute('contenteditable', 'false')
        }

        // Asegurar que no reciba foco
        if (el.setAttribute) {
            el.setAttribute('tabindex', '-1')
            el.setAttribute('aria-disabled', 'true')
        }

        // Nativos
        const tag = String(el.tagName || '').toLowerCase()
        if (tag === 'input' || tag === 'textarea') {
            el.readOnly = true
            el.disabled = true
        } else if (tag === 'select' || tag === 'button') {
            el.disabled = true
        }
    })
}

watch(isReadOnly, async (ro) => {
    if (!ro) return
    await nextTick()
    applyDomReadOnlyLock()
}, { immediate: true })

function onReadOnlyKeydown(e) {
    if (!isReadOnly.value) return
    // Evitar edición por teclado (incluyendo TAB/ENTER) dentro de snapshots
    e.preventDefault()
    e.stopPropagation()
}

function onReadOnlyBeforeInput(e) {
    if (!isReadOnly.value) return
    e.preventDefault()
    e.stopPropagation()
}

function onReadOnlyInput(e) {
    if (!isReadOnly.value) return
    e.preventDefault()
    e.stopPropagation()
}

function onReadOnlyChange(e) {
    if (!isReadOnly.value) return
    e.preventDefault()
    e.stopPropagation()
}

function onReadOnlyPaste(e) {
    if (!isReadOnly.value) return
    e.preventDefault()
    e.stopPropagation()
}

function onReadOnlyFocusIn(e) {
    if (!isReadOnly.value) return
    // Evitar que algún control tome foco (por TAB o programáticamente)
    const el = e?.target
    if (el && typeof el.blur === 'function') {
        el.blur()
    }
}

function onReadOnlyMouseDown(e) {
    if (!isReadOnly.value) return
    // Doble seguridad ante interacciones accidentales
    e.preventDefault()
    e.stopPropagation()
}

function diffFieldClass(key) {
    const h = props.diffHighlights && props.diffHighlights.fields ? props.diffHighlights.fields : null
    const c = h ? h[String(key)] : null
    if (c === 'red') return 'diff-red'
    if (c === 'green') return 'diff-green'
    if (c === 'yellow') return 'diff-yellow'
    return ''
}

function diffItemClass(item) {
    const h = props.diffHighlights && props.diffHighlights.items ? props.diffHighlights.items : null
    const line = item && (item.line != null ? item.line : item.__line)
    const c = h && line != null ? h[String(line)] : (item && item.__diffStatus)
    if (c === 'red') return 'diff-red'
    if (c === 'green') return 'diff-green'
    if (c === 'yellow') return 'diff-yellow'
    return ''
}

// Check if an item at given index is the most recent (editable in edit mode)
function isItemEditable(index) {
    if (props.snapshot || isReadOnly.value) return false
    // En modo editable real (versión más reciente), todos los items deben poder editarse/eliminarse.
    return true
}

function applySnapshotToForm(snapshot) {
    const snap = snapshot || {}
    const orden = snap.orden || {}
    const items = Array.isArray(snap.items) ? snap.items : []

    form.nombreSolicitante = orden.nombre_solicitante || ''
    form.servicio = orden.servicio || ''
    form.especialidad = orden.especialidad || ''
    form.folio = orden.folio || ''
    form.fecha = orden.fecha || ''
    form.fechaISO = orden.fecha ? toISO(orden.fecha) : ''
    form.horaInicio = orden.hora_inicio || ''
    form.horaTermino = orden.hora_termino || ''
    form.motivoEntrada = orden.motivo_entrada || ''
    form.otroMotivo = orden.otro_motivo || ''
    form.descripcion = orden.descripcion || ''
    form.observaciones = orden.observaciones || ''
    form.nombreIngeniero = orden.nombre_ingeniero || ''

    // Firmas: aceptar array si viene en el snapshot/orden. Si no, usar defaults
    try {
        let s = orden.signatures || orden.firmas || null
        if (s && typeof s === 'string') s = JSON.parse(s)
        if (Array.isArray(s) && s.length) {
            // Normalize items to expected shape
            form.signatures = s.map(it => ({
                key: it.key || (it.role || '').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_+$/,''),
                role: it.role || it.cargo || it.role || '',
                nameKnown: !!(it.nameKnown === true || it.name_known === true || (it.name && String(it.name).trim())),
                name: it.name || it.nombre || '',
                fixed: !!it.fixed
            }))
        } else {
            form.signatures = JSON.parse(JSON.stringify(DEFAULT_SIGNATURES))
        }
    } catch (e) {
        form.signatures = JSON.parse(JSON.stringify(DEFAULT_SIGNATURES))
    }

    // Imagen
    if (orden.observaciones_img_path) {
        form.observacionesImg = {
            dataUrl: orden.observaciones_img_path,
            name: 'Imagen de observaciones',
            extension: 'jpg'
        }
    } else {
        form.observacionesImg = null
    }

    // Items unitarios (snapshot ya está normalizado por backend)
    const loaded = []
    for (const it of items) {
        const isGhost = !!it.__diffGhost
        const line = it.line != null ? it.line : null
        loaded.push({
            line,
            __diffGhost: isGhost,
            __diffStatus: it.__diffStatus,
            tipo: it.tipo || '',
            cantidad: 1,
            descripcion: (it.descripcion != null ? it.descripcion : '') || (isGhost ? 'Item eliminado' : ''),
            marca: it.marca || '',
            modelo: it.modelo || '',
            serie: it.serie || '',
            lote: it.lote || '',
            referencia: it.referencia || '',
            ubicacion: it.ubicacion || '',
            claveHRAEI: it.clave_hraei || it.claveHRAEI || ''
        })
    }
    form.equiposEntrada = loaded

    // Info para el header
    ordenInfo.folio = orden.folio || ''
    ordenInfo.nombreSolicitante = orden.nombre_solicitante || ''
    ordenInfo.fecha = orden.fecha || ''
}

// Función para normalizar fecha a formato DD-MM-YYYY
function normalizeFecha(dateStr) {
    if (!dateStr) return ''
    const dateStrTrimmed = String(dateStr).trim()

    // Si ya está en formato DD/MM/YYYY -> convertir a DD-MM-YYYY (usuario puso con '/').
    if (dateStrTrimmed.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStrTrimmed.split('/')
        return `${day}-${month}-${year}`
    }

    // Si ya está en formato DD-MM-YYYY, devolverlo tal cual
    if (dateStrTrimmed.match(/^\d{2}-\d{2}-\d{4}$/)) {
        return dateStrTrimmed
    }

    // Si viene en formato YYYY-MM-DD, convertir a DD-MM-YYYY
    if (dateStrTrimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStrTrimmed.split('-')
        return `${day}-${month}-${year}`
    }

    // Soporte adicional: YYYY/MM/DD
    if (dateStrTrimmed.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        const [year, month, day] = dateStrTrimmed.split('/')
        return `${day}-${month}-${year}`
    }

    // Como fallback, intentar parsear (solo si no hay '/'), evitar parsing ambiguo con '/'
    try {
        if (dateStrTrimmed.includes('/')) {
            // Si llegó con '/', pero no coincide con DD/MM/YYYY, devolver como está (no confiar en Date)
            return dateStrTrimmed.replace(/\//g, '-')
        }

        const date = new Date(dateStrTrimmed)
        if (isNaN(date.getTime())) return dateStrTrimmed

        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    } catch {
        return dateStrTrimmed
    }
}

// Convierte una fecha tipo 'DD-MM-YYYY' o 'DD/MM/YYYY' a 'YYYY-MM-DD' (ISO) para el DatePicker
function toISO(dateStr) {
    if (!dateStr) return ''
    const s = String(dateStr).trim()

    if (s.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [d, m, y] = s.split('/')
        return `${y}-${m}-${d}`
    }

    if (s.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [d, m, y] = s.split('-')
        return `${y}-${m}-${d}`
    }

    // Soporte YYYY-MM-DD y YYYY/MM/DD
    if (s.match(/^\d{4}-\d{2}-\d{2}$/)) return s
    if (s.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        const [y, m, d] = s.split('/')
        return `${y}-${m}-${d}`
    }

    return ''
}

// Mostrar fecha en DD/MM/YYYY (uso en UI)
function formatDate(dateStr) {
    if (!dateStr) return '-'
    const s = String(dateStr).trim()

    // DD/MM/YYYY
    if (s.match(/^\d{2}\/\d{2}\/\d{4}$/)) return s
    // DD-MM-YYYY -> DD/MM/YYYY
    if (s.match(/^\d{2}-\d{2}-\d{4}$/)) return s.replace(/-/g, '/')
    // YYYY-MM-DD -> DD/MM/YYYY
    if (s.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = s.split('-')
        return `${d}/${m}/${y}`
    }
    // YYYY/MM/DD -> DD/MM/YYYY
    if (s.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        const [y, m, d] = s.split('/')
        return `${d}/${m}/${y}`
    }

    // Intentar parsear con Date (fallback)
    try {
        const date = new Date(s)
        if (!isNaN(date.getTime())) {
            const dd = String(date.getDate()).padStart(2, '0')
            const mm = String(date.getMonth() + 1).padStart(2, '0')
            const yyyy = date.getFullYear()
            return `${dd}/${mm}/${yyyy}`
        }
    } catch {
        // ignore
    }
    return s
}

// Opciones del select de motivo de entrada
// Opciones del select de motivo de entrada (importadas desde data)
// motivoEntradaOptions importado arriba

// Sanitizar folio a formato E-XXX
function sanitizeFolio(f) {
    if (!f) return ''
    const s = String(f).trim()
    // extraer números
    const m = s.match(/(\d+)$/)
    if (!m) return ''
    const digits = m[1].slice(0, 6)
    return `E-${digits.padStart(6, '0')}`
}

// Opciones del select de tipo de entrada
const tipoEntradaOptions = [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'equipo-medico', label: 'Equipo Médico' },
    { value: 'mobiliario', label: 'Mobiliario Médico' },
    { value: 'accesorio', label: 'Accesorios de Equipos Médicos' },
    { value: 'consumible', label: 'Consumibles de Equipos Médicos' },
    { value: 'refaccion', label: 'Refacciones para el Equipo' }
]

const DEFAULT_SIGNATURES = [
    { key: 'subdireccion', role: 'SUBDIRECCIÓN DE INGENIERÍA BIOMÉDICA', nameKnown: true, name: 'ARQ. KARLA ALEJANDRA TORRES SÁNCHEZ', fixed: true },
    { key: 'ingeniero', role: 'INGENIERO BIOMÉDICO', nameKnown: false, name: '', fixed: false },
    { key: 'recibe', role: 'IMSS BIENESTAR', nameKnown: false, name: '', fixed: false },
    { key: 'entrega', role: 'PROVEEDOR', nameKnown: false, name: '', fixed: false },
    { key: 'vigilancia', role: 'COORDINACIÓN DE VIGILANCIA', nameKnown: false, name: '', fixed: false }
]

const form = reactive({
    // Datos del solicitante
    nombreSolicitante: '',
    servicio: '',
    especialidad: '',
    folio: '',
    fecha: '',
    fechaISO: '',
    horaInicio: '',
    horaTermino: '',
    motivoEntrada: '',
    otroMotivo: '',

    // Descripción
    descripcion: '',
    observaciones: '',
    nombreIngeniero: '',
    observacionesImg: null, // { name, dataUrl, extension }

    // Equipos que entran
    equiposEntrada: [],

    // Firmas: array centralizado. Mantener orden fijo para PDF
    signatures: JSON.parse(JSON.stringify(DEFAULT_SIGNATURES)),

    // Otros campos heredados
    cantidad: 0,
    solicitante: '',
    unidad: '',
    turno: '',
    items: []
})

// Estado para nuevo item
const newItem = reactive({
    tipo: '',
    cantidad: 0,
    descripcion: '',
    marca: '',
    modelo: '',
    serie: '',
    lote: '',
    referencia: '',
    ubicacion: '',
    claveHRAEI: '',
    equipoAsociado: '',
    unidades: [] // Para equipos médicos/mobiliario con info individual
})

const tipoDropdownOpen = ref(false)

// State for editing units
const editingUnit = ref(null)
const showEditModal = ref(false)

const resetNewItem = () => {
    newItem.tipo = ''
    newItem.cantidad = 0
    newItem.descripcion = ''
    newItem.marca = ''
    newItem.modelo = ''
    newItem.serie = ''
    newItem.lote = ''
    newItem.referencia = ''
    newItem.ubicacion = ''
    newItem.claveHRAEI = ''
    newItem.equipoAsociado = ''
    newItem.unidades = []
}

// Observaciones image helper
const onObservacionesImgChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
        const dataUrl = String(reader.result || '')
        const match = dataUrl.match(/^data:image\/(\w+);base64,/) || []
        const ext = match[1] || (file.name.split('.').pop() || 'png')
        form.observacionesImg = { name: file.name, dataUrl, extension: ext }
    }
    reader.readAsDataURL(file)
}

const removeObservacionesImg = () => {
    form.observacionesImg = null
}

async function generarPdfEntrada(payloadParam) {
    const payloadToSend = payloadParam || {
        nombreSolicitante: form.nombreSolicitante,
        servicio: form.servicio,
        especialidad: form.especialidad,
        folio: sanitizeFolio(form.folio),
        fecha: normalizeFecha(form.fecha),
        fechaISO: form.fechaISO || form.fecha,
        horaInicio: form.horaInicio,
        horaTermino: form.horaTermino,
        motivoEntrada: form.motivoEntrada,
        otroMotivo: form.otroMotivo,
        descripcion: form.descripcion,
        observaciones: form.observaciones,
        nombreIngeniero: form.nombreIngeniero,
        equiposEntrada: form.equiposEntrada,
        observacionesImg: form.observacionesImg ? form.observacionesImg.dataUrl : null,
        signatures: form.signatures,
        logoDataUrl: null
    }

    try {
        const res = await authedFetch('/api/ops/entrada-pdf', {
            method: 'POST',
            body: JSON.stringify(payloadToSend)
        })
        if (res && res.ok) {
            const contentDisposition = res.headers.get('content-disposition') || ''
            let filename = `entrada_${payloadToSend.folio || 'sin_folio'}.pdf`
            const fnMatch = contentDisposition.match(/filename="?([^";]+)"?/) || contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/)
            if (fnMatch) filename = decodeURIComponent(fnMatch[1])
            const blob = await res.blob()
            saveAs(blob, filename)
            notifier.success('PDF generado y descargado desde el servidor')
            return
        } else {
            let text = ''
            try { text = await res.text() } catch (e) { }
            throw new Error(`Error backend: ${res.status} ${res.statusText} ${text}`)
        }
    } catch (err) {
        notifier.error('Error generando PDF, revisa la consola')
        console.error('[PDF] Error', err)
    }
}

// Ajustar array de unidades cuando cambia la cantidad (para equipos médicos)
const ajustarUnidadesEquipo = () => {
    const cantidad = normalizedCount(newItem.cantidad)
    const currentLength = newItem.unidades.length

    if (cantidad > currentLength) {
        // Agregar más unidades
        for (let i = currentLength; i < cantidad; i++) {
            newItem.unidades.push({
                nombre: '',
                marca: '',
                ubicacion: '',
                modelo: '',
                serie: '',
                lote: '',
                referencia: '',
                claveHRAEI: '',
                equipoAsociado: '',
                cantidad: 1 // cantidad por unidad (desglose)
            })
        }
    } else if (cantidad < currentLength) {
        // Reducir unidades
        newItem.unidades.splice(cantidad)
    }
}

// Helpers para el contador de newItem.cantidad (copiado del patrón de insumos)
function adjustNew(delta) {
    const current = Number(newItem.cantidad || 0)
    // permitir que newItem.cantidad sea 0
    newItem.cantidad = Math.max(0, normalizedCount(current + delta))
    ajustarUnidadesEquipo()
}

function incNew() {
    adjustNew(1)
}

function decNew() {
    adjustNew(-1)
}

function incNewBy(amount) {
    adjustNew(amount)
}

function decNewBy(amount) {
    adjustNew(-amount)
}

// Validación para habilitar el botón de agregar según tipo
const canAddItem = computed(() => {
    if (!newItem.tipo) return false

    // Para estos tipos requerimos que exista al menos una unidad (permitir editar cada unidad)
    if (['equipo-medico', 'mobiliario', 'accesorio', 'consumible', 'refaccion'].includes(newItem.tipo)) {
        return Array.isArray(newItem.unidades) && newItem.unidades.length > 0
    }

    // Fallback: descripción obligatoria
    return (newItem.descripcion || '').trim().length > 0
})

const agregarItem = () => {
    if (!canAddItem.value) {
        notifier.error('Completa la información requerida antes de agregar el item')
        return
    }

    const itemData = {
        tipo: newItem.tipo,
        cantidad: newItem.cantidad || 1,
        descripcion: newItem.descripcion || '',
        marca: newItem.marca,
        ubicacion: newItem.ubicacion
    }

    // Allow specifying equipo asociado at item level (fallback for unidades)
    itemData.equipoAsociado = newItem.equipoAsociado || ''

    itemData.unidades = [...newItem.unidades]

    // Para equipos médicos/mobiliario, ajustar descripción
    if (newItem.tipo === 'equipo-medico' || newItem.tipo === 'mobiliario') {
        if (!itemData.descripcion && itemData.unidades.length && itemData.unidades[0].nombre) {
            itemData.descripcion = itemData.unidades[0].nombre
        }
    } else {
        // Para accesorios/consumibles/refacciones
        itemData.cantidad = Number(newItem.cantidad) || (itemData.unidades.length || 1)
    }

    // Para accesorios/consumibles/refacciones: si hay unidades individuales, agregar una entrada por unidad
    if (['accesorio', 'consumible', 'refaccion'].includes(itemData.tipo)) {
        if (Array.isArray(itemData.unidades) && itemData.unidades.length > 0) {
            // Crear una entrada por cada unidad individual
            for (const unidad of itemData.unidades) {
                const single = {
                    tipo: itemData.tipo,
                    cantidad: 1,
                    descripcion: unidad.nombre || itemData.descripcion || '',
                    marca: unidad.marca || itemData.marca,
                    modelo: unidad.modelo || itemData.modelo,
                    serie: unidad.serie || itemData.serie || '',
                    lote: unidad.lote || itemData.lote || '',
                    referencia: unidad.referencia || itemData.referencia || '',
                    ubicacion: unidad.ubicacion || itemData.ubicacion || '',
                    claveHRAEI: unidad.claveHRAEI || itemData.claveHRAEI || '',
                    equipoAsociado: unidad.equipoAsociado || itemData.equipoAsociado || '',
                    unidades: [{ ...unidad, cantidad: 1 }]
                }
                form.equiposEntrada.push(single)
            }
        } else {
            // Si no hay unidades detalladas pero cantidad > 1, expandir en entradas individuales
            const qty = Number(itemData.cantidad) || 1
            for (let i = 0; i < qty; i++) {
                const single = {
                    tipo: itemData.tipo,
                    cantidad: 1,
                    descripcion: itemData.descripcion || '',
                    marca: itemData.marca,
                    modelo: itemData.modelo,
                    serie: itemData.serie || '',
                    lote: itemData.lote || '',
                    referencia: itemData.referencia || '',
                    ubicacion: itemData.ubicacion || '',
                    claveHRAEI: itemData.claveHRAEI || '',
                    equipoAsociado: itemData.equipoAsociado || '',
                    unidades: []
                }
                form.equiposEntrada.push(single)
            }
        }
    } else {
        // Equipos/mobiliario: regla crítica -> cada unidad se guarda como ítem individual.
        // Crear una entrada por cada unidad (cantidad=1) y conservar el orden.
        if (Array.isArray(itemData.unidades) && itemData.unidades.length) {
            for (const unidad of itemData.unidades) {
                const single = {
                    tipo: itemData.tipo,
                    cantidad: 1,
                    descripcion: unidad.nombre || itemData.descripcion || '',
                    marca: unidad.marca || itemData.marca || '',
                    modelo: unidad.modelo || itemData.modelo || '',
                    serie: unidad.serie || itemData.serie || '',
                    lote: unidad.lote || itemData.lote || '',
                    referencia: unidad.referencia || itemData.referencia || '',
                    ubicacion: unidad.ubicacion || itemData.ubicacion || '',
                    claveHRAEI: unidad.claveHRAEI || itemData.claveHRAEI || '',
                    equipoAsociado: unidad.equipoAsociado || itemData.equipoAsociado || '',
                    unidades: [{ ...unidad, cantidad: 1 }]
                }
                form.equiposEntrada.push(single)
            }
        } else {
            // fallback: si por alguna razón no hay unidades, crear una sola entrada
            form.equiposEntrada.push({
                tipo: itemData.tipo,
                cantidad: 1,
                descripcion: itemData.descripcion || '',
                marca: itemData.marca || '',
                modelo: itemData.modelo || '',
                serie: itemData.serie || '',
                lote: itemData.lote || '',
                referencia: itemData.referencia || '',
                ubicacion: itemData.ubicacion || '',
                claveHRAEI: itemData.claveHRAEI || '',
                equipoAsociado: itemData.equipoAsociado || '',
                unidades: []
            })
        }
    }

    notifier.success('Item(s) agregado(s) correctamente')
    resetNewItem()
}

const eliminarItem = (targetItem) => {
    const targetIndex = form.equiposEntrada.findIndex((entry) => entry === targetItem)
    if (targetIndex === -1) {
        return
    }
    form.equiposEntrada.splice(targetIndex, 1)
    notifier.info('Item eliminado')
}

// animation duration (ms) - slightly longer so the can tilt + lid open look smooth
// animation duration (ms) - match the paper animation length
// animation duration (ms) used by TrashButton for can/lid/paper animation
const trashAnimationDuration = 1000

// Track units currently running exit animation (store object references)
const exitingUnits = ref([])
// Track item-rows (parent items) running exit animation
const exitingItems = ref([])

/**
 * Called when a TrashButton finishes its animation for a unit (unidad)
 * We add the unidad to exitingUnits (so template applies exit CSS) and
 * remove it from the form after the small exit animation.
 */
const onUnitTrashDone = (itemObj, unidadObj) => {
    try {
        // Avoid double-removal
        if (exitingUnits.value.includes(unidadObj)) return

        // Mark for exit animation
        exitingUnits.value.push(unidadObj)

        // short exit animation after button animation completes
        const exitMs = 320
        setTimeout(() => {
            // Find current item and the index of this unit by identity
            const parentIndex = form.equiposEntrada.findIndex(e => e === itemObj)
            if (parentIndex === -1) {
                exitingUnits.value = exitingUnits.value.filter(u => u !== unidadObj)
                return
            }
            const unitIndex = form.equiposEntrada[parentIndex].unidades.findIndex(u => u === unidadObj)
            if (unitIndex === -1) {
                exitingUnits.value = exitingUnits.value.filter(u => u !== unidadObj)
                return
            }

            // perform removal
            form.equiposEntrada[parentIndex].unidades.splice(unitIndex, 1)
            notifier.info('Unidad eliminada')

            // If after removing the unit the parent item has no unidades left, animate & remove the parent item too
            if (!form.equiposEntrada[parentIndex].unidades || form.equiposEntrada[parentIndex].unidades.length === 0) {
                // avoid duplicate entry
                if (!exitingItems.value.includes(itemObj)) {
                    exitingItems.value.push(itemObj)
                    // small delay so parent exit animation is visible
                    const parentExitMs = 380
                    setTimeout(() => {
                        const idx = form.equiposEntrada.findIndex(e => e === itemObj)
                        if (idx !== -1) {
                            form.equiposEntrada.splice(idx, 1)
                            notifier.info('Item eliminado (sin unidades)')
                        }
                        exitingItems.value = exitingItems.value.filter(it => it !== itemObj)
                    }, parentExitMs)
                }
            }
            // cleanup
            exitingUnits.value = exitingUnits.value.filter(u => u !== unidadObj)
        }, exitMs)
    } catch (err) {
        // swallow errors to avoid app failure
        console.warn('onUnitTrashDone error', err)
    }
}
// item-level trash buttons removed — deletions will be handled per-unidad via TrashButton component

const editUnit = (itemObj, unidadObj, unitIndex) => {
    try {
        // Deep copy the unit data to edit
        const editingData = JSON.parse(JSON.stringify(unidadObj))
        editingData.parentItem = itemObj
        editingData.unitIndex = unitIndex

        // Open modal or form to edit the unit
        editingUnit.value = editingData
        showEditModal.value = true
    } catch (err) {
        console.warn('editUnit error', err)
        notifier.error('Error al editar la unidad')
    }
}

const saveEditedUnit = () => {
    try {
        if (!editingUnit.value || !editingUnit.value.parentItem) return

        const parentItem = editingUnit.value.parentItem
        const unitIndex = editingUnit.value.unitIndex

        // Find the parent item in the form
        const parentIndex = form.equiposEntrada.findIndex(e => e === parentItem)
        if (parentIndex === -1) {
            notifier.error('No se encontró el item padre')
            return
        }

        // Update the unit with edited data
        const updatedUnit = { ...editingUnit.value }
        delete updatedUnit.parentItem
        delete updatedUnit.unitIndex

        form.equiposEntrada[parentIndex].unidades[unitIndex] = updatedUnit

        // Close modal
        closeEditModal()
        notifier.success('Unidad actualizada correctamente')
    } catch (err) {
        console.warn('saveEditedUnit error', err)
        notifier.error('Error al guardar los cambios')
    }
}

const closeEditModal = () => {
    showEditModal.value = false
    editingUnit.value = null
}

const getTipoLabel = (tipo) => {
    const option = tipoEntradaOptions.find(opt => opt.value === tipo)
    return option ? option.label : tipo
}

const getNombreLabel = () => {
    switch (newItem.tipo) {
        case 'equipo-medico': return 'NOMBRE EQUIPO MÉDICO';
        case 'mobiliario': return 'NOMBRE MOBILIARIO MÉDICO';
        case 'accesorio': return 'NOMBRE DE ACCESORIO';
        case 'consumible': return 'NOMBRE DE CONSUMIBLE';
        case 'refaccion': return 'NOMBRE DE REFACCIÓN';
        default: return 'NOMBRE';
    }
}

const getNombrePlaceholder = () => {
    switch (newItem.tipo) {
        case 'equipo-medico': return 'Nombre del equipo médico';
        case 'mobiliario': return 'Nombre del mobiliario médico';
        case 'accesorio': return 'Nombre del accesorio';
        case 'consumible': return 'Nombre del consumible';
        case 'refaccion': return 'Nombre de la refacción';
        default: return 'Nombre';
    }
}

const loading = ref(false)
const savedAt = ref('')
const hydrated = ref(false)
const showScrollTop = ref(false)
const isAnimatingOut = ref(false)
let hideTimeout = null
// Root reference for focus/click detection to start the timer
const rootRef = ref(null)

// Para mostrar info de la orden en modo editar
const ordenInfo = reactive({
    folio: '',
    nombreSolicitante: '',
    fecha: ''
})
const loadingOrden = ref(false)

// Timer for capturing hora de término
const timerStartedAt = ref(null) // timestamp ms
const elapsedSeconds = ref(0)
let timerInterval = null

// formattedElapsed removed; duration not shown visually (tooltip only)

const displayEndTime = computed(() => {
    // Depend on elapsedSeconds so this recomputes every second while timer running
    const _tick = elapsedSeconds.value
    if (form.horaTermino) {
        return form.horaTermino
    }
    if (timerStartedAt.value) {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        const ss = String(now.getSeconds()).padStart(2, '0')
        return `${hh}:${mm}:${ss}`
    }
    return ''
})

const startTimer = () => {
    if (timerStartedAt.value) return
    timerStartedAt.value = Date.now()
    elapsedSeconds.value = 0
    timerInterval = setInterval(() => {
        elapsedSeconds.value = Math.floor((Date.now() - timerStartedAt.value) / 1000)
    }, 1000)
}

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
}

const onCancel = async () => {
    // Si estamos en modo editar (modal), emitir evento close
    if (props.modo === 'editar') {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Seguro que quieres dejar de editar la orden seleccionada?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
            background: 'rgba(15, 23, 42, 0.9)',
            color: 'rgba(241, 245, 249, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        })
        if (result.isConfirmed) {
            emit('close')
        }
    } else {
        // En modo crear, mostrar confirmación y navegar
        const result = await confirmDelete('¿Estás seguro?', 'Se perderán todos los datos del formulario', 1, 'Sí, regresar', 'Cancelar')
        if (result.isConfirmed) {
            // Limpiar localStorage antes de regresar
            try { localStorage.removeItem(LOCAL_KEY) } catch { }
            // Regresar a order-management en lugar de dashboard
            try {
                await navigateAndRefresh(router, { name: 'order-management-servicio' })
            } catch {
                try { await navigateAndRefresh(router, '/op/order-management-servicio') } catch { }
            }
        }
    }
}

const goToOrderManagement = () => {
    // Limpiar localStorage antes de regresar
    try { localStorage.removeItem(LOCAL_KEY) } catch { }
    // Regresar a order-management sin confirmación
    navigateAndRefresh(router, { name: 'order-management-servicio' })
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

const handleScroll = () => {
    const shouldShow = window.scrollY > 250

    if (shouldShow && !showScrollTop.value) {
        // Aparecer
        if (hideTimeout) {
            clearTimeout(hideTimeout)
            hideTimeout = null
        }
        isAnimatingOut.value = false
        showScrollTop.value = true
    } else if (!shouldShow && showScrollTop.value && !isAnimatingOut.value) {
        // Solo marcar como animando y ocultar para que Vue Transition maneje todo
        isAnimatingOut.value = true
        showScrollTop.value = false
        // Resetear estado después de la animación
        hideTimeout = setTimeout(() => {
            isAnimatingOut.value = false
        }, 400)
    }
}

const onHoverStart = () => {
    // Hover solo funciona si no está animando salida
}

const onHoverEnd = () => {
    // Hover end simple
}

// Animaciones para el campo de cantidad
const onEnterCantidad = (el, done) => {
    el.style.opacity = '0'
    el.style.transform = 'translateX(20px)'
    setTimeout(() => {
        el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        el.style.opacity = '1'
        el.style.transform = 'translateX(0)'
        setTimeout(done, 400)
    }, 10)
}

const onLeaveCantidad = (el, done) => {
    el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.opacity = '0'
    el.style.transform = 'translateX(20px)'
    setTimeout(done, 300)
}

const isValid = computed(() => {
    const nombreSolicitante = (form.nombreSolicitante || '').trim()
    const descripcion = (form.descripcion || '').trim()
    return nombreSolicitante.length > 0 && descripcion.length > 0
})

async function generarExcelEntrada(payloadParam) {
    // payloadParam optional: if provided, use it; otherwise build from form
    const payloadToSend = payloadParam || {
        nombreSolicitante: form.nombreSolicitante,
        servicio: form.servicio,
        especialidad: form.especialidad,
        folio: sanitizeFolio(form.folio),
        fecha: normalizeFecha(form.fecha),
        horaInicio: form.horaInicio,
        horaTermino: form.horaTermino,
        motivoEntrada: form.motivoEntrada,
        otroMotivo: form.otroMotivo,
        descripcion: form.descripcion,
        observaciones: form.observaciones,
        nombreIngeniero: form.nombreIngeniero,
        equiposEntrada: form.equiposEntrada,
        observacionesImg: form.observacionesImg ? form.observacionesImg.dataUrl : null,
    }

    // Intentar delegar la generación al backend (Excel COM) — si falla, caer al flujo local con ExcelJS
    try {
        const res = await authedFetch('/api/ops/entrada-excel-com', {
            method: 'POST',
            body: JSON.stringify(payloadToSend)
        })
        if (res && res.ok) {
            // Obtener filename del header si existe
            const contentDisposition = res.headers.get('content-disposition') || ''
            let filename = 'entrada_plantilla_copia.xlsx'
            const fnMatch = contentDisposition.match(/filename="?([^";]+)"?/) || contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/)
            if (fnMatch) filename = decodeURIComponent(fnMatch[1])
            const blob = await res.blob()
            saveAs(blob, filename)
            notifier.success('Excel generado y descargado desde el servidor')
            return
        } else {
            // No OK -> leer mensaje y fallar para fallback
            let text = ''
            try { text = await res.text() } catch (e) { }
            throw new Error(`Error backend: ${res.status} ${res.statusText} ${text}`)
        }
    } catch (err) {
        console.warn('[Excel] Backend generation failed, falling back to client ExcelJS generation:', err && err.message ? err.message : err)
        notifier.info('No fue posible generar el Excel en el servidor; se intentará generar localmente')
    }

    try {
        // Usar ruta relativa a la carpeta `src/plantillas` (Vite no resuelve `@` dentro de new URL)
        const plantillaUrl = new URL('../../plantillas/entrada_plantilla.xlsx', import.meta.url).href
        const response = await fetch(plantillaUrl)
        if (!response.ok) throw new Error(`Error al obtener plantilla (${response.status} ${response.statusText})`)
        const arrayBuffer = await response.arrayBuffer()
        // Carga dinámica de exceljs para prevenir problemas en dev server y reducir bundle
        const ExcelJS = (await import('exceljs')).default
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)
        const worksheet = workbook.getWorksheet('ENTRADA')

        // Guardar referencias a media/imagenes/headerFooter de la plantilla para restaurar si se pierden
        const __saved_workbook_media = workbook.model && workbook.model.media ? workbook.model.media.slice() : (workbook.media ? workbook.media.slice() : null)
        const __saved_worksheet_images = worksheet._images ? worksheet._images.slice() : (typeof worksheet.getImages === 'function' ? worksheet.getImages().slice() : null)
        const __saved_header_footer = worksheet.headerFooter ? worksheet.headerFooter : null

        const setCellValuePreserveStyle = (ws, addr, val) => {
            const c = ws.getCell(addr)
            const originalStyle = JSON.parse(JSON.stringify(c.style || {}))
            c.value = val
            try { c.style = originalStyle } catch (e) { /* ignore style reapply errors */ }
        }

        // Helper: Aplica estilo de encabezado azul y asegura merge A:I en la fila indicada
        const applyHeaderStyle = (ws, rowNum) => {
            try {
                // Asegurar que esté combinada A:I
                try { ws.mergeCells(`A${rowNum}:I${rowNum}`) } catch (e) { /* ignore */ }
                const row = ws.getRow(rowNum)
                const cellA = row.getCell(1)
                if (!cellA) return false
                cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
                cellA.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
                cellA.alignment = { horizontal: 'left', vertical: 'middle' }
                return true
            } catch (err) {
                console.warn('[Excel] applyHeaderStyle error for row', rowNum, err)
                return false
            }
        }

        // Helper: convertir columna letra a número (A -> 1)
        const colLetterToNumber = (letters) => {
            let num = 0
            for (let i = 0; i < letters.length; i++) {
                num = num * 26 + (letters.charCodeAt(i) - 64)
            }
            return num
        }

        // Helper: parsear un rango Excel como 'D36:I36' a { startCol, startRow, endCol, endRow }
        const parseRange = (range) => {
            const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(range)
            if (!m) return null
            return {
                startCol: colLetterToNumber(m[1]),
                startRow: Number(m[2]),
                endCol: colLetterToNumber(m[3]),
                endRow: Number(m[4])
            }
        }

        // Helper: encontrar un merge range que contenga una dirección (ej. 'D36')
        const findMergeRangeContaining = (ws, address) => {
            const merges = Array.from(ws._merges || [])
            for (const entry of merges) {
                const range = entry && entry[0] ? entry[0] : entry
                if (!range) continue
                if (typeof range === 'string' && range.includes(address)) return range
            }
            return null
        }

        // Helper: limpiar y descombinar un rango (si existe) o una celda
        const clearCellOrMergeContaining = (ws, cell) => {
            try {
                const addr = cell.address
                const mergeRange = findMergeRangeContaining(ws, addr)
                if (mergeRange) {
                    const parsed = parseRange(mergeRange)
                    if (parsed) {
                        // Unmerge primero
                        try { ws.unMergeCells(mergeRange) } catch (e) { }
                        // Limpiar todas las celdas del rango
                        for (let r = parsed.startRow; r <= parsed.endRow; r++) {
                            for (let c = parsed.startCol; c <= parsed.endCol; c++) {
                                const cc = ws.getCell(r, c)
                                cc.value = null
                                try { cc.style = null } catch (e) { }
                            }
                        }
                        return true
                    }
                }

                // Si no está mergeada, limpiar la celda individual
                cell.value = null
                try { cell.style = null } catch (e) { }
                return true
            } catch (err) {
                console.warn('[Excel] Error limpiando celda/merge:', err)
                return false
            }
        }

        setCellValuePreserveStyle(worksheet, 'C1', form.nombreSolicitante || '')
        setCellValuePreserveStyle(worksheet, 'C2', form.servicio || '')
        setCellValuePreserveStyle(worksheet, 'C3', form.especialidad || '')
        setCellValuePreserveStyle(worksheet, 'I1', form.folio || '')
        setCellValuePreserveStyle(worksheet, 'I2', form.fecha || '')
        setCellValuePreserveStyle(worksheet, 'I3', form.horaInicio || '')
        setCellValuePreserveStyle(worksheet, 'I4', form.horaTermino || '')

        // Helper para duplicar una fila con estilos
        const duplicateRowWithStyle = (ws, sourceRowNum, targetRowNum) => {
            // Insertar fila vacía en targetRowNum
            ws.spliceRows(targetRowNum, 0, [])
            const source = ws.getRow(sourceRowNum)
            const target = ws.getRow(targetRowNum)
            target.height = source.height
            source.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const newCell = target.getCell(colNumber)
                try {
                    // Copiar estilo si existe
                    if (cell && cell.style) newCell.style = JSON.parse(JSON.stringify(cell.style || {}))
                } catch (e) {
                    // ignore style copy error
                }
            })
            // Copiar merges que estén contenidos en source row (simple case)
            const merges = Array.from(ws._merges || [])
            merges.forEach(([mergeRange]) => {
                try {
                    // mergeRange is object; for compatibility use string keys
                } catch (e) { }
            })
        }



        const motivosMap = {
            'mantenimiento-preventivo-externo': 0,
            'mantenimiento-correctivo-externo': 1,
            'calibracion-externa': 2,
            'diagnostico': 3,
            'inicio-contrato': 4,
            'inicio-demostracion': 5,
            'reemplazo-equipo': 6,
            'otro': 7
        }

        const celdaMotivos = ['A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14']
        const indiceMotivo = motivosMap[form.motivoEntrada]
        celdaMotivos.forEach((celda, idx) => {
            setCellValuePreserveStyle(worksheet, celda, idx === indiceMotivo ? 'X' : '')
        })

        // Asegurar estilo consistente de encabezados de motivo (filas 7-14)
        try {
            for (let fila = 7; fila <= 14; fila++) {
                const row = worksheet.getRow(fila)
                if (!row) continue
                // Garantizar altura razonable
                row.height = (row.height && row.height > 6) ? row.height : 20

                // Aplicar estilo célula por célula para evitar que algún formato raro o fondo haga desaparecer texto
                for (let col = 1; col <= 9; col++) {
                    try {
                        const cell = row.getCell(col)
                        if (!cell) continue
                        // Alineación y ajuste de texto para que se muestre correctamente
                        cell.alignment = { horizontal: col === 1 ? 'left' : 'left', vertical: 'middle', wrapText: true }
                        // Fuente consistente (encabezado en columna A más visible)
                        cell.font = { name: 'Calibri', size: 10, bold: col === 1 }
                        // Limpiar rellenos problemáticos (ej. azul fuerte) que ocultan bordes/alto
                        if (cell.fill && cell.fill.fgColor && cell.fill.fgColor.argb) {
                            const argb = String(cell.fill.fgColor.argb).toUpperCase()
                            // si parece un azul agresivo, remover relleno
                            if (argb === 'FF00B0F0' || argb === 'FF0070C0' || argb === 'FFE6F0FA') {
                                cell.fill = undefined
                            }
                        }
                        // Asegurar borde inferior para separar visualmente
                        cell.border = cell.border || {}
                        cell.border.bottom = { style: 'thin', color: { argb: 'FF000000' } }
                    } catch (inner) { /* ignorar celdas no existentes */ }
                }
            }
            console.log('[MOTIVOS] ✓ Estilos de encabezados motivos asegurados (filas 7-14)')
        } catch (errMotivos) {
            console.warn('[MOTIVOS] Error asegurando estilos de motivos:', errMotivos)
        }

        // Si el motivo es "otro", escribir la especificación en B14
        if (form.motivoEntrada === 'otro' && form.otroMotivo) {
            // Actualizar el texto de B14 para incluir el motivo especificado
            const celdaOtroMotivo = worksheet.getCell('B14')
            celdaOtroMotivo.value = `OTRO; ESPECIFICAR (${form.otroMotivo})`
        }

        setCellValuePreserveStyle(worksheet, 'D7', form.descripcion || '')
        // Observaciones y nombre de ingeniero (mapeo)
        // Observaciones y nombre de ingeniero se establecerán después de ajustar filas

        const equiposData = form.equiposEntrada.filter(item => item.tipo === 'equipo-medico' || item.tipo === 'mobiliario')
        let todasLasUnidadesEquipos = []
        equiposData.forEach(item => {
            if (item.unidades && item.unidades.length > 0) {
                todasLasUnidadesEquipos.push(...item.unidades)
            }
        })

        // Recopilar todas las unidades de accesorios, consumibles y refacciones








        // Inserciones dinámicas por lotes (se calcularán ahora y usaremos 'sections' para todas las escrituras)
        const accesoriosData = form.equiposEntrada.filter(item => item.tipo === 'accesorio')
        let todasLasUnidadesAccesorios = []
        accesoriosData.forEach(item => {
            if (item.unidades && item.unidades.length > 0) {
                todasLasUnidadesAccesorios.push(...item.unidades)
            }
        })

        if (todasLasUnidadesAccesorios.length > 0) {
            // La escritura de filas para accesorios se hace después del cálculo de secciones y offsets
        } else {
            // hide logic deferred until after `sections` has been calculated
        }

        const consumiblesData = form.equiposEntrada.filter(item => item.tipo === 'consumible')
        let todasLasUnidadesConsumibles = []
        consumiblesData.forEach(item => {
            if (item.unidades && item.unidades.length > 0) {
                todasLasUnidadesConsumibles.push(...item.unidades)
            }
        })

        if (todasLasUnidadesConsumibles.length > 0) {
            // La escritura de filas para consumibles se hace después del cálculo de secciones y offsets
        } else {
            // hide deferred
        }

        const refaccionesData = form.equiposEntrada.filter(item => item.tipo === 'refaccion')
        let todasLasUnidadesRefacciones = []
        refaccionesData.forEach(item => {
            if (item.unidades && item.unidades.length > 0) {
                todasLasUnidadesRefacciones.push(...item.unidades)
            }
        })

        // Configuración de secciones con estructura COMPLETA
        // Cada sección: título azul + encabezado columnas + filas de datos (algunas son reserva)
        const sections = [
            {
                key: 'equipos',
                headerTitleRow: 16,
                headerColRow: 17,
                dataRows: [18, 19, 20], // 3 filas base - soporta expansión ilimitada
                capacity: 999, // Sin límite - expansión automática
                units: todasLasUnidadesEquipos
            },
            {
                key: 'accesorios',
                headerTitleRow: 21,
                headerColRow: 22,
                dataRows: [23, 24, 25], // 3 filas base - soporta expansión ilimitada  
                capacity: 999, // Sin límite - expansión automática
                units: todasLasUnidadesAccesorios
            },
            {
                key: 'consumibles',
                headerTitleRow: 26,
                headerColRow: 27,
                dataRows: [28, 29, 30], // 3 filas base - soporta expansión ilimitada
                capacity: 999, // Sin límite - expansión automática
                units: todasLasUnidadesConsumibles
            },
            {
                key: 'refacciones',
                headerTitleRow: 31,
                headerColRow: 32,
                dataRows: [33, 34], // 2 filas base - soporta expansión ilimitada
                capacity: 999, // Sin límite - expansión automática (observaciones en 35+)
                units: todasLasUnidadesRefacciones
            }
        ]

        // ═══════════════════════════════════════════════════════════════
        // FASE 1: SNAPSHOT DE ESTRUCTURA CRÍTICA (ANTES DE CUALQUIER CAMBIO)
        // ═══════════════════════════════════════════════════════════════
        console.log('[PROTECCIÓN] Creando snapshot de filas críticas...')

        // NOTA: se han eliminado las filas 35-40 (OBSERVACIONES / INGENIERO)
        // porque estas secciones se crean dinámicamente y su snapshot
        // original puede interferir con las filas dinámicas insertadas.
        const CRITICAL_ROWS = [16, 17, 21, 22, 26, 27, 31, 32] // Encabezados fijos y firmas
        const rowSnapshots = {}

        CRITICAL_ROWS.forEach(rowNum => {
            const row = worksheet.getRow(rowNum)
            const snapshot = {
                height: row.height,
                hidden: row.hidden,
                cells: {}
            }

            row.eachCell({ includeEmpty: true }, (cell, colNum) => {
                snapshot.cells[colNum] = {
                    value: cell.value,
                    style: cell.style ? JSON.parse(JSON.stringify(cell.style)) : null,
                    merge: cell.isMerged
                }
            })

            rowSnapshots[rowNum] = snapshot
            console.log(`[SNAPSHOT] Fila ${rowNum} respaldada (${Object.keys(snapshot.cells).length} celdas)`)
        })

        // ═══════════════════════════════════════════════════════════════
        // FASE 2: ASIGNAR FILAS PARA DATOS (SIN MODIFICAR TEMPLATE)
        // ═══════════════════════════════════════════════════════════════
        console.log('[ASIGNACIÓN] Calculando filas para datos...')

        // ZONA MEGA-PROTEGIDA: Todos los encabezados dobles + observaciones + firmas
        const PROTECTED_ROWS = new Set([
            // EQUIPOS: Encabezados primario y secundario
            16, 17,
            // ACCESORIOS: Encabezados primario y secundario  
            21, 22,
            // CONSUMIBLES: Encabezados primario y secundario
            26, 27,
            // REFACCIONES: Encabezados primario y secundario
            31, 32,
            // OBSERVACIONES Y FIRMAS: Sección crítica del final
            35, 36, 37, 38, 39, 40
        ])

        console.log('[PROTECCIÓN] 🛡️ Filas mega-protegidas:', Array.from(PROTECTED_ROWS).sort((a, b) => a - b))

        // ═══════════════════════════════════════════════════════════════
        // PASO 1: ASIGNAR FILAS NORMALES PRIMERO (DISTRIBUCIÓN SECUENCIAL)
        // ═══════════════════════════════════════════════════════════════
        console.log('[ASIGNACIÓN] 🎯 PASO 1: Llenando filas normales secuencialmente...')

        // Primero, asignar filas normales a cada sección
        for (const sec of sections) {
            const unitsCount = (sec.units || []).length
            sec.actualDataRows = []
            sec.normalRowsUsed = 0
            sec.extraRowsNeeded = 0

            if (unitsCount === 0) {
                // En lugar de ocultar, mostrar UNA fila con N/A
                sec.shouldShowNA = true
                sec.actualDataRows = [sec.dataRows[0]] // Solo usar la primera fila de datos
                sec.normalRowsUsed = 1
                sec.extraRowsNeeded = 0
                continue
            }

            // USAR SOLO FILAS DISPONIBLES (NO protegidas)
            console.log(`[${sec.key}] Procesando ${unitsCount} unidades`)

            // Paso 1: Usar filas normales disponibles
            for (let i = 0; i < Math.min(unitsCount, sec.dataRows.length); i++) {
                const rowNum = sec.dataRows[i]
                if (!PROTECTED_ROWS.has(rowNum)) {
                    sec.actualDataRows.push(rowNum)
                    sec.normalRowsUsed++
                }
            }

            // Calcular cuántas filas extras necesita
            sec.extraRowsNeeded = unitsCount - sec.normalRowsUsed
            console.log(`[${sec.key}] Filas normales: ${sec.normalRowsUsed}/${unitsCount}, Extras necesarias: ${sec.extraRowsNeeded}`)
        }

        // ═══════════════════════════════════════════════════════════════
        // PASO 2: INSERTAR FILAS EXTRAS JUSTO DESPUÉS DE CADA SECCIÓN
        // ═══════════════════════════════════════════════════════════════
        console.log('[ASIGNACIÓN] 🎯 PASO 2: Insertando filas extras inmediatamente después de cada sección...')

        // PROCESAR DE ABAJO HACIA ARRIBA para evitar desplazamiento de referencias
        const sectionsReversed = [...sections].reverse()

        for (const sec of sectionsReversed) {
            if (sec.extraRowsNeeded > 0) {
                // Posición exacta donde insertar: después de la última fila de datos
                const lastDataRow = sec.dataRows[sec.dataRows.length - 1]
                const insertPosition = lastDataRow + 1

                console.log(`[${sec.key}] Insertando ${sec.extraRowsNeeded} filas después de fila ${lastDataRow} → posición ${insertPosition}`)

                // INSERTAR filas vacías
                worksheet.spliceRows(insertPosition, 0, ...Array(sec.extraRowsNeeded).fill([]))

                // APLICAR formato inmediatamente a cada fila insertada
                for (let i = 0; i < sec.extraRowsNeeded; i++) {
                    const newRowNum = insertPosition + i
                    const newRow = worksheet.getRow(newRowNum)

                    // Formato básico de fila
                    newRow.height = 15

                    // Formato de celdas (A-I)
                    for (let col = 1; col <= 9; col++) {
                        const cell = newRow.getCell(col)

                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        }
                        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
                    }

                    // Agregar a las filas asignadas de esta sección
                    sec.actualDataRows.push(newRowNum)
                }

                console.log(`[${sec.key}] ✓ ${sec.extraRowsNeeded} filas insertadas en posiciones [${insertPosition}-${insertPosition + sec.extraRowsNeeded - 1}]`)

                // ═══════════════════════════════════════════════════════════════
                // MOVER ENCABEZADOS Y SECCIONES COMO BLOQUES PROTEGIDOS
                // ═══════════════════════════════════════════════════════════════
                console.log(`[MOVIMIENTO-PROTEGIDO] Moviendo encabezados y secciones posteriores +${sec.extraRowsNeeded} filas`)

                // PASO 1: SIMPLIFICAR - Solo mover lo esencial usando spliceRows
                console.log(`[MOVIMIENTO-SIMPLIFICADO] Usando spliceRows para desplazar automáticamente`)

                // El spliceRows ya movió todo automáticamente, solo necesitamos actualizar referencias
                console.log(`[MOVIMIENTO-SIMPLIFICADO] spliceRows ya desplazó todas las filas posteriores a ${insertPosition}`)

                // PASO 2: ACTUALIZAR REFERENCIAS (spliceRows ya movió las filas automáticamente)
                sections.forEach(otherSec => {
                    if (otherSec.dataRows[0] > lastDataRow) {
                        console.log(`[ACTUALIZACIÓN] Actualizando referencias de sección ${otherSec.key}`)

                        // Actualizar encabezados
                        otherSec.headerTitleRow += sec.extraRowsNeeded
                        otherSec.headerColRow += sec.extraRowsNeeded

                        // Actualizar filas de datos
                        otherSec.dataRows = otherSec.dataRows.map(r => r + sec.extraRowsNeeded)
                        otherSec.actualDataRows = otherSec.actualDataRows.map(r => r + sec.extraRowsNeeded)
                    }
                })

                // ACTUALIZAR FILAS PROTEGIDAS (spliceRows las movió automáticamente)
                const newProtectedRows = new Set()
                const newCriticalRows = []

                PROTECTED_ROWS.forEach(row => {
                    newProtectedRows.add(row > lastDataRow ? row + sec.extraRowsNeeded : row)
                })

                CRITICAL_ROWS.forEach(row => {
                    newCriticalRows.push(row > lastDataRow ? row + sec.extraRowsNeeded : row)
                })

                // ACTUALIZAR SNAPSHOT DE FILAS CRÍTICAS: remapear keys de rowSnapshots
                try {
                    const newRowSnapshots = {}
                    Object.keys(rowSnapshots).forEach(k => {
                        const orig = Number(k)
                        if (Number.isNaN(orig)) return
                        const mapped = orig > lastDataRow ? orig + sec.extraRowsNeeded : orig
                        newRowSnapshots[mapped] = rowSnapshots[orig]
                    })
                    // Reemplazar snapshot por el remapeado
                    Object.keys(rowSnapshots).forEach(k => delete rowSnapshots[k])
                    Object.keys(newRowSnapshots).forEach(k => { rowSnapshots[k] = newRowSnapshots[k] })
                    console.log('[SNAPSHOT] rowSnapshots remapeado tras inserción:', sec.extraRowsNeeded, 'filas después de', lastDataRow)
                } catch (errSnap) {
                    console.warn('[SNAPSHOT] Error remapeando rowSnapshots:', errSnap)
                }

                // Reemplazar estructuras globales
                PROTECTED_ROWS.clear()
                newProtectedRows.forEach(row => PROTECTED_ROWS.add(row))

                CRITICAL_ROWS.length = 0
                CRITICAL_ROWS.push(...newCriticalRows)

                console.log(`[MOVIMIENTO-SIMPLIFICADO] ✅ Referencias actualizadas correctamente`)

                // ═══════════════════════════════════════════════════════════════
                // 🔵 RESTAURAR FORMATO AZUL Y COMBINAR CELDAS DE ENCABEZADOS 
                // ═══════════════════════════════════════════════════════════════
                console.log(`[FORMATO-AZUL] 🔵 Restaurando encabezados azules y celdas combinadas...`)

                sections.forEach(section => {
                    // ENCABEZADO PRIMARIO (azul combinado)
                    const titleRow = section.headerTitleRow
                    const titleCell = worksheet.getCell(`A${titleRow}`)

                    console.log(`[FORMATO-AZUL] Restaurando encabezado primario fila ${titleRow} para ${section.key}`)

                    // Combinar celdas A-I para el título (solo si no están ya combinadas)
                    try {
                        worksheet.mergeCells(`A${titleRow}:I${titleRow}`)
                        console.log(`[FORMATO-AZUL] ✓ Celdas combinadas A${titleRow}:I${titleRow} para ${section.key}`)
                    } catch (error) {
                        console.log(`[FORMATO-AZUL] ⚠️ Celdas A${titleRow}:I${titleRow} para ${section.key} ya estaban combinadas`)
                    }

                    // REFUERZO ESPECIAL para ACCESORIOS - Asegurar que SIEMPRE quede combinado
                    if (section.key === 'accesorios') {
                        console.log(`[ACCESORIOS-FIX] 🔧 REFUERZO ESPECIAL para encabezado de accesorios en fila ${titleRow}`)

                        try {
                            worksheet.unMergeCells(titleRow, 1, titleRow, 9)
                        } catch (e) { }

                        for (let col = 1; col <= 9; col++) {
                            const celda = worksheet.getCell(titleRow, col)
                            celda.value = null
                            celda.fill = null
                            celda.font = null
                            celda.border = null
                            celda.alignment = null
                        }

                        worksheet.mergeCells(titleRow, 1, titleRow, 9)
                        console.log(`[ACCESORIOS-FIX] ✅ Accesorios FORZADAMENTE combinado en fila ${titleRow}`)
                    }

                    // REFUERZO ESPECIAL para CONSUMIBLES - Asegurar que SIEMPRE quede combinado
                    if (section.key === 'consumibles') {
                        console.log(`[CONSUMIBLES-FIX] 🔧 REFUERZO ESPECIAL para encabezado de consumibles en fila ${titleRow}`)

                        try {
                            // Descombinar primero
                            worksheet.unMergeCells(titleRow, 1, titleRow, 9)
                        } catch (e) { }

                        // Limpiar todas las celdas
                        for (let col = 1; col <= 9; col++) {
                            const celda = worksheet.getCell(titleRow, col)
                            celda.value = null
                            celda.fill = null
                            celda.font = null
                            celda.border = null
                            celda.alignment = null
                        }

                        // Combinar de nuevo limpiamente
                        worksheet.mergeCells(titleRow, 1, titleRow, 9)
                        console.log(`[CONSUMIBLES-FIX] ✅ Consumibles FORZADAMENTE combinado en fila ${titleRow}`)
                    }

                    // REFUERZO ESPECIAL para REFACCIONES - Asegurar que SIEMPRE quede combinado
                    if (section.key === 'refacciones') {
                        console.log(`[REFACCIONES-FIX] 🔧 REFUERZO ESPECIAL para encabezado de refacciones en fila ${titleRow}`)

                        // Forzar recombinación y reaplicar estilo azul para refacciones
                        try {
                            // Descombinar el rango completo A:I de esa fila (más seguro)
                            try { worksheet.unMergeCells(`A${titleRow}:I${titleRow}`) } catch (e) { /* ignore */ }

                            // Limpiar todas las celdas antes de recombinar
                            for (let col = 1; col <= 9; col++) {
                                const cell = worksheet.getCell(titleRow, col)
                                cell.value = null
                                try { cell.fill = null } catch (e) { }
                                try { cell.font = null } catch (e) { }
                                try { cell.border = null } catch (e) { }
                                try { cell.alignment = null } catch (e) { }
                            }

                            // Combinar de nuevo limpiamente
                            worksheet.mergeCells(`A${titleRow}:I${titleRow}`)
                            const newTitleCell = worksheet.getCell(`A${titleRow}`)

                            // Aplicar estilo azul destacado y texto blanco en negrita
                            newTitleCell.fill = {
                                type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' }
                            }
                            newTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
                            newTitleCell.alignment = { horizontal: 'left', vertical: 'middle' }

                            console.log(`[REFACCIONES-FIX] ✅ Refacciones FORZADAMENTE combinado y estilizado en fila ${titleRow}`)
                        } catch (error) {
                            console.log(`[REFACCIONES-FIX] ⚠️ Error al forzar combinación/estilo de refacciones:`, error && error.message ? error.message : error)
                        }
                    }

                    // Aplicar formato azul al encabezado primario de forma robusta
                    if (!applyHeaderStyle(worksheet, titleRow)) {
                        console.warn(`[FORMATO-AZUL] No se pudo aplicar estilo a encabezado fila ${titleRow} para ${section.key}`)
                    }
                    titleCell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    }

                    // Restaurar texto del encabezado según la sección
                    const titleTexts = {
                        'equipos': 'DESCRIPCIÓN DEL EQUIPO MÉDICO Y/O MOBILIARIO MÉDICO.',
                        'accesorios': 'DESCRIPCIÓN DE ACCESORIOS QUE SE INGRESA CON EL EQUIPO MÉDICO.',
                        'consumibles': 'DESCRIPCIÓN DE CONSUMIBLES QUE SE INGRESA CON EL EQUIPO MÉDICO.',
                        'refacciones': 'DESCRIPCIÓN DE REFACCIONES QUE SE INGRESA CON EL EQUIPO MÉDICO.'
                    }
                    titleCell.value = titleTexts[section.key] || `DESCRIPCIÓN DE ${section.key.toUpperCase()}`

                    // ENCABEZADO SECUNDARIO (columnas)
                    const colRow = section.headerColRow
                    console.log(`[FORMATO-AZUL] Restaurando encabezado secundario fila ${colRow} para ${section.key}`)

                    // LIMPIEZA ESPECIAL para REFACCIONES - Evitar duplicados
                    if (section.key === 'refacciones') {
                        console.log(`[REFACCIONES-FIX] 🧹 Limpiando posibles duplicados de encabezado secundario...`)

                        // Limpiar un rango amplio alrededor de la fila esperada para eliminar duplicados
                        for (let checkRow = colRow - 2; checkRow <= colRow + 2; checkRow++) {
                            const checkCell = worksheet.getCell(`A${checkRow}`)
                            if (checkCell.value === 'N°' && checkRow !== colRow) {
                                console.log(`[REFACCIONES-FIX] 🗑️ Eliminando encabezado duplicado en fila ${checkRow}`)
                                // Limpiar toda la fila duplicada
                                for (let col = 1; col <= 9; col++) {
                                    const cellToClean = worksheet.getCell(checkRow, col)
                                    cellToClean.value = null
                                    cellToClean.fill = null
                                    cellToClean.font = null
                                    cellToClean.border = null
                                }
                            }
                        }
                    }

                    const columnHeaders = ['N°', 'CANTIDAD', 'DESCRIPCIÓN', 'MARCA', 'MODELO', 'SERIE', 'REFERENCIA', 'UBICACIÓN', 'CLAVE HRAEI']
                    columnHeaders.forEach((header, idx) => {
                        const cell = worksheet.getCell(`${String.fromCharCode(65 + idx)}${colRow}`)

                        cell.value = header
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF4472C4' }
                        }
                        cell.font = {
                            name: 'Calibri',
                            size: 11,
                            bold: true,
                            color: { argb: 'FFFFFFFF' }
                        }
                        cell.alignment = {
                            horizontal: 'center',
                            vertical: 'middle'
                        }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        }
                    })

                    console.log(`[FORMATO-AZUL] ✅ Encabezados de ${section.key} restaurados con formato azul`)
                })

                console.log(`[FORMATO-AZUL] ✅ Todas las celdas combinadas y formatos azules restaurados`)
            }
        }

        // ██████████████████████████████████████████████████████████████████████████
        // 🔒🔒🔒 SECCIÓN OBSERVACIONES - CREACIÓN ULTRA DEFINITIVA Y BLINDADA 🔒🔒🔒
        // ██████████████████████████████████████████████████████████████████████████

        // Calcular posición EXACTA después de refacciones
        const refSeccionFinal = sections.find(s => s.key === 'refacciones')
        const ultimaFilaRefacciones = Math.max(...refSeccionFinal.actualDataRows)

        // DOS FILAS EN BLANCO DESPUÉS DE REFACCIONES (para evitar colisión con muchos items)
        const FILA_ESPACIO_BLANCO_1 = ultimaFilaRefacciones + 1
        const FILA_ESPACIO_BLANCO_2 = ultimaFilaRefacciones + 2

        // Limpiar filas de espacio
        for (let filaEspacio of [FILA_ESPACIO_BLANCO_1, FILA_ESPACIO_BLANCO_2]) {
            worksheet.getRow(filaEspacio).height = 5  // Fila muy pequeña
            for (let col = 1; col <= 9; col++) {
                const celda = worksheet.getCell(filaEspacio, col)
                celda.value = null
                celda.fill = null
                celda.border = null
            }
        }

        // POSICIONES ABSOLUTAS (después del espacio en blanco doble)
        const FILA_ENCABEZADO_OBS = FILA_ESPACIO_BLANCO_2 + 1
        const FILA_CONTENIDO_OBS = FILA_ENCABEZADO_OBS + 1
        const FILA_INGENIERO = FILA_CONTENIDO_OBS + 1

        console.log(`[🔒 OBSERVACIONES BLINDADAS] Posiciones calculadas:`)
        console.log(`[🔒] Última refacción: Fila ${ultimaFilaRefacciones}`)
        console.log(`[🔒] Espacios en blanco: Filas ${FILA_ESPACIO_BLANCO_1} y ${FILA_ESPACIO_BLANCO_2}`)
        console.log(`[🔒] Encabezado azul: Fila ${FILA_ENCABEZADO_OBS}`)
        console.log(`[🔒] Contenido texto+imagen: Fila ${FILA_CONTENIDO_OBS}`)
        console.log(`[🔒] Ingeniero: Fila ${FILA_INGENIERO}`)

        // Asegurar que las filas dinámicas de Observaciones/Ingeniero estén marcadas como protegidas
        try {
            if (typeof PROTECTED_ROWS !== 'undefined' && PROTECTED_ROWS instanceof Set) {
                PROTECTED_ROWS.add(FILA_ENCABEZADO_OBS)
                PROTECTED_ROWS.add(FILA_CONTENIDO_OBS)
                PROTECTED_ROWS.add(FILA_INGENIERO)
                console.log('[PROTECCIÓN] Filas dinámicas Observaciones/Ingeniero añadidas a PROTECTED_ROWS:', FILA_ENCABEZADO_OBS, FILA_CONTENIDO_OBS, FILA_INGENIERO)
            }

            // Añadir filas dinámicas a CRITICAL_ROWS (si no existen)
            try {
                ;[FILA_ENCABEZADO_OBS, FILA_CONTENIDO_OBS, FILA_INGENIERO].forEach(r => {
                    if (!CRITICAL_ROWS.includes(r)) CRITICAL_ROWS.push(r)
                })
                console.log('[CRITICAL_ROWS] Actualizados con filas dinámicas:', CRITICAL_ROWS)
            } catch (errAddCrit) {
                console.warn('[CRITICAL_ROWS] Error añadiendo filas dinámicas a CRITICAL_ROWS:', errAddCrit)
            }
        } catch (errProtect) {
            console.warn('[PROTECCIÓN] Error al marcar filas dinámicas protegidas:', errProtect)
        }

        // ══════════════════════════════════════════════════════════════════════════
        // FILA 1: ENCABEZADO AZUL "OBSERVACIONES" - A:I COMBINADO
        // ══════════════════════════════════════════════════════════════════════════

        // PASO 1: DESCOMBINAR TODO EN ESA FILA PRIMERO
        try { worksheet.unMergeCells(FILA_ENCABEZADO_OBS, 1, FILA_ENCABEZADO_OBS, 9) } catch (e) { }

        // PASO 2: LIMPIAR TODAS LAS CELDAS DE ESA FILA
        for (let col = 1; col <= 9; col++) {
            const celda = worksheet.getCell(FILA_ENCABEZADO_OBS, col)
            celda.value = null
            celda.fill = null
            celda.font = null
            celda.border = null
            celda.alignment = null
        }

        // PASO 3: COMBINAR A:I Y APLICAR FORMATO Y VALOR (uso helper para robustez)
        try { worksheet.unMergeCells(`A${FILA_ENCABEZADO_OBS}:I${FILA_ENCABEZADO_OBS}`) } catch (e) { }
        try { worksheet.mergeCells(`A${FILA_ENCABEZADO_OBS}:I${FILA_ENCABEZADO_OBS}`) } catch (e) { }
        // Aplicar valor y estilo usando helper
        const celdaEncabezadoObsRow = worksheet.getRow(FILA_ENCABEZADO_OBS)
        const celdaEncabezadoObs = celdaEncabezadoObsRow.getCell(1)
        celdaEncabezadoObs.value = 'OBSERVACIONES'
        applyHeaderStyle(worksheet, FILA_ENCABEZADO_OBS)
        // Aplicar bordes y altura
        celdaEncabezadoObs.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }
        worksheet.getRow(FILA_ENCABEZADO_OBS).height = 25
        console.log(` ENCABEZADO "OBSERVACIONES" CREADO EN FILA ${FILA_ENCABEZADO_OBS}`)

        // ══════════════════════════════════════════════════════════════════════════
        // FILA 2: CONTENIDO - TEXTO (A:F) + IMAGEN (G:I)
        // ══════════════════════════════════════════════════════════════════════════

        // LIMPIAR FILA PRIMERO
        try { worksheet.unMergeCells(FILA_CONTENIDO_OBS, 1, FILA_CONTENIDO_OBS, 9) } catch (e) { }
        for (let col = 1; col <= 9; col++) {
            const celda = worksheet.getCell(FILA_CONTENIDO_OBS, col)
            celda.value = null
            celda.fill = null
            celda.font = null
            celda.border = null
            celda.alignment = null
        }

        // Área de texto observaciones (A:F)
        worksheet.mergeCells(FILA_CONTENIDO_OBS, 1, FILA_CONTENIDO_OBS, 6)
        const celdaTextoObs = worksheet.getCell(FILA_CONTENIDO_OBS, 1)
        celdaTextoObs.value = form.observaciones || ''  // DATO AQUÍ
        celdaTextoObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }  // FONDO BLANCO
        celdaTextoObs.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }  // TEXTO NEGRO
        celdaTextoObs.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
        celdaTextoObs.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }

        // Área de imagen (G:I)
        worksheet.mergeCells(FILA_CONTENIDO_OBS, 7, FILA_CONTENIDO_OBS, 9)
        const celdaImagenObs = worksheet.getCell(FILA_CONTENIDO_OBS, 7)
        celdaImagenObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }  // FONDO BLANCO
        celdaImagenObs.alignment = { horizontal: 'center', vertical: 'middle' }
        celdaImagenObs.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }
        worksheet.getRow(FILA_CONTENIDO_OBS).height = 100

        // Insertar imagen si existe - AJUSTADA AL ÁREA G:I
        if (form.observacionesImg && form.observacionesImg.dataUrl) {
            try {
                const base64Img = String(form.observacionesImg.dataUrl).replace(/^data:image\/\w+;base64,/, '')
                const extImg = (form.observacionesImg.extension || 'png').replace('jpeg', 'jpg')
                const idImagen = workbook.addImage({ base64: base64Img, extension: extImg })

                // Usar tl (top-left) y br (bottom-right) para que la imagen se ajuste al área G:I
                worksheet.addImage(idImagen, {
                    tl: { col: 6, row: FILA_CONTENIDO_OBS - 1 },      // G (columna 6) - inicio de fila
                    br: { col: 9, row: FILA_CONTENIDO_OBS },          // I (columna 9) - fin de fila
                    editAs: 'oneCell'  // La imagen se ajusta a las celdas
                })

                console.log(` Imagen insertada y ajustada al área G${FILA_CONTENIDO_OBS}:I${FILA_CONTENIDO_OBS}`)
            } catch (errImg) {
                console.warn(' Error imagen:', errImg)
            }
        }

        // ══════════════════════════════════════════════════════════════════════════
        // FILA 3: INGENIERO - ETIQUETA (A:C) + NOMBRE (D:I)
        // ══════════════════════════════════════════════════════════════════════════

        // LIMPIAR FILA PRIMERO
        try { worksheet.unMergeCells(FILA_INGENIERO, 1, FILA_INGENIERO, 9) } catch (e) { }
        for (let col = 1; col <= 9; col++) {
            const celda = worksheet.getCell(FILA_INGENIERO, col)
            celda.value = null
            celda.fill = null
            celda.font = null
            celda.border = null
            celda.alignment = null
        }

        // Etiqueta (A:C)
        worksheet.mergeCells(FILA_INGENIERO, 1, FILA_INGENIERO, 3)
        const celdaEtiquetaIng = worksheet.getCell(FILA_INGENIERO, 1)
        celdaEtiquetaIng.value = 'NOMBRE DE INGENIERO RESIDENTE DE APOYO'
        celdaEtiquetaIng.font = { name: 'Calibri', size: 10, bold: true }
        celdaEtiquetaIng.alignment = { horizontal: 'left', vertical: 'middle' }
        celdaEtiquetaIng.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }

        // Campo nombre (D:I)
        worksheet.mergeCells(FILA_INGENIERO, 4, FILA_INGENIERO, 9)
        const celdaNombreIng = worksheet.getCell(FILA_INGENIERO, 4)
        celdaNombreIng.value = form.nombreIngeniero || ''  // DATO AQUÍ
        celdaNombreIng.alignment = { horizontal: 'center', vertical: 'middle' }
        celdaNombreIng.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }
        // Eliminar duplicados accidentales de la etiqueta de ingeniero en otras filas
        try {
            let removed = 0
            const ingNameToMatch = (form.nombreIngeniero || '').toString().trim()
            for (let r = 1; r <= worksheet.rowCount; r++) {
                if (r === FILA_INGENIERO) continue
                for (let c = 1; c <= 9; c++) {
                    const cell = worksheet.getCell(r, c)
                    if (typeof cell.value === 'string') {
                        const valTrim = cell.value.trim()
                        if (
                            valTrim === 'NOMBRE DE INGENIERO RESIDENTE DE APOYO' ||
                            (ingNameToMatch && valTrim === ingNameToMatch) ||
                            /ing\.apoyo\.entrada/.test(valTrim) ||
                            /\{\{\s*ing\.apoyo\.entrada\s*\}\}/i.test(valTrim)
                        ) {
                            // Limpiar contenido y estilo para evitar duplicados (caso reportado: 5 items)
                            if (clearCellOrMergeContaining(worksheet, cell)) removed++
                        }
                    }
                }
            }
            if (removed > 0) console.log(`[Excel] Eliminados ${removed} duplicados de etiqueta ingeniero (paso intermedio)`)
        } catch (errDup) {
            console.warn('[Excel] Error limpiando duplicados de etiqueta ingeniero:', errDup)
        }
        worksheet.getRow(FILA_INGENIERO).height = 25

        // Re-forzar encabezado azul una última vez (re-obtener referencia para evitar objetos stale)
        const celdaEncabezadoObsRef = worksheet.getRow(FILA_ENCABEZADO_OBS).getCell(1)
        celdaEncabezadoObsRef.value = 'OBSERVACIONES'
        applyHeaderStyle(worksheet, FILA_ENCABEZADO_OBS)

        console.log(`[ OBSERVACIONES BLINDADAS]  COMPLETADO PERFECTAMENTE`)

        // Procesar secciones en orden normal para mostrar resumen
        sections.forEach(sec => {
            console.log(`[${sec.key}] ✓ Asignación final: [${sec.actualDataRows.join(', ')}]`)
        })

        // ═══════════════════════════════════════════════════════════════
        // PASO 3: ESCRIBIR DATOS EN CADA SECCIÓN Y OCULTAR SECCIONES VACÍAS
        // ═══════════════════════════════════════════════════════════════
        console.log('[ESCRITURA] Escribiendo datos con protección de filas críticas...')

        for (const sec of sections) {
            if (sec.shouldShowNA) {
                // Mostrar sección con UNA fila de N/A
                console.log(`[${sec.key}] Mostrando sección vacía con fila N/A`)

                // Los encabezados quedan visibles (ya tienen formato azul)
                // USAR LA FILA CORRECTA: actualDataRows[0] o headerColRow + 1 como fallback
                const naRow = sec.actualDataRows[0] || (sec.headerColRow + 1)

                console.log(`[${sec.key}] Escribiendo fila N/A en fila ${naRow} (actualDataRows: ${JSON.stringify(sec.actualDataRows)}, dataRows: ${JSON.stringify(sec.dataRows)})`)

                // FORZAR que la fila NO esté oculta
                worksheet.getRow(naRow).hidden = false

                setCellValuePreserveStyle(worksheet, `A${naRow}`, 1)
                setCellValuePreserveStyle(worksheet, `B${naRow}`, 1)
                setCellValuePreserveStyle(worksheet, `C${naRow}`, 'N/A')
                setCellValuePreserveStyle(worksheet, `D${naRow}`, 'N/A')
                setCellValuePreserveStyle(worksheet, `E${naRow}`, 'N/A')
                setCellValuePreserveStyle(worksheet, `F${naRow}`, 'N/A')
                setCellValuePreserveStyle(worksheet, `G${naRow}`, 'N/A')
                setCellValuePreserveStyle(worksheet, `H${naRow}`, 'N/A')
                setCellValuePreserveStyle(worksheet, `I${naRow}`, 'N/A')

                // APLICAR FORMATO EXPLÍCITO a la fila N/A (para que se vea correctamente)
                for (let col = 1; col <= 9; col++) {
                    const cell = worksheet.getRow(naRow).getCell(col)
                    cell.alignment = { horizontal: 'center', vertical: 'middle' }
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    }
                    cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
                }

                console.log(`[${sec.key}] ✅ Fila N/A escrita y formateada en fila ${naRow}`)

                // Ocultar las filas restantes de esta sección (usando dataRows actualizado)
                sec.dataRows.slice(1).forEach(rowNum => {
                    if (!PROTECTED_ROWS.has(rowNum) && rowNum !== naRow) {
                        worksheet.getRow(rowNum).hidden = true
                    }
                })

            } else {
                // Escribir datos en las filas calculadas
                console.log(`[${sec.key}] Escribiendo ${sec.units.length} items`)
                sec.units.forEach((unidad, idx) => {
                    const row = sec.actualDataRows[idx]

                    // PROTECCIÓN: Verificar que no escribimos en filas críticas
                    if (PROTECTED_ROWS.has(row)) {
                        console.error(`[PROTECCIÓN] ⛔ Fila ${row} está protegida - saltando`)
                        return
                    }

                    console.log(`[${sec.key}] Escribiendo item ${idx + 1} en fila ${row}`)

                    // Si es fila extra (>=50), FORZAR formato antes de escribir
                    if (row >= 50) {
                        console.log(`[FORMATO] Aplicando formato forzado a fila ${row}`)
                        for (let col = 1; col <= 9; col++) {
                            const cell = worksheet.getRow(row).getCell(col)

                            cell.alignment = { horizontal: 'center', vertical: 'middle' }
                            cell.border = {
                                top: { style: 'thin', color: { argb: 'FF000000' } },
                                left: { style: 'thin', color: { argb: 'FF000000' } },
                                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                                right: { style: 'thin', color: { argb: 'FF000000' } }
                            }
                            cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
                        }
                    }

                    // AUTOCOMPLETADO CON "N/A" - Si un campo está vacío o en blanco, usar "N/A"
                    const autoNA = (value) => {
                        if (!value || value.toString().trim() === '') {
                            return 'N/A'
                        }
                        return value
                    }

                    console.log(`[${sec.key}] Autocompletando campos vacíos con N/A para item ${idx + 1}`)

                    setCellValuePreserveStyle(worksheet, `A${row}`, idx + 1)
                    setCellValuePreserveStyle(worksheet, `B${row}`, unidad.cantidad || 1)
                    setCellValuePreserveStyle(worksheet, `C${row}`, autoNA(unidad.nombre))
                    setCellValuePreserveStyle(worksheet, `D${row}`, autoNA(unidad.marca))
                    setCellValuePreserveStyle(worksheet, `E${row}`, autoNA(unidad.modelo))
                    setCellValuePreserveStyle(worksheet, `F${row}`, autoNA(unidad.serie || unidad.lote))
                    setCellValuePreserveStyle(worksheet, `G${row}`, autoNA(unidad.referencia))
                    setCellValuePreserveStyle(worksheet, `H${row}`, autoNA(unidad.ubicacion))
                    setCellValuePreserveStyle(worksheet, `I${row}`, autoNA(unidad.claveHRAEI))
                })

                // Ocultar filas no usadas dentro de la capacidad
                const unusedRows = sec.dataRows.filter(r => !sec.actualDataRows.includes(r) && !PROTECTED_ROWS.has(r))
                unusedRows.forEach(rowNum => {
                    console.log(`[${sec.key}] Ocultando fila no usada: ${rowNum}`)
                    worksheet.getRow(rowNum).hidden = true
                })
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // FASE 3: AUTO-REPARACIÓN - VALIDAR Y RESTAURAR FILAS CRÍTICAS
        // ═══════════════════════════════════════════════════════════════
        console.log('[AUTO-REPARACIÓN] Validando integridad de filas críticas...')

        let repairsNeeded = 0
        CRITICAL_ROWS.forEach(rowNum => {
            // ⚠️ Saltar filas dinámicas (Observaciones/Ingeniero) de la auto-reparación
            if (rowNum === FILA_ENCABEZADO_OBS ||
                rowNum === FILA_CONTENIDO_OBS ||
                rowNum === FILA_INGENIERO) {
                console.log(`[AUTO-REPARACIÓN] Saltando fila dinámica ${rowNum}`)
                return
            }

            const currentRow = worksheet.getRow(rowNum)
            const snapshot = rowSnapshots[rowNum]

            // VALIDACIÓN: Verificar que existe el snapshot
            if (!snapshot) {
                console.warn(`[REPARACIÓN] No hay snapshot para fila ${rowNum} - saltando validación`)
                return
            }

            // Si la fila está protegida y tiene contenido válido, OMITIR restauración
            if (PROTECTED_ROWS.has(rowNum)) {
                let hasContent = false
                try {
                    currentRow.eachCell({ includeEmpty: false }, (cell) => {
                        if (cell.value) hasContent = true
                    })
                } catch (e) { /* ignore */ }

                if (hasContent) {
                    console.log(`[REPARACIÓN] Fila protegida ${rowNum} tiene contenido - omitiendo restauración`)
                    return
                }
                // si no tiene contenido, dejaremos que la restauración continúe
            }

            // Verificar si la fila está corrupta (vacía o sin estilo)
            let isCorrupted = true
            currentRow.eachCell({ includeEmpty: false }, (cell) => {
                if (cell.value || cell.style) isCorrupted = false
            })

            if (isCorrupted || !currentRow.height) {
                console.warn(`[REPARACIÓN] Fila ${rowNum} corrupta - restaurando desde snapshot`)
                repairsNeeded++

                // Restaurar altura (con validación)
                currentRow.height = snapshot.height || 15
                currentRow.hidden = snapshot.hidden || false

                // Restaurar cada celda (con validación)
                if (snapshot.cells) {
                    Object.keys(snapshot.cells).forEach(colNum => {
                        const cellData = snapshot.cells[colNum]
                        if (cellData) {
                            const cell = currentRow.getCell(Number(colNum))
                            // Evitar restaurar etiquetas críticas desde el snapshot (ingeniero u observaciones)
                            if (typeof cellData.value === 'string') {
                                const v = cellData.value
                                if (v.includes('NOMBRE DE INGENIERO RESIDENTE DE APOYO') || v.includes('OBSERVACIONES')) {
                                    // Saltar restauración de esta celda para evitar sobrescribir el encabezado dinámico
                                    return
                                }
                            }

                            cell.value = cellData.value
                            if (cellData.style) {
                                cell.style = JSON.parse(JSON.stringify(cellData.style))
                            }
                        }
                    })
                }

                console.log(`[REPARACIÓN] ✓ Fila ${rowNum} restaurada`)
            } else {
                console.log(`[VALIDACIÓN] ✓ Fila ${rowNum} intacta`)
            }
        })

        if (repairsNeeded > 0) {
            console.warn(`[AUTO-REPARACIÓN] ${repairsNeeded} filas fueron reparadas`)
        } else {
            console.log('[AUTO-REPARACIÓN] ✓ Todas las filas críticas están intactas')
        }

        // Restaurar altura de fila del ingeniero si es necesario
        const currentHeight = worksheet.getRow(FILA_INGENIERO).height
        if (currentHeight <= 0 || isNaN(currentHeight) || currentHeight === undefined) {
            worksheet.getRow(FILA_INGENIERO).height = 25
            console.log('[RESTAURACIÓN-ALTURA] Altura de fila del ingeniero restaurada a 25')
        }

        // ═══════════════════════════════════════════════════════════════
        // 💥 ARTILLERÍA MÁXIMA - FORMATO AGRESIVO A TODAS LAS FILAS DE DATOS 💥
        // ═══════════════════════════════════════════════════════════════
        console.log('[FORMATO-MÁXIMO] 💥 ARTILLERÍA MÁXIMA - Aplicando formato a TODAS las filas de datos...')

        let formatRepairs = 0
        const standardBorder = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }

        const standardAlignment = { horizontal: 'center', vertical: 'middle' }
        const standardFont = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }

        // APLICAR A TODAS LAS FILAS DE DATOS SIN EXCEPCIÓN
        sections.forEach(sec => {
            sec.actualDataRows.forEach(row => {
                // ⚠️ Saltar fila del ingeniero para no cambiar su altura
                if (row === FILA_INGENIERO) {
                    console.log(`[FORMATO-MÁXIMO] ⚠️ Saltando fila del ingeniero ${row}`)
                    return
                }
                console.log(`[FORMATO-MÁXIMO] 💥 FORZANDO formato fila ${row}`)
                formatRepairs++

                // BORRAR TODO EL FORMATO EXISTENTE Y APLICAR NUEVO
                const excelRow = worksheet.getRow(row)

                // Forzar altura
                excelRow.height = 15

                // APLICAR A TODAS LAS COLUMNAS A-I (1-9) SIN PIEDAD
                for (let col = 1; col <= 9; col++) {
                    const cell = excelRow.getCell(col)

                    // APLICAR formato de manera brutal (sin limpiar style ya que puede causar problemas)
                    cell.alignment = standardAlignment
                    cell.border = standardBorder
                    cell.font = standardFont

                    // Forzar aplicación inmediata estableciendo propiedades individuales
                    Object.assign(cell, {
                        alignment: standardAlignment,
                        border: standardBorder,
                        font: standardFont
                    })
                }
            })
        })

        // SEGUNDA PASADA - VERIFICACIÓN Y REAPLICACIÓN
        console.log('[FORMATO-MÁXIMO] 💥 SEGUNDA PASADA - Verificando formato aplicado...')
        sections.forEach(sec => {
            sec.actualDataRows.forEach(row => {
                // ⚠️ Saltar fila del ingeniero para no cambiar su altura
                if (row === FILA_INGENIERO) {
                    console.log(`[FORMATO-MÁXIMO] ⚠️ Saltando fila del ingeniero ${row} en segunda pasada`)
                    return
                }
                const excelRow = worksheet.getRow(row)
                for (let col = 1; col <= 9; col++) {
                    const cell = excelRow.getCell(col)

                    // Reaplicar formato sin condiciones (más agresivo)
                    console.log(`[FORMATO-MÁXIMO] 🔧 Reaplicando formato a celda ${row}:${col}`)
                    cell.alignment = { horizontal: 'center', vertical: 'middle' }
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    }
                    cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
                }
            })
        })

        // Limpieza final: asegurar que no queden duplicados de la etiqueta de ingeniero
        try {
            let removedFinal = 0
            const ingNameToMatch = (form.nombreIngeniero || '').toString().trim()
            for (let r = 1; r <= worksheet.rowCount; r++) {
                for (let c = 1; c <= 9; c++) {
                    const cell = worksheet.getCell(r, c)
                    if (typeof cell.value === 'string') {
                        const valTrim = cell.value.trim()
                        if (
                            (valTrim === 'NOMBRE DE INGENIERO RESIDENTE DE APOYO' || (ingNameToMatch && valTrim === ingNameToMatch) || /ing\.apoyo\.entrada/.test(valTrim) || /\{\{\s*ing\.apoyo\.entrada\s*\}\}/i.test(valTrim))
                            && r !== FILA_INGENIERO
                        ) {
                            if (clearCellOrMergeContaining(worksheet, cell)) removedFinal++
                        }
                    }
                }
            }
            if (removedFinal > 0) console.log(`[Excel] Eliminados ${removedFinal} duplicados de etiqueta ingeniero (paso final)`)
        } catch (err) {
            console.warn('[Excel] Error en limpieza final de duplicados de etiqueta ingeniero:', err)
        }

        console.log(`[FORMATO-MÁXIMO] ✅ ${formatRepairs} filas procesadas con ARTILLERÍA MÁXIMA`)

        // ═══════════════════════════════════════════════════════════════
        // 🧹 LIMPIEZA FILAS MOTIVOS (7-14) - NO DEBEN TENER FONDO AZUL
        // ═══════════════════════════════════════════════════════════════
        console.log('[LIMPIEZA-MOTIVOS] 🧹 Limpiando fondo de filas de motivos (7-14)...')

        // Las filas 7-14 contienen los motivos de entrada y NO deben tener fondo azul
        for (let filaMotivo = 7; filaMotivo <= 14; filaMotivo++) {
            const fila = worksheet.getRow(filaMotivo)

            // Limpiar fondo de TODAS las columnas de esta fila (A-I)
            for (let col = 1; col <= 9; col++) {
                let celda = null
                try {
                    celda = fila.getCell(col)
                } catch (e) {
                    celda = null
                }

                if (!celda) {
                    console.warn(`[LIMPIEZA-MOTIVOS] Celda inexistente en fila ${filaMotivo} col ${col}, se omite`)
                    continue
                }

                // Quitar cualquier fondo (fill) que pueda tener (safe)
                try { celda.fill = null } catch (e) { /* ignore */ }

                // Asegurar que el texto sea negro (no blanco)
                try {
                    if (celda.font) {
                        celda.font = {
                            ...celda.font,
                            color: { argb: 'FF000000' }  // Negro
                        }
                    }
                } catch (e) { /* ignore */ }
            }

            console.log(`[LIMPIEZA-MOTIVOS] ✓ Fila ${filaMotivo} limpiada (sin fondo azul)`)
        }

        console.log('[LIMPIEZA-MOTIVOS] ✅ Filas de motivos (7-14) limpias')


        // ═══════════════════════════════════════════════════════════════
        // FASE 4: GENERAR Y DESCARGAR ARCHIVO
        // ═══════════════════════════════════════════════════════════════
        // Re-aplicar de forma definitiva las filas dinámicas de OBSERVACIONES e INGENIERO
        try {
            const refSeccionFinal = sections.find(s => s.key === 'refacciones') || sections[sections.length - 1]
            const lastRows = (refSeccionFinal && (refSeccionFinal.actualDataRows && refSeccionFinal.actualDataRows.length) ? refSeccionFinal.actualDataRows : refSeccionFinal.dataRows) || [31, 32]
            const ultimaFilaRefacciones = Math.max(...lastRows)

            const FILA_ESPACIO_BLANCO_1 = ultimaFilaRefacciones + 1
            const FILA_ESPACIO_BLANCO_2 = ultimaFilaRefacciones + 2
            const FILA_ENCABEZADO_OBS = FILA_ESPACIO_BLANCO_2 + 1
            const FILA_CONTENIDO_OBS = FILA_ENCABEZADO_OBS + 1
            const FILA_INGENIERO = FILA_CONTENIDO_OBS + 1

            // Encabezado OBSERVACIONES (A:I)
            try { worksheet.unMergeCells(`A${FILA_ENCABEZADO_OBS}:I${FILA_ENCABEZADO_OBS}`) } catch (e) { }
            try { worksheet.mergeCells(`A${FILA_ENCABEZADO_OBS}:I${FILA_ENCABEZADO_OBS}`) } catch (e) { }
            const hdr = worksheet.getCell(`A${FILA_ENCABEZADO_OBS}`)
            hdr.value = 'OBSERVACIONES'
            try { applyHeaderStyle(worksheet, FILA_ENCABEZADO_OBS) } catch (e) { }
            hdr.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            }
            worksheet.getRow(FILA_ENCABEZADO_OBS).height = 25

            // Contenido OBSERVACIONES (A:F) + IMAGEN (G:I)
            try { worksheet.unMergeCells(FILA_CONTENIDO_OBS, 1, FILA_CONTENIDO_OBS, 9) } catch (e) { }
            // Texto
            try { worksheet.mergeCells(FILA_CONTENIDO_OBS, 1, FILA_CONTENIDO_OBS, 6) } catch (e) { }
            const txt = worksheet.getCell(FILA_CONTENIDO_OBS, 1)
            txt.value = form.observaciones || ''
            txt.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
            txt.font = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
            txt.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            }
            // Imagen área (G:I)
            try { worksheet.mergeCells(FILA_CONTENIDO_OBS, 7, FILA_CONTENIDO_OBS, 9) } catch (e) { }
            worksheet.getRow(FILA_CONTENIDO_OBS).height = 100
            if (form.observacionesImg && form.observacionesImg.dataUrl) {
                try {
                    const base64Img = String(form.observacionesImg.dataUrl).replace(/^data:image\/\w+;base64,/, '')
                    const extImg = (form.observacionesImg.extension || 'png').replace('jpeg', 'jpg')
                    const idImagen = workbook.addImage({ base64: base64Img, extension: extImg })
                    worksheet.addImage(idImagen, {
                        tl: { col: 6, row: FILA_CONTENIDO_OBS - 1 },
                        br: { col: 9, row: FILA_CONTENIDO_OBS },
                        editAs: 'oneCell'
                    })
                } catch (errImg) { console.warn('[FINAL-OBS] Error insertando imagen:', errImg) }
            }

            // Ingeniero
            try { worksheet.unMergeCells(FILA_INGENIERO, 1, FILA_INGENIERO, 9) } catch (e) { }
            try { worksheet.mergeCells(FILA_INGENIERO, 1, FILA_INGENIERO, 3) } catch (e) { }
            try { worksheet.mergeCells(FILA_INGENIERO, 4, FILA_INGENIERO, 9) } catch (e) { }
            const lab = worksheet.getCell(FILA_INGENIERO, 1)
            lab.value = 'NOMBRE DE INGENIERO RESIDENTE DE APOYO'
            lab.font = { name: 'Calibri', size: 10, bold: true }
            lab.alignment = { horizontal: 'left', vertical: 'middle' }
            const valIng = worksheet.getCell(FILA_INGENIERO, 4)
            valIng.value = form.nombreIngeniero || ''
            valIng.alignment = { horizontal: 'center', vertical: 'middle' }
            worksheet.getRow(FILA_INGENIERO).height = 25

            console.log('[FINAL-OBS] Observaciones/Ingeniero re-aplicados en filas', FILA_ENCABEZADO_OBS, FILA_CONTENIDO_OBS, FILA_INGENIERO)
        } catch (errFinalObs) {
            console.warn('[FINAL-OBS] Error re-aplicando Observaciones/Ingeniero:', errFinalObs)
        }

        // 🔥 HYPER FORZADO MEGA AGRESIVO - GARANTIZAR ALTURA DE FILA INGENIERO 🔥
        console.log(`[HYPER-FORZADO] 🔥 Aplicando hyper forzado a fila ${FILA_INGENIERO}`)
        try {
            // Método 1: Asignación directa
            const rowIng = worksheet.getRow(FILA_INGENIERO)
            rowIng.height = 25

            // Método 2: Array interno (índice 0-based)
            if (worksheet._rows && worksheet._rows[FILA_INGENIERO - 1]) {
                worksheet._rows[FILA_INGENIERO - 1].height = 25
            }

            console.log(`[HYPER-FORZADO] ✅ Altura forzada a 25 en fila ${FILA_INGENIERO}`)
        } catch (hyperError) {
            console.error('[HYPER-FORZADO] ❌ Error en hyper forzado:', hyperError)
            // Método de respaldo: manipulación del modelo
            try {
                if (worksheet.model && worksheet.model.rows && worksheet.model.rows[FILA_INGENIERO - 1]) {
                    worksheet.model.rows[FILA_INGENIERO - 1].height = 25
                }
                console.log('[HYPER-FORZADO] 🔄 Método de respaldo aplicado')
            } catch (backupError) {
                console.error('[HYPER-FORZADO] ❌ Método de respaldo falló:', backupError)
                // MÉTODO FINAL APOCALÍPTICO: Manipulación del DOM XML interno
                try {
                    if (worksheet.worksheet && worksheet.worksheet.sheetData && worksheet.worksheet.sheetData.rows) {
                        const rows = worksheet.worksheet.sheetData.rows
                        if (rows[FILA_INGENIERO - 1]) { // índice 0-based
                            rows[FILA_INGENIERO - 1].ht = 25
                            rows[FILA_INGENIERO - 1].customHeight = true
                        }
                    }
                    console.log('[HYPER-FORZADO] 💀 Método apocalíptico aplicado')
                } catch (apocalypseError) {
                    console.error('[HYPER-FORZADO] ❌ Método apocalíptico falló:', apocalypseError)
                }
            }
        }

        // 🔥 ULTRA FORZADO ESPECÍFICO PARA FILA 45 🔥
        console.log('[ULTRA-FORZADO] 🔥 Aplicando ultra forzado específico a fila 45')
        try {
            // Método 1: Asignación directa
            const row45 = worksheet.getRow(45)
            row45.height = 25

            // Método 2: Array interno (índice 0-based: 45-1=44)
            if (worksheet._rows) {
                worksheet._rows[44] = worksheet._rows[44] || {}
                worksheet._rows[44].height = 25
                worksheet._rows[44].hidden = false
            }

            // Método 3: Modelo de datos
            if (worksheet.model && worksheet.model.rows && worksheet.model.rows[44]) {
                worksheet.model.rows[44].height = 25
            }

            console.log('[ULTRA-FORZADO] ✅ Altura ultra forzada a 25 en fila 45')
        } catch (ultraError) {
            console.error('[ULTRA-FORZADO] ❌ Error en ultra forzado:', ultraError)
            // Último recurso: manipulación extrema
            try {
                const row45 = worksheet.getRow(45)
                // Eliminar propiedad height si existe y es read-only
                const descriptor = Object.getOwnPropertyDescriptor(row45, 'height')
                if (descriptor && !descriptor.writable) {
                    delete row45.height
                }
                row45.height = 25
                console.log('[ULTRA-FORZADO] 🔧 Último recurso aplicado exitosamente')
            } catch (lastResortError) {
                console.error('[ULTRA-FORZADO] ❌ Último recurso falló:', lastResortError)
                // MÉTODO FINAL APOCALÍPTICO: Manipulación del DOM XML interno
                try {
                    if (worksheet.worksheet && worksheet.worksheet.sheetData && worksheet.worksheet.sheetData.rows) {
                        const rows = worksheet.worksheet.sheetData.rows
                        if (rows[44]) { // índice 0-based
                            rows[44].ht = 25
                            rows[44].customHeight = true
                        }
                    }
                    console.log('[FORZADO] ')
                } catch (apocalypseError) {
                    console.error('[ULTRA-FORZADO] ❌ Método apocalíptico falló:', apocalypseError)
                }
            }
        }
        // LIMPIEZA FINAL: evitar celdas "invisibles" dejando un NBSP cuando están vacías
        try {
            const regions = new Set()
            // filas de motivos (7-14)
            for (let r = 7; r <= 14; r++) regions.add(r)
            // filas dinámicas Observaciones/Ingeniero
            if (typeof FILA_ENCABEZADO_OBS === 'number') regions.add(FILA_ENCABEZADO_OBS)
            if (typeof FILA_CONTENIDO_OBS === 'number') regions.add(FILA_CONTENIDO_OBS)
            if (typeof FILA_INGENIERO === 'number') regions.add(FILA_INGENIERO)
            // filas de datos en secciones (si existe variable sections)
            try {
                if (Array.isArray(sections)) {
                    sections.forEach(sec => {
                        if (sec && Array.isArray(sec.actualDataRows)) {
                            sec.actualDataRows.forEach(r => regions.add(r))
                        }
                    })
                }
            } catch (errSec) { /* ignore */ }

            Array.from(regions).forEach(rowNum => {
                try {
                    const row = worksheet.getRow(rowNum)
                    if (!row) return
                    for (let col = 1; col <= 9; col++) {
                        try {
                            const cell = row.getCell(col)
                            if (!cell) continue
                            const v = cell.value
                            if (v === null || v === undefined || v === '') {
                                // Usar NBSP para que la celda no quede "colapsada" visualmente
                                cell.value = '\u00A0'
                                // asegurar wrap y alineación
                                cell.alignment = Object.assign({}, cell.alignment || {}, { wrapText: true, vertical: 'middle' })
                            }
                        } catch (inner) { /* ignore cell errors */ }
                    }
                } catch (rowErr) { /* ignore row errors */ }
            })
            console.log('[LIMPIEZA-EMPTY] ✓ Celdas vacías relevantes rellenadas con NBSP')
        } catch (errClean) {
            console.warn('[LIMPIEZA-EMPTY] Error en limpieza final:', errClean)
        }

        // Insertar imagen de membrete en encabezado (si existe)
        try {
            // Restaurar media/imagenes/headerFooter guardadas si por alguna manipulación se perdieron
            try {
                if (__saved_workbook_media && __saved_workbook_media.length > 0 && (!workbook.model || !workbook.model.media || workbook.model.media.length === 0)) {
                    workbook.model = workbook.model || {}
                    workbook.model.media = __saved_workbook_media
                    console.log('[IMAGEN-RESTORE] Restaurado workbook.model.media desde snapshot')
                }
                if (__saved_worksheet_images && __saved_worksheet_images.length > 0 && (!worksheet._images || worksheet._images.length === 0)) {
                    worksheet._images = __saved_worksheet_images
                    console.log('[IMAGEN-RESTORE] Restauradas worksheet._images desde snapshot')
                }
                if (__saved_header_footer && (!worksheet.headerFooter || Object.keys(worksheet.headerFooter).length === 0)) {
                    worksheet.headerFooter = __saved_header_footer
                    console.log('[IMAGEN-RESTORE] Restaurado headerFooter desde snapshot')
                }
            } catch (restoreErr) {
                console.warn('[IMAGEN-RESTORE] Error intentando restaurar media/imagenes/headerFooter:', restoreErr)
            }

            // Si la plantilla ya contiene imágenes o header/footer, NO insertar nada para preservar la plantilla
            const hasWorksheetImages = (typeof worksheet.getImages === 'function' && worksheet.getImages().length > 0) || (worksheet._images && worksheet._images.length > 0)
            const hasWorkbookMedia = (workbook && workbook.model && Array.isArray(workbook.model.media) && workbook.model.media.length > 0) || (workbook && workbook.media && workbook.media.length > 0)
            const hasHeaderFooter = worksheet.headerFooter && (worksheet.headerFooter.firstHeader || worksheet.headerFooter.oddHeader || worksheet.headerFooter.evenHeader || worksheet.headerFooter.firstFooter || worksheet.headerFooter.oddFooter || worksheet.headerFooter.evenFooter)

            if (hasWorksheetImages || hasWorkbookMedia || hasHeaderFooter) {
                console.log('[IMAGEN] Plantilla ya contiene imágenes/encabezado - preservando encabezado y pie existentes')
            } else {
                const imgUrl = '/images/servicios_salud.png'
                const resp = await fetch(imgUrl)
                if (resp && resp.ok) {
                    const arr = await resp.arrayBuffer()
                    const imageId = workbook.addImage({ buffer: arr, extension: 'png' })
                    // Posicionar imagen a la izquierda del encabezado (solo si la plantilla no la contiene)
                    try {
                        worksheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 160, height: 90 } })
                        console.log('[IMAGEN] Membrete insertado en encabezado desde', imgUrl)
                    } catch (posErr) {
                        try {
                            worksheet.addImage(imageId, { tl: { col: 0, row: 0 }, br: { col: 2, row: 3 } })
                            console.log('[IMAGEN] Membrete insertado (rango fallback) desde', imgUrl)
                        } catch (posErr2) {
                            console.warn('[IMAGEN] No se pudo posicionar la imagen en el encabezado:', posErr2)
                        }
                    }
                } else {
                    console.log('[IMAGEN] No se encontró la imagen de membrete en', imgUrl)
                }
            }
        } catch (imgErr) {
            console.warn('[IMAGEN] Error cargando imagen de membrete:', imgErr)
        }

        console.log('[GENERACIÓN] Creando archivo final...')
        const buffer = await workbook.xlsx.writeBuffer()
        // MIME corregido: spreadsheetml (antes había un typo)
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, `entrada_${form.folio || 'sin-folio'}_${Date.now()}.xlsx`)

        notifier.success('Excel generado correctamente')
    } catch (error) {
        console.error('Error al generar Excel:', error)
        notifier.error('Error al generar el archivo Excel')
    }
}

function normalizedCount(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) {
        return 0
    }
    return Math.max(0, Math.round(numeric))
}

function makeEmptyItem() {
    return {
        descripcion: '',
        claveHRAEI: '',
        cantidad: null
    }
}

function announceChange(verb, count) {
    if (!hydrated.value || count <= 0) {
        return
    }
    const label = count === 1 ? '1 renglón' : `${count} renglones`
    notifier.info(`${verb} ${label} para registrar equipos`)
}

// Keeps inline detail rows aligned with the main quantity control.
function syncItemsToCantidad() {
    const target = normalizedCount(form.cantidad)
    const current = form.items.length

    if (target === current) {
        return
    }

    if (target > current) {
        const diff = target - current
        for (let i = 0; i < diff; i += 1) {
            form.items.push(makeEmptyItem())
        }
        announceChange('Agregaste', diff)
        return
    }

    const diff = current - target
    form.items.splice(target)
    announceChange('Eliminaste', diff)
}

function adjustMain(delta) {
    const current = Number(form.cantidad || 0)
    form.cantidad = normalizedCount(current + delta)
    syncItemsToCantidad()
}

function incMain() {
    adjustMain(1)
}

function decMain() {
    adjustMain(-1)
}

function incMainBy(amount) {
    adjustMain(amount)
}

function decMainBy(amount) {
    adjustMain(-amount)
}

function clearForm() {
    form.descripcion = ''
    form.observaciones = ''
    form.nombreIngeniero = ''
    form.observacionesImg = null
    form.cantidad = 0
    form.fechaRecibo = ''
    form.solicitante = ''
    form.unidad = ''
    form.turno = ''
    form.items = []
    // Reset signatures to defaults
    form.signatures = JSON.parse(JSON.stringify(DEFAULT_SIGNATURES))
    syncItemsToCantidad()
    try {
        localStorage.removeItem(LOCAL_KEY)
    } catch {
        // ignore storage errors
    }
    savedAt.value = ''
}



async function onSubmit() {
    if (isReadOnly.value) return
    if (!isValid.value) {
        notifier.error('Completa los campos obligatorios')
        return
    }

    // Capturar hora de término (con segundos) en el momento en que el usuario pulsa "Guardar orden"
    // (esto fija la hora final incluso antes de la confirmación del modal)
    const nowStart = new Date()
    const hhStart = String(nowStart.getHours()).padStart(2, '0')
    const mmStart = String(nowStart.getMinutes()).padStart(2, '0')
    const ssStart = String(nowStart.getSeconds()).padStart(2, '0')
    form.horaTermino = `${hhStart}:${mmStart}:${ssStart}`
    stopTimer()

    // Construir resumen para modal de confirmación
    const escapeHtml = (s) => {
        if (!s) return ''
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    const makeListHtml = (title, units) => {
        if (!units || units.length === 0) return ''
        const rows = units.map((u, i) => {
            const name = escapeHtml(u.nombre || u.descripcion || '-')
            const qty = u.cantidad || 1
            const modelo = escapeHtml(u.modelo || '')
            const serie = escapeHtml(u.serie || u.lote || '')
            return `<li><strong>${i + 1}.</strong> ${name} — x${qty} ${modelo ? `— ${modelo}` : ''} ${serie ? `— ${serie}` : ''}</li>`
        }).join('')
        return `<p style="margin:10px 0 4px"><strong>${escapeHtml(title)} (${units.length}):</strong></p><ul style="margin:4px 0 8px 18px;">${rows}</ul>`
    }

    const equipos = form.equiposEntrada.filter(i => i.tipo === 'equipo-medico' || i.tipo === 'mobiliario')
    const accesorios = form.equiposEntrada.filter(i => i.tipo === 'accesorio')
    const consumibles = form.equiposEntrada.filter(i => i.tipo === 'consumible')
    const refacciones = form.equiposEntrada.filter(i => i.tipo === 'refaccion')

    // Generar listas por tipo (unidades)
    const unidadesEquipos = equipos.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.serie || it.unidades?.[0]?.serie || '' }])
    const unidadesAccesorios = accesorios.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.lote || it.unidades?.[0]?.lote || '' }])
    const unidadesConsumibles = consumibles.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.lote || it.unidades?.[0]?.lote || '' }])
    const unidadesRefacciones = refacciones.flatMap(it => Array.isArray(it.unidades) ? it.unidades : [{ nombre: it.descripcion || it.unidades?.[0]?.nombre || '', cantidad: it.cantidad || 1, modelo: it.modelo || it.unidades?.[0]?.modelo || '', serie: it.lote || it.unidades?.[0]?.lote || '' }])

    const motivoLabel = (() => {
        if (form.motivoEntrada === 'otro') return `OTRO: ${escapeHtml(form.otroMotivo || '')}`
        const opt = motivoEntradaOptions.find(o => o.value === form.motivoEntrada)
        return opt ? escapeHtml(opt.label) : ''
    })()

        // Si hay firmantes pendientes, calcular antes de construir el HTML de confirmación
        const hasPending = Array.isArray(form.signatures) && form.signatures.some(s => {
            if (!s) return true
            const n = (s.name || '').toString().trim()
            return !n || n.toUpperCase() === 'PENDING'
        })

        if (hasPending) {
            notifier.info('La orden se generará ahora. Actualiza los firmantes marcados como PENDIENTE DE LLENAR al subir el documento firmado.')
        }

        const html = `
        <div style="text-align:left; max-height: 480px; overflow:auto; font-size: 14px;">
          ${hasPending ? `<p style="background:#fffbeb; border-left:4px solid #f59e0b; padding:8px 10px; border-radius:4px; color:#92400e; margin-bottom:10px"><strong>Atención:</strong> La orden se generará ahora, pero algunos firmantes aparecen como <em>PENDIENTE DE LLENAR</em>. Recuerda actualizar los nombres al subir el documento firmado.</p>` : ''}
      <p><strong>Solicitante:</strong> ${escapeHtml(form.nombreSolicitante)}</p>
      <p><strong>Servicio:</strong> ${escapeHtml(form.servicio)}</p>
      <p><strong>Especialidad:</strong> ${escapeHtml(form.especialidad)}</p>
      <p><strong>Folio:</strong> ${escapeHtml(form.folio)}</p>
      <p><strong>Fecha:</strong> ${escapeHtml(form.fecha)}</p>
      <p><strong>Hora inicio:</strong> ${escapeHtml(form.horaInicio)} — <strong>Hora término:</strong> ${escapeHtml(form.horaTermino)}</p>
      <p><strong>Motivo:</strong> ${motivoLabel}</p>
      <p><strong>Descripción:</strong> ${escapeHtml(form.descripcion).slice(0, 100)}${(form.descripcion && form.descripcion.length > 100) ? '...' : ''}</p>
      <p><strong>Observaciones:</strong> ${escapeHtml(form.observaciones || '').slice(0, 150)}${(form.observaciones && form.observaciones.length > 150) ? '...' : ''}</p>
      <p><strong>Ingeniero Residente:</strong> ${escapeHtml(form.nombreIngeniero || '')}</p>
      ${makeListHtml('Equipos', unidadesEquipos)}
      ${makeListHtml('Accesorios', unidadesAccesorios)}
      ${makeListHtml('Consumibles', unidadesConsumibles)}
      ${makeListHtml('Refacciones', unidadesRefacciones)}
      ${form.observacionesImg ? `<p style="margin:6px 0 4px"><strong>Imagen adjunta:</strong></p><img src="${form.observacionesImg.dataUrl}" style="max-width:200px; max-height:160px; border-radius:8px; display:block; margin-top:6px;" />` : ''}
    </div>
  `

    const result = await showAlert({
        title: 'Confirma y genera PDF',
        html,
        showCancelButton: true,
        confirmButtonText: 'Generar y Guardar (PDF)',
        cancelButtonText: 'Cancelar',
        width: '800px',
        confirmButtonColor: '#4ade80',
        cancelButtonColor: 'rgba(255, 255, 255, 0.08)'
    })

    if (!result.isConfirmed) return

    loading.value = true

    const payload = {
        nombreSolicitante: form.nombreSolicitante,
        servicio: form.servicio,
        especialidad: form.especialidad,
        folio: sanitizeFolio(form.folio),
        fecha: normalizeFecha(form.fecha),  // Normalizar a DD-MM-YYYY
        horaInicio: form.horaInicio,
        horaTermino: form.horaTermino,
        motivoEntrada: form.motivoEntrada,
        otroMotivo: form.otroMotivo,
        descripcion: form.descripcion,
        observaciones: form.observaciones,
        nombreIngeniero: form.nombreIngeniero,
        equiposEntrada: form.equiposEntrada,
        observacionesImg: form.observacionesImg ? form.observacionesImg.dataUrl : null,
        signatures: form.signatures, // centralized signature model
        createdAt: new Date().toISOString()
    }

    try {
        // Edit mode: NO persistencia aquí. Centralizar sync en OrderManagement.
        if (props.modo === 'editar') {
            if (!payload.id && props.ordenId) payload.id = props.ordenId
            console.log('[OpEntrada] Emitting actualizado payload.signatures:', payload.signatures)
            emit('actualizado', payload)
            emit('close')
            loading.value = false
            return
        }

        // Normal create flow (POST)
        const url = '/api/ops/entrada'
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            if (res.status === 404) {
                // Endpoint no disponible: guardar local y generar PDF igualmente
                notifier.info('API de guardado no disponible (404), se guardará como borrador localmente')
            } else {
                throw new Error('No se pudo guardar en el servidor')
            }
        } else {
            notifier.success('Orden guardada en el servidor')
            // Also persist to local orders list for quick consumption by frontend
            try {
                const raw = localStorage.getItem(ORDERS_LIST_KEY)
                const arr = raw ? JSON.parse(raw) : []
                arr.push({ id: Date.now(), ...payload })
                localStorage.setItem(ORDERS_LIST_KEY, JSON.stringify(arr))
            } catch (e) { }
            // clearForm se realiza tras generar el Excel para que la descarga se pueda llevar a cabo
            // (no queremos limpiar antes de la generación)
            await generarPdfEntrada(payload)
            clearForm()
            // Navegar a Order Management para que la tabla se actualice con la nueva orden
            try {
                await router.replace({ name: 'order-management', query: { t: Date.now() } })
            } catch (e) { /* ignore navigation errors */ }
            // If SPA navigation didn't change the route (guards or other issues), do a controlled remount instead of full reload
            try {
                const currentName = router.currentRoute.value && router.currentRoute.value.name
                if (currentName !== 'order-management') {
                    const ts = Date.now()
                    // perform SPA navigation replace and emit force-recreate to remount components without reloading the page
                    try { router.replace({ path: '/op/order-management', query: { t: ts } }).catch(()=>{}) } catch (e) { /* ignore */ }
                    try { window.dispatchEvent(new CustomEvent('app:force-recreate')) } catch (e) { /* ignore */ }
                    return
                }
            } catch (e) {
                // best-effort fallback — ignore
            }
            loading.value = false
            return
        }
    } catch (err) {
        try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
            // Also add to 'orders_list' to make it visible in OrderManagement when offline
            try {
                const raw = localStorage.getItem(ORDERS_LIST_KEY)
                const arr = raw ? JSON.parse(raw) : []
                arr.push({ id: Date.now(), ...payload })
                localStorage.setItem(ORDERS_LIST_KEY, JSON.stringify(arr))
            } catch (e) { }
        } catch {
            // ignore storage errors
        }
        notifier.success('Orden guardada como borrador (offline)')
        // Intentar generar PDF igualmente
        try {
            await generarPdfEntrada(payload)
        } catch (e) {
            console.error('Error generando PDF tras fallback:', e)
            notifier.error('No se pudo generar el PDF')
        }
    } finally {
        loading.value = false
    }
}

let autosaveTimer

watch(
    form,
    () => {
        if (!hydrated.value) return
        clearTimeout(autosaveTimer)
        autosaveTimer = setTimeout(() => {
            try {
                // Avoid storing base64 image in localStorage to prevent large entries
                const safeCopy = { ...form }
                if (safeCopy.observacionesImg) delete safeCopy.observacionesImg
                localStorage.setItem(LOCAL_KEY, JSON.stringify(safeCopy))
                savedAt.value = new Date().toLocaleTimeString()
            } catch {
                // ignore storage errors
            }
        }, 800)
    },
    { deep: true, flush: 'post' }
)

watch(
    () => form.cantidad,
    () => {
        form.cantidad = normalizedCount(form.cantidad)
        syncItemsToCantidad()
    }
)

// Sincronizar DatePicker (ISO) al campo de display y viceversa
watch(() => form.fechaISO, (val) => {
    if (!val) { form.fecha = ''; return }
    const v = String(val).trim()
    // Esperamos YYYY-MM-DD desde DatePicker
    if (v.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = v.split('-')
        form.fecha = `${day}-${month}-${year}`
        return
    }
    // Si no es ISO, intentar convertir
    const iso = toISO(v)
    if (iso && iso.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = iso.split('-')
        form.fecha = `${day}-${month}-${year}`
    } else {
        form.fecha = v
    }
})

watch(() => form.fecha, (val) => {
    if (!val) { form.fechaISO = ''; return }
    const s = String(val).trim()

    // Si usuario escribe con slashes DD/MM/YYYY o con guiones DD-MM-YYYY -> convertir a ISO
    if (s.match(/^\d{2}\/\d{2}\/\d{4}$/) || s.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const iso = toISO(s)
        if (iso) form.fechaISO = iso
        return
    }

    // Si ingresó ISO directamente
    if (s.match(/^\d{4}-\d{2}-\d{2}$/)) {
        form.fechaISO = s
        return
    }
    // Dejar fechaISO sin tocar en otros casos
})

// Iniciar el temporizador automáticamente cuando el usuario seleccione la hora de inicio
watch(() => form.horaInicio, (val) => {
    if (val && !timerStartedAt.value) {
        startTimer()
    }
})

// Cargar datos de la orden cuando está en modo editar
const loadOrderData = async () => {
    if (props.snapshot) return
    if (props.modo !== 'editar' || !props.ordenId) return

    loadingOrden.value = true
    try {
        const ordenIdStr = String(props.ordenId)
        // Evitar caché: forzar refresh real
        const res = await fetch(`/api/ops/entrada/${encodeURIComponent(ordenIdStr)}?t=${Date.now()}`, { cache: 'no-store' })

        if (res.status === 404) {
            console.warn(`Orden no encontrada (404): ${ordenIdStr}`)
            notifier.warn('La orden solicitada no existe en el servidor. Los campos estarán vacíos.')
            loadingOrden.value = false
            return
        }

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const response = await res.json()
        // La respuesta viene como { ok: true, orden, items }
        const data = response.orden || response

        // Mapear campos de snake_case (BD) a camelCase (Frontend)
        form.nombreSolicitante = data.nombre_solicitante || data.nombreSolicitante || ''
        form.servicio = data.servicio || ''
        form.especialidad = data.especialidad || ''
        form.folio = data.folio || ''
        form.fecha = data.fecha || ''
        form.fechaISO = data.fecha ? toISO(data.fecha) : ''
        form.horaInicio = data.hora_inicio || data.horaInicio || ''
        form.horaTermino = data.hora_termino || data.horaTermino || ''
        form.motivoEntrada = data.motivo_entrada || data.motivoEntrada || ''
        form.otroMotivo = data.otro_motivo || data.otroMotivo || ''
        form.descripcion = data.descripcion || ''
        form.observaciones = data.observaciones || ''
        form.nombreIngeniero = data.nombre_ingeniero || data.nombreIngeniero || ''

        // Procesar items que vienen de la BD
        if (response.items && Array.isArray(response.items)) {
            // Reconstruir la lista respetando el orden original y expandiendo por unidad cuando sea necesario
            const loaded = []
            for (const item of response.items) {
                const line = item.line
                const tipo = item.tipo
                const descripcion = item.descripcion || ''
                const marca = item.marca || ''
                const modelo = item.modelo || ''
                const serie = item.serie || ''
                const lote = item.lote || ''
                const referencia = item.referencia || ''
                const ubicacion = item.ubicacion || ''
                const claveHRAEI = item.clave_hraei || item.claveHRAEI || ''

                // Si el registro trae 'unidades' (estructura antigua o explícita)
                if (item.unidades && Array.isArray(item.unidades) && item.unidades.length) {
                    if (['accesorio', 'consumible', 'refaccion'].includes(tipo)) {
                        // Crear una entrada por cada unidad para preservar orden
                        for (const unidad of item.unidades) {
                            loaded.push({
                                tipo,
                                cantidad: 1,
                                descripcion: unidad.nombre || descripcion || '',
                                marca: unidad.marca || marca || '',
                                modelo: unidad.modelo || modelo || '',
                                serie: unidad.serie || serie || '',
                                lote: unidad.lote || lote || '',
                                referencia: unidad.referencia || referencia || '',
                                ubicacion: unidad.ubicacion || ubicacion || '',
                                claveHRAEI: unidad.clave_hraei || unidad.claveHRAEI || claveHRAEI || '',
                                unidades: [{ ...unidad, cantidad: unidad.cantidad || 1 }]
                            })
                        }
                    } else {
                        // Equipos / mobiliario: mantener una entrada con su array de unidades
                        const unidades = item.unidades.map(u => ({
                            nombre: u.nombre || '',
                            marca: u.marca || marca || '',
                            modelo: u.modelo || modelo || '',
                            serie: u.serie || serie || '',
                            lote: u.lote || lote || '',
                            referencia: u.referencia || referencia || '',
                            ubicacion: u.ubicacion || ubicacion || '',
                            claveHRAEI: u.clave_hraei || u.claveHRAEI || claveHRAEI || '',
                            cantidad: u.cantidad || 1
                        }))
                        loaded.push({
                            tipo,
                            cantidad: unidades.reduce((s, u) => s + (Number(u.cantidad) || 1), 0),
                            descripcion: descripcion || (unidades[0] && unidades[0].nombre) || '',
                            marca: marca || (unidades[0] && unidades[0].marca) || '',
                            modelo: modelo || (unidades[0] && unidades[0].modelo) || '',
                            serie,
                            lote,
                            referencia,
                            ubicacion,
                            claveHRAEI,
                            unidades
                        })
                    }

                } else if (item.cantidad && Number(item.cantidad) > 1) {
                    const qty = Number(item.cantidad)
                    if (['accesorio', 'consumible', 'refaccion'].includes(tipo)) {
                        // Expandir en entradas individuales (una por unidad)
                        for (let i = 0; i < qty; i++) {
                            loaded.push({
                                tipo,
                                cantidad: 1,
                                descripcion: descripcion || '',
                                marca,
                                modelo,
                                serie,
                                lote,
                                referencia,
                                ubicacion,
                                claveHRAEI,
                                unidades: []
                            })
                        }
                    } else {
                        // Equipos/mobiliario con cantidad >1 -> generar una entrada con unidades vacías de placeholder
                        const unidades = []
                        for (let i = 0; i < qty; i++) {
                            unidades.push({
                                nombre: '',
                                marca,
                                modelo,
                                serie: '',
                                lote: '',
                                referencia: '',
                                ubicacion,
                                claveHRAEI,
                                cantidad: 1
                            })
                        }
                        loaded.push({
                            tipo,
                            cantidad: qty,
                            descripcion,
                            marca,
                            modelo,
                            serie,
                            lote,
                            referencia,
                            ubicacion,
                            claveHRAEI,
                            unidades
                        })
                    }

                } else {
                    // Caso simple: una fila que representa una sola unidad
                    if (['accesorio', 'consumible', 'refaccion'].includes(tipo)) {
                        loaded.push({
                            line,
                            tipo,
                            cantidad: 1,
                            descripcion: descripcion || '',
                            marca,
                            modelo,
                            serie,
                            lote,
                            referencia,
                            ubicacion,
                            claveHRAEI,
                            unidades: []
                        })
                    } else {
                        // Equipo/mobiliario -> representar como entrada con una unidad
                        loaded.push({
                            line,
                            tipo,
                            cantidad: 1,
                            descripcion: descripcion || '',
                            marca,
                            modelo,
                            serie,
                            lote,
                            referencia,
                            ubicacion,
                            claveHRAEI,
                            unidades: [{ nombre: descripcion || '', marca, modelo, serie, referencia, lote, ubicacion, claveHRAEI, cantidad: 1 }]
                        })
                    }
                }
            }

            form.equiposEntrada = loaded
            console.info('[OpEntrada] Loaded items (preserving order):', loaded.map((it, idx) => ({ idx, tipo: it.tipo, descripcion: it.descripcion, cantidad: it.cantidad })))

            // Set the most recent item (last one) as editable
            if (loaded.length > 0) {
                mostRecentItemIndex.value = loaded.length - 1
            }
        } else {
            form.equiposEntrada = Array.isArray(data.equiposEntrada) ? data.equiposEntrada : []
        }

        // Cargar imagen si existe
        if (data.observaciones_img_path) {
            const imgPath = String(data.observaciones_img_path).trim()
            if (imgPath && imgPath.length > 0 && imgPath !== 'null' && imgPath !== 'undefined') {
                
                let finalUrl = imgPath;
                if (!imgPath.startsWith('data:image')) {
                    // It's a filename, construct full URL
                    finalUrl = `/api/ops/images/${imgPath}`;
                }

                form.observacionesImg = {
                    dataUrl: finalUrl,
                    name: 'Imagen de observaciones',
                    extension: 'jpg'
                }
                console.log('[OpEntrada] Imagen cargada:', { name: form.observacionesImg.name, url: finalUrl })
            } else {
                form.observacionesImg = null
                console.log('[OpEntrada] observaciones_img_path vacío o inválido')
            }
        } else {
            form.observacionesImg = null
            console.log('[OpEntrada] Sin observaciones_img_path')
        }

        // Actualizar info de la orden para el título
        ordenInfo.folio = data.folio || ''
        ordenInfo.nombreSolicitante = data.nombre_solicitante || data.nombreSolicitante || ''
        ordenInfo.fecha = data.fecha || ''

        notifier.info('Datos de la orden cargados exitosamente')
    } catch (err) {
        console.error('Error cargando orden:', err)
        notifier.error(`Error al cargar los datos de la orden: ${err.message}`)
    } finally {
        loadingOrden.value = false
    }
}

// Forzar recarga completa cuando cambie la orden (abrir/cerrar/reabrir) — sin datos en caché.
watch(
    () => [props.modo, props.ordenId],
    async () => {
        if (props.snapshot) return
        if (props.modo === 'editar' && props.ordenId) {
            await loadOrderData()
        }
    },
    { immediate: true }
)

watch(
    () => props.snapshot,
    (snap) => {
        if (snap) applySnapshotToForm(snap)
    },
    { immediate: true }
)

onMounted(async () => {
    // Limpiar observacionesImg del localStorage para evitar caching de imágenes antiguas
    try {
        const raw = localStorage.getItem(LOCAL_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.observacionesImg) {
                delete parsed.observacionesImg
                localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed))
            }
        }
    } catch (e) { }
    
    // Si es modo editar, cargar los datos de la orden
    if (props.modo === 'editar') {
        if (!props.snapshot) await loadOrderData()
    } else {
        // Cargar datos guardados localmente en modo crear
        try {
            const raw = localStorage.getItem(LOCAL_KEY)
            if (raw) {
                const data = JSON.parse(raw)
                form.descripcion = data.descripcion || ''
                form.cantidad = normalizedCount(data.cantidad ?? 0)
                form.fechaRecibo = data.fechaRecibo || ''
                form.solicitante = data.solicitante || ''
                form.unidad = data.unidad || ''
                form.turno = data.turno || ''
                form.observaciones = data.observaciones || ''
                form.nombreIngeniero = data.nombreIngeniero || ''
                const storedItems = Array.isArray(data.items) ? data.items : []
                form.items = []
                syncItemsToCantidad()
                for (let i = 0; i < form.items.length && i < storedItems.length; i += 1) {
                    const it = storedItems[i] || {}
                    form.items[i].descripcion = it.descripcion || ''
                    form.items[i].claveHRAEI = it.claveHRAEI || ''
                    form.items[i].cantidad = it.cantidad ?? null
                }
                savedAt.value = new Date().toLocaleTimeString()
            } else {
                // Inicializar con datos del usuario logueado para nuevas órdenes
                const loggedUser = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre') }
                form.nombreIngeniero = loggedUser.nombre || ''
                form.items = []
                syncItemsToCantidad()
            }
        } catch {
            // Inicializar con datos del usuario logueado si hay error al cargar localStorage
            const loggedUser = JSON.parse(localStorage.getItem('user') || 'null') || { nombre: localStorage.getItem('nombre') }
            form.nombreIngeniero = loggedUser.nombre || ''
            form.items = []
            syncItemsToCantidad()
        }
    }
    hydrated.value = true

    // Configurar scroll listener
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial scroll position

    // Start timer if user focuses inside the form (first interaction)
    if (rootRef.value) {
        rootRef.value.addEventListener('focusin', startTimer)
        rootRef.value.addEventListener('click', startTimer)
    }

    // Iniciar el temporizador automáticamente al montar el componente
    startTimer()
})

// Zoom forzado del sitio al 80% cuando el viewport es ~380x636 (móviles pequeños)
const ZOOM_SCALE = 0.8
let zoomApplied = false

const applyForcedZoomIfSmallMobile = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    const isSmallMobile = w <= 400 && h >= 620
    if (isSmallMobile && !zoomApplied) {
        try {
            document.documentElement.style.zoom = String(ZOOM_SCALE)
            zoomApplied = true
        } catch (e) { /* noop */ }
    } else if (!isSmallMobile && zoomApplied) {
        try {
            document.documentElement.style.zoom = ''
        } catch (e) { /* noop */ }
        zoomApplied = false
    }
}

onMounted(() => {
    try { console.debug('[OpEntrada] mounted route:', router.currentRoute && router.currentRoute.value ? router.currentRoute.value.fullPath : '(unknown)') } catch {}
    try { window.dispatchEvent(new CustomEvent('route:mounted', { detail: { name: router.currentRoute && router.currentRoute.value ? router.currentRoute.value.name : '', path: router.currentRoute && router.currentRoute.value ? router.currentRoute.value.fullPath : '' } })); console.debug('[OpEntrada] dispatched route:mounted') } catch {}
    applyForcedZoomIfSmallMobile()
    window.addEventListener('resize', applyForcedZoomIfSmallMobile)
    window.addEventListener('orientationchange', applyForcedZoomIfSmallMobile)
})

onBeforeUnmount(() => {
    try { console.debug('[OpEntrada] beforeUnmount route:', router.currentRoute && router.currentRoute.value ? router.currentRoute.value.fullPath : '(unknown)') } catch {}
    try { document.documentElement.style.zoom = '' } catch (e) { }
    window.removeEventListener('resize', applyForcedZoomIfSmallMobile)
    window.removeEventListener('orientationchange', applyForcedZoomIfSmallMobile)
    zoomApplied = false
})

// Tooltip portal for Hora de término (avoid layout shifts)
const tooltipVisible = ref(false)
const tooltipStyle = ref({})

// Refs for end time display
const endTimeInputRef = ref(null)
const helpIconRef = ref(null)

const showTermTooltip = () => {
    const el = helpIconRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    // position below the icon, centered
    tooltipStyle.value = {
        position: 'fixed',
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.bottom + 10}px`,
        transform: 'translateX(-50%)',
        zIndex: 2147483647
    }
    tooltipVisible.value = true
}

const hideTermTooltip = () => {
    tooltipVisible.value = false
}

// reposition on scroll/resize when visible
const onWindowChange = () => {
    if (tooltipVisible.value) showTermTooltip()
}
window.addEventListener('scroll', onWindowChange, true)
window.addEventListener('resize', onWindowChange)

onBeforeUnmount(() => {
    stopTimer()
    try {
        if (rootRef.value) {
            rootRef.value.removeEventListener('focusin', startTimer)
            rootRef.value.removeEventListener('click', startTimer)
        }
    } catch (e) { }
    try {
        window.removeEventListener('scroll', onWindowChange, true)
        window.removeEventListener('resize', onWindowChange)
    } catch (e) { }
})

onBeforeUnmount(() => {
    clearTimeout(autosaveTimer)
    if (hideTimeout) {
        clearTimeout(hideTimeout)
    }
    window.removeEventListener('scroll', handleScroll)
})

// Función expuesta para que el padre pueda solicitar el cierre con confirmación
const handleCloseAttempt = async () => {
    if (props.modo === 'editar') {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Seguro que quieres dejar de editar la orden seleccionada?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
            background: 'rgba(15, 23, 42, 0.9)',
            color: 'rgba(241, 245, 249, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        })
        if (result.isConfirmed) {
            emit('close')
            return true
        }
        return false
    }
    emit('close')
    return true
}

// Exponer función para que OrderManagement pueda usarla
defineExpose({
    handleCloseAttempt
})


</script>

<style scoped>
.opservicio-readonly {
    cursor: not-allowed !important;
}

.opservicio-readonly :deep(*) {
    cursor: not-allowed !important;
    user-select: none;
}

.diff-yellow {
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35) !important;
    background: rgba(245, 158, 11, 0.08) !important;
    border-radius: 12px;
}

.diff-red {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35) !important;
    background: rgba(239, 68, 68, 0.08) !important;
    border-radius: 12px;
}

.diff-green {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35) !important;
    background: rgba(34, 197, 94, 0.08) !important;
    border-radius: 12px;
}

/* Styling for old items (non-editable) in edit mode */
.item-row-readonly {
    opacity: 0.75;
    background: rgba(107, 114, 128, 0.05) !important;
    cursor: not-allowed !important;
    position: relative;
}

.item-row-readonly::after {
    content: 'Solo lectura - Esta es una entrada anterior';
    position: absolute;
    top: 8px;
    right: 12px;
    background: rgba(107, 114, 128, 0.9);
    color: white;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
}

/* Overlay para que el resaltado se vea incluso si los hijos pintan su propio fondo */
.opservicio-readonly :deep(.field.diff-yellow),
.opservicio-readonly :deep(.field.diff-red),
.opservicio-readonly :deep(.field.diff-green),
.opservicio-readonly :deep(.item-row.diff-yellow),
.opservicio-readonly :deep(.item-row.diff-red),
.opservicio-readonly :deep(.item-row.diff-green) {
    position: relative;
}

.opservicio-readonly :deep(.field.diff-yellow::before),
.opservicio-readonly :deep(.field.diff-red::before),
.opservicio-readonly :deep(.field.diff-green::before),
.opservicio-readonly :deep(.item-row.diff-yellow::before),
.opservicio-readonly :deep(.item-row.diff-red::before),
.opservicio-readonly :deep(.item-row.diff-green::before) {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 14px;
    pointer-events: none;
    z-index: 0;
}

.opentrada-readonly :deep(.field.diff-yellow::before),
.opentrada-readonly :deep(.item-row.diff-yellow::before) {
    background: rgba(245, 158, 11, 0.08);
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35);
}

.opentrada-readonly :deep(.field.diff-red::before),
.opentrada-readonly :deep(.item-row.diff-red::before) {
    background: rgba(239, 68, 68, 0.08);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35);
}

.opentrada-readonly :deep(.field.diff-green::before),
.opentrada-readonly :deep(.item-row.diff-green::before) {
    background: rgba(34, 197, 94, 0.08);
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
}

.opentrada-readonly :deep(.field.diff-yellow > *),
.opentrada-readonly :deep(.field.diff-red > *),
.opentrada-readonly :deep(.field.diff-green > *),
.opentrada-readonly :deep(.item-row.diff-yellow > *),
.opentrada-readonly :deep(.item-row.diff-red > *),
.opentrada-readonly :deep(.item-row.diff-green > *) {
    position: relative;
    z-index: 1;
}

.opentrada-readonly :deep(input),
.opentrada-readonly :deep(textarea),
.opentrada-readonly :deep(button),
.opentrada-readonly :deep(select) {
    /* Evitar interacción accidental en vista de diff */
    pointer-events: none !important;
}

/* Title row with back button */
.servicio-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.btn-back-to-orders {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1));
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: rgba(59, 130, 246, 0.9);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.btn-back-to-orders:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.15));
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.btn-back-to-orders svg {
    display: block;
    stroke: currentColor;
}

/* Help icon button - styled popover trigger */
.help-icon-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.06));
    border: 1px solid rgba(6, 182, 212, 0.18);
    border-radius: 10px;
    color: rgba(6, 182, 212, 0.95);
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 6px 18px rgba(6, 182, 212, 0.06);
    padding: 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    z-index: 10;
}

.help-icon-btn:hover,
.help-icon-btn:focus {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(6, 182, 212, 0.12);
    outline: none;
}

.help-icon-btn svg {
    display: block;
    stroke: rgba(6, 182, 212, 0.95);
}

/* End time input - read-only */
.term-input {
    cursor: not-allowed !important;
    opacity: 0.9;
}

.item-unidades-card {
    background: transparent;
    padding: 0;
    border: none;
}

/* Unit exit animation for fade + slide when deleted */
.item-unidades-card.unit-exit {
    transition: transform 0.32s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.32s ease;
    opacity: 0;
    transform: translateX(18px) rotate(-2deg) scale(0.995);
    pointer-events: none;
}

.item-unidades-card.unit-exit::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.14), transparent 40%);
    z-index: 6;
    pointer-events: none;
    animation: rippleOut 0.44s cubic-bezier(0.2, 0.9, 0.2, 1);
}

@keyframes rippleOut {
    from {
        opacity: 0.8;
        transform: scale(0.6);
    }

    to {
        opacity: 0;
        transform: scale(1.6);
    }
}

.item-unidades-head {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
}

.item-unidades-head .badge {
    align-self: flex-start;
    background: linear-gradient(135deg, #0ea5e9, #22c55e);
    color: #0f172a;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
}

.item-unidades-head .hint {
    font-size: 0.82rem;
    color: rgba(15, 23, 42, 0.85);
}

.item-unidad-row {
    background: rgba(15, 23, 42, 0.78);
    border-radius: 14px;
    padding: 14px 16px 16px 16px;
    margin-bottom: 12px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(148, 163, 184, 0.5);
}

.item-unidad-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.item-unidad-head .badge {
    background: #22c55e;
    color: #022c22;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
}

.item-unidad-head .tipo-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.98);
}

.item-unidad-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px 14px;
}

.item-unidad-grid .field label {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.95);
}

.item-unidad-grid .control {
    background: rgba(15, 23, 42, 0.95);
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    color: #e5e7eb;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.item-unidad-grid .control::placeholder {
    color: rgba(148, 163, 184, 0.9);
}

.item-unidad-grid .control:focus {
    border-color: rgba(56, 189, 248, 0.9);
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.7), 0 0 0 6px rgba(56, 189, 248, 0.15);
}

.detalle-card {
    position: relative;
    background: rgba(255, 255, 255, 0.18);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    overflow: hidden;
    box-shadow: 0 25px 45px rgba(16, 24, 40, 0.18);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.detalle-card.diff-green {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 25px 45px rgba(34, 197, 94, 0.15);
}

.detalle-card.diff-yellow {
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 25px 45px rgba(245, 158, 11, 0.15);
}

.detalle-card.diff-red {
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 25px 45px rgba(239, 68, 68, 0.15);
}

.detalle-card__glow {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(125deg, rgba(14, 165, 233, 0.12), rgba(255, 255, 255, 0.4));
    filter: blur(28px);
    opacity: 0.95;
    pointer-events: none;
}

.detalle-card__inner {
    position: relative;
    z-index: 1;
    backdrop-filter: blur(16px) saturate(140%);
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.9);
    padding: 9px 12px;
    transition: background 0.2s ease, box-shadow 0.2s ease;
}

.detalle-card__inner.diff-green {
    background: rgba(34, 197, 94, 0.15) !important;
    box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.4) !important;
}

.detalle-card__inner.diff-yellow {
    background: rgba(245, 158, 11, 0.15) !important;
    box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.4) !important;
}

.detalle-card__inner.diff-red {
    background: rgba(239, 68, 68, 0.15) !important;
    box-shadow: inset 0 0 0 2px rgba(239, 68, 68, 0.4) !important;
}

.detalle-card__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}

.detalle-card__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.15);
    color: rgba(15, 23, 42, 0.9);
    font-weight: 700;
    border: 1px solid rgba(59, 130, 246, 0.4);
}

.detalle-card__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: #0f172a;
}

.detalle-card__subtitle {
    margin: 0;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: rgba(15, 23, 42, 0.5);
}

.detalle-card__icon {
    margin-left: auto;
    font-size: 1.1rem;
}

/* small positioning for TrashButton inside each detalle header */
.detalle-card__edit {
    margin-left: 8px;
    margin-right: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgb(59, 130, 246);
}

.detalle-card__edit:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
    transform: scale(1.08);
}

.detalle-card__edit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    filter: grayscale(0.35);
}

.detalle-card__edit:disabled:hover {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    transform: none;
}

.detalle-card__edit:active {
    transform: scale(0.95);
}

.detalle-card__trash {
    margin-left: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.detalle-card__trash :deep(button:disabled) {
    opacity: 0.45;
    cursor: not-allowed;
}

.detalle-card__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 12px;
}

.detalle-card__label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(15, 23, 42, 0.65);
    /* slightly darker for better visibility */
    font-weight: 700;
    /* increase boldness slightly */
}

.detalle-card__value {
    font-size: 0.95rem;
    color: rgba(15, 23, 42, 0.82);
    font-weight: 600;
}

.detalle-card__pair {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 3px 0;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    position: relative;
    padding-left: 38px;
    --pair-hue: 210;
}

.detalle-card__pair:last-child {
    border-bottom: none;
}

.detalle-card__chip {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, hsl(var(--pair-hue), 78%, 82%), hsl(var(--pair-hue), 72%, 55%));
    box-shadow: 0 10px 18px rgba(15, 23, 42, 0.22);
    color: #0f172a;
}

.detalle-card__chip-icon {
    width: 18px;
    height: 18px;
    stroke: rgba(15, 23, 42, 0.85);
}

.detalle-card__pair-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.detalle-card__pair::before {
    content: attr(data-icon);
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: linear-gradient(135deg, hsl(var(--pair-hue), 80%, 75%), hsl(var(--pair-hue), 70%, 55%));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.detalle-card__pair::before {
    content: attr(data-icon);
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
}

.detalle-card--compact {
    max-width: 520px;
    margin: 0 auto;
    padding-top: 4px;
}

:deep(.form-wrap) {
    align-items: flex-start;
    justify-content: center;
    min-height: auto;
}

:deep(.form-col) {
    max-width: 1080px;
    width: 100%;
}

:deep(.auth-card.glass) {
    width: 100%;
    padding: 34px 38px;
    border-radius: 26px;
    background: rgba(19, 31, 52, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(20px) saturate(170%);
    box-shadow: 0 32px 70px rgba(6, 12, 24, 0.45);
}

:deep(.auth-card-header) {
    padding: 0 0 18px 0;
}

:deep(.auth-card-body) {
    padding: 0;
}

.op-card {
    background: transparent;
    padding: 0;
    color: #e6ebf5;
    position: relative;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 26px;
    align-items: start;
}

.combined-card,
.items-card,
.form-footer {
    grid-column: 1 / -1;
}

.section-card,
.form-footer {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(18px) saturate(160%);
    box-shadow: 0 24px 52px rgba(5, 10, 18, 0.28);
    color: rgba(15, 23, 42, 0.88);
}

.section-card::after {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 42%, rgba(255, 255, 255, 0) 70%);
    opacity: 0.55;
}

.section-card>*,
.form-footer>* {
    position: relative;
    z-index: 1;
}

/* Fix for nested cards accumulating opacity/whiteness */
.section-card .section-card {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    margin-top: 16px !important;
}

.section-card .section-card::after {
    display: none !important;
}

.section-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.section-head h4 {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: rgba(15, 23, 42, 0.95);
}

.section-head .hint {
    margin: 0;
    font-size: 0.82rem;
    color: rgba(15, 23, 42, 0.68);
    font-weight: 600;
}

.section-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px 16px;
}

.section-grid.combined {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 14px 16px;
}

.section-grid.main-form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px 16px;
    align-items: start;
}

.descripcion-field {
    grid-column: 1;
    grid-row: 1;
}

.fecha-field {
    grid-column: 2;
    grid-row: 1;
}

.section-grid.solicitante-form {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 14px 16px;
    align-items: start;
}

.quantity-field-centered {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.quantity-field-centered .counter {
    justify-content: center;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 1.3rem;
    padding: 3px;
    gap: 0;
    width: fit-content;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
}

.quantity-field-centered .counter:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.6);
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.3);
}

.quantity-field-centered .ctr-btn {
    height: 2rem !important;
    padding: 0.3rem 0.5rem !important;
    font-size: 0.85rem !important;
    width: 32px !important;
    min-width: 32px !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    font-weight: 700 !important;
    color: rgba(15, 23, 42, 0.8) !important;
    transition: all 0.15s ease !important;
    cursor: pointer;
}

.quantity-field-centered .ctr-btn.wide {
    width: 32px !important;
    min-width: 32px !important;
    font-size: 0.8rem !important;
}

.quantity-field-centered .ctr-btn:hover {
    background: rgba(255, 255, 255, 0.4) !important;
    color: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: none !important;
    border-radius: 0.4rem !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

/* Primer botón (extremo izquierdo) */
.quantity-field-centered .ctr-btn:first-child:hover {
    border-radius: 1rem 0.4rem 0.4rem 1rem !important;
    margin-left: -3px !important;
    padding-left: 6px !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

/* Último botón (extremo derecho) */
.quantity-field-centered .ctr-btn:last-child:hover {
    border-radius: 0.4rem 1rem 1rem 0.4rem !important;
    margin-right: -3px !important;
    padding-right: 6px !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.quantity-field-centered .ctr-btn:active {
    transform: scale(0.96) !important;
    background: rgba(255, 255, 255, 0.5) !important;
    border-radius: 0.4rem !important;
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
}

/* Primer botón (extremo izquierdo) - active */
.quantity-field-centered .ctr-btn:first-child:active {
    border-radius: 1rem 0.2rem 0.2rem 1rem !important;
    margin-left: -6px !important;
    width: 38px !important;
}

/* Último botón (extremo derecho) - active */
.quantity-field-centered .ctr-btn:last-child:active {
    border-radius: 0.2rem 1rem 1rem 0.2rem !important;
    margin-right: -6px !important;
    width: 38px !important;
}

.quantity-field-centered .ctr-btn+.ctr-btn {
    border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.quantity-field-centered .ctr-input+.ctr-btn {
    border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.quantity-field-centered .ctr-input {
    height: 2rem !important;
    padding: 0.3rem 0.4rem !important;
    width: 50px !important;
    min-width: 50px !important;
    max-width: 50px !important;
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
    color: rgba(15, 23, 42, 0.9) !important;
    transition: all 0.15s ease !important;
}

.quantity-field-centered .ctr-input:focus {
    background: rgba(255, 255, 255, 0.2) !important;
    color: rgba(15, 23, 42, 1) !important;
    outline: none !important;
    border-radius: 0.2rem !important;
}

.quantity-field-centered .ctr-input:hover {
    background: rgba(255, 255, 255, 0.25) !important;
    border-radius: 0.4rem !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.section-grid.combined .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    width: 100%;
}

.section-grid.combined .field label {
    width: 100%;
    text-align: left;
}

.section-grid.combined .field .control {
    width: 100% !important;
    max-width: 100%;
}

.section-grid.combined .quantity-field {
    align-items: center;
}

.section-grid.combined .quantity-field label {
    text-align: center;
}

.section-grid.combined .quantity-field .control {
    width: auto !important;
}

.section-grid.combined .quantity-field .counter {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    gap: 0;
    padding: 4px;
    border-radius: 1.1rem;
    border: 1px solid rgba(15, 23, 42, 0.16);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
}



.section-grid.combined .quantity-field .ctr-btn {
    width: 40px;
    height: 2rem;
    border-radius: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    font-weight: 800;
    font-size: 0.92rem;
    color: rgba(15, 23, 42, 0.9);
    transition: background 0.15s ease, color 0.15s ease;
}

.section-grid.combined .quantity-field .counter>* {
    border-radius: 0;
    border: none;
    background: transparent;
    box-shadow: none;
}

.section-grid.combined .quantity-field .counter>*+* {
    border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.section-grid.combined .quantity-field .ctr-btn.wide {
    width: 45px;
    min-width: 45px;
}

.section-grid.combined .quantity-field .ctr-btn:hover {
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(12px);
    border-color: rgba(255, 255, 255, 0.4);
}

.section-grid.combined .quantity-field .ctr-btn:active {
    background: rgba(255, 255, 255, 0.22);
}

.section-grid.combined .quantity-field .ctr-input {
    height: 2.2rem;
    padding: 0.4rem 0.5rem;
    border-radius: 1.1rem;
    font-size: 0.9rem;
    width: 70px !important;
    min-width: 70px;
    max-width: 70px;
    box-sizing: border-box;
    text-align: center;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-weight: 800;
    color: rgba(15, 23, 42, 0.9);
}

/* Ajustar el ctr-input del quantity-field-centered a tamaño normal */
.quantity-field-centered .ctr-input {
    height: 2.2rem !important;
    padding: 0.4rem 0.6rem !important;
    width: 70px !important;
    min-width: 70px !important;
    max-width: 70px !important;
    font-size: 0.9rem !important;
}

.section-grid.combined .quantity-field .ctr-input:focus {
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(12px);
    border-color: rgba(46, 221, 90, 0.5);
    outline: none;
}

.section-grid.combined .field:nth-child(-n+4) {
    grid-column: span 6;
}

.section-grid.combined .divider {
    grid-column: span 12;
    height: 1px;
    background: rgba(255, 255, 255, 0.22);
    margin: 4px 0 10px 0;
}

.section-grid.combined .field:nth-last-child(-n+3) {
    grid-column: span 4;
}

.section-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.empty-hint {
    margin: 0;
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px dashed rgba(46, 221, 90, 0.38);
    background: rgba(255, 255, 255, 0.22);
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.68);
    text-align: center;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(15, 23, 42, 0.62);
}

.control {
    height: 2.7rem;
    padding: 0.55rem 0.9rem;
    border-radius: 25px !important;
    -webkit-border-radius: 25px !important;
    -moz-border-radius: 25px !important;
    font-size: 0.95rem;
    width: 100%;
    min-width: 220px;
    /* desktop default; overridden on small screens */
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(15, 23, 42, 0.92);
    font-weight: 600;
    transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
    overflow: hidden;
}

@media (max-width: 900px) {
    .control {
        min-width: 0 !important;
    }

    .control.w-38ch,

    /* Franja de estado rápida arriba del formulario */
    .form-status-strip {
        display: flex;
        gap: 10px;
        align-items: center;
        margin: 12px 0 18px;
        flex-wrap: wrap;
    }

    .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.06);
        border: 1px solid rgba(15, 23, 42, 0.08);
        color: rgba(15, 23, 42, 0.8);
        font-weight: 700;
        font-size: 0.9rem;
        letter-spacing: 0.1px;
    }

    .status-chip--primary {
        background: linear-gradient(120deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.12));
        border-color: rgba(59, 130, 246, 0.25);
        color: rgba(30, 64, 175, 0.95);
    }

    .status-chip--ok {
        background: linear-gradient(120deg, rgba(34, 197, 94, 0.12), rgba(52, 211, 153, 0.12));
        border-color: rgba(52, 211, 153, 0.25);
        color: rgba(22, 101, 52, 0.9);
    }

    .status-chip--warn {
        background: linear-gradient(120deg, rgba(234, 179, 8, 0.15), rgba(251, 191, 36, 0.15));
        border-color: rgba(234, 179, 8, 0.3);
        color: rgba(133, 77, 14, 0.95);
    }

    .chip-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.6;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.35);
    }

    @media (max-width: 520px) {
        .form-status-strip {
            margin-top: 8px;
            gap: 8px;
        }

        .status-chip {
            width: 100%;
            justify-content: center;
        }
    }

    .control.w-20ch,
    .control.w-12ch {
        width: 100% !important;
        min-width: 0 !important;
    }
}

/* Very small screens (<= 420px) - ensure inputs and counters are readable and don't collapse */
@media (max-width: 420px) {
    .control {
        min-width: 0 !important;
        width: 100% !important;
        font-size: 0.95rem !important;
        height: 44px !important;
        padding: 8px 12px !important;
    }

    .item-grid {
        grid-template-columns: 1fr !important;
    }

    .unidades-grid {
        grid-template-columns: 1fr !important;
    }

    .quantity-field-centered .ctr-input,
    .section-grid.combined .quantity-field .ctr-input {
        width: 60px !important;
        min-width: 56px !important;
    }

    .quantity-field-centered .ctr-btn,
    .ctr-btn {
        flex-shrink: 0 !important;
        min-width: 38px !important;
        width: 38px !important;
        height: 38px !important;
        font-size: 0.9rem !important;
    }

    /* Contador con escala adaptativa para pantallas muy pequeñas */
    .counter {
        display: flex !important;
        gap: 0 !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 1.5rem !important;
        padding: 4px !important;
        background: rgba(255, 255, 255, 0.25) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        width: fit-content !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        overflow: visible !important;
        max-width: 100% !important;
        transform: scale(0.88);
        transform-origin: center;
    }

    .section-grid.combined .field {
        width: 100% !important;
    }

    /* reduce heavy paddings on cards to fit small screens */
    .section-card,
    .items-card {
        padding: 14px !important;
    }

    .detalle-card--compact {
        max-width: 100% !important;
        padding-top: 0 !important;
    }

    /* override inline width set on add-item-form field to prevent overflow */
    .add-item-form .field {
        width: 100% !important;
        transform: none !important;
    }

    .detalle-card__qty-input {
        width: 56px !important;
        min-width: 48px !important;
    }
}

@media (max-width: 1040px) {
    .item-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }

    /* En tablets, los campos pueden apilarse si no caben */
    .add-item-controls {
        justify-content: center;
    }

    .field.field--tipo {
        flex: 0 1 280px;
    }

    .field.field--cantidad {
        flex: 0 1 160px;
    }
}

@media (max-width: 900px) {

    /* Si no caben lado a lado, se apilan en columna */
    .add-item-controls {
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 0 16px;
        justify-content: center;
    }

    .add-item-controls .field {
        width: 100%;
        text-align: center;
    }

    .field.field--tipo {
        width: 100%;
        max-width: 320px;
        flex-basis: auto;
        z-index: 1005;
        margin: 0 auto;
        text-align: center;
        transform: none !important;
    }

    .field.field--tipo label {
        text-align: center;
        width: 100%;
    }

    .field.field--cantidad {
        width: 100%;
        max-width: 220px;
        flex-basis: auto;
        margin: 0 auto;
        text-align: center;
    }

    .field.field--cantidad label {
        text-align: center;
        width: 100%;
    }
}

/* Media query para dispositivos pequeños (380px y mayores) */
@media (max-width: 480px) {

    /* Escalar todo el formulario al 80% para que quepa mejor */
    .form-grid {
        zoom: 0.85;
        transform-origin: top left;
    }

    .add-item-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 0 12px;
        justify-content: center;
    }

    .add-item-controls .field {
        width: 100%;
        text-align: center;
    }

    .field.field--tipo {
        width: 100%;
        max-width: 100%;
        flex-basis: auto;
        z-index: 1005;
        margin: 0;
        text-align: center;
        transform: none !important;
    }

    .field.field--tipo label {
        text-align: center;
        width: 100%;
        font-size: 0.9rem;
    }

    .field.field--cantidad {
        width: 100%;
        max-width: 100%;
        flex-basis: auto;
        margin: 0;
        text-align: center;
    }

    .field.field--cantidad label {
        text-align: center;
        width: 100%;
        font-size: 0.85rem;
    }

    .counter {
        width: 100%;
        gap: 0.3rem;
    }

    .ctr-btn {
        height: 2rem;
        width: 32px;
        min-width: 32px;
        font-size: 0.85rem;
        padding: 0.3rem 0.5rem;
    }

    .ctr-btn.wide {
        width: 40px;
        min-width: 40px;
    }

    .ctr-input {
        font-size: 0.9rem;
        height: 2.2rem;
    }
}

.control::placeholder {
    color: #6b7280;
    opacity: 1;
    font-weight: 500;
}

/* Tooltip helper for Hora de término */
.term-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
}





/* Portal tooltip (rendered in body) */
.term-tooltip-portal {
    position: fixed;
    background: rgba(2, 8, 18, 0.98);
    color: #fff;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 0.9rem;
    white-space: nowrap;
    box-shadow: 0 18px 40px rgba(2, 8, 18, 0.6);
    border: 1px solid rgba(6, 182, 212, 0.08);
    transform: translateY(0);
    transition: opacity 0.12s ease, transform 0.12s ease;
    opacity: 1;
    z-index: 2147483647;
}

.term-tooltip-portal::after {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: inherit;
}

.control:focus {
    outline: none;
    border-color: rgba(46, 221, 90, 0.65);
    box-shadow: 0 0 0 3px rgba(46, 221, 90, 0.15);
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(12px);
    border-radius: 25px !important;
    -webkit-border-radius: 25px !important;
    -moz-border-radius: 25px !important;
}



/* Asegurar inputs text redondeados */
input[type="text"].control,
input.control,
.control input,
input[type="text"],
.section-card input[type="text"],
.form-grid input[type="text"] {
    border-radius: 25px !important;
    -webkit-border-radius: 25px !important;
    -moz-border-radius: 25px !important;
    overflow: hidden !important;
}

.counter {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.ctr-btn {
    height: 2.2rem;
    padding: 0.4rem 0.6rem;
    border-radius: 1.1rem;
    font-size: 0.9rem;
    width: 40px;
    min-width: 40px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(15, 23, 42, 0.9);
    font-weight: 800;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.ctr-btn.wide {
    width: 50px;
    min-width: 50px;
}

.ctr-btn:hover {
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(12px);
    border-color: rgba(255, 255, 255, 0.4);
}

.ctr-btn:active {
    transform: translateY(1px);
}

.ctr-input {
    height: 2.2rem;
    padding: 0.4rem 0.6rem;
    border-radius: 1.1rem;
    font-size: 0.9rem;
    width: 70px;
    min-width: 70px;
    box-sizing: border-box;
    text-align: center;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-weight: 700;
    color: rgba(15, 23, 42, 0.92);
    transition: border-color 0.16s ease, background 0.16s ease;
}

.ctr-input:focus {
    outline: none;
    border-color: rgba(46, 221, 90, 0.6);
    background: rgba(255, 255, 255, 0.32);
    backdrop-filter: blur(12px);
}

.item-row {
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 20px;
    padding: 16px 18px;
    box-shadow: 0 18px 40px rgba(6, 10, 18, 0.22);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* item-row exit animation (fade + slide + subtle shrink) */
.item-row-exit {
    transition: transform 0.36s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.36s ease, height 0.36s ease, margin 0.36s ease;
    opacity: 0;
    transform: translateX(26px) translateY(6px) rotate(-1.2deg) scale(0.996);
    margin: 6px 0;
    pointer-events: none;
    height: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    overflow: hidden;
}

.item-row-exit::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 22px;
    background: radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.09), transparent 45%);
    z-index: 4;
    animation: rippleOut 0.44s ease-out;
}

.item-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 0.96rem;
    color: rgba(15, 23, 42, 0.9);
}

.item-actions {
    margin-left: auto;
}

/* TrashButton CSS moved into reusable component */

.badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2edd5a, #299deb);
    color: #fff;
    font-weight: 700;
    font-size: 0.78rem;
}

.item-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 120px 70px;
    gap: 12px;
    align-items: center;
}

/* Grid específico para unidades de equipo médico/mobiliario */
.unidades-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
    column-gap: 16px;
    row-gap: 14px;
}

.unidades-grid .field-wide {
    grid-column: 1 / -1;
}

.unidades-grid .field-medium {
    min-width: 0;
}

.unidades-grid .field-compact .control {
    max-width: 100%;
}

/* Asegurar que campos compactos dentro de unidades ocupen toda la columna
   para que 'Clave HRAEI' tenga el mismo largo visual que el resto */
.unidades-grid .field-compact .control,
.unidades-grid .field-medium .control,
.unidades-grid .field .control {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    display: block !important;
}

/* Centered quantity input for unidad forms */
.unit-qty-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
}

.unit-qty-field label {
    width: 100%;
    text-align: left;
}

.unit-qty-input {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 100px !important;
    text-align: center !important;
    padding: 8px 8px !important;
}

/* Ensure unit qty input is centered inside fields (overrides .control width rules) */
.unit-qty-field .control,
.unit-qty-field .unit-qty-input {
    width: 82px !important;
    margin: 6px auto 0 auto !important;
    display: inline-block !important;
}

/* Center quantity inside detalle-card pair for better visual alignment */
.detalle-card__pair--qty .detalle-card__pair-body {
    align-items: center;
    justify-content: center;
}

.detalle-card__qty-input {
    width: 84px !important;
    text-align: center !important;
    padding: 6px 8px !important;
}

/* Read-only appearance for disabled qty inputs inside saved items */
.detalle-card__qty-input[disabled] {
    opacity: 1 !important;
    color: rgba(15, 23, 42, 0.8) !important;
    background: transparent !important;
    border-color: rgba(15, 23, 42, 0.05) !important;
    box-shadow: none !important;
}

/* Also center the cantidad input in the detalle cards explicitly */
.detalle-card__pair--qty .detalle-card__qty-input {
    margin: 6px auto 0 auto !important;
    display: inline-block !important;
}

/* Add item form style moved from inline to CSS */
.add-item-form {
    background: linear-gradient(135deg, rgba(147, 197, 253, 0.12), rgba(167, 243, 208, 0.12));
    padding: 20px 20px;
    border-radius: 14px;
    margin-bottom: 20px;
    border: 1.5px solid rgba(59, 130, 246, 0.18);
    overflow: visible;
}

.add-item-form__inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.add-item-controls {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    gap: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    flex-wrap: wrap;
}

.add-item-controls .field {
    position: relative;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    flex: 0 1 auto;
}

.field.field--tipo {
    width: 100%;
    max-width: 280px;
    flex: 0 1 280px;
    margin: 0;
    text-align: left;
}

.field.field--cantidad {
    width: 100%;
    max-width: 220px;
    flex: 0 1 220px;
    margin: 0;
    text-align: left;
}

.field.field--tipo.is-shifted {
    transform: none !important;
}

.form-label {
    font-weight: 600;
    color: rgb(51, 65, 85);
    display: block;
    text-align: left;
    width: 100%;
    margin-bottom: 6px;
    font-size: 0.86rem;
}

.form-label--center {
    text-align: left;
    width: 100%;
}

.form-label--small {
    font-size: 0.86rem;
    font-weight: 600;
    color: rgb(51, 65, 85);
}

/* Nueva clase para labels consistentes en unidades-grid */
.field-label {
    font-size: 0.86rem;
    font-weight: 600;
    color: rgb(51, 65, 85);
    display: block;
    margin-bottom: 6px;
    text-transform: none;
    letter-spacing: 0px;
}

/* Mejorar visibilidad de placeholders en inputs */
.field .control::placeholder,
.field .control:placeholder-shown {
    color: rgba(107, 114, 128, 0.6);
    opacity: 0.8;
}

.field .control {
    color: rgb(15, 23, 42);
}

.field .control:focus::placeholder {
    color: rgba(107, 114, 128, 0.4);
}

/* (El reescalado ahora se maneja por JS para evitar doble escala) */

/* Estilos para CustomSelect dropdown - asegurar que aparezca por encima SIN TRANSPARENCIA */
.field.field--tipo :deep(.custom-select),
.field.field--tipo :deep(.select-dropdown) {
    z-index: 9999 !important;
    position: relative;
}

.field.field--tipo :deep(.select-menu),
.field.field--tipo :deep(.dropdown),
.field.field--tipo :deep([role="listbox"]),
.field.field--tipo :deep(.vs__dropdown-menu) {
    z-index: 9999 !important;
    position: absolute;
    background: rgba(255, 255, 255, 1) !important;
    background-color: rgba(255, 255, 255, 1) !important;
    backdrop-filter: none !important;
    opacity: 1 !important;
}

/* Bajar z-index del contador cuando el dropdown está visible */
.field.field--cantidad {
    z-index: 1 !important;
}

/* Forzar el tamaño del ctr-input dentro del add-item-form (evitar regla global input[v-model*="cantidad"]) */
.add-item-form .counter .ctr-input {
    width: 70px !important;
    min-width: 70px !important;
    max-width: 70px !important;
}

/* Copiar apariencia y animación del contador del componente de insumos */
/* Copiado desde .quantity-field-centered para que el contador y botones sean idénticos */
.add-item-form .counter {
    justify-content: center;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 1.3rem;
    padding: 3px;
    gap: 0;
    width: fit-content;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
}

.add-item-form .counter:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.6);
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.3);
}

.add-item-form .ctr-btn {
    height: 2rem !important;
    padding: 0.3rem 0.5rem !important;
    font-size: 0.85rem !important;
    width: 32px !important;
    min-width: 32px !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    font-weight: 700 !important;
    color: rgba(15, 23, 42, 0.8) !important;
    transition: all 0.15s ease !important;
    cursor: pointer;
}

.add-item-form .ctr-btn.wide {
    width: 32px !important;
    min-width: 32px !important;
    font-size: 0.8rem !important;
}

.add-item-form .ctr-btn:hover {
    background: rgba(255, 255, 255, 0.4) !important;
    color: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: none !important;
    border-radius: 0.4rem !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.add-item-form .ctr-btn:first-child:hover {
    border-radius: 1rem 0.4rem 0.4rem 1rem !important;
    margin-left: -3px !important;
    padding-left: 6px !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.add-item-form .ctr-btn:last-child:hover {
    border-radius: 0.4rem 1rem 1rem 0.4rem !important;
    margin-right: -3px !important;
    padding-right: 6px !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
}

.add-item-form .ctr-btn:active {
    transform: scale(0.96) !important;
    background: rgba(255, 255, 255, 0.5) !important;
    border-radius: 0.4rem !important;
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
}

.add-item-form .ctr-btn:first-child:active {
    border-radius: 1rem 0.2rem 0.2rem 1rem !important;
    margin-left: -6px !important;
    width: 38px !important;
}

.add-item-form .ctr-btn:last-child:active {
    border-radius: 0.2rem 1rem 1rem 0.2rem !important;
    margin-right: -6px !important;
    width: 38px !important;
}

.add-item-form .ctr-btn+.ctr-btn {
    border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.add-item-form .ctr-input+.ctr-btn {
    border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
}

.add-item-form .ctr-input {
    height: 2rem !important;
    padding: 0.3rem 0.4rem !important;
    width: 50px !important;
    min-width: 50px !important;
    max-width: 50px !important;
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    border-left: 1px solid rgba(15, 23, 42, 0.15) !important;
    color: rgba(15, 23, 42, 0.9) !important;
    transition: all 0.15s ease !important;
}

@media (max-width: 860px) {
    .unidades-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .unidades-grid .field-wide {
        grid-column: 1 / -1;
    }

    .unidades-grid .field-compact .control {
        max-width: 100%;
    }
}

/* Responsive fixes: ensure inputs and card grids don't overflow in small devices */
@media (max-width: 860px) {
    .item-grid {
        grid-template-columns: 1fr 120px 80px;
        gap: 10px;
    }

    .section-card {
        padding: 20px;
    }
}

@media (max-width: 720px) {
    .section-card {
        padding: 16px
    }

    .item-grid {
        grid-template-columns: 1fr;
        gap: 12px
    }

    .item-grid .field {
        width: 100% !important
    }

    .item-grid .field .control {
        width: 100% !important;
        min-width: 0 !important
    }

    /* Prevent overflow, allow wrap for counters and keep inputs flexible */
    .op-card,
    .section-card,
    .item-row {
        overflow-x: hidden;
        box-sizing: border-box
    }

    .item-grid .field {
        min-width: 0
    }

    .field {
        min-width: 0
    }

    .field .control {
        flex: 1 1 auto;
        min-width: 0;
        width: 100% !important
    }

    /* Mantener contador en forma de cápsula sin quebrar - con escala */
    .counter {
        display: flex;
        gap: 0;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        border-radius: 1.3rem !important;
        padding: 3px;
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        width: fit-content;
        margin: 0 auto;
        box-sizing: border-box;
        overflow: visible;
        transform: scale(0.92);
        transform-origin: center;
    }

    .counter>* {
        flex-shrink: 0 !important;
        border-radius: 0 !important;
    }

    .ctr-btn {
        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
        font-size: 0.8rem !important;
        min-width: 32px !important;
    }

    .ctr-btn.wide {
        width: 38px !important;
        min-width: 38px !important;
    }

    .ctr-input {
        width: 60px !important;
        min-width: 56px !important;
        height: 32px !important;
        padding: 0.3rem 0.4rem !important;
        font-size: 0.85rem !important;
    }

    .control.w-38ch,
    .control.w-20ch,
    .control.w-12ch {
        width: 100% !important;
        min-width: 0 !important;
    }

    .form-actions {
        flex-direction: column;
        gap: 12px
    }


}

@media (max-width: 520px) {
    .section-card {
        padding: 14px
    }

    .item-row {
        padding: 12px
    }

    .btn.primary,
    .btn.secondary {
        width: 100%
    }
}

.op-card,
.section-card,
.item-row {
    box-sizing: border-box;
    max-width: 100%;
    overflow-x: hidden
}

.control {
    overflow-wrap: anywhere;
    word-break: break-word
}

.form-footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
}

.footer-meta {
    color: rgba(15, 23, 42, 0.72);
    font-size: 0.86rem;
    font-weight: 600;
}

.draft-hint {
    color: inherit;
    font-size: inherit;
}

.btn.primary {
    border-radius: 50px !important;
    -webkit-border-radius: 50px !important;
    -moz-border-radius: 50px !important;
    padding: 14px 32px;
    background: linear-gradient(145deg, #10d63a, #0bb828, #00701a);
    color: #fff;
    font-weight: 700;
    font-size: 1rem;
    box-shadow:
        0 8px 16px rgba(11, 184, 40, 0.3),
        0 4px 8px rgba(11, 184, 40, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.16s ease;
    min-height: 48px;
    border: none;
    position: relative;
    overflow: hidden;
}

.btn.primary:hover {
    transform: translateY(-2px);
    background: linear-gradient(145deg, #15e844, #10d63a, #0bb828);
    box-shadow:
        0 12px 24px rgba(11, 184, 40, 0.4),
        0 6px 12px rgba(11, 184, 40, 0.3),
        inset 0 1px 3px rgba(255, 255, 255, 0.4),
        inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.btn.primary:active {
    transform: translateY(0);
    background: linear-gradient(145deg, #0bb828, #00701a, #004d12);
    box-shadow:
        0 4px 8px rgba(11, 184, 40, 0.3),
        0 2px 4px rgba(11, 184, 40, 0.2),
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.btn.primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 12px 28px rgba(11, 172, 65, 0.2);
}

.btn.secondary {
    border-radius: 50px !important;
    -webkit-border-radius: 50px !important;
    -moz-border-radius: 50px !important;
    padding: 14px 32px;
    background: linear-gradient(145deg, #ffffff, #f8f9fa, #f1f3f4);
    color: #0bb828;
    font-weight: 700;
    font-size: 1rem;
    border: 2px solid #0bb828;
    box-shadow:
        0 6px 14px rgba(11, 184, 40, 0.2),
        0 3px 7px rgba(0, 0, 0, 0.1),
        inset 0 1px 2px rgba(255, 255, 255, 0.8),
        inset 0 -1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.16s ease;
    min-height: 48px;
    position: relative;
    overflow: hidden;
}

.btn.secondary:hover {
    background: linear-gradient(145deg, #f0fdf4, #e6ffed, #dcfce7);
    transform: translateY(-2px);
    box-shadow:
        0 10px 20px rgba(11, 184, 40, 0.25),
        0 5px 10px rgba(0, 0, 0, 0.1),
        inset 0 1px 3px rgba(255, 255, 255, 0.9),
        inset 0 -1px 3px rgba(0, 0, 0, 0.05);
    border-color: #0bb828;
    color: #059212;
}

.btn.secondary:active {
    transform: translateY(0);
    background: linear-gradient(145deg, #dcfce7, #bbf7d0, #a7f3d0);
    box-shadow:
        0 2px 6px rgba(11, 184, 40, 0.2),
        0 1px 3px rgba(0, 0, 0, 0.1),
        inset 0 2px 4px rgba(0, 0, 0, 0.1),
        inset 0 -1px 2px rgba(255, 255, 255, 0.5);
    border-color: #059212;
    color: #047857;
}

.btn.secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: #f9f9f9;
    color: #9ca3af;
    border-color: #d1d5db;
}



.btn.secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: #f9f9f9;
    color: #9ca3af;
    border-color: #d1d5db;
}

.form-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    margin-top: 32px;
    padding: 24px;
    width: 100%;
}

.save-btn {
    display: inline-flex;
    align-items: center;
    gap: 0;
}

.cancel-btn {
    display: inline-flex;
    align-items: center;
    gap: 0;
}

.btn-icon-plus {
    font-size: 1.1rem;
    margin-right: 6px;
    display: inline-block
}

/* Scroll to top button - Reescrito simple */
.scroll-to-top-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(145deg, #0bb828, #00701a);
    color: white;
    border: none;
    cursor: pointer;
    z-index: 1000;
    box-shadow:
        0 8px 16px rgba(11, 184, 40, 0.3),
        0 4px 8px rgba(11, 184, 40, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 18px;
    transition: all 0.3s ease;
    animation: gentleFloat 3s ease-in-out infinite;
    overflow: hidden;
}

.scroll-to-top-btn:hover {
    width: 180px;
    border-radius: 28px;
    transform: scale(1.05);
    animation-play-state: paused;
}

.scroll-to-top-btn:hover .scroll-text {
    opacity: 1;
    transform: translateX(0);
}

.scroll-to-top-btn.animating-out {
    width: 56px !important;
    border-radius: 50% !important;
    pointer-events: none;
}

.scroll-to-top-btn.animating-out .scroll-text {
    opacity: 0 !important;
}

.scroll-icon {
    color: white;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scroll-text {
    color: white;
    font-size: 14px;
    font-weight: 600;
    margin-left: 8px;
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scroll-to-top-btn:hover {
    width: 180px;
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(145deg, #0bb828, #00701a);
    box-shadow:
        0 12px 24px rgba(11, 184, 40, 0.4),
        0 6px 12px rgba(11, 184, 40, 0.3),
        inset 0 1px 3px rgba(255, 255, 255, 0.4);
    animation-play-state: paused;
}

.scroll-to-top-btn:hover .scroll-text {
    opacity: 1;
    max-width: 150px;
}

.scroll-to-top-btn:active {
    transform: translateY(-2px) scale(0.98);
    background: linear-gradient(145deg, #0bb828, #006617);
    box-shadow:
        0 8px 16px rgba(11, 184, 40, 0.35),
        0 4px 8px rgba(11, 184, 40, 0.25),
        inset 0 3px 6px rgba(0, 0, 0, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.2);
    transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
    animation-play-state: paused;
}

/* Observaciones & Ingeniero - estilos centrados y simétricos */
.observaciones-support .section-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.observaciones-support .section-head h4 {
    margin-bottom: 0;
}

.observaciones-support .section-head .hint {
    text-align: center;
}

.observaciones-support .section-grid.combined {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 18px 20px;
    align-items: center;
}

.observaciones-support .field.ing-res {
    grid-column: 4 / 10;
    /* centered 6 cols on 12col grid */
    justify-self: center;
    width: 100%;
    max-width: 640px;
}

.observaciones-support .field textarea.control {
    min-height: 140px !important;
    padding: 14px 18px !important;
    border-radius: 28px !important;
}

.observaciones-support .field label {
    letter-spacing: 0.06em;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.68);
}

@media (max-width: 900px) {
    .observaciones-support .field.ing-res {
        grid-column: 1 / -1;
        justify-self: stretch;
        max-width: none;
    }

    .observaciones-support .field {
        grid-column: 1 / -1;
    }
}

/* Transiciones Vue - Solo una animación por vez */
.scroll-btn-enter-active {
    animation: fluidElegantRise 0.4s ease-out;
}

.scroll-btn-leave-active {
    animation: slideDownExit 0.4s ease-out forwards;
    width: 56px !important;
    border-radius: 50% !important;
}

.scroll-btn-leave-active .scroll-text {
    opacity: 0 !important;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
    opacity: 0;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
    opacity: 0;
}



@keyframes fluidElegantRise {
    0% {
        opacity: 0;
        transform: translateY(30px) scale(0.6);
        border-radius: 60% 40% 55% 45% / 40% 60% 45% 55%;
        filter: blur(4px);
    }

    30% {
        opacity: 0.4;
        transform: translateY(18px) scale(0.8);
        border-radius: 55% 45% 52% 48% / 45% 55% 48% 52%;
        filter: blur(2.5px);
    }

    60% {
        opacity: 0.8;
        transform: translateY(5px) scale(1.02);
        border-radius: 52% 48% 51% 49% / 48% 52% 49% 51%;
        filter: blur(1px);
    }

    80% {
        opacity: 0.95;
        transform: translateY(-2px) scale(0.98);
        border-radius: 51% 49% 50.2% 49.8% / 49% 51% 49.8% 50.2%;
        filter: blur(0.5px);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        border-radius: 50% 50% 50% 50%;
        filter: blur(0px);
    }
}

@keyframes slideDownExit {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    25% {
        opacity: 0.8;
        transform: translateY(10px) scale(0.9);
    }

    50% {
        opacity: 0.6;
        transform: translateY(20px) scale(0.8);
    }

    75% {
        opacity: 0.3;
        transform: translateY(30px) scale(0.7);
    }

    100% {
        opacity: 0;
        transform: translateY(50px) scale(0.5);
    }
}

/* Animación de flotación suave para el botón */
@keyframes gentleFloat {
    0% {
        transform: translateY(0px);
    }

    33% {
        transform: translateY(-4px);
    }

    66% {
        transform: translateY(2px);
    }

    100% {
        transform: translateY(0px);
    }
}

@media (max-width: 1040px) {
    :deep(.auth-card.glass) {
        padding: 30px;
    }
}

@media (max-width: 860px) {
    .form-grid {
        gap: 22px;
    }

    .section-grid.combined .field:nth-child(-n+4) {
        grid-column: span 12;
    }

    .section-grid.combined .field:nth-last-child(-n+3) {
        grid-column: span 12;
    }

    .save-btn {
        justify-content: center;
        width: 100%;
    }
}

/* AJUSTAR TAMAÑOS DE INPUTS DE CANTIDAD */
.control.w-12ch,
input[type="number"].control,
.field:has(label:contains("Cantidad")) .control,
input[v-model*="cantidad"],
input[placeholder="0"] {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
    text-align: center;
}

.control.w-20ch {
    width: 140px !important;
    min-width: 140px !important;
    max-width: 140px !important;
}

.fecha-field .control {
     width: 180px !important;
     min-width: 180px !important;
     max-width: 180px !important;
 }

/* Transiciones para el componente de firmas */
.fade-in-enter-active,
.fade-in-leave-active {
   transition: all 0.3s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
   opacity: 0;
   transform: translateY(-6px);
}

.fade-in-enter-to,
.fade-in-leave-from {
   opacity: 1;
   transform: translateY(0);
}
 
 /* FORZAR BORDES REDONDEADOS EN TODOS LOS INPUTS TEXT */
.op-card input,
.op-card .control,
.section-card input,
.section-card .control,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
textarea,
select {
    border-radius: 25px !important;
    -webkit-border-radius: 25px !important;
    -moz-border-radius: 25px !important;
    -ms-border-radius: 25px !important;
    overflow: hidden !important;
}

/* Más padding para los inputs y textareas */
:deep(.control),
:deep(input[type="text"]),
:deep(input[type="date"]),
:deep(input[type="time"]),
:deep(input[type="number"]),
:deep(textarea),
:deep(select) {
    padding: 12px 18px !important;
}

/* Placeholders más visibles */
:deep(.control::placeholder),
:deep(input::placeholder),
:deep(textarea::placeholder) {
    color: rgba(71, 85, 105, 0.9) !important;
    opacity: 1 !important;
}

:deep(.control::-webkit-input-placeholder),
:deep(input::-webkit-input-placeholder),
:deep(textarea::-webkit-input-placeholder) {
    color: rgba(71, 85, 105, 0.9) !important;
    opacity: 1 !important;
}

:deep(.control::-moz-placeholder),
:deep(input::-moz-placeholder),
:deep(textarea::-moz-placeholder) {
    color: rgba(71, 85, 105, 0.9) !important;
    opacity: 1 !important;
}

:deep(.control:-ms-input-placeholder),
:deep(input:-ms-input-placeholder),
:deep(textarea:-ms-input-placeholder) {
    color: rgba(71, 85, 105, 0.9) !important;
    opacity: 1 !important;
}

/* Específico para este formulario */
.op-insumos-consumibles .control,
.op-insumos-consumibles input[type="text"],
.form-grid .control,
.form-grid input {
    border-radius: 30px !important;
    -webkit-border-radius: 30px !important;
    -moz-border-radius: 30px !important;
}

/* Inputs de cantidad más compactos en renglones */
.item-row:not(.unidades-grid-row) .item-grid .field:last-child .control,
.item-row:not(.unidades-grid-row) .item-grid input[type="number"],
.item-row:not(.unidades-grid-row) input[type="number"] {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
    text-align: center !important;
    padding: 0.55rem 0.5rem !important;
}

@media (max-width: 520px) {

    .section-card,
    .form-footer {
        padding: 20px 16px;
    }

    .section-grid {
        gap: 14px;
    }

    .item-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

@supports not (backdrop-filter: blur(10px)) {
    :deep(.auth-card.glass) {
        backdrop-filter: none;
        background: rgba(15, 23, 42, 0.9);
    }

    .section-card,
    .item-row,
    .form-footer {
        backdrop-filter: none;
        background: rgba(255, 255, 255, 0.9);
    }
}

@media (prefers-reduced-motion: reduce) {

    .btn.primary,
    .ctr-btn {
        transition: none;
    }
}

/* Input de fecha con glassmorphism - Base */
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
    /* Forzar el calendario nativo oscuro */
    filter: invert(0) !important;
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
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2306b6d4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='3' ry='3'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 20px !important;
    cursor: pointer !important;
    opacity: 0.85 !important;
    transition: all 0.3s ease !important;
    filter: drop-shadow(0 2px 4px rgba(6, 182, 212, 0.3)) !important;
    margin-right: 4px !important;
    width: 24px !important;
    height: 24px !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator:hover) {
    opacity: 1 !important;
    transform: scale(1.15) rotate(5deg) !important;
    filter: drop-shadow(0 4px 8px rgba(6, 182, 212, 0.5)) !important;
}

/* Texto del date picker con efectos mejorados */
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

/* Color scheme oscuro para el calendario nativo */
:deep(input[type="date"]) {
    color-scheme: dark !important;
}

/* ===== CALENDARIO GLASSMORPHISM - CONFIGURACIÓN PRINCIPAL ===== */

/* Forzar color-scheme oscuro de manera global en este componente */
.op-servicio-form * {
    color-scheme: dark !important;
}

/* Configuración principal del input date */
:deep(input[type="date"]),
.control[type="date"] {
    color-scheme: dark !important;
    background: rgba(15, 20, 40, 0.65) !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 14px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
}

/* Icono del calendario con color verde neón */
:deep(input[type="date"]::-webkit-calendar-picker-indicator),
.control[type="date"]::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2300ff6a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
    background-size: 18px !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    opacity: 0.9 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-indicator:hover) {
    opacity: 1 !important;
    transform: scale(1.1) !important;
}

/* Cabecera del calendario - Mes, año y navegación */
:deep(input[type="date"]::-webkit-calendar-picker-header) {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.95) !important;
    border-radius: 0 !important;
    padding: 12px 0 !important;
    margin-bottom: 18px !important;
    font-weight: 600 !important;
    font-size: 19px !important;
    text-align: center !important;
    border: none !important;
    box-shadow: none !important;
    letter-spacing: 0.3px !important;
}

/* Botones de navegación (< >) - Rectangulares con bordes redondeados */
:deep(input[type="date"]::-webkit-calendar-picker-navigation-button) {
    background: rgba(0, 0, 0, 0.35) !important;
    color: rgba(255, 255, 255, 0.85) !important;
    border: none !important;
    border-radius: 8px !important;
    width: 36px !important;
    height: 32px !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}

:deep(input[type="date"]::-webkit-calendar-picker-navigation-button:hover) {
    background: rgba(255, 255, 255, 0.12) !important;
    color: rgba(255, 255, 255, 0.95) !important;
    transform: none !important;
    box-shadow: none !important;
}

/* Grilla de días del mes - Botones redondeados */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell) {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.85) !important;
    border-radius: 50% !important;
    border: none !important;
    margin: 2px !important;
    padding: 8px !important;
    font-weight: 400 !important;
    transition: all 0.2s ease !important;
    min-width: 38px !important;
    min-height: 38px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    font-size: 14px !important;
}

/* Día actual - Verde tenue con soft-glow */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:current-day) {
    background: rgba(0, 255, 106, 0.25) !important;
    color: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(0, 255, 106, 0.4) !important;
    font-weight: 500 !important;
    box-shadow: 0 0 12px rgba(0, 255, 106, 0.3) !important;
}

/* Día seleccionado - Verde fosforescente intenso (círculo) */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:selected) {
    background: #00ff6a !important;
    color: #000000 !important;
    border: none !important;
    font-weight: 600 !important;
    transform: none !important;
    box-shadow: 0 0 15px rgba(0, 255, 106, 0.5) !important;
    border-radius: 50% !important;
}

/* Hover en días normales - Iluminación tenue */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:hover) {
    background: rgba(255, 255, 255, 0.08) !important;
    color: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    transform: none !important;
    box-shadow: none !important;
}

/* Días inactivos (fuera del mes) - Gris con baja opacidad */
:deep(input[type="date"]::-webkit-calendar-picker-day-cell:inactive) {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.3) !important;
    border: none !important;
    opacity: 1 !important;
}

/* Barra de días de la semana (L M X J V S D) */
:deep(input[type="date"]::-webkit-calendar-picker-week-header) {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.65) !important;
    font-weight: 400 !important;
    text-align: center !important;
    padding: 8px 4px !important;
    border-radius: 0 !important;
    margin-bottom: 12px !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    border: none !important;
}

/* Panel de la tabla del calendario - Fondo transparente */
:deep(input[type="date"]::-webkit-calendar-picker-table) {
    background: transparent !important;
    border-radius: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
}

/* Ocultar elementos no deseados */
:deep(input[type="date"]::-webkit-inner-spin-button),
:deep(input[type="date"]::-webkit-clear-button) {
    display: none !important;
}

/* CSS adicional para forzar el tema oscuro en el calendario */
:deep(input[type="date"]) {
    /* Configuración del esquema de color oscuro */
    color-scheme: dark !important;
}

/* Configuración global para el calendario en este componente */
.op-card input[type="date"] {
    color-scheme: dark !important;
}

/* Estilos específicos para WebKit */
@supports (-webkit-appearance: none) {
    :deep(input[type="date"]) {
        -webkit-appearance: none !important;
        appearance: none !important;
    }
}

/* Estilos directos para el calendario nativo - Enfoque alternativo */
:deep(.control[type="date"]) {
    color-scheme: dark !important;
    background: rgba(15, 20, 40, 0.65) !important;
    backdrop-filter: blur(18px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 14px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
}

/* Aplicar directamente al control específico */
.control[type="date"] {
    color-scheme: dark !important;
}

/* Estilos CSS nativos para el calendario del navegador */
html {
    color-scheme: light dark;
}

/* Configuración específica para este componente */
.op-servicio-form {
    color-scheme: dark;
}

.op-servicio-form input[type="date"] {
    color-scheme: dark !important;
}

/* CSS específico y directo para el calendario */
.op-servicio-form input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) !important;
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2300ff6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") !important;
    background-size: 18px !important;
    opacity: 0.8 !important;
}

/* Forzar el tema oscuro usando el atributo data-theme */
.op-entrada-form {
    --date-picker-bg: rgba(15, 20, 40, 0.9);
    --date-picker-text: rgba(255, 255, 255, 0.95);
    --date-picker-border: rgba(255, 255, 255, 0.15);
    --date-picker-accent: #00ff6a;
}

/* Configuración meta para el color-scheme */
@supports (color-scheme: dark) {
    .op-servicio-form input[type="date"] {
        color-scheme: dark;
    }
}

/* Usar :where() para mayor especificidad */
:where(.op-servicio-form) input[type="date"] {
    color-scheme: dark;
}

/* ===== CALENDARIO GLASSMORPHISM - CONTROLADO POR SASS ===== */
/* Los estilos principales están en src/styles/calendar-glassmorphism.scss */
/* Este componente solo aplicará configuraciones específicas */

.op-servicio-form {
    position: relative;
}

.op-servicio-form input[type="date"] {
    /* Los estilos base son aplicados por el archivo SCSS global */
    /* Solo configuraciones específicas del componente aquí */
    position: relative;
    z-index: 1;
}

/* ===== ESTILOS DE ICONOGRAFÍA EN TÍTULOS DE SECCIONES ===== */
.section-title-with-icon {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
}

.section-title-with-icon svg {
    flex-shrink: 0;
    stroke: rgb(59, 130, 246);
    opacity: 0.9;
    transition: all 0.3s ease;
}

.section-head:hover .section-title-with-icon svg {
    opacity: 1;
    stroke: rgb(37, 99, 235);
    filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.3));
}

.section-title-with-icon h4 {
    margin: 0;
    display: flex;
    align-items: center;
}

/* Animación sutil en hover */
@media (hover: hover) {
    .section-head:hover {
        transition: all 0.2s ease;
    }

    .section-head:hover .section-title-with-icon h4 {
        color: rgb(37, 99, 235);
    }
}

/* ===== ESTILOS DEL BOTÓN AGREGAR ITEM ===== */
.btn-add-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px !important;
    font-weight: 600;
    transition: all 0.3s ease !important;
    position: relative;
    overflow: hidden;
}

.btn-add-item svg {
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.btn-add-item:not(:disabled):hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3) !important;
}

.btn-add-item:not(:disabled):active {
    transform: translateY(0) !important;
}

.btn-add-item:not(:disabled):hover svg {
    transform: rotate(90deg) scale(1.1);
}

.btn-add-item:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
}

/* ===== MEJORAS DE CAMPOS DE ENTRADA ===== */
.form-grid .field label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.85);
    transition: color 0.2s ease;
}

.form-grid .field:focus-within label {
    color: rgb(59, 130, 246);
}

/* ===== ESTILOS DE SECCIONES MEJORADOS ===== */
.section-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
}

.section-head:hover {
    border-bottom-color: rgba(59, 130, 246, 0.25);
}

.hint {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(71, 85, 105, 0.8);
    font-size: 0.85rem;
    font-weight: 500;
}

/* ===== MEJORAS DE CAMPO FOLIO ===== */
.field label {
    position: relative;
}

.field label::before {
    content: '';
    display: inline-block;
    width: 0;
    height: 0;
    opacity: 0;
    transition: all 0.3s ease;
}

.field:has(input[placeholder*="5-011"]) label::before {
    content: '';
    width: auto;
    opacity: 0.7;
    margin-right: 4px;
}

/* ===== ESTILOS PARA MODO EDITAR - TÍTULO EN MODAL ===== */
.edit-title-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 0;
}

.edit-title-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgb(59, 130, 246);
    backdrop-filter: blur(8px);
}

.edit-title-badge svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.5;
    opacity: 0.9;
}

.edit-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.95);
    letter-spacing: -0.3px;
}

.edit-subtitle {
    margin: 4px 0 0;
    font-size: 0.95rem;
    color: rgba(71, 85, 105, 0.8);
    font-weight: 500;
}

.edit-subtitle strong {
    color: rgb(59, 130, 246);
    font-weight: 700;
}

/* ========= Mejoras visuales adicionales específicas para OpEntrada ========= */
.op-entrada-form {
    padding: 8px;
}

.op-entrada-form .section-card {
    background: linear-gradient(180deg, rgba(8, 12, 20, 0.74), rgba(12, 18, 28, 0.7));
    color: #e6eef8;
    border: 1px solid rgba(255, 255, 255, 0.04);
    box-shadow: 0 12px 32px rgba(0, 6, 22, 0.6);
    transition: transform .18s ease, box-shadow .18s ease;
}

.op-entrada-form .section-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 22px 44px rgba(0, 6, 22, 0.72);
}

.op-entrada-form .section-head h4 {
    color: #eef6ff
}

.op-entrada-form .section-head svg {
    background: rgba(255, 255, 255, 0.03);
    padding: 6px;
    border-radius: 8px
}

.op-entrada-form .field label {
    color: rgba(230, 238, 248, 0.86);
    font-weight: 700;
    font-size: 0.86rem
}

.op-entrada-form .control {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 10px 12px;
    border-radius: 12px !important;
    color: #e6eef8 !important;
}

.op-entrada-form .control:focus {
    box-shadow: 0 8px 24px rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.7)
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 18px
}

.form-actions .btn {
    padding: 10px 14px;
    border-radius: 12px
}

.form-actions .btn.primary {
    background: linear-gradient(90deg, #06b6d4, #7c3aed);
    box-shadow: 0 10px 28px rgba(64, 49, 255, 0.12)
}

.form-actions .btn.secondary {
    background: transparent;
    color: rgba(230, 238, 248, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.06)
}

@media (max-width: 640px) {
    .form-actions {
        flex-direction: column-reverse;
        align-items: stretch
    }

    .form-actions .btn {
        width: 100%
    }
}

/* Mejor apariencia del DatePicker nativo cuando el usuario abre el calendario */
.op-servicio-form input[type="date"]::-webkit-calendar-picker-indicator {
    filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5))
}

/* pequeños tweaks para los iconos dentro de las secciones */
.section-title-with-icon svg {
    width: 28px;
    height: 28px
}

/* Ajustes de accesibilidad: mayor contraste para placeholders */
:where(.op-entrada-form) .control::placeholder {
    color: rgba(255, 255, 255, 0.55)
}

/* ===== ESTILOS PARA EDIT UNIT MODAL ===== */
.edit-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
    padding: 20px;
}

.edit-modal {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.edit-modal__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.edit-modal__header h3 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.95);
}

.edit-modal__close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(71, 85, 105, 0.8);
    transition: all 0.2s ease;
    border-radius: 8px;
}

.edit-modal__close:hover {
    background: rgba(15, 23, 42, 0.08);
    color: rgba(15, 23, 42, 0.95);
}

.edit-modal__body {
    padding: 24px;
    flex: 1;
    overflow-y: auto;
}

.edit-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.edit-form-grid .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.edit-form-grid .field label {
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.95);
    text-transform: capitalize;
}

.edit-form-grid .field[style*="grid-column"] {
    grid-column: 1 / -1;
}

.edit-modal__footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(15, 23, 42, 0.02);
}

.edit-modal__footer .btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* Transition animation for modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .edit-modal {
    animation: modalSlideIn 0.3s ease;
}

.modal-fade-leave-active .edit-modal {
    animation: modalSlideOut 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        transform: scale(0.95) translateY(20px);
        opacity: 0;
    }

    to {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

@keyframes modalSlideOut {
    from {
        transform: scale(1) translateY(0);
        opacity: 1;
    }

    to {
        transform: scale(0.95) translateY(20px);
        opacity: 0;
    }
}

/* Check badge animation */
.check-badge {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.12);
}

.check-enter-active {
    animation: popIn 420ms cubic-bezier(0.2, 0.9, 0.2, 1);
}
.check-leave-active {
    transition: opacity 140ms linear, transform 140ms ease;
}
.check-enter-from {
    opacity: 0;
    transform: scale(0.2) rotate(-15deg);
}
.check-enter-to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
}

@keyframes popIn {
    0% { opacity: 0; transform: scale(0.2) rotate(-20deg); }
    60% { opacity: 1; transform: scale(1.12) rotate(6deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

@media (max-width: 640px) {
    .edit-modal {
        max-width: 100%;
        max-height: 100%;
        border-radius: 12px 12px 0 0;
        margin-top: auto;
    }

    .edit-form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
