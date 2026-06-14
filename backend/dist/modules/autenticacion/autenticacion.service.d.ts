import { updatePassword } from './autenticacion.repository';
import type { LoginDto, SesionUsuario, RecuperarDto, RestablecerDto } from './autenticacion.types';
declare const REFRESH_COOKIE_NAME = "refresh_token";
/**
 * Servicio de Login.
 * Valida credenciales, registra el intento y devuelve tokens + sesión.
 */
export declare function loginService(dto: LoginDto, ip: string, userAgent: string): Promise<{
    usuario: SesionUsuario;
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Servicio de Logout.
 * Invalida todas las sesiones del usuario.
 */
export declare function logoutService(idUsuario: number): Promise<void>;
/**
 * Servicio de Refresh Token.
 * Valida el refresh token en la cookie y emite un nuevo access token.
 */
export declare function refreshService(refreshTokenFromCookie: string | undefined): Promise<{
    accessToken: string;
}>;
/**
 * Servicio de Recuperación de Contraseña.
 * Genera un token, lo guarda en BD y envía correo.
 */
export declare function recuperarContrasenaService(dto: RecuperarDto): Promise<void>;
/**
 * Servicio de Restablecimiento de Contraseña.
 * Valida el token, hashea la nueva contraseña y actualiza la BD.
 */
export declare function restablecerContrasenaService(dto: RestablecerDto): Promise<void>;
export { REFRESH_COOKIE_NAME, updatePassword };
//# sourceMappingURL=autenticacion.service.d.ts.map