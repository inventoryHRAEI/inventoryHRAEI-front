import { authedFetch } from '@/utils/api.js'
import { confirmReset, showLoading, closeModal, showSuccess, showError } from '@/utils/sweetAlertConfig'
import { useArchivedOrdersStore } from '@/stores/useArchivedOrdersStore.js'

export async function confirmAndResetFolios(orderType = 'resguardo', options = {}) {
  const { archivedPanelRef = null, timeoutMs = 60000 } = options || {}
  const humanLabel = (orderType || 'todos').toString().toLowerCase()

  const result = await confirmReset(
    'Confirmar reinicio de folios',
    `Al reiniciar, todas las órdenes actuales de tipo "${humanLabel}" se archivarán y la secuencia se reiniciará. Esta acción es irreversible. ¿Deseas continuar?`
  )
  if (!result || !result.isConfirmed) return null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // Mostrar modal de carga (no await para no bloquear el flujo)
    try { showLoading('Archivando órdenes y reiniciando folios...') } catch (e) { console.warn('[resetFolios] showLoading failed', e) }

    console.info('[resetFolios] sending request', { orderType, timeoutMs })

    // Build API URL: prefer VITE_API_URL, otherwise use relative /api (proxy).
    // Do NOT automatically switch to an explicit http://localhost:3002 URL when
    // the page is served over HTTPS — that triggers mixed-content blocking.
    const envApi = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL).replace(/\/+$/, '') : ''
    let url = envApi ? `${envApi.replace(/\/+$/, '')}/ops/reset-folios` : '/api/ops/reset-folios'
    console.info('[resetFolios] resolved url', url)
    let res = null
    try {
      res = await authedFetch(url, { method: 'POST', body: { type: orderType }, signal: controller.signal })
    } catch (fetchErr) {
      console.warn('[resetFolios] fetch failed', fetchErr)
      // If fetch failed due to network and we used a relative URL, attempt explicit backend ONLY
      // when the page is loaded over HTTP. If the page is HTTPS, a direct HTTP fallback
      // would be blocked by the browser (mixed content), so we recommend using the dev
      // server proxy or running the frontend in HTTP mode.
      const pageIsHttps = (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:')
      if (url.startsWith('/api') || url.includes('5173')) {
        if (pageIsHttps) {
          console.warn('[resetFolios] page is HTTPS; skipping HTTP fallback to avoid mixed-content blocking')
          throw fetchErr
        }
        const fallback = `http://localhost:3002/api/ops/reset-folios`
        console.info('[resetFolios] attempting fallback to', fallback)
        try { res = await authedFetch(fallback, { method: 'POST', body: { type: orderType }, signal: controller.signal }) } catch (e) { console.warn('[resetFolios] fallback fetch failed', e); throw fetchErr }
      } else {
        throw fetchErr
      }
    }
    clearTimeout(timeoutId)
    if (!res) throw new Error('Sin respuesta del servidor')

    const json = await (async () => { try { return await res.json() } catch { return {} } })()
    if (!res.ok) {
      console.warn('[resetFolios] server returned error', { status: res.status, body: json, url })
      // If we got 404 on the dev server origin, the proxy may not be forwarding.
      // Only attempt an explicit HTTP fallback when the page itself is HTTP
      // (otherwise the browser will block mixed-content requests).
      const pageIsHttps = (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:')
      if (res.status === 404 && !String(url).includes('localhost:3002')) {
        if (pageIsHttps) {
          console.warn('[resetFolios] received 404 but page is HTTPS — skipping HTTP fallback to avoid mixed-content')
        } else {
          const fallback = `http://localhost:3002/api/ops/reset-folios`
          console.info('[resetFolios] received 404, attempting fallback to', fallback)
          try {
            const fbRes = await authedFetch(fallback, { method: 'POST', body: { type: orderType }, signal: controller.signal })
            const fbJson = await (async () => { try { return await fbRes.json() } catch { return {} } })()
            if (fbRes.ok) {
              console.info('[resetFolios] fallback succeeded', fbJson)
              try { closeModal() } catch (e) {}
              await showSuccess('Operación completada', `Órdenes ${humanLabel} archivadas y folios reiniciados correctamente.`)
              // Emitir evento para la UI
              try {
                if (typeof window !== 'undefined') {
                  const entry = { type: orderType, timestamp: (new Date()).toISOString(), summary: fbJson }
                  try { window.dispatchEvent(new CustomEvent('folios:reset', { detail: entry })) } catch (e) { console.warn('[resetFolios] dispatch reset event failed (fallback)', e) }
                }
              } catch (ee) { console.warn('[resetFolios] persist/emit reset failed (fallback)', ee) }

              if (archivedPanelRef && archivedPanelRef.value && typeof archivedPanelRef.value.open === 'function') {
                try { await archivedPanelRef.value.open() } catch (e) { console.warn('[resetFolios] open archived panel failed', e) }
              }
              return fbJson
            }
          } catch (fbErr) { console.warn('[resetFolios] fallback request failed', fbErr) }
        }
      }
      throw new Error((json && (json.msg || json.error)) ? (json.msg || json.error) : `HTTP ${res.status}`)
    }

    // Cerrar modal de loading antes de mostrar éxito
    try { closeModal() } catch (e) {}
    await showSuccess('Operación completada', `Órdenes ${humanLabel} archivadas y folios reiniciados correctamente.`)

    console.debug('[resetFolios] success response', json)

    // Emitir evento para la UI
    try {
      if (typeof window !== 'undefined') {
        const entry = { type: orderType, timestamp: (new Date()).toISOString(), summary: json }
        try { window.dispatchEvent(new CustomEvent('folios:reset', { detail: entry })) } catch (e) { console.warn('[resetFolios] dispatch reset event failed', e) }
      }
    } catch (e) { console.warn('[resetFolios] emit reset event failed', e) }

    // Refrescar el store de archivados automáticamente (reactividad)
    try {
      const archivedStore = useArchivedOrdersStore()
      await archivedStore.fetchArchived(orderType)
      console.info('[resetFolios] archived orders store refreshed for', orderType)
    } catch (storeErr) {
      console.warn('[resetFolios] failed to refresh archived store', storeErr)
    }

    // Abrir panel de archivados si el caller lo proveyó
    if (archivedPanelRef && archivedPanelRef.value && typeof archivedPanelRef.value.open === 'function') {
      try { await archivedPanelRef.value.open() } catch (e) { console.warn('[resetFolios] open archived panel failed', e) }
    }

    return json
  } catch (e) {
    clearTimeout(timeoutId)
    try { closeModal() } catch (er) {}
    if (e && e.name === 'AbortError') {
      await showError('Timeout', 'La operación tardó demasiado y fue cancelada. Intenta de nuevo.')
    } else {
      await showError('Error', String(e && e.message ? e.message : e))
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}

export default { confirmAndResetFolios }