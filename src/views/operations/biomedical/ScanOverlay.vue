<template>
    <transition name="overlay-fade">
        <div v-if="open" class="public-scan-overlay" @click.self.prevent>
            <div class="public-scan-card">
                <h3>Por favor inicie sesión para continuar</h3>
                <p class="muted">Has abierto un enlace público para el equipo <strong>{{ item?.['No DE INVENTARIO'] || code }}</strong>.</p>
                <div v-if="item" class="overlay-item-info">
                    <div class="overlay-item-name">{{ item['EQUIPO MEDICO'] || 'Equipo' }}</div>
                    <div class="overlay-item-meta">Marca: {{ item['MARCA'] || 'N/A' }} • Modelo: {{ item['MODELO'] || 'N/A' }}</div>
                </div>
                <div class="overlay-actions">
                    <template v-if="!showLogin">
                      <button class="btn-primary" @click.prevent="showLogin = true">Iniciar sesión</button>
                      <button class="btn-secondary" @click.prevent="emit('close')">Cerrar</button>
                    </template>

                    <template v-else>
                      <form class="auth-inline" @submit.prevent="doLogin">
                        <input v-model="email" type="email" placeholder="Correo" required />
                        <input v-model="password" type="password" placeholder="Contraseña" required />
                        <div class="inline-actions">
                          <button class="btn-primary" type="submit">Entrar</button>
                          <button class="btn-secondary" type="button" @click.prevent="goToFullLogin">Ir al login</button>
                        </div>
                        <div v-if="error" class="auth-error">{{ error }}</div>
                      </form>
                    </template>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
const props = defineProps({
    open: Boolean,
    item: {
        type: Object,
        default: null
    },
    code: {
        type: String,
        default: ''
    }
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { saveToken } from '@/utils/auth'

const emit = defineEmits(['login', 'close', 'logged'])
const showLogin = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function doLogin() {
  error.value = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.msg || 'Credenciales inválidas')
    if (data.token) saveToken(data.token)
    if (data.role) localStorage.setItem('role', data.role)
    if (data.nombre) localStorage.setItem('nombre', data.nombre)
    if (data.email) localStorage.setItem('email', data.email)
    localStorage.setItem('user', JSON.stringify({ nombre: data.nombre, role: data.role, email: data.email }))
    try { window.dispatchEvent(new Event('session:updated')) } catch {}
    emit('logged')
    emit('close')
  } catch (e) {
    error.value = e && e.message ? e.message : 'No se pudo iniciar sesión'
  }
}

function goToFullLogin() {
  // Redirect to full login page preserving next param
  const params = { next: window.location.pathname + window.location.search }
  router.push({ name: 'login', query: params })
}

</script>

<style scoped>
.public-scan-card .auth-inline{ display:flex; flex-direction:column; gap:8px; margin-top:8px }
.public-scan-card .auth-inline input{ padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); color:#fff }
.public-scan-card .auth-inline .inline-actions{ display:flex; gap:8px; justify-content:center; margin-top:6px }
.public-scan-card .auth-error{ color:#ffb4b4; margin-top:6px; text-align:center }
</style>
