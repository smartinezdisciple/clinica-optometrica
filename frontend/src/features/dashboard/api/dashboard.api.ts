import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/api'
import type { DashboardKpis, VentaMensual, CitaProxima, StockBajo, ActividadReciente, EficienciaClinica } from '../types'

export async function obtenerKpis() {
  const res = await api.get<ApiResponse<DashboardKpis>>('/dashboard/kpis')
  return res.data
}

export async function obtenerVentasMensuales() {
  const res = await api.get<ApiResponse<VentaMensual[]>>('/dashboard/ventas-mensuales')
  return res.data
}

export async function obtenerProximasCitas() {
  const res = await api.get<ApiResponse<CitaProxima[]>>('/dashboard/proximas-citas')
  return res.data
}

export async function obtenerStockBajo() {
  const res = await api.get<ApiResponse<StockBajo[]>>('/dashboard/stock-bajo')
  return res.data
}

export async function obtenerActividadReciente() {
  const res = await api.get<ApiResponse<ActividadReciente[]>>('/dashboard/actividad-reciente')
  return res.data
}

export async function obtenerEficienciaClinica() {
  const res = await api.get<ApiResponse<EficienciaClinica>>('/dashboard/eficiencia-clinica')
  return res.data
}
