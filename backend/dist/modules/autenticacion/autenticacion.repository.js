"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUsuarioByEmail = findUsuarioByEmail;
exports.findUsuarioById = findUsuarioById;
exports.registrarIntentoLogin = registrarIntentoLogin;
exports.crearSesion = crearSesion;
exports.invalidarSesiones = invalidarSesiones;
exports.findSesionByRefreshToken = findSesionByRefreshToken;
exports.findPermisosByRol = findPermisosByRol;
exports.updatePassword = updatePassword;
exports.crearTokenRecuperacion = crearTokenRecuperacion;
exports.findTokenRecuperacion = findTokenRecuperacion;
exports.restablecerContrasenaRepo = restablecerContrasenaRepo;
const database_1 = require("../../config/database");
/**
 * Busca un usuario por email (con datos del empleado y rol).
 */
async function findUsuarioByEmail(email) {
    const result = await (0, database_1.query)(`
    SELECT
      u.id_usuario,
      u.id_empleado,
      u.email,
      u.contrasena_hash,
      u.activo,
      u.bloqueado,
      r.id_rol,
      r.nombre_rol,
      e.id_sucursal,
      e.nombre,
      e.apellido
    FROM usuarios u
    JOIN empleados e ON e.id_empleado = u.id_empleado
    JOIN roles r ON r.id_rol = u.id_rol
    WHERE u.email = $1
    LIMIT 1
  `, [email]);
    return result.rows[0] ?? null;
}
/**
 * Busca un usuario por ID (con datos del empleado y rol).
 */
async function findUsuarioById(idUsuario) {
    const result = await (0, database_1.query)(`
    SELECT
      u.id_usuario,
      u.id_empleado,
      u.email,
      u.contrasena_hash,
      u.activo,
      u.bloqueado,
      r.id_rol,
      r.nombre_rol,
      e.id_sucursal,
      e.nombre,
      e.apellido
    FROM usuarios u
    JOIN empleados e ON e.id_empleado = u.id_empleado
    JOIN roles r ON r.id_rol = u.id_rol
    WHERE u.id_usuario = $1
    LIMIT 1
  `, [idUsuario]);
    return result.rows[0] ?? null;
}
/**
 * Registra un intento de login (exitoso o fallido).
 * El trigger tg_controlar_intentos_login maneja el bloqueo automático.
 */
async function registrarIntentoLogin(idUsuario, exitoso, ip) {
    await (0, database_1.query)(`
    INSERT INTO intentos_login (id_usuario, exitoso, ip_address)
    VALUES ($1, $2, $3)
  `, [idUsuario, exitoso, ip]);
}
/**
 * Registra una nueva sesión activa.
 */
async function crearSesion(idUsuario, refreshToken, ip, userAgent) {
    await (0, database_1.query)(`
    INSERT INTO sesiones (id_usuario, refresh_token, ip_address, user_agent, expira_en)
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
  `, [idUsuario, refreshToken, ip, userAgent]);
}
/**
 * Invalida todas las sesiones de un usuario.
 */
async function invalidarSesiones(idUsuario) {
    await (0, database_1.query)(`
    DELETE FROM sesiones WHERE id_usuario = $1
  `, [idUsuario]);
}
/**
 * Busca una sesión activa por refresh token.
 */
async function findSesionByRefreshToken(refreshToken) {
    const result = await (0, database_1.query)(`
    SELECT id_usuario, expira_en
    FROM sesiones
    WHERE refresh_token = $1 AND expira_en > NOW()
    LIMIT 1
  `, [refreshToken]);
    return result.rows[0] ?? null;
}
/**
 * Obtiene los permisos de un usuario por su rol.
 */
async function findPermisosByRol(idRol) {
    const result = await (0, database_1.query)(`
    SELECT p.nombre_permiso
    FROM permisos p
    JOIN roles_permisos rp ON rp.id_permiso = p.id_permiso
    WHERE rp.id_rol = $1
  `, [idRol]);
    return result.rows.map((r) => r.nombre_permiso);
}
/**
 * Actualiza el hash de la contraseña de un usuario.
 */
async function updatePassword(idUsuario, nuevoHash) {
    await (0, database_1.withTransaction)(async (client) => {
        await client.query(`
      UPDATE usuarios SET contrasena_hash = $1, bloqueado = FALSE
      WHERE id_usuario = $2
    `, [nuevoHash, idUsuario]);
    });
}
/**
 * Registra un token de recuperación.
 */
async function crearTokenRecuperacion(idUsuario, token) {
    await (0, database_1.query)(`
    INSERT INTO tokens_recuperacion (id_usuario, token, fecha_expiracion)
    VALUES ($1, $2, NOW())
  `, [idUsuario, token]);
}
/**
 * Busca un token de recuperación.
 */
async function findTokenRecuperacion(token) {
    const result = await (0, database_1.query)(`
    SELECT id_token, id_usuario, utilizado, (fecha_expiracion < NOW()) AS expirado
    FROM tokens_recuperacion
    WHERE token = $1
    LIMIT 1
  `, [token]);
    return result.rows[0] ?? null;
}
/**
 * Realiza el restablecimiento de contraseña en una transacción.
 */
async function restablecerContrasenaRepo(idUsuario, idToken, nuevoHash) {
    await (0, database_1.withTransaction)(async (client) => {
        // 1. Actualizar contraseña y desbloquear
        await client.query(`
      UPDATE usuarios SET contrasena_hash = $1, bloqueado = FALSE, fecha_bloqueo = NULL
      WHERE id_usuario = $2
    `, [nuevoHash, idUsuario]);
        // 2. Marcar token como utilizado (disparará tg_validar_uso_token)
        await client.query(`
      UPDATE tokens_recuperacion SET utilizado = TRUE
      WHERE id_token = $1
    `, [idToken]);
        // 3. Eliminar sesiones
        await client.query(`
      DELETE FROM sesiones WHERE id_usuario = $1
    `, [idUsuario]);
    });
}
//# sourceMappingURL=autenticacion.repository.js.map