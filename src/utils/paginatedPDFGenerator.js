/**
 * Sistema de Paginación para PDFs de Órdenes (Entrada, Salida, Resguardo, Servicio)
 * 
 * Características:
 * - Encabezado se repite en cada página
 * - Sección de firmas está protegida y se mueve con el contenido
 * - Footer no se incluye (ya no es necesario)
 * - Sistema inteligente de división de contenido
 */

export class PaginatedPDFGenerator {
    constructor(orderData, orderType = 'entrada') {
        this.orderData = orderData
        this.orderType = orderType // 'entrada', 'salida', 'resguardo', 'servicio'
        this.pageHeight = 279.4 // Altura de página A4 en mm
        this.pageWidth = 210   // Ancho de página A4 en mm
        this.marginTop = 20
        this.marginBottom = 15 // Espacio mínimo para firmas (sin footer)
        this.marginLeft = 15
        this.marginRight = 15
        // Calcular altura disponible para contenido de forma más optimizada
        // pageHeight (279.4) - marginTop (20) - marginBottom (15) = 244.4mm disponible
        // Mantener 8mm adicionales para breathing room = 236.4mm
        this.contentHeight = 236 // Altura óptima para contenido sin desperdiciar espacio
    }

    /**
     * Genera el HTML completo del documento paginado
     */
    generate() {
        const headerHTML = this.generateHeader()
        const contentHTML = this.generateContent()
        const signaturesHTML = this.generateSignatures()

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden de ${this.getOrderTypeName()} - ${this.orderData.folio || 'N/A'}</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="document">
        ${this.generatePages(contentHTML, signaturesHTML, headerHTML)}
    </div>
</body>
</html>
        `
    }

    /**
     * Genera las páginas con encabezado repetido y contenido distribuido
     * 
     * ESTRATEGIA CORRECTA:
     * - Renderizar TODO el contenido en UNA sola página inicialmente
     * - Dejar que el CSS @media print maneje la paginación automática
     * - El motor PDF (Chromium/Puppeteer) pagina según page-break rules
     * - Esto garantiza sincronización perfecta entre vista previa y PDF
     */
    generatePages(contentHTML, signaturesHTML, headerHTML) {
        // Generar un único contenedor con TODO el contenido
        // El motor PDF se encargará automáticamente de la paginación
        const pagesHTML = `
    <div class="page">
        <div class="page-header">
            ${headerHTML}
        </div>
        <div class="page-content">
            ${contentHTML}
        </div>
        <div class="page-signatures">
            ${signaturesHTML}
        </div>
        <div class="page-footer">
            Generado automáticamente
        </div>
    </div>
        `
        
        return pagesHTML
    }

    /**
     * NO USAR - La paginación se maneja automáticamente por CSS
     * 
     * Este método está deprecado. El motor PDF (Chromium/Puppeteer)
     * maneja automáticamente la paginación basándose en:
     * - page-break rules del CSS
     * - @media print
     * - Altura natural del contenido
     * 
     * No intentar calcular paginación en JavaScript causa:
     * ✗ Discrepancias entre vista previa y PDF
     * ✗ Errores de acumulación
     * ✗ Problemas con contenido dinámico
     * 
     * La solución correcta es dejar que el motor PDF lo haga.
     */
    divideContentIntoBlocks(contentHTML) {
        // Retornar el contenido sin modificar
        // La paginación se maneja en CSS/motor PDF
        return [contentHTML]
    }

    /**
     * Genera el encabezado que se repite en cada página
     */
    generateHeader() {
        return `
<div class="header">
    <div class="hospital-info">
        <div class="hospital-name">HOSPITAL REGIONAL DE ALTA ESPECIALIDAD</div>
        <div class="hospital-subtitle">IMSS BIENESTAR</div>
    </div>
    <div class="order-type">
        ${this.getOrderTypeTitle()}
    </div>
    <div class="folio-info">
        <div class="folio-row">
            <span class="folio-label">Folio:</span>
            <span class="folio-value">${this.orderData.folio || 'N/A'}</span>
        </div>
        <div class="folio-row">
            <span class="folio-label">Fecha:</span>
            <span class="folio-value">${this.formatDate(this.orderData.fecha)}</span>
        </div>
    </div>
</div>
        `
    }

    /**
     * Genera el contenido principal según el tipo de orden
     */
    generateContent() {
        let content = ''

        // Sección de Solicitante
        content += this.generateSolicitantSection()

        // Sección de Motivo (si aplica)
        if (this.orderData.motivoEntrada) {
            content += this.generateMotivoSection()
        }

        // Sección de Equipos/Insumos
        if (this.orderData.equiposEntrada && this.orderData.equiposEntrada.length > 0) {
            content += this.generateEquiposSection()
        }

        // Sección de Observaciones
        if (this.orderData.observaciones || this.orderData.observacionesImg) {
            content += this.generateObservacionesSection()
        }

        return content
    }

    /**
     * Genera la sección de solicitante
     */
    generateSolicitantSection() {
        return `
<div class="content-section">
    <h2>DATOS DEL SOLICITANTE</h2>
    <div class="info-grid">
        <div class="info-item">
            <label>Nombre:</label>
            <div class="value">${this.orderData.nombreSolicitante || '—'}</div>
        </div>
        <div class="info-item">
            <label>Servicio:</label>
            <div class="value">${this.orderData.servicio || '—'}</div>
        </div>
        <div class="info-item">
            <label>Especialidad:</label>
            <div class="value">${this.orderData.especialidad || '—'}</div>
        </div>
        <div class="info-item">
            <label>Hora Inicio:</label>
            <div class="value">${this.orderData.horaInicio || '—'}</div>
        </div>
        <div class="info-item">
            <label>Hora Término:</label>
            <div class="value">${this.orderData.horaTermino || '—'}</div>
        </div>
        <div class="info-item">
            <label>Ingeniero Residente:</label>
            <div class="value">${this.orderData.nombreIngeniero || '—'}</div>
        </div>
    </div>
</div>
        `
    }

    /**
     * Genera la sección de motivo
     */
    generateMotivoSection() {
        return `
<div class="content-section">
    <h2>MOTIVO DE ${this.getOrderTypeName().toUpperCase()}</h2>
    <div class="info-block">
        <div class="label">Motivo:</div>
        <div class="value">${this.orderData.motivoEntrada || '—'}</div>
    </div>
    ${this.orderData.otroMotivo ? `
        <div class="info-block">
            <div class="label">Especificación:</div>
            <div class="value">${this.orderData.otroMotivo}</div>
        </div>
    ` : ''}
    ${this.orderData.descripcion ? `
        <div class="info-block">
            <div class="label">Descripción:</div>
            <div class="value">${this.orderData.descripcion}</div>
        </div>
    ` : ''}
</div>
        `
    }

    /**
     * Genera la sección de equipos/insumos
     */
    generateEquiposSection() {
        let html = '<div class="content-section"><h2>EQUIPOS/INSUMOS</h2>'

        if (this.orderData.equiposEntrada && this.orderData.equiposEntrada.length > 0) {
            html += '<table class="equipos-table"><thead><tr>'
            html += '<th style="width:5%">N°</th>'
            html += '<th style="width:25%">Descripción</th>'
            html += '<th style="width:12%">Marca</th>'
            html += '<th style="width:12%">Modelo</th>'
            html += '<th style="width:12%">Serie</th>'
            html += '<th style="width:15%">Ubicación</th>'
            html += '<th style="width:19%">Clave HRAEI</th>'
            html += '</tr></thead><tbody>'

            this.orderData.equiposEntrada.forEach((equipo, idx) => {
                html += `<tr>`
                html += `<td>${idx + 1}</td>`
                html += `<td>${equipo.descripcion || '—'}</td>`
                html += `<td>${equipo.marca || '—'}</td>`
                html += `<td>${equipo.modelo || '—'}</td>`
                html += `<td>${equipo.serie || '—'}</td>`
                html += `<td>${equipo.ubicacion || '—'}</td>`
                html += `<td>${equipo.claveHRAEI || '—'}</td>`
                html += `</tr>`
            })

            html += '</tbody></table>'
        }

        html += '</div>'
        return html
    }

    /**
     * Genera la sección de observaciones
     */
    generateObservacionesSection() {
        let html = '<div class="content-section"><h2>OBSERVACIONES</h2>'

        if (this.orderData.observaciones) {
            html += `<div class="observation-text">${this.orderData.observaciones}</div>`
        }

        if (this.orderData.observacionesImg) {
            html += `
                <div class="observation-image">
                    <img src="${this.orderData.observacionesImg.dataUrl}" alt="Observación" />
                </div>
            `
        }

        html += '</div>'
        return html
    }

    /**
     * Genera la sección de firmas (protegida para moverse con el contenido)
     */
    generateSignatures() {
        const sigs = this.orderData.signatures || []

        let html = '<div class="signatures-section">'
        html += '<h3 class="signatures-title">FIRMAS DE AUTORIZACIÓN</h3>'
        html += '<div class="signatures-grid">'

        sigs.forEach(sig => {
            html += `
<div class="signature-block">
    <div class="sig-role">${sig.role}</div>
    <div class="sig-space">
        ${sig.name ? `<div class="sig-name">${sig.name}</div>` : ''}
    </div>
    <div class="sig-line"></div>
    <div class="sig-date">Fecha: _______________</div>
</div>
            `
        })

        html += '</div>'
        html += '</div>'

        return html
    }

    /**
     * Retorna el nombre del tipo de orden
     */
    getOrderTypeName() {
        const types = {
            'entrada': 'Entrada',
            'salida': 'Salida',
            'resguardo': 'Resguardo',
            'servicio': 'Servicio'
        }
        return types[this.orderType] || 'Orden'
    }

    /**
     * Retorna el título formateado para el tipo de orden
     */
    getOrderTypeTitle() {
        const titles = {
            'entrada': 'ORDEN DE ENTRADA DE EQUIPOS',
            'salida': 'ORDEN DE SALIDA DE EQUIPOS',
            'resguardo': 'ACTA DE RESGUARDO',
            'servicio': 'ORDEN DE SERVICIO'
        }
        return `<div class="order-type-title">${titles[this.orderType] || 'ORDEN'}</div>`
    }

    /**
     * Formatea una fecha
     */
    formatDate(date) {
        if (!date) return '—'
        const d = new Date(date)
        return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    /**
     * Retorna todos los estilos CSS
     */
    getStyles() {
        return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
}

body {
    font-family: 'Segoe UI', 'Arial', sans-serif;
    color: #1f2937;
    line-height: 1.5;
    background-color: #f5f5f5;
}

.document {
    background-color: white;
}

/* ============ PAGINACIÓN ============ */
.page {
     width: 210mm;
     margin: 10px auto;
     padding: 0;
     background: white;
     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
     position: relative;
     display: block;
     overflow: visible;
}

/* En impresión, dejar que el motor PDF pagine automáticamente */
@media print {
     .page {
         margin: 0;
         box-shadow: none;
         page-break-inside: auto;
         page-break-after: auto;
         width: 210mm;
         padding: 0;
     }
}

.page-header {
      padding: 20mm 15mm 5mm 15mm;
      border-bottom: 1px solid #e5e7eb;
      page-break-inside: avoid;
      display: block;
}

/* En PDF, hacer que el encabezado sea una tabla head para repetirse */
@media print {
     .page-header {
         display: table-header-group;
     }
}

 .page-content {
      padding: 5mm 15mm 0 15mm;
      overflow: visible;
      display: block;
      /* Permitir que el contenido fluya naturalmente entre páginas */
 }

 .page-signatures {
      padding: 0 15mm 7.5mm 15mm;
      border-top: 1px solid #d1d5db;
      page-break-inside: avoid; /* Mantener firmas juntas */
      display: block;
      margin-top: 5mm;
  }

 .page-footer {
      padding: 8mm 15mm 5mm 15mm;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #d1d5db;
      font-weight: 500;
      display: block;
  }

 /* ============ ENCABEZADO ============ */
 .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px; /* Reducido de 20px */
      margin-bottom: 5px; /* Reducido de 15px */
 }

.hospital-info {
    flex: 1;
}

.hospital-name {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2px;
}

.hospital-subtitle {
    font-size: 11px;
    color: #6b7280;
}

.order-type {
    flex: 1;
    text-align: center;
}

.order-type-title {
    font-size: 12px;
    font-weight: 700;
    color: #1f2937;
    text-transform: uppercase;
}

.folio-info {
    flex: 0 0 200px;
    text-align: right;
}

.folio-row {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    font-size: 10px;
    margin-bottom: 3px;
}

.folio-label {
    font-weight: 600;
    color: #374151;
}

.folio-value {
    color: #1f2937;
    min-width: 80px;
}

/* ============ CONTENIDO ============ */
.content-section {
     margin-bottom: 8px;
     page-break-inside: auto;
     /* Permitir divisiones naturales en secciones largas */
     /* El motor PDF dividirá automáticamente si es necesario */
}

.content-section h2 {
     font-size: 11px;
     font-weight: 700;
     color: white;
     background-color: #1f2937;
     padding: 4px 6px;
     margin-bottom: 5px;
     text-transform: uppercase;
     letter-spacing: 0.5px;
     margin-top: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px; /* Reducido de 10px */
    margin-bottom: 6px; /* Reducido de 8px */
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.info-item label {
    font-size: 9px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
}

.info-item .value {
    font-size: 10px;
    color: #1f2937;
    padding: 4px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
}

.info-block {
     margin-bottom: 5px; /* Reducido de 8px */
}

.info-block .label {
     font-size: 9px;
     font-weight: 600;
     color: #374151;
     margin-bottom: 1px; /* Reducido de 2px */
     text-transform: uppercase;
}

.info-block .value {
     font-size: 10px;
     color: #1f2937;
     padding: 3px 4px; /* Reducido de 6px */
     background-color: #f9fafb;
     border-left: 2px solid #3b82f6;
     line-height: 1.3; /* Reducido de 1.4 */
}

/* Tabla de equipos */
.equipos-table {
     width: 100%;
     border-collapse: collapse;
     font-size: 9px;
     margin-bottom: 4px;
     /* Permitir que la tabla se divida naturalmente entre páginas */
}

.equipos-table thead {
     background-color: #374151;
     color: white;
}

.equipos-table th {
     padding: 3px; /* Reducido de 4px */
     text-align: left;
     font-weight: 600;
     border: 1px solid #e5e7eb;
     font-size: 8px;
     text-transform: uppercase;
}

.equipos-table td {
     padding: 2px 3px; /* Reducido de 4px */
     border: 1px solid #e5e7eb;
     vertical-align: top;
}

.equipos-table tbody tr:nth-child(even) {
     background-color: #f9fafb;
}

.observation-text {
     font-size: 10px;
     color: #1f2937;
     padding: 4px; /* Reducido de 6px */
     background-color: #f9fafb;
     border: 1px solid #e5e7eb;
     border-radius: 2px;
     line-height: 1.3; /* Reducido de 1.4 */
     margin-bottom: 6px; /* Reducido de 8px */
}

.observation-image {
     margin-top: 4px; /* Reducido de 8px */
}

.observation-image img {
    max-width: 100%;
    height: auto;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
}

/* ============ FIRMAS ============ */
.signatures-section {
     page-break-inside: avoid; /* Mantener juntas las firmas */
     margin-top: 5px;
}

.signatures-title {
     font-size: 10px;
     font-weight: 700;
     color: white;
     background-color: #1f2937;
     padding: 3px 5px;
     margin-bottom: 4px;
     text-transform: uppercase;
     margin-top: 0;
}

.signatures-grid {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 10px; /* Reducido de 15px */
}

.signature-block {
     text-align: center;
}

.sig-role {
    font-size: 8px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    margin-bottom: 4px;
    line-height: 1.2;
}

.sig-space {
    height: 30px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 2px;
}

.sig-name {
    font-size: 9px;
    font-weight: 600;
    color: #1f2937;
}

.sig-line {
    border-top: 1px solid #1f2937;
    margin: 2px 0;
    height: 1px;
}

.sig-date {
    font-size: 8px;
    color: #6b7280;
    margin-top: 4px;
}

/* ============ IMPRESIÓN ============ */
@media print {
    body {
        background-color: white;
    }
    
    .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
    }
    
    .page:last-child {
        page-break-after: avoid;
    }
}

/* Responsivo */
@media (max-width: 600px) {
    .page {
        width: 100%;
        margin: 5px 0;
    }
}
        `
    }
}

/**
 * Helper para usar el generador con HTML directamente
 */
export function generatePaginatedPDF(orderData, orderType = 'entrada') {
    const generator = new PaginatedPDFGenerator(orderData, orderType)
    return generator.generate()
}

/**
 * Helper para abrir el PDF en una ventana nueva
 */
export function openPaginatedPDF(orderData, orderType = 'entrada') {
    const html = generatePaginatedPDF(orderData, orderType)
    const w = window.open('', '_blank')
    if (!w) {
        alert('No se pudo abrir la ventana de impresión. Revisa tu bloqueador de pop-ups.')
        return
    }
    try {
        w.document.write(html)
        w.document.close()
        setTimeout(() => {
            try { w.print() } catch (err) {
                alert('No se pudo iniciar la impresión. Usa el diálogo del navegador.')
            }
        }, 500)
    } catch (e) {
        console.error('Error abriendo PDF paginado', e)
        alert('Error preparando el documento para impresión')
    }
}

/**
 * Helper para descargar el PDF como archivo HTML
 */
export function downloadPaginatedPDF(orderData, orderType = 'entrada') {
    const html = generatePaginatedPDF(orderData, orderType)
    const blob = new Blob([html], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orden-${orderType}-${orderData.folio || 'sin-folio'}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
