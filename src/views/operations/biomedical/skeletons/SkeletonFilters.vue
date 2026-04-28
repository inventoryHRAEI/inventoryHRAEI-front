<template>
  <div class="skeleton-filters">
    <!-- Search bar -->
    <div class="skeleton-search">
      <div class="skeleton-icon"></div>
      <div class="skeleton-input"></div>
    </div>

    <!-- Filter chips -->
    <div class="skeleton-chips">
      <div class="skeleton-chip" v-for="i in 4" :key="i"></div>
    </div>

    <!-- Date range -->
    <div class="skeleton-date-range">
      <div class="skeleton-field"></div>
      <div class="skeleton-field"></div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.skeleton-filters {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 4px;
  background: #e0e0e0;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-input {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  background: #e0e0e0;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.skeleton-chip {
  width: 80px;
  height: 32px;
  border-radius: 16px;
  background: #e0e0e0;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-date-range {
  display: flex;
  gap: 8px;
}

.skeleton-field {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  background: #e0e0e0;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
