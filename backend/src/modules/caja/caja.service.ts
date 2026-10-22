import * as repo from './caja.repository'
import { AppError } from '../../middleware/manejo-errores'
import type {
  AperturaDto,
  Caja,
  CierreCajaDto,
  MovimientoCaja,
  MovimientoCajaDto,
  ResumenCaja,
} from './caja.types'

export async function getCajas(sucursalId: number): Promise<Caja[]> {
  return repo.findCajas(sucursalId)
}

export async function createCaja(dto: { nombre_caja: string }, sucursalId: number): Promise<Caja> {
  return repo.insertCaja(dto.nombre_caja, sucursalId)
}

export async function setActivaCaja(idCaja: number, activa: boolean): Promise<void> {
  await repo.setCajaActiva(idCaja, activa)
}

export async function getEstadoCaja(idCaja: number): Promise<{ caja: Caja; resumen: ResumenCaja }> {
  const caja = await repo.findCaja(idCaja)
  if (!caja) throw new AppError(404, 'La caja no existe')
  const apertura = await repo.findAperturaActiva(idCaja)
  if (!apertura) {
    const vacio: ResumenCaja = {
      aperturaActiva: null,
      montoInicial:   0,
      totalIngresos:  0,
      totalEgresos:   0,
      totalAjustes:   0,
      saldoEsperado:  0,
    }
    return { caja, resumen: vacio }
  }
  const resumen = await repo.getResumenCaja(idCaja, apertura.id_apertura)
  return { caja, resumen }
}

export async function abrirCaja(idCaja: number, usuarioId: number, dto: AperturaDto) {
  const caja = await repo.findCaja(idCaja)
  if (!caja) throw new AppError(404, 'La caja no existe')
  if (!caja.activa) throw new AppError(409, 'La caja está desactivada')

  const aperturaActiva = await repo.findAperturaActiva(idCaja)
  if (aperturaActiva) {
    throw new AppError(409, 'La caja ya se encuentra abierta')
  }

  const apertura = await repo.insertApertura(idCaja, usuarioId, dto.monto_inicial, dto.observaciones ?? null)
  return {
    caja,
    apertura,
    resumen: await repo.getResumenCaja(idCaja, apertura.id_apertura),
  }
}

export async function registrarMovimientoCaja(
  idCaja: number,
  usuarioId: number,
  dto: MovimientoCajaDto
): Promise<MovimientoCaja> {
  const caja = await repo.findCaja(idCaja)
  if (!caja) throw new AppError(404, 'La caja no existe')
  const apertura = await repo.findAperturaActiva(idCaja)
  if (!apertura) throw new AppError(409, 'La caja no está abierta; abre la caja antes de registrar movimientos')

  return repo.insertMovimiento(idCaja, usuarioId, dto.tipo_movimiento, dto.monto, dto.descripcion ?? null)
}

export async function listMovimientosCaja(idCaja: number, soloAperturaActiva: boolean): Promise<MovimientoCaja[]> {
  const caja = await repo.findCaja(idCaja)
  if (!caja) throw new AppError(404, 'La caja no existe')
  const apertura = soloAperturaActiva ? await repo.findAperturaActiva(idCaja) : null
  return repo.findMovimientos(idCaja, apertura?.id_apertura)
}

export async function cerrarCaja(idCaja: number, usuarioId: number, dto: CierreCajaDto) {
  const caja = await repo.findCaja(idCaja)
  if (!caja) throw new AppError(404, 'La caja no existe')
  const apertura = await repo.findAperturaActiva(idCaja)
  if (!apertura) throw new AppError(409, 'No hay una apertura activa para cerrar')

  const resumen = await repo.getResumenCaja(idCaja, apertura.id_apertura)
  const cierre = await repo.insertCierre(
    apertura.id_apertura,
    usuarioId,
    dto.monto_final,
    resumen.saldoEsperado,
    dto.observaciones ?? null
  )

  return {
    caja,
    apertura,
    cierre,
    montoEsperado: resumen.saldoEsperado,
    diferencia:    Number(cierre.diferencia),
  }
}