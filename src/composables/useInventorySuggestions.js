import { ref, computed } from 'vue'

export function useInventorySuggestions() {
    const equipoMedicoList = ref([])
    const insumosRefaccionesList = ref([])
    const allInventoryList = ref([])
    const loading = ref(false)
    const error = ref(null)

    const normalizeString = (value) => {
        if (value === null || value === undefined) return ''
        return String(value).trim()
    }

    const pickFirstValue = (item, keys = []) => {
        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                const raw = item[key]
                if (isValidFieldValue(raw)) return normalizeString(raw)
            }
        }
        return ''
    }

    const getTypeHint = (item) => {
        const hintKeys = [
            'TIPO', 'Tipo', 'tipo',
            'CATEGORIA', 'Categoría', 'Categoria', 'categoría', 'categoria',
            'CLASIFICACION', 'Clasificación', 'Clasificacion', 'clasificación', 'clasificacion',
            'RUBRO', 'Rubro', 'rubro',
            'SECCION', 'Sección', 'Seccion', 'sección', 'seccion',
            'FAMILIA', 'Familia', 'familia',
            'SUBCLASE', 'Subclase', 'subclase',
            'TIPO DE BIEN', 'Tipo de bien', 'tipo de bien'
        ]
        const hints = []
        hintKeys.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                const raw = item[key]
                if (isValidFieldValue(raw)) hints.push(normalizeString(raw))
            }
        })
        return hints.join(' | ').toLowerCase()
    }

    const inferItemType = (item, nombre = '') => {
        const haystack = `${getTypeHint(item)} ${normalizeString(nombre)}`.toLowerCase()
        if (!haystack) return 'unknown'
        if (/\b(equipo|mobiliario|instrumento|dispositivo)\b/.test(haystack)) return 'equipo'
        if (/\b(accesorio|accesorios|consumible|consumibles|refaccion|refacción|refacciones|insumo|insumos)\b/.test(haystack)) {
            return 'insumo'
        }
        return 'unknown'
    }

    const mapInventoryItem = (item) => {
        const nombre = pickFirstValue(item, [
            'Descripción del bien', 'Descripcion del bien', 'DESCRIPCION DEL BIEN', 'DESCRIPCIÓN DEL BIEN',
            'EQUIPO MEDICO', 'EQUIPO MÉDICO', 'Equipo medico', 'Equipo médico'
        ])
        const marca = pickFirstValue(item, ['MARCA', 'Marca', 'FABRICANTE', 'Fabricante'])
        const ubicacion = pickFirstValue(item, [
            'Ubicación', 'UBICACION', 'Ubicacion', 'UBICACIÓN',
            'UBICACION ESPECIFICA', 'Ubicación específica', 'Ubicacion especifica',
            'AREA', 'ÁREA', 'Area', 'Área'
        ]) || 'N/A'
        const modelo = pickFirstValue(item, ['MODELO', 'Modelo', 'MODELO / VERSIÓN', 'Modelo / Versión', 'Modelo / Version'])
        const serie = pickFirstValue(item, ['No. de Serie', 'No de Serie', 'NUMERO DE SERIE', 'NÚMERO DE SERIE', 'SERIE', 'Serie'])
        const lote = pickFirstValue(item, ['Lote', 'LOTE'])
        const referencia = pickFirstValue(item, ['REFERENCIA', 'Referencia', 'Codigo Ref', 'Código Ref', 'CODIGO REF', 'CÓDIGO REF'])
        const claveHRAEI = pickFirstValue(item, ['Clave  HRAEI', 'CLAVE HRAEI', 'Clave HRAEI', 'CLAVE  HRAEI'])
        const tipo = inferItemType(item, nombre)

        return {
            nombre,
            marca,
            ubicacion,
            modelo,
            serie,
            lote,
            referencia,
            claveHRAEI,
            tipo,
            label: `${nombre || 'Sin descripción'} - ${marca || 'Sin marca'} (${ubicacion || 'N/A'})`
        }
    }

    /**
     * Obtiene sugerencias de equipos médicos desde el inventario biomedica
     * Incluye TODOS los campos disponibles del inventario
     * NOTA: Carga todos los datos del API y el formulario filtra por tipo
     */
    async function fetchAllInventorySuggestions() {
        try {
            loading.value = true
            error.value = null
            const response = await fetch('/api/ops/stock-biomedica')

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()

            if (data.ok && Array.isArray(data.data)) {
                allInventoryList.value = data.data.map(mapInventoryItem)
                console.log(`[fetchAllInventorySuggestions] Cargados ${allInventoryList.value.length} registros`)
            }
        } catch (err) {
            console.error('[fetchAllInventorySuggestions] Error:', err)
            error.value = err.message
            allInventoryList.value = []
        } finally {
            loading.value = false
        }
    }

    /**
     * Obtiene sugerencias de insumos y refacciones desde el inventario biomedica
     * Incluye TODOS los campos disponibles del inventario
     * NOTA: Carga todos los datos del API y el formulario filtra por tipo
     */
    async function fetchEquipoMedicoSuggestions() {
        try {
            loading.value = true
            error.value = null
            const response = await fetch('/api/ops/equipos-medicos')

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()

            if (data.ok && Array.isArray(data.data)) {
                equipoMedicoList.value = data.data.map(item => {
                    return {
                        nombre: (item.nombre || '').trim(),
                        marca: (item.marca || '').trim(),
                        ubicacion: (item.ubicacion || '').trim() || 'N/A',
                        modelo: (item.modelo || '').trim(),
                        serie: (item.serie || '').trim(),
                        lote: (item.lote || '').trim(),
                        referencia: (item.referencia || '').trim(),
                        claveHRAEI: (item.claveHRAEI || '').trim(),
                        claveCNIS: (item.claveCNIS || '').trim(),
                        noInventario: (item.noInventario || '').trim(),
                        label: `${(item.nombre || 'Sin descripción').trim()} - ${(item.marca || 'Sin marca').trim()} (${(item.ubicacion || 'N/A').trim()})`
                    }
                })
                console.log(`[fetchEquipoMedicoSuggestions] Cargados ${equipoMedicoList.value.length} registros de historial_mantenimientos`)
            }
        } catch (err) {
            console.error('[fetchEquipoMedicoSuggestions] Error:', err)
            error.value = err.message
            equipoMedicoList.value = []
        } finally {
            loading.value = false
        }
    }

    async function fetchInsumosRefaccionesSuggestions() {
        if (!allInventoryList.value.length) {
            await fetchAllInventorySuggestions()
        }
        // Para insumos, devolver TODOS los items de stock-biomedica (accesorios, consumibles, refacciones)
        // No filtrar por tipo ya que esta tabla contiene específicamente estos tipos de items
        insumosRefaccionesList.value = allInventoryList.value
    }

    /**
     * Filtra sugerencias basadas en cualquier campo del item
     * Busca en: nombre, marca, ubicación, modelo, serie, lote, referencia
     */
    function filterSuggestions(list, searchText, fieldName = null) {
        if (!searchText) return list

        const query = searchText.toLowerCase()
        return list.filter(item => {
            // Si se especifica un campo, buscar solo en ese campo
            if (fieldName) {
                return item[fieldName] && item[fieldName].toLowerCase().includes(query)
            }
            // Sino, buscar en todos los campos principales
            return (
                (item.nombre && item.nombre.toLowerCase().includes(query)) ||
                (item.marca && item.marca.toLowerCase().includes(query)) ||
                (item.ubicacion && item.ubicacion.toLowerCase().includes(query)) ||
                (item.modelo && item.modelo.toLowerCase().includes(query)) ||
                (item.serie && item.serie.toLowerCase().includes(query)) ||
                (item.lote && item.lote.toLowerCase().includes(query)) ||
                (item.referencia && item.referencia.toLowerCase().includes(query)) ||
                (item.claveHRAEI && item.claveHRAEI.toLowerCase().includes(query)) ||
                (item.claveCNIS && item.claveCNIS.toLowerCase().includes(query)) ||
                (item.noInventario && item.noInventario.toLowerCase().includes(query))
            )
        })
    }

    /**
     * Obtiene sugerencias filtradas de equipos médicos
     * @param {string} searchText - Texto a buscar
     * @param {string} fieldName - Campo específico a filtrar (opcional)
     */
    function getFilteredEquipoMedicoSuggestions(searchText, fieldName = null) {
        return filterSuggestions(equipoMedicoList.value, searchText, fieldName)
    }

    /**
     * Obtiene sugerencias filtradas de insumos y refacciones
     * @param {string} searchText - Texto a buscar
     * @param {string} fieldName - Campo específico a filtrar (opcional)
     */
    function getFilteredInsumosRefaccionesSuggestions(searchText, fieldName = null) {
        return filterSuggestions(insumosRefaccionesList.value, searchText, fieldName)
    }

    /**
     * Obtiene sugerencias dinámicamente basadas en el tipo seleccionado
     */
    function getDynamicSuggestions(tipoSeleccionado, searchText, fieldName = null) {
        if (tipoSeleccionado === 'equipo-medico' || tipoSeleccionado === 'mobiliario') {
            return getFilteredEquipoMedicoSuggestions(searchText, fieldName)
        } else if (['accesorio', 'consumible', 'refaccion'].includes(tipoSeleccionado)) {
            return getFilteredInsumosRefaccionesSuggestions(searchText, fieldName)
        }
        return []
    }

    /**
     * FUNCIÓN CRÍTICA: Detecta si un valor del inventario es válido
     * Retorna TRUE solo si el campo tiene un VERDADERO dato
     * @param {*} valor - Valor a validar
     * @returns {boolean} true si es un dato válido, false si es vacío/N/A
     */
    function isValidFieldValue(valor) {
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

    /**
     * Rellena un objeto unidad con todos los campos disponibles de una sugerencia
     * Llena todos los campos: si el campo tiene valor válido, lo copia; si no, pone 'N/A'
     * Esto asegura que todos los campos estén completos con datos válidos
     * 
     * @param {Object} unidad - Objeto a rellenar (modifica in-place)
     * @param {Object} suggestion - Sugerencia con datos del inventario
     * @returns {Object} La unidad modificada
     */
    function fillUnitFromSuggestion(unidad, suggestion) {
        if (!suggestion || typeof unidad !== 'object') return unidad

        // Campos principales que siempre deben ser llenados
        const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']

        campos.forEach(campo => {
            const valor = suggestion[campo]

            // Usar la función de validación estricta
            if (isValidFieldValue(valor)) {
                // Si existe valor válido en la sugerencia, usar el valor (trimmed)
                const strValue = typeof valor === 'string' ? valor : valor.toString()
                unidad[campo] = strValue.trim()
            } else {
                // Si no hay valor válido, poner N/A
                unidad[campo] = 'N/A'
            }
        })

        return unidad
    }

    /**
     * Obtiene un resumen de qué campos están disponibles en una sugerencia
     * Útil para mostrar al usuario qué información tiene el equipo
     */
    function getSuggestionAvailableFields(suggestion) {
        if (!suggestion) return {}

        const campos = ['nombre', 'marca', 'ubicacion', 'modelo', 'serie', 'lote', 'referencia', 'claveHRAEI', 'claveCNIS', 'noInventario']
        const disponibles = {}

        campos.forEach(campo => {
            const valor = suggestion[campo]
            disponibles[campo] = valor && valor.toString().trim() !== '' && valor !== 'N/A'
        })

        return disponibles
    }

    // Cargar sugerencias al inicializar
    const initSuggestions = async () => {
        await Promise.all([
            fetchEquipoMedicoSuggestions(),
            fetchInsumosRefaccionesSuggestions()
        ])
    }

    return {
        equipoMedicoList,
        insumosRefaccionesList,
        loading,
        error,
        fetchAllInventorySuggestions,
        fetchEquipoMedicoSuggestions,
        fetchInsumosRefaccionesSuggestions,
        filterSuggestions,
        getFilteredEquipoMedicoSuggestions,
        getFilteredInsumosRefaccionesSuggestions,
        getDynamicSuggestions,
        fillUnitFromSuggestion,
        getSuggestionAvailableFields,
        isValidFieldValue,
        initSuggestions
    }
}
