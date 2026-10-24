"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVentasHandler = getVentasHandler;
exports.getComprasHandler = getComprasHandler;
exports.getCitasHandler = getCitasHandler;
exports.getInventarioHandler = getInventarioHandler;
exports.exportarHandler = exportarHandler;
const reportes_types_1 = require("./reportes.types");
const reportes_service_1 = require("./reportes.service");
const reportes_export_1 = require("./reportes.export");
/** GET /api/reportes/ventas */
async function getVentasHandler(req, res, next) {
    try {
        const filtros = reportes_types_1.FiltrosReporteSchema.parse(req.query);
        const reporte = await (0, reportes_service_1.getReporteVentas)(filtros);
        res.status(200).json({ ok: true, data: reporte });
    }
    catch (err) {
        next(err);
    }
}
/** GET /api/reportes/compras */
async function getComprasHandler(req, res, next) {
    try {
        const filtros = reportes_types_1.FiltrosReporteSchema.parse(req.query);
        const reporte = await (0, reportes_service_1.getReporteCompras)(filtros);
        res.status(200).json({ ok: true, data: reporte });
    }
    catch (err) {
        next(err);
    }
}
/** GET /api/reportes/citas */
async function getCitasHandler(req, res, next) {
    try {
        const filtros = reportes_types_1.FiltrosReporteSchema.parse(req.query);
        const reporte = await (0, reportes_service_1.getReporteCitas)(filtros);
        res.status(200).json({ ok: true, data: reporte });
    }
    catch (err) {
        next(err);
    }
}
/** GET /api/reportes/inventario */
async function getInventarioHandler(req, res, next) {
    try {
        const filtros = reportes_types_1.FiltrosInventarioSchema.parse(req.query);
        const reporte = await (0, reportes_service_1.getReporteInventario)(filtros);
        res.status(200).json({ ok: true, data: reporte });
    }
    catch (err) {
        next(err);
    }
}
/** GET /api/reportes/export?tipo=&formato=&desde=&hasta=&id_sucursal= */
async function exportarHandler(req, res, next) {
    try {
        const { tipo, formato, ...filtrosInput } = reportes_types_1.ExportQuerySchema.parse(req.query);
        const filtros = (0, reportes_service_1.normalizarFiltros)(filtrosInput);
        const data = await (0, reportes_service_1.getReporte)(tipo, filtrosInput);
        const documento = (0, reportes_export_1.construirDocumento)(tipo, data, filtros);
        const nombre = `reporte-${tipo}-${filtros.desde}_${filtros.hasta}`;
        if (formato === 'csv') {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}.csv"`);
            res.status(200).send((0, reportes_export_1.generarCsv)(documento));
            return;
        }
        const pdf = await (0, reportes_export_1.generarPdf)(documento);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nombre}.pdf"`);
        res.status(200).send(pdf);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=reportes.controller.js.map