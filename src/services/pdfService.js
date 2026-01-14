/**
 * Servicio para generar PDFs de equipos biomédicos
 */

export async function generateEquipmentPDF(equipment) {
    try {
        // Hacer una petición al backend para generar el PDF
        const response = await fetch('/api/pdf/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipment)
        })

        if (!response.ok) throw new Error('Error generating PDF')

        const blob = await response.blob()
        downloadBlob(blob, `equipo-${equipment.inventoryNo}.pdf`)
    } catch (error) {
        console.error('PDF generation error:', error)
        // Fallback: generar PDF simple en cliente
        generateSimplePDF(equipment)
    }
}

/**
 * Genera un PDF simple usando canvas + html2canvas simulado
 */
export function generateSimplePDF(equipment) {
    const htmlContent = buildEquipmentHTML(equipment)
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)

    // Abrir nueva ventana y escribir el contenido (más fiable que iframe para evitar restricciones cross-origin)
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
            // Not closing window on purpose so user can save the PDF; caller may close it if desired
        }, 250)
    } catch (e) {
        console.error('Error using print window fallback', e)
        alert('Error preparando impresión: ' + (e && e.message ? e.message : e))
    }
}

function buildEquipmentHTML(item) {
    const historyHtml = (item.history || [])
        .map((h, i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${h.start ? new Date(h.start).toLocaleString('es-ES') : '—'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${h.end ? new Date(h.end).toLocaleString('es-ES') : 'En curso'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${h.notes || '—'}</td>
      </tr>
    `)
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .section {
          page-break-inside: avoid;
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
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .info-row:last-child {
          border-bottom: none;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${item.name}</h1>
          <div class="subtitle">Reporte de Equipo Biomédico • ${new Date().toLocaleDateString('es-ES')}</div>
        </div>

        <div class="grid-2">
          <div class="section">
            <h2>📋 Información General</h2>
            <div class="info-row">
              <span class="label">No. Inventario:</span>
              <span class="value"><strong>${item.inventoryNo}</strong></span>
            </div>
            <div class="info-row">
              <span class="label">Nombre:</span>
              <span class="value">${item.name}</span>
            </div>
          </div>

          <div class="section">
            <h2>📍 Ubicación y Estado</h2>
            <div class="info-row">
              <span class="label">Área:</span>
              <span class="value">${item.area || '—'}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value"><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></span>
            </div>
          </div>
        </div>

        ${item.history && item.history.length > 0 ? `
          <div class="section">
            <h2>🔧 Historial de Mantenimiento</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Inicio</th>
                  <th>Fin</th>
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

