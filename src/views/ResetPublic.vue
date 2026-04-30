<template>
  <div class="form-wrap">
    <LoadingSkeleton v-if="isLoading" type="reset" />
    
    <div v-else class="form-col">
      <div class="glass">
        <Breadcrumbs :items="breadcrumbItems" />

        <div class="form-header">
          <div class="icon-circle">
            <component :is="LockOpenIcon" class="form-icon" />
          </div>
          <h2>Restablecer Contraseña</h2>
          <p class="form-subtitle">Crea una nueva contraseña segura</p>
        </div>

        <StepBubbles :bubbles="stepBubbles" :current-step="2" />

        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label class="field-label">Correo Electrónico</label>
            <div class="input-wrapper">
              <component :is="EnvelopeIcon" class="input-icon" />
              <input v-model="formEmail" placeholder="tu@email.com" type="email" required class="input" :disabled="true" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Código de Verificación</label>
            <div class="input-wrapper">
              <component :is="KeyIcon" class="input-icon" />
              <input v-model="formToken" placeholder="000000" type="text" required class="input" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Nueva Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="LockClosedIcon" class="input-icon" />
              <input v-model="formPassword" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="input" />
              <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
                <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="eye-icon" />
              </button>
            </div>
            <small class="pwd-hint">Min. 8 caracteres, mayúscula, minúscula, número y símbolo</small>
          </div>

          <div class="row mt-14">
            <button type="button" class="btn secondary flex-1" @click="handleResend" :disabled="isResending">
              <component :is="ArrowPathIcon" class="btn-icon" />
              Reenviar
            </button>
            <button class="btn primary flex-1" type="submit" :disabled="isSubmitting">
              <component :is="CheckCircleIcon" class="btn-icon" />
              Restablecer
            </button>
          </div>
        </form>

        <div class="link-row mt-12">
          <router-link to="/login" class="link-item">
            <component :is="ArrowLeftIcon" class="link-icon" />
            Volver a iniciar sesión
          </router-link>
        </div>

        <div v-if="successMsg" class="msg">{{ successMsg }}</div>
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockOpenIcon, EnvelopeIcon, KeyIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import StepBubbles from '@/components/StepBubbles.vue'
import notifier from '@/utils/notifier'

const isLoading = ref(true)
const showPassword = ref(false)
const isResending = ref(false)
const isSubmitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const formEmail = ref('')
const formToken = ref('')
const formPassword = ref('')

const route = useRoute()
const router = useRouter()

const breadcrumbItems = [
  { label: 'Inicio', to: '/login' },
  { label: 'Recuperar Contraseña', to: '/forgot' },
  { label: 'Restablecer Contraseña', to: '/reset' }
]

const stepBubbles = [
  { title: 'Verificación', desc: 'Confirma tu código' },
  { title: 'Contraseña', desc: 'Nueva contraseña' },
  { title: 'Listo', desc: 'Restablecer cuenta' }
]

onMounted(() => {
  try {
    if (route?.query?.email) formEmail.value = route.query.email
  } catch (e) {
    console.error('[ResetPublic] Error loading query params:', e)
  }
  isLoading.value = false
})

const handleResend = async () => {
  if (!formEmail.value) {
    notifier.error('Ingresa tu correo primero')
    return
  }
  
  isResending.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const res = await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formEmail.value })
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Error reenviando código')
    
    successMsg.value = data.msg || 'Código reenviado. Revisa tu correo.'
    notifier.success(successMsg.value)
  } catch (e) {
    errorMsg.value = e.message
    notifier.error(e.message)
  } finally {
    isResending.value = false
  }
}

const handleReset = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!formEmail.value || !formToken.value || !formPassword.value) {
    const err = 'Todos los campos son obligatorios'
    errorMsg.value = err
    notifier.error(err)
    return
  }
  
  isSubmitting.value = true
  
  try {
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formEmail.value,
        token: formToken.value,
        password: formPassword.value
      })
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Error al restablecer contraseña')
    
    successMsg.value = 'Contraseña actualizada. Redirigiendo a login...'
    notifier.success(successMsg.value)
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (e) {
    errorMsg.value = e.message
    notifier.error(e.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Responsive form styling */
.form-wrap{ 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  min-height: 72vh; 
  padding: 24px 16px;
}

.form-col{ 
  width: 100%; 
  max-width: 480px;
}

/* Desktop styles */
@media (min-width: 768px) {
  .form-wrap {
    padding: 24px 32px;
  }
  
  .form-col {
    max-width: 520px;
  }
}

/* Large desktop styles */
@media (min-width: 1024px) {
  .form-col {
    max-width: 580px;
  }
}

/* Mobile styles */
@media (max-width: 480px) {
  .form-wrap {
    padding: 16px 12px;
    min-height: 70vh;
  }
  
  .form-col {
    max-width: 100%;
  }
}

.link-row{ text-align:center }
.msg{ margin-top:10px; color:green; text-align:center }
.error{ margin-top:10px; color:#b00020; text-align:center }
</style>
