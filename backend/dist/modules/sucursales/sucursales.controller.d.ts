import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/sucursales
 */
export declare function listSucursales(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/sucursales/:id
 */
export declare function getSucursalById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/sucursales
 */
export declare function create(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/sucursales/:id
 */
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/sucursales/:id/estado
 */
export declare function toggleEstado(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=sucursales.controller.d.ts.map