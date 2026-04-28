<template>
  <div class="inactivity-settings-container">
    <div class="settings-header">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <h3>Configuración de Sesión</h3>
    </div>

    <div class="settings-content">
      <!-- Toggle para activar/desactivar -->
      <div class="setting-toggle">
        <div class="toggle-info">
          <label>Cierre automático de sesión</label>
          <p class="toggle-description">
            Activar para cerrar sesión automáticamente después de un tiempo de inactividad
          </p>
        </div>
        <div class="toggle-control">
          <button 
            :class="['toggle-btn', { enabled: inactivityEnabled }]"
            @click="inactivityEnabled = !inactivityEnabled; saveToggle()"
          >
            <span class="toggle-switch"></span>
            {{ inactivityEnabled ? 'Activado' : 'Desactivado' }}
          </button>
        </div>
      </div>

      <!-- Opciones de configuración (solo si está activado) -->
      <div v-if="inactivityEnabled" class="setting-item">
        <div class="setting-info">
          <label>Tiempo de inactividad para mostrar advertencia</label>
          <p class="setting-description">
            Selecciona cuánto tiempo de inactividad debe pasar antes de mostrar la advertencia con opción de cerrar sesión.
          </p>
        </div>

        <div class="setting-control">
          <div class="preset-grid">
            <button
              v-for="preset in presets"
              :key="preset.value"
              :class="['preset-card', { active: inactivityMinutes === preset.value }]"
              @click="selectPreset(preset.value)"
            >
              <div class="preset-icon">{{ preset.icon }}</div>
              <div class="preset-label">{{ preset.label }}</div>
              <div class="preset-time">{{ preset.timeDisplay }}</div>
            </button>
          </div>

          <!-- Advanced options -->
          <div class="advanced-settings" style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap;">
            <div style="min-width:220px; flex:1;">
              <label class="field-label">Advertencia (countdown modal)</label>
              <select v-model.number="warningSeconds" class="input" style="width:100%; margin-top:6px;">
                <option :value="15">15 segundos</option>
                <option :value="30">30 segundos (recomendado)</option>
                <option :value="60">60 segundos</option>
                <option :value="120">120 segundos</option>
              </select>
              <p class="setting-description" style="margin-top:6px;">Duración del contador en la modal final antes del logout (por defecto 30s).</p>
            </div>

            <div style="min-width:220px; flex:1;">
              <label class="field-label">Advertencia previa (lead time)</label>
              <select v-model.number="preWarningSeconds" class="input" style="width:100%; margin-top:6px;">
                <option :value="30">30 segundos</option>
                <option :value="60">60 segundos (recomendado)</option>
                <option :value="120">120 segundos</option>
                <option :value="300">5 minutos</option>
              </select>
              <p class="setting-description" style="margin-top:6px;">Cuánto antes del timeout quieres recibir una advertencia previa (Notificación).</p>
            </div>

            <div style="min-width:160px; width:140px;">
              <label class="field-label">Umbral de detección</label>
              <input type="number" v-model.number="inactivityThresholdSeconds" class="input" min="1" step="1" style="margin-top:6px; width:100%;" />
              <p class="setting-description" style="margin-top:6px;">Segundos sin actividad para marcar como "inactivo".</p>
            </div>

            <div style="min-width:220px; flex:1;">
              <label class="field-label">Sincronizar entre pestañas</label>
              <div style="margin-top:6px; display:flex; gap:8px; align-items:center;">
                <button :class="['toggle-btn', { enabled: syncAcrossTabs }]" @click="syncAcrossTabs = !syncAcrossTabs">
                  {{ syncAcrossTabs ? 'Sí' : 'No' }}
                </button>
                <span class="setting-description">Si está activado, otras pestañas recibirán advertencia y logout sincronizado.</span>
              </div>
            </div>

            <div style="min-width:220px; flex:1;">
              <label class="field-label">Refrescar token al "Continuar"</label>
              <div style="margin-top:6px; display:flex; gap:8px; align-items:center;">
                <button :class="['toggle-btn', { enabled: keepAliveRefresh }]" @click="keepAliveRefresh = !keepAliveRefresh">
                  {{ keepAliveRefresh ? 'Activado' : 'Desactivado' }}
                </button>
                <span class="setting-description">Si está activado, el botón "Continuar" solicitará refresh al backend.</span>
              </div>
            </div>

            <div style="min-width:220px; flex:1;">
              <label class="field-label">Restaurar ubicación después del logout</label>
              <div style="margin-top:6px; display:flex; gap:8px; align-items:center;">
                <button :class="['toggle-btn', { enabled: restoreOnLogin }]" @click="restoreOnLogin = !restoreOnLogin">
                  {{ restoreOnLogin ? 'Sí' : 'No' }}
                </button>
                <span class="setting-description">Si está activado, la app intentará restaurar la ruta/scroll tras volver a iniciar sesión.</span>
              </div>
            </div>

            <div style="width:100%; display:flex; gap:12px; margin-top:12px; align-items:center;">
              <button class="btn primary" @click="saveConfiguration">Guardar configuración</button>
              <button class="btn secondary" @click="forcePreWarning" title="Probar advertencia previa">Probar pre-advertencia</button>
              <button class="btn secondary" @click="forceWarning" title="Probar modal de expiración">Probar modal (30s)</button>
              <button class="btn outline" @click="selfTest" title="Autodiagnóstico">Autodiagnóstico</button>
              <div v-if="isSaved" class="save-status success">✓ Configuración guardada</div>
              <div v-if="error" class="save-status error">✗ {{ error }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información explicativa -->
      <div class="setting-notes">
        <h4>ℹ️ Cómo funciona</h4>
        <div v-if="inactivityEnabled" class="notes-enabled">
          <p><strong>Cuando está activado:</strong></p>
          <ul>
            <li>Se detecta inactividad tras {{ inactivityThresholdSeconds }} segundos sin movimiento de mouse/teclado</li>
            <li>Después de {{ inactivityMinutes }} min de inactividad, aparecerá una advertencia en la esquina inferior derecha</li>
            <li>La advertencia muestra un contador de tiempo y un botón para cerrar sesión</li>
            <li>Puedes cerrar sesión al hacer clic en el botón o dejar que se cierre automáticamente</li>
            <li>Cualquier clic o tecla pausa el contador automáticamente</li>
            <li>Al cerrar sesión, regresarás al mismo lugar cuando vuelvas a iniciar sesión</li>
          </ul>
          <p class="time-info">⏱️ Tiempo de inactividad configurado: <strong>{{ inactivityMinutes }} min</strong></p>
        </div>
        <div v-else class="notes-disabled">
          <p>⚠️ El cierre automático de sesión está desactivado. Tu sesión permanecerá abierta indefinidamente.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import inactivityHandler from '@/utils/inactivityHandler'
import { showSuccess, showError } from '@/utils/sweetAlertConfig'

const inactivityEnabled = ref(true)
const inactivityMinutes = ref(30)
const isSaved = ref(false)
const error = ref('')

// Nuevas opciones configurables por el usuario
const warningSeconds = ref(30) // modal countdown por defecto = 30s
const preWarningSeconds = ref(60) // pre-warning lead time (s)
const inactivityThresholdSeconds = ref(20)
const syncAcrossTabs = ref(true)
const keepAliveRefresh = ref(true)
const restoreOnLogin = ref(true)

const presets = [
  { label: '1 min', value: 1, icon: '⚡', timeDisplay: 'Mínimo permitido' },
  { label: '5 min', value: 5, icon: '⏱️', timeDisplay: 'Muy corto' },
  { label: '10 min', value: 10, icon: '⏱️', timeDisplay: 'Corto' },
  { label: '30 min', value: 30, icon: '⏰', timeDisplay: 'Recomendado' },
  { label: '1 hora', value: 60, icon: '🕐', timeDisplay: 'Largo' },
  { label: '2 horas', value: 120, icon: '🕑', timeDisplay: 'Muy largo' }
]

onMounted(() => {
  // Cargar valores guardados del localStorage
  const savedEnabled = localStorage.getItem('inactivityEnabled')
  const savedTimeout = localStorage.getItem('inactivityTimeout')
  const savedWarning = localStorage.getItem('inactivityWarningSeconds')
  const savedThreshold = localStorage.getItem('inactivityThresholdSeconds')
  const savedSync = localStorage.getItem('inactivitySyncTabs')
  const savedKeepAlive = localStorage.getItem('inactivityKeepAliveRefresh')
  const savedRestore = localStorage.getItem('inactivityRestoreSession')

  if (savedEnabled !== null) {
    inactivityEnabled.value = savedEnabled === 'true'
  }

  if (savedTimeout) {
    inactivityMinutes.value = Math.max(15, parseInt(savedTimeout))
  } else {
    inactivityMinutes.value = 15
  }

  if (savedWarning) warningSeconds.value = parseInt(savedWarning)
  const savedPre = localStorage.getItem('inactivityPreWarningSeconds')
  if (savedPre) preWarningSeconds.value = parseInt(savedPre)
  if (savedThreshold) inactivityThresholdSeconds.value = parseInt(savedThreshold)
  if (savedSync !== null) syncAcrossTabs.value = savedSync === 'true'
  if (savedKeepAlive !== null) keepAliveRefresh.value = savedKeepAlive === 'true'
  if (savedRestore !== null) restoreOnLogin.value = savedRestore === 'true'

  // Inicializar el manejador con opciones guardadas
  if (inactivityEnabled.value) {
    const effectiveMinutes = Math.max(15, inactivityMinutes.value)
    inactivityHandler.init(effectiveMinutes, warningSeconds.value)
    inactivityHandler.setPreWarningSeconds(preWarningSeconds.value)
    inactivityHandler.setInactivityThreshold(inactivityThresholdSeconds.value)
    inactivityHandler.setSyncAcrossTabs(syncAcrossTabs.value)
    inactivityHandler.setKeepAliveRefresh(keepAliveRefresh.value)
  }
})

const saveToggle = () => {
  try {
    localStorage.setItem('inactivityEnabled', inactivityEnabled.value.toString())

    if (inactivityEnabled.value) {
      // Reanudar el manejador de inactividad
      inactivityHandler.init(inactivityMinutes.value, warningSeconds.value)
      inactivityHandler.setPreWarningSeconds(preWarningSeconds.value)
      inactivityHandler.setInactivityThreshold(inactivityThresholdSeconds.value)
      inactivityHandler.setSyncAcrossTabs(syncAcrossTabs.value)
      inactivityHandler.setKeepAliveRefresh(keepAliveRefresh.value)
      showSuccess('Activado', 'Cierre automático de sesión activado')
    } else {
      // Pausar el manejador
      inactivityHandler.destroy()
      showSuccess('Desactivado', 'Cierre automático de sesión desactivado. Tu sesión permanecerá abierta.')
    }
  } catch (e) {
    error.value = e.message || 'Error al guardar la configuración'
    showError('Error', error.value)
  }
}

const selectPreset = (value) => {
  inactivityMinutes.value = value
  
  // Calcular preWarningSeconds automáticamente basado en el timeout
  // Regla: mostrar pre-warning con 20% del timeout restante, pero mínimo 30s
  const calculatedPreWarning = Math.max(30, Math.round(value * 0.20 * 60))
  preWarningSeconds.value = Math.min(calculatedPreWarning, 300) // Máximo 5 minutos
  
  console.log(`[InactivitySettings] Preset: ${value}min → Pre-warning: ${preWarningSeconds.value}s`)
  saveConfiguration()
}

const saveConfiguration = () => {
  try {
    // Validar rango
    if (inactivityMinutes.value < 1 || inactivityMinutes.value > 480) {
      error.value = 'El tiempo debe estar entre 1 y 480 minutos'
      return
    }

    // Guardar en localStorage
    localStorage.setItem('inactivityTimeout', inactivityMinutes.value.toString())
    localStorage.setItem('inactivityEnabled', 'true')
    inactivityEnabled.value = true

    // Guardar nuevas opciones
    localStorage.setItem('inactivityWarningSeconds', String(warningSeconds.value))
    localStorage.setItem('inactivityPreWarningSeconds', String(preWarningSeconds.value))
    localStorage.setItem('inactivityThresholdSeconds', String(inactivityThresholdSeconds.value))
    localStorage.setItem('inactivitySyncTabs', String(syncAcrossTabs.value))
    localStorage.setItem('inactivityKeepAliveRefresh', String(keepAliveRefresh.value))
    localStorage.setItem('inactivityRestoreSession', String(restoreOnLogin.value))

    // Actualizar el manejador de inactividad
    inactivityHandler.updateDuration(inactivityMinutes.value)
    inactivityHandler.setWarningDuration(warningSeconds.value)
    inactivityHandler.setPreWarningSeconds(preWarningSeconds.value)
    inactivityHandler.setInactivityThreshold(inactivityThresholdSeconds.value)
    inactivityHandler.setSyncAcrossTabs(syncAcrossTabs.value)
    inactivityHandler.setKeepAliveRefresh(keepAliveRefresh.value)

    error.value = ''
    isSaved.value = true

    // Mostrar mensaje de éxito brevemente
    setTimeout(() => {
      isSaved.value = false
    }, 3000)

    const timeText = inactivityMinutes.value >= 60 
      ? `${Math.floor(inactivityMinutes.value / 60)} hora(s)`
      : `${inactivityMinutes.value} minuto(s)`

    showSuccess('Configuración guardada', `Sesión se cerrará después de ${timeText} de inactividad`)
  } catch (e) {
    error.value = e.message || 'Error al guardar la configuración'
    showError('Error', error.value)
  }
}

const forceWarning = () => {
  try {
    // Forzar modal final (countdown)
    inactivityHandler._showWarningInternal()
    inactivityHandler._startCountdownInternal()
    showSuccess('Advertencia forzada', 'Se forzó la modal de expiración — 30s countdown')
  } catch (e) {
    showError('Error', e.message || 'No se pudo forzar la advertencia')
  }
}

const forcePreWarning = () => {
  try {
    inactivityHandler._showPreWarningInternal()
    showSuccess('Pre‑advertencia forzada', 'Se mostró la advertencia previa (notificación)')
  } catch (e) {
    showError('Error', e.message || 'No se pudo forzar la pre‑advertencia')
  }
}

const selfTest = () => {
  try {
    const info = inactivityHandler.getDebugInfo()
    if (!info.isInitialized) {
      showError('Handler no inicializado', 'El manejador de inactividad no está inicializado. Ve a la configuración y actívalo.')
      return
    }
    const msg = `Init: ${info.isInitialized}, Enabled: ${info.isEnabled}, Inactive: ${info.isInactive}, WarningShown: ${info.isWarningShown}, Time since last activity: ${Math.round(info.timeSinceLastActivity/1000)}s`
    showSuccess('Autodiagnóstico OK', msg)
    console.table(info)
  } catch (e) {
    showError('Autodiagnóstico falló', e.message || 'Error ejecutando autodiagnóstico')
  }
}
</script>

<style scoped>
.inactivity-settings-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.settings-header svg {
  color: #60a5fa;
  flex-shrink: 0;
}

.settings-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
}

.toggle-info {
  flex: 1;
}

.toggle-info label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.toggle-description {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.toggle-control {
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.toggle-btn.enabled {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.toggle-btn.enabled:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.6);
}

.toggle-switch {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.3s ease;
}

.toggle-btn.enabled .toggle-switch {
  background: #22c55e;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.setting-description {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.setting-control {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 280px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
}

.time-input {
  width: 100px;
  padding: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.time-input::-webkit-outer-spin-button,
.time-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.time-input[type='number'] {
  -moz-appearance: textfield;
}

.time-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  width: 100%;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.preset-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(102, 126, 234, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.preset-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.preset-card.active {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  color: #60a5fa;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.preset-card.active::before {
  opacity: 1;
}

.preset-icon {
  font-size: 24px;
  line-height: 1;
}

.preset-label {
  font-weight: 600;
  font-size: 13px;
}

.preset-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.save-status {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.save-status.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.save-status.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.setting-notes {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.setting-notes h4 {
  margin: 0 0 16px 0;
  font-size: 13px;
  font-weight: 700;
  color: #60a5fa;
  text-transform: uppercase;
}

.notes-enabled p,
.notes-disabled p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.notes-enabled ul {
  margin: 0 0 12px 0;
  padding-left: 20px;
  list-style: none;
}

.notes-enabled li {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  line-height: 1.5;
}

.notes-enabled li:before {
  content: '✓ ';
  color: #22c55e;
  margin-right: 8px;
  font-weight: bold;
}

.time-info {
  background: rgba(102, 126, 234, 0.15);
  border-left: 3px solid #60a5fa;
  padding: 10px 12px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 12px;
}

.time-info strong {
  color: #60a5fa;
}

.notes-disabled {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 12px 14px;
  border-radius: 6px;
  margin: 0;
}

.notes-disabled p {
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
  }

  .setting-control {
    min-width: 100%;
  }

  .preset-grid {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  }
}
</style>
