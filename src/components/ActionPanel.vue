<template>
  <section class="action-panel glass">
    <header v-if="title || $slots.title" class="panel-header">
      <h2 class="panel-title"><slot name="title">{{ title }}</slot></h2>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({ title: { type: String, default: '' } })
</script>

<style scoped>
.action-panel{ border-radius:16px; padding:16px; }
.panel-header{ margin-bottom:8px }
.panel-title{ margin:0; font-size:1.4rem }
.panel-body{ width:100% }

/* Glass look */
.glass{ background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); box-shadow: 0 12px 30px rgba(2,6,23,.24); backdrop-filter: blur(8px) saturate(140%) }
</style>
