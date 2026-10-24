import { findLogById, findLogs, insertLog, findModulosRegistrados } from './auditoria.repository'
import type { ListarLogsQuery, ListarLogsResultado, LogDb, RegistrarLogInput } from './auditoria.types'
import { AppError } from '../../middleware/manejo-errores'

/**
 * Registra un evento de auditoría en la tabla logs_sistema.
 * Método diseñado para ser invocado de forma explícita desde las
 * operaciones de negocio relevantes (crear/editar/eliminar/login...).
 *
 * No lanza errores: si el registro falla, se registra por consola para
 * no interrumpir la operación de negocio principal.
 */
export async function registrar(input: RegistrarLogInput): Promise<void> {
  try {
    await insertLog(input)
  } catch (err) {
    console.error('❌  Error registrando auditoría:', (err as Error).message)
  }
}

/**
 * Obtiene un log de auditoría por su ID.
 */
export async function getLog(id: number): Promise<LogDb> {
  const log = await findLogById(id)
  if (!log) {
    throw new AppError(404, 'Registro de auditoría no encontrado')
  }
  return log
}

/**
 * Lista los logs de auditoría aplicando filtros y paginación.
 */
export async function listLogs(filtros: ListarLogsQuery): Promise<ListarLogsResultado> {
  return findLogs(filtros)
}

/**
 * Devuelve los módulos y tipos de evento existentes para poblar filtros.
 */
export async function getModulosDisponibles(): Promise<string[]> {
  return findModulosRegistrados()
}
