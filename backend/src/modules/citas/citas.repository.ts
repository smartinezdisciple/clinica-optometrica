import { query } from '../../config/database'
import type {
  CitaDb,
  CitaDetalleDb,
  HorarioDisponibleDb,
  CrearCitaDto,
  ActualizarCitaDto,
  CrearHorarioDto,
  ActualizarHorarioDto,
} from './citas.types'

/**
 * Obtiene el listado de citas aplicando filtros opcionales.
 */
export async function findCitas(filtros: {
  fecha?: string
  estado?: string
  id_empleado?: number
  id_cliente?: number
}): Promise<CitaDetalleDb[]> {
  let sql = `
    SELECT
      ci.id_cita, ci.motivo_cita, ci.fecha_hora_cita, ci.estado_cita, ci.observaciones, ci.fecha_proxima_revision,
      ci.id_cliente, ci.id_empleado,
      cl.primer_nombre AS paciente_nombre, cl.primer_apellido AS paciente_apellido, cl.cedula AS paciente_cedula,
      em.primer_nombre AS optometrista_nombre, em.primer_apellido AS optometrista_apellido
    FROM citas ci
    JOIN clientes cl ON cl.id_cliente = ci.id_cliente
    LEFT JOIN empleados em ON em.id_empleado = ci.id_empleado
    WHERE 1=1
  `
  const params: unknown[] = []
  let paramIdx = 1

  if (filtros.fecha) {
    sql += ` AND ci.fecha_hora_cita::date = $${paramIdx++}`
    params.push(filtros.fecha)
  }

  if (filtros.estado) {
    sql += ` AND ci.estado_cita = $${paramIdx++}`
    params.push(filtros.estado)
  }

  if (filtros.id_empleado) {
    sql += ` AND ci.id_empleado = $${paramIdx++}`
    params.push(filtros.id_empleado)
  }

  if (filtros.id_cliente) {
    sql += ` AND ci.id_cliente = $${paramIdx++}`
    params.push(filtros.id_cliente)
  }

  sql += ' ORDER BY ci.fecha_hora_cita DESC'

  const result = await query<CitaDetalleDb>(sql, params)
  return result.rows
}

/**
 * Obtiene los detalles de una cita por su ID.
 */
export async function findCitaById(id: number): Promise<CitaDetalleDb | null> {
  const result = await query<CitaDetalleDb>(
    `SELECT
       ci.id_cita, ci.motivo_cita, ci.fecha_hora_cita, ci.estado_cita, ci.observaciones, ci.fecha_proxima_revision,
       ci.id_cliente, ci.id_empleado,
       cl.primer_nombre AS paciente_nombre, cl.primer_apellido AS paciente_apellido, cl.cedula AS paciente_cedula,
       em.primer_nombre AS optometrista_nombre, em.primer_apellido AS optometrista_apellido
     FROM citas ci
     JOIN clientes cl ON cl.id_cliente = ci.id_cliente
     LEFT JOIN empleados em ON em.id_empleado = ci.id_empleado
     WHERE ci.id_cita = $1
     LIMIT 1`,
    [id]
  )
  return result.rows[0] ?? null
}

/**
 * Registra una nueva cita.
 */
export async function insertCita(dto: CrearCitaDto): Promise<number> {
  const result = await query<{ id_cita: number }>(
    `INSERT INTO citas (motivo_cita, fecha_hora_cita, estado_cita, observaciones, id_cliente, id_empleado)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_cita`,
    [
      dto.motivo_cita,
      dto.fecha_hora_cita,
      dto.estado_cita || 'confirmada',
      dto.observaciones || null,
      dto.id_cliente,
      dto.id_empleado || null,
    ]
  )
  return result.rows[0].id_cita
}

/**
 * Actualiza los datos de una cita.
 */
export async function updateCita(id: number, dto: ActualizarCitaDto): Promise<void> {
  await query(
    `UPDATE citas
     SET
       motivo_cita = COALESCE($1, motivo_cita),
       fecha_hora_cita = COALESCE($2, fecha_hora_cita),
       estado_cita = COALESCE($3, estado_cita),
       observaciones = COALESCE($4, observaciones),
       id_empleado = COALESCE($5, id_empleado)
     WHERE id_cita = $6`,
    [
      dto.motivo_cita ?? null,
      dto.fecha_hora_cita ?? null,
      dto.estado_cita ?? null,
      dto.observaciones !== undefined ? dto.observaciones : null,
      dto.id_empleado !== undefined ? dto.id_empleado : null,
      id,
    ]
  )
}

/**
 * Actualiza el estado de una cita.
 */
export async function updateCitaEstado(id: number, estado: string): Promise<void> {
  await query('UPDATE citas SET estado_cita = $1 WHERE id_cita = $2', [estado, id])
}

/**
 * Busca si un optometrista tiene alguna cita que colisione a la misma fecha y hora.
 * (Solo evalúa estados activos: confirmada, reprogramada, en_espera_confirmacion).
 */
export async function findCitasConflicto(
  idEmpleado: number,
  fechaHora: string,
  excluirIdCita?: number
): Promise<CitaDb[]> {
  let sql = `
    SELECT id_cita, fecha_hora_cita, id_empleado, estado_cita
    FROM citas
    WHERE id_empleado = $1
      AND fecha_hora_cita = $2
      AND estado_cita IN ('confirmada', 'reprogramada', 'en_espera_confirmacion')
  `
  const params = [idEmpleado, fechaHora]
  if (excluirIdCita) {
    sql += ' AND id_cita <> $3'
    params.push(excluirIdCita)
  }

  const result = await query<CitaDb>(sql, params)
  return result.rows
}

// ─── Horarios Disponibles ────────────────────────────────────────────────────

/**
 * Obtiene los horarios configurados para los optometristas.
 */
export async function findHorarios(idEmpleado?: number): Promise<HorarioDisponibleDb[]> {
  if (idEmpleado) {
    const result = await query<HorarioDisponibleDb>(
      'SELECT id_horario, id_empleado, dia_semana, hora_inicio, hora_fin, activo FROM horarios_disponibles WHERE id_empleado = $1 ORDER BY dia_semana, hora_inicio',
      [idEmpleado]
    )
    return result.rows
  }
  const result = await query<HorarioDisponibleDb>(
    'SELECT id_horario, id_empleado, dia_semana, hora_inicio, hora_fin, activo FROM horarios_disponibles ORDER BY id_empleado, dia_semana'
  )
  return result.rows
}

/**
 * Busca si existe un horario específico configurado para un empleado en un día de la semana.
 */
export async function findHorariosPorDiaYHora(
  idEmpleado: number,
  diaSemana: number,
  hora: string
): Promise<HorarioDisponibleDb[]> {
  const result = await query<HorarioDisponibleDb>(
    `SELECT id_horario, id_empleado, dia_semana, hora_inicio, hora_fin, activo
     FROM horarios_disponibles
     WHERE id_empleado = $1
       AND dia_semana = $2
       AND $3::time >= hora_inicio
       AND $3::time < hora_fin
       AND activo = TRUE`,
    [idEmpleado, diaSemana, hora]
  )
  return result.rows
}

/**
 * Agrega un nuevo horario disponible para un optometrista.
 */
export async function insertHorario(dto: CrearHorarioDto): Promise<number> {
  const result = await query<{ id_horario: number }>(
    `INSERT INTO horarios_disponibles (id_empleado, dia_semana, hora_inicio, hora_fin, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_horario`,
    [dto.id_empleado, dto.dia_semana, dto.hora_inicio, dto.hora_fin, dto.activo]
  )
  return result.rows[0].id_horario
}

/**
 * Modifica un horario disponible.
 */
export async function updateHorario(id: number, dto: ActualizarHorarioDto): Promise<void> {
  await query(
    `UPDATE horarios_disponibles
     SET
       dia_semana = COALESCE($1, dia_semana),
       hora_inicio = COALESCE($2, hora_inicio),
       hora_fin = COALESCE($3, hora_fin),
       activo = COALESCE($4, activo)
     WHERE id_horario = $5`,
    [dto.dia_semana ?? null, dto.hora_inicio ?? null, dto.hora_fin ?? null, dto.activo ?? null, id]
  )
}

/**
 * Elimina un horario disponible.
 */
export async function deleteHorarioRepo(id: number): Promise<void> {
  await query('DELETE FROM horarios_disponibles WHERE id_horario = $1', [id])
}
