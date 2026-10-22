import { z } from 'zod'

/**
 * Tipos de evento soportados por el módulo de auditoría.
 * Se registran eventos de negocio relevantes, no peticiones técnicas.
 */
export const TipoEvento = {
  CREATE:       'CREATE',
  UPDATE:       'UPDATE',
  DELETE:       'DELETE',
  LOGIN:        'LOGIN',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT:       'LOGOUT',
  EXPORT:       'EXPORT',
  CONFIG:       'CONFIG',
} as const

export type TipoEvento = (typeof TipoEvento)[keyof typeof TipoEvento]

/**
 * Payload para registrar un evento de auditoría.
 */
export interface RegistrarLogInput {
  accion:         string
  modulo:         string
  tipoEvento:     TipoEvento
  tablaAfectada?: string | null
  idEntidad?:     number | null
  descripcion?:   string | null
  detalle?:       Record<string, unknown> | null
  antes?:         Record<string, unknown> | null
  despues?:       Record<string, unknown> | null
  idUsuario?:     number | null
  idSucursal?:    number | null
  ipOrigen?:      string | null
}

/**
 * Fila tal y como se almacena en la tabla logs_sistema.
 */
export interface LogDb {
  id_log:          number
  id_usuario:      number | null
  id_sucursal:     number | null
  accion:          string
  modulo:          string
  tipo_evento:     string | null
  tabla_afectada:  string | null
  id_entidad:      number | null
  descripcion:     string | null
  detalle:         Record<string, unknown> | null
  antes:           Record<string, unknown> | null
  despues:         Record<string, unknown> | null
  ip_origen:       string | null
  fecha_evento:    Date
  nombre_usuario?: string | null
  nombre_sucursal?: string | null
}

/**
 * Filtros de consulta para el listado de logs.
 */
export const ListarLogsQuerySchema = z.object({
  pagina:         z.coerce.number().int().min(1).default(1),
  limite:         z.coerce.number().int().min(1).max(100).default(20),
  modulo:         z.string().max(50).optional(),
  tipo_evento:    z.string().max(20).optional(),
  accion:         z.string().max(100).optional(),
  id_usuario:     z.coerce.number().int().optional(),
  id_sucursal:    z.coerce.number().int().optional(),
  tabla_afectada: z.string().max(50).optional(),
  fecha_desde:    z.string().optional(),
  fecha_hasta:    z.string().optional(),
  busqueda:       z.string().max(100).optional(),
})

export type ListarLogsQuery = z.infer<typeof ListarLogsQuerySchema>

/**
 * Resultado paginado del listado de logs.
 */
export interface ListarLogsResultado {
  items: LogDb[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}
