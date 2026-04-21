<template>
    <div class="skeleton-container">
        <div class="skeleton-header">
            <div class="skeleton-title"></div>
        </div>

        <div class="skeleton-filters">
            <div class="skeleton-filter-item"></div>
            <div class="skeleton-filter-item"></div>
            <div class="skeleton-filter-item"></div>
        </div>

        <div class="skeleton-cards">
            <div v-for="i in 6" :key="i" class="skeleton-card">
                <div class="skeleton-card-header"></div>
                <div class="skeleton-card-body">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 20px;
}

.skeleton-header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.skeleton-title {
    width: 200px;
    height: 24px;
    background: linear-gradient(90deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1));
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 2s infinite;
}

.skeleton-filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.skeleton-filter-item {
    width: 120px;
    height: 36px;
    background: linear-gradient(90deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1));
    background-size: 200% 100%;
    border-radius: 6px;
    animation: shimmer 2s infinite;
}

.skeleton-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}

.skeleton-card {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(100, 116, 139, 0.1);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.skeleton-card-header {
    width: 100%;
    height: 16px;
    background: linear-gradient(90deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1));
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 2s infinite;
}

.skeleton-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-line {
    width: 100%;
    height: 12px;
    background: linear-gradient(90deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1));
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 2s infinite;
}

.skeleton-line.short {
    width: 60%;
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}
</style>
