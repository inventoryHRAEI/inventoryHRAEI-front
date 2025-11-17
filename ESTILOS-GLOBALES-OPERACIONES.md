# 📋 Guía de Estilos Globales para Componentes de Operaciones

## 🎯 **¿Qué incluye?**

Los estilos globales están en `src/styles/operations-global.css` e incluyen:

### ✅ **Componentes disponibles:**
- **Layout del formulario** (form-grid, section-card, etc.)
- **Inputs con bordes redondeados** 
- **Botones con efectos 3D**
- **Scroll-to-top con animaciones**
- **Efectos glassmorphism**
- **Responsive design**

## 🛠️ **Cómo usar en tus componentes:**

### **1. Estructura HTML básica:**

```vue
<template>
  <FormShell>
    <template #title>Tu Título</template>
    <div class="op-card">
      <div class="form-grid">
        
        <!-- Sección con glassmorphism -->
        <div class="section-card combined-card">
          <div class="section-head">
            <h4>Título de la Sección</h4>
            <p class="hint">Descripción de la sección</p>
          </div>
          
          <div class="section-grid combined">
            <!-- Campos del formulario -->
            <div class="field">
              <label>Etiqueta</label>
              <input class="control" placeholder="Placeholder..." />
            </div>
          </div>
        </div>

        <!-- Footer con botones -->
        <div class="form-footer">
          <button class="btn secondary">Cancelar</button>
          <button class="btn primary save-btn">Guardar</button>
        </div>
        
      </div>
    </div>
    
    <!-- Scroll to top (opcional) -->
    <Transition name="scroll-btn">
      <button v-show="showScrollTop" class="scroll-to-top-btn">
        <span class="scroll-icon">↑</span>
        <span class="scroll-text">Volver al principio</span>
      </button>
    </Transition>
  </FormShell>
</template>
```

### **2. Clases CSS principales:**

#### **📋 Layout y Estructura:**
- `.op-card` - Contenedor principal
- `.form-grid` - Grid principal del formulario
- `.section-card` - Tarjeta con glassmorphism
- `.combined-card` - Ocupa todo el ancho
- `.section-grid.combined` - Grid interno de 12 columnas

#### **📝 Campos de Formulario:**
- `.field` - Contenedor de cada campo
- `.field input` - Inputs con bordes redondeados automáticos
- `.quantity-field-centered` - Campo numérico centrado

#### **🎨 Botones:**
- `.btn.primary` - Botón principal (verde)
- `.btn.secondary` - Botón secundario (gris)
- `.save-btn` - Botón de guardar ancho completo

#### **🚀 Scroll to Top:**
- `.scroll-to-top-btn` - Botón flotante
- `.scroll-icon` - Ícono del botón
- `.scroll-text` - Texto que aparece en hover

### **3. JavaScript para Scroll-to-Top:**

```javascript
import { ref, onMounted, onBeforeUnmount } from 'vue'

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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  if (hideTimeout) clearTimeout(hideTimeout)
  window.removeEventListener('scroll', handleScroll)
})
```

## 🎯 **Ventajas:**

### ✅ **Consistencia visual:**
- Todos los componentes de operaciones se ven igual
- Misma experiencia de usuario en todas las pantallas

### ✅ **Mantenimiento fácil:**
- Cambios en un solo archivo afectan todos los componentes
- No duplicar CSS en cada archivo

### ✅ **Funcionalidades incluidas:**
- Inputs con bordes redondeados (25px-30px)
- Efectos hover y focus automáticos
- Botones con efectos 3D
- Scroll-to-top con animaciones fluidas
- Responsive design incluido

## 🔧 **Personalización:**

Si necesitas estilos específicos para un componente, úsalos en el `<style scoped>` del componente individual. Los estilos globales servirán como base.

## 📱 **Responsive:**

Los estilos incluyen breakpoints para:
- **Desktop:** > 1040px
- **Tablet:** 860px - 1040px  
- **Mobile:** < 640px

## 🎨 **Colores del tema:**

- **Primary:** Verde (#0bb828, #00701a)
- **Secondary:** Gris (#64748b, #475569)
- **Fondo:** Glassmorphism con blur
- **Texto:** Tonos oscuros con opacidad

¡Ya tienes todo listo para crear componentes de operaciones consistentes! 🚀