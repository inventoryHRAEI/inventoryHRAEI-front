<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h2>Restablecer Contraseña</h2>
        <form @submit.prevent="reset">
          <label class="field-label">Email</label>
          <div>
            <input v-model="email" placeholder="Email" type="email" required class="input" :disabled="true" />
          </div>

          <label class="field-label">Token</label>
          <div>
            <input v-model="token" placeholder="Token" required class="input" />
          </div>

          <div>
            <label class="field-label">Nueva contraseña</label>
            <div>
              <div class="password-field">
                <input v-model="password" :type="show ? 'text' : 'password'" placeholder="Nueva contraseña" required class="input" />
              </div>
            </div>
          </div>

          <div style="margin-top:14px; display:flex; gap:12px; align-items:center">
            <button type="button" class="btn secondary" style="flex:1" @click="resendCode" :disabled="sendingResend">Reenviar código</button>
            <button class="btn primary" style="flex:1" type="submit">Restablecer</button>
          </div>
        </form>
        <div class="link-row" style="margin-top:12px"><router-link to="/login">Volver a iniciar sesión</router-link></div>
        <div v-if="msg" class="msg">{{ msg }}</div>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResetComposable } from '@/composables/useReset'
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