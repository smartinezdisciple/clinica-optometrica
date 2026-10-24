"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportesRouter = void 0;
const express_1 = require("express");
const autenticacion_1 = require("../../middleware/autenticacion");
const reportes_controller_1 = require("./reportes.controller");
exports.reportesRouter = (0, express_1.Router)();
// Los reportes contienen información financiera: solo Administrador.
exports.reportesRouter.use(autenticacion_1.autenticar);
exports.reportesRouter.use((0, autenticacion_1.autorizar)('Administrador'));
exports.reportesRouter.get('/ventas', reportes_controller_1.getVentasHandler);
exports.reportesRouter.get('/compras', reportes_controller_1.getComprasHandler);
exports.reportesRouter.get('/citas', reportes_controller_1.getCitasHandler);
exports.reportesRouter.get('/inventario', reportes_controller_1.getInventarioHandler);
exports.reportesRouter.get('/export', reportes_controller_1.exportarHandler);
//# sourceMappingURL=reportes.routes.js.map