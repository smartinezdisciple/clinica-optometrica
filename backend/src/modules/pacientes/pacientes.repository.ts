import { query, withTransaction } from '../../config/database'
import type { PacienteDb, CrearPacienteDto, ActualizarPacienteDto } from './pacientes.types'

/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
export async function findPacientes(search?: string): Promise<PacienteDb[]> {
  if (search) {
    const searchVal = `%${search}%`
    const result = await query<PacienteDb>(
      `SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
                c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
                p.ocupacion, p.fecha_nacimiento, p.genero, p.id_empresa
        FROM clientes c
        JOIN pacientes p ON p.id_cliente = c.id_cliente
        WHERE c.tipo_cliente = 'Persona'
          AND (c.nombres ILIKE $1
               OR c.apellidos ILIKE $1
               OR c.cedula ILIKE $1
               OR c.numero_telefono ILIKE $1)
        ORDER BY c.apellidos, c.nombres`,
      [searchVal]
    )
    return result.rows
  }

  const result = await query<PacienteDb>(
    `SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
             c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
             p.ocupacion, p.fecha_nacimiento, p.genero, p.id_empresa
     FROM clientes c
     JOIN pacientes p ON p.id_cliente = c.id_cliente
     WHERE c.tipo_cliente = 'Persona'
     ORDER BY c.apellidos, c.nombres`
  )
  return result.rows
}

/**
 * Busca un paciente por su ID.
 */
export async function findPacienteById(id: number): Promise<PacienteDb | null> {
  const result = await query<PacienteDb>(
    `SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
             c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
             p.ocupacion, p.fecha_nacimiento, p.genero, p.id_empresa
     FROM clientes c
     JOIN pacientes p ON p.id_cliente = c.id_cliente
     WHERE c.id_cliente = $1 AND c.tipo_cliente = 'Persona'
     LIMIT 1`,
    [id]
  )
  return result.rows[0] ?? null
}

/**
 * Busca un cliente (cualquiera) por su cédula.
 */
export async function findClienteByCedula(cedula: string): Promise<{ id_cliente: number } | null> {
  const result = await query<{ id_cliente: number }>(
    'SELECT id_cliente FROM clientes WHERE cedula = $1 LIMIT 1',
    [cedula]
  )
  return result.rows[0] ?? null
}

/**
 * Registra un cliente de tipo Persona y su extensión de Paciente en una sola transacción.
 */
export async function insertPacienteTransaccion(dto: CrearPacienteDto): Promise<number> {
  return withTransaction(async (client) => {
    // 1. Insertar en clientes
    const clienteResult = await client.query<{ id_cliente: number }>(
      `INSERT INTO clientes (cedula, nombres, apellidos, tipo_cliente, numero_telefono, correo)
        VALUES ($1, $2, $3, 'Persona', $4, $5)
        RETURNING id_cliente`,
      [
        dto.cedula || null,
        dto.nombres,
        dto.apellidos,
        dto.numero_telefono,
        dto.correo || null,
      ]
    )
    const idCliente = clienteResult.rows[0].id_cliente

    // 2. Insertar en pacientes
    await client.query(
      `INSERT INTO pacientes (id_cliente, ocupacion, fecha_nacimiento, genero, id_empresa)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        idCliente,
        dto.ocupacion || null,
        dto.fecha_nacimiento,
        dto.genero || null,
        dto.id_empresa ?? null,
      ]
    )

    return idCliente
  })
}

/**
 * Actualiza un cliente de tipo Persona y su extensión de Paciente en una sola transacción.
 */
export async function updatePacienteTransaccion(id: number, dto: ActualizarPacienteDto): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Actualizar clientes
    await client.query(
      `UPDATE clientes
        SET
          cedula = COALESCE($1, cedula),
          nombres = COALESCE($2, nombres),
          apellidos = COALESCE($3, apellidos),
          numero_telefono = COALESCE($4, numero_telefono),
          correo = COALESCE($5, correo)
        WHERE id_cliente = $6 AND tipo_cliente = 'Persona'`,
      [
        dto.cedula !== undefined ? dto.cedula : null,
        dto.nombres !== undefined ? dto.nombres : null,
        dto.apellidos !== undefined ? dto.apellidos : null,
        dto.numero_telefono !== undefined ? dto.numero_telefono : null,
        dto.correo !== undefined ? dto.correo : null,
        id,
      ]
    )

    // 2. Actualizar pacientes
    await client.query(
      `UPDATE pacientes
       SET
         ocupacion = COALESCE($1, ocupacion),
         fecha_nacimiento = COALESCE($2, fecha_nacimiento),
         genero = COALESCE($3, genero),
         id_empresa = COALESCE($4, id_empresa)
       WHERE id_cliente = $5`,
      [
        dto.ocupacion !== undefined ? dto.ocupacion : null,
        dto.fecha_nacimiento !== undefined ? dto.fecha_nacimiento : null,
        dto.genero !== undefined ? dto.genero : null,
        dto.id_empresa !== undefined ? dto.id_empresa : null,
        id,
      ]
    )
  })
}

/**
 * Elimina un paciente (también elimina la cascada en clientes por FK ON DELETE CASCADE).
 */
export async function deletePacienteRepo(id: number): Promise<void> {
  await query("DELETE FROM clientes WHERE id_cliente = $1 AND tipo_cliente = 'Persona'", [id])
}
