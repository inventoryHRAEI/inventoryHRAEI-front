/**
 * Servicio para generar PDFs de equipos biomédicos
 * @param {string|object} inventoryNo - Número de inventario o objeto con inventoryNo
 * @returns {Promise<{pdfUrl: string}|null>} - URL del PDF para preview o null si falla
 */

export async function generateEquipmentPDF(inventoryNo) {
    try {
        // Normalizar el parámetro - puede ser string o objeto
        const invNo = typeof inventoryNo === 'string' ? inventoryNo : (inventoryNo?.inventoryNo || inventoryNo?.['No DE INVENTARIO']);
        
        if (!invNo) {
            console.error('No inventory number provided');
            return null;
        }

        // Hacer una petición al backend para generar el PDF
        const response = await fetch('/api/pdf/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inventoryNo: invNo })
        })

        if (!response.ok) throw new Error('Error generating PDF')

        const blob = await response.blob()
        
        // Crear URL para el blob (para preview)
        const pdfUrl = window.URL.createObjectURL(blob)
        
        // Devolver objeto con pdfUrl para que pueda usarse en preview
        return { pdfUrl, blob }
    } catch (error) {
        console.error('PDF generation error:', error)
        return null
    }
}

/**
 * Descarga el PDF directamente (para el botón descargar)
 */
export async function downloadEquipmentPDF(inventoryNo) {
    try {
        const invNo = typeof inventoryNo === 'string' ? inventoryNo : (inventoryNo?.inventoryNo || inventoryNo?.['No DE INVENTARIO']);
        
        if (!invNo) {
            console.error('No inventory number provided');
            return;
        }

        const response = await fetch('/api/pdf/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inventoryNo: invNo })
        })

        if (!response.ok) throw new Error('Error generating PDF')

        const blob = await response.blob()
        downloadBlob(blob, `equipo-${invNo}.pdf`)
    } catch (error) {
        console.error('PDF download error:', error)
        // Fallback
        generateSimplePDF(inventoryNo)
    }
}

/**
 * Genera un PDF simple usando los estilos corporativos del nuevo diseño
 * Este es el fallback cuando el endpoint /api/pdf/equipment no está disponible
 */
export function generateSimplePDF(equipment) {
    const htmlContent = buildEquipmentHTML(equipment)
    
    // Abrir nueva ventana y escribir el contenido
    const w = window.open('', '_blank')
    if (!w) {
        alert('No se pudo abrir la ventana de impresión. Revisa tu bloqueador de pop-ups.')
        return
    }
    try {
        w.document.write(htmlContent)
        w.document.close()
        setTimeout(() => {
            try { w.print() } catch (err) { alert('No se pudo iniciar la impresión automáticamente. Usa el diálogo del navegador para imprimir o guardar como PDF.') }
        }, 250)
    } catch (e) {
        console.error('Error usando print window fallback', e)
        alert('Error preparando impresión: ' + (e && e.message ? e.message : e))
    }
}

function buildEquipmentHTML(item) {
     const historyHtml = (item.history || [])
         .map((h, i) => {
             const startDate = h.start ? new Date(h.start).toLocaleString('es-ES') : '—';
             const endDate = h.end ? new Date(h.end).toLocaleString('es-ES') : 'En curso';
             const status = h.end ? 'Completado' : 'En progreso';
             const statusClass = h.end ? 'completed' : 'in-progress';
             return `
              <tr>
                <td>${i + 1}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td><span class="badge ${statusClass === 'completed' ? 'green' : 'yellow'}">${status}</span></td>
                <td>${h.notes || '—'}</td>
              </tr>
         `;
         })
         .join('')

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Equipo: ${item.inventoryNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1f2937;
          line-height: 1.6;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          border-bottom: 3px solid #3b82f6;
          margin-bottom: 30px;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #1f2937;
        }
        .header .subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        .grid-2 {
          display: none;
        }
        .section {
          page-break-inside: avoid;
          margin-bottom: 30px;
        }
        .section h2 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
          color: #1f2937;
        }
        .info-row {
          display: none;
        }
        .label {
          font-weight: 600;
          color: #374151;
          flex: 0 0 40%;
        }
        .value {
          color: #1f2937;
          flex: 1;
          text-align: right;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .info-table thead tr {
          background-color: #1f2937;
          border-bottom: 2px solid #d1d5db;
        }
        .info-table th {
          padding: 12px;
          text-align: left;
          font-weight: 700;
          color: white;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
        }
        .info-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .info-table td {
          padding: 12px;
          font-size: 12px;
          color: #1f2937;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          vertical-align: top;
          line-height: 1.4;
        }
        .info-table td:first-child {
          font-weight: 600;
          width: 35%;
          background-color: #f3f4f6;
          color: #374151;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }
        .badge.green { background:#10b981 }
        .badge.yellow { background:#f59e0b }
        .badge.blue { background:#3b82f6 }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          table-layout: fixed;
        }
        table thead tr {
          background-color: #1f2937;
          border-bottom: 2px solid #d1d5db;
        }
        table th {
          padding: 14px;
          text-align: left;
          font-weight: 700;
          color: white;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
        }
        table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        table td {
          padding: 14px;
          font-size: 12px;
          color: #1f2937;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          vertical-align: top;
          line-height: 1.4;
        }
        table th:nth-child(1) {
          width: 5%;
        }
        table th:nth-child(2) {
          width: 20%;
        }
        table th:nth-child(3) {
          width: 20%;
        }
        table th:nth-child(4) {
          width: 12%;
        }
        table th:nth-child(5) {
          width: 43%;
        }
        table td:nth-child(1) {
          width: 5%;
          font-weight: 600;
          text-align: center;
        }
        table td:nth-child(2) {
          width: 20%;
          font-size: 11px;
        }
        table td:nth-child(3) {
          width: 20%;
          font-size: 11px;
        }
        table td:nth-child(4) {
          width: 12%;
          font-size: 11px;
          text-align: center;
        }
        table td:nth-child(5) {
          width: 43%;
          font-size: 11px;
        }
        .history-item {
          background-color: #f9fafb;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          margin-bottom: 16px;
          border-radius: 4px;
          page-break-inside: avoid;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .history-number {
          font-weight: 700;
          color: #1f2937;
          font-size: 14px;
        }
        .history-status {
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }
        .history-status.status-completed {
          background-color: #10b981;
        }
        .history-status.status-in-progress {
          background-color: #f59e0b;
        }
        .history-dates {
          margin-bottom: 12px;
        }
        .date-row {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .date-row:last-child {
          margin-bottom: 0;
        }
        .date-label {
          font-weight: 600;
          color: #374151;
          min-width: 60px;
        }
        .date-value {
          color: #1f2937;
          flex: 1;
        }
        .history-notes {
          background-color: white;
          padding: 10px;
          border-radius: 3px;
          border: 1px solid #e5e7eb;
        }
        .notes-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          font-size: 13px;
        }
        .history-notes p {
          margin: 0;
          color: #1f2937;
          font-size: 13px;
          line-height: 1.5;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${item.name}</h1>
          <div class="subtitle">Reporte de Equipo Biomédico • ${new Date().toLocaleDateString('es-ES')}</div>
        </div>

        <div class="section">
          <h2>📋 Información del Equipo</h2>
          <table class="info-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>No. Inventario</td>
                <td><strong>${item.inventoryNo}</strong></td>
              </tr>
              <tr>
                <td>Nombre del Equipo</td>
                <td>${item.name}</td>
              </tr>
              <tr>
                <td>Área</td>
                <td>${item.area || '—'}</td>
              </tr>
              <tr>
                <td>Estado</td>
                <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        ${item.history && item.history.length > 0 ? `
          <div class="section">
            <h2>🔧 Historial de Mantenimiento</h2>
            <table class="info-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                ${historyHtml}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="footer">
          <p>Este documento fue generado automáticamente desde el Sistema de Gestión de Inventario Biomédico.</p>
          <p>Impreso: ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generatePlaceholderPDF(reason) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>PDF no disponible</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:40px;color:#111} .container{max-width:700px;margin:0 auto} h1{color:#d97706} .reason{margin-top:12px;color:#6b7280}</style></head><body><div class="container"><h1>PDF temporal</h1><p>El servicio de generación de PDF no está disponible en este momento.</p><p class="reason"><strong>Motivo:</strong> ${String(reason || 'No disponible')}</p><p>Usa el diálogo del navegador para guardar como PDF.</p></div></body></html>`
  const w = window.open('', '_blank')
  if (!w) return alert('No se pudo abrir la ventana de impresión. Revisa tu bloqueador de pop-ups.')
  try {
    w.document.write(html)
    w.document.close()
    setTimeout(() => { try { w.print() } catch (e){} }, 350)
  } catch (e) { console.error('Error generating placeholder PDF', e); alert('No se pudo generar el PDF placeholder') }
}

function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

function getStatusBadgeClass(status) {
    if (status === 'DISPONIBLE') return 'green'
    if (status === 'EN MANTENIMIENTO') return 'yellow'
    if (status === 'OPERATIVO') return 'blue'
    return ''
}

function getTypeBadgeClass(type) {
    if (type === 'equipo') return 'purple'
    if (type === 'accesorio') return 'cyan'
    if (type === 'consumible') return 'orange'
    if (type === 'refaccion') return 'pink'
    return ''
}

function getTypeLabel(type) {
    const labels = {
        'equipo': 'Equipo',
        'accesorio': 'Accesorio',
        'consumible': 'Consumible',
        'refaccion': 'Refacción'
    }
    return labels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '—')
}

