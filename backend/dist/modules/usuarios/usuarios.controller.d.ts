import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/usuarios
 */
export declare function listUsuarios(_req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/usuarios/:id
 */
export declare function getUsuarioById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/usuarios
 */
export declare function createUsuario(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/usuarios/:id
 */
export declare function updateUsuario(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/usuarios/:id/estado
 */
export declare function toggleEstadoUsuario(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/usuarios/:id/desbloquear
 */
export declare function unlockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/usuarios/roles
 */
export declare function listRoles(_req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/usuarios/permisos
 */
export declare function listPermisos(_req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/usuarios/roles/:id/permisos
 */
export declare function listRolPermisos(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/usuarios/roles/:id/permisos
 */
export declare function updateRolPermisosHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/empleados
 */
export declare function listEmpleados(_req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=usuarios.controller.d.ts.map