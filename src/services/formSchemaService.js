import { authedFetch } from '@/utils/api.js'

export async function fetchFormSchema(moduleKey) {
    const res = await authedFetch(`/api/ops/form-schemas/${encodeURIComponent(moduleKey)}`, {
        method: 'GET'
    })
    if (res.status === 404) return null
    const data = await res.json().catch(() => null)
    if (!res.ok) {
        const err = new Error((data && data.msg) || 'No se pudo cargar esquema')
        err.status = res.status
        throw err
    }
    return data && data.schema ? data.schema : null
}

export async function saveFormSchema(moduleKey, schema) {
    const res = await authedFetch(`/api/ops/form-schemas/${encodeURIComponent(moduleKey)}`, {
        method: 'PUT',
        body: JSON.stringify({ schema })
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
        const err = new Error((data && data.msg) || 'No se pudo guardar esquema')
        err.status = res.status
        throw err
    }
    return data
}
