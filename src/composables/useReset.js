import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import notifier from '@/utils/notifier'

export function useResetComposable() {
  const email = ref('')
  const token = ref('')
  const password = ref('')
  const msg = ref('')
  const error = ref('')
  const show = ref(false)
  const sendingResend = ref(false)

  const route = useRoute()
  const router = useRouter()

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
      router.push({ path: '/login' })
    } catch (e) {
      error.value = e.message
      notifier.error(e.message)
    }
  }

  return { email, token, password, msg, error, show, sendingResend, resendCode, reset }
}
