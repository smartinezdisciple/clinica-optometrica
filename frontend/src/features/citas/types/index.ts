export interface HorarioDisponible {
  id_horario: number
  id_empleado: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

export interface Cita {
  id_cita: number
  motivo_cita: string
  fecha_hora_cita: string
  estado_cita: 'confirmada' | 'cancelada' | 'reprogramada' | 'en_espera_confirmacion' | 'completada'
  observaciones: string | null
  fecha_proxima_revision: string | null
  id_cliente: number
  id_empleado: number | null
  paciente_nombre: string
  paciente_apellido: string
  paciente_cedula: string | null
  optometrista_nombre: string | null
  optometrista_apellido: string | null
}

export interface CitaFormInput {
  motivo_cita: string
  fecha_hora_cita: string
  estado_cita?: 'confirmada' | 'cancelada' | 'reprogramada' | 'en_espera_confirmacion' | 'completada'
  observaciones?: string
  id_cliente: number
  id_empleado?: number | null
}
