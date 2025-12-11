<template>
  <svg
    v-if="active"
    class="w-4 h-4 inline transition-transform"
    :class="{ 'transform rotate-180': direction === 'desc' }"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v2.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L15 10.586V8z"></path>
  </svg>
  <svg
    v-else
    class="w-4 h-4 inline opacity-30"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v2.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L15 10.586V8z"></path>
  </svg>
</template>

<script setup>
defineProps({
  active: Boolean,
  direction: {
    type: String,
    default: 'asc',
  },
})
</script>
