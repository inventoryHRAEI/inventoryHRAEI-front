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

        <StepBubbles :steps="stepBubbles" :current-step="2" />

        <form @submit.prevent="reset">
          <div class="form-group">
            <label class="field-label">Correo Electrónico</label>
            <div class="input-wrapper">
              <component :is="EnvelopeIcon" class="input-icon" />
              <input v-model="email" placeholder="tu@email.com" type="email" required class="input" :disabled="true" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Código de Verificación</label>
            <div class="input-wrapper">
              <component :is="KeyIcon" class="input-icon" />
              <input v-model="token" placeholder="000000" type="text" required class="input" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Nueva Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="LockClosedIcon" class="input-icon" />
              <input v-model="password" :type="show ? 'text' : 'password'" placeholder="••••••••" required class="input" />
              <button type="button" class="toggle-eye" @click="show = !show">
                <component :is="show ? EyeSlashIcon : EyeIcon" class="eye-icon" />
              </button>
            </div>
            <small class="pwd-hint">Min. 8 caracteres, mayúscula, minúscula, número y símbolo</small>
          </div>

          <div class="row mt-14">
            <button type="button" class="btn secondary flex-1" @click="resendCode" :disabled="sendingResend">
              <component :is="ArrowPathIcon" class="btn-icon" />
              Reenviar
            </button>
            <button class="btn primary flex-1" type="submit">
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

        <div v-if="msg" class="msg">{{ msg }}</div>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useResetComposable } from '@/composables/useReset'
import { LockOpenIcon, EnvelopeIcon, KeyIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import StepBubbles from '@/components/StepBubbles.vue'

const isLoading = ref(true)

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
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})

const { email, token, password, msg, error, show, sendingResend, resendCode, reset } = useResetComposable()
</script>

<style scoped>
/* Reuse styles from Reset.vue (kept minimal since global styles exist) */
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:72vh; padding:24px }
.form-col{ width:100%; max-width:420px }
.glass{ background: rgba(255,255,255,0.08); backdrop-filter: blur(8px); border-radius:14px; padding:20px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06) }
.link-row{ text-align:center }
.msg{ margin-top:10px; color:green; text-align:center }
.error{ margin-top:10px; color:#b00020; text-align:center }
</style>