<template>
  <div class="form-wrap">
    <LoadingSkeleton v-if="isLoading" type="forgot" />
    
    <div v-else class="form-col">
      <div class="glass">
        <div class="form-header">
          <div class="icon-circle">
            <component :is="EnvelopeIcon" class="form-icon" />
          </div>
          <h2>Recuperar Contraseña</h2>
          <p class="form-subtitle">Recibe un código en tu correo</p>
        </div>

        <form @submit.prevent="forgot">
          <div class="form-group">
            <label class="field-label">Correo Electrónico</label>
            <div class="input-wrapper">
              <component :is="EnvelopeIcon" class="input-icon" />
              <input v-model="email" placeholder="tu@email.com" type="email" required class="input" />
            </div>
          </div>

          <button class="btn secondary btn-lg" type="submit">Enviar Código</button>
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
import notifier from '@/utils/notifier'
import { useRouter } from 'vue-router'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const router = useRouter()
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})

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