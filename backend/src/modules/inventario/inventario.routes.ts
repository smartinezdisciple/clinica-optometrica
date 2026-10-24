import { Router } from 'express'
import {
  list,
  createProducto,
  listSeriales,
  addSeriales,
  createMovimiento,
} from './inventario.controller'
import { autenticar } from '../../middleware/autenticacion'

export const inventarioRouter = Router()

inventarioRouter.use(autenticar)

// Catálogo de productos
inventarioRouter.get('/productos', list)
inventarioRouter.post('/productos', createProducto)

// Unidades serializadas
inventarioRouter.get('/productos/:id/seriales', listSeriales)
inventarioRouter.post('/productos/:id/seriales', addSeriales)

// Movimientos (granel)
inventarioRouter.post('/movimientos', createMovimiento)