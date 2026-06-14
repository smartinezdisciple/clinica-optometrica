"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
exports.refresh = refresh;
exports.verificar = verificar;
exports.recuperarContrasena = recuperarContrasena;
exports.restablecerContrasena = restablecerContrasena;
const autenticacion_types_1 = require("./autenticacion.types");
const autenticacion_service_1 = require("./autenticacion.service");
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    path: '/api/auth/refresh',
};
/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
    try {
        const dto = autenticacion_types_1.LoginSchema.parse(req.body);
        const ip = req.headers['x-forwarded-for'] || req.ip || '0.0.0.0';
        const userAgent = req.headers['user-agent'] ?? 'Desconocido';
        const { usuario, accessToken, refreshToken } = await (0, autenticacion_service_1.loginService)(dto, ip, userAgent);
        // Refresh token en cookie HttpOnly
        res.cookie(autenticacion_service_1.REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({
            ok: true,
            data: { usuario, accessToken },
            mensaje: `Bienvenido, ${usuario.nombre}`,
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
    try {
        if (req.usuario) {
            await (0, autenticacion_service_1.logoutService)(req.usuario.id);
        }
        res.clearCookie(autenticacion_service_1.REFRESH_COOKIE_NAME, { path: '/api/auth/refresh' });
        res.json({ ok: true, mensaje: 'Sesión cerrada correctamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/auth/refresh
 */
async function refresh(req, res, next) {
    try {
        const refreshToken = req.cookies?.[autenticacion_service_1.REFRESH_COOKIE_NAME];
        const { accessToken } = await (0, autenticacion_service_1.refreshService)(refreshToken);
        res.json({ ok: true, data: { accessToken } });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/auth/verificar
 */
function verificar(req, res) {
    res.json({ ok: true, data: req.usuario });
}
/**
 * POST /api/auth/recuperar-contrasena
 */
async function recuperarContrasena(req, res, next) {
    try {
        const dto = autenticacion_types_1.RecuperarSchema.parse(req.body);
        await (0, autenticacion_service_1.recuperarContrasenaService)(dto);
        res.status(200).json({
            ok: true,
            mensaje: 'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/auth/restablecer-contrasena
 */
async function restablecerContrasena(req, res, next) {
    try {
        const dto = autenticacion_types_1.RestablecerSchema.parse(req.body);
        await (0, autenticacion_service_1.restablecerContrasenaService)(dto);
        res.status(200).json({
            ok: true,
            mensaje: 'Tu contraseña ha sido restablecida correctamente.',
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=autenticacion.controller.js.map