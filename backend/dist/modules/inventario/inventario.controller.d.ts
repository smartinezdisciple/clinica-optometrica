import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/inventario/productos
 * Lista el catálogo de productos de la sucursal del usuario autenticado.
 */
export declare function list(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/inventario/productos
 * Alta de producto (granel o serializado).
 */
export declare function createProducto(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/inventario/productos/:id/seriales
 */
export declare function listSeriales(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/inventario/productos/:id/seriales
 * Registra unidades serializadas adicionales.
 */
export declare function addSeriales(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/inventario/movimientos
 * Registra un movimiento de inventario para productos granel.
 */
export declare function createMovimiento(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=inventario.controller.d.ts.map