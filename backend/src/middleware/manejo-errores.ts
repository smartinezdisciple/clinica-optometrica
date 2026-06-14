import type { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly detalles?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function manejoErrores(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Error de aplicación controlado
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      error: err.message,
      ...(err.detalles && { detalles: err.detalles }),
    })
    return
  }

  // Error de validación Zod
  if (err instanceof ZodError) {
    const detalles: Record<string, string[]> = {}
    for (const issue of err.issues) {
      const field = issue.path.join('.')
      ;(detalles[field] = detalles[field] || []).push(issue.message)
    }
    res.status(400).json({ ok: false, error: 'Datos de entrada inválidos', detalles })
    return
  }

  // JWT expirado
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ ok: false, error: 'Token expirado' })
    return
  }

  // JWT inválido
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ ok: false, error: 'Token inválido' })
    return
  }

  // Error desconocido
  console.error('[ERROR]', err)
  res.status(500).json({ ok: false, error: 'Error interno del servidor' })
}
