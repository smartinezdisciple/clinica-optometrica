"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCajasHandler = listCajasHandler;
exports.createCajaHandler = createCajaHandler;
exports.toggleCajaHandler = toggleCajaHandler;
exports.estadoCajaHandler = estadoCajaHandler;
exports.abrirCajaHandler = abrirCajaHandler;
exports.movimientoHandler = movimientoHandler;
exports.movimientosHandler = movimientosHandler;
exports.cierreHandler = cierreHandler;
const caja_types_1 = require("./caja.types");
const caja_service_1 = require("./caja.service");
const auditoria_context_1 = require("../auditoria/auditoria.context");
const auditoria_types_1 = require("../auditoria/auditoria.types");
function parseId(req) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
        throw new TypeError('ID inválido');
    return id;
}
/**
 * GET /api/caja/cajas
 */
async function listCajasHandler(req, res, next) {
    try {
        const cajas = await (0, caja_service_1.getCajas)(req.usuario.sucursalId);
        res.status(200).json({ ok: true, data: cajas });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/caja/cajas
 */
async function createCajaHandler(req, res, next) {
    try {
        const dto = caja_types_1.CrearCajaSchema.parse(req.body);
        const caja = await (0, caja_service_1.createCaja)(dto, req.usuario.sucursalId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Crear caja',
            modulo: 'caja',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'cajas',
            idEntidad: caja.id_caja,
            despues: { nombre_caja: caja.nombre_caja },
        });
        res.status(201).json({ ok: true, data: caja, mensaje: 'Caja creada exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/caja/cajas/:id/estado
 */
async function toggleCajaHandler(req, res, next) {
    try {
        const id = parseId(req);
        const { activa } = caja_types_1.CambiarEstadoCajaSchema.parse(req.body);
        await (0, caja_service_1.setActivaCaja)(id, activa);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: activa ? 'Activar caja' : 'Desactivar caja',
            modulo: 'caja',
            tipoEvento: auditoria_types_1.TipoEvento.UPDATE,
            tablaAfectada: 'cajas',
            idEntidad: id,
            detalle: { activa },
        });
        res.status(200).json({ ok: true, mensaje: activa ? 'Caja activada' : 'Caja desactivada' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/caja/cajas/:id/estado
 */
async function estadoCajaHandler(req, res, next) {
    try {
        const id = parseId(req);
        const estado = await (0, caja_service_1.getEstadoCaja)(id);
        res.status(200).json({ ok: true, data: estado });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/caja/cajas/:id/aperturas
 */
async function abrirCajaHandler(req, res, next) {
    try {
        const id = parseId(req);
        const dto = caja_types_1.AperturaSchema.parse(req.body);
        const resultado = await (0, caja_service_1.abrirCaja)(id, req.usuario.id, dto);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Abrir caja',
            modulo: 'caja',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'aperturas_caja',
            idEntidad: resultado.apertura.id_apertura,
            detalle: { id_caja: id, monto_inicial: dto.monto_inicial },
        });
        res.status(200).json({ ok: true, data: resultado, mensaje: 'Caja abierta exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/caja/cajas/:id/movimientos
 */
async function movimientoHandler(req, res, next) {
    try {
        const id = parseId(req);
        const dto = caja_types_1.MovimientoCajaSchema.parse(req.body);
        const movimiento = await (0, caja_service_1.registrarMovimientoCaja)(id, req.usuario.id, dto);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Registrar movimiento de caja',
            modulo: 'caja',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'movimientos_financieros',
            idEntidad: movimiento.id_movimiento,
            detalle: { id_caja: id, tipo: dto.tipo_movimiento, monto: dto.monto },
        });
        res.status(201).json({ ok: true, data: movimiento, mensaje: 'Movimiento registrado en la caja' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/caja/cajas/:id/movimientos
 */
async function movimientosHandler(req, res, next) {
    try {
        const id = parseId(req);
        const soloActiva = req.query.apertura === 'activa';
        const movimientos = await (0, caja_service_1.listMovimientosCaja)(id, soloActiva);
        res.status(200).json({ ok: true, data: movimientos });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/caja/cajas/:id/cierres
 */
async function cierreHandler(req, res, next) {
    try {
        const id = parseId(req);
        const dto = caja_types_1.CierreCajaSchema.parse(req.body);
        const resultado = await (0, caja_service_1.cerrarCaja)(id, req.usuario.id, dto);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Cerrar caja',
            modulo: 'caja',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'cierres_caja',
            idEntidad: resultado.cierre.id_cierre,
            detalle: { id_caja: id, monto_esperado: resultado.montoEsperado, diferencia: resultado.diferencia },
        });
        const verbo = resultado.diferencia > 0 ? 'sobrante' : resultado.diferencia < 0 ? 'faltante' : 'cuadrada';
        res.status(200).json({
            ok: true,
            data: resultado,
            mensaje: `Caja cerrada (${verbo})`,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=caja.controller.js.map