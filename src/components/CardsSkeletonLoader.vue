<template>
    <div class="cards-skeleton-container">
        <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton-card-header"></div>
            <div class="skeleton-card-body">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line-mini"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.cards-skeleton-container {
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

.skeleton-line-mini {
    width: 40%;
    height: 10px;
    background: linear-gradient(90deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1));
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 2s infinite;
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
