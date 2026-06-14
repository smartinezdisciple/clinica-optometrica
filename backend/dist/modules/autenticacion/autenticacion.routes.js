"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticacionRouter = void 0;
const express_1 = require("express");
const autenticacion_controller_1 = require("./autenticacion.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.autenticacionRouter = (0, express_1.Router)();
// POST /api/auth/login — Pública
exports.autenticacionRouter.post('/login', autenticacion_controller_1.login);
// POST /api/auth/logout — Requiere JWT
exports.autenticacionRouter.post('/logout', autenticacion_1.autenticar, autenticacion_controller_1.logout);
// POST /api/auth/refresh — Pública (usa cookie)
exports.autenticacionRouter.post('/refresh', autenticacion_controller_1.refresh);
// GET /api/auth/verificar — Requiere JWT
exports.autenticacionRouter.get('/verificar', autenticacion_1.autenticar, autenticacion_controller_1.verificar);
// POST /api/auth/recuperar-contrasena — Pública
exports.autenticacionRouter.post('/recuperar-contrasena', autenticacion_controller_1.recuperarContrasena);
// POST /api/auth/restablecer-contrasena — Pública
exports.autenticacionRouter.post('/restablecer-contrasena', autenticacion_controller_1.restablecerContrasena);
//# sourceMappingURL=autenticacion.routes.js.map