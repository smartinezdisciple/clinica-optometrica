import { z } from 'zod'

export const CrearUsuarioSchema = z.object({
  nombres:          z.string().min(1, 'El nombre es requerido').max(60),
  apellidos:        z.string().min(1, 'El apellido es requerido').max(60),
  numero_telefono:  z.string().max(15).optional().nullable(),
  correo:           z.string().email('Formato de correo inválido').max(100).optional().nullable().or(z.literal('')),
  id_sucursal:      z.number({ message: 'La sucursal es requerida' }),
  
  nombre_usuario:   z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(50),
  contrasena:       z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(50),
  id_rol:           z.number({ message: 'El rol es requerido' }),
})

export const ActualizarUsuarioSchema = z.object({
  nombres:          z.string().min(1, 'El nombre es requerido').max(60).optional(),
  apellidos:        z.string().min(1, 'El apellido es requerido').max(60).optional(),
  numero_telefono:  z.string().max(15).optional().nullable(),
  correo:           z.string().email('Formato de correo inválido').max(100).optional().nullable().or(z.literal('')),
  id_sucursal:      z.number().optional(),
  
  nombre_usuario:   z.string().min(3).max(50).optional(),
  contrasena:       z.string().min(6).max(50).optional().or(z.literal('')),
  id_rol:           z.number().optional(),
  activo:           z.boolean().optional(),
})

export type CrearUsuarioDto      = z.infer<typeof CrearUsuarioSchema>
export type ActualizarUsuarioDto = z.infer<typeof ActualizarUsuarioSchema>

export interface RolDb {
  id_rol:      number
  nombre_rol:  string
  descripcion: string | null
}

export interface PermisoDb {
  id_permiso:     number
  nombre_permiso: string
  modulo:         string
  descripcion:    string | null
}

export interface EmpleadoDb {
  id_empleado:      number
  nombres:          string
  apellidos:        string
  numero_telefono:  string | null
  correo:           string | null
  id_sucursal:      number | null
  nombre_sucursal?: string
  activo:           boolean
}

export interface UsuarioDetalleDb {
  id_usuario:       number
  nombre_usuario:   string
  activo:           boolean
  bloqueado:        boolean
  fecha_bloqueo:    Date | null
  fecha_creacion:   Date
  ultimo_acceso:    Date | null
  
  id_rol:           number
  nombre_rol:       string
  
  id_empleado:      number
  nombres:          string
  apellidos:        string
  numero_telefono:  string | null
  correo:           string | null
  id_sucursal:      number | null
  nombre_sucursal?: string
}
