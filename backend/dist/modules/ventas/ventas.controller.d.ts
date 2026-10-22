import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/ventas/metodos-pago
 */
export declare function listMetodosPago(_req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/ventas/productos-disponibles
 */
export declare function listProductosVendibles(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/ventas/seriales-disponibles?productoId=123
 */
export declare function listSerialesDisponibles(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/ventas/resumen
 */
export declare function resumenVentas(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/ventas
 */
export declare function listarVentas(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/ventas/:id
 */
export declare function getVentaById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/ventas
 * Registra una venta finalizada con su pago.
 */
export declare function crearVentaHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/ventas/:id/estado
 * Permite finalizar o cancelar una venta. Al cancelar se revierte el inventario.
 */
export declare function cambiarEstadoHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=ventas.controller.d.ts.map