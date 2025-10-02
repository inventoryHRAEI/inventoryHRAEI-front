<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h2>Restablecer Contraseña</h2>
        <form @submit.prevent="reset">
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <input v-model="token" placeholder="Token" required class="input" />
          <div class="password-field">
            <input v-model="password" :type="show ? 'text' : 'password'" placeholder="Nueva contraseña" required class="input" />
            <button type="button" class="toggle-eye" @click="show = !show" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show">
              <transition name="eye" mode="out-in">
                <component :is="show ? EyeSlashIcon : EyeIcon" class="eye-icon" :key="show ? 'off' : 'on'" aria-hidden="true" />
              </transition>
            </button>
          </div>
          <div style="margin-top:12px"><button class="btn" type="submit">Restablecer</button></div>
        </form>
        <div class="link-row" style="margin-top:12px"><router-link to="/login">Volver a login</router-link></div>
        <div v-if="msg" class="msg">{{ msg }}</div>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const email = ref('')
const token = ref('')
const password = ref('')
const msg = ref('')
const error = ref('')
const show = ref(false)

const reset = async () => {
  msg.value = ''
  error.value = ''
  if (!email.value || !token.value || !password.value) { toast.error('Todos los campos son obligatorios'); return }
  try {
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value, token: token.value, password: password.value }) })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
    if (!res.ok) throw new Error(data.msg || 'Error al restablecer contraseña')
    msg.value = 'Contraseña actualizada, inicia sesión.'
    toast.success(msg.value)
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
