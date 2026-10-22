"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.createProducto = createProducto;
exports.listSeriales = listSeriales;
exports.addSeriales = addSeriales;
exports.createMovimiento = createMovimiento;
const inventario_types_1 = require("./inventario.types");
const inventario_service_1 = require("./inventario.service");
const auditoria_context_1 = require("../auditoria/auditoria.context");
const auditoria_types_1 = require("../auditoria/auditoria.types");
/**
 * GET /api/inventario/productos
 * Lista el catálogo de productos de la sucursal del usuario autenticado.
 */
async function list(req, res, next) {
    try {
        const sucursalId = req.usuario.sucursalId;
        const productos = await (0, inventario_service_1.getProductosInventario)(sucursalId);
        res.status(200).json({ ok: true, data: productos });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/inventario/productos
 * Alta de producto (granel o serializado).
 */
async function createProducto(req, res, next) {
    try {
        const dto = inventario_types_1.CrearProductoSchema.parse(req.body);
        const sucursalId = req.usuario.sucursalId;
        const usuarioId = req.usuario.id;
        const { producto, unidadesCreadas } = await (0, inventario_service_1.crearProducto)(dto, sucursalId, usuarioId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Crear producto',
            modulo: 'inventario',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'productos',
            idEntidad: producto.id_producto,
            despues: {
                nombre_producto: producto.nombre_producto,
                tipo_producto: producto.tipo_producto,
                tipo_manejo: producto.tipo_manejo,
                unidadesCreadas,
            },
        });
        res.status(201).json({
            ok: true,
            data: { producto, unidadesCreadas },
            mensaje: unidadesCreadas > 0
                ? `Producto creado con ${unidadesCreadas} unidad(es) registrada(s)`
                : 'Producto creado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/inventario/productos/:id/seriales
 */
async function listSeriales(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de producto inválido' });
            return;
        }
        const sucursalId = req.usuario.sucursalId;
        const unidades = await (0, inventario_service_1.getUnidadesSerializadas)(id, sucursalId);
        res.status(200).json({ ok: true, data: unidades });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/inventario/productos/:id/seriales
 * Registra unidades serializadas adicionales.
 */
async function addSeriales(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de producto inválido' });
            return;
        }
        const dto = inventario_types_1.RegistrarSerialesSchema.parse(req.body);
        const sucursalId = req.usuario.sucursalId;
        const { unidadesCreadas } = await (0, inventario_service_1.registrarSeriales)(id, dto.seriales, sucursalId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Registrar unidades serializadas',
            modulo: 'inventario',
            tipoEvento: auditoria_types_1.TipoEvento.CREATE,
            tablaAfectada: 'unidades_serializadas',
            idEntidad: id,
            detalle: { numeroDeUnidades: unidadesCreadas },
        });
        res.status(201).json({
            ok: true,
            data: { unidadesCreadas },
            mensaje: `${unidadesCreadas} unidad(es) serializada(s) registrada(s)`,
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/inventario/movimientos
 * Registra un movimiento de inventario para productos granel.
 */
async function createMovimiento(req, res, next) {
    try {
        const dto = inventario_types_1.RegistrarMovimientoSchema.parse(req.body);
        const sucursalId = req.usuario.sucursalId;
        const usuarioId = req.usuario.id;
        await (0, inventario_service_1.registrarMovimiento)(dto, sucursalId, usuarioId);
        await (0, auditoria_context_1.registrarDesdeRequest)(req, {
            accion: 'Movimiento de inventario',
            modulo: 'inventario',
            tipoEvento: auditoria_types_1.TipoEvento.UPDATE,
            tablaAfectada: 'inventario_sucursal',
            idEntidad: dto.id_producto,
            detalle: { tipo_movimiento: dto.tipo_movimiento, cantidad: dto.cantidad },
        });
        res.status(201).json({ ok: true, mensaje: 'Movimiento registrado exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=inventario.controller.js.map