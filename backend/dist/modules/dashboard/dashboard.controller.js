"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kpis = kpis;
exports.ventasMensuales = ventasMensuales;
exports.proximasCitas = proximasCitas;
exports.stockBajo = stockBajo;
exports.actividadReciente = actividadReciente;
exports.eficienciaClinica = eficienciaClinica;
const dashboard_service_1 = require("./dashboard.service");
async function kpis(_req, res, next) {
    try {
        const data = await (0, dashboard_service_1.obtenerDashboardKpis)();
        res.status(200).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function ventasMensuales(_req, res, next) {
    try {
        const data = await (0, dashboard_service_1.obtenerVentasMensuales)();
        res.status(200).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function proximasCitas(_req, res, next) {
    try {
        const data = await (0, dashboard_service_1.obtenerProximasCitas)();
        res.status(200).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function stockBajo(_req, res, next) {
    try {
        const data = await (0, dashboard_service_1.obtenerStockBajo)();
        res.status(200).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function actividadReciente(_req, res, next) {
    try {
        const data = await (0, dashboard_service_1.obtenerActividadReciente)();
        res.status(200).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function eficienciaClinica(_req, res, next) {
    try {
        const data = await (0, dashboard_service_1.obtenerEficienciaClinica)();
        res.status(200).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=dashboard.controller.js.map