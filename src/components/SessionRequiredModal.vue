<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="handleClose"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          
          <!-- Title -->
          <h3 class="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {{ title }}
          </h3>
          
          <!-- Message -->
          <p class="text-gray-600 dark:text-gray-300 text-center mb-6">
            {{ message }}
          </p>
          
          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <button 
              @click="handleLogin"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Iniciar Sesión
            </button>
            
            <button 
              @click="handleContinue"
              v-if="allowContinue"
              class="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors"
            >
              Continuar sin iniciar sesión
            </button>
            
            <button 
              @click="handleGoHome"
              v-if="showGoHome"
              class="w-full py-3 px-4 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-200 font-semibold rounded-lg transition-colors"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getStoredToken } from '../utils/auth.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '🔒 Sesión Requerida'
  },
  message: {
    type: String,
    default: 'Para acceder a esta función necesitas iniciar sesión. ¿Deseas continuar?'
  },
  allowContinue: {
    type: Boolean,
    default: true
  },
  redirectToHome: {
    type: Boolean,
    default: false
  },
  destinationRoute: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'login', 'continue', 'go-home'])

const router = useRouter()

// Manejar cierre del modal
const handleClose = () => {
  if (props.redirectToHome) {
    router.replace('/home')
  }
  emit('close')
}

// Ir a login
const handleLogin = () => {
  // Guardar la ruta actual para redirigir después del login
  const currentPath = window.location.pathname
  sessionStorage.setItem('redirectAfterLogin', currentPath)
  
  router.push('/login')
  emit('login')
}

// Continuar sin sesión
const handleContinue = () => {
  emit('continue')
  emit('close')
}

// Ir al home
const handleGoHome = () => {
  router.replace('/home')
  emit('go-home')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
