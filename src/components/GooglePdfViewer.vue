<template>
  <div class="google-pdf-shell">
    <div v-if="!src" class="no-src">No hay URL de documento</div>
    <div v-else class="google-embed-wrap">
      <iframe :src="viewerUrl" title="PDF Viewer (Google)" frameborder="0" style="width:100%; height:100%; min-height:360px;"></iframe>
      <div class="google-controls">
        <a :href="src" target="_blank" rel="noopener noreferrer" class="btn-open-new">Abrir en nueva pestaña</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ src: { type: String, required: true } })

// Build a Google Docs viewer URL; Google expects a fully qualified URL
const viewerUrl = computed(() => {
  try {
    // If src is relative, make absolute using current location origin
    const u = new URL(props.src, window.location.href)
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(u.href)}`
  } catch (e) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(props.src)}`
  }
})
</script>

<style scoped>
.google-pdf-shell { width:100%; height:100%; display:flex; flex-direction:column; }
.google-embed-wrap { flex:1; display:flex; flex-direction:column; }
.google-controls { padding:8px 0; display:flex; justify-content:flex-end; }
.btn-open-new { background:transparent; border:1px solid rgba(255,255,255,0.08); color:inherit; padding:6px 10px; border-radius:6px; }
.no-src { color:rgba(230,235,245,0.8); padding:12px }
</style>
