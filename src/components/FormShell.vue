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
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:var(--form-wrap-min-height, 60vh); padding:12px }
.form-col{ width:100%; max-width:var(--form-col-max-width, 920px); margin:0 auto }
  .auth-card{ width:100%; display:block; }
  .auth-card-header{ padding:var(--auth-card-header-padding, 14px 18px); border-top-left-radius:var(--auth-card-radius, 18px); border-top-right-radius:var(--auth-card-radius, 18px) }
  .auth-card-header h2{ margin:0; font-size:var(--auth-card-title-size, 1.28rem); font-family: 'Poppins', 'Source Sans 3', sans-serif }
  .auth-card-body{ border-bottom-left-radius:var(--auth-card-radius, 18px); border-bottom-right-radius:var(--auth-card-radius, 18px); padding:var(--auth-card-body-padding, 20px) }
  /* ensure header and body visually join without extra border gaps */
  .auth-card-header, .auth-card-body { border: none }
/* .glass global class provides the card background, border and backdrop-filter */
.link-row{ text-align:center; margin-top:12px }
.msg{ margin-top:10px; color:green; text-align:center }
.error{ margin-top:10px; color:#b00020; text-align:center }

/* ====== Estilos de normalización para formularios dentro de FormShell ====== */
/* Asegura que controles y botones dentro de este shell usen las variables globales estándar */
:deep(.auth-card.glass) {
  --ui-control-min-height: var(--ui-control-min-height, 50px);
  --ui-control-padding-vertical: var(--ui-control-padding-vertical, 12px);
  --ui-control-padding-horizontal: var(--ui-control-padding-horizontal, 16px);
}

/* Form layout: only apply grid to forms that specifically need it (with .form-grid class) */
:deep(.auth-card-body) form.form-grid { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 18px; align-items: stretch }

/* Normalize field containers inside this shell - only for complex forms with .form-grid */
:deep(.auth-card-body) form.form-grid .field { display:flex; flex-direction:column; gap:8px; align-items:stretch }

/* Map legacy classes to tokens inside the shell - only for complex forms with .form-grid */
:deep(.auth-card-body) form.form-grid .control,
:deep(.auth-card-body) form.form-grid .input,
:deep(.auth-card-body) form.form-grid input,
:deep(.auth-card-body) form.form-grid select,
:deep(.auth-card-body) form.form-grid textarea { box-sizing: border-box; width:100%; min-height: var(--ui-control-min-height); padding: var(--ui-control-padding-vertical) var(--ui-control-padding-horizontal); font-size: var(--ui-control-font-size); border-radius: var(--ui-control-radius); }

/* Buttons inside the shell - only for complex forms with .form-grid */
:deep(.auth-card-body) form.form-grid .btn { padding: var(--ui-btn-padding-vertical) var(--ui-btn-padding-horizontal); border-radius: var(--ui-btn-radius); font-size: var(--ui-btn-font-size); }

/* Responsive adjustment: on narrow screens collapse grid forms to 1fr */
@media (max-width: 920px) {
  :deep(.auth-card-body) form.form-grid { grid-template-columns: 1fr; }
  .form-wrap { align-items:flex-start; }
}
</style>
