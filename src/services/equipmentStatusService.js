import { authedFetch } from '@/utils/api'

export async function fetchStatusHistory(inventoryNo) {
  if (!inventoryNo) return []
  const res = await authedFetch(`/api/ops/equipment/${encodeURIComponent(inventoryNo)}/status-history`)
  if (!res.ok) throw new Error(`Error fetching status history: ${res.status}`)
  const data = await res.json().catch(() => null)
  return (data && data.ok && Array.isArray(data.data)) ? data.data : []
}

export async function verifyInventory(inventoryNo) {
  if (!inventoryNo) return null
  const res = await authedFetch(`/api/ops/equipment/verify/${encodeURIComponent(inventoryNo)}`)
  if (!res.ok) throw new Error(`Error verifying inventory: ${res.status}`)
  const data = await res.json().catch(() => null)
  return (data && data.ok) ? data.data : null
}

// look up a equipment row by raw code (inventory number or barcode)
export async function lookupEquipmentByCode(code) {
  if (!code) return null
  const res = await authedFetch(`/api/ops/equipment/lookup/${encodeURIComponent(code)}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Error looking up equipment: ${res.status}`)
  }
  const data = await res.json().catch(() => null)
  return (data && data.ok) ? data.data : null
}

export async function markStatusManual(inventoryNo, { status = 'functional', maintenance_type = 'manual', notes = '' } = {}) {
  if (!inventoryNo) throw new Error('inventoryNo is required')
  const now = new Date()
  const payload = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    status,
    maintenance_type,
    notes
  }
  const res = await authedFetch(`/api/ops/equipment/${encodeURIComponent(inventoryNo)}/status`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data || !data.ok) {
    throw new Error((data && data.msg) || `Server returned ${res.status}`)
  }
  return data.result || data
}

// Registrar un mantenimiento completo (wizard)
export async function registerMaintenance(inventoryNo, maintenanceData) {
  if (!inventoryNo) throw new Error('inventoryNo is required')
  const url = `/api/ops/equipment/${encodeURIComponent(inventoryNo)}/maintenance`
  const res = await authedFetch(url, {
    method: 'POST',
    body: JSON.stringify(maintenanceData)
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[equipmentStatusService] registerMaintenance failed', url, maintenanceData, res.status, data)
  }
  if (!res.ok || !data || !data.ok) {
    throw new Error((data && data.msg) || `Server returned ${res.status}`)
  }
  return data.result || data
}

// Obtener todos los mantenimientos de un equipo
export async function getAllMaintenances(inventoryNo) {
  if (!inventoryNo) return []
  const res = await authedFetch(`/api/ops/equipment/${encodeURIComponent(inventoryNo)}/maintenances`)
  if (!res.ok) throw new Error(`Error fetching maintenances: ${res.status}`)
  const data = await res.json().catch(() => null)
  return (data && data.ok && Array.isArray(data.data)) ? data.data : []
}

// === FLUJO DE MANTENIMIENTOS ===

// Iniciar un mantenimiento
export async function startMaintenance(inventoryNo, { 
  maintenance_type = 'MP', 
  notes = '', 
  started_by = '', 
  images = [],
  routine_preventive = false, 
  simulator_tests = false, 
  analyzer_tests = false, 
  folio_inicio = '',
  maintenance_responsible = '',
  provider_type = 'internal',
  provider_company = '',
  internal_department = '',
  has_warranty = false,
  warranty_end_date = null,
  maintenance_contract = null
} = {}) {
  if (!inventoryNo) throw new Error('inventoryNo requerido')
  const url = `/api/ops/maintenance/start`
  
  // If images are provided, use FormData for multipart/form-data
  const hasImages = images && Array.isArray(images) && images.length > 0
  
  let fetchOptions = {
    method: 'POST'
  }
  
  // DEBUG: show images contents before building request
  console.log('[equipmentStatusService] startMaintenance preparing', images.length, 'images:', images);
  if (hasImages) {
    const formData = new FormData()
    formData.append('inventory_no', inventoryNo)
    formData.append('maintenance_type', maintenance_type)
    formData.append('notes', notes)
    formData.append('started_by', started_by)
    formData.append('routine_preventive', routine_preventive ? '1' : '0')
    formData.append('simulator_tests', simulator_tests ? '1' : '0')
    formData.append('analyzer_tests', analyzer_tests ? '1' : '0')
    formData.append('folio_inicio', folio_inicio)
    formData.append('maintenance_responsible', maintenance_responsible)
    formData.append('provider_type', provider_type)
    formData.append('provider_company', provider_company)
    formData.append('internal_department', internal_department)
    formData.append('has_warranty', has_warranty ? '1' : '0')
    formData.append('warranty_end_date', warranty_end_date || '')
    formData.append('maintenance_contract', maintenance_contract !== null ? String(maintenance_contract) : '')
    
    // Append each image file
    // append each image, converting data URLs to File objects if needed
    images.forEach((img, idx) => {
      console.log('[equipmentStatusService] startMaintenance image', idx, typeof img, img && img.substr ? img.substr(0,30) : img);
      if (img instanceof File) {
        formData.append('images', img)
      } else if (typeof img === 'string' && img.startsWith('data:')) {
        // convert data URL to blob
        const arr = img.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        formData.append('images', new File([blob], `image_${idx}.${mime.split('/')[1] || 'png'}`, { type: mime }));
      }
    })
    
    fetchOptions.body = formData
    // DO NOT set Content-Type header for FormData - the browser sets it automatically
  } else {
    fetchOptions.body = JSON.stringify({
      inventory_no: inventoryNo,
      maintenance_type,
      notes,
      started_by,
      images,
      routine_preventive,
      simulator_tests,
      analyzer_tests,
      folio_inicio,
      maintenance_responsible,
      provider_type,
      provider_company,
      internal_department,
      has_warranty,
      warranty_end_date,
      maintenance_contract
    })
    // authedFetch will set Content-Type: application/json automatically
  }
  
  const res = await authedFetch(url, fetchOptions)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[equipmentStatusService] startMaintenance failed', url, inventoryNo, res.status, data && JSON.stringify(data))
  }
  if (!res.ok || !data || !data.ok) {
    const msg = (data && data.msg) || (data && data.error) || `Error iniciando mantenimiento: ${res.status}`
    throw new Error(msg)
  }
  return data
}

// Terminar un mantenimiento
export async function finishMaintenance(inventoryNo, { 
  maintenance_id = null,
  result_status = 'functional', 
  diagnostico = '', 
  causa = '', 
  observaciones = '',
  finished_by = '',
  return_location = '',
  final_area = '',
  images = [],
  // new fields
  maintenance_hours = 0,
  technician_name = '',
  tests = [],
  folio_inicio = '',
  routine_preventive = false,
  simulator_tests = false,
  analyzer_tests = false
} = {}) {
  if (!inventoryNo) throw new Error('inventoryNo requerido')
  const url = `/api/ops/maintenance/finish`
  
  // DEBUG log incoming images array
  console.log('[equipmentStatusService] finishMaintenance called with images:', images);

  // If images are provided, use FormData for multipart/form-data
  const hasImages = images && Array.isArray(images) && images.length > 0
  
  let fetchOptions = {
    method: 'POST'
  }
  
  if (hasImages) {
    const formData = new FormData()
    formData.append('inventory_no', inventoryNo)
    formData.append('maintenance_id', maintenance_id || '')
    formData.append('result_status', result_status)
    formData.append('diagnostico', diagnostico)
    formData.append('causa', causa)
    formData.append('observaciones', observaciones)
    formData.append('finished_by', finished_by)
    formData.append('return_location', return_location)
    formData.append('final_area', final_area)
    formData.append('maintenance_hours', maintenance_hours)
    formData.append('routine_preventive', routine_preventive ? '1' : '0')
    formData.append('simulator_tests', simulator_tests ? '1' : '0')
    formData.append('analyzer_tests', analyzer_tests ? '1' : '0')
    
    // Append each image file (convert data URLs to File if needed)
    images.forEach((img, idx) => {
      if (img instanceof File) {
        formData.append('images', img)
      } else if (typeof img === 'string' && img.startsWith('data:')) {
        const arr = img.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        formData.append('images', new File([blob], `image_${idx}.${mime.split('/')[1] || 'png'}`, { type: mime }));
      }
    })
    
    fetchOptions.body = formData
    // DO NOT set Content-Type header for FormData - the browser sets it automatically
  } else {
    fetchOptions.body = JSON.stringify({
      inventory_no: inventoryNo,
      maintenance_id,
      result_status,
      diagnostico,
      causa,
      observaciones,
      finished_by,
      return_location,
      final_area,
      images,
      maintenance_hours,
      technician_name,
      folio_inicio,
      tests,
      routine_preventive,
      simulator_tests,
      analyzer_tests
    })
    // authedFetch will set Content-Type: application/json automatically
  }
  
  const res = await authedFetch(url, fetchOptions)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // Si falla con 404, significa que NO hay mantenimiento iniciado
    if (res.status === 404 || data?.msg?.includes('No hay mantenimiento')) {
      console.error('[equipmentStatusService] No maintenance in progress - user must START maintenance first');
      throw new Error('⚠️ No hay mantenimiento iniciado.\n\nDebes iniciar un mantenimiento ANTES de poder finalizarlo.\n\nCierra este formulario y abre nuevamente el wizard de mantenimiento para INICIAR uno nuevo.');
    }
    
    console.error('[equipmentStatusService] finishMaintenance failed', url, inventoryNo, res.status, data)
  }
  if (!res.ok || !data || !data.ok) {
    const msg = (data && data.msg) || (data && data.error) || `Error finalizando mantenimiento: ${res.status}`
    throw new Error(msg)
  }
  return data
}

// Obtener estado de mantenimiento de un equipo
export async function getMaintenanceFlowStatus(inventoryNo) {
  if (!inventoryNo) {
    console.warn('[equipmentStatusService] getMaintenanceFlowStatus called with empty inventoryNo');
    return { scheduled: null, in_progress: null, last_completed: null, history: [] }
  }
  const url = `/api/ops/maintenance/status?inventoryNo=${encodeURIComponent(inventoryNo)}`
  console.log('[equipmentStatusService] calling getMaintenanceFlowStatus with:', url)
  const res = await authedFetch(url)
  if (!res.ok) throw new Error(`Error fetching maintenance status: ${res.status}`)
  const data = await res.json().catch(() => null)
  if (!data || !data.ok) return { scheduled: null, in_progress: null, last_completed: null, history: [] }
  return {
    scheduled: data.scheduled || null,
    in_progress: data.in_progress || null,
    last_completed: data.last_completed || null,
    history: data.history || []
  }
}
