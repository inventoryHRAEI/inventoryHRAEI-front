<template>
    <Teleport to="body">
        <transition name="overlay-fade">
            <div v-if="open" class="scan-overlay-container scan-overlay-backdrop" @click.self="emit('close')">
                <div class="scan-overlay-card scan-modern-card" role="dialog" aria-modal="true">
                <!-- Header with Icon and Close -->
                <div class="scan-card-header">
                    <div class="scan-card-icon">
                        <QrCodeIcon class="icon" />
                    </div>
                    <button class="scan-close-btn" @click="emit('close')" aria-label="Cerrar">
                        <XMarkIcon class="icon" />
                    </button>
                </div>

                <!-- Title Section -->
                <div class="scan-card-title">
                    <h2>Código Escaneado</h2>
                    <p class="scan-code-display">{{ item?.['No DE INVENTARIO'] || code }}</p>
                </div>

                <!-- Equipment Info Card -->
                <div v-if="item" class="scan-equipment-info">
                    <div class="info-badge">
                        <span class="badge-label">Equipo Médico</span>
                        <span class="badge-value">{{ item['EQUIPO MEDICO'] || 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="info-label">Marca</span>
                            <span class="info-value">{{ item['MARCA'] || '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Modelo</span>
                            <span class="info-value">{{ item['MODELO'] || '—' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Auth Section -->
                <div class="scan-auth-section">
                    <div v-if="!showLogin" class="auth-prompt">
                        <p class="auth-message">Para acceder a más información, por favor inicia sesión</p>
                        <div class="auth-buttons">
                            <button class="btn-login" @click.prevent="showLogin = true">
                                <ArrowRightOnRectangleIcon class="icon" />
                                Iniciar Sesión
                            </button>
                            <button class="btn-dismiss" @click.prevent="emit('close')">
                                Cerrar
                            </button>
                        </div>
                    </div>

                    <form v-else class="auth-form" @submit.prevent="doLogin">
                        <div class="form-group">
                            <label for="email">
                                <EnvelopeIcon class="icon-inline" />
                                Correo Electrónico
                            </label>
                            <input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
                        </div>
                        <div class="form-group">
                            <label for="password">
                                <LockClosedIcon class="icon-inline" />
                                Contraseña
                            </label>
                            <input id="password" v-model="password" type="password" placeholder="••••••••" required />
                        </div>
                        <div v-if="error" class="form-error">
                            <ExclamationCircleIcon class="icon-error" />
                            {{ error }}
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-submit">Entrar</button>
                            <button type="button" class="btn-full-login" @click.prevent="goToFullLogin">Usar login
                                completo</button>
                        </div>
                    </form>
                </div>
            </div>
            </div>
            </transition>
            </Teleport>
            </template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { saveToken } from '@/utils/auth'
import {
    QrCodeIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
    open: Boolean,
    item: {
        type: Object,
        default: null
    },
    code: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['login', 'close', 'logged'])
const showLogin = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

// Control de scroll cuando la modal está abierta
watch(() => props.open, (val) => {
    if (val) {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
    } else {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
    }
})

async function doLogin() {
    error.value = ''
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: email.value, password: password.value })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.msg || 'Credenciales inválidas')
        if (data.token) saveToken(data.token)
        if (data.role) localStorage.setItem('role', data.role)
        if (data.nombre) localStorage.setItem('nombre', data.nombre)
        if (data.email) localStorage.setItem('email', data.email)
        localStorage.setItem('user', JSON.stringify({ nombre: data.nombre, role: data.role, email: data.email }))
        try { window.dispatchEvent(new Event('session:updated')) } catch { }
        emit('logged')
        emit('close')
    } catch (e) {
        error.value = e && e.message ? e.message : 'No se pudo iniciar sesión'
    }
}

function goToFullLogin() {
    const params = { next: window.location.pathname + window.location.search }
    router.push({ name: 'login', query: params })
}
</script>

<style scoped>
/* ==================== MAIN OVERLAY ==================== */
.scan-overlay-container,
.scan-overlay-backdrop {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(1000px 700px at 25% 15%, rgba(30, 58, 138, 0.5), rgba(3, 8, 20, 0.8));
    backdrop-filter: blur(8px) saturate(1.1);
    -webkit-backdrop-filter: blur(8px) saturate(1.1);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
    overflow: hidden;
    contain: layout style paint;
}

/* ==================== CARD CONTAINER ==================== */
.scan-overlay-card,
.scan-modern-card {
    background: linear-gradient(135deg, rgba(10, 25, 50, 0.96), rgba(5, 15, 38, 0.98));
    border: 1.5px solid rgba(99, 160, 255, 0.45);
    border-radius: 28px;
    padding: 32px;
    width: 100%;
    max-width: 550px;
    max-height: calc(100vh - 40px);
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow:
        0 25px 60px rgba(0, 0, 0, 0.7),
        0 0 50px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    animation: card-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    flex-shrink: 0;
}

.scan-overlay-card::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 28px;
    background: radial-gradient(800px 300px at 10% 0%, rgba(99, 160, 255, 0.2), transparent 40%),
        radial-gradient(800px 300px at 90% 100%, rgba(99, 160, 255, 0.15), transparent 40%);
    pointer-events: none;
    z-index: -1;
}

.scan-overlay-card::-webkit-scrollbar {
    width: 10px;
}

.scan-overlay-card::-webkit-scrollbar-track {
    background: rgba(99, 160, 255, 0.08);
    border-radius: 6px;
}

.scan-overlay-card::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(99, 160, 255, 0.5), rgba(125, 211, 252, 0.4));
    border-radius: 6px;
}

.scan-overlay-card::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(99, 160, 255, 0.7), rgba(125, 211, 252, 0.6));
}

/* ==================== HEADER ==================== */
.scan-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
}

.scan-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(99, 160, 255, 0.3));
    border: 2px solid rgba(125, 211, 252, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #06b6d4;
    flex-shrink: 0;
    box-shadow: 0 8px 16px rgba(6, 182, 212, 0.25);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.scan-card-icon:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(6, 182, 212, 0.35);
}

.scan-card-icon .icon {
    width: 32px;
    height: 32px;
}

.scan-close-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.12);
    border: 1.5px solid rgba(239, 68, 68, 0.4);
    color: #f87171;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    flex-shrink: 0;
    padding: 0;
}

.scan-close-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    transform: scale(1.1) rotate(90deg);
}

.scan-close-btn .icon {
    width: 24px;
    height: 24px;
}

/* ==================== TITLE SECTION ==================== */
.scan-card-title {
    margin-bottom: 24px;
    position: relative;
}

.scan-card-title h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #bae6fd;
    margin: 0 0 8px 0;
    letter-spacing: -0.3px;
}

.scan-code-display {
    font-size: 1.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #e0f2fe, #7dd3fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    word-break: break-all;
}

/* ==================== EQUIPMENT INFO ==================== */
.scan-equipment-info {
    margin-bottom: 24px;
}

.info-badge {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(99, 160, 255, 0.15));
    border: 1.5px solid rgba(125, 211, 252, 0.35);
    border-radius: 12px;
    margin-bottom: 12px;
}

.badge-label {
    font-size: 0.85rem;
    color: rgba(125, 211, 252, 0.9);
    font-weight: 600;
    letter-spacing: 0.5px;
}

.badge-value {
    font-size: 0.95rem;
    color: #e5f0ff;
    font-weight: 700;
    text-align: right;
    flex: 1;
    margin-left: 12px;
}

.info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    background: rgba(20, 40, 80, 0.3);
    border: 1px solid rgba(125, 211, 252, 0.2);
    border-radius: 10px;
}

.info-label {
    font-size: 0.8rem;
    color: rgba(125, 211, 252, 0.8);
    font-weight: 700;
}

.info-value {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
}

/* ==================== AUTH SECTION ==================== */
.scan-auth-section {
    position: relative;
    z-index: 1;
}

.auth-prompt {
    text-align: center;
}

.auth-message {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 18px 0;
    line-height: 1.6;
    font-weight: 500;
}

.auth-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn-login,
.btn-dismiss,
.btn-submit,
.btn-full-login {
    padding: 12px 18px;
    border-radius: 11px;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
}

.btn-login {
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    color: white;
    border: 1.5px solid rgba(6, 182, 212, 0.5);
    box-shadow: 0 8px 18px rgba(6, 182, 212, 0.3);
}

.btn-login:hover {
    background: linear-gradient(135deg, #0284c7, #0891b2);
    box-shadow: 0 12px 28px rgba(6, 182, 212, 0.5);
    transform: translateY(-2px);
    border-color: rgba(6, 182, 212, 0.8);
}

.btn-login .icon {
    width: 18px;
    height: 18px;
}

.btn-dismiss {
    background: rgba(99, 160, 255, 0.1);
    color: #7dd3fc;
    border: 1.5px solid rgba(99, 160, 255, 0.35);
}

.btn-dismiss:hover {
    background: rgba(99, 160, 255, 0.2);
    border-color: rgba(99, 160, 255, 0.6);
    box-shadow: 0 6px 16px rgba(99, 160, 255, 0.2);
}

/* ==================== FORM STYLES ==================== */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-group label .icon-inline {
    width: 16px;
    height: 16px;
    opacity: 0.8;
}

.form-group input {
    padding: 12px 14px;
    border-radius: 10px;
    border: 1.5px solid rgba(125, 211, 252, 0.3);
    background: rgba(10, 20, 40, 0.6);
    color: #e5f0ff;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-weight: 500;
}

.form-group input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
    outline: none;
    border-color: rgba(125, 211, 252, 0.8);
    background: rgba(10, 20, 40, 0.8);
    box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.15);
}

.form-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.15);
    border: 1.5px solid rgba(239, 68, 68, 0.4);
    color: #ffb4b4;
    font-size: 0.9rem;
    line-height: 1.5;
}

.form-error .icon-error {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.form-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 8px;
}

.btn-submit {
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    color: white;
    border: 1.5px solid rgba(6, 182, 212, 0.5);
    box-shadow: 0 8px 18px rgba(6, 182, 212, 0.3);
}

.btn-submit:hover {
    background: linear-gradient(135deg, #0284c7, #0891b2);
    box-shadow: 0 12px 28px rgba(6, 182, 212, 0.5);
    transform: translateY(-2px);
    border-color: rgba(6, 182, 212, 0.8);
}

.btn-full-login {
    background: rgba(99, 160, 255, 0.1);
    color: #7dd3fc;
    border: 1.5px solid rgba(99, 160, 255, 0.35);
}

.btn-full-login:hover {
    background: rgba(99, 160, 255, 0.2);
    border-color: rgba(99, 160, 255, 0.6);
    box-shadow: 0 6px 16px rgba(99, 160, 255, 0.2);
}

/* ==================== ANIMATIONS ==================== */
@keyframes card-pop {
    0% {
        transform: scale(0.85) translateY(40px);
        opacity: 0;
    }

    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 560px) {
    .scan-overlay-card {
        padding: 20px;
        max-height: 100vh;
        border-radius: 20px;
        max-width: 100%;
    }

    .scan-card-title h2 {
        font-size: 1.1rem;
    }

    .scan-code-display {
        font-size: 1.5rem;
    }

    .info-row {
        grid-template-columns: 1fr;
    }

    .btn-login,
    .btn-dismiss,
    .btn-submit,
    .btn-full-login {
        width: 100%;
    }
}
</style>
