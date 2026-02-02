<template>
  <div class="skeleton-section">
    <div class="skeleton-header">
      <div class="skeleton-icon"></div>
      <div class="skeleton-text">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
    </div>

    <div class="skeleton-fields">
      <div v-for="i in fieldCount" :key="i" class="skeleton-field">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  fieldCount: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-section {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-header {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.skeleton-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 2s infinite;
  flex-shrink: 0;
}

.skeleton-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  width: 60%;
  height: 20px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 2s infinite;
}

.skeleton-subtitle {
  width: 40%;
  height: 14px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.08));
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 2s infinite 0.1s;
}

.skeleton-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.skeleton-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-label {
  width: 50%;
  height: 14px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.08));
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 2s infinite 0.2s;
}

.skeleton-input {
  width: 100%;
  height: 42px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
  background-size: 200% 100%;
  border-radius: 10px;
  animation: shimmer 2s infinite 0.3s;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
