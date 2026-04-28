import { defineStore } from 'pinia'
import { validateSession, clearStoredSessionData } from '@/utils/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: 'loading', // 'loading' | 'authenticated' | 'unauthenticated'
    user: null
  }),
  actions: {
    async checkSession(timeoutMs = 7000) {
      try {
        // If already authenticated or unauthenticated, skip heavy validation
        if (this.status === 'authenticated' || this.status === 'unauthenticated') return this.status

        this.status = 'loading'

        // Use validateSession util which updates localStorage when successful
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        const result = await validateSession()
        clearTimeout(timer)

        if (result && result.authenticated && result.user) {
          this.user = result.user
          this.status = 'authenticated'
        } else {
          this.user = null
          this.status = 'unauthenticated'
        }
      } catch (e) {
        this.user = null
        this.status = 'unauthenticated'
      }
      return this.status
    },
    syncFromLocalStorage() {
      try {
        const raw = localStorage.getItem('user')
        if (!raw) {
          this.user = null
          return
        }
        this.user = JSON.parse(raw)
        // If there's a user but status was unauthenticated, mark authenticated
        if (this.user && this.status !== 'authenticated') this.status = 'authenticated'
      } catch (e) {
        this.user = null
      }
    },
    clearSession() {
      this.user = null
      this.status = 'unauthenticated'
      try { clearStoredSessionData() } catch {}
    }
  }
})
