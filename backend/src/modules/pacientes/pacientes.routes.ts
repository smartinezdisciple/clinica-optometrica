import { Router } from 'express'
import { list, getById, create, update, remove } from './pacientes.controller'
import { autenticar, autorizar } from '../../middleware/autenticacion'

export const pacientesRouter = Router()

pacientesRouter.use(autenticar)

// Obtener listado de pacientes o buscar por texto
pacientesRouter.get('/', list)

// Obtener un paciente por su ID
pacientesRouter.get('/:id', getById)

// Registrar un nuevo paciente
pacientesRouter.post('/', create)

// Actualizar un paciente existente
pacientesRouter.put('/:id', update)

// Eliminar un paciente (solo Administradores)
pacientesRouter.delete('/:id', autorizar('Administrador'), remove)
