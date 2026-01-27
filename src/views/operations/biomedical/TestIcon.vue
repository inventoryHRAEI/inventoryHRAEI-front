<template>
  <div style="padding: 20px; background: #1a1a2e; color: white; border-radius: 8px;">
    <h2>Test Icons</h2>
    
    <div style="display: grid; gap: 20px; margin-top: 20px;">
      <!-- Test 1: VueIcon with name prop -->
      <div>
        <h3>Test 1: VueIcon with name prop (should show wrench icon)</h3>
        <VueIcon name="ic:wrench" size="32" style="color: #06b6d4;" />
      </div>
      
      <!-- Test 2: VueIcon with different icon -->
      <div>
        <h3>Test 2: Check circle icon</h3>
        <VueIcon name="ic:check-circle" size="32" style="color: #22c55e;" />
      </div>
      
      <!-- Test 3: VueIcon with baseline-medical-services -->
      <div>
        <h3>Test 3: Medical services icon</h3>
        <VueIcon name="ic:baseline-medical-services" size="32" style="color: #ff6b6b;" />
      </div>
      
      <!-- Debug info -->
      <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px; font-family: monospace; font-size: 12px;">
        <p>Component mounted: yes</p>
        <p>VueIcon component type: {{ typeof VueIcon }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import VueIcon from '@kalimahapps/vue-icons/VueIcon'

console.log('TestIcon component loaded')
console.log('VueIcon:', VueIcon)
</script>

<style scoped>
div {
  margin-bottom: 10px;
}
</style>
