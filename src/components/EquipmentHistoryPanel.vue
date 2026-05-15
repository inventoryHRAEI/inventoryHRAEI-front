<template>
  <Teleport to="body">
    <Transition name="panel-slide">
      <div v-if="visible" class="ehp-root" @click.self="closePanel">
        <div class="ehp-container" :class="{ 'global-maint-active': isInMaintenance }">

          <aside class="ehp-sidebar">
            <div class="sidebar-identity-group">
              <div class="sidebar-header">
                <h1 class="eq-name">{{ normalizedItem.name }}</h1>
                <div class="id-badge">
                  <span class="id-label">ID INVENTARIO</span>
                  <span class="id-value">{{ normalizedItem.inventoryNo }}</span>
                </div>
              </div>

              <div class="sidebar-metadata">
                <div v-if="isInMaintenance" class="sidebar-maint-badge">
                  <ZapIcon :size="14" class="zap-pulse" />
                  <span>INTERVENCIÓN ACTIVA</span>
                </div>
                <div class="meta-box">
                  <span class="m-label">Marca / Modelo</span>
                  <span class="m-value">{{ normalizedItem.brand || '—' }} {{ normalizedItem.model || '' }}</span>
                </div>
                <div class="meta-box">
                  <span class="m-label">Serie No.</span>
                  <span class="m-value font-mono">{{ normalizedItem.serialNo || '—' }}</span>
                </div>
              </div>
            </div>

            <div class="sidebar-vitals">
              <div class="vital-card" :class="statusColorClass">
                <div class="vital-icon">
                  <ActivityIcon :size="16" aria-hidden="true" />
                </div>
                <div class="vital-data">
                  <span class="v-label">Estado operativo</span>
                  <span class="v-value">{{ normalizedItem.condition }}</span>
                </div>
              </div>
              <div class="vital-card location">
                <div class="vital-icon location">
                  <MapPinIcon :size="16" aria-hidden="true" />
                </div>
                <div class="vital-data">
                  <span class="v-label">Ubicación actual</span>
                  <span class="v-value">{{ normalizedItem.area || 'No asignada' }}</span>
                </div>
              </div>
            </div>

            <nav class="sidebar-nav" role="navigation" aria-label="Secciones del panel">
              <button
                v-for="item in navItems"
                :key="item.key"
                :class="{ active: activeSection === item.key }"
                @click="activeSection = item.key"
                :aria-current="activeSection === item.key ? 'page' : undefined"
              >
                <component :is="item.icon" :size="18" aria-hidden="true" />
                <span>{{ item.label }}</span>
              </button>
            </nav>

            <div class="sidebar-actions">
              <button
                @click="openMaintenanceWizard"
                class="btn-primary"
                :class="{ 'btn-maint-pulse': isInMaintenance }"
                :disabled="!canManageBiomedical"
              >
                <component :is="isInMaintenance ? 'FileCheckIcon' : 'ZapIcon'" :size="16" aria-hidden="true" />
                <span>{{ isInMaintenance ? 'Finalizar mantenimiento' : 'Gestionar mantenimiento' }}</span>
              </button>
              <div class="tool-group">
                <button @click="downloadPdf" class="btn-tool" title="Exportar reporte">
                  <DownloadIcon :size="16" aria-hidden="true" />
                </button>
                <button @click="previewPdf" class="btn-tool" title="Vista previa PDF">
                  <EyeIcon :size="16" aria-hidden="true" />
                </button>
              </div>
              <button class="btn-close-panel" @click="closePanel">
                <LogOutIcon :size="15" aria-hidden="true" />
                <span>Salir del panel</span>
              </button>
            </div>

          </aside>

          <main class="ehp-main">

            <header class="main-header">
              <nav class="breadcrumb" aria-label="Ruta de navegación">
                <span class="bc-item"><HomeIcon :size="13" aria-hidden="true" /><span>Inicio</span></span>
                <ChevronRightIcon :size="13" class="bc-sep" aria-hidden="true" />
                <span class="bc-item">Inventario</span>
                <ChevronRightIcon :size="13" class="bc-sep" aria-hidden="true" />
                <span class="bc-item bc-active">{{ activeSectionName }}</span>
              </nav>

              <div class="header-actions">
                <template v-if="isEditMode">
                  <button @click="toggleEditMode" class="btn-ghost">Descartar</button>
                  <button @click="saveChanges" class="btn-save" :disabled="isSaving">
                    {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                </template>
                <button
                  v-else-if="canEditBiomedicalEquipment"
                  @click="toggleEditMode"
                  class="btn-edit"
                >
                  <Edit3Icon :size="14" aria-hidden="true" />
                  <span>Modificar registro</span>
                </button>
              </div>
            </header>

            <div class="main-content">

              <section v-if="activeSection === 'dashboard'" class="section-dashboard-elite">
                <div class="elite-grid">
                  <!-- Bloque 1: Centro de Control de Salud (2x2) -->
                  <div class="elite-card health-center" :class="statusColorClass">
                    <div class="ec-header">
                      <ZapIcon v-if="isInMaintenance" :size="16" class="text-maint" />
                      <ShieldCheckIcon v-else-if="reactionLevel === 'Óptimo'" :size="16" class="text-success" />
                      <AlertCircleIcon v-else-if="reactionLevel === 'Preventivo'" :size="16" class="text-warning" />
                      <ThermometerIcon v-else :size="16" class="text-danger" />
                      <span class="ec-tag">{{ isInMaintenance ? 'Intervención Activa' : 'Estado Operativo' }}</span>
                    </div>
                    <div class="health-display">
                      <div class="health-gauge-elite">
                        <svg viewBox="0 0 100 100">
                          <circle class="e-track" cx="50" cy="50" r="44" />
                          <circle class="e-fill" cx="50" cy="50" r="44" :style="{ strokeDashoffset: gaugeOffset }" />
                        </svg>
                        <div class="e-content">
                          <span class="e-num">{{ gaugePercentage }}%</span>
                        </div>
                      </div>
                      <div class="health-info">
                        <h2 class="health-title-elite">{{ healthTitle }}</h2>
                        <div class="health-emoji-wrap">
                          <Transition name="emoji-pop" mode="out-in">
                            <lottie-player
                              :key="activeEmojiUrl"
                              :src="activeEmojiUrl"
                              background="transparent"
                              speed="1"
                              class="lottie-elite"
                              loop
                              autoplay
                            ></lottie-player>
                          </Transition>
                        </div>
                      </div>
                    </div>
                    <p class="health-desc-elite">{{ healthMessage }}</p>
                  </div>

                  <!-- Bloque 2: Distribución Técnica (1x1) -->
                  <div class="elite-card stats-mini">
                    <span class="ec-tag">Distribución</span>
                    <div class="mini-stats-grid">
                      <div class="m-stat">
                        <div class="m-label">MP</div>
                        <div class="m-bar"><div class="m-fill success" :style="{ width: maintPercentage + '%' }"></div></div>
                        <div class="m-val">{{ countMP }}</div>
                      </div>
                      <div class="m-stat">
                        <div class="m-label">MC</div>
                        <div class="m-bar"><div class="m-fill danger" :style="{ width: (100 - maintPercentage) + '%' }"></div></div>
                        <div class="m-val">{{ countMC }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Bloque 3: Métrica Total (1x1) -->
                  <div class="elite-card count-mini">
                    <span class="ec-tag">Total Eventos</span>
                    <div class="big-count">{{ history.length }}</div>
                    <div class="count-label">Servicios registrados</div>
                  </div>

                  <!-- Bloque 4: Registro Clínico (1x1) -->
                  <div class="elite-card meta-mini">
                    <span class="ec-tag">Última Inspección</span>
                    <div class="meta-val">{{ formatDateShort(maintenanceFlow.last_completed?.finished_at) || '---' }}</div>
                    <div class="meta-label">Finalizada con éxito</div>
                  </div>

                  <!-- Bloque 5: Responsable (1x1) -->
                  <div class="elite-card meta-mini">
                    <span class="ec-tag">Responsable</span>
                    <div class="meta-val text-truncate">{{ maintenanceFlow.last_completed?.finished_by || 'Hospital' }}</div>
                    <div class="meta-label">Área de ingeniería</div>
                  </div>

                  <!-- Bloque 6: Accesos Directos Rápidos (2x1) -->
                  <div class="elite-card quick-actions-card">
                    <div class="ec-header">
                      <ZapIcon :size="14" />
                      <span class="ec-tag">Accesos Directos Rápidos</span>
                    </div>
                    <div class="qa-grid">
                      <button @click="openMaintenanceWizard" class="qa-btn warning">
                        <AlertCircleIcon :size="16" />
                        <span>Reportar Falla</span>
                      </button>
                      <button @click="openMaintenanceWizard" class="qa-btn" :class="isInMaintenance ? 'primary-glow' : 'success'">
                        <component :is="isInMaintenance ? 'FileCheckIcon' : 'WrenchIcon'" :size="16" />
                        <span>{{ isInMaintenance ? 'Finalizar Mantenimiento' : 'Solicitar Preventivo' }}</span>
                      </button>
                      <button @click="downloadTechnicalSheet" class="qa-btn clinical">
                        <FileTextIcon :size="16" />
                        <span>Ficha Técnica</span>
                      </button>
                    </div>
                  </div>

                  <!-- Bloque 7: Línea de Tiempo (Vertical) -->
                  <div class="elite-card timeline-card">
                    <div class="ec-header">
                      <ClockIcon :size="14" />
                      <span class="ec-tag">Eventos Recientes</span>
                    </div>
                    <div v-if="history.length > 0" class="elite-feed">
                      <div v-for="h in history.slice(0, 3)" :key="h.id || h.fecha" class="ef-item">
                        <div class="ef-icon" :class="(h.maintenance_type || h.tipoMantenimiento) === 'MP' ? 'mp' : 'mc'">
                          <ShieldCheckIcon v-if="(h.maintenance_type || h.tipoMantenimiento) === 'MP'" :size="12" />
                          <WrenchIcon v-else :size="12" />
                        </div>
                        <div class="ef-info">
                          <span class="ef-title">{{ (h.maintenance_type || h.tipoMantenimiento) === 'MP' ? 'Preventivo' : 'Correctivo' }}</span>
                          <span class="ef-date">{{ formatDateShort(h.started_at || h.fecha || h.ultimoMP) }}</span>
                        </div>
                        <ChevronRightIcon :size="14" class="ef-chev" />
                      </div>
                    </div>
                    <div v-else class="elite-empty">
                      <span>Sin registros</span>
                    </div>
                  </div>
                </div>

                <Transition name="slide-up">
                  <div v-if="isInMaintenance" class="maintenance-intervention-banner" role="alert">
                    <div class="mib-content">
                      <div class="mib-icon-pulse">
                        <ZapIcon :size="20" />
                      </div>
                      <div class="mib-text">
                        <div class="mib-title">Intervención en curso</div>
                        <div class="mib-desc">
                          El equipo está siendo atendido por <strong>{{ maintenanceProvider }}</strong> desde el {{ maintenanceStartDate }}
                        </div>
                      </div>
                    </div>
                    <button @click="openMaintenanceWizard" class="mib-action-btn">
                      <span>Gestionar</span>
                      <ChevronRightIcon :size="14" />
                    </button>
                  </div>
                </Transition>
              </section>

              <section v-if="activeSection === 'specs'" class="section-specs-elite">
                <div class="specs-toolbar">
                  <div class="elite-search">
                    <SearchIcon :size="16" />
                    <input v-model="specSearch" placeholder="Filtrar atributos técnicos..." />
                  </div>
                  <button @click="downloadTechnicalSheet" class="btn-tool-elite">
                    <DownloadIcon :size="14" />
                    <span>Exportar Ficha</span>
                  </button>
                </div>

                <div class="specs-clinical-grid">
                  <div v-for="(fields, category) in filteredGroupedInfo" :key="category" class="spec-category-card">
                    <header class="scc-header">
                      <span class="scc-bar" :style="{ background: getCategoryColor(category) }"></span>
                      <h3 class="scc-title">{{ category }}</h3>
                    </header>
                    <div class="scc-body">
                      <div v-for="field in fields" :key="field.label" class="scc-row">
                        <span class="scc-label">{{ field.label }}</span>
                        <div class="scc-value-wrap">
                          <span v-if="!isEditMode" class="scc-value" :class="{ 'is-fallback': field.value.includes('No registrado') || field.value.includes('Dato no') }">
                            {{ field.value }}
                          </span>
                          <input v-else v-model="editedItem[field.label]" class="scc-input" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 5. Seguimiento Técnico (Mantenimientos) -->
                  <div class="spec-category-card tracking-category-card">
                    <header class="scc-header">
                      <span class="scc-bar" style="background: #2563eb"></span>
                      <h3 class="scc-title">5. Seguimiento Técnico (Historial)</h3>
                    </header>
                    <div v-if="Object.keys(monthlyChronologicalHistory).length > 0" class="tracking-mini-list">
                      <div v-for="(events, month) in monthlyChronologicalHistory" :key="month" class="month-tracking-item">
                        <div class="mti-header">{{ month }}</div>
                        <div v-for="ev in events" :key="ev.id" class="mti-event">
                          <div class="mti-badge" :class="ev.maintenance_type === 'MP' ? 'mp' : 'mc'">
                            {{ ev.maintenance_type }}
                          </div>
                          <div class="mti-info">
                            <span class="mti-folio">#{{ ev.folio }}</span>
                            <span class="mti-date">{{ formatDateShort(ev.started_at) }}</span>
                          </div>
                          <div class="mti-hours">{{ calculateDuration(ev) }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="elite-empty">Sin mantenimientos registrados</div>
                  </div>

                  <!-- 6. Etiquetas y Códigos de Barras -->
                  <div class="spec-category-card barcode-labels-card">
                    <header class="scc-header">
                      <span class="scc-bar" style="background: #000"></span>
                      <h3 class="scc-title">6. Etiquetas y Códigos de Barras</h3>
                    </header>
                    <div class="barcode-labels-grid">
                      <div class="label-box">
                        <div class="label-header">HRAEI - ACTIVO BIOMÉDICO</div>
                        <svg class="elite-barcode-canvas"></svg>
                        <div class="label-footer">CORTE AQUÍ</div>
                      </div>
                      <div class="label-box">
                        <div class="label-header">HRAEI - ACTIVO BIOMÉDICO</div>
                        <svg class="elite-barcode-canvas"></svg>
                        <div class="label-footer">CORTE AQUÍ</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="Object.keys(filteredGroupedInfo).length === 0" class="empty-elite">
                  <SearchXIcon :size="32" />
                  <p>Sin coincidencia en la ficha técnica</p>
                </div>
              </section>

              <section v-if="activeSection === 'history'" class="section-history-elite">
                <div class="history-controls-elite">
                  <span class="history-count-elite"><strong>5. Seguimiento Técnico:</strong> {{ history.length }} registros documentados</span>
                </div>
                
                <div v-if="Object.keys(monthlyChronologicalHistory).length > 0" class="monthly-tracking-rail">
                  <div v-for="(events, month) in monthlyChronologicalHistory" :key="month" class="month-block">
                    <div class="month-header-elite">{{ month }}</div>
                    <div class="clinical-timeline-full">
                      <div v-for="(event, idx) in events" :key="idx" class="ctf-node">
                        <div class="ctf-aside">
                          <span class="ctf-date">{{ formatDateShort(event.started_at) }}</span>
                          <span class="ctf-time">{{ formatTime(event.started_at) }}</span>
                        </div>
                        <div class="ctf-rail">
                          <div class="ctf-dot" :class="{
                            'mp': event.maintenance_type === 'MP',
                            'mc': event.maintenance_type === 'MC',
                            'pending': event.maintenance_type === 'MC-PENDIENTE'
                          }"></div>
                          <div class="ctf-line"></div>
                        </div>
                        <div class="ctf-card" :class="{
                            'type-mp': event.maintenance_type === 'MP',
                            'type-mc': event.maintenance_type === 'MC',
                            'type-pending': event.maintenance_type === 'MC-PENDIENTE'
                          }">
                          <div class="ctf-header">
                            <span class="ctf-badge" :class="{
                              'mp': event.maintenance_type === 'MP',
                              'mc': event.maintenance_type === 'MC',
                              'pending': event.maintenance_type === 'MC-PENDIENTE'
                            }">
                              {{ event.maintenance_type === 'MP' ? 'Preventivo' : (event.maintenance_type === 'MC-PENDIENTE' ? 'Correctivo Pendiente' : 'Correctivo') }}
                            </span>
                            <span class="ctf-folio">Folio: #{{ event.folio || 'N/A' }}</span>
                          </div>
                          <div class="ctf-body">
                            <div v-if="event.diagnostico" class="ctf-section">
                              <span class="ctf-section-label">Diagnóstico/Hallazgos:</span>
                              <p class="ctf-desc">{{ event.diagnostico }}</p>
                            </div>
                            <div v-if="event.causa" class="ctf-section">
                              <span class="ctf-section-label">Causa Raíz:</span>
                              <p class="ctf-desc">{{ event.causa }}</p>
                            </div>
                            <div v-if="event.observaciones" class="ctf-section">
                              <span class="ctf-section-label">Observaciones Técnicas:</span>
                              <p class="ctf-desc">{{ event.observaciones }}</p>
                            </div>

                            <div class="ctf-tech-tags">
                              <span v-if="event.routine_preventive" class="tech-tag">Manto. Rutinario</span>
                              <span v-if="event.simulator_tests" class="tech-tag">Pruebas Simulador</span>
                              <span v-if="event.analyzer_tests" class="tech-tag">Pruebas Analizador</span>
                            </div>

                            <!-- Metadata Grid: Execution Details -->
                            <div class="ctf-meta-compact-grid">
                              <div class="ctf-meta-item main-item">
                                <VueIcon name="fa-user-check" :size="12" />
                                <span><strong>Responsables:</strong> Inició: {{ event.started_by || 'Sistema' }} | Técnico: {{ event.maintenance_responsible || 'Sin especificar' }} | Cerró: {{ event.finished_by || '—' }}</span>
                              </div>
                              
                              <div class="ctf-meta-item">
                                <VueIcon :name="event.provider_type === 'external' ? 'fa-industry' : 'fa-building'" :size="12" />
                                <span><strong>Proveedor:</strong> {{ event.provider_type === 'external' ? 'Externo' : 'Interno' }} ({{ event.provider_company || event.internal_department || 'No especificado' }})</span>
                              </div>

                              <div class="ctf-meta-item">
                                <VueIcon :name="event.has_warranty ? 'bi-patch-check-fill' : 'bi-patch-exclamation'" :size="12" />
                                <span><strong>Garantía:</strong> {{ event.has_warranty ? 'Vigente' : 'Sin Garantía' }}{{ event.warranty_end_date ? ` (${event.warranty_end_date})` : '' }}</span>
                              </div>

                              <div class="ctf-meta-item">
                                <VueIcon name="fa-file-contract" :size="12" />
                                <span><strong>Contrato:</strong> {{ event.maintenance_contract === true ? 'MP Preventivo' : (event.maintenance_contract === false ? 'MC Correctivo' : 'Sin Contrato') }}</span>
                              </div>

                              <div class="ctf-meta-item">
                                <ClockIcon :size="12" />
                                <span><strong>Tiempo de Labor:</strong> {{ event.maintenance_hours || '0' }} h | Total: {{ calculateDuration(event) }}</span>
                              </div>
                            </div>

                            <!-- Metadata Grid: Closure & Location -->
                            <div class="ctf-meta-compact-grid secondary" style="margin-top: 8px;">
                              <div class="ctf-meta-item">
                                <MapPinIcon :size="12" />
                                <span><strong>Logística:</strong> Retorno: {{ event.returnLocation || 'Sin especificar' }} | Área Final: {{ event.finalArea || 'Igual a retorno' }}</span>
                              </div>
                              
                              <div class="ctf-meta-item checks-inline">
                                <VueIcon name="fa-tasks" :size="12" />
                                <strong>Verificaciones:</strong>
                                <span :class="{ active: event.routine_preventive }">Rutinario</span> |
                                <span :class="{ active: event.simulator_tests }">Simulador</span> |
                                <span :class="{ active: event.analyzer_tests }">Analizador</span>
                              </div>
                            </div>
                            
                            <div v-if="event.observaciones_iniciales" class="ctf-notes-mini">
                              <strong>Reporte Inicial:</strong> {{ event.observaciones_iniciales }}
                            </div>
                            
                            <div v-if="event.causa" class="ctf-notes-mini warning">
                              <strong>Causa de Falla:</strong> {{ event.causa }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="empty-elite">
                  <ClipboardListIcon :size="32" />
                  <p>Sin historial de mantenimientos registrados</p>
                </div>
              </section>

              <section v-if="activeSection === 'gallery'" class="section-gallery-elite">
                <div class="gallery-header-elite">
                  <p class="gallery-info-elite">Evidencia fotográfica del activo biomédico</p>
                  <label v-if="isEditMode" class="btn-primary-small" for="gal-up-elite">
                    <PlusIcon :size="14" />
                    <span>Anexar evidencia</span>
                    <input type="file" id="gal-up-elite" @change="handleImageUpload" multiple class="sr-only" />
                  </label>
                </div>
                <div v-if="equipmentImages.length > 0" class="gallery-elite-grid">
                  <div v-for="(img, idx) in equipmentImages" :key="idx" class="ge-item">
                    <img :src="getImageSrc(img)" alt="Evidencia" />
                    <div class="ge-overlay">
                      <button @click="previewImage(img)" class="ge-btn"><MaximizeIcon :size="16" /></button>
                      <button v-if="isEditMode" @click="removeExistingImage(idx)" class="ge-btn danger"><XIcon :size="16" /></button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-elite">
                  <CameraIcon :size="32" />
                  <p>Sin registros multimedia</p>
                </div>
              </section>

              <section v-if="activeSection === 'docs'" class="section-docs-elite">
                <div class="docs-clinical-list">
                  <div class="doc-elite-item" @click="downloadTechnicalSheet">
                    <div class="dei-icon pdf"><FileTextIcon :size="18" /></div>
                    <div class="dei-info">
                      <span class="dei-title">Ficha Técnica Oficial</span>
                      <span class="dei-desc">Documento generado por el sistema HRAEI</span>
                    </div>
                    <DownloadIcon :size="16" class="dei-action" />
                  </div>
                  <!-- Placeholder para futuros documentos -->
                  <div class="doc-elite-item disabled">
                    <div class="dei-icon manual"><ShieldIcon :size="18" /></div>
                    <div class="dei-info">
                      <span class="dei-title">Manual de Usuario</span>
                      <span class="dei-desc">Archivo del fabricante (No disponible)</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </Transition>

    <MaintenanceWizardV2
      v-model:visible="wizardVisible"
      :inventoryNo="normalizedItem.inventoryNo"
      :equipmentName="normalizedItem.name"
      :currentStatus="maintenanceFlow.in_progress ? { ...maintenanceFlow.in_progress, state: 'in_progress' } : null"
      @close="wizardVisible = false"
      @saved="onMaintenanceSaved"
    />

    <Transition name="fade">
      <div v-if="pdfPreviewVisible" class="pdf-overlay" @click.self="closePdfPreview">
        <div class="pdf-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-modal-title">
          <header class="pdf-modal-header">
            <h3 id="pdf-modal-title">Ficha Técnica del Equipo</h3>
            <button @click="closePdfPreview" class="pdf-close-btn" aria-label="Cerrar vista previa">
              <XIcon :size="18" aria-hidden="true" />
            </button>
          </header>
          <div class="pdf-body">
            <div v-if="!pdfDataUrl" class="pdf-loading-zone">
              <div class="pdf-progress-card">
                <div class="clinical-loading-icon">
                  <FileTextIcon :size="64" class="base-icon" />
                  <div class="scan-bar"></div>
                </div>
                <h4 class="loading-title">Generando Expediente Clínico</h4>
                <p class="loading-desc">Compilando historial, imágenes y normativas técnicas...</p>
                <div class="pdf-progress-track">
                  <div class="pdf-progress-fill" :style="{ width: pdfProgress + '%' }"></div>
                </div>
                <span class="pdf-progress-num">{{ Math.round(pdfProgress) }}%</span>
              </div>
            </div>
            <BlobPdfViewer v-if="pdfDataUrl" :src="pdfDataUrl" :blob="pdfBlob" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import JsBarcode from 'jsbarcode';
import { ref, watch, computed, nextTick, onBeforeUnmount, onMounted } from 'vue';
import '@lottiefiles/lottie-player';
import { normalizeEquipment } from '@/utils/equipmentNormalizer.js';
import { getEquipmentHistory } from '@/services/historialService.js';
import { generateEquipmentPDF } from '@/services/pdfService.js';
import { updateItem, getItemDetails } from '@/services/updateItemService.js';
import { getMaintenanceFlowStatus } from '@/services/equipmentStatusService.js';
import { usePermissions } from '@/composables/usePermissions.js';
import MaintenanceWizardV2 from './MaintenanceWizardV2.vue';
import BlobPdfViewer from './BlobPdfViewer.vue';
import Swal from 'sweetalert2';
import gsap from 'gsap';

import {
  LayoutDashboardIcon, FileTextIcon, HistoryIcon, ImageIcon,
  DownloadIcon, EyeIcon, LogOutIcon, Edit3Icon,
  ActivityIcon, MapPinIcon, HomeIcon, ChevronRightIcon,
  AlertCircleIcon, SearchIcon, SearchXIcon, UserIcon, ClockIcon,
  CameraIcon, MaximizeIcon, PlusIcon, XIcon, FileCheckIcon,
  ZapIcon, ShieldCheckIcon, ThermometerIcon, ClipboardListIcon,
  ShieldIcon, WrenchIcon
} from 'lucide-vue-next';

const props = defineProps({ visible: Boolean, item: Object });
const emit = defineEmits(['close']);
const { canEditBiomedicalEquipment, canManageBiomedical } = usePermissions();

const activeSection = ref('dashboard');
const isEditMode = ref(false);
const isSaving = ref(false);
const wizardVisible = ref(false);
const pdfPreviewVisible = ref(false);
const pdfDataUrl = ref(null);
const pdfBlob = ref(null);
const pdfProgress = ref(0);
let progressInterval = null;
const specSearch = ref('');
const history = ref([]);
const equipmentImages = ref([]);
const editedItem = ref({});
const maintenanceFlow = ref({ in_progress: null, last_completed: null, history: [] });

const LOTTIE_PATHS = {
  EXCELLENT:   ['/lottie/excellent.json', '/lottie/excellent_sunglasses.json', '/lottie/excellent_stars.json'],
  REGULAR:     ['/lottie/regular.json', '/lottie/regular_thinking.json'],
  CRITICAL:    ['/lottie/critical.json', '/lottie/critical_bandage.json', '/lottie/critical_frown.json'],
  MAINTENANCE: ['/lottie/critical_bandage.json'],
  EMPTY:       ['/lottie/empty.json']
};

const navItems = [
  { key: 'dashboard', label: 'Centro de control', icon: LayoutDashboardIcon },
  { key: 'specs',     label: 'Ficha técnica',     icon: FileTextIcon },
  { key: 'history',   label: 'Historial clínico', icon: HistoryIcon },
  { key: 'gallery',   label: 'Evidencia visual',  icon: ImageIcon },
  { key: 'docs',      label: 'Documentación',     icon: ShieldIcon },
];

const normalizedItem = computed(() => normalizeEquipment(props.item)?._normalized || {});

const activeEmojiUrl = ref('');
const emojiIndex = ref(0);
let emojiTimer = null;

const isInMaintenance = computed(() => !!maintenanceFlow.value.in_progress);

const maintenanceProvider = computed(() => {
  const by = maintenanceFlow.value.in_progress?.started_by;
  if (!by || by.toLowerCase() === 'internal') return 'Personal de Biomédica HRAEI';
  return by;
});

const maintenanceStartDate = computed(() => {
  return formatDateShort(maintenanceFlow.value.in_progress?.started_at) || 'fecha reciente';
});

const availableEmojis = computed(() => {
  if (isInMaintenance.value) return LOTTIE_PATHS.MAINTENANCE;
  
  const c = (normalizedItem.value.condition || '').toLowerCase();
  const hasHistory = history.value.length > 0;
  const isGood = c.includes('buen') || c.includes('excelente');
  
  if (isGood && hasHistory) return LOTTIE_PATHS.EXCELLENT;
  // Caso "Angustiado": Está bueno pero no sabemos nada de él (Sin historial)
  if (isGood && !hasHistory) return ['/lottie/regular_thinking.json'];
  if (c.includes('regular')) return LOTTIE_PATHS.REGULAR;
  
  // Estado malo: Crítico/Triste
  return LOTTIE_PATHS.CRITICAL;
});

function cycleEmoji() {
  const emojis = availableEmojis.value;
  if (!emojis || emojis.length <= 1) return;
  
  emojiIndex.value = (emojiIndex.value + 1) % emojis.length;
  activeEmojiUrl.value = emojis[emojiIndex.value];
  console.log('[EHP] Emoji cycled to:', activeEmojiUrl.value);
}

function cycleEmojiManual() {
  // Manual cycling removed for more professional appearance
}

function startEmojiTimer() {
  stopEmojiTimer();
  console.log('[EHP] Starting emoji cycle timer (5s)');
  emojiTimer = setInterval(cycleEmoji, 5000);
}

function stopEmojiTimer() {
  if (emojiTimer) clearInterval(emojiTimer);
}

watch(() => normalizedItem.value.condition, () => {
  emojiIndex.value = 0;
  activeEmojiUrl.value = availableEmojis.value[0];
  startEmojiTimer();
}, { immediate: true });

const statusColorClass = computed(() => {
  if (isInMaintenance.value) return 'st-maint';
  const c = (normalizedItem.value.condition || '').toLowerCase();
  if (c.includes('buen') || c.includes('excelente')) return 'st-ok';
  if (c.includes('regular')) return 'st-warn';
  return 'st-crit';
});

const healthTitle = computed(() => {
  if (isInMaintenance.value) return 'Mantenimiento en Curso';
  const c = (normalizedItem.value.condition || '').toLowerCase();
  const hasHistory = history.value.length > 0;
  if ((c.includes('buen') || c.includes('excelente')) && hasHistory) return 'Estado Operativo Nominal';
  if ((c.includes('buen') || c.includes('excelente')) && !hasHistory) return 'Seguimiento de Registro Requerido';
  if (c.includes('regular')) return 'Seguimiento Técnico Sugerido';
  return 'Revisión Técnica Requerida';
});

const healthMessage = computed(() => {
  if (isInMaintenance.value) {
    return `Atención: El activo está bajo revisión por ${maintenanceProvider.value}. Favor de no utilizar hasta que el personal técnico libere el equipo.`;
  }
  const c = (normalizedItem.value.condition || '').toLowerCase();
  const hasHistory = history.value.length > 0;
  if ((c.includes('buen') || c.includes('excelente')) && hasHistory) return 'El equipo cumple con los estándares de funcionamiento y cuenta con trazabilidad documental.';
  if ((c.includes('buen') || c.includes('excelente')) && !hasHistory) return 'Aunque el estado es bueno, no se detectan registros de mantenimiento previos. Se recomienda iniciar historial.';
  if (c.includes('regular')) return 'Se han identificado desviaciones menores. Se recomienda programar una inspección preventiva.';
  return 'Se requiere diagnóstico especializado. Evitar el uso clínico hasta completar el mantenimiento correctivo.';
});

// 3 Niveles exactos para emparejar con los Lotties
const reactionLevel = computed(() => {
  const c = (normalizedItem.value.condition || '').toLowerCase();
  const hasHistory = history.value.length > 0;
  
  if ((c.includes('buen') || c.includes('excelente')) && hasHistory) return 'Óptimo';
  if ((c.includes('buen') || c.includes('excelente')) && !hasHistory) return 'Preventivo';
  if (c.includes('regular')) return 'Preventivo';
  return 'Crítico';
});

const gaugePercentage = computed(() => {
  if (isInMaintenance.value) return 50;
  if (reactionLevel.value === 'Óptimo') return 100;
  if (reactionLevel.value === 'Preventivo') return 60;
  return 20;
});

const gaugeOffset = computed(() => {
  // 264 es el stroke-dasharray total del circulo
  return 264 - (264 * (gaugePercentage.value / 100));
});

const activeSectionName = computed(() => ({
  dashboard: 'Centro de control',
  specs: 'Ficha Técnica Clínica',
  history: 'Seguimiento Técnico',
  gallery: 'Evidencia Visual',
  docs: 'Expediente Documental',
}[activeSection.value]));

const countMP = computed(() => history.value.filter(h => h.maintenance_type === 'MP').length);
const countMC = computed(() => history.value.filter(h => h.maintenance_type !== 'MP').length);
const maintPercentage = computed(() =>
  history.value.length === 0 ? 0 : Math.min((history.value.length / 8) * 100, 100)
);
const filteredSpecsCount = computed(() => {
  let n = 0;
  Object.values(filteredGroupedInfo.value).forEach(l => n += l.length);
  return n;
});

watch(() => props.visible, (val) => {
  if (val && props.item) { 
    loadData(); 
    animateEntrance(); 
    startEmojiTimer();
    if (activeSection.value === 'specs') nextTick(renderBarcodes);
  } else {
    stopEmojiTimer();
  }
});

watch(activeSection, (val) => {
  if (val === 'specs') nextTick(renderBarcodes);
});

onMounted(() => {
  if (props.visible) startEmojiTimer();
});

onBeforeUnmount(() => {
  stopEmojiTimer();
});

function animateEntrance() {
  nextTick(() => {
    gsap.from('.ehp-sidebar > *', { x: -30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
    gsap.from('.bento-card',      { y: 20,  opacity: 0, duration: 0.7, stagger: 0.1,  ease: 'expo.out', delay: 0.2 });
    gsap.from('.main-header',     { y: -15, opacity: 0, duration: 0.6, ease: 'power3.out' });
  });
}

async function loadData() {
  const inv = normalizedItem.value.inventoryNo;
  if (!inv) return;
  try {
    const [hRes, sRes, details] = await Promise.all([
      getEquipmentHistory(inv),
      getMaintenanceFlowStatus(inv),
      getItemDetails(inv),
    ]);
    console.log('[EHP] hRes content:', JSON.stringify(hRes));
    history.value        = hRes.history?.mantenimientos || hRes.history || hRes.data || [];
    maintenanceFlow.value = sRes;
    equipmentImages.value = details?.imagenes || details?.images || [];
    // También podemos guardar movimientos si queremos usarlos en otra sección
    if (hRes.history?.movimientos) {
      // Si tienes un ref para movimientos, asígnalo aquí
    }
  } catch (e) { console.error('[EHP] loadData error:', e); }
}

const groupedEquipmentInfo = computed(() => {
  if (!props.item || !normalizedItem.value) return {};
  
  // 1. Identificación del Equipo
  const idFields = [
    { label: 'Nombre', value: normalizedItem.value.name || 'Sin nombre registrado' },
    { label: 'Marca', value: normalizedItem.value.brand || 'Genérica' },
    { label: 'Modelo', value: normalizedItem.value.model || 'N/A' },
    { label: 'Número de Serie', value: normalizedItem.value.serialNo || 'Sin número de serie' },
    { label: 'Número de Inventario', value: normalizedItem.value.inventoryNo || 'No asignado' },
  ];

  // 2. Ubicaciones
  const locationFields = [
    { label: 'Ubicación de entrega', value: props.item['UBICACION DE ENTREGA'] || props.item['LUGAR_ENTREGA'] || 'HRAEI' },
    { label: 'Área o Especialidad', value: normalizedItem.value.area || 'Biomédica' },
    { label: 'Ubicación específica', value: props.item['UBICACION ESPECIFICA'] || 'Consulte Manual' },
    { label: 'Fecha de entrega', value: props.item['FECHA DE ENTREGA'] || 'Histórico' },
  ];

  // 3. Estado y Condiciones del Equipo
  const conditionFields = [
    { label: 'Estatus del equipo', value: normalizedItem.value.condition || 'Activo' },
    { label: 'Condiciones físicas/operativas', value: props.item['CONDICIONES'] || props.item['OBSERVACIONES'] || 'Óptimas' },
    { label: 'Estatus Levantamiento 2025', value: props.item['ESTATUS LEVANTAMIENTO 2025'] || 'Pendiente' },
    { label: 'Carta de obsolescencia', value: props.item['CARTA DE OBSOLESCENCIA'] || 'Vigente' },
    { label: 'Último estatus de Mantenimiento', value: maintenanceFlow.value?.last_completed ? `${maintenanceFlow.value.last_completed.maintenance_type} (${maintenanceFlow.value.last_completed.is_manual ? 'Manual' : 'App'})` : 'Sin registros' },
  ];

  // 4. Componentes Asociados
  const componentFields = [
    { label: 'Accesorios', value: props.item['ACCESORIOS'] || 'Ninguno' },
    { label: 'Consumibles', value: props.item['CONSUMIBLES'] || 'N/A' },
    { label: 'Refacciones', value: props.item['REFACCIONES'] || 'No requiere' },
    { label: 'Área de entrega (Control)', value: normalizedItem.value.area || 'N/A' },
  ];

  return {
    '1. Identificación del Equipo': idFields,
    '2. Ubicaciones': locationFields,
    '3. Estado y Condiciones': conditionFields,
    '4. Componentes Asociados': componentFields,
  };
});

const monthlyChronologicalHistory = computed(() => {
  if (!history.value || history.value.length === 0) return {};
  
  const groups = {};
  const sorted = [...history.value].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  
  sorted.forEach(event => {
    const dateVal = event.started_at || event.fecha || event.ultimoMP;
    if (!dateVal) return;
    
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return;

    const monthYear = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const capitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    if (!groups[capitalized]) groups[capitalized] = [];
    groups[capitalized].push(event);
  });
  
  return groups;
});

function renderBarcodes() {
  if (activeSection.value !== 'specs' || !normalizedItem.value.inventoryNo) return;
  
  const inv = normalizedItem.value.inventoryNo;
  // Pequeño delay para asegurar que el DOM de la pestaña esté listo tras la transición
  setTimeout(() => {
    const els = document.querySelectorAll('.elite-barcode-canvas');
    if (els.length === 0) return;
    
    els.forEach(el => {
      try {
        JsBarcode(el, inv, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          fontOptions: "bold",
          margin: 10,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch (e) {
        console.error('[EHP] JsBarcode Error:', e);
      }
    });
  }, 200);
}

watch(activeSection, (val) => {
  if (val === 'specs') renderBarcodes();
});

function getCategoryColor(cat) {
  if (cat.includes('Identificación')) return '#2563eb';
  if (cat.includes('Ubicaciones')) return '#10b981';
  if (cat.includes('Estado')) return '#f59e0b';
  if (cat.includes('Componentes')) return '#8b5cf6';
  return '#64748b';
}

const filteredGroupedInfo = computed(() => {
  const groups = groupedEquipmentInfo.value;
  if (!specSearch.value) return groups;
  const q = specSearch.value.toLowerCase();
  const out = {};
  Object.keys(groups).forEach(cat => {
    const items = groups[cat].filter(f =>
      f.label.toLowerCase().includes(q) || (f.value && String(f.value).toLowerCase().includes(q))
    );
    if (items.length > 0) out[cat] = items;
  });
  return out;
});

function formatDateShort(d) {
  if (!d) return '---';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function calculateDuration(event) {
  const start = event.started_at || event.created_at;
  const end = event.finished_at || event.updated_at;
  if (!start) return 'N/A';
  if (!end) return 'En curso...';
  
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function toggleEditMode() {
  if (isEditMode.value) { isEditMode.value = false; }
  else { isEditMode.value = true; editedItem.value = { ...props.item }; }
}

async function saveChanges() {
  isSaving.value = true;
  try {
    await updateItem(props.item?.['No DE INVENTARIO'], editedItem.value);
    Swal.fire({
      icon: 'success', title: 'Registro actualizado',
      text: 'Los cambios se han guardado correctamente.',
      background: '#0D1117', color: '#F0F6FF', confirmButtonColor: '#2563EB',
    });
    isEditMode.value = false;
    loadData();
  } catch (e) { Swal.fire('Error', e.message, 'error'); }
  finally { isSaving.value = false; }
}

async function previewPdf() {
  pdfPreviewVisible.value = true;
  pdfDataUrl.value = null;
  pdfBlob.value = null;
  pdfProgress.value = 0;
  
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (pdfProgress.value < 95) pdfProgress.value += (95 - pdfProgress.value) * 0.1;
  }, 300);

  try {
    const result = await generateEquipmentPDF(props.item);
    clearInterval(progressInterval);
    pdfProgress.value = 100;

    if (result && result.fallback) {
      // El documento se abrió en otra pestaña como fallback simple (silencioso por petición de usuario)
      pdfPreviewVisible.value = false;
      return;
    }

    if (result && result.pdfUrl) {
      pdfDataUrl.value = result.pdfUrl;
      pdfBlob.value = result.blob;
    } else {
      pdfPreviewVisible.value = false;
    }
  } catch (e) { 
    console.error('[EHP] PDF Preview Error:', e);
    clearInterval(progressInterval);
    pdfPreviewVisible.value = false; 
  }
}

function downloadPdf() {
  generateEquipmentPDF(props.item).then(result => {
    if (result && result.blob) {
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(result.blob);
      a.download = `EXPEDIENTE-${normalizedItem.value.inventoryNo}.pdf`;
      a.click();
    }
  }).catch(e => {
    console.error('[EHP] PDF Download Error:', e);
  });
}

function openMaintenanceWizard() { wizardVisible.value = true; }
function onMaintenanceSaved() { loadData(); wizardVisible.value = false; }
function closePanel() { emit('close'); }
function closePdfPreview() { 
  pdfPreviewVisible.value = false; 
  pdfDataUrl.value = null;
  pdfBlob.value = null;
  pdfProgress.value = 0;
  if (progressInterval) clearInterval(progressInterval);
}




function getImageSrc(img) {
  if (typeof img === 'string') return img.startsWith('http') ? img : `/api/uploads/${img}`;
  return img.path || img.url || '';
}



function handleImageUpload(e) { /* implementar según servicio */ }
function removeExistingImage(idx) { equipmentImages.value.splice(idx, 1); }
function previewImage(img) { /* implementar lightbox */ }
</script>

<style scoped>
/* ─── TOKENS ───────────────────────────────────────────────────── */
.ehp-root, .pdf-overlay {
  /* FONDOS QUE GARANTIZAN CONTRASTE */
  --bg-page   : #0F172A; /* slate-900 (Main background) */
  --bg-surface: #0F172A; /* slate-900 (Tarjetas principales) */
  --bg-raised : #1E293B; /* slate-800 (Tarjetas secundarias / anidadas) */
  
  --border    : #1E293B; /* slate-800 (Borde tarjetas principales) */
  --border-md : #334155; /* slate-700 (Borde tarjetas secundarias) */

  /* ESCALA DE COLOR PARA TEXTO */
  --text-1    : #F8FAFC; /* slate-50  (Títulos principales) */
  --text-2    : #CBD5E1; /* slate-300 (Texto secundario / labels) */
  --text-3    : #94A3B8; /* slate-400 (Elemento inactivo) */
  --text-val  : #E2E8F0; /* slate-200 (Valores destacados / datos) */
  --text-link : #38BDF8; /* sky-400   (Acciones / links) */
  --text-link-hv: #7DD3FC; /* sky-300 (Acciones hover +100) */

  --accent    : #60A5FA; /* blue-400  (Elemento activo / seleccionado) */
  --accent-hv : #93C5FD; /* blue-300  (Elemento activo hover +100) */
  --accent-dim: rgba(96, 165, 250, 0.1);

  --success   : #34D399; /* emerald-400 (Indicadores positivos) */
  --success-dim: rgba(52, 211, 153, 0.1);
  --warning   : #FBBF24; /* amber-400 */
  --warning-dim: rgba(251, 191, 36, 0.1);
  --danger    : #F87171; /* red-400 (Indicadores negativos) */
  --danger-dim: rgba(248, 113, 113, 0.1);

  --radius-sm : 8px;
  --radius-md : 12px;
  --radius-lg : 18px;
  --radius-xl : 26px;
}

/* ─── OVERLAY ──────────────────────────────────────────────────── */
.ehp-root {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(18px);
  z-index: 100000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.ehp-container {
  width: 100%; max-width: 1480px; height: 92vh;
  background: var(--bg-page);
  border: 1px solid var(--border);
  border-radius: 32px;
  display: flex; overflow: hidden;
  box-shadow: 0 40px 120px -30px rgba(0, 0, 0, 0.85);
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ehp-container.global-maint-active {
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 40px 120px -30px rgba(0, 0, 0, 0.9), 0 0 40px rgba(14, 165, 233, 0.2);
  --accent: #38bdf8;
  --accent-dim: rgba(14, 165, 233, 0.15);
}

.ehp-container.global-maint-active::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 40%),
              radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.05), transparent 40%);
  pointer-events: none;
  animation: bgBreathing 8s infinite ease-in-out;
  z-index: 0;
}

@keyframes bgBreathing {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ─── SIDEBAR ──────────────────────────────────────────────────── */
.ehp-sidebar {
  width: 300px; flex-shrink: 0;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  padding: 36px 24px 28px;
  gap: 32px;
  overflow-y: auto;
}

/* Header */
.sidebar-identity-group { display: flex; flex-direction: column; gap: 12px; }
.sidebar-metadata { 
  display: flex; flex-direction: column; gap: 12px; 
  padding: 16px; 
  background: var(--bg-raised); 
  border-radius: var(--radius-md); 
  border: 1px solid var(--border-md); 
}
.meta-box { display: flex; flex-direction: column; gap: 4px; }
.m-label { font-size: 0.875rem; font-weight: 500; color: var(--text-2); text-transform: none; letter-spacing: normal; }
.m-value { font-size: 1.125rem; font-weight: 700; color: var(--text-val); }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; letter-spacing: 0.05em; }

.avatar-ring {
  width: 100px; height: 100px;
  border-radius: 28px;
  background: var(--bg-raised);
  border: 2px solid var(--border-md);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; transition: border-color 0.4s, transform 0.2s;
}
.st-ok   .avatar-ring { border-color: rgba(52, 211, 153, 0.45); }
.st-warn .avatar-ring { border-color: rgba(251, 191, 36, 0.45); }
.st-crit .avatar-ring { border-color: rgba(248, 113, 113, 0.45); }

.lottie-avatar { width: 80px; height: 80px; }

.eq-name {
  color: var(--text-1); font-size: 1.5rem; font-weight: 700;
  margin: 0; line-height: 1.2; text-align: center;
}

.id-badge {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--accent-dim);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 100px;
  padding: 6px 16px;
  margin: 0 auto;
}
.id-label { font-size: 0.875rem; font-weight: 500; color: var(--text-2); }
.id-value { font-size: 1.125rem; font-weight: 700; color: var(--text-val); }

/* Vitals */
.sidebar-vitals { display: flex; flex-direction: column; gap: 12px; }

.vital-card {
  background: var(--bg-raised); border: 1px solid var(--border-md);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex; align-items: center; gap: 16px;
}

.vital-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-surface);
  color: var(--text-2);
}
.st-ok   .vital-icon { color: var(--success); background: var(--success-dim); }
.st-warn .vital-icon { color: var(--warning); background: var(--warning-dim); }
.st-crit .vital-icon { color: var(--danger);  background: var(--danger-dim); }
.vital-card.location .vital-icon { color: var(--accent); background: var(--accent-dim); }

.vital-data { display: flex; flex-direction: column; gap: 4px; }
.v-label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-2); }
.v-value { 
  font-size: 1.15rem; font-weight: 700; color: var(--text-val); line-height: 1.2; 
  word-break: break-word; overflow-wrap: break-word;
}

/* Nav */
.sidebar-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }

.sidebar-nav button {
  background: transparent; border: none; cursor: pointer;
  color: var(--text-3); padding: 12px 16px; border-radius: var(--radius-md);
  display: flex; align-items: center; gap: 14px;
  font-size: 1rem; font-weight: 500; transition: background 0.2s, color 0.2s;
  text-align: left;
}
.sidebar-nav button:hover { background: var(--bg-raised); color: var(--text-2); }
.sidebar-nav button.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
.sidebar-nav button.active:hover { background: rgba(96, 165, 250, 0.15); color: var(--accent-hv); }

/* Actions */
.sidebar-actions { display: flex; flex-direction: column; gap: 12px; }

.btn-primary {
  background: var(--bg-raised); color: var(--text-link); border: 1px solid var(--border-md); cursor: pointer;
  padding: 14px 16px; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: var(--bg-surface); color: var(--text-link-hv); border-color: var(--border); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; color: var(--text-3); }

.btn-maint-pulse {
  background: var(--accent) !important;
  color: #0F172A !important;
  border: none !important;
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
  animation: btnPulseMaint 2s infinite ease-in-out;
}

@keyframes btnPulseMaint {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); }
  50% { transform: scale(1.03); box-shadow: 0 0 30px rgba(14, 165, 233, 0.6); }
}

.sidebar-maint-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(14, 165, 233, 0.4);
  padding: 6px 12px; border-radius: 8px;
  color: #38bdf8; font-size: 0.7rem; font-weight: 900;
  margin-bottom: 8px; letter-spacing: 0.05em;
}

.zap-pulse {
  animation: zapSmallPulse 1.5s infinite;
}

@keyframes zapSmallPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.tool-group { display: flex; gap: 12px; }

.btn-tool {
  flex: 1; background: var(--bg-raised); border: 1px solid var(--border-md);
  color: var(--text-link); padding: 12px; border-radius: var(--radius-md);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.btn-tool:hover { background: var(--bg-surface); color: var(--text-link-hv); border-color: var(--border); }

.btn-close-panel {
  background: transparent; border: none; cursor: pointer;
  color: var(--text-3); font-size: 0.875rem; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px; border-radius: var(--radius-md); transition: color 0.2s;
}
.btn-close-panel:hover { color: var(--text-2); background: var(--bg-raised); }

/* ─── MAIN ─────────────────────────────────────────────────────── */
.ehp-main {
  flex: 1; display: flex; flex-direction: column;
  background: var(--bg-page); min-width: 0;
}

.main-header {
  padding: 24px 48px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  flex-shrink: 0;
}

.breadcrumb {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.875rem; font-weight: 500; color: var(--text-2);
}
.bc-item { display: flex; align-items: center; gap: 6px; }
.bc-active { color: var(--accent); font-weight: 600; }
.bc-sep { color: var(--text-3); }

.header-actions { display: flex; align-items: center; gap: 12px; }

.btn-edit {
  background: var(--bg-raised); border: 1px solid var(--border-md);
  color: var(--text-link); padding: 10px 20px; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.btn-edit:hover { background: var(--bg-surface); color: var(--text-link-hv); border-color: var(--border); }

.btn-save {
  background: var(--success); color: #0F172A; border: none; padding: 10px 20px;
  border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 700;
  cursor: pointer; transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #10B981; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  background: transparent; border: 1px solid var(--border-md);
  color: var(--text-link); padding: 10px 20px; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.btn-ghost:hover { color: var(--text-link-hv); border-color: var(--border); background: var(--bg-raised); }

.main-content {
  flex: 1; overflow-y: auto; padding: 40px 48px;
}

/* ─── ELITE BENTO DASHBOARD ───────────────────────────────────── */
.section-dashboard-elite { display: flex; flex-direction: column; gap: 24px; }
.elite-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;
}

.elite-card { 
  background: var(--bg-surface); border: 1px solid var(--border); 
  border-radius: var(--radius-xl); padding: 28px; 
  display: flex; flex-direction: column; gap: 20px; 
  transition: transform 0.2s, border-color 0.2s; 
}
.elite-card:hover { border-color: var(--border-md); }

.ec-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.ec-tag { font-size: 1.125rem; font-weight: 700; color: var(--text-1); }

/* Health Center (2x2) */
.health-center { grid-column: span 2; grid-row: span 2; display: flex; flex-direction: column; justify-content: space-between; }
.health-center.st-ok   { background: linear-gradient(135deg, rgba(52, 211, 153, 0.08) 0%, var(--bg-surface) 100%); border-color: rgba(52, 211, 153, 0.2); }
.health-center.st-warn { background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, var(--bg-surface) 100%); border-color: rgba(251, 191, 36, 0.2); }
.health-center.st-crit { background: linear-gradient(135deg, rgba(248, 113, 113, 0.08) 0%, var(--bg-surface) 100%); border-color: rgba(248, 113, 113, 0.2); }

.health-display { display: flex; align-items: center; gap: 36px; flex: 1; }
.health-gauge-elite { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
.health-gauge-elite svg { transform: rotate(-90deg); width: 100%; height: 100%; }
.e-track { fill: none; stroke: var(--bg-raised); stroke-width: 8; }
.e-fill  { fill: none; stroke: currentColor; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); stroke-dasharray: 276; }
.st-ok   .e-fill { stroke: var(--success); }
.st-warn .e-fill { stroke: var(--warning); }
.st-crit .e-fill { stroke: var(--danger); }
.st-maint .e-fill { stroke: var(--accent); }
.e-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.25rem; font-weight: 800; color: var(--text-val); }

.health-info { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.health-title-elite { font-size: 1.875rem; font-weight: 800; color: var(--text-1); margin: 0; line-height: 1.2; }
.lottie-elite { width: 85px; height: 85px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15)); }
.health-desc-elite { font-size: 1rem; font-weight: 500; color: var(--text-2); line-height: 1.6; margin: 0; }

/* Quick Actions */
.quick-actions-card { grid-column: span 2; }
.qa-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; flex: 1; }
.qa-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  padding: 18px; border-radius: var(--radius-lg); border: 1px solid var(--border-md);
  background: var(--bg-raised); color: var(--text-link); cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.qa-btn span { font-size: 0.875rem; font-weight: 600; }
.qa-btn:hover { transform: translateY(-3px); border-color: var(--accent); background: var(--accent-dim); color: var(--text-link-hv); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.5); }
.qa-btn.warning:hover { border-color: var(--warning); background: var(--warning-dim); color: #FCD34D; }
.qa-btn.success:hover { border-color: var(--success); background: var(--success-dim); color: #6EE7B7; }

/* Stats Mini */
.mini-stats-grid { display: flex; flex-direction: column; gap: 16px; justify-content: center; flex: 1; }
.m-stat { display: flex; align-items: center; gap: 16px; }
.m-label { font-size: 1rem; font-weight: 600; color: var(--text-2); width: 36px; }
.m-bar { flex: 1; height: 8px; background: var(--bg-raised); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-md); }
.m-fill { height: 100%; border-radius: 4px; }
.m-fill.success { background: var(--success); }
.m-fill.danger  { background: var(--danger); }
.m-val { font-size: 1.25rem; font-weight: 800; color: var(--text-val); width: 36px; text-align: right; }

/* Count & Meta */
.count-mini { justify-content: center; }
.big-count { font-size: 3rem; font-weight: 800; color: var(--text-val); line-height: 1; margin: 8px 0; }
.count-label, .meta-label { font-size: 1rem; font-weight: 500; color: var(--text-2); }
.meta-val { font-size: 1.25rem; font-weight: 800; color: var(--text-val); margin-top: auto; margin-bottom: 8px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Timeline Card */
.timeline-card { grid-column: span 2; }
.elite-feed { display: flex; flex-direction: column; gap: 12px; }
.ef-item { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: var(--bg-raised); border-radius: var(--radius-md); border: 1px solid var(--border-md); transition: all 0.2s; cursor: pointer; }
.ef-item:hover { background: var(--bg-surface); border-color: var(--border); transform: translateX(4px); }
.ef-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0F172A; }
.ef-icon.mp { background: var(--success); }
.ef-icon.mc { background: var(--danger); }
.ef-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.ef-title { font-size: 1rem; font-weight: 700; color: var(--text-1); }
.ef-date { font-size: 0.875rem; font-weight: 500; color: var(--text-2); }
.ef-chev { color: var(--text-3); }
.elite-empty { color: var(--text-3); font-size: 1rem; font-weight: 500; text-align: center; padding: 24px; }

/* Maintenance Intervention Banner */
.maintenance-intervention-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(30, 64, 175, 0.15) 100%);
  border: 1px solid rgba(14, 165, 233, 0.4);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 30px -10px rgba(14, 165, 233, 0.4);
  animation: bannerPulse 4s infinite ease-in-out;
}

@keyframes bannerPulse {
  0%, 100% { border-color: rgba(14, 165, 233, 0.4); box-shadow: 0 10px 30px -10px rgba(14, 165, 233, 0.4); }
  50% { border-color: rgba(14, 165, 233, 0.8); box-shadow: 0 15px 40px -5px rgba(14, 165, 233, 0.6); }
}

.mib-content { display: flex; align-items: center; gap: 20px; }
.mib-icon-pulse {
  width: 48px; height: 48px;
  background: var(--accent);
  color: #0F172A;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  animation: zapPulse 2s infinite;
}

@keyframes zapPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
}

.mib-text { display: flex; flex-direction: column; gap: 4px; }
.mib-title { font-size: 1.125rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
.mib-desc { font-size: 1rem; font-weight: 500; color: var(--text-2); }
.mib-desc strong { color: var(--text-val); }

.mib-action-btn {
  background: var(--accent); color: #0F172A; border: none;
  padding: 12px 24px; border-radius: 12px;
  font-size: 0.95rem; font-weight: 800;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.2s;
}
.mib-action-btn:hover { background: var(--text-link-hv); transform: scale(1.05); }

.primary-glow {
  background: var(--accent-dim) !important;
  border-color: var(--accent) !important;
  color: var(--accent) !important;
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
}
.primary-glow:hover {
  background: var(--accent) !important;
  color: #0F172A !important;
}

.text-maint { color: var(--accent) !important; }

/* Dashboard Card Maintenance Themes */
.health-center.st-maint {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, var(--bg-surface) 100%);
  border-color: rgba(14, 165, 233, 0.4);
}

/* Stats card */
.health-banner {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 24px 32px; margin-bottom: 24px;
}
.health-banner.st-ok   { border-color: rgba(52, 211, 153, 0.3); background: linear-gradient(90deg, rgba(52, 211, 153, 0.05) 0%, var(--bg-surface) 100%); }
.health-banner.st-warn { border-color: rgba(251, 191, 36, 0.3);  background: linear-gradient(90deg, rgba(251, 191, 36, 0.05) 0%, var(--bg-surface) 100%); }
.health-banner.st-crit { border-color: rgba(248, 113, 113, 0.3);  background: linear-gradient(90deg, rgba(248, 113, 113, 0.05) 0%, var(--bg-surface) 100%); }

.h-banner-main { display: flex; align-items: center; justify-content: space-between; gap: 40px; }

/* ─── ELITE TABS ──────────────────────────────────────────────── */
.section-specs-elite, .section-history-elite, .section-gallery-elite, .section-docs-elite { display: flex; flex-direction: column; gap: 32px; animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.empty-elite { padding: 100px 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: var(--text-3); text-align: center; border: 2px dashed var(--border-md); border-radius: var(--radius-xl); font-size: 1.125rem; font-weight: 500; }

/* Specs */
.specs-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.elite-search { flex: 1; display: flex; align-items: center; gap: 14px; background: var(--bg-raised); border: 1px solid var(--border-md); border-radius: var(--radius-lg); padding: 14px 20px; transition: border-color 0.2s; }
.elite-search:focus-within { border-color: var(--accent); }
.elite-search input { background: transparent; border: none; outline: none; color: var(--text-val); font-size: 1rem; font-weight: 500; width: 100%; }
.elite-search input::placeholder { color: var(--text-3); }
.btn-tool-elite { background: var(--bg-raised); border: 1px solid var(--border-md); color: var(--text-link); padding: 14px 20px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.875rem; font-weight: 700; transition: background 0.2s, color 0.2s, border-color 0.2s; }
.btn-tool-elite:hover { background: var(--bg-surface); color: var(--text-link-hv); border-color: var(--border); }

.specs-clinical-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 32px; 
}
.spec-category-card { 
  background: var(--bg-surface); 
  border: 1px solid var(--border); 
  border-radius: var(--radius-xl); 
  padding: 32px; 
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.scc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.scc-bar { width: 4px; height: 20px; border-radius: 2px; }
.scc-title { font-size: 1.25rem; font-weight: 800; color: var(--text-1); margin: 0; letter-spacing: -0.02em; }
.scc-row { 
  display: flex; 
  flex-direction: column;
  gap: 6px;
  padding: 14px 0; 
  border-bottom: 1px solid var(--border-md); 
}
.scc-row:last-child { border-bottom: none; padding-bottom: 0; }
.scc-label { color: var(--text-3); font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.scc-value { color: var(--text-val); font-weight: 700; font-size: 1.05rem; }
.scc-value.is-fallback { color: var(--text-3); font-style: italic; font-weight: 500; }
.scc-input { background: var(--bg-raised); border: 1px solid var(--accent); color: var(--text-val); font-size: 1rem; font-weight: 700; padding: 10px; border-radius: var(--radius-sm); outline: none; width: 100%; }

/* Barcodes */
.barcode-labels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
.label-box { background: white; border: 2px solid #000; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px; }
.label-header { font-size: 10px; font-weight: 900; color: #000; margin-bottom: 5px; }
.label-footer { font-size: 8px; font-weight: 700; color: #666; margin-top: 5px; border-top: 1px dashed #ccc; width: 100%; text-align: center; padding-top: 5px; }
.elite-barcode-canvas { max-width: 100%; height: auto; }

/* History */
.month-block { margin-bottom: 40px; }
.month-header-elite { font-size: 1.25rem; font-weight: 800; color: var(--accent); margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid var(--accent-dim); }
.history-controls-elite { margin-bottom: 24px; font-size: 1.125rem; font-weight: 500; color: var(--text-2); }
.history-count-elite strong { font-weight: 800; color: var(--text-val); }
.clinical-timeline-full { display: flex; flex-direction: column; }
.ctf-node { display: flex; gap: 28px; padding: 24px 0; }
.ctf-aside { width: 90px; text-align: right; display: flex; flex-direction: column; gap: 6px; }
.ctf-date { font-size: 1rem; font-weight: 800; color: var(--text-val); }
.ctf-time { font-size: 0.875rem; font-weight: 500; color: var(--text-2); }
.ctf-rail { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.ctf-dot { width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 0 3px currentColor; background: var(--bg-page); }
.ctf-dot.mp { color: var(--success); }
.ctf-dot.mc { color: var(--danger); }
.ctf-line { flex: 1; width: 2px; background: var(--border-md); }
.ctf-node:last-child .ctf-line { display: none; }
.ctf-card {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.ctf-card:hover {
  border-color: var(--accent);
  box-shadow: 0 8px 30px rgba(14, 165, 233, 0.08);
  transform: translateY(-2px);
}
.ctf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-md); }
.ctf-badge { font-size: 0.8rem; font-weight: 800; padding: 6px 14px; border-radius: 8px; color: #0F172A; text-transform: uppercase; letter-spacing: 0.02em; }
.ctf-badge.mp { background: var(--success); }
.ctf-badge.mc { background: var(--danger); }
.ctf-folio { font-size: 1.125rem; font-weight: 800; color: var(--text-val); }

.ctf-section { margin-bottom: 16px; }
.ctf-section-label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--accent); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em; }
.ctf-desc { font-size: 1rem; font-weight: 500; color: var(--text-2); line-height: 1.6; margin: 0; }

.ctf-tech-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
.tech-tag { font-size: 0.75rem; font-weight: 700; background: var(--bg-raised); color: var(--text-2); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-md); }

.ctf-meta-compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ctf-meta-item.main-item {
  grid-column: 1 / -1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 6px;
  margin-bottom: 4px;
}

/* Status & Type Colors */
.ctf-event-card.type-mp { border-left-color: #0d9488; }
.ctf-event-card.type-mc { border-left-color: #b91c1c; }
.ctf-event-card.type-pending { border-left-color: #f59e0b; }

.ctf-event-card.type-mp .ctf-header { background: rgba(13, 148, 136, 0.05); }
.ctf-event-card.type-mc .ctf-header { background: rgba(185, 28, 28, 0.05); }
.ctf-event-card.type-pending .ctf-header { background: rgba(245, 158, 11, 0.05); }

.ctf-dot.mp { background: #0d9488; box-shadow: 0 0 10px rgba(13, 148, 136, 0.5); }
.ctf-dot.mc { background: #b91c1c; box-shadow: 0 0 10px rgba(185, 28, 28, 0.5); }
.ctf-dot.pending { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }

.ctf-badge.mp { background: rgba(13, 148, 136, 0.1); color: #0d9488; border: 1px solid rgba(13, 148, 136, 0.2); }
.ctf-badge.mc { background: rgba(185, 28, 28, 0.1); color: #b91c1c; border: 1px solid rgba(185, 28, 28, 0.2); }
.ctf-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }

.ctf-meta-compact-grid.secondary {
  background: rgba(255, 255, 255, 0.015);
  border-style: dashed;
}

.checks-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.checks-inline span {
  opacity: 0.3;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.checks-inline span.active {
  opacity: 1;
  color: var(--brand-primary);
}

.ctf-notes-mini {
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid var(--brand-primary);
  font-size: 0.8rem;
  color: var(--text-2);
  line-height: 1.4;
  border-radius: 0 4px 4px 0;
}

.ctf-notes-mini.warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
  margin-top: 6px;
}

.ctf-meta-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
  gap: 12px; 
  margin-top: 20px; 
  padding-top: 16px; 
  border-top: 1px dashed var(--border-md); 
}
.ctf-meta-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 600; color: var(--text-3); }
.ctf-meta-item strong { color: var(--text-val); margin-right: 4px; }
.ctf-meta-item svg { color: var(--accent); }

/* Tracking Mini List (Inside Specs) */
.tracking-mini-list { display: flex; flex-direction: column; gap: 16px; }
.month-tracking-item { border-left: 2px solid var(--border-md); padding-left: 16px; margin-bottom: 8px; }
.mti-header { font-size: 0.875rem; font-weight: 800; color: var(--accent); margin-bottom: 8px; text-transform: uppercase; }
.mti-event { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: var(--bg-raised); border-radius: 8px; margin-bottom: 6px; border: 1px solid var(--border-md); }
.mti-badge { font-size: 0.65rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; color: #fff; }
.mti-badge.mp { background: var(--success); }
.mti-badge.mc { background: var(--danger); }
.mti-info { flex: 1; display: flex; flex-direction: column; }
.mti-folio { font-size: 0.75rem; font-weight: 700; color: var(--text-val); }
.mti-date { font-size: 0.65rem; color: var(--text-2); }
.mti-hours { font-size: 0.75rem; font-weight: 800; color: var(--text-3); }

/* Root Layering Fix */
.ehp-root { z-index: 100000; }
.pdf-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 300000 !important;
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.pdf-modal {
  width: 100%; max-width: 1100px; height: 90vh;
  background: var(--bg-page);
  border: 1px solid var(--border-md);
  border-radius: var(--radius-xl);
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7);
}
.pdf-modal-header {
  padding: 20px 32px;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border-md);
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.pdf-modal-header h3 { font-size: 1.25rem; font-weight: 800; color: var(--text-1); margin: 0; }
.pdf-close-btn {
  width: 36px; height: 36px;
  background: var(--bg-surface);
  border: 1px solid var(--border-md);
  color: var(--text-link);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex: none;
}
.pdf-close-btn:hover { 
  background: var(--bg-raised); 
  color: var(--text-link-hv); 
  border-color: var(--accent); 
  transform: rotate(90deg); 
}
.pdf-body { flex: 1; min-height: 0; position: relative; height: 100%; display: flex; flex-direction: column; }

.pdf-loading-zone {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-page); z-index: 10;
}
.clinical-loading-icon {
  position: relative;
  width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
  color: var(--accent);
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}
.clinical-loading-icon .base-icon {
  filter: drop-shadow(0 0 15px rgba(96, 165, 250, 0.4));
}
.scan-bar {
  position: absolute;
  top: 10%; left: 10%; width: 80%; height: 3px;
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
  border-radius: 2px;
  animation: scan 2s linear infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes scan {
  0% { top: 10%; opacity: 0; }
  10%, 90% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}
.pdf-progress-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  max-width: 400px; padding: 40px; gap: 16px;
}
.loading-title { font-size: 1.5rem; font-weight: 800; color: var(--text-1); margin: 0; }
.loading-desc { font-size: 0.875rem; color: var(--text-3); line-height: 1.5; }
.pdf-progress-track {
  width: 100%; height: 6px; background: var(--bg-raised);
  border-radius: 100px; overflow: hidden; margin-top: 10px;
  border: 1px solid var(--border-md);
}
.pdf-progress-fill {
  height: 100%; background: linear-gradient(90deg, var(--accent), var(--success));
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.pdf-progress-num { font-size: 1.25rem; font-weight: 800; color: var(--accent); margin-top: 8px; }

.ehp-container { z-index: 501; }
:deep(.wizard-overlay) { z-index: 200000 !important; }

/* Gallery */
.gallery-header-elite { display: flex; justify-content: space-between; align-items: center; }
.gallery-info-elite { font-size: 1.125rem; font-weight: 500; color: var(--text-2); margin: 0; }
.btn-primary-small { background: var(--bg-raised); border: 1px solid var(--border-md); color: var(--text-link); padding: 10px 16px; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s; }
.btn-primary-small:hover { background: var(--bg-surface); color: var(--text-link-hv); border-color: var(--border); }
.gallery-elite-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.ge-item { position: relative; aspect-ratio: 4/3; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-md); }
.ge-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.ge-item:hover img { transform: scale(1.05); }
.ge-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.7); opacity: 0; display: flex; align-items: center; justify-content: center; gap: 16px; transition: opacity 0.2s; }
.ge-item:hover .ge-overlay { opacity: 1; }
.ge-btn { background: var(--bg-raised); border: 1px solid var(--border-md); color: var(--text-link); padding: 10px; border-radius: 50%; cursor: pointer; transition: background 0.2s, color 0.2s; }
.ge-btn.danger { color: var(--danger); }
.ge-btn:hover { background: var(--bg-surface); color: var(--text-link-hv); }
.ge-btn.danger:hover { color: #FCA5A5; }

/* Docs */
.docs-clinical-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.doc-elite-item { display: flex; align-items: center; gap: 20px; padding: 24px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
.doc-elite-item:hover { border-color: var(--border-md); transform: translateY(-2px); }
.dei-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); color: #0F172A; }
.dei-icon.pdf { background: var(--accent); }
.dei-icon.manual { background: var(--text-3); }
.dei-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.dei-title { font-size: 1.125rem; font-weight: 700; color: var(--text-1); }
.dei-desc { font-size: 0.875rem; font-weight: 500; color: var(--text-2); }
.dei-action { color: var(--text-link); transition: color 0.2s; }
.doc-elite-item:hover .dei-action { color: var(--text-link-hv); }

/* ─── UTILITIES & ANIMATIONS ─────────────────────────────────── */
.emoji-pop-enter-active, .emoji-pop-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.emoji-pop-enter-from { opacity: 0; transform: scale(0.5); }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── RESPONSIVE ───────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .ehp-sidebar {
    width: 80px; padding: 28px 16px; gap: 24px;
  }
  .sidebar-header .eq-name,
  .sidebar-header .id-badge,
  .sidebar-vitals .vital-data,
  .sidebar-nav button span,
  .btn-primary span,
  .btn-close-panel span { display: none; }

  .sidebar-nav button { padding: 14px; justify-content: center; }
  .btn-primary { padding: 14px; }
  .vital-card  { padding: 12px; justify-content: center; }
  .vital-icon  { width: 40px; height: 40px; }
  .avatar-ring { width: 56px; height: 56px; border-radius: 16px; }
  .lottie-avatar { width: 44px; height: 44px; }

  .elite-grid  { grid-template-columns: 1fr; }
  .specs-clinical-grid { columns: 1; }
  .health-center { grid-row: span 1; grid-column: span 1; }
  .quick-actions-card { grid-column: span 1; }
  .timeline-card { grid-column: span 1; }
}

@media (max-width: 900px) {
  .main-content { padding: 32px 24px; }
  .main-header  { padding: 20px 24px; }
  .ctf-time { display: none; }
}
</style>