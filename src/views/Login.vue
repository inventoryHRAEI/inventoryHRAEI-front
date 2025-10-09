<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h2>{{ isAddAccount ? 'Añadir otra cuenta' : 'Iniciar Sesión' }}</h2>
        <form @submit.prevent="login">
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <div class="password-field">
            <input v-model="password" :type="show ? 'text' : 'password'" placeholder="Contraseña" required class="input" />
            <button type="button" class="toggle-eye" @click="show = !show" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show">
              <transition name="eye" mode="out-in">
                <component :is="show ? EyeSlashIcon : EyeIcon" class="eye-icon" :key="show ? 'off' : 'on'" aria-hidden="true" />
              </transition>
            </button>
          </div>

          <div style="margin-top:16px" class="center">
            <button class="btn secondary" type="submit">Entrar</button>
          </div>
        </form>

        <div class="link-row" style="margin-top:12px">
          <router-link to="/forgot">¿Olvidaste tu contraseña?</router-link>
          <router-link v-if="!isAddAccount" to="/register">Registrarse</router-link>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const show = ref(false)
const route = useRoute()
const isAddAccount = computed(() => route.name === 'add-account')

const login = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    let data
    try { data = await res.json() } catch (_) { data = { msg: res.statusText || 'Respuesta vacía' } }
  if (!res.ok) throw new Error(data.msg || 'Credenciales inválidas')
  localStorage.setItem('token', data.token)
  if (data.role) localStorage.setItem('role', data.role)
  if (data.nombre) localStorage.setItem('nombre', data.nombre)
  if (data.email) localStorage.setItem('email', data.email)
  // Guardar objeto usuario sencillo
  const usuario = { nombre: data.nombre, role: data.role, email: data.email, foto: data.foto }
  localStorage.setItem('user', JSON.stringify(usuario))
  toast.success('Sesión iniciada')
  router.push({ name: 'dashboard' })
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
