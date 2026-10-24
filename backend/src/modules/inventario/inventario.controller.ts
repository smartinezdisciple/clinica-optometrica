import type { Request, Response, NextFunction } from 'express'
import { CrearProductoSchema, RegistrarMovimientoSchema, RegistrarSerialesSchema } from './inventario.types'
import {
  getProductosInventario,
  getUnidadesSerializadas,
  crearProducto,
  registrarSeriales,
  registrarMovimiento,
} from './inventario.service'
import { registrarDesdeRequest } from '../auditoria/auditoria.context'
import { TipoEvento } from '../auditoria/auditoria.types'

/**
 * GET /api/inventario/productos
 * Lista el catálogo de productos de la sucursal del usuario autenticado.
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sucursalId = req.usuario!.sucursalId
    const productos = await getProductosInventario(sucursalId)
    res.status(200).json({ ok: true, data: productos })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/inventario/productos
 * Alta de producto (granel o serializado).
 */
export async function createProducto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CrearProductoSchema.parse(req.body)
    const sucursalId = req.usuario!.sucursalId
    const usuarioId = req.usuario!.id
    const { producto, unidadesCreadas } = await crearProducto(dto, sucursalId, usuarioId)

    await registrarDesdeRequest(req, {
      accion:        'Crear producto',
      modulo:        'inventario',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'productos',
      idEntidad:     producto.id_producto,
      despues:       {
        nombre_producto:    producto.nombre_producto,
        tipo_producto:      producto.tipo_producto,
        tipo_manejo:        producto.tipo_manejo,
        unidadesCreadas,
      },
    })

    res.status(201).json({
      ok: true,
      data: { producto, unidadesCreadas },
      mensaje: unidadesCreadas > 0
        ? `Producto creado con ${unidadesCreadas} unidad(es) registrada(s)`
        : 'Producto creado exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/inventario/productos/:id/seriales
 */
export async function listSeriales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de producto inválido' })
      return
    }
    const sucursalId = req.usuario!.sucursalId
    const unidades = await getUnidadesSerializadas(id, sucursalId)
    res.status(200).json({ ok: true, data: unidades })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/inventario/productos/:id/seriales
 * Registra unidades serializadas adicionales.
 */
export async function addSeriales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de producto inválido' })
      return
    }
    const dto = RegistrarSerialesSchema.parse(req.body)
    const sucursalId = req.usuario!.sucursalId
    const { unidadesCreadas } = await registrarSeriales(id, dto.seriales, sucursalId)

    await registrarDesdeRequest(req, {
      accion:        'Registrar unidades serializadas',
      modulo:        'inventario',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'unidades_serializadas',
      idEntidad:     id,
      detalle:       { numeroDeUnidades: unidadesCreadas },
    })

    res.status(201).json({
      ok: true,
      data: { unidadesCreadas },
      mensaje: `${unidadesCreadas} unidad(es) serializada(s) registrada(s)`,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/inventario/movimientos
 * Registra un movimiento de inventario para productos granel.
 */
export async function createMovimiento(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = RegistrarMovimientoSchema.parse(req.body)
    const sucursalId = req.usuario!.sucursalId
    const usuarioId = req.usuario!.id
    await registrarMovimiento(dto, sucursalId, usuarioId)

    await registrarDesdeRequest(req, {
      accion:        'Movimiento de inventario',
      modulo:        'inventario',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'inventario_sucursal',
      idEntidad:     dto.id_producto,
      detalle:       { tipo_movimiento: dto.tipo_movimiento, cantidad: dto.cantidad },
    })

    res.status(201).json({ ok: true, mensaje: 'Movimiento registrado exitosamente' })
  } catch (err) {
    next(err)
  }
}