"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllSucursales = findAllSucursales;
exports.findSucursalById = findSucursalById;
exports.createSucursal = createSucursal;
exports.updateSucursal = updateSucursal;
exports.toggleSucursalEstado = toggleSucursalEstado;
const database_1 = require("../../config/database");
/**
 * Obtiene todas las sucursales del sistema.
 */
async function findAllSucursales(soloActivas = false) {
    const sql = soloActivas
        ? 'SELECT id_sucursal, nombre, direccion, telefono, correo, activa FROM sucursales WHERE activa = TRUE ORDER BY nombre'
        : 'SELECT id_sucursal, nombre, direccion, telefono, correo, activa FROM sucursales ORDER BY nombre';
    const result = await (0, database_1.query)(sql);
    return result.rows;
}
/**
 * Obtiene una sucursal por su ID.
 */
async function findSucursalById(id) {
    const result = await (0, database_1.query)('SELECT id_sucursal, nombre, direccion, telefono, correo, activa FROM sucursales WHERE id_sucursal = $1 LIMIT 1', [id]);
    return result.rows[0] ?? null;
}
/**
 * Crea una nueva sucursal en el sistema.
 */
async function createSucursal(dto) {
    const result = await (0, database_1.query)(`INSERT INTO sucursales (nombre, direccion, telefono, correo)
     VALUES ($1, $2, $3, $4)
     RETURNING id_sucursal, nombre, direccion, telefono, correo, activa`, [dto.nombre, dto.direccion ?? null, dto.telefono ?? null, dto.correo || null]);
    return result.rows[0];
}
/**
 * Actualiza los datos de una sucursal existente.
 */
async function updateSucursal(id, dto) {
    const result = await (0, database_1.query)(`UPDATE sucursales
     SET nombre = $1, direccion = $2, telefono = $3, correo = $4
     WHERE id_sucursal = $5
     RETURNING id_sucursal, nombre, direccion, telefono, correo, activa`, [dto.nombre, dto.direccion ?? null, dto.telefono ?? null, dto.correo || null, id]);
    return result.rows[0] ?? null;
}
/**
 * Modifica el estado activo/inactivo de una sucursal.
 */
async function toggleSucursalEstado(id, activa) {
    const result = await (0, database_1.query)(`UPDATE sucursales
     SET activa = $1
     WHERE id_sucursal = $2
     RETURNING id_sucursal, nombre, direccion, telefono, correo, activa`, [activa, id]);
    return result.rows[0] ?? null;
}
//# sourceMappingURL=sucursales.repository.js.map