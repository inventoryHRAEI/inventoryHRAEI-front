<template>
  <div class="history">
    <h4>Historial de Mantenimiento</h4>
    <table>
      <thead>
        <tr><th>#</th><th>Inicio</th><th>Fin</th><th>Técnico</th><th>Notas</th></tr>
      </thead>
      <tbody>
        <tr v-for="(h, idx) in items" :key="h.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ format(h.start) }}</td>
          <td>{{ h.end ? format(h.end) : 'En curso' }}</td>
          <td>{{ h.technician || '-' }}</td>
          <td>{{ h.notes || '-' }}</td>
        </tr>
        <tr v-if="items.length === 0"><td colspan="5" class="empty">No hay registros</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ items: { type: Array, default: () => [] } })

function format(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString() } catch { return s }
}



</script>

<style scoped>
.history { background:#fff; padding:12px; border-radius:8px }
.history h4 { margin:0 0 8px 0 }
table { width:100%; border-collapse:collapse }
thead th { text-align:left; padding:6px; font-weight:700 }
tbody td { padding:6px; border-top:1px solid #f1f1f1 }
.empty { text-align:center; padding:10px; color:#666 }
</style>