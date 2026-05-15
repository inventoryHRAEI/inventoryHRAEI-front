<template>
  <Teleport to="body">
    <Transition name="wz-fade">
      <div v-if="open" class="wz-backdrop" @click.self="$emit('close')">
        <div class="wz-container" :class="modeClass">
          <!-- Orbs decorativos (ligeros, solo CSS) -->
          <div class="wz-orb wz-orb-1" aria-hidden="true"></div>
          <div class="wz-orb wz-orb-2" aria-hidden="true"></div>

          <!-- Timeline -->
          <nav class="wz-timeline" v-if="steps.length > 1">
            <div
              v-for="(s, i) in steps"
              :key="i"
              class="wz-tl-node"
              :class="{ active: i === current, done: i < current }"
            >
              <div class="wz-tl-dot">
                <svg v-if="i < current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="wz-tl-check"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="wz-tl-label">{{ s }}</span>
              <div v-if="i < steps.length - 1" class="wz-tl-bar">
                <div class="wz-tl-bar-fill" :class="{ filled: i < current }"></div>
              </div>
            </div>
          </nav>

          <!-- Header -->
          <header class="wz-header">
            <div>
              <h1 class="wz-title">{{ title }}</h1>
              <p v-if="subtitle" class="wz-subtitle">{{ subtitle }}</p>
            </div>
            <button class="wz-close" @click="$emit('close')" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </header>

          <!-- Body (slot principal) -->
          <main class="wz-body">
            <slot />
          </main>

          <!-- Footer -->
          <footer class="wz-footer">
            <button
              v-if="current > 0"
              class="wz-btn wz-btn-back"
              @click="$emit('back')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Anterior
            </button>
            <div class="wz-spacer"></div>
            <button
              v-if="current < steps.length - 1"
              class="wz-btn wz-btn-next"
              :disabled="!canNext"
              @click="$emit('next')"
            >
              Siguiente
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button
              v-else
              class="wz-btn wz-btn-finish"
              :disabled="!canFinish || loading"
              @click="$emit('submit')"
            >
              <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else class="wz-spin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </span>
              {{ loading ? 'Procesando…' : 'Finalizar' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  open:      { type: Boolean, default: false },
  steps:     { type: Array,   default: () => [] },
  current:   { type: Number,  default: 0 },
  title:     { type: String,  default: '' },
  subtitle:  { type: String,  default: '' },
  canNext:   { type: Boolean, default: true },
  canFinish: { type: Boolean, default: false },
  loading:   { type: Boolean, default: false },
  modeClass: { type: String,  default: '' },
});

const emit = defineEmits(['close', 'back', 'next', 'submit']);

/* Atajos de teclado */
const onKey = (e) => {
  if (!props.open) return;
  if (e.key === 'Escape') { e.preventDefault(); emit('close'); }
};
onMounted(()   => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
/* =========================================================
   WizardShell – estilos compactos y GPU-friendly
   ========================================================= */

/* --- Transiciones --- */
.wz-fade-enter-active, .wz-fade-leave-active { transition: opacity .25s ease; }
.wz-fade-enter-from, .wz-fade-leave-to       { opacity: 0; }

/* --- Backdrop --- */
.wz-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  z-index: 900;
}

/* --- Container --- */
.wz-container {
  --accent: #60a5fa; --accent-dim: rgba(96,165,250,.15);
  position: relative;
  width: 100%; max-width: 1400px;
  max-height: 88vh;
  background: rgba(15,20,35,.92);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,.45);
  animation: wz-enter .35s cubic-bezier(.4,0,.2,1);
  /* GPU layer */
  will-change: transform, opacity;
  contain: style;
}
@keyframes wz-enter {
  from { opacity: 0; transform: translateY(16px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* --- Orbs decorativos (solo dos, blur bajo para perf) --- */
.wz-orb { position: absolute; border-radius: 50%; pointer-events: none; opacity: .18; filter: blur(80px); }
.wz-orb-1 { width: 340px; height: 340px; background: var(--accent); top: -140px; right: -80px; }
.wz-orb-2 { width: 280px; height: 280px; background: #8b5cf6; bottom: -100px; left: -60px; }

/* --- Timeline --- */
.wz-timeline {
  display: flex; align-items: center; gap: 0;
  padding: 16px 28px 12px;
  border-bottom: 1px solid rgba(255,255,255,.06);
  overflow-x: auto;
  scrollbar-width: none;
}
.wz-timeline::-webkit-scrollbar { display: none; }

.wz-tl-node {
  display: flex; align-items: center; gap: 0;
  flex-shrink: 0;
}
.wz-tl-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,.4);
  transition: all .3s ease;
  flex-shrink: 0;
}
.wz-tl-node.active .wz-tl-dot { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 12px var(--accent-dim); }
.wz-tl-node.done   .wz-tl-dot { border-color: #22c55e; background: rgba(34,197,94,.15); color: #22c55e; }

.wz-tl-check { width: 16px; height: 16px; }

.wz-tl-label {
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,.35);
  margin-left: 8px; white-space: nowrap;
  transition: color .3s;
}
.wz-tl-node.active .wz-tl-label { color: rgba(255,255,255,.85); }
.wz-tl-node.done   .wz-tl-label { color: rgba(255,255,255,.55); }

.wz-tl-bar {
  width: 48px; height: 3px;
  background: rgba(255,255,255,.06);
  border-radius: 9px;
  margin: 0 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.wz-tl-bar-fill {
  width: 0; height: 100%;
  background: #22c55e;
  border-radius: 9px;
  transition: width .4s ease;
}
.wz-tl-bar-fill.filled { width: 100%; }

/* --- Header --- */
.wz-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 28px 12px;
}
.wz-title  { margin: 0; font-size: 20px; font-weight: 700; color: #f0f7ff; line-height: 1.3; }
.wz-subtitle { margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,.4); }

.wz-close {
  width: 34px; height: 34px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  color: rgba(255,255,255,.5);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
  flex-shrink: 0;
}
.wz-close svg { width: 18px; height: 18px; }
.wz-close:hover { background: rgba(255,255,255,.1); color: #fff; border-color: rgba(255,255,255,.2); }

/* --- Body --- */
.wz-body {
  flex: 1; min-height: 0;
  padding: 20px 28px;
  overflow-y: auto;
  color: #e0e7ff;
  display: flex; flex-direction: column;
}
.wz-body::-webkit-scrollbar { width: 5px; }
.wz-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 9px; }

/* --- Footer --- */
.wz-footer {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 28px;
  border-top: 1px solid rgba(255,255,255,.06);
  background: rgba(0,0,0,.2);
}
.wz-spacer { flex: 1; }

/* --- Botones --- */
.wz-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
  white-space: nowrap;
  font-family: inherit;
}
.wz-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

.wz-btn-back  { background: rgba(255,255,255,.05); color: #cbd5e1; }
.wz-btn-back:hover { background: rgba(255,255,255,.1); }

.wz-btn-next  {
  background: rgba(96,165,250,.12); color: var(--accent);
  border-color: rgba(96,165,250,.25);
}
.wz-btn-next:hover:not(:disabled) {
  background: rgba(96,165,250,.2);
  box-shadow: 0 0 16px rgba(96,165,250,.15);
}

.wz-btn-finish {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 16px rgba(34,197,94,.25);
}
.wz-btn-finish:hover:not(:disabled) { box-shadow: 0 6px 24px rgba(34,197,94,.35); transform: translateY(-1px); }

.wz-btn:disabled { opacity: .4; cursor: not-allowed; }

.wz-spin { display: inline-flex; animation: wz-rotate .8s linear infinite; }
.wz-spin svg { width: 16px; height: 16px; }
@keyframes wz-rotate { to { transform: rotate(360deg); } }

/* --- Mode overrides --- */
.wz-mode-decommission {
  --accent: #f87171; --accent-dim: rgba(248,113,113,.15);
}
.wz-mode-decommission .wz-orb-1 { background: #ef4444; }
.wz-mode-decommission .wz-orb-2 { background: #dc2626; }
.wz-mode-decommission .wz-btn-next {
  background: rgba(248,113,113,.12);
  color: #f87171;
  border-color: rgba(248,113,113,.25);
}
.wz-mode-decommission .wz-btn-next:hover:not(:disabled) {
  background: rgba(248,113,113,.2);
  box-shadow: 0 0 16px rgba(248,113,113,.15);
}
.wz-mode-decommission .wz-btn-finish {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 16px rgba(239,68,68,.25);
}
.wz-mode-decommission .wz-btn-finish:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(239,68,68,.35);
}

.wz-mode-intake {
  --accent: #34d399; --accent-dim: rgba(52,211,153,.15);
}
.wz-mode-intake .wz-orb-1 { background: #10b981; }

.wz-mode-delete-catalog {
  --accent: #fb7185; --accent-dim: rgba(251,113,133,.15);
}
.wz-mode-delete-catalog .wz-orb-1 { background: #e11d48; }
.wz-mode-delete-catalog .wz-orb-2 { background: #9f1239; }
.wz-mode-delete-catalog .wz-btn-next {
  background: rgba(251,113,133,.12);
  color: #fb7185;
  border-color: rgba(251,113,133,.25);
}
.wz-mode-delete-catalog .wz-btn-next:hover:not(:disabled) {
  background: rgba(251,113,133,.2);
  box-shadow: 0 0 16px rgba(251,113,133,.15);
}
.wz-mode-delete-catalog .wz-btn-finish {
  background: linear-gradient(135deg, #e11d48, #be123c);
  box-shadow: 0 4px 16px rgba(225,29,72,.25);
}
.wz-mode-delete-catalog .wz-btn-finish:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(225,29,72,.35);
}

/* --- Responsive --- */
@media (max-width: 700px) {
  .wz-container { max-width: 100%; border-radius: 18px; }
  .wz-header, .wz-body, .wz-footer, .wz-timeline { padding-left: 16px; padding-right: 16px; }
  .wz-tl-label { display: none; }
  .wz-tl-bar   { width: 28px; margin: 0 6px; }
}
</style>
