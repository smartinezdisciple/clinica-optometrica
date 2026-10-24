"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarLogs = listarLogs;
exports.getLogById = getLogById;
exports.listarModulos = listarModulos;
const auditoria_types_1 = require("./auditoria.types");
const auditoria_service_1 = require("./auditoria.service");
/**
 * GET /api/auditoria
 * Lista los logs de auditoría con filtros y paginación.
 */
async function listarLogs(req, res, next) {
    try {
        const filtros = auditoria_types_1.ListarLogsQuerySchema.parse(req.query);
        const resultado = await (0, auditoria_service_1.listLogs)(filtros);
        res.status(200).json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/auditoria/:id
 */
async function getLogById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de log inválido' });
            return;
        }
        const log = await (0, auditoria_service_1.getLog)(id);
        res.status(200).json({ ok: true, data: log });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/auditoria/modulos
 * Lista los módulos con logs registrados (para poblar filtros del frontend).
 */
async function listarModulos(_req, res, next) {
    try {
        const modulos = await (0, auditoria_service_1.getModulosDisponibles)();
        res.status(200).json({ ok: true, data: modulos });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auditoria.controller.js.map