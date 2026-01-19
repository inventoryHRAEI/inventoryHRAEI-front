<template>
    <BiomedicCardActions
        :item="item"
        @show-barcode="$emit('show-barcode', $event)" />
</template>

<script setup>
import BiomedicCardActions from '@/components/BiomedicCardActions.vue'

defineProps({
    item: {
        type: Object,
        required: true
    }
})

defineEmits(['show-barcode'])
</script>
