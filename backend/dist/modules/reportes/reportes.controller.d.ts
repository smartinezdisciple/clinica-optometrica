import type { Request, Response, NextFunction } from 'express';
/** GET /api/reportes/ventas */
export declare function getVentasHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /api/reportes/compras */
export declare function getComprasHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /api/reportes/citas */
export declare function getCitasHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /api/reportes/inventario */
export declare function getInventarioHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /api/reportes/export?tipo=&formato=&desde=&hasta=&id_sucursal= */
export declare function exportarHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=reportes.controller.d.ts.map