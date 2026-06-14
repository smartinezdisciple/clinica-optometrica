"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.manejoErrores = manejoErrores;
const jsonwebtoken_1 = require("jsonwebtoken");
const zod_1 = require("zod");
class AppError extends Error {
    statusCode;
    message;
    detalles;
    constructor(statusCode, message, detalles) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.detalles = detalles;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function manejoErrores(err, _req, res, _next) {
    // Error de aplicación controlado
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            ok: false,
            error: err.message,
            ...(err.detalles && { detalles: err.detalles }),
        });
        return;
    }
    // Error de validación Zod
    if (err instanceof zod_1.ZodError) {
        const detalles = {};
        for (const issue of err.issues) {
            const field = issue.path.join('.');
            (detalles[field] = detalles[field] || []).push(issue.message);
        }
        res.status(400).json({ ok: false, error: 'Datos de entrada inválidos', detalles });
        return;
    }
    // JWT expirado
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        res.status(401).json({ ok: false, error: 'Token expirado' });
        return;
    }
    // JWT inválido
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        res.status(401).json({ ok: false, error: 'Token inválido' });
        return;
    }
    // Error desconocido
    console.error('[ERROR]', err);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
}
//# sourceMappingURL=manejo-errores.js.map