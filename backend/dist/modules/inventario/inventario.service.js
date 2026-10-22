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
exports.getProductosInventario = getProductosInventario;
exports.getUnidadesSerializadas = getUnidadesSerializadas;
exports.crearProducto = crearProducto;
exports.registrarSeriales = registrarSeriales;
exports.registrarMovimiento = registrarMovimiento;
const repo = __importStar(require("./inventario.repository"));
const manejo_errores_1 = require("../../middleware/manejo-errores");
const TIPO_MAP = {
    marco_oftalmologico: 'Marco oftalmológico',
    gafas_sol: 'Gafas de sol',
    accesorio: 'Accesorio',
    lente_comercial: 'Lente comercial',
};
const MANEJO_MAP = {
    granel: 'Granel',
    serializado: 'Serializado',
};
/**
 * Listado del catálogo con etiquetas amigables para el frontend.
 */
async function getProductosInventario(sucursalId) {
    const productos = await repo.findProductosInventario(sucursalId);
    return mapProductos(productos);
}
function mapProductos(rows) {
    return rows.map((p) => ({
        ...p,
        tipo_producto_label: TIPO_MAP[p.tipo_producto] ?? p.tipo_producto,
        tipo_manejo_label: MANEJO_MAP[p.tipo_manejo] ?? p.tipo_manejo,
    }));
}
/**
 * Unidades serializadas de un producto (con estado y sucursal).
 */
async function getUnidadesSerializadas(productoId, sucursalId) {
    return repo.findUnidadesByProducto(sucursalId, productoId);
}
/**
 * Alta de un nuevo producto en el catálogo (granel o serializado).
 */
async function crearProducto(dto, sucursalId, usuarioId) {
    try {
        const { idProducto, unidadesCreadas } = await repo.createProductoInTx(dto, sucursalId, usuarioId);
        const productos = await repo.findProductosInventario(sucursalId);
        const creado = productos.find((p) => p.id_producto === idProducto);
        if (!creado) {
            throw new manejo_errores_1.AppError(500, 'No se pudo recuperar el producto creado');
        }
        return { producto: mapProductos([creado])[0], unidadesCreadas };
    }
    catch (err) {
        throw traducirErrorSeriales(err);
    }
}
/**
 * Registro de unidades serializadas adicionales (ingreso directo en inventario).
 */
async function registrarSeriales(productoId, seriales, sucursalId) {
    const manejo = await repo.findProductoManejo(productoId);
    if (manejo === null) {
        throw new manejo_errores_1.AppError(404, 'El producto no existe');
    }
    if (manejo !== 'serializado') {
        throw new manejo_errores_1.AppError(400, 'Este producto es de tipo granel; no requiere números de serie');
    }
    const limpios = [...new Set(seriales.map((s) => s.trim()))];
    if (limpios.length !== seriales.length) {
        throw new manejo_errores_1.AppError(400, 'Existen números de serie duplicados en la lista');
    }
    try {
        const creadas = await repo.insertSerialesByProducto(productoId, sucursalId, limpios);
        return { unidadesCreadas: creadas };
    }
    catch (err) {
        throw traducirErrorSeriales(err);
    }
}
/**
 * Registro de movimiento de inventario (granel). Rechaza productos serializados,
 * cuyos cambios de existencia se manejan por unidades (seriales).
 */
async function registrarMovimiento(dto, sucursalId, usuarioId) {
    const manejo = await repo.findProductoManejo(dto.id_producto);
    if (manejo === null) {
        throw new manejo_errores_1.AppError(404, 'El producto no existe');
    }
    if (manejo !== 'granel') {
        throw new manejo_errores_1.AppError(400, 'Los productos serializados usan unidades; registra seriales en lugar de movimientos');
    }
    await repo.crearMovimientoGranelInTx(dto.id_producto, sucursalId, usuarioId, dto.tipo_movimiento, dto.cantidad, dto.motivo ?? null);
}
/**
 * Traduce el error Postgres de unicidad (duplicado) a un 409 controlado.
 */
function traducirErrorSeriales(err) {
    if (err instanceof manejo_errores_1.AppError)
        throw err;
    // error code 23505 = unique_violation
    const code = err?.code;
    if (code === '23505') {
        throw new manejo_errores_1.AppError(409, 'Uno o más números de serie ya están registrados en el sistema');
    }
    throw err;
}
//# sourceMappingURL=inventario.service.js.map