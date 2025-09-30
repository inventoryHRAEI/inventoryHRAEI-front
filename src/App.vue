<template>
  <div class="app-bg">
    <!-- Responsive background image served via picture/srcset to pick AVIF/WebP/JPEG variants -->
    <div class="bg-media" aria-hidden="true">
        <picture>
  <img class="bg-img" src="/src/images/fondo2.jpg" alt="fondo"/> 
      </picture>
    </div>

    <header class="topbar">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <img src="/src/images/logo_sinfondo.png" alt="logo HRAEI" class="topbar-logo"/>
          <div>
            <strong>HRAEI</strong>
            <div class="small-text">Subdireccion de ingenieria biomedica</div>
          </div>
        </div>
        <div class="small-text">Sistema de gestion de inventarios</div>
      </div>
    </header>
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// App shell usa estilos globales en src/styles.css
</script>
