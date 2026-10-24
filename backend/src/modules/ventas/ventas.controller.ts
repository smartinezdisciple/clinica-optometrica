import type { Request, Response, NextFunction } from 'express'
import {
  CambiarEstadoVentaSchema,
  CrearVentaSchema,
  ListarVentasQuerySchema,
} from './ventas.types'
import {
  getMetodosPago,
  getProductosVendibles,
  getSerialesDisponibles,
  getVentas,
  getVenta,
  getResumen,
  crearVenta,
  cambiarEstadoVenta,
} from './ventas.service'
import { registrarDesdeRequest } from '../auditoria/auditoria.context'
import { TipoEvento } from '../auditoria/auditoria.types'

/**
 * GET /api/ventas/metodos-pago
 */
export async function listMetodosPago(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const metodos = await getMetodosPago()
    res.status(200).json({ ok: true, data: metodos })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/ventas/productos-disponibles
 */
export async function listProductosVendibles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sucursalId = req.usuario!.sucursalId
    const productos = await getProductosVendibles(sucursalId)
    res.status(200).json({ ok: true, data: productos })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/ventas/seriales-disponibles?productoId=123
 */
export async function listSerialesDisponibles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productoId = parseInt(req.query.productoId as string, 10)
    if (isNaN(productoId)) {
      res.status(400).json({ ok: false, error: 'Parámetro productoId inválido' })
      return
    }
    const sucursalId = req.usuario!.sucursalId
    const unidades = await getSerialesDisponibles(productoId, sucursalId)
    res.status(200).json({ ok: true, data: unidades })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/ventas/resumen
 */
export async function resumenVentas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = ListarVentasQuerySchema.parse(req.query)
    const resumen = await getResumen(filtros)
    res.status(200).json({ ok: true, data: resumen })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/ventas
 */
export async function listarVentas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = ListarVentasQuerySchema.parse(req.query)
    const ventas = await getVentas(filtros)
    res.status(200).json({ ok: true, data: ventas })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/ventas/:id
 */
export async function getVentaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de venta inválido' })
      return
    }
    const venta = await getVenta(id)
    res.status(200).json({ ok: true, data: venta })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/ventas
 * Registra una venta finalizada con su pago.
 */
export async function crearVentaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CrearVentaSchema.parse(req.body)
    const usuarioId = req.usuario!.id
    const sucursalId = req.usuario!.sucursalId
    const venta = await crearVenta(dto, usuarioId, sucursalId)

    await registrarDesdeRequest(req, {
      accion:        'Registrar venta',
      modulo:        'ventas',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'ventas',
      idEntidad:     venta.id_venta,
      detalle:       {
        clienteId:     dto.id_cliente,
        total:         venta.total,
        numeroItems:   dto.items.length,
        metodoPagoId:  dto.id_metodo_pago,
      },
    })

    res.status(201).json({ ok: true, data: venta, mensaje: 'Venta registrada exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/ventas/:id/estado
 * Permite finalizar o cancelar una venta. Al cancelar se revierte el inventario.
 */
export async function cambiarEstadoHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de venta inválido' })
      return
    }
    const { estado } = CambiarEstadoVentaSchema.parse(req.body)
    const usuarioId = req.usuario!.id
    await cambiarEstadoVenta(id, estado, usuarioId)

    await registrarDesdeRequest(req, {
      accion:        estado === 'cancelada' ? 'Cancelar venta' : 'Cambiar estado de venta',
      modulo:        'ventas',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'ventas',
      idEntidad:     id,
      detalle:       { estado },
    })

    res.status(200).json({ ok: true, mensaje: 'Estado de la venta actualizado' })
  } catch (err) {
    next(err)
  }
}
