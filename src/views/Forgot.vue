<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h2>Recuperar Contraseña</h2>
        <form @submit.prevent="forgot">
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <div style="margin-top:12px">
            <button class="btn secondary" type="submit">Enviar token</button>
          </div>
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

const email = ref('')
const msg = ref('')
const error = ref('')

import { useRouter } from 'vue-router'
const router = useRouter()

const forgot = async () => {
  msg.value = ''
  error.value = ''
  if (!email.value) { toast.error('Email requerido'); return }
  try {
    const res = await fetch('/api/auth/forgot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value })
    })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
    if (!res.ok) throw new Error(data.msg || 'Error al solicitar token')
    msg.value = 'Revisa tu correo para el token (simulado)'
    toast.success(msg.value)
    // Siempre redirigir a la vista de reset con el email pre-llenado.
    // Si el backend devuelve token o resetUrl (modo dev), preferirlos para auto-login al paso 2.
    try {
      const q = new URLSearchParams({ email: email.value })
      if (data && data.token) q.set('token', data.token)
      if (data && data.resetUrl) {
        window.location.href = data.resetUrl
      } else {
        router.push({ path: '/reset', query: Object.fromEntries(q) })
      }
    } catch (e) {
      console.error('Redirección a reset falló:', e)
    }
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


