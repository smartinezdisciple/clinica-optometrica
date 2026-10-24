import { z } from 'zod';
/**
 * Tipos de evento soportados por el módulo de auditoría.
 * Se registran eventos de negocio relevantes, no peticiones técnicas.
 */
export declare const TipoEvento: {
    readonly CREATE: 'CREATE';
    readonly UPDATE: 'UPDATE';
    readonly DELETE: 'DELETE';
    readonly LOGIN: 'LOGIN';
    readonly LOGIN_FAILED: 'LOGIN_FAILED';
    readonly LOGOUT: 'LOGOUT';
    readonly EXPORT: 'EXPORT';
    readonly CONFIG: 'CONFIG';
};
export type TipoEvento = (typeof TipoEvento)[keyof typeof TipoEvento];
/**
 * Payload para registrar un evento de auditoría.
 */
export interface RegistrarLogInput {
    accion: string;
    modulo: string;
    tipoEvento: TipoEvento;
    tablaAfectada?: string | null;
    idEntidad?: number | null;
    descripcion?: string | null;
    detalle?: Record<string, unknown> | null;
    antes?: Record<string, unknown> | null;
    despues?: Record<string, unknown> | null;
    idUsuario?: number | null;
    idSucursal?: number | null;
    ipOrigen?: string | null;
}
/**
 * Fila tal y como se almacena en la tabla logs_sistema.
 */
export interface LogDb {
    id_log: number;
    id_usuario: number | null;
    id_sucursal: number | null;
    accion: string;
    modulo: string;
    tipo_evento: string | null;
    tabla_afectada: string | null;
    id_entidad: number | null;
    descripcion: string | null;
    detalle: Record<string, unknown> | null;
    antes: Record<string, unknown> | null;
    despues: Record<string, unknown> | null;
    ip_origen: string | null;
    fecha_evento: Date;
    nombre_usuario?: string | null;
    nombre_sucursal?: string | null;
}
/**
 * Filtros de consulta para el listado de logs.
 */
export declare const ListarLogsQuerySchema: z.ZodObject<{
    pagina: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limite: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    modulo: z.ZodOptional<z.ZodString>;
    tipo_evento: z.ZodOptional<z.ZodString>;
    accion: z.ZodOptional<z.ZodString>;
    id_usuario: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    id_sucursal: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    tabla_afectada: z.ZodOptional<z.ZodString>;
    fecha_desde: z.ZodOptional<z.ZodString>;
    fecha_hasta: z.ZodOptional<z.ZodString>;
    busqueda: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ListarLogsQuery = z.infer<typeof ListarLogsQuerySchema>;
/**
 * Resultado paginado del listado de logs.
 */
export interface ListarLogsResultado {
    items: LogDb[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
}
//# sourceMappingURL=auditoria.types.d.ts.map