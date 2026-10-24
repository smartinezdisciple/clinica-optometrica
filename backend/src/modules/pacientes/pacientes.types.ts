import { z } from 'zod'

export interface ClienteDb {
  id_cliente: number
  cedula: string | null
  nombres: string
  apellidos: string
  tipo_cliente: 'Persona' | 'Empresa'
  numero_telefono: string
  correo: string | null
  fecha_registro: Date
}

export interface PacienteDb extends ClienteDb {
  ocupacion: string | null
  fecha_nacimiento: Date | string
  genero: 'Masculino' | 'Femenino' | 'Otro' | null
  id_empresa: number | null
}

export const PacienteSchema = z.object({
  cedula: z.string().max(16).optional().transform(v => v === '' ? undefined : v),
  nombres: z.string().min(1, 'El nombre es obligatorio').max(60),
  apellidos: z.string().min(1, 'El apellido es obligatorio').max(60),
  numero_telefono: z.string().min(1, 'El número de teléfono es obligatorio').max(15),
  correo: z.string().email('Formato de correo inválido').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  ocupacion: z.string().max(30).optional().transform(v => v === '' ? undefined : v),
  fecha_nacimiento: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La fecha de nacimiento debe ser una fecha válida'
  }),
  genero: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
  id_empresa: z.number().int().positive().optional().nullable(),
})

export type CrearPacienteDto = z.infer<typeof PacienteSchema>
export type ActualizarPacienteDto = Partial<CrearPacienteDto>
