"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorarioSchema = exports.CitaSchema = void 0;
const zod_1 = require("zod");
exports.CitaSchema = zod_1.z.object({
    motivo_cita: zod_1.z.string().min(1, 'El motivo de la cita es obligatorio').max(50),
    fecha_hora_cita: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'La fecha y hora de la cita deben ser válidas'
    }),
    estado_cita: zod_1.z.enum(['confirmada', 'cancelada', 'reprogramada', 'en_espera_confirmacion', 'completada']).default('confirmada'),
    observaciones: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
    id_cliente: zod_1.z.number({ required_error: 'El ID del paciente es obligatorio' }),
    id_empleado: zod_1.z.number().optional().nullable(),
});
exports.HorarioSchema = zod_1.z.object({
    id_empleado: zod_1.z.number({ required_error: 'El ID del empleado es obligatorio' }),
    dia_semana: zod_1.z.number().min(1).max(7),
    hora_inicio: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Formato de hora de inicio inválido (HH:MM)'
    }),
    hora_fin: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Formato de hora de fin inválido (HH:MM)'
    }),
    activo: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=citas.types.js.map