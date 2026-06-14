import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            usuario?: {
                id: number;
                rol: string;
                sucursalId: number;
            };
        }
    }
}
/**
 * Middleware que verifica el JWT de acceso en el header Authorization.
 * Popula `req.usuario` con el payload del token.
 */
export declare function autenticar(req: Request, _res: Response, next: NextFunction): void;
/**
 * Middleware que verifica que el usuario tiene uno de los roles permitidos.
 */
export declare function autorizar(...rolesPermitidos: string[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=autenticacion.d.ts.map