<template>
  <FormShell>
    <template #title>
      <h2>Recuperar Contraseña</h2>
    </template>

    <template #body>
      <form @submit.prevent="forgot">
        <input v-model="email" placeholder="Email" type="email" required class="input" />
        <div style="margin-top:12px">
          <button class="btn secondary" type="submit">Enviar código</button>
        </div>
      </form>
    </template>

    <template #links>
      <router-link to="/login">Volver a iniciar sesión</router-link>
    </template>

    <template #msg v-if="msg">
      {{ msg }}
    </template>

    <template #error v-if="error">
      {{ error }}
    </template>
  </FormShell>
</template>

<script setup>
import FormShell from '@/components/FormShell.vue'
import { ref } from 'vue'
import notifier from '@/utils/notifier'
import { useRouter } from 'vue-router'
const router = useRouter()

const email = ref('')
const msg = ref('')
const error = ref('')

const forgot = async () => {
  msg.value = ''
  error.value = ''
  if (!email.value) { notifier.error('Email requerido'); return }
  try {
    const res = await fetch('/api/auth/forgot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value })
    })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
    if (!res.ok) throw new Error(data.msg || 'Error al solicitar token')
    msg.value = 'Revisa tu correo por favor, ahí debería estar tu código de verificación.'
    notifier.success(msg.value)
    try {
      const q = new URLSearchParams({ email: email.value })
      if (data && data.token) q.set('token', data.token)
      if (data && data.resetUrl) {
        window.location.href = data.resetUrl
      } else {
        router.push({ path: '/reset', query: Object.fromEntries(q) })
      }
    } catch (e) { console.error('Redirección a reset falló:', e) }
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  }
}
</script>

<style scoped>
/* No styles here: FormShell centraliza el diseño del card para consistencia */
/* Ocultar cualquier H2 directo dentro del contenedor principal para evitar títulos duplicados */
:deep(.container) > h2 { display: none !important; }
/* Asegurar espacio superior consistente */
.form-wrap{ margin-top: 8px }
</style>