<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h2>Restablecer Contraseña</h2>
        <!-- (preview toggle removed) -->
        <form @submit.prevent="reset">
          <!-- Email bloqueado en paso 2 -->
            <label class="field-label">Email</label>
            <div>
              <input v-model="email" placeholder="Email" type="email" required class="input" :disabled="true" />
            </div>

      <label class="field-label">Código</label>
      <div>
        <input v-model="token" placeholder="Código" required class="input" />
      </div>

          <div>
            <label class="field-label">Nueva contraseña</label>
            <div>
              <div class="password-field">
                <input v-model="password" :type="show ? 'text' : 'password'" placeholder="Nueva contraseña" required class="input" />
                <button type="button" class="toggle-eye" @click="show = !show" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show">
                  <transition name="eye" mode="out-in">
                    <component :is="show ? EyeSlashIcon : EyeIcon" class="eye-icon" :key="show ? 'off' : 'on'" aria-hidden="true" />
                  </transition>
                </button>
              </div>
            </div>
          </div>

          <!-- Botones en la misma fila: Reenviar (izq) y Restablecer (der) -->
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import notifier from '@/utils/notifier'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const email = ref('')
const token = ref('')
const password = ref('')
const msg = ref('')
const error = ref('')
const show = ref(false)
// preview removed

const route = useRoute()

const router = useRouter()

const sendingResend = ref(false)

const resendCode = async () => {
  if (!email.value) return
  sendingResend.value = true
  try {
    const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value }) })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
    if (!res.ok) throw new Error(data.msg || 'Error reenviando código')
    if (data && data.token) token.value = data.token
    msg.value = (data && data.msg) || 'Código reenviado. Revisa tu correo.'
  notifier.success(msg.value)
  } catch (e) {
    error.value = e.message
  notifier.error(e.message)
  } finally {
    sendingResend.value = false
  }
}

onMounted(() => {
  // Prefill desde query params si vienen (usado en modo dev cuando /forgot redirige)
  if (route && route.query) {
    if (route.query.email) email.value = route.query.email
    if (route.query.token) token.value = route.query.token
  }
})

const reset = async () => {
  msg.value = ''
  error.value = ''
  if (!email.value || !token.value || !password.value) { notifier.error('Todos los campos son obligatorios'); return }
  try {
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value, token: token.value, password: password.value }) })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
    if (!res.ok) throw new Error(data.msg || 'Error al restablecer contraseña')
    msg.value = 'Contraseña actualizada, inicia sesión.'
  notifier.success(msg.value)
    // Redirigir al login
    router.push({ path: '/login' })
  } catch (e) {
    error.value = e.message
  notifier.error(e.message)
  }
}
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:72vh; padding:24px }
.form-col{ width:100%; max-width:420px }
.glass{ background: rgba(255,255,255,0.08); backdrop-filter: blur(8px); border-radius:14px; padding:20px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06) }
.title{ font-size:20px; font-weight:700; margin:0 0 12px 0; color:#023e2a }
.form-card{ display:flex; flex-direction:column; gap:16px }
  /* Use global .password-field and .toggle-eye styles from frontend/src/styles.css
    to keep consistent password input appearance across the app. Local overrides
    were removed so Reset.vue inherits the shared design tokens. */
.btn.ghost{ background:transparent; border:1px solid rgba(0,0,0,0.08); color:#0b6b4a }
.btn.primary.full{ width:100%; padding:12px; font-weight:700 }
.muted{ color:#666; font-size:0.9em }
.link-row{ text-align:center }
.msg{ margin-top:10px; color:green; text-align:center }
.error{ margin-top:10px; color:#b00020; text-align:center }

/* Labels e inputs */
.field-label{ display:block; text-align:left; font-weight:600; margin:8px 6px 6px 6px; color:rgba(0,0,0,0.65) }

  /* Ajuste para el campo de contraseña (mismo tamaño que los demás) */
  /* (migrated to the block above to ensure consistent height/padding) */

/* Boton reenviar con relleno visible */
.btn.resend{ padding:10px 16px; border-radius:10px; background: #0bb85f; border:1px solid rgba(11,184,95,0.95); color:#fff; font-weight:700 }
.btn.resend:hover{ background: #07974a; box-shadow: 0 6px 14px rgba(7,151,74,0.18); }

/* Preview markers */
/* preview-related styles removed */

/* Buttons side-by-side */
.btn.secondary{ background: #f5f5f5; border:1px solid rgba(0,0,0,0.06); color:#0b6b4a; font-weight:600; padding:10px 12px; border-radius:10px }
.btn.primary{ background: linear-gradient(180deg,#00c853,#00701a); color:#fff; font-weight:700; padding:10px 12px; border-radius:10px }

@media (max-width:480px){
  .form-col{ max-width:360px }
  .glass{ padding:16px }
  .title{ font-size:18px }
  .input{ padding:10px 12px }
  .btn{ padding:10px 12px }
}
</style>
