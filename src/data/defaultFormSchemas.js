import motivoEntradaOptions from './motivoEntradaOptions.js'
import motivoSalidaOptions from './motivoSalidaOptions.js'
import motivoResguardoOptions from './motivoResguardoOptions.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

const BASE_SCHEMA = {
    module: '',
    sections: {},
    optionSets: {},
    baseFields: {}
}

function buildOptionSet(list = []) {
    return list.map((opt) => ({ label: opt.label, value: opt.value }))
}

export function getDefaultSchema(moduleKey) {
    switch (moduleKey) {
        case 'salida':
            return {
                ...clone(BASE_SCHEMA),
                module: 'salida',
                sections: {
                    solicitante: { title: 'Datos del Solicitante', fields: [] },
                    motivo: { title: 'Motivo y Descripción de Salida', fields: [] },
                    equipos: { title: 'Equipo Médico, Accesorio o Consumible que Sale', fields: [] },
                    observaciones: { title: 'Observaciones y Soporte', fields: [] },
                    firmas: { title: 'Firmas', fields: [] }
                },
                optionSets: {
                    motivoSalida: buildOptionSet(motivoSalidaOptions)
                },
                baseFields: {
                    solicitante: [
                        { key: 'nombreSolicitante', label: 'Nombre del solicitante', placeholder: 'Ej. Juan Pérez', type: 'text' },
                        { key: 'servicio', label: 'Servicio', placeholder: 'Ej. Urgencias', type: 'text' },
                        { key: 'especialidad', label: 'Especialidad', placeholder: 'Ej. Cardiología', type: 'text' },
                        { key: 'folio', label: 'Folio', placeholder: 'Ej. S-000123', type: 'text' },
                        { key: 'fecha', label: 'Fecha', placeholder: 'Seleccionar fecha', type: 'date' },
                        { key: 'horaInicio', label: 'Hora de inicio', placeholder: 'Ej. 08:30', type: 'time' },
                        { key: 'horaTermino', label: 'Hora de término', placeholder: 'Se calcula automáticamente', type: 'text' }
                    ],
                    motivo: [
                        { key: 'motivoSalida', label: 'Motivo de salida', placeholder: 'Seleccionar motivo', type: 'select', optionsKey: 'motivoSalida' },
                        { key: 'otroMotivo', label: 'Especifique motivo', placeholder: 'Escribe el motivo', type: 'text' },
                        { key: 'descripcion', label: 'Descripción', placeholder: 'Describe los detalles', type: 'textarea' }
                    ],
                    observaciones: [
                        { key: 'observaciones', label: 'Observaciones', placeholder: 'Escribe observaciones aquí', type: 'textarea' },
                        { key: 'nombreIngeniero', label: 'Ingeniero residente (apoyo)', placeholder: 'Nombre del ingeniero residente', type: 'text' }
                    ],
                    equipos: [],
                    firmas: []
                }
            }
        case 'resguardo':
            return {
                ...clone(BASE_SCHEMA),
                module: 'resguardo',
                sections: {
                    solicitante: { title: 'Datos del Resguardante', fields: [] },
                    motivo: { title: 'Motivo y Descripción de Resguardo', fields: [] },
                    equipos: { title: 'Equipo Médico, Accesorio o Consumible en Resguardo', fields: [] },
                    observaciones: { title: 'Observaciones y Soporte', fields: [] },
                    firmas: { title: 'Firmas', fields: [] }
                },
                optionSets: {
                    motivoResguardo: buildOptionSet(motivoResguardoOptions)
                },
                baseFields: {
                    solicitante: [
                        { key: 'nombreSolicitante', label: 'Nombre del resguardante', placeholder: 'Ej. Juan Pérez', type: 'text' },
                        { key: 'servicio', label: 'Servicio', placeholder: 'Ej. Urgencias', type: 'text' },
                        { key: 'especialidad', label: 'Especialidad', placeholder: 'Ej. Cardiología', type: 'text' },
                        { key: 'folio', label: 'Folio', placeholder: 'Ej. R-000123', type: 'text' },
                        { key: 'fecha', label: 'Fecha', placeholder: 'Seleccionar fecha', type: 'date' },
                        { key: 'horaInicio', label: 'Hora de inicio', placeholder: 'Ej. 08:30', type: 'time' },
                        { key: 'horaTermino', label: 'Hora de término', placeholder: 'Se calcula automáticamente', type: 'text' }
                    ],
                    motivo: [
                        { key: 'motivoResguardo', label: 'Motivo de resguardo', placeholder: 'Seleccionar motivo', type: 'select', optionsKey: 'motivoResguardo' },
                        { key: 'otroMotivo', label: 'Especifique motivo', placeholder: 'Escribe el motivo', type: 'text' },
                        { key: 'descripcion', label: 'Descripción', placeholder: 'Describe los detalles', type: 'textarea' }
                    ],
                    observaciones: [
                        { key: 'observaciones', label: 'Observaciones', placeholder: 'Escribe observaciones aquí', type: 'textarea' },
                        { key: 'nombreIngeniero', label: 'Ingeniero residente (apoyo)', placeholder: 'Nombre del ingeniero residente', type: 'text' }
                    ],
                    equipos: [],
                    firmas: []
                }
            }
        case 'servicio':
            return {
                ...clone(BASE_SCHEMA),
                module: 'servicio',
                sections: {
                    solicitante: { title: 'Datos del Solicitante', fields: [] },
                    motivo: { title: 'Motivo y Descripción de Servicio', fields: [] },
                    equipos: { title: 'Equipo Médico, Accesorio o Consumible', fields: [] },
                    observaciones: { title: 'Observaciones y Soporte', fields: [] },
                    firmas: { title: 'Firmas', fields: [] }
                },
                optionSets: {
                    motivoEntrada: buildOptionSet(motivoEntradaOptions)
                },
                baseFields: {
                    solicitante: [
                        { key: 'nombreSolicitante', label: 'Nombre del solicitante', placeholder: 'Ej. Juan Pérez', type: 'text' },
                        { key: 'servicio', label: 'Servicio', placeholder: 'Ej. Urgencias', type: 'text' },
                        { key: 'especialidad', label: 'Especialidad', placeholder: 'Ej. Cardiología', type: 'text' },
                        { key: 'folio', label: 'Folio', placeholder: 'Ej. S-000123', type: 'text' },
                        { key: 'fecha', label: 'Fecha', placeholder: 'Seleccionar fecha', type: 'date' },
                        { key: 'horaInicio', label: 'Hora de inicio', placeholder: 'Ej. 08:30', type: 'time' },
                        { key: 'horaTermino', label: 'Hora de término', placeholder: 'Se calcula automáticamente', type: 'text' }
                    ],
                    motivo: [
                        { key: 'motivoEntrada', label: 'Motivo de servicio', placeholder: 'Seleccionar motivo', type: 'select', optionsKey: 'motivoEntrada' },
                        { key: 'otroMotivo', label: 'Especifique motivo', placeholder: 'Escribe el motivo', type: 'text' },
                        { key: 'descripcion', label: 'Descripción', placeholder: 'Describe los detalles', type: 'textarea' }
                    ],
                    observaciones: [
                        { key: 'observaciones', label: 'Observaciones', placeholder: 'Escribe observaciones aquí', type: 'textarea' },
                        { key: 'nombreIngeniero', label: 'Ingeniero residente (apoyo)', placeholder: 'Nombre del ingeniero residente', type: 'text' }
                    ],
                    equipos: [],
                    firmas: []
                }
            }
        case 'entrada':
        default:
            return {
                ...clone(BASE_SCHEMA),
                module: 'entrada',
                sections: {
                    solicitante: { title: 'Datos del Solicitante', fields: [] },
                    motivo: { title: 'Motivo y Descripción de Entrada', fields: [] },
                    equipos: { title: 'Equipo Médico, Accesorio o Consumible que Entra', fields: [] },
                    observaciones: { title: 'Observaciones y Soporte', fields: [] },
                    firmas: { title: 'Firmas', fields: [] }
                },
                optionSets: {
                    motivoEntrada: buildOptionSet(motivoEntradaOptions)
                },
                baseFields: {
                    solicitante: [
                        { key: 'nombreSolicitante', label: 'Nombre del solicitante', placeholder: 'Ej. Juan Pérez', type: 'text' },
                        { key: 'servicio', label: 'Servicio', placeholder: 'Ej. Urgencias', type: 'text' },
                        { key: 'especialidad', label: 'Especialidad', placeholder: 'Ej. Cardiología', type: 'text' },
                        { key: 'folio', label: 'Folio', placeholder: 'Ej. E-000123', type: 'text' },
                        { key: 'fecha', label: 'Fecha', placeholder: 'Seleccionar fecha', type: 'date' },
                        { key: 'horaInicio', label: 'Hora de inicio', placeholder: 'Ej. 08:30', type: 'time' },
                        { key: 'horaTermino', label: 'Hora de término', placeholder: 'Se calcula automáticamente', type: 'text' }
                    ],
                    motivo: [
                        { key: 'motivoEntrada', label: 'Motivo de entrada', placeholder: 'Seleccionar motivo', type: 'select', optionsKey: 'motivoEntrada' },
                        { key: 'otroMotivo', label: 'Especifique motivo', placeholder: 'Escribe el motivo', type: 'text' },
                        { key: 'descripcion', label: 'Descripción', placeholder: 'Describe los detalles', type: 'textarea' }
                    ],
                    observaciones: [
                        { key: 'observaciones', label: 'Observaciones', placeholder: 'Escribe observaciones aquí', type: 'textarea' },
                        { key: 'nombreIngeniero', label: 'Ingeniero residente (apoyo)', placeholder: 'Nombre del ingeniero residente', type: 'text' }
                    ],
                    equipos: [],
                    firmas: []
                }
            }
    }
}
