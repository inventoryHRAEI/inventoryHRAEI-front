<template>
    <div v-if="visibleCount > pageSize && !loading" class="pagination">
        <button @click="firstPage" :disabled="currentPage === 1" class="btn-pagination"
            aria-label="Primera página">«</button>
        <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination"
            aria-label="Página anterior">Anterior</button>

        <div class="page-numbers">
            <button v-for="p in visiblePageNumbers" :key="`pg-${p}`" class="page-btn"
                :class="{ active: p === currentPage }" :disabled="p === '…'"
                @click="p !== '…' && goToPage(p)">{{ p
                }}</button>
        </div>

        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination"
            aria-label="Página siguiente">Siguiente</button>
        <button @click="lastPage" :disabled="currentPage === totalPages" class="btn-pagination"
            aria-label="Última página">»</button>

        <div class="page-info">Mostrando {{ displayedStart }}-{{ displayedEnd }} de {{ visibleCount }}
        </div>

        <div class="page-size-select">
            <label for="psize">Por página</label>
            <select id="psize" :value="pageSize" @change="changePageSize(Number($event.target.value))">
                <option :value="6">6</option>
                <option :value="12">12</option>
                <option :value="24">24</option>
                <option :value="48">48</option>
            </select>
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
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 2px solid #374151;
}

.btn-pagination {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #2d3748;
    border: 1.5px solid #4b5563;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #e5e7eb;
}

.btn-pagination:hover:not(:disabled) {
    background: #06b6d4;
    border-color: #06b6d4;
    color: #0f172a;
}

.btn-pagination:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-pagination svg {
    flex-shrink: 0;
}

.page-info {
    font-size: 0.9rem;
    color: #d1d5db;
    font-weight: 600;
    min-width: 120px;
    text-align: center;
}

.page-numbers {
    display: flex;
    gap: 6px;
    align-items: center;
}

.page-btn {
    padding: 6px 10px;
    background: transparent;
    border: 1px solid transparent;
    color: #cbd5e1;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
}

.page-btn.active {
    background: #06b6d4;
    color: #072027;
    border-color: transparent;
}

.page-btn:disabled {
    opacity: 0.6;
    cursor: default;
}

.page-size-select {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cbd5e1;
}

.page-size-select select {
    background: #263141;
    color: #e5e7eb;
    border: 1px solid #374151;
    padding: 6px 8px;
    border-radius: 6px;
}

@media (max-width: 1200px) {
    .pagination {
        gap: 12px;
        flex-wrap: wrap;
    }

    .btn-pagination {
        padding: 8px 12px;
        font-size: 0.85rem;
    }

    .page-numbers {
        gap: 4px;
    }

    .page-btn {
        padding: 5px 8px;
        font-size: 0.9rem;
    }

    .page-info {
        font-size: 0.85rem;
        min-width: 140px;
    }

    .page-size-select {
        gap: 6px;
        font-size: 0.85rem;
    }

    .page-size-select select {
        padding: 5px 6px;
        font-size: 0.85rem;
    }
}

@media (max-width: 768px) {
    .pagination {
        gap: 8px;
        width: 100%;
        padding: 15px 10px;
    }

    .btn-pagination {
        padding: 7px 10px;
        font-size: 0.8rem;
        flex-shrink: 1;
    }

    .page-numbers {
        order: 5;
        width: 100%;
        gap: 3px;
        justify-content: center;
    }

    .page-btn {
        padding: 4px 6px;
        font-size: 0.75rem;
    }

    .page-info {
        font-size: 0.75rem;
        order: 6;
        width: 100%;
    }

    .page-size-select {
        gap: 4px;
        font-size: 0.75rem;
        order: 7;
    }

    .page-size-select select {
        padding: 4px 4px;
        font-size: 0.75rem;
    }
}
</style>
