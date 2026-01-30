<template>
  <div class="folio-input">
    <span class="folio-prefix">{{ prefix }}</span>
    <input
      class="control folio-num"
      :value="displayNumber"
      @input="onInput"
      @blur="onBlur"
      inputmode="numeric"
      pattern="[0-9]*"
      placeholder="000001"
      maxlength="6"
      aria-label="Número de folio"
      style="letter-spacing:1px"
    />
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' }, digits: { type: Number, default: 6 }, prefix: { type: String, default: 'E-' } })
const prefix = toRef(props, 'prefix')
const emit = defineEmits(['update:modelValue'])

// Extrae solo la parte numérica del folio si existe
function parseNumber(v) {
  if (!v) return ''
  const s = String(v).trim()
  // permitir formatos: "E-001", "e-1", "001", "1"
  const match = s.match(/[0-9]+$/)
  if (match) return match[0]
  return ''
}

const displayNumber = computed(() => {
  const n = parseNumber(props.modelValue)
  return n
})

function emitFull(num) {
  const cleaned = (num || '').replace(/[^0-9]/g, '').slice(0, props.digits)
  if (cleaned === '') {
    emit('update:modelValue', '')
  } else {
    const padded = cleaned.padStart(props.digits, '0')
    emit('update:modelValue', `${props.prefix}${padded}`)
  }
}

function onInput(e) {
  const raw = e.target.value || ''
  const numbersOnly = raw.replace(/\D/g, '').slice(0, props.digits)
  // update the input value visually (show raw digits while typing)
  e.target.value = numbersOnly
  // Emit the raw digits while typing (no prefix or padding) so the user can type freely
  if (numbersOnly === '') emit('update:modelValue', '')
  else emit('update:modelValue', numbersOnly)
}

function onBlur(e) {
  const raw = e.target.value || ''
  emitFull(raw)
}
</script>

<style scoped>
.folio-input {
  display: flex;
  align-items: center;
  gap: 8px;
}
.folio-prefix {
  font-weight: 800;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 8px 10px;
  border-radius: 10px;
  color: #e6eef8;
}
.folio-num {
  width: 86px;
  text-align: center;
  padding: 8px 10px;
}
</style>