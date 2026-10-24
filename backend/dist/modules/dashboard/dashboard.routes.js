"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.use(autenticacion_1.autenticar);
exports.dashboardRouter.get('/kpis', dashboard_controller_1.kpis);
exports.dashboardRouter.get('/ventas-mensuales', dashboard_controller_1.ventasMensuales);
exports.dashboardRouter.get('/proximas-citas', dashboard_controller_1.proximasCitas);
exports.dashboardRouter.get('/stock-bajo', dashboard_controller_1.stockBajo);
exports.dashboardRouter.get('/actividad-reciente', dashboard_controller_1.actividadReciente);
exports.dashboardRouter.get('/eficiencia-clinica', dashboard_controller_1.eficienciaClinica);
//# sourceMappingURL=dashboard.routes.js.map