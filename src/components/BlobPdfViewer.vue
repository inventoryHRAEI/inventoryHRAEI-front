<template>
  <div class="blob-pdf-shell" style="height:100%; display:flex; flex-direction:column;">
    <div v-if="loading" class="pdf-loading">Cargando PDF...</div>
      <div v-else-if="error" class="pdf-error">{{ error }}</div>
      <div v-else class="pdf-embed" style="width:100%; height:100%; position:relative;">
        <div v-if="isPlaceholder" class="placeholder-shell" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:20; pointer-events:none">
          <div class="placeholder-card" style="pointer-events:auto; background:rgba(15,23,42,0.9); color:#fff; padding:20px; border-radius:10px; width:480px; text-align:center; box-shadow:0 10px 30px rgba(2,6,23,0.5)">
            <h3 style="margin:0 0 8px 0">Servicio de generación de PDF no disponible</h3>
            <p style="margin:0 0 12px 0; color:#d1d5db">Se ha mostrado un documento de reserva. Intenta de nuevo más tarde o descarga el archivo.</p>
            <p v-if="placeholderReason" style="margin:0 0 12px 0;color:#f8d7a3">Motivo: {{ placeholderReason }}</p>
            <div style="display:flex; gap:8px; justify-content:center">
              <button class="btn" @click="fetchAsBlob">Reintentar</button>
              <button class="btn" @click="downloadPlaceholder">Descargar PDF</button>
            </div>
          </div>
        </div>

        <iframe v-if="blobUrl && embedMode === 'iframe'" :src="blobUrl" title="PDF embebido" style="width:100%; height:100%; border:0; display:block;"></iframe>
        <object v-else-if="blobUrl" :data="blobUrl" type="application/pdf" width="100%" height="100%">
          <p>Tu navegador no puede mostrar PDFs embebidos. Usa el botón azul para abrir el PDF.</p>
        </object>
        <div v-else class="no-embed">No se pudo generar vista embebida.</div>

        <div class="pdf-actions" style="position:absolute; top:8px; right:8px; display:flex; gap:8px; align-items:center;">
          <a :href="blobUrl || src" target="_blank" rel="noopener noreferrer" class="btn-open">Abrir PDF</a>
          <div v-if="isPlaceholder" class="placeholder-note" style="margin-left:8px;padding:6px 8px;background:#f59e0b;color:#fff;border-radius:6px;font-size:12px">Placeholder: servicio PDF no disponible</div>
        </div>
        <div class="pdf-debug" style="position:absolute; left:8px; bottom:8px; color:rgba(230,235,245,0.7); font-size:12px">
          <div>HTTP: {{ lastStatus || '—' }} • Type: {{ lastContentType || '—' }} • Bytes: {{ lastBytes || 0 }}</div>
        </div>
      </div>
  </div>
</template> 

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
const props = defineProps({ src: { type: String }, blob: { type: [Object], required: false } })

const loading = ref(true)
const error = ref('')
const blobUrl = ref(null)
const lastStatus = ref(null)
const lastContentType = ref(null)
const lastBytes = ref(0)
const embedMode = ref('iframe') // try iframe first, fallback to object if needed
const isPlaceholder = ref(false)
const placeholderReason = ref('')

async function fetchAsBlob() {
  loading.value = true
  error.value = ''
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    const resp = await fetch(props.src, { credentials: 'include', signal: controller.signal, headers: { Accept: 'application/pdf' } })
    clearTimeout(timeout)
    lastStatus.value = resp.status
    const ctype = resp.headers.get('content-type')
    lastContentType.value = ctype
    // Detect placeholder header set by server when pdfService is down
    try {
      isPlaceholder.value = !!resp.headers.get('x-pdf-placeholder')
      placeholderReason.value = resp.headers.get('x-pdf-placeholder-reason') || ''
    } catch(e) { isPlaceholder.value = false; placeholderReason.value = '' }

    if (!resp.ok) {
      // Try to parse JSON error body for a friendlier message; be resilient to malformed JSON
      let bodyText = null
      try {
        bodyText = await resp.clone().text().catch(() => null)
      } catch (_) { bodyText = null }

      if (bodyText) {
        // First try normal JSON parse
        try {
          const json = JSON.parse(bodyText)
          const msgPart = json.msg || json.message || json.error || null
          if (msgPart) throw new Error(`HTTP ${resp.status} — ${msgPart}${json.error && json.msg ? ' — ' + json.error : ''}`)
        } catch (parseErr) {
          // If JSON.parse failed or didn't contain msg, try to extract a JSON substring and parse it
          try {
            const jsonMatch = bodyText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const candidate = jsonMatch[0]
              try {
                const json2 = JSON.parse(candidate)
                const msgPart = json2.msg || json2.message || json2.error || null
                if (msgPart) throw new Error(`HTTP ${resp.status} — ${msgPart}${json2.error && json2.msg ? ' — ' + json2.error : ''}`)
              } catch (_) {
                // continue to regex fallback
              }
            }

            // Try to extract fields with regex from the text (handles stringified JSON or other formats)
            const msgMatch = bodyText.match(/"msg"\s*:\s*"([^\"]+)"/) || bodyText.match(/msg"?\s*:\s*'([^']+)'/) || bodyText.match(/msg\s*[:=]\s*([^,\n\r}]+)/i)
            const errMatch = bodyText.match(/"error"\s*:\s*"([^\"]+)"/) || bodyText.match(/error"?\s*:\s*'([^']+)'/) || bodyText.match(/error\s*[:=]\s*([^,\n\r}]+)/i)
            const msgPart = msgMatch ? (msgMatch[1] || msgMatch[0]) : null
            const errPart = errMatch ? (errMatch[1] || errMatch[0]) : null
            if (msgPart || errPart) {
              const composed = `HTTP ${resp.status} — ${msgPart ? msgPart.trim() : ''}${msgPart && errPart ? ' — ' : ''}${errPart ? errPart.trim() : ''}`.replace(/\s+\-\-\s+$/, '')
              throw new Error(composed)
            }
          } catch (_) {
            // ignore and fallthrough to show raw body
          }

          // not parseable: show truncated body text
          const short = bodyText.length > 512 ? bodyText.slice(0, 512) + '...' : bodyText
          throw new Error(`HTTP ${resp.status} — ${short}`)
        }
      }

      // Fallback generic status error
      throw new Error(`HTTP ${resp.status}`)
    }
    // Prefer blob() to keep type info
    let b = await resp.blob()
    const size = b ? (b.size || 0) : 0
    lastBytes.value = size
    if (!b || size < 20) {
      // try arrayBuffer fallback
      const arr = await resp.arrayBuffer().catch(() => null)
      if (!arr || arr.byteLength < 20) throw new Error('Respuesta vacía o demasiado pequeña')
      b = new Blob([arr], { type: 'application/pdf' })
    }
    // If server sent a non-pdf type, coerce
    if (!b.type || !b.type.includes('pdf')) {
      b = new Blob([await b.arrayBuffer()], { type: 'application/pdf' })
      // prefer object fallback when type was not pdf
      embedMode.value = 'object'
    }
    blobUrl.value = URL.createObjectURL(b)
  } catch (e) {
    console.error('[BlobPdfViewer] error fetching blob', e)
    error.value = String(e && e.message ? e.message : e) || 'Error cargando PDF'
  } finally {
    loading.value = false
  }
}

function initFromBlobInput(b) {
  try {
    loading.value = false
    error.value = ''
    isPlaceholder.value = false
    placeholderReason.value = ''
    lastStatus.value = null
    lastContentType.value = b && b.type ? b.type : 'application/pdf'
    lastBytes.value = b && b.size ? b.size : 0
    console.log('[BlobPdfViewer] Initializing from blob:', { size: b?.size, type: b?.type });
    // coerce type if missing
    const coerced = (b && !b.type) ? new Blob([b], { type: 'application/pdf' }) : b;
    if (blobUrl.value) try { window.URL.revokeObjectURL(blobUrl.value) } catch(e){}
    blobUrl.value = window.URL.createObjectURL(coerced);
    console.log('[BlobPdfViewer] Created Blob URL:', blobUrl.value);
  } catch (e) {
    console.error('[BlobPdfViewer] Error initializing from blob prop', e);
    error.value = 'Error procesando PDF binario';
  }
}

function downloadPlaceholder() {
  // Use client-side placeholder generator
  try {
    const reason = placeholderReason.value || 'PDF service no disponible'
    // Lazy import to avoid circulars; call the global service
    import('@/services/pdfService').then(mod => {
      if (mod && typeof mod.generatePlaceholderPDF === 'function') mod.generatePlaceholderPDF(reason)
      else alert('No se pudo generar el PDF placeholder. Revisa consola.')
    }).catch(err => { console.error('Error importing pdfService for placeholder', err); alert('No se pudo generar el PDF placeholder.') })
  } catch (e) {
    console.error('Error downloading placeholder:', e)
    alert('Error generando placeholder: ' + (e && e.message ? e.message : e))
  }
}


onMounted(() => {
  if (props.blob) initFromBlobInput(props.blob)
  else if (props.src) fetchAsBlob()
  else {
    loading.value = false
    error.value = 'No hay fuente de PDF especificada'
  }
})

// watch blob prop to support dynamic updates
watch(() => props.blob, (nv) => {
  if (nv) initFromBlobInput(nv)
})

onBeforeUnmount(() => {
  try { if (blobUrl.value) URL.revokeObjectURL(blobUrl.value) } catch(e){}
})
</script>

<style scoped>
.blob-pdf-shell { height:100%; display:flex; flex-direction:column; }
.pdf-loading, .pdf-error { color: rgba(230,235,245,0.9); padding:12px }
.pdf-embed { position:relative; width:100%; height:100%; flex:1; }
.btn-open { background:#1866f2; color:#fff; padding:8px 12px; border-radius:8px; border:0; text-decoration:none; box-shadow: 0 2px 6px rgba(24,102,242,0.24) }
</style>
