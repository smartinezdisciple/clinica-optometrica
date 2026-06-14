import { Router } from 'express'
import { list, getById, create, update, remove } from './empresas.controller'
import { autenticar, autorizar } from '../../middleware/autenticacion'

export const empresasRouter = Router()

empresasRouter.use(autenticar)

// Listado de empresas
empresasRouter.get('/', list)

// Obtener empresa por ID
empresasRouter.get('/:id', getById)

// Registrar empresa
empresasRouter.post('/', create)

// Actualizar empresa
empresasRouter.put('/:id', update)

// Eliminar empresa (solo administradores)
empresasRouter.delete('/:id', autorizar('Administrador'), remove)
