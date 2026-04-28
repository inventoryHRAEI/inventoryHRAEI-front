<template>
  <div class="wizard-root">
    <div class="wizard-inner container">
      <aside class="wizard-summary" v-if="showSummary">
        <slot name="summary">
          <!-- Default summary fallback -->
          <div class="summary-card">
            <h3>Resumen</h3>
            <slot name="summary-content" />
          </div>
        </slot>
      </aside>

      <section class="wizard-main">
        <header class="wizard-header" v-if="title">
          <h2 class="wizard-title">{{ title }}</h2>
          <p class="wizard-sub" v-if="subtitle">{{ subtitle }}</p>
        </header>

        <div class="wizard-body">
          <slot />
        </div>

        <footer class="wizard-footer">
          <slot name="controls">
            <div class="wizard-controls">
              <button class="btn btn-ghost" @click="$emit('back')">Atrás</button>
              <button class="btn btn-primary" @click="$emit('next')">Siguiente</button>
            </div>
          </slot>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showSummary: { type: Boolean, default: true }
})
</script>

<style scoped>
/* Root ensures flexible growth and natural scrolling */
.wizard-root {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px); /* leave space for topbar */
  padding-bottom: 36px; /* safe area */
  box-sizing: border-box;
}

/* Inner container aligns summary and main area */
.wizard-inner {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.wizard-summary {
  width: 320px;
  flex: 0 0 320px;
  position: sticky;
  top: calc(var(--topbar-top, 12px) + var(--topbar-height, 60px) + 16px);
  align-self: flex-start;
  max-height: calc(100vh - (var(--topbar-top, 12px) + var(--topbar-height, 60px) + 72px));
  overflow: auto;
  padding: 18px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 12px;
}

.wizard-main {
  flex: 1 1 auto;
  min-width: 0; /* allow inner content to truncate and scroll */
  display: flex;
  flex-direction: column;
}

.wizard-header {
  margin-bottom: 12px;
}

.wizard-title {
  margin: 0;
  font-size: 20px;
}
.wizard-sub {
  margin: 4px 0 0 0;
  color: rgba(255,255,255,0.6);
  font-size: 13px;
}

.wizard-body {
  /* This area can grow and scroll if content is large */
  flex: 1 1 auto;
  min-height: 320px;
  overflow: visible; /* allow drop-downs to escape */
}

.wizard-footer {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

/* Controls
   Use consistent button spacing based on 8px scale
*/
.wizard-controls { display:flex; gap:12px }

/* Summary card default style */
.summary-card { padding: 12px }

/* Small responsive adjustments */
@media (max-width: 980px) {
  .wizard-inner { flex-direction: column-reverse }
  .wizard-summary { width: 100%; flex: 0 0 auto; position: relative; top: auto; max-height: none }
}
</style>