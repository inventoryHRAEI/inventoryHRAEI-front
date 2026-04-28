import { ref } from 'vue'

export function useMaintenanceExport() {
  const isExporting = ref(false)

  const exportCSV = async (data, filename = 'maintenance-history.csv') => {
    try {
      isExporting.value = true
      
      const csv = generateCSV(data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error exporting CSV:', err)
      throw err
    } finally {
      isExporting.value = false
    }
  }

  const generateCSV = (data) => {
    if (!data || data.length === 0) return ''

    const headers = Object.keys(data[0])
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const headerLine = headers.map(escapeCSV).join(',')
    const dataLines = data.map(row =>
      headers.map(header => escapeCSV(row[header])).join(',')
    )

    return [headerLine, ...dataLines].join('\n')
  }

  const copyToClipboard = async (data) => {
    try {
      const csv = generateCSV(data)
      await navigator.clipboard.writeText(csv)
      return true
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      return false
    }
  }

  const printData = (data, title = 'Maintenance History') => {
    const html = generateHTML(data, title)
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const isMaintenance = (header) => {
    const maintenanceFields = [
      'MP ', 'ESTATUS', 'OBSERVACIONES',
      'MP AGOSTO', 'ESTATUS_AGOS', 'OBSERVACIONES_AGOS',
      'MP SEPTIEMBRE', 'ESTATUS_SEP', 'OBSERVACIONES_SEPT',
      'MP OCTUBRE', 'ESTATUS_OCT', 'OBSERVACIONES_OCT',
      'MP NOVIEMBRE', 'ESTATUS_NOV', 'OBSERVACIONES_NOV'
    ]
    return maintenanceFields.some(field => header.includes(field))
  }

  const generateHTML = (data, title) => {
    if (!data || data.length === 0) return '<p>No data</p>'

    const headers = Object.keys(data[0])
    const headerHTML = headers.map(h => {
      const isMaint = isMaintenance(h)
      const bgColor = isMaint ? '#1e40af' : '#4CAF50'
      const style = isMaint ? 'background-color: ' + bgColor + '; color: white; font-weight: bold;' : 'background-color: ' + bgColor + '; color: white;'
      return `<th style="${style}">${h}</th>`
    }).join('')
    
    const rowsHTML = data.map(row =>
      `<tr>${headers.map(h => {
        const isMaint = isMaintenance(h)
        const value = row[h] || ''
        const style = isMaint ? 'background-color: #dbeafe; font-weight: 500; color: #1e40af;' : ''
        return `<td style="${style}">${value}</td>`
      }).join('')}</tr>`
    ).join('')

    return `
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              background-color: #f9fafb;
            }
            h1 { 
              text-align: center; 
              color: #1f2937;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-bottom: 20px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 20px;
              background-color: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #4CAF50; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f3f4f6; 
            }
            tr:hover {
              background-color: #f0f9ff;
            }
            .maintenance-highlight {
              background-color: #dbeafe !important;
              font-weight: 500;
              color: #1e40af;
              border-left: 4px solid #1e40af;
              padding-left: 8px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="subtitle">Historial de Mantenimientos - Datos de equipos biomédicos. Los campos en azul destacan información de mantenimiento.</p>
          <table>
            <thead><tr>${headerHTML}</tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </body>
      </html>
    `
  }

  return {
    isExporting,
    exportCSV,
    generateCSV,
    copyToClipboard,
    printData
  }
}
