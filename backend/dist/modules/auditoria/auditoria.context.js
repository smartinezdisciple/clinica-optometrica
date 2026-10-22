"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarDesdeRequest = registrarDesdeRequest;
const auditoria_service_1 = require("./auditoria.service");
/**
 * Extrae la IP de origen del request, contemplando proxies.
 */
function extraerIpOrigen(req) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
        return xff.split(',')[0].trim();
    }
    return req.ip ?? req.socket?.remoteAddress ?? null;
}
/**
 * Registra un evento de auditoría tomando el contexto (usuario, sucursal e IP)
 * automáticamente del request autenticado.
 *
 * Uso típico desde un servicio de negocio:
 *   await registrarDesdeRequest(req, {
 *     accion: 'Crear usuario',
 *     modulo: 'usuarios',
 *     tipoEvento: TipoEvento.CREATE,
 *     tablaAfectada: 'usuarios',
 *     idEntidad: idCreada,
 *     despues: { ...datosRelevantes },
 *   })
 */
async function registrarDesdeRequest(req, input) {
    const usuario = req.usuario;
    await (0, auditoria_service_1.registrar)({
        ...input,
        idUsuario: usuario?.id ?? null,
        idSucursal: usuario?.sucursalId ?? null,
        ipOrigen: extraerIpOrigen(req),
    });
}
//# sourceMappingURL=auditoria.context.js.map