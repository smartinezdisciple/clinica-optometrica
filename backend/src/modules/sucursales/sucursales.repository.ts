import { query } from '../../config/database'
import type { SucursalDb, SucursalDto } from './sucursales.types'

/**
 * Obtiene todas las sucursales del sistema.
 */
export async function findAllSucursales(soloActivas = false): Promise<SucursalDb[]> {
  const sql = soloActivas
    ? 'SELECT id_sucursal, nombre, direccion, telefono, correo, activa FROM sucursales WHERE activa = TRUE ORDER BY nombre'
    : 'SELECT id_sucursal, nombre, direccion, telefono, correo, activa FROM sucursales ORDER BY nombre'
  
  const result = await query<SucursalDb>(sql)
  return result.rows
}

/**
 * Obtiene una sucursal por su ID.
 */
export async function findSucursalById(id: number): Promise<SucursalDb | null> {
  const result = await query<SucursalDb>(
    'SELECT id_sucursal, nombre, direccion, telefono, correo, activa FROM sucursales WHERE id_sucursal = $1 LIMIT 1',
    [id]
  )
  return result.rows[0] ?? null
}

/**
 * Crea una nueva sucursal en el sistema.
 */
export async function createSucursal(dto: SucursalDto): Promise<SucursalDb> {
  const result = await query<SucursalDb>(
    `INSERT INTO sucursales (nombre, direccion, telefono, correo)
     VALUES ($1, $2, $3, $4)
     RETURNING id_sucursal, nombre, direccion, telefono, correo, activa`,
    [dto.nombre, dto.direccion ?? null, dto.telefono ?? null, dto.correo || null]
  )
  return result.rows[0]
}

/**
 * Actualiza los datos de una sucursal existente.
 */
export async function updateSucursal(id: number, dto: SucursalDto): Promise<SucursalDb | null> {
  const result = await query<SucursalDb>(
    `UPDATE sucursales
     SET nombre = $1, direccion = $2, telefono = $3, correo = $4
     WHERE id_sucursal = $5
     RETURNING id_sucursal, nombre, direccion, telefono, correo, activa`,
    [dto.nombre, dto.direccion ?? null, dto.telefono ?? null, dto.correo || null, id]
  )
  return result.rows[0] ?? null
}

/**
 * Modifica el estado activo/inactivo de una sucursal.
 */
export async function toggleSucursalEstado(id: number, activa: boolean): Promise<SucursalDb | null> {
  const result = await query<SucursalDb>(
    `UPDATE sucursales
     SET activa = $1
     WHERE id_sucursal = $2
     RETURNING id_sucursal, nombre, direccion, telefono, correo, activa`,
    [activa, id]
  )
  return result.rows[0] ?? null
}
