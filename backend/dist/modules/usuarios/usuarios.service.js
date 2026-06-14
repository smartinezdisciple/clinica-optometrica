"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsuariosList = getUsuariosList;
exports.getUsuario = getUsuario;
exports.registerUsuario = registerUsuario;
exports.modifyUsuario = modifyUsuario;
exports.changeUsuarioStatus = changeUsuarioStatus;
exports.unlockUsuario = unlockUsuario;
exports.getRolesList = getRolesList;
exports.getPermisosList = getPermisosList;
exports.getRolPermisos = getRolPermisos;
exports.assignRolPermisos = assignRolPermisos;
exports.getEmpleadosList = getEmpleadosList;
const bcrypt_1 = __importDefault(require("bcrypt"));
const manejo_errores_1 = require("../../middleware/manejo-errores");
const usuarios_repository_1 = require("./usuarios.repository");
/**
 * Obtiene el listado de todos los usuarios.
 */
async function getUsuariosList() {
    return (0, usuarios_repository_1.findAllUsuarios)();
}
/**
 * Obtiene el detalle de un usuario por su ID.
 */
async function getUsuario(id) {
    const usuario = await (0, usuarios_repository_1.findUsuarioDetalleById)(id);
    if (!usuario) {
        throw new manejo_errores_1.AppError(404, 'Usuario no encontrado');
    }
    return usuario;
}
/**
 * Registra un nuevo empleado y su respectivo usuario.
 */
async function registerUsuario(dto) {
    // 1. Validar nombre de usuario único
    const existe = await (0, usuarios_repository_1.findUsuarioByNombreUsuario)(dto.nombre_usuario);
    if (existe) {
        throw new manejo_errores_1.AppError(400, 'El nombre de usuario ya está registrado');
    }
    // 2. Encriptar contraseña
    const contrasenaHash = await bcrypt_1.default.hash(dto.contrasena, 12);
    // 3. Insertar transaccionalmente
    const idUsuario = await (0, usuarios_repository_1.insertUsuarioYEmpleadoTransaccion)(dto, contrasenaHash);
    // 4. Devolver detalle
    const result = await (0, usuarios_repository_1.findUsuarioDetalleById)(idUsuario);
    if (!result) {
        throw new manejo_errores_1.AppError(500, 'Error al registrar el usuario');
    }
    return result;
}
/**
 * Actualiza los datos de un usuario y de su empleado.
 */
async function modifyUsuario(id, dto) {
    const usuario = await (0, usuarios_repository_1.findUsuarioDetalleById)(id);
    if (!usuario) {
        throw new manejo_errores_1.AppError(404, 'Usuario no encontrado');
    }
    // Si cambia de nombre de usuario, verificar que sea único
    if (dto.nombre_usuario && dto.nombre_usuario !== usuario.nombre_usuario) {
        const existe = await (0, usuarios_repository_1.findUsuarioByNombreUsuario)(dto.nombre_usuario);
        if (existe) {
            throw new manejo_errores_1.AppError(400, 'El nombre de usuario ya está en uso');
        }
    }
    // Encriptar nueva contraseña si fue provista
    let contrasenaHash = undefined;
    if (dto.contrasena) {
        contrasenaHash = await bcrypt_1.default.hash(dto.contrasena, 12);
    }
    // Guardar cambios transaccionalmente
    await (0, usuarios_repository_1.updateUsuarioYEmpleadoTransaccion)(id, usuario.id_empleado, dto, contrasenaHash);
    const result = await (0, usuarios_repository_1.findUsuarioDetalleById)(id);
    if (!result) {
        throw new manejo_errores_1.AppError(500, 'Error al actualizar el usuario');
    }
    return result;
}
/**
 * Habilita/Inhabilita un usuario (baja lógica).
 */
async function changeUsuarioStatus(id, activo) {
    const usuario = await (0, usuarios_repository_1.findUsuarioDetalleById)(id);
    if (!usuario) {
        throw new manejo_errores_1.AppError(404, 'Usuario no encontrado');
    }
    await (0, usuarios_repository_1.toggleUsuarioEstado)(id, activo);
}
/**
 * Desbloquea un usuario.
 */
async function unlockUsuario(id) {
    const usuario = await (0, usuarios_repository_1.findUsuarioDetalleById)(id);
    if (!usuario) {
        throw new manejo_errores_1.AppError(404, 'Usuario no encontrado');
    }
    await (0, usuarios_repository_1.desbloquearUsuarioRepo)(id);
}
/**
 * Obtiene todos los roles disponibles.
 */
async function getRolesList() {
    return (0, usuarios_repository_1.findRoles)();
}
/**
 * Obtiene todos los permisos disponibles.
 */
async function getPermisosList() {
    return (0, usuarios_repository_1.findPermisos)();
}
/**
 * Obtiene los IDs de los permisos asignados a un rol.
 */
async function getRolPermisos(rolId) {
    return (0, usuarios_repository_1.findPermisosByRolId)(rolId);
}
/**
 * Asigna una nueva lista de permisos a un rol.
 */
async function assignRolPermisos(rolId, permisosIds) {
    await (0, usuarios_repository_1.updateRolPermisos)(rolId, permisosIds);
}
/**
 * Obtiene el listado de todos los empleados.
 */
async function getEmpleadosList() {
    return (0, usuarios_repository_1.findEmpleados)();
}
//# sourceMappingURL=usuarios.service.js.map