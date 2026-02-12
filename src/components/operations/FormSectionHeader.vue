<template>
  <div 
    class="form-section-header" 
    :class="{ 'is-collapsible': collapsible, 'is-collapsed': isCollapsed }"
    @click="collapsible && toggleCollapse()"
  >
    <div class="header-content">
      <div class="icon-wrapper" :class="iconColorClass">
        <component :is="resolvedIcon" class="section-icon" />
      </div>
      <div class="title-group">
        <h4 class="section-title">{{ title }}</h4>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    
    <div class="header-actions">
      <slot name="actions" />
      <button 
        v-if="collapsible" 
        type="button" 
        class="collapse-btn"
        :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expandir sección' : 'Contraer sección'"
      >
        <svg 
          class="chevron-icon" 
          :class="{ rotated: !isCollapsed }"
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { 
  UserIcon, 
  DocumentTextIcon, 
  CubeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'document' },
  iconColor: { type: String, default: 'blue' },
  collapsible: { type: Boolean, default: false },
  defaultCollapsed: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle'])

const isCollapsed = ref(props.defaultCollapsed)

const iconMap = {
  user: UserIcon,
  document: DocumentTextIcon,
  cube: CubeIcon,
  wrench: WrenchScrewdriverIcon,
  clipboard: ClipboardDocumentListIcon,
  shield: ShieldCheckIcon,
  'arrow-down': ArrowDownTrayIcon,
  'arrow-up': ArrowUpTrayIcon
}

const resolvedIcon = computed(() => iconMap[props.icon] || DocumentTextIcon)

const iconColorClass = computed(() => `icon-${props.iconColor}`)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

defineExpose({ isCollapsed })
</script>

<style scoped>
.form-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
  border-radius: 14px 14px 0 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-section-header.is-collapsible {
  cursor: pointer;
}

.form-section-header.is-collapsible:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%);
}

.form-section-header.is-collapsed {
  border-radius: 14px;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.icon-wrapper.icon-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
  color: #60a5fa;
}

.icon-wrapper.icon-green {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #4ade80;
}

.icon-wrapper.icon-purple {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
  color: #c084fc;
}

.icon-wrapper.icon-amber {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
  color: #fbbf24;
}

.icon-wrapper.icon-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
  color: #22d3ee;
}

.section-icon {
  width: 22px;
  height: 22px;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: rgba(255,255,255,0.95);
  letter-spacing: -0.02em;
}

.section-subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.55);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
}

.chevron-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

@media (max-width: 640px) {
  .form-section-header {
    padding: 14px 16px;
  }
  
  .icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .section-icon {
    width: 18px;
    height: 18px;
  }
  
  .section-title {
    font-size: 0.95rem;
  }
  
  .section-subtitle {
    font-size: 0.78rem;
  }
}
</style>
