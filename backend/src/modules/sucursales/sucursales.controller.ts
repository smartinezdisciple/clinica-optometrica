import type { Request, Response, NextFunction } from 'express'
import { SucursalSchema } from './sucursales.types'
import {
  getSucursalesList,
  getSucursal,
  registerSucursal,
  modifySucursal,
  changeSucursalStatus,
} from './sucursales.service'
import { z } from 'zod'

const ToggleEstadoSchema = z.object({
  activa: z.boolean({ required_error: 'El campo activa es requerido' }),
})

/**
 * GET /api/sucursales
 */
export async function listSucursales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const soloActivas = req.query.activas === 'true'
    const sucursales = await getSucursalesList(soloActivas)
    res.status(200).json({ ok: true, data: sucursales })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/sucursales/:id
 */
export async function getSucursalById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de sucursal inválido' })
      return
    }
    const sucursal = await getSucursal(id)
    res.status(200).json({ ok: true, data: sucursal })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/sucursales
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = SucursalSchema.parse(req.body)
    const sucursal = await registerSucursal(dto)
    res.status(201).json({
      ok: true,
      data: sucursal,
      mensaje: 'Sucursal creada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/sucursales/:id
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de sucursal inválido' })
      return
    }
    const dto = SucursalSchema.parse(req.body)
    const sucursal = await modifySucursal(id, dto)
    res.status(200).json({
      ok: true,
      data: sucursal,
      mensaje: 'Sucursal actualizada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/sucursales/:id/estado
 */
export async function toggleEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de sucursal inválido' })
      return
    }
    const { activa } = ToggleEstadoSchema.parse(req.body)
    const sucursal = await changeSucursalStatus(id, activa)
    res.status(200).json({
      ok: true,
      data: sucursal,
      mensaje: activa ? 'Sucursal activada exitosamente' : 'Sucursal desactivada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}
