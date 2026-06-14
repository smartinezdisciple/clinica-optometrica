import type { Request, Response, NextFunction } from 'express'
import { CitaSchema, HorarioSchema } from './citas.types'
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  changeCitaEstado,
  getHorarios,
  createHorario,
  updateHorario,
  deleteHorario,
  getDisponibilidad,
} from './citas.service'
import { z } from 'zod'

const PatchEstadoSchema = z.object({
  estado_cita: z.enum(['confirmada', 'cancelada', 'reprogramada', 'en_espera_confirmacion', 'completada']),
})

/**
 * GET /api/citas
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = {
      fecha: typeof req.query.fecha === 'string' ? req.query.fecha : undefined,
      estado: typeof req.query.estado === 'string' ? req.query.estado : undefined,
      id_empleado: req.query.id_empleado ? parseInt(req.query.id_empleado as string, 10) : undefined,
      id_cliente: req.query.id_cliente ? parseInt(req.query.id_cliente as string, 10) : undefined,
    }
    const citas = await getCitas(filtros)
    res.status(200).json({ ok: true, data: citas })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/citas/:id
 */
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de cita inválido' })
      return
    }
    const cita = await getCitaById(id)
    res.status(200).json({ ok: true, data: cita })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/citas
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CitaSchema.parse(req.body)
    const cita = await createCita(dto)
    res.status(201).json({
      ok: true,
      data: cita,
      mensaje: 'Cita reservada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/citas/:id
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de cita inválido' })
      return
    }
    const dto = CitaSchema.partial().parse(req.body)
    const cita = await updateCita(id, dto)
    res.status(200).json({
      ok: true,
      data: cita,
      mensaje: 'Cita actualizada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/citas/:id/estado
 */
export async function patchEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de cita inválido' })
      return
    }
    const { estado_cita } = PatchEstadoSchema.parse(req.body)
    const cita = await changeCitaEstado(id, estado_cita)
    res.status(200).json({
      ok: true,
      data: cita,
      mensaje: `Cita marcada como ${estado_cita} exitosamente`,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/citas/disponibilidad
 */
export async function listDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idEmpleado = parseInt(req.query.id_empleado as string, 10)
    const fecha = req.query.fecha as string // YYYY-MM-DD

    if (isNaN(idEmpleado) || !fecha) {
      res.status(400).json({ ok: false, error: 'id_empleado y fecha son obligatorios' })
      return
    }

    const slots = await getDisponibilidad(idEmpleado, fecha)
    res.status(200).json({ ok: true, data: slots })
  } catch (err) {
    next(err)
  }
}

// ─── Horarios ────────────────────────────────────────────────────────────────

/**
 * GET /api/horarios
 */
export async function listHorarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idEmpleado = req.query.id_empleado ? parseInt(req.query.id_empleado as string, 10) : undefined
    const horarios = await getHorarios(idEmpleado)
    res.status(200).json({ ok: true, data: horarios })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/horarios
 */
export async function addHorario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = HorarioSchema.parse(req.body)
    const horario = await createHorario(dto)
    res.status(201).json({
      ok: true,
      data: horario,
      mensaje: 'Horario configurado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/horarios/:id
 */
export async function modifyHorario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de horario inválido' })
      return
    }
    const dto = HorarioSchema.partial().parse(req.body)
    await updateHorario(id, dto)
    res.status(200).json({
      ok: true,
      mensaje: 'Horario actualizado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/horarios/:id
 */
export async function removeHorario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de horario inválido' })
      return
    }
    await deleteHorario(id)
    res.status(200).json({
      ok: true,
      mensaje: 'Horario eliminado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}
