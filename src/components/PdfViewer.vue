<template>
  <div class="pdf-viewer-shell">
    <div v-if="loading" class="pdf-loading">Cargando PDF...</div>
    <div v-else-if="error" class="pdf-error">{{ error }}</div>
    <div v-else class="pdf-canvas-wrap">
      <canvas ref="canvas" class="pdf-canvas"></canvas>
      <div class="pdf-controls">
        <button @click="prevPage" :disabled="pageNumber <= 1">◀</button>
        <span>{{ pageNumber }} / {{ numPages }}</span>
        <button @click="nextPage" :disabled="pageNumber >= numPages">▶</button>
        <button @click="downloadPdf" class="download-btn">Descargar</button>
      </div>
      <div class="pdf-debug" v-if="(error || (lastFetchStatus && lastFetchStatus !== 200) || fallbackUsed)">
        <small style="color:rgba(230,235,245,0.7);">Estado fetch: {{ lastFetchStatus || '—' }} | Content-Type: {{ lastContentType || '—' }} | Bytes: {{ lastBytes || 0 }} | Fallback: {{ fallbackUsed ? 'sí' : 'no' }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { getStoredToken } from '@/utils/auth.js'

const props = defineProps({
  src: { type: String, required: true },
  scale: { type: Number, default: 1.0 }
})

const canvas = ref(null)
const loading = ref(true)
const error = ref('')
const pdfDoc = ref(null)
const pageNumber = ref(1)
const numPages = ref(0)
const lastFetchStatus = ref(null)
const lastContentType = ref(null)
const lastBytes = ref(0)
const fallbackUsed = ref(false)

// Configure worker: use Vite-served node_modules path so dev server can fetch it
try {
  // Use the worker served from the app's public/ directory to avoid Vite import issues.
  // public/pdf.worker.min.js delegates to a CDN-hosted worker; ensure this file exists.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
} catch (e) {
  // ignore
}

async function loadPdf() {
  loading.value = true
  // Aggressive multi-attempt strategy:
  const token = getStoredToken()
  const headersBase = token ? { 'Authorization': `Bearer ${token}` } : {}

  // Build candidate URLs to try (preview first, then download variants)
  const candidates = []
  if (props.src) candidates.push(props.src)
  try {
    const urlObj = new URL(props.src, window.location.href)
    // if contains '/preview' try '/download'
    if (urlObj.pathname.includes('/preview')) {
      const alt = props.src.replace('/preview', '/download')
      candidates.push(alt)
    }
    // try replacing '/pdfs/' preview id with '/pdfs/generated/download' as extra
    if (urlObj.pathname.includes('/pdfs/')) {
      const gen = props.src.replace(/\/pdfs\/.+\/preview/, '/pdfs/generated/download')
      if (gen && gen !== props.src) candidates.push(gen)
    }
  } catch (e) {}

  // Also add a brute-force download variant by appending '?download=1'
  if (props.src && !props.src.includes('download=1')) candidates.push(props.src + (props.src.includes('?') ? '&' : '?') + 'download=1')

  let fetched = false
  for (let i = 0; i < candidates.length && !fetched; i++) {
    const url = candidates[i]
    for (let attempt = 0; attempt < 3 && !fetched; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutMs = 8000 * (attempt + 1)
        const timeout = setTimeout(() => controller.abort(), timeoutMs)
        console.debug('[PdfViewer] trying candidate', url, 'attempt', attempt + 1)
        const resp = await fetch(url, { credentials: 'include', headers: headersBase, signal: controller.signal })
        clearTimeout(timeout)
        const contentType = resp.headers.get('content-type')
        lastFetchStatus.value = resp.status
        lastContentType.value = contentType
        console.debug('[PdfViewer] candidate resp', url, resp.status, contentType)
        if (!resp.ok) {
          console.debug('[PdfViewer] non-ok response, will retry or try next candidate')
          await new Promise(r => setTimeout(r, 200 * (attempt + 1)))
          continue
        }
        const arrayBuffer = await resp.arrayBuffer()
        lastBytes.value = arrayBuffer ? arrayBuffer.byteLength : 0
        if (!arrayBuffer || arrayBuffer.byteLength < 100) {
          console.debug('[PdfViewer] tiny response, skipping')
          continue
        }
        // successful fetch
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const doc = await loadingTask.promise
        pdfDoc.value = doc
        numPages.value = doc.numPages || 1
        await renderPage(pageNumber.value)
        fetched = true
      } catch (err) {
        console.warn('[PdfViewer] candidate attempt failed', err && err.message)
        // small backoff
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
      }
    }
  }

  if (!fetched) {
    // As a more aggressive server-driven option, attempt to call generate-force endpoint
    try {
      // derive folio from URL if possible
      let folioMatch = null
      try {
        const u = new URL(props.src, window.location.href)
        const m = u.pathname.match(/entrada\/(.+?)\//)
        if (m && m[1]) folioMatch = decodeURIComponent(m[1])
      } catch (e) {}
      if (folioMatch) {
        console.debug('[PdfViewer] attempting force-generate for folio', folioMatch)
        const gf = await fetch(`/api/ops/entrada/${encodeURIComponent(folioMatch)}/pdfs/generate-force`, { method: 'GET', credentials: 'include', headers: headersBase })
        if (gf && gf.ok) {
          // wait a bit and then retry original src once
          await new Promise(r => setTimeout(r, 1200))
          try {
            const retryResp = await fetch(props.src, { credentials: 'include', headers: headersBase })
            if (retryResp.ok) {
              const arr = await retryResp.arrayBuffer()
              const loadingTask = pdfjsLib.getDocument({ data: arr })
              const doc = await loadingTask.promise
              pdfDoc.value = doc
              numPages.value = doc.numPages || 1
              await renderPage(pageNumber.value)
              fetched = true
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[PdfViewer] generate-force attempt failed', e && e.message)
    }
  }

  if (!fetched) {
    // Final fallback: let pdf.js fetch the URL directly
    try {
      fallbackUsed.value = true
      const loadingTask2 = pdfjsLib.getDocument(props.src)
      const doc2 = await loadingTask2.promise
      pdfDoc.value = doc2
      numPages.value = doc2.numPages || 1
      await renderPage(pageNumber.value)
      fetched = true
    } catch (e2) {
      console.error('PdfViewer final fallback error', e2)
      error.value = String(e2 && e2.message ? e2.message : e2) || 'Error cargando PDF'
    }
  }
  loading.value = false
}

async function renderPage(pageNum) {
  if (!pdfDoc.value) return
  try {
    const page = await pdfDoc.value.getPage(pageNum)
    const viewport = page.getViewport({ scale: props.scale * (window.devicePixelRatio || 1) })
    const cnv = canvas.value
    if (!cnv) return
    const context = cnv.getContext('2d')
    cnv.width = Math.floor(viewport.width)
    cnv.height = Math.floor(viewport.height)
    const renderContext = { canvasContext: context, viewport }
    await page.render(renderContext).promise
  } catch (e) {
    console.error('PdfViewer renderPage error', e)
    error.value = 'Error renderizando página'
  }
}

function prevPage() {
  if (pageNumber.value <= 1) return
  pageNumber.value--
  renderPage(pageNumber.value)
}

function nextPage() {
  if (pageNumber.value >= numPages.value) return
  pageNumber.value++
  renderPage(pageNumber.value)
}

function downloadPdf() {
  // open in new tab using the src url
  window.open(props.src, '_blank')
}

watch(() => props.src, async () => {
  await loadPdf()
})

onMounted(() => {
  loadPdf()
})

onBeforeUnmount(() => {
  try { if (pdfDoc.value && pdfDoc.value.destroy) pdfDoc.value.destroy() } catch (e) {}
})
</script>

<style scoped>
.pdf-viewer-shell { display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; }
.pdf-loading, .pdf-error { color:rgba(230,235,245,0.9); padding:16px; }
.pdf-canvas-wrap { width:100%; display:flex; flex-direction:column; align-items:center; gap:8px; }
.pdf-canvas { max-width:100%; width:100%; height:auto; background:#fff; border-radius:8px; }
.pdf-controls { display:flex; gap:8px; align-items:center; }
.download-btn { margin-left:12px; padding:6px 10px; border-radius:6px; background:rgba(46,221,90,0.12); border:1px solid rgba(46,221,90,0.2); color:#2edd5a; }
</style>