import { z } from 'zod'

export const LoginSchema = z.object({
  email:      z.string().email('Email inválido'),
  contrasena: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export const RecuperarSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const RestablecerSchema = z.object({
  token:      z.string().min(1),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type LoginDto       = z.infer<typeof LoginSchema>
export type RecuperarDto   = z.infer<typeof RecuperarSchema>
export type RestablecerDto = z.infer<typeof RestablecerSchema>

// ── Tipos de dominio ──────────────────────────────────────────────────────────
export interface UsuarioDb {
  id_usuario:       number
  id_empleado:      number
  email:            string
  contrasena_hash:  string
  activo:           boolean
  bloqueado:        boolean
  id_rol:           number
  nombre_rol:       string
  id_sucursal:      number
  nombre:           string
  apellido:         string
}

export interface SesionUsuario {
  id:          number
  nombre:      string
  apellido:    string
  email:       string
  rol:         string
  permisos:    string[]
  sucursalId:  number
}
