"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrar = registrar;
exports.getLog = getLog;
exports.listLogs = listLogs;
exports.getModulosDisponibles = getModulosDisponibles;
const auditoria_repository_1 = require("./auditoria.repository");
const manejo_errores_1 = require("../../middleware/manejo-errores");
/**
 * Registra un evento de auditoría en la tabla logs_sistema.
 * Método diseñado para ser invocado de forma explícita desde las
 * operaciones de negocio relevantes (crear/editar/eliminar/login...).
 *
 * No lanza errores: si el registro falla, se registra por consola para
 * no interrumpir la operación de negocio principal.
 */
async function registrar(input) {
    try {
        await (0, auditoria_repository_1.insertLog)(input);
    }
    catch (err) {
        console.error('❌  Error registrando auditoría:', err.message);
    }
}
/**
 * Obtiene un log de auditoría por su ID.
 */
async function getLog(id) {
    const log = await (0, auditoria_repository_1.findLogById)(id);
    if (!log) {
        throw new manejo_errores_1.AppError(404, 'Registro de auditoría no encontrado');
    }
    return log;
}
/**
 * Lista los logs de auditoría aplicando filtros y paginación.
 */
async function listLogs(filtros) {
    return (0, auditoria_repository_1.findLogs)(filtros);
}
/**
 * Devuelve los módulos y tipos de evento existentes para poblar filtros.
 */
async function getModulosDisponibles() {
    return (0, auditoria_repository_1.findModulosRegistrados)();
}
//# sourceMappingURL=auditoria.service.js.map