<template>
  <div class="biomedical-table-container" :class="[containerThemeClass, { 'compact-mode': compactMode }]">
    <!-- Ambient Glow Effect -->
    <div class="ambient-glow"></div>

    <!-- Add Equipment Wizard Modal -->
    <AddEquipmentWizard 
      :isOpen="showAddEquipmentWizard"
      :suggestedData="suggestedDataForWizard"
      @close="showAddEquipmentWizard = false"
      @submit="handleAddEquipmentSubmit"
    />
    
    <!-- ═══════════════════════════════════════════════════════════════
         PANEL DE ESTADÍSTICAS EN TIEMPO REAL (NUEVO)
         ═══════════════════════════════════════════════════════════════ -->
    <Transition name="stats-slide">
      <div v-if="showStatsPanel" class="stats-dashboard glass-panel">
        <div class="stats-header">
          <h3><i class="pi pi-chart-bar"></i> Dashboard de Estadísticas</h3>
          <button @click="showStatsPanel = false" class="close-stats-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon"><i class="pi pi-database"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ totalEquipment }}</span>
              <span class="stat-label">Total Equipos</span>
            </div>
            <div class="stat-trend" :class="{ positive: monthlyGrowth >= 0 }">
              <i :class="monthlyGrowth >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
              {{ Math.abs(monthlyGrowth) }}%
            </div>
          </div>
          
          <div class="stat-card stat-available">
            <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.available }}</span>
              <span class="stat-label">Disponibles</span>
            </div>
            <div class="stat-percentage">{{ availablePercentage }}%</div>
          </div>
          
          <div class="stat-card stat-maintenance">
            <div class="stat-icon"><i class="pi pi-wrench"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.maintenance }}</span>
              <span class="stat-label">En Mantenimiento</span>
            </div>
            <div class="stat-alert" v-if="statusCounts.maintenance > 10">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
          </div>
          
          <div class="stat-card stat-unavailable">
            <div class="stat-icon"><i class="pi pi-times-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.unavailable }}</span>
              <span class="stat-label">Fuera de Servicio</span>
            </div>
          </div>
        </div>
        
        <!-- Mini gráfico de distribución por estado -->
        <div class="stats-chart-section">
          <h4>Distribución por Estado</h4>
          <div class="mini-chart">
            <div 
              class="chart-bar available" 
              :style="{ width: availablePercentage + '%' }"
              :title="`Disponibles: ${statusCounts.available}`"
            ></div>
            <div 
              class="chart-bar maintenance" 
              :style="{ width: maintenancePercentage + '%' }"
              :title="`Mantenimiento: ${statusCounts.maintenance}`"
            ></div>
            <div 
              class="chart-bar unavailable" 
              :style="{ width: unavailablePercentage + '%' }"
              :title="`Fuera de servicio: ${statusCounts.unavailable}`"
            ></div>
          </div>
          <div class="chart-legend">
            <span class="legend-item available"><span class="dot"></span> Disponible</span>
            <span class="legend-item maintenance"><span class="dot"></span> Mantenimiento</span>
            <span class="legend-item unavailable"><span class="dot"></span> No Disponible</span>
          </div>
        </div>
        
        <!-- Top marcas y ubicaciones -->
        <div class="stats-lists">
          <div class="stats-list">
            <h4><i class="pi pi-tag"></i> Top Marcas</h4>
            <div class="list-items">
              <div v-for="(brand, idx) in topBrands" :key="brand.name" class="list-item">
                <span class="item-rank">{{ idx + 1 }}</span>
                <span class="item-name">{{ brand.name || 'Sin marca' }}</span>
                <span class="item-count">{{ brand.count }}</span>
              </div>
            </div>
          </div>
          <div class="stats-list">
            <h4><i class="pi pi-map-marker"></i> Top Ubicaciones</h4>
            <div class="list-items">
              <div v-for="(loc, idx) in topLocations" :key="loc.name" class="list-item">
                <span class="item-rank">{{ idx + 1 }}</span>
                <span class="item-name">{{ loc.name || 'Sin ubicación' }}</span>
                <span class="item-count">{{ loc.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════
         BARRA DE ACCIONES RÁPIDAS (NUEVO)
         ═══════════════════════════════════════════════════════════════ -->
    <Transition name="actions-slide">
      <div v-if="selectedRows.length > 0" class="bulk-actions-bar glass-panel">
        <div class="bulk-info">
          <i class="pi pi-check-square"></i>
          <span>{{ selectedRows.length }} elemento{{ selectedRows.length > 1 ? 's' : '' }} seleccionado{{ selectedRows.length > 1 ? 's' : '' }}</span>
        </div>
        <div class="bulk-buttons">
          <button @click="exportSelectedToCSV" class="bulk-btn export">
            <i class="pi pi-download"></i> Exportar Selección
          </button>
          <button @click="bulkRequestMaintenance" class="bulk-btn maintenance">
            <i class="pi pi-wrench"></i> Mantenimiento Masivo
          </button>
          <button @click="printSelectedLabels" class="bulk-btn print">
            <i class="pi pi-print"></i> Imprimir Etiquetas
          </button>
          <button @click="clearSelection" class="bulk-btn clear">
            <i class="pi pi-times"></i> Limpiar
          </button>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════
         MODAL DE VISTA RÁPIDA DEL EQUIPO
         ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
          <div class="modal-container glass-panel">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon-wrap" :class="getStatusColorClass(selectedEquipment?.ESTATUS)">
                  <i class="pi pi-box"></i>
                </div>
                <div>
                  <h2 class="modal-title">{{ selectedEquipment?.EQUIPO_MEDICO || 'Equipo Médico' }}</h2>
                  <span class="modal-subtitle">
                    <i class="pi pi-hashtag"></i>
                    {{ selectedEquipment?.N_DE_INVENTARIO || 'Sin inventario' }}
                  </span>
                </div>
              </div>
              <button @click="closeDetailModal" class="modal-close-btn" title="Cerrar (Esc)">
                <i class="pi pi-times"></i>
              </button>
            </div>
            
            <div class="modal-body" v-if="selectedEquipment">
              <!-- Status Banner -->
              <div class="status-banner" :class="getStatusColorClass(selectedEquipment.ESTATUS)">
                <i :class="getStatusIcon(selectedEquipment.ESTATUS)"></i>
                <span>{{ selectedEquipment.ESTATUS || 'Sin estado' }}</span>
              </div>
              
              <!-- Quick Info Cards -->
              <div class="quick-info-grid">
                <div class="info-card">
                  <i class="pi pi-hashtag"></i>
                  <div class="info-content">
                    <span class="info-label">No. Inventario</span>
                    <span class="info-value">{{ selectedEquipment.N_DE_INVENTARIO || '-' }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <i class="pi pi-tag"></i>
                  <div class="info-content">
                    <span class="info-label">Marca</span>
                    <span class="info-value">{{ selectedEquipment.MARCA || '-' }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <i class="pi pi-box"></i>
                  <div class="info-content">
                    <span class="info-label">Modelo</span>
                    <span class="info-value">{{ selectedEquipment.MODELO || '-' }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <i class="pi pi-id-card"></i>
                  <div class="info-content">
                    <span class="info-label">Serie</span>
                    <span class="info-value">{{ selectedEquipment.SERIE || '-' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- All Details Section -->
              <div class="details-section">
                <h3 class="section-title">
                  <i class="pi pi-list"></i> Todos los Campos ({{ Object.keys(selectedEquipment).length }})
                </h3>
                <div class="details-grid">
                  <div 
                    v-for="(value, key) in selectedEquipment" 
                    :key="key"
                    class="detail-item"
                    :class="{ highlighted: isImportantField(key) }"
                  >
                    <span class="detail-label">{{ formatHeader(key) }}</span>
                    <span class="detail-value" :class="{ empty: !value && value !== 0 }">
                      {{ formatCellValue(value, key) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button @click="handleEditItem(selectedEquipment)" class="modal-action-btn edit-btn">
                <i class="pi pi-pencil"></i> Editar
              </button>
              <button @click="handleShowBarcode(selectedEquipment)" class="modal-action-btn barcode-btn">
                <i class="pi pi-qrcode"></i> Código
              </button>
              <button @click="handleRequestMaintenance(selectedEquipment)" class="modal-action-btn maint-btn">
                <i class="pi pi-wrench"></i> Mantenimiento
              </button>
              <button @click="closeDetailModal" class="modal-action-btn close-btn">
                <i class="pi pi-times"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- ═══════════════════════════════════════════════════════════════
         TOOLBAR PRINCIPAL (MEJORADO)
         ═══════════════════════════════════════════════════════════════ -->
    <div class="table-toolbar">
      <div class="toolbar-left">
         <!-- Botón Agregar Nuevo Equipo -->
         <button 
           @click="showAddEquipmentWizard = true"
           class="toolbar-btn btn-add-equipment"
           title="Registrar nuevo equipo médico"
         >
           <i class="pi pi-plus"></i>
           <span class="btn-text">Agregar Equipo</span>
         </button>


         <!-- Scan button moved out of search, appears in toolbar -->
        <button 
          @click="onScanButtonClick" 
          class="toolbar-btn btn-scan" 
          :class="{ active: scanModeActive }" 
          title="Modo escaneo" 
        >
          <i class="pi pi-barcode"></i>
          <span class="btn-text">Escanear</span>
        </button>

        
        <!-- Filtros Rápidos por Estado -->
        <div class="quick-filters">
          <button
            v-for="status in quickFilterStatuses"
            :key="status.value"
            class="quick-filter-btn"
            :class="{ active: quickStatusFilter === status.value, [status.class]: true }"
            @click="toggleQuickFilter(status.value)"
          >
            <i :class="status.icon"></i>
            <span>{{ status.label }}</span>
            <span class="filter-count-badge">{{ getStatusCount(status.value) }}</span>
          </button>
        </div>
        
        <!-- Active Filters Badge -->
        <Transition name="badge-pop">
          <button 
            v-if="activeFiltersCount > 0" 
            class="active-filters-badge"
            @click="clearAllFilters"
            title="Clic para limpiar filtros"
          >
            <i class="pi pi-filter-slash"></i>
            <span>{{ activeFiltersCount }}</span>
            <i class="pi pi-times"></i>
          </button>
        </Transition>
      </div>
      
      <div class="toolbar-right">
        <!-- Search Box Mejorado relocated -->
        <div class="search-box" :class="{ focused: searchFocused }">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="searchTerm"
            type="text"
            class="global-search"
            placeholder="Buscar equipos, marcas, modelos... (o escanea)"
            @keydown.escape="searchTerm = ''"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            ref="searchInput"
          />
          <Transition name="fade">
            <button
              v-if="searchTerm"
              @click="searchTerm = ''"
              class="search-clear"
              title="Limpiar (Esc)"
            >
              <i class="pi pi-times"></i>
            </button>
          </Transition>
          <kbd class="search-shortcut" v-if="!searchTerm">Ctrl+K</kbd>
        </div>
        <!-- Modo Compacto Toggle -->
        <button 
          @click="compactMode = !compactMode" 
          class="toolbar-btn btn-density"
          :class="{ active: compactMode }"
          :title="compactMode ? 'Vista normal' : 'Vista compacta'"
        >
          <i :class="compactMode ? 'pi pi-th-large' : 'pi pi-list'"></i>
        </button>

        <button 
          @click="emit('refresh')" 
          class="toolbar-btn btn-refresh" 
          title="Actualizar datos (F5)"
          :class="{ 'is-loading': loading }"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
        
        <!-- Menú de Exportación -->
        <div class="export-menu-wrapper">
          <button 
            @click="showExportMenu = !showExportMenu" 
            class="toolbar-btn btn-export" 
            title="Opciones de exportación"
          >
            <i class="pi pi-download"></i>
            <i class="pi pi-chevron-down" style="font-size: 0.6rem; margin-left: 4px;"></i>
          </button>
          <Transition name="dropdown-slide">
            <div v-if="showExportMenu" class="export-dropdown glass-panel">
              <button @click="exportToCSV(); showExportMenu = false" class="export-option">
                <i class="pi pi-file"></i>
                <span>Exportar CSV</span>
              </button>
              <button @click="exportToExcel(); showExportMenu = false" class="export-option">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Excel</span>
              </button>
              <button @click="exportToPDF(); showExportMenu = false" class="export-option">
                <i class="pi pi-file-pdf"></i>
                <span>Exportar PDF</span>
              </button>
              <button @click="exportToJSON(); showExportMenu = false" class="export-option">
                <i class="pi pi-code"></i>
                <span>Exportar JSON</span>
              </button>
              <div class="export-divider"></div>
              <button @click="printTable(); showExportMenu = false" class="export-option">
                <i class="pi pi-print"></i>
                <span>Imprimir</span>
              </button>
            </div>
          </Transition>
        </div>

        <button 
          @click="showColumnSelector = !showColumnSelector" 
          class="toolbar-btn btn-columns" 
          :class="{ active: showColumnSelector }"
          title="Configurar columnas visibles"
        >
          <i class="pi pi-th-large"></i>
          <span class="btn-badge" v-if="hiddenColumnsCount > 0">{{ hiddenColumnsCount }}</span>
        </button>
        
        <!-- Column Selector Dropdown -->
        <Transition name="dropdown-slide">
          <div v-if="showColumnSelector" class="column-selector-dropdown glass-panel" @click.stop>
            <div class="selector-header">
              <h4><i class="pi pi-eye"></i> Columnas Visibles</h4>
              <button @click="showColumnSelector = false" class="close-btn" title="Cerrar">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="selector-actions">
              <button @click="selectAllColumns(); showColumnSelector = false" class="selector-action-btn">
                <i class="pi pi-check-square"></i> Todas
              </button>
              <button @click="deselectAllColumns(); showColumnSelector = false" class="selector-action-btn">
                <i class="pi pi-stop"></i> Ninguna
              </button>
              <button @click="resetToDefaultColumns(); showColumnSelector = false" class="selector-action-btn">
                <i class="pi pi-replay"></i> Por defecto
              </button>
            </div>
            <div class="selector-search">
              <i class="pi pi-search"></i>
              <input 
                v-model="columnSearchTerm" 
                placeholder="Buscar columna..."
                class="column-search-input"
              />
            </div>
            <div class="selector-content">
              <label
                v-for="col in filteredColumnsForSelector"
                :key="col.field"
                class="checkbox-label"
                :class="{ checked: columnVisibility[col.field] }"
              >
                <input
                  type="checkbox"
                  v-model="columnVisibility[col.field]"
                />
                <span class="checkbox-custom"></span>
                <span class="col-name">{{ col.header }}</span>
                <span v-if="isPriorityColumn(col.field)" class="priority-badge">★</span>
              </label>
            </div>
            <div class="selector-footer">
              <span class="columns-count">
                {{ visibleColumnsCount }}/{{ allColumns.length }} columnas visibles
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════
         TABLA PRINCIPAL
         ═══════════════════════════════════════════════════════════════ -->
    <div class="table-wrapper glass-panel">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando equipos biomédicos...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredData.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h3>Sin resultados</h3>
        <p v-if="searchTerm || activeFiltersCount > 0">
          No se encontraron equipos con los filtros actuales
        </p>
        <p v-else>No hay equipos disponibles</p>
        <button 
          v-if="searchTerm || activeFiltersCount > 0" 
          @click="clearAllFiltersAndSearch" 
          class="clear-filters-btn"
        >
          <i class="pi pi-filter-slash"></i> Limpiar filtros
        </button>
      </div>
      
      <!-- Data Table -->
      <div v-else class="scroll-container">
        <table class="data-table">
          <thead>
            <tr class="header-row">
              <!-- Checkbox Column -->
              <th class="checkbox-col sticky-col-left">
                <input 
                  type="checkbox" 
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
                  title="Seleccionar todo"
                />
              </th>
              
              <!-- Status Semaphore Column -->
              <th class="status-col">
                <i class="pi pi-circle-fill" title="Estado del equipo"></i>
              </th>
              
              <!-- Data Columns with Filter -->
              <th 
                v-for="col of visibleColumns"
                :key="col.field"
                class="table-header"
                :class="{ 
                  sorted: sortField === col.field,
                  filtered: hasActiveFilter(col.field)
                }"
              >
                <div class="header-content" @click="toggleSort(col.field)">
                  <span class="header-text">{{ col.header }}</span>
                  <div class="header-icons">
                    <i v-if="sortField === col.field" 
                       :class="sortOrder === 1 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"
                       class="sort-icon"
                    ></i>
                  </div>
                </div>
                
                <!-- Column Filter Button -->
                <button 
                  class="column-filter-btn"
                  :class="{ active: activeColumnFilter === col.field, 'has-filter': hasActiveFilter(col.field) }"
                  @click.stop="toggleColumnFilter(col.field)"
                  :title="hasActiveFilter(col.field) ? 'Filtro activo - clic para editar' : 'Filtrar por ' + col.header"
                >
                  <i class="pi pi-filter"></i>
                  <span v-if="hasActiveFilter(col.field)" class="filter-count">
                    {{ getFilterCount(col.field) }}
                  </span>
                </button>
                
                <!-- Column Filter Dropdown -->
                <Transition name="filter-dropdown">
                  <div 
                    v-if="activeColumnFilter === col.field" 
                    class="column-filter-dropdown"
                    @click.stop
                  >
                    <div class="filter-header">
                      <span>Filtrar: {{ col.header }}</span>
                      <button @click="activeColumnFilter = null" class="filter-close">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    
                    <div class="filter-search">
                      <i class="pi pi-search"></i>
                      <input 
                        v-model="columnFilterSearch[col.field]"
                        placeholder="Buscar valores..."
                        class="filter-search-input"
                        @keydown.stop
                      />
                    </div>
                    
                    <div class="filter-actions">
                      <button @click="selectAllFilterValues(col.field); applyAndCloseFilter(col.field)" class="filter-action-btn">
                        <i class="pi pi-check-square"></i> Todos
                      </button>
                      <button @click="clearColumnFilter(col.field); applyAndCloseFilter(col.field)" class="filter-action-btn">
                        <i class="pi pi-times"></i> Ninguno
                      </button>
                    </div>
                    
                    <div class="filter-options">
                      <label 
                        v-for="value in getFilteredUniqueValues(col.field)"
                        :key="value"
                        class="filter-option"
                        :class="{ selected: isFilterValueSelected(col.field, value) }"
                      >
                        <input 
                          type="checkbox"
                          :checked="isFilterValueSelected(col.field, value)"
                          @change="toggleFilterValue(col.field, value)"
                        />
                        <span class="filter-checkbox"></span>
                        <span class="filter-value">{{ value || '(Vacío)' }}</span>
                        <span class="filter-count-badge">{{ getValueCount(col.field, value) }}</span>
                      </label>
                    </div>
                    
                    <div class="filter-footer">
                      <button @click="applyAndCloseFilter(col.field)" class="apply-filter-btn">
                        <i class="pi pi-check"></i> Aplicar
                      </button>
                    </div>
                  </div>
                </Transition>
              </th>
              
              <!-- Actions Column -->
              <th class="actions-col sticky-col-right">
                <i class="pi pi-cog"></i>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr 
              v-for="(item, idx) of paginatedData" 
              :key="getItemKey(item, idx)"
              class="data-row"
              :class="{ 
                selected: isRowSelected(idx),
                'context-open': contextMenuIdx === idx,
                ...getRowStatusClass(item)
              }"
              @click="openContextMenu($event, item, idx)"
              @dblclick.prevent="handleEditItem(item)"
              @contextmenu.prevent="openContextMenu($event, item, idx)"
            >
              <!-- Checkbox -->
              <td class="checkbox-col sticky-col-left" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="isRowSelected(idx)"
                  @change="toggleRowSelect(idx)"
                  class="checkbox"
                />
              </td>
              
              <!-- STATUS SEMÁFORO VISUAL -->
              <td class="status-semaphore-col">
                <div 
                  class="semaphore-badge"
                  :class="[
                    `semaphore-${getEquipmentStatus(item).badge}`,
                    { 'semaphore-animate': getEquipmentStatus(item).animate }
                  ]"
                  :title="getEquipmentStatus(item).label"
                >
                  <i class="pi semaphore-icon" :class="getEquipmentStatus(item).icon"></i>
                </div>
              </td>
              
              <!-- Data Cells -->
              <td 
                v-for="col of visibleColumns"
                :key="col.field"
                class="data-cell"
                :class="getCellClass(col.field, item[col.field])"
                :title="String(item[col.field] || '')"
              >
                <div class="cell-content">
                  <!-- Status Badge -->
                  <template v-if="col.field === 'ESTATUS'">
                    <span class="status-badge" :class="getStatusColorClass(item[col.field])">
                      <i :class="getStatusIcon(item[col.field])"></i>
                      {{ item[col.field] || '-' }}
                    </span>
                  </template>
                  
                  <!-- Regular Cell -->
                  <template v-else>
                    {{ formatCellValue(item[col.field], col.field) }}
                  </template>
                </div>
              </td>
              
              <!-- Actions (Compact) -->
              <td class="actions-col sticky-col-right" @click.stop>
                <button 
                  @click="openContextMenu($event, item, idx)"
                  class="row-action-btn"
                  :class="{ active: contextMenuIdx === idx }"
                  title="Acciones"
                >
                  <i class="pi pi-ellipsis-h"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Context Menu Flotante -->
      <Teleport to="body">
        <Transition name="context-menu">
          <div 
            v-if="contextMenuIdx !== null && contextMenuItem" 
            class="context-menu"
            :style="contextMenuStyle"
            @click.stop
          >
            <div class="context-menu-header">
              <span class="context-equipment">{{ contextMenuItem.EQUIPO_MEDICO || 'Equipo' }}</span>
              <span class="context-inventory">{{ contextMenuItem.N_DE_INVENTARIO }}</span>
            </div>
            <div class="context-menu-body">
              <button @click="handleViewItem(contextMenuItem)" class="context-item">
                <span class="icon-history">📋</span>
                <span>Historial del equipo</span>
              </button>
              <button @click="handleEditItem(contextMenuItem)" class="context-item">
                <span class="icon-edit">✏️</span>
                <span>Editar equipo</span>
              </button>
              <button @click="handleShowBarcode(contextMenuItem)" class="context-item">
                <span class="icon-qr">📲</span>
                <span>Código QR / Barras</span>
              </button>
              <div class="context-divider"></div>
              <button @click="handleRequestMaintenance(contextMenuItem)" class="context-item maintenance">
                <span class="icon-maintenance">🔧</span>
                <span>Solicitar mantenimiento</span>
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════
         FOOTER / PAGINACIÓN (MEJORADO)
         ═══════════════════════════════════════════════════════════════ -->
    <div class="pagination-footer glass-panel">
      <div class="pagination-info">
        <span class="info-badge">
          <i class="pi pi-database"></i>
          {{ filteredData.length }} equipo{{ filteredData.length !== 1 ? 's' : '' }}
        </span>
        <span v-if="selectedRows.length > 0" class="info-badge selected">
          <i class="pi pi-check-square"></i>
          {{ selectedRows.length }} seleccionado{{ selectedRows.length !== 1 ? 's' : '' }}
        </span>
        <!-- Indicador de Datos Filtrados -->
        <span v-if="filteredData.length !== props.data.length" class="info-badge filtered">
          <i class="pi pi-filter"></i>
          de {{ props.data.length }} total
        </span>
        <!-- Tiempo de última actualización -->
        <span class="last-updated" v-if="lastUpdated">
          <i class="pi pi-clock"></i>
          Actualizado: {{ formatTimeAgo(lastUpdated) }}
        </span>
      </div>
      
      <div class="pagination-controls">
        <!-- Ir a página específica -->
        <div class="goto-page">
          <label>Ir a:</label>
          <input 
            type="number" 
            v-model.number="gotoPage" 
            :min="1" 
            :max="totalPages"
            @keydown.enter="goToSpecificPage"
            class="goto-input"
          />
        </div>

        <select v-model="internalPageSize" class="page-size-select" title="Equipos por página">
          <option :value="10">10 por pág.</option>
          <option :value="25">25 por pág.</option>
          <option :value="50">50 por pág.</option>
          <option :value="100">100 por pág.</option>
          <option :value="250">250 por pág.</option>
          <option :value="filteredData.length">Todos ({{ filteredData.length }})</option>
        </select>
        
        <div class="page-nav">
          <button 
            @click="goToFirstPage"
            :disabled="currentPage === 1"
            class="nav-btn"
            title="Primera página"
          >
            <i class="pi pi-angle-double-left"></i>
          </button>
          <button 
            @click="goToPrevPage"
            :disabled="currentPage === 1"
            class="nav-btn"
            title="Página anterior"
          >
            <i class="pi pi-angle-left"></i>
          </button>
          
          <div class="page-indicator">
            <input 
              type="number" 
              v-model.number="currentPage"
              :min="1"
              :max="totalPages"
              class="page-input"
              @keydown.enter="validateCurrentPage"
              @blur="validateCurrentPage"
            />
            <span class="page-separator">de</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>
          
          <button 
            @click="goToNextPage"
            :disabled="currentPage >= totalPages"
            class="nav-btn"
            title="Página siguiente"
          >
            <i class="pi pi-angle-right"></i>
          </button>
          <button 
            @click="goToLastPage"
            :disabled="currentPage >= totalPages"
            class="nav-btn"
            title="Última página"
          >
            <i class="pi pi-angle-double-right"></i>
          </button>
        </div>
        
        <span class="range-info">
          {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredData.length) }} de {{ filteredData.length }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import AddEquipmentWizard from './AddEquipmentWizard.vue'
import { useEquipmentStatus } from '@/composables/useEquipmentStatus.js'

// ═══════════════════════════════════════════════════════════════
// PROPS Y EMITS
// ═══════════════════════════════════════════════════════════════
const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pageSize: { type: Number, default: 25 },
  showAllColumns: { type: Boolean, default: true }
})

const emit = defineEmits(['view-item', 'edit-item', 'show-barcode', 'refresh', 'request-maintenance', 'open-scan-modal', 'scan-code'])

// Composable de status
const { loadStatuses, getStatus } = useEquipmentStatus();

// DEBUG: log field names when data array changes (helps diagnose missing columns)
watch(() => props.data, (val) => {
  try {
    if (Array.isArray(val) && val.length > 0) {
      console.log('[BiomedicalEquipmentTable] incoming data fields:', Object.keys(val[0]));
      
      // CARGAR STATUS EN BATCH (ultra-rápido)
      const inventoryNumbers = val
        .map(item => item.N_DE_INVENTARIO || item['No DE INVENTARIO'])
        .filter(Boolean);
      if (inventoryNumbers.length) {
        loadStatuses(inventoryNumbers);
      }
    }
  } catch (e) {}
});

// ═══════════════════════════════════════════════════════════════
// COLUMNAS PRIORITARIAS (se muestran por defecto)
// ═══════════════════════════════════════════════════════════════
const priorityColumns = [
  'N_DE_INVENTARIO', 'EQUIPO_MEDICO', 'MARCA', 'MODELO', 
  'SERIE', 'UNIDAD_MEDICA', 'ESTATUS', 'SERVICIO', 'UBICACION'
]

// ═══════════════════════════════════════════════════════════════
// ESTADO REACTIVO
// ═══════════════════════════════════════════════════════════════
const searchTerm = ref('')
const searchFocused = ref(false)
const searchInput = ref(null)
const sortField = ref(null)
const sortOrder = ref(1)
const currentPage = ref(1)
const internalPageSize = ref(props.pageSize)
const selectedRows = ref([])
const showColumnSelector = ref(false)
const columnSearchTerm = ref('')
const columnVisibility = ref({})

// NUEVAS FEATURES
const showStatsPanel = ref(false)
const showExportMenu = ref(false)
const compactMode = ref(false)
const quickStatusFilter = ref(null)
const lastUpdated = ref(null)
const gotoPage = ref(1)

// Escaneo
const scanModeActive = ref(false)
const scanBuffer = ref('')
const scanTimeout = ref(null)

// Filtros rápidos por estado
const quickFilterStatuses = [
  { value: 'available', label: 'Disponible', icon: 'pi pi-check-circle', class: 'filter-available' },
  { value: 'maintenance', label: 'Mantenimiento', icon: 'pi pi-wrench', class: 'filter-maintenance' },
  { value: 'unavailable', label: 'No Disponible', icon: 'pi pi-times-circle', class: 'filter-unavailable' }
]

// Modal
const showDetailModal = ref(false)
const selectedEquipment = ref(null)

// Add Equipment Wizard
const showAddEquipmentWizard = ref(false)

// Context Menu
const contextMenuIdx = ref(null)
const contextMenuItem = ref(null)
const contextMenuPosition = ref({ x: 0, y: 0 })

// Column Filters
const activeColumnFilter = ref(null)
const columnFilterSearch = ref({})
const columnFilters = ref({})

// ═══════════════════════════════════════════════════════════════
// COLUMNAS COMPUTADAS
// ═══════════════════════════════════════════════════════════════
const allColumns = computed(() => {
  if (props.showAllColumns && props.data.length > 0) {
    // gather all keys from every item to avoid missing columns when the first
    // row doesn't contain them. Also strip out any helper/internal fields
    const keySet = new Set()
    props.data.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k === '__hasRealData') return // skip synthetic field added by search
        if (k.startsWith('_')) return // skip other privates just in case
        keySet.add(k)
      })
    })
    // preserve order: start with first row's keys in order, then extras
    const firstKeys = Object.keys(props.data[0]).filter(k => k !== '__hasRealData' && !k.startsWith('_'))
    const extraKeys = [...keySet].filter(k => !firstKeys.includes(k))
    const orderedKeys = [...firstKeys, ...extraKeys]
    return orderedKeys.map(key => ({ field: key, header: formatHeader(key) }))
  }
  return props.columns.length > 0 
    ? props.columns 
    : [
        { field: 'N_DE_INVENTARIO', header: 'No. Inventario' },
        { field: 'EQUIPO_MEDICO', header: 'Equipo' },
        { field: 'MARCA', header: 'Marca' },
        { field: 'MODELO', header: 'Modelo' },
        { field: 'SERIE', header: 'Serie' },
        { field: 'ESTATUS', header: 'Estado' }
      ]
})

const visibleColumns = computed(() => {
  if (props.showAllColumns) {
    // ignore manual visibility settings when forcing all columns
    return allColumns.value.slice()
  }
  return allColumns.value.filter(col => columnVisibility.value[col.field] !== false)
})

const visibleColumnsCount = computed(() => visibleColumns.value.length)

const hiddenColumnsCount = computed(() => allColumns.value.length - visibleColumns.value.length)

const filteredColumnsForSelector = computed(() => {
  if (!columnSearchTerm.value) return allColumns.value
  const search = columnSearchTerm.value.toLowerCase()
  return allColumns.value.filter(col => 
    col.header.toLowerCase().includes(search) || 
    col.field.toLowerCase().includes(search)
  )
})

const contextMenuStyle = computed(() => ({
  left: `${contextMenuPosition.value.x}px`,
  top: `${contextMenuPosition.value.y}px`
}))

// ═══════════════════════════════════════════════════════════════
// FILTRADO Y ORDENAMIENTO DE DATOS
// ═══════════════════════════════════════════════════════════════
const filteredData = computed(() => {
  let result = [...props.data]
  
  // Aplicar búsqueda global
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase().trim()
    result = result.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(search)
      )
    })
  }
  
  // Aplicar filtro rápido por estado (NUEVO)
  if (quickStatusFilter.value) {
    result = result.filter(item => {
      const status = normalizeStatus(item.ESTATUS)
      return status === quickStatusFilter.value
    })
  }
  
  // Aplicar filtros de columna
  Object.keys(columnFilters.value).forEach(field => {
    const filterValues = columnFilters.value[field]
    if (filterValues && filterValues.length > 0) {
      result = result.filter(item => {
        const cellValue = String(item[field] ?? '')
        return filterValues.includes(cellValue)
      })
    }
  })
  
  // Aplicar ordenamiento
  if (sortField.value) {
    result.sort((a, b) => {
      const aVal = a[sortField.value] ?? ''
      const bVal = b[sortField.value] ?? ''
      const comparison = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
      return comparison * sortOrder.value
    })
  }
  
  return result
})

// ═══════════════════════════════════════════════════════════════
// PAGINACIÓN
// ═══════════════════════════════════════════════════════════════
const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / internalPageSize.value)))

const startIndex = computed(() => (currentPage.value - 1) * internalPageSize.value)

const endIndex = computed(() => startIndex.value + internalPageSize.value)

const paginatedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value))

// ═══════════════════════════════════════════════════════════════
// SELECCIÓN
// ═══════════════════════════════════════════════════════════════
const allSelected = computed(() => {
  if (paginatedData.value.length === 0) return false
  return paginatedData.value.every((_, idx) => selectedRows.value.includes(startIndex.value + idx))
})

const someSelected = computed(() => {
  return selectedRows.value.length > 0 && !allSelected.value
})

// ═══════════════════════════════════════════════════════════════
// FILTROS DE COLUMNA
// ═══════════════════════════════════════════════════════════════
const activeFiltersCount = computed(() => {
  let count = Object.values(columnFilters.value).filter(f => f && f.length > 0).length
  if (quickStatusFilter.value) count++
  return count
})

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS EN TIEMPO REAL (NUEVO)
// ═══════════════════════════════════════════════════════════════
const totalEquipment = computed(() => props.data.length)

const statusCounts = computed(() => {
  const counts = { available: 0, maintenance: 0, unavailable: 0, retired: 0, unknown: 0 }
  props.data.forEach(item => {
    const status = normalizeStatus(item.ESTATUS)
    counts[status] = (counts[status] || 0) + 1
  })
  return counts
})

const availablePercentage = computed(() => {
  if (totalEquipment.value === 0) return 0
  return Math.round((statusCounts.value.available / totalEquipment.value) * 100)
})

const maintenancePercentage = computed(() => {
  if (totalEquipment.value === 0) return 0
  return Math.round((statusCounts.value.maintenance / totalEquipment.value) * 100)
})

const unavailablePercentage = computed(() => {
  if (totalEquipment.value === 0) return 0
  return Math.round((statusCounts.value.unavailable / totalEquipment.value) * 100)
})

const monthlyGrowth = computed(() => {
  // Simulación - en producción se calcularía con datos históricos
  return Math.floor(Math.random() * 10) - 3
})

const topBrands = computed(() => {
  const brandCount = {}
  props.data.forEach(item => {
    const brand = item.MARCA || 'Sin marca'
    brandCount[brand] = (brandCount[brand] || 0) + 1
  })
  return Object.entries(brandCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const topLocations = computed(() => {
  const locCount = {}
  props.data.forEach(item => {
    const loc = item.UBICACION || item.SERVICIO || item.UNIDAD_MEDICA || 'Sin ubicación'
    locCount[loc] = (locCount[loc] || 0) + 1
  })
  return Object.entries(locCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// ═══════════════════════════════════════════════════════════════
// DATOS SUGERIDOS PARA EL WIZARD (NUEVO)
// ═══════════════════════════════════════════════════════════════
const suggestedDataForWizard = computed(() => {
  const brands = new Set()
  const locations = new Set()
  const units = new Set()
  const services = new Set()

  props.data.forEach(item => {
    if (item.MARCA) brands.add(item.MARCA)
    if (item.UBICACION || item['UBICACION_ESPECIFICA']) locations.add(item.UBICACION || item['UBICACION_ESPECIFICA'])
    if (item.UNIDAD_MEDICA) units.add(item.UNIDAD_MEDICA)
    if (item.SERVICIO) services.add(item.SERVICIO)
  })

  return {
    brands: Array.from(brands).sort(),
    locations: Array.from(locations).sort(),
    units: Array.from(units).sort(),
    services: Array.from(services).sort()
  }
})

// ═══════════════════════════════════════════════════════════════
// FILTROS RÁPIDOS POR ESTADO (NUEVO)
// ═══════════════════════════════════════════════════════════════
function toggleQuickFilter(status) {
  if (quickStatusFilter.value === status) {
    quickStatusFilter.value = null
  } else {
    quickStatusFilter.value = status
  }
  currentPage.value = 1
}

function getStatusCount(status) {
  return statusCounts.value[status] || 0
}

function getUniqueValues(field) {
  const values = new Set()
  props.data.forEach(item => {
    values.add(String(item[field] ?? ''))
  })
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

function getFilteredUniqueValues(field) {
  const values = getUniqueValues(field)
  const search = (columnFilterSearch.value[field] || '').toLowerCase()
  if (!search) return values
  return values.filter(v => v.toLowerCase().includes(search))
}

function getValueCount(field, value) {
  return props.data.filter(item => String(item[field] ?? '') === value).length
}

function hasActiveFilter(field) {
  const filter = columnFilters.value[field]
  return filter && filter.length > 0 && filter.length < getUniqueValues(field).length
}

function getFilterCount(field) {
  return columnFilters.value[field]?.length || 0
}

function isFilterValueSelected(field, value) {
  const filter = columnFilters.value[field]
  if (!filter || filter.length === 0) return true
  return filter.includes(value)
}

function toggleFilterValue(field, value) {
  if (!columnFilters.value[field]) {
    columnFilters.value[field] = getUniqueValues(field).filter(v => v !== value)
  } else {
    const idx = columnFilters.value[field].indexOf(value)
    if (idx >= 0) {
      columnFilters.value[field].splice(idx, 1)
    } else {
      columnFilters.value[field].push(value)
    }
  }
  currentPage.value = 1
}

function selectAllFilterValues(field) {
  columnFilters.value[field] = [...getUniqueValues(field)]
  currentPage.value = 1
}

function clearColumnFilter(field) {
  columnFilters.value[field] = []
  currentPage.value = 1
}

function toggleColumnFilter(field) {
  if (activeColumnFilter.value === field) {
    activeColumnFilter.value = null
  } else {
    activeColumnFilter.value = field
    if (!columnFilters.value[field]) {
      columnFilters.value[field] = [...getUniqueValues(field)]
    }
  }
}

function applyAndCloseFilter(field) {
  activeColumnFilter.value = null
  currentPage.value = 1
}

function clearAllFilters() {
  columnFilters.value = {}
  quickStatusFilter.value = null
  currentPage.value = 1
}

function clearAllFiltersAndSearch() {
  searchTerm.value = ''
  clearAllFilters()
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE ESCANEO
// ═══════════════════════════════════════════════════════════════
function toggleScanMode() {
  scanModeActive.value = !scanModeActive.value
  scanBuffer.value = ''
  if (scanModeActive.value) {
    nextTick(() => {
      if (searchInput.value) searchInput.value.focus()
    })
  }
}

// Called by toolbar button; toggles local scan mode *and* notifies parent
function onScanButtonClick() {
  console.log('[BiomedicalEquipmentTable] scan button clicked, toggling scan mode and emitting open-scan-modal')
  toggleScanMode()
  emit('open-scan-modal')
}


function handleScanInput(e) {
  // scanModeActive no longer gates scanning; always listen so barcode readers
  // immediately trigger the result. The button still toggles visual state and
  // focuses the input, but an actual scan will work anytime the element has
  // focus (including after a Ctrl+K focus shortcut).
  const char = e.key

  // ENTER completa el escaneo
  if (char === 'Enter') {
    if (scanBuffer.value.trim()) {
      const code = scanBuffer.value.trim()
      scanBuffer.value = ''
      scanModeActive.value = false
      // emit code so parent can look up & show history
      emit('scan-code', code)
      // still set searchTerm for visual feedback
      searchTerm.value = code
      e.preventDefault()
    }
    return
  }

  // ESC cancela escaneo (put us back to normal search)
  if (char === 'Escape') {
    scanModeActive.value = false
    scanBuffer.value = ''
    searchTerm.value = ''
    return
  }

  // Caracteres imprimibles al buffer
  if (char.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    scanBuffer.value += char
    clearTimeout(scanTimeout.value)
    scanTimeout.value = setTimeout(() => {
      if (scanBuffer.value.trim()) {
        const code = scanBuffer.value.trim()
        emit('scan-code', code)
        searchTerm.value = code
        // optionally attempt local match
        const foundEquipment = filteredData.value[0]
        if (foundEquipment) {
          selectedEquipment.value = foundEquipment
          emit('view-item', foundEquipment)
        }
        scanModeActive.value = false
      }
      scanBuffer.value = ''
    }, 1500)
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTACIONES MÚLTIPLES (NUEVO)
// ═══════════════════════════════════════════════════════════════
async function exportToExcel() {
  try {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Equipos')

    // headers
    const headers = visibleColumns.value.map(c => c.header)
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // blue background
    }

    // add data rows
    filteredData.value.forEach(item => {
      const values = visibleColumns.value.map(c => item[c.field] != null ? item[c.field] : '')
      worksheet.addRow(values)
    })

    // auto column width
    worksheet.columns.forEach(column => {
      let maxLength = 0
      column.eachCell?.({ includeEmpty: true }, cell => {
        const v = cell.value == null ? '' : String(cell.value)
        maxLength = Math.max(maxLength, v.length)
      })
      column.width = Math.min(maxLength + 2, 50)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `equipos_biomedicos_${getDateString()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting Excel:', error)
    // fallback to old method if exceljs fails
    const headers = visibleColumns.value.map(c => c.header)
    const dataToExport = filteredData.value.map(item => 
      visibleColumns.value.map(c => item[c.field] || '')
    )
    let content = '\ufeff'
    content += headers.join('\t') + '\n'
    dataToExport.forEach(row => {
      content += row.join('\t') + '\n'
    })
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    downloadBlob(blob, `equipos_biomedicos_${getDateString()}.xls`)
  }
}

function exportToPDF() {
  // Crear ventana de impresión con estilos
  const printContent = generatePrintContent()
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

function exportToJSON() {
  const dataToExport = filteredData.value.map(item => {
    const obj = {}
    visibleColumns.value.forEach(c => {
      obj[c.field] = item[c.field]
    })
    return obj
  })
  
  const content = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, `equipos_biomedicos_${getDateString()}.json`)
}

function printTable() {
  const printContent = generatePrintContent()
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

function generatePrintContent() {
  const headers = visibleColumns.value.map(c => `<th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">${c.header}</th>`).join('')
  const rows = filteredData.value.map(item => {
    const cells = visibleColumns.value.map(c => 
      `<td style="padding: 8px; border: 1px solid #ddd;">${formatCellValue(item[c.field], c.field)}</td>`
    ).join('')
    return `<tr>${cells}</tr>`
  }).join('')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventario Biomédico - ${new Date().toLocaleDateString('es-MX')}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; font-size: 18px; }
        .info { color: #666; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        @media print { 
          body { margin: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Inventario de Equipos Biomédicos</h1>
      <div class="info">
        Generado: ${new Date().toLocaleString('es-MX')}<br>
        Total: ${filteredData.value.length} equipos
      </div>
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function getDateString() {
  return new Date().toISOString().split('T')[0]
}

function exportSelectedToCSV() {
  const selectedData = selectedRows.value.map(idx => filteredData.value[idx - startIndex.value]).filter(Boolean)
  if (selectedData.length === 0) return
  
  const headers = visibleColumns.value.map(c => c.header)
  const rows = selectedData.map(item => 
    visibleColumns.value.map(c => `"${String(item[c.field] || '').replace(/"/g, '""')}"`)
  )
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `equipos_seleccionados_${getDateString()}.csv`)
}

// ═══════════════════════════════════════════════════════════════
// ACCIONES EN LOTE (NUEVO)
// ═══════════════════════════════════════════════════════════════
function bulkRequestMaintenance() {
  const selectedData = selectedRows.value.map(idx => filteredData.value[idx - startIndex.value]).filter(Boolean)
  if (selectedData.length === 0) return
  emit('bulk-maintenance', selectedData)
}

function printSelectedLabels() {
  const selectedData = selectedRows.value.map(idx => filteredData.value[idx - startIndex.value]).filter(Boolean)
  if (selectedData.length === 0) return
  emit('print-labels', selectedData)
}

function clearSelection() {
  selectedRows.value = []
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES ADICIONALES (NUEVO)
// ═══════════════════════════════════════════════════════════════
function formatTimeAgo(date) {
  if (!date) return ''
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'Hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  return new Date(date).toLocaleDateString('es-MX')
}

function goToSpecificPage() {
  if (gotoPage.value >= 1 && gotoPage.value <= totalPages.value) {
    currentPage.value = gotoPage.value
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE COLUMNAS
// ═══════════════════════════════════════════════════════════════
function initializeColumnVisibility() {
  const visibility = {}
  allColumns.value.forEach(col => {
    // Mostrar TODAS las columnas por defecto si showAllColumns=true
    if (props.showAllColumns) {
      visibility[col.field] = true
    } else {
      // si showAllColumns=false, mostrar únicamente las prioritarias
      visibility[col.field] = priorityColumns.includes(col.field)
    }
  })
  columnVisibility.value = visibility
}

function selectAllColumns() {
  const newVisibility = { ...columnVisibility.value }
  allColumns.value.forEach(col => {
    newVisibility[col.field] = true
  })
  columnVisibility.value = newVisibility
}

function deselectAllColumns() {
  const newVisibility = { ...columnVisibility.value }
  allColumns.value.forEach(col => {
    newVisibility[col.field] = false
  })
  columnVisibility.value = newVisibility
}

function closeColumnSelector() {
  showColumnSelector.value = false
}

function resetToDefaultColumns() {
  initializeColumnVisibility()
}

function isPriorityColumn(field) {
  return priorityColumns.includes(field)
}

// ═══════════════════════════════════════════════════════════════
// FORMATEO
// ═══════════════════════════════════════════════════════════════
function formatHeader(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function formatCellValue(value, field) {
  if (value === null || value === undefined || value === '') return '-'
  
  // Formatear fechas
  if (field?.toLowerCase().includes('fecha') || field?.toLowerCase().includes('date')) {
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch (e) {}
  }
  
  // Truncar valores muy largos
  const str = String(value)
  return str.length > 50 ? str.substring(0, 47) + '...' : str
}

function isImportantField(key) {
  const important = ['N_DE_INVENTARIO', 'EQUIPO_MEDICO', 'MARCA', 'MODELO', 'SERIE', 'ESTATUS', 'SERVICIO']
  return important.includes(key)
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS DINÁMICOS
// ═══════════════════════════════════════════════════════════════
const containerThemeClass = computed(() => {
  if (!props.data || props.data.length === 0) return ''
  
  const statusCounts = {}
  props.data.forEach(item => {
    const status = normalizeStatus(item.ESTATUS)
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  
  const dominant = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  return dominant ? `theme-${dominant}` : 'theme-available'
})

function normalizeStatus(status) {
  if (!status) return 'unknown'
  const s = String(status).toLowerCase().trim()
  if (s.includes('disponible') || s.includes('activo') || s.includes('bueno')) return 'available'
  if (s.includes('manten') || s.includes('reparac')) return 'maintenance'
  if (s.includes('baja') || s.includes('fuera') || s.includes('inactivo')) return 'unavailable'
  if (s.includes('obsoleto') || s.includes('desecho')) return 'retired'
  return 'available'
}

function getStatusColorClass(status) {
  return `status-${normalizeStatus(status)}`
}

function getStatusIcon(status) {
  const normalized = normalizeStatus(status)
  const icons = {
    available: 'pi pi-check-circle',
    maintenance: 'pi pi-wrench',
    unavailable: 'pi pi-times-circle',
    retired: 'pi pi-ban',
    unknown: 'pi pi-question-circle'
  }
  return icons[normalized] || icons.unknown
}

function getRowStatusClass(item) {
  const status = normalizeStatus(item.ESTATUS)
  
  // Agregar clase basada en el estado del semáforo
  const equipmentStatus = getEquipmentStatus(item);
  const statusClass = `status-${equipmentStatus.badge}`;
  
  return { 
    [`row-${status}`]: true,
    [statusClass]: true
  }
}

// Obtiene status visual del equipo desde composable (SEMAFOR IZACIÓN)
function getEquipmentStatus(item) {
  const invNo = item.N_DE_INVENTARIO || item['No DE INVENTARIO'];
  return getStatus(invNo);
}

function getCellClass(field, value) {
  const classes = []
  if (field === 'N_DE_INVENTARIO') classes.push('cell-inventory')
  if (field === 'EQUIPO_MEDICO') classes.push('cell-equipment')
  if (field === 'MARCA') classes.push('cell-brand')
  return classes
}

// ═══════════════════════════════════════════════════════════════
// ORDENAMIENTO
// ═══════════════════════════════════════════════════════════════
function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value * -1
  } else {
    sortField.value = field
    sortOrder.value = 1
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGINACIÓN
// ═══════════════════════════════════════════════════════════════
function goToFirstPage() { currentPage.value = 1 }
function goToPrevPage() { if (currentPage.value > 1) currentPage.value-- }
function goToNextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function goToLastPage() { currentPage.value = totalPages.value }
function validateCurrentPage() {
  if (currentPage.value < 1) currentPage.value = 1
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
}

// ═══════════════════════════════════════════════════════════════
// SELECCIÓN
// ═══════════════════════════════════════════════════════════════
function isRowSelected(idx) {
  return selectedRows.value.includes(startIndex.value + idx)
}

function toggleRowSelect(idx) {
  const globalIdx = startIndex.value + idx
  const pos = selectedRows.value.indexOf(globalIdx)
  if (pos >= 0) {
    selectedRows.value.splice(pos, 1)
  } else {
    selectedRows.value.push(globalIdx)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    paginatedData.value.forEach((_, idx) => {
      const globalIdx = startIndex.value + idx
      const pos = selectedRows.value.indexOf(globalIdx)
      if (pos >= 0) selectedRows.value.splice(pos, 1)
    })
  } else {
    paginatedData.value.forEach((_, idx) => {
      const globalIdx = startIndex.value + idx
      if (!selectedRows.value.includes(globalIdx)) {
        selectedRows.value.push(globalIdx)
      }
    })
  }
}

// ═══════════════════════════════════════════════════════════════
// MODAL DE DETALLES
// ═══════════════════════════════════════════════════════════════
function openDetailModal(item) {
  selectedEquipment.value = { ...item }
  showDetailModal.value = true
  closeContextMenu()
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedEquipment.value = null
}

// ═══════════════════════════════════════════════════════════════
// WIZARD DE AGREGAR EQUIPO (NUEVO)
// ═══════════════════════════════════════════════════════════════
async function handleAddEquipmentSubmit(formData) {
  try {
    console.log('[AddEquipmentWizard] Submitting new equipment:', formData)
    
    // Preparar datos para enviar al backend
    const payload = {
      EQUIPO_MEDICO: formData.equipoMedico,
      MARCA: formData.marca,
      MODELO: formData.modelo,
      NUMERO_DE_SERIE: formData.serie,
      'No DE INVENTARIO': formData.nDeInventario || null,
      'UBICACION_ESPECIFICA': formData.ubicacion,
      ESTATUS: formData.estatus,
      UNIDAD_MEDICA: formData.unidadMedica,
      CLAVE_CNIS: formData.claveCNIS,
      REFERENCIA: formData.referencia,
      LOTE: formData.lote,
      SERVICIO: formData.servicio,
      observaciones: formData.observaciones,
      fecha_ingreso: formData.fechaIngreso
    }

    // Hacer petición al backend (la ruta se debe crear)
    const response = await fetch('/api/ops/equipos-medicos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.ok) {
      console.log('[AddEquipmentWizard] Equipment added successfully:', result.data)
      
      // Mostrar notificación de éxito (puedes usar tu propio sistema de notificaciones)
      alert(`✓ Equipo "${formData.equipoMedico}" registrado correctamente`)
      
      // Emitir evento de refresh para actualizar la tabla
      emit('refresh')
      
      // El wizard se cierra automáticamente
    } else {
      throw new Error(result.msg || 'Error desconocido al guardar el equipo')
    }
  } catch (error) {
    console.error('[AddEquipmentWizard] Error:', error)
    alert(`✗ Error al registrar el equipo: ${error.message}`)
  }
}

// ═══════════════════════════════════════════════════════════════
// MENÚ CONTEXTUAL
// ═══════════════════════════════════════════════════════════════
function openContextMenu(event, item, idx) {
  // Evitar abrir si ya está abierto el mismo
  if (contextMenuIdx.value === idx) {
    closeContextMenu()
    return
  }
  
  contextMenuItem.value = item
  contextMenuIdx.value = idx
  
  // Calcular posición
  const x = event.clientX
  const y = event.clientY
  
  // Ajustar si se sale de la pantalla
  const menuWidth = 220
  const menuHeight = 250
  const maxX = window.innerWidth - menuWidth - 10
  const maxY = window.innerHeight - menuHeight - 10
  
  contextMenuPosition.value = {
    x: Math.min(x, maxX),
    y: Math.min(y, maxY)
  }
}

function closeContextMenu() {
  contextMenuIdx.value = null
  contextMenuItem.value = null
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS DE ACCIONES
// ═══════════════════════════════════════════════════════════════
function handleEditItem(item) {
  emit('edit-item', item)
  closeDetailModal()
  closeContextMenu()
}

function handleViewItem(item) {
  // Emitir al padre para que muestre el panel de historial (EquipmentHistoryPanel)
  emit('view-item', item)
  // Cerrar cualquier modal interno y el menú contextual
  closeDetailModal()
  closeContextMenu()
}

function handleShowBarcode(item) {
  emit('show-barcode', item)
  closeDetailModal()
  closeContextMenu()
}

function handleRequestMaintenance(item) {
  emit('request-maintenance', item)
  closeDetailModal()
  closeContextMenu()
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR CSV
// ═══════════════════════════════════════════════════════════════
function exportToCSV() {
  const headers = visibleColumns.value.map(c => c.header)
  const rows = filteredData.value.map(item => 
    visibleColumns.value.map(c => `"${String(item[c.field] || '').replace(/"/g, '""')}"`)
  )
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `equipos_biomedicos_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════
function getItemKey(item, idx) {
  return item.N_DE_INVENTARIO || item.id || item.ID || idx
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (showDetailModal.value) {
      closeDetailModal()
    } else if (contextMenuIdx.value !== null) {
      closeContextMenu()
    } else if (activeColumnFilter.value) {
      activeColumnFilter.value = null
    } else if (showColumnSelector.value) {
      showColumnSelector.value = false
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CLICK OUTSIDE HANDLERS
// ═══════════════════════════════════════════════════════════════
function handleClickOutside(e) {
  // Close context menu
  if (contextMenuIdx.value !== null) {
    const contextMenu = e.target.closest('.context-menu')
    const rowBtn = e.target.closest('.row-action-btn')
    if (!contextMenu && !rowBtn) {
      closeContextMenu()
    }
  }
  
  // Close column filter
  if (activeColumnFilter.value !== null) {
    const filterDropdown = e.target.closest('.column-filter-dropdown')
    const filterBtn = e.target.closest('.column-filter-btn')
    if (!filterDropdown && !filterBtn) {
      activeColumnFilter.value = null
    }
  }
  
  // Close column selector
  if (showColumnSelector.value) {
    const selector = e.target.closest('.column-selector-dropdown')
    const btn = e.target.closest('.btn-columns')
    if (!selector && !btn) {
      showColumnSelector.value = false
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// WATCHERS
// ═══════════════════════════════════════════════════════════════
watch(() => props.data, () => {
  currentPage.value = 1
  selectedRows.value = []
  initializeColumnVisibility()
}, { deep: true })

watch(() => props.columns, initializeColumnVisibility, { immediate: true })

watch(filteredData, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})

// watch search input element so we can attach/remove scan listener even if the input is re-created
watch(searchInput, (newEl, oldEl) => {
  if (oldEl) oldEl.removeEventListener('keydown', handleScanInput)
  if (newEl) newEl.addEventListener('keydown', handleScanInput)
})

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════
onMounted(() => {
  initializeColumnVisibility()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
  lastUpdated.value = new Date()

  // Keyboard shortcut: Ctrl+K para buscar
  const handleGlobalKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      searchInput.value?.focus()
    }
  }
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
  // searchInput listener will be removed by the watcher
})

// Actualizar timestamp cuando cambian los datos
watch(() => props.data, () => {
  lastUpdated.value = new Date()
}, { deep: true })

// Actualizar gotoPage cuando cambia currentPage
watch(currentPage, (val) => {
  gotoPage.value = val
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   CSS VARIABLES - DARK LIQUID GLASS THEME
   ═══════════════════════════════════════════════════════════════ */
.biomedical-table-container {
  --glass-bg: rgba(20, 30, 50, 0.95);
  --glass-border: rgba(59, 130, 246, 0.25);
  --glass-glow: rgba(59, 130, 246, 0.12);
  --panel-bg: rgba(25, 35, 55, 0.98);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --status-available: #22c55e;
  --status-maintenance: #f59e0b;
  --status-unavailable: #ef4444;
  --status-retired: #6b7280;
}

/* ═══════════════════════════════════════════════════════════════
   CONTAINER PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
.biomedical-table-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(145deg, #0c1222 0%, #162032 50%, #0c1222 100%);
  border-radius: 14px;
  min-height: 500px;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.biomedical-table-container.compact-mode {
  gap: 8px;
  padding: 12px;
}

.compact-mode .data-cell {
  padding: 6px 10px !important;
  font-size: 0.82rem !important;
}

.compact-mode .table-header {
  padding: 8px 10px !important;
}

/* ═══════════════════════════════════════════════════════════════
   PANEL DE ESTADÍSTICAS (NUEVO)
   ═══════════════════════════════════════════════════════════════ */
.stats-dashboard {
  padding: 20px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h3 {
  margin: 0;
  color: #93c5fd;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-stats-btn {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #f87171;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-stats-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  transform: rotate(90deg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card.stat-total::before { background: var(--accent-blue); }
.stat-card.stat-available::before { background: var(--status-available); }
.stat-card.stat-maintenance::before { background: var(--status-maintenance); }
.stat-card.stat-unavailable::before { background: var(--status-unavailable); }

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.4rem;
}

.stat-total .stat-icon { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.stat-available .stat-icon { background: rgba(34, 197, 94, 0.15); color: #86efac; }
.stat-maintenance .stat-icon { background: rgba(245, 158, 11, 0.15); color: #fcd34d; }
.stat-unavailable .stat-icon { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-trend {
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.stat-trend.positive {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.stat-percentage {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-muted);
}

.stat-alert {
  position: absolute;
  top: 12px;
  right: 14px;
  color: #fbbf24;
  animation: pulse-alert 1.5s ease-in-out infinite;
}

@keyframes pulse-alert {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

/* Mini Gráfico */
.stats-chart-section {
  margin-bottom: 20px;
}

.stats-chart-section h4 {
  margin: 0 0 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.mini-chart {
  display: flex;
  height: 24px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.5);
}

.chart-bar {
  height: 100%;
  transition: width 0.5s ease;
  min-width: 2%;
}

.chart-bar.available { background: linear-gradient(90deg, #22c55e, #4ade80); }
.chart-bar.maintenance { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.chart-bar.unavailable { background: linear-gradient(90deg, #ef4444, #f87171); }

.chart-legend {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-item.available .dot { background: var(--status-available); }
.legend-item.maintenance .dot { background: var(--status-maintenance); }
.legend-item.unavailable .dot { background: var(--status-unavailable); }

/* Stats Lists */
.stats-lists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stats-list h4 {
  margin: 0 0 12px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 6px;
  font-size: 0.85rem;
}

.item-rank {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  color: #93c5fd;
}

.item-name {
  flex: 1;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-count {
  font-weight: 600;
  color: var(--accent-cyan);
}

/* Stats Slide Animation */
.stats-slide-enter-active,
.stats-slide-leave-active {
  transition: all 0.3s ease;
}

.stats-slide-enter-from,
.stats-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

/* ═══════════════════════════════════════════════════════════════
   BARRA DE ACCIONES EN LOTE (NUEVO)
   ═══════════════════════════════════════════════════════════════ */
.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  animation: slide-in-bar 0.3s ease;
}

@keyframes slide-in-bar {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #93c5fd;
  font-weight: 600;
}

.bulk-info i {
  color: var(--accent-cyan);
}

.bulk-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.bulk-btn.export {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.bulk-btn.export:hover {
  background: rgba(34, 197, 94, 0.25);
}

.bulk-btn.maintenance {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.bulk-btn.maintenance:hover {
  background: rgba(245, 158, 11, 0.25);
}

.bulk-btn.print {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.bulk-btn.print:hover {
  background: rgba(168, 85, 247, 0.25);
}

.bulk-btn.clear {
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(100, 116, 139, 0.3);
  color: #94a3b8;
}

.bulk-btn.clear:hover {
  background: rgba(100, 116, 139, 0.25);
}

/* Actions Slide Animation */
.actions-slide-enter-active,
.actions-slide-leave-active {
  transition: all 0.3s ease;
}

.actions-slide-enter-from,
.actions-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Ambient Glow - Más sutil */
.ambient-glow {
  position: absolute;
  top: -30%;
  left: -30%;
  width: 160%;
  height: 160%;
  background: radial-gradient(ellipse at center, var(--glass-glow) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0.4;
  animation: ambient-pulse 10s ease-in-out infinite;
}

@keyframes ambient-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.45; }
}

/* Theme Variations */
.theme-available .ambient-glow { background: radial-gradient(ellipse, rgba(34, 197, 94, 0.1) 0%, transparent 60%); }
.theme-maintenance .ambient-glow { background: radial-gradient(ellipse, rgba(245, 158, 11, 0.1) 0%, transparent 60%); }
.theme-unavailable .ambient-glow { background: radial-gradient(ellipse, rgba(239, 68, 68, 0.1) 0%, transparent 60%); }
.theme-retired .ambient-glow { background: radial-gradient(ellipse, rgba(107, 114, 128, 0.1) 0%, transparent 60%); }

/* Glass Panel Effect - Menos transparente */
.glass-panel {
  background: var(--panel-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* ═══════════════════════════════════════════════════════════════
   TOOLBAR - Compacto y limpio (MEJORADO)
   ═══════════════════════════════════════════════════════════════ */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--panel-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  position: relative;
  z-index: 100;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;  /* enable children to shrink */
  flex-wrap: wrap;
}

.btn-add-equipment {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(0, 200, 150, 0.2) 0%, rgba(0, 150, 100, 0.15) 100%);
  border: 1.5px solid rgba(0, 200, 150, 0.4);
  color: #00ff96;
  transition: all 0.2s ease;
  font-weight: 600;
}

.btn-add-equipment:hover {
  background: linear-gradient(135deg, rgba(0, 200, 150, 0.35) 0%, rgba(0, 150, 100, 0.25) 100%);
  border-color: rgba(0, 255, 150, 0.6);
  box-shadow: 0 0 20px rgba(0, 200, 150, 0.3);
  color: #00ffaa;
}

.btn-add-equipment .btn-text {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.btn-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-stats .btn-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(15, 25, 40, 0.8);
  border: 1.5px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  /* padding is now handled by input padding so icon can overlap */
  padding: 0;
  transition: all 0.2s ease;
  flex: 1 1 240px;           /* base width, allow growth/shrink */
  min-width: 240px;          /* never get narrower than this */
  max-width: 100%;
  position: relative;        /* for absolutely positioned icon */
}

.search-box.focused {
  border-color: var(--accent-blue);
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-cyan);
  font-size: 0.9rem;
  pointer-events: none;
}

.search-shortcut {
  position: absolute;
  right: 10px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-family: monospace;
}

/* Filtros Rápidos por Estado */
.quick-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-filter-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.quick-filter-btn.active {
  font-weight: 600;
}

.quick-filter-btn.active.filter-available {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.quick-filter-btn.active.filter-maintenance {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fcd34d;
}

.quick-filter-btn.active.filter-unavailable {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.quick-filter-btn .filter-count-badge {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
}

/* Menú de Exportación */
.export-menu-wrapper {
  position: relative;
}

.export-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1000;
  background: rgba(15, 22, 40, 0.98);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 10px;
  padding: 8px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.export-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: left;
}

.export-option:hover {
  background: rgba(59, 130, 246, 0.12);
  color: var(--text-primary);
}

.export-option i {
  width: 18px;
  color: var(--text-muted);
}

.export-option:hover i {
  color: var(--accent-blue);
}

.export-divider {
  height: 1px;
  background: rgba(59, 130, 246, 0.1);
  margin: 6px 0;
}

/* Botón de densidad */
.btn-density {
  position: relative;
}

.btn-density.active {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.4);
  color: #c084fc;
}

/* Animación de carga */
.btn-refresh.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

.search-icon {
  color: var(--accent-cyan);
  font-size: 0.9rem;
}

.global-search {
  flex: 1 1 auto;
  width: 100%;          /* fill parent search-box */
  min-width: 0;
  padding: 10px 8px 10px 32px; /* left padding for icon */
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  min-width: 150px;
}

.global-search::placeholder {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.search-clear {
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.search-clear:hover {
  background: rgba(248, 113, 113, 0.15);
}

/* Active Filters Badge - Compacto */
.active-filters-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #fbbf24;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.active-filters-badge:hover {
  background: rgba(245, 158, 11, 0.25);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  flex: 1 1 auto;         /* permit to grow, so searchbox can expand */
  justify-content: flex-end;
}

.toolbar-btn {
  position: relative;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #93c5fd;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: var(--accent-blue);
}

.toolbar-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: var(--accent-blue);
}

.toolbar-btn.btn-scan {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25);
  color: #10b981;
}
.toolbar-btn.btn-scan:hover {
  background: rgba(16, 185, 129, 0.25);
}
.toolbar-btn.btn-scan.active {
  background: rgba(16, 185, 129, 0.3);
}

.btn-refresh:hover { color: var(--accent-cyan); }
.btn-export:hover { color: #fbbf24; }
.btn-columns:hover { color: #a78bfa; }

.btn-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════
   COLUMN SELECTOR DROPDOWN - Mejorado
   ═══════════════════════════════════════════════════════════════ */
.column-selector-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1000;
  background: rgba(15, 22, 40, 0.98);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 10px;
  padding: 12px;
  min-width: 260px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--glass-border);
}

.selector-header h4 {
  margin: 0;
  color: #93c5fd;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-header h4 i {
  color: var(--accent-blue);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  transform: rotate(90deg);
}

.selector-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.selector-action-btn {
  flex: 1;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.selector-action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.selector-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  margin-bottom: 10px;
}

.selector-search i {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.column-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.selector-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 8px;
}

.selector-content::-webkit-scrollbar {
  width: 4px;
}

.selector-content::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text-secondary);
  font-size: 0.85rem;
  user-select: none;
}

.checkbox-label:hover {
  background: rgba(59, 130, 246, 0.12);
  color: var(--text-primary);
}

.checkbox-label.checked {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
}

.checkbox-label.checked .col-name {
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.col-name {
  flex: 1;
  font-size: 0.85rem;
}

.priority-badge {
  color: #fbbf24;
  font-size: 0.75rem;
}

.selector-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--glass-border);
}

.columns-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════════════════════════
   TABLE WRAPPER - Contenedor de la tabla
   ═══════════════════════════════════════════════════════════════ */
.table-wrapper {
  flex: 1;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  position: relative;
  /* allow scrolling when many columns are present */
  overflow: auto;
  background: var(--panel-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner i {
  font-size: 3rem;
  color: var(--accent-blue);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 12px;
  color: var(--text-secondary);
  padding: 40px;
}

.empty-state i {
  font-size: 4rem;
  opacity: 0.3;
  color: var(--accent-blue);
}

.empty-state h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  text-align: center;
}

.clear-filters-btn {
  margin-top: 12px;
  padding: 10px 20px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #93c5fd;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

/* Scroll Container - Scroll horizontal y vertical dentro de la tabla */
.scroll-container {
  flex: 1;
  width: 100%;
  overflow-x: auto !important;
  overflow-y: auto !important;
  max-height: 520px;
  scrollbar-color: rgba(59, 130, 246, 0.5) rgba(30, 41, 59, 0.4);
  scrollbar-width: auto;
}

.scroll-container::-webkit-scrollbar {
  width: 12px;
  height: 14px;
}

.scroll-container::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.7);
  border-radius: 7px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border-radius: 7px;
  border: 3px solid rgba(20, 30, 50, 0.6);
  min-height: 40px;
  min-width: 40px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%);
}

.scroll-container::-webkit-scrollbar-corner {
  background: rgba(20, 30, 50, 0.7);
  border-radius: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   DATA TABLE - Scroll horizontal para ver todas las columnas
   ═══════════════════════════════════════════════════════════════ */
.data-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.88rem;
  table-layout: auto;
}

/* Header Row */
.header-row {
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%);
  position: sticky;
  top: 0;
  z-index: 20;
}

.table-header {
  padding: 12px 14px;
  text-align: left;
  color: #93c5fd;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  border-right: 1px solid rgba(59, 130, 246, 0.1);
  min-width: 130px;
  position: relative;
  white-space: nowrap;
}

.table-header.sorted {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.table-header.filtered {
  background: rgba(245, 158, 11, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  padding-right: 28px;
}

.header-content:hover {
  color: white;
}

.header-text {
  flex: 1;
}

.sort-icon {
  color: #fbbf24;
  font-size: 0.75rem;
}

/* Column Filter Button */
.column-filter-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 6px;
  font-size: 0.75rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.column-filter-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.column-filter-btn.active {
  background: var(--accent-blue);
  color: white;
}

.column-filter-btn.has-filter {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.filter-count {
  background: rgba(0, 0, 0, 0.3);
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
}

/* Column Filter Dropdown */
.column-filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  min-width: 220px;
  max-height: 350px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  margin-top: 4px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  font-weight: 600;
  font-size: 0.85rem;
}

.filter-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.filter-close:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.filter-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 6px;
}

.filter-search i {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.filter-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.filter-actions {
  display: flex;
  gap: 6px;
  padding: 0 12px 8px;
}

.filter-action-btn {
  flex: 1;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 5px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.filter-action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.filter-options {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  max-height: 180px;
}

.filter-options::-webkit-scrollbar {
  width: 4px;
}

.filter-options::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text-secondary);
  font-size: 0.82rem;
  user-select: none;
}

.filter-option:hover {
  background: rgba(59, 130, 246, 0.1);
  color: var(--text-primary);
}

.filter-option.selected {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
}

.filter-option.selected .filter-value {
  font-weight: 500;
}

.filter-option input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 3px;
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
}

.filter-option input[type="checkbox"]:checked {
  background: var(--status-available);
  border-color: var(--status-available);
}

.filter-option input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.filter-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-count-badge {
  background: rgba(59, 130, 246, 0.2);
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.filter-footer {
  padding: 10px 12px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.apply-filter-btn {
  width: 100%;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Checkbox Column */
.checkbox-col {
  width: 44px;
  min-width: 44px;
  padding: 10px;
  text-align: center;
  background: rgba(20, 30, 50, 0.95);
}

/* Status Semaphore Column - STICKY y Ultra Visible */
.status-col {
  position: sticky;
  left: 44px;
  z-index: 15;
  width: 70px;
  min-width: 70px;
  padding: 12px 8px;
  text-align: center;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
  backdrop-filter: blur(12px);
  border-right: 2px solid rgba(59, 130, 246, 0.3);
  box-shadow: 
    2px 0 8px rgba(0, 0, 0, 0.3),
    inset -1px 0 0 rgba(59, 130, 246, 0.2);
}

.status-col i {
  color: var(--accent-cyan);
  font-size: 16px;
  opacity: 0.8;
  filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
}

.status-semaphore-col {
  position: sticky;
  left: 44px;
  z-index: 14;
  width: 70px;
  min-width: 70px;
  padding: 14px 8px;
  text-align: center;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  backdrop-filter: blur(12px);
  border-right: 2px solid rgba(59, 130, 246, 0.25);
  box-shadow: 
    2px 0 8px rgba(0, 0, 0, 0.3),
    inset -1px 0 0 rgba(59, 130, 246, 0.15);
}

.semaphore-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid transparent;
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: help;
  position: relative;
  overflow: hidden;
}

.semaphore-badge::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0%, 100% { transform: translateX(-100%) rotate(45deg); }
  50% { transform: translateX(100%) rotate(45deg); }
}

.semaphore-badge:hover {
  transform: scale(1.3) translateY(-3px) rotate(5deg);
  filter: brightness(1.3) saturate(1.2);
  box-shadow: 
    0 4px 25px rgba(0, 0, 0, 0.6),
    0 0 40px currentColor,
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

/* 🟢 Estado: Operativo */
.semaphore-operational {
  background: radial-gradient(circle at 30% 30%, #22c55e, #16a34a, #15803d);
  border-color: #22c55e;
  color: #22c55e;
  box-shadow: 
    0 0 25px rgba(34, 197, 94, 0.6),
    0 4px 15px rgba(34, 197, 94, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* 🟠 Estado: Mantenimiento Preventivo */
.semaphore-in-progress {
  background: radial-gradient(circle at 30% 30%, #f59e0b, #d97706, #b45309);
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow: 
    0 0 30px rgba(245, 158, 11, 0.7),
    0 4px 15px rgba(245, 158, 11, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* 🔴 Estado: Mantenimiento Correctivo CRÍTICO */
.semaphore-critical {
  background: radial-gradient(circle at 30% 30%, #ef4444, #dc2626, #b91c1c);
  border-color: #ef4444;
  color: #ef4444;
  box-shadow: 
    0 0 35px rgba(239, 68, 68, 0.8),
    0 4px 15px rgba(239, 68, 68, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* 🔵 Estado: En Calibración */
.semaphore-calibration {
  background: radial-gradient(circle at 30% 30%, #3b82f6, #2563eb, #1d4ed8);
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 
    0 0 30px rgba(59, 130, 246, 0.7),
    0 4px 15px rgba(59, 130, 246, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* 🟣 Estado: En Tránsito/Préstamo */
.semaphore-in-transit {
  background: radial-gradient(circle at 30% 30%, #8b5cf6, #7c3aed, #6d28d9);
  border-color: #8b5cf6;
  color: #8b5cf6;
  box-shadow: 
    0 0 28px rgba(139, 92, 246, 0.7),
    0 4px 15px rgba(139, 92, 246, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* 🟡 Estado: Necesita Atención */
.semaphore-warning {
  background: radial-gradient(circle at 30% 30%, #eab308, #ca8a04, #a16207);
  border-color: #eab308;
  color: #eab308;
  box-shadow: 
    0 0 28px rgba(234, 179, 8, 0.7),
    0 4px 15px rgba(234, 179, 8, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* ⚫ Estado: Fuera de Servicio */
.semaphore-offline {
  background: radial-gradient(circle at 30% 30%, #64748b, #475569, #334155);
  border-color: #64748b;
  color: #64748b;
  box-shadow: 
    0 0 18px rgba(100, 116, 139, 0.5),
    0 4px 12px rgba(100, 116, 139, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.15);
}

/* ⚪ Estado: Desconocido */
.semaphore-unknown {
  background: radial-gradient(circle at 30% 30%, #64748b, #475569);
  border-color: rgba(100, 116, 139, 0.4);
  color: #64748b;
  box-shadow: 
    0 0 15px rgba(100, 116, 139, 0.4),
    0 4px 12px rgba(100, 116, 139, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.12);
  opacity: 0.7;
}

/* Animación ULTRA LLAMATIVA para equipos en mantenimiento */
.semaphore-animate {
  animation: 
    pulse-semaphore 1.5s ease-in-out infinite,
    glow-pulse 1.5s ease-in-out infinite;
}

@keyframes pulse-semaphore {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 8px currentColor);
    opacity: 1;
  }
  50% {
    filter: brightness(1.5) drop-shadow(0 0 20px currentColor);
    opacity: 0.85;
  }
}

/* Icono del semáforo - Ultra Brillante */
.semaphore-icon {
  font-size: 20px;
  color: white;
  text-shadow: 
    0 1px 4px rgba(0, 0, 0, 0.7),
    0 0 12px rgba(255, 255, 255, 0.5),
    0 0 20px currentColor;
  font-weight: bold;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.3));
}

/* Colorear TODA LA FILA según estado */
.data-row {
  position: relative;
  transition: all 0.3s ease;
}

/* Borde lateral de color según estado */
.data-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: all 0.3s ease;
  z-index: 1;
}

/* Estados de color en filas */
.data-row.status-operational::before {
  background: linear-gradient(180deg, #22c55e, #16a34a);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
}

.data-row.status-in-progress::before {
  background: linear-gradient(180deg, #f59e0b, #d97706);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
}

.data-row.status-critical::before {
  background: linear-gradient(180deg, #ef4444, #dc2626);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
}

.data-row.status-calibration::before {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
}

.data-row.status-in-transit::before {
  background: linear-gradient(180deg, #8b5cf6, #7c3aed);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
}

.data-row.status-warning::before {
  background: linear-gradient(180deg, #eab308, #ca8a04);
  box-shadow: 0 0 12px rgba(234, 179, 8, 0.6);
}

.data-row.status-offline::before {
  background: linear-gradient(180deg, #64748b, #475569);
  box-shadow: 0 0 10px rgba(100, 116, 139, 0.4);
}

/* Efecto hover más llamativo en filas */
.data-row:hover::before {
  width: 6px;
  filter: brightness(1.3);
}

.data-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.sticky-col-left {
  position: sticky;
  left: 0;
  z-index: 15;
}

/* Actions Column - Más compacto */
.actions-col {
  width: 50px;
  min-width: 50px;
  padding: 8px;
  text-align: center;
  background: rgba(20, 30, 50, 0.95);
}

.sticky-col-right {
  position: sticky;
  right: 0;
  z-index: 15;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-blue);
}

/* Row Action Button */
.row-action-btn {
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.9rem;
}

.row-action-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.row-action-btn.active {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
}

/* Data Rows */
.data-row {
  border-bottom: 1px solid rgba(59, 130, 246, 0.06);
  transition: background 0.15s ease;
  cursor: pointer;
}

.data-row:hover {
  background: rgba(59, 130, 246, 0.06);
}

.data-row.selected {
  background: rgba(59, 130, 246, 0.12);
}

.data-row.context-open {
  background: rgba(59, 130, 246, 0.15);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3);
}

/* Row Status Classes */
.data-row.row-available {
  border-left: 4px solid var(--status-available);
}

.data-row.row-maintenance {
  border-left: 4px solid var(--status-maintenance);
  background: rgba(245, 158, 11, 0.03);
}

.data-row.row-unavailable {
  border-left: 4px solid var(--status-unavailable);
}

.data-row.row-retired {
  border-left: 4px solid var(--status-retired);
  opacity: 0.7;
}

/* Data Cells */
.data-cell {
  padding: 12px 16px;
  color: var(--text-secondary);
  border-right: 1px solid rgba(59, 130, 246, 0.05);
  max-width: 200px;
}

.cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-inventory {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--accent-cyan);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.cell-equipment {
  color: #60a5fa;
  font-weight: 500;
}

.cell-brand {
  color: #a78bfa;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.status-maintenance {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
  animation: pulse-maintenance 2s ease-in-out infinite;
}

@keyframes pulse-maintenance {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-badge.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.status-retired {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  padding: 6px 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  transform: scale(1.1);
}

.action-btn.view-btn:hover { color: var(--accent-cyan); }
.action-btn.edit-btn:hover { color: #fbbf24; }
.action-btn.menu-btn.active { background: var(--accent-blue); color: white; }

.action-menu {
  position: relative;
}

.action-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 6px;
  min-width: 150px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.15);
  color: var(--text-primary);
}

.menu-item i {
  width: 18px;
  color: var(--text-muted);
}

.menu-item:hover i {
  color: var(--accent-blue);
}

/* ═══════════════════════════════════════════════════════════════
   PAGINATION FOOTER - Compacto
   ═══════════════════════════════════════════════════════════════ */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--panel-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
}

.info-badge i {
  color: var(--accent-blue);
  font-size: 0.9rem;
}

.info-badge.selected {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
  color: #86efac;
}

.info-badge.selected i {
  color: var(--status-available);
}

.info-badge.filtered {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fcd34d;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.last-updated i {
  font-size: 0.8rem;
}

.goto-page {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.goto-input {
  width: 50px;
  padding: 6px 8px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  color: var(--text-primary);
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.goto-input:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-size-select {
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.page-size-select:hover,
.page-size-select:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-btn {
  padding: 8px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--accent-blue);
  color: #93c5fd;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.page-input {
  width: 50px;
  padding: 6px 8px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  color: var(--text-primary);
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.page-input:focus {
  border-color: var(--accent-blue);
  outline: none;
}

.page-separator {
  color: var(--text-muted);
}

.total-pages {
  color: var(--text-secondary);
  font-weight: 600;
}

.range-info {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL DE DETALLES DEL EQUIPO
   ═══════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  animation: modal-enter 0.3s ease-out;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon-wrap {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
}

.modal-icon-wrap.status-available {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.modal-icon-wrap.status-maintenance {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.modal-icon-wrap.status-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.modal-icon-wrap.status-retired {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
}

.modal-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-cyan);
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', monospace;
}

.modal-close-btn {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #f87171;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

/* Status Banner in Modal */
.status-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.status-banner.status-available {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-banner.status-maintenance {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-banner.status-unavailable {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-banner.status-retired {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1));
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Quick Info Grid */
.quick-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 10px;
  transition: all 0.2s;
}

.info-card:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(59, 130, 246, 0.3);
}

.info-card i {
  font-size: 1.3rem;
  color: var(--accent-blue);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
}

/* Details Section - Más espaciado */
.details-section {
  background: rgba(15, 22, 40, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 10px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  color: #93c5fd;
  font-size: 0.95rem;
  font-weight: 600;
}

.section-title i {
  color: var(--accent-blue);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.details-grid::-webkit-scrollbar {
  width: 4px;
}

.details-grid::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(25, 35, 55, 0.7);
  border-radius: 6px;
  transition: background 0.15s ease;
  border-left: 2px solid transparent;
}

.detail-item:hover {
  background: rgba(25, 35, 55, 0.95);
  border-left-color: rgba(59, 130, 246, 0.4);
}

.detail-item.highlighted {
  border-left: 2px solid var(--accent-blue);
  background: rgba(59, 130, 246, 0.08);
}

.detail-label {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-value {
  font-size: 0.88rem;
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.35;
  font-weight: 500;
}

.detail-value.empty {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.8rem;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  flex-wrap: wrap;
}

.modal-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-action-btn.edit-btn {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.modal-action-btn.edit-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-2px);
}

.modal-action-btn.barcode-btn {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.modal-action-btn.barcode-btn:hover {
  background: rgba(168, 85, 247, 0.25);
  transform: translateY(-2px);
}

.modal-action-btn.maint-btn {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.3);
  color: #fb923c;
}

.modal-action-btn.maint-btn:hover {
  background: rgba(249, 115, 22, 0.25);
  transform: translateY(-2px);
}

.modal-action-btn.close-btn {
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(100, 116, 139, 0.3);
  color: var(--text-secondary);
}

.modal-action-btn.close-btn:hover {
  background: rgba(100, 116, 139, 0.25);
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITIONS & ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
}

/* Dropdown Slide */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.2s ease;
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Filter Dropdown */
.filter-dropdown-enter-active,
.filter-dropdown-leave-active {
  transition: all 0.2s ease;
}

.filter-dropdown-enter-from,
.filter-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Menu Pop */
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: all 0.15s ease;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Badge Pop */
.badge-pop-enter-active,
.badge-pop-leave-active {
  transition: all 0.2s ease;
}

.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Context Menu Transition */
.context-menu-enter-active,
.context-menu-leave-active {
  transition: all 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT MENU FLOTANTE
   ═══════════════════════════════════════════════════════════════ */
.context-menu {
  position: fixed;
  z-index: 100000;
  background: rgba(15, 22, 40, 0.98);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  min-width: 200px;
  overflow: hidden;
}

.context-menu-header {
  padding: 12px 14px;
  background: rgba(59, 130, 246, 0.08);
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
}

.context-equipment {
  display: block;
  color: #e6f0ff;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.context-inventory {
  display: block;
  color: #7dd3fc;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 2px;
}

.context-menu-body {
  padding: 6px;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  text-align: left;
}

.context-item:hover {
  background: rgba(59, 130, 246, 0.12);
  color: #ffffff;
}

.context-item span[class^="icon-"] {
  width: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.context-item i {
  width: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.context-item:hover i {
  color: #60a5fa;
}

.context-item.maintenance {
  color: var(--status-maintenance);
}

.context-item.maintenance i {
  color: var(--status-maintenance);
}

.context-item.maintenance:hover {
  background: rgba(245, 158, 11, 0.12);
}

.context-divider {
  height: 1px;
  background: rgba(59, 130, 246, 0.1);
  margin: 4px 8px;
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE DESIGN
   ═══════════════════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .biomedical-table-container {
    padding: 16px;
    gap: 12px;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .search-box {
    max-width: none;
    width: 100%;
  }

  .toolbar-right {
    justify-content: flex-end;
  }

  .pagination-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    margin: 10px;
  }

  .quick-info-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-action-btn {
    width: 100%;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }

  .action-btn {
    padding: 4px 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .biomedical-table-container {
    padding: 12px;
  }

  .data-table {
    font-size: 0.8rem;
  }

  .table-header,
  .data-cell {
    padding: 10px 12px;
    min-width: 100px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-title {
    font-size: 1.1rem;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SEMÁFORO DE MANTENIMIENTO - Status Badge Styling
   ═══════════════════════════════════════════════════════════════ */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.status-badge::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: currentColor;
  opacity: 0.8;
}

.status-badge i {
  font-size: 0.95em;
}

/* ✅ VERDE - OPERATIVO/DISPONIBLE */
.status-available {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.1);
  padding-left: 12px;
}

.status-available::before {
  background: #2e7d32;
}

/* 🟡 AMARILLO - MANTENIMIENTO (con pulse) */
.status-maintenance {
  background: rgba(230, 81, 0, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(230, 81, 0, 0.3);
  box-shadow: 0 0 8px rgba(230, 81, 0, 0.1);
  animation: pulse-maintenance 2.5s ease-in-out infinite;
  padding-left: 12px;
}

.status-maintenance::before {
  background: #e65100;
  animation: pulse-bar-maintenance 2.5s ease-in-out infinite;
}

/* 🔴 ROJO - NO DISPONIBLE/CRÍTICO (pulse rápido) */
.status-unavailable {
  background: rgba(183, 28, 28, 0.15);
  color: #fc5c65;
  border: 1px solid rgba(183, 28, 28, 0.3);
  box-shadow: 0 0 8px rgba(183, 28, 28, 0.15);
  animation: pulse-unavailable 1.5s ease-in-out infinite;
  padding-left: 12px;
}

.status-unavailable::before {
  background: #b71c1c;
  animation: pulse-bar-unavailable 1.5s ease-in-out infinite;
}

/* ⚫ GRIS - RETIRADO/DESCONOCIDO */
.status-retired,
.status-unknown {
  background: rgba(107, 114, 128, 0.15);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.2);
  padding-left: 12px;
}

.status-retired::before,
.status-unknown::before {
  background: #6b7280;
}

/* ─────────────────────────────────────────────────────────────
   ANIMACIONES SEMÁFORO
   ───────────────────────────────────────────────────────────── */

@keyframes pulse-maintenance {
  0%, 100% {
    box-shadow: 0 0 8px rgba(230, 81, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 12px rgba(230, 81, 0, 0.25);
  }
}

@keyframes pulse-bar-maintenance {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes pulse-unavailable {
  0%, 100% {
    box-shadow: 0 0 8px rgba(183, 28, 28, 0.15);
  }
  50% {
    box-shadow: 0 0 14px rgba(183, 28, 28, 0.3);
  }
}

@keyframes pulse-bar-unavailable {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ─────────────────────────────────────────────────────────────
   ROW STATUS STYLING
   ───────────────────────────────────────────────────────────── */

.data-row.row-available {
  border-left: 3px solid rgba(34, 197, 94, 0.3);
}

.data-row.row-maintenance {
  border-left: 3px solid rgba(230, 81, 0, 0.4);
}

.data-row.row-unavailable {
  border-left: 3px solid rgba(183, 28, 28, 0.4);
}

.data-row.row-retired,
.data-row.row-unknown {
  border-left: 3px solid rgba(107, 114, 128, 0.2);
}

</style>