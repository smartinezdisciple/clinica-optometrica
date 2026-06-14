"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empleadosRouter = exports.usuariosRouter = void 0;
const express_1 = require("express");
const usuarios_controller_1 = require("./usuarios.controller");
const autenticacion_1 = require("../../middleware/autenticacion");
exports.usuariosRouter = (0, express_1.Router)();
// Rutas de administración de usuarios (Solo Administrador)
exports.usuariosRouter.get('/', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.listUsuarios);
exports.usuariosRouter.get('/roles', autenticacion_1.autenticar, usuarios_controller_1.listRoles);
exports.usuariosRouter.get('/permisos', autenticacion_1.autenticar, usuarios_controller_1.listPermisos);
exports.usuariosRouter.get('/roles/:id/permisos', autenticacion_1.autenticar, usuarios_controller_1.listRolPermisos);
exports.usuariosRouter.put('/roles/:id/permisos', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.updateRolPermisosHandler);
exports.usuariosRouter.get('/:id', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.getUsuarioById);
exports.usuariosRouter.post('/', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.createUsuario);
exports.usuariosRouter.put('/:id', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.updateUsuario);
exports.usuariosRouter.patch('/:id/estado', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.toggleEstadoUsuario);
exports.usuariosRouter.patch('/:id/desbloquear', autenticacion_1.autenticar, (0, autenticacion_1.autorizar)('Administrador'), usuarios_controller_1.unlockUser);
// Router de empleados
exports.empleadosRouter = (0, express_1.Router)();
exports.empleadosRouter.get('/', autenticacion_1.autenticar, usuarios_controller_1.listEmpleados);
// Nota: GET /empleados/:id se podría agregar si se requiere ver perfil de otro empleado
//# sourceMappingURL=usuarios.routes.js.map