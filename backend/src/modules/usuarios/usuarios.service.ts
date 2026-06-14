import bcrypt from 'bcrypt'
import { AppError } from '../../middleware/manejo-errores'
import {
  findAllUsuarios,
  findUsuarioDetalleById,
  findUsuarioByNombreUsuario,
  findRoles,
  findPermisos,
  findPermisosByRolId,
  findEmpleados,
  insertUsuarioYEmpleadoTransaccion,
  updateUsuarioYEmpleadoTransaccion,
  toggleUsuarioEstado,
  desbloquearUsuarioRepo,
  updateRolPermisos,
} from './usuarios.repository'
import type {
  UsuarioDetalleDb,
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  RolDb,
  PermisoDb,
  EmpleadoDb,
} from './usuarios.types'

/**
 * Obtiene el listado de todos los usuarios.
 */
export async function getUsuariosList(): Promise<UsuarioDetalleDb[]> {
  return findAllUsuarios()
}

/**
 * Obtiene el detalle de un usuario por su ID.
 */
export async function getUsuario(id: number): Promise<UsuarioDetalleDb> {
  const usuario = await findUsuarioDetalleById(id)
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado')
  }
  return usuario
}

/**
 * Registra un nuevo empleado y su respectivo usuario.
 */
export async function registerUsuario(dto: CrearUsuarioDto): Promise<UsuarioDetalleDb> {
  // 1. Validar nombre de usuario único
  const existe = await findUsuarioByNombreUsuario(dto.nombre_usuario)
  if (existe) {
    throw new AppError(400, 'El nombre de usuario ya está registrado')
  }

  // 2. Encriptar contraseña
  const contrasenaHash = await bcrypt.hash(dto.contrasena, 12)

  // 3. Insertar transaccionalmente
  const idUsuario = await insertUsuarioYEmpleadoTransaccion(dto, contrasenaHash)

  // 4. Devolver detalle
  const result = await findUsuarioDetalleById(idUsuario)
  if (!result) {
    throw new AppError(500, 'Error al registrar el usuario')
  }
  return result
}

/**
 * Actualiza los datos de un usuario y de su empleado.
 */
export async function modifyUsuario(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioDetalleDb> {
  const usuario = await findUsuarioDetalleById(id)
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado')
  }

  // Si cambia de nombre de usuario, verificar que sea único
  if (dto.nombre_usuario && dto.nombre_usuario !== usuario.nombre_usuario) {
    const existe = await findUsuarioByNombreUsuario(dto.nombre_usuario)
    if (existe) {
      throw new AppError(400, 'El nombre de usuario ya está en uso')
    }
  }

  // Encriptar nueva contraseña si fue provista
  let contrasenaHash: string | undefined = undefined
  if (dto.contrasena) {
    contrasenaHash = await bcrypt.hash(dto.contrasena, 12)
  }

  // Guardar cambios transaccionalmente
  await updateUsuarioYEmpleadoTransaccion(id, usuario.id_empleado, dto, contrasenaHash)

  const result = await findUsuarioDetalleById(id)
  if (!result) {
    throw new AppError(500, 'Error al actualizar el usuario')
  }
  return result
}

/**
 * Habilita/Inhabilita un usuario (baja lógica).
 */
export async function changeUsuarioStatus(id: number, activo: boolean): Promise<void> {
  const usuario = await findUsuarioDetalleById(id)
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado')
  }
  await toggleUsuarioEstado(id, activo)
}

/**
 * Desbloquea un usuario.
 */
export async function unlockUsuario(id: number): Promise<void> {
  const usuario = await findUsuarioDetalleById(id)
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado')
  }
  await desbloquearUsuarioRepo(id)
}

/**
 * Obtiene todos los roles disponibles.
 */
export async function getRolesList(): Promise<RolDb[]> {
  return findRoles()
}

/**
 * Obtiene todos los permisos disponibles.
 */
export async function getPermisosList(): Promise<PermisoDb[]> {
  return findPermisos()
}

/**
 * Obtiene los IDs de los permisos asignados a un rol.
 */
export async function getRolPermisos(rolId: number): Promise<number[]> {
  return findPermisosByRolId(rolId)
}

/**
 * Asigna una nueva lista de permisos a un rol.
 */
export async function assignRolPermisos(rolId: number, permisosIds: number[]): Promise<void> {
  await updateRolPermisos(rolId, permisosIds)
}

/**
 * Obtiene el listado de todos los empleados.
 */
export async function getEmpleadosList(): Promise<EmpleadoDb[]> {
  return findEmpleados()
}
