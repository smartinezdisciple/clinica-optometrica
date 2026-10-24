import type { Request, Response, NextFunction } from 'express'
import {
  ExportQuerySchema,
  FiltrosInventarioSchema,
  FiltrosReporteSchema,
} from './reportes.types'
import {
  getReporte,
  getReporteCitas,
  getReporteCompras,
  getReporteInventario,
  getReporteVentas,
  normalizarFiltros,
} from './reportes.service'
import { construirDocumento, generarCsv, generarPdf } from './reportes.export'

/** GET /api/reportes/ventas */
export async function getVentasHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = FiltrosReporteSchema.parse(req.query)
    const reporte = await getReporteVentas(filtros)
    res.status(200).json({ ok: true, data: reporte })
  } catch (err) {
    next(err)
  }
}

/** GET /api/reportes/compras */
export async function getComprasHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = FiltrosReporteSchema.parse(req.query)
    const reporte = await getReporteCompras(filtros)
    res.status(200).json({ ok: true, data: reporte })
  } catch (err) {
    next(err)
  }
}

/** GET /api/reportes/citas */
export async function getCitasHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = FiltrosReporteSchema.parse(req.query)
    const reporte = await getReporteCitas(filtros)
    res.status(200).json({ ok: true, data: reporte })
  } catch (err) {
    next(err)
  }
}

/** GET /api/reportes/inventario */
export async function getInventarioHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = FiltrosInventarioSchema.parse(req.query)
    const reporte = await getReporteInventario(filtros)
    res.status(200).json({ ok: true, data: reporte })
  } catch (err) {
    next(err)
  }
}

/** GET /api/reportes/export?tipo=&formato=&desde=&hasta=&id_sucursal= */
export async function exportarHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tipo, formato, ...filtrosInput } = ExportQuerySchema.parse(req.query)
    const filtros = normalizarFiltros(filtrosInput)
    const data = await getReporte(tipo, filtrosInput)
    const documento = construirDocumento(tipo, data, filtros)

    const nombre = `reporte-${tipo}-${filtros.desde}_${filtros.hasta}`

    if (formato === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${nombre}.csv"`)
      res.status(200).send(generarCsv(documento))
      return
    }

    const pdf = await generarPdf(documento)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}.pdf"`)
    res.status(200).send(pdf)
  } catch (err) {
    next(err)
  }
}
