"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSucursalesList = getSucursalesList;
exports.getSucursal = getSucursal;
exports.registerSucursal = registerSucursal;
exports.modifySucursal = modifySucursal;
exports.changeSucursalStatus = changeSucursalStatus;
const manejo_errores_1 = require("../../middleware/manejo-errores");
const sucursales_repository_1 = require("./sucursales.repository");
/**
 * Servicio para listar todas las sucursales.
 */
async function getSucursalesList(soloActivas = false) {
    return (0, sucursales_repository_1.findAllSucursales)(soloActivas);
}
/**
 * Servicio para obtener una sucursal por ID.
 */
async function getSucursal(id) {
    const sucursal = await (0, sucursales_repository_1.findSucursalById)(id);
    if (!sucursal) {
        throw new manejo_errores_1.AppError(404, 'La sucursal no existe o no fue encontrada');
    }
    return sucursal;
}
/**
 * Servicio para crear una sucursal.
 */
async function registerSucursal(dto) {
    return (0, sucursales_repository_1.createSucursal)(dto);
}
/**
 * Servicio para actualizar una sucursal existente.
 */
async function modifySucursal(id, dto) {
    const sucursal = await (0, sucursales_repository_1.updateSucursal)(id, dto);
    if (!sucursal) {
        throw new manejo_errores_1.AppError(404, 'La sucursal no existe o no pudo ser actualizada');
    }
    return sucursal;
}
/**
 * Servicio para cambiar el estado activo de la sucursal.
 */
async function changeSucursalStatus(id, activa) {
    const sucursal = await (0, sucursales_repository_1.toggleSucursalEstado)(id, activa);
    if (!sucursal) {
        throw new manejo_errores_1.AppError(404, 'La sucursal no existe o no pudo ser modificada');
    }
    return sucursal;
}
//# sourceMappingURL=sucursales.service.js.map