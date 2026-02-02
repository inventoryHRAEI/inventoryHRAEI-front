<template>
  <div class="inventory-subdireccion">
    <div class="sub-header">
      <div class="header-left">
        <h2 class="title">
          <IIcon name="ic:baseline-inventory-2" size="22" class="title-icon" />
          Insumos y Refacciones
        </h2>
        <p class="subtitle">
          <IIcon name="ic:baseline-local-hospital" size="14" class="subtitle-icon" />
          Gestión de existencias y control de almacén biomédico
        </p>
      </div>

      <div class="header-actions">
         <div class="search-box">
           <IIcon name="ic:baseline-search" size="20" class="search-icon" />
           <input 
             v-model="searchQuery" 
             type="text" 
             placeholder="Buscar por nombre, clave o fabricante..." 
             class="search-input"
           />
         </div>
         <button class="btn-refresh" @click="fetchArticulos" :disabled="loading" title="Actualizar lista">
           <IIcon name="ic:baseline-refresh" :class="{ 'anim-spin': loading }" />
         </button>
       </div>
    </div>

    <div class="quick-filters">
      <button class="chip" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">
        <IIcon name="ic:baseline-layers" size="16" />
        Todo
        <span class="chip-count">{{ articulos.length }}</span>
      </button>
      <button class="chip ok" :class="{ active: filterType === 'healthy' }" @click="filterType = 'healthy'">
        <IIcon name="ic:baseline-check-circle" size="16" />
        Con stock
        <span class="chip-count">{{ healthyCount }}</span>
      </button>
      <button class="chip warn" :class="{ active: filterType === 'low' }" @click="filterType = 'low'">
        <IIcon name="ic:baseline-warning-amber" size="16" />
        Bajo stock
        <span class="chip-count">{{ lowStockCount }}</span>
      </button>
      <button class="chip danger" :class="{ active: filterType === 'out' }" @click="filterType = 'out'">
        <IIcon name="ic:baseline-error-outline" size="16" />
        Sin stock
        <span class="chip-count">{{ outOfStockCount }}</span>
      </button>
      <button class="chip ghost" @click="searchQuery = ''; filterType = 'all'">
        <IIcon name="ic:baseline-filter-alt-off" size="16" />
        Limpiar
      </button>
    </div>


    <!-- Vista de Cuadrícula -->
    <div v-if="loading" class="loading-grid">
      <div v-for="i in 8" :key="i" class="skeleton-card"></div>
    </div>

    <div v-else-if="filteredArticulos.length > 0">
      <div class="stock-grid">
        <InventoryItemCard 
          v-for="item in paginatedArticulos" 
          :key="item.N" 
          :item="item" 
        />
      </div>

      <!-- Controles de Paginación -->
      <div class="pagination-container" v-if="totalPages > 1">
        <button 
          class="btn-nav" 
          :disabled="currentPage === 1" 
          @click="currentPage--"
        >
          <IIcon name="ic:baseline-chevron-left" /> Anterior
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="p in totalPages" 
            :key="p"
            class="page-btn"
            :class="{ active: p === currentPage }"
            @click="currentPage = p"
            v-show="Math.abs(p - currentPage) < 3 || p === 1 || p === totalPages"
          >
            {{ p }}
          </button>
        </div>

        <button 
          class="btn-nav" 
          :disabled="currentPage === totalPages" 
          @click="currentPage++"
        >
          Siguiente <IIcon name="ic:baseline-chevron-right" />
        </button>
      </div>
      
      <div class="pagination-info">
        <IIcon name="ic:baseline-info" size="14" class="info-icon" />
        Mostrando {{ paginatedArticulos.length }} de {{ filteredArticulos.length }} artículos encontrados
      </div>
    </div>

    <div v-else-if="fetchError" class="empty-results error-state">
      <div class="empty-illustration">
        <IIcon name="ic:baseline-cloud-off" size="64" />
      </div>
      <h3>Conexión interrumpida</h3>
      <p>No se pudo conectar con el servidor de inventario. Por favor, verifica que el sistema esté en línea.</p>
      <button @click="fetchArticulos" class="btn-clear btn-retry">
        <IIcon name="ic:baseline-refresh" /> Intentar Reconectar
      </button>
    </div>

    <div v-else class="empty-results">
      <div class="empty-illustration">
        <IIcon name="ic:baseline-inventory" size="64" />
      </div>
      <h3>No se encontraron artículos</h3>
      <p>Prueba con términos diferentes o limpia los filtros para ver todo el inventario.</p>
      <button @click="searchQuery = ''; filterType = 'all'" class="btn-clear">
        <IIcon name="ic:baseline-view-list" size="18" />
        Ver todo el catálogo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import IIcon from '@/components/IIcon.vue';
import InventoryItemCard from '@/components/inventario-biomedica/InventoryItemCard.vue';

const loading = ref(true);
const fetchError = ref(false);
const articulos = ref([]);
const searchQuery = ref('');
const filterType = ref('all');

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(12);

const fetchArticulos = async () => {
  loading.value = true;
  fetchError.value = false;
  try {
    const response = await fetch('/api/ops/stock-biomedica');
    if (!response.ok) throw new Error('Servidor offline');
    const data = await response.json();
    if (data.ok) {
        articulos.value = data.data;
    } else {
        fetchError.value = true;
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
};

const healthyCount = computed(() => 
  articulos.value.filter(i => (parseInt(i['TOTAL EXISTENCIAS']) || 0) > 5).length
);

const lowStockCount = computed(() => 
  articulos.value.filter(i => {
    const s = parseInt(i['TOTAL EXISTENCIAS']) || 0;
    return s > 0 && s <= 5;
  }).length
);

const outOfStockCount = computed(() => 
  articulos.value.filter(i => (parseInt(i['TOTAL EXISTENCIAS']) || 0) === 0).length
);

const filteredArticulos = computed(() => {
  let result = articulos.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(i => 
      (i['Descripción del bien'] || '').toLowerCase().includes(q) ||
      (i['Clave  HRAEI'] || '').toLowerCase().includes(q) ||
      (i['MARCA'] || '').toLowerCase().includes(q)
    );
  }

  if (filterType.value === 'healthy') {
    result = result.filter(i => (parseInt(i['TOTAL EXISTENCIAS']) || 0) > 5);
  } else if (filterType.value === 'low') {
    result = result.filter(i => {
      const s = parseInt(i['TOTAL EXISTENCIAS']) || 0;
      return s > 0 && s <= 5;
    });
  } else if (filterType.value === 'out') {
    result = result.filter(i => (parseInt(i['TOTAL EXISTENCIAS']) || 0) === 0);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredArticulos.value.length / itemsPerPage.value));

const paginatedArticulos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredArticulos.value.slice(start, start + itemsPerPage.value);
});

// Reiniciar a página 1 cuando se filtra o busca
watch([searchQuery, filterType], () => {
  currentPage.value = 1;
});

onMounted(fetchArticulos);
</script>

<style scoped>
.inventory-subdireccion {
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  gap: 20px;
}

.title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  color: #93c5fd;
}

.subtitle {
  color: #94a3b8;
  margin: 4px 0 0 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtitle-icon {
  color: #60a5fa;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.chip:hover {
  transform: translateY(-1px);
  background: rgba(30, 41, 59, 0.7);
}

.chip-count {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.chip.active {
  border-color: #3b82f6;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.18);
}

.chip.ok { color: #a7f3d0; }
.chip.warn { color: #fcd34d; }
.chip.danger { color: #fca5a5; }
.chip.ghost { color: #93c5fd; background: rgba(30, 41, 59, 0.25); }

.search-box {
  position: relative;
  width: 380px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 14px 12px 46px;
  border-radius: 14px;
  color: #f1f5f9;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #3b82f6;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  outline: none;
}

.btn-refresh {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #334155;
  color: #f1f5f9;
  transform: rotate(30deg);
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-card:hover {
  background: rgba(30, 41, 59, 0.6);
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.summary-card.active {
  background: rgba(30, 41, 59, 0.8);
  border-color: #3b82f6;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  transition: all 0.3s;
}

.card-icon .summary-icon {
  color: inherit;
}

.summary-card.active .card-icon {
  color: #f8fafc;
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.08);
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-info .count {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  color: #f8fafc;
}

.card-info .label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-top: 6px;
}

.summary-card.total.active .card-icon { color: #f8fafc; background: rgba(255,255,255,0.1); }
.summary-card.healthy.active .card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.summary-card.warning.active .card-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.summary-card.critical.active .card-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.skeleton-card {
  height: 240px;
  background: linear-gradient(90deg, rgba(30,41,59,0.5) 25%, rgba(51,65,85,0.5) 50%, rgba(30,41,59,0.5) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite;
  border-radius: 20px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.anim-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-results {
  text-align: center;
  padding: 100px 40px;
  background: rgba(30, 41, 59, 0.2);
  border-radius: 24px;
  border: 2px dashed rgba(255, 255, 255, 0.05);
}

.empty-illustration {
  color: #334155;
  margin-bottom: 24px;
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-nav:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.btn-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pagination-info {
  text-align: center;
  margin-top: 16px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.info-icon {
  color: #60a5fa;
}

.btn-clear {
  margin-top: 24px;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 12px 28px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-clear:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.btn-retry {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-retry:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.error-state {
  border: 2px dashed rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.03);
}

.error-state h3 { color: #f87171; }

@media (max-width: 1024px) {
  .search-box { width: 300px; }
}

@media (max-width: 768px) {
  .sub-header { flex-direction: column; align-items: flex-start; }
  .search-box { width: 100%; }
}
</style>
