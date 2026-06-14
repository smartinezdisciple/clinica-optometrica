import { Router } from 'express'
import {
  list,
  getById,
  create,
  update,
  patchEstado,
  listDisponibilidad,
  listHorarios,
  addHorario,
  modifyHorario,
  removeHorario,
} from './citas.controller'
import { autenticar, autorizar } from '../../middleware/autenticacion'

export const citasRouter = Router()

// Todas las rutas requieren estar autenticado
citasRouter.use(autenticar)

// ─── Citas CRUD ──────────────────────────────────────────────────────────────
citasRouter.get('/', list)
citasRouter.get('/disponibilidad', listDisponibilidad)
citasRouter.get('/:id', getById)
citasRouter.post('/', create)
citasRouter.put('/:id', update)
citasRouter.patch('/:id/estado', patchEstado)

// ─── Horarios de Atención CRUD (Administración / Configuración) ──────────────
citasRouter.get('/horarios/todos', listHorarios)
citasRouter.post('/horarios', autorizar('Administrador'), addHorario)
citasRouter.put('/horarios/:id', autorizar('Administrador'), modifyHorario)
citasRouter.delete('/horarios/:id', autorizar('Administrador'), removeHorario)
