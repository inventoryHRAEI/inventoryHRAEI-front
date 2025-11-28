<template>
  <div class="skeleton-wrapper">
    <div v-if="type === 'cards'" class="skeleton-grid">
      <div v-for="n in count" :key="n" class="skeleton-card-item">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="n in count" :key="n" class="skeleton-list-item">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'form'" class="skeleton-form">
      <div class="skeleton skeleton-title wide"></div>
      <div v-for="n in count" :key="n" class="skeleton-field">
        <div class="skeleton skeleton-label"></div>
        <div class="skeleton skeleton-input"></div>
      </div>
      <div class="skeleton skeleton-button"></div>
    </div>
    
    <div v-else class="skeleton-default">
      <div v-for="n in count" :key="n" class="skeleton skeleton-text" :class="{ short: n % 3 === 0 }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'cards', 'list', 'form'].includes(val)
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.skeleton-image {
  height: 140px;
  border-radius: 0;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-title {
  height: 20px;
  margin-bottom: 12px;
  width: 70%;
}

.skeleton-title.wide {
  width: 50%;
  height: 28px;
  margin-bottom: 24px;
}

.skeleton-text {
  height: 14px;
  margin-bottom: 8px;
  width: 100%;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-form {
  max-width: 400px;
}

.skeleton-field {
  margin-bottom: 20px;
}

.skeleton-label {
  height: 12px;
  width: 30%;
  margin-bottom: 8px;
}

.skeleton-input {
  height: 44px;
  border-radius: 10px;
}

.skeleton-button {
  height: 48px;
  width: 140px;
  border-radius: 24px;
  margin-top: 12px;
}

@media (max-width: 640px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
