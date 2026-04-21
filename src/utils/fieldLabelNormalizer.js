/**
 * fieldLabelNormalizer.js
 * 
 * Utilities para normalizar y categorizar labels de campos
 * Convierte OBSERVACIONES_AGOS -> "Observaciones - Agosto"
 * Agrupa campos por categoría automáticamente
 */

/**
 * Normaliza un nombre de campo a un label legible
 * @param {string} fieldName - Nombre crudo del campo (ej: "OBSERVACIONES_AGOS")
 * @returns {string} Label normalizado (ej: "Observaciones - Agosto")
 */
export function normalizeFieldLabel(fieldName) {
  if (!fieldName) return fieldName

  // Mapeo explícito para campos conocidos
  const explicitMappings = {
    // Campos básicos
    'EQUIPO_MEDICO': 'Equipo Médico',
    'EQUIPO MEDICO': 'Equipo Médico',
    'NUMERO_DE_SERIE': 'Número de Serie',
    'NUMERO DE SERIE': 'Número de Serie',
    'CONDICION': 'Condición',
    'CONDICIONES DEL EQUIPO': 'Condiciones del Equipo',
    'FUNCIONAL SI NO': 'Funcional',
    'CAUSA': 'Causa',
    'GARANTIA SI NO': 'Tiene Garantía',
    'FIN DE GARANTIA DD MM AAAA': 'Fin de Garantía',
    'UNIDAD MEDICA': 'Unidad Médica',
    'ESPECIALIDAD AREA DEL HOSPITAL': 'Especialidad / Área',
    'TIPO DE MANTENIMIENTO': 'Tipo de Mantenimiento',
    'ULTIMO MP DD MM AAAA': 'Último Mantenimiento',
    'CANTIDAD DE MP AL AÑO': 'Mantenimientos por Año',
    'ORIGEN DEL BIEN': 'Origen del Bien',
    'AÑO DE FABRICACIÓN': 'Año de Fabricación',
    'FECHA DE INSTALACIÓN': 'Fecha de Instalación',
    'AREA EN LA QUE SE ENTREGO': 'Área de Entrega',

    // Levantamiento
    'ESTATUS LEVANTAMIENTO': 'Estatus de Levantamiento',
    'TIPO DE FALLA LEVANTAMIENTO': 'Tipo de Falla',
    'OBSERVACIONES LEVANTAMIENTO': 'Observaciones del Levantamiento',
    'ACCESORIOS LEVANTAMIENTO': 'Accesorios Detectados',
    'REFACCIONES LEVANTAMIENTO': 'Refacciones Necesarias',
    'CONSUMIBLES LEVANTAMIENTO': 'Consumibles Necesarios',
  }

  if (explicitMappings[fieldName]) {
    return explicitMappings[fieldName]
  }

  // Patrones automáticos para campos dinámicos
  // Observaciones mensuales
  const monthMap = {
    'AGOS': 'Agosto',
    'SEPT': 'Septiembre',
    'OCT': 'Octubre',
    'NOV': 'Noviembre'
  }

  // Observaciones mensuales: OBSERVACIONES_AGOS -> "Observaciones - Agosto"
  const observationMatch = fieldName.match(/^OBSERVACIONES[_\s]+(AGOS|SEPT|OCT|NOV)$/)
  if (observationMatch) {
    const monthShort = observationMatch[1]
    return `Observaciones - ${monthMap[monthShort]}`
  }

  // Estatus mensuales: ESTATUS_AGOS -> "Estatus - Agosto"
  const statusMatch = fieldName.match(/^ESTATUS[_\s]+(AGOS|SEPT|OCT|NOV)$/)
  if (statusMatch) {
    const monthShort = statusMatch[1]
    return `Estatus - ${monthMap[monthShort]}`
  }

  // MP (Mantenimiento Preventivo) mensuales: MP AGOSTO -> "MP - Agosto"
  const mpMatch = fieldName.match(/^MP[_\s]+(AGOS|SEPT|OCT|NOV)$/)
  if (mpMatch) {
    const monthShort = mpMatch[1]
    return `Mantenimiento Preventivo - ${monthMap[monthShort]}`
  }

  // Refacciones dinámicas: REFACCION_ACCESORIO_CONSUMIBLE_PTRABAJO1 -> "Refacción #1"
  const refaccionMatch = fieldName.match(/^REFACCION_ACCESORIO_CONSUMIBLE_PTRABAJO(\d+)$/)
  if (refaccionMatch) {
    const num = refaccionMatch[1]
    return `Refacción/Accesorio/Consumible #${num}`
  }

  // Cantidad de refacciones: CANT_REFAC_ACCES_CONS_PTRABAJO1 -> "Cantidad Refacción #1"
  const cantMatch = fieldName.match(/^CANT_REFAC_ACCES_CONS_PTRABAJO(\d+)$/)
  if (cantMatch) {
    const num = cantMatch[1]
    return `Cantidad Refacción #${num}`
  }

  // Conversión genérica: NOMBRE_CAMPO -> "Nombre Campo"
  return fieldName
    .replace(/_/g, ' ')
    .replace(/DD MM AAAA/gi, '(DD/MM/AAAA)')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Categoriza campos automáticamente por su nombre
 * @param {string} fieldName - Nombre del campo
 * @returns {string} Categoría del campo
 */
export function categorizeField(fieldName) {
  if (!fieldName) return 'Otros'

  fieldName = fieldName.toUpperCase()

  // Información básica
  if (fieldName.match(/^(EQUIPO|MARCA|MODELO|SERIAL|NUMERO)/)) return 'Información Básica'
  
  // Ubicación
  if (fieldName.match(/^(UBICACION|UNIDAD|AREA|ESPECIALIDAD)/)) return 'Ubicación'
  
  // Condición y estado
  if (fieldName.match(/^(CONDICION|FUNCIONAL|CAUSA|ESTATUS(?!_)|GARANTIA|FIN DE)/)) return 'Condición y Estado'
  
  // Mantenimiento
  if (fieldName.match(/^(TIPO DE MANTENIMIENTO|ULTIMO MP|CANTIDAD DE MP|MP\s+)/)) return 'Mantenimiento'
  
  // Observaciones mensuales
  if (fieldName.match(/^(OBSERVACIONES|ESTATUS)[_\s]+(AGOS|SEPT|OCT|NOV)/)) return 'Registros Mensuales'
  
  // Levantamiento
  if (fieldName.match(/LEVANTAMIENTO/)) return 'Levantamiento'
  
  // Refacciones
  if (fieldName.match(/^(REFACCION|CANT_REFAC|ACCESORIOS|CONSUMIBLES)/)) return 'Refacciones y Accesorios'
  
  // Información general
  if (fieldName.match(/^(LOTE|REFERENCIA|AÑO DE|FECHA|ORIGEN|CLUES|DESCRIPCION)/)) return 'Información General'
  
  return 'Otros'
}

/**
 * Agrupa campos por categoría
 * @param {Array<string>} fieldNames - Array de nombres de campos
 * @returns {Object} { categoryName: [fieldName, ...], ... }
 */
export function groupFieldsByCategory(fieldNames) {
  const grouped = {}

  fieldNames.forEach(fieldName => {
    const category = categorizeField(fieldName)
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(fieldName)
  })

  // Ordenar categorías en orden lógico
  const categoryOrder = [
    'Información Básica',
    'Ubicación',
    'Condición y Estado',
    'Mantenimiento',
    'Registros Mensuales',
    'Levantamiento',
    'Refacciones y Accesorios',
    'Información General',
    'Otros'
  ]

  const ordered = {}
  categoryOrder.forEach(cat => {
    if (grouped[cat]) {
      ordered[cat] = grouped[cat]
    }
  })

  return ordered
}

/**
 * Obtiene el orden recomendado de categorías
 * @returns {Array<string>}
 */
export function getCategoryOrder() {
  return [
    'Información Básica',
    'Ubicación',
    'Condición y Estado',
    'Mantenimiento',
    'Registros Mensuales',
    'Levantamiento',
    'Refacciones y Accesorios',
    'Información General',
    'Otros'
  ]
}

/**
 * Obtiene un color badge para una categoría
 * @param {string} category - Nombre de la categoría
 * @returns {string} Clase CSS para el color
 */
export function getCategoryBadgeClass(category) {
  const colorMap = {
    'Información Básica': 'badge-blue',
    'Ubicación': 'badge-green',
    'Condición y Estado': 'badge-amber',
    'Mantenimiento': 'badge-purple',
    'Registros Mensuales': 'badge-cyan',
    'Levantamiento': 'badge-orange',
    'Refacciones y Accesorios': 'badge-pink',
    'Información General': 'badge-slate',
    'Otros': 'badge-gray'
  }
  return colorMap[category] || 'badge-gray'
}
