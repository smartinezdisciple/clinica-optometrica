import type { Request, Response, NextFunction } from 'express'
import { CrearUsuarioSchema, ActualizarUsuarioSchema } from './usuarios.types'
import {
  getUsuariosList,
  getUsuario,
  registerUsuario,
  modifyUsuario,
  changeUsuarioStatus,
  unlockUsuario,
  getRolesList,
  getPermisosList,
  getRolPermisos,
  assignRolPermisos,
  getEmpleadosList,
} from './usuarios.service'
import { z } from 'zod'

const ToggleEstadoSchema = z.object({
  activo: z.boolean({ required_error: 'El campo activo es requerido' }),
})

const PermisosRolSchema = z.object({
  permisosIds: z.array(z.number(), { required_error: 'La lista de permisosIds es requerida' }),
})

/**
 * GET /api/usuarios
 */
export async function listUsuarios(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuarios = await getUsuariosList()
    res.status(200).json({ ok: true, data: usuarios })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/usuarios/:id
 */
export async function getUsuarioById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de usuario inválido' })
      return
    }
    const usuario = await getUsuario(id)
    res.status(200).json({ ok: true, data: usuario })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/usuarios
 */
export async function createUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CrearUsuarioSchema.parse(req.body)
    const usuario = await registerUsuario(dto)
    res.status(201).json({
      ok: true,
      data: usuario,
      mensaje: 'Empleado y usuario creados exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/usuarios/:id
 */
export async function updateUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de usuario inválido' })
      return
    }
    const dto = ActualizarUsuarioSchema.parse(req.body)
    const usuario = await modifyUsuario(id, dto)
    res.status(200).json({
      ok: true,
      data: usuario,
      mensaje: 'Usuario actualizado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/usuarios/:id/estado
 */
export async function toggleEstadoUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de usuario inválido' })
      return
    }
    const { activo } = ToggleEstadoSchema.parse(req.body)
    await changeUsuarioStatus(id, activo)
    res.status(200).json({
      ok: true,
      mensaje: activo ? 'Usuario habilitado exitosamente' : 'Usuario inhabilitado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/usuarios/:id/desbloquear
 */
export async function unlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de usuario inválido' })
      return
    }
    await unlockUsuario(id)
    res.status(200).json({ ok: true, mensaje: 'Usuario desbloqueado exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/usuarios/roles
 */
export async function listRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await getRolesList()
    res.status(200).json({ ok: true, data: roles })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/usuarios/permisos
 */
export async function listPermisos(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permisos = await getPermisosList()
    res.status(200).json({ ok: true, data: permisos })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/usuarios/roles/:id/permisos
 */
export async function listRolPermisos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rolId = parseInt(req.params.id as string, 10)
    if (isNaN(rolId)) {
      res.status(400).json({ ok: false, error: 'ID de rol inválido' })
      return
    }
    const permisos = await getRolPermisos(rolId)
    res.status(200).json({ ok: true, data: permisos })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/usuarios/roles/:id/permisos
 */
export async function updateRolPermisosHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rolId = parseInt(req.params.id as string, 10)
    if (isNaN(rolId)) {
      res.status(400).json({ ok: false, error: 'ID de rol inválido' })
      return
    }
    const { permisosIds } = PermisosRolSchema.parse(req.body)
    await assignRolPermisos(rolId, permisosIds)
    res.status(200).json({ ok: true, mensaje: 'Permisos del rol actualizados exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/empleados
 */
export async function listEmpleados(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const empleados = await getEmpleadosList()
    res.status(200).json({ ok: true, data: empleados })
  } catch (err) {
    next(err)
  }
}
