"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ventasRouter = void 0;
const express_1 = require("express");
const autenticacion_1 = require("../../middleware/autenticacion");
const ventas_controller_1 = require("./ventas.controller");
exports.ventasRouter = (0, express_1.Router)();
exports.ventasRouter.use(autenticacion_1.autenticar);
// Catálogos y consultas específicas (antes de /:id para no colisionar)
exports.ventasRouter.get('/metodos-pago', ventas_controller_1.listMetodosPago);
exports.ventasRouter.get('/productos-disponibles', ventas_controller_1.listProductosVendibles);
exports.ventasRouter.get('/seriales-disponibles', ventas_controller_1.listSerialesDisponibles);
exports.ventasRouter.get('/resumen', ventas_controller_1.resumenVentas);
// Ventas
exports.ventasRouter.get('/', ventas_controller_1.listarVentas);
exports.ventasRouter.post('/', ventas_controller_1.crearVentaHandler);
exports.ventasRouter.get('/:id', ventas_controller_1.getVentaById);
exports.ventasRouter.patch('/:id/estado', ventas_controller_1.cambiarEstadoHandler);
//# sourceMappingURL=ventas.routes.js.map