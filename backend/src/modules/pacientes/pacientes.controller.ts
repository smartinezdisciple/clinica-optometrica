import type { Request, Response, NextFunction } from 'express'
import { PacienteSchema } from './pacientes.types'
import {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente,
} from './pacientes.service'

/**
 * GET /api/pacientes
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const pacientes = await getPacientes(search)
    res.status(200).json({ ok: true, data: pacientes })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/pacientes/:id
 */
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de paciente inválido' })
      return
    }
    const paciente = await getPacienteById(id)
    res.status(200).json({ ok: true, data: paciente })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/pacientes
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = PacienteSchema.parse(req.body)
    const paciente = await createPaciente(dto)
    res.status(201).json({
      ok: true,
      data: paciente,
      mensaje: 'Paciente registrado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/pacientes/:id
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de paciente inválido' })
      return
    }
    // Partial validation for updates
    const dto = PacienteSchema.partial().parse(req.body)
    const paciente = await updatePaciente(id, dto)
    res.status(200).json({
      ok: true,
      data: paciente,
      mensaje: 'Paciente actualizado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/pacientes/:id
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de paciente inválido' })
      return
    }
    await deletePaciente(id)
    res.status(200).json({
      ok: true,
      mensaje: 'Paciente eliminado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}
