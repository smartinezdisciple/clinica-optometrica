import { Router } from 'express'
import { autenticar, autorizar } from '../../middleware/autenticacion'
import {
  exportarHandler,
  getCitasHandler,
  getComprasHandler,
  getInventarioHandler,
  getVentasHandler,
} from './reportes.controller'

export const reportesRouter = Router()

// Los reportes contienen información financiera: solo Administrador.
reportesRouter.use(autenticar)
reportesRouter.use(autorizar('Administrador'))

reportesRouter.get('/ventas', getVentasHandler)
reportesRouter.get('/compras', getComprasHandler)
reportesRouter.get('/citas', getCitasHandler)
reportesRouter.get('/inventario', getInventarioHandler)
reportesRouter.get('/export', exportarHandler)
