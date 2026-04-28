<template>
  <component 
    :is="resolvedIcon" 
    :style="computedStyle"
  />
</template>

<script setup>
import { computed } from 'vue'
import * as AllIcons from '@kalimahapps/vue-icons'

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

const resolvedIcon = computed(() => {
  if (!props.name) return null
  
  const [prefix, iconName] = props.name.split(':')
  if (!prefix || !iconName) return null
  
  const componentName = prefix.toUpperCase() + iconName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
  
  // Try to get from the all icons object
  const icon = AllIcons[`${prefix}${iconName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`]
  return icon || null
})

const computedStyle = computed(() => ({
  display: 'inline-block',
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color
}))
</script>
