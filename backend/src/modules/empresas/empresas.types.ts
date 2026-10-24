import { z } from 'zod'

export interface EmpresaDb {
  id_cliente: number
  cedula: string | null
  nombres: string
  apellidos: string
  tipo_cliente: 'Persona' | 'Empresa'
  numero_telefono: string
  correo: string | null
  fecha_registro: Date
  razon_social: string
  ruc: string
}

export const EmpresaSchema = z.object({
  cedula: z.string().max(16).optional().transform(v => v === '' ? undefined : v),
  nombres: z.string().min(1, 'El nombre de contacto es obligatorio').max(60),
  apellidos: z.string().min(1, 'El apellido de contacto es obligatorio').max(60),
  numero_telefono: z.string().min(1, 'El número de teléfono es obligatorio').max(15),
  correo: z.string().email('Formato de correo inválido').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  razon_social: z.string().min(1, 'La razón social es obligatoria').max(100),
  ruc: z.string().min(1, 'El RUC es obligatorio').max(30),
})

export type CrearEmpresaDto = z.infer<typeof EmpresaSchema>
export type ActualizarEmpresaDto = Partial<CrearEmpresaDto>
