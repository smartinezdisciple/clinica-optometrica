import { z } from 'zod'

export const SucursalSchema = z.object({
  nombre:    z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede superar los 50 caracteres'),
  direccion: z.string().max(150, 'La dirección no puede superar los 150 caracteres').optional().nullable(),
  telefono:  z.string().max(15, 'El teléfono no puede superar los 15 caracteres').optional().nullable(),
  correo:    z.string().email('El formato del correo es inválido').max(100).optional().nullable().or(z.literal('')),
})

export type SucursalDto = z.infer<typeof SucursalSchema>

export interface SucursalDb {
  id_sucursal: number
  nombre:      string
  direccion:   string | null
  telefono:    string | null
  correo:      string | null
  activa:      boolean
}
