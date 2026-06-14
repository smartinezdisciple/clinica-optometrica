import { AppError } from '../../middleware/manejo-errores'
import {
  findAllSucursales,
  findSucursalById,
  createSucursal,
  updateSucursal,
  toggleSucursalEstado,
} from './sucursales.repository'
import type { SucursalDb, SucursalDto } from './sucursales.types'

/**
 * Servicio para listar todas las sucursales.
 */
export async function getSucursalesList(soloActivas = false): Promise<SucursalDb[]> {
  return findAllSucursales(soloActivas)
}

/**
 * Servicio para obtener una sucursal por ID.
 */
export async function getSucursal(id: number): Promise<SucursalDb> {
  const sucursal = await findSucursalById(id)
  if (!sucursal) {
    throw new AppError(404, 'La sucursal no existe o no fue encontrada')
  }
  return sucursal
}

/**
 * Servicio para crear una sucursal.
 */
export async function registerSucursal(dto: SucursalDto): Promise<SucursalDb> {
  return createSucursal(dto)
}

/**
 * Servicio para actualizar una sucursal existente.
 */
export async function modifySucursal(id: number, dto: SucursalDto): Promise<SucursalDb> {
  const sucursal = await updateSucursal(id, dto)
  if (!sucursal) {
    throw new AppError(404, 'La sucursal no existe o no pudo ser actualizada')
  }
  return sucursal
}

/**
 * Servicio para cambiar el estado activo de la sucursal.
 */
export async function changeSucursalStatus(id: number, activa: boolean): Promise<SucursalDb> {
  const sucursal = await toggleSucursalEstado(id, activa)
  if (!sucursal) {
    throw new AppError(404, 'La sucursal no existe o no pudo ser modificada')
  }
  return sucursal
}
