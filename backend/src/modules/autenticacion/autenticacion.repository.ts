import { query, withTransaction } from '../../config/database'
import type { UsuarioDb } from './autenticacion.types'

/**
 * Busca un usuario por email (con datos del empleado y rol).
 */
export async function findUsuarioByEmail(email: string): Promise<UsuarioDb | null> {
  const result = await query<UsuarioDb>(`
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
  `, [email])

  return result.rows[0] ?? null
}

/**
 * Busca un usuario por ID (con datos del empleado y rol).
 */
export async function findUsuarioById(idUsuario: number): Promise<UsuarioDb | null> {
  const result = await query<UsuarioDb>(`
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
  `, [idUsuario])

  return result.rows[0] ?? null
}


/**
 * Registra un intento de login (exitoso o fallido).
 * El trigger tg_controlar_intentos_login maneja el bloqueo automático.
 */
export async function registrarIntentoLogin(
  idUsuario: number,
  exitoso: boolean,
  ip: string,
): Promise<void> {
  await query(`
    INSERT INTO intentos_login (id_usuario, exitoso, ip_address)
    VALUES ($1, $2, $3)
  `, [idUsuario, exitoso, ip])
}

/**
 * Registra una nueva sesión activa.
 */
export async function crearSesion(
  idUsuario: number,
  refreshToken: string,
  ip: string,
  userAgent: string,
): Promise<void> {
  await query(`
    INSERT INTO sesiones (id_usuario, refresh_token, ip_address, user_agent, expira_en)
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
  `, [idUsuario, refreshToken, ip, userAgent])
}

/**
 * Invalida todas las sesiones de un usuario.
 */
export async function invalidarSesiones(idUsuario: number): Promise<void> {
  await query(`
    DELETE FROM sesiones WHERE id_usuario = $1
  `, [idUsuario])
}

/**
 * Busca una sesión activa por refresh token.
 */
export async function findSesionByRefreshToken(
  refreshToken: string,
): Promise<{ id_usuario: number; expira_en: Date } | null> {
  const result = await query<{ id_usuario: number; expira_en: Date }>(`
    SELECT id_usuario, expira_en
    FROM sesiones
    WHERE refresh_token = $1 AND expira_en > NOW()
    LIMIT 1
  `, [refreshToken])
  return result.rows[0] ?? null
}

/**
 * Obtiene los permisos de un usuario por su rol.
 */
export async function findPermisosByRol(idRol: number): Promise<string[]> {
  const result = await query<{ nombre_permiso: string }>(`
    SELECT p.nombre_permiso
    FROM permisos p
    JOIN roles_permisos rp ON rp.id_permiso = p.id_permiso
    WHERE rp.id_rol = $1
  `, [idRol])
  return result.rows.map((r) => r.nombre_permiso)
}

/**
 * Actualiza el hash de la contraseña de un usuario.
 */
export async function updatePassword(
  idUsuario: number,
  nuevoHash: string,
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`
      UPDATE usuarios SET contrasena_hash = $1, bloqueado = FALSE
      WHERE id_usuario = $2
    `, [nuevoHash, idUsuario])
  })
}

/**
 * Registra un token de recuperación.
 */
export async function crearTokenRecuperacion(idUsuario: number, token: string): Promise<void> {
  await query(`
    INSERT INTO tokens_recuperacion (id_usuario, token, fecha_expiracion)
    VALUES ($1, $2, NOW())
  `, [idUsuario, token])
}

/**
 * Busca un token de recuperación.
 */
export async function findTokenRecuperacion(
  token: string,
): Promise<{ id_token: number; id_usuario: number; utilizado: boolean; expirado: boolean } | null> {
  const result = await query<{ id_token: number; id_usuario: number; utilizado: boolean; expirado: boolean }>(`
    SELECT id_token, id_usuario, utilizado, (fecha_expiracion < NOW()) AS expirado
    FROM tokens_recuperacion
    WHERE token = $1
    LIMIT 1
  `, [token])
  return result.rows[0] ?? null
}

/**
 * Realiza el restablecimiento de contraseña en una transacción.
 */
export async function restablecerContrasenaRepo(
  idUsuario: number,
  idToken: number,
  nuevoHash: string,
): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Actualizar contraseña y desbloquear
    await client.query(`
      UPDATE usuarios SET contrasena_hash = $1, bloqueado = FALSE, fecha_bloqueo = NULL
      WHERE id_usuario = $2
    `, [nuevoHash, idUsuario])

    // 2. Marcar token como utilizado (disparará tg_validar_uso_token)
    await client.query(`
      UPDATE tokens_recuperacion SET utilizado = TRUE
      WHERE id_token = $1
    `, [idToken])

    // 3. Eliminar sesiones
    await client.query(`
      DELETE FROM sesiones WHERE id_usuario = $1
    `, [idUsuario])
  })
}

