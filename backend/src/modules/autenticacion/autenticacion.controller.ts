import type { Request, Response, NextFunction } from 'express'
import { LoginSchema, RecuperarSchema, RestablecerSchema } from './autenticacion.types'
import {
  loginService,
  logoutService,
  refreshService,
  recuperarContrasenaService,
  restablecerContrasenaService,
  REFRESH_COOKIE_NAME
} from './autenticacion.service'

const REFRESH_COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'strict' as const,
  maxAge:    7 * 24 * 60 * 60 * 1000,   // 7 días en ms
  path:      '/api/auth/refresh',
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = LoginSchema.parse(req.body)
    const ip        = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0'
    const userAgent = req.headers['user-agent'] ?? 'Desconocido'

    const { usuario, accessToken, refreshToken } = await loginService(dto, ip, userAgent)

    // Refresh token en cookie HttpOnly
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS)

    res.status(200).json({
      ok: true,
      data: { usuario, accessToken },
      mensaje: `Bienvenido, ${usuario.nombre}`,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.usuario) {
      await logoutService(req.usuario.id)
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth/refresh' })
    res.json({ ok: true, mensaje: 'Sesión cerrada correctamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    const { accessToken } = await refreshService(refreshToken)
    res.json({ ok: true, data: { accessToken } })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auth/verificar
 */
export function verificar(req: Request, res: Response): void {
  res.json({ ok: true, data: req.usuario })
}

/**
 * POST /api/auth/recuperar-contrasena
 */
export async function recuperarContrasena(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = RecuperarSchema.parse(req.body)
    await recuperarContrasenaService(dto)
    res.status(200).json({
      ok: true,
      mensaje: 'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/restablecer-contrasena
 */
export async function restablecerContrasena(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = RestablecerSchema.parse(req.body)
    await restablecerContrasenaService(dto)
    res.status(200).json({
      ok: true,
      mensaje: 'Tu contraseña ha sido restablecida correctamente.',
    })
  } catch (err) {
    next(err)
  }
}
