import * as repo from './empresas.repository'
import type { CrearEmpresaDto, ActualizarEmpresaDto, EmpresaDb } from './empresas.types'

/**
 * Obtiene el listado de todas las empresas o filtra por búsqueda.
 */
export async function getEmpresas(search?: string): Promise<EmpresaDb[]> {
  return repo.findEmpresas(search)
}

/**
 * Obtiene los detalles de una empresa por su ID.
 */
export async function getEmpresaById(id: number): Promise<EmpresaDb> {
  const empresa = await repo.findEmpresaById(id)
  if (!empresa) {
    const err = new Error('Empresa no encontrada')
    ;(err as any).statusCode = 404
    throw err
  }
  return empresa
}

/**
 * Registra una nueva empresa en el sistema.
 */
export async function createEmpresa(dto: CrearEmpresaDto): Promise<EmpresaDb> {
  // Validar unicidad del RUC
  const existeRuc = await repo.findEmpresaByRuc(dto.ruc.trim())
  if (existeRuc) {
    const err = new Error('El RUC ingresado ya está registrado para otra empresa')
    ;(err as any).statusCode = 400
    throw err
  }

  // Validar cédula si se proporciona
  if (dto.cedula && dto.cedula.trim()) {
    const existeCedula = await repo.findEmpresaByRuc(dto.cedula.trim()) // check against customers
    if (existeCedula) {
      const err = new Error('La cédula/documento ingresado ya está registrado')
      ;(err as any).statusCode = 400
      throw err
    }
  }

  const id = await repo.insertEmpresaTransaccion(dto)
  const nuevaEmpresa = await repo.findEmpresaById(id)
  if (!nuevaEmpresa) {
    const err = new Error('Error al recuperar la empresa creada')
    ;(err as any).statusCode = 500
    throw err
  }
  return nuevaEmpresa
}

/**
 * Actualiza los datos de una empresa existente.
 */
export async function updateEmpresa(id: number, dto: ActualizarEmpresaDto): Promise<EmpresaDb> {
  const actual = await repo.findEmpresaById(id)
  if (!actual) {
    const err = new Error('Empresa no encontrada')
    ;(err as any).statusCode = 404
    throw err
  }

  // Validar RUC si cambia
  if (dto.ruc && dto.ruc.trim() && dto.ruc.trim() !== actual.ruc) {
    const existeRuc = await repo.findEmpresaByRuc(dto.ruc.trim())
    if (existeRuc) {
      const err = new Error('El RUC ingresado ya está registrado para otra empresa')
      ;(err as any).statusCode = 400
      throw err
    }
  }

  await repo.updateEmpresaTransaccion(id, dto)
  const actualizada = await repo.findEmpresaById(id)
  if (!actualizada) {
    const err = new Error('Error al recuperar la empresa actualizada')
    ;(err as any).statusCode = 500
    throw err
  }
  return actualizada
}

/**
 * Elimina una empresa del sistema.
 */
export async function deleteEmpresa(id: number): Promise<void> {
  const actual = await repo.findEmpresaById(id)
  if (!actual) {
    const err = new Error('Empresa no encontrada')
    ;(err as any).statusCode = 404
    throw err
  }
  await repo.deleteEmpresaRepo(id)
}
