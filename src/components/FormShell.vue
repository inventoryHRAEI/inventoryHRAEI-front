<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="auth-card glass">
        <header class="auth-card-header">
          <slot name="title"><h2>Formulario</h2></slot>
        </header>
        <div class="auth-card-body">
          <slot name="body"></slot>

          <div class="link-row">
            <slot name="links"></slot>
          </div>

          <div v-if="$slots.msg" class="msg"><slot name="msg" /></div>
          <div v-if="$slots.error" class="error"><slot name="error" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente de shell reusable para formularios tipo "glass".
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:520px }
  .auth-card{ width:100%; display:block; }
  .auth-card-header{ padding:12px 16px; border-top-left-radius:14px; border-top-right-radius:14px }
  .auth-card-header h2{ margin:0; font-size:1.4rem; font-family: 'Poppins', 'Source Sans 3', sans-serif }
  .auth-card-body{ border-bottom-left-radius:14px; border-bottom-right-radius:14px; padding:18px }
  /* ensure header and body visually join without extra border gaps */
  .auth-card-header, .auth-card-body { border: none }
/* .glass global class provides the card background, border and backdrop-filter */
.link-row{ text-align:center; margin-top:12px }
.msg{ margin-top:10px; color:green; text-align:center }
.error{ margin-top:10px; color:#b00020; text-align:center }
</style>
