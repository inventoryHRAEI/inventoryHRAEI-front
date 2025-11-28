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
    
    <div v-else-if="type === 'hero'" class="skeleton-hero">
      <div class="skeleton-hero-left">
        <div class="skeleton skeleton-title wide" style="margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text" style="margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text short" style="margin-bottom: 24px;"></div>
        
        <div class="skeleton-stats">
          <div v-for="n in 3" :key="n" class="skeleton-stat-card">
            <div class="skeleton skeleton-avatar" style="width: 36px; height: 36px; margin-bottom: 12px;"></div>
            <div class="skeleton skeleton-text" style="margin-bottom: 8px; width: 60%;"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        </div>
        
        <div style="margin-top: 24px;">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button" style="margin-top: 10px;"></div>
        </div>
      </div>
      
      <div class="skeleton-hero-right">
        <div class="skeleton skeleton-carousel"></div>
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
    
    <div v-else-if="type === 'login'" class="skeleton-login">
      <div class="skeleton-login-header">
        <div class="skeleton skeleton-avatar" style="width: 80px; height: 80px; margin: 0 auto 16px;"></div>
        <div class="skeleton skeleton-title wide" style="margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text short" style="margin-bottom: 24px; width: 60%;"></div>
      </div>
      <div class="skeleton-login-form">
        <div v-for="n in 2" :key="n" class="skeleton-field">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-input"></div>
        </div>
        <div class="skeleton skeleton-checkbox" style="margin: 16px 0;"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <div class="skeleton skeleton-text short" style="width: 40%;"></div>
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
    validator: (val) => ['default', 'cards', 'list', 'form', 'hero', 'login'].includes(val)
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
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(255, 255, 255, 0.15) 80%,
    rgba(255, 255, 255, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 2.2s ease-in-out infinite;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(45, 221, 90, 0.1);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  50% { background-position: 0 0; }
  100% { background-position: -200% 0; }
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card-item {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid rgba(45, 221, 90, 0.15);
}

.skeleton-image {
  height: 160px;
  border-radius: 0;
}

.skeleton-content {
  padding: 18px;
}

.skeleton-title {
  height: 24px;
  margin-bottom: 14px;
  width: 70%;
}

.skeleton-title.wide {
  width: 50%;
  height: 32px;
  margin-bottom: 28px;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 10px;
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
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  border: 1px solid rgba(45, 221, 90, 0.1);
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-login {
  max-width: 520px;
  margin: 0 auto;
}

.skeleton-login-header {
  text-align: center;
  margin-bottom: 32px;
}

.skeleton-login-form {
  margin-bottom: 20px;
}

.skeleton-checkbox {
  height: 18px;
  width: 120px;
  border-radius: 4px;
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
  height: 52px;
  width: 160px;
  border-radius: 26px;
  margin-top: 16px;
}

.skeleton-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.skeleton-hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.skeleton-stat-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(45, 221, 90, 0.1);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.skeleton-hero-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-carousel {
  width: 100%;
  height: 400px;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .skeleton-hero {
    grid-template-columns: 1fr;
  }
  
  .skeleton-stats {
    grid-template-columns: 1fr;
  }
  
  .skeleton-carousel {
    height: 300px;
  }
}

@media (max-width: 640px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-stats {
    grid-template-columns: 1fr;
  }
}
</style>
