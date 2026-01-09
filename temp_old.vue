<template>
  <FormShell>
    <template #title>Inventario Biomédica</template>
    <div class="op-card">
      <h3>Inventario y Conteos</h3>
      <p class="muted">Esta sección está destinada al conteo e inventariado. Si lo que buscas es capturar insumos y consumibles adquiridos por el hospital, abre el formulario aquí:</p>
      <div class="actions">
        <router-link class="btn primary" :to="{ name: 'op-insumos-consumibles' }">Abrir Formulario de Insumos y Consumibles</router-link>
      </div>
    </div>
  </FormShell>
</template>

<script setup>
import FormShell from '@/components/FormShell.vue'
</script>

<style scoped>
.op-card{ background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(2,6,23,0.06) }
.muted{ color:#516173 }
.actions{ margin-top:12px }
.btn{ cursor:pointer; border:none; border-radius:999px; padding:10px 14px; font-weight:800 }
.btn.primary{ background:linear-gradient(90deg, var(--btn-green,#00c6a7), #00a5ff); color:#fff }
</style>
