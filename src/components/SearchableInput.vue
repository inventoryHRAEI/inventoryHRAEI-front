<template>
    <div class="smart-search-wrapper" ref="wrapperRef">
        <!-- Badge N/A -->
        <div v-if="modelValue === 'N/A'" class="na-badge" title="Campo sin datos en el inventario">N/A</div>

        <div class="smart-search-input-box">
            <input ref="inputRef" class="smart-input" :class="{ 'has-na': modelValue === 'N/A', 'is-disabled': disabled }" type="text"
                :value="modelValue" :placeholder="placeholder" @input="handleInput" @focus="onFocus" @click="onInputClick" @blur="onBlur"
                @keydown.down.prevent="moveSelection(1)" @keydown.up.prevent="moveSelection(-1)"
                @keydown.enter.prevent="confirmSelection" @keydown.escape="closeDropdown" @keydown.tab="closeDropdown"
                :disabled="disabled" autocomplete="off" spellcheck="false" />

            <button v-if="modelValue && modelValue !== 'N/A'" class="clear-btn" @click="clearValue" type="button"
                title="Borrar">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
            <!-- Botón pequeño para cerrar dropdown cuando esté abierto -->
            <button v-if="isOpen" class="inline-close-btn" type="button" @click.stop="forceCloseFromUi"
                title="Cerrar sugerencias">✕</button>
        </div>

        <!-- Dropdown de resultados -->
        <div v-if="canShowSuggestions && isOpen && (groupedResults.length > 0 || (query.length > 0 && groupedResults.length === 0) || showInitial)"
            ref="dropdownRef" class="smart-dropdown" :data-instance-id="instanceId" :style="dropdownStyle">

                    <!-- Barra de estado de búsqueda -->
                    <div class="search-status-bar">
                        <span class="result-count" v-if="query.length > 0">
                            {{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }}
                            <span v-if="exactMatchesCount > 0" class="exact-status">· Coincidencia exacta</span>
                        </span>
                        <span class="result-count" v-else>
                            Sugerencias del inventario
                        </span>
                        <div class="status-right">
                            <button type="button" class="filter-toggle-btn"
                                :class="{ active: filtersOpen, 'has-filters': hasActiveFilters }"
                                @click.stop="filtersOpen = !filtersOpen">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                </svg>
                                Filtros
                                <span v-if="hasActiveFilters" class="filter-badge">{{ activeFiltersCount }}</span>
                            </button>
                            <button type="button" class="exact-toggle-btn" :class="{ active: onlyExact }" @click.stop="onlyExact = !onlyExact"
                                title="Mostrar sólo coincidencias exactas">Sólo exactas <span v-if="exactMatchesCount">({{ exactMatchesCount }})</span></button>
                            <button v-if="hasActiveFilters" type="button" class="inline-clear-filters" @click.stop="clearAllFilters"
                                title="Limpiar filtros">
                                🧹
                            </button>
                            <button type="button" class="close-dropdown-btn" @click.stop="forceCloseFromUi"
                                title="Cerrar">
                                ✕
                            </button>
                            <span class="search-hint">
                                ↑↓ · Enter · Esc
                            </span>
                        </div>
                    </div>

                    <!-- Panel de filtros colapsable -->
                        <transition name="filter-slide">
                        <div v-if="filtersOpen" class="filters-panel" @mousedown.stop>
                            <!-- Encabezado filtros -->
                            <div class="filters-header">
                                <span class="filters-title">Filtrar por</span>
                                <div class="filters-header-actions">
                                    <button v-if="hasActiveFilters" type="button" class="clear-filters-btn"
                                        @click="clearAllFilters">
                                        Limpiar todo
                                    </button>
                                    <button type="button" class="close-filters-btn" @click="forceCloseFromUi">
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                            <!-- Filtro por Tipo -->
                            <div v-if="filterOptions.tipos.length > 0" class="filter-group">
                                <span class="filter-group-label">Tipo</span>
                                <div class="filter-chips">
                                    <button v-for="opt in filterOptions.tipos" :key="'t-' + opt.key" type="button"
                                        class="filter-chip chip-tipo"
                                        :class="{ selected: activeFilterTipo.has(opt.key) }"
                                        @click.stop="toggleFilter('tipo', opt.key)">
                                        {{ opt.label }}
                                        <span class="chip-count">{{ opt.count }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Filtro por Marca -->
                            <div v-if="filterOptions.marcas.length > 0" class="filter-group">
                                <span class="filter-group-label">Marca</span>
                                <div class="filter-chips scrollable">
                                    <button v-for="opt in filterOptions.marcas" :key="'m-' + opt.key" type="button"
                                        class="filter-chip chip-marca-filter"
                                        :class="{ selected: activeFilterMarca.has(opt.key) }"
                                        @click.stop="toggleFilter('marca', opt.key)">
                                        {{ opt.label }}
                                        <span class="chip-count">{{ opt.count }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Filtro por Ubicación -->
                            <div v-if="filterOptions.ubicaciones.length > 0" class="filter-group">
                                <span class="filter-group-label">Ubicación</span>
                                <div class="filter-chips scrollable">
                                    <button v-for="opt in filterOptions.ubicaciones" :key="'u-' + opt.key" type="button"
                                        class="filter-chip chip-ubi-filter"
                                        :class="{ selected: activeFilterUbi.has(opt.key) }"
                                        @click.stop="toggleFilter('ubicacion', opt.key)">
                                        {{ opt.label }}
                                        <span class="chip-count">{{ opt.count }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </transition>

                    <!-- Resultados agrupados -->
                    <div class="results-scroll" ref="scrollRef">
                        <template v-for="(group, gi) in groupedResults" :key="group.key">
                            <div class="group-header">
                                <span class="group-icon">{{ groupIcon(group.key) }}</span>
                                <span class="group-label">{{ group.label }}</span>
                                <span class="group-count">{{ group.count }}</span>
                            </div>

                            <button
                                v-for="(result, ri) in group.items"
                                :key="`${group.key}-${ri}`"
                                :ref="el => setItemRef(el, flatIndex(gi, ri))"
                                :class="['result-card', { 'is-active': flatIndex(gi, ri) === activeIndex, 'exact-match': result.exactMatch }]"
                                type="button"
                                @click="selectResult(result)"
                                @mouseenter="activeIndex = flatIndex(gi, ri)">

                                <div class="card-main">
                                    <span class="card-icon" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" stroke-width="2" />
                                            <path d="M8 13l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <div class="card-name">
                                        <span v-html="highlightField(result, 'nombre')"></span>
                                        <span v-if="result.exactMatch" class="exact-badge" title="Coincidencia exacta">Exacta</span>
                                    </div>
                                    <div class="card-relevance" :title="`Relevancia: ${result.relevance}%`">
                                        <div class="relevance-bar">
                                            <div class="relevance-fill" :style="{ width: result.relevance + '%' }"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card-details" v-if="isSimpleDropdown">
                                    <div class="detail-row">
                                        <span class="detail-label">Nombre:</span>
                                        <span class="detail-value" v-html="highlightField(result, 'nombre')"></span>
                                    </div>
                                    <div class="detail-row" v-if="hasVal(result.item.referencia)">
                                        <span class="detail-label">Referencia:</span>
                                        <span class="detail-value">{{ result.item.referencia }}</span>
                                    </div>
                                </div>

                                <div class="card-details" v-else-if="showDetailChips">
                                    <span v-if="hasVal(result.item.marca)" class="detail-chip chip-marca">
                                        <span class="chip-label">Marca</span>
                                        <span v-html="highlightField(result, 'marca')"></span>
                                    </span>
                                    <span v-if="hasVal(result.item.modelo)" class="detail-chip chip-modelo">
                                        <span class="chip-label">Modelo</span>
                                        <span v-html="highlightField(result, 'modelo')"></span>
                                    </span>
                                    <span v-if="hasVal(result.item.serie)" class="detail-chip chip-serie">
                                        <span class="chip-label">Serie</span>
                                        <span v-html="highlightField(result, 'serie')"></span>
                                    </span>
                                    <span v-if="hasVal(result.item.noInventario)" class="detail-chip chip-inv">
                                        <span class="chip-label">Inv</span>
                                        <span v-html="highlightField(result, 'noInventario')"></span>
                                    </span>
                                    <span v-if="hasVal(result.item.referencia)" class="detail-chip chip-ref">
                                        <span class="chip-label">Ref</span>
                                        <span v-html="highlightField(result, 'referencia')"></span>
                                    </span>
                                    <span v-if="hasVal(result.item.claveHRAEI)" class="detail-chip chip-clave">
                                        <span class="chip-label">HRAEI</span>
                                        <span v-html="highlightField(result, 'claveHRAEI')"></span>
                                    </span>
                                    <span v-if="hasVal(result.item.ubicacion) && result.item.ubicacion !== 'N/A'" class="detail-chip chip-ubi">
                                        <span class="chip-label">Ubicación</span>
                                        <span v-html="highlightField(result, 'ubicacion')"></span>
                                    </span>
                                </div>
                            </button>
                        </template>

                        <!-- Sin resultados para query activa -->
                        <div v-if="query.length > 0 && groupedResults.length === 0" class="no-results">
                            <div class="no-results-icon">🔍</div>
                            <p>No se encontraron coincidencias para "<strong>{{ query }}</strong>"</p>
                            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                                <button type="button" class="add-custom-btn" @click="selectCustom">
                                    <span class="add-icon">+</span> Agregar "{{ query }}" manualmente
                                </button>
                                <button type="button" class="add-custom-btn" @click="clearSuggestions" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(79, 70, 229, 0.06)); border-color: rgba(99, 102, 241, 0.2); color: #818cf8;">
                                    <span class="add-icon">🔄</span> Forzar recarga de inventario
                                </button>
                            </div>
                        </div>

                        <!-- No hay sugerencias cargadas (modo inicial) -->
                        <div v-else-if="showInitial && groupedResults.length === 0" class="no-results">
                            <div class="no-results-icon">🧩</div>
                            <p>Sin sugerencias disponibles aún. Verifica cantidad de datos o actualiza el inventario.</p>
                            <button type="button" class="add-custom-btn" @click="clearSuggestions">
                                <span class="add-icon">🔄</span> Recargar sugerencias
                            </button>
                        </div>
                    </div>

                    <!-- Fuente de datos -->
                    <div class="dropdown-footer">
                        <span class="source-label" v-if="hasActiveFilters">
                            🔽 {{ activeFiltersCount }} filtro{{ activeFiltersCount !== 1 ? 's' : '' }} activo{{
                                activeFiltersCount !== 1 ?
                                    's' : '' }}
                        </span>
                        <span class="source-label" v-else>
                            Búsqueda inteligente · Fuse.js
                        </span>
                    </div>
                </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useFuseSearch } from '@/composables/useFuseSearch'

const sharedDropdownState = {
    activeId: null,
    closers: new Map(),
}

function handleGlobalClearFilters() {
    try {
        clearAllFilters()
    } catch (e) {
        console.warn('[SearchableInput] Error clearing filters from global event:', e.message)
    }
}

function registerDropdownCloser(id, closeFn) {
    if (!id || typeof closeFn !== 'function') return
    sharedDropdownState.closers.set(id, closeFn)
}

function unregisterDropdownCloser(id) {
    if (!id) return
    sharedDropdownState.closers.delete(id)
    if (sharedDropdownState.activeId === id) {
        sharedDropdownState.activeId = null
    }
}

function closeAllDropdowns(exceptId = null, reason = 'global-close') {
    for (const [id, closeFn] of [...sharedDropdownState.closers.entries()]) {
        if (exceptId && id === exceptId) continue
        try {
            closeFn(reason)
        } catch (_) { }
    }
    if (!exceptId) {
        sharedDropdownState.activeId = null
    }
}

const props = defineProps({
    modelValue: { type: String, default: '' },
    suggestions: { type: [Array, Function], default: () => [] },
    placeholder: { type: String, default: 'Escriba para buscar...' },
    fieldName: { type: String, default: 'nombre' },
    tipo: { type: String, default: '' },
    // Inyección de searchKeys se mantiene para compat, pero Fuse.js tiene sus propias keys
    searchKeys: { type: Array, default: () => [] },
    showDetailChips: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    disableSuggestions: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'select'])

// Refs DOM
const wrapperRef = ref(null)
const inputRef = ref(null)
const dropdownRef = ref(null)
const scrollRef = ref(null)
const itemRefs = ref({})

// Estado
const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)
const dropdownStyle = ref({})
const instanceId = `ssi-${Math.random().toString(36).slice(2, 10)}`
let blurTimer = null
const SEARCHABLE_OPEN_EVENT = 'searchable-input:opened'
const handleWindowBlur = () => {
    closeAllDropdowns(null, 'window-blur')
}
const handleVisibilityChange = () => {
    if (document.hidden) {
        closeAllDropdowns(null, 'hidden')
    }
}

// --- Fuse.js ---
const suggestionsRef = computed(() => {
    if (Array.isArray(props.suggestions)) return props.suggestions
    if (typeof props.suggestions === 'function') {
        const result = props.suggestions(props.tipo, query.value, props.fieldName)
        return Array.isArray(result) ? result : []
    }
    return []
})
const canShowSuggestions = computed(() => !props.disableSuggestions && suggestionsRef.value.length > 0)
const { search, searchGrouped, searchGroupedFiltered, highlightField, isIndexReady, getInitialItems, getFilterOptions } = useFuseSearch(suggestionsRef)

// --- Filtros ---
const filtersOpen = ref(false)
// Sólo exactas toggle
const onlyExact = ref(false)
const activeFilterTipo = ref(new Set())
const activeFilterMarca = ref(new Set())
const activeFilterUbi = ref(new Set())

const filterOptions = computed(() => getFilterOptions())
const hasActiveFilters = computed(() =>
    activeFilterTipo.value.size > 0 || activeFilterMarca.value.size > 0 || activeFilterUbi.value.size > 0
)
const activeFiltersCount = computed(() =>
    activeFilterTipo.value.size + activeFilterMarca.value.size + activeFilterUbi.value.size
)

const activeFiltersObj = computed(() => ({
    tipo: activeFilterTipo.value,
    marca: activeFilterMarca.value,
    ubicacion: activeFilterUbi.value,
}))

const FIELD_ALIASES = {
    nombre: ['nombre', 'label'],
    marca: ['marca'],
    modelo: ['modelo'],
    lote: ['lote', 'LOTE', 'Lote'],
    serie: ['serie', 'n', 'N', 'numeroSerie', 'Número de serie', 'Numero de serie'],
    referencia: ['referencia', 'REFERENCIA', 'Referencia'],
    ubicacion: ['ubicacion', 'Ubicación', 'UBICACION', 'Ubicacion'],
    claveHRAEI: ['claveHRAEI', 'Clave  HRAEI', 'Clave HRAEI', 'CLAVE HRAEI'],
}

const FIELD_LABELS = {
    nombre: 'Nombre',
    marca: 'Marca',
    modelo: 'Modelo',
    lote: 'Lote',
    serie: 'Serie',
    referencia: 'Referencia',
    ubicacion: 'Ubicación',
    claveHRAEI: 'Clave HRAEI',
}

const isSimpleDropdown = computed(() => {
    const field = props.fieldName || ''
    return field === 'nombre' || field === 'label'
})

const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function pickFieldValue(item, fieldName) {
    if (!item || typeof item !== 'object') return ''
    const aliases = FIELD_ALIASES[fieldName] || [fieldName]
    for (const alias of aliases) {
        const val = item[alias]
        if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim()
        }
    }
    return ''
}

function applyStrictLocalFilters(list = [], filters = null) {
    if (!filters) return list
    return list.filter((item) => {
        if (filters.marca && filters.marca.size > 0) {
            const m = normalizeText(item?.marca)
            if (!m || !filters.marca.has(m)) return false
        }
        if (filters.ubicacion && filters.ubicacion.size > 0) {
            const u = normalizeText(item?.ubicacion)
            if (!u || !filters.ubicacion.has(u)) return false
        }
        return true
    })
}

function buildStrictFieldFallbackResults(text, filters = null) {
    const q = normalizeText(text)
    if (!q) return []

    const source = applyStrictLocalFilters(suggestionsRef.value || [], filters)
    const matched = source.filter((item) => normalizeText(pickFieldValue(item, props.fieldName)).includes(q))
    if (!matched.length) return []

    const qNorm = String(text || '').trim().toLowerCase()
    const exactMatchToQuery = (candidate) => {
        if (!qNorm) return false
        const fieldKey = props.fieldName || 'nombre'
        if (fieldKey && candidate[fieldKey] && String(candidate[fieldKey]).trim().toLowerCase() === qNorm) return true
        const keysToCheck = ['nombre', 'marca', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']
        return keysToCheck.some((key) => {
            const val = candidate[key]
            return val && String(val).trim().toLowerCase() === qNorm
        })
    }

    const wrapped = matched.slice(0, 60).map((item) => ({
        item,
        score: 0,
        relevance: 100,
        matches: [],
        exactMatch: exactMatchToQuery(item)
    }))

    const label = FIELD_LABELS[props.fieldName] || props.fieldName || 'Campo'
    return [{
        key: `field-${props.fieldName || 'custom'}`,
        label: `Coincidencias por ${label}`,
        items: wrapped,
        count: wrapped.length
    }]
}

function toggleFilter(category, key) {
    const set = category === 'tipo' ? activeFilterTipo
        : category === 'marca' ? activeFilterMarca
            : activeFilterUbi
    const newSet = new Set(set.value)
    if (newSet.has(key)) {
        newSet.delete(key)
    } else {
        newSet.add(key)
    }
    set.value = newSet
    activeIndex.value = -1
}

function clearAllFilters() {
    activeFilterTipo.value = new Set()
    activeFilterMarca.value = new Set()
    activeFilterUbi.value = new Set()
    activeIndex.value = -1
}

// Resultados agrupados — aplica filtros y búsqueda
const showInitial = ref(false)
const groupedResults = computed(() => {
    const f = hasActiveFilters.value ? activeFiltersObj.value : null
    if (!query.value || query.value.trim().length < 1) {
        if (showInitial.value) return getInitialItems(40, f)
        return []
    }
    const grouped = searchGroupedFiltered(query.value, f)

    // Si el usuario activó "sólo exactas", filtramos los grupos dejando sólo exactMatch
    if (onlyExact.value) {
        const filtered = grouped.map(g => {
            const items = (g.items || []).filter(it => it && it.exactMatch)
            return { ...g, items, count: items.length }
        }).filter(g => g.count > 0)
        return filtered
    }

    if (grouped.length > 0) return grouped
    return buildStrictFieldFallbackResults(query.value, f)
})

const totalResults = computed(() =>
    groupedResults.value.reduce((sum, g) => sum + g.count, 0)
)

const exactMatchesCount = computed(() =>
    flatItems.value.filter(item => item.exactMatch).length
)

// Flatten index helper para navegación teclado
const flatItems = computed(() => {
    const flat = []
    groupedResults.value.forEach(g => {
        g.items.forEach(item => flat.push(item))
    })
    return flat
})

function flatIndex(groupIdx, itemIdx) {
    let idx = 0
    for (let g = 0; g < groupIdx; g++) {
        // Validar que el grupo existe antes de acceder a sus items
        if (groupedResults.value && groupedResults.value[g] && groupedResults.value[g].items) {
            idx += groupedResults.value[g].items.length
        }
    }
    return idx + itemIdx
}

function setItemRef(el, idx) {
    if (el) itemRefs.value[idx] = el
}

function notifyOpened() {
    try {
        window.dispatchEvent(new CustomEvent(SEARCHABLE_OPEN_EVENT, { detail: { id: instanceId } }))
    } catch (_) { }
}

function openDropdown() {
    try {
        if (!canShowSuggestions.value) {
            closeDropdown('suggestions-disabled')
            return
        }
        if (blurTimer) {
            clearTimeout(blurTimer)
            blurTimer = null
        }
        closeAllDropdowns(instanceId, 'switch-instance')
        if (!isOpen.value) {
            isOpen.value = true
        }
        if (!query.value || !query.value.trim().length) {
            showInitial.value = true
        }
        sharedDropdownState.activeId = instanceId
        // No cleanup here: removing teleported DOM nodes manually can interfere with Vue's patching
        // and lead to runtime errors when the dropdown is updating.
        notifyOpened()
        nextTick(() => updateDropdownPosition())
    } catch (e) {
        console.warn('[SearchableInput] Error in openDropdown:', e.message)
    }
}

// ------- Input handlers -------
function handleInput(e) {
    const val = e.target.value
    query.value = val
    showInitial.value = !val || val.trim().length === 0
    emit('update:modelValue', val)
    activeIndex.value = -1
    if (canShowSuggestions.value) {
        openDropdown()
    } else {
        closeDropdown('no-suggestions-source')
    }
}

function onFocus() {
    if (props.disabled) return
    query.value = props.modelValue || ''
    showInitial.value = true
    if (canShowSuggestions.value) {
        openDropdown()
    }
}

function onBlur() {
    // Delay para que clicks en el dropdown se registren.
    // Antes de cerrar, verificamos si el foco de verdad se fue fuera del dropdown.
    if (blurTimer) clearTimeout(blurTimer)
    blurTimer = setTimeout(() => {
        const active = document.activeElement
        const stillInInput = wrapperRef.value && wrapperRef.value.contains(active)
        const stillInDropdown = dropdownRef.value && dropdownRef.value.contains(active)
        if (stillInInput || stillInDropdown) {
            blurTimer = null
            return
        }
        closeDropdown()
        blurTimer = null
    }, 180)
}

function closeDropdown(reason = '') {
    try {
        if (blurTimer) {
            clearTimeout(blurTimer)
            blurTimer = null
        }
        isOpen.value = false
        activeIndex.value = -1
        showInitial.value = false
        filtersOpen.value = false
        if (sharedDropdownState.activeId === instanceId) sharedDropdownState.activeId = null
    } catch (e) {
        console.warn('[SearchableInput] Error in closeDropdown:', e.message)
    }
}

function onInputClick() {
    try {
        if (props.disabled) return
        if (!canShowSuggestions.value) {
            inputRef.value?.focus()
            return
        }
        if (isOpen.value) {
            closeDropdown('input-toggle')
            return
        }
        // If closed, focus/open normally
        inputRef.value?.focus()
        onFocus()
    } catch (e) {
        console.warn('[SearchableInput] Error in onInputClick:', e.message)
    }
}

function forceCloseFromUi() {
    closeAllDropdowns(null, 'ui-button')
    closeDropdown('ui-button-self')
}

function handleGlobalOpenEvent(event) {
    const openedId = event?.detail?.id
    if (!openedId || openedId === instanceId) return
    if (isOpen.value) closeDropdown()
}

function handleDocumentPointerDown(event) {
    try {
        const target = event.target
        const insideAnyDropdown = target?.closest?.('.smart-dropdown')
        const insideAnyInput = target?.closest?.('.smart-search-wrapper')

        if (!insideAnyDropdown && !insideAnyInput) {
            closeAllDropdowns(null, 'outside-click-global')
            return
        }

        if (!isOpen.value) {
            return
        }

        const clickedInsideInput = wrapperRef?.value && wrapperRef.value.contains(target)
        const clickedInsideDropdown = dropdownRef?.value && dropdownRef.value.contains(target)
        if (clickedInsideInput || clickedInsideDropdown) return
        closeDropdown()
    } catch (e) {
        console.warn('[SearchableInput] Error in handleDocumentPointerDown:', e.message)
    }
}

function handleDocumentPointerUp(event) {
    try {
        const target = event.target
        const insideAnyDropdown = target?.closest?.('.smart-dropdown')
        const insideAnyInput = target?.closest?.('.smart-search-wrapper')

        if (!insideAnyDropdown && !insideAnyInput) {
            closeAllDropdowns(null, 'outside-click-global')
            return
        }

        if (!isOpen.value) {
            return
        }

        const clickedInsideInput = wrapperRef?.value && wrapperRef.value.contains(target)
        const clickedInsideDropdown = dropdownRef?.value && dropdownRef.value.contains(target)
        if (clickedInsideInput || clickedInsideDropdown) return
        closeDropdown()
    } catch (e) {
        console.warn('[SearchableInput] Error in handleDocumentPointerUp:', e.message)
    }
}

// ------- Selection -------
function selectResult(result) {
    try {
        const selected = result.item
        const value = selected[props.fieldName] || selected.nombre || selected.label || ''
        query.value = value
        emit('update:modelValue', value)

        console.log('[SearchableInput.selectResult] Emitting select event with:', selected)
        emit('select', selected)
        isOpen.value = false
        activeIndex.value = -1
    } catch (e) {
        console.warn('[SearchableInput] Error in selectResult:', e.message)
        isOpen.value = false
    }
}

function selectCustom() {
    const customItem = { [props.fieldName]: query.value, label: query.value }
    emit('update:modelValue', query.value)
    emit('select', customItem)
    isOpen.value = false
}

function confirmSelection() {
    if (activeIndex.value >= 0 && flatItems.value[activeIndex.value]) {
        selectResult(flatItems.value[activeIndex.value])
        return
    }

    if (query.value) {
        // Si no hay selección con flechas y existe exactMatch, lo seleccionamos automáticamente
        const qNorm = normalizeText(query.value || '')
        const exactCandidate = flatItems.value.find((r) => {
            if (!r || !r.item) return false
            if (r.exactMatch) return true
            const fields = ['nombre', 'referencia', 'noInventario', 'serie', 'claveHRAEI', 'lote']
            return fields.some((field) => {
                const val = r.item[field]
                return val && normalizeText(val) === qNorm
            })
        })
        if (exactCandidate) {
            selectResult(exactCandidate)
            return
        }
        selectCustom()
    }
}

function clearValue() {
    query.value = ''
    emit('update:modelValue', '')
    showInitial.value = true
    activeIndex.value = -1
    nextTick(() => {
        inputRef.value?.focus()
        if (canShowSuggestions.value) {
            openDropdown()
        }
    })
}

function clearSuggestions() {
    // Disparar evento global para recargar inventario y forzar UI
    window.dispatchEvent(new CustomEvent('inventory:refresh'))
    
    // Si no hay query, asegurar que mostremos la interfaz inicial
    showInitial.value = true
    
    // Feedback visual
    const btn = dropdownRef.value?.querySelector('.add-custom-btn')
    if (btn) {
        const originalText = btn.innerHTML
        btn.innerHTML = '<span class="add-icon">🔄</span> Cargando...'
        setTimeout(() => { if (btn) btn.innerHTML = originalText }, 1500)
    }
}

// ------- Keyboard navigation -------
function moveSelection(delta) {
    const count = flatItems.value.length
    if (count === 0) return

    if (!isOpen.value) {
        openDropdown()
        return
    }

    let next = activeIndex.value + delta
    if (next < 0) next = count - 1
    if (next >= count) next = 0
    activeIndex.value = next

    // Scroll into view
    nextTick(() => {
        const el = itemRefs.value[next]
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
}

// ------- Dropdown positioning (Teleported to body) -------
function updateDropdownPosition() {
    nextTick(() => {
        if (!wrapperRef.value || !inputRef.value) return
        const inputRect = inputRef.value.getBoundingClientRect()
        const wrapperRect = wrapperRef.value.getBoundingClientRect()

        dropdownStyle.value = {
            position: 'absolute',
            top: `${inputRect.height + 4}px`,
            left: '0px',
            width: `${Math.max(wrapperRect.width, 420)}px`,
            maxHeight: '380px',
            zIndex: 99999,
        }
    })
}

// ------- Sync with v-model -------
watch(() => props.modelValue, (val) => {
    query.value = val || ''
}, { immediate: true })

watch(canShowSuggestions, (enabled) => {
    if (!enabled && isOpen.value) {
        closeDropdown('suggestions-unavailable')
    }
})

// ------- Helpers -------
function hasVal(v) {
    if (!v) return false
    const s = String(v).trim()
    return s !== '' && s.toUpperCase() !== 'N/A' && !/^[-_0]*$/.test(s)
}

function groupIcon(key) {
    const icons = {
        'equipo-medico': '🏥',
        'accesorio': '🔌',
        'consumible': '💊',
        'refaccion': '🔧',
        'otro': '📦',
    }
    return icons[key] || '📦'
}

// Window resize/scroll handler for repositioning dropdown
let rafId = null
function onReposition() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
        if (isOpen.value) updateDropdownPosition()
    })
}

onMounted(() => {
    registerDropdownCloser(instanceId, closeDropdown)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    window.addEventListener(SEARCHABLE_OPEN_EVENT, handleGlobalOpenEvent)
    document.addEventListener('pointerdown', handleDocumentPointerDown, true)
    // Fallbacks: some environments stop pointerdown propagation — also listen pointerup and touchstart
    document.addEventListener('pointerup', handleDocumentPointerUp, true)
    document.addEventListener('touchstart', handleDocumentPointerDown, true)
    // allow global 'clear-filters' event to reset filters from outside
    window.addEventListener('searchable-input:clear-filters', handleGlobalClearFilters)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
    closeDropdown('unmount')
    unregisterDropdownCloser(instanceId)
    window.removeEventListener('scroll', onReposition, true)
    window.removeEventListener('resize', onReposition)
    window.removeEventListener(SEARCHABLE_OPEN_EVENT, handleGlobalOpenEvent)
    document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
    document.removeEventListener('pointerup', handleDocumentPointerUp, true)
    document.removeEventListener('touchstart', handleDocumentPointerDown, true)
    window.removeEventListener('searchable-input:clear-filters', handleGlobalClearFilters)
    window.removeEventListener('blur', handleWindowBlur)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (blurTimer) {
        clearTimeout(blurTimer)
        blurTimer = null
    }
    if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* ===== BASE WRAPPER ===== */
.smart-search-wrapper {
    position: relative;
    width: 100%;
    display: block;
    border-radius: 12px;
    background: linear-gradient(150deg, #0f172a, #1e293b);
    padding: 8px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(148, 163, 184, 0.35);
}

.na-badge {
    position: absolute;
    top: 10px;
    right: 12px;
    transform: translateY(0);
    background: #fef08a;
    color: #92400e;
    padding: 2px 6px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    z-index: 20;
    pointer-events: none;
}

/* ===== INPUT BOX ===== */
.smart-search-input-box {
    position: relative;
    display: flex;
    align-items: center;
}

.smart-input {
    width: 100%;
    padding: 10px 38px 10px 12px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    border-radius: 12px;
    font-size: 0.95rem;
    background: rgba(226, 232, 240, 0.08);
    color: #e2e8f0;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    font-family: inherit;
}

.smart-input:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
    background: rgba(148, 163, 184, 0.14);
    color: #fff;
}

.smart-input.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.smart-input:disabled {
    background: rgba(99, 102, 241, 0.02);
    color: rgba(203, 213, 225, 0.6);
}

.smart-input.has-na {
    padding-right: 58px;
    color: #f87171;
    font-weight: 600;
    background: rgba(254, 226, 226, 0.2);
    border-color: #fecaca;
}

.smart-input.has-na:focus {
    border-color: #f43f5e;
    box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2);
}

.exact-badge {
    display: inline-block;
    margin-left: 8px;
    font-size: 0.72rem;
    color: #22c55e;
    font-weight: 700;
    background: rgba(22, 163, 74, 0.16);
    border: 1px solid rgba(22, 163, 74, 0.35);
    border-radius: 999px;
    padding: 0 6px;
}

.result-card.exact-match {
    border: 1px solid #16a34a;
    box-shadow: 0 0 20px rgba(22, 163, 74, 0.35);
}

.smart-input::placeholder {
    color: rgba(226, 232, 240, 0.8);
    opacity: 1;
}

.clear-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(148, 163, 184, 0.35);
    color: #e2e8f0;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: color 0.15s, background 0.15s;
    z-index: 5;
}

.clear-btn:hover {
    background: rgba(248, 113, 113, 0.2);
    color: #fff;
}

.inline-close-btn {
    position: absolute;
    right: 44px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(148, 163, 184, 0.25);
    color: rgba(255, 255, 255, 0.65);
    width: 28px;
    height: 28px;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    z-index: 6;
}

.inline-close-btn:hover {
    background: rgba(248, 113, 113, 0.14);
    color: #fff;
}

/* ===== DROPDOWN ===== */
.smart-dropdown {
    background: #0d1f33;
    border: 1px solid rgba(148, 163, 184, 0.5);
    border-radius: 14px;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: inherit;
    color: #e2e8f0;
    max-height: 390px;
    width: 100%;
    z-index: 10001;
}

.smart-dropdown .results-scroll {
    max-height: 300px;
}

.result-card {
    margin: 4px 8px;
    border-radius: 10px;
}

.result-card:hover,
.result-card.is-active {
    background: rgba(59, 130, 246, 0.18);
}

.card-details {
    background: rgba(15, 23, 42, 0.45);
    padding: 8px;
    border-radius: 8px;
    display: grid;
    grid-template-columns: repeat(2, minmax(92px, 1fr));
    gap: 6px;
    margin-top: 6px;
    color: #cbd5e1;
}

.result-card button {
    border: 0;
    background: transparent;
    width: 100%;
    text-align: left;
}

.result-card .exact-badge {
    background: #dbf3d4;
    color: #166534;
    border: 1px solid #86efac;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 999px;
}

.search-status-bar {
    background: rgba(15, 23, 42, 0.4);
    border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.no-results {
    padding: 14px;
    color: #d1d5db;
    background: rgba(15, 23, 42, 0.3);
    border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.no-results-icon {
    font-size: 1.1rem;
    margin-bottom: 8px;
    color: #60a5fa;
}

.results-scroll {
    max-height: 280px;
    overflow-y: auto;
    padding: 4px 0;
}

.result-card {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0;
    background: transparent;
    transition: background 0.15s, transform 0.15s;
}

.result-card:last-child {
    border-bottom: 0;
}

.result-card:hover,
.result-card.is-active {
    background: rgba(148, 163, 184, 0.2);
    transform: translateY(-1px);
}

.card-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.card-name {
    font-weight: 600;
    color: #f8fafc;
    font-size: 0.95rem;
    line-height: 1.25;
}

.card-name :deep(mark) {
    font-weight: 700;
    background: rgba(229, 231, 235, 0.26);
    color: #f8fafc;
    border-radius: 3px;
    padding: 0 2px;
}

.card-relevance {
    min-width: 90px;
}

.card-relevance .relevance-bar {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 99px;
    height: 6px;
    overflow: hidden;
}

.card-relevance .relevance-fill {
    background: linear-gradient(90deg, #22c55e, #14b8a6);
    height: 100%;
}

.card-details {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    gap: 6px;
    opacity: 0.95;
    font-size: 0.80rem;
    color: #cbd5e1;
}

.card-details .detail-row,
.card-details .detail-chip {
    display: flex;
    justify-content: space-between;
    gap: 4px;
}

.detail-chip {
    background: rgba(148, 163, 184, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 999px;
    padding: 2px 6px;
}

.detail-chip .chip-label {
    font-weight: 600;
    color: #e2e8f0;
}

.detail-chip .chip-value {
    color: #f8fafc;
}

.card-relevance,
.card-details {
    opacity: 1;
}


/* Barra de estado */
.search-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: rgba(99, 102, 241, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.status-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.exact-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.7);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
}
.exact-toggle-btn.active {
    background: rgba(34,197,94,0.12);
    color: #86efac;
    border-color: rgba(34,197,94,0.18);
}

.close-dropdown-btn {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.65);
    width: 24px;
    height: 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.close-dropdown-btn:hover {
    color: #fff;
    background: rgba(248, 113, 113, 0.18);
    border-color: rgba(248, 113, 113, 0.35);
}

.inline-clear-filters {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.7);
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
}

.inline-clear-filters:hover {
    background: rgba(248, 113, 113, 0.12);
    color: #fff;
}

.filter-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
}

.filter-toggle-btn:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border-color: rgba(99, 102, 241, 0.2);
}

.filter-toggle-btn.active {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border-color: rgba(99, 102, 241, 0.3);
}

.filter-toggle-btn.has-filters {
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    border-color: rgba(99, 102, 241, 0.35);
}

.filter-badge {
    background: #6366f1;
    color: #fff;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
    line-height: 1.3;
}

/* ===== FILTROS PANEL ===== */
.filters-panel {
    padding: 10px 14px;
    background: rgba(99, 102, 241, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.filters-header-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.filters-title {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: rgba(255, 255, 255, 0.35);
}

.clear-filters-btn {
    background: none;
    border: none;
    color: #f87171;
    font-size: 0.68rem;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.15s;
    font-family: inherit;
}

.clear-filters-btn:hover {
    background: rgba(248, 113, 113, 0.1);
    color: #fca5a5;
}

.close-filters-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.68rem;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: all 0.15s;
    font-family: inherit;
}

.close-filters-btn:hover {
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, .25);
    background: rgba(255, 255, 255, .06);
}

.filter-group {
    margin-bottom: 8px;
}

.filter-group:last-child {
    margin-bottom: 0;
}

.filter-group-label {
    display: block;
    font-size: 0.64rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.25);
    margin-bottom: 5px;
}

.filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.filter-chips.scrollable {
    max-height: 72px;
    overflow-y: auto;
    padding-right: 4px;
}

.filter-chips.scrollable::-webkit-scrollbar {
    width: 3px;
}

.filter-chips.scrollable::-webkit-scrollbar-track {
    background: transparent;
}

.filter-chips.scrollable::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 10px;
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.68rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
    font-family: inherit;
    line-height: 1.3;
}

.filter-chip:hover {
    background: rgba(99, 102, 241, 0.08);
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(99, 102, 241, 0.15);
}

.filter-chip.selected {
    background: rgba(99, 102, 241, 0.2);
    color: #c7d2fe;
    border-color: rgba(99, 102, 241, 0.4);
    font-weight: 600;
}

.chip-tipo.selected {
    background: rgba(99, 102, 241, 0.22);
    border-color: #6366f1;
}

.chip-marca-filter.selected {
    background: rgba(56, 189, 248, 0.18);
    border-color: #38bdf8;
    color: #bae6fd;
}

.chip-ubi-filter.selected {
    background: rgba(251, 191, 36, 0.15);
    border-color: #fbbf24;
    color: #fde68a;
}

.chip-count {
    font-size: 0.58rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.04);
    padding: 0 4px;
    border-radius: 6px;
    min-width: 14px;
    text-align: center;
}

.filter-chip.selected .chip-count {
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.08);
}

/* Filter slide transition */
.filter-slide-enter-active {
    transition: all 0.2s ease-out;
}

.filter-slide-leave-active {
    transition: all 0.15s ease-in;
}

.filter-slide-enter-from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.filter-slide-enter-to {
    opacity: 1;
    max-height: 220px;
}

.filter-slide-leave-from {
    opacity: 1;
    max-height: 220px;
}

.filter-slide-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.result-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: #818cf8;
}

.search-hint {
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.28);
    letter-spacing: 0.3px;
}

/* Scroll container */
.results-scroll {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    padding: 6px;
}

.results-scroll::-webkit-scrollbar {
    width: 5px;
}

.results-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.results-scroll::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.25);
    border-radius: 10px;
}

/* ===== GROUP HEADER ===== */
.group-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px 4px;
    margin-top: 4px;
}

.group-header:first-child {
    margin-top: 0;
}

.group-icon {
    font-size: 0.8rem;
}

.group-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: rgba(255, 255, 255, 0.35);
}

.group-count {
    font-size: 0.65rem;
    font-weight: 600;
    color: #818cf8;
    background: rgba(99, 102, 241, 0.1);
    padding: 1px 6px;
    border-radius: 10px;
    margin-left: auto;
}

/* ===== RESULT CARD ===== */
.result-card {
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.1s, transform 0.08s;
    margin-bottom: 2px;
}

.result-card:hover,
.result-card.is-active {
    background: rgba(99, 102, 241, 0.08);
}

.result-card.is-active {
    box-shadow: inset 2px 0 0 #6366f1;
}

.card-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.card-icon {
    width: 20px;
    height: 20px;
    color: #6366f1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    flex-shrink: 0;
}

.card-name {
    flex: 1;
}

.card-name {
    font-weight: 600;
    font-size: 0.92rem;
    color: #111827;
    line-height: 1.35;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.card-name :deep(mark) {
    background: rgba(250, 204, 21, 0.25);
    color: #fde68a;
    padding: 0 1px;
    border-radius: 2px;
    font-weight: 700;
}

/* Barra de relevancia */
.card-relevance {
    flex-shrink: 0;
    width: 40px;
}

.relevance-bar {
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
}

.relevance-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #818cf8, #6366f1);
    transition: width 0.3s ease;
}

/* ===== DETAIL CHIPS ===== */
.card-details {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.detail-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 5px;
    font-size: 0.7rem;
    line-height: 1.3;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.detail-chip :deep(mark) {
    background: rgba(250, 204, 21, 0.2);
    color: #fde68a;
    padding: 0 1px;
    border-radius: 2px;
    font-weight: 600;
}

.chip-label {
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    flex-shrink: 0;
}

/* Colores específicos por tipo de chip */
.chip-marca {
    border-left: 2px solid #818cf8;
}

.chip-modelo {
    border-left: 2px solid #38bdf8;
}

.chip-serie {
    border-left: 2px solid #34d399;
}

.chip-inv {
    border-left: 2px solid #f472b6;
}

.chip-ref {
    border-left: 2px solid #fb923c;
}

.chip-clave {
    border-left: 2px solid #a78bfa;
}

.chip-ubi {
    border-left: 2px solid #fbbf24;
}

/* ===== NO RESULTS ===== */
.no-results {
    padding: 20px;
    text-align: center;
}

.no-results-icon {
    font-size: 2rem;
    margin-bottom: 8px;
    opacity: 0.5;
}

.no-results p {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.88rem;
    margin: 0 0 12px 0;
}

.no-results strong {
    color: rgba(255, 255, 255, 0.7);
}

.add-custom-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.06));
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.2);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.add-custom-btn:hover {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1));
    transform: translateY(-1px);
}

.add-icon {
    font-size: 1.1rem;
    font-weight: 700;
}

/* ===== FOOTER ===== */
.dropdown-footer {
    padding: 5px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.source-label {
    font-size: 0.62rem;
    color: rgba(255, 255, 255, 0.18);
    letter-spacing: 0.4px;
}

/* ===== TRANSITIONS ===== */
.smart-dropdown-enter-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.smart-dropdown-leave-active {
    transition: opacity 0.1s ease, transform 0.1s ease;
    pointer-events: none !important;
}

.smart-dropdown-enter-from {
    opacity: 0;
    transform: translateY(-6px);
}

.smart-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none !important;
}
</style>
