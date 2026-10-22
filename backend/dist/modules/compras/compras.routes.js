"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comprasRouter = void 0;
const express_1 = require("express");
const autenticacion_1 = require("../../middleware/autenticacion");
const compras_controller_1 = require("./compras.controller");
exports.comprasRouter = (0, express_1.Router)();
exports.comprasRouter.use(autenticacion_1.autenticar);
// Proveedores
exports.comprasRouter.get('/proveedores', compras_controller_1.listProveedores);
exports.comprasRouter.post('/proveedores', compras_controller_1.createProveedorHandler);
// Compras / órdenes de compra
exports.comprasRouter.get('/', compras_controller_1.listCompras);
exports.comprasRouter.post('/', compras_controller_1.createCompraHandler);
exports.comprasRouter.get('/:id', compras_controller_1.getCompraById);
exports.comprasRouter.post('/:id/items', compras_controller_1.addItemsHandler);
exports.comprasRouter.patch('/:id/estado', compras_controller_1.changeEstadoHandler);
//# sourceMappingURL=compras.routes.js.map