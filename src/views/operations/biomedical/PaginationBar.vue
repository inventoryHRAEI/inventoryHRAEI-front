<template>
    <div v-if="visibleCount > pageSize && !loading" class="pagination-wrapper">
        <div class="pagination">
            <!-- Left Controls -->
            <div class="pagination-controls-left">
                <button @click="firstPage" :disabled="currentPage === 1" class="btn-pagination btn-icon"
                    aria-label="Primera página" title="Primera página">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 19 4 12 11 5"></polyline><polyline points="23 19 16 12 23 5"></polyline></svg>
                </button>
                <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination"
                    aria-label="Página anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 19 8 12 15 5"></polyline></svg>
                    <span>Anterior</span>
                </button>
            </div>

            <!-- Page Numbers -->
            <div class="page-numbers">
                <button v-for="p in visiblePageNumbers" :key="`pg-${p}`" class="page-btn"
                    :class="{ active: p === currentPage, ellipsis: p === '…' }" 
                    :disabled="p === '…'"
                    @click="p !== '…' && goToPage(p)">{{ p }}</button>
            </div>

            <!-- Right Controls -->
            <div class="pagination-controls-right">
                <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination"
                    aria-label="Página siguiente">
                    <span>Siguiente</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 19 16 12 9 5"></polyline></svg>
                </button>
                <button @click="lastPage" :disabled="currentPage === totalPages" class="btn-pagination btn-icon"
                    aria-label="Última página" title="Última página">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 19 20 12 13 5"></polyline><polyline points="1 19 8 12 1 5"></polyline></svg>
                </button>
            </div>
        </div>

        <!-- Info and Size Selector -->
        <div class="pagination-footer">
            <div class="page-info">
                <span class="info-label">Mostrando</span>
                <span class="info-value">{{ displayedStart }}-{{ displayedEnd }}</span>
                <span class="info-label">de</span>
                <span class="info-value">{{ visibleCount }}</span>
                <span class="info-label">registros</span>
            </div>

            <div class="page-size-select">
                <label for="psize">Items por página:</label>
                <select id="psize" :value="pageSize" @change="changePageSize(Number($event.target.value))">
                    <option :value="6">6</option>
                    <option :value="12">12</option>
                    <option :value="24">24</option>
                    <option :value="48">48</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    visibleCount: {
        type: Number,
        default: 0
    },
    pageSize: {
        type: Number,
        default: 6
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 1
    },
    visiblePageNumbers: {
        type: Array,
        default: () => []
    },
    displayedStart: {
        type: Number,
        default: 0
    },
    displayedEnd: {
        type: Number,
        default: 0
    },
    loading: {
        type: Boolean,
        default: false
    },
    firstPage: {
        type: Function,
        required: true
    },
    previousPage: {
        type: Function,
        required: true
    },
    nextPage: {
        type: Function,
        required: true
    },
    lastPage: {
        type: Function,
        required: true
    },
    goToPage: {
        type: Function,
        required: true
    },
    changePageSize: {
        type: Function,
        required: true
    }
})
</script>

<style scoped>
.pagination-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    margin-top: 32px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(10px);
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.pagination-controls-left,
.pagination-controls-right {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 0 8px;
}

.btn-pagination {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 11px 15px;
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    border: 1.5px solid rgba(6, 182, 212, 0.6);
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ffffff;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
}

.btn-pagination::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
    z-index: 1;
}

.btn-pagination:hover:not(:disabled) {
    background: linear-gradient(135deg, #0284c7 0%, #0891b2 100%);
    border-color: rgba(6, 182, 212, 1);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
}

.btn-pagination:hover:not(:disabled)::before {
    left: 100%;
}

.btn-pagination:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.btn-pagination:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%);
    border-color: rgba(100, 116, 139, 0.3);
}

.btn-pagination.btn-icon {
    padding: 11px 11px;
    border-radius: 12px;
}

.btn-pagination svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    stroke-width: 2.5;
    position: relative;
    z-index: 2;
}

.page-numbers {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding: 8px 12px;
    background: rgba(15, 23, 42, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(6, 182, 212, 0.15);
}

.page-btn {
    padding: 9px 13px;
    background: rgba(30, 41, 59, 0.6);
    border: 1.5px solid rgba(6, 182, 212, 0.3);
    color: #cbd5e1;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    min-width: 40px;
    text-align: center;
    position: relative;
}

.page-btn:hover:not(:disabled):not(.ellipsis) {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.7);
    color: #06b6d4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
}

.page-btn.active {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: #001f3f;
    border-color: rgba(6, 182, 212, 1);
    font-weight: 800;
    box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
    transform: scale(1.05);
}

.page-btn.ellipsis {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: default;
    padding: 6px 4px;
}

.page-btn:disabled:not(.active) {
    opacity: 0.45;
    cursor: default;
}

.pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(34, 211, 238, 0.05) 100%);
    border-radius: 12px;
    border: 1px solid rgba(6, 182, 212, 0.25);
    flex-wrap: wrap;
}

.page-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    color: #e0e7ff;
    font-weight: 500;
}

.info-label {
    color: #94a3b8;
    font-weight: 500;
}

.info-value {
    color: #06b6d4;
    font-weight: 800;
    padding: 4px 10px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%);
    border-radius: 6px;
    border: 1px solid rgba(6, 182, 212, 0.2);
}

.page-size-select {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #e0e7ff;
    font-weight: 600;
    font-size: 0.95rem;
}

.page-size-select label {
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-size: 0.8rem;
}

.page-size-select select {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    color: #e0e7ff;
    border: 1.5px solid rgba(6, 182, 212, 0.4);
    padding: 10px 14px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    font-size: 0.9rem;
}

.page-size-select select:hover {
    border-color: rgba(6, 182, 212, 0.8);
    background: linear-gradient(135deg, rgba(37, 52, 79, 0.95) 0%, rgba(20, 30, 48, 0.95) 100%);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
}

.page-size-select select:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.2);
}

@media (max-width: 1024px) {
    .pagination-wrapper {
        padding: 20px;
        gap: 16px;
    }

    .pagination {
        gap: 12px;
    }

    .btn-pagination {
        padding: 10px 13px;
        font-size: 0.85rem;
    }

    .page-btn {
        padding: 8px 11px;
        font-size: 0.85rem;
        min-width: 38px;
    }

    .pagination-footer {
        gap: 16px;
        padding: 14px 16px;
    }

    .page-info {
        font-size: 0.9rem;
        gap: 6px;
    }

    .page-size-select {
        gap: 10px;
        font-size: 0.9rem;
    }
}

@media (max-width: 768px) {
    .pagination-wrapper {
        padding: 16px;
        gap: 14px;
        margin-top: 24px;
        border-radius: 12px;
    }

    .pagination {
        gap: 6px;
        justify-content: space-around;
        padding: 8px;
    }

    .pagination-controls-left,
    .pagination-controls-right {
        gap: 2px;
    }

    .btn-pagination {
        padding: 9px 8px;
        font-size: 0.7rem;
        min-width: 40px;
    }

    .btn-pagination span {
        display: none;
    }

    .btn-pagination.btn-icon {
        padding: 9px 9px;
        display: inline-flex;
    }

    .page-numbers {
        order: 3;
        width: 100%;
        gap: 4px;
        padding: 8px 8px;
    }

    .page-btn {
        padding: 7px 9px;
        font-size: 0.75rem;
        min-width: 36px;
    }

    .page-btn.active {
        transform: scale(1.02);
    }

    .pagination-footer {
        flex-direction: column;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
    }

    .page-info {
        width: 100%;
        justify-content: center;
        font-size: 0.85rem;
        gap: 4px;
    }

    .info-value {
        padding: 3px 8px;
        font-size: 0.85rem;
    }

    .page-size-select {
        width: 100%;
        justify-content: center;
        font-size: 0.85rem;
        gap: 8px;
    }

    .page-size-select label {
        font-size: 0.75rem;
    }

    .page-size-select select {
        padding: 8px 10px;
        font-size: 0.85rem;
    }
}

@media (max-width: 480px) {
    .pagination-wrapper {
        padding: 14px;
        gap: 12px;
    }

    .pagination {
        gap: 4px;
    }

    .btn-pagination {
        padding: 8px 6px;
        font-size: 0.65rem;
        min-width: 36px;
    }

    .btn-pagination svg {
        width: 16px;
        height: 16px;
    }

    .pagination-controls-left,
    .pagination-controls-right {
        gap: 0;
    }

    .page-numbers {
        gap: 3px;
        padding: 6px 6px;
    }

    .page-btn {
        padding: 6px 8px;
        font-size: 0.7rem;
        min-width: 32px;
    }

    .pagination-footer {
        padding: 10px 12px;
        gap: 10px;
    }

    .page-info {
        font-size: 0.75rem;
        gap: 3px;
    }

    .page-size-select {
        font-size: 0.75rem;
        gap: 6px;
    }

    .page-size-select select {
        padding: 6px 8px;
        font-size: 0.75rem;
    }
}
</style>
