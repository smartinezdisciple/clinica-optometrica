"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.REFRESH_COOKIE_NAME = void 0;
exports.loginService = loginService;
exports.logoutService = logoutService;
exports.refreshService = refreshService;
exports.recuperarContrasenaService = recuperarContrasenaService;
exports.restablecerContrasenaService = restablecerContrasenaService;
const bcrypt_1 = __importDefault(require("bcrypt"));
const manejo_errores_1 = require("../../middleware/manejo-errores");
const jwt_1 = require("../../config/jwt");
const autenticacion_repository_1 = require("./autenticacion.repository");
Object.defineProperty(exports, "updatePassword", { enumerable: true, get: function () { return autenticacion_repository_1.updatePassword; } });
const crypto_1 = require("crypto");
const email_1 = require("../../config/email");
const env_1 = require("../../config/env");
const REFRESH_COOKIE_NAME = 'refresh_token';
exports.REFRESH_COOKIE_NAME = REFRESH_COOKIE_NAME;
/**
 * Servicio de Login.
 * Valida credenciales, registra el intento y devuelve tokens + sesión.
 */
async function loginService(dto, ip, userAgent) {
    const usuario = await (0, autenticacion_repository_1.findUsuarioByEmail)(dto.email);
    if (!usuario) {
        throw new manejo_errores_1.AppError(401, 'Credenciales incorrectas');
    }
    if (!usuario.activo) {
        throw new manejo_errores_1.AppError(403, 'Cuenta desactivada. Contacta al administrador.');
    }
    if (usuario.bloqueado) {
        throw new manejo_errores_1.AppError(403, 'Cuenta bloqueada por múltiples intentos fallidos. Contacta al administrador.');
    }
    const passwordOk = await bcrypt_1.default.compare(dto.contrasena, usuario.contrasena_hash);
    // Registrar intento (el trigger maneja el bloqueo automático)
    await (0, autenticacion_repository_1.registrarIntentoLogin)(usuario.id_usuario, passwordOk, ip);
    if (!passwordOk) {
        throw new manejo_errores_1.AppError(401, 'Credenciales incorrectas');
    }
    // Obtener permisos
    const permisos = await (0, autenticacion_repository_1.findPermisosByRol)(usuario.id_rol);
    // Generar tokens
    const accessToken = (0, jwt_1.generarAccessToken)({
        sub: usuario.id_usuario,
        rol: usuario.nombre_rol,
        sucursalId: usuario.id_sucursal,
    });
    const jti = (0, crypto_1.randomUUID)();
    const refreshToken = (0, jwt_1.generarRefreshToken)({ sub: usuario.id_usuario, jti });
    // Guardar sesión
    await (0, autenticacion_repository_1.crearSesion)(usuario.id_usuario, refreshToken, ip, userAgent);
    const sesion = {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.nombre_rol,
        permisos,
        sucursalId: usuario.id_sucursal,
    };
    return { usuario: sesion, accessToken, refreshToken };
}
/**
 * Servicio de Logout.
 * Invalida todas las sesiones del usuario.
 */
async function logoutService(idUsuario) {
    await (0, autenticacion_repository_1.invalidarSesiones)(idUsuario);
}
/**
 * Servicio de Refresh Token.
 * Valida el refresh token en la cookie y emite un nuevo access token.
 */
async function refreshService(refreshTokenFromCookie) {
    if (!refreshTokenFromCookie) {
        throw new manejo_errores_1.AppError(401, 'Refresh token no encontrado');
    }
    let payload;
    try {
        payload = (0, jwt_1.verificarRefreshToken)(refreshTokenFromCookie);
    }
    catch {
        throw new manejo_errores_1.AppError(401, 'Refresh token inválido o expirado');
    }
    const sesion = await (0, autenticacion_repository_1.findSesionByRefreshToken)(refreshTokenFromCookie);
    if (!sesion) {
        throw new manejo_errores_1.AppError(401, 'Sesión no encontrada o expirada');
    }
    // Obtener datos del usuario para incluir en el nuevo token
    const usuario = await (0, autenticacion_repository_1.findUsuarioById)(payload.sub);
    if (!usuario) {
        throw new manejo_errores_1.AppError(401, 'Usuario no encontrado');
    }
    if (!usuario.activo) {
        throw new manejo_errores_1.AppError(403, 'Cuenta desactivada');
    }
    if (usuario.bloqueado) {
        throw new manejo_errores_1.AppError(403, 'Cuenta bloqueada');
    }
    const accessToken = (0, jwt_1.generarAccessToken)({
        sub: usuario.id_usuario,
        rol: usuario.nombre_rol,
        sucursalId: usuario.id_sucursal,
    });
    return { accessToken };
}
/**
 * Servicio de Recuperación de Contraseña.
 * Genera un token, lo guarda en BD y envía correo.
 */
async function recuperarContrasenaService(dto) {
    const usuario = await (0, autenticacion_repository_1.findUsuarioByEmail)(dto.email);
    // Por seguridad, no revelamos si el correo existe o no
    if (!usuario) {
        return;
    }
    const token = (0, crypto_1.randomUUID)();
    await (0, autenticacion_repository_1.crearTokenRecuperacion)(usuario.id_usuario, token);
    const enlace = `${env_1.env.FRONTEND_URL}/restablecer-contrasena?token=${token}`;
    const asunto = 'Recuperación de Contraseña - Clínica Dr. Lentes';
    const cuerpo = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #00658d;">Restablecimiento de Contraseña</h2>
      <p>Hola, ${usuario.nombre} ${usuario.apellido}.</p>
      <p>Has solicitado restablecer tu contraseña para acceder al sistema de la Clínica Optométrica.</p>
      <p>Haz clic en el siguiente botón para continuar (este enlace expira en 5 minutos):</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${enlace}" style="background-color: #00658d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
      </div>
      <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
      <p style="word-break: break-all;"><a href="${enlace}">${enlace}</a></p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
    </div>
  `;
    await (0, email_1.enviarCorreo)(usuario.email, asunto, cuerpo);
}
/**
 * Servicio de Restablecimiento de Contraseña.
 * Valida el token, hashea la nueva contraseña y actualiza la BD.
 */
async function restablecerContrasenaService(dto) {
    const tokenDb = await (0, autenticacion_repository_1.findTokenRecuperacion)(dto.token);
    if (!tokenDb) {
        throw new manejo_errores_1.AppError(400, 'El enlace de recuperación es inválido o no existe');
    }
    if (tokenDb.utilizado) {
        throw new manejo_errores_1.AppError(400, 'El enlace de recuperación ya ha sido utilizado');
    }
    if (tokenDb.expirado) {
        throw new manejo_errores_1.AppError(400, 'El enlace de recuperación ha expirado');
    }
    const contrasenaHash = await bcrypt_1.default.hash(dto.contrasena, 12);
    await (0, autenticacion_repository_1.restablecerContrasenaRepo)(tokenDb.id_usuario, tokenDb.id_token, contrasenaHash);
}
//# sourceMappingURL=autenticacion.service.js.map