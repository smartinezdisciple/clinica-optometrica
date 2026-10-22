import type { ListarLogsQuery, ListarLogsResultado, LogDb, RegistrarLogInput } from './auditoria.types';
/**
 * Inserta un nuevo registro en la tabla logs_sistema.
 */
export declare function insertLog(input: RegistrarLogInput): Promise<number>;
/**
 * Obtiene un log por su ID incluyendo el nombre del usuario y sucursal asociados.
 */
export declare function findLogById(id: number): Promise<LogDb | null>;
/**
 * Lista los logs de auditoría aplicando filtros y paginación.
 */
export declare function findLogs(filtros: ListarLogsQuery): Promise<ListarLogsResultado>;
/**
 * Devuelve los módulos con al menos un log registrado, para poblar filtros.
 */
export declare function findModulosRegistrados(): Promise<string[]>;
//# sourceMappingURL=auditoria.repository.d.ts.map