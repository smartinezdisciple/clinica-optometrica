"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaRouter = void 0;
const express_1 = require("express");
const auditoria_controller_1 = require("./auditoria.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.auditoriaRouter = (0, express_1.Router)();
// La auditoría es sensible: todos los endpoints requieren autenticación
// y el rol Administrador.
exports.auditoriaRouter.get('/', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), auditoria_controller_1.listarLogs);
exports.auditoriaRouter.get('/modulos', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), auditoria_controller_1.listarModulos);
exports.auditoriaRouter.get('/:id', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), auditoria_controller_1.getLogById);
//# sourceMappingURL=auditoria.routes.js.map