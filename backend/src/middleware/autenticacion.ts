import type { Request, Response, NextFunction } from 'express'
import { verificarAccessToken } from '../config/jwt'
import { AppError } from './manejo-errores'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: {
        id: number
        rol: string
        sucursalId: number
      }
    }
  }
}

/**
 * Middleware que verifica el JWT de acceso en el header Authorization.
 * Popula `req.usuario` con el payload del token.
 */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Se requiere autenticación')
  }

  const token = authHeader.slice(7)
  try {
    const payload = verificarAccessToken(token)
    req.usuario = {
      id:         payload.sub,
      rol:        payload.rol,
      sucursalId: payload.sucursalId,
    }
    next()
  } catch {
    throw new AppError(401, 'Token inválido o expirado')
  }
}

/**
 * Middleware que verifica que el usuario tiene uno de los roles permitidos.
 */
export function autorizar(...rolesPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw new AppError(401, 'No autenticado')
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new AppError(403, `Acceso denegado. Roles requeridos: ${rolesPermitidos.join(', ')}`)
    }
    next()
  }
}
