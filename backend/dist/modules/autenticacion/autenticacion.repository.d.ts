import type { UsuarioDb } from './autenticacion.types';
/**
 * Busca un usuario por email (con datos del empleado y rol).
 */
export declare function findUsuarioByEmail(email: string): Promise<UsuarioDb | null>;
/**
 * Busca un usuario por ID (con datos del empleado y rol).
 */
export declare function findUsuarioById(idUsuario: number): Promise<UsuarioDb | null>;
/**
 * Registra un intento de login (exitoso o fallido).
 * El trigger tg_controlar_intentos_login maneja el bloqueo automático.
 */
export declare function registrarIntentoLogin(idUsuario: number, exitoso: boolean, ip: string): Promise<void>;
/**
 * Registra una nueva sesión activa.
 */
export declare function crearSesion(idUsuario: number, refreshToken: string, ip: string, userAgent: string): Promise<void>;
/**
 * Invalida todas las sesiones de un usuario.
 */
export declare function invalidarSesiones(idUsuario: number): Promise<void>;
/**
 * Busca una sesión activa por refresh token.
 */
export declare function findSesionByRefreshToken(refreshToken: string): Promise<{
    id_usuario: number;
    expira_en: Date;
} | null>;
/**
 * Obtiene los permisos de un usuario por su rol.
 */
export declare function findPermisosByRol(idRol: number): Promise<string[]>;
/**
 * Actualiza el hash de la contraseña de un usuario.
 */
export declare function updatePassword(idUsuario: number, nuevoHash: string): Promise<void>;
/**
 * Registra un token de recuperación.
 */
export declare function crearTokenRecuperacion(idUsuario: number, token: string): Promise<void>;
/**
 * Busca un token de recuperación.
 */
export declare function findTokenRecuperacion(token: string): Promise<{
    id_token: number;
    id_usuario: number;
    utilizado: boolean;
    expirado: boolean;
} | null>;
/**
 * Realiza el restablecimiento de contraseña en una transacción.
 */
export declare function restablecerContrasenaRepo(idUsuario: number, idToken: number, nuevoHash: string): Promise<void>;
//# sourceMappingURL=autenticacion.repository.d.ts.map