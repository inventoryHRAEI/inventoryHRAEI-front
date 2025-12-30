<template>
  <div class="blob-pdf-shell">
    <div v-if="loading" class="pdf-loading">Cargando PDF...</div>
      <div v-else-if="error" class="pdf-error">{{ error }}</div>
      <div v-else class="pdf-embed" style="width:100%; height:100%; position:relative;">
        <iframe v-if="blobUrl && embedMode === 'iframe'" :src="blobUrl" title="PDF embebido" style="width:100%; height:100%; border:0; min-height:360px;"></iframe>
        <object v-else-if="blobUrl" :data="blobUrl" type="application/pdf" width="100%" height="100%">
          <p>Tu navegador no puede mostrar PDFs embebidos. Usa el botón azul para abrir el PDF.</p>
        </object>
        <div v-else class="no-embed">No se pudo generar vista embebida.</div>
        <div class="pdf-actions" style="position:absolute; top:8px; right:8px; display:flex; gap:8px;">
          <a :href="blobUrl || src" target="_blank" rel="noopener noreferrer" class="btn-open">Abrir PDF</a>
        </div>
        <div class="pdf-debug" style="position:absolute; left:8px; bottom:8px; color:rgba(230,235,245,0.7); font-size:12px">
          <div>HTTP: {{ lastStatus || '—' }} • Type: {{ lastContentType || '—' }} • Bytes: {{ lastBytes || 0 }}</div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({ src: { type: String, required: true } })

const loading = ref(true)
const error = ref('')
const blobUrl = ref(null)
const lastStatus = ref(null)
const lastContentType = ref(null)
const lastBytes = ref(0)
const embedMode = ref('iframe') // try iframe first, fallback to object if needed

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
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
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

onMounted(() => {
  fetchAsBlob()
})

onBeforeUnmount(() => {
  try { if (blobUrl.value) URL.revokeObjectURL(blobUrl.value) } catch(e){}
})
</script>

<style scoped>
.pdf-loading, .pdf-error { color: rgba(230,235,245,0.9); padding:12px }
.pdf-embed { position:relative; width:100%; height:100%; }
.btn-open { background:#1866f2; color:#fff; padding:8px 12px; border-radius:8px; border:0; text-decoration:none; box-shadow: 0 2px 6px rgba(24,102,242,0.24) }
</style>
