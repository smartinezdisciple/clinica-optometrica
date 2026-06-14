"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
const empresas_types_1 = require("./empresas.types");
const empresas_service_1 = require("./empresas.service");
/**
 * GET /api/empresas
 */
async function list(req, res, next) {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const empresas = await (0, empresas_service_1.getEmpresas)(search);
        res.status(200).json({ ok: true, data: empresas });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/empresas/:id
 */
async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de empresa inválido' });
            return;
        }
        const empresa = await (0, empresas_service_1.getEmpresaById)(id);
        res.status(200).json({ ok: true, data: empresa });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/empresas
 */
async function create(req, res, next) {
    try {
        const dto = empresas_types_1.EmpresaSchema.parse(req.body);
        const empresa = await (0, empresas_service_1.createEmpresa)(dto);
        res.status(201).json({
            ok: true,
            data: empresa,
            mensaje: 'Empresa registrada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/empresas/:id
 */
async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de empresa inválido' });
            return;
        }
        const dto = empresas_types_1.EmpresaSchema.partial().parse(req.body);
        const empresa = await (0, empresas_service_1.updateEmpresa)(id, dto);
        res.status(200).json({
            ok: true,
            data: empresa,
            mensaje: 'Empresa actualizada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * DELETE /api/empresas/:id
 */
async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de empresa inválido' });
            return;
        }
        await (0, empresas_service_1.deleteEmpresa)(id);
        res.status(200).json({
            ok: true,
            mensaje: 'Empresa eliminada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=empresas.controller.js.map