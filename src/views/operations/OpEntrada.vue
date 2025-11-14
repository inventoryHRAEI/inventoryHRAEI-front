<template>
  <FormShell>
    <template #title>Órdenes de Entrada</template>
    <div class="op-card">
      <div class="form-grid">
        <!-- Información General -->
        <div class="section-card combined-card">
          <div class="section-head">
            <h4>Información de Entrada</h4>
            <p class="hint">Datos generales de la orden de entrada</p>
          </div>
          
          <div class="section-grid combined">
            <div class="field">
              <label>Número de Orden</label>
              <input class="control" v-model="form.numeroOrden" placeholder="Ej. ORD-2024-001" />
            </div>
            
            <div class="field">
              <label>Fecha de Entrada</label>
              <input type="date" class="control" v-model="form.fechaEntrada" />
            </div>
            
            <div class="field">
              <label>Proveedor</label>
              <input class="control" v-model="form.proveedor" placeholder="Nombre del proveedor" />
            </div>
            
            <div class="field">
              <label>Tipo de Material</label>
              <select class="control" v-model="form.tipoMaterial">
                <option value="">Seleccionar tipo</option>
                <option value="medico">Material Médico</option>
                <option value="oficina">Material de Oficina</option>
                <option value="limpieza">Material de Limpieza</option>
                <option value="mantenimiento">Material de Mantenimiento</option>
              </select>
            </div>
            
            <div class="field">
              <label>Responsable de Recepción</label>
              <input class="control" v-model="form.responsable" placeholder="Nombre del responsable" />
            </div>
            
            <div class="field quantity-field-centered">
              <label>Cantidad Total</label>
              <input type="number" class="control" v-model.number="form.cantidadTotal" placeholder="0" min="0" />
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="section-card">
          <div class="section-head">
            <h4>Observaciones</h4>
            <p class="hint">Notas adicionales sobre la entrada</p>
          </div>
          
          <div class="field">
            <label>Comentarios</label>
            <textarea class="control" v-model="form.observaciones" placeholder="Agregar observaciones..." rows="3"></textarea>
          </div>
        </div>

        <!-- Botones -->
        <div class="form-footer">
          <div style="display: flex; gap: 12px;">
            <button class="btn secondary" type="button">
              <span>✕</span>
              Cancelar
            </button>
            <button class="btn primary save-btn" type="submit">
              <span class="icon">💾</span>
              Registrar Entrada
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to top button con estilos globales -->
    <Transition name="scroll-btn">
      <button 
        v-show="showScrollTop" 
        @click="scrollToTop"
        class="scroll-to-top-btn"
        :class="{ 'animating-out': isAnimatingOut }"
        aria-label="Volver al inicio"
      >
        <span class="scroll-icon">↑</span>
        <span class="scroll-text">Volver al principio</span>
      </button>
    </Transition>
  </FormShell>
</template>

<script setup>
import FormShell from '@/components/FormShell.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Formulario
const form = ref({
  numeroOrden: '',
  fechaEntrada: '',
  proveedor: '',
  tipoMaterial: '',
  responsable: '',
  cantidadTotal: 0,
  observaciones: ''
})

// Scroll to top functionality (usando estilos globales)
const showScrollTop = ref(false)
const isAnimatingOut = ref(false)
let hideTimeout = null

const handleScroll = () => {
  const shouldShow = window.scrollY > 250
  
  if (shouldShow && !showScrollTop.value) {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
    isAnimatingOut.value = false
    showScrollTop.value = true
  } else if (!shouldShow && showScrollTop.value && !isAnimatingOut.value) {
    isAnimatingOut.value = true
    showScrollTop.value = false
    hideTimeout = setTimeout(() => {
      isAnimatingOut.value = false
    }, 400)
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<!-- Sin estilos scoped - usa los estilos globales -->
<style scoped>
/* Solo estilos específicos de este componente que no están globalizados */
</style>
