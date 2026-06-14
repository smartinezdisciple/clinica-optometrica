import { Router } from 'express'
import {
  listUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  toggleEstadoUsuario,
  unlockUser,
  listRoles,
  listPermisos,
  listRolPermisos,
  updateRolPermisosHandler,
  listEmpleados,
} from './usuarios.controller'
import { autenticar, autorizar } from '../../middleware/autenticacion'

export const usuariosRouter = Router()

// Rutas de administración de usuarios (Solo Administrador)
usuariosRouter.get('/', autenticar, autorizar('Administrador'), listUsuarios)
usuariosRouter.get('/roles', autenticar, listRoles)
usuariosRouter.get('/permisos', autenticar, listPermisos)
usuariosRouter.get('/roles/:id/permisos', autenticar, listRolPermisos)
usuariosRouter.put('/roles/:id/permisos', autenticar, autorizar('Administrador'), updateRolPermisosHandler)

usuariosRouter.get('/:id', autenticar, autorizar('Administrador'), getUsuarioById)
usuariosRouter.post('/', autenticar, autorizar('Administrador'), createUsuario)
usuariosRouter.put('/:id', autenticar, autorizar('Administrador'), updateUsuario)
usuariosRouter.patch('/:id/estado', autenticar, autorizar('Administrador'), toggleEstadoUsuario)
usuariosRouter.patch('/:id/desbloquear', autenticar, autorizar('Administrador'), unlockUser)

// Router de empleados
export const empleadosRouter = Router()
empleadosRouter.get('/', autenticar, listEmpleados)
// Nota: GET /empleados/:id se podría agregar si se requiere ver perfil de otro empleado
