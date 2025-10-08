<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <h3>Registro</h3>

        <form v-if="step === 1" @submit.prevent="sendToken">
          <h4>Paso 1 — Ingresa nombre y email</h4>
          <input v-model="nombre" placeholder="Nombre" required class="input" />
          <input v-model="email" placeholder="Email" type="email" required class="input" />
          <div style="margin-top:12px">
            <button class="btn" type="submit">Enviar Token</button>
          </div>
        </form>

        <form v-else-if="step === 2" @submit.prevent="verifyToken">
          <h4>Paso 2 — Verifica tu email</h4>
          <input v-model="token" placeholder="Token (6 dígitos)" type="text" maxlength="6" required class="input" />
          <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
            <button class="btn" type="submit">Verificar</button>
            <button class="btn secondary" type="button" :disabled="resendCount >= maxResends" @click="resendToken">Reenviar token ({{ remainingResends }})</button>
          </div>
          <div style="margin-top:8px; font-size:12px; color:#666">Si no recibes el token, puedes reenviarlo hasta 4 veces.</div>
        </form>

        <form v-else-if="step === 3" @submit.prevent="completeRegistration">
          <h4>Paso 3 — Completa tu cuenta</h4>
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Contraseña (mín. 8, mayúscula, minúscula, número y símbolo)" required class="input" />
            <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
              <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="eye-icon" />
            </button>
          </div>
          <div class="password-field">
            <input v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="Confirmar contraseña" required class="input" />
            <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm">
              <component :is="showConfirm ? EyeSlashIcon : EyeIcon" class="eye-icon" />
            </button>
          </div>
          <div style="margin-top:8px">
            <label>Foto de perfil (opcional)</label>
            <input type="file" @change="onFileChange" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml" />
            <div v-if="previewUrl || nombre" style="margin-top:10px">
              <div style="font-size:12px; opacity:.8; margin-bottom:6px">Vista previa — así se verá en el encabezado</div>
              <div class="user-btn" style="pointer-events:none; display:inline-flex">
                <span class="avatar">
                  <img v-if="previewUrl" :src="previewUrl" alt="preview" class="top-avatar" />
                  <span v-else>👤</span>
                </span>
                <span class="welcome-text">{{ nombre || 'Tu nombre' }}</span>
                <span class="chev" aria-hidden="true"></span>
              </div>
            </div>
            <div v-if="photoMsg" class="msg">{{ photoMsg }}</div>
            <div v-if="photoErr" class="error">{{ photoErr }}</div>
          </div>
          <div style="margin-top:20px">
            <button class="btn" type="submit">Crear cuenta</button>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const nombre = ref('')
const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const step = ref(1) // 1=request token, 2=verify token, 3=complete registration
const resendCount = ref(0)
const maxResends = 4
const router = useRouter()
const showPassword = ref(false)
const showConfirm = ref(false)
const photoFile = ref(null)
const previewUrl = ref('')
const photoErr = ref('')
const photoMsg = ref('')

const remainingResends = computed(() => Math.max(0, maxResends - resendCount.value))

const sendToken = async () => {
  error.value = ''
  if (!nombre.value || !email.value) {
    toast.error('Nombre y email son obligatorios')
    return
  }
  try {
    const res = await fetch('/api/auth/request-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.value, email: email.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Error al enviar token')
    toast.success('Token enviado. Revisa tu correo.')
    step.value = 2
  } catch (e) {
    error.value = e.message
    toast.error(e.message)
  }
}

const verifyToken = async () => {
  error.value = ''
  if (!token.value) {
    toast.error('Ingresa el token')
    return
  }
  try {
    const res = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, token: token.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Error al verificar token')
    toast.success('Email verificado. Completa tu cuenta.')
    step.value = 3
  } catch (e) {
    error.value = e.message
    toast.error(e.message)
  }
}

const resendToken = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/auth/resend-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Error al reenviar token')
    resendCount.value += 1
    toast.success(data.msg || 'Token reenviado')
  } catch (e) {
    error.value = e.message
    toast.error(e.message)
  }
}

const onFileChange = async (e) => {
  photoErr.value = ''
  photoMsg.value = ''
  const f = e.target.files && e.target.files[0]
  if (!f) { photoFile.value = null; previewUrl.value = ''; return }
  const okType = /^(image\/(png|jpeg|jpg|webp|gif|bmp|svg\+xml))$/i.test(f.type)
  if (!okType) { photoErr.value = 'Formato no soportado. Usa PNG, JPG/JPEG, WEBP, GIF, BMP o SVG.'; photoFile.value = null; previewUrl.value = ''; return }
  try {
    const { dataUrl, info } = await compressImageFile(f, 512, 512, 0.82)
    previewUrl.value = dataUrl
    photoFile.value = f
    photoMsg.value = `Imagen preparada (${info.width}x${info.height}, ${(info.bytes/1024).toFixed(1)} KB)`
  } catch (err) {
    photoErr.value = 'No se pudo procesar la imagen';
    photoFile.value = null; previewUrl.value = ''
  }
}

const completeRegistration = async () => {
  error.value = ''
  if (!password.value || !confirmPassword.value) {
    toast.error('Completa las contraseñas')
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  // Validación de contraseña en frontend
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  if (!strong.test(password.value)) {
    toast.error('Contraseña débil. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.')
    return
  }

  try {
    // Si hay foto, la convertimos a data URL comprimida para no exceder tamaños
    let fotoUrl = null
    if (photoFile.value) {
      const { dataUrl } = await compressImageFile(photoFile.value, 512, 512, 0.82)
      fotoUrl = dataUrl
    }

    const res = await fetch('/api/auth/complete-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, nombre: nombre.value, password: password.value, foto: fotoUrl })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Error al completar registro')
    toast.success('Registro completado. Ya puedes iniciar sesión.')
    router.push({ name: 'login' })
  } catch (e) {
    error.value = e.message
    toast.error(e.message)
  }
}

async function compressImageFile(file, maxW = 512, maxH = 512, quality = 0.82) {
  const dataUrl = await new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
  const img = await new Promise((resolve, reject) => {
    const im = new Image()
    im.onload = () => resolve(im)
    im.onerror = reject
    im.src = dataUrl
  })
  let { width, height } = img
  const ratio = Math.min(maxW / width, maxH / height, 1)
  const w = Math.round(width * ratio)
  const h = Math.round(height * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  // Preferimos WEBP si soporta, si no caemos a JPEG
  let out = canvas.toDataURL('image/webp', quality)
  if (!out || out.indexOf('data:image') !== 0) {
    out = canvas.toDataURL('image/jpeg', quality)
  }
  // bytes estimados
  const bytes = Math.ceil((out.length * 3) / 4)
  return { dataUrl: out, info: { width: w, height: h, bytes } }
}
</script>

<style scoped>
.form-wrap{ display:flex; align-items:center; justify-content:center; min-height:60vh }
.form-col{ width:100%; max-width:520px }
</style>
*** End Patch
