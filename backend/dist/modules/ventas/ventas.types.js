"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarVentasQuerySchema = exports.CambiarEstadoVentaSchema = exports.RegistrarPagoSchema = exports.CrearVentaSchema = exports.ItemVentaSchema = void 0;
const zod_1 = require("zod");
// ─── DTOs (Zod) ────────────────────────────────────────────────────────────────
/**
 * Línea del carrito. Para productos granel se usa `cantidad`; para
 * productos serializados se exige `id_unidad_serializada` (una línea por unidad).
 */
exports.ItemVentaSchema = zod_1.z.object({
    id_producto: zod_1.z.number().int().positive(),
    cantidad: zod_1.z.number().int().positive().default(1),
    id_unidad_serializada: zod_1.z.number().int().positive().optional().nullable(),
});
exports.CrearVentaSchema = zod_1.z.object({
    id_cliente: zod_1.z.number().int().positive(),
    descuento_porcentaje: zod_1.z.number().min(0, 'El descuento no puede ser negativo').max(100, 'El descuento no puede superar 100%').default(0),
    nota: zod_1.z.string().max(300).optional().nullable(),
    id_metodo_pago: zod_1.z.number().int().positive(),
    referencia_pago: zod_1.z.string().max(80).optional().nullable(),
    items: zod_1.z.array(exports.ItemVentaSchema).min(1, 'La venta debe tener al menos un ítem'),
});
exports.RegistrarPagoSchema = zod_1.z.object({
    id_metodo_pago: zod_1.z.number().int().positive(),
    referencia_pago: zod_1.z.string().max(80).optional().nullable(),
    nota: zod_1.z.string().max(300).optional().nullable(),
});
exports.CambiarEstadoVentaSchema = zod_1.z.object({
    estado: zod_1.z.enum(['en_proceso', 'finalizada', 'cancelada']),
});
exports.ListarVentasQuerySchema = zod_1.z.object({
    estado: zod_1.z.enum(['en_proceso', 'finalizada', 'cancelada']).optional(),
    busqueda: zod_1.z.string().max(60).optional(),
    fecha_desde: zod_1.z.string().optional(),
    fecha_hasta: zod_1.z.string().optional(),
});
//# sourceMappingURL=ventas.types.js.map