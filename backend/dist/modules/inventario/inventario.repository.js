"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProductosInventario = findProductosInventario;
exports.findUnidadesByProducto = findUnidadesByProducto;
exports.findProductoManejo = findProductoManejo;
exports.findProductoById = findProductoById;
exports.createProductoInTx = createProductoInTx;
exports.insertSerialesByProducto = insertSerialesByProducto;
exports.crearMovimientoGranelInTx = crearMovimientoGranelInTx;
const database_1 = require("../../config/database");
const manejo_errores_1 = require("../../middleware/manejo-errores");
/**
 * Obtiene el catálogo de productos activos de la sucursal (granel y serializados).
 * Para productos serializados, la cantidad mostrada es el conteo de unidades
 * disponibles; para granel, el valor de `inventario_sucursal.cantidad`.
 */
async function findProductosInventario(sucursalId) {
    const result = await (0, database_1.query)(`SELECT
        p.id_producto,
        ROW_NUMBER() OVER (ORDER BY p.nombre_producto)::text AS enumeracion,
        p.nombre_producto,
        p.tipo_producto,
        p.tipo_manejo,
        p.precio_venta,
        CASE WHEN p.tipo_manejo = 'serializado'
             THEN COALESCE(cant_serial.cnt, 0)
             ELSE COALESCE(inv.cantidad, 0)
        END AS cantidad,
        CASE WHEN p.tipo_manejo = 'serializado' THEN NULL ELSE inv.cantidad END AS cantidad_granel,
        CASE WHEN p.tipo_manejo = 'serializado' THEN COALESCE(cant_serial.cnt, 0) ELSE NULL END AS cantidad_serializada,
        e.nombres || ' ' || e.apellidos AS ingresado_por,
        m.fecha_movimiento AS fecha_ingreso,
        mo.marca
      FROM productos p
      LEFT JOIN inventario_sucursal inv
        ON inv.id_producto = p.id_producto AND inv.id_sucursal = $1
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM unidades_serializadas u2
        WHERE u2.id_producto = p.id_producto
          AND u2.estado = 'disponible'
          AND (u2.id_sucursal = $1 OR u2.id_sucursal IS NULL)
      ) cant_serial ON TRUE
      LEFT JOIN LATERAL (
        SELECT mi.id_usuario, mi.fecha_movimiento
        FROM movimientos_inventario mi
        WHERE mi.id_producto = p.id_producto
          AND mi.tipo_movimiento = 'entrada'
        ORDER BY mi.fecha_movimiento DESC
        LIMIT 1
      ) m ON TRUE
      LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario
      LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
      LEFT JOIN marcos_oftalmologicos mo ON mo.id_producto = p.id_producto
      WHERE p.activo = TRUE
      ORDER BY p.nombre_producto`, [sucursalId]);
    return result.rows;
}
/**
 * Obtiene las unidades serializadas de un producto en la sucursal, con su estado.
 */
async function findUnidadesByProducto(sucursalId, productoId) {
    const result = await (0, database_1.query)(`SELECT
        u.id_unidad,
        u.numero_serie,
        u.estado,
        u.fecha_ingreso,
        u.fecha_venta,
        u.id_sucursal,
        s.nombre AS nombre_sucursal
      FROM unidades_serializadas u
      LEFT JOIN sucursales s ON s.id_sucursal = u.id_sucursal
      WHERE u.id_producto = $1
        AND (u.id_sucursal = $2 OR u.id_sucursal IS NULL)
      ORDER BY u.fecha_ingreso DESC, u.id_unidad DESC`, [productoId, sucursalId]);
    return result.rows;
}
/**
 * Verifica que un producto exista y devuelve su tipo de manejo.
 */
async function findProductoManejo(productoId) {
    const result = await (0, database_1.query)('SELECT tipo_manejo, nombre_producto FROM productos WHERE id_producto = $1', [productoId]);
    return result.rows[0]?.tipo_manejo ?? null;
}
function findProductoById(productoId) {
    return (0, database_1.query)('SELECT id_producto FROM productos WHERE id_producto = $1', [productoId]).then((r) => r.rows.length > 0);
}
/**
 * Crea un producto en transacción. Para granel registra stock inicial;
 * para serializado registra las unidades iniciales (número de serie).
 * Devuelve el id y el conteo de unidades creadas.
 */
async function createProductoInTx(dto, sucursalId, usuarioId) {
    return (0, database_1.withTransaction)(async (client) => {
        const insert = await client.query(`INSERT INTO productos
          (nombre_producto, codigo_producto, descripcion_producto, tipo_producto, tipo_manejo, precio_venta, precio_compra)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_producto`, [
            dto.nombre_producto,
            dto.codigo_producto ?? null,
            dto.descripcion_producto ?? null,
            dto.tipo_producto,
            dto.tipo_manejo,
            dto.precio_venta,
            dto.precio_compra ?? null,
        ]);
        const idProducto = insert.rows[0].id_producto;
        if (dto.tipo_producto === 'marco_oftalmologico') {
            await client.query(`INSERT INTO marcos_oftalmologicos (marca, id_producto) VALUES ($1, $2)`, [dto.marca ?? null, idProducto]);
        }
        let unidadesCreadas = 0;
        if (dto.tipo_manejo === 'granel' && (dto.stock_inicial ?? 0) > 0) {
            await sumarStockGrand(client, idProducto, sucursalId, dto.stock_inicial, 'Stock inicial', usuarioId);
        }
        else if (dto.tipo_manejo === 'serializado' && dto.seriales && dto.seriales.length > 0) {
            unidadesCreadas = await insertSeriales(client, idProducto, sucursalId, dto.seriales);
        }
        return { idProducto, unidadesCreadas };
    });
}
/**
 * Registra unidades serializadas de un producto ya existente (ingreso directo).
 */
async function insertSerialesByProducto(productoId, sucursalId, seriales) {
    return (0, database_1.withTransaction)(async (client) => insertSeriales(client, productoId, sucursalId, seriales));
}
/**
 * Inserta unidades serializadas dentro de una transacción ya abierta.
 * Lanza la excepción nativa de Postgres (unique_violation) que el service traduce.
 */
async function insertSeriales(client, productoId, sucursalId, seriales) {
    const ids = [];
    for (const serie of seriales) {
        const r = await client.query(`INSERT INTO unidades_serializadas (numero_serie, estado, id_producto, id_sucursal)
       VALUES ($1, 'disponible', $2, $3)
       RETURNING id_unidad`, [serie, productoId, sucursalId]);
        ids.push(r.rows[0].id_unidad);
    }
    return ids.length;
}
/**
 * Suma stock de un producto granel (upsert en inventario_sucursal + movimiento).
 */
async function sumarStockGrand(client, productoId, sucursalId, cantidad, motivo, usuarioId) {
    await client.query(`INSERT INTO inventario_sucursal (id_producto, id_sucursal, cantidad)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_producto, id_sucursal)
     DO UPDATE SET cantidad = inventario_sucursal.cantidad + EXCLUDED.cantidad`, [productoId, sucursalId, cantidad]);
    await client.query(`INSERT INTO movimientos_inventario (tipo_movimiento, cantidad, motivo, id_producto, id_sucursal, id_usuario)
     VALUES ('entrada', $1, $2, $3, $4, $5)`, [cantidad, motivo, productoId, sucursalId, usuarioId]);
}
/**
 * Registra un movimiento de inventario para productos granel.
 * - entrada:     +cantidad
 * - salida/perdida: -cantidad (requiere stock suficiente)
 * - ajuste:      cantidad con signo (positivo suma, negativo resta)
 */
async function crearMovimientoGranelInTx(productoId, sucursalId, usuarioId, tipoMovimiento, cantidad, motivo) {
    await (0, database_1.withTransaction)(async (client) => {
        if (tipoMovimiento === 'entrada' && cantidad <= 0) {
            throw new manejo_errores_1.AppError(400, 'Una entrada requiere una cantidad positiva');
        }
        if ((tipoMovimiento === 'salida' || tipoMovimiento === 'perdida') && cantidad <= 0) {
            throw new manejo_errores_1.AppError(400, 'Una salida o pérdida requiere una cantidad positiva');
        }
        let delta = cantidad;
        if (tipoMovimiento === 'salida' || tipoMovimiento === 'perdida')
            delta = -cantidad;
        if (delta < 0) {
            const stock = await client.query(`SELECT cantidad FROM inventario_sucursal
         WHERE id_producto = $1 AND id_sucursal = $2`, [productoId, sucursalId]);
            const disponible = stock.rows[0]?.cantidad ?? 0;
            if (disponible + delta < 0) {
                throw new manejo_errores_1.AppError(409, `Stock insuficiente. Disponible: ${disponible}, requerido: ${-delta}`);
            }
        }
        await client.query(`INSERT INTO movimientos_inventario (tipo_movimiento, cantidad, motivo, id_producto, id_sucursal, id_usuario)
       VALUES ($1, $2, $3, $4, $5, $6)`, [tipoMovimiento, delta, motivo, productoId, sucursalId, usuarioId]);
        await aplicarDeltaStock(client, productoId, sucursalId, delta);
    });
}
/**
 * Suma (o resta) un delta al stock de la sucursal sin duplicar el registro.
 */
async function aplicarDeltaStock(client, productoId, sucursalId, delta) {
    await client.query(`INSERT INTO inventario_sucursal (id_producto, id_sucursal, cantidad)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_producto, id_sucursal)
     DO UPDATE SET cantidad = inventario_sucursal.cantidad + EXCLUDED.cantidad`, [productoId, sucursalId, delta]);
}
//# sourceMappingURL=inventario.repository.js.map