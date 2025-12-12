const ExcelJS = require('exceljs')
const fs = require('fs')
const path = require('path')

const plantilla = path.join(process.cwd(), 'src', 'plantillas', 'entrada_plantilla.xlsx')

async function run() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(fs.readFileSync(plantilla))
  const worksheet = workbook.getWorksheet('ENTRADA')

  // Simular contexto: escribir etiqueta en fila antigua y nueva con merges
  const oldRow = 36
  const newRow = 41
  // Merge label A:C on oldRow and set label (si ya está mergeada, ignorar)
  try { worksheet.mergeCells(`A${oldRow}:C${oldRow}`) } catch (e) { /* ignore if already merged */ }
  worksheet.getCell(`A${oldRow}`).value = 'NOMBRE DE INGENIERO RESIDENTE DE APOYO'
  // Merge D:I on newRow and set actual name (si ya está mergeada, ignorar)
  try { worksheet.mergeCells(`D${newRow}:I${newRow}`) } catch (e) { /* ignore if already merged */ }
  worksheet.getCell(`D${newRow}`).value = 'Juan Perez'

  // Simular FILA_INGENIERO: newRow
  const FILA_INGENIERO = newRow

  // Ejecutar limpieza simulada similar a la implementada en OpEntrada.vue
  const colLetterToNumber = (letters) => {
    let num = 0
    for (let i = 0; i < letters.length; i++) num = num * 26 + (letters.charCodeAt(i) - 64)
    return num
  }
  const parseRange = (range) => {
    const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(range)
    if (!m) return null
    return { startCol: colLetterToNumber(m[1]), startRow: Number(m[2]), endCol: colLetterToNumber(m[3]), endRow: Number(m[4]) }
  }
  const findMergeRangeContaining = (ws, address) => {
    const merges = Array.from(ws._merges || [])
    for (const entry of merges) {
      const range = entry && entry[0] ? entry[0] : entry
      if (!range) continue
      if (typeof range === 'string' && range.includes(address)) return range
    }
    return null
  }
  const clearCellOrMergeContaining = (ws, cell) => {
    try {
      const addr = cell.address
      const mergeRange = findMergeRangeContaining(ws, addr)
      if (mergeRange) {
        const parsed = parseRange(mergeRange)
        if (parsed) {
          try { ws.unMergeCells(mergeRange) } catch (e) {}
          for (let r = parsed.startRow; r <= parsed.endRow; r++) {
            for (let c = parsed.startCol; c <= parsed.endCol; c++) {
              const cc = ws.getCell(r, c)
              cc.value = null
            }
          }
          return true
        }
      }
      cell.value = null
      return true
    } catch (err) { return false }
  }

  let removed = 0
  for (let r = 1; r <= worksheet.rowCount; r++) {
    if (r === newRow) continue
    for (let c = 1; c <= 9; c++) {
      const cell = worksheet.getCell(r, c)
      if (typeof cell.value === 'string' && cell.value.trim() === 'NOMBRE DE INGENIERO RESIDENTE DE APOYO') {
        if (clearCellOrMergeContaining(worksheet, cell)) removed++
      }
    }
  }

  const outPath = path.join(process.cwd(), 'src', 'plantillas', `test_output_${Date.now()}.xlsx`)
  await workbook.xlsx.writeFile(outPath)
  console.log(`Removed ${removed} duplicates. Output written to ${outPath}`)
}

run().catch(err => { console.error('Test failed:', err); process.exit(1) })
