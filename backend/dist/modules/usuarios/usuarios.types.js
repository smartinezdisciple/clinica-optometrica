"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarUsuarioSchema = exports.CrearUsuarioSchema = void 0;
const zod_1 = require("zod");
exports.CrearUsuarioSchema = zod_1.z.object({
    primer_nombre: zod_1.z.string().min(1, 'El primer nombre es requerido').max(15),
    segundo_nombre: zod_1.z.string().max(15).optional().nullable(),
    primer_apellido: zod_1.z.string().min(1, 'El primer apellido es requerido').max(15),
    segundo_apellido: zod_1.z.string().max(15).optional().nullable(),
    numero_telefono: zod_1.z.string().max(15).optional().nullable(),
    correo: zod_1.z.string().email('Formato de correo inválido').max(100).optional().nullable().or(zod_1.z.literal('')),
    id_sucursal: zod_1.z.number({ required_error: 'La sucursal es requerida' }),
    nombre_usuario: zod_1.z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(50),
    contrasena: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(50),
    id_rol: zod_1.z.number({ required_error: 'El rol es requerido' }),
});
exports.ActualizarUsuarioSchema = zod_1.z.object({
    primer_nombre: zod_1.z.string().min(1, 'El primer nombre es requerido').max(15).optional(),
    segundo_nombre: zod_1.z.string().max(15).optional().nullable(),
    primer_apellido: zod_1.z.string().min(1, 'El primer apellido es requerido').max(15).optional(),
    segundo_apellido: zod_1.z.string().max(15).optional().nullable(),
    numero_telefono: zod_1.z.string().max(15).optional().nullable(),
    correo: zod_1.z.string().email('Formato de correo inválido').max(100).optional().nullable().or(zod_1.z.literal('')),
    id_sucursal: zod_1.z.number().optional(),
    nombre_usuario: zod_1.z.string().min(3).max(50).optional(),
    contrasena: zod_1.z.string().min(6).max(50).optional().or(zod_1.z.literal('')),
    id_rol: zod_1.z.number().optional(),
    activo: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=usuarios.types.js.map