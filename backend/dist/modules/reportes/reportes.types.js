"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportQuerySchema = exports.FormatoReporteSchema = exports.TipoReporteSchema = exports.FiltrosInventarioSchema = exports.FiltrosReporteSchema = void 0;
const zod_1 = require("zod");
// ─── Filtros (Zod) ─────────────────────────────────────────────────────────────
const FechaSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');
exports.FiltrosReporteSchema = zod_1.z.object({
    desde: FechaSchema.optional(),
    hasta: FechaSchema.optional(),
    id_sucursal: zod_1.z.coerce.number().int().positive().optional(),
});
exports.FiltrosInventarioSchema = zod_1.z.object({
    id_sucursal: zod_1.z.coerce.number().int().positive().optional(),
});
exports.TipoReporteSchema = zod_1.z.enum(['ventas', 'compras', 'citas', 'inventario']);
exports.FormatoReporteSchema = zod_1.z.enum(['csv', 'pdf']);
exports.ExportQuerySchema = exports.FiltrosReporteSchema.extend({
    tipo: exports.TipoReporteSchema,
    formato: exports.FormatoReporteSchema.default('csv'),
});
//# sourceMappingURL=reportes.types.js.map