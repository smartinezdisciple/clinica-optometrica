
export interface DashboardKpisDb {
  ventas_hoy_monto: string | number
  ventas_hoy_cantidad: number
  citas_hoy_total: number
  citas_hoy_completadas: number
  pacientes_nuevos_mes: number
  stock_bajo_count: number
}

export interface DashboardKpis {
  ventas_hoy_monto: number
  ventas_hoy_cantidad: number
  citas_hoy_total: number
  citas_hoy_completadas: number
  pacientes_nuevos_mes: number
  stock_bajo_count: number
}

export interface VentaMensualDb {
  mes: string
  anio: number
  total_monto: string | number
  total_ventas: number
}

export interface VentaMensual {
  mes: string
  anio: number
  label: string
  total_monto: number
  total_ventas: number
}

export interface CitaProximaDb {
  id_cita: number
  fecha_hora_cita: string
  motivo_cita: string
  estado_cita: string
  paciente_nombre: string
  paciente_apellido: string
  paciente_cedula: string | null
  empleado_nombre: string | null
  empleado_apellido: string | null
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

export interface StockBajoDb {
  id_producto: number
  nombre_producto: string
  tipo_producto: string
  cantidad: number
  stock_minimo: number
  sucursal_nombre: string
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

export interface ActividadRecienteDb {
  id_log: number
  accion: string
  modulo: string | null
  tipo_evento: string | null
  descripcion: string | null
  fecha_evento: string
  usuario_nombre: string | null
  usuario_apellido: string | null
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

export interface EficienciaClinicaDb {
  citas_completadas_mes: number
  citas_programadas_mes: number
  recetas_emitidas_mes: number
  consultas_mes: number
}

export interface EficienciaClinica {
  citas_completadas_mes: number
  citas_programadas_mes: number
  recetas_emitidas_mes: number
  consultas_mes: number
  porcentaje_completadas: number
}
