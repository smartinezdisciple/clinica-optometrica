import type { Request, Response, NextFunction } from 'express';
/**
 * GET /api/empresas
 */
export declare function list(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/empresas/:id
 */
export declare function getById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/empresas
 */
export declare function create(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/empresas/:id
 */
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/empresas/:id
 */
export declare function remove(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=empresas.controller.d.ts.map