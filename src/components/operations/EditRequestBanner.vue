<template>
  <div v-if="!isEditAllowed || editRequestStatus === 'pending'" class="edit-request-banner" :class="bannerClass">
    <div class="banner-content">
      <div class="banner-icon">
        <svg v-if="editRequestStatus === 'pending'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div class="banner-text">
        <h4 v-if="editRequestStatus === 'pending'">Solicitud Pendiente</h4>
        <h4 v-else>Edición Bloqueada</h4>
        
        <p v-if="editRequestStatus === 'pending'">
          Tu solicitud para editar esta orden está siendo revisada por un administrador.
        </p>
        <p v-else>
          No tienes permisos para editar esta orden. Solicita permiso a un administrador para poder actualizarla.
        </p>
      </div>
      
      <div class="banner-action" v-if="editRequestStatus !== 'pending'">
        <button class="btn-request" @click="$emit('request')" :disabled="loading">
          {{ loading ? 'Solicitando...' : 'Solicitar Permiso de Edición' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  editRequestStatus: {
    type: String,
    default: null
  },
  isEditAllowed: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const bannerClass = computed(() => {
  if (props.editRequestStatus === 'pending') return 'status-pending'
  return 'status-locked'
})

defineEmits(['request'])
</script>

<style scoped>
.edit-request-banner {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.status-locked {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.status-pending {
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.banner-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-locked .banner-icon { color: #ef4444; }
.status-pending .banner-icon { color: #f59e0b; }

.banner-text {
  flex-grow: 1;
}

.banner-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.banner-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.banner-action button {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.banner-action button:hover:not(:disabled) {
  background-color: #dc2626;
}

.banner-action button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
