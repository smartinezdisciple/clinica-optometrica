import { Router } from 'express'
import { autenticar } from '../../middleware/autenticacion'
import {
  listMetodosPago,
  listProductosVendibles,
  listSerialesDisponibles,
  resumenVentas,
  listarVentas,
  getVentaById,
  crearVentaHandler,
  cambiarEstadoHandler,
} from './ventas.controller'

export const ventasRouter = Router()

ventasRouter.use(autenticar)

// Catálogos y consultas específicas (antes de /:id para no colisionar)
ventasRouter.get('/metodos-pago', listMetodosPago)
ventasRouter.get('/productos-disponibles', listProductosVendibles)
ventasRouter.get('/seriales-disponibles', listSerialesDisponibles)
ventasRouter.get('/resumen', resumenVentas)

// Ventas
ventasRouter.get('/', listarVentas)
ventasRouter.post('/', crearVentaHandler)
ventasRouter.get('/:id', getVentaById)
ventasRouter.patch('/:id/estado', cambiarEstadoHandler)
