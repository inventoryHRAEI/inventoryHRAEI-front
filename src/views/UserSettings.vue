<template>
  <div class="settings-wrapper">
    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="loading-container">
      <LoadingSkeleton type="register" />
    </div>

    <!-- Main Content -->
    <div v-else class="settings-main">
      <!-- Glass Card Container -->
      <div class="settings-card">
        <!-- Breadcrumb Inside Card -->
        <div class="breadcrumb-section">
          <button class="back-button" @click="goBack">
            <component :is="ArrowLeftIcon" class="back-icon" />
            <span>Volver</span>
          </button>
          <Breadcrumbs :items="breadcrumbItems" />
        </div>

        <!-- Header Section with Tabs -->
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

        <!-- Tab Navigation -->
        <div class="tabs-navigation">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-button', { 'active': activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="tab-icon" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.id === 'security' && hasChanges('security')" class="tab-badge">●</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="settings-content">
          <!-- Profile Tab -->
          <transition name="fade-tab" mode="out-in">
            <section v-show="activeTab === 'profile'" key="profile" class="settings-section profile-section">
              <!-- User Info Card -->
              <div class="info-card">
                <div class="card-header">
                  <h3 class="card-title">Información Personal</h3>
                  <p class="card-subtitle">Actualiza tu información de perfil</p>
                </div>

                <!-- Form Grid -->
                <div class="form-grid">
                  <!-- Nombre -->
                  <div class="form-group">
                    <label class="form-label">Nombre Completo</label>
                    <div class="input-box" :class="{ 'focused': focusedField === 'nombre', 'filled': formData.nombre }">
                      <component :is="UserIcon" class="input-prefix-icon" />
                      <input
                        v-model="formData.nombre"
                        type="text"
                        placeholder="Tu nombre completo"
                        class="form-input"
                        @focus="focusedField = 'nombre'"
                        @blur="focusedField = null"
                      />
                      <span v-if="formData.nombre" class="input-suffix-check">✓</span>
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
                      <component :is="LockClosedIcon" class="input-suffix-icon" />
                    </div>
                    <p class="field-help-text">Tu correo es protegido por seguridad</p>
                  </div>

                  <!-- Rol (read-only) -->
                  <div class="form-group">
                    <label class="form-label">Tu Rol</label>
                    <div class="input-box read-only role-display">
                      <component :is="ShieldCheckIcon" class="input-prefix-icon" />
                      <span class="role-label">{{ rolLabel }}</span>
                      <span :class="['role-badge', roleClass]">{{ rolBadge }}</span>
                    </div>
                    <p class="field-help-text">Contacta administrador para cambios de rol</p>
                  </div>
                </div>
              </div>

              <!-- Photo Upload Card -->
              <div class="info-card photo-card">
                <div class="card-header">
                  <h3 class="card-title">Foto de Perfil</h3>
                  <p class="card-subtitle">Sube una imagen de perfil profesional</p>
                </div>

                <!-- Photo Preview + Upload Grid -->
                <div class="photo-content-grid">
                  <!-- Preview Section -->
                  <div v-if="previewUrl || currentPhotoUrl" class="photo-preview-section">
                    <div class="photo-frame-container">
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
                      </div>
                      <div class="photo-details">
                        <p class="photo-name">{{ formData.nombre || 'Usuario' }}</p>
                        <p v-if="photoMsg" class="photo-msg">{{ photoMsg }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Upload Zone -->
                  <div
                    class="upload-zone-container"
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
                      <p class="upload-main-text">Selecciona una imagen</p>
                      <p class="upload-help-text">JPG, PNG o WebP • Max 5MB</p>
                    </div>
                  </div>
                </div>

                <!-- Error/Success Messages -->
                <transition name="fade">
                  <div v-if="photoErr" class="alert alert-error">
                    <component :is="AlertCircleIcon" class="alert-icon" />
                    <span>{{ photoErr }}</span>
                  </div>
                </transition>
              </div>
            </section>
          </transition>

          <!-- Security Tab -->
          <transition name="fade-tab" mode="out-in">
            <section v-show="activeTab === 'security'" key="security" class="settings-section security-section">
              <!-- Change Password Card -->
              <div class="info-card security-card">
                <div class="card-header">
                  <h3 class="card-title">Cambiar Contraseña</h3>
                  <p class="card-subtitle">Mantén tu cuenta segura con una contraseña fuerte</p>
                </div>

                <!-- Security Info Box -->
                <div class="security-info-box">
                  <component :is="ShieldAlertIcon" class="security-info-icon" />
                  <div class="security-info-content">
                    <p class="security-info-title">Recomendaciones de Seguridad</p>
                    <ul class="security-tips">
                      <li>Usa al menos 8 caracteres</li>
                      <li>Incluye mayúsculas y minúsculas</li>
                      <li>Agrega números y símbolos</li>
                      <li>No reutilices contraseñas antiguas</li>
                    </ul>
                  </div>
                </div>

                <!-- Form Grid -->
                <div class="form-grid">
                  <!-- Current Password -->
                  <div class="form-group">
                    <label class="form-label">Contraseña Actual</label>
                    <div class="input-box" :class="{ 'focused': focusedField === 'currentPassword' }">
                      <component :is="LockClosedIcon" class="input-prefix-icon" />
                      <input
                        v-model="formData.currentPassword"
                        :type="showCurrentPwd ? 'text' : 'password'"
                        placeholder="Tu contraseña actual"
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
                    <div class="input-box" :class="{ 'focused': focusedField === 'newPassword' }">
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
                    <div v-if="formData.newPassword" class="password-strength-container">
                      <div class="strength-bar">
                        <div class="strength-fill" :class="`strength-${passwordStrength}`"></div>
                      </div>
                      <div class="strength-info">
                        <p class="strength-text" :class="`text-${passwordStrength}`">
                          {{ passwordStrengthText }}
                        </p>
                        <div class="strength-requirements">
                          <div class="requirement" :class="{ 'met': /[A-Z]/.test(formData.newPassword) }">
                            <span class="requirement-check">✓</span>
                            <span>Mayúscula (A-Z)</span>
                          </div>
                          <div class="requirement" :class="{ 'met': /[a-z]/.test(formData.newPassword) }">
                            <span class="requirement-check">✓</span>
                            <span>Minúscula (a-z)</span>
                          </div>
                          <div class="requirement" :class="{ 'met': /[0-9]/.test(formData.newPassword) }">
                            <span class="requirement-check">✓</span>
                            <span>Número (0-9)</span>
                          </div>
                          <div class="requirement" :class="{ 'met': /[!@#$%^&*]/.test(formData.newPassword) }">
                            <span class="requirement-check">✓</span>
                            <span>Símbolo (!@#$%^&*)</span>
                          </div>
                          <div class="requirement" :class="{ 'met': formData.newPassword.length >= 8 }">
                            <span class="requirement-check">✓</span>
                            <span>Mínimo 8 caracteres</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <div v-if="formData.newPassword" class="form-group">
                    <label class="form-label">Confirmar Contraseña</label>
                    <div class="input-box" :class="{ 'focused': focusedField === 'confirmNewPassword', 'success': formData.newPassword === formData.confirmNewPassword && formData.confirmNewPassword }">
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
                      <component :is="formData.newPassword === formData.confirmNewPassword ? CheckCircleIcon : AlertCircleIcon" class="match-icon" />
                      <span class="match-text">{{ formData.newPassword === formData.confirmNewPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden' }}</span>
                    </div>
                  </div>
                </div>
                </div>
                </section>
                </transition>

                <!-- Session Tab -->
                <transition name="fade-tab" mode="out-in">
                <section v-show="activeTab === 'session'" key="session" class="settings-section session-section">
                <InactivitySettingsWizard />
                </section>
                </transition>
                </div>

        <!-- Footer with Actions (solo para profile y security) -->
        <div v-if="activeTab !== 'session'" class="settings-footer">
          <button class="btn btn-secondary" @click="handleReset" :disabled="!hasAnyChanges">
            <component :is="RotateCcwIcon" class="btn-icon" />
            <span>Descartar</span>
          </button>
          <button class="btn btn-primary" @click="handleSave" :disabled="isSaving || !hasAnyChanges">
            <component v-if="!isSaving" :is="SaveIcon" class="btn-icon" />
            <span v-if="!isSaving">Guardar Cambios</span>
            <span v-else class="saving-text">
              <span class="spinner"></span>
              Guardando...
            </span>
          </button>
        </div>
      </div>

      <!-- Global Error Alert -->
      <transition name="fade">
        <div v-if="globalError" class="global-error">
          <component :is="AlertTriangleIcon" class="error-icon" />
          <div class="error-content">
            <p class="error-title">Error</p>
            <p class="error-message">{{ globalError }}</p>
          </div>
          <button class="error-close" @click="globalError = null">
            <component :is="XIcon" class="close-icon" />
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import InactivitySettingsWizard from '@/components/InactivitySettingsWizard.vue'
import {
  User as UserIcon,
  Mail as EnvelopeIcon,
  Shield as ShieldCheckIcon,
  Lock as LockClosedIcon,
  Eye as EyeIcon,
  EyeOff as EyeSlashIcon,
  Camera as PhotoIcon,
  Settings as CogIcon,
  AlertCircle as AlertCircleIcon,
  Save as SaveIcon,
  RotateCcw as RotateCcwIcon,
  Check as CheckCircleIcon,
  Shield as ShieldAlertIcon,
  AlertTriangle as AlertTriangleIcon,
  X as XIcon,
  ArrowLeft as ArrowLeftIcon,
  Clock as ClockIcon
} from 'lucide-vue-next'
import gsap from 'gsap'

const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(true)
const isSaving = ref(false)
const activeTab = ref('profile')
const focusedField = ref(null)
const isDragging = ref(false)
const globalError = ref(null)
const photoErr = ref(null)
const photoMsg = ref(null)
const previewUrl = ref(null)
const currentPhotoUrl = ref(null)

// Password visibility
const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

// Form data
const formData = ref({
  nombre: '',
  email: '',
  role: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Original data for reset
const originalData = ref({
  nombre: '',
  email: '',
  role: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Tabs configuration
const tabs = [
  { id: 'profile', label: 'Perfil', icon: UserIcon },
  { id: 'security', label: 'Seguridad', icon: LockClosedIcon },
  { id: 'session', label: 'Sesión', icon: ClockIcon }
]

// Breadcrumbs
const breadcrumbItems = [
  { label: 'Dashboard', route: { name: 'dashboard' } },
  { label: 'Configuración', active: true }
]

// Computed properties
const rolLabel = computed(() => {
  const role = formData.value.role || 'user'
  return role === 'admin' ? 'Administrador' : 'Usuario Regular'
})

const rolBadge = computed(() => {
  const role = formData.value.role || 'user'
  return role === 'admin' ? 'ADMIN' : 'USER'
})

const roleClass = computed(() => {
  const role = formData.value.role || 'user'
  return role === 'admin' ? 'badge-admin' : 'badge-user'
})

const passwordStrength = computed(() => {
  const pwd = formData.value.newPassword
  if (!pwd) return 'weak'

  let strength = 0
  if (pwd.length >= 8) strength++
  if (pwd.length >= 12) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[!@#$%^&*]/.test(pwd)) strength++

  if (strength <= 1) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  const levels = {
    weak: 'Contraseña débil',
    medium: 'Contraseña moderada',
    strong: 'Contraseña fuerte'
  }
  return levels[passwordStrength.value]
})

const hasAnyChanges = computed(() => {
  return formData.value.nombre !== originalData.value.nombre ||
         formData.value.newPassword !== originalData.value.newPassword ||
         formData.value.confirmNewPassword !== originalData.value.confirmNewPassword ||
         previewUrl.value !== null ||
         formData.value.currentPassword !== originalData.value.currentPassword
})

// Methods
const hasChanges = (section) => {
  if (section === 'security') {
    return formData.value.currentPassword !== originalData.value.currentPassword ||
           formData.value.newPassword !== originalData.value.newPassword
  }
  return false
}

const loadUserData = async () => {
  try {
    isLoading.value = true
    
    // Obtener el email del usuario autenticado desde localStorage
    let currentUserEmail = null
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      currentUserEmail = user.email
    } catch (e) {
      console.warn('Could not parse user from localStorage', e)
    }

    const res = await fetch('/api/auth/users')
    if (!res.ok) throw new Error('Failed to load user data')

    const users = await res.json()
    
    // Buscar el usuario autenticado por email
    let user = null
    if (Array.isArray(users)) {
      user = currentUserEmail 
        ? users.find(u => u.email === currentUserEmail)
        : users[0]
    } else {
      user = users
    }

    if (user) {
      formData.value.nombre = user.nombre || ''
      formData.value.email = user.email || ''
      formData.value.role = user.role || 'user'

      originalData.value.nombre = user.nombre || ''
      originalData.value.email = user.email || ''
      originalData.value.role = user.role || 'user'

      if (user.foto) {
        currentPhotoUrl.value = processPhotoUrl(user.foto)
        photoMsg.value = 'Foto actual guardada'
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    globalError.value = 'No se pudo cargar tus datos'
  } finally {
    isLoading.value = false
  }
}

const processPhotoUrl = (foto) => {
  try {
    if (!foto) return null

    if (typeof foto === 'string') {
      if (foto.startsWith('data:')) return foto
      if (foto.startsWith('http')) return foto
      if (foto.startsWith('/')) return foto
      if (foto.toLowerCase().startsWith('base64,')) return `data:image/jpeg;base64,${foto.slice(7)}`

      return `/api/uploads/${foto}`
    }

    if (typeof foto === 'object' && foto.type === 'Buffer' && Array.isArray(foto.data)) {
      const b64 = btoa(String.fromCharCode(...foto.data))
      return `data:image/jpeg;base64,${b64}`
    }

    return null
  } catch {
    return null
  }
}

const onFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  validateAndPreviewPhoto(file)
}

const onPhotoDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  validateAndPreviewPhoto(file)
}

const validateAndPreviewPhoto = (file) => {
  photoErr.value = null

  if (!file.type.startsWith('image/')) {
    photoErr.value = 'Por favor selecciona una imagen válida'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    photoErr.value = 'La imagen no debe superar 5MB'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result
    photoMsg.value = 'Nueva imagen seleccionada'
  }
  reader.onerror = () => {
    photoErr.value = 'Error al cargar la imagen'
  }
  reader.readAsDataURL(file)
}

const goBack = () => {
  router.push({ name: 'dashboard' })
}

const handleReset = () => {
  formData.value.nombre = originalData.value.nombre
  formData.value.currentPassword = ''
  formData.value.newPassword = ''
  formData.value.confirmNewPassword = ''
  previewUrl.value = null
  photoErr.value = null
  focusedField.value = null
}

const handleSave = async () => {
  globalError.value = null

  // Validations
  if (!formData.value.nombre.trim()) {
    globalError.value = 'El nombre es obligatorio'
    return
  }

  if (formData.value.newPassword) {
    if (formData.value.newPassword !== formData.value.confirmNewPassword) {
      globalError.value = 'Las contraseñas no coinciden'
      return
    }

    if (!formData.value.currentPassword) {
      globalError.value = 'Debes ingresar tu contraseña actual para cambiarla'
      return
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(formData.value.newPassword)) {
      globalError.value = 'La contraseña no cumple los requisitos de seguridad'
      return
    }
  }

  try {
    isSaving.value = true

    const updateData = {
      nombre: formData.value.nombre,
      currentPassword: formData.value.currentPassword || undefined,
      newPassword: formData.value.newPassword || undefined
    }

    if (previewUrl.value) {
      updateData.foto = previewUrl.value
    }

    const { sanitizeObject } = await import('@/utils/sanitizer.js')
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizeObject(updateData))
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al guardar cambios')
    }

    // Success
    originalData.value = { ...formData.value }
    previewUrl.value = null
    formData.value.currentPassword = ''
    formData.value.newPassword = ''
    formData.value.confirmNewPassword = ''

    // Show success notification
    const event = new CustomEvent('notification', {
      detail: { type: 'success', message: 'Cambios guardados correctamente' }
    })
    window.dispatchEvent(event)

    await new Promise(resolve => setTimeout(resolve, 1500))
    await router.push({ name: 'dashboard' })
  } catch (error) {
    console.error('Error saving profile:', error)
    globalError.value = error.message || 'Error al guardar cambios'
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUserData()

  // Animate elements on mount
  gsap.from('.settings-card', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'back.out'
  })
})
</script>

<style scoped>
.settings-wrapper {
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-main {
  flex: 1;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* Card */
.settings-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px rgba(2, 6, 23, 0.3);
}

/* Breadcrumb Section */
.breadcrumb-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 40px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.8);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(45, 221, 90, 0.1);
  border: 1px solid rgba(45, 221, 90, 0.2);
  border-radius: 6px;
  color: rgba(45, 221, 90, 0.8);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0.9, 0.2, 1);
  white-space: nowrap;
}

.back-button:hover {
  background: rgba(45, 221, 90, 0.2);
  border-color: rgba(45, 221, 90, 0.4);
  color: #2ddd5a;
  transform: translateX(-4px);
  box-shadow: 0 0 12px rgba(45, 221, 90, 0.15);
}

.back-icon {
  width: 16px;
  height: 16px;
}

/* Header Section */
.settings-header-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 40px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(20, 40, 70, 0.4));
}

.header-badge {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.2), rgba(45, 221, 90, 0.05));
  border: 1px solid rgba(45, 221, 90, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: radial-gradient(circle, rgba(45, 221, 90, 0.2), transparent);
  animation: badge-pulse 3s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.badge-icon {
  width: 32px;
  height: 32px;
  color: #2ddd5a;
  position: relative;
  z-index: 1;
}

.header-content {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.header-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  gap: 0;
  padding: 0 40px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.4);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border-bottom: 2px solid transparent;
  position: relative;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.7);
}

.tab-button.active {
  color: #2ddd5a;
  border-bottom-color: #2ddd5a;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-badge {
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  display: inline-flex;
  margin-left: 4px;
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Content */
.settings-content {
  padding: 32px 40px;
  min-height: 400px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Info Card */
.info-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.15);
}

.card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.optional-badge {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  text-transform: lowercase;
  letter-spacing: normal;
}

/* Input Box */
.input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  transition: all 0.25s ease;
}

.input-box.focused {
  background: rgba(45, 221, 90, 0.08);
  border-color: rgba(45, 221, 90, 0.4);
  box-shadow: 0 0 12px rgba(45, 221, 90, 0.15);
}

.input-box.filled {
  border-color: rgba(45, 221, 90, 0.3);
}

.input-box.read-only {
  background: rgba(255, 255, 255, 0.02);
  cursor: not-allowed;
  border-color: rgba(148, 163, 184, 0.1);
}

.input-box.success {
  border-color: rgba(45, 221, 90, 0.5);
  background: rgba(45, 221, 90, 0.08);
}

.input-prefix-icon,
.input-suffix-icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.input-box.focused .input-prefix-icon {
  color: rgba(45, 221, 90, 0.6);
}

.input-suffix-check {
  width: 18px;
  height: 18px;
  color: #2ddd5a;
  flex-shrink: 0;
  animation: check-appear 0.3s ease;
}

@keyframes check-appear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.form-input {
  flex: 1;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.form-input:disabled {
  color: rgba(255, 255, 255, 0.5);
}

.input-suffix-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.input-suffix-btn:hover {
  color: rgba(255, 255, 255, 0.6);
}

.eye-icon {
  width: 18px;
  height: 18px;
}

.field-help-text {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;
}

/* Role Display */
.role-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

.role-label {
  flex: 1;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.role-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.role-badge.badge-admin {
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.3), rgba(50, 150, 255, 0.2));
  border: 1px solid rgba(100, 200, 255, 0.3);
  color: #64c8ff;
}

.role-badge.badge-user {
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.2), rgba(45, 221, 90, 0.1));
  border: 1px solid rgba(45, 221, 90, 0.3);
  color: #2ddd5a;
}

/* Photo Section */
.photo-card {
  grid-column: 1 / -1;
}

.photo-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.photo-preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.photo-frame-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.photo-frame {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(45, 221, 90, 0.3);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-details {
  text-align: center;
}

.photo-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.photo-msg {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgba(45, 221, 90, 0.6);
}

.upload-zone-container {
  padding: 32px 20px;
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.05), rgba(45, 221, 90, 0.02));
  border: 2px dashed rgba(45, 221, 90, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-zone-container:hover {
  border-color: rgba(45, 221, 90, 0.4);
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.08), rgba(45, 221, 90, 0.04));
}

.upload-zone-container.dragging {
  border-color: rgba(45, 221, 90, 0.6);
  background: rgba(45, 221, 90, 0.1);
  box-shadow: inset 0 0 20px rgba(45, 221, 90, 0.1);
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.upload-main-icon {
  width: 40px;
  height: 40px;
  color: #2ddd5a;
  margin-bottom: 4px;
}

.upload-main-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.upload-help-text {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* Password Strength */
.password-strength-container {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.strength-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.strength-weak {
  width: 33%;
  background: #ff6b6b;
}

.strength-fill.strength-medium {
  width: 66%;
  background: #ffd92f;
}

.strength-fill.strength-strong {
  width: 100%;
  background: #2ddd5a;
}

.strength-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strength-text {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.text-weak {
  color: #ff6b6b;
}

.text-medium {
  color: #ffd92f;
}

.text-strong {
  color: #2ddd5a;
}

.strength-requirements {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.requirement.met {
  color: #2ddd5a;
}

.requirement-check {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  opacity: 0;
  transition: all 0.2s ease;
}

.requirement.met .requirement-check {
  opacity: 1;
}

/* Match Indicator */
.match-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #fca5a5;
}

.match-indicator.match {
  background: rgba(45, 221, 90, 0.1);
  border-color: rgba(45, 221, 90, 0.2);
  color: #86efac;
}

.match-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Security Info */
.security-info-box {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(45, 221, 90, 0.08);
  border: 1px solid rgba(45, 221, 90, 0.2);
  border-radius: 8px;
  margin-bottom: 20px;
}

.security-info-icon {
  width: 24px;
  height: 24px;
  color: #2ddd5a;
  flex-shrink: 0;
  margin-top: 2px;
}

.security-info-content {
  flex: 1;
}

.security-info-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.security-tips {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-tips li {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 6px;
}

.security-tips li::before {
  content: '→';
  color: rgba(45, 221, 90, 0.5);
  flex-shrink: 0;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* Footer */
.settings-footer {
  display: flex;
  gap: 12px;
  padding: 20px 40px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.4);
}

.btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.15);
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(148, 163, 184, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.25), rgba(45, 221, 90, 0.15));
  color: #2ddd5a;
  border: 1px solid rgba(45, 221, 90, 0.4);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(45, 221, 90, 0.35), rgba(45, 221, 90, 0.25));
  border-color: rgba(45, 221, 90, 0.6);
  box-shadow: 0 0 20px rgba(45, 221, 90, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.saving-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(45, 221, 90, 0.3);
  border-top-color: #2ddd5a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Global Error */
.global-error {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  margin-top: 20px;
  color: #fca5a5;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-content {
  flex: 1;
}

.error-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #fecaca;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.error-message {
  margin: 4px 0 0;
  font-size: 12px;
  color: #fca5a5;
}

.error-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex-shrink: 0;
}

.error-close:hover {
  color: rgba(255, 255, 255, 0.7);
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* Transitions */
.fade-tab-enter-active,
.fade-tab-leave-active {
  transition: opacity 0.25s ease;
}

.fade-tab-enter-from,
.fade-tab-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Session Section */
.session-section {
  padding: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-wrapper {
    padding: 12px;
  }

  .breadcrumb-section {
    padding: 12px 24px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .back-button {
    padding: 6px 10px;
    font-size: 11px;
  }

  .settings-header-section {
    padding: 20px 24px;
    gap: 16px;
    flex-direction: column;
  }

  .header-title {
    font-size: 22px;
  }

  .tabs-navigation {
    padding: 0 24px;
    overflow-x: auto;
  }

  .settings-content {
    padding: 20px 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .photo-content-grid {
    grid-template-columns: 1fr;
  }

  .settings-footer {
    flex-direction: column;
    padding: 16px 24px;
  }

  .btn {
    font-size: 12px;
    padding: 10px 16px;
  }

  .strength-requirements {
    grid-template-columns: 1fr;
  }
}
</style>
