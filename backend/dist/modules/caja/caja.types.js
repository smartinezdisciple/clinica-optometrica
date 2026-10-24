"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CierreCajaSchema = exports.MovimientoCajaSchema = exports.AperturaSchema = exports.CambiarEstadoCajaSchema = exports.CrearCajaSchema = void 0;
const zod_1 = require("zod");
exports.CrearCajaSchema = zod_1.z.object({
    nombre_caja: zod_1.z.string().min(1, 'El nombre de la caja es requerido').max(30),
});
exports.CambiarEstadoCajaSchema = zod_1.z.object({
    activa: zod_1.z.boolean(),
});
// ─── Apertura ──────────────────────────────────────────────────────────────────
exports.AperturaSchema = zod_1.z.object({
    monto_inicial: zod_1.z.number().min(0, 'El monto inicial no puede ser negativo'),
    observaciones: zod_1.z.string().max(300).optional().nullable(),
});
// ─── Movimientos ───────────────────────────────────────────────────────────────
exports.MovimientoCajaSchema = zod_1.z.object({
    tipo_movimiento: zod_1.z.enum(['ingreso', 'egreso', 'ajuste']),
    monto: zod_1.z.number().positive('El monto debe ser mayor a 0'),
    descripcion: zod_1.z.string().max(300).optional().nullable(),
});
// ─── Cierre ────────────────────────────────────────────────────────────────────
exports.CierreCajaSchema = zod_1.z.object({
    monto_final: zod_1.z.number().min(0, 'El monto final no puede ser negativo'),
    observaciones: zod_1.z.string().max(300).optional().nullable(),
});
//# sourceMappingURL=caja.types.js.map