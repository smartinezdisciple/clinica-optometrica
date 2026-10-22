import * as repo from './reportes.repository'
import { AppError } from '../../middleware/manejo-errores'
import type {
  FiltrosInventarioInput,
  FiltrosReporte,
  FiltrosReporteInput,
  ReporteCitas,
  ReporteCompras,
  ReporteInventario,
  ReporteVentas,
  TipoReporte,
} from './reportes.types'

// ─── Normalización de filtros ──────────────────────────────────────────────────
function hoyISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function primerDiaMesISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function esFechaValida(fecha: string): boolean {
  const d = new Date(`${fecha}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha
}

/**
 * Resuelve fechas por defecto (mes actual) y valida el rango.
 * `id_sucursal = null` significa "todas las sucursales".
 */
export function normalizarFiltros(input: FiltrosReporteInput): FiltrosReporte {
  const hasta = input.hasta ?? hoyISO()
  const desde = input.desde ?? primerDiaMesISO()

  if (!esFechaValida(desde)) throw new AppError(400, `Fecha "desde" inválida: ${desde}`)
  if (!esFechaValida(hasta)) throw new AppError(400, `Fecha "hasta" inválida: ${hasta}`)
  if (desde > hasta) throw new AppError(400, 'La fecha "desde" no puede ser posterior a "hasta"')

  return { desde, hasta, id_sucursal: input.id_sucursal ?? null }
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

// ─── Reportes ──────────────────────────────────────────────────────────────────
export async function getReporteVentas(input: FiltrosReporteInput): Promise<ReporteVentas> {
  const f = normalizarFiltros(input)

  const [resumen, serie, porMetodoPago, porSucursal, topProductos, porEstado] = await Promise.all([
    repo.findResumenVentas(f),
    repo.findSerieVentas(f),
    repo.findVentasPorMetodoPago(f),
    repo.findVentasPorSucursal(f),
    repo.findTopProductos(f),
    repo.findVentasPorEstado(f),
  ])

  const ticketPromedio = resumen.numeroVentas > 0
    ? redondear(resumen.totalVendido / resumen.numeroVentas)
    : 0

  return {
    resumen: { ...resumen, ticketPromedio },
    serie,
    porMetodoPago,
    porSucursal,
    topProductos,
    porEstado,
  }
}

export async function getReporteCompras(input: FiltrosReporteInput): Promise<ReporteCompras> {
  const f = normalizarFiltros(input)

  const [resumen, serie, porProveedor, porEstado] = await Promise.all([
    repo.findResumenCompras(f),
    repo.findSerieCompras(f),
    repo.findComprasPorProveedor(f),
    repo.findComprasPorEstado(f),
  ])

  const ticketPromedio = resumen.numeroCompras > 0
    ? redondear(resumen.totalComprado / resumen.numeroCompras)
    : 0

  return {
    resumen: { ...resumen, ticketPromedio },
    serie,
    porProveedor,
    porEstado,
  }
}

export async function getReporteCitas(input: FiltrosReporteInput): Promise<ReporteCitas> {
  const f = normalizarFiltros(input)

  const [resumen, porEstado, serie] = await Promise.all([
    repo.findResumenCitas(f),
    repo.findCitasPorEstado(f),
    repo.findSerieCitas(f),
  ])

  const tasaCompletadas = resumen.total > 0
    ? redondear((resumen.completadas / resumen.total) * 100)
    : 0

  return {
    resumen: { ...resumen, tasaCompletadas },
    porEstado,
    serie,
  }
}

export async function getReporteInventario(input: FiltrosInventarioInput): Promise<ReporteInventario> {
  const f = normalizarFiltros(input)

  const [resumen, stockBajo, porSucursal] = await Promise.all([
    repo.findResumenInventario(f),
    repo.findStockBajo(f),
    repo.findInventarioPorSucursal(f),
  ])

  return { resumen, stockBajo, porSucursal }
}

/** Despacha al reporte solicitado (usado por la exportación). */
export async function getReporte(
  tipo: TipoReporte,
  input: FiltrosReporteInput
): Promise<ReporteVentas | ReporteCompras | ReporteCitas | ReporteInventario> {
  switch (tipo) {
    case 'ventas':     return getReporteVentas(input)
    case 'compras':    return getReporteCompras(input)
    case 'citas':      return getReporteCitas(input)
    case 'inventario': return getReporteInventario(input)
  }
}
