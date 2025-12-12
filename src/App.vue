<template>
  <div class="app-bg">
    <div class="bg-media" aria-hidden="true">
      <picture>
        <img class="bg-img" src="/src/images/fondo2.jpg" alt="fondo" />
      </picture>
    </div>

    <LoadingSkeleton v-if="isInitializing" type="topbar" />

    <header v-else class="topbar" role="banner">
      <div class="container topbar-inner">
        <div class="brand" aria-label="HRAEI">
          <img src="/src/images/logo_sinfondo.png" alt="logo" class="topbar-logo" />
          <div class="brand-text">
            <div class="brand-title">HRAEI</div>
            <div class="brand-sub">Subdirección de Ingeniería Biomédica</div>
          </div>
        </div>

        <div class="topbar-actions" role="navigation" aria-label="Main navigation">
          <div class="site-title">Sistema de gestión de inventarios</div>
          <nav class="actions">
            <!-- Cuando no hay sesión mostrar links de login/register -->
            <router-link v-if="!logged" to="/login" class="top-action">Iniciar sesión</router-link>
            <router-link v-if="!logged" to="/register" class="top-action">Registrarse</router-link>

            <!-- Mostrar menú de usuario SOLO en el dashboard -->
            <div v-if="logged && isOnDashboard()" class="user-menu" ref="userMenu" @keyup.esc="closeMenu">
              <transition name="btn-float">
                <button :class="['user-btn', menuOpen ? 'open' : '']" @click="toggleMenu" :aria-expanded="menuOpen" aria-haspopup="true">
                  <span class="avatar avatar-enhanced">
                    <img v-if="avatarUrl && !avatarError" :src="avatarUrl" alt="avatar" class="top-avatar avatar-img" @error="onAvatarError" />
                    <span v-else class="avatar-fallback">👤</span>
                    <span class="avatar-status"></span>
                  </span>
                  <span class="welcome-text">{{ (user && user.nombre) || nombre || 'Usuario' }}</span>
                  <span class="chev" aria-hidden="true"></span>
                </button>
              </transition>
              <transition name="slide-down">
                <div v-if="menuOpen" class="dropdown expanded" role="menu">
                <button class="dropdown-item" @click="goToProfile">Cerrar Sesión</button>
                <button class="dropdown-item" @click="switchAccount">Añadir otra cuenta</button>
                <button class="dropdown-item" @click="resetPassword">Reestablecer Contraseña</button>
                <button class="dropdown-item" @click="goHome">Ir al inicio</button>
                <button v-if="isAdmin" class="dropdown-item admin" @click="manageUsers">
                  Gestionar Usuarios
                  <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
                </button>
                </div>
              </transition>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <main :class="['container', { 'op-embed-active': isOperationRoute(), 'dashboard-main-active': isOnDashboard() }]">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
      <!-- Mobile notifications modal (rendered globally) -->
      <MobileModal />
      
      <!-- Overlay para ventanas inactivas -->
      <InactiveWindowOverlay />
      
      <!-- Notivue: contenedor global de notificaciones elegantes -->
      <Notivue v-slot="item">
        <NotivueSwipe :item="item" :touch-only="true" :threshold="0.35" exclude="a, button">
          <Notification :item="item" :theme="nvTheme" />
        </NotivueSwipe>
      </Notivue>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
  import MobileModal from '@/components/MobileModal.vue'
  import InactiveWindowOverlay from '@/components/InactiveWindowOverlay.vue'
  import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
  import { confirmDelete, showSuccess, showError, showLoading, closeModal } from '@/utils/sweetAlertConfig'
  import { useRouter, useRoute } from 'vue-router'
  import pendingRequestsStore from '@/stores/pendingRequestsStore'
  import { validateSession, logout } from '@/utils/auth'
  // Notivue components
  import { Notivue, Notification, NotivueSwipe, slateTheme } from 'notivue'
  
  // Tema elegante y compacto para Notivue
  const nvTheme = {
    ...slateTheme,
    '--nv-width': '360px',
    '--nv-min-width': 'auto',
    '--nv-spacing': '10px',
    '--nv-y-align': 'center',
    '--nv-y-align-has-title': 'center',
    '--nv-radius': '10px',
    '--nv-border-width': '1px',
    '--nv-icon-size': '18px',
    '--nv-title-size': '0.95rem',
    '--nv-message-size': '0.95rem',
    '--nv-shadow': '0 8px 20px rgba(2,6,23,0.14)',
    '--nv-tip-width': '0px',
    '--nv-progress-height': '2px',
    '--nv-global-bg': 'rgba(255,255,255,0.95)',
    '--nv-global-fg': '#0b2540',
    '--nv-global-accent': '#2edd5a',
    '--nv-global-border': 'rgba(0,0,0,0.06)'
  }

    // Estado de sesión reactivo (alimentado desde localStorage via refreshSession)
    const nombre = ref(null)
    const role = ref(null)
    const logged = ref(false)
    const isAdmin = ref(false)
    const user = ref(null)
  const avatarError = ref(false)
  const isInitializing = ref(true)

    const route = useRoute()
    const router = useRouter()
    const menuOpen = ref(false)

    async function refreshSession(){
      try {
        // Solo validar sesión en rutas que requieren autenticación
        const name = route && route.name ? String(route.name) : ''
        const requiresAuth = dashboardRoutes.includes(name)
        
        if (!requiresAuth) {
          // Si estamos en una ruta pública (login, register, home), limpiar sesión
          logged.value = false
          nombre.value = null
          role.value = null
          user.value = null
          isAdmin.value = false
          return
        }
        
        // Solo actualizar estado, NO redirigir
        const result = await validateSession()
        if (result.authenticated && result.user) {
          logged.value = true
          nombre.value = result.user.nombre || null
          role.value = result.user.role || null
          user.value = result.user
          isAdmin.value = (role.value === 'admin')
        } else {
          logged.value = false
          nombre.value = null
          role.value = null
          user.value = null
          isAdmin.value = false
        }
      } catch { 
        logged.value = false
      }
    }

    // Intentar completar la foto del usuario consultando al backend si hace falta
    async function ensureUserFoto(){
      try {
        if (!logged.value) return
        const u = user.value
        if (!u || !u.email) return
        if (u.foto && !avatarError.value) return
        const res = await fetch('/api/auth/users')
        if (!res.ok) return
        const ct = (res.headers.get('content-type') || '').toLowerCase()
        if (!ct.includes('application/json')) return
        const rows = await res.json()
        const me = Array.isArray(rows) ? rows.find(r => r.email === u.email) : null
        if (me && me.foto) {
          const nuevo = { ...u, foto: me.foto }
          user.value = nuevo
          try { localStorage.setItem('user', JSON.stringify(nuevo)) } catch {}
          avatarError.value = false
        }
      } catch { /* ignore network errors */ }
    }

    // URL normalizada del avatar admitiendo múltiples formatos (data:, http(s), blob:, rutas locales, base64 "cruda").
    const avatarUrl = computed(() => {
      try {
        avatarError.value = false // reset ante cada recomputación
        const raw = (user.value && user.value.foto) ? user.value.foto : ''
        if (!raw) return ''
        // Si viene como objeto Buffer serializado por JSON: { type: 'Buffer', data: [...] }
        if (typeof raw === 'object' && raw && raw.type === 'Buffer' && Array.isArray(raw.data)) {
          const b64 = btoa(String.fromCharCode(...raw.data))
          return `data:image/jpeg;base64,${b64}`
        }
        const f = String(raw).trim()
        if (!f) return ''
        // JSON con { mime, data }
        if (f.startsWith('{')) {
          try {
            const parsed = JSON.parse(f)
            if (parsed && parsed.data) {
              const mime = parsed.mime || 'image/jpeg'
              return parsed.data.startsWith('data:') ? parsed.data : `data:${mime};base64,${parsed.data}`
            }
          } catch {/* ignore invalid json */}
        }
        // Si ya trae prefijo data:
        if (f.startsWith('data:')) return f
        // Prefijo no estándar base64,
        if (f.toLowerCase().startsWith('base64,')) return `data:image/jpeg;base64,${f.slice(7)}`
        // URLs absolutas o blob o rutas relativas
        if (/^https?:\/\//i.test(f) || f.startsWith('blob:') || f.startsWith('/') || f.startsWith('./') || f.startsWith('../')) return f
        // Rutas relativas "cortas" tipo uploads/..., images/..., avatar.png, etc.
        if ((/[\/\\]/.test(f) || /\.[a-zA-Z]{2,5}$/.test(f)) && /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(f)) {
          const fNorm = f.replace(/\\/g,'/')
          // Si contiene segmento uploads en cualquier parte => mapear a /api/uploads/...
          const idx = fNorm.toLowerCase().indexOf('/uploads/')
          if (idx >= 0) return `/api${fNorm.slice(idx)}`
          // Si empieza con 'uploads/...'
          if (/^uploads\//i.test(fNorm)) return `/api/${fNorm}`
          // Si es path Windows con unidad, tomar basename y asumir en /api/uploads
          if (/^[a-zA-Z]:[\/]/.test(f)) {
            const base = f.split(/[/\\]/).pop()
            if (base) return `/api/uploads/${base}`
          }
          return fNorm
        }
        // Base64 sin prefijo: inferir mime por cabecera
  const head = f.slice(0, 20)
        let mime = 'image/jpeg'
        if (head.startsWith('/9j')) mime = 'image/jpeg' // JPEG
        else if (head.startsWith('iVBOR')) mime = 'image/png' // PNG
        else if (head.startsWith('R0lGOD')) mime = 'image/gif' // GIF
  else if (head.startsWith('UklGR') || head.startsWith('RIFF')) mime = 'image/webp' // WEBP (RIFF/WebP)
        else if (head.startsWith('PHN2')) mime = 'image/svg+xml' // SVG (<svg ...)
        else if (head.startsWith('Qk')) mime = 'image/bmp' // BMP
  else if (head.startsWith('SUkq')) mime = 'image/tiff' // TIFF
        return `data:${mime};base64,${f}`
      } catch {
        return ''
      }
    })

    function onAvatarError(){
      avatarError.value = true
    }

    // Si cambia la fuente, reseteamos el estado de error para re-intentar cargar
    watch(() => user.value && user.value.foto, () => { avatarError.value = false })

  // Rutas que consideramos parte del dashboard (asegurar nombres coinciden con router.js)
  // Incluir 'forgot' y 'reset' para que la topbar global se muestre cuando
  // el flujo de recuperación de contraseña se use desde el dashboard.
  const dashboardRoutes = [
    'dashboard', 'admin-dashboard', 'admin-users', 'user-dashboard', 'forgot', 'reset',
    // Operaciones
    'op-entrada','op-salida','op-resguardo','op-servicio','op-inventario-biomedica','op-insumos-consumibles',
    'order-management', 'create-order'
  ]

  // Inicializar la topbar skeleton al cargar
  onMounted(() => {
    setTimeout(() => {
      isInitializing.value = false
    }, 800)
  })
    function isOnDashboard() {
      // route.name puede ser undefined al inicio; convertir a string seguro
      const name = route && route.name ? String(route.name) : ''
      return dashboardRoutes.includes(name)
    }

    // Devuelve true si la ruta actual corresponde a una operación (nombres que empiezan con 'op-')
    function isOperationRoute() {
      const name = route && route.name ? String(route.name) : ''
      return /^op-/.test(name)
    }

    function toggleMenu() {
      menuOpen.value = !menuOpen.value
    }

    function closeMenu() {
      menuOpen.value = false
    }

    async function goToProfile() {
      try {
        const res = await confirmDelete('Cerrar sesión', '¿Cerrar sesión? Se cerrará tu sesión actual y volverás al acceso.', 1, 'Cerrar sesión', 'Cancelar')
        if (!res.isConfirmed) return
        closeMenu()
        await logout()
        router.push({ name: 'home' })
      } catch (e) { console.error(e) }
    }

    async function switchAccount() {
      try {
        closeMenu()
        const res = await confirmDelete('Añadir cuenta', 'Añadir otra cuenta reemplazará tu sesión actual. ¿Continuar?', 1, 'Continuar', 'Cancelar')
        if (!res.isConfirmed) return
        router.push({ name: 'add-account' })
      } catch (e) { console.error(e) }
    }

    function resetPassword() {
      closeMenu()
      router.push({ name: 'forgot' })
    }

    async function goHome() {
      try {
        closeMenu()
        const res = await confirmDelete('Ir al inicio', '¿Ir al inicio? Se cerrará este panel y volverás a tu inicio.', 1, 'Ir al inicio', 'Cancelar')
        if (!res.isConfirmed) return
        router.push({ name: 'dashboard' })
      } catch (e) { console.error(e) }
    }

    function manageUsers() {
      closeMenu()
      router.push({ name: 'admin-users' })
    }

    const pendingCount = computed(() => pendingRequestsStore.totalPending.value || 0)

    // refrescar conteo al montar y cada vez que la sesión cambia (solo en rutas protegidas)
    onMounted(() => {
      const onSessionEvt = () => { 
        const name = route && route.name ? String(route.name) : ''
        const requiresAuth = dashboardRoutes.includes(name)
        if (requiresAuth) {
          try { pendingRequestsStore.refresh() } catch {}
        }
      }
      try { window.addEventListener('session:updated', onSessionEvt) } catch {}
      try { window.addEventListener('storage', onSessionEvt) } catch {}
      onSessionEvt() // Llamar una vez al montar
    })

    // Cerramos el menú cuando cambia la ruta; también refrescamos la sesión
    let refreshTimeout = null
    watch(() => route.fullPath, () => {
      menuOpen.value = false
      clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => {
        refreshSession()
        ensureUserFoto()
      }, 100)
    })

    watch(menuOpen, (val) => {
      try { document.body.classList.toggle('menu-open', val) } catch (e) { /* environment may not have body during SSR */ }
    })

    const userMenu = ref(null)

    function onDocClick(e){
      if (!menuOpen.value) return
      const el = userMenu.value
      if (!el) return
      if (!el.contains(e.target)) {
        menuOpen.value = false
      }
    }

  onMounted(() => { document.addEventListener('click', onDocClick) })
  onBeforeUnmount(() => { document.removeEventListener('click', onDocClick) })

  // Inicializar sesión al montar y escuchar eventos de actualización
  onMounted(() => {
    refreshSession()
    ensureUserFoto()
    const onSessionEvt = () => { refreshSession(); ensureUserFoto() }
    try { window.addEventListener('session:updated', onSessionEvt) } catch {}
    // En otras pestañas, el evento 'storage' sí dispara
    try { window.addEventListener('storage', onSessionEvt) } catch {}
  })
  onBeforeUnmount(() => {
    try { window.removeEventListener('session:updated', refreshSession) } catch {}
    try { window.removeEventListener('storage', refreshSession) } catch {}
  })
  
  </script>

