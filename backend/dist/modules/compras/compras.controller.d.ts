import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/compras/proveedores
 */
export declare function listProveedores(_req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/compras/proveedores
 */
export declare function createProveedorHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/compras
 */
export declare function listCompras(_req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/compras/:id
 */
export declare function getCompraById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/compras
 */
export declare function createCompraHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/compras/:id/items
 */
export declare function addItemsHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/compras/:id/estado
 */
export declare function changeEstadoHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=compras.controller.d.ts.map