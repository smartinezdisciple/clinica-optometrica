import { api, descargar, type ApiResponse } from '@/lib/api'
import { construirQuery } from '../lib/fechas'
import type {
  FiltrosReporte,
  FormatoReporte,
  ReporteCitas,
  ReporteCompras,
  ReporteInventario,
  ReporteVentas,
  TipoReporte,
} from '../types'

export function getReporteVentas(filtros: FiltrosReporte) {
  return api.get<ApiResponse<ReporteVentas>>(`/reportes/ventas?${construirQuery(filtros)}`)
}

export function getReporteCompras(filtros: FiltrosReporte) {
  return api.get<ApiResponse<ReporteCompras>>(`/reportes/compras?${construirQuery(filtros)}`)
}

export function getReporteCitas(filtros: FiltrosReporte) {
  return api.get<ApiResponse<ReporteCitas>>(`/reportes/citas?${construirQuery(filtros)}`)
}

export function getReporteInventario(filtros: FiltrosReporte) {
  return api.get<ApiResponse<ReporteInventario>>(`/reportes/inventario?${construirQuery(filtros)}`)
}

/**
 * Descarga la exportación (CSV/PDF) y dispara la descarga en el navegador.
 * El nombre del archivo lo define el servidor vía Content-Disposition.
 */
export async function descargarReporte(
  tipo: TipoReporte,
  formato: FormatoReporte,
  filtros: FiltrosReporte
): Promise<void> {
  const query = construirQuery(filtros, { tipo, formato })
  const { blob, filename } = await descargar(`/reportes/export?${query}`)

  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = filename ?? `reporte-${tipo}.${formato}`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
