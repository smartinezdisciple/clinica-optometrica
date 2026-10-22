import { query } from '../../config/database'
import { AppError } from '../../middleware/manejo-errores'
import type {
  AperturaActiva,
  Caja,
  MovimientoCaja,
  ResumenCaja,
} from './caja.types'

// ─── Cajas ─────────────────────────────────────────────────────────────────────
export async function findCajas(sucursalId: number): Promise<Caja[]> {
  const result = await query<Caja>(
    `SELECT id_caja, nombre_caja, id_sucursal, activa
     FROM cajas WHERE id_sucursal = $1 ORDER BY nombre_caja`,
    [sucursalId]
  )
  return result.rows
}

export async function findCaja(idCaja: number): Promise<Caja | null> {
  const result = await query<Caja>(
    `SELECT id_caja, nombre_caja, id_sucursal, activa FROM cajas WHERE id_caja = $1`,
    [idCaja]
  )
  return result.rows[0] ?? null
}

export async function insertCaja(nombreCaja: string, sucursalId: number): Promise<Caja> {
  const result = await query<Caja>(
    `INSERT INTO cajas (nombre_caja, id_sucursal) VALUES ($1, $2)
     RETURNING id_caja, nombre_caja, id_sucursal, activa`,
    [nombreCaja, sucursalId]
  )
  return result.rows[0]
}

export async function setCajaActiva(idCaja: number, activa: boolean): Promise<void> {
  const result = await query(`UPDATE cajas SET activa = $1 WHERE id_caja = $2`, [activa, idCaja])
  if (result.rowCount === 0) throw new AppError(404, 'La caja no existe')
}

// ─── Aperturas / cierres ───────────────────────────────────────────────────────
export async function findAperturaActiva(idCaja: number): Promise<AperturaActiva | null> {
  const result = await query<AperturaActiva>(
    `SELECT a.id_apertura, a.fecha_apertura::text AS fecha_apertura, a.monto_inicial, a.observaciones
     FROM aperturas_caja a
     LEFT JOIN cierres_caja ci ON ci.id_apertura = a.id_apertura
     WHERE a.id_caja = $1 AND ci.id_cierre IS NULL
     ORDER BY a.fecha_apertura DESC
     LIMIT 1`,
    [idCaja]
  )
  return result.rows[0] ?? null
}

export async function insertApertura(
  idCaja: number,
  usuarioId: number,
  montoInicial: number,
  observaciones: string | null
): Promise<AperturaActiva> {
  const result = await query<AperturaActiva>(
    `INSERT INTO aperturas_caja (monto_inicial, observaciones, id_caja, id_usuario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_apertura, fecha_apertura::text AS fecha_apertura, monto_inicial, observaciones`,
    [montoInicial, observaciones, idCaja, usuarioId]
  )
  return result.rows[0]
}

export async function getResumenCaja(idCaja: number, aperturaId: number): Promise<ResumenCaja> {
  const apertura = await query<{ monto_inicial: number }>(
    'SELECT monto_inicial FROM aperturas_caja WHERE id_apertura = $1',
    [aperturaId]
  )
  const montos = await query<{ tipo: string; total: number }>(
    `SELECT tipo_movimiento AS tipo, COALESCE(SUM(monto), 0) AS total
     FROM movimientos_financieros
     WHERE id_caja = $1 AND fecha_movimiento >= (
        SELECT fecha_apertura FROM aperturas_caja WHERE id_apertura = $2
     )
     GROUP BY tipo_movimiento`,
    [idCaja, aperturaId]
  )

  const inicial    = Number(apertura.rows[0]?.monto_inicial ?? 0)
  const ingresos   = Number(montos.rows.find((r) => r.tipo === 'ingreso')?.total ?? 0)
  const egresos    = Number(montos.rows.find((r) => r.tipo === 'egreso')?.total ?? 0)
  const ajustes    = Number(montos.rows.find((r) => r.tipo === 'ajuste')?.total ?? 0)

  const aperturaActiva = await findAperturaActiva(idCaja)
  return {
    aperturaActiva,
    montoInicial:  inicial,
    totalIngresos: ingresos,
    totalEgresos:  egresos,
    totalAjustes:  ajustes,
    saldoEsperado: inicial + ingresos - egresos + ajustes,
  }
}

// ─── Movimientos ───────────────────────────────────────────────────────────────
export async function insertMovimiento(
  idCaja: number,
  usuarioId: number,
  tipo: 'ingreso' | 'egreso' | 'ajuste',
  monto: number,
  descripcion: string | null
): Promise<MovimientoCaja> {
  const result = await query<MovimientoCaja>(
    `INSERT INTO movimientos_financieros (tipo_movimiento, monto, descripcion, id_caja, id_usuario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
        id_movimiento,
        tipo_movimiento,
        monto,
        descripcion,
        fecha_movimiento::text AS fecha_movimiento,
        id_usuario,
        NULL::text AS nombre_usuario`,
    [tipo, monto, descripcion, idCaja, usuarioId]
  )
  return result.rows[0]
}

export async function findMovimientos(idCaja: number, aperturaId?: number): Promise<MovimientoCaja[]> {
  const result = await query<MovimientoCaja>(
    `SELECT
        mf.id_movimiento,
        mf.tipo_movimiento,
        mf.monto,
        mf.descripcion,
        mf.fecha_movimiento::text AS fecha_movimiento,
        mf.id_usuario,
        u.nombre_usuario
      FROM movimientos_financieros mf
      LEFT JOIN usuarios u ON u.id_usuario = mf.id_usuario
      WHERE mf.id_caja = $1
        ${aperturaId ? `AND mf.fecha_movimiento >= (
          SELECT fecha_apertura FROM aperturas_caja WHERE id_apertura = $2
        )` : ''}
      ORDER BY mf.fecha_movimiento DESC
      LIMIT 200`,
    aperturaId ? [idCaja, aperturaId] : [idCaja]
  )
  return result.rows
}

export async function insertCierre(
  aperturaId: number,
  usuarioId: number,
  montoFinal: number,
  montoEsperado: number,
  observaciones: string | null
): Promise<{ id_cierre: number; diferencia: number }> {
  const result = await query<{ id_cierre: number; diferencia: number }>(
    `INSERT INTO cierres_caja (monto_final, monto_esperado, observaciones, id_apertura, id_usuario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_cierre, diferencia`,
    [montoFinal, montoEsperado, observaciones, aperturaId, usuarioId]
  )
  if (result.rowCount === 0) throw new AppError(409, 'No se pudo cerrar la caja')
  return result.rows[0]
}