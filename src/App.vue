<template>
  <div class="app-bg">
    <div class="bg-media" aria-hidden="true">
      <picture>
        <img class="bg-img" src="/src/images/fondo2.jpg" alt="fondo" />
      </picture>
    </div>

    <header class="topbar" role="banner">
      <div class="container topbar-inner">
        <div class="brand" aria-label="HRAEI">
          <img src="/src/images/logo_sinfondo.png" alt="logo" class="topbar-logo" />
          <div class="brand-text">
            <div class="brand-title">HRAEI</div>
            <div class="brand-sub">Subdirección de Ingeniería Biomédica</div>
          </div>
        </div>

        <div class="topbar-actions" role="navigation" aria-label="Main navigation">
          <div class="site-title">Sistema de gestión de inventarios</div>
          <nav class="actions">
            <router-link to="/login" class="top-action">Iniciar sesión</router-link>
            <router-link to="/register" class="top-action">Registrarse</router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// App shell: estilos globales importados en main.js
</script>

