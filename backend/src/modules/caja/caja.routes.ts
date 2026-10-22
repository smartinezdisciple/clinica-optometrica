import { Router } from 'express'
import { autenticar } from '../../middleware/autenticacion'
import {
  listCajasHandler,
  createCajaHandler,
  toggleCajaHandler,
  estadoCajaHandler,
  abrirCajaHandler,
  movimientoHandler,
  movimientosHandler,
  cierreHandler,
} from './caja.controller'

export const cajaRouter = Router()

cajaRouter.use(autenticar)

cajaRouter.get('/cajas', listCajasHandler)
cajaRouter.post('/cajas', createCajaHandler)
cajaRouter.patch('/cajas/:id/estado', toggleCajaHandler)
cajaRouter.get('/cajas/:id/estado', estadoCajaHandler)
cajaRouter.post('/cajas/:id/aperturas', abrirCajaHandler)
cajaRouter.post('/cajas/:id/movimientos', movimientoHandler)
cajaRouter.get('/cajas/:id/movimientos', movimientosHandler)
cajaRouter.post('/cajas/:id/cierres', cierreHandler)