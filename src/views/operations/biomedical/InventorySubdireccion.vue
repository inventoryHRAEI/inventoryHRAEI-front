<template>
    <div class="inventory-subdireccion">
        <!-- Toast Notification -->
        <Transition name="toast-fade">
            <div v-if="showNotification" class="toast-notification"
                :class="('toast-' + notificationType) + (actionType ? (' toast-' + actionType) : '')">
                <div class="toast-content">
                    <IIcon :name="notificationType === 'success' ? 'ic:baseline-check-circle' : 'ic:baseline-info'"
                        size="20" class="toast-icon" />
                    <span class="toast-message">{{ notificationMessage }}</span>
                </div>
                <button class="toast-close" @click="showNotification = false">
                    <IIcon name="ic:baseline-close" size="18" />
                </button>
            </div>
        </Transition>

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
        </div>

        <div class="header-toolbar">
            <div class="action-buttons-container" v-if="canManageBiomedical">
                <button class="btn-warehouse-transfer" @click="openMovement" title="Mover stock entre bodegas">
                    <IIcon name="ic:baseline-swap-horiz" size="20" color="#22c55e" />
                    <span class="btn-text">Mover Stock</span>
                </button>
                <button class="btn-consumable-intake" @click="openIntake" title="Resurtir o crear nuevos consumibles">
                    <IIcon name="ic:baseline-add-circle-outline" size="20" color="#a855f7" />
                    <span class="btn-text">Ingresar Bienes</span>
                </button>
                <button class="btn-decommission" @click="openDecommission" title="Dar de baja artículos del inventario">
                    <IIcon name="ic:baseline-delete-forever" size="20" color="#ef4444" />
                    <span class="btn-text">Dar de Baja</span>
                </button>
            </div>

            <div class="search-and-refresh">
                <div class="search-box">
                    <IIcon name="ic:baseline-search" size="20" class="search-icon" />
                    <input ref="searchInput" v-model="searchQuery" type="text"
                        placeholder="Buscar por nombre, clave o fabricante..." class="search-input"
                        @keydown="handleSearchKeydown" />
                </div>
                <div class="view-toggle-group">
                    <button class="btn-view-toggle" :class="{ active: viewMode === 'cards' }"
                        @click="viewMode = 'cards'" title="Vista de tarjetas">
                        <IIcon name="ic:baseline-view-comfy" size="18"
                            :color="viewMode === 'cards' ? '#60a5fa' : '#94a3b8'" />
                    </button>
                    <button class="btn-view-toggle" :class="{ active: viewMode === 'table' }"
                        @click="viewMode = 'table'" title="Vista de tabla">
                        <IIcon name="ic:baseline-view-list" size="18"
                            :color="viewMode === 'table' ? '#60a5fa' : '#94a3b8'" />
                    </button>
                </div>
                <button class="btn-refresh" @click="fetchArticulos" :disabled="loading" title="Actualizar lista">
                    <IIcon name="ic:baseline-refresh" size="20" :color="loading ? '#fbbf24' : '#60a5fa'"
                        :class="{ 'anim-spin': loading }" />
                </button>
            </div>
        </div>

        <!-- Modales -->
        <MovementWizard :open="movementOpen" @close="movementOpen = false" @success="handleWizardSuccess" />
        <IntakeWizard :open="intakeOpen" @close="intakeOpen = false" @success="handleWizardSuccess" />
        <DecommissionWizard :open="decommissionOpen" @close="decommissionOpen = false" @success="handleWizardSuccess" />
        <KardexPreviewModal :isOpen="kardexModalOpen" :itemData="kardexModalData" title="Vista Previa del Kardex"
            @close="kardexModalOpen = false" />

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


        <!-- Vista de Cuadrícula o Tabla -->
        <div v-if="loading" class="loading-grid">
            <div v-for="i in 8" :key="i" class="skeleton-card"></div>
        </div>

        <div v-else-if="filteredArticulos.length > 0">
            <!-- Vista de Tarjetas -->
            <template v-if="viewMode === 'cards'">
                <div class="stock-grid" ref="gridRef">
                    <InventoryItemCard v-for="(item, idx) in paginatedArticulos"
                        :key="getItemKey(item) || ('item-' + idx)" :item="item"
                        :is-new="newItemIds.has(getItemKey(item))" @edit="handleEditItem" />
                </div>

                <!-- Update consumable/refacción panel -->
                <UpdateConsumablePanel v-model="updateItemModalOpen" :item="updateItemData"
                    @item-updated="onItemUpdated" />

                <!-- Controles de Paginación para Tarjetas -->
                <div class="pagination-container" v-if="totalPages > 1">
                    <button class="btn-nav" :disabled="currentPage === 1" @click="currentPage--">
                        <IIcon name="ic:baseline-chevron-left" /> Anterior
                    </button>

                    <div class="page-numbers">
                        <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === currentPage }"
                            @click="currentPage = p"
                            v-show="Math.abs(p - currentPage) < 3 || p === 1 || p === totalPages">
                            {{ p }}
                        </button>
                    </div>

                    <button class="btn-nav" :disabled="currentPage === totalPages" @click="currentPage++">
                        Siguiente
                        <IIcon name="ic:baseline-chevron-right" />
                    </button>
                </div>

                <div class="pagination-info">
                    <IIcon name="ic:baseline-info" size="14" class="info-icon" />
                    Mostrando {{ paginatedArticulos.length }} de {{ filteredArticulos.length }} artículos encontrados
                </div>
            </template>

            <!-- Vista de Tabla -->
            <template v-else-if="viewMode === 'table'">
                <ConsumablesTable :items="filteredArticulos" :itemsPerPage="15" @edit="handleEditItem"
                    @move-stock="openMovement" @add-intake="openIntake" @decommission="openDecommission"
                    @view-kardex="handleViewKardex" />
                <UpdateConsumablePanel v-model="updateItemModalOpen" :item="updateItemData"
                    @item-updated="onItemUpdated" />
            </template>
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
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import UpdateConsumablePanel from '@/components/UpdateConsumablePanel.vue'
import KardexPreviewModal from '@/components/KardexPreviewModal.vue';
import IIcon from '@/components/IIcon.vue';
import InventoryItemCard from '@/components/inventario-biomedica/InventoryItemCard.vue';
import ConsumablesTable from '@/components/ConsumablesTable.vue';
import MovementWizard from '@/components/inventario-biomedica/MovementWizard.vue';
import IntakeWizard from '@/components/inventario-biomedica/IntakeWizard.vue';
import DecommissionWizard from '@/components/inventario-biomedica/DecommissionWizard.vue';
import { usePermissions } from '@/composables/usePermissions.js'
import notificationStore from '@/stores/notificationStore.js'

const { canManageBiomedical, isAdmin } = usePermissions()

// Inicializa notificaciones push
const initNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notificaciones push habilitadas');
            }
        } catch (error) {
            console.warn('Error solicitando permiso de notificaciones:', error);
        }
    }
};

const sendPushNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                icon: '/vite.svg',
                badge: '/vite.svg',
                tag: 'inventory-alert',
                requireInteraction: true,
                ...options
            });
        } catch (error) {
            console.warn('Error enviando notificación:', error);
        }
    }
};

const pickItemValue = (item, aliases = [], fallback = '') => {
    if (!item || typeof item !== 'object') return fallback

    const normalizeKey = (key) => String(key || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()

    const normalizedLookup = new Map()
    Object.keys(item).forEach((k) => {
        const normalized = normalizeKey(k)
        if (normalized && !normalizedLookup.has(normalized)) normalizedLookup.set(normalized, k)
    })

    for (const alias of aliases) {
        if (Object.prototype.hasOwnProperty.call(item, alias) && item[alias] !== null && item[alias] !== undefined && item[alias] !== '') {
            return item[alias]
        }
        const foundKey = normalizedLookup.get(normalizeKey(alias))
        if (foundKey && item[foundKey] !== null && item[foundKey] !== undefined && item[foundKey] !== '') {
            return item[foundKey]
        }
    }

    return fallback
}

const getItemStock = (item) => {
    const raw = pickItemValue(item, ['TOTAL EXISTENCIAS', 'Total Excistencias', 'total_existencias', 'totalExistencias', 'Cantidad_Stock', 'CANTIDAD', 'Cantidad', 'cantidad'], 0)
    const parsed = parseInt(raw, 10)
    if (Number.isFinite(parsed)) return parsed
    const num = Number(raw)
    return Number.isFinite(num) ? num : 0
}

const getItemKey = (item) => {
    const clave = String(pickItemValue(item, ['Clave  HRAEI', 'Clave HRAEI', 'clave_hraei', 'clave'], '') || '').trim()
    const n = String(pickItemValue(item, ['N', 'n'], '') || '').trim()
    const lote = String(pickItemValue(item, ['LOTE', 'Lote', 'lote'], '') || '').trim()
    const ref = String(pickItemValue(item, ['REFERENCIA', 'Referencia', 'referencia'], '') || '').trim()
    const marca = String(pickItemValue(item, ['MARCA', 'Marca', 'marca'], '') || '').trim()
    const modelo = String(pickItemValue(item, ['MODELO', 'Modelo', 'modelo'], '') || '').trim()
    const desc = String(pickItemValue(item, ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN ARTÍCULO', 'descripcion', 'NOMBRE'], '') || '').trim()
    const fallbackId = String(pickItemValue(item, ['id'], '') || '').trim()
    return [clave, n, lote, ref, marca, modelo, desc, fallbackId].join('|')
}

const getItemDescripcion = (item) => pickItemValue(item, ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCIÓN ARTÍCULO', 'descripcion', 'NOMBRE'], '')

const getItemMarca = (item) => pickItemValue(item, ['MARCA', 'Marca', 'marca'], '')

const loading = ref(true);
const fetchError = ref(false);
const articulos = ref([]);
const searchQuery = ref('');
const filterType = ref('all');
const viewMode = ref('cards'); // 'cards' o 'table'
const movementOpen = ref(false);
const intakeOpen = ref(false);
const decommissionOpen = ref(false);
const kardexModalOpen = ref(false);
const kardexModalData = ref(null);
const newItemIds = ref(new Map()); // Ahora es Map con item ID -> timestamp
const notificationMessage = ref('');
const showNotification = ref(false);
const notificationType = ref('success'); // 'success', 'warning', 'info'
const actionType = ref(null); // 'consumable', 'transfer'

const searchInput = ref(null);

// Paginación
const currentPage = ref(1);
// Preferencia inicial (mantiene compatibilidad con el valor anterior)
const preferredItemsPerPage = ref(12);
// Items por página se calcula dinámicamente para llenar filas completas
const itemsPerPage = ref(preferredItemsPerPage.value);
// Referencia al contenedor del grid para medir columnas
const gridRef = ref(null);
const MIN_CARD_WIDTH = 380; // Debe coincidir con el minmax del CSS

function updateItemsPerPage() {
    // Determina el ancho disponible del grid (fallback a window.innerWidth)
    const w = gridRef.value ? gridRef.value.clientWidth : (window.innerWidth || 1024);
    const cols = Math.max(1, Math.floor(w / MIN_CARD_WIDTH));
    // Calcular un tamaño de página cercano al preferido pero múltiplo de las columnas
    const rows = Math.max(1, Math.round(preferredItemsPerPage.value / cols));
    const newSize = cols * rows;
    if (newSize !== itemsPerPage.value) {
        itemsPerPage.value = newSize;
        // Ajustar página actual si excede totalPages
        const tp = Math.max(1, Math.ceil(filteredArticulos.value.length / newSize));
        if (currentPage.value > tp) currentPage.value = tp;
    }
}

// Escuchar resize del contenedor (mejor que solo window)
let _ro = null;
onMounted(async () => {
    // Inicializar notificaciones
    await initNotifications();

    // Cargar artículos
    fetchArticulos();

    // Actualiza cada 30 minutos y verifica stock
    setInterval(() => {
        fetchArticulos();
    }, 30 * 60 * 1000);

    // Inicializar tamaño
    updateItemsPerPage();
    if (typeof ResizeObserver !== 'undefined' && gridRef.value) {
        _ro = new ResizeObserver(() => updateItemsPerPage());
        _ro.observe(gridRef.value);
    }
    // Fallback window resize
    window.addEventListener('resize', updateItemsPerPage);
});
onBeforeUnmount(() => {
    if (_ro && gridRef.value) _ro.unobserve(gridRef.value);
    window.removeEventListener('resize', updateItemsPerPage);
});

const openMovement = () => { movementOpen.value = true; };
const openIntake = () => { intakeOpen.value = true; };
const openDecommission = () => { decommissionOpen.value = true; };

// Reset page cuando cambia el modo de vista
watch(viewMode, () => {
    currentPage.value = 1;
});

// Update Item panel state
const updateItemModalOpen = ref(false);
const updateItemData = ref(null);

function handleEditItem(item) {
    updateItemData.value = item;
    updateItemModalOpen.value = true;
}

function handleViewKardex(item) {
    kardexModalData.value = item;
    kardexModalOpen.value = true;
}

function onItemUpdated(updated) {
    const updatedKey = getItemKey(updated);
    let idx = articulos.value.findIndex(a => getItemKey(a) === updatedKey);
    if (idx < 0) {
        const clave = updated['Clave  HRAEI'];
        idx = articulos.value.findIndex(a => a['Clave  HRAEI'] === clave);
    }
    if (idx >= 0) {
        articulos.value[idx] = { ...articulos.value[idx], ...updated };
    }
    showNotificationToast('Información de equipo actualizada correctamente', 'success', 'update');
    
    // Notificación push
    const itemName = updated['Descripción del bien'] || updated['NOMBRE'] || 'Artículo';
    sendPushNotification('✅ Artículo actualizado', {
        body: `${itemName} ha sido actualizado correctamente`,
        tag: 'item-updated'
    });
    
    updateItemModalOpen.value = false;
    
    // Also refresh from server to ensure we have the latest data
    fetchArticulos();
}

const handleWizardSuccess = (detail) => {
    // Mostrar notificación si el wizard envía un mensaje
    if (detail && typeof detail === 'string') {
        showNotificationToast(detail, 'success');
        // Notificación push para acción exitosa
        sendPushNotification('✅ Operación exitosa', {
            body: detail,
            tag: 'operation-success'
        });
    } else if (detail && detail.message) {
        showNotificationToast(detail.message, detail.type || 'success', detail.action || null);
        // Notificación push
        sendPushNotification(detail.type === 'error' ? '❌ Error' : '✅ Éxito', {
            body: detail.message,
            tag: detail.action || 'operation'
        });
    }
    fetchArticulos();
};

const showNotificationToast = (message, type = 'success', action = null) => {
    notificationMessage.value = message;
    notificationType.value = type;
    actionType.value = action;
    showNotification.value = true;

    setTimeout(() => {
        showNotification.value = false;
    }, 5000);
};

const fetchArticulos = async () => {
    loading.value = true;
    fetchError.value = false;
    try {
        console.log('[InventorySubdireccion] Iniciando fetch de /api/ops/stock-biomedica');
        const response = await fetch(`/api/ops/stock-biomedica?t=${Date.now()}`, { cache: 'no-store' });
        console.log('[InventorySubdireccion] Response status:', response.status, response.ok);
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('[InventorySubdireccion] Datos recibidos:', data);

        // Support multiple response shapes: array, { ok, data }, or { data }
        let itemsRaw = [];
        if (Array.isArray(data)) {
            itemsRaw = data
        } else if (data && Array.isArray(data.data)) {
            itemsRaw = data.data
        } else if (data && data.ok && Array.isArray(data.items)) {
            itemsRaw = data.items
        } else {
            itemsRaw = []
        }

        // Helper: obtener descripción tolerante a diferentes claves y mayúsculas
        const getDescripcion = (it) => {
            if (!it || typeof it !== 'object') return ''
            const tryKeys = ['Descripción del bien', 'Descripcion del bien', 'DESCRIPCION DEL BIEN', 'DESCRIPCIÓN DEL BIEN', 'descripcion', 'descripcion_del_bien', 'descripcionDelBien', 'NOMBRE', 'NOMBRE DEL BIEN', 'descripcionDelBien']
            for (const k of tryKeys) {
                if (it[k]) return String(it[k]).trim()
            }
            // fallback: try any string-like field that seems descriptive
            for (const key of Object.keys(it)) {
                const v = it[key]
                if (typeof v === 'string' && v.trim().length > 3) {
                    // prefer fields containing letters and spaces
                    if (/\p{L}/u.test(v)) return v.trim()
                }
            }
            return ''
        }

        // Defensive sanitize: drop mock/test rows or rows without a valid description
        const items = itemsRaw.filter(it => {
            const desc = String(getDescripcion(it) || '').toLowerCase();
            if (!desc || desc.length <= 2) return false;
            if (/\b(prueba|test|mock|placeholder)\b/.test(desc)) return false;
            return true;
        })

        if (items.length !== itemsRaw.length) {
            console.warn('[Inventory] Removed mock/test rows from API response — showing only sanitized data', { raw: itemsRaw.length, sanitized: items.length })
        }

        const now = Date.now();
        const newItems = new Map();
        const changedItems = new Map();

        // Recupera snapshot anterior (actualizado con cada fetch)
        let currentSnapshot = {};
        try {
            currentSnapshot = JSON.parse(localStorage.getItem('inventorySnapshot') || '{}');
        } catch (e) {
            currentSnapshot = {};
        }

        // Detecta items nuevos y cambios de stock
        items.forEach(item => {
            const itemId = getItemKey(item);
            const previousData = currentSnapshot[itemId];
            const currentStock = getItemStock(item);

            // Item nuevo (no existía antes en el snapshot)
            if (!previousData) {
                newItems.set(itemId, now);
            }
            // Item con cambio de stock
            else if (previousData.stock !== currentStock) {
                changedItems.set(itemId, now);
            }
        });

        // Solo items NUEVOS obtienen animación (no los modificados)
        newItemIds.value = newItems;

        // Reordena: nuevos primero, luego todo lo demás
        const sortedItems = [...items].sort((a, b) => {
            const aId = getItemKey(a);
            const bId = getItemKey(b);
            const aIsNew = newItems.has(aId);
            const bIsNew = newItems.has(bId);

            // Solo nuevos al tope (no modificados)
            if (aIsNew && !bIsNew) return -1;
            if (!aIsNew && bIsNew) return 1;
            return 0;
        });

        articulos.value = sortedItems;

        // Si hay items nuevos, ir a página 1
        if (newItems.size > 0) {
            currentPage.value = 1;
        }

        // Actualiza snapshot y detecta stock bajo
        const newSnapshot = {};
        const lowStockItems = [];
        const criticalStockItems = [];

        items.forEach(item => {
            const stock = getItemStock(item);
            newSnapshot[getItemKey(item)] = {
                stock,
                timestamp: now
            };

            // Detecta stock bajo (1-5 unidades)
            if (stock > 0 && stock <= 5) {
                lowStockItems.push({
                    name: item['Descripción del bien'],
                    code: getItemKey(item),
                    stock
                });
            }

            // Detecta stock crítico (0 unidades)
            if (stock === 0) {
                criticalStockItems.push({
                    name: item['Descripción del bien'],
                    code: getItemKey(item)
                });
            }
        });

        localStorage.setItem('inventorySnapshot', JSON.stringify(newSnapshot));

        // Envía notificaciones push para stock bajo
        if (criticalStockItems.length > 0) {
            sendPushNotification('⚠️ STOCK CRÍTICO', {
                body: `${criticalStockItems.length} artículo(s) sin stock:\n${criticalStockItems.slice(0, 3).map(i => `• ${i.name}`).join('\n')}`,
                tag: 'critical-stock'
            });
        }

        if (lowStockItems.length > 0) {
            sendPushNotification('📦 Stock Bajo', {
                body: `${lowStockItems.length} artículo(s) con stock bajo:\n${lowStockItems.slice(0, 3).map(i => `• ${i.name} (${i.stock} und)`).join('\n')}`,
                tag: 'low-stock'
            });
        }

        // Verificar caducidad y notificar solo a administradores
        if (isAdmin.value) {
            const expiredItems = [];
            const criticalExpirationItems = [];
            const warningExpirationItems = [];
            const noCaducidadItems = [];

            items.forEach(item => {
                const caducidad = item['CADUCIDAD'];
                
                // Contar items sin fecha de caducidad
                if (!caducidad || caducidad === '' || caducidad === '—') {
                    noCaducidadItems.push({
                        name: item['Descripción del bien'],
                        code: item['Clave  HRAEI']
                    });
                    return;
                }

                try {
                    let fechaCaducidad = new Date(caducidad);
                    if (isNaN(fechaCaducidad.getTime())) {
                        // Intentar formato DD/MM/YYYY
                        const parts = caducidad.split('/');
                        if (parts.length === 3) {
                            fechaCaducidad = new Date(parts[2], parts[1] - 1, parts[0]);
                        }
                    }

                    if (isNaN(fechaCaducidad.getTime())) return;

                    const hoy = new Date();
                    const diferenciaDias = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));

                    const itemInfo = {
                        name: item['Descripción del bien'],
                        code: item['Clave  HRAEI'],
                        caducidad: caducidad,
                        diasRestantes: diferenciaDias
                    };

                    if (diferenciaDias < 0) {
                        expiredItems.push(itemInfo);
                    } else if (diferenciaDias <= 30) {
                        criticalExpirationItems.push(itemInfo);
                    } else if (diferenciaDias <= 90) {
                        warningExpirationItems.push(itemInfo);
                    }
                } catch (e) {
                    console.warn('Error parsing caducidad:', e);
                }
            });

            // Notificar items sin fecha de caducidad (solo una vez por sesión)
            const lastCaducidadWarning = localStorage.getItem('last_caducidad_warning');
            const oneDay = 24 * 60 * 60 * 1000;
            if (noCaducidadItems.length > 0 && (!lastCaducidadWarning || (Date.now() - parseInt(lastCaducidadWarning)) > oneDay)) {
                const itemsList = noCaducidadItems.slice(0, 5).map(i => `• ${i.name} (${i.code})`).join('\n');
                notificationStore.addNotification(
                    '⚠️ Faltan fechas de caducidad',
                    `${noCaducidadItems.length} artículo(s) SIN fecha de caducidad:\n${itemsList}${noCaducidadItems.length > 5 ? '\n+ ' + (noCaducidadItems.length - 5) + ' más...' : ''}`,
                    'warning',
                    { eventType: 'no_caducidad', items: noCaducidadItems.slice(0, 5) }
                );
                localStorage.setItem('last_caducidad_warning', Date.now().toString());
            }

            // Notificar items expirados o próximos a expirar
            if (expiredItems.length > 0) {
                const itemsList = expiredItems.slice(0, 5).map(i => `• ${i.name}\n  Caducó: ${i.caducidad} (hace ${Math.abs(i.diasRestantes)} días)`).join('\n');
                notificationStore.addNotification(
                    '🔴 ARTÍCULOS EXPIRADOS',
                    `${expiredItems.length} artículo(s) YA EXPIRARON y no deben usarse:\n${itemsList}${expiredItems.length > 5 ? '\n+ ' + (expiredItems.length - 5) + ' más...' : ''}`,
                    'critical',
                    { eventType: 'expired', items: expiredItems }
                );
                // Notificación push para items expirados
                sendPushNotification('🔴 ARTÍCULOS EXPIRADOS', {
                    body: `${expiredItems.length} artículo(s) ya expiraron. Revisar inmediatamente.`,
                    tag: 'expired-items'
                });
            } else if (criticalExpirationItems.length > 0) {
                const itemsList = criticalExpirationItems.slice(0, 5).map(i => `• ${i.name}\n  Caduca: ${i.caducidad} (en ${i.diasRestantes} días)`).join('\n');
                notificationStore.addNotification(
                    '🟠 CADUCAN PRONTO',
                    `${criticalExpirationItems.length} artículo(s) CADUCARAN en menos de 30 días:\n${itemsList}${criticalExpirationItems.length > 5 ? '\n+ ' + (criticalExpirationItems.length - 5) + ' más...' : ''}`,
                    'warning',
                    { eventType: 'critical', items: criticalExpirationItems }
                );
                // Notificación push
                sendPushNotification('🟠 CADUCAN PRONTO', {
                    body: `${criticalExpirationItems.length} artículo(s) caducan en menos de 30 días`,
                    tag: 'expiring-soon'
                });
            } else if (warningExpirationItems.length > 0) {
                const itemsList = warningExpirationItems.slice(0, 5).map(i => `• ${i.name}\n  Caduca: ${i.caducidad} (en ${i.diasRestantes} días)`).join('\n');
                notificationStore.addNotification(
                    '🟡 Atención por Caducidad',
                    `${warningExpirationItems.length} artículo(s) CADUCARAN en 30-90 días:\n${itemsList}${warningExpirationItems.length > 5 ? '\n+ ' + (warningExpirationItems.length - 5) + ' más...' : ''}`,
                    'info',
                    { eventType: 'warning', items: warningExpirationItems }
                );
            }
        }

        // Limpia animaciones después de 3 horas (10800000 ms) - solo para items NUEVOS
        if (newItems.size > 0) {
            const ANIMATION_DURATION = 3 * 60 * 60 * 1000; // 3 horas
            setTimeout(() => {
                newItemIds.value.clear();
            }, ANIMATION_DURATION);
        }

    } catch (error) {
        console.error('[InventorySubdireccion] Error al cargar inventario:', error);
        console.error('[InventorySubdireccion] Error message:', error.message);
        console.error('[InventorySubdireccion] Error stack:', error.stack);
        fetchError.value = true;
    } finally {
        loading.value = false;
    }
};

const healthyCount = computed(() =>
    articulos.value.filter(i => getItemStock(i) > 5).length
);

const lowStockCount = computed(() =>
    articulos.value.filter(i => {
        const s = getItemStock(i);
        return s > 0 && s <= 5;
    }).length
);

const outOfStockCount = computed(() =>
    articulos.value.filter(i => getItemStock(i) === 0).length
);

const filteredArticulos = computed(() => {
    let result = articulos.value;

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(i =>
            getItemDescripcion(i).toLowerCase().includes(q) ||
            getItemKey(i).toLowerCase().includes(q) ||
            getItemMarca(i).toLowerCase().includes(q)
        );
    }

    if (filterType.value === 'healthy') {
        result = result.filter(i => getItemStock(i) > 5);
    } else if (filterType.value === 'low') {
        result = result.filter(i => {
            const s = getItemStock(i);
            return s > 0 && s <= 5;
        });
    } else if (filterType.value === 'out') {
        result = result.filter(i => getItemStock(i) === 0);
    }

    return result;
});

const totalPages = computed(() => Math.ceil(filteredArticulos.value.length / itemsPerPage.value));

const paginatedArticulos = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredArticulos.value.slice(start, start + itemsPerPage.value);
});

// Recalcular itemsPerPage cuando cambian los resultados (filtrado/búsqueda)
watch(filteredArticulos, () => {
    updateItemsPerPage();
    // Ajustar página actual si sobrepasa el total
    const tp = Math.max(1, Math.ceil(filteredArticulos.value.length / itemsPerPage.value));
    if (currentPage.value > tp) currentPage.value = tp;
});

// Reiniciar a página 1 cuando se filtra o busca
watch([searchQuery, filterType], () => {
    currentPage.value = 1;
});

const handleSearchKeydown = (event) => {
    // Buscar por Enter key
    if (event.key === 'Enter') {
        event.preventDefault();
        // Aquí puede ir lógica de búsqueda si se necesita
    }
};


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

.header-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-top: 28px;
    padding: 0 0 24px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.action-buttons-container {
    display: flex;
    gap: 3px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 5px;
    position: relative;
    overflow: hidden;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.05);
}

.action-buttons-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%);
    pointer-events: none;
    border-radius: 15px;
}

.search-and-refresh {
    display: flex;
    gap: 12px;
    align-items: center;
}

.btn-warehouse-transfer,
.btn-consumable-intake,
.btn-decommission {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 22px;
    background: transparent;
    border: 1px solid transparent;
    color: #e2e8f0;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    position: relative;
    z-index: 1;
    border-radius: 12px;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.btn-warehouse-transfer {
    color: #bfdbfe;
}

.btn-warehouse-transfer::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 100%);
    z-index: -1;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.btn-warehouse-transfer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.4s ease;
}

.btn-warehouse-transfer:hover {
    color: #dbeafe;
    transform: translateY(-2px);
}

.btn-warehouse-transfer:hover::before {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 100%);
    box-shadow: 0 0 24px rgba(59, 130, 246, 0.35);
}

.btn-warehouse-transfer:hover::after {
    left: 100%;
}

.btn-consumable-intake {
    color: #a7f3d0;
}

.btn-consumable-intake::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%);
    z-index: -1;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.btn-consumable-intake::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.4s ease;
}

.btn-consumable-intake:hover {
    color: #d1fae5;
    transform: translateY(-2px);
}

.btn-consumable-intake:hover::before {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.2) 100%);
    box-shadow: 0 0 24px rgba(16, 185, 129, 0.35);
}

.btn-consumable-intake:hover::after {
    left: 100%;
}

.btn-decommission {
    color: #fecaca;
}

.btn-decommission::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.1) 100%);
    z-index: -1;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.btn-decommission::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.4s ease;
}

.btn-decommission:hover {
    color: #fee2e2;
    transform: translateY(-2px);
}

.btn-decommission:hover::before {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.2) 100%);
    box-shadow: 0 0 24px rgba(239, 68, 68, 0.35);
}

.btn-decommission:hover::after {
    left: 100%;
}

.btn-text {
    white-space: nowrap;
}

@media (max-width: 768px) {

    .btn-warehouse-transfer .btn-text,
    .btn-consumable-intake .btn-text,
    .btn-decommission .btn-text {
        display: none;
    }

    .btn-warehouse-transfer,
    .btn-consumable-intake,
    .btn-decommission {
        padding: 10px 14px;
    }
}

.btn-refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    cursor: pointer;
    transition: all 0.25s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 0;
    flex-shrink: 0;
}

.btn-refresh:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 250, 0.2);
}

.btn-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.anim-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
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

.chip.ok {
    color: #a7f3d0;
}

.chip.warn {
    color: #fcd34d;
}

.chip.danger {
    color: #fca5a5;
}

.chip.ghost {
    color: #93c5fd;
    background: rgba(30, 41, 59, 0.25);
}

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
    padding: 12px 50px 12px 46px;
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

.view-toggle-group {
    display: flex;
    gap: 6px;
    background: rgba(15, 23, 42, 0.5);
    padding: 4px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-view-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 0;
    flex-shrink: 0;
}

.btn-view-toggle:hover {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.3);
    color: #60a5fa;
}

.btn-view-toggle.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    color: #60a5fa;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.2);
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

.summary-card.total.active .card-icon {
    color: #f8fafc;
    background: rgba(255, 255, 255, 0.1);
}

.summary-card.healthy.active .card-icon {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
}

.summary-card.warning.active .card-icon {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
}

.summary-card.critical.active .card-icon {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}

.stock-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
}

.loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
}

.skeleton-card {
    height: 240px;
    background: linear-gradient(90deg, rgba(30, 41, 59, 0.5) 25%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
    border-radius: 20px;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.anim-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
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

.error-state h3 {
    color: #f87171;
}

@media (max-width: 1024px) {
    .search-box {
        width: 300px;
    }
}

@media (max-width: 768px) {
    .sub-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .search-box {
        width: 100%;
    }
}

/* Toast Notifications */
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    max-width: 450px;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
}

.toast-success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
    border-color: rgba(34, 197, 94, 0.4);
    color: #86efac;
}

.toast-success .toast-icon {
    color: #34d399;
}

.toast-consumable {
    border-left: 4px solid #22c55e;
}

.toast-transfer {
    border-left: 4px solid #0ea5e9;
}

.toast-close {
    border: none;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

.toast-close:hover {
    transform: scale(1.1);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
    opacity: 0;
    transform: translateX(100px) scale(0.95);
}
</style>
