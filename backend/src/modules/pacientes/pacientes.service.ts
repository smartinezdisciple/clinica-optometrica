import * as repo from './pacientes.repository'
import type { CrearPacienteDto, ActualizarPacienteDto, PacienteDb } from './pacientes.types'

/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
export async function getPacientes(search?: string): Promise<PacienteDb[]> {
  return repo.findPacientes(search)
}

/**
 * Obtiene un paciente por su ID.
 */
export async function getPacienteById(id: number): Promise<PacienteDb> {
  const paciente = await repo.findPacienteById(id)
  if (!paciente) {
    const err = new Error('Paciente no encontrado')
    ;(err as any).statusCode = 404
    throw err
  }
  return paciente
}

/**
 * Registra un nuevo paciente en el sistema.
 */
export async function createPaciente(dto: CrearPacienteDto): Promise<PacienteDb> {
  // Validar cédula única si se proporciona
  if (dto.cedula && dto.cedula.trim()) {
    const existe = await repo.findClienteByCedula(dto.cedula.trim())
    if (existe) {
      const err = new Error('La cédula ingresada ya está registrada en el sistema')
      ;(err as any).statusCode = 400
      throw err
    }
  }

  const id = await repo.insertPacienteTransaccion(dto)
  const nuevoPaciente = await repo.findPacienteById(id)
  if (!nuevoPaciente) {
    const err = new Error('Error al recuperar el paciente creado')
    ;(err as any).statusCode = 500
    throw err
  }
  return nuevoPaciente
}

/**
 * Actualiza los datos de un paciente existente.
 */
export async function updatePaciente(id: number, dto: ActualizarPacienteDto): Promise<PacienteDb> {
  const actual = await repo.findPacienteById(id)
  if (!actual) {
    const err = new Error('Paciente no encontrado')
    ;(err as any).statusCode = 404
    throw err
  }

  // Validar cédula única si se modifica
  if (dto.cedula && dto.cedula.trim() && dto.cedula.trim() !== actual.cedula) {
    const existe = await repo.findClienteByCedula(dto.cedula.trim())
    if (existe) {
      const err = new Error('La cédula ingresada ya está registrada por otro cliente')
      ;(err as any).statusCode = 400
      throw err
    }
  }

  await repo.updatePacienteTransaccion(id, dto)
  const actualizado = await repo.findPacienteById(id)
  if (!actualizado) {
    const err = new Error('Error al recuperar el paciente actualizado')
    ;(err as any).statusCode = 500
    throw err
  }
  return actualizado
}

/**
 * Elimina un paciente por su ID.
 */
export async function deletePaciente(id: number): Promise<void> {
  const actual = await repo.findPacienteById(id)
  if (!actual) {
    const err = new Error('Paciente no encontrado')
    ;(err as any).statusCode = 404
    throw err
  }
  await repo.deletePacienteRepo(id)
}
