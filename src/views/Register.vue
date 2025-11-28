<template>
  <div class="form-wrap">
    <div class="form-col">
      <div class="glass">
        <div class="form-header">
          <div class="icon-circle">
            <component :is="step === 1 ? UserPlusIcon : step === 2 ? CheckCircleIcon : ShieldCheckIcon" class="form-icon" />
          </div>
          <h2>Crear Cuenta</h2>
          <p class="form-subtitle">Paso {{ step }} de 3</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (step / 3 * 100) + '%' }"></div>
          </div>
        </div>

        <form v-if="step === 1" @submit.prevent="sendToken" class="step-form">
          <p class="step-info">Ingresa tu información básica</p>
          <div class="form-group">
            <label class="field-label">Nombre Completo</label>
            <div class="input-wrapper">
              <component :is="UserIcon" class="input-icon" />
              <input v-model="nombre" placeholder="Juan Pérez" required class="input" />
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">Correo Electrónico</label>
            <div class="input-wrapper">
              <component :is="EnvelopeIcon" class="input-icon" />
              <input v-model="email" placeholder="tu@email.com" type="email" required class="input" />
            </div>
          </div>
          <button class="btn secondary btn-lg" type="submit">Enviar Código</button>
        </form>

        <form v-else-if="step === 2" @submit.prevent="verifyToken" class="step-form">
          <p class="step-info">Verifica tu correo electrónico</p>
          <p class="step-hint">Enviamos un código a {{ email }}</p>
          <div class="form-group">
            <label class="field-label">Código de Verificación</label>
            <div class="input-wrapper">
              <component :is="KeyIcon" class="input-icon" />
              <input v-model="token" placeholder="000000" type="text" maxlength="6" required class="input token-input" />
            </div>
          </div>
          <div class="row mt-8">
            <button class="btn secondary flex-1" type="submit">Verificar</button>
            <button class="btn secondary flex-1" type="button" :disabled="resendCount >= maxResends" @click="resendToken">Reenviar ({{ remainingResends }})</button>
          </div>
          <div class="mt-8 small-info">Puedes reenviar hasta {{ maxResends }} veces</div>
        </form>

        <form v-else-if="step === 3" @submit.prevent="completeRegistration" class="step-form">
          <p class="step-info">Completa tu perfil</p>
          <div class="form-group">
            <label class="field-label">Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="LockClosedIcon" class="input-icon" />
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="input" />
              <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
                <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="eye-icon" />
              </button>
            </div>
            <small class="pwd-hint">Min. 8 caracteres, mayúscula, minúscula, número y símbolo</small>
          </div>
          <div class="form-group">
            <label class="field-label">Confirmar Contraseña</label>
            <div class="input-wrapper password-field">
              <component :is="LockClosedIcon" class="input-icon" />
              <input v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="••••••••" required class="input" />
              <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm">
                <component :is="showConfirm ? EyeSlashIcon : EyeIcon" class="eye-icon" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">Foto de Perfil <span class="optional">(opcional)</span></label>
            <div class="file-input-wrapper">
              <component :is="PhotoIcon" class="upload-icon" />
              <input type="file" @change="onFileChange" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml" class="file-input" />
              <span class="file-label">Selecciona una imagen</span>
            </div>
            <div v-if="previewUrl || nombre" class="mt-10">
              <div class="small-info" style="opacity:.8; margin-bottom:6px">Vista previa</div>
              <div class="user-btn user-btn--preview">
                <span class="avatar">
                  <img v-if="previewUrl" :src="previewUrl" alt="preview" class="top-avatar" />
                  <span v-else>👤</span>
                </span>
                <span class="welcome-text">{{ nombre || 'Tu nombre' }}</span>
              </div>
            </div>
            <div v-if="photoMsg" class="msg">{{ photoMsg }}</div>
            <div v-if="photoErr" class="error">{{ photoErr }}</div>
          </div>
          <button class="btn secondary btn-lg" type="submit">Crear Cuenta</button>
        </form>

        <div class="link-row mt-12">
          <router-link to="/login" class="link-item">
            <component :is="ArrowLeftIcon" class="link-icon" />
            Volver a iniciar sesión
          </router-link>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import notifier from '@/utils/notifier'
import { EyeIcon, EyeSlashIcon, UserPlusIcon, CheckCircleIcon, ShieldCheckIcon, UserIcon, EnvelopeIcon, KeyIcon, LockClosedIcon, PhotoIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

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

async function parseJsonSafe(res){
  try{
    const text = await res.text()
    if(!text) return {}
    return JSON.parse(text)
  }catch{
    return {}
  }
}

const sendToken = async () => {
  error.value = ''
  if (!nombre.value || !email.value) {
  notifier.error('Nombre y email son obligatorios')
    return
  }
  try {
    const res = await fetch('/api/auth/request-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.value, email: email.value })
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar con el servidor (request-token)')
  notifier.success('Token enviado. Revisa tu correo.')
    step.value = 2
  } catch (e) {
    error.value = e.message
  notifier.error(e.message)
  }
}

const verifyToken = async () => {
  error.value = ''
  if (!token.value) {
  notifier.error('Ingresa el token')
    return
  }
  try {
    const res = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, token: token.value })
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar con el servidor (verify-token)')
  notifier.success('Email verificado. Completa tu cuenta.')
    step.value = 3
  } catch (e) {
    error.value = e.message
  notifier.error(e.message)
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
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar con el servidor (resend-token)')
    resendCount.value += 1
  notifier.success(data.msg || 'Token reenviado')
  } catch (e) {
    error.value = e.message
  notifier.error(e.message)
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
  notifier.error('Completa las contraseñas')
    return
  }
  if (password.value !== confirmPassword.value) {
  notifier.error('Las contraseñas no coinciden')
    return
  }
  // Validación de contraseña en frontend
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  if (!strong.test(password.value)) {
  notifier.error('Contraseña débil. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.')
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
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.msg || 'No se pudo conectar con el servidor (complete-registration)')
  notifier.success('Registro completado. Ya puedes iniciar sesión.')
    router.push({ name: 'login' })
  } catch (e) {
    error.value = e.message
  notifier.error(e.message)
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
