import type { Request, Response, NextFunction } from 'express'
import {
  obtenerDashboardKpis,
  obtenerVentasMensuales,
  obtenerProximasCitas,
  obtenerStockBajo,
  obtenerActividadReciente,
  obtenerEficienciaClinica,
} from './dashboard.service'

export async function kpis(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await obtenerDashboardKpis()
    res.status(200).json({ ok: true, data })
  } catch (err) {
    next(err)
  }
}

export async function ventasMensuales(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await obtenerVentasMensuales()
    res.status(200).json({ ok: true, data })
  } catch (err) {
    next(err)
  }
}

export async function proximasCitas(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await obtenerProximasCitas()
    res.status(200).json({ ok: true, data })
  } catch (err) {
    next(err)
  }
}

export async function stockBajo(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await obtenerStockBajo()
    res.status(200).json({ ok: true, data })
  } catch (err) {
    next(err)
  }
}

export async function actividadReciente(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await obtenerActividadReciente()
    res.status(200).json({ ok: true, data })
  } catch (err) {
    next(err)
  }
}

export async function eficienciaClinica(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await obtenerEficienciaClinica()
    res.status(200).json({ ok: true, data })
  } catch (err) {
    next(err)
  }
}
