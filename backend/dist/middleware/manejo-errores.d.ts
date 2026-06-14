import type { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly message: string;
    readonly detalles?: Record<string, string[]> | undefined;
    constructor(statusCode: number, message: string, detalles?: Record<string, string[]> | undefined);
}
export declare function manejoErrores(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=manejo-errores.d.ts.map