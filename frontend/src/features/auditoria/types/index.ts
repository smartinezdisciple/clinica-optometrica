export type TipoEvento =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'EXPORT'
  | 'CONFIG'

export interface LogAuditoria {
  id_log:          number
  id_usuario:      number | null
  id_sucursal:     number | null
  accion:          string
  modulo:          string
  tipo_evento:     TipoEvento | null
  tabla_afectada:  string | null
  id_entidad:      number | null
  descripcion:     string | null
  detalle:         Record<string, unknown> | null
  antes:           Record<string, unknown> | null
  despues:         Record<string, unknown> | null
  ip_origen:       string | null
  fecha_evento:    string
  nombre_usuario?: string | null
  nombre_sucursal?: string | null
}

export interface ListarLogsResponse {
  items: LogAuditoria[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface FiltrosAuditoria {
  pagina:       number
  limite:       number
  modulo:       string
  tipo_evento:  string
  tabla_afectada: string
  busqueda:     string
  fecha_desde:  string
  fecha_hasta:  string
}

export const TIPOS_EVENTO: { value: TipoEvento; label: string }[] = [
  { value: 'CREATE', label: 'Creación' },
  { value: 'UPDATE', label: 'Actualización' },
  { value: 'DELETE', label: 'Eliminación' },
  { value: 'LOGIN', label: 'Inicio de sesión' },
  { value: 'LOGIN_FAILED', label: 'Intento fallido' },
  { value: 'LOGOUT', label: 'Cierre de sesión' },
  { value: 'EXPORT', label: 'Exportación' },
  { value: 'CONFIG', label: 'Configuración' },
]