import { describe, expect, it, vi, beforeEach, Mocked } from 'vitest'

// Mock the repository
vi.mock('../../src/modules/pacientes/pacientes.repository', () => ({
  findPacientes: vi.fn(),
  findPacienteById: vi.fn(),
  findClienteByCedula: vi.fn(),
  insertPacienteTransaccion: vi.fn(),
  updatePacienteTransaccion: vi.fn(),
  deletePacienteRepo: vi.fn(),
}))

import * as repo from '../../src/modules/pacientes/pacientes.repository'
import {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente,
} from '../../src/modules/pacientes/pacientes.service'

const mockRepo = repo as Mocked<typeof repo>

const PACIENTE_FIXTURE = {
  id_cliente: 1,
  cedula: '12345678A',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez García',
  tipo_cliente: 'Persona' as const,
  numero_telefono: '8888-8888',
  correo: 'juan.perez@test.com',
  fecha_registro: new Date(),
  ocupacion: 'Estudiante',
  fecha_nacimiento: '2000-01-01',
  genero: 'Masculino' as const,
}

describe('pacientes.service — getPacientes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe devolver la lista de pacientes sin búsqueda', async () => {
    mockRepo.findPacientes.mockResolvedValue([PACIENTE_FIXTURE])
    const result = await getPacientes()
    expect(result).toEqual([PACIENTE_FIXTURE])
    expect(mockRepo.findPacientes).toHaveBeenCalledWith(undefined)
  })

  it('debe filtrar pacientes por término de búsqueda', async () => {
    mockRepo.findPacientes.mockResolvedValue([PACIENTE_FIXTURE])
    const result = await getPacientes('Juan')
    expect(result).toEqual([PACIENTE_FIXTURE])
    expect(mockRepo.findPacientes).toHaveBeenCalledWith('Juan')
  })
})

describe('pacientes.service — getPacienteById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe devolver el paciente si existe', async () => {
    mockRepo.findPacienteById.mockResolvedValue(PACIENTE_FIXTURE)
    const result = await getPacienteById(1)
    expect(result).toEqual(PACIENTE_FIXTURE)
    expect(mockRepo.findPacienteById).toHaveBeenCalledWith(1)
  })

  it('debe lanzar un error 404 si el paciente no existe', async () => {
    mockRepo.findPacienteById.mockResolvedValue(null)
    await expect(getPacienteById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Paciente no encontrado',
    })
  })
})

describe('pacientes.service — createPaciente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe registrar un nuevo paciente', async () => {
    mockRepo.findClienteByCedula.mockResolvedValue(null)
    mockRepo.insertPacienteTransaccion.mockResolvedValue(1)
    mockRepo.findPacienteById.mockResolvedValue(PACIENTE_FIXTURE)

    const dto = {
      cedula: '12345678A',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      numero_telefono: '8888-8888',
      correo: 'juan.perez@test.com',
      ocupacion: 'Estudiante',
      fecha_nacimiento: '2000-01-01',
      genero: 'Masculino' as const,
    }

    const result = await createPaciente(dto)
    expect(result).toEqual(PACIENTE_FIXTURE)
    expect(mockRepo.findClienteByCedula).toHaveBeenCalledWith('12345678A')
    expect(mockRepo.insertPacienteTransaccion).toHaveBeenCalledWith(dto)
  })

  it('debe lanzar un error si la cédula ya existe', async () => {
    mockRepo.findClienteByCedula.mockResolvedValue({ id_cliente: 2 })

    const dto = {
      cedula: '12345678A',
      nombres: 'Juan',
      apellidos: 'Pérez',
      numero_telefono: '8888-8888',
      fecha_nacimiento: '2000-01-01',
    }

    await expect(createPaciente(dto)).rejects.toMatchObject({
      statusCode: 400,
      message: 'La cédula ingresada ya está registrada en el sistema',
    })
  })
})

describe('pacientes.service — updatePaciente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe actualizar el paciente si existe', async () => {
    mockRepo.findPacienteById.mockResolvedValueOnce(PACIENTE_FIXTURE) // para la consulta inicial
    mockRepo.findClienteByCedula.mockResolvedValue(null)
    mockRepo.updatePacienteTransaccion.mockResolvedValue()
    mockRepo.findPacienteById.mockResolvedValueOnce({ ...PACIENTE_FIXTURE, nombres: 'Juan Modificado' }) // para retornar

    const dto = {
      nombres: 'Juan Modificado',
    }

    const result = await updatePaciente(1, dto)
    expect(result.nombres).toBe('Juan Modificado')
    expect(mockRepo.updatePacienteTransaccion).toHaveBeenCalledWith(1, dto)
  })

  it('debe lanzar error 404 si el paciente no existe al actualizar', async () => {
    mockRepo.findPacienteById.mockResolvedValue(null)

    await expect(updatePaciente(999, { nombres: 'Test' })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Paciente no encontrado',
    })
  })
})

describe('pacientes.service — deletePaciente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe eliminar el paciente', async () => {
    mockRepo.findPacienteById.mockResolvedValue(PACIENTE_FIXTURE)
    mockRepo.deletePacienteRepo.mockResolvedValue()

    await deletePaciente(1)
    expect(mockRepo.deletePacienteRepo).toHaveBeenCalledWith(1)
  })

  it('debe lanzar error 404 si el paciente a eliminar no existe', async () => {
    mockRepo.findPacienteById.mockResolvedValue(null)
    await expect(deletePaciente(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Paciente no encontrado',
    })
  })
})
