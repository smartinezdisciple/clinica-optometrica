import type { Request, Response, NextFunction } from 'express'
import { ListarLogsQuerySchema } from './auditoria.types'
import { getLog, listLogs, getModulosDisponibles } from './auditoria.service'

/**
 * GET /api/auditoria
 * Lista los logs de auditoría con filtros y paginación.
 */
export async function listarLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = ListarLogsQuerySchema.parse(req.query)
    const resultado = await listLogs(filtros)
    res.status(200).json({ ok: true, data: resultado })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auditoria/:id
 */
export async function getLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de log inválido' })
      return
    }
    const log = await getLog(id)
    res.status(200).json({ ok: true, data: log })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auditoria/modulos
 * Lista los módulos con logs registrados (para poblar filtros del frontend).
 */
export async function listarModulos(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modulos = await getModulosDisponibles()
    res.status(200).json({ ok: true, data: modulos })
  } catch (err) {
    next(err)
  }
}
