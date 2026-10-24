export interface DashboardKpis {
  ventas_hoy_monto: number
  ventas_hoy_cantidad: number
  citas_hoy_total: number
  citas_hoy_completadas: number
  pacientes_nuevos_mes: number
  stock_bajo_count: number
}

export interface VentaMensual {
  mes: string
  anio: number
  label: string
  total_monto: number
  total_ventas: number
}

export interface CitaProxima {
  id_cita: number
  fecha_hora_cita: string
  motivo_cita: string
  estado_cita: string
  paciente: string
  paciente_cedula: string | null
  optometrista: string | null
}

export interface StockBajo {
  id_producto: number
  nombre_producto: string
  tipo_producto: string
  cantidad: number
  stock_minimo: number
  sucursal_nombre: string
  alerta: 'critica' | 'baja'
}

export interface ActividadReciente {
  id_log: number
  accion: string
  modulo: string | null
  tipo_evento: string | null
  descripcion: string | null
  fecha_evento: string
  usuario: string | null
}

export interface EficienciaClinica {
  citas_completadas_mes: number
  citas_programadas_mes: number
  recetas_emitidas_mes: number
  consultas_mes: number
  porcentaje_completadas: number
}
