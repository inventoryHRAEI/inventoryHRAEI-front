<template>
  <transition name="mobile-modal">
    <div v-if="store.visible" class="mobile-modal-backdrop" @click="close" role="dialog" aria-modal="true">
      <div class="mobile-modal" @click.stop>
        <button class="close" @click="close" aria-label="Cerrar">✕</button>
        <div class="mobile-modal-body">
          <div class="icon" :class="store.type"> 
            <svg v-if="store.type === 'success'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else-if="store.type === 'error'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="1.8"/><path d="M12 8v5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r=".5" fill="#fff"/></svg>
          </div>
          <div class="message">{{ store.message }}</div>
        </div>
        <div class="actions"><button class="btn primary" @click="close">Aceptar</button></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { mobileNotify as store, hideMobileNotice } from '@/stores/mobileNotificationStore'
const close = () => hideMobileNotice()
</script>

<style scoped>
.mobile-modal-backdrop{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); padding:18px; z-index:9999 }
.mobile-modal{ width:100%; max-width:420px; background: #fff; border-radius:12px; box-shadow:0 24px 60px rgba(2,6,23,0.44); overflow:hidden; transform-origin:center center }
.mobile-modal-body{ padding:20px; display:flex; gap:12px; align-items:center }
.mobile-modal .icon{ width:56px; height:56px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center }
.mobile-modal .icon.success{ background: linear-gradient(180deg,#1ccf6a,#0aa44a) }
.mobile-modal .icon.error{ background: linear-gradient(180deg,#ff6b6b,#e03b3b) }
.mobile-modal .icon.info{ background: linear-gradient(180deg,#5fb6ff,#2b8cff) }
.mobile-modal .message{ color:#0c2230; font-size:15px; line-height:1.25; flex:1 }
.mobile-modal .actions{ padding:12px 18px; display:flex; justify-content:flex-end; border-top:none; background:transparent }
.mobile-modal .btn.primary{ background: linear-gradient(180deg,#00c853,#00701a); color:#fff; padding:10px 14px; border-radius:10px; border:none; font-weight:700 }
.mobile-modal .close{ position:absolute; right:10px; top:8px; background:transparent; border:none; font-size:18px; color:#666; padding:6px; border-radius:6px }

/* transition */
.mobile-modal-enter-from{ transform: scale(.96) translateY(8px); opacity:0 }
.mobile-modal-enter-active{ transition: all .26s cubic-bezier(.2,.9,.2,1) }
.mobile-modal-enter-to{ transform: scale(1) translateY(0); opacity:1 }
.mobile-modal-leave-from{ transform: scale(1) translateY(0); opacity:1 }
.mobile-modal-leave-active{ transition: all .22s cubic-bezier(.2,.9,.2,1) }
.mobile-modal-leave-to{ transform: scale(.96) translateY(8px); opacity:0 }
</style>
