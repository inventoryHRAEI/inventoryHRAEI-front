import { reactive } from 'vue'

// Simple reactive store for mobile notifications
export const mobileNotify = reactive({
  visible: false,
  message: '',
  type: 'info', // 'success' | 'error' | 'info'
  timeout: 4000
})

export function showMobileNotice(message, type = 'info', timeout = 4000) {
  mobileNotify.message = message
  mobileNotify.type = type
  mobileNotify.timeout = timeout
  mobileNotify.visible = true
  if (timeout > 0) {
    setTimeout(() => {
      mobileNotify.visible = false
    }, timeout)
  }
}

export function hideMobileNotice() {
  mobileNotify.visible = false
}
