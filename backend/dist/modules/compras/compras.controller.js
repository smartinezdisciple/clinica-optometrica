"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProveedores = listProveedores;
exports.createProveedorHandler = createProveedorHandler;
exports.listCompras = listCompras;
exports.getCompraById = getCompraById;
exports.createCompraHandler = createCompraHandler;
exports.addItemsHandler = addItemsHandler;
exports.changeEstadoHandler = changeEstadoHandler;
const compras_types_1 = require("./compras.types");
const compras_service_1 = require("./compras.service");
const auditoria_context_1 = require("../auditoria/auditoria.context");
const auditoria_types_1 = require("../auditoria/auditoria.types");
/**
 * GET /api/compras/proveedores
 */
async function listProveedores(_req, res, next) {
    try {
        const proveedores = await (0, compras_service_1.getProveedoresList)();
        res.status(200).json({ ok: true, data: proveedores });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/compras/proveedores
 */
async function createProveedorHandler(req, res, next) {
    try {
        const dto = compras_types_1.CrearProveedorSchema.parse(req.body);
        const proveedor = await (0, compras_service_1.createProveedor)(dto);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Crear proveedor',
            modulo: 'compras',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'proveedores',
            idEntidad: proveedor.id_proveedor,
            despues: { nombre_empresa: proveedor.nombre_empresa },
        });
        res.status(201).json({ ok: true, data: proveedor, mensaje: 'Proveedor creado exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/compras
 */
async function listCompras(_req, res, next) {
    try {
        const compras = await (0, compras_service_1.getComprasList)();
        res.status(200).json({ ok: true, data: compras });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/compras/:id
 */
async function getCompraById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de compra inválido' });
            return;
        }
        const compra = await (0, compras_service_1.getCompra)(id);
        res.status(200).json({ ok: true, data: compra });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/compras
 */
async function createCompraHandler(req, res, next) {
    try {
        const dto = compras_types_1.CrearCompraSchema.parse(req.body);
        const usuarioId = req.usuario.id;
        const sucursalId = req.usuario.sucursalId;
        const compra = await (0, compras_service_1.createCompra)(dto, usuarioId, sucursalId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: compra.estado === 'finalizada' ? 'Comprar y recibir orden' : 'Crear orden de compra',
            modulo: 'compras',
            tipoEvento: compra.estado === 'finalizada' ? auditoria_types_1.TipoEvento.UPDATE : auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'compras',
            idEntidad: compra.id_compra,
            detalle: { proveedorId: dto.id_proveedor, total: compra.total, numeroItems: compra.items.length },
        });
        res.status(201).json({
            ok: true,
            data: compra,
            mensaje: compra.estado === 'finalizada'
                ? 'Compra recibida: el inventario fue actualizado'
                : 'Orden de compra creada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/compras/:id/items
 */
async function addItemsHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de compra inválido' });
            return;
        }
        const dto = compras_types_1.AgregarItemsSchema.parse(req.body);
        const sucursalId = req.usuario.sucursalId;
        const resultado = await (0, compras_service_1.addItems)(id, dto.items, sucursalId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Agregar ítems a compra',
            modulo: 'compras',
            tipoEvento: auditoria_types_1.TipoEvento.UPDATE,
            tablaAfectada: 'detalles_compra',
            idEntidad: id,
            detalle: { numeroItems: resultado.items.length },
        });
        res.status(200).json({ ok: true, data: resultado, mensaje: 'Ítems agregados exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/compras/:id/estado
 */
async function changeEstadoHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de compra inválido' });
            return;
        }
        const { estado } = compras_types_1.CambiarEstadoCompraSchema.parse(req.body);
        await (0, compras_service_1.changeCompraEstado)(id, estado);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: estado === 'finalizada' ? 'Marcar compra como recibida' : 'Cambiar estado de compra',
            modulo: 'compras',
            tipoEvento: auditoria_types_1.TipoEvento.UPDATE,
            tablaAfectada: 'compras',
            idEntidad: id,
            detalle: { estado },
        });
        res.status(200).json({ ok: true, mensaje: 'Estado de la compra actualizado' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=compras.controller.js.map