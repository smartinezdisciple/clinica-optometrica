"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMetodosPago = listMetodosPago;
exports.listProductosVendibles = listProductosVendibles;
exports.listSerialesDisponibles = listSerialesDisponibles;
exports.resumenVentas = resumenVentas;
exports.listarVentas = listarVentas;
exports.getVentaById = getVentaById;
exports.crearVentaHandler = crearVentaHandler;
exports.cambiarEstadoHandler = cambiarEstadoHandler;
const ventas_types_1 = require("./ventas.types");
const ventas_service_1 = require("./ventas.service");
const auditoria_context_1 = require("../auditoria/auditoria.context");
const auditoria_types_1 = require("../auditoria/auditoria.types");
/**
 * GET /api/ventas/metodos-pago
 */
async function listMetodosPago(_req, res, next) {
    try {
        const metodos = await (0, ventas_service_1.getMetodosPago)();
        res.status(200).json({ ok: true, data: metodos });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/ventas/productos-disponibles
 */
async function listProductosVendibles(req, res, next) {
    try {
        const sucursalId = req.usuario.sucursalId;
        const productos = await (0, ventas_service_1.getProductosVendibles)(sucursalId);
        res.status(200).json({ ok: true, data: productos });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/ventas/seriales-disponibles?productoId=123
 */
async function listSerialesDisponibles(req, res, next) {
    try {
        const productoId = parseInt(req.query.productoId, 10);
        if (isNaN(productoId)) {
            res.status(400).json({ ok: false, error: 'Parámetro productoId inválido' });
            return;
        }
        const sucursalId = req.usuario.sucursalId;
        const unidades = await (0, ventas_service_1.getSerialesDisponibles)(productoId, sucursalId);
        res.status(200).json({ ok: true, data: unidades });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/ventas/resumen
 */
async function resumenVentas(req, res, next) {
    try {
        const filtros = ventas_types_1.ListarVentasQuerySchema.parse(req.query);
        const resumen = await (0, ventas_service_1.getResumen)(filtros);
        res.status(200).json({ ok: true, data: resumen });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/ventas
 */
async function listarVentas(req, res, next) {
    try {
        const filtros = ventas_types_1.ListarVentasQuerySchema.parse(req.query);
        const ventas = await (0, ventas_service_1.getVentas)(filtros);
        res.status(200).json({ ok: true, data: ventas });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/ventas/:id
 */
async function getVentaById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de venta inválido' });
            return;
        }
        const venta = await (0, ventas_service_1.getVenta)(id);
        res.status(200).json({ ok: true, data: venta });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/ventas
 * Registra una venta finalizada con su pago.
 */
async function crearVentaHandler(req, res, next) {
    try {
        const dto = ventas_types_1.CrearVentaSchema.parse(req.body);
        const usuarioId = req.usuario.id;
        const sucursalId = req.usuario.sucursalId;
        const venta = await (0, ventas_service_1.crearVenta)(dto, usuarioId, sucursalId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Registrar venta',
            modulo: 'ventas',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'ventas',
            idEntidad: venta.id_venta,
            detalle: {
                clienteId: dto.id_cliente,
                total: venta.total,
                numeroItems: dto.items.length,
                metodoPagoId: dto.id_metodo_pago,
            },
        });
        res.status(201).json({ ok: true, data: venta, mensaje: 'Venta registrada exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/ventas/:id/estado
 * Permite finalizar o cancelar una venta. Al cancelar se revierte el inventario.
 */
async function cambiarEstadoHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de venta inválido' });
            return;
        }
        const { estado } = ventas_types_1.CambiarEstadoVentaSchema.parse(req.body);
        const usuarioId = req.usuario.id;
        await (0, ventas_service_1.cambiarEstadoVenta)(id, estado, usuarioId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: estado === 'cancelada' ? 'Cancelar venta' : 'Cambiar estado de venta',
            modulo: 'ventas',
            tipoEvento: auditoria_types_1.TipoEvento.UPDATE,
            tablaAfectada: 'ventas',
            idEntidad: id,
            detalle: { estado },
        });
        res.status(200).json({ ok: true, mensaje: 'Estado de la venta actualizado' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=ventas.controller.js.map