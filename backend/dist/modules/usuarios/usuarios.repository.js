"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUsuarios = findAllUsuarios;
exports.findUsuarioDetalleById = findUsuarioDetalleById;
exports.findUsuarioByNombreUsuario = findUsuarioByNombreUsuario;
exports.findRoles = findRoles;
exports.findPermisos = findPermisos;
exports.findPermisosByRolId = findPermisosByRolId;
exports.findEmpleados = findEmpleados;
exports.insertUsuarioYEmpleadoTransaccion = insertUsuarioYEmpleadoTransaccion;
exports.updateUsuarioYEmpleadoTransaccion = updateUsuarioYEmpleadoTransaccion;
exports.toggleUsuarioEstado = toggleUsuarioEstado;
exports.desbloquearUsuarioRepo = desbloquearUsuarioRepo;
exports.updateRolPermisos = updateRolPermisos;
const database_1 = require("../../config/database");
/**
 * Obtiene todos los usuarios del sistema.
 */
async function findAllUsuarios() {
    const result = await (0, database_1.query)(`
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
      e.nombres,
      e.apellidos,
      e.numero_telefono,
      e.correo,
      e.id_sucursal,
      s.nombre AS nombre_sucursal
    FROM usuarios u
    JOIN empleados e ON e.id_empleado = u.id_empleado
    JOIN roles r ON r.id_rol = u.id_rol
    LEFT JOIN sucursales s ON s.id_sucursal = e.id_sucursal
    ORDER BY e.apellidos, e.nombres
  `);
    return result.rows;
}
/**
 * Obtiene un usuario detallado por su ID.
 */
async function findUsuarioDetalleById(id) {
    const result = await (0, database_1.query)(`
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
      e.nombres,
      e.apellidos,
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
  `, [id]);
    return result.rows[0] ?? null;
}
/**
 * Busca un usuario por nombre de usuario.
 */
async function findUsuarioByNombreUsuario(nombreUsuario) {
    const result = await (0, database_1.query)('SELECT id_usuario FROM usuarios WHERE nombre_usuario = $1 LIMIT 1', [nombreUsuario]);
    return result.rows[0] ?? null;
}
/**
 * Obtiene todos los roles.
 */
async function findRoles() {
    const result = await (0, database_1.query)('SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY nombre_rol');
    return result.rows;
}
/**
 * Obtiene todos los permisos.
 */
async function findPermisos() {
    const result = await (0, database_1.query)('SELECT id_permiso, nombre_permiso, modulo, descripcion FROM permisos ORDER BY modulo, nombre_permiso');
    return result.rows;
}
/**
 * Obtiene los permisos asociados a un rol específico.
 */
async function findPermisosByRolId(rolId) {
    const result = await (0, database_1.query)('SELECT id_permiso FROM roles_permisos WHERE id_rol = $1', [rolId]);
    return result.rows.map((r) => r.id_permiso);
}
/**
 * Obtiene todos los empleados.
 */
async function findEmpleados() {
    const result = await (0, database_1.query)(`
    SELECT e.id_empleado, e.nombres, e.apellidos,
           e.numero_telefono, e.correo, e.id_sucursal, e.activo, s.nombre AS nombre_sucursal
    FROM empleados e
    LEFT JOIN sucursales s ON s.id_sucursal = e.id_sucursal
    ORDER BY e.apellidos, e.nombres
  `);
    return result.rows;
}
/**
 * Inserta un empleado y un usuario correspondiente en una sola transacción.
 */
async function insertUsuarioYEmpleadoTransaccion(dto, contrasenaHash) {
    return (0, database_1.withTransaction)(async (client) => {
        // 1. Insertar empleado
        const empResult = await client.query(`INSERT INTO empleados (nombres, apellidos, numero_telefono, correo, id_sucursal)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_empleado`, [
            dto.nombres,
            dto.apellidos,
            dto.numero_telefono ?? null,
            dto.correo || null,
            dto.id_sucursal,
        ]);
        const idEmpleado = empResult.rows[0].id_empleado;
        // 2. Insertar usuario
        const usrResult = await client.query(`INSERT INTO usuarios (nombre_usuario, contrasena_hash, id_empleado, id_rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario`, [dto.nombre_usuario, contrasenaHash, idEmpleado, dto.id_rol]);
        return usrResult.rows[0].id_usuario;
    });
}
/**
 * Actualiza los datos de un usuario y de su empleado correspondiente en una sola transacción.
 */
async function updateUsuarioYEmpleadoTransaccion(idUsuario, idEmpleado, dto, contrasenaHash) {
    await (0, database_1.withTransaction)(async (client) => {
        // 1. Actualizar empleado si hay datos del empleado en el DTO
        await client.query(`
      UPDATE empleados
      SET
        nombres = COALESCE($1, nombres),
        apellidos = COALESCE($2, apellidos),
        numero_telefono = COALESCE($3, numero_telefono),
        correo = COALESCE($4, correo),
        id_sucursal = COALESCE($5, id_sucursal)
      WHERE id_empleado = $6
    `, [
            dto.nombres ?? null,
            dto.apellidos ?? null,
            dto.numero_telefono ?? null,
            dto.correo || null,
            dto.id_sucursal ?? null,
            idEmpleado,
        ]);
        // 2. Actualizar usuario
        if (contrasenaHash) {
            await client.query(`
        UPDATE usuarios
        SET
          nombre_usuario = COALESCE($1, nombre_usuario),
          id_rol = COALESCE($2, id_rol),
          contrasena_hash = $3
        WHERE id_usuario = $4
      `, [dto.nombre_usuario ?? null, dto.id_rol ?? null, contrasenaHash, idUsuario]);
        }
        else {
            await client.query(`
        UPDATE usuarios
        SET
          nombre_usuario = COALESCE($1, nombre_usuario),
          id_rol = COALESCE($2, id_rol)
        WHERE id_usuario = $3
      `, [dto.nombre_usuario ?? null, dto.id_rol ?? null, idUsuario]);
        }
    });
}
/**
 * Modifica el estado activo/inactivo de un usuario.
 */
async function toggleUsuarioEstado(id, activo) {
    await (0, database_1.query)('UPDATE usuarios SET activo = $1 WHERE id_usuario = $2', [activo, id]);
}
/**
 * Desbloquea un usuario bloqueado por múltiples intentos de login.
 */
async function desbloquearUsuarioRepo(id) {
    await (0, database_1.query)('UPDATE usuarios SET bloqueado = FALSE, fecha_bloqueo = NULL WHERE id_usuario = $1', [id]);
}
/**
 * Actualiza los permisos asociados a un rol.
 */
async function updateRolPermisos(rolId, permisosIds) {
    await (0, database_1.withTransaction)(async (client) => {
        // 1. Eliminar permisos existentes del rol
        await client.query('DELETE FROM roles_permisos WHERE id_rol = $1', [rolId]);
        // 2. Insertar los nuevos permisos
        for (const permisoId of permisosIds) {
            await client.query('INSERT INTO roles_permisos (id_rol, id_permiso) VALUES ($1, $2)', [rolId, permisoId]);
        }
    });
}
//# sourceMappingURL=usuarios.repository.js.map