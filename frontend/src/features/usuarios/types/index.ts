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
  primer_nombre:    string
  segundo_nombre:   string | null
  primer_apellido:  string
  segundo_apellido: string | null
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
  primer_nombre:    string
  segundo_nombre?:   string
  primer_apellido:  string
  segundo_apellido?: string
  numero_telefono?:  string
  correo?:           string
  id_sucursal:      number
  
  nombre_usuario:   string
  contrasena?:      string
  id_rol:           number
}
