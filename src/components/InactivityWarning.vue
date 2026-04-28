<template>
  <!-- Advertencia de inactividad flotante - DISCRETA -->
  <Teleport to="body">
    <transition name="fade-slide">
      <div 
        v-if="showWarning" 
        class="inactivity-warning"
      >
        <div class="warning-content">

          <div class="warning-header-compact">
            <div class="timer-badge">{{ countdownSeconds }}s</div>
            <span class="warning-title">Sesión se cierra en:</span>
          </div>

          <p class="warning-message">Tu sesión se cerrará si no haces nada</p>

          <div class="countdown-display-compact">
            <div class="countdown-circle-small">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" class="countdown-bg" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  class="countdown-progress"
                  :style="{ strokeDashoffset: strokeDashoffset }"
                />
              </svg>
            </div>
          </div>

          <div class="warning-actions-compact">
            <button class="btn-continue-compact" @click="handleContinue">
              ✓ Seguiré trabajando
            </button>
            <button class="btn-logout-compact" @click="handleLogout">
              ✕ Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Indicador pasivo (otra pestaña) -->
    <div v-if="showPassive" class="inactivity-passive" role="status" aria-live="polite">
      Otra pestaña: sesión por expirar en {{ passiveSeconds }}s
    </div>


  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import inactivityHandler from '@/utils/inactivityHandler'
import { logout } from '@/utils/auth'
import { saveSessionState } from '@/utils/sessionRestore'

const showWarning = ref(false)
const countdownRemaining = ref(0)
const warningDuration = ref(60000)

const countdownSeconds = computed(() => {
  return Math.ceil(countdownRemaining.value / 1000)
})

const strokeDashoffset = computed(() => {
  const totalCircle = 2 * Math.PI * 35
  const maxSeconds = Math.max(5, Math.ceil(warningDuration.value / 1000))
  const percentage = Math.min(countdownSeconds.value, maxSeconds) / maxSeconds
  return totalCircle * (1 - percentage)
})

// Indicador pasivo (otra pestaña recibió la advertencia)
const showPassive = ref(false)
const passiveSeconds = ref(0)

const handleInactivityWarning = (event) => {
  console.log('[InactivityWarning] Warning triggered')
  showWarning.value = true
  warningDuration.value = inactivityHandler.warningDuration
  countdownRemaining.value = inactivityHandler.warningDuration
}

const handleCountdown = (event) => {
  countdownRemaining.value = inactivityHandler.countdownRemaining
}

const handleWarningDismissed = () => {
  console.log('[InactivityWarning] Warning dismissed')
  showWarning.value = false
  countdownRemaining.value = 0
}

const preWarningSecondsUI = ref(0)
const showPreWarning = ref(false)

const handlePreWarning = (event) => {
  preWarningSecondsUI.value = inactivityHandler.preWarningSeconds
  showPreWarning.value = true
  console.log('[InactivityWarning] Pre-warning shown:', preWarningSecondsUI.value)
  setTimeout(() => { showPreWarning.value = false }, 6000)
}

const handlePassiveWarning = (event) => {
  console.log('[InactivityWarning] Passive warning received')
  passiveSeconds.value = Math.ceil(inactivityHandler.countdownRemaining / 1000)
  showPassive.value = true
  setTimeout(() => { showPassive.value = false }, 5000)
}



const handleContinue = async () => {
  console.log('[InactivityWarning] Continuando sesión...')
  await inactivityHandler.keepAlive()
  // keepAlive() dispara 'warning-dismissed' que cierra la modal
}

const handleLogout = async () => {
  showWarning.value = false
  try { saveSessionState('manual') } catch (e) {}
  await logout()
  window.location.href = '/'
}

onMounted(() => {
  // Diagnóstico
  const token = localStorage.getItem('token')
  const inactivityEnabled = localStorage.getItem('inactivityEnabled') !== 'false'
  console.log('[InactivityWarning] MONTADO - hasToken:', !!token, 'enabled:', inactivityEnabled)
  console.log('[InactivityWarning] Handler state:', {
    isInitialized: inactivityHandler.isInitialized,
    isEnabled: inactivityHandler.isEnabled,
    inactivityDuration: inactivityHandler.inactivityDuration / 60000 + 'min'
  })
  
  window.addEventListener('inactivity:prewarning', handlePreWarning)
  window.addEventListener('inactivity:warning', handleInactivityWarning)
  window.addEventListener('inactivity:countdown', handleCountdown)
  window.addEventListener('inactivity:warning-dismissed', handleWarningDismissed)
  window.addEventListener('inactivity:warning-passive', handlePassiveWarning)
})

onUnmounted(() => {
  window.removeEventListener('inactivity:prewarning', handlePreWarning)
  window.removeEventListener('inactivity:warning', handleInactivityWarning)
  window.removeEventListener('inactivity:countdown', handleCountdown)
  window.removeEventListener('inactivity:warning-dismissed', handleWarningDismissed)
  window.removeEventListener('inactivity:warning-passive', handlePassiveWarning)
})
</script>

<style scoped>
/* MODAL COMPACTO Y DISCRETO */
.inactivity-warning {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  background: linear-gradient(135deg, rgba(20, 30, 48, 0.99) 0%, rgba(10, 15, 30, 0.99) 100%);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(148, 163, 184, 0.1) inset;
  backdrop-filter: blur(12px);
  padding: 0;
  max-width: 320px;
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}



.warning-content {
  padding: 14px;
  position: relative;
}

.warning-header-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.timer-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 10px;
  font-size: 18px;
  font-weight: 800;
  color: white;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
  letter-spacing: -1px;
}

.warning-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.warning-message {
  margin: 8px 0;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.7);
  text-align: center;
  line-height: 1.4;
}

.countdown-display-compact {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.countdown-circle-small {
  position: relative;
  width: 70px;
  height: 70px;
}

.countdown-circle-small svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-bg {
  fill: none;
  stroke: rgba(148, 163, 184, 0.2);
  stroke-width: 3;
}

.countdown-progress {
  fill: none;
  stroke: #ef4444;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 219.8;
  transition: stroke-dashoffset 0.1s linear;
}

.warning-actions-compact {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.btn-continue-compact,
.btn-logout-compact {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-continue-compact {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-continue-compact:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5);
  transform: translateY(-3px);
}

.btn-continue-compact:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-logout-compact {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  color: rgba(254, 202, 202, 1);
  border: 1.5px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.btn-logout-compact:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.2));
  color: rgba(254, 213, 213, 1);
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  transform: translateY(-3px);
}

.btn-logout-compact:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Transiciones */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(40px) translateY(40px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(40px) translateY(40px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(40px) translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

/* Pre-advertencia */
.inactivity-prewarning {
  position: fixed;
  bottom: 320px;
  right: 24px;
  z-index: 10002;
  background: rgba(251, 146, 60, 0.95);
  color: #1f2937;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease;
  max-width: 250px;
  text-align: center;
}

/* Indicador pasivo */
.inactivity-passive {
  position: fixed;
  bottom: 310px;
  right: 24px;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.7);
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  animation: slideIn 0.3s ease;
}

/* Responsive */
@media (max-width: 480px) {
  .inactivity-warning {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }

  .warning-header-compact {
    flex-wrap: wrap;
  }

  .timer-badge {
    width: 100%;
  }

  .warning-title {
    flex: 1;
  }

  .warning-actions-compact {
    flex-direction: column;
  }

  .btn-continue-compact,
  .btn-logout-compact {
    width: 100%;
  }

  .inactivity-prewarning {
    left: 16px;
    right: 16px;
    max-width: none;
  }

  .inactivity-passive {
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
</style>
