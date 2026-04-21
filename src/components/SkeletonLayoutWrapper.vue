<template>
  <div>
    <div v-if="loading" class="skeleton-layout-wrapper">
      <slot name="skeleton">
        <!-- Default simple skeleton fallback -->
        <div class="skeleton-loading" style="display:flex;flex-direction:column;gap:12px">
          <div style="height:18px;width:40%;background:rgba(255,255,255,0.04);border-radius:6px"></div>
          <div style="height:14px;width:80%;background:rgba(255,255,255,0.03);border-radius:6px"></div>
          <div style="height:160px;width:100%;background:rgba(255,255,255,0.02);border-radius:10px"></div>
        </div>
      </slot>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false }
})
</script>

<style scoped>
.skeleton-loading { animation: skeleton-pulse 1.8s ease-in-out infinite }
@keyframes skeleton-pulse { 0% { opacity: .7 } 50% { opacity: .95 } 100% { opacity: .7 } }
</style>
