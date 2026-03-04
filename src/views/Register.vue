<template>
  <div class="form-wrap">
    <LoadingSkeleton v-if="isLoading" :type="skeletonType" />
    
    <div v-else class="form-col">
      <div class="glass">
        <Breadcrumbs :items="breadcrumbItems" />

        <div class="form-header">
          <div class="icon-circle">
            <component :is="step === 1 ? UserPlusIcon : step === 2 ? CheckCircleIcon : ShieldCheckIcon" class="form-icon" />
          </div>
          <h2>Crear Cuenta</h2>
          <p class="form-subtitle">Paso {{ step }} de 3</p>
        </div>

        <StepBubbles :currentStep="step" :bubbles="stepBubbles" />

        <form v-if="step === 1" @submit.prevent="sendToken" class="step-form">
          <p class="step-info">Ingresa tu información básica</p>
          <div class="form-group">
            <label class="field-label">Nombre Completo</label>
            <div class="input-wrapper">
              <component :is="UserIcon" class="input-icon" />
              <input v-model="nombre" placeholder="Juan Pérez" required class="input" />
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">Correo Electrónico</label>
            <div class="input-wrapper">
              <component :is="EnvelopeIcon" class="input-icon" />
              <input v-model="email" placeholder="tu@email.com" type="email" required class="input" />
            </div>
          </div>
          <button class="btn secondary btn-lg" type="submit">Enviar Código</button>
        </form>

        <form v-else-if="step === 2" @submit.prevent="verifyToken" class="step-form">
          <p class="step-info">Verifica tu correo electrónico</p>
          <p class="step-hint">Enviamos un código a {{ email }}</p>
          <div class="form-group">
            <label class="field-label">Código de Verificación</label>
            <div class="input-wrapper">
              <component :is="KeyIcon" class="input-icon" />
              <input v-model="token" placeholder="000000" type="text" maxlength="6" required class="input token-input" />
            </div>
          </div>
          <div class="row mt-8">
            <button class="btn secondary flex-1" type="submit">Verificar</button>
            <button class="btn secondary flex-1" type="button" :disabled="resendCount >= maxResends" @click="resendToken">Reenviar ({{ remainingResends }})</button>
          </div>
          <div class="mt-8 small-info">Puedes reenviar hasta {{ maxResends }} veces</div>
        </form>

        <form v-else-if="step === 3" @submit.prevent="completeRegistration" class="step-form">
          <p class="step-info">Completa tu perfil</p>
          <div class="form-group">
            <label class="field-label">Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="LockClosedIcon" class="input-icon" />
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="input" />
              <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
                <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="eye-icon" />
              </button>
            </div>
            <small class="pwd-hint">Min. 8 caracteres, mayúscula, minúscula, número y símbolo</small>
          </div>
          <div class="form-group">
            <label class="field-label">Confirmar Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="LockClosedIcon" class="input-icon" />
              <input v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="••••••••" required class="input" />
              <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm">
                <component :is="showConfirm ? EyeSlashIcon : EyeIcon" class="eye-icon" />
              </button>
            </div>
          </div>
          <button class="btn secondary btn-lg" type="submit">Crear Cuenta</button>
        </form>

        <div class="link-row mt-12">
          <router-link to="/login" class="link-item">
            <component :is="ArrowLeftIcon" class="link-icon" />
            Volver a iniciar sesión
          </router-link>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import notifier from '@/utils/notifier'
import { showAlert } from '@/utils/sweetAlertConfig'
import { EyeIcon, EyeSlashIcon, UserPlusIcon, CheckCircleIcon, ShieldCheckIcon, UserIcon, EnvelopeIcon, KeyIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import StepBubbles from '@/components/StepBubbles.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const stepBubbles = [
  { title: 'Información', desc: 'Datos básicos' },
  { title: 'Verificación', desc: 'Confirma tu email' },
  { title: 'Perfil', desc: 'Completa tu cuenta' }
]

const breadcrumbItems = [
  { label: 'Inicio', to: '/login' },
  { label: 'Registro', to: '/register' }
]

const isLoading = ref(true)
const skeletonType = ref('register')

function updateSkeletonType() {
  skeletonType.value = window.innerWidth >= 1024 ? 'hero' : 'register'
}

onMounted(() => {
  updateSkeletonType()
  window.addEventListener('resize', updateSkeletonType)
  setTimeout(() => {
    isLoading.value = false
    window.removeEventListener('resize', updateSkeletonType)
  }, 800)
})

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})

const nombre = ref('')
const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const step = ref(1)
const resendCount = ref(0)
const maxResends = 4
const router = useRouter()
const showPassword = ref(false)
const showConfirm = ref(false)

const remainingResends = computed(() => Math.max(0, maxResends - resendCount.value))

async function parseJsonSafe(res){
  try{
    const text = await res.text()
    if(!text) return {}
    return JSON.parse(text)
  }catch{
    return {}
  }
}

const sendToken = async () => {
  error.value = ''
  if (!nombre.value || !email.value) {
    notifier.error('Nombre y email son obligatorios')
    return
  }
  try {
    const res = await fetch('/api/auth/request-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.value, email: email.value })
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar')
    notifier.success('Token enviado. Revisa tu correo.')
    step.value = 2
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  }
}

const verifyToken = async () => {
  error.value = ''
  if (!token.value) {
    notifier.error('Ingresa el token')
    return
  }
  try {
    const res = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, token: token.value })
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar')
    notifier.success('Email verificado. Completa tu cuenta.')
    step.value = 3
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  }
}

const resendToken = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/auth/resend-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar')
    resendCount.value += 1
    notifier.success(data.msg || 'Token reenviado')
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  }
}



const completeRegistration = async () => {
   error.value = ''
   if (!password.value || !confirmPassword.value) {
     notifier.error('Completa las contraseñas')
     return
   }
   if (password.value !== confirmPassword.value) {
     notifier.error('Las contraseñas no coinciden')
     return
   }
   const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
   if (!strong.test(password.value)) {
     notifier.error('Contraseña débil.')
     return
   }

   try {
     const res = await fetch('/api/auth/complete-registration', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         email: email.value, 
         nombre: nombre.value, 
         password: password.value
       })
     })
     const data = await parseJsonSafe(res)
     if (!res.ok) throw new Error(data.msg || 'No se pudo conectar')

    // Si backend indica que la cuenta queda en pending, mostrar swal informativo
    if (data && data.pending) {
      await showAlert({ icon: 'info', title: 'Cuenta pendiente', text: 'Tu cuenta está pendiente de validación por un administrador. Te avisaremos por correo cuando sea aprobada.', confirmButtonText: 'Aceptar' })
    } else {
      notifier.success(data.msg || 'Registro completado')
    }

     await navigateAndRefresh(router, { name: 'login' })
   } catch (e) {
     error.value = e.message
     notifier.error(e.message)
   }
 }
</script>

<style scoped>
.form-wrap { display: flex; align-items: center; justify-content: center; min-height: 60vh }
.form-col { width: 100%; max-width: 1000px }

@media (min-width: 1024px) {
  .form-col { width: 90%; max-width: none; }
}
</style>
