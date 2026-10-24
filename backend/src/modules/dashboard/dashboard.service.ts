import {
  getDashboardKpis,
  getVentasMensuales,
  getProximasCitas,
  getStockBajo,
  getActividadReciente,
  getEficienciaClinica,
} from './dashboard.repository'
import type { DashboardKpis, VentaMensual, CitaProxima, StockBajo, ActividadReciente, EficienciaClinica } from './dashboard.types'

const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toNumber(val: string | number): number {
  if (typeof val === 'number') return val
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}

export async function obtenerDashboardKpis(): Promise<DashboardKpis> {
  const row = await getDashboardKpis()
  return {
    ventas_hoy_monto: toNumber(row.ventas_hoy_monto),
    ventas_hoy_cantidad: Number(row.ventas_hoy_cantidad || 0),
    citas_hoy_total: Number(row.citas_hoy_total || 0),
    citas_hoy_completadas: Number(row.citas_hoy_completadas || 0),
    pacientes_nuevos_mes: Number(row.pacientes_nuevos_mes || 0),
    stock_bajo_count: Number(row.stock_bajo_count || 0),
  }
}

export async function obtenerVentasMensuales(): Promise<VentaMensual[]> {
  const rows = await getVentasMensuales()
  return rows.map((r) => {
    const mesNum = MESES_ES.findIndex(m => m.toLowerCase() === String(r.mes).toLowerCase()) + 1
    const label = mesNum >= 1 ? MESES_ES[mesNum - 1].substring(0,3) : String(r.mes)
    return {
      mes: String(r.mes),
      anio: Number(r.anio),
      label,
      total_monto: toNumber(r.total_monto),
      total_ventas: Number(r.total_ventas || 0),
    }
  })
}

export async function obtenerProximasCitas(): Promise<CitaProxima[]> {
  const rows = await getProximasCitas()
  return rows.map((r) => ({
    id_cita: Number(r.id_cita),
    fecha_hora_cita: r.fecha_hora_cita,
    motivo_cita: r.motivo_cita,
    estado_cita: r.estado_cita,
    paciente: `${r.paciente_nombre || ''} ${r.paciente_apellido || ''}`.trim(),
    paciente_cedula: r.paciente_cedula,
    optometrista: r.empleado_nombre || r.empleado_apellido
      ? `${r.empleado_nombre || ''} ${r.empleado_apellido || ''}`.trim()
      : null,
  }))
}

export async function obtenerStockBajo(): Promise<StockBajo[]> {
  const rows = await getStockBajo()
  return rows.map((r) => {
    const cantidad = Number(r.cantidad || 0)
    const stockMinimo = Number(r.stock_minimo || 0)
    const alerta: 'critica' | 'baja' = stockMinimo > 0 && cantidad <= Math.ceil(stockMinimo * 0.4) ? 'critica' : 'baja'
    return {
      id_producto: Number(r.id_producto),
      nombre_producto: r.nombre_producto,
      tipo_producto: r.tipo_producto,
      cantidad,
      stock_minimo: stockMinimo,
      sucursal_nombre: r.sucursal_nombre,
      alerta,
    }
  })
}

export async function obtenerActividadReciente(): Promise<ActividadReciente[]> {
  const rows = await getActividadReciente()
  return rows.map((r) => {
    const usuario = r.usuario_nombre || r.usuario_apellido
      ? `${r.usuario_nombre || ''} ${r.usuario_apellido || ''}`.trim()
      : r.usuario_nombre || null
    return {
      id_log: Number(r.id_log),
      accion: r.accion,
      modulo: r.modulo,
      tipo_evento: r.tipo_evento,
      descripcion: r.descripcion,
      fecha_evento: r.fecha_evento,
      usuario,
    }
  })
}

export async function obtenerEficienciaClinica(): Promise<EficienciaClinica> {
  const row = await getEficienciaClinica()
  const programadas = Number(row.citas_programadas_mes || 0)
  const completadas = Number(row.citas_completadas_mes || 0)
  const porcentaje = programadas > 0 ? Math.round((completadas / programadas) * 1000) / 10 : 0
  return {
    citas_completadas_mes: completadas,
    citas_programadas_mes: programadas,
    recetas_emitidas_mes: Number(row.recetas_emitidas_mes || 0),
    consultas_mes: Number(row.consultas_mes || 0),
    porcentaje_completadas: porcentaje,
  }
}
