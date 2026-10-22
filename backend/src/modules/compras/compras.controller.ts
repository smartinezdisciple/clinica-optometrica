import type { Request, Response, NextFunction } from 'express'
import {
  AgregarItemsSchema,
  CambiarEstadoCompraSchema,
  CrearCompraSchema,
  CrearProveedorSchema,
} from './compras.types'
import {
  getProveedoresList,
  createProveedor,
  getComprasList,
  getCompra,
  createCompra,
  addItems,
  changeCompraEstado,
} from './compras.service'
import { registrarDesdeRequest } from '../auditoria/auditoria.context'
import { TipoEvento } from '../auditoria/auditoria.types'

/**
 * GET /api/compras/proveedores
 */
export async function listProveedores(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const proveedores = await getProveedoresList()
    res.status(200).json({ ok: true, data: proveedores })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/compras/proveedores
 */
export async function createProveedorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CrearProveedorSchema.parse(req.body)
    const proveedor = await createProveedor(dto)

    await registrarDesdeRequest(req, {
      accion:        'Crear proveedor',
      modulo:        'compras',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'proveedores',
      idEntidad:     proveedor.id_proveedor,
      despues:       { nombre_empresa: proveedor.nombre_empresa },
    })

    res.status(201).json({ ok: true, data: proveedor, mensaje: 'Proveedor creado exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/compras
 */
export async function listCompras(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const compras = await getComprasList()
    res.status(200).json({ ok: true, data: compras })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/compras/:id
 */
export async function getCompraById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de compra inválido' })
      return
    }
    const compra = await getCompra(id)
    res.status(200).json({ ok: true, data: compra })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/compras
 */
export async function createCompraHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CrearCompraSchema.parse(req.body)
    const usuarioId = req.usuario!.id
    const sucursalId = req.usuario!.sucursalId
    const compra = await createCompra(dto, usuarioId, sucursalId)

    await registrarDesdeRequest(req, {
      accion:        compra.estado === 'finalizada' ? 'Comprar y recibir orden' : 'Crear orden de compra',
      modulo:        'compras',
      tipoEvento:    compra.estado === 'finalizada' ? TipoEvento.UPDATE : TipoEvento.CREATE,
      tablaAfectada: 'compras',
      idEntidad:     compra.id_compra,
      detalle:       { proveedorId: dto.id_proveedor, total: compra.total, numeroItems: compra.items.length },
    })

    res.status(201).json({
      ok: true,
      data: compra,
      mensaje: compra.estado === 'finalizada'
        ? 'Compra recibida: el inventario fue actualizado'
        : 'Orden de compra creada exitosamente',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/compras/:id/items
 */
export async function addItemsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de compra inválido' })
      return
    }
    const dto = AgregarItemsSchema.parse(req.body)
    const sucursalId = req.usuario!.sucursalId
    const resultado = await addItems(id, dto.items, sucursalId)

    await registrarDesdeRequest(req, {
      accion:        'Agregar ítems a compra',
      modulo:        'compras',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'detalles_compra',
      idEntidad:     id,
      detalle:       { numeroItems: resultado.items.length },
    })

    res.status(200).json({ ok: true, data: resultado, mensaje: 'Ítems agregados exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/compras/:id/estado
 */
export async function changeEstadoHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      res.status(400).json({ ok: false, error: 'ID de compra inválido' })
      return
    }
    const { estado } = CambiarEstadoCompraSchema.parse(req.body)
    await changeCompraEstado(id, estado)

    await registrarDesdeRequest(req, {
      accion:        estado === 'finalizada' ? 'Marcar compra como recibida' : 'Cambiar estado de compra',
      modulo:        'compras',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'compras',
      idEntidad:     id,
      detalle:       { estado },
    })

    res.status(200).json({ ok: true, mensaje: 'Estado de la compra actualizado' })
  } catch (err) {
    next(err)
  }
}