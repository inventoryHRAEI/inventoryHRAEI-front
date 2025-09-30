<template>
  <div class="home-container">
    <div class="glass">
      <h2>Bienvenido al Inventario</h2>
      <router-link to="/login">
        <button class="btn">Iniciar Sesión</button>
      </router-link>
    <br />
      <router-link to="/register">
        <br></br>
        <button class="btn">Registrarse</button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Home view usa clases globales desde src/styles.css
</script>

<style scoped>
.home-container { display:flex; justify-content:center; align-items:center; min-height:100vh }
</style>
