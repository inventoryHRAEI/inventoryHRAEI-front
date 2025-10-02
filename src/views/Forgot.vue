<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h2>Recuperar Contraseña</h2>
        <form @submit.prevent="forgot">
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <div style="margin-top:12px">
            <button class="btn" type="submit">Enviar token</button>
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


