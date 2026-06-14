import jwt from 'jsonwebtoken'
import { env } from './env'

export interface AccessTokenPayload {
  sub: number          // id_usuario
  rol: string
  sucursalId: number
}

export interface RefreshTokenPayload {
  sub: number
  jti: string          // JWT ID para invalidación
}

/**
 * Genera un access token JWT (duración: 15min).
 */
export function generarAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload as object, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as any,
    algorithm: 'HS256',
  })
}

/**
 * Genera un refresh token JWT (duración: 7d).
 */
export function generarRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload as object, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as any,
    algorithm: 'HS256',
  })
}

/**
 * Verifica y decodifica un access token.
 * @throws jwt.JsonWebTokenError si el token es inválido o expiró
 */
export function verificarAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload
}

/**
 * Verifica y decodifica un refresh token.
 * @throws jwt.JsonWebTokenError si el token es inválido o expiró
 */
export function verificarRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as RefreshTokenPayload
}
