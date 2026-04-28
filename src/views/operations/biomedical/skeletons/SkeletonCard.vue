<template>
  <div class="skeleton-card">
    <!-- Header -->
    <div class="skeleton-header">
      <div class="skeleton-number"></div>
      <div class="skeleton-status-badge"></div>
    </div>

    <!-- Body -->
    <div class="skeleton-body">
      <div class="skeleton-line skeleton-line-1"></div>
      <div class="skeleton-line skeleton-line-2"></div>
      <div class="skeleton-line skeleton-line-3"></div>
      <div class="skeleton-line skeleton-line-short"></div>
    </div>

    <!-- Footer -->
    <div class="skeleton-footer">
      <div class="skeleton-badge"></div>
      <div class="skeleton-badge"></div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.skeleton-card {
  background: #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  height: 240px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.skeleton-number {
  width: 40px;
  height: 20px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
}

.skeleton-status-badge {
  width: 60px;
  height: 20px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.08);
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.skeleton-line {
  height: 12px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.08);
}

.skeleton-line-1 { width: 100%; }
.skeleton-line-2 { width: 95%; }
.skeleton-line-3 { width: 90%; }
.skeleton-line-short { width: 60%; }

.skeleton-footer {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.skeleton-badge {
  width: 70px;
  height: 24px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.08);
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
