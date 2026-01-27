<template>
    <BiomedicCardActions
        :item="item"
        @show-barcode="$emit('show-barcode', $event)"
        @show-update-panel="$emit('show-update-panel', $event)"
        @show-history-panel="$emit('show-history-panel', $event)" />
</template>

<script setup>
import BiomedicCardActions from '@/components/BiomedicCardActions.vue'

defineProps({
    item: {
        type: Object,
        required: true
    }
})

defineEmits(['show-barcode', 'show-update-panel', 'show-history-panel'])
</script>
