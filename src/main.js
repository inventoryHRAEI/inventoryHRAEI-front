import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles.css'
import './styles/operations-global.css'
import './styles/enhancements.css'
import './styles/forms.css'
import './styles/datetime-inputs.css'
// Inicializar windowManager antes de crear la app
import './utils/windowManager'
// Si este window fue abierto por script (query param scriptOpen=1), marcarlo en sessionStorage
if (typeof window !== 'undefined') {
        try {
                const url = new URL(window.location.href)
                const isScriptOpen = url.searchParams.get('scriptOpen')
                if (isScriptOpen === '1') {
                        sessionStorage.setItem('openedByScript', '1')
                        const openerId = url.searchParams.get('openerId')
                        if (openerId) sessionStorage.setItem('openerId', openerId)
                }
        } catch (e) {
                // no crítico
        }
}
// Notivue (notificaciones elegantes)
import { createNotivue } from 'notivue'
import 'notivue/notification.css'
const app = createApp(App)

// Configuración de Notivue: posición, límite y animaciones fade ultra rápidas
const notivue = createNotivue({
        position: 'bottom-left',
        limit: 3,
        enqueue: false,
        transition: 'transform .22s cubic-bezier(.2,.9,.2,1)',
        pauseOnHover: false,
        pauseOnTouch: false,
        notifications: {
                global: { duration: 1160 }
        },
        animations: {
                enter: 'nvSoftEnter',
                leave: 'nvSoftLeave',
                clearAll: 'Notivue__clearAll'
        }
})

app.use(router)
app.use(notivue)

// Ajuste dinámico de variables CSS relacionadas con la topbar.
function updateTopbarCSSVars(){
        try{
                const topbar = document.querySelector('.topbar')
                const root = document.documentElement
                if (!topbar || !root) return
                const rect = topbar.getBoundingClientRect()
                // topbar puede ser fixed y presentar altura variable en móviles
                root.style.setProperty('--topbar-top', Math.max(8, Math.round(rect.top)) + 'px')
                root.style.setProperty('--topbar-height', Math.max(44, Math.round(rect.height)) + 'px')
                // recompute container padding to avoid overlap
                const newPad = `calc(var(--topbar-top) + var(--topbar-height) + 12px)`
                root.style.setProperty('--container-toppad', newPad)
        }catch(e){ /* no crítico */ }
}

function initTopbarObservers(){
        if (typeof window === 'undefined') return
        window.requestAnimationFrame(updateTopbarCSSVars)
        window.addEventListener('resize', () => { window.requestAnimationFrame(updateTopbarCSSVars) })
        window.addEventListener('orientationchange', () => { window.requestAnimationFrame(updateTopbarCSSVars) })
        // también recalcula cuando el DOM cambie levemente (ej: menús abren/cierran)
        const obs = new MutationObserver(() => { window.requestAnimationFrame(updateTopbarCSSVars) })
        obs.observe(document.body, { attributes: true, childList: true, subtree: true })
}

router.isReady().then(() => {
        app.mount('#app')
        initTopbarObservers()
})
