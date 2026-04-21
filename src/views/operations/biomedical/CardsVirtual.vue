<template>
  <div ref="root" class="cards-virtual" @scroll.passive="onScroll">
    <div :style="{ height: topSpacer + 'px' }" />
    <div class="rows">
      <div v-for="(row, rIdx) in visibleRows" :key="rIdx" class="row" :style="{ height: itemHeight + 'px' }">
        <div v-for="(item, cIdx) in row" :key="getItemKey(item, (startIndex + rIdx*columns + cIdx))" class="cell">
          <CardItem
            v-if="item"
            :item="item"
            :index="startIndex + rIdx*columns + cIdx"
            :get-item-key="getItemKey"
            :is-expanded="isExpanded"
            :is-sparse="isSparse"
            :get-status-accent-class="getStatusAccentClass"
            :get-status-glow-class="getStatusGlowClass"
            :get-status-text-class="getStatusTextClass"
            :get-status-pill-class="getStatusPillClass"
            :is-in-maintenance="isInMaintenance"
            :get-maintenance-entry="getMaintenanceEntry"
            :is-field-visible="isFieldVisible"
            :display-value="displayValue"
            :has-real-value="hasRealValue"
            :is-dynamic-field-duplicate="isDynamicFieldDuplicate"
            :get-dynamic-field-label="getDynamicFieldLabel"
            :get-item-field-value="getItemFieldValue"
            :active-dynamic-filter-ids="activeDynamicFilterIds"
            :on-toggle-select="toggleSelect"
            :on-show-barcode="onShowBarcode"
            :on-show-update-panel="onShowUpdatePanel"
            :on-show-history-panel="onShowHistoryPanel"
          />
          <div v-else class="cell-placeholder"></div>
        </div>
      </div>
    </div>
    <div :style="{ height: bottomSpacer + 'px' }" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import CardItem from './CardItem.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  itemHeight: { type: Number, default: 360 },
  minColumnWidth: { type: Number, default: 300 },
  bufferRows: { type: Number, default: 2 },
  getItemKey: { type: Function, required: true },
  isExpanded: { type: Function, required: true },
  isSparse: { type: Function, required: true },
  getStatusAccentClass: { type: Function, required: true },
  getStatusGlowClass: { type: Function, required: true },
  getStatusTextClass: { type: Function, required: true },
  getStatusPillClass: { type: Function, required: true },
  isInMaintenance: { type: Function, required: true },
  getMaintenanceEntry: { type: Function, required: true },
  isFieldVisible: { type: Function, required: true },
  displayValue: { type: Function, required: true },
  hasRealValue: { type: Function, required: true },
  isDynamicFieldDuplicate: { type: Function, required: true },
  getDynamicFieldLabel: { type: Function, required: true },
  getItemFieldValue: { type: Function, required: true },
  activeDynamicFilterIds: { type: Array, default: () => [] },
  toggleSelect: { type: Function, required: true },
  onShowBarcode: { type: Function, required: true },
  onShowUpdatePanel: { type: Function, required: true },
  onShowHistoryPanel: { type: Function, required: true }
})

const root = ref(null)
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)

let resizeObserver = null

function updateSize() {
  if (!root.value) return
  containerWidth.value = root.value.clientWidth
  containerHeight.value = root.value.clientHeight
}

onMounted(() => {
  updateSize()
  resizeObserver = new ResizeObserver(() => updateSize())
  resizeObserver.observe(root.value)
})

onBeforeUnmount(() => {
  try { if (resizeObserver) resizeObserver.disconnect() } catch (e) {}
})

function onScroll(e) {
  scrollTop.value = e.target.scrollTop
}

const columns = computed(() => Math.max(1, Math.floor(containerWidth.value / props.minColumnWidth)))
const rows = computed(() => Math.ceil(props.items.length / columns.value))
const visibleRowCount = computed(() => Math.ceil(containerHeight.value / props.itemHeight) || 1)

const startRow = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferRows))
const endRow = computed(() => Math.min(rows.value, startRow.value + visibleRowCount.value + props.bufferRows * 2))

const startIndex = computed(() => startRow.value * columns.value)
const endIndex = computed(() => Math.min(props.items.length, endRow.value * columns.value))

const topSpacer = computed(() => startRow.value * props.itemHeight)
const bottomSpacer = computed(() => Math.max(0, (rows.value - endRow.value) * props.itemHeight))

const visibleRows = computed(() => {
  const out = []
  for (let r = startRow.value; r < endRow.value; r++) {
    const rowItems = []
    for (let c = 0; c < columns.value; c++) {
      const idx = r * columns.value + c
      rowItems.push(props.items[idx] || null)
    }
    out.push(rowItems)
  }
  return out
})
</script>

<style scoped>
.cards-virtual {
  overflow: auto;
  height: 100%;
}
.rows {
  display: block;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 8px 12px;
  box-sizing: border-box;
}
.cell {
  min-width: 0;
}
.cell-placeholder {
  height: 320px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
}
.large-dataset-banner {
  background: rgba(255, 249, 196, 0.12);
  border: 1px solid rgba(255, 235, 59, 0.12);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}
</style>