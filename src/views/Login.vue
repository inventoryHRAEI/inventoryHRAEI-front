<template>
  <div class="form-wrap">
    <LoadingSkeleton v-if="isLoading" :type="skeletonType" />
    
    <div v-else class="form-col">
      <div class="glass">
        <Breadcrumbs :items="breadcrumbItems" />

        <div class="form-header">
          <div class="icon-circle">
            <component :is="isAddAccount ? PlusIcon : LockClosedIcon" class="form-icon" />
          </div>
          <h2>{{ isAddAccount ? 'Añadir otra cuenta' : 'Iniciar Sesión' }}</h2>
          <p class="form-subtitle">{{ isAddAccount ? 'Completa tus credenciales' : 'Bienvenido al sistema' }}</p>
        </div>

        <form @submit.prevent="login">
          <div class="form-group">
            <label class="field-label">Correo Electrónico</label>
            <div class="input-wrapper">
              <component :is="EnvelopeIcon" class="input-icon" />
              <input v-model="email" v-sanitize:email placeholder="tu@email.com" type="email" required class="input" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="KeyIcon" class="input-icon" />
              <input v-model="password" v-sanitize:password :type="show ? 'text' : 'password'" placeholder=" • • • • • • • •" required class="input" />
              <button type="button" class="toggle-eye" @click="show = !show" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show">
                <transition name="eye" mode="out-in">
                  <component :is="show ? EyeSlashIcon : EyeIcon" class="eye-icon" :key="show ? 'off' : 'on'" aria-hidden="true" />
                </transition>
              </button>
            </div>
          </div>

          <label class="remember-row">
            <input type="checkbox" v-model="remember" />
            <span>Recordar usuario</span>
          </label>

          <button class="btn secondary btn-lg" type="submit">Entrar</button>
        </form>

        <div class="divider">o</div>

        <div class="link-row">
          <router-link to="/forgot" class="link-item">
            <component :is="QuestionMarkCircleIcon" class="link-icon" />
            ¿Olvidaste tu contraseña?
          </router-link>
          <router-link v-if="!isAddAccount" to="/register" class="link-item">
            <component :is="UserPlusIcon" class="link-icon" />
            Registrarse
          </router-link>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import notifier from '@/utils/notifier'
import { windowManager } from '@/utils/windowManager'
import { saveToken } from '@/utils/auth.js'
import { showAlert } from '@/utils/sweetAlertConfig'
import { peekSessionState, peekWizardState, peekPanelState, hasWizardDrafts, peekDraftRoute, clearSessionState, clearWizardState, clearPanelState, clearWizardDrafts, syncRemoteDraftsToLocal, clearRemoteWizardDrafts, saveWizardState, promoteBackupsIfNeeded } from '@/utils/sessionRestore'
import { EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon, KeyIcon, PlusIcon, QuestionMarkCircleIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const breadcrumbItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Iniciar Sesión', to: '/login' }
]

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const show = ref(false)
const route = useRoute()
const isAddAccount = computed(() => route.name === 'add-account')
const remember = ref(false)

const isLoading = ref(true)
const skeletonType = ref('login')

const ROUTE_LABELS = {
  'order-management': 'la gestión de órdenes de entrada',
  'order-management-salida': 'la gestión de órdenes de salida',
  'order-management-resguardo': 'la gestión de órdenes de resguardo',
  'order-management-servicio': 'la gestión de órdenes de servicio',
  'op-inventario-biomedica': 'el inventario biomédico',
  'op-propuestas': 'el módulo de propuestas',
  'op-insumos-consumibles': 'el módulo de insumos y consumibles',
  dashboard: 'el panel principal'
}

function formatOrderTypeLabel(raw) {
  const value = String(raw || '').toLowerCase()
  if (value.includes('salida')) return 'salida'
  if (value.includes('resguardo')) return 'resguardo'
  if (value.includes('servicio')) return 'servicio'
  if (value.includes('entrada')) return 'entrada'
  return ''
}

function labelFromPath(path) {
  const value = String(path || '')
  if (value.includes('/op/order-management-salida')) return ROUTE_LABELS['order-management-salida']
  if (value.includes('/op/order-management-resguardo')) return ROUTE_LABELS['order-management-resguardo']
  if (value.includes('/op/order-management-servicio')) return ROUTE_LABELS['order-management-servicio']
  if (value.includes('/op/order-management')) return ROUTE_LABELS['order-management']
  if (value.includes('/op/inventario-biomedica')) return ROUTE_LABELS['op-inventario-biomedica']
  if (value.includes('/op/propuestas')) return ROUTE_LABELS['op-propuestas']
  if (value.includes('/op/insumos-consumibles')) return ROUTE_LABELS['op-insumos-consumibles']
  if (value.includes('/dashboard')) return ROUTE_LABELS.dashboard
  return ''
}

function getRestoreLabel(restoreState, wizardState, panelState, draftRoute) {
  if (panelState && panelState.panel === 'archived-folios') {
    const typeLabel = formatOrderTypeLabel(panelState.orderType || panelState.type)
    return typeLabel ? `el panel de folios archivados de ${typeLabel}` : 'el panel de folios archivados'
  }

  if (wizardState && wizardState.type) {
    const typeLabel = formatOrderTypeLabel(wizardState.type)
    return typeLabel ? `el formulario de nueva orden de ${typeLabel}` : 'el formulario de nueva orden'
  }

  const routeName = wizardState?.routeName || panelState?.routeName || draftRoute?.routeName
  if (routeName && ROUTE_LABELS[String(routeName)]) return ROUTE_LABELS[String(routeName)]

  const path = restoreState?.fullPath || restoreState?.route || ''
  const pathLabel = labelFromPath(path)
  return pathLabel || 'la pantalla anterior'
}

function updateSkeletonType() {
  skeletonType.value = window.innerWidth >= 1024 ? 'hero' : 'login'
}

onMounted(() => {
  updateSkeletonType()
  window.addEventListener('resize', updateSkeletonType)
  setTimeout(() => {
    isLoading.value = false
    window.removeEventListener('resize', updateSkeletonType)
  }, 800)
  // ...existing code...
  try {
    const remembered = localStorage.getItem('rememberedEmail')
    if (remembered) { email.value = remembered; remember.value = true }
  } catch {}
})

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
  
  try {
    const remembered = localStorage.getItem('rememberedEmail')
    if (remembered) { email.value = remembered; remember.value = true }
  } catch {}
})

const login = async () => {
   error.value = ''
   
   // Verificar si ya hay una ventana activa antes de hacer login
   const activeWindowId = localStorage.getItem('activeWindowId')
   const currentWindowId = sessionStorage.getItem('windowId')
   
   if (activeWindowId && activeWindowId !== currentWindowId) {
     // Verificar si la ventana activa sigue viva
     const lastHeartbeat = localStorage.getItem('activeWindowHeartbeat')
     if (lastHeartbeat) {
       const timeSinceHeartbeat = Date.now() - parseInt(lastHeartbeat)
       if (timeSinceHeartbeat < 3000) { // Ventana activa detectada en los últimos 3 segundos
         error.value = 'Ya existe una sesión activa en otra ventana. Cierra esa ventana primero.'
         notifier.error(error.value)
         return
       }
     }
   }
   
   try {
     // sanitize before sending
     const { sanitizeObject } = await import('@/utils/sanitizer.js')
     const bodyData = sanitizeObject({ email: email.value, password: password.value })

     const res = await fetch('/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       credentials: 'include', // IMPORTANTE: permite que el backend establezca la cookie
       body: JSON.stringify(bodyData)
     })
     let data
     try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
     if (!res.ok) throw new Error(data.msg || 'Credenciales inválidas')
     
     // Guardar el token devuelto por el backend para futuras peticiones
     if (data.token) {
       saveToken(data.token)
     } else {
       console.error('[login] ❌ El backend no devolvió token:', data)
     }
     
     // Guardar datos del usuario
     if (data.role) {
        localStorage.setItem('role', data.role)
        // También establecer variable global para acceso rápido
        if (typeof window !== 'undefined') {
          window.__USER_ROLE__ = data.role
        }
      }
     if (data.nombre) localStorage.setItem('nombre', data.nombre)
     if (data.email) localStorage.setItem('email', data.email)
     const usuario = { nombre: data.nombre, role: data.role, email: data.email, foto: data.foto }
     localStorage.setItem('user', JSON.stringify(usuario))
     
     // Guardar o limpiar el email recordado
     try {
       if (remember.value) localStorage.setItem('rememberedEmail', email.value)
       else localStorage.removeItem('rememberedEmail')
     } catch {}
     
     // Marcar esta ventana como la activa
     try {
       console.log('login: reclamando este window como activo')
       windowManager.setAsActive()
       // Si esta ventana fue abierta por script desde otra, intentar cerrar la ventana que abrió este (opener)
       try {
         if (window.opener && typeof window.opener.close === 'function') {
           console.log('Cerrando la ventana que abrió este login (opener)')
           window.opener.close()
         }
       } catch (err) {
         console.warn('No se pudo cerrar la ventana opener:', err)
       }
     } catch (e) { console.warn('windowManager no disponible', e) }
     notifier.success('Sesión iniciada')
     
     // === SOLUCIÓN: Forzar actualización de sesión ANTES de navegar ===
     console.log('[Login] 🔔 Forzando sincronización de sesión')
     
     // 1. Guardar datos en variables globales para acceso directo
     window.__sessionUser = usuario
     window.__sessionToken = data.token
     
     // 2. Disparar evento de actualización de sesión
     window.dispatchEvent(new Event('session:updated'))
     
     // 3. También dispara storage event para otras pestañas
     try { localStorage.setItem('__sessionSync', Date.now().toString()) } catch {}
     
     // 4. Esperar a que Vue procese los cambios (increased from 150ms to allow proper state update)
     await new Promise(resolve => setTimeout(resolve, 300))
     
     console.log('[Login] ✅ Sesión sincronizada, intentando navegar...')
     
     // Preguntar si desea restaurar la sesion previa (si existe)
     const restoreEnabled = localStorage.getItem('inactivityRestoreSession') !== 'false'
     if (restoreEnabled) {
      try { await syncRemoteDraftsToLocal() } catch {}
      try { promoteBackupsIfNeeded() } catch (e) { console.warn('[Login] promoteBackupsIfNeeded failed', e) }
     }
     const restoreState = restoreEnabled ? peekSessionState() : null
     const wizardState = restoreEnabled ? peekWizardState() : null
     const panelState = restoreEnabled ? peekPanelState() : null
     const hasDrafts = restoreEnabled ? hasWizardDrafts() : false

    const draftRoute = restoreEnabled ? peekDraftRoute() : null

    // Guardar flags de restauración en session/local storage si existen drafts locales
    try {
      const hasResguardoDraft = !!localStorage.getItem('wizardDraft:resguardo')
      const hasSalidaDraft = !!localStorage.getItem('wizardDraft:salida')
      const hasServicioDraft = !!localStorage.getItem('wizardDraft:servicio')
      if (hasResguardoDraft) sessionStorage.setItem('restoreWizard', 'resguardo')
      if (hasSalidaDraft) sessionStorage.setItem('restoreWizard', 'salida')
      if (hasServicioDraft) sessionStorage.setItem('restoreWizard', 'servicio')
      if (hasResguardoDraft || hasSalidaDraft || hasServicioDraft) {
        try { localStorage.setItem('forceRestore', 'true') } catch (e) {}
      }
    } catch (e) {}

    // Solo mostrar el prompt de restauración si hay algo significativo que restaurar
    // Si la última ruta fue el dashboard y NO hay borradores de wizards, omitimos el prompt
    const lastRouteName = wizardState?.routeName || panelState?.routeName || draftRoute?.routeName || (restoreState?.fullPath ? String(router.resolve(restoreState.fullPath)?.name || '') : '')
    const isDashboardOnly = lastRouteName === 'dashboard' && !hasDrafts && !wizardState && (!panelState || panelState.panel !== 'archived-folios')

    if (restoreEnabled && (restoreState || wizardState || panelState || hasDrafts || draftRoute) && !isDashboardOnly) {
       const label = getRestoreLabel(restoreState, wizardState, panelState, draftRoute)
      const result = await showAlert({
          title: '¿Deseas continuar donde te quedaste?',
          text: label ? `Detectamos que estabas en ${label}. ¿Deseas continuar con tu progreso?` : 'Detectamos una sesión anterior. ¿Deseas continuar con tu progreso?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'No, empezar de nuevo',
          confirmButtonColor: '#22c55e',
          cancelButtonColor: 'rgba(255, 255, 255, 0.08)'
        })

       if (result && result.isConfirmed) {
         if (restoreState?.fullPath) {
           try {
             const resolved = router.resolve(restoreState.fullPath)
             const intentName = resolved && resolved.name ? String(resolved.name) : ''
             if (intentName) localStorage.setItem('restoreIntentRoute', intentName)
           } catch {}
           await navigateAndRefresh(router, restoreState.fullPath)
           // Emitir evento para que los wizards reintenten aplicar los drafts si hubo carrera
           try { window.dispatchEvent(new Event('restore:applyDrafts')) } catch {}
           return
         }
         if (panelState?.routeName) {
           try { localStorage.setItem('restoreIntentRoute', String(panelState.routeName)) } catch {}
           await navigateAndRefresh(router, { name: panelState.routeName })
           try { window.dispatchEvent(new Event('restore:applyDrafts')) } catch {}
           return
         }
         if (wizardState?.routeName) {
           try { localStorage.setItem('restoreIntentRoute', String(wizardState.routeName)) } catch {}
           await navigateAndRefresh(router, { name: wizardState.routeName })
           try { window.dispatchEvent(new Event('restore:applyDrafts')) } catch {}
           return
         }
         if (draftRoute?.routeName) {
           try { 
             saveWizardState({ routeName: draftRoute.routeName, type: draftRoute.key || '' })
             localStorage.setItem('restoreIntentRoute', String(draftRoute.routeName)) 
           } catch {}
           await navigateAndRefresh(router, { name: draftRoute.routeName })
           try { window.dispatchEvent(new Event('restore:applyDrafts')) } catch {}
           return
         }
       } else {
         clearSessionState()
         clearWizardState()
         clearPanelState()
         clearWizardDrafts()
         try { localStorage.removeItem('restoreIntentRoute') } catch {}
         try { await clearRemoteWizardDrafts() } catch {}
       }
     } else if (!restoreEnabled) {
       clearSessionState()
       clearWizardState()
       clearPanelState()
       clearWizardDrafts()
       try { localStorage.removeItem('restoreIntentRoute') } catch {}
       try { await clearRemoteWizardDrafts() } catch {}
     }

     // Navegar
     const nextTarget = typeof route.query?.next === 'string' ? String(route.query.next) : ''
     const safeNext = nextTarget && nextTarget.startsWith('/') ? nextTarget : ''
     
     if (safeNext) {
       await navigateAndRefresh(router, safeNext)
     } else {
       await navigateAndRefresh(router, { name: 'dashboard' })
     }
   } catch (e) {
     error.value = e.message
     notifier.error(e.message)
   }
 }
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:1000px }
.remember-row{ display:flex; align-items:center; gap:8px; margin-top:10px; color:rgba(255, 255, 255, 0.85); font-size:14px }
.remember-row input{ accent-color: var(--btn-green,#0a8b5b) }

@media (min-width: 1024px) {
  .form-col { width: 90%; max-width: none; }
}
</style>
