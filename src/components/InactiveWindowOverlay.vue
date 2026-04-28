<template>
  <div v-if="showInactive" class="inactive-overlay">
    <div class="inactive-card">
      <div class="inactive-icon">🔒</div>
      <h2 v-if="!forceCloseMode">Tu sesión se cerró</h2>
      <h2 v-else>Sesión duplicada detectada</h2>
      <p v-if="!forceCloseMode">Se detectó una sesión activa en otra ventana.</p>
      <p v-else>Se detectó que esta cuenta inició sesión en otra ventana. Por seguridad, debes cerrar esta pestaña.</p>
      <p v-if="!forceCloseMode" class="inactive-hint">Esta ventana cerró sesión automáticamente. Puedes iniciar sesión de nuevo o usar la ventana donde ya tienes sesión abierta.</p>
      <p v-else class="inactive-hint">Haz clic en "Cerrar esta pestaña" para terminar la sesión en esta ventana y mantener la seguridad.</p>
      <div class="inactive-actions">
        <template v-if="!forceCloseMode">
          <button class="btn secondary" @click="goHome">Ir al inicio</button>
          <button class="btn primary" @click="goLogin">Iniciar sesión</button>
        </template>
        <template v-else>
          <button class="btn primary" @click="closeThisTab">Cerrar esta pestaña</button>
        </template>
      </div>
      <div v-if="manualCloseRequired" class="manual-close-msg">No fue posible cerrar automáticamente esta pestaña. Por favor, ciérrala manualmente o usa Ctrl+W (Cmd+W en Mac).</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import { windowManager } from '@/utils/windowManager'
import { clearStoredSessionData } from '@/utils/auth'

const router = useRouter()
const showInactive = ref(false)
const forceCloseMode = ref(false)
const manualCloseRequired = ref(false)

async function handleInactive() {
  // Hacer logout REAL en el backend para eliminar la cookie
  showInactive.value = true
  
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    
    // Notificar a la ventana activa que esta ventana cerró sesión en backend
    windowManager.notifySecondaryLogout()
  } catch (error) {
    console.error('Error en logout automático:', error)
  }
  
  clearStoredSessionData()
  
  // Redirigir a login después de mostrar el mensaje
  setTimeout(() => {
    if (router.currentRoute.value.path !== '/login') {
      navigateAndRefresh(router, '/login')
    }
  }, 1500) // 1.5 segundos para que lean el mensaje
}

function handleForceCloseEvent() {
  // Mostrar overlay en modo forzado — NO hacer logout en backend
  console.log('window:force-close recibido — forzando overlay de cierre de pestaña')
  forceCloseMode.value = true
  showInactive.value = true
  // Opcional: limpiar datos locales para evitar mostrar información
  try { clearStoredSessionData() } catch {}
}

async function closeThisTab() {
  // Intentar cerrar la pestaña; si falla, navegar a una página neutral y pedir cierre manual
  console.log('Intentando cerrar la pestaña...')
  try {
    // Si esta ventana tiene un opener (fue abierta por otra ventana), pedir al opener que cierre esta pestaña
    if (window.opener && typeof window.opener.close === 'function') {
      try {
        window.opener.close()
      } catch (e) {
        // ignore
      }
    }

    // Intentar cerrar directamente la ventana actual
    window.close()
    // Si sigue abierta, abrir blank y cerrar
      setTimeout(() => {
        try {
          window.open('', '_self')
          window.close()
        } catch (e) {
          // Fallback: indicar que el cierre debe ser manual
          manualCloseRequired.value = true
        }
      }, 200)
  } catch (e) {
    console.error('No se pudo cerrar la pestaña:', e)
    manualCloseRequired.value = true
  }
}

function handleActivated() {
  showInactive.value = false
  forceCloseMode.value = false
  manualCloseRequired.value = false
}

function handleLogout() {
  showInactive.value = false
  forceCloseMode.value = false
  manualCloseRequired.value = false
  clearStoredSessionData()
  navigateAndRefresh(router, '/login')
}

function goHome() {
  showInactive.value = false
  forceCloseMode.value = false
  manualCloseRequired.value = false
  navigateAndRefresh(router, '/')
}

function goLogin() {
  showInactive.value = false
  forceCloseMode.value = false
  manualCloseRequired.value = false
  navigateAndRefresh(router, '/login')
}

onMounted(() => {
  // DESACTIVADO: la lógica de ventana inactiva causaba loops infinitos
  // if (!windowManager.isActiveWindow()) {
  //   handleInactive()
  // }

  window.addEventListener('window:inactive', handleInactive)
  window.addEventListener('window:activated', handleActivated)
  window.addEventListener('window:force-close', handleForceCloseEvent)
  window.addEventListener('window:logout', handleLogout)
})

onBeforeUnmount(() => {
  window.removeEventListener('window:inactive', handleInactive)
  window.removeEventListener('window:activated', handleActivated)
  window.removeEventListener('window:force-close', handleForceCloseEvent)
  window.removeEventListener('window:logout', handleLogout)
})
</script>

<style scoped>
.inactive-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.inactive-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.inactive-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.inactive-card h2 {
  margin: 0 0 16px 0;
  color: #0b2540;
  font-size: 24px;
  font-weight: 800;
}

.inactive-card p {
  margin: 0 0 12px 0;
  color: #334155;
  font-size: 16px;
  line-height: 1.5;
}

.inactive-hint {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

.inactive-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.manual-close-msg {
  margin-top: 12px;
  color: #b91c1c; /* red */
  font-size: 14px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn.primary {
  background: linear-gradient(90deg, #0a8b5b, #00a5ff);
  color: white;
  box-shadow: 0 4px 12px rgba(10, 139, 91, 0.3);
}

.btn.primary:hover {
  box-shadow: 0 6px 20px rgba(10, 139, 91, 0.4);
}
</style>
