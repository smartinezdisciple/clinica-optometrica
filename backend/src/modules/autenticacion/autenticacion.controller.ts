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
import { registrar } from '../auditoria/auditoria.service'
import { TipoEvento } from '../auditoria/auditoria.types'
import { AppError } from '../../middleware/manejo-errores'

// `secure` se controla por env para permitir HTTP en desarrollo local.
// En producción con HTTPS debe ser COOKIE_SECURE=true.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    process.env.COOKIE_SECURE === 'true',
  sameSite:  'strict' as const,
  maxAge:    7 * 24 * 60 * 60 * 1000,   // 7 días en ms
  path:      '/api/auth/refresh',
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip        = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0'
  const userAgent = req.headers['user-agent'] ?? 'Desconocido'

  try {
    const dto = LoginSchema.parse(req.body)

    const { usuario, accessToken, refreshToken } = await loginService(dto, ip, userAgent)

    // Auditoría: login exitoso
    await registrar({
      accion:      'Inicio de sesión',
      modulo:      'autenticacion',
      tipoEvento:  TipoEvento.LOGIN,
      descripcion: `El usuario ${usuario.email} inició sesión correctamente`,
      detalle:     { userAgent },
      idUsuario:   usuario.id,
      idSucursal:  usuario.sucursalId,
      ipOrigen:    ip,
    })

    // Refresh token en cookie HttpOnly
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS)

    res.status(200).json({
      ok: true,
      data: { usuario, accessToken },
      mensaje: `Bienvenido, ${usuario.nombre}`,
    })
  } catch (err) {
    // Auditoría: login fallido (no revelamos credenciales en el log)
    if (err instanceof AppError) {
      await registrar({
        accion:      'Inicio de sesión fallido',
        modulo:      'autenticacion',
        tipoEvento:  TipoEvento.LOGIN_FAILED,
        descripcion: err.message,
        detalle:     { userAgent, email: (req.body as { email?: string })?.email ?? null },
        ipOrigen:    ip,
      })
    }
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

      // Auditoría: cierre de sesión
      await registrar({
        accion:      'Cierre de sesión',
        modulo:      'autenticacion',
        tipoEvento:  TipoEvento.LOGOUT,
        idUsuario:   req.usuario.id,
        idSucursal:  req.usuario.sucursalId,
        ipOrigen:    (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0',
      })
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
