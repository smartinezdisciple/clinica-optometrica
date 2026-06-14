import { Router } from 'express'
import { listSucursales, getSucursalById, create, update, toggleEstado } from './sucursales.controller'
import { autenticar, autorizar } from '../../middleware/autenticacion'

export const sucursalesRouter = Router()

// Todas las rutas de sucursales requieren autenticación
sucursalesRouter.use(autenticar)

// GET /api/sucursales — Listar (lectura para cualquier rol autenticado)
sucursalesRouter.get('/', listSucursales)

// GET /api/sucursales/:id — Obtener por ID (lectura para cualquier rol autenticado)
sucursalesRouter.get('/:id', getSucursalById)

// Rutas de administración — Solo para Administradores
sucursalesRouter.post('/', autorizar('Administrador'), create)
sucursalesRouter.put('/:id', autorizar('Administrador'), update)
sucursalesRouter.patch('/:id/estado', autorizar('Administrador'), toggleEstado)
