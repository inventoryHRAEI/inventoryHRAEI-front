<template>
  <FormShell>
    <template #title>Servicio</template>
    <div class="op-card">
      <h3>Componente: Servicio</h3>
      <p class="muted">Aquí irá tu formulario para órdenes de servicio y mantenimientos.</p>
    </div>
  </FormShell>
</template>

<script setup>
import FormShell from '@/components/FormShell.vue'
</script>

<style scoped>
.op-card{ background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(2,6,23,0.06) }
.muted{ color:#516173 }
</style>
