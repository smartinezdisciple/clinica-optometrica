import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/pacientes
 */
export declare function list(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/pacientes/:id
 */
export declare function getById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/pacientes
 */
export declare function create(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/pacientes/:id
 */
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/pacientes/:id
 */
export declare function remove(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=pacientes.controller.d.ts.map