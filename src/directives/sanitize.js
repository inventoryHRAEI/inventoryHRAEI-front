// Vue directive that sanitizes an input's value as the user types
// usage examples:
//   <input v-model="nombre" v-sanitize>              <!-- general sanitization -->
//   <input v-model="password" v-sanitize:password>   <!-- explicit password rule -->
//   <input v-model="email" v-sanitize:email>         <!-- will not alter emails -->

import { sanitizeString, sanitizePassword } from '@/utils/sanitizer.js'

function strip(value, arg) {
  if (arg === 'password' || /pass(word)?|pwd/i.test(arg)) {
    return sanitizePassword(value)
  }
  if (/email|correo/i.test(arg)) {
    return value // keep email untouched
  }
  return sanitizeString(value)
}

export default {
  beforeMount(el, binding) {
    // only apply to form controls
    if (!['INPUT', 'TEXTAREA'].includes(el.tagName)) return
    const arg = binding.arg || ''
    el.addEventListener('input', (e) => {
      const original = el.value
      const cleaned = strip(original, arg)
      if (cleaned !== original) {
        el.value = cleaned
        // update v-model
        el.dispatchEvent(new Event('input'))
      }
    })
  }
}
