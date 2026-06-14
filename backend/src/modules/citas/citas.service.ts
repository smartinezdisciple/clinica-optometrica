import * as repo from './citas.repository'
import type {
  CitaDetalleDb,
  HorarioDisponibleDb,
  CrearCitaDto,
  ActualizarCitaDto,
  CrearHorarioDto,
  ActualizarHorarioDto,
} from './citas.types'

/**
 * Obtiene la lista de citas filtrada.
 */
export async function getCitas(filtros: {
  fecha?: string
  estado?: string
  id_empleado?: number
  id_cliente?: number
}): Promise<CitaDetalleDb[]> {
  return repo.findCitas(filtros)
}

/**
 * Obtiene una cita por su ID.
 */
export async function getCitaById(id: number): Promise<CitaDetalleDb> {
  const cita = await repo.findCitaById(id)
  if (!cita) {
    const err = new Error('La cita no existe')
    ;(err as any).statusCode = 404
    throw err
  }
  return cita
}

/**
 * Registra una nueva cita verificando disponibilidad y colisiones.
 */
export async function createCita(dto: CrearCitaDto): Promise<CitaDetalleDb> {
  // Si se asigna un optometrista, validar disponibilidad
  if (dto.id_empleado) {
    await validarHorarioYColisiones(dto.id_empleado, dto.fecha_hora_cita)
  }

  const id = await repo.insertCita(dto)
  const nuevaCita = await repo.findCitaById(id)
  if (!nuevaCita) {
    const err = new Error('Error al recuperar la cita creada')
    ;(err as any).statusCode = 500
    throw err
  }
  return nuevaCita
}

/**
 * Actualiza los datos de una cita.
 */
export async function updateCita(id: number, dto: ActualizarCitaDto): Promise<CitaDetalleDb> {
  const actual = await repo.findCitaById(id)
  if (!actual) {
    const err = new Error('La cita no existe')
    ;(err as any).statusCode = 404
    throw err
  }

  const fechaHora = dto.fecha_hora_cita || (actual.fecha_hora_cita as string)
  const empleadoId = dto.id_empleado !== undefined ? dto.id_empleado : actual.id_empleado

  // Si cambia de fecha/hora u optometrista, y hay uno asignado, validar disponibilidad
  if (
    empleadoId &&
    (fechaHora !== (actual.fecha_hora_cita as string) || empleadoId !== actual.id_empleado)
  ) {
    await validarHorarioYColisiones(empleadoId, fechaHora, id)
  }

  await repo.updateCita(id, dto)
  const actualizada = await repo.findCitaById(id)
  if (!actualizada) {
    const err = new Error('Error al recuperar la cita actualizada')
    ;(err as any).statusCode = 500
    throw err
  }
  return actualizada
}

/**
 * Cambia el estado de una cita.
 */
export async function changeCitaEstado(id: number, estado: string): Promise<CitaDetalleDb> {
  const actual = await repo.findCitaById(id)
  if (!actual) {
    const err = new Error('La cita no existe')
    ;(err as any).statusCode = 404
    throw err
  }

  await repo.updateCitaEstado(id, estado)
  const actualizada = await repo.findCitaById(id)
  if (!actualizada) {
    const err = new Error('Error al recuperar la cita modificada')
    ;(err as any).statusCode = 500
    throw err
  }
  return actualizada
}

/**
 * Obtiene los horarios configurados.
 */
export async function getHorarios(idEmpleado?: number): Promise<HorarioDisponibleDb[]> {
  return repo.findHorarios(idEmpleado)
}

/**
 * Crea un horario de atención para un optometrista.
 */
export async function createHorario(dto: CrearHorarioDto): Promise<HorarioDisponibleDb> {
  const id = await repo.insertHorario(dto)
  const horarios = await repo.findHorarios(dto.id_empleado)
  const nuevo = horarios.find((h) => h.id_horario === id)
  if (!nuevo) {
    const err = new Error('Error al recuperar el horario creado')
    ;(err as any).statusCode = 500
    throw err
  }
  return nuevo
}

/**
 * Modifica un bloque horario.
 */
export async function updateHorario(id: number, dto: ActualizarHorarioDto): Promise<void> {
  await repo.updateHorario(id, dto)
}

/**
 * Elimina un horario.
 */
export async function deleteHorario(id: number): Promise<void> {
  await repo.deleteHorarioRepo(id)
}

/**
 * Consulta la disponibilidad de horarios de un optometrista para una fecha específica.
 * Genera slots de 30 minutos y los cruza con las citas ya reservadas.
 */
export async function getDisponibilidad(
  idEmpleado: number,
  fecha: string
): Promise<{ hora: string; disponible: boolean }[]> {
  // 1. Determinar el día de la semana (1-Lunes, 7-Domingo)
  const dateObj = new Date(fecha + 'T00:00:00')
  const jsDay = dateObj.getDay()
  const dbDiaSemana = jsDay === 0 ? 7 : jsDay

  // 2. Obtener los bloques de horarios_disponibles de ese día
  const horarios = await repo.findHorarios(idEmpleado)
  const bloquesActivos = horarios.filter((h) => h.activo && h.dia_semana === dbDiaSemana)

  if (bloquesActivos.length === 0) {
    return [] // No trabaja este día
  }

  // 3. Obtener citas agendadas para este día
  const citasDelDia = await repo.findCitas({ fecha, id_empleado: idEmpleado })
  const horasOcupadas = citasDelDia
    .filter((c) => ['confirmada', 'reprogramada', 'en_espera_confirmacion'].includes(c.estado_cita))
    .map((c) => {
      // Extrae la hora en formato HH:MM desde la fecha_hora_cita (Date u objeto)
      const date = new Date(c.fecha_hora_cita)
      const h = String(date.getHours()).padStart(2, '0')
      const m = String(date.getMinutes()).padStart(2, '0')
      return `${h}:${m}`
    })

  // 4. Generar slots de 30 minutos dentro de cada bloque de trabajo
  const slots: { hora: string; disponible: boolean }[] = []

  for (const bloque of bloquesActivos) {
    const [hInicio, mInicio] = bloque.hora_inicio.split(':').map(Number)
    const [hFin, mFin] = bloque.hora_fin.split(':').map(Number)

    let actualMinutos = hInicio * 60 + mInicio
    const limiteMinutos = hFin * 60 + mFin

    while (actualMinutos < limiteMinutos) {
      const h = String(Math.floor(actualMinutos / 60)).padStart(2, '0')
      const m = String(actualMinutos % 60).padStart(2, '0')
      const horaStr = `${h}:${m}`

      const ocupado = horasOcupadas.includes(horaStr)
      slots.push({
        hora: horaStr,
        disponible: !ocupado,
      })

      actualMinutos += 30 // incrementos de 30 min
    }
  }

  return slots
}

// ─── Utilidades internas de validación ────────────────────────────────────────

async function validarHorarioYColisiones(
  idEmpleado: number,
  fechaHoraCita: string,
  excluirIdCita?: number
): Promise<void> {
  const dateObj = new Date(fechaHoraCita)
  if (isNaN(dateObj.getTime())) {
    const err = new Error('Fecha y hora de cita inválida')
    ;(err as any).statusCode = 400
    throw err
  }

  // Validar que no sea una fecha pasada
  if (dateObj.getTime() < Date.now()) {
    const err = new Error('No se pueden programar citas en el pasado')
    ;(err as any).statusCode = 400
    throw err
  }

  // 1. Validar que la hora esté en el bloque de atención (horarios_disponibles)
  const jsDay = dateObj.getDay()
  const dbDiaSemana = jsDay === 0 ? 7 : jsDay
  const horaStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(
    dateObj.getMinutes()
  ).padStart(2, '0')}:00`

  const horariosValidos = await repo.findHorariosPorDiaYHora(idEmpleado, dbDiaSemana, horaStr)
  if (horariosValidos.length === 0) {
    const err = new Error('El optometrista no atiende en el horario seleccionado')
    ;(err as any).statusCode = 400
    throw err
  }

  // 2. Validar que no colisione con otra cita
  // Convertimos a string ISO de Postgres
  const pgTimestamp = dateObj.toISOString().replace('T', ' ').substring(0, 19)
  const colisiones = await repo.findCitasConflicto(idEmpleado, pgTimestamp, excluirIdCita)
  if (colisiones.length > 0) {
    const err = new Error('El optometrista ya tiene otra cita agendada a esa hora')
    ;(err as any).statusCode = 400
    throw err
  }
}
