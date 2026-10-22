import type { ListarLogsQuery, ListarLogsResultado, LogDb, RegistrarLogInput } from './auditoria.types';
/**
 * Registra un evento de auditoría en la tabla logs_sistema.
 * Método diseñado para ser invocado de forma explícita desde las
 * operaciones de negocio relevantes (crear/editar/eliminar/login...).
 *
 * No lanza errores: si el registro falla, se registra por consola para
 * no interrumpir la operación de negocio principal.
 */
export declare function registrar(input: RegistrarLogInput): Promise<void>;
/**
 * Obtiene un log de auditoría por su ID.
 */
export declare function getLog(id: number): Promise<LogDb>;
/**
 * Lista los logs de auditoría aplicando filtros y paginación.
 */
export declare function listLogs(filtros: ListarLogsQuery): Promise<ListarLogsResultado>;
/**
 * Devuelve los módulos y tipos de evento existentes para poblar filtros.
 */
export declare function getModulosDisponibles(): Promise<string[]>;
//# sourceMappingURL=auditoria.service.d.ts.map