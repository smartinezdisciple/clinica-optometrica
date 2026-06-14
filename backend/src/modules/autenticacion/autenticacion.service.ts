import bcrypt from 'bcrypt'
import { AppError } from '../../middleware/manejo-errores'
import { generarAccessToken, generarRefreshToken, verificarRefreshToken } from '../../config/jwt'
import {
  findUsuarioByEmail,
  findUsuarioById,
  registrarIntentoLogin,
  crearSesion,
  invalidarSesiones,
  findSesionByRefreshToken,
  findPermisosByRol,
  updatePassword,
  crearTokenRecuperacion,
  findTokenRecuperacion,
  restablecerContrasenaRepo,
} from './autenticacion.repository'
import type { LoginDto, SesionUsuario, RecuperarDto, RestablecerDto } from './autenticacion.types'
import { randomUUID } from 'crypto'
import { enviarCorreo } from '../../config/email'
import { env } from '../../config/env'

const REFRESH_COOKIE_NAME = 'refresh_token'

/**
 * Servicio de Login.
 * Valida credenciales, registra el intento y devuelve tokens + sesión.
 */
export async function loginService(
  dto: LoginDto,
  ip: string,
  userAgent: string,
): Promise<{ usuario: SesionUsuario; accessToken: string; refreshToken: string }> {

  const usuario = await findUsuarioByEmail(dto.email)

  if (!usuario) {
    throw new AppError(401, 'Credenciales incorrectas')
  }

  if (!usuario.activo) {
    throw new AppError(403, 'Cuenta desactivada. Contacta al administrador.')
  }

  if (usuario.bloqueado) {
    throw new AppError(403, 'Cuenta bloqueada por múltiples intentos fallidos. Contacta al administrador.')
  }

  const passwordOk = await bcrypt.compare(dto.contrasena, usuario.contrasena_hash)

  // Registrar intento (el trigger maneja el bloqueo automático)
  await registrarIntentoLogin(usuario.id_usuario, passwordOk, ip)

  if (!passwordOk) {
    throw new AppError(401, 'Credenciales incorrectas')
  }

  // Obtener permisos
  const permisos = await findPermisosByRol(usuario.id_rol)

  // Generar tokens
  const accessToken = generarAccessToken({
    sub:        usuario.id_usuario,
    rol:        usuario.nombre_rol,
    sucursalId: usuario.id_sucursal,
  })

  const jti = randomUUID()
  const refreshToken = generarRefreshToken({ sub: usuario.id_usuario, jti })

  // Guardar sesión
  await crearSesion(usuario.id_usuario, refreshToken, ip, userAgent)

  const sesion: SesionUsuario = {
    id:         usuario.id_usuario,
    nombre:     usuario.nombre,
    apellido:   usuario.apellido,
    email:      usuario.email,
    rol:        usuario.nombre_rol,
    permisos,
    sucursalId: usuario.id_sucursal,
  }

  return { usuario: sesion, accessToken, refreshToken }
}

/**
 * Servicio de Logout.
 * Invalida todas las sesiones del usuario.
 */
export async function logoutService(idUsuario: number): Promise<void> {
  await invalidarSesiones(idUsuario)
}

/**
 * Servicio de Refresh Token.
 * Valida el refresh token en la cookie y emite un nuevo access token.
 */
export async function refreshService(
  refreshTokenFromCookie: string | undefined,
): Promise<{ accessToken: string }> {
  if (!refreshTokenFromCookie) {
    throw new AppError(401, 'Refresh token no encontrado')
  }

  let payload: { sub: number; jti: string }
  try {
    payload = verificarRefreshToken(refreshTokenFromCookie)
  } catch {
    throw new AppError(401, 'Refresh token inválido o expirado')
  }

  const sesion = await findSesionByRefreshToken(refreshTokenFromCookie)
  if (!sesion) {
    throw new AppError(401, 'Sesión no encontrada o expirada')
  }

  // Obtener datos del usuario para incluir en el nuevo token
  const usuario = await findUsuarioById(payload.sub)
  if (!usuario) {
    throw new AppError(401, 'Usuario no encontrado')
  }

  if (!usuario.activo) {
    throw new AppError(403, 'Cuenta desactivada')
  }

  if (usuario.bloqueado) {
    throw new AppError(403, 'Cuenta bloqueada')
  }

  const accessToken = generarAccessToken({
    sub:        usuario.id_usuario,
    rol:        usuario.nombre_rol,
    sucursalId: usuario.id_sucursal,
  })

  return { accessToken }
}

/**
 * Servicio de Recuperación de Contraseña.
 * Genera un token, lo guarda en BD y envía correo.
 */
export async function recuperarContrasenaService(dto: RecuperarDto): Promise<void> {
  const usuario = await findUsuarioByEmail(dto.email)

  // Por seguridad, no revelamos si el correo existe o no
  if (!usuario) {
    return
  }

  const token = randomUUID()
  await crearTokenRecuperacion(usuario.id_usuario, token)

  const enlace = `${env.FRONTEND_URL}/restablecer-contrasena?token=${token}`
  const asunto = 'Recuperación de Contraseña - Clínica Dr. Lentes'
  const cuerpo = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #00658d;">Restablecimiento de Contraseña</h2>
      <p>Hola, ${usuario.nombre} ${usuario.apellido}.</p>
      <p>Has solicitado restablecer tu contraseña para acceder al sistema de la Clínica Optométrica.</p>
      <p>Haz clic en el siguiente botón para continuar (este enlace expira en 5 minutos):</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${enlace}" style="background-color: #00658d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
      </div>
      <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
      <p style="word-break: break-all;"><a href="${enlace}">${enlace}</a></p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
    </div>
  `

  await enviarCorreo(usuario.email, asunto, cuerpo)
}

/**
 * Servicio de Restablecimiento de Contraseña.
 * Valida el token, hashea la nueva contraseña y actualiza la BD.
 */
export async function restablecerContrasenaService(dto: RestablecerDto): Promise<void> {
  const tokenDb = await findTokenRecuperacion(dto.token)

  if (!tokenDb) {
    throw new AppError(400, 'El enlace de recuperación es inválido o no existe')
  }

  if (tokenDb.utilizado) {
    throw new AppError(400, 'El enlace de recuperación ya ha sido utilizado')
  }

  if (tokenDb.expirado) {
    throw new AppError(400, 'El enlace de recuperación ha expirado')
  }

  const contrasenaHash = await bcrypt.hash(dto.contrasena, 12)
  await restablecerContrasenaRepo(tokenDb.id_usuario, tokenDb.id_token, contrasenaHash)
}

export { REFRESH_COOKIE_NAME, updatePassword }
