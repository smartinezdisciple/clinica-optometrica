import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// Mock the repository
jest.mock('../../src/modules/citas/citas.repository', () => ({
  findCitas: jest.fn(),
  findCitaById: jest.fn(),
  insertCita: jest.fn(),
  updateCita: jest.fn(),
  updateCitaEstado: jest.fn(),
  findCitasConflicto: jest.fn(),
  findHorarios: jest.fn(),
  findHorariosPorDiaYHora: jest.fn(),
  insertHorario: jest.fn(),
  updateHorario: jest.fn(),
  deleteHorarioRepo: jest.fn(),
}))

import * as repo from '../../src/modules/citas/citas.repository'
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  changeCitaEstado,
  getDisponibilidad,
} from '../../src/modules/citas/citas.service'

const mockRepo = repo as jest.Mocked<typeof repo>

const CITA_FIXTURE = {
  id_cita: 1,
  motivo_cita: 'Adaptación de lentes',
  fecha_hora_cita: '2026-07-20T09:00:00',
  estado_cita: 'confirmada' as const,
  observaciones: 'Paciente prefiere marco azul',
  fecha_proxima_revision: null,
  id_cliente: 5,
  id_empleado: 2,
  paciente_nombre: 'María',
  paciente_apellido: 'López',
  paciente_cedula: '45678901B',
  optometrista_nombre: 'Roberto',
  optometrista_apellido: 'Smith',
}

const HORARIO_FIXTURE = {
  id_horario: 10,
  id_empleado: 2,
  dia_semana: 1, // Lunes
  hora_inicio: '08:00:00',
  hora_fin: '12:00:00',
  activo: true,
}

describe('citas.service — getCitas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe devolver el listado de citas', async () => {
    mockRepo.findCitas.mockResolvedValue([CITA_FIXTURE])
    const result = await getCitas({})
    expect(result).toEqual([CITA_FIXTURE])
    expect(mockRepo.findCitas).toHaveBeenCalledWith({})
  })
})

describe('citas.service — getCitaById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe devolver la cita si existe', async () => {
    mockRepo.findCitaById.mockResolvedValue(CITA_FIXTURE)
    const result = await getCitaById(1)
    expect(result).toEqual(CITA_FIXTURE)
  })

  it('debe lanzar error 404 si la cita no existe', async () => {
    mockRepo.findCitaById.mockResolvedValue(null)
    await expect(getCitaById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'La cita no existe',
    })
  })
})

describe('citas.service — createCita', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe registrar una cita si hay disponibilidad y no hay choques', async () => {
    mockRepo.findHorariosPorDiaYHora.mockResolvedValue([HORARIO_FIXTURE])
    mockRepo.findCitasConflicto.mockResolvedValue([])
    mockRepo.insertCita.mockResolvedValue(1)
    mockRepo.findCitaById.mockResolvedValue(CITA_FIXTURE)

    const dto = {
      motivo_cita: 'Adaptación de lentes',
      fecha_hora_cita: '2026-07-20T09:00:00', // 2026-07-20 es Lunes (dia_semana = 1)
      id_cliente: 5,
      id_empleado: 2,
    }

    const result = await createCita(dto)
    expect(result).toEqual(CITA_FIXTURE)
    expect(mockRepo.findHorariosPorDiaYHora).toHaveBeenCalled()
    expect(mockRepo.findCitasConflicto).toHaveBeenCalled()
  })

  it('debe lanzar error si el optometrista no atiende en ese horario', async () => {
    mockRepo.findHorariosPorDiaYHora.mockResolvedValue([]) // No atiende

    const dto = {
      motivo_cita: 'Adaptación de lentes',
      fecha_hora_cita: '2026-07-20T15:00:00.000Z', // Fuera de horario
      id_cliente: 5,
      id_empleado: 2,
    }

    await expect(createCita(dto)).rejects.toMatchObject({
      statusCode: 400,
      message: 'El optometrista no atiende en el horario seleccionado',
    })
  })

  it('debe lanzar error si colisiona con otra cita', async () => {
    mockRepo.findHorariosPorDiaYHora.mockResolvedValue([HORARIO_FIXTURE])
    mockRepo.findCitasConflicto.mockResolvedValue([CITA_FIXTURE]) // Ocupado

    const dto = {
      motivo_cita: 'Adaptación de lentes',
      fecha_hora_cita: '2026-07-20T09:00:00',
      id_cliente: 5,
      id_empleado: 2,
    }

    await expect(createCita(dto)).rejects.toMatchObject({
      statusCode: 400,
      message: 'El optometrista ya tiene otra cita agendada a esa hora',
    })
  })
})

describe('citas.service — getDisponibilidad', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe generar slots libres y ocupados correctamente', async () => {
    mockRepo.findHorarios.mockResolvedValue([HORARIO_FIXTURE]) // Trabaja Lunes de 08:00 a 12:00
    mockRepo.findCitas.mockResolvedValue([
      {
        ...CITA_FIXTURE,
        fecha_hora_cita: new Date('2026-07-20T09:00:00'), // 09:00 ocupado
      },
    ])

    const slots = await getDisponibilidad(2, '2026-07-20') // 2026-07-20 es Lunes
    expect(slots).toContainEqual({ hora: '08:00', disponible: true })
    expect(slots).toContainEqual({ hora: '09:00', disponible: false })
    expect(slots).toContainEqual({ hora: '09:30', disponible: true })
  })

  it('debe retornar lista vacía si el optometrista no tiene horarios en ese día', async () => {
    mockRepo.findHorarios.mockResolvedValue([]) // No tiene horarios
    const slots = await getDisponibilidad(2, '2026-07-20')
    expect(slots).toEqual([])
  })
})

describe('citas.service — updateCita', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe actualizar la cita si existe y no hay colisiones', async () => {
    mockRepo.findCitaById.mockResolvedValueOnce(CITA_FIXTURE) // consulta inicial
    mockRepo.updateCita.mockResolvedValue()
    mockRepo.findCitaById.mockResolvedValueOnce({ ...CITA_FIXTURE, motivo_cita: 'Nueva consulta' }) // retorno

    const result = await updateCita(1, { motivo_cita: 'Nueva consulta' })
    expect(result.motivo_cita).toBe('Nueva consulta')
    expect(mockRepo.updateCita).toHaveBeenCalledWith(1, { motivo_cita: 'Nueva consulta' })
  })
})

describe('citas.service — changeCitaEstado', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe cambiar el estado de la cita si existe', async () => {
    mockRepo.findCitaById.mockResolvedValueOnce(CITA_FIXTURE)
    mockRepo.updateCitaEstado.mockResolvedValue()
    mockRepo.findCitaById.mockResolvedValueOnce({ ...CITA_FIXTURE, estado_cita: 'completada' })

    const result = await changeCitaEstado(1, 'completada')
    expect(result.estado_cita).toBe('completada')
    expect(mockRepo.updateCitaEstado).toHaveBeenCalledWith(1, 'completada')
  })
})

