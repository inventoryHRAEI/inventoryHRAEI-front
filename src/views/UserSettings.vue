<template>
  <div class="settings-wrapper">
    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="loading-container">
      <LoadingSkeleton type="register" />
    </div>

    <!-- Main Content -->
    <div v-else class="settings-main">
      <Breadcrumbs :items="breadcrumbItems" />

      <!-- Glass Card Container -->
      <div class="settings-card">
        <!-- Header Section -->
        <div class="settings-header-section">
          <div class="header-badge">
            <div class="badge-glow"></div>
            <component :is="CogIcon" class="badge-icon" />
          </div>
          <div class="header-content">
            <h1 class="header-title">Configuración de Perfil</h1>
            <p class="header-subtitle">Personaliza tu cuenta y seguridad</p>
          </div>
        </div>

        <!-- Content Tabs/Sections -->
        <div class="settings-content">
          <!-- Info Section -->
          <section class="settings-section info-section">
            <h3 class="section-title">
              <component :is="UserIcon" class="section-icon" />
              Información Personal
            </h3>

            <!-- Nombre -->
            <div class="form-group">
              <label class="form-label">Nombre Completo</label>
              <div class="input-box">
                <component :is="UserIcon" class="input-prefix-icon" />
                <input 
                  v-model="formData.nombre" 
                  type="text"
                  placeholder="Tu nombre completo"
                  class="form-input"
                  @focus="focusedField = 'nombre'"
                  @blur="focusedField = null"
                />
              </div>
            </div>

            <!-- Email (read-only) -->
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <div class="input-box read-only">
                <component :is="EnvelopeIcon" class="input-prefix-icon" />
                <input 
                  v-model="formData.email" 
                  type="email"
                  disabled
                  class="form-input"
                />
                <span class="lock-badge">🔒</span>
              </div>
              <p class="field-help-text">Tu correo es inmutable por seguridad</p>
            </div>

            <!-- Rol (read-only) -->
            <div class="form-group">
              <label class="form-label">Tu Rol</label>
              <div class="input-box read-only">
                <component :is="ShieldCheckIcon" class="input-prefix-icon" />
                <input 
                  v-model="rolLabel" 
                  disabled
                  class="form-input"
                />
                <span class="lock-badge">👤</span>
              </div>
              <p class="field-help-text">Contacta a un administrador para cambiar permisos</p>
            </div>

            <!-- Photo Upload -->
            <div class="form-group photo-group">
              <label class="form-label">Foto de Perfil</label>
              
              <!-- Photo Preview -->
              <div v-if="previewUrl || currentPhotoUrl || formData.nombre" class="photo-preview-box">
                <div class="photo-frame">
                  <img 
                    v-if="previewUrl" 
                    :src="previewUrl" 
                    alt="Nueva foto"
                    class="photo-image"
                  />
                  <img 
                    v-else-if="currentPhotoUrl" 
                    :src="currentPhotoUrl" 
                    alt="Foto actual"
                    class="photo-image"
                  />
                  <span v-else class="photo-placeholder">👤</span>
                </div>
                <div class="photo-info">
                  <p class="photo-name">{{ formData.nombre || 'Usuario' }}</p>
                  <p v-if="photoMsg" class="photo-details">{{ photoMsg }}</p>
                </div>
              </div>

              <!-- Upload Area -->
              <div 
                class="upload-zone"
                @click="$refs.photoInput?.click()"
                @drop.prevent="onPhotoDrop"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                :class="{ 'dragging': isDragging }"
              >
                <input 
                  ref="photoInput" 
                  type="file" 
                  @change="onFileChange" 
                  accept="image/*"
                  class="hidden-input"
                />
                <div class="upload-content">
                  <component :is="PhotoIcon" class="upload-main-icon" />
                  <p class="upload-main-text">Haz clic para seleccionar</p>
                  <p class="upload-help-text">o arrastra una imagen aquí</p>
                </div>
              </div>

              <!-- Error/Success Messages -->
              <transition name="fade">
                <div v-if="photoErr" class="message error-message">
                  <span class="message-icon">⚠️</span>
                  <span>{{ photoErr }}</span>
                </div>
              </transition>
            </div>
          </section>

          <!-- Divider -->
          <div class="section-divider"></div>

          <!-- Security Section -->
          <section class="settings-section security-section">
            <h3 class="section-title">
              <component :is="LockClosedIcon" class="section-icon" />
              Seguridad
            </h3>
            <p class="section-help">Cambia tu contraseña regularmente para mantener tu cuenta segura</p>

            <!-- Current Password -->
            <div class="form-group">
              <label class="form-label">Contraseña Actual</label>
              <div class="input-box">
                <component :is="LockClosedIcon" class="input-prefix-icon" />
                <input 
                  v-model="formData.currentPassword" 
                  :type="showCurrentPwd ? 'text' : 'password'"
                  placeholder="Ingresa tu contraseña actual"
                  class="form-input"
                  @focus="focusedField = 'currentPassword'"
                  @blur="focusedField = null"
                />
                <button 
                  type="button"
                  class="input-suffix-btn"
                  @click="showCurrentPwd = !showCurrentPwd"
                  tabindex="-1"
                >
                  <component :is="showCurrentPwd ? EyeSlashIcon : EyeIcon" class="eye-icon" />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="form-group">
              <label class="form-label">
                Nueva Contraseña
                <span class="optional-badge">(opcional)</span>
              </label>
              <div class="input-box">
                <component :is="LockClosedIcon" class="input-prefix-icon" />
                <input 
                  v-model="formData.newPassword" 
                  :type="showNewPwd ? 'text' : 'password'"
                  placeholder="Deja en blanco para mantener la actual"
                  class="form-input"
                  @focus="focusedField = 'newPassword'"
                  @blur="focusedField = null"
                />
                <button 
                  v-if="formData.newPassword"
                  type="button"
                  class="input-suffix-btn"
                  @click="showNewPwd = !showNewPwd"
                  tabindex="-1"
                >
                  <component :is="showNewPwd ? EyeSlashIcon : EyeIcon" class="eye-icon" />
                </button>
              </div>
              
              <!-- Password Strength Indicator -->
              <div v-if="formData.newPassword" class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" :class="`strength-${passwordStrength}`"></div>
                </div>
                <p class="strength-text" :class="`text-${passwordStrength}`">
                  {{ passwordStrengthText }}
                </p>
              </div>

              <p class="field-help-text">
                Mínimo 8 caracteres: mayúscula (A-Z), minúscula (a-z), número (0-9) y símbolo (!@#$...)
              </p>
            </div>

            <!-- Confirm Password -->
            <div v-if="formData.newPassword" class="form-group">
              <label class="form-label">Confirmar Contraseña</label>
              <div class="input-box">
                <component :is="LockClosedIcon" class="input-prefix-icon" />
                <input 
                  v-model="formData.confirmNewPassword" 
                  :type="showConfirmPwd ? 'text' : 'password'"
                  placeholder="Confirma tu nueva contraseña"
                  class="form-input"
                  @focus="focusedField = 'confirmNewPassword'"
                  @blur="focusedField = null"
                />
                <button 
                  type="button"
                  class="input-suffix-btn"
                  @click="showConfirmPwd = !showConfirmPwd"
                  tabindex="-1"
                >
                  <component :is="showConfirmPwd ? EyeSlashIcon : EyeIcon" class="eye-icon" />
                </button>
              </div>
              
              <!-- Match Indicator -->
              <div v-if="formData.confirmNewPassword" class="match-indicator" :class="{ 'match': formData.newPassword === formData.confirmNewPassword }">
                <span class="match-icon">{{ formData.newPassword === formData.confirmNewPassword ? '✓' : '✗' }}</span>
                <span class="match-text">{{ formData.newPassword === formData.confirmNewPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden' }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="error" class="global-error" role="alert">
            <span class="error-icon">⚠️</span>
            <div class="error-content">
              <p class="error-title">Error al cargar</p>
              <p class="error-message">{{ error }}</p>
              <button 
                type="button"
                class="error-retry-btn"
                @click="loadUserData"
              >
                Reintentar
              </button>
            </div>
            <button type="button" class="error-close" @click="error = ''">✕</button>
          </div>
        </transition>

        <!-- Action Buttons -->
        <div class="settings-footer">
          <button 
            type="button"
            class="btn btn-secondary"
            @click="goBack"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="btn btn-primary"
            @click="updateProfile"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="saving-text">
              <span class="spinner"></span>
              Guardando...
            </span>
            <span v-else>
              Guardar Cambios
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { navigateAndRefresh } from '@/utils/routerHelpers.js'
import notifier from '@/utils/notifier'
import { 
  CogIcon, UserIcon, EnvelopeIcon, ShieldCheckIcon, PhotoIcon, LockClosedIcon, 
  EyeIcon, EyeSlashIcon 
} from '@heroicons/vue/24/outline'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const router = useRouter()

const breadcrumbItems = [
  { label: 'Inicio', to: '/dashboard' },
  { label: 'Configuración', to: '/user-settings' }
]

// State
const isLoading = ref(true)
const isSaving = ref(false)
const isDragging = ref(false)
const focusedField = ref(null)
const error = ref('')

const formData = ref({
  nombre: '',
  email: '',
  role: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const photoFile = ref(null)
const previewUrl = ref('')
const currentPhotoUrl = ref('')
const photoErr = ref('')
const photoMsg = ref('')

const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

// Computed
const rolLabel = computed(() => {
  const roles = { admin: 'Administrador', user: 'Usuario', privileged: 'Privilegiado' }
  return roles[formData.value.role] || 'Desconocido'
})

const passwordStrength = computed(() => {
  const pwd = formData.value.newPassword
  if (!pwd) return 'none'
  
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd)
  const isLongEnough = pwd.length >= 8
  
  const strength = [hasLower, hasUpper, hasNumber, hasSymbol, isLongEnough].filter(Boolean).length
  
  if (strength === 5) return 'strong'
  if (strength >= 4) return 'good'
  if (strength >= 3) return 'fair'
  return 'weak'
})

const passwordStrengthText = computed(() => {
  const texts = {
    weak: '🔴 Débil',
    fair: '🟡 Aceptable',
    good: '🟢 Buena',
    strong: '🟢 Muy fuerte'
  }
  return texts[passwordStrength.value] || ''
})

// Methods
onMounted(loadUserData)

async function loadUserData() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      throw new Error(error.value)
    }

    console.debug('[UserSettings] Loading user data with token:', token.slice(0, 20) + '...')

    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.debug('[UserSettings] Response status:', res.status)

    if (!res.ok) {
      let errorMsg = 'No se pudo cargar los datos de tu perfil'
      try {
        const data = await res.json()
        errorMsg = data.msg || errorMsg
        console.error('[UserSettings] Server error:', data)
      } catch (parseErr) {
        console.error('[UserSettings] Could not parse error response:', parseErr)
      }
      
      if (res.status === 401) {
        errorMsg = 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.'
      } else if (res.status === 404) {
        errorMsg = 'Usuario no encontrado. Intenta iniciar sesión de nuevo.'
      }
      
      error.value = errorMsg
      throw new Error(errorMsg)
    }
    
    const userData = await res.json()
    console.debug('[UserSettings] User data loaded:', userData)
    
    formData.value = {
      nombre: userData.nombre || '',
      email: userData.email || '',
      role: userData.role || 'user',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }

    if (userData.foto) {
      currentPhotoUrl.value = normalizePhotoUrl(userData.foto)
    }

    // Success - clear any previous errors
    error.value = ''
  } catch (e) {
    console.error('[UserSettings] Error loading user data:', e)
    error.value = error.value || e.message || 'Error desconocido al cargar los datos'
    notifier.error(error.value)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 600)
  }
}

function normalizePhotoUrl(foto) {
  try {
    if (!foto) return ''
    
    if (typeof foto === 'object' && foto?.type === 'Buffer' && Array.isArray(foto.data)) {
      const b64 = btoa(String.fromCharCode(...foto.data))
      return `data:image/jpeg;base64,${b64}`
    }

    const f = String(foto).trim()
    if (!f) return ''

    if (f.startsWith('{')) {
      try {
        const parsed = JSON.parse(f)
        if (parsed?.data) {
          const mime = parsed.mime || 'image/jpeg'
          return parsed.data.startsWith('data:') ? parsed.data : `data:${mime};base64,${parsed.data}`
        }
      } catch { /* ignore */ }
    }

    if (f.startsWith('data:')) return f
    if (f.toLowerCase().startsWith('base64,')) return `data:image/jpeg;base64,${f.slice(7)}`
    if (/^https?:\/\//i.test(f) || f.startsWith('blob:') || f.startsWith('/')) return f
    
    if ((/[\/\\]/.test(f) || /\.[a-zA-Z]{2,5}$/.test(f)) && /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(f)) {
      const fNorm = f.replace(/\\/g, '/')
      const idx = fNorm.toLowerCase().indexOf('/uploads/')
      if (idx >= 0) return `/api${fNorm.slice(idx)}`
      if (/^uploads\//i.test(fNorm)) return `/api/${fNorm}`
      return fNorm
    }

    const head = f.slice(0, 20)
    let mime = 'image/jpeg'
    if (head.startsWith('/9j')) mime = 'image/jpeg'
    else if (head.startsWith('iVBOR')) mime = 'image/png'
    else if (head.startsWith('R0lGOD')) mime = 'image/gif'
    
    return `data:${mime};base64,${f}`
  } catch {
    return ''
  }
}

async function onFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return

  photoErr.value = ''
  photoMsg.value = ''

  if (!f.type.startsWith('image/')) {
    photoErr.value = 'Por favor selecciona un archivo de imagen'
    return
  }

  try {
    const { dataUrl, info } = await compressImageFile(f, 512, 512, 0.82)
    previewUrl.value = dataUrl
    photoFile.value = f
    photoMsg.value = `${info.width}×${info.height}px • ${(info.bytes / 1024).toFixed(1)} KB`
  } catch (err) {
    photoErr.value = 'No se pudo procesar la imagen'
  }
}

function onPhotoDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      photoFile.value = file
      const event = new Event('change', { bubbles: true })
      Object.defineProperty(event, 'target', { 
        writable: false, 
        value: { files: files } 
      })
      onFileChange({ target: { files } })
    } else {
      photoErr.value = 'Solo se permiten archivos de imagen'
    }
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
  
  let out = canvas.toDataURL('image/webp', quality)
  if (!out || out.indexOf('data:image') !== 0) {
    out = canvas.toDataURL('image/jpeg', quality)
  }
  
  const bytes = Math.ceil((out.length * 3) / 4)
  return { dataUrl: out, info: { width: w, height: h, bytes } }
}

async function updateProfile() {
  error.value = ''

  if (!formData.value.nombre.trim()) {
    notifier.error('El nombre es obligatorio')
    return
  }

  if (formData.value.newPassword) {
    if (!formData.value.currentPassword) {
      notifier.error('Ingresa tu contraseña actual para cambiarla')
      return
    }

    if (formData.value.newPassword !== formData.value.confirmNewPassword) {
      notifier.error('Las contraseñas no coinciden')
      return
    }

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!strong.test(formData.value.newPassword)) {
      notifier.error('Contraseña no cumple los requisitos de seguridad')
      return
    }
  }

  isSaving.value = true

  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Tu sesión ha expirado')

    let fotoUrl = null
    if (photoFile.value) {
      const { dataUrl } = await compressImageFile(photoFile.value, 512, 512, 0.82)
      fotoUrl = dataUrl
    }

    const payload = {
      nombre: formData.value.nombre.trim(),
      ...(formData.value.newPassword && { 
        currentPassword: formData.value.currentPassword,
        newPassword: formData.value.newPassword 
      }),
      ...(fotoUrl && { foto: fotoUrl })
    }

    const res = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'No se pudo actualizar el perfil')

    // Update localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        user.nombre = formData.value.nombre
        if (fotoUrl) user.foto = fotoUrl
        localStorage.setItem('user', JSON.stringify(user))
        window.dispatchEvent(new Event('session:updated'))
      } catch { /* ignore */ }
    }

    notifier.success('¡Perfil actualizado correctamente!')
    
    formData.value.currentPassword = ''
    formData.value.newPassword = ''
    formData.value.confirmNewPassword = ''
    previewUrl.value = ''
    photoFile.value = null

    setTimeout(() => {
      navigateAndRefresh(router, { name: 'dashboard' })
    }, 1200)
  } catch (e) {
    error.value = e.message
    notifier.error(e.message)
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.settings-wrapper {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.3));
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.settings-main {
  max-width: 900px;
  margin: 0 auto;
}

/* Glass Card */
.settings-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 0;
  overflow: hidden;
}

/* Header */
.settings-header-section {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.4), rgba(30, 41, 59, 0.3));
  padding: 40px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  gap: 20px;
  align-items: center;
}

.header-badge {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.badge-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.3), rgba(45, 221, 90, 0.1));
  border-radius: 50%;
  filter: blur(8px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.badge-icon {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 16px;
  color: #2ddd5a;
  background: rgba(45, 221, 90, 0.1);
  border: 1px solid rgba(45, 221, 90, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* Content */
.settings-content {
  padding: 40px;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #2ddd5a;
}

.section-help {
  margin: -20px 0 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent);
  margin: 40px 0;
}

/* Form Groups */
.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.optional-badge {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85em;
  text-transform: lowercase;
  margin-left: 4px;
}

/* Input Box */
.input-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
  border: 1.5px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-box:hover:not(.read-only) {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.25);
}

.input-box:has(.form-input:focus):not(.read-only) {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(45, 221, 90, 0.4);
  box-shadow: 0 0 20px rgba(45, 221, 90, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.input-box.read-only {
  background: rgba(15, 23, 42, 0.2);
  cursor: not-allowed;
}

.input-prefix-icon {
  width: 18px;
  height: 18px;
  color: rgba(45, 221, 90, 0.5);
  margin-right: 12px;
  flex-shrink: 0;
  stroke-width: 2;
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  padding: 12px 0;
  font-family: inherit;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-input:disabled {
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.input-suffix-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: rgba(45, 221, 90, 0.5);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  flex-shrink: 0;
}

.input-suffix-btn:hover {
  color: rgba(45, 221, 90, 0.8);
}

.eye-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.lock-badge {
  margin-left: 12px;
  font-size: 16px;
}

.field-help-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}

/* Password Strength */
.password-strength {
  margin: 12px 0 8px;
}

.strength-bar {
  height: 4px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-fill.strength-weak {
  width: 25%;
  background: #ef4444;
}

.strength-fill.strength-fair {
  width: 50%;
  background: #f59e0b;
}

.strength-fill.strength-good {
  width: 75%;
  background: #10b981;
}

.strength-fill.strength-strong {
  width: 100%;
  background: #2ddd5a;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
}

.strength-text.text-weak { color: #ef4444; }
.strength-text.text-fair { color: #f59e0b; }
.strength-text.text-good { color: #10b981; }
.strength-text.text-strong { color: #2ddd5a; }

/* Match Indicator */
.match-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 12px;
}

.match-indicator.match {
  background: rgba(45, 221, 90, 0.1);
  border-color: rgba(45, 221, 90, 0.2);
}

.match-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-weight: 600;
  color: #ef4444;
  border-radius: 50%;
}

.match-indicator.match .match-icon {
  color: #2ddd5a;
}

.match-text {
  color: rgba(255, 255, 255, 0.6);
}

/* Photo Upload */
.photo-group {
  margin-bottom: 32px;
}

.photo-preview-box {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(45, 221, 90, 0.05);
  border: 1px solid rgba(45, 221, 90, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
}

.photo-frame {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.2), rgba(45, 221, 90, 0.1));
  border: 1px solid rgba(45, 221, 90, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 32px;
}

.photo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.photo-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.photo-details {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* Upload Zone */
.upload-zone {
  position: relative;
  padding: 32px;
  border: 2px dashed rgba(45, 221, 90, 0.3);
  border-radius: 12px;
  background: rgba(45, 221, 90, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  user-select: none;
}

.upload-zone:hover {
  background: rgba(45, 221, 90, 0.08);
  border-color: rgba(45, 221, 90, 0.5);
}

.upload-zone.dragging {
  background: rgba(45, 221, 90, 0.15);
  border-color: rgba(45, 221, 90, 0.7);
  box-shadow: inset 0 0 20px rgba(45, 221, 90, 0.1);
}

.hidden-input {
  display: none;
}

.upload-content {
  pointer-events: none;
}

.upload-main-icon {
  width: 40px;
  height: 40px;
  color: #2ddd5a;
  margin-bottom: 12px;
  stroke-width: 1.5;
}

.upload-main-text {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.upload-help-text {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* Messages */
.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 8px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.message-icon {
  flex-shrink: 0;
}

/* Global Error */
.global-error {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  margin: 40px 40px 0;
  color: #fca5a5;
}

.error-icon {
  flex-shrink: 0;
  font-size: 20px;
}

.error-content {
  flex: 1;
}

.error-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #fecaca;
}

.error-message {
  margin: 4px 0 12px;
  font-size: 13px;
  color: #fca5a5;
}

.error-retry-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.error-retry-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
  color: #fecaca;
}

.error-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  font-size: 18px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.error-close:hover {
  color: rgba(255, 255, 255, 0.7);
}

/* Footer */
.settings-footer {
  display: flex;
  gap: 12px;
  padding: 24px 40px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.2);
}

.btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(148, 163, 184, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.3), rgba(45, 221, 90, 0.2));
  color: #2ddd5a;
  border: 1px solid rgba(45, 221, 90, 0.4);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.4), rgba(45, 221, 90, 0.3));
  border-color: rgba(45, 221, 90, 0.6);
  box-shadow: 0 0 20px rgba(45, 221, 90, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.saving-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(45, 221, 90, 0.3);
  border-top-color: #2ddd5a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-wrapper {
    padding: 12px;
  }

  .settings-header-section {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .header-title {
    font-size: 24px;
  }

  .settings-content {
    padding: 24px;
  }

  .settings-footer {
    flex-direction: column;
    padding: 16px 24px;
  }

  .btn {
    font-size: 12px;
    padding: 10px 16px;
  }

  .photo-preview-box {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .upload-zone {
    padding: 24px 16px;
  }
}
</style>
