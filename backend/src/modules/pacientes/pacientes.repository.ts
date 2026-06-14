import { query, withTransaction } from '../../config/database'
import type { PacienteDb, CrearPacienteDto, ActualizarPacienteDto } from './pacientes.types'

/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
export async function findPacientes(search?: string): Promise<PacienteDb[]> {
  if (search) {
    const searchVal = `%${search}%`
    const result = await query<PacienteDb>(
      `SELECT c.id_cliente, c.cedula, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
              c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
              p.ocupacion, p.fecha_nacimiento, p.genero
       FROM clientes c
       JOIN pacientes p ON p.id_cliente = c.id_cliente
       WHERE c.tipo_cliente = 'Persona'
         AND (c.primer_nombre ILIKE $1
              OR c.primer_apellido ILIKE $1
              OR c.cedula ILIKE $1
              OR c.numero_telefono ILIKE $1)
       ORDER BY c.primer_nombre, c.primer_apellido`,
      [searchVal]
    )
    return result.rows
  }

  const result = await query<PacienteDb>(
    `SELECT c.id_cliente, c.cedula, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
            c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
            p.ocupacion, p.fecha_nacimiento, p.genero
     FROM clientes c
     JOIN pacientes p ON p.id_cliente = c.id_cliente
     WHERE c.tipo_cliente = 'Persona'
     ORDER BY c.primer_nombre, c.primer_apellido`
  )
  return result.rows
}

/**
 * Busca un paciente por su ID.
 */
export async function findPacienteById(id: number): Promise<PacienteDb | null> {
  const result = await query<PacienteDb>(
    `SELECT c.id_cliente, c.cedula, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
            c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
            p.ocupacion, p.fecha_nacimiento, p.genero
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
      `INSERT INTO clientes (cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_cliente, numero_telefono, correo)
       VALUES ($1, $2, $3, $4, $5, 'Persona', $6, $7)
       RETURNING id_cliente`,
      [
        dto.cedula || null,
        dto.primer_nombre,
        dto.segundo_nombre || null,
        dto.primer_apellido,
        dto.segundo_apellido || null,
        dto.numero_telefono,
        dto.correo || null,
      ]
    )
    const idCliente = clienteResult.rows[0].id_cliente

    // 2. Insertar en pacientes
    await client.query(
      `INSERT INTO pacientes (id_cliente, ocupacion, fecha_nacimiento, genero)
       VALUES ($1, $2, $3, $4)`,
      [
        idCliente,
        dto.ocupacion || null,
        dto.fecha_nacimiento,
        dto.genero || null,
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
         primer_nombre = COALESCE($2, primer_nombre),
         segundo_nombre = COALESCE($3, segundo_nombre),
         primer_apellido = COALESCE($4, primer_apellido),
         segundo_apellido = COALESCE($5, segundo_apellido),
         numero_telefono = COALESCE($6, numero_telefono),
         correo = COALESCE($7, correo)
       WHERE id_cliente = $8 AND tipo_cliente = 'Persona'`,
      [
        dto.cedula !== undefined ? dto.cedula : null,
        dto.primer_nombre !== undefined ? dto.primer_nombre : null,
        dto.segundo_nombre !== undefined ? dto.segundo_nombre : null,
        dto.primer_apellido !== undefined ? dto.primer_apellido : null,
        dto.segundo_apellido !== undefined ? dto.segundo_apellido : null,
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
         genero = COALESCE($3, genero)
       WHERE id_cliente = $4`,
      [
        dto.ocupacion !== undefined ? dto.ocupacion : null,
        dto.fecha_nacimiento !== undefined ? dto.fecha_nacimiento : null,
        dto.genero !== undefined ? dto.genero : null,
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
