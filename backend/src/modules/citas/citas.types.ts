import { z } from 'zod'

export interface HorarioDisponibleDb {
  id_horario: number
  id_empleado: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

export interface CitaDb {
  id_cita: number
  motivo_cita: string
  fecha_hora_cita: Date | string
  estado_cita: 'confirmada' | 'cancelada' | 'reprogramada' | 'en_espera_confirmacion' | 'completada'
  observaciones: string | null
  fecha_proxima_revision: Date | string | null
  id_cliente: number
  id_empleado: number | null
}

export interface CitaDetalleDb extends CitaDb {
  paciente_nombre: string
  paciente_apellido: string
  paciente_cedula: string | null
  optometrista_nombre: string | null
  optometrista_apellido: string | null
}

export const CitaSchema = z.object({
  motivo_cita: z.string().min(1, 'El motivo de la cita es obligatorio').max(50),
  fecha_hora_cita: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La fecha y hora de la cita deben ser válidas'
  }),
  estado_cita: z.enum(['confirmada', 'cancelada', 'reprogramada', 'en_espera_confirmacion', 'completada']).default('confirmada'),
  observaciones: z.string().optional().transform(v => v === '' ? undefined : v),
  id_cliente: z.number({ required_error: 'El ID del paciente es obligatorio' }),
  id_empleado: z.number().optional().nullable(),
})

export const HorarioSchema = z.object({
  id_empleado: z.number({ required_error: 'El ID del empleado es obligatorio' }),
  dia_semana: z.number().min(1).max(7),
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Formato de hora de inicio inválido (HH:MM)'
  }),
  hora_fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Formato de hora de fin inválido (HH:MM)'
  }),
  activo: z.boolean().default(true),
})

export type CrearCitaDto = z.input<typeof CitaSchema>
export type ActualizarCitaDto = Partial<z.input<typeof CitaSchema>>

export type CrearHorarioDto = z.input<typeof HorarioSchema>
export type ActualizarHorarioDto = Partial<z.input<typeof HorarioSchema>>
