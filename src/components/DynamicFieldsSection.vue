<template>
    <div v-bind="$attrs">
        <template v-for="field in normalizedFields" :key="field.id">
            <div class="field" :style="fieldStyle(field)">
                <label>{{ field.label }}</label>
                <DynamicField :field="field" v-model="model[sectionId][field.id]" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import DynamicField from './DynamicField.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    sectionId: { type: String, required: true },
    schema: { type: Object, required: true },
    model: { type: Object, required: true }
})

const normalizedFields = computed(() => {
    const section = props.schema?.sections?.[props.sectionId]
    const fields = Array.isArray(section?.fields) ? section.fields : []
    if (!props.model[props.sectionId]) props.model[props.sectionId] = {}

    for (const field of fields) {
        if (!field || !field.id) continue
        if (!(field.id in props.model[props.sectionId])) {
            props.model[props.sectionId][field.id] = field.type === 'checkbox' ? false : ''
        }
    }

    return fields
})

function fieldStyle(field) {
    if (field && field.fullWidth) return { gridColumn: '1 / -1' }
    if (field && field.type === 'textarea') return { gridColumn: '1 / -1' }
    if (field && field.span) return { gridColumn: `span ${field.span}` }
    return { gridColumn: 'span 6' }
}
</script>
