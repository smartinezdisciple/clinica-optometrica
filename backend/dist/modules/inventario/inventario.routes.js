"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventarioRouter = void 0;
const express_1 = require("express");
const inventario_controller_1 = require("./inventario.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.inventarioRouter = (0, express_1.Router)();
exports.inventarioRouter.use(autenticacion_1.autenticar);
// Catálogo de productos
exports.inventarioRouter.get('/productos', inventario_controller_1.list);
exports.inventarioRouter.post('/productos', inventario_controller_1.createProducto);
// Unidades serializadas
exports.inventarioRouter.get('/productos/:id/seriales', inventario_controller_1.listSeriales);
exports.inventarioRouter.post('/productos/:id/seriales', inventario_controller_1.addSeriales);
// Movimientos (granel)
exports.inventarioRouter.post('/movimientos', inventario_controller_1.createMovimiento);
//# sourceMappingURL=inventario.routes.js.map