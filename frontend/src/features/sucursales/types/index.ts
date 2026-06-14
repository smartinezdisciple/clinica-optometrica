export interface Sucursal {
  id_sucursal: number
  nombre:      string
  direccion:   string | null
  telefono:    string | null
  correo:      string | null
  activa:      boolean
}

export interface SucursalFormInput {
  nombre:    string
  direccion: string
  telefono:  string
  correo:    string
}
