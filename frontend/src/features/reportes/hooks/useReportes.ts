import { useQuery } from '@tanstack/react-query'
import {
  getReporteCitas,
  getReporteCompras,
  getReporteInventario,
  getReporteVentas,
} from '../api/reportes.api'
import type { FiltrosReporte } from '../types'

const STALE_TIME = 60_000

export function useReporteVentas(filtros: FiltrosReporte, enabled: boolean) {
  return useQuery({
    queryKey: ['reportes', 'ventas', filtros],
    queryFn: () => getReporteVentas(filtros),
    enabled,
    staleTime: STALE_TIME,
  })
}

export function useReporteCompras(filtros: FiltrosReporte, enabled: boolean) {
  return useQuery({
    queryKey: ['reportes', 'compras', filtros],
    queryFn: () => getReporteCompras(filtros),
    enabled,
    staleTime: STALE_TIME,
  })
}

export function useReporteCitas(filtros: FiltrosReporte, enabled: boolean) {
  return useQuery({
    queryKey: ['reportes', 'citas', filtros],
    queryFn: () => getReporteCitas(filtros),
    enabled,
    staleTime: STALE_TIME,
  })
}

export function useReporteInventario(filtros: FiltrosReporte, enabled: boolean) {
  return useQuery({
    queryKey: ['reportes', 'inventario', filtros],
    queryFn: () => getReporteInventario(filtros),
    enabled,
    staleTime: STALE_TIME,
  })
}
