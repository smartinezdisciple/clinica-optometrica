import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/citas
 */
export declare function list(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/citas/:id
 */
export declare function getById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/citas
 */
export declare function create(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/citas/:id
 */
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/citas/:id/estado
 */
export declare function patchEstado(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/citas/disponibilidad
 */
export declare function listDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/horarios
 */
export declare function listHorarios(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/horarios
 */
export declare function addHorario(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/horarios/:id
 */
export declare function modifyHorario(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/horarios/:id
 */
export declare function removeHorario(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=citas.controller.d.ts.map