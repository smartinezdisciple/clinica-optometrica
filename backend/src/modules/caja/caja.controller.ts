import type { Request, Response, NextFunction } from 'express'
import {
  AperturaSchema,
  CambiarEstadoCajaSchema,
  CierreCajaSchema,
  CrearCajaSchema,
  MovimientoCajaSchema,
} from './caja.types'
import {
  getCajas,
  createCaja,
  setActivaCaja,
  getEstadoCaja,
  abrirCaja,
  registrarMovimientoCaja,
  listMovimientosCaja,
  cerrarCaja,
} from './caja.service'
import { registrarDesdeRequest } from '../auditoria/auditoria.context'
import { TipoEvento } from '../auditoria/auditoria.types'

function parseId(req: Request): number {
  const id = parseInt(req.params.id as string, 10)
  if (isNaN(id)) throw new TypeError('ID inválido')
  return id
}

/**
 * GET /api/caja/cajas
 */
export async function listCajasHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cajas = await getCajas(req.usuario!.sucursalId)
    res.status(200).json({ ok: true, data: cajas })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/caja/cajas
 */
export async function createCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = CrearCajaSchema.parse(req.body)
    const caja = await createCaja(dto, req.usuario!.sucursalId)

    await registrarDesdeRequest(req, {
      accion:        'Crear caja',
      modulo:        'caja',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'cajas',
      idEntidad:     caja.id_caja,
      despues:       { nombre_caja: caja.nombre_caja },
    })

    res.status(201).json({ ok: true, data: caja, mensaje: 'Caja creada exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/caja/cajas/:id/estado
 */
export async function toggleCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req)
    const { activa } = CambiarEstadoCajaSchema.parse(req.body)
    await setActivaCaja(id, activa)

    await registrarDesdeRequest(req, {
      accion:        activa ? 'Activar caja' : 'Desactivar caja',
      modulo:        'caja',
      tipoEvento:    TipoEvento.UPDATE,
      tablaAfectada: 'cajas',
      idEntidad:     id,
      detalle:       { activa },
    })

    res.status(200).json({ ok: true, mensaje: activa ? 'Caja activada' : 'Caja desactivada' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/caja/cajas/:id/estado
 */
export async function estadoCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req)
    const estado = await getEstadoCaja(id)
    res.status(200).json({ ok: true, data: estado })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/caja/cajas/:id/aperturas
 */
export async function abrirCajaHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req)
    const dto = AperturaSchema.parse(req.body)
    const resultado = await abrirCaja(id, req.usuario!.id, dto)

    await registrarDesdeRequest(req, {
      accion:        'Abrir caja',
      modulo:        'caja',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'aperturas_caja',
      idEntidad:     resultado.apertura.id_apertura,
      detalle:       { id_caja: id, monto_inicial: dto.monto_inicial },
    })

    res.status(200).json({ ok: true, data: resultado, mensaje: 'Caja abierta exitosamente' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/caja/cajas/:id/movimientos
 */
export async function movimientoHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req)
    const dto = MovimientoCajaSchema.parse(req.body)
    const movimiento = await registrarMovimientoCaja(id, req.usuario!.id, dto)

    await registrarDesdeRequest(req, {
      accion:        'Registrar movimiento de caja',
      modulo:        'caja',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'movimientos_financieros',
      idEntidad:     movimiento.id_movimiento,
      detalle:       { id_caja: id, tipo: dto.tipo_movimiento, monto: dto.monto },
    })

    res.status(201).json({ ok: true, data: movimiento, mensaje: 'Movimiento registrado en la caja' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/caja/cajas/:id/movimientos
 */
export async function movimientosHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req)
    const soloActiva = req.query.apertura === 'activa'
    const movimientos = await listMovimientosCaja(id, soloActiva)
    res.status(200).json({ ok: true, data: movimientos })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/caja/cajas/:id/cierres
 */
export async function cierreHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req)
    const dto = CierreCajaSchema.parse(req.body)
    const resultado = await cerrarCaja(id, req.usuario!.id, dto)

    await registrarDesdeRequest(req, {
      accion:        'Cerrar caja',
      modulo:        'caja',
      tipoEvento:    TipoEvento.CREATE,
      tablaAfectada: 'cierres_caja',
      idEntidad:     resultado.cierre.id_cierre,
      detalle:       { id_caja: id, monto_esperado: resultado.montoEsperado, diferencia: resultado.diferencia },
    })

    const verbo = resultado.diferencia > 0 ? 'sobrante' : resultado.diferencia < 0 ? 'faltante' : 'cuadrada'
    res.status(200).json({
      ok: true,
      data: resultado,
      mensaje: `Caja cerrada (${verbo})`,
    })
  } catch (err) {
    next(err)
  }
}