import { query, withTransaction } from '../../config/database'
import type {
  UsuarioDetalleDb,
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  RolDb,
  PermisoDb,
  EmpleadoDb,
} from './usuarios.types'

/**
 * Obtiene todos los usuarios del sistema.
 */
export async function findAllUsuarios(): Promise<UsuarioDetalleDb[]> {
  const result = await query<UsuarioDetalleDb>(`
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.activo,
      u.bloqueado,
      u.fecha_bloqueo,
      u.fecha_creacion,
      u.ultimo_acceso,
      r.id_rol,
      r.nombre_rol,
      e.id_empleado,
      e.primer_nombre,
      e.segundo_nombre,
      e.primer_apellido,
      e.segundo_apellido,
      e.numero_telefono,
      e.correo,
      e.id_sucursal,
      s.nombre AS nombre_sucursal
    FROM usuarios u
    JOIN empleados e ON e.id_empleado = u.id_empleado
    JOIN roles r ON r.id_rol = u.id_rol
    LEFT JOIN sucursales s ON s.id_sucursal = e.id_sucursal
    ORDER BY e.primer_nombre, e.primer_apellido
  `)
  return result.rows
}

/**
 * Obtiene un usuario detallado por su ID.
 */
export async function findUsuarioDetalleById(id: number): Promise<UsuarioDetalleDb | null> {
  const result = await query<UsuarioDetalleDb>(`
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.activo,
      u.bloqueado,
      u.fecha_bloqueo,
      u.fecha_creacion,
      u.ultimo_acceso,
      r.id_rol,
      r.nombre_rol,
      e.id_empleado,
      e.primer_nombre,
      e.segundo_nombre,
      e.primer_apellido,
      e.segundo_apellido,
      e.numero_telefono,
      e.correo,
      e.id_sucursal,
      s.nombre AS nombre_sucursal
    FROM usuarios u
    JOIN empleados e ON e.id_empleado = u.id_empleado
    JOIN roles r ON r.id_rol = u.id_rol
    LEFT JOIN sucursales s ON s.id_sucursal = e.id_sucursal
    WHERE u.id_usuario = $1
    LIMIT 1
  `, [id])
  return result.rows[0] ?? null
}

/**
 * Busca un usuario por nombre de usuario.
 */
export async function findUsuarioByNombreUsuario(nombreUsuario: string): Promise<{ id_usuario: number } | null> {
  const result = await query<{ id_usuario: number }>(
    'SELECT id_usuario FROM usuarios WHERE nombre_usuario = $1 LIMIT 1',
    [nombreUsuario]
  )
  return result.rows[0] ?? null
}

/**
 * Obtiene todos los roles.
 */
export async function findRoles(): Promise<RolDb[]> {
  const result = await query<RolDb>('SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY nombre_rol')
  return result.rows
}

/**
 * Obtiene todos los permisos.
 */
export async function findPermisos(): Promise<PermisoDb[]> {
  const result = await query<PermisoDb>('SELECT id_permiso, nombre_permiso, modulo, descripcion FROM permisos ORDER BY modulo, nombre_permiso')
  return result.rows
}

/**
 * Obtiene los permisos asociados a un rol específico.
 */
export async function findPermisosByRolId(rolId: number): Promise<number[]> {
  const result = await query<{ id_permiso: number }>(
    'SELECT id_permiso FROM roles_permisos WHERE id_rol = $1',
    [rolId]
  )
  return result.rows.map((r) => r.id_permiso)
}

/**
 * Obtiene todos los empleados.
 */
export async function findEmpleados(): Promise<EmpleadoDb[]> {
  const result = await query<EmpleadoDb>(`
    SELECT e.id_empleado, e.primer_nombre, e.segundo_nombre, e.primer_apellido, e.segundo_apellido,
           e.numero_telefono, e.correo, e.id_sucursal, e.activo, s.nombre AS nombre_sucursal
    FROM empleados e
    LEFT JOIN sucursales s ON s.id_sucursal = e.id_sucursal
    ORDER BY e.primer_nombre
  `)
  return result.rows
}

/**
 * Inserta un empleado y un usuario correspondiente en una sola transacción.
 */
export async function insertUsuarioYEmpleadoTransaccion(
  dto: CrearUsuarioDto,
  contrasenaHash: string,
): Promise<number> {
  return withTransaction(async (client) => {
    // 1. Insertar empleado
    const empResult = await client.query<{ id_empleado: number }>(
      `INSERT INTO empleados (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_telefono, correo, id_sucursal)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_empleado`,
      [
        dto.primer_nombre,
        dto.segundo_nombre ?? null,
        dto.primer_apellido,
        dto.segundo_apellido ?? null,
        dto.numero_telefono ?? null,
        dto.correo || null,
        dto.id_sucursal,
      ]
    )
    const idEmpleado = empResult.rows[0].id_empleado

    // 2. Insertar usuario
    const usrResult = await client.query<{ id_usuario: number }>(
      `INSERT INTO usuarios (nombre_usuario, contrasena_hash, id_empleado, id_rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario`,
      [dto.nombre_usuario, contrasenaHash, idEmpleado, dto.id_rol]
    )
    return usrResult.rows[0].id_usuario
  })
}

/**
 * Actualiza los datos de un usuario y de su empleado correspondiente en una sola transacción.
 */
export async function updateUsuarioYEmpleadoTransaccion(
  idUsuario: number,
  idEmpleado: number,
  dto: ActualizarUsuarioDto,
  contrasenaHash?: string,
): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Actualizar empleado si hay datos del empleado en el DTO
    await client.query(`
      UPDATE empleados
      SET
        primer_nombre = COALESCE($1, primer_nombre),
        segundo_nombre = COALESCE($2, segundo_nombre),
        primer_apellido = COALESCE($3, primer_apellido),
        segundo_apellido = COALESCE($4, segundo_apellido),
        numero_telefono = COALESCE($5, numero_telefono),
        correo = COALESCE($6, correo),
        id_sucursal = COALESCE($7, id_sucursal)
      WHERE id_empleado = $8
    `, [
      dto.primer_nombre ?? null,
      dto.segundo_nombre ?? null,
      dto.primer_apellido ?? null,
      dto.segundo_apellido ?? null,
      dto.numero_telefono ?? null,
      dto.correo || null,
      dto.id_sucursal ?? null,
      idEmpleado,
    ])

    // 2. Actualizar usuario
    if (contrasenaHash) {
      await client.query(`
        UPDATE usuarios
        SET
          nombre_usuario = COALESCE($1, nombre_usuario),
          id_rol = COALESCE($2, id_rol),
          contrasena_hash = $3
        WHERE id_usuario = $4
      `, [dto.nombre_usuario ?? null, dto.id_rol ?? null, contrasenaHash, idUsuario])
    } else {
      await client.query(`
        UPDATE usuarios
        SET
          nombre_usuario = COALESCE($1, nombre_usuario),
          id_rol = COALESCE($2, id_rol)
        WHERE id_usuario = $3
      `, [dto.nombre_usuario ?? null, dto.id_rol ?? null, idUsuario])
    }
  })
}

/**
 * Modifica el estado activo/inactivo de un usuario.
 */
export async function toggleUsuarioEstado(id: number, activo: boolean): Promise<void> {
  await query('UPDATE usuarios SET activo = $1 WHERE id_usuario = $2', [activo, id])
}

/**
 * Desbloquea un usuario bloqueado por múltiples intentos de login.
 */
export async function desbloquearUsuarioRepo(id: number): Promise<void> {
  await query('UPDATE usuarios SET bloqueado = FALSE, fecha_bloqueo = NULL WHERE id_usuario = $1', [id])
}

/**
 * Actualiza los permisos asociados a un rol.
 */
export async function updateRolPermisos(rolId: number, permisosIds: number[]): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Eliminar permisos existentes del rol
    await client.query('DELETE FROM roles_permisos WHERE id_rol = $1', [rolId])

    // 2. Insertar los nuevos permisos
    for (const permisoId of permisosIds) {
      await client.query(
        'INSERT INTO roles_permisos (id_rol, id_permiso) VALUES ($1, $2)',
        [rolId, permisoId]
      )
    }
  })
}
