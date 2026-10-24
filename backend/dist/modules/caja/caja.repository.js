"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCajas = findCajas;
exports.findCaja = findCaja;
exports.insertCaja = insertCaja;
exports.setCajaActiva = setCajaActiva;
exports.findAperturaActiva = findAperturaActiva;
exports.insertApertura = insertApertura;
exports.getResumenCaja = getResumenCaja;
exports.insertMovimiento = insertMovimiento;
exports.findMovimientos = findMovimientos;
exports.insertCierre = insertCierre;
const database_1 = require("../../config/database");
const manejo_errores_1 = require("../../middleware/manejo-errores");
// ─── Cajas ─────────────────────────────────────────────────────────────────────
async function findCajas(sucursalId) {
    const result = await (0, database_1.query)(`SELECT id_caja, nombre_caja, id_sucursal, activa
     FROM cajas WHERE id_sucursal = $1 ORDER BY nombre_caja`, [sucursalId]);
    return result.rows;
}
async function findCaja(idCaja) {
    const result = await (0, database_1.query)(`SELECT id_caja, nombre_caja, id_sucursal, activa FROM cajas WHERE id_caja = $1`, [idCaja]);
    return result.rows[0] ?? null;
}
async function insertCaja(nombreCaja, sucursalId) {
    const result = await (0, database_1.query)(`INSERT INTO cajas (nombre_caja, id_sucursal) VALUES ($1, $2)
     RETURNING id_caja, nombre_caja, id_sucursal, activa`, [nombreCaja, sucursalId]);
    return result.rows[0];
}
async function setCajaActiva(idCaja, activa) {
    const result = await (0, database_1.query)(`UPDATE cajas SET activa = $1 WHERE id_caja = $2`, [activa, idCaja]);
    if (result.rowCount === 0)
        throw new manejo_errores_1.AppError(404, 'La caja no existe');
}
// ─── Aperturas / cierres ───────────────────────────────────────────────────────
async function findAperturaActiva(idCaja) {
    const result = await (0, database_1.query)(`SELECT a.id_apertura, a.fecha_apertura::text AS fecha_apertura, a.monto_inicial, a.observaciones
     FROM aperturas_caja a
     LEFT JOIN cierres_caja ci ON ci.id_apertura = a.id_apertura
     WHERE a.id_caja = $1 AND ci.id_cierre IS NULL
     ORDER BY a.fecha_apertura DESC
     LIMIT 1`, [idCaja]);
    return result.rows[0] ?? null;
}
async function insertApertura(idCaja, usuarioId, montoInicial, observaciones) {
    const result = await (0, database_1.query)(`INSERT INTO aperturas_caja (monto_inicial, observaciones, id_caja, id_usuario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_apertura, fecha_apertura::text AS fecha_apertura, monto_inicial, observaciones`, [montoInicial, observaciones, idCaja, usuarioId]);
    return result.rows[0];
}
async function getResumenCaja(idCaja, aperturaId) {
    const apertura = await (0, database_1.query)('SELECT monto_inicial FROM aperturas_caja WHERE id_apertura = $1', [aperturaId]);
    const montos = await (0, database_1.query)(`SELECT tipo_movimiento AS tipo, COALESCE(SUM(monto), 0) AS total
     FROM movimientos_financieros
     WHERE id_caja = $1 AND fecha_movimiento >= (
        SELECT fecha_apertura FROM aperturas_caja WHERE id_apertura = $2
     )
     GROUP BY tipo_movimiento`, [idCaja, aperturaId]);
    const inicial = Number(apertura.rows[0]?.monto_inicial ?? 0);
    const ingresos = Number(montos.rows.find((r) => r.tipo === 'ingreso')?.total ?? 0);
    const egresos = Number(montos.rows.find((r) => r.tipo === 'egreso')?.total ?? 0);
    const ajustes = Number(montos.rows.find((r) => r.tipo === 'ajuste')?.total ?? 0);
    const aperturaActiva = await findAperturaActiva(idCaja);
    return {
        aperturaActiva,
        montoInicial: inicial,
        totalIngresos: ingresos,
        totalEgresos: egresos,
        totalAjustes: ajustes,
        saldoEsperado: inicial + ingresos - egresos + ajustes,
    };
}
// ─── Movimientos ───────────────────────────────────────────────────────────────
async function insertMovimiento(idCaja, usuarioId, tipo, monto, descripcion) {
    const result = await (0, database_1.query)(`INSERT INTO movimientos_financieros (tipo_movimiento, monto, descripcion, id_caja, id_usuario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
        id_movimiento,
        tipo_movimiento,
        monto,
        descripcion,
        fecha_movimiento::text AS fecha_movimiento,
        id_usuario,
        NULL::text AS nombre_usuario`, [tipo, monto, descripcion, idCaja, usuarioId]);
    return result.rows[0];
}
async function findMovimientos(idCaja, aperturaId) {
    const result = await (0, database_1.query)(`SELECT
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
      LIMIT 200`, aperturaId ? [idCaja, aperturaId] : [idCaja]);
    return result.rows;
}
async function insertCierre(aperturaId, usuarioId, montoFinal, montoEsperado, observaciones) {
    const result = await (0, database_1.query)(`INSERT INTO cierres_caja (monto_final, monto_esperado, observaciones, id_apertura, id_usuario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_cierre, diferencia`, [montoFinal, montoEsperado, observaciones, aperturaId, usuarioId]);
    if (result.rowCount === 0)
        throw new manejo_errores_1.AppError(409, 'No se pudo cerrar la caja');
    return result.rows[0];
}
//# sourceMappingURL=caja.repository.js.map