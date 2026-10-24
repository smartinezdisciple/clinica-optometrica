"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProveedoresList = getProveedoresList;
exports.createProveedor = createProveedor;
exports.getComprasList = getComprasList;
exports.getCompra = getCompra;
exports.createCompra = createCompra;
exports.addItems = addItems;
exports.changeCompraEstado = changeCompraEstado;
const repo = __importStar(require("./compras.repository"));
const manejo_errores_1 = require("../../middleware/manejo-errores");
const database_1 = require("../../config/database");
// ─── Proveedores ───────────────────────────────────────────────────────────────
async function getProveedoresList() {
    return repo.findProveedores();
}
async function createProveedor(dto) {
    return repo.insertProveedor(dto);
}
// ─── Compras ───────────────────────────────────────────────────────────────────
async function getComprasList() {
    return repo.findCompras();
}
async function getCompra(idCompra) {
    const compra = await repo.findCompraById(idCompra);
    if (!compra)
        throw new manejo_errores_1.AppError(404, 'La compra no existe');
    return compra;
}
/**
 * Resuelve el empleado ligado al usuario autenticado (requerido por `compras.id_empleado`).
 */
async function resolveEmpleadoId(usuarioId) {
    const result = await (0, database_1.query)('SELECT id_empleado FROM usuarios WHERE id_usuario = $1', [usuarioId]);
    if (!result.rows[0]) {
        throw new manejo_errores_1.AppError(400, 'El usuario no tiene un empleado asociado para registrar compras');
    }
    return result.rows[0].id_empleado;
}
async function createCompra(dto, usuarioId, sucursalId) {
    const empleadoId = await resolveEmpleadoId(usuarioId);
    try {
        return await repo.createCompraInTx({
            empleadoId,
            sucursalId,
            proveedorId: dto.id_proveedor,
            observaciones: dto.observaciones ?? null,
            recibida: dto.recibida,
            items: dto.items,
        });
    }
    catch (err) {
        throw traducirErrorInventario(err);
    }
}
async function addItems(idCompra, items, sucursalId) {
    try {
        const agregados = await repo.agregarItemsInTx(idCompra, sucursalId, items);
        return {
            id_compra: idCompra,
            items: agregados,
            compra: await repo.findCompraById(idCompra),
        };
    }
    catch (err) {
        throw traducirErrorInventario(err);
    }
}
async function changeCompraEstado(idCompra, estado) {
    await repo.updateEstadoCompra(idCompra, estado);
}
/**
 * Traduce errores de BD (duplicación de seriales) y reenvía los controlados.
 */
function traducirErrorInventario(err) {
    if (err instanceof manejo_errores_1.AppError)
        throw err;
    const code = err?.code;
    if (code === '23505') {
        throw new manejo_errores_1.AppError(409, 'Uno o más números de serie ya están registrados en el sistema');
    }
    throw err;
}
//# sourceMappingURL=compras.service.js.map