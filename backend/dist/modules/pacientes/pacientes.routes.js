"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pacientesRouter = void 0;
const express_1 = require("express");
const pacientes_controller_1 = require("./pacientes.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.pacientesRouter = (0, express_1.Router)();
exports.pacientesRouter.use(autenticacion_1.autenticar);
// Obtener listado de pacientes o buscar por texto
exports.pacientesRouter.get('/', pacientes_controller_1.list);
// Obtener un paciente por su ID
exports.pacientesRouter.get('/:id', pacientes_controller_1.getById);
// Registrar un nuevo paciente
exports.pacientesRouter.post('/', pacientes_controller_1.create);
// Actualizar un paciente existente
exports.pacientesRouter.put('/:id', pacientes_controller_1.update);
// Eliminar un paciente (solo Administradores)
exports.pacientesRouter.delete('/:id', (0, autenticacion_1.autorizar)('Administrador'), pacientes_controller_1.remove);
//# sourceMappingURL=pacientes.routes.js.map