import { query, withTransaction } from '../../config/database'
import type { EmpresaDb, CrearEmpresaDto, ActualizarEmpresaDto } from './empresas.types'

/**
 * Obtiene todas las empresas registradas o filtra por búsqueda.
 */
export async function findEmpresas(search?: string): Promise<EmpresaDb[]> {
  if (search) {
    const searchVal = `%${search}%`
    const result = await query<EmpresaDb>(
      `SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
               c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
               e.razon_social, e.ruc
        FROM clientes c
        JOIN empresas e ON e.id_cliente = c.id_cliente
        WHERE c.tipo_cliente = 'Empresa'
          AND (e.razon_social ILIKE $1
               OR e.ruc ILIKE $1
               OR c.nombres ILIKE $1
               OR c.apellidos ILIKE $1)
        ORDER BY e.razon_social`,
      [searchVal]
    )
    return result.rows
  }

  const result = await query<EmpresaDb>(
    `SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
             c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
             e.razon_social, e.ruc
     FROM clientes c
     JOIN empresas e ON e.id_cliente = c.id_cliente
     WHERE c.tipo_cliente = 'Empresa'
     ORDER BY e.razon_social`
  )
  return result.rows
}

/**
 * Obtiene una empresa por su ID de cliente.
 */
export async function findEmpresaById(id: number): Promise<EmpresaDb | null> {
  const result = await query<EmpresaDb>(
    `SELECT c.id_cliente, c.cedula, c.nombres, c.apellidos,
             c.tipo_cliente, c.numero_telefono, c.correo, c.fecha_registro,
             e.razon_social, e.ruc
     FROM clientes c
     JOIN empresas e ON e.id_cliente = c.id_cliente
     WHERE c.id_cliente = $1 AND c.tipo_cliente = 'Empresa'
     LIMIT 1`,
    [id]
  )
  return result.rows[0] ?? null
}

/**
 * Busca una empresa por RUC.
 */
export async function findEmpresaByRuc(ruc: string): Promise<{ id_cliente: number } | null> {
  const result = await query<{ id_cliente: number }>(
    'SELECT id_cliente FROM empresas WHERE ruc = $1 LIMIT 1',
    [ruc]
  )
  return result.rows[0] ?? null
}

/**
 * Registra un cliente de tipo Empresa y su extensión de Empresa en una transacción.
 */
export async function insertEmpresaTransaccion(dto: CrearEmpresaDto): Promise<number> {
  return withTransaction(async (client) => {
    // 1. Insertar en clientes
    const clienteResult = await client.query<{ id_cliente: number }>(
      `INSERT INTO clientes (cedula, nombres, apellidos, tipo_cliente, numero_telefono, correo)
        VALUES ($1, $2, $3, 'Empresa', $4, $5)
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

    // 2. Insertar en empresas
    await client.query(
      `INSERT INTO empresas (id_cliente, razon_social, ruc)
       VALUES ($1, $2, $3)`,
      [
        idCliente,
        dto.razon_social,
        dto.ruc,
      ]
    )

    return idCliente
  })
}

/**
 * Actualiza los datos de contacto y la información de la empresa en una transacción.
 */
export async function updateEmpresaTransaccion(id: number, dto: ActualizarEmpresaDto): Promise<void> {
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
        WHERE id_cliente = $6 AND tipo_cliente = 'Empresa'`,
      [
        dto.cedula !== undefined ? dto.cedula : null,
        dto.nombres !== undefined ? dto.nombres : null,
        dto.apellidos !== undefined ? dto.apellidos : null,
        dto.numero_telefono !== undefined ? dto.numero_telefono : null,
        dto.correo !== undefined ? dto.correo : null,
        id,
      ]
    )

    // 2. Actualizar empresas
    await client.query(
      `UPDATE empresas
       SET
         razon_social = COALESCE($1, razon_social),
         ruc = COALESCE($2, ruc)
       WHERE id_cliente = $3`,
      [
        dto.razon_social !== undefined ? dto.razon_social : null,
        dto.ruc !== undefined ? dto.ruc : null,
        id,
      ]
    )
  })
}

/**
 * Elimina una empresa (remoción en cascada).
 */
export async function deleteEmpresaRepo(id: number): Promise<void> {
  await query("DELETE FROM clientes WHERE id_cliente = $1 AND tipo_cliente = 'Empresa'", [id])
}
