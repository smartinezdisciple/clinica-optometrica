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
exports.getMetodosPago = getMetodosPago;
exports.getProductosVendibles = getProductosVendibles;
exports.getSerialesDisponibles = getSerialesDisponibles;
exports.getVentas = getVentas;
exports.getVenta = getVenta;
exports.getResumen = getResumen;
exports.crearVenta = crearVenta;
exports.cambiarEstadoVenta = cambiarEstadoVenta;
const repo = __importStar(require("./ventas.repository"));
const database_1 = require("../../config/database");
const manejo_errores_1 = require("../../middleware/manejo-errores");
// ─── Catálogos ─────────────────────────────────────────────────────────────────
async function getMetodosPago() {
    return repo.findMetodosPago();
}
async function getProductosVendibles(sucursalId) {
    return repo.findProductosVendibles(sucursalId);
}
async function getSerialesDisponibles(productoId, sucursalId) {
    return repo.findSerialesDisponibles(productoId, sucursalId);
}
// ─── Consultas ─────────────────────────────────────────────────────────────────
async function getVentas(filtros) {
    return repo.findVentas(filtros);
}
async function getVenta(idVenta) {
    const venta = await repo.findVentaById(idVenta);
    if (!venta)
        throw new manejo_errores_1.AppError(404, 'La venta no existe');
    return venta;
}
async function getResumen(filtros) {
    return repo.getResumenVentas(filtros);
}
// ─── Creación de venta ─────────────────────────────────────────────────────────
/**
 * Resuelve el empleado ligado al usuario autenticado (requerido por
 * `ventas.id_empleado`; además el trigger de inventario usa la sucursal del empleado).
 */
async function resolveEmpleadoId(usuarioId) {
    const result = await (0, database_1.query)('SELECT id_empleado FROM usuarios WHERE id_usuario = $1', [usuarioId]);
    if (!result.rows[0]?.id_empleado) {
        throw new manejo_errores_1.AppError(400, 'El usuario no tiene un empleado asociado para registrar ventas');
    }
    return result.rows[0].id_empleado;
}
/**
 * Registra una venta finalizada con su pago.
 *
 * Valida cliente, método de pago y cada ítem (existencia, stock y unidades
 * serializadas disponibles). El inventario y los totales los calcula la BD.
 */
async function crearVenta(dto, usuarioId, sucursalId) {
    const empleadoId = await resolveEmpleadoId(usuarioId);
    const metodo = await repo.findMetodoPagoActivo(dto.id_metodo_pago);
    if (!metodo)
        throw new manejo_errores_1.AppError(400, 'El método de pago no existe o está inactivo');
    if (!(await repo.existeCliente(dto.id_cliente))) {
        throw new manejo_errores_1.AppError(400, 'El cliente seleccionado no existe');
    }
    const items = await resolverItems(dto.items, sucursalId);
    const suma = items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0);
    const descuentoAplicado = redondear(suma * (dto.descuento_porcentaje / 100));
    try {
        return await repo.createVentaInTx({
            clienteId: dto.id_cliente,
            empleadoId,
            usuarioId,
            sucursalId,
            descuentoAplicado,
            nota: dto.nota ?? null,
            metodoPagoId: dto.id_metodo_pago,
            referenciaPago: dto.referencia_pago ?? null,
            items,
        });
    }
    catch (err) {
        throw traducirErrorVenta(err);
    }
}
/**
 * Resuelve y valida cada línea del carrito contra el catálogo y el stock.
 * - Granel: valida stock disponible (sumando cantidades repetidas por producto).
 * - Serializado: exige una unidad disponible del producto solicitado.
 */
async function resolverItems(items, sucursalId) {
    const resueltos = [];
    const requeridoGranel = new Map();
    for (const item of items) {
        const producto = await repo.findProductoVenta(item.id_producto);
        if (!producto)
            throw new manejo_errores_1.AppError(404, `El producto ${item.id_producto} no existe`);
        if (!producto.activo)
            throw new manejo_errores_1.AppError(400, `El producto '${producto.nombre_producto}' está inactivo`);
        if (producto.tipo_manejo === 'granel') {
            const acumulado = requeridoGranel.get(item.id_producto);
            if (acumulado) {
                acumulado.cantidad += item.cantidad;
            }
            else {
                requeridoGranel.set(item.id_producto, { cantidad: item.cantidad, nombre: producto.nombre_producto });
            }
            resueltos.push({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: producto.precio_venta,
                id_unidad_serializada: null,
            });
            continue;
        }
        // Serializado: una línea por unidad
        if (!item.id_unidad_serializada) {
            throw new manejo_errores_1.AppError(400, `El producto serializado '${producto.nombre_producto}' requiere seleccionar una unidad`);
        }
        const unidad = await repo.findUnidadVenta(item.id_unidad_serializada);
        if (!unidad)
            throw new manejo_errores_1.AppError(404, 'La unidad serializada no existe');
        if (unidad.id_producto !== item.id_producto) {
            throw new manejo_errores_1.AppError(400, 'La unidad serializada no corresponde al producto seleccionado');
        }
        if (unidad.estado !== 'disponible') {
            throw new manejo_errores_1.AppError(409, `La unidad ${item.id_unidad_serializada} no está disponible`);
        }
        resueltos.push({
            id_producto: null,
            cantidad: 1,
            precio_unitario: producto.precio_venta,
            id_unidad_serializada: item.id_unidad_serializada,
        });
    }
    // Verificación previa de stock granel (el trigger valida de forma definitiva)
    for (const [idProducto, { cantidad, nombre }] of requeridoGranel) {
        const stock = await repo.getStockGranel(idProducto, sucursalId);
        if (stock < cantidad) {
            throw new manejo_errores_1.AppError(409, `Stock insuficiente de '${nombre}'. Disponible: ${stock}, solicitado: ${cantidad}`);
        }
    }
    return resueltos;
}
// ─── Cambio de estado ──────────────────────────────────────────────────────────
async function cambiarEstadoVenta(idVenta, estado, usuarioId) {
    await repo.updateEstadoVenta(idVenta, estado, usuarioId);
}
// ─── Utilidades ────────────────────────────────────────────────────────────────
function redondear(valor) {
    return Math.round(valor * 100) / 100;
}
/**
 * Traduce errores de BD a respuestas controladas.
 * - 23505 unique_violation
 * - 23514 check_violation
 * - P0001 raise_exception (triggers de stock)
 */
function traducirErrorVenta(err) {
    if (err instanceof manejo_errores_1.AppError)
        throw err;
    const code = err?.code;
    if (code === '23505') {
        throw new manejo_errores_1.AppError(409, 'Conflicto de datos al registrar la venta');
    }
    if (code === '23514') {
        throw new manejo_errores_1.AppError(409, 'Los datos de la venta no cumplen las reglas del sistema');
    }
    if (code === 'P0001') {
        const mensaje = err.message ?? 'No se pudo completar la venta';
        throw new manejo_errores_1.AppError(409, mensaje);
    }
    throw err;
}
//# sourceMappingURL=ventas.service.js.map