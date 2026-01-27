<template>
  <span 
    :style="{
      display: 'inline-block',
      width: sizeValue,
      height: sizeValue,
      color: color
    }"
    v-html="svgContent"
  />
</template>

<script setup>
import { computed } from 'vue'

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

const iconMap = {
  'ic:baseline-medical-services': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-6V4h-4v4H4c-1.1 0-2 .9-2 2v11h20V10c0-1.1-.9-2-2-2zm-12 7H8v4H6v-4H2v-2h4v-4h2v4h4v2z"/></svg>',
  'ic:baseline-inventory-2': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 11h1v-1h-1v1zm4 0h1v-1h-1v1zm-8 0h1v-1h-1v1zm0-4h1V6h-1v1zm4 0h1V6h-1v1zm4 0h1V6h-1v1zm5 14H2V3h20v18zm-2-2h-1.5V5H6.5v16H18z"/></svg>',
  'ic:wrench': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.6C.4 7 .9 10 2.9 12c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.5z"/></svg>',
  'ic:check-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
  'ic:baseline-business': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm7 10h-4v4h-2v-4H9v-2h4v-4h2v4h4v2z"/></svg>',
  'ic:baseline-architecture': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 11h3V9h-3v2zm7-2h3v2h-3V9zm7 0h3v2h-3V9zM2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2zm2 10v-6h16v6H4z"/></svg>',
  'ic:baseline-qr-code': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2v2h3v-2h-3zm0 6h2v-2h-2v2z"/></svg>',
  'ic:baseline-tune': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v-2H9v6h2v-2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',
  'ic:baseline-search': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  'ic:baseline-refresh': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h6V5l-1.35 1.35z"/></svg>',
  'ic:baseline-layers': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16.5L3.5 12 12 7.5 20.5 12 12 16.5zM12 2 3.5 6.5 12 11l8.5-4.5L12 2zm0 18l-8.5-4.5 8.5-4.5 8.5 4.5-8.5 4.5z"/></svg>',
  'ic:baseline-warning-amber': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
  'ic:baseline-error-outline': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
  'ic:baseline-filter-alt-off': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.36 18.78L1.41 23.74 0 22.33 4.96 17.38 6.36 18.78zM19.07 4.69L17.66 3.28 5.21 15.73l1.41 1.41 13.45-13.45zM4.29 5c-1.33 1.33-4.29 5.04-4.29 5v11h6v-4h4v4h6V10c0 0-3.46-3.71-4.79-5.04L4.29 5z"/></svg>',
  'ic:baseline-chevron-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
  'ic:baseline-local-hospital': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 11h-2v2h-2v-2H8v-2h2v-2h2v2h2v2z"/></svg>',
  'ic:baseline-chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>',
  'ic:baseline-info': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  'ic:baseline-cloud-off': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2z"/></svg>',
  'ic:baseline-inventory': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H4V4h14v10z"/></svg>',
  'ic:baseline-view-list': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 14h17v-2H4v2zm0 5h17v-2H4v2zM4 9h17V7H4v2z"/></svg>'
}

const svgContent = computed(() => {
  return iconMap[props.name] || ''
})
</script>
