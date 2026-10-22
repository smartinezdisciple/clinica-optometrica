import { describe, expect, it, vi, beforeEach, Mocked } from 'vitest'

// Mock the repository
vi.mock('../../src/modules/empresas/empresas.repository', () => ({
  findEmpresas: vi.fn(),
  findEmpresaById: vi.fn(),
  findEmpresaByRuc: vi.fn(),
  insertEmpresaTransaccion: vi.fn(),
  updateEmpresaTransaccion: vi.fn(),
  deleteEmpresaRepo: vi.fn(),
}))

import * as repo from '../../src/modules/empresas/empresas.repository'
import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from '../../src/modules/empresas/empresas.service'

const mockRepo = repo as Mocked<typeof repo>

const EMPRESA_FIXTURE = {
  id_cliente: 1,
  cedula: null,
  nombres: 'Carlos',
  apellidos: 'Mendoza',
  tipo_cliente: 'Empresa' as const,
  numero_telefono: '2288-9999',
  correo: 'contacto@distribuidora.com',
  fecha_registro: new Date(),
  razon_social: 'Distribuidora Lentes S.A.',
  ruc: 'J031000000001',
}

describe('empresas.service — getEmpresas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe devolver la lista de empresas sin búsqueda', async () => {
    mockRepo.findEmpresas.mockResolvedValue([EMPRESA_FIXTURE])
    const result = await getEmpresas()
    expect(result).toEqual([EMPRESA_FIXTURE])
    expect(mockRepo.findEmpresas).toHaveBeenCalledWith(undefined)
  })

  it('debe filtrar empresas por término de búsqueda', async () => {
    mockRepo.findEmpresas.mockResolvedValue([EMPRESA_FIXTURE])
    const result = await getEmpresas('Distribuidora')
    expect(result).toEqual([EMPRESA_FIXTURE])
    expect(mockRepo.findEmpresas).toHaveBeenCalledWith('Distribuidora')
  })
})

describe('empresas.service — getEmpresaById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe devolver la empresa si existe', async () => {
    mockRepo.findEmpresaById.mockResolvedValue(EMPRESA_FIXTURE)
    const result = await getEmpresaById(1)
    expect(result).toEqual(EMPRESA_FIXTURE)
    expect(mockRepo.findEmpresaById).toHaveBeenCalledWith(1)
  })

  it('debe lanzar un error 404 si la empresa no existe', async () => {
    mockRepo.findEmpresaById.mockResolvedValue(null)
    await expect(getEmpresaById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Empresa no encontrada',
    })
  })
})

describe('empresas.service — createEmpresa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe registrar una nueva empresa', async () => {
    mockRepo.findEmpresaByRuc.mockResolvedValue(null)
    mockRepo.insertEmpresaTransaccion.mockResolvedValue(1)
    mockRepo.findEmpresaById.mockResolvedValue(EMPRESA_FIXTURE)

    const dto = {
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      numero_telefono: '2288-9999',
      correo: 'contacto@distribuidora.com',
      razon_social: 'Distribuidora Lentes S.A.',
      ruc: 'J031000000001',
    }

    const result = await createEmpresa(dto)
    expect(result).toEqual(EMPRESA_FIXTURE)
    expect(mockRepo.findEmpresaByRuc).toHaveBeenCalledWith('J031000000001')
    expect(mockRepo.insertEmpresaTransaccion).toHaveBeenCalledWith(dto)
  })

  it('debe lanzar un error si el RUC ya existe', async () => {
    mockRepo.findEmpresaByRuc.mockResolvedValue({ id_cliente: 2 })

    const dto = {
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      numero_telefono: '2288-9999',
      razon_social: 'Distribuidora Lentes S.A.',
      ruc: 'J031000000001',
    }

    await expect(createEmpresa(dto)).rejects.toMatchObject({
      statusCode: 400,
      message: 'El RUC ingresado ya está registrado para otra empresa',
    })
  })
})

describe('empresas.service — updateEmpresa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe actualizar la empresa si existe', async () => {
    mockRepo.findEmpresaById.mockResolvedValueOnce(EMPRESA_FIXTURE)
    mockRepo.findEmpresaByRuc.mockResolvedValue(null)
    mockRepo.updateEmpresaTransaccion.mockResolvedValue()
    mockRepo.findEmpresaById.mockResolvedValueOnce({ ...EMPRESA_FIXTURE, razon_social: 'Distribuidora Modificada' })

    const dto = {
      razon_social: 'Distribuidora Modificada',
    }

    const result = await updateEmpresa(1, dto)
    expect(result.razon_social).toBe('Distribuidora Modificada')
    expect(mockRepo.updateEmpresaTransaccion).toHaveBeenCalledWith(1, dto)
  })

  it('debe lanzar error 404 si la empresa no existe al actualizar', async () => {
    mockRepo.findEmpresaById.mockResolvedValue(null)

    await expect(updateEmpresa(999, { razon_social: 'Test' })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Empresa no encontrada',
    })
  })
})

describe('empresas.service — deleteEmpresa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe eliminar la empresa', async () => {
    mockRepo.findEmpresaById.mockResolvedValue(EMPRESA_FIXTURE)
    mockRepo.deleteEmpresaRepo.mockResolvedValue()

    await deleteEmpresa(1)
    expect(mockRepo.deleteEmpresaRepo).toHaveBeenCalledWith(1)
  })

  it('debe lanzar error 404 si la empresa a eliminar no existe', async () => {
    mockRepo.findEmpresaById.mockResolvedValue(null)
    await expect(deleteEmpresa(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Empresa no encontrada',
    })
  })
})
