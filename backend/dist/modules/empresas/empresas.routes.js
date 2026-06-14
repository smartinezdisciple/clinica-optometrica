"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empresasRouter = void 0;
const express_1 = require("express");
const empresas_controller_1 = require("./empresas.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.empresasRouter = (0, express_1.Router)();
exports.empresasRouter.use(autenticacion_1.autenticar);
// Listado de empresas
exports.empresasRouter.get('/', empresas_controller_1.list);
// Obtener empresa por ID
exports.empresasRouter.get('/:id', empresas_controller_1.getById);
// Registrar empresa
exports.empresasRouter.post('/', empresas_controller_1.create);
// Actualizar empresa
exports.empresasRouter.put('/:id', empresas_controller_1.update);
// Eliminar empresa (solo administradores)
exports.empresasRouter.delete('/:id', (0, autenticacion_1.autorizar)('Administrador'), empresas_controller_1.remove);
//# sourceMappingURL=empresas.routes.js.map