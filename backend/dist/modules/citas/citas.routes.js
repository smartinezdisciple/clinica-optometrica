"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citasRouter = void 0;
const express_1 = require("express");
const citas_controller_1 = require("./citas.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.citasRouter = (0, express_1.Router)();
// Todas las rutas requieren estar autenticado
exports.citasRouter.use(autenticacion_1.autenticar);
// ─── Citas CRUD ──────────────────────────────────────────────────────────────
exports.citasRouter.get('/', citas_controller_1.list);
exports.citasRouter.get('/disponibilidad', citas_controller_1.listDisponibilidad);
exports.citasRouter.get('/:id', citas_controller_1.getById);
exports.citasRouter.post('/', citas_controller_1.create);
exports.citasRouter.put('/:id', citas_controller_1.update);
exports.citasRouter.patch('/:id/estado', citas_controller_1.patchEstado);
// ─── Horarios de Atención CRUD (Administración / Configuración) ──────────────
exports.citasRouter.get('/horarios/todos', citas_controller_1.listHorarios);
exports.citasRouter.post('/horarios', (0, autenticacion_1.autorizar)('Administrador'), citas_controller_1.addHorario);
exports.citasRouter.put('/horarios/:id', (0, autenticacion_1.autorizar)('Administrador'), citas_controller_1.modifyHorario);
exports.citasRouter.delete('/horarios/:id', (0, autenticacion_1.autorizar)('Administrador'), citas_controller_1.removeHorario);
//# sourceMappingURL=citas.routes.js.map