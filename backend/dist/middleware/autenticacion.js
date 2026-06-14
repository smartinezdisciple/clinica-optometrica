"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = autenticar;
exports.autorizar = autorizar;
const jwt_1 = require("../config/jwt");
const manejo_errores_1 = require("./manejo-errores");
/**
 * Middleware que verifica el JWT de acceso en el header Authorization.
 * Popula `req.usuario` con el payload del token.
 */
function autenticar(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new manejo_errores_1.AppError(401, 'Se requiere autenticación');
    }
    const token = authHeader.slice(7);
    try {
        const payload = (0, jwt_1.verificarAccessToken)(token);
        req.usuario = {
            id: payload.sub,
            rol: payload.rol,
            sucursalId: payload.sucursalId,
        };
        next();
    }
    catch {
        throw new manejo_errores_1.AppError(401, 'Token inválido o expirado');
    }
}
/**
 * Middleware que verifica que el usuario tiene uno de los roles permitidos.
 */
function autorizar(...rolesPermitidos) {
    return (req, _res, next) => {
        if (!req.usuario) {
            throw new manejo_errores_1.AppError(401, 'No autenticado');
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            throw new manejo_errores_1.AppError(403, `Acceso denegado. Roles requeridos: ${rolesPermitidos.join(', ')}`);
        }
        next();
    };
}
//# sourceMappingURL=autenticacion.js.map