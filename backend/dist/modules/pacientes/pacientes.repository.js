"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPacientes = findPacientes;
exports.findPacienteById = findPacienteById;
exports.findClienteByCedula = findClienteByCedula;
exports.insertPacienteTransaccion = insertPacienteTransaccion;
exports.updatePacienteTransaccion = updatePacienteTransaccion;
exports.deletePacienteRepo = deletePacienteRepo;
const database_1 = require("../../config/database");
/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
async function findPacientes(search) {
    if (search) {
        const searchVal = `%${search}%`;
        const result = await (0, database_1.query)(`SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
                c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
                p.ocupacion, p.fecha_nacimiento, p.genero, p.id_empresa
        FROM clientes c
        JOIN pacientes p ON p.id_cliente = c.id_cliente
        WHERE c.tipo_cliente = 'Persona'
          AND (c.nombres ILIKE $1
               OR c.apellidos ILIKE $1
               OR c.cedula ILIKE $1
               OR c.numero_telefono ILIKE $1)
        ORDER BY c.apellidos, c.nombres`, [searchVal]);
        return result.rows;
    }
    const result = await (0, database_1.query)(`SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
             c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
             p.ocupacion, p.fecha_nacimiento, p.genero, p.id_empresa
     FROM clientes c
     JOIN pacientes p ON p.id_cliente = c.id_cliente
     WHERE c.tipo_cliente = 'Persona'
     ORDER BY c.apellidos, c.nombres`);
    return result.rows;
}
/**
 * Busca un paciente por su ID.
 */
async function findPacienteById(id) {
    const result = await (0, database_1.query)(`SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
             c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
             p.ocupacion, p.fecha_nacimiento, p.genero, p.id_empresa
     FROM clientes c
     JOIN pacientes p ON p.id_cliente = c.id_cliente
     WHERE c.id_cliente = $1 AND c.tipo_cliente = 'Persona'
     LIMIT 1`, [id]);
    return result.rows[0] ?? null;
}
/**
 * Busca un cliente (cualquiera) por su cédula.
 */
async function findClienteByCedula(cedula) {
    const result = await (0, database_1.query)('SELECT id_cliente FROM clientes WHERE cedula = $1 LIMIT 1', [cedula]);
    return result.rows[0] ?? null;
}
/**
 * Registra un cliente de tipo Persona y su extensión de Paciente en una sola transacción.
 */
async function insertPacienteTransaccion(dto) {
    return (0, database_1.withTransaction)(async (client) => {
        // 1. Insertar en clientes
        const clienteResult = await client.query(`INSERT INTO clientes (cedula, nombres, apellidos, tipo_cliente, numero_telefono, correo)
        VALUES ($1, $2, $3, 'Persona', $4, $5)
        RETURNING id_cliente`, [
            dto.cedula || null,
            dto.nombres,
            dto.apellidos,
            dto.numero_telefono,
            dto.correo || null,
        ]);
        const idCliente = clienteResult.rows[0].id_cliente;
        // 2. Insertar en pacientes
        await client.query(`INSERT INTO pacientes (id_cliente, ocupacion, fecha_nacimiento, genero, id_empresa)
       VALUES ($1, $2, $3, $4, $5)`, [
            idCliente,
            dto.ocupacion || null,
            dto.fecha_nacimiento,
            dto.genero || null,
            dto.id_empresa ?? null,
        ]);
        return idCliente;
    });
}
/**
 * Actualiza un cliente de tipo Persona y su extensión de Paciente en una sola transacción.
 */
async function updatePacienteTransaccion(id, dto) {
    await (0, database_1.withTransaction)(async (client) => {
        // 1. Actualizar clientes
        await client.query(`UPDATE clientes
        SET
          cedula = COALESCE($1, cedula),
          nombres = COALESCE($2, nombres),
          apellidos = COALESCE($3, apellidos),
          numero_telefono = COALESCE($4, numero_telefono),
          correo = COALESCE($5, correo)
        WHERE id_cliente = $6 AND tipo_cliente = 'Persona'`, [
            dto.cedula !== undefined ? dto.cedula : null,
            dto.nombres !== undefined ? dto.nombres : null,
            dto.apellidos !== undefined ? dto.apellidos : null,
            dto.numero_telefono !== undefined ? dto.numero_telefono : null,
            dto.correo !== undefined ? dto.correo : null,
            id,
        ]);
        // 2. Actualizar pacientes
        await client.query(`UPDATE pacientes
       SET
         ocupacion = COALESCE($1, ocupacion),
         fecha_nacimiento = COALESCE($2, fecha_nacimiento),
         genero = COALESCE($3, genero),
         id_empresa = COALESCE($4, id_empresa)
       WHERE id_cliente = $5`, [
            dto.ocupacion !== undefined ? dto.ocupacion : null,
            dto.fecha_nacimiento !== undefined ? dto.fecha_nacimiento : null,
            dto.genero !== undefined ? dto.genero : null,
            dto.id_empresa !== undefined ? dto.id_empresa : null,
            id,
        ]);
    });
}
/**
 * Elimina un paciente (también elimina la cascada en clientes por FK ON DELETE CASCADE).
 */
async function deletePacienteRepo(id) {
    await (0, database_1.query)("DELETE FROM clientes WHERE id_cliente = $1 AND tipo_cliente = 'Persona'", [id]);
}
//# sourceMappingURL=pacientes.repository.js.map