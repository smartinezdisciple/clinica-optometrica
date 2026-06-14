"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findEmpresas = findEmpresas;
exports.findEmpresaById = findEmpresaById;
exports.findEmpresaByRuc = findEmpresaByRuc;
exports.insertEmpresaTransaccion = insertEmpresaTransaccion;
exports.updateEmpresaTransaccion = updateEmpresaTransaccion;
exports.deleteEmpresaRepo = deleteEmpresaRepo;
const database_1 = require("../../config/database");
/**
 * Obtiene todas las empresas registradas o filtra por búsqueda.
 */
async function findEmpresas(search) {
    if (search) {
        const searchVal = `%${search}%`;
        const result = await (0, database_1.query)(`SELECT c.id_cliente, c.cedula, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
              c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
              e.razon_social, e.ruc
       FROM clientes c
       JOIN empresas e ON e.id_cliente = c.id_cliente
       WHERE c.tipo_cliente = 'Empresa'
         AND (e.razon_social ILIKE $1
              OR e.ruc ILIKE $1
              OR c.primer_nombre ILIKE $1
              OR c.primer_apellido ILIKE $1)
       ORDER BY e.razon_social`, [searchVal]);
        return result.rows;
    }
    const result = await (0, database_1.query)(`SELECT c.id_cliente, c.cedula, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
            c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
            e.razon_social, e.ruc
     FROM clientes c
     JOIN empresas e ON e.id_cliente = c.id_cliente
     WHERE c.tipo_cliente = 'Empresa'
     ORDER BY e.razon_social`);
    return result.rows;
}
/**
 * Obtiene una empresa por su ID de cliente.
 */
async function findEmpresaById(id) {
    const result = await (0, database_1.query)(`SELECT c.id_cliente, c.cedula, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
            c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
            e.razon_social, e.ruc
     FROM clientes c
     JOIN empresas e ON e.id_cliente = c.id_cliente
     WHERE c.id_cliente = $1 AND c.tipo_cliente = 'Empresa'
     LIMIT 1`, [id]);
    return result.rows[0] ?? null;
}
/**
 * Busca una empresa por RUC.
 */
async function findEmpresaByRuc(ruc) {
    const result = await (0, database_1.query)('SELECT id_cliente FROM empresas WHERE ruc = $1 LIMIT 1', [ruc]);
    return result.rows[0] ?? null;
}
/**
 * Registra un cliente de tipo Empresa y su extensión de Empresa en una transacción.
 */
async function insertEmpresaTransaccion(dto) {
    return (0, database_1.withTransaction)(async (client) => {
        // 1. Insertar en clientes
        const clienteResult = await client.query(`INSERT INTO clientes (cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_cliente, numero_telefono, correo)
       VALUES ($1, $2, $3, $4, $5, 'Empresa', $6, $7)
       RETURNING id_cliente`, [
            dto.cedula || null,
            dto.primer_nombre,
            dto.segundo_nombre || null,
            dto.primer_apellido,
            dto.segundo_apellido || null,
            dto.numero_telefono,
            dto.correo || null,
        ]);
        const idCliente = clienteResult.rows[0].id_cliente;
        // 2. Insertar en empresas
        await client.query(`INSERT INTO empresas (id_cliente, razon_social, ruc)
       VALUES ($1, $2, $3)`, [
            idCliente,
            dto.razon_social,
            dto.ruc,
        ]);
        return idCliente;
    });
}
/**
 * Actualiza los datos de contacto y la información de la empresa en una transacción.
 */
async function updateEmpresaTransaccion(id, dto) {
    await (0, database_1.withTransaction)(async (client) => {
        // 1. Actualizar clientes
        await client.query(`UPDATE clientes
       SET
         cedula = COALESCE($1, cedula),
         primer_nombre = COALESCE($2, primer_nombre),
         segundo_nombre = COALESCE($3, segundo_nombre),
         primer_apellido = COALESCE($4, primer_apellido),
         segundo_apellido = COALESCE($5, segundo_apellido),
         numero_telefono = COALESCE($6, numero_telefono),
         correo = COALESCE($7, correo)
       WHERE id_cliente = $8 AND tipo_cliente = 'Empresa'`, [
            dto.cedula !== undefined ? dto.cedula : null,
            dto.primer_nombre !== undefined ? dto.primer_nombre : null,
            dto.segundo_nombre !== undefined ? dto.segundo_nombre : null,
            dto.primer_apellido !== undefined ? dto.primer_apellido : null,
            dto.segundo_apellido !== undefined ? dto.segundo_apellido : null,
            dto.numero_telefono !== undefined ? dto.numero_telefono : null,
            dto.correo !== undefined ? dto.correo : null,
            id,
        ]);
        // 2. Actualizar empresas
        await client.query(`UPDATE empresas
       SET
         razon_social = COALESCE($1, razon_social),
         ruc = COALESCE($2, ruc)
       WHERE id_cliente = $3`, [
            dto.razon_social !== undefined ? dto.razon_social : null,
            dto.ruc !== undefined ? dto.ruc : null,
            id,
        ]);
    });
}
/**
 * Elimina una empresa (remoción en cascada).
 */
async function deleteEmpresaRepo(id) {
    await (0, database_1.query)("DELETE FROM clientes WHERE id_cliente = $1 AND tipo_cliente = 'Empresa'", [id]);
}
//# sourceMappingURL=empresas.repository.js.map