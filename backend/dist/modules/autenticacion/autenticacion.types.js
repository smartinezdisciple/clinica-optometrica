"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestablecerSchema = exports.RecuperarSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    contrasena: zod_1.z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});
exports.RecuperarSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
});
exports.RestablecerSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    contrasena: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
//# sourceMappingURL=autenticacion.types.js.map