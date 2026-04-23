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
          <button v-if="canManageBiomedical" @click="exportSelectedToCSV" class="bulk-btn export">
            <i class="pi pi-download"></i> Exportar Selección
          </button>
          <button v-if="canManageBiomedical" @click="bulkRequestMaintenance" class="bulk-btn maintenance">
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
                  <h2 class="modal-title">{{ getEquipmentValue(selectedEquipment) || 'Equipo Médico' }}</h2>
                  <span class="modal-subtitle">
                    <i class="pi pi-hashtag"></i>
                    {{ getInventoryValue(selectedEquipment) || 'Sin inventario' }}
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
                    <span class="info-value">{{ getInventoryValue(selectedEquipment) || '-' }}</span>
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
                    <span class="info-value">{{ getSeriesValue(selectedEquipment) || '-' }}</span>
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
                    v-for="([key, value]) in selectedEquipmentDisplayEntries"
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
              <button v-if="canEditBiomedicalEquipment" @click="handleEditItem(selectedEquipment)" class="modal-action-btn edit-btn">
                <i class="pi pi-pencil"></i> Editar
              </button>
              <button @click="handleShowBarcode(selectedEquipment)" class="modal-action-btn barcode-btn">
                <i class="pi pi-qrcode"></i> Código
              </button>
              <button v-if="canManageBiomedical" @click="handleRequestMaintenance(selectedEquipment)" class="modal-action-btn maint-btn">
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
         <!-- Botón Agregar Nuevo Equipo (solo admin) -->
         <button 
           v-if="canCreateBiomedicalEquipment"
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
              <!-- Opciones de exportación con control de cantidad -->
              <div class="export-section-title">Exportar Excel</div>
              
              <!-- Opción: Si hay elementos seleccionados, mostrar opción de exportar seleccionados -->
              <div v-if="selectedRows.length > 0" class="export-option-group">
                <button @click="exportSelectedToExcel(); showExportMenu = false" class="export-option highlight-option">
                  <i class="pi pi-file-excel"></i>
                  <span>Excel ({{ selectedRows.length }} seleccionados)</span>
                </button>
                <div class="export-divider"></div>
              </div>
              
              <div class="export-option-group">
                <label class="export-checkbox-option">
                  <input type="checkbox" v-model="useExportLimit" />
                  <span>Descargar cantidad específica</span>
                </label>
                <div v-if="useExportLimit" class="export-limit-input">
                  <input 
                    type="number" 
                    v-model.number="exportLimit" 
                    class="limit-number-input"
                    min="1" 
                    :max="displayedFiltered.length"
                    placeholder="Cantidad"
                  />
                  <span>equipos</span>
                </div>
                <div v-else class="export-all-info">
                  <span>Se descargarán todos los {{ displayedFiltered.length }} equipos</span>
                </div>
              </div>
              <button @click="exportToExcel(); showExportMenu = false" class="export-option">
                <i class="pi pi-file-excel"></i>
                <span>Descargar Excel</span>
              </button>
              <div class="export-divider"></div>
              <button @click="exportToCSV(); showExportMenu = false" class="export-option">
                <i class="pi pi-file"></i>
                <span>Exportar CSV</span>
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
         BÚSQUEDA AVANZADA / REFINAMIENTO (NUEVO)
         ═══════════════════════════════════════════════════════════════ -->
    <OrderFilterBar
      v-if="!compactMode"
      :filters="advancedSearchFiltersConfig"
      title="Búsqueda Avanzada de Equipos"
      subtitle="Filtra por múltiples parámetros específicos (inventario, marca, modelo, etc.)"
      :count-label="`Resultados: ${displayedFiltered.length}`"
      :suggestions-by-field="advancedSearchFiltersConfig.suggestionsByField.value"
      :field-options="advancedSearchFields"
      style="margin-bottom: 12px;"
    />

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
      <div v-else-if="displayedFiltered.length === 0 && !loading" class="empty-state">
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
      <div v-if="displayedFiltered && displayedFiltered.length > 0" class="scroll-container" ref="scrollContainer" @scroll.passive="handleScroll">
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
                      <button type="button" @click.stop.prevent="selectAllFilterValues(col.field)" class="filter-action-btn">
                        <i class="pi pi-check-square"></i> Todos
                      </button>
                      <button type="button" @click.stop.prevent="clearColumnFilter(col.field)" class="filter-action-btn">
                        <i class="pi pi-times"></i> Ninguno
                      </button>
                    </div>
                    
                    <div class="filter-options">
                      <!-- Checkbox maestro: Todos / Vacío -->
                      <label class="filter-option filter-toggle-all" @click.stop @mousedown.stop>
                        <input
                          type="checkbox"
                          :checked="allFilterValuesSelected(col.field)"
                          @change.stop="toggleAllFilterValues(col.field)"
                          @click.stop
                        />
                        <span class="filter-checkbox"></span>
                        <span class="filter-value toggle-all-label">
                          {{ allFilterValuesSelected(col.field) ? 'Vacío' : 'Todos' }}
                        </span>
                      </label>
                      <div class="filter-options-divider"></div>

                      <label
                        v-for="value in getFilteredUniqueValues(col.field)"
                        :key="value"
                        class="filter-option"
                        :class="{ selected: isFilterValueSelected(col.field, value) }"
                      >
                        <input
                          type="checkbox"
                          :checked="isFilterValueSelected(col.field, value)"
                          @change.stop="toggleFilterValue(col.field, value)"
                          @click.stop
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
              v-for="(item, idx) of renderedData" 
              :key="getItemKey(item, idx)"
              class="data-row"
              ref="tableRowsRef"
              :class="{ 
                selected: selectedRows && selectedRows.includes(idx),
                'context-open': contextMenuIdx && contextMenuIdx.value === idx,
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
                  :checked="selectedRows && selectedRows.includes(idx)"
                  @change="toggleRowSelect(idx)"
                  class="checkbox"
                  />
                </td>
                
                <!-- STATUS SEMÁFORO VISUAL -->
                <td class="status-semaphore-col">
                  <div 
                    class="semaphore-badge"
                    :class="[
                      `semaphore-${renderedStatuses[idx]?.badge}`,
                      { 'semaphore-animate': renderedStatuses[idx]?.animate }
                    ]"
                    :title="renderedStatuses[idx]?.label"
                  >
                    <i class="pi semaphore-icon" :class="renderedStatuses[idx]?.icon"></i>
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
                      <span 
                        class="status-badge" 
                        :class="getStatusColorClass(item[col.field])"
                        :style="getDualColorStyle(item)"
                      >
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
                    :class="{ active: contextMenuIdx && contextMenuIdx.value === idx }"
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
              <span class="context-equipment">{{ getEquipmentValue(contextMenuItem) || 'Equipo' }}</span>
              <span class="context-inventory">{{ getInventoryValue(contextMenuItem) }}</span>
            </div>
            <div class="context-menu-body">
              <button @click="handleViewItem(contextMenuItem)" class="context-item">
                <span class="icon-history">📋</span>
                <span>Historial del equipo</span>
              </button>
              <button v-if="canEditBiomedicalEquipment" @click="handleEditItem(contextMenuItem)" class="context-item">
                <span class="icon-edit">✏️</span>
                <span>Editar equipo</span>
              </button>
              <button @click="handleShowBarcode(contextMenuItem)" class="context-item">
                <span class="icon-qr">📲</span>
                <span>Código QR / Barras</span>
              </button>
              <div v-if="canManageBiomedical" class="context-divider"></div>
              <button v-if="canManageBiomedical" @click="handleRequestMaintenance(contextMenuItem)" class="context-item maintenance">
                <span class="icon-maintenance">🔧</span>
                <span>Solicitar mantenimiento</span>
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════
         FOOTER / INFO
         ═══════════════════════════════════════════════════════════════ -->
    <div class="pagination-footer glass-panel">
      <div class="pagination-info">
        <span class="info-badge">
          <i class="pi pi-database"></i>
          {{ displayedFiltered.length }} equipo{{ displayedFiltered.length !== 1 ? 's' : '' }}
        </span>
        <span v-if="selectedRows.length > 0" class="info-badge selected">
          <i class="pi pi-check-square"></i>
          {{ selectedRows.length }} seleccionado{{ selectedRows.length !== 1 ? 's' : '' }}
        </span>
        <!-- Indicador de Datos Filtrados -->
        <span v-if="displayedFiltered.length !== props.data.length" class="info-badge filtered">
          <i class="pi pi-filter"></i>
          de {{ props.data.length }} total
        </span>
        <!-- Indicador de carga en background -->
        <span v-if="loading" class="info-badge loading">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando más equipos...
        </span>
        <!-- Tiempo de última actualización -->
        <span class="last-updated" v-if="lastUpdated">
          <i class="pi pi-clock"></i>
          Actualizado: {{ formatTimeAgo(lastUpdated) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import AddEquipmentWizard from './AddEquipmentWizard.vue'
import OrderFilterBar from './OrderFilterBar.vue'
import { useSemaforoRuleEngine } from '@/composables/useSemaforoRuleEngine.js'
import { usePermissions } from '@/composables/usePermissions.js'
import { invalidateBiomedicalEquipmentCatalog } from '@/services/biomedicalEquipmentCatalog.js'

// Permisos del usuario actual
const { canCreateBiomedicalEquipment, canEditBiomedicalEquipment, canManageBiomedical } = usePermissions()

// ═══════════════════════════════════════════════════════════════
// PROPS Y EMITS
// ═══════════════════════════════════════════════════════════════
const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pageSize: { type: Number, default: 25 },
  showAllColumns: { type: Boolean, default: true },
  maintenanceMap: { type: Object, default: () => ({}) },
  serverTotal: { type: Number, default: null }
})



const emit = defineEmits(['view-item', 'edit-item', 'show-barcode', 'refresh', 'request-maintenance', 'open-scan-modal', 'scan-code', 'need-more'])

// Composable de semaforización (reglas en backend)
const { getEquipmentColors, getColorSync, clearCache } = useSemaforoRuleEngine();

// La API de equipos añade llaves de compatibilidad (camelCase / alias) para no
// romper flujos legacy; pero en la tabla sólo debemos mostrar las columnas reales
// de la tabla principal. El usuario validó que el corte esperado es OBSERVACIONES1/2.
const DISPLAY_CUTOFF_KEYS = ['OBSERVACIONES2', 'observaciones2', 'OBSERVACIONES1', 'observaciones1']

const tableRowsRef = ref([])

function animateRowsWithGsap() {
  if (!tableRowsRef.value || tableRowsRef.value.length === 0) return;
  
  gsap.killTweensOf(tableRowsRef.value);
  
  tableRowsRef.value.forEach((row) => {
    if (!row) return;
    
    gsap.set(row, { clearProps: "all" });

    let glowColor = '';
    let bgColor = '';

    // Rojo: Crítico / Fuera de servicio
    if (row.classList.contains('status-critical') || row.classList.contains('status-unavailable')) {
      glowColor = 'rgba(239, 68, 68, 0.15)'; 
      bgColor = 'rgba(239, 68, 68, 0.02)';
    } 
    // Naranja/Amarillo: Mantenimiento / Parcial
    else if (row.classList.contains('status-maintenance') || row.classList.contains('status-partial')) {
      glowColor = 'rgba(245, 158, 11, 0.15)'; 
      bgColor = 'rgba(245, 158, 11, 0.02)';
    } 
    // Verde: Disponible
    else if (row.classList.contains('status-available') || row.classList.contains('status-operational')) {
      glowColor = 'rgba(34, 197, 94, 0.1)'; 
      bgColor = 'rgba(34, 197, 94, 0.01)';
    }

    if (glowColor) {
      // Efecto "Sweep Glassmorphism": un gradiente sutil que barre la fila de lado a lado
      gsap.set(row, {
        background: `linear-gradient(90deg, ${bgColor} 0%, ${glowColor} 50%, ${bgColor} 100%)`,
        backgroundSize: "300% 100%",
        backgroundPosition: "100% 0%",
        backdropFilter: "blur(4px)" // El blur que pedías
      });

      gsap.to(row, {
        backgroundPosition: "0% 0%",
        duration: 4 + Math.random() * 2, // Movimiento lento y majestuoso
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      // Añadimos un sutil resplandor en los bordes superior/inferior
      gsap.to(row, {
        boxShadow: `inset 0 1px 0 ${glowColor}, inset 0 -1px 0 ${glowColor}`,
        duration: 2 + Math.random() * 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  });
}

const HIDDEN_COMPAT_KEYS = new Set([
  // aliases legacy/compat que no deben verse como columnas
  'no de inventario', 'n_de_inventario', 'equipo_medico', 'unidad_medica',
  'ubicacion', 'ubicacion especifica', 'ubicación específica',
  // campos derivados camelCase
  'nombre', 'marca', 'modelo', 'serie', 'estado',
  'noinventario', 'clavehraei', 'clavecnis', 'clues',
  'unidadmedica', 'especialidadarea', 'categoria',
  'observaciones', 'condicionesdelequipo', 'tipodemantenimiento',
  'funcional', 'causanofuncionamiento', 'garantia',
  'fingarantia', 'ultimomantenimientopreventivo',
  'fechainstalacion', 'aniodefabricacion', 'origenbien',
  'lote', 'referencia', 'proveedorservicio', 'cartaobsolescencia',
  'servicio',
  // alternos
  'images'
])

function getFirstExistingValue(item, candidates = []) {
  if (!item || typeof item !== 'object') return ''
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(item, candidate)) {
      const value = item[candidate]
      if (value !== null && value !== undefined && String(value).trim() !== '') return value
    }
  }
  return ''
}

function getInventoryValue(item) {
  return getFirstExistingValue(item, ['No. DE INVENTARIO', 'No DE INVENTARIO', 'N_DE_INVENTARIO', 'noInventario'])
}

function getEquipmentValue(item) {
  return getFirstExistingValue(item, ['EQUIPO MÉDICO', 'EQUIPO MEDICO', 'EQUIPO_MEDICO', 'nombre'])
}

function getSeriesValue(item) {
  return getFirstExistingValue(item, ['NÚMERO DE SERIE', 'NUMERO DE SERIE', 'SERIE', 'Serie'])
}

function getUnitValue(item) {
  return getFirstExistingValue(item, ['UNIDAD MÉDICA', 'UNIDAD MEDICA', 'UNIDAD_MEDICA'])
}

function getLocationValue(item) {
  return getFirstExistingValue(item, ['UBICACIÓN ESPECÍFICA', 'UBICACION ESPECIFICA', 'UBICACION', 'UBICACIÓN'])
}

function getServiceValue(item) {
  return getFirstExistingValue(item, ['ÁREA EN LA QUE SE ENTREGO EL EQUIPO', 'SERVICIO'])
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

function getDisplayGroupKey(key) {
  const normalized = normalizeKey(key)

  if (normalized.includes('inventario')) return 'inventario'
  if (normalized.includes('equipomedico') || normalized === 'nombre') return 'equipo_medico'
  if (normalized === 'marca' || normalized === 'brand') return 'marca'
  if (normalized === 'modelo' || normalized === 'model') return 'modelo'
  if (normalized === 'serie' && !normalized.startsWith('observaciones')) return 'serie'
  if (normalized.includes('ubicacion')) return 'ubicacion'
  if (normalized.includes('unidadmedica')) return 'unidad_medica'
  if (normalized.includes('estatus') || normalized === 'estado') return 'estatus'
  if (normalized.startsWith('observaciones') && normalized !== 'observaciones') return normalized
  if (normalized === 'observaciones') return 'observaciones'
  if (normalized.includes('tipodemantenimiento')) return 'tipo_mantenimiento'
  if (normalized.includes('proveedorservicio')) return 'proveedor_servicio'
  if (normalized.includes('fechadeinstalacion')) return 'fecha_instalacion'

  return normalized
}

function getDisplayKeysFromRow(row) {
  if (!row || typeof row !== 'object') return []

  const seenGroups = new Set()
  const keys = []

  for (const key of Object.keys(row)) {
    if (key === '__hasRealData') continue
    if (key.startsWith('_')) continue

    const normalizedKey = normalizeKey(key)
    if (HIDDEN_COMPAT_KEYS.has(normalizedKey)) continue

    const group = getDisplayGroupKey(key)
    if (seenGroups.has(group)) continue

    seenGroups.add(group)
    keys.push(key)
  }

  const ordered = []
  const leftovers = [...keys]
  for (const priority of priorityColumns) {
    const idx = leftovers.findIndex(k => normalizeKey(k) === normalizeKey(priority))
    if (idx !== -1) {
      ordered.push(leftovers[idx])
      leftovers.splice(idx, 1)
    }
  }

  const finalKeys = ordered.concat(leftovers)

  let cutoffIndex = -1
  const cutoffNormalized = DISPLAY_CUTOFF_KEYS.map(k => normalizeKey(k))
  for (let idx = 0; idx < finalKeys.length; idx++) {
    if (cutoffNormalized.includes(normalizeKey(finalKeys[idx]))) {
      cutoffIndex = idx
      break
    }
  }
  if (cutoffIndex >= 0) return finalKeys.slice(0, cutoffIndex + 1)
  return finalKeys
}

const selectedEquipmentDisplayEntries = computed(() => {
  const it = selectedEquipment.value
  if (!it) return []
  if (props.columns.length > 0) {
    return props.columns.map(col => [col.field, it[col.field]])
  }
  const keys = getDisplayKeysFromRow(it)
  return keys.map(k => [k, it[k]])
})

// helper to refresh colors on an array
function refreshItemsSemaforo(items) {
  const invs = Array.from(new Set(
    (items || [])
      .map(i => getInventoryValue(i))
      .filter(inv => {
        if (!inv) return false
        const cached = getColorSync(inv)
        return !cached || !cached.badge || cached.badge === 'partial'
      })
  )).slice(0, Math.max(10, internalPageSize.value))
  if (!invs.length) return
  getEquipmentColors(invs).then(map => {
    ;(items || []).forEach(item => {
      const inv = getInventoryValue(item)
      if (map[inv]) {
        item.semaforizacion = map[inv]
      }
    })
  })
}


// ═══════════════════════════════════════════════════════════════
// COLUMNAS PRIORITARIAS (se muestran por defecto)
// ═══════════════════════════════════════════════════════════════
const priorityColumns = [
  'No. DE INVENTARIO', 'EQUIPO MÉDICO', 'MARCA', 'MODELO',
  'NÚMERO DE SERIE', 'UNIDAD MÉDICA', 'ESTATUS', 'UBICACIÓN ESPECÍFICA'
]

// ═══════════════════════════════════════════════════════════════
// ESTADO REACTIVO
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA AVANZADA (REFINAMIENTO)
// ═══════════════════════════════════════════════════════════════
const advancedSearchFields = [
  { key: 'noInventario', label: 'No. Inventario', placeholder: 'Ej. 12345', type: 'text', activates: true },
  { key: 'equipoMedico', label: 'Equipo Médico', placeholder: 'Ej. Monitor', type: 'text', activates: true },
  { key: 'marca', label: 'Marca', placeholder: 'Ej. Philips', type: 'text', activates: true },
  { key: 'modelo', label: 'Modelo', placeholder: 'Ej. MX40', type: 'text', activates: true },
  { key: 'serie', label: 'Serie', placeholder: 'Buscar serie...', type: 'text', activates: true },
  { key: 'ubicacion', label: 'Ubicación', placeholder: 'Ej. UCIA', type: 'text', activates: true },
]

const advancedFilterState = ref({
  noInventario: '',
  equipoMedico: '',
  marca: '',
  modelo: '',
  serie: '',
  ubicacion: ''
})

const advancedFilterActive = ref({
  noInventario: false,
  equipoMedico: false,
  marca: false,
  modelo: false,
  serie: false,
  ubicacion: false
})

const advancedSearchFiltersConfig = {
  fieldBindings: advancedFilterState,
  chipsList: computed(() => {
    const chips = []
    const addChip = (key, label) => {
      if (advancedFilterActive.value[key] && advancedFilterState.value[key]) {
        chips.push({ key, label, value: advancedFilterState.value[key] })
      }
    }
    addChip('noInventario', 'No. Inventario')
    addChip('equipoMedico', 'Equipo Médico')
    addChip('marca', 'Marca')
    addChip('modelo', 'Modelo')
    addChip('serie', 'Serie')
    addChip('ubicacion', 'Ubicación')
    return chips
  }),
  hasActiveFilters: computed(() => Object.keys(advancedFilterActive.value).some(k => advancedFilterActive.value[k] && advancedFilterState.value[k])),
  clearAllFilters: () => {
    Object.keys(advancedFilterState.value).forEach(k => {
      advancedFilterState.value[k] = ''
      advancedFilterActive.value[k] = false
    })
  },
  removeFilter: (key) => {
    advancedFilterState.value[key] = ''
    advancedFilterActive.value[key] = false
  },
  activateFilter: (key) => {
    advancedFilterActive.value[key] = true
  },
  suggestionsByField: computed(() => {
    const suggestions = { noInventario: [], equipoMedico: [], marca: [], modelo: [], serie: [], ubicacion: [] }
    const seen = { noInventario: new Set(), equipoMedico: new Set(), marca: new Set(), modelo: new Set(), serie: new Set(), ubicacion: new Set() }
    
    for (const item of props.data || []) {
      const add = (key, val) => {
        if (!val) return
        const str = String(val).trim()
        if (!str || seen[key].has(str.toLowerCase())) return
        seen[key].add(str.toLowerCase())
        suggestions[key].push({ value: str, label: str, count: 1 })
      }
      add('noInventario', getInventoryValue(item))
      add('equipoMedico', getEquipmentValue(item))
      add('marca', item.MARCA)
      add('modelo', item.MODELO)
      add('serie', getSeriesValue(item))
      add('ubicacion', getLocationValue(item))
    }
    return suggestions
  })
}

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

// Control de exportación parcial
const useExportLimit = ref(false)
const exportLimit = ref(100)
const exportLimitOptions = [50, 100, 200, 500, 1000]

// Computed para obtener el límite efectivo de exportación
const effectiveExportLimit = computed(() => {
  if (!useExportLimit.value) return displayedFiltered.value.length
  const limit = parseInt(exportLimit.value) || 100
  return Math.min(limit, displayedFiltered.value.length)
})

// Escaneo
const scanModeActive = ref(false)
const scanBuffer = ref('')
const scanTimeout = ref(null)
const searchInput = ref(null)

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
let searchDebounceTimer = null
const searchTerm = ref('')
const debouncedSearchTerm = ref('')
const fieldStatsCache = new Map()

// ═══════════════════════════════════════════════════════════════
// COLUMNAS COMPUTADAS
// ═══════════════════════════════════════════════════════════════
const allColumns = computed(() => {
  if (props.columns.length > 0) {
    return props.columns
  }
  if (props.showAllColumns && props.data.length > 0) {
    const orderedKeys = getDisplayKeysFromRow(props.data[0])
    return orderedKeys.map(key => ({ field: key, header: formatHeader(key) }))
  }
  return [
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

const FAST_SEARCH_FIELDS = [
  'No. DE INVENTARIO',
  'No DE INVENTARIO',
  'N_DE_INVENTARIO',
  'EQUIPO MÉDICO',
  'EQUIPO MEDICO',
  'MARCA',
  'MODELO',
  'NÚMERO DE SERIE',
  'NUMERO DE SERIE',
  'CLUES',
  'CLAVE CNIS',
  'UNIDAD MÉDICA',
  'UNIDAD MEDICA',
  'UBICACIÓN ESPECÍFICA',
  'UBICACION ESPECIFICA'
]

const searchableRows = computed(() => {
  return (props.data || []).map(item => ({
    item,
    searchText: FAST_SEARCH_FIELDS
      .map(field => item?.[field])
      .filter(value => value !== null && value !== undefined && String(value).trim() !== '')
      .join(' \u0000 ')
      .toLowerCase()
  }))
})

const searchSuggestions = computed(() => {
  const term = String(searchTerm.value || '').trim().toLowerCase()
  if (!term) return []

  const suggestions = []
  const seen = new Set()

  for (const item of props.data || []) {
    const candidates = [
      getInventoryValue(item),
      getEquipmentValue(item),
      getSeriesValue(item),
      item?.MARCA,
      item?.MODELO,
      item?.CLUES,
      getUnitValue(item),
      getLocationValue(item)
    ]

    for (const raw of candidates) {
      const value = String(raw || '').trim()
      if (!value) continue
      const normalized = value.toLowerCase()
      if (!normalized.includes(term)) continue
      if (seen.has(normalized)) continue
      seen.add(normalized)
      suggestions.push(value)
      if (suggestions.length >= 20) return suggestions
    }
  }

  return suggestions
})

function getFieldStats(field) {
  const cacheKey = `${field}::${props.data?.length || 0}`
  if (fieldStatsCache.has(cacheKey)) return fieldStatsCache.get(cacheKey)

  const counts = new Map()
  for (const item of props.data || []) {
    const value = String(item?.[field] ?? '')
    counts.set(value, (counts.get(value) || 0) + 1)
  }

  const stats = {
    values: Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, 'es', { numeric: true })),
    counts
  }
  fieldStatsCache.set(cacheKey, stats)
  return stats
}

// ═══════════════════════════════════════════════════════════════
// FILTRADO Y ORDENAMIENTO DE DATOS
// ═══════════════════════════════════════════════════════════════
const filteredData = computed(() => {
  let result = props.data

  // Aplicar búsqueda avanzada (OrderFilterBar)
  if (advancedSearchFiltersConfig.hasActiveFilters.value) {
    result = result.filter(item => {
      let match = true
      if (advancedFilterActive.value.noInventario && advancedFilterState.value.noInventario) {
        match = match && String(getInventoryValue(item) || '').toLowerCase().includes(advancedFilterState.value.noInventario.toLowerCase())
      }
      if (advancedFilterActive.value.equipoMedico && advancedFilterState.value.equipoMedico) {
        match = match && String(getEquipmentValue(item) || '').toLowerCase().includes(advancedFilterState.value.equipoMedico.toLowerCase())
      }
      if (advancedFilterActive.value.marca && advancedFilterState.value.marca) {
        match = match && String(item.MARCA || '').toLowerCase().includes(advancedFilterState.value.marca.toLowerCase())
      }
      if (advancedFilterActive.value.modelo && advancedFilterState.value.modelo) {
        match = match && String(item.MODELO || '').toLowerCase().includes(advancedFilterState.value.modelo.toLowerCase())
      }
      if (advancedFilterActive.value.serie && advancedFilterState.value.serie) {
        match = match && String(getSeriesValue(item) || '').toLowerCase().includes(advancedFilterState.value.serie.toLowerCase())
      }
      if (advancedFilterActive.value.ubicacion && advancedFilterState.value.ubicacion) {
        match = match && String(getLocationValue(item) || '').toLowerCase().includes(advancedFilterState.value.ubicacion.toLowerCase())
      }
      return match
    })
  }

  // Aplicar búsqueda global
  if (debouncedSearchTerm.value) {    const search = debouncedSearchTerm.value.toLowerCase().trim()
    result = searchableRows.value
      .filter(entry => entry.searchText.includes(search))
      .map(entry => entry.item)
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
      const allowedValues = new Set(filterValues)
      result = result.filter(item => {
        const cellValue = String(item[field] ?? '')
        return allowedValues.has(cellValue)
      })
    }
  })
  
  // Aplicar ordenamiento
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortField.value] ?? ''
      const bVal = b[sortField.value] ?? ''
      const comparison = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
      return comparison * sortOrder.value
    })
  }
  
  return result
})

// ═══════════════════════════════════════════════════════════════
// PAGINACIÓN / RENDER PROGRESIVO (infinite-scroll incremental)
// ═══════════════════════════════════════════════════════════════
// Mostrar datos estables en UI: si `filteredData` queda vacío momentáneamente
// durante una carga en background, `displayedFiltered` mantiene la última
// versión no vacía para evitar que la tabla se quede en blanco.
const displayedFiltered = ref([])

// Sincronizar displayedFiltered con filteredData (pero mantener la última
// versión no vacía mientras `loading` esté activo).
watch(filteredData, (newVal) => {
  const arr = Array.isArray(newVal) ? newVal : []
  if (arr.length > 0) {
    displayedFiltered.value = arr
  } else {
    if (!props.loading) displayedFiltered.value = arr
  }
}, { immediate: true, flush: 'sync' })

watch(searchTerm, (value) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchTerm.value = String(value || '').trim()
  }, 120)
}, { immediate: true })

const totalPages = computed(() => Math.max(1, Math.ceil(displayedFiltered.value.length / internalPageSize.value)))

// PUNTO MEDIO: Scroll Progresivo (Infinite Scroll Suavizado)
// Evita "renderizar todas las páginas a la vez" (haciendo la vista pesada) y 
// permite "explorar" cómodamente sin la interrupción de un sistema de paginación estricto.
const startIndex = computed(() => 0)

const endIndex = computed(() => currentPage.value * internalPageSize.value)

const renderedData = computed(() => displayedFiltered.value.slice(startIndex.value, endIndex.value))

// Ejecutar animación GSAP cuando cambian los datos renderizados
watch(() => renderedData.value, () => {
  nextTick(() => {
    setTimeout(() => {
      if (typeof animateRowsWithGsap === 'function') {
        animateRowsWithGsap();
      }
    }, 100);
  });
}, { deep: true, immediate: true });
const renderedStatuses = computed(() => renderedData.value.map(item => getEquipmentStatus(item)))
watch(renderedData, (val) => {
  try {
    if (Array.isArray(val) && val.length > 0) {
      refreshItemsSemaforo(val)
    }
  } catch (e) {}
}, { immediate: true })

const scrollContainer = ref(null)
const lastScrollTop = ref(0)
const NEED_MORE_COOLDOWN_MS = 1200
let lastNeedMoreAt = 0

function handleScroll(e) {
  const el = scrollContainer.value || (e && e.target)
  if (!el) return

  // Detect vertical movement only — ignorar scroll horizontal puro que
  // produce eventos pero no debe disparar carga adicional.
  const prevScrollTop = lastScrollTop.value || 0
  const currentScrollTop = el.scrollTop || 0
  const verticalDelta = Math.abs((currentScrollTop || 0) - prevScrollTop)
  lastScrollTop.value = currentScrollTop
  if (verticalDelta < 4) {
    // Probablemente desplazamiento horizontal; no hacemos nada.
    return
  }

  // Solo cargar/pedir más al desplazarse hacia abajo.
  if (currentScrollTop <= prevScrollTop) return

  const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight)
  if (remaining < 800) {
    if (currentPage.value < totalPages.value) {
      // PUNTO MEDIO: Ir cargando progresivamente más filas sin borrar las de arriba
      // (evitando que "se mueva toda la vista" abruptamente o haya jitter).
      currentPage.value++
    } else {
      // Si el backend no ha enviado todos los elementos, pedir más al padre.
      // Usar la cantidad de datos cargados, no el subconjunto filtrado.
      const now = Date.now()
      if (props.serverTotal && props.data.length < props.serverTotal && (now - lastNeedMoreAt) >= NEED_MORE_COOLDOWN_MS) {
        lastNeedMoreAt = now
        emit('need-more')
      }
    }
  }
}

watch(
  [debouncedSearchTerm, quickStatusFilter, sortField, sortOrder, columnFilters],
  () => {
    currentPage.value = 1
    selectedRows.value = []
    const el = scrollContainer.value
    if (el) el.scrollTop = 0
  },
  { deep: true }
)

// ═══════════════════════════════════════════════════════════════
// SELECCIÓN
// ═══════════════════════════════════════════════════════════════
const allSelected = computed(() => {
  if (renderedData.value.length === 0) return false
  return renderedData.value.every((_, idx) => selectedRows.value.includes(idx))
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
    const loc = getLocationValue(item) || getServiceValue(item) || getUnitValue(item) || 'Sin ubicación'
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
    if (getLocationValue(item)) locations.add(getLocationValue(item))
    if (getUnitValue(item)) units.add(getUnitValue(item))
    if (getServiceValue(item)) services.add(getServiceValue(item))
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
  return getFieldStats(field).values
}

function getFilteredUniqueValues(field) {
  const values = getUniqueValues(field)
  const search = (columnFilterSearch.value[field] || '').toLowerCase()
  const filtered = !search ? values : values.filter(v => v.toLowerCase().includes(search))
  return filtered.slice(0, 250)
}

function getValueCount(field, value) {
  return getFieldStats(field).counts.get(String(value ?? '')) || 0
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
  // null/undefined = sin filtro iniciado = todos marcados
  if (filter === null || filter === undefined) return true
  // [] = "Ninguno" fue pulsado = ninguno marcado
  if (filter.length === 0) return false
  return filter.includes(value)
}

function toggleFilterValue(field, value) {
  if (!Array.isArray(columnFilters.value[field])) {
    // Primera interacción: inicializar con todos los valores excepto el pulsado
    columnFilters.value[field] = getUniqueValues(field).filter(v => v !== value)
  } else {
    const current = columnFilters.value[field]
    if (current.includes(value)) {
      // Desmarcar: crear nuevo array sin este valor
      columnFilters.value[field] = current.filter(v => v !== value)
    } else {
      // Marcar: crear nuevo array con este valor agregado
      columnFilters.value[field] = [...current, value]
    }
  }
  currentPage.value = 1
}

// Determina si todos los valores del filtro están seleccionados
function allFilterValuesSelected(field) {
  const filter = columnFilters.value[field]
  if (filter === null || filter === undefined) return true
  if (filter.length === 0) return false
  return filter.length >= getUniqueValues(field).length
}

// Toggle maestro: si todos están seleccionados → deseleccionar todos, y viceversa
function toggleAllFilterValues(field) {
  if (allFilterValuesSelected(field)) {
    clearColumnFilter(field)
  } else {
    selectAllFilterValues(field)
  }
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
    // Ya no hacemos auto-select ni auto-open de la ficha al typear,
    // porque molestaba al usuario cuando aún no terminaba de escribir.
    // El scanner enviará el "Enter" al final de todos modos.
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

    // Determinar qué datos exportar según la configuración
    const dataToExport = displayedFiltered.value.slice(0, effectiveExportLimit.value)
    
    // Agregar columnas de mantenimiento si hay datos de mantenimiento
    const hasMaintenanceData = Object.keys(props.maintenanceMap || {}).length > 0
    const maintenanceHeaders = hasMaintenanceData ? [
      'Estado Mantenimiento',
      'Tipo Mantenimiento',
      'Fecha Inicio Mantenimiento',
      'Descripción Mantenimiento'
    ] : []

    // headers
    const headers = [...visibleColumns.value.map(c => c.header), ...maintenanceHeaders]
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // blue background
    }

    // add data rows
    dataToExport.forEach(item => {
      const inventoryNum = getInventoryValue(item)
      const maintenanceEntry = props.maintenanceMap?.[inventoryNum]
      
      // Build row data with original columns
      const values = visibleColumns.value.map(c => item[c.field] != null ? item[c.field] : '')
      
      // Add maintenance data if available
      if (hasMaintenanceData) {
        values.push(
          maintenanceEntry?.status === 'en_mantenimiento' ? 'En Mantenimiento' : 'Disponible',
          maintenanceEntry?.maintenance?.maintenance_type || 'N/A',
          maintenanceEntry?.maintenance?.created_at || 'N/A',
          maintenanceEntry?.maintenance?.description || 'N/A'
        )
      }
      
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
    const dataToExport = displayedFiltered.value.slice(0, effectiveExportLimit.value)
    const hasMaintenanceData = Object.keys(props.maintenanceMap || {}).length > 0
    const headers = [...visibleColumns.value.map(c => c.header)]
    const maintenanceHeaders = hasMaintenanceData ? [
      'Estado Mantenimiento',
      'Tipo Mantenimiento',
      'Fecha Inicio Mantenimiento',
      'Descripción Mantenimiento'
    ] : []
    headers.push(...maintenanceHeaders)
    
    const rows = dataToExport.map(item => {
      const inventoryNum = getInventoryValue(item)
      const maintenanceEntry = props.maintenanceMap?.[inventoryNum]
      const values = visibleColumns.value.map(c => item[c.field] || '')
      if (hasMaintenanceData) {
        values.push(
          maintenanceEntry?.status === 'en_mantenimiento' ? 'En Mantenimiento' : 'Disponible',
          maintenanceEntry?.maintenance?.maintenance_type || 'N/A',
          maintenanceEntry?.maintenance?.created_at || 'N/A',
          maintenanceEntry?.maintenance?.description || 'N/A'
        )
      }
      return values
    })
    let content = '\ufeff'
    content += headers.join('\t') + '\n'
    rows.forEach(row => {
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
  const dataToExport = displayedFiltered.value.map(item => {
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
  const rows = displayedFiltered.value.map(item => {
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
        Total: ${displayedFiltered.value.length} equipos
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
  const selectedData = selectedRows.value.map(idx => renderedData.value[idx]).filter(Boolean)
  if (selectedData.length === 0) return
  
  const headers = visibleColumns.value.map(c => c.header)
  const rows = selectedData.map(item => 
    visibleColumns.value.map(c => `"${String(item[c.field] || '').replace(/"/g, '""')}"`)
  )
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `equipos_seleccionados_${getDateString()}.csv`)
}

async function exportSelectedToExcel() {
  const selectedData = selectedRows.value.map(idx => renderedData.value[idx]).filter(Boolean)
  if (selectedData.length === 0) return
  
  try {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Equipos Seleccionados')

    // Agregar columnas de mantenimiento si hay datos de mantenimiento
    const hasMaintenanceData = Object.keys(props.maintenanceMap || {}).length > 0
    const maintenanceHeaders = hasMaintenanceData ? [
      'Estado Mantenimiento',
      'Tipo Mantenimiento',
      'Fecha Inicio Mantenimiento',
      'Descripción Mantenimiento'
    ] : []

    // headers
    const headers = [...visibleColumns.value.map(c => c.header), ...maintenanceHeaders]
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // blue background
    }

    // add data rows
    selectedData.forEach(item => {
      const inventoryNum = getInventoryValue(item)
      const maintenanceEntry = props.maintenanceMap?.[inventoryNum]
      
      // Build row data with original columns
      const values = visibleColumns.value.map(c => item[c.field] != null ? item[c.field] : '')
      
      // Add maintenance data if available
      if (hasMaintenanceData) {
        values.push(
          maintenanceEntry?.status === 'en_mantenimiento' ? 'En Mantenimiento' : 'Disponible',
          maintenanceEntry?.maintenance?.maintenance_type || 'N/A',
          maintenanceEntry?.maintenance?.created_at || 'N/A',
          maintenanceEntry?.maintenance?.description || 'N/A'
        )
      }
      
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
    link.setAttribute('download', `equipos_seleccionados_${getDateString()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting selected to Excel:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// ACCIONES EN LOTE (NUEVO)
// ═══════════════════════════════════════════════════════════════
function bulkRequestMaintenance() {
  const selectedData = selectedRows.value.map(idx => renderedData.value[idx]).filter(Boolean)
  if (selectedData.length === 0) return
  emit('bulk-maintenance', selectedData)
}

function printSelectedLabels() {
  const selectedData = selectedRows.value.map(idx => renderedData.value[idx]).filter(Boolean)
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
    if (props.columns.length > 0 || props.showAllColumns) {
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
  const important = new Set([
    'No. DE INVENTARIO',
    'No DE INVENTARIO',
    'N_DE_INVENTARIO',
    'EQUIPO MÉDICO',
    'EQUIPO MEDICO',
    'EQUIPO_MEDICO',
    'MARCA',
    'MODELO',
    'NÚMERO DE SERIE',
    'NUMERO DE SERIE',
    'SERIE',
    'ESTATUS',
    'UNIDAD MÉDICA',
    'UNIDAD MEDICA',
    'UBICACIÓN ESPECÍFICA'
  ])
  return important.has(key)
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
  if (s.includes('disponible') || s.includes('activo') || s.includes('bueno') || s.includes('operativo')) return 'available'
  if (s.includes('regular') || s.includes('condicional') || s.includes('parcial') || s.includes('atención')) return 'partial'
  if (s.includes('malo') || s.includes('critico') || s.includes('crítico') || s.includes('no funcional') || s.includes('pésimo')) return 'critical'
  if (s.includes('manten') || s.includes('reparac') || s.includes('preventivo') || s.includes('correctivo')) return 'maintenance'
  if (s.includes('baja') || s.includes('fuera') || s.includes('inactivo')) return 'unavailable'
  if (s.includes('obsoleto') || s.includes('desecho')) return 'retired'
  return 'unknown'
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
    unknown: 'pi pi-question-circle',
    partial: 'pi pi-exclamation-triangle',
    critical: 'pi pi-exclamation-circle'
  }
  return icons[normalized] || icons.unknown
}

// 🔥 FUNCIÓN PARA SEMAFORIZACIÓN DUAL-COLOR
function getDualColorStyle(item) {
  if (!item) return {}
  
  // Si es CONDICIONAL o "Condiciones Regulares", aplicar gradient
  if (false) {
    return {
      background: 'linear-gradient(90deg, #22c55e 50%, #f59e0b 50%) !important',
      backgroundClip: 'padding-box',
      color: 'white !important',
      fontWeight: '600',
      border: 'none !important'
    }
  }
  return {}
}

function getRowStatusClass(item) {
  // Usar el estado real del semáforo, no el del campo ESTATUS
  const equipmentStatus = getEquipmentStatus(item);
  let badgeType = equipmentStatus.badge; // 'available', 'maintenance', 'unavailable', 'regular', 'unknown'
  
  // ⚠️ HARDCODED FIX: Si el equipo tiene FUNCIONAL="NO", forzar a unavailable
  // ESTO ES UN WORKAROUND TEMPORAL - debería ser arreglado en el backend
  const funcional = String(item['FUNCIONAL SI NO'] || '').toLowerCase().trim();
  if (funcional === 'no') {
    badgeType = 'unavailable';
  }
  
  // Map badge types to row classes
  const rowStatusMap = {
    'available': 'row-available',
    'operational': 'row-available',
    'regular': 'row-maintenance',
    'partial': 'row-maintenance',
    'maintenance': 'row-maintenance',
    'unavailable': 'row-unavailable',
    'unknown': 'row-unavailable',
    'critical': 'row-unavailable'
  };
  
  const rowClass = rowStatusMap[badgeType] || `row-${normalizeStatus(item.ESTATUS)}`;
  
  return { 
    [rowClass]: true,
    [`status-${badgeType}`]: true
  }
}

function getMaintenanceEntryByInv(invNo) {
  const raw = String(invNo || '').trim()
  if (!raw) return null
  const normalized = raw.toUpperCase()
  const compact = normalized.replace(/[^A-Z0-9]/g, '')
  return props.maintenanceMap?.[raw]
    || props.maintenanceMap?.[normalized]
    || props.maintenanceMap?.[compact]
    || null
}

// Obtiene status visual del equipo desde composable (SEMAFOR IZACIÓN)
function getEquipmentStatus(item) {
  const invNo = getInventoryValue(item);
  const maintenanceEntry = getMaintenanceEntryByInv(invNo)

  const iconByBadge = {
    maintenance: 'pi-wrench',
    critical: 'pi-times-circle',
    partial: 'pi-exclamation-triangle',
    warning: 'pi-exclamation-triangle',
    operational: 'pi-check-circle'
  }

  const labelByBadge = {
    maintenance: 'En mantenimiento',
    critical: 'No funcional o requiere atención',
    partial: 'Parcialmente funcional / Condiciones regulares',
    warning: 'Parcialmente funcional / Condiciones regulares',
    operational: 'Funcional'
  }

  const normalizeBadge = (badge, status) => {
    const byBadge = String(badge || '').trim().toLowerCase()
    if (byBadge && byBadge !== 'unknown' && byBadge !== 'loading' && byBadge !== 'error') {
      return byBadge
    }
    const byStatus = mapStatusToBadge(status)
    if (byStatus) return byStatus
    return 'partial'
  }

  const normalizeIcon = (icon, badge) => {
    const raw = String(icon || '').trim()
    if (raw.startsWith('pi-') || raw.startsWith('pi ')) return raw.replace(/^pi\s+/, 'pi-')
    return iconByBadge[badge] || 'pi-exclamation-triangle'
  }

  const mapStatusToBadge = (status) => {
    const raw = String(status || '').trim().toLowerCase()
    if (!raw) return ''
    if (raw.includes('maintenance') || raw.includes('mantenimiento') || raw === 'maintenance_active') return 'maintenance'
    if (raw.includes('non_functional') || raw.includes('critical') || raw.includes('attention')) return 'critical'
    if (raw.includes('partial') || raw.includes('regular') || raw.includes('fair')) return 'partial'
    if (raw.includes('functional_optimal') || raw.includes('operational') || raw.includes('functional')) return 'operational'
    return ''
  }

  // PRIORIDAD 1: mantenimiento activo desde mapa reactivo (actualización instantánea)
  if (
    maintenanceEntry?.status === 'en_mantenimiento' ||
    maintenanceEntry?.maintenance?.status === 'in_progress' ||
    maintenanceEntry?.badge === 'maintenance' ||
    maintenanceEntry?.status === 'MAINTENANCE_ACTIVE'
  ) {
    return {
      status: 'maintenance',
      color: '#8b5cf6',
      badge: 'maintenance',
      icon: 'pi-wrench',
      label: 'En Mantenimiento',
      animate: true,
      priority: 1000
    }
  }

  // PRIORIDAD 2: cualquier estado reactivo calculado en maintenanceMap (finish instantáneo)
  if (maintenanceEntry && (maintenanceEntry.badge || maintenanceEntry.status || maintenanceEntry.color)) {
    const derivedBadge = normalizeBadge(maintenanceEntry.badge, maintenanceEntry.status)
    return {
      status: maintenanceEntry.status || derivedBadge,
      color: maintenanceEntry.color || (derivedBadge === 'critical' ? '#ff2400' : derivedBadge === 'operational' ? '#22c55e' : '#ec4899'),
      badge: derivedBadge,
      icon: normalizeIcon(maintenanceEntry.icon, derivedBadge),
      label: maintenanceEntry.label || labelByBadge[derivedBadge] || 'Parcialmente funcional / Condiciones regulares',
      animate: !!maintenanceEntry.animate,
      priority: maintenanceEntry.priority || 0
    }
  }

  // Prefer semaforización calculada por backend si está presente en el item
  try {
    if (item && item.semaforizacion) {
      const s = item.semaforizacion || {};
      const derivedBadge = normalizeBadge(s.badge, s.status)
      return {
        status: s.status || derivedBadge,
        color: s.color || (derivedBadge === 'critical' ? '#ff2400' : derivedBadge === 'operational' ? '#22c55e' : '#ec4899'),
        badge: derivedBadge,
        icon: normalizeIcon(s.icon, derivedBadge),
        label: s.label || labelByBadge[derivedBadge] || 'Parcialmente funcional / Condiciones regulares',
        animate: !!s.animate,
        priority: s.priority || 0
      }
    }
  } catch (err) {
    // defensivo: si por alguna razón item.semaforizacion falla, seguir con fallback
    console.warn('[getEquipmentStatus] error reading semaforizacion', err)
  }

  // Fallback: consultamos caché del rule engine si está disponible
  try {
    const sync = getColorSync(invNo);
    if (sync && sync.badge) return sync;
  } catch (err) {
    // ignore
  }
  return {
    status: 'partial',
    color: '#ec4899',
    badge: 'partial',
    icon: 'pi-exclamation-triangle',
    label: 'Parcialmente funcional / Condiciones regulares',
    animate: false,
    priority: 0
  };
}

function getCellClass(field, value) {
  const classes = []
  const normalizedField = normalizeKey(field)
  if (normalizedField.includes('inventario')) classes.push('cell-inventory')
  if (normalizedField.includes('equipomedico')) classes.push('cell-equipment')
  if (normalizedField === 'marca') classes.push('cell-brand')
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
  return selectedRows.value.includes(idx)
}

function toggleRowSelect(idx) {
  const pos = selectedRows.value.indexOf(idx)
  if (pos >= 0) {
    selectedRows.value.splice(pos, 1)
  } else {
    selectedRows.value.push(idx)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    renderedData.value.forEach((_, idx) => {
      const pos = selectedRows.value.indexOf(idx)
      if (pos >= 0) selectedRows.value.splice(pos, 1)
    })
  } else {
    renderedData.value.forEach((_, idx) => {
      if (!selectedRows.value.includes(idx)) {
        selectedRows.value.push(idx)
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

      // Asegurar que el catálogo global se recargue con el alta nueva
      try { await invalidateBiomedicalEquipmentCatalog() } catch (e) {}
      
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
  if (!canEditBiomedicalEquipment.value) {
    console.warn('[BiomedicalEquipmentTable] edit blocked: insufficient permissions')
    closeDetailModal()
    closeContextMenu()
    return
  }
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
  if (!canManageBiomedical.value) {
    console.warn('[BiomedicalEquipmentTable] request-maintenance blocked: insufficient permissions')
    closeDetailModal()
    closeContextMenu()
    return
  }
  emit('request-maintenance', item)
  closeDetailModal()
  closeContextMenu()
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR CSV
// ═══════════════════════════════════════════════════════════════
function exportToCSV() {
  const headers = visibleColumns.value.map(c => c.header)
  const rows = displayedFiltered.value.map(item => 
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
  return getInventoryValue(item) || item.id || item.ID || idx
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
  fieldStatsCache.clear()
  currentPage.value = 1
  selectedRows.value = []
  initializeColumnVisibility()
})

watch(() => props.columns, () => {
  fieldStatsCache.clear()
  initializeColumnVisibility()
}, { immediate: true })

watch(displayedFiltered, () => {
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
})

// Actualizar gotoPage cuando cambia currentPage
watch(currentPage, (val) => {
  selectedRows.value = []
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

/* Estilos para opciones de exportación */
.export-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
  margin-bottom: 4px;
}

.export-option-group {
  padding: 4px 8px;
  margin-bottom: 4px;
}

.export-radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-primary);
  border-radius: 4px;
  transition: background 0.15s ease;
}

.export-radio-option:hover {
  background: rgba(59, 130, 246, 0.08);
}

.export-radio-option input[type="radio"] {
  accent-color: var(--accent-blue);
  width: 14px;
  height: 14px;
}

.export-checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-primary);
  border-radius: 4px;
  transition: background 0.15s ease;
}

.export-checkbox-option:hover {
  background: rgba(59, 130, 246, 0.08);
}

.export-checkbox-option input[type="checkbox"] {
  accent-color: var(--accent-blue);
  width: 14px;
  height: 14px;
}

.export-all-info {
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 4px;
  font-size: 0.8rem;
  color: #4ade80;
  margin-top: 8px;
}

.export-limit-select {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 22px;
  margin-top: 4px;
}

.limit-dropdown {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.8rem;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
}

.limit-dropdown:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.export-limit-select span {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.export-limit-input {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 22px;
  margin-top: 4px;
}

.limit-number-input {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--text-primary);
  width: 80px;
  cursor: pointer;
  outline: none;
}

.limit-number-input:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.limit-number-input:focus {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.export-limit-input span {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.highlight-option {
  background: rgba(34, 197, 94, 0.15) !important;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.highlight-option:hover {
  background: rgba(34, 197, 94, 0.25) !important;
}

.highlight-option i {
  color: #22c55e !important;
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
  overflow: hidden;
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
}

/* Sticky: aplicado en th para máxima compatibilidad */
.header-row th {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(18, 32, 60, 0.97);
  backdrop-filter: blur(8px);
}

.table-header {
  padding: 12px 16px;
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
  /* z-index local para que el dropdown de filtros quede encima */
  z-index: 21;
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

/* Separador entre checkbox maestro y la lista */
.filter-options-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 2px 8px;
}

/* Estilos especiales para el checkbox maestro Todos/Vacío */
.filter-toggle-all {
  border-bottom: none;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 4px;
  margin: 2px 4px;
}

.filter-toggle-all:hover {
  background: rgba(59, 130, 246, 0.12) !important;
}

.toggle-all-label {
  font-weight: 700;
  color: #93c5fd;
  font-size: 0.82rem;
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

/* ESTILOS DE SEMÁFORO MINIMALISTAS (GSAP HACE LA ANIMACIÓN) */
.status-semaphore-col {
  position: sticky;
  left: 44px;
  z-index: 14;
  width: 40px;
  min-width: 40px;
  padding: 10px 4px;
  text-align: center;
  background: inherit;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.semaphore-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

/* 🟢 Operativo */
.semaphore-operational, .semaphore-available {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

/* 🟠 Mantenimiento Preventivo / Partial */
.semaphore-in-progress, .semaphore-partial, .semaphore-maintenance, .semaphore-warning, .semaphore-fair-condition, .semaphore-regular {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

/* 🔴 Crítico / No Funcional / Offline */
.semaphore-critical, .semaphore-offline, .semaphore-non-functional, .semaphore-poor-condition, .semaphore-unavailable {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

/* 🔵 Calibración */
.semaphore-calibration {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

/* ⚪ Desconocido */
.semaphore-unknown {
  background: #94a3b8;
  box-shadow: 0 0 8px rgba(148, 163, 184, 0.4);
}

.semaphore-icon {
  display: none;
}

.data-row {
  transition: background 0.15s ease;
}

.data-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.sticky-col-left {
  position: sticky;
  left: 0;
  z-index: 15;
}

/* En la fila de encabezado, las celdas sticky laterales deben
   estar por encima del sticky horizontal (top) */
thead .sticky-col-left,
thead .status-col,
thead .sticky-col-right {
  z-index: 30;
  background: rgba(18, 32, 60, 0.97);
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

/* Row Status Classes — se usa box-shadow inset en la primera celda
   para no alterar el layout de la tabla (evita desfase de encabezados) */
.data-row.row-available td:first-child {
  box-shadow: inset 4px 0 0 var(--status-available);
}

.data-row.row-maintenance td:first-child {
  box-shadow: inset 4px 0 0 var(--status-maintenance);
}
.data-row.row-maintenance {
  background: rgba(245, 158, 11, 0.03);
}

.data-row.row-unavailable td:first-child {
  box-shadow: inset 4px 0 0 var(--status-unavailable);
}

.data-row.row-retired td:first-child {
  box-shadow: inset 4px 0 0 var(--status-retired);
}
.data-row.row-retired {
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

.info-badge.filtered i {
  color: #fbbf24;
}

.info-badge.loading {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
  animation: pulse-info 1.5s ease-in-out infinite;
}

.info-badge.loading i {
  color: #60a5fa;
  animation: spin 2s linear infinite;
}

@keyframes pulse-info {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* ═══════════════════════════════════════════════════════════════
   SEMAFORIZACIÓN INTELIGENTE - NUEVOS ESTADOS
   ═══════════════════════════════════════════════════════════════ */

/* 🔴 ROJO OSCURO - CRÍTICO (No funcional + MC activo o Condiciones Malas) */
.status-critical,
.status-non-functional,
.status-poor-condition {
  background: rgba(220, 38, 38, 0.2);
  color: #fecaca;
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding-left: 12px;
}

.status-critical::before,
.status-non-functional::before,
.status-poor-condition::before {
  background: #dc2626;
}

/* � MORADO - MANTENIMIENTO CORRECTIVO */
.status-warning,
.status-corrective_maintenance,
.status-corrective {
  background: rgba(139, 92, 246, 0.2);
  color: #ddd6fe;
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding-left: 12px;
}

.status-warning::before,
.status-corrective_maintenance::before,
.status-corrective::before {
  background: #8b5cf6;
}

/* 🟪 LILA - MANTENIMIENTO PREVENTIVO */
.status-in-progress,
.status-in_maintenance,
.status-preventive_maintenance,
.status-preventive {
  background: rgba(167, 139, 250, 0.2);
  color: #e9d5ff;
  border: 1px solid rgba(167, 139, 250, 0.3);
  padding-left: 12px;
}

.status-in-progress::before,
.status-in_maintenance::before,
.status-preventive_maintenance::before,
.status-preventive::before {
  background: #a78bfa;
}

/* 🟠 NARANJA - CONDICIONES REGULARES */
.status-regular-condition,
.status-regular {
  background: rgba(251, 146, 60, 0.2);
  color: #fed7aa;
  border: 1px solid rgba(251, 146, 60, 0.3);
  padding-left: 12px;
}

.status-regular-condition::before,
.status-regular::before {
  background: #fb923c;
}

/* ⚪ GRIS - FUERA DE SERVICIO */
.status-offline {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
  padding-left: 12px;
}

.status-offline::before {
  background: #64748b;
}

/* 🟢 VERDE - OPERATIVO */
.status-operational {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding-left: 12px;
}

.status-operational::before {
  background: #22c55e;
}

/* ✨ VERDE BRILLANTE - EXCELENTE (Funcional + Condiciones Buenas) */
.status-excellent {
  background: rgba(16, 185, 129, 0.25);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding-left: 12px;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.status-excellent::before {
  background: #10b981;
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

.data-row.row-available td:first-child {
  box-shadow: inset 4px 0 0 rgba(34, 197, 94, 0.6);
}

.data-row.row-maintenance td:first-child {
  box-shadow: inset 4px 0 0 rgba(230, 81, 0, 0.7);
}

.data-row.row-unavailable td:first-child {
  box-shadow: inset 4px 0 0 rgba(183, 28, 28, 0.7);
}

.data-row.row-retired td:first-child,
.data-row.row-unknown td:first-child {
  box-shadow: inset 4px 0 0 rgba(107, 114, 128, 0.4);
}

/* ═══════════════════════════════════════════════════════════════
   VIRTUAL SCROLLER STYLES
   ═══════════════════════════════════════════════════════════════ */
.virtual-scroller {
  height: 100%;
  overflow-y: auto;
}

.vue-recycle-scroller__item-view,
.vue-dynamic-scroller__item-view {
  display: table-row;
}

.vue-recycle-scroller__item-view > *,
.vue-dynamic-scroller__item-view > * {
  display: table-cell;
}

</style>


