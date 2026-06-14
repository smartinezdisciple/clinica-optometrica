import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// Mock the repository
jest.mock('../../src/modules/sucursales/sucursales.repository', () => ({
  findAllSucursales:    jest.fn(),
  findSucursalById:     jest.fn(),
  createSucursal:       jest.fn(),
  updateSucursal:       jest.fn(),
  toggleSucursalEstado: jest.fn(),
}))

import * as repo from '../../src/modules/sucursales/sucursales.repository'
import {
  getSucursalesList,
  getSucursal,
  registerSucursal,
  modifySucursal,
  changeSucursalStatus,
} from '../../src/modules/sucursales/sucursales.service'

const mockRepo = repo as jest.Mocked<typeof repo>

const SUCURSAL_FIXTURE = {
  id_sucursal: 1,
  nombre:      'Central Dr. Lentes',
  direccion:   'Managua, Nicaragua',
  telefono:    '2277-1234',
  correo:      'central@drlentes.com',
  activa:      true,
}

describe('sucursales.service — getSucursalesList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe devolver la lista de sucursales desde el repositorio', async () => {
    mockRepo.findAllSucursales.mockResolvedValue([SUCURSAL_FIXTURE])
    const result = await getSucursalesList()
    expect(result).toEqual([SUCURSAL_FIXTURE])
    expect(mockRepo.findAllSucursales).toHaveBeenCalledWith(false)
  })

  it('debe filtrar por activas si se especifica', async () => {
    mockRepo.findAllSucursales.mockResolvedValue([SUCURSAL_FIXTURE])
    const result = await getSucursalesList(true)
    expect(result).toEqual([SUCURSAL_FIXTURE])
    expect(mockRepo.findAllSucursales).toHaveBeenCalledWith(true)
  })
})

describe('sucursales.service — getSucursal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe devolver la sucursal si existe', async () => {
    mockRepo.findSucursalById.mockResolvedValue(SUCURSAL_FIXTURE)
    const result = await getSucursal(1)
    expect(result).toEqual(SUCURSAL_FIXTURE)
    expect(mockRepo.findSucursalById).toHaveBeenCalledWith(1)
  })

  it('debe lanzar un error 404 si la sucursal no existe', async () => {
    mockRepo.findSucursalById.mockResolvedValue(null)
    await expect(getSucursal(999)).rejects.toMatchObject({
      statusCode: 404,
      message:    'La sucursal no existe o no fue encontrada',
    })
  })
})

describe('sucursales.service — registerSucursal', () => {
  it('debe registrar una nueva sucursal', async () => {
    mockRepo.createSucursal.mockResolvedValue(SUCURSAL_FIXTURE)
    const dto = {
      nombre:    'Central Dr. Lentes',
      direccion: 'Managua, Nicaragua',
      telefono:    '2277-1234',
      correo:      'central@drlentes.com',
    }
    const result = await registerSucursal(dto)
    expect(result).toEqual(SUCURSAL_FIXTURE)
    expect(mockRepo.createSucursal).toHaveBeenCalledWith(dto)
  })
})

describe('sucursales.service — modifySucursal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe actualizar la sucursal si existe', async () => {
    mockRepo.updateSucursal.mockResolvedValue(SUCURSAL_FIXTURE)
    const dto = {
      nombre:    'Central Modificado',
      direccion: 'Nueva Dirección',
      telefono:    '2277-1234',
      correo:      'central@drlentes.com',
    }
    const result = await modifySucursal(1, dto)
    expect(result).toEqual(SUCURSAL_FIXTURE)
    expect(mockRepo.updateSucursal).toHaveBeenCalledWith(1, dto)
  })

  it('debe lanzar un error 404 si la sucursal a actualizar no existe', async () => {
    mockRepo.updateSucursal.mockResolvedValue(null)
    const dto = {
      nombre:    'Central Modificado',
      direccion: 'Nueva Dirección',
      telefono:    '2277-1234',
      correo:      'central@drlentes.com',
    }
    await expect(modifySucursal(999, dto)).rejects.toMatchObject({
      statusCode: 404,
      message:    'La sucursal no existe o no pudo ser actualizada',
    })
  })
})

describe('sucursales.service — changeSucursalStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe cambiar el estado de la sucursal', async () => {
    mockRepo.toggleSucursalEstado.mockResolvedValue({ ...SUCURSAL_FIXTURE, activa: false })
    const result = await changeSucursalStatus(1, false)
    expect(result.activa).toBe(false)
    expect(mockRepo.toggleSucursalEstado).toHaveBeenCalledWith(1, false)
  })

  it('debe lanzar un error 404 si la sucursal no existe', async () => {
    mockRepo.toggleSucursalEstado.mockResolvedValue(null)
    await expect(changeSucursalStatus(999, false)).rejects.toMatchObject({
      statusCode: 404,
      message:    'La sucursal no existe o no pudo ser modificada',
    })
  })
})
