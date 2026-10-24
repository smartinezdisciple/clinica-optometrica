"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCajas = getCajas;
exports.createCaja = createCaja;
exports.setActivaCaja = setActivaCaja;
exports.getEstadoCaja = getEstadoCaja;
exports.abrirCaja = abrirCaja;
exports.registrarMovimientoCaja = registrarMovimientoCaja;
exports.listMovimientosCaja = listMovimientosCaja;
exports.cerrarCaja = cerrarCaja;
const repo = __importStar(require("./caja.repository"));
const manejo_errores_1 = require("../../middleware/manejo-errores");
async function getCajas(sucursalId) {
    return repo.findCajas(sucursalId);
}
async function createCaja(dto, sucursalId) {
    return repo.insertCaja(dto.nombre_caja, sucursalId);
}
async function setActivaCaja(idCaja, activa) {
    await repo.setCajaActiva(idCaja, activa);
}
async function getEstadoCaja(idCaja) {
    const caja = await repo.findCaja(idCaja);
    if (!caja)
        throw new manejo_errores_1.AppError(404, 'La caja no existe');
    const apertura = await repo.findAperturaActiva(idCaja);
    if (!apertura) {
        const vacio = {
            aperturaActiva: null,
            montoInicial: 0,
            totalIngresos: 0,
            totalEgresos: 0,
            totalAjustes: 0,
            saldoEsperado: 0,
        };
        return { caja, resumen: vacio };
    }
    const resumen = await repo.getResumenCaja(idCaja, apertura.id_apertura);
    return { caja, resumen };
}
async function abrirCaja(idCaja, usuarioId, dto) {
    const caja = await repo.findCaja(idCaja);
    if (!caja)
        throw new manejo_errores_1.AppError(404, 'La caja no existe');
    if (!caja.activa)
        throw new manejo_errores_1.AppError(409, 'La caja está desactivada');
    const aperturaActiva = await repo.findAperturaActiva(idCaja);
    if (aperturaActiva) {
        throw new manejo_errores_1.AppError(409, 'La caja ya se encuentra abierta');
    }
    const apertura = await repo.insertApertura(idCaja, usuarioId, dto.monto_inicial, dto.observaciones ?? null);
    return {
        caja,
        apertura,
        resumen: await repo.getResumenCaja(idCaja, apertura.id_apertura),
    };
}
async function registrarMovimientoCaja(idCaja, usuarioId, dto) {
    const caja = await repo.findCaja(idCaja);
    if (!caja)
        throw new manejo_errores_1.AppError(404, 'La caja no existe');
    const apertura = await repo.findAperturaActiva(idCaja);
    if (!apertura)
        throw new manejo_errores_1.AppError(409, 'La caja no está abierta; abre la caja antes de registrar movimientos');
    return repo.insertMovimiento(idCaja, usuarioId, dto.tipo_movimiento, dto.monto, dto.descripcion ?? null);
}
async function listMovimientosCaja(idCaja, soloAperturaActiva) {
    const caja = await repo.findCaja(idCaja);
    if (!caja)
        throw new manejo_errores_1.AppError(404, 'La caja no existe');
    const apertura = soloAperturaActiva ? await repo.findAperturaActiva(idCaja) : null;
    return repo.findMovimientos(idCaja, apertura?.id_apertura);
}
async function cerrarCaja(idCaja, usuarioId, dto) {
    const caja = await repo.findCaja(idCaja);
    if (!caja)
        throw new manejo_errores_1.AppError(404, 'La caja no existe');
    const apertura = await repo.findAperturaActiva(idCaja);
    if (!apertura)
        throw new manejo_errores_1.AppError(409, 'No hay una apertura activa para cerrar');
    const resumen = await repo.getResumenCaja(idCaja, apertura.id_apertura);
    const cierre = await repo.insertCierre(apertura.id_apertura, usuarioId, dto.monto_final, resumen.saldoEsperado, dto.observaciones ?? null);
    return {
        caja,
        apertura,
        cierre,
        montoEsperado: resumen.saldoEsperado,
        diferencia: Number(cierre.diferencia),
    };
}
//# sourceMappingURL=caja.service.js.map