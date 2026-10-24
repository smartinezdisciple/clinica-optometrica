import { Router } from 'express'
import { autenticar } from '../../middleware/autenticacion'
import {
  listProveedores,
  createProveedorHandler,
  listCompras,
  getCompraById,
  createCompraHandler,
  addItemsHandler,
  changeEstadoHandler,
} from './compras.controller'

export const comprasRouter = Router()

comprasRouter.use(autenticar)

// Proveedores
comprasRouter.get('/proveedores', listProveedores)
comprasRouter.post('/proveedores', createProveedorHandler)

// Compras / órdenes de compra
comprasRouter.get('/', listCompras)
comprasRouter.post('/', createCompraHandler)
comprasRouter.get('/:id', getCompraById)
comprasRouter.post('/:id/items', addItemsHandler)
comprasRouter.patch('/:id/estado', changeEstadoHandler)