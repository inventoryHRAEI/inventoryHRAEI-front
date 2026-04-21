<template>
  <component
    :is="iconComponent"
    :class="['op-icon', `size-${size}`, colorClass, { 'is-animated': animated }]"
    :style="customStyle"
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'

// HeroIcons imports - outline style for professional look
import {
  // Navigation & Actions
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  
  // Documents & Data
  DocumentTextIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  
  // Users & People
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  UserCircleIcon,
  IdentificationIcon,
  
  // Medical & Equipment
  HeartIcon,
  BeakerIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  WrenchIcon,
  CogIcon,
  Cog6ToothIcon,
  
  // Objects & Items
  CubeIcon,
  ArchiveBoxIcon,
  ArchiveBoxArrowDownIcon,
  InboxIcon,
  InboxArrowDownIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  
  // Interface & UI
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
  
  // Status & Info
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  
  // Time & Calendar
  CalendarIcon,
  CalendarDaysIcon,
  ClockIcon,
  
  // Communication
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  BellIcon,
  BellAlertIcon,
  
  // Files & Folders
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  
  // Misc
  PrinterIcon,
  QrCodeIcon,
  TagIcon,
  BookmarkIcon,
  StarIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  PencilIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  LinkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ServerIcon,
  CpuChipIcon,
  BoltIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

// Solid variants for filled states
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ExclamationCircleIcon as ExclamationCircleSolidIcon,
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  BellIcon as BellSolidIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(v)
  },
  color: {
    type: String,
    default: 'current'
  },
  animated: {
    type: Boolean,
    default: false
  },
  solid: {
    type: Boolean,
    default: false
  }
})

// Icon mapping
const iconMap = {
  // Navigation
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-up': ArrowUpIcon,
  'refresh': ArrowPathIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'close': XMarkIcon,
  'x': XMarkIcon,
  'plus': PlusIcon,
  'minus': MinusIcon,
  'check': CheckIcon,
  
  // Documents
  'document': DocumentTextIcon,
  'document-text': DocumentTextIcon,
  'document-duplicate': DocumentDuplicateIcon,
  'document-download': DocumentArrowDownIcon,
  'document-upload': DocumentArrowUpIcon,
  'document-check': DocumentCheckIcon,
  'clipboard': ClipboardDocumentListIcon,
  'clipboard-check': ClipboardDocumentCheckIcon,
  
  // Users
  'user': UserIcon,
  'users': UserGroupIcon,
  'user-plus': UserPlusIcon,
  'user-circle': UserCircleIcon,
  'id': IdentificationIcon,
  'identification': IdentificationIcon,
  
  // Medical & Equipment
  'heart': HeartIcon,
  'heart-solid': HeartSolidIcon,
  'beaker': BeakerIcon,
  'lab': BeakerIcon,
  'shield': ShieldCheckIcon,
  'shield-check': ShieldCheckIcon,
  'wrench': WrenchIcon,
  'tools': WrenchScrewdriverIcon,
  'maintenance': WrenchScrewdriverIcon,
  'cog': CogIcon,
  'settings': Cog6ToothIcon,
  
  // Objects
  'cube': CubeIcon,
  'box': CubeIcon,
  'archive': ArchiveBoxIcon,
  'archive-down': ArchiveBoxArrowDownIcon,
  'inbox': InboxIcon,
  'inbox-down': InboxArrowDownIcon,
  'building': BuildingOfficeIcon,
  'hospital': BuildingOffice2Icon,
  
  // Interface
  'search': MagnifyingGlassIcon,
  'adjustments': AdjustmentsHorizontalIcon,
  'filter': FunnelIcon,
  'menu': Bars3Icon,
  'dots-vertical': EllipsisVerticalIcon,
  'dots-horizontal': EllipsisHorizontalIcon,
  
  // Status
  'warning': ExclamationTriangleIcon,
  'alert': ExclamationTriangleIcon,
  'error': ExclamationCircleIcon,
  'error-solid': ExclamationCircleSolidIcon,
  'info': InformationCircleIcon,
  'success': CheckCircleIcon,
  'success-solid': CheckCircleSolidIcon,
  'fail': XCircleIcon,
  'fail-solid': XCircleSolidIcon,
  'question': QuestionMarkCircleIcon,
  'help': QuestionMarkCircleIcon,
  
  // Time
  'calendar': CalendarIcon,
  'calendar-days': CalendarDaysIcon,
  'clock': ClockIcon,
  'time': ClockIcon,
  
  // Communication
  'chat': ChatBubbleLeftIcon,
  'chat-double': ChatBubbleLeftRightIcon,
  'message': ChatBubbleLeftIcon,
  'email': EnvelopeIcon,
  'mail': EnvelopeIcon,
  'bell': BellIcon,
  'bell-solid': BellSolidIcon,
  'notification': BellAlertIcon,
  
  // Filesa
  'folder': FolderIcon,
  'folder-open': FolderOpenIcon,
  'folder-plus': FolderPlusIcon,
  
  // Misc
  'print': PrinterIcon,
  'qr': QrCodeIcon,
  'qr-code': QrCodeIcon,
  'tag': TagIcon,
  'label': TagIcon,
  'bookmark': BookmarkIcon,
  'bookmark-solid': BookmarkSolidIcon,
  'star': StarIcon,
  'star-solid': StarSolidIcon,
  'lock': LockClosedIcon,
  'unlock': LockOpenIcon,
  'eye': EyeIcon,
  'eye-off': EyeSlashIcon,
  'hide': EyeSlashIcon,
  'trash': TrashIcon,
  'delete': TrashIcon,
  'edit': PencilIcon,
  'pencil': PencilIcon,
  'edit-square': PencilSquareIcon,
  'download': ArrowDownTrayIcon,
  'upload': ArrowUpTrayIcon,
  'share': ShareIcon,
  'link': LinkIcon,
  'image': PhotoIcon,
  'photo': PhotoIcon,
  'cloud-upload': CloudArrowUpIcon,
  'cloud-download': CloudArrowDownIcon,
  'server': ServerIcon,
  'cpu': CpuChipIcon,
  'chip': CpuChipIcon,
  'bolt': BoltIcon,
  'lightning': BoltIcon,
  'fire': FireIcon,
  'sparkles': SparklesIcon,
  'magic': SparklesIcon,
  
  // Operation-specific aliases
  'entrada': ArrowDownTrayIcon,
  'salida': ArrowUpTrayIcon,
  'resguardo': ShieldCheckIcon,
  'servicio': WrenchScrewdriverIcon,
  'equipo': CubeIcon,
  'consumible': BeakerIcon,
  'accesorio': CogIcon,
  'mobiliario': ArchiveBoxIcon,
  'refaccion': Cog6ToothIcon
}

const iconComponent = computed(() => {
  const icon = iconMap[props.name]
  if (!icon) {
    console.warn(`[OpIcon] Unknown icon name: ${props.name}`)
    return QuestionMarkCircleIcon
  }
  return icon
})

const colorClass = computed(() => {
  const colorMap = {
    'current': '',
    'primary': 'color-primary',
    'success': 'color-success',
    'warning': 'color-warning',
    'danger': 'color-danger',
    'info': 'color-info',
    'muted': 'color-muted',
    'entrada': 'color-entrada',
    'salida': 'color-salida',
    'resguardo': 'color-resguardo',
    'servicio': 'color-servicio'
  }
  return colorMap[props.color] || ''
})

const customStyle = computed(() => {
  // Allow custom colors via CSS custom property
  if (props.color && !['current', 'primary', 'success', 'warning', 'danger', 'info', 'muted', 'entrada', 'salida', 'resguardo', 'servicio'].includes(props.color)) {
    return { color: props.color }
  }
  return {}
})
</script>

<style scoped>
.op-icon {
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* Sizes */
.op-icon.size-xs {
  width: 14px;
  height: 14px;
}

.op-icon.size-sm {
  width: 18px;
  height: 18px;
}

.op-icon.size-md {
  width: 22px;
  height: 22px;
}

.op-icon.size-lg {
  width: 26px;
  height: 26px;
}

.op-icon.size-xl {
  width: 32px;
  height: 32px;
}

.op-icon.size-2xl {
  width: 40px;
  height: 40px;
}

/* Colors */
.op-icon.color-primary {
  color: #3b82f6;
}

.op-icon.color-success {
  color: #22c55e;
}

.op-icon.color-warning {
  color: #f59e0b;
}

.op-icon.color-danger {
  color: #ef4444;
}

.op-icon.color-info {
  color: #06b6d4;
}

.op-icon.color-muted {
  color: rgba(255, 255, 255, 0.5);
}

/* Operation-specific colors */
.op-icon.color-entrada {
  color: var(--op-entrada-color, #22c55e);
}

.op-icon.color-salida {
  color: var(--op-salida-color, #f59e0b);
}

.op-icon.color-resguardo {
  color: var(--op-resguardo-color, #a855f7);
}

.op-icon.color-servicio {
  color: var(--op-servicio-color, #3b82f6);
}

/* Animated state */
.op-icon.is-animated {
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* Hover effect when inside interactive elements */
button:hover .op-icon,
a:hover .op-icon,
.clickable:hover .op-icon {
  transform: scale(1.1);
}

button:active .op-icon,
a:active .op-icon,
.clickable:active .op-icon {
  transform: scale(0.95);
}
</style>
