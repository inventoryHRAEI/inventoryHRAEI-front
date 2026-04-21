<template>
    <div class="searchable-input-wrapper">
        <!-- Badge N/A opcional -->
        <div v-if="modelValue === 'N/A'" class="na-badge" title="Campo sin datos en el inventario">
            N/A
        </div>
        <div class="searchable-input-container">
            <input ref="inputRef" class="control searchable-input" :class="{ 'has-na': modelValue === 'N/A' }" type="text"
                :value="modelValue" :placeholder="placeholder" @input="handleInput" @focus="showDropdown = true"
                @blur="onBlur" @keydown.down="selectNextSuggestion" @keydown.up="selectPrevSuggestion"
                @keydown.enter="selectCurrentSuggestion" @keydown.escape="showDropdown = false" autocomplete="off" />
            
            <!-- Botón para borrar sugerencia -->
            <button v-if="modelValue && modelValue !== 'N/A'" 
                    class="clear-suggestion-btn" 
                    @click="clearSuggestion" 
                    type="button" 
                    title="Borrar sugerencia">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <!-- Dropdown de sugerencias -->
        <transition name="dropdown-fade">
            <div v-if="showDropdown && visibleSuggestions.length > 0" class="suggestions-dropdown">
                <div v-for="(suggestion, index) in visibleSuggestions" :key="index"
                    :class="['suggestion-item', { active: index === selectedIndex }]"
                    @click="selectSuggestion(suggestion)" @mouseenter="selectedIndex = index">
                    <div class="suggestion-content">
                        <div class="suggestion-main" v-html="highlightMatch(suggestion[fieldName] || suggestion.label, inputValue)"></div>
                        <div class="suggestion-details">
                            <!-- Mostrar campos disponibles como badges - Detectar correctamente si tienen valor -->
                            <span v-if="hasValidValue(suggestion.nombre) && fieldName !== 'nombre'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Nombre
                            </span>
                            <span v-if="hasValidValue(suggestion.marca) && fieldName !== 'marca'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Marca
                            </span>
                            <span v-if="hasValidValue(suggestion.modelo) && fieldName !== 'modelo'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Modelo
                            </span>
                            <span v-if="hasValidValue(suggestion.serie) && fieldName !== 'serie'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Serie
                            </span>
                            <span v-if="hasValidValue(suggestion.lote) && fieldName !== 'lote'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Lote
                            </span>
                            <span v-if="hasValidValue(suggestion.referencia) && fieldName !== 'referencia'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Ref
                            </span>
                            <span v-if="hasValidValue(suggestion.ubicacion) && fieldName !== 'ubicacion'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>{{ suggestion.ubicacion }}
                            </span>
                            <span v-if="hasValidValue(suggestion.claveHRAEI) && fieldName !== 'claveHRAEI'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>HRAEI
                            </span>
                            <span v-if="hasValidValue(suggestion.claveCNIS) && fieldName !== 'claveCNIS'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>CNIS
                            </span>
                            <span v-if="hasValidValue(suggestion.noInventario) && fieldName !== 'noInventario'"
                                class="detail-badge detail-available">
                                <span class="badge-dot" aria-hidden="true"></span>Inv
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Source hint -->
                <div class="suggestions-source" v-if="showDropdown">
                    <small>
                        <template v-if="tipo === 'equipo-medico' || tipo === 'mobiliario'">
                            Sugerencias desde historial de mantenimientos
                        </template>
                        <template v-else>
                            Sugerencias desde inventario (accesorios/consumibles/refacciones)
                        </template>
                    </small>
                </div>

                <!-- Opción para agregar valor personalizado -->
                <div v-if="inputValue && !filteredSuggestions.some(s => s[fieldName]?.toLowerCase() === inputValue.toLowerCase())"
                    class="suggestion-item add-custom">
                    <button type="button" class="add-custom-btn" @click="selectCustomValue">
                        <span class="add-icon">+</span>
                        Agregar "{{ inputValue }}"
                    </button>
                </div>
            </div>
        </transition>

        <!-- Mensaje cuando no hay sugerencias -->
        <transition name="dropdown-fade">
            <div v-if="showDropdown && inputValue && filteredSuggestions.length === 0" class="no-suggestions">
                <p>No hay sugerencias disponibles</p>
                <button type="button" class="add-custom-btn small" @click="selectCustomValue">
                    <span class="add-icon">+</span>
                    Agregar "{{ inputValue }}"
                </button>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    suggestions: {
        type: [Array, Function],
        default: () => []
    },
    placeholder: {
        type: String,
        default: 'Escriba para buscar...'
    },
    fieldName: {
        type: String,
        default: 'nombre'
    },
    searchKeys: {
        type: Array,
        default: () => ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario', 'label']
    },
    tipo: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref(null)
const inputValue = ref(props.modelValue)
const showDropdown = ref(false)
const selectedIndex = ref(-1)

// Función para detectar si un campo tiene un valor VÁLIDO
const hasValidValue = (valor) => {
    // Si es null/undefined/false
    if (!valor) return false

    // Convertir a string y limpiar
    const strValue = typeof valor === 'string' ? valor : valor.toString()
    const cleaned = strValue.trim()

    // Vacío después de limpiar
    if (cleaned === '') return false

    // Es "N/A" (en cualquier caso)
    if (cleaned.toUpperCase() === 'N/A') return false

    // Solo ceros o guiones (no son datos válidos)
    if (/^[-_0]*$/.test(cleaned)) return false

    // Es un verdadero dato
    return true
}

// Función para resaltar texto que coincide
const highlightMatch = (text, query) => {
    if (!query || !text) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
}

// Filtrar sugerencias basadas en el input y el campo específico
const filteredSuggestions = computed(() => {
    // Obtener la lista base de sugerencias
    let baseSuggestions = []
    if (typeof props.suggestions === 'function') {
        baseSuggestions = props.suggestions(props.tipo, inputValue.value, props.fieldName)
    } else {
        baseSuggestions = props.suggestions || []
    }

    if (!inputValue.value.trim()) {
        // Sin texto: mostrar los primeros 50 para mejor rendimiento
        return baseSuggestions.slice(0, 50)
    }

    const query = inputValue.value.toLowerCase()
    
    // Filtrar y priorizar: primero coincidencias exactas en el campo actual
    const filtered = baseSuggestions.filter(item => {
        const fieldValue = item[props.fieldName]
        if (fieldValue && String(fieldValue).toLowerCase().includes(query)) return true
        return (props.searchKeys || []).some((key) => {
            const value = item[key]
            return value && String(value).toLowerCase().includes(query)
        })
    })
    
    // Ordenar: primero coincidencias que EMPIEZAN con el query (mayor prioridad)
    const sorted = filtered.sort((a, b) => {
        const aVal = (a[props.fieldName] || '').toString().toLowerCase()
        const bVal = (b[props.fieldName] || '').toString().toLowerCase()
        const aStarts = aVal.startsWith(query)
        const bStarts = bVal.startsWith(query)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return 0
    })
    
    // Limitar a 100 resultados para rendimiento
    return sorted.slice(0, 100)
})

// Mostrar TODAS las sugerencias (sin límite)
const visibleSuggestions = computed(() => {
    return filteredSuggestions.value
})

// Watch para sincronizar con el prop modelValue
watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal
})

const handleInput = (event) => {
    inputValue.value = event.target.value
    emit('update:modelValue', inputValue.value)
    selectedIndex.value = -1
    showDropdown.value = true
}

const selectSuggestion = (suggestion) => {
    const fieldValue = suggestion[props.fieldName] || suggestion.label || ''
    inputValue.value = fieldValue
    emit('update:modelValue', fieldValue)
    emit('select', suggestion)
    showDropdown.value = false
    selectedIndex.value = -1
}

const selectCustomValue = () => {
    // Crear un objeto personalizado con solo el valor ingresado
    const customSuggestion = {
        [props.fieldName]: inputValue.value,
        label: inputValue.value
    }
    selectSuggestion(customSuggestion)
}

const selectCurrentSuggestion = () => {
    if (selectedIndex.value >= 0 && visibleSuggestions.value[selectedIndex.value]) {
        selectSuggestion(visibleSuggestions.value[selectedIndex.value])
    } else if (inputValue.value && !filteredSuggestions.value.some(s => s[props.fieldName]?.toLowerCase() === inputValue.value.toLowerCase())) {
        // Si no hay sugerencia coincidente, permitir agregar personalizado
        selectCustomValue()
    }
}

const selectNextSuggestion = () => {
    if (visibleSuggestions.value.length > 0) {
        selectedIndex.value = Math.min(selectedIndex.value + 1, visibleSuggestions.value.length - 1)
    }
}

const selectPrevSuggestion = () => {
    if (selectedIndex.value > 0) {
        selectedIndex.value--
    }
}

const onBlur = () => {
    // Delay para permitir que se registre el click en sugerencia
    setTimeout(() => {
        showDropdown.value = false
    }, 200)
}

const clearSuggestion = () => {
    inputValue.value = ''
    emit('update:modelValue', '')
    showDropdown.value = false
    selectedIndex.value = -1
    // Enfocar el input después de borrar
    nextTick(() => {
        inputRef.value?.focus()
    })
}
</script>

<style scoped>
.searchable-input-wrapper {
    position: relative;
    width: 100%;
}

.searchable-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.na-badge {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    background: #fecaca;
    color: #991b1b;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.searchable-input {
    width: 100%;
    padding: 8px 40px 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.95rem;
    background: #fff;
    color: #1e293b;
    transition: all 0.2s;
    font-family: inherit;
}

.searchable-input.has-na {
    padding-right: 50px;
    color: #dc2626;
    font-weight: 500;
    background: #fef2f2;
    border-color: #fecaca;
}

.searchable-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: #f8fafc;
}

.searchable-input.has-na:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Estilo especial para valores N/A */
.searchable-input[data-placeholder*="N/A"],
.searchable-input:placeholder-shown {
    color: #94a3b8;
    font-style: italic;
}

.searchable-input::placeholder {
    color: #94a3b8;
}

.clear-suggestion-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 5;
}

.clear-suggestion-btn:hover {
    background: #f1f5f9;
    color: #334155;
}

.clear-suggestion-btn:active {
    background: #e2e8f0;
    transform: translateY(-50%) scale(0.95);
}

.suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-top: none;
    border-radius: 0 0 6px 6px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
    background: #f0f4f8;
}

.suggestion-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.suggestion-main {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
}

.suggestion-main :deep(mark) {
    background: #fef08a;
    color: #1e293b;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 700;
}

.suggestion-details {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.detail-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #e0f2fe;
    color: #0369a1;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
}

.detail-available {
    background: #dcfce7;
    color: #166534;
    font-weight: 600;
}

.badge-icon {
    font-size: 0.85rem;
    display: inline-block;
}

.no-suggestions {
    padding: 12px;
    text-align: center;
    border: 1px solid #cbd5e1;
    border-top: none;
    border-radius: 0 0 6px 6px;
    background: #f8fafc;
}

.no-suggestions p {
    margin: 0 0 8px 0;
    color: #64748b;
    font-size: 0.9rem;
}

.add-custom-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #10b981;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.add-custom-btn:hover {
    background: #059669;
    transform: scale(1.02);
}

.add-custom-btn.small {
    width: 100%;
    justify-content: center;
}

.add-custom {
    padding: 8px 12px;
    background: #f0fdf4;
}

.add-icon {
    font-weight: bold;
    font-size: 1.1rem;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.15s, transform 0.15s;
}

.suggestions-source {
    padding: 6px 10px;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.55);
    border-top: 1px solid rgba(255,255,255,0.03);
    margin-top: 6px;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Scroll personalizado para dropdown */
.suggestions-dropdown {
    background: #0f1724;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 10px 40px rgba(2,6,23,0.6);
}

.suggestion-item {
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s, transform 0.08s;
}

.suggestion-item:hover,
.suggestion-item.active {
    background: rgba(59,130,246,0.06);
}

.suggestion-main {
    font-weight: 600;
    color: #e6eef8;
    font-size: 0.95rem;
}

.suggestion-details {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 6px;
}

.detail-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.75);
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
}

.detail-available {
    background: rgba(34,197,94,0.06);
    color: #86efac;
}

.badge-dot {
    width: 8px;
    height: 8px;
    background: rgba(99,102,241,0.9);
    border-radius: 50%;
    display: inline-block;
}

.no-suggestions {
    padding: 12px;
    text-align: center;
    background: transparent;
    border-radius: 8px;
}

.no-suggestions p {
    margin: 0 0 8px 0;
    color: rgba(255,255,255,0.55);
    font-size: 0.95rem;
}

.add-custom-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(59,130,246,0.14), rgba(99,102,241,0.06));
    color: #e6eef8;
    border: 1px solid rgba(59,130,246,0.22);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.12s;
}

.add-custom-btn:hover {
    transform: translateY(-1px);
}

/* Scroll personalizado para dropdown */
.suggestions-dropdown::-webkit-scrollbar {
    width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
    background: transparent;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.4);
    border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
    background: rgba(148,163,184,0.6);
}
</style>
