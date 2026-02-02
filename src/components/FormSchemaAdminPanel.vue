<template>
    <div v-if="visible" class="schema-admin-overlay" role="dialog" aria-modal="true">
        <div class="schema-admin-panel">
            <header class="schema-admin-header">
                <div>
                    <h3>Editor de formato</h3>
                    <p>Configura secciones y campos para {{ moduleLabel }}</p>
                </div>
                <button class="schema-close" type="button" @click="emit('close')">Cerrar</button>
            </header>

            <section class="schema-admin-section">
                <h4>Campos por sección</h4>
                <div v-for="section in sections" :key="section.id" class="schema-section-block">
                    <div class="schema-section-header">
                        <div>
                            <strong>{{ section.title }}</strong>
                            <small>{{ section.id }}</small>
                        </div>
                        <button class="schema-add" type="button" @click="addField(section.id)">+ Campo</button>
                    </div>

                    <div class="schema-base-fields" v-if="getBaseFields(section.id).length">
                        <div class="schema-base-title">Campos actuales del sistema</div>
                        <div v-for="base in getBaseFields(section.id)" :key="base.key" class="schema-base-row">
                            <div class="schema-base-info">
                                <label>
                                    Nombre visible
                                    <input v-model="base.label" class="control" placeholder="Ej. Nombre del solicitante" />
                                </label>
                                <label>
                                    Texto de ayuda
                                    <input v-model="base.placeholder" class="control" placeholder="Ej. Escribe el dato aquí" />
                                </label>
                            </div>
                            <div class="schema-base-actions">
                                <button class="schema-add" type="button" @click="replaceBaseField(section.id, base)">
                                    Reemplazar
                                </button>
                                <span class="schema-base-note">Crea un campo dinámico y oculta el original.</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="getFields(section.id).length === 0" class="schema-empty">
                        Sin campos adicionales
                    </div>

                    <div v-for="field in getFields(section.id)" :key="field.id" class="schema-field-row">
                        <div class="schema-field-grid">
                            <label>
                                Encabezado
                                <input v-model="field.label" class="control" placeholder="Ej. Número de empleado (nombre que verá el usuario)" />
                            </label>

                            <label>
                                Tipo
                                <select v-model="field.type" class="control">
                                    <option value="text">Texto</option>
                                    <option value="number">Numérico</option>
                                    <option value="date">Fecha</option>
                                    <option value="time">Hora</option>
                                    <option value="datetime">Fecha y hora</option>
                                    <option value="textarea">Área de texto</option>
                                    <option value="select">Selección</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="email">Email</option>
                                    <option value="tel">Teléfono</option>
                                </select>
                            </label>

                            <label>
                                Placeholder
                                <input v-model="field.placeholder" class="control" placeholder="Ej. Escribe el dato aquí" />
                            </label>

                            <label class="schema-toggle">
                                <input type="checkbox" v-model="field.required" />
                                Requerido
                            </label>
                        </div>

                        <div v-if="field.type === 'select'" class="schema-options">
                            <label>
                                Opciones (una por línea)
                                <textarea v-model="field._optionsText" class="control" rows="3" placeholder="Ej. Opción 1"></textarea>
                            </label>
                        </div>

                        <div class="schema-actions">
                            <button type="button" class="schema-remove" @click="removeField(section.id, field.id)">Eliminar</button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="schema-admin-section" v-if="optionSets.length">
                <h4>Listas de opciones</h4>
                <div v-for="opt in optionSets" :key="opt.key" class="schema-section-block">
                    <div class="schema-section-header">
                        <div>
                            <strong>{{ opt.label }}</strong>
                            <small>{{ opt.key }}</small>
                        </div>
                        <button class="schema-add" type="button" @click="addOption(opt.key)">+ Opción</button>
                    </div>

                    <div v-for="(entry, idx) in getOptionList(opt.key)" :key="`${opt.key}-${idx}`" class="schema-option-row">
                        <input v-model="entry.label" class="control" placeholder="Etiqueta" />
                        <input v-model="entry.value" class="control" placeholder="Valor (slug)" />
                        <button type="button" class="schema-remove" @click="removeOption(opt.key, idx)">Eliminar</button>
                    </div>
                </div>
            </section>

            <footer class="schema-admin-footer">
                <div class="schema-hint">Los cambios se reflejan en el formulario al guardar.</div>
                <div class="schema-actions">
                    <button class="schema-secondary" type="button" @click="emit('close')">Cancelar</button>
                    <button class="schema-primary" type="button" @click="onSave">Guardar cambios</button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    visible: { type: Boolean, default: false },
    moduleKey: { type: String, required: true },
    moduleLabel: { type: String, default: '' },
    schema: { type: Object, required: true },
    sections: { type: Array, default: () => [] },
    optionSets: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'save'])

const localSchema = ref({})

watch(
    () => props.schema,
    (next) => {
        localSchema.value = deepClone(next || {})
        normalizeLocalSchema()
    },
    { immediate: true }
)

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj || {}))
}

function normalizeLocalSchema() {
    if (!localSchema.value.sections) localSchema.value.sections = {}
    if (!localSchema.value.baseFields) localSchema.value.baseFields = {}
    for (const section of props.sections) {
        if (!localSchema.value.sections[section.id]) {
            localSchema.value.sections[section.id] = { title: section.title, fields: [] }
        }
        if (!Array.isArray(localSchema.value.sections[section.id].fields)) {
            localSchema.value.sections[section.id].fields = []
        }
        if (!Array.isArray(localSchema.value.baseFields[section.id])) {
            localSchema.value.baseFields[section.id] = []
        }
        for (const field of localSchema.value.sections[section.id].fields) {
            field._optionsText = Array.isArray(field.options) ? field.options.map(toLine).join('\n') : ''
        }
    }
    if (!localSchema.value.optionSets) localSchema.value.optionSets = {}
    for (const set of props.optionSets) {
        if (!Array.isArray(localSchema.value.optionSets[set.key])) {
            localSchema.value.optionSets[set.key] = []
        }
    }
}

function toLine(opt) {
    if (typeof opt === 'string') return opt
    if (!opt) return ''
    return opt.label || opt.value || ''
}

function getFields(sectionId) {
    return localSchema.value.sections?.[sectionId]?.fields || []
}

function getBaseFields(sectionId) {
    return localSchema.value.baseFields?.[sectionId] || []
}

function addField(sectionId) {
    const field = {
        id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        label: 'Nuevo campo',
        type: 'text',
        required: false,
        placeholder: '',
        options: [],
        _optionsText: ''
    }
    localSchema.value.sections[sectionId].fields.push(field)
}

function replaceBaseField(sectionId, baseField) {
    const section = localSchema.value.sections?.[sectionId]
    if (!section) return
    const existing = (section.fields || []).some((f) => f.replaces === baseField.key)
    if (existing) return
    const newField = {
        id: `replace_${baseField.key}_${Date.now()}`,
        label: baseField.label || 'Nuevo campo',
        type: baseField.type || 'text',
        placeholder: baseField.placeholder || '',
        required: !!baseField.required,
        options: Array.isArray(baseField.options) ? baseField.options : [],
        optionsKey: baseField.optionsKey || '',
        replaces: baseField.key
    }
    if (!Array.isArray(section.fields)) section.fields = []
    section.fields.push(newField)
}

function removeField(sectionId, fieldId) {
    const fields = localSchema.value.sections?.[sectionId]?.fields || []
    localSchema.value.sections[sectionId].fields = fields.filter((f) => f.id !== fieldId)
}

function getOptionList(key) {
    return localSchema.value.optionSets?.[key] || []
}

function addOption(key) {
    if (!Array.isArray(localSchema.value.optionSets[key])) localSchema.value.optionSets[key] = []
    localSchema.value.optionSets[key].push({ label: '', value: '' })
}

function removeOption(key, idx) {
    localSchema.value.optionSets[key].splice(idx, 1)
}

function onSave() {
    // Normalize options text into arrays
    for (const section of Object.values(localSchema.value.sections || {})) {
        for (const field of section.fields || []) {
            if (field.type === 'select') {
                field.options = String(field._optionsText || '')
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
            } else {
                field.options = []
            }
            delete field._optionsText
        }
    }

    for (const key of Object.keys(localSchema.value.optionSets || {})) {
        localSchema.value.optionSets[key] = (localSchema.value.optionSets[key] || [])
            .map((opt) => {
                const label = String(opt.label || '').trim()
                const value = String(opt.value || '').trim() || slugify(label)
                return label ? { label, value } : null
            })
            .filter(Boolean)
    }

    emit('save', deepClone(localSchema.value))
}

function slugify(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}
</script>

<style scoped>
.schema-admin-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 24px;
}

.schema-admin-panel {
    width: min(1100px, 100%);
    max-height: 90vh;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.schema-admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.08));
}

.schema-admin-header h3 {
    margin: 0 0 6px;
    font-size: 1.4rem;
}

.schema-admin-header p {
    margin: 0;
    color: rgba(71, 85, 105, 0.8);
}

.schema-close {
    border: none;
    background: rgba(59, 130, 246, 0.15);
    padding: 8px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
}

.schema-admin-section {
    padding: 20px 24px;
    overflow: auto;
}

.schema-section-block {
    border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 18px;
    background: rgba(248, 250, 252, 0.7);
}

.schema-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.schema-base-fields {
    border: 1px dashed rgba(148, 163, 184, 0.4);
    border-radius: 14px;
    padding: 12px;
    margin-bottom: 14px;
    background: rgba(248, 250, 252, 0.8);
    display: grid;
    gap: 12px;
}

.schema-base-title {
    font-weight: 700;
    color: rgba(71, 85, 105, 0.9);
}

.schema-base-row {
    display: grid;
    gap: 10px;
    padding: 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(226, 232, 240, 0.8);
}

.schema-base-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}

.schema-base-info label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 600;
}

.schema-base-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.schema-base-note {
    font-size: 0.85rem;
    color: rgba(100, 116, 139, 0.8);
}

.schema-section-header small {
    display: block;
    color: rgba(100, 116, 139, 0.8);
}

.schema-add {
    border: none;
    background: rgba(59, 130, 246, 0.15);
    padding: 6px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
}

.schema-field-row {
    border-top: 1px dashed rgba(148, 163, 184, 0.4);
    padding-top: 12px;
    margin-top: 12px;
}

.schema-field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}

.schema-field-grid label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 600;
}

.schema-options {
    margin-top: 12px;
}

.schema-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    gap: 12px;
}

.schema-remove {
    border: none;
    background: rgba(239, 68, 68, 0.15);
    color: rgb(185, 28, 28);
    padding: 6px 12px;
    border-radius: 10px;
    cursor: pointer;
}

.schema-option-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    margin-top: 10px;
}

.schema-empty {
    color: rgba(100, 116, 139, 0.8);
    font-style: italic;
}

.schema-admin-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #f8fafc;
}

.schema-primary {
    border: none;
    background: linear-gradient(135deg, #3b82f6, #38bdf8);
    color: #fff;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
}

.schema-secondary {
    border: none;
    background: rgba(148, 163, 184, 0.2);
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
}

.schema-hint {
    color: rgba(100, 116, 139, 0.8);
    font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
    .schema-admin-panel {
        background: #0f172a;
        color: #e2e8f0;
    }

    .schema-admin-section {
        background: #0f172a;
    }

    .schema-section-block {
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(148, 163, 184, 0.2);
    }

    .schema-admin-footer {
        background: #0b1120;
    }

    .schema-close,
    .schema-add,
    .schema-secondary {
        color: #e2e8f0;
    }
}
</style>
