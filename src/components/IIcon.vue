<template>
  <span 
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeValue,
      height: sizeValue,
      color: color,
      lineHeight: '1',
      flexShrink: 0
    }"
  >
    <component :is="iconComponent" v-if="iconComponent" />
  </span>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const sizeValue = computed(() => {
  const s = props.size
  return typeof s === 'number' ? `${s}px` : s
})

// Map icon names to lucide-vue-next component names
const iconNameMap = {
  'ic:baseline-alt-route': 'GitBranch',
  'ic:baseline-inventory': 'Package',
  'ic:baseline-format-list-numbered': 'List',
  'ic:baseline-reviews': 'FileText',
  'ic:baseline-flag': 'Flag',
  'ic:baseline-check': 'Check',
  'ic:baseline-swap-horiz': 'ArrowRightLeft',
  'ic:baseline-close': 'X',
  'ic:baseline-arrow-forward': 'ChevronRight',
  'ic:baseline-arrow-back': 'ChevronLeft',
  'ic:baseline-radio-button-checked': 'Circle',
  'ic:baseline-check-box': 'CheckSquare',
  'ic:baseline-check-box-outline-blank': 'Square',
  'ic:baseline-branding-watermark': 'Layers',
  'ic:baseline-qr-code': 'QrCode',
  'ic:baseline-search': 'Search',
  'ic:baseline-warehouse': 'Warehouse',
  'ic:baseline-remove-circle-outline': 'MinusCircle',
  'ic:baseline-add-circle-outline': 'PlusCircle',
  'ic:baseline-check-circle': 'CheckCircle',
  'ic:baseline-error-outline': 'AlertCircle',
  'ic:baseline-search-off': 'SearchX',
  'ic:baseline-inventory-2': 'Box',
  'ic:baseline-view-list': 'ListIcon',
  'ic:baseline-layers': 'Layers',
  'ic:baseline-playlist-add': 'Plus',
  'ic:baseline-assignment': 'FileText',
  'ic:baseline-handyman': 'Wrench',
  'ic:baseline-description': 'FileText',
  'solar:document-add-line-duotone': 'FilePlus'
}

const iconComponent = computed(() => {
  const lucideName = iconNameMap[props.name]
  if (!lucideName) return null
  const Icon = LucideIcons[lucideName]
  if (!Icon) return null
  return Icon
})
</script>
