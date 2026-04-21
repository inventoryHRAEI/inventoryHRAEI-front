<template>
  <div class="skeleton-loader" :class="['type-' + type, 'count-' + count]">
    <div v-if="type === 'cards'" class="skeleton-cards">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-body">
          <div class="skeleton-line" style="width: 100%"></div>
          <div class="skeleton-line" style="width: 85%"></div>
          <div class="skeleton-line" style="width: 70%"></div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-row">
        <div class="skeleton-cell" v-for="i in (tableColumns || 5)" :key="'header-' + i"></div>
      </div>
      <div v-for="i in count" :key="'row-' + i" class="skeleton-row">
        <div class="skeleton-cell" v-for="j in (tableColumns || 5)" :key="'cell-' + j"></div>
      </div>
    </div>

    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-circle"></div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line" style="width: 60%"></div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'form'" class="skeleton-form">
      <div v-for="i in count" :key="i" class="skeleton-form-group">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
    </div>

    <div v-else-if="type === 'detail'" class="skeleton-detail">
      <div class="skeleton-header-detail"></div>
      <div class="skeleton-body-detail">
        <div v-for="i in count" :key="i" class="skeleton-field">
          <div class="skeleton-label-detail"></div>
          <div class="skeleton-value"></div>
        </div>
      </div>
    </div>

    <div v-else class="skeleton-generic">
      <div v-for="i in count" :key="i" class="skeleton-line"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'cards',
    validator: (value) => ['cards', 'table', 'list', 'form', 'detail', 'generic'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  tableColumns: {
    type: Number,
    default: 5
  }
})
</script>

<style scoped>
@keyframes skeleton-loading {
  0% {
    background-color: rgba(200, 200, 200, 0.1);
  }
  50% {
    background-color: rgba(200, 200, 200, 0.3);
  }
  100% {
    background-color: rgba(200, 200, 200, 0.1);
  }
}

.skeleton-loader {
  width: 100%;
}

/* Cards skeleton */
.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  width: 100%;
}

.skeleton-card {
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-header {
  height: 120px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
}

.skeleton-body {
  padding: 16px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

/* Table skeleton */
.skeleton-table {
  width: 100%;
  border-collapse: collapse;
}

.skeleton-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.skeleton-cell {
  height: 20px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
}

/* List skeleton */
.skeleton-list {
  width: 100%;
}

.skeleton-list-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
}

.skeleton-content {
  flex: 1;
}

/* Form skeleton */
.skeleton-form {
  width: 100%;
}

.skeleton-form-group {
  margin-bottom: 20px;
}

.skeleton-label {
  height: 14px;
  width: 80px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-input {
  height: 36px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
}

/* Detail skeleton */
.skeleton-header-detail {
  height: 60px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
  margin-bottom: 20px;
}

.skeleton-body-detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.skeleton-field {
  padding: 12px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.02);
}

.skeleton-label-detail {
  height: 12px;
  width: 100px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-value {
  height: 20px;
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1) 25%, rgba(200, 200, 200, 0.2) 50%, rgba(200, 200, 200, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
}

/* Generic skeleton */
.skeleton-generic {
  width: 100%;
}

.skeleton-generic .skeleton-line {
  margin-bottom: 12px;
}
</style>
