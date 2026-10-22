import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/caja/cajas
 */
export declare function listCajasHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/caja/cajas
 */
export declare function createCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/caja/cajas/:id/estado
 */
export declare function toggleCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/caja/cajas/:id/estado
 */
export declare function estadoCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/caja/cajas/:id/aperturas
 */
export declare function abrirCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/caja/cajas/:id/movimientos
 */
export declare function movimientoHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/caja/cajas/:id/movimientos
 */
export declare function movimientosHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/caja/cajas/:id/cierres
 */
export declare function cierreHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=caja.controller.d.ts.map