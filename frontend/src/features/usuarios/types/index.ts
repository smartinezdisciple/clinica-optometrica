export interface UsuarioDetalle {
  id_usuario:       number
  nombre_usuario:   string
  activo:           boolean
  bloqueado:        boolean
  fecha_bloqueo:    string | null
  fecha_creacion:   string
  ultimo_acceso:    string | null
  
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

export interface Rol {
  id_rol:      number
  nombre_rol:  string
  descripcion: string | null
}

export interface UsuarioFormInput {
  nombres:          string
  apellidos:        string
  numero_telefono?:  string
  correo?:           string
  id_sucursal:      number
  
  nombre_usuario:   string
  contrasena?:      string
  id_rol:           number
}

export interface Empleado {
  id_empleado: number
  nombres: string
  apellidos: string
  numero_telefono: string | null
  correo: string | null
  id_sucursal: number | null
  activo: boolean
  nombre_sucursal?: string
}

