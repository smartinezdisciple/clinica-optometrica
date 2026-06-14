import type { Request, Response, NextFunction } from 'express';
/**
 * POST /api/auth/login
 */
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/logout
 */
export declare function logout(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/refresh
 */
export declare function refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/auth/verificar
 */
export declare function verificar(req: Request, res: Response): void;
/**
 * POST /api/auth/recuperar-contrasena
 */
export declare function recuperarContrasena(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/restablecer-contrasena
 */
export declare function restablecerContrasena(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=autenticacion.controller.d.ts.map