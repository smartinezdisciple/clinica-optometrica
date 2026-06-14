"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSucursales = listSucursales;
exports.getSucursalById = getSucursalById;
exports.create = create;
exports.update = update;
exports.toggleEstado = toggleEstado;
const sucursales_types_1 = require("./sucursales.types");
const sucursales_service_1 = require("./sucursales.service");
const zod_1 = require("zod");
const ToggleEstadoSchema = zod_1.z.object({
    activa: zod_1.z.boolean({ required_error: 'El campo activa es requerido' }),
});
/**
 * GET /api/sucursales
 */
async function listSucursales(req, res, next) {
    try {
        const soloActivas = req.query.activas === 'true';
        const sucursales = await (0, sucursales_service_1.getSucursalesList)(soloActivas);
        res.status(200).json({ ok: true, data: sucursales });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/sucursales/:id
 */
async function getSucursalById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de sucursal inválido' });
            return;
        }
        const sucursal = await (0, sucursales_service_1.getSucursal)(id);
        res.status(200).json({ ok: true, data: sucursal });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/sucursales
 */
async function create(req, res, next) {
    try {
        const dto = sucursales_types_1.SucursalSchema.parse(req.body);
        const sucursal = await (0, sucursales_service_1.registerSucursal)(dto);
        res.status(201).json({
            ok: true,
            data: sucursal,
            mensaje: 'Sucursal creada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/sucursales/:id
 */
async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de sucursal inválido' });
            return;
        }
        const dto = sucursales_types_1.SucursalSchema.parse(req.body);
        const sucursal = await (0, sucursales_service_1.modifySucursal)(id, dto);
        res.status(200).json({
            ok: true,
            data: sucursal,
            mensaje: 'Sucursal actualizada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/sucursales/:id/estado
 */
async function toggleEstado(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de sucursal inválido' });
            return;
        }
        const { activa } = ToggleEstadoSchema.parse(req.body);
        const sucursal = await (0, sucursales_service_1.changeSucursalStatus)(id, activa);
        res.status(200).json({
            ok: true,
            data: sucursal,
            mensaje: activa ? 'Sucursal activada exitosamente' : 'Sucursal desactivada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=sucursales.controller.js.map