import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// ── Mock del repositorio para aislar la lógica del servicio ───────────────────
jest.mock('../../src/modules/autenticacion/autenticacion.repository', () => ({
  findUsuarioByEmail:    jest.fn(),
  findUsuarioById:       jest.fn(),
  registrarIntentoLogin: jest.fn(),
  crearSesion:           jest.fn(),
  invalidarSesiones:     jest.fn(),
  findSesionByRefreshToken: jest.fn(),
  findPermisosByRol:     jest.fn(),
  updatePassword:        jest.fn(),
  crearTokenRecuperacion: jest.fn(),
  findTokenRecuperacion: jest.fn(),
  restablecerContrasenaRepo: jest.fn(),
}))

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  withTransaction: jest.fn(),
}))

jest.mock('../../src/config/email', () => ({
  enviarCorreo: jest.fn(() => Promise.resolve()),
}))

import * as repo from '../../src/modules/autenticacion/autenticacion.repository'
import { loginService, logoutService, recuperarContrasenaService, restablecerContrasenaService } from '../../src/modules/autenticacion/autenticacion.service'

const mockRepo = repo as jest.Mocked<typeof repo>

// ── Fixture de usuario ────────────────────────────────────────────────────────
const USUARIO_FIXTURE = {
  id_usuario:      1,
  id_empleado:     1,
  email:           'admin@drlentes.com',
  contrasena_hash: '$2b$12$QnH.8GHtSbNLb3h5HtZ4uuHXfCXYiJMZqpYGNGS5qKaM4fLQ6GUSO', // "Admin1234"
  activo:          true,
  bloqueado:       false,
  id_rol:          1,
  nombre_rol:      'Administrador',
  id_sucursal:     1,
  nombre:          'Roberto',
  apellido:        'Smith',
}

describe('autenticacion.service — loginService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRepo.findPermisosByRol.mockResolvedValue(['ventas.leer', 'ventas.crear'])
    mockRepo.registrarIntentoLogin.mockResolvedValue(undefined)
    mockRepo.crearSesion.mockResolvedValue(undefined)
  })

  it('lanza 401 si el usuario no existe', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(null)
    await expect(
      loginService({ email: 'noexiste@email.com', contrasena: 'Pass123' }, '127.0.0.1', 'Jest'),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('lanza 403 si el usuario está desactivado', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue({ ...USUARIO_FIXTURE, activo: false })
    await expect(
      loginService({ email: 'admin@drlentes.com', contrasena: 'Pass123' }, '127.0.0.1', 'Jest'),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lanza 403 si el usuario está bloqueado', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue({ ...USUARIO_FIXTURE, bloqueado: true })
    await expect(
      loginService({ email: 'admin@drlentes.com', contrasena: 'Pass123' }, '127.0.0.1', 'Jest'),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lanza 401 si la contraseña es incorrecta', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(USUARIO_FIXTURE)
    await expect(
      loginService({ email: 'admin@drlentes.com', contrasena: 'MalPassword' }, '127.0.0.1', 'Jest'),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('registra intento fallido cuando la contraseña es incorrecta', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(USUARIO_FIXTURE)
    await loginService({ email: 'admin@drlentes.com', contrasena: 'MalPassword' }, '127.0.0.1', 'Jest').catch(() => {})
    expect(mockRepo.registrarIntentoLogin).toHaveBeenCalledWith(1, false, '127.0.0.1')
  })
})

describe('autenticacion.service — logoutService', () => {
  it('llama a invalidarSesiones con el id del usuario', async () => {
    mockRepo.invalidarSesiones.mockResolvedValue(undefined)
    await logoutService(42)
    expect(mockRepo.invalidarSesiones).toHaveBeenCalledWith(42)
  })
})

describe('autenticacion.service — recuperarContrasenaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('no hace nada si el usuario no existe (no lanza error por seguridad)', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(null)
    await expect(recuperarContrasenaService({ email: 'noexiste@email.com' })).resolves.not.toThrow()
    expect(mockRepo.crearTokenRecuperacion).not.toHaveBeenCalled()
  })

  it('crea un token de recuperación si el usuario existe', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(USUARIO_FIXTURE)
    mockRepo.crearTokenRecuperacion.mockResolvedValue(undefined)

    await recuperarContrasenaService({ email: 'admin@drlentes.com' })

    expect(mockRepo.crearTokenRecuperacion).toHaveBeenCalledWith(
      USUARIO_FIXTURE.id_usuario,
      expect.any(String),
    )
  })
})

describe('autenticacion.service — restablecerContrasenaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lanza 400 si el token no existe', async () => {
    mockRepo.findTokenRecuperacion.mockResolvedValue(null)
    await expect(
      restablecerContrasenaService({ token: 'notoken', contrasena: 'NuevaContra123' }),
    ).rejects.toMatchObject({ statusCode: 400, message: 'El enlace de recuperación es inválido o no existe' })
  })

  it('lanza 400 si el token ya fue utilizado', async () => {
    mockRepo.findTokenRecuperacion.mockResolvedValue({
      id_token: 1,
      id_usuario: 1,
      utilizado: true,
      expirado: false,
    })
    await expect(
      restablecerContrasenaService({ token: 'usedtoken', contrasena: 'NuevaContra123' }),
    ).rejects.toMatchObject({ statusCode: 400, message: 'El enlace de recuperación ya ha sido utilizado' })
  })

  it('lanza 400 si el token ha expirado', async () => {
    mockRepo.findTokenRecuperacion.mockResolvedValue({
      id_token: 1,
      id_usuario: 1,
      utilizado: false,
      expirado: true,
    })
    await expect(
      restablecerContrasenaService({ token: 'expiredtoken', contrasena: 'NuevaContra123' }),
    ).rejects.toMatchObject({ statusCode: 400, message: 'El enlace de recuperación ha expirado' })
  })

  it('restablece la contraseña exitosamente si el token es válido', async () => {
    mockRepo.findTokenRecuperacion.mockResolvedValue({
      id_token: 1,
      id_usuario: 1,
      utilizado: false,
      expirado: false,
    })
    mockRepo.restablecerContrasenaRepo.mockResolvedValue(undefined)

    await restablecerContrasenaService({ token: 'validtoken', contrasena: 'NuevaContra123' })

    expect(mockRepo.restablecerContrasenaRepo).toHaveBeenCalledWith(
      1,
      1,
      expect.any(String), // contrasenaHash
    )
  })
})
