import { Router } from 'express'
import { listarLogs, getLogById, listarModulos } from './auditoria.controller'
import { autenticar, autorizar } from '../../middleware/autenticacion'

export const auditoriaRouter = Router()

// La auditoría es sensible: todos los endpoints requieren autenticación
// y el rol Administrador.
auditoriaRouter.get('/', autenticar, autorizar('Administrador'), listarLogs)
auditoriaRouter.get('/modulos', autenticar, autorizar('Administrador'), listarModulos)
auditoriaRouter.get('/:id', autenticar, autorizar('Administrador'), getLogById)
