<template>
  <DashboardShell :hideHeader="true">
    <!-- Topbar global (App.vue) se encargará de mostrar el usuario y acciones -->

    <FormShell>
      <template #title>
        <h2>Recuperar Contraseña</h2>
      </template>

      <template #body>
        <form @submit.prevent="forgot">
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <div style="margin-top:12px">
            <button class="btn secondary ui-btn ui-btn--md" type="submit">Enviar código</button>
          </div>
        </form>
      </template>

      <template #links>
        <a @click.prevent="goHome" href="#">Volver a la página principal</a>
      </template>

      <template #msg v-if="msg">
        {{ msg }}
      </template>

      <template #error v-if="error">
        {{ error }}
      </template>
    </FormShell>
  </DashboardShell>
</template>

<script setup>
import DashboardShell from '@/components/DashboardShell.vue'
import FormShell from '@/components/FormShell.vue'
import { confirmDelete } from '@/utils/sweetAlertConfig'
import UserHeader from '@/components/UserHeader.vue'
import { ref } from 'vue'
import notifier from '@/utils/notifier'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
const router = useRouter()
const loggedUser = ref(null)
if (localStorage.getItem('user')) {
  try { loggedUser.value = JSON.parse(localStorage.getItem('user')) } catch { loggedUser.value = null }
}
async function goHome(){
  try {
    const res = await confirmDelete('Ir al inicio', '¿Deseas volver al panel principal? Se cerrará esta pantalla.', 1, 'Ir al inicio', 'Cancelar')
    if (!res.isConfirmed) return
    await navigateAndRefresh(router, { name: 'dashboard' })
  } catch (e) { console.error(e) }
}
function goManageUsers(){ try { navigateAndRefresh(router, { name: 'admin-users' }) } catch {} }

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
        navigateAndRefresh(router, { path: '/reset', query: Object.fromEntries(q) })
      }
    } catch (e) { console.error('Redirección a reset falló:', e) }
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  }
}

function requestPermissions(){
  // Simple placeholder: abrir modal de solicitud o navegar al panel de solicitudes
  try { navigateAndRefresh(router, { name: 'dashboard', query: { area: 'SOLICITUDES' } }) } catch {}
}

import { computed } from 'vue'
const initials = computed(() => {
  if (!loggedUser || !loggedUser.nombre) return 'U'
  return loggedUser.nombre.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
})
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:720px }
.glass{ background: rgba(255,255,255,0.06); padding:18px; border-radius:12px }
.link-row{ text-align:center }
.msg{ margin-top:10px; color:green; text-align:center }
.error{ margin-top:10px; color:#b00020; text-align:center }

/* Local topbar styles */
.local-topbar{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px; background: rgba(255,255,255,0.04); border-radius:10px; margin-bottom:14px }
.local-topbar-left{ display:flex; align-items:center; gap:10px }
.local-avatar{ width:48px; height:48px; border-radius:50%; object-fit:cover }
.local-avatar.placeholder{ display:flex; align-items:center; justify-content:center; background:#ddd; color:#333 }
.local-name{ font-weight:700 }
.local-role{ font-size:12px; color:#666 }
.local-topbar-right{ margin-left:auto }

/* Ocultar la cabecera del DashboardShell en esta vista para evitar título duplicado
  (el FormShell ya muestra el título dentro de la card) */
:deep(.container) > h2 { display: none !important; }
</style>