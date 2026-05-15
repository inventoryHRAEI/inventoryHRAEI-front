import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';
import encabezadoImg from '@/images/encabezado.jpeg?inline';

/**
 * Genera un reporte detallado en PDF para un equipo médico (Cliente-side)
 */
export async function generateEquipmentReport(item, history = [], historyMovimientos = [], historyMeta = [], maintenanceFlow = {}) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    // header image
    let headerImg = encabezadoImg || null;
    const headerHeight = headerImg ? 60 : 0; 
    
    // watermark
    doc.setFontSize(60);
    doc.setTextColor(200);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text('CONFIDENCIAL', pageWidth/2, pageHeight/2, { align:'center', angle:45 });
    doc.setGState(new doc.GState({ opacity: 1 }));

    // header stripe
    doc.setFillColor('#1f3a93');
    doc.rect(0, 0, pageWidth, 6, 'F');

    doc.setDrawColor('#ffffff');
    doc.setLineWidth(0.5);
    doc.line(margin, 46, pageWidth - margin, 46);

    doc.setFontSize(16).setTextColor('#fff');
    doc.text('REPORTE DE EQUIPO MÉDICO', pageWidth/2, 24, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Hospital Regional de Alta Especialidad Ixtapaluca', pageWidth/2, 38, { align: 'center' });

    const inventoryNumber = item?.['No DE INVENTARIO'] || '';
    const equipmentName = item?.['EQUIPO MEDICO'] || '---';
    const timestamp = new Date().toLocaleString('es-ES');

    let y = margin + headerHeight + 20;
    const tableMargin = { left: margin, right: margin, top: margin + headerHeight + 10 };

    const paintHeaderOnPage = (pageNum) => {
        if (!headerImg) return;
        doc.setPage(pageNum);
        const imgW = pageWidth - 2*margin;
        const imgH = headerHeight; 
        const imgY = margin + 10; 
        doc.addImage(headerImg, 'JPEG', margin, imgY, imgW, imgH);
    };

    doc.setFontSize(14).setTextColor('#1f3a93');
    doc.text(equipmentName, margin, y);    y += 18;
    doc.setFontSize(10).setTextColor('#333');
    doc.text(`Inventario: ${inventoryNumber}`, margin, y);
    y += 20;

    function sectionHeader(text, color = '#374151') {
        doc.setFillColor(color);
        doc.rect(margin, y, pageWidth - 2*margin, 18, 'F');
        doc.setTextColor('#fff').setFontSize(12).setFont(undefined,'bold');
        doc.text(text, margin+6, y+13);
        y += 24;
    }

    const excludePatterns = [
        /^MP\s/i, /^MP\b/i, /OBSERVACIONES_/i, /^ESTATUS_/i, /LEVANTAMIENTO/i, /ETIQUETA/i
    ];

    const getCategory = key => {
        const f = key.toUpperCase();
        if (/INVENTARIO|SERIE|MODELO|EQUIPO/.test(f)) return 'Identificación';
        if (/MARCA|FABRICANTE|TECNOLOGIA|VOLTAJE|POTENCIA/.test(f)) return 'Especificaciones';
        if (/UBICACION|SERVICIO|AREA|DEPARTAMENTO/.test(f)) return 'Ubicación';
        if (/COSTO|PRECIO|VALOR|PROVEEDOR/.test(f)) return 'Financiera';
        if (/FECHA|GARANTIA|ADQUISICION/.test(f)) return 'Fechas';
        if (/ESTADO|STATUS|CONDICION/.test(f)) return 'Estado';
        return 'Otros';
    };

    const groups = {};
    if (item) {
        Object.entries(item).forEach(([k, v]) => {
            if (excludePatterns.some(p => p.test(k))) return;
            const cat = getCategory(k);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ label: k, value: v || 'N/A' });
        });
    }

    const headerColors = {
        'Identificación': '#1f3a93', 'Especificaciones': '#0d47a1', 'Ubicación': '#00695c',
        'Financiera': '#bf360c', 'Fechas': '#ff6f00', 'Estado': '#374151', 'Otros': '#455a64'
    };

    doc.setDrawColor('#ccc');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    sectionHeader('Información del Equipo', '#00695c');

    for (const [cat, items] of Object.entries(groups)) {
        doc.setFillColor(headerColors[cat] || '#374151');
        doc.rect(margin, y, pageWidth - 2*margin, 18, 'F');
        doc.setTextColor('#fff').setFontSize(10).setFont(undefined, 'bold');
        doc.text(cat, margin+6, y+13);
        y += 24;

        const rows = items.map(it => [it.label, it.value]);
        autoTable(doc, {
            startY: y,
            head: [['Campo','Valor']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: 220, textColor: 50, fontSize:8 },
            styles: { fontSize:7, cellPadding:4, halign: 'left' },
            columnStyles: { 0: {cellWidth: (pageWidth - margin*2)*0.3, fontStyle:'bold'}, 1: {cellWidth: (pageWidth - margin*2)*0.6} },
            margin: tableMargin,
            didDrawPage: () => paintHeaderOnPage(doc.getCurrentPageInfo().pageNumber)
        });
        y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 12;
    }

    doc.addPage();
    paintHeaderOnPage(doc.getNumberOfPages());
    y = margin + headerHeight + 20;
    sectionHeader('Historial de Mantenimientos', '#8b5cf6');

    const cols = historyMeta && historyMeta.length
        ? historyMeta.map(f => f.column)
        : ['ULTIMO MP DD MM AAAA','TIPO DE MANTENIMIENTO','ESTATUS','UBICACION ESPECIFICA','OBSERVACIONES'];

    const monthFields = {
        'MP AGOSTO': { short: 'AGOS', obsKey: 'OBSERVACIONES_AGOS', statusKey: 'ESTATUS_AGOS' },
        'MP SEPTIEMBRE': { short: 'SEPT', obsKey: 'OBSERVACIONES_SEPT', statusKey: 'ESTATUS_SEP' },
        'MP OCTUBRE': { short: 'OCT', obsKey: 'OBSERVACIONES_OCT', statusKey: 'ESTATUS_OCT' },
        'MP NOVIEMBRE': { short: 'NOV', obsKey: 'OBSERVACIONES_NOV', statusKey: 'ESTATUS_NOV' }
    };
    
    const addedTypes = new Set();
    const allRows = [];
    
    if (item) {
        Object.entries(item).forEach(([k, v]) => {
            const upperKey = k.toUpperCase().trim();
            const monthInfo = monthFields[upperKey];
            if (monthInfo) {
                const obs = item[monthInfo.obsKey] || '';
                const status = item[monthInfo.statusKey] || '';
                const hasDate = v && v.toString().toUpperCase() !== 'N/A' && v.toString().trim() !== '';
                const hasObs = obs && obs.toString().toUpperCase() !== 'N/A' && obs.toString().trim() !== '';
                const hasStatus = status && status.toString().toUpperCase() !== 'N/A' && status.toString().trim() !== '';
                if (hasDate || hasObs || hasStatus) {
                    const tipoMantenimiento = 'MP ' + upperKey.replace('MP ', '').toUpperCase();
                    const row = cols.map(c => {
                        if (c === 'ULTIMO MP DD MM AAAA') return hasDate ? v : '';
                        if (c === 'TIPO DE MANTENIMIENTO') return tipoMantenimiento;
                        if (c === 'ESTATUS') return hasStatus ? status : '';
                        if (c === 'UBICACION ESPECIFICA') return item['UBICACION ESPECIFICA'] || '';
                        if (c === 'OBSERVACIONES') return hasObs ? obs : '';
                        return '';
                    });
                    allRows.push(row);
                    addedTypes.add(tipoMantenimiento);
                }
            }
        });
    }
    
    const SKIP_MOV_TYPES = new Set(['ENTRADA', 'SALIDA', 'RESGUARDO', 'SERVICIO']);
    if (history && history.length) {
        history.forEach(entry => {
            if (SKIP_MOV_TYPES.has(entry.tipoMantenimiento)) return;
            const tipo = entry['TIPO DE MANTENIMIENTO'];
            const tipoUpper = tipo ? tipo.toString().toUpperCase() : '';
            if (!addedTypes.has(tipoUpper)) {
                const row = cols.map(c => {
                    let val = entry[c] || 'N/A';
                    if (/\d{2}\/\d{2}\/\d{4}/.test(val) || /\d{4}-\d{2}-\d{2}/.test(val)) val = formatDate(val);
                    return val;
                });
                allRows.push(row);
                if (tipoUpper) addedTypes.add(tipoUpper);
            }
        });
    }
    
    if (maintenanceFlow && maintenanceFlow.history && maintenanceFlow.history.length) {
        const completedMaintenances = maintenanceFlow.history.filter(m => m.finished_at);
        const historyRows = allRows;
        if (historyRows.length > 0) {
            y += 12;
            historyRows.forEach((row, rowIdx) => {
                const boxWidth = pageWidth - 2 * margin;
                if (y + 95 > pageHeight - margin) {
                    doc.addPage();
                    paintHeaderOnPage(doc.getNumberOfPages());
                    y = margin + headerHeight + 20;
                }
                const cardBgColor = [245, 245, 248];
                const cardBorderColor = [150, 150, 180];
                doc.setFillColor(...cardBgColor);
                doc.setDrawColor(...cardBorderColor);
                doc.setLineWidth(0.6);
                const obsLines = doc.splitTextToSize(row[4] || '', boxWidth - 18);
                const obsHeight = Math.max(16, obsLines.length * 3.3 + 8);
                const cardH = 70 + obsHeight + 6;
                doc.rect(margin, y, boxWidth, cardH, 'FD');
                let cardY = y;
                doc.setFontSize(8).setTextColor(...cardBorderColor).setFont(undefined, 'bold');
                doc.text(`Registro #${rowIdx + 1}`, margin + 5, cardY + 7);
                doc.setFontSize(7).setTextColor(100, 100, 100).setFont(undefined, 'normal');
                doc.text(row[0] || 'N/A', pageWidth - margin - 35, cardY + 7, { align: 'right' });
                cardY += 14;
                const fieldWidth = (boxWidth - 10) / 4;
                const fields = [
                    { label: 'TIPO', value: row[1] || 'N/A' },
                    { label: 'ESTADO', value: row[2] || 'N/A' },
                    { label: 'UBICACIÓN', value: (row[3] || 'N/A').substring(0, 18) },
                    { label: 'RESPONSABLE', value: (row[5] || 'N/A').substring(0, 15) }
                ];
                fields.forEach((f, fIdx) => {
                    const fX = margin + 5 + fIdx * fieldWidth;
                    if (fIdx > 0) { doc.setDrawColor(180, 170, 200); doc.setLineWidth(0.2); doc.line(fX, cardY, fX, cardY + 18); }
                    doc.setFontSize(5.5).setTextColor(120, 100, 150).setFont(undefined, 'bold');
                    doc.text(f.label, fX + 3, cardY + 3);
                    doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                    doc.text(doc.splitTextToSize(f.value, fieldWidth - 6), fX + 3, cardY + 10);
                });
                cardY += 20;
                doc.setFontSize(6).setTextColor(80, 80, 120).setFont(undefined, 'bold');
                doc.text('OBSERVACIONES:', margin + 5, cardY + 4);
                doc.setFontSize(6.5).setTextColor(60, 60, 90).setFont(undefined, 'normal');
                doc.text(obsLines, margin + 5, cardY + 10);
                y += cardH + 12;
            });
        }
        
        y += 4;
        const convertedMaintenances = await Promise.all(completedMaintenances.map(async (maint) => {
            const convertedImages = await processMaintenanceImages(maint.images || []);
            return { ...maint, images: convertedImages };
        }));
    
        convertedMaintenances.forEach((maint, idx) => {
            const boxWidth = pageWidth - 2 * margin;
            if (y + 110 > pageHeight - margin) {
                doc.addPage();
                paintHeaderOnPage(doc.getNumberOfPages());
                y = margin + headerHeight + 20;
            }
            const isMP = maint.maintenance_type === 'MP';
            const cardBgColor = isMP ? [230, 245, 230] : [255, 235, 238];
            const cardBorderColor = isMP ? [76, 175, 80] : [244, 67, 54];
            doc.setFillColor(...cardBgColor);
            doc.setDrawColor(...cardBorderColor);
            doc.setLineWidth(0.6);
            const obsText = maint.observaciones || 'Sin observaciones';
            const obsLines = doc.splitTextToSize(obsText, boxWidth - 18);
            const obsHeight = Math.max(16, obsLines.length * 3.3 + 8);
            const cardH = 20 + 44 + 4 + obsHeight + 6 + 28;
            doc.rect(margin, y, boxWidth, cardH, 'FD');
            let cardY = y;
            doc.setFontSize(8).setTextColor(...cardBorderColor).setFont(undefined, 'bold');
            doc.text(`Mantenimiento #${idx + 1}`, margin + 5, cardY + 7);
            doc.setFontSize(7).setTextColor(100, 100, 100).setFont(undefined, 'normal');
            doc.text(formatDate(maint.finished_at), pageWidth - margin - 35, cardY + 7, { align: 'right' });
            cardY += 13;
            const colW = (boxWidth - 10) / 2;
            const infoFields = [
                { label: 'TIPO:', value: isMP ? 'Preventivo' : 'Correctivo' },
                { label: 'ESTADO:', value: maint.result_status === 'functional' ? 'Funcional' : 'No Funcional' },
                { label: 'RESPONSABLE:', value: maint.finished_by || 'N/A' },
                { label: 'UBICACIÓN:', value: maint.return_location || 'N/A' }
            ];
            for (let i = 0; i < infoFields.length; i += 2) {
                const leftX = margin + 5;
                doc.setFontSize(5.5).setTextColor(100, 80, 130).setFont(undefined, 'bold');
                doc.text(infoFields[i].label, leftX, cardY + 3);
                doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                doc.text(doc.splitTextToSize(infoFields[i].value, colW - 8), leftX, cardY + 8);
                if (i + 1 < infoFields.length) {
                    const rightX = margin + 5 + colW;
                    doc.setFontSize(5.5).setTextColor(100, 80, 130).setFont(undefined, 'bold');
                    doc.text(infoFields[i+1].label, rightX, cardY + 3);
                    doc.setFontSize(6.5).setTextColor(50, 50, 80).setFont(undefined, 'normal');
                    doc.text(doc.splitTextToSize(infoFields[i+1].value, colW - 8), rightX, cardY + 8);
                }
                cardY += 11;
            }
            cardY += 2;
            doc.setFontSize(6).setTextColor(80, 80, 120).setFont(undefined, 'bold');
            doc.text('OBSERVACIONES:', margin + 5, cardY + 4);
            doc.setFontSize(6.5).setTextColor(60, 60, 90).setFont(undefined, 'normal');
            doc.text(obsLines, margin + 5, cardY + 10);
            cardY += obsHeight + 6;
            doc.setFillColor(242, 242, 250); doc.setDrawColor(190, 180, 215); doc.setLineWidth(0.4);
            doc.rect(margin + 5, cardY, boxWidth - 10, 28, 'FD');
            doc.setFontSize(6).setTextColor(110, 100, 150).setFont(undefined, 'bold');
            doc.text('FOTOS:', margin + 8, cardY + 5);
            if (maint.images?.length) {
                const imgs = maint.images.slice(0, 5); let imgX = margin + 32;
                imgs.forEach(img => {
                    try { if (img?.startsWith('data:image/')) { doc.addImage(img, img.includes('png')?'PNG':'JPEG', imgX, cardY+3, 18, 18); imgX += 21; } } catch(e){}
                });
            } else { doc.setFontSize(6).setTextColor(160, 150, 185).setFont(undefined, 'italic'); doc.text('—', margin + 32, cardY + 12); }
            y += cardH + 12;
        });
    }
    
    if (historyMovimientos?.length > 0) {
        doc.addPage(); paintHeaderOnPage(doc.getNumberOfPages());
        y = margin + headerHeight + 20; sectionHeader('Movimientos de Órdenes', '#1565c0');
        const movColors = { 'ENTRADA': {bg:[232,245,233], border:[56,142,60]}, 'SALIDA': {bg:[255,235,238], border:[211,47,47]}, 'RESGUARDO': {bg:[255,243,224], border:[230,119,0]}, 'SERVICIO': {bg:[227,242,253], border:[21,101,192]} };
        historyMovimientos.forEach((mov, idx) => {
            const tipo = (mov.tipoMantenimiento || 'ENTRADA').toUpperCase();
            const colors = movColors[tipo] || movColors['ENTRADA'];
            const boxW = pageWidth - 2*margin;
            const descLines = doc.splitTextToSize(String(mov.descripcion || '—'), boxW - 20);
            const obsLines = doc.splitTextToSize(String(mov.observaciones || '—'), boxW - 20);
            const cardH = 13 + 44 + 8 + Math.max(10, descLines.length*3.3+6) + 8 + Math.max(10, obsLines.length*3.3+6) + 6;
            if (y + cardH > pageHeight - margin) { doc.addPage(); paintHeaderOnPage(doc.getNumberOfPages()); y = margin + headerHeight + 20; }
            doc.setFillColor(...colors.bg); doc.setDrawColor(...colors.border); doc.setLineWidth(0.7); doc.rect(margin, y, boxW, cardH, 'FD');
            doc.setFillColor(...colors.border); doc.rect(margin, y, 5, cardH, 'F');
            let cy = y; doc.setFontSize(8).setTextColor(...colors.border).setFont(undefined, 'bold'); doc.text(`${tipo}  #${idx + 1}`, margin + 10, cy + 9);
            doc.setFontSize(7).setTextColor(90, 90, 90).setFont(undefined, 'normal'); doc.text(mov.ultimoMP ? formatDate(mov.ultimoMP) : 'N/A', pageWidth - margin - 10, cy + 9, { align: 'right' });
            cy += 14; const halfW = (boxW - 14)/2;
            const fields = [[{l:'FOLIO:',v:mov.folio},{l:'RESPONSABLE:',v:mov.responsable}],[{l:'MOTIVO:',v:mov.motivo},{l:'SOLICITANTE:',v:mov.solicitante}]];
            fields.forEach(p => {
                doc.setFontSize(5.5).setTextColor(...colors.border).setFont(undefined,'bold'); doc.text(p[0].l, margin+12, cy+3); doc.text(p[1].l, margin+12+halfW+4, cy+3);
                doc.setFontSize(6.5).setTextColor(40,40,70).setFont(undefined,'normal'); doc.text(doc.splitTextToSize(String(p[0].v||'N/A'), halfW-4), margin+12, cy+9); doc.text(doc.splitTextToSize(String(p[1].v||'N/A'), halfW-4), margin+12+halfW+4, cy+9);
                cy += 11;
            });
            doc.setFontSize(6).setTextColor(...colors.border).setFont(undefined,'bold'); doc.text('DESCRIPCIÓN:', margin+12, cy+4); cy+=8; doc.setFontSize(6.5).text(descLines, margin+12, cy); cy+=Math.max(10, descLines.length*3.3+6);
            doc.setFontSize(6).setTextColor(...colors.border).setFont(undefined,'bold'); doc.text('OBSERVACIONES:', margin+12, cy+4); cy+=8; doc.setFontSize(6.5).text(obsLines, margin+12, cy);
            y += cardH + 10;
        });
    }

    doc.addPage(); paintHeaderOnPage(doc.getNumberOfPages()); y = margin + headerHeight + 30;
    const barcodeUrl = await generateBarcodeDataUrl(inventoryNumber);
    if (barcodeUrl) {
        doc.setLineWidth(0.5); doc.setDrawColor(100); doc.setLineDash([5, 3], 0);
        doc.rect((pageWidth-350)/2, y, 350, 140); doc.setLineDash();
        doc.setFontSize(8).setTextColor(150); doc.text('⟵ RECORTAR ⟶', pageWidth/2, y-5, {align:'center'});
        doc.addImage(barcodeUrl, 'PNG', (pageWidth-280)/2, y+15, 280, 70);
        y += 120; doc.setFontSize(14).setTextColor(0).setFont(undefined,'bold'); doc.text(inventoryNumber, pageWidth/2, y, {align:'center'});
        doc.setFontSize(8).setTextColor(100).setFont(undefined,'normal'); doc.text('Código de Inventario', pageWidth/2, y+10, {align:'center'});
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        paintHeaderOnPage(i); doc.setPage(i); const footerY = pageHeight - 24;
        doc.setDrawColor('#ccc'); doc.setLineWidth(0.5); doc.line(margin, footerY, pageWidth - margin, footerY);
        doc.setFontSize(8).setTextColor(100); doc.text(`Generado: ${timestamp}`, margin, footerY + 12);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerY + 12, { align: 'right' });
    }
    return doc;
}

async function generateBarcodeDataUrl(code) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, code, { format: "CODE128", width: 2, height: 100, displayValue: false });
            resolve(canvas.toDataURL("image/png"));
        } catch (e) { resolve(null); }
    });
}

async function urlToDataUrl(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch { return null; }
}

async function processMaintenanceImages(images) {
    if (!Array.isArray(images)) return [];
    const processed = [];
    for (const img of images) {
        try {
            let dataUrl = null;
            if (img.data) dataUrl = img.data;
            else if (img.path) dataUrl = await urlToDataUrl(img.path.startsWith('/api') ? img.path : `/api/${img.path.replace(/^\//, '')}`);
            else if (typeof img === 'string') dataUrl = await urlToDataUrl(img.startsWith('/api') ? img : `/api/${img.replace(/^\//, '')}`);
            if (dataUrl) processed.push(dataUrl);
        } catch {}
    }
    return processed;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { year:'numeric', month:'2-digit', day:'2-digit' });
    } catch { return dateStr; }
}
