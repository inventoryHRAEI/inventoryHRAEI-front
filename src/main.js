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

// Ejecutar al inicio y en resize/ orientation change
if (typeof window !== 'undefined'){
	window.requestAnimationFrame(updateTopbarCSSVars)
	window.addEventListener('resize', () => { window.requestAnimationFrame(updateTopbarCSSVars) })
	window.addEventListener('orientationchange', () => { window.requestAnimationFrame(updateTopbarCSSVars) })
	// también recalcula cuando el DOM cambie levemente (ej: menús abren/cierran)
	const obs = new MutationObserver(() => { window.requestAnimationFrame(updateTopbarCSSVars) })
	obs.observe(document.body, { attributes: true, childList: true, subtree: true })
}
