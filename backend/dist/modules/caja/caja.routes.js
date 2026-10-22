"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cajaRouter = void 0;
const express_1 = require("express");
const autenticacion_1 = require("../../middleware/autenticacion");
const caja_controller_1 = require("./caja.controller");
exports.cajaRouter = (0, express_1.Router)();
exports.cajaRouter.use(autenticacion_1.autenticar);
exports.cajaRouter.get('/cajas', caja_controller_1.listCajasHandler);
exports.cajaRouter.post('/cajas', caja_controller_1.createCajaHandler);
exports.cajaRouter.patch('/cajas/:id/estado', caja_controller_1.toggleCajaHandler);
exports.cajaRouter.get('/cajas/:id/estado', caja_controller_1.estadoCajaHandler);
exports.cajaRouter.post('/cajas/:id/aperturas', caja_controller_1.abrirCajaHandler);
exports.cajaRouter.post('/cajas/:id/movimientos', caja_controller_1.movimientoHandler);
exports.cajaRouter.get('/cajas/:id/movimientos', caja_controller_1.movimientosHandler);
exports.cajaRouter.post('/cajas/:id/cierres', caja_controller_1.cierreHandler);
//# sourceMappingURL=caja.routes.js.map