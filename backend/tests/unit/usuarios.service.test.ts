import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// Mock the repository
jest.mock('../../src/modules/usuarios/usuarios.repository', () => ({
  findAllUsuarios:                  jest.fn(),
  findUsuarioDetalleById:           jest.fn(),
  findUsuarioByNombreUsuario:       jest.fn(),
  findRoles:                        jest.fn(),
  findPermisos:                     jest.fn(),
  findPermisosByRolId:              jest.fn(),
  findEmpleados:                    jest.fn(),
  insertUsuarioYEmpleadoTransaccion: jest.fn(),
  updateUsuarioYEmpleadoTransaccion: jest.fn(),
  toggleUsuarioEstado:              jest.fn(),
  desbloquearUsuarioRepo:           jest.fn(),
  updateRolPermisos:                jest.fn(),
}))

import * as repo from '../../src/modules/usuarios/usuarios.repository'
import {
  getUsuariosList,
  getUsuario,
  registerUsuario,
  modifyUsuario,
  changeUsuarioStatus,
  unlockUsuario,
} from '../../src/modules/usuarios/usuarios.service'

const mockRepo = repo as jest.Mocked<typeof repo>

const USUARIO_DETALLE_FIXTURE = {
  id_usuario:       1,
  nombre_usuario:   'rsmith',
  activo:           true,
  bloqueado:        false,
  fecha_bloqueo:    null,
  fecha_creacion:   new Date(),
  ultimo_acceso:    null,
  id_rol:           1,
  nombre_rol:       'Administrador',
  id_empleado:      1,
  primer_nombre:    'Roberto',
  segundo_nombre:   null,
  primer_apellido:  'Smith',
  segundo_apellido: null,
  numero_telefono:  '2277-1234',
  correo:           'roberto@drlentes.com',
  id_sucursal:      1,
}

describe('usuarios.service — getUsuariosList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe devolver la lista de usuarios desde el repositorio', async () => {
    mockRepo.findAllUsuarios.mockResolvedValue([USUARIO_DETALLE_FIXTURE])
    const result = await getUsuariosList()
    expect(result).toEqual([USUARIO_DETALLE_FIXTURE])
    expect(mockRepo.findAllUsuarios).toHaveBeenCalled()
  })
})

describe('usuarios.service — getUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe devolver el usuario si existe', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(USUARIO_DETALLE_FIXTURE)
    const result = await getUsuario(1)
    expect(result).toEqual(USUARIO_DETALLE_FIXTURE)
    expect(mockRepo.findUsuarioDetalleById).toHaveBeenCalledWith(1)
  })

  it('debe lanzar un error 404 si el usuario no existe', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(null)
    await expect(getUsuario(999)).rejects.toMatchObject({
      statusCode: 404,
      message:    'Usuario no encontrado',
    })
  })
})

describe('usuarios.service — registerUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lanza 400 si el nombre de usuario ya está registrado', async () => {
    mockRepo.findUsuarioByNombreUsuario.mockResolvedValue({ id_usuario: 2 })
    const dto = {
      primer_nombre: 'John',
      primer_apellido: 'Doe',
      id_sucursal: 1,
      nombre_usuario: 'rsmith',
      contrasena: 'password123',
      id_rol: 2,
    }
    await expect(registerUsuario(dto)).rejects.toMatchObject({
      statusCode: 400,
      message:    'El nombre de usuario ya está registrado',
    })
  })

  it('registra el empleado y usuario exitosamente', async () => {
    mockRepo.findUsuarioByNombreUsuario.mockResolvedValue(null)
    mockRepo.insertUsuarioYEmpleadoTransaccion.mockResolvedValue(1)
    mockRepo.findUsuarioDetalleById.mockResolvedValue(USUARIO_DETALLE_FIXTURE)

    const dto = {
      primer_nombre: 'Roberto',
      primer_apellido: 'Smith',
      id_sucursal: 1,
      nombre_usuario: 'rsmith',
      contrasena: 'password123',
      id_rol: 1,
      numero_telefono: '2277-1234',
      correo: 'roberto@drlentes.com',
    }

    const result = await registerUsuario(dto)
    expect(result).toEqual(USUARIO_DETALLE_FIXTURE)
    expect(mockRepo.insertUsuarioYEmpleadoTransaccion).toHaveBeenCalledWith(
      dto,
      expect.any(String), // contrasenaHash
    )
  })
})

describe('usuarios.service — modifyUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lanza 404 si el usuario no existe', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(null)
    const dto = { nombre_usuario: 'newuser' }
    await expect(modifyUsuario(999, dto)).rejects.toMatchObject({
      statusCode: 404,
      message:    'Usuario no encontrado',
    })
  })

  it('lanza 400 si cambia de nombre de usuario y el nuevo ya está en uso', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(USUARIO_DETALLE_FIXTURE)
    mockRepo.findUsuarioByNombreUsuario.mockResolvedValue({ id_usuario: 3 })
    
    const dto = { nombre_usuario: 'otro_usuario_existente' }
    await expect(modifyUsuario(1, dto)).rejects.toMatchObject({
      statusCode: 400,
      message:    'El nombre de usuario ya está en uso',
    })
  })

  it('actualiza datos exitosamente', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValueOnce(USUARIO_DETALLE_FIXTURE)
    mockRepo.updateUsuarioYEmpleadoTransaccion.mockResolvedValue(undefined)
    mockRepo.findUsuarioDetalleById.mockResolvedValueOnce(USUARIO_DETALLE_FIXTURE)

    const dto = {
      primer_nombre: 'Roberto Modificado',
      nombre_usuario: 'rsmith', // Mismo nombre de usuario, no valida unicidad
    }

    const result = await modifyUsuario(1, dto)
    expect(result).toEqual(USUARIO_DETALLE_FIXTURE)
    expect(mockRepo.updateUsuarioYEmpleadoTransaccion).toHaveBeenCalledWith(
      1,
      USUARIO_DETALLE_FIXTURE.id_empleado,
      dto,
      undefined,
    )
  })
})

describe('usuarios.service — changeUsuarioStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cambia el estado del usuario', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(USUARIO_DETALLE_FIXTURE)
    mockRepo.toggleUsuarioEstado.mockResolvedValue(undefined)

    await changeUsuarioStatus(1, false)
    expect(mockRepo.toggleUsuarioEstado).toHaveBeenCalledWith(1, false)
  })

  it('lanza 404 si el usuario no existe', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(null)
    await expect(changeUsuarioStatus(999, false)).rejects.toMatchObject({
      statusCode: 404,
      message:    'Usuario no encontrado',
    })
  })
})

describe('usuarios.service — unlockUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('desbloquea el usuario', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(USUARIO_DETALLE_FIXTURE)
    mockRepo.desbloquearUsuarioRepo.mockResolvedValue(undefined)

    await unlockUsuario(1)
    expect(mockRepo.desbloquearUsuarioRepo).toHaveBeenCalledWith(1)
  })

  it('lanza 404 si el usuario no existe', async () => {
    mockRepo.findUsuarioDetalleById.mockResolvedValue(null)
    await expect(unlockUsuario(999)).rejects.toMatchObject({
      statusCode: 404,
      message:    'Usuario no encontrado',
    })
  })
})
