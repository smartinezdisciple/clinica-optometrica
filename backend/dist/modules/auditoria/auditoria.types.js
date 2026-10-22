"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarLogsQuerySchema = exports.TipoEvento = void 0;
const zod_1 = require("zod");
/**
 * Tipos de evento soportados por el módulo de auditoría.
 * Se registran eventos de negocio relevantes, no peticiones técnicas.
 */
exports.TipoEvento = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGIN_FAILED: 'LOGIN_FAILED',
    LOGOUT: 'LOGOUT',
    EXPORT: 'EXPORT',
    CONFIG: 'CONFIG',
};
/**
 * Filtros de consulta para el listado de logs.
 */
exports.ListarLogsQuerySchema = zod_1.z.object({
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    modulo: zod_1.z.string().max(50).optional(),
    tipo_evento: zod_1.z.string().max(20).optional(),
    accion: zod_1.z.string().max(100).optional(),
    id_usuario: zod_1.z.coerce.number().int().optional(),
    id_sucursal: zod_1.z.coerce.number().int().optional(),
    tabla_afectada: zod_1.z.string().max(50).optional(),
    fecha_desde: zod_1.z.string().optional(),
    fecha_hasta: zod_1.z.string().optional(),
    busqueda: zod_1.z.string().max(100).optional(),
});
//# sourceMappingURL=auditoria.types.js.map