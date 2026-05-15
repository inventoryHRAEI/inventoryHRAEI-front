/**
 * Utilidad para normalizar los datos de equipos médicos del backend.
 * Resuelve las inconsistencias en los nombres de las propiedades (keys).
 */
export function normalizeEquipment(item) {
    if (!item) return null;

    // Mapa de sinonimos para propiedades comunes
    const normalized = {
        inventoryNo: item['No DE INVENTARIO'] || item['inventoryNo'] || item['noInventario'] || item['id_inventario'] || '—',
        serialNo: item['NUMERO DE SERIE'] || item['serialNo'] || item['serie'] || '—',
        name: item['EQUIPO MEDICO'] || item['name'] || item['nombre'] || '—',
        model: item['MODELO'] || item['model'] || '—',
        brand: item['MARCA'] || item['brand'] || '—',
        area: item['UBICACION ESPECIFICA'] || item['area'] || item['ubicacion'] || '—',
        service: item['SERVICIO'] || item['service'] || '—',
        specialty: item['ESPECIALIDAD AREA DEL HOSPITAL'] || item['specialty'] || '—',
        status: item['ESTADO FISICO'] || item['status'] || item['estado'] || '—',
        condition: item['CONDICIONES DEL EQUIPO'] || item['condition'] || '—',
        category: item['TIPO DE EQUIPO'] || item['category'] || '—',
        supplier: item['PROVEEDOR'] || item['supplier'] || '—',
        warranty: item['FECHA VENCIMIENTO GARANTIA'] || item['warranty'] || '—',
        acquisitionDate: item['FECHA DE ADQUISICION'] || item['acquisitionDate'] || '—'
    };

    // Mantener todas las propiedades originales por si acaso
    return {
        ...item,
        _normalized: normalized
    };
}
