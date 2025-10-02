import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import './styles.css'

const app = createApp(App)

app.use(router)
app.use(Toast, { position: 'bottom-left', pauseOnHover: true })

app.mount('#app')

// Nota: `toast` se puede importar desde 'vue3-toastify' en componentes cuando se necesite.
