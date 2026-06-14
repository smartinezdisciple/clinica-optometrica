"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sucursalesRouter = void 0;
const express_1 = require("express");
const sucursales_controller_1 = require("./sucursales.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.sucursalesRouter = (0, express_1.Router)();
// Todas las rutas de sucursales requieren autenticación
exports.sucursalesRouter.use(autenticacion_1.autenticar);
// GET /api/sucursales — Listar (lectura para cualquier rol autenticado)
exports.sucursalesRouter.get('/', sucursales_controller_1.listSucursales);
// GET /api/sucursales/:id — Obtener por ID (lectura para cualquier rol autenticado)
exports.sucursalesRouter.get('/:id', sucursales_controller_1.getSucursalById);
// Rutas de administración — Solo para Administradores
exports.sucursalesRouter.post('/', (0, autenticacion_1.autorizar)('Administrador'), sucursales_controller_1.create);
exports.sucursalesRouter.put('/:id', (0, autenticacion_1.autorizar)('Administrador'), sucursales_controller_1.update);
exports.sucursalesRouter.patch('/:id/estado', (0, autenticacion_1.autorizar)('Administrador'), sucursales_controller_1.toggleEstado);
//# sourceMappingURL=sucursales.routes.js.map