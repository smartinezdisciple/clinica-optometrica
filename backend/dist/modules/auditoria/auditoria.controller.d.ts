import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/auditoria
 * Lista los logs de auditoría con filtros y paginación.
 */
export declare function listarLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/auditoria/:id
 */
export declare function getLogById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/auditoria/modulos
 * Lista los módulos con logs registrados (para poblar filtros del frontend).
 */
export declare function listarModulos(_req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auditoria.controller.d.ts.map