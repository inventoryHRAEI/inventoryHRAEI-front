<template>
  <div class="form-wrap">
    <LoadingSkeleton v-if="isLoading" type="login" />
    
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
              <input v-model="email" placeholder="tu@email.com" type="email" required class="input" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="KeyIcon" class="input-icon" />
              <input v-model="password" :type="show ? 'text' : 'password'" placeholder="••••••••" required class="input" />
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
import notifier from '@/utils/notifier'
import { windowManager } from '@/utils/windowManager'
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

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 5000)
  
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE: permite que el backend establezca la cookie
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
    if (!res.ok) throw new Error(data.msg || 'Credenciales inválidas')
    
    // El token ya está en una cookie httpOnly, solo guardamos datos del usuario
    if (data.role) localStorage.setItem('role', data.role)
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
    try { window.dispatchEvent(new Event('session:updated')) } catch {}
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  }
}
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:1000px }
.remember-row{ display:flex; align-items:center; gap:8px; margin-top:10px; color:#334155; font-size:14px }
.remember-row input{ accent-color: var(--btn-green,#0a8b5b) }

@media (min-width: 1024px) {
  .form-col { width: 90%; max-width: none; }
}
</style>
