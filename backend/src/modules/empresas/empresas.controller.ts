import type { Request, Response, NextFunction } from 'express'
import { EmpresaSchema } from './empresas.types'
import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from './empresas.service'

/**
 * GET /api/empresas
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const empresas = await getEmpresas(search)
    res.status(200).json({ ok: true, data: empresas })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/empresas/:id
 */
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de empresa inválido' })
      return
    }
    const empresa = await getEmpresaById(id)
    res.status(200).json({ ok: true, data: empresa })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/empresas
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = EmpresaSchema.parse(req.body)
    const empresa = await createEmpresa(dto)
    res.status(201).json({
      ok: true,
      data: empresa,
      mensaje: 'Empresa registrada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/empresas/:id
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de empresa inválido' })
      return
    }
    const dto = EmpresaSchema.partial().parse(req.body)
    const empresa = await updateEmpresa(id, dto)
    res.status(200).json({
      ok: true,
      data: empresa,
      mensaje: 'Empresa actualizada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/empresas/:id
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de empresa inválido' })
      return
    }
    await deleteEmpresa(id)
    res.status(200).json({
      ok: true,
      mensaje: 'Empresa eliminada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}
