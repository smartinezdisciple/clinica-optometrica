"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsuarios = listUsuarios;
exports.getUsuarioById = getUsuarioById;
exports.createUsuario = createUsuario;
exports.updateUsuario = updateUsuario;
exports.toggleEstadoUsuario = toggleEstadoUsuario;
exports.unlockUser = unlockUser;
exports.listRoles = listRoles;
exports.listPermisos = listPermisos;
exports.listRolPermisos = listRolPermisos;
exports.updateRolPermisosHandler = updateRolPermisosHandler;
exports.listEmpleados = listEmpleados;
const usuarios_types_1 = require("./usuarios.types");
const usuarios_service_1 = require("./usuarios.service");
const zod_1 = require("zod");
const ToggleEstadoSchema = zod_1.z.object({
    activo: zod_1.z.boolean({ required_error: 'El campo activo es requerido' }),
});
const PermisosRolSchema = zod_1.z.object({
    permisosIds: zod_1.z.array(zod_1.z.number(), { required_error: 'La lista de permisosIds es requerida' }),
});
/**
 * GET /api/usuarios
 */
async function listUsuarios(_req, res, next) {
    try {
        const usuarios = await (0, usuarios_service_1.getUsuariosList)();
        res.status(200).json({ ok: true, data: usuarios });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/usuarios/:id
 */
async function getUsuarioById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de usuario inválido' });
            return;
        }
        const usuario = await (0, usuarios_service_1.getUsuario)(id);
        res.status(200).json({ ok: true, data: usuario });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/usuarios
 */
async function createUsuario(req, res, next) {
    try {
        const dto = usuarios_types_1.CrearUsuarioSchema.parse(req.body);
        const usuario = await (0, usuarios_service_1.registerUsuario)(dto);
        res.status(201).json({
            ok: true,
            data: usuario,
            mensaje: 'Empleado y usuario creados exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/usuarios/:id
 */
async function updateUsuario(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de usuario inválido' });
            return;
        }
        const dto = usuarios_types_1.ActualizarUsuarioSchema.parse(req.body);
        const usuario = await (0, usuarios_service_1.modifyUsuario)(id, dto);
        res.status(200).json({
            ok: true,
            data: usuario,
            mensaje: 'Usuario actualizado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/usuarios/:id/estado
 */
async function toggleEstadoUsuario(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de usuario inválido' });
            return;
        }
        const { activo } = ToggleEstadoSchema.parse(req.body);
        await (0, usuarios_service_1.changeUsuarioStatus)(id, activo);
        res.status(200).json({
            ok: true,
            mensaje: activo ? 'Usuario habilitado exitosamente' : 'Usuario inhabilitado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/usuarios/:id/desbloquear
 */
async function unlockUser(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de usuario inválido' });
            return;
        }
        await (0, usuarios_service_1.unlockUsuario)(id);
        res.status(200).json({ ok: true, mensaje: 'Usuario desbloqueado exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/usuarios/roles
 */
async function listRoles(_req, res, next) {
    try {
        const roles = await (0, usuarios_service_1.getRolesList)();
        res.status(200).json({ ok: true, data: roles });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/usuarios/permisos
 */
async function listPermisos(_req, res, next) {
    try {
        const permisos = await (0, usuarios_service_1.getPermisosList)();
        res.status(200).json({ ok: true, data: permisos });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/usuarios/roles/:id/permisos
 */
async function listRolPermisos(req, res, next) {
    try {
        const rolId = parseInt(req.params.id, 10);
        if (isNaN(rolId)) {
            res.status(400).json({ ok: false, error: 'ID de rol inválido' });
            return;
        }
        const permisos = await (0, usuarios_service_1.getRolPermisos)(rolId);
        res.status(200).json({ ok: true, data: permisos });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/usuarios/roles/:id/permisos
 */
async function updateRolPermisosHandler(req, res, next) {
    try {
        const rolId = parseInt(req.params.id, 10);
        if (isNaN(rolId)) {
            res.status(400).json({ ok: false, error: 'ID de rol inválido' });
            return;
        }
        const { permisosIds } = PermisosRolSchema.parse(req.body);
        await (0, usuarios_service_1.assignRolPermisos)(rolId, permisosIds);
        res.status(200).json({ ok: true, mensaje: 'Permisos del rol actualizados exitosamente' });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/empleados
 */
async function listEmpleados(_req, res, next) {
    try {
        const empleados = await (0, usuarios_service_1.getEmpleadosList)();
        res.status(200).json({ ok: true, data: empleados });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=usuarios.controller.js.map