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
import { registrarDesdeRequest } from '../auditoria/auditoria.context'
import { TipoEvento } from '../auditoria/auditoria.types'
import { z } from 'zod'

const ToggleEstadoSchema = z.object({
  activo: z.boolean({ message: 'El campo activo es requerido' }),
})

const PermisosRolSchema = z.object({
  permisosIds: z.array(z.number(), { message: 'La lista de permisosIds es requerida' }),
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

    await registrarDesdeRequest(req, {
      accion:        'Crear usuario',
      modulo:        'usuarios',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'usuarios',
      idEntidad:     usuario.id_usuario,
      despues:       { nombres: dto.nombres, apellidos: dto.apellidos, nombre_usuario: dto.nombre_usuario },
    })

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

    await registrarDesdeRequest(req, {
      accion:        'Actualizar usuario',
      modulo:        'usuarios',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'usuarios',
      idEntidad:     usuario.id_usuario,
      detalle:       { camposActualizados: Object.keys(dto) },
    })

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

    await registrarDesdeRequest(req, {
      accion:        activo ? 'Habilitar usuario' : 'Inhabilitar usuario',
      modulo:        'usuarios',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'usuarios',
      idEntidad:     id,
      detalle:       { activo },
    })

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

    await registrarDesdeRequest(req, {
      accion:        'Desbloquear usuario',
      modulo:        'usuarios',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'usuarios',
      idEntidad:     id,
    })

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

    await registrarDesdeRequest(req, {
      accion:        'Actualizar permisos de rol',
      modulo:        'usuarios',
      tipoEvento:    TipoEvento.CONFIG,
      tablaAfectada: 'roles_permisos',
      idEntidad:     rolId,
      detalle:       { permisosIds },
    })

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
