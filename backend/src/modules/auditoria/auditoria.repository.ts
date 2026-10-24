import { query } from '../../config/database'
import type { ListarLogsQuery, ListarLogsResultado, LogDb, RegistrarLogInput } from './auditoria.types'

/**
 * Inserta un nuevo registro en la tabla logs_sistema.
 */
export async function insertLog(input: RegistrarLogInput): Promise<number> {
  const result = await query<{ id_log: number }>(
    `INSERT INTO logs_sistema
       (id_usuario, id_sucursal, accion, modulo, tipo_evento,
        tabla_afectada, id_entidad, descripcion, detalle, antes, despues, ip_origen)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id_log`,
    [
      input.idUsuario ?? null,
      input.idSucursal ?? null,
      input.accion,
      input.modulo,
      input.tipoEvento,
      input.tablaAfectada ?? null,
      input.idEntidad ?? null,
      input.descripcion ?? null,
      input.detalle ? JSON.stringify(input.detalle) : null,
      input.antes ? JSON.stringify(input.antes) : null,
      input.despues ? JSON.stringify(input.despues) : null,
      input.ipOrigen ?? null,
    ]
  )
  return result.rows[0].id_log
}

/**
 * Obtiene un log por su ID incluyendo el nombre del usuario y sucursal asociados.
 */
export async function findLogById(id: number): Promise<LogDb | null> {
  const result = await query<LogDb>(
    `SELECT
       l.id_log, l.id_usuario, l.id_sucursal, l.accion, l.modulo,
       l.tipo_evento, l.tabla_afectada, l.id_entidad, l.descripcion,
       l.detalle, l.antes, l.despues, l.ip_origen, l.fecha_evento,
       u.nombre_usuario, s.nombre AS nombre_sucursal
     FROM logs_sistema l
     LEFT JOIN usuarios u ON u.id_usuario = l.id_usuario
     LEFT JOIN sucursales s ON s.id_sucursal = l.id_sucursal
     WHERE l.id_log = $1
     LIMIT 1`,
    [id]
  )
  return result.rows[0] ?? null
}

/**
 * Lista los logs de auditoría aplicando filtros y paginación.
 */
export async function findLogs(filtros: ListarLogsQuery): Promise<ListarLogsResultado> {
  const condiciones: string[] = []
  const params: unknown[] = []

  const agregar = (sql: string, valor: unknown) => {
    params.push(valor)
    condiciones.push(`${sql} = $${params.length}`)
  }

  if (filtros.modulo) agregar('l.modulo', filtros.modulo)
  if (filtros.tipo_evento) agregar('l.tipo_evento', filtros.tipo_evento)
  if (filtros.accion) agregar('l.accion', filtros.accion)
  if (filtros.id_usuario) agregar('l.id_usuario', filtros.id_usuario)
  if (filtros.id_sucursal) agregar('l.id_sucursal', filtros.id_sucursal)
  if (filtros.tabla_afectada) agregar('l.tabla_afectada', filtros.tabla_afectada)
  if (filtros.fecha_desde) {
    params.push(filtros.fecha_desde)
    condiciones.push(`l.fecha_evento >= $${params.length}`)
  }
  if (filtros.fecha_hasta) {
    params.push(filtros.fecha_hasta)
    condiciones.push(`l.fecha_evento <= $${params.length}`)
  }
  if (filtros.busqueda) {
    params.push(`%${filtros.busqueda}%`)
    condiciones.push(
      `(l.descripcion ILIKE $${params.length} OR l.accion ILIKE $${params.length} OR u.nombre_usuario ILIKE $${params.length})`
    )
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : ''

  // Total de registros
  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM logs_sistema l
     LEFT JOIN usuarios u ON u.id_usuario = l.id_usuario
     LEFT JOIN sucursales s ON s.id_sucursal = l.id_sucursal
     ${where}`
  )
  const total = parseInt(countResult.rows[0].total, 10)

  const limite = filtros.limite
  const pagina = filtros.pagina
  const offset = (pagina - 1) * limite
  params.push(limite, offset)

  const itemsResult = await query<LogDb>(
    `SELECT
       l.id_log, l.id_usuario, l.id_sucursal, l.accion, l.modulo,
       l.tipo_evento, l.tabla_afectada, l.id_entidad, l.descripcion,
       l.detalle, l.antes, l.despues, l.ip_origen, l.fecha_evento,
       u.nombre_usuario, s.nombre AS nombre_sucursal
     FROM logs_sistema l
     LEFT JOIN usuarios u ON u.id_usuario = l.id_usuario
     LEFT JOIN sucursales s ON s.id_sucursal = l.id_sucursal
     ${where}
     ORDER BY l.fecha_evento DESC, l.id_log DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return {
    items: itemsResult.rows,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  }
}

/**
 * Devuelve los módulos con al menos un log registrado, para poblar filtros.
 */
export async function findModulosRegistrados(): Promise<string[]> {
  const result = await query<{ modulo: string }>(
    'SELECT DISTINCT modulo FROM logs_sistema WHERE modulo IS NOT NULL ORDER BY modulo'
  )
  return result.rows.map((r) => r.modulo)
}
