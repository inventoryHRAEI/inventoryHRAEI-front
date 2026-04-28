<template>
    <div class="dynamic-field-control">
        <template v-if="field.type === 'textarea'">
            <textarea
                class="control"
                :placeholder="field.placeholder || ''"
                :required="field.required || false"
                v-model="localValue"
                rows="4"
            ></textarea>
        </template>

        <template v-else-if="field.type === 'select'">
            <select class="control" v-model="localValue" :required="field.required || false">
                <option value="">{{ field.placeholder || 'Seleccionar' }}</option>
                <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
        </template>

        <template v-else-if="field.type === 'checkbox'">
            <label class="checkbox-row">
                <input type="checkbox" v-model="localValue" />
                <span>{{ field.checkboxLabel || 'Sí/No' }}</span>
            </label>
        </template>

        <template v-else>
            <input
                class="control"
                :type="inputType"
                :placeholder="field.placeholder || ''"
                :required="field.required || false"
                v-model="localValue"
            />
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    field: { type: Object, required: true },
    modelValue: { type: [String, Number, Boolean, Object, Array], default: '' }
})

const emit = defineEmits(['update:modelValue'])

const inputType = computed(() => {
    switch (props.field.type) {
        case 'date':
            return 'date'
        case 'time':
            return 'time'
        case 'datetime':
            return 'datetime-local'
        case 'number':
            return 'number'
        case 'email':
            return 'email'
        case 'tel':
            return 'tel'
        case 'url':
            return 'url'
        default:
            return 'text'
    }
})

const normalizedOptions = computed(() => {
    const raw = Array.isArray(props.field.options) ? props.field.options : []
    return raw.map((opt) => {
        if (typeof opt === 'string') return { label: opt, value: opt }
        const label = opt.label ?? opt.value ?? ''
        const value = opt.value ?? opt.label ?? ''
        return { label, value }
    })
})

const localValue = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})
</script>

<style scoped>
.dynamic-field-control {
    width: 100%;
}

.checkbox-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.85);
}
</style>
