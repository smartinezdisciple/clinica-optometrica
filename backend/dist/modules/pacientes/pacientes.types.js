"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacienteSchema = void 0;
const zod_1 = require("zod");
exports.PacienteSchema = zod_1.z.object({
    cedula: zod_1.z.string().max(16).optional().transform(v => v === '' ? undefined : v),
    nombres: zod_1.z.string().min(1, 'El nombre es obligatorio').max(60),
    apellidos: zod_1.z.string().min(1, 'El apellido es obligatorio').max(60),
    numero_telefono: zod_1.z.string().min(1, 'El número de teléfono es obligatorio').max(15),
    correo: zod_1.z.string().email('Formato de correo inválido').optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
    ocupacion: zod_1.z.string().max(30).optional().transform(v => v === '' ? undefined : v),
    fecha_nacimiento: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'La fecha de nacimiento debe ser una fecha válida'
    }),
    genero: zod_1.z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
    id_empresa: zod_1.z.number().int().positive().optional().nullable(),
});
//# sourceMappingURL=pacientes.types.js.map