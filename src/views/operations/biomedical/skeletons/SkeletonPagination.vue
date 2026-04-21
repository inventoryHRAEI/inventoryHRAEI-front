<template>
  <div class="skeleton-pagination">
    <div class="skeleton-button"></div>
    <div class="skeleton-button skeleton-button-long"></div>
    <div class="skeleton-button"></div>
  </div>
</template>

<script setup></script>

<style scoped>
.skeleton-pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.skeleton-button {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #e0e0e0;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-button-long {
  width: 120px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
