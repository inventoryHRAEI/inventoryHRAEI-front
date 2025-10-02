<template>
  <div class="form-wrap">
    <div class="form-col center">
      <div class="glass">
        <h2>Bienvenido al Inventario</h2>
        <p class="small-msg">Accede con tu cuenta o crea una nueva.</p>
        <div style="margin-top:16px; display:flex; gap:12px;">
          <router-link to="/login" class="btn">Iniciar Sesión</router-link>
          <router-link to="/register" class="btn">Registrarse</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Home sencillo que usa estilos globales
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:600px }
.small-msg{ color: var(--muted); margin-top:8px }
</style>
