"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaSchema = void 0;
const zod_1 = require("zod");
exports.EmpresaSchema = zod_1.z.object({
    cedula: zod_1.z.string().max(16).optional().transform(v => v === '' ? undefined : v),
    primer_nombre: zod_1.z.string().min(1, 'El primer nombre de contacto es obligatorio').max(15),
    segundo_nombre: zod_1.z.string().max(15).optional().transform(v => v === '' ? undefined : v),
    primer_apellido: zod_1.z.string().min(1, 'El primer apellido de contacto es obligatorio').max(15),
    segundo_apellido: zod_1.z.string().max(15).optional().transform(v => v === '' ? undefined : v),
    numero_telefono: zod_1.z.string().min(1, 'El número de teléfono es obligatorio').max(15),
    correo: zod_1.z.string().email('Formato de correo inválido').optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
    razon_social: zod_1.z.string().min(1, 'La razón social es obligatoria').max(100),
    ruc: zod_1.z.string().min(1, 'El RUC es obligatorio').max(30),
});
//# sourceMappingURL=empresas.types.js.map