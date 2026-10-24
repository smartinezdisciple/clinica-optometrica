import { useQuery } from '@tanstack/react-query'
import { obtenerKpis, obtenerVentasMensuales, obtenerProximasCitas, obtenerStockBajo, obtenerActividadReciente, obtenerEficienciaClinica } from '../api/dashboard.api'

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: obtenerKpis,
    refetchInterval: 60000,
  })
}

export function useDashboardVentasMensuales() {
  return useQuery({
    queryKey: ['dashboard', 'ventas-mensuales'],
    queryFn: obtenerVentasMensuales,
    refetchInterval: 120000,
  })
}

export function useDashboardProximasCitas() {
  return useQuery({
    queryKey: ['dashboard', 'proximas-citas'],
    queryFn: obtenerProximasCitas,
    refetchInterval: 60000,
  })
}

export function useDashboardStockBajo() {
  return useQuery({
    queryKey: ['dashboard', 'stock-bajo'],
    queryFn: obtenerStockBajo,
    refetchInterval: 120000,
  })
}

export function useDashboardActividadReciente() {
  return useQuery({
    queryKey: ['dashboard', 'actividad-reciente'],
    queryFn: obtenerActividadReciente,
    refetchInterval: 60000,
  })
}

export function useDashboardEficienciaClinica() {
  return useQuery({
    queryKey: ['dashboard', 'eficiencia-clinica'],
    queryFn: obtenerEficienciaClinica,
    refetchInterval: 120000,
  })
}
