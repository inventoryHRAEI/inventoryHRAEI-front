<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h3>Registro</h3>

        <form v-if="!tokenSent" @submit.prevent="sendToken">
          <input v-model="nombre" placeholder="Nombre" required class="input" />
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <div style="margin-top:12px">
            <button class="btn" type="submit">Enviar Token</button>
          </div>
        </form>

        <form v-else @submit.prevent="validateToken">
          <input v-model="token" placeholder="Token (6 dígitos)" type="text" maxlength="6" required class="input" />
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Contraseña" required class="input" />
            <button type="button" class="toggle-eye" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="showPassword">
              <transition name="eye" mode="out-in">
                <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="eye-icon" :key="showPassword ? 'off' : 'on'" aria-hidden="true" />
              </transition>
            </button>
          </div>
          <div class="password-field">
            <input v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="Confirmar contraseña" required class="input" />
              <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="showConfirm">
                <transition name="eye" mode="out-in">
                  <component :is="showConfirm ? EyeSlashIcon : EyeIcon" class="eye-icon" :key="showConfirm ? 'off' : 'on'" aria-hidden="true" />
                </transition>
              </button>
          </div>
          <div style="margin-top:20px">
            <button class="btn" type="submit">Validar y Registrarse</button>
          </div>
        </form>

        <div class="link-row" style="margin-top:12px">
          <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const nombre = ref('')
const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const tokenSent = ref(false)
const router = useRouter()
const showPassword = ref(false)
const showConfirm = ref(false)

const sendToken = async () => {
  error.value = ''
  if (!nombre.value || !email.value) {
    toast.error('Nombre y email son obligatorios')
    return
  }
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.value, email: email.value })
    })
    let data
    try {
      data = await res.json()
    } catch (_) {
      data = { msg: res.statusText || 'Respuesta vacía' }
    }
    if (!res.ok) throw new Error(data.msg || 'Error al enviar token')
    toast.success('Token enviado. Revisa tu correo (simulado)')
    tokenSent.value = true
  } catch (e) {
    error.value = e.message
    toast.error(e.message)
  }
}

const validateToken = async () => {
  error.value = ''
  if (!token.value || !password.value || !confirmPassword.value) {
    toast.error('Todos los campos son obligatorios')
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  try {
    const res = await fetch('/api/auth/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, token: token.value, password: password.value })
    })
    let data
    try {
      data = await res.json()
    } catch (_) {
      data = { msg: res.statusText || 'Respuesta vacía' }
    }
    if (!res.ok) throw new Error(data.msg || 'Error al validar token')
    toast.success('Cuenta creada exitosamente')
    router.push({ name: 'login' })
  } catch (e) {
    error.value = e.message
    toast.error(e.message)
  }
}
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:520px }
</style>
*** End Patch
