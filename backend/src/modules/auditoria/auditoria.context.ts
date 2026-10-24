import type { Request } from 'express'
import { registrar } from './auditoria.service'
import type { RegistrarLogInput } from './auditoria.types'

/**
 * Extrae la IP de origen del request, contemplando proxies.
 */
function extraerIpOrigen(req: Request): string | null {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  return req.ip ?? req.socket?.remoteAddress ?? null
}

/**
 * Registra un evento de auditoría tomando el contexto (usuario, sucursal e IP)
 * automáticamente del request autenticado.
 *
 * Uso típico desde un servicio de negocio:
 *   await registrarDesdeRequest(req, {
 *     accion: 'Crear usuario',
 *     modulo: 'usuarios',
 *     tipoEvento: TipoEvento.CREATE,
 *     tablaAfectada: 'usuarios',
 *     idEntidad: idCreada,
 *     despues: { ...datosRelevantes },
 *   })
 */
export async function registrarDesdeRequest(
  req: Request,
  input: Omit<RegistrarLogInput, 'idUsuario' | 'idSucursal' | 'ipOrigen'>
): Promise<void> {
  const usuario = (req as Request & { usuario?: { id: number; sucursalId: number } }).usuario
  await registrar({
    ...input,
    idUsuario: usuario?.id ?? null,
    idSucursal: usuario?.sucursalId ?? null,
    ipOrigen: extraerIpOrigen(req),
  })
}
