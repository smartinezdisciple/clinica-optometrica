"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SucursalSchema = void 0;
const zod_1 = require("zod");
exports.SucursalSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede superar los 50 caracteres'),
    direccion: zod_1.z.string().max(150, 'La dirección no puede superar los 150 caracteres').optional().nullable(),
    telefono: zod_1.z.string().max(15, 'El teléfono no puede superar los 15 caracteres').optional().nullable(),
    correo: zod_1.z.string().email('El formato del correo es inválido').max(100).optional().nullable().or(zod_1.z.literal('')),
});
//# sourceMappingURL=sucursales.types.js.map